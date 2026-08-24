// EDUVERSE - Admin Portal Module
// Student, Teacher, Fees, Results, CAT, Activities, Attendance management

function renderDashboard() {
  var el;
  var today = new Date().toISOString().split('T')[0];
  var students = data.students || [];
  var todayAtt = (data.attendance || []).filter(function(a) { return a.date === today && a.status === 'present'; });
  var totalCollected = (data.fees || []).reduce(function(sum, f) { return sum + (f.paid || 0); }, 0);
  var scores = (data.results || []).map(function(r) { return r.score; });
  var recent = (data.activityLog || []).slice(-5).reverse();
  el = document.getElementById('dashStudents'); if (el) el.textContent = String(students.length);
  el = document.getElementById('dashPresent'); if (el) el.textContent = String(todayAtt.length);
  var dashCurrency = typeof getGatewayConfig === 'function' ? (getGatewayConfig().currency === 'NGN' ? '\u20A6' : getGatewayConfig().currency === 'USD' ? '$' : getGatewayConfig().currency + ' ') : '\u20A6';
  el = document.getElementById('dashFees'); if (el) el.textContent = dashCurrency + totalCollected;
  var avg = scores.length ? Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length) : 0;
  el = document.getElementById('dashAvgScore'); if (el) el.textContent = avg + '%';

  recent = (data.activityLog || []).slice(-5).reverse();
  var container = document.getElementById('recentActivity');
  if (container) {
    if (recent.length) {
      container.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' +
        recent.map(function(a) { return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f7fafc;border-radius:8px;font-size:13px;"><i class="fas fa-circle" style="font-size:6px;color:var(--accent);"></i> ' + htmlEscape(a) + '</div>'; }).join('') +
        '</div>';
    } else {
      container.innerHTML = '<p class="empty-state">No recent activity</p>';
    }
  }
  // Dashboard news widget
  _loadDashNews();
}

function _loadDashNews() {
  var widget = document.getElementById('dashNewsWidget');
  var dateEl = document.getElementById('dashNewsDate');
  if (!widget) return;
  widget.innerHTML = '<div class="loading-overlay active" style="display:flex;position:relative;min-height:100px;"><div class="loading-spinner"></div></div>';
  var loadedAny = false;
  var keys = ['scholarships', 'competitions', 'africa', 'americas', 'asia'];
  var collected = [];
  keys.forEach(function(k) {
    try {
      var cached = localStorage.getItem('_eduNews_' + k);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.items && parsed.items.length) {
          parsed.items.forEach(function(item) {
            if (!collected.some(function(c) { return c.title === item.title; })) {
              collected.push(item);
            }
          });
        }
      }
    } catch(e) {}
  });
  if (collected.length) {
    var sorted = collected.slice(0, 5);
    widget.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' +
      sorted.map(function(item) {
        return '<a href="' + htmlEscape(item.link) + '" target="_blank" rel="noopener" style="display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-radius:8px;text-decoration:none;color:inherit;transition:background 0.2s;" onmouseover="this.style.background=\'var(--hover-bg, #f7fafc)\'" onmouseout="this.style.background=\'transparent\'">' +
          '<div style="font-size:11px;color:var(--primary);white-space:nowrap;min-width:12px;"><i class="fas fa-newspaper"></i></div>' +
          '<div><div style="font-size:13px;font-weight:500;line-height:1.4;">' + htmlEscape(item.title) + '</div>' +
          '<div style="font-size:11px;color:var(--text-light);margin-top:2px;">' + htmlEscape(item.source) + ' &middot; ' + htmlEscape((item.pubDate || '').split(' ')[0]) + '</div></div></a>';
      }).join('') + '</div>';
    loadedAny = true;
  }
  if (!loadedAny) {
    _tryFetchDashNews(widget, dateEl);
  } else {
    var latestDate = collected.reduce(function(m, item) {
      var d = item.pubDate || '';
      return d > m ? d : m;
    }, '');
    if (dateEl) dateEl.textContent = latestDate ? new Date(latestDate).toLocaleDateString() : 'cached';
    // Refresh cache if older than 30 min
    var oldestTs = Infinity;
    keys.forEach(function(k) {
      try {
        var cached = localStorage.getItem('_eduNews_' + k);
        if (cached) {
          var parsed = JSON.parse(cached);
          if (parsed && parsed.ts) oldestTs = Math.min(oldestTs, parsed.ts);
        }
      } catch(e) {}
    });
    if (oldestTs < Date.now() - 1800000) {
      _tryFetchDashNews(widget, dateEl);
    }
  }
}

function _tryFetchDashNews(widget, dateEl) {
  if (!widget) widget = document.getElementById('dashNewsWidget');
  if (!dateEl) dateEl = document.getElementById('dashNewsDate');
  var feedUrl = 'https://news.google.com/rss/search?q=education+school+scholarships+students+2026&hl=en-US&gl=US&ceid=US:en';
  var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl) + '&api_key=ustkz6qg6w4jbmzkwcferwcrv2cjjbtvv89htnni&count=5';
  fetch(proxyUrl).then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.items && data.items.length) {
      var items = data.items.slice(0, 5).map(function(item) { return { title: item.title, link: item.link, pubDate: item.pubDate, source: item.source || item.author || 'Google News' }; });
      widget.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' +
        items.map(function(item) {
          return '<a href="' + htmlEscape(item.link) + '" target="_blank" rel="noopener" style="display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-radius:8px;text-decoration:none;color:inherit;transition:background 0.2s;" onmouseover="this.style.background=\'var(--hover-bg, #f7fafc)\'" onmouseout="this.style.background=\'transparent\'">' +
            '<div style="font-size:11px;color:var(--primary);white-space:nowrap;min-width:12px;"><i class="fas fa-newspaper"></i></div>' +
            '<div><div style="font-size:13px;font-weight:500;line-height:1.4;">' + htmlEscape(item.title) + '</div>' +
            '<div style="font-size:11px;color:var(--text-light);margin-top:2px;">' + htmlEscape(item.source) + ' &middot; ' + htmlEscape((item.pubDate || '').split(' ')[0]) + '</div></div></a>';
        }).join('') + '</div>';
      try { localStorage.setItem('_eduNews_all', JSON.stringify({ ts: Date.now(), items: items })); } catch(e) {}
    } else {
      widget.innerHTML = '<p class="empty-state" style="margin:0;padding:8px;">Could not load news</p>';
    }
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString();
  }).catch(function() {
    widget.innerHTML = '<p class="empty-state" style="margin:0;padding:8px;">News unavailable offline</p>';
  });
}

