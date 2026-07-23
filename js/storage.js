// EduVerse Storage Module — lightweight, self-contained localStorage data manager
(function() {
  var EduVerseDB = {
    DATA_KEY: 'schoolData',
    BACKUP_KEY: 'eduverse_data',
    SYNC_TO_GLOBAL: true,

    _getEffectiveKey: function() {
      try {
        var tenant = localStorage.getItem('activeTenant');
        if (tenant) return 'schoolData_' + tenant;
      } catch(e) {}
      return this.DATA_KEY;
    },

    _getDefaultData: function() {
      return {
        students: [], teachers: [], fees: [], results: [], admins: [],
        classes: [], subjects: [], attendance: [], parents: [],
        announcements: [], activities: [], settings: {
          schoolName: 'My School',
          academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
          term: 'First Term'
        }
      };
    },

    init: function() {
      var key = this._getEffectiveKey();
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(this._getDefaultData()));
      }
      if (!localStorage.getItem(this.BACKUP_KEY)) {
        localStorage.setItem(this.BACKUP_KEY, JSON.stringify(this._getDefaultData()));
      }
      this._syncToGlobal();
    },

    _syncToGlobal: function() {
      if (!this.SYNC_TO_GLOBAL) return;
      try {
        var d = this.getAll();
        if (typeof window.data !== 'undefined' && window.data) {
          Object.keys(d).forEach(function(k) { window.data[k] = d[k]; });
        } else {
          window.data = d;
        }
      } catch(e) {}
    },

    getAll: function() {
      var key = this._getEffectiveKey();
      try {
        var raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch(e) {}
      try {
        var raw2 = localStorage.getItem(this.BACKUP_KEY);
        if (raw2) return JSON.parse(raw2);
      } catch(e) {}
      return this._getDefaultData();
    },

    saveAll: function(data) {
      var key = this._getEffectiveKey();
      try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
      try { localStorage.setItem(this.BACKUP_KEY, JSON.stringify(data)); } catch(e) {}
      if (this.SYNC_TO_GLOBAL) {
        try {
          if (typeof window.data !== 'undefined' && window.data) {
            Object.keys(data).forEach(function(k) { window.data[k] = data[k]; });
          } else {
            window.data = data;
          }
        } catch(e) {}
      }
    },

    get: function(collection) {
      var d = this.getAll();
      return d[collection] || [];
    },

    add: function(collection, item) {
      var d = this.getAll();
      item.id = item.id || 'ID' + Date.now() + Math.random().toString(36).slice(2, 6);
      if (!d[collection]) d[collection] = [];
      d[collection].push(item);
      this.saveAll(d);
      return item;
    },

    update: function(collection, id, updates) {
      var d = this.getAll();
      var arr = d[collection] || [];
      var idx = arr.findIndex(function(x) { return x.id === id; });
      if (idx === -1) return null;
      arr[idx] = Object.assign({}, arr[idx], updates, { updatedAt: new Date().toISOString() });
      this.saveAll(d);
      return arr[idx];
    },

    delete: function(collection, id) {
      var d = this.getAll();
      d[collection] = (d[collection] || []).filter(function(x) { return x.id !== id; });
      this.saveAll(d);
    },

    search: function(collection, query) {
      var items = this.get(collection);
      if (!query) return items;
      var q = query.toLowerCase();
      return items.filter(function(item) {
        return Object.keys(item).some(function(k) {
          return String(item[k]).toLowerCase().includes(q);
        });
      });
    },

    export: function() {
      return JSON.stringify(this.getAll(), null, 2);
    },

    import: function(jsonString) {
      try {
        var data = JSON.parse(jsonString);
        this.saveAll(data);
        return true;
      } catch(e) { return false; }
    },

    clear: function() {
      var key = this._getEffectiveKey();
      try { localStorage.removeItem(key); } catch(e) {}
      try { localStorage.removeItem(this.BACKUP_KEY); } catch(e) {}
      this.init();
    },

    count: function(collection) {
      return this.get(collection).length;
    },

    findById: function(collection, id) {
      return this.get(collection).find(function(x) { return x.id === id; }) || null;
    }
  };

  EduVerseDB.init();
  window.EduVerseDB = EduVerseDB;
})();
