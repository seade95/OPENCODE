// EduVerse - K-12 Tiered Academic Schema Module
// Comprehensive Nigerian K-12 system: Creche to SSS 3, national exams, GPA tracking

// ===== 1. K-12 CONFIGURATION =====
const K12_CONFIG = {
  tiers: {
    eccde: {
      name: 'Early Childhood (ECCDE)',
      classes: ['Creche', 'Toddler', 'Playgroup', 'Nursery 1', 'Nursery 2', 'Kindergarten', 'Reception'],
      evalType: 'descriptive',
      evalLabel: 'Descriptive Performance Levels',
    },
    primary: {
      name: 'Basic Education',
      subTiers: {
        lower: { name: 'Lower Basic', classes: ['Basic 1', 'Basic 2', 'Basic 3'] },
        middle: { name: 'Middle Basic', classes: ['Basic 4', 'Basic 5', 'Basic 6'] },
      },
      evalType: 'ca_exam',
      evalLabel: '40% CA + 60% Exam',
    },
    juniorSecondary: {
      name: 'Basic Education (JSS)',
      classes: ['JSS 1', 'JSS 2', 'JSS 3'],
      evalType: 'ca_exam',
      evalLabel: '40% CA + 60% Exam, BECE grade mapping at JSS 3',
    },
    seniorSecondary: {
      name: 'Senior Secondary (SSS)',
      classes: ['SSS 1', 'SSS 2', 'SSS 3'],
      evalType: 'gpa',
      evalLabel: 'Cumulative GPA, WASSCE/NECO grade mapping',
      streams: {
        science: { name: 'Science', subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'English Language', 'Civic Education', 'Data Processing'] },
        commercial: { name: 'Commercial', subjects: ['Financial Accounting', 'Commerce', 'Economics', 'Mathematics', 'English Language', 'Civic Education', 'Data Processing'] },
        arts: { name: 'Humanities/Arts', subjects: ['Literature-in-English', 'Government', 'Economics', 'Mathematics', 'English Language', 'Civic Education', 'Christian Religious Studies'] },
      },
    },
  },

  subjects: {
    eccde: ['Letter Work', 'Number Work', 'Health Habits', 'Social Norms', 'Creative Arts', 'Rhymes & Language Skills'],
    primary: ['English Language', 'Mathematics', 'Basic Science & Technology (BST)', 'National Values Education (NVE)', 'Pre-Vocational Studies (PVS)', 'Cultural & Creative Arts (CCA)', 'History', 'Nigerian Languages'],
    junior: ['English Language', 'Mathematics', 'Basic Science & Technology (BST)', 'National Values Education (NVE)', 'Pre-Vocational Studies (PVS)', 'Cultural & Creative Arts (CCA)', 'History', 'Nigerian Languages'],
  },

  gradingRubrics: {
    descriptive: {
      levels: [
        { key: 'exceeded', label: 'Exceeded Expectations', range: [80, 100] },
        { key: 'achieved', label: 'Achieved Expectations', range: [60, 79] },
        { key: 'developing', label: 'Developing', range: [40, 59] },
        { key: 'emerging', label: 'Emerging', range: [0, 39] },
      ],
      getLevel(score) { return score >= 80 ? 'exceeded' : score >= 60 ? 'achieved' : score >= 40 ? 'developing' : 'emerging'; },
      getLabel(score) { const l = this.getLevel(score); return this.levels.find(x => x.key === l)?.label || 'Emerging'; },
    },
    standard: {
      // Standard 40% CA + 60% Exam grading
      getGrade(score) {
        if (score >= 80) return 'A'; if (score >= 75) return 'B+'; if (score >= 70) return 'B';
        if (score >= 65) return 'C+'; if (score >= 60) return 'C'; if (score >= 55) return 'D+';
        if (score >= 50) return 'D'; return 'F';
      },
    },
    bece: {
      labels: ['A (Distinction)', 'B (Upper Credit)', 'C (Lower Credit)', 'P (Pass)', 'F (Fail)'],
      getGrade(score) {
        if (score >= 75) return 'A'; if (score >= 65) return 'B'; if (score >= 55) return 'C';
        if (score >= 45) return 'P'; return 'F';
      },
      getLabel(score) {
        if (score >= 75) return 'Distinction'; if (score >= 65) return 'Upper Credit';
        if (score >= 55) return 'Lower Credit'; if (score >= 45) return 'Pass'; return 'Fail';
      },
    },
    wassce: {
      labels: ['A1 (Excellent)', 'B2 (Very Good)', 'B3 (Very Good)', 'C4 (Credit)', 'C5 (Credit)', 'C6 (Credit)', 'D7 (Pass)', 'E8 (Pass)', 'F9 (Fail)'],
      getGrade(score) {
        if (score >= 90) return 'A1'; if (score >= 80) return 'B2'; if (score >= 70) return 'B3';
        if (score >= 60) return 'C4'; if (score >= 55) return 'C5'; if (score >= 50) return 'C6';
        if (score >= 45) return 'D7'; if (score >= 40) return 'E8'; return 'F9';
      },
      getLabel(score) {
        if (score >= 90) return 'Excellent'; if (score >= 70) return 'Very Good';
        if (score >= 50) return 'Credit'; if (score >= 40) return 'Pass'; return 'Fail';
      },
      getPoints(score) {
        if (score >= 90) return 8; if (score >= 80) return 7; if (score >= 70) return 6;
        if (score >= 60) return 5; if (score >= 55) return 4; if (score >= 50) return 3;
        if (score >= 45) return 2; if (score >= 40) return 1; return 0;
      },
    },
    neco: {
      getGrade(score) {
        if (score >= 90) return 'A1'; if (score >= 80) return 'B2'; if (score >= 70) return 'B3';
        if (score >= 60) return 'C4'; if (score >= 55) return 'C5'; if (score >= 50) return 'C6';
        if (score >= 45) return 'D7'; if (score >= 40) return 'E8'; return 'F9';
      },
    },
    cambridge: {
      getGrade(score) {
        if (score >= 90) return 'A*'; if (score >= 80) return 'A'; if (score >= 70) return 'B';
        if (score >= 60) return 'C'; if (score >= 50) return 'D'; if (score >= 40) return 'E';
        return 'F';
      },
      getPoints(score) {
        if (score >= 90) return 56; if (score >= 80) return 48; if (score >= 70) return 40;
        if (score >= 60) return 32; if (score >= 50) return 24; if (score >= 40) return 16;
        return 0;
      },
    },
  },

  nationalExams: {
    ncee: { name: 'NCEE (National Common Entrance)', level: 'primary', takenBy: 'Basic 6', subjects: ['Mathematics & General Science', 'English & Social Studies', 'Quantitative & Verbal Reasoning'], maxScore: 200 },
    bece: { name: 'BECE (Basic Education Certificate Examination)', level: 'jss', takenBy: 'JSS 3', subjects: ['English Language', 'Mathematics', 'Basic Science & Technology', 'National Values Education', 'Pre-Vocational Studies', 'Cultural & Creative Arts', 'History', 'Nigerian Languages'], maxScore: 100 },
    wassce: { name: 'WASSCE (West African Senior School Certificate)', level: 'sss', takenBy: 'SSS 3', subjects: [], maxScore: 100 },
    neco: { name: 'NECO SSCE (National Examinations Council)', level: 'sss', takenBy: 'SSS 3', subjects: [], maxScore: 100 },
    utme: { name: 'UTME (Unified Tertiary Matriculation Examination - JAMB)', level: 'sss', takenBy: 'SSS 3', subjects: ['Use of English', 'Subject 1', 'Subject 2', 'Subject 3'], maxScore: 400 },
    igcse: { name: 'Cambridge IGCSE', level: 'sss', takenBy: 'SSS 1-3', subjects: [], maxScore: 100 },
    alevel: { name: 'Cambridge A-Levels', level: 'sss', takenBy: 'SSS 3', subjects: [], maxScore: 100 },
  },
};

