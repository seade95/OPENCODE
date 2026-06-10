// EDUVERSE - System Module
// Backup/Restore, Global Search, Session Management, Confirm Dialogs, Data Repair

// ===== 1. DATA BACKUP & RESTORE =====
function showDataBackup() {
  openModal(`
    <h3><i class="fas fa-database"></i> Data Backup & Restore</h3>
    <div style="margin:16px 0;">
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px;">Export all school data as JSON or import a previous backup to restore the system.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="exportAllData()"><i class="fas fa-download"></i> Export Backup</button>
        <button class="btn btn-secondary" onclick="document.getElementById('importBackupInput').click()"><i class="fas fa-upload"></i> Import Backup</button>
        <input type="file" id="importBackupInput" accept=".json" style="display:none;" onchange="importBackupFile(event)">
      </div>
      <div id="backupInfo" style="margin-top:16px;"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `);
}

function exportAllData() {
  var schoolName = (data && data.schoolName) ? data.schoolName : 'EDUVERSE';
  var backup = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    school: schoolName,
    data: JSON.parse(JSON.stringify(data))
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  var date = new Date().toISOString().split('T')[0];
  var safeName = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'school';
  link.download = safeName + '-backup-' + date + '.json';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Backup exported successfully');
}

var _pendingBackup = null;

function importBackupFile(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var backup = JSON.parse(ev.target.result);
      if (!backup.data || !backup.version) {
        toast('Invalid backup file format', 'error');
        return;
      }
      var _bi = document.getElementById('backupInfo'); if (_bi) _bi.innerHTML =
        '<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:16px;">' +
        '<p style="font-weight:600;color:#22543d;"><i class="fas fa-check-circle"></i> Backup valid</p>' +
        '<p style="font-size:13px;color:#276749;">School: ' + htmlEscape(backup.school || 'Unknown') + '</p>' +
        '<p style="font-size:13px;color:#276749;">Exported: ' + htmlEscape(backup.exportedAt || 'Unknown') + '</p>' +
        '<p style="font-size:13px;color:#276749;">Version: ' + htmlEscape(String(backup.version)) + '</p>' +
        '<button class="btn btn-primary" style="margin-top:12px;" id="restoreBackupBtn">' +
        '<i class="fas fa-exclamation-triangle"></i> Restore This Backup</button></div>';
      _pendingBackup = backup;
      var restoreBtn = document.getElementById('restoreBackupBtn');
      if (restoreBtn) {
        restoreBtn.onclick = function() { confirmRestoreBackup(_pendingBackup); };
      }
    } catch(err) {
      toast('Error reading backup file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function _isValidBackupData(obj) {
  if (!obj || typeof obj !== 'object') return false;
  var allowed = ['students','teachers','parents','fees','results','cat','attendance','timetable','messages','activities','library','forumPosts','examRegistrations','payments','paymentTransactions','notifications','schoolProfile','schoolName','schoolAddress','schoolPhone','schoolEmail','schoolMotto','academicTerms','currentTerm','assignments','submissions','virtualClasses','gallery','lessonNotes','behavior','hr','grades','examModules','programs','applications','examBank','examResults','admissionSettings','classSettings','gradeScale','academicCalendar','notifLog','rooms','teacherSubjects','timetableSettings','hostels','hostelRooms','hostelAllocations','maintenanceReqs','paymentGateway','hostelPayments','waitlists','simQuestions','simAttempts','customReports','activityScores','alumni','reunions','donations'];
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && allowed.indexOf(key) === -1) return false;
  }
  return true;
}

function confirmRestoreBackup(backup) {
  if (!backup || !backup.data) { toast('No backup data to restore', 'error'); return; }
  if (!_isValidBackupData(backup.data)) {
    toast('Invalid backup — contains unrecognized properties', 'error');
    return;
  }
  showConfirmDialog(
    'Restore Backup',
    'This will OVERWRITE all current data with the backup data. This cannot be undone. Are you sure?',
    function() {
      try {
        Object.keys(backup.data).forEach(function(k) { data[k] = backup.data[k]; });
        saveData();
        toast('Data restored successfully. Refreshing...');
        setTimeout(function() { location.reload(); }, 1500);
      } catch(err) {
        toast('Restore failed: ' + err.message, 'error');
      }
    },
    'danger'
  );
}

