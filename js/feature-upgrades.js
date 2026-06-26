// ===== Feature Upgrades: AI Learning, Badges, Predictive Dashboard, Chat, Timetable =====
// Load after features.js and features2.js
// ============================================================================

// ============================================================================
// 1. AI PERSONALIZED LEARNING PATHS
// Analyzes student performance and suggests tailored learning resources.
// ============================================================================

function renderPersonalizedLearning(studentId) {
  var student = (data.students || []).find(function(s) { return s.id === studentId; });
  if (!student) { toast('Student not found', 'error'); return; }

  var container = document.getElementById('personalizedLearningView');
  if (!container) {
    container = document.createElement('div');
    container.id = 'personalizedLearningView';
    document.getElementById('saContent') || document.body.appendChild(container);
  }

  // Analyze performance across subjects
  var results = (data.results || []).filter(function(r) { return r.studentId === studentId; });
  var subjectScores = {};
  results.forEach(function(r) {
    if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
    subjectScores[r.subject].push(r.score);
  });

  var weakAreas = [];
  var strongAreas = [];
  var recommendations = [];

  Object.keys(subjectScores).forEach(function(sub) {
    var scores = subjectScores[sub];
    var avg = scores.reduce(function(a, b) { return a + b; }, 0) / scores.length;
    if (avg < 50) weakAreas.push({ subject: sub, avg: avg, count: scores.length });
    else strongAreas.push({ subject: sub, avg: avg, count: scores.length });
  });

  weakAreas.sort(function(a, b) { return a.avg - b.avg; });
  strongAreas.sort(function(a, b) { return b.avg - a.avg; });

  // Generate AI recommendations based on weak areas
  var resourceMap = {
    'Mathematics': ['Khan Academy — Math Fundamentals', 'Brilliant.org — Problem Solving', 'YouTube: Numberphile'],
    'English': ['Grammarly Handbook', 'BBC Bitesize — English', 'Duolingo — Reading & Writing'],
    'Science': ['CK-12 Foundation — Science', 'PhET Interactive Simulations', 'Khan Academy — Science'],
    'Physics': ['The Physics Classroom', 'HyperPhysics Concepts', 'YouTube: Veritasium'],
    'Chemistry': ['ChemGuide', 'Periodic Table App', 'Crash Course Chemistry'],
    'Biology': ['BioMan Biology', 'Khan Academy — Biology', 'InnerBody Anatomy'],
    'History': ['BBC History', 'Khan Academy — History', 'Crash Course History'],
    'Geography': ['National Geographic Kids', 'Seterra Geography', 'BBC Bitesize — Geography'],
    'Computer': ['Code.org', 'Scratch Programming', 'W3Schools Tutorials'],
    'Commerce': ['Investopedia', 'Khan Academy — Economics', 'Business Study Notes'],
    'Accounting': ['AccountingCoach', 'MyAccountingCourse', 'Khan Academy — Accounting'],
  };

  weakAreas.forEach(function(w) {
    var suggestions = resourceMap[w.subject] || ['Practice exercises', 'Tutoring session', 'Review past topics'];
    var priority = w.avg < 30 ? 'critical' : (w.avg < 40 ? 'important' : 'moderate');
    recommendations.push({ subject: w.subject, avg: w.avg, priority: priority, suggestions: suggestions, type: 'weak' });
  });

  strongAreas.forEach(function(s) {
    if (s.avg >= 70) {
      recommendations.push({ subject: s.subject, avg: s.avg, priority: 'strength', suggestions: ['Advanced topics', 'Peer tutoring', 'Challenge problems'], type: 'strength' });
    }
  });

  var html = '<div class="sa-section"><h3><i class="fas fa-robot"></i> AI Personalized Learning Path</h3>';
  html += '<p style="font-size:14px;color:var(--text-light);margin-bottom:16px;">AI-generated recommendations for <strong>' + htmlEscape(student.name) + '</strong> based on ' + results.length + ' assessment results across ' + Object.keys(subjectScores).length + ' subjects.</p>';

  if (recommendations.length === 0) {
    html += '<div class="empty-state"><i class="fas fa-check-circle" style="color:#059669;"></i><p>No data available yet. Add assessment results to generate learning paths.</p></div>';
  } else {
    html += '<div style="display:grid;gap:12px;">';
    recommendations.forEach(function(r) {
      var color = r.priority === 'critical' ? '#fee2e2' : r.priority === 'important' ? '#fef3c7' : r.priority === 'moderate' ? '#dbeafe' : '#d1fae5';
      var borderColor = r.priority === 'critical' ? '#ef4444' : r.priority === 'important' ? '#f59e0b' : r.priority === 'moderate' ? '#3b82f6' : '#059669';
      var icon = r.priority === 'critical' ? 'fa-exclamation-triangle' : r.priority === 'important' ? 'fa-exclamation-circle' : r.priority === 'moderate' ? 'fa-book' : 'fa-star';
      html += '<div style="background:' + color + ';border-left:4px solid ' + borderColor + ';border-radius:8px;padding:14px 16px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
      html += '<strong style="font-size:14px;"><i class="fas ' + icon + '"></i> ' + htmlEscape(r.subject) + '</strong>';
      html += '<span style="font-size:13px;font-weight:600;">Avg: ' + r.avg.toFixed(0) + '%</span>';
      html += '</div>';
      html += '<div style="font-size:13px;color:#374151;margin-top:4px;">';
      html += '<strong>Recommended:</strong> ';
      r.suggestions.forEach(function(s, i) {
        html += '<span style="display:inline-block;background:rgba(255,255,255,0.6);padding:2px 8px;border-radius:4px;margin:2px 3px;font-size:12px;">' + htmlEscape(s) + '</span>';
      });
      html += '</div></div>';
    });
    html += '</div>';
  }

  // Attendance-based insights
  var attendance = (data.attendance || []).filter(function(a) { return a.studentId === studentId; });
  var present = attendance.filter(function(a) { return a.status === 'present'; }).length;
  var totalAT = attendance.length;
  var attPct = totalAT > 0 ? (present / totalAT * 100) : 0;
  html += '<div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;">';
  html += '<strong><i class="fas fa-chart-line"></i> Attendance Insight:</strong> ';
  if (attPct < 75) html += '<span style="color:#dc2626;">⚠ Attendance is low (' + attPct.toFixed(0) + '%). Encourage regular attendance for better outcomes.</span>';
  else html += '<span style="color:#059669;">✓ Attendance is good (' + attPct.toFixed(0) + '%).</span>';
  html += '</div>';

  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';
}

