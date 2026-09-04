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
    + '<div class="form-row"><label>School Motto</label><input type="text" id="spSchoolMotto" value="' + esc(prof.schoolMotto || '') + '" oninput="spUpdate(\'schoolMotto\',this.value)"></div>'
    + '<div class="form-row"><label>School Logo</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<input type="text" id="spLogoUrl" value="' + esc(prof.logoUrl || '') + '" placeholder="Paste image URL..." oninput="spUpdate(\'logoUrl\',this.value);previewSchoolLogo()" style="flex:1;min-width:180px;">'
    + '<input type="file" accept="image/*" onchange="uploadSchoolLogo(this)" style="font-size:13px;">'
    + '<div id="spLogoPreview" style="width:40px;height:40px;border-radius:6px;overflow:hidden;border:1px solid #ddd;display:' + (prof.logoUrl ? 'flex' : 'none') + ';align-items:center;justify-content:center;"><img src="' + esc(prof.logoUrl || '') + '" style="max-width:100%;max-height:100%;" onerror="this.parentElement.style.display=\'none\'"></div>'
    + '</div></div>'
    + '<div class="form-row"><label>Favicon URL</label><input type="text" value="' + esc(prof.faviconUrl || 'icons/icon.svg') + '" oninput="spUpdate(\'faviconUrl\',this.value)"></div>'
    + '<div class="form-row"><label>Dashboard Logo (sidebar)</label><input type="text" value="' + esc(prof.dashboardLogo || '') + '" placeholder="Leave blank to use school logo" oninput="spUpdate(\'dashboardLogo\',this.value)"></div>'
    + '<div class="form-row"><label>Login Page Background Image</label><input type="text" value="' + esc(prof.loginBackground || '') + '" placeholder="Image URL for login page background" oninput="spUpdate(\'loginBackground\',this.value)"></div>'
    + '<div class="form-row"><label>Hero Title</label><input type="text" id="spHeroTitle" value="' + esc(prof.heroTitle || '') + '" oninput="spUpdate(\'heroTitle\',this.value)"></div>'
    + '<div class="form-row"><label>Hero Subtitle</label><textarea rows="2" oninput="spUpdate(\'heroSubtitle\',this.value)">' + esc(prof.heroSubtitle || '') + '</textarea></div>'
    + '<div class="form-row"><label>About Text</label><textarea rows="3" oninput="spUpdate(\'aboutText\',this.value)">' + esc(prof.aboutText || '') + '</textarea></div>'
    + '<div class="form-row"><label>Contact Email</label><input type="email" value="' + esc(prof.contactEmail || '') + '" oninput="spUpdate(\'contactEmail\',this.value)"></div>'
    + '<div class="form-row"><label>Contact Phone</label><input type="text" value="' + esc(prof.contactPhone || '') + '" oninput="spUpdate(\'contactPhone\',this.value)"></div>'
