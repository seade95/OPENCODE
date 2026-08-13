// EDUVERSE - UI Layer
// Toast notifications, modal dialogs, navigation, sidebar controls

function toast(msg, type) {
  if (!type) type = 'success';
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  t.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + htmlEscape(msg);
  c.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; t.style.transition = 'all 0.3s'; setTimeout(function() { if (t.parentNode) t.remove(); }, 300); }, 3000);
}

// ===== AUTH VALIDATION HELPERS =====
var AUTH_REGEX = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  studentId: /^[A-Za-z]{2,4}\d{2,4}$/,
  username: /^[a-zA-Z][a-zA-Z0-9._-]{1,30}$/,
  name: /^[a-zA-Z][a-zA-Z0-9\s.'-]{1,50}$/,
  passwordMin: 6
};
function isValidEmail(v) { return AUTH_REGEX.email.test(v); }
function isValidStudentId(v) { return AUTH_REGEX.studentId.test(v); }
function isValidUsername(v) { return AUTH_REGEX.username.test(v); }
function isValidName(v) { return AUTH_REGEX.name.test(v.trim()); }
function isValidPassword(v) { return typeof v === 'string' && v.length >= AUTH_REGEX.passwordMin; }
function showError(el, msg) { if (el) { el.textContent = msg; el.style.display = 'block'; } }
function hideError(el) { if (el) { el.textContent = ''; el.style.display = 'none'; } }

// ===== UNIFIED SESSION MANAGER =====
var SESSION_KEY = 'eduverse_session';
var SESSION_VERSION = 1;
function getSession() {
  try {
    var raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s && s.version === SESSION_VERSION) {
        return s;
      }
    }
  } catch(e) {}
  return null;
}
function saveSession(s) {
  s.timestamp = Date.now();
  s.version = SESSION_VERSION;
  if (!s.initialLogin) s.initialLogin = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
function clearSession(type) {
  if (type) {
    var s = getSession();
    if (s && s.type === type) {
      localStorage.removeItem(SESSION_KEY);
      try { sessionStorage.removeItem('lastActivity'); } catch(e) {}
    }
    if (type === 'admin') currentAdmin = null;
    else if (type === 'student') currentStudent = null;
    else if (type === 'teacher') currentTeacher = null;
    else if (type === 'parent') currentParent = null;
  } else {
    localStorage.removeItem(SESSION_KEY);
    try { sessionStorage.removeItem('lastActivity'); } catch(e) {}
    currentAdmin = null; currentStudent = null; currentTeacher = null; currentParent = null;
  }
}
function setSession(type, user, tenantId) {
  var s = { version: SESSION_VERSION, type: type, user: null, timestamp: Date.now(), tenantId: tenantId || null };
  s.user = { id: user.id, name: user.name, email: user.email || '', username: user.username || '', password: user.password || '' };
  saveSession(s);
}
function syncSession() {
  // Bridge from window.currentAdmin (set by head inline via EduVerseAuth)
  if (!currentAdmin && window.currentAdmin) currentAdmin = window.currentAdmin;
  if (currentAdmin && typeof showAdminPortal === 'function') { try { showAdminPortal(); } catch(e) {} return; }
  // Fallback: check eduverse_auth key directly
  try {
    var _aRaw = localStorage.getItem('eduverse_auth');
    if (_aRaw && !currentAdmin) {
      var _a = JSON.parse(_aRaw);
      if (_a && _a.id) { currentAdmin = _a; }
    }
  } catch(e) {}
  if (currentAdmin && typeof showAdminPortal === 'function') { try { showAdminPortal(); } catch(e) {} return; }
  var s = getSession();
  if (!s || !s.type) { clearSession(); return; }
  // Restore tenant context from session
  if (s.tenantId && typeof switchTenant === 'function') {
    var currentTenant = localStorage.getItem('activeTenant');
    if (s.tenantId !== currentTenant) {
      try { switchTenant(s.tenantId); } catch(e) {}
    }
  }
  // Restore the correct current* variable from the persisted session
  if (s.type === 'admin') {
    if (!currentAdmin && data && data.admins) currentAdmin = data.admins.find(function(a) { return a.id === s.user.id; }) || null;
    if (!currentAdmin && s.user) currentAdmin = s.user; // fallback to session snapshot
    if (currentAdmin && typeof showAdminPortal === 'function') showAdminPortal();
  } else if (s.type === 'student') {
    if (!currentStudent && data && data.students) currentStudent = data.students.find(function(st) { return st.id === s.user.id; }) || null;
    if (!currentStudent && s.user) currentStudent = s.user;
    if (currentStudent && typeof renderStudentPortal === 'function') { document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); }); var sp = document.getElementById('studentPage'); if (sp) sp.classList.add('active'); renderStudentPortal(); if (typeof updateNotifBadge === 'function') updateNotifBadge(); }
  } else if (s.type === 'teacher') {
    if (!currentTeacher && data && data.teachers) currentTeacher = data.teachers.find(function(t) { return t.id === s.user.id; }) || null;
    if (!currentTeacher && s.user) currentTeacher = s.user;
    if (currentTeacher && typeof renderTeacherPortal === 'function') { document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); }); var tp = document.getElementById('teacherPage'); if (tp) tp.classList.add('active'); renderTeacherPortal(); if (typeof updateNotifBadge === 'function') updateNotifBadge(); }
  } else if (s.type === 'parent') {
    if (!currentParent && data && data.parents) currentParent = data.parents.find(function(p) { return p.id === s.user.id; }) || null;
    if (!currentParent && s.user) currentParent = s.user;
    if (currentParent && typeof renderParentPortal === 'function') { document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); }); var pp = document.getElementById('parentPage'); if (pp) pp.classList.add('active'); renderParentPortal(); if (typeof updateNotifBadge === 'function') updateNotifBadge(); }
  }
}

