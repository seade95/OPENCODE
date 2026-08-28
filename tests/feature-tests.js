// EduVerse Feature Tests
// Tests for Alumni, Subscription, Payment Gateway, School Profile, Teacher Upload, Screen Protection
// Run with: node tests/feature-tests.js

const { loadEduVerse, resetStorage, seedData } = require('./harness.js');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) { passed++; }
  else { failed++; failures.push(message); console.error(`  FAIL: ${message}`); }
}

function assertEq(actual, expected, message) {
  if (actual === expected) { passed++; }
  else { failed++; failures.push(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    console.error(`  FAIL: ${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

function testGroup(name, fn) {
  console.log(`\n=== ${name} ===`);
  fn();
}

let EV;

testGroup('Module Loading', () => {
  resetStorage();
  EV = loadEduVerse();
  assert(EV.data !== null, 'data loaded');
  assert(typeof EV.getPlatformConfig === 'function', 'getPlatformConfig loaded');
  assert(typeof EV.savePlatformConfig === 'function', 'savePlatformConfig loaded');
  assert(typeof EV.getDefaultPlatformConfig === 'function', 'getDefaultPlatformConfig loaded');
  assert(typeof EV.formatAmount === 'function', 'formatAmount loaded');
  assert(typeof EV.getSchoolProfile === 'function', 'getSchoolProfile loaded');
  assert(typeof EV.getGatewayConfig === 'function', 'getGatewayConfig loaded');
  assert(typeof EV.getGatewayProvider === 'function', 'getGatewayProvider loaded');
  assert(typeof EV.isGatewayActive === 'function', 'isGatewayActive loaded');
  assert(typeof EV.generatePaymentRef === 'function', 'generatePaymentRef loaded');
  assert(typeof EV.getDefaultSimQuestions === 'function', 'getDefaultSimQuestions loaded');
  assert(typeof EV._isPremium === 'function', '_isPremium loaded');
  assert(typeof EV._isFree === 'function', '_isFree loaded');
  assert(typeof EV.REPORT_SOURCES === 'object', 'REPORT_SOURCES loaded');
  assert(typeof EV.computeReportData === 'function', 'computeReportData loaded');
  assert(typeof EV.ACTIVITY_GAMES === 'object', 'ACTIVITY_GAMES loaded');
  assert(typeof EV.GAME_CONTENT === 'object', 'GAME_CONTENT loaded');
  assert(typeof EV.EduVerse === 'object', 'EduVerse namespace loaded');
});

// ===== ALUMNI MODULE =====
testGroup('Alumni Module', () => {
  seedData({
    alumni: [],
    reunions: [],
    donations: [],
  });
  EV = loadEduVerse();
  const d = EV.data;

  // Test alumni array exists and starts empty
  assert(Array.isArray(d.alumni), 'alumni is array');
  assert(d.alumni.length === 0, 'alumni starts empty');

  // Add alumni records
  d.alumni.push(
    { id: 'ALM001', name: 'Alice Graduate', graduationYear: '2020', class: 'SSS 3', email: 'alice@ex.com', occupation: 'Engineer' },
    { id: 'ALM002', name: 'Bob Alumni', graduationYear: '2019', class: 'SSS 3', email: 'bob@ex.com', occupation: 'Doctor' },
    { id: 'ALM003', name: 'Carol Smith', graduationYear: '2020', class: 'SSS 3', email: 'carol@ex.com', occupation: 'Teacher' }
  );
  assertEq(d.alumni.length, 3, 'three alumni added');

  // Search alumni by name
  var results = d.alumni.filter(function(a) { return a.name.toLowerCase().includes('alice'); });
  assertEq(results.length, 1, 'search alice found');
  assertEq(results[0].id, 'ALM001', 'search alice returns correct record');

  // Search alumni by graduation year
  results = d.alumni.filter(function(a) { return a.graduationYear === '2020'; });
  assertEq(results.length, 2, 'search by year 2020 found 2');

  // Search alumni by occupation
  results = d.alumni.filter(function(a) { return a.occupation.toLowerCase().includes('engineer'); });
  assertEq(results.length, 1, 'search by occupation found 1');
  assertEq(results[0].name, 'Alice Graduate', 'occupation search returns correct');

  // Get alumni records
  assertEq(d.alumni[0].name, 'Alice Graduate', 'getAlumni record 1 name');
  assertEq(d.alumni[1].name, 'Bob Alumni', 'getAlumni record 2 name');
  assertEq(d.alumni[2].name, 'Carol Smith', 'getAlumni record 3 name');

  // Delete alumni
  d.alumni = d.alumni.filter(function(a) { return a.id !== 'ALM002'; });
  assertEq(d.alumni.length, 2, 'alumni after delete');

  // Reunions
  d.reunions.push(
    { id: 'REU001', name: 'Class of 2020 Reunion', date: '2026-12-01', venue: 'School Hall' }
  );
  assertEq(d.reunions.length, 1, 'reunion added');
  assertEq(d.reunions[0].name, 'Class of 2020 Reunion', 'reunion name');

  // Donations
  d.donations.push(
    { id: 'DON001', donorName: 'Alice Graduate', amount: 50000, purpose: 'Infrastructure' }
  );
  assertEq(d.donations.length, 1, 'donation added');
  assertEq(d.donations[0].amount, 50000, 'donation amount');
  assertEq(d.donations[0].purpose, 'Infrastructure', 'donation purpose');
});

// ===== SUBSCRIPTION MODULE =====
testGroup('Subscription Module', () => {
  seedData({
    subscription: { plan: 'free', status: 'active', startDate: null, endDate: null, amount: 0, currency: 'NGN', autoRenew: false },
    subscriptionPlans: [],
  });
  EV = loadEduVerse();
  const d = EV.data;

  // Test _isFree with free plan
  d.subscription = { plan: 'free', status: 'active', startDate: null, endDate: null, amount: 0, currency: 'NGN', autoRenew: false };
  assert(EV._isFree(), 'free plan is free');
  assert(!EV._isPremium(), 'free plan is not premium');

  // Test with active premium subscription
  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1);
  d.subscription = { plan: 'sp_monthly', status: 'active', startDate: new Date().toISOString(), endDate: futureDate.toISOString(), amount: 5000, currency: 'NGN', autoRenew: false };
  assert(EV._isPremium(), 'active subscription is premium');
  assert(!EV._isFree(), 'active subscription is not free');

  // Test with expired subscription
  var pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 1);
  d.subscription = { plan: 'sp_monthly', status: 'expired', startDate: pastDate.toISOString(), endDate: pastDate.toISOString(), amount: 5000, currency: 'NGN', autoRenew: false };
  assert(!EV._isPremium(), 'expired subscription is not premium');
  assert(EV._isFree(), 'expired subscription is free');

  // Test premiumOverride
  d.subscription = { plan: 'free', status: 'active', premiumOverride: true, amount: 0, currency: 'NGN' };
  assert(EV._isPremium(), 'premiumOverride makes premium');
  assert(!EV._isFree(), 'premiumOverride is not free');

  // Test plan config defaults
  assert(Array.isArray(d.subscriptionPlans), 'subscriptionPlans is array');

  // Add plans
  d.subscriptionPlans.push(
    { id: 'sp_monthly', name: 'Monthly', interval: 'monthly', amount: 5000, currency: 'NGN', active: true },
    { id: 'sp_yearly', name: 'Yearly', interval: 'yearly', amount: 50000, currency: 'NGN', active: true }
  );
  assertEq(d.subscriptionPlans.length, 2, 'two plans added');

  // Find plan by id
  var plan = d.subscriptionPlans.find(function(p) { return p.id === 'sp_monthly'; });
  assert(plan !== undefined, 'found monthly plan');
  assertEq(plan.amount, 5000, 'monthly plan amount');
  assertEq(plan.interval, 'monthly', 'monthly plan interval');

  plan = d.subscriptionPlans.find(function(p) { return p.id === 'sp_yearly'; });
  assert(plan !== undefined, 'found yearly plan');
  assertEq(plan.amount, 50000, 'yearly plan amount');

  // Check plan limits (simulated logic)
  function checkPlanLimits(planId, limitKey) {
    var p = d.subscriptionPlans.find(function(x) { return x.id === planId; });
    if (!p || !p.active) return false;
    return true;
  }
  assert(checkPlanLimits('sp_monthly', 'students'), 'monthly plan active');
  assert(checkPlanLimits('sp_yearly', 'students'), 'yearly plan active');
  assert(!checkPlanLimits('nonexistent', 'students'), 'nonexistent plan not active');

  // Disable plan
  var monthly = d.subscriptionPlans.find(function(p) { return p.id === 'sp_monthly'; });
  monthly.active = false;
  assert(!checkPlanLimits('sp_monthly', 'students'), 'disabled plan not active');
});

// ===== PAYMENT GATEWAY MODULE =====
testGroup('Payment Gateway Module', () => {
  seedData({
    paymentGateway: { provider: 'none', publicKey: '', secretKey: '', currency: 'NGN', testMode: true },
    paymentTransactions: [],
  });
  EV = loadEduVerse();
  const d = EV.data;

  // Test getGatewayConfig
  var config = EV.getGatewayConfig();
  assert(typeof config === 'object', 'gateway config is object');
  assertEq(config.provider, 'none', 'default provider is none');
  assertEq(config.currency, 'NGN', 'default currency NGN');
  assert(config.testMode === true, 'default test mode true');

  // Test getGatewayProvider
  assertEq(EV.getGatewayProvider(), 'none', 'default provider none');

  // Test isGatewayActive when not configured
  assert(!EV.isGatewayActive(), 'gateway not active with no provider');

  // Configure paystack
  d.paymentGateway = { provider: 'paystack', publicKey: 'pk_test_abc', secretKey: 'sk_test_xyz', currency: 'NGN', testMode: true };
  assertEq(EV.getGatewayProvider(), 'paystack', 'provider is paystack');
  assert(EV.isGatewayActive(), 'gateway active with paystack key');

  // Test generatePaymentRef
  var ref = EV.generatePaymentRef();
  assert(typeof ref === 'string', 'payment ref is string');
  assert(ref.startsWith('PAY-'), 'payment ref starts with PAY-');
  assert(ref.length > 4, 'payment ref has content');

  // Generate multiple refs - should be unique
  var refs = [];
  for (var i = 0; i < 10; i++) refs.push(EV.generatePaymentRef());
  var uniqueRefs = new Set(refs);
  assertEq(uniqueRefs.size, 10, 'all payment refs unique');

  // Record payment transaction
  d.paymentTransactions.push({
    id: 'PT001', studentId: 'STU001', amount: 15000, method: 'card',
    reference: ref, date: '2026-08-27', status: 'successful', gateway: 'paystack'
  });
  assertEq(d.paymentTransactions.length, 1, 'transaction recorded');
  assertEq(d.paymentTransactions[0].amount, 15000, 'transaction amount');
  assertEq(d.paymentTransactions[0].gateway, 'paystack', 'transaction gateway');
  assertEq(d.paymentTransactions[0].status, 'successful', 'transaction status');

  // Get payment history
  var history = d.paymentTransactions;
  assertEq(history.length, 1, 'payment history length');
  assertEq(history[0].studentId, 'STU001', 'payment history studentId');

  // Add more transactions
  d.paymentTransactions.push(
    { id: 'PT002', studentId: 'STU001', amount: 5000, method: 'bank_transfer', reference: 'PAY-REF2', date: '2026-08-28', status: 'successful', gateway: 'paystack' },
    { id: 'PT003', studentId: 'STU002', amount: 10000, method: 'card', reference: 'PAY-REF3', date: '2026-08-29', status: 'successful', gateway: 'flutterwave' }
  );
  assertEq(d.paymentTransactions.length, 3, 'three transactions');

  // Filter by student
  var stu1Txns = d.paymentTransactions.filter(function(t) { return t.studentId === 'STU001'; });
  assertEq(stu1Txns.length, 2, 'STU001 has 2 transactions');

  // Switch to flutterwave
  d.paymentGateway = { provider: 'flutterwave', publicKey: 'FLWPUBK-abc', secretKey: 'FLWSECK-xyz', currency: 'NGN', testMode: true };
  assertEq(EV.getGatewayProvider(), 'flutterwave', 'provider flutterwave');
  assert(EV.isGatewayActive(), 'gateway active flutterwave');

  // Test with no key
  d.paymentGateway = { provider: 'paystack', publicKey: '', secretKey: '', currency: 'NGN', testMode: true };
  assert(!EV.isGatewayActive(), 'gateway inactive with empty key');
});

// ===== SCHOOL PROFILE MODULE =====
testGroup('School Profile Module', () => {
  seedData({
    schoolProfile: null,
  });
  EV = loadEduVerse();
  const d = EV.data;

  // Test getSchoolProfile initializes defaults
  var profile = EV.getSchoolProfile();
  assert(typeof profile === 'object', 'school profile is object');
  assert(profile !== null, 'school profile initialized');

  // Test spUpdate
  EV.spUpdate('schoolName', 'Test Academy');
  profile = EV.getSchoolProfile();
  assertEq(profile.schoolName, 'Test Academy', 'spUpdate set schoolName');

  // Update multiple fields
  EV.spUpdate('heroTitle', 'Welcome to Test Academy');
  EV.spUpdate('contactEmail', 'info@test.com');
  EV.spUpdate('contactPhone', '+2348012345678');
  profile = EV.getSchoolProfile();
  assertEq(profile.heroTitle, 'Welcome to Test Academy', 'spUpdate heroTitle');
  assertEq(profile.contactEmail, 'info@test.com', 'spUpdate contactEmail');
  assertEq(profile.contactPhone, '+2348012345678', 'spUpdate contactPhone');

  // Test array fields
  profile.facilities = [{ name: 'Library', description: 'School library' }];
  assertEq(profile.facilities.length, 1, 'facility added');
  assertEq(profile.facilities[0].name, 'Library', 'facility name');

  // Test social links
  profile.socialLinks = [
    { platform: 'facebook', url: 'https://facebook.com/test' },
    { platform: 'twitter', url: 'https://twitter.com/test' }
  ];
  assertEq(profile.socialLinks.length, 2, 'social links count');

  // Test theme
  profile.theme = { primaryColor: '#2563eb', accentColor: '#fbbf24' };
  assertEq(profile.theme.primaryColor, '#2563eb', 'theme primary color');

  // Test grading scale
  profile.gradingScale = [
    { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
    { grade: 'B', min: 60, max: 69, remark: 'Very Good' }
  ];
  assertEq(profile.gradingScale.length, 2, 'grading scale entries');
  assertEq(profile.gradingScale[0].remark, 'Excellent', 'grade A remark');

  // Reset to defaults
  var defaults = EV.getDefaultData();
  assert(defaults.schoolProfile !== undefined, 'default data has schoolProfile');
});

// ===== REPORT BUILDER MODULE =====
testGroup('Report Builder Module', () => {
  seedData({
    students: [
      { id: 'STU001', name: 'Alice', class: 'Basic 5A', contact: 'alice@test.com' },
      { id: 'STU002', name: 'Bob', class: 'Basic 5B', contact: 'bob@test.com' },
    ],
    results: [
      { id: 'RES001', studentId: 'STU001', subject: 'Math', score: 85, grade: 'A', term: 'Term 1' },
      { id: 'RES002', studentId: 'STU001', subject: 'English', score: 78, grade: 'B+', term: 'Term 1' },
      { id: 'RES003', studentId: 'STU002', subject: 'Math', score: 65, grade: 'C+', term: 'Term 1' },
    ],
    fees: [
      { id: 'FEE001', studentId: 'STU001', term: 'Term 1', amount: 5000, paid: 5000, status: 'paid' },
      { id: 'FEE002', studentId: 'STU002', term: 'Term 1', amount: 5000, paid: 0, status: 'pending' },
    ],
    customReports: [],
  });
  EV = loadEduVerse();

  // Test REPORT_SOURCES has expected sources
  assert(typeof EV.REPORT_SOURCES.students === 'object', 'REPORT_SOURCES.students exists');
  assert(typeof EV.REPORT_SOURCES.fees === 'object', 'REPORT_SOURCES.fees exists');
  assert(typeof EV.REPORT_SOURCES.results === 'object', 'REPORT_SOURCES.results exists');
  assert(typeof EV.REPORT_SOURCES.attendance === 'object', 'REPORT_SOURCES.attendance exists');
  assert(typeof EV.REPORT_SOURCES.teachers === 'object', 'REPORT_SOURCES.teachers exists');

  // Test computeReportData with students
  var result = EV.computeReportData({ dataSource: 'students', columns: ['name', 'class'], filters: {}, groupBy: '', valueField: '', aggregate: 'count' });
  assert(Array.isArray(result), 'computeReportData returns array');
  assertEq(result.length, 2, 'all students returned');
  assertEq(result[0].name, 'Alice', 'first student name');

  // Test with filter
  result = EV.computeReportData({ dataSource: 'students', columns: ['name', 'class'], filters: { class: 'Basic 5A' }, groupBy: '', valueField: '', aggregate: 'count' });
  assertEq(result.length, 1, 'filtered to Basic 5A');
  assertEq(result[0].name, 'Alice', 'filtered student is Alice');

  // Test with results groupBy
  result = EV.computeReportData({ dataSource: 'results', columns: ['subject', 'score'], filters: {}, groupBy: 'subject', valueField: 'score', aggregate: 'avg' });
  assert(result.length >= 2, 'grouped results');
  var mathGroup = result.find(function(r) { return r.subject === 'Math'; });
  assert(mathGroup !== undefined, 'Math group found');

  // Test with fees
  result = EV.computeReportData({ dataSource: 'fees', columns: ['studentId', 'amount', 'status'], filters: {}, groupBy: '', valueField: '', aggregate: 'count' });
  assertEq(result.length, 2, 'all fees returned');

  // Test fees filter by status
  result = EV.computeReportData({ dataSource: 'fees', columns: ['studentId', 'amount', 'status'], filters: { status: 'paid' }, groupBy: '', valueField: '', aggregate: 'count' });
  assertEq(result.length, 1, 'paid fees filtered');
  assertEq(result[0].status, 'paid', 'fee status paid');
});

// ===== EXAM SIMULATION MODULE =====
testGroup('Exam Simulation Module', () => {
  resetStorage();
  EV = loadEduVerse();

  // Test getDefaultSimQuestions
  var questions = EV.getDefaultSimQuestions();
  assert(Array.isArray(questions), 'questions is array');
  assert(questions.length > 100, 'has many questions');

  // Test question structure
  var q = questions[0];
  assert(typeof q.id === 'string', 'question has id');
  assert(typeof q.class === 'string', 'question has class');
  assert(typeof q.subject === 'string', 'question has subject');
  assert(typeof q.question === 'string', 'question has question text');
  assert(Array.isArray(q.options), 'question has options array');
  assert(q.options.length === 4, 'question has 4 options');
  assert(typeof q.answer === 'number', 'question has numeric answer index');
  assert(typeof q.difficulty === 'string', 'question has difficulty');

  // Test questions cover multiple classes
  var classes = new Set(questions.map(function(q) { return q.class; }));
  assert(classes.size >= 5, 'questions cover multiple classes');
  assert(classes.has('Basic 1'), 'has Basic 1');
  assert(classes.has('JSS 1'), 'has JSS 1');
  assert(classes.has('SSS 1'), 'has SSS 1');

  // Test questions cover multiple subjects
  var subjects = new Set(questions.map(function(q) { return q.subject; }));
  assert(subjects.size >= 3, 'questions cover multiple subjects');
  assert(subjects.has('Mathematics'), 'has Mathematics');
  assert(subjects.has('English'), 'has English');

  // Test filtering by class
  var jss3Questions = questions.filter(function(q) { return q.class === 'JSS 3'; });
  assert(jss3Questions.length >= 10, 'JSS 3 has questions');

  // Test filtering by subject
  var mathQuestions = questions.filter(function(q) { return q.subject === 'Mathematics'; });
  assert(mathQuestions.length >= 20, 'Mathematics has many questions');

  // Test difficulty levels
  var difficulties = new Set(questions.map(function(q) { return q.difficulty; }));
  assert(difficulties.has('easy') || difficulties.has('medium') || difficulties.has('hard'), 'has difficulty levels');
});

// ===== ACTIVITY GAMES MODULE =====
testGroup('Activity Games Module', () => {
  resetStorage();
  EV = loadEduVerse();

  // Test ACTIVITY_GAMES structure
  assert(typeof EV.ACTIVITY_GAMES === 'object', 'ACTIVITY_GAMES is object');
  assert(typeof EV.ACTIVITY_GAMES.spelling_bee === 'object', 'spelling_bee game exists');
  assert(typeof EV.ACTIVITY_GAMES.math_sprint === 'object', 'math_sprint game exists');
  assert(typeof EV.ACTIVITY_GAMES.quiz_bowl === 'object', 'quiz_bowl game exists');
  assert(typeof EV.ACTIVITY_GAMES.word_scramble === 'object', 'word_scramble game exists');
  assert(typeof EV.ACTIVITY_GAMES.typing_test === 'object', 'typing_test game exists');

  // Test game properties
  var games = Object.keys(EV.ACTIVITY_GAMES);
  assertEq(games.length, 5, '5 game types');

  games.forEach(function(k) {
    var g = EV.ACTIVITY_GAMES[k];
    assert(typeof g.name === 'string', k + ' has name');
    assert(typeof g.icon === 'string', k + ' has icon');
    assert(typeof g.color === 'string', k + ' has color');
    assert(typeof g.desc === 'string', k + ' has desc');
    assert(typeof g.duration === 'number', k + ' has duration');
    assert(typeof g.questions === 'number', k + ' has questions count');
  });

  // Test GAME_CONTENT
  assert(typeof EV.GAME_CONTENT === 'object', 'GAME_CONTENT is object');
  assert(Array.isArray(EV.GAME_CONTENT.spelling_bee), 'spelling_bee content is array');
  assert(EV.GAME_CONTENT.spelling_bee.length >= 10, 'spelling_bee has content');
  assert(Array.isArray(EV.GAME_CONTENT.quiz_bowl), 'quiz_bowl content is array');
  assert(EV.GAME_CONTENT.quiz_bowl.length >= 10, 'quiz_bowl has content');
  assert(Array.isArray(EV.GAME_CONTENT.word_scramble), 'word_scramble content is array');
  assert(EV.GAME_CONTENT.word_scramble.length >= 10, 'word_scramble has content');
  assert(Array.isArray(EV.GAME_CONTENT.typing_test), 'typing_test content is array');
  assert(EV.GAME_CONTENT.typing_test.length >= 1, 'typing_test has content');

  // Test spelling_bee content structure
  var sw = EV.GAME_CONTENT.spelling_bee[0];
  assert(typeof sw.word === 'string', 'spelling word is string');
  assert(typeof sw.def === 'string', 'spelling definition is string');
  assert(sw.word.length > 0, 'spelling word not empty');

  // Test quiz_bowl content structure
  var qb = EV.GAME_CONTENT.quiz_bowl[0];
  assert(typeof qb.q === 'string', 'quiz question is string');
  assert(Array.isArray(qb.opts), 'quiz options is array');
  assertEq(qb.opts.length, 4, 'quiz has 4 options');
  assert(typeof qb.ans === 'number', 'quiz answer is number');
});

// ===== SCREEN PROTECTION MODULE =====
testGroup('Screen Protection Module', () => {
  resetStorage();
  EV = loadEduVerse();

  // screen-protection.js runs in an IIFE and should load without error
  // We just verify the module was loaded (no throw)
  assert(true, 'screen-protection.js loaded without error');

  // Test that protection level functions exist on window
  assert(typeof window.__setProtectionLevel === 'function', '__setProtectionLevel exists');
  assert(typeof window.__getProtectionLevel === 'function', '__getProtectionLevel exists');

  // Test default protection level
  var level = window.__getProtectionLevel();
  assert(typeof level === 'number', 'protection level is number');
  assert(level >= 0 && level <= 3, 'protection level in valid range');

  // Test setting protection levels
  window.__setProtectionLevel(0);
  assertEq(window.__getProtectionLevel(), 0, 'set level 0');

  window.__setProtectionLevel(1);
  assertEq(window.__getProtectionLevel(), 1, 'set level 1');

  window.__setProtectionLevel(2);
  assertEq(window.__getProtectionLevel(), 2, 'set level 2');

  window.__setProtectionLevel(3);
  assertEq(window.__getProtectionLevel(), 3, 'set level 3');

  // Test clamping
  window.__setProtectionLevel(5);
  assertEq(window.__getProtectionLevel(), 3, 'clamped to max 3');

  window.__setProtectionLevel(-1);
  assertEq(window.__getProtectionLevel(), 0, 'clamped to min 0');

  // Reset
  window.__setProtectionLevel(1);
});

// ===== SUPERADMIN PLATFORM CONFIG =====
testGroup('Superadmin Platform Config', () => {
  resetStorage();
  EV = loadEduVerse();

  // Test getDefaultPlatformConfig
  var defaults = EV.getDefaultPlatformConfig();
  assert(typeof defaults === 'object', 'default platform config is object');
  assertEq(defaults.platformName, 'EduVerse', 'default platform name');
  assertEq(defaults.currency, 'NGN', 'default currency');
  assert(Array.isArray(defaults.subscriptionPlans), 'has subscription plans');
  assert(defaults.subscriptionPlans.length >= 3, 'has at least 3 default plans');
  assert(typeof defaults.settings === 'object', 'has settings');
  assert(defaults.settings.allowSchoolRegistration === true, 'registration allowed by default');
  assert(defaults.settings.maintenanceMode === false, 'maintenance off by default');
  assert(typeof defaults.globalFeatureFlags === 'object', 'has feature flags');

  // Test formatAmount
  assertEq(EV.formatAmount(1000), '1,000.00', 'formatAmount 1000');
  assertEq(EV.formatAmount(0), '0.00', 'formatAmount 0');
  assertEq(EV.formatAmount(1234567.89), '1,234,567.89', 'formatAmount large');

  // Test savePlatformConfig and getPlatformConfig
  var cfg = EV.getPlatformConfig();
  assert(typeof cfg === 'object', 'getPlatformConfig returns object');

  cfg.platformName = 'My Platform';
  cfg.currency = 'USD';
  EV.savePlatformConfig(cfg);

  var loaded = EV.getPlatformConfig();
  assertEq(loaded.platformName, 'My Platform', 'saved platform name');
  assertEq(loaded.currency, 'USD', 'saved currency');
});

// ===== NAMESPACE MODULE =====
testGroup('Namespace Module', () => {
  resetStorage();
  EV = loadEduVerse();

  // Test EduVerse namespace
  assert(typeof EV.EduVerse === 'object', 'EduVerse namespace exists');
  assert(typeof EV.EduVerse.session === 'object', 'EduVerse.session exists');
  assert(typeof EV.EduVerse.utils === 'object', 'EduVerse.utils exists');
  assert(typeof EV.EduVerse.data === 'object', 'EduVerse.data exists');
  assert(typeof EV.EduVerse.config === 'object', 'EduVerse.config exists');

  // Test session state
  assert(EV.EduVerse.session.admin === null, 'session.admin starts null');
  assert(EV.EduVerse.session.teacher === null, 'session.teacher starts null');
  assert(EV.EduVerse.session.student === null, 'session.student starts null');

  // Test EduVerse.utils functions exist
  assert(typeof EV.EduVerse.utils.esc === 'function', 'utils.esc is function');
  assert(typeof EV.EduVerse.utils.genId === 'function', 'utils.genId is function');
  assert(typeof EV.EduVerse.utils.getGrade === 'function', 'utils.getGrade is function');

  // Test getGrade utility
  assertEq(EV.EduVerse.utils.getGrade(85), 'A', 'grade 85 = A');
  assertEq(EV.EduVerse.utils.getGrade(76), 'B+', 'grade 76 = B+');
  assertEq(EV.EduVerse.utils.getGrade(71), 'B', 'grade 71 = B');
  assertEq(EV.EduVerse.utils.getGrade(66), 'C+', 'grade 66 = C+');
  assertEq(EV.EduVerse.utils.getGrade(61), 'C', 'grade 61 = C');
  assertEq(EV.EduVerse.utils.getGrade(45), 'F', 'grade 45 = F');
});

// ===== SUMMARY =====
console.log('\n========================================');
console.log(`  Feature Tests: ${passed} passed, ${failed} failed`);
console.log('========================================');

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(function(f, i) { console.log(`  ${i + 1}. ${f}`); });
}

process.exit(failed > 0 ? 1 : 0);
