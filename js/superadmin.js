// ===== Super Admin Dashboard =====

var PLATFORM_CONFIG_KEY = 'eduverse_platform_config';
var _saCurrentTab = 'overview';
var _platformConfigCache = null;

// ===== Platform Config Store (separate from school data) =====
function getPlatformConfig() {
  if (_platformConfigCache) return _platformConfigCache;
  try {
    var raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
    if (raw) { _platformConfigCache = JSON.parse(raw); return _platformConfigCache; }
  } catch(e) {}
  return getDefaultPlatformConfig();
}

function savePlatformConfig(cfg) {
  _platformConfigCache = cfg;
  localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(cfg));
}

function getDefaultPlatformConfig() {
  return {
    whatsappNumber: '',
    contactEmail: '',
    bankAccounts: [],
    currency: 'NGN',
    platformName: 'EduVerse',
    subscriptionPlans: [
      { id: 'plan_free', name: 'Free', interval: 'free', amount: 0, active: true, features: 'Basic school management, up to 50 students' },
      { id: 'plan_basic', name: 'Basic', interval: 'monthly', amount: 5000, active: true, features: 'Up to 200 students, all modules' },
      { id: 'plan_standard', name: 'Standard', interval: 'monthly', amount: 15000, active: true, features: 'Up to 500 students, priority support' },
      { id: 'plan_premium', name: 'Premium', interval: 'monthly', amount: 35000, active: true, features: 'Unlimited students, dedicated support, custom branding' },
      { id: 'plan_enterprise', name: 'Enterprise', interval: 'yearly', amount: 300000, active: true, features: 'Unlimited everything, SLA, white-label' }
    ],
    settings: {
      allowSchoolRegistration: true,
      requireApproval: false,
      maintenanceMode: false,
      maintenanceMessage: 'System is under maintenance. Please check back shortly.'
    },
    smtpConfig: { host: '', port: 587, secure: false, user: '', pass: '', fromName: '', fromEmail: '' },
    globalFeatureFlags: {
      examSimulation: true, aiTools: true, activityGames: true, alumni: true,
      hostel: true, library: true, transport: true, health: true, chat: true,
      gallery: true, reportBuilder: true, idCards: true, handwritingOcr: true,
      paymentGateway: true, eschool: true, gradebook: true
    },
    revenueRecords: [],
    lastBackupDate: null
  };
}

// ===== Show Full-Page Super Admin Dashboard =====
function showSuperAdminDashboard() {
  var admin = getSuperAdmin();
  if (!admin) { showSuperAdminLogin(); return; }

  // Render the dashboard into a full-page overlay
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;

  _saCurrentTab = 'overview';

  body.innerHTML = '<div class="sa-dashboard"><div class="sa-sidebar" id="saSidebar">'
    + '<div class="sa-sidebar-header"><i class="fas fa-user-shield"></i><span>Super Admin</span></div>'
    + '<div class="sa-sidebar-user">' + esc(admin.name) + '<br><span class="sa-text-small">' + esc(admin.email) + '</span></div>'
    + '<nav class="sa-nav">'
    + saNavItem('overview', 'chart-pie', 'Overview')
    + saNavItem('schools', 'school', 'Schools')
    + saNavItem('password-reset', 'key', 'Password Reset')
    + saNavItem('applications', 'clipboard-list', 'Applications')
    + saNavItem('platform', 'cogs', 'Platform Settings')
    + saNavItem('subscriptions', 'credit-card', 'Subscription Plans')
    + saNavItem('analytics', 'chart-line', 'Analytics')
    + saNavItem('broadcast', 'bullhorn', 'Broadcast')
    + saNavItem('revenue', 'money-bill-wave', 'Revenue')
    + saNavItem('tickets', 'headset', 'Support Tickets')
    + saNavItem('newsletter', 'envelope-open-text', 'Newsletter')
    + saNavItem('features', 'toggle-on', 'Feature Flags')
    + saNavItem('backup', 'database', 'Backup & Data')
    + saNavItem('system', 'server', 'System')
    + '</nav>'
    + '<div class="sa-sidebar-footer"><button class="btn btn-sm btn-outline" onclick="closeSaDashboard()" style="width:100%"><i class="fas fa-times"></i> Close</button></div>'
    + '</div><div class="sa-main" id="saMain"><div class="sa-main-header"><h2 id="saPanelTitle">Overview</h2></div><div class="sa-content" id="saContent"></div></div></div>';

  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }

  renderSaTab('overview');
}

function saNavItem(tab, icon, label) {
  return '<a href="javascript:;" class="sa-nav-item" data-tab="' + tab + '" onclick="switchSaTab(\'' + tab + '\')"><i class="fas fa-' + icon + '"></i> ' + label + '</a>';
}

function closeSaDashboard() {
  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.overflowY = '';
  }
  try { if (typeof firebase !== 'undefined' && firebase.auth) firebase.auth().signOut(); } catch(e) {}
}

function switchSaTab(tab) {
  _saCurrentTab = tab;
  document.querySelectorAll('.sa-nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  renderSaTab(tab);
}

function renderSaTab(tab) {
  var titles = {
    overview: 'Overview',
    schools: 'Schools Management',
    'password-reset': 'Password Reset',
    applications: 'Pending Applications',
    platform: 'Platform Settings',
    subscriptions: 'Subscription Plans',
    analytics: 'Platform Analytics',
    broadcast: 'Broadcast Message',
    revenue: 'Revenue & Payments',
    tickets: 'Support Tickets',
    newsletter: 'Newsletter Subscribers',
    features: 'Global Feature Flags',
    backup: 'Backup & Data Management',
    system: 'System & Maintenance'
  };
  var titleEl = document.getElementById('saPanelTitle');
  if (titleEl) titleEl.textContent = titles[tab] || 'Overview';
  var content = document.getElementById('saContent');
  if (!content) return;
  switch (tab) {
    case 'overview': renderSaOverview(content); break;
    case 'schools': renderSaSchools(content); break;
    case 'password-reset': renderSaPasswordReset(content); break;
    case 'applications': renderSaApplications(content); break;
    case 'platform': renderSaPlatform(content); break;
    case 'subscriptions': renderSaSubscriptions(content); break;
    case 'analytics': renderSaAnalytics(content); break;
    case 'broadcast': renderSaBroadcast(content); break;
    case 'revenue': renderSaRevenue(content); break;
    case 'tickets': renderSaTickets(content); break;
    case 'newsletter': renderSaNewsletter(content); break;
    case 'features': renderSaFeatures(content); break;
    case 'backup': renderSaBackup(content); break;
    case 'system': renderSaSystem(content); break;
  }
}

// ===== Cross-School Data Aggregator =====
function _aggregateAllSchoolData() {
  var tenants = getTenants();
  var agg = {
    students: { total: 0, active: 0, inactive: 0 },
    teachers: { total: 0 },
    classes: { total: 0 },
    subjects: { total: 0 },
    feesCollected: { total: 0, totalAmount: 0 },
    totalStorageKB: 0,
    schools: []
  };
  tenants.forEach(function(t) {
    try {
      var raw = localStorage.getItem(getTenantDataKey(t.id));
      if (!raw) return;
      var d = JSON.parse(raw);
      var students = d.students || [];
      var teachers = d.teachers || [];
      var classesList = d.classes || [];
      var subjects = d.subjects || [];
      var fees = d.fees || [];
      var activeS = students.filter(function(s) { return s.status !== 'graduated' && s.status !== 'inactive' && s.status !== 'alumni'; });
      agg.students.total += students.length;
      agg.students.active += activeS.length;
      agg.students.inactive += (students.length - activeS.length);
      agg.teachers.total += teachers.length;
      agg.classes.total += classesList.length;
      agg.subjects.total += subjects.length;
      fees.forEach(function(f) {
        if (f.status === 'paid' || f.paid) {
          agg.feesCollected.total++;
          agg.feesCollected.totalAmount += (parseFloat(f.amount) || 0);
        }
      });
      var feeCollectedF = fees.filter(function(f) { return f.status === 'paid' || f.paid; });
      agg.schools.push({
        id: t.id, name: t.name,
        studentCount: students.length, teacherCount: teachers.length,
        classCount: classesList.length, subjectCount: subjects.length,
        feeCount: fees.length,
        feeCollectedCount: feeCollectedF.length,
        feeCollectedAmount: feeCollectedF.reduce(function(s, f) { return s + (parseFloat(f.amount) || 0); }, 0),
        storageKB: (raw.length / 1024).toFixed(1),
        plan: t.plan, status: t.status
      });
      agg.totalStorageKB += raw.length / 1024;
    } catch(e) {}
  });
  return agg;
}

// ===== 1. Overview Tab =====
function renderSaOverview(container) {
  var admin = getSuperAdmin();
  var cfg = getPlatformConfig();
  var tenants = getTenants();
  var agg = _aggregateAllSchoolData();
  var sym = cfg.currency === 'NGN' ? '&#8358;' : (cfg.currency === 'USD' ? '&#36;' : (cfg.currency === 'GBP' ? '&#163;' : '&#8364;'));

  var html = '<div class="sa-stats-grid">'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--indigo"><i class="fas fa-school"></i></div><div><div class="sa-stat-value">' + tenants.length + '</div><div class="sa-stat-label">Total Schools</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--blue"><i class="fas fa-user-graduate"></i></div><div><div class="sa-stat-value">' + agg.students.total + '</div><div class="sa-stat-label">' + agg.students.active + ' Active · ' + agg.students.inactive + ' Inactive</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--amber"><i class="fas fa-chalkboard-teacher"></i></div><div><div class="sa-stat-value">' + agg.teachers.total + '</div><div class="sa-stat-label">Teachers (All Schools)</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--green"><i class="fas fa-school"></i></div><div><div class="sa-stat-value">' + agg.classes.total + '</div><div class="sa-stat-label">Classes (All Schools)</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--pink"><i class="fas fa-money-bill-wave"></i></div><div><div class="sa-stat-value">' + sym + formatAmount(agg.feesCollected.totalAmount) + '</div><div class="sa-stat-label">' + agg.feesCollected.total + ' Fee Collections</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--indigo"><i class="fas fa-database"></i></div><div><div class="sa-stat-value">' + agg.totalStorageKB.toFixed(1) + ' KB</div><div class="sa-stat-label">Total Storage</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--green"><i class="fas fa-check-circle"></i></div><div><div class="sa-stat-value">' + tenants.filter(function(t) { return t.status === 'active'; }).length + '</div><div class="sa-stat-label">Active Schools</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--red"><i class="fas fa-pause-circle"></i></div><div><div class="sa-stat-value">' + tenants.filter(function(t) { return t.status === 'suspended'; }).length + '</div><div class="sa-stat-label">Suspended</div></div></div>'
    + '</div>';

  // Per-school overview table
  html += '<div class="sa-section"><h3><i class="fas fa-list"></i> Per-School Overview</h3>';
  if (!agg.schools.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-database"></i><p>No school data loaded.</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Students</th><th>Teachers</th><th>Classes</th><th>Fees Collected</th><th>Storage</th><th>Plan</th><th>Status</th></tr></thead><tbody>'
      + agg.schools.map(function(s) {
        return '<tr><td><strong>' + esc(s.name) + '</strong></td>'
          + '<td>' + s.studentCount + '</td>'
          + '<td>' + s.teacherCount + '</td>'
          + '<td>' + s.classCount + '</td>'
          + '<td>' + sym + formatAmount(s.feeCollectedAmount) + ' (' + s.feeCollectedCount + ')</td>'
          + '<td>' + s.storageKB + ' KB</td>'
          + '<td><span class="sa-badge sa-badge--blue">' + esc(s.plan || 'free') + '</span></td>'
          + '<td><span class="badge ' + (s.status === 'active' ? 'badge-paid' : (s.status === 'pending' ? 'badge-grade' : 'badge-absent')) + '">' + esc(s.status) + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  html += '</div>';

  // Recent activity log
  var log = getActivityLog().slice(0, 10);
  html += '<div class="sa-section"><h3><i class="fas fa-history"></i> Recent Activity</h3>'
    + (log.length ? '<div class="sa-log">' + log.map(function(l) {
      return '<div class="sa-log-item"><span class="sa-log-time">' + (l.time || '') + '</span><span class="sa-log-msg">' + esc(l.msg) + '</span></div>';
    }).join('') + '</div>' : '<div class="sa-empty-state"><i class="fas fa-history"></i><p>No activity recorded yet.</p></div>')
    + '</div>';

  // Quick actions
  html += '<div class="sa-section"><h3><i class="fas fa-bolt"></i> Quick Actions</h3>'
    + '<div class="sa-actions-row">'
    + '<button class="btn btn-primary" onclick="closeSaDashboard();showOnboardSchool()"><i class="fas fa-plus-circle"></i> Add New School</button>'
    + '<button class="btn btn-outline" onclick="switchSaTab(\'platform\')"><i class="fas fa-cogs"></i> Configure Platform</button>'
    + '<button class="btn btn-outline" onclick="switchSaTab(\'subscriptions\')"><i class="fas fa-credit-card"></i> Manage Plans</button>'
    + '<button class="btn btn-outline" onclick="switchSaTab(\'analytics\')"><i class="fas fa-chart-line"></i> View Analytics</button>'
    + '<button class="btn btn-outline" onclick="switchSaTab(\'revenue\')"><i class="fas fa-money-bill-wave"></i> Revenue</button>'
    + '</div></div>';

  container.innerHTML = html;
}

// ===== 2. Schools Tab =====
function renderSaSchools(container) {
  var tenants = getTenants();
  var pendingCount = tenants.filter(function(t) { return t.status === 'pending'; }).length;

  var html = '<div class="sa-section-header">'
    + '<p class="sa-subtitle" style="margin:0;">' + tenants.length + ' school(s) registered'
    + (pendingCount ? ' (<strong class="sa-badge sa-badge--amber">' + pendingCount + ' pending</strong>)' : '')
    + '</p>'
    + '<button class="btn btn-primary btn-sm" onclick="closeSaDashboard();showOnboardSchool()"><i class="fas fa-plus"></i> Add School</button></div>';

  if (!tenants.length) {
    html += '<div class="empty-state"><i class="fas fa-school"></i><p>No schools registered yet.</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Slug</th><th>Email</th><th>Tier</th><th>Plan</th><th>Premium</th><th>Status</th><th>Actions</th></tr></thead><tbody>'
      + tenants.map(function(t) {
        var isPremium = _saCheckPremium(t.id);
        var statusBadgeClass = t.status === 'active' ? 'badge-paid' : (t.status === 'pending' ? 'badge-grade' : 'badge-absent');
        var statusActions = (t.status === 'pending')
          ? '<button class="btn btn-sm btn-success" onclick="saApproveSchool(\'' + t.id + '\')" title="Approve"><i class="fas fa-check"></i> Approve</button>'
          : '<button class="btn btn-sm btn-outline" onclick="saToggleTenant(\'' + t.id + '\')" title="Toggle status" aria-label="Toggle status"><i class="fas ' + (t.status === 'active' ? 'fa-pause' : 'fa-play') + '"></i></button>'
          + '<button class="btn btn-sm btn-outline" onclick="saResetSchoolPassword(\'' + t.id + '\')" title="Reset Password" aria-label="Reset Password"><i class="fas fa-key"></i></button>';
        return '<tr><td><strong>' + esc(t.name) + '</strong></td><td><code class="sa-code-inline">' + esc(t.slug || '—') + '</code></td><td>' + esc(t.email) + '</td>'
          + '<td><span class="badge badge-grade">' + esc(t.tier) + '</span></td>'
          + '<td><select class="sa-plan-select" onchange="saAssignPlan(\'' + t.id + '\',this.value)">' + _saPlanOptions(t.plan) + '</select></td>'
          + '<td>' + (isPremium
            ? '<span class="sa-badge sa-badge--green" style="cursor:pointer;" onclick="saTogglePremium(\'' + t.id + '\')" title="Click to revoke"><i class="fas fa-crown"></i> Active</span>'
            : '<span class="sa-badge sa-badge--gray" style="cursor:pointer;" onclick="saTogglePremium(\'' + t.id + '\')" title="Click to grant"><i class="fas fa-lock"></i> Free</span>')
          + '</td>'
          + '<td><span class="badge ' + statusBadgeClass + '">' + esc(t.status) + '</span></td>'
          + '<td><div class="sa-row-actions">'
          + '<button class="btn btn-sm btn-primary" onclick="switchTenant(\'' + t.id + '\')" title="Open Dashboard" aria-label="Open Dashboard"><i class="fas fa-external-link-alt"></i></button>'
          + '<button class="btn btn-sm btn-outline" onclick="saOpenPortal(\'' + (t.slug || t.id) + '\',\'admin\')" title="Admin Portal" aria-label="Admin Portal"><i class="fas fa-user-shield"></i></button>'
          + '<button class="btn btn-sm btn-outline" onclick="saOpenPortal(\'' + (t.slug || t.id) + '\',\'teacher\')" title="Teacher Portal" aria-label="Teacher Portal"><i class="fas fa-chalkboard-teacher"></i></button>'
          + '<button class="btn btn-sm btn-outline" onclick="saOpenPortal(\'' + (t.slug || t.id) + '\',\'student\')" title="Student Portal" aria-label="Student Portal"><i class="fas fa-user-graduate"></i></button>'
          + '<button class="btn btn-sm btn-outline" onclick="saOpenPortal(\'' + (t.slug || t.id) + '\',\'parent\')" title="Parent Portal" aria-label="Parent Portal"><i class="fas fa-users"></i></button>'
          + statusActions
          + '<button class="btn btn-sm btn-danger-outline" onclick="saDeleteTenant(\'' + t.id + '\')" title="Delete" aria-label="Delete"><i class="fas fa-trash"></i></button>'
          + '</div></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  container.innerHTML = html;
}

function saApproveSchool(id) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === id; });
  if (!t) return;
  t.status = 'active';
  saveTenants(tenants);
  saLogActivity('Approved school registration: ' + t.name);
  renderSaSchools(document.getElementById('saContent'));
  toast('School "' + t.name + '" approved and activated!');
}

function saResetSchoolPassword(id) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === id; });
  if (!t) return;
  var newPass = prompt('Enter new password for "' + t.name + '":', 'password123');
  if (!newPass || newPass.length < 4) { toast('Password must be at least 4 characters'); return; }
  try {
    var key = getTenantDataKey(id);
    var raw = localStorage.getItem(key);
    if (raw) {
      var d = JSON.parse(raw);
      d.password = newPass;
      // Update admin in data.admins array if present
      if (d.admins && d.admins.length) { d.admins[0].password = newPass; }
      localStorage.setItem(key, JSON.stringify(d));
      saLogActivity('Password reset for school: ' + t.name);
      toast('Password for "' + t.name + '" has been reset successfully!');
    } else {
      toast('No data found for this school.');
    }
  } catch(e) { toast('Error: ' + e.message); }
}

function saToggleTenant(id) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === id; });
  if (!t) return;
  t.status = t.status === 'active' ? 'suspended' : 'active';
  saveTenants(tenants);
  saLogActivity((t.status === 'active' ? 'Activated' : 'Suspended') + ' school: ' + t.name);
  renderSaTab('schools');
  toast('School "' + t.name + '" ' + (t.status === 'active' ? 'activated' : 'suspended'));
}

