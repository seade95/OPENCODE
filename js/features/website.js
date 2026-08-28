// EduVerse - website module
// Extracted from features.js

// ===== WEBSITE BUILDER & CMS LANDING PAGE =====

function getWebsiteConfig() {
  if (!data.websiteConfig) {
    var def = getDefaultData();
    data.websiteConfig = JSON.parse(JSON.stringify(def.websiteConfig));
  }
  return data.websiteConfig;
}

function renderWebsiteBuilder() {
  var container = document.getElementById('websiteBuilderContainer');
  if (!container) return;
  var cfg = getWebsiteConfig();
  var subdomain = cfg.subdomain || data.schoolProfile?.schoolName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'myschool';
  var siteUrl = subdomain ? window.location.origin + '/?site=' + encodeURIComponent(subdomain) : '—';

  var html = '<div class="website-builder-layout" style="display:flex;gap:20px;flex-wrap:wrap;">'
    + '<div class="card" style="flex:1;min-width:300px;">'
    + '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">'
    + '<button class="btn btn-sm btn-primary" onclick="showWebsiteTab(\'general\')" id="wbTabGeneral" style="flex:1;">General</button>'
    + '<button class="btn btn-sm" onclick="showWebsiteTab(\'sections\')" id="wbTabSections" style="flex:1;">Sections</button>'
    + '<button class="btn btn-sm" onclick="showWebsiteTab(\'announce\')" id="wbTabAnnounce" style="flex:1;">Announcements</button>'
    + '<button class="btn btn-sm" onclick="showWebsiteTab(\'gallery\')" id="wbTabGallery" style="flex:1;">Gallery</button>'
    + '<button class="btn btn-sm" onclick="showWebsiteTab(\'contact\')" id="wbTabContact" style="flex:1;">Contact</button>'
    + '</div>'
    + '<div id="websiteTabContent"></div>'
    + '</div>'
    + '<div class="card" style="flex:0 0 280px;background:var(--surface);">'
    + '<h4 style="font-size:14px;font-weight:600;margin-bottom:8px;"><i class="fas fa-link"></i> Your Public Website</h4>'
    + '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">Each school gets a unique public web address. Visitors can view your announcements, gallery, and contact info.</p>'
    + '<div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:13px;word-break:break-all;"><strong>URL:</strong><br><a href="' + esc(siteUrl) + '" target="_blank" style="color:var(--primary);">' + esc(siteUrl) + '</a></div>'
    + '<label style="display:block;margin-top:12px;font-size:13px;font-weight:500;">Subdomain</label>'
    + '<input type="text" id="wbSubdomain" value="' + esc(subdomain) + '" style="width:100%;padding:8px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;margin-top:4px;" placeholder="your-school-slug">'
    + '<label style="display:block;margin-top:8px;font-size:13px;"><input type="checkbox" id="wbEnabled" ' + (cfg.enabled ? 'checked' : '') + '> <strong>Website Published</strong></label>'
    + '</div>'
    + '</div>';
  container.innerHTML = html;
  showWebsiteTab('general');
}

var _websiteCurrentTab = 'general';

