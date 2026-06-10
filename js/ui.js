// EDUVERSE - UI Layer
// Toast notifications, modal dialogs, navigation, sidebar controls

function toast(msg, type) {
  if (!type) type = 'success';
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  t.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + htmlEscape(msg);
  c.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; t.style.transition = 'all 0.3s'; setTimeout(function() { if (t.parentNode) t.remove(); }, 300); }, 3000);
}

function openModal(html) {
  const body = document.getElementById('modalBody');
  const overlay = document.getElementById('modalOverlay');
  if (body) body.innerHTML = html;
  if (overlay) overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== NAVIGATION =====
function toggleNav() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

function goHome() {
  currentAdmin = null;
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const lp = document.getElementById('landing-page');
  if (lp) { lp.classList.remove('hidden'); lp.style.display = 'block'; }
  if (typeof updateLandingStats === 'function') updateLandingStats();
  if (typeof cleanupExam === 'function') cleanupExam();
  if (typeof cleanupSim === 'function') cleanupSim();
}

function showSchoolSelector() {
  const tenants = typeof getTenants === 'function' ? getTenants() : [];
  const activeTenant = (function() { try { return localStorage.getItem('activeTenant'); } catch(e) { return null; } })();
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  if (!body) return;
  body.innerHTML = `
    <h3><i class="fas fa-school"></i> Select School</h3>
    <p style="color:var(--text-light);font-size:13px;margin-bottom:16px;">Choose a school to access its portal.</p>
    <div class="school-selector-grid">
      ${tenants.map(t => `
        <div class="school-card" onclick="switchTenant('${t.id}')" style="${activeTenant === t.id ? 'border-color:var(--primary);background:#ebf8ff;' : ''}">
          ${t.logo ? `<img src="${htmlEscape(t.logo)}" class="school-logo" onerror="this.style.display='none'">` : '<div style="width:64px;height:64px;border-radius:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">' + (t.name ? t.name.charAt(0) : 'S') + '</div>'}
          <div class="school-name">${htmlEscape(t.name || 'Unknown School')}</div>
          <div class="school-tier">${htmlEscape(t.tier || 'N/A')} &middot; ${htmlEscape(t.status || 'active')}</div>
          ${activeTenant === t.id ? '<div style="margin-top:8px;"><span class="badge badge-paid">Active</span></div>' : ''}
        </div>
      `).join('')}
      ${tenants.length ? '' : '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-school"></i><p>No schools registered. Contact the Super Admin.</p></div>'}
    </div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
      ${activeTenant ? '<button class="btn btn-outline" onclick="if(confirm(\'Switch back to local mode?\')){if(window.__saveCurrentData)window.__saveCurrentData();localStorage.removeItem(\'activeTenant\');localStorage.removeItem(\'activeTenantKey\');window.location.reload();}" style="color:#e53e3e;"><i class="fas fa-times"></i> Leave School</button>' : ''}
    </div>
  `;
  if (overlay) overlay.classList.add('active');
}

let currentAdmin = null;

function showAdminLogin() {
  if (currentAdmin) { showAdminPortal(); return; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminLoginPage');
  if (page) page.classList.add('active');
}

function showAdminSignup() {
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminSignupPage');
  if (page) page.classList.add('active');
}

function adminLogin() {
  const emailEl = document.getElementById('adminLoginEmail');
  const passEl = document.getElementById('adminLoginPass');
  const errEl = document.getElementById('adminLoginError');
  if (!emailEl || !passEl) { if (errEl) { errEl.textContent = 'Login form unavailable'; errEl.style.display = 'block'; } return; }
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  const admin = (data.admins || []).find(function(a) { return a.email === email && a.password === pass; });
  if (!admin) {
    if (errEl) { errEl.textContent = 'Invalid email or password'; errEl.style.display = 'block'; }
    return;
  }
  currentAdmin = admin;
  emailEl.value = '';
  passEl.value = '';
  if (errEl) errEl.style.display = 'none';
  showAdminPortal();
  updateNotifBadge();
}

function adminSignup() {
  const nameEl = document.getElementById('adminSignupName');
  const emailEl = document.getElementById('adminSignupEmail');
  const passEl = document.getElementById('adminSignupPass');
  const errEl = document.getElementById('adminSignupError');
  if (!nameEl || !emailEl || !passEl) { if (errEl) { errEl.textContent = 'Signup form unavailable'; errEl.style.display = 'block'; } return; }
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value.trim();
  if (!name || !email || !pass) {
    if (errEl) { errEl.textContent = 'Please fill all fields'; errEl.style.display = 'block'; }
    return;
  }
  if (pass.length < 6) {
    if (errEl) { errEl.textContent = 'Password must be at least 6 characters'; errEl.style.display = 'block'; }
    return;
  }
  if ((data.admins || []).find(function(a) { return a.email === email; })) {
    if (errEl) { errEl.textContent = 'An admin with this email already exists'; errEl.style.display = 'block'; }
    return;
  }
  if (!data.admins) data.admins = [];
  const admin = { id: 'ADM' + Date.now(), name: name, email: email, password: pass };
  data.admins.push(admin);
  saveData();
  if (errEl) errEl.style.display = 'none';
  nameEl.value = '';
  emailEl.value = '';
  passEl.value = '';
  currentAdmin = admin;
  showAdminPortal();
}

function adminLogout() {
  currentAdmin = null;
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById('adminLoginPage');
  if (page) page.classList.add('active');
}

function showAdminPortal() {
  var lp = document.getElementById('landing-page');
  if (!currentAdmin) {
    if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
    document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
    var alp = document.getElementById('adminLoginPage');
    if (alp) alp.classList.add('active');
    return;
  }
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('adminPage');
  if (ap) ap.classList.add('active');

  // Update admin dashboard logo with school logo (or hide it)
  var adminDashLogo = document.querySelector('#adminPage .portal-header-left img.school-logo-img');
  if (adminDashLogo) {
    var logoUrl = '';
    try { if (data.schoolProfile && data.schoolProfile.logoUrl) logoUrl = data.schoolProfile.logoUrl; } catch(e) {}
    if (logoUrl) {
      adminDashLogo.src = logoUrl;
      adminDashLogo.style.display = '';
    } else {
      adminDashLogo.style.display = 'none';
    }
  }

  if (typeof switchAdminPanel === 'function') switchAdminPanel('dashboard');
  if (typeof renderAll === 'function') renderAll();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function showStudentLogin() {
  var lp = document.getElementById('landing-page');
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var slp = document.getElementById('studentLoginPage');
  if (slp) slp.classList.add('active');
  if (typeof populateStudentDatalists === 'function') populateStudentDatalists();
}

function studentLogin() {
  var idEl = document.getElementById('loginId');
  var nameEl = document.getElementById('loginName');
  if (!idEl || !nameEl) { toast('Login form unavailable', 'error'); return; }
  var idOrUser = idEl.value.trim();
  var nameOrPass = nameEl.value.trim();
  var student = (data.students || []).find(function(s) { return s.username === idOrUser && s.password === nameOrPass; });
  if (!student) student = (data.students || []).find(function(s) { return s.id === idOrUser && s.name.toLowerCase() === nameOrPass.toLowerCase(); });
  if (!student) {
    toast('Invalid credentials. Try ID + Name or Username + Password.', 'error');
    return;
  }
  currentStudent = student;
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var sp = document.getElementById('studentPage');
  if (sp) sp.classList.add('active');
  if (typeof renderStudentPortal === 'function') renderStudentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function studentLogout() {
  currentStudent = null;
  var idEl = document.getElementById('loginId');
  var nameEl = document.getElementById('loginName');
  if (idEl) idEl.value = '';
  if (nameEl) nameEl.value = '';
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var slp = document.getElementById('studentLoginPage');
  if (slp) slp.classList.add('active');
}

let currentStudent = null;
let currentTeacher = null;

function showTeacherLogin() {
  var lp = document.getElementById('landing-page');
  if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tlp = document.getElementById('teacherLoginPage');
  if (tlp) tlp.classList.add('active');
  if (typeof populateTeacherDatalists === 'function') populateTeacherDatalists();
}

function populateTeacherDatalists() {
  var idList = document.getElementById('teacherIdList');
  if (idList) idList.innerHTML = (data.teachers || []).map(function(t) { return '<option value="' + t.id + '">'; }).join('');
}

function teacherLogin() {
  var idEl = document.getElementById('teacherLoginId');
  var passEl = document.getElementById('teacherLoginPass');
  if (!idEl || !passEl) { toast('Login form unavailable', 'error'); return; }
  var idOrUser = idEl.value.trim();
  var pass = passEl.value.trim();
  var teacher = (data.teachers || []).find(function(t) { return t.id === idOrUser && t.password === pass; });
  if (!teacher) teacher = (data.teachers || []).find(function(t) { return t.username === idOrUser && t.password === pass; });
  if (!teacher) {
    toast('Invalid ID or password. Please try again.', 'error');
    return;
  }
  currentTeacher = teacher;
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tp = document.getElementById('teacherPage');
  if (tp) tp.classList.add('active');
  if (typeof renderTeacherPortal === 'function') renderTeacherPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function teacherLogout() {
  currentTeacher = null;
  var idEl = document.getElementById('teacherLoginId');
  var passEl = document.getElementById('teacherLoginPass');
  if (idEl) idEl.value = '';
  if (passEl) passEl.value = '';
  document.querySelectorAll('.portal-page').forEach(function(p) { p.classList.remove('active'); });
  var tlp = document.getElementById('teacherLoginPage');
  if (tlp) tlp.classList.add('active');
}

function populateStudentDatalists() {
  var idList = document.getElementById('studentIdList');
  var nameList = document.getElementById('studentNameList');
  if (idList) idList.innerHTML = (data.students || []).map(function(s) { return '<option value="' + s.id + '">'; }).join('');
  if (nameList) nameList.innerHTML = (data.students || []).map(function(s) { return '<option value="' + s.name + '">'; }).join('');
}

// ===== TEACHER SIDEBAR =====
document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    switchTeacherPanel(this.dataset.teacherPanel);
  });
});

function switchTeacherPanel(panel) {
  document.querySelectorAll('#teacherPage .admin-panel').forEach(function(p) { p.classList.remove('active'); });
  var tp = document.getElementById('teacher-' + panel);
  if (tp) tp.classList.add('active');
  document.querySelectorAll('#teacherPage .admin-sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  var sp = document.querySelector('#teacherPage .admin-sidebar-item[data-teacher-panel="' + panel + '"]');
  if (sp) sp.classList.add('active');
  switch(panel) {
    case 'dashboard': renderTeacherDashboard(); break;
    case 'assignments': renderTeacherAssignments(); break;
    case 'roster': renderTeacherRoster(); break;
    case 'timetable': renderTimetableTeacher(); break;
    case 'exams': renderExamsTeacher(); break;
    case 'messages': renderMessages('tchMessages', currentTeacher ? currentTeacher.id : ''); break;
    case 'lessonnotes': renderLessonNotes('tchLessonNotes', currentTeacher ? currentTeacher.id : ''); break;
    case 'behavior': renderBehaviorLog('tchBehaviorLog', currentTeacher ? currentTeacher.id : ''); break;
    case 'forum': renderForum('tchForum'); break;
    case 'filerepo': renderFileRepo('tchFileRepo', currentTeacher ? currentTeacher.assignedClass : ''); break;
    case 'gallery': if (typeof renderGalleryView === 'function') renderGalleryView('tchGalleryView'); break;
    case 'aitools': if (typeof renderAITools === 'function') renderAITools(); break;
    case 'eschool': if (typeof renderESchoolView === 'function') renderESchoolView('tchESchoolView'); break;
    case 'calendar': if (typeof renderAcademicCalendarView === 'function') renderAcademicCalendarView('tchCalendarView'); break;
  }
  if (typeof applyTranslations === 'function') applyTranslations();
}

function switchAdminPanel(panel) {
  document.querySelectorAll('.admin-panel').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('admin-' + panel);
  if (ap) ap.classList.add('active');
  switch(panel) {
    case 'dashboard': if (typeof renderDashboard === 'function') renderDashboard(); break;
    case 'students': if (typeof renderStudents === 'function') renderStudents(); break;
    case 'teachers': if (typeof renderTeachers === 'function') renderTeachers(); break;
    case 'fees': if (typeof renderFees === 'function') renderFees(); break;
    case 'results': if (typeof renderResults === 'function') renderResults(); break;
    case 'cat': if (typeof renderCAT === 'function') renderCAT(); break;
    case 'activities': if (typeof renderActivities === 'function') renderActivities(); break;
    case 'attendance': if (typeof renderAttendance === 'function') renderAttendance(); break;
    case 'timetable': if (typeof switchTimetableTab === 'function') switchTimetableTab('grid'); break;
    case 'hostel': if (typeof renderHostel === 'function') renderHostel(); break;
    case 'gradebook': if (typeof renderGradebookAdmin === 'function') renderGradebookAdmin(); break;
    case 'promotion': if (typeof renderPromotionList === 'function') renderPromotionList(); break;
    case 'exams': if (typeof renderExamsAdmin === 'function') renderExamsAdmin(); break;
    case 'messages': if (typeof renderMessages === 'function') renderMessages('adminMessages', 'Admin'); break;
    case 'library': if (typeof renderLibrary === 'function') renderLibrary(); break;
    case 'lessonnotes': if (typeof renderLessonNotes === 'function') renderLessonNotes('adminLessonNotes'); break;
    case 'behavior': if (typeof renderBehaviorLog === 'function') renderBehaviorLog('adminBehaviorLog'); break;
    case 'hr': if (typeof renderStaffHR === 'function') renderStaffHR(); break;
    case 'forum': if (typeof renderForum === 'function') renderForum('adminForum'); break;
    case 'filerepo': if (typeof renderFileRepo === 'function') renderFileRepo('adminFileRepo'); break;
    case 'payments': if (typeof renderPayments === 'function') renderPayments(); break;
    case 'analytics': if (typeof renderAnalytics === 'function') renderAnalytics(); break;
    case 'reportbuilder': if (typeof renderReportBuilder === 'function') renderReportBuilder(); break;
    case 'predictive': if (typeof renderPredictiveAnalytics === 'function') renderPredictiveAnalytics(); break;
    case 'aitools': if (typeof renderAITools === 'function') renderAITools(); break;
    case 'eschool': if (typeof renderESchoolAdmin === 'function') renderESchoolAdmin(); break;
    case 'academiccalendar': if (typeof renderAcademicCalendar === 'function') renderAcademicCalendar(); break;
    case 'idcards': if (typeof renderIDCards === 'function') renderIDCards('adminIDCards'); break;
    case 'terms': if (typeof renderTerms === 'function') renderTerms(); break;
    case 'programs': if (typeof renderPrograms === 'function') renderPrograms(); break;
    case 'applications': if (typeof renderApplications === 'function') renderApplications(); break;
    case 'exambank': if (typeof renderExamBank === 'function') renderExamBank(); break;
    case 'examresults': if (typeof renderExamResults === 'function') renderExamResults(); break;
    case 'schoolsetup': if (typeof renderSchoolSetup === 'function') renderSchoolSetup(); break;
    case 'subjects': if (typeof renderSubjectManagement === 'function') renderSubjectManagement(); break;
    case 'streams': if (typeof renderStreamManagement === 'function') renderStreamManagement(); break;
    case 'exammodules': if (typeof renderExamModules === 'function') renderExamModules(); break;
    case 'utmemock': if (typeof renderUTMEMock === 'function') renderUTMEMock(); break;
    case 'gallery': if (typeof renderGalleryAdmin === 'function') renderGalleryAdmin(); break;
    case 'transcript': if (typeof renderTranscriptGenerator === 'function') renderTranscriptGenerator(); break;
    case 'reportcards': if (typeof renderReportCardsAdmin === 'function') renderReportCardsAdmin(); break;
    case 'schoolprofile': if (typeof renderSchoolProfile === 'function') renderSchoolProfile(); break;
    case 'paymentgateway': if (typeof renderPaymentGatewaySettings === 'function') renderPaymentGatewaySettings(); if (typeof renderPaymentTransactionLog === 'function') renderPaymentTransactionLog(); break;
    case 'notifications': if (typeof renderNotificationComposer === 'function') renderNotificationComposer(); break;
    case 'simquestions': if (typeof renderSimQuestionBank === 'function') renderSimQuestionBank(); break;
    case 'simattempts': if (typeof renderSimAttempts === 'function') renderSimAttempts(); break;
    case 'activitygames': if (typeof renderAdminActivityGames === 'function') renderAdminActivityGames(); break;
    case 'alumni': if (typeof renderAlumni === 'function') renderAlumni(); break;
    case 'system': if (typeof renderSystemPanel === 'function') renderSystemPanel(); break;
  }
  if (typeof applyTranslations === 'function') applyTranslations();
}

// ===== RENDER ALL =====
function renderAll() {
  renderDashboard();
  renderStudents();
  renderTeachers();
  renderFees();
  renderResults();
  renderCAT();
  renderActivities();
  renderAttendance();
  if (typeof renderTimetableAdmin === 'function') renderTimetableAdmin();
  if (typeof renderHostel === 'function') renderHostel();
  if (typeof renderGradebookAdmin === 'function') renderGradebookAdmin();
  if (typeof renderExamsAdmin === 'function') renderExamsAdmin();
  if (typeof renderMessages === 'function') renderMessages('adminMessages', 'Admin');
  if (typeof renderLibrary === 'function') renderLibrary();
  if (typeof renderLessonNotes === 'function') renderLessonNotes('adminLessonNotes');
  if (typeof renderBehaviorLog === 'function') renderBehaviorLog('adminBehaviorLog');
  if (typeof renderStaffHR === 'function') renderStaffHR();
  if (typeof renderForum === 'function') renderForum('adminForum');
  if (typeof renderFileRepo === 'function') renderFileRepo('adminFileRepo');
  if (typeof renderPayments === 'function') renderPayments();
  if (typeof renderAnalytics === 'function') renderAnalytics();
  if (typeof renderReportBuilder === 'function') renderReportBuilder();
  if (typeof renderIDCards === 'function') renderIDCards('adminIDCards');
  if (typeof renderTerms === 'function') renderTerms();
  if (typeof renderPrograms === 'function') renderPrograms();
  if (typeof renderApplications === 'function') renderApplications();
  if (typeof renderExamBank === 'function') renderExamBank();
  if (typeof renderExamResults === 'function') renderExamResults();
  if (typeof renderSchoolSetup === 'function') renderSchoolSetup();
  if (typeof renderSubjectManagement === 'function') renderSubjectManagement();
  if (typeof renderStreamManagement === 'function') renderStreamManagement();
  if (typeof renderExamModules === 'function') renderExamModules();
  if (typeof renderUTMEMock === 'function') renderUTMEMock();
  if (typeof renderReportCardsAdmin === 'function') renderReportCardsAdmin();
  if (typeof renderSystemPanel === 'function') renderSystemPanel();
  if (typeof renderNotificationComposer === 'function') renderNotificationComposer();
  if (typeof renderSchoolProfile === 'function') renderSchoolProfile();
  if (typeof renderPaymentGatewaySettings === 'function') renderPaymentGatewaySettings();
  if (typeof renderPaymentTransactionLog === 'function') renderPaymentTransactionLog();
  if (typeof renderGalleryAdmin === 'function') renderGalleryAdmin();
  if (typeof renderPredictiveAnalytics === 'function') renderPredictiveAnalytics();
  if (typeof renderAITools === 'function') renderAITools();
  if (typeof renderSimQuestionBank === 'function') renderSimQuestionBank();
  if (typeof renderSimAttempts === 'function') renderSimAttempts();
  if (typeof renderAdminActivityGames === 'function') renderAdminActivityGames();
  if (typeof renderAlumni === 'function') renderAlumni();
  if (typeof applyTranslations === 'function') applyTranslations();
}

function logActivity(msg) {
  if (!data.activityLog) data.activityLog = [];
  data.activityLog.push(msg);
  if (data.activityLog.length > 50) data.activityLog.shift();
  saveData();
}

// ===== LANDING STATS ANIMATION =====
function updateLandingStats() {
  animateCounter('statStudents', (data.students || []).length);
  animateCounter('statTeachers', Math.max(12, Math.round((data.students || []).length * 0.15)));
  animateCounter('statSubjects', 12);
  animateCounter('statPassRate', 95);
}
function animateCounter(id, target) {
  var el = document.getElementById(id);
  if (!el) return;
  var current = 0;
  var step = Math.ceil(target / 40);
  var interval = setInterval(function() {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current + (id === 'statPassRate' ? '%' : '');
  }, 30);
}

// ===== HERO SLIDER =====
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let slideInterval;

function showSlide(index) {
  const container = document.getElementById('slidesContainer');
  const dots = document.querySelectorAll('.slider-dot');
  if (!container || !dots.length) return;
  slideIndex = (index + totalSlides) % totalSlides;
  container.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === slideIndex));
}