// ===== 2. UTILITY FUNCTIONS =====

function getClassTier(className) {
  const c = K12_CONFIG.tiers;
  var base = className ? className.replace(/[A-Z]$/, '').trim() : className;
  if (c.eccde.classes.includes(className)) return 'eccde';
  if (c.primary.subTiers.lower.classes.includes(base) || c.primary.subTiers.middle.classes.includes(base)) return 'primary';
  if (c.juniorSecondary.classes.includes(className)) return 'juniorSecondary';
  if (c.seniorSecondary.classes.includes(className)) return 'seniorSecondary';
  return 'primary';
}

function k12GetSubjects(className, stream) {
  const tier = getClassTier(className);
  if (tier === 'eccde') return K12_CONFIG.subjects.eccde;
  if (tier === 'primary' || tier === 'juniorSecondary') return K12_CONFIG.subjects[tier === 'juniorSecondary' ? 'junior' : 'primary'];
  if (tier === 'seniorSecondary' && stream) {
    const s = K12_CONFIG.tiers.seniorSecondary.streams[stream];
    return s ? s.subjects : [];
  }
  return K12_CONFIG.tiers.seniorSecondary.streams.science.subjects;
}

function k12GetGrade(className, score) {
  const tier = getClassTier(className);
  const s = Math.round(score);
  if (tier === 'eccde') return K12_CONFIG.gradingRubrics.descriptive.getLabel(s);
  if (tier === 'juniorSecondary' && ['JSS 3'].includes(className)) return K12_CONFIG.gradingRubrics.bece.getGrade(s);
  if (tier === 'seniorSecondary') return K12_CONFIG.gradingRubrics.wassce.getGrade(s);
  return K12_CONFIG.gradingRubrics.standard.getGrade(s);
}

function k12GetGradeLabel(className, score) {
  const tier = getClassTier(className);
  if (tier === 'eccde') return K12_CONFIG.gradingRubrics.descriptive.getLabel(score);
  if (tier === 'juniorSecondary' && ['JSS 3'].includes(className)) return K12_CONFIG.gradingRubrics.bece.getLabel(score);
  if (tier === 'seniorSecondary') return K12_CONFIG.gradingRubrics.wassce.getLabel(score);
  return '';
}

function k12CalculateGPA(studentId) {
  const results = data.results.filter(r => r.studentId === studentId);
  if (!results.length) return 0;
  const points = results.map(r => K12_CONFIG.gradingRubrics.wassce.getPoints(r.score) || 0);
  const total = points.reduce((a, b) => a + b, 0);
  return Math.round((total / results.length) * 100) / 100;
}

function k12CalculateGPADisplay(studentId) {
  const gpa = k12CalculateGPA(studentId);
  return `${gpa.toFixed(2)} / 8.00`;
}

function k12CalculateDescriptiveStats(studentId, term) {
  const results = data.results.filter(r => r.studentId === studentId && r.term === term);
  if (!results.length) return null;
  const levels = { exceeded: 0, achieved: 0, developing: 0, emerging: 0 };
  results.forEach(r => {
    const l = K12_CONFIG.gradingRubrics.descriptive.getLevel(r.score);
    levels[l]++;
  });
  return { total: results.length, levels, results };
}

// ===== 3. ADMIN PANELS =====

function renderSchoolSetup() {
  var tier = data.schoolTier || 'full_k12';
  var tiers = [
    { value: 'eccde', icon: 'fa-baby', color: '#38a169', label: 'Nursery Only', desc: 'Creche through Reception. Play-based assessment.', classes: 'Creche, Nursery 1 & 2, Reception' },
    { value: 'primary', icon: 'fa-book-reader', color: '#3182ce', label: 'Basic/Primary Only', desc: 'Basic 1 through Basic 6. CA + Exam grading.', classes: 'Basic 1 – Basic 6 (6 classes)' },
    { value: 'secondary', icon: 'fa-user-graduate', color: '#d69e2e', label: 'Secondary Only', desc: 'JSS 1 through SSS 3. BECE + WASSCE track.', classes: 'JSS 1–3, SSS 1–3 (6 classes)' },
    { value: 'full_k12', icon: 'fa-graduation-cap', color: '#805ad5', label: 'Full K-12', desc: 'Complete Nigerian curriculum. Creche to SSS 3.', classes: 'Creche – SSS 3 (15+ classes)' },
    { value: 'tertiary', icon: 'fa-university', color: '#e53e3e', label: 'Tertiary / Higher Ed', desc: 'University, polytechnic, or college. Semester-based GPA system.', classes: '100 Level – 500 Level (5 levels)' },
  ];

  // Build graduation options based on tier
  function getGradOptions() {
    if (tier === 'tertiary') {
      return ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'].map(function(l) {
        var sel = data.schoolProfile && data.schoolProfile.graduationClass === l;
        return '<option value="' + l + '"' + (sel ? ' selected' : '') + '>' + l + ' — Graduates at ' + l + '</option>';
      }).join('');
    }
    if (tier === 'eccde') {
      return '<option value="Reception" ' + ((data.schoolProfile && data.schoolProfile.graduationClass === 'Reception') ? 'selected' : '') + '>Reception — Graduates at Reception</option>';
    }
    if (tier === 'secondary') {
      return '<option value="SSS 3" ' + ((!data.schoolProfile || data.schoolProfile.graduationClass === 'SSS 3') ? 'selected' : '') + '>SSS 3 — Graduates at SSS 3</option>';
    }
    return ['Basic 5', 'Basic 6'].map(function(l) {
      var sel = (data.schoolProfile && data.schoolProfile.graduationClass === l) || (l === 'Basic 6' && !data.schoolProfile);
      return '<option value="' + l + '"' + (sel ? ' selected' : '') + '>Basic ' + l.slice(-1) + ' — Graduates at ' + l + '</option>';
    }).join('');
  }

  var container = document.getElementById('admin-schoolsetup');
  if (!container) return;

  var html =
    '<div style="margin-bottom:24px;">' +
    '<h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-school"></i> School Setup</h2>' +
    '<p style="color:var(--text-light);">Configure your institution type and academic structure</p>' +
    '</div>' +

    // Institution Type — card selector
    '<div class="card" style="padding:24px;margin-bottom:16px;">' +
    '<h3 style="font-weight:600;margin-bottom:4px;">Institution Type</h3>' +
    '<p style="font-size:13px;color:var(--text-light);margin-bottom:16px;">Select your institution type to auto-configure classes, subjects, grading, and report card modules.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;" id="tierCardGrid">';

  tiers.forEach(function(t) {
    var active = t.value === tier;
    html +=
      '<div class="card" style="padding:16px;cursor:pointer;text-align:center;border:2px solid ' + (active ? t.color : '#e2e8f0') + ';background:' + (active ? t.color + '10' : 'var(--card-bg)') + ';transition:var(--transition);" onclick="selectSchoolTier(\'' + t.value + '\')">' +
      '<div style="font-size:36px;color:' + (active ? t.color : 'var(--text-light)') + ';margin-bottom:8px;"><i class="fas ' + t.icon + '"></i></div>' +
      '<h4 style="font-weight:700;font-size:14px;color:' + (active ? t.color : 'var(--text)') + ';">' + t.label + '</h4>' +
      '<p style="font-size:12px;color:var(--text-light);margin-top:4px;">' + t.desc + '</p>' +
      '<div style="margin-top:8px;font-size:11px;color:var(--text-light);"><i class="fas fa-layer-group"></i> ' + t.classes + '</div>' +
      (active ? '<div style="margin-top:8px;"><span class="badge" style="background:' + t.color + ';color:#fff;">Active</span></div>' : '') +
      '</div>';
  });

  html +=
    '</div>' +
    '<button class="btn btn-primary" style="margin-top:16px;" onclick="saveSchoolSetup()"><i class="fas fa-save"></i> Save & Apply Configuration</button>' +
    '</div>' +

    // Graduation Threshold
    '<div class="card" style="padding:24px;margin-bottom:16px;">' +
    '<h3 style="font-weight:600;margin-bottom:4px;">Graduation Threshold</h3>' +
    '<p style="font-size:13px;color:var(--text-light);margin-bottom:8px;">Select the class at which students graduate and leave the institution.</p>' +
    '<select id="graduationLevelSelect" style="width:100%;max-width:400px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">' + getGradOptions() + '</select>' +
    '<button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="saveGraduationLevel()"><i class="fas fa-save"></i> Save Graduation Level</button>' +
    '</div>' +

    // Provisioned Classes
    '<div class="card" style="padding:24px;margin-bottom:16px;">' +
    '<h3 style="font-weight:600;margin-bottom:4px;">Provisioned Classes <span class="badge" id="classCountBadge" style="background:var(--primary-light);color:#fff;font-size:11px;vertical-align:middle;">0</span></h3>' +
    '<p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">Classes that are available based on the selected institution type.</p>' +
    '<div id="provisionedClasses"></div>' +
    '</div>' +

    // Tier Overview
    '<div class="card" style="padding:24px;">' +
    '<h3 style="font-weight:600;margin-bottom:4px;">Tier Overview</h3>' +
    '<p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">Academic structure breakdown for the selected configuration.</p>' +
    '<div id="tierOverview"></div>' +
    '</div>';

  container.innerHTML = html;
  renderProvisionedClasses();
  renderTierOverview();
}

