(function() {
  var FB_READY = false;
  var _fsUnsubscribe = null;
  var _tenantsUnsub = null;
  var _configUnsub = null;
  var _writeTimer = null;
  var _pendingWrite = false;
  var _initRetries = 0;
  var OFFLINE_QUEUE_KEY = 'eduverse_offline_queue';
  var _syncing = false;

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

  // ===== Offline Write Queue =====
  function getOfflineQueue() {
    try {
      var raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveOfflineQueue(queue) {
    try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)); } catch (e) {}
  }

  function enqueueWrite(type, collection, docId, data) {
    var queue = getOfflineQueue();
    queue.push({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: type,
      collection: collection,
      docId: docId,
      data: data,
      timestamp: Date.now()
    });
    saveOfflineQueue(queue);
    updateOfflineBadge();
  }

  // ===== Flush Pending Writes =====
  function debounceWrite() {
    if (_writeTimer) clearTimeout(_writeTimer);
    _pendingWrite = true;
    _writeTimer = setTimeout(flushWrite, 500);
  }

  var _dataVersion = Date.now();

  function flushWrite() {
    _writeTimer = null;
    if (!_pendingWrite) return;
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

    if (!FB_READY || !navigator.onLine) {
      enqueueWrite('set', 'schools', schoolId, payload);
      return;
    }

    db().collection('schools').doc(schoolId).set(payload, { merge: true }).then(function() {
      syncOfflineQueue();
    }).catch(function(err) {
      console.warn('Firestore write failed, queuing for retry', err);
      enqueueWrite('set', 'schools', schoolId, payload);
    });
  }

  // ===== Offline Queue Sync =====
  function syncOfflineQueue() {
    if (_syncing || !FB_READY || !navigator.onLine) return;
    var queue = getOfflineQueue();
    if (queue.length === 0) { updateOfflineBadge(); return; }
    _syncing = true;
    var processed = 0;
    var total = queue.length;

    function processNext() {
      if (processed >= total || !navigator.onLine) {
        _syncing = false;
        if (processed >= total) {
          saveOfflineQueue([]);
          if (typeof toast === 'function' && processed > 0) toast('Offline changes synced to cloud', 'success');
        }
        updateOfflineBadge();
        return;
      }
      var item = queue[processed];
      var ref = db().collection(item.collection).doc(item.docId);
      var op = item.type === 'set' ? ref.set(item.data, { merge: true }) : ref.update(item.data);
      op.then(function() {
        processed++;
        processNext();
      }).catch(function(err) {
        console.warn('Offline queue sync failed for item', item.id, err);
        _syncing = false;
        updateOfflineBadge();
      });
    }
    processNext();
  }

  // ===== Online/Offline Detection =====
  function updateOfflineBadge() {
    var queue = getOfflineQueue();
    var badge = document.getElementById('offlineBadge');
    if (queue.length > 0 || !navigator.onLine) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'offlineBadge';
        badge.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:Inter,system-ui,sans-serif;cursor:pointer;transition:opacity .3s;';
        badge.onclick = function() { if (navigator.onLine) syncOfflineQueue(); };
        document.body.appendChild(badge);
      }
      var pending = queue.length;
      if (!navigator.onLine) {
        badge.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg> Offline';
        if (pending > 0) badge.innerHTML += ' (' + pending + ' pending)';
      } else {
        badge.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0-10 10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg> Syncing...';
        syncOfflineQueue();
      }
      badge.style.display = 'flex';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  window.addEventListener('online', function() {
    updateOfflineBadge();
    syncOfflineQueue();
    if (FB_READY) {
      if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) subscribeSchoolData();
      subscribeTenants();
      subscribePlatformConfig();
    }
  });

  window.addEventListener('offline', function() {
    updateOfflineBadge();
  });

  // ===== Realtime Subscriptions =====
  var _subscribedSchool = null;

  function subscribeSchoolData() {
    if (IS_ADMIN_PAGE || IS_SUPERADMIN_PAGE) return;
    if (!FB_READY || !navigator.onLine) return;
    var schoolId = getSchoolDocId();
    if (!schoolId || schoolId === 'default') {
      setTimeout(subscribeSchoolData, 200);
      return;
    }
    if (_subscribedSchool === schoolId) return;
    if (_fsUnsubscribe) { _fsUnsubscribe(); _fsUnsubscribe = null; }
    _subscribedSchool = schoolId;
    try {
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
            if (typeof renderActivePanel === 'function') renderActivePanel();
          }
        }
      }, function(err) {
        console.warn('Firestore snapshot error', err);
      });
    } catch(e) {}
  }

  function subscribeTenants() {
    if (!FB_READY || !navigator.onLine) return;
    if (_tenantsUnsub) { _tenantsUnsub(); _tenantsUnsub = null; }
    try {
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
    } catch(e) {}
  }

  function subscribePlatformConfig() {
    if (!FB_READY || !navigator.onLine) return;
    if (_configUnsub) { _configUnsub(); _configUnsub = null; }
    try {
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
    } catch(e) {}
  }

  function retryInit() {
    if (_initRetries > 10) return;
    _initRetries++;
    setTimeout(function() {
      if (initFirebase()) {
        if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) subscribeSchoolData();
        subscribeTenants();
        subscribePlatformConfig();
        syncOfflineQueue();
      } else {
        retryInit();
      }
    }, 500);
  }

  var IS_ADMIN_PAGE = window.location.pathname.indexOf('admin.html') !== -1;
  var IS_SUPERADMIN_PAGE = window.location.pathname.indexOf('superadmin.html') !== -1;

  // Flush pending writes before page closes
  window.addEventListener('beforeunload', function() { if (_pendingWrite) flushWrite(); });
  window.addEventListener('pagehide', function() { if (_pendingWrite) flushWrite(); });

  initFirebase();
  if (FB_READY) {
    if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) subscribeSchoolData();
    subscribeTenants();
    subscribePlatformConfig();
    syncOfflineQueue();
  } else {
    retryInit();
  }

  // Update badge on load
  setTimeout(updateOfflineBadge, 1000);

  var _origLoadData = window.loadData;
  if (typeof _origLoadData === 'function') {
    window.loadData = function() {
      var result = _origLoadData();
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

  // Hook into saveData for Firestore sync
  if (window.dataHooks) {
    window.dataHooks.addSaveHook(function() {
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
    });
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
      if (FB_READY && navigator.onLine) {
        db().collection('tenants').doc('list').set({ tenants: t }, { merge: true }).catch(function(err) {
          console.warn('Firestore tenants save failed', err);
          enqueueWrite('set', 'tenants', 'list', { tenants: t });
        });
      } else {
        enqueueWrite('set', 'tenants', 'list', { tenants: t });
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
      if (FB_READY && navigator.onLine) {
        db().collection('platform').doc('config').set(cfg, { merge: true }).catch(function(err) {
          console.warn('Firestore config save failed', err);
          enqueueWrite('set', 'platform', 'config', cfg);
        });
      } else {
        enqueueWrite('set', 'platform', 'config', cfg);
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
      if (FB_READY && navigator.onLine) {
        db().collection('tenants').doc('list').set({ applications: apps }, { merge: true }).catch(function(err) {
          console.warn('Firestore applications save failed', err);
          enqueueWrite('set', 'tenants', 'list', { applications: apps });
        });
      } else {
        enqueueWrite('set', 'tenants', 'list', { applications: apps });
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
      if (FB_READY && navigator.onLine) {
        var safe = {};
        for (var k in admin) { if (admin.hasOwnProperty(k) && k !== 'password') safe[k] = admin[k]; }
        db().collection('superAdmin').doc('config').set(safe, { merge: true }).catch(function(err) {
          console.warn('Firestore super admin save failed', err);
          enqueueWrite('set', 'superAdmin', 'config', safe);
        });
      } else {
        var safe2 = {};
        for (var k2 in admin) { if (admin.hasOwnProperty(k2) && k2 !== 'password') safe2[k2] = admin[k2]; }
        enqueueWrite('set', 'superAdmin', 'config', safe2);
      }
    };
  }

  window.forceFirestoreSync = function() {
    flushWrite();
    syncOfflineQueue();
  };

  window.getFirestoreStatus = function() {
    return {
      ready: FB_READY,
      online: navigator.onLine,
      pendingWrite: _pendingWrite,
      offlineQueueSize: getOfflineQueue().length,
      syncing: _syncing
    };
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

  window.ensureFirebaseUser = function(email, password, name, role, schoolId, userId) {
    if (!FB_READY) return Promise.reject(new Error('Firebase not ready'));
    var docData = {
      email: email,
      role: role || 'admin',
      schoolId: schoolId || 'default',
      name: name || email,
      id: userId || email,
      displayName: name || email
    };
    return firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(cred) {
        window._firebaseAuthDesynced = false;
        return window.firebaseCreateUserDocument(cred.user.uid, docData).then(function() { return cred.user; });
      })
      .catch(function(err) {
        if (err.code === 'auth/user-not-found') {
          return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(cred) {
              window._firebaseAuthDesynced = false;
              docData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
              return window.firebaseCreateUserDocument(cred.user.uid, docData).then(function() { return cred.user; });
            });
        }
        window._firebaseAuthDesynced = true;
        console.error('[FirebaseAuth] ensureFirebaseUser failed for', email, 'role=' + (role || '?'), 'code=' + err.code, err.message);
        throw err;
      });
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
      var raw2 = localStorage.getItem('eduverse_data');
      if (raw2 && !batch['schools/default']) { batch['schools/default'] = JSON.parse(raw2); count++; }
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

  window.getOfflineQueueSize = function() {
    return getOfflineQueue().length;
  };
})();