function goToSlide(index) {
  showSlide(index);
  resetSlideInterval();
}

function slideNext() {
  showSlide(slideIndex + 1);
  resetSlideInterval();
}

function slidePrev() {
  showSlide(slideIndex - 1);
  resetSlideInterval();
}

function resetSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
}

// Initialize slider on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.slide').length) {
      showSlide(0);
      slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
    }
  });
} else {
  if (document.querySelectorAll('.slide').length) {
    showSlide(0);
    slideInterval = setInterval(() => showSlide(slideIndex + 1), 3000);
  }
}

// ===== GALLERY LIGHTBOX =====
const galleryImages = [
  { src: 'https://picsum.photos/seed/eduverse1/800/500', thumb: 'https://picsum.photos/seed/eduverse1/300/200', alt: 'School Event' },
  { src: 'https://picsum.photos/seed/eduverse2/800/500', thumb: 'https://picsum.photos/seed/eduverse2/300/200', alt: 'Graduation Ceremony' },
  { src: 'https://picsum.photos/seed/eduverse3/800/500', thumb: 'https://picsum.photos/seed/eduverse3/300/200', alt: 'Sports Day' },
  { src: 'https://picsum.photos/seed/eduverse4/800/500', thumb: 'https://picsum.photos/seed/eduverse4/300/200', alt: 'Classroom Activities' },
  { src: 'https://picsum.photos/seed/eduverse5/800/500', thumb: 'https://picsum.photos/seed/eduverse5/300/200', alt: 'Library Session' },
  { src: 'https://picsum.photos/seed/eduverse6/800/500', thumb: 'https://picsum.photos/seed/eduverse6/300/200', alt: 'Award Ceremony' }
];
let currentGalleryIdx = 0;

