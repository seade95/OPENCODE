const fs = require('fs');
const path = require('path');

// Setup mock
global.window = {
  localStorage: {
    _data: {},
    getItem(key) { console.log('  localStorage.getItem(' + key + ') called'); return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; },
  },
  document: { getElementById: () => null, addEventListener: () => {} },
  setTimeout: setTimeout,
  addEventListener: () => {},
};
global.document = global.window.document;

// Set oldData
global.window.localStorage.setItem('schoolData', JSON.stringify({
  students: [{ id: 'STU001', name: 'Alice' }],
  teachers: [], fees: [], results: [], cat: [], activities: [], attendance: [], assignments: [],
}));

// Load just data.js with debug
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');

// Modify loadData to add debug
const debugCode = code.replace(
  'function loadData() {',
  `function loadData() {
    console.log('  DATA_KEY:', DATA_KEY);
    console.log('  raw:', localStorage.getItem(DATA_KEY)?.substring(0, 100));
`
);

// Add capture of data
const fullCode = debugCode + '\nconsole.log("  data.students.length:", data.students.length);\nwindow.__data = data;';

new Function(fullCode)();
console.log('  window.__data.students.length:', window.__data.students.length);
