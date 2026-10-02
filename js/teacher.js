/**
 * EduVerse - Teacher Portal Module
 * Manages teacher dashboard, score distribution charts, roster, assignments, and exams.
 */

(function() {
  'use strict';

  function renderTeacherPortal() {
    var teacher = window.currentTeacher || (typeof getSession === 'function' ? (getSession() || {}).user : null) || {
      id: 'TCH001',
      name: 'Dr. Sarah Jenkins',
      subject: 'Mathematics',
      assignedClass: 'SS 2A'
    };

    var elName = document.getElementById('tchWelcomeName');
    if (elName) elName.textContent = teacher.name || 'Teacher';

    renderTeacherDashboard();
  }

  function renderTeacherDashboard() {
    var teacher = window.currentTeacher || (typeof getSession === 'function' ? (getSession() || {}).user : null) || {
      id: 'TCH001',
      name: 'Dr. Sarah Jenkins',
      subject: 'Mathematics',
      assignedClass: 'SS 2A'
    };

    var elClass = document.getElementById('tDashClass');
    var elStudents = document.getElementById('tDashStudents');
    var elAssignments = document.getElementById('tDashAssignments');
    var elAvg = document.getElementById('tDashAvg');

    if (elClass) elClass.textContent = teacher.assignedClass || 'SS 2A';
    if (elStudents) elStudents.textContent = '38';
    if (elAssignments) elAssignments.textContent = '4 Pending';
    if (elAvg) elAvg.textContent = '78.5%';

    // Mount Recharts Score Distribution Chart
    if (typeof window.mountTeacherScoreDistributionChart === 'function') {
      window.mountTeacherScoreDistributionChart('teacherScoreDistributionChartContainer');
    }
  }

  function renderTeacherAssignments() {
    var container = document.getElementById('tchAssignmentsList');
    if (!container) return;

    var assignments = [
      { id: 'ASN01', title: 'Quadratic Equations Practice Set', subject: 'Mathematics', dueDate: '2026-10-05', submitted: 32, total: 38 },
      { id: 'ASN02', title: 'Trigonometric Identities Quiz', subject: 'Mathematics', dueDate: '2026-10-12', submitted: 28, total: 38 },
      { id: 'ASN03', title: 'Calculus Fundamental Theorems', subject: 'Mathematics', dueDate: '2026-10-18', submitted: 15, total: 38 }
    ];

    var escFn = window.htmlEscape || function(s) { return s; };

    container.innerHTML = assignments.map(function(a) {
      return '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">'
        + '<div>'
        + '  <h4 style="margin: 0 0 4px; color: #1e293b; font-size: 15px;">' + escFn(a.title) + '</h4>'
        + '  <p style="margin: 0; font-size: 13px; color: #64748b;">Subject: <strong>' + escFn(a.subject) + '</strong> | Due: ' + escFn(a.dueDate) + '</p>'
        + '</div>'
        + '<div style="display: flex; align-items: center; gap: 12px;">'
        + '  <span class="badge badge-paid" style="font-weight: 600;">' + a.submitted + ' / ' + a.total + ' Submitted</span>'
        + '  <button class="btn btn-sm btn-outline" onclick="if(typeof window.toast===\'function\') window.toast(\'Reviewing assignment submissions\', \'info\');"><i class="fas fa-edit"></i> Grade</button>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  var _currentRosterFilter = 'all';

  function setTeacherRosterFilter(filterKey) {
    _currentRosterFilter = filterKey || 'all';
    
    // Update active style on quick filter buttons
    var btns = document.querySelectorAll('.tch-roster-filter-btn');
    btns.forEach(function(btn) {
      if (btn.getAttribute('data-filter') === _currentRosterFilter) {
        btn.classList.add('active');
        btn.style.background = '#2563eb';
        btn.style.color = '#ffffff';
      } else {
        btn.classList.remove('active');
        btn.style.background = '#f8fafc';
        btn.style.color = '#475569';
      }
    });

    renderTeacherRoster();
  }

  function renderTeacherRoster() {
    var tbody = document.getElementById('teacherRosterTable') || document.getElementById('tchRosterTable');
    if (!tbody) return;

    var fullRoster = [
      { id: 'STU001', name: 'Alex Johnson', class: 'SS 2A', score: 88, attendance: 94, status: 'Active', contact: 'p.johnson@eduverse.org' },
      { id: 'STU002', name: 'Beatrice Smith', class: 'SS 2A', score: 94, attendance: 98, status: 'Active', contact: 'b.smith@eduverse.org' },
      { id: 'STU003', name: 'Charles Davies', class: 'SS 2A', score: 72, attendance: 82, status: 'Active', contact: 'c.davies@eduverse.org' },
      { id: 'STU004', name: 'Diana Prince', class: 'SS 2A', score: 68, attendance: 68, status: 'At Risk', contact: 'd.prince@eduverse.org' },
      { id: 'STU005', name: 'Ethan Hunt', class: 'SS 2A', score: 91, attendance: 95, status: 'Active', contact: 'e.hunt@eduverse.org' },
      { id: 'STU006', name: 'Fiona Gallagher', class: 'SS 2A', score: 82, attendance: 71, status: 'At Risk', contact: 'f.gallagher@eduverse.org' },
      { id: 'STU007', name: 'George Clark', class: 'SS 2A', score: 78, attendance: 89, status: 'Active', contact: 'g.clark@eduverse.org' },
      { id: 'STU008', name: 'Hannah Abbott', class: 'SS 2A', score: 96, attendance: 92, status: 'Active', contact: 'h.abbott@eduverse.org' },
      { id: 'STU009', name: 'Ian Malcolm', class: 'SS 2A', score: 85, attendance: 64, status: 'At Risk', contact: 'i.malcolm@eduverse.org' },
      { id: 'STU010', name: 'Julia Roberts', class: 'SS 2A', score: 90, attendance: 96, status: 'Active', contact: 'j.roberts@eduverse.org' }
    ];

    var searchEl = document.getElementById('tchRosterSearch');
    var searchQuery = searchEl ? searchEl.value.trim().toLowerCase() : '';

    var sortEl = document.getElementById('tchRosterSort');
    var sortVal = sortEl ? sortEl.value : 'name_asc';

    // Calculate percentiles relative to full roster scores
    var sortedScores = fullRoster.map(function(s) { return s.score; }).sort(function(a, b) { return a - b; });
    fullRoster.forEach(function(s) {
      var rank = sortedScores.indexOf(s.score);
      s.percentile = Math.round(((rank + 1) / sortedScores.length) * 100);
    });

    // 1. Filter students
    var filtered = fullRoster.filter(function(s) {
      // Search term matching
      if (searchQuery) {
        var matchName = s.name.toLowerCase().indexOf(searchQuery) !== -1;
        var matchId = s.id.toLowerCase().indexOf(searchQuery) !== -1;
        var matchContact = s.contact.toLowerCase().indexOf(searchQuery) !== -1;
        if (!matchName && !matchId && !matchContact) return false;
      }

      // Quick filter criteria
      if (_currentRosterFilter === 'top_percentile') {
        return s.score >= 85;
      } else if (_currentRosterFilter === 'at_risk_attendance') {
        return s.attendance < 75;
      } else if (_currentRosterFilter === 'high_attendance') {
        return s.attendance >= 90;
      }
      return true;
    });

    // 2. Sort students
    filtered.sort(function(a, b) {
      if (sortVal === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sortVal === 'name_desc') {
        return b.name.localeCompare(a.name);
      } else if (sortVal === 'attendance_desc') {
        return b.attendance - a.attendance;
      } else if (sortVal === 'attendance_asc') {
        return a.attendance - b.attendance;
      } else if (sortVal === 'score_desc') {
        return b.score - a.score;
      } else if (sortVal === 'score_asc') {
        return a.score - b.score;
      }
      return 0;
    });

    // Update Summary Stats Badge
    var summaryEl = document.getElementById('tchRosterStatsSummary');
    if (summaryEl) {
      var filterLabel = _currentRosterFilter === 'top_percentile' ? 'Top Performers' :
                        _currentRosterFilter === 'at_risk_attendance' ? 'At Risk Attendance' :
                        _currentRosterFilter === 'high_attendance' ? 'High Attendance' : 'All Students';
      summaryEl.innerHTML = '<i class="fas fa-users" style="color:#2563eb;"></i> Showing <strong>' + filtered.length + '</strong> of <strong>' + fullRoster.length + '</strong> Students | Filter: <strong>' + filterLabel + '</strong>';
    }

    var emptyEl = document.getElementById('teacherRosterEmpty');
    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
    }

    var escFn = window.htmlEscape || function(s) { return String(s || ''); };

    tbody.innerHTML = filtered.map(function(s) {
      var attBadgeClass = s.attendance >= 90 ? 'badge-paid' : (s.attendance >= 75 ? 'badge-partial' : 'badge-unpaid');
      var attIcon = s.attendance >= 90 ? 'fa-check-circle' : (s.attendance >= 75 ? 'fa-info-circle' : 'fa-exclamation-triangle');
      var scoreColor = s.score >= 85 ? '#15803d' : (s.score >= 70 ? '#1e40af' : '#b91c1c');

      return '<tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'transparent\'">'
        + '<td style="padding: 12px 16px; font-size: 13px;"><strong>' + escFn(s.id) + '</strong></td>'
        + '<td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1e293b;">'
        + '  <div>' + escFn(s.name) + '</div>'
        + '  <div style="font-size: 11px; color: #94a3b8; font-weight: 400;">' + escFn(s.contact) + '</div>'
        + '</td>'
        + '<td style="padding: 12px 16px; font-size: 13px; color: #475569;">' + escFn(s.class) + '</td>'
        + '<td style="padding: 12px 16px; font-size: 13px;">'
        + '  <span style="font-weight: 700; color: ' + scoreColor + ';">' + s.score + '%</span>'
        + '  <span style="font-size: 11px; color: #64748b; margin-left: 6px;">(' + s.percentile + 'th percentile)</span>'
        + '</td>'
        + '<td style="padding: 12px 16px;">'
        + '  <span class="badge ' + attBadgeClass + '" style="font-size: 12px; font-weight: 600; gap: 4px;">'
        + '    <i class="fas ' + attIcon + '"></i> ' + s.attendance + '%'
        + '  </span>'
        + '</td>'
        + '<td style="padding: 12px 16px;">'
        + '  <span class="badge ' + (s.status === 'Active' ? 'badge-paid' : 'badge-unpaid') + '">' + escFn(s.status) + '</span>'
        + '</td>'
        + '<td style="padding: 12px 16px; text-align: right;">'
        + '  <div style="display: flex; gap: 6px; justify-content: flex-end;">'
        + '    <button type="button" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="if(typeof window.toast===\'function\') window.toast(\'Viewing ' + escFn(s.name) + ' performance report\', \'info\');"><i class="fas fa-chart-line"></i> Report</button>'
        + (s.attendance < 75 ? '    <button type="button" class="btn btn-sm" style="padding: 4px 8px; font-size: 11px; background: #ef4444; color: #fff; border: none; border-radius: 4px; cursor: pointer;" onclick="if(typeof window.sendParentAttendanceAlert===\'function\') window.sendParentAttendanceAlert(\'' + escFn(s.name) + '\', ' + s.attendance + ', \'' + escFn(s.contact) + '\'); else if(typeof window.toast===\'function\') window.toast(\'Attendance warning alert dispatched for ' + escFn(s.name) + '\', \'warning\');"><i class="fas fa-bell"></i> Alert</button>' : '')
        + '  </div>'
        + '</td>'
        + '</tr>';
    }).join('');
  }

  function renderTimetableTeacher() {}
  function renderExamsTeacher() {}

  window.renderTeacherPortal = renderTeacherPortal;
  window.renderTeacherDashboard = renderTeacherDashboard;
  window.renderTeacherAssignments = renderTeacherAssignments;
  window.renderTeacherRoster = renderTeacherRoster;
  window.setTeacherRosterFilter = setTeacherRosterFilter;
  window.renderTimetableTeacher = renderTimetableTeacher;
  window.renderExamsTeacher = renderExamsTeacher;

})();