// Add AI learning button to teacher sidebar only (student uses hardcoded tab)
function addAILearningButton() {
  var nav = document.querySelector('#teacherPage .admin-sidebar');
  if (nav && !document.getElementById('aiLearningNavItem')) {
    var item = document.createElement('a');
    item.id = 'aiLearningNavItem';
    item.className = 'admin-sidebar-item';
    item.setAttribute('data-teacher-panel', 'ai-learning');
    item.innerHTML = '<i class="fas fa-robot"></i> AI Learning Path';
    nav.appendChild(item);
  }
}

// Teacher AI Learning view — shows student selector then learning path
function renderTeacherAILearning() {
  var container = document.getElementById('teacherAILearningView');
  if (!container) return;

  var students = data.students || [];
  if (students.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>No students available. Add students first.</p></div>';
    return;
  }

  var html = '<div class="sa-section"><h3><i class="fas fa-robot"></i> AI Learning Paths</h3>';
  html += '<p style="font-size:14px;color:var(--text-light);margin-bottom:16px;">Select a student to view their personalized AI learning recommendations.</p>';
  html += '<div class="form-group"><label>Select Student</label><select id="teacherAIStudentSelect" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;" onchange="renderTeacherAILearningForStudent()">';
  html += '<option value="">-- Choose a student --</option>';
  students.forEach(function(s) {
    html += '<option value="' + s.id + '">' + htmlEscape(s.name) + ' (' + htmlEscape(s.class) + ')</option>';
  });
  html += '</select></div>';
  html += '<div id="teacherAILearningResult"></div></div>';
  container.innerHTML = html;
}

