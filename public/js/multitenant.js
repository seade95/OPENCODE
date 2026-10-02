// Multitenant Module & Tenant Data Engine
window.EduVerseMultitenant = window.EduVerseMultitenant || {};

function getTenants() {
  try {
    var raw = localStorage.getItem('eduverse_tenants');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}
window.getTenants = getTenants;

function saveTenants(tenants) {
  try {
    localStorage.setItem('eduverse_tenants', JSON.stringify(tenants));
  } catch(e) {}
}
window.saveTenants = saveTenants;

function getTenantDataKey(id) {
  return 'schoolData_' + id;
}
window.getTenantDataKey = getTenantDataKey;

function createTenant(tenantObj) {
  var tenants = getTenants();
  var id = tenantObj.id || tenantObj.slug || ('SCH' + Date.now().toString(36).toUpperCase());
  tenantObj.id = id;
  tenantObj.slug = tenantObj.slug || id.toLowerCase();
  tenantObj.createdAt = tenantObj.createdAt || new Date().toISOString();
  tenantObj.status = tenantObj.status || 'active';
  tenantObj.tier = tenantObj.tier || 'full_k12';
  tenantObj.plan = tenantObj.plan || 'basic';

  var existingIdx = tenants.findIndex(function(t) { return t.id === id || t.slug === tenantObj.slug; });
  if (existingIdx >= 0) {
    tenants[existingIdx] = tenantObj;
  } else {
    tenants.push(tenantObj);
  }
  saveTenants(tenants);

  // Initialize tenant default dataset
  var dataKey = getTenantDataKey(id);
  var raw = localStorage.getItem(dataKey);
  var copy = raw ? JSON.parse(raw) : (typeof getDefaultData === 'function' ? getDefaultData() : {});
  if (!copy || !copy.schoolProfile) {
    copy = copy || {};
    copy.schoolProfile = {
      name: tenantObj.name || 'Demo School',
      motto: tenantObj.motto || 'Education for Enlightenment',
      tier: tenantObj.tier || 'full_k12',
      address: tenantObj.address || '123 Education Way',
      phone: tenantObj.phone || '+234 801 234 5678',
      email: tenantObj.email || 'contact@school.edu'
    };
  } else {
    copy.schoolProfile.name = tenantObj.name || copy.schoolProfile.name;
  }

  if (tenantObj.adminName || tenantObj.adminEmail) {
    if (!copy.admins || !copy.admins.length) {
      copy.admins = [{
        id: 'ADM001',
        name: tenantObj.adminName || 'School Admin',
        email: tenantObj.adminEmail || tenantObj.email || 'admin@school.edu',
        password: tenantObj.adminPass || 'admin123',
        role: 'super_admin'
      }];
    }
  }

  localStorage.setItem(dataKey, JSON.stringify(copy));
  return tenantObj;
}
window.createTenant = createTenant;