function saDeleteTenant(id) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === id; });
  if (!t) return;
  if (!confirm('Permanently delete "' + t.name + '" and all its data? This cannot be undone.')) return;
  var dataKey = getTenantDataKey(id);
  localStorage.removeItem(dataKey);
  saveTenants(tenants.filter(function(x) { return x.id !== id; }));
  saLogActivity('Deleted school: ' + t.name);
  renderSaTab('schools');
  toast('School "' + t.name + '" deleted');
}

function saOpenPortal(slug, portal) {
  closeSaDashboard();
  localStorage.setItem('activeTenant', slug);
  if (portal === 'admin') {
    window.location.href = 'admin.html?school=' + encodeURIComponent(slug);
  } else {
    window.location.href = 'index.html?school=' + encodeURIComponent(slug) + '&portal=' + portal;
  }
}

function _saCheckPremium(tenantId) {
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) return false;
    var d = JSON.parse(raw);
    return d.subscription && d.subscription.premiumOverride === true;
  } catch(e) { return false; }
}

function saTogglePremium(tenantId) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === tenantId; });
  if (!t) { toast('School not found', 'error'); return; }
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { toast('No data for this school', 'error'); return; }
    var d = JSON.parse(raw);
    if (!d.subscription) d.subscription = {};
    if (d.subscription.premiumOverride === true) {
      delete d.subscription.premiumOverride;
      d.subscription.plan = 'free';
      d.subscription.status = 'active';
      delete d.subscription.endDate;
      localStorage.setItem(key, JSON.stringify(d));
      saLogActivity('Revoked Premium Access for: ' + t.name);
      toast('Premium Access revoked for ' + t.name);
    } else {
      d.subscription.plan = 'premium';
      d.subscription.status = 'active';
      d.subscription.amount = 0;
      d.subscription.currency = 'NGN';
      d.subscription.premiumOverride = true;
      d.subscription.startDate = new Date().toISOString().split('T')[0];
      d.subscription.endDate = '2099-12-31';
      d.subscription.autoRenew = true;
      d.subscription.lastPaymentDate = new Date().toISOString().split('T')[0];
      d.subscription.lastPaymentRef = 'SA_OVERRIDE_' + Date.now();
      d.subscription.planName = 'Premium (SA Override)';
      localStorage.setItem(key, JSON.stringify(d));
      saLogActivity('Granted Premium Access to: ' + t.name);
      toast('Premium Access granted to ' + t.name + '! All features unlocked.');
    }
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  renderSaTab('schools');
}

function _saPlanOptions(currentPlan) {
  var cfg = getPlatformConfig();
  var plans = cfg.subscriptionPlans || [];
  var opts = '';
  var seen = {};
  if (currentPlan && currentPlan !== 'free') {
    opts += '<option value="' + esc(currentPlan) + '">' + esc(currentPlan) + '</option>';
    seen[currentPlan] = true;
  }
  plans.forEach(function(p) {
    if (!seen[p.name]) {
      opts += '<option value="' + esc(p.name) + '"' + (p.name === currentPlan ? ' selected' : '') + '>' + esc(p.name) + '</option>';
      seen[p.name] = true;
    }
  });
  if (!seen['Free']) opts += '<option value="Free"' + (currentPlan === 'Free' || !currentPlan ? ' selected' : '') + '>Free</option>';
  return opts;
}

function saAssignPlan(tenantId, planName) {
  var tenants = getTenants();
  var t = tenants.find(function(x) { return x.id === tenantId; });
  if (!t) { toast('School not found', 'error'); return; }
  t.plan = planName;
  saveTenants(tenants);
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (raw) {
      var d = JSON.parse(raw);
      if (!d.subscription) d.subscription = {};
      d.subscription.plan = planName.toLowerCase();
      d.subscription.planName = planName;
      d.subscription.status = 'active';
      localStorage.setItem(key, JSON.stringify(d));
    }
  } catch(e) {}
  saLogActivity('Changed plan for ' + t.name + ' to ' + planName);
  toast('Plan for "' + t.name + '" updated to ' + planName);
}

// ===== Applications Tab =====
var _pendingApprovePass = '';

