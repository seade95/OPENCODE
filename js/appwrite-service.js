// ===== Appwrite Service Layer =====
// Pure service functions — NO existing function overrides.
// All functions prefixed with `aw` to avoid naming conflicts.
// Existing code continues to work; runtime patching happens in appwrite-migration.js.
//
// Appwrite is OPTIONAL. The entire platform works without it via localStorage.
// Appwrite operations only execute when APPWRITE_DATABASE_ID is configured.
// ============================================================================

var AW_DUAL_WRITE = true;
var AW_READ_REMOTE = false;

var _awTenantCache = null;
var _awSuperAdminCache = null;
var _awPlatformConfigCache = null;
var _awSchoolDataCache = null;

function _awDb() {
  var db = getAppwriteDatabases();
  if (!db || !APPWRITE_DATABASE_ID) return null;
  return db;
}

function _awColl(name) {
  var id = APPWRITE_COLLECTIONS[name];
  if (!id) return null;
  return id;
}

function _awParse(str) {
  try { return JSON.parse(str); } catch(e) { return null; }
}

// ============================================================================
// SCHOOLS (Tenant Registry)
// ============================================================================

function awFetchTenants() {
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return Promise.resolve(null);
  return db.listDocuments(APPWRITE_DATABASE_ID, coll, [], 100)
    .then(function(res) {
      var tenants = (res.documents || []).map(function(d) { return {
        id: d.slug, slug: d.slug, name: d.name || '', email: d.email || '',
        phone: d.phone || '', address: d.address || '', logo: d.logo || '',
        motto: d.motto || '', tier: d.tier || 'full_k12',
        adminName: d.adminName || '', adminEmail: d.adminEmail || '',
        adminPass: d.adminPass || '', status: d.status || 'active',
        plan: d.plan || 'free', premiumOverride: !!d.premiumOverride,
        createdAt: d.createdAt || '',
      };});
      _awTenantCache = tenants;
      return tenants;
    }).catch(function() { return null; });
}

function awUpsertTenant(tenant) {
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return;
  db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.equal('slug', tenant.slug)], 1)
    .then(function(res) {
      var payload = {
        slug: tenant.slug, name: tenant.name || '', email: tenant.email || '',
        phone: tenant.phone || '', address: tenant.address || '', logo: tenant.logo || '',
        motto: tenant.motto || '', tier: tenant.tier || 'full_k12',
        adminName: tenant.adminName || '', adminEmail: tenant.adminEmail || '',
        adminPass: tenant.adminPass || '', status: tenant.status || 'active',
        plan: tenant.plan || 'free', premiumOverride: !!tenant.premiumOverride,
      };
      if (res.documents && res.documents.length > 0) {
        db.updateDocument(APPWRITE_DATABASE_ID, coll, res.documents[0].$id, payload);
      } else {
        payload.createdAt = tenant.createdAt || new Date().toISOString();
        db.createDocument(APPWRITE_DATABASE_ID, coll, Appwrite.ID.unique(), payload);
      }
    }).catch(function() {});
}

function awDeleteTenant(slug) {
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return;
  db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.equal('slug', slug)], 1)
    .then(function(res) {
      if (res.documents && res.documents.length > 0) {
        db.deleteDocument(APPWRITE_DATABASE_ID, coll, res.documents[0].$id);
      }
    }).catch(function() {});
}

function awSyncAllTenants(tenants) {
  _awTenantCache = tenants;
  if (!AW_DUAL_WRITE) return;
  try { localStorage.setItem('eduverse_tenants', JSON.stringify(tenants)); } catch(e) {}
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return;
  tenants.forEach(function(t) { awUpsertTenant(t); });
}

// ============================================================================
// SUPER ADMIN
// ============================================================================

function awFetchSuperAdmin() {
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return Promise.resolve(null);
  return db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.equal('slug', '__superadmin__')], 1)
    .then(function(res) {
      if (!res.documents || res.documents.length === 0) return null;
      var d = res.documents[0];
      return { id: d.slug, name: d.adminName || d.name || '',
        email: d.adminEmail || d.email || '', password: d.adminPass || '',
        super_admin_level: 'super', createdAt: d.createdAt || '' };
    }).catch(function() { return null; });
}

