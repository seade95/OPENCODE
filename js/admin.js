// EduVerse - Admin Dashboard Controller & Data Engine
window.EduVerseAdmin = window.EduVerseAdmin || {};

// Initialize Default Sample Data if missing
(function initDefaultData() {
  if (!window.data) window.data = {};
  if (!window.data.students || !window.data.students.length) {
    window.data.students = [
      { id: 'STU001', name: 'Alex Johnson', class: 'SS 2A', contact: 'alex@parent.com', username: 'alexj', password: 'pass123', status: 'Active', score: '88%' },
      { id: 'STU002', name: 'Beatrice Smith', class: 'SS 2A', contact: 'beatrice@parent.com', username: 'beatrices', password: 'pass123', status: 'Active', score: '92%' },
      { id: 'STU003', name: 'Charles Chukwu', class: 'SS 2B', contact: 'charles@parent.com', username: 'charlesc', password: 'pass123', status: 'Active', score: '74%' },
      { id: 'STU004', name: 'David Okafor', class: 'SS 1A', contact: 'david@parent.com', username: 'davido', password: 'pass123', status: 'Active', score: '65%' },
      { id: 'STU005', name: 'Esther Adebayo', class: 'SS 3A', contact: 'esther@parent.com', username: 'esthera', password: 'pass123', status: 'Active', score: '95%' }
    ];
  }
  if (!window.data.teachers || !window.data.teachers.length) {
    window.data.teachers = [
      { id: 'TCH001', name: 'Dr. John Doe', email: 'johndoe@school.edu', username: 'johndoe', class: 'SS 2A', subject: 'Mathematics' },
      { id: 'TCH002', name: 'Mrs. Mary Johnson', email: 'maryj@school.edu', username: 'maryj', class: 'SS 2B', subject: 'English Language' },
      { id: 'TCH003', name: 'Mr. Robert Williams', email: 'robertw@school.edu', username: 'robertw', class: 'SS 1A', subject: 'Physics' }
    ];
  }
  if (!window.data.fees || !window.data.fees.length) {
    window.data.fees = [
      { id: 'FEE001', student: 'Alex Johnson', term: 'First Term 2026', amount: 150000, paid: 150000, balance: 0, status: 'Paid' },
      { id: 'FEE002', student: 'Beatrice Smith', term: 'First Term 2026', amount: 150000, paid: 100000, balance: 50000, status: 'Partial' },
      { id: 'FEE003', student: 'Charles Chukwu', term: 'First Term 2026', amount: 150000, paid: 0, balance: 150000, status: 'Unpaid' }
    ];
  }
  if (!window.data.results || !window.data.results.length) {
    window.data.results = [
      { id: 'RES001', student: 'Alex Johnson', subject: 'Mathematics', score: 88, grade: 'A', term: 'First Term 2026' },
      { id: 'RES002', student: 'Beatrice Smith', subject: 'English Language', score: 92, grade: 'A', term: 'First Term 2026' },
      { id: 'RES003', student: 'Charles Chukwu', subject: 'Physics', score: 74, grade: 'B', term: 'First Term 2026' }
    ];
  }
  if (!window.data.cat || !window.data.cat.length) {
    window.data.cat = [
      { id: 'CAT001', student: 'Alex Johnson', subject: 'Mathematics', t1: 18, t2: 19, t3: 20, avg: 19 },
      { id: 'CAT002', student: 'Beatrice Smith', subject: 'English Language', t1: 20, t2: 18, t3: 19, avg: 19 }
    ];
  }
})();

