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

  // ===== Cloud write gating =====
  // Anonymous homepage visitors never push to Firestore: their data
  // lives in localStorage only. Writes are attempted only when a
  // user is signed in (staff/admin), queued only when a local
  // session exists (so it can flush once auth restores), and
  // NEVER queued on permission-denied (a 403 would poison the
  // queue forever, retrying an illegal write on every sync).
  function hasLocalSession() {
    try { return !!localStorage.getItem('eduverse_session'); } catch (e) { return false; }
  }

  function canPushToCloud() {
    if (!FB_READY || !navigator.onLine) return false;
    try { return !!firebase.auth().currentUser; } catch (e) { return false; }
  }

  function isPermissionDenied(err) {
    return !!err && (err.code === 'permission-denied' || err.code === 7);
  }

  function pushOrQueue(collection, docId, payload) {
    if (canPushToCloud()) {
      db().collection(collection).doc(docId).set(payload, { merge: true }).then(function() {
        syncOfflineQueue();
      }).catch(function(err) {
        if (isPermissionDenied(err)) {
          console.warn('Firestore write forbidden for ' + collection + '/' + docId + ' — dropped', err);
          return;
        }
        console.warn('Firestore write failed, queuing for retry', err);
        enqueueWrite('set', collection, docId, payload);
      });
      return;
    }
    // Not pushed: queue only if someone is logged in on this device
    // (auth may still be restoring); pure anonymous saves stay local.
    if (hasLocalSession()) enqueueWrite('set', collection, docId, payload);
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
    var schoolId = resolveDocId(getSchoolDocId());
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
      if (hasLocalSession()) enqueueWrite('set', 'schools', schoolId, payload);
      return;
    }

    // Full staff document — only signed-in staff of this school may
    // write it (rules enforce). Anonymous saves stay localStorage-only.
    if (canPushToCloud()) {
      db().collection('schools').doc(schoolId).set(payload, { merge: true }).then(function() {
        syncOfflineQueue();
      }).catch(function(err) {
        if (isPermissionDenied(err)) {
          console.warn('Firestore schools write forbidden — dropped', err);
        } else {
          console.warn('Firestore write failed, queuing for retry', err);
          enqueueWrite('set', 'schools', schoolId, payload);
        }
      });
      // Public projection for the anonymous landing page — same
      // write gate: rules allow staff/super-admin only.
      if (typeof buildPublicSchoolDoc === 'function') {
        db().collection('schoolsPublic').doc(schoolId).set(buildPublicSchoolDoc(payload, _dataVersion), { merge: true })
          .catch(function(err) { console.warn('schoolsPublic projection write failed', err.code || ''); });
      }
    } else if (hasLocalSession()) {
      enqueueWrite('set', 'schools', schoolId, payload);
    }
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
        if (isPermissionDenied(err)) {
          var signedIn = false;
          try { signedIn = !!firebase.auth().currentUser; } catch (e) {}
          if (!signedIn && hasLocalSession()) {
            // Auth may still be restoring on page load — hold the item
            // and wait for the auth-change listener to resume the sync
            // (dropping it here would lose a legitimate write).
            console.warn('Offline queue paused — sign-in required to sync');
            _syncing = false;
            updateOfflineBadge();
            return;
          }
          // Signed in and still forbidden (genuinely not allowed for
          // this user), or no local session (legacy anonymous write
          // that can never legally succeed): drop it and continue so
          // one poisoned item doesn't block the whole queue.
          console.warn('Dropping forbidden offline queue item', item.id, item.collection + '/' + item.docId);
          queue.splice(processed, 1);
          saveOfflineQueue(queue);
          total = queue.length;
          processNext();
          return;
        }
        // Transient failure: stop this pass but keep the queue
        // intact (processed < total so nothing is cleared); the
        // remaining items retry on the next sync pass.
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
  var _defaultSubRetries = 0;
  var MAX_DEFAULT_SUB_RETRIES = 50; // 10s — then stop (no timer leak on plain homepage)
  var _tenantSwitchAttempted = false;

  function hasFirebaseUser() {
    try { return !!(FB_READY && firebase.auth().currentUser); } catch (e) { return false; }
  }

  // If activeTenant holds a slug (unresolved ?school= on a fresh
  // device), map it to the real tenant ID once tenants are known.
  function resolveDocId(raw) {
    if (!raw || raw === 'default') return raw;
    try {
      if (typeof getTenants === 'function') {
        var tenants = getTenants();
        for (var i = 0; i < tenants.length; i++) {
          if (tenants[i].slug === raw) return tenants[i].id;
        }
      }
    } catch (e) {}
    return raw;
  }

  function rerenderAfterSync() {
    try {
      if (typeof renderLandingPageSections === 'function') renderLandingPageSections();
    } catch (e) {}
    try {
      if (typeof renderActivePanel === 'function') renderActivePanel();
    } catch (e) {}
    try {
      var gs = document.getElementById('gallerySection');
      if (gs && window.data && window.data.gallery && window.data.gallery.length) gs.style.display = '';
      if (typeof renderGalleryView === 'function') renderGalleryView('landingGalleryView');
    } catch (e) {}
  }

  // Persist merged remote data directly (bypasses save hooks so a
  // cloud snapshot never triggers a cloud write-back loop).
  function persistMergedData() {
    try {
      var key = (typeof getDataKey === 'function') ? getDataKey() : 'schoolData';
      var serialized = JSON.stringify(window.data);
      localStorage.setItem(key, serialized);
      if (localStorage.getItem('activeTenant')) localStorage.setItem('schoolData', serialized);
    } catch (e) {}
  }

  function applyRemoteDoc(remote, schoolId, isPublic) {
    var apply = function() {
      if (typeof window.data === 'undefined' || !window.data) return false; // not loaded yet
      if (resolveDocId(getSchoolDocId()) !== schoolId) return true; // stale — drop
      var localVer = 0;
      var remoteVer = remote._version || 0;
      try { localVer = parseInt(localStorage.getItem('_dataVersion_' + schoolId) || '0', 10) || 0; } catch (e) {}
      if (remoteVer <= localVer) return true;
      var keys = Object.keys(remote);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k === 'id' || k === '_version') continue;
        // Public docs carry only landing-page fields — merge them all;
        // full staff docs merge arrays only (existing behavior).
        if (isPublic || Array.isArray(remote[k])) window.data[k] = remote[k];
      }
      try { localStorage.setItem('_dataVersion_' + schoolId, String(remoteVer)); } catch (e) {}
      persistMergedData();
      if (typeof toast === 'function') toast('Data synced from cloud', 'info');
      rerenderAfterSync();
      return true;
    };
    if (!apply()) {
      // window.data is set by app.js on DOMContentLoaded — bounded wait
      var tries = 0;
      var timer = setInterval(function() {
        tries++;
        if (apply() || tries >= 50) clearInterval(timer);
      }, 100);
    }
  }

  function attachSchoolSnapshot(schoolId, usePublic) {
    var collection = usePublic ? 'schoolsPublic' : 'schools';
    _subscribedSchool = schoolId;
    try {
      _fsUnsubscribe = db().collection(collection).doc(schoolId).onSnapshot(function(doc) {
        if (doc.exists) {
          // Verify tenant hasn't changed since we subscribed
          if (resolveDocId(getSchoolDocId()) !== schoolId) return;
          applyRemoteDoc(doc.data(), schoolId, usePublic);
        }
      }, function(err) {
        console.warn(collection + ' snapshot error', err);
        if (!usePublic && isPermissionDenied(err)) {
          // Anonymous or non-staff reader — fall back to the public
          // landing-page projection instead of failing silently.
          if (_fsUnsubscribe) { try { _fsUnsubscribe(); } catch (e) {} _fsUnsubscribe = null; }
          attachSchoolSnapshot(schoolId, true);
        }
      });
    } catch (e) {}
  }

  function subscribeSchoolData() {
    if (IS_ADMIN_PAGE || IS_SUPERADMIN_PAGE) return;
    if (!FB_READY || !navigator.onLine) return;
    var rawId = getSchoolDocId();
    if (!rawId || rawId === 'default') {
      // No active tenant yet — wait briefly for tenant resolution,
      // but stop after MAX retries so the plain homepage doesn't
      // leak a timer forever.
      if (_defaultSubRetries < MAX_DEFAULT_SUB_RETRIES) {
        _defaultSubRetries++;
        setTimeout(subscribeSchoolData, 200);
      }
      return;
    }
    _defaultSubRetries = 0;
    var schoolId = resolveDocId(rawId);
    if (_subscribedSchool === schoolId) return;
    if (_fsUnsubscribe) { _fsUnsubscribe(); _fsUnsubscribe = null; }
    attachSchoolSnapshot(schoolId, !hasFirebaseUser());
  }

  // Once tenants arrive from the cloud, re-resolve ?school=/#/school/
  // against the now-complete directory and switch if it maps to a
  // different tenant (fresh device initially only knows the slug).
  function reResolveTenantFromUrl() {
    if (_tenantSwitchAttempted) return;
    try {
      if (localStorage.getItem('_eduverse_go_home') === '1') return;
      if (typeof resolveSchoolFromUrl !== 'function' || typeof switchTenant !== 'function') return;
      var resolved = resolveSchoolFromUrl();
      if (resolved && resolved !== getSchoolDocId()) {
        _tenantSwitchAttempted = true;
        switchTenant(resolved); // reloads the page
      }
    } catch (e) {}
  }

  function subscribeTenants() {
    if (!FB_READY || !navigator.onLine) return;
    if (_tenantsUnsub) { _tenantsUnsub(); _tenantsUnsub = null; }
    try {
      _tenantsUnsub = db().collection('tenants').doc('list').onSnapshot(function(doc) {
        if (doc.exists) {
          var payload = doc.data();
          if (payload && Array.isArray(payload.tenants)) {
            try { localStorage.setItem('eduverse_tenants', JSON.stringify(payload.tenants)); } catch (e) {}
            if (typeof invalidateTenantCache === 'function') invalidateTenantCache();
            reResolveTenantFromUrl();
            // activeTenant may have been an unresolved slug — now that
            // the directory is local, re-target the school subscription.
            subscribeSchoolData();
            if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) rerenderAfterSync();
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
        // Auth-only doc: anonymous homepage falls back to defaults —
        // expected, not an error worth spamming.
        if (isPermissionDenied(err)) {
          console.info('Platform config unavailable while signed out — using defaults');
        } else {
          console.warn('Platform config snapshot error', err);
        }
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
      // tenants/list is world-readable — never push credentials.
      var safe = (typeof sanitizeTenantsForCloud === 'function')
        ? sanitizeTenantsForCloud(t)
        : t;
      pushOrQueue('tenants', 'list', { tenants: safe });
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
      pushOrQueue('platform', 'config', cfg);
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
      // Applications live in their own super-admin-only doc (they
      // used to ride inside tenants/list, which is now public).
      // Public/anonymous submissions stay device-local — pushOrQueue
      // only queues when a signed-in session exists.
      pushOrQueue('applications', 'list', { applications: apps });
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
      var safe = {};
      for (var k in admin) { if (admin.hasOwnProperty(k) && k !== 'password') safe[k] = admin[k]; }
      if (canPushToCloud()) {
        // Explicitly delete any previously-leaked password field.
        try { safe.password = firebase.firestore.FieldValue.delete(); } catch (e) {}
        db().collection('superAdmin').doc('config').set(safe, { merge: true }).then(function() {
          syncOfflineQueue();
        }).catch(function(err) {
          if (isPermissionDenied(err)) {
            console.warn('superAdmin/config write forbidden — dropped', err);
          } else {
            console.warn('Firestore super admin save failed', err);
            var queued = {};
            for (var kq in safe) { if (kq !== 'password') queued[kq] = safe[kq]; }
            enqueueWrite('set', 'superAdmin', 'config', queued);
          }
        });
      } else if (hasLocalSession()) {
        enqueueWrite('set', 'superAdmin', 'config', safe);
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

  // Registered AFTER firebaseOnAuthChange is assigned: sign-in can
  // change Firestore visibility (anonymous → staff), so resubscribe
  // and flush any queued writes on every auth state change.
  if (FB_READY) {
    var _lastAuthUid = null;
    try {
      firebase.auth().onAuthStateChanged(function(user) {
        var uid = user ? user.uid : null;
        if (uid === _lastAuthUid) return;
        _lastAuthUid = uid;
        if (!IS_ADMIN_PAGE && !IS_SUPERADMIN_PAGE) {
          // Reset so the subscription re-picks public vs staff doc.
          _subscribedSchool = null;
          if (_fsUnsubscribe) { try { _fsUnsubscribe(); } catch (e) {} _fsUnsubscribe = null; }
          subscribeSchoolData();
        }
        // platform/config is auth-only: anonymous sign-in changes its
        // visibility, so re-attach (previous listener died on 403).
        subscribePlatformConfig();
        if (uid) syncOfflineQueue();
      });
    } catch (e) {}
  }

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
        // tenants/list is world-readable — push the sanitized copy.
        batch['tenants/list'] = {
          tenants: (typeof sanitizeTenantsForCloud === 'function')
            ? sanitizeTenantsForCloud(tenantsList)
            : tenantsList
        };
        count++;
        for (var i = 0; i < tenantsList.length; i++) {
          var t = tenantsList[i];
          try {
            var schoolRaw = localStorage.getItem('schoolData_' + t.id);
            if (schoolRaw) {
              var schoolObj = JSON.parse(schoolRaw);
              batch['schools/' + t.id] = schoolObj;
              if (typeof buildPublicSchoolDoc === 'function') {
                batch['schoolsPublic/' + t.id] = buildPublicSchoolDoc(schoolObj);
              }
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
        batch['applications/list'] = { applications: JSON.parse(appsRaw) };
      }
    } catch(e) {}

    try {
      var saRaw = localStorage.getItem('eduverse_super_admin');
      if (saRaw) {
        var saObj = JSON.parse(saRaw);
        delete saObj.password;
        batch['superAdmin/config'] = saObj;
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
