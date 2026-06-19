// EduVerse Multi-Tenant School Onboarding System
// Manages tenant registry, school onboarding, and data isolation

const TENANT_KEY = 'eduverse_tenants';
const SUPER_ADMIN_KEY = 'eduverse_super_admin';

function getTenants() {
  try {
    var t = JSON.parse(localStorage.getItem(TENANT_KEY)) || [];
    // One-time migration: clean old OMOLOLA branding from tenant names
    var changed = false;
    for (var i = 0; i < t.length; i++) {
      if (t[i].name && t[i].name.includes('OMOLOLA')) {
        t[i].name = t[i].name.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE');
        changed = true;
      }
    }
    if (changed) saveTenants(t);
    return t;
  } catch(e) { return []; }
}

function saveTenants(tenants) {
  localStorage.setItem(TENANT_KEY, JSON.stringify(tenants));
}

function getSuperAdmin() {
  try { return JSON.parse(localStorage.getItem(SUPER_ADMIN_KEY)) || null; } catch(e) { return null; }
}

function saveSuperAdmin(admin) {
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
  const tenant = {
    id: genTenantId(),
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
    status: 'active',
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
  saveSuperAdmin({ id: 'SUP001', name, email, password, createdAt: new Date().toISOString() });
  return getSuperAdmin();
}

// Get school data for a specific tenant
function getTenantSchoolData(tenantId) {
  try {
    const raw = localStorage.getItem(getTenantDataKey(tenantId));
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ===== DEMO TENANT =====
const DEMO_TENANT_ID = 'TNT_DEMO';

function initDemoTenant() {
  var tenants = getTenants();
  var existing = tenants.find(function(t) { return t.id === DEMO_TENANT_ID; });
  if (existing) return existing;

  var tenant = createTenant({
    name: 'Demo International School',
    email: 'demo@demo.com',
    phone: '+234 800 000 0000',
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
              <th>School</th><th>Email</th><th>Tier</th><th>Plan</th><th>Created</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              ${tenants.map(t => `
                <tr>
                  <td><strong>${htmlEscape(t.name)}</strong></td>
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
      <div class="form-group" style="grid-column:1/-1;"><label>School Name *</label><input type="text" id="onbSchoolName" placeholder="e.g. EDUVERSE" oninput="validateField(this,'name')"></div>
      <div class="form-group"><label>School Email *</label><input type="email" id="onbSchoolEmail" placeholder="admin@school.edu" oninput="validateField(this,'email')"></div>
      <div class="form-group"><label>Phone</label><input type="text" id="onbSchoolPhone" placeholder="+234 800 000 0000"></div>
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

  // Check duplicate email
  const tenants = getTenants();
  if (tenants.find(t => t.email.toLowerCase() === email.toLowerCase())) { showError(err, 'A school with this email already exists'); return; }

  hideError(err);

  const tenant = createTenant({
    name, email, phone, motto, address, logo, tier, plan, adminName, adminEmail, adminPass,
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

// ===== SHAREABLE SCHOOL URLS (Hash-based routing) =====
// Supports:  /#/school/SCHOOL_ID   or   ?tenant=SCHOOL_ID
function resolveSchoolFromUrl() {
  try {
    var hash = window.location.hash.replace(/^#\/?/, '');
    if (hash.startsWith('school/')) {
      var id = hash.replace('school/', '');
      var tenants = getTenants();
      var tenant = tenants.find(function(t) { return t.id === id; });
      if (tenant) return id;
    }
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
      return window.location.origin + window.location.pathname + '#/school/' + encodeURIComponent(activeTenant);
    }
  } catch(e) {}
  return window.location.href;
}
