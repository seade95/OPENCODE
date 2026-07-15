// EduVerse Multi-Tenant School Onboarding System
// Manages tenant registry, school onboarding, and data isolation

const TENANT_KEY = 'eduverse_tenants';
const SUPER_ADMIN_KEY = 'eduverse_super_admin';

// ===== Subdomain / Slug System =====
var RESERVED_SLUGS = ['www', 'app', 'api', 'admin', 'mail', 'smtp', 'pop3', 'webmail', 'cpanel', 'whm', 'ftp', 'ssh', 'mysql', 'test', 'dev', 'staging', 'demo', 'beta', 'help', 'support', 'docs', 'wiki', 'blog', 'forum', 'community', 'status', 'cdn', 'static', 'assets', 'media', 'files', 'img', 'css', 'js', 'download', 'uploads', 'store', 'shop', 'billing', 'pay', 'secure', 'login', 'signup', 'register', 'auth', 'oauth', 'saml', 'ldap', 'portal', 'dashboard', 'manage', 'system', 'server', 'host', 'hosting', 'cloud', 'edu', 'education', 'school', 'schools', 'my', 'your', 'the', 'eduverse'];

function normalizeSlug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^[^a-z]+/, '')
    .replace(/^-+/, '');
}

function generateSlug(name, excludeId) {
  var base = normalizeSlug(name);
  if (!base) base = 'school';
  var slug = base;
  var counter = 1;
  while (isSlugTaken(slug, excludeId)) {
    slug = base + '-' + counter;
    counter++;
    if (counter > 9999) break;
  }
  return slug;
}

function isSlugTaken(slug, excludeId) {
  if (RESERVED_SLUGS.indexOf(slug) !== -1) return true;
  var tenants = getTenants();
  for (var i = 0; i < tenants.length; i++) {
    if (tenants[i].slug === slug && tenants[i].id !== excludeId) return true;
  }
  return false;
}

function resolveSchoolFromSubdomain() {
  try {
    var hostname = window.location.hostname.toLowerCase();
    // Must be a subdomain (e.g. myschool.yourdomain.com = 3+ parts)
    var parts = hostname.split('.');
    if (parts.length < 3) return null;
    // localhost / 127.0.0.1 / IP — skip subdomain resolution
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null;

    var sub = parts[0];
    if (!sub || RESERVED_SLUGS.indexOf(sub) !== -1) return null;

    // Also skip if subdomain matches the platform's own name (e.g. eduverse.yourdomain.com)
    try {
      var cfg = JSON.parse(localStorage.getItem('eduverse_platform_config') || '{}');
      if (cfg.platformName && sub === cfg.platformName.toLowerCase()) return null;
    } catch(e) {}

    var tenants = getTenants();
    var tenant = tenants.find(function(t) { return t.slug === sub; });
    if (tenant) return tenant.id;
  } catch(e) {}
  return null;
}

var _tenantCache = null;

function invalidateTenantCache() { _tenantCache = null; }

function getTenants() {
  if (_tenantCache) return _tenantCache;
  try {
    var t = JSON.parse(localStorage.getItem(TENANT_KEY)) || [];
    var changed = false;
    for (var i = 0; i < t.length; i++) {
      // One-time migration: clean old OMOLOLA branding from tenant names
      if (t[i].name && t[i].name.includes('OMOLOLA')) {
        t[i].name = t[i].name.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE');
        changed = true;
      }
      // One-time migration: auto-generate slug for existing tenants
      if (!t[i].slug) {
        t[i].slug = normalizeSlug(t[i].name);
        if (!t[i].slug) t[i].slug = 'school-' + t[i].id.substring(0, 6).toLowerCase();
        changed = true;
      }
    }
    // Ensure slug uniqueness after migration (handles duplicates)
    if (changed) {
      var slugs = {};
      for (var j = 0; j < t.length; j++) {
        var base = t[j].slug;
        var slug = base;
        var c = 1;
        while (slugs[slug] || RESERVED_SLUGS.indexOf(slug) !== -1) {
          slug = base + '-' + c;
          c++;
        }
        t[j].slug = slug;
        slugs[slug] = true;
      }
      saveTenants(t);
    }
    _tenantCache = t;
    return t;
  } catch(e) { return []; }
}

function saveTenants(tenants) {
  _tenantCache = tenants;
  localStorage.setItem(TENANT_KEY, JSON.stringify(tenants));
}

var _superAdminCache = null;

function getSuperAdmin() {
  if (_superAdminCache) return _superAdminCache;
  try { _superAdminCache = JSON.parse(localStorage.getItem(SUPER_ADMIN_KEY)) || null; return _superAdminCache; } catch(e) { return null; }
}

function saveSuperAdmin(admin) {
  _superAdminCache = admin;
  localStorage.setItem(SUPER_ADMIN_KEY, JSON.stringify(admin));
}

function genTenantId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  return 'TNT' + ts + rand;
}