function awUpsertSuperAdmin(admin) {
  var db = _awDb(), coll = _awColl('schools');
  if (!db || !coll) return;
  db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.equal('slug', '__superadmin__')], 1)
    .then(function(res) {
      var payload = { slug: '__superadmin__', name: admin.name || '',
        adminName: admin.name || '', adminEmail: admin.email || '',
        adminPass: admin.password || '', tier: 'super_admin',
        status: 'active', plan: 'super_admin',
        createdAt: admin.createdAt || new Date().toISOString() };
      if (res.documents && res.documents.length > 0) {
        db.updateDocument(APPWRITE_DATABASE_ID, coll, res.documents[0].$id, payload);
      } else {
        db.createDocument(APPWRITE_DATABASE_ID, coll, Appwrite.ID.unique(), payload);
      }
    }).catch(function() {});
}

function awSyncSuperAdmin(admin) {
  _awSuperAdminCache = admin;
  if (!AW_DUAL_WRITE) return;
  try { localStorage.setItem('eduverse_super_admin', JSON.stringify(admin)); } catch(e) {}
  awUpsertSuperAdmin(admin);
}

// ============================================================================
// PLATFORM CONFIG
// ============================================================================

function awFetchPlatformConfig() {
  var db = _awDb(), coll = _awColl('platformCfg');
  if (!db || !coll) return Promise.resolve(null);
  return db.listDocuments(APPWRITE_DATABASE_ID, coll)
    .then(function(res) {
      if (!res.documents || res.documents.length === 0) return null;
      return _awParse(res.documents[0].config);
    }).catch(function() { return null; });
}

function awUpsertPlatformConfig(cfg) {
  var db = _awDb(), coll = _awColl('platformCfg');
  if (!db || !coll) return;
  db.listDocuments(APPWRITE_DATABASE_ID, coll)
    .then(function(res) {
      var payload = { config: JSON.stringify(cfg) };
      if (res.documents && res.documents.length > 0) {
        db.updateDocument(APPWRITE_DATABASE_ID, coll, res.documents[0].$id, payload);
      } else {
        db.createDocument(APPWRITE_DATABASE_ID, coll, Appwrite.ID.unique(), payload);
      }
    }).catch(function() {});
}

function awSyncPlatformConfig(cfg) {
  _awPlatformConfigCache = cfg;
  if (!AW_DUAL_WRITE) return;
  try { localStorage.setItem('eduverse_platform_config', JSON.stringify(cfg)); } catch(e) {}
  awUpsertPlatformConfig(cfg);
}

// ============================================================================
// SCHOOL DATA (per-tenant, split by category)
// ============================================================================

function awSaveSchoolData(tenantId, fullData) {
  var db = _awDb(), coll = _awColl('schoolData');
  if (!db || !coll) return;

  var categories = {
    config: ['schoolName','schoolLogo','schoolMotto','schoolTier','currentTerm','currentLanguage',
      'websiteConfig','schoolProfile','feeConfig','paymentGateway','subscription',
      'subscriptionPlans','timetableSettings','translations','academicCalendar'],
    people: ['students','teachers','parents','admins','staffHR','alumni'],
    academics: ['results','cat','exams','gradebook','gradebookGrid','assignments','submissions',
      'teacherExams','examQuestions','examAttempts','simQuestions','simAttempts'],
    finance: ['fees','paymentTransactions','payrollRecords','storeProducts','storeOrders',
      'hostelPayments','donations'],
    operations: ['attendance','timetables','activities','activityLog','leaveRequests','library',
      'borrowings','waitlists','lessonNotes','behaviorLog','forumPosts','fileRepo',
      'notifications','broadcasts','mealPlans','dietaryRestrictions','examRegistrations',
      'chatRooms','chatMessages','virtualClasses','gallery','rooms','teacherSubjects',
      'classTeachers','notifLog','hostels','hostelRooms','hostelAllocations',
      'maintenanceReqs','healthRecords','transportRoutes','conferences','customReports',
      'activityScores','reunions','idCards','admissionPrograms','applications',
      'customInstitutions','academicTerms'],
  };

  Object.keys(categories).forEach(function(cat) {
    var data = {};
    categories[cat].forEach(function(k) { if (k in fullData) data[k] = fullData[k]; });
    var payload = JSON.stringify(data);

    db.listDocuments(APPWRITE_DATABASE_ID, coll, [
      Appwrite.Query.equal('tenantId', tenantId),
      Appwrite.Query.equal('category', cat),
    ], 1).then(function(res) {
      if (res.documents && res.documents.length > 0) {
        db.updateDocument(APPWRITE_DATABASE_ID, coll, res.documents[0].$id, { payload: payload });
      } else {
        db.createDocument(APPWRITE_DATABASE_ID, coll, Appwrite.ID.unique(), {
          tenantId: tenantId, category: cat, payload: payload,
        });
      }
    }).catch(function() {});
  });
}

