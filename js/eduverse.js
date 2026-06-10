// EduVerse Platform - Facebook Blueprint
// Universal user profiles, School Pages, news feed, unified navigation

// ===== GLOBAL STATE =====
let eduverseUser = null;
let eduverseCurrentSchool = null;

const SOCIAL_KEY = 'eduverse_social';

function getSocialData() {
  try {
    var raw = localStorage.getItem(SOCIAL_KEY);
    if (raw) { var parsed = JSON.parse(raw); if (parsed && typeof parsed === 'object') return parsed; }
  } catch(e) {}
  return { users: [], memberships: [], feed: [] };
}

function saveSocialData(sd) {
  try { localStorage.setItem(SOCIAL_KEY, JSON.stringify(sd)); } catch(e) {}
}

// One-time migration: merge legacy per-tenant users/memberships/feed into global store
function migrateSocialData() {
  var social = getSocialData();
  var changed = false;

  function merge(arr, items) {
    (items || []).forEach(function(item) {
      if (!arr.find(function(x) { return x.id === item.id; })) {
        arr.push(item); changed = true;
      }
    });
  }

  // Scan default data
  try {
    var def = JSON.parse(localStorage.getItem('schoolData'));
    if (def) {
      merge(social.users, def.users);
      merge(social.memberships, def.memberships);
      merge(social.feed, def.feed);
    }
  } catch(e) {}

  // Scan all tenant data
  try {
    if (typeof getTenants === 'function') {
      var tenants = getTenants();
      tenants.forEach(function(t) {
        try {
          var td = JSON.parse(localStorage.getItem(getTenantDataKey(t.id)));
          if (td) {
            merge(social.users, td.users);
            merge(social.memberships, td.memberships);
            merge(social.feed, td.feed);
          }
        } catch(e) {}
      });
    }
  } catch(e) {}

  if (changed) saveSocialData(social);
  return social;
}

// ===== USER SYSTEM (Facebook-style universal accounts) =====
function migrateLegacyUsers() {
  if (!data) return;
  var social = getSocialData();
  var needSave = false;

  if (!social.users.length) {
    var id = 1;
    (data.students || []).forEach(function(s) {
      if (!social.users.find(function(u) { return u.email === (s.contact || s.email); })) {
        var uid = 'USR' + String(id++).padStart(3,'0');
        social.users.push({ id: uid, name: s.name, email: s.contact || s.email || s.id + '@eduverse.local', password: s.password || 'password', role: 'student', avatar: '', createdAt: new Date().toISOString() });
        social.memberships.push({ id: 'MEM' + String(id).padStart(3,'0'), userId: uid, schoolId: localStorage.getItem('activeTenant') || '__default__', role: 'student', refId: s.id, class: s.class });
        needSave = true;
      }
    });
    (data.teachers || []).forEach(function(t) {
      if (!social.users.find(function(u) { return u.email === t.email; })) {
        var uid = 'USR' + String(id++).padStart(3,'0');
        social.users.push({ id: uid, name: t.name, email: t.email, password: t.password || 'password', role: 'teacher', avatar: '', createdAt: new Date().toISOString() });
        social.memberships.push({ id: 'MEM' + String(id).padStart(3,'0'), userId: uid, schoolId: localStorage.getItem('activeTenant') || '__default__', role: 'teacher', refId: t.id, class: t.assignedClass });
        needSave = true;
      }
    });
    (data.parents || []).forEach(function(p) {
      if (!social.users.find(function(u) { return u.email === p.email; })) {
        var uid = 'USR' + String(id++).padStart(3,'0');
        social.users.push({ id: uid, name: p.name, email: p.email, password: p.password || 'password', role: 'parent', avatar: '', createdAt: new Date().toISOString() });
        social.memberships.push({ id: 'MEM' + String(id).padStart(3,'0'), userId: uid, schoolId: localStorage.getItem('activeTenant') || '__default__', role: 'parent', refId: p.id, linkedStudents: p.studentIds || [] });
        needSave = true;
      }
    });
    (data.admins || []).forEach(function(a) {
      if (!social.users.find(function(u) { return u.email === a.email; })) {
        var uid = 'USR' + String(id++).padStart(3,'0');
        social.users.push({ id: uid, name: a.name, email: a.email, password: a.password || 'admin', role: 'admin', avatar: '', createdAt: new Date().toISOString() });
        social.memberships.push({ id: 'MEM' + String(id).padStart(3,'0'), userId: uid, schoolId: localStorage.getItem('activeTenant') || '__default__', role: 'admin', refId: a.id });
        needSave = true;
      }
    });
  }
  if (needSave) saveSocialData(social);
}