// Get the current tenant's data key
function getTenantDataKey(tenantId) {
  return 'schoolData_' + tenantId;
}

// Switch the global data to a specific tenant's store
function switchTenant(tenantId) {
  if (tenantId) {
    // Store current data before switching
    try {
      if (typeof __saveCurrentData === 'function') __saveCurrentData();
      else if (typeof saveData === 'function') saveData();
    } catch(e) {}

    // Set new active tenant
    localStorage.setItem('activeTenant', tenantId);
    localStorage.setItem('activeTenantKey', getTenantDataKey(tenantId));
    window.location.reload();
  }
}

// Create a new school tenant
function createTenant(schoolData) {
  var slug = schoolData.slug || generateSlug(schoolData.name);
  const tenant = {
    id: genTenantId(),
    slug: slug,
    name: schoolData.name,
    email: schoolData.email,
    phone: schoolData.phone || '',
    address: schoolData.address || '',
    logo: schoolData.logo || '',
    motto: schoolData.motto || 'Education for Enlightenment',
    tier: schoolData.tier || 'full_k12',
    adminName: schoolData.adminName,
    adminEmail: schoolData.adminEmail,
    adminPass: schoolData.adminPass,
    createdAt: new Date().toISOString(),
    status: schoolData.status || 'active',
    plan: schoolData.plan || 'basic',
  };

  const tenants = getTenants();
  tenants.push(tenant);
  saveTenants(tenants);

  // Initialize tenant data
  const defaults = getDefaultData();
  defaults.schoolTier = tenant.tier;
  defaults.currentTerm = 'Term 1 ' + new Date().getFullYear();
  // Add the first admin
  defaults.admins = [{
    id: 'ADM001',
    name: tenant.adminName,
    email: tenant.adminEmail,
    password: tenant.adminPass,
    role: 'super_admin',
    forcePasswordChange: schoolData.forcePasswordChange || false,
  }];
  // Set school branding
  defaults.schoolName = tenant.name;
  defaults.schoolLogo = tenant.logo;
  defaults.schoolMotto = tenant.motto;

  localStorage.setItem(getTenantDataKey(tenant.id), JSON.stringify(defaults));
  return tenant;
}

// Verify super admin login
function verifySuperAdmin(email, password) {
  const admin = getSuperAdmin();
  return admin && admin.email === email && admin.password === password ? admin : null;
}

// Create super admin account
function createSuperAdmin(name, email, password) {
  if (getSuperAdmin()) return null;
  saveSuperAdmin({ id: 'SUP001', name, email, password, super_admin_level: 'super', createdAt: new Date().toISOString() });
  return getSuperAdmin();
}

