// EduVerse - CBT Exam Module
// Computer-Based Testing system with persistence, shuffling, and marks-weighted scoring

// ===== CBT EXAM SYSTEM (Admin) =====
function renderCBTAdmin() {
  var container = document.getElementById('adminCBTView');
  if (!container) return;
  var exams = data.cbtExams || [];
  var results = data.cbtResults || [];
  var totalExams = exams.length;
  var totalQuestions = exams.reduce(function(acc, e) { return acc + (Array.isArray(e.questions) ? e.questions.length : 0); }, 0);
  var totalAttempts = results.length;
  var passRate = totalAttempts ? Math.round(results.filter(function(r) { return r.passed; }).length / totalAttempts * 100) : 0;

  var html = ''
    + '<div class="cbt-hero">'
    + '<h2><i class="fas fa-laptop-code"></i> CBT Exam Manager</h2>'
    + '<p>Create, manage, and track computer-based tests. Add questions, set durations, and monitor student performance.</p>'
    + '<button class="btn btn-primary" onclick="showAddCBTExamModal()"><i class="fas fa-plus"></i> Create New Exam</button>'
    + '</div>'
    + '<div class="cbt-stat-grid">'
    + '<div class="cbt-stat-item cbt-stat-item--exams"><div class="cbt-stat-value">' + totalExams + '</div><div class="cbt-stat-label">Total Exams</div></div>'
    + '<div class="cbt-stat-item cbt-stat-item--questions"><div class="cbt-stat-value">' + totalQuestions + '</div><div class="cbt-stat-label">Questions</div></div>'
    + '<div class="cbt-stat-item cbt-stat-item--attempts"><div class="cbt-stat-value">' + totalAttempts + '</div><div class="cbt-stat-label">Attempts</div></div>'
    + '<div class="cbt-stat-item cbt-stat-item--passrate"><div class="cbt-stat-value">' + passRate + '%</div><div class="cbt-stat-label">Pass Rate</div></div>'
    + '</div>';

  if (!exams.length) {
    html += '<div class="empty-state" style="padding:48px 20px"><i class="fas fa-file-alt" style="font-size:48px;margin-bottom:16px;opacity:.3"></i><p style="font-size:16px;margin-bottom:8px">No exams created yet</p><p style="font-size:13px;color:var(--text-light)">Click "Create New Exam" above to get started</p></div>';
    container.innerHTML = html;
    return;
  }

  html += '<div class="cbt-exam-grid-v2">';
  exams.forEach(function(exam) {
    var qCount = (Array.isArray(exam.questions) ? exam.questions.length : 0);
    var attCount = results.filter(function(r) { return r.examId === exam.id; }).length;
    var avgScore = attCount ? Math.round(results.filter(function(r) { return r.examId === exam.id; }).reduce(function(s, r) { return s + r.percentage; }, 0) / attCount) : 0;
    var isActive = exam.status !== 'inactive';

    html += '<div class="cbt-exam-card-v2">'
      + '<div class="cbt-exam-card-v2-header">'
      + '<div class="cbt-exam-card-v2-title">' + htmlEscape(exam.title) + '</div>'
      + '<div class="cbt-exam-card-v2-desc">' + htmlEscape(exam.description || 'No description') + '</div>'
      + '</div>'
      + '<div class="cbt-exam-card-v2-body">'
      + '<div class="cbt-exam-meta">'
      + '<div class="cbt-exam-meta-item"><i class="fas fa-clock"></i> <strong>' + (exam.duration || 0) + ' min</strong></div>'
      + '<div class="cbt-exam-meta-item"><i class="fas fa-check-circle"></i> Pass: <strong>' + (exam.passScore || 50) + '%</strong></div>'
      + '<div class="cbt-exam-meta-item"><i class="fas fa-question-circle"></i> <strong>' + qCount + '</strong> Qs</div>'
      + '<div class="cbt-exam-meta-item"><i class="fas fa-circle" style="color:' + (isActive ? 'var(--success)' : 'var(--text-light)') + '"></i> ' + (isActive ? 'Active' : 'Inactive') + '</div>'
      + '</div>'
      + '<div class="cbt-exam-stats-row">'
      + '<div class="cbt-exam-stat"><div class="cbt-exam-stat-value">' + attCount + '</div><div class="cbt-exam-stat-label">Attempts</div></div>'
      + '<div class="cbt-exam-stat"><div class="cbt-exam-stat-value">' + avgScore + '%</div><div class="cbt-exam-stat-label">Avg Score</div></div>'
      + '</div>';

    if (qCount) {
      html += '<div class="cbt-questions-v2">';
      (exam.questions || []).forEach(function(q, qi) {
        html += '<div class="cbt-question-v2">'
          + '<div class="cbt-question-v2-num">' + (qi + 1) + '</div>'
          + '<div style="flex:1"><div class="cbt-question-v2-text">' + htmlEscape(q.question) + '</div>'
          + '<div class="cbt-question-v2-options">' + (q.options || []).map(function(o, oi) { return (oi === q.answer ? '<strong style="color:var(--success)"><i class="fas fa-check"></i> ' : '') + htmlEscape(o) + (oi === q.answer ? '</strong>' : ''); }).join(' &middot; ') + '</div></div>'
          + '<div class="cbt-question-v2-actions">'
          + '<button class="btn btn-sm btn-secondary" onclick="showEditCBTQuestionModal(\'' + exam.id + '\',' + qi + ')" title="Edit"><i class="fas fa-edit"></i></button>'
          + '<button class="btn btn-sm btn-danger" onclick="deleteCBTQuestion(\'' + exam.id + '\',' + qi + ')" title="Delete"><i class="fas fa-trash"></i></button>'
          + '</div></div>';
      });
      html += '</div>';
    }

    html += '</div>'
      + '<div class="cbt-exam-card-v2-actions">'
      + '<button class="btn btn-sm btn-primary" onclick="showAddCBTQuestionModal(\'' + exam.id + '\')"><i class="fas fa-plus"></i> Add Question</button>'
      + '<button class="btn btn-sm btn-secondary" onclick="showEditCBTExamModal(\'' + exam.id + '\')"><i class="fas fa-edit"></i> Edit</button>'
      + '<button class="btn btn-sm btn-secondary" onclick="toggleCBTExamStatus(\'' + exam.id + '\')"><i class="fas fa-' + (isActive ? 'pause' : 'play') + '"></i> ' + (isActive ? 'Deactivate' : 'Activate') + '</button>'
      + '<button class="btn btn-sm btn-danger" onclick="deleteCBTExam(\'' + exam.id + '\')"><i class="fas fa-trash"></i></button>'
      + '</div>'
      + '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function showAddCBTExamModal() {
  openModal('<div style="max-width:500px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="margin:0;">Create CBT Exam</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>'
    + '<div class="form-group"><label>Exam Title</label><input type="text" id="cbtExamTitle" class="form-input" placeholder="e.g. Mathematics Mid-Term"></div>'
    + '<div class="form-group"><label>Description</label><textarea id="cbtExamDesc" class="form-input" rows="3" placeholder="Exam description..."></textarea></div>'
    + '<div class="form-group"><label>Duration (minutes)</label><input type="number" id="cbtExamDuration" class="form-input" value="60" min="1"></div>'
    + '<div class="form-group"><label>Pass Score (%)</label><input type="number" id="cbtExamPassScore" class="form-input" value="50" min="0" max="100"></div>'
    + '<div class="form-group"><label>Instructions (optional)</label><textarea id="cbtExamInstructions" class="form-input" rows="3" placeholder="Instructions for students..."></textarea></div>'
    + '<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCBTExam()"><i class="fas fa-save"></i> Save</button></div></div>');
}

function showEditCBTExamModal(id) {
  var exam = (data.cbtExams || []).find(function(e) { return e.id === id; });
  if (!exam) return;
  openModal('<div style="max-width:500px;"><input type="hidden" id="cbtExamEditId" value="' + htmlEscape(id) + '">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="margin:0;">Edit CBT Exam</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>'
    + '<div class="form-group"><label>Exam Title</label><input type="text" id="cbtExamTitle" class="form-input" value="' + htmlEscape(exam.title) + '"></div>'
    + '<div class="form-group"><label>Description</label><textarea id="cbtExamDesc" class="form-input" rows="3">' + htmlEscape(exam.description || '') + '</textarea></div>'
    + '<div class="form-group"><label>Duration (minutes)</label><input type="number" id="cbtExamDuration" class="form-input" value="' + (exam.duration || 60) + '" min="1"></div>'
    + '<div class="form-group"><label>Pass Score (%)</label><input type="number" id="cbtExamPassScore" class="form-input" value="' + (exam.passScore || 50) + '" min="0" max="100"></div>'
    + '<div class="form-group"><label>Instructions (optional)</label><textarea id="cbtExamInstructions" class="form-input" rows="3">' + htmlEscape(exam.instructions || '') + '</textarea></div>'
    + '<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCBTExam()"><i class="fas fa-save"></i> Save</button></div></div>');
}

function saveCBTExam() {
  var title = document.getElementById('cbtExamTitle');
  var desc = document.getElementById('cbtExamDesc');
  var duration = document.getElementById('cbtExamDuration');
  var passScore = document.getElementById('cbtExamPassScore');
  var instructions = document.getElementById('cbtExamInstructions');
  var editId = document.getElementById('cbtExamEditId');
  if (!title || !title.value.trim()) { alert('Please enter an exam title.'); return; }
  var dur = Math.max(1, parseInt(duration.value) || 60);
  var ps = Math.min(100, Math.max(0, parseInt(passScore.value) || 50));
  if (!data.cbtExams) data.cbtExams = [];
  if (editId && editId.value) {
    var exam = data.cbtExams.find(function(e) { return e.id === editId.value; });
    if (exam) {
      exam.title = title.value.trim();
      exam.description = desc ? desc.value.trim() : '';
      exam.duration = dur;
      exam.passScore = ps;
      exam.instructions = instructions ? instructions.value.trim() : '';
    }
  } else {
    data.cbtExams.push({
      id: genId('CBT'),
      title: title.value.trim(),
      description: desc ? desc.value.trim() : '',
      duration: dur,
      passScore: ps,
      instructions: instructions ? instructions.value.trim() : '',
      questions: [],
      created: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  }
  closeModal();
  saveData();
  renderCBTAdmin();
}

function deleteCBTExam(id) {
  if (!confirm('Delete this exam and all its questions and results?')) return;
  data.cbtExams = (data.cbtExams || []).filter(function(e) { return e.id !== id; });
  data.cbtResults = (data.cbtResults || []).filter(function(r) { return r.examId !== id; });
  saveData();
  renderCBTAdmin();
}

function toggleCBTExamStatus(id) {
  var exam = (data.cbtExams || []).find(function(e) { return e.id === id; });
  if (!exam) return;
  exam.status = exam.status === 'inactive' ? 'active' : 'inactive';
  saveData();
  renderCBTAdmin();
}

function showAddCBTQuestionModal(examId) {
  var exam = (data.cbtExams || []).find(function(e) { return e.id === examId; });
  if (!exam) return;
  var body = '<div style="max-width:600px;"><input type="hidden" id="cbtQExamId" value="' + htmlEscape(examId) + '">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="margin:0;">Add Question to: ' + htmlEscape(exam.title) + '</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>'
    + '<div class="form-group"><label>Question</label><textarea id="cbtQText" class="form-input" rows="2" placeholder="Enter question text..."></textarea></div>';
  for (var i = 0; i < 4; i++) {
    body += '<div class="form-group"><label>Option ' + (i + 1) + '</label><input type="text" id="cbtQOpt' + i + '" class="form-input" placeholder="Option ' + (i + 1) + '"></div>';
  }
  body += '<div class="form-group"><label>Correct Option</label><select id="cbtQAnswer" class="form-input"><option value="0">Option 1</option><option value="1">Option 2</option><option value="2">Option 3</option><option value="3">Option 4</option></select></div>'
    + '<div class="form-group"><label>Marks</label><input type="number" id="cbtQMarks" class="form-input" value="1" min="1"></div>'
    + '<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCBTQuestion()"><i class="fas fa-save"></i> Save</button></div></div>';
  openModal(body);
}

function showEditCBTQuestionModal(examId, qIndex) {
  var exam = (data.cbtExams || []).find(function(e) { return e.id === examId; });
  if (!exam || !exam.questions[qIndex]) return;
  var q = exam.questions[qIndex];
  var body = '<div style="max-width:600px;"><input type="hidden" id="cbtQExamId" value="' + htmlEscape(examId) + '"><input type="hidden" id="cbtQIndex" value="' + qIndex + '">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="margin:0;">Edit Question</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>'
    + '<div class="form-group"><label>Question</label><textarea id="cbtQText" class="form-input" rows="2">' + htmlEscape(q.question) + '</textarea></div>';
  for (var i = 0; i < 4; i++) {
    body += '<div class="form-group"><label>Option ' + (i + 1) + '</label><input type="text" id="cbtQOpt' + i + '" class="form-input" value="' + htmlEscape(q.options[i] || '') + '"></div>';
  }
  body += '<div class="form-group"><label>Correct Option</label><select id="cbtQAnswer" class="form-input">';
  for (var j = 0; j < 4; j++) {
    body += '<option value="' + j + '"' + (j === q.answer ? ' selected' : '') + '>Option ' + (j + 1) + '</option>';
  }
  body += '</select></div>'
    + '<div class="form-group"><label>Marks</label><input type="number" id="cbtQMarks" class="form-input" value="' + (q.marks || 1) + '" min="1"></div>'
    + '<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCBTQuestion()"><i class="fas fa-save"></i> Save</button></div></div>';
  openModal(body);
}

function saveCBTQuestion() {
  var examId = document.getElementById('cbtQExamId');
  var qText = document.getElementById('cbtQText');
  var qAnswer = document.getElementById('cbtQAnswer');
  var qMarks = document.getElementById('cbtQMarks');
  var qIndex = document.getElementById('cbtQIndex');
  if (!examId || !examId.value) return;
  var exam = (data.cbtExams || []).find(function(e) { return e.id === examId.value; });
  if (!exam) return;
  if (!qText.value.trim()) { alert('Please enter the question text.'); return; }
  var options = [];
  for (var i = 0; i < 4; i++) {
    var opt = document.getElementById('cbtQOpt' + i);
    options.push(opt ? (opt.value.trim() || 'Option ' + (i + 1)) : 'Option ' + (i + 1));
  }
  if (!exam.questions) exam.questions = [];
  var qData = {
    id: genId('CBTQ'),
    question: qText.value.trim(),
    options: options,
    answer: parseInt(qAnswer.value),
    marks: Math.max(1, parseInt(qMarks.value) || 1)
  };
  if (qIndex && qIndex.value !== '') {
    var idx = parseInt(qIndex.value);
    if (exam.questions[idx]) {
      qData.id = exam.questions[idx].id;
      exam.questions[idx] = qData;
    }
  } else {
    exam.questions.push(qData);
  }
  closeModal();
  saveData();
  renderCBTAdmin();
}

function deleteCBTQuestion(examId, qIndex) {
  if (!confirm('Delete this question?')) return;
  var exam = (data.cbtExams || []).find(function(e) { return e.id === examId; });
  if (exam && exam.questions) {
    exam.questions.splice(qIndex, 1);
    saveData();
    renderCBTAdmin();
  }
}

// ===== CBT EXAM SYSTEM (Student) =====
var _cbtState = null;
var _cbtSubmitting = false;
var CBT_STATE_KEY = 'eduverse_cbt_active';

// Shuffle array (Fisher-Yates)
function _cbtShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// Persist exam state to sessionStorage
function _cbtPersistState() {
  if (!_cbtState) return;
  try {
    var toSave = {
      examId: _cbtState.examId,
      examTitle: _cbtState.examTitle,
      answers: _cbtState.answers,
      currentQ: _cbtState.currentQ,
      duration: _cbtState.duration,
      passScore: _cbtState.passScore,
      tabSwitches: _cbtState.tabSwitches,
      startedAt: _cbtState.startedAt,
      questionOrder: _cbtState.questionOrder,
      optionOrders: _cbtState.optionOrders
    };
    sessionStorage.setItem(CBT_STATE_KEY, JSON.stringify(toSave));
  } catch(e) {}
}

// Restore exam state from sessionStorage
function _cbtRestoreState() {
  try {
    var raw = sessionStorage.getItem(CBT_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}

function renderCBTStudent() {
  var container = document.getElementById('studentCBTView');
  if (!container) return;
  if (!currentStudent) { container.innerHTML = '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>Please log in to view CBT exams.</p></div>'; return; }

  // Check for active exam in sessionStorage
  var savedState = _cbtRestoreState();
  if (savedState && savedState.examId) {
    var activeExam = (data.cbtExams || []).find(function(e) { return e.id === savedState.examId; });
    if (activeExam && confirm('You have an ongoing exam: "' + savedState.examTitle + '". Resume it?')) {
      _cbtState = {
        examId: savedState.examId,
        examTitle: savedState.examTitle,
        questions: activeExam.questions || [],
        duration: savedState.duration,
        passScore: savedState.passScore,
        answers: savedState.answers,
        currentQ: savedState.currentQ,
        timer: null,
        timeLeft: 0,
        tabSwitches: savedState.tabSwitches || 0,
        startedAt: savedState.startedAt,
        questionOrder: savedState.questionOrder || null,
        optionOrders: savedState.optionOrders || null
      };
      // Calculate remaining time from startedAt
      var elapsed = Math.floor((Date.now() - new Date(savedState.startedAt).getTime()) / 1000);
      _cbtState.timeLeft = Math.max(0, _cbtState.duration * 60 - elapsed);
      if (_cbtState.timeLeft <= 0) {
        _cbtState = null;
        sessionStorage.removeItem(CBT_STATE_KEY);
        alert('Time expired for the ongoing exam.');
      } else {
        _renderCBTTimerUI();
        return;
      }
    } else {
      sessionStorage.removeItem(CBT_STATE_KEY);
    }
  }

  var exams = (data.cbtExams || []).filter(function(e) { return e.status === 'active' && (Array.isArray(e.questions) ? e.questions.length : 0) > 0; });
  var results = (data.cbtResults || []).filter(function(r) { return r.studentId === currentStudent.id; });
  var html = '<div class="card-header"><h2><i class="fas fa-laptop-code"></i> CBT Exams</h2></div>';
  if (results.length) {
    html += '<h3 style="margin:16px 0 8px;font-size:15px;">Your Past Results</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-bottom:24px;">';
    results.slice().reverse().forEach(function(r) {
      var cls = r.passed ? 'passed' : 'failed';
      html += '<div class="cbt-result-summary ' + cls + '" style="padding:16px;text-align:center;">';
      html += '<div style="font-size:13px;font-weight:600;">' + htmlEscape(r.examTitle) + '</div>';
      html += '<div class="score" style="font-size:28px;font-weight:800;margin:4px 0;">' + r.percentage + '%</div>';
      html += '<p style="font-size:12px;margin:0;">' + (r.passed ? '&#10003; Passed' : '&#10007; Failed') + ' &middot; ' + r.score + '/' + r.total + ' marks</p>';
      html += '<button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="renderCBTResult(\'' + r.id + '\')"><i class="fas fa-eye"></i> Review</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (!exams.length) {
    html += '<div class="empty-state"><i class="fas fa-file"></i><p>No CBT exams available at this time.</p></div>';
    container.innerHTML = html;
    return;
  }
  html += '<h3 style="margin:0 0 12px;font-size:15px;">Available Exams</h3>';
  html += '<div class="cbt-exam-grid">';
  exams.forEach(function(exam) {
    var taken = results.some(function(r) { return r.examId === exam.id; });
    html += '<div class="cbt-exam-card">';
    html += '<h4>' + htmlEscape(exam.title) + '</h4>';
    html += '<p>' + htmlEscape(exam.description || '') + '</p>';
    html += '<p><strong>Duration:</strong> ' + (exam.duration || 0) + ' min &middot; <strong>Questions:</strong> ' + (exam.questions || []).length + ' &middot; <strong>Pass:</strong> ' + (exam.passScore || 50) + '%</p>';
    if (exam.instructions) html += '<p style="font-size:12px;color:var(--text-light);font-style:italic;">' + htmlEscape(exam.instructions) + '</p>';
    html += '<div class="cbt-exam-actions">';
    if (taken) {
      html += '<button class="btn btn-sm btn-secondary" disabled><i class="fas fa-check"></i> Completed</button>';
    } else {
      html += '<button class="btn btn-sm btn-primary" onclick="launchCBTExam(\'' + exam.id + '\')"><i class="fas fa-play"></i> Start Exam</button>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
  if (typeof applyTranslations === 'function') applyTranslations();
}

function launchCBTExam(examId) {
  var exam = (data.cbtExams || []).find(function(e) { return e.id === examId; });
  if (!exam || !currentStudent) return;
  if (!confirm('You are about to start "' + exam.title + '".\n\nDuration: ' + exam.duration + ' minutes\nQuestions: ' + (exam.questions || []).length + '\nPass Score: ' + (exam.passScore || 50) + '%\n\nThis exam will be in full-screen mode. Make sure you are ready!')) return;

  var questions = exam.questions || [];
  // Shuffle questions
  var questionOrder = _cbtShuffle(Array.from({length: questions.length}, function(_, i) { return i; }));
  // Shuffle options for each question
  var optionOrders = questionOrder.map(function(qi) {
    var q = questions[qi];
    return _cbtShuffle(Array.from({length: q.options.length}, function(_, i) { return i; }));
  });

  _cbtState = {
    examId: exam.id,
    examTitle: exam.title,
    questions: questions,
    duration: exam.duration || 60,
    passScore: exam.passScore || 50,
    answers: questions.map(function() { return null; }),
    currentQ: 0,
    timer: null,
    timeLeft: (exam.duration || 60) * 60,
    tabSwitches: 0,
    startedAt: new Date().toISOString(),
    questionOrder: questionOrder,
    optionOrders: optionOrders
  };
  _cbtPersistState();
  _renderCBTTimerUI();
}

function _renderCBTTimerUI() {
  if (!_cbtState) return;
  var s = _cbtState;
  var qIdx = s.questionOrder ? s.questionOrder[s.currentQ] : s.currentQ;
  var q = s.questions[qIdx];
  if (!q) return;
  var total = s.questions.length;
  var answered = s.answers.filter(function(a) { return a !== null; }).length;
  var mins = Math.floor(s.timeLeft / 60);
  var secs = s.timeLeft % 60;
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var timeStr = pad(mins) + ':' + pad(secs);
  var warningClass = s.timeLeft <= 300 ? ' warning' : '';

  // Get shuffled options for this question
  var optOrder = s.optionOrders ? s.optionOrders[s.currentQ] : null;

  var html = '<div class="cbt-timer-overlay" id="cbtTimerOverlay">';
  html += '<div class="cbt-timer-header">';
  html += '<h2><i class="fas fa-laptop-code"></i> ' + htmlEscape(s.examTitle) + '</h2>';
  html += '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">';
  if (s.tabSwitches > 0) html += '<span class="cbt-tab-switch"><i class="fas fa-exclamation-triangle"></i> Tab switches: ' + s.tabSwitches + '</span>';
  html += '<div class="cbt-timer-display' + warningClass + '" id="cbtTimerDisplay" role="timer" aria-live="polite">' + timeStr + '</div>';
  html += '<button class="btn btn-sm cbt-submit-btn" onclick="submitCBTExam()"><i class="fas fa-check"></i> Submit</button>';
  html += '<button class="btn btn-sm cbt-cancel-btn" onclick="cancelCBTExam()"><i class="fas fa-times"></i></button>';
  html += '</div></div>';
  html += '<div class="cbt-timer-body">';
  html += '<div class="cbt-timer-main">';
  html += '<div class="cbt-question-card">';
  html += '<h3>Question ' + (s.currentQ + 1) + ' of ' + total + '</h3>';
  html += '<p style="font-size:15px;line-height:1.6;margin-bottom:16px;">' + htmlEscape(q.question) + '</p>';

  var displayOptions = optOrder ? optOrder.map(function(oi) { return {text: q.options[oi], origIdx: oi}; }) : q.options.map(function(t, i) { return {text: t, origIdx: i}; });
  displayOptions.forEach(function(opt) {
    var selected = s.answers[s.currentQ] === opt.origIdx ? ' selected' : '';
    html += '<div class="cbt-option' + selected + '" onclick="selectCBTAnswer(' + opt.origIdx + ')" tabindex="0" role="radio" aria-checked="' + (selected ? 'true' : 'false') + '">';
    html += '<input type="radio" name="cbtOption" value="' + opt.origIdx + '"' + (selected ? ' checked' : '') + '>';
    html += '<span>' + htmlEscape(opt.text) + '</span></div>';
  });
  html += '</div>';
  html += '<div class="cbt-nav-buttons">';
  html += '<div>';
  if (s.currentQ > 0) html += '<button class="btn btn-secondary" onclick="navigateCBTQuestion(' + (s.currentQ - 1) + ')"><i class="fas fa-arrow-left"></i> Previous</button>';
  html += '</div><div>';
  if (s.currentQ < total - 1) html += '<button class="btn btn-primary" onclick="navigateCBTQuestion(' + (s.currentQ + 1) + ')">Next <i class="fas fa-arrow-right"></i></button>';
  else html += '<button class="btn btn-success" onclick="submitCBTExam()"><i class="fas fa-check"></i> Submit Exam</button>';
  html += '</div></div></div>';
  html += '<div class="cbt-timer-sidebar">';
  html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">' + answered + '/' + total + ' answered</div>';
  html += '<div class="cbt-question-nav">';
  s.questions.forEach(function(_, qi) {
    var cls = 'cbt-nav-btn';
    if (s.answers[qi] !== null) cls += ' answered';
    if (s.currentQ === qi) cls += ' current';
    html += '<button class="' + cls + '" onclick="navigateCBTQuestion(' + qi + ')">' + (qi + 1) + '</button>';
  });
  html += '</div></div></div></div>';
  var existing = document.getElementById('cbtTimerOverlay');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  if (!s.timer) {
    s.timer = setInterval(function() { _cbtTick(); }, 1000);
  }
}

function _cbtTick() {
  if (!_cbtState) return;
  // Calculate time from timestamps to avoid drift
  var elapsed = Math.floor((Date.now() - new Date(_cbtState.startedAt).getTime()) / 1000);
  _cbtState.timeLeft = Math.max(0, _cbtState.duration * 60 - elapsed);
  _cbtPersistState();
  if (_cbtState.timeLeft <= 0) {
    clearInterval(_cbtState.timer);
    _cbtState.timer = null;
    submitCBTExam(true);
    return;
  }
  var disp = document.getElementById('cbtTimerDisplay');
  if (!disp) return;
  var mins = Math.floor(_cbtState.timeLeft / 60);
  var secs = _cbtState.timeLeft % 60;
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  disp.textContent = pad(mins) + ':' + pad(secs);
  disp.classList.toggle('warning', _cbtState.timeLeft <= 300);
}

// Anti-cheating: tab switch detection
if (!window._cbtVisibilityListenerAdded) {
  document.addEventListener('visibilitychange', function() {
    if (_cbtState && document.hidden) {
      _cbtState.tabSwitches = (_cbtState.tabSwitches || 0) + 1;
      _cbtPersistState();
    }
  });
  window._cbtVisibilityListenerAdded = true;
}

// Warn before leaving during exam
if (!window._cbtBeforeunloadAdded) {
  window.addEventListener('beforeunload', function(e) {
    if (_cbtState && !_cbtSubmitting) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  window._cbtBeforeunloadAdded = true;
}

function selectCBTAnswer(optIndex) {
  if (!_cbtState || _cbtSubmitting) return;
  _cbtState.answers[_cbtState.currentQ] = optIndex;
  _cbtPersistState();
  _renderCBTTimerUI();
}

function navigateCBTQuestion(index) {
  if (!_cbtState || _cbtSubmitting) return;
  _cbtState.currentQ = index;
  _cbtPersistState();
  _renderCBTTimerUI();
}

function cancelCBTExam() {
  if (!confirm('Cancel this exam? All progress will be lost.')) return;
  if (_cbtState && _cbtState.timer) clearInterval(_cbtState.timer);
  var el = document.getElementById('cbtTimerOverlay');
  if (el) el.remove();
  _cbtState = null;
  _cbtSubmitting = false;
  sessionStorage.removeItem(CBT_STATE_KEY);
  if (typeof renderCBTStudent === 'function') renderCBTStudent();
}

function submitCBTExam(force) {
  if (!_cbtState || _cbtSubmitting) return;
  if (!force && !confirm('Are you sure you want to submit this exam? ' + _cbtState.answers.filter(function(a) { return a !== null; }).length + '/' + _cbtState.questions.length + ' answered.')) return;
  _cbtSubmitting = true;
  if (_cbtState.timer) { clearInterval(_cbtState.timer); _cbtState.timer = null; }

  // Marks-weighted scoring
  var totalMarks = 0;
  var score = 0;
  _cbtState.questions.forEach(function(q, i) {
    var marks = q.marks || 1;
    totalMarks += marks;
    if (_cbtState.answers[i] !== null && _cbtState.answers[i] === q.answer) score += marks;
  });
  var pct = totalMarks ? Math.round(score / totalMarks * 100) : 0;
  var passed = pct >= _cbtState.passScore;
  var result = {
    id: genId('CBTR'),
    examId: _cbtState.examId,
    examTitle: _cbtState.examTitle,
    studentId: currentStudent.id,
    studentName: currentStudent.name,
    answers: _cbtState.answers.slice(),
    score: score,
    total: totalMarks,
    percentage: pct,
    passed: passed,
    passScore: _cbtState.passScore,
    startedAt: _cbtState.startedAt,
    submittedAt: new Date().toISOString(),
    tabSwitches: _cbtState.tabSwitches,
    questionOrder: _cbtState.questionOrder,
    optionOrders: _cbtState.optionOrders
  };
  if (!data.cbtResults) data.cbtResults = [];
  data.cbtResults.push(result);
  saveData();
  sessionStorage.removeItem(CBT_STATE_KEY);
  var overlay = document.getElementById('cbtTimerOverlay');
  if (overlay) overlay.remove();
  _cbtState = null;
  _cbtSubmitting = false;
  if (typeof toast === 'function') toast('Exam submitted successfully!', 'success');
  renderCBTResult(result.id);
}

function renderCBTResult(resultId) {
  var container = document.getElementById('studentCBTView');
  if (!container) return;
  var result = (data.cbtResults || []).find(function(r) { return r.id === resultId; });
  if (!result) return;
  var exam = (data.cbtExams || []).find(function(e) { return e.id === result.examId; });
  var questions = exam ? (exam.questions || []) : [];
  var cls = result.passed ? 'passed' : 'failed';
  var html = '<div class="card-header"><h2><i class="fas fa-file-alt"></i> Exam Result</h2><button class="btn btn-secondary" onclick="renderCBTStudent()"><i class="fas fa-arrow-left"></i> Back to Exams</button></div>';
  html += '<div class="cbt-result-summary ' + cls + '">';
  html += '<h2>' + htmlEscape(result.examTitle) + '</h2>';
  html += '<div class="score">' + result.percentage + '%</div>';
  html += '<p>' + result.score + '/' + result.total + ' marks</p>';
  html += '<p style="font-weight:600;font-size:16px;">' + (result.passed ? '&#10003; PASSED' : '&#10007; FAILED') + ' (Pass mark: ' + result.passScore + '%)</p>';
  if (result.tabSwitches > 0) html += '<p style="font-size:12px;opacity:0.7;">Tab switches detected: ' + result.tabSwitches + '</p>';
  html += '</div>';
  if (questions.length && questions.length === result.answers.length) {
    html += '<h3 style="margin:16px 0 12px;">Answer Review</h3>';
    questions.forEach(function(q, i) {
      var selected = result.answers[i];
      var isCorrect = selected !== null && selected === q.answer;
      var cls2 = isCorrect ? 'correct' : 'incorrect';
      html += '<div class="cbt-review-item ' + cls2 + '">';
      html += '<div class="cbt-review-question">Q' + (i + 1) + ' (' + (q.marks || 1) + ' mark' + ((q.marks || 1) > 1 ? 's' : '') + '): ' + htmlEscape(q.question) + '</div>';
      html += '<div class="cbt-review-answer">Correct: <span class="correct-answer">' + htmlEscape(q.options[q.answer] || '') + '</span></div>';
      html += '<div class="cbt-review-answer ' + (isCorrect ? 'correct-answer' : 'wrong-answer') + '">Your answer: ' + (selected !== null ? htmlEscape(q.options[selected] || '') : 'Not answered') + '</div>';
      html += '</div>';
    });
  }
  container.innerHTML = html;
}

// Export globals
window.renderCBTAdmin = renderCBTAdmin;
window.renderCBTStudent = renderCBTStudent;
window.launchCBTExam = launchCBTExam;
window.submitCBTExam = submitCBTExam;
window.selectCBTAnswer = selectCBTAnswer;
window.navigateCBTQuestion = navigateCBTQuestion;
window.renderCBTResult = renderCBTResult;
window.showAddCBTExamModal = showAddCBTExamModal;
window.showEditCBTExamModal = showEditCBTExamModal;
window.saveCBTExam = saveCBTExam;
window.deleteCBTExam = deleteCBTExam;
window.toggleCBTExamStatus = toggleCBTExamStatus;
window.showAddCBTQuestionModal = showAddCBTQuestionModal;
window.showEditCBTQuestionModal = showEditCBTQuestionModal;
window.saveCBTQuestion = saveCBTQuestion;
window.deleteCBTQuestion = deleteCBTQuestion;
window.cancelCBTExam = cancelCBTExam;
