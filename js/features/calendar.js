// EduVerse - calendar module
// Extracted from features.js

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


// ===== ACADEMIC CALENDAR — STANDARD GRID VIEWS =====
// Event type colors
function _calColors() {
  return { academic: { bg: '#bee3f8', text: '#2b6cb0', label: 'Academic' }, sports: { bg: '#fefcbf', text: '#744210', label: 'Sports' }, holiday: { bg: '#c6f6d5', text: '#22543d', label: 'Holiday' }, meeting: { bg: '#e9d8fd', text: '#553c9a', label: 'Meeting' }, exam: { bg: '#fed7d7', text: '#9b2c2c', label: 'Exam' }, other: { bg: '#e2e8f0', text: '#2d3748', label: 'Other' } };
}

// Expand recurring events within a date range [startDate, endDate] (inclusive, ISO strings)
function _calExpandRecurring(events, startStr, endStr) {
  var out = [];
  var start = new Date(startStr + 'T00:00:00');
  var end = new Date(endStr + 'T00:00:00');
  (events || []).forEach(function(e) {
    var evDate = new Date(e.date + 'T00:00:00');
    if (evDate >= start && evDate <= end) {
      out.push({ event: e, displayDate: e.date, isRecurring: false });
    }
    if (e.recurring && e.recurring !== 'none') {
      var recurEnd = e.recurringEnd ? new Date(e.recurringEnd + 'T00:00:00') : new Date(end);
      var current = new Date(evDate);
      var count = 0;
      while (current <= recurEnd && current <= end && count < 52) {
        count++;
        if (e.recurring === 'weekly') current.setDate(current.getDate() + 7);
        else if (e.recurring === 'biweekly') current.setDate(current.getDate() + 14);
        else if (e.recurring === 'monthly') current.setMonth(current.getMonth() + 1);
        else if (e.recurring === 'termly') current.setMonth(current.getMonth() + 4);
        else break;
        if (current >= start && current <= end) {
          var ds = current.toISOString().split('T')[0];
          if (ds !== e.date) out.push({ event: e, displayDate: ds, isRecurring: true });
        }
      }
    }
  });
  return out.sort(function(a, b) { return a.displayDate.localeCompare(b.displayDate); });
}

// Get month grid: array of weeks, each week = array of {date, day, isOtherMonth, isToday}
function _calMonthGrid(year, month) {
  var first = new Date(year, month, 1);
  var last = new Date(year, month + 1, 0);
  var startPad = first.getDay(); // 0=Sun
  var weeks = [];
  var week = [];
  // Pad days from previous month
  var prevMonth = new Date(year, month, 0);
  for (var p = startPad - 1; p >= 0; p--) {
    var d = prevMonth.getDate() - p;
    week.push({ date: new Date(year, month - 1, d), day: d, isOtherMonth: true, isToday: false });
  }
  for (var d2 = 1; d2 <= last.getDate(); d2++) {
    var dt = new Date(year, month, d2);
    var today = new Date();
    var isToday = dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth() && dt.getDate() === today.getDate();
    week.push({ date: dt, day: d2, isOtherMonth: false, isToday: isToday });
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    // Pad remaining days
    var remaining = 7 - week.length;
    for (var i2 = 1; i2 <= remaining; i2++) {
      week.push({ date: new Date(year, month + 1, i2), day: i2, isOtherMonth: true, isToday: false });
    }
    weeks.push(week);
  }
  return weeks;
}

// Get Mon-Fri dates for a week containing the given date
function _calWeekDays(refDate) {
  var d = new Date(refDate);
  var day = d.getDay();
  var mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  var days = [];
  for (var i = 0; i < 5; i++) {
    var dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    days.push(dt);
  }
  return days;
}

function _calFormatDate(d) { return d.toISOString().split('T')[0]; }

function _calFormatShort(d) {
  return d.toLocaleString('default', { month: 'short', day: 'numeric' });
}

// Get exams as calendar events
function _calExamsAsEvents() {
  return (data.exams || []).map(function(e) {
    return { id: e.id, title: e.subject + ' (' + (e.class || '') + ')', date: e.date, type: 'exam', description: e.startTime + '-' + (e.endTime || '') + ' | ' + (e.term || ''), _exam: e };
  });
}

