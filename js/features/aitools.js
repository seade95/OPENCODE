// EduVerse - aitools module
// Extracted from features.js

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
  html += '<div class="form-group"><label>Class</label><input type="text" id="aiLsnClass" placeholder="e.g. Basic 5A" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;" value="' + htmlEscape(currentTeacher ? currentTeacher.assignedClass : '') + '"></div>';
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