// ===== STUDENTS =====
function renderStudents() {
  var q = '';
  var searchEl = document.getElementById('studentSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var filtered = (data.students || []).filter(function(s) { return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q); });
  var tbody = document.getElementById('studentsTable');
  var empty = document.getElementById('studentsEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(s) { return '<tr><td><strong>' + htmlEscape(s.id) + '</strong></td><td>' + htmlEscape(s.name) + '</td><td>' + htmlEscape(s.class) + '</td><td>' + htmlEscape(s.contact) + '</td><td>' + htmlEscape(s.username || '-') + '</td><td><span style="font-family:monospace;">' + htmlEscape(s.password || '-') + '</span></td><td><button class="btn btn-sm btn-primary" onclick="showEditStudentModal(\'' + htmlEscape(s.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-info" onclick="showEditStudentCredsModal(\'' + htmlEscape(s.id) + '\')"><i class="fas fa-key"></i></button> <button class="btn btn-sm btn-success" onclick="sendStudentCredsToParent(\'' + htmlEscape(s.id) + '\')"><i class="fas fa-envelope"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' + htmlEscape(s.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>'; }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showAddStudentModal() {
  const autoId = genId('STU');
  openModal(`
    <h3><i class="fas fa-user-plus"></i> Add New Student</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student ID <span style="font-size:11px;color:var(--text-light);">(auto-generated)</span></label><input type="text" id="fStudentId" value="${autoId}" readonly style="background:#f7fafc;"></div>
      <div class="form-group"><label>Full Name</label><input type="text" id="fStudentName" placeholder="Full name"></div>
      <div class="form-group"><label>Class</label><input type="text" id="fStudentClass" placeholder="e.g. Basic 5A"></div>
      <div class="form-group"><label>Contact</label><input type="text" id="fStudentContact" placeholder="Email or phone"></div>
      <div class="form-group"><label>Username</label><input type="text" id="fStudentUsername" placeholder="login username"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fStudentPassword" placeholder="login password" value="stu123"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStudent()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveStudent() {
  const id = document.getElementById('fStudentId').value.trim();
  const name = document.getElementById('fStudentName').value.trim();
  const cls = document.getElementById('fStudentClass').value.trim();
  const contact = document.getElementById('fStudentContact').value.trim();
  const username = document.getElementById('fStudentUsername').value.trim();
  const password = document.getElementById('fStudentPassword').value.trim();
  if (!id || !name || !cls) { toast('Please fill all required fields', 'error'); return; }
  data.students.push({ id, name, class: cls, contact, username: username || name.toLowerCase().replace(/\s+/g, '.'), password: password || 'stu123' });
  saveData();
  logActivity(`Added student ${name} (${id})`);
  if (typeof window.ensureFirebaseUser === 'function' && contact && contact.indexOf('@') !== -1) {
    window.ensureFirebaseUser(contact, password || 'stu123', name, 'student', null, id).catch(function(_err) {});
  }
  closeModal();
  renderStudents();
  toast(`Student ${name} added successfully`);
}

function showEditStudentModal(id) {
  const s = getStudent(id);
  if (!s) return;
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Student</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student ID</label><input type="text" id="fStudentId" value="${htmlEscape(s.id)}" readonly style="background:#f7fafc;"></div>
      <div class="form-group"><label>Full Name</label><input type="text" id="fStudentName" value="${htmlEscape(s.name)}"></div>
      <div class="form-group"><label>Class</label><input type="text" id="fStudentClass" value="${htmlEscape(s.class)}"></div>
      <div class="form-group"><label>Contact</label><input type="text" id="fStudentContact" value="${htmlEscape(s.contact)}"></div>
      <div class="form-group"><label>Username</label><input type="text" id="fStudentUsername" value="${htmlEscape(s.username || '')}"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fStudentPassword" value="${htmlEscape(s.password || '')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateStudent('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateStudent(id) {
  const s = getStudent(id);
  if (!s) return;
  s.name = document.getElementById('fStudentName').value.trim();
  s.class = document.getElementById('fStudentClass').value.trim();
  s.contact = document.getElementById('fStudentContact').value.trim();
  s.username = document.getElementById('fStudentUsername').value.trim() || s.username;
  s.password = document.getElementById('fStudentPassword').value.trim() || s.password;
  if (!s.name || !s.class) { toast('Please fill all required fields', 'error'); return; }
  saveData();
  logActivity(`Updated student ${s.name} (${id})`);
  closeModal();
  renderStudents();
  toast('Student updated successfully');
}

function deleteStudent(id) {
  if (!confirm('Delete this student? This will also remove related records.')) return;
  const s = getStudent(id);
  data.students = (data.students || []).filter(st => st.id !== id);
  data.fees = (data.fees || []).filter(f => f.studentId !== id);
  data.results = (data.results || []).filter(r => r.studentId !== id);
  data.cat = (data.cat || []).filter(c => c.studentId !== id);
  data.attendance = (data.attendance || []).filter(a => a.studentId !== id);
  saveData();
  logActivity(`Deleted student ${s?.name || id}`);
  renderStudents();
  toast('Student deleted');
}

// ===== TEACHERS (Admin CRUD) =====
function renderTeachers() {
  var q = '';
  var searchEl = document.getElementById('teacherSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var filtered = (data.teachers || []).filter(function(t) { return t.name.toLowerCase().includes(q) || (t.assignedClass || '').toLowerCase().includes(q) || t.id.toLowerCase().includes(q); });
  var tbody = document.getElementById('teachersTable');
  var empty = document.getElementById('teachersEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(t) { return '<tr><td><strong>' + htmlEscape(t.id) + '</strong></td><td>' + htmlEscape(t.name) + '</td><td>' + htmlEscape(t.email) + '</td><td>' + htmlEscape(t.username || '-') + '</td><td><span class="badge" style="background:#bee3f8;color:#2a4365;">' + htmlEscape(t.assignedClass) + '</span></td><td><button class="btn btn-sm btn-primary" onclick="showEditTeacherModal(\'' + htmlEscape(t.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-info" onclick="showEditTeacherCredsModal(\'' + htmlEscape(t.id) + '\')"><i class="fas fa-key"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' + htmlEscape(t.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>'; }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showEditStudentCredsModal(id) {
  const s = getStudent(id);
  if (!s) return;
  openModal(`
    <h3><i class="fas fa-key"></i> Student Credentials — ${htmlEscape(s.id)}</h3>
    <div class="form-grid">
      <div class="form-group"><label>Username</label><input type="text" id="fCredUsername" value="${htmlEscape(s.username || '')}"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fCredPassword" value="${htmlEscape(s.password || '')}"></div>
    </div>
    <p style="font-size:13px;color:var(--text-light);margin:8px 0 16px;">Leave blank to auto-generate</p>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStudentCreds('${htmlEscape(id)}')"><i class="fas fa-save"></i> Save</button>
      <button class="btn btn-info" onclick="autoGenerateStudentCreds('${htmlEscape(id)}')"><i class="fas fa-magic"></i> Auto-Generate</button>
    </div>
  `);
}

function autoGenerateStudentCreds(id) {
  const s = getStudent(id);
  if (!s) return;
  const base = s.name.toLowerCase().replace(/\s+/g, '.');
  document.getElementById('fCredUsername').value = base;
  document.getElementById('fCredPassword').value = s.id.toLowerCase();
}

function saveStudentCreds(id) {
  const s = getStudent(id);
  if (!s) return;
  const u = document.getElementById('fCredUsername').value.trim();
  const p = document.getElementById('fCredPassword').value.trim();
  s.username = u || s.name.toLowerCase().replace(/\s+/g, '.');
  s.password = p || s.id.toLowerCase();
  saveData();
  logActivity(`Updated credentials for ${s.name} (${id})`);
  closeModal();
  renderStudents();
  toast(`Credentials updated for ${s.name}`);
}

function showEditTeacherCredsModal(id) {
  const t = getTeacher(id);
  if (!t) return;
  openModal(`
    <h3><i class="fas fa-key"></i> Teacher Credentials — ${htmlEscape(t.id)}</h3>
    <div class="form-grid">
      <div class="form-group"><label>Username</label><input type="text" id="fCredUsername" value="${htmlEscape(t.username || '')}"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fCredPassword" value="${htmlEscape(t.password || '')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTeacherCreds('${htmlEscape(id)}')"><i class="fas fa-save"></i> Save</button>
      <button class="btn btn-info" onclick="autoGenerateTeacherCreds('${htmlEscape(id)}')"><i class="fas fa-magic"></i> Auto-Generate</button>
    </div>
  `);
}

function autoGenerateTeacherCreds(id) {
  const t = getTeacher(id);
  if (!t) return;
  document.getElementById('fCredUsername').value = t.name.toLowerCase().replace(/\s+/g, '.');
  document.getElementById('fCredPassword').value = t.id.toLowerCase();
}

function saveTeacherCreds(id) {
  const t = getTeacher(id);
  if (!t) return;
  const u = document.getElementById('fCredUsername').value.trim();
  const p = document.getElementById('fCredPassword').value.trim();
  t.username = u || t.name.toLowerCase().replace(/\s+/g, '.');
  t.password = p || t.id.toLowerCase();
  saveData();
  logActivity(`Updated credentials for ${t.name} (${id})`);
  closeModal();
  renderTeachers();
  toast(`Credentials updated for ${t.name}`);
}

function sendStudentCredsToParent(id) {
  const s = getStudent(id);
  if (!s) return;
  if (!s.username || !s.password) {
    s.username = s.username || s.name.toLowerCase().replace(/\s+/g, '.');
    s.password = s.password || s.id.toLowerCase();
    saveData();
  }
  const parent = (data.parents || []).find(p => Array.isArray(p.studentIds) && p.studentIds.includes(id));
  if (!parent) {
    toast(`No parent linked to ${s.name}. Add a parent with studentIds including ${id}.`, 'warning');
    return;
  }
  const msg = `Login credentials for ${s.name} (${s.id}) — Username: ${s.username}, Password: ${s.password}.`;
  if (typeof addNotification === 'function') {
    addNotification(parent.email, 'credentials', msg);
  } else {
    if (!data.notifications) data.notifications = [];
    data.notifications.push({ id: genId('NOT'), to: parent.email, type: 'credentials', message: msg, date: new Date().toISOString().split('T')[0], read: false });
  }
  saveData();
  logActivity(`Sent credentials for ${s.name} (${id}) to parent ${parent.email}`);
  renderStudents();
  toast(`Credentials sent to ${parent.email}`);
}

function showAddTeacherModal() {
  const classOpts = [...new Set((data.students || []).map(s => s.class))].map(c => `<option value="${htmlEscape(c)}">${htmlEscape(c)}</option>`).join('');
  const autoId = genId('TCH');
  openModal(`
    <h3><i class="fas fa-chalkboard-teacher"></i> Add New Teacher</h3>
    <div class="form-grid">
      <div class="form-group"><label>Teacher ID <span style="font-size:11px;color:var(--text-light);">(auto-generated)</span></label><input type="text" id="fTeacherId" value="${autoId}" readonly style="background:#f7fafc;"></div>
      <div class="form-group"><label>Full Name</label><input type="text" id="fTeacherName" placeholder="Full name"></div>
      <div class="form-group"><label>Email</label><input type="email" id="fTeacherEmail" placeholder="email@school.com"></div>
      <div class="form-group"><label>Username</label><input type="text" id="fTeacherUsername" placeholder="login username"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fTeacherPass" value="teacher123"></div>
      <div class="form-group"><label>Assigned Class</label><select id="fTeacherClass">${classOpts}</select></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTeacher()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveTeacher() {
  const id = document.getElementById('fTeacherId').value.trim();
  const name = document.getElementById('fTeacherName').value.trim();
  const email = document.getElementById('fTeacherEmail').value.trim();
  const username = document.getElementById('fTeacherUsername').value.trim();
  const password = document.getElementById('fTeacherPass').value.trim();
  const assignedClass = document.getElementById('fTeacherClass').value;
  if (!id || !name || !email || !password) { toast('Please fill all fields', 'error'); return; }
  data.teachers.push({ id, name, email, password, username: username || name.toLowerCase().replace(/\s+/g, '.'), assignedClass });
  saveData();
  logActivity(`Added teacher ${name} (${id}) for ${assignedClass}`);
  if (typeof window.ensureFirebaseUser === 'function' && email) {
    window.ensureFirebaseUser(email, password, name, 'teacher', null, id).catch(function(_err) {});
  }
  closeModal();
  renderTeachers();
  toast(`Teacher ${name} added`);
}

function showEditTeacherModal(id) {
  const t = getTeacher(id);
  if (!t) return;
  const classOpts = [...new Set((data.students || []).map(s => s.class))].map(c => `<option value="${htmlEscape(c)}" ${c === t.assignedClass ? 'selected' : ''}>${htmlEscape(c)}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Teacher</h3>
    <div class="form-grid">
      <div class="form-group"><label>Teacher ID</label><input type="text" id="fTeacherId" value="${htmlEscape(t.id)}" readonly style="background:#f7fafc;"></div>
      <div class="form-group"><label>Full Name</label><input type="text" id="fTeacherName" value="${htmlEscape(t.name)}"></div>
      <div class="form-group"><label>Email</label><input type="email" id="fTeacherEmail" value="${htmlEscape(t.email)}"></div>
      <div class="form-group"><label>Username</label><input type="text" id="fTeacherUsername" value="${htmlEscape(t.username || '')}"></div>
      <div class="form-group"><label>Password</label><input type="text" id="fTeacherPass" value="${htmlEscape(t.password)}"></div>
      <div class="form-group"><label>Assigned Class</label><select id="fTeacherClass">${classOpts}</select></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateTeacher('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateTeacher(id) {
  const t = getTeacher(id);
  if (!t) return;
  t.name = document.getElementById('fTeacherName').value.trim();
  t.email = document.getElementById('fTeacherEmail').value.trim();
  t.username = document.getElementById('fTeacherUsername').value.trim() || t.username;
  t.password = document.getElementById('fTeacherPass').value.trim();
  t.assignedClass = document.getElementById('fTeacherClass').value;
  saveData();
  logActivity(`Updated teacher ${t.name} (${id})`);
  closeModal();
  renderTeachers();
  toast('Teacher updated');
}

function deleteTeacher(id) {
  if (!confirm('Delete this teacher?')) return;
  data.teachers = (data.teachers || []).filter(t => t.id !== id);
  saveData();
  renderTeachers();
  toast('Teacher deleted');
}

// ===== FEES =====
// ===== FEE CONFIGURATION =====
function renderFeeConfig() {
  var cfg = data.feeConfig || {};
  var container = document.getElementById('feeConfigContainer');
  if (!container) return;
  container.innerHTML = '<div class="card" style="margin-bottom:16px;padding:20px;">' +
    '<h3 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-cog"></i> Fee Configuration</h3>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">' +
      '<div class="form-group"><label>Fee Amount (₦)</label><input type="number" id="fCfgAmount" value="' + (cfg.amount || '') + '" min="0" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;width:100%;box-sizing:border-box;"></div>' +
      '<div class="form-group"><label>Payment Window Start</label><input type="date" id="fCfgStart" value="' + (cfg.windowStart || '') + '" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;width:100%;box-sizing:border-box;"></div>' +
      '<div class="form-group"><label>Payment Window End</label><input type="date" id="fCfgEnd" value="' + (cfg.windowEnd || '') + '" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;width:100%;box-sizing:border-box;"></div>' +
      '<div class="form-group"><label>Current Term</label><input type="text" id="fCfgTerm" value="' + htmlEscape(cfg.currentTerm || data.currentTerm || '') + '" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;width:100%;box-sizing:border-box;"></div>' +
      '<div class="form-group"><label>Partial Pay Grace (days)</label><input type="number" id="fCfgGrace" value="' + (cfg.partPaymentGraceDays || 7) + '" min="0" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;width:100%;box-sizing:border-box;"><span style="font-size:11px;color:var(--text-light);">Days portal stays open after a partial payment</span></div>' +
      '<div class="form-group"><label>&nbsp;</label><button class="btn btn-primary btn-sm" onclick="saveFeeConfig()" style="width:100%;"><i class="fas fa-save"></i> Save Config</button></div>' +
    '</div>' +
    '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button class="btn btn-outline btn-sm" onclick="applyFeeToAllStudents()"><i class="fas fa-users"></i> Apply Amount to All Students</button>' +
      '<span style="font-size:12px;color:var(--text-light);align-self:center;">Creates fee records for all students without one for this term</span>' +
    '</div>' +
    '<div id="feeApplyResult" style="margin-top:8px;font-size:13px;"></div>' +
  '</div>';
}

function saveFeeConfig() {
  var amount = parseFloat(document.getElementById('fCfgAmount').value);
  var windowStart = document.getElementById('fCfgStart').value;
  var windowEnd = document.getElementById('fCfgEnd').value;
  var currentTerm = document.getElementById('fCfgTerm').value.trim();
  var graceDays = parseInt(document.getElementById('fCfgGrace').value) || 7;
  if (isNaN(amount) || amount <= 0) { toast('Enter a valid fee amount', 'error'); return; }
  data.feeConfig = {
    amount: amount,
    windowStart: windowStart,
    windowEnd: windowEnd,
    enabled: !!(windowStart && windowEnd),
    currentTerm: currentTerm || data.currentTerm || 'Term 1',
    partPaymentGraceDays: graceDays
  };
  saveData();
  renderFeeConfig();
  toast('Fee configuration saved');
}

function applyFeeToAllStudents() {
  var cfg = data.feeConfig;
  if (!cfg || !cfg.amount) { toast('Save fee configuration first', 'error'); return; }
  var term = cfg.currentTerm || data.currentTerm || 'Term 1';
  var count = 0;
  (data.students || []).forEach(function(s) {
    var existing = (data.fees || []).find(function(f) { return f.studentId === s.id && f.term === term; });
    if (!existing) {
      if (!data.fees) data.fees = [];
      data.fees.push({ id: genId('FEE'), studentId: s.id, term: term, amount: cfg.amount, paid: 0, status: 'pending' });
      count++;
    }
  });
  var el = document.getElementById('feeApplyResult');
  if (el) el.innerHTML = '<span style="color:var(--success);">✓ Created ' + count + ' fee record(s) for ' + term + '</span>';
  saveData();
  renderFees();
  toast('Applied fee to ' + count + ' student(s)');
}

function renderFees() {
  renderFeeConfig();
  var q = '';
  var searchEl = document.getElementById('feeSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var statusFilter = '';
  var filterEl = document.getElementById('feeStatusFilter');
  if (filterEl) statusFilter = filterEl.value;
  var filtered = (data.fees || []).map(function(f) { var st = getStudent(f.studentId); return { id: f.id, studentId: f.studentId, term: f.term, amount: f.amount, paid: f.paid, status: f.status, student: st }; })
    .filter(function(f) { return f.student && (f.student.name.toLowerCase().includes(q) || f.studentId.toLowerCase().includes(q)); });
  if (statusFilter !== 'all') filtered = filtered.filter(function(f) { return f.status === statusFilter; });
  var tbody = document.getElementById('feesTable');
  var empty = document.getElementById('feesEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(f) {
      var balance = f.amount - f.paid;
      var badgeClass = f.status === 'paid' ? 'badge-paid' : f.status === 'partial' ? 'badge-partial' : 'badge-absent';
      return '<tr><td>' + htmlEscape(f.student.name) + ' (' + htmlEscape(f.studentId) + ')</td><td>' + htmlEscape(f.term) + '</td><td>$' + htmlEscape(f.amount) + '</td><td>$' + htmlEscape(f.paid) + '</td><td>$' + htmlEscape(Math.max(0, balance)) + '</td><td><span class="badge ' + badgeClass + '">' + htmlEscape(f.status) + '</span></td><td><button class="btn btn-sm btn-primary" onclick="showEditFeeModal(\'' + htmlEscape(f.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteFee(\'' + htmlEscape(f.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showAddFeeModal() {
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}">${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Record Fee Payment</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fFeeStudent">${opts}</select></div>
      <div class="form-group"><label>Term</label><input type="text" id="fFeeTerm" placeholder="e.g. Term 1 2026" value="Term 2 2026"></div>
      <div class="form-group"><label>Total Amount ($)</label><input type="number" id="fFeeAmount" placeholder="500" min="0"></div>
      <div class="form-group"><label>Amount Paid ($)</label><input type="number" id="fFeePaid" placeholder="500" min="0"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveFee()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveFee() {
  const studentId = document.getElementById('fFeeStudent').value;
  const term = document.getElementById('fFeeTerm').value.trim();
  const amount = parseFloat(document.getElementById('fFeeAmount').value);
  const paid = parseFloat(document.getElementById('fFeePaid').value);
  if (!term || isNaN(amount) || isNaN(paid)) { toast('Please fill all fields correctly', 'error'); return; }
  const status = paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'pending';
  if (!data.fees) data.fees = [];
  var today = new Date().toISOString().split('T')[0];
  data.fees.push({ id: genId('FEE'), studentId, term, amount, paid, status, lastPaymentDate: paid > 0 ? today : undefined });
  saveData();
  logActivity(`Recorded fee for ${getStudent(studentId)?.name}: $${paid} paid`);
  closeModal();
  renderFees();
  toast('Fee record added');
}

function showEditFeeModal(id) {
  const f = (data.fees || []).find(f => f.id === id);
  if (!f) return;
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}" ${s.id === f.studentId ? 'selected' : ''}>${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Fee Record</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fFeeStudent">${opts}</select></div>
      <div class="form-group"><label>Term</label><input type="text" id="fFeeTerm" value="${htmlEscape(f.term)}"></div>
      <div class="form-group"><label>Total Amount ($)</label><input type="number" id="fFeeAmount" value="${htmlEscape(f.amount)}" min="0"></div>
      <div class="form-group"><label>Amount Paid ($)</label><input type="number" id="fFeePaid" value="${htmlEscape(f.paid)}" min="0"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateFee('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateFee(id) {
  const f = (data.fees || []).find(f => f.id === id);
  if (!f) return;
  f.studentId = document.getElementById('fFeeStudent').value;
  f.term = document.getElementById('fFeeTerm').value.trim();
  f.amount = parseFloat(document.getElementById('fFeeAmount').value);
  f.paid = parseFloat(document.getElementById('fFeePaid').value);
  f.status = f.paid >= f.amount ? 'paid' : f.paid > 0 ? 'partial' : 'pending';
  if (f.paid > 0) f.lastPaymentDate = new Date().toISOString().split('T')[0];
  saveData();
  closeModal();
  renderFees();
  toast('Fee record updated');
  try { if (typeof addNotification === 'function') addNotification(f.studentId, 'fee', 'Fee status updated to: ' + f.status + ' ($' + f.paid + ' paid of $' + f.amount + ')'); } catch(e) {}
}

function deleteFee(id) {
  if (!confirm('Delete this fee record?')) return;
  data.fees = (data.fees || []).filter(f => f.id !== id);
  saveData();
  renderFees();
  toast('Fee record deleted');
}

// ===== RESULTS =====
function renderResults() {
  var q = '';
  var searchEl = document.getElementById('resultSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var filtered = (data.results || []).map(function(r) { var st = getStudent(r.studentId); return { id: r.id, studentId: r.studentId, subject: r.subject, score: r.score, grade: r.grade, term: r.term, student: st }; })
    .filter(function(r) { return r.student && (r.student.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q)); });
  var tbody = document.getElementById('resultsTable');
  var empty = document.getElementById('resultsEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(r) {
      var bg = r.score >= 80 ? '#c6f6d5' : r.score >= 60 ? '#fefcbf' : '#fed7d7';
      var fg = r.score >= 80 ? '#22543d' : r.score >= 60 ? '#744210' : '#9b2c2c';
      return '<tr><td>' + htmlEscape(r.student.name) + ' (' + htmlEscape(r.studentId) + ')</td><td>' + htmlEscape(r.subject) + '</td><td><strong>' + htmlEscape(r.score) + '</strong></td><td><span class="badge" style="background:' + bg + ';color:' + fg + ';">' + htmlEscape(r.grade) + '</span></td><td>' + htmlEscape(r.term) + '</td><td><button class="btn btn-sm btn-primary" onclick="showEditResultModal(\'' + htmlEscape(r.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteResult(\'' + htmlEscape(r.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showAddResultModal() {
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}">${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art'];
  const subOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Add Exam Result</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fResStudent">${opts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fResSubject">${subOpts}</select></div>
      <div class="form-group"><label>Score (0-100)</label><input type="number" id="fResScore" min="0" max="100" placeholder="85"></div>
      <div class="form-group"><label>Term</label><input type="text" id="fResTerm" placeholder="e.g. Term 1 2026" value="Term 2 2026"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveResult()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveResult() {
  const studentId = document.getElementById('fResStudent').value;
  const subject = document.getElementById('fResSubject').value;
  const score = parseInt(document.getElementById('fResScore').value);
  const term = document.getElementById('fResTerm').value.trim();
  if (!subject || isNaN(score)) { toast('Please fill all fields correctly', 'error'); return; }
  const grade = getGrade(score);
  if (!data.results) data.results = [];
  data.results.push({ id: genId('RES'), studentId, subject, score, grade, term });
  saveData();
  logActivity(`Added result: ${getStudent(studentId)?.name} scored ${score} in ${subject}`);
  closeModal();
  renderResults();
  toast('Result added');
  try { if (typeof addNotification === 'function') addNotification(studentId, 'result', 'New result posted: ' + subject + ' - ' + score + ' (' + grade + ')'); } catch(e) {}
}

function showEditResultModal(id) {
  const r = (data.results || []).find(r => r.id === id);
  if (!r) return;
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}" ${s.id === r.studentId ? 'selected' : ''}>${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art'];
  const subOpts = subjects.map(s => `<option value="${s}" ${s === r.subject ? 'selected' : ''}>${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Result</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fResStudent">${opts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fResSubject">${subOpts}</select></div>
      <div class="form-group"><label>Score (0-100)</label><input type="number" id="fResScore" min="0" max="100" value="${htmlEscape(r.score)}"></div>
      <div class="form-group"><label>Term</label><input type="text" id="fResTerm" value="${htmlEscape(r.term)}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateResult('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateResult(id) {
  const r = (data.results || []).find(r => r.id === id);
  if (!r) return;
  r.studentId = document.getElementById('fResStudent').value;
  r.subject = document.getElementById('fResSubject').value;
  r.score = parseInt(document.getElementById('fResScore').value);
  r.grade = getGrade(r.score);
  r.term = document.getElementById('fResTerm').value.trim();
  saveData();
  closeModal();
  renderResults();
  toast('Result updated');
}

function deleteResult(id) {
  if (!confirm('Delete this result?')) return;
  data.results = (data.results || []).filter(r => r.id !== id);
  saveData();
  renderResults();
  toast('Result deleted');
}

// ===== CAT =====
function renderCAT() {
  var q = '';
  var searchEl = document.getElementById('catSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var filtered = (data.cat || []).map(function(c) { var st = getStudent(c.studentId); return { id: c.id, studentId: c.studentId, subject: c.subject, test1: c.test1, test2: c.test2, test3: c.test3, student: st, avg: Math.round((c.test1 + c.test2 + c.test3) / 3) }; })
    .filter(function(c) { return c.student && (c.student.name.toLowerCase().includes(q) || c.studentId.toLowerCase().includes(q)); });
  var tbody = document.getElementById('catTable');
  var empty = document.getElementById('catEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(c) { return '<tr><td>' + htmlEscape(c.student.name) + ' (' + htmlEscape(c.studentId) + ')</td><td>' + htmlEscape(c.subject) + '</td><td>' + htmlEscape(c.test1) + '/20</td><td>' + htmlEscape(c.test2) + '/20</td><td>' + htmlEscape(c.test3) + '/20</td><td><strong>' + htmlEscape(c.avg) + '/20</strong></td><td><button class="btn btn-sm btn-primary" onclick="showEditCatModal(\'' + htmlEscape(c.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteCat(\'' + htmlEscape(c.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>'; }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showAddCatModal() {
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}">${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art'];
  const subOpts = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Add CAT Scores</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fCatStudent">${opts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fCatSubject">${subOpts}</select></div>
      <div class="form-group"><label>Test 1 (/20)</label><input type="number" id="fCat1" min="0" max="20" placeholder="15"></div>
      <div class="form-group"><label>Test 2 (/20)</label><input type="number" id="fCat2" min="0" max="20" placeholder="16"></div>
      <div class="form-group"><label>Test 3 (/20)</label><input type="number" id="fCat3" min="0" max="20" placeholder="17"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCat()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveCat() {
  const studentId = document.getElementById('fCatStudent').value;
  const subject = document.getElementById('fCatSubject').value;
  const t1 = parseInt(document.getElementById('fCat1').value) || 0;
  const t2 = parseInt(document.getElementById('fCat2').value) || 0;
  const t3 = parseInt(document.getElementById('fCat3').value) || 0;
  if (!data.cat) data.cat = [];
  data.cat.push({ id: genId('CAT'), studentId, subject, test1: t1, test2: t2, test3: t3 });
  saveData();
  logActivity(`Added CAT scores for ${getStudent(studentId)?.name} in ${subject}`);
  closeModal();
  renderCAT();
  toast('CAT scores added');
}

function showEditCatModal(id) {
  const c = (data.cat || []).find(c => c.id === id);
  if (!c) return;
  const opts = (data.students || []).map(s => `<option value="${htmlEscape(s.id)}" ${s.id === c.studentId ? 'selected' : ''}>${htmlEscape(s.name)} (${htmlEscape(s.id)})</option>`).join('');
  const subjects = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Literature','French','Computer Science','Art'];
  const subOpts = subjects.map(s => `<option value="${s}" ${s === c.subject ? 'selected' : ''}>${s}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit CAT Scores</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fCatStudent">${opts}</select></div>
      <div class="form-group"><label>Subject</label><select id="fCatSubject">${subOpts}</select></div>
      <div class="form-group"><label>Test 1 (/20)</label><input type="number" id="fCat1" min="0" max="20" value="${htmlEscape(c.test1)}"></div>
      <div class="form-group"><label>Test 2 (/20)</label><input type="number" id="fCat2" min="0" max="20" value="${htmlEscape(c.test2)}"></div>
      <div class="form-group"><label>Test 3 (/20)</label><input type="number" id="fCat3" min="0" max="20" value="${htmlEscape(c.test3)}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateCat('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateCat(id) {
  const c = (data.cat || []).find(c => c.id === id);
  if (!c) return;
  c.studentId = document.getElementById('fCatStudent').value;
  c.subject = document.getElementById('fCatSubject').value;
  c.test1 = parseInt(document.getElementById('fCat1').value) || 0;
  c.test2 = parseInt(document.getElementById('fCat2').value) || 0;
  c.test3 = parseInt(document.getElementById('fCat3').value) || 0;
  saveData();
  closeModal();
  renderCAT();
  toast('CAT scores updated');
}

function deleteCat(id) {
  if (!confirm('Delete this CAT record?')) return;
  data.cat = (data.cat || []).filter(c => c.id !== id);
  saveData();
  renderCAT();
  toast('CAT record deleted');
}

// ===== ACTIVITIES =====
function renderActivities() {
  var tbody = document.getElementById('activitiesTable');
  var empty = document.getElementById('activitiesEmpty');
  if (!tbody || !empty) return;
  if ((data.activities || []).length) {
    tbody.innerHTML = (data.activities || []).map(function(a) { return '<tr><td><strong>' + htmlEscape(a.name) + '</strong></td><td><span class="badge" style="background:#bee3f8;color:#2a4365;">' + htmlEscape(a.type) + '</span></td><td>' + htmlEscape(a.day) + '</td><td>' + htmlEscape(a.time) + '</td><td>' + (a.participants || []).length + ' student(s)</td><td><button class="btn btn-sm btn-primary" onclick="showEditActivityModal(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteActivity(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-trash"></i></button> <button class="btn btn-sm btn-success" onclick="showManageActivityParticipants(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-users"></i></button></td></tr>'; }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showAddActivityModal() {
  openModal(`
    <h3><i class="fas fa-plus"></i> Add Activity</h3>
    <div class="form-grid">
      <div class="form-group"><label>Activity Name</label><input type="text" id="fActName" placeholder="e.g. Chess Club"></div>
      <div class="form-group"><label>Type</label><select id="fActType"><option>Sports</option><option>Academic</option><option>Arts</option><option>Music</option><option>Community</option></select></div>
      <div class="form-group"><label>Day(s)</label><input type="text" id="fActDay" placeholder="e.g. Monday & Wednesday"></div>
      <div class="form-group"><label>Time</label><input type="text" id="fActTime" placeholder="e.g. 3:00 PM - 5:00 PM"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveActivity()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveActivity() {
  const name = document.getElementById('fActName').value.trim();
  const type = document.getElementById('fActType').value;
  const day = document.getElementById('fActDay').value.trim();
  const time = document.getElementById('fActTime').value.trim();
  if (!name || !day || !time) { toast('Please fill all fields', 'error'); return; }
  if (!data.activities) data.activities = [];
  data.activities.push({ id: genId('ACT'), name, type, day, time, participants: [] });
  saveData();
  logActivity(`Added activity: ${name}`);
  closeModal();
  renderActivities();
  toast('Activity added');
}

function showEditActivityModal(id) {
  const a = (data.activities || []).find(a => a.id === id);
  if (!a) return;
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Activity</h3>
    <div class="form-grid">
      <div class="form-group"><label>Activity Name</label><input type="text" id="fActName" value="${htmlEscape(a.name)}"></div>
      <div class="form-group"><label>Type</label><select id="fActType"><option ${a.type==='Sports'?'selected':''}>Sports</option><option ${a.type==='Academic'?'selected':''}>Academic</option><option ${a.type==='Arts'?'selected':''}>Arts</option><option ${a.type==='Music'?'selected':''}>Music</option><option ${a.type==='Community'?'selected':''}>Community</option></select></div>
      <div class="form-group"><label>Day(s)</label><input type="text" id="fActDay" value="${htmlEscape(a.day)}"></div>
      <div class="form-group"><label>Time</label><input type="text" id="fActTime" value="${htmlEscape(a.time)}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateActivity('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateActivity(id) {
  const a = (data.activities || []).find(a => a.id === id);
  if (!a) return;
  a.name = document.getElementById('fActName').value.trim();
  a.type = document.getElementById('fActType').value;
  a.day = document.getElementById('fActDay').value.trim();
  a.time = document.getElementById('fActTime').value.trim();
  saveData();
  closeModal();
  renderActivities();
  toast('Activity updated');
}

function deleteActivity(id) {
  if (!confirm('Delete this activity?')) return;
  data.activities = (data.activities || []).filter(a => a.id !== id);
  saveData();
  renderActivities();
  toast('Activity deleted');
}

function showManageActivityParticipants(id) {
  const a = (data.activities || []).find(a => a.id === id);
  if (!a) return;
  const stuOpts = (data.students || []).map(s => {
    const checked = a.participants.includes(s.id) ? 'checked' : '';
    return `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;"><input type="checkbox" class="part-check" value="${htmlEscape(s.id)}" ${checked}> ${htmlEscape(s.name)} (${htmlEscape(s.id)})</label>`;
  }).join('');
  openModal(`
    <h3><i class="fas fa-users"></i> ${htmlEscape(a.name)} - Participants</h3>
    <p style="color:var(--text-light);margin-bottom:16px;font-size:14px;">Select students enrolled in this activity</p>
    <div style="max-height:300px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">${stuOpts || '<p class="empty-state">No students available</p>'}</div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveActivityParticipants('${htmlEscape(id)}')"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveActivityParticipants(id) {
  const a = (data.activities || []).find(a => a.id === id);
  if (!a) return;
  const checks = document.querySelectorAll('.part-check:checked');
  a.participants = Array.from(checks).map(c => c.value);
  saveData();
  closeModal();
  renderActivities();
  toast('Participants updated');
}

// ===== ATTENDANCE =====
function renderAttendance() {
  var q = '';
  var searchEl = document.getElementById('attSearch');
  if (searchEl) q = searchEl.value.toLowerCase();
  var filtered = (data.attendance || []).map(function(a) { var st = getStudent(a.studentId); return { id: a.id, studentId: a.studentId, date: a.date, status: a.status, student: st }; })
    .filter(function(a) { return a.student && (a.student.name.toLowerCase().includes(q) || a.studentId.toLowerCase().includes(q)); })
    .sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var tbody = document.getElementById('attendanceTable');
  var empty = document.getElementById('attendanceEmpty');
  if (!tbody || !empty) return;
  if (filtered.length) {
    tbody.innerHTML = filtered.map(function(a) {
      var bClass = a.status === 'present' ? 'badge-paid' : a.status === 'absent' ? 'badge-absent' : 'badge-excused';
      return '<tr><td>' + htmlEscape(a.student.name) + ' (' + htmlEscape(a.studentId) + ')</td><td>' + htmlEscape(a.date) + '</td><td><span class="badge ' + bClass + '">' + htmlEscape(a.status) + '</span></td><td><button class="btn btn-sm btn-primary" onclick="showEditAttendanceModal(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteAttendance(\'' + htmlEscape(a.id) + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    }).join('');
    empty.style.display = 'none';
  } else {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

function showTakeAttendanceModal() {
  const today = new Date().toISOString().split('T')[0];
  const stuList = (data.students || []).map(s => {
    const existing = (data.attendance || []).find(a => a.studentId === s.id && a.date === today);
    const status = existing ? existing.status : 'present';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;">
      <span><strong>${htmlEscape(s.name)}</strong> <span style="color:var(--text-light);font-size:13px;">(${htmlEscape(s.id)})</span></span>
      <select class="att-status-select" data-sid="${htmlEscape(s.id)}" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-family:inherit;font-size:13px;">
        <option value="present" ${status==='present'?'selected':''}>Present</option>
        <option value="absent" ${status==='absent'?'selected':''}>Absent</option>
        <option value="excused" ${status==='excused'?'selected':''}>Excused</option>
      </select>
    </div>`;
  }).join('');
  openModal(`
    <h3><i class="fas fa-calendar-check"></i> Take Attendance</h3>
    <p style="color:var(--text-light);margin-bottom:16px;font-size:14px;">Date: <strong>${today}</strong></p>
    <div style="max-height:400px;overflow-y:auto;">${stuList || '<p class="empty-state">No students registered</p>'}</div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveAttendanceBulk('${today}')"><i class="fas fa-save"></i> Save All</button>
    </div>
  `);
}

function saveAttendanceBulk(date) {
  const selects = document.querySelectorAll('.att-status-select');
  selects.forEach(sel => {
    const sid = sel.dataset.sid;
    const status = sel.value;
    const existing = (data.attendance || []).findIndex(a => a.studentId === sid && a.date === date);
    if (existing >= 0) {
      data.attendance[existing].status = status;
    } else {
      if (!data.attendance) data.attendance = [];
      data.attendance.push({ id: genId('ATT'), studentId: sid, date, status });
    }
  });
  saveData();
  logActivity(`Took attendance for ${selects.length} students on ${date}`);
  closeModal();
  renderAttendance();
  toast('Attendance saved');
  try {
    if (typeof addNotification === 'function' && typeof getStudent === 'function') {
      selects.forEach(function(sel) {
        if (sel.value === 'absent') {
          var stu = getStudent(sel.dataset.sid);
          if (stu) addNotification(sel.dataset.sid, 'attendance', 'Absent on ' + date + ' — please provide a reason.');
        }
      });
    }
  } catch(e) {}
}

function showEditAttendanceModal(id) {
  const a = (data.attendance || []).find(a => a.id === id);
  if (!a) return;
  openModal(`
    <h3><i class="fas fa-edit"></i> Edit Attendance</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><input type="text" value="${htmlEscape(getStudent(a.studentId)?.name || a.studentId)}" readonly style="background:#f7fafc;"></div>
      <div class="form-group"><label>Date</label><input type="date" id="fAttDate" value="${htmlEscape(a.date)}"></div>
      <div class="form-group"><label>Status</label><select id="fAttStatus"><option value="present" ${a.status==='present'?'selected':''}>Present</option><option value="absent" ${a.status==='absent'?'selected':''}>Absent</option><option value="excused" ${a.status==='excused'?'selected':''}>Excused</option></select></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" style="color:var(--text);border-color:#e2e8f0;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="updateAttendance('${htmlEscape(id)}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

function updateAttendance(id) {
  const a = (data.attendance || []).find(a => a.id === id);
  if (!a) return;
  a.date = document.getElementById('fAttDate').value;
  a.status = document.getElementById('fAttStatus').value;
  saveData();
  closeModal();
  renderAttendance();
  toast('Attendance updated');
}

function deleteAttendance(id) {
  if (!confirm('Delete this attendance record?')) return;
  data.attendance = (data.attendance || []).filter(a => a.id !== id);
  saveData();
  renderAttendance();
  toast('Attendance record deleted');
}

// ===== Support Tickets Panel =====
function renderSupportPanel() {
  var container = document.getElementById('adminSupportTickets');
  if (!container) return;

  var tickets = data.supportTickets || [];

  var openTickets = tickets.filter(function(t) { return t.status === 'open' || t.status === 'pending'; });
  var closedTickets = tickets.filter(function(t) { return t.status === 'closed'; });

  var html = '<div class="card-header"><h2><i class="fas fa-headset"></i> Support Tickets</h2></div>'
    + '<p class="subtitle">Submit and track support requests to the platform administrator.</p>'

    // Stats
    + '<div class="stats-grid" style="margin-bottom:16px;grid-template-columns:repeat(3,1fr);">'
    + '<div class="stat-card" style="text-align:center;"><div style="font-size:24px;font-weight:700;">' + openTickets.length + '</div><p style="margin:0;font-size:13px;color:var(--text-light);">Open</p></div>'
    + '<div class="stat-card" style="text-align:center;"><div style="font-size:24px;font-weight:700;">' + closedTickets.length + '</div><p style="margin:0;font-size:13px;color:var(--text-light);">Closed</p></div>'
    + '<div class="stat-card" style="text-align:center;"><div style="font-size:24px;font-weight:700;">' + tickets.length + '</div><p style="margin:0;font-size:13px;color:var(--text-light);">Total</p></div>'
    + '</div>'

    // New ticket form
    + '<div class="card" style="margin-bottom:16px;"><h3 style="margin-bottom:12px;"><i class="fas fa-plus-circle"></i> Open a New Ticket</h3>'
    + '<div id="supportFormError" style="display:none;background:#fed7d7;color:#c53030;padding:10px;border-radius:6px;margin-bottom:12px;"></div>'
    + '<div class="form-group"><label>Subject</label>'
    + '<select id="supportSubject" class="form-control" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;">'
    + '<option value="Technical Issue">Technical Issue</option>'
    + '<option value="Billing / Payment">Billing / Payment</option>'
    + '<option value="Account">Account</option>'
    + '<option value="Feature Request">Feature Request</option>'
    + '<option value="Bug Report">Bug Report</option>'
    + '<option value="Other">Other</option>'
    + '</select></div>'
    + '<div class="form-group"><label>Description</label>'
    + '<textarea id="supportMessage" class="form-control" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;min-height:100px;font-family:inherit;" placeholder="Describe your issue or request in detail..."></textarea></div>'
    + '<button class="btn btn-primary" onclick="submitSupportTicket()"><i class="fas fa-paper-plane"></i> Submit Ticket</button>'
    + '</div>';

  // Ticket list
  html += '<div class="card"><h3 style="margin-bottom:12px;"><i class="fas fa-list"></i> Your Tickets</h3>';
  if (!tickets.length) {
    html += '<p class="empty-state" style="padding:20px;">No support tickets submitted yet.</p>';
  } else {
    html += tickets.slice().reverse().map(function(tk) {
      var statusColor = tk.status === 'closed' ? '#059669' : (tk.status === 'pending' ? '#d97706' : '#dc2626');
      var statusBg = tk.status === 'closed' ? '#d1fae5' : (tk.status === 'pending' ? '#fef3c7' : '#fee2e2');
      return '<div style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;overflow:hidden;">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\'">'
        + '<div><strong>' + esc(tk.subject || 'No subject') + '</strong><br><span style="font-size:12px;color:var(--text-light);">' + esc(tk.createdAt || '') + '</span></div>'
        + '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + statusBg + ';color:' + statusColor + ';font-weight:500;">' + esc(tk.status || 'open') + '</span></div>'
        + '<div style="display:none;padding:12px 16px;border-top:1px solid #e2e8f0;">'
        + '<p style="font-size:14px;margin-bottom:12px;">' + esc(tk.message || '') + '</p>'
        + (tk.response ? '<div style="padding:8px 12px;background:#f0fdf4;border-radius:6px;border-left:3px solid #059669;font-size:13px;"><strong>Response (' + esc(tk.respondedAt || '') + '):</strong><br>' + esc(tk.response) + '</div>' : '')
        + (tk.status !== 'closed' ? '<p style="font-size:12px;color:var(--text-light);margin-top:8px;"><i class="fas fa-clock"></i> Awaiting response</p>' : '')
        + '</div></div>';
    }).join('');
  }
  html += '</div>';

  container.innerHTML = html;
}

function submitSupportTicket() {
  var subject = document.getElementById('supportSubject')?.value;
  var message = document.getElementById('supportMessage')?.value?.trim();
  var error = document.getElementById('supportFormError');

  if (!message || message.length < 10) {
    if (error) { error.textContent = 'Please provide a detailed description (at least 10 characters).'; error.style.display = 'block'; }
    return;
  }
  if (error) error.style.display = 'none';

  if (!data.supportTickets) data.supportTickets = [];
  data.supportTickets.push({
    id: 'TK-' + Date.now().toString(36).toUpperCase(),
    subject: subject || 'General',
    message: message,
    status: 'open',
    createdAt: new Date().toLocaleString(),
    respondedAt: null,
    response: null
  });
  saveData();

  document.getElementById('supportMessage').value = '';
  renderSupportPanel();
  toast('Support ticket submitted! You will receive a response soon.');
}