function showWebsiteTab(tab) {
  _websiteCurrentTab = tab;
  document.querySelectorAll('[id^=wbTab]').forEach(function(b) { b.className = 'btn btn-sm'; });
  var btn = document.getElementById('wbTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (btn) btn.className = 'btn btn-sm btn-primary';
  var content = document.getElementById('websiteTabContent');
  if (!content) return;
  if (tab === 'general') renderWebsiteGeneral(content);
  else if (tab === 'sections') renderWebsiteSections(content);
  else if (tab === 'announce') renderWebsiteAnnouncements(content);
  else if (tab === 'gallery') renderWebsiteGallery(content);
  else if (tab === 'contact') renderWebsiteContact(content);
}

function renderWebsiteGeneral(container) {
  var cfg = getWebsiteConfig();
  var sp = data.schoolProfile || {};
  container.innerHTML = '<div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'
    + '<div class="form-group"><label>School Name (on website)</label><input type="text" id="wbSchoolName" value="' + esc(cfg.schoolName || sp.schoolName || '') + '" class="form-input"></div>'
    + '<div class="form-group"><label>Motto / Tagline</label><input type="text" id="wbMotto" value="' + esc(cfg.motto || sp.schoolMotto || '') + '" class="form-input"></div>'
    + '<div class="form-group"><label>Primary Color</label><input type="color" id="wbPrimaryColor" value="' + esc(cfg.primaryColor || '#1e40af') + '" style="width:100%;height:40px;border:2px solid #e2e8f0;border-radius:6px;cursor:pointer;"></div>'
    + '<div class="form-group"><label>Secondary Color</label><input type="color" id="wbSecondaryColor" value="' + esc(cfg.secondaryColor || '#059669') + '" style="width:100%;height:40px;border:2px solid #e2e8f0;border-radius:6px;cursor:pointer;"></div>'
    + '<div class="form-group" style="grid-column:1/3;"><label>Font Family</label><select id="wbFont" class="form-input"><option value="Inter, sans-serif"' + (cfg.fontFamily === 'Inter, sans-serif' ? ' selected' : '') + '>Inter</option><option value="Arial, sans-serif"' + (cfg.fontFamily === 'Arial, sans-serif' ? ' selected' : '') + '>Arial</option><option value="Georgia, serif"' + (cfg.fontFamily === 'Georgia, serif' ? ' selected' : '') + '>Georgia</option><option value="Tahoma, sans-serif"' + (cfg.fontFamily === 'Tahoma, sans-serif' ? ' selected' : '') + '>Tahoma</option><option value="Trebuchet MS, sans-serif"' + (cfg.fontFamily === 'Trebuchet MS, sans-serif' ? ' selected' : '') + '>Trebuchet MS</option></select></div>'
    + '<div class="form-group" style="grid-column:1/3;"><label>School Logo <span style="font-size:11px;color:var(--text-light);">(recommended: 200x200px PNG)</span></label>'
    + '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">'
    + (cfg.logo ? '<img src="' + esc(cfg.logo) + '" style="width:60px;height:60px;object-fit:contain;border-radius:8px;border:1px solid #e2e8f0;">' : '')
    + '<input type="file" accept="image/*" onchange="uploadWebsiteLogo(this)" style="font-size:13px;"></div></div>'
    + '<div class="form-group" style="grid-column:1/3;"><label>Banner Image <span style="font-size:11px;color:var(--text-light);">(recommended: 1200x400px)</span></label>'
    + '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">'
    + (cfg.banner ? '<img src="' + esc(cfg.banner) + '" style="width:120px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;">' : '')
    + '<input type="file" accept="image/*" onchange="uploadWebsiteBanner(this)" style="font-size:13px;"></div></div>'
    + '</div>';
}

function renderWebsiteSections(container) {
  var cfg = getWebsiteConfig();
  var sections = cfg.sections || [];
  sections.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  var html = '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;">Content Sections</h4>'
    + '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">Manage which sections appear on your public website and in what order.</p>'
    + '<div id="wbSectionList">';
  sections.forEach(function(sec, i) {
    html += '<div class="card" style="margin-bottom:8px;padding:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '<div style="flex:1;min-width:150px;"><strong>' + esc(sec.title) + '</strong> <span style="font-size:11px;color:var(--text-light);text-transform:uppercase;">' + esc(sec.type) + '</span></div>'
      + '<label style="font-size:13px;"><input type="checkbox" ' + (sec.visible !== false ? 'checked' : '') + ' onchange="websiteToggleSection(\'' + sec.id + '\')"> Visible</label>';
    if (sec.type === 'about' || sec.type === 'hero') {
      html += '<button class="btn btn-sm btn-outline" onclick="websiteEditSectionContent(\'' + sec.id + '\')"><i class="fas fa-edit"></i> Edit Content</button>';
    }
    if (i > 0) html += '<button class="btn btn-sm btn-outline" onclick="websiteMoveSection(\'' + sec.id + '\',-1)"><i class="fas fa-chevron-up"></i></button>';
    if (i < sections.length - 1) html += '<button class="btn btn-sm btn-outline" onclick="websiteMoveSection(\'' + sec.id + '\',1)"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="btn btn-sm btn-danger" onclick="websiteRemoveSection(\'' + sec.id + '\')"><i class="fas fa-trash"></i></button>'
      + '</div>';
  });
  html += '</div>'
    + '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">'
    + '<button class="btn btn-sm btn-primary" onclick="websiteAddSection(\'about\')"><i class="fas fa-plus"></i> Add About Section</button>'
    + '<button class="btn btn-sm btn-primary" onclick="websiteAddSection(\'hero\')"><i class="fas fa-plus"></i> Add Hero Section</button>'
    + '<button class="btn btn-sm btn-primary" onclick="websiteAddSection(\'custom\')"><i class="fas fa-plus"></i> Add Custom Text</button>'
    + '<button class="btn btn-sm btn-primary" onclick="websiteAddSection(\'cbt\')"><i class="fas fa-plus"></i> Add CBT Section</button>'
    + '</div>';
  container.innerHTML = html;
}

function websiteToggleSection(id) {
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.id === id; });
  if (sec) sec.visible = !sec.visible;
}