// ===== 2. GLOBAL SEARCH =====
function showGlobalSearch() {
  openModal(`
    <h3><i class="fas fa-search"></i> Global Search</h3>
    <div style="margin:16px 0;">
      <input type="text" id="globalSearchInput" placeholder="Search students, teachers, results, messages..." oninput="performGlobalSearch()" autofocus
        style="width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:15px;">
      <div id="globalSearchResults" style="margin-top:16px;max-height:400px;overflow-y:auto;"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `);
  setTimeout(function() {
    var inp = document.getElementById('globalSearchInput');
    if (inp) inp.focus();
  }, 100);
}

function performGlobalSearch() {
  var _gsi = document.getElementById('globalSearchInput');
  var q = (_gsi?.value ?? '').trim().toLowerCase();
  var container = document.getElementById('globalSearchResults');
  if (!container) return;
  if (!q || q.length < 2) {
    container.innerHTML = '<p class="empty-state">Type at least 2 characters to search</p>';
    return;
  }

  var results = [];

  data.students.forEach(function(s) {
    if (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.contact || '').toLowerCase().includes(q)) {
      results.push({ type: 'student', label: s.name + ' (' + s.id + ')', sub: 'Class: ' + s.class + ' · ' + (s.contact || ''), icon: 'user-graduate', sid: s.id });
    }
  });

  data.teachers.forEach(function(t) {
    if (t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q)) {
      results.push({ type: 'teacher', label: t.name + ' (' + t.id + ')', sub: 'Class: ' + t.assignedClass + ' · ' + t.email, icon: 'chalkboard-teacher', action: '' });
    }
  });

  data.results.forEach(function(r) {
    var stu = getStudent(r.studentId);
    if (r.subject.toLowerCase().includes(q) || (stu && stu.name.toLowerCase().includes(q))) {
      results.push({ type: 'result', label: (stu ? stu.name : r.studentId) + ' - ' + r.subject, sub: 'Score: ' + r.score + ' · Grade: ' + r.grade + ' · ' + r.term, icon: 'file-alt', action: '' });
    }
  });

  data.messages.forEach(function(m) {
    if ((m.subject || '').toLowerCase().includes(q) || (m.body || '').toLowerCase().includes(q) || (m.from || '').toLowerCase().includes(q)) {
      results.push({ type: 'message', label: m.subject, sub: 'From: ' + m.from + ' · ' + m.date, icon: 'envelope', action: '' });
    }
  });

  data.fees.forEach(function(f) {
    var stu = getStudent(f.studentId);
    if (stu && stu.name.toLowerCase().includes(q)) {
      results.push({ type: 'fee', label: (stu ? stu.name : f.studentId) + ' - ' + f.term, sub: '$' + f.paid + ' / $' + f.amount + ' · ' + f.status, icon: 'file-invoice-dollar', action: '' });
    }
  });

  container.innerHTML = results.length
    ? '<div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">' + results.length + ' result(s)</div>' +
      '<div id="globalSearchResultsList" style="display:flex;flex-direction:column;gap:4px;">' +
      results.slice(0, 50).map(function(r) {
        var color = r.type === 'student' ? '#3182ce' : r.type === 'teacher' ? '#38a169' : r.type === 'result' ? '#805ad5' : r.type === 'message' ? '#d69e2e' : '#e53e3e';
        var extra = '';
        if (r.sid) extra += ' data-sid="' + htmlEscape(r.sid) + '"';
        return '<div class="global-search-item"' + extra + ' style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background=\'#f7fafc\'" onmouseout="this.style.background=\'\'">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;color:white;font-size:14px;flex-shrink:0;"><i class="fas fa-' + r.icon + '"></i></div>' +
          '<div style="flex:1;min-width:0;"><strong style="font-size:14px;">' + htmlEscape(r.label) + '</strong>' +
          '<p style="font-size:12px;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + htmlEscape(r.sub) + '</p></div></div>';
      }).join('') + '</div>'
    : '<p class="empty-state">No results found for "' + htmlEscape(q) + '"</p>';
  var list = document.getElementById('globalSearchResultsList');
  if (list) {
    list.onclick = function(e) {
      var item = e.target.closest('.global-search-item');
      if (!item) return;
      var sid = item.getAttribute('data-sid');
      if (sid) showStudentProfile(sid);
    };
  }
}