function renderTeacherAILearningForStudent() {
  var sel = document.getElementById('teacherAIStudentSelect');
  if (!sel || !sel.value) return;
  renderPersonalizedLearning(sel.value);
}

// ============================================================================
// 2. ACHIEVEMENT & BADGING SYSTEM
// Rewards students with digital badges for milestones.
// ============================================================================

// Ensure badges array exists in data
function ensureBadgesData() {
  if (!data.badges) data.badges = [];
  if (!data.badgeDefinitions) {
    data.badgeDefinitions = [
      { id: 'perfect_attendance', name: 'Perfect Attendance', icon: 'fa-calendar-check', desc: 'Attend all school days in a term', color: '#059669' },
      { id: 'top_performer', name: 'Top Performer', icon: 'fa-trophy', desc: 'Score 90%+ average in a term', color: '#d97706' },
      { id: 'consistent', name: 'Consistent Achiever', icon: 'fa-chart-line', desc: 'Score 80%+ average across all terms', color: '#2563eb' },
      { id: 'homework_hero', name: 'Homework Hero', icon: 'fa-book', desc: 'Submit all assignments on time for a term', color: '#7c3aed' },
      { id: 'improvement', name: 'Most Improved', icon: 'fa-arrow-up', desc: 'Improve by 15%+ compared to previous term', color: '#0891b2' },
      { id: 'perfect_score', name: 'Perfect Score', icon: 'fa-star', desc: 'Score 100% in any subject assessment', color: '#dc2626' },
      { id: 'attendance_streak', name: 'Attendance Streak', icon: 'fa-fire', desc: 'Attend 30 consecutive school days', color: '#ea580c' },
      { id: 'helpful_peer', name: 'Helpful Peer', icon: 'fa-handshake', desc: 'Receive 10+ peer appreciation votes', color: '#16a34a' },
    ];
  }
}

// Award a badge to a student
function awardBadge(studentId, badgeDefId, silent) {
  ensureBadgesData();
  var existing = data.badges.find(function(b) { return b.studentId === studentId && b.badgeId === badgeDefId; });
  if (existing) return; // Already awarded
  var def = data.badgeDefinitions.find(function(d) { return d.id === badgeDefId; });
  if (!def) return;
  data.badges.push({
    id: 'BDG_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    studentId: studentId,
    badgeId: badgeDefId,
    awardedAt: new Date().toISOString(),
    awardedBy: (currentAdmin && currentAdmin.id) || (currentTeacher && currentTeacher.id) || 'system',
  });
  saveData();
  if (!silent) {
    var student = (data.students || []).find(function(s) { return s.id === studentId; });
    if (student) toast('🏆 ' + def.name + ' awarded to ' + student.name, 'success');
  }
}

// Auto-award badges based on data (runs once per session, silences individual toasts)
function autoAwardBadges() {
  try {
    if (sessionStorage.getItem('badgeAutoAwarded')) return;
    sessionStorage.setItem('badgeAutoAwarded', '1');
  } catch(e) {}

  ensureBadgesData();
  var awarded = [];

  (data.students || []).forEach(function(student) {
    var attendance = (data.attendance || []).filter(function(a) { return a.studentId === student.id && a.status === 'present'; });
    var totalDays = (data.attendance || []).filter(function(a) { return a.studentId === student.id; }).length;
    if (totalDays > 0 && attendance.length === totalDays && totalDays >= 5) {
      awardBadge(student.id, 'perfect_attendance', true);
      awarded.push('Perfect Attendance');
    }

    var results = (data.results || []).filter(function(r) { return r.studentId === student.id; });
    if (results.length >= 3) {
      var avg = results.reduce(function(a, r) { return a + r.score; }, 0) / results.length;
      if (avg >= 90) { awardBadge(student.id, 'top_performer', true); awarded.push('Top Performer'); }
      if (avg >= 80) { awardBadge(student.id, 'consistent', true); awarded.push('Consistent Achiever'); }
    }

    results.forEach(function(r) {
      if (r.score >= 100) { awardBadge(student.id, 'perfect_score', true); awarded.push('Perfect Score'); }
    });
  });

  if (awarded.length > 0) {
    var unique = awarded.filter(function(v, i, a) { return a.indexOf(v) === i; });
    setTimeout(function() {
      toast('🏆 ' + unique.length + ' badge(s) awarded this session', 'success');
    }, 1500);
  }
}

