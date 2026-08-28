// EduVerse - Alumni Management Module
// Directory, Reunion Coordination, Donation Tracking

// ===== STATE =====
var _almEditId = null;
var _almReunionEditId = null;

// ===== ADMIN: RENDER ALUMNI DIRECTORY =====
function renderAlumni() {
  var panel = document.getElementById('admin-alumni');
  if (!panel) return;
  var list = data.alumni || [];
  var q = (document.getElementById('almSearch')?.value || '').trim().toLowerCase();
  if (q) list = list.filter(function(a) { return a.name.toLowerCase().includes(q) || (a.graduationYear||'').includes(q) || (a.occupation||'').toLowerCase().includes(q); });

  var html = '<div style="margin-bottom:24px;">' +
    '<h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-user-graduate"></i> Alumni Directory</h2>' +
    '<p style="color:var(--text-light);">Manage graduated students, reunions, and donations</p></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">' +
    '<input type="text" id="almSearch" placeholder="Search by name, year, occupation..." value="' + htmlEscape(q) + '" oninput="renderAlumni()" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;background:var(--card-bg);color:var(--text);">' +
    '<button class="btn btn-primary btn-sm" onclick="showAddAlumniModal()"><i class="fas fa-plus"></i> Add Alumni</button>' +
    '<button class="btn btn-sm btn-outline" onclick="showAddReunionModal()"><i class="fas fa-calendar-plus"></i> New Reunion</button>' +
    '<button class="btn btn-sm btn-outline" onclick="showDonationModal()"><i class="fas fa-hand-holding-usd"></i> Record Donation</button>' +
    '<button class="btn btn-export btn-sm" onclick="exportAlumniCSV()"><i class="fas fa-download"></i> CSV</button>' +
    '</div>';

  html += '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">' +
    '<div style="flex:1;min-width:200px;background:var(--card-bg);border:1px solid #e2e8f0;border-radius:10px;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + (data.alumni||[]).length + '</div><div style="font-size:13px;color:var(--text-light);">Total Alumni</div></div>' +
    '<div style="flex:1;min-width:200px;background:var(--card-bg);border:1px solid #e2e8f0;border-radius:10px;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--accent);">' + (data.reunions||[]).length + '</div><div style="font-size:13px;color:var(--text-light);">Reunions</div></div>' +
    '<div style="flex:1;min-width:200px;background:var(--card-bg);border:1px solid #e2e8f0;border-radius:10px;padding:16px;"><div style="font-size:28px;font-weight:700;color:var(--success);">₦' + ((data.donations||[]).reduce(function(s,d){return s+Number(d.amount||0);},0)).toLocaleString() + '</div><div style="font-size:13px;color:var(--text-light);">Total Donations</div></div>' +
    '</div>';

  if (list.length === 0) {
    html += '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>No alumni records found</p></div>';
  } else {
    html += '<div style="overflow-x:auto;margin-bottom:24px;"><table class="tbl"><thead><tr><th>ID</th><th>Name</th><th>Year</th><th>Class</th><th>Contact</th><th>Occupation</th><th>Organization</th><th>Actions</th></tr></thead><tbody>';
    list.forEach(function(a) {
      html += '<tr><td>' + htmlEscape(a.id) + '</td><td><strong>' + htmlEscape(a.name) + '</strong></td><td>' + htmlEscape(a.graduationYear||'') + '</td><td>' + htmlEscape(a.class||'') + '</td><td>' + htmlEscape(a.email||'') + (a.phone ? '<br><small>' + htmlEscape(a.phone) + '</small>' : '') + '</td><td>' + htmlEscape(a.occupation||'') + '</td><td>' + htmlEscape(a.organization||'') + '</td><td>' +
        '<button class="btn btn-sm btn-primary" onclick="showEditAlumniModal(\'' + a.id + '\')" title="Edit"><i class="fas fa-edit"></i></button> ' +
        '<button class="btn btn-sm btn-outline" onclick="deleteAlumni(\'' + a.id + '\')" title="Delete" style="color:var(--danger);"><i class="fas fa-trash"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
  }

  // Reunions section
  html += '<h3 style="font-size:18px;font-weight:600;margin:24px 0 12px;"><i class="fas fa-calendar-alt"></i> Reunion Events</h3>';
  var reunions = data.reunions || [];
  if (reunions.length === 0) {
    html += '<div class="empty-state" style="padding:12px;"><i class="fas fa-calendar-plus"></i><p>No reunion events planned</p></div>';
  } else {
    html += '<div style="overflow-x:auto;margin-bottom:24px;"><table class="tbl"><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Attendees</th><th>Organizer</th><th>Actions</th></tr></thead><tbody>';
    reunions.sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;}).forEach(function(r) {
      var attendees = r.attendees || [];
      html += '<tr><td><strong>' + htmlEscape(r.name) + '</strong></td><td>' + htmlEscape(r.date) + '</td><td>' + htmlEscape(r.venue||'') + '</td><td>' + attendees.length + ' alumni</td><td>' + htmlEscape(r.organizer||'') + '</td><td>' +
        '<button class="btn btn-sm btn-primary" onclick="showEditReunionModal(\'' + r.id + '\')" title="Edit"><i class="fas fa-edit"></i></button> ' +
        '<button class="btn btn-sm btn-outline" onclick="deleteReunion(\'' + r.id + '\')" title="Delete" style="color:var(--danger);"><i class="fas fa-trash"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
  }

  // Donations section
  html += '<h3 style="font-size:18px;font-weight:600;margin:24px 0 12px;"><i class="fas fa-hand-holding-usd"></i> Donation Records</h3>';
  var donations = data.donations || [];
  if (donations.length === 0) {
    html += '<div class="empty-state" style="padding:12px;"><i class="fas fa-donate"></i><p>No donations recorded yet</p></div>';
  } else {
    html += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>Donor</th><th>Amount</th><th>Date</th><th>Purpose</th><th>Notes</th><th>Actions</th></tr></thead><tbody>';
    donations.sort(function(a,b){return b.date<a.date?-1:b.date>a.date?1:0;}).forEach(function(d) {
      html += '<tr><td>' + htmlEscape(d.donorName||'') + '</td><td><strong>₦' + Number(d.amount||0).toLocaleString() + '</strong></td><td>' + htmlEscape(d.date) + '</td><td>' + htmlEscape(d.purpose||'') + '</td><td>' + htmlEscape(d.notes||'') + '</td><td>' +
        '<button class="btn btn-sm btn-outline" onclick="deleteDonation(\'' + d.id + '\')" title="Delete" style="color:var(--danger);"><i class="fas fa-trash"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
  }

  panel.innerHTML = html;
}

// ===== ADMIN: ADD/EDIT ALUMNI =====
function showAddAlumniModal() {
  _almEditId = null;
  openModal(_almFormHtml(null));
}

function showEditAlumniModal(id) {
  var rec = (data.alumni||[]).find(function(a){return a.id===id;});
  if (!rec) { toast('Alumni not found','error'); return; }
  _almEditId = id;
  openModal(_almFormHtml(rec));
}

function _almFormHtml(rec) {
  var isEdit = !!rec;
  return '<h3><i class="fas fa-user-graduate"></i> ' + (isEdit ? 'Edit' : 'Add') + ' Alumni Record</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Full Name *</label><input type="text" id="almName" value="' + htmlEscape(rec?rec.name:'') + '"></div>' +
    '<div class="form-group"><label>Student ID (optional)</label><input type="text" id="almSid" value="' + htmlEscape(rec?rec.studentId||'':'') + '"></div>' +
    '<div class="form-group"><label>Graduation Year</label><input type="text" id="almYear" value="' + htmlEscape(rec?rec.graduationYear||'':'') + '"></div>' +
    '<div class="form-group"><label>Last Class</label><input type="text" id="almClass" value="' + htmlEscape(rec?rec.class||'':'') + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="almEmail" value="' + htmlEscape(rec?rec.email||'':'') + '"></div>' +
    '<div class="form-group"><label>Phone</label><input type="text" id="almPhone" value="' + htmlEscape(rec?rec.phone||'':'') + '"></div>' +
    '<div class="form-group"><label>Occupation</label><input type="text" id="almOcc" value="' + htmlEscape(rec?rec.occupation||'':'') + '"></div>' +
    '<div class="form-group"><label>Organization</label><input type="text" id="almOrg" value="' + htmlEscape(rec?rec.organization||'':'') + '"></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAlumni()"><i class="fas fa-save"></i> ' + (isEdit?'Update':'Save') + '</button></div>';
}

function saveAlumni() {
  var name = document.getElementById('almName')?.value?.trim();
  if (!name) { toast('Name is required','warning'); return; }
  var rec = {
    id: _almEditId || genId('ALM'),
    studentId: document.getElementById('almSid')?.value?.trim() || '',
    name: name,
    graduationYear: document.getElementById('almYear')?.value?.trim() || '',
    class: document.getElementById('almClass')?.value?.trim() || '',
    email: document.getElementById('almEmail')?.value?.trim() || '',
    phone: document.getElementById('almPhone')?.value?.trim() || '',
    occupation: document.getElementById('almOcc')?.value?.trim() || '',
    organization: document.getElementById('almOrg')?.value?.trim() || '',
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  if (!data.alumni) data.alumni = [];
  if (_almEditId) {
    var idx = data.alumni.findIndex(function(a){return a.id===_almEditId;});
    if (idx!==-1) data.alumni[idx] = rec;
  } else {
    data.alumni.push(rec);
  }
  saveData();
  closeModal();
  renderAlumni();
  toast('Alumni ' + (_almEditId?'updated':'saved'));
}

function deleteAlumni(id) {
  showConfirmDialog('Delete Alumni', 'Remove this alumni record?', function() {
    data.alumni = (data.alumni||[]).filter(function(a){return a.id!==id;});
    saveData();
    renderAlumni();
    toast('Alumni deleted');
  }, 'danger');
}

// ===== ADMIN: REUNION COORDINATION =====
function showAddReunionModal() {
  openModal('<h3><i class="fas fa-calendar-plus"></i> New Reunion Event</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Event Name *</label><input type="text" id="reuName" placeholder="e.g. Class of 2020 Reunion"></div>' +
    '<div class="form-group"><label>Date</label><input type="date" id="reuDate"></div>' +
    '<div class="form-group"><label>Time</label><input type="time" id="reuTime"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Venue</label><input type="text" id="reuVenue" placeholder="e.g. School Hall"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Organizer</label><input type="text" id="reuOrg" placeholder="e.g. John Smith"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="reuDesc" rows="3" placeholder="Event details..."></textarea></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveReunion()"><i class="fas fa-save"></i> Create Event</button></div>');
}

function showEditReunionModal(id) {
  var rec = (data.reunions||[]).find(function(r){return r.id===id;});
  if (!rec) { toast('Reunion not found','error'); return; }
  _almReunionEditId = id;
  openModal('<h3><i class="fas fa-calendar-alt"></i> Edit Reunion Event</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Event Name *</label><input type="text" id="reuName" value="' + htmlEscape(rec.name) + '"></div>' +
    '<div class="form-group"><label>Date</label><input type="date" id="reuDate" value="' + htmlEscape(rec.date) + '"></div>' +
    '<div class="form-group"><label>Time</label><input type="time" id="reuTime" value="' + htmlEscape(rec.time||'') + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Venue</label><input type="text" id="reuVenue" value="' + htmlEscape(rec.venue||'') + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Organizer</label><input type="text" id="reuOrg" value="' + htmlEscape(rec.organizer||'') + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="reuDesc" rows="3">' + htmlEscape(rec.description||'') + '</textarea></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveReunion()"><i class="fas fa-save"></i> Update</button></div>');
}

function saveReunion() {
  var name = document.getElementById('reuName')?.value?.trim();
  if (!name) { toast('Event name is required','warning'); return; }
  var rec = {
    id: _almReunionEditId || genId('REU'),
    name: name,
    date: document.getElementById('reuDate')?.value || '',
    time: document.getElementById('reuTime')?.value || '',
    venue: document.getElementById('reuVenue')?.value?.trim() || '',
    organizer: document.getElementById('reuOrg')?.value?.trim() || '',
    description: document.getElementById('reuDesc')?.value?.trim() || '',
    attendees: _almReunionEditId ? ((data.reunions||[]).find(function(r){return r.id===_almReunionEditId;})?.attendees||[]) : []
  };
  if (!data.reunions) data.reunions = [];
  if (_almReunionEditId) {
    var idx = data.reunions.findIndex(function(r){return r.id===_almReunionEditId;});
    if (idx!==-1) { rec.attendees = data.reunions[idx].attendees || []; data.reunions[idx] = rec; }
  } else {
    data.reunions.push(rec);
  }
  saveData();
  closeModal();
  renderAlumni();
  var wasEdit = _almReunionEditId;
  toast('Reunion ' + (wasEdit ? 'updated' : 'created'));
  _almReunionEditId = null;
}

function deleteReunion(id) {
  showConfirmDialog('Delete Reunion', 'Remove this reunion event?', function() {
    data.reunions = (data.reunions||[]).filter(function(r){return r.id!==id;});
    saveData();
    renderAlumni();
    toast('Reunion deleted');
  }, 'danger');
}

// ===== ADMIN: DONATION TRACKING =====
function showDonationModal() {
  var alumniOpts = (data.alumni||[]).map(function(a){return '<option value="' + htmlEscape(a.id) + '">' + htmlEscape(a.name) + '</option>';}).join('');
  openModal('<h3><i class="fas fa-hand-holding-usd"></i> Record Donation</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Alumni (optional)</label><select id="donAlumniId"><option value="">Anonymous / Non-alumni</option>' + alumniOpts + '</select></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Donor Name *</label><input type="text" id="donName" placeholder="e.g. Alice Johnson"></div>' +
    '<div class="form-group"><label>Amount (₦) *</label><input type="number" id="donAmount" placeholder="0" min="0"></div>' +
    '<div class="form-group"><label>Date</label><input type="date" id="donDate"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Purpose</label><select id="donPurpose"><option value="General Fund">General Fund</option><option value="Scholarship">Scholarship</option><option value="Infrastructure">Infrastructure</option><option value="Sports">Sports</option><option value="Library">Library</option><option value="ICT">ICT</option><option value="Other">Other</option></select></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Notes</label><textarea id="donNotes" rows="2" placeholder="Optional notes..."></textarea></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDonation()"><i class="fas fa-save"></i> Record Donation</button></div>');
}

function saveDonation() {
  var name = document.getElementById('donName')?.value?.trim();
  var amount = parseFloat(document.getElementById('donAmount')?.value);
  if (!name) { toast('Donor name is required','warning'); return; }
  if (!amount || amount <= 0) { toast('Enter a valid amount','warning'); return; }
  var rec = {
    id: genId('DON'),
    alumniId: document.getElementById('donAlumniId')?.value || '',
    donorName: name,
    amount: amount,
    date: document.getElementById('donDate')?.value || new Date().toISOString().split('T')[0],
    purpose: document.getElementById('donPurpose')?.value || 'General Fund',
    notes: document.getElementById('donNotes')?.value?.trim() || ''
  };
  if (!data.donations) data.donations = [];
  data.donations.push(rec);
  saveData();
  closeModal();
  renderAlumni();
  toast('Donation recorded: ₦' + amount.toLocaleString());
}

function deleteDonation(id) {
  showConfirmDialog('Delete Donation', 'Remove this donation record?', function() {
    data.donations = (data.donations||[]).filter(function(d){return d.id!==id;});
    saveData();
    renderAlumni();
    toast('Donation deleted');
  }, 'danger');
}

// ===== ADMIN: CSV EXPORT =====
function exportAlumniCSV() {
  var list = data.alumni || [];
  if (!list.length) { toast('No alumni to export','warning'); return; }
  var rows = [['ID','Name','StudentID','GraduationYear','Class','Email','Phone','Occupation','Organization','LastUpdated']];
  list.forEach(function(a) {
    rows.push([a.id,a.name,a.studentId||'',a.graduationYear||'',a.class||'',a.email||'',a.phone||'',a.occupation||'',a.organization||'',a.lastUpdated||'']);
  });
  var csv = rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'alumni_directory.csv'; a.click();
  URL.revokeObjectURL(a.href);
  toast('Alumni CSV exported');
}

// ===== STUDENT: RENDER ALUMNI VIEW =====
function renderStudentAlumni() {
  var container = document.getElementById('stuAlumniView');
  if (!container) return;
  var s = currentStudent;
  if (!s) { container.innerHTML = '<p class="empty-state"><i class="fas fa-user-graduate"></i><p>Please log in to view alumni info</p></p>'; return; }

  var list = data.alumni || [];
  var myProfile = list.filter(function(a){return a.studentId===s.id;});
  var html = '';

  // My alumni profile
  html += '<h4 style="font-weight:600;margin:0 0 12px;"><i class="fas fa-id-card"></i> My Alumni Profile</h4>';
  if (myProfile.length) {
    var r = myProfile[0];
    html += '<div style="background:var(--card-bg);border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;gap:16px;align-items:center;margin-bottom:24px;">' +
      '<div style="width:64px;height:64px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;flex-shrink:0;">' + r.name.charAt(0).toUpperCase() + '</div>' +
      '<div style="flex:1;"><strong style="font-size:18px;">' + htmlEscape(r.name) + '</strong>' +
      '<p style="font-size:13px;color:var(--text-light);">Class of ' + htmlEscape(r.graduationYear||'N/A') + ' | ' + htmlEscape(r.class||'') + '</p>' +
      (r.occupation ? '<p style="font-size:14px;"><i class="fas fa-briefcase"></i> ' + htmlEscape(r.occupation) + (r.organization ? ' at ' + htmlEscape(r.organization) : '') + '</p>' : '') +
      (r.email ? '<p style="font-size:13px;color:var(--text-light);"><i class="fas fa-envelope"></i> ' + htmlEscape(r.email) + (r.phone ? ' | ' + htmlEscape(r.phone) : '') + '</p>' : '') +
      '</div>' +
      '<button class="btn btn-sm btn-primary" onclick="showEditAlumniModal(\'' + r.id + '\'); document.getElementById(\'almSidModal\') && document.getElementById(\'almSidModal\').remove();"><i class="fas fa-edit"></i> Update</button>' +
    '</div>';
  } else {
    html += '<div class="empty-state" style="margin-bottom:24px;"><i class="fas fa-user-graduate"></i><p>You do not have an alumni profile yet. <a href="javascript:;" onclick="showAddAlumniModal()" style="color:var(--primary);font-weight:600;">Create one now</a>.</p></div>';
  }

  // Upcoming reunions
  var reunions = (data.reunions||[]).filter(function(r){return r.date >= new Date().toISOString().split('T')[0];}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;});
  if (reunions.length) {
    html += '<h4 style="font-weight:600;margin:0 0 12px;"><i class="fas fa-calendar-alt"></i> Upcoming Reunions</h4>';
    html += '<div style="margin-bottom:24px;">';
    reunions.forEach(function(r) {
      var isAttending = (r.attendees||[]).indexOf(s.id) !== -1;
      html += '<div style="background:var(--card-bg);border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">' +
        '<div style="width:12px;height:12px;border-radius:50%;background:var(--success);flex-shrink:0;"></div>' +
        '<div style="flex:1;"><strong>' + htmlEscape(r.name) + '</strong><br><span style="font-size:13px;color:var(--text-light);">' + htmlEscape(r.date) + (r.time ? ' at ' + htmlEscape(r.time) : '') + (r.venue ? ' | ' + htmlEscape(r.venue) : '') + '</span></div>' +
        '<button class="btn btn-sm ' + (isAttending?'btn-primary':'btn-outline') + '" onclick="toggleReunionAttend(\'' + r.id + '\')">' + (isAttending ? '<i class="fas fa-check"></i> Attending' : '<i class="fas fa-plus"></i> RSVP') + '</button>' +
      '</div>';
    });
    html += '</div>';
  }

  // Alumni directory
  html += '<h4 style="font-weight:600;margin:0 0 12px;"><i class="fas fa-users"></i> Alumni Network (' + list.length + ')</h4>';
  if (list.length === 0) {
    html += '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>No alumni records yet</p></div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">';
    list.forEach(function(a) {
      html += '<div style="background:var(--card-bg);border:1px solid #e2e8f0;border-radius:12px;padding:16px;">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
          '<div style="width:40px;height:40px;border-radius:50%;background:' + (a.studentId===s.id?'var(--accent)':'var(--primary)') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">' + a.name.charAt(0).toUpperCase() + '</div>' +
          '<div><strong>' + htmlEscape(a.name) + '</strong>' + (a.graduationYear ? '<div style="font-size:12px;color:var(--text-light);">Class of ' + htmlEscape(a.graduationYear) + '</div>' : '') + '</div></div>' +
        (a.occupation ? '<div style="font-size:13px;margin-bottom:4px;"><i class="fas fa-briefcase" style="width:16px;color:var(--text-light);"></i> ' + htmlEscape(a.occupation) + (a.organization ? ' at ' + htmlEscape(a.organization) : '') + '</div>' : '') +
        (a.email ? '<div style="font-size:13px;"><i class="fas fa-envelope" style="width:16px;color:var(--text-light);"></i> ' + htmlEscape(a.email) + '</div>' : '') +
      '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function toggleReunionAttend(reunionId) {
  var r = (data.reunions||[]).find(function(e){return e.id===reunionId;});
  if (!r || !currentStudent) return;
  if (!r.attendees) r.attendees = [];
  var idx = r.attendees.indexOf(currentStudent.id);
  if (idx === -1) {
    r.attendees.push(currentStudent.id);
  } else {
    r.attendees.splice(idx, 1);
  }
  saveData();
  renderStudentAlumni();
  toast(idx === -1 ? 'RSVP confirmed' : 'RSVP cancelled');
}

// ===== GLOBALS =====
window.renderAlumni = renderAlumni;
window.renderStudentAlumni = renderStudentAlumni;
window.showAddAlumniModal = showAddAlumniModal;
window.showEditAlumniModal = showEditAlumniModal;
window.saveAlumni = saveAlumni;
window.deleteAlumni = deleteAlumni;
window.showAddReunionModal = showAddReunionModal;
window.showEditReunionModal = showEditReunionModal;
window.saveReunion = saveReunion;
window.deleteReunion = deleteReunion;
window.showDonationModal = showDonationModal;
window.saveDonation = saveDonation;
window.deleteDonation = deleteDonation;
window.exportAlumniCSV = exportAlumniCSV;
window.toggleReunionAttend = toggleReunionAttend;