function eduverseSignup(name, email, password) {
  var social = getSocialData();
  if (social.users.find(function(u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
    return { error: 'Email already registered' };
  }
  var user = { id: genId('USR'), name: name, email: email, password: password, role: 'user', avatar: '', bio: '', createdAt: new Date().toISOString() };
  social.users.push(user);
  saveSocialData(social);
  return { user: user };
}

function eduverseLogin(email, password) {
  migrateLegacyUsers();
  var social = getSocialData();
  var user = (social.users || []).find(function(u) { return u.email.toLowerCase() === email.toLowerCase() && u.password === password; });
  if (user) {
    eduverseUser = user;
    localStorage.setItem('eduverseUser', JSON.stringify(user));
    return { user: user };
  }
  // Legacy fallback: try student portal
  var student = (data.students || []).find(function(s) { return (s.contact === email || s.email === email) && s.password === password; });
  if (student) {
    eduverseUser = { id: student.id, name: student.name, email: student.contact || student.email, password: student.password, role: 'student', avatar: '' };
    localStorage.setItem('eduverseUser', JSON.stringify(eduverseUser));
    return { user: eduverseUser };
  }
  var teacher = (data.teachers || []).find(function(t) { return t.email === email && t.password === password; });
  if (teacher) {
    eduverseUser = { id: teacher.id, name: teacher.name, email: teacher.email, password: teacher.password, role: 'teacher', avatar: '' };
    localStorage.setItem('eduverseUser', JSON.stringify(eduverseUser));
    return { user: eduverseUser };
  }
  return { error: 'Invalid email or password' };
}

function eduverseLogout() {
  eduverseUser = null;
  eduverseCurrentSchool = null;
  localStorage.removeItem('eduverseUser');
  if (typeof updateAuthGating === 'function') updateAuthGating();
  showLanding();
}

function getMySchools() {
  if (!eduverseUser) return [];
  var social = getSocialData();
  var mems = (social.memberships || []).filter(function(m) { return m.userId === eduverseUser.id; });
  var schools = [];
  var tenantSchools = typeof getTenants === 'function' ? getTenants() : [];
  mems.forEach(function(m) {
    var s = tenantSchools.find(function(t) { return t.id === m.schoolId; });
    if (s) schools.push({ school: s, role: m.role, membership: m });
  });
  return schools;
}

function getMembershipForSchool(schoolId) {
  if (!eduverseUser) return null;
  var social = getSocialData();
  return (social.memberships || []).find(function(m) { return m.userId === eduverseUser.id && m.schoolId === schoolId; }) || null;
}

// ===== SCHOOL PAGE SYSTEM (Facebook Page-style) =====
function createSchoolPage(data_) {
  var tenant = typeof createTenant === 'function' ? createTenant(data_) : null;
  if (!tenant) return null;
  var social = getSocialData();
  if (!social.memberships) social.memberships = [];
  social.memberships.push({ id: genId('MEM'), userId: eduverseUser.id, schoolId: tenant.id, role: 'admin', refId: '' });
  if (!social.feed) social.feed = [];
  social.feed.unshift({ id: genId('FED'), schoolId: tenant.id, type: 'school_created', message: tenant.name + ' was created', userId: eduverseUser.id, userName: eduverseUser.name, createdAt: new Date().toISOString() });
  saveSocialData(social);
  return tenant;
}

function addFeedEntry(schoolId, type, message) {
  var social = getSocialData();
  if (!social.feed) social.feed = [];
  social.feed.unshift({ id: genId('FED'), schoolId: schoolId, type: type, message: message, userId: eduverseUser ? eduverseUser.id : '', userName: eduverseUser ? eduverseUser.name : 'System', createdAt: new Date().toISOString() });
  saveSocialData(social);
}

// ===== NAVIGATION =====
function showLanding() {
  var app = document.getElementById('eduverse-app');
  var topbar = document.getElementById('eduverse-topbar');
  var landing = document.getElementById('landing-page');
  if (app) app.style.display = 'none';
  if (topbar) topbar.style.display = 'none';
  if (landing) { landing.style.display = 'block'; landing.classList.remove('hidden'); }
  var nav = document.getElementById('navbar');
  if (nav) nav.style.display = 'flex';
  if (typeof updateLandingStats === 'function') updateLandingStats();
  if (typeof cleanupExam === 'function') cleanupExam();
}

function showApp() {
  var app = document.getElementById('eduverse-app');
  var topbar = document.getElementById('eduverse-topbar');
  var landing = document.getElementById('landing-page');
  var nav = document.getElementById('navbar');
  if (landing) landing.style.display = 'none';
  if (nav) nav.style.display = 'none';
  if (topbar) topbar.style.display = 'flex';
  if (app) { app.style.display = 'block'; app.style.paddingTop = '56px'; }
  if (typeof updateEduverseTopbar === 'function') updateEduverseTopbar();
}

function showEduverseHome() {
  var sp = document.getElementById('ev-school-page');
  if (sp) sp.style.display = 'none';
  var feed = document.getElementById('ev-home-feed');
  if (feed) { feed.style.display = 'block'; renderHomeFeed(); }
  document.querySelectorAll('.ev-nav-icon').forEach(function(el) { el.classList.toggle('active', el.dataset.section === 'home'); });
}

function showEduverseSchoolPage(schoolId) {
  if (!schoolId) return;
  eduverseCurrentSchool = schoolId;
  var feed = document.getElementById('ev-home-feed');
  if (feed) feed.style.display = 'none';
  var sp = document.getElementById('ev-school-page');
  if (sp) { sp.style.display = 'block'; renderSchoolPage(schoolId); }
  document.querySelectorAll('.ev-nav-icon').forEach(function(el) { el.classList.toggle('active', el.dataset.section === 'schools'); });
}

// ===== RENDER FUNCTIONS =====
function renderHomeFeed() {
  var container = document.getElementById('ev-home-feed');
  if (!container) return;
  var mySchools = getMySchools();
  var social = getSocialData();
  var feedItems = (social.feed || []).slice(0, 50);
  var html = '<div class="ev-feed-header"><h2><i class="fas fa-rss"></i> Your Feed</h2></div>';
  html += '<div class="ev-create-post"><textarea id="evPostText" placeholder="Share an update with your schools..." rows="2"></textarea><button class="btn btn-primary btn-sm" onclick="postFeedUpdate()"><i class="fas fa-paper-plane"></i> Post</button></div>';
  mySchools.forEach(function(ms) {
    html += '<div class="ev-school-card" onclick="showEduverseSchoolPage(\'' + ms.school.id + '\')"><div class="ev-school-card-icon">' + (ms.school.logo ? '<img src="' + htmlEscape(ms.school.logo) + '">' : '<i class="fas fa-school"></i>') + '</div><div class="ev-school-card-info"><strong>' + htmlEscape(ms.school.name) + '</strong><span class="ev-school-card-role">' + ms.role + '</span></div></div>';
  });
  if (feedItems.length) {
    html += '<div class="ev-feed-items">';
    feedItems.forEach(function(f) {
      var s = mySchools.find(function(ms) { return ms.school.id === f.schoolId; });
      html += '<div class="ev-feed-item"><div class="ev-feed-icon"><i class="fas fa-' + (f.type === 'school_created' ? 'plus-circle' : f.type === 'result' ? 'chart-bar' : f.type === 'fee' ? 'money-bill' : 'info-circle') + '"></i></div><div class="ev-feed-body"><div class="ev-feed-message">' + htmlEscape(f.message) + '</div><div class="ev-feed-meta">' + htmlEscape(f.userName || 'System') + ' &middot; ' + (s ? htmlEscape(s.school.name) : '') + ' &middot; ' + new Date(f.createdAt).toLocaleDateString() + '</div></div></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="empty-state"><i class="fas fa-rss"></i><p>No activity yet. Join a school to see updates.</p></div>';
  }
  container.innerHTML = html;
}

function renderSchoolPage(schoolId) {
  var tenantSchools = typeof getTenants === 'function' ? getTenants() : [];
  var school = tenantSchools.find(function(t) { return t.id === schoolId; });
  if (!school) return;
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  var isAdmin = role === 'admin' || role === 'owner';
  var schoolData = null;
  try { var raw = localStorage.getItem('schoolData_' + schoolId); if (raw) schoolData = JSON.parse(raw); } catch(e) {}

  var container = document.getElementById('ev-school-page');
  if (!container) return;

  var html = '<div class="ev-school-page">';
  html += '<div class="ev-school-cover" style="background:linear-gradient(135deg,#1a3a5c,#2a5a8c);"><div class="ev-school-cover-info"><div class="ev-school-page-logo"><img src="' + htmlEscape(school.logo || '') + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" style="width:80px;height:80px;border-radius:12px;object-fit:cover;border:3px solid #fff;"><div class="ev-school-page-logo-fallback" style="display:none;width:80px;height:80px;border-radius:12px;background:#f5a623;color:#fff;align-items:center;justify-content:center;font-size:36px;font-weight:800;">' + (school.name ? school.name.charAt(0).toUpperCase() : 'S') + '</div></div><div><h1>' + htmlEscape(school.name) + '</h1><p>' + htmlEscape(school.motto || '') + '</p></div></div></div>';
  html += '<div class="ev-school-nav"><button class="ev-school-tab active" data-tab="posts" onclick="switchSchoolTab(\'' + schoolId + '\',\'posts\')"><i class="fas fa-list"></i> Posts</button>';
  if (isAdmin) {
    html += '<button class="ev-school-tab" data-tab="admin" onclick="switchSchoolTab(\'' + schoolId + '\',\'admin\')"><i class="fas fa-user-shield"></i> Admin Panel</button>';
  }
  html += '<button class="ev-school-tab" data-tab="community" onclick="switchSchoolTab(\'' + schoolId + '\',\'community\')"><i class="fas fa-comments"></i> Community</button>';
  html += '<button class="ev-school-tab" data-tab="about" onclick="switchSchoolTab(\'' + schoolId + '\',\'about\')"><i class="fas fa-info-circle"></i> About</button>';
  if (!isAdmin) {
    html += '<a href="admin.html?tenant=' + schoolId + '" class="btn btn-sm btn-primary" style="margin-left:auto;"><i class="fas fa-external-link-alt"></i> Open School Portal</a>';
  }
  html += '<button class="btn btn-sm btn-outline" onclick="showEduverseHome()" style="margin-left:auto;"><i class="fas fa-arrow-left"></i> Back</button></div>';
  html += '<div id="evSchoolTabContent" class="ev-school-tab-content">';
  html += '<div id="evSchoolPosts" class="ev-tab-pane active">';
  html += '<div class="ev-school-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:16px 0;"><div class="stat-card"><div class="stat-value">' + (schoolData ? (schoolData.students || []).length : 0) + '</div><div class="stat-label">Students</div></div><div class="stat-card"><div class="stat-value">' + (schoolData ? (schoolData.teachers || []).length : 0) + '</div><div class="stat-label">Teachers</div></div><div class="stat-card"><div class="stat-value">' + (schoolData ? (schoolData.fees || []).length : 0) + '</div><div class="stat-label">Fee Records</div></div><div class="stat-card"><div class="stat-value">' + (schoolData ? (schoolData.results || []).length : 0) + '</div><div class="stat-label">Results</div></div></div>';
  html += '<div class="ev-school-actions" style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">';
  if (isAdmin) {
    html += '<button class="btn btn-primary" onclick="switchSchoolTab(\'' + schoolId + '\',\'admin\')"><i class="fas fa-user-shield"></i> Go to Admin Panel</button>';
  }
  html += '</div>';
  html += '<div id="evSchoolFeed">' + renderSchoolFeed(schoolId) + '</div>';
  html += '</div>';
  html += '<div id="evSchoolAdmin" class="ev-tab-pane"></div>';
  html += '<div id="evSchoolCommunity" class="ev-tab-pane"></div>';
  html += '<div id="evSchoolAbout" class="ev-tab-pane"><div class="card" style="padding:20px;"><h3>About ' + htmlEscape(school.name) + '</h3><p style="margin-top:12px;">' + htmlEscape(school.motto || school.description || 'No description yet.') + '</p></div></div>';
  html += '</div></div>';
  container.innerHTML = html;
}

function switchSchoolTab(schoolId, tab) {
  document.querySelectorAll('.ev-school-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
  document.querySelectorAll('.ev-tab-pane').forEach(function(p) { p.classList.remove('active'); });
  var pane = document.getElementById('evSchool' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (pane) pane.classList.add('active');
  if (tab === 'admin') renderEmbeddedAdmin(schoolId);
  if (tab === 'community') renderCommunityContent(schoolId);
}

function renderEmbeddedAdmin(schoolId) {
  var pane = document.getElementById('evSchoolAdmin');
  if (!pane) return;
  var tenantSchools = typeof getTenants === 'function' ? getTenants() : [];
  var school = tenantSchools.find(function(t) { return t.id === schoolId; });
  if (!school) return;
  var schoolData = null;
  try { var raw = localStorage.getItem('schoolData_' + schoolId); if (raw) schoolData = JSON.parse(raw); } catch(e) {}
  if (!schoolData) { pane.innerHTML = '<p class="empty-state">No school data found.</p>'; return; }
  pane.innerHTML = '<div class="embedded-admin"><div class="embedded-admin-sidebar" id="evAdminSidebar"><div class="embedded-admin-sidebar-header"><i class="fas fa-user-shield"></i> <span>' + htmlEscape(school.name) + '</span></div></div><div class="embedded-admin-content" id="evAdminContent"><div class="embedded-admin-panels"></div></div></div>';
  var menuItems = [
    { panel: 'evDashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { panel: 'evStudents', icon: 'fa-users', label: 'Students' },
    { panel: 'evTeachers', icon: 'fa-chalkboard-teacher', label: 'Teachers' },
    { panel: 'evFees', icon: 'fa-file-invoice-dollar', label: 'School Fees' },
    { panel: 'evResults', icon: 'fa-file-alt', label: 'Exam Results' },
    { panel: 'evCAT', icon: 'fa-tasks', label: 'Assessments' },
    { panel: 'evActivities', icon: 'fa-futbol', label: 'Activities' },
    { panel: 'evAttendance', icon: 'fa-calendar-check', label: 'Attendance' },
    { panel: 'evTimetable', icon: 'fa-table', label: 'Timetable' },
    { panel: 'evSchoolProfile', icon: 'fa-paint-brush', label: 'Customize Portal' }
  ];
  var sb = document.getElementById('evAdminSidebar');
  menuItems.forEach(function(item, i) {
    sb.innerHTML += '<div class="ev-admin-sidebar-item' + (i === 0 ? ' active' : '') + '" data-panel="' + item.panel + '" onclick="switchEmbeddedPanel(\'' + schoolId + '\',\'' + item.panel + '\', this)"><i class="fas ' + item.icon + '"></i> ' + item.label + '</div>';
  });
  renderEmbeddedPanel(schoolId, schoolData, 'evDashboard');
}

function switchEmbeddedPanel(schoolId, panel, el) {
  document.querySelectorAll('#evAdminSidebar .ev-admin-sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');
  var schoolData = null;
  try { var raw = localStorage.getItem('schoolData_' + schoolId); if (raw) schoolData = JSON.parse(raw); } catch(e) {}
  if (!schoolData) return;
  renderEmbeddedPanel(schoolId, schoolData, panel);
}

function renderEmbeddedPanel(schoolId, schoolData, panel) {
  var container = document.querySelector('#evAdminContent .embedded-admin-panels');
  if (!container) return;
  switch(panel) {
    case 'evDashboard': renderEmbeddedDashboard(schoolData, container); break;
    case 'evStudents': renderEmbeddedStudents(schoolData, container); break;
    case 'evTeachers': renderEmbeddedTeachers(schoolData, container); break;
    case 'evFees': renderEmbeddedFees(schoolData, container); break;
    case 'evResults': renderEmbeddedResults(schoolData, container); break;
    case 'evCAT': renderEmbeddedCAT(schoolData, container); break;
    case 'evActivities': renderEmbeddedActivities(schoolData, container); break;
    case 'evAttendance': renderEmbeddedAttendance(schoolData, container); break;
    case 'evTimetable': renderEmbeddedTimetable(schoolData, container); break;
    case 'evSchoolProfile': renderEmbeddedSchoolProfile(schoolId, schoolData, container); break;
    default: container.innerHTML = '<p>Select a panel from the sidebar</p>';
  }
}

function renderEmbeddedDashboard(sd, container) {
  var totalStudents = (sd.students || []).length;
  var totalTeachers = (sd.teachers || []).length;
  var totalFees = (sd.fees || []).length;
  var totalCollected = sd.fees ? sd.fees.reduce(function(s, f) { return s + (f.paid || 0); }, 0) : 0;
  var avgScore = 0;
  if (sd.results && sd.results.length) avgScore = Math.round(sd.results.reduce(function(s, r) { return s + (r.score || 0); }, 0) / sd.results.length);
  container.innerHTML = '<h2>Dashboard Overview</h2><p class="subtitle">Real-time summary of school operations</p><div class="stats-grid" style="margin-bottom:24px;"><div class="stat-card"><div class="icon"><i class="fas fa-users"></i></div><h3>' + totalStudents + '</h3><p>Total Students</p></div><div class="stat-card"><div class="icon"><i class="fas fa-chalkboard-teacher"></i></div><h3>' + totalTeachers + '</h3><p>Teachers</p></div><div class="stat-card"><div class="icon"><i class="fas fa-dollar-sign" style="color:var(--accent)"></i></div><h3>$' + totalCollected + '</h3><p>Fees Collected</p></div><div class="stat-card"><div class="icon"><i class="fas fa-trophy" style="color:var(--info)"></i></div><h3>' + avgScore + '%</h3><p>Avg Exam Score</p></div></div>';
}

function renderEmbeddedStudents(sd, container) {
  var students = sd.students || [];
  container.innerHTML = '<div class="card-header"><h2>Student Management</h2><button class="btn btn-primary btn-sm" onclick="showEmbeddedStudentForm()"><i class="fas fa-plus"></i> Add Student</button></div><p class="subtitle">Manage all enrolled students</p><div class="table-responsive"><table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Contact</th></tr></thead><tbody>' + (students.length ? students.map(function(s) { return '<tr><td>' + htmlEscape(s.id) + '</td><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.class || '') + '</td><td>' + htmlEscape(s.contact || '') + '</td></tr>'; }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-light);">No students registered yet</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedTeachers(sd, container) {
  var teachers = sd.teachers || [];
  container.innerHTML = '<div class="card-header"><h2>Teacher Management</h2><button class="btn btn-primary btn-sm" onclick="showEmbeddedTeacherForm()"><i class="fas fa-plus"></i> Add Teacher</button></div><p class="subtitle">Manage teachers and assign them to classes</p><div class="table-responsive"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Class</th></tr></thead><tbody>' + (teachers.length ? teachers.map(function(t) { return '<tr><td>' + htmlEscape(t.id) + '</td><td>' + htmlEscape(t.name) + '</td><td>' + htmlEscape(t.email || '') + '</td><td>' + htmlEscape(t.assignedClass || '') + '</td></tr>'; }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-light);">No teachers added yet</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedFees(sd, container) {
  var fees = sd.fees || [];
  container.innerHTML = '<div class="card-header"><h2>School Fees</h2></div><p class="subtitle">Track and manage fee payments</p><div class="table-responsive"><table><thead><tr><th>Student</th><th>Term</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>' + (fees.length ? fees.map(function(f) { return '<tr><td>' + htmlEscape(f.student || '') + '</td><td>' + htmlEscape(f.term || '') + '</td><td>$' + (f.amount || 0) + '</td><td>$' + (f.paid || 0) + '</td><td>' + htmlEscape(f.status || 'pending') + '</td></tr>'; }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-light);">No fee records</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedResults(sd, container) {
  var results = sd.results || [];
  container.innerHTML = '<div class="card-header"><h2>Exam Results</h2></div><p class="subtitle">Record and manage examination results</p><div class="table-responsive"><table><thead><tr><th>Student</th><th>Subject</th><th>Score</th><th>Grade</th><th>Term</th></tr></thead><tbody>' + (results.length ? results.map(function(r) { var g = r.score >= 80 ? 'A' : r.score >= 75 ? 'B+' : r.score >= 70 ? 'B' : r.score >= 65 ? 'C+' : r.score >= 60 ? 'C' : r.score >= 55 ? 'D+' : r.score >= 50 ? 'D' : 'F'; return '<tr><td>' + htmlEscape(r.student || '') + '</td><td>' + htmlEscape(r.subject || '') + '</td><td>' + (r.score || 0) + '</td><td>' + g + '</td><td>' + htmlEscape(r.term || '') + '</td></tr>'; }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-light);">No results recorded</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedCAT(sd, container) {
  var cats = sd.cat || [];
  container.innerHTML = '<div class="card-header"><h2>Continuous Assessments</h2></div><p class="subtitle">Track ongoing assessment scores</p><div class="table-responsive"><table><thead><tr><th>Student</th><th>Subject</th><th>Test 1</th><th>Test 2</th><th>Average</th></tr></thead><tbody>' + (cats.length ? cats.map(function(c) { var avg = Math.round(((c.test1 || 0) + (c.test2 || 0)) / 2); return '<tr><td>' + htmlEscape(c.student || '') + '</td><td>' + htmlEscape(c.subject || '') + '</td><td>' + (c.test1 || 0) + '</td><td>' + (c.test2 || 0) + '</td><td>' + avg + '</td></tr>'; }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-light);">No assessments recorded</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedActivities(sd, container) {
  var acts = sd.schoolProfile ? (sd.schoolProfile.activities || []) : (sd.activities || []);
  container.innerHTML = '<div class="card-header"><h2>Extracurricular Activities</h2></div><p class="subtitle">Clubs, sports, and programs</p><div class="table-responsive"><table><thead><tr><th>Activity</th><th>Type</th><th>Description</th></tr></thead><tbody>' + (acts.length ? acts.map(function(a) { return '<tr><td>' + htmlEscape(a.name || a.title || '') + '</td><td>' + htmlEscape(a.type || '') + '</td><td>' + htmlEscape(a.description || '') + '</td></tr>'; }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-light);">No activities added</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedAttendance(sd, container) {
  var att = sd.attendance || [];
  container.innerHTML = '<div class="card-header"><h2>Attendance Records</h2></div><p class="subtitle">Track daily student attendance</p><div class="table-responsive"><table><thead><tr><th>Student</th><th>Date</th><th>Status</th></tr></thead><tbody>' + (att.length ? att.slice(0, 50).map(function(a) { return '<tr><td>' + htmlEscape(a.student || '') + '</td><td>' + htmlEscape(a.date || '') + '</td><td>' + htmlEscape(a.status || '') + '</td></tr>'; }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-light);">No attendance records</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedTimetable(sd, container) {
  var tt = sd.timetables || [];
  container.innerHTML = '<div class="card-header"><h2>Timetable</h2></div><p class="subtitle">Class schedules and periods</p><div class="table-responsive"><table><thead><tr><th>Class</th><th>Subject</th><th>Day</th><th>Time</th></tr></thead><tbody>' + (tt.length ? tt.map(function(t) { return '<tr><td>' + htmlEscape(t.class || '') + '</td><td>' + htmlEscape(t.subject || '') + '</td><td>' + htmlEscape(t.day || '') + '</td><td>' + htmlEscape(t.time || '') + '</td></tr>'; }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-light);">No timetable entries</td></tr>') + '</tbody></table></div>';
}

function renderEmbeddedSchoolProfile(schoolId, sd, container) {
  var profile = sd.schoolProfile || {};
  var schoolName = '';
  var tenants = typeof getTenants === 'function' ? getTenants() : [];
  var t = tenants.find(function(x) { return x.id === schoolId; });
  if (t) schoolName = t.name;
  container.innerHTML = '<div class="card-header"><h2>Customize School Portal</h2></div><p class="subtitle">Edit how your school appears on the portal</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;"><div class="card" style="padding:16px;"><h4>General</h4><p style="font-size:13px;margin-top:8px;">School Name: ' + htmlEscape(schoolName || profile.schoolName || 'Not set') + '</p><p style="font-size:13px;">Hero: ' + htmlEscape((profile.heroTitle || '').substring(0, 50)) + '</p><p style="font-size:13px;">Email: ' + htmlEscape(profile.contactEmail || 'Not set') + '</p><button class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="window.location.href=\'admin.html?tenant=' + schoolId + '\'"><i class="fas fa-external-link-alt"></i> Full Editor</button></div><div class="card" style="padding:16px;"><h4>Services (' + ((profile.services || []).length) + ')</h4><ul style="font-size:13px;margin-top:8px;">' + (profile.services || []).slice(0, 5).map(function(s) { return '<li>' + htmlEscape(s.title) + '</li>'; }).join('') + '</ul></div><div class="card" style="padding:16px;"><h4>Courses (' + ((profile.courses || []).length) + ')</h4><ul style="font-size:13px;margin-top:8px;">' + (profile.courses || []).slice(0, 5).map(function(c) { return '<li>' + htmlEscape(c.title) + '</li>'; }).join('') + '</ul></div><div class="card" style="padding:16px;"><h4>Events (' + ((profile.events || []).length) + ')</h4><ul style="font-size:13px;margin-top:8px;">' + (profile.events || []).slice(0, 5).map(function(e) { return '<li>' + htmlEscape(e.title) + '</li>'; }).join('') + '</ul></div></div>';
}

// Student form
function showEmbeddedStudentForm() {
  var body = document.getElementById('modalBody');
  var overlay = document.getElementById('modalOverlay');
  if (!body) return;
  body.innerHTML = '<h3>Add Student</h3><div class="form-group"><label>Name</label><input type="text" id="embedStuName" placeholder="Student name"></div><div class="form-group"><label>Class</label><input type="text" id="embedStuClass" placeholder="e.g. Grade 10"></div><div class="form-group"><label>Contact</label><input type="text" id="embedStuContact" placeholder="Phone or email"></div><button class="btn btn-primary" onclick="saveEmbeddedStudent()"><i class="fas fa-save"></i> Save</button><button class="btn btn-outline" style="margin-left:8px;" onclick="closeModal()">Cancel</button>';
  if (overlay) overlay.classList.add('active');
}

function saveEmbeddedStudent() {
  var schoolId = eduverseCurrentSchool;
  if (!schoolId) return;
  var name = document.getElementById('embedStuName')?.value?.trim();
  var cls = document.getElementById('embedStuClass')?.value?.trim();
  var contact = document.getElementById('embedStuContact')?.value?.trim();
  if (!name) { toast('Name is required', 'error'); return; }
  try {
    var raw = localStorage.getItem('schoolData_' + schoolId);
    if (raw) { var sd = JSON.parse(raw); if (!sd.students) sd.students = []; sd.students.push({ id: 'STU' + Date.now(), name: name, class: cls || '', contact: contact || '', password: 'password' }); localStorage.setItem('schoolData_' + schoolId, JSON.stringify(sd)); closeModal(); toast('Student added!'); renderEmbeddedAdmin(schoolId); }
  } catch(e) { toast('Error saving student', 'error'); }
}

// Teacher form
function showEmbeddedTeacherForm() {
  var body = document.getElementById('modalBody');
  var overlay = document.getElementById('modalOverlay');
  if (!body) return;
  body.innerHTML = '<h3>Add Teacher</h3><div class="form-group"><label>Name</label><input type="text" id="embedTchName" placeholder="Teacher name"></div><div class="form-group"><label>Email</label><input type="email" id="embedTchEmail" placeholder="teacher@school.edu"></div><div class="form-group"><label>Assigned Class</label><input type="text" id="embedTchClass" placeholder="e.g. Grade 10"></div><button class="btn btn-primary" onclick="saveEmbeddedTeacher()"><i class="fas fa-save"></i> Save</button><button class="btn btn-outline" style="margin-left:8px;" onclick="closeModal()">Cancel</button>';
  if (overlay) overlay.classList.add('active');
}

function saveEmbeddedTeacher() {
  var schoolId = eduverseCurrentSchool;
  if (!schoolId) return;
  var name = document.getElementById('embedTchName')?.value?.trim();
  var email = document.getElementById('embedTchEmail')?.value?.trim();
  var cls = document.getElementById('embedTchClass')?.value?.trim();
  if (!name) { toast('Name is required', 'error'); return; }
  try {
    var raw = localStorage.getItem('schoolData_' + schoolId);
    if (raw) { var sd = JSON.parse(raw); if (!sd.teachers) sd.teachers = []; sd.teachers.push({ id: 'TCH' + Date.now(), name: name, email: email || '', assignedClass: cls || '', password: 'password' }); localStorage.setItem('schoolData_' + schoolId, JSON.stringify(sd)); closeModal(); toast('Teacher added!'); renderEmbeddedAdmin(schoolId); }
  } catch(e) { toast('Error saving teacher', 'error'); }
}

function renderSchoolFeed(schoolId) {
  var social = getSocialData();
  var items = (social.feed || []).filter(function(f) { return f.schoolId === schoolId; }).slice(0, 20);
  if (!items.length) return '<div class="empty-state"><i class="fas fa-history"></i><p>No activity for this school yet</p></div>';
  return items.map(function(f) { return '<div class="ev-feed-item"><div class="ev-feed-icon"><i class="fas fa-' + (f.type === 'school_created' ? 'plus-circle' : f.type === 'result' ? 'chart-bar' : 'info-circle') + '"></i></div><div class="ev-feed-body"><div class="ev-feed-message">' + htmlEscape(f.message) + '</div><div class="ev-feed-meta">' + htmlEscape(f.userName || 'System') + ' &middot; ' + new Date(f.createdAt).toLocaleDateString() + '</div></div></div>'; }).join('');
}

// ===== ROLE PERMISSIONS FOR COMMUNITY =====
function getRoleLevel(role) {
  var map = { viewer: 0, student: 1, parent: 2, user: 2, teacher: 3, admin: 4, owner: 5 };
  return map[role] || 0;
}

function canViewCommunity(role) { return getRoleLevel(role) >= 1; }
function canPost(role) { return getRoleLevel(role) >= 1; }
function canCreateRoom(role) { return getRoleLevel(role) >= 3; }
function canPinMessage(role) { return getRoleLevel(role) >= 3; }
function canBroadcast(role) { return getRoleLevel(role) >= 3; }
function canModerate(role) { return getRoleLevel(role) >= 3; }
function canDeleteAnyMessage(role) { return getRoleLevel(role) >= 4; }
function canRemoveMember(role) { return getRoleLevel(role) >= 4; }
function canManageRoles(role) { return getRoleLevel(role) >= 4; }

var currentChatRoom = null;

function getSchoolData(schoolId) {
  try { var raw = localStorage.getItem('schoolData_' + schoolId); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}

function saveSchoolData(schoolId, sd) {
  try { localStorage.setItem('schoolData_' + schoolId, JSON.stringify(sd)); } catch(e) {}
}

function ensureChatData(schoolId) {
  var sd = getSchoolData(schoolId);
  if (!sd) return null;
  if (!sd.chatRooms) sd.chatRooms = [];
  if (!sd.chatMessages) sd.chatMessages = [];
  return sd;
}

// Ensure default General room for every school
function ensureGeneralRoom(schoolId) {
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  if (!sd.chatRooms.find(function(r) { return r.id === 'general'; })) {
    sd.chatRooms.unshift({ id: 'general', name: 'General Discussion', createdBy: 'system', createdAt: new Date().toISOString(), pinned: false });
    saveSchoolData(schoolId, sd);
  }
}

// ===== COMMUNITY TAB =====
function renderCommunityTab(schoolId, role) {
  ensureGeneralRoom(schoolId);
  var sd = ensureChatData(schoolId);
  if (!sd) return '<p class="empty-state">School data not available</p>';
  var rooms = sd.chatRooms || [];
  var msgs = sd.chatMessages || [];

  currentChatRoom = currentChatRoom && rooms.find(function(r) { return r.id === currentChatRoom.id; }) ? currentChatRoom : (rooms[0] || null);

  var html = '<div class="ev-community-layout" style="display:grid;grid-template-columns:240px 1fr;gap:16px;margin-top:16px;">';

  // Room list
  html += '<div class="ev-rooms-panel" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">';
  html += '<div style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:14px;display:flex;justify-content:space-between;align-items:center;">';
  html += '<span><i class="fas fa-comments"></i> Rooms</span>';
  if (canCreateRoom(role)) {
    html += '<button class="btn btn-xs btn-primary" onclick="showCreateRoomModal(\'' + schoolId + '\')"><i class="fas fa-plus"></i></button>';
  }
  html += '</div><div class="ev-rooms-list">';
  rooms.forEach(function(r) {
    var active = currentChatRoom && currentChatRoom.id === r.id ? ' style="background:#ebf4ff;border-left:3px solid var(--primary);"' : '';
    var msgCount = msgs.filter(function(m) { return m.roomId === r.id; }).length;
    html += '<div class="ev-room-item"' + active + ' onclick="switchChatRoom(\'' + schoolId + '\',\'' + r.id + '\')" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">';
    html += '<div><div style="font-weight:600;font-size:13px;">' + htmlEscape(r.name) + '</div><div style="font-size:11px;color:var(--text-light);">' + msgCount + ' messages</div></div>';
    if (r.pinned) html += '<i class="fas fa-thumbtack" style="color:var(--accent);font-size:12px;" title="Pinned"></i>';
    html += '</div>';
  });
  html += '</div></div>';

  // Chat area
  html += '<div class="ev-chat-panel" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;display:flex;flex-direction:column;">';

  if (currentChatRoom) {
    var roomMsgs = msgs.filter(function(m) { return m.roomId === currentChatRoom.id; });
    html += '<div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:14px;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;">';
    html += '<span><i class="fas fa-hashtag"></i> ' + htmlEscape(currentChatRoom.name) + '</span>';
    html += '<div class="ev-chat-tools">';
    if (canPinMessage(role) && !currentChatRoom.pinned) {
      html += '<button class="btn btn-xs btn-outline" onclick="pinRoom(\'' + schoolId + '\',\'' + currentChatRoom.id + '\')" title="Pin room"><i class="fas fa-thumbtack"></i></button> ';
    }
    if (canModerate(role)) {
      html += '<button class="btn btn-xs btn-outline" onclick="showBroadcastModal(\'' + schoolId + '\')" title="Broadcast announcement"><i class="fas fa-bullhorn"></i></button> ';
    }
    if (canDeleteAnyMessage(role)) {
      html += '<button class="btn btn-xs btn-outline" onclick="deleteRoom(\'' + schoolId + '\',\'' + currentChatRoom.id + '\')" title="Delete room"><i class="fas fa-trash" style="color:#e53e3e;"></i></button>';
    }
    html += '</div></div>';

    // Messages
    html += '<div class="ev-chat-messages" id="evChatMessages" style="flex:1;overflow-y:auto;padding:12px 16px;min-height:300px;max-height:400px;">';
    if (roomMsgs.length) {
      roomMsgs.forEach(function(m) {
        html += renderChatMessage(m, role);
      });
    } else {
      html += '<div class="empty-state" style="padding:40px 0;"><i class="fas fa-comment-dots"></i><p>No messages yet. Start the conversation!</p></div>';
    }
    html += '</div>';

    // Broadcast banner
    var broadcastMsgs = roomMsgs.filter(function(m) { return m.type === 'broadcast'; });
    if (broadcastMsgs.length) {
      var latest = broadcastMsgs[broadcastMsgs.length - 1];
      html += '<div style="padding:8px 16px;background:#fffbeb;border-top:1px solid #fde68a;font-size:12px;display:flex;align-items:center;gap:8px;"><i class="fas fa-bullhorn" style="color:#d97706;"></i> <strong>Announcement:</strong> ' + htmlEscape(latest.text) + ' <em style="color:var(--text-light);margin-left:auto;font-size:11px;">' + htmlEscape(latest.userName) + '</em></div>';
    }

    // Message input
    html += '<div class="ev-chat-input" style="padding:10px 16px;border-top:1px solid #e2e8f0;display:flex;gap:8px;align-items:center;background:#f8fafc;">';
    html += '<input type="text" id="evChatInput" placeholder="Type a message..." style="flex:1;border:1px solid #e2e8f0;border-radius:20px;padding:8px 14px;font-size:13px;outline:none;" onkeydown="if(event.key===\'Enter\')sendChatMessage(\'' + schoolId + '\')">';
    html += '<button class="btn btn-primary btn-sm" style="border-radius:50%;width:36px;height:36px;padding:0;" onclick="sendChatMessage(\'' + schoolId + '\')"><i class="fas fa-paper-plane"></i></button>';
    html += '</div>';
  } else {
    html += '<div class="empty-state" style="padding:60px 0;"><i class="fas fa-comments"></i><p>Select a room to start chatting</p></div>';
  }

  html += '</div></div>';
  return html;
}

function renderChatMessage(m, currentUserRole) {
  var isOwn = eduverseUser && m.userId === eduverseUser.id;
  var roleBadge = '';
  var roleLabel = { student: 'Student', parent: 'Parent', teacher: 'Teacher', admin: 'Admin', owner: 'Admin' };
  var roleColor = { student: '#3182ce', parent: '#805ad5', teacher: '#2f855a', admin: '#e53e3e', owner: '#e53e3e' };
  if (m.userRole && roleLabel[m.userRole]) {
    roleBadge = '<span style="font-size:10px;padding:1px 6px;border-radius:8px;color:#fff;background:' + (roleColor[m.userRole] || '#718096') + ';margin-left:6px;">' + roleLabel[m.userRole] + '</span>';
  }
  var broadcastTag = m.type === 'broadcast' ? '<i class="fas fa-bullhorn" style="color:#d97706;font-size:12px;margin-right:4px;" title="Announcement"></i>' : '';
  var actions = '';
  if (isOwn) {
    actions += '<button class="btn btn-xs btn-ghost" onclick="deleteOwnMessage(\'' + m.id + '\')" title="Delete" style="color:#a0aec0;font-size:11px;"><i class="fas fa-times"></i></button>';
  }
  if (!isOwn && canModerate(currentUserRole)) {
    actions += '<button class="btn btn-xs btn-ghost" onclick="deleteOwnMessage(\'' + m.id + '\')" title="Remove" style="color:#e53e3e;font-size:11px;"><i class="fas fa-ban"></i></button>';
  }
  return '<div class="ev-chat-msg" style="padding:6px 0;display:flex;gap:8px;align-items:flex-start;">'
    + '<div style="width:32px;height:32px;border-radius:50%;background:' + (roleColor[m.userRole] || '#718096') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">' + (m.userName ? m.userName.charAt(0).toUpperCase() : '?') + '</div>'
    + '<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;">' + htmlEscape(m.userName || 'Unknown') + roleBadge + ' <span style="color:var(--text-light);font-weight:400;font-size:11px;">' + new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</span></div>'
    + '<div style="font-size:13px;margin-top:2px;">' + broadcastTag + htmlEscape(m.text) + '</div></div>'
    + (actions ? '<div style="flex-shrink:0;display:flex;gap:2px;">' + actions + '</div>' : '')
    + '</div>';
}

function switchChatRoom(schoolId, roomId) {
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  currentChatRoom = (sd.chatRooms || []).find(function(r) { return r.id === roomId; }) || null;
  renderCommunityContent(schoolId);
}

function sendChatMessage(schoolId) {
  var input = document.getElementById('evChatInput');
  if (!input || !input.value.trim() || !currentChatRoom || !eduverseUser) return;
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  if (!canPost(role)) { toast('You do not have permission to post', 'error'); return; }
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  if (!sd.chatMessages) sd.chatMessages = [];
  var msg = {
    id: 'MSG' + Date.now() + Math.random().toString(36).slice(2, 6),
    roomId: currentChatRoom.id,
    userId: eduverseUser.id,
    userName: eduverseUser.name,
    userRole: role,
    text: input.value.trim(),
    type: 'message',
    createdAt: new Date().toISOString()
  };
  sd.chatMessages.push(msg);
  saveSchoolData(schoolId, sd);
  input.value = '';
  renderCommunityContent(schoolId);
  addFeedEntry(schoolId, 'chat', eduverseUser.name + ' sent a message in ' + currentChatRoom.name);
}

function deleteOwnMessage(msgId) {
  if (!eduverseUser || !currentChatRoom) return;
  var schoolId = eduverseCurrentSchool;
  if (!schoolId) return;
  var sd = ensureChatData(schoolId);
  if (!sd || !sd.chatMessages) return;
  var idx = sd.chatMessages.findIndex(function(m) { return m.id === msgId; });
  if (idx === -1) return;
  var msg = sd.chatMessages[idx];
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  // Own message or moderate permission
  if (msg.userId === eduverseUser.id || canModerate(role)) {
    sd.chatMessages.splice(idx, 1);
    saveSchoolData(schoolId, sd);
    renderCommunityContent(schoolId);
  } else {
    toast('You cannot delete this message', 'error');
  }
}

function pinRoom(schoolId, roomId) {
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  var room = (sd.chatRooms || []).find(function(r) { return r.id === roomId; });
  if (!room) return;
  room.pinned = !room.pinned;
  saveSchoolData(schoolId, sd);
  renderCommunityContent(schoolId);
}

function deleteRoom(schoolId, roomId) {
  if (roomId === 'general') { toast('Cannot delete the General room', 'error'); return; }
  if (!confirm('Delete this room and all its messages?')) return;
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  sd.chatRooms = (sd.chatRooms || []).filter(function(r) { return r.id !== roomId; });
  sd.chatMessages = (sd.chatMessages || []).filter(function(m) { return m.roomId !== roomId; });
  saveSchoolData(schoolId, sd);
  currentChatRoom = (sd.chatRooms || [])[0] || null;
  renderCommunityContent(schoolId);
}

function showCreateRoomModal(schoolId) {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<h3>Create Chat Room</h3><div class="form-group"><label>Room Name</label><input type="text" id="newRoomName" placeholder="e.g. Grade 10 Discussion"></div><button class="btn btn-primary" onclick="createRoom(\'' + schoolId + '\')"><i class="fas fa-plus"></i> Create</button><button class="btn btn-outline" style="margin-left:8px;" onclick="closeModal()">Cancel</button>';
  if (overlay) overlay.classList.add('active');
}

function createRoom(schoolId) {
  var name = document.getElementById('newRoomName')?.value?.trim();
  if (!name) { toast('Room name is required', 'error'); return; }
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  if (!canCreateRoom(role)) { toast('Only teachers and admins can create rooms', 'error'); return; }
  var room = { id: 'room_' + Date.now(), name: name, createdBy: eduverseUser ? eduverseUser.id : 'system', createdAt: new Date().toISOString(), pinned: false };
  sd.chatRooms.push(room);
  saveSchoolData(schoolId, sd);
  closeModal();
  currentChatRoom = room;
  renderCommunityContent(schoolId);
  addFeedEntry(schoolId, 'room_created', eduverseUser.name + ' created room: ' + name);
}

function showBroadcastModal(schoolId) {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<h3><i class="fas fa-bullhorn"></i> Send Announcement</h3><p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">This will be pinned at the top of the current room for all members to see.</p><div class="form-group"><label>Announcement</label><textarea id="broadcastText" rows="3" placeholder="Write your announcement..." style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"></textarea></div><button class="btn btn-primary" onclick="sendBroadcast(\'' + schoolId + '\')"><i class="fas fa-paper-plane"></i> Send</button><button class="btn btn-outline" style="margin-left:8px;" onclick="closeModal()">Cancel</button>';
  if (overlay) overlay.classList.add('active');
}

function sendBroadcast(schoolId) {
  var text = document.getElementById('broadcastText')?.value?.trim();
  if (!text) { toast('Announcement text is required', 'error'); return; }
  if (!currentChatRoom || !eduverseUser) return;
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  if (!canBroadcast(role)) { toast('Only teachers and admins can broadcast', 'error'); return; }
  var sd = ensureChatData(schoolId);
  if (!sd) return;
  if (!sd.chatMessages) sd.chatMessages = [];
  sd.chatMessages.push({
    id: 'MSG' + Date.now(),
    roomId: currentChatRoom.id,
    userId: eduverseUser.id,
    userName: eduverseUser.name,
    userRole: role,
    text: text,
    type: 'broadcast',
    createdAt: new Date().toISOString()
  });
  saveSchoolData(schoolId, sd);
  closeModal();
  renderCommunityContent(schoolId);
  addFeedEntry(schoolId, 'broadcast', eduverseUser.name + ' announced: ' + text);
}

function renderCommunityContent(schoolId) {
  var mem = getMembershipForSchool(schoolId);
  var role = mem ? mem.role : 'viewer';
  var pane = document.getElementById('evSchoolCommunity');
  if (!pane) return;
  pane.innerHTML = renderCommunityTab(schoolId, role);
  // Scroll to bottom of messages
  var msgs = document.getElementById('evChatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

// ===== AUTH GATING — replace CTA buttons with login prompt on school profiles =====
function updateAuthGating() {
  var isLoggedIn = !!(eduverseUser);
  document.querySelectorAll('.auth-gated').forEach(function(el) {
    el.style.display = isLoggedIn ? '' : 'none';
  });
  document.querySelectorAll('.auth-public').forEach(function(el) {
    el.style.display = isLoggedIn ? 'none' : '';
  });
}

function updateEduverseTopbar() {
  var el = document.getElementById('evUserAvatar');
  var nel = document.getElementById('evUserName');
  var mel = document.getElementById('evUserMenuName');
  if (eduverseUser) {
    if (el) el.src = eduverseUser.avatar || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%231a3a5c%22/%3E%3Ctext x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22%23fff%22 font-size=%2240%22 font-weight=%22bold%22%3E' + (eduverseUser.name ? eduverseUser.name.charAt(0).toUpperCase() : '?') + '%3C/text%3E%3C/svg%3E';
    if (nel) nel.textContent = eduverseUser.name;
    if (mel) mel.textContent = eduverseUser.name;
  }
  var schools = getMySchools();
  var sl = document.getElementById('evSchoolsList');
  if (sl) {
    if (schools.length) {
      sl.innerHTML = schools.map(function(s) { return '<div class="ev-school-item' + (eduverseCurrentSchool === s.school.id ? ' active' : '') + '" onclick="showEduverseSchoolPage(\'' + s.school.id + '\')"><div class="ev-school-item-icon">' + (s.school.logo ? '<img src="' + htmlEscape(s.school.logo) + '">' : '<i class="fas fa-school"></i>') + '</div><div class="ev-school-item-info"><div class="ev-school-item-name">' + htmlEscape(s.school.name) + '</div><div class="ev-school-item-role">' + s.role + '</div></div></div>'; }).join('');
    } else {
      sl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-light);font-size:13px;"><i class="fas fa-school" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.4;"></i>No schools joined yet</div>';
    }
  }
}

function postFeedUpdate() {
  var text = document.getElementById('evPostText');
  if (!text || !text.value.trim()) return;
  var schools = getMySchools();
  if (!schools.length) { toast('Join or create a school first', 'error'); return; }
  schools.forEach(function(s) {
    addFeedEntry(s.school.id, 'update', eduverseUser.name + ' posted: ' + text.value.trim());
  });
  text.value = '';
  toast('Update posted to your schools');
  renderHomeFeed();
}

// ===== FACEBOOK-STYLE MODAL HELPERS =====
function showEduverseSignup() {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<div style="text-align:center;padding:8px 0;"><i class="fas fa-graduation-cap" style="font-size:48px;color:var(--primary);margin-bottom:8px;"></i><h2 style="margin-bottom:4px;">Join EduVerse</h2><p style="color:var(--text-light);font-size:14px;margin-bottom:20px;">Create your account to access school management</p><div id="evSignupError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;font-size:14px;"></div><div class="form-group"><label>Full Name</label><input type="text" id="evSignupName" placeholder="John Doe"></div><div class="form-group"><label>Email</label><input type="email" id="evSignupEmail" placeholder="john@example.com"></div><div class="form-group"><label>Password (min 6 chars)</label><input type="password" id="evSignupPass" placeholder="Create a password"></div><button class="btn btn-success" style="width:100%;margin-top:8px;" onclick="handleEduverseSignup()"><i class="fas fa-user-plus"></i> Create Account</button><p style="margin-top:16px;font-size:13px;color:var(--text-light);">Already have an account? <a href="javascript:;" onclick="closeModal();showEduverseLogin()" style="color:var(--primary);font-weight:600;">Log In</a></p></div>';
  if (overlay) overlay.classList.add('active');
}

function showEduverseLogin() {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  var saved = ''; var savedPass = '';
  var isDemo = false;
  try { isDemo = localStorage.getItem('demoMode') === 'true'; } catch(e) {}
  if (isDemo) { saved = 'demo@eduverse.com'; savedPass = 'demo123'; }
  if (!isDemo) {
    try { saved = localStorage.getItem('evRememberEmail') || ''; savedPass = localStorage.getItem('evRememberPass') || ''; if (savedPass) savedPass = atob(savedPass); } catch(e) {}
  }
  var checked = saved ? ' checked' : '';
  body.innerHTML = '<div style="text-align:center;padding:8px 0;"><i class="fas fa-graduation-cap" style="font-size:48px;color:var(--primary);margin-bottom:8px;"></i><h2 style="margin-bottom:4px;">Welcome to EduVerse</h2><p style="color:var(--text-light);font-size:14px;margin-bottom:20px;">Sign in to manage your schools</p><div id="evLoginError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;font-size:14px;"></div>' + (isDemo ? '<div style="background:#fefcbf;color:#744210;padding:10px;border-radius:6px;margin-bottom:12px;font-size:13px;"><i class="fas fa-info-circle"></i> Demo mode — using <strong>demo@eduverse.com</strong> / <strong>demo123</strong></div>' : '') + '<div class="form-group"><label>Email</label><input type="email" id="evLoginEmail" placeholder="john@example.com" value="' + esc(saved) + '"></div><div class="form-group"><label>Password</label><input type="password" id="evLoginPass" placeholder="Your password" value="' + esc(savedPass) + '"></div><label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;margin-bottom:12px;"><input type="checkbox" id="evRememberMe"' + checked + '> Remember me</label><button class="btn btn-primary" style="width:100%;margin-top:8px;" onclick="handleEduverseLogin()"><i class="fas fa-arrow-right"></i> Sign In</button><p style="margin-top:16px;font-size:13px;color:var(--text-light);">Don\'t have an account? <a href="javascript:;" onclick="closeModal();showEduverseSignup()" style="color:var(--primary);font-weight:600;">Sign Up</a></p></div>';
  if (overlay) overlay.classList.add('active');
}

function handleEduverseSignup() {
  var name = document.getElementById('evSignupName')?.value?.trim();
  var email = document.getElementById('evSignupEmail')?.value?.trim();
  var pass = document.getElementById('evSignupPass')?.value;
  var err = document.getElementById('evSignupError');
  if (!name || !email || !pass) { if (err) { err.textContent = 'Please fill all fields'; err.style.display = 'block'; } return; }
  if (pass.length < 6) { if (err) { err.textContent = 'Password must be at least 6 characters'; err.style.display = 'block'; } return; }
  if (err) err.style.display = 'none';
  var result = eduverseSignup(name, email, pass);
  if (result.error) { if (err) { err.textContent = result.error; err.style.display = 'block'; } return; }
  closeModal();
  eduverseUser = result.user;
  localStorage.setItem('eduverseUser', JSON.stringify(result.user));
  // Auto-save credentials after signup
  try { localStorage.setItem('evRememberEmail', email); localStorage.setItem('evRememberPass', btoa(pass)); } catch(e) {}
  if (typeof updateAuthGating === 'function') updateAuthGating();
  toast('Welcome to EduVerse, ' + name + '!');
  showApp();
  showEduverseHome();
}

function handleEduverseLogin() {
  var email = document.getElementById('evLoginEmail')?.value?.trim();
  var pass = document.getElementById('evLoginPass')?.value;
  var err = document.getElementById('evLoginError');
  if (!email || !pass) { if (err) { err.textContent = 'Please fill all fields'; err.style.display = 'block'; } return; }
  if (err) err.style.display = 'none';
  var result = eduverseLogin(email, pass);
  if (result.error) { if (err) { err.textContent = result.error; err.style.display = 'block'; } return; }
  closeModal();
  // Save credentials if "Remember me" is checked
  var remember = document.getElementById('evRememberMe');
  if (remember && remember.checked) {
    try { localStorage.setItem('evRememberEmail', email); localStorage.setItem('evRememberPass', btoa(pass)); } catch(e) {}
  } else {
    try { localStorage.removeItem('evRememberEmail'); localStorage.removeItem('evRememberPass'); } catch(e) {}
  }
  if (typeof updateAuthGating === 'function') updateAuthGating();
  toast('Welcome back, ' + result.user.name + '!');
  showApp();
  showEduverseHome();
}

// ===== GLOBAL SEARCH =====
function handleGlobalSearch() {
  var input = document.getElementById('evGlobalSearch');
  if (!input || !input.value.trim()) return;
  var q = input.value.trim().toLowerCase();
  var tenants = typeof getTenants === 'function' ? getTenants() : [];
  var matches = tenants.filter(function(t) { return t.name.toLowerCase().includes(q) || (t.motto || '').toLowerCase().includes(q); });
  if (matches.length === 1) {
    if (typeof showEduverseSchoolPage === 'function') showEduverseSchoolPage(matches[0].id);
  } else if (matches.length > 1) {
    if (typeof showSchoolSelector === 'function') showSchoolSelector();
  } else {
    toast('No schools match "' + input.value.trim() + '"', 'error');
  }
  input.value = '';
}

function openCommunityTab() {
  var schoolId = eduverseCurrentSchool || localStorage.getItem('activeTenant');
  if (!schoolId) { toast('No school selected', 'error'); return; }
  if (typeof showEduverseSchoolPage === 'function') {
    showEduverseSchoolPage(schoolId);
    setTimeout(function() {
      if (typeof switchSchoolTab === 'function') switchSchoolTab(schoolId, 'community');
    }, 150);
  }
}

// ===== QUICK ADMIN LINK =====
function handleQuickAdminLink() {
  if (eduverseCurrentSchool) {
    showEduverseSchoolPage(eduverseCurrentSchool);
    // Switch to admin tab after render
    setTimeout(function() { switchSchoolTab(eduverseCurrentSchool, 'admin'); }, 100);
  } else {
    window.location.href = 'admin.html';
  }
}

// ===== INIT =====
function initEduVerse() {
  // One-time migration: merge legacy per-tenant social data into global store
  migrateSocialData();

  // Restore session
  try {
    var saved = localStorage.getItem('eduverseUser');
    if (saved) {
      eduverseUser = JSON.parse(saved);
      migrateLegacyUsers();
    }
  } catch(e) {}
  if (typeof updateAuthGating === 'function') updateAuthGating();
}
