// EduVerse - Custom Report Builder
// Drag-and-drop report designer for school-specific analytics
// Supports Table, Bar Chart, Pie Chart, Summary Cards

// ===== DATA SOURCE DEFINITIONS =====
var REPORT_SOURCES = {
  students: {
    label: 'Students',
    icon: 'users',
    getData: function() { return data.students || []; },
    fields: [
      { key: 'id', label: 'Student ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'class', label: 'Class', type: 'string' },
      { key: 'contact', label: 'Contact', type: 'string' }
    ]
  },
  fees: {
    label: 'Fees',
    icon: 'file-invoice-dollar',
    getData: function() {
      var fees = data.fees || [];
      return fees.map(function(f) {
        var s = getStudent(f.studentId);
        return { id: f.id, studentId: f.studentId, studentName: s ? s.name : 'Unknown', term: f.term, amount: f.amount || 0, paid: f.paid || 0, balance: (f.amount || 0) - (f.paid || 0), status: f.status || 'pending' };
      });
    },
    fields: [
      { key: 'id', label: 'Fee ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'term', label: 'Term', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'paid', label: 'Paid', type: 'number' },
      { key: 'balance', label: 'Balance', type: 'number' },
      { key: 'status', label: 'Status', type: 'string' }
    ]
  },
  results: {
    label: 'Results',
    icon: 'file-alt',
    getData: function() {
      var results = data.results || [];
      return results.map(function(r) {
        var s = getStudent(r.studentId);
        return { id: r.id, studentId: r.studentId, studentName: s ? s.name : 'Unknown', subject: r.subject, score: r.score || 0, grade: r.grade || '', term: r.term };
      });
    },
    fields: [
      { key: 'id', label: 'Result ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'score', label: 'Score', type: 'number' },
      { key: 'grade', label: 'Grade', type: 'string' },
      { key: 'term', label: 'Term', type: 'string' }
    ]
  },
  attendance: {
    label: 'Attendance',
    icon: 'calendar-check',
    getData: function() {
      var att = data.attendance || [];
      return att.map(function(a) {
        var s = getStudent(a.studentId);
        return { id: a.id, studentId: a.studentId, studentName: s ? s.name : 'Unknown', date: a.date, status: a.status };
      });
    },
    fields: [
      { key: 'id', label: 'Record ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'date', label: 'Date', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' }
    ]
  },
  gradebook: {
    label: 'Gradebook',
    icon: 'book',
    getData: function() {
      var gb = data.gradebook || [];
      return gb.map(function(g) {
        var s = getStudent(g.studentId);
        return { id: g.id, studentId: g.studentId, studentName: s ? s.name : 'Unknown', subject: g.subject, score: g.score || 0, term: g.term };
      });
    },
    fields: [
      { key: 'id', label: 'Entry ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'score', label: 'Score', type: 'number' },
      { key: 'term', label: 'Term', type: 'string' }
    ]
  },
  teachers: {
    label: 'Teachers',
    icon: 'chalkboard-teacher',
    getData: function() { return data.teachers || []; },
    fields: [
      { key: 'id', label: 'Teacher ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'assignedClass', label: 'Assigned Class', type: 'string' }
    ]
  },
  library: {
    label: 'Library Books',
    icon: 'book',
    getData: function() { return data.library || []; },
    fields: [
      { key: 'id', label: 'Book ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'author', label: 'Author', type: 'string' },
      { key: 'isbn', label: 'ISBN', type: 'string' },
      { key: 'total', label: 'Total Copies', type: 'number' },
      { key: 'available', label: 'Available', type: 'number' },
      { key: 'category', label: 'Category', type: 'string' }
    ]
  },
  behaviorLog: {
    label: 'Behavior Log',
    icon: 'balance-scale',
    getData: function() {
      var bl = data.behaviorLog || [];
      return bl.map(function(b) {
        var s = getStudent(b.studentId);
        return { id: b.id, studentId: b.studentId, studentName: s ? s.name : 'Unknown', type: b.type, description: b.description, date: b.date };
      });
    },
    fields: [
      { key: 'id', label: 'Entry ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'date', label: 'Date', type: 'string' }
    ]
  },
  payrollRecords: {
    label: 'Payroll',
    icon: 'money-bill',
    getData: function() {
      var pr = data.payrollRecords || [];
      return pr.map(function(p) {
        var t = getTeacher(p.teacherId);
        return { id: p.id, teacherId: p.teacherId, teacherName: t ? t.name : 'Unknown', month: p.month, basicSalary: p.basicSalary || 0, allowances: p.allowances || 0, deductions: p.deductions || 0, netSalary: p.netSalary || 0, paid: p.paid ? 'Yes' : 'No' };
      });
    },
    fields: [
      { key: 'id', label: 'Record ID', type: 'string' },
      { key: 'teacherId', label: 'Teacher ID', type: 'string' },
      { key: 'teacherName', label: 'Teacher Name', type: 'string' },
      { key: 'month', label: 'Month', type: 'string' },
      { key: 'basicSalary', label: 'Basic Salary', type: 'number' },
      { key: 'allowances', label: 'Allowances', type: 'number' },
      { key: 'deductions', label: 'Deductions', type: 'number' },
      { key: 'netSalary', label: 'Net Salary', type: 'number' },
      { key: 'paid', label: 'Paid', type: 'string' }
    ]
  },
  borrowings: {
    label: 'Borrowings',
    icon: 'book-open',
    getData: function() {
      var bw = data.borrowings || [];
      return bw.map(function(b) {
        var s = getStudent(b.studentId);
        return { id: b.id, bookId: b.bookId, studentId: b.studentId, studentName: s ? s.name : 'Unknown', borrowDate: b.borrowDate, dueDate: b.dueDate, returnDate: b.returnDate || '', status: b.status };
      });
    },
    fields: [
      { key: 'id', label: 'Borrow ID', type: 'string' },
      { key: 'bookId', label: 'Book ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'studentName', label: 'Student Name', type: 'string' },
      { key: 'borrowDate', label: 'Borrow Date', type: 'string' },
      { key: 'dueDate', label: 'Due Date', type: 'string' },
      { key: 'returnDate', label: 'Return Date', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' }
    ]
  },
  paymentTransactions: {
    label: 'Payment Transactions',
    icon: 'credit-card',
    getData: function() { return data.paymentTransactions || []; },
    fields: [
      { key: 'id', label: 'Transaction ID', type: 'string' },
      { key: 'studentId', label: 'Student ID', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'method', label: 'Method', type: 'string' },
      { key: 'reference', label: 'Reference', type: 'string' },
      { key: 'date', label: 'Date', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' }
    ]
  }
};

var _reportBuilderState = { columns: [], filters: [], draggedField: null };

// ===== MAIN LIST VIEW =====
function renderReportBuilder() {
  var container = document.getElementById('reportBuilderView');
  if (!container) return;
  var reports = data.customReports || [];
  if (reports.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-object-group"></i><p>No custom reports yet. Click "Create Report" to design your first report.</p></div>';
    return;
  }
  var html = '<div style="overflow-x:auto;"><table><thead><tr><th>Report Name</th><th>Type</th><th>Data Source</th><th>Columns</th><th>Created</th><th>Actions</th></tr></thead><tbody>';
  reports.forEach(function(r) {
    var srcDef = REPORT_SOURCES[r.dataSource];
    html += '<tr>' +
      '<td><strong>' + htmlEscape(r.name) + '</strong></td>' +
      '<td><span class="badge badge-info">' + htmlEscape(r.type) + '</span></td>' +
      '<td>' + (srcDef ? srcDef.label : htmlEscape(r.dataSource)) + '</td>' +
      '<td style="font-size:12px;color:var(--text-light);">' + (r.columns || []).join(', ') + '</td>' +
      '<td style="font-size:12px;">' + htmlEscape(r.createdAt ? r.createdAt.split('T')[0] : '') + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary" onclick="runCustomReport(\'' + r.id + '\')" title="Run Report"><i class="fas fa-play"></i></button> ' +
        '<button class="btn btn-sm" style="background:var(--info);color:#fff;" onclick="editCustomReport(\'' + r.id + '\')" title="Edit"><i class="fas fa-edit"></i></button> ' +
        '<button class="btn btn-sm" style="background:var(--danger);color:#fff;" onclick="deleteCustomReport(\'' + r.id + '\')" title="Delete"><i class="fas fa-trash"></i></button> ' +
        '<button class="btn btn-sm btn-export" onclick="exportReportCSV(\'' + r.id + '\')" title="Export CSV"><i class="fas fa-download"></i></button>' +
      '</td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ===== CREATE / EDIT REPORT MODAL =====
function showCreateReportModal(reportToEdit) {
  closeReportBuilder();
  closeModal();
  _reportBuilderState = { columns: [], filters: [], draggedField: null };
  var isEdit = !!reportToEdit;
  var editId = isEdit ? reportToEdit.id : '';
  var name = isEdit ? reportToEdit.name : '';
  var type = isEdit ? reportToEdit.type : 'table';
  var source = isEdit ? reportToEdit.dataSource : 'students';
  var groupBy = isEdit ? (reportToEdit.groupBy || '') : '';
  var valueField = isEdit ? (reportToEdit.valueField || '') : '';
  var aggregate = isEdit ? (reportToEdit.aggregate || 'count') : 'count';
  var columns = isEdit ? (reportToEdit.columns || []) : [];
  var rFilters = isEdit ? (reportToEdit.filters || {}) : {};

  var sourceDef = REPORT_SOURCES[source];
  var allFields = sourceDef ? sourceDef.fields : [];
  var numericFields = allFields.filter(function(f) { return f.type === 'number'; });
  var stringFields = allFields.filter(function(f) { return f.type === 'string'; });

  var el = document.createElement('div');
  el.id = 'reportBuilderOverlay';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto;';
  el.onclick = function(e) { if (e.target === el) closeReportBuilder(); };
  var html =
    '<div style="background:#fff;border-radius:16px;width:100%;max-width:1100px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-height:90vh;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">' +
      '<h3 style="font-size:18px;font-weight:700;"><i class="fas fa-object-group"></i> ' + (isEdit ? 'Edit Report' : 'Create Custom Report') + '</h3>' +
      '<button onclick="closeReportBuilder()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-light);">&times;</button>' +
    '</div>' +
    '<div style="padding:20px 24px;overflow-y:auto;flex:1;">' +
      // Top bar - Name, Type, Source
      '<div style="display:grid;grid-template-columns:1fr 140px 180px;gap:12px;margin-bottom:20px;">' +
        '<div><label style="font-size:13px;font-weight:600;color:var(--text);">Report Name</label>' +
        '<input type="text" id="rptName" value="' + htmlEscape(name) + '" placeholder="e.g. Termly Performance Summary" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;margin-top:4px;"></div>' +
        '<div><label style="font-size:13px;font-weight:600;color:var(--text);">Chart Type</label>' +
        '<select id="rptType" onchange="onRptTypeChange()" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;margin-top:4px;">' +
          '<option value="table"' + (type === 'table' ? ' selected' : '') + '>Table</option>' +
          '<option value="bar"' + (type === 'bar' ? ' selected' : '') + '>Bar Chart</option>' +
          '<option value="pie"' + (type === 'pie' ? ' selected' : '') + '>Pie Chart</option>' +
          '<option value="cards"' + (type === 'cards' ? ' selected' : '') + '>Summary Cards</option>' +
        '</select></div>' +
        '<div><label style="font-size:13px;font-weight:600;color:var(--text);">Data Source</label>' +
        '<select id="rptSource" onchange="onRptSourceChange()" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;margin-top:4px;">' +
          Object.keys(REPORT_SOURCES).map(function(k) {
            return '<option value="' + k + '"' + (source === k ? ' selected' : '') + '>' + REPORT_SOURCES[k].label + '</option>';
          }).join('') +
        '</select></div>' +
      '</div>' +
      // Main area
      '<div style="display:grid;grid-template-columns:240px 1fr;gap:20px;">' +
        // Left: Field palette
        '<div id="rptFieldPalette" style="background:#f8fafc;border-radius:12px;padding:16px;border:2px dashed #e2e8f0;">' +
          '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text);">Available Fields</h4>' +
          '<p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">Drag fields to the columns area on the right</p>' +
          '<div id="rptFieldList" style="display:flex;flex-direction:column;gap:6px;">' +
            allFields.map(function(f) {
              return '<div draggable="true" ondragstart="onFieldDragStart(event,\'' + f.key + '\',\'' + htmlEscape(f.label) + '\',\'' + f.type + '\')" ' +
                'style="padding:8px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:grab;font-size:13px;display:flex;align-items:center;gap:8px;transition:all 0.15s;" ' +
                'onmouseover="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.08)\'" ' +
                'onmouseout="this.style.borderColor=\'#e2e8f0\';this.style.boxShadow=\'none\'">' +
                '<i class="fas fa-grip-vertical" style="color:#cbd5e0;font-size:12px;"></i>' +
                '<span>' + htmlEscape(f.label) + '</span>' +
                '<span style="margin-left:auto;font-size:10px;color:' + (f.type === 'number' ? 'var(--info)' : 'var(--text-light)') + ';background:#f1f5f9;padding:2px 6px;border-radius:4px;">' + f.type + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        // Right: Canvas
        '<div style="display:flex;flex-direction:column;gap:16px;">' +
          // Columns drop zone
          '<div id="rptColumnsZone" ondragover="event.preventDefault()" ondrop="onColumnDrop(event)" ' +
            'style="min-height:80px;background:#f8fafc;border:2px dashed #cbd5e0;border-radius:12px;padding:12px;transition:border-color 0.2s,background 0.2s;" ' +
            'ondragenter="this.style.borderColor=\'var(--accent)\';this.style.background=\'#eff6ff\'" ' +
            'ondragleave="this.style.borderColor=\'#cbd5e0\';this.style.background=\'#f8fafc\'">' +
            '<h4 style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--text);">Report Columns <span style="font-weight:400;font-size:12px;color:var(--text-light);">(drag fields here)</span></h4>' +
            '<div id="rptColumnList" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;">' +
              (columns.length === 0 ? '<span id="rptColumnEmpty" style="color:#94a3b8;font-size:13px;padding:8px;">Drag fields from the left to add columns...</span>' : '') +
              columns.map(function(c, i) {
                return '<div draggable="true" ondragstart="onColReorderStart(event,' + i + ')" ondrop="onColReorderDrop(event,' + i + ')" ondragover="event.preventDefault()" ' +
                  'style="display:inline-flex;align-items:center;gap:6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:4px 10px 4px 6px;font-size:13px;cursor:grab;">' +
                  '<i class="fas fa-grip-vertical" style="color:#93c5fd;font-size:10px;"></i>' +
                  '<span>' + htmlEscape(c) + '</span>' +
                  '<button onclick="removeReportColumn(' + i + ')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;" title="Remove">&times;</button>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
          // Filters, Group By, Value
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
            '<div style="background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #e2e8f0;">' +
              '<h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);">Group By</h4>' +
              '<select id="rptGroupBy" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;">' +
                '<option value="">None</option>' +
                stringFields.map(function(f) {
                  return '<option value="' + f.key + '"' + (groupBy === f.key ? ' selected' : '') + '>' + htmlEscape(f.label) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div style="background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #e2e8f0;">' +
              '<h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);">Value Field</h4>' +
              '<select id="rptValueField" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;">' +
                '<option value="">None (count only)</option>' +
                numericFields.map(function(f) {
                  return '<option value="' + f.key + '"' + (valueField === f.key ? ' selected' : '') + '>' + htmlEscape(f.label) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div style="background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #e2e8f0;">' +
              '<h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);">Aggregate</h4>' +
              '<select id="rptAggregate" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;">' +
                '<option value="count"' + (aggregate === 'count' ? ' selected' : '') + '>Count</option>' +
                '<option value="sum"' + (aggregate === 'sum' ? ' selected' : '') + '>Sum</option>' +
                '<option value="avg"' + (aggregate === 'avg' ? ' selected' : '') + '>Average</option>' +
                '<option value="min"' + (aggregate === 'min' ? ' selected' : '') + '>Minimum</option>' +
                '<option value="max"' + (aggregate === 'max' ? ' selected' : '') + '>Maximum</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          // Filters section
          '<div style="background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #e2e8f0;">' +
            '<h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);">Filters <span style="font-weight:400;font-size:12px;color:var(--text-light);">(optional)</span></h4>' +
            '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">' +
              '<select id="rptFilterField" style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;">' +
                '<option value="">Select field...</option>' +
                allFields.map(function(f) {
                  return '<option value="' + f.key + '">' + htmlEscape(f.label) + '</option>';
                }).join('') +
              '</select>' +
              '<input type="text" id="rptFilterValue" placeholder="Filter value..." style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:13px;flex:1;">' +
              '<button class="btn btn-sm btn-primary" onclick="addReportFilter()"><i class="fas fa-plus"></i> Add</button>' +
            '</div>' +
            '<div id="rptFilterList" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;">' +
              Object.keys(rFilters).map(function(fk) {
                return '<div style="display:inline-flex;align-items:center;gap:6px;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:4px 10px 4px 12px;font-size:12px;">' +
                  '<strong>' + htmlEscape(fk) + ':</strong> ' + htmlEscape(rFilters[fk]) +
                  '<button onclick="removeReportFilter(\'' + fk + '\')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;" title="Remove">&times;</button>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Preview area
      '<div id="rptPreviewArea" style="margin-top:16px;display:none;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid #e2e8f0;display:flex;gap:8px;justify-content:flex-end;">' +
      '<button class="btn btn-outline" onclick="closeReportBuilder()">Cancel</button>' +
      '<button class="btn btn-secondary" onclick="previewReport()" id="rptPreviewBtn"><i class="fas fa-eye"></i> Preview</button>' +
      '<button class="btn btn-primary" onclick="saveCustomReport(\'' + editId + '\')"><i class="fas fa-save"></i> ' + (isEdit ? 'Update' : 'Save') + ' Report</button>' +
    '</div>' +
    '</div></div>';
  el.innerHTML = html;
  document.body.appendChild(el);
}

// ===== DRAG & DROP HANDLERS =====
function onFieldDragStart(e, key, label, type) {
  _reportBuilderState.draggedField = { key: key, label: label, type: type };
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', key);
}

function onColumnDrop(e) {
  e.preventDefault();
  var df = _reportBuilderState.draggedField;
  if (!df) return;
  var cols = getBuilderColumns();
  if (cols.indexOf(df.key) === -1) {
    cols.push(df.key);
    setBuilderColumns(cols);
  }
  _reportBuilderState.draggedField = null;
}

function _reorderArray(arr, fromIdx, toIdx) {
  if (fromIdx === toIdx) return arr;
  var item = arr.splice(fromIdx, 1)[0];
  arr.splice(toIdx, 0, item);
  return arr;
}

function addReportFilter() {
  var field = document.getElementById('rptFilterField');
  var value = document.getElementById('rptFilterValue');
  if (!field || !value || !field.value || !value.value.trim()) { toast('Select a field and enter a filter value', 'warning'); return; }
  var list = document.getElementById('rptFilterList');
  if (!list) return;
  var fk = field.value;
  var fv = value.value.trim();
  var existing = list.querySelectorAll('div');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].textContent.indexOf(fk + ':') !== -1) {
      toast('Filter for "' + fk + '" already exists', 'warning');
      return;
    }
  }
  var chip = document.createElement('div');
  chip.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:4px 10px 4px 12px;font-size:12px;';
  chip.innerHTML = '<strong>' + htmlEscape(fk) + ':</strong> ' + htmlEscape(fv) +
    '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;" title="Remove">&times;</button>';
  list.appendChild(chip);
  field.value = '';
  value.value = '';
}

function removeReportFilter(fk) {
  var list = document.getElementById('rptFilterList');
  if (!list) return;
  var chips = list.querySelectorAll('div');
  for (var i = 0; i < chips.length; i++) {
    if (chips[i].textContent.indexOf(fk + ':') === 0) {
      chips[i].remove();
      break;
    }
  }
}

function removeReportColumn(idx) {
  var cols = getBuilderColumns();
  cols.splice(idx, 1);
  setBuilderColumns(cols);
}

function onRptTypeChange() {
  var type = document.getElementById('rptType')?.value;
  var valueGroup = document.getElementById('rptValueField')?.closest('div');
  var aggGroup = document.getElementById('rptAggregate')?.closest('div');
  if (!valueGroup || !aggGroup) return;
  if (type === 'table') {
    valueGroup.style.opacity = '0.5';
    aggGroup.style.opacity = '0.5';
  } else if (type === 'cards') {
    valueGroup.style.opacity = '1';
    aggGroup.style.opacity = '1';
  } else {
    valueGroup.style.opacity = '1';
    aggGroup.style.opacity = '1';
  }
}

function onRptSourceChange() {
  var source = document.getElementById('rptSource')?.value;
  if (!source) return;
  _reportBuilderState.columns = [];
  var def = REPORT_SOURCES[source];
  if (!def) return;
  var allFields = def.fields;
  var palette = document.getElementById('rptFieldList');
  if (palette) {
    palette.innerHTML = allFields.map(function(f) {
      return '<div draggable="true" ondragstart="onFieldDragStart(event,\'' + f.key + '\',\'' + htmlEscape(f.label) + '\',\'' + f.type + '\')" ' +
        'style="padding:8px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:grab;font-size:13px;display:flex;align-items:center;gap:8px;transition:all 0.15s;" ' +
        'onmouseover="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.08)\'" ' +
        'onmouseout="this.style.borderColor=\'#e2e8f0\';this.style.boxShadow=\'none\'">' +
        '<i class="fas fa-grip-vertical" style="color:#cbd5e0;font-size:12px;"></i>' +
        '<span>' + htmlEscape(f.label) + '</span>' +
        '<span style="margin-left:auto;font-size:10px;color:' + (f.type === 'number' ? 'var(--info)' : 'var(--text-light)') + ';background:#f1f5f9;padding:2px 6px;border-radius:4px;">' + f.type + '</span>' +
      '</div>';
    }).join('');
  }
  // Update group-by and value dropdowns
  var stringFields = allFields.filter(function(f) { return f.type === 'string'; });
  var numericFields = allFields.filter(function(f) { return f.type === 'number'; });
  var gb = document.getElementById('rptGroupBy');
  if (gb) {
    gb.innerHTML = '<option value="">None</option>' + stringFields.map(function(f) {
      return '<option value="' + f.key + '">' + htmlEscape(f.label) + '</option>';
    }).join('');
  }
  var vf = document.getElementById('rptValueField');
  if (vf) {
    vf.innerHTML = '<option value="">None (count only)</option>' + numericFields.map(function(f) {
      return '<option value="' + f.key + '">' + htmlEscape(f.label) + '</option>';
    }).join('');
  }
  // Update filter dropdown
  var ff = document.getElementById('rptFilterField');
  if (ff) {
    ff.innerHTML = '<option value="">Select field...</option>' + allFields.map(function(f) {
      return '<option value="' + f.key + '">' + htmlEscape(f.label) + '</option>';
    }).join('');
  }
  setBuilderColumns([]);
}

function closeReportBuilder() {
  var el = document.getElementById('reportBuilderOverlay');
  if (el && el.parentNode) el.parentNode.removeChild(el);
  _reportBuilderState = { columns: [], filters: [], draggedField: null };
}

function getBuilderColumns() {
  var list = document.getElementById('rptColumnList');
  if (!list) return _reportBuilderState.columns || [];
  var items = list.querySelectorAll('div[draggable]');
  var cols = [];
  items.forEach(function(el) {
    var span = el.querySelector('span');
    if (span) cols.push(span.textContent.trim());
  });
  return cols.length ? cols : (_reportBuilderState.columns || []);
}

function setBuilderColumns(cols) {
  _reportBuilderState.columns = cols;
  var list = document.getElementById('rptColumnList');
  if (!list) return;
  var empty = document.getElementById('rptColumnEmpty');
  if (cols.length === 0) {
    if (!empty) {
      var e = document.createElement('span');
      e.id = 'rptColumnEmpty';
      e.style.cssText = 'color:#94a3b8;font-size:13px;padding:8px;';
      e.textContent = 'Drag fields from the left to add columns...';
      list.appendChild(e);
    }
    return;
  }
  if (empty) empty.remove();
  list.innerHTML = cols.map(function(c, i) {
    return '<div draggable="true" ondragstart="onColReorderStart(event,' + i + ')" ondrop="onColReorderDrop(event,' + i + ')" ondragover="event.preventDefault()" ' +
      'style="display:inline-flex;align-items:center;gap:6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:4px 10px 4px 6px;font-size:13px;cursor:grab;">' +
      '<i class="fas fa-grip-vertical" style="color:#93c5fd;font-size:10px;"></i>' +
      '<span>' + htmlEscape(c) + '</span>' +
      '<button onclick="removeReportColumn(' + i + ')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;" title="Remove">&times;</button>' +
    '</div>';
  }).join('');
}

var _reorderIdx = -1;
function onColReorderStart(e, idx) { _reorderIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
function onColReorderDrop(e, idx) {
  e.preventDefault();
  if (_reorderIdx < 0 || _reorderIdx === idx) { _reorderIdx = -1; return; }
  var cols = getBuilderColumns();
  if (_reorderIdx < cols.length && idx < cols.length) {
    cols = _reorderArray(cols, _reorderIdx, idx);
    setBuilderColumns(cols);
  }
  _reorderIdx = -1;
}

// ===== BUILD REPORT CONFIG FROM UI =====
function _getReportConfigFromUI() {
  var name = document.getElementById('rptName')?.value?.trim();
  if (!name) { toast('Please enter a report name', 'warning'); return null; }
  var type = document.getElementById('rptType')?.value || 'table';
  var source = document.getElementById('rptSource')?.value || 'students';
  var groupBy = document.getElementById('rptGroupBy')?.value || '';
  var valueField = document.getElementById('rptValueField')?.value || '';
  var aggregate = document.getElementById('rptAggregate')?.value || 'count';
  var columns = getBuilderColumns();
  if (columns.length === 0 && type === 'table') { toast('Please add at least one column to the report', 'warning'); return null; }
  var filters = {};
  var filterList = document.getElementById('rptFilterList');
  if (filterList) {
    var chips = filterList.querySelectorAll('div');
    chips.forEach(function(chip) {
      var txt = chip.textContent || '';
      var colonIdx = txt.indexOf(':');
      if (colonIdx > 0) {
        var fk = txt.substring(0, colonIdx).trim();
        var fv = txt.substring(colonIdx + 1).trim();
        if (fk && fv) filters[fk] = fv;
      }
    });
  }
  return { name: name, type: type, dataSource: source, columns: columns, groupBy: groupBy, valueField: valueField, aggregate: aggregate, filters: filters };
}

// ===== SAVE REPORT =====
function saveCustomReport(editId) {
  var config = _getReportConfigFromUI();
  if (!config) return;
  if (!data.customReports) data.customReports = [];
  if (editId) {
    var idx = data.customReports.findIndex(function(r) { return r.id === editId; });
    if (idx !== -1) {
      data.customReports[idx].name = config.name;
      data.customReports[idx].type = config.type;
      data.customReports[idx].dataSource = config.dataSource;
      data.customReports[idx].columns = config.columns;
      data.customReports[idx].groupBy = config.groupBy;
      data.customReports[idx].valueField = config.valueField;
      data.customReports[idx].aggregate = config.aggregate;
      data.customReports[idx].filters = config.filters;
      data.customReports[idx].updatedAt = new Date().toISOString();
      saveData();
      toast('Report updated');
    }
  } else {
    config.id = genId('RPT');
    config.createdAt = new Date().toISOString();
    config.updatedAt = config.createdAt;
    data.customReports.push(config);
    saveData();
    toast('Report saved');
  }
  closeReportBuilder();
  renderReportBuilder();
}

// ===== DELETE REPORT =====
function deleteCustomReport(id) {
  showConfirmDialog('Delete Report', 'Are you sure you want to delete this report? This cannot be undone.', function() {
    data.customReports = (data.customReports || []).filter(function(r) { return r.id !== id; });
    saveData();
    renderReportBuilder();
    toast('Report deleted');
  }, 'danger');
}

// ===== EDIT REPORT =====
function editCustomReport(id) {
  var report = (data.customReports || []).find(function(r) { return r.id === id; });
  if (!report) { toast('Report not found', 'error'); return; }
  showCreateReportModal(report);
}

// ===== RUN REPORT (preview & full view) =====
function previewReport() {
  var config = _getReportConfigFromUI();
  if (!config) return;
  var area = document.getElementById('rptPreviewArea');
  if (!area) return;
  area.style.display = 'block';
  var result = computeReportData(config);
  area.innerHTML = '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text);"><i class="fas fa-eye"></i> Preview: ' + htmlEscape(config.name) + '</h4>' +
    renderReportOutput(result, config);
}

function runCustomReport(id) {
  var report = (data.customReports || []).find(function(r) { return r.id === id; });
  if (!report) { toast('Report not found', 'error'); return; }
  var result = computeReportData(report);
  var title = 'Report: ' + htmlEscape(report.name);
  var html =
    '<div style="max-width:900px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
      '<h3 style="font-size:18px;font-weight:700;">' + htmlEscape(report.name) + '</h3>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-sm btn-export" onclick="exportReportCSV(\'' + id + '\')"><i class="fas fa-download"></i> CSV</button>' +
        '<button class="btn btn-sm btn-export" onclick="printSection(\'rptResultContent\',\'' + htmlEscape(report.name) + '\')"><i class="fas fa-print"></i> Print</button>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;font-size:13px;color:var(--text-light);flex-wrap:wrap;">' +
      '<span class="badge badge-info">' + htmlEscape(report.type) + '</span>' +
      '<span class="badge" style="background:#e2e8f0;color:#475569;">' + htmlEscape(report.dataSource) + '</span>' +
      (report.groupBy ? '<span class="badge" style="background:#dbeafe;color:#1e40af;">Group: ' + htmlEscape(report.groupBy) + '</span>' : '') +
      (report.valueField ? '<span class="badge" style="background:#fef3c7;color:#92400e;">' + htmlEscape(report.aggregate) + '(' + htmlEscape(report.valueField) + ')</span>' : '') +
    '</div>' +
    '<div id="rptResultContent">' + renderReportOutput(result, report) + '</div>' +
    '<p style="margin-top:12px;font-size:12px;color:var(--text-light);">Showing ' + result.length + ' row' + (result.length !== 1 ? 's' : '') + '</p>' +
    '</div>';
  openModal(html);
}

// ===== DATA PROCESSING ENGINE =====
function computeReportData(config) {
  var srcDef = REPORT_SOURCES[config.dataSource];
  if (!srcDef) return [];
  var records = JSON.parse(JSON.stringify(srcDef.getData() || []));
  // Apply filters
  var filters = config.filters || {};
  Object.keys(filters).forEach(function(fk) {
    var fv = filters[fk].toString().toLowerCase().trim();
    if (fv) {
      records = records.filter(function(rec) {
        var val = (rec[fk] || '').toString().toLowerCase().trim();
        return val === fv || val.indexOf(fv) !== -1;
      });
    }
  });
  var groupBy = config.groupBy;
  var valueField = config.valueField;
  var aggregate = config.aggregate || 'count';
  var columns = config.columns || [];
  // If no group by, return raw filtered records
  if (!groupBy || groupBy === '') {
    var cols = columns.length ? columns : Object.keys(records[0] || {});
    return records.map(function(rec) {
      var row = {};
      cols.forEach(function(c) { row[c] = rec[c]; });
      return row;
    });
  }
  // Group by specified field
  var groups = {};
  records.forEach(function(rec) {
    var gVal = rec[groupBy] !== undefined && rec[groupBy] !== null ? rec[groupBy].toString() : '(blank)';
    if (!groups[gVal]) groups[gVal] = [];
    groups[gVal].push(rec);
  });
  var result = [];
  Object.keys(groups).forEach(function(gVal) {
    var groupRecs = groups[gVal];
    var row = {};
    row[groupBy] = gVal;
    row['_count'] = groupRecs.length;
    if (valueField && valueField !== '') {
      var vals = groupRecs.map(function(r) { return parseFloat(r[valueField]) || 0; });
      if (aggregate === 'sum') row['_' + aggregate] = vals.reduce(function(a, b) { return a + b; }, 0);
      else if (aggregate === 'avg') row['_' + aggregate] = (vals.reduce(function(a, b) { return a + b; }, 0) / vals.length);
      else if (aggregate === 'min') row['_' + aggregate] = Math.min.apply(null, vals);
      else if (aggregate === 'max') row['_' + aggregate] = Math.max.apply(null, vals);
      else row['_count'] = groupRecs.length; // count falls back
    }
    // Include requested columns if they exist
    columns.forEach(function(c) {
      if (c !== groupBy && row[c] === undefined) {
        row[c] = groupRecs[0][c] !== undefined ? groupRecs[0][c] : '';
      }
    });
    result.push(row);
  });
  return result;
}

// ===== REPORT RENDERERS =====
function renderReportOutput(rows, config) {
  if (!rows || rows.length === 0) return '<div class="empty-state"><i class="fas fa-inbox"></i><p>No data matches the current filters</p></div>';
  var type = config.type || 'table';
  switch(type) {
    case 'bar': return renderReportBarChart(rows, config);
    case 'pie': return renderReportPieChart(rows, config);
    case 'cards': return renderReportCards(rows, config);
    default: return renderReportTable(rows, config);
  }
}

function renderReportTable(rows, config) {
  var columns = config.columns && config.columns.length ? config.columns : Object.keys(rows[0] || {});
  // Remove internal keys from display
  var displayCols = columns.filter(function(c) { return c.indexOf('_') !== 0; });
  if (displayCols.length === 0) displayCols = columns;
  var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>';
  displayCols.forEach(function(c) { html += '<th style="padding:10px 12px;border-bottom:2px solid #e2e8f0;text-align:left;font-weight:600;color:#475569;white-space:nowrap;">' + htmlEscape(c) + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr>';
    displayCols.forEach(function(c) {
      var val = row[c] !== undefined ? row[c] : '';
      if (typeof val === 'number') val = Number(val).toLocaleString();
      html += '<td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">' + htmlEscape(String(val)) + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderReportBarChart(rows, config) {
  var groupBy = config.groupBy || Object.keys(rows[0] || {}).find(function(k) { return k.indexOf('_') !== 0; }) || 'category';
  var valueKey = config.valueField ? '_' + (config.aggregate || 'count') : '_count';
  var maxVal = Math.max.apply(null, rows.map(function(r) { return parseFloat(r[valueKey]) || 0; })) || 1;
  var labelKey = groupBy;
  var html = '<div style="padding:8px 0;">';
  rows.forEach(function(row) {
    var val = parseFloat(row[valueKey]) || 0;
    var pct = (val / maxVal) * 100;
    var color = val / maxVal > 0.7 ? '#3b82f6' : val / maxVal > 0.4 ? '#f59e0b' : '#ef4444';
    html +=
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">' +
        '<div style="width:120px;font-size:13px;font-weight:500;text-align:right;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + htmlEscape(String(row[labelKey] || '')) + '</div>' +
        '<div style="flex:1;height:28px;background:#f1f5f9;border-radius:14px;overflow:hidden;position:relative;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:14px;transition:width 0.3s;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;min-width:32px;">' +
            '<span style="font-size:12px;font-weight:600;color:' + (pct > 30 ? '#fff' : '#475569') + ';">' + val.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

function renderReportPieChart(rows, config) {
  var groupBy = config.groupBy || Object.keys(rows[0] || {}).find(function(k) { return k.indexOf('_') !== 0; }) || 'category';
  var valueKey = config.valueField ? '_' + (config.aggregate || 'count') : '_count';
  var total = rows.reduce(function(sum, r) { return sum + (parseFloat(r[valueKey]) || 0); }, 0) || 1;
  var colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#e11d48', '#7c3aed', '#d946ef', '#0ea5e9', '#22c55e', '#eab308', '#a855f7', '#fb923c', '#38bdf8'];
  var conicParts = [];
  var legendHtml = '';
  rows.forEach(function(row, i) {
    var val = parseFloat(row[valueKey]) || 0;
    var pct = ((val / total) * 100);
    var color = colors[i % colors.length];
    conicParts.push(color + ' ' + (conicParts.length ? (conicParts[conicParts.length - 1].split(' ').pop() || '0%') : '0%') + ' ' + (conicParts.reduce(function(s, p) { return s + parseFloat(p.split(' ').pop() || '0'); }, 0) + pct) + '%');
    legendHtml +=
      '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
        '<div style="width:12px;height:12px;border-radius:3px;background:' + color + ';flex-shrink:0;"></div>' +
        '<span>' + htmlEscape(String(row[groupBy] || '')) + '</span>' +
        '<span style="margin-left:auto;font-weight:600;">' + pct.toFixed(1) + '%</span>' +
        '<span style="color:var(--text-light);font-size:12px;">(' + val.toLocaleString() + ')</span>' +
      '</div>';
  });
  var html =
    '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">' +
      '<div style="width:200px;height:200px;border-radius:50%;background:conic-gradient(' + conicParts.join(', ') + ');flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,0.1);"></div>' +
      '<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px;">' + legendHtml + '</div>' +
    '</div>';
  return html;
}

function renderReportCards(rows, config) {
  var valueKey = config.valueField ? '_' + (config.aggregate || 'count') : '_count';
  var groupBy = config.groupBy || '';
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">';
  rows.forEach(function(row) {
    var val = parseFloat(row[valueKey]) || 0;
    var label = groupBy ? (row[groupBy] || 'Total') : 'Total';
    html +=
      '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
        '<div style="font-size:28px;font-weight:700;color:var(--primary);margin-bottom:4px;">' + val.toLocaleString() + '</div>' +
        '<div style="font-size:13px;color:var(--text-light);">' + htmlEscape(label) + '</div>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

// ===== CSV EXPORT =====
function exportReportCSV(id) {
  var report = (data.customReports || []).find(function(r) { return r.id === id; });
  if (!report) { toast('Report not found', 'error'); return; }
  var result = computeReportData(report);
  if (!result || result.length === 0) { toast('No data to export', 'warning'); return; }
  var columns = report.columns && report.columns.length ? report.columns : Object.keys(result[0] || {});
  var displayCols = columns.filter(function(c) { return c.indexOf('_') !== 0; });
  if (displayCols.length === 0) displayCols = columns;
  var csv = displayCols.join(',') + '\r\n';
  result.forEach(function(row) {
    var line = displayCols.map(function(c) {
      var val = row[c] !== undefined ? String(row[c]) : '';
      // Escape CSV
      if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',');
    csv += line + '\r\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (report.name || 'report').replace(/[^a-zA-Z0-9]+/g, '_') + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('CSV exported');
}