function validateField(el, type) {
  if (!el) return;
  var valid = false;
  var msg = '';
  var v = el.value;
  if (type === 'email') { valid = isValidEmail(v); msg = 'Invalid email format'; }
  else if (type === 'password') { valid = isValidPassword(v); msg = 'Min ' + AUTH_REGEX.passwordMin + ' characters'; }
  else if (type === 'name') { valid = isValidName(v); msg = 'Must start with a letter, 2-50 chars'; }
  else if (type === 'required') { valid = v.trim().length > 0; msg = 'Required'; }
  else if (type === 'confirm') {
    var target = document.getElementById(el.getAttribute('data-confirm-target'));
    var targetVal = target ? target.value : '';
    valid = v.length > 0 && v === targetVal;
    msg = valid ? '' : 'Passwords do not match';
  }
  el.classList.toggle('field-invalid', !valid && v.length > 0);
  el.classList.toggle('field-valid', valid);
  var err = el.parentNode.querySelector('.field-error');
  if (!valid && v.length > 0) {
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; el.parentNode.appendChild(err); }
    err.textContent = msg;
  } else if (err) { err.remove(); }
}

function openModal(html) {
  const body = document.getElementById('modalBody');
  const overlay = document.getElementById('modalOverlay');
  if (body) body.innerHTML = html;
  if (overlay) overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== NAVIGATION =====
function toggleNav() {
  const menu = document.getElementById('navMenu');
  const backdrop = document.getElementById('navBackdrop');
  const icon = document.getElementById('navToggleIcon');
  if (menu) {
    menu.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active');
    if (icon) icon.className = menu.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  }
}
function toggleNavDropdown(el) {
  el.classList.toggle('open');
}

function goHome() {
  clearSession();
  var activeTenant = (function() { try { return localStorage.getItem('activeTenant'); } catch(e) { return null; } })();
  if (activeTenant) {
    var tenants = [];
    try { tenants = JSON.parse(localStorage.getItem('eduverse_tenants') || '[]'); } catch(e) {}
    // Try matching by ID first, then by slug
    var t = tenants.find(function(x) { return x.id === activeTenant; });
    if (!t) t = tenants.find(function(x) { return x.slug === activeTenant; });
    if (t && t.slug) {
      window.location.href = 'index.html?school=' + encodeURIComponent(t.slug);
      return;
    }
    // Fallback: activeTenant itself might be a slug
    window.location.href = 'index.html?school=' + encodeURIComponent(activeTenant);
    return;
  }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const lp = document.getElementById('landing-page');
  if (lp) { lp.classList.remove('hidden'); lp.style.display = 'block'; }
  if (typeof updateLandingStats === 'function') updateLandingStats();
  if (typeof cleanupExam === 'function') cleanupExam();
  if (typeof cleanupSim === 'function') cleanupSim();
}

function showSchoolSelector() {
  const tenants = typeof getTenants === 'function' ? getTenants() : [];
  const activeTenant = (function() { try { return localStorage.getItem('activeTenant'); } catch(e) { return null; } })();
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = `
    <h3><i class="fas fa-school"></i> Select School</h3>
    <p style="color:var(--text-light);font-size:13px;margin-bottom:16px;">Choose a school to access its portal.</p>
    <div class="school-selector-grid">
      ${tenants.map(t => `
        <div class="school-card" onclick="window.location.href='/school/' + encodeURIComponent('${t.slug || t.id}')" style="${activeTenant === t.id ? 'border-color:var(--primary);background:#ebf8ff;' : ''}">
          ${t.logo ? `<img src="${htmlEscape(t.logo)}" class="school-logo" onerror="this.style.display='none'">` : '<div style="width:64px;height:64px;border-radius:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">' + (t.name ? t.name.charAt(0) : 'S') + '</div>'}
          <div class="school-name">${htmlEscape(t.name || 'Unknown School')}</div>
          <div class="school-tier">${htmlEscape(t.tier || 'N/A')} &middot; ${htmlEscape(t.status || 'active')}</div>
          ${activeTenant === t.id ? '<div style="margin-top:8px;"><span class="badge badge-paid">Active</span></div>' : ''}
        </div>
      `).join('')}
      ${tenants.length ? '' : '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-school"></i><p>No schools registered. Contact the Super Admin.</p></div>'}
    </div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
      ${activeTenant ? '<button class="btn btn-outline" onclick="if(confirm(\'Switch back to local mode?\')){if(window.__saveCurrentData)window.__saveCurrentData();localStorage.removeItem(\'activeTenant\');localStorage.removeItem(\'activeTenantKey\');window.location.reload();}" style="color:#e53e3e;"><i class="fas fa-times"></i> Leave School</button>' : ''}
    </div>
  `;
  if (overlay) overlay.classList.add('active');
}

let currentAdmin = window.currentAdmin || null;

function showAdminLogin() {
  if (currentAdmin) { showAdminPortal(); return; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminLoginPage');
  if (page) page.classList.add('active');
}

function showAdminSignup() {
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminSignupPage');
  if (page) page.classList.add('active');
}

function adminLogin() {
  const emailEl = document.getElementById('adminLoginEmail');
  const passEl = document.getElementById('adminLoginPass');
  const errEl = document.getElementById('adminLoginError');
  if (!emailEl || !passEl) { showError(errEl, 'Login form unavailable'); return; }
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  if (!email || !pass) { showError(errEl, 'Please enter both email and password'); return; }
  if (!isValidEmail(email)) { showError(errEl, 'Invalid email format'); return; }
  if (!isValidPassword(pass)) { showError(errEl, 'Password must be at least 6 characters'); return; }
  const admin = (data.admins || []).find(function(a) { return a.email === email && a.password === pass; });
  if (!admin) { showError(errEl, 'Invalid email or password'); return; }
  currentAdmin = admin;
  if (typeof setSession === 'function') setSession('admin', admin);
  try { localStorage.setItem('eduverse_auth', JSON.stringify(admin)); } catch(e) {}
  if (typeof EduVerseAuth !== 'undefined') {
    try { localStorage.setItem('eduverse_session', JSON.stringify({ version: 1, type: 'admin', user: { id: admin.id, name: admin.name, email: admin.email }, loginTime: Date.now(), timestamp: Date.now() })); } catch(e) {}
  }
  // Asynchronously ensure Firebase Auth user exists
  if (typeof window.ensureFirebaseUser === 'function') {
    try {
      var _schoolId = null;
      try { _schoolId = localStorage.getItem('activeTenant'); } catch(e) {}
      window.ensureFirebaseUser(email, pass, admin.name, 'admin', _schoolId, admin.id).catch(function(_err) {
        console.warn('Firebase auth provisioning skipped (non-blocking):', _err.code || _err.message);
      });
    } catch(_e) {}
  }
  if (typeof resetSessionActivity === 'function') resetSessionActivity();
  emailEl.value = '';
  passEl.value = '';
  hideError(errEl);
  // Force password change for newly approved accounts
  if (admin.forcePasswordChange) {
    showForceAdminPasswordChange(admin);
    return;
  }
  showAdminPortal();
  updateNotifBadge();
}

function showForceAdminPasswordChange(admin) {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<h3><i class="fas fa-key"></i> Change Required</h3>'
    + '<p style="color:var(--text-light);font-size:14px;margin-bottom:16px;">This is your first login. Please set a new password.</p>'
    + '<div id="forcePwError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;"></div>'
    + '<div class="form-group"><label>New Password</label><input type="password" id="forceNewPw" placeholder="Min 6 characters" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:6px;"></div>'
    + '<div class="form-group"><label>Confirm Password</label><input type="password" id="forceNewPw2" placeholder="Repeat password" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:6px;"></div>'
    + '<div class="modal-actions"><button class="btn btn-primary" onclick="confirmForcePasswordChange()"><i class="fas fa-save"></i> Update Password</button></div>';
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }
}

function confirmForcePasswordChange() {
  var p1 = document.getElementById('forceNewPw')?.value;
  var p2 = document.getElementById('forceNewPw2')?.value;
  var err = document.getElementById('forcePwError');
  if (!p1 || p1.length < 6) { showError(err, 'Password must be at least 6 characters'); return; }
  if (p1 !== p2) { showError(err, 'Passwords do not match'); return; }
  var admin = currentAdmin;
  if (!admin) { showError(err, 'Session expired. Please log in again.'); return; }
  admin.password = p1;
  admin.forcePasswordChange = false;
  saveData();
  hideError(err);
  closeModal();
  showAdminPortal();
  updateNotifBadge();
  toast('Password updated successfully!', 'success');
}

function adminSignup() {
  const nameEl = document.getElementById('adminSignupName');
  const emailEl = document.getElementById('adminSignupEmail');
  const passEl = document.getElementById('adminSignupPass');
  const errEl = document.getElementById('adminSignupError');
  if (!nameEl || !emailEl || !passEl) { showError(errEl, 'Signup form unavailable'); return; }
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  if (!name || !email || !pass) { showError(errEl, 'Please fill all fields'); return; }
  if (!isValidName(name)) { showError(errEl, 'Name must start with a letter and be 2-50 characters'); return; }
  if (!isValidEmail(email)) { showError(errEl, 'Invalid email format'); return; }
  if (!isValidPassword(pass)) { showError(errEl, 'Password must be at least 6 characters'); return; }
  if ((data.admins || []).find(function(a) { return a.email === email; })) { showError(errEl, 'An admin with this email already exists'); return; }
  if (!data.admins) data.admins = [];
  const admin = { id: 'ADM' + Date.now(), name: name, email: email, password: pass };
  data.admins.push(admin);
  saveData();
  if (typeof window.ensureFirebaseUser === 'function') {
    window.ensureFirebaseUser(email, pass, name, 'admin', null, admin.id).catch(function(_err) {
      console.warn('Firebase auth provisioning skipped (non-blocking):', _err.code || _err.message);
    });
  }
  hideError(errEl);
  nameEl.value = '';
  emailEl.value = '';
  passEl.value = '';
  currentAdmin = admin;
  if (typeof setSession === 'function') setSession('admin', admin);
  showAdminPortal();
}

function adminLogout() {
  clearSession('admin');
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminLoginPage');
  if (page) page.classList.add('active');
}

function showAdminPortal() {
  var lp = document.getElementById('landing-page');
  if (!currentAdmin) {
    if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
    document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
    var alp = document.getElementById('adminLoginPage');
    if (alp) alp.classList.add('active');
    return;
  }
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('adminPage');
  if (ap) ap.classList.add('active');

  // Update admin dashboard logo with school logo (or hide it)
  var adminDashLogo = document.querySelector('#adminPage .portal-header-left img.school-logo-img');
  if (adminDashLogo) {
    var logoUrl = '';
    try { if (data.schoolProfile && data.schoolProfile.logoUrl) logoUrl = data.schoolProfile.logoUrl; } catch(e) {}
    if (logoUrl) {
      adminDashLogo.src = logoUrl;
      adminDashLogo.style.display = '';
    } else {
      adminDashLogo.style.display = 'none';
    }
  }

  if (typeof switchAdminPanel === 'function') switchAdminPanel('dashboard');
  if (typeof renderSubscriptionBanner === 'function') renderSubscriptionBanner();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
  // Show setup wizard if school is not yet configured
  if (typeof showSetupWizard === 'function') setTimeout(showSetupWizard, 500);
}

function showStudentLogin() {
  var lp = document.getElementById('landing-page');
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var slp = document.getElementById('studentLoginPage');
  if (slp) slp.classList.add('active');
  if (typeof data !== 'undefined' && data && typeof populateStudentDatalists === 'function') populateStudentDatalists();
  if (typeof initLanguageSelector === 'function') initLanguageSelector('stuLangSelector');
  try { if (localStorage.getItem('demoMode') === 'true') { var _id=document.getElementById('loginId'),_nm=document.getElementById('loginName'),_sh=document.getElementById('stuDemoHint'); if(_id)_id.value='STU001'; if(_nm)_nm.value='stu001'; if(_sh)_sh.style.display='block'; } } catch(e){}
}

function studentLogin() {
  var idEl = document.getElementById('loginId');
  var nameEl = document.getElementById('loginName');
  if (!idEl || !nameEl) { toast('Login form unavailable', 'error'); return; }
  var idOrUser = idEl.value.trim();
  var nameOrPass = nameEl.value.trim();
  if (!idOrUser || !nameOrPass) { toast('Please enter both ID/Username and Password', 'error'); return; }
  var student = (data.students || []).find(function(s) { return s.username === idOrUser && s.password === nameOrPass; });
  if (!student) student = (data.students || []).find(function(s) { return s.id === idOrUser && s.name.toLowerCase() === nameOrPass.toLowerCase(); });
  if (!student) student = (data.students || []).find(function(s) { return s.id === idOrUser && s.password === nameOrPass; });
  if (!student) {
    toast('Invalid credentials. Try ID + Password or Username + Password.', 'error');
    return;
  }
  currentStudent = student;
  if (typeof setSession === 'function') setSession('student', student);
  if (typeof resetSessionActivity === 'function') resetSessionActivity();
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var sp = document.getElementById('studentPage');
  if (sp) sp.classList.add('active');
  if (typeof renderStudentPortal === 'function') renderStudentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function studentLogout() {
  clearSession('student');
  var idEl = document.getElementById('loginId');
  var nameEl = document.getElementById('loginName');
  if (idEl) idEl.value = '';
  if (nameEl) nameEl.value = '';
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var slp = document.getElementById('studentLoginPage');
  if (slp) slp.classList.add('active');
}

let currentStudent = null;
let currentTeacher = null;

function showTeacherLogin() {
  var lp = document.getElementById('landing-page');
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tlp = document.getElementById('teacherLoginPage');
  if (tlp) tlp.classList.add('active');
  if (typeof populateTeacherDatalists === 'function') populateTeacherDatalists();
  if (typeof initLanguageSelector === 'function') initLanguageSelector('tchLangSelector');
  try { if (localStorage.getItem('demoMode') === 'true') { var _id=document.getElementById('teacherLoginId'),_ps=document.getElementById('teacherLoginPass'),_th=document.getElementById('tchDemoHint'); if(_id)_id.value='TCH001'; if(_ps)_ps.value='teacher123'; if(_th)_th.style.display='block'; } } catch(e){}
}

function populateTeacherDatalists() {
  var idList = document.getElementById('teacherIdList');
  if (idList) idList.innerHTML = (data.teachers || []).map(function(t) { return '<option value="' + t.id + '">'; }).join('');
}

function teacherLogin() {
  var idEl = document.getElementById('teacherLoginId');
  var passEl = document.getElementById('teacherLoginPass');
  if (!idEl || !passEl) { toast('Login form unavailable', 'error'); return; }
  var idOrUser = idEl.value.trim();
  var pass = passEl.value.trim();
  if (!idOrUser || !pass) { toast('Please enter both ID and password', 'error'); return; }
  var teacher = (data.teachers || []).find(function(t) { return t.id === idOrUser && t.password === pass; });
  if (!teacher) teacher = (data.teachers || []).find(function(t) { return t.username === idOrUser && t.password === pass; });
  if (!teacher) {
    toast('Invalid ID or password. Please try again.', 'error');
    return;
  }
  currentTeacher = teacher;
  if (typeof setSession === 'function') setSession('teacher', teacher);
  if (typeof resetSessionActivity === 'function') resetSessionActivity();
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tp = document.getElementById('teacherPage');
  if (tp) tp.classList.add('active');
  if (typeof renderTeacherPortal === 'function') renderTeacherPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function teacherLogout() {
  clearSession('teacher');
  var idEl = document.getElementById('teacherLoginId');
  var passEl = document.getElementById('teacherLoginPass');
  if (idEl) idEl.value = '';
  if (passEl) passEl.value = '';
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tlp = document.getElementById('teacherLoginPage');
  if (tlp) tlp.classList.add('active');
}

function populateStudentDatalists() {
  var idList = document.getElementById('studentIdList');
  var nameList = document.getElementById('studentNameList');
  if (idList) idList.innerHTML = (data.students || []).map(function(s) { return '<option value="' + s.id + '">'; }).join('');
  if (nameList) nameList.innerHTML = (data.students || []).map(function(s) { return '<option value="' + s.name + '">'; }).join('');
}

// ===== TEACHER SIDEBAR =====
document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    switchTeacherPanel(this.dataset.teacherPanel);
  });
});