function websiteEditSectionContent(id) {
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.id === id; });
  if (!sec) return;
  var content = prompt('Edit content for "' + sec.title + '":', sec.content || '');
  if (content !== null) sec.content = content;
  showWebsiteTab('sections');
}

function websiteAddSection(type) {
  var cfg = getWebsiteConfig();
  var maxOrder = 0;
  cfg.sections.forEach(function(s) { if (s.order > maxOrder) maxOrder = s.order; });
  var id = 'sec-' + type + '-' + Date.now();
  var titles = { about: 'About', hero: 'Hero Section', custom: 'Custom Content', cbt: 'CBT Exams' };
  var sec = { id: id, type: type, title: titles[type] || 'New Section', content: '', visible: true, order: maxOrder + 1 };
  if (type === 'announcements') sec.items = [];
  if (type === 'gallery') sec.images = [];
  if (type === 'cbt') { sec.exams = []; sec.cbtTitle = 'Computer-Based Testing'; sec.cbtHeadline = ''; sec.cbtDescription = ''; sec.registrationOpen = false; }
  cfg.sections.push(sec);
  showWebsiteTab('sections');
}

function websiteRemoveSection(id) {
  if (!confirm('Remove this section?')) return;
  var cfg = getWebsiteConfig();
  cfg.sections = cfg.sections.filter(function(s) { return s.id !== id; });
  showWebsiteTab('sections');
}

function websiteMoveSection(id, dir) {
  var cfg = getWebsiteConfig();
  var sorted = cfg.sections.slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  var idx = sorted.findIndex(function(s) { return s.id === id; });
  if (idx === -1) return;
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= sorted.length) return;
  var temp = sorted[idx].order;
  sorted[idx].order = sorted[newIdx].order;
  sorted[newIdx].order = temp;
  showWebsiteTab('sections');
}

function renderWebsiteAnnouncements(container) {
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.type === 'announcements'; });
  var items = sec ? sec.items || [] : [];
  var html = '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;">Public Announcements</h4>'
    + '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">These announcements appear on your school\'s public website.</p>';
  if (!sec) {
    html += '<p style="color:var(--text-light);">Add an "Announcements" section in the Sections tab first.</p>';
  } else {
    html += '<div class="card" style="margin-bottom:12px;padding:16px;">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
      + '<div class="form-group"><label>Title</label><input type="text" id="wbAnnTitle" class="form-input" placeholder="Announcement title"></div>'
      + '<div class="form-group"><label>Date</label><input type="date" id="wbAnnDate" class="form-input" value="' + new Date().toISOString().slice(0, 10) + '"></div>'
      + '</div>'
      + '<div class="form-group"><label>Content</label><textarea id="wbAnnBody" class="form-input" rows="3" placeholder="Announcement details..."></textarea></div>'
      + '<button class="btn btn-sm btn-primary" onclick="websiteAddAnnouncement()"><i class="fas fa-plus"></i> Add Announcement</button>'
      + '</div>'
      + '<div id="wbAnnList">';
    items.forEach(function(item, i) {
      html += '<div class="card" style="margin-bottom:6px;padding:12px;display:flex;gap:12px;align-items:flex-start;">'
        + '<div style="flex:1;"><strong>' + esc(item.title) + '</strong> <span style="font-size:11px;color:var(--text-light);">' + esc(item.date || '') + '</span>'
        + '<p style="font-size:13px;margin:4px 0 0;color:var(--text-light);">' + esc(item.content || '').substring(0, 120) + '</p></div>'
        + '<button class="btn btn-sm btn-danger" onclick="websiteRemoveAnnouncement(' + i + ')"><i class="fas fa-times"></i></button>'
        + '</div>';
    });
    if (!items.length) html += '<p style="text-align:center;color:var(--text-light);padding:20px;">No announcements yet.</p>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function websiteAddAnnouncement() {
  var title = document.getElementById('wbAnnTitle')?.value?.trim();
  var content = document.getElementById('wbAnnBody')?.value?.trim();
  var date = document.getElementById('wbAnnDate')?.value;
  if (!title) { toast('Enter a title', 'error'); return; }
  if (!content) { toast('Enter announcement content', 'error'); return; }
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.type === 'announcements'; });
  if (!sec) { toast('Announcements section not found. Add it in Sections tab.', 'error'); return; }
  if (!sec.items) sec.items = [];
  sec.items.push({ title: title, content: content, date: date || new Date().toISOString().slice(0, 10) });
  showWebsiteTab('announce');
  toast('Announcement added!');
}

