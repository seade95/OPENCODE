// EduVerse Main Application Entry
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (typeof loadData === 'function') loadData();

    var params = new URLSearchParams(window.location.search);
    var portalParam = params.get('portal');

    if (portalParam) {
      if (typeof syncSession === 'function') syncSession();
      if (portalParam === 'admin' && typeof showAdminPortal === 'function') showAdminPortal();
      else if (portalParam === 'student' && typeof showStudentLogin === 'function') showStudentLogin();
      else if (portalParam === 'teacher' && typeof showTeacherLogin === 'function') showTeacherLogin();
      else if (portalParam === 'parent' && typeof showParentLogin === 'function') showParentLogin();
    } else {
      if (typeof syncSession === 'function') syncSession();
      if (typeof showLandingPage === 'function') showLandingPage();
    }
  } catch(e) {
    console.warn('EduVerse app initialization warning:', e);
  }
});
