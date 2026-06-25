// ===== Appwrite Migration Shim =====
// Patches existing localStorage-based functions to dual-write to Appwrite.
// Load AFTER multitenant.js, superadmin.js, and appwrite-service.js.
// ============================================================================

(function() {
  // Skip if Appwrite not configured
  if (!APPWRITE_DATABASE_ID) return;

  // --- Patch saveTenants ---
  if (typeof saveTenants === 'function') {
    var _origSaveTenants = saveTenants;
    saveTenants = function(tenants) {
      _origSaveTenants(tenants);
      if (typeof awSyncAllTenants === 'function') awSyncAllTenants(tenants);
    };
  }

  // --- Patch saveSuperAdmin ---
  if (typeof saveSuperAdmin === 'function') {
    var _origSaveSuperAdmin = saveSuperAdmin;
    saveSuperAdmin = function(admin) {
      _origSaveSuperAdmin(admin);
      if (typeof awSyncSuperAdmin === 'function') awSyncSuperAdmin(admin);
    };
  }

  // --- Patch savePlatformConfig ---
  if (typeof savePlatformConfig === 'function') {
    var _origSavePlatformConfig = savePlatformConfig;
    savePlatformConfig = function(cfg) {
      _origSavePlatformConfig(cfg);
      if (typeof awSyncPlatformConfig === 'function') awSyncPlatformConfig(cfg);
    };
  }

  // --- Patch saveData ---
  if (typeof saveData === 'function') {
    var _origSaveData = saveData;
    saveData = function() {
      _origSaveData();
      if (typeof awSaveSchoolData === 'function' && typeof data !== 'undefined' && data) {
        try {
          var tenantId = localStorage.getItem('activeTenant');
          if (tenantId) awSaveSchoolData(tenantId, data);
        } catch(e) {}
      }
    };
  }

  // --- Patch getTenants with Appwrite background sync ---
  if (typeof getTenants === 'function') {
    var _origGetTenants = getTenants;
    getTenants = function() {
      var result = _origGetTenants();
      if (AW_READ_REMOTE && typeof awFetchTenants === 'function') {
        setTimeout(function() {
          awFetchTenants().then(function(t) {
            if (t && typeof saveTenants === 'function') saveTenants(t);
          }).catch(function() {});
        }, 100);
      }
      return result;
    };
  }

  // --- Patch getSuperAdmin with Appwrite background sync ---
  if (typeof getSuperAdmin === 'function') {
    var _origGetSuperAdmin = getSuperAdmin;
    getSuperAdmin = function() {
      var result = _origGetSuperAdmin();
      if (AW_READ_REMOTE && typeof awFetchSuperAdmin === 'function') {
        setTimeout(function() {
          awFetchSuperAdmin().then(function(a) {
            if (a && typeof saveSuperAdmin === 'function') saveSuperAdmin(a);
          }).catch(function() {});
        }, 100);
      }
      return result;
    };
  }

  // --- Patch getPlatformConfig with Appwrite background sync ---
  if (typeof getPlatformConfig === 'function') {
    var _origGetPlatformConfig = getPlatformConfig;
    getPlatformConfig = function() {
      var result = _origGetPlatformConfig();
      if (AW_READ_REMOTE && typeof awFetchPlatformConfig === 'function') {
        setTimeout(function() {
          awFetchPlatformConfig().then(function(c) {
            if (c && typeof savePlatformConfig === 'function') savePlatformConfig(c);
          }).catch(function() {});
        }, 100);
      }
      return result;
    };
  }

  // --- Init Appwrite on DOMContentLoaded (gives async SDK time to load) ---
  if (typeof initAppwrite === 'function') {
    document.addEventListener('DOMContentLoaded', function() {
      var inited = initAppwrite();
      if (inited && typeof awBackgroundSync === 'function') {
        setTimeout(awBackgroundSync, 500);
      }
    });
  }
})();