function websiteRemoveAnnouncement(idx) {
  if (!confirm('Remove this announcement?')) return;
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.type === 'announcements'; });
  if (sec && sec.items) sec.items.splice(idx, 1);
  showWebsiteTab('announce');
}

function renderWebsiteGallery(container) {
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.type === 'gallery'; });
  var images = sec ? sec.images || [] : [];
  var html = '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;">Photo Gallery</h4>'
    + '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">Photos uploaded here appear in the gallery section of your public website.</p>';
  if (!sec) {
    html += '<p style="color:var(--text-light);">Add a "Photo Gallery" section in the Sections tab first.</p>';
  } else {
    html += '<div class="card" style="margin-bottom:12px;padding:16px;">'
      + '<div class="form-group"><label>Add Image</label><input type="file" accept="image/*" onchange="websiteAddGalleryImage(this)" style="font-size:13px;"></div>'
      + '<div class="form-group" style="margin-top:8px;"><label>Caption (optional)</label><input type="text" id="wbGalleryCaption" class="form-input" placeholder="Image caption"></div>'
      + '</div>'
      + '<div id="wbGalleryGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">';
    images.forEach(function(img, i) {
      html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;position:relative;">'
        + '<img src="' + esc(img.src || '') + '" style="width:100%;height:100px;object-fit:cover;display:block;">'
        + '<div style="padding:6px;font-size:11px;text-align:center;">' + esc(img.caption || '') + '</div>'
        + '<button class="btn btn-sm btn-danger" onclick="websiteRemoveGalleryImage(' + i + ')" style="position:absolute;top:4px;right:4px;padding:2px 6px;font-size:10px;"><i class="fas fa-times"></i></button>'
        + '</div>';
    });
    if (!images.length) html += '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);padding:20px;">No images in gallery.</p>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function websiteAddGalleryImage(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var caption = document.getElementById('wbGalleryCaption')?.value?.trim() || '';
  var reader = new FileReader();
  reader.onload = function(e) {
    var cfg = getWebsiteConfig();
    var sec = cfg.sections.find(function(s) { return s.type === 'gallery'; });
    if (!sec) { toast('Gallery section not found.', 'error'); return; }
    if (!sec.images) sec.images = [];
    sec.images.push({ src: e.target.result, caption: caption });
    showWebsiteTab('gallery');
    toast('Image added to gallery!');
  };
  reader.readAsDataURL(file);
}

function websiteRemoveGalleryImage(idx) {
  if (!confirm('Remove this image?')) return;
  var cfg = getWebsiteConfig();
  var sec = cfg.sections.find(function(s) { return s.type === 'gallery'; });
  if (sec && sec.images) sec.images.splice(idx, 1);
  showWebsiteTab('gallery');
}

function renderWebsiteContact(container) {
  var cfg = getWebsiteConfig();
  var sp = data.schoolProfile || {};
  var html = '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;">Contact Information</h4>'
    + '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">This info is shown on your public website contact section.</p>'
    + '<div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'
    + '<div class="form-group"><label>School Email</label><input type="email" id="wbContactEmail" class="form-input" value="' + esc(sp.contactEmail || '') + '" placeholder="info@school.edu"></div>'
    + '<div class="form-group"><label>Phone Number</label><input type="text" id="wbContactPhone" class="form-input" value="' + esc(sp.contactPhone || '') + '" placeholder="+2347069332955"></div>'
    + '<div class="form-group" style="grid-column:1/3;"><label>Address</label><input type="text" id="wbContactAddress" class="form-input" value="' + esc(sp.contactAddress || '') + '" placeholder="School address"></div>'
    + '</div>';
  container.innerHTML = html;
}

