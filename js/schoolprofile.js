/**
 * EduVerse - Deep Functional Activation: School Profile & Portal Customization Engine
 * Manages school identity, branding, logo/banner previews, color themes,
 * facility management, popular subjects/services CRUD, and public tenant profile showcase.
 */

(function () {
  'use strict';

  window.EduVerseSchoolProfile = window.EduVerseSchoolProfile || {};

  var DEFAULT_POPULAR_SUBJECTS = [
    {
      id: 'subj-math',
      name: 'Mathematics & Advanced STEM',
      category: 'Sciences & Engineering',
      rating: 4.9,
      teachers: 12,
      icon: 'fa-calculator',
      image: 'images/courses/mathematics.jpg',
      topics: 'Algebra, Geometry, Calculus, Statistics & Financial Math',
      sellingPoints: 'State-of-the-art math lab, 98% WAEC distinction rate, interactive problem solving.'
    },
    {
      id: 'subj-sci',
      name: 'Integrated Sciences (Physics & Chemistry)',
      category: 'Pure & Applied Sciences',
      rating: 4.8,
      teachers: 10,
      icon: 'fa-atom',
      image: 'images/courses/science.jpg',
      topics: 'Physics Experiments, Organic Chemistry, Molecular Biology',
      sellingPoints: 'Fully equipped modern robotics and science laboratory with hands-on practicals.'
    },
    {
      id: 'subj-eng',
      name: 'English & Global Communication',
      category: 'Languages & Arts',
      rating: 4.9,
      teachers: 8,
      icon: 'fa-book-open',
      image: 'images/courses/english.jpg',
      topics: 'Literature in English, Creative Writing, Public Speaking, Grammar',
      sellingPoints: 'IELTS / TOEFL prep integrated, debate club mentorship, digital publishing.'
    },
    {
      id: 'subj-comp',
      name: 'Computer Studies & AI Coding',
      category: 'Information Technology',
      rating: 5.0,
      teachers: 7,
      icon: 'fa-laptop-code',
      image: 'images/courses/commerce.jpg',
      topics: 'Python Programming, Web Development, Cyber Security, AI Basics',
      sellingPoints: 'High-speed fiber ICT suite, 1:1 computer ratio for students, cloud coding lab.'
    }
  ];

  var DEFAULT_FACILITIES = [
    'Smart Digital Classrooms',
    'Robotics & STEM Lab',
    'Olympic-Size Sports Complex',
    'Standard E-Library',
    'Modern Boarding Hostel',
    '24/7 Gate Access Security'
  ];

  /**
   * Safe HTML Escaper
   */
  function esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /**
   * Get Active Storage Key for Current Tenant
   */
  function getStorageKey() {
    try {
      var at = localStorage.getItem('activeTenant');
      if (at) return 'schoolProfile_' + at;
    } catch(e) {}
    return 'eduverse_school_profile';
  }

  /**
   * Retrieve Current School Profile
   */
  function getSchoolProfile() {
    var key = getStorageKey();
    try {
      var stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return {
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
      popularSubjects: DEFAULT_POPULAR_SUBJECTS,
      facilities: DEFAULT_FACILITIES
    };
  }

  /**
   * Save School Profile Data & Update System Globally
   */
  function saveSchoolProfile() {
    var profile = getSchoolProfile();

    var nameInput = document.getElementById('spSchoolName');
    var mottoInput = document.getElementById('spSchoolMotto');
    var aboutInput = document.getElementById('spSchoolAbout');
    var phoneInput = document.getElementById('spSchoolPhone');
    var emailInput = document.getElementById('spSchoolEmail');
    var addressInput = document.getElementById('spSchoolAddress');
    var establishedInput = document.getElementById('spSchoolEstablished');
    var logoInput = document.getElementById('spSchoolLogo');
    var bannerInput = document.getElementById('spSchoolBanner');
    var themeSelect = document.getElementById('spSchoolTheme');
    var slugInput = document.getElementById('spSchoolSlug');

    if (nameInput) profile.name = nameInput.value.trim();
    if (mottoInput) profile.motto = mottoInput.value.trim();
    if (aboutInput) profile.about = aboutInput.value.trim();
    if (phoneInput) profile.phone = phoneInput.value.trim();
    if (emailInput) profile.email = emailInput.value.trim();
    if (addressInput) profile.address = addressInput.value.trim();
    if (establishedInput) profile.established = establishedInput.value.trim();
    if (logoInput) profile.logoUrl = logoInput.value.trim();
    if (bannerInput) profile.bannerUrl = bannerInput.value.trim();
    if (themeSelect) profile.themeColor = themeSelect.value;

    var rawSlug = slugInput ? slugInput.value : (profile.slug || profile.name);
    var cleanSlug = typeof window.normalizeSlug === 'function' ? window.normalizeSlug(rawSlug) : rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    profile.slug = cleanSlug;

    var activeTenant = localStorage.getItem('activeTenant') || 'default';
    if (typeof window.updateTenantSlug === 'function') {
      window.updateTenantSlug(activeTenant, cleanSlug, profile.name);
    }

    var key = getStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(profile));
      localStorage.setItem('schoolProfile_' + cleanSlug, JSON.stringify(profile));
      localStorage.setItem('eduverse_school_profile', JSON.stringify(profile));
    } catch (e) {}

    // Synchronize branding elements across current UI
    syncGlobalBranding(profile);

    if (typeof window.toast === 'function') {
      window.toast('School profile, branding, and services saved successfully!', 'success');
    }
  }

  /**
   * Synchronize branding elements in UI across the main webpage
   */
  function syncGlobalBranding(profile) {
    if (!profile) profile = getSchoolProfile();
    if (!profile) return;

    var schoolName = profile.name || 'Gracefield International School';
    var schoolMotto = profile.motto || 'Nurturing Global Leaders for Tomorrow';

    // 1. Navigation & Brand Labels
    var nameEls = document.querySelectorAll('#navSchoolName, .school-name-display, #footerSchoolName');
    nameEls.forEach(function(el) { el.textContent = schoolName; });

    var indicatorEl = document.getElementById('navSchoolIndicator');
    if (indicatorEl) indicatorEl.textContent = schoolName;

    var logoEls = document.querySelectorAll('.school-logo-img');
    logoEls.forEach(function(el) { if (profile.logoUrl) el.src = profile.logoUrl; });

    // 2. Document Page Title & Meta
    if (schoolName) {
      document.title = schoolName + ' — ' + schoolMotto;
    }

    // 3. Hero Slide Updates
    var heroTitle0 = document.getElementById('heroTitle0');
    if (heroTitle0) {
      heroTitle0.innerHTML = esc(schoolName) + ' — <span>' + esc(schoolMotto) + '</span>';
    }
    var heroSub0 = document.getElementById('heroSubtitle0');
    if (heroSub0 && profile.about) {
      heroSub0.textContent = profile.about;
    }
    var heroBadge0 = document.getElementById('heroBadge0');
    if (heroBadge0) {
      heroBadge0.innerHTML = '<i class="fas fa-certificate"></i> ' + esc(profile.tier || 'VERIFIED INSTITUTION') + ' · EST. ' + esc(profile.established || '2012');
    }
    var heroSlide0 = document.getElementById('heroSlide0');
    if (heroSlide0 && profile.bannerUrl) {
      heroSlide0.style.backgroundImage = "linear-gradient(135deg, rgba(15,36,64,0.65), rgba(26,58,92,0.55)), url('" + profile.bannerUrl + "')";
    }

    // 4. Dedicated About Our School Showcase Section
    var aboutTitle = document.getElementById('aboutSchoolTitle');
    var aboutMotto = document.getElementById('aboutSchoolMotto');
    var aboutDesc = document.getElementById('aboutSchoolDesc');
    var aboutLoc = document.getElementById('aboutSchoolLocation');
    var aboutPhone = document.getElementById('aboutSchoolPhone');
    var aboutEmail = document.getElementById('aboutSchoolEmail');
    var aboutTier = document.getElementById('aboutSchoolTier');

    if (aboutTitle) aboutTitle.textContent = schoolName;
    if (aboutMotto) aboutMotto.textContent = '"' + schoolMotto + '"';
    if (aboutDesc && profile.about) aboutDesc.textContent = profile.about;
    if (aboutLoc && profile.address) aboutLoc.textContent = profile.address;
    if (aboutPhone && profile.phone) aboutPhone.textContent = profile.phone;
    if (aboutEmail && profile.email) aboutEmail.textContent = profile.email;
    if (aboutTier) aboutTier.textContent = (profile.tier || 'Gold Partner Accredited') + ' (Est. ' + (profile.established || '2012') + ')';

    // Facilities in About Section
    var aboutFacList = document.getElementById('aboutFacilitiesList');
    if (aboutFacList && Array.isArray(profile.facilities) && profile.facilities.length > 0) {
      var facHtml = '';
      profile.facilities.forEach(function(f) {
        facHtml += '<span style="background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;"><i class="fas fa-check-circle" style="color:#0284c7;"></i> ' + esc(f) + '</span>';
      });
      aboutFacList.innerHTML = facHtml;
    }

    // 5. Featured Courses / Popular Subjects Grid on Main Webpage
    var coursesGrid = document.getElementById('coursesGrid');
    if (coursesGrid && Array.isArray(profile.popularSubjects) && profile.popularSubjects.length > 0) {
      var coursesHtml = '';
      profile.popularSubjects.forEach(function(s) {
        var defaultImg = s.image || 'images/courses/mathematics.jpg';
        coursesHtml += '<div class="course-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.2s, box-shadow 0.2s;">'
          + '  <div>'
          + '    <div style="position:relative;height:140px;overflow:hidden;background:#0f172a;">'
          + '      <img src="' + esc(defaultImg) + '" alt="' + esc(s.name) + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src=\'images/courses/science.jpg\';">'
          + '      <span style="position:absolute;top:10px;left:10px;background:rgba(15,23,42,0.85);backdrop-filter:blur(4px);color:#38bdf8;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">' + esc(s.category || 'ACADEMIC PROGRAM') + '</span>'
          + '    </div>'
          + '    <div style="padding:16px;">'
          + '      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'
          + '        <h4 style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">' + esc(s.name) + '</h4>'
          + '        <span style="font-size:12px;font-weight:700;color:#b45309;display:flex;align-items:center;gap:3px;"><i class="fas fa-star" style="color:#f59e0b;"></i> ' + (s.rating || '5.0') + '</span>'
          + '      </div>'
          + '      <p style="font-size:12px;color:#64748b;margin:0 0 10px;line-height:1.5;">' + esc(s.topics) + '</p>'
          + '    </div>'
          + '  </div>'
          + '  <div style="padding:12px 16px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;gap:8px;">'
          + '    <span style="font-size:11px;color:#059669;font-weight:600;display:flex;align-items:center;gap:4px;"><i class="fas fa-certificate"></i> ' + esc(s.sellingPoints) + '</span>'
          + '    <a href="apply.html" class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px;text-decoration:none;"><i class="fas fa-pen"></i> Apply</a>'
          + '  </div>'
          + '</div>';
      });
      coursesGrid.innerHTML = coursesHtml;
    }

    // 6. Campus Facilities Section
    var facilitiesSec = document.getElementById('facilitiesSection');
    var facilitiesGrid = document.getElementById('facilitiesGrid');
    if (facilitiesSec && facilitiesGrid && Array.isArray(profile.facilities) && profile.facilities.length > 0) {
      facilitiesSec.style.display = 'block';
      var mainFacHtml = '';
      profile.facilities.forEach(function(f) {
        mainFacHtml += '<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">'
          + '  <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:16px;">'
          + '    <i class="fas fa-building"></i>'
          + '  </div>'
          + '  <span style="font-size:13px;font-weight:600;color:#1e293b;">' + esc(f) + '</span>'
          + '</div>';
      });
      facilitiesGrid.innerHTML = mainFacHtml;
    }

    // 7. Footer Info
    var footerLoc = document.getElementById('footerSchoolAddress');
    if (footerLoc && profile.address) footerLoc.textContent = profile.address;
    var footerPhone = document.getElementById('footerSchoolPhone');
    if (footerPhone && profile.phone) footerPhone.textContent = profile.phone;
    var footerEmail = document.getElementById('footerSchoolEmail');
    if (footerEmail && profile.email) footerEmail.textContent = profile.email;
  }

  /**
   * Reset Profile to Defaults
   */
  function resetSchoolProfile() {
    if (confirm('Are you sure you want to reset school profile & branding to defaults?')) {
      var key = getStorageKey();
      try {
        localStorage.removeItem(key);
        localStorage.removeItem('eduverse_school_profile');
      } catch(e) {}
      renderSchoolProfile();
      if (typeof window.toast === 'function') {
        window.toast('School profile reset to default configuration.', 'info');
      }
    }
  }

  /**
   * Add a New Facility Tag
   */
  function addFacilityTag() {
    var input = document.getElementById('spNewFacilityInput');
    if (!input || !input.value.trim()) return;

    var facName = input.value.trim();
    var profile = getSchoolProfile();
    if (!Array.isArray(profile.facilities)) profile.facilities = [];

    if (profile.facilities.indexOf(facName) === -1) {
      profile.facilities.push(facName);
      var key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(profile));
      input.value = '';
      renderSchoolProfile();
      if (typeof window.toast === 'function') {
        window.toast('Facility "' + facName + '" added!', 'success');
      }
    }
  }

  /**
   * Remove a Facility Tag
   */
  function removeFacilityTag(index) {
    var profile = getSchoolProfile();
    if (profile.facilities && profile.facilities[index] !== undefined) {
      var removed = profile.facilities.splice(index, 1);
      var key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(profile));
      renderSchoolProfile();
      if (typeof window.toast === 'function') {
        window.toast('Facility removed.', 'info');
      }
    }
  }

  /**
   * Delete a Featured Popular Subject
   */
  function deletePopularSubject(id) {
    var profile = getSchoolProfile();
    if (profile.popularSubjects) {
      profile.popularSubjects = profile.popularSubjects.filter(function(s) { return s.id !== id; });
      var key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(profile));
      renderSchoolProfile();
      if (typeof window.toast === 'function') {
        window.toast('Subject/Service offering removed.', 'info');
      }
    }
  }

  /**
   * Open Modal to Add a New Featured Subject / Service
   */
  function openAddSubjectModal() {
    var modalHtml = '<div style="padding:10px;max-width:550px;">'
      + '<h3 style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:16px;"><i class="fas fa-plus-circle"></i> Add Featured Subject / Academic Service</h3>'
      + '<div style="display:flex;flex-direction:column;gap:12px;">'
      + '  <div>'
      + '    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Subject / Course Title</label>'
      + '    <input type="text" id="newSubjTitle" class="form-control" placeholder="e.g., Robotics & Artificial Intelligence" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '  </div>'
      + '  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
      + '    <div>'
      + '      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Category</label>'
      + '      <input type="text" id="newSubjCategory" class="form-control" placeholder="e.g., Information Technology" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '    </div>'
      + '    <div>'
      + '      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">FontAwesome Icon</label>'
      + '      <select id="newSubjIcon" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '        <option value="fa-laptop-code">fa-laptop-code (Computer/Tech)</option>'
      + '        <option value="fa-atom">fa-atom (Sciences/Physics)</option>'
      + '        <option value="fa-calculator">fa-calculator (Mathematics)</option>'
      + '        <option value="fa-book-open">fa-book-open (Languages/English)</option>'
      + '        <option value="fa-palette">fa-palette (Arts/Creative)</option>'
      + '        <option value="fa-globe">fa-globe (Social Studies/Geography)</option>'
      + '        <option value="fa-futbol">fa-futbol (Sports/PE)</option>'
      + '      </select>'
      + '    </div>'
      + '  </div>'
      + '  <div>'
      + '    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Topics & Curriculum Covered</label>'
      + '    <input type="text" id="newSubjTopics" class="form-control" placeholder="e.g., Machine Learning, Python 3, Neural Networks" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '  </div>'
      + '  <div>'
      + '    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Key Unique Selling Point / Facility</label>'
      + '    <input type="text" id="newSubjSelling" class="form-control" placeholder="e.g., Hands-on AI Lab, 1:1 laptop access, WAEC 100% pass rate" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '  </div>'
      + '  <div style="margin-top:12px;text-align:right;display:flex;gap:8px;justify-content:flex-end;">'
      + '    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
      + '    <button class="btn btn-primary" onclick="window.EduVerseSchoolProfile.saveNewSubject()"><i class="fas fa-check"></i> Add Subject</button>'
      + '  </div>'
      + '</div>'
      + '</div>';

    if (typeof window.openModal === 'function') {
      window.openModal(modalHtml);
    }
  }

  /**
   * Save Newly Created Subject
   */
  function saveNewSubject() {
    var title = document.getElementById('newSubjTitle') ? document.getElementById('newSubjTitle').value.trim() : '';
    var cat = document.getElementById('newSubjCategory') ? document.getElementById('newSubjCategory').value.trim() : 'General Studies';
    var icon = document.getElementById('newSubjIcon') ? document.getElementById('newSubjIcon').value : 'fa-book';
    var topics = document.getElementById('newSubjTopics') ? document.getElementById('newSubjTopics').value.trim() : 'Core Curriculum';
    var selling = document.getElementById('newSubjSelling') ? document.getElementById('newSubjSelling').value.trim() : 'Standard Academic Support';

    if (!title) {
      alert('Please enter a subject title.');
      return;
    }

    var profile = getSchoolProfile();
    if (!profile.popularSubjects) profile.popularSubjects = [];

    profile.popularSubjects.push({
      id: 'subj-' + Date.now(),
      name: title,
      category: cat,
      rating: 5.0,
      teachers: 5,
      icon: icon,
      topics: topics,
      sellingPoints: selling
    });

    var key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(profile));

    if (typeof window.closeModal === 'function') window.closeModal();
    renderSchoolProfile();

    if (typeof window.toast === 'function') {
      window.toast('New featured subject "' + title + '" added!', 'success');
    }
  }

  /**
   * Render Main School Profile Customization Editor in Admin Dashboard
   */
  function renderSchoolProfile() {
    var container = document.getElementById('schoolProfileEditor');
    if (!container) return;

    var profile = getSchoolProfile();
    var subjects = profile.popularSubjects || DEFAULT_POPULAR_SUBJECTS;
    var facilities = profile.facilities || DEFAULT_FACILITIES;

    var html = ''
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">'
      
      // Card 1: School Identity & Branding
      + '  <div class="card" style="padding:20px;">'
      + '    <h3 style="margin-bottom:16px;font-size:16px;color:var(--primary);"><i class="fas fa-university"></i> School Identity & Branding</h3>'
      + '    <div style="display:flex;flex-direction:column;gap:12px;">'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">School Name</label>'
      + '        <input type="text" id="spSchoolName" value="' + esc(profile.name) + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">School Motto / Tagline</label>'
      + '        <input type="text" id="spSchoolMotto" value="' + esc(profile.motto) + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Dedicated School Website Slug URL <span style="color:#2563eb;font-weight:400;">(Synced)</span></label>'
      + '        <div style="display:flex;gap:8px;align-items:center;">'
      + '          <input type="text" id="spSchoolSlug" value="' + esc(profile.slug || (typeof window.normalizeSlug === 'function' ? window.normalizeSlug(profile.name) : 'school-slug')) + '" class="form-control" placeholder="my-school-slug" style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '          <a href="school-portal.html?school=' + encodeURIComponent(profile.slug || (typeof window.normalizeSlug === 'function' ? window.normalizeSlug(profile.name) : 'school-slug')) + '" target="_blank" class="btn btn-sm btn-outline" style="color:#2563eb;border-color:#bfdbfe;background:#eff6ff;" title="Open Dedicated Website">'
      + '            <i class="fas fa-external-link-alt"></i> Preview URL'
      + '          </a>'
      + '        </div>'
      + '        <p style="margin:4px 0 0;font-size:11px;color:#64748b;">'
      + '          Synced Public URL: <code>/school-portal.html?school=' + esc(profile.slug || (typeof window.normalizeSlug === 'function' ? window.normalizeSlug(profile.name) : 'school-slug')) + '</code>'
      + '        </p>'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">About / Mission Overview</label>'
      + '        <textarea id="spSchoolAbout" rows="3" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">' + esc(profile.about) + '</textarea>'
      + '      </div>'
      + '      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
      + '        <div>'
      + '          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Year Established</label>'
      + '          <input type="text" id="spSchoolEstablished" value="' + esc(profile.established || '2012') + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Portal Theme Palette</label>'
      + '          <select id="spSchoolTheme" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '            <option value="#0f2440"' + (profile.themeColor === '#0f2440' ? ' selected' : '') + '>Navy Blue & Gold (Classic)</option>'
      + '            <option value="#065f46"' + (profile.themeColor === '#065f46' ? ' selected' : '') + '>Emerald Green & Gold</option>'
      + '            <option value="#1e40af"' + (profile.themeColor === '#1e40af' ? ' selected' : '') + '>Royal Blue & Silver</option>'
      + '            <option value="#881337"' + (profile.themeColor === '#881337' ? ' selected' : '') + '>Burgundy & Amber</option>'
      + '          </select>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'

      // Card 2: Contact, Logo & Banner Assets
      + '  <div class="card" style="padding:20px;">'
      + '    <h3 style="margin-bottom:16px;font-size:16px;color:var(--accent);"><i class="fas fa-address-card"></i> Contact & Visual Branding Assets</h3>'
      + '    <div style="display:flex;flex-direction:column;gap:12px;">'
      + '      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
      + '        <div>'
      + '          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Phone Number</label>'
      + '          <input type="text" id="spSchoolPhone" value="' + esc(profile.phone) + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '        </div>'
      + '        <div>'
      + '          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Admissions Email</label>'
      + '          <input type="email" id="spSchoolEmail" value="' + esc(profile.email) + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '        </div>'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Campus Address</label>'
      + '        <input type="text" id="spSchoolAddress" value="' + esc(profile.address) + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Logo Asset URL / SVG</label>'
      + '        <div style="display:flex;gap:8px;align-items:center;">'
      + '          <input type="text" id="spSchoolLogo" value="' + esc(profile.logoUrl || 'icons/icon.svg') + '" class="form-control" style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '          <img src="' + esc(profile.logoUrl || 'icons/icon.svg') + '" style="width:36px;height:36px;border-radius:6px;border:1px solid #cbd5e1;padding:2px;background:#fff;" alt="Logo">'
      + '        </div>'
      + '      </div>'
      + '      <div>'
      + '        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Hero Banner Asset URL</label>'
      + '        <input type="text" id="spSchoolBanner" value="' + esc(profile.bannerUrl || 'images/services/library.jpg') + '" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>'

      // Facilities Manager Section
      + '<div class="card" style="padding:20px;margin-bottom:24px;">'
      + '  <h3 style="font-size:16px;margin-bottom:12px;"><i class="fas fa-building" style="color:#2563eb;"></i> Campus Facilities & Infrastructure Badges</h3>'
      + '  <div style="display:flex;gap:8px;margin-bottom:12px;max-width:500px;">'
      + '    <input type="text" id="spNewFacilityInput" class="form-control" placeholder="Add facility (e.g. Swimming Pool, Solar Power Suite)" style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '    <button class="btn btn-primary btn-sm" onclick="window.EduVerseSchoolProfile.addFacilityTag()"><i class="fas fa-plus"></i> Add Facility</button>'
      + '  </div>'
      + '  <div style="display:flex;flex-wrap:wrap;gap:8px;">';

    facilities.forEach(function(f, idx) {
      html += '<span class="badge" style="background:#e0f2fe;color:#0369a1;padding:6px 12px;font-size:12px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;">'
        + '<i class="fas fa-check-circle"></i> ' + esc(f)
        + ' <i class="fas fa-times" style="cursor:pointer;margin-left:4px;color:#ef4444;" onclick="window.EduVerseSchoolProfile.removeFacilityTag(' + idx + ')"></i>'
        + '</span>';
    });

    html += '  </div></div>'

      // Featured Popular Subjects Showcase Editor Section
      + '<div class="card" style="padding:20px;margin-bottom:24px;">'
      + '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;">'
      + '    <div>'
      + '      <h3 style="margin:0;font-size:16px;"><i class="fas fa-star" style="color:#f59e0b;"></i> Featured Popular Subjects & Academic Service Offerings</h3>'
      + '      <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Highlight key academic strengths and facility selling points on your public school profile</p>'
      + '    </div>'
      + '    <div style="display:flex;gap:8px;">'
      + '      <button class="btn btn-primary btn-sm" style="background:#2563eb;" onclick="window.EduVerseSchoolProfile.openAddSubjectModal()"><i class="fas fa-plus"></i> Add Featured Subject</button>'
      + '      <button class="btn btn-outline btn-sm" onclick="window.EduVerseSchoolProfile.showTenantSchoolProfile()"><i class="fas fa-eye"></i> Preview Public Profile</button>'
      + '    </div>'
      + '  </div>'

      + '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">';

    subjects.forEach(function(s) {
      html += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;position:relative;">'
        + '<button style="position:absolute;top:10px;right:10px;background:none;border:none;color:#ef4444;cursor:pointer;" title="Delete Subject" onclick="window.EduVerseSchoolProfile.deletePopularSubject(\'' + s.id + '\')"><i class="fas fa-trash-alt"></i></button>'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">'
        + '  <div style="width:36px;height:36px;border-radius:8px;background:#ebf8ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:16px;">'
        + '    <i class="fas ' + esc(s.icon || 'fa-book') + '"></i>'
        + '  </div>'
        + '  <div>'
        + '    <h5 style="margin:0;font-size:14px;font-weight:700;">' + esc(s.name) + '</h5>'
        + '    <span style="font-size:11px;color:#64748b;">' + esc(s.category) + '</span>'
        + '  </div>'
        + '</div>'
        + '<p style="font-size:12px;color:#475569;margin:6px 0;"><strong>Topics:</strong> ' + esc(s.topics) + '</p>'
        + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:6px 10px;font-size:11px;color:#166534;margin-top:6px;">'
        + '  <i class="fas fa-check-circle"></i> <strong>Selling Point:</strong> ' + esc(s.sellingPoints)
        + '</div>'
        + '</div>';
    });

    html += '  </div></div>';

    container.innerHTML = html;
  }

  /**
   * Public Tenant School Profile Showcase Modal
   */
  function showTenantSchoolProfile(tenantId) {
    var tenants = typeof window.getTenants === 'function' ? window.getTenants() : [];
    var matchedTenant = null;

    if (tenantId) {
      matchedTenant = tenants.find(function(t) { return t.id === tenantId || t.slug === tenantId; });
    }

    var profile = getSchoolProfile();
    var name = matchedTenant ? (matchedTenant.name || profile.name) : profile.name;
    var motto = profile.motto || 'Excellence in Knowledge, Character & Innovation';
    var subjects = profile.popularSubjects || DEFAULT_POPULAR_SUBJECTS;
    var facilities = profile.facilities || DEFAULT_FACILITIES;

    var overlay = document.getElementById('modalOverlay');
    var body = document.getElementById('modalBody');
    if (!body) return;

    var modalContent = '<div style="max-width:800px;margin:0 auto;text-align:left;">'
      // Header Banner
      + '<div style="background:linear-gradient(135deg, ' + (profile.themeColor || '#0f2440') + ' 0%, #030712 100%);color:#ffffff;border-radius:12px 12px 0 0;padding:24px;position:relative;overflow:hidden;margin:-20px -20px 20px -20px;">'
      + '  <div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1;flex-wrap:wrap;">'
      + '    <div style="width:64px;height:64px;border-radius:12px;background:#ffffff;padding:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.2);">'
      + '      <img src="' + esc(profile.logoUrl || 'icons/icon.svg') + '" style="width:48px;height:48px;" alt="' + esc(name) + '">'
      + '    </div>'
      + '    <div>'
      + '      <span style="display:inline-block;background:rgba(255,255,255,0.15);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:4px;letter-spacing:0.5px;">VERIFIED EDUVERSE TENANT INSTITUTION</span>'
      + '      <h2 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">' + esc(name) + '</h2>'
      + '      <p style="margin:4px 0 0;font-size:13px;opacity:0.9;font-style:italic;">"' + esc(motto) + '"</p>'
      + '    </div>'
      + '  </div>'
      + '</div>'

      // School Overview & Contact
      + '<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;">'
      + '  <div>'
      + '    <h4 style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1e293b;"><i class="fas fa-info-circle" style="color:#2563eb;"></i> About Our School</h4>'
      + '    <p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">' + esc(profile.about) + '</p>'
      + '  </div>'
      + '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;font-size:12px;">'
      + '    <div style="font-weight:700;margin-bottom:6px;color:#0f2440;"><i class="fas fa-map-marker-alt" style="color:#ef4444;"></i> Campus Location</div>'
      + '    <p style="margin:0 0 8px;color:#64748b;">' + esc(profile.address) + '</p>'
      + '    <div style="font-weight:700;margin-bottom:2px;color:#0f2440;"><i class="fas fa-phone" style="color:#10b981;"></i> Admissions Line</div>'
      + '    <p style="margin:0;color:#64748b;">' + esc(profile.phone) + '</p>'
      + '  </div>'
      + '</div>'

      // Facilities Badges
      + '<div style="margin-bottom:20px;">'
      + '  <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e293b;"><i class="fas fa-building" style="color:#0284c7;"></i> Campus Facilities</h4>'
      + '  <div style="display:flex;flex-wrap:wrap;gap:8px;">';

    facilities.forEach(function(f) {
      modalContent += '<span class="badge" style="background:#e0f2fe;color:#0369a1;padding:4px 10px;font-size:11px;border-radius:16px;">'
        + '<i class="fas fa-check-circle"></i> ' + esc(f)
        + '</span>';
    });

    modalContent += '  </div></div>'

      // Featured Popular Subjects & Services Section
      + '<div style="margin-bottom:24px;">'
      + '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">'
      + '    <h4 style="margin:0;font-size:15px;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:8px;">'
      + '      <i class="fas fa-star" style="color:#f59e0b;"></i> Featured Academic Programs & Selling Points'
      + '    </h4>'
      + '  </div>'

      + '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:14px;">';

    subjects.forEach(function(s) {
      modalContent += '<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;box-shadow:0 2px 4px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;">'
        + '  <div>'
        + '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
        + '      <span style="font-size:11px;font-weight:700;color:#2563eb;background:#eff6ff;padding:3px 8px;border-radius:12px;">' + esc(s.category) + '</span>'
        + '      <span style="font-size:12px;font-weight:600;color:#b45309;display:flex;align-items:center;gap:4px;">'
        + '        <i class="fas fa-star" style="color:#f59e0b;"></i> ' + s.rating
        + '      </span>'
        + '    </div>'
        + '    <h5 style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0f172a;">' + esc(s.name) + '</h5>'
        + '    <p style="font-size:12px;color:#475569;margin:0 0 8px;line-height:1.4;">' + esc(s.topics) + '</p>'
        + '  </div>'
        + '  <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:8px;border-radius:6px;margin-top:8px;">'
        + '    <div style="font-size:11px;color:#059669;font-weight:600;display:flex;align-items:center;gap:6px;">'
        + '      <i class="fas fa-certificate"></i> ' + esc(s.sellingPoints)
        + '    </div>'
        + '  </div>'
        + '</div>';
    });

    modalContent += '  </div></div>'

      // Contact & Apply Actions
      + '<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
      + '  <div>'
      + '    <h5 style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">Interested in Enrolling at ' + esc(name) + '?</h5>'
      + '    <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Contact admissions or submit an online application today.</p>'
      + '  </div>'
      + '  <div style="display:flex;gap:8px;">'
      + '    <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>'
      + '    <a href="apply.html" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;">'
      + '      <i class="fas fa-paper-plane"></i> Apply for Admission'
      + '    </a>'
      + '  </div>'
      + '</div>'
      + '</div>';

    body.innerHTML = modalContent;
    if (overlay) overlay.classList.add('active');
  }

  // Export functions globally
  window.EduVerseSchoolProfile = {
    getSchoolProfile: getSchoolProfile,
    renderSchoolProfile: renderSchoolProfile,
    saveSchoolProfile: saveSchoolProfile,
    resetSchoolProfile: resetSchoolProfile,
    addFacilityTag: addFacilityTag,
    removeFacilityTag: removeFacilityTag,
    openAddSubjectModal: openAddSubjectModal,
    saveNewSubject: saveNewSubject,
    deletePopularSubject: deletePopularSubject,
    showTenantSchoolProfile: showTenantSchoolProfile
  };

  window.renderSchoolProfile = renderSchoolProfile;
  window.saveSchoolProfile = saveSchoolProfile;
  window.resetSchoolProfile = resetSchoolProfile;
  window.showTenantSchoolProfile = showTenantSchoolProfile;

  // On page load, auto-sync branding
  document.addEventListener('DOMContentLoaded', function() {
    syncGlobalBranding();
  });

})();