function switchTeacherPanel(panel) {
  document.querySelectorAll('#teacherPage .admin-panel').forEach(function(p) { p.classList.remove('active'); });
  var tp = document.getElementById('teacher-' + panel);
  if (tp) tp.classList.add('active');
  // Force scroll ALL containers to top immediately (bypass smooth scroll)
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  var teacherPage = document.getElementById('teacherPage');
  if (teacherPage) teacherPage.scrollTop = 0;
  var teacherContent = teacherPage ? teacherPage.querySelector('.admin-content') : null;
  if (teacherContent) teacherContent.scrollTop = 0;
  // Re-scroll after render (in case render causes reflow)
  requestAnimationFrame(function() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (teacherContent) teacherContent.scrollTop = 0;
  });
  document.querySelectorAll('#teacherPage .admin-sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  var sp = document.querySelector('#teacherPage .admin-sidebar-item[data-teacher-panel="' + panel + '"]');
  if (sp) sp.classList.add('active');
  switch(panel) {
    case 'dashboard': renderTeacherDashboard(); break;
    case 'assignments': renderTeacherAssignments(); break;
    case 'roster': renderTeacherRoster(); break;
    case 'timetable': renderTimetableTeacher(); break;
    case 'exams': renderExamsTeacher(); break;
    case 'messages': renderMessages('tchMessages', currentTeacher ? currentTeacher.id : ''); break;
    case 'lessonnotes': renderLessonNotes('tchLessonNotes', currentTeacher ? currentTeacher.id : ''); break;
    case 'behavior': renderBehaviorLog('tchBehaviorLog', currentTeacher ? currentTeacher.id : ''); break;
    case 'forum': renderForum('tchForum'); break;
    case 'filerepo': renderFileRepo('tchFileRepo', currentTeacher ? currentTeacher.assignedClass : ''); break;
    case 'gallery': if (typeof renderGalleryView === 'function') renderGalleryView('tchGalleryView'); break;
    case 'aitools': if (typeof renderAITools === 'function') renderAITools(); break;
    case 'eschool': if (typeof renderESchoolView === 'function') renderESchoolView('tchESchoolView'); break;
    case 'calendar': if (typeof renderAcademicCalendarView === 'function') renderAcademicCalendarView('tchCalendarView'); break;
    case 'handwritingocr': if (typeof renderHandwritingOCR === 'function') renderHandwritingOCR('tchHandwritingOCR'); break;
    case 'teacherexams': if (typeof renderTeacherUpload === 'function') renderTeacherUpload('tchTeacherExams'); break;
    case 'tchconferences': if (typeof renderTeacherConferencesView === 'function') renderTeacherConferencesView(); break;
    case 'ai-learning': if (typeof renderTeacherAILearning === 'function') renderTeacherAILearning(); break;
  }
  if (typeof applyTranslations === 'function') applyTranslations();
}