+ '<div class="form-row"><label>WhatsApp Number</label><div style="display:flex;gap:8px;align-items:center;"><input type="text" value="' + esc(prof.whatsappNumber || '') + '" placeholder="e.g. +2348012345678" oninput="spUpdate(\'whatsappNumber\',this.value)" style="flex:1;"><span style="font-size:12px;color:var(--text-light);"><i class="fab fa-whatsapp" style="color:#25D366;"></i> Shows as floating chat button</span></div></div>'
    + '<div class="form-row"><label>Address</label><textarea rows="2" oninput="spUpdate(\'contactAddress\',this.value)">' + esc(prof.contactAddress || '') + '</textarea></div>'
    + '<div class="form-row"><label>Emergency Contact</label><input type="text" value="' + esc(prof.emergencyContact || '') + '" placeholder="Emergency phone number" oninput="spUpdate(\'emergencyContact\',this.value)"></div>'
    + '<div class="form-row"><label>Share School Page</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<input type="text" id="spSchoolUrl" readonly value="' + esc(typeof getCurrentSchoolUrl === 'function' ? getCurrentSchoolUrl() : '') + '" style="flex:1;min-width:180px;font-size:12px;color:var(--text-light);background:#f8fafc;cursor:text;" onclick="this.select()">'
    + '<button class="btn btn-sm btn-primary" onclick="copySchoolLink()"><i class="fas fa-copy"></i> Copy</button>'
    + '</div></div>'
    + '</div></div>'

    // School Information
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-school"></i> School Information</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>School Type</label><select onchange="spUpdate(\'schoolType\',this.value)"><option value="day"' + (prof.schoolType==='day'?' selected':'') + '>Day School</option><option value="boarding"' + (prof.schoolType==='boarding'?' selected':'') + '>Boarding School</option><option value="mixed"' + (prof.schoolType==='mixed'?' selected':'') + '>Mixed (Day &amp; Boarding)</option></select></div>'
    + '<div class="form-row"><label>Gender</label><select onchange="spUpdate(\'gender\',this.value)"><option value="coeducational"' + (prof.gender==='coeducational'?' selected':'') + '>Co-educational</option><option value="boys"' + (prof.gender==='boys'?' selected':'') + '>Boys Only</option><option value="girls"' + (prof.gender==='girls'?' selected':'') + '>Girls Only</option></select></div>'
    + '<div class="form-row"><label>Founded Year</label><input type="text" value="' + esc(prof.foundingYear || '') + '" placeholder="e.g. 1995" oninput="spUpdate(\'foundingYear\',this.value)"></div>'
    + '<div class="form-row"><label>Curriculum</label><input type="text" value="' + esc(prof.curriculumLabel || '') + '" placeholder="e.g. Nigerian Curriculum" oninput="spUpdate(\'curriculumLabel\',this.value)"></div>'
    + '<div class="form-row"><label>Operating Hours</label><input type="text" value="' + esc(prof.operatingHours || '') + '" placeholder="e.g. Mon-Fri 8am-3pm" oninput="spUpdate(\'operatingHours\',this.value)"></div>'
    + '<div class="form-row"><label>Term Names (comma separated)</label><input type="text" value="' + esc((prof.termNames || ['Term 1','Term 2','Term 3']).join(', ')) + '" oninput="spUpdate(\'termNames\',this.value.split(\', \').map(function(s){return s.trim()}))"></div>'
    + '<div class="form-row"><label>Watermark Text (ID cards, certificates)</label><input type="text" value="' + esc(prof.watermarkText || '') + '" placeholder="e.g. EduVerse" oninput="spUpdate(\'watermarkText\',this.value)"></div>'
    + '</div></div>'

    // Branding & Appearance
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-paint-brush"></i> Branding &amp; Appearance</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>Font Family</label><select onchange="spUpdate(\'fontFamily\',this.value)"><option value="Inter, sans-serif"' + (prof.fontFamily==='Inter, sans-serif'?' selected':'') + '>Inter (Modern)</option><option value="Poppins, sans-serif"' + (prof.fontFamily==='Poppins, sans-serif'?' selected':'') + '>Poppins (Playful)</option><option value="Open Sans, sans-serif"' + (prof.fontFamily==='Open Sans, sans-serif'?' selected':'') + '>Open Sans (Clean)</option><option value="Nunito, sans-serif"' + (prof.fontFamily==='Nunito, sans-serif'?' selected':'') + '>Nunito (Rounded)</option><option value="Merriweather, serif"' + (prof.fontFamily==='Merriweather, serif'?' selected':'') + '>Merriweather (Formal)</option></select></div>'
    + '<div class="form-row"><label>Border Radius</label><select onchange="spUpdate(\'borderRadius\',this.value)"><option value="4px"' + (prof.borderRadius==='4px'?' selected':'') + '>Sharp (4px)</option><option value="8px"' + (prof.borderRadius==='8px'?' selected':'') + '>Moderate (8px)</option><option value="12px"' + (prof.borderRadius==='12px'?' selected':'') + '>Rounded (12px)</option><option value="16px"' + (prof.borderRadius==='16px'?' selected':'') + '>Extra Rounded (16px)</option><option value="9999px"' + (prof.borderRadius==='9999px'?' selected':'') + '>Pill (9999px)</option></select></div>'
    + '<div class="form-row"><label>Secondary Color</label><div style="display:flex;gap:8px;align-items:center;"><input type="color" value="' + (prof.schoolSecondaryColor || '#7c3aed') + '" style="width:40px;height:36px;padding:2px;border:1px solid #ddd;border-radius:4px;cursor:pointer;" oninput="spUpdate(\'schoolSecondaryColor\',this.value)"><input type="text" value="' + esc(prof.schoolSecondaryColor || '#7c3aed') + '" style="flex:1;font-family:monospace;" oninput="spUpdate(\'schoolSecondaryColor\',this.value)"></div></div>'
    + '<div class="form-row"><label>Date Format</label><select onchange="spUpdate(\'dateFormat\',this.value)"><option value="DD/MM/YYYY"' + (prof.dateFormat==='DD/MM/YYYY'?' selected':'') + '>DD/MM/YYYY</option><option value="MM/DD/YYYY"' + (prof.dateFormat==='MM/DD/YYYY'?' selected':'') + '>MM/DD/YYYY</option><option value="YYYY-MM-DD"' + (prof.dateFormat==='YYYY-MM-DD'?' selected':'') + '>YYYY-MM-DD</option></select></div>'
    + '<div class="form-row"><label>Default Language</label><select onchange="spUpdate(\'defaultLanguage\',this.value)"><option value="en"' + (prof.defaultLanguage==='en'?' selected':'') + '>English</option><option value="fr"' + (prof.defaultLanguage==='fr'?' selected':'') + '>French</option><option value="yo"' + (prof.defaultLanguage==='yo'?' selected':'') + '>Yoruba</option><option value="ha"' + (prof.defaultLanguage==='ha'?' selected':'') + '>Hausa</option><option value="ig"' + (prof.defaultLanguage==='ig'?' selected':'') + '>Igbo</option></select></div>'
    + '<div class="form-row"><label>Session Timeout (minutes)</label><input type="number" min="5" max="480" value="' + (prof.sessionTimeout || 30) + '" oninput="spUpdate(\'sessionTimeout\',parseInt(this.value)||30)"></div>'
    + '<div class="form-row"><label>Custom CSS</label><textarea rows="4" placeholder="Inject custom CSS rules&#10;e.g. .hero-slider { min-height: 80vh; }" oninput="spUpdate(\'customCSS\',this.value)">' + esc(prof.customCSS || '') + '</textarea></div>'
    + '</div></div>'

    // Hero Images
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-images"></i> Hero Slide Images <span style="font-size:11px;color:var(--text-light);font-weight:400;">(URLs for the 3 hero slides)</span></span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">' + renderHeroImagesEditor() + '</div></div>'

    // Social Links
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-share-alt"></i> Social Media Links</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body"><div id="spSocialLinks">' + renderSocialLinksEditor() + '</div></div></div>'

    // Theme Colors
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-palette"></i> Theme Colors</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">' + renderThemeEditor() + '</div></div>'

    // Admissions
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-graduation-cap"></i> Admissions</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>Admissions Open</label><label class="toggle-switch"><input type="checkbox" ' + (prof.admissionOpen ? 'checked' : '') + ' onchange="spUpdate(\'admissionOpen\',this.checked)"><span class="toggle-slider"></span></label></div>'
    + '<div class="form-row"><label>Admissions Season Text</label><input type="text" value="' + esc(prof.admissionSeason || '') + '" placeholder="e.g. 2026/2027 Admissions Open" oninput="spUpdate(\'admissionSeason\',this.value)"></div>'
    + '<div class="form-row"><label>Requirements (one per line)</label><textarea rows="4" placeholder="Birth certificate&#10;Previous school report&#10;Passport photographs (2)" oninput="spUpdate(\'admissionRequirements\',this.value.split(\'\\n\').filter(function(s){return s.trim()}))">' + esc((prof.admissionRequirements || []).join('\n')) + '</textarea></div>'
    + '</div></div>'

    // Announcement Bar
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-bullhorn"></i> Announcement Bar</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>Enable</label><label class="toggle-switch"><input type="checkbox" ' + ((prof.announcementBar||{}).enabled ? 'checked' : '') + ' onchange="var p=getSchoolProfile();if(!p.announcementBar)p.announcementBar={};p.announcementBar.enabled=this.checked"><span class="toggle-slider"></span></label></div>'
    + '<div class="form-row"><label>Banner Text</label><textarea rows="2" placeholder="e.g. Mid-term break: Oct 15-18. School reopens Oct 22." oninput="var p=getSchoolProfile();if(!p.announcementBar)p.announcementBar={};p.announcementBar.text=this.value">' + esc((prof.announcementBar||{}).text || '') + '</textarea></div>'
    + '</div></div>'

    // Facilities
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-building"></i> Facilities <span class="sp-badge">' + (prof.facilities||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'facilities\',{name:\'New Facility\',description:\'\',image:\'\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-facilities"></div></div></div>'

    // Staff / Team
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-users"></i> Staff / Team <span class="sp-badge">' + (prof.staff||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'staff\',{name:\'\',role:\'\',bio:\'\',photo:\'\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-staff"></div></div></div>'

    // FAQs
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-question-circle"></i> FAQs <span class="sp-badge">' + (prof.faqs||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'faqs\',{question:\'\',answer:\'\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-faqs"></div></div></div>'

    // About Section
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-info-circle"></i> About Section Images <span style="font-size:11px;color:var(--text-light);font-weight:400;">(up to 4 image URLs)</span></span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body"><div id="spAboutImages">' + renderAboutImagesEditor() + '</div></div></div>'

    // Footer
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-shoe-prints"></i> Footer Settings</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>Newsletter Text</label><input type="text" value="' + esc((prof.newsletterText || 'Subscribe to receive updates on school activities and academic news.')) + '" oninput="spUpdate(\'newsletterText\',this.value)"></div>'
    + '<div class="form-row"><label>Alumni Count</label><input type="text" value="' + esc(prof.alumniCount || '') + '" placeholder="e.g. 5,000+" oninput="spUpdate(\'alumniCount\',this.value)"></div>'
    + '<div class="form-row"><label>Map Embed URL (Google Maps)</label><input type="text" value="' + esc(prof.mapEmbedUrl || '') + '" placeholder="https://www.google.com/maps/embed?pb=..." oninput="spUpdate(\'mapEmbedUrl\',this.value)"></div>'
    + '</div></div>'

    // Accreditations
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-award"></i> Accreditations / Badges <span class="sp-badge">' + (prof.accreditations||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'accreditations\',{name:\'\',image:\'\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-accreditations"></div></div></div>'

    // Portal Features Toggles
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-toggle-on"></i> Portal Feature Toggles</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">' + renderFeatureTogglesEditor() + '</div></div>'

    // Grading Scale
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-chart-bar"></i> Grading Scale <span class="sp-badge">' + (prof.gradingScale||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'gradingScale\',{grade:\'A\',min:70,max:100,remark:\'Excellent\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-gradingScale"></div></div></div>'

    // Custom Domains
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-globe"></i> Custom Domains</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body"><div id="spCustomDomains">' + renderCustomDomainsEditor() + '</div></div></div>'

    // Sport Houses
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-running"></i> Sport Houses <span class="sp-badge">' + (prof.sportHouses||[]).length + '</span></span>'
    + '<span><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();spAddArrayItem(\'sportHouses\',{name:\'\',color:\'#e53e3e\',motto:\'\'})"><i class="fas fa-plus"></i> Add</button><i class="fas fa-chevron-down"></i></span></div>'
    + '<div class="profile-section-body"><div id="spList-sportHouses"></div></div></div>'

    // CBT Config
    + '<div class="profile-section"><div class="profile-section-header" onclick="toggleProfileSection(this)">'
    + '<span><i class="fas fa-laptop-code"></i> Computer-Based Testing (CBT)</span><i class="fas fa-chevron-down"></i></div>'
    + '<div class="profile-section-body">'
    + '<div class="form-row"><label>Enable CBT Section</label><label class="toggle-switch"><input type="checkbox" ' + ((prof.cbtConfig||{}).enabled ? 'checked' : '') + ' onchange="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.enabled=this.checked"><span class="toggle-slider"></span></label></div>'
    + '<div class="form-row"><label>Section Title</label><input type="text" value="' + esc((prof.cbtConfig||{}).title || 'Computer-Based Testing (CBT)') + '" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.title=this.value"></div>'
    + '<div class="form-row"><label>Headline</label><input type="text" value="' + esc((prof.cbtConfig||{}).headline || '') + '" placeholder="e.g. Modern Assessment for Every Student" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.headline=this.value"></div>'
    + '<div class="form-row"><label>Description</label><textarea rows="3" placeholder="Describe your CBT offering..." oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.description=this.value">' + esc((prof.cbtConfig||{}).description || '') + '</textarea></div>'
    + '<div class="form-row"><label>Registration Open</label><label class="toggle-switch"><input type="checkbox" ' + ((prof.cbtConfig||{}).registrationOpen ? 'checked' : '') + ' onchange="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.registrationOpen=this.checked"><span class="toggle-slider"></span></label></div>'
    + '<div class="form-row"><label>Registration Text</label><input type="text" value="' + esc((prof.cbtConfig||{}).registrationText || '') + '" placeholder="e.g. Register now for upcoming CBT exams" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.registrationText=this.value"></div>'
    + '<div class="form-row"><label>CTA Button Text</label><input type="text" value="' + esc((prof.cbtConfig||{}).ctaText || 'Take a CBT Exam') + '" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.ctaText=this.value"></div>'
    + '<div class="form-row"><label>CBT Features (icon,text &mdash; one per line)</label><textarea rows="4" placeholder="fa-laptop: Fully Online Exams&#10;fa-shield-alt: Secure Anti-Cheating&#10;fa-bolt: Instant Results" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.features=this.value.split(\'\\n\').filter(function(l){return l.trim()}).map(function(l){var parts=l.split(\':\');return{icon:parts[0].trim()||\'fa-laptop\',text:(parts[1]||l).trim()}})">' + esc(((prof.cbtConfig||{}).features||[]).map(function(f){return f.icon+': '+f.text}).join('\n')) + '</textarea></div>'
    + '<div class="form-row"><label>Upcoming Exams (title,date,class &mdash; one per line)</label><textarea rows="3" placeholder="Mid-Term Assessment|2026-08-15|Basic 1-6&#10;Mock BECE|2026-09-01|JSS 3" oninput="var p=getSchoolProfile();if(!p.cbtConfig)p.cbtConfig={};p.cbtConfig.upcomingExams=this.value.split(\'\\n\').filter(function(l){return l.trim()}).map(function(l){var parts=l.split(\'|\');return{title:(parts[0]||\'\').trim(),date:(parts[1]||\'\').trim(),className:(parts[2]||\'\').trim()}})">' + esc(((prof.cbtConfig||{}).upcomingExams||[]).map(function(e){return e.title+'|'+e.date+'|'+e.className}).join('\n')) + '</textarea></div>'
    + '</div></div>';

  var sections = [
    { key: 'services', icon: 'fa-concierge-bell', label: 'Services', fields: ['icon','title','description'], phs: ['fa-icon','Service title','Description'] },
    { key: 'courses', icon: 'fa-book', label: 'Courses', fields: ['icon','title','description','duration'], phs: ['fa-icon','Course title','Description','Duration e.g. Full Term'] },
    { key: 'activities', icon: 'fa-running', label: 'Activities', fields: ['name','type','description','schedule'], phs: ['Activity name','Sports/Academic/Arts','Description','Schedule e.g. Mon & Wed 3-5pm'] },
    { key: 'features', icon: 'fa-star', label: 'Portal Features', fields: ['icon','title','description'], phs: ['fa-icon','Feature title','Description'] },
    { key: 'events', icon: 'fa-calendar-alt', label: 'Events', fields: ['title','date','description'], phs: ['Event title','Date e.g. 2026-09-15','Description'] },
    { key: 'testimonials', icon: 'fa-quote-right', label: 'Testimonials', fields: ['name','text','role'], phs: ['Name','Testimonial text','Role e.g. Parent'] },
    { key: 'facilities', icon: 'fa-building', label: 'Facilities', fields: ['name','description','image'], phs: ['Facility name','Description','Image URL'] },
    { key: 'staff', icon: 'fa-users', label: 'Staff', fields: ['name','role','bio','photo'], phs: ['Full name','Role e.g. Principal','Short bio','Photo URL'] },
    { key: 'faqs', icon: 'fa-question-circle', label: 'FAQs', fields: ['question','answer'], phs: ['Question','Answer'] },
    { key: 'accreditations', icon: 'fa-award', label: 'Accreditations', fields: ['name','image'], phs: ['Badge name','Badge/image URL'] },
    { key: 'gradingScale', icon: 'fa-chart-bar', label: 'Grading Scale', fields: ['grade','min','max','remark'], phs: ['Grade letter e.g. A','Minimum score','Maximum score','Remark e.g. Excellent'] },
    { key: 'sportHouses', icon: 'fa-running', label: 'Sport Houses', fields: ['name','color','motto'], phs: ['House name e.g. Red House','Hex color e.g. #e53e3e','House motto'] }
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
  if (typeof htmlEscape === 'function') return htmlEscape(s);
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
    { key: 'testimonials', fields: ['name','text','role'], phs: ['Name','Text','Role'] },
    { key: 'facilities', fields: ['name','description','image'], phs: ['Facility name','Description','Image URL'] },
    { key: 'staff', fields: ['name','role','bio','photo'], phs: ['Full name','Role','Short bio','Photo URL'] },
    { key: 'faqs', fields: ['question','answer'], phs: ['Question','Answer'] },
    { key: 'accreditations', fields: ['name','image'], phs: ['Badge name','Badge/image URL'] },
    { key: 'gradingScale', fields: ['grade','min','max','remark'], phs: ['Grade letter','Minimum score','Maximum score','Remark'] },
    { key: 'sportHouses', fields: ['name','color','motto'], phs: ['House name','Hex color','House motto'] }
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
    testimonials: { name: '', text: '', role: '' },
    facilities: { name: 'New Facility', description: '', image: '' },
    staff: { name: '', role: '', bio: '', photo: '' },
    faqs: { question: '', answer: '' },
    accreditations: { name: '', image: '' },
    gradingScale: { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
    sportHouses: { name: 'New House', color: '#e53e3e', motto: '' }
  };
  var def = sections[key] || {};
  Object.keys(def).forEach(function(k) { newItem[k] = def[k]; });

  prof[key].push(newItem);
  renderProfileItemList(key);
  updateSpBadge(key, prof[key].length);
}

function spAddArrayItem(key, defaults) {
  var prof = getSchoolProfile();
  if (!prof[key]) prof[key] = [];
  var item = {};
  Object.keys(defaults).forEach(function(k) { item[k] = defaults[k]; });
  prof[key].push(item);
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

// ===== Social Links Editor =====
function renderSocialLinksEditor() {
  var prof = getSchoolProfile();
  var links = prof.socialLinks || [{ platform: 'facebook', url: '' }, { platform: 'twitter', url: '' }, { platform: 'linkedin', url: '' }, { platform: 'instagram', url: '' }, { platform: 'youtube', url: '' }];
  var icons = { facebook: 'fab fa-facebook', twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin', instagram: 'fab fa-instagram', youtube: 'fab fa-youtube' };
  var labels = { facebook: 'Facebook URL', twitter: 'Twitter URL', linkedin: 'LinkedIn URL', instagram: 'Instagram URL', youtube: 'YouTube URL' };
  return links.map(function(l, i) {
    var cls = icons[l.platform] || 'fas fa-globe';
    var label = labels[l.platform] || l.platform;
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><i class="' + cls + '" style="width:20px;text-align:center;"></i>'
      + '<input type="text" placeholder="' + label + '" value="' + esc(l.url || '') + '" style="flex:1;" oninput="updateSocialLink(' + i + ',this.value)"></div>';
  }).join('');
}

function updateSocialLink(index, url) {
  var prof = getSchoolProfile();
  if (!prof.socialLinks) prof.socialLinks = [];
  if (!prof.socialLinks[index]) prof.socialLinks[index] = { platform: 'facebook', url: '' };
  prof.socialLinks[index].url = url;
}

// ===== Hero Images Editor =====
function renderHeroImagesEditor() {
  var prof = getSchoolProfile();
  var imgs = prof.heroImages || ['images/hero/slide1.jpg', 'images/hero/slide2.jpg', 'images/hero/slide3.jpg'];
  var labels = ['Slide 1 Image URL', 'Slide 2 Image URL', 'Slide 3 Image URL'];
  return imgs.map(function(img, i) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
      + '<span style="min-width:120px;font-size:13px;color:var(--text-light);">' + labels[i] + '</span>'
      + '<input type="text" value="' + esc(img) + '" style="flex:1;" oninput="updateHeroImage(' + i + ',this.value)">'
      + '</div>';
  }).join('');
}

function updateHeroImage(index, url) {
  var prof = getSchoolProfile();
  if (!prof.heroImages) prof.heroImages = ['images/hero/slide1.jpg', 'images/hero/slide2.jpg', 'images/hero/slide3.jpg'];
  prof.heroImages[index] = url;
}

// ===== Theme Editor =====
function renderThemeEditor() {
  var prof = getSchoolProfile();
  var t = prof.theme || {};
  var colors = [
    { key: 'primaryColor', label: 'Primary Color', def: '#2563eb' },
    { key: 'accentColor', label: 'Accent Color', def: '#fbbf24' },
    { key: 'successColor', label: 'Success Color', def: '#38a169' },
    { key: 'infoColor', label: 'Info Color', def: '#3182ce' }
  ];
  return colors.map(function(c) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
      + '<label style="min-width:130px;font-size:13px;">' + c.label + '</label>'
      + '<input type="color" value="' + (t[c.key] || c.def) + '" style="width:40px;height:36px;padding:2px;border:1px solid #ddd;border-radius:4px;cursor:pointer;" oninput="updateThemeColor(\'' + c.key + '\',this.value)">'
      + '<input type="text" value="' + esc(t[c.key] || c.def) + '" style="flex:1;font-family:monospace;font-size:13px;" oninput="updateThemeColor(\'' + c.key + '\',this.value)">'
      + '</div>';
  }).join('');
}

function updateThemeColor(key, val) {
  var prof = getSchoolProfile();
  if (!prof.theme) prof.theme = {};
  prof.theme[key] = val;
}

// ===== About Images Editor =====
function renderAboutImagesEditor() {
  var prof = getSchoolProfile();
  var imgs = prof.aboutImages || [];
  while (imgs.length < 4) imgs.push('');
  return imgs.map(function(url, i) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
      + '<span style="min-width:80px;font-size:13px;color:var(--text-light);">Image ' + (i + 1) + '</span>'
      + '<input type="text" value="' + esc(url) + '" placeholder="Image URL" style="flex:1;" oninput="updateAboutImage(' + i + ',this.value)">'
      + '</div>';
  }).join('');
}

function updateAboutImage(index, url) {
  var prof = getSchoolProfile();
  if (!prof.aboutImages) prof.aboutImages = [];
  prof.aboutImages[index] = url;
}

// ===== Feature Toggles Editor =====
function renderFeatureTogglesEditor() {
  var prof = getSchoolProfile();
  var ef = prof.enableFeatures || {};
  var features = [
    { key: 'library', label: 'Library' },
    { key: 'transport', label: 'Transport' },
    { key: 'health', label: 'Health' },
    { key: 'activities', label: 'Activities' },
    { key: 'alumni', label: 'Alumni' },
    { key: 'hostel', label: 'Hostel' },
    { key: 'chat', label: 'Chat / Community' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'examSimulation', label: 'Exam Simulation' }
  ];
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;">'
    + features.map(function(f) {
      return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:6px 8px;background:#f8fafc;border-radius:6px;">'
        + '<input type="checkbox" ' + (ef[f.key] !== false ? 'checked' : '') + ' onchange="toggleFeature(\'' + f.key + '\',this.checked)" style="width:16px;height:16px;">'
        + f.label + '</label>';
    }).join('') + '</div>';
}

function toggleFeature(key, val) {
  var prof = getSchoolProfile();
  if (!prof.enableFeatures) prof.enableFeatures = {};
  prof.enableFeatures[key] = val;
}

// ===== Custom Domains Editor =====
function renderCustomDomainsEditor() {
  var prof = getSchoolProfile();
  var domains = prof.customDomains || [];
  return '<div style="margin-bottom:8px;">'
    + (domains.length ? domains.map(function(d, i) {
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
        + '<input type="text" value="' + esc(d) + '" placeholder="e.g. school.example.com" style="flex:1;" onchange="updateCustomDomain(' + i + ',this.value)">'
        + '<button class="btn btn-sm btn-danger" onclick="removeCustomDomain(' + i + ')"><i class="fas fa-times"></i></button></div>';
    }).join('') : '<p class="empty-state" style="margin:0 0 8px;">No custom domains added.</p>')
    + '<button class="btn btn-sm btn-primary" onclick="addCustomDomain()"><i class="fas fa-plus"></i> Add Domain</button></div>';
}

function addCustomDomain() {
  var prof = getSchoolProfile();
  if (!prof.customDomains) prof.customDomains = [];
  prof.customDomains.push('');
  renderCustomDomainsEditor();
  var container = document.getElementById('spCustomDomains');
  if (container) container.innerHTML = renderCustomDomainsEditor();
}

function updateCustomDomain(index, val) {
  var prof = getSchoolProfile();
  if (!prof.customDomains) prof.customDomains = [];
  prof.customDomains[index] = val;
}

function removeCustomDomain(index) {
  var prof = getSchoolProfile();
  if (prof.customDomains) prof.customDomains.splice(index, 1);
  var container = document.getElementById('spCustomDomains');
  if (container) container.innerHTML = renderCustomDomainsEditor();
}

// ===== Landing Page Rendering =====

function renderLandingPageSections() {
  var prof = getSchoolProfile();

  // One-time migration: replace old branding strings in profile data (MUST run before renders)
  var needsSave = false;
  function migrateBranding(obj) {
    if (typeof obj === 'string' && obj.includes('OMOLOLA')) { needsSave = true; return obj.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EduVerse Institute of Technology & Management').replace(/OMOLOLA/gi, 'EduVerse'); }
    if (typeof obj === 'string' && obj.includes('Demo International School')) { needsSave = true; return obj.replace(/Demo International School/g, 'EduVerse'); }
    if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) obj[i] = migrateBranding(obj[i]); return obj; }
    if (obj && typeof obj === 'object') { for (var k in obj) obj[k] = migrateBranding(obj[k]); return obj; }
    return obj;
  }
  // Clean schoolProfile, schoolName, and schoolMotto
  prof = migrateBranding(prof);
  if (data.schoolName && typeof data.schoolName === 'string' && (data.schoolName.includes('OMOLOLA') || data.schoolName.includes('Demo International School'))) {
    data.schoolName = migrateBranding(data.schoolName); needsSave = true;
  }
  if (data.schoolMotto && typeof data.schoolMotto === 'string' && (data.schoolMotto.includes('OMOLOLA') || data.schoolMotto.includes('Demo International School'))) {
    data.schoolMotto = migrateBranding(data.schoolMotto); needsSave = true;
  }
  if (needsSave) { data.schoolProfile = prof; saveData(); }

  // Now render with migrated data
  renderHeroSlides();
  renderSocialLinks();
  applyTheme();

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
  if (!schoolName) schoolName = 'EduVerse';

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

  // Hide EduVerse platform & super admin buttons on school profiles
  ['navJoinBtn', 'heroJoinBtn', 'superAdminCog'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.style.display = 'none';
  });

  // Update auth-gated elements on landing page
  if (typeof updateAuthGating === 'function') updateAuthGating();

  // Show demo mode bottom-center bar (unobtrusive, fade-in)
  try {
    if (localStorage.getItem('demoMode') === 'true' && !document.getElementById('demoModePopup')) {
      var bar = document.createElement('div');
      bar.id = 'demoModePopup';
      bar.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:9999;background:linear-gradient(135deg,#744210,#975a16);color:#fff;padding:8px 20px;font-size:12px;display:flex;align-items:center;gap:16px;border-radius:10px 10px 0 0;box-shadow:0 -2px 12px rgba(0,0,0,0.15);animation:demoFadeIn 0.5s ease forwards;max-width:95vw;white-space:nowrap;';
      bar.innerHTML =
        '<span><i class="fas fa-flask"></i> <strong>Demo Mode</strong></span>' +
        '<span style="opacity:0.8;display:flex;gap:12px;font-size:11px;">' +
          '<span><strong>Admin:</strong> admin@demo.com / demo123</span>' +
          '<span><strong>Student:</strong> STU001 / stu001</span>' +
          '<span><strong>Teacher:</strong> TCH001 / teacher123</span>' +
          '<span><strong>Parent:</strong> robert@example.com / parent123</span>' +
        '</span>' +
        '<button class="btn btn-sm" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.25);padding:3px 12px;font-size:11px;cursor:pointer;border-radius:6px;" onclick="exitDemoMode()"><i class="fas fa-times"></i> Exit</button>';
      document.body.appendChild(bar);

      // Collapse/expand on click (toggle compact vs full view)
      bar.style.cursor = 'pointer';
      var expanded = true;
      bar.onclick = function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        var info = bar.querySelector('span:nth-child(2)');
        if (info) {
          if (expanded) {
            info.style.display = 'none';
            bar.style.padding = '6px 16px';
            expanded = false;
          } else {
            info.style.display = '';
            bar.style.padding = '8px 20px';
            expanded = true;
          }
        }
      };
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
      var tColors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
      tGrid.innerHTML = prof.testimonials.map(function(t, ti) {
        var initial = (t.name || '?')[0].toUpperCase();
        var ci = ti % tColors.length;
        return '<div class="testimonial-card" style="--avatar-bg:' + tColors[ci] + '">'
          + '<div class="stars" style="display:flex;gap:2px;font-size:14px;color:#f59e0b;">'
          + '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>'
          + '<p class="quote">"' + esc(t.text) + '"</p>'
          + '<div class="author"><div class="avatar" style="background:linear-gradient(135deg,' + tColors[ci] + ',' + tColors[ci] + 'cc);">' + initial + '</div>'
          + '<div><div class="name">' + esc(t.name) + '</div><div class="role">' + esc(t.role || '') + '</div></div></div></div>';
      }).join('');
    } else {
      tGrid.innerHTML = '<p class="empty-state" style="text-align:center;padding:40px;">No testimonials yet.</p>';
    }
  }

  // Footer about & contact
  var footerAbout = document.getElementById('footerAboutText');
  if (footerAbout) footerAbout.textContent = prof.aboutText || 'EduVerse Institute of Technology & Management is committed to providing quality education that nurtures academic excellence, character development, and lifelong learning skills in every student.';
  var footerContact = document.getElementById('footerContact');
  if (footerContact) {
    footerContact.innerHTML = '<strong><i class="fa fa-map-marker"></i></strong> ' + esc(prof.contactAddress || '') + '<br>'
      + '<strong><i class="fa fa-phone"></i></strong> ' + esc(prof.contactPhone || '') + '<br>'
      + '<strong><i class="fa fa-envelope"></i></strong> ' + esc(prof.contactEmail || '');
  }

  // Section titles
  if (schoolName) {
    document.querySelectorAll('.section-title p').forEach(function(p) {
      if (p.textContent.includes('EduVerse')) {
        p.textContent = p.textContent.replace(/EduVerse/g, schoolName);
      }
    });
  }

  // Extended rendering
  renderSchoolInfo();
  renderBranding();
  renderAnnouncementBar();
  renderFacilitiesSection();
  renderStaffSection();
  renderFAQSection();
  renderAboutSectionExtended();
  renderAdmissionBanner();
  renderFooterDetails();
  renderSportHouses();
  renderStats();
  renderFeatureToggles();
  renderChatButtons();
  renderCBTSection();
}

// ===== Dynamic Hero Slides =====
function renderHeroSlides() {
  var prof = getSchoolProfile();
  if (!prof.heroTitle && !prof.heroSubtitle) return;
  var slides = [
    { el: document.getElementById('heroSlide0'), title: document.getElementById('heroTitle0'), sub: document.getElementById('heroSubtitle0'), badge: document.getElementById('heroBadge0'), img: (prof.heroImages && prof.heroImages[0]) || 'images/hero/slide1.jpg' },
    { el: document.getElementById('heroSlide1'), title: document.getElementById('heroTitle1'), sub: document.getElementById('heroSubtitle1'), badge: document.getElementById('heroBadge1'), img: (prof.heroImages && prof.heroImages[1]) || 'images/hero/slide2.jpg' },
    { el: document.getElementById('heroSlide2'), title: document.getElementById('heroTitle2'), sub: document.getElementById('heroSubtitle2'), badge: document.getElementById('heroBadge2'), img: (prof.heroImages && prof.heroImages[2]) || 'images/hero/slide3.jpg' }
  ];
  var names = (prof.schoolName || 'EduVerse').split(' ');
  slides.forEach(function(s, i) {
    if (!s.el) return;
    if (s.img) s.el.style.backgroundImage = 'linear-gradient(135deg, rgba(15,36,64,0.35), rgba(26,58,92,0.25)), url(\'' + s.img + '\')';
    if (i === 0) {
      if (s.title) s.title.innerHTML = (prof.heroTitle || 'Shape Your Future') + ' <span>' + (names[0] || 'With Us') + '</span>';
      if (s.sub) s.sub.textContent = prof.heroSubtitle || 'Empowering students with world-class education.';
      if (s.badge) s.badge.innerHTML = '<i class="fas fa-star"></i> ' + (prof.schoolName || 'EduVerse');
    } else if (i === 1) {
      if (s.title) s.title.innerHTML = (names.length > 1 ? names.slice(1).join(' ') : 'Your School') + ', <span>Your Way</span>';
      if (s.sub) s.sub.textContent = 'Manage students, teachers, fees, and results — all from one unified platform.';
      if (s.badge) s.badge.innerHTML = '<i class="fas fa-graduation-cap"></i> FOR SCHOOLS, BY EDUCATORS';
    } else if (i === 2) {
      if (s.title) s.title.innerHTML = 'K-12, Admissions, <span>&amp; More</span>';
      if (s.sub) s.sub.textContent = 'Full academic management from ECCDE to SSS, entrance exams, ID cards, analytics, and more.';
      if (s.badge) s.badge.innerHTML = '<i class="fas fa-trophy"></i> ALL-IN-ONE PLATFORM';
    }
  });
}

// ===== Dynamic Social Links =====
function renderSocialLinks() {
  var prof = getSchoolProfile();
  var links = prof.socialLinks || [];
  var container = document.querySelector('.footer-social');
  if (!container) return;
  var icons = { facebook: 'fab fa-facebook', twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin', instagram: 'fab fa-instagram', youtube: 'fab fa-youtube' };
  container.innerHTML = links.map(function(l) {
    var cls = icons[l.platform] || 'fas fa-globe';
    var href = l.url && l.url.trim() ? l.url : 'javascript:;';
    return '<a href="' + href + '" aria-label="' + l.platform.charAt(0).toUpperCase() + l.platform.slice(1) + '" target="_blank" rel="noopener"><i class="' + cls + '"></i></a>';
  }).join('');
}

// ===== Apply Theme Colors =====
function applyTheme() {
  var prof = getSchoolProfile();
  var t = prof.theme || {};
  if (t.primaryColor) document.documentElement.style.setProperty('--primary', t.primaryColor);
  if (t.accentColor) document.documentElement.style.setProperty('--accent', t.accentColor);
  if (t.successColor) document.documentElement.style.setProperty('--success', t.successColor);
  if (t.infoColor) document.documentElement.style.setProperty('--info', t.infoColor);
}

// ===== Render School Info =====
function renderSchoolInfo() {
  var prof = getSchoolProfile();
  // Motto
  var mottoEls = document.querySelectorAll('.school-motto');
  mottoEls.forEach(function(el) { el.textContent = prof.schoolMotto || ''; });
  // Founding year + type in footer
  var extraEl = document.getElementById('footerSchoolExtra');
  if (extraEl) {
    var parts = [];
    if (prof.foundingYear) parts.push('Est. ' + prof.foundingYear);
    if (prof.schoolType) parts.push(prof.schoolType === 'day' ? 'Day School' : prof.schoolType === 'boarding' ? 'Boarding School' : 'Day & Boarding');
    if (prof.gender) parts.push(prof.gender === 'coeducational' ? 'Co-educational' : prof.gender === 'boys' ? 'Boys Only' : 'Girls Only');
    extraEl.textContent = parts.join(' | ');
  }
  // Operating hours + emergency contact
  var infoEl = document.getElementById('footerSchoolInfo');
  if (infoEl) {
    infoEl.innerHTML = '';
    if (prof.operatingHours) infoEl.innerHTML += '<span><i class="far fa-clock"></i> ' + esc(prof.operatingHours) + '</span><br>';
    if (prof.emergencyContact) infoEl.innerHTML += '<span><i class="fas fa-phone-alt"></i> Emergency: ' + esc(prof.emergencyContact) + '</span>';
  }
  // Logo in navbar
  var logoImg = document.querySelector('.school-logo-img');
  if (logoImg && prof.logoUrl) logoImg.src = prof.logoUrl;
  // School name in branding
  var nameEls = document.querySelectorAll('.school-name-display');
  nameEls.forEach(function(el) { el.textContent = prof.schoolName || 'EduVerse'; });
}

// ===== Render Branding (font, border-radius, favicon, custom CSS) =====
function renderBranding() {
  var prof = getSchoolProfile();
  if (prof.fontFamily) document.documentElement.style.setProperty('--font-family', prof.fontFamily);
  if (prof.borderRadius) document.documentElement.style.setProperty('--radius', prof.borderRadius);
  if (prof.schoolSecondaryColor) document.documentElement.style.setProperty('--secondary', prof.schoolSecondaryColor);
  if (prof.faviconUrl) {
    var link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if (link) link.href = prof.faviconUrl;
  }
  if (prof.customCSS) {
    var style = document.getElementById('spCustomCSS');
    if (!style) { style = document.createElement('style'); style.id = 'spCustomCSS'; document.head.appendChild(style); }
    style.textContent = prof.customCSS;
  }
  if (prof.loginBackground) {
    var loginPages = document.querySelectorAll('.portal-page');
    loginPages.forEach(function(p) {
      p.style.backgroundImage = 'url(' + prof.loginBackground + ')';
      p.style.backgroundSize = 'cover';
      p.style.backgroundPosition = 'center';
    });
  }
}

// ===== Render Announcement Bar =====
function renderAnnouncementBar() {
  var prof = getSchoolProfile();
  var bar = prof.announcementBar || {};
  var el = document.getElementById('announcementBar');
  if (!el) return;
  if (bar.enabled && bar.text) {
    el.style.display = 'block';
    el.innerHTML = '<div class="announcement-content"><i class="fas fa-bullhorn"></i> ' + esc(bar.text) + '</div>';
  } else {
    el.style.display = 'none';
  }
}

// ===== Render Facilities Section =====
function renderFacilitiesSection() {
  var prof = getSchoolProfile();
  var container = document.getElementById('facilitiesGrid');
  if (!container) return;
  var items = prof.facilities || [];
  var section = container.closest('.section-area');
  if (!items.length) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';
  container.innerHTML = items.map(function(f) {
    return '<div class="facility-card"><div class="facility-img">'
      + (f.image ? '<img src="' + esc(f.image) + '" alt="' + esc(f.name) + '" loading="lazy">' : '<div class="facility-placeholder"><i class="fas fa-building"></i></div>')
      + '</div><div class="facility-info"><h4>' + esc(f.name) + '</h4><p>' + esc(f.description) + '</p></div></div>';
  }).join('');
}

// ===== Render Staff Section =====
function renderStaffSection() {
  var prof = getSchoolProfile();
  var container = document.getElementById('staffGrid');
  if (!container) return;
  var items = prof.staff || [];
  var section = container.closest('.section-area');
  if (!items.length) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';
  container.innerHTML = items.map(function(s) {
    return '<div class="staff-card"><div class="staff-photo">'
      + (s.photo ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy">' : '<div class="staff-placeholder"><i class="fas fa-user-tie"></i></div>')
      + '</div><h4>' + esc(s.name) + '</h4><span class="staff-role">' + esc(s.role) + '</span><p>' + esc(s.bio) + '</p></div>';
  }).join('');
}

// ===== Render FAQ Section =====
function renderFAQSection() {
  var prof = getSchoolProfile();
  var container = document.getElementById('faqContainer');
  if (!container) return;
  var items = prof.faqs || [];
  var section = container.closest('.section-area');
  if (!items.length) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';
  container.innerHTML = items.map(function(faq, i) {
    return '<div class="faq-item"><div class="faq-question" onclick="toggleFAQ(this)">'
      + '<span>' + esc(faq.question) + '</span><i class="fas fa-chevron-down"></i></div>'
      + '<div class="faq-answer">' + esc(faq.answer) + '</div></div>';
  }).join('');
}

function toggleFAQ(header) {
  header.classList.toggle('open');
  var answer = header.nextElementSibling;
  if (answer) answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
}

// ===== Render About Section Extended =====
function renderAboutSectionExtended() {
  var prof = getSchoolProfile();
  var imgs = prof.aboutImages || [];
  var container = document.getElementById('aboutImagesContainer');
  if (!container) return;
  if (!imgs.length || !imgs.filter(function(u){return u;}).length) { container.innerHTML = ''; } else {
    container.innerHTML = imgs.filter(function(u){return u;}).map(function(url) {
      return '<div class="about-image-item"><img src="' + esc(url) + '" alt="School" loading="lazy"></div>';
    }).join('');
  }
  // About text
  var textEl = document.getElementById('aboutTextDisplay');
  if (textEl) textEl.textContent = prof.aboutText || 'We are committed to providing quality education that nurtures academic excellence, character development, and lifelong learning.';
  // About section extras: curriculum, type, gender, hours
  var extras = document.getElementById('aboutExtras');
  if (extras) {
    var items = [];
    if (prof.curriculumLabel) items.push('<span><i class="fas fa-book"></i> ' + esc(prof.curriculumLabel) + '</span>');
    if (prof.operatingHours) items.push('<span><i class="far fa-clock"></i> ' + esc(prof.operatingHours) + '</span>');
    if (prof.schoolType) items.push('<span><i class="fas fa-school"></i> ' + (prof.schoolType === 'day' ? 'Day School' : prof.schoolType === 'boarding' ? 'Boarding School' : 'Day & Boarding') + '</span>');
    if (prof.foundingYear) items.push('<span><i class="fas fa-calendar-alt"></i> Est. ' + esc(prof.foundingYear) + '</span>');
    extras.innerHTML = items.length ? '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--text-light);">' + items.join('') + '</div>' : '';
  }
}

// ===== Render Admission Banner =====
function renderAdmissionBanner() {
  var prof = getSchoolProfile();
  var el = document.getElementById('admissionBanner');
  if (!el) return;
  if (prof.admissionOpen) {
    el.style.display = 'block';
    var reqs = (prof.admissionRequirements || []).filter(function(r){return r.trim();});
    el.innerHTML = '<div class="admission-banner-inner">'
      + '<h3><i class="fas fa-graduation-cap"></i> ' + esc(prof.admissionSeason || 'Admissions Open') + '</h3>'
      + (reqs.length ? '<div class="admission-reqs"><strong>Requirements:</strong><ul>' + reqs.map(function(r){return '<li>' + esc(r) + '</li>';}).join('') + '</ul></div>' : '')
      + '<a href="javascript:;" class="btn btn-accent" onclick="showAdmissionPortal()"><i class="fas fa-arrow-right"></i> Apply Now</a>'
      + '</div>';
  } else {
    el.style.display = 'none';
  }
}

// ===== Render Footer Details =====
function renderFooterDetails() {
  var prof = getSchoolProfile();
  var logo = document.getElementById('footerLogo');
  if (logo && prof.logoUrl) logo.src = prof.logoUrl;
  var brand = document.querySelector('.footer-top-bar .logo');
  if (brand && prof.schoolName) {
    var textNode = brand.childNodes[brand.childNodes.length - 1];
    if (textNode) textNode.textContent = ' ' + prof.schoolName;
  }
  var motto = document.querySelector('.footer-motto');
  if (motto) motto.textContent = prof.schoolMotto || '';
  // Newsletter text
  var nlText = document.querySelector('.footer-widget .newsletter-form');
  if (nlText) {
    var prevP = nlText.previousElementSibling;
    if (prevP && prevP.tagName === 'P') prevP.textContent = prof.newsletterText || 'Subscribe to receive updates on school activities and academic news.';
  }
  // Footer year
  var footerBottom = document.querySelector('.footer-bottom p');
  if (footerBottom) {
    var year = new Date().getFullYear();
    var name = prof.schoolName || 'EduVerse Institute of Technology & Management';
    footerBottom.innerHTML = '&copy; ' + year + ' ' + esc(name) + ' ' + (prof.foundingYear ? ' (Est. ' + prof.foundingYear + ')' : '') + '. All rights reserved.';
  }
  // Map embed
  var mapEl = document.getElementById('footerMap');
  if (mapEl) {
    if (prof.mapEmbedUrl) {
      mapEl.style.display = 'block';
      mapEl.innerHTML = '<iframe src="' + esc(prof.mapEmbedUrl) + '" width="100%" height="200" style="border:0;border-radius:8px;" allowfullscreen="" loading="lazy"></iframe>';
    } else { mapEl.style.display = 'none'; }
  }
  // Accreditations
  var accEl = document.querySelector('.footer-accreditations');
  if (accEl) {
    var accs = prof.accreditations || [];
    if (accs.length) {
      accEl.style.display = 'flex';
      accEl.innerHTML = accs.map(function(a) {
        return a.image ? '<img src="' + esc(a.image) + '" alt="' + esc(a.name) + '" title="' + esc(a.name) + '">' : '<span>' + esc(a.name) + '</span>';
      }).join('');
    } else { accEl.style.display = 'none'; }
  }
  // Alumni count
  var alumniEl = document.querySelector('.footer-alumni-count');
  if (alumniEl && prof.alumniCount) alumniEl.textContent = prof.alumniCount;
}

// ===== Render Sport Houses =====
function renderSportHouses() {
  var prof = getSchoolProfile();
  var container = document.getElementById('sportHousesContainer');
  if (!container) return;
  var items = prof.sportHouses || [];
  if (!items.length) { container.innerHTML = ''; return; }
  container.innerHTML = items.map(function(h) {
    return '<div class="sport-house-card"><div class="house-color" style="background:' + (h.color || '#e53e3e') + '"></div>'
      + '<h4>' + esc(h.name) + '</h4><p>' + esc(h.motto || '') + '</p></div>';
  }).join('');
}

// ===== Render Stats =====
function renderStats() {
  var prof = getSchoolProfile();
  var statEls = {
    students: document.getElementById('statStudents'),
    teachers: document.getElementById('statTeachers'),
    subjects: document.getElementById('statSubjects'),
    passRate: document.getElementById('statPassRate')
  };
  // Only update if they have IDs (data attributes could be used for more dynamic values)
  // For now they keep their hardcoded values from HTML
}

// ===== Render Feature Toggles (hide/show portal features) =====
function renderFeatureToggles() {
  var prof = getSchoolProfile();
  var ef = prof.enableFeatures || {};
  // Student tabs
  var tabMap = {
    library: 'library', transport: 'transport', health: 'health',
    activities: 'activities', alumni: 'alumni', hostel: 'hostel',
    activitygames: null, chat: 'forum', gallery: 'gallery',
    examSimulation: 'simulation'
  };
  Object.keys(tabMap).forEach(function(feature) {
    var tab = tabMap[feature];
    if (!tab) return;
    var enabled = ef[feature] !== false;
    var tabEl = document.querySelector('.student-tab[data-tab="' + tab + '"]');
    if (tabEl) tabEl.style.display = enabled ? '' : 'none';
  });
  // Portal cards on landing page
  var portalMap = { transport: null, health: null }; // transport/health portals are in student portal, not landing
}

// ===== Render CBT Section on Landing Page =====
function renderCBTSection() {
  var prof = getSchoolProfile();
  var cbt = prof.cbtConfig || {};
  if (!cbt.enabled) {
    var sec = document.getElementById('cbtSection');
    if (sec) sec.style.display = 'none';
    return;
  }
  var sec = document.getElementById('cbtSection');
  if (!sec) return;
  sec.style.display = '';
  var features = cbt.features || [];
  var exams = cbt.upcomingExams || [];
  var schoolName = prof.schoolName || 'EduVerse';
  var slug = '';
  try {
    var activeTenant = localStorage.getItem('activeTenant');
    if (activeTenant && typeof getTenants === 'function') {
      var tenants = getTenants();
      var tenant = tenants.find(function(t) { return t.id === activeTenant; });
      if (tenant) slug = tenant.slug || '';
    }
  } catch(e) {}

  var html = '<div class="section-title"><h2>' + esc(cbt.title || 'Computer-Based Testing (CBT)') + '</h2>'
    + (cbt.headline ? '<p>' + esc(cbt.headline) + '</p>' : '')
    + '</div>'
    + (cbt.description ? '<p style="max-width:700px;margin:0 auto 32px;text-align:center;color:var(--text-light);font-size:15px;line-height:1.7;">' + esc(cbt.description) + '</p>' : '');

  // Features grid
  if (features.length) {
    html += '<div class="cbt-features-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px;">';
    features.forEach(function(f) {
      html += '<div class="cbt-feature-card" style="background:white;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;transition:box-shadow .2s,transform .2s;" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,0.08)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'">'
        + '<div style="font-size:36px;color:var(--primary);margin-bottom:12px;"><i class="fas ' + htmlEscape(f.icon || 'fa-laptop') + '"></i></div>'
        + '<h4 style="font-size:15px;font-weight:600;color:var(--text);">' + esc(f.text || '') + '</h4>'
        + '</div>';
    });
    html += '</div>';
  }

  // Upcoming exams
  if (exams.length) {
    html += '<div style="margin-bottom:24px;"><h4 style="font-size:16px;font-weight:600;margin-bottom:12px;text-align:center;"><i class="fas fa-calendar-alt" style="color:var(--primary);"></i> Upcoming CBT Exams</h4>'
      + '<div style="max-width:600px;margin:0 auto;display:grid;gap:8px;">';
    exams.forEach(function(ex) {
      html += '<div style="display:flex;align-items:center;gap:12px;background:white;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0;">'
        + '<div style="width:40px;height:40px;border-radius:8px;background:#eef2ff;display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:700;font-size:13px;">' + esc((ex.date || '').split('-').slice(1).join('/')) + '</div>'
        + '<div style="flex:1;"><strong style="font-size:14px;">' + esc(ex.title || '') + '</strong>'
        + (ex.className ? '<div style="font-size:12px;color:var(--text-light);">' + esc(ex.className) + '</div>' : '')
        + '</div>'
        + '<div style="font-size:12px;color:var(--text-light);">' + esc(ex.date || '') + '</div>'
        + '</div>';
    });
    html += '</div></div>';
  }

  // Registration CTA
  if (cbt.registrationOpen) {
    html += '<div style="text-align:center;margin-top:16px;padding:24px;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:12px;">'
      + '<h4 style="font-size:18px;font-weight:700;color:white;margin-bottom:8px;">' + esc(cbt.registrationText || 'Register for CBT Exams') + '</h4>'
      + '<a href="/school/' + encodeURIComponent(slug) + '/login?role=student" class="btn btn-primary" style="background:var(--accent);color:var(--primary-dark);font-weight:700;padding:12px 32px;border-radius:8px;display:inline-block;text-decoration:none;"><i class="fas fa-pen"></i> ' + esc(cbt.ctaText || 'Take a CBT Exam') + '</a>'
      + '</div>';
  } else if (cbt.ctaText) {
    html += '<div style="text-align:center;margin-top:16px;">'
      + '<a href="/school/' + encodeURIComponent(slug) + '/login?role=student" class="btn btn-primary" style="background:var(--primary);color:white;padding:12px 32px;border-radius:8px;display:inline-block;text-decoration:none;font-weight:600;"><i class="fas fa-laptop-code"></i> ' + esc(cbt.ctaText || 'Take a CBT Exam') + '</a>'
      + '</div>';
  }

  sec.innerHTML = html;
}

// ===== Render Floating Chat Buttons =====
function renderChatButtons() {
  var prof = getSchoolProfile();
  var cfg = (typeof getPlatformConfig === 'function') ? getPlatformConfig() : null;
  var waNum = (prof.whatsappNumber || '').replace(/[\s\-\(\)]/g, '');
  var email = prof.contactEmail || '';

  // Fall back to platform-level config if school has not set their own
  if (!waNum && cfg) waNum = (cfg.whatsappNumber || '').replace(/[\s\-\(\)]/g, '');
  if (!email && cfg) email = cfg.contactEmail || '';

  var wa = document.getElementById('chatWhatsappBtn');
  var em = document.getElementById('chatEmailBtn');
  if (!wa && !em) return;
  if (wa) {
    if (waNum) {
      var cleaned = waNum.startsWith('+') ? waNum.substring(1) : waNum;
      wa.href = 'https://wa.me/' + encodeURIComponent(cleaned);
      wa.title = 'Chat on WhatsApp';
    } else {
      wa.href = 'javascript:void(0)';
      wa.title = 'Set your WhatsApp number in School Profile or Super Admin';
    }
    wa.style.display = 'flex';
  }
  if (em) {
    if (email) {
      em.href = 'mailto:' + email;
      em.title = 'Send email to: ' + email;
    } else {
      em.href = 'javascript:void(0)';
      em.title = 'Set your contact email in School Profile or Super Admin';
    }
    em.style.display = 'flex';
  }
}

// ===== Newsletter Subscription =====
var NEWSLETTER_KEY = 'eduverse_newsletter_subscribers';
var NOTIFY_EMAIL = 'eduversemgt@gmail.com';

function subscribeNewsletter(input) {
  var email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    input.focus();
    return;
  }
  var subs = [];
  try { subs = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]'); } catch(e) {}
  if (subs.some(function(s) { return s.email === email; })) {
    showToast('You\'re already subscribed!');
    input.value = '';
    return;
  }
  subs.push({ email: email, subscribedAt: new Date().toISOString() });
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(subs));
  input.value = '';
  showToast('Subscribed successfully! Check your inbox.');
  // Notify admin via mailto
  var subj = encodeURIComponent('New Newsletter Subscriber');
  var body = encodeURIComponent('New subscriber: ' + email + '\nTotal subscribers: ' + subs.length + '\n\nSent from EduVerse platform.');
  window.open('mailto:' + NOTIFY_EMAIL + '?subject=' + subj + '&body=' + body, '_blank');
}

// ===== School Setup Wizard (Onboarding) =====
var SETUP_WIZARD_KEY = '_setupWizardDone';

function needsSetupWizard() {
  if (localStorage.getItem(SETUP_WIZARD_KEY)) return false;
  var prof = getSchoolProfile();
  return !prof.schoolName || prof.schoolName === 'EduVerse' || !prof.schoolMotto || prof.facilities.length === 0;
}

function dismissSetupWizard() {
  localStorage.setItem(SETUP_WIZARD_KEY, 'true');
  var m = document.getElementById('setupWizardModal');
  if (m) m.remove();
}

function showSetupWizard() {
  if (!needsSetupWizard()) return;
  var existing = document.getElementById('setupWizardModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', buildSetupWizardHTML());
  showSetupStep(1);
}

function buildSetupWizardHTML() {
  return '<div id="setupWizardModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;overflow-y:auto;">' +
    '<div style="background:var(--card-bg,#fff);border-radius:16px;max-width:640px;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:modalSlideUp 0.3s ease;">' +
    '<div style="padding:24px 28px 0;display:flex;align-items:center;justify-content:space-between;">' +
    '<h3 style="font-size:20px;font-weight:700;"><i class="fas fa-magic" style="color:var(--primary,#2563eb);"></i> Welcome! Let\'s Set Up Your School</h3>' +
    '<button onclick="dismissSetupWizard()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);" title="Skip for now">&times;</button>' +
    '</div>' +
    // Progress bar
    '<div style="padding:16px 28px 0;"><div id="setupWizardProgress" style="display:flex;gap:4px;"></div></div>' +
    // Step content
    '<div id="setupWizardContent" style="padding:28px;"></div>' +
    // Footer buttons
    '<div style="padding:16px 28px 24px;display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--border,#e2e8f0);">' +
    '<button id="setupWizardBackBtn" class="btn btn-outline" onclick="prevSetupStep()" style="display:none;"><i class="fas fa-arrow-left"></i> Back</button>' +
    '<div></div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="btn btn-outline" onclick="dismissSetupWizard()">Skip</button>' +
    '<button id="setupWizardNextBtn" class="btn btn-primary" onclick="nextSetupStep()">Next <i class="fas fa-arrow-right"></i></button>' +
    '</div></div></div></div>';
}

var _setupStep = 1;
var _setupTotalSteps = 5;

function updateWizardProgress() {
  var bar = document.getElementById('setupWizardProgress');
  if (!bar) return;
  var html = '';
  for (var i = 1; i <= _setupTotalSteps; i++) {
    var done = i < _setupStep;
    var active = i === _setupStep;
    html += '<div style="flex:1;height:6px;border-radius:3px;background:' + (done ? 'var(--success,#38a169)' : active ? 'var(--primary,#2563eb)' : '#e2e8f0') + ';transition:0.3s;"></div>';
  }
  bar.innerHTML = html;
}

function showSetupStep(step) {
  _setupStep = step;
  updateWizardProgress();
  var content = document.getElementById('setupWizardContent');
  if (!content) return;
  var prof = getSchoolProfile();
  var backBtn = document.getElementById('setupWizardBackBtn');
  var nextBtn = document.getElementById('setupWizardNextBtn');
  if (backBtn) backBtn.style.display = step > 1 ? '' : 'none';
  if (nextBtn) {
    if (step >= _setupTotalSteps) {
      nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
      nextBtn.className = 'btn btn-success';
    } else {
      nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
      nextBtn.className = 'btn btn-primary';
    }
  }
  var steps = [
    { title: 'School Information', icon: 'fa-school', html: setupStep1HTML(prof) },
    { title: 'Institution Type', icon: 'fa-layer-group', html: setupStep2HTML() },
    { title: 'Branding & Theme', icon: 'fa-palette', html: setupStep3HTML(prof) },
    { title: 'Portal Features', icon: 'fa-toggle-on', html: setupStep4HTML(prof) },
    { title: 'Congratulations!', icon: 'fa-check-circle', html: setupStep5HTML(prof) },
  ];
  var s = steps[step - 1];
  content.innerHTML = '<h4 style="font-size:16px;font-weight:600;margin-bottom:16px;"><i class="fas ' + s.icon + '" style="color:var(--primary,#2563eb);margin-right:8px;"></i>Step ' + step + ': ' + s.title + '</h4>' + s.html;
}

function setupStep1HTML(prof) {
  return '<p style="color:var(--text-light);margin-bottom:16px;">Tell us about your school. This information will appear on your school\'s public landing page and portals.</p>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' +
    '<label style="font-weight:500;font-size:13px;">School Name <span style="color:var(--danger);">*</span></label>' +
    '<input id="wizSchoolName" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="e.g., EduVerse" value="' + esc(prof.schoolName || '') + '">' +
    '<label style="font-weight:500;font-size:13px;">School Motto</label>' +
    '<input id="wizSchoolMotto" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="e.g., Excellence, Character, Service" value="' + esc(prof.schoolMotto || '') + '">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    '<div><label style="font-weight:500;font-size:13px;">Phone</label><input id="wizPhone" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="+234..." value="' + esc(prof.contactPhone || '') + '"></div>' +
    '<div><label style="font-weight:500;font-size:13px;">Email</label><input id="wizEmail" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="school@example.com" value="' + esc(prof.contactEmail || '') + '"></div>' +
    '</div>' +
    '<label style="font-weight:500;font-size:13px;">Address</label>' +
    '<input id="wizAddress" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="School address" value="' + esc(prof.contactAddress || '') + '">' +
    '<label style="font-weight:500;font-size:13px;">School Type</label>' +
    '<select id="wizSchoolType" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">' +
    '<option value="day" ' + (prof.schoolType === 'day' ? 'selected' : '') + '>Day School</option>' +
    '<option value="boarding" ' + (prof.schoolType === 'boarding' ? 'selected' : '') + '>Boarding School</option>' +
    '<option value="mixed" ' + (prof.schoolType === 'mixed' ? 'selected' : '') + '>Day & Boarding</option>' +
    '</select></div>';
}

function setupStep2HTML() {
  var tier = data.schoolTier || 'full_k12';
  var tiers = [
    { value: 'eccde', label: 'Nursery Only', desc: 'Creche through Reception', icon: 'fa-baby' },
    { value: 'primary', label: 'Basic/Primary Only', desc: 'Basic 1 through Basic 6', icon: 'fa-book-reader' },
    { value: 'secondary', label: 'Secondary Only', desc: 'JSS 1 through SSS 3', icon: 'fa-user-graduate' },
    { value: 'full_k12', label: 'Full K-12', desc: 'Complete Nigerian curriculum', icon: 'fa-graduation-cap' },
    { value: 'tertiary', label: 'Tertiary / Higher Ed', desc: 'University, polytechnic, college', icon: 'fa-university' },
  ];
  var html = '<p style="color:var(--text-light);margin-bottom:16px;">Select your institution type. This will auto-configure classes, subjects, and grading for your school.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">';
  tiers.forEach(function(t) {
    var active = t.value === tier;
    html += '<div class="card wiz-tier-card" style="padding:16px;cursor:pointer;text-align:center;border:2px solid ' + (active ? 'var(--primary,#2563eb)' : '#e2e8f0') + ';background:' + (active ? 'var(--primary-light, #ebf4ff)' : 'var(--card-bg,#fff)') + ';" onclick="document.querySelectorAll(\'.wiz-tier-card\').forEach(function(c){c.style.borderColor=\'#e2e8f0\';c.style.background=\'var(--card-bg,#fff)\'});this.style.borderColor=\'var(--primary,#2563eb)\';this.style.background=\'var(--primary-light,#ebf4ff)\';document.getElementById(\'wizTier\').value=\'' + t.value + '\';">' +
    '<div style="font-size:28px;color:' + (active ? 'var(--primary,#2563eb)' : 'var(--text-light)') + ';margin-bottom:8px;"><i class="fas ' + t.icon + '"></i></div>' +
    '<h4 style="font-weight:600;font-size:13px;color:' + (active ? 'var(--primary,#2563eb)' : 'var(--text)') + ';">' + t.label + '</h4>' +
    '<p style="font-size:11px;color:var(--text-light);margin-top:4px;">' + t.desc + '</p>' +
    (active ? '<div style="margin-top:6px;"><span class="badge" style="background:var(--primary,#2563eb);color:#fff;font-size:10px;">Selected</span></div>' : '') +
    '</div>';
  });
  html += '</div><input type="hidden" id="wizTier" value="' + tier + '">';
  return html;
}

function setupStep3HTML(prof) {
  return '<p style="color:var(--text-light);margin-bottom:16px;">Customize your school\'s look and feel. These settings will be applied across all portals and the public landing page.</p>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' +
    '<label style="font-weight:500;font-size:13px;">School Logo URL</label>' +
    '<input id="wizLogo" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="Paste image URL or upload" value="' + esc(prof.logoUrl || '') + '">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
    '<div><label style="font-weight:500;font-size:13px;">Primary Color</label><input type="color" id="wizPrimaryColor" value="' + (prof.theme && prof.theme.primaryColor || '#2563eb') + '" style="width:100%;height:40px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;"></div>' +
    '<div><label style="font-weight:500;font-size:13px;">Accent Color</label><input type="color" id="wizAccentColor" value="' + (prof.theme && prof.theme.accentColor || '#fbbf24') + '" style="width:100%;height:40px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;"></div>' +
    '<div><label style="font-weight:500;font-size:13px;">Secondary Color</label><input type="color" id="wizSecondaryColor" value="' + (prof.schoolSecondaryColor || '#7c3aed') + '" style="width:100%;height:40px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;"></div>' +
    '</div></div>';
}

function setupStep4HTML(prof) {
  var features = prof.enableFeatures || {
    library: true, transport: true, health: true, activities: true,
    alumni: true, hostel: true, chat: true, gallery: true, examSimulation: true
  };
  var items = [
    { key: 'library', label: 'Library Module', desc: 'Book catalog, borrowing, and e-resources' },
    { key: 'transport', label: 'Transport', desc: 'Bus routes, tracking, and fee management' },
    { key: 'health', label: 'Health Services', desc: 'Clinic records, checkups, and medical history' },
    { key: 'activities', label: 'Activities & Clubs', desc: 'Extracurricular clubs and activity tracking' },
    { key: 'alumni', label: 'Alumni Network', desc: 'Alumni directory, reunions, and donations' },
    { key: 'hostel', label: 'Hostel Management', desc: 'Boarding, room allocation, and hostel fees' },
    { key: 'chat', label: 'Chat & Messaging', desc: 'In-app messaging between staff, students, parents' },
    { key: 'gallery', label: 'Photo Gallery', desc: 'School photo albums and media sharing' },
    { key: 'examSimulation', label: 'CBT Exam Simulation', desc: 'Computer-based testing and practice exams' },
  ];
  var html = '<p style="color:var(--text-light);margin-bottom:16px;">Choose which features to enable on your school\'s portals. You can change these anytime in Settings.</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  items.forEach(function(item) {
    var checked = features[item.key] !== false;
    html += '<label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:13px;">' +
      '<input type="checkbox" class="wiz-feature-check" data-key="' + item.key + '" ' + (checked ? 'checked' : '') + ' style="width:16px;height:16px;">' +
      '<div><div style="font-weight:500;">' + item.label + '</div><div style="font-size:11px;color:var(--text-light);">' + item.desc + '</div></div></label>';
  });
  html += '</div>';
  return html;
}

