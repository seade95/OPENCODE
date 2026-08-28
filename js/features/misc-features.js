// EduVerse - misc features module
// Extracted from features.js

// ===== GRADEBOOK =====
function renderGradebookAdmin() {
  var gv = document.getElementById('gradebookView'); if (!gv) return;
  var results = data.results || [];
  var cat = data.cat || [];
  var students = data.students || [];
  if (!results.length && !cat.length) {
    gv.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No scoresheet data yet. Add Exam Results or CAT scores first.</p></div>';
    return;
  }
  // Build a map of student-subject -> { catAvg, examScore }
  var scoreMap = {};
  // CAT: average of test1/test2/test3, scaled to 100
  cat.forEach(function(c) {
    var key = c.studentId + '|' + c.subject;
    if (!scoreMap[key]) scoreMap[key] = { studentId: c.studentId, subject: c.subject, catAvg: 0, examScore: null };
    var avg = (c.test1 + c.test2 + c.test3) / 3;
    scoreMap[key].catAvg = Math.round((avg / 20) * 100);
  });
  // Exam Results
  results.forEach(function(r) {
    var key = r.studentId + '|' + r.subject;
    if (!scoreMap[key]) scoreMap[key] = { studentId: r.studentId, subject: r.subject, catAvg: 0, examScore: null };
    scoreMap[key].examScore = r.score;
  });
  var entries = Object.values(scoreMap).sort(function(a, b) {
    var sa = (students.find(function(s) { return s.id === a.studentId; }) || {}).name || '';
    var sb = (students.find(function(s) { return s.id === b.studentId; }) || {}).name || '';
    return sa.localeCompare(sb) || a.subject.localeCompare(b.subject);
  });
  var getGrade = function(score) {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };
  // Compute per-student overall averages and rank them
  var studentTotals = {};
  entries.forEach(function(e) {
    if (e.examScore == null) return;
    var total = Math.round(e.catAvg * 0.4 + e.examScore * 0.6);
    if (!studentTotals[e.studentId]) studentTotals[e.studentId] = { total: 0, count: 0 };
    studentTotals[e.studentId].total += total;
    studentTotals[e.studentId].count++;
  });
  var studentAverages = Object.keys(studentTotals).map(function(id) {
    var avg = Math.round(studentTotals[id].total / studentTotals[id].count);
    var stu = students.find(function(s) { return s.id === id; });
    return { studentId: id, name: stu ? stu.name : id, average: avg };
  });
  studentAverages.sort(function(a, b) { return b.average - a.average; });
  // Assign positions (handle ties: same average = same position)
  var rankings = {};
  studentAverages.forEach(function(sa, i) {
    var pos = i > 0 && sa.average === studentAverages[i - 1].average ? rankings[studentAverages[i - 1].studentId] : (i + 1);
    rankings[sa.studentId] = pos;
  });
  var posSuffix = function(n) {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };
  var medalIcon = function(pos) {
    if (pos === 1) return '<i class="fas fa-trophy" style="color:gold;"></i> ';
    if (pos === 2) return '<i class="fas fa-medal" style="color:silver;"></i> ';
    if (pos === 3) return '<i class="fas fa-medal" style="color:#cd7f32;"></i> ';
    return '';
  };
  let html = '<div style="margin-bottom:12px;"><button class="btn btn-export btn-sm" onclick="exportTableToCSV(\'gradebookTable\',\'scoresheet\')"><i class="fas fa-download"></i> CSV</button></div>';
  // Ranking Summary
  if (studentAverages.length) {
    html += '<div class="card" style="margin-bottom:20px;padding:16px;"><h3 style="margin-bottom:12px;"><i class="fas fa-list-ol"></i> Student Rankings</h3><div class="table-responsive"><table><thead><tr><th>Position</th><th>Student</th><th>Overall %</th><th>Grade</th></tr></thead><tbody>';
    studentAverages.forEach(function(sa) {
      var pos = rankings[sa.studentId];
      var grade = getGrade(sa.average);
      var bg = pos === 1 ? '#fffff0' : pos === 2 ? '#f7fafc' : pos === 3 ? '#fffaf0' : '';
      html += '<tr style="' + (bg ? 'background:' + bg + ';' : '') + '"><td style="font-weight:700;font-size:15px;">' + medalIcon(pos) + pos + posSuffix(pos) + '</td><td>' + htmlEscape(sa.name) + '</td><td><strong>' + sa.average + '%</strong></td><td><span class="badge" style="background:' + (grade === 'A' ? '#c6f6d5' : grade === 'B' ? '#fefcbf' : grade === 'F' ? '#fed7d7' : '#e2e8f0') + ';color:' + (grade === 'A' ? '#22543d' : grade === 'B' ? '#744210' : grade === 'F' ? '#9b2c2c' : '#2d3748') + ';">' + grade + '</span></td></tr>';
    });
    html += '</tbody></table></div></div>';
  }
  // Detailed Scoresheet
  html += '<div class="card" style="padding:16px;"><h3 style="margin-bottom:12px;"><i class="fas fa-file-alt"></i> Detailed Subject Scores</h3><div class="table-responsive"><table id="gradebookTable"><thead><tr><th>Student</th><th>Subject</th><th>CAT /100</th><th>Exam /100</th><th>Total /100</th><th>Grade</th><th>Overall %</th><th>Position</th></tr></thead><tbody>';
  var totals = { cat: 0, exam: 0, total: 0, count: 0 };
  entries.forEach(function(e) {
    var stu = students.find(function(s) { return s.id === e.studentId; });
    var name = stu ? htmlEscape(stu.name) : htmlEscape(e.studentId);
    var catScore = e.catAvg;
    var examScore = e.examScore != null ? e.examScore : '-';
    var total, grade;
    if (e.examScore != null) {
      total = Math.round(catScore * 0.4 + e.examScore * 0.6);
      grade = getGrade(total);
      totals.cat += catScore; totals.exam += e.examScore; totals.total += total; totals.count++;
    } else {
      total = '-'; grade = '-';
    }
    var catDisplay = catScore || '-';
    var overallPct = studentTotals[e.studentId] ? Math.round(studentTotals[e.studentId].total / studentTotals[e.studentId].count) : '-';
    var pos = rankings[e.studentId] || '-';
    html += '<tr><td>' + name + '</td><td>' + htmlEscape(e.subject) + '</td><td>' + catDisplay + '</td><td>' + examScore + '</td><td><strong>' + total + '</strong></td><td><span class="badge" style="background:' + (grade === 'A' ? '#c6f6d5' : grade === 'B' ? '#fefcbf' : grade === 'F' ? '#fed7d7' : '#e2e8f0') + ';color:' + (grade === 'A' ? '#22543d' : grade === 'B' ? '#744210' : grade === 'F' ? '#9b2c2c' : '#2d3748') + ';">' + grade + '</span></td><td>' + overallPct + '%</td><td style="font-weight:600;">' + medalIcon(pos) + pos + posSuffix(pos) + '</td></tr>';
  });
  if (totals.count) {
    var avgCat = Math.round(totals.cat / totals.count);
    var avgExam = Math.round(totals.exam / totals.count);
    var avgTotal = Math.round(totals.total / totals.count);
    html += '<tr style="font-weight:700;background:var(--primary);color:white;"><td colspan="2">Average</td><td>' + avgCat + '</td><td>' + avgExam + '</td><td>' + avgTotal + '</td><td>' + getGrade(avgTotal) + '</td><td></td><td></td></tr>';
  }
  html += '</tbody></table></div></div>';
  gv.innerHTML = html;
}


// ===== MESSAGING =====
function renderMessages(containerId, filter) {
  let msgs = data.messages;
  if (filter) {
    msgs = msgs.filter(m => m.to === filter || m.from === filter);
  }
  msgs.sort((a,b) => new Date(b.date) - new Date(a.date));
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!msgs.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>No messages</p></div>';
    return;
  }
  container.innerHTML = '<div class="msg-list">' + msgs.map(m => `
    <div class="msg-item ${m.read ? '' : 'unread'}" onclick="viewMessage('${m.id}')">
      <div class="msg-header">
        <span class="msg-sender">${htmlEscape(m.from)}</span>
        <span class="msg-date">${htmlEscape(m.date)}</span>
      </div>
      <div class="msg-subject">${htmlEscape(m.subject)}</div>
      <div class="msg-preview">${htmlEscape(m.body.substring(0, 80))}${m.body.length > 80 ? '...' : ''}</div>
    </div>
  `).join('') + '</div>';
}

function viewMessage(id) {
  const m = data.messages.find(msg => msg.id === id);
  if (!m) return;
  m.read = true;
  saveData();
  openModal(`
    <h3><i class="fas fa-envelope-open"></i> ${htmlEscape(m.subject)}</h3>
    <div style="margin-bottom:16px;font-size:14px;">
      <div><strong>From:</strong> ${htmlEscape(m.from)}</div>
      <div><strong>To:</strong> ${htmlEscape(m.to)}</div>
      <div><strong>Date:</strong> ${htmlEscape(m.date)}</div>
    </div>
    <div style="padding:16px;background:#f7fafc;border-radius:8px;font-size:14px;line-height:1.7;white-space:pre-wrap;">${htmlEscape(m.body)}</div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="closeModal();showComposeMessage('${m.from}','${m.to}')"><i class="fas fa-reply"></i> Reply</button>
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Close</button>
    </div>
  `);
  renderMessages('adminMessages', 'Admin');
  if (currentTeacher) renderMessages('tchMessages', currentTeacher.id);
  if (currentStudent) renderMessages('stuMessages', currentStudent.id);
}

function showComposeMessage(replyTo, replyToId) {
  const isAdmin = !currentTeacher && !currentStudent;
  const teacherOpts = data.teachers.map(t => `<option value="${t.id}" ${replyToId === t.id ? 'selected' : ''}>${htmlEscape(t.name)} (${t.id})</option>`).join('');
  const studentOpts = data.students.map(s => `<option value="${s.id}" ${replyToId === s.id ? 'selected' : ''}>${htmlEscape(s.name)} (${s.id})</option>`).join('');
  openModal(`
    <h3><i class="fas fa-paper-plane"></i> Compose Message</h3>
    <div class="form-grid">
      <div class="form-group"><label>To</label>
        <select id="fMsgTo" ${!isAdmin ? 'style="background:#f7fafc;" readonly' : ''}>
          ${isAdmin ? `<optgroup label="Teachers">${teacherOpts}</optgroup><optgroup label="Students">${studentOpts}</optgroup>` : `<option value="">Select recipient</option>${teacherOpts}${studentOpts}`}
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1;"><label>Subject</label><input type="text" id="fMsgSubject" placeholder="Message subject"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Message</label><textarea id="fMsgBody" rows="5" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Type your message..."></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="sendMessage()"><i class="fas fa-paper-plane"></i> Send</button>
    </div>
  `);
}

