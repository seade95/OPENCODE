document.addEventListener('DOMContentLoaded', function() {
  data = loadData();

  // Resolve school from URL hash/param — overrides existing activeTenant
  if (typeof resolveSchoolFromUrl === 'function') {
    var urlSchoolId = resolveSchoolFromUrl();
    if (urlSchoolId) {
      var current = localStorage.getItem('activeTenant');
      if (urlSchoolId !== current && typeof switchTenant === 'function') {
        switchTenant(urlSchoolId);
        // switchTenant reloads the page — code below won't execute
      }
    }
  }

  // Ensure critical UI elements exist
  if (!document.getElementById('toastContainer')) {
    var tc = document.createElement('div');
    tc.id = 'toastContainer';
    tc.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(tc);
  }

  if (typeof initDarkMode === 'function') initDarkMode();
  if (typeof updateLandingStats === 'function') updateLandingStats();
  if (typeof renderLandingPageSections === 'function') renderLandingPageSections();

  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this && typeof closeModal === 'function') closeModal();
    });
  }

  if (typeof initLanguageSelector === 'function') {
    ['langSelector','tchLangSelector','stuLangSelector','parentLangSelector'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) initLanguageSelector(id);
    });
  }

  if (typeof applyTranslations === 'function') applyTranslations();
  if (typeof initSessionMonitor === 'function') initSessionMonitor();

  // Update navbar with current tenant info
  (function() {
    try {
      var activeTenant = localStorage.getItem('activeTenant');
      if (activeTenant && typeof getTenants === 'function') {
        var tenants = getTenants();
        var tenant = tenants.find(function(t) { return t.id === activeTenant; });
        if (tenant) {
          var el = document.getElementById('navSchoolName');
          if (el) el.textContent = tenant.name;
          var ind = document.getElementById('navSchoolIndicator');
          if (ind) { ind.textContent = tenant.name.substring(0, 12); ind.title = tenant.name; }
          document.body.classList.add('tenant-loaded');
        }
      }
    } catch(e) {}
  })();

  // Close EduVerse user dropdown when clicking outside
  document.addEventListener('click', function(ev) {
    var dd = document.getElementById('evUserDropdown');
    if (dd && dd.classList.contains('show') && !ev.target.closest('.ev-user-menu')) {
      dd.classList.remove('show');
    }
  });

  // ===== EduVerse Facebook-style platform init =====
  if (typeof initEduVerse === 'function') {
    initEduVerse();
    // Restore session: if user was logged in, show app
    try {
      var saved = localStorage.getItem('eduverseUser');
      if (saved && JSON.parse(saved)) {
        // Short delay to let everything render, then show app
        setTimeout(function() {
          if (typeof showApp === 'function' && typeof showEduverseHome === 'function') {
            showApp();
            showEduverseHome();
          }
        }, 50);
      }
    } catch(e) {}
  }

  // Auto-fill demo credentials on login forms and navigate to student portal when demo mode is active
  try {
    if (localStorage.getItem('demoMode') === 'true') {
      var stuId = document.getElementById('loginId');
      var stuName = document.getElementById('loginName');
      if (stuId) stuId.value = 'STU001';
      if (stuName) stuName.value = 'stu001';
      var stuHint = document.getElementById('stuDemoHint');
      if (stuHint) stuHint.style.display = 'block';

      var tchId = document.getElementById('teacherLoginId');
      var tchPass = document.getElementById('teacherLoginPass');
      if (tchId) tchId.value = 'TCH001';
      if (tchPass) tchPass.value = 'teacher123';
      var tchHint = document.getElementById('tchDemoHint');
      if (tchHint) tchHint.style.display = 'block';

      var parEmail = document.getElementById('parentLoginEmail');
      var parPass = document.getElementById('parentLoginPass');
      if (parEmail) parEmail.value = 'robert@example.com';
      if (parPass) parPass.value = 'parent123';
      var parHint = document.getElementById('parentDemoHint');
      if (parHint) parHint.style.display = 'block';

      // Auto-navigate to student login so demo user sees the portal immediately
      setTimeout(function() {
        if (typeof showStudentLogin === 'function') showStudentLogin();
      }, 150);
    }
  } catch(e) {}

  // Listen for hash changes (user navigates to a different school URL)
  window.addEventListener('hashchange', function() {
    if (typeof resolveSchoolFromUrl === 'function') {
      var urlSchoolId = resolveSchoolFromUrl();
      if (urlSchoolId) {
        var current = localStorage.getItem('activeTenant');
        if (urlSchoolId !== current && typeof switchTenant === 'function') {
          switchTenant(urlSchoolId);
        }
      } else {
        // Hash changed but not to a school — clear tenant back to local mode
        var current = localStorage.getItem('activeTenant');
        if (current) {
          localStorage.removeItem('activeTenant');
          localStorage.removeItem('activeTenantKey');
          window.location.reload();
        }
      }
    }
  });

  // Scroll buttons (top/bottom)
  var topBtn = document.getElementById('scrollTopBtn');
  var bottomBtn = document.getElementById('scrollBottomBtn');
  if (topBtn && bottomBtn) {
    var scrollTimer;
    function toggleScrollBtns() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      topBtn.classList.toggle('visible', scrollTop > 300);
      bottomBtn.classList.toggle('visible', docHeight - scrollTop > 300);
    }
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(toggleScrollBtns, 100);
    });
    toggleScrollBtns();
  }
});
