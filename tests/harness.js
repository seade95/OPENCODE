// Test harness for EduVerse - simulates browser environment in Node.js
const fs = require('fs');
const path = require('path');

// ===== BROWSER MOCK =====
const mockAddEventListener = () => {};

function createElement(tag) {
  return {
    tagName: tag.toUpperCase(),
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: mockAddEventListener,
    appendChild: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    innerHTML: '',
    src: '',
    href: '',
    value: '',
    focus: () => {},
    click: () => {},
    closest: () => null,
    parentElement: null,
  };
}

global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement,
  createElementNS: () => createElement('div'),
  createTextNode: () => ({}),
  body: { appendChild: () => {}, addEventListener: mockAddEventListener, style: {} },
  documentElement: { style: {} },
  head: { appendChild: () => {}, querySelector: () => null },
  addEventListener: mockAddEventListener,
  removeEventListener: () => {},
  cookie: '',
  title: '',
  createRange: () => ({
    selectNodeContents: () => {},
    deleteContents: () => {},
    insertNode: () => {},
  }),
  createComment: () => ({}),
  createDocumentFragment: () => ({ appendChild: () => {}, querySelector: () => null }),
};

global.window = {
  document: global.document,
  localStorage: {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; },
  },
  addEventListener: mockAddEventListener,
  removeEventListener: () => {},
  location: { href: '', reload: () => {}, search: '', hash: '' },
  confirm: () => true,
  prompt: () => null,
  alert: () => {},
  open: () => ({ document: { write: () => {}, close: () => {} }, print: () => {}, focus: () => {} }),
  close: () => {},
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  scrollTo: () => {},
  btoa: (s) => Buffer.from(s).toString('base64'),
  atob: (s) => Buffer.from(s, 'base64').toString('utf8'),
  innerWidth: 1024,
  innerHeight: 768,
  navigator: { userAgent: 'node-test', platform: 'Node.js' },
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
};

global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };

// Browser globals that code accesses without window. prefix
global.localStorage = globalThis.window.localStorage;
global.document = globalThis.window.document;
global.console = console;
global.navigator = global.window.navigator;
global.fetch = global.window.fetch;

// DOM element constructors
['HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLButtonElement',
 'HTMLDivElement', 'HTMLSpanElement', 'HTMLTableElement', 'HTMLImageElement',
 'HTMLAnchorElement', 'HTMLFormElement', 'HTMLParagraphElement', 'HTMLLabelElement',
 'HTMLOptionElement', 'HTMLUListElement', 'HTMLLIElement', 'HTMLHeadingElement',
].forEach(name => { global[name] = function() {}; });
global.XMLHttpRequest = function() {};

// ===== LOADER =====
const EXPORT_KEY = '__ediverse';

function loadProjectFiles() {
  const baseDir = path.join(__dirname, '..', 'js');
  const files = ['data.js', 'ui.js', 'admin.js', 'teacher.js', 'student.js',
    'features.js', 'features2.js', 'k12.js', 'admission.js', 'system.js', 'multitenant.js', 'eduverse.js', 'app.js'];

  const combined = files.map(f => fs.readFileSync(path.join(baseDir, f), 'utf8')).join('\n');

  // Append exports of all top-level functions and vars we need for testing
  const exportCode = `
    window['${EXPORT_KEY}'] = {
      get data() { return typeof window.__data !== 'undefined' ? window.__data : null; },
      getDefaultData, loadData, saveData, genId,
      getStudent, getTeacher, getGrade, __,
      getClassTier, k12GetSubjects, k12GetGrade,
      k12GetGradeLabel, k12CalculateGPA, k12CalculateGPADisplay,
      k12CalculateDescriptiveStats,
      htmlEscape, getAvatarUrl,
      K12_CONFIG,
      getTenants, saveTenants, createTenant, getSuperAdmin, saveSuperAdmin,
      createSuperAdmin, verifySuperAdmin, getTenantDataKey, genTenantId,
      getDataKey, __saveCurrentData,
      eduverseUser, eduverseSignup, eduverseLogin, eduverseLogout,
      getMySchools, getMembershipForSchool, createSchoolPage,
      addFeedEntry, migrateLegacyUsers,
    };
  `;

  try {
    // Clean up previous definitions that might conflict
    try { delete global.window.__data; } catch(e) {}
    new Function(combined + exportCode)();
  } catch (e) {
    console.error('Error loading combined JS:', e.message);
  }
}

function loadEduVerse() {
  loadProjectFiles();
  const e = globalThis.window[EXPORT_KEY] || {};
  return e;
}

function resetStorage() {
  globalThis.window.localStorage.clear();
}

function seedData(overrides) {
  // First load with defaults to get getDefaultData function accessible
  globalThis.window.localStorage.clear();
  // Create seed data manually
  const defaults = {
    students: [], teachers: [], fees: [], results: [], cat: [],
    activities: [], attendance: [], assignments: [], timetables: [],
    gradebook: [], messages: [], exams: [], parents: [], leaveRequests: [],
    library: [], borrowings: [], lessonNotes: [], behaviorLog: [],
    staffHR: [], payrollRecords: [], forumPosts: [], fileRepo: [],
    notifications: [], academicTerms: [], admissionPrograms: [],
    applications: [], examQuestions: [], examAttempts: [], idCards: [],
    paymentTransactions: [], admins: [], examRegistrations: [],
    currentTerm: 'Term 1', currentLanguage: 'en', schoolTier: 'full_k12',
    activityLog: [], translations: {
      en: { siteTitle: 'Test School', dashboard: 'Dashboard' },
      fr: { siteTitle: 'Test School FR' },
      yo: {}, ha: {}, ig: {},
    },
  };
  Object.assign(defaults, overrides);
  globalThis.window.localStorage.setItem('schoolData', JSON.stringify(defaults));
  loadProjectFiles();
}

module.exports = { loadEduVerse, resetStorage, seedData };