function sendMessage() {
  const to = (document.getElementById('fMsgTo')?.value ?? '');
  const subject = (document.getElementById('fMsgSubject')?.value ?? '').trim();
  const body = (document.getElementById('fMsgBody')?.value ?? '').trim();
  if (!subject || !body) { toast('Please fill subject and message', 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  let from = 'Admin';
  if (currentTeacher) from = currentTeacher.id;
  else if (currentStudent) from = currentStudent.id;
  data.messages.push({ id: genId('MSG'), from, to, subject, body, date: today, read: false });
  saveData();
  logActivity(`Sent message to ${to}: ${subject}`);
  closeModal();
  if (currentTeacher) renderMessages('tchMessages', currentTeacher.id);
  else if (currentStudent) renderMessages('stuMessages', currentStudent.id);
  else renderMessages('adminMessages', 'Admin');
  toast('Message sent');
}


// ===== EXAMS =====
function renderExamsAdmin() {
  const list = data.exams.sort((a,b) => new Date(a.date) - new Date(b.date));
  var tbody = document.getElementById('examsTableBody'); if (!tbody) return;
  var empty = document.getElementById('examsEmpty');
  if (list.length) {
    tbody.innerHTML = list.map(e => `<tr>
      <td><strong>${htmlEscape(e.subject)}</strong></td>
      <td>${htmlEscape(e.class)}</td>
      <td>${htmlEscape(e.date)}</td>
      <td>${htmlEscape(e.startTime)} - ${htmlEscape(e.endTime)}</td>
      <td>${htmlEscape(e.term)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteExam('${e.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
    if (empty) empty.style.display = 'none';
  } else { tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; }
}

function showAddExamModal() {
  const classOpts = [...new Set(data.students.map(s => s.class))].map(c => `<option value="${htmlEscape(c)}">${htmlEscape(c)}</option>`).join('');
  const subjectOpts = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art'].map(s => `<option value="${s}">${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Schedule Exam</h3>
    <div class="form-grid">
      <div class="form-group"><label>Class</label><select id="fExamClass">${classOpts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fExamSubject">${subjectOpts}</select></div>
      <div class="form-group"><label>Date</label><input type="date" id="fExamDate"></div>
      <div class="form-group"><label>Start Time</label><input type="time" id="fExamStart" value="09:00"></div>
      <div class="form-group"><label>End Time</label><input type="time" id="fExamEnd" value="11:00"></div>
      <div class="form-group"><label>Term</label><input type="text" id="fExamTerm" value="Term 2 2026"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveExam()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveExam() {
  const cls = (document.getElementById('fExamClass')?.value ?? '');
  const subject = (document.getElementById('fExamSubject')?.value ?? '');
  const date = (document.getElementById('fExamDate')?.value ?? '');
  const startTime = (document.getElementById('fExamStart')?.value ?? '');
  const endTime = (document.getElementById('fExamEnd')?.value ?? '');
  const term = (document.getElementById('fExamTerm')?.value ?? '').trim();
  if (!date || !subject) { toast('Please fill all fields', 'error'); return; }
  data.exams.push({ id: genId('EXM'), class: cls, subject, date, startTime, endTime, term });
  saveData();
  logActivity(`Scheduled exam: ${subject} for ${cls} on ${date}`);
  closeModal();
  renderExamsAdmin();
  toast('Exam scheduled');
}

function deleteExam(id) {
  if (!confirm('Delete this exam?')) return;
  data.exams = data.exams.filter(e => e.id !== id);
  saveData();
  renderExamsAdmin();
  toast('Exam deleted');
}

function renderExamsStudent() {
  if (!currentStudent) return;
  const myExams = data.exams.filter(e => e.class === currentStudent.class).sort((a,b) => new Date(a.date) - new Date(b.date));
  var tbody = document.getElementById('stuExamsTableBody'); if (!tbody) return;
  var empty = document.getElementById('stuExamsEmpty');
  if (myExams.length) {
    tbody.innerHTML = myExams.map(e => `<tr>
      <td><strong>${htmlEscape(e.subject)}</strong></td>
      <td>${htmlEscape(e.date)}</td>
      <td>${htmlEscape(e.startTime)} - ${htmlEscape(e.endTime)}</td>
      <td><span class="badge" style="background:${new Date(e.date) < new Date() ? '#fed7d7' : '#c6f6d5'};color:${new Date(e.date) < new Date() ? '#9b2c2c' : '#22543d'};">${new Date(e.date) < new Date() ? 'Completed' : 'Upcoming'}</span></td>
    </tr>`).join('');
    if (empty) empty.style.display = 'none';
  } else { tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; }
}

function renderExamsTeacher() {
  if (!currentTeacher) return;
  const tName = currentTeacher.name;
  const myExams = data.exams.filter(e => data.timetables.some(t => t.teacher === tName && t.subject === e.subject)).sort((a,b) => new Date(a.date) - new Date(b.date));
  var tbody = document.getElementById('tchExamsTableBody'); if (!tbody) return;
  var empty = document.getElementById('tchExamsEmpty');
  if (myExams.length) {
    tbody.innerHTML = myExams.map(e => `<tr>
      <td><strong>${htmlEscape(e.subject)}</strong></td>
      <td>${htmlEscape(e.class)}</td>
      <td>${htmlEscape(e.date)}</td>
      <td>${htmlEscape(e.startTime)} - ${htmlEscape(e.endTime)}</td>
    </tr>`).join('');
    if (empty) empty.style.display = 'none';
  } else { tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; }
}


// ===== PARENT PORTAL =====
function showAlumniPortal() {
  showStudentLogin();
  setTimeout(function() {
    toast('Alumni features are available after logging into the Student Portal', 'info');
  }, 300);
}

function showParentLogin() {
  var lp = document.getElementById('landing-page'); if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var plp = document.getElementById('parentLoginPage'); if (plp) plp.classList.add('active');
  if (typeof initLanguageSelector === 'function') initLanguageSelector('parentLangSelector');
  try { if (localStorage.getItem('demoMode') === 'true') { var _em=document.getElementById('parentLoginEmail'),_pw=document.getElementById('parentLoginPass'),_ph=document.getElementById('parentDemoHint'); if(_em)_em.value='robert@example.com'; if(_pw)_pw.value='parent123'; if(_ph)_ph.style.display='block'; } } catch(e){}
}

function parentLogin() {
  const email = (document.getElementById('parentLoginEmail')?.value ?? '').trim();
  const pass = (document.getElementById('parentLoginPass')?.value ?? '').trim();
  if (!email || !pass) { toast('Please enter both email and password', 'error'); return; }
  if (!isValidEmail(email)) { toast('Invalid email format', 'error'); return; }
  if (!isValidPassword(pass)) { toast('Password must be at least 6 characters', 'error'); return; }
  const parent = (data.parents || []).find(p => p.email === email && p.password === pass);
  if (!parent) {
    toast('Invalid email or password', 'error');
    return;
  }
  currentParent = parent;
  if (typeof setSession === 'function') setSession('parent', parent);
  if (typeof resetSessionActivity === 'function') resetSessionActivity();
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var pp = document.getElementById('parentPage'); if (pp) pp.classList.add('active');
  renderParentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function parentLogout() {
  currentParent = null;
  if (typeof clearSession === 'function') clearSession('parent');
  var ple = document.getElementById('parentLoginEmail'); if (ple) ple.value = '';
  var plp = document.getElementById('parentLoginPass'); if (plp) plp.value = '';
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var plg = document.getElementById('parentLoginPage'); if (plg) plg.classList.add('active');
}

currentParent = null;

function renderParentPortal() {
  if (!currentParent) return;
  var pnd = document.getElementById('parentNameDisplay'); if (pnd) pnd.textContent = currentParent.name;
  const children = data.students.filter(s => (currentParent.studentIds || []).includes(s.id));
  var container = document.getElementById('parentChildrenList'); if (!container) return;
  // Show parent notifications
  const parentNotifs = (data.notifications || []).filter(n => n.to === currentParent.email && !n.read);
  let notifHtml = '';
  if (parentNotifs.length) {
    notifHtml = `<div class="card" style="margin-bottom:16px;border-left:4px solid var(--info);">
      <h4 style="font-weight:600;font-size:16px;margin-bottom:8px;"><i class="fas fa-bell" style="color:var(--info);"></i> Notifications</h4>
      ${parentNotifs.map(n => `<div style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px;"><i class="fas fa-info-circle" style="color:var(--info);font-size:12px;"></i> ${htmlEscape(n.message)} <span style="font-size:11px;color:var(--text-light);float:right;">${n.date}</span></div>`).join('')}
    </div>`;
  }
  if (children.length) {
    container.innerHTML = notifHtml + children.map(s => `
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h4 style="font-weight:600;font-size:18px;"><i class="fas fa-user-graduate" style="color:var(--accent);"></i> ${htmlEscape(s.name)}</h4>
          <span class="badge" style="background:#bee3f8;color:#2a4365;">${htmlEscape(s.class)}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
          <div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--primary);">${data.results.filter(r => r.studentId === s.id).length}</div>
            <div style="font-size:12px;color:var(--text-light);">Subjects</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--success);">${data.attendance.filter(a => a.studentId === s.id && a.status === 'present').length}</div>
            <div style="font-size:12px;color:var(--text-light);">Days Present</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--accent);">${data.assignments.filter(a => a.class === s.class).length}</div>
            <div style="font-size:12px;color:var(--text-light);">Assignments</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--info);">${data.activities.filter(a => a.participants.includes(s.id)).length}</div>
            <div style="font-size:12px;color:var(--text-light);">Activities</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:var(--accent);">${(function(){ var a = (data.hostelAllocations||[]).find(function(x){ return x.studentId === s.id && x.status === 'active'; }); if (!a) return '—'; var h = (data.hostels||[]).find(function(x){ return x.id === a.hostelId; }); return h ? h.name : '—'; })()}</div>
            <div style="font-size:12px;color:var(--text-light);">Hostel</div>
          </div>
        </div>
        <div style="margin-top:12px;">
          <button class="btn btn-sm btn-primary" onclick="viewChildDetails('${s.id}')"><i class="fas fa-eye"></i> View Full Details</button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No children linked to your account</p></div>';
  }
  if (typeof renderGalleryView === 'function') renderGalleryView('parentGalleryView');
  if (typeof renderESchoolView === 'function') renderESchoolView('parentESchoolView');
  if (typeof renderAcademicCalendarView === 'function') renderAcademicCalendarView('parentCalendarView');
  if (typeof renderSubscriptionBanner === 'function') renderSubscriptionBanner();
}


// ===== PROMOTION LIST — END OF THIRD TERM =====
function toBasicLabel(cls) {
  if (!cls) return cls;
  return cls.replace(/^Grade\s+(\d+)/, function(m, d) { return 'Basic ' + d; });
}

function getNextClass(currentClass) {
  if (!currentClass) return currentClass;
  var match = currentClass.match(/^(?:Grade|Basic)\s*(\d+)([A-Z]?)$/i);
  if (!match) return currentClass;
  var level = parseInt(match[1], 10);
  var stream = match[2] || '';
  var gradClass = (data.schoolProfile && data.schoolProfile.graduationClass) || 'Basic 6';
  var gradMatch = gradClass.match(/^Basic\s*(\d+)/i);
  var gradLevel = gradMatch ? parseInt(gradMatch[1], 10) : 6;
  if (level >= gradLevel) return 'Graduated';
  return 'Basic ' + (level + 1) + stream;
}

function renderPromotionList() {
  var container = document.getElementById('promotionListView');
  if (!container) return;
  var students = data.students || [];
  var results = data.results || [];
  if (!students.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No students registered</p></div>';
    return;
  }
  // Compute per-student cumulative scores across all terms
  var studentData = students.map(function(s) {
    var sResults = results.filter(function(r) { return r.studentId === s.id; });
    var subjects = {};
    sResults.forEach(function(r) {
      if (!subjects[r.subject]) subjects[r.subject] = [];
      subjects[r.subject].push(r.score);
    });
    // Average per subject (multiple entries across terms → average them)
    var subjectAvgs = Object.keys(subjects).map(function(subj) {
      var scores = subjects[subj];
      return Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);
    });
    var cumulativeAvg = subjectAvgs.length ? Math.round(subjectAvgs.reduce(function(a, b) { return a + b; }, 0) / subjectAvgs.length) : 0;
    var nextClass = getNextClass(s.class);
    var status = cumulativeAvg >= 50 ? 'Promoted' : cumulativeAvg >= 40 ? 'Probation' : 'Repeat';
    return { id: s.id, name: s.name, class: s.class, nextClass: nextClass, subjects: subjectAvgs.length, cumulativeAvg: cumulativeAvg, status: status };
  });
  // Sort by class then by cumulative average descending
  studentData.sort(function(a, b) {
    if (a.class !== b.class) return a.class.localeCompare(b.class);
    return b.cumulativeAvg - a.cumulativeAvg;
  });
  var html = '<div style="margin-bottom:12px;display:flex;gap:8px;align-items:center;"><span style="font-size:13px;color:var(--text-light);">Promotion threshold: ≥50</span><button class="btn btn-sm btn-success" onclick="applyPromotions()"><i class="fas fa-arrow-up"></i> Promote All Eligible</button></div>';
  html += '<div class="table-responsive"><table id="promotionTable"><thead><tr><th>Student</th><th>Current Class</th><th>Next Class</th><th>Subjects</th><th>Cumulative Avg</th><th>Status</th></tr></thead><tbody>';
  var counts = { promoted: 0, probation: 0, repeat: 0 };
  studentData.forEach(function(s) {
    counts.promoted += s.status === 'Promoted' ? 1 : 0;
    counts.probation += s.status === 'Probation' ? 1 : 0;
    counts.repeat += s.status === 'Repeat' ? 1 : 0;
    var statusColor = s.status === 'Promoted' ? '#c6f6d5' : s.status === 'Probation' ? '#fefcbf' : '#fed7d7';
    var statusTextColor = s.status === 'Promoted' ? '#22543d' : s.status === 'Probation' ? '#744210' : '#9b2c2c';
    html += '<tr><td><strong>' + htmlEscape(s.name) + '</strong></td><td>' + htmlEscape(toBasicLabel(s.class)) + '</td><td>' + htmlEscape(s.nextClass) + '</td><td>' + s.subjects + '</td><td><strong>' + s.cumulativeAvg + '%</strong></td><td><span class="badge" style="background:' + statusColor + ';color:' + statusTextColor + ';">' + s.status + '</span></td></tr>';
  });
  html += '</tbody></table></div>';
  // Summary cards
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;">';
  html += '<div style="background:#c6f6d5;color:#22543d;padding:16px;border-radius:8px;text-align:center;"><div style="font-size:28px;font-weight:800;">' + counts.promoted + '</div><div style="font-size:13px;">Promoted</div></div>';
  html += '<div style="background:#fefcbf;color:#744210;padding:16px;border-radius:8px;text-align:center;"><div style="font-size:28px;font-weight:800;">' + counts.probation + '</div><div style="font-size:13px;">Probation</div></div>';
  html += '<div style="background:#fed7d7;color:#9b2c2c;padding:16px;border-radius:8px;text-align:center;"><div style="font-size:28px;font-weight:800;">' + counts.repeat + '</div><div style="font-size:13px;">Repeat</div></div>';
  html += '</div>';
  container.innerHTML = html;
}

function applyPromotions() {
  if (!confirm('Promote all eligible students (avg ≥ 50) to the next class?')) return;
  var students = data.students || [];
  var results = data.results || [];
  var moved = 0;
  students.forEach(function(s) {
    var sResults = results.filter(function(r) { return r.studentId === s.id; });
    var subjects = {};
    sResults.forEach(function(r) {
      if (!subjects[r.subject]) subjects[r.subject] = [];
      subjects[r.subject].push(r.score);
    });
    var subjectAvgs = Object.keys(subjects).map(function(subj) {
      var scores = subjects[subj];
      return Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);
    });
    var avg = subjectAvgs.length ? Math.round(subjectAvgs.reduce(function(a, b) { return a + b; }, 0) / subjectAvgs.length) : 0;
    if (avg >= 50) {
      var next = getNextClass(s.class);
      if (next !== s.class && next !== 'Graduated') {
        s.class = next;
        moved++;
      }
    }
  });
  saveData();
  renderPromotionList();
  toast(moved + ' student(s) promoted successfully!');
}


// ===== E-SCHOOL — VIRTUAL CLASSES =====
function getVirtualClasses() { return data.virtualClasses || []; }

function renderESchoolAdmin() {
  var container = document.getElementById('eschoolAdminView');
  if (!container) return;
  var classes = getVirtualClasses().sort(function(a, b) { return a.date.localeCompare(b.date) || a.time.localeCompare(b.time); });
  var html = '<div style="margin-bottom:12px;"><button class="btn btn-primary btn-sm" onclick="showAddVirtualClassModal()"><i class="fas fa-plus"></i> Add Virtual Class</button></div>';
  if (!classes.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-video"></i><p>No virtual classes scheduled</p></div>';
    return;
  }
  var platformLabels = { zoom: 'Zoom', meet: 'Google Meet' };
  var platformColors = { zoom: '#dbeafe', meet: '#c6f6d5' };
  html += '<div class="table-responsive"><table id="eschoolTable"><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Topic</th><th>Platform</th><th>Instructor</th><th>Link</th><th>Actions</th></tr></thead><tbody>';
  classes.forEach(function(c) {
    var plat = platformLabels[c.platform] || c.platform;
    var color = platformColors[c.platform] || '#e2e8f0';
    html += '<tr><td style="font-weight:600;">' + htmlEscape(c.date) + '</td><td>' + htmlEscape(c.time) + '</td><td><strong>' + htmlEscape(c.title) + '</strong></td><td>' + htmlEscape(c.topic || '') + '</td><td><span class="badge" style="background:' + color + ';color:#1a202c;">' + htmlEscape(plat) + '</span></td><td>' + htmlEscape(c.teacherName || '') + '</td><td><a href="' + htmlEscape(c.link) + '" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-external-link-alt"></i> Join</a></td><td><button class="btn btn-sm btn-primary" onclick="showEditVirtualClassModal(\'' + c.id + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteVirtualClass(\'' + c.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function showAddVirtualClassModal() {
  openModal('<h3><i class="fas fa-video"></i> Schedule Virtual Class</h3><div class="form-grid"><div class="form-group"><label>Class Title</label><input type="text" id="fVcTitle" placeholder="e.g. Maths Revision"></div><div class="form-group"><label>Topic</label><input type="text" id="fVcTopic" placeholder="e.g. Algebra"></div><div class="form-group"><label>Date</label><input type="date" id="fVcDate"></div><div class="form-group"><label>Time</label><input type="time" id="fVcTime"></div><div class="form-group"><label>Platform</label><select id="fVcPlatform"><option value="zoom">Zoom</option><option value="meet">Google Meet</option></select></div><div class="form-group"><label>Meeting Link</label><input type="url" id="fVcLink" placeholder="https://zoom.us/j/..."></div><div class="form-group"><label>Instructor</label><input type="text" id="fVcTeacher" placeholder="e.g. Mr. Johnson"></div><div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fVcDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Session details..."></textarea></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveVirtualClass()"><i class="fas fa-save"></i> Save</button></div>');
}

function saveVirtualClass() {
  var title = document.getElementById('fVcTitle')?.value?.trim();
  var topic = document.getElementById('fVcTopic')?.value?.trim() || '';
  var date = document.getElementById('fVcDate')?.value;
  var time = document.getElementById('fVcTime')?.value;
  var platform = document.getElementById('fVcPlatform')?.value || 'zoom';
  var link = document.getElementById('fVcLink')?.value?.trim();
  var teacher = document.getElementById('fVcTeacher')?.value?.trim() || '';
  var desc = document.getElementById('fVcDesc')?.value?.trim() || '';
  if (!title || !date || !time || !link) { toast('Please fill in title, date, time, and meeting link', 'error'); return; }
  if (!data.virtualClasses) data.virtualClasses = [];
  data.virtualClasses.push({ id: genId('VCL'), title: title, topic: topic, date: date, time: time, platform: platform, link: link, teacherName: teacher, description: desc });
  saveData();
  logActivity('Scheduled virtual class: ' + title);
  closeModal();
  renderESchoolAdmin();
  toast('Virtual class scheduled');
}

function showEditVirtualClassModal(id) {
  var c = (data.virtualClasses || []).find(function(v) { return v.id === id; });
  if (!c) return;
  openModal('<h3><i class="fas fa-edit"></i> Edit Virtual Class</h3><div class="form-grid"><div class="form-group"><label>Class Title</label><input type="text" id="fVcTitle" value="' + htmlEscape(c.title) + '"></div><div class="form-group"><label>Topic</label><input type="text" id="fVcTopic" value="' + htmlEscape(c.topic || '') + '"></div><div class="form-group"><label>Date</label><input type="date" id="fVcDate" value="' + htmlEscape(c.date) + '"></div><div class="form-group"><label>Time</label><input type="time" id="fVcTime" value="' + htmlEscape(c.time) + '"></div><div class="form-group"><label>Platform</label><select id="fVcPlatform"><option value="zoom"' + (c.platform === 'zoom' ? ' selected' : '') + '>Zoom</option><option value="meet"' + (c.platform === 'meet' ? ' selected' : '') + '>Google Meet</option></select></div><div class="form-group"><label>Meeting Link</label><input type="url" id="fVcLink" value="' + htmlEscape(c.link) + '"></div><div class="form-group"><label>Instructor</label><input type="text" id="fVcTeacher" value="' + htmlEscape(c.teacherName || '') + '"></div><div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fVcDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;">' + htmlEscape(c.description || '') + '</textarea></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateVirtualClass(\'' + id + '\')"><i class="fas fa-save"></i> Update</button></div>');
}

function updateVirtualClass(id) {
  var c = (data.virtualClasses || []).find(function(v) { return v.id === id; });
  if (!c) return;
  c.title = document.getElementById('fVcTitle')?.value?.trim() || c.title;
  c.topic = document.getElementById('fVcTopic')?.value?.trim() || '';
  c.date = document.getElementById('fVcDate')?.value || c.date;
  c.time = document.getElementById('fVcTime')?.value || c.time;
  c.platform = document.getElementById('fVcPlatform')?.value || c.platform;
  c.link = document.getElementById('fVcLink')?.value?.trim() || c.link;
  c.teacherName = document.getElementById('fVcTeacher')?.value?.trim() || '';
  c.description = document.getElementById('fVcDesc')?.value?.trim() || '';
  saveData();
  logActivity('Updated virtual class: ' + c.title);
  closeModal();
  renderESchoolAdmin();
  toast('Virtual class updated');
}

function deleteVirtualClass(id) {
  if (!confirm('Delete this virtual class?')) return;
  data.virtualClasses = (data.virtualClasses || []).filter(function(v) { return v.id !== id; });
  saveData();
  renderESchoolAdmin();
  toast('Virtual class deleted');
}

// Shared read-only view for students, teachers, parents
function renderESchoolView(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var classes = getVirtualClasses().sort(function(a, b) { return a.date.localeCompare(b.date) || a.time.localeCompare(b.time); });
  var today = new Date().toISOString().split('T')[0];
  var upcoming = classes.filter(function(c) { return c.date >= today; });
  var past = classes.filter(function(c) { return c.date < today; });
  var platformLabels = { zoom: 'Zoom', meet: 'Google Meet' };
  var platformColors = { zoom: '#dbeafe', meet: '#c6f6d5' };
  if (!classes.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-video"></i><p>No virtual classes scheduled</p></div>';
    return;
  }
  var html = '';
  if (upcoming.length) {
    html += '<h4 style="margin:16px 0 8px;color:var(--success);"><i class="fas fa-calendar-day"></i> Upcoming Classes</h4>';
    html += '<div style="display:grid;gap:12px;">';
    upcoming.forEach(function(c) {
      var plat = platformLabels[c.platform] || c.platform;
      var color = platformColors[c.platform] || '#e2e8f0';
      html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
      html += '<div style="min-width:50px;text-align:center;"><div style="font-size:11px;text-transform:uppercase;color:var(--text-light);">' + htmlEscape(new Date(c.date).toLocaleString('en', { month: 'short' })) + '</div><div style="font-size:22px;font-weight:800;line-height:1.2;">' + new Date(c.date).getDate() + '</div></div>';
      html += '<div style="flex:1;min-width:180px;"><strong>' + htmlEscape(c.title) + '</strong><br><span style="font-size:13px;color:var(--text-light);">' + htmlEscape(c.time) + ' — ' + htmlEscape(c.teacherName || 'Instructor') + '</span></div>';
      html += '<span class="badge" style="background:' + color + ';color:#1a202c;">' + htmlEscape(plat) + '</span>';
      html += '<a href="' + htmlEscape(c.link) + '" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-video"></i> Join</a>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (past.length) {
    html += '<h4 style="margin:16px 0 8px;color:var(--text-light);"><i class="fas fa-history"></i> Past Classes</h4>';
    html += '<div style="display:grid;gap:12px;">';
    past.forEach(function(c) {
      var plat = platformLabels[c.platform] || c.platform;
      var color = platformColors[c.platform] || '#e2e8f0';
      html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;opacity:0.7;">';
      html += '<div style="min-width:50px;text-align:center;"><div style="font-size:11px;text-transform:uppercase;color:var(--text-light);">' + htmlEscape(new Date(c.date).toLocaleString('en', { month: 'short' })) + '</div><div style="font-size:22px;font-weight:800;line-height:1.2;">' + new Date(c.date).getDate() + '</div></div>';
      html += '<div style="flex:1;min-width:180px;"><strong>' + htmlEscape(c.title) + '</strong><br><span style="font-size:13px;color:var(--text-light);">' + htmlEscape(c.date) + ' ' + htmlEscape(c.time) + '</span></div>';
      html += '<span class="badge" style="background:' + color + ';color:#1a202c;">' + htmlEscape(plat) + '</span>';
      html += '<a href="' + htmlEscape(c.link) + '" target="_blank" class="btn btn-sm btn-outline" style="color:var(--text);border-color:#e2e8f0;"><i class="fas fa-external-link-alt"></i> Link</a>';
      html += '</div>';
    });
    html += '</div>';
  }
  container.innerHTML = html;
}


// ===== ASSIGNMENT SUBMISSIONS — WRITING + FILE UPLOAD =====
var _pendingSubmissionFiles = [];

function renderStudentAssignments() {
  var s = currentStudent;
  if (!s) return;
  var container = document.getElementById('stuAssignmentsGrid');
  var empty = document.getElementById('stuAssignmentsEmpty');
  var asns = (data.assignments || []).filter(function(a) { return a.class === s.class; }).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  if (!container) return;
  if (!asns.length) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  container.innerHTML = asns.map(function(a) {
    var sub = (data.submissions || []).find(function(x) { return x.assignmentId === a.id && x.studentId === s.id; });
    var overdue = new Date(a.dueDate) < new Date();
    var statusBadge = '';
    var actionBtn = '';
    if (sub) {
      if (sub.status === 'graded') {
        statusBadge = '<span class="badge" style="background:#c6f6d5;color:#22543d;">Graded: ' + sub.grade + '%</span>';
        actionBtn = '<button class="btn btn-sm btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="viewSubmission(\'' + sub.id + '\')"><i class="fas fa-eye"></i> View</button>';
      } else {
        statusBadge = '<span class="badge" style="background:#dbeafe;color:#1e40af;">Submitted</span>';
        actionBtn = '<button class="btn btn-sm btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="viewSubmission(\'' + sub.id + '\')"><i class="fas fa-eye"></i> View</button>';
      }
    } else {
      statusBadge = overdue ? '<span class="badge" style="background:#fed7d7;color:#9b2c2c;">Missed</span>' : '<span class="badge" style="background:#fefcbf;color:#744210;">Pending</span>';
      if (!overdue) actionBtn = '<button class="btn btn-sm btn-success" onclick="showSubmitAssignmentModal(\'' + a.id + '\')"><i class="fas fa-upload"></i> Submit</button>';
    }
    return '<div style="background:var(--card-bg);border-radius:var(--radius-sm);padding:20px;border:1px solid ' + (overdue && !sub ? '#fed7d7' : '#e2e8f0') + ';transition:var(--transition);"><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;flex-wrap:wrap;gap:6px;"><h4 style="font-weight:600;font-size:16px;">' + htmlEscape(a.title) + '</h4>' + statusBadge + '</div><p style="font-size:14px;color:var(--text);margin-bottom:12px;line-height:1.5;">' + htmlEscape(a.description) + '</p><div style="display:flex;gap:16px;font-size:13px;color:var(--text-light);margin-bottom:12px;"><span><i class="fas fa-calendar"></i> Due: ' + htmlEscape(a.dueDate) + '</span><span><i class="fas fa-clock"></i> Posted: ' + htmlEscape(a.createdAt) + '</span></div>' + (actionBtn ? '<div>' + actionBtn + '</div>' : '') + '</div>';
  }).join('');
}

function showSubmitAssignmentModal(assignmentId) {
  var a = (data.assignments || []).find(function(x) { return x.id === assignmentId; });
  if (!a) return;
  var s = currentStudent;
  var existing = s ? (data.submissions || []).find(function(x) { return x.assignmentId === assignmentId && x.studentId === s.id; }) : null;
  _pendingSubmissionFiles = [];
  var isResubmit = !!existing;
  var title = isResubmit ? 'Re-submit Assignment' : 'Submit Assignment';
  var btnLabel = isResubmit ? 'Re-submit' : 'Submit';
  var existingContent = existing ? existing.content : '';
  openModal('<h3><i class="fas fa-upload"></i> ' + title + '</h3><p style="color:var(--text-light);font-size:14px;margin-bottom:16px;"><strong>' + htmlEscape(a.title) + '</strong> — Due: ' + htmlEscape(a.dueDate) + (isResubmit ? ' <span class="badge" style="background:#dbeafe;color:#1e40af;">Previously submitted on ' + htmlEscape(existing.submittedAt) + '</span>' : '') + '</p><div class="form-grid"><div class="form-group" style="grid-column:1/-1;"><label>Your Response</label><textarea id="fSubContent" rows="8" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;" placeholder="Type your answer here... You can also upload documents below.">' + htmlEscape(existingContent) + '</textarea></div><div class="form-group" style="grid-column:1/-1;"><label>Upload Documents (PDF, Word, Images, etc.)' + (isResubmit ? ' <span style="color:var(--text-light);font-weight:400;">(new files replace old ones)</span>' : '') + '</label><input type="file" id="fSubFiles" multiple accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.gif,.zip" onchange="previewSubmissionFiles(this)" style="font-size:13px;padding:8px 0;"><div id="subFileList" style="margin-top:8px;font-size:13px;color:var(--text-light);"></div></div></div><input type="hidden" id="fSubAssignmentId" value="' + assignmentId + '"><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-success" onclick="saveAssignmentSubmission()"><i class="fas fa-paper-plane"></i> ' + btnLabel + '</button></div>');
}

function previewSubmissionFiles(input) {
  var list = document.getElementById('subFileList');
  if (!input.files || !input.files.length) { _pendingSubmissionFiles = []; if (list) list.textContent = ''; return; }
  var maxSize = 20 * 1024 * 1024;
  var remaining = [];
  var filesArr = Array.prototype.slice.call(input.files);
  var processed = 0;
  filesArr.forEach(function(file, idx) {
    if (file.size > maxSize) { toast(file.name + ' is too large (max 20MB)', 'error'); processed++; if (processed === filesArr.length) finalize(); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      remaining.push({ name: file.name, type: file.type || 'application/octet-stream', data: e.target.result });
      processed++;
      if (processed === filesArr.length) finalize();
    };
    reader.onerror = function() { toast('Failed to read ' + file.name, 'error'); processed++; if (processed === filesArr.length) finalize(); };
    reader.readAsDataURL(file);
  });
  function finalize() {
    _pendingSubmissionFiles = remaining;
    if (list) list.textContent = remaining.map(function(f) { return f.name; }).join(', ') || 'No files selected';
  }
}

function saveAssignmentSubmission() {
  var s = currentStudent;
  if (!s) return;
  var assignmentId = document.getElementById('fSubAssignmentId')?.value;
  var content = document.getElementById('fSubContent')?.value?.trim() || '';
  var a = (data.assignments || []).find(function(x) { return x.id === assignmentId; });
  if (!a) return;
  if (!content && !_pendingSubmissionFiles.length) { toast('Please type a response or upload a file', 'error'); return; }
  if (!data.submissions) data.submissions = [];
  var existing = data.submissions.find(function(x) { return x.assignmentId === assignmentId && x.studentId === s.id; });
  if (existing) {
    existing.content = content;
    if (_pendingSubmissionFiles.length) existing.files = _pendingSubmissionFiles.slice();
    existing.submittedAt = new Date().toISOString().split('T')[0];
    existing.status = 'submitted';
    _pendingSubmissionFiles = [];
    saveData();
    logActivity('Student ' + s.name + ' re-submitted assignment: ' + a.title);
    if (!data.notifications) data.notifications = [];
    data.notifications.push({ id: genId('NOT'), to: a.teacherId, type: 'assignment', message: s.name + ' re-submitted: ' + a.title, date: new Date().toISOString().split('T')[0], read: false });
    closeModal();
    if (typeof renderStudentAssignments === 'function') renderStudentAssignments();
    toast('Assignment re-submitted!');
  } else {
    data.submissions.push({
      id: genId('SUB'),
      assignmentId: assignmentId,
      studentId: s.id,
      content: content,
      files: _pendingSubmissionFiles.slice(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted',
      grade: null,
      feedback: null,
      gradedAt: null
    });
    _pendingSubmissionFiles = [];
    saveData();
    logActivity('Student ' + s.name + ' submitted assignment: ' + a.title);
    // Notify teacher
    if (!data.notifications) data.notifications = [];
    data.notifications.push({
      id: genId('NOT'),
      to: a.teacherId,
      type: 'assignment',
      message: s.name + ' submitted: ' + a.title,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
    closeModal();
    if (typeof renderStudentAssignments === 'function') renderStudentAssignments();
    toast('Assignment submitted successfully!');
  }
}

function viewSubmission(submissionId) {
  var sub = (data.submissions || []).find(function(x) { return x.id === submissionId; });
  if (!sub) return;
  var a = (data.assignments || []).find(function(x) { return x.id === sub.assignmentId; });
  var html = '<h3><i class="fas fa-file-alt"></i> Submission</h3><p style="color:var(--text-light);font-size:14px;margin-bottom:12px;"><strong>' + htmlEscape(a ? a.title : '') + '</strong> — Submitted: ' + htmlEscape(sub.submittedAt) + '</p>';
  if (sub.content) html += '<div style="background:var(--bg-subtle, #f7fafc);padding:16px;border-radius:8px;margin-bottom:16px;white-space:pre-wrap;font-size:14px;line-height:1.6;">' + htmlEscape(sub.content) + '</div>';
  if (sub.files && sub.files.length) {
    html += '<h4 style="margin-bottom:8px;">Attached Files</h4><div style="display:flex;flex-direction:column;gap:6px;">';
    sub.files.forEach(function(f) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--card-bg);border:1px solid var(--border);border-radius:6px;"><i class="fas fa-file"></i> <span>' + htmlEscape(f.name) + '</span> <a href="' + htmlEscape(f.data) + '" download="' + htmlEscape(f.name) + '" class="btn btn-sm btn-primary" style="margin-left:auto;"><i class="fas fa-download"></i> Download</a></div>';
    });
    html += '</div>';
  }
  if (sub.status === 'graded') {
    html += '<div style="margin-top:16px;padding:16px;background:#c6f6d5;border-radius:8px;"><strong>Grade: ' + sub.grade + '%</strong>';
    if (sub.feedback) html += '<br><span style="font-size:13px;">Feedback: ' + htmlEscape(sub.feedback) + '</span>';
    html += '</div>';
  }
  html += '<div class="modal-actions" style="margin-top:16px;"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Close</button></div>';
  openModal(html);
}

function renderTeacherSubmissions(assignmentId) {
  var a = (data.assignments || []).find(function(x) { return x.id === assignmentId; });
  if (!a) return;
  var dflt = document.getElementById('teacherAssignmentsDefault');
  if (dflt) dflt.style.display = 'none';
  var subs = (data.submissions || []).filter(function(x) { return x.assignmentId === assignmentId; });
  var students = data.students || [];
  var html = '<div style="margin-bottom:12px;"><button class="btn btn-sm btn-outline" onclick="renderTeacherAssignments()" style="color:var(--text);border-color:#e2e8f0;"><i class="fas fa-arrow-left"></i> Back to Assignments</button></div>';
  html += '<h3 style="margin-bottom:4px;">' + htmlEscape(a.title) + '</h3><p class="subtitle" style="margin-bottom:16px;">Class: ' + htmlEscape(a.class) + ' | Due: ' + htmlEscape(a.dueDate) + ' | Submissions: ' + subs.length + '</p>';
  if (!subs.length) {
    html += '<div class="empty-state"><i class="fas fa-file-alt"></i><p>No submissions yet</p></div>';
    document.getElementById('teacherSubmissionsView').innerHTML = html;
    return;
  }
  html += '<div class="table-responsive"><table><thead><tr><th>Student</th><th>Submitted</th><th>Content</th><th>Files</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
  subs.forEach(function(sub) {
    var stu = students.find(function(s) { return s.id === sub.studentId; });
    var statusColor = sub.status === 'graded' ? '#c6f6d5' : '#dbeafe';
    var statusText = sub.status === 'graded' ? 'Graded (' + sub.grade + '%)' : 'Submitted';
    var statusTextColor = sub.status === 'graded' ? '#22543d' : '#1e40af';
    var contentPreview = sub.content ? sub.content.substring(0, 60) + (sub.content.length > 60 ? '...' : '') : '--';
    html += '<tr><td><strong>' + htmlEscape(stu ? stu.name : sub.studentId) + '</strong></td><td>' + htmlEscape(sub.submittedAt) + '</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + htmlEscape(sub.content) + '">' + htmlEscape(contentPreview) + '</td><td>' + (sub.files ? sub.files.length : 0) + ' file(s)</td><td><span class="badge" style="background:' + statusColor + ';color:' + statusTextColor + ';">' + htmlEscape(statusText) + '</span></td><td><button class="btn btn-sm btn-primary" onclick="gradeSubmission(\'' + sub.id + '\')"><i class="fas fa-check"></i> Grade</button></td></tr>';
  });
  html += '</tbody></table></div>';
  document.getElementById('teacherSubmissionsView').innerHTML = html;
}

function gradeSubmission(submissionId) {
  var sub = (data.submissions || []).find(function(x) { return x.id === submissionId; });
  if (!sub) return;
  var a = (data.assignments || []).find(function(x) { return x.id === sub.assignmentId; });
  var s = (data.students || []).find(function(x) { return x.id === sub.studentId; });
  openModal('<h3><i class="fas fa-check-circle"></i> Grade Submission</h3><p style="color:var(--text-light);font-size:14px;margin-bottom:16px;"><strong>' + htmlEscape(s ? s.name : sub.studentId) + '</strong> — ' + htmlEscape(a ? a.title : '') + '</p><div class="form-grid"><div class="form-group"><label>Score (%)</label><input type="number" id="fSubGrade" min="0" max="100" value="' + (sub.grade || '') + '"></div><div class="form-group" style="grid-column:1/-1;"><label>Feedback</label><textarea id="fSubFeedback" rows="4" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;" placeholder="Provide feedback for the student...">' + htmlEscape(sub.feedback || '') + '</textarea></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveGrade(\'' + submissionId + '\')"><i class="fas fa-save"></i> Save Grade</button></div>');
}

function saveGrade(submissionId) {
  var sub = (data.submissions || []).find(function(x) { return x.id === submissionId; });
  if (!sub) return;
  var grade = parseInt(document.getElementById('fSubGrade')?.value, 10);
  if (isNaN(grade) || grade < 0 || grade > 100) { toast('Please enter a valid grade (0-100)', 'error'); return; }
  sub.grade = grade;
  sub.feedback = document.getElementById('fSubFeedback')?.value?.trim() || '';
  sub.status = 'graded';
  sub.gradedAt = new Date().toISOString().split('T')[0];
  saveData();
  logActivity('Graded submission ' + sub.id + ' with score ' + grade + '%');
  closeModal();
  if (typeof renderTeacherSubmissions === 'function') renderTeacherSubmissions(sub.assignmentId);
  toast('Grade saved!');
}

// Patch teacher assignments to show submission counts + View Submissions button
function patchTeacherAssignments() {
  var orig = renderTeacherAssignments;
  if (!orig) return;
  renderTeacherAssignments = function() {
    orig();
    var rows = document.querySelectorAll('#teacherAssignmentsTable tr');
    if (!rows.length) return;
    var asns = (data.assignments || []).filter(function(a) { return a.teacherId === (currentTeacher ? currentTeacher.id : ''); }).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    asns.forEach(function(a, idx) {
      if (idx >= rows.length) return;
      var count = (data.submissions || []).filter(function(s) { return s.assignmentId === a.id; }).length;
      var cell = rows[idx].querySelector('td:last-child');
      if (cell) {
        cell.style.whiteSpace = 'nowrap';
        cell.innerHTML = '<button class="btn btn-sm" onclick="renderTeacherSubmissions(\'' + a.id + '\')" style="background:#dbeafe;color:#1e40af;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;margin-right:6px;"><i class="fas fa-file-alt"></i> (' + count + ')</button> ' + cell.innerHTML;
      }
    });
  };
}
patchTeacherAssignments();


// ===== ACADEMIC TRANSCRIPT GENERATOR (all school categories) =====
var _transcriptStudentId = null;

function renderTranscriptGenerator() {
  var container = document.getElementById('transcriptView');
  if (!container) return;
  var students = data.students || [];
  var html = '<div class="form-grid" style="margin-bottom:20px;"><div class="form-group"><label>Select Student</label><select id="transcriptStudentSelect" onchange="onTranscriptStudentChange()" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;"><option value="">— Choose a student —</option>';
  students.sort(function(a, b) { return a.name.localeCompare(b.name); }).forEach(function(s) {
    html += '<option value="' + htmlEscape(s.id) + '"' + (s.id === _transcriptStudentId ? ' selected' : '') + '>' + htmlEscape(s.name) + ' (' + htmlEscape(s.class) + ')</option>';
  });
  html += '</select></div></div><div id="transcriptResult"></div>';
  container.innerHTML = html;
  if (_transcriptStudentId) generateTranscript(_transcriptStudentId);
}

function onTranscriptStudentChange() {
  var sel = document.getElementById('transcriptStudentSelect');
  _transcriptStudentId = sel ? sel.value : '';
  if (_transcriptStudentId) generateTranscript(_transcriptStudentId);
  else document.getElementById('transcriptResult').innerHTML = '<div class="empty-state"><i class="fas fa-scroll"></i><p>Select a student to generate transcript</p></div>';
}

function generateTranscript(studentId) {
  var result = document.getElementById('transcriptResult');
  if (!result) return;
  var stu = (data.students || []).find(function(s) { return s.id === studentId; });
  if (!stu) { result.innerHTML = '<div class="empty-state"><i class="fas fa-user-slash"></i><p>Student not found</p></div>'; return; }

  var cat = data.cat || [];
  var results = data.results || [];
  var terms = data.academicTerms || [];

  // Gather all unique terms with results for this student
  var studentResults = results.filter(function(r) { return r.studentId === studentId; });
  var termNames = {};
  studentResults.forEach(function(r) { termNames[r.term] = true; });
  var termList = Object.keys(termNames).sort();

  var getGrade = function(score) {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  var schoolName = data.nigeriaSchoolName || 'School Name';
  var logoHtml = data.schoolLogo ? '<img src="' + htmlEscape(data.schoolLogo) + '" style="height:50px;width:auto;border-radius:4px;">' : '';

  var html = '<div id="transcriptPrintable" style="max-width:900px;margin:0 auto;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);padding:32px;font-family:Arial,sans-serif;">';

  // Header
  html += '<div style="text-align:center;margin-bottom:24px;border-bottom:3px double #1a202c;padding-bottom:16px;">';
  html += logoHtml;
  html += '<h1 style="margin:8px 0 4px;font-size:22px;color:#1a202c;">' + htmlEscape(schoolName) + '</h1>';
  html += '<h2 style="margin:0;font-size:18px;color:#4a5568;letter-spacing:1px;">STUDENT ACADEMIC TRANSCRIPT</h2>';
  html += '</div>';

  // Student Info
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;padding:12px 16px;background:#f7fafc;border-radius:8px;font-size:14px;">';
  html += '<div><strong>Student Name:</strong> ' + htmlEscape(stu.name) + '</div>';
  html += '<div><strong>Student ID:</strong> ' + htmlEscape(stu.id) + '</div>';
  html += '<div><strong>Current Class:</strong> ' + htmlEscape(stu.class) + '</div>';
  html += '<div><strong>Generated:</strong> ' + new Date().toLocaleDateString('en-CA') + '</div>';
  html += '</div>';

  // Per-term tables
  var allTotals = [];
  termList.forEach(function(term) {
    var tResults = studentResults.filter(function(r) { return r.term === term; });
    if (!tResults.length) return;
    html += '<h3 style="margin:20px 0 8px;font-size:15px;color:#2d3748;border-bottom:2px solid #e2e8f0;padding-bottom:4px;">' + htmlEscape(term) + '</h3>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;"><thead><tr style="background:#1a202c;color:white;">';
    html += '<th style="padding:8px 10px;text-align:left;">Subject</th><th style="padding:8px 10px;text-align:center;">CAT /100</th><th style="padding:8px 10px;text-align:center;">Exam /100</th><th style="padding:8px 10px;text-align:center;">Total /100</th><th style="padding:8px 10px;text-align:center;">Grade</th></tr></thead><tbody>';

    var termTotal = 0;
    var termCount = 0;
    tResults.forEach(function(r) {
      var catEntry = cat.find(function(c) { return c.studentId === studentId && c.subject === r.subject; });
      var catAvg = 0;
      if (catEntry) catAvg = Math.round((catEntry.test1 + catEntry.test2 + catEntry.test3) / 3 / 20 * 100);
      var total = Math.round(catAvg * 0.4 + r.score * 0.6);
      var grade = getGrade(total);
      termTotal += total;
      termCount++;
      var catDisplay = catAvg || '-';
      html += '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 10px;">' + htmlEscape(r.subject) + '</td><td style="padding:8px 10px;text-align:center;">' + catDisplay + '</td><td style="padding:8px 10px;text-align:center;">' + r.score + '</td><td style="padding:8px 10px;text-align:center;font-weight:600;">' + total + '</td><td style="padding:8px 10px;text-align:center;"><span class="badge" style="background:' + (grade === 'A' ? '#c6f6d5' : grade === 'B' ? '#fefcbf' : grade === 'F' ? '#fed7d7' : '#e2e8f0') + ';color:' + (grade === 'A' ? '#22543d' : grade === 'B' ? '#744210' : grade === 'F' ? '#9b2c2c' : '#2d3748') + ';padding:2px 8px;border-radius:4px;font-size:12px;">' + grade + '</span></td></tr>';
    });
    if (termCount) {
      var termAvg = Math.round(termTotal / termCount);
      allTotals.push({ term: term, average: termAvg });
      html += '<tr style="font-weight:700;background:#edf2f7;"><td style="padding:8px 10px;">Term Average</td><td style="padding:8px 10px;text-align:center;"></td><td style="padding:8px 10px;text-align:center;"></td><td style="padding:8px 10px;text-align:center;">' + termAvg + '</td><td style="padding:8px 10px;text-align:center;"><span class="badge" style="background:' + (termAvg >= 80 ? '#c6f6d5' : termAvg >= 60 ? '#fefcbf' : termAvg >= 40 ? '#e2e8f0' : '#fed7d7') + ';color:' + (termAvg >= 80 ? '#22543d' : termAvg >= 60 ? '#744210' : termAvg >= 40 ? '#2d3748' : '#9b2c2c') + ';padding:2px 8px;border-radius:4px;font-size:12px;">' + getGrade(termAvg) + '</span></td></tr>';
    }
    html += '</tbody></table>';
  });

  // Cumulative Summary
  if (allTotals.length) {
    var overallTotal = allTotals.reduce(function(s, t) { return s + t.average; }, 0);
    var overallAvg = Math.round(overallTotal / allTotals.length);
    var overallGrade = getGrade(overallAvg);
    html += '<div style="margin-top:24px;padding:16px;background:#1a202c;color:white;border-radius:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">';
    html += '<div><div style="font-size:11px;opacity:0.7;">Terms Completed</div><div style="font-size:24px;font-weight:800;">' + allTotals.length + '</div></div>';
    html += '<div><div style="font-size:11px;opacity:0.7;">Cumulative Average</div><div style="font-size:24px;font-weight:800;">' + overallAvg + '%</div></div>';
    html += '<div><div style="font-size:11px;opacity:0.7;">Overall Grade</div><div style="font-size:24px;font-weight:800;">' + overallGrade + '</div></div>';
    html += '</div>';
  }

  // Footer
  html += '<div style="margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#a0aec0;text-align:center;">';
  html += 'This transcript is computer-generated. Signature: ___________________ &nbsp;&nbsp; Date: ___________';
  html += '</div></div>'; // close printable + result

  result.innerHTML = html;
}

function printTranscript() {
  var printable = document.getElementById('transcriptPrintable');
  if (!printable) { toast('No transcript to print. Select a student first.', 'error'); return; }
  var win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { toast('Please allow pop-ups for printing', 'error'); return; }
  var schoolName = data.nigeriaSchoolName || 'School Name';
  win.document.write('<!DOCTYPE html><html><head><title>Transcript - ' + schoolName + '</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1a202c;}table{width:100%;border-collapse:collapse;}th{background:#1a202c;color:white;padding:8px 10px;text-align:left;}td{padding:8px 10px;border-bottom:1px solid #e2e8f0;}.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;}@media print{body{padding:20px;}}</style></head><body>');
  win.document.write(printable.innerHTML);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 500);
}


// ===== SCHOOL GALLERY — EVENTS & KEY MOMENTS =====
function renderGalleryAdmin() {
  var container = document.getElementById('galleryAdminView');
  if (!container) return;
  var items = (data.gallery || []).sort(function(a, b) { return b.uploadedAt.localeCompare(a.uploadedAt); });
  var catLabels = { sports: 'Sports', games: 'Games', exhibition: 'Exhibition', extracurricular: 'Extra-Curricular', other: 'Other' };
  var catColors = { sports: '#dbeafe', games: '#fefcbf', exhibition: '#c6f6d5', extracurricular: '#e9d8fd', other: '#e2e8f0' };
  var html = '<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><button class="btn btn-primary btn-sm" onclick="showUploadGalleryModal()"><i class="fas fa-plus"></i> Upload Photo</button></div>';
  if (!items.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-images"></i><p>No gallery photos yet. Upload your first school event photo!</p></div>';
    return;
  }
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">';
  items.forEach(function(item) {
    var cat = catLabels[item.category] || item.category;
    var catColor = catColors[item.category] || '#e2e8f0';
    html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;overflow:hidden;">';
    if (item.image) {
      html += '<div style="height:160px;overflow:hidden;background:#edf2f7;"><img src="' + htmlEscape(item.image) + '" alt="' + htmlEscape(item.title) + '" style="width:100%;height:100%;object-fit:cover;"></div>';
    } else {
      html += '<div style="height:160px;background:linear-gradient(135deg,#e2e8f0,#cbd5e0);display:flex;align-items:center;justify-content:center;font-size:48px;color:#a0aec0;"><i class="fas fa-image"></i></div>';
    }
    html += '<div style="padding:12px;"><h4 style="font-weight:600;font-size:14px;margin:0 0 4px;">' + htmlEscape(item.title) + '</h4><p style="font-size:12px;color:var(--text-light);margin:0 0 8px;">' + htmlEscape(item.description || '') + '</p><div style="display:flex;justify-content:space-between;align-items:center;"><span class="badge" style="background:' + catColor + ';color:#2d3748;font-size:11px;">' + htmlEscape(cat) + '</span><button class="btn btn-sm btn-danger" onclick="deleteGalleryItem(\'' + item.id + '\')"><i class="fas fa-trash"></i></button></div><div style="font-size:11px;color:var(--text-light);margin-top:6px;"><i class="fas fa-calendar"></i> ' + htmlEscape(item.uploadedAt) + '</div></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function showUploadGalleryModal() {
  openModal('<h3><i class="fas fa-upload"></i> Upload Gallery Photo</h3><div class="form-grid"><div class="form-group" style="grid-column:1/-1;"><label>Photo</label><input type="file" id="fGalImage" accept="image/*" onchange="previewGalleryImage(this)" style="font-size:13px;padding:8px 0;"><div id="galImagePreview" style="margin-top:8px;max-width:200px;border-radius:8px;overflow:hidden;display:none;"><img id="galPreviewImg" style="width:100%;height:auto;border-radius:8px;"></div></div><div class="form-group" style="grid-column:1/-1;"><label>Title</label><input type="text" id="fGalTitle" placeholder="e.g. Annual Sports Day"></div><div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fGalDesc" rows="2" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;" placeholder="Brief description of the moment..."></textarea></div><div class="form-group"><label>Category</label><select id="fGalCategory"><option value="sports">Sports</option><option value="games">Games</option><option value="exhibition">Exhibition</option><option value="extracurricular">Extra-Curricular</option><option value="other">Other</option></select></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-success" onclick="saveGalleryItem()"><i class="fas fa-save"></i> Upload</button></div>');
}

function previewGalleryImage(input) {
  var preview = document.getElementById('galImagePreview');
  var img = document.getElementById('galPreviewImg');
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      if (img) img.src = e.target.result;
      if (preview) preview.style.display = 'block';
      // Store temporarily for save
      window._pendingGalleryImage = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function saveGalleryItem() {
  var title = document.getElementById('fGalTitle')?.value?.trim();
  var desc = document.getElementById('fGalDesc')?.value?.trim() || '';
  var category = document.getElementById('fGalCategory')?.value || 'other';
  var image = window._pendingGalleryImage || '';
  if (!title) { toast('Please enter a title', 'error'); return; }
  if (!image) { toast('Please select a photo', 'error'); return; }
  if (!data.gallery) data.gallery = [];
  data.gallery.push({
    id: genId('GAL'),
    title: title,
    description: desc,
    category: category,
    image: image,
    uploadedAt: new Date().toISOString().split('T')[0]
  });
  window._pendingGalleryImage = null;
  saveData();
  logActivity('Uploaded gallery photo: ' + title);
  closeModal();
  renderGalleryAdmin();
  toast('Photo uploaded!');
}

function deleteGalleryItem(id) {
  if (!confirm('Delete this photo?')) return;
  data.gallery = (data.gallery || []).filter(function(g) { return g.id !== id; });
  saveData();
  renderGalleryAdmin();
  toast('Photo deleted');
}

// Shared gallery view for all portals (student, teacher, parent, landing)
function renderGalleryView(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var items = (data.gallery || []).sort(function(a, b) { return b.uploadedAt.localeCompare(a.uploadedAt); });
  var catLabels = { sports: 'Sports', games: 'Games', exhibition: 'Exhibition', extracurricular: 'Extra-Curricular', other: 'Other' };
  var catColors = { sports: '#dbeafe', games: '#fefcbf', exhibition: '#c6f6d5', extracurricular: '#e9d8fd', other: '#e2e8f0' };
  if (!items.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>No gallery photos yet</p></div>';
    return;
  }
  // Category filter buttons
  var categories = Object.keys(catLabels);
  var html = '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;"><button class="btn btn-sm gallery-filter active" data-cat="all" onclick="filterGallery(this,\'' + containerId + '\')" style="background:var(--primary);color:white;border:none;padding:4px 12px;border-radius:16px;cursor:pointer;font-size:12px;">All</button>';
  categories.forEach(function(c) {
    html += '<button class="btn btn-sm gallery-filter" data-cat="' + c + '" onclick="filterGallery(this,\'' + containerId + '\')" style="background:#e2e8f0;color:#4a5568;border:none;padding:4px 12px;border-radius:16px;cursor:pointer;font-size:12px;">' + catLabels[c] + '</button>';
  });
  html += '</div><div class="gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">';
  items.forEach(function(item) {
    var cat = catLabels[item.category] || item.category;
    var catColor = catColors[item.category] || '#e2e8f0';
    html += '<div class="gallery-item" data-category="' + htmlEscape(item.category) + '" style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="viewGalleryPhoto(\'' + item.id + '\')">';
    if (item.image) {
      html += '<div style="height:140px;overflow:hidden;background:#edf2f7;"><img src="' + htmlEscape(item.image) + '" alt="' + htmlEscape(item.title) + '" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'"></div>';
    } else {
      html += '<div style="height:140px;background:linear-gradient(135deg,#e2e8f0,#cbd5e0);display:flex;align-items:center;justify-content:center;font-size:36px;color:#a0aec0;"><i class="fas fa-image"></i></div>';
    }
    html += '<div style="padding:10px;"><h4 style="font-weight:600;font-size:13px;margin:0;">' + htmlEscape(item.title) + '</h4><span class="badge" style="background:' + catColor + ';color:#2d3748;font-size:10px;margin-top:4px;">' + htmlEscape(cat) + '</span></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function filterGallery(btn, containerId) {
  var parent = document.getElementById(containerId);
  if (!parent) return;
  var cat = btn.dataset.cat;
  // Toggle active class
  var filters = parent.querySelectorAll('.gallery-filter');
  filters.forEach(function(f) { f.style.background = '#e2e8f0'; f.style.color = '#4a5568'; });
  btn.style.background = 'var(--primary)'; btn.style.color = 'white';
  var items = parent.querySelectorAll('.gallery-item');
  items.forEach(function(item) {
    if (cat === 'all' || item.dataset.category === cat) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function viewGalleryPhoto(id) {
  var item = (data.gallery || []).find(function(g) { return g.id === id; });
  if (!item) return;
  var catLabels = { sports: 'Sports', games: 'Games', exhibition: 'Exhibition', extracurricular: 'Extra-Curricular', other: 'Other' };
  var catColors = { sports: '#dbeafe', games: '#fefcbf', exhibition: '#c6f6d5', extracurricular: '#e9d8fd', other: '#e2e8f0' };
  var cat = catLabels[item.category] || item.category;
  var catColor = catColors[item.category] || '#e2e8f0';
  var html = '<div style="max-width:600px;margin:0 auto;">';
  if (item.image) {
    html += '<div style="border-radius:12px;overflow:hidden;margin-bottom:16px;"><img src="' + htmlEscape(item.image) + '" alt="' + htmlEscape(item.title) + '" style="width:100%;height:auto;max-height:400px;object-fit:contain;background:#edf2f7;border-radius:12px;"></div>';
  }
  html += '<h3 style="margin:0 0 4px;">' + htmlEscape(item.title) + '</h3>';
  html += '<span class="badge" style="background:' + catColor + ';color:#2d3748;">' + htmlEscape(cat) + '</span>';
  if (item.description) html += '<p style="color:var(--text-light);margin-top:8px;font-size:14px;">' + htmlEscape(item.description) + '</p>';
  html += '<div style="font-size:12px;color:var(--text-light);margin-top:8px;"><i class="fas fa-calendar"></i> ' + htmlEscape(item.uploadedAt) + '</div>';
  html += '</div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Close</button></div>';
  openModal(html);
}


// ===== MEAL PLANNER / CAFETERIA =====
function renderMealPlanner() {
  var container = document.getElementById('adminMealPlanner');
  if (!container) return;
  var plans = data.mealPlans || [];
  var restrictions = data.dietaryRestrictions || [];
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var html = '<div class="card-header"><h2><i class="fas fa-utensils"></i> Meal Planner</h2>'
    + '<button class="btn btn-sm btn-primary" onclick="showAddMealPlan()"><i class="fas fa-plus"></i> New Weekly Menu</button></div>'
    + '<p class="subtitle">Plan the school cafeteria menu by week. Track student dietary restrictions.</p>'
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;width:100%;box-sizing:border-box;overflow-x:hidden;">'
    + '<div class="card" style="flex:2;min-width:300px;width:100%;box-sizing:border-box;"><h4 style="font-weight:600;margin-bottom:12px;">Weekly Meal Plans</h4><div id="mealPlanList">';
  if (!plans.length) {
    html += '<p style="text-align:center;color:var(--text-light);padding:20px;">No meal plans created yet.</p>';
  } else {
    plans.slice().reverse().forEach(function(plan, pi) {
      html += '<div class="card" style="margin-bottom:8px;padding:12px;border-left:4px solid var(--primary);">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;">'
        + '<strong>' + esc(plan.week || '') + '</strong>'
        + '<button class="btn btn-sm btn-danger" onclick="deleteMealPlan(' + pi + ')"><i class="fas fa-trash"></i></button>'
        + '</div>';
      days.forEach(function(d) {
        var meal = plan.meals ? plan.meals[d] : null;
        html += '<div style="font-size:13px;margin:4px 0;padding:4px 8px;background:var(--bg-subtle);border-radius:4px;">'
          + '<strong>' + d + ':</strong> ' + (meal ? esc(meal) : '—') + '</div>';
      });
      html += '</div>';
    });
  }
  html += '</div></div>'
    + '<div class="card" style="flex:1;min-width:250px;width:100%;box-sizing:border-box;"><h4 style="font-weight:600;margin-bottom:12px;">Dietary Restrictions</h4>'
    + '<div style="display:flex;gap:6px;margin-bottom:8px;"><input type="text" id="drStudentName" class="form-input" placeholder="Student name" style="flex:1;"><input type="text" id="drRestriction" class="form-input" placeholder="Allergy / Restriction" style="flex:1;">'
    + '<button class="btn btn-sm btn-primary" onclick="addDietaryRestriction()"><i class="fas fa-plus"></i></button></div>'
    + '<div id="dietaryList">';
  restrictions.forEach(function(r, i) {
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--bg-subtle);border-radius:4px;margin-bottom:4px;font-size:13px;">'
      + '<span><strong>' + esc(r.student) + '</strong>: ' + esc(r.restriction) + '</span>'
      + '<button class="btn btn-sm btn-danger" onclick="removeDietaryRestriction(' + i + ')" style="padding:2px 6px;font-size:10px;"><i class="fas fa-times"></i></button></div>';
  });
  html += '</div></div></div>';
  container.innerHTML = html;
}

function showAddMealPlan() {
  var week = prompt('Enter week label (e.g. "Week 1 - Sept 2026"):', 'Week ' + ((data.mealPlans || []).length + 1));
  if (!week) return;
  if (!data.mealPlans) data.mealPlans = [];
  data.mealPlans.push({ id: 'MP' + Date.now(), week: week, meals: {} });
  renderMealPlanner();
  // Prompt for each day
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var plan = data.mealPlans[data.mealPlans.length - 1];
  days.forEach(function(d) {
    var meal = prompt('Enter menu for ' + d + ':', '');
    if (meal) plan.meals[d] = meal;
  });
  saveData();
  renderMealPlanner();
  toast('Meal plan saved!');
}

function deleteMealPlan(idx) {
  if (!confirm('Delete this meal plan?')) return;
  data.mealPlans.splice(idx, 1);
  saveData();
  renderMealPlanner();
}

function addDietaryRestriction() {
  var student = document.getElementById('drStudentName')?.value?.trim();
  var restriction = document.getElementById('drRestriction')?.value?.trim();
  if (!student || !restriction) { toast('Enter both student name and restriction', 'error'); return; }
  if (!data.dietaryRestrictions) data.dietaryRestrictions = [];
  data.dietaryRestrictions.push({ student: student, restriction: restriction });
  document.getElementById('drStudentName').value = '';
  document.getElementById('drRestriction').value = '';
  saveData();
  renderMealPlanner();
  toast('Dietary restriction added!');
}

function removeDietaryRestriction(idx) {
  data.dietaryRestrictions.splice(idx, 1);
  saveData();
  renderMealPlanner();
}


// ===== SCHOOL STORE =====
function renderSchoolStore() {
  var container = document.getElementById('adminSchoolStore');
  if (!container) return;
  var products = data.storeProducts || [];
  var orders = data.storeOrders || [];
  var html = '<div class="card-header"><h2><i class="fas fa-shopping-bag"></i> School Store</h2>'
    + '<button class="btn btn-sm btn-primary" onclick="showAddProduct()"><i class="fas fa-plus"></i> Add Product</button></div>'
    + '<p class="subtitle">Manage merchandise, uniforms, and books for sale. Students and parents can place orders.</p>'
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;">'
    + '<div class="card" style="flex:2;min-width:300px;"><h4 style="font-weight:600;margin-bottom:12px;">Products</h4>'
    + '<div id="storeProductList">';
  products.forEach(function(p, i) {
    html += '<div class="card" style="margin-bottom:8px;padding:12px;display:flex;gap:12px;align-items:center;">'
      + (p.image ? '<img src="' + esc(p.image) + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">' : '<div style="width:50px;height:50px;background:#e2e8f0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--text-light);"><i class="fas fa-box"></i></div>')
      + '<div style="flex:1;"><strong>' + esc(p.name) + '</strong><br><span style="font-size:12px;color:var(--text-light);">₦' + (p.price || 0).toLocaleString() + ' | Stock: ' + (p.stock || 0) + ' | ' + esc(p.category || '') + '</span></div>'
      + '<button class="btn btn-sm btn-outline" onclick="editProduct(' + i + ')"><i class="fas fa-edit"></i></button>'
      + '<button class="btn btn-sm btn-danger" onclick="deleteProduct(' + i + ')"><i class="fas fa-trash"></i></button>'
      + '</div>';
  });
  html += '</div></div>'
    + '<div class="card" style="flex:1;min-width:250px;"><h4 style="font-weight:600;margin-bottom:12px;">Orders (' + orders.length + ')</h4><div id="storeOrderList">';
  if (!orders.length) {
    html += '<p style="text-align:center;color:var(--text-light);padding:10px;">No orders yet.</p>';
  } else {
    orders.slice().reverse().forEach(function(o) {
      html += '<div style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">'
        + '<strong>' + esc(o.customer || '') + '</strong>'
        + '<span style="float:right;">₦' + (o.total || 0).toLocaleString() + '</span>'
        + '<br><span style="color:var(--text-light);font-size:12px;">' + esc(o.items || '') + ' | ' + esc(o.status || '') + ' | ' + esc(o.date || '') + '</span></div>';
    });
  }
  html += '</div></div></div>';
  container.innerHTML = html;
}

function showAddProduct() {
  var name = prompt('Product name:', '');
  if (!name) return;
  var price = parseFloat(prompt('Price (₦):', '')) || 0;
  var stock = parseInt(prompt('Stock quantity:', '10')) || 0;
  var cat = prompt('Category (Uniform, Books, Sports, Merchandise):', 'Merchandise') || 'Merchandise';
  var desc = prompt('Short description:', '') || '';
  if (!data.storeProducts) data.storeProducts = [];
  data.storeProducts.push({ id: 'PROD' + Date.now(), name: name, description: desc, price: price, category: cat, image: '', stock: stock });
  saveData();
  renderSchoolStore();
  toast('Product added!');
}

function editProduct(idx) {
  var p = (data.storeProducts || [])[idx];
  if (!p) return;
  var name = prompt('Product name:', p.name);
  if (!name) return;
  var price = parseFloat(prompt('Price (₦):', String(p.price))) || 0;
  var stock = parseInt(prompt('Stock quantity:', String(p.stock))) || 0;
  p.name = name; p.price = price; p.stock = stock;
  saveData();
  renderSchoolStore();
  toast('Product updated!');
}

function deleteProduct(idx) {
  if (!confirm('Delete this product?')) return;
  data.storeProducts.splice(idx, 1);
  saveData();
  renderSchoolStore();
}


// ===== E-BOOK READER ENHANCEMENT (Bookmarks) =====
function viewEbookWithBookmarks(bookId) {
  var book = (data.library || []).find(function(b) { return b.id === bookId; });
  if (!book || !book.ebookUrl) { toast('No ebook available', 'error'); return; }
  if (!book.bookmarks) book.bookmarks = [];
  var isPdf = book.ebookType === 'application/pdf' || book.ebookUrl.indexOf('data:application/pdf') === 0 || book.ebookUrl.indexOf('.pdf') > 0;
  var isText = book.ebookType === 'text/plain' || book.ebookType === 'text/html' || book.ebookUrl.indexOf('.txt') > 0;

  var modal = document.getElementById('ebookReaderModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ebookReaderModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99998;background:white;display:flex;flex-direction:column;';
    document.body.appendChild(modal);
  }
  var closeBtn = '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;background:var(--primary);color:white;flex-shrink:0;">'
    + '<span style="font-weight:600;">' + esc(book.title) + '</span>'
    + '<div style="display:flex;gap:8px;">'
    + '<button onclick="addBookmark(' + bookId + ')" style="padding:6px 12px;background:rgba(255,255,255,0.2);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-bookmark"></i> Bookmark</button>'
    + '<button onclick="showBookmarks(' + bookId + ')" style="padding:6px 12px;background:rgba(255,255,255,0.2);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-list"></i> ' + (book.bookmarks.length || 0) + '</button>'
    + '<button onclick="closeEbookReader()" style="padding:6px 12px;background:rgba(255,0,0,0.3);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-times"></i> Close</button>'
    + '</div></div>';

  var readerHtml = '';
  if (isPdf) {
    readerHtml = '<iframe src="' + esc(book.ebookUrl) + '" style="width:100%;flex:1;border:none;"></iframe>';
  } else if (isText) {
    readerHtml = '<div id="ebookTextContent" style="flex:1;overflow:auto;padding:24px;font-size:16px;line-height:1.8;max-width:800px;margin:0 auto;white-space:pre-wrap;"></div>';
  } else {
    readerHtml = '<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;color:var(--text-light);">'
      + '<i class="fas fa-file" style="font-size:64px;"></i>'
      + '<p>Preview not available for this format. <a href="' + esc(book.ebookUrl) + '" download style="color:var(--primary);">Download file</a></p></div>';
  }

  modal.innerHTML = closeBtn + readerHtml;

  // For text files, fetch and render
  if (isText && book.ebookUrl.indexOf('data:') === 0) {
    var textContent = atob(book.ebookUrl.split(',')[1] || '');
    document.getElementById('ebookTextContent').textContent = textContent;
  }
}

function closeEbookReader() {
  var modal = document.getElementById('ebookReaderModal');
  if (modal) modal.remove();
}

function addBookmark(bookId) {
  var book = (data.library || []).find(function(b) { return b.id === bookId; });
  if (!book) return;
  if (!book.bookmarks) book.bookmarks = [];
  var label = prompt('Bookmark label:', 'Page ' + (book.bookmarks.length + 1));
  if (!label) return;
  book.bookmarks.push({ label: label, date: new Date().toISOString().slice(0, 10) });
  saveData();
  toast('Bookmark added!');
}

function showBookmarks(bookId) {
  var book = (data.library || []).find(function(b) { return b.id === bookId; });
  if (!book || !book.bookmarks || !book.bookmarks.length) { toast('No bookmarks', 'info'); return; }
  var html = '<div style="padding:16px;"><h4 style="margin-bottom:12px;">Bookmarks</h4>';
  book.bookmarks.forEach(function(bm, i) {
    html += '<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">'
      + '<span><i class="fas fa-bookmark" style="color:var(--accent);"></i> ' + esc(bm.label) + ' <span style="color:var(--text-light);font-size:11px;">' + esc(bm.date || '') + '</span></span>'
      + '<button onclick="removeBookmark(\'' + bookId + '\',' + i + ')" style="background:none;border:none;color:var(--danger);cursor:pointer;">Remove</button>'
      + '</div>';
  });
  html += '</div>';
  var modal = document.getElementById('ebookReaderModal');
  if (modal) {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:99999;min-width:300px;';
    div.innerHTML = html + '<div style="text-align:right;padding:0 16px 12px;"><button onclick="this.parentElement.parentElement.remove()" class="btn btn-sm btn-outline">Close</button></div>';
    document.body.appendChild(div);
  }
}

function removeBookmark(bookId, idx) {
  var book = (data.library || []).find(function(b) { return b.id === bookId; });
  if (book && book.bookmarks) book.bookmarks.splice(idx, 1);
  saveData();
  showBookmarks(bookId);
}


// ===== ONLINE ADMISSION PAYMENT =====
function processAdmissionPayment(appId) {
  var app = (data.applications || []).find(function(a) { return a.id === appId; });
  if (!app) { toast('Application not found', 'error'); return; }
  var program = (data.admissionPrograms || []).find(function(p) { return p.id === app.programId; });
  var fee = program ? (program.fee || 0) : 0;
  if (fee <= 0) { toast('No fee required for this program', 'info'); return; }
  var email = app.email || '';
  var name = (app.firstName || '') + ' ' + (app.lastName || '');
  if (typeof initiateGatewayPayment === 'function') {
    initiateGatewayPayment(fee, email, name, 'ADM-' + appId + '-' + Date.now(), function() {
      toast('Admission payment successful!');
      app.feePaid = true;
      app.status = 'fee_paid';
      saveData();
      if (typeof renderApplications === 'function') renderApplications();
    }, function() {
      toast('Payment cancelled or failed', 'error');
    });
  } else {
    toast('Payment gateway not configured', 'error');
  }
}

// Override the existing "Pay" button in applications view via a helper
function patchAdmissionPayButtons() {
  document.querySelectorAll('.adm-pay-btn').forEach(function(btn) {
    btn.onclick = function() { processAdmissionPayment(this.dataset.appId); };
  });
}


// ===== STUDENT STORE VIEW (for student/parent portals) =====
function renderStudentStore() {
  var container = document.getElementById('studentStoreView');
  if (!container) return;
  var products = data.storeProducts || [];
  var cart = JSON.parse(localStorage.getItem('eduverse_store_cart') || '[]');
  var html = '<div class="card-header"><h2><i class="fas fa-shopping-bag"></i> School Store</h2>'
    + '<span style="font-size:14px;"><i class="fas fa-shopping-cart"></i> Cart: <strong>' + cart.reduce(function(s, i) { return s + i.qty; }, 0) + '</strong> items</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">';
  products.forEach(function(p, i) {
    var inCart = cart.find(function(c) { return c.id === p.id; });
    html += '<div class="card" style="text-align:center;padding:16px;">'
      + (p.image ? '<img src="' + esc(p.image) + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;">' : '<div style="width:100%;height:120px;background:#e2e8f0;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:36px;color:var(--text-light);"><i class="fas fa-box"></i></div>')
      + '<h4 style="font-size:14px;font-weight:600;">' + esc(p.name) + '</h4>'
      + '<p style="font-size:12px;color:var(--text-light);margin:4px 0;">₦' + (p.price || 0).toLocaleString() + '</p>'
      + '<div style="display:flex;gap:6px;justify-content:center;margin-top:8px;">'
      + (inCart
        ? '<button class="btn btn-sm btn-danger" onclick="removeFromCart(\'' + p.id + '\')"><i class="fas fa-minus"></i> Remove</button><span style="padding:6px;">' + inCart.qty + '</span>'
        : '<button class="btn btn-sm btn-primary" onclick="addToCart(\'' + p.id + '\')"><i class="fas fa-cart-plus"></i> Add to Cart</button>')
      + '</div></div>';
  });
  html += '</div>'
    + '<div id="studentCartView" style="margin-top:16px;"></div>';
  container.innerHTML = html;
  renderStudentCart();
}

function renderStudentCart() {
  var container = document.getElementById('studentCartView');
  if (!container) return;
  var cart = JSON.parse(localStorage.getItem('eduverse_store_cart') || '[]');
  if (!cart.length) { container.innerHTML = ''; return; }
  var total = cart.reduce(function(s, i) { return s + (i.price || 0) * (i.qty || 0); }, 0);
  var html = '<div class="card"><h4 style="font-weight:600;margin-bottom:8px;">Your Cart</h4>';
  cart.forEach(function(item, i) {
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;">'
      + '<span><strong>' + esc(item.name) + '</strong> x' + item.qty + '</span>'
      + '<span>₦' + ((item.price || 0) * item.qty).toLocaleString() + ' <button onclick="removeFromCart(\'' + item.id + '\')" style="background:none;border:none;color:var(--danger);cursor:pointer;margin-left:8px;"><i class="fas fa-times"></i></button></span></div>';
  });
  html += '<div style="display:flex;justify-content:space-between;font-weight:700;padding:8px 0;font-size:15px;">'
    + '<span>Total:</span><span>₦' + total.toLocaleString() + '</span></div>'
    + '<button class="btn btn-primary btn-sm" onclick="checkoutStore()" style="width:100%;margin-top:8px;"><i class="fas fa-credit-card"></i> Checkout</button></div>';
  container.innerHTML = html;
}

function addToCart(productId) {
  var p = (data.storeProducts || []).find(function(x) { return x.id === productId; });
  if (!p) return;
  var cart = JSON.parse(localStorage.getItem('eduverse_store_cart') || '[]');
  var existing = cart.find(function(c) { return c.id === productId; });
  if (existing) { existing.qty++; } else { cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 }); }
  localStorage.setItem('eduverse_store_cart', JSON.stringify(cart));
  renderStudentStore();
  toast('Added to cart!');
}

function removeFromCart(productId) {
  var cart = JSON.parse(localStorage.getItem('eduverse_store_cart') || '[]');
  var idx = cart.findIndex(function(c) { return c.id === productId; });
  if (idx > -1) {
    if (cart[idx].qty > 1) { cart[idx].qty--; } else { cart.splice(idx, 1); }
  }
  localStorage.setItem('eduverse_store_cart', JSON.stringify(cart));
  renderStudentStore();
}

function checkoutStore() {
  var cart = JSON.parse(localStorage.getItem('eduverse_store_cart') || '[]');
  if (!cart.length) { toast('Cart is empty', 'error'); return; }
  var total = cart.reduce(function(s, i) { return s + (i.price || 0) * (i.qty || 0); }, 0);
  // Record order
  if (!data.storeOrders) data.storeOrders = [];
  data.storeOrders.push({
    id: 'ORD' + Date.now(),
    customer: currentStudent?.name || currentParent?.name || 'Walk-in',
    items: cart.map(function(i) { return i.name + ' x' + i.qty; }).join(', '),
    total: total,
    status: 'pending',
    date: new Date().toISOString().slice(0, 10)
  });
  saveData();
  // Initiate payment if gateway available
  if (typeof initiateGatewayPayment === 'function' && currentStudent?.contact) {
    initiateGatewayPayment(total, currentStudent.contact, currentStudent.name, 'STR-' + Date.now(), function() {
      var order = data.storeOrders[data.storeOrders.length - 1];
      if (order) order.status = 'paid';
      saveData();
      toast('Payment successful! Order placed.');
    }, function() {
      toast('Payment cancelled. Order saved as pending.', 'info');
    });
  } else {
    toast('Order placed! Pay on pickup.', 'info');
  }
  localStorage.removeItem('eduverse_store_cart');
  var container = document.getElementById('studentStoreView');
  if (container) renderStudentStore();
}


// ===== SCIENTIFIC CALCULATOR =====
var _calcState = { expr: '', memory: 0, isRadian: false, history: [], ans: 0 };

function _calcHandleKey(e) {
  var grid = document.getElementById('calcGrid');
  var overlay = document.getElementById('modalOverlay');
  if (!grid || !overlay || !overlay.classList.contains('active')) { document.removeEventListener('keydown', _calcHandleKey); return; }
  var key = e.key;
  var map = {
    'Enter': '=', 'Escape': 'clear', 'Delete': 'clear', 'Backspace': 'back',
    '*': '*', '/': '/', '+': '+', '-': '-', '.': '.', '%': '%',
    '(': '(', ')': ')', '^': '^'
  };
  if (key === 'c' || key === 'C') { calcInput('clear'); e.preventDefault(); return; }
  if (key in map) { calcInput(map[key]); e.preventDefault(); return; }
  if (/^[0-9]$/.test(key)) { calcInput(key); e.preventDefault(); return; }
}

function openCalculator() {
  openModal('<div class="calc-wrapper"><div class="calc-display"><div class="calc-expr" id="calcExpr"></div><div class="calc-result" id="calcResult">0</div></div><div class="calc-grid" id="calcGrid"></div><div class="calc-footer"><button class="btn btn-sm" onclick="calcHistory()"><i class="fas fa-history"></i> History</button><button class="btn btn-sm" onclick="calcInput(\'ans\')"><i class="fas fa-redo"></i> ANS</button><span id="calcMode">DEG</span></div></div>');
  document.getElementById('modalContent').style.maxWidth = '380px';
  _calcState.expr = '';
  _calcRenderButtons();
  _calcUpdateDisplay();
  document.addEventListener('keydown', _calcHandleKey);
}

var _calcButtons = [
  {l:'(',a:'('},{l:')',a:')'},{l:'C',a:'clear',c:'danger'},{l:'⌫',a:'back',c:'danger'},{l:'±',a:'neg',c:'danger'},
  {l:'7',a:'7'},{l:'8',a:'8'},{l:'9',a:'9'},{l:'÷',a:'/',c:'op'},{l:'√',a:'sqrt(',c:'sci'},
  {l:'4',a:'4'},{l:'5',a:'5'},{l:'6',a:'6'},{l:'×',a:'*',c:'op'},{l:'x²',a:'^2',c:'sci'},
  {l:'1',a:'1'},{l:'2',a:'2'},{l:'3',a:'3'},{l:'−',a:'-',c:'op'},{l:'x³',a:'^3',c:'sci'},
  {l:'0',a:'0'},{l:'.',a:'.'},{l:'π',a:'pi',c:'sci'},{l:'+',a:'+',c:'op'},{l:'=',a:'=',c:'eq'},
  {sep:true},
  {l:'sin',a:'sin(',c:'sci'},{l:'cos',a:'cos(',c:'sci'},{l:'tan',a:'tan(',c:'sci'},{l:'log',a:'log(',c:'sci'},{l:'ln',a:'ln(',c:'sci'},
  {l:'sin⁻¹',a:'asin(',c:'sci'},{l:'cos⁻¹',a:'acos(',c:'sci'},{l:'tan⁻¹',a:'atan(',c:'sci'},{l:'xʸ',a:'^',c:'sci'},{l:'10ˣ',a:'10^',c:'sci'},
  {l:'sinh',a:'sinh(',c:'sci'},{l:'cosh',a:'cosh(',c:'sci'},{l:'tanh',a:'tanh(',c:'sci'},{l:'x!',a:'!',c:'sci'},{l:'|x|',a:'abs(',c:'sci'},
  {l:'e',a:'euler',c:'sci'},{l:'eˣ',a:'exp(',c:'sci'},{l:'1/x',a:'inv',c:'sci'},{l:'∛',a:'cbrt(',c:'sci'},{l:'log₂',a:'log2(',c:'sci'},
  {sep:true},
  {l:'MC',a:'mc',c:'mem'},{l:'MR',a:'mr',c:'mem'},{l:'M+',a:'mplus',c:'mem'},{l:'M−',a:'mminus',c:'mem'},{l:'DEG',a:'mode',c:'sci'}
];

function _calcRenderButtons() {
  var grid = document.getElementById('calcGrid');
  if (!grid) return;
  grid.innerHTML = _calcButtons.map(function(b) {
    if (b.sep) return '<div class="calc-sep"></div>';
    var cls = 'calc-btn' + (b.c ? ' calc-' + b.c : '');
    return '<button class="' + cls + '" onclick="calcInput(\'' + b.a.replace(/'/g, "\\'") + '\')" tabindex="-1">' + b.l + '</button>';
  }).join('');
}

function calcInput(val) {
  if (val === 'clear') { _calcState.expr = ''; _calcUpdateDisplay(); return; }
  if (val === 'back') { _calcState.expr = _calcState.expr.slice(0, -1); _calcUpdateDisplay(); return; }
  if (val === 'neg') {
    var e = _calcState.expr;
    var m = e.match(/([\d.]+)$/);
    if (m) { var pre = e.slice(0, -m[1].length); _calcState.expr = pre + (m[1].charAt(0)==='-' ? m[1].slice(1) : '-' + m[1]); }
    else _calcState.expr = e + '(-';
    _calcUpdateDisplay();
    return;
  }
  if (val === 'mc') { _calcState.memory = 0; toast('Memory cleared'); return; }
  if (val === 'mr') { _calcState.expr += _calcState.memory; _calcUpdateDisplay(); return; }
  if (val === 'mplus') { try { var r = _calcEvaluate(_calcState.expr); if (typeof r === 'number' && isFinite(r)) _calcState.memory += r; } catch(e){} return; }
  if (val === 'mminus') { try { var r = _calcEvaluate(_calcState.expr); if (typeof r === 'number' && isFinite(r)) _calcState.memory -= r; } catch(e){} return; }
  if (val === 'mode') { _calcState.isRadian = !_calcState.isRadian; var m2 = document.getElementById('calcMode'); if (m2) m2.textContent = _calcState.isRadian ? 'RAD' : 'DEG'; return; }
  if (val === 'ans') { _calcState.expr += _calcState.ans; _calcUpdateDisplay(); return; }
  if (val === '=') {
    try {
      var r = _calcEvaluate(_calcState.expr);
      if (typeof r === 'number' && isFinite(r)) {
        _calcState.history.push({ expr: _calcState.expr, result: r });
        _calcState.ans = r;
        _calcState.expr = String(r);
      } else throw new Error('Invalid');
    } catch(e) {
      var d = document.getElementById('calcResult');
      if (d) { d.textContent = 'Error'; d.classList.add('error'); }
      return;
    }
    _calcUpdateDisplay();
    return;
  }
  _calcState.expr += val;
  _calcUpdateDisplay();
}

function _calcEvaluate(expr) {
  var s = expr;
  s = s.replace(/÷/g, '/').replace(/×/g, '*');
  s = s.replace(/π/g, 'Math.PI').replace(/euler/g, 'Math.E');
  s = s.replace(/sin\(/g, '_sin(').replace(/cos\(/g, '_cos(').replace(/tan\(/g, '_tan(');
  s = s.replace(/asin\(/g, 'Math.asin(').replace(/acos\(/g, 'Math.acos(').replace(/atan\(/g, 'Math.atan(');
  s = s.replace(/sinh\(/g, 'Math.sinh(').replace(/cosh\(/g, 'Math.cosh(').replace(/tanh\(/g, 'Math.tanh(');
  s = s.replace(/log\(/g, '_log(').replace(/ln\(/g, '_ln(').replace(/log2\(/g, '_log2(');
  s = s.replace(/sqrt\(/g, 'Math.sqrt(').replace(/cbrt\(/g, 'Math.cbrt(').replace(/abs\(/g, 'Math.abs(');
  s = s.replace(/exp\(/g, 'Math.exp(');
  s = s.replace(/\^/g, '**');
  s = s.replace(/inv/g, '(1/');
  s = s.replace(/(\d+)!/g, 'factorial($1)');
  s = s.replace(/\)!/g, ')!');
  s = s.replace(/%/g, '/100');
  var openC = (s.match(/\(/g) || []).length;
  var closeC = (s.match(/\)/g) || []).length;
  while (closeC < openC) { s += ')'; closeC++; }
  var fn = new Function('_sin', '_cos', '_tan', '_log', '_ln', '_log2', 'factorial', 'return (' + s + ')');
  return fn(
    function(x) { return Math.sin(_calcState.isRadian ? x : x * Math.PI / 180); },
    function(x) { return Math.cos(_calcState.isRadian ? x : x * Math.PI / 180); },
    function(x) { return Math.tan(_calcState.isRadian ? x : x * Math.PI / 180); },
    function(x) { return Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10; },
    function(x) { return Math.log(x); },
    function(x) { return Math.log2 ? Math.log2(x) : Math.log(x) / Math.LN2; },
    function(n) { if (n < 0 || !Number.isInteger(n)) return NaN; if (n === 0 || n === 1) return 1; for (var i = n - 1; i > 0; i--) n *= i; return n; }
  );
}

function _calcUpdateDisplay() {
  var ex = document.getElementById('calcExpr');
  var res = document.getElementById('calcResult');
  if (ex) ex.textContent = _calcState.expr || '\u200B';
  if (res) {
    if (_calcState.expr) {
      try { var r = _calcEvaluate(_calcState.expr); if (typeof r === 'number' && isFinite(r)) { res.textContent = Number(r.toPrecision(12)).toString(); res.classList.remove('error'); } else { res.textContent = '...'; res.classList.remove('error'); } } catch(e) { res.textContent = '...'; res.classList.remove('error'); }
    } else { res.textContent = '0'; res.classList.remove('error'); }
  }
}

function calcHistory() {
  if (!_calcState.history.length) { toast('No history', 'info'); return; }
  var h = _calcState.history.map(function(item, i) {
    return '<div style="padding:8px 12px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:13px;"><span>' + htmlEscape(item.expr) + ' = <strong>' + item.result + '</strong></span><button class="btn btn-sm" onclick="closeModal();openCalculator();_calcState.expr=' + JSON.stringify(item.expr) + ';_calcUpdateDisplay()"><i class="fas fa-redo"></i></button></div>';
  }).join('');
  openModal('<h3><i class="fas fa-history"></i> Calculation History</h3>' + (h || '<div class="empty-state"><i class="fas fa-calculator"></i><p>No calculations yet</p></div>') + '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal();openCalculator()">Back</button><button class="btn btn-danger" onclick="if(confirm(\'Clear all history?\')){_calcState.history=[];calcHistory()}">Clear All</button></div>');
}


// ===== GLOBAL EDUCATION NEWS FEED =====
var _eduNewsFeeds = {
  scholarships: 'https://news.google.com/rss/search?q=international+scholarships+for+students+2026&hl=en-US&gl=US&ceid=US:en',
  competitions: 'https://news.google.com/rss/search?q=student+competitions+olympiads+contests+2026&hl=en-US&gl=US&ceid=US:en',
  africa: 'https://news.google.com/rss/search?q=education+Africa+schools+universities+students+2026&hl=en-US&gl=US&ceid=US:en',
  americas: 'https://news.google.com/rss/search?q=education+USA+Canada+schools+scholarships+students+2026&hl=en-US&gl=US&ceid=US:en',
  asia: 'https://news.google.com/rss/search?q=education+Asia+India+China+Japan+schools+universities+2026&hl=en-US&gl=US&ceid=US:en'
};
var _eduNewsTab = 'scholarships';

function renderEducationNews(tab) {
  if (tab) _eduNewsTab = tab;
  var container = document.getElementById('eduNewsView');
  if (!container) return;
  var cats = [
    { key: 'scholarships', label: 'Scholarships', icon: 'fa-graduation-cap' },
    { key: 'competitions', label: 'Competitions', icon: 'fa-trophy' },
    { key: 'africa', label: 'Africa', icon: 'fa-globe-africa' },
    { key: 'americas', label: 'Americas', icon: 'fa-globe-americas' },
    { key: 'asia', label: 'Asia', icon: 'fa-globe-asia' }
  ];
  var html = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">';
  cats.forEach(function(c) {
    var active = c.key === _eduNewsTab ? ' style="background:var(--primary);color:#fff;border-color:var(--primary);"' : '';
    html += '<button class="btn btn-sm" onclick="renderEducationNews(\'' + c.key + '\')"' + active + '><i class="fas ' + c.icon + '"></i> ' + c.label + '</button>';
  });
  html += '</div><div id="eduNewsGrid" style="min-height:200px;"><div class="loading-overlay active" style="display:flex;position:relative;min-height:200px;"><div class="loading-spinner"></div></div></div>';
  container.innerHTML = html;
  _eduFetchAndRender();
}

function _eduFetchAndRender() {
  var grid = document.getElementById('eduNewsGrid');
  if (!grid) return;
  var feedUrl = _eduNewsFeeds[_eduNewsTab];
  if (!feedUrl) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-rss"></i><p>No feed configured</p></div>'; return; }
  var cacheKey = '_eduNews_' + _eduNewsTab;
  try {
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.ts && Date.now() - parsed.ts < 3600000) {
        _eduRenderItems(grid, parsed.items || []);
        return;
      }
    }
  } catch(e) {}
  var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl) + '&api_key=ustkz6qg6w4jbmzkwcferwcrv2cjjbtvv89htnni&count=20';
  fetch(proxyUrl).then(function(r) { return r.json(); }).then(function(data) {
    var items = [];
    if (data && data.items && data.items.length) {
      items = data.items.map(function(item) {
        var desc = item.description || '';
        var img = '';
        var m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m) img = m[1];
        desc = desc.replace(/<[^>]+>/g, '').substring(0, 200);
        return { title: item.title, link: item.link, description: desc, image: img, pubDate: item.pubDate, source: item.source || item.author || 'Google News' };
      });
    }
    try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items: items })); } catch(e) {}
    _eduRenderItems(grid, items);
  }).catch(function() {
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Unable to load news. Check your internet connection or try again later.</p></div>';
  });
}

function _eduRenderItems(grid, items) {
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No news articles found for this category. Try again later.</p></div>';
    return;
  }
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">';
  items.forEach(function(item) {
    var imgHtml = item.image ? '<div style="height:160px;overflow:hidden;border-radius:8px 8px 0 0;"><img src="' + htmlEscape(item.image) + '" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'"></div>' : '';
    html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:var(--transition);display:flex;flex-direction:column;">' +
      imgHtml +
      '<div style="padding:14px;flex:1;display:flex;flex-direction:column;">' +
      '<div style="font-size:11px;color:var(--text-light);margin-bottom:4px;"><i class="fas fa-clock"></i> ' + htmlEscape((item.pubDate || '').split(' ')[0]) + ' &middot; ' + htmlEscape(item.source) + '</div>' +
      '<h4 style="font-size:14px;font-weight:600;margin-bottom:6px;line-height:1.4;">' + htmlEscape(item.title) + '</h4>' +
      '<p style="font-size:13px;color:var(--text-light);flex:1;line-height:1.5;">' + htmlEscape(item.description) + '</p>' +
      '<div style="margin-top:10px;"><a href="' + htmlEscape(item.link) + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;"><i class="fas fa-external-link-alt"></i> Read More</a></div>' +
      '</div></div>';
  });
  html += '</div>';
  grid.innerHTML = html;
}