function showStudentProfile(id) {
  var s = getStudent(id);
  if (!s) return;
  closeModal();
  if (typeof currentAdmin !== 'undefined' && currentAdmin) {
    document.querySelectorAll('#adminPage .admin-sidebar-item').forEach(function(i) { i.classList.remove('active'); });
    document.querySelector('#adminPage .admin-sidebar-item[data-panel="students"]')?.classList.add('active');
    if (typeof switchAdminPanel === 'function') switchAdminPanel('students');
    var inp = document.getElementById('studentSearch');
    if (inp) { inp.value = s.id; }
    if (typeof renderStudents === 'function') renderStudents();
  }
  toast('Found: ' + s.name);
}

// ===== 3. SESSION MANAGEMENT =====
var SESSION_TIMEOUT = 30 * 60 * 1000;
var sessionTimer = null;
var _sessionMonitorInited = false;

function initSessionMonitor() {
  if (_sessionMonitorInited) return;
  _sessionMonitorInited = true;
  if (sessionTimer) clearInterval(sessionTimer);
  sessionTimer = setInterval(checkSession, 60000);
  ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(function(ev) {
    document.addEventListener(ev, resetSessionActivity, { passive: true });
  });
}

function resetSessionActivity() {
  var now = Date.now().toString();
  try { sessionStorage.setItem('lastActivity', now); } catch(e) {}
}

function checkSession() {
  try {
    var lastStr = sessionStorage.getItem('lastActivity');
    if (!lastStr) return;
    var last = parseInt(lastStr, 10);
    if (isNaN(last)) return;
    var elapsed = Date.now() - last;
    if (elapsed > SESSION_TIMEOUT && elapsed < 86400000) {
      if (typeof currentAdmin !== 'undefined' && currentAdmin) {
        if (typeof adminLogout === 'function') adminLogout();
        toast('Session expired due to inactivity', 'warning');
        return;
      }
      if (typeof currentStudent !== 'undefined' && currentStudent) {
        if (typeof studentLogout === 'function') studentLogout();
        toast('Session expired due to inactivity', 'warning');
        return;
      }
      if (typeof currentTeacher !== 'undefined' && currentTeacher) {
        if (typeof teacherLogout === 'function') teacherLogout();
        toast('Session expired due to inactivity', 'warning');
      }
    }
  } catch(e) {}
}

