// EduVerse - hostel module
// Extracted from features.js

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