// Get school data for a specific tenant
function getTenantSchoolData(tenantId) {
  try {
    const raw = localStorage.getItem(getTenantDataKey(tenantId));
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ===== School Applications System =====
var APP_KEY = 'eduverse_school_applications';

function getApplications() {
  try { return JSON.parse(localStorage.getItem(APP_KEY)) || []; } catch(e) { return []; }
}

function saveApplications(apps) {
  localStorage.setItem(APP_KEY, JSON.stringify(apps));
}

function genAppId() {
  return 'APP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function genPassword() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  var pass = '';
  for (var i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

function showApplySchool() {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<h3><i class="fas fa-school"></i> Apply to Join EduVerse</h3>'
    + '<p style="color:var(--text-light);font-size:13px;margin-bottom:16px;">Fill in your school details below. Your application will be reviewed by our team.</p>'
    + '<div id="applyError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;font-size:14px;"></div>'
    + '<div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
    + '<div class="form-group" style="grid-column:1/-1;"><label>School Name *</label><input type="text" id="appSchoolName" placeholder="e.g. Gracefield International School"></div>'
    + '<div class="form-group"><label>Contact Person Name *</label><input type="text" id="appContactName" placeholder="Full name"></div>'
    + '<div class="form-group"><label>Contact Email *</label><input type="email" id="appEmail" placeholder="admin@school.edu"></div>'
    + '<div class="form-group"><label>Phone Number *</label><input type="tel" id="appPhone" placeholder="+234 801 234 5678"></div>'
    + '<div class="form-group" style="grid-column:1/-1;"><label>Address</label><input type="text" id="appAddress" placeholder="School address"></div>'
    + '<div class="form-group"><label>City *</label><input type="text" id="appCity" placeholder="e.g. Lagos"></div>'
    + '<div class="form-group"><label>Country *</label><input type="text" id="appCountry" value="Nigeria"></div>'
    + '<div class="form-group"><label>School Size</label><select id="appSize" style="width:100%;"><option value="small">Small (1-200 students)</option><option value="medium">Medium (201-500 students)</option><option value="large">Large (501+ students)</option></select></div>'
    + '<div class="form-group"><label>Curriculum Type</label><select id="appCurriculum" style="width:100%;"><option value="nigerian">Nigerian (WAEC/NECO)</option><option value="british">British (IGCSE/A-Levels)</option><option value="american">American</option><option value="montessori">Montessori</option><option value="islamic">Islamic</option><option value="other">Other</option></select></div>'
    + '</div>'
    + '<div class="modal-actions" style="margin-top:20px;"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-success" onclick="applyForSchool()"><i class="fas fa-paper-plane"></i> Submit Application</button></div>';
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }
}

function applyForSchool() {
  var name = document.getElementById('appSchoolName')?.value?.trim();
  var contact = document.getElementById('appContactName')?.value?.trim();
  var email = document.getElementById('appEmail')?.value?.trim();
  var phone = document.getElementById('appPhone')?.value?.trim();
  var address = document.getElementById('appAddress')?.value?.trim();
  var city = document.getElementById('appCity')?.value?.trim();
  var country = document.getElementById('appCountry')?.value?.trim();
  var size = document.getElementById('appSize')?.value || 'small';
  var curriculum = document.getElementById('appCurriculum')?.value || 'nigerian';
  var err = document.getElementById('applyError');

  if (!name || !contact || !email || !phone || !city || !country) {
    showError(err, 'Please fill all required fields'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(err, 'Invalid email address'); return;
  }
  hideError(err);

  var apps = getApplications();
  if (apps.some(function(a) { return a.email.toLowerCase() === email.toLowerCase() && a.status === 'pending'; })) {
    showError(err, 'An application with this email is already pending review.'); return;
  }

  var app = {
    id: genAppId(),
    schoolName: name,
    contactName: contact,
    email: email,
    phone: phone,
    address: address,
    city: city,
    country: country,
    schoolSize: size,
    curriculumType: curriculum,
    status: 'pending',
    appliedAt: new Date().toISOString(),
    approvedAt: null,
    rejectionReason: null,
  };
  apps.push(app);
  saveApplications(apps);
  toast('Application submitted successfully! We\'ll review and get back to you.', 'success');
  closeModal();
}

// ===== DEMO TENANT =====
const DEMO_TENANT_ID = 'TNT_DEMO';

function initDemoTenant() {
  var tenants = getTenants();
  var existing = tenants.find(function(t) { return t.id === DEMO_TENANT_ID; });
  if (existing) return existing;

  var tenant = createTenant({
    name: 'Demo International School',
    slug: 'demo-international',
    email: 'demo@demo.com',
    phone: '+2347069332955',
    motto: 'Excellence in Education — Try It Free!',
    address: '42 Education Avenue, Lagos, Nigeria',
    tier: 'full_k12',
    plan: 'premium',
    adminName: 'Admin Demo',
    adminEmail: 'admin@demo.com',
    adminPass: 'demo123',
  });

  var schoolData = getTenantSchoolData(tenant.id);
  if (schoolData) {
    schoolData.schoolProfile.schoolName = 'Demo International School';
    schoolData.schoolName = 'Demo International School';
    schoolData.schoolMotto = 'Excellence in Education — Try It Free!';
    localStorage.setItem(getTenantDataKey(tenant.id), JSON.stringify(schoolData));
  }

  // Seed EduVerse global social data with demo user
  if (typeof getSocialData === 'function' && typeof saveSocialData === 'function') {
    var social = getSocialData();
    var demoEv = social.users.find(function(u) { return u.email === 'demo@eduverse.com'; });
    if (!demoEv) {
      social.users.push({
        id: 'USR_DEMO', name: 'Demo User', email: 'demo@eduverse.com',
        password: 'demo123', role: 'user', avatar: '', bio: 'Demo account for evaluation',
        createdAt: new Date().toISOString()
      });
      social.memberships.push({
        id: 'MEM_DEMO', userId: 'USR_DEMO', schoolId: DEMO_TENANT_ID,
        role: 'admin', refId: ''
      });
      social.feed.unshift({
        id: 'FED_DEMO', schoolId: DEMO_TENANT_ID, type: 'school_created',
        message: 'Demo International School was created — explore all features!',
        userId: 'USR_DEMO', userName: 'Demo User',
        createdAt: new Date().toISOString()
      });
      saveSocialData(social);
    }
  }

  return tenant;
}

function launchDemo() {
  initDemoTenant();
  localStorage.setItem('demoMode', 'true');
  switchTenant(DEMO_TENANT_ID);
}

function exitDemoMode() {
  localStorage.removeItem('demoMode');
  localStorage.removeItem('activeTenant');
  localStorage.removeItem('activeTenantKey');
  if (typeof eduverseLogout === 'function') eduverseLogout();
  window.location.href = 'index.html';
}

// ===== RENDER FUNCTIONS =====

function showSuperAdminLogin() {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = `
    <h3><i class="fas fa-user-shield"></i> Super Admin Login</h3>
    <div id="superAdminLoginError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin:8px 0;font-size:14px;"></div>
    <div class="form-group"><label>Email</label><input type="email" id="supAdminEmail" placeholder="super@eduverse.com" oninput="validateField(this,'email')"></div>
    <div class="form-group"><label>Password</label><input type="password" id="supAdminPass" placeholder="Enter password" oninput="validateField(this,'password')"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="superAdminLogin()"><i class="fas fa-arrow-right"></i> Sign In</button>
    </div>
    <p style="text-align:center;margin-top:16px;font-size:13px;color:var(--text-light);">No super admin account?
      <a href="javascript:;" onclick="closeModal();showSuperAdminSignup()" style="color:var(--primary);font-weight:600;">Create One</a></p>
  `;
  if (overlay) overlay.classList.add('active');
}

function showSuperAdminSignup() {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;
  if (getSuperAdmin()) {
    toast('A super admin already exists. Please login.', 'error');
    showSuperAdminLogin();
    return;
  }
  body.innerHTML = `
    <h3><i class="fas fa-user-shield"></i> Create Super Admin</h3>
    <div id="superAdminSignupError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin:8px 0;font-size:14px;"></div>
    <div class="form-group"><label>Full Name</label><input type="text" id="supAdminName" placeholder="Super admin name" oninput="validateField(this,'name')"></div>
    <div class="form-group"><label>Email</label><input type="email" id="supAdminEmail" placeholder="super@eduverse.com" oninput="validateField(this,'email')"></div>
    <div class="form-group"><label>Password (min 6 chars)</label><input type="password" id="supAdminPass" placeholder="Min 6 characters" oninput="validateField(this,'password')"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-success" onclick="createSuperAdminAccount()"><i class="fas fa-user-plus"></i> Create Account</button>
    </div>
  `;
  if (overlay) overlay.classList.add('active');
}

function superAdminLogin() {
  const email = document.getElementById('supAdminEmail')?.value?.trim();
  const pass = document.getElementById('supAdminPass')?.value?.trim();
  const err = document.getElementById('superAdminLoginError');
  if (!email || !pass) { showError(err, 'Please fill all fields'); return; }
  if (!isValidEmail(email)) { showError(err, 'Invalid email format'); return; }
  if (!isValidPassword(pass)) { showError(err, 'Password must be at least 6 characters'); return; }
  const admin = verifySuperAdmin(email, pass);
  if (!admin) { showError(err, 'Invalid email or password'); return; }
  hideError(err);
  closeModal();
  showSuperAdminDashboard();
}

function createSuperAdminAccount() {
  const name = document.getElementById('supAdminName')?.value?.trim();
  const email = document.getElementById('supAdminEmail')?.value?.trim();
  const pass = document.getElementById('supAdminPass')?.value?.trim();
  const err = document.getElementById('superAdminSignupError');
  if (!name || !email || !pass) { showError(err, 'Please fill all fields'); return; }
  if (!isValidEmail(email)) { showError(err, 'Invalid email format'); return; }
  if (!isValidPassword(pass)) { showError(err, 'Password must be at least 6 characters'); return; }
  const result = createSuperAdmin(name, email, pass);
  if (!result) { showError(err, 'A super admin already exists'); return; }
  hideError(err);
  toast('Super admin account created!');
  closeModal();
  showSuperAdminDashboard();
}

function showSuperAdminDashboard() {
  const admin = getSuperAdmin();
  if (!admin) { showSuperAdminLogin(); return; }

  const tenants = getTenants();
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;

  body.innerHTML = `
    <div class="super-admin-dashboard">
      <div class="sa-header">
        <h2><i class="fas fa-user-shield"></i> Super Admin Dashboard</h2>
        <p style="color:var(--text-light);font-size:14px;">Welcome, ${htmlEscape(admin.name)}</p>
        <button class="btn btn-sm btn-outline" onclick="closeModal()" style="margin-top:8px;"><i class="fas fa-sign-out-alt"></i> Close</button>
      </div>

      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;">
        <div class="stat-card"><div class="stat-value">${tenants.length}</div><div class="stat-label">Schools</div></div>
        <div class="stat-card"><div class="stat-value">${tenants.filter(t => t.status === 'active').length}</div><div class="stat-label">Active</div></div>
        <div class="stat-card"><div class="stat-value">${tenants.filter(t => t.status === 'suspended').length}</div><div class="stat-label">Suspended</div></div>
      </div>

      <div class="sa-section" style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:18px;"><i class="fas fa-school"></i> Registered Schools</h3>
          <button class="btn btn-primary btn-sm" onclick="closeModal();showOnboardSchool()"><i class="fas fa-plus"></i> Add School</button>
        </div>
        ${tenants.length ? `
        <div style="overflow-x:auto;">
          <table class="table" style="width:100%;font-size:14px;">
            <thead><tr>
              <th>School</th><th>Slug</th><th>Email</th><th>Tier</th><th>Plan</th><th>Created</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              ${tenants.map(t => `
                <tr>
                  <td><strong>${htmlEscape(t.name)}</strong></td>
                  <td><code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${htmlEscape(t.slug || '—')}</code></td>
                  <td>${htmlEscape(t.email)}</td>
                  <td><span class="badge">${t.tier}</span></td>
                  <td><span class="badge" style="background:#bee3f8;color:#2a4365;">${t.plan}</span></td>
                  <td style="font-size:12px;">${new Date(t.createdAt).toLocaleDateString()}</td>
                  <td><span class="badge ${t.status === 'active' ? 'badge-paid' : 'badge-absent'}">${t.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="switchTenant('${t.id}')" title="Open this school"><i class="fas fa-external-link-alt"></i></button>
                    <button class="btn btn-sm btn-outline" onclick="toggleTenantStatus('${t.id}')" title="Toggle status"><i class="fas ${t.status === 'active' ? 'fa-pause' : 'fa-play'}"></i></button>
                    <button class="btn btn-sm btn-outline" style="color:#e53e3e;" onclick="confirmDeleteTenant('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>` : '<div class="empty-state"><i class="fas fa-school"></i><p>No schools registered yet. Click "Add School" to get started.</p></div>'}
      </div>
    </div>
  `;
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }
}

function showOnboardSchool() {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;

  // Pre-fill mode: if editing existing tenant
  body.innerHTML = `
    <h3><i class="fas fa-school"></i> Onboard New School</h3>
    <p style="color:var(--text-light);font-size:13px;margin-bottom:16px;">Fill in the details below to create a new school tenant.</p>
    <div id="onboardError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;"></div>

    <div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group" style="grid-column:1/-1;"><label>School Name *</label><input type="text" id="onbSchoolName" placeholder="e.g. EDUVERSE" oninput="onbUpdateSlug()"></div>
      <div class="form-group"><label>URL Slug *</label>
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="text" id="onbSchoolSlug" placeholder="my-school" oninput="validateField(this,'name')" style="font-family:monospace;font-size:13px;">
          <button type="button" class="btn btn-sm btn-outline" onclick="onbRegenerateSlug()" title="Regenerate from name"><i class="fas fa-sync-alt"></i></button>
        </div>
        <p style="font-size:11px;color:var(--text-light);margin:4px 0 0;">Your school will be accessible at <strong id="onbSlugPreview">/school/your-slug</strong></p>
      </div>
      <div class="form-group"><label>School Email *</label><input type="email" id="onbSchoolEmail" placeholder="admin@school.edu" oninput="validateField(this,'email')"></div>
      <div class="form-group"><label>Phone</label><input type="text" id="onbSchoolPhone" placeholder="+2347069332955"></div>
      <div class="form-group"><label>Motto</label><input type="text" id="onbSchoolMotto" value="Education for Enlightenment"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Address</label><input type="text" id="onbSchoolAddress" placeholder="School address"></div>
      <div class="form-group"><label>Logo URL</label><input type="text" id="onbSchoolLogo" placeholder="https://example.com/logo.png"></div>
      <div class="form-group">
        <label>School Tier *</label>
        <select id="onbSchoolTier" style="width:100%;">
          <option value="full_k12">Full K-12 (Creche - SSS 3)</option>
          <option value="eccde">Nursery Only</option>
          <option value="primary">Primary Only</option>
          <option value="secondary">Secondary Only</option>
        </select>
      </div>
      <div class="form-group">
        <label>Plan *</label>
        <select id="onbSchoolPlan" style="width:100%;">
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
    </div>

    <h4 style="margin-top:20px;margin-bottom:12px;font-size:15px;border-top:1px solid #e2e8f0;padding-top:16px;">
      <i class="fas fa-user-shield"></i> First Administrator Account</h4>
    <div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group"><label>Admin Name *</label><input type="text" id="onbAdminName" placeholder="Full name" oninput="validateField(this,'name')"></div>
      <div class="form-group"><label>Admin Email *</label><input type="email" id="onbAdminEmail" placeholder="admin@school.edu" oninput="validateField(this,'email')"></div>
      <div class="form-group"><label>Admin Password *</label><input type="password" id="onbAdminPass" placeholder="Min 6 characters" oninput="validateField(this,'password')"></div>
      <div class="form-group"><label>Confirm Password *</label><input type="password" id="onbAdminPass2" placeholder="Repeat password" data-confirm-target="onbAdminPass" oninput="validateField(this,'confirm')"></div>
    </div>

    <div class="modal-actions" style="margin-top:20px;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-success" onclick="createNewTenant()"><i class="fas fa-plus-circle"></i> Create School</button>
    </div>
  `;
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }
  setTimeout(onbUpdateSlug, 100);
}

function onbUpdateSlug() {
  var nameInput = document.getElementById('onbSchoolName');
  var slugInput = document.getElementById('onbSchoolSlug');
  if (!nameInput || !slugInput) return;
  // Only auto-update if slug field hasn't been manually edited
  var autoSlug = generateSlug(nameInput.value);
  slugInput.placeholder = autoSlug || 'my-school';
  onbPreviewSlug();
}

function onbRegenerateSlug() {
  var nameInput = document.getElementById('onbSchoolName');
  var slugInput = document.getElementById('onbSchoolSlug');
  if (!nameInput || !slugInput) return;
  slugInput.value = generateSlug(nameInput.value);
  onbPreviewSlug();
}

function onbPreviewSlug() {
  var slugInput = document.getElementById('onbSchoolSlug');
  var preview = document.getElementById('onbSlugPreview');
  if (!preview) return;
  var slug = slugInput ? (slugInput.value.trim() || slugInput.placeholder) : 'slug';
  preview.textContent = (window.location.origin || 'https://yourdomain.com') + '/school/' + slug;
}

function createNewTenant() {
  const name = document.getElementById('onbSchoolName')?.value?.trim();
  const email = document.getElementById('onbSchoolEmail')?.value?.trim();
  const phone = document.getElementById('onbSchoolPhone')?.value?.trim();
  const motto = document.getElementById('onbSchoolMotto')?.value?.trim() || 'Education for Enlightenment';
  const address = document.getElementById('onbSchoolAddress')?.value?.trim();
  const logo = document.getElementById('onbSchoolLogo')?.value?.trim();
  const tier = document.getElementById('onbSchoolTier')?.value || 'full_k12';
  const plan = document.getElementById('onbSchoolPlan')?.value || 'basic';
  const adminName = document.getElementById('onbAdminName')?.value?.trim();
  const adminEmail = document.getElementById('onbAdminEmail')?.value?.trim();
  const adminPass = document.getElementById('onbAdminPass')?.value;
  const adminPass2 = document.getElementById('onbAdminPass2')?.value;

  const err = document.getElementById('onboardError');

  if (!name || !email || !adminName || !adminEmail || !adminPass) {
    showError(err, 'Please fill all required fields'); return;
  }
  if (!isValidEmail(email)) { showError(err, 'Invalid school email format'); return; }
  if (!isValidEmail(adminEmail)) { showError(err, 'Invalid admin email format'); return; }
  if (!isValidPassword(adminPass)) { showError(err, 'Admin password must be at least 6 characters'); return; }
  if (adminPass !== adminPass2) { showError(err, 'Passwords do not match'); return; }

  // Validate slug
  var slug = document.getElementById('onbSchoolSlug')?.value?.trim().toLowerCase() || generateSlug(name);
  if (!slug) { showError(err, 'URL slug could not be generated'); return; }
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) { showError(err, 'Slug must start with a letter and contain only letters, numbers, and hyphens'); return; }
  if (slug.length < 2 || slug.length > 63) { showError(err, 'Slug must be between 2 and 63 characters'); return; }
  if (RESERVED_SLUGS.indexOf(slug) !== -1) { showError(err, 'This slug is reserved. Please choose another.'); return; }
  if (isSlugTaken(slug)) { showError(err, 'This slug is already taken by another school'); return; }

  // Check duplicate email
  const tenants = getTenants();
  if (tenants.find(t => t.email.toLowerCase() === email.toLowerCase())) { showError(err, 'A school with this email already exists'); return; }

  hideError(err);

  const tenant = createTenant({
    name, slug, email, phone, motto, address, logo, tier, plan, adminName, adminEmail, adminPass,
  });

  // If EduVerse user is logged in, add membership to global social store
  if (typeof eduverseUser !== 'undefined' && eduverseUser && typeof getSocialData === 'function') {
    var social = getSocialData();
    if (!social.memberships) social.memberships = [];
    var mem = { id: genId('MEM'), userId: eduverseUser.id, schoolId: tenant.id, role: 'admin', refId: '' };
    social.memberships.push(mem);
    if (!social.users) social.users = [];
    if (!social.users.find(function(u) { return u.id === eduverseUser.id; })) {
      social.users.push(eduverseUser);
    }
    if (!social.feed) social.feed = [];
    social.feed.unshift({ id: genId('FED'), schoolId: tenant.id, type: 'school_created', message: tenant.name + ' was created', userId: eduverseUser.id, userName: eduverseUser.name, createdAt: new Date().toISOString() });
    saveSocialData(social);
  }

  toast(`School "${name}" created successfully!`, 'success');
  closeModal();

  // Ask if they want to set up the school profile now
  var tenantId = tenant.id;
  setTimeout(function() {
    showSetupPrompt(tenantId);
  }, 500);
}

function showSetupPrompt(tenantId) {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) { showSchoolSetupWizard(tenantId); return; }
  body.innerHTML = '<div style="text-align:center;padding:16px 0;">'
    + '<i class="fas fa-check-circle" style="font-size:56px;color:var(--success,#38a169);margin-bottom:12px;"></i>'
    + '<h2 style="margin-bottom:4px;">School Created!</h2>'
    + '<p style="color:var(--text-light);font-size:14px;margin-bottom:8px;">Your school is ready. Would you like to customize your portal now?</p>'
    + '<p style="font-size:13px;color:var(--text-light);margin-bottom:20px;">Set up hero images, colors, social links and more.</p>'
    + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
    + '<button class="btn btn-primary" onclick="closeModal();showSchoolSetupWizard(\'' + tenantId + '\')"><i class="fas fa-magic"></i> Customize Portal</button>'
    + '<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-home"></i> Go to Home</button>'
    + '</div></div>';
  if (overlay) overlay.classList.add('active');
}

// ===== School Setup Wizard (post-creation onboarding) =====
var _setupStep = 0;
var _setupTenantId = '';

function showSchoolSetupWizard(tenantId) {
  _setupStep = 0;
  _setupTenantId = tenantId;
  showSetupStep();
  var overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('active');
}

function showSetupStep() {
  var body = document.getElementById('modalBody');
  if (!body) return;
  var steps = [
    { title: 'Hero Text &amp; Theme Colors', icon: 'fa-palette' },
    { title: 'Social Media Links', icon: 'fa-share-alt' },
    { title: 'All Set!', icon: 'fa-check-circle' }
  ];
  var s = steps[_setupStep] || steps[0];
  var html = '<div style="max-width:520px;margin:0 auto;">'

    // Progress bar
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:24px;">'
    + steps.map(function(st, i) {
      var cls = i <= _setupStep ? 'var(--primary)' : '#ddd';
      var bg = i <= _setupStep && i < _setupStep ? 'var(--primary)' : (i === _setupStep ? 'var(--accent,#fbbf24)' : '#e5e7eb');
      return '<div style="flex:1;text-align:center;"><div style="width:28px;height:28px;border-radius:50%;background:' + bg + ';color:' + (i <= _setupStep ? 'white' : '#999') + ';display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:13px;font-weight:600;">' + (i + 1) + '</div><div style="font-size:10px;color:' + cls + ';">' + st.title.replace(/<[^>]+>/g,'') + '</div></div>';
    }).join('')
    + '</div>'

    // Content
    + '<div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:16px;">';

  if (_setupStep === 0) {
    html += stepHeroTheme();
  } else if (_setupStep === 1) {
    html += stepSocialLinks();
  } else if (_setupStep === 2) {
    html += stepDone();
  }

  html += '</div>'

    // Navigation buttons
    + '<div style="display:flex;gap:10px;justify-content:space-between;">'
    + (_setupStep > 0 ? '<button class="btn btn-outline" onclick="setupPrev()"><i class="fas fa-arrow-left"></i> Back</button>' : '<div></div>')
    + (_setupStep < steps.length - 1
      ? '<button class="btn btn-primary" onclick="setupNext()">Continue <i class="fas fa-arrow-right"></i></button>'
      : '<button class="btn btn-success" onclick="finishSetup()"><i class="fas fa-check"></i> Go to Dashboard</button>')
    + '</div></div>';

  body.innerHTML = html;
}

function stepHeroTheme() {
  var prof = getSchoolProfile();
  var t = prof.theme || {};
  return '<h3 style="margin-bottom:16px;"><i class="fas fa-palette"></i> Customize Your Look</h3>'
    + '<div class="form-group"><label>Hero Title</label><input type="text" id="wizHeroTitle" value="' + esc(prof.heroTitle || 'Shape Your Future With Us') + '"></div>'
    + '<div class="form-group"><label>Hero Subtitle</label><textarea rows="2" id="wizHeroSubtitle">' + esc(prof.heroSubtitle || 'Empowering students with world-class education.') + '</textarea></div>'
    + '<div style="display:flex;gap:12px;flex-wrap:wrap;">'
    + colorPicker('wizPrimary', 'Primary', t.primaryColor || '#2563eb')
    + colorPicker('wizAccent', 'Accent', t.accentColor || '#fbbf24')
    + '</div>';
}

function colorPicker(id, label, val) {
  return '<div style="flex:1;min-width:120px;"><label>' + label + '</label>'
    + '<div style="display:flex;gap:6px;align-items:center;"><input type="color" id="' + id + '" value="' + val + '" style="width:40px;height:36px;padding:2px;border:1px solid #ddd;border-radius:4px;cursor:pointer;">'
    + '<input type="text" value="' + val + '" style="flex:1;font-family:monospace;font-size:13px;" oninput="document.getElementById(\'' + id + '\').value=this.value"></div></div>';
}

function stepSocialLinks() {
  var prof = getSchoolProfile();
  var links = prof.socialLinks || [{ platform: 'facebook', url: '' }, { platform: 'twitter', url: '' }, { platform: 'linkedin', url: '' }, { platform: 'instagram', url: '' }, { platform: 'youtube', url: '' }];
  return '<h3 style="margin-bottom:16px;"><i class="fas fa-share-alt"></i> Connect Social Media</h3><p style="font-size:13px;color:var(--text-light);margin-bottom:16px;">Add links to your school\'s social media pages.</p>'
    + links.map(function(l, i) {
      var labels = { facebook: 'Facebook URL', twitter: 'Twitter URL', linkedin: 'LinkedIn URL', instagram: 'Instagram URL', youtube: 'YouTube URL' };
      return '<div class="form-group" style="margin-bottom:10px;"><label>' + (labels[l.platform] || l.platform) + '</label>'
        + '<input type="text" id="wizSocial' + i + '" value="' + esc(l.url || '') + '" placeholder="https://..."></div>';
    }).join('');
}

function stepDone() {
  var name = (getSchoolProfile().schoolName || 'Your School');
  return '<div style="text-align:center;"><i class="fas fa-check-circle" style="font-size:56px;color:var(--success,#38a169);margin-bottom:12px;"></i>'
    + '<h3 style="margin-bottom:4px;">' + esc(name) + ' is ready!</h3>'
    + '<p style="color:var(--text-light);font-size:14px;margin-bottom:8px;">Your portal has been customized. Visit the admin dashboard to manage students, teachers, fees, and more.</p>'
    + '<div style="background:#e8f5e9;border-radius:8px;padding:12px;font-size:13px;color:#2e7d32;margin-top:12px;"><i class="fas fa-lightbulb"></i> Tip: You can always change these settings later from the "Customize Your School Portal" section.</div></div>';
}

function setupNext() {
  saveSetupStep();
  _setupStep++;
  showSetupStep();
}

function setupPrev() {
  _setupStep--;
  showSetupStep();
}

function finishSetup() {
  saveSetupStep();
  closeModal();
  try { localStorage.setItem('activeTenant', _setupTenantId); } catch(e) {}
  window.location.href = 'admin.html';
}

function saveSetupStep() {
  var prof = getSchoolProfile();
  if (_setupStep === 0) {
    var ht = document.getElementById('wizHeroTitle');
    var hs = document.getElementById('wizHeroSubtitle');
    var pp = document.getElementById('wizPrimary');
    var aa = document.getElementById('wizAccent');
    if (ht) prof.heroTitle = ht.value;
    if (hs) prof.heroSubtitle = hs.value;
    if (!prof.theme) prof.theme = {};
    if (pp) prof.theme.primaryColor = pp.value;
    if (aa) prof.theme.accentColor = aa.value;
  } else if (_setupStep === 1) {
    if (!prof.socialLinks) prof.socialLinks = [];
    for (var i = 0; i < 5; i++) {
      var inp = document.getElementById('wizSocial' + i);
      if (inp && prof.socialLinks[i]) prof.socialLinks[i].url = inp.value;
    }
  }
  saveData();
}

function toggleTenantStatus(id) {
  const tenants = getTenants();
  const t = tenants.find(t => t.id === id);
  if (!t) return;
  t.status = t.status === 'active' ? 'suspended' : 'active';
  saveTenants(tenants);
  showSuperAdminDashboard();
  toast(`School "${t.name}" ${t.status === 'active' ? 'activated' : 'suspended'}`);
}

function confirmDeleteTenant(id) {
  const tenants = getTenants();
  const t = tenants.find(t => t.id === id);
  if (!t) return;
  if (!confirm(`Are you sure you want to permanently delete "${t.name}" and all its data? This cannot be undone.`)) return;
  const dataKey = getTenantDataKey(id);
  localStorage.removeItem(dataKey);
  saveTenants(tenants.filter(x => x.id !== id));
  showSuperAdminDashboard();
  toast(`School "${t.name}" deleted permanently`);
}

// ===== SHAREABLE SCHOOL URLS (Hash-based routing + subdomain) =====
// Priority: subdomain > hash (#/school/ID) > query param (?tenant=ID)
function resolveSchoolFromUrl() {
  try {
    // 1. Subdomain (e.g. myschool.yourdomain.com)
    var subId = resolveSchoolFromSubdomain();
    if (subId) return subId;

    // 2. Hash-based:  #/school/SCHOOL_ID
    var hash = window.location.hash.replace(/^#\/?/, '');
    if (hash.startsWith('school/')) {
      var id = hash.replace('school/', '');
      var tenants = getTenants();
      var tenant = tenants.find(function(t) { return t.id === id; });
      if (tenant) return id;
    }

    // 3. Query param:  ?tenant=SCHOOL_ID
    var params = new URLSearchParams(window.location.search);
    var tid = params.get('tenant');
    if (tid) {
      var tenants2 = getTenants();
      if (tenants2.find(function(t) { return t.id === tid; })) return tid;
    }
  } catch(e) {}
  return null;
}

function getCurrentSchoolUrl() {
  try {
    var activeTenant = localStorage.getItem('activeTenant');
    if (activeTenant) {
      var tenants = getTenants();
      var t = tenants.find(function(x) { return x.id === activeTenant; });
      if (t && t.slug) {
        return window.location.origin + '/school/' + encodeURIComponent(t.slug);
      }
    }
  } catch(e) {}
  return window.location.href;
}