function selectSchoolTier(value) {
  data.schoolTier = value;
  // Update UI without saving
  renderSchoolSetup();
  toast('Selected: ' + (function() {
    var map = { eccde: 'Nursery Only', primary: 'Basic/Primary Only', secondary: 'Secondary Only', full_k12: 'Full K-12', tertiary: 'Tertiary / Higher Ed' };
    return map[value] || value;
  })());
}

function saveSchoolSetup() {
  var sel = document.getElementById('schoolTierSelect');
  // Use last selected from data
  var tier = data.schoolTier || 'full_k12';
  var classes = getClassesForTier(tier);

  // Update graduation threshold options
  if (!data.schoolProfile) data.schoolProfile = {};
  if (tier === 'tertiary' && (!data.schoolProfile.graduationClass || data.schoolProfile.graduationClass.indexOf('Level') < 0)) {
    data.schoolProfile.graduationClass = '500 Level';
  }
  if (tier === 'eccde') data.schoolProfile.graduationClass = 'Reception';
  if (tier === 'secondary' && (!data.schoolProfile.graduationClass || data.schoolProfile.graduationClass.indexOf('SSS') < 0)) {
    data.schoolProfile.graduationClass = 'SSS 3';
  }

  saveData();
  toast('Institution type set to "' + (function() {
    var map = { eccde: 'Nursery Only', primary: 'Basic/Primary Only', secondary: 'Secondary Only', full_k12: 'Full K-12', tertiary: 'Tertiary / Higher Ed' };
    return map[tier] || tier;
  })() + '". ' + classes.length + ' class(es) provisioned.');
  logActivity('Changed institution type to ' + tier);
  renderSchoolSetup();
}

function saveGraduationLevel() {
  if (!data.schoolProfile) data.schoolProfile = {};
  data.schoolProfile.graduationClass = document.getElementById('graduationLevelSelect')?.value || 'Basic 6';
  saveData();
  toast('Graduation level set to ' + data.schoolProfile.graduationClass);
}

function getClassesForTier(tier) {
  if (tier === 'tertiary') return ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];
  var c = K12_CONFIG.tiers;
  switch (tier) {
    case 'eccde': return [...c.eccde.classes];
    case 'primary': return [...c.primary.subTiers.lower.classes, ...c.primary.subTiers.middle.classes];
    case 'secondary': return [...c.juniorSecondary.classes, ...c.seniorSecondary.classes];
    case 'full_k12': return [...c.eccde.classes, ...c.primary.subTiers.lower.classes, ...c.primary.subTiers.middle.classes, ...c.juniorSecondary.classes, ...c.seniorSecondary.classes];
    default: return [];
  }
}

function renderProvisionedClasses() {
  var container = document.getElementById('provisionedClasses');
  if (!container) return;
  var tier = data.schoolTier || 'full_k12';
  var classes = getClassesForTier(tier);
  var badge = document.getElementById('classCountBadge');
  if (badge) badge.textContent = classes.length;
  container.innerHTML = classes.length
    ? '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + classes.map(function(c) { return '<span class="badge" style="background:#bee3f8;color:#2a4365;padding:6px 14px;font-size:13px;">' + c + '</span>'; }).join('') + '</div>'
    : '<p class="empty-state">No classes provisioned. Select institution type and save.</p>';
}

