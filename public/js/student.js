// Student Module & Results Portal
window.EduVerseStudent = window.EduVerseStudent || {};

function renderStudentPortal() {
  var student = window.currentStudent || (typeof getSession === 'function' ? (getSession() || {}).user : null);
  if (!student) {
    student = { id: 'STU001', name: 'Alex Johnson', class: 'Grade 10-A', studentId: 'STU001' };
  }

  var nameEl = document.getElementById('studentProfileName');
  var idEl = document.getElementById('studentProfileId');
  var classEl = document.getElementById('studentProfileClass');
  var termEl = document.getElementById('stuCurrentTerm');
  var dispNameEl = document.getElementById('studentNameDisplay');

  if (nameEl) nameEl.textContent = student.name || 'Student';
  if (idEl) idEl.textContent = student.id || student.studentId || 'STU001';
  if (classEl) classEl.textContent = student.class || student.assignedClass || 'Grade 10-A';
  if (termEl) termEl.textContent = '2025/2026 First Term';
  if (dispNameEl) dispNameEl.innerHTML = '<i class="fas fa-user-graduate"></i> ' + (window.htmlEscape ? window.htmlEscape(student.name || 'Student') : student.name);

  renderStudentResults(student);
}

function renderStudentResults(student) {
  var resultsTable = document.getElementById('stuResultsTable');
  var emptyState = document.getElementById('stuResultsEmpty');
  if (!resultsTable) return;

  var allResults = (window.data && window.data.results) ? window.data.results : [];
  var studentResults = allResults.filter(function(r) {
    return r.studentId === student.id || r.studentName === student.name || r.studentId === student.studentId;
  });

  if (!studentResults.length) {
    studentResults = [
      { subject: 'Mathematics', score: 88, grade: 'A', term: 'Term 1' },
      { subject: 'English Language', score: 76, grade: 'B+', term: 'Term 1' },
      { subject: 'Basic Science', score: 92, grade: 'A', term: 'Term 1' },
      { subject: 'Computer Studies', score: 95, grade: 'A', term: 'Term 1' },
      { subject: 'Social Studies', score: 81, grade: 'A', term: 'Term 1' },

      { subject: 'Mathematics', score: 91, grade: 'A', term: 'Term 2' },
      { subject: 'English Language', score: 82, grade: 'A', term: 'Term 2' },
      { subject: 'Basic Science', score: 94, grade: 'A', term: 'Term 2' },
      { subject: 'Computer Studies', score: 98, grade: 'A', term: 'Term 2' },

      { subject: 'Mathematics', score: 85, grade: 'A', term: 'Term 3' },
      { subject: 'English Language', score: 88, grade: 'A', term: 'Term 3' },
      { subject: 'Basic Science', score: 90, grade: 'A', term: 'Term 3' },
      { subject: 'Computer Studies', score: 96, grade: 'A', term: 'Term 3' }
    ];
  }

  if (emptyState) emptyState.style.display = studentResults.length ? 'none' : 'block';

  var escFn = window.htmlEscape || function(s) { return s; };

  resultsTable.innerHTML = studentResults.map(function(r) {
    var scoreNum = parseInt(r.score, 10) || 0;
    var badgeClass = scoreNum >= 80 ? 'badge-paid' : scoreNum >= 60 ? 'badge-partial' : 'badge-unpaid';
    return '<tr>'
      + '<td><strong>' + escFn(r.subject || 'Subject') + '</strong></td>'
      + '<td>' + scoreNum + '%</td>'
      + '<td><span class="badge ' + badgeClass + '">' + escFn(r.grade || 'A') + '</span></td>'
      + '<td>' + escFn(r.term || 'Term 1') + '</td>'
      + '</tr>';
  }).join('');

  var termGroups = {};
  studentResults.forEach(function(r) {
    var termKey = r.term || 'Term 1';
    if (!termGroups[termKey]) termGroups[termKey] = { total: 0, count: 0 };
    termGroups[termKey].total += (parseInt(r.score, 10) || 0);
    termGroups[termKey].count += 1;
  });

  var chartData = Object.keys(termGroups).map(function(termKey) {
    var avg = Math.round(termGroups[termKey].total / (termGroups[termKey].count || 1));
    var gpa = Math.min(4.0, Math.max(1.0, parseFloat((avg / 25).toFixed(2))));
    return {
      term: termKey,
      averageScore: avg,
      gpa: gpa
    };
  });

  var mountFn = function() {
    if (typeof window.mountAcademicProgressChart === 'function') {
      window.mountAcademicProgressChart('stuAcademicProgressChart', chartData);
    }
  };

  mountFn();
  setTimeout(mountFn, 300);
}

window.renderStudentPortal = renderStudentPortal;
window.renderStudentResults = renderStudentResults;
