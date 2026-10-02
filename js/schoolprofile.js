/**
 * EduVerse - School Profile & Tenant Services Showcase Module
 * Manages school portal customization, popular subjects showcase,
 * and tenant school profile displays.
 */

(function () {
  'use strict';

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

  /**
   * Helper: Get current school profile
   */
  function getSchoolProfile() {
    try {
      if (window.data && window.data.schoolProfile) {
        return window.data.schoolProfile;
      }
      var stored = localStorage.getItem('eduverse_school_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    return {
      name: 'EduVerse International Academy',
      motto: 'Excellence in Knowledge, Character & Innovation',
      about: 'EduVerse Academy is a premier K-12 institution committed to nurturing academic leaders through modern digital curriculum, world-class science labs, and holistic character building.',
      established: '2012',
      tier: 'Gold Partner',
      address: '12 Innovation Boulevard, Victoria Island, Lagos',
      phone: '+234 800 338 8377',
      email: 'admissions@eduverse.academy',
      logoUrl: 'icons/icon.svg',
      bannerUrl: 'images/services/library.jpg',
      popularSubjects: DEFAULT_POPULAR_SUBJECTS,
      facilities: ['Smart Digital Classrooms', 'Robotics & STEM Lab', 'Olympic-Size Sports Complex', 'Standard E-Library', 'Boarding Hostel']
    };
  }

  /**
   * Save school profile
   */
  function saveSchoolProfile() {
    var profile = getSchoolProfile();

    var nameInput = document.getElementById('spSchoolName');
    var mottoInput = document.getElementById('spSchoolMotto');
    var aboutInput = document.getElementById('spSchoolAbout');
    var phoneInput = document.getElementById('spSchoolPhone');
    var emailInput = document.getElementById('spSchoolEmail');
    var addressInput = document.getElementById('spSchoolAddress');

    if (nameInput) profile.name = nameInput.value.trim();
    if (mottoInput) profile.motto = mottoInput.value.trim();
    if (aboutInput) profile.about = aboutInput.value.trim();
    if (phoneInput) profile.phone = phoneInput.value.trim();
    if (emailInput) profile.email = emailInput.value.trim();
    if (addressInput) profile.address = addressInput.value.trim();

    if (!window.data) window.data = {};
    window.data.schoolProfile = profile;
    try {
      localStorage.setItem('eduverse_school_profile', JSON.stringify(profile));
    } catch (e) {}

    if (typeof window.toast === 'function') {
      window.toast('School profile & popular subjects saved successfully!', 'success');
    }
  }

  /**
   * Reset school profile to default
   */
  function resetSchoolProfile() {
    if (confirm('Reset school profile to defaults?')) {
      localStorage.removeItem('eduverse_school_profile');
      renderSchoolProfile();
      if (typeof window.toast === 'function') {
        window.toast('Profile reset to defaults', 'info');
      }
    }
  }

  /**
   * Render School Profile Admin Editor
   */
  function renderSchoolProfile() {
    var container = document.getElementById('schoolProfileEditor');
    if (!container) return;

    var profile = getSchoolProfile();
    var subjects = profile.popularSubjects || DEFAULT_POPULAR_SUBJECTS;

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="card">
          <h3 style="margin-bottom:16px;font-size:16px;"><i class="fas fa-university" style="color:var(--primary);"></i> School Identity & Branding</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">School Name</label>
              <input type="text" id="spSchoolName" value="${htmlEscape(profile.name || '')}" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Motto / Tagline</label>
              <input type="text" id="spSchoolMotto" value="${htmlEscape(profile.motto || '')}" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">About / Mission Statement</label>
              <textarea id="spSchoolAbout" rows="3" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">${htmlEscape(profile.about || '')}</textarea>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px;font-size:16px;"><i class="fas fa-address-card" style="color:var(--accent);"></i> Contact & Admissions Info</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Phone Line</label>
              <input type="text" id="spSchoolPhone" value="${htmlEscape(profile.phone || '')}" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Admissions Email</label>
              <input type="email" id="spSchoolEmail" value="${htmlEscape(profile.email || '')}" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Campus Address</label>
              <input type="text" id="spSchoolAddress" value="${htmlEscape(profile.address || '')}" class="form-control" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Subjects Showcase Editor -->
      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="margin:0;font-size:16px;"><i class="fas fa-star" style="color:#f59e0b;"></i> Popular Subjects & Service Selling Points</h3>
            <p style="margin:2px 0 0;font-size:12px;color:var(--text-light,#64748b);">Featured subjects displayed on your school profile page to attract parents and students</p>
          </div>
          <button class="btn btn-sm btn-outline" onclick="window.EduVerseSchoolProfile.showTenantSchoolProfile()"><i class="fas fa-eye"></i> Preview School Profile</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">
          ${subjects.map(function(s, idx) {
            return `
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;position:relative;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                  <div style="width:36px;height:36px;border-radius:8px;background:#ebf8ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:16px;">
                    <i class="fas ${htmlEscape(s.icon || 'fa-book')}"></i>
                  </div>
                  <div>
                    <h5 style="margin:0;font-size:14px;font-weight:700;">${htmlEscape(s.name)}</h5>
                    <span style="font-size:11px;color:#64748b;">${htmlEscape(s.category)}</span>
                  </div>
                </div>
                <p style="font-size:12px;color:#475569;margin:6px 0;"><strong>Topics:</strong> ${htmlEscape(s.topics)}</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:6px 10px;font-size:11px;color:#166534;margin-top:6px;">
                  <i class="fas fa-check-circle"></i> <strong>Selling Point:</strong> ${htmlEscape(s.sellingPoints)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
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

    var overlay = document.getElementById('modalOverlay');
    var body = document.getElementById('modalBody');
    if (!body) return;

    body.innerHTML = `
      <div style="max-width:800px;margin:0 auto;">
        {/* Header Banner */}
        <div style="background:linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%);color:#ffffff;border-radius:12px 12px 0 0;padding:24px;position:relative;overflow:hidden;margin:-20px -20px 20px -20px;">
          <div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1;flex-wrap:wrap;">
            <div style="width:64px;height:64px;border-radius:12px;background:#ffffff;padding:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.2);">
              <img src="icons/icon.svg" style="width:48px;height:48px;" alt="${htmlEscape(name)}">
            </div>
            <div>
              <span style="display:inline-block;background:rgba(255,255,255,0.15);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:4px;letter-spacing:0.5px;">VERIFIED TENANT INSTITUTION</span>
              <h2 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${htmlEscape(name)}</h2>
              <p style="margin:4px 0 0;font-size:13px;opacity:0.9;font-style:italic;">"${htmlEscape(motto)}"</p>
            </div>
          </div>
        </div>

        {/* School Overview */}
        <div style="margin-bottom:20px;">
          <h4 style="margin:0 0 8px;font-size:15px;fontWeight:700;color:#1e293b;"><i class="fas fa-info-circle" style="color:#2563eb;"></i> About Our School</h4>
          <p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">${htmlEscape(profile.about)}</p>
        </div>

        {/* Popular Subjects Showcase Section */}
        <div style="margin-bottom:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <h4 style="margin:0;font-size:15px;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:8px;">
              <i class="fas fa-star" style="color:#f59e0b;"></i> Featured Popular Subjects & Services
            </h4>
            <span style="font-size:12px;color:#64748b;font-weight:500;">Core Academic Offerings</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:14px;">
            ${subjects.map(function(s) {
              return `
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;box-shadow:0 2px 4px rgba(0,0,0,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                  <div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                      <span style="font-size:11px;font-weight:700;color:#2563eb;background:#eff6ff;padding:3px 8px;border-radius:12px;">${htmlEscape(s.category)}</span>
                      <span style="font-size:12px;font-weight:600;color:#b45309;display:flex;align-items:center;gap:4px;">
                        <i class="fas fa-star" style="color:#f59e0b;"></i> ${s.rating}
                      </span>
                    </div>

                    <h5 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#0f172a;">${htmlEscape(s.name)}</h5>
                    <p style="font-size:12px;color:#475569;margin:0 0 8px;line-height:1.4;">${htmlEscape(s.topics)}</p>
                  </div>

                  <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:8px;border-radius:6px;margin-top:8px;">
                    <div style="font-size:11px;color:#059669;font-weight:600;display:flex;align-items:center;gap:6px;">
                      <i class="fas fa-certificate"></i> ${htmlEscape(s.sellingPoints)}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        {/* Contact & Apply Actions */}
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h5 style="margin:0;font-size:14px;font-weight:700;color:#1e293b;">Interested in Enrolling at ${htmlEscape(name)}?</h5>
            <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Contact admissions or submit an online application today.</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
            <a href="apply.html" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;">
              <i class="fas fa-paper-plane"></i> Apply for Admission
            </a>
          </div>
        </div>
      </div>
    `;

    if (overlay) overlay.classList.add('active');
  }

  // Export functions globally
  window.EduVerseSchoolProfile = {
    getSchoolProfile: getSchoolProfile,
    renderSchoolProfile: renderSchoolProfile,
    saveSchoolProfile: saveSchoolProfile,
    resetSchoolProfile: resetSchoolProfile,
    showTenantSchoolProfile: showTenantSchoolProfile
  };

  window.renderSchoolProfile = renderSchoolProfile;
  window.saveSchoolProfile = saveSchoolProfile;
  window.resetSchoolProfile = resetSchoolProfile;
  window.showTenantSchoolProfile = showTenantSchoolProfile;

})();
