/**
 * EduVerse - Website & School Profile Generator Engine
 * Manages dynamic AI website generation, custom profile showcase, and live portal previews.
 */

(function () {
  'use strict';

  window.EduVerseWebsite = window.EduVerseWebsite || {};

  function esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /**
   * Preset Generator Templates for instant school profile generation
   */
  var PRESET_TEMPLATES = {
    k12: {
      name: 'Gracefield International School',
      motto: 'Nurturing Global Leaders for Tomorrow',
      about: 'Gracefield International School is a premier K-12 institution committed to nurturing academic leaders through modern digital curriculum, world-class science labs, and holistic character building.',
      established: '2015',
      tier: 'Full K-12 Partner Accredited',
      address: '45 Gracefield Drive, Ikeja, Lagos',
      phone: '+234 802 345 6789',
      email: 'info@gracefield.edu.ng',
      logoUrl: 'icons/icon.svg',
      bannerUrl: 'images/services/library.jpg',
      themeColor: '#0f2440',
      facilities: ['Smart Classrooms', 'Robotics Suite', 'Sports Complex', 'E-Library', 'Boarding Hostel'],
      popularSubjects: [
        { id: 's1', name: 'Mathematics & STEM', category: 'Sciences', rating: 4.9, icon: 'fa-calculator', topics: 'Calculus, Algebra, Statistics', sellingPoints: '100% WAEC distinction rate' },
        { id: 's2', name: 'Computer Coding & AI', category: 'Technology', rating: 5.0, icon: 'fa-laptop-code', topics: 'Python, Web Dev, Cyber Security', sellingPoints: '1:1 laptop access' }
      ]
    },
    stem: {
      name: 'Ames Premier STEM Academy',
      motto: 'Empowering Innovators, Engineers & Future Scientists',
      about: 'Ames Premier STEM Academy specializes in intensive science, technology, engineering, and mathematics education with state-of-the-art laboratories.',
      established: '2018',
      tier: 'STEM Excellence Accredited',
      address: '88 Tech Hub Avenue, Yaba, Lagos',
      phone: '+234 803 456 7890',
      email: 'admissions@amespremier.sch.ng',
      logoUrl: 'images/courses/technology.jpg',
      bannerUrl: 'images/services/academics.jpg',
      themeColor: '#065f46',
      facilities: ['3D Printing Lab', 'AI Robotics Hub', 'Chemistry Lab', 'Fiber Fiber WiFi', 'Solar Power'],
      popularSubjects: [
        { id: 's1', name: 'Integrated Physics & Robotics', category: 'Engineering', rating: 5.0, icon: 'fa-atom', topics: 'Circuit Design, Automation, Mechanics', sellingPoints: 'National Robotics Competition Winner' },
        { id: 's2', name: 'Data Science & Python', category: 'Information Tech', rating: 4.9, icon: 'fa-database', topics: 'Data Analytics, Algorithms, ML', sellingPoints: 'Industry certified curriculum' }
      ]
    },
    international: {
      name: 'Gracefield Global College',
      motto: 'Nurturing Global Leaders with Cambridge & WAEC Curriculum',
      about: 'Gracefield College offers a dual British-Nigerian curriculum designed to prepare students for top universities worldwide.',
      established: '2015',
      tier: 'Cambridge & WAEC Accredited',
      address: '45 Gracefield Drive, Ikeja, Lagos',
      phone: '+234 802 345 6789',
      email: 'info@gracefield.edu.ng',
      logoUrl: 'images/courses/science.jpg',
      bannerUrl: 'images/services/sports.jpg',
      themeColor: '#1e40af',
      facilities: ['Cambridge Exam Center', 'Olympic Pool', 'Music Conservatory', 'Auditorium', 'Language Lab'],
      popularSubjects: [
        { id: 's1', name: 'English Literature & IELTS Prep', category: 'Languages', rating: 4.9, icon: 'fa-book-open', topics: 'Creative Writing, Public Speaking, IELTS', sellingPoints: 'IELTS Band 8+ average score' },
        { id: 's2', name: 'Business & Financial Accounting', category: 'Commerce', rating: 4.8, icon: 'fa-chart-line', topics: 'Economics, Accounting, Entrepreneurship', sellingPoints: 'Young Entrepreneurs Club' }
      ]
    }
  };

  /**
   * Main Website Builder & Profile Generator Renderer
   */
  function renderWebsiteBuilder() {
    var container = document.getElementById('websiteBuilderContainer');
    if (!container) return;

    var currentProfile = typeof getSchoolProfile === 'function' ? getSchoolProfile() : {
      name: 'Gracefield International School',
      motto: 'Nurturing Global Leaders for Tomorrow',
      about: 'Welcome to our official school portal.',
      address: '45 Gracefield Drive, Ikeja, Lagos',
      phone: '+234 802 345 6789',
      email: 'info@gracefield.edu.ng',
      slug: 'gracefield-international'
    };

    var slug = currentProfile.slug || 'gracefield-international';

    var html = ''
      + '<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.03);margin-bottom:20px;">'
      + '  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">'
      + '    <div>'
      + '      <h3 style="margin:0;font-size:18px;font-weight:800;color:#0f2440;display:flex;align-items:center;gap:8px;">'
      + '        <i class="fas fa-magic" style="color:#2563eb;"></i> AI School Website & Profile Generator'
      + '      </h3>'
      + '      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Generate a complete public website profile for your school in one click or customize elements manually.</p>'
      + '    </div>'
      + '    <div style="display:flex;gap:8px;flex-wrap:wrap;">'
      + '      <button class="btn btn-sm btn-primary" onclick="window.EduVerseWebsite.generatePresetProfile(\'k12\')" style="background:#2563eb;"><i class="fas fa-wand-magic-sparkles"></i> Generate K-12 Academy</button>'
      + '      <button class="btn btn-sm btn-accent" onclick="window.EduVerseWebsite.generatePresetProfile(\'stem\')" style="background:#f59e0b;color:#0f172a;"><i class="fas fa-atom"></i> Generate STEM School</button>'
      + '      <a href="school-portal.html?school=' + encodeURIComponent(slug) + '" target="_blank" class="btn btn-sm btn-outline" style="border-color:#cbd5e1;color:#0f172a;text-decoration:none;"><i class="fas fa-external-link-alt"></i> Launch Live Website</a>'
      + '    </div>'
      + '  </div>'

      // Split Editor & Live Preview Grid
      + '  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;" class="ev-pros-cons-grid">'
      
      // Left Column: Controls & Configuration
      + '    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">'
      + '      <h4 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:6px;">'
      + '        <i class="fas fa-sliders-h" style="color:#2563eb;"></i> Website Content Controls'
      + '      </h4>'
      
      + '      <div style="display:flex;flex-direction:column;gap:10px;">'
      + '        <div>'
      + '          <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">School Institution Name</label>'
      + '          <input type="text" id="wbName" value="' + esc(currentProfile.name) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">Motto / Tagline</label>'
      + '          <input type="text" id="wbMotto" value="' + esc(currentProfile.motto) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">Dedicated Website Slug URL</label>'
      + '          <input type="text" id="wbSlug" value="' + esc(slug) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">About & Mission Overview</label>'
      + '          <textarea id="wbAbout" rows="3" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">' + esc(currentProfile.about) + '</textarea>'
      + '        </div>'
      + '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
      + '          <div>'
      + '            <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">Phone Line</label>'
      + '            <input type="text" id="wbPhone" value="' + esc(currentProfile.phone) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '          </div>'
      + '          <div>'
      + '            <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">Admissions Email</label>'
      + '            <input type="email" id="wbEmail" value="' + esc(currentProfile.email) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '          </div>'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:11px;font-weight:700;color:#475569;display:block;margin-bottom:2px;">Campus Physical Address</label>'
      + '          <input type="text" id="wbAddress" value="' + esc(currentProfile.address) + '" class="form-control" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">'
      + '        </div>'
      + '        <div style="margin-top:8px;display:flex;gap:8px;">'
      + '          <button class="btn btn-primary btn-sm" onclick="window.EduVerseWebsite.saveFromWebsiteBuilder()" style="flex:1;"><i class="fas fa-save"></i> Save Website Profile</button>'
      + '          <button class="btn btn-outline btn-sm" onclick="window.EduVerseWebsite.refreshWebsitePreview()"><i class="fas fa-sync"></i> Refresh Preview</button>'
      + '        </div>'
      + '      </div>'
      + '    </div>'

      // Right Column: Live Website Preview Frame
      + '    <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;">'
      + '      <div style="background:#0f2440;color:#ffffff;padding:10px 14px;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;">'
      + '        <span><i class="fas fa-desktop"></i> Live Website Preview Frame</span>'
      + '        <span style="font-size:10px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:12px;">ACTIVE TENANT PORTAL</span>'
      + '      </div>'
      + '      <iframe id="wbIframePreview" src="school-portal.html?school=' + encodeURIComponent(slug) + '" style="width:100%;height:450px;border:none;background:#f8fafc;" title="Live School Website Preview"></iframe>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    container.innerHTML = html;
  }

  /**
   * Save settings from Website Builder
   */
  function saveFromWebsiteBuilder() {
    var profile = typeof getSchoolProfile === 'function' ? getSchoolProfile() : {};

    var nameEl = document.getElementById('wbName');
    var mottoEl = document.getElementById('wbMotto');
    var slugEl = document.getElementById('wbSlug');
    var aboutEl = document.getElementById('wbAbout');
    var phoneEl = document.getElementById('wbPhone');
    var emailEl = document.getElementById('wbEmail');
    var addrEl = document.getElementById('wbAddress');

    if (nameEl) profile.name = nameEl.value.trim();
    if (mottoEl) profile.motto = mottoEl.value.trim();
    if (aboutEl) profile.about = aboutEl.value.trim();
    if (phoneEl) profile.phone = phoneEl.value.trim();
    if (emailEl) profile.email = emailEl.value.trim();
    if (addrEl) profile.address = addrEl.value.trim();

    var cleanSlug = slugEl ? slugEl.value.trim() : (profile.slug || 'school-slug');
    if (typeof normalizeSlug === 'function') cleanSlug = normalizeSlug(cleanSlug);
    profile.slug = cleanSlug;

    try {
      localStorage.setItem('eduverse_school_profile', JSON.stringify(profile));
      localStorage.setItem('schoolProfile_' + cleanSlug, JSON.stringify(profile));
      var at = localStorage.getItem('activeTenant') || 'default';
      localStorage.setItem('schoolProfile_' + at, JSON.stringify(profile));
    } catch(e) {}

    if (typeof window.syncGlobalBranding === 'function') {
      window.syncGlobalBranding(profile);
    }

    refreshWebsitePreview();

    if (typeof window.toast === 'function') {
      window.toast('School website profile saved and synchronized successfully!', 'success');
    }
  }

  /**
   * Generate preset template
   */
  function generatePresetProfile(presetKey) {
    var template = PRESET_TEMPLATES[presetKey] || PRESET_TEMPLATES.k12;
    var profile = JSON.parse(JSON.stringify(template));

    var cleanSlug = typeof normalizeSlug === 'function' ? normalizeSlug(profile.name) : 'school-slug';
    profile.slug = cleanSlug;

    try {
      localStorage.setItem('eduverse_school_profile', JSON.stringify(profile));
      localStorage.setItem('schoolProfile_' + cleanSlug, JSON.stringify(profile));
      var at = localStorage.getItem('activeTenant') || 'default';
      localStorage.setItem('schoolProfile_' + at, JSON.stringify(profile));

      // Register in tenants list
      if (typeof createTenant === 'function') {
        createTenant({
          id: cleanSlug,
          name: profile.name,
          slug: cleanSlug,
          motto: profile.motto,
          tier: profile.tier,
          address: profile.address,
          phone: profile.phone,
          email: profile.email
        });
      }
    } catch(e) {}

    if (typeof window.syncGlobalBranding === 'function') {
      window.syncGlobalBranding(profile);
    }

    renderWebsiteBuilder();

    if (typeof window.toast === 'function') {
      window.toast('Generated full school website profile: ' + profile.name, 'success');
    }
  }

  /**
   * Refresh iframe preview
   */
  function refreshWebsitePreview() {
    var iframe = document.getElementById('wbIframePreview');
    if (!iframe) return;
    var slugEl = document.getElementById('wbSlug');
    var slug = slugEl ? slugEl.value.trim() : 'demo-school';
    iframe.src = 'school-portal.html?school=' + encodeURIComponent(slug) + '&t=' + Date.now();
  }

  // Export module functions
  window.EduVerseWebsite = {
    renderWebsiteBuilder: renderWebsiteBuilder,
    saveFromWebsiteBuilder: saveFromWebsiteBuilder,
    generatePresetProfile: generatePresetProfile,
    refreshWebsitePreview: refreshWebsitePreview
  };

  window.renderWebsiteBuilder = renderWebsiteBuilder;

})();
