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

// Directly test the migration logic by running loadData with debug
const debugCode = `
window._DEBUG = {};

// Override loadData temporarily
var _origGetDefaultData = getDefaultData;
var _parsedRaw = localStorage.getItem('schoolData');
window._DEBUG.raw = _parsedRaw;
var _parsed = JSON.parse(_parsedRaw);
var _defaults = getDefaultData();

window._DEBUG.inParsed = {};
for (var k of Object.keys(_defaults)) {
  window._DEBUG.inParsed[k] = k in _parsed;
}

// Now test loadData normally
var data = loadData();
window._DEBUG.after = {
  currentLanguage: data.currentLanguage,
  schoolTier: data.schoolTier,
  translationsHello: data.translations?.en?.hello,
};

// Now manually trace the migration for specific keys
window._DEBUG.isArrayDefaults = {
  currentLanguage: Array.isArray(_defaults.currentLanguage),
  schoolTier: Array.isArray(_defaults.schoolTier),
  translations: Array.isArray(_defaults.translations),
};
window._DEBUG.isArrayParsed = {
  currentLanguage: Array.isArray(_parsed.currentLanguage),
  schoolTier: Array.isArray(_parsed.schoolTier),
  translations: Array.isArray(_parsed.translations),
};
`;

new Function(debugCode)();
console.log(JSON.stringify(window._DEBUG, null, 2));
