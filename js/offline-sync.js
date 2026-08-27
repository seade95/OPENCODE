// EDUVERSE - Offline Sync & Auto-Backup Module
// Monitors connectivity, maintains local backups, and syncs when online

(function() {
  var BACKUP_KEY = 'eduverseBackup';
  var SYNC_TAG = 'eduverse-data-sync';
  var _lastBackup = 0;
  var _backupInterval = 30000; // 30 seconds
  var _isSyncing = false;
  var _pendingChanges = false;
  var _backupTimer = null;
  var _dataHash = '';

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

  function saveBackupSnapshot() {
    try {
      if (!window.data) return;
      var now = Date.now();
      if (now - _lastBackup < _backupInterval) return;
      var currentHash = _getDataHash();
      if (currentHash === _dataHash) return;
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
    } catch(e) { }
  }

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

  function triggerSync() {
    if (_isSyncing || !navigator.onLine) return;
    _isSyncing = true;
    saveBackupSnapshot();
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(function(reg) {
        return reg.sync.register(SYNC_TAG);
      }).catch(function() {}).then(function() {
        _isSyncing = false;
        _pendingChanges = false;
        showSyncToast();
      });
    } else {
      setTimeout(function() {
        _isSyncing = false;
        _pendingChanges = false;
        showSyncToast();
      }, 500);
    }
  }

  function showSyncToast() {
    if (typeof toast === 'function') {
      toast('\u2705 Data synced and backed up successfully');
    }
  }

  // Hook into saveData via the hook system
  if (window.dataHooks) {
    window.dataHooks.addSaveHook(function() {
      saveBackupSnapshot();
    });
  }

  // Listen for SW messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'SYNC_TRIGGERED') {
        saveBackupSnapshot();
      }
    });
  }

  window.addEventListener('online', function() {
    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
    if (_pendingChanges) {
      triggerSync();
    } else {
      saveBackupSnapshot();
    }
  });

  window.addEventListener('offline', function() {
    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
  });

  _backupTimer = setInterval(function() {
    saveBackupSnapshot();
  }, _backupInterval);

  window.manualDataSync = function() {
    if (!navigator.onLine) {
      if (typeof toast === 'function') toast('Cannot sync while offline. Data is saved locally.', 'warning');
      return;
    }
    triggerSync();
  };

  window.backupDataNow = function() {
    _lastBackup = 0;
    saveBackupSnapshot();
    if (typeof toast === 'function') toast('Data backed up successfully');
  };

  window.getLastBackupTime = function() {
    try {
      var raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      var backup = JSON.parse(raw);
      return backup.timestamp || null;
    } catch(e) { return null; }
  };

  window.restoreDataFromBackup = function() {
    if (restoreFromBackup()) {
      if (typeof toast === 'function') toast('Data restored from backup');
      return true;
    }
    if (typeof toast === 'function') toast('No backup found', 'error');
    return false;
  };

  setTimeout(function() {
    saveBackupSnapshot();
    if (navigator.onLine && _pendingChanges) {
      triggerSync();
    }
  }, 2000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(reg) {
      if (reg.periodicSync) {
        reg.periodicSync.register(SYNC_TAG, { minInterval: 12 * 60 * 60 * 1000 }).catch(function() {});
      }
    }).catch(function() {});
  }

})();