function uploadWebsiteLogo(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var cfg = getWebsiteConfig();
    cfg.logo = e.target.result;
    showWebsiteTab('general');
    toast('Logo uploaded!');
  };
  reader.readAsDataURL(file);
}

function uploadWebsiteBanner(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var cfg = getWebsiteConfig();
    cfg.banner = e.target.result;
    showWebsiteTab('general');
    toast('Banner uploaded!');
  };
  reader.readAsDataURL(file);
}

function collectWebsiteConfig() {
  var cfg = getWebsiteConfig();
  cfg.schoolName = document.getElementById('wbSchoolName')?.value?.trim() || cfg.schoolName;
  cfg.motto = document.getElementById('wbMotto')?.value?.trim() || cfg.motto;
  cfg.primaryColor = document.getElementById('wbPrimaryColor')?.value || cfg.primaryColor;
  cfg.secondaryColor = document.getElementById('wbSecondaryColor')?.value || cfg.secondaryColor;
  cfg.fontFamily = document.getElementById('wbFont')?.value || cfg.fontFamily;
  cfg.subdomain = document.getElementById('wbSubdomain')?.value?.trim() || cfg.subdomain;
  cfg.enabled = document.getElementById('wbEnabled')?.checked || false;
  return cfg;
}

function saveWebsiteConfig() {
  collectWebsiteConfig();
  saveData();
  toast('Website config saved!');
  renderWebsiteBuilder();
}

function previewWebsite() {
  collectWebsiteConfig();
  var cfg = getWebsiteConfig();
  var html = buildPublicWebsiteHTML(cfg);
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:white;overflow:auto;';
  var closeBtn = document.createElement('div');
  closeBtn.style.cssText = 'position:sticky;top:0;z-index:10;text-align:right;padding:12px 24px;background:rgba(255,255,255,0.95);border-bottom:1px solid #e2e8f0;';
  closeBtn.innerHTML = '<button onclick="this.parentElement.parentElement.remove()" style="padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;"><i class="fas fa-times"></i> Close Preview</button>';
  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:calc(100vh - 60px);border:none;';
  iframe.srcdoc = html;
  modal.appendChild(closeBtn);
  modal.appendChild(iframe);
  document.body.appendChild(modal);
}

