// ===== School Profile Editor & Landing Page Renderer =====

function getSchoolProfile() {
  if (!data.schoolProfile) {
    data.schoolProfile = JSON.parse(JSON.stringify(getDefaultData().schoolProfile));
  }
  return data.schoolProfile;
}

function getSchoolLogoUrl() {
  try {
    var prof = getSchoolProfile();
    if (prof.logoUrl && typeof prof.logoUrl === 'string' && prof.logoUrl.trim()) return prof.logoUrl.trim();
  } catch(e) {}
  return '';
}

function previewSchoolLogo() {
  var url = document.getElementById('spLogoUrl');
  var preview = document.getElementById('spLogoPreview');
  if (!url || !preview) return;
  var val = url.value.trim();
  if (val) {
    preview.style.display = 'flex';
    preview.innerHTML = '<img src="' + esc(val) + '" style="max-width:100%;max-height:100%;" onerror="this.parentElement.style.display=\'none\'">';
  } else {
    preview.style.display = 'none';
  }
}

function uploadSchoolLogo(input) {
  if (!input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var urlInput = document.getElementById('spLogoUrl');
    if (urlInput) {
      urlInput.value = e.target.result;
      spUpdate('logoUrl', e.target.result);
      previewSchoolLogo();
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function copySchoolLink() {
  var input = document.getElementById('spSchoolUrl');
  if (!input) return;
  input.select();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(function() { showToast('School link copied!'); });
    } else {
      document.execCommand('copy');
      showToast('School link copied!');
    }
  } catch(e) {
    showToast('Press Ctrl+C to copy');
  }
}

// ===== Admin Editor =====

function renderSchoolProfile() {
  var prof = getSchoolProfile();
  var el = document.getElementById('schoolProfileEditor');
  if (!el) return;
  var html = '<div class="profile-editor">';

  // General
  html += '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-cog"></i> General Settings</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body open">'
    + '<div class="form-row"><label>School Name</label><input type="text" id="spSchoolName" value="' + esc(prof.schoolName || '') + '" oninput="spUpdate(\'schoolName\',this.value)"></div>'
    + '<div class="form-row"><label>School Logo</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<input type="text" id="spLogoUrl" value="' + esc(prof.logoUrl || '') + '" placeholder="Paste image URL..." oninput="spUpdate(\'logoUrl\',this.value);previewSchoolLogo()" style="flex:1;min-width:180px;">'
    + '<input type="file" accept="image/*" onchange="uploadSchoolLogo(this)" style="font-size:13px;">'
    + '<div id="spLogoPreview" style="width:40px;height:40px;border-radius:6px;overflow:hidden;border:1px solid #ddd;display:' + (prof.logoUrl ? 'flex' : 'none') + ';align-items:center;justify-content:center;"><img src="' + esc(prof.logoUrl || '') + '" style="max-width:100%;max-height:100%;" onerror="this.parentElement.style.display=\'none\'"></div>'
    + '</div></div>'
    + '<div class="form-row"><label>Hero Title</label><input type="text" id="spHeroTitle" value="' + esc(prof.heroTitle || '') + '" oninput="spUpdate(\'heroTitle\',this.value)"></div>'
    + '<div class="form-row"><label>Hero Subtitle</label><textarea rows="2" oninput="spUpdate(\'heroSubtitle\',this.value)">' + esc(prof.heroSubtitle || '') + '</textarea></div>'
    + '<div class="form-row"><label>About Text</label><textarea rows="3" oninput="spUpdate(\'aboutText\',this.value)">' + esc(prof.aboutText || '') + '</textarea></div>'
    + '<div class="form-row"><label>Contact Email</label><input type="email" value="' + esc(prof.contactEmail || '') + '" oninput="spUpdate(\'contactEmail\',this.value)"></div>'
    + '<div class="form-row"><label>Contact Phone</label><input type="text" value="' + esc(prof.contactPhone || '') + '" oninput="spUpdate(\'contactPhone\',this.value)"></div>'
    + '<div class="form-row"><label>Address</label><textarea rows="2" oninput="spUpdate(\'contactAddress\',this.value)">' + esc(prof.contactAddress || '') + '</textarea></div>'
    + '<div class="form-row"><label>Share School Page</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<input type="text" id="spSchoolUrl" readonly value="' + esc(typeof getCurrentSchoolUrl === 'function' ? getCurrentSchoolUrl() : '') + '" style="flex:1;min-width:180px;font-size:12px;color:var(--text-light);background:#f8fafc;cursor:text;" onclick="this.select()">'
    + '<button class="btn btn-sm btn-primary" onclick="copySchoolLink()"><i class="fas fa-copy"></i> Copy</button>'
    + '</div></div>'
    + '</div></div>';

  var sections = [
    { key: 'services', icon: 'fa-concierge-bell', label: 'Services', fields: ['icon','title','description'], phs: ['fa-icon','Service title','Description'] },
    { key: 'courses', icon: 'fa-book', label: 'Courses', fields: ['icon','title','description','duration'], phs: ['fa-icon','Course title','Description','Duration e.g. Full Term'] },
    { key: 'activities', icon: 'fa-running', label: 'Activities', fields: ['name','type','description','schedule'], phs: ['Activity name','Sports/Academic/Arts','Description','Schedule e.g. Mon & Wed 3-5pm'] },
    { key: 'features', icon: 'fa-star', label: 'Portal Features', fields: ['icon','title','description'], phs: ['fa-icon','Feature title','Description'] },
    { key: 'events', icon: 'fa-calendar-alt', label: 'Events', fields: ['title','date','description'], phs: ['Event title','Date e.g. 2026-09-15','Description'] },
    { key: 'testimonials', icon: 'fa-quote-right', label: 'Testimonials', fields: ['name','text','role'], phs: ['Name','Testimonial text','Role e.g. Parent'] }
  ];

  sections.forEach(function(s) {
    var items = prof[s.key] || [];
    html += '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
      + '<span><i class="fas ' + s.icon + '"></i> ' + s.label + ' <span class="sp-badge">' + items.length + '</span></span>'
      + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddItem(\'' + s.key + '\', event)"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
      + '<div class="profile-section-body"><div id="spList-' + s.key + '"></div></div></div>';
  });

  html += '</div>';
  el.innerHTML = html;

  sections.forEach(function(s) { renderProfileItemList(s.key); });
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function spUpdate(field, val) {
  getSchoolProfile()[field] = val;
}

function toggleProfileSection(header) {
  var body = header.nextElementSibling;
  if (body) {
    body.classList.toggle('open');
    header.classList.toggle('collapsed');
  }
}

function renderProfileItemList(key) {
  var prof = getSchoolProfile();
  var items = prof[key] || [];
  var el = document.getElementById('spList-' + key);
  if (!el) return;

  var fields = [];
  var phs = [];
  var sections = [
    { key: 'services', fields: ['icon','title','description'], phs: ['Icon class e.g. fa-graduation-cap','Title','Description'] },
    { key: 'courses', fields: ['icon','title','description','duration'], phs: ['Icon class','Title','Description','Duration'] },
    { key: 'activities', fields: ['name','type','description','schedule'], phs: ['Name','Type (Sports/Academic/Arts)','Description','Schedule'] },
    { key: 'features', fields: ['icon','title','description'], phs: ['Icon class','Title','Description'] },
    { key: 'events', fields: ['title','date','description'], phs: ['Title','Date e.g. 2026-09-15','Description'] },
    { key: 'testimonials', fields: ['name','text','role'], phs: ['Name','Text','Role'] }
  ];

  var found = sections.find(function(s) { return s.key === key; });
  if (found) { fields = found.fields; phs = found.phs; }

  if (!items.length) {
    el.innerHTML = '<p class="empty-state" style="margin:12px 0;">No items yet. Click "Add" to create one.</p>';
    return;
  }

  var html = '';
  items.forEach(function(item, i) {
    html += '<div class="sp-item">';
    fields.forEach(function(f, fi) {
      var val = item[f] || '';
      html += '<div class="sp-item-field"><label>' + fields[fi] + '</label>'
        + '<input type="text" value="' + esc(val) + '" placeholder="' + esc(phs[fi]) + '" '
        + 'onchange="spEditItem(\'' + key + '\',' + i + ',\'' + f + '\',this.value)"></div>';
    });
    html += '<div class="sp-item-actions">'
      + '<button class="btn btn-sm btn-danger" onclick="spDeleteItem(\'' + key + '\',' + i + ')"><i class="fas fa-trash"></i></button>'
      + '</div></div>';
  });
  el.innerHTML = html;
}

function spAddItem(key, e) {
  if (e) e.stopPropagation();
  var prof = getSchoolProfile();
  if (!prof[key]) prof[key] = [];

  var newItem = {};
  var sections = {
    services: { icon: 'fa-plus-circle', title: 'New Service', description: '' },
    courses: { icon: 'fa-plus-circle', title: 'New Course', description: '', duration: 'Full Term' },
    activities: { name: 'New Activity', type: 'Sports', description: '', schedule: '' },
    features: { icon: 'fa-plus-circle', title: 'New Feature', description: '' },
    events: { title: 'New Event', date: new Date().toISOString().split('T')[0], description: '' },
    testimonials: { name: '', text: '', role: '' }
  };
  var def = sections[key] || {};
  Object.keys(def).forEach(function(k) { newItem[k] = def[k]; });

  prof[key].push(newItem);
  renderProfileItemList(key);
  updateSpBadge(key, prof[key].length);
}

function spDeleteItem(key, index) {
  if (!confirm('Delete this item?')) return;
  var prof = getSchoolProfile();
  if (prof[key]) {
    prof[key].splice(index, 1);
    renderProfileItemList(key);
    updateSpBadge(key, prof[key].length);
  }
}

function updateSpBadge(key, count) {
  var el = document.getElementById('spList-' + key);
  if (el) {
    var badge = el.closest('.profile-section').querySelector('.sp-badge');
    if (badge) badge.textContent = String(count);
  }
}

function spEditItem(key, index, field, value) {
  var prof = getSchoolProfile();
  if (prof[key] && prof[key][index]) {
    prof[key][index][field] = value;
  }
}

function saveSchoolProfile() {
  saveData();
  renderLandingPageSections();
  showToast('School profile saved and portal updated!');
}

function resetSchoolProfile() {
  if (!confirm('Reset all school profile fields to defaults?')) return;
  var defaults = JSON.parse(JSON.stringify(getDefaultData().schoolProfile));
  data.schoolProfile = defaults;
  saveData();
  renderSchoolProfile();
  renderLandingPageSections();
  showToast('Profile reset to defaults');
}

// ===== Landing Page Rendering =====

function renderLandingPageSections() {
  var prof = getSchoolProfile();

  // One-time migration: replace old branding strings in profile data
  var needsSave = false;
  function migrateBranding(obj) {
    if (typeof obj === 'string' && obj.includes('OMOLOLA')) { needsSave = true; return obj.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE'); }
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) obj[i] = migrateBranding(obj[i]); return obj; }
    if (obj && typeof obj === 'object') { for (var k in obj) obj[k] = migrateBranding(obj[k]); return obj; }
    return obj;
  }
  // Clean schoolProfile, schoolName, and schoolMotto
  prof = migrateBranding(prof);
  if (data.schoolName && typeof data.schoolName === 'string' && data.schoolName.includes('OMOLOLA')) {
    data.schoolName = migrateBranding(data.schoolName); needsSave = true;
  }
  if (data.schoolMotto && typeof data.schoolMotto === 'string' && data.schoolMotto.includes('OMOLOLA')) {
    data.schoolMotto = migrateBranding(data.schoolMotto); needsSave = true;
  }
  if (needsSave) { data.schoolProfile = prof; saveData(); }

  // Use tenant name as fallback for school name
  var schoolName = prof.schoolName || '';
  if (!schoolName) {
    try {
      var activeTenant = localStorage.getItem('activeTenant');
      if (activeTenant && typeof getTenants === 'function') {
        var tenants = getTenants();
        var tenant = tenants.find(function(t) { return t.id === activeTenant; });
        if (tenant) schoolName = tenant.name;
      }
    } catch(e) {}
  }
  if (!schoolName) schoolName = 'EDUVERSE';

  // Nav school name
  var navName = document.getElementById('navSchoolName');
  if (navName) navName.textContent = schoolName;

  // School logo — update all .school-logo-img elements
  var logoUrl = getSchoolLogoUrl();
  document.querySelectorAll('.school-logo-img').forEach(function(img) {
    if (logoUrl) {
      img.src = logoUrl;
      img.style.display = '';
    } else {
      img.style.display = 'none';
    }
  });

  // Hide EDUVERSE platform & super admin buttons on school profiles
  ['navJoinBtn', 'heroJoinBtn', 'superAdminCog'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.style.display = 'none';
  });

  // Update auth-gated elements on landing page
  if (typeof updateAuthGating === 'function') updateAuthGating();

  // Show demo mode banner
  try {
    if (localStorage.getItem('demoMode') === 'true' && !document.getElementById('demoModeBanner')) {
      var banner = document.createElement('div');
      banner.id = 'demoModeBanner';
      banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#744210,#975a16);color:#fff;padding:10px 20px;text-align:center;font-size:14px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;';
      banner.innerHTML = '<span><i class="fas fa-flask"></i> <strong>Demo Mode</strong> — Exploring Demo International School</span><span style="font-size:12px;opacity:0.9;">Admin: admin@demo.com / demo123 &nbsp;|&nbsp; Student: STU001 / stu001 &nbsp;|&nbsp; Teacher: TCH001 / teacher123</span><button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);" onclick="exitDemoMode()"><i class="fas fa-times"></i> Exit Demo</button>';
      document.body.appendChild(banner);
    }
  } catch(e) {}

  // Services
  var sGrid = document.getElementById('servicesGrid');
  if (sGrid && prof.services) {
    var sGradients = ['135deg, var(--primary), var(--primary-light)','135deg, var(--primary-light), var(--primary)','135deg, var(--primary), #1a5c3a','135deg, #1a5c3a, var(--primary)','135deg, #2a5a8c, var(--primary)','135deg, var(--primary), #2a5a8c'];
    if (prof.services.length) {
      sGrid.innerHTML = prof.services.map(function(s, i) {
        var gi = i % sGradients.length;
        return '<div class="service-card"><div class="img-box" style="background:linear-gradient(' + sGradients[gi] + ');display:flex;align-items:center;justify-content:center;"><i class="fas ' + htmlEscape(s.icon) + '" style="font-size:64px;color:var(--accent);opacity:0.6;"></i></div>'
          + '<div class="info-box"><div class="icon-box"><i class="fas ' + htmlEscape(s.icon) + '"></i></div><h4>' + esc(s.title) + '</h4><p>' + esc(s.description) + '</p></div></div>';
      }).join('');
    } else {
      sGrid.innerHTML = '<p class="empty-state" style="grid-column:1/-1;text-align:center;padding:40px;">No services listed yet. Admin can add them in School Profile.</p>';
    }
  }

  // Courses
  var cGrid = document.getElementById('coursesGrid');
  if (cGrid && prof.courses) {
    var colors = ['#1a3a5c,#2a5a8c','#2a5a8c,#1a3a5c','#1a5c3a,#2a7a4a','#5c3a1a,#7a4a2a','#3a1a5c,#5a2a8c','#5c1a3a,#7a2a5a'];
    if (prof.courses.length) {
      cGrid.innerHTML = prof.courses.map(function(c, i) {
        var ci = i % colors.length;
        return '<div class="course-card"><div class="img-box" style="background:linear-gradient(45deg,' + colors[ci] + ');display:flex;align-items:center;justify-content:center;"><i class="fas ' + htmlEscape(c.icon) + '" style="font-size:48px;color:var(--accent);"></i></div>'
          + '<div class="info-box"><h5><a href="javascript:;">' + esc(c.title) + '</a></h5><span>' + esc(c.description) + '</span></div>'
          + '<div class="meta"><span><i class="fas fa-clock" style="color:var(--accent);"></i> ' + esc(c.duration || 'Full Term') + '</span></div></div>';
      }).join('');
    } else {
      cGrid.innerHTML = '<p class="empty-state" style="grid-column:1/-1;text-align:center;padding:40px;">No courses published yet. Admin can add them in School Profile.</p>';
    }
  }

  // Features
  var fGrid = document.getElementById('featuresContainer');
  if (fGrid && prof.features) {
    if (prof.features.length) {
      fGrid.innerHTML = prof.features.map(function(f) {
        return '<div class="feat-item"><div class="icon"><i class="fas ' + htmlEscape(f.icon) + '"></i></div><h3>' + esc(f.title) + '</h3><p>' + esc(f.description) + '</p></div>';
      }).join('');
    } else {
      fGrid.innerHTML = '<p class="empty-state" style="text-align:center;padding:40px;">No features configured yet.</p>';
    }
  }

  // Events
  var eGrid = document.getElementById('eventsGrid');
  if (eGrid && prof.events) {
    if (prof.events.length) {
      eGrid.innerHTML = prof.events.map(function(ev) {
        var d = ev.date ? new Date(ev.date) : new Date();
        var day = d.getDate();
        var month = d.toLocaleString('default', { month: 'short' });
        return '<div class="event-card"><div class="date-box"><span class="day">' + day + '</span><span class="month">' + month + '</span></div>'
          + '<div class="event-info"><h4><a href="javascript:;">' + esc(ev.title) + '</a></h4>'
          + '<div class="meta"><span><i class="fa fa-calendar"></i> ' + esc(ev.date || '') + '</span></div>'
          + '<p>' + esc(ev.description) + '</p></div></div>';
      }).join('');
    } else {
      eGrid.innerHTML = '<p class="empty-state" style="grid-column:1/-1;text-align:center;padding:40px;">No upcoming events. Admin can add them in School Profile.</p>';
    }
  }

  // Testimonials
  var tGrid = document.getElementById('testimonialsGrid');
  if (tGrid && prof.testimonials) {
    if (prof.testimonials.length) {
      tGrid.innerHTML = prof.testimonials.map(function(t) {
        var avatar = '<i class="fas fa-user"></i>';
        if (t.role && t.role.toLowerCase().includes('student')) avatar = '<i class="fas fa-user-graduate"></i>';
        else if (t.role && t.role.toLowerCase().includes('teacher')) avatar = '<i class="fas fa-chalkboard-teacher"></i>';
        else if (t.role && t.role.toLowerCase().includes('parent')) avatar = '<i class="fas fa-user-tie"></i>';
        return '<div class="testimonial-card"><div class="avatar">' + avatar + '</div><div class="name">' + esc(t.name) + '</div>'
          + '<div class="role">' + esc(t.role || '') + '</div><div class="text">' + esc(t.text) + '</div></div>';
      }).join('');
    } else {
      tGrid.innerHTML = '<p class="empty-state" style="text-align:center;padding:40px;">No testimonials yet.</p>';
    }
  }

  // Footer about & contact
  var footerAbout = document.getElementById('footerAboutText');
  if (footerAbout) footerAbout.textContent = prof.aboutText || 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM is committed to providing quality education that nurtures academic excellence, character development, and lifelong learning skills in every student.';
  var footerContact = document.getElementById('footerContact');
  if (footerContact) {
    footerContact.innerHTML = '<strong><i class="fa fa-map-marker"></i></strong> ' + esc(prof.contactAddress || '') + '<br>'
      + '<strong><i class="fa fa-phone"></i></strong> ' + esc(prof.contactPhone || '') + '<br>'
      + '<strong><i class="fa fa-envelope"></i></strong> ' + esc(prof.contactEmail || '');
  }

  // Section titles
  if (schoolName) {
    document.querySelectorAll('.section-title p').forEach(function(p) {
      if (p.textContent.includes('EDUVERSE')) {
        p.textContent = p.textContent.replace(/EDUVERSE/g, schoolName);
      }
    });
  }
}

// Show toast notification
function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--success,#2e7d32);color:white;padding:14px 24px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:fadeIn 0.3s ease;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; setTimeout(function() { t.remove(); }, 500); }, 3000);
}