function awLoadSchoolData(tenantId) {
  var db = _awDb(), coll = _awColl('schoolData');
  if (!db || !coll) return Promise.resolve(null);
  return db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.equal('tenantId', tenantId)], 100)
    .then(function(res) {
      if (!res.documents || res.documents.length === 0) return null;
      var merged = {};
      res.documents.forEach(function(doc) {
        var chunk = _awParse(doc.payload);
        if (chunk) Object.keys(chunk).forEach(function(k) { merged[k] = chunk[k]; });
      });
      return merged;
    }).catch(function() { return null; });
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

function awLogActivity(msg) {
  var db = _awDb(), coll = _awColl('activityLog');
  if (!db || !coll) return;
  db.createDocument(APPWRITE_DATABASE_ID, coll, Appwrite.ID.unique(), {
    time: new Date().toLocaleString(), msg: msg,
  }).catch(function() {});
}

function awFetchActivityLog() {
  var db = _awDb(), coll = _awColl('activityLog');
  if (!db || !coll) return Promise.resolve([]);
  return db.listDocuments(APPWRITE_DATABASE_ID, coll, [Appwrite.Query.orderDesc('time')], 100)
    .then(function(res) {
      return (res.documents || []).map(function(d) { return { time: d.time, msg: d.msg }; });
    }).catch(function() { return []; });
}

// ============================================================================
// AUTH (Appwrite Account)
// ============================================================================

function awSignup(name, email, password) {
  var acct = getAppwriteAccount();
  if (!acct) return Promise.reject('Appwrite not initialized');
  return acct.create(Appwrite.ID.unique(), email, password, name)
    .then(function() { return acct.createEmailPasswordSession(email, password); });
}

function awLogin(email, password) {
  var acct = getAppwriteAccount();
  if (!acct) return Promise.reject('Appwrite not initialized');
  return acct.createEmailPasswordSession(email, password);
}

function awLogout() {
  var acct = getAppwriteAccount();
  if (!acct) return Promise.resolve();
  return acct.deleteSession('current').catch(function() {});
}

function awGetUser() {
  var acct = getAppwriteAccount();
  if (!acct) return Promise.resolve(null);
  return acct.get().then(function(u) {
    return { id: u.$id, name: u.name, email: u.email };
  }).catch(function() { return null; });
}

function awGetSession() {
  var acct = getAppwriteAccount();
  if (!acct) return Promise.resolve(null);
  return acct.getSession('current').then(function(s) {
    return { provider: s.provider, expire: s.expire, userId: s.userId, current: true };
  }).catch(function() { return null; });
}

// ============================================================================
// SUBDOMAIN RESOLUTION (via Appwrite Function)
// ============================================================================

function awResolveSubdomain(subdomain) {
  var fn = getAppwriteFunctions();
  if (!fn) return Promise.resolve(null);
  return fn.createExecution('resolve-subdomain', JSON.stringify({ subdomain: subdomain }), false)
    .then(function(exec) {
      if (exec.status === 'completed' && exec.response) return _awParse(exec.response);
      return null;
    }).catch(function() { return null; });
}

// ============================================================================
// HEALTH
// ============================================================================

function awHealth() {
  var db = _awDb();
  if (!db) return Promise.resolve(false);
  return db.listDocuments(APPWRITE_DATABASE_ID, _awColl('schools'))
    .then(function() { return true; }).catch(function() { return false; });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

function awBackgroundSync() {
  if (!AW_READ_REMOTE) return;
  awFetchTenants().then(function(t) { if (t) _awTenantCache = t; }).catch(function() {});
  awFetchSuperAdmin().then(function(a) { if (a) _awSuperAdminCache = a; }).catch(function() {});
  awFetchPlatformConfig().then(function(c) { if (c) _awPlatformConfigCache = c; }).catch(function() {});
  try {
    var activeTenant = localStorage.getItem('activeTenant');
    if (activeTenant) {
      awLoadSchoolData(activeTenant).then(function(remote) {
        if (!remote || typeof data === 'undefined' || !data) return;
        Object.keys(remote).forEach(function(k) {
          if (Array.isArray(remote[k])) {
            if (!data[k] || remote[k].length > data[k].length) data[k] = remote[k];
          } else if (typeof remote[k] === 'object' && remote[k] !== null && !Array.isArray(remote[k])) {
            data[k] = Object.assign({}, data[k] || {}, remote[k]);
          } else {
            if (!data[k] || data[k] === '') data[k] = remote[k];
          }
        });
      }).catch(function() {});
    }
  } catch(e) {}
}
