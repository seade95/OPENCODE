// EDUVERSE - Flexible Screen Protection
// Configurable protection levels: off(0), mild(1), moderate(2), strict(3)

(function() {
  if (window.__screenProtectionActive) return;
  window.__screenProtectionActive = true;

  var _level = 0;
  var _overlay = null;
  var _flashOverlay = null;
  var _devtoolsOpen = false;
  var _devtoolsInterval = null;

  function getLevel() {
    try {
      var saved = localStorage.getItem('sp_protection_level');
      if (saved !== null) return parseInt(saved) || 0;
    } catch(e) {}
    return 1; // default mild
  }

  function saveLevel(l) {
    _level = l;
    try { localStorage.setItem('sp_protection_level', String(l)); } catch(e) {}
  }

  _level = getLevel();

  window.__setProtectionLevel = function(l) {
    l = Math.max(0, Math.min(3, Math.round(l)));
    saveLevel(l);
    if (l === 0 && _devtoolsInterval) { clearInterval(_devtoolsInterval); _devtoolsInterval = null; }
    if (_overlay) _overlay.style.display = 'none';
    if (_flashOverlay) _flashOverlay.style.display = 'none';
    var w = document.querySelector('.sp-watermark');
    if (w) w.style.display = l >= 1 ? '' : 'none';
    var dw = document.querySelector('.sp-devtools-warning');
    if (dw) dw.remove();
    var mb = document.querySelector('.sp-devtools-bypass');
    if (mb) mb.remove();
  };

  window.__getProtectionLevel = function() { return _level; };

  // ===== STYLES =====
  var style = document.createElement('style');
  style.textContent =
    '#spBlurOverlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999999;display:none;align-items:center;justify-content:center;flex-direction:column;backdrop-filter:blur(16px)}' +
    '#spBlurOverlay .sp-icon{font-size:56px;margin-bottom:16px}' +
    '#spBlurOverlay h2{color:#fff;font-size:22px;font-weight:700;margin-bottom:6px}' +
    '#spBlurOverlay p{color:#a0aec0;font-size:14px}' +
    '#spFlashOverlay{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:999998;display:none;align-items:center;justify-content:center;flex-direction:column;animation:spFadeIn 0.1s ease}' +
    '#spFlashOverlay .sp-icon{font-size:64px;margin-bottom:12px}' +
    '#spFlashOverlay h2{color:#fff;font-size:20px;font-weight:700;margin-bottom:4px}' +
    '#spFlashOverlay p{color:#fc8181;font-size:13px}' +
    '@keyframes spFadeIn{from{opacity:0}to{opacity:1}}' +
    '.sp-devtools-warning{position:fixed;top:0;left:0;right:0;background:#e53e3e;color:#fff;text-align:center;padding:10px 40px 10px 16px;font-size:13px;font-weight:600;z-index:999997;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}' +
    '.sp-devtools-warning .sp-dismiss{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.2);border:none;color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit}' +
    '.sp-devtools-warning .sp-dismiss:hover{background:rgba(255,255,255,0.3)}' +
    '.sp-watermark{position:fixed;bottom:3px;right:6px;font-size:9px;color:rgba(37,99,235,0.1);z-index:99999;pointer-events:none;font-family:monospace;letter-spacing:0.5px;white-space:nowrap}' +
    '.sp-no-select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}' +
    '.sp-no-select input,.sp-no-select textarea,.sp-no-select [contenteditable]{-webkit-user-select:auto;-moz-user-select:auto;-ms-user-select:auto;user-select:auto}';
  document.head.appendChild(style);

  // ===== CREATE OVERLAYS =====
  function createOverlays() {
    if (document.getElementById('spBlurOverlay')) return;
    var bo = document.createElement('div');
    bo.id = 'spBlurOverlay';
    bo.innerHTML = '<div class="sp-icon">🔒</div><h2>Session Protected</h2><p>Content hidden while you switch tabs</p>';
    document.body.appendChild(bo);
    _overlay = bo;

    var fo = document.createElement('div');
    fo.id = 'spFlashOverlay';
    fo.innerHTML = '<div class="sp-icon">📸</div><h2>Screenshot Attempt Detected</h2><p>Content is protected</p>';
    document.body.appendChild(fo);
    _flashOverlay = fo;
  }

  function showBlurOverlay() {
    if (_level >= 2 && _overlay) _overlay.style.display = 'flex';
  }

  function hideBlurOverlay() {
    if (_overlay) _overlay.style.display = 'none';
  }

  function showFlashOverlay() {
    if (_level >= 1 && _flashOverlay) {
      _flashOverlay.style.display = 'flex';
      setTimeout(function() { _flashOverlay.style.display = 'none'; }, 3000);
    }
  }

  // ===== VISIBILITY / FOCUS =====
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) showBlurOverlay(); else hideBlurOverlay();
  });
  window.addEventListener('blur', function() { showBlurOverlay(); });
  window.addEventListener('focus', function() { hideBlurOverlay(); });

  // ===== PRINTSCREEN =====
  document.addEventListener('keydown', function(e) {
    if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
      showFlashOverlay();
    }
  });

  // ===== DEVTOOLS DETECTION (level 3 only) =====
  function detectDevTools() {
    if (_level < 3) return;
    var devtools = /./;
    devtools.toString = function() {
      _devtoolsOpen = true;
      showDevToolsWarning();
      return '';
    };
    console.log('%c', devtools);

    var threshold = 160;
    _devtoolsInterval = setInterval(function() {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        if (!_devtoolsOpen) { _devtoolsOpen = true; showDevToolsWarning(); }
      }
    }, 2000);
  }

  function showDevToolsWarning() {
    if (_level < 3) return;
    if (document.querySelector('.sp-devtools-warning')) return;
    var warn = document.createElement('div');
    warn.className = 'sp-devtools-warning';
    warn.innerHTML = '🔒 Developer Tools detected — close them for security' +
      '<button class="sp-dismiss" onclick="this.parentElement.remove()">Dismiss</button>';
    document.body.prepend(warn);
  }

  // ===== COPY PROTECTION (level 3 only) =====
  document.addEventListener('copy', function(e) {
    if (_level >= 3) {
      var tag = e.target ? e.target.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target.isContentEditable) {
        e.preventDefault();
      }
    }
  });

  document.addEventListener('cut', function(e) {
    if (_level >= 3) {
      var tag = e.target ? e.target.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target.isContentEditable) e.preventDefault();
    }
  });

  // ===== TEXT SELECTION (level 2+) =====
  function applyNoSelect() {
    document.body.classList.toggle('sp-no-select', _level >= 2);
  }

  // ===== WATERMARK (level 1+) =====
  function addWatermark() {
    var existing = document.querySelector('.sp-watermark');
    if (existing) { existing.style.display = _level >= 1 ? '' : 'none'; return; }
    if (_level < 1) return;
    var wm = document.createElement('div');
    wm.className = 'sp-watermark';
    var session = '';
    try {
      var s = JSON.parse(localStorage.getItem('eduverse_session'));
      if (s && s.user) session = s.user.name || s.user.email || s.user.id;
    } catch(e) {}
    wm.textContent = 'EDUVERSE ' + (session ? '| ' + session + ' ' : '') + '| ' + new Date().toLocaleDateString();
    document.body.appendChild(wm);
  }

  // ===== INIT =====
  function init() {
    createOverlays();
    detectDevTools();
    addWatermark();
    applyNoSelect();

    // Re-watermark on portal switches
    ['showAdminPortal','showTeacherPortal','showStudentPortal','showParentPortal'].forEach(function(fn) {
      var orig = window[fn];
      if (orig) {
        window[fn] = function() {
          orig.apply(this, arguments);
          setTimeout(addWatermark, 500);
        };
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
