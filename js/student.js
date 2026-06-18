// EDUVERSE - Student Portal Module
// Results, CAT, Assignments, Fees, Activities, Attendance viewing

function renderStudentPortal() {
  if (!currentStudent) return;
  var s = currentStudent;
  var el;
  el = document.getElementById('studentNameDisplay'); if (el) el.innerHTML = '<i class="fas fa-user-graduate"></i> ' + htmlEscape(s.name);
  el = document.getElementById('studentAvatar'); if (el) { 
    var img = document.getElementById('studentAvatarImg');
    if (img) { img.src = 'images/avatars/student' + ((parseInt(s.id.replace(/\D/g,'')) % 2) + 1) + '.jpg'; img.style.display = ''; }
    el.textContent = '';
    el.appendChild(img);
  }
  el = document.getElementById('studentProfileName'); if (el) el.textContent = s.name;
  el = document.getElementById('studentProfileId'); if (el) el.textContent = s.id;
  el = document.getElementById('studentProfileClass'); if (el) el.textContent = s.class;
  el = document.getElementById('stuCurrentTerm'); if (el) el.textContent = data.currentTerm || 'No active term';

  // Results
  var results = (data.results || []).filter(function(r) { return r.studentId === s.id; });
  var rt = document.getElementById('stuResultsTable');
  var re = document.getElementById('stuResultsEmpty');
  if (results.length && rt && re) {
    rt.innerHTML = results.map(function(r) { return '<tr><td>' + htmlEscape(r.subject) + '</td><td><strong>' + r.score + '</strong></td><td><span class="badge" style="background:' + (r.score >= 80 ? '#c6f6d5' : r.score >= 60 ? '#fefcbf' : '#fed7d7') + ';color:' + (r.score >= 80 ? '#22543d' : r.score >= 60 ? '#744210' : '#9b2c2c') + '">' + htmlEscape(r.grade) + '</span></td><td>' + htmlEscape(r.term) + '</td></tr>'; }).join('');
    re.style.display = 'none';
  } else { if (rt) rt.innerHTML = ''; if (re) re.style.display = 'block'; }

  // CAT
  var cat = (data.cat || []).filter(function(c) { return c.studentId === s.id; });
  var ct = document.getElementById('stuCatTable');
  var ce = document.getElementById('stuCatEmpty');
  if (cat.length && ct && ce) {
    ct.innerHTML = cat.map(function(c) { return '<tr><td>' + htmlEscape(c.subject) + '</td><td>' + c.test1 + '/20</td><td>' + c.test2 + '/20</td><td>' + c.test3 + '/20</td><td><strong>' + Math.round((c.test1 + c.test2 + c.test3) / 3) + '/20</strong></td></tr>'; }).join('');
    ce.style.display = 'none';
  } else { if (ct) ct.innerHTML = ''; if (ce) ce.style.display = 'block'; }

  // Fees
  var fees = (data.fees || []).filter(function(f) { return f.studentId === s.id; });
  var ft = document.getElementById('stuFeesTable');
  var fe = document.getElementById('stuFeesEmpty');
  if (fees.length && ft && fe) {
    ft.innerHTML = fees.map(function(f) {
      var balance = f.amount - f.paid;
      var bClass = f.status === 'paid' ? 'badge-paid' : f.status === 'partial' ? 'badge-partial' : 'badge-absent';
      return '<tr><td>' + htmlEscape(f.term) + '</td><td>₦' + Number(f.amount).toLocaleString() + '</td><td>₦' + Number(f.paid).toLocaleString() + '</td><td>₦' + Math.max(0, balance).toLocaleString() + '</td><td><span class="badge ' + bClass + '">' + htmlEscape(f.status) + '</span></td></tr>';
    }).join('');
    fe.style.display = 'none';
  } else { if (ft) ft.innerHTML = ''; if (fe) fe.style.display = 'block'; }

  // Activities
  var acts = (data.activities || []).filter(function(a) { return (a.participants || []).indexOf(s.id) >= 0; });
  var ag = document.getElementById('stuActivitiesGrid');
  var ae = document.getElementById('stuActivitiesEmpty');
  if (acts.length && ag && ae) {
    ag.innerHTML = '<div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:16px;height:100px;"><img src="images/sports/football.jpg" alt="" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);"><div style="position:absolute;inset:0;display:flex;align-items:center;padding:20px;color:white;"><h3 style="font-weight:700;font-size:18px;"><i class="fas fa-futbol"></i> My Activities</h3></div></div>' + 
    acts.map(function(a) { return '<div style="background:var(--card-bg);border-radius:var(--radius-sm);padding:20px;border:1px solid #e2e8f0;transition:var(--transition);"><div style="font-size:32px;color:var(--primary);margin-bottom:8px;"><i class="fas ' + (a.type === 'Sports' ? 'fa-futbol' : a.type === 'Academic' ? 'fa-book' : 'fa-palette') + '"></i></div><h4 style="font-weight:600;margin-bottom:4px;">' + htmlEscape(a.name) + '</h4><p style="font-size:13px;color:var(--text-light);"><i class="fas fa-calendar"></i> ' + htmlEscape(a.day) + '<br><i class="fas fa-clock"></i> ' + htmlEscape(a.time) + '</p></div>'; }).join('');
    ae.style.display = 'none';
  } else { if (ag) ag.innerHTML = ''; if (ae) ae.style.display = 'block'; }

  // Assignments — render dynamically with submission status
  if (typeof renderStudentAssignments === 'function') renderStudentAssignments();

  if (typeof renderTimetableStudent === 'function') renderTimetableStudent();
  if (typeof renderExamsStudent === 'function') renderExamsStudent();
  if (typeof renderMessages === 'function') renderMessages('stuMessages', s.id);

  if (typeof renderStudentStreamInfo === 'function') renderStudentStreamInfo();
  if (typeof renderStudentExamRegistrations === 'function') renderStudentExamRegistrations();
  if (typeof renderStudentGPA === 'function') renderStudentGPA();
  if (typeof renderStudentReportCard === 'function') renderStudentReportCard();

  var att = (data.attendance || []).filter(function(a) { return a.studentId === s.id; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var at = document.getElementById('stuAttendanceTable');
  var ate = document.getElementById('stuAttendanceEmpty');
  if (att.length && at && ate) {
    at.innerHTML = att.map(function(a) {
      var bClass = a.status === 'present' ? 'badge-paid' : a.status === 'absent' ? 'badge-absent' : 'badge-excused';
      return '<tr><td>' + htmlEscape(a.date) + '</td><td><span class="badge ' + bClass + '">' + htmlEscape(a.status) + '</span></td></tr>';
    }).join('');
    ate.style.display = 'none';
  } else { if (at) at.innerHTML = ''; if (ate) ate.style.display = 'block'; }

  if (typeof renderStudentLessonNotes === 'function') renderStudentLessonNotes();
  if (typeof renderStudentLibrary === 'function') renderStudentLibrary();
  if (typeof renderStudentPayment === 'function') renderStudentPayment();
  if (typeof renderGalleryView === 'function') renderGalleryView('stuGalleryView');
  if (typeof renderAcademicCalendarView === 'function') renderAcademicCalendarView('stuCalendarView');
  if (typeof renderStudentHostel === 'function') renderStudentHostel();
  if (typeof renderStudentAlumni === 'function') renderStudentAlumni();
  if (typeof renderSubscriptionBanner === 'function') renderSubscriptionBanner();
  if (typeof applyTranslations === 'function') applyTranslations();
  checkFeeLock();
}

// ===== FEE LOCK — block access when fees unpaid (within payment window only) =====
var _feeLockOverlay = null;

function isInFeePaymentWindow() {
  var cfg = data.feeConfig;
  if (!cfg || !cfg.enabled || !cfg.windowStart || !cfg.windowEnd) return true; // no config = legacy behavior = lock
  var now = new Date();
  now.setHours(0,0,0,0);
  var start = new Date(cfg.windowStart + 'T00:00:00');
  var end = new Date(cfg.windowEnd + 'T23:59:59');
  return now >= start && now <= end;
}

function checkFeeLock() {
  if (!currentStudent) return;
  // If outside the payment window, never lock
  if (!isInFeePaymentWindow()) {
    var ex = document.getElementById('stuFeeLock');
    if (ex) ex.remove();
    _feeLockOverlay = null;
    return;
  }
  var s = currentStudent;
  var cfg = data.feeConfig || {};
  var graceDays = cfg.partPaymentGraceDays || 7;

  var lockable = (data.fees || []).filter(function(f) {
    if (f.studentId !== s.id || f.status === 'paid' || f.amount <= 0) return false;
    // Partial payers get a grace period: portal stays open for graceDays after last payment
    if (f.status === 'partial' && f.lastPaymentDate) {
      var deadline = new Date(f.lastPaymentDate + 'T00:00:00');
      deadline.setDate(deadline.getDate() + graceDays);
      if (new Date() <= deadline) return false; // grace period still active
    }
    return true;
  });
  var totalDue = lockable.reduce(function(sum, f) { return sum + (f.amount - f.paid); }, 0);

  var existing = document.getElementById('stuFeeLock');
  if (totalDue <= 0) {
    if (existing) existing.remove();
    _feeLockOverlay = null;
    return;
  }

  if (existing) return; // already shown

  var deadlineMsg = cfg.windowEnd ? ' Payment deadline: ' + cfg.windowEnd + '.' : '';

  var overlay = document.createElement('div');
  overlay.id = 'stuFeeLock';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:480px;width:100%;padding:32px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.25);animation:fadeIn 0.3s ease;">' +
      '<div style="width:80px;height:80px;border-radius:50%;background:#fff5f5;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
        '<i class="fas fa-lock" style="font-size:32px;color:#e53e3e;"></i>' +
      '</div>' +
      '<h2 style="font-size:22px;font-weight:800;color:#2d3748;margin-bottom:4px;">Portal Locked</h2>' +
      '<p style="font-size:14px;color:#718096;margin-bottom:20px;">Please clear your outstanding school fees to access the portal.' + deadlineMsg + '</p>' +
      '<div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;">' +
        '<p style="font-weight:600;font-size:14px;color:#e53e3e;margin-bottom:8px;"><i class="fas fa-exclamation-circle"></i> Outstanding Fees</p>' +
        lockable.map(function(f) {
          var bal = f.amount - f.paid;
          return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid #fed7d7;"><span>' + htmlEscape(f.term) + '</span><span style="font-weight:600;">₦' + bal.toLocaleString() + '</span></div>';
        }).join('') +
        '<div style="display:flex;justify-content:space-between;padding:8px 0 0;font-size:15px;font-weight:700;color:#e53e3e;"><span>Total Due</span><span>₦' + totalDue.toLocaleString() + '</span></div>' +
      '</div>' +
      '<button class="btn btn-success" style="width:100%;padding:12px;font-size:16px;" onclick="closeFeeLock();showPaymentPage();"><i class="fas fa-credit-card"></i> Pay Now</button>' +
      '<p style="font-size:12px;color:#a0aec0;margin-top:12px;">Pay online with card, bank transfer, or USSD</p>' +
    '</div>';
  document.body.appendChild(overlay);
  _feeLockOverlay = overlay;
}

function closeFeeLock() {
  var el = document.getElementById('stuFeeLock');
  if (el) el.remove();
  _feeLockOverlay = null;
}

(function() {
  var tabs = document.querySelectorAll('.student-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      var tabName = this.dataset.tab;
      // If fee-locked, only allow the payments tab
      if (document.getElementById('stuFeeLock') && tabName !== 'payments') {
        checkFeeLock();
        return;
      }
      var tabs2 = document.querySelectorAll('.student-tab');
      for (var j = 0; j < tabs2.length; j++) tabs2[j].classList.remove('active');
      var panels = document.querySelectorAll('.student-panel');
      for (var j = 0; j < panels.length; j++) panels[j].classList.remove('active');
      this.classList.add('active');
      var panel = document.getElementById('stu-' + tabName);
      if (panel) panel.classList.add('active');
      if (tabName === 'timetable' && typeof renderTimetableStudent === 'function') renderTimetableStudent();
      if (tabName === 'exams' && typeof renderExamsStudent === 'function') renderExamsStudent();
      if (tabName === 'messages' && typeof renderMessages === 'function') renderMessages('stuMessages', currentStudent ? currentStudent.id : '');
      if (tabName === 'lessonnotes' && typeof renderStudentLessonNotes === 'function') renderStudentLessonNotes();
      if (tabName === 'forum' && typeof renderForum === 'function') renderForum('stuForum', currentStudent ? currentStudent.class : '');
      if (tabName === 'filerepo' && typeof renderFileRepo === 'function') renderFileRepo('stuFileRepo', currentStudent ? currentStudent.class : '');
      if (tabName === 'library' && typeof renderStudentLibrary === 'function') renderStudentLibrary();
      if (tabName === 'payments' && typeof renderStudentPayment === 'function') renderStudentPayment();
      if (tabName === 'reportcard' && typeof renderStudentReportCard === 'function') renderStudentReportCard();
      if (tabName === 'assignments' && typeof renderStudentAssignments === 'function') renderStudentAssignments();
      if (tabName === 'eschool' && typeof renderESchoolView === 'function') renderESchoolView('stuESchoolView');
      if (tabName === 'gallery' && typeof renderGalleryView === 'function') renderGalleryView('stuGalleryView');
      if (tabName === 'calendar' && typeof renderAcademicCalendarView === 'function') renderAcademicCalendarView('stuCalendarView');
      if (tabName === 'hostel' && typeof renderStudentHostel === 'function') renderStudentHostel();
      if (tabName === 'simulation' && typeof renderSimCenter === 'function') { if (typeof cleanupSim === 'function') cleanupSim(); renderSimCenter(); }
      if (tabName === 'activitygames' && typeof renderStudentActivityGames === 'function') renderStudentActivityGames();
      if (tabName === 'alumni' && typeof renderStudentAlumni === 'function') renderStudentAlumni();
      if (tabName === 'health' && typeof renderStudentHealthView === 'function') renderStudentHealthView();
      if (tabName === 'transport' && typeof renderStudentTransportView === 'function') renderStudentTransportView();
      if (typeof applyTranslations === 'function') applyTranslations();
    });
  }
})();