function switchAdminPanel(panel) {
  document.querySelectorAll('.admin-panel').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('admin-' + panel);
  if (ap) ap.classList.add('active');
  // Force scroll ALL containers to top immediately (bypass smooth scroll)
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  var adminPage = document.getElementById('adminPage');
  if (adminPage) adminPage.scrollTop = 0;
  var adminContent = adminPage ? adminPage.querySelector('.admin-content') : null;
  if (adminContent) adminContent.scrollTop = 0;
  // Re-scroll after render (in case render causes reflow)
  requestAnimationFrame(function() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (adminContent) adminContent.scrollTop = 0;
  });
  switch(panel) {
    case 'dashboard': if (typeof renderDashboard === 'function') renderDashboard(); break;
    case 'students': if (typeof renderStudents === 'function') renderStudents(); break;
    case 'teachers': if (typeof renderTeachers === 'function') renderTeachers(); break;
    case 'fees': if (typeof renderFees === 'function') renderFees(); break;
    case 'results': if (typeof renderResults === 'function') renderResults(); break;
    case 'cat': if (typeof renderCAT === 'function') renderCAT(); break;
    case 'activities': if (typeof renderActivities === 'function') renderActivities(); break;
    case 'attendance': if (typeof renderAttendance === 'function') renderAttendance(); break;
    case 'timetable': if (typeof switchTimetableTab === 'function') switchTimetableTab('grid'); break;
    case 'hostel': if (typeof renderHostel === 'function') renderHostel(); break;
    case 'gradebook': if (typeof renderGradebookAdmin === 'function') renderGradebookAdmin(); break;
    case 'scoregrid': if (typeof renderScoreGrid === 'function') renderScoreGrid(); break;
    case 'promotion': if (typeof renderPromotionList === 'function') renderPromotionList(); break;
    case 'exams': if (typeof renderExamsAdmin === 'function') renderExamsAdmin(); break;
    case 'messages': if (typeof renderMessages === 'function') renderMessages('adminMessages', 'Admin'); break;
    case 'library': if (typeof renderLibrary === 'function') renderLibrary(); break;
    case 'lessonnotes': if (typeof renderLessonNotes === 'function') renderLessonNotes('adminLessonNotes'); break;
    case 'behavior': if (typeof renderBehaviorLog === 'function') renderBehaviorLog('adminBehaviorLog'); break;
    case 'hr': if (typeof renderStaffHR === 'function') renderStaffHR(); break;
    case 'forum': if (typeof renderForum === 'function') renderForum('adminForum'); break;
    case 'filerepo': if (typeof renderFileRepo === 'function') renderFileRepo('adminFileRepo'); break;
    case 'payments': if (typeof renderPayments === 'function') renderPayments(); break;
    case 'analytics': if (typeof renderAnalytics === 'function') renderAnalytics(); break;
    case 'reportbuilder': if (typeof renderReportBuilder === 'function') renderReportBuilder(); break;
    case 'predictive': if (typeof renderPredictiveAnalytics === 'function') renderPredictiveAnalytics(); break;
    case 'aitools': if (typeof renderAITools === 'function') renderAITools(); break;
    case 'eschool': if (typeof renderESchoolAdmin === 'function') renderESchoolAdmin(); break;
    case 'academiccalendar': if (typeof renderAcademicCalendar === 'function') renderAcademicCalendar(); break;
    case 'idcards': if (typeof renderIDCards === 'function') renderIDCards('adminIDCards'); break;
    case 'terms': if (typeof renderTerms === 'function') renderTerms(); break;
    case 'chat': if (typeof renderPortalChat === 'function') renderPortalChat(); break;
    case 'programs': if (typeof renderPrograms === 'function') renderPrograms(); break;
    case 'applications': if (typeof renderApplications === 'function') renderApplications(); break;
    case 'exambank': if (typeof renderExamBank === 'function') renderExamBank(); break;
    case 'examresults': if (typeof renderExamResults === 'function') renderExamResults(); break;
    case 'schoolsetup': if (typeof renderSchoolSetup === 'function') renderSchoolSetup(); break;
    case 'subjects': if (typeof renderSubjectManagement === 'function') renderSubjectManagement(); break;
    case 'streams': if (typeof renderStreamManagement === 'function') renderStreamManagement(); break;
    case 'class': if (typeof renderClassManagement === 'function') renderClassManagement(); break;
    case 'exammodules': if (typeof renderExamModules === 'function') renderExamModules(); break;
    case 'utmemock': if (typeof renderUTMEMock === 'function') renderUTMEMock(); break;
    case 'gallery': if (typeof renderGalleryAdmin === 'function') renderGalleryAdmin(); break;
    case 'transcript': if (typeof renderTranscriptGenerator === 'function') renderTranscriptGenerator(); break;
    case 'reportcards': if (typeof renderReportCardsAdmin === 'function') renderReportCardsAdmin(); break;
    case 'schoolprofile': if (typeof renderSchoolProfile === 'function') renderSchoolProfile(); break;
    case 'website': if (typeof renderWebsiteBuilder === 'function') renderWebsiteBuilder(); break;
    case 'paymentgateway': if (typeof renderPaymentGatewaySettings === 'function') renderPaymentGatewaySettings(); if (typeof renderPaymentTransactionLog === 'function') renderPaymentTransactionLog(); break;
    case 'notifications': if (typeof renderNotificationComposer === 'function') renderNotificationComposer(); break;
    case 'simquestions': if (typeof renderSimQuestionBank === 'function') renderSimQuestionBank(); break;
    case 'simattempts': if (typeof renderSimAttempts === 'function') renderSimAttempts(); break;
    case 'activitygames': if (typeof renderAdminActivityGames === 'function') renderAdminActivityGames(); break;
    case 'alumni': if (typeof renderAlumni === 'function') renderAlumni(); break;
    case 'system': if (typeof renderSystemPanel === 'function') renderSystemPanel(); break;
    case 'handwritingocr': if (typeof renderHandwritingOCR === 'function') renderHandwritingOCR('adminHandwritingOCR'); break;
    case 'teacherexams': if (typeof renderAdminTeacherExams === 'function') renderAdminTeacherExams('adminTeacherExams'); break;
    case 'subscription': if (typeof renderSubscriptionSettings === 'function') renderSubscriptionSettings(); break;
    case 'health': if (typeof renderHealthRecords === 'function') renderHealthRecords(); break;
    case 'transport': if (typeof renderTransport === 'function') renderTransport(); break;
    case 'conferences': if (typeof renderConferences === 'function') renderConferences(); break;
    case 'mealplanner': if (typeof renderMealPlanner === 'function') renderMealPlanner(); break;
    case 'broadcast': if (typeof renderBroadcast === 'function') renderBroadcast(); break;
    case 'edunews': if (typeof renderEducationNews === 'function') renderEducationNews(); break;
    case 'schoolstore': if (typeof renderSchoolStore === 'function') renderSchoolStore(); break;
    case 'support': if (typeof renderSupportPanel === 'function') renderSupportPanel(); break;
    case 'higherinstitutions': if (typeof renderHigherInstitutions === 'function') renderHigherInstitutions(); break;
    case 'cbt': if (typeof renderCBTAdmin === 'function') renderCBTAdmin(); break;
  }
  if (typeof applyTranslations === 'function') applyTranslations();
}

