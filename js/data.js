// Global data store
window.data = window.data || {
  admins: [],
  teachers: [],
  students: [],
  parents: [],
  schoolProfile: { name: 'EduVerse Institute' },
  activityLog: []
};

window.saveData = window.saveData || function() {
  try {
    var key = localStorage.getItem('activeTenantKey');
    if (!key && localStorage.getItem('activeTenant')) {
      key = 'schoolData_' + localStorage.getItem('activeTenant');
    }
    if (key) {
      localStorage.setItem(key, JSON.stringify(window.data));
    }
    localStorage.setItem('eduverse_data', JSON.stringify(window.data));
  } catch(e) {}
};

window.loadData = window.loadData || function() {
  try {
    var key = localStorage.getItem('activeTenantKey');
    if (!key && localStorage.getItem('activeTenant')) {
      key = 'schoolData_' + localStorage.getItem('activeTenant');
    }
    var stored = key ? localStorage.getItem(key) : null;
    if (!stored) stored = localStorage.getItem('eduverse_data');
    if (stored) window.data = JSON.parse(stored);
  } catch(e) {}
  return window.data;
};

window.getDefaultData = window.getDefaultData || function() {
  return window.data;
};

