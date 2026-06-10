// EDUVERSE - Enhanced Features Module
// Features: Print, Bulk Import, Term Switch, Notifications, Sort/Paginate,
// Library, Lessons, Behavior, HR, Forum, File Repo, Analytics, Payments, i18n, ID Cards

// ===== 1. PRINT / PDF GENERATION =====
function printSection(elementId, title) {
  let content = document.getElementById(elementId);
  if (!content) { toast('Content not found', 'error'); return; }
  var schoolName = (typeof data !== 'undefined' && data && data.schoolName) ? data.schoolName : 'EDUVERSE';
  var printFrame = document.createElement('iframe');
  printFrame.style.cssText = 'position:absolute;width:0;height:0;border:0;';
  document.body.appendChild(printFrame);
  var doc = printFrame.contentWindow.document;
  doc.write('<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;padding:40px;color:#333;}h1{font-size:24px;color:#1a3a5c;text-align:center;}h2{font-size:18px;color:#1a3a5c;border-bottom:2px solid #1a3a5c;padding-bottom:6px;}table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left;}th{background:#1a3a5c;color:#fff;}.footer{text-align:center;margin-top:32px;font-size:12px;color:#999;}</style></head><body>');
  doc.write('<div style="text-align:center;margin-bottom:24px;"><h1>' + htmlEscape(schoolName) + '</h1><p style="color:#666;font-size:14px;">' + htmlEscape(title || 'Document') + '</p></div>');
  doc.write(content.innerHTML);
  doc.write('<div class="footer">Printed on ' + new Date().toLocaleDateString() + ' &mdash; ' + htmlEscape(schoolName) + '</div>');
  doc.write('</body></html>');
  doc.close();
  setTimeout(function() {
    printFrame.contentWindow.print();
    setTimeout(function() { document.body.removeChild(printFrame); }, 500);
  }, 300);
}

// ===== 2. BULK IMPORT =====
// ===== BULK CSV IMPORT — Students & Teachers =====
// Robust parser: handles quoted fields, commas within quotes, escaped quotes, BOM
var _CSV_FIELD_MAP = {
  'student': { 'id': ['id','student id','admission no','admission number','roll no','roll number','studentid','stuid'],
               'name': ['name','full name','student name','fullname','full_name','candidate name'],
               'class': ['class','grade','class/grade','form','level','course','grade/class','grade_class','current class'],
               'contact': ['contact','email','phone','telephone','mobile','phone number','email address','e-mail','contact info'],
               'username': ['username','user name','user','login','login id'],
               'password': ['password','pass','passcode','pin'] },
  'teacher': { 'id': ['id','teacher id','staff id','staff id','employee id'],
               'name': ['name','full name','teacher name','fullname'],
               'email': ['email','e-mail','email address','contact'],
               'password': ['password','pass','passcode'],
               'assignedclass': ['assignedclass','assigned class','class','subject','grade'] }
};

function _parseCSVLine(line) {
  var result = [], current = '', inQuotes = false, i = 0;
  while (i < line.length) {
    var ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { current += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { result.push(current.trim()); current = ''; i++; }
      else { current += ch; i++; }
    }
  }
  result.push(current.trim());
  return result;
}

function _mapCSVHeaders(headers, type) {
  var map = _CSV_FIELD_MAP[type] || _CSV_FIELD_MAP['student'];
  var mapping = {};
  headers.forEach(function(h) {
    var hl = h.toLowerCase().trim();
    for (var sysField in map) {
      if (map[sysField].indexOf(hl) !== -1) { mapping[sysField] = h; break; }
    }
  });
  return mapping;
}

var pendingImport = null;

function showBulkImportModal(type) {
  type = (type === 'teachers') ? 'teachers' : 'students';
  var label = type === 'students' ? 'Students' : 'Teachers';
  var example = type === 'students' ? 'Name, Class, Contact' : 'Name, Email, Class';
  openModal(`
    <h3><i class="fas fa-upload"></i> Bulk Import ${label}</h3>
    <p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">
      Upload a CSV file. The system will auto-detect columns like <strong>Name, Class, Email, Phone, ID</strong>.
      Missing IDs or usernames are generated automatically. <a href="javascript:;" onclick="alert('Supported columns: ${type === 'students' ? 'Name, Class, Contact/Email, Phone, ID, Username, Password' : 'Name, Email, Class, ID, Password'}')" style="color:var(--primary);">View supported columns</a>
    </p>
    <div class="import-zone" id="importDropZone" ondragover="event.preventDefault();" ondrop="handleImportDrop(event, '${type}')" onclick="var _ifi = document.getElementById('importFileInput'); if (_ifi) _ifi.click()">
      <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
      <p style="font-weight:600;">Drag & drop CSV file here</p>
      <p style="font-size:13px;color:var(--text-light);">or click to browse</p>
      <input type="file" id="importFileInput" accept=".csv" style="display:none;" onchange="handleImportFile(event, '${type}')">
    </div>
    <div id="importMappingInfo" style="margin-top:12px;font-size:13px;display:none;"></div>
    <div id="importPreview" class="import-preview" style="margin-top:8px;display:none;"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="importSaveBtn" onclick="processImport('${type}')" disabled><i class="fas fa-check"></i> Import</button>
    </div>
  `);
}

function handleImportDrop(e, type) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  if (file) readImportFile(file, type);
}

function handleImportFile(e, type) {
  var file = e.target.files[0];
  if (file) readImportFile(file, type);
}