// ===== RENDER ALL =====
function renderAll() {
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderStudents === 'function') renderStudents();
  if (typeof renderTeachers === 'function') renderTeachers();
  if (typeof renderFees === 'function') renderFees();
  if (typeof renderResults === 'function') renderResults();
  if (typeof renderCAT === 'function') renderCAT();
  if (typeof renderActivities === 'function') renderActivities();
  if (typeof renderAttendance === 'function') renderAttendance();
  if (typeof switchTimetableTab === 'function') switchTimetableTab('grid');
  if (typeof renderHostel === 'function') renderHostel();
  if (typeof renderGradebookAdmin === 'function') renderGradebookAdmin();
  if (typeof renderExamsAdmin === 'function') renderExamsAdmin();
  if (typeof renderMessages === 'function') renderMessages('adminMessages', 'Admin');
  if (typeof renderLibrary === 'function') renderLibrary();
  if (typeof renderLessonNotes === 'function') renderLessonNotes('adminLessonNotes');
  if (typeof renderBehaviorLog === 'function') renderBehaviorLog('adminBehaviorLog');
  if (typeof renderStaffHR === 'function') renderStaffHR();
  if (typeof renderForum === 'function') renderForum('adminForum');
  if (typeof renderFileRepo === 'function') renderFileRepo('adminFileRepo');
  if (typeof renderPayments === 'function') renderPayments();
  if (typeof renderAnalytics === 'function') renderAnalytics();
  if (typeof renderReportBuilder === 'function') renderReportBuilder();
  if (typeof renderIDCards === 'function') renderIDCards('adminIDCards');
  if (typeof renderTerms === 'function') renderTerms();
  if (typeof updateTermBadge === 'function') updateTermBadge();
  // Update institution type badge
  var instBadge = document.getElementById('adminInstBadgeText');
  if (instBadge) {
    var map = { eccde: 'Nursery', primary: 'Basic', secondary: 'Secondary', full_k12: 'K-12', tertiary: 'Tertiary' };
    instBadge.textContent = map[data.schoolTier] || data.schoolTier || 'Not set';
  }
  if (typeof renderPrograms === 'function') renderPrograms();
  if (typeof renderApplications === 'function') renderApplications();
  if (typeof renderExamBank === 'function') renderExamBank();
  if (typeof renderExamResults === 'function') renderExamResults();
  if (typeof renderSchoolSetup === 'function') renderSchoolSetup();
  if (typeof renderSubjectManagement === 'function') renderSubjectManagement();
  if (typeof renderStreamManagement === 'function') renderStreamManagement();
  if (typeof renderExamModules === 'function') renderExamModules();
  if (typeof renderUTMEMock === 'function') renderUTMEMock();
  if (typeof renderReportCardsAdmin === 'function') renderReportCardsAdmin();
  if (typeof renderSystemPanel === 'function') renderSystemPanel();
  if (typeof renderNotificationComposer === 'function') renderNotificationComposer();
  if (typeof renderSchoolProfile === 'function') renderSchoolProfile();
  if (typeof renderPaymentGatewaySettings === 'function') renderPaymentGatewaySettings();
  if (typeof renderPaymentTransactionLog === 'function') renderPaymentTransactionLog();
  if (typeof renderGalleryAdmin === 'function') renderGalleryAdmin();
  if (typeof renderPredictiveAnalytics === 'function') renderPredictiveAnalytics();
  if (typeof renderAITools === 'function') renderAITools();
  if (typeof renderSimQuestionBank === 'function') renderSimQuestionBank();
  if (typeof renderSimAttempts === 'function') renderSimAttempts();
  if (typeof renderAdminActivityGames === 'function') renderAdminActivityGames();
  if (typeof renderAlumni === 'function') renderAlumni();
  if (typeof renderPromotionList === 'function') renderPromotionList();
  if (typeof renderESchoolAdmin === 'function') renderESchoolAdmin();
  if (typeof renderAcademicCalendar === 'function') renderAcademicCalendar();
  if (typeof renderTranscriptGenerator === 'function') renderTranscriptGenerator();
  if (typeof renderHandwritingOCR === 'function') renderHandwritingOCR('adminHandwritingOCR');
  if (typeof renderAdminTeacherExams === 'function') renderAdminTeacherExams('adminTeacherExams');
  if (typeof renderSubscriptionSettings === 'function') renderSubscriptionSettings();
  if (typeof renderHealthRecords === 'function') renderHealthRecords();
  if (typeof renderTransport === 'function') renderTransport();
  if (typeof renderConferences === 'function') renderConferences();
  if (typeof applyTranslations === 'function') applyTranslations();
  if (typeof _checkAutoTermTransition === 'function') _checkAutoTermTransition();
  if (typeof renderChatButtons === 'function') renderChatButtons();
}