// Get timetable entries as calendar events for a given class (for student view)
function _calTtAsEvents(cls) {
  var daysMap = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4 };
  return (data.timetables || []).filter(function(t) { return t.class === cls; }).map(function(t) {
    var dayIdx = daysMap[t.day];
    if (dayIdx === undefined) return null;
    return { id: t.id, title: t.subject, date: null, type: 'timetable', description: t.teacher + ' | ' + (t.roomId || ''), _tt: t };
  }).filter(function(e) { return e; });
}

// Render month grid calendar to a container
function _calRenderMonthGrid(container, year, month, events, opts) {
  opts = opts || {};
  var weeks = _calMonthGrid(year, month);
  var colors = _calColors();
  var todayStr = new Date().toISOString().split('T')[0];

  // Group events by date
  var eventsByDate = {};
  events.forEach(function(ev) {
    var ds = ev.displayDate;
    if (!eventsByDate[ds]) eventsByDate[ds] = [];
    eventsByDate[ds].push(ev);
  });

  var html = '<div class="cal-grid">';
  // Day headers
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(function(n) { html += '<div class="cal-day-header">' + n + '</div>'; });
  // Day cells
  weeks.forEach(function(week) {
    week.forEach(function(cell) {
      var ds = _calFormatDate(cell.date);
      var cls = 'cal-day' + (cell.isOtherMonth ? ' other-month' : '') + (cell.isToday ? ' today' : '');
      html += '<div class="' + cls + '" data-date="' + ds + '" ondragover="event.preventDefault();this.classList.add(\'drag-over\')" ondragleave="this.classList.remove(\'drag-over\')" ondrop="event.preventDefault();this.classList.remove(\'drag-over\');var id=event.dataTransfer.getData(\'text/plain\');if(id&&typeof _calMoveEvent===\'function\')_calMoveEvent(id,\'' + ds + '\')" onclick="if (typeof _calHandleDayClick === \'function\') _calHandleDayClick(\'' + ds + '\')">';
      html += '<div class="cal-day-num">' + cell.day + '</div>';
      var dayEvents = eventsByDate[ds] || [];
      var maxShow = 3;
      dayEvents.slice(0, maxShow).forEach(function(ev) {
        var c = ev.isRecurring ? { bg: '#e2e8f0', text: '#2d3748' } : (colors[ev.event.type] || { bg: '#e2e8f0', text: '#2d3748' });
        html += '<div class="cal-event-chip' + (ev.event.id && !ev.isRecurring ? ' draggable-chip' : '') + '" draggable="' + (ev.event.id && !ev.isRecurring ? 'true' : 'false') + '" style="background:' + c.bg + ';color:' + c.text + ';" title="' + htmlEscape(ev.event.title + (ev.isRecurring ? ' (recurring)' : '') + (ev.event.id && !ev.isRecurring ? ' — Drag to move' : '')) + '" ondragstart="event.dataTransfer.setData(\'text/plain\',\'' + ev.event.id + '\');this.classList.add(\'dragging\')" ondragend="this.classList.remove(\'dragging\')" onclick="event.stopPropagation();' + (opts.onEventClick ? opts.onEventClick(ev) : '') + '">' + htmlEscape(ev.event.title) + '</div>';
      });
      if (dayEvents.length > maxShow) {
        html += '<div class="cal-more">+' + (dayEvents.length - maxShow) + ' more</div>';
      }
      html += '</div>';
    });
  });
  html += '</div>';
  container.innerHTML = html;
}

