// EDUVERSE - Student Portal Module
// Results, CAT, Assignments, Fees, Activities, Attendance viewing

function renderStudentPortal() {
  if (!currentStudent) return;
  var s = currentStudent;
  var el;
  el = document.getElementById('studentNameDisplay'); if (el) el.innerHTML = '<i class="fas fa-user-graduate"></i> ' + htmlEscape(s.name);
  el = document.getElementById('studentAvatar'); if (el) el.textContent = s.name.charAt(0).toUpperCase();
  el = document.getElementById('studentProfileName'); if (el) el.textContent = s.name;
  el = document.getElementById('studentProfileId'); if (el) el.textContent = s.id;
  el = document.getElementById('studentProfileClass'); if (el) el.textContent = s.class;

  // Results
  var results = data.results.filter(function(r) { return r.studentId === s.id; });
  var rt = document.getElementById('stuResultsTable');
  var re = document.getElementById('stuResultsEmpty');
  if (results.length && rt && re) {
    rt.innerHTML = results.map(function(r) { return '<tr><td>' + htmlEscape(r.subject) + '</td><td><strong>' + r.score + '</strong></td><td><span class="badge" style="background:' + (r.score >= 80 ? '#c6f6d5' : r.score >= 60 ? '#fefcbf' : '#fed7d7') + ';color:' + (r.score >= 80 ? '#22543d' : r.score >= 60 ? '#744210' : '#9b2c2c') + '">' + htmlEscape(r.grade) + '</span></td><td>' + htmlEscape(r.term) + '</td></tr>'; }).join('');
    re.style.display = 'none';
  } else { if (rt) rt.innerHTML = ''; if (re) re.style.display = 'block'; }

  // CAT
  var cat = data.cat.filter(function(c) { return c.studentId === s.id; });
  var ct = document.getElementById('stuCatTable');
  var ce = document.getElementById('stuCatEmpty');
  if (cat.length && ct && ce) {
    ct.innerHTML = cat.map(function(c) { return '<tr><td>' + htmlEscape(c.subject) + '</td><td>' + c.test1 + '/20</td><td>' + c.test2 + '/20</td><td>' + c.test3 + '/20</td><td><strong>' + Math.round((c.test1 + c.test2 + c.test3) / 3) + '/20</strong></td></tr>'; }).join('');
    ce.style.display = 'none';
  } else { if (ct) ct.innerHTML = ''; if (ce) ce.style.display = 'block'; }

  // Fees
  var fees = data.fees.filter(function(f) { return f.studentId === s.id; });
  var ft = document.getElementById('stuFeesTable');
  var fe = document.getElementById('stuFeesEmpty');
  if (fees.length && ft && fe) {
    ft.innerHTML = fees.map(function(f) {
      var balance = f.amount - f.paid;
      var bClass = f.status === 'paid' ? 'badge-paid' : f.status === 'partial' ? 'badge-partial' : 'badge-absent';
      return '<tr><td>' + htmlEscape(f.term) + '</td><td>$' + f.amount + '</td><td>$' + f.paid + '</td><td>$' + Math.max(0, balance) + '</td><td><span class="badge ' + bClass + '">' + htmlEscape(f.status) + '</span></td></tr>';
    }).join('');
    fe.style.display = 'none';
  } else { if (ft) ft.innerHTML = ''; if (fe) fe.style.display = 'block'; }

  // Activities
  var acts = data.activities.filter(function(a) { return a.participants.indexOf(s.id) >= 0; });
  var ag = document.getElementById('stuActivitiesGrid');
  var ae = document.getElementById('stuActivitiesEmpty');
  if (acts.length && ag && ae) {
    ag.innerHTML = acts.map(function(a) { return '<div style="background:var(--card-bg);border-radius:var(--radius-sm);padding:20px;border:1px solid #e2e8f0;transition:var(--transition);"><div style="font-size:32px;color:var(--primary);margin-bottom:8px;"><i class="fas ' + (a.type === 'Sports' ? 'fa-futbol' : a.type === 'Academic' ? 'fa-book' : 'fa-palette') + '"></i></div><h4 style="font-weight:600;margin-bottom:4px;">' + htmlEscape(a.name) + '</h4><p style="font-size:13px;color:var(--text-light);"><i class="fas fa-calendar"></i> ' + htmlEscape(a.day) + '<br><i class="fas fa-clock"></i> ' + htmlEscape(a.time) + '</p></div>'; }).join('');
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

  var att = data.attendance.filter(function(a) { return a.studentId === s.id; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
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
  if (typeof applyTranslations === 'function') applyTranslations();
}

(function() {
  var tabs = document.querySelectorAll('.student-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      var tabs2 = document.querySelectorAll('.student-tab');
      for (var j = 0; j < tabs2.length; j++) tabs2[j].classList.remove('active');
      var panels = document.querySelectorAll('.student-panel');
      for (var j = 0; j < panels.length; j++) panels[j].classList.remove('active');
      this.classList.add('active');
      var tabName = this.dataset.tab;
      var panel = document.getElementById('stu-' + tabName);
      if (panel) panel.classList.add('active');
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
      if (tabName === 'simulation' && typeof renderSimCenter === 'function') { cleanupSim(); renderSimCenter(); }
      if (tabName === 'activitygames' && typeof renderStudentActivityGames === 'function') renderStudentActivityGames();
      if (tabName === 'alumni' && typeof renderStudentAlumni === 'function') renderStudentAlumni();
      if (typeof applyTranslations === 'function') applyTranslations();
    });
  }
})();
