// EDUVERSE - Global Namespace
// Provides EduVerse.* namespaced globals for session state, config, and utilities.
// Individual function names remain global for data-action compatibility.

window.EduVerse = window.EduVerse || {};

// ===== Session State =====
// Centralized session management (replaces scattered currentAdmin/currentTeacher/etc.)
EduVerse.session = {
  admin: null,
  teacher: null,
  student: null,
  parent: null
};

// Backward-compatible getters/setters that proxy to EduVerse.session
// These preserve the existing global variable names while storing state centrally.
Object.defineProperty(window, 'currentAdmin', {
  get: function() { return EduVerse.session.admin; },
  set: function(v) { EduVerse.session.admin = v; },
  configurable: true
});
Object.defineProperty(window, 'currentTeacher', {
  get: function() { return EduVerse.session.teacher; },
  set: function(v) { EduVerse.session.teacher = v; },
  configurable: true
});
Object.defineProperty(window, 'currentStudent', {
  get: function() { return EduVerse.session.student; },
  set: function(v) { EduVerse.session.student = v; },
  configurable: true
});
Object.defineProperty(window, 'currentParent', {
  get: function() { return EduVerse.session.parent; },
  set: function(v) { EduVerse.session.parent = v; },
  configurable: true
});

// ===== Utilities Namespace =====
EduVerse.utils = {
  esc: typeof htmlEscape === 'function' ? htmlEscape : function(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  genId: typeof genId === 'function' ? genId : function(p) { return p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,4).toUpperCase(); },
  getGrade: typeof getGrade === 'function' ? getGrade : function(s) { if(s>=80)return'A';if(s>=75)return'B+';if(s>=70)return'B';if(s>=65)return'C+';if(s>=60)return'C';if(s>=55)return'D+';if(s>=50)return'D';return'F'; }
};

// ===== Data Namespace =====
EduVerse.data = {
  get: typeof __getData === 'function' ? __getData : function() { return window.data; },
  save: typeof saveData === 'function' ? saveData : function() {},
  load: typeof loadData === 'function' ? loadData : function() { return {}; },
  defaults: typeof getDefaultData === 'function' ? getDefaultData : function() { return {}; }
};

// ===== Config =====
EduVerse.config = {
  version: typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'unknown'
};
