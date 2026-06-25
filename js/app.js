document.addEventListener('DOMContentLoaded', function() {
  // Version mismatch → force full page refresh to clear browser cache
  try {
    var ver = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '';
    var cacheKey = 'app_cache_version';
    var storedVer = localStorage.getItem(cacheKey);
    if (ver && storedVer !== ver) {
      localStorage.setItem(cacheKey, ver);
      window.location.reload(true);
      return;
    }
  } catch(e) {}

  data = loadData();

  // Route /superadmin path to the standalone super admin page
  var path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/superadmin') {
    window.location.replace('superadmin.html');
    return;
  }

  // Try subdomain-based tenant resolution first (e.g., myschool.yourdomain.com)
  var _detectedUnknownSchool = false;
  if (typeof resolveSchoolFromSubdomain === 'function') {
    var subdomainSchoolId = resolveSchoolFromSubdomain();
    if (subdomainSchoolId) {
      var current = localStorage.getItem('activeTenant');
      if (subdomainSchoolId !== current && typeof switchTenant === 'function') {
        switchTenant(subdomainSchoolId);
        return;
      }
    } else {
      // Check if we're on a subdomain (not www, not apex) but no tenant matched
      var hostParts = window.location.hostname.toLowerCase().split('.');
      if (hostParts.length >= 3 && ['localhost','127.0.0.1'].indexOf(window.location.hostname) === -1 && !/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
        var sub = hostParts[0];
        if (sub && ['www'].indexOf(sub) === -1) {
          _detectedUnknownSchool = sub;
        }
      }
    }
  }

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

  // ===== EduVerse platform init (silent session restore, no auto-navigation) =====
  if (typeof initEduVerse === 'function') initEduVerse();

  // Show "Unknown School" banner if accessed via unknown subdomain
  if (_detectedUnknownSchool) {
    // Inject keyframe animation once
    if (!document.getElementById('_ueAnimStyle')) {
      var styleEl = document.createElement('style');
      styleEl.id = '_ueAnimStyle';
      styleEl.textContent = '@keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
      document.head.appendChild(styleEl);
    }
    var ueContainer = document.createElement('div');
    ueContainer.id = 'unknownSchoolBanner';
    ueContainer.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:16px 24px;text-align:center;font-family:Inter,system-ui,sans-serif;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:slideDown 0.3s ease;';
    ueContainer.innerHTML = '<button onclick="dismissUnknownSchoolBanner()" style="position:absolute;top:8px;right:12px;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:0.8;line-height:1;" title="Dismiss">&times;</button>'
      + '<div style="max-width:600px;margin:0 auto;">'
      + '<h3 style="margin:0 0 4px;font-size:18px;"><i class="fas fa-map-signs"></i> School Not Found</h3>'
      + '<p style="margin:0;font-size:14px;opacity:0.9;">The subdomain <strong style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;font-family:monospace;">' + esc(_detectedUnknownSchool) + '</strong> does not match any registered school on EDUVERSE.</p>'
      + '<p style="margin:8px 0 0;font-size:13px;opacity:0.8;">If you own this school, please contact your super administrator or visit the <a href="' + window.location.origin + '/" style="color:#fbbf24;font-weight:600;text-decoration:underline;">main portal</a>.</p>'
      + '</div>';
    document.body.prepend(ueContainer);
    // Push main content down so banner is visible
    var mainEl = document.querySelector('main, .main-content, #app, .landing-page');
    if (mainEl) mainEl.style.marginTop = '100px';
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

      // Fields are pre-filled — user clicks a portal card to enter
    }
  } catch(e) {}

  // Restore session — auto-navigates to the correct portal if logged in
  if (typeof syncSession === 'function') syncSession();

  // Cross-tab session sync
  window.addEventListener('storage', function(e) {
    if (e.key === 'eduverse_session') {
      if (!e.newValue) {
        // Session cleared in another tab
        clearSession();
        goHome();
      } else {
        // Session set in another tab — reload to pick up fresh state
        window.location.reload();
      }
    }
  });

  // Listen for hash changes (user navigates to a different school URL)
  // Also re-check subdomain in case hostname changed (edge case for dev)
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

  // Scroll buttons (top/bottom) — throttled with requestAnimationFrame
  var topBtn = document.getElementById('scrollTopBtn');
  var bottomBtn = document.getElementById('scrollBottomBtn');
  if (topBtn && bottomBtn) {
    var _scrollRafId = null;
    function toggleScrollBtns() {
      _scrollRafId = null;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      topBtn.classList.toggle('visible', scrollTop > 300);
      bottomBtn.classList.toggle('visible', docHeight - scrollTop > 300);
    }
    window.addEventListener('scroll', function() {
      if (!_scrollRafId) _scrollRafId = requestAnimationFrame(toggleScrollBtns);
    }, { passive: true });
    toggleScrollBtns();
  }
});

function dismissUnknownSchoolBanner() {
  var banner = document.getElementById('unknownSchoolBanner');
  if (banner) {
    banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    banner.style.transform = 'translateY(-100%)';
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 300);
  }
  var mainEl = document.querySelector('main, .main-content, #app, .landing-page');
  if (mainEl) mainEl.style.marginTop = '';
}
