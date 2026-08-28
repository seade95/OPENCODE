// EduVerse Unit Tests
// Run with: node tests/unit-tests.js

const { loadEduVerse, resetStorage, seedData } = require('./harness.js');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function assertEq(actual, expected, message) {
  const ok = actual === expected;
  if (ok) passed++;
  else {
    failed++;
    failures.push(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    console.error(`  FAIL: ${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertClose(actual, expected, tol, message) {
  const ok = Math.abs(actual - expected) < tol;
  if (ok) passed++;
  else {
    failed++;
    failures.push(`${message}: expected ${expected} +/- ${tol}, got ${actual}`);
    console.error(`  FAIL: ${message}: expected ${expected} +/- ${tol}, got ${actual}`);
  }
}

function testGroup(name, fn) {
  console.log(`\n=== ${name} ===`);
  fn();
}

console.log('EduVerse Unit Tests');
console.log('===================');

// ===== LOAD =====
let EV;
testGroup('Module Loading', () => {
  resetStorage();
  EV = loadEduVerse();
  assert(EV.data !== null, 'data global loaded');
  assert(EV.K12_CONFIG !== null, 'K12_CONFIG loaded');
  assert(EV.getDefaultData !== null, 'getDefaultData loaded');
  assert(EV.loadData !== null, 'loadData loaded');
  assert(EV.saveData !== null, 'saveData loaded');
  assert(EV.genId !== null, 'genId loaded');
  assert(EV.getStudent !== null, 'getStudent loaded');
  assert(EV.getTeacher !== null, 'getTeacher loaded');
  assert(EV.getGrade !== null, 'getGrade loaded');
  assert(EV.__ !== null, '__ loaded');
  assert(EV.getClassTier !== null, 'getClassTier loaded');
  assert(EV.k12GetSubjects !== null, 'k12GetSubjects loaded');
  assert(EV.k12GetGrade !== null, 'k12GetGrade loaded');
  assert(EV.k12GetGradeLabel !== null, 'k12GetGradeLabel loaded');
  assert(EV.k12CalculateGPA !== null, 'k12CalculateGPA loaded');
  assert(EV.k12CalculateGPADisplay !== null, 'k12CalculateGPADisplay loaded');
  assert(EV.k12CalculateDescriptiveStats !== null, 'k12CalculateDescriptiveStats loaded');
  assert(EV.htmlEscape !== null, 'htmlEscape loaded');
  assert(EV.getAvatarUrl !== null, 'getAvatarUrl loaded');
});

// ===== DATA LAYER =====
testGroup('Data Layer - Defaults', () => {
  const defaults = EV.getDefaultData();
  assert(Array.isArray(defaults.students), 'students is array');
  assert(defaults.students.length === 8, 'students has 8 defaults');
  assert(Array.isArray(defaults.teachers), 'teachers is array');
  assert(defaults.teachers.length === 3, 'teachers has 3 defaults');
  assert(Array.isArray(defaults.fees), 'fees is array');
  assert(Array.isArray(defaults.results), 'results is array');
  assert(Array.isArray(defaults.cat), 'cat is array');
  assert(Array.isArray(defaults.activities), 'activities is array');
  assert(Array.isArray(defaults.attendance), 'attendance is array');
  assert(Array.isArray(defaults.assignments), 'assignments is array');
  assert(Array.isArray(defaults.timetables), 'timetables is array');
  assert(Array.isArray(defaults.gradebook), 'gradebook is array');
  assert(Array.isArray(defaults.messages), 'messages is array');
  assert(Array.isArray(defaults.exams), 'exams is array');
  assert(Array.isArray(defaults.parents), 'parents is array');
  assert(Array.isArray(defaults.library), 'library is array');
  assert(Array.isArray(defaults.borrowings), 'borrowings is array');
  assert(Array.isArray(defaults.lessonNotes), 'lessonNotes is array');
  assert(Array.isArray(defaults.behaviorLog), 'behaviorLog is array');
  assert(Array.isArray(defaults.staffHR), 'staffHR is array');
  assert(Array.isArray(defaults.payrollRecords), 'payrollRecords is array');
  assert(Array.isArray(defaults.forumPosts), 'forumPosts is array');
  assert(Array.isArray(defaults.fileRepo), 'fileRepo is array');
  assert(Array.isArray(defaults.notifications), 'notifications is array');
  assert(Array.isArray(defaults.academicTerms), 'academicTerms is array');
  assert(Array.isArray(defaults.admissionPrograms), 'admissionPrograms is array');
  assert(Array.isArray(defaults.applications), 'applications is array');
  assert(Array.isArray(defaults.examQuestions), 'examQuestions is array');
  assert(Array.isArray(defaults.examAttempts), 'examAttempts is array');
  assert(Array.isArray(defaults.idCards), 'idCards is array');
  assert(Array.isArray(defaults.paymentTransactions), 'paymentTransactions is array');
  assert(Array.isArray(defaults.admins), 'admins is array');
  assert(Array.isArray(defaults.examRegistrations), 'examRegistrations is array');
  assert(typeof defaults.translations === 'object', 'translations is object');
  assert(defaults.currentLanguage === 'en', 'currentLanguage defaults to en');
  assert(defaults.schoolTier === 'full_k12', 'schoolTier defaults to full_k12');
  assert(defaults.currentTerm === 'Term 2 2026', 'currentTerm defaults to Term 2 2026');

  // Student structure
  const alice = defaults.students[0];
  assert(alice.id === 'STU001', 'STU001 id');
  assert(alice.name === 'Alice Johnson', 'STU001 name');
  assert(alice.username === 'alice.johnson', 'STU001 username');
  assert(alice.password === 'stu001', 'STU001 password');

  // Teacher structure
  const tch = defaults.teachers[0];
  assert(tch.id === 'TCH001', 'TCH001 id');
  assert(tch.password === 'teacher123', 'TCH001 password');

  // Parent structure
  const par = defaults.parents[0];
  assert(par.email === 'robert@example.com', 'PAR001 email');
  assert(par.password === 'parent123', 'PAR001 password');
  assert(Array.isArray(par.studentIds), 'PAR001 studentIds array');

  // Translation structure
  assert(typeof defaults.translations.en === 'object', 'EN translations exist');
  assert(typeof defaults.translations.fr === 'object', 'FR translations exist');
  assert(typeof defaults.translations.yo === 'object', 'YO translations exist');
  assert(typeof defaults.translations.ha === 'object', 'HA translations exist');
  assert(typeof defaults.translations.ig === 'object', 'IG translations exist');
  assert(defaults.translations.en.siteTitle === 'EduVerse', 'EN siteTitle correct');
});

testGroup('Data Layer - Migration', () => {
  resetStorage();

  // Simulate old data without new keys
  const oldData = {
    students: [{ id: 'STU001', name: 'Alice' }],
    teachers: [],
    fees: [],
    results: [],
    cat: [],
    activities: [],
    attendance: [],
    assignments: [],
    // missing: timetables, gradebook, messages, exams, parents, etc.
  };
  window.localStorage.setItem('schoolData', JSON.stringify(oldData));
  EV = loadEduVerse();
  const migrated = EV.data;

  assert(Array.isArray(migrated.timetables), 'migration added timetables');
  assert(Array.isArray(migrated.gradebook), 'migration added gradebook');
  assert(Array.isArray(migrated.messages), 'migration added messages');
  assert(Array.isArray(migrated.exams), 'migration added exams');
  assert(Array.isArray(migrated.parents), 'migration added parents');
  assert(Array.isArray(migrated.library), 'migration added library');
  assert(Array.isArray(migrated.borrowings), 'migration added borrowings');
  assert(Array.isArray(migrated.lessonNotes), 'migration added lessonNotes');
  assert(Array.isArray(migrated.behaviorLog), 'migration added behaviorLog');
  assert(Array.isArray(migrated.staffHR), 'migration added staffHR');
  assert(Array.isArray(migrated.payrollRecords), 'migration added payrollRecords');
  assert(Array.isArray(migrated.forumPosts), 'migration added forumPosts');
  assert(Array.isArray(migrated.fileRepo), 'migration added fileRepo');
  assert(Array.isArray(migrated.notifications), 'migration added notifications');
  assert(Array.isArray(migrated.academicTerms), 'migration added academicTerms');
  assert(Array.isArray(migrated.admissionPrograms), 'migration added admissionPrograms');
  assert(Array.isArray(migrated.applications), 'migration added applications');
  assert(Array.isArray(migrated.examQuestions), 'migration added examQuestions');
  assert(Array.isArray(migrated.examAttempts), 'migration added examAttempts');
  assert(Array.isArray(migrated.idCards), 'migration added idCards');
  assert(Array.isArray(migrated.paymentTransactions), 'migration added paymentTransactions');
  assert(Array.isArray(migrated.admins), 'migration added admins');
  assert(Array.isArray(migrated.examRegistrations), 'migration added examRegistrations');
  assert(typeof migrated.translations === 'object', 'migration added translations');
  assert(migrated.currentLanguage === 'en', 'migration added currentLanguage');
  assert(migrated.schoolTier === 'full_k12', 'migration added schoolTier');

  // Original data preserved
  assert(migrated.students.length === 1, 'original students preserved');
  assert(migrated.students[0].name === 'Alice', 'original student data preserved');
});

testGroup('Data Layer - Migration preserves non-array values', () => {
  resetStorage();

  const dataWithOverrides = {
    students: [],
    teachers: [],
    fees: [],
    results: [],
    cat: [],
    activities: [],
    attendance: [],
    assignments: [],
    timetables: [],
    gradebook: [],
    messages: [],
    exams: [],
    parents: [],
    leaveRequests: [],
    library: [],
    borrowings: [],
    lessonNotes: [],
    behaviorLog: [],
    staffHR: [],
    payrollRecords: [],
    forumPosts: [],
    fileRepo: [],
    notifications: [],
    academicTerms: [],
    admissionPrograms: [],
    applications: [],
    examQuestions: [],
    examAttempts: [],
    idCards: [],
    paymentTransactions: [],
    admins: [],
    examRegistrations: [],
    translations: { en: { hello: 'world' } },
    currentLanguage: 'fr',
    schoolTier: 'primary',
  };
  window.localStorage.setItem('schoolData', JSON.stringify(dataWithOverrides));
  EV = loadEduVerse();
  assert(EV.data.currentLanguage === 'fr', 'currentLanguage preserved: fr');
  assert(EV.data.schoolTier === 'primary', 'schoolTier preserved: primary');
  assert(EV.data.translations.en.hello === 'world', 'translations preserved');
});

testGroup('Data Layer - genId', () => {
  const id1 = EV.genId('TCH');
  const id2 = EV.genId('TCH');
  assert(id1.startsWith('TCH'), 'genId starts with prefix');
  assert(id2.startsWith('TCH'), 'genId starts with prefix');
  assert(id1 !== id2, 'genId produces unique ids');
  assert(id1.length > 3, 'genId has content after prefix');
});

testGroup('Data Layer - getStudent / getTeacher', () => {
  resetStorage();
  EV = loadEduVerse(); // reload with defaults
  assert(EV.getStudent('STU001').name === 'Alice Johnson', 'getStudent STU001');
  assert(EV.getStudent('NONEXIST') === undefined, 'getStudent nonexistent');
  assert(EV.getTeacher('TCH001').name === 'Mr. John Doe', 'getTeacher TCH001');
  assert(EV.getTeacher('NONEXIST') === undefined, 'getTeacher nonexistent');
});

testGroup('Data Layer - getGrade', () => {
  assertEq(EV.getGrade(95), 'A', '95 => A');
  assertEq(EV.getGrade(80), 'A', '80 => A');
  assertEq(EV.getGrade(79), 'B+', '79 => B+');
  assertEq(EV.getGrade(75), 'B+', '75 => B+');
  assertEq(EV.getGrade(74), 'B', '74 => B');
  assertEq(EV.getGrade(70), 'B', '70 => B');
  assertEq(EV.getGrade(69), 'C+', '69 => C+');
  assertEq(EV.getGrade(65), 'C+', '65 => C+');
  assertEq(EV.getGrade(64), 'C', '64 => C');
  assertEq(EV.getGrade(60), 'C', '60 => C');
  assertEq(EV.getGrade(59), 'D+', '59 => D+');
  assertEq(EV.getGrade(55), 'D+', '55 => D+');
  assertEq(EV.getGrade(54), 'D', '54 => D');
  assertEq(EV.getGrade(50), 'D', '50 => D');
  assertEq(EV.getGrade(49), 'F', '49 => F');
  assertEq(EV.getGrade(0), 'F', '0 => F');
  assertEq(EV.getGrade(-5), 'F', '-5 => F');
});

testGroup('Data Layer - __ translation', () => {
  resetStorage();
  EV = loadEduVerse();
  // default is 'en'
  assertEq(EV.__('dashboard', 'x'), 'Dashboard', '__ dashboard EN');
  assertEq(EV.__('nonexistent_key', 'fallback'), 'fallback', '__ fallback');
  assertEq(EV.__('nonexistent_key'), 'nonexistent_key', '__ key as fallback');

  // Switch to French
  EV.data.currentLanguage = 'fr';
  assertEq(EV.__('dashboard'), 'Tableau de bord', '__ dashboard FR');

  // Switch to Yoruba
  EV.data.currentLanguage = 'yo';
  assertEq(EV.__('dashboard'), 'Dashiboodu', '__ dashboard YO');

  // Switch to Hausa
  EV.data.currentLanguage = 'ha';
  assertEq(EV.__('dashboard'), 'Dashboard', '__ dashboard HA');

  // Switch to Igbo
  EV.data.currentLanguage = 'ig';
  assertEq(EV.__('dashboard'), 'Dashboard', '__ dashboard IG');

  EV.data.currentLanguage = 'en';
});

// ===== K-12 CONFIG =====
testGroup('K-12 Configuration', () => {
  const C = EV.K12_CONFIG;
  assert(C !== null, 'K12_CONFIG defined');
  assert(C.tiers.eccde !== undefined, 'eccde tier defined');
  assert(C.tiers.primary !== undefined, 'primary tier defined');
  assert(C.tiers.juniorSecondary !== undefined, 'juniorSecondary tier defined');
  assert(C.tiers.seniorSecondary !== undefined, 'seniorSecondary tier defined');

  // ECCDE classes
  assert(Array.isArray(C.tiers.eccde.classes), 'eccde classes array');
  assertEq(C.tiers.eccde.classes.length, 7, 'eccde has 7 classes');
  assert(C.tiers.eccde.classes.includes('Creche'), 'eccde includes Creche');
  assert(C.tiers.eccde.classes.includes('Reception'), 'eccde includes Reception');

  // Primary sub-tiers
  assert(C.tiers.primary.subTiers.lower.classes.includes('Basic 1'), 'lower basic includes Basic 1');
  assert(C.tiers.primary.subTiers.middle.classes.includes('Basic 6'), 'middle basic includes Basic 6');

  // JSS
  assert(C.tiers.juniorSecondary.classes.includes('JSS 1'), 'JSS includes JSS 1');
  assert(C.tiers.juniorSecondary.classes.includes('JSS 3'), 'JSS includes JSS 3');

  // SSS streams
  assert(C.tiers.seniorSecondary.streams.science !== undefined, 'SSS Science stream');
  assert(C.tiers.seniorSecondary.streams.commercial !== undefined, 'SSS Commercial stream');
  assert(C.tiers.seniorSecondary.streams.arts !== undefined, 'SSS Arts stream');
  assert(C.tiers.seniorSecondary.streams.science.subjects.includes('Biology'), 'Science includes Biology');
  assert(C.tiers.seniorSecondary.streams.commercial.subjects.includes('Financial Accounting'), 'Commercial includes Financial Accounting');
  assert(C.tiers.seniorSecondary.streams.arts.subjects.includes('Literature-in-English'), 'Arts includes Literature-in-English');

  // Subjects
  assert(Array.isArray(C.subjects.eccde), 'eccde subjects array');
  assert(Array.isArray(C.subjects.primary), 'primary subjects array');
  assert(Array.isArray(C.subjects.junior), 'junior subjects array');

  // Grading rubrics
  assert(C.gradingRubrics.descriptive !== undefined, 'descriptive grading');
  assert(C.gradingRubrics.standard !== undefined, 'standard grading');
  assert(C.gradingRubrics.bece !== undefined, 'bece grading');
  assert(C.gradingRubrics.wassce !== undefined, 'wassce grading');
  assert(C.gradingRubrics.neco !== undefined, 'neco grading');
  assert(C.gradingRubrics.cambridge !== undefined, 'cambridge grading');

  // National exams
  assert(C.nationalExams.ncee !== undefined, 'NCEE defined');
  assert(C.nationalExams.bece !== undefined, 'BECE defined');
  assert(C.nationalExams.wassce !== undefined, 'WASSCE defined');
  assert(C.nationalExams.neco !== undefined, 'NECO defined');
  assert(C.nationalExams.utme !== undefined, 'UTME defined');
  assert(C.nationalExams.igcse !== undefined, 'IGCSE defined');
  assert(C.nationalExams.alevel !== undefined, 'A-Level defined');
  assertEq(C.nationalExams.utme.maxScore, 400, 'UTME maxScore 400');
  assertEq(C.nationalExams.ncee.maxScore, 200, 'NCEE maxScore 200');
});

// ===== K-12 HELPERS =====
testGroup('getClassTier', () => {
  assertEq(EV.getClassTier('Creche'), 'eccde', 'Creche => eccde');
  assertEq(EV.getClassTier('Toddler'), 'eccde', 'Toddler => eccde');
  assertEq(EV.getClassTier('Playgroup'), 'eccde', 'Playgroup => eccde');
  assertEq(EV.getClassTier('Nursery 1'), 'eccde', 'Nursery 1 => eccde');
  assertEq(EV.getClassTier('Nursery 2'), 'eccde', 'Nursery 2 => eccde');
  assertEq(EV.getClassTier('Kindergarten'), 'eccde', 'Kindergarten => eccde');
  assertEq(EV.getClassTier('Reception'), 'eccde', 'Reception => eccde');

  assertEq(EV.getClassTier('Basic 1'), 'primary', 'Basic 1 => primary');
  assertEq(EV.getClassTier('Basic 3'), 'primary', 'Basic 3 => primary');
  assertEq(EV.getClassTier('Basic 4'), 'primary', 'Basic 4 => primary');
  assertEq(EV.getClassTier('Basic 6'), 'primary', 'Basic 6 => primary');
  assertEq(EV.getClassTier('Basic 5A'), 'primary', 'Basic 5A (with stream) => primary');

  assertEq(EV.getClassTier('JSS 1'), 'juniorSecondary', 'JSS 1 => juniorSecondary');
  assertEq(EV.getClassTier('JSS 2'), 'juniorSecondary', 'JSS 2 => juniorSecondary');
  assertEq(EV.getClassTier('JSS 3'), 'juniorSecondary', 'JSS 3 => juniorSecondary');

  assertEq(EV.getClassTier('SSS 1'), 'seniorSecondary', 'SSS 1 => seniorSecondary');
  assertEq(EV.getClassTier('SSS 2'), 'seniorSecondary', 'SSS 2 => seniorSecondary');
  assertEq(EV.getClassTier('SSS 3'), 'seniorSecondary', 'SSS 3 => seniorSecondary');

  // Unknown class defaults to primary
  assertEq(EV.getClassTier('Unknown'), 'primary', 'Unknown => primary');
  assertEq(EV.getClassTier('Grade 10A'), 'primary', 'Grade 10A => primary'); // backward compat
});

testGroup('k12GetSubjects', () => {
  const eccdeSubjs = EV.k12GetSubjects('Creche');
  assert(Array.isArray(eccdeSubjs), 'ECCDE subjects array');
  assert(eccdeSubjs.includes('Letter Work'), 'ECCDE includes Letter Work');

  const primarySubjs = EV.k12GetSubjects('Basic 1');
  assert(primarySubjs.includes('English Language'), 'Basic includes English');

  const jssSubjs = EV.k12GetSubjects('JSS 1');
  assert(jssSubjs.includes('Mathematics'), 'JSS includes Mathematics');

  const sssScience = EV.k12GetSubjects('SSS 1', 'science');
  assert(sssScience.includes('Biology'), 'SSS Science includes Biology');
  assert(!sssScience.includes('Financial Accounting'), 'SSS Science excludes Commercial subjects');

  const sssCommercial = EV.k12GetSubjects('SSS 1', 'commercial');
  assert(sssCommercial.includes('Financial Accounting'), 'SSS Commercial includes Financial Accounting');

  const sssArts = EV.k12GetSubjects('SSS 1', 'arts');
  assert(sssArts.includes('Literature-in-English'), 'SSS Arts includes Literature');

  // No stream defaults to science
  const defaultSss = EV.k12GetSubjects('SSS 1');
  assert(defaultSss.includes('Biology'), 'SSS no stream defaults to Science');
});

testGroup('k12GetGrade', () => {
  // ECCDE - descriptive
  assertEq(EV.k12GetGrade('Creche', 95), 'Exceeded Expectations', 'ECCDE 95');
  assertEq(EV.k12GetGrade('Creche', 80), 'Exceeded Expectations', 'ECCDE 80');
  assertEq(EV.k12GetGrade('Creche', 79), 'Achieved Expectations', 'ECCDE 79');
  assertEq(EV.k12GetGrade('Creche', 60), 'Achieved Expectations', 'ECCDE 60');
  assertEq(EV.k12GetGrade('Creche', 59), 'Developing', 'ECCDE 59');
  assertEq(EV.k12GetGrade('Creche', 40), 'Developing', 'ECCDE 40');
  assertEq(EV.k12GetGrade('Creche', 39), 'Emerging', 'ECCDE 39');
  assertEq(EV.k12GetGrade('Creche', 0), 'Emerging', 'ECCDE 0');

  // Primary - standard
  assertEq(EV.k12GetGrade('Basic 1', 95), 'A', 'Basic 95 => A');
  assertEq(EV.k12GetGrade('Basic 1', 80), 'A', 'Basic 80 => A');
  assertEq(EV.k12GetGrade('Basic 1', 75), 'B+', 'Basic 75 => B+');
  assertEq(EV.k12GetGrade('Basic 1', 70), 'B', 'Basic 70 => B');
  assertEq(EV.k12GetGrade('Basic 1', 50), 'D', 'Basic 50 => D');
  assertEq(EV.k12GetGrade('Basic 1', 49), 'F', 'Basic 49 => F');

  // JSS 1-2 - standard
  assertEq(EV.k12GetGrade('JSS 1', 80), 'A', 'JSS 1 80 => A');
  assertEq(EV.k12GetGrade('JSS 2', 65), 'C+', 'JSS 2 65 => C+');

  // JSS 3 - BECE
  assertEq(EV.k12GetGrade('JSS 3', 75), 'A', 'JSS 3 75 => A (BECE)');
  assertEq(EV.k12GetGrade('JSS 3', 65), 'B', 'JSS 3 65 => B (BECE)');
  assertEq(EV.k12GetGrade('JSS 3', 55), 'C', 'JSS 3 55 => C (BECE)');
  assertEq(EV.k12GetGrade('JSS 3', 45), 'P', 'JSS 3 45 => P (BECE)');
  assertEq(EV.k12GetGrade('JSS 3', 44), 'F', 'JSS 3 44 => F (BECE)');

  // SSS - WASSCE
  assertEq(EV.k12GetGrade('SSS 1', 95), 'A1', 'SSS 95 => A1 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 90), 'A1', 'SSS 90 => A1 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 85), 'B2', 'SSS 85 => B2 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 75), 'B3', 'SSS 75 => B3 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 60), 'C4', 'SSS 60 => C4 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 55), 'C5', 'SSS 55 => C5 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 50), 'C6', 'SSS 50 => C6 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 45), 'D7', 'SSS 45 => D7 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 40), 'E8', 'SSS 40 => E8 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 1', 39), 'F9', 'SSS 39 => F9 (WASSCE)');
  assertEq(EV.k12GetGrade('SSS 3', 95), 'A1', 'SSS 3 95 => A1');
});

testGroup('k12GetGradeLabel', () => {
  // ECCDE
  assertEq(EV.k12GetGradeLabel('Creche', 95), 'Exceeded Expectations', 'ECCDE descriptive label');
  assertEq(EV.k12GetGradeLabel('Creche', 40), 'Developing', 'ECCDE developing label');
  assertEq(EV.k12GetGradeLabel('Creche', 10), 'Emerging', 'ECCDE emerging label');

  // JSS 3 - BECE
  assertEq(EV.k12GetGradeLabel('JSS 3', 75), 'Distinction', 'JSS 3 BECE Distinction');
  assertEq(EV.k12GetGradeLabel('JSS 3', 65), 'Upper Credit', 'JSS 3 BECE Upper Credit');
  assertEq(EV.k12GetGradeLabel('JSS 3', 55), 'Lower Credit', 'JSS 3 BECE Lower Credit');
  assertEq(EV.k12GetGradeLabel('JSS 3', 45), 'Pass', 'JSS 3 BECE Pass');
  assertEq(EV.k12GetGradeLabel('JSS 3', 30), 'Fail', 'JSS 3 BECE Fail');

  // Basic - no label
  assertEq(EV.k12GetGradeLabel('Basic 1', 80), '', 'Basic no label');
  // SSS returns WASSCE label
  assertEq(EV.k12GetGradeLabel('SSS 1', 80), 'Very Good', 'SSS WASSCE label');
  assertEq(EV.k12GetGradeLabel('SSS 1', 95), 'Excellent', 'SSS WASSCE excellent');
  assertEq(EV.k12GetGradeLabel('SSS 1', 55), 'Credit', 'SSS WASSCE credit');
  assertEq(EV.k12GetGradeLabel('SSS 1', 30), 'Fail', 'SSS WASSCE fail');
});

testGroup('k12CalculateGPA', () => {
  resetStorage();
  // Seed data with results for SSS student
  seedData({
    students: [{ id: 'STU001', name: 'Test Student', class: 'SSS 1' }],
    teachers: [],
    fees: [],
    results: [
      { id: 'R1', studentId: 'STU001', subject: 'Math', score: 95, grade: 'A1', term: 'Term 1' },
      { id: 'R2', studentId: 'STU001', subject: 'English', score: 85, grade: 'B2', term: 'Term 1' },
      { id: 'R3', studentId: 'STU001', subject: 'Biology', score: 75, grade: 'B3', term: 'Term 1' },
    ],
    // Add minimal required arrays
    cat: [], activities: [], attendance: [], assignments: [], timetables: [], gradebook: [],
    messages: [], exams: [], parents: [], leaveRequests: [], library: [], borrowings: [],
    lessonNotes: [], behaviorLog: [], staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [],
    notifications: [], academicTerms: [], admissionPrograms: [], applications: [], examQuestions: [],
    examAttempts: [], idCards: [], paymentTransactions: [], admins: [], examRegistrations: [],
    currentTerm: 'Term 1',
    currentLanguage: 'en',
    schoolTier: 'full_k12',
    activityLog: [],
    translations: (EV.getDefaultData()).translations,
  });
  EV = loadEduVerse();

  // WASSCE: 95=A1=8pts, 85=B2=7pts, 75=B3=6pts => (8+7+6)/3 = 7.00
  const gpa = EV.k12CalculateGPA('STU001');
  assertEq(gpa, 7, 'GPA calculation correct (8+7+6)/3 = 7.00');
  assertEq(EV.k12CalculateGPADisplay('STU001'), '7.00 / 8.00', 'GPA display format');

  // Student with no results
  assertEq(EV.k12CalculateGPA('NONE'), 0, 'GPA for no results = 0');
});

testGroup('k12CalculateDescriptiveStats', () => {
  resetStorage();
  seedData({
    students: [{ id: 'STU001', name: 'ECCDE Student', class: 'Creche' }],
    teachers: [],
    fees: [],
    results: [
      { id: 'R1', studentId: 'STU001', subject: 'Letter Work', score: 90, grade: 'Exceeded', term: 'Term 1' },
      { id: 'R2', studentId: 'STU001', subject: 'Number Work', score: 65, grade: 'Achieved', term: 'Term 1' },
      { id: 'R3', studentId: 'STU001', subject: 'Creative Arts', score: 45, grade: 'Developing', term: 'Term 1' },
    ],
    cat: [], activities: [], attendance: [], assignments: [], timetables: [], gradebook: [],
    messages: [], exams: [], parents: [], leaveRequests: [], library: [], borrowings: [],
    lessonNotes: [], behaviorLog: [], staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [],
    notifications: [], academicTerms: [], admissionPrograms: [], applications: [], examQuestions: [],
    examAttempts: [], idCards: [], paymentTransactions: [], admins: [], examRegistrations: [],
    currentTerm: 'Term 1',
    currentLanguage: 'en',
    schoolTier: 'full_k12',
    activityLog: [],
    translations: (EV.getDefaultData()).translations,
  });
  EV = loadEduVerse();

  const stats = EV.k12CalculateDescriptiveStats('STU001', 'Term 1');
  assert(stats !== null, 'descriptive stats returned');
  assertEq(stats.total, 3, 'descriptive stats total 3 results');
  assertEq(stats.levels.exceeded, 1, '1 exceeded');
  assertEq(stats.levels.achieved, 1, '1 achieved');
  assertEq(stats.levels.developing, 1, '1 developing');
  assertEq(stats.levels.emerging, 0, '0 emerging');

  // No results
  assert(EV.k12CalculateDescriptiveStats('STU001', 'Term 99') === null, 'no results returns null');
});

// ===== GRADING RUBRICS =====
testGroup('WASSCE Grade Points', () => {
  const w = EV.K12_CONFIG.gradingRubrics.wassce;
  assertEq(w.getPoints(95), 8, '95 => 8 pts');
  assertEq(w.getPoints(90), 8, '90 => 8 pts');
  assertEq(w.getPoints(85), 7, '85 => 7 pts');
  assertEq(w.getPoints(75), 6, '75 => 6 pts');
  assertEq(w.getPoints(65), 5, '65 => 5 pts');
  assertEq(w.getPoints(55), 4, '55 => 4 pts');
  assertEq(w.getPoints(50), 3, '50 => 3 pts');
  assertEq(w.getPoints(45), 2, '45 => 2 pts');
  assertEq(w.getPoints(40), 1, '40 => 1 pts');
  assertEq(w.getPoints(35), 0, '35 => 0 pts');
});

testGroup('Cambridge Grade Points', () => {
  const c = EV.K12_CONFIG.gradingRubrics.cambridge;
  assertEq(c.getPoints(95), 56, 'Cambridge 95 => 56 pts');
  assertEq(c.getPoints(80), 48, 'Cambridge 80 => 48 pts');
  assertEq(c.getPoints(70), 40, 'Cambridge 70 => 40 pts');
  assertEq(c.getPoints(60), 32, 'Cambridge 60 => 32 pts');
  assertEq(c.getPoints(50), 24, 'Cambridge 50 => 24 pts');
  assertEq(c.getPoints(40), 16, 'Cambridge 40 => 16 pts');
  assertEq(c.getPoints(30), 0, 'Cambridge 30 => 0 pts');

  assertEq(c.getGrade(95), 'A*', 'Cambridge 95 => A*');
  assertEq(c.getGrade(80), 'A', 'Cambridge 80 => A');
  assertEq(c.getGrade(70), 'B', 'Cambridge 70 => B');
  assertEq(c.getGrade(60), 'C', 'Cambridge 60 => C');
  assertEq(c.getGrade(50), 'D', 'Cambridge 50 => D');
  assertEq(c.getGrade(40), 'E', 'Cambridge 40 => E');
  assertEq(c.getGrade(30), 'F', 'Cambridge 30 => F');
});

testGroup('NECO Grading', () => {
  const n = EV.K12_CONFIG.gradingRubrics.neco;
  assertEq(n.getGrade(95), 'A1', 'NECO 95 => A1');
  assertEq(n.getGrade(80), 'B2', 'NECO 80 => B2');
  assertEq(n.getGrade(70), 'B3', 'NECO 70 => B3');
  assertEq(n.getGrade(60), 'C4', 'NECO 60 => C4');
  assertEq(n.getGrade(55), 'C5', 'NECO 55 => C5');
  assertEq(n.getGrade(50), 'C6', 'NECO 50 => C6');
  assertEq(n.getGrade(45), 'D7', 'NECO 45 => D7');
  assertEq(n.getGrade(40), 'E8', 'NECO 40 => E8');
  assertEq(n.getGrade(30), 'F9', 'NECO 30 => F9');
});

testGroup('Descriptive Grading', () => {
  const d = EV.K12_CONFIG.gradingRubrics.descriptive;
  assertEq(d.getLevel(100), 'exceeded', 'descriptive 100 => exceeded');
  assertEq(d.getLevel(80), 'exceeded', 'descriptive 80 => exceeded');
  assertEq(d.getLevel(79), 'achieved', 'descriptive 79 => achieved');
  assertEq(d.getLevel(60), 'achieved', 'descriptive 60 => achieved');
  assertEq(d.getLevel(59), 'developing', 'descriptive 59 => developing');
  assertEq(d.getLevel(40), 'developing', 'descriptive 40 => developing');
  assertEq(d.getLevel(39), 'emerging', 'descriptive 39 => emerging');
  assertEq(d.getLevel(0), 'emerging', 'descriptive 0 => emerging');

  assertEq(d.getLabel(100), 'Exceeded Expectations', 'descriptive label 100');
  assertEq(d.getLabel(60), 'Achieved Expectations', 'descriptive label 60');
  assertEq(d.getLabel(40), 'Developing', 'descriptive label 40');
  assertEq(d.getLabel(0), 'Emerging', 'descriptive label 0');
});

// ===== HELPER FUNCTIONS =====
testGroup('htmlEscape', () => {
  // Load ui.js functions
  assertEq(EV.htmlEscape('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', 'htmlEscape script tag');
  assertEq(EV.htmlEscape('safe text'), 'safe text', 'htmlEscape safe text');
  assertEq(EV.htmlEscape(''), '', 'htmlEscape empty string');
  assertEq(EV.htmlEscape('a&b'), 'a&amp;b', 'htmlEscape ampersand');
  assertEq(EV.htmlEscape("it's"), 'it&#039;s', 'htmlEscape single quote');
  assertEq(EV.htmlEscape('hello "world"'), 'hello &quot;world&quot;', 'htmlEscape double quote');
});

testGroup('getAvatarUrl', () => {
  const url = EV.getAvatarUrl('Alice Johnson');
  assert(typeof url === 'string', 'getAvatarUrl returns string');
  assert(url.startsWith('data:image/svg+xml'), 'getAvatarUrl returns SVG data URI');
  assert(url.includes('%3Csvg'), 'getAvatarUrl contains SVG markup');
  assert(url.includes('A') || url.includes('Alice'), 'getAvatarUrl contains initial or name');

  // Empty name
  assertEq(EV.getAvatarUrl(''), '', 'getAvatarUrl empty name');
  assertEq(EV.getAvatarUrl(null), '', 'getAvatarUrl null name');
  assertEq(EV.getAvatarUrl(undefined), '', 'getAvatarUrl undefined name');
});

// ===== NATIONAL EXAMS =====
testGroup('National Exams Configuration', () => {
  const exams = EV.K12_CONFIG.nationalExams;
  assertEq(exams.ncee.level, 'primary', 'NCEE level primary');
  assertEq(exams.ncee.takenBy, 'Basic 6', 'NCEE takenBy Basic 6');
  assertEq(exams.bece.level, 'jss', 'BECE level jss');
  assertEq(exams.bece.takenBy, 'JSS 3', 'BECE takenBy JSS 3');
  assertEq(exams.wassce.level, 'sss', 'WASSCE level sss');
  assertEq(exams.neco.level, 'sss', 'NECO level sss');
  assertEq(exams.utme.level, 'sss', 'UTME level sss');

  // UTME subjects
  assert(exams.utme.subjects.includes('Use of English'), 'UTME includes English');
  assertEq(exams.utme.subjects.length, 4, 'UTME has 4 subjects');
});

// ===== MULTI-TENANT =====
testGroup('Multi-Tenant System', () => {
  resetStorage();

  // Tenant registry
  const tenants = EV.getTenants();
  assertEq(Array.isArray(tenants), true, 'getTenants returns array');
  assertEq(tenants.length, 0, 'tenant registry starts empty');

  // genTenantId
  const id1 = EV.genTenantId();
  const id2 = EV.genTenantId();
  assert(id1.startsWith('TNT'), 'genTenantId starts with TNT');
  assert(id1 !== id2, 'genTenantId generates unique ids');
  assert(id1.length > 10, 'genTenantId has reasonable length');

  // getTenantDataKey
  assertEq(EV.getTenantDataKey('TNT001'), 'schoolData_TNT001', 'getTenantDataKey formats correctly');

  // Super admin
  const sa = EV.createSuperAdmin('Test Admin', 'test@admin.com', 'password123');
  assert(sa !== null, 'createSuperAdmin succeeds');
  assertEq(sa.name, 'Test Admin', 'super admin name stored');
  assertEq(sa.email, 'test@admin.com', 'super admin email stored');

  // Duplicate super admin prevented
  const sa2 = EV.createSuperAdmin('Another', 'another@admin.com', 'pass456');
  assertEq(sa2, null, 'duplicate super admin prevented');

  // verifySuperAdmin
  const v1 = EV.verifySuperAdmin('test@admin.com', 'password123');
  assert(v1 !== null, 'verifySuperAdmin correct credentials');
  assertEq(v1.name, 'Test Admin', 'verifySuperAdmin returns correct admin');

  const v2 = EV.verifySuperAdmin('test@admin.com', 'wrongpass');
  assertEq(v2, null, 'verifySuperAdmin wrong password');

  const v3 = EV.verifySuperAdmin('unknown@admin.com', 'password123');
  assertEq(v3, null, 'verifySuperAdmin unknown email');

  // Create a school tenant
  const tenant = EV.createTenant({
    name: 'Test School',
    email: 'test@school.com',
    phone: '+2347069332955',
    motto: 'Test Motto',
    tier: 'full_k12',
    plan: 'basic',
    adminName: 'School Admin',
    adminEmail: 'admin@school.com',
    adminPass: 'admin123',
  });

  assert(tenant !== null, 'createTenant returns tenant object');
  assert(tenant.id.startsWith('TNT'), 'tenant has valid id');
  assertEq(tenant.name, 'Test School', 'tenant name stored');
  assertEq(tenant.email, 'test@school.com', 'tenant email stored');
  assertEq(tenant.tier, 'full_k12', 'tenant tier stored');
  assertEq(tenant.plan, 'basic', 'tenant plan stored');
  assertEq(tenant.status, 'active', 'tenant status active');

  // Tenant persisted in registry
  const tenants2 = EV.getTenants();
  assertEq(tenants2.length, 1, 'tenant registry has 1 entry');
  assertEq(tenants2[0].name, 'Test School', 'persisted tenant matches');

  // School data initialized
  const schoolData = JSON.parse(globalThis.window.localStorage.getItem('schoolData_' + tenant.id));
  assert(schoolData !== null, 'school data key created');
  assertEq(schoolData.schoolName, 'Test School', 'school name initialized');
  assertEq(schoolData.schoolTier, 'full_k12', 'school tier initialized');
  assertEq(schoolData.schoolMotto, 'Test Motto', 'school motto initialized');
  assertEq(Array.isArray(schoolData.students), true, 'students array initialized');
  assertEq(schoolData.admins.length, 1, 'admin account created');
  assertEq(schoolData.admins[0].email, 'admin@school.com', 'admin email matches');

  // getDataKey with active tenant
  const prevActive = globalThis.window.localStorage.getItem('activeTenant');
  globalThis.window.localStorage.setItem('activeTenant', tenant.id);
  const key = EV.getDataKey();
  assertEq(key, 'schoolData_' + tenant.id, 'getDataKey returns tenant key when activeTenant set');
  // Reset
  if (prevActive) {
    globalThis.window.localStorage.setItem('activeTenant', prevActive);
  } else {
    globalThis.window.localStorage.removeItem('activeTenant');
  }

  // getDataKey without tenant
  const key2 = EV.getDataKey();
  assertEq(key2, 'schoolData', 'getDataKey returns default key when no activeTenant');
});

// ===== SUMMARY =====
console.log('\n===================');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log(`\n${failed} failure(s):`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
