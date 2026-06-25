// ===== Appwrite Configuration =====
// Appwrite is OPTIONAL. The entire platform works 100% without it on any static host
// (Netlify, Namecheap, GoDaddy, Hostinger, etc.) using localStorage.
//
// To enable Appwrite, add these meta tags to your HTML <head>:
//   <meta name="eduverse:appwrite-endpoint" content="https://your-appwrite-server.com/v1">
//   <meta name="eduverse:appwrite-project" content="your-project-id">
//   <meta name="eduverse:appwrite-database" content="your-database-id">
//   <meta name="eduverse:appwrite-collection-schools" content="...">
//   <meta name="eduverse:appwrite-collection-data" content="...">
//   <meta name="eduverse:appwrite-collection-config" content="...">
//   <meta name="eduverse:appwrite-collection-log" content="...">
//   <meta name="eduverse:appwrite-collection-session" content="...">
//
// Or set window.EDUVERSE_APPWRITE_CONFIG before this script loads:
//   window.EDUVERSE_APPWRITE_CONFIG = { endpoint: '...', projectId: '...', ... };
//
// Appwrite Web SDK v14+
// https://cdn.jsdelivr.net/npm/appwrite@14.0.1/dist/umd/sdk.js
// ============================================================================

(function() {
  // Read config from meta tags or global
  function readMeta(name) {
    var el = document.querySelector('meta[name="eduverse:' + name + '"]');
    return el ? el.getAttribute('content') : '';
  }

  var cfg = window.EDUVERSE_APPWRITE_CONFIG || {};

  window.APPWRITE_ENDPOINT = cfg.endpoint || readMeta('appwrite-endpoint') || '';
  window.APPWRITE_PROJECT_ID = cfg.projectId || readMeta('appwrite-project') || '';
  window.APPWRITE_DATABASE_ID = cfg.databaseId || readMeta('appwrite-database') || '';

  window.APPWRITE_COLLECTIONS = {
    schools:     cfg.collectionSchools || readMeta('appwrite-collection-schools') || '',
    schoolData:  cfg.collectionData || readMeta('appwrite-collection-data') || '',
    platformCfg: cfg.collectionConfig || readMeta('appwrite-collection-config') || '',
    activityLog: cfg.collectionLog || readMeta('appwrite-collection-log') || '',
    saSession:   cfg.collectionSession || readMeta('appwrite-collection-session') || '',
  };
})();

// ------ Collection Schemas (for reference when creating in Appwrite console) ------
// These describe the attributes and indexes needed for each collection.
// After creating collections in your Appwrite console, set the IDs via meta tags above.
// ==========================================================================

window.APPWRITE_SCHEMAS = {
  schools: {
    attributes: [
      { key: 'slug',         type: 'string', size: 100,  required: true, array: false },
      { key: 'name',         type: 'string', size: 255,  required: true, array: false },
      { key: 'email',        type: 'string', size: 255,  required: false, array: false },
      { key: 'phone',        type: 'string', size: 50,   required: false, array: false },
      { key: 'address',      type: 'string', size: 500,  required: false, array: false },
      { key: 'logo',         type: 'string', size: 1000, required: false, array: false },
      { key: 'motto',        type: 'string', size: 255,  required: false, array: false },
      { key: 'tier',         type: 'string', size: 20,   required: true, array: false },
      { key: 'adminName',    type: 'string', size: 255,  required: true, array: false },
      { key: 'adminEmail',   type: 'string', size: 255,  required: true, array: false },
      { key: 'adminPass',    type: 'string', size: 255,  required: true, array: false },
      { key: 'status',       type: 'string', size: 20,   required: true, array: false, default: 'active' },
      { key: 'plan',         type: 'string', size: 20,   required: true, array: false, default: 'free' },
      { key: 'premiumOverride', type: 'boolean', required: false, array: false, default: false },
      { key: 'createdAt',    type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'slug_idx',  type: 'unique', attributes: ['slug'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
    ],
  },
  schoolData: {
    attributes: [
      { key: 'tenantId', type: 'string', size: 100, required: true, array: false },
      { key: 'category', type: 'string', size: 50,  required: true, array: false },
      { key: 'payload',  type: 'string', size: 1000000, required: true, array: false },
    ],
    indexes: [
      { key: 'tenant_cat_idx', type: 'key', attributes: ['tenantId', 'category'] },
    ],
  },
  platformCfg: {
    attributes: [
      { key: 'config', type: 'string', size: 1000000, required: true, array: false },
    ],
    indexes: [],
  },
  activityLog: {
    attributes: [
      { key: 'time', type: 'string', size: 100, required: true, array: false },
      { key: 'msg',  type: 'string', size: 1000, required: true, array: false },
    ],
    indexes: [],
  },
  saSession: {
    attributes: [
      { key: 'adminId',  type: 'string', size: 100, required: true, array: false },
      { key: 'expiresAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'admin_id_idx', type: 'key', attributes: ['adminId'] },
    ],
  },
};

// Initialize Appwrite client (called once at page load)
var _appwriteClient = null;
var _appwriteDatabases = null;
var _appwriteAccount = null;
var _appwriteFunctions = null;

function initAppwrite() {
  // Appwrite is disabled by default — skip if no endpoint configured
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) return false;
  if (typeof Appwrite === 'undefined') {
    console.warn('Appwrite SDK not loaded — falling back to localStorage');
    return false;
  }
  try {
    _appwriteClient = new Appwrite.Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    _appwriteDatabases = new Appwrite.Databases(_appwriteClient);
    _appwriteAccount = new Appwrite.Account(_appwriteClient);
    _appwriteFunctions = new Appwrite.Functions(_appwriteClient);
    return true;
  } catch(e) {
    console.warn('Appwrite init failed:', e);
    return false;
  }
}

function getAppwriteClient() { return _appwriteClient; }
function getAppwriteDatabases() { return _appwriteDatabases; }
function getAppwriteAccount() { return _appwriteAccount; }
function getAppwriteFunctions() { return _appwriteFunctions; }