function logActivity(msg) {
  if (!data.activityLog) data.activityLog = [];
  data.activityLog.push(msg);
  if (data.activityLog.length > 50) data.activityLog.shift();
  saveData();
}

// ===== LANDING STATS ANIMATION =====
var _statsObserved = false;
function updateLandingStats() {
  if (_statsObserved) return;
  _statsObserved = true;
  var stats = [
    { id: 'statStudents', suffix: '' },
    { id: 'statTeachers', suffix: '' },
    { id: 'statSubjects', suffix: '' },
    { id: 'statPassRate', suffix: '%' }
  ];
  var section = document.querySelector('.stats-section');
  if (!section || !('IntersectionObserver' in window)) {
    animateAllNow(stats);
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      animateAllNow(stats);
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(section);
}
function animateAllNow(stats) {
  stats.forEach(function(s) {
    var el = document.getElementById(s.id);
    if (!el) return;
    var raw = el.textContent.replace(/[+,%]/g, '');
    var target = parseInt(raw, 10) || 0;
    if (target === 0) return;
    var startTime = null;
    var duration = 1500;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = current + s.suffix;
      if (progress < 1) { requestAnimationFrame(step); }
      else { el.textContent = target + s.suffix; }
    }
    requestAnimationFrame(step);
  });
}