function openGallery(index) {
  const existing = document.getElementById('galleryOverlay');
  if (existing) existing.remove();
  currentGalleryIdx = index;
  const img = galleryImages[index];
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.id = 'galleryOverlay';
  overlay.onclick = function(e) { if (e.target === overlay) closeGallery(); };
  overlay.innerHTML = `
    <div class="gallery-lightbox">
      <button class="gallery-close" onclick="closeGallery()">&times;</button>
      <button class="gallery-nav gallery-prev" onclick="galleryNav(-1)">&#10094;</button>
      <img src="${img.src}" alt="${img.alt}" id="galleryLightboxImg">
      <button class="gallery-nav gallery-next" onclick="galleryNav(1)">&#10095;</button>
      <div class="gallery-caption" id="galleryCaption">${img.alt} (${index + 1}/${galleryImages.length})</div>
      <div class="gallery-thumbs">${galleryImages.map((g, i) =>
        `<img src="${g.thumb}" alt="" class="${i === index ? 'active' : ''}" onclick="openGallery(${i})" loading="lazy">`
      ).join('')}</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);
  document.addEventListener('keydown', galleryKeyHandler);
}

function closeGallery() {
  const overlay = document.getElementById('galleryOverlay');
  if (overlay) { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); }
  document.removeEventListener('keydown', galleryKeyHandler);
}

function galleryNav(dir) {
  let idx = currentGalleryIdx + dir;
  if (idx < 0) idx = galleryImages.length - 1;
  if (idx >= galleryImages.length) idx = 0;
  const old = document.getElementById('galleryOverlay');
  if (old) { old.remove(); }
  openGallery(idx);
}

function galleryKeyHandler(e) {
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft') galleryNav(-1);
  if (e.key === 'ArrowRight') galleryNav(1);
}

// ===== HTML ESCAPE (XSS prevention) =====
function htmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== DARK MODE =====
function toggleDarkMode() {
  var html = document.documentElement;
  var isDark = html ? html.getAttribute('data-theme') === 'dark' : false;
  if (isDark) {
    if (html) html.removeAttribute('data-theme');
    try { localStorage.setItem('darkMode', 'false'); } catch(e) {}
    var icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = 'fas fa-moon';
  } else {
    if (html) html.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('darkMode', 'true'); } catch(e) {}
    var icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = 'fas fa-sun';
  }
}
function initDarkMode() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = 'fas fa-sun';
  }
}

// ===== LOADING STATE =====
function showLoading() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== CSV EXPORT =====
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table || !table.rows.length) { toast('No data to export', 'error'); return; }
  const rows = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = [];
    for (let j = 0; j < table.rows[i].cells.length; j++) {
      let cell = table.rows[i].cells[j].innerText.replace(/,/g, ';').replace(/\n/g, ' ').replace(/"/g, '""');
      row.push('"' + cell + '"');
    }
    rows.push(row.join(','));
  }
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Exported ' + filename + '.csv');
}

// Export live getters for current student/teacher
Object.defineProperty(window, '__currentStudent', { get: function() { return currentStudent; } });
Object.defineProperty(window, '__currentTeacher', { get: function() { return currentTeacher; } });