function renderSaApplications(container) {
  var apps = [];
  try { apps = JSON.parse(localStorage.getItem('eduverse_school_applications')) || []; } catch(e) {}
  var pending = apps.filter(function(a) { return a.status === 'pending'; });
  var approved = apps.filter(function(a) { return a.status === 'approved'; });
  var rejected = apps.filter(function(a) { return a.status === 'rejected'; });

  var html = '<div class="sa-section"><h3><i class="fas fa-clipboard-list"></i> School Applications</h3>'
    + '<p class="sa-subtitle">' + apps.length + ' total | '
    + '<span class="sa-badge sa-badge--amber">' + pending.length + ' pending</span> '
    + '<span class="sa-badge sa-badge--green">' + approved.length + ' approved</span> '
    + '<span class="sa-badge sa-badge--red">' + rejected.length + ' rejected</span></p>';

  if (!pending.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-inbox"></i><p>No pending applications</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Contact</th><th>Email</th><th>Phone</th><th>Location</th><th>Size</th><th>Curriculum</th><th>Applied</th><th>Actions</th></tr></thead><tbody>';
    pending.forEach(function(a) {
      html += '<tr><td><strong>' + esc(a.schoolName) + '</strong></td>'
        + '<td>' + esc(a.contactName) + '</td>'
        + '<td>' + esc(a.email) + '</td>'
        + '<td>' + esc(a.phone) + '</td>'
        + '<td>' + esc(a.city) + ', ' + esc(a.country) + '</td>'
        + '<td><span class="sa-badge sa-badge--amber">' + esc(a.schoolSize) + '</span></td>'
        + '<td><span class="sa-badge sa-badge--blue">' + esc(a.curriculumType) + '</span></td>'
        + '<td><span class="sa-text-small">' + new Date(a.appliedAt).toLocaleDateString() + '</span></td>'
        + '<td><div class="sa-row-actions">'
        + '<button class="btn btn-sm btn-success" onclick="saApproveApplication(\'' + a.id + '\')"><i class="fas fa-check"></i> Approve</button>'
        + '<button class="btn btn-sm btn-danger-outline" onclick="saRejectApplication(\'' + a.id + '\')"><i class="fas fa-times"></i> Reject</button>'
        + '</div></td></tr>';
    });
    html += '</tbody></table></div>';
  }

  // Recently handled
  if (approved.length || rejected.length) {
    html += '<h4 class="sa-mt-24 sa-mb-12" style="font-size:15px;border-top:1px solid var(--sa-border);padding-top:16px;">Recently Handled</h4>'
      + '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Email</th><th>Status</th><th>Date</th><th>Notes</th></tr></thead><tbody>';
    var handled = approved.concat(rejected).sort(function(a, b) { return new Date(b.approvedAt || b.appliedAt) - new Date(a.approvedAt || a.appliedAt); });
    handled.slice(0, 20).forEach(function(a) {
      var badge = a.status === 'approved' ? 'sa-badge--green' : 'sa-badge--red';
      var date = a.approvedAt || a.appliedAt;
      var notes = a.status === 'rejected' ? esc(a.rejectionReason || '') : '<i class="fas fa-check" style="color:var(--sa-green);"></i> Approved';
      html += '<tr><td><strong>' + esc(a.schoolName) + '</strong></td><td>' + esc(a.email) + '</td>'
        + '<td><span class="sa-badge ' + badge + '">' + a.status + '</span></td>'
        + '<td><span class="sa-text-small">' + new Date(date).toLocaleDateString() + '</span></td>'
        + '<td class="sa-text-small">' + notes + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function saApproveApplication(appId) {
  var apps = [];
  try { apps = JSON.parse(localStorage.getItem('eduverse_school_applications')) || []; } catch(e) {}
  var app = apps.find(function(a) { return a.id === appId; });
  if (!app || app.status !== 'pending') { toast('Application not found or already processed', 'error'); return; }

  var pass = genPassword();
  _pendingApprovePass = pass;

  // Build mailto body with credentials
  var body = 'Dear ' + app.contactName + ',\n\n'
    + 'Congratulations! Your application for ' + app.schoolName + ' has been approved.\n\n'
    + 'Your school admin account is now active:\n'
    + 'Login URL: https://eduversemngt.netlify.app/login\n'
    + 'Email: ' + app.email + '\n'
    + 'Temporary Password: ' + pass + '\n\n'
    + 'IMPORTANT: Please change your password after first login.\n\n'
    + 'Welcome to EduVerse!\n— The EduVerse Team';

  // Update app status
  app.status = 'approved';
  app.approvedAt = new Date().toISOString();
  saveApplications(apps);

  // Generate a unique slug from school name
  var slug = typeof normalizeSlug === 'function' ? normalizeSlug(app.schoolName) : app.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) slug = 'school-' + appId.substring(0, 6).toLowerCase();
  // Ensure uniqueness
  var existing = getTenants();
  var baseSlug = slug;
  var counter = 1;
  while (existing.some(function(t) { return t.slug === slug; })) { slug = baseSlug + '-' + counter; counter++; }

  // Create the tenant with active status and forcePasswordChange
  var tenant = createTenant({
    name: app.schoolName,
    slug: slug,
    email: app.email,
    phone: app.phone,
    address: app.address || '',
    logo: '',
    motto: 'Education for Enlightenment',
    tier: 'full_k12',
    plan: 'basic',
    adminName: app.contactName,
    adminEmail: app.email,
    adminPass: pass,
    forcePasswordChange: true,
    status: 'active',
  });

  toast('Application approved! School created successfully.', 'success');

  // Show credentials modal
  var overlay = document.getElementById('modalOverlay');
  var bodyEl = document.getElementById('modalBody');
  if (bodyEl) {
    bodyEl.innerHTML = '<div class="sa-card">'
      + '<h3 class="sa-mb-12"><i class="fas fa-check-circle" style="color:var(--sa-green);"></i> School Approved!</h3>'
      + '<p class="sa-mb-16 sa-subtitle">' + esc(app.schoolName) + ' has been approved and is now active on the platform.</p>'
      + '<div class="sa-success-box">'
      + '<p style="font-weight:600;margin-bottom:8px;">Admin Credentials</p>'
      + '<p><strong>Email:</strong> ' + esc(app.email) + '</p>'
      + '<p><strong>Password:</strong> <code class="sa-code-inline" style="font-size:14px;">' + pass + '</code></p>'
      + '<p class="sa-text-small sa-mt-8" style="color:var(--sa-text-light);">Credentials have been sent via email.</p>'
      + '</div>'
      + '<div class="sa-actions-row">'
      + '<button class="btn btn-primary" onclick="window.open(\'mailto:' + encodeURIComponent(app.email) + '?subject=' + encodeURIComponent('Your EduVerse Admin Account is Ready!') + '&body=' + encodeURIComponent(body) + '\',\'_blank\');closeModal()"><i class="fas fa-envelope"></i> Send Email</button>'
      + '<button class="btn btn-outline" onclick="closeModal()">Close</button>'
      + '</div></div>';
    if (overlay) {
      overlay.classList.add('active');
      overlay.style.overflowY = 'auto';
    }
  }

  renderSaTab('applications');
}

function saRejectApplication(appId) {
  // Show a reason input modal
  var overlay = document.getElementById('modalOverlay');
  var bodyEl = document.getElementById('modalBody');
  if (!bodyEl) return;
  bodyEl.innerHTML = '<h3 class="sa-mb-12"><i class="fas fa-times-circle" style="color:var(--sa-red);"></i> Reject Application</h3>'
    + '<div id="rejectError" class="sa-error-box" style="display:none;"></div>'
    + '<div class="form-group"><label>Reason for Rejection *</label><textarea id="rejectReason" class="sa-input" style="min-height:100px;" placeholder="Provide a reason the applicant can understand..."></textarea></div>'
    + '<div class="modal-actions sa-mt-16"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-danger" onclick="saConfirmReject(\'' + appId + '\')"><i class="fas fa-times"></i> Confirm Rejection</button></div>';
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.overflowY = 'auto';
  }
}

function saConfirmReject(appId) {
  var reason = document.getElementById('rejectReason')?.value?.trim();
  if (!reason) { showError(document.getElementById('rejectError'), 'Please provide a reason'); return; }

  var apps = [];
  try { apps = JSON.parse(localStorage.getItem('eduverse_school_applications')) || []; } catch(e) {}
  var app = apps.find(function(a) { return a.id === appId; });
  if (!app || app.status !== 'pending') { toast('Application not found', 'error'); return; }

  app.status = 'rejected';
  app.rejectionReason = reason;
  saveApplications(apps);

  var body = 'Dear ' + app.contactName + ',\n\n'
    + 'Thank you for your interest in EduVerse.\n\n'
    + 'Unfortunately, your application for ' + app.schoolName + ' has been reviewed and we are unable to approve it at this time.\n\n'
    + 'Reason: ' + reason + '\n\n'
    + 'You may reapply after addressing the above concerns.\n\n'
    + 'Best regards,\n— The EduVerse Team';

  toast('Application rejected.', 'info');
  closeModal();
  window.open('mailto:' + encodeURIComponent(app.email) + '?subject=' + encodeURIComponent('EduVerse Application Update') + '&body=' + encodeURIComponent(body), '_blank');
  renderSaTab('applications');
}

// ===== 3. Platform Settings Tab =====
function renderSaPlatform(container) {
  var cfg = getPlatformConfig();
  var banks = cfg.bankAccounts || [];
  var html = '<div class="sa-settings-form">'

    // Contact Section
    + '<div class="sa-section"><h3><i class="fas fa-phone-alt"></i> Platform Contact</h3>'
    + '<div class="form-row"><label>Platform Name</label><input type="text" id="saPlatformName" value="' + esc(cfg.platformName || 'EduVerse') + '" oninput="updateSaConfig(\'platformName\',this.value)"></div>'
    + '<div class="form-row"><label>WhatsApp Number</label><input type="text" id="saWhatsApp" value="' + esc(cfg.whatsappNumber || '') + '" placeholder="e.g. +2348012345678" oninput="updateSaConfig(\'whatsappNumber\',this.value)"><p class="field-hint">Shows as floating WhatsApp button on the landing page</p></div>'
    + '<div class="form-row"><label>Contact Email</label><input type="email" id="saContactEmail" value="' + esc(cfg.contactEmail || '') + '" placeholder="super@eduverse.com" oninput="updateSaConfig(\'contactEmail\',this.value)"><p class="field-hint">Shows as floating email button on the landing page</p></div>'
    + '<div class="form-row"><label>Currency</label><select onchange="updateSaConfig(\'currency\',this.value)"><option value="NGN"' + (cfg.currency==='NGN'?' selected':'') + '>NGN (₦)</option><option value="USD"' + (cfg.currency==='USD'?' selected':'') + '>USD ($)</option><option value="GBP"' + (cfg.currency==='GBP'?' selected':'') + '>GBP (£)</option><option value="EUR"' + (cfg.currency==='EUR'?' selected':'') + '>EUR (€)</option></select></div>'
    + '</div>'

    // Bank Accounts
    + '<div class="sa-section"><h3><i class="fas fa-university"></i> Bank Accounts <span class="sa-text-small" style="font-weight:400;">(for subscription payments)</span></h3>'
    + '<div id="saBankList">' + renderBankList(banks) + '</div>'
    + '<button class="btn btn-sm btn-primary sa-mt-8" onclick="saAddBank()"><i class="fas fa-plus"></i> Add Bank Account</button>'
    + '</div>'

    // SMTP / Email
    + '<div class="sa-section"><h3><i class="fas fa-envelope-open-text"></i> Email (SMTP) Configuration <span class="sa-text-small" style="font-weight:400;">— for broadcasts &amp; password resets</span></h3>'
    + '<div class="form-row"><label>SMTP Host</label><input type="text" id="saSmtpHost" value="' + esc((cfg.smtpConfig||{}).host || '') + '" placeholder="smtp.gmail.com" onchange="updateSaSmtp(\'host\',this.value)"></div>'
    + '<div class="sa-grid-2">'
    + '<div class="form-row"><label>Port</label><input type="number" id="saSmtpPort" value="' + ((cfg.smtpConfig||{}).port || 587) + '" onchange="updateSaSmtp(\'port\',parseInt(this.value)||587)"></div>'
    + '<div class="form-row"><label>Secure (TLS)</label><select id="saSmtpSecure" onchange="updateSaSmtp(\'secure\',this.value===\'true\')"><option value="true"' + ((cfg.smtpConfig||{}).secure ? ' selected':'') + '>Yes</option><option value="false"' + (!(cfg.smtpConfig||{}).secure ? ' selected':'') + '>No</option></select></div>'
    + '</div>'
    + '<div class="form-row"><label>Username</label><input type="text" id="saSmtpUser" value="' + esc((cfg.smtpConfig||{}).user || '') + '" placeholder="your@email.com" onchange="updateSaSmtp(\'user\',this.value)"></div>'
    + '<div class="form-row"><label>Password</label><input type="password" id="saSmtpPass" value="' + esc((cfg.smtpConfig||{}).pass || '') + '" placeholder="App password" onchange="updateSaSmtp(\'pass\',this.value)"></div>'
    + '<div class="form-row"><label>From Name</label><input type="text" id="saSmtpFromName" value="' + esc((cfg.smtpConfig||{}).fromName || cfg.platformName || 'EduVerse') + '" onchange="updateSaSmtp(\'fromName\',this.value)"></div>'
    + '<div class="form-row"><label>From Email</label><input type="email" id="saSmtpFromEmail" value="' + esc((cfg.smtpConfig||{}).fromEmail || cfg.contactEmail || '') + '" onchange="updateSaSmtp(\'fromEmail\',this.value)"></div>'
    + '</div>'

    // Save button
    + '<div class="sa-mt-24" style="text-align:right;"><button class="btn btn-success" onclick="saSavePlatform()"><i class="fas fa-save"></i> Save Platform Settings</button></div>'
    + '</div>';

  container.innerHTML = html;
}

function renderBankList(banks) {
  if (!banks || !banks.length) return '<div class="sa-empty-state"><i class="fas fa-university"></i><p>No bank accounts added yet.</p></div>';
  return '<div class="sa-grid-auto" style="gap:10px;">' + banks.map(function(b, i) {
    return '<div class="sa-bank-row">'
      + '<input type="text" value="' + esc(b.bankName || '') + '" placeholder="Bank name" style="flex:1;min-width:140px;" class="sa-input" onchange="updateSaBank(' + i + ',\'bankName\',this.value)">'
      + '<input type="text" value="' + esc(b.accountName || '') + '" placeholder="Account name" style="flex:1;min-width:140px;" class="sa-input" onchange="updateSaBank(' + i + ',\'accountName\',this.value)">'
      + '<input type="text" value="' + esc(b.accountNumber || '') + '" placeholder="Account number" style="flex:1;min-width:120px;" class="sa-input" onchange="updateSaBank(' + i + ',\'accountNumber\',this.value)">'
      + '<select onchange="updateSaBank(' + i + ',\'currency\',this.value)" class="sa-input" style="width:80px;flex:none;"><option value="NGN"' + (b.currency==='NGN'?' selected':'') + '>NGN</option><option value="USD"' + (b.currency==='USD'?' selected':'') + '>USD</option><option value="GBP"' + (b.currency==='GBP'?' selected':'') + '>GBP</option><option value="EUR"' + (b.currency==='EUR'?' selected':'') + '>EUR</option></select>'
      + '<button class="btn btn-sm btn-danger-outline" onclick="saRemoveBank(' + i + ')" title="Remove" aria-label="Remove"><i class="fas fa-times"></i></button>'
      + '</div>';
  }).join('') + '</div>';
}

function updateSaConfig(field, val) {
  var cfg = getPlatformConfig();
  cfg[field] = val;
  savePlatformConfig(cfg);
}

function updateSaBank(index, field, val) {
  var cfg = getPlatformConfig();
  if (!cfg.bankAccounts) cfg.bankAccounts = [];
  if (!cfg.bankAccounts[index]) cfg.bankAccounts[index] = {};
  cfg.bankAccounts[index][field] = val;
  savePlatformConfig(cfg);
}

function saAddBank() {
  var cfg = getPlatformConfig();
  if (!cfg.bankAccounts) cfg.bankAccounts = [];
  cfg.bankAccounts.push({ bankName: '', accountName: '', accountNumber: '', currency: 'NGN' });
  savePlatformConfig(cfg);
  var list = document.getElementById('saBankList');
  if (list) list.innerHTML = renderBankList(cfg.bankAccounts);
}

function saRemoveBank(index) {
  var cfg = getPlatformConfig();
  if (cfg.bankAccounts) cfg.bankAccounts.splice(index, 1);
  savePlatformConfig(cfg);
  var list = document.getElementById('saBankList');
  if (list) list.innerHTML = renderBankList(cfg.bankAccounts);
}

function updateSaSmtp(field, val) {
  var cfg = getPlatformConfig();
  if (!cfg.smtpConfig) cfg.smtpConfig = {};
  cfg.smtpConfig[field] = val;
  savePlatformConfig(cfg);
}

function saSavePlatform() {
  // Re-read all inputs to make sure changes are captured
  var pn = document.getElementById('saPlatformName');
  var wa = document.getElementById('saWhatsApp');
  var ce = document.getElementById('saContactEmail');
  var cfg = getPlatformConfig();
  if (pn) cfg.platformName = pn.value;
  if (wa) cfg.whatsappNumber = wa.value;
  if (ce) cfg.contactEmail = ce.value;
  savePlatformConfig(cfg);

  // Update chat buttons on the live page
  if (typeof renderChatButtons === 'function') renderChatButtons();
  if (typeof renderLandingPageSections === 'function') renderLandingPageSections();

  saLogActivity('Platform settings updated');
  toast('Platform settings saved!');
}

// ===== 4. Subscription Plans Tab =====
function renderSaSubscriptions(container) {
  var cfg = getPlatformConfig();
  var plans = cfg.subscriptionPlans || [];

  var html = '<div class="sa-section-header">'
    + '<p class="sa-subtitle" style="margin:0;">' + plans.length + ' plan(s) configured</p>'
    + '<button class="btn btn-primary btn-sm" onclick="saAddPlan()"><i class="fas fa-plus"></i> Add Plan</button></div>';

  if (!plans.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-credit-card"></i><p>No subscription plans yet.</p></div>';
  } else {
    html += '<div class="sa-plans-grid">'
      + plans.map(function(p, i) {
        var active = p.active !== false;
        var sym = cfg.currency === 'NGN' ? '&#8358;' : (cfg.currency === 'USD' ? '&#36;' : (cfg.currency === 'GBP' ? '&#163;' : '&#8364;'));
        return '<div class="sa-plan-card' + (!active ? ' inactive' : '') + '">'
          + '<div class="sa-plan-header"><h4>' + esc(p.name) + '</h4><span class="sa-plan-status ' + (active ? 'active' : 'disabled') + '">' + (active ? 'Active' : 'Disabled') + '</span></div>'
          + '<div class="sa-plan-amount">' + (p.interval === 'free' ? 'Free' : sym + formatAmount(p.amount || 0) + ' <span class="sa-plan-interval">/ ' + p.interval + '</span>') + '</div>'
          + '<div class="sa-plan-features">' + esc(p.features || '') + '</div>'
          + '<div class="sa-plan-actions"><button class="btn btn-sm btn-outline" onclick="saEditPlan(' + i + ')"><i class="fas fa-edit"></i> Edit</button>'
          + '<button class="btn btn-sm btn-outline" onclick="saTogglePlan(' + i + ')"><i class="fas ' + (active ? 'fa-pause' : 'fa-play') + '"></i> ' + (active ? 'Disable' : 'Enable') + '</button>'
          + '<button class="btn btn-sm btn-danger-outline" onclick="saDeletePlan(' + i + ')" aria-label="Delete plan"><i class="fas fa-trash"></i></button></div></div>';
      }).join('') + '</div>';
  }

  // Show bank accounts info for payment
  var banks = cfg.bankAccounts || [];
  if (banks.length) {
    html += '<div class="sa-section sa-mt-24"><h3><i class="fas fa-university"></i> Payment Instructions</h3>'
      + '<p class="sa-subtitle">Subscribers will be asked to pay into any of these accounts:</p>'
      + '<div class="sa-sub-row" style="display:grid;gap:8px;padding:0;box-shadow:none;">' + banks.map(function(b) {
        return '<div class="sa-sub-row">'
          + '<span><strong>Bank:</strong> ' + esc(b.bankName) + '</span>'
          + '<span><strong>Name:</strong> ' + esc(b.accountName) + '</span>'
          + '<span><strong>Number:</strong> ' + esc(b.accountNumber) + '</span>'
          + '<span><strong>Currency:</strong> ' + esc(b.currency || 'NGN') + '</span></div>';
      }).join('') + '</div></div>';
  }

  container.innerHTML = html;
}

function formatAmount(n) {
  if (typeof n !== 'number') n = parseFloat(n) || 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function saAddPlan() {
  var cfg = getPlatformConfig();
  if (!cfg.subscriptionPlans) cfg.subscriptionPlans = [];
  cfg.subscriptionPlans.push({ id: 'plan_' + Date.now(), name: 'New Plan', interval: 'monthly', amount: 10000, active: true, features: '' });
  savePlatformConfig(cfg);
  renderSaTab('subscriptions');
  saLogActivity('Added new subscription plan');
}

function saEditPlan(index) {
  var cfg = getPlatformConfig();
  var p = (cfg.subscriptionPlans || [])[index];
  if (!p) return;
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = '<div class="sa-card"><h3><i class="fas fa-edit"></i> Edit Plan</h3>'
    + '<div id="saPlanError" class="sa-error-box"></div>'
    + '<div class="form-group"><label>Plan Name</label><input type="text" id="saEditPlanName" value="' + esc(p.name) + '"></div>'
    + '<div class="form-group"><label>Interval</label><select id="saEditPlanInterval"><option value="free"' + (p.interval==='free'?' selected':'') + '>Free</option><option value="monthly"' + (p.interval==='monthly'?' selected':'') + '>Monthly</option><option value="yearly"' + (p.interval==='yearly'?' selected':'') + '>Yearly</option><option value="one_time"' + (p.interval==='one_time'?' selected':'') + '>One Time</option></select></div>'
    + '<div class="form-group"><label>Amount</label><input type="number" id="saEditPlanAmount" value="' + (p.amount || 0) + '" min="0"></div>'
    + '<div class="form-group"><label>Features Description</label><textarea rows="3" id="saEditPlanFeatures" placeholder="Comma-separated features">' + esc(p.features || '') + '</textarea></div>'
    + '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-success" onclick="saSaveEditPlan(' + index + ')"><i class="fas fa-save"></i> Save</button></div></div>';
  if (overlay) overlay.classList.add('active');
}

function saSaveEditPlan(index) {
  var name = document.getElementById('saEditPlanName')?.value?.trim();
  var interval = document.getElementById('saEditPlanInterval')?.value;
  var amount = parseFloat(document.getElementById('saEditPlanAmount')?.value) || 0;
  var features = document.getElementById('saEditPlanFeatures')?.value?.trim();
  var err = document.getElementById('saPlanError');
  if (!name) { if (err) { err.textContent = 'Plan name is required'; err.style.display = 'block'; } return; }
  if (err) err.style.display = 'none';
  var cfg = getPlatformConfig();
  var p = (cfg.subscriptionPlans || [])[index];
  if (!p) return;
  p.name = name;
  p.interval = interval || 'monthly';
  p.amount = amount;
  p.features = features || '';
  savePlatformConfig(cfg);
  closeModal();
  renderSaTab('subscriptions');
  saLogActivity('Updated plan: ' + name);
  toast('Plan updated!');
}

function saTogglePlan(index) {
  var cfg = getPlatformConfig();
  var p = (cfg.subscriptionPlans || [])[index];
  if (!p) return;
  p.active = p.active === false ? true : false;
  savePlatformConfig(cfg);
  renderSaTab('subscriptions');
  saLogActivity((p.active ? 'Enabled' : 'Disabled') + ' plan: ' + p.name);
}

function saDeletePlan(index) {
  if (!confirm('Delete this subscription plan?')) return;
  var cfg = getPlatformConfig();
  var p = (cfg.subscriptionPlans || [])[index];
  if (!p) return;
  cfg.subscriptionPlans.splice(index, 1);
  savePlatformConfig(cfg);
  renderSaTab('subscriptions');
  saLogActivity('Deleted plan: ' + p.name);
  toast('Plan deleted');
}

// ===== 5. System Tab =====
function renderSaSystem(container) {
  var cfg = getPlatformConfig();
  var settings = cfg.settings || {};
  var tenants = getTenants();

  // Calculate storage
  var totalSize = 0;
  var storageItems = 0;
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
      storageItems++;
    }
  }
  var sizeKB = (totalSize / 1024).toFixed(1);
  var sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  var maxStorageMB = 10;
  var usagePercent = Math.min((parseFloat(sizeMB) / maxStorageMB) * 100, 100);
  var circumference = 2 * Math.PI * 52;
  var dashoffset = circumference - (usagePercent / 100) * circumference;

  var html = ''

    // System grid
    + '<div class="sa-system-grid">'

    // Maintenance card
    + '<div class="sa-system-card">'
    + '<div class="sa-system-card-header">'
    + '<div class="sa-system-card-icon sa-system-card-icon--maintenance"><i class="fas fa-tools"></i></div>'
    + '<div><div class="sa-system-card-title">Maintenance Mode</div><div class="sa-system-card-desc">Control platform availability</div></div>'
    + '</div>'
    + '<div class="sa-toggle-row">'
    + '<div class="sa-toggle-info">'
    + '<div class="sa-toggle-label">Enable Maintenance</div>'
    + '<div class="sa-toggle-desc">Temporarily disable access for all schools</div>'
    + '</div>'
    + '<label class="toggle-switch"><input type="checkbox" ' + (settings.maintenanceMode ? 'checked' : '') + ' onchange="saSetMaintenance(this.checked)"><span class="toggle-slider"></span></label>'
    + '</div>'
    + '<div style="margin-top:16px">'
    + '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:var(--sa-text)">Maintenance Message</label>'
    + '<textarea rows="3" id="saMaintenanceMsg" oninput="saSetMaintenanceMsg(this.value)" style="width:100%;padding:10px 14px;border:2px solid var(--sa-border);border-radius:10px;font-size:13px;font-family:inherit;resize:vertical;transition:border-color .2s;box-sizing:border-box">' + esc(settings.maintenanceMessage || '') + '</textarea>'
    + '</div>'
    + '</div>'

    // Registration card
    + '<div class="sa-system-card">'
    + '<div class="sa-system-card-header">'
    + '<div class="sa-system-card-icon sa-system-card-icon--registration"><i class="fas fa-user-plus"></i></div>'
    + '<div><div class="sa-system-card-title">School Registration</div><div class="sa-system-card-desc">Control new school signups</div></div>'
    + '</div>'
    + '<div class="sa-toggle-row">'
    + '<div class="sa-toggle-info">'
    + '<div class="sa-toggle-label">Allow New Registrations</div>'
    + '<div class="sa-toggle-desc">Let new schools register on the platform</div>'
    + '</div>'
    + '<label class="toggle-switch"><input type="checkbox" ' + (settings.allowSchoolRegistration !== false ? 'checked' : '') + ' onchange="saSetRegistration(this.checked)"><span class="toggle-slider"></span></label>'
    + '</div>'
    + '<div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid var(--sa-border)">'
    + '<div style="font-size:13px;color:var(--sa-text-light);margin-bottom:8px">Quick Stats</div>'
    + '<div style="display:flex;gap:24px">'
    + '<div><div style="font-size:24px;font-weight:700;color:var(--sa-text)">' + tenants.length + '</div><div style="font-size:11px;color:var(--sa-text-light);text-transform:uppercase;letter-spacing:.5px">Schools</div></div>'
    + '<div><div style="font-size:24px;font-weight:700;color:var(--sa-text)">' + (settings.maintenanceMode ? 'ON' : 'OFF') + '</div><div style="font-size:11px;color:var(--sa-text-light);text-transform:uppercase;letter-spacing:.5px">Status</div></div>'
    + '</div>'
    + '</div>'
    + '</div>'

    // Storage card
    + '<div class="sa-system-card">'
    + '<div class="sa-system-card-header">'
    + '<div class="sa-system-card-icon sa-system-card-icon--storage"><i class="fas fa-database"></i></div>'
    + '<div><div class="sa-system-card-title">Storage Usage</div><div class="sa-system-card-desc">localStorage consumption</div></div>'
    + '</div>'
    + '<div class="sa-storage-ring">'
    + '<svg viewBox="0 0 120 120">'
    + '<circle class="track" cx="60" cy="60" r="52"></circle>'
    + '<circle class="fill" cx="60" cy="60" r="52" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + dashoffset + '"></circle>'
    + '</svg>'
    + '<div class="sa-storage-center">'
    + '<div class="sa-storage-center-value">' + usagePercent.toFixed(0) + '%</div>'
    + '<div class="sa-storage-center-label">Used</div>'
    + '</div>'
    + '</div>'
    + '<div class="sa-storage-stats">'
    + '<div class="sa-storage-stat"><div class="sa-storage-stat-value">' + sizeKB + ' KB</div><div class="sa-storage-stat-label">Total Size</div></div>'
    + '<div class="sa-storage-stat"><div class="sa-storage-stat-value">' + storageItems + '</div><div class="sa-storage-stat-label">Keys</div></div>'
    + '</div>'
    + '</div>'

    + '</div>' // end system-grid

    // Danger zone
    + '<div class="sa-danger-card" style="margin-top:20px">'
    + '<div class="sa-danger-card-header">'
    + '<div class="sa-danger-card-icon"><i class="fas fa-exclamation-triangle"></i></div>'
    + '<div><div class="sa-danger-card-title">Danger Zone</div></div>'
    + '</div>'
    + '<div class="sa-danger-card-desc">These actions are irreversible and will permanently delete data. Please ensure you have a backup before proceeding.</div>'
    + '<div class="sa-danger-actions">'
    + '<button class="btn btn-danger-outline" onclick="saClearAllData()"><i class="fas fa-trash-alt"></i> Clear All Data</button>'
    + '<button class="btn btn-danger-outline" onclick="saResetPlatform()"><i class="fas fa-undo"></i> Reset Platform Settings</button>'
    + '</div>'
    + '</div>';

  container.innerHTML = html;

}

function saSetMaintenance(val) {
  var cfg = getPlatformConfig();
  if (!cfg.settings) cfg.settings = {};
  cfg.settings.maintenanceMode = val;
  savePlatformConfig(cfg);
  saLogActivity(val ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  toast(val ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
}

function saSetMaintenanceMsg(val) {
  var cfg = getPlatformConfig();
  if (!cfg.settings) cfg.settings = {};
  cfg.settings.maintenanceMessage = val;
  savePlatformConfig(cfg);
}

function saSetRegistration(val) {
  var cfg = getPlatformConfig();
  if (!cfg.settings) cfg.settings = {};
  cfg.settings.allowSchoolRegistration = val;
  savePlatformConfig(cfg);
  saLogActivity(val ? 'School registration opened' : 'School registration closed');
}

function saClearAllData() {
  if (!confirm('Are you sure? This will delete ALL schools, ALL data, and reset the entire platform. This cannot be undone!')) return;
  if (!confirm('FINAL WARNING: This removes every school and every record. Type "yes" to confirm.')) return;
  var keys = [];
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key) && (key.startsWith('schoolData_') || key === 'eduverse_tenants')) {
      keys.push(key);
    }
  }
  keys.forEach(function(k) { localStorage.removeItem(k); });
  saLogActivity('All school data cleared');
  toast('All school data cleared. ' + keys.length + ' stores removed.');
  renderSaTab('system');
}

