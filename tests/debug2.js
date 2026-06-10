const h = require('./harness.js');
h.resetStorage();
const EV = h.loadEduVerse();
console.log('EV keys:', Object.keys(EV));
console.log('EV.data:', EV.data ? EV.data.students.length + ' students' : 'null');
console.log('EV.getDefaultData:', typeof EV.getDefaultData);
console.log('EV.K12_CONFIG:', typeof EV.K12_CONFIG);
console.log('EV.getClassTier:', typeof EV.getClassTier);
console.log('globalThis.window.__ediverse:', globalThis.window.__ediverse ? Object.keys(globalThis.window.__ediverse).join(', ') : 'null');

// Check if data is empty
const raw = globalThis.window.localStorage.getItem('schoolData');
console.log('localStorage data exists:', !!raw);
