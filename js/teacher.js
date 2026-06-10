// EDUVERSE - Teacher Portal Module
// Dashboard, assignments, class roster management

function renderTeacherPortal() {
  if (!currentTeacher) return;
  switchTeacherPanel('dashboard');
  renderTeacherDashboard();
  renderTeacherAssignments();
  renderTeacherRoster();
  if (typeof renderGalleryView === 'function') renderGalleryView('tchGalleryView');
  if (typeof renderAITools === 'function') renderAITools();
  if (typeof applyTranslations === 'function') applyTranslations();
}

function renderTeacherDashboard() {
  if (!currentTeacher) return;
  var t = currentTeacher;
  var el;
  el = document.getElementById('teacherNameDisplay'); if (el) el.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> ' + htmlEscape(t.name);
  el = document.getElementById('teacherClassInfo'); if (el) el.textContent = 'Class: ' + t.assignedClass;

  var classStudents = data.students.filter(function(s) { return s.class === t.assignedClass; });
  el = document.getElementById('tDashStudents'); if (el) el.textContent = String(classStudents.length);

  var today = new Date().toISOString().split('T')[0];
  var presentToday = data.attendance.filter(function(a) { return a.date === today && a.status === 'present' && classStudents.some(function(s) { return s.id === a.studentId; }); });
  el = document.getElementById('tDashPresent'); if (el) el.textContent = String(presentToday.length);

  var myAssignments = data.assignments.filter(function(a) { return a.teacherId === t.id; });
  el = document.getElementById('tDashAssignments'); if (el) el.textContent = String(myAssignments.length);

  var myAsnIds = myAssignments.map(function(a) { return a.id; });
  var allSubs = (data.submissions || []).filter(function(s) { return myAsnIds.indexOf(s.assignmentId) !== -1; });
  el = document.getElementById('tDashPendingSubs'); if (el) el.textContent = String(allSubs.filter(function(s) { return s.status === 'submitted'; }).length);
  el = document.getElementById('tDashGradedSubs'); if (el) el.textContent = String(allSubs.filter(function(s) { return s.status === 'graded'; }).length);

  var classResults = data.results.filter(function(r) { return classStudents.some(function(s) { return s.id === r.studentId; }); });
  var scores = classResults.map(function(r) { return r.score; });
  var avg = scores.length ? Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length) : '--';
  el = document.getElementById('tDashAvg'); if (el) el.textContent = avg + (avg !== '--' ? '%' : '');

  var tbody = document.getElementById('tDashStudentsTable');
  var empty = document.getElementById('tDashStudentsEmpty');
  if (!tbody || !empty) return;
  if (classStudents.length) {
    tbody.innerHTML = classStudents.map(function(s) { return '<tr><td>' + htmlEscape(s.id) + '</td><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.contact) + '</td></tr>'; }).join('');
    empty.style.display = 'none';
  } else { tbody.innerHTML = ''; empty.style.display = 'block'; }
}

function renderTeacherRoster() {
  if (!currentTeacher) return;
  var t = currentTeacher;
  var el = document.getElementById('teacherRosterInfo'); if (el) el.textContent = 'Students in ' + t.assignedClass;
  var roster = data.students.filter(function(s) { return s.class === t.assignedClass; });
  var tbody = document.getElementById('teacherRosterTable');
  var empty = document.getElementById('teacherRosterEmpty');
  if (!tbody || !empty) return;
  if (roster.length) {
    tbody.innerHTML = roster.map(function(s) { return '<tr><td>' + htmlEscape(s.id) + '</td><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.contact) + '</td></tr>'; }).join('');
    empty.style.display = 'none';
  } else { tbody.innerHTML = ''; empty.style.display = 'block'; }
}

function renderTeacherAssignments() {
  if (!currentTeacher) return;
  var dflt = document.getElementById('teacherAssignmentsDefault');
  var subsView = document.getElementById('teacherSubmissionsView');
  if (dflt) dflt.style.display = '';
  if (subsView) subsView.innerHTML = '';
  var t = currentTeacher;
  var myAsns = data.assignments.filter(function(a) { return a.teacherId === t.id; }).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  var tbody = document.getElementById('teacherAssignmentsTable');
  var empty = document.getElementById('teacherAssignmentsEmpty');
  if (!tbody || !empty) return;
  if (myAsns.length) {
    tbody.innerHTML = myAsns.map(function(a) {
      var overdue = new Date(a.dueDate) < new Date();
      return '<tr><td><strong>' + htmlEscape(a.title) + '</strong></td><td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + htmlEscape(a.description) + '</td><td><span class="badge" style="background:' + (overdue ? '#fed7d7' : '#c6f6d5') + ';color:' + (overdue ? '#9b2c2c' : '#22543d') + ';">' + htmlEscape(a.dueDate) + '</span></td><td>' + htmlEscape(a.class) + '</td><td>' + htmlEscape(a.createdAt) + '</td><td style="white-space:nowrap;"><button class="btn btn-sm btn-primary" onclick="showEditAssignmentModal(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteAssignment(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    }).join('');
    empty.style.display = 'none';
  } else { tbody.innerHTML = ''; empty.style.display = 'block'; }
}

function showAddAssignmentModal() {
  const t = currentTeacher;
  const today = new Date().toISOString().split('T')[0];
  openModal(`
    <h3><i class="fas fa-plus"></i> Upload Assignment</h3>
    <p style="color:var(--text-light);font-size:14px;margin-bottom:16px;">Posting to: <strong>${htmlEscape(t.assignedClass)}</strong></p>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Assignment Title</label><input type="text" id="fAsnTitle" placeholder="e.g. Chapter 5 Homework"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Description / Instructions</label><textarea id="fAsnDesc" rows="4" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Describe the assignment details..."></textarea></div>
      <div class="form-group"><label>Due Date</label><input type="date" id="fAsnDue" min="${today}" value="${today}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-success" onclick="saveAssignment()"><i class="fas fa-upload"></i> Post Assignment</button>
    </div>
  `);
}

function saveAssignment() {
  const t = currentTeacher;
  const title = document.getElementById('fAsnTitle').value.trim();
  const description = document.getElementById('fAsnDesc').value.trim();
  const dueDate = document.getElementById('fAsnDue').value;
  if (!title || !description || !dueDate) { toast('Please fill all fields', 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  data.assignments.push({
    id: genId('ASN'),
    teacherId: t.id,
    title,
    description,
    dueDate,
    class: t.assignedClass,
    createdAt: today
  });
  saveData();
  logActivity(`Teacher ${t.name} posted assignment: ${title} for ${t.assignedClass}`);
  closeModal();
  renderTeacherAssignments();
  toast('Assignment posted successfully!');
}

function showEditAssignmentModal(id) {
  var a = data.assignments.find(function(x) { return x.id === id; });
  if (!a) return;
  openModal('<h3><i class="fas fa-edit"></i> Edit Assignment</h3><div class="form-grid"><div class="form-group" style="grid-column:1/-1;"><label>Assignment Title</label><input type="text" id="fAsnTitle" value="' + htmlEscape(a.title) + '"></div><div class="form-group" style="grid-column:1/-1;"><label>Description / Instructions</label><textarea id="fAsnDesc" rows="4" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;">' + htmlEscape(a.description) + '</textarea></div><div class="form-group"><label>Due Date</label><input type="date" id="fAsnDue" value="' + htmlEscape(a.dueDate) + '"></div></div><input type="hidden" id="fEditAsnId" value="' + id + '"><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateAssignment()"><i class="fas fa-save"></i> Update</button></div>');
}

function updateAssignment() {
  var id = document.getElementById('fEditAsnId')?.value;
  var a = data.assignments.find(function(x) { return x.id === id; });
  if (!a) return;
  a.title = document.getElementById('fAsnTitle')?.value?.trim() || a.title;
  a.description = document.getElementById('fAsnDesc')?.value?.trim() || a.description;
  a.dueDate = document.getElementById('fAsnDue')?.value || a.dueDate;
  saveData();
  logActivity('Teacher updated assignment: ' + a.title);
  closeModal();
  renderTeacherAssignments();
  toast('Assignment updated');
}

function deleteAssignment(id) {
  if (!confirm('Delete this assignment?')) return;
  data.assignments = data.assignments.filter(a => a.id !== id);
  saveData();
  renderTeacherAssignments();
  toast('Assignment deleted');
}