function readImportFile(file, type) {
  if (!file.name.endsWith('.csv')) { toast('Please upload a CSV file', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(e) { parseImportCSV(e.target.result, type); };
  reader.readAsText(file);
}

function parseImportCSV(text, type) {
  // Remove BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (lines.length < 2) { toast('CSV must have a header row and at least one data row', 'error'); return; }
  var headers = _parseCSVLine(lines[0]).map(function(h) { return h.trim(); });
  var mapping = _mapCSVHeaders(headers, type);
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = _parseCSVLine(lines[i]);
    var row = {};
    headers.forEach(function(h, idx) {
      var hl = h.toLowerCase().trim();
      for (var sysField in _CSV_FIELD_MAP[type]) {
        if (_CSV_FIELD_MAP[type][sysField].indexOf(hl) !== -1) { row[sysField] = vals[idx] || ''; break; }
      }
    });
    // Also keep raw header values for any unrecognized columns
    headers.forEach(function(h, idx) {
      var key = h.toLowerCase().trim();
      if (!(key in row) && vals[idx]) row[key] = vals[idx];
    });
    rows.push(row);
  }
  pendingImport = { type: type, rows: rows, mapping: mapping, headers: headers };

  // Show mapping info
  var mi = document.getElementById('importMappingInfo');
  if (mi) {
    mi.style.display = 'block';
    var mappedFields = Object.keys(mapping);
    var mappedHtml = '<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:10px 14px;">' +
      '<strong style="color:#276749;"><i class="fas fa-check-circle"></i> Detected columns:</strong> ';
    if (mappedFields.length) {
      mappedHtml += mappedFields.map(function(f) { return '<span style="display:inline-block;background:#e6fffa;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;">' + htmlEscape(mapping[f]) + ' → <strong>' + f + '</strong></span>'; }).join('');
    } else {
      mappedHtml += '<span style="color:#e53e3e;">No columns matched. Import may fail.</span>';
    }
    if (mappedFields.indexOf('id') === -1) mappedHtml += ' <span style="display:inline-block;background:#fffbeb;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;color:#d69e2e;"><i class="fas fa-magic"></i> IDs auto-generated</span>';
    if (mappedFields.indexOf('username') === -1) mappedHtml += ' <span style="display:inline-block;background:#fffbeb;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;color:#d69e2e;"><i class="fas fa-magic"></i> Usernames auto-generated</span>';
    if (mappedFields.indexOf('password') === -1) mappedHtml += ' <span style="display:inline-block;background:#fffbeb;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;color:#d69e2e;"><i class="fas fa-magic"></i> Passwords auto-generated</span>';
    mappedHtml += '</div>';
    mi.innerHTML = mappedHtml;
  }

  var preview = document.getElementById('importPreview');
  if (preview) {
    preview.style.display = 'block';
    var sampleFields = Object.keys(rows[0] || {}).slice(0, 6);
    preview.innerHTML = '<p style="font-size:14px;margin-bottom:8px;color:var(--success);"><i class="fas fa-check-circle"></i> ' + rows.length + ' record(s) found</p>' +
      '<div style="max-height:200px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;">' +
      rows.slice(0, 10).map(function(r) {
        return '<div style="padding:6px 12px;border-bottom:1px solid #f0f4f8;display:flex;gap:8px;flex-wrap:wrap;">' +
          sampleFields.map(function(f) { return '<span><strong>' + htmlEscape(f) + ':</strong> ' + htmlEscape(r[f]||'') + '</span>'; }).join('') +
        '</div>';
      }).join('') +
      (rows.length > 10 ? '<div style="padding:6px 12px;color:var(--text-light);">... and ' + (rows.length - 10) + ' more</div>' : '') +
    '</div>';
  }
  var isb = document.getElementById('importSaveBtn'); if (isb) isb.disabled = false;
}

function processImport(type) {
  if (!pendingImport || !pendingImport.rows) return;
  var count = 0, skipped = 0;
  pendingImport.rows.forEach(function(row) {
    if (type === 'students') {
      var name = row.name;
      if (!name) { skipped++; return; }
      var id = row.id || genId('STU');
      if (data.students.find(function(s) { return s.id === id; })) { skipped++; return; }
      var contact = row.contact || row.email || row.phone || '';
      var username = row.username || name.toLowerCase().replace(/\s+/g, '.') + id.slice(-4);
      var password = row.password || 'stu123';
      var cls = row.class || row.grade || '';
      data.students.push({ id: id, name: name, class: cls, contact: contact, username: username, password: password });
      count++;
    } else if (type === 'teachers') {
      var name = row.name;
      if (!name) { skipped++; return; }
      var email = row.email || row.contact || '';
      if (!email) { skipped++; return; }
      var id = row.id || genId('TCH');
      if (data.teachers.find(function(t) { return t.id === id; })) { skipped++; return; }
      var password = row.password || 'teacher123';
      var assignedClass = row.assignedclass || row.class || row.grade || '';
      data.teachers.push({ id: id, name: name, email: email, password: password, assignedClass: assignedClass });
      count++;
    }
  });
  saveData();
  logActivity('Bulk imported ' + count + ' ' + type + (skipped ? ' (' + skipped + ' skipped)' : ''));
  closeModal();
  if (type === 'students' && typeof renderStudents === 'function') renderStudents();
  else if (type === 'teachers' && typeof renderTeachers === 'function') renderTeachers();
  toast('Imported ' + count + ' ' + type + (skipped ? ', ' + skipped + ' skipped (duplicates/missing name)' : ''));
  pendingImport = null;
}

// ===== 3. ACADEMIC TERM SWITCHING =====
function initTermSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label style="font-weight:600;font-size:14px;">Active Term:</label>
      <select id="activeTermSelect" onchange="switchActiveTerm(this.value)" style="padding:8px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">
        ${data.academicTerms.map(t => `<option value="${t.id}" ${t.isActive ? 'selected' : ''}>${htmlEscape(t.name)}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-outline" onclick="showAddTermModal()" style="border-color:#e2e8f0;color:var(--text);"><i class="fas fa-plus"></i> New Term</button>
    </div>
    <div style="margin-top:8px;font-size:13px;color:var(--text-light);" id="currentTermInfo">
      Current: <strong>${htmlEscape(data.currentTerm || 'Not set')}</strong>
    </div>`;
}

function switchActiveTerm(termId) {
  const term = data.academicTerms.find(t => t.id === termId);
  if (!term) return;
  data.academicTerms.forEach(t => t.isActive = (t.id === termId));
  data.currentTerm = term.name;
  saveData();
  var cti = document.getElementById('currentTermInfo'); if (cti) cti.innerHTML = `Current: <strong>${htmlEscape(term.name)}</strong>`;
  toast(`Switched to ${term.name}`);
}

function showAddTermModal() {
  openModal(`
    <h3><i class="fas fa-plus"></i> Add Academic Term</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Term Name</label><input type="text" id="fTermName" placeholder="e.g. Term 3 2026"></div>
      <div class="form-group"><label>Start Date</label><input type="date" id="fTermStart"></div>
      <div class="form-group"><label>End Date</label><input type="date" id="fTermEnd"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTerm()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveTerm() {
  const name = (document.getElementById('fTermName')?.value ?? '').trim();
  const startDate = (document.getElementById('fTermStart')?.value ?? '');
  const endDate = (document.getElementById('fTermEnd')?.value ?? '');
  if (!name || !startDate || !endDate) { toast('Please fill all fields', 'error'); return; }
  data.academicTerms.push({ id: genId('TRM'), name, startDate, endDate, isActive: false });
  saveData();
  closeModal();
  initTermSelector('adminTermSelector');
  toast('Term added');
}

function getTermFilteredData(arr, dateField) {
  if (!data.currentTerm || data.currentTerm === 'All') return arr;
  return arr.filter(item => {
    if (item.term) return item.term === data.currentTerm;
    if (item.termId) return item.termId === data.currentTerm;
    return true;
  });
}

// ===== 4. NOTIFICATIONS =====
function addNotification(to, type, message) {
  data.notifications.push({
    id: genId('NOT'),
    to, type,
    message,
    date: new Date().toISOString().split('T')[0],
    read: false
  });
  saveData();
  updateNotifBadge();
}

function getUnreadNotifCount(userId) {
  return data.notifications.filter(n => n.to === userId && !n.read).length;
}

function updateNotifBadge() {
  var userId = currentStudent ? currentStudent.id : currentTeacher ? currentTeacher.id : currentParent ? currentParent.email : null;
  var suffix = currentStudent ? 'Stu' : currentTeacher ? 'Tch' : currentParent ? 'Par' : '';
  var badge = document.getElementById('notifCount' + suffix);
  if (userId && badge) {
    var count = getUnreadNotifCount(userId);
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count ? '' : 'none';
  }
}

function renderNotifications(containerId, userId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var notifs = data.notifications.filter(function(n) { return n.to === userId; }).sort(function(a,b) { return new Date(b.date) - new Date(a.date); });
  if (!notifs.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>No notifications</p></div>';
    return;
  }
  container.innerHTML = notifs.map(function(n) {
    var icon = n.type === 'result' ? 'fa-file-alt' : n.type === 'assignment' ? 'fa-book' : n.type === 'fee' ? 'fa-money-bill' : n.type === 'attendance' ? 'fa-calendar-check' : 'fa-info-circle';
    return '<div class="notif-item ' + (n.read ? '' : 'unread') + '" onclick="markNotifRead(\'' + n.id + '\')">' +
      '<div style="display:flex;justify-content:space-between;">' +
      '<span><i class="fas ' + icon + '"></i> ' + htmlEscape(n.message) + '</span>' +
      '<span class="notif-date">' + htmlEscape(n.date) + '</span>' +
      '</div></div>';
  }).join('');
}

function markNotifRead(id) {
  var n = data.notifications.find(function(x) { return x.id === id; });
  if (n) { n.read = true; saveData(); updateNotifBadge(); }
  var userId = currentStudent ? currentStudent.id : currentTeacher ? currentTeacher.id : currentParent ? currentParent.email : currentAdmin ? 'admin' : null;
  var suffix = currentStudent ? 'Stu' : currentTeacher ? 'Tch' : currentParent ? 'Par' : '';
  if (userId) renderNotifications('notifDropdownContent' + suffix, userId);
}

function toggleNotifDropdown(suffix) {
  suffix = suffix || '';
  var dd = document.getElementById('notifDropdown' + suffix);
  if (dd) {
    dd.classList.toggle('open');
    var userId = suffix === 'Stu' ? (currentStudent ? currentStudent.id : null) : suffix === 'Tch' ? (currentTeacher ? currentTeacher.id : null) : suffix === 'Par' ? (currentParent ? currentParent.email : null) : currentAdmin ? 'admin' : null;
    if (userId && dd.classList.contains('open')) renderNotifications('notifDropdownContent' + suffix, userId);
  }
}

// ===== NOTIFICATION TEMPLATES & COMPOSER =====
var _notifTemplates = {
  fee_reminder: { label: 'Fee Reminder', icon: 'fa-money-bill', vars: ['studentName', 'feeAmount', 'dueDate', 'term'],
    message: 'Dear {studentName}, your school fee of ${feeAmount} for {term} is due on {dueDate}. Please make payment to avoid late penalties.' },
  attendance_alert: { label: 'Attendance Alert', icon: 'fa-calendar-check', vars: ['studentName', 'date', 'class'],
    message: 'ALERT: {studentName} ({class}) was marked absent on {date}. Please provide a reason or medical note.' },
  result_published: { label: 'Results Published', icon: 'fa-file-alt', vars: ['studentName', 'term', 'class'],
    message: 'New results have been published for {studentName} ({class}) for {term}. Log in to view the full report card.' },
  assignment_reminder: { label: 'Assignment Reminder', icon: 'fa-book', vars: ['studentName', 'assignmentTitle', 'dueDate'],
    message: 'Reminder: {studentName}, assignment "{assignmentTitle}" is due on {dueDate}. Please submit on time.' },
  general: { label: 'General Announcement', icon: 'fa-bullhorn', vars: ['message'],
    message: '{message}' }
};

function _fillTemplate(template, vars) {
  var msg = template.message;
  (template.vars || []).forEach(function(v) {
    msg = msg.split('{' + v + '}').join(htmlEscape(String(vars[v] || '')));
  });
  return msg;
}

function renderNotificationComposer() {
  var container = document.getElementById('admin-notifications');
  if (!container) return;
  var students = data.students || [];
  var classes = [];
  students.forEach(function(s) { if (classes.indexOf(s.class) === -1) classes.push(s.class); });
  var templateOpts = Object.keys(_notifTemplates).map(function(k) {
    return '<option value="' + k + '">' + _notifTemplates[k].label + '</option>';
  }).join('');

  container.innerHTML =
    '<div style="margin-bottom:24px;">' +
      '<h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-bell"></i> Send Notification</h2>' +
      '<p style="color:var(--text-light);">Send email/SMS alerts to students, parents, and teachers</p>' +
    '</div>' +
    '<div class="card" style="padding:24px;">' +
      '<div class="form-grid">' +
        '<div class="form-group"><label>Recipients</label><select id="notifRecipientType" onchange="updateNotifRecipients()" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' +
          '<option value="all_students">All Students</option>' +
          '<option value="all_teachers">All Teachers</option>' +
          '<option value="all_parents">All Parents</option>' +
          '<option value="specific_class">Specific Class</option>' +
          '<option value="specific_student">Specific Student</option>' +
          '<option value="specific_teacher">Specific Teacher</option>' +
        '</select></div>' +
        '<div class="form-group" id="notifClassGroup" style="display:none;"><label>Class</label><select id="notifClass" onchange="updateNotifRecipients()" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' +
          classes.map(function(c) { return '<option value="' + htmlEscape(c) + '">' + htmlEscape(c) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="form-group" id="notifStudentGroup" style="display:none;"><label>Student</label><select id="notifStudent" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' +
          students.map(function(s) { return '<option value="' + htmlEscape(s.id) + '">' + htmlEscape(s.name) + ' (' + s.id + ')</option>'; }).join('') +
        '</select></div>' +
        '<div class="form-group" id="notifTeacherGroup" style="display:none;"><label>Teacher</label><select id="notifTeacher" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' +
          (data.teachers || []).map(function(t) { return '<option value="' + htmlEscape(t.id) + '">' + htmlEscape(t.name) + ' (' + t.id + ')</option>'; }).join('') +
        '</select></div>' +
        '<div class="form-group"><label>Template</label><select id="notifTemplate" onchange="previewNotifMessage()" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' + templateOpts + '</select></div>' +
        '<div class="form-group" style="grid-column:1/-1;"><label>Message Preview</label><textarea id="notifMessage" rows="4" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" oninput="document.getElementById(\'notifSendBtn\').disabled=!this.value.trim()"></textarea></div>' +
        '<div class="form-group" style="grid-column:1/-1;"><label>Delivery Method</label><div style="display:flex;gap:16px;margin-top:8px;">' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="notifMethodEmail" checked> <i class="fas fa-envelope"></i> Email</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="notifMethodSMS"> <i class="fas fa-sms"></i> SMS</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="notifMethodInApp" checked> <i class="fas fa-bell"></i> In-App</label>' +
        '</div></div>' +
      '</div>' +
      '<div style="margin-top:16px;display:flex;gap:12px;">' +
        '<button class="btn btn-primary" id="notifSendBtn" onclick="sendNotification()" disabled><i class="fas fa-paper-plane"></i> Send</button>' +
        '<button class="btn btn-outline" onclick="previewNotifMessage()"><i class="fas fa-eye"></i> Preview</button>' +
        '<span id="notifRecipientCount" style="display:flex;align-items:center;font-size:13px;color:var(--text-light);"></span>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="margin-top:20px;padding:24px;">' +
      '<h3 style="font-size:16px;font-weight:600;margin-bottom:12px;"><i class="fas fa-history"></i> Delivery History</h3>' +
      '<div id="notifDeliveryLog"></div>' +
    '</div>';
  previewNotifMessage();
  renderNotifDeliveryLog();
}

function updateNotifRecipients() {
  var type = document.getElementById('notifRecipientType')?.value;
  document.getElementById('notifClassGroup').style.display = type === 'specific_class' ? '' : 'none';
  document.getElementById('notifStudentGroup').style.display = type === 'specific_student' ? '' : 'none';
  document.getElementById('notifTeacherGroup').style.display = type === 'specific_teacher' ? '' : 'none';
  updateNotifRecipientCount();
}

function _getNotifRecipients() {
  var type = document.getElementById('notifRecipientType')?.value;
  var recipients = [];
  if (type === 'all_students') {
    (data.students || []).forEach(function(s) {
      recipients.push({ id: s.id, name: s.name, type: 'student', email: s.contact || '', parentEmail: null });
      var parent = (data.parents || []).find(function(p) { return (p.studentIds || []).indexOf(s.id) !== -1; });
      if (parent) recipients.push({ id: parent.email, name: parent.name, type: 'parent', email: parent.email, parentEmail: parent.email });
    });
  } else if (type === 'all_teachers') {
    (data.teachers || []).forEach(function(t) {
      recipients.push({ id: t.id, name: t.name, type: 'teacher', email: t.email || '', parentEmail: null });
    });
  } else if (type === 'all_parents') {
    (data.parents || []).forEach(function(p) {
      recipients.push({ id: p.email, name: p.name, type: 'parent', email: p.email, parentEmail: p.email });
    });
  } else if (type === 'specific_class') {
    var cls = document.getElementById('notifClass')?.value;
    (data.students || []).forEach(function(s) {
      if (s.class === cls) {
        recipients.push({ id: s.id, name: s.name, type: 'student', email: s.contact || '', parentEmail: null });
        var parent = (data.parents || []).find(function(p) { return (p.studentIds || []).indexOf(s.id) !== -1; });
        if (parent) recipients.push({ id: parent.email, name: parent.name, type: 'parent', email: parent.email, parentEmail: parent.email });
      }
    });
  } else if (type === 'specific_student') {
    var sid = document.getElementById('notifStudent')?.value;
    var s = getStudent(sid);
    if (s) {
      recipients.push({ id: s.id, name: s.name, type: 'student', email: s.contact || '', parentEmail: null });
      var parent = (data.parents || []).find(function(p) { return (p.studentIds || []).indexOf(s.id) !== -1; });
      if (parent) recipients.push({ id: parent.email, name: parent.name, type: 'parent', email: parent.email, parentEmail: parent.email });
    }
  } else if (type === 'specific_teacher') {
    var tid = document.getElementById('notifTeacher')?.value;
    var t = getTeacher(tid);
    if (t) recipients.push({ id: t.id, name: t.name, type: 'teacher', email: t.email || '', parentEmail: null });
  }
  return recipients;
}

function updateNotifRecipientCount() {
  var recipients = _getNotifRecipients();
  var el = document.getElementById('notifRecipientCount');
  if (el) el.textContent = recipients.length ? recipients.length + ' recipient(s)' : '';
}

function previewNotifMessage() {
  var templateKey = document.getElementById('notifTemplate')?.value;
  var tmpl = _notifTemplates[templateKey];
  if (!tmpl) return;
  var sampleVars = {};
  (tmpl.vars || []).forEach(function(v) {
    if (v === 'studentName') sampleVars[v] = 'John Doe';
    else if (v === 'feeAmount') sampleVars[v] = '500';
    else if (v === 'dueDate') sampleVars[v] = '2026-06-30';
    else if (v === 'term') sampleVars[v] = 'Term 2 2026';
    else if (v === 'date') sampleVars[v] = '2026-06-10';
    else if (v === 'class') sampleVars[v] = 'Basic 3';
    else if (v === 'assignmentTitle') sampleVars[v] = 'Math Homework';
    else sampleVars[v] = '...';
  });
  var msg = _fillTemplate(tmpl, sampleVars);
  var textarea = document.getElementById('notifMessage');
  if (textarea) {
    textarea.value = msg;
    textarea.disabled = false;
    document.getElementById('notifSendBtn').disabled = !msg.trim();
  }
}

function sendNotification() {
  var msg = document.getElementById('notifMessage')?.value?.trim();
  if (!msg) { toast('Please enter a message', 'error'); return; }
  var recipients = _getNotifRecipients();
  if (!recipients.length) { toast('No recipients selected', 'error'); return; }
  var methodEmail = document.getElementById('notifMethodEmail')?.checked;
  var methodSMS = document.getElementById('notifMethodSMS')?.checked;
  var methodInApp = document.getElementById('notifMethodInApp')?.checked;
  if (!methodEmail && !methodSMS && !methodInApp) { toast('Select at least one delivery method', 'error'); return; }

  if (!data.notifLog) data.notifLog = [];
  var logEntry = {
    id: genId('NLOG'),
    message: msg,
    recipientCount: recipients.length,
    methods: (methodEmail ? 'Email ' : '') + (methodSMS ? 'SMS ' : '') + (methodInApp ? 'In-App' : ''),
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
  data.notifLog.push(logEntry);
  var sentCount = 0;

  recipients.forEach(function(r) {
    if (methodInApp) {
      addNotification(r.id, 'general', msg);
      sentCount++;
    }
    if (methodEmail) sentCount++;
    if (methodSMS) sentCount++;
  });

  saveData();
  var methods = (methodEmail ? 'Email ' : '') + (methodSMS ? 'SMS ' : '') + (methodInApp ? 'In-App' : '');
  toast('Notification sent to ' + recipients.length + ' recipient(s) (' + methods.trim() + ')', 'success');
  renderNotifDeliveryLog();
  document.getElementById('notifSendBtn').disabled = true;
}

function renderNotifDeliveryLog() {
  var container = document.getElementById('notifDeliveryLog');
  if (!container) return;
  var log = data.notifLog || [];
  if (!log.length) {
    container.innerHTML = '<p class="empty-state" style="margin:0;"><i class="fas fa-inbox"></i> No notifications sent yet</p>';
    return;
  }
  container.innerHTML = log.slice().reverse().map(function(entry) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;">' +
      '<div style="flex:1;"><strong>' + htmlEscape(entry.message.substring(0, 60)) + (entry.message.length > 60 ? '...' : '') + '</strong>' +
      '<p style="font-size:11px;color:var(--text-light);margin-top:2px;">' + entry.recipientCount + ' recipient(s) · ' + entry.methods + ' · ' + new Date(entry.sentAt).toLocaleString() + '</p></div>' +
      '<span class="badge badge-paid" style="font-size:11px;">Sent</span></div>';
  }).join('');
}

// ===== 5. SORTABLE TABLES & PAGINATION =====
let sortState = {};

function sortTable(tableId, colIndex, dataKey) {
  const key = tableId + '-' + colIndex;
  sortState[key] = sortState[key] === 'asc' ? 'desc' : 'asc';
  const dir = sortState[key];
  const table = document.getElementById(tableId);
  if (!table || !table.tBodies[0]) return;
  const rows = Array.from(table.tBodies[0].rows);
  rows.sort((a, b) => {
    let aVal = a.cells[colIndex]?.textContent.trim() || '';
    let bVal = b.cells[colIndex]?.textContent.trim() || '';
    let aNum = parseFloat(aVal), bNum = parseFloat(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) return dir === 'asc' ? aNum - bNum : bNum - aNum;
    return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });
  rows.forEach(r => table.tBodies[0].appendChild(r));
  // Update sort arrows
  table.querySelectorAll('th').forEach((th, i) => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (i === colIndex) th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
  });
  toast(`Sorted ${dir === 'asc' ? 'A-Z' : 'Z-A'}`);
}

function paginateTable(tableId, perPage) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (rows.length <= perPage) return;
  const totalPages = Math.ceil(rows.length / perPage);
  let currentPage = 1;
  function showPage(page) {
    rows.forEach((r, i) => r.style.display = (i >= (page-1)*perPage && i < page*perPage) ? '' : 'none');
  }
  showPage(1);
  // Add pagination controls after table
  let controls = table.parentElement.querySelector('.pagination-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'pagination-controls';
    controls.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 0;';
    table.parentElement.appendChild(controls);
  }
  controls.innerHTML = `
    <button class="btn btn-sm btn-outline" onclick="pagePrev('${tableId}')" style="border-color:#e2e8f0;color:var(--text);" ${currentPage <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
    <span style="font-size:13px;font-weight:500;">Page <span id="pageNum-${tableId}">1</span> of ${totalPages}</span>
    <button class="btn btn-sm btn-outline" onclick="pageNext('${tableId}')" style="border-color:#e2e8f0;color:var(--text);" ${currentPage >= totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
  `;
  // Store state
  if (!window.__pagState) window.__pagState = {};
  window.__pagState[tableId] = { rows, perPage, totalPages, currentPage: 1, showPage };
}

function pagePrev(tableId) {
  if (!window.__pagState || !window.__pagState[tableId]) return;
  const state = window.__pagState[tableId];
  if (state.currentPage > 1) {
    state.currentPage--;
    state.showPage(state.currentPage);
    var pn = document.getElementById('pageNum-' + tableId); if (pn) pn.textContent = state.currentPage;
  }
}

function pageNext(tableId) {
  if (!window.__pagState || !window.__pagState[tableId]) return;
  const state = window.__pagState[tableId];
  if (state.currentPage < state.totalPages) {
    state.currentPage++;
    state.showPage(state.currentPage);
    var pn = document.getElementById('pageNum-' + tableId); if (pn) pn.textContent = state.currentPage;
  }
}

// ===== 6. LIBRARY MANAGEMENT =====
function renderLibrary() {
  const container = document.getElementById('libraryView');
  if (!container) return;
  const books = data.library || [];
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;color:var(--text-light);">${books.length} books in catalog</span>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm btn-primary" onclick="showAddBookModal()"><i class="fas fa-plus"></i> Add Book</button>
        <button class="btn btn-sm btn-success" onclick="showBorrowModal()"><i class="fas fa-hand-holding"></i> Borrow</button>
        <button class="btn btn-sm btn-info" onclick="showReturnModal()"><i class="fas fa-undo"></i> Return</button>
      </div>
    </div>
    <div class="library-grid">
      ${books.map(b => {
        const status = b.available > 0 ? (b.available <= 2 ? 'low' : 'available') : 'unavailable';
        const hasEbook = !!(b.ebookUrl);
        return `<div class="lib-card${hasEbook?' lib-card-has-ebook':''}">
          ${hasEbook ? '<div class="lib-ebook-badge"><i class="fas fa-file-upload"></i> Ebook</div>' : ''}
          <div class="book-title">${htmlEscape(b.title)}</div>
          <div class="book-author">by ${htmlEscape(b.author)}</div>
          <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;">ISBN: ${htmlEscape(b.isbn)} | ${htmlEscape(b.category)}</div>
          <div class="book-meta">
            <span>Total: ${b.total}</span>
            <span class="lib-availability ${status}">${b.available} available</span>
          </div>
          <div class="book-actions">
            ${hasEbook ? '<button class="btn btn-sm btn-success" onclick="viewEbook(\'' + b.id + '\')" style="font-size:11px;" title="View Ebook"><i class="fas fa-book-open"></i> Read</button>' : ''}
            <button class="btn btn-sm btn-outline" onclick="showEditBookModal('${b.id}')" style="font-size:11px;"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline" onclick="deleteBook('${b.id}')" style="font-size:11px;color:var(--danger);"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${books.length ? '' : '<div class="empty-state"><i class="fas fa-book"></i><p>No books in library catalog</p></div>'}
    <h3 style="margin-top:24px;font-size:16px;font-weight:600;">Borrowing Records</h3>
    <div style="margin-top:8px;overflow-x:auto;">
      <table><thead><tr><th>Book</th><th>Student</th><th>Borrowed</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>${data.borrowings.map(br => {
        const book = data.library.find(b => b.id === br.bookId);
        const student = getStudent(br.studentId);
        const bClass = br.status === 'active' ? 'badge-paid' : br.status === 'overdue' ? 'badge-absent' : 'badge-excused';
        return `<tr><td>${book ? htmlEscape(book.title) : htmlEscape(br.bookId)}</td><td>${student ? htmlEscape(student.name) : htmlEscape(br.studentId)}</td><td>${htmlEscape(br.borrowDate)}</td><td>${htmlEscape(br.dueDate)}</td><td><span class="badge ${bClass}">${br.status}</span></td></tr>`;
      }).join('')}</tbody></table>
    </div>
    ${data.borrowings.length ? '' : '<p class="empty-state" style="margin-top:8px;">No borrowing records</p>'}
  `;
}

var _pendingEbookData = null;

function showAddBookModal() {
  _pendingEbookData = null;
  openModal(`
    <h3><i class="fas fa-plus"></i> Add Book</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fBookTitle" placeholder="Book title"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Author</label><input type="text" id="fBookAuthor" placeholder="Author name"></div>
      <div class="form-group"><label>ISBN</label><input type="text" id="fBookISBN" placeholder="ISBN"></div>
      <div class="form-group"><label>Category</label><select id="fBookCat"><option>Academic</option><option>Science</option><option>Humanities</option><option>Reference</option><option>Fiction</option></select></div>
      <div class="form-group"><label>Total Copies</label><input type="number" id="fBookTotal" value="5" min="1"></div>
      <div class="form-group" style="grid-column:1/-1;">
        <label>Ebook File <span style="font-size:11px;color:var(--text-light);">(PDF, Word, TXT — optional)</span></label>
        <input type="file" id="fBookEbook" accept=".pdf,.doc,.docx,.txt,.rtf,.epub" onchange="previewEbookUpload(this)" style="font-size:13px;">
        <div id="ebookUploadStatus" style="font-size:12px;margin-top:4px;"></div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveBook()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function previewEbookUpload(input) {
  var status = document.getElementById('ebookUploadStatus');
  if (!input.files || !input.files[0]) { _pendingEbookData = null; if (status) status.textContent = ''; return; }
  var file = input.files[0];
  var maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) { toast('File too large. Max 20MB.', 'error'); input.value = ''; _pendingEbookData = null; if (status) status.textContent = ''; return; }
  if (status) status.textContent = 'Reading ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)...';
  var reader = new FileReader();
  reader.onload = function(e) {
    _pendingEbookData = { name: file.name, type: file.type || 'application/octet-stream', size: file.size, data: e.target.result };
    if (status) status.textContent = 'Ready: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
  };
  reader.onerror = function() { toast('Failed to read file', 'error'); _pendingEbookData = null; if (status) status.textContent = 'Error reading file'; };
  reader.readAsDataURL(file);
}

function saveBook() {
  const title = (document.getElementById('fBookTitle')?.value ?? '').trim();
  const author = (document.getElementById('fBookAuthor')?.value ?? '').trim();
  const isbn = (document.getElementById('fBookISBN')?.value ?? '').trim();
  const category = (document.getElementById('fBookCat')?.value ?? '');
  const total = parseInt(document.getElementById('fBookTotal')?.value ?? '') || 1;
  if (!title || !author) { toast('Please fill title and author', 'error'); return; }
  var book = { id: genId('LIB'), title, author, isbn, total, available: total, category };
  if (_pendingEbookData) {
    book.ebookName = _pendingEbookData.name;
    book.ebookType = _pendingEbookData.type;
    book.ebookSize = _pendingEbookData.size;
    book.ebookUrl = _pendingEbookData.data;
    _pendingEbookData = null;
  }
  data.library.push(book);
  saveData();
  closeModal();
  renderLibrary();
  toast(`Book "${title}" added`);
}

function showEditBookModal(id) {
  const b = (data.library || []).find(x => x.id === id);
  if (!b) return;
  _pendingEbookData = null;
  var ebookStatus = b.ebookUrl ? 'Has ebook: ' + htmlEscape(b.ebookName || '') + ' (' + (b.ebookSize ? (b.ebookSize/1024).toFixed(1)+' KB' : '') + ')' : 'No ebook uploaded';
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Book</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fBookTitle" value="${htmlEscape(b.title)}"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Author</label><input type="text" id="fBookAuthor" value="${htmlEscape(b.author)}"></div>
      <div class="form-group"><label>ISBN</label><input type="text" id="fBookISBN" value="${htmlEscape(b.isbn)}"></div>
      <div class="form-group"><label>Category</label><select id="fBookCat"><option ${b.category==='Academic'?'selected':''}>Academic</option><option ${b.category==='Science'?'selected':''}>Science</option><option ${b.category==='Humanities'?'selected':''}>Humanities</option><option ${b.category==='Reference'?'selected':''}>Reference</option><option ${b.category==='Fiction'?'selected':''}>Fiction</option></select></div>
      <div class="form-group"><label>Total Copies</label><input type="number" id="fBookTotal" value="${b.total}" min="1"></div>
      <div class="form-group"><label>Available</label><input type="number" id="fBookAvail" value="${b.available}" min="0" max="${b.total}"></div>
      <div class="form-group" style="grid-column:1/-1;">
        <label>Ebook File <span style="font-size:11px;color:var(--text-light);">(PDF, Word, TXT)</span></label>
        <div style="font-size:13px;color:var(--text-light);margin-bottom:6px;" id="editEbookStatus">${ebookStatus}</div>
        <input type="file" id="fBookEbook" accept=".pdf,.doc,.docx,.txt,.rtf,.epub" onchange="previewEbookUpload(this)" style="font-size:13px;">
        <div id="ebookUploadStatus" style="font-size:12px;margin-top:4px;"></div>
        ${b.ebookUrl ? '<button class="btn btn-sm btn-outline" style="margin-top:6px;color:var(--danger);" onclick="removeBookEbook(\''+id+'\')"><i class="fas fa-trash"></i> Remove Ebook</button>' : ''}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateBook('${id}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateBook(id) {
  const b = data.library.find(x => x.id === id);
  if (!b) return;
  b.title = (document.getElementById('fBookTitle')?.value ?? '').trim();
  b.author = (document.getElementById('fBookAuthor')?.value ?? '').trim();
  b.isbn = (document.getElementById('fBookISBN')?.value ?? '').trim();
  b.category = (document.getElementById('fBookCat')?.value ?? '');
  b.total = parseInt(document.getElementById('fBookTotal')?.value ?? '') || 1;
  b.available = Math.min(parseInt(document.getElementById('fBookAvail')?.value ?? '') || 0, b.total);
  if (_pendingEbookData) {
    b.ebookName = _pendingEbookData.name;
    b.ebookType = _pendingEbookData.type;
    b.ebookSize = _pendingEbookData.size;
    b.ebookUrl = _pendingEbookData.data;
    _pendingEbookData = null;
  }
  saveData();
  closeModal();
  renderLibrary();
  toast('Book updated');
}

function removeBookEbook(id) {
  if (!confirm('Remove the ebook file from this book?')) return;
  const b = data.library.find(x => x.id === id);
  if (!b) return;
  delete b.ebookUrl; delete b.ebookName; delete b.ebookType; delete b.ebookSize;
  saveData(); renderLibrary(); toast('Ebook removed');
}

function viewEbook(id) {
  const b = (data.library || []).find(x => x.id === id);
  if (!b || !b.ebookUrl) { toast('No ebook available', 'error'); return; }
  var url = b.ebookUrl;
  var isPDF = b.ebookType === 'application/pdf' || (b.ebookName || '').toLowerCase().endsWith('.pdf');
  var isText = b.ebookType && b.ebookType.startsWith('text/') || (b.ebookName || '').toLowerCase().endsWith('.txt');
  if (isPDF) {
    openModal('<div style="display:flex;flex-direction:column;height:85vh;"><div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #e2e8f0;"><h3 style="margin:0;"><i class="fas fa-file-pdf" style="color:var(--danger);"></i> ' + htmlEscape(b.title) + '</h3><div><a href="' + url + '" download="' + htmlEscape(b.ebookName || b.title + '.pdf') + '" class="btn btn-sm btn-outline" style="text-decoration:none;"><i class="fas fa-download"></i> Download</a></div></div><iframe src="' + url + '" style="flex:1;width:100%;border:none;border-radius:6px;margin-top:8px;"></iframe></div>');
  } else if (isText) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      openModal('<div style="max-height:85vh;overflow-y:auto;"><div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #e2e8f0;position:sticky;top:0;background:var(--bg);"><h3 style="margin:0;"><i class="fas fa-file-alt"></i> ' + htmlEscape(b.title) + '</h3><a href="' + url + '" download="' + htmlEscape(b.ebookName || b.title + '.txt') + '" class="btn btn-sm btn-outline" style="text-decoration:none;"><i class="fas fa-download"></i> Download</a></div><pre style="white-space:pre-wrap;font-size:14px;line-height:1.6;padding:16px;background:var(--bg-subtle);border-radius:6px;margin-top:8px;">' + htmlEscape(xhr.responseText) + '</pre></div>');
    };
    xhr.onerror = function() { toast('Failed to load text content. Use download instead.', 'error'); };
    xhr.send();
  } else {
    openModal('<div style="text-align:center;padding:20px;"><div style="font-size:64px;color:var(--primary);margin-bottom:16px;"><i class="fas fa-file-export"></i></div><h3>' + htmlEscape(b.title) + '</h3><p style="color:var(--text-light);margin-bottom:16px;">This ebook format cannot be previewed in the browser.</p><a href="' + url + '" download="' + htmlEscape(b.ebookName || 'ebook') + '" class="btn btn-primary"><i class="fas fa-download"></i> Download ' + htmlEscape(b.ebookName || 'File') + '</a></div>');
  }
}

function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  data.library = data.library.filter(b => b.id !== id);
  saveData();
  renderLibrary();
  toast('Book deleted');
}

function showBorrowModal() {
  const bookOpts = (data.library || []).filter(b => b.available > 0).map(b => `<option value="${b.id}">${htmlEscape(b.title)} (${b.available} available)</option>`).join('');
  const stuOpts = data.students.map(s => `<option value="${htmlEscape(s.id)}">${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  if (!bookOpts) { toast('No books available to borrow', 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 14*86400000).toISOString().split('T')[0];
  openModal(`
    <h3><i class="fas fa-hand-holding"></i> Borrow Book</h3>
    <div class="form-grid">
      <div class="form-group"><label>Book</label><select id="fBorrowBook">${bookOpts}</select></div>
      <div class="form-group"><label>Student</label><select id="fBorrowStudent">${stuOpts}</select></div>
      <div class="form-group"><label>Borrow Date</label><input type="date" id="fBorrowDate" value="${today}"></div>
      <div class="form-group"><label>Due Date</label><input type="date" id="fBorrowDue" value="${due}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-success" onclick="saveBorrow()"><i class="fas fa-check"></i> Borrow</button>
    </div>
  `);
}

function saveBorrow() {
  const bookId = (document.getElementById('fBorrowBook')?.value ?? '');
  const studentId = (document.getElementById('fBorrowStudent')?.value ?? '');
  const borrowDate = (document.getElementById('fBorrowDate')?.value ?? '');
  const dueDate = (document.getElementById('fBorrowDue')?.value ?? '');
  if (!borrowDate || !dueDate) { toast('Please fill all fields', 'error'); return; }
  const book = data.library.find(b => b.id === bookId);
  if (!book || book.available < 1) { toast('Book not available', 'error'); return; }
  book.available--;
  data.borrowings.push({ id: genId('BRW'), bookId, studentId, borrowDate, dueDate, returnDate: null, status: 'active' });
  saveData();
  closeModal();
  renderLibrary();
  toast('Book borrowed successfully');
  addNotification(studentId, 'library', `Borrowed "${book.title}" - due ${dueDate}`);
}

function showReturnModal() {
  const active = data.borrowings.filter(br => br.status === 'active' || br.status === 'overdue');
  const opts = active.map(br => {
    const book = data.library.find(b => b.id === br.bookId);
    const student = getStudent(br.studentId);
    return `<option value="${br.id}">${book ? htmlEscape(book.title) : htmlEscape(br.bookId)} - ${student ? htmlEscape(student.name) : htmlEscape(br.studentId)}</option>`;
  }).join('');
  if (!opts) { toast('No active borrowings', 'error'); return; }
  openModal(`
    <h3><i class="fas fa-undo"></i> Return Book</h3>
    <div class="form-group"><label>Select Borrowing</label><select id="fReturnBorrow">${opts}</select></div>
    <div class="form-group"><label>Return Date</label><input type="date" id="fReturnDate" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveReturn()"><i class="fas fa-check"></i> Return</button>
    </div>
  `);
}

function saveReturn() {
  const brId = (document.getElementById('fReturnBorrow')?.value ?? '');
  const returnDate = (document.getElementById('fReturnDate')?.value ?? '');
  const borrow = data.borrowings.find(b => b.id === brId);
  if (!borrow) return;
  borrow.returnDate = returnDate;
  borrow.status = 'returned';
  const book = data.library.find(b => b.id === borrow.bookId);
  if (book) book.available = Math.min(book.available + 1, book.total);
  saveData();
  closeModal();
  renderLibrary();
  toast('Book returned successfully');
}

// ===== 7. LESSON NOTES / PLANNER =====
function renderLessonNotes(containerId, filterTeacherId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let notes = data.lessonNotes || [];
  if (filterTeacherId) notes = notes.filter(n => n.teacherId === filterTeacherId);
  notes.sort((a,b) => new Date(b.date) - new Date(a.date));
  var showActions = !!(currentTeacher || currentAdmin);
  container.innerHTML = notes.length ? notes.map(n => `
    <div class="lesson-card">
      <div class="lesson-title">${htmlEscape(n.title)}</div>
      <div class="lesson-meta">
        <span><i class="fas fa-book"></i> ${htmlEscape(n.subject)}</span>
        <span><i class="fas fa-users"></i> ${htmlEscape(n.class)}</span>
        <span><i class="fas fa-calendar"></i> ${htmlEscape(n.date)}</span>
        <span><i class="fas fa-tag"></i> ${htmlEscape(n.week || '')}</span>
      </div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${htmlEscape(n.content)}</div>
      ${showActions ? '<div style="margin-top:8px;display:flex;gap:6px;"><button class="btn btn-sm btn-primary" onclick="showEditLessonNoteModal(\'' + n.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteLessonNote(\'' + n.id + '\')"><i class="fas fa-trash"></i></button></div>' : ''}
    </div>
  `).join('') : '<div class="empty-state"><i class="fas fa-book-open"></i><p>No lesson notes yet</p></div>';
}

function showAddLessonNoteModal() {
  if (!currentTeacher) { toast('Teacher login required', 'error'); return; }
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','Physical Education','Music'];
  const subOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Add Lesson Note</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fLsnTitle" placeholder="e.g. Linear Equations"></div>
      <div class="form-group"><label>Subject</label><select id="fLsnSubject">${subOpts}</select></div>
      <div class="form-group"><label>Week</label><input type="text" id="fLsnWeek" placeholder="e.g. Week 1"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Content / Lesson Plan</label><textarea id="fLsnContent" rows="6" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Write the lesson content, objectives, activities..."></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveLessonNote()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveLessonNote() {
  if (!currentTeacher) return;
  const title = (document.getElementById('fLsnTitle')?.value ?? '').trim();
  const subject = (document.getElementById('fLsnSubject')?.value ?? '');
  const week = (document.getElementById('fLsnWeek')?.value ?? '').trim();
  const content = (document.getElementById('fLsnContent')?.value ?? '').trim();
  if (!title || !content) { toast('Please fill title and content', 'error'); return; }
  data.lessonNotes.push({
    id: genId('LN'), teacherId: currentTeacher.id,
    class: currentTeacher.assignedClass,
    subject, title: title, content, week,
    term: data.currentTerm || 'Term 2 2026',
    date: new Date().toISOString().split('T')[0]
  });
  saveData();
  logActivity(`Teacher ${currentTeacher.name} added lesson note: ${title}`);
  closeModal();
  renderLessonNotes('tchLessonNotes', currentTeacher.id);
  toast('Lesson note saved');
}

function showEditLessonNoteModal(id) {
  var n = (data.lessonNotes || []).find(function(x) { return x.id === id; });
  if (!n) return;
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','Physical Education','Music'];
  const subOpts = subjects.map(function(s) { return '<option value="' + s + '"' + (s === n.subject ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  openModal('<h3><i class="fas fa-edit"></i> Edit Lesson Note</h3><div class="form-grid"><div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fLsnTitle" value="' + htmlEscape(n.title) + '"></div><div class="form-group"><label>Subject</label><select id="fLsnSubject">' + subOpts + '</select></div><div class="form-group"><label>Week</label><input type="text" id="fLsnWeek" value="' + htmlEscape(n.week || '') + '"></div><div class="form-group" style="grid-column:1/-1;"><label>Content / Lesson Plan</label><textarea id="fLsnContent" rows="8" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;">' + htmlEscape(n.content) + '</textarea></div></div><input type="hidden" id="fEditLsnId" value="' + id + '"><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateLessonNote()"><i class="fas fa-save"></i> Update</button></div>');
}

function updateLessonNote() {
  var id = document.getElementById('fEditLsnId')?.value;
  var n = (data.lessonNotes || []).find(function(x) { return x.id === id; });
  if (!n) return;
  n.title = document.getElementById('fLsnTitle')?.value?.trim() || n.title;
  n.subject = document.getElementById('fLsnSubject')?.value || n.subject;
  n.week = document.getElementById('fLsnWeek')?.value?.trim() || '';
  n.content = document.getElementById('fLsnContent')?.value?.trim() || n.content;
  n.date = new Date().toISOString().split('T')[0];
  saveData();
  logActivity('Updated lesson note: ' + n.title);
  closeModal();
  if (currentTeacher) renderLessonNotes('tchLessonNotes', currentTeacher.id);
  else renderLessonNotes('adminLessonNotes');
  toast('Lesson note updated');
}

function deleteLessonNote(id) {
  if (!confirm('Delete this lesson note?')) return;
  data.lessonNotes = data.lessonNotes.filter(n => n.id !== id);
  saveData();
  if (currentTeacher) renderLessonNotes('tchLessonNotes', currentTeacher.id);
  else renderLessonNotes('adminLessonNotes');
  toast('Lesson note deleted');
}

function renderStudentLessonNotes() {
  if (!currentStudent) return;
  const notes = (data.lessonNotes || []).filter(n => n.class === currentStudent.class);
  const container = document.getElementById('stuLessonNotes');
  if (!container) return;
  container.innerHTML = notes.length ? notes.map(n => `
    <div class="lesson-card">
      <div class="lesson-title">${htmlEscape(n.title)}</div>
      <div class="lesson-meta">
        <span><i class="fas fa-book"></i> ${htmlEscape(n.subject)}</span>
        <span><i class="fas fa-user"></i> ${htmlEscape(n.teacherId)}</span>
        <span><i class="fas fa-calendar"></i> ${htmlEscape(n.date)}</span>
      </div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${htmlEscape(n.content)}</div>
    </div>
  `).join('') : '<div class="empty-state"><i class="fas fa-book-open"></i><p>No lesson notes for your class</p></div>';
}

// ===== 8. BEHAVIOR / DISCIPLINE LOG =====
function renderBehaviorLog(containerId, filterStudentId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let records = data.behaviorLog || [];
  if (filterStudentId) records = records.filter(b => b.studentId === filterStudentId);
  records.sort((a,b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = records.length ? `<div style="overflow-x:auto;"><table><thead><tr><th>Student</th><th>Type</th><th>Description</th><th>Date</th><th>Action</th><th>Actions</th></tr></thead><tbody>
    ${records.map(b => {
      const s = getStudent(b.studentId);
      const t = getTeacher(b.teacherId);
      return `<tr>
        <td>${s ? htmlEscape(s.name) : htmlEscape(b.studentId)}</td>
        <td><span class="badge ${b.type === 'positive' ? 'beh-positive' : b.type === 'negative' ? 'beh-negative' : 'beh-neutral'}">${htmlEscape(b.type)}</span></td>
        <td>${htmlEscape(b.description)}</td>
        <td>${htmlEscape(b.date)}</td>
        <td>${htmlEscape(b.action || '')}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteBehavior('${b.id}')"><i class="fas fa-trash"></i></button></td>
      </tr>`;
    }).join('')}</tbody></table></div>`
    : '<div class="empty-state"><i class="fas fa-balance-scale"></i><p>No behavior records</p></div>';
}

function showAddBehaviorModal() {
  const stuOpts = data.students.map(s => `<option value="${htmlEscape(s.id)}">${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  const teacherId = currentTeacher ? currentTeacher.id : '';
  openModal(`
    <h3><i class="fas fa-plus"></i> Record Behavior</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fBehStudent">${stuOpts}</select></div>
      <div class="form-group"><label>Type</label><select id="fBehType"><option value="positive">Positive</option><option value="negative">Negative</option><option value="neutral">Neutral</option></select></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fBehDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Describe the incident or commendation..."></textarea></div>
      <div class="form-group"><label>Action Taken</label><input type="text" id="fBehAction" placeholder="e.g. Verbal warning, Commendation"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveBehavior('${teacherId}')"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveBehavior(teacherId) {
  const studentId = (document.getElementById('fBehStudent')?.value ?? '');
  const type = (document.getElementById('fBehType')?.value ?? '');
  const description = (document.getElementById('fBehDesc')?.value ?? '').trim();
  const action = (document.getElementById('fBehAction')?.value ?? '').trim();
  if (!description) { toast('Please describe the behavior', 'error'); return; }
  data.behaviorLog.push({
    id: genId('BEH'), studentId, type, description,
    date: new Date().toISOString().split('T')[0],
    teacherId: teacherId || 'Admin',
    action: action || (type === 'positive' ? 'Commendation' : 'Warning')
  });
  saveData();
  logActivity(`Recorded ${type} behavior for ${getStudent(studentId)?.name}`);
  closeModal();
  renderBehaviorLog('adminBehaviorLog');
  if (currentTeacher) renderBehaviorLog('tchBehaviorLog', teacherId);
  toast('Behavior recorded');
}

function deleteBehavior(id) {
  if (!confirm('Delete this behavior record?')) return;
  data.behaviorLog = data.behaviorLog.filter(b => b.id !== id);
  saveData();
  renderBehaviorLog('adminBehaviorLog');
  if (currentTeacher) renderBehaviorLog('tchBehaviorLog', currentTeacher.id);
  toast('Record deleted');
}

// ===== 9. STAFF HR MODULE =====
function renderStaffHR() {
  const container = document.getElementById('hrView');
  if (!container) return;
  const leaves = data.leaveRequests || data.staffHR?.filter(r => r.type === 'leave') || [];
  const payroll = data.payrollRecords || [];
  const staffAtt = data.staffHR?.filter(r => r.type === 'attendance') || [];

  container.innerHTML = `
    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;background:var(--card-bg);padding:16px;border-radius:var(--radius-sm);border:1px solid #e2e8f0;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--primary);">${data.teachers.length}</div>
        <div style="font-size:13px;color:var(--text-light);">Total Staff</div>
      </div>
      <div style="flex:1;min-width:120px;background:var(--card-bg);padding:16px;border-radius:var(--radius-sm);border:1px solid #e2e8f0;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--success);">${staffAtt.filter(a => a.status === 'present').length}</div>
        <div style="font-size:13px;color:var(--text-light);">Present Today</div>
      </div>
      <div style="flex:1;min-width:120px;background:var(--card-bg);padding:16px;border-radius:var(--radius-sm);border:1px solid #e2e8f0;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--accent);">${leaves.filter(l => l.status === 'approved').length}</div>
        <div style="font-size:13px;color:var(--text-light);">Leaves Approved</div>
      </div>
      <div style="flex:1;min-width:120px;background:var(--card-bg);padding:16px;border-radius:var(--radius-sm);border:1px solid #e2e8f0;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--info);">₦${payroll.reduce((s, p) => s + (p.paid ? p.netSalary : 0), 0).toLocaleString()}</div>
        <div style="font-size:13px;color:var(--text-light);">Total Payroll</div>
      </div>
    </div>

    <h3 style="font-weight:600;margin-bottom:12px;">Staff Attendance</h3>
    <div style="overflow-x:auto;margin-bottom:24px;">
    <table><thead><tr><th>Teacher</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${staffAtt.map(a => {
        const t = getTeacher(a.teacherId);
        return `<tr><td>${t ? htmlEscape(t.name) : htmlEscape(a.teacherId)}</td><td>${htmlEscape(a.date)}</td><td><span class="badge ${a.status === 'present' ? 'badge-paid' : 'badge-absent'}">${a.status}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteHRAttendance('${a.id}')"><i class="fas fa-trash"></i></button></td></tr>`;
      }).join('')}
    </tbody></table></div>
    ${staffAtt.length ? '' : '<p class="empty-state">No staff attendance records</p>'}
    <div style="display:flex;gap:8px;margin-bottom:24px;">
      <button class="btn btn-sm btn-primary" onclick="showStaffAttendanceModal()"><i class="fas fa-calendar-check"></i> Mark Attendance</button>
      <button class="btn btn-sm btn-success" onclick="showLeaveRequestModal()"><i class="fas fa-calendar-plus"></i> Leave Request</button>
    </div>

    <h3 style="font-weight:600;margin-bottom:12px;">Leave Requests</h3>
    <div style="overflow-x:auto;margin-bottom:24px;">
    <table><thead><tr><th>Teacher</th><th>Start</th><th>End</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${leaves.map(l => {
        const t = getTeacher(l.teacherId);
        const bClass = l.status === 'approved' ? 'badge-paid' : l.status === 'rejected' ? 'badge-absent' : 'badge-partial';
        return `<tr><td>${t ? htmlEscape(t.name) : htmlEscape(l.teacherId)}</td><td>${htmlEscape(l.startDate)}</td><td>${htmlEscape(l.endDate)}</td><td>${htmlEscape(l.reason)}</td>
        <td><span class="badge ${bClass}">${l.status}</span></td>
        <td>
          <button class="btn btn-sm btn-success" onclick="approveLeave('${l.id}')"><i class="fas fa-check"></i></button>
          <button class="btn btn-sm btn-danger" onclick="rejectLeave('${l.id}')"><i class="fas fa-times"></i></button>
        </td></tr>`;
      }).join('')}
    </tbody></table></div>
    ${leaves.length ? '' : '<p class="empty-state">No leave requests</p>'}

    <h3 style="font-weight:600;margin-bottom:12px;">Payroll Records</h3>
    <div style="overflow-x:auto;">
    <table><thead><tr><th>Teacher</th><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${payroll.map(p => {
        const t = getTeacher(p.teacherId);
        return `<tr><td>${t ? htmlEscape(t.name) : htmlEscape(p.teacherId)}</td><td>${htmlEscape(p.month)}</td><td>₦${p.basicSalary.toLocaleString()}</td><td>₦${p.allowances.toLocaleString()}</td><td>₦${p.deductions.toLocaleString()}</td>
        <td><strong>₦${p.netSalary.toLocaleString()}</strong></td>
        <td><span class="badge ${p.paid ? 'badge-paid' : 'badge-absent'}">${p.paid ? 'Paid' : 'Pending'}</span></td>
        <td><button class="btn btn-sm btn-${p.paid ? 'warning' : 'success'}" onclick="togglePayroll('${p.id}')">${p.paid ? 'Unpay' : 'Pay'}</button></td></tr>`;
      }).join('')}
    </tbody></table></div>
    ${payroll.length ? '' : '<p class="empty-state">No payroll records</p>'}
  `;
}

function showStaffAttendanceModal() {
  const today = new Date().toISOString().split('T')[0];
  const list = data.teachers.map(t => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;">
    <span><strong>${htmlEscape(t.name)}</strong> (${htmlEscape(t.id)})</span>
    <select class="hr-att-select" data-tid="${htmlEscape(t.id)}" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-family:inherit;font-size:13px;">
      <option value="present">Present</option>
      <option value="absent">Absent</option>
    </select>
  </div>`).join('');
  openModal(`
    <h3><i class="fas fa-calendar-check"></i> Staff Attendance</h3>
    <p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">Date: <strong>${today}</strong></p>
    <div style="max-height:350px;overflow-y:auto;">${list || '<p class="empty-state">No teachers</p>'}</div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStaffAttendance('${today}')"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveStaffAttendance(date) {
  if (!data.staffHR) data.staffHR = [];
  document.querySelectorAll('.hr-att-select').forEach(sel => {
    const tid = sel.dataset.tid;
    const status = sel.value;
    const existing = data.staffHR.findIndex(r => r.teacherId === tid && r.date === date && r.type === 'attendance');
    if (existing >= 0) data.staffHR[existing].status = status;
    else data.staffHR.push({ id: genId('HR'), teacherId: tid, type: 'attendance', date, status });
  });
  saveData();
  closeModal();
  renderStaffHR();
  toast('Staff attendance saved');
}

function deleteHRAttendance(id) {
  if (!confirm('Delete this attendance record?')) return;
  data.staffHR = data.staffHR.filter(r => r.id !== id);
  saveData();
  renderStaffHR();
  toast('Record deleted');
}

function showLeaveRequestModal() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7*86400000).toISOString().split('T')[0];
  const teacherOpts = data.teachers.map(t => `<option value="${htmlEscape(t.id)}">${htmlEscape(t.name)} (${htmlEscape(t.id)})</option>`).join('');
  openModal(`
    <h3><i class="fas fa-calendar-plus"></i> Leave Request</h3>
    <div class="form-grid">
      <div class="form-group"><label>Teacher</label><select id="fLeaveTeacher">${teacherOpts}</select></div>
      <div class="form-group"><label>Start Date</label><input type="date" id="fLeaveStart" value="${today}"></div>
      <div class="form-group"><label>End Date</label><input type="date" id="fLeaveEnd" value="${nextWeek}"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Reason</label><textarea id="fLeaveReason" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Reason for leave..."></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveLeaveRequest()"><i class="fas fa-save"></i> Submit</button>
    </div>
  `);
}

function saveLeaveRequest() {
  const teacherId = (document.getElementById('fLeaveTeacher')?.value ?? '');
  const startDate = (document.getElementById('fLeaveStart')?.value ?? '');
  const endDate = (document.getElementById('fLeaveEnd')?.value ?? '');
  const reason = (document.getElementById('fLeaveReason')?.value ?? '').trim();
  if (!startDate || !endDate || !reason) { toast('Please fill all fields', 'error'); return; }
  if (!data.leaveRequests) data.leaveRequests = [];
  data.leaveRequests.push({ id: genId('LEV'), teacherId, startDate, endDate, reason, status: 'pending', date: new Date().toISOString().split('T')[0] });
  saveData();
  closeModal();
  renderStaffHR();
  toast('Leave request submitted');
}

function approveLeave(id) {
  const l = data.leaveRequests?.find(x => x.id === id);
  if (l) { l.status = 'approved'; saveData(); renderStaffHR(); toast('Leave approved'); }
}

function rejectLeave(id) {
  const l = data.leaveRequests?.find(x => x.id === id);
  if (l) { l.status = 'rejected'; saveData(); renderStaffHR(); toast('Leave rejected'); }
}

function togglePayroll(id) {
  const p = data.payrollRecords?.find(x => x.id === id);
  if (p) { p.paid = !p.paid; saveData(); renderStaffHR(); toast(p.paid ? 'Marked as paid' : 'Marked as unpaid'); }
}

// ===== 10. DISCUSSION FORUM =====
function renderForum(containerId, filterClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let posts = data.forumPosts || [];
  if (filterClass) posts = posts.filter(p => p.class === filterClass);
  posts.sort((a,b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;color:var(--text-light);">${posts.length} discussions</span>
      <button class="btn btn-sm btn-primary" onclick="showNewForumPostModal()"><i class="fas fa-plus"></i> New Post</button>
    </div>
    ${posts.length ? posts.map(p => `<div class="forum-post">
      <div class="post-header">
        <div class="post-title" onclick="viewForumPost('${p.id}')">${htmlEscape(p.title)}</div>
        <span class="badge" style="background:#bee3f8;color:#2a4365;font-size:11px;">${htmlEscape(p.class)}</span>
      </div>
      <div class="post-meta">
        <span><i class="fas fa-user"></i> ${htmlEscape(p.authorName || p.author)}</span>
        <span><i class="fas fa-calendar"></i> ${htmlEscape(p.date)}</span>
        <span><i class="fas fa-comments"></i> ${(p.replies || []).length} replies</span>
      </div>
      <div class="post-body">${htmlEscape(p.content || '').substring(0, 200)}${(p.content || '').length > 200 ? '...' : ''}</div>
    </div>`).join('') : '<div class="empty-state"><i class="fas fa-comments"></i><p>No discussions yet</p></div>'}
  `;
}

function showNewForumPostModal() {
  const classOpts = [...new Set(data.students.map(s => s.class))].map(c => `<option value="${htmlEscape(c)}">${htmlEscape(c)}</option>`).join('');
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','General'];
  const subOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  const authorName = currentTeacher ? currentTeacher.name : currentStudent ? currentStudent.name : 'Admin';
  openModal(`
    <h3><i class="fas fa-plus"></i> New Discussion</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fForumTitle" placeholder="Discussion title"></div>
      <div class="form-group"><label>Class</label><select id="fForumClass">${classOpts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fForumSubject">${subOpts}</select></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Content</label><textarea id="fForumContent" rows="5" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Write your question or topic..."></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveForumPost('${htmlEscape((authorName || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"))}')"><i class="fas fa-paper-plane"></i> Post</button>
    </div>
  `);
}

function saveForumPost(authorName) {
  const title = (document.getElementById('fForumTitle')?.value ?? '').trim();
  const cls = (document.getElementById('fForumClass')?.value ?? '');
  const subject = (document.getElementById('fForumSubject')?.value ?? '');
  const content = (document.getElementById('fForumContent')?.value ?? '').trim();
  if (!title || !content) { toast('Please fill title and content', 'error'); return; }
  const author = currentTeacher ? currentTeacher.id : currentStudent ? currentStudent.id : 'Admin';
  data.forumPosts.push({
    id: genId('FRM'), author, authorName, class: cls, subject, title, content,
    date: new Date().toISOString().split('T')[0], replies: []
  });
  saveData();
  logActivity(`Forum post: ${title}`);
  closeModal();
  const filterClass = currentStudent ? currentStudent.class : null;
  renderForum('adminForum', null);
  if (currentTeacher) renderForum('tchForum', null);
  if (currentStudent) renderForum('stuForum', filterClass);
  toast('Discussion posted');
}

function viewForumPost(id) {
  const p = data.forumPosts.find(x => x.id === id);
  if (!p) return;
  const replies = (p.replies || []).map(r => `<div class="forum-reply">
    <div class="reply-meta"><strong>${htmlEscape(r.authorName)}</strong> &middot; ${htmlEscape(r.date)}</div>
    <div style="font-size:14px;">${htmlEscape(r.content)}</div>
  </div>`).join('');
  const authorName = currentTeacher ? currentTeacher.name : currentStudent ? currentStudent.name : 'Admin';
  openModal(`
    <h3><i class="fas fa-comments"></i> ${htmlEscape(p.title)}</h3>
    <div style="font-size:13px;color:var(--text-light);margin-bottom:12px;">
      <span><i class="fas fa-user"></i> ${htmlEscape(p.authorName || p.author)}</span> &middot;
      <span>${htmlEscape(p.class)}</span> &middot;
      <span>${htmlEscape(p.date)}</span>
    </div>
    <div style="font-size:14px;line-height:1.6;margin-bottom:16px;padding:16px;background:#f7fafc;border-radius:8px;">${htmlEscape(p.content || '')}</div>
    <h5 style="font-weight:600;margin-bottom:8px;">Replies (${(p.replies || []).length})</h5>
    ${replies || '<p style="font-size:13px;color:var(--text-light);">No replies yet</p>'}
    <div style="margin-top:16px;">
      <div class="form-group"><label>Your Reply</label>
        <textarea id="fForumReply" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;" placeholder="Write your reply..."></textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="saveForumReply('${id}', '${htmlEscape((authorName || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"))}')"><i class="fas fa-reply"></i> Reply</button>
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `);
}

function saveForumReply(postId, authorName) {
  const content = document.getElementById('fForumReply')?.value.trim();
  if (!content) { toast('Please write a reply', 'error'); return; }
  const p = data.forumPosts.find(x => x.id === postId);
  if (!p) return;
  if (!p.replies) p.replies = [];
  p.replies.push({ author: currentTeacher ? currentTeacher.id : currentStudent ? currentStudent.id : 'Admin', authorName, content, date: new Date().toISOString().split('T')[0] });
  saveData();
  closeModal();
  toast('Reply posted');
}

// ===== 11. FILE REPOSITORY =====
function renderFileRepo(containerId, filterClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let files = data.fileRepo || [];
  if (filterClass) files = files.filter(f => f.class === filterClass);
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;color:var(--text-light);">${files.length} files</span>
      ${currentTeacher ? `<button class="btn btn-sm btn-primary" onclick="showUploadFileModal()"><i class="fas fa-upload"></i> Upload</button>` : ''}
    </div>
    <div class="file-grid">
      ${files.map(f => {
        const ext = f.name?.split('.').pop()?.toLowerCase() || '';
        const iconClass = ['pdf'].includes(ext) ? 'pdf' : ['doc','docx'].includes(ext) ? 'doc' : ['png','jpg','jpeg','gif'].includes(ext) ? 'img' : '';
        return `<div class="file-item">
          <div class="file-icon ${iconClass}"><i class="fas ${ext === 'pdf' ? 'fa-file-pdf' : ['doc','docx'].includes(ext) ? 'fa-file-word' : ['xls','xlsx'].includes(ext) ? 'fa-file-excel' : 'fa-file-alt'}"></i></div>
          <div class="file-name">${htmlEscape(f.name)}</div>
          <div class="file-meta">
            <div>${htmlEscape(f.subject)} | ${htmlEscape(f.class)}</div>
            <div>${htmlEscape(f.uploadDate || f.date)} &middot; ${htmlEscape(f.size || '--')}</div>
            <div style="font-size:11px;color:var(--text-light);">by ${htmlEscape(f.uploadedBy || '')}</div>
          </div>
          <div style="margin-top:8px;">
            <button class="btn btn-sm btn-primary" onclick="toast('Download would start: ${htmlEscape((f.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'"))}')"><i class="fas fa-download"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteFileRepo('${f.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${files.length ? '' : '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No files uploaded yet</p></div>'}
  `;
}

function showUploadFileModal() {
  if (!currentTeacher) { toast('Teacher login required', 'error'); return; }
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','General'];
  const subOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  const categories = ['notes','past_questions','study_guide','assignment','reference','other'];
  const catOpts = categories.map(c => `<option value="${c}">${c.replace('_',' ')}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-upload"></i> Upload File</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>File Name</label><input type="text" id="fFileName" placeholder="e.g. Chapter5_Notes.pdf"></div>
      <div class="form-group"><label>Subject</label><select id="fFileSubject">${subOpts}</select></div>
      <div class="form-group"><label>Category</label><select id="fFileCategory">${catOpts}</select></div>
      <div class="form-group"><label>Size (MB)</label><input type="text" id="fFileSize" placeholder="e.g. 2.4 MB"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Description</label><input type="text" id="fFileDesc" placeholder="Brief description of the file"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveFileRepo()"><i class="fas fa-upload"></i> Upload</button>
    </div>
  `);
}

function saveFileRepo() {
  if (!currentTeacher) return;
  const name = (document.getElementById('fFileName')?.value ?? '').trim();
  const subject = (document.getElementById('fFileSubject')?.value ?? '');
  const size = (document.getElementById('fFileSize')?.value ?? '').trim();
  const category = (document.getElementById('fFileCategory')?.value ?? '');
  const description = (document.getElementById('fFileDesc')?.value ?? '').trim();
  if (!name) { toast('Please enter file name', 'error'); return; }
  data.fileRepo.push({
    id: genId('FILE'), name, subject, category, description, class: currentTeacher.assignedClass,
    uploadedBy: currentTeacher.id, uploadDate: new Date().toISOString().split('T')[0],
    size: size || '--'
  });
  saveData();
  logActivity(`Uploaded file: ${name}`);
  closeModal();
  renderFileRepo('adminFileRepo');
  renderFileRepo('tchFileRepo', currentTeacher.assignedClass);
  toast('File uploaded');
}

function deleteFileRepo(id) {
  if (!confirm('Delete this file?')) return;
  data.fileRepo = data.fileRepo.filter(f => f.id !== id);
  saveData();
  renderFileRepo('adminFileRepo');
  if (currentTeacher) renderFileRepo('tchFileRepo', currentTeacher.assignedClass);
  if (currentStudent) renderFileRepo('stuFileRepo', currentStudent.class);
  toast('File deleted');
}

// ===== 12. ANALYTICS DASHBOARD =====
function renderAnalytics() {
  const container = document.getElementById('analyticsView');
  if (!container) return;
  const totalStudents = data.students.length;
  const totalTeachers = data.teachers.length;
  const totalFees = data.fees.reduce((s, f) => s + f.amount, 0);
  const collectedFees = data.fees.reduce((s, f) => s + f.paid, 0);
  const feeRate = totalFees ? Math.round(collectedFees / totalFees * 100) : 0;
  const scores = data.results.map(r => r.score);
  const avgScore = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
  const passCount = scores.filter(s => s >= 50).length;
  const passRate = scores.length ? Math.round(passCount / scores.length * 100) : 0;
  const presentCount = data.attendance.filter(a => a.status === 'present').length;
  const totalAtt = data.attendance.length;
  const attRate = totalAtt ? Math.round(presentCount / totalAtt * 100) : 0;

  // Subject performance data
  const subjects = [...new Set(data.results.map(r => r.subject))];
  const perfData = subjects.map(sub => {
    const subScores = data.results.filter(r => r.subject === sub).map(r => r.score);
    const avg = subScores.length ? Math.round(subScores.reduce((a,b) => a+b, 0) / subScores.length) : 0;
    return { subject: sub, avg };
  });

  const colors = ['#f5a623', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  container.innerHTML = `
    <div class="stats-grid" style="margin-bottom:24px;">
      <div class="stat-card"><div class="icon"><i class="fas fa-users" style="color:var(--primary)"></i></div><h3>${totalStudents}</h3><p>Students</p><div class="stat-change up"><i class="fas fa-arrow-up"></i> Active</div></div>
      <div class="stat-card"><div class="icon"><i class="fas fa-chalkboard-teacher" style="color:var(--success)"></i></div><h3>${totalTeachers}</h3><p>Teachers</p><div class="stat-change up"><i class="fas fa-arrow-up"></i> On Staff</div></div>
      <div class="stat-card"><div class="icon"><i class="fas fa-dollar-sign" style="color:var(--accent)"></i></div><h3>${feeRate}%</h3><p>Fee Collection Rate</p><div class="stat-change ${feeRate >= 70 ? 'up' : 'down'}"><i class="fas fa-${feeRate >= 70 ? 'arrow-up' : 'arrow-down'}"></i> $${collectedFees.toLocaleString()}</div></div>
      <div class="stat-card"><div class="icon"><i class="fas fa-chart-line" style="color:var(--info)"></i></div><h3>${passRate}%</h3><p>Pass Rate</p><div class="stat-change ${passRate >= 60 ? 'up' : 'down'}"><i class="fas fa-arrow-${passRate >= 60 ? 'up' : 'down'}"></i> Avg ${avgScore}%</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
      <div class="card">
        <h4 style="font-weight:600;margin-bottom:16px;">Subject Performance</h4>
        ${perfData.map((d, i) => `
          <div class="chart-bar">
            <span class="chart-bar-label">${htmlEscape(d.subject)}</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${d.avg}%;background:${colors[i % colors.length]};"></div></div>
            <span class="chart-bar-value">${d.avg}%</span>
          </div>
        `).join('')}
        ${perfData.length ? '' : '<p class="empty-state">No result data</p>'}
      </div>
      <div class="card">
        <h4 style="font-weight:600;margin-bottom:16px;">Attendance Overview</h4>
        <div style="text-align:center;margin-bottom:16px;">
          <div class="chart-pie" style="background:conic-gradient(var(--success) 0deg ${attRate * 3.6}deg, #e2e8f0 ${attRate * 3.6}deg 360deg);"></div>
          <div style="margin-top:8px;font-size:13px;color:var(--text-light);">${presentCount} present out of ${totalAtt} records</div>
        </div>
        <div class="chart-bar">
          <span class="chart-bar-label">Present</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${attRate}%;background:var(--success);"></div></div>
          <span class="chart-bar-value">${attRate}%</span>
        </div>
        <div class="chart-bar">
          <span class="chart-bar-label">Absent</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${100-attRate}%;background:var(--danger);"></div></div>
          <span class="chart-bar-value">${100-attRate}%</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h4 style="font-weight:600;margin-bottom:16px;">Fee Collection Status</h4>
      <div class="chart-bar">
        <span class="chart-bar-label">Collected</span>
        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${feeRate}%;background:var(--success);"></div></div>
        <span class="chart-bar-value">₦${collectedFees.toLocaleString()}</span>
      </div>
      <div class="chart-bar">
        <span class="chart-bar-label">Outstanding</span>
        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${100-feeRate}%;background:var(--accent);"></div></div>
        <span class="chart-bar-value">₦${(totalFees - collectedFees).toLocaleString()}</span>
      </div>
    </div>
  `;
}

// ===== 13. ONLINE FEE PAYMENTS (Real Gateway Integration) =====
function showPaymentPage() {
  if (!currentStudent) { toast('Please log in as a student', 'error'); return; }
  const s = currentStudent;
  const pendingFees = data.fees.filter(f => f.studentId === s.id && f.status !== 'paid');
  const totalDue = pendingFees.reduce((sum, f) => sum + (f.amount - f.paid), 0);
  const gateway = isGatewayActive();
  var gwConfig = getGatewayConfig();
  var currency = gwConfig.currency || 'NGN';
  var currencySymbols = { NGN: '₦', GHS: '₵', KES: 'KSh', ZAR: 'R', UGX: 'USh', USD: '$', GBP: '£' };
  var sym = currencySymbols[currency] || currency + ' ';

  var body = `<div style="margin-bottom:16px;">
      <div class="payment-card">
        <div class="label">Total Outstanding Balance</div>
        <div class="amount">${sym}${totalDue.toLocaleString()}</div>
        <div style="font-size:13px;opacity:0.8;">${pendingFees.length} pending fee item(s)</div>
      </div>
      ${pendingFees.length ? pendingFees.map(f => {
        return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;font-size:14px;">
          <span>${htmlEscape(f.term)} - Balance</span>
          <span><strong>${sym}${f.amount - f.paid}</strong></span>
        </div>`;
      }).join('') : '<p class="empty-state">No pending fees</p>'}`;

  if (totalDue > 0) {
    // Show gateway options
    if (gateway) {
      body += `<h4 style="font-weight:600;margin:16px 0 8px;">Pay with ${gwConfig.provider.charAt(0).toUpperCase() + gwConfig.provider.slice(1)}</h4>`;
      if (gwConfig.provider === 'paystack') {
        body += `<div style="background:#f0f4ff;border:1px solid #c3d9ff;border-radius:8px;padding:16px;margin-bottom:12px;text-align:center;">
          <img src="https://paystack.com/favicon.ico" style="height:24px;vertical-align:middle;margin-right:8px;">
          <span style="font-weight:600;">Paystack</span>
          <p style="font-size:13px;color:var(--text-light);margin-top:6px;">Pay via Card, Bank Transfer, or USSD</p>
        </div>`;
      } else if (gwConfig.provider === 'flutterwave') {
        body += `<div style="background:#fff5f0;border:1px solid #ffd6c0;border-radius:8px;padding:16px;margin-bottom:12px;text-align:center;">
          <span style="font-weight:600;">Flutterwave</span>
          <p style="font-size:13px;color:var(--text-light);margin-top:6px;">Pay via Card, Bank Transfer, Mobile Money, or USSD</p>
        </div>`;
      } else if (gwConfig.provider === 'stripe') {
        body += `<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:16px;margin-bottom:12px;text-align:center;">
          <span style="font-weight:600;">Stripe</span>
          <p style="font-size:13px;color:var(--text-light);margin-top:6px;">Pay via Credit/Debit Card</p>
        </div>`;
      }
      body += `<div style="margin-top:16px;">
        <label>Amount to Pay (${currency})</label>
        <input type="number" id="fPayAmount" value="${totalDue}" min="1" max="${totalDue}" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:16px;width:100%;box-sizing:border-box;">
      </div>`;
    } else {
      body += `<h4 style="font-weight:600;margin:16px 0 8px;">Select Payment Method</h4>
      <div class="payment-method">
        <div class="method-btn selected" onclick="selectPaymentMethod(this, 'card')">
          <div class="icon"><i class="fas fa-credit-card"></i></div>
          <div class="name">Card</div>
        </div>
        <div class="method-btn" onclick="selectPaymentMethod(this, 'transfer')">
          <div class="icon"><i class="fas fa-university"></i></div>
          <div class="name">Transfer</div>
        </div>
        <div class="method-btn" onclick="selectPaymentMethod(this, 'ussd')">
          <div class="icon"><i class="fas fa-mobile-alt"></i></div>
          <div class="name">USSD</div>
        </div>
      </div>
      <div style="margin-top:16px;">
        <label>Amount to Pay (${currency})</label>
        <input type="number" id="fPayAmount" value="${totalDue}" min="1" max="${totalDue}" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:16px;width:100%;box-sizing:border-box;">
      </div>`;
    }
  }

  var btnText = gateway ? 'Proceed to Payment' : 'Pay Now';
  var btnAction = gateway ? 'processGatewayPayment()' : 'processPayment()';

  openModal(`
    <h3><i class="fas fa-credit-card"></i> Online Fee Payment</h3>
    ${body}
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      ${totalDue > 0 ? `<button class="btn btn-success" onclick="${btnAction}"><i class="fas fa-check"></i> ${btnText}</button>` : ''}
    </div>
  `);
  if (!gateway) { window.__selectedPaymentMethod = 'card'; }
}

function selectPaymentMethod(el, method) {
  document.querySelectorAll('.payment-method .method-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  window.__selectedPaymentMethod = method;
}

function processPayment() {
  if (!currentStudent) return;
  const amount = parseFloat(document.getElementById('fPayAmount')?.value ?? '');
  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  const method = window.__selectedPaymentMethod || 'card';
  showLoading();
  setTimeout(() => {
    hideLoading();
    const ref = 'PAY-' + Date.now().toString(36).toUpperCase();
    if (!data.paymentTransactions) data.paymentTransactions = [];
    data.paymentTransactions.push({
      id: genId('PT'), studentId: currentStudent.id,
      amount, method, reference: ref,
      date: new Date().toISOString().split('T')[0],
      status: 'successful', gateway: 'manual'
    });
    let remaining = amount;
    data.fees.filter(f => f.studentId === currentStudent.id && f.status !== 'paid').forEach(f => {
      const bal = f.amount - f.paid;
      if (remaining <= 0) return;
      const pay = Math.min(remaining, bal);
      f.paid += pay;
      remaining -= pay;
      f.status = f.paid >= f.amount ? 'paid' : 'partial';
    });
    saveData();
    logActivity(`Payment: ${amount} via ${method} (Ref: ${ref})`);
    closeModal();
    toast(`Payment of $${amount} successful! Ref: ${ref}`);
    if (typeof renderStudentPortal === 'function') renderStudentPortal();
  }, 1500);
}

function processGatewayPayment() {
  if (!currentStudent) return;
  const amount = parseFloat(document.getElementById('fPayAmount')?.value ?? '');
  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  if (!isGatewayActive()) { toast('Payment gateway not configured', 'error'); return; }

  var s = currentStudent;
  var email = s.email || s.id + '@school.ng';
  var ref = generatePaymentRef();
  var config = getGatewayConfig();

  closeModal();
  showLoading();

  initiateGatewayPayment(amount, email, s.name, ref,
    function(response) {
      hideLoading();
      var gwRef = response.reference || ref;
      var gwMethod = 'Card';
      if (response.card) gwMethod = 'Card (' + (response.card.brand || '') + ' ' + (response.card.last4 || '') + ')';
      recordGatewayTransaction(amount, gwMethod, gwRef, config.provider);
      toast('Payment of ' + (config.currency || 'NGN') + ' ' + amount.toLocaleString() + ' successful! Ref: ' + gwRef);
      if (typeof renderStudentPortal === 'function') renderStudentPortal();
    },
    function() {
      hideLoading();
      toast('Payment cancelled or window closed.', 'info');
    }
  );
}

// ===== 14. MULTI-LANGUAGE SUPPORT =====
function initLanguageSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const langs = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'yo', label: 'YO', name: 'Yorùbá' },
    { code: 'ha', label: 'HA', name: 'Hausa' },
    { code: 'ig', label: 'IG', name: 'Igbo' }
  ];
  const currentLang = data.currentLanguage || 'en';
  container.innerHTML = `<div class="lang-selector">${langs.map(l =>
    `<button class="lang-btn ${l.code === currentLang ? 'active' : ''}" onclick="switchLanguage('${l.code}')" title="${l.name}">${l.label}</button>`
  ).join('')}</div>`;
}

function switchLanguage(code) {
  data.currentLanguage = code;
  saveData();
  initLanguageSelector('langSelector');
  initLanguageSelector('tchLangSelector');
  initLanguageSelector('stuLangSelector');
  initLanguageSelector('parentLangSelector');
  applyTranslations();
  // Re-render current portal to apply translations to dynamic content
  if (typeof currentAdmin !== 'undefined' && currentAdmin && typeof renderAll === 'function') renderAll();
  else if (typeof currentTeacher !== 'undefined' && currentTeacher && typeof renderTeacherPortal === 'function') renderTeacherPortal();
  else if (typeof currentStudent !== 'undefined' && currentStudent && typeof renderStudentPortal === 'function') renderStudentPortal();
  else if (typeof currentParent !== 'undefined' && currentParent && typeof renderParentPortal === 'function') renderParentPortal();
  toast(`Language switched to ${code.toUpperCase()}`);
}

function applyTranslations() {
  const lang = data.currentLanguage || 'en';
  const t = data.translations?.[lang] || data.translations?.en || {};
  // Apply translations to elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t[key];
      else el.textContent = t[key];
    }
  });
  // Translate all <th> cells by matching text
  document.querySelectorAll('th').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    for (const [key, val] of Object.entries(t)) {
      if (txt === key.toLowerCase() || txt === val.toLowerCase()) {
        if (typeof val === 'string') { el.textContent = val; break; }
      }
    }
  });
  // Translate all <h2>, <h3> panel headers by matching text
  document.querySelectorAll('h2, h3').forEach(el => {
    if (el.closest('.student-tabs')) return;
    if (el.dataset.i18n) return;
    const txt = el.textContent.trim().toLowerCase();
    for (const [key, val] of Object.entries(t)) {
      if (typeof val === 'string' && (txt === key.toLowerCase() || txt === val.toLowerCase())) {
        el.textContent = val; break;
      }
    }
  });
  // Translate all empty-state <p> and button text by matching
  document.querySelectorAll('.empty-state p, .btn, .card-header h2, .card h3').forEach(el => {
    if (el.dataset.i18n) return;
    const txt = el.textContent.trim().toLowerCase();
    for (const [key, val] of Object.entries(t)) {
      if (typeof val === 'string' && (txt === key.toLowerCase() || txt === val.toLowerCase())) {
        el.textContent = val; break;
      }
    }
  });
  // Update title
  if (t.siteTitle) {
    document.title = t.siteTitle + ' - SCHOOL MANAGEMENT PLATFORM';
    document.querySelectorAll('.footer-top-bar .logo').forEach(el => {
      var siteTitle = (typeof data !== 'undefined' && data && data.schoolName) ? data.schoolName : 'EDUVERSE';
      var logoUrl = '';
      try { if (data && data.schoolProfile && data.schoolProfile.logoUrl) logoUrl = data.schoolProfile.logoUrl; } catch(e) {}
      if (el.textContent.trim().startsWith(siteTitle) || el.textContent.trim().startsWith('EDUVERSE')) {
        if (logoUrl) {
          el.innerHTML = `<img class="school-logo-img" src="${htmlEscape(logoUrl)}" alt="${htmlEscape(siteTitle)}" style="height:36px;border-radius:4px;"> ${htmlEscape(t.siteTitle)}`;
        } else {
          el.innerHTML = htmlEscape(t.siteTitle);
        }
      }
    });
  }
}

// ===== 15. ID CARD GENERATOR =====
function renderIDCards(containerId, filterType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let cards = data.idCards || [];
  if (filterType) cards = cards.filter(c => c.type === filterType || (c.type === undefined && filterType === 'student')); // fallback for old-schema student cards
  var schoolName = (typeof data !== 'undefined' && data && data.schoolName) ? data.schoolName : 'EDUVERSE';
  var schoolMotto = (typeof data !== 'undefined' && data && data.schoolMotto) ? data.schoolMotto : 'EDUVERSE';
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;color:var(--text-light);">${cards.length} cards issued</span>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm btn-primary" onclick="showIssueIDCardModal('student')"><i class="fas fa-plus"></i> Student Card</button>
        <button class="btn btn-sm btn-success" onclick="showIssueIDCardModal('teacher')"><i class="fas fa-plus"></i> Staff Card</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">
      ${cards.map(c => {
        const person = c.type === 'teacher' ? getTeacher(c.personId) : getStudent(c.personId || c.studentId);
        const name = person?.name || 'Unknown';
        const idNum = c.type === 'teacher' ? person?.id || c.personId : person?.id || c.studentId;
        const avatarUrl = c.photoUrl || getAvatarUrl(name);
        const cls = c.type === 'teacher' ? (person?.assignedClass || '--') : (person?.class || '--');
        return `<div class="id-card">
          <div class="id-card-header">
            <div class="school-name">${htmlEscape(schoolName)}</div>
            <div class="school-motto">${htmlEscape(schoolMotto)}</div>
          </div>
          <div class="id-card-photo">
            <img src="${avatarUrl}" alt="${htmlEscape(name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy">
            <span class="initial" style="display:none;">${name.charAt(0).toUpperCase()}</span>
          </div>
          <div class="id-card-body">
            <div class="name">${htmlEscape(name)}</div>
            <div class="id-number">${c.type === 'teacher' ? 'STAFF' : 'STUDENT'} ID: ${htmlEscape(idNum)}</div>
            <div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">${c.type === 'teacher' ? 'Class: ' : 'Grade: '}${htmlEscape(cls)}</div>
            <div class="id-card-details">
              <div><span class="label">Type:</span> <span class="value">${c.type === 'teacher' ? 'Staff' : 'Student'}</span></div>
              <div><span class="label">Issued:</span> <span class="value">${htmlEscape(c.issuedDate)}</span></div>
              <div><span class="label">Expires:</span> <span class="value">${htmlEscape(c.expiryDate)}</span></div>
              <div><span class="label">Status:</span> <span class="value" style="color:${c.status === 'active' ? 'var(--success)' : 'var(--danger)'};">${c.status || 'active'}</span></div>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#aaa;border-top:1px solid #f0f4f8;padding-top:8px;">
              <i class="fas fa-phone"></i> Contact: ${htmlEscape(person?.contact || person?.email || '--')} 
              ${c.type === 'teacher' ? '' : '| <i class="fas fa-users"></i> ' + htmlEscape(cls)}
            </div>
            <div style="margin-top:12px;">
              <button class="btn btn-sm btn-primary" onclick="printIDCard('${c.id}')"><i class="fas fa-print"></i> Print</button>
              <button class="btn btn-sm btn-success" onclick="setCardPhoto('${c.id}')"><i class="fas fa-camera"></i> Photo</button>
              <button class="btn btn-sm btn-danger" onclick="deleteIDCard('${c.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${cards.length ? '' : '<div class="empty-state"><i class="fas fa-id-card"></i><p>No ID cards issued yet</p></div>'}
  `;
}

let pendingCardPhoto = null;

function getAvatarUrl(name) {
  if (!name) return '';
  const colors = ['f5a623','2ecc71','3498db','e74c3c','9b59b6','1abc9c','e67e22','34495e'];
  const hash = name.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];
  const initial = name.charAt(0).toUpperCase();
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='40' fill='%23${bg}'/%3E%3Ctext x='40' y='52' text-anchor='middle' font-size='36' font-weight='bold' fill='white' font-family='Arial'%3E${encodeURIComponent(initial)}%3C/text%3E%3C/svg%3E`;
}

function showIssueIDCardModal(type) {
  const opts = type === 'teacher' ? data.teachers.map(p => `<option value="${htmlEscape(p.id)}">${htmlEscape(p.name)} (${htmlEscape(p.id)})</option>`).join('')
    : data.students.map(p => `<option value="${htmlEscape(p.id)}">${htmlEscape(p.name)} (${htmlEscape(p.id)})</option>`).join('');
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(Date.now() + 365*86400000).toISOString().split('T')[0];
  openModal(`
    <h3><i class="fas fa-id-card"></i> Issue ${type === 'teacher' ? 'Staff' : 'Student'} ID Card</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Select ${type === 'teacher' ? 'Teacher' : 'Student'}</label>
        <select id="fIDPerson" style="width:100%;">${opts}</select>
      </div>
      <div class="form-group"><label>Issue Date</label><input type="date" id="fIDIssue" value="${today}"></div>
      <div class="form-group"><label>Expiry Date</label><input type="date" id="fIDExpiry" value="${nextYear}"></div>
      <div class="form-group" style="grid-column:1/-1;">
        <label><i class="fas fa-camera"></i> Photo</label>
        <div style="display:flex;align-items:center;gap:16px;">
          <div id="cardPhotoPreview" style="width:72px;height:72px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#999;overflow:hidden;flex-shrink:0;border:2px dashed #ccc;">
            <i class="fas fa-user"></i>
          </div>
          <div>
            <input type="file" id="fIDPhoto" accept="image/*" onchange="previewCardPhoto(event)" style="font-size:13px;">
            <p style="font-size:11px;color:var(--text-light);margin-top:4px;">Upload a passport photo for the ID card</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal();pendingCardPhoto=null;" style="color:var(--text);border-color:#e2e8f0;">Cancel</button>
      <button class="btn btn-primary" onclick="saveIDCard('${type}')"><i class="fas fa-save"></i> Issue Card</button>
    </div>
  `);
  pendingCardPhoto = null;
}

function previewCardPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    pendingCardPhoto = ev.target.result;
    const preview = document.getElementById('cardPhotoPreview');
    if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(file);
}

function setCardPhoto(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const card = data.idCards.find(c => c.id === id);
      if (card) { card.photoUrl = ev.target.result; saveData(); renderIDCards('adminIDCards'); toast('Photo updated'); }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function saveIDCard(type) {
  const personId = (document.getElementById('fIDPerson')?.value ?? '');
  const issuedDate = (document.getElementById('fIDIssue')?.value ?? '');
  const expiryDate = (document.getElementById('fIDExpiry')?.value ?? '');
  const photoUrl = pendingCardPhoto || null;
  if (!personId || !issuedDate || !expiryDate) { toast('Please fill all fields', 'error'); return; }
  // Check across both old (studentId) and new (personId) field formats
  const existing = data.idCards.find(c =>
    (c.personId === personId || c.studentId === personId) &&
    c.status !== 'deactivated'
  );
  if (existing) {
    if (!confirm(`An active ${type} ID card already exists for this person. Deactivate the old card and issue a new one?`)) return;
    existing.status = 'deactivated';
  }
  data.idCards.push({ id: genId('IDC'), type, personId, issuedDate, expiryDate, status: 'active', photoUrl });
  saveData();
  pendingCardPhoto = null;
  closeModal();
  renderIDCards('adminIDCards');
  toast(`${type === 'teacher' ? 'Staff' : 'Student'} ID card issued`);
}

function printIDCard(id) {
  const card = data.idCards.find(c => c.id === id);
  if (!card) return;
  const person = card.type === 'teacher' ? getTeacher(card.personId) : getStudent(card.personId || card.studentId);
  const name = person?.name || 'Unknown';
  const idNum = person?.id || card.personId;
  var schoolName = (data && data.schoolName) ? data.schoolName : 'EDUVERSE';
  var schoolMotto = (data && data.schoolMotto) ? data.schoolMotto : 'EDUVERSE';
  const photoHtml = card.photoUrl
    ? `<img src="${card.photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `${name.charAt(0).toUpperCase()}`;
  const printWin = window.open('', '_blank', 'width=400,height=600');
  printWin.document.write(`
    <!DOCTYPE html><html><head><title>ID Card</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
      body { display:flex;justify-content:center;align-items:center;min-height:100vh;background:#333;font-family:Arial,sans-serif; }
      .id-card { width:340px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3); }
      .id-card-header { background:linear-gradient(135deg,#1a3a5c,#2a5a8c);padding:24px;text-align:center;color:white; }
      .id-card-header .school-name { font-weight:700;font-size:16px; }
      .id-card-header .school-motto { font-size:11px;opacity:0.8; }
      .id-card-photo { width:88px;height:88px;border-radius:50%;background:#f5a623;margin:-44px auto 0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:#1a3a5c;border:4px solid white;position:relative;z-index:2;overflow:hidden; }
      .id-card-body { padding:16px 24px 24px;text-align:center; }
      .id-card-body .name { font-size:20px;font-weight:700; }
      .id-card-body .id-number { font-size:14px;color:#666;margin-bottom:12px; }
      .id-card-details { display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:13px;text-align:left; }
      .id-card-details .label { color:#999; }
      .id-card-details .value { font-weight:600; }
      .card-barcode { margin-top:12px;text-align:center; }
      .card-barcode svg { width:180px;height:40px; }
    </style>
    </head><body>
    <div class="id-card">
      <div class="id-card-header">
        <div class="school-name">${htmlEscape(schoolName)}</div>
        <div class="school-motto">${htmlEscape(schoolMotto)}</div>
      </div>
      <div class="id-card-photo">${photoHtml}</div>
      <div class="id-card-body">
        <div class="name">${htmlEscape(name)}</div>
        <div class="id-number">${card.type === 'teacher' ? 'STAFF' : 'STUDENT'} ID: ${htmlEscape(idNum)}</div>
        <div class="id-card-details">
          <div><span class="label">Type:</span> <span class="value">${card.type === 'teacher' ? 'Staff' : 'Student'}</span></div>
          <div><span class="label">Class:</span> <span class="value">${htmlEscape(person?.class || person?.assignedClass || '--')}</span></div>
          <div><span class="label">Issued:</span> <span class="value">${htmlEscape(card.issuedDate)}</span></div>
          <div><span class="label">Expires:</span> <span class="value">${htmlEscape(card.expiryDate)}</span></div>
        </div>
        <div class="card-barcode">
          <svg viewBox="0 0 180 30"><rect x="2" y="2" width="4" height="26" fill="#333"/><rect x="8" y="4" width="2" height="24" fill="#333"/><rect x="12" y="2" width="4" height="26" fill="#333"/><rect x="18" y="6" width="2" height="22" fill="#333"/><rect x="22" y="2" width="6" height="26" fill="#333"/><rect x="30" y="4" width="2" height="24" fill="#333"/><rect x="34" y="2" width="4" height="26" fill="#333"/><rect x="40" y="5" width="2" height="21" fill="#333"/><rect x="44" y="2" width="6" height="26" fill="#333"/><rect x="52" y="3" width="2" height="24" fill="#333"/><rect x="56" y="2" width="4" height="26" fill="#333"/><rect x="62" y="6" width="2" height="22" fill="#333"/><rect x="66" y="2" width="5" height="26" fill="#333"/><rect x="73" y="4" width="2" height="24" fill="#333"/><rect x="77" y="2" width="4" height="26" fill="#333"/><rect x="83" y="2" width="6" height="26" fill="#333"/><rect x="91" y="5" width="2" height="21" fill="#333"/><rect x="95" y="2" width="3" height="26" fill="#333"/><rect x="100" y="3" width="4" height="24" fill="#333"/><rect x="106" y="2" width="5" height="26" fill="#333"/><rect x="113" y="6" width="2" height="22" fill="#333"/><rect x="117" y="2" width="4" height="26" fill="#333"/><rect x="123" y="4" width="2" height="24" fill="#333"/><rect x="127" y="2" width="6" height="26" fill="#333"/><rect x="135" y="2" width="2" height="26" fill="#333"/><rect x="139" y="5" width="4" height="21" fill="#333"/><rect x="145" y="2" width="3" height="26" fill="#333"/><rect x="150" y="3" width="4" height="24" fill="#333"/><rect x="156" y="2" width="5" height="26" fill="#333"/><rect x="163" y="6" width="2" height="22" fill="#333"/><rect x="167" y="2" width="4" height="26" fill="#333"/><rect x="173" y="4" width="2" height="24" fill="#333"/></svg>
        </div>
      </div>
    </div>
    <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>
  `);
  printWin.document.close();
}

function deleteIDCard(id) {
  if (!confirm('Delete this ID card?')) return;
  data.idCards = data.idCards.filter(c => c.id !== id);
  saveData();
  renderIDCards('adminIDCards');
  toast('ID card deleted');
}

// ===== ADMIN PAYMENTS TABLE =====
function renderPayments() {
  const tbody = document.getElementById('paymentsTable');
  const empty = document.getElementById('paymentsEmpty');
  if (!tbody) return;
  const txns = data.paymentTransactions || [];
  if (txns.length) {
    var gwConfig = getGatewayConfig();
    var sym = gwConfig && gwConfig.currency ? (gwConfig.currency === 'NGN' ? '₦' : gwConfig.currency === 'USD' ? '$' : gwConfig.currency) : '₦';
    var gatewayColors = { paystack: '#0c59db', flutterwave: '#f35a30', stripe: '#635bff' };
    tbody.innerHTML = txns.map(p => {
      const s = getStudent(p.studentId);
      var gColor = gatewayColors[p.gateway] || '#718096';
      return `<tr><td>${s ? htmlEscape(s.name) : htmlEscape(p.studentId)}</td><td>${sym}${p.amount}</td><td>${p.gateway ? '<span class="badge" style="background:' + gColor + '20;color:' + gColor + ';font-weight:600;">' + htmlEscape(p.gateway.charAt(0).toUpperCase() + p.gateway.slice(1)) + '</span>' : '<span class="badge" style="background:#e2e8f0;color:#4a5568;">Manual</span>'}</td><td>${htmlEscape(p.method || '—')}</td><td style="font-size:12px;font-family:monospace;">${htmlEscape(p.reference || '—')}</td><td>${p.date}</td><td><span class="badge ${p.status === 'successful' ? 'badge-paid' : 'badge-absent'}">${htmlEscape(p.status)}</span></td></tr>`;
    }).join('');
    if (empty) empty.style.display = 'none';
  } else { tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; }
}

// ===== ADMIN TERMS TABLE =====
function renderTerms() {
  const tbody = document.getElementById('termsTable');
  if (!tbody) return;
  tbody.innerHTML = data.academicTerms.map(t => `<tr>
    <td><strong>${htmlEscape(t.name)}</strong></td>
    <td>${htmlEscape(t.startDate)}</td>
    <td>${htmlEscape(t.endDate)}</td>
    <td><span class="badge ${t.isActive ? 'badge-paid' : 'badge-absent'}">${t.isActive ? 'Active' : 'Inactive'}</span></td>
  </tr>`).join('');
  initTermSelector('adminTermSelector');
}

// ===== STUDENT LIBRARY VIEW =====
function renderStudentLibrary() {
  if (!currentStudent) return;
  const container = document.getElementById('stuLibraryView');
  if (!container) return;
  const books = data.library || [];
  const myBorrows = data.borrowings.filter(b => b.studentId === currentStudent.id);
  container.innerHTML = `
    <h4 style="font-weight:600;margin-bottom:12px;">My Borrowed Books</h4>
    ${myBorrows.length ? `<div style="overflow-x:auto;margin-bottom:16px;"><table><thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Status</th></tr></thead><tbody>
      ${myBorrows.map(br => {
        const book = data.library.find(b => b.id === br.bookId);
        const bClass = br.status === 'active' ? 'badge-paid' : br.status === 'overdue' ? 'badge-absent' : 'badge-excused';
        return `<tr><td>${book ? htmlEscape(book.title) : htmlEscape(br.bookId)}</td><td>${htmlEscape(br.borrowDate)}</td><td>${htmlEscape(br.dueDate)}</td><td><span class="badge ${bClass}">${br.status}</span></td></tr>`;
      }).join('')}</tbody></table></div>` : '<p class="empty-state" style="margin-bottom:16px;">No books borrowed</p>'}
    <h4 style="font-weight:600;margin-bottom:12px;">Available Books</h4>
    <div class="library-grid">
      ${books.filter(b => b.available > 0).map(b => {
        const status = b.available <= 2 ? 'low' : 'available';
        const hasEbook = !!(b.ebookUrl);
        return `<div class="lib-card${hasEbook?' lib-card-has-ebook':''}">
          ${hasEbook ? '<div class="lib-ebook-badge"><i class="fas fa-file-upload"></i> Ebook</div>' : ''}
          <div class="book-title">${htmlEscape(b.title)}</div>
          <div class="book-author">${htmlEscape(b.author)}</div>
          <div class="book-meta"><span>ISBN: ${htmlEscape(b.isbn)}</span><span class="lib-availability ${status}">${b.available} left</span></div>
          ${hasEbook ? '<div style="margin-top:8px;"><button class="btn btn-sm btn-success" onclick="viewEbook(\'' + b.id + '\')" style="font-size:11px;"><i class="fas fa-book-open"></i> Read Ebook</button></div>' : ''}
        </div>`;
      }).join('')}
    </div>
    ${books.filter(b => b.available > 0).length ? '' : '<p class="empty-state">No books currently available</p>'}
  `;
}

// ===== STUDENT PAYMENT VIEW =====
function renderStudentPayment() {
  if (!currentStudent) return;
  const container = document.getElementById('stuPaymentView');
  if (!container) return;
  const s = currentStudent;
  const pendingFees = data.fees.filter(f => f.studentId === s.id && f.status !== 'paid');
  const totalDue = pendingFees.reduce((sum, f) => sum + (f.amount - f.paid), 0);
  const txns = (data.paymentTransactions || []).filter(p => p.studentId === s.id);
  var gwConfig = typeof getGatewayConfig === 'function' ? getGatewayConfig() : null;
  var sym = gwConfig && gwConfig.currency ? (gwConfig.currency === 'NGN' ? '₦' : gwConfig.currency === 'USD' ? '$' : gwConfig.currency + ' ') : '₦';
  var gatewayColors = { paystack: '#0c59db', flutterwave: '#f35a30', stripe: '#635bff' };
  container.innerHTML = `
    <div style="margin-bottom:16px;">
      <div class="payment-card">
        <div class="label">Outstanding Balance</div>
        <div class="amount">${sym}${totalDue.toLocaleString()}</div>
      </div>
    </div>
    ${totalDue > 0 ? `<button class="btn btn-success" onclick="showPaymentPage()" style="margin-bottom:16px;"><i class="fas fa-credit-card"></i> Pay Now</button>` : ''}
    <h4 style="font-weight:600;margin-bottom:8px;">Payment History</h4>
    ${txns.length ? `<div style="overflow-x:auto;"><table><thead><tr><th>Amount</th><th>Gateway</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th></tr></thead><tbody>
      ${txns.map(p => { var gc = gatewayColors[p.gateway] || '#718096'; return `<tr><td>${sym}${p.amount}</td><td>${p.gateway ? '<span class="badge" style="background:' + gc + '20;color:' + gc + ';font-weight:600;">' + htmlEscape(p.gateway.charAt(0).toUpperCase() + p.gateway.slice(1)) + '</span>' : '<span class="badge" style="background:#e2e8f0;color:#4a5568;">Manual</span>'}</td><td>${htmlEscape(p.method || '—')}</td><td style="font-size:12px;font-family:monospace;">${htmlEscape(p.reference || '—')}</td><td>${p.date}</td><td><span class="badge ${p.status === 'successful' ? 'badge-paid' : 'badge-absent'}">${htmlEscape(p.status)}</span></td></tr>`; }).join('')}
    </tbody></table></div>` : '<p class="empty-state">No payment history</p>'}
  `;
}

// ===== LIBRARY LENDING SYSTEM — Circulation, Fines, Waitlists =====
const LIBRARY_FINE_PER_DAY = 50;

function _checkOverdueBorrows() {
  var today = new Date();
  (data.borrowings || []).forEach(function(br) {
    if (br.status === 'active' && br.dueDate) {
      var due = new Date(br.dueDate);
      if (today > due) br.status = 'overdue';
    }
  });
}

function calculateBorrowFine(borrowing) {
  if (!borrowing || (borrowing.status !== 'overdue' && borrowing.status !== 'active')) return 0;
  var due = new Date(borrowing.dueDate);
  var ret = borrowing.returnDate ? new Date(borrowing.returnDate) : new Date();
  if (ret <= due) return 0;
  var diffDays = Math.ceil((ret - due) / 86400000);
  return diffDays * LIBRARY_FINE_PER_DAY;
}

function showCirculationStats() {
  _checkOverdueBorrows();
  var borrowings = data.borrowings || [];
  var total = borrowings.length;
  var active = borrowings.filter(function(b) { return b.status === 'active'; }).length;
  var overdue = borrowings.filter(function(b) { return b.status === 'overdue'; }).length;
  var returned = borrowings.filter(function(b) { return b.status === 'returned'; }).length;
  var totalFine = borrowings.reduce(function(s, b) { return s + calculateBorrowFine(b); }, 0);
  var waitlisted = (data.waitlists || []).length;
  return { total: total, active: active, overdue: overdue, returned: returned, totalFine: totalFine, waitlisted: waitlisted };
}

function renderLibrary() {
  var container = document.getElementById('libraryView');
  if (!container) return;
  _checkOverdueBorrows();
  var books = data.library || [];
  var stats = showCirculationStats();

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--primary);">' + books.length + '</div><div style="font-size:11px;color:var(--text-light);">Books</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--success);">' + stats.active + '</div><div style="font-size:11px;color:var(--text-light);">Checked Out</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;' + (stats.overdue ? 'border-color:#e53e3e;' : '') + '"><div style="font-size:22px;font-weight:700;color:' + (stats.overdue ? '#e53e3e' : 'var(--text-light)') + ';">' + stats.overdue + '</div><div style="font-size:11px;color:' + (stats.overdue ? '#e53e3e' : 'var(--text-light)') + ';">Overdue</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:#dd6b20;">₦' + (stats.totalFine || 0).toLocaleString() + '</div><div style="font-size:11px;color:var(--text-light);">Total Fines</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--accent);">' + stats.waitlisted + '</div><div style="font-size:11px;color:var(--text-light);">Waitlisted</div></div>' +
    '</div>';

  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">' +
    '<button class="btn btn-primary btn-sm" onclick="showAddBookModal()"><i class="fas fa-plus"></i> Add Book</button>' +
    '<button class="btn btn-sm" style="background:#3182ce;color:white;" onclick="showBorrowModal()"><i class="fas fa-hand-holding"></i> Check Out</button>' +
    '<button class="btn btn-sm" style="background:#38a169;color:white;" onclick="showReturnModal()"><i class="fas fa-undo"></i> Check In</button>' +
    '<button class="btn btn-sm btn-outline" onclick="renderLibrary()"><i class="fas fa-sync"></i> Refresh</button>' +
    '</div>';

  html += '<div class="library-grid">';
  books.forEach(function(b) {
    var status = b.available > 0 ? (b.available <= 2 ? 'low' : 'available') : 'unavailable';
    var hasEbook = !!(b.ebookUrl);
    var waitlistCount = (data.waitlists || []).filter(function(w) { return w.bookId === b.id; }).length;
    html += '<div class="lib-card' + (hasEbook ? ' lib-card-has-ebook' : '') + '">' +
      (hasEbook ? '<div class="lib-ebook-badge"><i class="fas fa-file-upload"></i> Ebook</div>' : '') +
      '<div class="book-title">' + htmlEscape(b.title) + '</div>' +
      '<div class="book-author">by ' + htmlEscape(b.author) + '</div>' +
      '<div style="font-size:12px;color:var(--text-light);margin-bottom:6px;">ISBN: ' + htmlEscape(b.isbn) + ' | ' + htmlEscape(b.category) + '</div>' +
      '<div class="book-meta"><span>Total: ' + b.total + '</span><span class="lib-availability ' + status + '">' + b.available + ' avail</span></div>' +
      (b.available <= 0 && waitlistCount > 0 ? '<div style="font-size:11px;color:#dd6b20;margin-top:4px;"><i class="fas fa-clock"></i> ' + waitlistCount + ' on waitlist</div>' : '') +
      '<div class="book-actions">' +
      (hasEbook ? '<button class="btn btn-sm btn-success" onclick="viewEbook(\'' + b.id + '\')" style="font-size:11px;"><i class="fas fa-book-open"></i> Read</button>' : '') +
      '<button class="btn btn-sm btn-outline" onclick="showEditBookModal(\'' + b.id + '\')" style="font-size:11px;"><i class="fas fa-edit"></i></button>' +
      '<button class="btn btn-sm btn-outline" onclick="deleteBook(\'' + b.id + '\')" style="font-size:11px;color:var(--danger);"><i class="fas fa-trash"></i></button>' +
      '</div></div>';
  });
  html += '</div>';
  if (!books.length) html += '<div class="empty-state"><i class="fas fa-book"></i><p>No books in catalog</p></div>';

  html += '<h3 style="margin-top:20px;font-size:15px;font-weight:600;"><i class="fas fa-list"></i> Borrowing Records</h3>';
  html += '<div style="margin-top:8px;overflow-x:auto;"><table class="tbl"><thead><tr><th>Book</th><th>Student</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>';
  var borrows = (data.borrowings || []).slice().sort(function(a, b) { return b.borrowDate < a.borrowDate ? 1 : -1; });
  borrows.forEach(function(br) {
    var book = data.library.find(function(b) { return b.id === br.bookId; });
    var student = getStudent(br.studentId);
    var fine = calculateBorrowFine(br);
    var bClass = br.status === 'active' ? 'badge-paid' : br.status === 'overdue' ? 'badge-absent' : 'badge-excused';
    html += '<tr><td>' + (book ? htmlEscape(book.title) : htmlEscape(br.bookId)) + '</td>' +
      '<td>' + (student ? htmlEscape(student.name) : htmlEscape(br.studentId)) + '</td>' +
      '<td>' + htmlEscape(br.borrowDate) + '</td>' +
      '<td>' + htmlEscape(br.dueDate) + '</td>' +
      '<td>' + (br.returnDate || '—') + '</td>' +
      '<td>' + (fine > 0 ? '<span style="color:#e53e3e;font-weight:600;">₦' + fine.toLocaleString() + '</span>' : '—') + '</td>' +
      '<td><span class="badge ' + bClass + '">' + htmlEscape(br.status) + '</span></td></tr>';
  });
  html += '</tbody></table></div>';
  if (!borrows.length) html += '<p class="empty-state">No borrowing records</p>';

  html += '<h3 style="margin-top:20px;font-size:15px;font-weight:600;"><i class="fas fa-clock"></i> Waitlists</h3>';
  var waitlists = data.waitlists || [];
  if (waitlists.length) {
    html += '<div style="overflow-x:auto;margin-top:8px;"><table class="tbl"><thead><tr><th>Book</th><th>Student</th><th>Joined</th><th>Action</th></tr></thead><tbody>';
    waitlists.forEach(function(w) {
      var book = data.library.find(function(b) { return b.id === w.bookId; });
      var student = getStudent(w.studentId);
      html += '<tr><td>' + (book ? htmlEscape(book.title) : htmlEscape(w.bookId)) + '</td>' +
        '<td>' + (student ? htmlEscape(student.name) : htmlEscape(w.studentId)) + '</td>' +
        '<td>' + w.joinedAt + '</td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="removeWaitlist(\'' + w.id + '\')" style="font-size:11px;"><i class="fas fa-times"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<p class="empty-state">No active waitlists</p>';
  }

  container.innerHTML = html;
}

function showBorrowModal() {
  var bookOpts = (data.library || []).filter(function(b) { return b.available > 0; }).map(function(b) { return '<option value="' + b.id + '">' + htmlEscape(b.title) + ' (' + b.available + ' available)</option>'; }).join('');
  var stuOpts = (data.students || []).map(function(s) { return '<option value="' + htmlEscape(s.id) + '">' + htmlEscape(s.name) + ' (' + htmlEscape(s.id) + ')</option>'; }).join('');
  if (!bookOpts) { toast('No books available to borrow', 'error'); return; }
  var today = new Date().toISOString().split('T')[0];
  var due = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  openModal('<h3><i class="fas fa-hand-holding"></i> Check Out Book</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Book</label><select id="fBorrowBook">' + bookOpts + '</select></div>' +
    '<div class="form-group"><label>Student</label><select id="fBorrowStudent">' + stuOpts + '</select></div>' +
    '<div class="form-group"><label>Borrow Date</label><input type="date" id="fBorrowDate" value="' + today + '"></div>' +
    '<div class="form-group"><label>Due Date (14 days)</label><input type="date" id="fBorrowDue" value="' + due + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;font-size:12px;color:var(--text-light);">Overdue fine: <strong>₦' + LIBRARY_FINE_PER_DAY + '/day</strong></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-success" onclick="saveBorrow()"><i class="fas fa-check"></i> Borrow</button></div>');
}

function saveBorrow() {
  var bookId = document.getElementById('fBorrowBook')?.value ?? '';
  var studentId = document.getElementById('fBorrowStudent')?.value ?? '';
  var borrowDate = document.getElementById('fBorrowDate')?.value ?? '';
  var dueDate = document.getElementById('fBorrowDue')?.value ?? '';
  if (!borrowDate || !dueDate) { toast('Please fill all fields', 'error'); return; }
  var book = data.library.find(function(b) { return b.id === bookId; });
  if (!book || book.available < 1) { toast('Book not available', 'error'); return; }
  book.available--;
  data.borrowings.push({ id: genId('BRW'), bookId: bookId, studentId: studentId, borrowDate: borrowDate, dueDate: dueDate, returnDate: null, status: 'active' });
  saveData();
  closeModal();
  renderLibrary();
  toast('Book checked out successfully. Due: ' + dueDate);
  if (typeof addNotification === 'function') {
    try { addNotification(studentId, 'library', 'Borrowed "' + book.title + '" — due ' + dueDate + '. Overdue fine: ₦' + LIBRARY_FINE_PER_DAY + '/day'); } catch(e) {}
  }
}

function showReturnModal() {
  var active = (data.borrowings || []).filter(function(br) { return br.status === 'active' || br.status === 'overdue'; });
  var opts = active.map(function(br) {
    var book = data.library.find(function(b) { return b.id === br.bookId; });
    var student = getStudent(br.studentId);
    var fine = calculateBorrowFine(br);
    return '<option value="' + br.id + '">' + (book ? htmlEscape(book.title) : htmlEscape(br.bookId)) + ' — ' + (student ? htmlEscape(student.name) : htmlEscape(br.studentId)) + (fine > 0 ? ' (Fine: ₦' + fine.toLocaleString() + ')' : '') + '</option>';
  }).join('');
  if (!opts) { toast('No active borrowings', 'error'); return; }
  openModal('<h3><i class="fas fa-undo"></i> Check In Book</h3>' +
    '<div class="form-group"><label>Select Borrowing</label><select id="fReturnBorrow">' + opts + '</select></div>' +
    '<div class="form-group"><label>Return Date</label><input type="date" id="fReturnDate" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveReturn()"><i class="fas fa-check"></i> Return</button></div>');
}

function saveReturn() {
  var brId = document.getElementById('fReturnBorrow')?.value ?? '';
  var returnDate = document.getElementById('fReturnDate')?.value ?? '';
  var borrow = (data.borrowings || []).find(function(b) { return b.id === brId; });
  if (!borrow) return;
  var fine = calculateBorrowFine(borrow);
  borrow.returnDate = returnDate;
  borrow.status = 'returned';
  var book = data.library.find(function(b) { return b.id === borrow.bookId; });
  if (book) book.available = Math.min(book.available + 1, book.total);
  saveData();
  closeModal();
  var msg = 'Book returned successfully.';
  if (fine > 0) msg += ' Overdue fine: ₦' + fine.toLocaleString();
  renderLibrary();
  toast(msg);
  _processWaitlist(borrow.bookId);
}

function _processWaitlist(bookId) {
  var waitlists = data.waitlists || [];
  var next = waitlists.find(function(w) { return w.bookId === bookId; });
  if (!next) return;
  var book = data.library.find(function(b) { return b.id === bookId; });
  if (!book || book.available < 1) return;
  data.waitlists = waitlists.filter(function(w) { return w.id !== next.id; });
  saveData();
  if (typeof addNotification === 'function') {
    try {
      addNotification(next.studentId, 'library', 'Good news! "' + (book ? book.title : '') + '" is now available. Visit the library to borrow it.');
      var stu = getStudent(next.studentId);
      if (stu && stu.email) addNotification(stu.email, 'library', '"' + (book ? book.title : '') + '" is now available.');
    } catch(e) {}
  }
  toast('Waitlist: "' + (book ? book.title : '') + '" — notified next student');
}

function joinWaitlist(bookId) {
  if (!currentStudent) { toast('Please log in as a student', 'error'); return; }
  var existing = (data.waitlists || []).some(function(w) { return w.bookId === bookId && w.studentId === currentStudent.id; });
  if (existing) { toast('You are already on the waitlist for this book', 'info'); return; }
  if (!data.waitlists) data.waitlists = [];
  data.waitlists.push({ id: genId('WTL'), bookId: bookId, studentId: currentStudent.id, joinedAt: new Date().toISOString().split('T')[0] });
  saveData();
  renderStudentLibrary();
  toast('You have been added to the waitlist');
}

function leaveWaitlist(bookId) {
  if (!currentStudent) return;
  data.waitlists = (data.waitlists || []).filter(function(w) { return !(w.bookId === bookId && w.studentId === currentStudent.id); });
  saveData();
  renderStudentLibrary();
  toast('Removed from waitlist');
}

function removeWaitlist(id) {
  if (!confirm('Remove this waitlist entry?')) return;
  data.waitlists = (data.waitlists || []).filter(function(w) { return w.id !== id; });
  saveData();
  renderLibrary();
  toast('Waitlist entry removed');
}

function renderStudentLibrary() {
  if (!currentStudent) return;
  var container = document.getElementById('stuLibraryView');
  if (!container) return;
  _checkOverdueBorrows();
  var books = data.library || [];
  var myBorrows = (data.borrowings || []).filter(function(b) { return b.studentId === currentStudent.id; });
  var myFines = myBorrows.reduce(function(s, b) { return s + calculateBorrowFine(b); }, 0);

  var html = '';
  if (myFines > 0) {
    html += '<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '<span style="color:#c53030;font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Outstanding Fines: ₦' + myFines.toLocaleString() + '</span>' +
      '<span style="font-size:12px;color:#9b2c2c;">Pay at the library desk</span></div>';
  }

  html += '<h4 style="font-weight:600;margin-bottom:8px;font-size:14px;">My Borrowed Books</h4>';
  if (myBorrows.length) {
    html += '<div style="overflow-x:auto;margin-bottom:16px;"><table class="tbl"><thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Fine</th><th>Status</th></tr></thead><tbody>';
    myBorrows.forEach(function(br) {
      var book = data.library.find(function(b) { return b.id === br.bookId; });
      var fine = calculateBorrowFine(br);
      var bClass = br.status === 'active' ? 'badge-paid' : br.status === 'overdue' ? 'badge-absent' : 'badge-excused';
      html += '<tr><td>' + (book ? htmlEscape(book.title) : htmlEscape(br.bookId)) + '</td>' +
        '<td>' + htmlEscape(br.borrowDate) + '</td>' +
        '<td>' + htmlEscape(br.dueDate) + '</td>' +
        '<td>' + (fine > 0 ? '<span style="color:#e53e3e;font-weight:600;">₦' + fine.toLocaleString() + '</span>' : '—') + '</td>' +
        '<td><span class="badge ' + bClass + '">' + htmlEscape(br.status) + '</span></td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<p class="empty-state" style="margin-bottom:16px;">No books borrowed</p>';
  }

  html += '<h4 style="font-weight:600;margin-bottom:8px;font-size:14px;">Available Books</h4>';
  var availBooks = books.filter(function(b) { return b.available > 0; });
  if (availBooks.length) {
    html += '<div class="library-grid">';
    availBooks.forEach(function(b) {
      var status = b.available <= 2 ? 'low' : 'available';
      var hasEbook = !!(b.ebookUrl);
      html += '<div class="lib-card' + (hasEbook ? ' lib-card-has-ebook' : '') + '">' +
        (hasEbook ? '<div class="lib-ebook-badge"><i class="fas fa-file-upload"></i> Ebook</div>' : '') +
        '<div class="book-title">' + htmlEscape(b.title) + '</div>' +
        '<div class="book-author">' + htmlEscape(b.author) + '</div>' +
        '<div class="book-meta"><span>ISBN: ' + htmlEscape(b.isbn) + '</span><span class="lib-availability ' + status + '">' + b.available + ' left</span></div>' +
        (hasEbook ? '<div style="margin-top:8px;"><button class="btn btn-sm btn-success" onclick="viewEbook(\'' + b.id + '\')" style="font-size:11px;"><i class="fas fa-book-open"></i> Read Ebook</button></div>' : '') +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<p class="empty-state">No books currently available</p>';
  }

  html += '<h4 style="font-weight:600;margin:16px 0 8px;font-size:14px;">Waitlist</h4>';
  var myWaitlists = (data.waitlists || []).filter(function(w) { return w.studentId === currentStudent.id; });
  var unavailableBooks = books.filter(function(b) { return b.available <= 0; });
  if (myWaitlists.length) {
    html += '<div style="margin-bottom:12px;font-size:13px;"><i class="fas fa-clock" style="color:#dd6b20;"></i> You are waitlisted for: ';
    myWaitlists.forEach(function(w, i) {
      var book = data.library.find(function(b) { return b.id === w.bookId; });
      html += (i > 0 ? ', ' : '') + '"' + (book ? htmlEscape(book.title) : '') + '"';
    });
    html += '</div>';
  }
  if (unavailableBooks.length) {
    html += '<div style="max-height:200px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">';
    unavailableBooks.forEach(function(b) {
      var onWaitlist = (data.waitlists || []).some(function(w) { return w.bookId === b.id && w.studentId === currentStudent.id; });
      var waitlistCount = (data.waitlists || []).filter(function(w) { return w.bookId === b.id; }).length;
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f4f8;">' +
        '<div><span style="font-weight:600;font-size:13px;">' + htmlEscape(b.title) + '</span><br><span style="font-size:11px;color:var(--text-light);">' + waitlistCount + ' on waitlist</span></div>' +
        (onWaitlist ? '<button class="btn btn-sm btn-outline" onclick="leaveWaitlist(\'' + b.id + '\')" style="font-size:11px;color:#e53e3e;">Leave</button>' : '<button class="btn btn-sm btn-primary" onclick="joinWaitlist(\'' + b.id + '\')" style="font-size:11px;">Join Waitlist</button>') +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<p class="empty-state">All books are currently available</p>';
  }

  container.innerHTML = html;
}

window.LIBRARY_FINE_PER_DAY = LIBRARY_FINE_PER_DAY;
window._checkOverdueBorrows = _checkOverdueBorrows;
window.calculateBorrowFine = calculateBorrowFine;
window.joinWaitlist = joinWaitlist;
window.leaveWaitlist = leaveWaitlist;
window.removeWaitlist = removeWaitlist;
window._processWaitlist = _processWaitlist;
window.showCirculationStats = showCirculationStats;
