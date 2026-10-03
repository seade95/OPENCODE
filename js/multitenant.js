// Multitenant Module & Tenant Data Engine
window.EduVerseMultitenant = window.EduVerseMultitenant || {};

function normalizeSlug(str) {
  if (!str) return 'school';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'school';
}
window.normalizeSlug = normalizeSlug;

var DEFAULT_SYSTEM_TENANTS = [
  {
    id: 'gracefield-international',
    name: 'Gracefield International School',
    slug: 'gracefield-international',
    motto: 'Nurturing Global Leaders for Tomorrow',
    status: 'active',
    tier: 'Full K-12 Partner Accredited',
    address: '45 Gracefield Drive, Ikeja, Lagos',
    phone: '+234 802 345 6789',
    email: 'info@gracefield.edu.ng',
    logo: 'images/courses/science.jpg'
  },
  {
    id: 'ames-premier-academy',
    name: 'Ames Premier Academy',
    slug: 'ames-premier-academy',
    motto: 'Academic Mastery & STEM Excellence',
    status: 'active',
    tier: 'STEM Excellence Accredited',
    address: '88 Tech Hub Avenue, Yaba, Lagos',
    phone: '+234 803 456 7890',
    email: 'admissions@amespremier.sch.ng',
    logo: 'images/courses/technology.jpg'
  }
];

function getTenants() {
  var list = [];
  try {
    var raw = localStorage.getItem('eduverse_tenants');
    if (raw) list = JSON.parse(raw);
  } catch(e) {}

  if (!list || !list.length) {
    list = DEFAULT_SYSTEM_TENANTS.slice();
    try { localStorage.setItem('eduverse_tenants', JSON.stringify(list)); } catch(e) {}
  }

  // Also include custom school profile if created in localStorage
  try {
    var customProfRaw = localStorage.getItem('eduverse_school_profile');
    if (customProfRaw) {
      var cp = JSON.parse(customProfRaw);
      if (cp && cp.name) {
        var cpSlug = cp.slug || normalizeSlug(cp.name);
        var exists = list.some(function(t) { return t.slug === cpSlug || t.id === cpSlug; });
        if (!exists) {
          list.unshift({
            id: cpSlug,
            name: cp.name,
            slug: cpSlug,
            motto: cp.motto || 'Custom Institution',
            status: 'active',
            tier: cp.tier || 'Verified Custom Institution',
            address: cp.address || 'Custom Campus',
            phone: cp.phone || '+234 800 000 0000',
            email: cp.email || 'admissions@school.edu',
            logo: cp.logoUrl || 'icons/icon.svg'
          });
        }
      }
    }
  } catch(e) {}

  return list;
}
window.getTenants = getTenants;

function saveTenants(tenants) {
  try {
    localStorage.setItem('eduverse_tenants', JSON.stringify(tenants));
  } catch(e) {}
}
window.saveTenants = saveTenants;

function getTenantBySlug(slugOrId) {
  if (!slugOrId) return null;
  var target = String(slugOrId).toLowerCase().trim();
  var tenants = getTenants();

  var match = tenants.find(function(t) {
    return (t.id && t.id.toLowerCase() === target) || (t.slug && t.slug.toLowerCase() === target);
  });

  return match || null;
}
window.getTenantBySlug = getTenantBySlug;

function getTenantDataKey(idOrSlug) {
  if (!idOrSlug) return 'schoolData_default';
  var tenant = getTenantBySlug(idOrSlug);
  var id = tenant ? tenant.id : idOrSlug;
  return 'schoolData_' + id;
}
window.getTenantDataKey = getTenantDataKey;

function updateTenantSlug(tenantId, newSlug, newName) {
  if (!tenantId) return null;
  var tenants = getTenants();
  var cleanSlug = normalizeSlug(newSlug || newName || tenantId);

  var tenant = tenants.find(function(t) { return t.id === tenantId || t.slug === tenantId; });
  if (tenant) {
    tenant.slug = cleanSlug;
    if (newName) tenant.name = newName;
    saveTenants(tenants);

    var mainKey = 'schoolData_' + tenant.id;
    var rawData = localStorage.getItem(mainKey);
    if (rawData) {
      localStorage.setItem('schoolData_' + cleanSlug, rawData);
    }
  }
  return cleanSlug;
}
window.updateTenantSlug = updateTenantSlug;

function createTenant(tenantObj) {
  var tenants = getTenants();
  var id = tenantObj.id || tenantObj.slug || ('SCH' + Date.now().toString(36).toUpperCase());
  tenantObj.id = id;
  tenantObj.slug = normalizeSlug(tenantObj.slug || tenantObj.name || id);
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
      email: tenantObj.email || 'contact@school.edu',
      slug: tenantObj.slug
    };
  } else {
    copy.schoolProfile.name = tenantObj.name || copy.schoolProfile.name;
    copy.schoolProfile.slug = tenantObj.slug;
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
  localStorage.setItem('schoolData_' + tenantObj.slug, JSON.stringify(copy));
  return tenantObj;
}
window.createTenant = createTenant;

