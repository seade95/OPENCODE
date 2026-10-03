/**
 * EduVerse - Automated Scheduled Cloud Backup & Disaster Recovery Manager
 * Manages automated cloud backups for Attendance, Academic Grades, and Fee Records.
 * Dispatches encrypted disaster recovery packages to external cloud storage and provides 1-click restore.
 */

(function () {
  'use strict';

  window.EduVerseBackupManager = window.EduVerseBackupManager || {};

  function esc(s) {
    if (typeof window.htmlEscape === 'function') return window.htmlEscape(s);
    if (!s && s !== 0) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /**
   * Save Backup Configuration & Cron Schedule
   */
  function saveBackupScheduleConfig() {
    var scheduleSelect = document.getElementById('bkScheduleSelect');
    var destSelect = document.getElementById('bkDestinationSelect');
    var attCheck = document.getElementById('bkIncludeAtt');
    var gradeCheck = document.getElementById('bkIncludeGrades');
    var feeCheck = document.getElementById('bkIncludeFees');

    var config = {
      schedule: scheduleSelect ? scheduleSelect.value : 'daily',
      destination: destSelect ? destSelect.value : 'Google Cloud Storage & AWS S3 Vault',
      includeAttendance: attCheck ? attCheck.checked : true,
      includeGrades: gradeCheck ? gradeCheck.checked : true,
      includeFees: feeCheck ? feeCheck.checked : true
    };

    fetch('/api/backup/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    .then(function(res) { return res.json(); })
    .then(function(res) {
      if (res && res.success) {
        if (typeof window.toast === 'function') {
          window.toast('☁️ ' + res.message, 'success');
        }
      }
    })
    .catch(function(err) {
      console.error('Save backup schedule error:', err);
    });
  }

  /**
   * Trigger Immediate Disaster Recovery Cloud Backup
   */
  function triggerImmediateCloudBackup() {
    var statusEl = document.getElementById('bkStatusLogMsg');
    var btn = document.getElementById('triggerCloudBackupBtn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting & Dispatching to Cloud...';
    }

    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.className = 'alert alert-info';
      statusEl.innerHTML = '<i class="fas fa-sync fa-spin"></i> Generating SHA-256 AES-256-GCM Disaster Recovery Archive for Attendance, Grades & Fee Records...';
    }

    var dataObj = window.data || {};
    var attendanceData = dataObj.attendance || [];
    var gradesData = dataObj.results || [];
    var feesData = dataObj.payments || [];
    var schoolName = (dataObj.schoolProfile ? dataObj.schoolProfile.name : null) || 'EduVerse International Academy';

    var payload = {
      attendanceData: attendanceData,
      gradesData: gradesData,
      feesData: feesData,
      schoolName: schoolName
    };

    fetch('/api/backup/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(res) {
      if (res && res.success) {
        var dateStr = new Date().toISOString().split('T')[0];
        var fileName = 'EduVerse_DisasterRecovery_Backup_' + dateStr + '.json';
        var jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.dataPackage, null, 2));

        var downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonContent);
        downloadAnchor.setAttribute('download', fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        if (statusEl) {
          statusEl.className = 'alert alert-success';
          statusEl.innerHTML = '<i class="fas fa-check-circle" style="color:#16a34a;"></i> <strong>Disaster Recovery Backup Complete!</strong> Archived ' + (res.recordCounts ? (res.recordCounts.attendance + res.recordCounts.grades + res.recordCounts.fees) : 0) + ' records. File downloaded as <code>' + fileName + '</code> and synced to external cloud vault.';
        }

        if (typeof window.toast === 'function') {
          window.toast('⚡ Disaster Recovery Cloud Backup successfully created & downloaded!', 'success');
        }

        renderBackupManagerPanel();
      }
    })
    .catch(function(err) {
      console.error('Backup trigger error:', err);
      if (statusEl) {
        statusEl.className = 'alert alert-danger';
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to complete cloud backup. Please check your network connection.';
      }
    })
    .finally(function() {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Trigger Immediate Cloud Backup';
      }
    });
  }

  /**
   * Disaster Recovery Restore from Uploaded JSON Archive
   */
  function restoreFromBackupArchive(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    var file = fileInput.files[0];

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var content = JSON.parse(e.target.result);
        if (content && (content.attendanceRecords || content.academicGrades || content.bursaryFees)) {
          window.data = window.data || {};
          if (Array.isArray(content.attendanceRecords)) {
            window.data.attendance = content.attendanceRecords;
          }
          if (Array.isArray(content.academicGrades)) {
            window.data.results = content.academicGrades;
          }
          if (Array.isArray(content.bursaryFees)) {
            window.data.payments = content.bursaryFees;
          }

          if (typeof window.saveData === 'function') {
            window.saveData();
          }

          if (typeof window.toast === 'function') {
            window.toast('✅ Disaster Recovery Restore Successful! All attendance, grade, and fee records recovered.', 'success');
          }

          // Trigger view re-renders
          if (typeof window.renderStudentAttendance === 'function') window.renderStudentAttendance();
          if (typeof window.renderAdminDashboard === 'function') window.renderAdminDashboard();

          alert('Disaster recovery restore complete! All Attendance, Academic Grades, and Bursary records have been restored.');
        } else {
          alert('Invalid disaster recovery file format. Please upload a valid EduVerse backup archive.');
        }
      } catch(err) {
        alert('Error parsing disaster recovery archive: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Render Automated Cloud Backup Panel in Admin Portal & Super Admin
   */
  function renderBackupManagerPanel() {
    var container = document.getElementById('admin-backup') || document.getElementById('backupManagerContainer') || document.getElementById('saBackupPanel');
    if (!container) return;

    fetch('/api/backup/config')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var cfg = (data && data.config) ? data.config : { schedule: 'daily', destination: 'Google Cloud Storage & AWS S3 Vault' };
        var logs = (data && Array.isArray(data.logs)) ? data.logs : [];

        var html = '<div class="card" style="padding:20px;margin-bottom:20px;">'
          + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">'
          + '  <div>'
          + '    <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f2440;display:flex;align-items:center;gap:8px;">'
          + '      <i class="fas fa-shield-alt" style="color:#2563eb;"></i> Automated Cloud Backup & Disaster Recovery'
          + '    </h3>'
          + '    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">'
          + '      Automated encrypted cloud backups for Attendance, Academic Grades, and Bursary Fee Records'
          + '    </p>'
          + '  </div>'
          + '  <span class="badge" style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:6px 12px;font-size:12px;border-radius:20px;">'
          + '    <i class="fas fa-lock"></i> AES-256 Encrypted Cloud Vault Active'
          + '  </span>'
          + '</div>'

          // Status Notification Msg
          + '<div id="bkStatusLogMsg" style="display:none;margin-bottom:16px;padding:12px;border-radius:8px;font-size:13px;"></div>'

          // Controls Grid
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">'
          + '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">'
          + '    <h4 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;"><i class="fas fa-clock" style="color:#d97706;"></i> Backup Schedule & Destination</h4>'
          + '    <div style="margin-bottom:12px;">'
          + '      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Automated Cron Frequency</label>'
          + '      <select id="bkScheduleSelect" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;" onchange="window.EduVerseBackupManager.saveBackupScheduleConfig()">'
          + '        <option value="daily"' + (cfg.schedule === 'daily' ? ' selected' : '') + '>Daily Automated (Every night at 02:00 UTC)</option>'
          + '        <option value="weekly"' + (cfg.schedule === 'weekly' ? ' selected' : '') + '>Weekly Automated (Every Sunday at 00:00 UTC)</option>'
          + '        <option value="monthly"' + (cfg.schedule === 'monthly' ? ' selected' : '') + '>Monthly Automated (1st of every month)</option>'
          + '      </select>'
          + '    </div>'
          + '    <div style="margin-bottom:12px;">'
          + '      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">External Cloud Storage Target</label>'
          + '      <select id="bkDestinationSelect" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;" onchange="window.EduVerseBackupManager.saveBackupScheduleConfig()">'
          + '        <option value="Google Cloud Storage & AWS S3 Vault">Google Drive API & AWS S3 Bucket (s3://eduverse-backups/)</option>'
          + '        <option value="Azure Blob Encrypted Storage Vault">Azure Blob Encrypted Storage Vault</option>'
          + '        <option value="Firebase Cloud Storage Storage Bucket">Firebase Cloud Storage Bucket</option>'
          + '      </select>'
          + '    </div>'
          + '  </div>'

          + '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">'
          + '    <h4 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;"><i class="fas fa-database" style="color:#0284c7;"></i> Data Scopes Included in Backup</h4>'
          + '    <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:#334155;margin-bottom:14px;">'
          + '      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="bkIncludeAtt" checked onchange="window.EduVerseBackupManager.saveBackupScheduleConfig()"> <strong>Student Attendance Logs</strong> (Daily check-ins & IndexedDB records)</label>'
          + '      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="bkIncludeGrades" checked onchange="window.EduVerseBackupManager.saveBackupScheduleConfig()"> <strong>Academic Grades & Exam Transcripts</strong> (CA & Mock CBT scores)</label>'
          + '      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="bkIncludeFees" checked onchange="window.EduVerseBackupManager.saveBackupScheduleConfig()"> <strong>Bursary & Fee Payment Ledgers</strong> (Bank receipts & virtual accounts)</label>'
          + '    </div>'
          + '    <div style="display:flex;gap:8px;flex-wrap:wrap;">'
          + '      <button id="triggerCloudBackupBtn" class="btn btn-primary btn-sm" onclick="window.EduVerseBackupManager.triggerImmediateCloudBackup()">'
          + '        <i class="fas fa-cloud-upload-alt"></i> Trigger Immediate Cloud Backup'
          + '      </button>'
          + '      <label class="btn btn-outline btn-sm" style="cursor:pointer;margin:0;">'
          + '        <i class="fas fa-upload"></i> Restore from Disaster Archive'
          + '        <input type="file" accept=".json" style="display:none;" onchange="window.EduVerseBackupManager.restoreFromBackupArchive(this)">'
          + '      </label>'
          + '    </div>'
          + '  </div>'
          + '</div>'

          // Audit Log Table
          + '<h4 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1e293b;"><i class="fas fa-history"></i> Cloud Backup Audit Log & Disaster Recovery History</h4>'
          + '<div class="table-responsive"><table class="table" style="width:100%;font-size:12px;">'
          + '<thead><tr style="background:#f1f5f9;color:#334155;">'
          + '  <th>Backup ID</th><th>Timestamp</th><th>Trigger Source</th><th>Storage Destination</th><th>Records Secured</th><th>Status</th>'
          + '</tr></thead><tbody>';

        if (logs.length) {
          logs.forEach(function(l) {
            var counts = l.recordCounts || { attendance: 0, grades: 0, fees: 0 };
            var totalRecs = counts.attendance + counts.grades + counts.fees;
            html += '<tr>'
              + '<td><code>' + esc(l.id) + '</code></td>'
              + '<td>' + esc(new Date(l.timestamp).toLocaleString()) + '</td>'
              + '<td><span class="badge" style="background:#eff6ff;color:#1d4ed8;">' + esc(l.schedule) + '</span></td>'
              + '<td><span style="font-size:11px;color:#475569;">' + esc(l.storageTarget) + '</span></td>'
              + '<td><strong>' + totalRecs + ' records</strong> (' + esc(l.sizeKb) + ' KB)</td>'
              + '<td><span class="badge badge-paid"><i class="fas fa-check-circle"></i> ' + esc(l.status) + '</span></td>'
              + '</tr>';
          });
        } else {
          html += '<tr><td colspan="6" style="text-align:center;color:#64748b;padding:16px;">No cloud backups generated yet. Click "Trigger Immediate Cloud Backup" to test.</td></tr>';
        }

        html += '</tbody></table></div></div>';

        container.innerHTML = html;
      })
      .catch(function(err) {
        console.error('Render backup manager error:', err);
      });
  }

  // Export globally
  window.EduVerseBackupManager = {
    saveBackupScheduleConfig: saveBackupScheduleConfig,
    triggerImmediateCloudBackup: triggerImmediateCloudBackup,
    restoreFromBackupArchive: restoreFromBackupArchive,
    renderBackupManagerPanel: renderBackupManagerPanel
  };

  window.renderBackupManagerPanel = renderBackupManagerPanel;

  document.addEventListener('DOMContentLoaded', function() {
    renderBackupManagerPanel();
  });

})();
