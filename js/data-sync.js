(function() {
  var CHANNEL = 'eduverse-data-sync';
  var channel = null;

  try { channel = new BroadcastChannel(CHANNEL); } catch(e) {}

  function _getActiveTenant() {
    try { return localStorage.getItem('activeTenant') || ''; } catch(e) { return ''; }
  }

  function _broadcast(type, payload) {
    if (!channel) return;
    try {
      channel.postMessage({
        type: type,
        payload: payload,
        tenant: _getActiveTenant(),
        ts: Date.now()
      });
    } catch(e) {}
  }

  function _isTenantMatch(msgTenant) {
    // Empty tenant means it's a global event (tenants list, platform config) — always process
    if (!msgTenant) return true;
    var current = _getActiveTenant();
    // No active tenant on this tab — skip tenant-scoped messages
    if (!current) return false;
    return msgTenant === current;
  }

  function _reloadData() {
    try {
      if (typeof loadData === 'function') {
        var fresh = loadData();
        if (fresh && typeof window.data !== 'undefined') {
          var keys = Object.keys(fresh);
          for (var i = 0; i < keys.length; i++) {
            window.data[keys[i]] = fresh[keys[i]];
          }
        }
      }
      if (typeof renderCurrentView === 'function') renderCurrentView();
    } catch(e) {}
  }

  function _reloadTenants() {
    try {
      if (typeof invalidateTenantCache === 'function') invalidateTenantCache();
      if (typeof getTenants === 'function') getTenants();
    } catch(e) {}
  }

  function _reloadPlatformConfig() {
    try {
      if (typeof getPlatformConfig === 'function') {
        var PLATFORM_CONFIG_KEY = 'eduverse_platform_config';
        var raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
        if (raw) {
          var cfg = JSON.parse(raw);
          if (typeof savePlatformConfig === 'function') savePlatformConfig(cfg);
        }
      }
    } catch(e) {}
  }

  // Listen for incoming broadcast messages from other tabs
  if (channel) {
    channel.onmessage = function(e) {
      if (!e.data) return;
      switch (e.data.type) {
        case 'data_changed':
          if (_isTenantMatch(e.data.tenant)) _reloadData();
          break;
        case 'tenants_changed':
          _reloadTenants();
          _reloadData();
          break;
        case 'config_changed':
          _reloadPlatformConfig();
          break;
        case 'session_changed':
          if (typeof syncSession === 'function') syncSession();
          break;
        case 'activity_logged':
          break;
      }
    };
  }

  // Storage event listener — catches changes from other tabs that BroadcastChannel misses
  window.addEventListener('storage', function(e) {
    if (!e.key) return;
    if (e.key.startsWith('schoolData_') || e.key === 'schoolData') {
      // Only reload if the storage change matches our active tenant
      var activeTenant = _getActiveTenant();
      var expectedKey = activeTenant ? 'schoolData_' + activeTenant : 'schoolData';
      if (e.key === expectedKey || e.key === 'schoolData') {
        _reloadData();
      }
    } else if (e.key === 'eduverse_tenants') {
      _reloadTenants();
      _reloadData();
    } else if (e.key === 'eduverse_platform_config') {
      _reloadPlatformConfig();
    }
  });

  // Refresh stale data when tab regains focus — only if same tenant
  var _lastTenantOnFocus = '';
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      var current = _getActiveTenant();
      // Only reload if tenant hasn't changed (user is still on same school)
      if (current === _lastTenantOnFocus) {
        _reloadData();
      }
      _lastTenantOnFocus = current;
    }
  });

  window.addEventListener('focus', function() {
    var current = _getActiveTenant();
    if (current === _lastTenantOnFocus) {
      _reloadData();
    }
    _lastTenantOnFocus = current;
  });

  // Track tenant on first load
  _lastTenantOnFocus = _getActiveTenant();

  // ===== Hook into data-write functions via hook system =====

  if (window.dataHooks) {
    window.dataHooks.addSaveHook(function() {
      _broadcast('data_changed');
    });
  }

  // Patch saveTenants
  var _origSaveTenants = window.saveTenants;
  if (typeof _origSaveTenants === 'function') {
    window.saveTenants = function(t) {
      _origSaveTenants(t);
      _broadcast('tenants_changed');
    };
  }

  // Patch savePlatformConfig
  var _origSavePlatformConfig = window.savePlatformConfig;
  if (typeof _origSavePlatformConfig === 'function') {
    window.savePlatformConfig = function(c) {
      _origSavePlatformConfig(c);
      _broadcast('config_changed');
    };
  }

  // Patch logActivity
  var _origLogActivity = window.logActivity;
  if (typeof _origLogActivity === 'function') {
    window.logActivity = function(msg) {
      _origLogActivity(msg);
      _broadcast('activity_logged', { msg: msg });
    };
  }

  // Expose manual sync trigger
  window.triggerCrossTabSync = function() {
    _broadcast('data_changed');
  };
})();
