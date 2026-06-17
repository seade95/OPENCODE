// EDUVERSE - Teacher Word Document Upload & Admin Review Module

window._tuFilter = window._tuFilter || 'all';

function renderTeacherUpload(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (!document.getElementById('tuStyles')) {
    var s = document.createElement('style');
    s.id = 'tuStyles';
    s.textContent = '.tu-drop-zone{border:2px dashed #cbd5e0;border-radius:12px;padding:40px 20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--card-bg);margin-bottom:16px}.tu-drop-zone:hover,.tu-drop-zone.dragover{border-color:var(--primary);background:#ebf8ff}.tu-drop-zone.has-file{border-color:#48bb78;background:#f0fff4}.tu-item{background:var(--card-bg);border:1px solid #e2e8f0;border-radius:8px;padding:16px}.tu-meta{font-size:13px;color:var(--text-light)}';
    document.head.appendChild(s);
  }
  var exams = data.teacherExams || [];
  var myExams = exams.filter(function(e) { return e.teacherId === (currentTeacher ? currentTeacher.id : ''); });
  var classes = [];
  (data.students || []).forEach(function(s) { if (classes.indexOf(s.class) < 0) classes.push(s.class); });
  classes.sort();
  var html =
    '<div class="card-header"><h2><i class="fas fa-file-word"></i> Upload Exam Questions</h2></div>' +
    '<p class="subtitle">Upload Word documents (.docx / .doc) containing exam questions for admin review</p>' +
    '<div class="card" style="margin-bottom:16px;"><div style="padding:20px;">' +
    '<div class="form-group"><label>Exam Title</label><input type="text" id="tuTitle" placeholder="e.g. Mid-Term Chemistry Exam"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    '<div class="form-group"><label>Subject</label><input type="text" id="tuSubject" placeholder="e.g. Chemistry"></div>' +
    '<div class="form-group"><label>Class</label><select id="tuClass" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;">' +
    classes.map(function(c) { return '<option value="' + htmlEscape(c) + '">' + htmlEscape(c) + '</option>'; }).join('') +
    '</select></div></div>' +
    '<div class="form-group"><label>Upload Word Document (.docx or .doc)</label>' +
    '<div class="tu-drop-zone" id="tuDropZone" onclick="document.getElementById(\'tuFileInput\').click()">' +
    '<i class="fas fa-file-word" style="font-size:48px;color:var(--primary);margin-bottom:12px;"></i>' +
    '<p style="font-weight:600;color:var(--text);">Drop your Word document here or click to browse</p>' +
    '<p style="font-size:13px;color:var(--text-light);margin-top:4px;">Supports .docx and .doc (max 10MB)</p>' +
    '<p id="tuFileName" style="display:none;margin-top:8px;font-weight:600;color:#48bb78;"></p></div>' +
    '<input type="file" id="tuFileInput" accept=".docx,.doc" style="display:none" onchange="tuHandleFile(this)"></div>' +
    '<div class="form-group"><label>Or paste exam questions manually</label>' +
    '<textarea id="tuManualContent" rows="6" placeholder="Paste exam questions here if you don\'t have a Word document..." style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;resize:vertical;"></textarea></div>' +
    '<div id="tuExtractedContent" style="display:none;margin-bottom:12px;">' +
    '<label>Extracted Text from Document <span style="font-size:12px;color:var(--text-light);">(you can edit)</span></label>' +
    '<textarea id="tuDocContent" rows="8" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;resize:vertical;"></textarea></div>' +
    '<button class="btn btn-primary" onclick="tuSubmitExam()"><i class="fas fa-upload"></i> Submit for Admin Review</button>' +
    '<div id="tuStatus" style="margin-top:8px;"></div></div></div>' +
    '<div class="card"><h3 style="margin-bottom:12px;">My Uploaded Exams</h3>' +
    (myExams.length ? '<div style="display:flex;flex-direction:column;gap:12px;">' + myExams.map(function(e) {
      var bClass = e.status === 'approved' ? 'badge-paid' : e.status === 'rejected' ? 'badge-absent' : 'badge-excused';
      var label = e.status.charAt(0).toUpperCase() + e.status.slice(1);
      return '<div class="tu-item"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><strong>' + htmlEscape(e.title) + '</strong><span class="badge ' + bClass + '">' + label + '</span></div><div class="tu-meta">' + htmlEscape(e.subject) + ' \u00B7 ' + htmlEscape(e.className) + ' \u00B7 ' + new Date(e.uploadDate).toLocaleDateString() + ' \u00B7 ' + htmlEscape(e.fileName) + '</div>' + (e.content ? '<div style="margin-top:8px;padding:8px;background:#f7fafc;border-radius:6px;font-size:13px;max-height:80px;overflow-y:auto;">' + htmlEscape(e.content.substring(0, 300)) + (e.content.length > 300 ? '...' : '') + '</div>' : '') + '</div>';
    }).join('') + '</div>' : '<div class="empty-state"><i class="fas fa-file-word"></i><p>No exams uploaded yet</p></div>') +
    '</div>';
  container.innerHTML = html;
  setTimeout(function() {
    var dz = document.getElementById('tuDropZone');
    if (dz) {
      dz.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('dragover'); });
      dz.addEventListener('dragleave', function() { this.classList.remove('dragover'); });
      dz.addEventListener('drop', function(e) {
        e.preventDefault(); this.classList.remove('dragover');
        var files = e.dataTransfer.files;
        if (files.length) { var inp = document.getElementById('tuFileInput'); if (inp) { inp.files = files; tuHandleFile(inp); } }
      });
    }
  }, 50);
}

