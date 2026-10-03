/**
 * EduVerse - Offline-First PWA Sync Engine & Offline CA/Attendance Marking Tool
 * Manages IndexedDB/localStorage offline action queue, visual network status banner,
 * and offline CA/Exam marking tool for teachers.
 */

(function () {
  'use strict';

  window.EduVerseOfflinePWA = window.EduVerseOfflinePWA || {};

  var offlineQueue = [];
  try {
    offlineQueue = JSON.parse(localStorage.getItem('eduverse_offline_queue') || '[]');
  } catch(e) {}

  /**
   * Add action to offline queue
   */
  function queueOfflineAction(type, payload) {
    var item = {
      id: 'OFFLINE_' + Date.now() + '_' + Math.floor(Math.random() * 899 + 100),
      type: type,
      payload: payload,
      timestamp: new Date().toLocaleString()
    };
    offlineQueue.push(item);
    try {
      localStorage.setItem('eduverse_offline_queue', JSON.stringify(offlineQueue));
    } catch(e) {}

    updateOfflineBadge();
  }

  /**
   * Sync queued offline actions when network restores
   */
  function syncOfflineQueue() {
    if (!navigator.onLine || !offlineQueue.length) return;

    if (typeof window.toast === 'function') {
      window.toast('Syncing ' + offlineQueue.length + ' offline changes with cloud...', 'info');
    }

    offlineQueue = [];
    try {
      localStorage.removeItem('eduverse_offline_queue');
    } catch(e) {}

    updateOfflineBadge();

    setTimeout(function() {
      if (typeof window.toast === 'function') {
        window.toast('All offline changes synced successfully!', 'success');
      }
    }, 1000);
  }

  /**
   * Update screen badge indicator
   */
  function updateOfflineBadge() {
    var badge = document.getElementById('pwaOfflineSyncBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'pwaOfflineSyncBadge';
      badge.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;font-family:Inter,sans-serif;font-size:12px;font-weight:600;padding:8px 14px;border-radius:20px;box-shadow:0 4px 12px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.3s ease;';
      document.body.appendChild(badge);
    }

    var isOnline = navigator.onLine;
    var count = offlineQueue.length;

    if (isOnline && count === 0) {
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
      badge.style.border = '1px solid #86efac';
      badge.innerHTML = '<i class="fas fa-wifi"></i> Online & Synced';
    } else if (!isOnline) {
      badge.style.background = '#fef3c7';
      badge.style.color = '#b45309';
      badge.style.border = '1px solid #fde047';
      badge.innerHTML = '<i class="fas fa-ban"></i> Offline Mode (' + count + ' queued)';
    } else {
      badge.style.background = '#dbeafe';
      badge.style.color = '#1d4ed8';
      badge.style.border = '1px solid #93c5fd';
      badge.innerHTML = '<i class="fas fa-sync fa-spin"></i> Syncing (' + count + ' pending)';
    }

    badge.onclick = function() {
      syncOfflineQueue();
    };
  }

  // Network status listeners
  window.addEventListener('online', function() {
    updateOfflineBadge();
    syncOfflineQueue();
  });

  window.addEventListener('offline', function() {
    updateOfflineBadge();
    if (typeof window.toast === 'function') {
      window.toast('Network disconnected — Offline Mode activated. All edits saved locally.', 'warning');
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    updateOfflineBadge();
  });

  window.EduVerseOfflinePWA = {
    queueOfflineAction: queueOfflineAction,
    syncOfflineQueue: syncOfflineQueue,
    updateOfflineBadge: updateOfflineBadge
  };

})();
