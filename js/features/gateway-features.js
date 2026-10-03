// EduVerse - Gateway Features
// WhatsApp Gateway, Gate Access Scanner, Virtual Bank Accounts

// ===== WHATSAPP GATEWAY =====

function waNormalizePhone(phone) {
  if (!phone) return '';
  var digits = String(phone).replace(/[^0-9+]/g, '').replace(/^\+/, '');
  if (!digits) return '';
  if (digits.charAt(0) === '0') digits = '234' + digits.slice(1);
  else if (digits.length === 10) digits = '234' + digits;
  return digits;
}

function waBuildLink(phone, message) {
  var digits = waNormalizePhone(phone);
  if (!digits) return '';
  var url = 'https://wa.me/' + digits;
  if (message) url += '?text=' + encodeURIComponent(message);
  return url;
}

function waGetConfig() {
  if (!data.whatsappConfig) data.whatsappConfig = {};
  return data.whatsappConfig;
}

function waGetPhoneFromContact(contact) {
  if (!contact) return '';
  var c = String(contact).trim();
  if (c.indexOf('@') !== -1) return '';
  return waNormalizePhone(c) ? c : '';
}

function renderWhatsAppGateway() {
  var container = document.getElementById('admin-whatsappgateway');
  if (!container) return;
  var cfg = waGetConfig();
  var students = data.students || [];
  var teachers = data.teachers || [];
  var studentsWithPhone = students.filter(function(s) { return waGetPhoneFromContact(s.contact); });
  var teachersWithPhone = teachers.filter(function(t) { return waGetPhoneFromContact(t.contact); });
  var schoolPhone = cfg.phone || (data.schoolProfile && data.schoolProfile.whatsappNumber) || '';

  var html = '<div class="card-header"><h2><i class="fab fa-whatsapp" style="color:#25D366;"></i> WhatsApp Gateway</h2>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="btn btn-sm btn-primary" onclick="waSendTest()"><i class="fas fa-paper-plane"></i> Send Test</button>' +
    '<button class="btn btn-success btn-sm" style="background:#25D366;border-color:#25D366;" onclick="waMessagePersonModal(\'student\')"><i class="fas fa-user"></i> Message Student</button>' +
    '<button class="btn btn-success btn-sm" style="background:#25D366;border-color:#25D366;" onclick="waMessagePersonModal(\'teacher\')"><i class="fas fa-chalkboard-teacher"></i> Message Teacher</button>' +
    '</div></div>';
  html += '<p class="subtitle">Send fee reminders, announcements and direct messages to students and staff over WhatsApp</p>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + students.length + '</div><div style="font-size:12px;color:var(--text-light);">Students</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:#25D366;">' + studentsWithPhone.length + '</div><div style="font-size:12px;color:var(--text-light);">Student Numbers</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--info);">' + teachers.length + '</div><div style="font-size:12px;color:var(--text-light);">Teachers</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:#25D366;">' + teachersWithPhone.length + '</div><div style="font-size:12px;color:var(--text-light);">Staff Numbers</div></div>' +
    '</div>';

  html += '<div class="card" style="margin-bottom:16px;"><div class="card-header"><h3>Gateway Settings</h3></div>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>School WhatsApp Number</label><input id="waCfgPhone" class="form-input" placeholder="e.g. 0803 123 4567" value="' + htmlEscape(schoolPhone) + '"></div>' +
    '<div class="form-group"><label>Delivery Mode</label><select id="waCfgMode" class="form-input">' +
    '<option value="wame"' + (cfg.mode !== 'meta' ? ' selected' : '') + '>WhatsApp App (wa.me links)</option>' +
    '<option value="meta"' + (cfg.mode === 'meta' ? ' selected' : '') + '>Meta Cloud API (Business)</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Sender Name</label><input id="waCfgSender" class="form-input" placeholder="e.g. Greenfield School" value="' + htmlEscape(cfg.sender || (data.schoolProfile && data.schoolProfile.schoolName) || '') + '"></div>' +
    '<div class="form-group"><label>API Token <span style="font-size:11px;color:var(--text-light);">(stored on this device only)</span></label><input id="waCfgToken" type="password" class="form-input" placeholder="Meta Cloud API token" value="' + htmlEscape(cfg.token || '') + '"></div>' +
    '</div>' +
    '<div class="form-group" style="margin-top:8px;"><label>Fee Reminder Template</label><textarea id="waCfgFeeTpl" class="form-input" rows="3" placeholder="Message sent for fee reminders...">' + htmlEscape(cfg.feeTemplate || 'Dear Parent/Guardian, this is a reminder that school fees are due. Please complete payment at your convenience. Thank you.') + '</textarea></div>' +
    '<div class="form-group" style="margin-top:8px;"><label>Welcome Template</label><textarea id="waCfgWelcomeTpl" class="form-input" rows="3" placeholder="Welcome message...">' + htmlEscape(cfg.welcomeTemplate || 'Welcome to our school! We are glad to have you. Reach out any time for support.') + '</textarea></div>' +
    '<div style="margin-top:12px;"><button class="btn btn-primary" onclick="saveWhatsAppGateway()"><i class="fas fa-save"></i> Save Gateway Settings</button></div>' +
    '</div>';

  html += '<div class="card"><div class="card-header"><h3><i class="fas fa-bullhorn"></i> Fee Reminder Broadcast</h3>' +
    '<button class="btn btn-sm btn-outline" onclick="waCopyFeeTemplate()"><i class="fas fa-copy"></i> Copy Template</button></div>';
  var withPhone = studentsWithPhone;
  if (!withPhone.length) {
    html += '<div class="empty-state"><i class="fab fa-whatsapp"></i><p>No students with phone numbers yet. Add phone contacts to students to broadcast reminders.</p></div>';
  } else {
    html += '<div class="table-scroll"><table class="tbl" id="waBroadcastTable"><thead><tr><th>Student</th><th>Class</th><th>Contact</th><th>Action</th></tr></thead><tbody>';
    withPhone.forEach(function(s) {
      var phone = waGetPhoneFromContact(s.contact);
      html += '<tr><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.class || '') + '</td><td>' + htmlEscape(phone) + '</td>' +
        '<td><button class="btn btn-sm btn-success" style="background:#25D366;border-color:#25D366;" onclick="waMessageStudent(\'' + s.id + '\')"><i class="fab fa-whatsapp"></i> Send</button></td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function saveWhatsAppGateway() {
  var cfg = waGetConfig();
  cfg.phone = (document.getElementById('waCfgPhone') || {}).value ? document.getElementById('waCfgPhone').value.trim() : (cfg.phone || '');
  cfg.mode = (document.getElementById('waCfgMode') || {}).value || cfg.mode || 'wame';
  cfg.sender = (document.getElementById('waCfgSender') || {}).value ? document.getElementById('waCfgSender').value.trim() : (cfg.sender || '');
  cfg.token = (document.getElementById('waCfgToken') || {}).value !== undefined ? document.getElementById('waCfgToken').value : (cfg.token || '');
  cfg.feeTemplate = (document.getElementById('waCfgFeeTpl') || {}).value !== undefined ? document.getElementById('waCfgFeeTpl').value : (cfg.feeTemplate || '');
  cfg.welcomeTemplate = (document.getElementById('waCfgWelcomeTpl') || {}).value !== undefined ? document.getElementById('waCfgWelcomeTpl').value : (cfg.welcomeTemplate || '');
  if (cfg.phone && data.schoolProfile) data.schoolProfile.whatsappNumber = cfg.phone;
  saveData();
  toast('WhatsApp gateway settings saved');
  renderWhatsAppGateway();
}

function waSendTest() {
  var cfg = waGetConfig();
  var phone = cfg.phone || (data.schoolProfile && data.schoolProfile.whatsappNumber) || '';
  if (!phone) { toast('Set the school WhatsApp number first', 'error'); return; }
  var msg = 'Test message from ' + (cfg.sender || (data.schoolProfile && data.schoolProfile.schoolName) || 'EduVerse');
  var url = waBuildLink(phone, msg);
  if (!url) { toast('Invalid WhatsApp number', 'error'); return; }
  window.open(url, '_blank');
  toast('Opening WhatsApp with test message');
}

function waMessagePersonModal(role) {
  var list = (role === 'teacher' ? (data.teachers || []) : (data.students || [])).filter(function(p) {
    return waGetPhoneFromContact(p.contact);
  });
  if (!list.length) { toast('No ' + role + 's with phone contacts found', 'error'); return; }
  var opts = list.map(function(p) {
    return '<option value="' + p.id + '">' + htmlEscape(p.name) + ' (' + htmlEscape(p.contact) + ')</option>';
  }).join('');
  openModal('<h3><i class="fab fa-whatsapp" style="color:#25D366;"></i> Message ' + (role === 'teacher' ? 'Teacher' : 'Student') + '</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>' + (role === 'teacher' ? 'Teacher' : 'Student') + '</label><select id="waMsgPerson" class="form-input">' + opts + '</select></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Message</label><textarea id="waMsgText" class="form-input" rows="4">' + htmlEscape(waGetConfig().welcomeTemplate || '') + '</textarea></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-success" style="background:#25D366;border-color:#25D366;" onclick="waSendFromModal(\'' + role + '\')"><i class="fab fa-whatsapp"></i> Open WhatsApp</button>' +
    '<button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function waSendFromModal(role) {
  var id = (document.getElementById('waMsgPerson') || {}).value;
  var msg = (document.getElementById('waMsgText') || {}).value || '';
  if (!id) { toast('Select a recipient', 'error'); return; }
  var list = role === 'teacher' ? (data.teachers || []) : (data.students || []);
  var person = list.find(function(p) { return p.id === id; });
  if (!person) return;
  var url = waBuildLink(person.contact, msg);
  if (!url) { toast('No valid phone number for this contact', 'error'); return; }
  window.open(url, '_blank');
  closeModal();
  toast('Opening WhatsApp for ' + person.name);
}

function waMessageStudent(studentId) {
  var s = (data.students || []).find(function(x) { return x.id === studentId; });
  if (!s) return;
  var url = waBuildLink(s.contact, waGetConfig().feeTemplate || '');
  if (!url) { toast('No valid phone number for this student', 'error'); return; }
  window.open(url, '_blank');
  toast('Opening WhatsApp for ' + s.name);
}

function waCopyFeeTemplate() {
  var text = waGetConfig().feeTemplate || '';
  if (!text) { toast('No fee reminder template saved', 'error'); return; }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() { toast('Template copied'); }).catch(function() {
        try { document.execCommand('copy'); toast('Template copied'); } catch (e) { toast('Press Ctrl+C to copy'); }
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('Template copied');
    }
  } catch (e) { toast('Press Ctrl+C to copy'); }
}

// ===== GATE ACCESS SCANNER =====

function gateGetLog() {
  if (!data.gateAccessLog) data.gateAccessLog = [];
  return data.gateAccessLog;
}

function gateGetDirection() {
  return window._gateDirection || 'in';
}

function gateSetDirection(dir) {
  window._gateDirection = dir === 'out' ? 'out' : 'in';
  renderGateScanner();
}

function gateResolvePerson(code) {
  var c = String(code || '').trim();
  if (!c) return { found: false };
  var upper = c.toUpperCase();
  var stu = (data.students || []).find(function(s) {
    return String(s.id || '').toUpperCase() === upper ||
      String(s.idCard || '').toUpperCase() === upper ||
      String(s.username || '').toUpperCase() === upper;
  });
  if (stu) {
    var stuInactive = stu.status === 'inactive' || stu.status === 'graduated' || stu.status === 'suspended';
    return { found: true, person: stu, role: 'student', allowed: !stuInactive, reason: stuInactive ? 'Student is ' + stu.status : '' };
  }
  var tch = (data.teachers || []).find(function(t) {
    return String(t.id || '').toUpperCase() === upper ||
      String(t.idCard || '').toUpperCase() === upper ||
      String(t.username || '').toUpperCase() === upper;
  });
  if (tch) {
    var tchInactive = tch.status === 'inactive' || tch.status === 'suspended';
    return { found: true, person: tch, role: 'teacher', allowed: !tchInactive, reason: tchInactive ? 'Staff is ' + tch.status : '' };
  }
  return { found: false };
}

function gateScan(code) {
  var c = String(code || '').trim();
  if (!c) return;
  var r = gateResolvePerson(c);
  var dir = gateGetDirection();
  var entry = {
    id: genId('GAC'),
    code: c,
    personId: r.found ? r.person.id : '',
    name: r.found ? r.person.name : 'Unknown',
    role: r.found ? r.role : '',
    direction: dir,
    status: r.found ? (r.allowed ? 'allowed' : 'denied') : 'denied',
    reason: r.found ? (r.reason || '') : 'ID not recognised',
    at: new Date().toISOString()
  };
  var log = gateGetLog();
  log.unshift(entry);
  if (log.length > 500) log.length = 500;
  saveData();

  var input = document.getElementById('gateScanInput');
  if (input) { input.value = ''; input.focus(); }
  renderGateScanner();

  var banner = document.getElementById('gateResultBanner');
  if (banner) {
    var ok = entry.status === 'allowed';
    banner.style.display = 'block';
    banner.style.background = ok ? '#c6f6d5' : '#fed7d7';
    banner.style.color = ok ? '#22543d' : '#742a2a';
    banner.innerHTML = '<strong><i class="fas fa-' + (ok ? 'check-circle' : 'times-circle') + '"></i> ' + (ok ? 'ACCESS GRANTED' : 'ACCESS DENIED') + '</strong> — ' +
      htmlEscape(entry.name) + (entry.role ? ' (' + entry.role + ')' : '') + (entry.reason ? ' — ' + htmlEscape(entry.reason) : '') +
      ' <span style="font-size:12px;opacity:0.8;">' + new Date(entry.at).toLocaleTimeString() + ' · ' + dir.toUpperCase() + '</span>';
  }
  if (entry.status === 'allowed') toast(entry.name + ' — access granted');
  else toast(entry.name + ' — access denied', 'error');
}

function renderGateScanner() {
  var container = document.getElementById('admin-gatescanner');
  if (!container) return;
  var log = gateGetLog();
  var dir = gateGetDirection();
  var today = new Date().toISOString().split('T')[0];
  var inToday = log.filter(function(e) { return e.direction === 'in' && e.at.split('T')[0] === today; }).length;
  var outToday = log.filter(function(e) { return e.direction === 'out' && e.at.split('T')[0] === today; }).length;
  var deniedToday = log.filter(function(e) { return e.status === 'denied' && e.at.split('T')[0] === today; }).length;

  var html = '<div class="card-header"><h2><i class="fas fa-shield-halved"></i> Gate Access Scanner</h2>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="btn btn-sm ' + (dir === 'in' ? 'btn-primary' : 'btn-outline') + '" onclick="gateSetDirection(\'in\')"><i class="fas fa-sign-in-alt"></i> Entry</button>' +
    '<button class="btn btn-sm ' + (dir === 'out' ? 'btn-primary' : 'btn-outline') + '" onclick="gateSetDirection(\'out\')"><i class="fas fa-sign-out-alt"></i> Exit</button>' +
    '<button class="btn btn-export btn-sm" data-action="exportTableToCSV" data-args="gateAccessTable,gate_access_log"><i class="fas fa-download"></i> CSV</button>' +
    '<button class="btn btn-danger btn-sm" onclick="gateClearLog()"><i class="fas fa-trash"></i> Clear Log</button>' +
    '</div></div>';
  html += '<p class="subtitle">Scan or type an ID card number at the gate — validates against students and staff in real time</p>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--success);">' + inToday + '</div><div style="font-size:12px;color:var(--text-light);">Entries Today</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--info);">' + outToday + '</div><div style="font-size:12px;color:var(--text-light);">Exits Today</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;' + (deniedToday ? 'border-color:#e53e3e;' : '') + '"><div style="font-size:28px;font-weight:700;color:' + (deniedToday ? '#e53e3e' : 'var(--text-light)') + ';">' + deniedToday + '</div><div style="font-size:12px;color:var(--text-light);">Denied Today</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + log.length + '</div><div style="font-size:12px;color:var(--text-light);">Total Records</div></div>' +
    '</div>';

  html += '<div class="card" style="margin-bottom:16px;">' +
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
    '<input id="gateScanInput" class="form-input" style="flex:1;min-width:220px;font-size:18px;padding:14px;" placeholder="Scan ID card or type ID then press Enter..." autocomplete="off" onkeydown="if(event.key===\'Enter\'){gateScan(this.value);}">' +
    '<button class="btn btn-primary" onclick="gateScan(document.getElementById(\'gateScanInput\').value)"><i class="fas fa-qrcode"></i> Scan</button>' +
    '<button class="btn btn-outline" onclick="gateLookupModal()"><i class="fas fa-search"></i> Look Up</button>' +
    '<button class="btn btn-outline" onclick="gateStartCamera()"><i class="fas fa-camera"></i> Camera</button>' +
    '<button class="btn btn-outline" onclick="gateStopCamera()"><i class="fas fa-video-slash"></i> Stop</button>' +
    '</div>' +
    '<div id="gateResultBanner" style="display:none;margin-top:12px;padding:14px 16px;border-radius:8px;font-size:15px;"></div>' +
    '<video id="gateCamVideo" style="display:none;width:100%;max-width:480px;margin-top:12px;border-radius:8px;background:#000;"></video>' +
    '</div>';

  html += '<div class="card">';
  if (!log.length) {
    html += '<div class="empty-state"><i class="fas fa-shield-halved"></i><p>No gate activity recorded yet. Scans appear here instantly.</p></div>';
  } else {
    html += '<div class="table-scroll"><table class="tbl" id="gateAccessTable"><thead><tr><th>Time</th><th>ID</th><th>Name</th><th>Role</th><th>Direction</th><th>Status</th></tr></thead><tbody>';
    log.slice(0, 100).forEach(function(e) {
      var ok = e.status === 'allowed';
      html += '<tr><td style="font-size:12px;">' + new Date(e.at).toLocaleString() + '</td>' +
        '<td style="font-family:monospace;">' + htmlEscape(e.code) + '</td>' +
        '<td>' + htmlEscape(e.name) + '</td>' +
        '<td>' + htmlEscape(e.role) + '</td>' +
        '<td><span class="badge" style="background:' + (e.direction === 'in' ? '#dbeafe' : '#fef3c7') + ';color:#2d3748;">' + (e.direction === 'in' ? 'IN' : 'OUT') + '</span></td>' +
        '<td><span class="badge" style="background:' + (ok ? '#c6f6d5' : '#fed7d7') + ';color:#2d3748;">' + (ok ? 'Allowed' : 'Denied') + '</span>' + (e.reason ? ' <span style="font-size:11px;color:var(--text-light);">' + htmlEscape(e.reason) + '</span>' : '') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    if (log.length > 100) html += '<p style="font-size:12px;color:var(--text-light);margin-top:8px;">Showing latest 100 of ' + log.length + ' records — export CSV for the full log.</p>';
  }
  html += '</div>';

  container.innerHTML = html;

  var input = document.getElementById('gateScanInput');
  if (input && typeof input.focus === 'function') input.focus();
}

function gateLookupModal() {
  var people = (data.students || []).map(function(s) { return { id: s.id, label: s.name + ' (Student)', status: s.status || 'active' }; })
    .concat((data.teachers || []).map(function(t) { return { id: t.id, label: t.name + ' (Teacher)', status: t.status || 'active' }; }));
  if (!people.length) { toast('No students or staff found', 'error'); return; }
  var opts = people.map(function(p) {
    return '<option value="' + htmlEscape(p.id) + '">' + htmlEscape(p.label) + '</option>';
  }).join('');
  openModal('<h3><i class="fas fa-search"></i> Look Up Person</h3>' +
    '<div class="form-group"><label>Person</label><select id="gateLookupSel" class="form-input">' + opts + '</select></div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="gateLookupGo()"><i class="fas fa-check"></i> Record Access</button>' +
    '<button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function gateLookupGo() {
  var id = (document.getElementById('gateLookupSel') || {}).value;
  if (!id) return;
  closeModal();
  gateScan(id);
}

function gateClearLog() {
  if (!confirm('Clear the entire gate access log?')) return;
  data.gateAccessLog = [];
  saveData();
  renderGateScanner();
  toast('Gate log cleared');
}

function gateStartCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('Camera not available — use the scanner input', 'error');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
    window._gateStream = stream;
    var v = document.getElementById('gateCamVideo');
    if (v) {
      v.srcObject = stream;
      v.style.display = 'block';
      try { v.play(); } catch (e) {}
    }
    if (typeof window.BarcodeDetector !== 'undefined') {
      var detector = new window.BarcodeDetector();
      window._gateDetectTimer = setInterval(function() {
        var video = document.getElementById('gateCamVideo');
        if (!video) return;
        detector.detect(video).then(function(codes) {
          if (codes && codes.length) {
            var val = codes[0].rawValue;
            var last = window._gateLastScan || '';
            if (val && val !== last) {
              window._gateLastScan = val;
              gateScan(val);
              setTimeout(function() { window._gateLastScan = ''; }, 2000);
            }
          }
        }).catch(function() {});
      }, 500);
      toast('Camera on — point it at the ID barcode');
    } else {
      toast('Camera on — barcode detection unsupported here, type the scanned code instead');
    }
  }).catch(function() {
    toast('Camera access denied or unavailable', 'error');
  });
}

function gateStopCamera() {
  if (window._gateDetectTimer) { clearInterval(window._gateDetectTimer); window._gateDetectTimer = null; }
  if (window._gateStream) {
    window._gateStream.getTracks().forEach(function(t) { t.stop(); });
    window._gateStream = null;
  }
  var v = document.getElementById('gateCamVideo');
  if (v) { try { v.srcObject = null; } catch (e) {} v.style.display = 'none'; }
}

// ===== VIRTUAL BANK ACCOUNTS =====

function vbAccountNumber(seq) {
  return String(3900000000 + seq * 137);
}

function vbGetAccounts() {
  if (!data.virtualAccounts) data.virtualAccounts = [];
  return data.virtualAccounts;
}

function vbGetLedger() {
  if (!data.virtualLedger) data.virtualLedger = [];
  return data.virtualLedger;
}

function vbEnsureAccounts(createIfMissing) {
  var accounts = vbGetAccounts();
  var students = data.students || [];
  var created = 0;
  students.forEach(function(s, i) {
    var acct = accounts.find(function(a) { return a.studentId === s.id; });
    if (!acct) {
      if (createIfMissing) {
        var seq = i + 1;
        while (accounts.some(function(a) { return a.number === vbAccountNumber(seq); })) seq++;
        accounts.push({ id: genId('VBA'), studentId: s.id, number: vbAccountNumber(seq), balance: 0, createdAt: new Date().toISOString() });
        created++;
      }
    } else if (!acct.number) {
      acct.number = vbAccountNumber(i + 1);
    }
  });
  if (created) saveData();
  return created;
}

function renderVirtualBank() {
  var container = document.getElementById('admin-virtualbank');
  if (!container) return;
  var accounts = vbGetAccounts();
  var students = data.students || [];
  var ledger = vbGetLedger();
  var missing = students.filter(function(s) { return !accounts.some(function(a) { return a.studentId === s.id; }); }).length;
  var totalBalance = accounts.reduce(function(sum, a) { return sum + (a.balance || 0); }, 0);
  var thisMonth = new Date().toISOString().slice(0, 7);
  var topups = ledger.filter(function(l) { return l.type === 'topup' && l.at.slice(0, 7) === thisMonth; });
  var topupSum = topups.reduce(function(s, l) { return s + l.amount; }, 0);
  var feesPaid = ledger.filter(function(l) { return l.type === 'fee'; }).reduce(function(s, l) { return s + l.amount; }, 0);

  var html = '<div class="card-header"><h2><i class="fas fa-building-columns"></i> Virtual Bank Accounts</h2>' +
    '<div style="display:flex;gap:8px;">' +
    (missing ? '<button class="btn btn-primary btn-sm" onclick="vbCreateAccounts()"><i class="fas fa-plus"></i> Create ' + missing + ' Account' + (missing > 1 ? 's' : '') + '</button>' : '') +
    '<button class="btn btn-export btn-sm" data-action="exportTableToCSV" data-args="vbAccountsTable,virtual_bank_accounts"><i class="fas fa-download"></i> CSV</button>' +
    '</div></div>';
  html += '<p class="subtitle">Dedicated virtual accounts for each student — top up balances and settle school fees instantly</p>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + accounts.length + '</div><div style="font-size:12px;color:var(--text-light);">Accounts</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:22px;font-weight:700;color:#38a169;">₦' + totalBalance.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Total Balance</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--info);">' + topups.length + '</div><div style="font-size:12px;color:var(--text-light);">Top-ups This Month</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:22px;font-weight:700;color:var(--accent);">₦' + topupSum.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Top-ups This Month (₦)</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:22px;font-weight:700;color:var(--primary);">₦' + feesPaid.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Fees Settled</div></div>' +
    (missing ? '<div class="card" style="text-align:center;padding:16px;border-color:#dd6b20;"><div style="font-size:28px;font-weight:700;color:#dd6b20;">' + missing + '</div><div style="font-size:12px;color:var(--text-light);">Awaiting Account</div></div>' : '') +
    '</div>';

  if (!students.length) {
    html += '<div class="card"><div class="empty-state"><i class="fas fa-building-columns"></i><p>No students yet. Add students first to create their virtual accounts.</p></div></div>';
  } else if (!accounts.length) {
    html += '<div class="card"><div class="empty-state"><i class="fas fa-building-columns"></i><p>No virtual accounts yet. Click "Create Accounts" to generate an account for every student.</p></div></div>';
  } else {
    html += '<div class="card"><div class="table-scroll"><table class="tbl" id="vbAccountsTable"><thead><tr><th>Student</th><th>Class</th><th>Account Number</th><th>Balance</th><th>Actions</th></tr></thead><tbody>';
    students.forEach(function(s) {
      var acct = accounts.find(function(a) { return a.studentId === s.id; });
      if (!acct) return;
      html += '<tr><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.class || '') + '</td>' +
        '<td style="font-family:monospace;font-weight:600;">' + htmlEscape(acct.number) + '</td>' +
        '<td><strong>₦' + (acct.balance || 0).toLocaleString() + '</strong></td>' +
        '<td style="white-space:nowrap;">' +
        '<button class="btn btn-sm btn-success" onclick="vbTopUpModal(\'' + acct.id + '\')"><i class="fas fa-plus"></i> Top Up</button> ' +
        '<button class="btn btn-sm btn-primary" onclick="vbPayFeeModal(\'' + acct.id + '\')"><i class="fas fa-money-bill"></i> Pay Fees</button> ' +
        '<button class="btn btn-sm btn-outline" onclick="vbStatementModal(\'' + acct.id + '\')"><i class="fas fa-file-invoice"></i> Statement</button>' +
        '</td></tr>';
    });
    html += '</tbody></table></div></div>';
  }

  container.innerHTML = html;
}

function vbCreateAccounts() {
  var created = vbEnsureAccounts(true);
  renderVirtualBank();
  toast(created ? created + ' virtual account(s) created' : 'All students already have accounts');
}

function vbTopUpModal(accountId) {
  var acct = vbGetAccounts().find(function(a) { return a.id === accountId; });
  if (!acct) return;
  var student = (data.students || []).find(function(s) { return s.id === acct.studentId; });
  openModal('<h3><i class="fas fa-plus-circle"></i> Top Up Account</h3>' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">' + htmlEscape(student ? student.name : '') + ' — <strong style="font-family:monospace;">' + htmlEscape(acct.number) + '</strong> — Balance: ₦' + (acct.balance || 0).toLocaleString() + '</p>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Amount (₦)</label><input id="vbTopUpAmt" type="number" min="1" class="form-input" placeholder="e.g. 50000"></div>' +
    '<div class="form-group"><label>Channel</label><select id="vbTopUpChannel" class="form-input"><option>Bank Transfer</option><option>Cash Deposit</option><option>USSD</option><option>Card Payment</option></select></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Reference (optional)</label><input id="vbTopUpRef" class="form-input" placeholder="e.g. Transfer narration / teller number"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="vbTopUp(\'' + accountId + '\')"><i class="fas fa-save"></i> Record Top-Up</button>' +
    '<button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function vbTopUp(accountId) {
  var acct = vbGetAccounts().find(function(a) { return a.id === accountId; });
  if (!acct) return;
  var amt = parseFloat((document.getElementById('vbTopUpAmt') || {}).value);
  if (isNaN(amt) || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
  var channel = (document.getElementById('vbTopUpChannel') || {}).value || 'Bank Transfer';
  var ref = ((document.getElementById('vbTopUpRef') || {}).value || '').trim() || ('VB' + Date.now());
  acct.balance = (acct.balance || 0) + amt;
  vbGetLedger().unshift({ id: genId('VBL'), accountId: acct.id, studentId: acct.studentId, type: 'topup', amount: amt, channel: channel, ref: ref, at: new Date().toISOString() });
  if (!data.paymentTransactions) data.paymentTransactions = [];
  data.paymentTransactions.unshift({ studentId: acct.studentId, amount: amt, gateway: '', method: 'Virtual Bank Top-up (' + channel + ')', reference: ref, date: new Date().toISOString().split('T')[0], status: 'successful' });
  saveData();
  closeModal();
  renderVirtualBank();
  toast('₦' + amt.toLocaleString() + ' credited to ' + acct.number);
}

function vbPayFeeModal(accountId) {
  var acct = vbGetAccounts().find(function(a) { return a.id === accountId; });
  if (!acct) return;
  var student = (data.students || []).find(function(s) { return s.id === acct.studentId; });
  var fees = (data.fees || []).filter(function(f) { return f.studentId === acct.studentId && f.status !== 'paid'; });
  var body;
  if (!fees.length) {
    body = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No outstanding fees for this student.</p></div>';
  } else {
    body = '<div class="table-scroll"><table class="tbl"><thead><tr><th>Fee</th><th>Amount</th><th>Paid</th><th>Balance</th><th></th></tr></thead><tbody>' +
      fees.map(function(f) {
        var bal = (f.amount || 0) - (f.paid || 0);
        return '<tr><td>' + htmlEscape(f.title || f.name || 'Fee') + '</td><td>₦' + (f.amount || 0).toLocaleString() + '</td><td>₦' + (f.paid || 0).toLocaleString() + '</td><td><strong>₦' + bal.toLocaleString() + '</strong></td>' +
          '<td><button class="btn btn-sm btn-primary" onclick="vbPayFee(\'' + f.id + '\',\'' + accountId + '\')" ' + ((acct.balance || 0) < bal ? 'disabled title="Insufficient wallet balance"' : '') + '>Pay ₦' + bal.toLocaleString() + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  openModal('<h3><i class="fas fa-money-bill"></i> Pay Fees from Wallet</h3>' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">' + htmlEscape(student ? student.name : '') + ' — Wallet balance: <strong>₦' + (acct.balance || 0).toLocaleString() + '</strong></p>' +
    body +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Close</button></div>');
}

function vbPayFee(feeId, accountId) {
  var acct = vbGetAccounts().find(function(a) { return a.id === accountId; });
  var fee = (data.fees || []).find(function(f) { return f.id === feeId; });
  if (!acct || !fee) return;
  var bal = (fee.amount || 0) - (fee.paid || 0);
  if (bal <= 0) { fee.status = 'paid'; }
  if ((acct.balance || 0) < bal) { toast('Insufficient wallet balance', 'error'); return; }
  if (!confirm('Pay ₦' + bal.toLocaleString() + ' from virtual account ' + acct.number + '?')) return;
  acct.balance -= bal;
  fee.paid = (fee.paid || 0) + bal;
  fee.status = fee.paid >= fee.amount ? 'paid' : 'partial';
  var ref = 'VBFEE' + Date.now();
  vbGetLedger().unshift({ id: genId('VBL'), accountId: acct.id, studentId: acct.studentId, type: 'fee', amount: bal, ref: ref, note: fee.title || fee.name || 'School fee', at: new Date().toISOString() });
  if (!data.paymentTransactions) data.paymentTransactions = [];
  data.paymentTransactions.unshift({ studentId: acct.studentId, amount: bal, gateway: '', method: 'Virtual Bank Fee Payment', reference: ref, date: new Date().toISOString().split('T')[0], status: 'successful' });
  saveData();
  closeModal();
  renderVirtualBank();
  toast('₦' + bal.toLocaleString() + ' paid — balance ₦' + acct.balance.toLocaleString());
}

function vbStatementModal(accountId) {
  var acct = vbGetAccounts().find(function(a) { return a.id === accountId; });
  if (!acct) return;
  var student = (data.students || []).find(function(s) { return s.id === acct.studentId; });
  var rows = vbGetLedger().filter(function(l) { return l.accountId === accountId; });
  var body;
  if (!rows.length) {
    body = '<div class="empty-state"><i class="fas fa-file-invoice"></i><p>No transactions yet for this account.</p></div>';
  } else {
    body = '<div class="table-scroll"><table class="tbl"><thead><tr><th>Date</th><th>Type</th><th>Detail</th><th>Credit</th><th>Debit</th></tr></thead><tbody>' +
      rows.map(function(l) {
        var isCredit = l.type === 'topup';
        return '<tr><td style="font-size:12px;">' + new Date(l.at).toLocaleString() + '</td>' +
          '<td><span class="badge" style="background:' + (isCredit ? '#c6f6d5' : '#fed7d7') + ';color:#2d3748;">' + (isCredit ? 'Top-up' : 'Fee') + '</span></td>' +
          '<td>' + htmlEscape(l.note || l.channel || l.ref || '') + '</td>' +
          '<td style="color:#38a169;">' + (isCredit ? '₦' + l.amount.toLocaleString() : '—') + '</td>' +
          '<td style="color:#e53e3e;">' + (!isCredit ? '₦' + l.amount.toLocaleString() : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  openModal('<h3><i class="fas fa-file-invoice"></i> Account Statement</h3>' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">' + htmlEscape(student ? student.name : '') + ' — <strong style="font-family:monospace;">' + htmlEscape(acct.number) + '</strong> — Balance: <strong>₦' + (acct.balance || 0).toLocaleString() + '</strong></p>' +
    body +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Close</button></div>');
}
