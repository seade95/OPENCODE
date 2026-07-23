// EduVerse Auth Module — lightweight, self-contained session manager
(function() {
  var AUTH_KEY = 'eduverse_session';
  var AUTH_BACKUP = 'eduverse_auth';
  var SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

  var EduVerseAuth = {
    login: function(email, password, role) {
      if (!email || !password) return false;
      var admins = [];
      try {
        var raw = localStorage.getItem('schoolData');
        if (raw) {
          var d = JSON.parse(raw);
          admins = d.admins || [];
        }
      } catch(e) {}
      var admin = admins.find(function(a) { return a.email === email && a.password === password; });
      if (!admin) {
        try {
          var raw2 = localStorage.getItem('eduverse_data');
          if (raw2) {
            var d2 = JSON.parse(raw2);
            admins = d2.admins || [];
            admin = admins.find(function(a) { return a.email === email && a.password === password; });
          }
        } catch(e) {}
      }
      if (!admin) {
        try {
          var tenantsRaw = localStorage.getItem('eduverse_tenants');
          if (tenantsRaw) {
            var tenants = JSON.parse(tenantsRaw);
            for (var i = 0; i < tenants.length; i++) {
              var tRaw = localStorage.getItem('schoolData_' + tenants[i].id);
              if (tRaw) {
                var tData = JSON.parse(tRaw);
                var found = (tData.admins || []).find(function(a) { return a.email === email && a.password === password; });
                if (found) { admin = found; break; }
              }
            }
          }
        } catch(e) {}
      }
      if (!admin) return false;
      var session = {
        version: 1,
        type: role || 'admin',
        user: { id: admin.id, name: admin.name, email: admin.email },
        loginTime: Date.now(),
        timestamp: Date.now()
      };
      try { localStorage.setItem(AUTH_KEY, JSON.stringify(session)); } catch(e) {}
      try { localStorage.setItem(AUTH_BACKUP, JSON.stringify({ email: email, role: role || 'admin', loginTime: new Date().toISOString() })); } catch(e) {}
      window.currentAdmin = admin;
      return true;
    },

    isLoggedIn: function() {
      try {
        var s = localStorage.getItem(AUTH_KEY);
        if (!s) {
          var b = localStorage.getItem(AUTH_BACKUP);
          if (b) {
            try {
              var bd = JSON.parse(b);
              if (bd && bd.email) {
                var session = { version: 1, type: 'admin', user: { email: bd.email }, loginTime: Date.parse(bd.loginTime) || Date.now(), timestamp: Date.now() };
                localStorage.setItem(AUTH_KEY, JSON.stringify(session));
                return true;
              }
            } catch(e2) {}
          }
          return false;
        }
        var d = JSON.parse(s);
        if (!d || !d.type) return false;
        var elapsed = Date.now() - (d.loginTime || d.timestamp || 0);
        if (elapsed > SESSION_TTL) {
          this.logout();
          return false;
        }
        return true;
      } catch(e) { return false; }
    },

    getUser: function() {
      try {
        var s = localStorage.getItem(AUTH_KEY);
        return s ? JSON.parse(s) : null;
      } catch(e) { return null; }
    },

    logout: function() {
      try { localStorage.removeItem(AUTH_KEY); } catch(e) {}
      try { localStorage.removeItem(AUTH_BACKUP); } catch(e) {}
      if (typeof clearSession === 'function') clearSession('admin');
      window.currentAdmin = null;
      window.location.href = 'login.html';
    },

    protect: function(allowedRoles) {
      if (!this.isLoggedIn()) {
        window.location.replace('login.html');
        return false;
      }
      return true;
    }
  };

  window.EduVerseAuth = EduVerseAuth;
})();
