// EduVerse - Event Delegation System
// Centralizes click handling via data-action attributes
// Replaces inline onclick handlers for better maintainability

(function() {
  // Map of action names to their handler functions
  // Actions that take no args just call the function directly
  // Actions with args use data-args="arg1,arg2"

  // Close dropdowns when clicking outside them
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (t && t.closest && !t.closest('.nav-dropdown') && !t.closest('.ev-user-menu')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function(el) { el.classList.remove('open'); });
      document.querySelectorAll('.ev-dropdown.show').forEach(function(el) { el.classList.remove('show'); });
    }
  });

  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    if (!action) return;

    // Check if the handler function exists
    if (typeof window[action] !== 'function') {
      console.warn('Unknown action:', action);
      return;
    }

    // Parse data-args if present
    var argsStr = el.getAttribute('data-args');
    var args = [];
    if (argsStr) {
      // Simple CSV split — won't handle commas inside quotes, but sufficient for our use case
      args = argsStr.split(',').map(function(a) { return a.trim(); });
    }

    if (el.tagName === 'A') {
      var href = (el.getAttribute('href') || '').trim();
      if (href.indexOf('javascript:') === 0 || href.charAt(0) === '#') e.preventDefault();
    }
    e.stopPropagation();
    window[action].apply(el, args.length ? args : [el]);
  });
})();