function renderClassManagement() {
  var container = document.getElementById('classTeacherView');
  if (!container) return;
  var tier = data.schoolTier || 'full_k12';
  var classes = getClassesForTier(tier);
  var teachers = data.teachers || [];
  if (!data.classTeachers) data.classTeachers = {};
  if (!classes.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-school"></i><p>No classes provisioned. Go to School Setup first.</p></div>'; return; }
  var html = '<div class="table-responsive"><table><thead><tr><th>Class</th><th>Assigned Class Teacher</th><th style="width:120px;">Actions</th></tr></thead><tbody>';
  classes.forEach(function(c) {
    var current = data.classTeachers[c] || '';
    html += '<tr><td><strong>' + c + '</strong></td><td><select id="ctSelect_' + c.replace(/\s+/g,'_') + '" style="width:100%;padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;font-family:inherit;">';
    html += '<option value="">— None —</option>';
    teachers.forEach(function(t) {
      var sel = t.id === current ? ' selected' : '';
      html += '<option value="' + t.id + '"' + sel + '>' + htmlEscape(t.name) + (t.assignedClass ? ' (' + htmlEscape(t.assignedClass) + ')' : '') + '</option>';
    });
    html += '</select></td><td><button class="btn btn-sm btn-primary" onclick="saveClassTeacher(\'' + c.replace(/'/g, "\\'") + '\')"><i class="fas fa-save"></i> Assign</button></td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:12px;padding:12px;background:#fefcbf;border-radius:8px;font-size:13px;color:#744210;"><i class="fas fa-info-circle"></i> Each class can have only one class teacher. Teacher\'s current <strong>assignedClass</strong> is shown in parentheses for reference — this field is separate from the class teacher role.</div>';
  container.innerHTML = html;
}

function saveClassTeacher(className) {
  var key = 'ctSelect_' + className.replace(/\s+/g,'_');
  var sel = document.getElementById(key);
  if (!sel) return;
  if (!data.classTeachers) data.classTeachers = {};
  var teacherId = sel.value;
  if (teacherId) {
    data.classTeachers[className] = teacherId;
  } else {
    delete data.classTeachers[className];
  }
  saveData();
  toast('Class teacher ' + (teacherId ? 'assigned' : 'removed') + ' for ' + className);
  renderClassManagement();
}

function renderTierOverview() {
  var container = document.getElementById('tierOverview');
  if (!container) return;
  var tier = data.schoolTier || 'full_k12';
  var t = K12_CONFIG.tiers;

  if (tier === 'tertiary') {
    container.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;">' +
      '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
      '<div style="font-size:28px;color:#e53e3e;margin-bottom:8px;"><i class="fas fa-university"></i></div>' +
      '<h4 style="font-weight:600;font-size:14px;">Undergraduate</h4>' +
      '<p style="font-size:12px;color:var(--text-light);">5 levels (100–500)</p>' +
      '<p style="font-size:12px;color:var(--text-light);">Semester-based GPA system</p>' +
      '</div>' +
      '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
      '<div style="font-size:28px;color:#3182ce;margin-bottom:8px;"><i class="fas fa-calculator"></i></div>' +
      '<h4 style="font-weight:600;font-size:14px;">GPA Calculation</h4>' +
      '<p style="font-size:12px;color:var(--text-light);">5.0 scale, per-semester</p>' +
      '<p style="font-size:12px;color:var(--text-light);">CGPA cumulative tracking</p>' +
      '</div>' +
      '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
      '<div style="font-size:28px;color:#38a169;margin-bottom:8px;"><i class="fas fa-users"></i></div>' +
      '<h4 style="font-weight:600;font-size:14px;">Departments</h4>' +
      '<p style="font-size:12px;color:var(--text-light);">Configure faculties & departments</p>' +
      '<p style="font-size:12px;color:var(--text-light);">Program-based enrollment</p>' +
      '</div>' +
      '</div>';
    return;
  }

  container.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;">' +
    '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
    '<div style="font-size:28px;color:#38a169;margin-bottom:8px;"><i class="fas fa-baby"></i></div>' +
    '<h4 style="font-weight:600;font-size:14px;">Early Childhood</h4>' +
    '<p style="font-size:12px;color:var(--text-light);">' + t.eccde.classes.length + ' classes</p>' +
    '<p style="font-size:12px;color:var(--text-light);">Evaluation: ' + t.eccde.evalLabel + '</p>' +
    '</div>' +
    '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
    '<div style="font-size:28px;color:#3182ce;margin-bottom:8px;"><i class="fas fa-book-reader"></i></div>' +
    '<h4 style="font-weight:600;font-size:14px;">Primary</h4>' +
    '<p style="font-size:12px;color:var(--text-light);">' + (t.primary.subTiers.lower.classes.length + t.primary.subTiers.middle.classes.length) + ' classes</p>' +
    '<p style="font-size:12px;color:var(--text-light);">Evaluation: ' + t.primary.evalLabel + '</p>' +
    '</div>' +
    '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
    '<div style="font-size:28px;color:#d69e2e;margin-bottom:8px;"><i class="fas fa-user-graduate"></i></div>' +
    '<h4 style="font-weight:600;font-size:14px;">Junior Secondary</h4>' +
    '<p style="font-size:12px;color:var(--text-light);">' + t.juniorSecondary.classes.length + ' classes</p>' +
    '<p style="font-size:12px;color:var(--text-light);">BECE grade mapping at JSS 3</p>' +
    '</div>' +
    '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
    '<div style="font-size:28px;color:#805ad5;margin-bottom:8px;"><i class="fas fa-graduation-cap"></i></div>' +
    '<h4 style="font-weight:600;font-size:14px;">Senior Secondary</h4>' +
    '<p style="font-size:12px;color:var(--text-light);">' + t.seniorSecondary.classes.length + ' classes</p>' +
    '<p style="font-size:12px;color:var(--text-light);">3 streams, cumulative GPA</p>' +
    '</div>' +
    '</div>';
}

// ===== 4. SUBJECT MANAGEMENT =====
function renderSubjectManagement() {
  const container = document.getElementById('admin-subjects');
  if (!container) return;
  const tier = data.schoolTier || 'full_k12';
  const allClasses = getClassesForTier(tier);
  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-book-open"></i> Subject Management</h2>
      <p style="color:var(--text-light);">View subjects per class tier. SSS streams shown for Senior Secondary.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
      <div class="card" style="padding:20px;">
        <h3 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-baby" style="color:#38a169;"></i> Early Childhood</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${K12_CONFIG.subjects.eccde.map(s => `<span class="badge" style="background:#f0fff4;color:#22543d;font-size:12px;">${s}</span>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <h3 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-book-reader" style="color:#3182ce;"></i> Primary (1–6)</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${K12_CONFIG.subjects.primary.map(s => `<span class="badge" style="background:#ebf8ff;color:#2a4365;font-size:12px;">${s}</span>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <h3 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-user-graduate" style="color:#d69e2e;"></i> Junior Secondary (JSS 1–3)</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${K12_CONFIG.subjects.junior.map(s => `<span class="badge" style="background:#fffff0;color:#744210;font-size:12px;">${s}</span>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <h3 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-graduation-cap" style="color:#805ad5;"></i> Senior Secondary Streams</h3>
        ${Object.entries(K12_CONFIG.tiers.seniorSecondary.streams).map(([key, st]) => `
          <div style="margin-bottom:10px;">
            <strong style="font-size:13px;">${st.name}:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
              ${st.subjects.map(s => `<span class="badge" style="background:#faf5ff;color:#44337a;font-size:11px;">${s}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="padding:20px;margin-top:16px;">
      <h3 style="font-weight:600;font-size:15px;margin-bottom:12px;">Class-Subject Mapping</h3>
      <div id="classSubjectMap"></div>
    </div>`;
  renderClassSubjectMap();
}

function renderClassSubjectMap() {
  var container = document.getElementById('classSubjectMap');
  if (!container) return;
  const tier = data.schoolTier || 'full_k12';
  const classes = getClassesForTier(tier);
  container.innerHTML = classes.length
    ? `<table class="admin-table"><thead><tr><th>Class</th><th>Tier</th><th>Subjects</th><th>Evaluation</th></tr></thead><tbody>
        ${classes.map(c => {
          const t = getClassTier(c);
          const subs = k12GetSubjects(c, 'science');
          const evalType = t === 'eccde' ? 'Descriptive Levels' : t === 'juniorSecondary' && c === 'JSS 3' ? 'BECE Grade' : t === 'seniorSecondary' ? 'WASSCE / GPA' : 'CA + Exam';
          return `<tr><td><strong>${c}</strong></td><td><span class="badge" style="background:#e2e8f0;color:#2d3748;">${t}</span></td><td style="font-size:13px;">${subs.slice(0, 5).join(', ')}${subs.length > 5 ? '…' : ''}</td><td>${evalType}</td></tr>`;
        }).join('')}
      </tbody></table>`
    : '<p class="empty-state">No classes configured</p>';
}

// ===== 5. STREAM MANAGEMENT =====
function renderStreamManagement() {
  const container = document.getElementById('admin-streams');
  if (!container) return;
  const sssStudents = data.students.filter(s => getClassTier(s.class) === 'seniorSecondary');
  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-code-branch"></i> Stream Management</h2>
      <p style="color:var(--text-light);">Assign academic streams to Senior Secondary students (Science, Commercial, Humanities/Arts)</p>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
      ${Object.entries(K12_CONFIG.tiers.seniorSecondary.streams).map(([key, st]) => `
        <div style="flex:1;min-width:200px;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;cursor:pointer;" onclick="filterStream('${key}')">
          <div style="font-size:32px;margin-bottom:8px;">
            <i class="fas ${key === 'science' ? 'fa-flask' : key === 'commercial' ? 'fa-chart-line' : 'fa-palette'}"></i>
          </div>
          <h4 style="font-weight:600;font-size:14px;">${st.name}</h4>
          <p style="font-size:12px;color:var(--text-light);">${sssStudents.filter(s => s.stream === key).length} students</p>
        </div>
      `).join('')}
      <div style="flex:1;min-width:200px;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;cursor:pointer;" onclick="filterStream('')">
        <div style="font-size:32px;margin-bottom:8px;"><i class="fas fa-users"></i></div>
        <h4 style="font-weight:600;font-size:14px;">Unassigned</h4>
        <p style="font-size:12px;color:var(--text-light);">${sssStudents.filter(s => !s.stream).length} students</p>
      </div>
    </div>
    <div class="card" style="padding:20px;">
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <input type="text" id="streamSearch" placeholder="Search students..." oninput="renderStreamTable()" style="flex:1;min-width:200px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">
      </div>
      <div id="streamTable"></div>
    </div>`;
  renderStreamTable();
}

let currentStreamFilter = '';

function filterStream(stream) { currentStreamFilter = stream; renderStreamTable(); }

function renderStreamTable() {
  var container = document.getElementById('streamTable');
  if (!container) return;
  let sssStudents = data.students.filter(s => getClassTier(s.class) === 'seniorSecondary');
  if (currentStreamFilter) sssStudents = sssStudents.filter(s => s.stream === currentStreamFilter);
  else sssStudents = sssStudents.filter(s => !s.stream);
  const q = (document.getElementById('streamSearch')?.value || '').toLowerCase();
  if (q) sssStudents = sssStudents.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  if (!sssStudents.length) {
    container.innerHTML = '<p class="empty-state">No students to display</p>';
    return;
  }
  container.innerHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Current Stream</th><th>Action</th></tr></thead><tbody>
    ${sssStudents.map(s => {
      const currentStream = s.stream || 'unassigned';
      const opts = Object.entries(K12_CONFIG.tiers.seniorSecondary.streams).map(([k, st]) =>
        `<option value="${k}" ${k === s.stream ? 'selected' : ''}>${st.name}</option>`).join('');
      return `<tr><td><strong>${s.id}</strong></td><td>${s.name}</td><td>${s.class}</td>
        <td><span class="badge" style="background:${currentStream === 'unassigned' ? '#fed7d7' : '#c6f6d5'};color:${currentStream === 'unassigned' ? '#9b2c2c' : '#22543d'};">${currentStream}</span></td>
        <td><select class="stream-select" data-sid="${s.id}" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:6px;font-family:inherit;font-size:13px;">
          <option value="">— Unassigned —</option>${opts}
        </select>
        <button class="btn btn-sm btn-primary" onclick="saveStream('${s.id}')"><i class="fas fa-check"></i></button></td>
      </tr>`;
    }).join('')}
  </tbody></table>`;
}

function saveStream(id) {
  const s = getStudent(id);
  if (!s) return;
  var _ss = document.querySelector(`.stream-select[data-sid="${id}"]`);
  var val = (_ss?.value ?? '');
  s.stream = val || '';
  saveData();
  logActivity(`Updated stream for ${s.name} (${id}): ${val || 'unassigned'}`);
  renderStreamTable();
  toast(`Stream updated for ${s.name}`);
}

// ===== 6. EXAM MODULES (National Exams) =====
function renderExamModules() {
  const container = document.getElementById('admin-exammodules');
  if (!container) return;
  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-globe-africa"></i> National Examination Engine</h2>
      <p style="color:var(--text-light);">Manage external exam registrations, mock scores, and predictive tracking for NCEE, BECE, WASSCE, NECO, UTME, and Cambridge</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px;">
      ${Object.entries(K12_CONFIG.nationalExams).map(([key, exam]) => `
        <div class="card" style="padding:20px;cursor:pointer;transition:var(--transition);" onclick="showExamPanel('${key}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='#e2e8f0'">
          <div style="font-size:28px;margin-bottom:8px;"><i class="fas ${key === 'ncee' ? 'fa-door-open' : key === 'bece' ? 'fa-certificate' : key === 'wassce' ? 'fa-scroll' : key === 'neco' ? 'fa-file-alt' : key === 'utme' ? 'fa-laptop' : key === 'igcse' ? 'fa-globe' : 'fa-university'}"></i></div>
          <h4 style="font-weight:600;font-size:14px;margin-bottom:4px;">${exam.name}</h4>
          <p style="font-size:12px;color:var(--text-light);">Taken by ${exam.takenBy} · Max ${exam.maxScore} pts</p>
        </div>
      `).join('')}
    </div>
    <div class="card" style="padding:20px;" id="examPanelDetail">
      <p class="empty-state">Click an exam card above to manage registrations and scores</p>
    </div>`;
}

function showExamPanel(key) {
  const exam = K12_CONFIG.nationalExams[key];
  var container = document.getElementById('examPanelDetail');
  if (!container) return;
  const eligibleStudents = data.students.filter(s => s.class === exam.takenBy);
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <div>
        <h3 style="font-weight:600;font-size:17px;">${exam.name}</h3>
        <p style="font-size:13px;color:var(--text-light);">Max Score: ${exam.maxScore} · Subjects: ${exam.subjects.join(', ')}</p>
      </div>
      <button class="btn btn-primary" onclick="showAddExamRegModal('${key}')"><i class="fas fa-plus"></i> Add Registration</button>
    </div>
    <div id="examRegTable">
      ${renderExamRegTable(key, eligibleStudents)}
    </div>`;
}

function renderExamRegTable(key, eligibleStudents) {
  const regs = data.examRegistrations?.filter(r => r.examType === key) || [];
  if (!regs.length && !eligibleStudents.length) return '<p class="empty-state">No registrations yet</p>';
  const allRows = eligibleStudents.map(s => {
    const reg = regs.find(r => r.studentId === s.id);
    return { student: s, reg: reg };
  });
  return `<table class="admin-table"><thead><tr><th>Student</th><th>Reg Number</th><th>Score</th><th>Grade</th><th>Actions</th></tr></thead><tbody>
    ${allRows.map(r => {
      const grade = r.reg && r.reg.score != null ? k12GetGradeForExam(key, r.reg.score) : '-';
      return `<tr><td>${r.student.name} (${r.student.id})</td>
        <td>${r.reg?.regNumber || '<span style="color:#a0aec0;">Not registered</span>'}</td>
        <td>${r.reg?.score != null ? r.reg.score + '/' + K12_CONFIG.nationalExams[key].maxScore : '-'}</td>
        <td>${grade}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="showEditExamRegModal('${key}','${r.student.id}')"><i class="fas fa-edit"></i></button>
        </td>
      </tr>`;
    }).join('')}
  </tbody></table>`;
}

function k12GetGradeForExam(examType, score) {
  if (examType === 'bece') return K12_CONFIG.gradingRubrics.bece.getGrade(score);
  if (examType === 'wassce' || examType === 'neco') return K12_CONFIG.gradingRubrics.wassce.getGrade(score);
  if (examType === 'igcse' || examType === 'alevel') return K12_CONFIG.gradingRubrics.cambridge.getGrade(score);
  if (examType === 'utme') return Math.round((score / 400) * 100) + '%';
  return Math.round(score / 2) + '%';
}

function showAddExamRegModal(examType) {
  const exam = K12_CONFIG.nationalExams[examType];
  const eligibleStudents = data.students.filter(s => s.class === exam.takenBy);
  const opts = eligibleStudents.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus"></i> Register Student — ${exam.name}</h3>
    <div class="form-grid">
      <div class="form-group"><label>Student</label><select id="fExamRegStudent">${opts}</select></div>
      <div class="form-group"><label>Registration Number</label><input type="text" id="fExamRegNumber" placeholder="e.g. 4123456789"></div>
      <div class="form-group"><label>Score (max ${exam.maxScore})</label><input type="number" id="fExamRegScore" min="0" max="${exam.maxScore}" placeholder="Score"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveExamReg('${examType}')"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveExamReg(examType) {
  var studentId = (document.getElementById('fExamRegStudent')?.value ?? '');
  var regNumber = (document.getElementById('fExamRegNumber')?.value ?? '').trim();
  var score = (document.getElementById('fExamRegScore')?.value ?? '');
  if (!data.examRegistrations) data.examRegistrations = [];
  const existing = data.examRegistrations.findIndex(r => r.examType === examType && r.studentId === studentId);
  const entry = { examType, studentId, regNumber: regNumber || '', score: score !== '' ? parseInt(score, 10) : null };
  if (existing >= 0) data.examRegistrations[existing] = entry;
  else data.examRegistrations.push(entry);
  saveData();
  logActivity(`Saved ${examType} registration for ${getStudent(studentId)?.name}`);
  closeModal();
  renderExamModules();
  toast('Exam registration saved');
}

function showEditExamRegModal(examType, studentId) {
  const exam = K12_CONFIG.nationalExams[examType];
  const reg = (data.examRegistrations || []).find(r => r.examType === examType && r.studentId === studentId);
  openModal(`
    <h3><i class="fas fa-edit"></i> ${exam.name} — ${getStudent(studentId)?.name}</h3>
    <div class="form-grid">
      <div class="form-group"><label>Registration Number</label><input type="text" id="fExamRegNumber" value="${reg?.regNumber || ''}"></div>
      <div class="form-group"><label>Score (max ${exam.maxScore})</label><input type="number" id="fExamRegScore" min="0" max="${exam.maxScore}" value="${reg?.score ?? ''}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveExamReg('${examType}')"><i class="fas fa-save"></i> Update</button>
    </div>
  `);
}

// ===== 7. UTME CBT MOCK INTERFACE =====
function renderUTMEMock() {
  const container = document.getElementById('admin-utmemock');
  if (!container) return;
  const sss3 = data.students.filter(s => s.class === 'SSS 3');
  const regs = (data.examRegistrations || []).filter(r => r.examType === 'utme');
  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-laptop-code"></i> UTME CBT Mock Interface</h2>
      <p style="color:var(--text-light);">JAMB-style computer-based test mock scores and predictive tracking (max 400)</p>
    </div>
    <div class="card" style="padding:20px;">
      ${sss3.length
        ? `<table class="admin-table"><thead><tr><th>Student</th><th>Reg Number</th><th>Use of English</th><th>Subject 1</th><th>Subject 2</th><th>Subject 3</th><th>Total /400</th><th>Actions</th></tr></thead><tbody>
          ${sss3.map(s => {
            const reg = regs.find(r => r.studentId === s.id);
            const subjects = reg?.subjectScores || {};
            const total = Object.values(subjects).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
            return `<tr><td><strong>${s.name}</strong></td>
              <td>${reg?.regNumber || '-'}</td>
              <td><input type="number" class="utme-input" data-sid="${s.id}" data-subj="English" value="${subjects.English || ''}" min="0" max="100" style="width:65px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;"></td>
              <td><input type="number" class="utme-input" data-sid="${s.id}" data-subj="Subject1" value="${subjects.Subject1 || ''}" min="0" max="100" style="width:65px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;"></td>
              <td><input type="number" class="utme-input" data-sid="${s.id}" data-subj="Subject2" value="${subjects.Subject2 || ''}" min="0" max="100" style="width:65px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;"></td>
              <td><input type="number" class="utme-input" data-sid="${s.id}" data-subj="Subject3" value="${subjects.Subject3 || ''}" min="0" max="100" style="width:65px;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;"></td>
              <td><strong id="utme-total-${s.id}">${total || '-'}</strong></td>
              <td><button class="btn btn-sm btn-primary" onclick="saveUTMEScores('${s.id}')"><i class="fas fa-save"></i></button></td>
            </tr>`;
          }).join('')}
        </tbody></table>`
        : '<p class="empty-state">No SSS 3 students found</p>'
      }
      <button class="btn btn-primary" style="margin-top:12px;" onclick="saveAllUTMEScores()"><i class="fas fa-save"></i> Save All UTME Scores</button>
    </div>`;
}

function saveUTMEScores(studentId) {
  const inputs = document.querySelectorAll(`.utme-input[data-sid="${studentId}"]`);
  const scores = {};
  inputs.forEach(inp => scores[inp.dataset.subj] = parseInt(inp.value, 10) || 0);
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (!data.examRegistrations) data.examRegistrations = [];
  let reg = data.examRegistrations.find(r => r.examType === 'utme' && r.studentId === studentId);
  if (reg) { reg.subjectScores = scores; reg.score = total; }
  else data.examRegistrations.push({ examType: 'utme', studentId, regNumber: '', subjectScores: scores, score: total });
  saveData();
  var _ut = document.getElementById(`utme-total-${studentId}`); if (_ut) _ut.textContent = total;
  toast(`UTME scores saved for ${getStudent(studentId)?.name}`);
}

function saveAllUTMEScores() {
  const sss3 = data.students.filter(s => s.class === 'SSS 3');
  sss3.forEach(s => saveUTMEScores(s.id));
  toast('All UTME scores saved');
}

// ===== 8. STUDENT PORTAL INTEGRATION =====

function renderStudentStreamInfo() {
  if (!currentStudent) return;
  const s = currentStudent;
  const tier = getClassTier(s.class);
  const streamInfo = document.getElementById('stuStreamInfo');
  if (!streamInfo) return;
  if (tier === 'seniorSecondary' && s.stream) {
    const st = K12_CONFIG.tiers.seniorSecondary.streams[s.stream];
    streamInfo.innerHTML = `<div class="card" style="padding:12px 16px;margin-bottom:16px;border-left:4px solid #805ad5;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:24px;color:#805ad5;"><i class="fas fa-code-branch"></i></div>
        <div><strong style="font-size:15px;">${st?.name || s.stream} Stream</strong>
        <p style="font-size:13px;color:var(--text-light);">Subjects: ${st?.subjects.join(', ') || ''}</p></div>
      </div>
    </div>`;
  } else if (tier === 'seniorSecondary' && !s.stream) {
    streamInfo.innerHTML = `<div class="card" style="padding:12px 16px;margin-bottom:16px;border-left:4px solid #ecc94b;">
      <p style="font-size:14px;color:#744210;"><i class="fas fa-exclamation-triangle"></i> Stream not yet assigned. Contact admin.</p>
    </div>`;
  } else {
    streamInfo.innerHTML = '';
  }
}

function renderStudentExamRegistrations() {
  if (!currentStudent) return;
  const s = currentStudent;
  const container = document.getElementById('stuExamRegs');
  if (!container) return;
  const regs = (data.examRegistrations || []).filter(r => r.studentId === s.id);
  if (!regs.length) { container.innerHTML = ''; return; }
  container.innerHTML = `<div class="card" style="padding:16px;margin-bottom:16px;">
    <h4 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-scroll"></i> External Exam Registrations</h4>
    <div style="display:grid;gap:8px;">
      ${regs.map(r => {
        const exam = K12_CONFIG.nationalExams[r.examType];
        const grade = r.score != null ? k12GetGradeForExam(r.examType, r.score) : '-';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f7fafc;border-radius:6px;font-size:13px;">
          <span><strong>${exam?.name || r.examType}</strong> ${r.regNumber ? '· ' + r.regNumber : ''}</span>
          <span>Score: ${r.score != null ? r.score + '/' + (exam?.maxScore || '') : 'Not taken'} · Grade: ${grade}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderStudentGPA() {
  if (!currentStudent) return;
  const s = currentStudent;
  const tier = getClassTier(s.class);
  const container = document.getElementById('stuGPA');
  if (!container) return;
  if (tier === 'seniorSecondary') {
    const gpa = k12CalculateGPA(s.id);
    const results = data.results.filter(r => r.studentId === s.id);
    const coloredGrade = (score) => {
      const g = K12_CONFIG.gradingRubrics.wassce.getGrade(score);
      const c = score >= 70 ? '#38a169' : score >= 50 ? '#d69e2e' : '#e53e3e';
      return `<span style="color:${c};font-weight:600;">${g}</span>`;
    };
    container.innerHTML = `
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h4 style="font-weight:600;font-size:15px;"><i class="fas fa-chart-line"></i> Cumulative GPA</h4>
            <p style="font-size:13px;color:var(--text-light);">WASSCE-grade point average across all terms</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:28px;font-weight:700;color:${gpa >= 5 ? '#38a169' : gpa >= 3 ? '#d69e2e' : '#e53e3e'};">${gpa.toFixed(2)}</span>
            <span style="font-size:14px;color:var(--text-light);"> / 8.00</span>
          </div>
        </div>
        ${results.length ? `<div style="margin-top:12px;max-height:200px;overflow-y:auto;">
          <table class="admin-table"><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Term</th></tr></thead><tbody>
            ${results.map(r => `<tr><td>${r.subject}</td><td>${r.score}</td><td>${coloredGrade(r.score)}</td><td>${r.term}</td></tr>`).join('')}
          </tbody></table>
        </div>` : '<p class="empty-state">No results recorded yet</p>'}
      </div>`;
  } else {
    container.innerHTML = '';
  }
}

function renderStudentReportCard() {
  if (!currentStudent) return;
  const s = currentStudent;
  const container = document.getElementById('stuReportCard');
  if (!container) return;
  const terms = data.academicTerms || [];
  container.innerHTML = `
    <div class="card" style="padding:20px;">
      <h4 style="font-weight:600;font-size:15px;margin-bottom:12px;"><i class="fas fa-file-alt"></i> Report Card</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
        <select id="reportCardTermSelect" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;flex:1;min-width:150px;">
          ${terms.map(t => `<option value="${t.name}" ${t.isActive ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="showStudentReportCard()"><i class="fas fa-eye"></i> View Report Card</button>
        <button class="btn btn-secondary" onclick="printStudentReportCard()"><i class="fas fa-print"></i> Print</button>
      </div>
      <div id="reportCardPreview"></div>
    </div>`;
}

function showStudentReportCard() {
  if (!currentStudent) return;
  var _rc = document.getElementById('reportCardTermSelect');
  var term = _rc ? _rc.value : '';
  const html = k12GenerateReportCardHTML(currentStudent.id, term);
  var _rp = document.getElementById('reportCardPreview'); if (_rp) _rp.innerHTML = html;
}

function printStudentReportCard() {
  if (!currentStudent) return;
  var _rc = document.getElementById('reportCardTermSelect');
  var term = _rc ? _rc.value : '';
  const html = k12GenerateReportCardHTML(currentStudent.id, term);
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Report Card - ${currentStudent.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto;}
    .rc-table{width:100%;border-collapse:collapse;margin:16px 0;}
    .rc-table th,.rc-table td{border:1px solid #ccc;padding:8px 12px;text-align:left;}
    .rc-table th{background:#1a3a5c;color:#fff;}
    .rc-header{text-align:center;margin-bottom:24px;border-bottom:3px double #1a3a5c;padding-bottom:16px;}
    .rc-header img{height:60px;}
    .rc-header h1{font-size:22px;color:#1a3a5c;margin:8px 0 4px;}
    .rc-header p{color:#666;font-size:14px;margin:2px 0;}
    .rc-info{display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;gap:8px;}
    .rc-info div{padding:8px;background:#f7fafc;border-radius:6px;flex:1;}
    .rc-gpa{font-size:20px;font-weight:700;color:#1a3a5c;text-align:center;padding:16px;background:#ebf8ff;border-radius:8px;margin-top:12px;}
    .rc-footer{text-align:center;margin-top:24px;font-size:12px;color:#999;border-top:1px solid #e2e8f0;padding-top:12px;}
    </style></head><body>${html}</body></html>`);
  w.document.close();
  w.print();
}

// ===== 9. REPORT CARD GENERATION =====

function k12GenerateReportCardHTML(studentId, term) {
  const student = getStudent(studentId);
  if (!student) return '<p class="empty-state">Student not found</p>';
  var schoolName = (data && data.schoolName) ? data.schoolName : 'EduVerse';
  var schoolMotto = (data && data.schoolMotto) ? data.schoolMotto : 'EduVerse';
  var schoolLogoUrl = '';
  try { if (data && data.schoolProfile && data.schoolProfile.logoUrl) schoolLogoUrl = data.schoolProfile.logoUrl; } catch(e) {}
  const tier = getClassTier(student.class);
  const results = data.results.filter(r => r.studentId === studentId && r.term === term);
  const cat = data.cat.filter(c => c.studentId === studentId && c.subject);

  let body = '';
  if (tier === 'eccde') body = k12ReportCardECCDE(student, results, term);
  else if (tier === 'primary' || tier === 'juniorSecondary') body = k12ReportCardBasic(student, results, cat, term);
  else if (tier === 'seniorSecondary') body = k12ReportCardSSS(student, results, term);

  const schoolTierName = data.schoolTier ? getClassesForTier(data.schoolTier).length + ' classes' : 'Full K-12';
  return `
    <div class="rc-header">
      ${schoolLogoUrl ? '<img src="' + htmlEscape(schoolLogoUrl) + '" alt="' + htmlEscape(schoolName) + '" style="max-height:60px;">' : ''}
      <h1>${htmlEscape(schoolName)}</h1>
      <p>${htmlEscape(schoolMotto)}</p>
      <p style="font-size:13px;">${htmlEscape(term)} · ${htmlEscape(schoolTierName)}</p>
    </div>
    <div class="rc-info">
      <div><strong>Student:</strong> ${htmlEscape(student.name)}</div>
      <div><strong>ID:</strong> ${htmlEscape(student.id)}</div>
      <div><strong>Class:</strong> ${htmlEscape(student.class)}${tier === 'seniorSecondary' && student.stream ? ' (' + htmlEscape(K12_CONFIG.tiers.seniorSecondary.streams[student.stream]?.name || student.stream) + ')' : ''}</div>
    </div>
    ${body}
    <div class="rc-footer">
      <p>Generated on ${new Date().toLocaleDateString('en-NG')} · ${htmlEscape(schoolName)}</p>
      <p><em>${htmlEscape(schoolMotto)}</em></p>
    </div>`;
}

function k12ReportCardECCDE(student, results, term) {
  const desc = K12_CONFIG.gradingRubrics.descriptive;
  if (!results.length) return '<p class="empty-state">No results recorded for this term</p>';
  return `
    <table class="rc-table">
      <thead><tr><th>Subject</th><th>Score</th><th>Performance Level</th></tr></thead>
      <tbody>${results.map(r => `<tr><td>${r.subject}</td><td>${r.score}%</td><td><span style="font-weight:600;color:${r.score >= 80 ? '#38a169' : r.score >= 60 ? '#d69e2e' : r.score >= 40 ? '#dd6b20' : '#e53e3e'}">${desc.getLabel(r.score)}</span></td></tr>`).join('')}</tbody>
    </table>
    ${k12ReportCardRemarks(results, 'eccde')}`;
}

function k12ReportCardBasic(student, results, cat, term) {
  if (!results.length) return '<p class="empty-state">No results recorded for this term</p>';
  const tier = getClassTier(student.class);
  const isJSS3 = student.class === 'JSS 3';
  return `
    <table class="rc-table">
      <thead><tr><th>Subject</th><th>CA (40%)</th><th>Exam (60%)</th><th>Total</th><th>Grade</th></tr></thead>
      <tbody>${results.map(r => {
        const ca = cat.filter(c => c.subject === r.subject);
        const caAvg = ca.length ? Math.round(ca.reduce((a, c) => a + (c.test1 + c.test2 + c.test3) / 3, 0) / ca.length) : 0;
        const caPortion = Math.round((caAvg / 20) * 40);
        const examPortion = Math.round(r.score * 0.6);
        const total = caPortion + examPortion;
        const grade = isJSS3 ? K12_CONFIG.gradingRubrics.bece.getGrade(total) : K12_CONFIG.gradingRubrics.standard.getGrade(total);
        return `<tr><td>${r.subject}</td><td>${caPortion}</td><td>${examPortion}</td><td><strong>${total}</strong></td><td><span style="font-weight:600;color:${total >= 70 ? '#38a169' : total >= 50 ? '#d69e2e' : '#e53e3e'}">${grade}</span></td></tr>`;
      }).join('')}</tbody>
    </table>
    ${isJSS3 ? '<p style="font-size:13px;color:var(--text-light);margin-top:8px;"><em>Grades follow BECE (Junior WAEC) rubric: A (Distinction), B (Upper Credit), C (Lower Credit), P (Pass), F (Fail)</em></p>' : ''}
    ${k12ReportCardRemarks(results, 'basic')}`;
}

function k12ReportCardSSS(student, results, term) {
  if (!results.length) return '<p class="empty-state">No results recorded for this term</p>';
  const wassce = K12_CONFIG.gradingRubrics.wassce;
  const totalPoints = results.reduce((sum, r) => sum + wassce.getPoints(r.score), 0);
  const termGPA = results.length ? (totalPoints / results.length) : 0;
  const cumGPA = k12CalculateGPA(student.id);
  return `
    <table class="rc-table">
      <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Points</th><th>Remark</th></tr></thead>
      <tbody>${results.map(r => {
        const pts = wassce.getPoints(r.score);
        return `<tr><td>${r.subject}</td><td>${r.score}</td><td><span style="font-weight:600;color:${r.score >= 70 ? '#38a169' : r.score >= 50 ? '#d69e2e' : '#e53e3e'}">${wassce.getGrade(r.score)}</span></td><td>${pts}</td><td>${wassce.getLabel(r.score)}</td></tr>`;
      }).join('')}</tbody>
    </table>
    <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;">
      <div class="rc-gpa"><span>Term GPA:</span> <strong>${termGPA.toFixed(2)} / 8.00</strong></div>
      <div class="rc-gpa"><span>Cumulative GPA:</span> <strong style="color:${cumGPA >= 5 ? '#38a169' : cumGPA >= 3 ? '#d69e2e' : '#e53e3e'};">${cumGPA.toFixed(2)} / 8.00</strong></div>
    </div>
    <p style="font-size:13px;color:var(--text-light);margin-top:8px;"><em>Grades follow WASSCE/NECO rubric: A1 (Excellent), B2-B3 (Very Good), C4-C6 (Credit), D7-E8 (Pass), F9 (Fail)</em></p>
    ${k12ReportCardRemarks(results, 'sss')}`;
}

function k12ReportCardRemarks(results, tier) {
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
  let remark = '';
  if (tier === 'eccde') {
    if (avg >= 80) remark = 'Excellent progress! The child consistently exceeds expectations across all learning areas.';
    else if (avg >= 60) remark = 'Good progress. The child is achieving expected developmental milestones.';
    else if (avg >= 40) remark = 'Developing. The child is making progress with support in some areas.';
    else remark = 'Additional support is recommended. Please consult with the class teacher.';
  } else if (tier === 'sss') {
    const gpa = (results.reduce((s, r) => s + K12_CONFIG.gradingRubrics.wassce.getPoints(r.score), 0) / results.length) || 0;
    if (gpa >= 6) remark = 'Outstanding performance. Maintain focus for excellent WASSCE/NECO results.';
    else if (gpa >= 4) remark = 'Good performance. Consistent effort will lead to strong grades.';
    else if (gpa >= 2) remark = 'Satisfactory. More effort needed in key subjects. Seek extra tutorials where necessary.';
    else remark = 'Requires significant improvement. Please meet with the academic counselor.';
  } else {
    if (avg >= 80) remark = 'Excellent performance. Keep up the good work!';
    else if (avg >= 60) remark = 'Very good performance. Consistent effort shows positive results.';
    else if (avg >= 50) remark = 'Satisfactory. More focus is needed in some subjects.';
    else remark = 'Needs improvement. Please seek additional help and study more.';
  }
  return `<div style="margin-top:12px;padding:12px;background:#f7fafc;border-radius:8px;border-left:4px solid #3182ce;">
    <strong style="font-size:14px;">Teacher's Remark:</strong>
    <p style="font-size:13px;margin-top:4px;">${remark}</p>
  </div>`;
}

// ===== 10. REPORT CARD ADMIN PANEL =====
function renderReportCardsAdmin() {
  const container = document.getElementById('admin-reportcards');
  if (!container) return;
  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-file-alt"></i> Report Cards</h2>
      <p style="color:var(--text-light);">Generate and view tier-appropriate report cards for any student and term</p>
    </div>
    <div class="card" style="padding:20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
        <select id="rcStudentSelect" style="flex:2;min-width:200px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">
          ${data.students.map(s => `<option value="${s.id}">${s.name} (${s.id}) - ${s.class}</option>`).join('')}
        </select>
        <select id="rcTermSelect" style="flex:1;min-width:150px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;">
          ${(data.academicTerms || []).map(t => `<option value="${t.name}" ${t.isActive ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="previewReportCardAdmin()"><i class="fas fa-eye"></i> Preview</button>
        <button class="btn btn-secondary" onclick="printReportCardAdmin()"><i class="fas fa-print"></i> Print</button>
      </div>
      <div id="adminReportCardPreview"></div>
    </div>`;
}

function previewReportCardAdmin() {
  var studentId = (document.getElementById('rcStudentSelect')?.value ?? '');
  var term = (document.getElementById('rcTermSelect')?.value ?? '');
  const html = k12GenerateReportCardHTML(studentId, term);
  var _arp = document.getElementById('adminReportCardPreview'); if (_arp) _arp.innerHTML = html;
}

function printReportCardAdmin() {
  var studentId = (document.getElementById('rcStudentSelect')?.value ?? '');
  var term = (document.getElementById('rcTermSelect')?.value ?? '');
  const html = k12GenerateReportCardHTML(studentId, term);
  const s = getStudent(studentId);
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Report Card - ${s?.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto;}
    .rc-table{width:100%;border-collapse:collapse;margin:16px 0;}
    .rc-table th,.rc-table td{border:1px solid #ccc;padding:8px 12px;text-align:left;}
    .rc-table th{background:#1a3a5c;color:#fff;}
    .rc-header{text-align:center;margin-bottom:24px;border-bottom:3px double #1a3a5c;padding-bottom:16px;}
    .rc-header img{height:60px;}
    .rc-header h1{font-size:22px;color:#1a3a5c;margin:8px 0 4px;}
    .rc-header p{color:#666;font-size:14px;margin:2px 0;}
    .rc-info{display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;gap:8px;}
    .rc-info div{padding:8px;background:#f7fafc;border-radius:6px;flex:1;}
    .rc-gpa{font-size:18px;font-weight:700;color:#1a3a5c;padding:12px;background:#ebf8ff;border-radius:8px;text-align:center;flex:1;}
    .rc-footer{text-align:center;margin-top:24px;font-size:12px;color:#999;border-top:1px solid #e2e8f0;padding-top:12px;}
    </style></head><body>${html}</body></html>`);
  w.document.close();
  w.print();
}