window._tuFileData = '';
window._tuFileName = '';

function tuHandleFile(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10MB)', 'error'); input.value = ''; return; }
  window._tuFileName = file.name;
  var fnEl = document.getElementById('tuFileName');
  if (fnEl) { fnEl.textContent = '\u2713 ' + file.name; fnEl.style.display = ''; }
  var dz = document.getElementById('tuDropZone');
  if (dz) dz.classList.add('has-file');
  var abReader = new FileReader();
  abReader.onload = function(ev) {
    if (file.name.toLowerCase().endsWith('.docx') && typeof mammoth !== 'undefined') {
      mammoth.extractRawText({ arrayBuffer: ev.target.result }).then(function(r) {
        var te = document.getElementById('tuDocContent');
        var ce = document.getElementById('tuExtractedContent');
        if (te && r.value) { te.value = r.value; if (ce) ce.style.display = ''; }
      }).catch(function() {});
    } else if (file.name.toLowerCase().endsWith('.doc')) {
      toast('.doc files cannot be auto-extracted. Please paste the exam content manually.', 'warning');
    }
  };
  abReader.readAsArrayBuffer(file);
  var dr = new FileReader();
  dr.onload = function(ev) { window._tuFileData = ev.target.result; };
  dr.readAsDataURL(file);
}

function tuSubmitExam() {
  var title = document.getElementById('tuTitle').value.trim();
  var subject = document.getElementById('tuSubject').value.trim();
  var className = document.getElementById('tuClass').value;
  var docContent = document.getElementById('tuDocContent') ? document.getElementById('tuDocContent').value.trim() : '';
  var manualContent = document.getElementById('tuManualContent').value.trim();
  if (!title) { toast('Please enter an exam title', 'error'); return; }
  if (!subject) { toast('Please enter a subject', 'error'); return; }
  var content = docContent || manualContent || '';
  var exam = {
    id: genId('TEX'),
    teacherId: currentTeacher ? currentTeacher.id : '',
    teacherName: currentTeacher ? currentTeacher.name : '',
    title: title,
    subject: subject,
    className: className,
    content: content,
    fileName: window._tuFileName || '',
    fileData: window._tuFileData || '',
    uploadDate: new Date().toISOString(),
    status: 'pending'
  };
  if (!data.teacherExams) data.teacherExams = [];
  data.teacherExams.push(exam);
  saveData();
  window._tuFileData = '';
  window._tuFileName = '';
  var el = document.getElementById('tuTitle'); if (el) el.value = '';
  el = document.getElementById('tuSubject'); if (el) el.value = '';
  el = document.getElementById('tuDocContent'); if (el) el.value = '';
  el = document.getElementById('tuManualContent'); if (el) el.value = '';
  el = document.getElementById('tuFileInput'); if (el) el.value = '';
  el = document.getElementById('tuFileName'); if (el) el.style.display = 'none';
  el = document.getElementById('tuDropZone'); if (el) el.classList.remove('has-file');
  el = document.getElementById('tuExtractedContent'); if (el) el.style.display = 'none';
  toast('Exam uploaded and sent for admin review!');
  renderTeacherUpload('tchTeacherExams');
}

