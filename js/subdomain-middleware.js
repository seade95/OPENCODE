// ===== Subdomain Middleware =====
// Client-side subdomain resolution. Works on ANY static host
// (Netlify, Namecheap, GoDaddy, Hostinger, etc.).
//
// Flow:
//   1. Extract subdomain from hostname
//   2. Resolve from localStorage tenants (instant, always works)
// ============================================================================

var _subdomainResolved = false;

function initSubdomainMiddleware() {
  if (_subdomainResolved) return;
  _subdomainResolved = true;

  try {
    var hostname = window.location.hostname.toLowerCase();
    var parts = hostname.split('.');
    if (parts.length < 3) return;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return;

    var sub = parts[0];
    if (!sub || (typeof RESERVED_SLUGS !== 'undefined' && RESERVED_SLUGS.indexOf(sub) !== -1)) return;
    if (hostname.indexOf('netlify.app') !== -1) return;
    if (hostname.indexOf('vercel.app') !== -1) return;
    if (hostname.indexOf('github.io') !== -1) return;
    if (hostname.indexOf('pages.dev') !== -1) return;

    var currentTenant = localStorage.getItem('activeTenant');

    // Check localStorage tenants
    var localTenants = typeof getTenants === 'function' ? getTenants() : [];
    var localMatch = localTenants.find(function(t) { return t.slug === sub; });
    if (localMatch) {
      if (localMatch.id !== currentTenant && typeof switchTenant === 'function') {
        switchTenant(localMatch.id);
      }
      return;
    }
  } catch(e) {}
}

// Auto-init on DOMContentLoaded (after app.js finishes)
document.addEventListener('DOMContentLoaded', initSubdomainMiddleware);
