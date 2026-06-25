// ===== Subdomain Middleware =====
// Client-side subdomain resolution with optional Appwrite backend fallback.
// Works on ANY static host (Netlify, Namecheap, GoDaddy, Hostinger, etc.).
// Appwrite path only activates when APPWRITE_DATABASE_ID is configured.
//
// Flow:
//   1. Extract subdomain from hostname
//   2. Fast path: resolve from localStorage tenants (instant, always works)
//   3. Slow path: call Appwrite Function if Appwrite is configured
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

    var currentTenant = localStorage.getItem('activeTenant');

    // Fast path: check localStorage tenants
    var localTenants = typeof getTenants === 'function' ? getTenants() : [];
    var localMatch = localTenants.find(function(t) { return t.slug === sub; });
    if (localMatch) {
      if (localMatch.id !== currentTenant && typeof switchTenant === 'function') {
        switchTenant(localMatch.id);
      }
      return;
    }

    // Slow path: Appwrite Function (only if Appwrite is configured)
    if (!APPWRITE_DATABASE_ID || typeof awResolveSubdomain !== 'function') return;
    if (currentTenant) return; // Already have a tenant from app.js

    awResolveSubdomain(sub).then(function(result) {
      if (!result || !result.matched || !result.school) return;
      var school = result.school;
      var newTenant = { id: school.id || school.slug, slug: school.slug,
        name: school.name, email: school.email, phone: school.phone,
        address: school.address, logo: school.logo, motto: school.motto,
        tier: school.tier, adminName: school.adminName,
        adminEmail: school.adminEmail, adminPass: school.adminPass || '',
        status: school.status || 'active', plan: school.plan || 'free',
        premiumOverride: school.premiumOverride || false,
        createdAt: school.createdAt || new Date().toISOString() };

      var currentTenants = typeof getTenants === 'function' ? getTenants() : [];
      var exists = currentTenants.find(function(t) { return t.slug === school.slug; });
      if (!exists) {
        currentTenants.push(newTenant);
        if (typeof saveTenants === 'function') saveTenants(currentTenants);
      }
      if (typeof switchTenant === 'function') switchTenant(newTenant.id);
    }).catch(function() {});
  } catch(e) {}
}

// Auto-init on DOMContentLoaded (after app.js finishes)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initSubdomainMiddleware, 300);
});
