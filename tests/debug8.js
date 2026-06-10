const fs = require('fs');
const path = require('path');

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

// Inject debug AFTER data.js code
const debugCode = code + `
window._DEBUG = {};

var _parsedRaw = localStorage.getItem('schoolData');
window._DEBUG.raw = _parsedRaw;
var _parsed = JSON.parse(_parsedRaw);
var _defaults = getDefaultData();

window._DEBUG.keyInParsed = {};
for (var k of Object.keys(_defaults)) {
  window._DEBUG.keyInParsed[k] = k in _parsed;
}

window._DEBUG.after = {
  currentLanguage: data.currentLanguage,
  schoolTier: data.schoolTier,
  translationsHello: data.translations?.en?.hello,
};

// Check condition for currentLanguage
var k = 'currentLanguage';
var cond1 = !(k in _parsed);
var isDA = Array.isArray(_defaults[k]);
var isPA = Array.isArray(_parsed[k]);
var cond2 = isDA && !isPA;
window._DEBUG.migrationCheck = {
  currentLanguage: { keyInParsed: k in _parsed, isDefaultArray: isDA, isParsedArray: isPA, cond1: cond1, cond2: cond2, wouldReplace: cond1 || cond2 },
  schoolTier: { keyInParsed: 'schoolTier' in _parsed },
  translations: { keyInParsed: 'translations' in _parsed },
};
`;

new Function(debugCode)();
console.log(JSON.stringify(window._DEBUG, null, 2));