function showSessionSettings() {
  openModal(`
    <h3><i class="fas fa-clock"></i> Session Settings</h3>
    <div style="margin:16px 0;">
      <p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">Session timeout: auto-logout after inactivity.</p>
      <div class="form-group">
        <label>Timeout Duration</label>
        <select id="sessionTimeoutSelect" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">
          <option value="5">5 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30" selected>30 minutes</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
          <option value="0">Never (not recommended)</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveSessionSettings()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveSessionSettings() {
  var _sst = document.getElementById('sessionTimeoutSelect');
  var val = parseInt(_sst?.value ?? '30');
  SESSION_TIMEOUT = val > 0 ? val * 60 * 1000 : 86400000;
  try { localStorage.setItem('sessionTimeout', val.toString()); } catch(e) {}
  resetSessionActivity();
  closeModal();
  toast('Session timeout set to ' + val + ' minute(s)');
}

try {
  var savedTimeout = localStorage.getItem('sessionTimeout');
  if (savedTimeout !== null) {
    var t = parseInt(savedTimeout);
    SESSION_TIMEOUT = t > 0 ? t * 60 * 1000 : 86400000;
  }
} catch(e) {}

// ===== 4. CONFIRMATION DIALOG SYSTEM =====
function showConfirmDialog(title, message, onConfirm, style) {
  var existing = document.getElementById('confirmDialogOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'confirmDialogOverlay';
  overlay.className = 'modal-overlay confirm-dialog-overlay';
  overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10001;';
  overlay.onclick = function(e) { if (e.target === overlay) { overlay.remove(); } };

  var btnColor = style === 'danger' ? '#e53e3e' : style === 'warning' ? '#d69e2e' : '#3182ce';
  var btnHover = style === 'danger' ? '#c53030' : style === 'warning' ? '#b7791f' : '#2b6cb0';

  overlay.innerHTML = '<div style="background:var(--card-bg);border-radius:12px;padding:24px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<h3 style="font-weight:700;font-size:18px;margin-bottom:8px;">' + htmlEscape(title) + '</h3>' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:20px;line-height:1.5;">' + htmlEscape(message) + '</p>' +
    '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
    '<button class="btn btn-outline" id="confirmDialogCancel" style="color:var(--text);border-color:#e2e8f0;">Cancel</button>' +
    '<button class="btn" id="confirmDialogConfirm" style="background:' + btnColor + ';color:white;font-weight:600;" onmouseover="this.style.background=\'' + btnHover + '\'" onmouseout="this.style.background=\'' + btnColor + '\'">' +
    '<i class="fas fa-check"></i> Confirm</button></div></div>';

  document.body.appendChild(overlay);

  document.getElementById('confirmDialogCancel').onclick = function() { overlay.remove(); };
  document.getElementById('confirmDialogConfirm').onclick = function() {
    overlay.remove();
    if (typeof onConfirm === 'function') onConfirm();
  };
}

// ===== 5. DATA INTEGRITY REPAIR =====
function showDataRepair() {
  openModal(`
    <h3><i class="fas fa-tools"></i> Data Integrity & Repair</h3>
    <div style="margin:16px 0;">
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px;">Check and repair orphaned records, stale references, and data inconsistencies.</p>
      <button class="btn btn-primary" onclick="runDataRepair()"><i class="fas fa-wrench"></i> Run Integrity Check</button>
      <div id="repairResults" style="margin-top:16px;"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `);
}

function runDataRepair() {
  var container = document.getElementById('repairResults');
  if (!container) return;
  var fixes = [];
  var warnings = [];

  // Fix 1: Remove fees with no valid student
  var validStudentIds = data.students.map(function(s) { return s.id; });
  var orphanFees = data.fees.filter(function(f) { return !validStudentIds.includes(f.studentId); });
  if (orphanFees.length) {
    data.fees = data.fees.filter(function(f) { return validStudentIds.includes(f.studentId); });
    fixes.push('Removed ' + orphanFees.length + ' orphaned fee record(s)');
  }

  // Fix 2: Remove results with no valid student
  var orphanResults = data.results.filter(function(r) { return !validStudentIds.includes(r.studentId); });
  if (orphanResults.length) {
    data.results = data.results.filter(function(r) { return validStudentIds.includes(r.studentId); });
    fixes.push('Removed ' + orphanResults.length + ' orphaned result(s)');
  }

  // Fix 3: Remove CAT with no valid student
  var orphanCat = data.cat.filter(function(c) { return !validStudentIds.includes(c.studentId); });
  if (orphanCat.length) {
    data.cat = data.cat.filter(function(c) { return validStudentIds.includes(c.studentId); });
    fixes.push('Removed ' + orphanCat.length + ' orphaned CAT record(s)');
  }

  // Fix 4: Remove attendance with no valid student
  var orphanAtt = data.attendance.filter(function(a) { return !validStudentIds.includes(a.studentId); });
  if (orphanAtt.length) {
    data.attendance = data.attendance.filter(function(a) { return validStudentIds.includes(a.studentId); });
    fixes.push('Removed ' + orphanAtt.length + ' orphaned attendance record(s)');
  }

  // Fix 5: Check students without stream (SSS only)
  data.students.forEach(function(s) {
    var tier = getClassTier(s.class);
    if (tier === 'seniorSecondary' && !s.stream) {
      warnings.push(s.name + ' (' + s.id + ') has no stream assigned');
    }
  });

  // Fix 6: Students without credentials
  data.students.forEach(function(s) {
    if (!s.username || !s.password) {
      s.username = s.username || s.name.toLowerCase().replace(/\s+/g, '.');
      s.password = s.password || s.id.toLowerCase();
      fixes.push('Auto-generated credentials for ' + s.name + ' (' + s.id + ')');
    }
  });

  // Fix 7: Normalize status values in paymentTransactions
  var paymentFix = 0;
  (data.paymentTransactions || []).forEach(function(pt) {
    if (pt.status === 'completed') { pt.status = 'successful'; paymentFix++; }
  });
  if (paymentFix) fixes.push('Normalized ' + paymentFix + ' payment status(es)');

  // Fix 8: Clean up duplicate exam registrations
  if (data.examRegistrations && data.examRegistrations.length) {
    var seen = {};
    var dupCount = 0;
    data.examRegistrations = data.examRegistrations.filter(function(r) {
      var key = r.examType + '|' + r.studentId;
      if (seen[key]) { dupCount++; return false; }
      seen[key] = true;
      return true;
    });
    if (dupCount) fixes.push('Removed ' + dupCount + ' duplicate exam registration(s)');
  }

  saveData();

  var html = '';
  if (fixes.length) {
    html += '<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:16px;margin-bottom:12px;">';
    html += '<p style="font-weight:600;color:#22543d;margin-bottom:8px;"><i class="fas fa-tools"></i> ' + fixes.length + ' Fix(es) Applied</p>';
    html += fixes.map(function(f) { return '<p style="font-size:13px;color:#276749;padding:2px 0;">✓ ' + htmlEscape(f) + '</p>'; }).join('');
    html += '</div>';
  }
  if (warnings.length) {
    html += '<div style="background:#fffff0;border:1px solid #fefcbf;border-radius:8px;padding:16px;margin-bottom:12px;">';
    html += '<p style="font-weight:600;color:#744210;margin-bottom:8px;"><i class="fas fa-exclamation-triangle"></i> ' + warnings.length + ' Warning(s)</p>';
    html += warnings.map(function(w) { return '<p style="font-size:13px;color:#975a16;padding:2px 0;">⚠ ' + htmlEscape(w) + '</p>'; }).join('');
    html += '</div>';
  }
  if (!fixes.length && !warnings.length) {
    html = '<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:16px;"><p style="font-weight:600;color:#22543d;"><i class="fas fa-check-circle"></i> No issues found. Data integrity is good.</p></div>';
  }

  container.innerHTML = html;
  if (fixes.length) toast(fixes.length + ' issue(s) fixed', 'success');
  else if (warnings.length) toast(warnings.length + ' warning(s) found', 'warning');
  else toast('Data integrity check passed', 'success');
}

// ===== 6. SYSTEM ADMIN PANEL =====
function renderSystemPanel() {
  var container = document.getElementById('admin-system');
  if (!container) return;
  container.innerHTML =
    '<div style="margin-bottom:24px;">' +
      '<h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-cogs"></i> System Tools</h2>' +
      '<p style="color:var(--text-light);">Backup, restore, search, data repair, and session management</p>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">' +
      '<div class="card" style="padding:24px;cursor:pointer;" onclick="showDataBackup()" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<div style="font-size:36px;color:#38a169;margin-bottom:12px;"><i class="fas fa-database"></i></div>' +
        '<h4 style="font-weight:600;font-size:15px;margin-bottom:4px;">Backup & Restore</h4>' +
        '<p style="font-size:13px;color:var(--text-light);">Export all data as JSON or import a previous backup</p>' +
      '</div>' +
      '<div class="card" style="padding:24px;cursor:pointer;" onclick="showGlobalSearch()" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<div style="font-size:36px;color:#3182ce;margin-bottom:12px;"><i class="fas fa-search"></i></div>' +
        '<h4 style="font-weight:600;font-size:15px;margin-bottom:4px;">Global Search</h4>' +
        '<p style="font-size:13px;color:var(--text-light);">Search across students, teachers, results, and messages</p>' +
      '</div>' +
      '<div class="card" style="padding:24px;cursor:pointer;" onclick="showDataRepair()" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<div style="font-size:36px;color:#d69e2e;margin-bottom:12px;"><i class="fas fa-tools"></i></div>' +
        '<h4 style="font-weight:600;font-size:15px;margin-bottom:4px;">Data Repair</h4>' +
        '<p style="font-size:13px;color:var(--text-light);">Check and fix orphaned records, stale references</p>' +
      '</div>' +
      '<div class="card" style="padding:24px;cursor:pointer;" onclick="showSessionSettings()" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<div style="font-size:36px;color:#805ad5;margin-bottom:12px;"><i class="fas fa-clock"></i></div>' +
        '<h4 style="font-weight:600;font-size:15px;margin-bottom:4px;">Session Settings</h4>' +
        '<p style="font-size:13px;color:var(--text-light);">Configure auto-logout inactivity timeout</p>' +
      '</div>' +
      '<div class="card" style="padding:24px;cursor:pointer;" onclick="showDataStats()" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
        '<div style="font-size:36px;color:#e53e3e;margin-bottom:12px;"><i class="fas fa-chart-pie"></i></div>' +
        '<h4 style="font-weight:600;font-size:15px;margin-bottom:4px;">Data Statistics</h4>' +
        '<p style="font-size:13px;color:var(--text-light);">View storage size, record counts, and system health</p>' +
      '</div>' +
    '</div>';
}

function showDataStats() {
  var size = new Blob([JSON.stringify(data)]).size;
  var kb = (size / 1024).toFixed(1);
  var counts = {
    Students: data.students.length,
    Teachers: data.teachers.length,
    Parents: data.parents.length,
    Fees: data.fees.length,
    Results: data.results.length,
    CAT: data.cat.length,
    Attendance: data.attendance.length,
    Messages: data.messages.length,
    ExamRegs: (data.examRegistrations || []).length,
    Activities: data.activities.length,
    Library: data.library.length,
    Forum: data.forumPosts.length,
    SimQuestions: (data.simQuestions || []).length,
    SimAttempts: (data.simAttempts || []).length,
    CustomReports: (data.customReports || []).length,
    ActivityScores: (data.activityScores || []).length,
    Alumni: (data.alumni || []).length,
    Reunions: (data.reunions || []).length,
    Donations: (data.donations || []).length
  };
  openModal(`
    <h3><i class="fas fa-chart-pie"></i> Data Statistics</h3>
    <div style="margin:16px 0;">
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;padding:12px;background:#ebf8ff;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#2b6cb0;">${kb}</div>
          <div style="font-size:12px;color:#2b6cb0;">KB Stored</div>
        </div>
        <div style="flex:1;min-width:120px;padding:12px;background:#f0fff4;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#276749;">${Object.keys(data).length}</div>
          <div style="font-size:12px;color:#276749;">Data Arrays</div>
        </div>
        <div style="flex:1;min-width:120px;padding:12px;background:#fefcbf;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#744210;">${data.students.length + data.teachers.length + data.parents.length}</div>
          <div style="font-size:12px;color:#744210;">Total People</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
        ${Object.entries(counts).map(function(kv) {
          var c = kv[0] === 'Students' ? '#3182ce' : kv[0] === 'Teachers' ? '#38a169' : kv[0] === 'Results' ? '#805ad5' : '#718096';
          return '<div style="padding:8px 12px;background:#f7fafc;border-radius:6px;display:flex;justify-content:space-between;font-size:13px;">' +
            '<span>' + kv[0] + '</span><strong style="color:' + c + ';">' + kv[1] + '</strong></div>';
        }).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `);
}

// ===== 7. KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    if (typeof showGlobalSearch === 'function') showGlobalSearch();
  }
  if (e.ctrlKey && e.key === 'b' && e.shiftKey) {
    e.preventDefault();
    if (typeof showDataBackup === 'function') showDataBackup();
  }
});

// ===== 8. OFFLINE DETECTION =====
function updateConnectionStatus() {
  var online = navigator.onLine;
  var banner = document.getElementById('offlineBanner');
  if (banner) banner.style.display = online ? 'none' : 'flex';
  var indicators = document.querySelectorAll('.conn-status');
  indicators.forEach(function(el) {
    el.title = online ? 'Connected' : 'Offline';
    el.innerHTML = online ? '<i class="fas fa-circle" style="color:#22c55e;font-size:10px;"></i>' : '<i class="fas fa-circle" style="color:#ef4444;font-size:10px;animation:pulse 1.5s infinite;"></i>';
  });
}
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();
