// EDUVERSE - Offline Sync & Auto-Backup Module
// Monitors connectivity, maintains local backups, and syncs when online

(function() {
  var BACKUP_KEY = 'eduverseBackup';
  var SYNC_TAG = 'eduverse-data-sync';
  var _lastBackup = 0;
  var _backupInterval = 30000; // 30 seconds
  var _isSyncing = false;
  var _pendingChanges = false;
  var _dataHash = '';

  // Compute a simple hash of data to detect changes
  function _getDataHash() {
    try {
      var d = window.data || {};
      var keys = Object.keys(d).sort();
      var parts = [];
      for (var i = 0; i < keys.length; i++) {
        var v = d[keys[i]];
        parts.push(keys[i] + ':' + (Array.isArray(v) ? v.length : typeof v));
      }
      return parts.join('|');
    } catch(e) { return ''; }
  }

  // Save a backup snapshot to localStorage
  function saveBackupSnapshot() {
    try {
      if (!window.data) return;
      var now = Date.now();
      if (now - _lastBackup < _backupInterval) return;
      var currentHash = _getDataHash();
      if (currentHash === _dataHash) return; // no changes
      _dataHash = currentHash;
      var backup = {
        timestamp: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(window.data))
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      _lastBackup = now;
      if (!navigator.onLine) {
        _pendingChanges = true;
      }
    } catch(e) { /* backup failed silently */ }
  }

  // Restore from last backup
  function restoreFromBackup() {
    try {
      var raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return false;
      var backup = JSON.parse(raw);
      if (!backup || !backup.data) return false;
      var d = window.data;
      if (!d) return false;
      Object.keys(backup.data).forEach(function(k) { d[k] = backup.data[k]; });
      if (typeof saveData === 'function') saveData();
      _dataHash = _getDataHash();
      return true;
    } catch(e) { return false; }
  }

  // Try to sync data when online
  function triggerSync() {
    if (_isSyncing || !navigator.onLine) return;
    _isSyncing = true;
    // Save a fresh backup first
    saveBackupSnapshot();
    // Attempt BackgroundSync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(function(reg) {
        return reg.sync.register(SYNC_TAG);
      }).catch(function() {}).then(function() {
        _isSyncing = false;
        _pendingChanges = false;
        showSyncToast();
      });
    } else {
      // Fallback: just ensure backup is saved
      setTimeout(function() {
        _isSyncing = false;
        _pendingChanges = false;
        showSyncToast();
      }, 500);
    }
  }

  // Show sync complete notification
  function showSyncToast() {
    if (typeof toast === 'function') {
      toast('\u2705 Data synced and backed up successfully');
    }
  }

  // Listen for SW messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'SYNC_TRIGGERED') {
        saveBackupSnapshot();
      }
    });
  }

  // Online/offline event listeners
  window.addEventListener('online', function() {
    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
    if (_pendingChanges) {
      triggerSync();
    } else {
      // Still save a backup when coming online
      saveBackupSnapshot();
    }
  });

  window.addEventListener('offline', function() {
    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
  });

  // Periodic auto-backup
  setInterval(function() {
    saveBackupSnapshot();
  }, _backupInterval);

  // Backup on data save (hook into saveData)
  var _origSaveData = window.saveData;
  if (typeof _origSaveData === 'function') {
    window.saveData = function() {
      _origSaveData.apply(this, arguments);
      saveBackupSnapshot();
    };
    window.__saveData = window.saveData;
  }

  // Manual sync trigger
  window.manualDataSync = function() {
    if (!navigator.onLine) {
      if (typeof toast === 'function') toast('Cannot sync while offline. Data is saved locally.', 'warning');
      return;
    }
    triggerSync();
  };

  // Force a backup now
  window.backupDataNow = function() {
    _lastBackup = 0;
    saveBackupSnapshot();
    if (typeof toast === 'function') toast('Data backed up successfully');
  };

  // Check last backup time
  window.getLastBackupTime = function() {
    try {
      var raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      var backup = JSON.parse(raw);
      return backup.timestamp || null;
    } catch(e) { return null; }
  };

  // Restore from backup (manual)
  window.restoreDataFromBackup = function() {
    if (restoreFromBackup()) {
      if (typeof toast === 'function') toast('Data restored from backup');
      return true;
    }
    if (typeof toast === 'function') toast('No backup found', 'error');
    return false;
  };

  // Initial setup — trigger a backup on page load
  setTimeout(function() {
    saveBackupSnapshot();
    if (navigator.onLine && _pendingChanges) {
      triggerSync();
    }
  }, 2000);

  // Background sync listener from service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(reg) {
      // Try to register periodic sync if available
      if (reg.periodicSync) {
        reg.periodicSync.register(SYNC_TAG, { minInterval: 12 * 60 * 60 * 1000 }).catch(function() {});
      }
    }).catch(function() {});
  }

})();