// ===== HERO SLIDER =====
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let slideInterval;

function showSlide(index) {
  const container = document.getElementById('slidesContainer');
  const dots = document.querySelectorAll('.slider-dot');
  if (!container || !dots.length) return;
  slideIndex = (index + totalSlides) % totalSlides;
  container.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === slideIndex));
}

function goToSlide(index) {
  showSlide(index);
  resetSlideInterval();
}

function slideNext() {
  showSlide(slideIndex + 1);
  resetSlideInterval();
}

function slidePrev() {
  showSlide(slideIndex - 1);
  resetSlideInterval();
}

function resetSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
}

// Initialize slider on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.slide').length) {
      showSlide(0);
      slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
    }
  });
} else {
  if (document.querySelectorAll('.slide').length) {
    showSlide(0);
    slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
  }
}

// ===== GALLERY LIGHTBOX =====
const galleryImages = [
  { src: 'images/gallery/gallery1.jpg', thumb: 'images/gallery/gallery1.jpg', alt: 'School Event' },
  { src: 'images/gallery/gallery2.jpg', thumb: 'images/gallery/gallery2.jpg', alt: 'Graduation Ceremony' },
  { src: 'images/gallery/gallery3.jpg', thumb: 'images/gallery/gallery3.jpg', alt: 'Sports Day' },
  { src: 'images/gallery/gallery4.jpg', thumb: 'images/gallery/gallery4.jpg', alt: 'Classroom Activities' },
  { src: 'images/gallery/gallery5.jpg', thumb: 'images/gallery/gallery5.jpg', alt: 'Library Session' },
  { src: 'images/gallery/gallery6.jpg', thumb: 'images/gallery/gallery6.jpg', alt: 'Award Ceremony' }
];
let currentGalleryIdx = 0;

