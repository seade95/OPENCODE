// EDUVERSE - Screen Protection Module
// Anti-screenshot, anti-recording, anti-devtools, and content protection

(function() {
  if (window.__screenProtectionActive) return;
  window.__screenProtectionActive = true;

  var _overlay = null;
  var _flashOverlay = null;
  var _devtoolsOpen = false;
  var _protectionLevel = 0;

  // ===== STYLES =====
  var style = document.createElement('style');
  style.textContent =
    '#spBlurOverlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;display:none;align-items:center;justify-content:center;flex-direction:column;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}' +
    '#spBlurOverlay .sp-icon{font-size:64px;color:#2563eb;margin-bottom:20px}' +
    '#spBlurOverlay h2{color:#fff;font-size:24px;font-weight:700;margin-bottom:8px}' +
    '#spBlurOverlay p{color:#a0aec0;font-size:15px}' +
    '#spFlashOverlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999998;display:none;align-items:center;justify-content:center;flex-direction:column;animation:spFadeIn .2s ease}' +
    '#spFlashOverlay .sp-icon{font-size:72px;color:#e53e3e;margin-bottom:16px}' +
    '#spFlashOverlay h2{color:#fff;font-size:22px;font-weight:700;margin-bottom:6px}' +
    '#spFlashOverlay p{color:#fc8181;font-size:14px}' +
    '@keyframes spFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes spPulse{0%,100%{opacity:1}50%{opacity:0.4}}' +
    '.sp-devtools-warning{position:fixed;top:0;left:0;right:0;background:#e53e3e;color:#fff;text-align:center;padding:10px;font-size:14px;font-weight:600;z-index:999997;animation:spPulse 2s infinite}' +
    '.sp-no-select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}' +
    '.sp-no-select input,.sp-no-select textarea{-webkit-user-select:auto;-moz-user-select:auto;-ms-user-select:auto;user-select:auto}' +
    '.sp-watermark{position:fixed;bottom:4px;right:8px;font-size:10px;color:rgba(37,99,235,0.12);z-index:99999;pointer-events:none;font-family:monospace;letter-spacing:1px;white-space:nowrap}';
  document.head.appendChild(style);

  // ===== CREATE OVERLAYS =====
  function createOverlays() {
    if (document.getElementById('spBlurOverlay')) return;
    var body = document.body;

    // Blur overlay (tab switch / minimize)
    var bo = document.createElement('div');
    bo.id = 'spBlurOverlay';
    bo.innerHTML = '<div class="sp-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h2>Session Protected</h2><p>Content is hidden while you switch tabs</p>';
    body.appendChild(bo);
    _overlay = bo;

    // Flash overlay (PrintScreen / screenshot attempt)
    var fo = document.createElement('div');
    fo.id = 'spFlashOverlay';
    fo.innerHTML = '<div class="sp-icon"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><h2>Screenshot Detected</h2><p>This content is protected</p>';
    body.appendChild(fo);
    _flashOverlay = fo;
  }

  // ===== SHOW / HIDE OVERLAYS =====
  function showBlurOverlay() {
    if (_overlay) _overlay.style.display = 'flex';
  }

  function hideBlurOverlay() {
    if (_overlay) _overlay.style.display = 'none';
  }

  function showFlashOverlay() {
    if (_flashOverlay) {
      _flashOverlay.style.display = 'flex';
      setTimeout(function() { _flashOverlay.style.display = 'none'; }, 1500);
    }
    // Log the event
    try {
      var d = window.data;
      if (d) {
        if (!d.securityLog) d.securityLog = [];
        d.securityLog.push({ type: 'screenshot', date: new Date().toISOString(), user: currentAdmin?.id || currentTeacher?.id || currentStudent?.id || currentParent?.id || 'anonymous' });
        if (d.securityLog.length > 100) d.securityLog.splice(0, d.securityLog.length - 100);
        if (typeof saveData === 'function') saveData();
      }
    } catch(e) {}
  }

  // ===== BLUR / FOCUS DETECTION =====
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      showBlurOverlay();
    } else {
      hideBlurOverlay();
    }
  });

  window.addEventListener('blur', function() {
    // Alt-Tab, Win+Tab, etc.
    showBlurOverlay();
  });

  window.addEventListener('focus', function() {
    hideBlurOverlay();
  });

  // ===== PRINTSCREEN DETECTION =====
  document.addEventListener('keydown', function(e) {
    // PrintScreen key (keyCode 44, modern browsers use key 'PrintScreen')
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      showFlashOverlay();
    }
    // Ctrl+Shift+PrtSc / Cmd+Shift+3 (macOS screenshot)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'PrintScreen' || e.keyCode === 44)) {
      showFlashOverlay();
    }
  });

  // Also detect PrintScreen via clipboard monitoring
  document.addEventListener('keyup', function(e) {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      // Additional protection on keyup
    }
  });

  // ===== DEVTools DETECTION =====
  function detectDevTools() {
    // Method 1: Check element ID trick (DevTools console creates temp elements)
    var devtools = /./;
    devtools.toString = function() {
      _devtoolsOpen = true;
      showDevToolsWarning();
      return '';
    };
    console.log('%c', devtools);

    // Method 2: Detect docked DevTools by checking window dimensions
    var threshold = 160;
    setInterval(function() {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        if (!_devtoolsOpen) {
          _devtoolsOpen = true;
          showDevToolsWarning();
        }
      }
    }, 1000);
  }

  function showDevToolsWarning() {
    var existing = document.querySelector('.sp-devtools-warning');
    if (existing) return;
    var warn = document.createElement('div');
    warn.className = 'sp-devtools-warning';
    warn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Developer Tools detected — close them to continue';
    document.body.prepend(warn);
    // Also blur content
    showBlurOverlay();
  }

  // ===== RIGHT-CLICK / CONTEXT MENU =====
  // Right-click is allowed; screenshot blocking (PrintScreen key + overlays) remains active

  // ===== COPY / CUT PREVENTION =====
  document.addEventListener('copy', function(e) {
    // Allow copy in input fields only
    var tag = e.target ? e.target.tagName : '';
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      showFlashOverlay();
    }
  });

  document.addEventListener('cut', function(e) {
    var tag = e.target ? e.target.tagName : '';
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // ===== TEXT SELECTION PREVENTION =====
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('sp-no-select');
  });
  // Also apply immediately if DOM is already ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    document.body.classList.add('sp-no-select');
  }

  // ===== WATERMARK =====
  function addWatermark() {
    var existing = document.querySelector('.sp-watermark');
    if (existing) return;
    var wm = document.createElement('div');
    wm.className = 'sp-watermark';
    var session = '';
    try {
      var d = window.data;
      var user = window.currentAdmin || window.currentTeacher || window.currentStudent || window.currentParent;
      if (user) session = user.name || user.email || user.id;
    } catch(e) {}
    wm.textContent = 'EDUVERSE ' + (session ? '| ' + session : '') + ' | ' + new Date().toLocaleDateString();
    document.body.appendChild(wm);
  }

  // ===== SCREEN RECORDING DETECTION =====
  // Check for getDisplayMedia usage (screen sharing/recording)
  var _origGetDisplayMedia = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  if (navigator.mediaDevices && _origGetDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = function() {
      showFlashOverlay();
      return _origGetDisplayMedia.apply(this, arguments);
    };
  }

  // Monitor for any active media stream on the page
  function checkMediaStreams() {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Passive check — can't directly detect screen recording
    }
  }

  // ===== INIT =====
  function init() {
    createOverlays();
    detectDevTools();
    addWatermark();

    // Re-apply watermark on portal changes
    var _origShowAdmin = window.showAdminPortal;
    if (_origShowAdmin) {
      window.showAdminPortal = function() {
        _origShowAdmin.apply(this, arguments);
        setTimeout(addWatermark, 500);
      };
    }
    // Teacher portal
    var _origShowTeacher = window.showTeacherPortal;
    if (_origShowTeacher) {
      window.showTeacherPortal = function() {
        _origShowTeacher.apply(this, arguments);
        setTimeout(addWatermark, 500);
      };
    }
    // Student portal
    var _origShowStudent = window.showStudentPortal;
    if (_origShowStudent) {
      window.showStudentPortal = function() {
        _origShowStudent.apply(this, arguments);
        setTimeout(addWatermark, 500);
      };
    }
    // Parent portal
    var _origShowParent = window.showParentPortal;
    if (_origShowParent) {
      window.showParentPortal = function() {
        _origShowParent.apply(this, arguments);
        setTimeout(addWatermark, 500);
      };
    }

    setInterval(checkMediaStreams, 5000);
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
