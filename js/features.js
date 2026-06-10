// EDUVERSE - New Features Module
// Timetable, Gradebook, Messaging, Exam Scheduling, Parent Portal

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
        html += '<div class="timetable-cell" style="background:#fefcbf;text-align:center;font-size:12px;color:#744210;"><i class="fas fa-coffee"></i> Break</div>';
      } else if (entry) {
        // Check if this entry has a conflict
        var hasConflict = conflicts.some(function(c) { return c.entryId === entry.id; });
        var style = hasConflict ? 'border:2px solid #e53e3e;background:#fff5f5;' : '';
        var room = entry.roomId ? _ttRooms().find(function(r) { return r.id === entry.roomId; }) : null;
        html += '<div class="timetable-cell" style="' + style + '">' +
          '<div class="subject">' + htmlEscape(entry.subject) + '</div>' +
          '<div class="teacher-name">' + htmlEscape(entry.teacher) + '</div>' +
          '<div style="font-size:11px;color:var(--text-light);">' + htmlEscape(entry.class) + '</div>' +
          (room ? '<div style="font-size:10px;color:#805ad5;">' + htmlEscape(room.name) + '</div>' : '') +
          '<div style="margin-top:4px;"><button class="btn btn-sm btn-outline" style="padding:2px 6px;font-size:10px;color:#e53e3e;" onclick="deleteTimetableEntry(\'' + entry.id + '\')"><i class="fas fa-times"></i></button></div></div>';
      } else {
        html += '<div class="timetable-cell" style="color:var(--text-light);font-size:12px;cursor:pointer;" onclick="quickAddTimetable(\'' + d + '\',\'' + p + '\')">+</div>';
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
  var usedSlots = {}; // key: "day|period" -> { class, teacherId, roomId }

  // Track current assignments per class to distribute periods
  var classSubjectCounts = {};

  classes.forEach(function(cls) {
    classSubjectCounts[cls] = {};
    // Determine which subjects this class needs (all subjects that have a teacher assigned)
    allSubjects.forEach(function(subj) {
      var hasTeacher = ts.some(function(t) {
        var teacher = getTeacher(t.teacherId);
        if (!teacher) return false;
        // Teacher must exist and either has no assignedClass or matches
        return t.subject === subj;
      });
      if (hasTeacher) classSubjectCounts[cls][subj] = subjectsPerWeek;
    });
  });

  if (progress) progress.innerHTML = '<p style="font-size:13px;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Scheduling...</p>';

  // Shuffle arrays for pseudo-random distribution
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

    // Try to schedule each subject the required number of times
    subjectList.forEach(function(subject) {
      var count = clsSubjects[subject];
      for (var c = 0; c < count; c++) {
        if (!subjectList.length) break;

        var scheduled_this_subject = false;
        var slotAttempts = 0;

        // Try all day/period combinations randomly
        var shuffledDays = shuffle(days);
        for (var di = 0; di < shuffledDays.length && !scheduled_this_subject; di++) {
          var day = shuffledDays[di];
          var shuffledPeriods = shuffle(periods);
          for (var pi = 0; pi < shuffledPeriods.length && !scheduled_this_subject; pi++) {
            var period = shuffledPeriods[pi];
            slotAttempts++;

            // Skip breaks
            var periodIdx = periods.indexOf(period);
            if (breaks.indexOf(periodIdx) !== -1) continue;

            // Skip if this class already has something at this slot
            if (data.timetables.some(function(t) { return t.class === cls && t.day === day && t.period === period; })) continue;
            if (scheduled.some(function(t) { return t.class === cls && t.day === day && t.period === period; })) continue;

            // Find a teacher for this subject
            var teacherEntries = ts.filter(function(t) { return t.subject === subject; });
            var availableTeacher = null;
            var teacherId = null;

            for (var ti = 0; ti < teacherEntries.length; ti++) {
              var te = teacherEntries[ti];
              var teacher = getTeacher(te.teacherId);
              if (!teacher) continue;

              // Check if teacher is free at this slot
              var teacherBusy = data.timetables.some(function(t) { return t.teacher === teacher.name && t.day === day && t.period === period; });
              if (teacherBusy) continue;

              // Check if we already scheduled this teacher at this slot
              var pendingBusy = scheduled.some(function(t) { var tc = getTeacher(t.teacherId); return tc && tc.name === teacher.name && t.day === day && t.period === period; });
              if (pendingBusy) continue;

              availableTeacher = teacher;
              teacherId = te.teacherId;
              break;
            }

            if (!availableTeacher && teacherEntries.length > 0) continue;
            if (!availableTeacher) continue;

            // Find an available room
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

  // Add all scheduled entries to data
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
      // Same day + period
      if (e1.day !== e2.day || e1.period !== e2.period) return;

      // 1. Teacher double-booked
      if (e1.teacher && e2.teacher && e1.teacher === e2.teacher) {
        conflicts.push({
          entryId: e1.id,
          type: 'teacher',
          day: e1.day,
          period: e1.period,
          description: 'Teacher "' + e1.teacher + '" double-booked: ' + e1.class + ' and ' + e2.class
        });
      }

      // 2. Room double-booked
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

      // 3. Class double-booked
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
function showParentLogin() {
  var lp = document.getElementById('landing-page'); if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var plp = document.getElementById('parentLoginPage'); if (plp) plp.classList.add('active');
}

function parentLogin() {
  const email = (document.getElementById('parentLoginEmail')?.value ?? '').trim();
  const pass = (document.getElementById('parentLoginPass')?.value ?? '').trim();
  const parent = data.parents.find(p => p.email === email && p.password === pass);
  if (!parent) {
    toast('Invalid email or password', 'error');
    return;
  }
  currentParent = parent;
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var pp = document.getElementById('parentPage'); if (pp) pp.classList.add('active');
  renderParentPortal();
  if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function parentLogout() {
  currentParent = null;
  var ple = document.getElementById('parentLoginEmail'); if (ple) ple.value = '';
  var plp = document.getElementById('parentLoginPass'); if (plp) plp.value = '';
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var plg = document.getElementById('parentLoginPage'); if (plg) plg.classList.add('active');
}

let currentParent = null;

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
}

// ===== ACADEMIC CALENDAR =====
function getCalendarEvents() { return data.academicCalendar || []; }

function renderAcademicCalendar() {
  var container = document.getElementById('academicCalendarView');
  if (!container) return;
  var events = getCalendarEvents().sort(function(a, b) { return a.date.localeCompare(b.date); });
  var html = '<div style="margin-bottom:12px;"><button class="btn btn-primary btn-sm" onclick="showAddCalendarEventModal()"><i class="fas fa-plus"></i> Add Event</button></div>';
  if (!events.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-calendar"></i><p>No calendar events yet</p></div>';
    return;
  }
  html += '<div class="table-responsive"><table><thead><tr><th>Date</th><th>Event</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
  var typeLabels = { academic: 'Academic', sports: 'Sports', holiday: 'Holiday', meeting: 'Meeting', other: 'Other' };
  var typeColors = { academic: '#bee3f8', sports: '#fefcbf', holiday: '#c6f6d5', meeting: '#e9d8fd', other: '#e2e8f0' };
  events.forEach(function(e) {
    var label = typeLabels[e.type] || e.type;
    var color = typeColors[e.type] || '#e2e8f0';
    html += '<tr><td style="font-weight:600;">' + htmlEscape(e.date) + '</td><td><strong>' + htmlEscape(e.title) + '</strong></td><td><span class="badge" style="background:' + color + ';color:#2d3748;">' + htmlEscape(label) + '</span></td><td>' + htmlEscape(e.description || '') + '</td><td><button class="btn btn-sm btn-primary" onclick="showEditCalendarEventModal(\'' + e.id + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteCalendarEvent(\'' + e.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function showAddCalendarEventModal() {
  openModal('<h3><i class="fas fa-plus-circle"></i> Add Calendar Event</h3><div class="form-grid"><div class="form-group"><label>Event Title</label><input type="text" id="fCalTitle" placeholder="e.g. Sports Day"></div><div class="form-group"><label>Date</label><input type="date" id="fCalDate"></div><div class="form-group"><label>Type</label><select id="fCalType"><option value="academic">Academic</option><option value="sports">Sports</option><option value="holiday">Holiday</option><option value="meeting">Meeting</option><option value="other">Other</option></select></div><div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fCalDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Event details..."></textarea></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCalendarEvent()"><i class="fas fa-save"></i> Save</button></div>');
}

function saveCalendarEvent() {
  var title = document.getElementById('fCalTitle')?.value?.trim();
  var date = document.getElementById('fCalDate')?.value;
  var type = document.getElementById('fCalType')?.value || 'other';
  var desc = document.getElementById('fCalDesc')?.value?.trim() || '';
  if (!title || !date) { toast('Please enter title and date', 'error'); return; }
  if (!data.academicCalendar) data.academicCalendar = [];
  data.academicCalendar.push({ id: genId('CAL'), title: title, date: date, type: type, description: desc });
  saveData();
  logActivity('Added calendar event: ' + title);
  closeModal();
  renderAcademicCalendar();
  toast('Event added');
}

function showEditCalendarEventModal(id) {
  var e = (data.academicCalendar || []).find(function(ev) { return ev.id === id; });
  if (!e) return;
  openModal('<h3><i class="fas fa-edit"></i> Edit Calendar Event</h3><div class="form-grid"><div class="form-group"><label>Event Title</label><input type="text" id="fCalTitle" value="' + htmlEscape(e.title) + '"></div><div class="form-group"><label>Date</label><input type="date" id="fCalDate" value="' + htmlEscape(e.date) + '"></div><div class="form-group"><label>Type</label><select id="fCalType"><option value="academic"' + (e.type === 'academic' ? ' selected' : '') + '>Academic</option><option value="sports"' + (e.type === 'sports' ? ' selected' : '') + '>Sports</option><option value="holiday"' + (e.type === 'holiday' ? ' selected' : '') + '>Holiday</option><option value="meeting"' + (e.type === 'meeting' ? ' selected' : '') + '>Meeting</option><option value="other"' + (e.type === 'other' ? ' selected' : '') + '>Other</option></select></div><div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fCalDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;">' + htmlEscape(e.description || '') + '</textarea></div></div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateCalendarEvent(\'' + id + '\')"><i class="fas fa-save"></i> Update</button></div>');
}

function updateCalendarEvent(id) {
  var e = (data.academicCalendar || []).find(function(ev) { return ev.id === id; });
  if (!e) return;
  e.title = document.getElementById('fCalTitle')?.value?.trim() || e.title;
  e.date = document.getElementById('fCalDate')?.value || e.date;
  e.type = document.getElementById('fCalType')?.value || e.type;
  e.description = document.getElementById('fCalDesc')?.value?.trim() || '';
  saveData();
  logActivity('Updated calendar event: ' + e.title);
  closeModal();
  renderAcademicCalendar();
  toast('Event updated');
}

function deleteCalendarEvent(id) {
  if (!confirm('Delete this event?')) return;
  data.academicCalendar = (data.academicCalendar || []).filter(function(e) { return e.id !== id; });
  saveData();
  renderAcademicCalendar();
  toast('Event deleted');
}

function renderAcademicCalendarView(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var events = getCalendarEvents().sort(function(a, b) { return a.date.localeCompare(b.date); });
  // Separate upcoming and past
  var today = new Date().toISOString().split('T')[0];
  var upcoming = events.filter(function(e) { return e.date >= today; });
  var past = events.filter(function(e) { return e.date < today; });
  var typeLabels = { academic: 'Academic', sports: 'Sports', holiday: 'Holiday', meeting: 'Meeting', other: 'Other' };
  var typeColors = { academic: '#bee3f8', sports: '#fefcbf', holiday: '#c6f6d5', meeting: '#e9d8fd', other: '#e2e8f0' };
  if (!events.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No academic calendar events</p></div>';
    return;
  }
  var html = '';
  // Upcoming events
  if (upcoming.length) {
    html += '<h4 style="margin-bottom:8px;color:var(--success);"><i class="fas fa-arrow-up"></i> Upcoming Events</h4><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">';
    upcoming.forEach(function(e) {
      var label = typeLabels[e.type] || e.type;
      var color = typeColors[e.type] || '#e2e8f0';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--card-bg);border:1px solid #e2e8f0;border-radius:8px;"><div style="text-align:center;min-width:50px;"><div style="font-size:18px;font-weight:800;color:var(--primary);">' + new Date(e.date).getDate() + '</div><div style="font-size:11px;color:var(--text-light);text-transform:uppercase;">' + new Date(e.date).toLocaleString('default', { month: 'short' }) + '</div></div><div style="flex:1;"><div style="font-weight:600;">' + htmlEscape(e.title) + '</div><div style="font-size:13px;color:var(--text-light);">' + htmlEscape(e.description || '') + '</div></div><span class="badge" style="background:' + color + ';color:#2d3748;">' + htmlEscape(label) + '</span></div>';
    });
    html += '</div>';
  }
  // Past events (collapsible)
  if (past.length) {
    html += '<details><summary style="cursor:pointer;font-weight:600;color:var(--text-light);"><i class="fas fa-history"></i> Past Events (' + past.length + ')</summary><div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;">';
    past.forEach(function(e) {
      var label = typeLabels[e.type] || e.type;
      var color = typeColors[e.type] || '#e2e8f0';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--card-bg);border:1px solid #e2e8f0;border-radius:8px;opacity:0.7;"><div style="text-align:center;min-width:50px;"><div style="font-size:18px;font-weight:800;color:var(--text-light);">' + new Date(e.date).getDate() + '</div><div style="font-size:11px;color:var(--text-light);text-transform:uppercase;">' + new Date(e.date).toLocaleString('default', { month: 'short' }) + '</div></div><div style="flex:1;"><div style="font-weight:600;">' + htmlEscape(e.title) + '</div><div style="font-size:13px;color:var(--text-light);">' + htmlEscape(e.description || '') + '</div></div><span class="badge" style="background:' + color + ';color:#2d3748;">' + htmlEscape(label) + '</span></div>';
    });
    html += '</div></details>';
  }
  container.innerHTML = html;
}

function viewChildDetails(studentId) {
  const s = data.students.find(st => st.id === studentId);
  if (!s) return;
  const results = data.results.filter(r => r.studentId === studentId);
  const fees = data.fees.filter(f => f.studentId === studentId);
  const att = data.attendance.filter(a => a.studentId === studentId);
  const cat = data.cat.filter(c => c.studentId === studentId);
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0);
  const avgScore = results.length ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 'N/A';
  const presentCount = att.filter(a => a.status === 'present').length;

  openModal(`
    <h3><i class="fas fa-user-graduate"></i> ${htmlEscape(s.name)} - Full Report</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--primary);">${results.length}</div>
        <div style="font-size:13px;color:var(--text-light);">Subjects Taken</div>
      </div>
      <div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--success);">${avgScore}</div>
        <div style="font-size:13px;color:var(--text-light);">Average Score</div>
      </div>
      <div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--accent);">$${totalPaid}/$${totalFees}</div>
        <div style="font-size:13px;color:var(--text-light);">Fees Paid</div>
      </div>
      <div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:var(--info);">${presentCount}/${att.length}</div>
        <div style="font-size:13px;color:var(--text-light);">Attendance</div>
      </div>
    </div>
    ${results.length ? `
    <h5 style="font-weight:600;margin-bottom:8px;">Recent Results</h5>
    <div class="table-responsive"><table><thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead><tbody>
      ${results.slice(-5).map(r => `<tr><td>${htmlEscape(r.subject)}</td><td><strong>${r.score}</strong></td><td><span class="badge" style="background:${r.score>=80?'#c6f6d5':r.score>=60?'#fefcbf':'#fed7d7'};color:${r.score>=80?'#22543d':r.score>=60?'#744210':'#9b2c2c'}">${r.grade}</span></td></tr>`).join('')}
    </tbody></table></div>` : ''}
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Close</button>
    </div>
  `);
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
  if (level >= 5) return 'Graduated';
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

// ===== PREDICTIVE ANALYTICS — RISK DETECTION ENGINE =====
function computeStudentRiskProfile(studentId) {
  var s = (data.students || []).find(function(x) { return x.id === studentId; });
  if (!s) return null;

  // 1. Academic Performance (40%)
  var sResults = (data.results || []).filter(function(r) { return r.studentId === studentId; });
  var academicAvg = 0;
  var trend = 'Stable';
  if (sResults.length) {
    academicAvg = Math.round(sResults.reduce(function(sum, r) { return sum + r.score; }, 0) / sResults.length);
    // Trend: group by term, compare averages
    var byTerm = {};
    sResults.forEach(function(r) {
      if (!byTerm[r.term]) byTerm[r.term] = [];
      byTerm[r.term].push(r.score);
    });
    var termAvgs = Object.keys(byTerm).sort().map(function(t) {
      var scores = byTerm[t];
      return Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);
    });
    if (termAvgs.length >= 2) {
      var firstHalf = termAvgs.slice(0, Math.ceil(termAvgs.length / 2));
      var secondHalf = termAvgs.slice(Math.ceil(termAvgs.length / 2));
      var firstAvg = Math.round(firstHalf.reduce(function(a, b) { return a + b; }, 0) / firstHalf.length);
      var secondAvg = Math.round(secondHalf.reduce(function(a, b) { return a + b; }, 0) / secondHalf.length);
      var diff = secondAvg - firstAvg;
      if (diff > 5) trend = 'Improving';
      else if (diff < -5) trend = 'Declining';
      else trend = 'Stable';
    }
  }
  var academicRisk = Math.max(0, Math.min(100, 100 - academicAvg));

  // 2. Attendance Risk (25%)
  var sAttendance = (data.attendance || []).filter(function(a) { return a.studentId === studentId; });
  var attendanceRisk = 0;
  if (sAttendance.length) {
    var absentCount = sAttendance.filter(function(a) { return a.status === 'absent'; }).length;
    attendanceRisk = Math.round((absentCount / sAttendance.length) * 100);
  }

  // 3. Behavior Risk (20%)
  var sBehavior = (data.behaviorLog || []).filter(function(b) { return b.studentId === studentId; });
  var behaviorRisk = 0;
  if (sBehavior.length) {
    var negativeCount = sBehavior.filter(function(b) { return b.type === 'negative'; }).length;
    behaviorRisk = Math.round((negativeCount / sBehavior.length) * 100);
  }

  // 4. CAT Assessment Risk (15%)
  var sCat = (data.cat || []).filter(function(c) { return c.studentId === studentId; });
  var catRisk = 0;
  if (sCat.length) {
    var catTotal = 0;
    var catCount = 0;
    sCat.forEach(function(c) {
      var avg = (c.test1 + c.test2 + c.test3) / 3;
      catTotal += avg;
      catCount++;
    });
    var catAvgScore = catCount ? Math.round((catTotal / catCount) / 20 * 100) : 0;
    catRisk = Math.max(0, Math.min(100, 100 - catAvgScore));
  }

  // Weighted overall risk
  var overallRisk = Math.round(academicRisk * 0.4 + attendanceRisk * 0.25 + behaviorRisk * 0.2 + catRisk * 0.15);
  var riskLevel = overallRisk <= 25 ? 'Low' : overallRisk <= 50 ? 'Medium' : overallRisk <= 75 ? 'High' : 'Critical';

  // Top risk factors
  var factors = [];
  if (academicRisk > 50) factors.push('Low academic performance (' + academicAvg + '%)');
  if (trend === 'Declining') factors.push('Declining grade trend');
  if (attendanceRisk > 30) factors.push('High absenteeism (' + attendanceRisk + '%)');
  if (behaviorRisk > 50) factors.push('Behavioral issues');
  if (catRisk > 50) factors.push('Low continuous assessment scores');
  if (!factors.length) factors.push('No significant risk factors detected');

  return {
    studentId: studentId,
    name: s.name,
    class: s.class,
    academicAvg: academicAvg,
    trend: trend,
    attendanceRisk: attendanceRisk,
    behaviorRisk: behaviorRisk,
    catRisk: catRisk,
    overallRisk: overallRisk,
    riskLevel: riskLevel,
    topFactors: factors.slice(0, 3)
  };
}

function renderPredictiveAnalytics() {
  var container = document.getElementById('predictiveAnalyticsView');
  if (!container) return;
  var students = data.students || [];
  if (!students.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>No student data available for analysis</p></div>';
    return;
  }

  // Compute profiles
  var profiles = students.map(function(s) { return computeStudentRiskProfile(s.id); }).filter(function(p) { return p; });
  var filterClass = document.getElementById('paClassFilter')?.value || 'all';

  var filtered = filterClass === 'all' ? profiles : profiles.filter(function(p) { return p.class === filterClass; });
  var classes = {};
  students.forEach(function(s) { classes[s.class] = true; });
  var classList = Object.keys(classes).sort();

  // Summary counts
  var total = filtered.length;
  var counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  filtered.forEach(function(p) { counts[p.riskLevel]++; });

  // Build HTML
  var html = '';
  // Filters
  html += '<div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:20px;"><div class="form-group" style="margin:0;"><label style="font-size:13px;">Class</label><select id="paClassFilter" onchange="renderPredictiveAnalytics()" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;"><option value="all">All Classes</option>';
  classList.forEach(function(c) {
    html += '<option value="' + htmlEscape(c) + '"' + (c === filterClass ? ' selected' : '') + '>' + htmlEscape(c) + '</option>';
  });
  html += '</select></div></div>';

  // Summary cards
  var cardColors = { Low: '#c6f6d5', Medium: '#fefcbf', High: '#fed7d7', Critical: '#e53e3e' };
  var textColors = { Low: '#22543d', Medium: '#744210', High: '#9b2c2c', Critical: 'white' };
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:24px;">';
  html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:800;">' + total + '</div><div style="font-size:13px;color:var(--text-light);">Total Students</div></div>';
  ['Low', 'Medium', 'High', 'Critical'].forEach(function(level) {
    var color = level === 'Critical' ? '#e53e3e' : cardColors[level];
    var textColor = level === 'Critical' ? 'white' : textColors[level];
    html += '<div style="background:' + color + ';color:' + textColor + ';border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:800;">' + (counts[level] || 0) + '</div><div style="font-size:13px;opacity:0.8;">' + level + ' Risk</div></div>';
  });
  html += '</div>';

  if (!filtered.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-robot"></i><p>No students match the selected filter</p></div>';
    return;
  }

  // Risk table
  html += '<div class="table-responsive"><table><thead><tr><th>Student</th><th>Class</th><th>Avg Score</th><th>Trend</th><th>Risk Score</th><th>Risk Level</th><th>Key Factors</th><th>Action</th></tr></thead><tbody>';
  // Sort by risk desc
  filtered.sort(function(a, b) { return b.overallRisk - a.overallRisk; });
  filtered.forEach(function(p) {
    var levelColor = p.riskLevel === 'Critical' ? '#e53e3e' : cardColors[p.riskLevel];
    var levelTextColor = p.riskLevel === 'Critical' ? 'white' : textColors[p.riskLevel];
    var trendIcon = p.trend === 'Improving' ? '<i class="fas fa-arrow-up" style="color:#38a169;"></i>' : p.trend === 'Declining' ? '<i class="fas fa-arrow-down" style="color:#e53e3e;"></i>' : '<i class="fas fa-minus" style="color:#a0aec0;"></i>';
    html += '<tr><td><strong>' + htmlEscape(p.name) + '</strong></td><td>' + htmlEscape(p.class) + '</td><td>' + p.academicAvg + '%</td><td>' + trendIcon + ' ' + p.trend + '</td><td><strong>' + p.overallRisk + '</strong></td><td><span class="badge" style="background:' + levelColor + ';color:' + levelTextColor + ';padding:4px 10px;">' + p.riskLevel + '</span></td><td style="max-width:200px;font-size:13px;">' + htmlEscape(p.topFactors.join('; ')) + '</td><td><button class="btn btn-sm btn-primary" onclick="showRiskDetail(\'' + p.studentId + '\')"><i class="fas fa-chart-bar"></i> Analyze</button></td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function showRiskDetail(studentId) {
  var p = computeStudentRiskProfile(studentId);
  if (!p) return;
  var s = (data.students || []).find(function(x) { return x.id === studentId; });
  var levelColor = p.riskLevel === 'Critical' ? '#e53e3e' : p.riskLevel === 'High' ? '#fed7d7' : p.riskLevel === 'Medium' ? '#fefcbf' : '#c6f6d5';
  var levelTextColor = p.riskLevel === 'Critical' ? 'white' : p.riskLevel === 'High' ? '#9b2c2c' : p.riskLevel === 'Medium' ? '#744210' : '#22543d';
  var html = '<h3><i class="fas fa-chart-bar"></i> Risk Analysis: ' + htmlEscape(p.name) + '</h3>';
  html += '<p style="color:var(--text-light);margin-bottom:16px;">Class: ' + htmlEscape(p.class) + ' | ID: ' + htmlEscape(p.studentId) + '</p>';

  // Score breakdown bars
  var breakdown = [
    { label: 'Academic (40%)', score: 100 - p.academicAvg, raw: p.academicAvg + '%', color: '#3182ce' },
    { label: 'Attendance (25%)', score: p.attendanceRisk, raw: p.attendanceRisk + '% absent', color: '#dd6b20' },
    { label: 'Behavior (20%)', score: p.behaviorRisk, raw: p.behaviorRisk + '% negative', color: '#805ad5' },
    { label: 'CAT Assessment (15%)', score: p.catRisk, raw: p.catRisk + '% risk', color: '#38a169' }
  ];
  html += '<div style="margin-bottom:16px;">';
  breakdown.forEach(function(b) {
    var barColor = b.score > 50 ? '#e53e3e' : b.score > 25 ? '#dd6b20' : '#38a169';
    html += '<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px;"><span>' + htmlEscape(b.label) + '</span><span>' + htmlEscape(b.raw) + '</span></div><div style="background:#edf2f7;border-radius:4px;height:8px;overflow:hidden;"><div style="height:100%;width:' + b.score + '%;background:' + barColor + ';border-radius:4px;transition:width 0.5s;"></div></div></div>';
  });
  html += '</div>';

  // Overall
  html += '<div style="background:' + levelColor + ';color:' + levelTextColor + ';padding:16px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;"><div><strong>Overall Risk Score: ' + p.overallRisk + ' — ' + p.riskLevel + '</strong><br><span style="font-size:13px;">Trend: ' + p.trend + '</span></div><div style="font-size:36px;">' + (p.riskLevel === 'Critical' ? '🔴' : p.riskLevel === 'High' ? '🟠' : p.riskLevel === 'Medium' ? '🟡' : '🟢') + '</div></div>';

  // Top factors
  html += '<h4 style="margin-bottom:6px;">Key Risk Factors</h4><ul style="margin:0;padding-left:20px;font-size:14px;">';
  p.topFactors.forEach(function(f) {
    html += '<li>' + htmlEscape(f) + '</li>';
  });
  html += '</ul>';

  // Recent results
  var sResults = (data.results || []).filter(function(r) { return r.studentId === studentId; }).sort(function(a, b) { return b.term.localeCompare(a.term); });
  if (sResults.length) {
    html += '<h4 style="margin:16px 0 6px;">Recent Exam Results</h4><div class="table-responsive"><table><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Term</th></tr></thead><tbody>';
    sResults.slice(-5).forEach(function(r) {
      html += '<tr><td>' + htmlEscape(r.subject) + '</td><td>' + r.score + '</td><td>' + htmlEscape(r.grade) + '</td><td>' + htmlEscape(r.term) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }

  html += '<div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Close</button></div>';
  openModal(html);
}

// ===== AI TOOLS — LESSON GENERATOR & SMART FEEDBACK =====
var _aiLessonSubjects = {
  'Mathematics': {
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus', 'Number Theory', 'Matrices', 'Vectors', 'Probability', 'Logarithms'],
    objectives: 'By the end of this lesson, students will be able to understand and apply key concepts, solve related problems with accuracy, and explain the reasoning behind each solution.',
    intro: 'Begin with a real-world problem that connects to the topic. Ask students what they already know and encourage them to share their experiences.',
    activities: 'Work through example problems as a class, then pair students for guided practice. Circulate to provide support where needed.',
    assessment: 'Exit ticket with 3 problems of varying difficulty. Review responses to identify common misconceptions.',
    conclusion: 'Summarize key formulas and steps. Preview how this topic connects to the next lesson.',
    homework: 'Practice problems from the textbook plus one challenge question that extends the concept.',
    materials: 'Whiteboard, markers, graph paper, geometry set, projector, worksheet handouts, online calculator'
  },
  'English': {
    topics: ['Essay Writing', 'Comprehension', 'Grammar', 'Literature Analysis', 'Poetry', 'Vocabulary', 'Speech Writing', 'Summary', 'Letter Writing', 'Debate'],
    objectives: 'By the end of this lesson, students will be able to analyze texts critically, express ideas clearly in writing, and demonstrate command of grammar and vocabulary.',
    intro: 'Display a thought-provoking image or quote related to the lesson theme. Facilitate a brief class discussion.',
    activities: 'Small group text analysis followed by individual writing exercise. Peer review session for constructive feedback.',
    assessment: 'Write a short paragraph applying the skill taught. Check for structure, grammar, and clarity.',
    conclusion: 'Review key literary devices or grammatical rules. Highlight strong examples from student work.',
    homework: 'Read the assigned passage and answer comprehension questions. Write a 200-word reflection.',
    materials: 'Textbook, handouts, dictionary, thesaurus, projector, writing journals, sample essays'
  },
  'Science': {
    topics: ['Ecosystems', 'States of Matter', 'Force and Motion', 'Energy', 'Cells', 'Scientific Method', 'Weather', 'Electricity', 'Human Body', 'Chemical Reactions'],
    objectives: 'By the end of this lesson, students will be able to describe scientific concepts, conduct observations, and draw evidence-based conclusions.',
    intro: 'Demonstrate a quick hands-on experiment or show a short video clip to spark curiosity about the topic.',
    activities: 'Guided inquiry: students predict outcomes, perform experiments, and record observations in their lab notebooks.',
    assessment: 'Lab report submission with hypothesis, procedure, results, and conclusion sections.',
    conclusion: 'Discuss real-world applications. Address any misconceptions revealed during the activity.',
    homework: 'Research a current event related to the topic and write a one-page summary with personal reflection.',
    materials: 'Lab equipment, safety goggles, worksheets, textbook, multimedia projector, science journals'
  },
  'History': {
    topics: ['Ancient Civilizations', 'World Wars', 'Colonialism', 'Independence Movements', 'Cold War', 'Industrial Revolution', 'Nigerian History', 'African Kingdoms', 'Democracy', 'Human Rights'],
    objectives: 'By the end of this lesson, students will be able to analyze historical events, identify cause-and-effect relationships, and evaluate different perspectives.',
    intro: 'Present a historical photograph or document. Ask students what they observe and what questions they have.',
    activities: 'Primary source analysis in groups. Each group presents their findings to the class.',
    assessment: 'Timeline creation with key events and short explanations of significance.',
    conclusion: 'Connect historical events to contemporary issues. Discuss lessons learned.',
    homework: 'Read the assigned chapter and answer critical thinking questions. Prepare for a debate next lesson.',
    materials: 'Textbook, primary source documents, map, projector, timeline template, art supplies'
  },
  'Geography': {
    topics: ['Map Reading', 'Climate Change', 'Population', 'Urbanization', 'Natural Resources', 'Weathering', 'Environmental Conservation', 'Trade Routes', 'Migration', 'Natural Disasters'],
    objectives: 'By the end of this lesson, students will be able to interpret geographical data, explain physical and human processes, and understand interconnections.',
    intro: 'Display a map or satellite image. Ask students to identify features and predict patterns.',
    activities: 'Map analysis exercise followed by group research on a specific region or phenomenon.',
    assessment: 'Labeled diagram or annotated map with explanatory notes.',
    conclusion: 'Review key terms and concepts. Discuss how geography affects daily life.',
    homework: 'Complete the worksheet and find a news article related to today\'s topic.',
    materials: 'Atlases, globes, projector, worksheets, colored pencils, compass, online mapping tools'
  },
  'Physics': {
    topics: ['Newton\'s Laws', 'Waves', 'Optics', 'Thermodynamics', 'Electromagnetism', 'Kinematics', 'Energy Conservation', 'Circuits', 'Nuclear Physics', 'Fluid Mechanics'],
    objectives: 'By the end of this lesson, students will be able to state physical laws, solve quantitative problems, and demonstrate concepts through experiments.',
    intro: 'Demonstrate a surprising physics phenomenon. Ask students to hypothesize the explanation.',
    activities: 'Problem-solving session with step-by-step guidance. Lab station rotation for hands-on exploration.',
    assessment: 'Solve 5 problems of increasing difficulty. Show all work and units.',
    conclusion: 'Review formulas and common mistakes. Connect to real-world engineering applications.',
    homework: 'Problem set from textbook. Extension: design a simple experiment to test a concept.',
    materials: 'Lab apparatus, timers, meters, protractors, calculator, simulation software, textbook'
  },
  'Chemistry': {
    topics: ['Atomic Structure', 'Chemical Bonding', 'Periodic Table', 'Acids and Bases', 'Organic Chemistry', 'Stoichiometry', 'Redox Reactions', 'Electrochemistry', 'Gas Laws', 'Equilibrium'],
    objectives: 'By the end of this lesson, students will be able to write chemical equations, predict reaction outcomes, and perform safe lab procedures.',
    intro: 'Perform a safe but visually engaging demonstration. Ask students to describe what they observe.',
    activities: 'Guided note-taking on new concepts, followed by a lab experiment in small groups.',
    assessment: 'Lab report with balanced equations, observations, and conclusions.',
    conclusion: 'Review key reactions and safety protocols. Preview next topic.',
    homework: 'Complete practice problems and write the chemical equations for the reactions observed.',
    materials: 'Beakers, test tubes, chemicals, safety goggles, lab coats, periodic table, textbook'
  },
  'Biology': {
    topics: ['Cell Structure', 'Genetics', 'Evolution', 'Photosynthesis', 'Respiration', 'Ecology', 'Reproduction', 'Classification', 'Digestive System', 'Immune System'],
    objectives: 'By the end of this lesson, students will be able to label biological structures, explain processes, and understand the interconnectedness of living systems.',
    intro: 'Show a micrograph or diagram. Ask students to identify structures and predict functions.',
    activities: 'Microscope lab for cell observation. Create a concept map showing relationships between systems.',
    assessment: 'Labeled diagram with function descriptions. Short quiz on key terms.',
    conclusion: 'Summarize the main idea. Discuss how this relates to health and the environment.',
    homework: 'Read the chapter and answer review questions. Bring an article about a recent biology discovery.',
    materials: 'Microscopes, slides, specimens, charts, projector, textbook, coloring pages for diagrams'
  },
  'Literature': {
    topics: ['Prose Analysis', 'Drama', 'Poetry', 'Oral Literature', 'Character Study', 'Theme Analysis', 'Literary Devices', 'Plot Structure', 'Setting', 'Point of View'],
    objectives: 'By the end of this lesson, students will be able to identify literary devices, analyze character development, and interpret themes in a text.',
    intro: 'Read a short passage aloud. Ask students to visualize and describe the mood.',
    activities: 'Socratic seminar: small group discussion of key questions. Annotate the text together.',
    assessment: 'Write a paragraph analyzing a character or theme with textual evidence.',
    conclusion: 'Share insightful interpretations. Discuss how the text connects to universal experiences.',
    homework: 'Read the next chapter and note three literary devices with examples.',
    materials: 'Class novel or anthology, highlighters, sticky notes, handouts with discussion questions'
  },
  'Computer Science': {
    topics: ['Programming Basics', 'Algorithms', 'Data Structures', 'Web Development', 'Database', 'Networks', 'Cybersecurity', 'Artificial Intelligence', 'HTML/CSS', 'JavaScript'],
    objectives: 'By the end of this lesson, students will be able to write simple code, understand computational thinking, and debug basic programs.',
    intro: 'Show a cool tech demo or discuss a real-world problem that code solves.',
    activities: 'Live coding demonstration followed by pair programming exercise.',
    assessment: 'Submit a working program that meets the specified requirements.',
    conclusion: 'Review common errors and best practices. Preview next programming concept.',
    homework: 'Complete the coding challenge on the practice platform. Document your approach.',
    materials: 'Computers, IDE, projector, internet access, coding worksheets, textbook'
  },
  'Art': {
    topics: ['Color Theory', 'Drawing', 'Painting', 'Sculpture', 'Art History', 'Patterns', 'Portraiture', 'Landscape', 'Still Life', 'Mixed Media'],
    objectives: 'By the end of this lesson, students will be able to apply artistic techniques, express ideas visually, and critique works of art.',
    intro: 'Display a famous artwork. Discuss the elements and principles visible.',
    activities: 'Guided practice of the technique, then independent creative work.',
    assessment: 'Completed artwork with a written artist statement explaining choices.',
    conclusion: 'Gallery walk: students view each other\'s work and give constructive feedback.',
    homework: 'Sketch 5 thumbnails for the next project. Visit a virtual museum tour.',
    materials: 'Paper, pencils, paints, brushes, clay, reference images, aprons, easels'
  }
};

function generateAILesson(subject, topic, className) {
  var data = _aiLessonSubjects[subject];
  if (!data) {
    return 'Lesson plan generation is currently available for: ' + Object.keys(_aiLessonSubjects).join(', ') + '.';
  }
  var topicLower = topic.toLowerCase();
  var matchedTopic = data.topics.find(function(t) { return t.toLowerCase().indexOf(topicLower) !== -1 || topicLower.indexOf(t.toLowerCase()) !== -1; }) || topic;
  var date = new Date().toLocaleDateString('en-CA');
  var lines = [
    'LESSON PLAN — ' + subject,
    'Topic: ' + matchedTopic,
    'Class: ' + className,
    'Date: ' + date,
    '',
    '=== LESSON OBJECTIVES ===',
    data.objectives,
    '',
    '=== MATERIALS NEEDED ===',
    data.materials,
    '',
    '=== INTRODUCTION (5-7 min) ===',
    data.intro,
    '',
    '=== LESSON DEVELOPMENT (20-25 min) ===',
    'Present the core content on "' + matchedTopic + '" using a structured approach. Use diagrams, examples, and demonstrations to illustrate key points. Encourage questions and check for understanding throughout.',
    '',
    '=== STUDENT ACTIVITIES (15-20 min) ===',
    data.activities,
    '',
    '=== ASSESSMENT (5-10 min) ===',
    data.assessment,
    '',
    '=== CONCLUSION (3-5 min) ===',
    data.conclusion,
    '',
    '=== HOMEWORK ===',
    data.homework,
    '',
    '=== TEACHER REFLECTION ===',
    'What worked well? _________________________________\nWhat needs improvement? ____________________________\nNotes for next lesson: _____________________________'
  ];
  return lines.join('\n');
}

function generateSmartFeedback(score, studentName, subject, assignmentTitle) {
  var templates = [];
  if (score >= 90) {
    templates = [
      'Excellent work, {name}! Your understanding of {subject} is outstanding. You demonstrated mastery of {assignment} with precise and accurate responses. Keep up the exceptional effort!',
      'Outstanding performance, {name}! Your {subject} submission for {assignment} shows deep comprehension and critical thinking. You are setting a great example for your classmates.',
      'Brilliant work on {assignment}, {name}! You have a strong grasp of {subject} concepts. Challenge yourself with extension problems to continue growing.'
    ];
  } else if (score >= 75) {
    templates = [
      'Good job, {name}! You have a solid understanding of {subject} in {assignment}. To reach the next level, review the areas where you lost marks and practice similar problems.',
      'Well done, {name}! Your work on {assignment} shows good grasp of {subject} concepts. Focus on improving accuracy in calculations and clarity in explanations.',
      'Great effort on {assignment}, {name}! Your {subject} skills are developing well. Try to attempt more challenging problems to strengthen your understanding.'
    ];
  } else if (score >= 60) {
    templates = [
      'Fair effort, {name}. Your {subject} work on {assignment} shows some understanding but needs improvement. Focus on reviewing the foundational concepts and practice regularly.',
      '{name}, your submission for {assignment} indicates you understand some parts of {subject} but need to work on others. Create a study schedule to address the gaps.',
      'Keep working hard, {name}! Your {assignment} results in {subject} show potential. I recommend reviewing the lesson notes and attempting extra practice questions.'
    ];
  } else if (score >= 40) {
    templates = [
      '{name}, your {subject} result for {assignment} needs significant improvement. Please attend extra tutorial sessions and complete additional practice exercises. I am available to help during office hours.',
      'This score in {subject} ({assignment}) is below expectations, {name}. Let\'s work together to identify the challenges and create a plan for improvement. Please see me after class.',
      '{name}, you are encouraged to re-attempt {assignment} after reviewing the material. Focus on understanding the basics of {subject} before moving to advanced topics.'
    ];
  } else {
    templates = [
      '{name}, your performance on {assignment} in {subject} is a concern. It is important to seek immediate help. Please schedule a meeting with me to discuss a recovery plan.',
      'Urgent attention needed, {name}. Your {subject} score for {assignment} is very low. Parents will be contacted to discuss a support plan. Please utilize all available resources.',
      '{name}, this result in {assignment} indicates a need for foundational review in {subject}. I will provide additional materials. Let\'s work together to get you back on track.'
    ];
  }
  var template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{name}', studentName).replace('{subject}', subject).replace(/{assignment}/g, assignmentTitle || 'the assignment');
}

function renderAITools() {
  var container = document.getElementById('aiToolsView');
  if (!container) return;
  var subjects = Object.keys(_aiLessonSubjects);
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">';

  // Left: Lesson Generator
  html += '<div class="card" style="padding:20px;"><h3 style="margin-bottom:16px;"><i class="fas fa-robot"></i> AI Lesson Plan Generator</h3>';
  html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:16px;">Generate a structured lesson plan for any subject and topic using AI-powered templates.</p>';
  html += '<div class="form-grid"><div class="form-group"><label>Subject</label><select id="aiLsnSubject" onchange="updateAITopics()" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
  subjects.forEach(function(s) { html += '<option value="' + htmlEscape(s) + '">' + htmlEscape(s) + '</option>'; });
  html += '</select></div><div class="form-group"><label>Topic</label><select id="aiLsnTopic" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;"></select></div>';
  html += '<div class="form-group"><label>Class</label><input type="text" id="aiLsnClass" placeholder="e.g. Grade 10A" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" value="' + htmlEscape(currentTeacher ? currentTeacher.assignedClass : '') + '"></div>';
  html += '<div class="form-group" style="grid-column:1/-1;"><button class="btn btn-primary" onclick="generateAndPreviewLesson()"><i class="fas fa-magic"></i> Generate Lesson Plan</button></div></div>';
  html += '<div id="aiLessonPreview" style="margin-top:12px;display:none;"><textarea id="aiLessonOutput" rows="12" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:13px;resize:vertical;width:100%;box-sizing:border-box;" readonly></textarea><div style="margin-top:8px;display:flex;gap:8px;"><button class="btn btn-sm btn-success" onclick="copyAILesson()"><i class="fas fa-copy"></i> Copy</button><button class="btn btn-sm btn-primary" onclick="useAILessonInNote()"><i class="fas fa-plus"></i> Use in Lesson Note</button></div></div>';
  html += '</div>';

  // Right: Smart Feedback Generator
  html += '<div class="card" style="padding:20px;"><h3 style="margin-bottom:16px;"><i class="fas fa-comment-dots"></i> AI Smart Feedback Generator</h3>';
  html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:16px;">Generate contextual, personalized feedback for student assignments and submissions.</p>';
  html += '<div class="form-grid"><div class="form-group"><label>Student Name</label><input type="text" id="aiFbStudent" placeholder="e.g. Alice Johnson" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;"></div>';
  html += '<div class="form-group"><label>Score (%)</label><input type="number" id="aiFbScore" min="0" max="100" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;"></div>';
  html += '<div class="form-group"><label>Subject</label><select id="aiFbSubject" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
  subjects.forEach(function(s) { html += '<option value="' + htmlEscape(s) + '">' + htmlEscape(s) + '</option>'; });
  html += '</select></div><div class="form-group" style="grid-column:1/-1;"><label>Assignment / Task</label><input type="text" id="aiFbTask" placeholder="e.g. Algebra Homework" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box;"></div>';
  html += '<div class="form-group" style="grid-column:1/-1;"><button class="btn btn-primary" onclick="generateAndShowFeedback()"><i class="fas fa-magic"></i> Generate Feedback</button></div></div>';
  html += '<div id="aiFeedbackPreview" style="margin-top:12px;display:none;"><textarea id="aiFeedbackOutput" rows="6" style="padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;width:100%;box-sizing:border-box;" readonly></textarea><div style="margin-top:8px;display:flex;gap:8px;"><button class="btn btn-sm btn-success" onclick="copyAIFeedback()"><i class="fas fa-copy"></i> Copy</button></div></div>';
  html += '</div>';

  html += '</div>';
  container.innerHTML = html;
  updateAITopics();
}

function updateAITopics() {
  var sel = document.getElementById('aiLsnSubject');
  var topicSel = document.getElementById('aiLsnTopic');
  if (!sel || !topicSel) return;
  var subject = sel.value;
  var data = _aiLessonSubjects[subject];
  if (!data) { topicSel.innerHTML = '<option>No topics available</option>'; return; }
  topicSel.innerHTML = data.topics.map(function(t) { return '<option value="' + htmlEscape(t) + '">' + htmlEscape(t) + '</option>'; }).join('');
}

function generateAndPreviewLesson() {
  var subject = document.getElementById('aiLsnSubject')?.value;
  var topic = document.getElementById('aiLsnTopic')?.value;
  var className = document.getElementById('aiLsnClass')?.value?.trim() || 'General';
  if (!subject || !topic) { toast('Please select a subject and topic', 'error'); return; }
  var lesson = generateAILesson(subject, topic, className);
  var output = document.getElementById('aiLessonOutput');
  var preview = document.getElementById('aiLessonPreview');
  if (output) output.value = lesson;
  if (preview) preview.style.display = 'block';
}

function copyAILesson() {
  var output = document.getElementById('aiLessonOutput');
  if (!output || !output.value) return;
  navigator.clipboard.writeText(output.value).then(function() { toast('Lesson plan copied to clipboard'); }).catch(function() { toast('Failed to copy', 'error'); });
}

function useAILessonInNote() {
  var output = document.getElementById('aiLessonOutput');
  if (!output || !output.value) return;
  closeModal();
  showAddLessonNoteModal();
  // Wait for modal to render, then fill content
  setTimeout(function() {
    var contentField = document.getElementById('fLsnContent');
    var titleField = document.getElementById('fLsnTitle');
    var subjectField = document.getElementById('fLsnSubject');
    if (contentField) contentField.value = output.value;
    if (subjectField && document.getElementById('aiLsnSubject')) {
      var subj = document.getElementById('aiLsnSubject').value;
      for (var i = 0; i < (subjectField.options || []).length; i++) {
        if (subjectField.options[i].value === subj) { subjectField.selectedIndex = i; break; }
      }
    }
    var topic = document.getElementById('aiLsnTopic')?.value || '';
    if (titleField && topic) titleField.value = topic;
  }, 100);
}

function generateAndShowFeedback() {
  var name = document.getElementById('aiFbStudent')?.value?.trim();
  var score = parseInt(document.getElementById('aiFbScore')?.value, 10);
  var subject = document.getElementById('aiFbSubject')?.value;
  var task = document.getElementById('aiFbTask')?.value?.trim() || 'the assignment';
  if (!name || isNaN(score)) { toast('Please enter student name and score', 'error'); return; }
  var feedback = generateSmartFeedback(score, name, subject || 'the subject', task);
  var output = document.getElementById('aiFeedbackOutput');
  var preview = document.getElementById('aiFeedbackPreview');
  if (output) output.value = feedback;
  if (preview) preview.style.display = 'block';
}

function copyAIFeedback() {
  var output = document.getElementById('aiFeedbackOutput');
  if (!output || !output.value) return;
  navigator.clipboard.writeText(output.value).then(function() { toast('Feedback copied to clipboard'); }).catch(function() { toast('Failed to copy', 'error'); });
}

// Add "Generate with AI" button to Add Lesson Note modal (patched after load)
function patchLessonNoteModal() {
  if (!window._origShowAddLessonNoteModal) {
    if (typeof showAddLessonNoteModal !== 'function') return;
    window._origShowAddLessonNoteModal = showAddLessonNoteModal;
    showAddLessonNoteModal = function() {
      window._origShowAddLessonNoteModal();
      // Add AI generate button
      setTimeout(function() {
        var actions = document.querySelector('.modal-actions');
        if (actions) {
          var aiBtn = document.createElement('button');
          aiBtn.className = 'btn btn-primary';
          aiBtn.style.cssText = 'margin-right:auto;';
          aiBtn.innerHTML = '<i class="fas fa-magic"></i> Generate with AI';
          aiBtn.onclick = function() {
            closeModal();
            if (typeof renderAITools === 'function') {
              // Switch to AI tools panel
              if (typeof switchAdminPanel === 'function') {
                switchAdminPanel('aitools');
              } else if (typeof switchTeacherPanel === 'function') {
                switchTeacherPanel('aitools');
              }
            }
          };
          actions.insertBefore(aiBtn, actions.firstChild);
        }
      }, 50);
    };
  }
}
patchLessonNoteModal();

// Add "Generate Feedback" button to Grade Submission modal
function patchGradeModal() {
  if (!window._origGradeSubmission) {
    if (typeof gradeSubmission !== 'function') return;
    window._origGradeSubmission = gradeSubmission;
    gradeSubmission = function(submissionId) {
      window._origGradeSubmission(submissionId);
      setTimeout(function() {
        var gradeInput = document.getElementById('fSubGrade');
        var fbTextarea = document.getElementById('fSubFeedback');
        var actions = document.querySelector('.modal-actions');
        if (!gradeInput || !fbTextarea || !actions) return;
        var aiFbBtn = document.createElement('button');
        aiFbBtn.className = 'btn btn-primary';
        aiFbBtn.style.cssText = 'margin-right:auto;';
        aiFbBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Feedback';
        aiFbBtn.onclick = function() {
          var score = parseInt(gradeInput.value, 10);
          if (isNaN(score) || score < 0 || score > 100) { toast('Enter a valid score first', 'error'); return; }
          var name = '';
          var headerP = document.querySelector('.ev-modal-content p');
          if (headerP) {
            var strong = headerP.querySelector('strong');
            if (strong) name = strong.textContent;
          }
          var subject = 'the subject';
          var feedback = generateSmartFeedback(score, name, subject);
          fbTextarea.value = feedback;
          toast('AI feedback generated');
        };
        actions.insertBefore(aiFbBtn, actions.firstChild);
      }, 50);
    };
  }
}
patchGradeModal();

// ===== HOSTEL/DORMITORY MANAGEMENT =====
function renderHostel() {
  var container = document.getElementById('admin-hostel');
  if (!container) return;
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];
  var allocs = data.hostelAllocations || [];
  var maint = data.maintenanceReqs || [];
  var payments = data.hostelPayments || [];

  var totalBeds = rooms.reduce(function(sum, r) { return sum + (r.capacity || 0); }, 0);
  var occupied = allocs.filter(function(a) { return a.status === 'active'; }).length;
  var pendingMaint = maint.filter(function(m) { return m.status === 'pending' || m.status === 'in-progress'; }).length;
  var totalOwed = payments.reduce(function(s, p) { return s + p.amountOwed; }, 0);
  var totalPaid = payments.reduce(function(s, p) { return s + (p.amountPaid || 0); }, 0);
  var overdue = payments.filter(function(p) { return p.status === 'pending' || p.status === 'overdue'; }).length;

  var html = '<div class="card-header"><h2><i class="fas fa-bed"></i> Hostel / Dormitory Management</h2></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + hostels.length + '</div><div style="font-size:12px;color:var(--text-light);">Hostels</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--success);">' + totalBeds + '</div><div style="font-size:12px;color:var(--text-light);">Total Beds</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--info);">' + occupied + '</div><div style="font-size:12px;color:var(--text-light);">Occupied</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--accent);">' + (totalBeds - occupied) + '</div><div style="font-size:12px;color:var(--text-light);">Available</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:20px;font-weight:700;color:#38a169;">₦' + totalPaid.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Collected</div></div>' +
    '<div class="card" style="text-align:center;padding:16px;' + (overdue ? 'border-color:#e53e3e;' : '') + '"><div style="font-size:20px;font-weight:700;color:' + (overdue ? '#e53e3e' : 'var(--text-light)') + ';">₦' + (totalOwed - totalPaid).toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);' + (overdue ? 'color:#e53e3e;' : '') + '">Outstanding</div></div>' +
    '</div>';

  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">' +
    '<button class="btn btn-sm btn-outline hst-tab active" data-hsttab="overview" onclick="switchHostelTab(\'overview\')"><i class="fas fa-building"></i> Hostels</button>' +
    '<button class="btn btn-sm btn-outline hst-tab" data-hsttab="rooms" onclick="switchHostelTab(\'rooms\')"><i class="fas fa-door-open"></i> Rooms</button>' +
    '<button class="btn btn-sm btn-outline hst-tab" data-hsttab="allocations" onclick="switchHostelTab(\'allocations\')"><i class="fas fa-user-check"></i> Allocations</button>' +
    '<button class="btn btn-sm btn-outline hst-tab" data-hsttab="financials" onclick="switchHostelTab(\'financials\')"><i class="fas fa-money-bill"></i> Financials</button>' +
    '<button class="btn btn-sm btn-outline hst-tab" data-hsttab="maintenance" onclick="switchHostelTab(\'maintenance\')"><i class="fas fa-tools"></i> Maintenance</button>' +
    '</div>';

  html += '<div id="hostelOverviewView"></div>';
  html += '<div id="hostelRoomView" style="display:none;"></div>';
  html += '<div id="hostelAllocationView" style="display:none;"></div>';
  html += '<div id="hostelFinancialsView" style="display:none;"></div>';
  html += '<div id="hostelMaintView" style="display:none;"></div>';

  container.innerHTML = html;
  renderHostelOverview();
}

function switchHostelTab(tab) {
  document.querySelectorAll('.hst-tab').forEach(function(el) { el.classList.remove('active'); });
  var activeBtn = document.querySelector('.hst-tab[data-hsttab="' + tab + '"]');
  if (activeBtn) activeBtn.classList.add('active');
  var views = ['hostelOverviewView', 'hostelRoomView', 'hostelAllocationView', 'hostelFinancialsView', 'hostelMaintView'];
  views.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  var showId = tab === 'overview' ? 'hostelOverviewView' : tab === 'rooms' ? 'hostelRoomView' : tab === 'allocations' ? 'hostelAllocationView' : tab === 'financials' ? 'hostelFinancialsView' : 'hostelMaintView';
  var el = document.getElementById(showId); if (el) el.style.display = '';
  if (tab === 'overview' && typeof renderHostelOverview === 'function') renderHostelOverview();
  else if (tab === 'rooms' && typeof renderHostelRoomView === 'function') renderHostelRoomView();
  else if (tab === 'allocations' && typeof renderBedAllocation === 'function') renderBedAllocation();
  else if (tab === 'financials' && typeof renderHostelFinancials === 'function') renderHostelFinancials();
  else if (tab === 'maintenance' && typeof renderMaintenanceList === 'function') renderMaintenanceList();
}

function renderHostelOverview() {
  var container = document.getElementById('hostelOverviewView');
  if (!container) return;
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];
  var allocs = data.hostelAllocations || [];
  var typeLabels = { boys: 'Boys', girls: 'Girls', mixed: 'Mixed' };
  var typeColors = { boys: '#dbeafe', girls: '#fce4ec', mixed: '#e9d8fd' };

  var html = '<div style="margin-bottom:12px;"><button class="btn btn-primary btn-sm" onclick="showAddHostelModal()"><i class="fas fa-plus"></i> Add Hostel</button></div>';
  if (!hostels.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-building"></i><p>No hostels yet. Add your first hostel building.</p></div>';
    return;
  }
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
  hostels.forEach(function(h) {
    var hostelRooms = rooms.filter(function(r) { return r.hostelId === h.id; });
    var totalBeds = hostelRooms.reduce(function(s, r) { return s + (r.capacity || 0); }, 0);
    var occupied = allocs.filter(function(a) { return a.hostelId === h.id && a.status === 'active'; }).length;
    var pct = totalBeds ? Math.round(occupied / totalBeds * 100) : 0;
    var barColor = pct >= 90 ? '#e53e3e' : pct >= 70 ? '#dd6b20' : '#38a169';
    html += '<div class="card" style="padding:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<h4 style="font-weight:600;font-size:16px;margin:0;"><i class="fas fa-bed"></i> ' + htmlEscape(h.name) + '</h4>' +
      '<span class="badge" style="background:' + (typeColors[h.type] || '#e2e8f0') + ';color:#2d3748;font-size:11px;">' + (typeLabels[h.type] || h.type) + '</span>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">' +
      '<span style="margin-right:16px;"><i class="fas fa-door-open"></i> ' + hostelRooms.length + ' rooms</span>' +
      '<span><i class="fas fa-bed"></i> ' + totalBeds + ' beds</span>' +
      (h.warden ? '<br><span style="font-size:12px;"><i class="fas fa-user-shield"></i> Warden: ' + htmlEscape(h.warden) + '</span>' : '') +
      '</div>' +
      '<div style="background:#edf2f7;border-radius:99px;height:8px;margin-bottom:8px;overflow:hidden;"><div style="background:' + barColor + ';width:' + pct + '%;height:100%;border-radius:99px;"></div></div>' +
      '<div style="font-size:12px;color:var(--text-light);display:flex;justify-content:space-between;"><span>' + occupied + ' occupied</span><span>' + (totalBeds - occupied) + ' free</span></div>' +
      '<div style="margin-top:10px;display:flex;gap:6px;">' +
      '<button class="btn btn-sm btn-outline" onclick="showEditHostelModal(\'' + h.id + '\')"><i class="fas fa-edit"></i></button>' +
      '<button class="btn btn-sm btn-outline" onclick="switchHostelTab(\'rooms\');setTimeout(function(){ document.getElementById(\'hstRoomFilter\')?.value && (document.getElementById(\'hstRoomFilter\').value=\'' + h.id + '\') || null; renderHostelRoomView(); },100);"><i class="fas fa-door-open"></i></button>' +
      '<button class="btn btn-sm btn-danger" onclick="deleteHostel(\'' + h.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function showAddHostelModal() {
  openModal('<h3><i class="fas fa-plus-circle"></i> Add Hostel</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Hostel Name</label><input id="fHstName" class="form-input" placeholder="e.g. Red House"></div>' +
    '<div class="form-group"><label>Type</label><select id="fHstType" class="form-input"><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></div>' +
    '<div class="form-group"><label>Warden (optional)</label><input id="fHstWarden" class="form-input" placeholder="e.g. Mr. John"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="saveHostel()"><i class="fas fa-save"></i> Save</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function showEditHostelModal(id) {
  var h = (data.hostels || []).find(function(x) { return x.id === id; });
  if (!h) return;
  openModal('<h3><i class="fas fa-edit"></i> Edit Hostel</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Hostel Name</label><input id="fHstName" class="form-input" value="' + htmlEscape(h.name) + '"></div>' +
    '<div class="form-group"><label>Type</label><select id="fHstType" class="form-input"><option value="boys"' + (h.type === 'boys' ? ' selected' : '') + '>Boys</option><option value="girls"' + (h.type === 'girls' ? ' selected' : '') + '>Girls</option><option value="mixed"' + (h.type === 'mixed' ? ' selected' : '') + '>Mixed</option></select></div>' +
    '<div class="form-group"><label>Warden</label><input id="fHstWarden" class="form-input" value="' + htmlEscape(h.warden || '') + '"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="saveHostel(\'' + id + '\')"><i class="fas fa-save"></i> Update</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function saveHostel(id) {
  var name = document.getElementById('fHstName')?.value?.trim();
  if (!name) { toast('Enter a hostel name', 'error'); return; }
  var type = document.getElementById('fHstType')?.value || 'boys';
  var warden = document.getElementById('fHstWarden')?.value?.trim() || '';
  if (id) {
    var h = (data.hostels || []).find(function(x) { return x.id === id; });
    if (h) { h.name = name; h.type = type; h.warden = warden; }
  } else {
    if (!data.hostels) data.hostels = [];
    data.hostels.push({ id: genId('HST'), name: name, type: type, warden: warden });
  }
  saveData();
  closeModal();
  renderHostelOverview();
  toast('Hostel ' + (id ? 'updated' : 'added'));
}

function deleteHostel(id) {
  if (!confirm('Delete this hostel and all its rooms/allocations?')) return;
  data.hostels = (data.hostels || []).filter(function(h) { return h.id !== id; });
  data.hostelRooms = (data.hostelRooms || []).filter(function(r) { return r.hostelId !== id; });
  data.hostelAllocations = (data.hostelAllocations || []).filter(function(a) { return a.hostelId !== id; });
  saveData();
  renderHostelOverview();
  toast('Hostel deleted');
}

function renderHostelRoomView() {
  var container = document.getElementById('hostelRoomView');
  if (!container) return;
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];
  var allocs = data.hostelAllocations || [];
  var selected = document.getElementById('hstRoomFilter')?.value || (hostels.length ? hostels[0].id : '');

  var html = '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">' +
    '<label style="font-weight:600;font-size:14px;">Hostel:</label>' +
    '<select id="hstRoomFilter" onchange="renderHostelRoomView()" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">';
  hostels.forEach(function(h) {
    html += '<option value="' + h.id + '"' + (h.id === selected ? ' selected' : '') + '>' + htmlEscape(h.name) + '</option>';
  });
  html += '</select>' +
    '<button class="btn btn-primary btn-sm" onclick="showAddHostelRoomModal(\'' + selected + '\')"><i class="fas fa-plus"></i> Add Room</button>' +
    '</div>';

  var filtered = rooms.filter(function(r) { return r.hostelId === selected; });
  if (!filtered.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-door-open"></i><p>No rooms in this hostel. Add the first room.</p></div>';
    return;
  }
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">';
  filtered.forEach(function(r) {
    var active = allocs.filter(function(a) { return a.roomId === r.id && a.status === 'active'; });
    var occupantNames = active.map(function(a) {
      var stu = (data.students || []).find(function(s) { return s.id === a.studentId; });
      return stu ? stu.name : 'Unknown';
    });
    var pct = r.capacity ? Math.round(active.length / r.capacity * 100) : 0;
    html += '<div class="card" style="padding:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
      '<h4 style="font-weight:600;font-size:15px;margin:0;">Room ' + htmlEscape(r.roomNumber) + '</h4>' +
      '<button class="btn btn-sm btn-danger" onclick="deleteHostelRoom(\'' + r.id + '\')" style="padding:2px 8px;font-size:11px;"><i class="fas fa-trash"></i></button>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--text-light);margin-bottom:4px;"><i class="fas fa-bed"></i> Capacity: ' + r.capacity + ' beds</div>' +
      '<div style="background:#edf2f7;border-radius:99px;height:6px;margin-bottom:6px;overflow:hidden;"><div style="background:' + (pct >= 90 ? '#e53e3e' : pct >= 70 ? '#dd6b20' : '#38a169') + ';width:' + pct + '%;height:100%;border-radius:99px;"></div></div>' +
      '<div style="font-size:12px;color:var(--text-light);margin-bottom:6px;">' + active.length + '/' + r.capacity + ' occupied</div>';
    if (occupantNames.length) {
      html += '<div style="font-size:12px;"><i class="fas fa-users"></i> ' + occupantNames.map(function(n) { return htmlEscape(n); }).join(', ') + '</div>';
    }
    html += '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="showAllocateBedModal(\'' + r.id + '\')" style="font-size:11px;"><i class="fas fa-user-plus"></i> Allocate</button></div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function showAddHostelRoomModal(hostelId) {
  openModal('<h3><i class="fas fa-plus-circle"></i> Add Room</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Room Number</label><input id="fHRoomNum" class="form-input" placeholder="e.g. 101"></div>' +
    '<div class="form-group"><label>Bed Capacity</label><input id="fHRoomCap" class="form-input" type="number" min="1" max="20" value="4"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="saveHostelRoom(\'' + hostelId + '\')"><i class="fas fa-save"></i> Save</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function saveHostelRoom(hostelId) {
  var roomNumber = document.getElementById('fHRoomNum')?.value?.trim();
  if (!roomNumber) { toast('Enter room number', 'error'); return; }
  var capacity = parseInt(document.getElementById('fHRoomCap')?.value, 10) || 4;
  if (!data.hostelRooms) data.hostelRooms = [];
  data.hostelRooms.push({ id: genId('HRM'), hostelId: hostelId, roomNumber: roomNumber, capacity: capacity });
  saveData();
  closeModal();
  renderHostelRoomView();
  toast('Room added');
}

function deleteHostelRoom(id) {
  if (!confirm('Delete this room and vacate all allocations?')) return;
  data.hostelRooms = (data.hostelRooms || []).filter(function(r) { return r.id !== id; });
  data.hostelAllocations = (data.hostelAllocations || []).filter(function(a) { return a.roomId !== id; });
  saveData();
  renderHostelRoomView();
  toast('Room deleted');
}

function renderBedAllocation() {
  var container = document.getElementById('hostelAllocationView');
  if (!container) return;
  var allocs = data.hostelAllocations || [];
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];
  var students = data.students || [];

  var html = '<div style="margin-bottom:12px;"><button class="btn btn-primary btn-sm" onclick="showManualAllocateModal()"><i class="fas fa-user-plus"></i> Allocate Bed</button></div>';
  var active = allocs.filter(function(a) { return a.status === 'active'; });
  if (!active.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-bed"></i><p>No bed allocations yet. Allocate a student to a room.</p></div>';
    return;
  }
  html += '<div class="table-scroll"><table class="tbl"><thead><tr><th>Student</th><th>Class</th><th>Hostel</th><th>Room</th><th>Bed</th><th>Assigned</th><th>Action</th></tr></thead><tbody>';
  active.sort(function(a, b) { return b.assignedAt < a.assignedAt ? -1 : 1; }).forEach(function(a) {
    var stu = students.find(function(s) { return s.id === a.studentId; });
    var h = hostels.find(function(x) { return x.id === a.hostelId; });
    var r = rooms.find(function(x) { return x.id === a.roomId; });
    html += '<tr>' +
      '<td>' + (stu ? htmlEscape(stu.name) : 'Unknown') + '</td>' +
      '<td>' + (stu ? htmlEscape(stu.class) : '') + '</td>' +
      '<td>' + (h ? htmlEscape(h.name) : '') + '</td>' +
      '<td>Room ' + (r ? htmlEscape(r.roomNumber) : '') + '</td>' +
      '<td>' + htmlEscape(a.bedLabel || 'Bed ' + (a.bedIndex + 1)) + '</td>' +
      '<td>' + a.assignedAt + '</td>' +
      '<td><button class="btn btn-sm btn-danger" onclick="vacateBed(\'' + a.id + '\')" style="font-size:11px;">Vacate</button></td>' +
      '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function showAllocateBedModal(roomId) {
  var room = (data.hostelRooms || []).find(function(r) { return r.id === roomId; });
  if (!room) return;
  var hostel = (data.hostels || []).find(function(h) { return h.id === room.hostelId; });
  var active = (data.hostelAllocations || []).filter(function(a) { return a.roomId === room.id && a.status === 'active'; });
  var occupied = active.length;
  var available = room.capacity - occupied;

  var students = (data.students || []).filter(function(s) {
    return !(data.hostelAllocations || []).some(function(a) { return a.studentId === s.id && a.status === 'active'; });
  });

  var studentOpts = students.map(function(s) {
    return '<option value="' + s.id + '">' + htmlEscape(s.name) + ' (' + htmlEscape(s.class) + ')</option>';
  }).join('');

  var bedOpts = '';
  for (var i = 1; i <= room.capacity; i++) {
    var isOccupied = active.some(function(a) { return (a.bedLabel === 'Bed ' + i) || (a.bedIndex === i - 1); });
    if (!isOccupied) bedOpts += '<option value="Bed ' + i + '">Bed ' + i + '</option>';
  }

  openModal('<h3><i class="fas fa-user-plus"></i> Allocate Bed</h3>' +
    '<div style="margin-bottom:16px;">' +
    '<p style="font-size:14px;color:var(--text-light);"><strong>' + htmlEscape(hostel ? hostel.name : '') + '</strong> — Room ' + htmlEscape(room.roomNumber) + ' (' + available + ' of ' + room.capacity + ' beds free)</p>' +
    '</div>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Student</label><select id="fAllocStudent" class="form-input">' + (studentOpts || '<option value="">No available students</option>') + '</select></div>' +
    '<div class="form-group"><label>Bed</label><select id="fAllocBed" class="form-input">' + (bedOpts || '<option value="">No beds available</option>') + '</select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="allocateBed(\'' + roomId + '\')"><i class="fas fa-check"></i> Allocate</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function showManualAllocateModal() {
  var hostels = data.hostels || [];
  if (!hostels.length) { toast('Add a hostel first', 'error'); return; }
  var hostelOpts = hostels.map(function(h) { return '<option value="' + h.id + '">' + htmlEscape(h.name) + '</option>'; }).join('');
  openModal('<h3><i class="fas fa-user-plus"></i> Allocate Bed</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Hostel</label><select id="fAllocHostel" class="form-input" onchange="updateAllocRoomOptions()">' + hostelOpts + '</select></div>' +
    '<div class="form-group"><label>Room</label><select id="fAllocRoom" class="form-input"><option value="">Select hostel first</option></select></div>' +
    '<div class="form-group"><label>Student</label><select id="fAllocStudent" class="form-input"></select></div>' +
    '<div class="form-group"><label>Bed</label><select id="fAllocBed" class="form-input"><option value="">Select room first</option></select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="allocateBedFromModal()"><i class="fas fa-check"></i> Allocate</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
  updateAllocRoomOptions();
  updateAllocStudentOptions();
}

function updateAllocRoomOptions() {
  var hostelId = document.getElementById('fAllocHostel')?.value;
  var roomSel = document.getElementById('fAllocRoom');
  if (!hostelId || !roomSel) return;
  var rooms = (data.hostelRooms || []).filter(function(r) { return r.hostelId === hostelId; });
  roomSel.innerHTML = rooms.map(function(r) {
    var active = (data.hostelAllocations || []).filter(function(a) { return a.roomId === r.id && a.status === 'active'; }).length;
    var free = r.capacity - active;
    return '<option value="' + r.id + '"' + (free <= 0 ? ' disabled' : '') + '>Room ' + htmlEscape(r.roomNumber) + ' (' + free + '/' + r.capacity + ' free)</option>';
  }).join('') || '<option value="">No rooms available</option>';
  updateAllocBedOptions();
  updateAllocStudentOptions();
}

function updateAllocBedOptions() {
  var roomId = document.getElementById('fAllocRoom')?.value;
  var bedSel = document.getElementById('fAllocBed');
  if (!roomId || !bedSel) return;
  var room = (data.hostelRooms || []).find(function(r) { return r.id === roomId; });
  if (!room) { bedSel.innerHTML = '<option value="">Select room first</option>'; return; }
  var active = (data.hostelAllocations || []).filter(function(a) { return a.roomId === roomId && a.status === 'active'; });
  var opts = '';
  for (var i = 1; i <= room.capacity; i++) {
    var label = 'Bed ' + i;
    if (!active.some(function(a) { return a.bedLabel === label; })) {
      opts += '<option value="' + label + '">' + label + '</option>';
    }
  }
  bedSel.innerHTML = opts || '<option value="">No free beds</option>';
}

function updateAllocStudentOptions() {
  var stuSel = document.getElementById('fAllocStudent');
  if (!stuSel) return;
  var students = (data.students || []).filter(function(s) {
    return !(data.hostelAllocations || []).some(function(a) { return a.studentId === s.id && a.status === 'active'; });
  });
  stuSel.innerHTML = students.map(function(s) {
    return '<option value="' + s.id + '">' + htmlEscape(s.name) + ' (' + htmlEscape(s.class) + ')</option>';
  }).join('') || '<option value="">All students allocated</option>';
}

function _getMonthDays(year, month) {
  return new Date(year, month, 0).getDate();
}

function _generateHostelPayment(allocationId, studentId, hostelId, roomId, moveInDate, feePerMonth) {
  if (!feePerMonth || feePerMonth <= 0) return null;
  var d = moveInDate ? new Date(moveInDate) : new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var daysInMonth = _getMonthDays(year, month);
  var dayOfMonth = d.getDate();
  var daysLeft = daysInMonth - dayOfMonth + 1;
  var fullMonths = []; // start of next month payments
  if (daysLeft < daysInMonth) {
    var prorated = Math.round((feePerMonth / daysInMonth) * daysLeft);
    var monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
    var dueDate = year + '-' + String(month).padStart(2, '0') + '-15';
    if (!data.hostelPayments) data.hostelPayments = [];
    data.hostelPayments.push({
      id: genId('HPAY'),
      allocationId: allocationId,
      studentId: studentId,
      hostelId: hostelId,
      roomId: roomId,
      period: monthName + ' ' + year,
      month: month,
      year: year,
      amountOwed: prorated,
      amountPaid: 0,
      dueDate: dueDate,
      status: 'pending'
    });
  }
  var student = (data.students || []).find(function(s) { return s.id === studentId; });
  if (student && typeof addNotification === 'function') {
    try { addNotification(studentId, 'fee', 'Hostel fee for ' + (monthName || new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })) + ' ' + year + ' has been generated. Amount: ₦' + (prorated || feePerMonth).toLocaleString()); } catch(e) {}
  }
}

function allocateBed(roomId) {
  var studentId = document.getElementById('fAllocStudent')?.value;
  var bedLabel = document.getElementById('fAllocBed')?.value;
  if (!studentId || !bedLabel) { toast('Select a student and bed', 'error'); return; }
  var room = (data.hostelRooms || []).find(function(r) { return r.id === roomId; });
  if (!room) return;
  if (!data.hostelAllocations) data.hostelAllocations = [];
  var allocId = genId('HAL');
  var today = new Date().toISOString().split('T')[0];
  data.hostelAllocations.push({
    id: allocId,
    studentId: studentId,
    hostelId: room.hostelId,
    roomId: roomId,
    bedLabel: bedLabel,
    bedIndex: parseInt(bedLabel.replace('Bed ', ''), 10) - 1,
    assignedAt: today,
    status: 'active'
  });
  _generateHostelPayment(allocId, studentId, room.hostelId, roomId, today, room.feePerMonth);
  saveData();
  closeModal();
  renderHostelRoomView();
  toast('Bed allocated');
}

function allocateBedFromModal() {
  var hostelId = document.getElementById('fAllocHostel')?.value;
  var roomId = document.getElementById('fAllocRoom')?.value;
  var studentId = document.getElementById('fAllocStudent')?.value;
  var bedLabel = document.getElementById('fAllocBed')?.value;
  if (!roomId || !studentId || !bedLabel) { toast('Fill all fields', 'error'); return; }
  var room = (data.hostelRooms || []).find(function(r) { return r.id === roomId; });
  if (!room) return;
  if (!data.hostelAllocations) data.hostelAllocations = [];
  var allocId = genId('HAL');
  var today = new Date().toISOString().split('T')[0];
  data.hostelAllocations.push({
    id: allocId,
    studentId: studentId,
    hostelId: room.hostelId,
    roomId: roomId,
    bedLabel: bedLabel,
    bedIndex: parseInt(bedLabel.replace('Bed ', ''), 10) - 1,
    assignedAt: today,
    status: 'active'
  });
  _generateHostelPayment(allocId, studentId, room.hostelId, roomId, today, room.feePerMonth);
  saveData();
  closeModal();
  renderBedAllocation();
  toast('Bed allocated');
}

function vacateBed(allocationId) {
  if (!confirm('Vacate this bed allocation? This will finalize any pending hostel fees.')) return;
  var alloc = (data.hostelAllocations || []).find(function(a) { return a.id === allocationId; });
  if (!alloc) return;
  alloc.status = 'vacated';
  var room = (data.hostelRooms || []).find(function(r) { return r.id === alloc.roomId; });
  if (room && room.feePerMonth) {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var daysInMonth = _getMonthDays(year, month);
    var dayOfMonth = today.getDate();
    var monthName = today.toLocaleString('en-US', { month: 'long' });
    var prorated = Math.round((room.feePerMonth / daysInMonth) * dayOfMonth);
    var existing = (data.hostelPayments || []).find(function(p) { return p.allocationId === allocationId && p.month === month && p.year === year && p.status === 'pending'; });
    if (existing) {
      existing.amountOwed = prorated;
      existing.dueDate = year + '-' + String(month).padStart(2, '0') + '-15';
    } else {
      if (!data.hostelPayments) data.hostelPayments = [];
      data.hostelPayments.push({
        id: genId('HPAY'),
        allocationId: allocationId,
        studentId: alloc.studentId,
        hostelId: alloc.hostelId,
        roomId: alloc.roomId,
        period: monthName + ' ' + year,
        month: month, year: year,
        amountOwed: prorated,
        amountPaid: 0,
        dueDate: year + '-' + String(month).padStart(2, '0') + '-15',
        status: 'pending'
      });
    }
  }
  saveData();
  renderBedAllocation();
  toast('Bed vacated');
}

function renderMaintenanceList() {
  var container = document.getElementById('hostelMaintView');
  if (!container) return;
  var maint = data.maintenanceReqs || [];
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];
  var students = data.students || [];

  var html = '<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
    '<button class="btn btn-primary btn-sm" onclick="showAddMaintModal()"><i class="fas fa-plus"></i> Report Issue</button>' +
    '<span style="font-size:13px;color:var(--text-light);">' + maint.length + ' request(s)</span></div>';

  if (!maint.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-tools"></i><p>No maintenance requests reported.</p></div>';
    return;
  }
  var statusLabels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
  var statusColors = { pending: '#ecc94b', 'in-progress': '#63b3ed', completed: '#68d391' };
  html += '<div class="table-scroll"><table class="tbl"><thead><tr><th>Hostel</th><th>Room</th><th>Issue</th><th>Reported By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>';
  maint.sort(function(a, b) { return b.reportedAt < a.reportedAt ? -1 : 1; }).forEach(function(m) {
    var h = hostels.find(function(x) { return x.id === m.hostelId; });
    var r = rooms.find(function(x) { return x.id === m.roomId; });
    var stu = students.find(function(s) { return s.id === m.reportedBy; });
    html += '<tr>' +
      '<td>' + (h ? htmlEscape(h.name) : '') + '</td>' +
      '<td>' + (r ? 'Room ' + htmlEscape(r.roomNumber) : '') + '</td>' +
      '<td>' + htmlEscape(m.description) + '</td>' +
      '<td>' + htmlEscape(m.reporterName || (stu ? stu.name : 'Unknown')) + '</td>' +
      '<td>' + m.reportedAt + '</td>' +
      '<td><span class="badge" style="background:' + (statusColors[m.status] || '#e2e8f0') + ';color:#2d3748;">' + (statusLabels[m.status] || m.status) + '</span></td>' +
      '<td>' +
      (m.status !== 'completed' ? '<button class="btn btn-sm btn-success" onclick="updateMaintStatus(\'' + m.id + "','completed')\" style=\"font-size:11px;\"><i class=\"fas fa-check\"></i> Done</button> " : '') +
      (m.status === 'pending' ? '<button class="btn btn-sm btn-info" onclick="updateMaintStatus(\'' + m.id + "','in-progress')\" style=\"font-size:11px;\"><i class=\"fas fa-play\"></i> Start</button> " : '') +
      '<button class="btn btn-sm btn-danger" onclick="deleteMaintReq(\'' + m.id + '\')" style="font-size:11px;"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function showAddMaintModal() {
  var hostels = data.hostels || [];
  if (!hostels.length) { toast('Add a hostel first', 'error'); return; }
  var hostelOpts = hostels.map(function(h) { return '<option value="' + h.id + '">' + htmlEscape(h.name) + '</option>'; }).join('');
  openModal('<h3><i class="fas fa-tools"></i> Report Maintenance Issue</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Hostel</label><select id="fMaintHostel" class="form-input" onchange="updateMaintRoomOptions()">' + hostelOpts + '</select></div>' +
    '<div class="form-group"><label>Room</label><select id="fMaintRoom" class="form-input"><option value="">Select hostel first</option></select></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fMaintDesc" class="form-input" rows="3" placeholder="Describe the issue..."></textarea></div>' +
    '<div class="form-group"><label>Reported By</label><input id="fMaintReporter" class="form-input" placeholder="e.g. John Doe" value="Admin"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="saveMaintenanceReq()"><i class="fas fa-save"></i> Report</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
  updateMaintRoomOptions();
}

function updateMaintRoomOptions() {
  var hostelId = document.getElementById('fMaintHostel')?.value;
  var roomSel = document.getElementById('fMaintRoom');
  if (!hostelId || !roomSel) return;
  var rooms = (data.hostelRooms || []).filter(function(r) { return r.hostelId === hostelId; });
  roomSel.innerHTML = rooms.map(function(r) {
    return '<option value="' + r.id + '">Room ' + htmlEscape(r.roomNumber) + '</option>';
  }).join('') || '<option value="">No rooms</option>';
}

function saveMaintenanceReq() {
  var hostelId = document.getElementById('fMaintHostel')?.value;
  var roomId = document.getElementById('fMaintRoom')?.value;
  var desc = document.getElementById('fMaintDesc')?.value?.trim();
  var reporter = document.getElementById('fMaintReporter')?.value?.trim() || 'Admin';
  if (!hostelId || !roomId || !desc) { toast('Fill all fields', 'error'); return; }
  if (!data.maintenanceReqs) data.maintenanceReqs = [];
  data.maintenanceReqs.push({
    id: genId('MNT'),
    hostelId: hostelId,
    roomId: roomId,
    description: desc,
    reportedBy: reporter,
    reporterName: reporter,
    reportedAt: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  saveData();
  closeModal();
  renderMaintenanceList();
  toast('Maintenance request submitted');
}

function updateMaintStatus(id, status) {
  var req = (data.maintenanceReqs || []).find(function(m) { return m.id === id; });
  if (req) req.status = status;
  saveData();
  renderMaintenanceList();
  toast('Status updated');
}

function deleteMaintReq(id) {
  if (!confirm('Delete this maintenance request?')) return;
  data.maintenanceReqs = (data.maintenanceReqs || []).filter(function(m) { return m.id !== id; });
  saveData();
  renderMaintenanceList();
  toast('Request deleted');
}

function renderHostelFinancials() {
  var container = document.getElementById('hostelFinancialsView');
  if (!container) return;
  var payments = data.hostelPayments || [];
  var students = data.students || [];
  var hostels = data.hostels || [];

  var totalOwed = payments.reduce(function(s, p) { return s + p.amountOwed; }, 0);
  var totalPaid = payments.reduce(function(s, p) { return s + (p.amountPaid || 0); }, 0);
  var pending = payments.filter(function(p) { return p.status === 'pending'; });
  var overdue = payments.filter(function(p) { return p.status === 'overdue'; });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;">' +
    '<div class="card" style="text-align:center;padding:14px;"><div style="font-size:24px;font-weight:700;color:var(--primary);">₦' + totalOwed.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Total Billed</div></div>' +
    '<div class="card" style="text-align:center;padding:14px;"><div style="font-size:24px;font-weight:700;color:#38a169;">₦' + totalPaid.toLocaleString() + '</div><div style="font-size:12px;color:var(--text-light);">Collected</div></div>' +
    '<div class="card" style="text-align:center;padding:14px;' + (pending.length ? 'border-color:#dd6b20;' : '') + '"><div style="font-size:24px;font-weight:700;color:' + (pending.length ? '#dd6b20' : 'var(--text-light)') + ';">' + pending.length + '</div><div style="font-size:12px;color:var(--text-light);">Pending</div></div>' +
    '<div class="card" style="text-align:center;padding:14px;' + (overdue.length ? 'border-color:#e53e3e;' : '') + '"><div style="font-size:24px;font-weight:700;color:' + (overdue.length ? '#e53e3e' : 'var(--text-light)') + ';">' + overdue.length + '</div><div style="font-size:12px;color:var(--text-light);">Overdue</div></div>' +
    '<div class="card" style="text-align:center;padding:14px;"><div style="font-size:24px;font-weight:700;color:var(--accent);">' + payments.filter(function(p) { return p.status === 'paid'; }).length + '/' + payments.length + '</div><div style="font-size:12px;color:var(--text-light);">Paid</div></div>' +
    '</div>';

  if (!payments.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-money-bill"></i><p>No hostel fee records yet. Allocate a student to a room with a fee to generate billing.</p></div>';
    return;
  }

  html += '<div style="margin-bottom:8px;font-size:13px;color:var(--text-light);">' + payments.length + ' fee record(s)</div>';
  html += '<div class="table-scroll"><table class="tbl"><thead><tr><th>Student</th><th>Hostel</th><th>Period</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>';
  payments.sort(function(a, b) { return b.year !== a.year ? b.year - a.year : b.month !== a.month ? b.month - a.month : 0; }).forEach(function(p) {
    var stu = students.find(function(s) { return s.id === p.studentId; });
    var h = hostels.find(function(x) { return x.id === p.hostelId; });
    var bal = p.amountOwed - (p.amountPaid || 0);
    var today = new Date();
    var dueDate = new Date(p.dueDate);
    var isOverdue = (p.status === 'pending' || p.status === 'overdue') && today > dueDate;
    var statusLabels = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', partial: 'Partial' };
    var statusColors = { paid: '#c6f6d5', pending: '#fefcbf', overdue: '#fed7d7', partial: '#bee3f8' };
    var effectiveStatus = isOverdue && p.status !== 'paid' ? 'overdue' : p.status;
    var sLabel = statusLabels[effectiveStatus] || effectiveStatus;
    var sColor = statusColors[effectiveStatus] || '#e2e8f0';
    html += '<tr>' +
      '<td>' + (stu ? htmlEscape(stu.name) : htmlEscape(p.studentId)) + '</td>' +
      '<td>' + (h ? htmlEscape(h.name) : '') + '</td>' +
      '<td>' + htmlEscape(p.period || '') + '</td>' +
      '<td>₦' + (p.amountOwed || 0).toLocaleString() + '</td>' +
      '<td>₦' + (p.amountPaid || 0).toLocaleString() + '</td>' +
      '<td><strong>₦' + Math.max(0, bal).toLocaleString() + '</strong></td>' +
      '<td style="font-size:12px;">' + p.dueDate + '</td>' +
      '<td><span class="badge" style="background:' + sColor + ';color:#2d3748;">' + sLabel + '</span></td>' +
      '<td>' +
      (effectiveStatus !== 'paid' ? '<button class="btn btn-sm btn-success" onclick="markHostelPaymentPaid(\'' + p.id + '\')" style="font-size:11px;"><i class="fas fa-check"></i> Pay</button> ' : '') +
      '<button class="btn btn-sm btn-danger" onclick="deleteHostelPayment(\'' + p.id + '\')" style="font-size:11px;"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function markHostelPaymentPaid(id) {
  var pay = (data.hostelPayments || []).find(function(p) { return p.id === id; });
  if (!pay) return;
  var bal = pay.amountOwed - (pay.amountPaid || 0);
  if (bal <= 0) { pay.status = 'paid'; }
  else {
    var paidAmt = parseFloat(prompt('Enter amount received (₦' + bal + ' remaining):', bal));
    if (isNaN(paidAmt) || paidAmt <= 0) { toast('Invalid amount', 'error'); return; }
    pay.amountPaid = (pay.amountPaid || 0) + Math.min(paidAmt, bal);
    pay.status = pay.amountPaid >= pay.amountOwed ? 'paid' : 'partial';
  }
  saveData();
  renderHostelFinancials();
  notifyHostelPayment(pay);
  toast('Payment recorded');
}

function notifyHostelPayment(pay) {
  if (typeof addNotification !== 'function') return;
  try {
    var msg = 'Hostel fee for ' + pay.period + ' updated. ';
    if (pay.status === 'paid') msg += 'Full payment received.';
    else if (pay.status === 'partial') msg += '₦' + (pay.amountPaid || 0).toLocaleString() + ' of ₦' + pay.amountOwed.toLocaleString() + ' received.';
    else msg += 'Pending payment of ₦' + (pay.amountOwed - (pay.amountPaid || 0)).toLocaleString();
    addNotification(pay.studentId, 'fee', msg);
    var stu = (data.students || []).find(function(s) { return s.id === pay.studentId; });
    if (stu && stu.email) addNotification(stu.email, 'fee', msg);
  } catch(e) {}
}

function deleteHostelPayment(id) {
  if (!confirm('Delete this hostel fee record?')) return;
  data.hostelPayments = (data.hostelPayments || []).filter(function(p) { return p.id !== id; });
  saveData();
  renderHostelFinancials();
  toast('Fee record deleted');
}

function _renderStudentHostelPayments(studentId) {
  var payments = (data.hostelPayments || []).filter(function(p) { return p.studentId === studentId; }).sort(function(a, b) { return b.year !== a.year ? b.year - a.year : b.month - a.month; });
  if (!payments.length) return '<p style="font-size:13px;color:var(--text-light);margin-top:6px;">No fee records yet.</p>';
  var statusColors = { paid: '#c6f6d5', pending: '#fefcbf', overdue: '#fed7d7', partial: '#bee3f8' };
  var statusLabels = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', partial: 'Partial' };
  var html = '<div style="margin-top:8px;"><table style="width:100%;font-size:12px;border-collapse:collapse;"><thead><tr style="background:#f7fafc;"><th style="padding:6px 8px;text-align:left;">Period</th><th style="padding:6px 8px;text-align:right;">Amount</th><th style="padding:6px 8px;text-align:right;">Paid</th><th style="padding:6px 8px;text-align:center;">Status</th></tr></thead><tbody>';
  payments.forEach(function(p) {
    var sc = statusColors[p.status] || '#e2e8f0';
    var sl = statusLabels[p.status] || p.status;
    html += '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:6px 8px;">' + htmlEscape(p.period) + '</td><td style="padding:6px 8px;text-align:right;">₦' + (p.amountOwed || 0).toLocaleString() + '</td><td style="padding:6px 8px;text-align:right;">₦' + (p.amountPaid || 0).toLocaleString() + '</td><td style="padding:6px 8px;text-align:center;"><span class="badge" style="background:' + sc + ';color:#2d3748;font-size:10px;">' + sl + '</span></td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderStudentHostel() {
  var container = document.getElementById('stu-hostel');
  if (!container || !currentStudent) return;
  var s = currentStudent;
  var alloc = (data.hostelAllocations || []).find(function(a) { return a.studentId === s.id && a.status === 'active'; });
  var hostels = data.hostels || [];
  var rooms = data.hostelRooms || [];

  if (!alloc) {
    container.innerHTML =
      '<div class="card"><h3><i class="fas fa-bed"></i> My Hostel</h3>' +
      '<div class="empty-state"><i class="fas fa-door-open"></i><p>You have not been assigned to a hostel room yet.</p></div></div>';
    return;
  }
  var h = hostels.find(function(x) { return x.id === alloc.hostelId; });
  var r = rooms.find(function(x) { return x.id === alloc.roomId; });
  var roommates = (data.hostelAllocations || []).filter(function(a) {
    return a.roomId === alloc.roomId && a.status === 'active' && a.studentId !== s.id;
  });
  var roommateNames = roommates.map(function(a) {
    var stu = (data.students || []).find(function(x) { return x.id === a.studentId; });
    return stu ? stu.name : 'Unknown';
  });

  var typeLabels = { boys: 'Boys', girls: 'Girls', mixed: 'Mixed' };
  container.innerHTML =
    '<div class="card"><h3><i class="fas fa-bed"></i> My Hostel</h3>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:12px;">' +
    '<div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">' +
    '<div style="font-size:14px;color:var(--text-light);">Hostel</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--primary);">' + (h ? htmlEscape(h.name) : 'N/A') + '</div>' +
    (h ? '<div style="font-size:12px;color:var(--text-light);">' + (typeLabels[h.type] || h.type) + '</div>' : '') +
    '</div>' +
    '<div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">' +
    '<div style="font-size:14px;color:var(--text-light);">Room</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--success);">' + (r ? 'Room ' + htmlEscape(r.roomNumber) : 'N/A') + '</div>' +
    '</div>' +
    '<div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">' +
    '<div style="font-size:14px;color:var(--text-light);">Bed</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--accent);">' + htmlEscape(alloc.bedLabel || 'Bed ' + ((alloc.bedIndex || 0) + 1)) + '</div>' +
    '</div>' +
    '<div style="background:#f7fafc;border-radius:8px;padding:16px;text-align:center;">' +
    '<div style="font-size:14px;color:var(--text-light);">Warden</div>' +
    '<div style="font-size:16px;font-weight:600;color:var(--text-color);">' + (h && h.warden ? htmlEscape(h.warden) : 'Not assigned') + '</div>' +
    '</div>' +
    '</div>' +
    (roommateNames.length ? '<div style="margin-top:16px;"><h4 style="font-size:14px;font-weight:600;margin-bottom:8px;"><i class="fas fa-users"></i> Roommates</h4>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + roommateNames.map(function(n) {
        return '<span class="badge" style="background:#e2e8f0;color:#2d3748;padding:6px 12px;">' + htmlEscape(n) + '</span>';
      }).join('') + '</div></div>' : '') +
    (r && r.feePerMonth ? '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;"><h4 style="font-size:14px;font-weight:600;margin-bottom:8px;"><i class="fas fa-money-bill"></i> Fee Information</h4>' +
      '<div style="font-size:13px;color:var(--text-light);">Monthly Rate: <strong>₦' + (r.feePerMonth || 0).toLocaleString() + '</strong></div>' +
      _renderStudentHostelPayments(s.id) +
      '</div>' : '') +
    '<div style="margin-top:16px;"><button class="btn btn-sm btn-outline" onclick="showStudentMaintModal()"><i class="fas fa-tools"></i> Report Issue</button></div>' +
    '</div>';
}

function showStudentMaintModal() {
  if (!currentStudent) return;
  var alloc = (data.hostelAllocations || []).find(function(a) { return a.studentId === currentStudent.id && a.status === 'active'; });
  if (!alloc) { toast('No hostel allocation found', 'error'); return; }
  openModal('<h3><i class="fas fa-tools"></i> Report Maintenance Issue</h3>' +
    '<div class="form-grid"><div class="form-group" style="grid-column:1/-1;">' +
    '<label>Describe the issue</label>' +
    '<textarea id="fStuMaintDesc" class="form-input" rows="4" placeholder="e.g. Broken window, leaking tap, faulty fan..."></textarea>' +
    '</div></div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="saveStudentMaintReq()"><i class="fas fa-paper-plane"></i> Submit</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function saveStudentMaintReq() {
  if (!currentStudent) return;
  var desc = document.getElementById('fStuMaintDesc')?.value?.trim();
  if (!desc) { toast('Describe the issue', 'error'); return; }
  var alloc = (data.hostelAllocations || []).find(function(a) { return a.studentId === currentStudent.id && a.status === 'active'; });
  if (!alloc) { toast('No hostel allocation', 'error'); return; }
  if (!data.maintenanceReqs) data.maintenanceReqs = [];
  data.maintenanceReqs.push({
    id: genId('MNT'),
    hostelId: alloc.hostelId,
    roomId: alloc.roomId,
    description: desc,
    reportedBy: currentStudent.id,
    reporterName: currentStudent.name,
    reportedAt: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  saveData();
  closeModal();
  toast('Maintenance request submitted. Admin will review it.');
}