function openGallery(index) {
  const existing = document.getElementById('galleryOverlay');
  if (existing) existing.remove();
  currentGalleryIdx = index;
  const img = galleryImages[index];
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.id = 'galleryOverlay';
  overlay.onclick = function(e) { if (e.target === overlay) closeGallery(); };
  overlay.innerHTML = `
    <div class="gallery-lightbox">
      <button class="gallery-close" onclick="closeGallery()">&times;</button>
      <button class="gallery-nav gallery-prev" onclick="galleryNav(-1)">&#10094;</button>
      <img src="${img.src}" alt="${img.alt}" id="galleryLightboxImg">
      <button class="gallery-nav gallery-next" onclick="galleryNav(1)">&#10095;</button>
      <div class="gallery-caption" id="galleryCaption">${img.alt} (${index + 1}/${galleryImages.length})</div>
      <div class="gallery-thumbs">${galleryImages.map((g, i) =>
        `<img src="${g.thumb}" alt="" class="${i === index ? 'active' : ''}" onclick="openGallery(${i})" loading="lazy">`
      ).join('')}</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);
  document.addEventListener('keydown', galleryKeyHandler);
}

function closeGallery() {
  const overlay = document.getElementById('galleryOverlay');
  if (overlay) { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); }
  document.removeEventListener('keydown', galleryKeyHandler);
}

function galleryNav(dir) {
  let idx = currentGalleryIdx + dir;
  if (idx < 0) idx = galleryImages.length - 1;
  if (idx >= galleryImages.length) idx = 0;
  const old = document.getElementById('galleryOverlay');
  if (old) { old.remove(); }
  openGallery(idx);
}

function galleryKeyHandler(e) {
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft') galleryNav(-1);
  if (e.key === 'ArrowRight') galleryNav(1);
}

// ===== HTML ESCAPE (XSS prevention) =====
function htmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== DARK MODE =====
function toggleDarkMode() {
  var html = document.documentElement;
  var isDark = html ? html.getAttribute('data-theme') === 'dark' : false;
  if (isDark) {
    if (html) html.removeAttribute('data-theme');
    try { localStorage.setItem('darkMode', 'false'); } catch(e) {}
    updateThemeColorMeta(false);
  } else {
    if (html) html.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('darkMode', 'true'); } catch(e) {}
    updateThemeColorMeta(true);
  }
}
function updateThemeColorMeta(dark) {
  var meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = dark ? '#1a202c' : '#2563eb';
}
function initDarkMode() {
  var pref = localStorage.getItem('darkMode');
  if (pref === 'true') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeColorMeta(true);
  } else if (pref === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('darkMode', 'true'); } catch(e) {}
    updateThemeColorMeta(true);
  }
  var icon = document.getElementById('darkModeIcon');
  if (icon) icon.className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== SKELETON HELPERS =====
function renderSkeleton(container, count, type) {
  if (!container) return;
  var html = '';
  for (var i = 0; i < count; i++) {
    if (type === 'card') {
      html += '<div class="skeleton skeleton-card"></div>';
    } else if (type === 'row') {
      html += '<div class="skeleton-row"><div class="skeleton skeleton-avatar"></div><div style="flex:1"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line w60"></div></div></div>';
    } else if (type === 'table') {
      html += '<div class="skeleton skeleton-line" style="height:40px;margin-bottom:4px;"></div>';
    } else {
      html += '<div class="skeleton skeleton-line"></div>';
    }
  }
  container.innerHTML = html;
}
function clearSkeleton(container) {
  if (container) container.innerHTML = '';
}

// ===== LOADING STATE =====
function showLoading() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== DATE FORMATTING =====
function formatDate(d, style) {
  if (!d) return '';
  var dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return '';
  if (style === 'short') return dt.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()] + ' ' + dt.getFullYear();
  if (style === 'iso') return dt.toISOString().split('T')[0];
  if (style === 'time') return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return dt.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()] + ' ' + dt.getFullYear();
}

// ===== CSV EXPORT =====
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table || !table.rows.length) { toast('No data to export', 'error'); return; }
  const rows = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = [];
    for (let j = 0; j < table.rows[i].cells.length; j++) {
      let cell = table.rows[i].cells[j].innerText.replace(/,/g, ';').replace(/\n/g, ' ').replace(/"/g, '""');
      row.push('"' + cell + '"');
    }
    rows.push(row.join(','));
  }
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Exported ' + filename + '.csv');
}

// Export live getters for current student/teacher
Object.defineProperty(window, '__currentStudent', { get: function() { return currentStudent; } });
Object.defineProperty(window, '__currentTeacher', { get: function() { return currentTeacher; } });
