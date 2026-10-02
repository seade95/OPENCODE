// EduVerse Data Sync & Connection Status Manager
(function() {
  window.EduVerseDataSync = window.EduVerseDataSync || {};

  var pendingOfflineChanges = 0;
  var currentStatus = navigator.onLine ? 'online' : 'offline';
  var syncBannerEl = null;

  function initSyncBanner() {
    if (document.getElementById('syncStatusBanner')) {
      syncBannerEl = document.getElementById('syncStatusBanner');
      return;
    }

    syncBannerEl = document.createElement('div');
    syncBannerEl.id = 'syncStatusBanner';
    syncBannerEl.style.cssText = [
      'position: fixed',
      'top: 16px',
      'left: 50%',
      'transform: translateX(-50%) translateY(-100px)',
      'z-index: 99999',
      'padding: 10px 20px',
      'border-radius: 8px',
      'font-family: Inter, system-ui, sans-serif',
      'font-size: 13px',
      'font-weight: 500',
      'display: flex',
      'align-items: center',
      'gap: 10px',
      'box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2)',
      'transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
      'opacity: 0',
      'pointer-events: auto'
    ].join(';');

    document.body.appendChild(syncBannerEl);
  }

  function updateStatusIndicators(statusState, customMsg) {
    currentStatus = statusState;
    initSyncBanner();

    var connElements = document.querySelectorAll('.conn-status');
    connElements.forEach(function(el) {
      if (statusState === 'online') {
        el.innerHTML = '<i class="fas fa-circle" style="color:#22c55e;font-size:9px;margin-right:6px;"></i> <span style="font-size:12px;color:var(--text-light,#64748b);">Online</span>';
        el.title = 'Online & Synced';
      } else if (statusState === 'syncing') {
        el.innerHTML = '<i class="fas fa-sync fa-spin" style="color:#3b82f6;font-size:11px;margin-right:6px;"></i> <span style="font-size:12px;color:#3b82f6;">Syncing data...</span>';
        el.title = 'Syncing offline changes with cloud';
      } else if (statusState === 'offline') {
        var msg = pendingOfflineChanges > 0 ? 'Offline (' + pendingOfflineChanges + ' unsynced)' : 'Offline Mode';
        el.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;font-size:9px;margin-right:6px;"></i> <span style="font-size:12px;color:#d97706;">' + msg + '</span>';
        el.title = 'Offline — Changes saved locally';
      }
    });

    if (!syncBannerEl) return;

    if (statusState === 'offline') {
      var offlineText = customMsg || (pendingOfflineChanges > 0
        ? 'Changes saved offline (' + pendingOfflineChanges + ' pending sync)'
        : 'Offline Mode — Changes saved locally');

      syncBannerEl.style.background = '#fef3c7';
      syncBannerEl.style.color = '#92400e';
      syncBannerEl.style.border = '1px solid #fde68a';
      syncBannerEl.innerHTML = '<i class="fas fa-wifi-slash" style="color:#d97706;"></i> <span>' + offlineText + '</span>';
      showBanner();
    } else if (statusState === 'syncing') {
      syncBannerEl.style.background = '#eff6ff';
      syncBannerEl.style.color = '#1e40af';
      syncBannerEl.style.border = '1px solid #bfdbfe';
      syncBannerEl.innerHTML = '<i class="fas fa-sync fa-spin" style="color:#3b82f6;"></i> <span>' + (customMsg || 'Syncing data with server...') + '</span>';
      showBanner();
    } else if (statusState === 'online') {
      syncBannerEl.style.background = '#f0fdf4';
      syncBannerEl.style.color = '#166534';
      syncBannerEl.style.border = '1px solid #bbf7d0';
      syncBannerEl.innerHTML = '<i class="fas fa-check-circle" style="color:#22c55e;"></i> <span>' + (customMsg || 'Back online — Data synced successfully!') + '</span>';
      showBanner();
      setTimeout(function() {
        if (currentStatus === 'online') hideBanner();
      }, 3500);
    }
  }

  function showBanner() {
    if (!syncBannerEl) return;
    syncBannerEl.style.opacity = '1';
    syncBannerEl.style.transform = 'translateX(-50%) translateY(0)';
  }

  function hideBanner() {
    if (!syncBannerEl) return;
    syncBannerEl.style.opacity = '0';
    syncBannerEl.style.transform = 'translateX(-50%) translateY(-100px)';
  }

  function notifyChangeSaved() {
    if (!navigator.onLine) {
      pendingOfflineChanges += 1;
      updateStatusIndicators('offline', 'Changes saved offline (' + pendingOfflineChanges + ' pending sync)');
    }
  }

  function handleOnline() {
    updateStatusIndicators('syncing', 'Back online — Syncing offline data...');
    setTimeout(function() {
      pendingOfflineChanges = 0;
      updateStatusIndicators('online', 'Back online — Data synced successfully!');
    }, 1500);
  }

  function handleOffline() {
    updateStatusIndicators('offline', 'You are offline — Changes will be saved locally');
  }

  // Attach window event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Hook into saveData if present
  var originalSaveData = window.saveData;
  if (typeof originalSaveData === 'function') {
    window.saveData = function() {
      var result = originalSaveData.apply(this, arguments);
      notifyChangeSaved();
      return result;
    };
  }

  // Initialize status on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initSyncBanner();
    if (!navigator.onLine) {
      updateStatusIndicators('offline');
    }
  });

  window.EduVerseDataSync.updateStatus = updateStatusIndicators;
  window.EduVerseDataSync.notifyChangeSaved = notifyChangeSaved;
})();