// Render badge wall for a student
function renderBadgeWall(studentId, containerId) {
  ensureBadgesData();
  var container = document.getElementById(containerId);
  if (!container) return;

  var studentBadges = data.badges.filter(function(b) { return b.studentId === studentId; });
  var html = '<div style="display:flex;flex-wrap:wrap;gap:10px;padding:8px 0;">';

  if (studentBadges.length === 0) {
    html += '<div class="empty-state" style="width:100%;padding:20px;"><i class="fas fa-medal"></i><p>No badges earned yet. Keep working hard!</p></div>';
  } else {
    studentBadges.forEach(function(b) {
      var def = data.badgeDefinitions.find(function(d) { return d.id === b.badgeId; });
      if (!def) return;
      html += '<div style="text-align:center;padding:10px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;min-width:100px;" title="' + htmlEscape(def.desc) + '">';
      html += '<div style="width:48px;height:48px;border-radius:50%;background:' + def.color + '20;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;border:2px solid ' + def.color + ';">';
      html += '<i class="fas ' + def.icon + '" style="font-size:20px;color:' + def.color + ';"></i></div>';
      html += '<div style="font-size:12px;font-weight:600;">' + htmlEscape(def.name) + '</div>';
      html += '<div style="font-size:10px;color:var(--text-light);">' + new Date(b.awardedAt).toLocaleDateString() + '</div>';
      html += '</div>';
    });
  }
  html += '</div>';

  // Badge definitions reference
  if (studentBadges.length > 0) {
    html += '<details style="margin-top:12px;font-size:12px;"><summary style="cursor:pointer;font-weight:600;color:var(--text-light);">All Available Badges</summary>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
    data.badgeDefinitions.forEach(function(def) {
      var earned = studentBadges.some(function(b) { return b.badgeId === def.id; });
      html += '<div style="text-align:center;padding:8px;opacity:' + (earned ? '1' : '0.4') + ';min-width:80px;">';
      html += '<i class="fas ' + def.icon + '" style="font-size:16px;color:' + def.color + ';"></i>';
      html += '<div style="font-size:10px;margin-top:2px;">' + htmlEscape(def.name) + '</div>';
      html += '</div>';
    });
    html += '</div></details>';
  }

  container.innerHTML = html;
}

// ============================================================================
// 3. UPGRADED PREDICTIVE ANALYTICS DASHBOARD
// Flags at-risk students based on attendance and grade trends.
// ============================================================================