function setupStep5HTML() {
  return '<div style="text-align:center;padding:20px 0;">' +
    '<div style="font-size:64px;color:var(--success,#38a169);margin-bottom:16px;"><i class="fas fa-check-circle"></i></div>' +
    '<h3 style="font-size:22px;font-weight:700;margin-bottom:8px;">All Set!</h3>' +
    '<p style="color:var(--text-light);max-width:400px;margin:0 auto 16px;">Your school is now configured. You can always revisit these settings from the School Setup and Settings panels.</p>' +
    '<div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">' +
    '<a href="admin.html" class="btn btn-primary" style="text-decoration:none;"><i class="fas fa-tachometer-alt"></i> Go to Dashboard</a>' +
    '<button class="btn btn-outline" onclick="dismissSetupWizard()"><i class="fas fa-plus-circle"></i> Continue Configuring</button>' +
    '</div></div>';
}

function nextSetupStep() {
  if (_setupStep < _setupTotalSteps) {
    saveWizardStep(_setupStep);
    showSetupStep(_setupStep + 1);
  } else {
    saveWizardStep(_setupStep);
    localStorage.setItem(SETUP_WIZARD_KEY, 'true');
    var m = document.getElementById('setupWizardModal');
    if (m) {
      showToast('School setup complete! 🎉');
      setTimeout(function() { m.remove(); }, 800);
    }
  }
}

