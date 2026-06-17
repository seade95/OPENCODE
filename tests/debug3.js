const h = require('./harness.js');

// Test 1: Migration
h.resetStorage();
const oldData = {
  students: [{ id: 'STU001', name: 'Alice' }],
  teachers: [], fees: [], results: [], cat: [], activities: [], attendance: [], assignments: [],
};
globalThis.window.localStorage.setItem('schoolData', JSON.stringify(oldData));
const EV1 = h.loadEduVerse();
console.log('Test 1 - Migration:');
console.log('  students length:', EV1.data.students.length);
console.log('  student name:', EV1.data.students[0]?.name);
console.log('  has timetables:', Array.isArray(EV1.data.timetables));
console.log('  currentLanguage:', EV1.data.currentLanguage);
console.log('  schoolTier:', EV1.data.schoolTier);

// Test 2: Non-array values preserved
h.resetStorage();
const data2 = {
  students: [], teachers: [], fees: [], results: [], cat: [], activities: [], attendance: [],
  assignments: [], timetables: [], gradebook: [], messages: [], exams: [], parents: [],
  leaveRequests: [], library: [], borrowings: [], lessonNotes: [], behaviorLog: [],
  staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [], notifications: [],
  academicTerms: [], admissionPrograms: [], applications: [], examQuestions: [],
  examAttempts: [], idCards: [], paymentTransactions: [], admins: [], examRegistrations: [],
  translations: { en: { hello: 'world' } },
  currentLanguage: 'fr',
  schoolTier: 'primary',
};
globalThis.window.localStorage.setItem('schoolData', JSON.stringify(data2));
const EV2 = h.loadEduVerse();
console.log('\nTest 2 - Non-array values:');
console.log('  currentLanguage:', EV2.data.currentLanguage);
console.log('  schoolTier:', EV2.data.schoolTier);
console.log('  translations.en.hello:', EV2.data.translations?.en?.hello);

// Test 3: k12GetGradeLabel for SSS
console.log('\nTest 3 - k12GetGradeLabel:');
console.log('  SSS 1, 80:', EV2.k12GetGradeLabel('SSS 1', 80));
console.log('  Basic 1, 80:', EV2.k12GetGradeLabel('Basic 1', 80));

// Test 4: Descriptive stats
h.resetStorage();
globalThis.window.localStorage.setItem('schoolData', JSON.stringify({
  students: [{ id: 'STU001', name: 'ECCDE Student', class: 'Creche' }],
  teachers: [], fees: [],
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
  currentTerm: 'Term 1', currentLanguage: 'en', schoolTier: 'full_k12', activityLog: [],
  translations: { en: { siteTitle: 'Test' }, fr: {}, yo: {}, ha: {}, ig: {} },
}));
const EV4 = h.loadEduVerse();
console.log('\nTest 4 - Descriptive stats:');
console.log('  results count:', EV4.data.results.length);
console.log('  currentTerm:', EV4.data.currentTerm);
const stats = EV4.k12CalculateDescriptiveStats('STU001', 'Term 1');
console.log('  stats:', stats ? `total=${stats.total}, exceeded=${stats.levels.exceeded}` : 'null');
