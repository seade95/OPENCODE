// ===== Path-Based Subdomain Router =====
// Maps URL paths under tenant subdomains to portal views.
// E.g. tenantname.yourdomain.com/admin → admin portal
//       tenantname.yourdomain.com/student → student portal
//
// Only activates when a tenant subdomain is resolved (activeTenant is set).
// Works on ANY static host — all logic is client-side.
// ============================================================================

var PATH_ROUTES = {
  '/admin':    { label: 'Admin',    loginFn: 'showAdminLogin',    portalFn: 'showAdminPortal' },
  '/teacher':  { label: 'Teacher',  loginFn: 'showTeacherLogin',  portalFn: 'showTeacherPortal' },
  '/student':  { label: 'Student',  loginFn: 'showStudentLogin',  portalFn: 'showStudentPortal' },
  '/parent':   { label: 'Parent',   loginFn: 'showParentLogin',   portalFn: 'showParentPortal' },
  '/dashboard':{ label: 'Dashboard',loginFn: 'showAdminLogin',    portalFn: 'showAdminPortal' },
  '/login':    { label: 'Login',    loginFn: 'showEduverseLogin', portalFn: null },
  '/signup':   { label: 'Sign Up',  loginFn: 'showEduverseSignup', portalFn: null },
};

// Current route (for reference in link generation)
var _currentRoute = '/';

// ===== Portal Show Functions (with session check) =====

function showStudentPortal() {
  var s = typeof getSession === 'function' ? getSession() : null;
  if (!currentStudent && s && s.type === 'student') {
    if (data && data.students) currentStudent = data.students.find(function(a) { return a.id === s.user.id; }) || null;
    if (!currentStudent && s.user) currentStudent = s.user;
  }
  if (!currentStudent) { showStudentLogin(); return; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var sp = document.getElementById('studentPage');
  if (sp) sp.classList.add('active');
  if (typeof renderStudentPortal === 'function') renderStudentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function showTeacherPortal() {
  var s = typeof getSession === 'function' ? getSession() : null;
  if (!currentTeacher && s && s.type === 'teacher') {
    if (data && data.teachers) currentTeacher = data.teachers.find(function(a) { return a.id === s.user.id; }) || null;
    if (!currentTeacher && s.user) currentTeacher = s.user;
  }
  if (!currentTeacher) { showTeacherLogin(); return; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tp = document.getElementById('teacherPage');
  if (tp) tp.classList.add('active');
  if (typeof renderTeacherPortal === 'function') renderTeacherPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function showParentPortal() {
  var s = typeof getSession === 'function' ? getSession() : null;
  if (!currentParent && s && s.type === 'parent') {
    if (data && data.parents) currentParent = data.parents.find(function(a) { return a.id === s.user.id; }) || null;
    if (!currentParent && s.user) currentParent = s.user;
  }
  if (!currentParent) { showParentLogin(); return; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var pp = document.getElementById('parentPage');
  if (pp) pp.classList.add('active');
  if (typeof renderParentPortal === 'function') renderParentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

// ===== Route Resolver =====

function routeSubdomainPath(path) {
  // Normalize path
  path = path.replace(/\/+$/, '') || '/';

  var route = PATH_ROUTES[path];

  // If no route matches and path is '/', just show landing (no special routing)
  if (!route) {
    if (path === '/') return;
    // Unknown path under subdomain — show tenant landing page
    return;
  }

  _currentRoute = path;

  // Try to show the portal directly if the user is logged in
  if (route.portalFn && typeof window[route.portalFn] === 'function') {
    // Check if user is already logged in for this portal type
    var session = typeof getSession === 'function' ? getSession() : null;
    var portalType = path.replace('/', '');
    if (portalType === 'dashboard') portalType = 'admin';
    if (session && session.type === portalType) {
      window[route.portalFn]();
      return;
    }
  }

  // Not logged in — show the login page
  if (route.loginFn && typeof window[route.loginFn] === 'function') {
    window[route.loginFn]();
  }
}

// ===== Navigation Helper =====

function navigateTo(path) {
  path = path.replace(/\/+$/, '') || '/';
  // Update URL without reload
  try { window.history.pushState({ path: path }, '', path); } catch(e) {}
  routeSubdomainPath(path);
}

// Listen for back/forward browser navigation
window.addEventListener('popstate', function(e) {
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  routeSubdomainPath(path);
});

// ===== Link Interceptor =====
// Converts portal links to subdomain-aware path links
// On subdomains: admin.html → /admin, javascript:onclick → path navigation

function patchSubdomainLinks() {
  if (!localStorage.getItem('activeTenant')) return;

  // Map of portal href/onclick → path
  var LINK_MAP = {
    'admin.html': '/admin',
    'teacher.html': '/teacher',
    'student.html': '/student',
    'parent.html': '/parent',
  };
  var CLICK_MAP = {
    'showAdminPortal()': '/admin',
    'showTeacherPortal()': '/teacher',
    'showStudentPortal()': '/student',
    'showParentPortal()': '/parent',
    'showEduverseLogin()': '/login',
    'showEduverseSignup()': '/signup',
  };

  // Intercept clicks on portal links
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a');
    if (!target) return;
    var href = (target.getAttribute('href') || '').trim();
    var onclick = (target.getAttribute('onclick') || '').trim();

    // Map href-based links (admin.html → /admin)
    if (LINK_MAP[href]) {
      e.preventDefault();
      navigateTo(LINK_MAP[href]);
      return;
    }

    // Map onclick-based links
    if (CLICK_MAP[onclick]) {
      e.preventDefault();
      navigateTo(CLICK_MAP[onclick]);
      return;
    }
  });
}

// ===== Init =====

function initPathRouter() {
  var isSubdomain = !!localStorage.getItem('activeTenant');
  if (!isSubdomain) return;

  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  routeSubdomainPath(path);
  patchSubdomainLinks();
}

// Auto-init after app.js finishes (runs on DOMContentLoaded + setTimeout to yield)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initPathRouter, 400);
});