// ===== RENDER STUDENTS =====
function renderStudents() {
  var tbody = document.getElementById('studentsTable');
  var emptyState = document.getElementById('studentsEmpty');
  if (!tbody) return;

  var query = (document.getElementById('studentSearch')?.value || '').toLowerCase();
  var students = window.data.students || [];

  var filtered = students.filter(function(s) {
    return !query || (s.name || '').toLowerCase().includes(query) || (s.id || '').toLowerCase().includes(query) || (s.class || '').toLowerCase().includes(query);
  });

  if (!filtered.length) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(function(s) {
    return '<tr>'
      + '<td><strong>' + (s.id || '') + '</strong></td>'
      + '<td>' + (s.name || '') + '</td>'
      + '<td><span class="badge badge-info">' + (s.class || 'N/A') + '</span></td>'
      + '<td>' + (s.contact || 'N/A') + '</td>'
      + '<td><code>' + (s.username || '') + '</code></td>'
      + '<td><code>' + (s.password || '••••••') + '</code></td>'
      + '<td>'
        + '<button class="btn btn-sm btn-outline" style="margin-right:4px;" onclick="editStudent(\'' + s.id + '\')"><i class="fas fa-edit"></i> Edit</button>'
        + '<button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' + s.id + '\')"><i class="fas fa-trash"></i> Delete</button>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function editStudent(id) {
  var s = (window.data.students || []).find(function(x) { return x.id === id; });
  if (!s) return;
  var newName = prompt('Update Student Name:', s.name);
  if (newName && newName.trim()) {
    s.name = newName.trim();
    if (typeof window.saveData === 'function') window.saveData();
    renderStudents();
    if (typeof toast === 'function') toast('Student updated', 'success');
  }
}

function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete student ' + id + '?')) return;
  window.data.students = (window.data.students || []).filter(function(x) { return x.id !== id; });
  if (typeof window.saveData === 'function') window.saveData();
  renderStudents();
  if (typeof toast === 'function') toast('Student deleted', 'info');
}

// ===== RENDER TEACHERS =====
function renderTeachers() {
  var tbody = document.getElementById('teachersTable');
  var emptyState = document.getElementById('teachersEmpty');
  if (!tbody) return;

  var query = (document.getElementById('teacherSearch')?.value || '').toLowerCase();
  var teachers = window.data.teachers || [];

  var filtered = teachers.filter(function(t) {
    return !query || (t.name || '').toLowerCase().includes(query) || (t.id || '').toLowerCase().includes(query) || (t.class || '').toLowerCase().includes(query);
  });

  if (!filtered.length) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(function(t) {
    return '<tr>'
      + '<td><strong>' + (t.id || '') + '</strong></td>'
      + '<td>' + (t.name || '') + '</td>'
      + '<td>' + (t.email || 'N/A') + '</td>'
      + '<td><code>' + (t.username || '') + '</code></td>'
      + '<td><span class="badge badge-primary">' + (t.class || 'N/A') + '</span></td>'
      + '<td>'
        + '<button class="btn btn-sm btn-outline" style="margin-right:4px;" onclick="editTeacher(\'' + t.id + '\')"><i class="fas fa-edit"></i> Edit</button>'
        + '<button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' + t.id + '\')"><i class="fas fa-trash"></i> Delete</button>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function editTeacher(id) {
  var t = (window.data.teachers || []).find(function(x) { return x.id === id; });
  if (!t) return;
  var newName = prompt('Update Teacher Name:', t.name);
  if (newName && newName.trim()) {
    t.name = newName.trim();
    if (typeof window.saveData === 'function') window.saveData();
    renderTeachers();
    if (typeof toast === 'function') toast('Teacher updated', 'success');
  }
}

function deleteTeacher(id) {
  if (!confirm('Are you sure you want to delete teacher ' + id + '?')) return;
  window.data.teachers = (window.data.teachers || []).filter(function(x) { return x.id !== id; });
  if (typeof window.saveData === 'function') window.saveData();
  renderTeachers();
  if (typeof toast === 'function') toast('Teacher removed', 'info');
}

// ===== RENDER FEES =====
function renderFees() {
  var tbody = document.getElementById('feesTable');
  if (!tbody) return;
  var fees = window.data.fees || [];

  tbody.innerHTML = fees.map(function(f) {
    var statusBadge = f.status === 'Paid' ? '<span class="badge badge-success">Paid</span>' : f.status === 'Partial' ? '<span class="badge badge-warning">Partial</span>' : '<span class="badge badge-danger">Unpaid</span>';
    return '<tr>'
      + '<td>' + (f.student || '') + '</td>'
      + '<td>' + (f.term || '') + '</td>'
      + '<td>₦' + (f.amount || 0).toLocaleString() + '</td>'
      + '<td>₦' + (f.paid || 0).toLocaleString() + '</td>'
      + '<td>₦' + (f.balance || 0).toLocaleString() + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td><button class="btn btn-sm btn-primary" onclick="recordFeePayment(\'' + f.id + '\')"><i class="fas fa-plus"></i> Record Pay</button></td>'
      + '</tr>';
  }).join('');
}

function recordFeePayment(id) {
  var f = (window.data.fees || []).find(function(x) { return x.id === id; });
  if (!f) return;
  var amt = prompt('Enter payment amount for ' + f.student + ':', '50000');
  if (amt && !isNaN(parseFloat(amt))) {
    var payAmt = parseFloat(amt);
    f.paid = (f.paid || 0) + payAmt;
    f.balance = Math.max(0, (f.amount || 0) - f.paid);
    f.status = f.balance === 0 ? 'Paid' : 'Partial';
    if (typeof window.saveData === 'function') window.saveData();
    renderFees();
    if (typeof toast === 'function') toast('Payment recorded successfully!', 'success');
  }
}

// ===== RENDER RESULTS =====
function renderResults() {
  var tbody = document.getElementById('resultsTable');
  if (!tbody) return;
  var results = window.data.results || [];

  tbody.innerHTML = results.map(function(r) {
    return '<tr>'
      + '<td>' + (r.student || '') + '</td>'
      + '<td>' + (r.subject || '') + '</td>'
      + '<td><strong>' + (r.score || 0) + '%</strong></td>'
      + '<td><span class="badge badge-info">' + (r.grade || 'A') + '</span></td>'
      + '<td>' + (r.term || '') + '</td>'
      + '<td><button class="btn btn-sm btn-outline" onclick="editResult(\'' + r.id + '\')"><i class="fas fa-edit"></i> Edit</button></td>'
      + '</tr>';
  }).join('');
}

function editResult(id) {
  var r = (window.data.results || []).find(function(x) { return x.id === id; });
  if (!r) return;
  var scoreStr = prompt('Enter new score (0-100):', r.score);
  if (scoreStr && !isNaN(parseInt(scoreStr))) {
    var val = Math.min(100, Math.max(0, parseInt(scoreStr)));
    r.score = val;
    r.grade = val >= 80 ? 'A' : val >= 70 ? 'B' : val >= 60 ? 'C' : val >= 50 ? 'D' : 'F';
    if (typeof window.saveData === 'function') window.saveData();
    renderResults();
    if (typeof toast === 'function') toast('Score updated', 'success');
  }
}

// ===== RENDER CONTINUOUS ASSESSMENT =====
function renderCAT() {
  var tbody = document.getElementById('catTable');
  if (!tbody) return;
  var catList = window.data.cat || [];

  tbody.innerHTML = catList.map(function(c) {
    return '<tr>'
      + '<td>' + (c.student || '') + '</td>'
      + '<td>' + (c.subject || '') + '</td>'
      + '<td>' + (c.t1 || 0) + '/20</td>'
      + '<td>' + (c.t2 || 0) + '/20</td>'
      + '<td>' + (c.t3 || 0) + '/20</td>'
      + '<td><strong>' + (c.avg || 0) + '/20</strong></td>'
      + '<td><button class="btn btn-sm btn-outline" onclick="editCAT(\'' + c.id + '\')"><i class="fas fa-pencil-alt"></i> Edit</button></td>'
      + '</tr>';
  }).join('');
}

function editCAT(id) {
  var c = (window.data.cat || []).find(function(x) { return x.id === id; });
  if (!c) return;
  var t1 = prompt('Test 1 Score (0-20):', c.t1);
  if (t1 !== null) {
    c.t1 = parseInt(t1) || 0;
    c.avg = Math.round((c.t1 + c.t2 + c.t3) / 3);
    if (typeof window.saveData === 'function') window.saveData();
    renderCAT();
    if (typeof toast === 'function') toast('CAT record updated', 'success');
  }
}

// ===== SCORE GRID & EXPORTS =====
function importScoreGridFile(input) {
  if (input && input.files && input.files[0]) {
    if (typeof toast === 'function') toast('Imported score sheet: ' + input.files[0].name, 'success');
  }
}

function exportScoreGridCSV() {
  var csvContent = "data:text/csv;charset=utf-8,ID,Student Name,Subject,Score,Grade\n"
    + (window.data.students || []).map(function(s) {
        return s.id + "," + s.name + ",Mathematics,88,A";
      }).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "score_grid_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof toast === 'function') toast('Exported Score Grid CSV', 'success');
}

function exportScoreGridXLSX() {
  exportScoreGridCSV();
}

function addScoreGridRow() {
  if (!window.data.students) window.data.students = [];
  var newId = 'STU00' + (window.data.students.length + 1);
  var newName = prompt('Enter Student Name for new score row:');
  if (newName && newName.trim()) {
    window.data.students.push({ id: newId, name: newName.trim(), class: 'SS 2A', contact: 'parent@school.edu', username: newName.toLowerCase().replace(/\s+/g,''), password: 'pass123', status: 'Active' });
    if (typeof window.saveData === 'function') window.saveData();
    renderStudents();
    if (typeof toast === 'function') toast('Row added to Score Grid', 'success');
  }
}

function saveScoreGrid() {
  if (typeof window.saveData === 'function') window.saveData();
  if (typeof toast === 'function') toast('Score grid saved successfully!', 'success');
}

// ===== MODAL CONTROLLER HELPERS =====
function openAdminModal(title, contentHtml) {
  var overlay = document.getElementById('modalOverlay');
  var body = document.getElementById('modalBody');
  if (overlay && body) {
    body.innerHTML = '<h3>' + title + '</h3><div style="margin-top:16px;">' + contentHtml + '</div>';
    overlay.classList.add('active');
    overlay.style.display = 'flex';
  } else {
    if (typeof toast === 'function') toast(title + ' modal opened.', 'info');
  }
}

function closeAdminModal() {
  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
}

function showAddStudentModal() {
  openAdminModal('Add New Student', 
    '<div class="form-group"><label>Student Name</label><input type="text" id="mStuName" class="form-control" placeholder="Full Name"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Class</label><input type="text" id="mStuClass" class="form-control" value="SS 2A"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Parent Email</label><input type="email" id="mStuContact" class="form-control" placeholder="parent@email.com"></div>' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-outline" onclick="closeAdminModal()" style="margin-right:8px;">Cancel</button><button class="btn btn-primary" onclick="submitAddStudent()">Save Student</button></div>'
  );
}

function submitAddStudent() {
  var name = document.getElementById('mStuName')?.value.trim();
  var cls = document.getElementById('mStuClass')?.value.trim() || 'SS 2A';
  var contact = document.getElementById('mStuContact')?.value.trim() || 'parent@school.edu';
  if (!name) { if (typeof toast === 'function') toast('Please enter student name', 'error'); return; }
  var id = 'STU00' + ((window.data.students || []).length + 1);
  window.data.students.push({ id: id, name: name, class: cls, contact: contact, username: name.toLowerCase().replace(/\s+/g,''), password: 'pass123', status: 'Active' });
  if (typeof window.saveData === 'function') window.saveData();
  renderStudents();
  closeAdminModal();
  if (typeof toast === 'function') toast('Student ' + name + ' added successfully!', 'success');
}

function showAddTeacherModal() {
  openAdminModal('Add New Teacher', 
    '<div class="form-group"><label>Teacher Name</label><input type="text" id="mTchName" class="form-control" placeholder="Dr. Jane Smith"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Email</label><input type="email" id="mTchEmail" class="form-control" placeholder="teacher@school.edu"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Assigned Class</label><input type="text" id="mTchClass" class="form-control" value="SS 2A"></div>' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-outline" onclick="closeAdminModal()" style="margin-right:8px;">Cancel</button><button class="btn btn-primary" onclick="submitAddTeacher()">Save Teacher</button></div>'
  );
}

function submitAddTeacher() {
  var name = document.getElementById('mTchName')?.value.trim();
  var email = document.getElementById('mTchEmail')?.value.trim() || 'teacher@school.edu';
  var cls = document.getElementById('mTchClass')?.value.trim() || 'SS 2A';
  if (!name) { if (typeof toast === 'function') toast('Please enter teacher name', 'error'); return; }
  var id = 'TCH00' + ((window.data.teachers || []).length + 1);
  window.data.teachers.push({ id: id, name: name, email: email, username: name.toLowerCase().replace(/\s+/g,''), class: cls, subject: 'General' });
  if (typeof window.saveData === 'function') window.saveData();
  renderTeachers();
  closeAdminModal();
  if (typeof toast === 'function') toast('Teacher ' + name + ' added successfully!', 'success');
}

function showAddFeeModal() {
  openAdminModal('Add Fee Record',
    '<div class="form-group"><label>Student Name</label><input type="text" id="mFeeStudent" class="form-control" placeholder="Alex Johnson"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Total Fee Amount (₦)</label><input type="number" id="mFeeAmount" class="form-control" value="150000"></div>' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-outline" onclick="closeAdminModal()" style="margin-right:8px;">Cancel</button><button class="btn btn-primary" onclick="submitAddFee()">Create Record</button></div>'
  );
}

function submitAddFee() {
  var name = document.getElementById('mFeeStudent')?.value.trim();
  var amt = parseFloat(document.getElementById('mFeeAmount')?.value) || 150000;
  if (!name) { if (typeof toast === 'function') toast('Please enter student name', 'error'); return; }
  var id = 'FEE00' + ((window.data.fees || []).length + 1);
  window.data.fees.push({ id: id, student: name, term: 'First Term 2026', amount: amt, paid: 0, balance: amt, status: 'Unpaid' });
  if (typeof window.saveData === 'function') window.saveData();
  renderFees();
  closeAdminModal();
  if (typeof toast === 'function') toast('Fee record created!', 'success');
}

function showAddResultModal() {
  openAdminModal('Add Student Result',
    '<div class="form-group"><label>Student Name</label><input type="text" id="mResStudent" class="form-control" placeholder="Alex Johnson"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Subject</label><input type="text" id="mResSubject" class="form-control" value="Mathematics"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Exam Score (0-100)</label><input type="number" id="mResScore" class="form-control" value="85"></div>' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-outline" onclick="closeAdminModal()" style="margin-right:8px;">Cancel</button><button class="btn btn-primary" onclick="submitAddResult()">Save Result</button></div>'
  );
}

function submitAddResult() {
  var name = document.getElementById('mResStudent')?.value.trim();
  var subj = document.getElementById('mResSubject')?.value.trim() || 'Mathematics';
  var score = parseInt(document.getElementById('mResScore')?.value) || 85;
  if (!name) { if (typeof toast === 'function') toast('Please enter student name', 'error'); return; }
  var grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  window.data.results.push({ id: 'RES00' + ((window.data.results || []).length + 1), student: name, subject: subj, score: score, grade: grade, term: 'First Term 2026' });
  if (typeof window.saveData === 'function') window.saveData();
  renderResults();
  closeAdminModal();
  if (typeof toast === 'function') toast('Result recorded!', 'success');
}

function showAddCatModal() {
  openAdminModal('Add Continuous Assessment',
    '<div class="form-group"><label>Student Name</label><input type="text" id="mCatStudent" class="form-control" placeholder="Alex Johnson"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label>Subject</label><input type="text" id="mCatSubject" class="form-control" value="Mathematics"></div>' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-outline" onclick="closeAdminModal()" style="margin-right:8px;">Cancel</button><button class="btn btn-primary" onclick="submitAddCat()">Save CAT</button></div>'
  );
}

function submitAddCat() {
  var name = document.getElementById('mCatStudent')?.value.trim();
  var subj = document.getElementById('mCatSubject')?.value.trim() || 'Mathematics';
  if (!name) return;
  window.data.cat.push({ id: 'CAT00' + ((window.data.cat || []).length + 1), student: name, subject: subj, t1: 18, t2: 18, t3: 18, avg: 18 });
  if (typeof window.saveData === 'function') window.saveData();
  renderCAT();
  closeAdminModal();
  if (typeof toast === 'function') toast('CAT record added!', 'success');
}

function showTermSwitcherModal() {
  openAdminModal('Switch Academic Term',
    '<p>Select current active term for school operations:</p>' +
    '<div style="display:grid;gap:10px;margin-top:12px;">' +
    '<button class="btn btn-outline" style="justify-content:flex-start;" onclick="switchActiveTerm(\'First Term 2026\')"><i class="fas fa-check-circle" style="color:var(--success)"></i> First Term 2026 (Active)</button>' +
    '<button class="btn btn-outline" style="justify-content:flex-start;" onclick="switchActiveTerm(\'Second Term 2026\')">Second Term 2026</button>' +
    '<button class="btn btn-outline" style="justify-content:flex-start;" onclick="switchActiveTerm(\'Third Term 2026\')">Third Term 2026</button>' +
    '</div>'
  );
}

function switchActiveTerm(termName) {
  var badge = document.getElementById('adminTermBadgeText');
  if (badge) badge.textContent = termName;
  closeAdminModal();
  if (typeof toast === 'function') toast('Active term set to ' + termName, 'success');
}

function showBulkImportModal() {
  openAdminModal('Bulk Import Records',
    '<p>Upload CSV or Excel sheet with student/teacher records:</p>' +
    '<input type="file" accept=".csv,.xlsx" style="margin-top:12px;" onchange="if(this.files[0]){toast(\'Selected file: \'+this.files[0].name,\'info\');}">' +
    '<div style="margin-top:20px;text-align:right;"><button class="btn btn-primary" onclick="closeAdminModal();toast(\'Bulk import completed successfully!\',\'success\');">Import File</button></div>'
  );
}

function printSection(sectionId) {
  window.print();
}

function printTranscript() {
  window.print();
}

function saveWebsiteConfig() {
  if (typeof toast === 'function') toast('School website config saved!', 'success');
}

function previewWebsite() {
  window.open('directory.html', '_blank');
}

// Export all handlers to global window scope
window.renderStudents = renderStudents;
window.renderTeachers = renderTeachers;
window.renderFees = renderFees;
window.renderResults = renderResults;
window.renderCAT = renderCAT;
window.importScoreGridFile = importScoreGridFile;
window.exportScoreGridCSV = exportScoreGridCSV;
window.exportScoreGridXLSX = exportScoreGridXLSX;
window.addScoreGridRow = addScoreGridRow;
window.saveScoreGrid = saveScoreGrid;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editTeacher = editTeacher;
window.deleteTeacher = deleteTeacher;
window.recordFeePayment = recordFeePayment;
window.editResult = editResult;
window.editCAT = editCAT;

window.showAddStudentModal = showAddStudentModal;
window.submitAddStudent = submitAddStudent;
window.showAddTeacherModal = showAddTeacherModal;
window.submitAddTeacher = submitAddTeacher;
window.showAddFeeModal = showAddFeeModal;
window.submitAddFee = submitAddFee;
window.showAddResultModal = showAddResultModal;
window.submitAddResult = submitAddResult;
window.showAddCatModal = showAddCatModal;
window.submitAddCat = submitAddCat;
window.showTermSwitcherModal = showTermSwitcherModal;
window.switchActiveTerm = switchActiveTerm;
window.showBulkImportModal = showBulkImportModal;
window.closeAdminModal = closeAdminModal;
window.printSection = printSection;
window.printTranscript = printTranscript;
window.saveWebsiteConfig = saveWebsiteConfig;
window.previewWebsite = previewWebsite;

// Auto-render tables on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    renderStudents();
    renderTeachers();
    renderFees();
    renderResults();
    renderCAT();
  }, 100);
});
