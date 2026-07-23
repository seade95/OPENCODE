(function() {
  var FB_READY = false;
  var _fsUnsubscribe = null;
  var _tenantsUnsub = null;
  var _configUnsub = null;
  var _writeTimer = null;
  var _pendingWrite = false;
  var _initRetries = 0;

  function initFirebase() {
    if (typeof firebase === 'undefined') return false;
    if (FB_READY) return true;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      FB_READY = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function db() {
    return firebase.firestore();
  }

  function getSchoolDocId() {
    try { return localStorage.getItem('activeTenant') || 'default'; } catch (e) { return 'default'; }
  }

  function debounceWrite() {
    if (_writeTimer) clearTimeout(_writeTimer);
    _pendingWrite = true;
    _writeTimer = setTimeout(flushWrite, 500);
  }

  var _dataVersion = Date.now();

  function flushWrite() {
    _writeTimer = null;
    if (!_pendingWrite || !FB_READY) return;
    _pendingWrite = false;
    var schoolId = getSchoolDocId();
    var payload = {};
    try {
      if (typeof window.data !== 'undefined' && window.data) {
        var keys = Object.keys(window.data);
        for (var i = 0; i < keys.length; i++) {
          payload[keys[i]] = window.data[keys[i]];
        }
      } else {
        return;
      }
    } catch (e) { return; }
    _dataVersion = Date.now();
    payload._version = _dataVersion;
    try { localStorage.setItem('_dataVersion_' + schoolId, String(_dataVersion)); } catch(e) {}
    db().collection('schools').doc(schoolId).set(payload, { merge: true }).catch(function(err) {
      console.warn('Firestore write failed', err);
      if (typeof toast === 'function') toast('Sync failed — data saved locally', 'error');
    });
  }

  function subscribeSchoolData() {
    if (IS_ADMIN_PAGE || IS_SUPERADMIN_PAGE) return;
    if (_fsUnsubscribe) { _fsUnsubscribe(); _fsUnsubscribe = null; }
    var schoolId = getSchoolDocId();
    _fsUnsubscribe = db().collection('schools').doc(schoolId).onSnapshot(function(doc) {
      if (doc.exists) {
        var remote = doc.data();
        if (typeof window.data !== 'undefined' && window.data) {
          var localVer = 0;
          var remoteVer = remote._version || 0;
          try { localVer = parseInt(localStorage.getItem('_dataVersion_' + schoolId) || '0', 10); } catch(e) {}
          if (remoteVer <= localVer) return;
          var keys = Object.keys(remote);
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== 'id' && keys[i] !== '_version' && Array.isArray(remote[keys[i]])) {
              window.data[keys[i]] = remote[keys[i]];
            }
          }
          localStorage.setItem('_dataVersion_' + schoolId, String(remoteVer));
          if (typeof toast === 'function') toast('Data synced from cloud', 'info');
          if (typeof renderAll === 'function') renderAll();
        }
      }
    }, function(err) {
      console.warn('Firestore snapshot error', err);
    });
  }

  function subscribeTenants() {
    if (_tenantsUnsub) { _tenantsUnsub(); _tenantsUnsub = null; }
    _tenantsUnsub = db().collection('tenants').doc('list').onSnapshot(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data && data.tenants) {
          try { localStorage.setItem('eduverse_tenants', JSON.stringify(data.tenants)); } catch (e) {}
        }
      }
    }, function(err) {
      console.warn('Tenants snapshot error', err);
    });
  }

  function subscribePlatformConfig() {
    if (_configUnsub) { _configUnsub(); _configUnsub = null; }
    _configUnsub = db().collection('platform').doc('config').onSnapshot(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        try { localStorage.setItem('eduverse_platform_config', JSON.stringify(data)); } catch (e) {}
        if (typeof window._platformConfigCache !== 'undefined') {
          window._platformConfigCache = data;
        }
      }
    }, function(err) {
      console.warn('Platform config snapshot error', err);
    });
  }

  function retryInit() {
    if (_initRetries > 10) return;
    _initRetries++;
    setTimeout(function() {
      if (initFirebase()) {
        if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) subscribeSchoolData();
        subscribeTenants();
        subscribePlatformConfig();
      } else {
        retryInit();
      }
    }, 500);
  }

  var IS_ADMIN_PAGE = window.location.pathname.indexOf('admin.html') !== -1;
  var IS_SUPERADMIN_PAGE = window.location.pathname.indexOf('superadmin.html') !== -1;

  // Flush pending writes before page closes (regardless of Firebase ready state)
  window.addEventListener('beforeunload', function() { if (_pendingWrite) flushWrite(); });
  window.addEventListener('pagehide', function() { if (_pendingWrite) flushWrite(); });

  initFirebase();
  if (FB_READY) {
    if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) subscribeSchoolData();
    subscribeTenants();
    subscribePlatformConfig();
    // Flush pending writes before page closes
    window.addEventListener('beforeunload', function() { if (_pendingWrite) flushWrite(); });
    window.addEventListener('pagehide', function() { if (_pendingWrite) flushWrite(); });
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        var s = null;
        try { s = JSON.parse(localStorage.getItem('eduverse_session')); } catch(e) {}
        if (s && s.user && s.user.email) {
          toast('Session expired — please sign in again', 'warning');
          clearSession();
        }
      }
    });
  } else {
    retryInit();
  }

  var _origLoadData = window.loadData;
  if (typeof _origLoadData === 'function') {
    window.loadData = function() {
      var result = _origLoadData();
      // If result has no real data (empty/default), try the other key
      if (result && (!result.students || result.students.length === 0 || result.students[0] && result.students[0].id && result.students[0].id.indexOf('STU') === 0)) {
        try {
          var activeT = localStorage.getItem('activeTenant');
          var defaultRaw = localStorage.getItem('schoolData');
          var tenantRaw = activeT ? localStorage.getItem('schoolData_' + activeT) : null;
          var betterRaw = null;
          if (activeT && tenantRaw) betterRaw = tenantRaw;
          else if (defaultRaw) betterRaw = defaultRaw;
          if (betterRaw) {
            var better = JSON.parse(betterRaw);
            if (better && better.students && better.students.length > (result.students || []).length) {
              result = better;
            }
          }
        } catch(e) {}
      }
      return result;
    };
  }

  var _origSaveData = window.saveData;
  if (typeof _origSaveData === 'function') {
    window.saveData = function() {
      _origSaveData();
      _dataVersion = Date.now();
      try {
        var schoolId = getSchoolDocId();
        localStorage.setItem('_dataVersion_' + schoolId, String(_dataVersion));
        var activeT = localStorage.getItem('activeTenant');
        if (activeT && window.data) {
          localStorage.setItem('schoolData', JSON.stringify(window.data));
          localStorage.setItem('_dataVersion_schoolData', String(_dataVersion));
        }
      } catch(e) {}
      debounceWrite();
    };
  }

  var _origGetTenants = window.getTenants;
  if (typeof _origGetTenants === 'function') {
    window.getTenants = function() {
      return _origGetTenants();
    };
  }

  var _origSaveTenants = window.saveTenants;
  if (typeof _origSaveTenants === 'function') {
    window.saveTenants = function(t) {
      _origSaveTenants(t);
      if (FB_READY) {
        db().collection('tenants').doc('list').set({ tenants: t }, { merge: true }).catch(function(err) {
          console.warn('Firestore tenants save failed', err);
        });
      }
    };
  }

  var _origGetPlatformConfig = window.getPlatformConfig;
  if (typeof _origGetPlatformConfig === 'function') {
    window.getPlatformConfig = function() {
      return _origGetPlatformConfig();
    };
  }

  var _origSavePlatformConfig = window.savePlatformConfig;
  if (typeof _origSavePlatformConfig === 'function') {
    window.savePlatformConfig = function(cfg) {
      _origSavePlatformConfig(cfg);
      if (FB_READY) {
        db().collection('platform').doc('config').set(cfg, { merge: true }).catch(function(err) {
          console.warn('Firestore config save failed', err);
        });
      }
    };
  }

  var _origGetApplications = window.getApplications;
  if (typeof _origGetApplications === 'function') {
    window.getApplications = function() {
      return _origGetApplications();
    };
  }

  var _origSaveApplications = window.saveApplications;
  if (typeof _origSaveApplications === 'function') {
    window.saveApplications = function(apps) {
      _origSaveApplications(apps);
      if (FB_READY) {
        db().collection('tenants').doc('list').set({ applications: apps }, { merge: true }).catch(function(err) {
          console.warn('Firestore applications save failed', err);
        });
      }
    };
  }

  var _origGetSuperAdmin = window.getSuperAdmin;
  if (typeof _origGetSuperAdmin === 'function') {
    window.getSuperAdmin = function() {
      return _origGetSuperAdmin();
    };
  }

  var _origSaveSuperAdmin = window.saveSuperAdmin;
  if (typeof _origSaveSuperAdmin === 'function') {
    window.saveSuperAdmin = function(admin) {
      _origSaveSuperAdmin(admin);
      if (FB_READY) {
        db().collection('superAdmin').doc('config').set(admin, { merge: true }).catch(function(err) {
          console.warn('Firestore super admin save failed', err);
        });
      }
    };
  }

  window.forceFirestoreSync = function() {
    flushWrite();
  };

  window.getFirestoreStatus = function() {
    return { ready: FB_READY, pendingWrite: _pendingWrite };
  };

  window.firebaseSignUp = function(email, password, name, role, schoolId, userId) {
    if (!FB_READY) return Promise.reject(new Error('Firebase not ready'));
    return firebase.auth().createUserWithEmailAndPassword(email, password).then(function(cred) {
      return db().collection('users').doc(cred.user.uid).set({
        email: email,
        role: role,
        schoolId: schoolId || 'default',
        name: name,
        id: userId || '',
        displayName: name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        return cred.user;
      });
    });
  };

  window.firebaseSignIn = function(email, password) {
    if (!FB_READY) return Promise.reject(new Error('Firebase not ready'));
    return firebase.auth().signInWithEmailAndPassword(email, password);
  };

  window.firebaseSignOut = function() {
    if (!FB_READY) return Promise.resolve();
    return firebase.auth().signOut();
  };

  window.firebaseGetUserProfile = function(uid) {
    if (!FB_READY) return Promise.resolve(null);
    return db().collection('users').doc(uid).get().then(function(doc) {
      return doc.exists ? doc.data() : null;
    });
  };

  window.firebaseCreateUserDocument = function(uid, data) {
    if (!FB_READY) return Promise.resolve(null);
    return db().collection('users').doc(uid).set(data, { merge: true });
  };

  window.firebaseOnAuthChange = function(callback) {
    if (!FB_READY) return function() {};
    return firebase.auth().onAuthStateChanged(callback);
  };

  window.subscribeSchoolData = subscribeSchoolData;
  window.subscribeTenants = subscribeTenants;
  window.subscribePlatformConfig = subscribePlatformConfig;

  window.migrateLocalStorageToFirestore = function() {
    if (!FB_READY) {
      if (typeof toast === 'function') toast('Firebase not ready yet', 'error');
      return Promise.reject(new Error('Firebase not ready'));
    }
    var batch = {};
    var count = 0;

    try {
      var raw = localStorage.getItem('schoolData');
      if (raw) { batch['schools/default'] = JSON.parse(raw); count++; }
    } catch(e) {}

    try {
      var raw = localStorage.getItem('eduverse_data');
      if (raw && !batch['schools/default']) { batch['schools/default'] = JSON.parse(raw); count++; }
    } catch(e) {}

    try {
      var tenantsRaw = localStorage.getItem('eduverse_tenants');
      if (tenantsRaw) {
        var tenantsList = JSON.parse(tenantsRaw);
        batch['tenants/list'] = { tenants: tenantsList };
        count++;
        for (var i = 0; i < tenantsList.length; i++) {
          var t = tenantsList[i];
          try {
            var schoolRaw = localStorage.getItem('schoolData_' + t.id);
            if (schoolRaw) {
              batch['schools/' + t.id] = JSON.parse(schoolRaw);
              count++;
            }
          } catch(e) {}
        }
      }
    } catch(e) {}

    try {
      var configRaw = localStorage.getItem('eduverse_platform_config');
      if (configRaw) {
        batch['platform/config'] = JSON.parse(configRaw);
        count++;
      }
    } catch(e) {}

    try {
      var appsRaw = localStorage.getItem('eduverse_school_applications');
      if (appsRaw) {
        if (!batch['tenants/list']) batch['tenants/list'] = {};
        batch['tenants/list'].applications = JSON.parse(appsRaw);
      }
    } catch(e) {}

    try {
      var saRaw = localStorage.getItem('eduverse_super_admin');
      if (saRaw) {
        batch['superAdmin/config'] = JSON.parse(saRaw);
        count++;
      }
    } catch(e) {}

    var promises = Object.keys(batch).map(function(key) {
      var parts = key.split('/');
      return db().collection(parts[0]).doc(parts[1]).set(batch[key], { merge: true });
    });

    return Promise.all(promises).then(function() {
      if (typeof toast === 'function') toast('Migrated ' + count + ' documents to Firestore', 'success');
      return count;
    }).catch(function(err) {
      if (typeof toast === 'function') toast('Migration failed: ' + err.message, 'error');
      throw err;
    });
  };

  window.getCurrentUserRole = function() {
    try {
      var raw = localStorage.getItem('eduverse_session');
      if (raw) {
        var s = JSON.parse(raw);
        return s && s.type ? s.type : null;
      }
    } catch(e) {}
    return null;
  };

  window.tryFirebaseProvision = function(email, password, name, role, schoolId, userId) {
    if (!FB_READY || !email || !password) return;
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(cred) {
      return db().collection('users').doc(cred.user.uid).set({
        email: email,
        role: role || 'student',
        schoolId: schoolId || getSchoolDocId(),
        name: name || email,
        id: userId || email,
        displayName: name || email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }).catch(function(err) {
      if (err.code !== 'email-already-in-use') {
        console.warn('Firebase provision failed for', email, err);
      }
    });
  };
})();
