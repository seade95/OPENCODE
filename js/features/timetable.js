// EDUVERSE - Timetable Module
// Extracted from features.js

// ===== TIMETABLE GENERATOR =====
const _TT_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

function _ttPeriods() {
  var n = (data.timetableSettings && data.timetableSettings.periodsPerDay) || 8;
  var h = (data.timetableSettings && data.timetableSettings.startHour) || 8;
  var out = [];
  for (var i = 0; i < n; i++) {
    var s = h + i;
    var e = s + 1;
    out.push((s < 10 ? '0' + s : s) + ':00-' + (e < 10 ? '0' + e : e) + ':00');
  }
  return out;
}

function _ttBreaks() {
  return (data.timetableSettings && data.timetableSettings.breaks) || [];
}

function _ttRooms() {
  if (!data.rooms) data.rooms = [
    { id: 'RM001', name: 'Room 101', capacity: 40 },
    { id: 'RM002', name: 'Room 102', capacity: 35 },
    { id: 'RM003', name: 'Science Lab', capacity: 30 },
    { id: 'RM004', name: 'Computer Lab', capacity: 25 },
    { id: 'RM005', name: 'Library', capacity: 50 }
  ];
  return data.rooms;
}

function _ttTeacherSubjects() {
  if (!data.teacherSubjects) data.teacherSubjects = [];
  return data.teacherSubjects;
}

function _ttAllSubjects() {
  return ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art','Physical Education','Music'];
}

function renderTimetableSettings() {
  var container = document.getElementById('timetableSettingsView');
  if (!container) return;
  if (!data.timetableSettings) data.timetableSettings = { periodsPerDay: 8, startHour: 8, breaks: [3] };
  var s = data.timetableSettings;
  container.innerHTML =
    '<div class="card" style="padding:24px;">' +
    '<h3 style="font-size:16px;font-weight:600;margin-bottom:16px;"><i class="fas fa-cog"></i> Timetable Settings</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Periods Per Day</label><input type="number" id="ttPeriodsPerDay" value="' + s.periodsPerDay + '" min="4" max="12" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '<div class="form-group"><label>Start Hour (24h)</label><input type="number" id="ttStartHour" value="' + s.startHour + '" min="6" max="12" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Break Periods (comma-separated period numbers, e.g. 3,6)</label><input type="text" id="ttBreaks" value="' + (s.breaks || []).join(',') + '" placeholder="e.g. 3,6" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:16px;" onclick="saveTimetableSettings()"><i class="fas fa-save"></i> Save Settings</button>' +
    '<div id="ttSettingsPreview" style="margin-top:16px;"></div>' +
    '</div>';
  _ttPreviewSettings();
}