function prevSetupStep() {
  if (_setupStep > 1) showSetupStep(_setupStep - 1);
}

function saveWizardStep(step) {
  var prof = getSchoolProfile();
  var needsSave = false;
  if (step === 1) {
    var name = document.getElementById('wizSchoolName');
    if (name && name.value.trim()) { prof.schoolName = name.value.trim(); needsSave = true; }
    var motto = document.getElementById('wizSchoolMotto');
    if (motto && motto.value.trim()) { prof.schoolMotto = motto.value.trim(); needsSave = true; }
    var phone = document.getElementById('wizPhone');
    if (phone && phone.value.trim()) { prof.contactPhone = phone.value.trim(); needsSave = true; }
    var email = document.getElementById('wizEmail');
    if (email && email.value.trim()) { prof.contactEmail = email.value.trim(); needsSave = true; }
    var addr = document.getElementById('wizAddress');
    if (addr && addr.value.trim()) { prof.contactAddress = addr.value.trim(); needsSave = true; }
    var type = document.getElementById('wizSchoolType');
    if (type) { prof.schoolType = type.value; needsSave = true; }
  }
  if (step === 2) {
    var tier = document.getElementById('wizTier');
    if (tier && tier.value) { data.schoolTier = tier.value; needsSave = true; }
  }
  if (step === 3) {
    var logo = document.getElementById('wizLogo');
    if (logo && logo.value.trim()) { prof.logoUrl = logo.value.trim(); needsSave = true; }
    var pc = document.getElementById('wizPrimaryColor');
    if (pc) { if (!prof.theme) prof.theme = {}; prof.theme.primaryColor = pc.value; needsSave = true; }
    var ac = document.getElementById('wizAccentColor');
    if (ac) { if (!prof.theme) prof.theme = {}; prof.theme.accentColor = ac.value; needsSave = true; }
    var sc = document.getElementById('wizSecondaryColor');
    if (sc) { prof.schoolSecondaryColor = sc.value; needsSave = true; }
  }
  if (step === 4) {
    if (!prof.enableFeatures) prof.enableFeatures = {};
    document.querySelectorAll('.wiz-feature-check').forEach(function(cb) {
      prof.enableFeatures[cb.getAttribute('data-key')] = cb.checked;
    });
    needsSave = true;
  }
  if (needsSave) saveData();
}

// Show toast notification
function showToast(msg) {
  if (typeof toast === 'function') { toast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--success,#2e7d32);color:white;padding:14px 24px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:fadeIn 0.3s ease;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; setTimeout(function() { t.remove(); }, 500); }, 3000);
}