// Render week view: timetable periods on left, events per day
function _calRenderWeekView(container, refDate, events, opts) {
  opts = opts || {};
  var days = _calWeekDays(refDate);
  var periods = _ttPeriods();
  var breaks = _ttBreaks();
  var colors = _calColors();

  // Group events by date
  var eventsByDate = {};
  events.forEach(function(ev) {
    if (!ev.displayDate) return;
    if (!eventsByDate[ev.displayDate]) eventsByDate[ev.displayDate] = [];
    eventsByDate[ev.displayDate].push(ev);
  });

  var html = '<div class="cal-week-view">';
  // Header row
  html += '<div class="cal-week-header"><div>Time</div>';
  days.forEach(function(d) {
    var ds = _calFormatDate(d);
    var today = new Date();
    var isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    html += '<div style="' + (isToday ? 'background:var(--primary);color:#fff;' : '') + '">' + d.toLocaleString('default', { weekday: 'short' }) + ' ' + d.getDate() + '</div>';
  });
  html += '</div>';

  // Period rows
  periods.forEach(function(p, pi) {
    var isBreak = breaks.indexOf(pi) !== -1;
    html += '<div class="cal-week-period' + (isBreak ? ' break-row' : '') + '">';
    html += '<div>' + p + '</div>';
    days.forEach(function(d) {
      var ds = _calFormatDate(d);
      html += '<div>';
      if (isBreak) {
        html += '<span style="color:#744210;font-size:10px;"><i class="fas fa-coffee"></i> Break</span>';
      } else {
        // Timetable entries for this day/period
        var dayName = d.toLocaleString('default', { weekday: 'long' });
        if (opts.classFilter) {
          var tt = data.timetables.find(function(t) { return t.day === dayName && t.period === p && t.class === opts.classFilter; });
          if (tt) html += '<div class="cal-period-timetable" title="' + htmlEscape(tt.teacher) + '">' + htmlEscape(tt.subject) + '</div>';
        }
        // Calendar events for this date
        var dateEvents = eventsByDate[ds] || [];
        dateEvents.forEach(function(ev) {
          var c = ev.isRecurring ? { bg: '#e2e8f0', text: '#2d3748' } : (colors[ev.event.type] || { bg: '#e2e8f0', text: '#2d3748' });
          html += '<div class="cal-period-event" style="background:' + c.bg + ';color:' + c.text + ';">' + htmlEscape(ev.event.title) + '</div>';
        });
      }
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// Render agenda list view
function _calRenderAgendaView(container, events, opts) {
  opts = opts || {};
  var colors = _calColors();
  var today = new Date().toISOString().split('T')[0];
  var upcoming = events.filter(function(e) { return e.displayDate >= today; });
  var past = events.filter(function(e) { return e.displayDate < today; });

  var html = '';
  if (!events.length) {
    html = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No events in this period</p></div>';
    container.innerHTML = html;
    return;
  }

  if (upcoming.length) {
    html += '<h4 style="margin-bottom:8px;color:var(--success);"><i class="fas fa-arrow-up"></i> Upcoming (' + upcoming.length + ')</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">';
    upcoming.forEach(function(ev) {
      var c = ev.isRecurring ? { bg: '#e2e8f0', text: '#2d3748' } : (colors[ev.event.type] || { bg: '#e2e8f0', text: '#2d3748' });
      var dt = new Date(ev.displayDate + 'T00:00:00');
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;opacity:' + (ev.isRecurring ? 0.85 : 1) + ';">' +
        '<div style="text-align:center;min-width:44px;"><div style="font-size:16px;font-weight:800;color:var(--primary);">' + dt.getDate() + '</div><div style="font-size:10px;color:var(--text-light);text-transform:uppercase;">' + dt.toLocaleString('default', { month: 'short' }) + '</div></div>' +
        '<div style="flex:1;"><div style="font-weight:600;font-size:13px;">' + htmlEscape(ev.event.title) + (ev.isRecurring ? ' <span style="font-size:10px;color:var(--text-light);">(recurring)</span>' : '') + '</div>' +
        (ev.event.description ? '<div style="font-size:12px;color:var(--text-light);">' + htmlEscape(ev.event.description) + '</div>' : '') + '</div>' +
        '<span class="badge" style="background:' + c.bg + ';color:' + c.text + ';font-size:10px;">' + (colors[ev.event.type] ? colors[ev.event.type].label : ev.event.type) + '</span></div>';
    });
    html += '</div>';
  }
  if (past.length) {
    html += '<details><summary style="cursor:pointer;font-weight:600;color:var(--text-light);font-size:13px;"><i class="fas fa-history"></i> Past (' + past.length + ')</summary><div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">';
    past.forEach(function(ev) {
      var c = ev.isRecurring ? { bg: '#e2e8f0', text: '#2d3748' } : (colors[ev.event.type] || { bg: '#e2e8f0', text: '#2d3748' });
      var dt = new Date(ev.displayDate + 'T00:00:00');
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;opacity:0.6;">' +
        '<div style="text-align:center;min-width:44px;"><div style="font-size:14px;font-weight:800;color:var(--text-light);">' + dt.getDate() + '</div><div style="font-size:10px;color:var(--text-light);text-transform:uppercase;">' + dt.toLocaleString('default', { month: 'short' }) + '</div></div>' +
        '<div style="flex:1;"><div style="font-weight:600;font-size:12px;">' + htmlEscape(ev.event.title) + '</div></div>' +
        '<span class="badge" style="background:' + c.bg + ';color:' + c.text + ';font-size:10px;">' + (colors[ev.event.type] ? colors[ev.event.type].label : ev.event.type) + '</span></div>';
    });
    html += '</div></details>';
  }
  container.innerHTML = html;
}

// State for calendar navigation
var _calState = { view: 'month', year: new Date().getFullYear(), month: new Date().getMonth(), refDate: new Date(), filters: {} };

function _calNavHTML() {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var title = _calState.view === 'month' ? monthNames[_calState.month] + ' ' + _calState.year : 'Week of ' + _calFormatShort(_calState.refDate);
  return '<div class="cal-nav"><div class="cal-nav-title"><i class="fas fa-calendar-alt"></i> ' + title + '</div>' +
    '<div class="cal-nav-btns">' +
    '<button onclick="_calNavigate(-1)" title="Previous"><i class="fas fa-chevron-left"></i></button>' +
    '<button onclick="_calNavigate(0)" title="Today">Today</button>' +
    '<button onclick="_calNavigate(1)" title="Next"><i class="fas fa-chevron-right"></i></button>' +
    '<button class="' + (_calState.view === 'month' ? 'active' : '') + '" onclick="_calSetView(\'month\')">Month</button>' +
    '<button class="' + (_calState.view === 'week' ? 'active' : '') + '" onclick="_calSetView(\'week\')">Week</button>' +
    '<button class="' + (_calState.view === 'agenda' ? 'active' : '') + '" onclick="_calSetView(\'agenda\')">Agenda</button>' +
    '</div></div>';
}

function _calNavigate(dir) {
  if (dir === -1) {
    if (_calState.view === 'month') { _calState.month--; if (_calState.month < 0) { _calState.month = 11; _calState.year--; } }
    else { var d = new Date(_calState.refDate); d.setDate(d.getDate() - 7); _calState.refDate = d; }
  } else if (dir === 1) {
    if (_calState.view === 'month') { _calState.month++; if (_calState.month > 11) { _calState.month = 0; _calState.year++; } }
    else { var d = new Date(_calState.refDate); d.setDate(d.getDate() + 7); _calState.refDate = d; }
  } else {
    var now = new Date();
    _calState.year = now.getFullYear();
    _calState.month = now.getMonth();
    _calState.refDate = new Date(now);
  }
  _calRefresh();
}

function _calSetView(view) {
  _calState.view = view;
  _calRefresh();
}

function _calRefresh() {
  var container = document.getElementById('academicCalendarView');
  if (!container) return;
  var allEvents = getCalendarEvents() || [];
  // Add exams as calendar events
  allEvents = allEvents.concat(_calExamsAsEvents());
  // Expand recurring
  var rangeStart, rangeEnd;
  if (_calState.view === 'month') {
    rangeStart = _calFormatDate(new Date(_calState.year, _calState.month, 1));
    rangeEnd = _calFormatDate(new Date(_calState.year, _calState.month + 1, 0));
  } else if (_calState.view === 'week') {
    var wDays = _calWeekDays(_calState.refDate);
    rangeStart = _calFormatDate(wDays[0]);
    rangeEnd = _calFormatDate(wDays[4]);
  } else {
    rangeStart = _calFormatDate(new Date(_calState.year, _calState.month, 1));
    rangeEnd = _calFormatDate(new Date(_calState.year, _calState.month + 1, 0));
  }
  // Apply filters
  var activeTypes = Object.keys(_calState.filters).filter(function(k) { return _calState.filters[k]; });
  var filtered = _calExpandRecurring(allEvents, rangeStart, rangeEnd);
  if (activeTypes.length) {
    filtered = filtered.filter(function(ev) { return activeTypes.indexOf(ev.event.type) >= 0; });
  }

  var html = _calNavHTML();

  // Filter bar
  var colors = _calColors();
  html += '<div class="cal-filter-bar">';
  Object.keys(colors).forEach(function(type) {
    var isActive = _calState.filters[type] !== false;
    html += '<button class="cal-filter-btn' + (isActive ? ' active' : '') + '" onclick="_calToggleFilter(\'' + type + '\')" style="border-color:' + colors[type].bg + ';' + (isActive ? 'background:' + colors[type].bg + ';color:' + colors[type].text + ';' : '') + '">' + colors[type].label + '</button>';
  });
  // Add event button
  html += '<button class="cal-filter-btn" style="margin-left:auto;border-color:var(--accent);color:var(--accent);" onclick="showAddCalendarEventModal()"><i class="fas fa-plus"></i> Add Event</button>';
  html += '</div>';

  // Legend
  html += '<div class="cal-legend">';
  Object.keys(colors).forEach(function(type) {
    html += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + colors[type].bg + ';border:1px solid ' + colors[type].text + ';"></span> ' + colors[type].label + '</span>';
  });
  html += '</div>';

  container.innerHTML = html;

  // Render content below nav
  var contentDiv = document.createElement('div');
  contentDiv.id = 'calContent';
  container.appendChild(contentDiv);
  _calRenderViewContent(contentDiv, filtered);
}

function _calRenderViewContent(contentDiv, events) {
  if (_calState.view === 'month') {
    _calRenderMonthGrid(contentDiv, _calState.year, _calState.month, events, {
      onEventClick: function(ev) { return 'if (typeof showEditCalendarEventModal===\'function\') showEditCalendarEventModal(\'' + ev.event.id + '\')'; }
    });
  } else if (_calState.view === 'week') {
    _calRenderWeekView(contentDiv, _calState.refDate, events, { classFilter: _calState.classFilter });
  } else {
    _calRenderAgendaView(contentDiv, events);
  }
}

function _calToggleFilter(type) {
  _calState.filters[type] = _calState.filters[type] === false ? true : false;
  _calRefresh();
}

function _calMoveEvent(eventId, newDate) {
  var ev = data.academicCalendar.find(function(e) { return e.id === eventId; });
  if (!ev) return;
  if (ev.date === newDate) return;
  var oldDate = ev.date;
  ev.date = newDate;
  saveData();
  logActivity('Moved event "' + ev.title + '" from ' + oldDate + ' to ' + newDate);
  _calRefresh();
  toast('Event moved to ' + newDate);
}

// Override admin calendar render
function renderAcademicCalendar() {
  _calState.classFilter = null;
  _calRefresh();
}

// Override student/public calendar render
function renderAcademicCalendarView(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var allEvents = (getCalendarEvents() || []).concat(_calExamsAsEvents());

  // For student view, add timetable
  if (typeof currentStudent !== 'undefined' && currentStudent) {
    var ttEvents = _calTtAsEvents(currentStudent.class);
    ttEvents.forEach(function(te) {
      // Map timetable to weekdays - only show in week/agenda view
      te._isTt = true;
    });
    allEvents = allEvents.concat(ttEvents);
  }

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var refDate = new Date(now);
  var view = 'month';

  // Navigation HTML
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var html = '<div class="cal-nav"><div class="cal-nav-title"><i class="fas fa-calendar-alt"></i> Academic Calendar</div>' +
    '<div class="cal-nav-btns">' +
    '<button class="active" onclick="renderAcademicCalendarView(\'' + containerId + '\')"><i class="fas fa-th"></i> Month</button>' +
    '<button onclick="this.parentElement.querySelector(\'.active\').classList.remove(\'active\');this.classList.add(\'active\');renderAcademicCalendarViewWeek(\'' + containerId + '\')"><i class="fas fa-list"></i> Agenda</button>' +
    '</div></div>';

  // Legend
  var colors = _calColors();
  html += '<div class="cal-legend">';
  Object.keys(colors).forEach(function(type) {
    html += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + colors[type].bg + ';border:1px solid ' + colors[type].text + ';"></span> ' + colors[type].label + '</span>';
  });
  html += '</div>';

  container.innerHTML = html;

  var contentDiv = document.createElement('div');
  container.appendChild(contentDiv);

  // Month grid
  var rangeStart = _calFormatDate(new Date(year, month, 1));
  var rangeEnd = _calFormatDate(new Date(year, month + 1, 0));
  var expanded = _calExpandRecurring(allEvents, rangeStart, rangeEnd);
  _calRenderMonthGrid(contentDiv, year, month, expanded, {
    onEventClick: function(ev) { return ''; }
  });
}

// Week/agenda view for student (called from button)
function renderAcademicCalendarViewWeek(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var allEvents = (getCalendarEvents() || []).concat(_calExamsAsEvents());
  if (typeof currentStudent !== 'undefined' && currentStudent) {
    var ttEvents = _calTtAsEvents(currentStudent.class);
    allEvents = allEvents.concat(ttEvents);
  }
  var now = new Date();
  var rangeStart = _calFormatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  var rangeEnd = _calFormatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  var expanded = _calExpandRecurring(allEvents, rangeStart, rangeEnd);

  var contentDiv = container.querySelector('#calContent') || (function() {
    var d = document.createElement('div');
    d.id = 'calContent';
    container.appendChild(d);
    return d;
  })();

  _calRenderAgendaView(contentDiv, expanded);
}

// Handle day click on calendar (admin can add event for that date)
function _calHandleDayClick(dateStr) {
  if (typeof showAddCalendarEventModal === 'function') {
    showAddCalendarEventModal(dateStr);
  }
}

// Override showAddCalendarEventModal to accept optional date and add recurring field
function showAddCalendarEventModal(prefillDate) {
  var dateVal = prefillDate || '';
  openModal('<h3><i class="fas fa-plus-circle"></i> Add Calendar Event</h3><div class="form-grid">' +
    '<div class="form-group"><label>Event Title</label><input type="text" id="fCalTitle" placeholder="e.g. Sports Day"></div>' +
    '<div class="form-group"><label>Date</label><input type="date" id="fCalDate" value="' + dateVal + '"></div>' +
    '<div class="form-group"><label>Type</label><select id="fCalType"><option value="academic">Academic</option><option value="sports">Sports</option><option value="holiday">Holiday</option><option value="meeting">Meeting</option><option value="other">Other</option></select></div>' +
    '<div class="form-group"><label>Recurrence</label><select id="fCalRecurring"><option value="none">None</option><option value="weekly">Weekly</option><option value="biweekly">Bi-Weekly</option><option value="monthly">Monthly</option><option value="termly">Termly</option></select></div>' +
    '<div class="form-group"><label>Repeat Until (optional)</label><input type="date" id="fCalRecurringEnd"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fCalDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;" placeholder="Event details..."></textarea></div>' +
    '</div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCalendarEvent()"><i class="fas fa-save"></i> Save</button></div>');
}

// Override saveCalendarEvent to include recurring fields
function saveCalendarEvent() {
  var title = document.getElementById('fCalTitle')?.value?.trim();
  var date = document.getElementById('fCalDate')?.value;
  var type = document.getElementById('fCalType')?.value || 'other';
  var recurring = document.getElementById('fCalRecurring')?.value || 'none';
  var recurringEnd = document.getElementById('fCalRecurringEnd')?.value || '';
  var desc = document.getElementById('fCalDesc')?.value?.trim() || '';
  if (!title || !date) { toast('Please enter title and date', 'error'); return; }
  if (!data.academicCalendar) data.academicCalendar = [];
  data.academicCalendar.push({ id: genId('CAL'), title: title, date: date, type: type, description: desc, recurring: recurring, recurringEnd: recurringEnd });
  saveData();
  logActivity('Added calendar event: ' + title);
  closeModal();
  renderAcademicCalendar();
  toast('Event added');
}

// Override showEditCalendarEventModal to include recurring fields
function showEditCalendarEventModal(id) {
  var e = (data.academicCalendar || []).find(function(ev) { return ev.id === id; });
  if (!e) return;
  var recurringOpts = ['none', 'weekly', 'biweekly', 'monthly', 'termly'].map(function(r) {
    return '<option value="' + r + '"' + (e.recurring === r ? ' selected' : '') + '>' + r.charAt(0).toUpperCase() + r.slice(1) + '</option>';
  }).join('');
  openModal('<h3><i class="fas fa-edit"></i> Edit Calendar Event</h3><div class="form-grid">' +
    '<div class="form-group"><label>Event Title</label><input type="text" id="fCalTitle" value="' + htmlEscape(e.title) + '"></div>' +
    '<div class="form-group"><label>Date</label><input type="date" id="fCalDate" value="' + htmlEscape(e.date) + '"></div>' +
    '<div class="form-group"><label>Type</label><select id="fCalType"><option value="academic"' + (e.type === 'academic' ? ' selected' : '') + '>Academic</option><option value="sports"' + (e.type === 'sports' ? ' selected' : '') + '>Sports</option><option value="holiday"' + (e.type === 'holiday' ? ' selected' : '') + '>Holiday</option><option value="meeting"' + (e.type === 'meeting' ? ' selected' : '') + '>Meeting</option><option value="other"' + (e.type === 'other' ? ' selected' : '') + '>Other</option></select></div>' +
    '<div class="form-group"><label>Recurrence</label><select id="fCalRecurring">' + recurringOpts + '</select></div>' +
    '<div class="form-group"><label>Repeat Until</label><input type="date" id="fCalRecurringEnd" value="' + htmlEscape(e.recurringEnd || '') + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fCalDesc" rows="3" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;">' + htmlEscape(e.description || '') + '</textarea></div>' +
    '</div><div class="modal-actions"><button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateCalendarEvent(\'' + id + '\')"><i class="fas fa-save"></i> Update</button></div>');
}

// Override updateCalendarEvent to include recurring fields
function updateCalendarEvent(id) {
  var e = (data.academicCalendar || []).find(function(ev) { return ev.id === id; });
  if (!e) return;
  e.title = document.getElementById('fCalTitle')?.value?.trim() || e.title;
  e.date = document.getElementById('fCalDate')?.value || e.date;
  e.type = document.getElementById('fCalType')?.value || e.type;
  e.recurring = document.getElementById('fCalRecurring')?.value || 'none';
  e.recurringEnd = document.getElementById('fCalRecurringEnd')?.value || '';
  e.description = document.getElementById('fCalDesc')?.value?.trim() || '';
  saveData();
  logActivity('Updated calendar event: ' + e.title);
  closeModal();
  renderAcademicCalendar();
  toast('Event updated');
}

// ===== TIMETABLE ADJUSTMENTS =====
// Drag timetable entry to a different day/period on the admin grid
function _ttDropOnDayPeriod(entryId, targetDay, targetPeriod) {
  var entry = data.timetables.find(function(t) { return t.id === entryId; });
  if (!entry) return;
  var conflict = data.timetables.find(function(t) { return t.id !== entryId && t.class === entry.class && t.day === targetDay && t.period === targetPeriod; });
  if (conflict) { toast('This class already has ' + conflict.subject + ' at ' + targetDay + ' ' + targetPeriod, 'error'); return false; }
  entry.day = targetDay;
  entry.period = targetPeriod;
  saveData();
  renderTimetableAdmin();
  toast('Timetable entry moved to ' + targetDay + ' ' + targetPeriod);
  return true;
}

// Quick-edit timetable from calendar: show modal with prefilled day/period
function _calQuickAddTt(day, period, cls) {
  if (typeof quickAddTimetable === 'function') quickAddTimetable(day, period);
}