function buildPublicWebsiteHTML(cfg) {
  var sections = (cfg.sections || []).slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  var prim = cfg.primaryColor || '#1e40af';
  var sec = cfg.secondaryColor || '#059669';
  var font = cfg.fontFamily || 'Inter, sans-serif';
  var name = cfg.schoolName || (data.schoolProfile ? data.schoolProfile.schoolName : 'My School');
  var motto = cfg.motto || (data.schoolProfile ? data.schoolProfile.schoolMotto : '') || 'Excellence in Education';
  var logo = cfg.logo || '';
  var banner = cfg.banner || '';
  var contactEmail = data.schoolProfile?.contactEmail || '';
  var contactPhone = data.schoolProfile?.contactPhone || '';
  var contactAddress = data.schoolProfile?.contactAddress || '';

  var navItems = sections.filter(function(s) { return s.visible !== false; }).map(function(s) {
    return '<a href="#' + esc(s.id) + '" style="color:white;text-decoration:none;padding:8px 14px;font-size:14px;border-radius:6px;transition:background 0.2s;">' + esc(s.title) + '</a>';
  }).join('');

  var sectionHTML = sections.filter(function(s) { return s.visible !== false; }).map(function(s) {
    var bg = s.id === 'sec-hero' && (banner || true) ? 'background:linear-gradient(135deg,' + prim + 'dd,' + prim + '88),url(' + (banner ? "'" + banner + "'" : '') + ') center/cover no-repeat;' : '';
    var style = bg || 'padding:48px 24px;';
    var html = '<section id="' + esc(s.id) + '" style="' + style + 'min-height:' + (s.type === 'hero' ? '400px' : 'auto') + ';display:flex;align-items:center;justify-content:center;">'
      + '<div style="max-width:1000px;width:100%;text-align:' + (s.type === 'hero' ? 'center' : 'left') + ';">';
    if (s.type === 'hero') {
      html += (logo ? '<img src="' + esc(logo) + '" style="height:80px;margin-bottom:16px;object-fit:contain;">' : '')
        + '<h1 style="font-size:2.5rem;margin:0 0 8px;color:' + (s.id === 'sec-hero' && banner ? 'white' : prim) + ';">' + esc(name) + '</h1>'
        + '<p style="font-size:1.2rem;color:' + (s.id === 'sec-hero' && banner ? 'rgba(255,255,255,0.9)' : '#666') + ';max-width:600px;margin:0 auto;">' + esc(motto) + '</p>'
        + (s.content ? '<p style="margin-top:16px;color:' + (s.id === 'sec-hero' && banner ? 'rgba(255,255,255,0.85)' : '#555') + ';max-width:700px;margin-left:auto;margin-right:auto;">' + esc(s.content) + '</p>' : '');
    } else if (s.type === 'about') {
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 16px;">' + esc(s.title) + '</h2>'
        + '<p style="font-size:1rem;line-height:1.8;color:#444;max-width:800px;">' + esc(s.content || data.schoolProfile?.aboutText || '') + '</p>';
    } else if (s.type === 'announcements') {
      var items = s.items || [];
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 16px;text-align:center;">' + esc(s.title) + '</h2>';
      if (!items.length) {
        html += '<p style="text-align:center;color:#999;">No announcements at this time.</p>';
      } else {
        html += '<div style="display:grid;gap:16px;">';
        items.forEach(function(item) {
          html += '<div style="background:white;border-radius:10px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-left:4px solid ' + prim + ';">'
            + '<strong style="font-size:1.1rem;">' + esc(item.title) + '</strong>'
            + '<span style="font-size:0.8rem;color:#999;margin-left:12px;">' + esc(item.date || '') + '</span>'
            + '<p style="margin:8px 0 0;color:#555;">' + esc(item.content || '') + '</p>'
            + '</div>';
        });
        html += '</div>';
      }
    } else if (s.type === 'gallery') {
      var images = s.images || [];
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 16px;text-align:center;">' + esc(s.title) + '</h2>';
      if (!images.length) {
        html += '<p style="text-align:center;color:#999;">Gallery coming soon.</p>';
      } else {
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">';
        images.forEach(function(img) {
          html += '<div style="border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">'
            + '<img src="' + esc(img.src || '') + '" style="width:100%;height:160px;object-fit:cover;display:block;">'
            + (img.caption ? '<div style="padding:8px;font-size:13px;text-align:center;background:white;color:#555;">' + esc(img.caption) + '</div>' : '')
            + '</div>';
        });
        html += '</div>';
      }
    } else if (s.type === 'cbt') {
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 8px;text-align:center;">' + esc(s.cbtTitle || 'Computer-Based Testing') + '</h2>'
        + (s.cbtHeadline ? '<p style="text-align:center;color:#666;margin-bottom:20px;max-width:600px;margin-left:auto;margin-right:auto;">' + esc(s.cbtHeadline) + '</p>' : '')
        + (s.cbtDescription ? '<p style="text-align:center;color:#777;max-width:700px;margin:0 auto 24px;">' + esc(s.cbtDescription) + '</p>' : '');
      var cbtExams = s.exams || [];
      if (cbtExams.length) {
        html += '<div style="max-width:500px;margin:0 auto;display:grid;gap:8px;">';
        cbtExams.forEach(function(ex) {
          html += '<div style="background:white;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0;display:flex;align-items:center;gap:12px;">'
            + '<strong>' + esc(ex.title || '') + '</strong>'
            + '<span style="color:#999;font-size:13px;">' + esc(ex.date || '') + '</span>'
            + (ex.className ? '<span style="font-size:12px;color:#999;">' + esc(ex.className) + '</span>' : '')
            + '</div>';
        });
        html += '</div>';
      }
      if (s.registrationOpen) {
        html += '<div style="text-align:center;margin-top:24px;"><a href="#" style="display:inline-block;background:' + prim + ';color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;"><i class="fas fa-pen"></i> Register for CBT Exams</a></div>';
      }
    } else if (s.type === 'contact') {
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 16px;text-align:center;">' + esc(s.title) + '</h2>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:700px;margin:0 auto;">'
        + '<div style="background:white;border-radius:10px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">'
        + '<h4 style="margin:0 0 12px;color:' + prim + ';">Get In Touch</h4>'
        + (contactEmail ? '<p style="margin:4px 0;font-size:14px;color:#555;"><i class="fas fa-envelope" style="color:' + sec + ';width:20px;"></i> ' + esc(contactEmail) + '</p>' : '')
        + (contactPhone ? '<p style="margin:4px 0;font-size:14px;color:#555;"><i class="fas fa-phone" style="color:' + sec + ';width:20px;"></i> ' + esc(contactPhone) + '</p>' : '')
        + (contactAddress ? '<p style="margin:4px 0;font-size:14px;color:#555;"><i class="fas fa-map-marker-alt" style="color:' + sec + ';width:20px;"></i> ' + esc(contactAddress) + '</p>' : '')
        + '</div>'
        + '<div style="background:white;border-radius:10px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">'
        + '<h4 style="margin:0 0 12px;color:' + prim + ';">Send a Message</h4>'
        + '<form onsubmit="alert(\'Message sent! (Demo)\');return false;">'
        + '<input type="text" placeholder="Your Name" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;">'
        + '<input type="email" placeholder="Your Email" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;">'
        + '<textarea placeholder="Your Message" rows="3" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;"></textarea>'
        + '<button type="submit" style="background:' + prim + ';color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;width:100%;">Send Message</button>'
        + '</form></div></div>';
    } else {
      html += '<h2 style="font-size:1.8rem;color:' + prim + ';margin:0 0 16px;">' + esc(s.title) + '</h2>'
        + '<p style="font-size:1rem;line-height:1.8;color:#444;">' + esc(s.content || '') + '</p>';
    }
    html += '</div></section>';
    return html;
  }).join('\n');

  var footer = '<footer style="background:' + prim + ';color:white;text-align:center;padding:24px;font-size:14px;">'
    + '&copy; ' + new Date().getFullYear() + ' ' + esc(name) + '. All rights reserved.</footer>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + '<title>' + esc(name) + '</title>'
    + '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">'
    + '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:' + font + ';background:#f8fafc;color:#333;}'
    + 'nav{background:' + prim + ';padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.1);}'
    + 'nav a:hover{background:rgba(255,255,255,0.15);}'
    + 'section{background:#f8fafc;}section:nth-child(even){background:white;}'
    + '.wb-logo-nav{height:40px;object-fit:contain;}</style></head><body>'
    + '<nav><div style="display:flex;align-items:center;gap:10px;">'
    + (logo ? '<img src="' + esc(logo) + '" class="wb-logo-nav">' : '')
    + '<strong style="color:white;font-size:1.2rem;">' + esc(name) + '</strong></div>'
    + '<div style="display:flex;gap:4px;flex-wrap:wrap;">' + navItems + '</div></nav>'
    + sectionHTML + footer + '</body></html>';
}


