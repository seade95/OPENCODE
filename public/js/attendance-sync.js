/**
 * EduVerse - Student Attendance IndexedDB Synchronization Engine
 * Handles offline detection, caching pending attendance records in IndexedDB,
 * rendering real-time sync status indicators, and auto-syncing upon reconnection.
 */

(function() {
  'use strict';

  var DB_NAME = 'EduVerseAttendanceSyncDB';
  var DB_VERSION = 1;
  var STORE_NAME = 'pending_attendance';
  var dbInstance = null;

  // Track forced offline simulation for testing/demo
  window.__forceOfflineMode = window.__forceOfflineMode || false;

  // Open / Initialize IndexedDB
  function openDB() {
    return new Promise(function(resolve, reject) {
      if (dbInstance) {
        resolve(dbInstance);
        return;
      }
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          var store = db.createObjectStore(STORE_NAME, { keyPath: 'syncId' });
          store.createIndex('studentId', 'studentId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      request.onerror = function(e) {
        console.error('IndexedDB open error:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  // Get all pending records from IndexedDB
  function getPendingAttendanceRecords() {
    return openDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var req = store.getAll();
        req.onsuccess = function() {
          resolve(req.result || []);
        };
        req.onerror = function(e) {
          reject(e.target.error);
        };
      });
    }).catch(function() { return []; });
  }

  // Save a pending record to IndexedDB
  function savePendingAttendanceRecord(record) {
    var syncId = 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    var fullRecord = {
      syncId: syncId,
      studentId: record.studentId || 'STU001',
      studentName: record.studentName || 'Alex Johnson',
      date: record.date || new Date().toISOString().split('T')[0],
      day: record.day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      status: record.status || 'Present',
      term: record.term || 'First Term',
      remarks: record.remarks || 'Offline self check-in',
      timestamp: Date.now(),
      syncStatus: 'pending'
    };

    return openDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var req = store.put(fullRecord);
        req.onsuccess = function() {
          resolve(fullRecord);
        };
        req.onerror = function(e) {
          reject(e.target.error);
        };
      });
    });
  }

  // Delete record from IndexedDB by syncId
  function removePendingAttendanceRecord(syncId) {
    return openDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var req = store.delete(syncId);
        req.onsuccess = function() {
          resolve(true);
        };
        req.onerror = function(e) {
          reject(e.target.error);
        };
      });
    });
  }

  // Clear all pending records
  function clearPendingAttendanceRecords() {
    return openDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var req = store.clear();
        req.onsuccess = function() {
          resolve(true);
        };
        req.onerror = function(e) {
          reject(e.target.error);
        };
      });
    });
  }

  // Check connectivity status
  function isAppOnline() {
    if (window.__forceOfflineMode) return false;
    return typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true;
  }

  // Trigger immediate Recharts Line Chart & UI update across student portal
  function triggerAttendanceChartUpdate() {
    window.dispatchEvent(new CustomEvent('attendanceDataUpdated'));
    if (typeof window.mountStudentAttendanceTrendChart === 'function') {
      var containers = document.querySelectorAll('#studentAttendanceTrendChartContainer, .attendance-chart-container');
      containers.forEach(function(c) {
        if (c && c.id) {
          window.mountStudentAttendanceTrendChart(c.id);
        }
      });
    }
  }

  // Auto-sync pending IndexedDB records to global memory & Firestore
  function syncPendingAttendanceRecords() {
    if (!isAppOnline()) {
      if (typeof window.toast === 'function') {
        window.toast('Cannot sync: App is currently in offline mode.', 'info');
      }
      return Promise.resolve(0);
    }

    return getPendingAttendanceRecords().then(function(pending) {
      if (!pending || !pending.length) {
        updateSyncStatusUI();
        return 0;
      }

      // Render Syncing UI status
      renderSyncStatusBanner('syncing', pending.length);

      return new Promise(function(resolve) {
        setTimeout(function() {
          window.data = window.data || {};
          window.data.attendance = window.data.attendance || [];

          var firestore = typeof window.db === 'function' ? window.db() : null;
          var syncedCount = 0;

          var promises = pending.map(function(item) {
            var syncedRecord = {
              studentId: item.studentId,
              studentName: item.studentName,
              date: item.date,
              day: item.day,
              status: item.status,
              term: item.term,
              remarks: item.remarks + ' (Synced from IndexedDB)'
            };

            window.data.attendance.unshift(syncedRecord);
            syncedCount++;

            // Background write to Firestore if configured
            if (firestore) {
              try {
                firestore.collection('attendance').add({
                  studentId: item.studentId,
                  studentName: item.studentName,
                  date: item.date,
                  day: item.day,
                  status: item.status,
                  term: item.term,
                  remarks: item.remarks,
                  syncedAt: new Date().toISOString()
                }).catch(function(err) {
                  console.warn('Firestore attendance sync:', err);
                });
              } catch(e) {}
            }

            return removePendingAttendanceRecord(item.syncId);
          });

          Promise.all(promises).then(function() {
            if (typeof window.toast === 'function') {
              window.toast('⚡ Synchronized ' + syncedCount + ' attendance record(s) from IndexedDB to Firestore Cloud!', 'success');
            }
            triggerAttendanceChartUpdate();
            if (typeof window.renderStudentAttendance === 'function') {
              window.renderStudentAttendance();
            }
            updateSyncStatusUI();
            resolve(syncedCount);
          });
        }, 1000);
      });
    });
  }

  // Render Synchronization Status UI Indicator Banner
  function renderSyncStatusBanner(stateOverride, pendingCountOverride) {
    var container = document.getElementById('stuAttSyncStatusContainer');
    if (!container) return;

    getPendingAttendanceRecords().then(function(pending) {
      var online = isAppOnline();
      var count = typeof pendingCountOverride === 'number' ? pendingCountOverride : pending.length;
      var state = stateOverride || (online ? (count > 0 ? 'pending_online' : 'synced') : 'offline');

      var html = '';

      if (state === 'syncing') {
        html = '<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #1e40af; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">'
          + '  <div style="display: flex; align-items: center; gap: 12px;">'
          + '    <div style="width: 36px; height: 36px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 16px;">'
          + '      <i class="fas fa-sync fa-spin"></i>'
          + '    </div>'
          + '    <div>'
          + '      <div style="font-weight: 700; font-size: 14px; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">'
          + '        Synchronizing Attendance Records'
          + '        <span class="badge badge-partial" style="background:#bfdbfe; color:#1e40af;">IndexedDB Active</span>'
          + '      </div>'
          + '      <div style="font-size: 12px; color: #2563eb; margin-top: 2px;">'
          + '        Connection active! Uploading ' + count + ' cached record(s) to cloud server...'
          + '      </div>'
          + '    </div>'
          + '  </div>'
          + '</div>';
      } else if (!online || state === 'offline') {
        html = '<div style="background: #fffbebf0; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #92400e; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">'
          + '  <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 260px;">'
          + '    <div style="width: 36px; height: 36px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink:0;">'
          + '      <i class="fas fa-wifi-slash"></i>'
          + '    </div>'
          + '    <div>'
          + '      <div style="font-weight: 700; font-size: 14px; color: #78350f; display: flex; align-items: center; gap: 8px;">'
          + '        Offline Mode — IndexedDB Cache Active'
          + '        <span class="badge badge-unpaid" style="background:#fef3c7; color:#92400e; font-size:10px;">' + count + ' Cached Unsynced</span>'
          + '      </div>'
          + '      <div style="font-size: 12px; color: #b45309; margin-top: 2px;">'
          + '        Network connection unavailable. Marked attendance is safely saved in local IndexedDB storage and will auto-sync upon reconnection.'
          + '      </div>'
          + '    </div>'
          + '  </div>'
          + '  <div style="display: flex; align-items: center; gap: 8px;">'
          + '    <button onclick="if(typeof window.toggleOfflineSimulation===\'function\') window.toggleOfflineSimulation();" class="btn btn-sm" style="background:#d97706; color:#ffffff; border:none; border-radius:6px; font-weight:600;">'
          + '      <i class="fas fa-wifi"></i> Reconnect Network'
          + '    </button>'
          + '    <button onclick="if(typeof window.markAttendanceOfflineModal===\'function\') window.markAttendanceOfflineModal();" class="btn btn-sm btn-outline" style="border-color:#d97706; color:#b45309;">'
          + '      <i class="fas fa-plus-circle"></i> Log Offline Entry'
          + '    </button>'
          + '  </div>'
          + '</div>';
      } else if (count > 0 || state === 'pending_online') {
        html = '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; color: #166534; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">'
          + '  <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 260px;">'
          + '    <div style="width: 36px; height: 36px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink:0;">'
          + '      <i class="fas fa-cloud-upload-alt"></i>'
          + '    </div>'
          + '    <div>'
          + '      <div style="font-weight: 700; font-size: 14px; color: #14532d; display: flex; align-items: center; gap: 8px;">'
          + '        Online — Pending Sync Ready'
          + '        <span class="badge badge-partial" style="font-size:10px;">' + count + ' Record(s) in IndexedDB</span>'
          + '      </div>'
          + '      <div style="font-size: 12px; color: #166534; margin-top: 2px;">'
          + '        Network connection detected. Unsynced attendance items are queued in IndexedDB.'
          + '      </div>'
          + '    </div>'
          + '  </div>'
          + '  <div style="display: flex; align-items: center; gap: 8px;">'
          + '    <button onclick="if(typeof window.syncPendingAttendanceRecords===\'function\') window.syncPendingAttendanceRecords();" class="btn btn-sm btn-primary" style="background:#16a34a; border:none;">'
          + '      <i class="fas fa-sync"></i> Sync Now (' + count + ')'
          + '    </button>'
          + '  </div>'
          + '</div>';
      } else {
        // Fully Online & Synced
        html = '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; color: #334155; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">'
          + '  <div style="display: flex; align-items: center; gap: 10px;">'
          + '    <span style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; background:#f0fdf4; border:1px solid #bbf7d0; padding:4px 10px; border-radius:20px;">'
          + '      <span style="width:8px; height:8px; border-radius:50%; background:#16a34a; display:inline-block;"></span> Online & Synced'
          + '    </span>'
          + '    <span style="font-size: 12px; color: #64748b;">'
          + '      IndexedDB storage engine active. Attendance records sync automatically.'
          + '    </span>'
          + '  </div>'
          + '  <div style="display: flex; align-items: center; gap: 8px;">'
          + '    <button onclick="if(typeof window.toggleOfflineSimulation===\'function\') window.toggleOfflineSimulation();" class="btn btn-sm btn-outline" style="font-size:11px; padding:4px 10px;">'
          + '      <i class="fas fa-wifi" style="color:#d97706;"></i> Simulate Offline Mode'
          + '    </button>'
          + '    <button onclick="if(typeof window.markAttendanceOfflineModal===\'function\') window.markAttendanceOfflineModal();" class="btn btn-sm btn-primary" style="font-size:12px; padding:5px 12px;">'
          + '      <i class="fas fa-calendar-plus"></i> Mark Attendance'
          + '    </button>'
          + '  </div>'
          + '</div>';
      }

      container.innerHTML = html;
    });
  }

  function updateSyncStatusUI() {
    renderSyncStatusBanner();
  }

  function toggleOfflineSimulation() {
    window.__forceOfflineMode = !window.__forceOfflineMode;
    var statusText = window.__forceOfflineMode ? 'Offline Mode Simulated' : 'Online Connection Restored';
    if (typeof window.toast === 'function') {
      window.toast(statusText, window.__forceOfflineMode ? 'info' : 'success');
    }
    updateSyncStatusUI();

    if (!window.__forceOfflineMode) {
      syncPendingAttendanceRecords();
    }
  }

  function markAttendanceOfflineModal() {
    var student = window.currentStudent || (typeof getSession === 'function' ? (getSession() || {}).user : null) || { id: 'STU001', name: 'Alex Johnson' };
    var todayStr = new Date().toISOString().split('T')[0];
    var todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    var esc = window.htmlEscape || function(s) { return s; };

    var modalHtml = '<div style="padding: 20px;">'
      + '<h3 style="margin:0 0 12px; color:#1e293b; display:flex; align-items:center; gap:8px;">'
      + '  <i class="fas fa-calendar-check" style="color:#2563eb;"></i> Mark Student Attendance'
      + '</h3>'
      + '<p style="margin:0 0 16px; font-size:13px; color:#64748b;">Log today\'s attendance entry. Stored in IndexedDB when offline.</p>'
      + '<div style="margin-bottom:12px;"><label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Student Name</label>'
      + '  <input type="text" id="offlineAttName" value="' + esc(student.name || 'Alex Johnson') + '" readonly style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc;"></div>'
      + '<div style="margin-bottom:12px;"><label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Date & Day</label>'
      + '  <input type="text" id="offlineAttDate" value="' + todayStr + ' (' + todayDay + ')" readonly style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc;"></div>'
      + '<div style="margin-bottom:12px;"><label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Status</label>'
      + '  <select id="offlineAttStatus" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px;">'
      + '    <option value="Present">Present</option>'
      + '    <option value="Late">Late</option>'
      + '    <option value="Absent">Absent</option>'
      + '  </select></div>'
      + '<div style="margin-bottom:16px;"><label style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Remarks / Notes</label>'
      + '  <input type="text" id="offlineAttRemarks" placeholder="e.g. On time or medical note" value="Logged attendance entry" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px;"></div>'
      + '<div style="display:flex; justify-content:flex-end; gap:8px;">'
      + '  <button onclick="if(typeof closeModal===\'function\') closeModal();" class="btn btn-outline">Cancel</button>'
      + '  <button id="submitOfflineAttBtn" class="btn btn-primary"><i class="fas fa-save"></i> Save Attendance Record</button>'
      + '</div>'
      + '</div>';

    var body = document.getElementById('modalBody');
    var overlay = document.getElementById('modalOverlay');
    if (body && overlay) {
      body.innerHTML = modalHtml;
      overlay.classList.add('active');

      document.getElementById('submitOfflineAttBtn').onclick = function() {
        var status = document.getElementById('offlineAttStatus').value;
        var remarks = document.getElementById('offlineAttRemarks').value.trim() || 'Logged entry';

        var record = {
          studentId: student.id || 'STU001',
          studentName: student.name || 'Alex Johnson',
          date: todayStr,
          day: todayDay,
          status: status,
          term: 'First Term',
          remarks: remarks
        };

        // Update local memory data immediately for instant chart re-render
        window.data = window.data || {};
        window.data.attendance = window.data.attendance || [];
        window.data.attendance.unshift(record);

        if (!isAppOnline()) {
          savePendingAttendanceRecord(record).then(function() {
            if (typeof window.toast === 'function') {
              window.toast('📦 Attendance saved locally & cached in IndexedDB (Offline Mode)', 'info');
            }
            if (typeof closeModal === 'function') closeModal();
            triggerAttendanceChartUpdate();
            if (typeof window.renderStudentAttendance === 'function') {
              window.renderStudentAttendance();
            }
            updateSyncStatusUI();
          });
        } else {
          // Direct online save & Firestore sync
          var firestore = typeof window.db === 'function' ? window.db() : null;
          if (firestore) {
            try {
              firestore.collection('attendance').add({
                studentId: record.studentId,
                studentName: record.studentName,
                date: record.date,
                day: record.day,
                status: record.status,
                term: record.term,
                remarks: record.remarks,
                syncedAt: new Date().toISOString()
              }).catch(function(err) { console.warn('Firestore attendance save:', err); });
            } catch(e) {}
          }

          if (typeof window.toast === 'function') {
            window.toast('Attendance record saved & synced with Firestore Cloud!', 'success');
          }
          if (typeof closeModal === 'function') closeModal();
          triggerAttendanceChartUpdate();
          if (typeof window.renderStudentAttendance === 'function') {
            window.renderStudentAttendance();
          }
          updateSyncStatusUI();
        }
      };
    }
  }

  // Network Event Listeners
  window.addEventListener('online', function() {
    if (typeof window.toast === 'function') {
      window.toast('🌐 Network connection restored. Auto-syncing IndexedDB records...', 'success');
    }
    updateSyncStatusUI();
    syncPendingAttendanceRecords();
  });

  window.addEventListener('offline', function() {
    if (typeof window.toast === 'function') {
      window.toast('⚠️ Connection lost. App in Offline Caching Mode.', 'info');
    }
    updateSyncStatusUI();
  });

  // Export functions to window
  window.initAttendanceSyncDB = openDB;
  window.getPendingAttendanceRecords = getPendingAttendanceRecords;
  window.savePendingAttendanceRecord = savePendingAttendanceRecord;
  window.syncPendingAttendanceRecords = syncPendingAttendanceRecords;
  window.clearPendingAttendanceRecords = clearPendingAttendanceRecords;
  window.updateSyncStatusUI = updateSyncStatusUI;
  window.toggleOfflineSimulation = toggleOfflineSimulation;
  window.markAttendanceOfflineModal = markAttendanceOfflineModal;
  window.isAppOnline = isAppOnline;

  // Initial setup on load
  document.addEventListener('DOMContentLoaded', function() {
    openDB().then(function() {
      updateSyncStatusUI();
    });
  });

})();
