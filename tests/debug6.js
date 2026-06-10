const fs = require('fs');
const path = require('path');

// Mock
global.window = {
  localStorage: {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; },
  },
  document: { getElementById: () => null, addEventListener: () => {} },
  setTimeout,
  addEventListener: () => {},
};
global.localStorage = global.window.localStorage;
global.document = global.window.document;

// Set test data
global.localStorage.setItem('schoolData', JSON.stringify({
  students: [], teachers: [], fees: [], results: [], cat: [], activities: [], attendance: [],
  assignments: [], timetables: [], gradebook: [], messages: [], exams: [], parents: [],
  leaveRequests: [], library: [], borrowings: [], lessonNotes: [], behaviorLog: [],
  staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [], notifications: [],
  academicTerms: [], admissionPrograms: [], applications: [], examQuestions: [],
  examAttempts: [], idCards: [], paymentTransactions: [], admins: [], examRegistrations: [],
  translations: { en: { hello: 'world' } },
  currentLanguage: 'fr',
  schoolTier: 'primary',
}));

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const debugCode = `
window._DEBUG = null;
` + code.replace(
  'let data = loadData();',
  `let data = loadData();
   window._DEBUG = { 
     currentLanguage: data.currentLanguage, 
     schoolTier: data.schoolTier, 
     translations: JSON.stringify(data.translations),
     hasTranslations: typeof data.translations,
     hello: data.translations?.en?.hello,
     studentsLen: data.students.length,
   };`
);

new Function(debugCode)();
console.log('DEBUG:', JSON.stringify(window._DEBUG, null, 2));