// ===== BROADCAST (WhatsApp/SMS) =====
function renderBroadcast() {
  var container = document.getElementById('adminBroadcast');
  if (!container) return;
  var msgs = data.broadcasts || [];
  var wh = data.schoolProfile?.whatsappNumber || data.whatsappNumber || '';
  var html = '<div class="card-header"><h2><i class="fas fa-bullhorn"></i> Broadcast Messages</h2>'
    + '<button class="btn btn-sm btn-primary" onclick="showComposeBroadcast()"><i class="fas fa-plus"></i> New Broadcast</button></div>'
    + '<p class="subtitle">Send announcements to parents, teachers, and students via WhatsApp. Messages are logged for history.</p>'
    + '<div class="card" style="margin-bottom:16px;padding:16px;background:var(--bg-subtle);">'
    + '<strong style="font-size:13px;"><i class="fab fa-whatsapp" style="color:#25D366;"></i> WhatsApp Number:</strong> '
    + (wh ? '<a href="https://wa.me/' + wh.replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--primary);">' + esc(wh) + '</a>' : '<span style="color:var(--text-light);">Not configured. Set in School Profile.</span>')
    + '</div>'
    + '<div id="broadcastComposeArea"></div>'
    + '<h4 style="font-size:14px;font-weight:600;margin:16px 0 8px;">Message History</h4>'
    + '<div id="broadcastHistory">';
  if (!msgs.length) {
    html += '<p style="text-align:center;color:var(--text-light);padding:20px;">No broadcasts sent yet.</p>';
  } else {
    msgs.slice().reverse().forEach(function(m) {
      html += '<div class="card" style="margin-bottom:8px;padding:14px;display:flex;gap:12px;align-items:flex-start;">'
        + '<div style="flex:1;"><strong>' + esc(m.subject || '') + '</strong>'
        + '<span style="font-size:11px;color:var(--text-light);margin-left:8px;">' + esc(m.date || '') + '</span>'
        + '<p style="margin:4px 0;font-size:13px;color:var(--text-light);">' + esc(m.message || '') + '</p>'
        + '<span style="font-size:11px;color:var(--text-light);">Audience: ' + esc(m.audience || 'all') + ' | Sent via: ' + esc(m.channel || 'whatsapp') + '</span></div>'
        + '<button class="btn btn-sm btn-outline" onclick="resendBroadcast(' + msgs.indexOf(m) + ')"><i class="fas fa-share"></i> Resend</button>'
        + '</div>';
    });
  }
  html += '</div>';
  container.innerHTML = html;
}

