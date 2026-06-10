const fs = require('fs');
const path = require('path');

const h = require('./harness.js');

// Direct test - bypass the loader and directly test loadData
h.resetStorage();

// Mock localStorage
const rawData = JSON.stringify({
  students: [], teachers: [], fees: [], results: [], cat: [], activities: [], attendance: [],
  assignments: [], timetables: [], gradebook: [], messages: [], exams: [], parents: [],
  leaveRequests: [], library: [], borrowings: [], lessonNotes: [], behaviorLog: [],
  staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [], notifications: [],
  academicTerms: [], admissionPrograms: [], applications: [], examQuestions: [],
  examAttempts: [], idCards: [], paymentTransactions: [], admins: [], examRegistrations: [],
  translations: { en: { hello: 'world' } },
  currentLanguage: 'fr',
  schoolTier: 'primary',
});

globalThis.localStorage.setItem('schoolData', rawData);

// Load just data.js and inspect
const dataCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');

// We need the combined approach since data.js depends on itself...
// Let's just use the full harness but add a hook
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const debugCode = `
var LOAD_RESULT = null;
var origLoadData = function() {};
` + code.replace(
  'let data = loadData();',
  `let data = loadData();
   LOAD_RESULT = { keys: Object.keys(data), currentLanguage: data.currentLanguage, schoolTier: data.schoolTier, translations: JSON.stringify(data.translations) };`
);

new Function(debugCode)();
console.log('LOAD_RESULT:', LOAD_RESULT);