function saResetPlatform() {
  if (!confirm('Reset platform settings to defaults? This does not affect school data.')) return;
  savePlatformConfig(getDefaultPlatformConfig());
  toast('Platform settings reset to defaults');
  renderSaTab('platform');
}

// ===== Activity Log =====
function getActivityLog() {
  try {
    var raw = localStorage.getItem('eduverse_activity_log');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saLogActivity(msg) {
  var log = getActivityLog();
  log.unshift({ time: new Date().toLocaleString(), msg: msg });
  if (log.length > 100) log.length = 100;
  localStorage.setItem('eduverse_activity_log', JSON.stringify(log));
}

// ===== Init on load: propagate platform contact info to the landing page =====
// This is called from renderLandingPageSections in schoolprofile.js
function applyPlatformContact() {
  var cfg = getPlatformConfig();
  if (cfg.whatsappNumber || cfg.contactEmail) {
    // Update the floating chat buttons with platform-level contact details
    var wa = document.getElementById('chatWhatsappBtn');
    var em = document.getElementById('chatEmailBtn');
    if (wa && cfg.whatsappNumber) {
      var cleaned = cfg.whatsappNumber.replace(/[\s\-\(\)]/g, '');
      cleaned = cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;
      wa.href = 'https://wa.me/' + encodeURIComponent(cleaned);
      wa.title = 'Chat with us on WhatsApp';
      wa.style.display = 'flex';
    }
    if (em && cfg.contactEmail) {
      em.href = 'mailto:' + cfg.contactEmail;
      em.title = 'Email us at ' + cfg.contactEmail;
      em.style.display = 'flex';
    }
  }
}

// ===== 5. Analytics Tab =====
function renderSaAnalytics(container) {
  var tenants = getTenants();
  var cfg = getPlatformConfig();
  var agg = _aggregateAllSchoolData();
  var sym = cfg.currency === 'NGN' ? '&#8358;' : (cfg.currency === 'USD' ? '&#36;' : (cfg.currency === 'GBP' ? '&#163;' : '&#8364;'));

  // Plan distribution
  var planCounts = {};
  var tierCounts = {};
  tenants.forEach(function(t) {
    planCounts[t.plan] = (planCounts[t.plan] || 0) + 1;
    tierCounts[t.tier] = (tierCounts[t.tier] || 0) + 1;
  });

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var createdByMonth = {};
  tenants.forEach(function(t) {
    var m = new Date(t.createdAt).getMonth();
    createdByMonth[m] = (createdByMonth[m] || 0) + 1;
  });

  var html = '<div class="sa-stats-grid">'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--blue"><i class="fas fa-user-graduate"></i></div><div><div class="sa-stat-value">' + agg.students.total + '</div><div class="sa-stat-label">Total Students</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--amber"><i class="fas fa-chalkboard-teacher"></i></div><div><div class="sa-stat-value">' + agg.teachers.total + '</div><div class="sa-stat-label">Total Teachers</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--indigo"><i class="fas fa-school"></i></div><div><div class="sa-stat-value">' + agg.classes.total + '</div><div class="sa-stat-label">Total Classes</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--pink"><i class="fas fa-money-bill-wave"></i></div><div><div class="sa-stat-value">' + sym + formatAmount(agg.feesCollected.totalAmount) + '</div><div class="sa-stat-label">Fees Collected (' + agg.feesCollected.total + ' txns)</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--amber"><i class="fas fa-layer-group"></i></div><div><div class="sa-stat-value">' + Object.keys(planCounts).length + '</div><div class="sa-stat-label">Plan Types</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--green"><i class="fas fa-tag"></i></div><div><div class="sa-stat-value">' + Object.keys(tierCounts).length + '</div><div class="sa-stat-label">Tier Types</div></div></div>'
    + '</div>';

  // Plan Distribution
  html += '<div class="sa-section"><h3><i class="fas fa-chart-pie"></i> Plan Distribution</h3>'
    + '<div class="sa-chart-bars">'
    + Object.keys(planCounts).sort().map(function(p) {
      var pct = Math.round((planCounts[p] / tenants.length) * 100) || 0;
      return '<div class="sa-bar-row"><span class="sa-bar-label">' + esc(p.charAt(0).toUpperCase() + p.slice(1)) + '</span>'
        + '<div class="sa-bar-track"><div class="sa-bar-fill" style="width:' + pct + '%;background:' + (p==='basic'?'#60a5fa':p==='standard'?'#34d399':p==='premium'?'#f59e0b':p==='enterprise'?'#a78bfa':'#94a3b8') + '"></div></div>'
        + '<span class="sa-bar-count">' + planCounts[p] + ' (' + pct + '%)</span></div>';
    }).join('') + '</div></div>';

  // Tier Distribution
  html += '<div class="sa-section"><h3><i class="fas fa-school"></i> Tier Distribution</h3>'
    + '<div class="sa-chart-bars">'
    + Object.keys(tierCounts).sort().map(function(t) {
      var pct = Math.round((tierCounts[t] / tenants.length) * 100) || 0;
      var label = { full_k12:'Full K-12', eccde:'Nursery', primary:'Primary', secondary:'Secondary' }[t] || t;
      return '<div class="sa-bar-row"><span class="sa-bar-label">' + label + '</span>'
        + '<div class="sa-bar-track"><div class="sa-bar-fill" style="width:' + pct + '%;background:#818cf8;"></div></div>'
        + '<span class="sa-bar-count">' + tierCounts[t] + ' (' + pct + '%)</span></div>';
    }).join('') + '</div></div>';

  // Schools created by month
  html += '<div class="sa-section"><h3><i class="fas fa-chart-line"></i> Schools Created (by month)</h3>'
    + '<div class="sa-chart-bars">'
    + months.map(function(m, i) {
      var cnt = createdByMonth[i] || 0;
      var max = Math.max.apply(null, Object.values(createdByMonth).concat([1]));
      var pct = Math.round((cnt / max) * 100) || 0;
      return '<div class="sa-bar-row"><span class="sa-bar-label" style="min-width:40px;">' + m + '</span>'
        + '<div class="sa-bar-track"><div class="sa-bar-fill" style="width:' + pct + '%;background:linear-gradient(90deg,#667eea,#764ba2);"></div></div>'
        + '<span class="sa-bar-count">' + cnt + '</span></div>';
    }).join('') + '</div></div>';

  // Cross-school benchmarks table
  html += '<div class="sa-section"><h3><i class="fas fa-table"></i> Cross-School Benchmarks</h3>';
  if (!agg.schools.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-database"></i><p>No school data loaded.</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Students</th><th>Teachers</th><th>Classes</th><th>Subjects</th><th>Fees Collected</th><th>Storage</th></tr></thead><tbody>'
      + agg.schools.slice().sort(function(a, b) { return b.studentCount - a.studentCount; }).map(function(s) {
        return '<tr><td><strong>' + esc(s.name) + '</strong></td>'
          + '<td>' + s.studentCount + '</td>'
          + '<td>' + s.teacherCount + '</td>'
          + '<td>' + s.classCount + '</td>'
          + '<td>' + s.subjectCount + '</td>'
          + '<td>' + sym + formatAmount(s.feeCollectedAmount) + '</td>'
          + '<td>' + s.storageKB + ' KB</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  html += '</div>';

  // Recent schools list
  var recent = tenants.slice().sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 5);
  html += '<div class="sa-section"><h3><i class="fas fa-clock"></i> Recently Created Schools</h3>'
    + (recent.length ? '<div class="sa-recent-list">' + recent.map(function(t) {
      return '<div class="sa-recent-item"><span>' + esc(t.name) + '</span><span class="sa-recent-meta">' + new Date(t.createdAt).toLocaleDateString() + ' — ' + esc(t.plan) + '</span></div>';
    }).join('') + '</div>' : '<p class="empty-state">No schools yet.</p>')
    + '</div>';

  container.innerHTML = html;
}

// ===== 6. Broadcast Tab =====
function renderSaBroadcast(container) {
  var html = '<div class="sa-settings-form">'
    + '<div class="sa-section"><h3><i class="fas fa-bullhorn"></i> Broadcast to All Schools</h3>'
    + '<p class="sa-subtitle">Send an announcement or notification to every school on the platform. The message will appear in their admin dashboard.</p>'
    + '<div id="saBroadcastError" class="sa-error-box"></div>'
    + '<div class="form-group"><label>Subject</label><input type="text" id="saBroadcastSubject" placeholder="e.g. Platform Maintenance Notice"></div>'
    + '<div class="form-group"><label>Message</label><textarea rows="6" id="saBroadcastMsg" placeholder="Type your message to all schools..."></textarea></div>'
    + '<div class="form-group"><label>Priority</label><select id="saBroadcastPriority"><option value="info">Info</option><option value="warning">Warning</option><option value="urgent">Urgent</option></select></div>'
    + '<button class="btn btn-primary" onclick="saSendBroadcast()"><i class="fas fa-paper-plane"></i> Send to All Schools</button>'
    + '<p id="saBroadcastResult" class="sa-text-small sa-mt-12"></p>'
    + '</div>'

    // Broadcast history
    + '<div class="sa-section"><h3><i class="fas fa-history"></i> Broadcast History</h3>'
    + '<div id="saBroadcastHistory">' + renderBroadcastHistory() + '</div></div>'
    + '</div>';

  container.innerHTML = html;
}

function renderBroadcastHistory() {
  var history = getBroadcastHistory();
  if (!history.length) return '<div class="sa-empty-state"><i class="fas fa-history"></i><p>No broadcasts sent yet.</p></div>';
  var colors = { info: '#3b82f6', warning: '#f59e0b', urgent: '#ef4444' };
  return '<div>' + history.map(function(b) {
    return '<div class="sa-mb-8" style="padding:12px;border-left:4px solid ' + (colors[b.priority] || '#3b82f6') + ';background:#f8fafc;border-radius:6px;">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">'
      + '<strong>' + esc(b.subject) + '</strong>'
      + '<span class="sa-text-small">' + new Date(b.sentAt).toLocaleString() + '</span></div>'
      + '<p class="sa-subtitle" style="margin:0;">' + esc(b.message) + '</p></div>';
  }).join('') + '</div>';
}

function getBroadcastHistory() {
  try {
    var cfg = getPlatformConfig();
    return cfg.broadcastHistory || [];
  } catch(e) { return []; }
}

function saSendBroadcast() {
  var subject = document.getElementById('saBroadcastSubject')?.value?.trim();
  var msg = document.getElementById('saBroadcastMsg')?.value?.trim();
  var priority = document.getElementById('saBroadcastPriority')?.value || 'info';
  var err = document.getElementById('saBroadcastError');

  if (!subject || !msg) {
    if (err) { err.textContent = 'Please fill in both subject and message'; err.style.display = 'block'; }
    return;
  }
  if (err) err.style.display = 'none';

  // Save to each school's data
  var tenants = getTenants();
  var delivered = 0;
  tenants.forEach(function(t) {
    try {
      var key = getTenantDataKey(t.id);
      var raw = localStorage.getItem(key);
      if (raw) {
        var d = JSON.parse(raw);
        if (!d.broadcasts) d.broadcasts = [];
        d.broadcasts.push({ id: Date.now() + '_' + t.id, subject: subject, message: msg, priority: priority, sentAt: new Date().toISOString(), read: false });
        localStorage.setItem(key, JSON.stringify(d));
        delivered++;
      }
    } catch(e) {}
  });

  // Save to broadcast history
  var cfg = getPlatformConfig();
  if (!cfg.broadcastHistory) cfg.broadcastHistory = [];
  cfg.broadcastHistory.unshift({ subject: subject, message: msg, priority: priority, sentAt: new Date().toLocaleString(), deliveredTo: delivered });
  if (cfg.broadcastHistory.length > 50) cfg.broadcastHistory.length = 50;
  savePlatformConfig(cfg);

  saLogActivity('Broadcast sent: "' + subject + '" to ' + delivered + ' schools');

  var result = document.getElementById('saBroadcastResult');
  if (result) {
    result.innerHTML = '<span style="color:var(--sa-green);"><i class="fas fa-check-circle"></i> Message sent to <strong>' + delivered + '</strong> school(s)</span>';
    result.style.color = 'var(--sa-green)';
  }
  document.getElementById('saBroadcastSubject').value = '';
  document.getElementById('saBroadcastMsg').value = '';
  var history = document.getElementById('saBroadcastHistory');
  if (history) history.innerHTML = renderBroadcastHistory();
  toast('Broadcast sent to ' + delivered + ' schools!');
}

// ===== 7. Backup & Data Tab =====
function renderSaBackup(container) {
  var tenants = getTenants();

  var html = ''
    // Hero banner
    + '<div class="sa-backup-hero">'
    + '<h3><i class="fas fa-shield-alt"></i> Backup & Data Management</h3>'
    + '<p>Export, restore, and inspect your school data. Backups include all schools, platform settings, and admin accounts.</p>'
    + '</div>'

    // Action cards
    + '<div class="sa-backup-cards">'

    // Export card
    + '<div class="sa-backup-card">'
    + '<div class="sa-backup-card-header">'
    + '<div class="sa-backup-card-icon sa-backup-card-icon--export"><i class="fas fa-cloud-upload-alt"></i></div>'
    + '<div><div class="sa-backup-card-title">Export Backup</div><div class="sa-backup-card-subtitle">Download all platform data</div></div>'
    + '</div>'
    + '<div class="sa-backup-card-body">'
    + '<p>Create a complete JSON backup of all schools, platform settings, subscription plans, and super admin account.</p>'
    + '<button class="btn btn-primary" onclick="saExportAll()"><i class="fas fa-download"></i> Export Full Backup</button>'
    + '</div></div>'

    // Import card
    + '<div class="sa-backup-card">'
    + '<div class="sa-backup-card-header">'
    + '<div class="sa-backup-card-icon sa-backup-card-icon--import"><i class="fas fa-cloud-download-alt"></i></div>'
    + '<div><div class="sa-backup-card-title">Restore Backup</div><div class="sa-backup-card-subtitle">Import from a backup file</div></div>'
    + '</div>'
    + '<div class="sa-backup-card-body">'
    + '<p>Restore from a previously exported backup. This will <strong>overwrite</strong> all current data including schools and settings.</p>'
    + '<input type="file" accept=".json" id="saRestoreFile" class="sa-backup-file-input" onchange="this.nextElementSibling.textContent=this.files[0]?this.files[0].name:\'Choose backup file...\';this.nextElementSibling.classList.remove(\'btn-outline\');this.nextElementSibling.classList.add(\'btn-primary\')">'
    + '<button class="btn btn-outline" onclick="saImportBackup()"><i class="fas fa-upload"></i> Choose backup file...</button>'
    + '<div id="saRestoreResult" class="sa-backup-result"></div>'
    + '</div></div>'

    // Inspector card
    + '<div class="sa-backup-card">'
    + '<div class="sa-backup-card-header">'
    + '<div class="sa-backup-card-icon sa-backup-card-icon--inspect"><i class="fas fa-search"></i></div>'
    + '<div><div class="sa-backup-card-title">Data Inspector</div><div class="sa-backup-card-subtitle">Browse school data</div></div>'
    + '</div>'
    + '<div class="sa-backup-card-body">'
    + '<p>Select a school to inspect its stored data including students, teachers, classes, and more.</p>'
    + '<select id="saDataInspectorSchool" class="sa-inspector-select" onchange="saInspectSchool()">'
    + '<option value="">-- Select a school --</option>'
    + tenants.map(function(t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('')
    + '</select>'
    + '<div id="saDataInspectorResult"></div>'
    + '</div></div>'

    + '</div>';

  container.innerHTML = html;
}

function saExportAll() {
  var exportData = {
    exportedAt: new Date().toISOString(),
    platform: getPlatformConfig(),
    superAdmin: getSuperAdmin(),
    tenants: getTenants(),
    schools: {}
  };
  getTenants().forEach(function(t) {
    try {
      var raw = localStorage.getItem(getTenantDataKey(t.id));
      if (raw) exportData.schools[t.id] = JSON.parse(raw);
    } catch(e) {}
  });

  var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'eduverse_backup_' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  saLogActivity('Full backup exported');
  toast('Backup downloaded!');
}

function saImportBackup() {
  var fileInput = document.getElementById('saRestoreFile');
  var result = document.getElementById('saRestoreResult');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    if (result) { result.className = 'sa-backup-result error'; result.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select a backup file first.'; }
    return;
  }
  if (!confirm('This will OVERWRITE all current schools and platform settings. Are you sure?')) return;
  if (!confirm('FINAL WARNING: This replaces ALL data. Proceed?')) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (!data.tenants || !data.platform) {
        if (result) { result.className = 'sa-backup-result error'; result.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid backup file format.'; }
        return;
      }

      // Restore platform config
      savePlatformConfig(data.platform);

      // Restore super admin
      if (data.superAdmin) localStorage.setItem('eduverse_super_admin', JSON.stringify(data.superAdmin));

      // Restore tenants
      localStorage.setItem('eduverse_tenants', JSON.stringify(data.tenants));

      // Restore individual school data
      var restored = 0;
      Object.keys(data.schools || {}).forEach(function(schoolId) {
        localStorage.setItem(getTenantDataKey(schoolId), JSON.stringify(data.schools[schoolId]));
        restored++;
      });

      if (result) { result.className = 'sa-backup-result success'; result.innerHTML = '<i class="fas fa-check-circle"></i> Restored ' + data.tenants.length + ' schools and ' + restored + ' school data stores.'; }
      saLogActivity('Full backup restored: ' + data.tenants.length + ' schools');
      toast('Backup restored successfully!');
      switchSaTab('overview');
    } catch(err) {
      if (result) { result.className = 'sa-backup-result error'; result.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error: ' + err.message; }
    }
  };
  reader.readAsText(fileInput.files[0]);
}

function saInspectSchool() {
  var sel = document.getElementById('saDataInspectorSchool');
  var result = document.getElementById('saDataInspectorResult');
  if (!sel || !result) return;
  var id = sel.value;
  if (!id) { result.innerHTML = ''; return; }
  try {
    var raw = localStorage.getItem(getTenantDataKey(id));
    if (!raw) { result.innerHTML = '<div class="sa-empty-state" style="padding:24px 8px;"><i class="fas fa-folder-open"></i><p>No data found for this school.</p></div>'; return; }
    var d = JSON.parse(raw);
    var counts = {
      students: (d.students || []).length,
      teachers: (d.teachers || []).length,
      admins: (d.admins || []).length,
      classes: (d.classes || []).length,
      subjects: (d.subjects || []).length,
      fees: (d.fees || []).length,
      results: (d.results || []).length,
      exams: (d.exams || []).length,
      assignments: (d.assignments || []).length
    };
    var storageSize = (raw.length / 1024).toFixed(1) + ' KB';

    result.innerHTML = '<div class="sa-inspector-grid">'
      + Object.keys(counts).map(function(k) {
        return '<div class="sa-inspector-stat">'
          + '<div class="sa-inspector-stat-value">' + counts[k] + '</div>'
          + '<div class="sa-inspector-stat-label">' + k.charAt(0).toUpperCase() + k.slice(1) + '</div></div>';
      }).join('') + '</div>'
      + '<div class="sa-inspector-meta">'
      + '<span><strong>School:</strong> ' + esc(d.schoolName || 'N/A') + '</span>'
      + '<span><strong>Term:</strong> ' + esc(d.currentTerm || 'N/A') + '</span>'
      + '<span><strong>Storage:</strong> ' + storageSize + '</span>'
      + '</div>'
      + '<button class="btn btn-sm btn-outline sa-mt-12" onclick="saViewRawData(\'' + id + '\')"><i class="fas fa-code"></i> View Raw JSON</button>';
  } catch(e) {
    result.innerHTML = '<div class="sa-backup-result error"><i class="fas fa-exclamation-circle"></i> Error reading data: ' + e.message + '</div>';
  }
}

function saViewRawData(id) {
  try {
    var raw = localStorage.getItem(getTenantDataKey(id));
    if (!raw) { toast('No data found'); return; }
    var formatted = JSON.stringify(JSON.parse(raw), null, 2);
    var overlay = document.getElementById('modalOverlay');
    var body = document.getElementById('modalBody');
    if (!body) return;
    body.innerHTML = '<div class="sa-card" style="max-width:800px;"><div class="sa-section-header" style="margin-bottom:12px;">'
      + '<h3 style="margin:0;"><i class="fas fa-code"></i> Raw School Data</h3>'
      + '<button class="btn btn-sm btn-outline" onclick="closeModal()"><i class="fas fa-times"></i> Close</button></div>'
      + '<div class="sa-code-block">' + esc(formatted) + '</div></div>';
    if (overlay) overlay.classList.add('active');
  } catch(e) { toast('Error: ' + e.message); }
}

// ===== Revenue Tab =====
function renderSaRevenue(container) {
  var cfg = getPlatformConfig();
  var records = cfg.revenueRecords || [];
  var tenants = getTenants();
  var agg = _aggregateAllSchoolData();
  var sym = cfg.currency === 'NGN' ? '&#8358;' : (cfg.currency === 'USD' ? '&#36;' : (cfg.currency === 'GBP' ? '&#163;' : '&#8364;'));

  // Aggregate subscription payments by plan
  var planRevenue = {};
  var totalSubscriptionRevenue = 0;
  records.forEach(function(r) {
    var amt = parseFloat(r.amount) || 0;
    totalSubscriptionRevenue += amt;
    planRevenue[r.plan] = (planRevenue[r.plan] || 0) + amt;
  });

  // Count paid schools
  var paidSchools = {};
  records.forEach(function(r) { paidSchools[r.schoolId] = true; });

  var combinedRevenue = totalSubscriptionRevenue + agg.feesCollected.totalAmount;

  var html = '<div class="sa-stats-grid">'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--green"><i class="fas fa-money-bill-wave"></i></div><div><div class="sa-stat-value">' + sym + formatAmount(combinedRevenue) + '</div><div class="sa-stat-label">Combined Revenue</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--blue"><i class="fas fa-users"></i></div><div><div class="sa-stat-value">' + sym + formatAmount(agg.feesCollected.totalAmount) + '</div><div class="sa-stat-label">School Fee Collections</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--amber"><i class="fas fa-credit-card"></i></div><div><div class="sa-stat-value">' + sym + formatAmount(totalSubscriptionRevenue) + '</div><div class="sa-stat-label">Subscription Payments</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--pink"><i class="fas fa-receipt"></i></div><div><div class="sa-stat-value">' + agg.feesCollected.total + ' txns</div><div class="sa-stat-label">Fee Transactions</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--blue"><i class="fas fa-school"></i></div><div><div class="sa-stat-value">' + Object.keys(paidSchools).length + '</div><div class="sa-stat-label">Paying Schools (Sub)</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--indigo"><i class="fas fa-receipt"></i></div><div><div class="sa-stat-value">' + records.length + '</div><div class="sa-stat-label">Subscription Transactions</div></div></div>'
    + '</div>';

  // Fee collections by school (from actual student fees)
  html += '<div class="sa-section"><h3><i class="fas fa-file-invoice-dollar"></i> Fee Collections by School</h3>';
  if (!agg.schools.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-database"></i><p>No school data loaded.</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>School</th><th>Fee Records</th><th>Paid Transactions</th><th>Total Collected</th><th>Avg per Fee</th></tr></thead><tbody>'
      + agg.schools.slice().sort(function(a, b) { return b.feeCollectedAmount - a.feeCollectedAmount; }).map(function(s) {
        var avg = s.feeCollectedCount ? (s.feeCollectedAmount / s.feeCollectedCount) : 0;
        return '<tr><td><strong>' + esc(s.name) + '</strong></td>'
          + '<td>' + s.feeCount + '</td>'
          + '<td>' + s.feeCollectedCount + '</td>'
          + '<td><strong>' + sym + formatAmount(s.feeCollectedAmount) + '</strong></td>'
          + '<td>' + sym + formatAmount(avg) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  html += '</div>';

  // Record a subscription payment
  html += '<div class="sa-section"><h3><i class="fas fa-plus-circle"></i> Record a Subscription Payment</h3>'
    + '<div id="saRevError" class="sa-error-box"></div>'
    + '<div class="sa-grid-auto">'
    + '<div class="form-group"><label>School</label><select id="saRevSchool"><option value="">-- Select --</option>'
    + tenants.map(function(t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('')
    + '</select></div>'
    + '<div class="form-group"><label>Plan</label><select id="saRevPlan"><option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></div>'
    + '<div class="form-group"><label>Amount (' + cfg.currency + ')</label><input type="number" id="saRevAmount" min="0" step="0.01"></div>'
    + '<div class="form-group"><label>Payment Method</label><select id="saRevMethod"><option value="bank_transfer">Bank Transfer</option><option value="online">Online Gateway</option><option value="cash">Cash</option><option value="cheque">Cheque</option></select></div>'
    + '</div>'
    + '<button class="btn btn-primary sa-mt-8" onclick="saRecordPayment()"><i class="fas fa-check"></i> Record Payment</button>'
    + '</div>';

  // Subscription payment history
  html += '<div class="sa-section"><h3><i class="fas fa-list"></i> Subscription Payment History (' + records.length + ')</h3>';
  if (!records.length) {
    html += '<div class="sa-empty-state"><i class="fas fa-receipt"></i><p>No subscription payments recorded yet.</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>Date</th><th>School</th><th>Plan</th><th>Amount</th><th>Method</th><th>Ref</th></tr></thead><tbody>'
      + records.slice().reverse().map(function(r) {
        var t = tenants.find(function(x) { return x.id === r.schoolId; });
        return '<tr><td>' + esc(r.date || '') + '</td><td>' + esc(t ? t.name : 'Unknown') + '</td><td>' + esc(r.plan || '') + '</td>'
          + '<td><strong>' + sym + formatAmount(r.amount) + '</strong></td><td>' + esc(r.method || '') + '</td><td class="sa-text-small">' + esc(r.ref || '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function saRecordPayment() {
  var schoolId = document.getElementById('saRevSchool')?.value;
  var plan = document.getElementById('saRevPlan')?.value;
  var amount = parseFloat(document.getElementById('saRevAmount')?.value) || 0;
  var method = document.getElementById('saRevMethod')?.value || 'bank_transfer';
  var err = document.getElementById('saRevError');

  if (!schoolId || amount <= 0) {
    if (err) { err.textContent = 'Select a school and enter a valid amount'; err.style.display = 'block'; }
    return;
  }
  if (err) err.style.display = 'none';

  var cfg = getPlatformConfig();
  if (!cfg.revenueRecords) cfg.revenueRecords = [];
  cfg.revenueRecords.push({
    schoolId: schoolId, plan: plan, amount: amount, method: method,
    date: new Date().toLocaleDateString(), ref: 'PAY-' + Date.now().toString(36).toUpperCase(),
    recordedBy: (getSuperAdmin() || {}).name || 'Super Admin'
  });
  savePlatformConfig(cfg);

  // Update the school's subscription plan
  try {
    var key = getTenantDataKey(schoolId);
    var raw = localStorage.getItem(key);
    if (raw) {
      var d = JSON.parse(raw);
      d.subscription = d.subscription || {};
      d.subscription.plan = plan;
      d.subscription.status = 'active';
      d.subscription.lastPaymentDate = new Date().toISOString();
      d.subscription.lastPaymentRef = 'PAY-' + Date.now().toString(36).toUpperCase();
      localStorage.setItem(key, JSON.stringify(d));
    }
  } catch(e) {}

  saLogActivity('Payment recorded: ' + formatAmount(amount) + ' for school ' + schoolId);
  document.getElementById('saRevAmount').value = '';
  renderSaRevenue(document.getElementById('saContent'));
  toast('Payment recorded successfully!');
}

// ===== Support Tickets Tab =====
function renderSaTickets(container) {
  var tenants = getTenants();

  // Collect all tickets from all schools
  var allTickets = [];
  var tenantMap = {};
  tenants.forEach(function(t) {
    tenantMap[t.id] = t.name;
    try {
      var raw = localStorage.getItem(getTenantDataKey(t.id));
      if (raw) {
        var d = JSON.parse(raw);
        var tickets = d.supportTickets || [];
        tickets.forEach(function(tk) {
          allTickets.push({ schoolId: t.id, schoolName: t.name, ticket: tk });
        });
      }
    } catch(e) {}
  });

  // Sort by date descending
  allTickets.sort(function(a, b) { return new Date(b.ticket.createdAt) - new Date(a.ticket.createdAt); });

  var openCount = allTickets.filter(function(x) { return x.ticket.status === 'open' || x.ticket.status === 'pending'; }).length;
  var closedCount = allTickets.filter(function(x) { return x.ticket.status === 'closed'; }).length;

  var html = '<div class="sa-stats-grid">'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--red"><i class="fas fa-ticket-alt"></i></div><div><div class="sa-stat-value">' + openCount + '</div><div class="sa-stat-label">Open Tickets</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--green"><i class="fas fa-check-circle"></i></div><div><div class="sa-stat-value">' + closedCount + '</div><div class="sa-stat-label">Closed</div></div></div>'
    + '<div class="sa-stat-card"><div class="sa-stat-icon sa-stat-icon--blue"><i class="fas fa-school"></i></div><div><div class="sa-stat-value">' + allTickets.length + '</div><div class="sa-stat-label">Total</div></div></div>'
    + '</div>';

  html += '<div class="sa-section"><h3><i class="fas fa-list"></i> All Tickets</h3>';
  if (!allTickets.length) {
    html += '<p class="empty-state" style="margin:0;padding:12px;">No support tickets from any school yet.</p>';
  } else {
    html += allTickets.map(function(item) {
      var tk = item.ticket;
      var statusCls = tk.status === 'closed' ? 'sa-badge--green' : (tk.status === 'pending' ? 'sa-badge--amber' : 'sa-badge--red');
      return '<div class="sa-ticket">'
        + '<div class="sa-ticket-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\'">'
        + '<div><strong>' + esc(tk.subject || 'No subject') + '</strong><br><span class="sa-ticket-date">from ' + esc(item.schoolName) + ' &middot; ' + esc(tk.createdAt || '') + '</span></div>'
        + '<span class="sa-ticket-status ' + statusCls + '">' + esc(tk.status || 'open') + '</span></div>'
        + '<div class="sa-ticket-body">'
        + '<p class="sa-ticket-text">' + esc(tk.message || '') + '</p>'
        + (tk.status !== 'closed' ? '<div class="sa-ticket-reply"><textarea rows="2" id="saTicketReply_' + tk.id + '" placeholder="Type your response..."></textarea>'
          + '<button class="btn btn-sm btn-primary" onclick="saRespondTicket(\'' + item.schoolId + '\',\'' + tk.id + '\')"><i class="fas fa-reply"></i> Reply &amp; Close</button></div>' : '')
        + (tk.response ? '<div class="sa-ticket-response"><strong>Response:</strong> ' + esc(tk.response) + '</div>' : '')
        + '</div></div>';
    }).join('');
  }
  html += '</div>';

  container.innerHTML = html;
}

function saRespondTicket(schoolId, ticketId) {
  var reply = document.getElementById('saTicketReply_' + ticketId)?.value?.trim();
  if (!reply) { toast('Please type a response before closing.'); return; }
  try {
    var key = getTenantDataKey(schoolId);
    var raw = localStorage.getItem(key);
    if (!raw) return;
    var d = JSON.parse(raw);
    if (!d.supportTickets) d.supportTickets = [];
    var tk = d.supportTickets.find(function(x) { return x.id === ticketId; });
    if (tk) {
      tk.status = 'closed';
      tk.response = reply;
      tk.respondedAt = new Date().toLocaleString();
      localStorage.setItem(key, JSON.stringify(d));
      saLogActivity('Closed ticket: ' + tk.subject + ' from ' + schoolId);
      toast('Ticket closed! School admin can view the response.');
      renderSaTickets(document.getElementById('saContent'));
    }
  } catch(e) { toast('Error: ' + e.message); }
}

// ===== Global Feature Flags Tab =====
function renderSaFeatures(container) {
  var cfg = getPlatformConfig();
  var flags = cfg.globalFeatureFlags || {};

  var featureLabels = {
    examSimulation: 'Exam Simulation',
    aiTools: 'AI Tools',
    activityGames: 'Activity Games',
    alumni: 'Alumni Portal',
    hostel: 'Hostel Management',
    library: 'Library',
    transport: 'Transport',
    health: 'Health Records',
    chat: 'Chat / Community',
    gallery: 'Gallery',
    reportBuilder: 'Report Builder',
    idCards: 'ID Cards',
    handwritingOcr: 'Handwriting OCR',
    paymentGateway: 'Payment Gateway',
    eschool: 'E-School',
    gradebook: 'Gradebook'
  };

  var html = '<div class="sa-section"><h3><i class="fas fa-toggle-on"></i> Global Feature Toggles</h3>'
    + '<p class="sa-subtitle">Toggle features ON/OFF for ALL schools at once. Disabled features will be hidden from school portals.</p>'
    + '<div class="sa-feature-grid">'
    + Object.keys(featureLabels).map(function(k) {
      var enabled = flags[k] !== false;
      return '<label class="sa-feature-card ' + (enabled ? 'sa-feature-card--on' : 'sa-feature-card--off') + '">'
        + '<input type="checkbox" ' + (enabled ? 'checked' : '') + ' onchange="saToggleGlobalFeature(\'' + k + '\',this.checked)">'
        + '<span class="sa-feature-label">' + featureLabels[k] + '</span>'
        + '<span class="sa-feature-state" style="color:' + (enabled ? 'var(--sa-green)' : '#9ca3af') + ';">' + (enabled ? 'ON' : 'OFF') + '</span></label>';
    }).join('')
    + '</div></div>'

    // Apply to all schools button
    + '<div class="sa-section"><h3><i class="fas fa-sync-alt"></i> Apply Flags to All Schools</h3>'
    + '<p class="sa-subtitle">Pushes the current feature flag settings into each school\'s data so their portals respect the changes.</p>'
    + '<button class="btn btn-primary" onclick="saApplyFeatureFlags()"><i class="fas fa-check-double"></i> Apply to All Schools Now</button>'
    + '<p id="saFeatureResult" class="sa-text-small sa-mt-8"></p>'
    + '</div>'

    // Registration approval toggle
    + '<div class="sa-section"><h3><i class="fas fa-door-open"></i> School Registration</h3>'
    + '<div class="form-row"><label>Require Admin Approval for New Schools</label><label class="toggle-switch"><input type="checkbox" ' + ((cfg.settings||{}).requireApproval ? 'checked' : '') + ' onchange="saSetApproval(this.checked)"><span class="toggle-slider"></span></label></div>'
    + '<p class="field-hint">When enabled, new schools will be marked "pending" and must be approved manually.</p>'
    + '</div>';

  container.innerHTML = html;
}

function saToggleGlobalFeature(key, val) {
  var cfg = getPlatformConfig();
  if (!cfg.globalFeatureFlags) cfg.globalFeatureFlags = {};
  cfg.globalFeatureFlags[key] = val;
  savePlatformConfig(cfg);
}

function saApplyFeatureFlags() {
  var cfg = getPlatformConfig();
  var flags = cfg.globalFeatureFlags || {};
  var tenants = getTenants();
  var updated = 0;

  tenants.forEach(function(t) {
    try {
      var key = getTenantDataKey(t.id);
      var raw = localStorage.getItem(key);
      if (raw) {
        var d = JSON.parse(raw);
        if (!d.schoolProfile) d.schoolProfile = {};
        if (!d.schoolProfile.enableFeatures) d.schoolProfile.enableFeatures = {};
        Object.keys(flags).forEach(function(f) {
          d.schoolProfile.enableFeatures[f] = flags[f];
        });
        localStorage.setItem(key, JSON.stringify(d));
        updated++;
      }
    } catch(e) {}
  });

  saLogActivity('Feature flags applied to ' + updated + ' schools');
  var result = document.getElementById('saFeatureResult');
  if (result) result.innerHTML = '<span style="color:var(--sa-green);"><i class="fas fa-check-circle"></i> Flags applied to ' + updated + ' school(s)</span>';
  toast('Feature flags applied to ' + updated + ' schools!');
}

function saSetApproval(val) {
  var cfg = getPlatformConfig();
  if (!cfg.settings) cfg.settings = {};
  cfg.settings.requireApproval = val;
  savePlatformConfig(cfg);
  saLogActivity(val ? 'School approval required' : 'School approval disabled');
  toast(val ? 'New schools will require approval' : 'Schools can register freely');
}

// ===== Newsletter Subscribers =====
function renderSaNewsletter(content) {
  var subs = [];
  try { subs = JSON.parse(localStorage.getItem('eduverse_newsletter_subscribers') || '[]'); } catch(e) {}
  var html = '<div class="sa-section"><h3><i class="fas fa-envelope-open-text"></i> Newsletter Subscribers</h3>'
    + '<p class="sa-subtitle">Total: <strong>' + subs.length + '</strong> subscriber(s)</p>';
  if (subs.length === 0) {
    html += '<div class="sa-empty-state"><i class="fas fa-inbox"></i><p>No subscribers yet</p></div>';
  } else {
    html += '<div class="sa-table-wrap"><table class="table sa-newsletter-table"><thead><tr><th>#</th>'
      + '<th>Email</th>'
      + '<th>Subscribed At</th></tr></thead><tbody>';
    subs.forEach(function(s, i) {
      html += '<tr><td>' + (i + 1) + '</td>'
        + '<td>' + esc(s.email) + '</td>'
        + '<td>' + (s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : '--') + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '<div class="sa-actions-row sa-mt-16">'
    + '<button class="btn btn-sm btn-primary" onclick="exportNewsletterCsv()"><i class="fas fa-file-csv"></i> Export CSV</button>'
    + '<button class="btn btn-sm btn-outline" onclick="if(confirm(\'Clear all subscribers?\')){localStorage.removeItem(\'eduverse_newsletter_subscribers\');renderSaTab(\'newsletter\');toast(\'Cleared\');}"><i class="fas fa-trash"></i> Clear All</button>'
    + '</div></div>';
  content.innerHTML = html;
}

function exportNewsletterCsv() {
  var subs = [];
  try { subs = JSON.parse(localStorage.getItem('eduverse_newsletter_subscribers') || '[]'); } catch(e) {}
  if (!subs.length) { toast('No subscribers to export'); return; }
  var csv = 'Email,Subscribed At\n';
  subs.forEach(function(s) { csv += '"' + s.email + '","' + (s.subscribedAt || '') + '"\n'; });
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'newsletter-subscribers-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV exported');
}

// ===== Update Schools tab with approval controls + password reset =====
// The schools tab is already rendered by renderSaSchools. 
// Add password reset and approval toggles per school.

// ===== Password Reset Tab =====
function renderSaPasswordReset(container) {
  var tenants = getTenants();
  var html = '<div class="sa-section"><h3><i class="fas fa-key"></i> Password Reset</h3>'
    + '<p class="sa-subtitle">Select a school and user role to view and reset passwords.</p>'
    + '<div class="form-row"><label>Select School</label><select id="saPwSchool" onchange="saPwLoadSchool(this.value)" class="sa-input" style="min-width:250px;">'
    + '<option value="">— Choose a school —</option>';
  tenants.forEach(function(t) {
    html += '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
  });
  html += '</select></div>'
    + '<div id="saPwSchoolData"></div>'
    + '</div>';
  container.innerHTML = html;
}

function saPwLoadSchool(tenantId) {
  var target = document.getElementById('saPwSchoolData');
  if (!target) return;
  if (!tenantId) { target.innerHTML = ''; return; }
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { target.innerHTML = '<p class="empty-state"><i class="fas fa-exclamation-circle"></i><p>No data found for this school.</p></p>'; return; }
    var d = JSON.parse(raw);
    var roles = [
      { id: 'admins', label: 'Admin', icon: 'user-shield' },
      { id: 'teachers', label: 'Teacher', icon: 'chalkboard-teacher' },
      { id: 'students', label: 'Student', icon: 'user-graduate' },
      { id: 'parents', label: 'Parent', icon: 'users' }
    ];
    var html = '<div class="sa-pw-role-tabs">';
    roles.forEach(function(r) {
      var count = (d[r.id] || []).length;
      html += '<button class="btn btn-sm btn-outline" data-pw-role="' + r.id + '" onclick="saPwShowRole(\'' + tenantId + '\',\'' + r.id + '\')"><i class="fas fa-' + r.icon + '"></i> ' + r.label + ' <span class="sa-badge sa-badge--gray">' + count + '</span></button>';
    });
    html += '</div><div id="saPwRoleData"></div>';
    target.innerHTML = html;
    saPwShowRole(tenantId, 'admins');
  } catch(e) { toast('Error loading school data: ' + e.message, 'error'); }
}

function saPwShowRole(tenantId, role) {
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) return;
    var d = JSON.parse(raw);
    var users = d[role] || [];

    document.querySelectorAll('.sa-pw-role-tabs .btn').forEach(function(b) {
      b.className = 'btn btn-sm ' + (b.dataset.pwRole === role ? 'btn-primary' : 'btn-outline');
    });

    var html = '<div class="sa-table-wrap"><table class="table">'
      + '<thead><tr><th>ID</th><th>Name</th><th>Email / Contact</th><th>Username</th><th>Current Password</th><th>Actions</th></tr></thead><tbody>';
    if (users.length) {
      users.forEach(function(u, idx) {
        html += '<tr><td><strong>' + esc(u.id) + '</strong></td>'
          + '<td>' + esc(u.name) + '</td>'
          + '<td>' + esc(u.email || u.contact || '—') + '</td>'
          + '<td>' + esc(u.username || '—') + '</td>'
          + '<td><code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">' + esc(u.password || '—') + '</code></td>'
          + '<td><div style="display:flex;gap:4px;">'
          + '<button class="btn btn-sm btn-primary" onclick="saPwResetUser(\'' + tenantId + '\',\'' + role + '\',\'' + esc(u.id) + '\')"><i class="fas fa-key"></i> Reset</button>'
          + '<button class="btn btn-sm btn-outline" onclick="saPwEditUser(\'' + tenantId + '\',\'' + role + '\',\'' + esc(u.id) + '\')"><i class="fas fa-edit"></i> Edit</button>'
          + '</div></td></tr>';
      });
    } else {
      var emptyMsg = 'No ' + role + ' found.';
      if (role === 'admins') {
        html += '<tr><td colspan="6" class="empty-state" style="padding:30px;text-align:center;color:#718096;">'
          + emptyMsg + '<br><br><button class="btn btn-primary" onclick="saPwCreateAdmin(\'' + tenantId + '\')"><i class="fas fa-user-shield"></i> Create Admin</button>'
          + '</td></tr>';
      } else {
        html += '<tr><td colspan="6" class="empty-state" style="padding:30px;text-align:center;color:#718096;">' + emptyMsg + '</td></tr>';
      }
    }
    html += '</tbody></table></div>';
    document.getElementById('saPwRoleData').innerHTML = html;
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

function saPwResetUser(tenantId, role, userId) {
  var key = getTenantDataKey(tenantId);
  var raw = localStorage.getItem(key);
  if (!raw) { toast('School data not found', 'error'); return; }
  var d = JSON.parse(raw);
  var users = d[role] || [];
  var user = users.find(function(u) { return u.id === userId; });
  if (!user) { toast('User not found', 'error'); return; }

  var html = '<div class="sa-card">'
    + '<h3><i class="fas fa-key"></i> Reset Password</h3>'
    + '<p class="sa-subtitle">'
    + 'Resetting password for <strong>' + esc(user.name) + '</strong> (' + esc(role) + ')</p>'
    + '<div class="form-group"><label>New Password</label>'
    + '<input type="text" id="saPwNewPass" value="' + esc(user.password || '') + '" class="sa-input sa-input--mono"></div>'
    + '<p class="field-hint" style="margin-bottom:16px;">Enter a new password for this user. Minimum 4 characters.</p>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="saPwConfirmReset(\'' + tenantId + '\',\'' + role + '\',\'' + esc(userId) + '\')"><i class="fas fa-save"></i> Save Password</button>'
    + '</div></div>';

  openModal(html);
}

function saPwConfirmReset(tenantId, role, userId) {
  var newPass = document.getElementById('saPwNewPass');
  if (!newPass) return;
  var pass = newPass.value.trim();
  if (!pass || pass.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }

  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { toast('Data not found', 'error'); return; }
    var d = JSON.parse(raw);
    var users = d[role] || [];
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) { toast('User not found', 'error'); return; }

    user.password = pass;
    localStorage.setItem(key, JSON.stringify(d));

    closeModal();
    saLogActivity('Password reset: ' + user.name + ' (' + role + ') in tenant ' + tenantId);
    toast('Password for <strong>' + esc(user.name) + '</strong> has been reset successfully!');
    saPwShowRole(tenantId, role);
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

function saPwCreateAdmin(tenantId) {
  var html = '<div class="sa-card">'
    + '<h3><i class="fas fa-user-shield"></i> Create Admin</h3>'
    + '<p class="sa-subtitle">Create a new administrator for this school.</p>'
    + '<div class="form-group"><label>Full Name *</label><input type="text" id="saPwNewName" placeholder="Admin name" class="sa-input"></div>'
    + '<div class="form-group"><label>Email *</label><input type="email" id="saPwNewEmail" placeholder="admin@school.com" class="sa-input"></div>'
    + '<div class="form-group"><label>Password *</label><input type="text" id="saPwNewPassCreate" value="admin123" class="sa-input sa-input--mono"></div>'
    + '<p class="field-hint" style="margin-bottom:16px;">Minimum 4 characters. The admin can change this later.</p>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-success" onclick="saPwConfirmCreateAdmin(\'' + tenantId + '\')"><i class="fas fa-save"></i> Create Admin</button>'
    + '</div></div>';
  openModal(html);
}

function saPwConfirmCreateAdmin(tenantId) {
  var nameEl = document.getElementById('saPwNewName');
  var emailEl = document.getElementById('saPwNewEmail');
  var passEl = document.getElementById('saPwNewPassCreate');
  if (!nameEl || !emailEl || !passEl) return;
  var name = nameEl.value.trim();
  var email = emailEl.value.trim();
  var pass = passEl.value.trim();
  if (!name || !email || !pass) { toast('Please fill all fields', 'error'); return; }
  if (pass.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { toast('School data not found', 'error'); return; }
    var d = JSON.parse(raw);
    if (!d.admins) d.admins = [];
    // Generate a unique admin ID
    var ids = d.admins.map(function(a) { var n = parseInt(a.id.replace('ADM', ''), 10); return isNaN(n) ? 0 : n; });
    var nextId = 'ADM' + String(Math.max(0, ...ids) + 1).padStart(3, '0');
    d.admins.push({ id: nextId, name: name, email: email, password: pass, role: 'super_admin' });
    localStorage.setItem(key, JSON.stringify(d));
    closeModal();
    saLogActivity('Created admin: ' + name + ' (' + email + ') in tenant ' + tenantId);
    if (typeof window.ensureFirebaseUser === 'function') {
      window.ensureFirebaseUser(email, pass, name, 'admin', tenantId, nextId).catch(function(_err) {});
    }
    toast('Admin <strong>' + esc(name) + '</strong> created successfully!');
    saPwShowRole(tenantId, 'admins');
    // Refresh role badge count
    saPwLoadSchool(tenantId);
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

function saPwEditUser(tenantId, role, userId) {
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { toast('School data not found', 'error'); return; }
    var d = JSON.parse(raw);
    var users = d[role] || [];
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) { toast('User not found', 'error'); return; }

    var html = '<div class="sa-card">'
      + '<h3><i class="fas fa-edit"></i> Edit ' + esc(role.charAt(0).toUpperCase() + role.slice(1)) + '</h3>'
      + '<p class="sa-subtitle">Editing <strong>' + esc(user.name) + '</strong></p>'
      + '<div class="form-group"><label>Name *</label><input type="text" id="saPwEditName" value="' + esc(user.name || '') + '" class="sa-input"></div>'
      + '<div class="form-group"><label>' + (role === 'students' ? 'Contact' : 'Email') + ' *</label><input type="text" id="saPwEditEmail" value="' + esc(user.email || user.contact || '') + '" class="sa-input"></div>'
      + '<div class="form-group"><label>Password</label><input type="text" id="saPwEditPass" value="' + esc(user.password || '') + '" class="sa-input sa-input--mono"></div>'
      + '<p class="field-hint" style="margin-bottom:16px;">Minimum 4 characters for password.</p>'
      + '<div class="modal-actions">'
      + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
      + '<button class="btn btn-primary" onclick="saPwConfirmEditUser(\'' + tenantId + '\',\'' + role + '\',\'' + esc(userId) + '\')"><i class="fas fa-save"></i> Save Changes</button>'
      + '</div></div>';
    openModal(html);
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

function saPwConfirmEditUser(tenantId, role, userId) {
  var nameEl = document.getElementById('saPwEditName');
  var emailEl = document.getElementById('saPwEditEmail');
  var passEl = document.getElementById('saPwEditPass');
  if (!nameEl || !emailEl || !passEl) return;
  var name = nameEl.value.trim();
  var email = emailEl.value.trim();
  var pass = passEl.value.trim();
  if (!name || !email) { toast('Name and email/contact are required', 'error'); return; }
  if (pass && pass.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }
  try {
    var key = getTenantDataKey(tenantId);
    var raw = localStorage.getItem(key);
    if (!raw) { toast('Data not found', 'error'); return; }
    var d = JSON.parse(raw);
    var users = d[role] || [];
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) { toast('User not found', 'error'); return; }

    user.name = name;
    if (role === 'students') { user.contact = email; } else { user.email = email; }
    if (pass) user.password = pass;
    localStorage.setItem(key, JSON.stringify(d));

    closeModal();
    saLogActivity('Edited ' + role.slice(0, -1) + ': ' + name + ' in tenant ' + tenantId);
    toast('User <strong>' + esc(name) + '</strong> updated successfully!');
    saPwShowRole(tenantId, role);
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}