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
  document: { getElementById: () => null },
  setTimeout: setTimeout,
  addEventListener: () => {},
};
global.document = global.window.document;

const baseDir = path.join(__dirname, '..', 'js');
const files = ['data.js', 'k12.js'];
const combined = files.map(f => fs.readFileSync(path.join(baseDir, f), 'utf8')).join('\n');
const exportCode = `
  window.__EDEBUG = {
    data: typeof data !== 'undefined' ? 'defined' : 'undefined',
    dataLen: typeof data !== 'undefined' ? data.students.length : -1,
    getDefaultData: typeof getDefaultData !== 'undefined' ? 'defined' : 'undefined',
    K12_CONFIG: typeof K12_CONFIG !== 'undefined' ? 'defined' : 'undefined',
    getClassTier: typeof getClassTier !== 'undefined' ? 'defined' : 'undefined',
  };
`;
new Function(combined + exportCode)();
console.log(JSON.stringify(window.__EDEBUG, null, 2));