function renderAdminTeacherExams(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (!document.getElementById('tuStyles')) {
    var s = document.createElement('style');
    s.id = 'tuStyles';
    s.textContent = '.tu-drop-zone{border:2px dashed #cbd5e0;border-radius:12px;padding:40px 20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--card-bg);margin-bottom:16px}.tu-drop-zone:hover,.tu-drop-zone.dragover{border-color:var(--primary);background:#ebf8ff}.tu-drop-zone.has-file{border-color:#48bb78;background:#f0fff4}';
    document.head.appendChild(s);
  }
  var exams = data.teacherExams || [];
  var pendingCount = exams.filter(function(e) { return e.status === 'pending'; }).length;
  var filter = window._tuFilter || 'all';
  var html =
    '<div class="card-header"><h2><i class="fas fa-file-word"></i> Teacher Uploaded Exams</h2>' +
    (pendingCount > 0 ? '<span class="badge badge-excused" style="font-size:14px;">' + pendingCount + ' pending</span>' : '') + '</div>' +
    '<p class="subtitle">Review and approve/reject exam questions uploaded by teachers</p>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm ' + (filter === 'all' ? 'btn-primary' : 'btn-outline') + '" onclick="window._tuFilter=\'all\';renderAdminTeacherExams(\'adminTeacherExams\')">All (' + exams.length + ')</button>' +
    '<button class="btn btn-sm ' + (filter === 'pending' ? 'btn-primary' : 'btn-outline') + '" onclick="window._tuFilter=\'pending\';renderAdminTeacherExams(\'adminTeacherExams\')">Pending (' + exams.filter(function(e){return e.status==='pending';}).length + ')</button>' +
    '<button class="btn btn-sm ' + (filter === 'approved' ? 'btn-primary' : 'btn-outline') + '" onclick="window._tuFilter=\'approved\';renderAdminTeacherExams(\'adminTeacherExams\')">Approved (' + exams.filter(function(e){return e.status==='approved';}).length + ')</button>' +
    '<button class="btn btn-sm ' + (filter === 'rejected' ? 'btn-primary' : 'btn-outline') + '" onclick="window._tuFilter=\'rejected\';renderAdminTeacherExams(\'adminTeacherExams\')">Rejected (' + exams.filter(function(e){return e.status==='rejected';}).length + ')</button>' +
    '</div><div class="card">' +
    (exams.length ? '<div class="table-responsive"><table><thead><tr><th>Title</th><th>Teacher</th><th>Subject</th><th>Class</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
    exams.filter(function(e) { return filter === 'all' || e.status === filter; }).map(function(e) {
      var bClass = e.status === 'approved' ? 'badge-paid' : e.status === 'rejected' ? 'badge-absent' : 'badge-excused';
      var label = e.status.charAt(0).toUpperCase() + e.status.slice(1);
      var actions = '';
      if (e.status === 'pending') actions += '<button class="btn btn-sm" style="background:#48bb78;color:white;margin-right:4px;" onclick="tuApproveExam(\'' + e.id + '\')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-sm" style="background:#fc8181;color:white;" onclick="tuRejectExam(\'' + e.id + '\')"><i class="fas fa-times"></i> Reject</button>';
      if (e.content) actions += '<button class="btn btn-sm btn-outline" style="margin-left:4px;" onclick="tuViewContent(\'' + e.id + '\')"><i class="fas fa-eye"></i> View</button>';
      if (e.fileData) actions += '<button class="btn btn-sm btn-outline" style="margin-left:4px;" onclick="tuDownloadFile(\'' + e.id + '\')"><i class="fas fa-download"></i> Download</button>';
      return '<tr><td><strong>' + htmlEscape(e.title) + '</strong></td><td>' + htmlEscape(e.teacherName) + '</td><td>' + htmlEscape(e.subject) + '</td><td>' + htmlEscape(e.className) + '</td><td>' + new Date(e.uploadDate).toLocaleDateString() + '</td><td><span class="badge ' + bClass + '">' + label + '</span></td><td>' + actions + '</td></tr>';
    }).join('') + '</tbody></table></div>' : '<div class="empty-state"><i class="fas fa-file-word"></i><p>No exam uploads found</p></div>') +
    '</div>';
  container.innerHTML = html;
}

function tuApproveExam(id) {
  var exams = data.teacherExams || [];
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].id === id) { exams[i].status = 'approved'; saveData(); toast('Exam approved!'); renderAdminTeacherExams('adminTeacherExams'); return; }
  }
  toast('Exam not found', 'error');
}

function tuRejectExam(id) {
  var exams = data.teacherExams || [];
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].id === id) { exams[i].status = 'rejected'; saveData(); toast('Exam rejected.'); renderAdminTeacherExams('adminTeacherExams'); return; }
  }
  toast('Exam not found', 'error');
}

function tuViewContent(id) {
  var exams = data.teacherExams || [];
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].id === id) {
      var e = exams[i];
      openModal('<h3><i class="fas fa-file-alt"></i> ' + htmlEscape(e.title) + '</h3><div style="margin:16px 0;"><p style="font-size:13px;color:var(--text-light);">' + htmlEscape(e.subject) + ' \u00B7 ' + htmlEscape(e.className) + ' \u00B7 Uploaded by ' + htmlEscape(e.teacherName) + ' \u00B7 ' + new Date(e.uploadDate).toLocaleDateString() + '</p></div><div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;max-height:400px;overflow-y:auto;white-space:pre-wrap;font-size:14px;line-height:1.6;">' + htmlEscape(e.content) + '</div><div class="modal-actions" style="margin-top:16px;"><button class="btn btn-outline" onclick="closeModal()">Close</button></div>');
      return;
    }
  }
  toast('Exam not found', 'error');
}

function tuDownloadFile(id) {
  var exams = data.teacherExams || [];
  for (var i = 0; i < exams.length; i++) {
    if (exams[i].id === id && exams[i].fileData) {
      var link = document.createElement('a');
      link.href = exams[i].fileData;
      link.download = exams[i].fileName || 'exam.docx';
      link.click();
      return;
    }
  }
  toast('File not found', 'error');
}