function showComposeBroadcast() {
  var area = document.getElementById('broadcastComposeArea');
  if (!area) return;
  var wh = data.schoolProfile?.whatsappNumber || data.whatsappNumber || '';
  area.innerHTML = '<div class="card" style="margin-bottom:16px;padding:16px;border:2px solid var(--primary);">'
    + '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;"><i class="fas fa-edit"></i> Compose Broadcast</h4>'
    + '<div class="form-group"><label>Subject</label><input type="text" id="bcSubject" class="form-input" placeholder="e.g. Fee Reminder"></div>'
    + '<div class="form-group" style="margin-top:8px;"><label>Message</label><textarea id="bcMessage" class="form-input" rows="4" placeholder="Type your broadcast message..."></textarea></div>'
    + '<div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;">'
    + '<div class="form-group" style="flex:1;"><label>Audience</label><select id="bcAudience" class="form-input"><option value="all">All (Parents, Teachers, Students)</option><option value="parents">Parents Only</option><option value="teachers">Teachers Only</option><option value="students">Students Only</option></select></div>'
    + '<div class="form-group" style="flex:1;"><label>Channel</label><select id="bcChannel" class="form-input"><option value="whatsapp">WhatsApp</option><option value="both">WhatsApp + SMS</option></select></div>'
    + '</div>'
    + '<div style="margin-top:12px;display:flex;gap:8px;">'
    + '<button class="btn btn-sm btn-primary" onclick="sendBroadcast()"><i class="fas fa-paper-plane"></i> Send Broadcast</button>'
    + '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'broadcastComposeArea\').innerHTML=\'\'"><i class="fas fa-times"></i> Cancel</button>'
    + '</div></div>';
}

function sendBroadcast() {
  var subject = document.getElementById('bcSubject')?.value?.trim();
  var message = document.getElementById('bcMessage')?.value?.trim();
  var audience = document.getElementById('bcAudience')?.value || 'all';
  var channel = document.getElementById('bcChannel')?.value || 'whatsapp';
  if (!subject || !message) { toast('Fill in subject and message', 'error'); return; }
  if (!data.broadcasts) data.broadcasts = [];
  data.broadcasts.push({ id: 'BC' + Date.now(), subject: subject, message: message, audience: audience, channel: channel, date: new Date().toISOString().slice(0, 16).replace('T', ' ') });
  // WhatsApp deep link
  var wh = data.schoolProfile?.whatsappNumber || data.whatsappNumber || '';
  var waMsg = encodeURIComponent('*' + subject + '*\n\n' + message + '\n\n— ' + (data.schoolProfile?.schoolName || 'School'));
  if (channel !== 'sms' && wh) {
    window.open('https://wa.me/' + wh.replace(/[^0-9]/g, '') + '?text=' + waMsg, '_blank');
  }
  toast('Broadcast sent! Message logged to history.');
  renderBroadcast();
}

function resendBroadcast(idx) {
  var m = (data.broadcasts || [])[idx];
  if (!m) return;
  var wh = data.schoolProfile?.whatsappNumber || data.whatsappNumber || '';
  var waMsg = encodeURIComponent('*' + m.subject + '*\n\n' + m.message + '\n\n— ' + (data.schoolProfile?.schoolName || 'School'));
  if (wh) window.open('https://wa.me/' + wh.replace(/[^0-9]/g, '') + '?text=' + waMsg, '_blank');
  toast('Re-sending broadcast...');
}
