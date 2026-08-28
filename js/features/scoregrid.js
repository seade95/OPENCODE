// EduVerse - scoregrid module
// Extracted from features.js

// ===== INTERACTIVE SCORE GRID =====
var SUBJECT_LIST = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','Music','Physical Education','Social Studies','Civic Education','Agricultural Science','Economics','Government','Commerce','Accounting'];
var GRID_CA_MAX = 20;
var GRID_EXAM_MAX = 100;

function getGradeGrid() {
  if (!data.gradebookGrid) data.gradebookGrid = { rows: [], term: '' };
  return data.gradebookGrid;
}

function renderScoreGrid() {
  var container = document.getElementById('scoreGridView');
  var ctrl = document.getElementById('scoreGridControls');
  if (!container) return;
  var grid = getGradeGrid();
  var students = data.students || [];
  var rows = grid.rows || [];

  // Controls: term selector, class filter, student+subject adder
  var term = grid.term || data.currentTerm || 'Term 2 2026';
  var classFilter = document.getElementById('sgClassFilter')?.value || '';
  var ctrlHtml = '<div class="form-group" style="flex-direction:row;align-items:center;gap:8px;flex-wrap:wrap;">'
    + '<label style="font-size:13px;font-weight:600;">Term:</label>'
    + '<select id="sgTerm" onchange="updateScoreGridMeta()" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;">'
    + (data.academicTerms || []).map(function(t) { return '<option value="' + esc(t.name) + '"' + (t.name === term ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('')
    + '</select>'
    + '<label style="font-size:13px;font-weight:600;margin-left:12px;">Class:</label>'
    + '<select id="sgClassFilter" onchange="renderScoreGrid()" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;">'
    + '<option value="">All Classes</option>'
    + students.map(function(s) { return s.class; }).filter(function(v,i,a) { return a.indexOf(v) === i; }).sort().map(function(c) { return '<option value="' + esc(c) + '"' + (c === classFilter ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('')
    + '</select>'
    + '<label style="font-size:13px;font-weight:600;margin-left:12px;">Subject:</label>'
    + '<select id="sgAddSubject" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;">'
    + SUBJECT_LIST.map(function(s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('')
    + '</select>'
    + '<button class="btn btn-sm btn-primary" onclick="sgAddSubjectForAll()"><i class="fas fa-plus"></i> Add Subject for All</button>'
    + '<button class="btn btn-sm btn-outline" onclick="sgClearSubject()" style="color:#dc2626;"><i class="fas fa-trash"></i> Remove Subject</button>'
    + '</div>';
  ctrl.innerHTML = ctrlHtml;

  if (!rows.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-table"></i><p>No score grid data. Click <strong>Add Row</strong> or <strong>Import</strong> to begin.</p></div>';
    return;
  }

  // Filter rows by class
  var filtered = classFilter ? rows.filter(function(r) { var s = students.find(function(st) { return st.id === r.studentId; }); return s && s.class === classFilter; }) : rows;

  // Group by subject for column headers
  var subjects = [];
  filtered.forEach(function(r) { if (subjects.indexOf(r.subject) === -1) subjects.push(r.subject); });
  subjects.sort();

  // Group by student
  var studentRows = {};
  filtered.forEach(function(r) {
    if (!studentRows[r.studentId]) studentRows[r.studentId] = { studentId: r.studentId, scores: {} };
    studentRows[r.studentId].scores[r.subject] = r;
  });
  var studentIds = Object.keys(studentRows).sort(function(a, b) {
    var sa = students.find(function(s) { return s.id === a; });
    var sb = students.find(function(s) { return s.id === b; });
    return (sa ? sa.name : a).localeCompare(sb ? sb.name : b);
  });

  // Compute per-subject totals for position ranking
  var subjectTotals = {};
  filtered.forEach(function(r) {
    if (!subjectTotals[r.subject]) subjectTotals[r.subject] = {};
    var total = (r.ca1 || 0) + (r.ca2 || 0) + (r.exam || 0);
    subjectTotals[r.subject][r.studentId] = total;
  });
  // Rank per subject
  var subjectRanks = {};
  Object.keys(subjectTotals).forEach(function(sub) {
    var sorted = Object.keys(subjectTotals[sub]).sort(function(a, b) { return (subjectTotals[sub][b] || 0) - (subjectTotals[sub][a] || 0); });
    sorted.forEach(function(sid, i) {
      if (!subjectRanks[sid]) subjectRanks[sid] = {};
      subjectRanks[sid][sub] = i + 1;
    });
  });

  // Build table
  var html = '<table class="grid-table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:900px;"><thead><tr style="background:var(--primary);color:white;">'
    + '<th style="padding:8px 6px;position:sticky;left:0;background:var(--primary);z-index:2;min-width:140px;">Student</th>'
    + '<th style="padding:8px 6px;min-width:80px;">Class</th>';
  subjects.forEach(function(sub) {
    html += '<th colspan="5" style="padding:8px 4px;text-align:center;border-left:2px solid rgba(255,255,255,0.2);">' + esc(sub) + '</th>';
  });
  html += '</tr><tr style="background:var(--primary);color:white;font-size:11px;">'
    + '<th style="padding:4px 6px;position:sticky;left:0;background:var(--primary);z-index:2;"></th>'
    + '<th style="padding:4px 6px;"></th>';
  subjects.forEach(function(sub) {
    html += '<th style="padding:4px 2px;border-left:2px solid rgba(255,255,255,0.2);min-width:32px;" title="CA1 /' + GRID_CA_MAX + '">CA1</th>'
      + '<th style="padding:4px 2px;min-width:32px;" title="CA2 /' + GRID_CA_MAX + '">CA2</th>'
      + '<th style="padding:4px 2px;min-width:40px;" title="Exam /' + GRID_EXAM_MAX + '">Exam</th>'
      + '<th style="padding:4px 2px;min-width:36px;font-weight:700;">Total</th>'
      + '<th style="padding:4px 2px;min-width:28px;">G</th>';
  });
  html += '<th style="padding:4px 6px;min-width:50px;">Avg %</th><th style="padding:4px 6px;min-width:30px;">Pos</th></tr></thead><tbody>';

  studentIds.forEach(function(sid) {
    var st = students.find(function(s) { return s.id === sid; });
    var name = st ? esc(st.name) : sid;
    var cls = st ? esc(st.class) : '';
    var sr = studentRows[sid];
    var totalScore = 0, totalCount = 0;
    html += '<tr class="grid-row">'
      + '<td style="padding:4px 6px;font-weight:600;position:sticky;left:0;background:white;z-index:1;border-right:1px solid #e2e8f0;">' + name + '</td>'
      + '<td style="padding:4px 6px;color:var(--text-light);font-size:12px;">' + cls + '</td>';
    subjects.forEach(function(sub) {
      var r = sr.scores[sub];
      var ca1 = r ? r.ca1 || 0 : 0;
      var ca2 = r ? r.ca2 || 0 : 0;
      var exam = r ? r.exam || 0 : 0;
      var total = ca1 + ca2 + exam;
      var grade = getGrade(total);
      if (r) { totalScore += total; totalCount++; }
      var border = 'border-left:2px solid #e2e8f0;';
      html += '<td style="padding:2px;' + border + '"><input type="number" min="0" max="' + GRID_CA_MAX + '" value="' + ca1 + '" class="sg-cell" data-sid="' + sid + '" data-sub="' + esc(sub, true) + '" data-field="ca1" onchange="sgCellChanged(this)" onfocus="this.select()"></td>'
        + '<td style="padding:2px;"><input type="number" min="0" max="' + GRID_CA_MAX + '" value="' + ca2 + '" class="sg-cell" data-sid="' + sid + '" data-sub="' + esc(sub, true) + '" data-field="ca2" onchange="sgCellChanged(this)" onfocus="this.select()"></td>'
        + '<td style="padding:2px;"><input type="number" min="0" max="' + GRID_EXAM_MAX + '" value="' + exam + '" class="sg-cell sg-cell-exam" data-sid="' + sid + '" data-sub="' + esc(sub, true) + '" data-field="exam" onchange="sgCellChanged(this)" onfocus="this.select()"></td>'
        + '<td style="padding:4px 2px;text-align:center;font-weight:700;font-size:14px;" class="sg-total">' + total + '</td>'
        + '<td style="padding:4px 2px;text-align:center;"><span class="badge" style="background:' + (grade === 'A' || grade === 'A1' || grade === 'B2' ? '#c6f6d5' : grade === 'F' || grade === 'F9' ? '#fed7d7' : '#fefcbf') + ';color:' + (grade === 'A' || grade === 'A1' || grade === 'B2' ? '#22543d' : grade === 'F' || grade === 'F9' ? '#9b2c2c' : '#744210') + ';font-size:11px;">' + grade + '</span></td>';
    });
    var avg = totalCount ? Math.round(totalScore / totalCount) : 0;
    var avgGrade = getGrade(avg);
    html += '<td style="padding:4px 6px;text-align:center;font-weight:600;">' + avg + '%</td>'
      + '<td style="padding:4px 6px;text-align:center;font-weight:600;font-size:14px;" class="sg-pos">-</td></tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  // Compute and display overall positions
  computeScoreGridPositions();
}

function computeScoreGridPositions() {
  var grid = getGradeGrid();
  var students = data.students || [];
  var rows = grid.rows || [];
  if (!rows.length) return;
  var classFilter = document.getElementById('sgClassFilter')?.value || '';

  // Compute per-student average across all subjects
  var avgs = {};
  var filtered = classFilter ? rows.filter(function(r) { var s = students.find(function(st) { return st.id === r.studentId; }); return s && s.class === classFilter; }) : rows;
  filtered.forEach(function(r) {
    var total = (r.ca1 || 0) + (r.ca2 || 0) + (r.exam || 0);
    if (!avgs[r.studentId]) avgs[r.studentId] = { total: 0, count: 0 };
    avgs[r.studentId].total += total;
    avgs[r.studentId].count++;
  });
  var ranked = Object.keys(avgs).sort(function(a, b) {
    var avgA = avgs[a].count ? Math.round(avgs[a].total / avgs[a].count) : 0;
    var avgB = avgs[b].count ? Math.round(avgs[b].total / avgs[b].count) : 0;
    return avgB - avgA;
  });
  var positions = {};
  ranked.forEach(function(sid, i) { positions[sid] = i + 1; });

  // Update position cells
  var gridView = document.getElementById('scoreGridView');
  if (!gridView) return;
  var posCells = gridView.querySelectorAll('.sg-pos');
  var rows2 = gridView.querySelectorAll('.grid-row');
  posCells.forEach(function(cell, idx) {
    if (idx < ranked.length) {
      var sid = rows2[idx]?.querySelector('.sg-cell')?.dataset?.sid;
      if (sid && positions[sid]) cell.textContent = positions[sid];
    }
  });
}

// When a cell value changes
function sgCellChanged(input) {
  var sid = input.dataset.sid;
  var sub = input.dataset.sub;
  var field = input.dataset.field;
  var val = parseFloat(input.value) || 0;
  var max = field === 'exam' ? GRID_EXAM_MAX : GRID_CA_MAX;
  if (val > max) { val = max; input.value = max; }
  if (val < 0) { val = 0; input.value = 0; }

  var grid = getGradeGrid();
  var rows = grid.rows;
  var r = rows.find(function(x) { return x.studentId === sid && x.subject === sub; });
  if (r) r[field] = val;

  // Update total and grade cells in the same row
  var tr = input.closest('tr');
  if (tr) {
    var inputs = tr.querySelectorAll('.sg-cell');
    var ca1 = 0, ca2 = 0, exam = 0;
    inputs.forEach(function(inp) {
      if (inp.dataset.sid === sid && inp.dataset.sub === sub) {
        if (inp.dataset.field === 'ca1') ca1 = parseFloat(inp.value) || 0;
        else if (inp.dataset.field === 'ca2') ca2 = parseFloat(inp.value) || 0;
        else if (inp.dataset.field === 'exam') exam = parseFloat(inp.value) || 0;
      }
    });
    var total = ca1 + ca2 + exam;
    var grade = getGrade(total);
    // Find the right total cell for this subject block
    var cell = input.parentNode.nextElementSibling;
    while (cell && !cell.classList.contains('sg-total')) cell = cell.nextElementSibling;
    if (cell) {
      cell.textContent = total;
      // Update grade badge (next cell after total)
      var gradeCell = cell.nextElementSibling;
      if (gradeCell) {
        var badge = gradeCell.querySelector('.badge');
        if (badge) {
          badge.textContent = grade;
          badge.style.background = (grade === 'A' || grade === 'A1' || grade === 'B2' ? '#c6f6d5' : grade === 'F' || grade === 'F9' ? '#fed7d7' : '#fefcbf');
          badge.style.color = (grade === 'A' || grade === 'A1' || grade === 'B2' ? '#22543d' : grade === 'F' || grade === 'F9' ? '#9b2c2c' : '#744210');
        }
      }
    }
  }
  computeScoreGridPositions();
}

function updateScoreGridMeta() {
  var grid = getGradeGrid();
  var term = document.getElementById('sgTerm')?.value;
  if (term) grid.term = term;
}

function addScoreGridRow() {
  var students = data.students || [];
  if (!students.length) { toast('No students found. Add students first.', 'error'); return; }
  var grid = getGradeGrid();
  if (!grid.rows) grid.rows = [];
  var count = 0;
  students.forEach(function(s) {
    var missing = SUBJECT_LIST.every(function(sub) { return !grid.rows.find(function(r) { return r.studentId === s.id && r.subject === sub; }); });
    if (missing) {
      grid.rows.push({ id: 'GG' + Date.now() + count, studentId: s.id, subject: SUBJECT_LIST[0], ca1: 0, ca2: 0, exam: 0 });
      count++;
    }
  });
  if (!count) { toast('All students already have rows. Select a subject and use "Add Subject".', 'info'); return; }
  renderScoreGrid();
  toast(count + ' student row(s) added.');
}

function sgAddSubjectForAll() {
  var sub = document.getElementById('sgAddSubject')?.value;
  if (!sub) return;
  var students = data.students || [];
  var grid = getGradeGrid();
  if (!grid.rows) grid.rows = [];
  var classFilter = document.getElementById('sgClassFilter')?.value || '';
  var targets = classFilter ? students.filter(function(s) { return s.class === classFilter; }) : students;
  var added = 0;
  targets.forEach(function(s) {
    var exists = grid.rows.find(function(r) { return r.studentId === s.id && r.subject === sub; });
    if (!exists) {
      grid.rows.push({ id: 'GG' + Date.now() + added, studentId: s.id, subject: sub, ca1: 0, ca2: 0, exam: 0 });
      added++;
    }
  });
  renderScoreGrid();
  toast('Added "' + sub + '" for ' + added + ' student(s).');
}

function sgClearSubject() {
  var sub = document.getElementById('sgAddSubject')?.value;
  if (!sub || !confirm('Remove all scores for "' + sub + '" from all students?')) return;
  var grid = getGradeGrid();
  grid.rows = grid.rows.filter(function(r) { return r.subject !== sub; });
  renderScoreGrid();
  toast('Removed "' + sub + '" from grid.');
}

function saveScoreGrid() {
  var grid = getGradeGrid();
  var term = document.getElementById('sgTerm')?.value;
  if (term) grid.term = term;
  // Recalculate totals and update
  grid.rows.forEach(function(r) {
    r.ca1 = r.ca1 || 0;
    r.ca2 = r.ca2 || 0;
    r.exam = r.exam || 0;
  });
  saveData();
  toast('Score grid saved!');
}

// ===== IMPORT/EXPORT =====
function exportScoreGridCSV() {
  var grid = getGradeGrid();
  var students = data.students || [];
  var rows = grid.rows || [];
  if (!rows.length) { toast('No data to export', 'error'); return; }
  var subjects = [];
  rows.forEach(function(r) { if (subjects.indexOf(r.subject) === -1) subjects.push(r.subject); });
  subjects.sort();
  var lines = [['StudentID','StudentName','Class'].concat(subjects.reduce(function(a, sub) { return a.concat([sub + '_CA1', sub + '_CA2', sub + '_Exam', sub + '_Total', sub + '_Grade']); }, []))];
  var studentIds = [];
  rows.forEach(function(r) { if (studentIds.indexOf(r.studentId) === -1) studentIds.push(r.studentId); });
  studentIds.sort(function(a, b) {
    var sa = students.find(function(s) { return s.id === a; });
    var sb = students.find(function(s) { return s.id === b; });
    return (sa ? sa.name : a).localeCompare(sb ? sb.name : b);
  });
  studentIds.forEach(function(sid) {
    var st = students.find(function(s) { return s.id === sid; });
    var line = [sid, st ? st.name : sid, st ? st.class : ''];
    subjects.forEach(function(sub) {
      var r = rows.find(function(x) { return x.studentId === sid && x.subject === sub; });
      var ca1 = r ? r.ca1 || 0 : 0;
      var ca2 = r ? r.ca2 || 0 : 0;
      var exam = r ? r.exam || 0 : 0;
      var total = ca1 + ca2 + exam;
      var grade = getGrade(total);
      line.push(ca1, ca2, exam, total, grade);
    });
    lines.push(line);
  });
  var csv = lines.map(function(l) { return l.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'scoregrid.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Exported scoregrid.csv');
}

function exportScoreGridXLSX() {
  if (typeof XLSX === 'undefined') { toast('Excel library not loaded. Use CSV export instead.', 'error'); return; }
  var grid = getGradeGrid();
  var students = data.students || [];
  var rows = grid.rows || [];
  if (!rows.length) { toast('No data to export', 'error'); return; }
  var subjects = [];
  rows.forEach(function(r) { if (subjects.indexOf(r.subject) === -1) subjects.push(r.subject); });
  subjects.sort();
  var header = ['StudentID', 'StudentName', 'Class'];
  subjects.forEach(function(sub) { header.push(sub + '_CA1', sub + '_CA2', sub + '_Exam', sub + '_Total', sub + '_Grade'); });
  var dataRows = [];
  var studentIds = [];
  rows.forEach(function(r) { if (studentIds.indexOf(r.studentId) === -1) studentIds.push(r.studentId); });
  studentIds.sort(function(a, b) {
    var sa = students.find(function(s) { return s.id === a; });
    var sb = students.find(function(s) { return s.id === b; });
    return (sa ? sa.name : a).localeCompare(sb ? sb.name : b);
  });
  studentIds.forEach(function(sid) {
    var st = students.find(function(s) { return s.id === sid; });
    var row = [sid, st ? st.name : sid, st ? st.class : ''];
    subjects.forEach(function(sub) {
      var r = rows.find(function(x) { return x.studentId === sid && x.subject === sub; });
      var ca1 = r ? r.ca1 || 0 : 0;
      var ca2 = r ? r.ca2 || 0 : 0;
      var exam = r ? r.exam || 0 : 0;
      var total = ca1 + ca2 + exam;
      row.push(ca1, ca2, exam, total, getGrade(total));
    });
    dataRows.push(row);
  });
  var ws = XLSX.utils.aoa_to_sheet([header].concat(dataRows));
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ScoreGrid');
  XLSX.writeFile(wb, 'scoregrid.xlsx');
  toast('Exported scoregrid.xlsx');
}

function importScoreGridFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') {
    var reader = new FileReader();
    reader.onload = function(e) { parseScoreGridCSV(e.target.result); input.value = ''; };
    reader.readAsText(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    if (typeof XLSX === 'undefined') { toast('Excel library not loaded.', 'error'); input.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var wb = XLSX.read(e.target.result, { type: 'array' });
        var ws = wb.Sheets[wb.SheetNames[0]];
        var data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        parseScoreGridArray(data);
      } catch(err) { toast('Error reading Excel: ' + err.message, 'error'); }
      input.value = '';
    };
    reader.readAsArrayBuffer(file);
  } else {
    toast('Unsupported file format. Use .csv or .xlsx', 'error');
    input.value = '';
  }
}

function parseScoreGridCSV(text) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim(); });
  if (lines.length < 2) { toast('CSV file is empty or has no data rows.', 'error'); return; }
  var headers = parseCSVLine(lines[0]);
  var data = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = parseCSVLine(lines[i]);
    if (vals.length >= 3) data.push(vals);
  }
  parseScoreGridArray(data, headers);
}

function parseCSVLine(line) {
  var result = [], current = '', inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseScoreGridArray(data, headers) {
  var grid = getGradeGrid();
  if (!grid.rows) grid.rows = [];
  var students = data.students || [];
  var imported = 0;
  // Detect format: if first row is array (from CSV with headers) or object keys
  var hasColHeaders = headers && headers.length > 0;
  var colMap = hasColHeaders ? {} : null;
  if (hasColHeaders) {
    headers.forEach(function(h, i) {
      var hl = h.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (hl === 'studentid' || hl === 'id') colMap.studentId = i;
      else if (hl === 'studentname' || hl === 'name' || hl === 'student') colMap.name = i;
      else if (hl === 'class') colMap.class = i;
      else if (hl.includes('ca1') || hl.includes('_ca1')) colMap.ca1Idx = i;
      else if (hl.includes('ca2') || hl.includes('_ca2')) colMap.ca2Idx = i;
      else if (hl === 'exam' || hl.includes('_exam')) colMap.examIdx = i;
      else if (hl.includes('_subject') || hl.includes('subject_')) colMap.subjectIdx = i;
      else if (hl === 'subject') colMap.subjectIdx = i;
    });
  }

  data.forEach(function(row) {
    var sid, stName, cls, subject, ca1, ca2, exam;
    if (hasColHeaders && colMap) {
      sid = row[colMap.studentId] ? String(row[colMap.studentId]).trim() : '';
      stName = colMap.name !== undefined ? String(row[colMap.name] || '').trim() : '';
      cls = colMap.class !== undefined ? String(row[colMap.class] || '').trim() : '';
      subject = colMap.subjectIdx !== undefined ? String(row[colMap.subjectIdx] || '').trim() : '';
      ca1 = parseFloat(row[colMap.ca1Idx]) || 0;
      ca2 = parseFloat(row[colMap.ca2Idx]) || 0;
      exam = parseFloat(row[colMap.examIdx]) || 0;
    } else {
      // Assume simple format: StudentID, Name, Class, Subject, CA1, CA2, Exam
      sid = String(row[0] || '').trim();
      stName = String(row[1] || '').trim();
      cls = String(row[2] || '').trim();
      subject = String(row[3] || '').trim();
      ca1 = parseFloat(row[4]) || 0;
      ca2 = parseFloat(row[5]) || 0;
      exam = parseFloat(row[6]) || 0;
    }
    // Look up student by ID or name
    var student = students.find(function(s) { return s.id === sid || s.name.toLowerCase() === stName.toLowerCase(); });
    if (!student) student = students.find(function(s) { return s.name.toLowerCase() === stName.toLowerCase(); });
    var finalSid = student ? student.id : (sid || 'IMP_' + Date.now() + imported);
    var finalSubject = subject || SUBJECT_LIST[0];
    var existing = grid.rows.find(function(r) { return r.studentId === finalSid && r.subject === finalSubject; });
    if (existing) {
      existing.ca1 = ca1; existing.ca2 = ca2; existing.exam = exam;
    } else {
      grid.rows.push({ id: 'GG' + Date.now() + imported, studentId: finalSid, subject: finalSubject, ca1: ca1, ca2: ca2, exam: exam });
    }
    imported++;
  });
  renderScoreGrid();
  toast('Imported ' + imported + ' row(s) successfully!');
}