function _ttPreviewSettings() {
  var el = document.getElementById('ttSettingsPreview');
  if (!el) return;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var html = '<div style="font-size:13px;color:var(--text-light);margin-top:8px;"><strong>Preview:</strong> ' + periods.length + ' periods · Start ' + (data.timetableSettings ? data.timetableSettings.startHour || 8 : 8) + ':00';
  if (breaks.length) html += ' · Break at period(s): ' + breaks.map(function(b) { return b + 1; }).join(', ');
  html += '</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;">';
  periods.forEach(function(p, i) {
    var isBreak = breaks.indexOf(i) !== -1;
    html += '<span style="padding:4px 10px;border-radius:4px;font-size:12px;' + (isBreak ? 'background:#fefcbf;color:#744210;' : 'background:#ebf8ff;color:#2b6cb0;') + '">' + (isBreak ? '<i class="fas fa-coffee"></i> ' : '') + p + '</span>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function saveTimetableSettings() {
  var ppd = parseInt(document.getElementById('ttPeriodsPerDay')?.value);
  var sh = parseInt(document.getElementById('ttStartHour')?.value);
  var brkStr = document.getElementById('ttBreaks')?.value || '';
  if (isNaN(ppd) || ppd < 4 || ppd > 12) { toast('Periods per day must be 4-12', 'error'); return; }
  if (isNaN(sh) || sh < 6 || sh > 12) { toast('Start hour must be 6-12', 'error'); return; }
  var breaks = brkStr.split(',').map(function(x) { return parseInt(x.trim()) - 1; }).filter(function(x) { return x >= 0 && x < ppd; });
  data.timetableSettings = { periodsPerDay: ppd, startHour: sh, breaks: breaks };
  saveData();
  toast('Timetable settings saved');
  renderTimetableAdmin();
  renderTimetableSettings();
}

function renderRoomManager() {
  var container = document.getElementById('roomManagerView');
  if (!container) return;
  var rooms = _ttRooms();
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
    '<h3 style="font-size:16px;font-weight:600;"><i class="fas fa-door-open"></i> Rooms</h3>' +
    '<button class="btn btn-primary btn-sm" onclick="showAddRoomModal()"><i class="fas fa-plus"></i> Add Room</button>' +
    '</div>';
  if (!rooms.length) {
    html += '<p class="empty-state" style="margin:0;"><i class="fas fa-door-open"></i> No rooms configured</p>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">';
    rooms.forEach(function(r) {
      html += '<div style="padding:12px;background:#f7fafc;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + htmlEscape(r.name) + '</strong><p style="font-size:12px;color:var(--text-light);">Capacity: ' + r.capacity + '</p></div>' +
        '<button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:12px;color:#e53e3e;" onclick="deleteRoom(\'' + r.id + '\')"><i class="fas fa-times"></i></button></div>';
    });
    html += '</div>';
  }
  container.innerHTML = html;
}

function showAddRoomModal() {
  openModal(
    '<h3><i class="fas fa-plus"></i> Add Room</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Room Name</label><input type="text" id="fRoomName" placeholder="e.g. Science Lab" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '<div class="form-group"><label>Capacity</label><input type="number" id="fRoomCapacity" value="30" min="1" max="200" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="saveRoom()"><i class="fas fa-save"></i> Save</button></div>'
  );
}

function saveRoom() {
  var name = document.getElementById('fRoomName')?.value?.trim();
  var cap = parseInt(document.getElementById('fRoomCapacity')?.value);
  if (!name) { toast('Enter a room name', 'error'); return; }
  if (isNaN(cap) || cap < 1) { toast('Enter a valid capacity', 'error'); return; }
  _ttRooms();
  data.rooms.push({ id: genId('RM'), name: name, capacity: cap });
  saveData();
  closeModal();
  renderRoomManager();
  toast('Room added');
}

function deleteRoom(id) {
  if (!confirm('Delete this room?')) return;
  data.rooms = (data.rooms || []).filter(function(r) { return r.id !== id; });
  saveData();
  renderRoomManager();
}

function renderTeacherSubjects() {
  var container = document.getElementById('teacherSubjectsView');
  if (!container) return;
  var ts = _ttTeacherSubjects();
  var subjects = _ttAllSubjects();
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
    '<h3 style="font-size:16px;font-weight:600;"><i class="fas fa-chalkboard-teacher"></i> Teacher Subject Assignments</h3>' +
    '<button class="btn btn-primary btn-sm" onclick="showAddTeacherSubjectModal()"><i class="fas fa-plus"></i> Assign Subject</button>' +
    '</div>';
  if (!ts.length) {
    html += '<p class="empty-state" style="margin:0;"><i class="fas fa-chalkboard-teacher"></i> No subjects assigned to teachers yet. Assign subjects so the auto-scheduler can plan lessons.</p>';
  } else {
    html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="background:var(--primary);color:white;">' +
      '<th style="padding:10px 12px;text-align:left;">Teacher</th><th style="padding:10px 12px;text-align:left;">Subject</th><th style="padding:10px 12px;text-align:center;">Action</th></tr></thead><tbody>';
    ts.forEach(function(t) {
      var teacher = getTeacher(t.teacherId);
      html += '<tr style="border-bottom:1px solid #e2e8f0;">' +
        '<td style="padding:10px 12px;">' + (teacher ? htmlEscape(teacher.name) : htmlEscape(t.teacherId)) + '</td>' +
        '<td style="padding:10px 12px;">' + htmlEscape(t.subject) + '</td>' +
        '<td style="padding:10px 12px;text-align:center;"><button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:12px;color:#e53e3e;" onclick="deleteTeacherSubject(\'' + t.id + '\')"><i class="fas fa-times"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
  }
  container.innerHTML = html;
}

function showAddTeacherSubjectModal() {
  var teachers = data.teachers || [];
  var subjects = _ttAllSubjects();
  var tOpts = teachers.map(function(t) { return '<option value="' + htmlEscape(t.id) + '">' + htmlEscape(t.name) + '</option>'; }).join('');
  var sOpts = subjects.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  openModal(
    '<h3><i class="fas fa-plus"></i> Assign Subject to Teacher</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Teacher</label><select id="fTSTeacher" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' + tOpts + '</select></div>' +
    '<div class="form-group"><label>Subject</label><select id="fTSSubject" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' + sOpts + '</select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="saveTeacherSubject()"><i class="fas fa-save"></i> Save</button></div>'
  );
}

function saveTeacherSubject() {
  var teacherId = document.getElementById('fTSTeacher')?.value;
  var subject = document.getElementById('fTSSubject')?.value;
  if (!teacherId || !subject) { toast('Select a teacher and subject', 'error'); return; }
  _ttTeacherSubjects();
  if (data.teacherSubjects.find(function(t) { return t.teacherId === teacherId && t.subject === subject; })) {
    toast('This teacher already has this subject assigned', 'error');
    return;
  }
  data.teacherSubjects.push({ id: genId('TS'), teacherId: teacherId, subject: subject });
  saveData();
  closeModal();
  renderTeacherSubjects();
  toast('Subject assigned to teacher');
}

function deleteTeacherSubject(id) {
  if (!confirm('Remove this subject assignment?')) return;
  data.teacherSubjects = (data.teacherSubjects || []).filter(function(t) { return t.id !== id; });
  saveData();
  renderTeacherSubjects();
}

// === ENHANCED TIMETABLE GRID ===
function renderTimetableAdmin() {
  var container = document.getElementById('timetableView');
  if (!container) return;
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var filter = document.getElementById('ttClassFilter');
  var cls = filter ? filter.value : '';

  // Populate filter
  if (filter) {
    var allClasses = [...new Set(data.timetables.map(function(t) { return t.class; }).concat((data.students || []).map(function(s) { return s.class; })))];
    filter.innerHTML = '<option value="">All Classes</option>' + allClasses.map(function(c) { return '<option value="' + htmlEscape(c) + '"' + (c === cls ? ' selected' : '') + '>' + htmlEscape(c) + '</option>'; }).join('');
  }

  var entries = cls ? data.timetables.filter(function(t) { return t.class === cls; }) : data.timetables;
  var conflicts = detectTimetableConflicts();

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<button class="btn btn-primary btn-sm" onclick="showAddTimetableModal()"><i class="fas fa-plus"></i> Add</button>' +
    '<button class="btn btn-sm" style="background:#805ad5;color:white;" onclick="showAutoScheduleModal()"><i class="fas fa-magic"></i> Auto Schedule</button>' +
    '<button class="btn btn-sm btn-outline" onclick="renderTimetableAdmin()"><i class="fas fa-sync"></i> Refresh</button>' +
    '<button class="btn btn-sm" style="background:#e53e3e;color:white;" onclick="printTimetable()"><i class="fas fa-file-pdf"></i> PDF</button>' +
    '</div>' +
    '<div style="font-size:12px;display:flex;gap:12px;">' +
    '<span style="color:#e53e3e;"><i class="fas fa-exclamation-circle"></i> ' + conflicts.length + ' conflict(s)</span>' +
    '<span style="color:var(--text-light);">' + data.timetables.length + ' entries</span>' +
    '</div></div>';

  // Show conflicts summary
  if (conflicts.length) {
    html += '<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<p style="font-weight:600;color:#c53030;font-size:13px;margin-bottom:8px;"><i class="fas fa-exclamation-triangle"></i> Scheduling Conflicts</p>';
    conflicts.slice(0, 10).forEach(function(c) {
      html += '<div style="font-size:12px;color:#9b2c2c;padding:2px 0;">' +
        '<i class="fas fa-times-circle"></i> ' + htmlEscape(c.description) +
        ' (<strong>' + htmlEscape(c.day) + ' ' + htmlEscape(c.period) + '</strong>)</div>';
    });
    if (conflicts.length > 10) html += '<div style="font-size:12px;color:#9b2c2c;">...and ' + (conflicts.length - 10) + ' more</div>';
    html += '</div>';
  }

  // Build grid
  var colWidth = Math.floor(90 / (days.length + 1)) + '%';
  html += '<div style="overflow-x:auto;"><div class="timetable-grid" style="min-width:600px;">';
  // Header row
  html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);">';
  html += '<div class="timetable-header">Time</div>';
  days.forEach(function(d) { html += '<div class="timetable-header">' + d + '</div>'; });
  html += '</div>';

  periods.forEach(function(p, pi) {
    var isBreak = breaks.indexOf(pi) !== -1;
    html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);">';
    html += '<div class="timetable-header" style="font-size:12px;background:' + (isBreak ? '#fefcbf' : 'var(--primary-light)') + ';color:' + (isBreak ? '#744210' : 'white') + ';">' +
      (isBreak ? '<i class="fas fa-coffee" title="Break"></i> ' : '') + p + '</div>';

    days.forEach(function(d, di) {
      var entry = entries.find(function(t) { return t.day === d && t.period === p; });
      if (isBreak) {
        html += '<div class="timetable-cell tt-break" style="background:#fefcbf;text-align:center;font-size:12px;color:#744210;"><i class="fas fa-coffee"></i> Break</div>';
      } else if (entry) {
        var hasConflict = conflicts.some(function(c) { return c.entryId === entry.id; });
        var style = hasConflict ? 'border:2px solid #e53e3e;background:#fff5f5;' : '';
        var room = entry.roomId ? _ttRooms().find(function(r) { return r.id === entry.roomId; }) : null;
        html += '<div class="timetable-cell tt-entry" style="' + style + '" draggable="true" ondragstart="ttDragStart(\'' + entry.id + '\',\'' + htmlEscape(entry.class) + '\')" ondragover="ttDragOver(event)" ondragleave="ttDragLeave(event)" ondrop="ttDrop(event,\'' + d + '\',\'' + p + '\')" onclick="showEditTimetableModal(\'' + entry.id + '\')" title="Click to edit, drag to move">' +
          '<div class="subject">' + htmlEscape(entry.subject) + '</div>' +
          '<div class="teacher-name">' + htmlEscape(entry.teacher) + '</div>' +
          '<div style="font-size:11px;color:var(--text-light);">' + htmlEscape(entry.class) + '</div>' +
          (room ? '<div style="font-size:10px;color:#805ad5;">' + htmlEscape(room.name) + '</div>' : '') +
          '<div style="margin-top:4px;"><button class="btn btn-sm btn-outline tt-delete-btn" style="padding:2px 6px;font-size:10px;color:#e53e3e;" onclick="event.stopPropagation();deleteTimetableEntry(\'' + entry.id + '\')"><i class="fas fa-times"></i></button></div></div>';
      } else {
        html += '<div class="timetable-cell tt-empty" ondragover="ttDragOver(event)" ondragleave="ttDragLeave(event)" ondrop="ttDrop(event,\'' + d + '\',\'' + p + '\')" onclick="quickAddTimetable(\'' + d + '\',\'' + p + '\')">+</div>';
      }
    });
    html += '</div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}

function quickAddTimetable(day, period) {
  var classOpts = [...new Set(data.students.map(function(s) { return s.class; }))].map(function(c) { return '<option value="' + htmlEscape(c) + '">' + htmlEscape(c) + '</option>'; }).join('');
  var teacherOpts = data.teachers.map(function(t) { return '<option value="' + htmlEscape(t.name) + '">' + htmlEscape(t.name) + '</option>'; }).join('');
  var subjectOpts = _ttAllSubjects().map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  openModal(
    '<h3><i class="fas fa-plus"></i> Add Timetable Entry — ' + day + ' ' + period + '</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Class</label><select id="fTTClass">' + classOpts + '</select></div>' +
    '<div class="form-group"><label>Subject</label><select id="fTTSubject">' + subjectOpts + '</select></div>' +
    '<div class="form-group"><label>Teacher</label><select id="fTTTeacher">' + teacherOpts + '</select></div>' +
    '<div class="form-group"><label>Room</label><select id="fTTRoom"><option value="">None</option>' + _ttRooms().map(function(r) { return '<option value="' + r.id + '">' + htmlEscape(r.name) + '</option>'; }).join('') + '</select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="saveQuickTimetable(\'' + day + '\',\'' + period + '\')"><i class="fas fa-save"></i> Save</button></div>'
  );
}

function saveQuickTimetable(day, period) {
  var cls = document.getElementById('fTTClass')?.value;
  var subject = document.getElementById('fTTSubject')?.value;
  var teacher = document.getElementById('fTTTeacher')?.value;
  var roomId = document.getElementById('fTTRoom')?.value;
  if (!cls || !subject || !teacher) { toast('Fill all required fields', 'error'); return; }
  if (data.timetables.find(function(t) { return t.class === cls && t.day === day && t.period === period; })) {
    toast('This class already has a lesson at this time', 'error');
    return;
  }
  data.timetables.push({ id: genId('TT'), class: cls, day: day, period: period, subject: subject, teacher: teacher, roomId: roomId || '' });
  saveData();
  closeModal();
  renderTimetableAdmin();
  toast('Timetable entry added');
}

function showAutoScheduleModal() {
  var classes = [...new Set(data.students.map(function(s) { return s.class; }))];
  var classOpts = classes.map(function(c) { return '<label style="display:flex;align-items:center;gap:6px;padding:4px 0;"><input type="checkbox" class="autoSchedClass" value="' + htmlEscape(c) + '" checked> ' + htmlEscape(c) + '</label>'; }).join('');
  openModal(
    '<h3><i class="fas fa-magic"></i> Auto Schedule Timetable</h3>' +
    '<div style="margin:16px 0;">' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:12px;">Select classes to schedule. The generator will assign subjects based on teacher-subject assignments and available time slots.</p>' +
    '<div style="background:#f7fafc;border-radius:8px;padding:12px;margin-bottom:12px;">' +
    '<p style="font-weight:600;margin-bottom:8px;">Select Classes:</p>' + classOpts + '</div>' +
    '<div class="form-group"><label>Subjects Per Class Per Week</label><input type="number" id="autoSchedSubjectsPerWeek" value="10" min="1" max="20" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;"></div>' +
    '<div id="autoSchedProgress" style="margin-top:12px;"></div>' +
    '<div id="autoSchedResult" style="margin-top:12px;"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="runAutoScheduler()"><i class="fas fa-play"></i> Generate</button></div>'
  );
}

function runAutoScheduler() {
  var classEls = document.querySelectorAll('.autoSchedClass:checked');
  var classes = [];
  classEls.forEach(function(el) { classes.push(el.value); });
  if (!classes.length) { toast('Select at least one class', 'error'); return; }

  var subjectsPerWeek = parseInt(document.getElementById('autoSchedSubjectsPerWeek')?.value) || 10;
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var allSubjects = _ttAllSubjects();
  var ts = _ttTeacherSubjects();
  var rooms = _ttRooms();
  var progress = document.getElementById('autoSchedProgress');
  var resultEl = document.getElementById('autoSchedResult');

  var scheduled = [];
  var failed = [];
  var usedSlots = {};

  var classSubjectCounts = {};

  classes.forEach(function(cls) {
    classSubjectCounts[cls] = {};
    allSubjects.forEach(function(subj) {
      var hasTeacher = ts.some(function(t) {
        var teacher = getTeacher(t.teacherId);
        if (!teacher) return false;
        return t.subject === subj;
      });
      if (hasTeacher) classSubjectCounts[cls][subj] = subjectsPerWeek;
    });
  });

  if (progress) progress.innerHTML = '<p style="font-size:13px;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Scheduling...</p>';

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  classes.forEach(function(cls) {
    var clsSubjects = classSubjectCounts[cls] || {};
    var subjectList = Object.keys(clsSubjects);

    subjectList.forEach(function(subject) {
      var count = clsSubjects[subject];
      for (var c = 0; c < count; c++) {
        if (!subjectList.length) break;

        var scheduled_this_subject = false;
        var slotAttempts = 0;

        var shuffledDays = shuffle(days);
        for (var di = 0; di < shuffledDays.length && !scheduled_this_subject; di++) {
          var day = shuffledDays[di];
          var shuffledPeriods = shuffle(periods);
          for (var pi = 0; pi < shuffledPeriods.length && !scheduled_this_subject; pi++) {
            var period = shuffledPeriods[pi];
            slotAttempts++;

            var periodIdx = periods.indexOf(period);
            if (breaks.indexOf(periodIdx) !== -1) continue;

            if (data.timetables.some(function(t) { return t.class === cls && t.day === day && t.period === period; })) continue;
            if (scheduled.some(function(t) { return t.class === cls && t.day === day && t.period === period; })) continue;

            var teacherEntries = ts.filter(function(t) { return t.subject === subject; });
            var availableTeacher = null;
            var teacherId = null;

            for (var ti = 0; ti < teacherEntries.length; ti++) {
              var te = teacherEntries[ti];
              var teacher = getTeacher(te.teacherId);
              if (!teacher) continue;

              var teacherBusy = data.timetables.some(function(t) { return t.teacher === teacher.name && t.day === day && t.period === period; });
              if (teacherBusy) continue;

              var pendingBusy = scheduled.some(function(t) { var tc = getTeacher(t.teacherId); return tc && tc.name === teacher.name && t.day === day && t.period === period; });
              if (pendingBusy) continue;

              availableTeacher = teacher;
              teacherId = te.teacherId;
              break;
            }

            if (!availableTeacher && teacherEntries.length > 0) continue;
            if (!availableTeacher) continue;

            var availableRoom = null;
            for (var ri = 0; ri < rooms.length; ri++) {
              var roomBusy = data.timetables.some(function(t) { return t.roomId === rooms[ri].id && t.day === day && t.period === period; });
              var roomPending = scheduled.some(function(t) { return t.roomId === rooms[ri].id && t.day === day && t.period === period; });
              if (!roomBusy && !roomPending) {
                availableRoom = rooms[ri];
                break;
              }
            }

            var entry = {
              id: genId('TT'),
              class: cls,
              day: day,
              period: period,
              subject: subject,
              teacher: availableTeacher.name,
              teacherId: teacherId,
              roomId: availableRoom ? availableRoom.id : ''
            };
            scheduled.push(entry);
            scheduled_this_subject = true;
          }
        }

        if (!scheduled_this_subject) {
          failed.push({ class: cls, subject: subject });
        }
      }
    });
  });

  scheduled.forEach(function(e) {
    data.timetables.push(e);
  });
  saveData();

  if (progress) progress.innerHTML = '';
  var resultHtml = '';
  if (scheduled.length) {
    resultHtml += '<div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:12px;margin-bottom:8px;">' +
      '<p style="font-weight:600;color:#22543d;"><i class="fas fa-check-circle"></i> Scheduled ' + scheduled.length + ' lesson(s)</p></div>';
  }
  if (failed.length) {
    resultHtml += '<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:12px;">' +
      '<p style="font-weight:600;color:#c53030;margin-bottom:4px;"><i class="fas fa-exclamation-triangle"></i> Could not schedule ' + failed.length + ':</p>' +
      failed.slice(0, 20).map(function(f) { return '<div style="font-size:12px;color:#9b2c2c;">' + htmlEscape(f.class) + ' — ' + htmlEscape(f.subject) + '</div>'; }).join('') +
      (failed.length > 20 ? '<div style="font-size:12px;color:#9b2c2c;">...and ' + (failed.length - 20) + ' more</div>' : '') +
      '</div>';
  }
  resultEl.innerHTML = resultHtml;
  toast('Scheduled ' + scheduled.length + ' lessons');
  renderTimetableAdmin();
}

function detectTimetableConflicts() {
  var conflicts = [];
  var entries = data.timetables || [];

  entries.forEach(function(e1, i) {
    entries.forEach(function(e2, j) {
      if (j <= i) return;
      if (e1.day !== e2.day || e1.period !== e2.period) return;

      if (e1.teacher && e2.teacher && e1.teacher === e2.teacher) {
        conflicts.push({
          entryId: e1.id,
          type: 'teacher',
          day: e1.day,
          period: e1.period,
          description: 'Teacher "' + e1.teacher + '" double-booked: ' + e1.class + ' and ' + e2.class
        });
      }

      if (e1.roomId && e2.roomId && e1.roomId === e2.roomId) {
        var room = _ttRooms().find(function(r) { return r.id === e1.roomId; });
        conflicts.push({
          entryId: e1.id,
          type: 'room',
          day: e1.day,
          period: e1.period,
          description: 'Room "' + (room ? room.name : e1.roomId) + '" double-booked: ' + e1.class + ' and ' + e2.class
        });
      }

      if (e1.class === e2.class) {
        conflicts.push({
          entryId: e1.id,
          type: 'class',
          day: e1.day,
          period: e1.period,
          description: 'Class "' + e1.class + '" double-booked: ' + e1.subject + ' and ' + e2.subject
        });
      }
    });
  });

  return conflicts;
}

function renderTimetableStudent() {
  if (!currentStudent) return;
  var container = document.getElementById('stuTimetableView');
  if (!container) return;
  var myClass = currentStudent.class;
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var html = '<div style="overflow-x:auto;"><div class="timetable-grid" style="min-width:500px;">';
  html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);"><div class="timetable-header">Time</div>';
  days.forEach(function(d) { html += '<div class="timetable-header">' + d + '</div>'; });
  html += '</div>';
  periods.forEach(function(p, pi) {
    var isBreak = breaks.indexOf(pi) !== -1;
    html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);">';
    html += '<div class="timetable-header" style="font-size:12px;background:' + (isBreak ? '#fefcbf' : 'var(--primary-light)') + ';color:' + (isBreak ? '#744210' : 'white') + ';">' + p + '</div>';
    days.forEach(function(d) {
      if (isBreak) {
        html += '<div class="timetable-cell" style="background:#fefcbf;text-align:center;font-size:12px;color:#744210;"><i class="fas fa-coffee"></i></div>';
      } else {
        var entry = data.timetables.find(function(t) { return t.day === d && t.period === p && t.class === myClass; });
        if (entry) {
          var room = entry.roomId ? _ttRooms().find(function(r) { return r.id === entry.roomId; }) : null;
          html += '<div class="timetable-cell"><div class="subject">' + htmlEscape(entry.subject) + '</div><div class="teacher-name">' + htmlEscape(entry.teacher) + '</div>' +
            (room ? '<div style="font-size:10px;color:#805ad5;">' + htmlEscape(room.name) + '</div>' : '') + '</div>';
        } else {
          html += '<div class="timetable-cell" style="color:var(--text-light);font-size:12px;">--</div>';
        }
      }
    });
    html += '</div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}

function renderTimetableTeacher() {
  if (!currentTeacher) return;
  var container = document.getElementById('tchTimetableView');
  if (!container) return;
  var tName = currentTeacher.name;
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var html = '<div style="overflow-x:auto;"><div class="timetable-grid" style="min-width:500px;">';
  html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);"><div class="timetable-header">Time</div>';
  days.forEach(function(d) { html += '<div class="timetable-header">' + d + '</div>'; });
  html += '</div>';
  periods.forEach(function(p, pi) {
    var isBreak = breaks.indexOf(pi) !== -1;
    html += '<div class="timetable-row" style="grid-template-columns:80px repeat(' + days.length + ',1fr);">';
    html += '<div class="timetable-header" style="font-size:12px;background:' + (isBreak ? '#fefcbf' : 'var(--primary-light)') + ';color:' + (isBreak ? '#744210' : 'white') + ';">' + p + '</div>';
    days.forEach(function(d) {
      if (isBreak) {
        html += '<div class="timetable-cell" style="background:#fefcbf;text-align:center;font-size:12px;color:#744210;"><i class="fas fa-coffee"></i></div>';
      } else {
        var entry = data.timetables.find(function(t) { return t.day === d && t.period === p && t.teacher === tName; });
        if (entry) {
          html += '<div class="timetable-cell"><div class="subject">' + htmlEscape(entry.subject) + '</div><div class="teacher-name">' + htmlEscape(entry.class) + '</div></div>';
        } else {
          html += '<div class="timetable-cell" style="color:var(--text-light);font-size:12px;">--</div>';
        }
      }
    });
    html += '</div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}

function showAddTimetableModal() {
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var dayOpts = days.map(function(d) { return '<option value="' + d + '">' + d + '</option>'; }).join('');
  var periodOpts = periods.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');
  var classOpts = [...new Set(data.students.map(function(s) { return s.class; }))].map(function(c) { return '<option value="' + htmlEscape(c) + '">' + htmlEscape(c) + '</option>'; }).join('');
  var teacherOpts = data.teachers.map(function(t) { return '<option value="' + htmlEscape(t.name) + '">' + htmlEscape(t.name) + '</option>'; }).join('');
  var subjectOpts = _ttAllSubjects().map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  openModal(
    '<h3><i class="fas fa-plus"></i> Add Timetable Entry</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Class</label><select id="fTTClass">' + classOpts + '</select></div>' +
    '<div class="form-group"><label>Day</label><select id="fTTDay">' + dayOpts + '</select></div>' +
    '<div class="form-group"><label>Period</label><select id="fTTPeriod">' + periodOpts + '</select></div>' +
    '<div class="form-group"><label>Subject</label><select id="fTTSubject">' + subjectOpts + '</select></div>' +
    '<div class="form-group"><label>Teacher</label><select id="fTTTeacher">' + teacherOpts + '</select></div>' +
    '<div class="form-group"><label>Room</label><select id="fTTRoom"><option value="">None</option>' + _ttRooms().map(function(r) { return '<option value="' + r.id + '">' + htmlEscape(r.name) + '</option>'; }).join('') + '</select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="saveTimetable()"><i class="fas fa-save"></i> Save</button></div>'
  );
}

function saveTimetable() {
  var cls = document.getElementById('fTTClass')?.value || '';
  var day = document.getElementById('fTTDay')?.value || '';
  var period = document.getElementById('fTTPeriod')?.value || '';
  var subject = document.getElementById('fTTSubject')?.value || '';
  var teacher = document.getElementById('fTTTeacher')?.value || '';
  var roomId = document.getElementById('fTTRoom')?.value || '';
  if (!cls || !day || !period) { toast('Please fill all required fields', 'error'); return; }
  if (data.timetables.find(function(t) { return t.class === cls && t.day === day && t.period === period; })) {
    toast('This class already has a lesson at this time slot', 'error');
    return;
  }
  data.timetables.push({ id: genId('TT'), class: cls, day: day, period: period, subject: subject, teacher: teacher, roomId: roomId });
  saveData();
  logActivity('Added timetable: ' + subject + ' for ' + cls + ' on ' + day + ' ' + period);
  closeModal();
  renderTimetableAdmin();
  toast('Timetable entry added');
}

function deleteTimetableEntry(id) {
  if (!confirm('Delete this timetable entry?')) return;
  data.timetables = data.timetables.filter(function(t) { return t.id !== id; });
  saveData();
  renderTimetableAdmin();
  toast('Timetable entry deleted');
}

// ===== TIMETABLE DRAG-AND-DROP =====
var _ttDragEntryId = null;

function ttDragStart(id, cls) {
  _ttDragEntryId = id;
  _ttDragEntryClass = cls;
}

function ttDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('tt-drag-over');
}

function ttDragLeave(e) {
  e.currentTarget.classList.remove('tt-drag-over');
}

function ttDrop(e, day, period) {
  e.preventDefault();
  e.currentTarget.classList.remove('tt-drag-over');
  var srcId = _ttDragEntryId;
  _ttDragEntryId = null;
  if (!srcId) return;
  var src = data.timetables.find(function(t) { return t.id === srcId; });
  if (!src) return;
  var target = data.timetables.find(function(t) { return t.day === day && t.period === period && t.class === src.class && t.id !== srcId; });
  if (target) {
    var oldDay = src.day, oldPeriod = src.period;
    var occupied = data.timetables.find(function(t) { return t.day === oldDay && t.period === oldPeriod && t.class === src.class && t.id !== srcId && t.id !== target.id; });
    if (occupied) {
      toast('Cannot swap: target slot already occupied', 'error');
      return;
    }
    target.day = oldDay;
    target.period = oldPeriod;
    src.day = day;
    src.period = period;
    saveData();
    renderTimetableAdmin();
    toast('Timetable entries swapped');
  } else {
    src.day = day;
    src.period = period;
    saveData();
    renderTimetableAdmin();
    toast('Timetable entry moved');
  }
}

// ===== TIMETABLE EDIT MODAL =====
function showEditTimetableModal(id) {
  var entry = data.timetables.find(function(t) { return t.id === id; });
  if (!entry) return;
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var dayOpts = days.map(function(d) { return '<option value="' + d + '"' + (d === entry.day ? ' selected' : '') + '>' + d + '</option>'; }).join('');
  var periodOpts = periods.map(function(p) { return '<option value="' + p + '"' + (p === entry.period ? ' selected' : '') + '>' + p + '</option>'; }).join('');
  var classOpts = [...new Set(data.students.map(function(s) { return s.class; }))].map(function(c) { return '<option value="' + htmlEscape(c) + '"' + (c === entry.class ? ' selected' : '') + '>' + htmlEscape(c) + '</option>'; }).join('');
  var teacherOpts = data.teachers.map(function(t) { return '<option value="' + htmlEscape(t.name) + '"' + (t.name === entry.teacher ? ' selected' : '') + '>' + htmlEscape(t.name) + '</option>'; }).join('');
  var subjectOpts = _ttAllSubjects().map(function(s) { return '<option value="' + s + '"' + (s === entry.subject ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  var roomOpts = '<option value="">None</option>' + _ttRooms().map(function(r) { return '<option value="' + r.id + '"' + (r.id === entry.roomId ? ' selected' : '') + '>' + htmlEscape(r.name) + '</option>'; }).join('');
  openModal(
    '<h3><i class="fas fa-edit"></i> Edit Timetable Entry</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Class</label><select id="fTTEditClass">' + classOpts + '</select></div>' +
    '<div class="form-group"><label>Day</label><select id="fTTEditDay">' + dayOpts + '</select></div>' +
    '<div class="form-group"><label>Period</label><select id="fTTEditPeriod">' + periodOpts + '</select></div>' +
    '<div class="form-group"><label>Subject</label><select id="fTTEditSubject">' + subjectOpts + '</select></div>' +
    '<div class="form-group"><label>Teacher</label><select id="fTTEditTeacher">' + teacherOpts + '</select></div>' +
    '<div class="form-group"><label>Room</label><select id="fTTEditRoom">' + roomOpts + '</select></div>' +
    '</div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-sm" style="background:#e53e3e;color:white;" onclick="if(confirm(\'Delete this timetable entry?\')){data.timetables=data.timetables.filter(function(t){return t.id!==\'' + id + '\'});saveData();closeModal();renderTimetableAdmin();toast(\'Timetable entry deleted\');}"><i class="fas fa-trash"></i> Delete</button>' +
    '<div style="flex:1;"></div>' +
    '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="updateTimetable(\'' + id + '\')"><i class="fas fa-save"></i> Update</button></div>'
  );
}

function updateTimetable(id) {
  var entry = data.timetables.find(function(t) { return t.id === id; });
  if (!entry) return;
  var cls = document.getElementById('fTTEditClass')?.value;
  var day = document.getElementById('fTTEditDay')?.value;
  var period = document.getElementById('fTTEditPeriod')?.value;
  var subject = document.getElementById('fTTEditSubject')?.value;
  var teacher = document.getElementById('fTTEditTeacher')?.value;
  var roomId = document.getElementById('fTTEditRoom')?.value || '';
  if (!cls || !day || !period || !subject || !teacher) { toast('Please fill all required fields', 'error'); return; }
  var conflict = data.timetables.find(function(t) { return t.id !== id && t.class === cls && t.day === day && t.period === period; });
  if (conflict) { toast('This slot is already occupied for this class', 'error'); return; }
  entry.class = cls;
  entry.day = day;
  entry.period = period;
  entry.subject = subject;
  entry.teacher = teacher;
  entry.roomId = roomId;
  saveData();
  logActivity('Updated timetable: ' + entry.subject + ' for ' + cls);
  closeModal();
  renderTimetableAdmin();
  toast('Timetable entry updated');
}

function switchTimetableTab(tab) {
  document.querySelectorAll('.tt-tab').forEach(function(el) { el.classList.remove('active'); });
  var activeBtn = document.querySelector('.tt-tab[data-tttab="' + tab + '"]');
  if (activeBtn) activeBtn.classList.add('active');
  var views = ['timetableView', 'timetableSettingsView', 'roomManagerView', 'teacherSubjectsView'];
  views.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  var showId = tab === 'grid' ? 'timetableView' : tab === 'settings' ? 'timetableSettingsView' : tab === 'rooms' ? 'roomManagerView' : 'teacherSubjectsView';
  var el = document.getElementById(showId); if (el) el.style.display = '';
  if (tab === 'grid' && typeof renderTimetableAdmin === 'function') renderTimetableAdmin();
  else if (tab === 'settings' && typeof renderTimetableSettings === 'function') renderTimetableSettings();
  else if (tab === 'rooms' && typeof renderRoomManager === 'function') renderRoomManager();
  else if (tab === 'subjects' && typeof renderTeacherSubjects === 'function') renderTeacherSubjects();
}

function printTimetable() {
  var ttContainer = document.getElementById('timetableView');
  if (!ttContainer) { toast('Timetable view not found', 'error'); return; }
  var entries = data.timetables || [];
  if (!entries.length) { toast('No timetable entries to export.', 'error'); return; }
  var selectedClass = document.getElementById('ttClassFilter')?.value || '';
  var classes = selectedClass ? [selectedClass] : [];
  if (!classes.length) {
    var allClasses = {};
    entries.forEach(function(e) { allClasses[e.class] = true; });
    classes = Object.keys(allClasses).sort();
  }
  var days = _TT_DAYS;
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var rooms = _ttRooms();
  var roomMap = {};
  rooms.forEach(function(r) { roomMap[r.id] = r.name; });
  var schoolName = data.nigeriaSchoolName || 'School Name';
  var termInfo = (data.terms && data.terms.length) ? data.terms[data.terms.length - 1] : null;
  var dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  var win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) { toast('Please allow pop-ups for exporting PDF', 'error'); return; }
  win.document.write('<!DOCTYPE html><html><head><title>Timetable - ' + schoolName + '</title>');
  win.document.write('<style>' +
    'body{font-family:Arial,sans-serif;padding:30px;color:#1a202c;margin:0;}' +
    '.header{text-align:center;margin-bottom:20px;}' +
    '.header h1{font-size:22px;margin:0 0 4px;}' +
    '.header p{font-size:13px;color:#718096;margin:0;}' +
    'table{width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;}' +
    'th{background:#1a202c;color:white;padding:10px 8px;text-align:center;font-size:13px;}' +
    'td{padding:8px;border:1px solid #e2e8f0;vertical-align:top;text-align:center;}' +
    '.period-label{font-weight:700;color:#2d3748;font-size:12px;white-space:nowrap;}' +
    '.break-row{background:#fefcbf;}' +
    '.break-cell{background:#fefcbf;color:#975a16;font-style:italic;font-size:12px;}' +
    '.entry-subj{font-weight:700;color:#2b6cb0;font-size:13px;}' +
    '.entry-teacher{font-size:11px;color:#718096;margin-top:2px;}' +
    '.entry-room{font-size:11px;color:#718096;}' +
    '.footer{text-align:center;margin-top:20px;font-size:11px;color:#a0aec0;padding-bottom:20px;}' +
    '.class-divider{page-break-after:always;}' +
    '@media print{body{padding:15px;}}' +
    '</style></head><body>');

  classes.forEach(function(cls, ci) {
    var clsEntries = entries.filter(function(e) { return e.class === cls; });
    win.document.write('<div class="header">' +
      '<h1>' + htmlEscape(schoolName) + '</h1>' +
      '<p>' + htmlEscape(cls) + ' — Timetable</p>' +
      '<p style="font-size:12px;color:#a0aec0;">Generated: ' + dateStr + '</p></div>');
    win.document.write('<table><thead><tr><th style="min-width:70px;">Period</th>');
    days.forEach(function(d) { win.document.write('<th>' + htmlEscape(d) + '</th>'); });
    win.document.write('</tr></thead><tbody>');
    periods.forEach(function(p, pi) {
      var isBreak = breaks.indexOf(pi) !== -1;
      win.document.write('<tr' + (isBreak ? ' class="break-row"' : '') + '>');
      win.document.write('<td class="period-label' + (isBreak ? ' break-cell' : '') + '">' + htmlEscape(p) + '</td>');
      days.forEach(function(d) {
        if (isBreak) {
          win.document.write('<td class="break-cell">&#9749; Break</td>');
        } else {
          var cellEntries = clsEntries.filter(function(e) { return e.day === d && e.period === p; });
          if (cellEntries.length) {
            var cellHtml = '';
            cellEntries.forEach(function(e) {
              cellHtml += '<div class="entry-subj">' + htmlEscape(e.subject || 'Subject') + '</div>' +
                '<div class="entry-teacher">' + htmlEscape(e.teacher || '') + '</div>' +
                (e.room ? '<div class="entry-room">' + htmlEscape(roomMap[e.room] || e.room) + '</div>' : '');
            });
            win.document.write('<td>' + cellHtml + '</td>');
          } else {
            win.document.write('<td></td>');
          }
        }
      });
      win.document.write('</tr>');
    });
    win.document.write('</tbody></table>');
    win.document.write('<div class="footer">' + dateStr + ' &bull; ' + htmlEscape(schoolName) + '</div>');
    if (ci < classes.length - 1) win.document.write('<div class="class-divider"></div>');
  });

  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 500);
}