function renderPredictiveAnalytics() {
  var container = document.getElementById('predictiveAnalyticsView');
  if (!container) return;

  var students = data.students || [];
  var results = data.results || [];
  var attendance = data.attendance || [];

  if (students.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>No student data available for analysis</p></div>';
    return;
  }

  // Class filter
  var filterClass = document.getElementById('paClassFilter') ? document.getElementById('paClassFilter').value : 'all';

  var analysis = students.map(function(s) {
    var sResults = results.filter(function(r) { return r.studentId === s.id; });
    var sAttendance = attendance.filter(function(a) { return a.studentId === s.id; });

    // Grade trend
    var avg = sResults.length > 0 ? sResults.reduce(function(a, r) { return a + r.score; }, 0) / sResults.length : 0;

    // Grade trajectory (compare first half vs second half of assessments)
    var sorted = sResults.slice().sort(function(a, b) { return new Date(a.date || 0) - new Date(b.date || 0); });
    var mid = Math.floor(sorted.length / 2);
    var firstHalf = sorted.slice(0, mid);
    var secondHalf = sorted.slice(mid);
    var firstAvg = firstHalf.length > 0 ? firstHalf.reduce(function(a, r) { return a + r.score; }, 0) / firstHalf.length : 0;
    var secondAvg = secondHalf.length > 0 ? secondHalf.reduce(function(a, r) { return a + r.score; }, 0) / secondHalf.length : 0;
    var trend = secondAvg - firstAvg;
    var trendLabel = trend > 5 ? 'Improving' : trend < -5 ? 'Declining' : 'Stable';

    // Attendance rate
    var present = sAttendance.filter(function(a) { return a.status === 'present'; }).length;
    var attPct = sAttendance.length > 0 ? (present / sAttendance.length * 100) : 100;

    // Risk factors
    var factors = [];
    if (avg < 50) factors.push('Low average grade (' + avg.toFixed(0) + '%)');
    if (trend < -10) factors.push('Grade declining (' + trend.toFixed(0) + '% change)');
    if (attPct < 75) factors.push('Low attendance (' + attPct.toFixed(0) + '%)');
    if (attPct < 50) factors.push('Critical attendance (' + attPct.toFixed(0) + '%)');
    if (sResults.length < 3) factors.push('Insufficient assessment data');

    var riskLevel = 0;
    if (avg < 40 || attPct < 50) riskLevel = 3;
    else if (avg < 50 || attPct < 75 || trend < -10) riskLevel = 2;
    else if (avg < 60 || attPct < 85) riskLevel = 1;

    return {
      studentId: s.id,
      name: s.name,
      class: s.class,
      avg: avg,
      trend: trendLabel,
      attPct: attPct,
      riskLevel: riskLevel,
      factors: factors,
    };
  });

  // Apply class filter
  var filtered = filterClass === 'all' ? analysis : analysis.filter(function(a) { return a.class === filterClass; });

  // Build class dropdown
  var classMap = {};
  students.forEach(function(s) { classMap[s.class] = true; });
  var classList = Object.keys(classMap).sort();

  filtered.sort(function(a, b) { return b.riskLevel - a.riskLevel; });
  var atRisk = filtered.filter(function(a) { return a.riskLevel >= 2; });
  var warning = filtered.filter(function(a) { return a.riskLevel === 1; });
  var onTrack = filtered.filter(function(a) { return a.riskLevel === 0; });

  var html = '<div class="sa-section"><h3><i class="fas fa-chart-bar"></i> Predictive Performance Dashboard</h3>';

  // Class filter dropdown
  html += '<div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:16px;"><div class="form-group" style="margin:0;"><label style="font-size:13px;">Class</label><select id="paClassFilter" onchange="renderPredictiveAnalytics()" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;"><option value="all">All Classes</option>';
  classList.forEach(function(c) {
    html += '<option value="' + c + '"' + (c === filterClass ? ' selected' : '') + '>' + c + '</option>';
  });
  html += '</select></div></div>';

  // Summary stats
  html += '<div class="sa-stats-grid" style="margin-bottom:16px;">';
  html += '<div class="sa-stat-card"><div class="sa-stat-icon" style="background:#fee2e2;color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div><div><div class="sa-stat-value">' + atRisk.length + '</div><div class="sa-stat-label">At Risk</div></div></div>';
  html += '<div class="sa-stat-card"><div class="sa-stat-icon" style="background:#fef3c7;color:#d97706;"><i class="fas fa-exclamation-circle"></i></div><div><div class="sa-stat-value">' + warning.length + '</div><div class="sa-stat-label">Warning</div></div></div>';
  html += '<div class="sa-stat-card"><div class="sa-stat-icon" style="background:#d1fae5;color:#059669;"><i class="fas fa-check-circle"></i></div><div><div class="sa-stat-value">' + onTrack.length + '</div><div class="sa-stat-label">On Track</div></div></div>';
  html += '<div class="sa-stat-card"><div class="sa-stat-icon" style="background:#dbeafe;color:#2563eb;"><i class="fas fa-users"></i></div><div><div class="sa-stat-value">' + analysis.length + '</div><div class="sa-stat-label">Total Students</div></div></div>';
  html += '</div>';

  // At-risk students table
  if (atRisk.length > 0) {
    html += '<h4 style="font-size:15px;margin-bottom:8px;color:#dc2626;"><i class="fas fa-flag"></i> At-Risk Students — Requires Intervention</h4>';
    html += '<table class="table"><thead><tr><th>Student</th><th>Class</th><th>Average</th><th>Trend</th><th>Attendance</th><th>Risk Factors</th><th>Action</th></tr></thead><tbody>';
    atRisk.forEach(function(a) {
      html += '<tr><td><strong>' + htmlEscape(a.name) + '</strong></td><td>' + htmlEscape(a.class) + '</td><td>' + a.avg.toFixed(0) + '%</td><td>' + a.trend + '</td><td>' + a.attPct.toFixed(0) + '%</td><td style="max-width:220px;font-size:12px;">' + a.factors.join('; ') + '</td><td><button class="btn btn-sm btn-primary" onclick="showRiskDetail(\'' + a.studentId + '\')"><i class="fas fa-search"></i> Analyze</button></td></tr>';
    });
    html += '</tbody></table>';
  }

  // Warning students table
  if (warning.length > 0) {
    html += '<h4 style="font-size:15px;margin:16px 0 8px;color:#d97706;"><i class="fas fa-exclamation"></i> Needs Attention</h4>';
    html += '<table class="table"><thead><tr><th>Student</th><th>Class</th><th>Average</th><th>Trend</th><th>Attendance</th></tr></thead><tbody>';
    warning.forEach(function(a) {
      html += '<tr><td><strong>' + htmlEscape(a.name) + '</strong></td><td>' + htmlEscape(a.class) + '</td><td>' + a.avg.toFixed(0) + '%</td><td>' + a.trend + '</td><td>' + a.attPct.toFixed(0) + '%</td></tr>';
    });
    html += '</tbody></table>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// Show risk detail modal
function showRiskDetail(studentId) {
  var student = (data.students || []).find(function(s) { return s.id === studentId; });
  if (!student) { toast('Student not found', 'error'); return; }
  var results = (data.results || []).filter(function(r) { return r.studentId === studentId; });
  var attendance = (data.attendance || []).filter(function(a) { return a.studentId === studentId; });

  var html = '<div class="sa-section"><h3><i class="fas fa-chart-bar"></i> Detailed Analysis: ' + htmlEscape(student.name) + '</h3>';

  // Grade chart
  html += '<h4>Grade Trend</h4><div style="display:flex;gap:4px;align-items:flex-end;min-height:120px;padding:12px 0;">';
  var sorted = results.sort(function(a, b) { return new Date(a.date || 0) - new Date(b.date || 0); });
  sorted.forEach(function(r) {
    var h = Math.max(20, r.score * 1.2);
    html += '<div style="flex:1;text-align:center;"><div style="height:' + h + 'px;background:' + (r.score >= 50 ? '#059669' : '#dc2626') + ';border-radius:4px 4px 0 0;min-width:20px;"></div><div style="font-size:10px;margin-top:2px;">' + r.score + '</div></div>';
  });
  html += '</div>';

  // Attendance summary
  var present = attendance.filter(function(a) { return a.status === 'present'; }).length;
  html += '<h4>Attendance: ' + present + '/' + attendance.length + ' (' + (attendance.length > 0 ? (present / attendance.length * 100).toFixed(0) : 0) + '%)</h4>';

  // Badges earned
  html += '<h4>Badges Earned</h4><div id="riskBadgeWall_' + studentId + '"></div>';

  // AI Learning Path button
  html += '<div class="modal-actions" style="margin-top:16px;"><button class="btn btn-primary" onclick="closeModal();renderPersonalizedLearning(\'' + studentId + '\')"><i class="fas fa-robot"></i> View AI Learning Path</button><button class="btn btn-outline" onclick="closeModal()">Close</button></div>';
  html += '</div>';

  openModal(html);
  renderBadgeWall(studentId, 'riskBadgeWall_' + studentId);
}

// ============================================================================
// 4. UPGRADED TIMETABLE GENERATOR (conflict resolution)
// ============================================================================

function upgradeTimetableGenerator() {
  // Patches renderTimetableAdmin to run conflict detection after each render.
  if (typeof renderTimetableAdmin !== 'function') return;

  var _origRender = renderTimetableAdmin;
  renderTimetableAdmin = function() {
    _origRender();
    checkTimetableConflicts();
  };
}

function checkTimetableConflicts() {
  var timetable = data.timetables || [];
  var conflicts = [];

  var teacherSlots = {};
  timetable.forEach(function(t) {
    var key = t.teacher + '|' + t.day + '|' + t.time;
    if (teacherSlots[key]) conflicts.push({ type: 'Teacher Conflict', teacher: t.teacher, day: t.day, time: t.time, class1: teacherSlots[key].class, class2: t.class });
    else teacherSlots[key] = t;
  });

  var roomSlots = {};
  timetable.forEach(function(t) {
    var key = t.room + '|' + t.day + '|' + t.time;
    if (roomSlots[key]) conflicts.push({ type: 'Room Conflict', room: t.room, day: t.day, time: t.time, class1: roomSlots[key].class, class2: t.class });
    else roomSlots[key] = t;
  });

  if (conflicts.length > 0) {
    var msg = '⚠ ' + conflicts.length + ' conflict(s) detected:';
    conflicts.forEach(function(c) {
      msg += '\n• ' + c.type + ': ' + (c.teacher || c.room) + ' on ' + c.day + ' at ' + c.time;
    });
    toast(msg, 'warning');
  } else if (timetable.length > 0) {
    toast('Timetable has no conflicts ✓', 'success');
  }
}

// ============================================================================
// 5. UPGRADE CHAT — Portal-wide chat accessible from admin/teacher/student
// ============================================================================

function renderPortalChat() {
  var container = document.getElementById('portalChatView');
  if (!container) return;

  var user = currentAdmin || currentTeacher || currentStudent || currentParent;
  if (!user) { container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Please log in to access chat</p></div>'; return; }

  var userType = currentAdmin ? 'admin' : currentTeacher ? 'teacher' : currentStudent ? 'student' : 'parent';
  var rooms = data.chatRooms || [];

  var html = '<div class="sa-section"><h3><i class="fas fa-comments"></i> School Community Chat</h3>';
  html += '<div style="display:flex;gap:16px;">';

  // Room list
  html += '<div style="width:200px;flex-shrink:0;">';
  html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-light);">Rooms</div>';
  rooms.forEach(function(r) {
    var isActive = currentChatRoom && currentChatRoom.id === r.id;
    html += '<div style="padding:8px 12px;background:' + (isActive ? '#dbeafe' : '#f8fafc') + ';border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:13px;" onclick="switchChatRoom(\'' + r.id + '\')">';
    html += '<i class="fas fa-hashtag" style="color:var(--text-light);margin-right:6px;"></i>' + htmlEscape(r.name);
    html += '</div>';
  });
  html += '<button class="btn btn-sm btn-outline" style="width:100%;margin-top:8px;" onclick="showCreateChatRoom()"><i class="fas fa-plus"></i> New Room</button>';
  html += '</div>';

  // Chat area
  html += '<div style="flex:1;min-width:0;">';
  if (currentChatRoom) {
    html += '<div style="font-weight:600;font-size:14px;margin-bottom:8px;"># ' + htmlEscape(currentChatRoom.name) + '</div>';
    html += '<div id="portalChatMessages" style="background:#f8fafc;border-radius:8px;padding:12px;min-height:300px;max-height:400px;overflow-y:auto;border:1px solid #e2e8f0;">';
    var msgs = (data.chatMessages || []).filter(function(m) { return m.roomId === currentChatRoom.id; }).slice(-50);
    if (msgs.length === 0) {
      html += '<div class="empty-state" style="padding:40px 0;"><i class="fas fa-comment-dots"></i><p>No messages yet. Start the conversation!</p></div>';
    } else {
      msgs.forEach(function(m) {
        var isMe = m.userId === user.id || m.sender === user.name;
        html += '<div style="display:flex;gap:8px;margin-bottom:8px;' + (isMe ? 'flex-direction:row-reverse;' : '') + '">';
        html += '<div style="max-width:70%;background:' + (isMe ? '#2563eb' : '#fff') + ';color:' + (isMe ? '#fff' : '#1a202c') + ';padding:8px 12px;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">';
        html += '<div style="font-size:11px;font-weight:600;margin-bottom:2px;">' + htmlEscape(m.sender || m.userId) + '</div>';
        html += '<div style="font-size:13px;">' + htmlEscape(m.content || m.text || '') + '</div>';
        html += '<div style="font-size:10px;opacity:0.6;margin-top:2px;">' + new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString() + '</div>';
        html += '</div></div>';
      });
    }
    html += '</div>';
    // Chat input
    html += '<div style="display:flex;gap:8px;margin-top:8px;">';
    html += '<input type="text" id="portalChatInput" placeholder="Type a message..." style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;" onkeydown="if(event.key===\'Enter\')sendPortalChat()">';
    html += '<button class="btn btn-primary" onclick="sendPortalChat()"><i class="fas fa-paper-plane"></i></button>';
    html += '</div>';
  } else {
    html += '<div class="empty-state"><i class="fas fa-comments"></i><p>Select a room to start chatting</p></div>';
  }
  html += '</div></div></div>';

  container.innerHTML = html;
}

function sendPortalChat() {
  var input = document.getElementById('portalChatInput');
  if (!input || !input.value.trim() || !currentChatRoom) return;
  var user = currentAdmin || currentTeacher || currentStudent || currentParent;
  if (!user) return;
  if (!data.chatMessages) data.chatMessages = [];
  data.chatMessages.push({
    id: 'MSG_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    roomId: currentChatRoom.id,
    userId: user.id || user.name,
    sender: user.name,
    content: input.value.trim(),
    timestamp: new Date().toISOString(),
  });
  input.value = '';
  saveData();
  renderPortalChat();
  // Scroll to bottom
  var msgs = document.getElementById('portalChatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function switchChatRoom(roomId) {
  currentChatRoom = (data.chatRooms || []).find(function(r) { return r.id === roomId; }) || null;
  renderPortalChat();
}

function showCreateChatRoom() {
  openModal('<h3><i class="fas fa-plus-circle"></i> Create Chat Room</h3>'
    + '<div class="form-group" style="margin-top:12px;"><label>Room Name</label><input type="text" id="newChatRoomName" placeholder="e.g. Grade 10 Discussion"></div>'
    + '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-success" onclick="createChatRoom()"><i class="fas fa-check"></i> Create</button></div>');
}

function createChatRoom() {
  var name = document.getElementById('newChatRoomName');
  if (!name || !name.value.trim()) { toast('Please enter a room name', 'error'); return; }
  if (!data.chatRooms) data.chatRooms = [];
  data.chatRooms.push({
    id: 'room_' + Date.now(),
    name: name.value.trim(),
    createdBy: (currentAdmin && currentAdmin.id) || (currentTeacher && currentTeacher.id) || 'system',
    createdAt: new Date().toISOString(),
    pinned: false,
  });
  saveData();
  closeModal();
  renderPortalChat();
  toast('Room created', 'success');
}

// ============================================================================
// INIT — runs on DOMContentLoaded to patch and activate upgrades
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  // Upgrade timetable generator with conflict detection
  upgradeTimetableGenerator();

  // Run auto badge award
  setTimeout(function() {
    if (typeof data !== 'undefined' && data) autoAwardBadges();
  }, 1000);

  // Add AI learning nav item to student/teacher panels when they render
  var observer = new MutationObserver(function() {
    addAILearningButton();
  });
  var target = document.getElementById('studentPage') || document.getElementById('teacherPage');
  if (target) observer.observe(target, { childList: true, subtree: true });
});
