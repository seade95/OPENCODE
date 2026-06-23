// EDUVERSE - Activity Games Module
// Interactive extracurricular simulations: Spelling Bee, Math Sprint, Quiz Bowl, Word Scramble, Typing Test

// ===== GAME DEFINITIONS =====
var ACTIVITY_GAMES = {
  spelling_bee: { name: 'Spelling Bee', icon: 'fa-spell-check', color: '#8b5cf6', desc: 'Read the definition, type the correct spelling', duration: 120, questions: 10 },
  math_sprint: { name: 'Math Sprint', icon: 'fa-calculator', color: '#ef4444', desc: 'Solve as many math problems as you can', duration: 90, questions: 20 },
  quiz_bowl: { name: 'Quiz Bowl', icon: 'fa-question-circle', color: '#3b82f6', desc: 'Multiple choice general knowledge quiz', duration: 180, questions: 15 },
  word_scramble: { name: 'Word Scramble', icon: 'fa-font', color: '#10b981', desc: 'Unscramble the letters to form the correct word', duration: 120, questions: 10 },
  typing_test: { name: 'Typing Test', icon: 'fa-keyboard', color: '#f59e0b', desc: 'Type the displayed passage as fast and accurately as possible', duration: 60, questions: 1 }
};

// ===== CONTENT POOLS =====

var GAME_CONTENT = {
  spelling_bee: [
    { word: 'abandon', def: 'To leave behind or give up completely' },
    { word: 'benefit', def: 'An advantage or profit gained from something' },
    { word: 'capture', def: 'To take possession or control of by force' },
    { word: 'develop', def: 'To grow or cause to grow gradually' },
    { word: 'embrace', def: 'To hold closely in the arms as a sign of affection' },
    { word: 'feature', def: 'A distinctive attribute or aspect of something' },
    { word: 'genuine', def: 'Truly what something is said to be; authentic' },
    { word: 'harmony', def: 'A pleasing arrangement of parts; agreement' },
    { word: 'imagine', def: 'To form a mental image of something not present' },
    { word: 'journey', def: 'An act of traveling from one place to another' },
    { word: 'kitchen', def: 'A room where food is prepared and cooked' },
    { word: 'library', def: 'A building or room containing a collection of books' },
    { word: 'message', def: 'A verbal or written communication sent to someone' },
    { word: 'natural', def: 'Existing in or caused by nature; not artificial' },
    { word: 'opinion', def: 'A view or judgment formed about something' },
    { word: 'passage', def: 'A section of text; a journey from one place to another' },
    { word: 'quality', def: 'A distinctive attribute or characteristic' },
    { word: 'reflect', def: 'To throw back light or sound; to think deeply' },
    { word: 'silence', def: 'Complete absence of sound or noise' },
    { word: 'triumph', def: 'A great victory or achievement' },
    { word: 'umbrella', def: 'A device used as protection against rain' },
    { word: 'village', def: 'A small community in a rural area' },
    { word: 'weather', def: 'The state of the atmosphere at a particular time' },
    { word: 'examine', def: 'To inspect or scrutinize carefully' },
    { word: 'balance', def: 'An even distribution of weight; stability' },
    { word: 'climate', def: 'The weather conditions prevailing in an area' },
    { word: 'delight', def: 'Great pleasure or joy' },
    { word: 'elegant', def: 'Gracefully stylish and sophisticated' },
    { word: 'fragile', def: 'Easily broken or damaged; delicate' },
    { word: 'glimpse', def: 'A brief or quick view or look' },
    { word: 'harvest', def: 'The process of gathering crops' },
    { word: 'involve', def: 'To include or contain as a part' },
    { word: 'justice', def: 'Fair behavior or treatment; moral rightness' },
    { word: 'knowledge', def: 'Facts and information acquired through experience' },
    { word: 'liberate', def: 'To set free from imprisonment or oppression' },
    { word: 'mixture', def: 'A combination of different substances' },
    { word: 'nervous', def: 'Easily agitated or alarmed; anxious' },
    { word: 'observe', def: 'To watch carefully; to notice' },
    { word: 'pioneer', def: 'A person who is first to explore or settle' },
    { word: 'replace', def: 'To take the place of; to put back' },
    { word: 'scholar', def: 'A specialist in a particular branch of study' },
    { word: 'storage', def: 'The action of storing something for future use' },
    { word: 'trouble', def: 'Difficulty or problems; distress' },
    { word: 'various', def: 'Different from one another; diverse' },
    { word: 'witness', def: 'A person who sees an event take place' },
    { word: 'achieve', def: 'To reach or attain a goal through effort' },
    { word: 'brilliant', def: 'Exceptionally clever or talented; very bright' },
    { word: 'complete', def: 'Having all parts; finished; absolute' },
    { word: 'discover', def: 'To find something unexpectedly or for the first time' },
    { word: 'enormous', def: 'Very large in size, quantity, or extent' }
  ],

  quiz_bowl: [
    { q: 'What is the largest planet in our solar system?', opts: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], ans: 1 },
    { q: 'Who wrote the play "Romeo and Juliet"?', opts: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], ans: 1 },
    { q: 'What is the chemical symbol for water?', opts: ['H2O', 'CO2', 'NaCl', 'O2'], ans: 0 },
    { q: 'Which country has the largest population?', opts: ['USA', 'India', 'China', 'Indonesia'], ans: 1 },
    { q: 'What is the capital of France?', opts: ['Berlin', 'Madrid', 'Rome', 'Paris'], ans: 3 },
    { q: 'How many bones are in the adult human body?', opts: ['186', '206', '226', '246'], ans: 1 },
    { q: 'What is the speed of light approximately?', opts: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], ans: 0 },
    { q: 'Which element has the atomic number 1?', opts: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'], ans: 2 },
    { q: 'What is the largest mammal in the world?', opts: ['Elephant', 'Blue Whale', 'Giraffe', 'Orca'], ans: 1 },
    { q: 'Who painted the Mona Lisa?', opts: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Van Gogh'], ans: 2 },
    { q: 'What is the currency of Japan?', opts: ['Yuan', 'Won', 'Yen', 'Ringgit'], ans: 2 },
    { q: 'Which continent is the Sahara Desert in?', opts: ['Asia', 'Australia', 'South America', 'Africa'], ans: 3 },
    { q: 'What gas do plants absorb from the atmosphere?', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2 },
    { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], ans: 1 },
    { q: 'Who was the first President of the United States?', opts: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], ans: 1 },
    { q: 'What is the hardest natural substance?', opts: ['Gold', 'Iron', 'Diamond', 'Platinum'], ans: 2 },
    { q: 'Which ocean is the largest?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], ans: 3 },
    { q: 'What is the longest river in the world?', opts: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], ans: 1 },
    { q: 'How many continents are there?', opts: ['5', '6', '7', '8'], ans: 2 },
    { q: 'What is the square root of 144?', opts: ['10', '11', '12', '13'], ans: 2 },
    { q: 'Who developed the theory of relativity?', opts: ['Newton', 'Einstein', 'Galileo', 'Hawking'], ans: 1 },
    { q: 'What is the boiling point of water in Celsius?', opts: ['90', '100', '110', '120'], ans: 1 },
    { q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Saturn', 'Mars', 'Mercury'], ans: 2 },
    { q: 'What is the smallest country in the world?', opts: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], ans: 1 },
    { q: 'How many teeth does an adult human typically have?', opts: ['28', '32', '36', '30'], ans: 1 },
    { q: 'What is the main gas in Earth\'s atmosphere?', opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], ans: 2 },
    { q: 'Who invented the telephone?', opts: ['Edison', 'Bell', 'Tesla', 'Morse'], ans: 1 },
    { q: 'What is the fastest land animal?', opts: ['Lion', 'Cheetah', 'Horse', 'Gazelle'], ans: 1 },
    { q: 'Which country invented paper?', opts: ['India', 'Egypt', 'China', 'Greece'], ans: 2 },
    { q: 'What is the freezing point of water in Fahrenheit?', opts: ['0', '32', '100', '212'], ans: 1 }
  ],

  word_scramble: [
    { word: 'planet', hint: 'A celestial body orbiting a star' },
    { word: 'garden', hint: 'A piece of ground used for growing plants' },
    { word: 'temple', hint: 'A building for religious worship' },
    { word: 'rocket', hint: 'A vehicle that travels into space' },
    { word: 'forest', hint: 'A large area covered with trees' },
    { word: 'castle', hint: 'A large fortified building from medieval times' },
    { word: 'bridge', hint: 'A structure built to span a physical obstacle' },
    { word: 'puzzle', hint: 'A game or problem designed to test ingenuity' },
    { word: 'island', hint: 'A piece of land surrounded by water' },
    { word: 'candle', hint: 'A cylinder of wax with a wick for lighting' },
    { word: 'desert', hint: 'A barren area of land with little precipitation' },
    { word: 'button', hint: 'A small fastener for clothing' },
    { word: 'silver', hint: 'A precious grayish-white metallic element' },
    { word: 'window', hint: 'An opening in a wall fitted with glass' },
    { word: 'basket', hint: 'A container made of woven materials' },
    { word: 'planet', hint: 'A large body orbiting a star' },
    { word: 'school', hint: 'An institution for educating children' },
    { word: 'spring', hint: 'The season after winter; a coil of wire' },
    { word: 'travel', hint: 'To go from one place to another' },
    { word: 'winter', hint: 'The coldest season of the year' },
    { word: 'animal', hint: 'A living organism that is not a plant' },
    { word: 'bottle', hint: 'A container for storing liquids' },
    { word: 'circle', hint: 'A round plane figure with no corners' },
    { word: 'dinner', hint: 'The main meal of the day, usually in the evening' },
    { word: 'excuse', hint: 'A reason or explanation to justify a fault' },
    { word: 'flight', hint: 'The act of flying; a journey by air' },
    { word: 'guitar', hint: 'A stringed musical instrument' },
    { word: 'honest', hint: 'Truthful and sincere; free of deceit' },
    { word: 'jungle', hint: 'A dense tropical forest' },
    { word: 'kitten', hint: 'A young cat' },
    { word: 'lantern', hint: 'A portable light source with a protective case' },
    { word: 'mirror', hint: 'A reflective surface that shows an image' },
    { word: 'noodle', hint: 'A strip of pasta used in soups and dishes' },
    { word: 'orange', hint: 'A citrus fruit with a tough bright skin' },
    { word: 'pillow', hint: 'A cushion for the head during sleep' },
    { word: 'radius', hint: 'A line from the center to the edge of a circle' },
    { word: 'salmon', hint: 'A large fish with pink flesh' },
    { word: 'ticket', hint: 'A piece of paper giving entry or travel rights' },
    { word: 'vacuum', hint: 'A space devoid of matter; a cleaning appliance' },
    { word: 'yellow', hint: 'The color of the sun or a lemon' }
  ],

  typing_test: [
    { text: 'The quick brown fox jumps over the lazy dog near the bank of the river. Education is the most powerful weapon which you can use to change the world. Practice makes perfect and persistence leads to success.' },
    { text: 'Science is the systematic study of the natural world through observation and experiment. Every student has the potential to achieve greatness through hard work and dedication to learning.' },
    { text: 'Technology has transformed the way we learn, work and communicate with each other. The future belongs to those who prepare for it today through education and innovation.' }
  ]
};

// ===== STATE =====
var _agState = null;
var _agTimer = null;
var _agGameOver = false;

// ===== ADMIN VIEW =====
function renderAdminActivityGames() {
  var container = document.getElementById('adminActivityGamesView');
  if (!container) return;
  var scores = data.activityScores || [];
  var students = data.students || [];
  // Summary cards
  var totalGames = scores.length;
  var uniqueStudents = new Set(scores.map(function(s) { return s.studentId; })).size;
  var perGame = {};
  Object.keys(ACTIVITY_GAMES).forEach(function(k) { perGame[k] = 0; });
  scores.forEach(function(s) { if (perGame[s.gameType] !== undefined) perGame[s.gameType]++; });
  var html =
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px;">' +
      '<div class="stat-card"><div class="icon"><i class="fas fa-gamepad" style="color:var(--accent)"></i></div><h3>' + totalGames + '</h3><p>Total Games Played</p></div>' +
      '<div class="stat-card"><div class="icon"><i class="fas fa-users" style="color:var(--primary)"></i></div><h3>' + uniqueStudents + '</h3><p>Unique Students</p></div>' +
      Object.keys(perGame).map(function(k) {
        var g = ACTIVITY_GAMES[k];
        return '<div class="stat-card"><div class="icon"><i class="fas ' + g.icon + '" style="color:' + g.color + '"></i></div><h3>' + perGame[k] + '</h3><p>' + g.name + '</p></div>';
      }).join('') +
    '</div>';
  // Leaderboard table
  if (scores.length === 0) {
    html += '<div class="empty-state"><i class="fas fa-gamepad"></i><p>No activity games have been played yet. Students can play games in their portal.</p></div>';
    container.innerHTML = html;
    return;
  }
  var sorted = scores.slice().sort(function(a, b) { return (b.pct || 0) - (a.pct || 0); });
  html += '<div style="overflow-x:auto;"><table><thead><tr><th>#</th><th>Student</th><th>Class</th><th>Game</th><th>Score</th><th>%</th><th>Date</th></tr></thead><tbody>';
  sorted.forEach(function(s, i) {
    var stu = students.find(function(st) { return st.id === s.studentId; });
    var g = ACTIVITY_GAMES[s.gameType];
    html += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td>' + htmlEscape(stu ? stu.name : s.studentId) + '</td>' +
      '<td>' + htmlEscape(stu ? stu.class : '') + '</td>' +
      '<td>' + (g ? '<span class="badge" style="background:' + g.color + '20;color:' + g.color + ';">' + g.name + '</span>' : htmlEscape(s.gameType)) + '</td>' +
      '<td>' + s.score + '/' + s.total + '</td>' +
      '<td><strong>' + (s.pct || 0) + '%</strong></td>' +
      '<td style="font-size:12px;">' + (s.date ? s.date.split('T')[0] : '') + '</td>' +
    '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ===== ADMIN CSV EXPORT =====
function exportActivityGameCSV() {
  var scores = data.activityScores || [];
  if (!scores.length) { toast('No game data to export', 'warning'); return; }
  var students = data.students || [];
  var csv = 'Student,Class,Game,Score,Total,Percentage,Date\r\n';
  scores.forEach(function(s) {
    var stu = students.find(function(st) { return st.id === s.studentId; });
    var g = ACTIVITY_GAMES[s.gameType];
    csv += '"' + (stu ? stu.name : s.studentId) + '",';
    csv += '"' + (stu ? stu.class : '') + '",';
    csv += '"' + (g ? g.name : s.gameType) + '",';
    csv += s.score + ',' + s.total + ',' + (s.pct || 0) + ',';
    csv += (s.date ? s.date.split('T')[0] : '') + '\r\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'activity_games_scores.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('CSV exported');
}

// ===== STUDENT VIEW =====
function renderStudentActivityGames() {
  var container = document.getElementById('stuActivityGamesView');
  if (!container) return;
  if (!currentStudent) { container.innerHTML = '<p>Please log in to view games</p>'; return; }
  var scores = (data.activityScores || []).filter(function(s) { return s.studentId === currentStudent.id; });
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px;">';
  Object.keys(ACTIVITY_GAMES).forEach(function(k) {
    var g = ACTIVITY_GAMES[k];
    var myScores = scores.filter(function(s) { return s.gameType === k; });
    var best = myScores.length ? Math.max.apply(null, myScores.map(function(s) { return s.pct || 0; })) : 0;
    var times = myScores.length;
    html +=
      '<div style="background:linear-gradient(135deg,' + g.color + '15,#fff);border:2px solid ' + g.color + '30;border-radius:16px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;" ' +
      'onclick="startActivityGame(\'' + k + '\')" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.1)\'" ' +
      'onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'">' +
        '<div style="font-size:40px;color:' + g.color + ';margin-bottom:8px;"><i class="fas ' + g.icon + '"></i></div>' +
        '<h4 style="font-weight:700;margin-bottom:4px;">' + g.name + '</h4>' +
        '<p style="font-size:12px;color:var(--text-light);margin-bottom:8px;">' + g.desc + '</p>' +
        '<div style="font-size:13px;"><span style="font-weight:600;">Best:</span> <span style="color:' + g.color + ';font-weight:700;">' + best + '%</span></div>' +
        '<div style="font-size:12px;color:var(--text-light);">Played ' + times + ' time' + (times !== 1 ? 's' : '') + '</div>' +
        '<div style="margin-top:10px;"><button class="btn btn-sm" style="background:' + g.color + ';color:#fff;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;">Play Now</button></div>' +
      '</div>';
  });
  html += '</div>';
  // History
  if (scores.length) {
    var sorted = scores.slice().sort(function(a, b) { return a.date < b.date ? 1 : -1; });
    html += '<h4 style="font-size:15px;font-weight:600;margin-bottom:12px;">Your Game History</h4>' +
      '<div style="overflow-x:auto;"><table><thead><tr><th>Game</th><th>Score</th><th>%</th><th>Date</th></tr></thead><tbody>';
    sorted.forEach(function(s) {
      var g = ACTIVITY_GAMES[s.gameType];
      html += '<tr><td>' + (g ? g.name : s.gameType) + '</td><td>' + s.score + '/' + s.total + '</td>' +
        '<td><strong>' + (s.pct || 0) + '%</strong></td><td style="font-size:12px;">' + (s.date ? s.date.split('T')[0] : '') + '</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<div class="empty-state"><i class="fas fa-gamepad"></i><p>Click a game above to start playing!</p></div>';
  }
  container.innerHTML = html;
}

// ===== START GAME =====
function startActivityGame(gameType) {
  if (!currentStudent) { toast('Please log in first', 'error'); return; }
  var def = ACTIVITY_GAMES[gameType];
  if (!def) { toast('Unknown game type', 'error'); return; }
  _agGameOver = false;

  if (gameType === 'spelling_bee') startSpellingBee();
  else if (gameType === 'math_sprint') startMathSprint();
  else if (gameType === 'quiz_bowl') startQuizBowl();
  else if (gameType === 'word_scramble') startWordScramble();
  else if (gameType === 'typing_test') startTypingTest();
  else toast('Game not implemented yet', 'error');
}

// ===== FULLSCREEN HELPERS =====
function _agShowFullscreen(html) {
  _agCleanup();
  var el = document.createElement('div');
  el.id = 'agFullscreen';
  el.className = 'exam-fullscreen';
  el.innerHTML = html;
  document.body.appendChild(el);
}

function _agCleanup() {
  var el = document.getElementById('agFullscreen');
  if (el) el.remove();
  if (_agTimer) { clearInterval(_agTimer); _agTimer = null; }
  _agState = null;
}

function _agFinishGame(gameType, score, total, details) {
  _agGameOver = true;
  if (_agTimer) { clearInterval(_agTimer); _agTimer = null; }
  var pct = total > 0 ? Math.round(score / total * 100) : 0;
  var record = {
    id: genId('ACTG'),
    studentId: currentStudent.id,
    gameType: gameType,
    score: score,
    total: total,
    pct: pct,
    details: details || [],
    date: new Date().toISOString()
  };
  if (!data.activityScores) data.activityScores = [];
  data.activityScores.push(record);
  saveData();
  _agShowResult(record);
}

function _agShowResult(record) {
  var g = ACTIVITY_GAMES[record.gameType] || { name: record.gameType, icon: 'fa-gamepad', color: '#3b82f6' };
  var grade = record.pct >= 90 ? 'A+' : record.pct >= 80 ? 'A' : record.pct >= 70 ? 'B' : record.pct >= 60 ? 'C' : record.pct >= 50 ? 'D' : 'F';
  var gradeColor = record.pct >= 70 ? '#10b981' : record.pct >= 50 ? '#f59e0b' : '#ef4444';
  var html =
    '<div class="exam-topbar" style="background:' + g.color + ';"><h3><i class="fas ' + g.icon + '"></i> ' + g.name + ' — Results</h3></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;overflow-y:auto;">' +
      '<div style="font-size:64px;color:' + g.color + ';margin-bottom:8px;"><i class="fas ' + g.icon + '"></i></div>' +
      '<div style="font-size:56px;font-weight:800;color:' + gradeColor + ';">' + record.pct + '%</div>' +
      '<div style="font-size:24px;font-weight:700;color:' + gradeColor + ';margin-bottom:16px;">Grade: ' + grade + '</div>' +
      '<div style="display:flex;gap:24px;margin-bottom:24px;">' +
        '<div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--primary);">' + record.score + '</div><div style="font-size:13px;color:var(--text-light);">Correct</div></div>' +
        '<div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--danger);">' + (record.total - record.score) + '</div><div style="font-size:13px;color:var(--text-light);">Wrong</div></div>' +
        '<div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:var(--text);">' + record.total + '</div><div style="font-size:13px;color:var(--text-light);">Total</div></div>' +
      '</div>' +
      // Details
      (record.details && record.details.length ? '<div style="width:100%;max-width:600px;"><h4 style="font-size:15px;font-weight:600;margin-bottom:12px;">Details</h4><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:8px;border-bottom:2px solid #e2e8f0;text-align:left;">#</th><th style="padding:8px;border-bottom:2px solid #e2e8f0;text-align:left;">Question</th><th style="padding:8px;border-bottom:2px solid #e2e8f0;text-align:left;">Your Answer</th><th style="padding:8px;border-bottom:2px solid #e2e8f0;text-align:left;">Result</th></tr></thead><tbody>' +
        record.details.map(function(d, i) {
          var isCorrect = d.correct;
          return '<tr>' +
            '<td style="padding:8px;border-bottom:1px solid #f1f5f9;">' + (i + 1) + '</td>' +
            '<td style="padding:8px;border-bottom:1px solid #f1f5f9;">' + htmlEscape(d.question) + '</td>' +
            '<td style="padding:8px;border-bottom:1px solid #f1f5f9;">' + htmlEscape(d.answer) + '</td>' +
            '<td style="padding:8px;border-bottom:1px solid #f1f5f9;">' +
              (isCorrect ? '<span style="color:#10b981;font-weight:600;"><i class="fas fa-check-circle"></i> Correct</span>' : '<span style="color:#ef4444;font-weight:600;"><i class="fas fa-times-circle"></i> Wrong</span>') +
            '</td></tr>';
        }).join('') +
      '</tbody></table></div></div>' : '') +
      '<div style="margin-top:24px;display:flex;gap:12px;">' +
        '<button class="btn btn-primary" onclick="_agCleanup();renderStudentActivityGames();"><i class="fas fa-arrow-left"></i> Back to Games</button>' +
        '<button class="btn btn-secondary" onclick="_agCleanup();startActivityGame(\'' + record.gameType + '\')"><i class="fas fa-redo"></i> Play Again</button>' +
      '</div>' +
    '</div>';
  _agShowFullscreen(html);
}

function _agRenderTimer() {
  var el = document.getElementById('agTimer');
  if (!el || !_agState) return;
  var elapsed = Date.now() - _agState.startTime;
  var remaining = Math.max(0, _agState.duration - elapsed);
  var em = Math.floor(remaining / 60000);
  var es = Math.floor((remaining % 60000) / 1000);
  var ratio = elapsed / _agState.duration;
  var cls = ratio > 0.9 ? 'exam-timer danger' : ratio > 0.7 ? 'exam-timer warning' : 'exam-timer';
  el.textContent = String(em).padStart(2, '0') + ':' + String(es).padStart(2, '0');
  el.className = cls;
  if (remaining <= 0 && !_agGameOver) {
    _agState.timeUp = true;
    if (typeof _agState.onTimeUp === 'function') _agState.onTimeUp();
  }
}

// ===== SPELLING BEE =====
function startSpellingBee() {
  var pool = GAME_CONTENT.spelling_bee;
  var count = Math.min(pool.length, 10);
  var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; }).slice(0, count);
  var questions = shuffled.map(function(item) {
    return { word: item.word, def: item.def, userAnswer: '', correct: false };
  });
  _agState = {
    gameType: 'spelling_bee',
    questions: questions,
    currentIdx: 0,
    score: 0,
    startTime: Date.now(),
    duration: 120000,
    onTimeUp: function() { _agSubmitSpellingBee(); }
  };
  _agRenderSpellingBee();
  _agTimer = setInterval(_agRenderTimer, 1000);
}

function _agRenderSpellingBee() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var total = _agState.questions.length;
  var idx = _agState.currentIdx;
  var html =
    '<div class="exam-topbar"><h3><i class="fas fa-spell-check"></i> Spelling Bee</h3><div><span style="margin-right:16px;">' + (idx + 1) + '/' + total + '</span><span id="agTimer" class="exam-timer"></span></div></div>' +
    '<div class="exam-body"><div class="exam-main" style="align-items:center;justify-content:center;text-align:center;">' +
      '<div style="max-width:500px;width:100%;">' +
        '<div style="font-size:18px;font-weight:600;color:var(--text-light);margin-bottom:8px;">Definition</div>' +
        '<div style="font-size:22px;font-weight:700;margin-bottom:32px;line-height:1.4;">"' + htmlEscape(q.def) + '"</div>' +
        '<div style="font-size:14px;color:var(--text-light);margin-bottom:12px;">Type the correct spelling:</div>' +
        '<input type="text" id="agSpellingInput" value="' + htmlEscape(q.userAnswer || '') + '" placeholder="Type your answer..." autofocus ' +
          'style="width:100%;padding:16px 20px;border:3px solid #e2e8f0;border-radius:12px;font-size:24px;font-family:inherit;text-align:center;letter-spacing:4px;outline:none;" ' +
          'onkeydown="if(event.key===\'Enter\')_agNextSpelling()" oninput="var i=document.getElementById(\'agSpellingInput\');if(i)_agState.questions[_agState.currentIdx].userAnswer=i.value;">' +
        '<div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">' +
          (idx > 0 ? '<button class="btn btn-outline" onclick="_agPrevSpelling()"><i class="fas fa-arrow-left"></i> Previous</button>' : '') +
          (idx < total - 1 ? '<button class="btn btn-primary" onclick="_agNextSpelling()">Next <i class="fas fa-arrow-right"></i></button>' : '') +
          (idx === total - 1 ? '<button class="btn" style="background:var(--success);color:#fff;" onclick="_agSubmitSpellingBee()"><i class="fas fa-check"></i> Submit</button>' : '') +
        '</div>' +
      '</div>' +
    '</div></div>';
  _agShowFullscreen(html);
  var inp = document.getElementById('agSpellingInput');
  if (inp) setTimeout(function() { inp.focus(); }, 100);
  _agRenderTimer();
}

function _agNextSpelling() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agSpellingInput');
  if (inp) q.userAnswer = inp.value.trim();
  if (_agState.currentIdx < _agState.questions.length - 1) {
    _agState.currentIdx++;
    _agRenderSpellingBee();
  }
}

function _agPrevSpelling() {
  if (!_agState || _agState.currentIdx <= 0) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agSpellingInput');
  if (inp) q.userAnswer = inp.value.trim();
  _agState.currentIdx--;
  _agRenderSpellingBee();
}

function _agSubmitSpellingBee() {
  if (!_agState || _agGameOver) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agSpellingInput');
  if (inp) q.userAnswer = inp.value.trim();
  var score = 0;
  var details = [];
  _agState.questions.forEach(function(q) {
    var isCorrect = q.userAnswer.trim().toLowerCase() === q.word.toLowerCase();
    if (isCorrect) score++;
    details.push({ question: q.def, answer: q.userAnswer || '(blank)', correct: isCorrect });
  });
  _agFinishGame('spelling_bee', score, _agState.questions.length, details);
}

// ===== MATH SPRINT =====
function startMathSprint() {
  var count = 20;
  var questions = [];
  var ops = ['+', '-', '×'];
  for (var i = 0; i < count; i++) {
    var op = ops[Math.floor(Math.random() * ops.length)];
    var a, b, answer;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * a); answer = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; }
    questions.push({ display: a + ' ' + op + ' ' + b, answer: answer, userAnswer: '' });
  }
  _agState = {
    gameType: 'math_sprint',
    questions: questions,
    currentIdx: 0,
    score: 0,
    startTime: Date.now(),
    duration: 90000,
    onTimeUp: function() { _agSubmitMathSprint(); }
  };
  _agRenderMathSprint();
  _agTimer = setInterval(_agRenderTimer, 1000);
}

function _agRenderMathSprint() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var total = _agState.questions.length;
  var idx = _agState.currentIdx;
  var html =
    '<div class="exam-topbar" style="background:#ef4444;"><h3><i class="fas fa-calculator"></i> Math Sprint</h3><div><span style="margin-right:16px;">' + (idx + 1) + '/' + total + '</span><span id="agTimer" class="exam-timer"></span></div></div>' +
    '<div class="exam-body"><div class="exam-main" style="align-items:center;justify-content:center;text-align:center;">' +
      '<div style="max-width:400px;width:100%;">' +
        '<div style="font-size:48px;font-weight:800;margin-bottom:32px;letter-spacing:4px;">' + q.display + ' = ?</div>' +
        '<input type="number" id="agMathInput" value="' + (q.userAnswer !== '' ? q.userAnswer : '') + '" placeholder="Type your answer..." autofocus ' +
          'style="width:100%;padding:16px 20px;border:3px solid #e2e8f0;border-radius:12px;font-size:28px;font-family:inherit;text-align:center;outline:none;" ' +
          'onkeydown="if(event.key===\'Enter\')_agNextMath()" oninput="var i=document.getElementById(\'agMathInput\');if(i)_agState.questions[_agState.currentIdx].userAnswer=i.value;">' +
        '<div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">' +
          (idx > 0 ? '<button class="btn btn-outline" onclick="_agPrevMath()"><i class="fas fa-arrow-left"></i> Previous</button>' : '') +
          (idx < total - 1 ? '<button class="btn btn-primary" onclick="_agNextMath()">Next <i class="fas fa-arrow-right"></i></button>' : '') +
          (idx === total - 1 ? '<button class="btn" style="background:var(--success);color:#fff;" onclick="_agSubmitMathSprint()"><i class="fas fa-check"></i> Submit</button>' : '') +
        '</div>' +
      '</div>' +
    '</div></div>';
  _agShowFullscreen(html);
  var inp = document.getElementById('agMathInput');
  if (inp) setTimeout(function() { inp.focus(); }, 100);
  _agRenderTimer();
}

function _agNextMath() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agMathInput');
  if (inp) q.userAnswer = inp.value.trim();
  if (_agState.currentIdx < _agState.questions.length - 1) {
    _agState.currentIdx++;
    _agRenderMathSprint();
  }
}

function _agPrevMath() {
  if (!_agState || _agState.currentIdx <= 0) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agMathInput');
  if (inp) q.userAnswer = inp.value.trim();
  _agState.currentIdx--;
  _agRenderMathSprint();
}

function _agSubmitMathSprint() {
  if (!_agState || _agGameOver) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agMathInput');
  if (inp) q.userAnswer = inp.value.trim();
  var score = 0;
  var details = [];
  _agState.questions.forEach(function(q) {
    var isCorrect = parseInt(q.userAnswer) === q.answer;
    if (isCorrect) score++;
    details.push({ question: q.display + ' = ?', answer: q.userAnswer || '(blank)', correct: isCorrect });
  });
  _agFinishGame('math_sprint', score, _agState.questions.length, details);
}

// ===== QUIZ BOWL =====
function startQuizBowl() {
  var pool = GAME_CONTENT.quiz_bowl;
  var count = Math.min(pool.length, 15);
  var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; }).slice(0, count);
  var questions = shuffled.map(function(item) {
    return { q: item.q, opts: item.opts, ans: item.ans, selected: -1 };
  });
  _agState = {
    gameType: 'quiz_bowl',
    questions: questions,
    currentIdx: 0,
    score: 0,
    startTime: Date.now(),
    duration: 180000,
    onTimeUp: function() { _agSubmitQuizBowl(); }
  };
  _agRenderQuizBowl();
  _agTimer = setInterval(_agRenderTimer, 1000);
}

function _agRenderQuizBowl() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var total = _agState.questions.length;
  var idx = _agState.currentIdx;
  var letters = ['A', 'B', 'C', 'D'];
  var html =
    '<div class="exam-topbar" style="background:#3b82f6;"><h3><i class="fas fa-question-circle"></i> Quiz Bowl</h3><div><span style="margin-right:16px;">' + (idx + 1) + '/' + total + '</span><span id="agTimer" class="exam-timer"></span></div></div>' +
    '<div class="exam-body"><div class="exam-main">' +
      '<div style="max-width:700px;margin:0 auto;width:100%;">' +
        '<div class="exam-question"><div class="q-text">' + htmlEscape(q.q) + '</div>' +
        '<div class="q-options">' +
          q.opts.map(function(opt, oi) {
            var sel = q.selected === oi ? ' selected' : '';
            return '<div class="q-option' + sel + '" onclick="_agSelectQuiz(' + oi + ')">' +
              '<span class="letter">' + letters[oi] + '</span>' + htmlEscape(opt) + '</div>';
          }).join('') +
        '</div></div>' +
        '<div style="display:flex;gap:12px;margin-top:24px;">' +
          (idx > 0 ? '<button class="btn btn-outline" onclick="_agPrevQuiz()"><i class="fas fa-arrow-left"></i> Previous</button>' : '') +
          (idx < total - 1 ? '<button class="btn btn-primary" onclick="_agNextQuiz()">Next <i class="fas fa-arrow-right"></i></button>' : '') +
          (idx === total - 1 ? '<button class="btn" style="background:var(--success);color:#fff;" onclick="_agSubmitQuizBowl()"><i class="fas fa-check"></i> Submit</button>' : '') +
        '</div>' +
      '</div>' +
    '</div></div>';
  _agShowFullscreen(html);
  _agRenderTimer();
}

function _agSelectQuiz(optIdx) {
  if (!_agState) return;
  _agState.questions[_agState.currentIdx].selected = optIdx;
  _agRenderQuizBowl();
}

function _agNextQuiz() {
  if (!_agState) return;
  if (_agState.currentIdx < _agState.questions.length - 1) {
    _agState.currentIdx++;
    _agRenderQuizBowl();
  }
}

function _agPrevQuiz() {
  if (!_agState || _agState.currentIdx <= 0) return;
  _agState.currentIdx--;
  _agRenderQuizBowl();
}

function _agSubmitQuizBowl() {
  if (!_agState || _agGameOver) return;
  var score = 0;
  var details = [];
  _agState.questions.forEach(function(q) {
    var isCorrect = q.selected === q.ans;
    if (isCorrect) score++;
    var letters = ['A', 'B', 'C', 'D'];
    details.push({
      question: q.q,
      answer: q.selected >= 0 ? letters[q.selected] : '(none)',
      correct: isCorrect
    });
  });
  _agFinishGame('quiz_bowl', score, _agState.questions.length, details);
}

// ===== WORD SCRAMBLE =====
function startWordScramble() {
  var pool = GAME_CONTENT.word_scramble;
  var count = Math.min(pool.length, 10);
  var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; }).slice(0, count);
  var questions = shuffled.map(function(item) {
    var scrambled = item.word.split('').sort(function() { return Math.random() - 0.5; }).join('');
    while (scrambled === item.word) {
      scrambled = item.word.split('').sort(function() { return Math.random() - 0.5; }).join('');
    }
    return { word: item.word, hint: item.hint, scrambled: scrambled, userAnswer: '' };
  });
  _agState = {
    gameType: 'word_scramble',
    questions: questions,
    currentIdx: 0,
    score: 0,
    startTime: Date.now(),
    duration: 120000,
    onTimeUp: function() { _agSubmitScramble(); }
  };
  _agRenderScramble();
  _agTimer = setInterval(_agRenderTimer, 1000);
}

function _agRenderScramble() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var total = _agState.questions.length;
  var idx = _agState.currentIdx;
  var html =
    '<div class="exam-topbar" style="background:#10b981;"><h3><i class="fas fa-font"></i> Word Scramble</h3><div><span style="margin-right:16px;">' + (idx + 1) + '/' + total + '</span><span id="agTimer" class="exam-timer"></span></div></div>' +
    '<div class="exam-body"><div class="exam-main" style="align-items:center;justify-content:center;text-align:center;">' +
      '<div style="max-width:500px;width:100%;">' +
        '<div style="font-size:42px;font-weight:800;letter-spacing:12px;margin-bottom:16px;color:var(--primary);text-transform:uppercase;">' + q.scrambled.split('').map(function(l) { return '<span style="display:inline-block;background:#eff6ff;padding:4px 8px;border-radius:8px;margin:2px;border:2px solid #bfdbfe;">' + l + '</span>'; }).join('') + '</div>' +
        '<div style="font-size:15px;color:var(--text-light);margin-bottom:24px;">Hint: ' + htmlEscape(q.hint) + '</div>' +
        '<input type="text" id="agScrambleInput" value="' + htmlEscape(q.userAnswer || '') + '" placeholder="Type the unscrambled word..." autofocus ' +
          'style="width:100%;padding:16px 20px;border:3px solid #e2e8f0;border-radius:12px;font-size:22px;font-family:inherit;text-align:center;text-transform:lowercase;outline:none;" ' +
          'onkeydown="if(event.key===\'Enter\')_agNextScramble()" oninput="var i=document.getElementById(\'agScrambleInput\');if(i)_agState.questions[_agState.currentIdx].userAnswer=i.value;">' +
        '<div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">' +
          (idx > 0 ? '<button class="btn btn-outline" onclick="_agPrevScramble()"><i class="fas fa-arrow-left"></i> Previous</button>' : '') +
          (idx < total - 1 ? '<button class="btn btn-primary" onclick="_agNextScramble()">Next <i class="fas fa-arrow-right"></i></button>' : '') +
          (idx === total - 1 ? '<button class="btn" style="background:var(--success);color:#fff;" onclick="_agSubmitScramble()"><i class="fas fa-check"></i> Submit</button>' : '') +
        '</div>' +
      '</div>' +
    '</div></div>';
  _agShowFullscreen(html);
  var inp = document.getElementById('agScrambleInput');
  if (inp) setTimeout(function() { inp.focus(); }, 100);
  _agRenderTimer();
}

function _agNextScramble() {
  if (!_agState) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agScrambleInput');
  if (inp) q.userAnswer = inp.value.trim().toLowerCase();
  if (_agState.currentIdx < _agState.questions.length - 1) {
    _agState.currentIdx++;
    _agRenderScramble();
  }
}

function _agPrevScramble() {
  if (!_agState || _agState.currentIdx <= 0) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agScrambleInput');
  if (inp) q.userAnswer = inp.value.trim().toLowerCase();
  _agState.currentIdx--;
  _agRenderScramble();
}

function _agSubmitScramble() {
  if (!_agState || _agGameOver) return;
  var q = _agState.questions[_agState.currentIdx];
  var inp = document.getElementById('agScrambleInput');
  if (inp) q.userAnswer = inp.value.trim().toLowerCase();
  var score = 0;
  var details = [];
  _agState.questions.forEach(function(q) {
    var isCorrect = q.userAnswer === q.word.toLowerCase();
    if (isCorrect) score++;
    details.push({ question: 'Unscramble: ' + q.scrambled, answer: q.userAnswer || '(blank)', correct: isCorrect });
  });
  _agFinishGame('word_scramble', score, _agState.questions.length, details);
}

// ===== TYPING TEST =====
function startTypingTest() {
  var pool = GAME_CONTENT.typing_test;
  var passage = pool[Math.floor(Math.random() * pool.length)].text;
  _agState = {
    gameType: 'typing_test',
    passage: passage,
    typedSoFar: '',
    charIndex: 0,
    errors: 0,
    startTime: Date.now(),
    duration: 60000,
    finished: false,
    correctChars: 0,
    onTimeUp: function() { _agFinishTyping(); }
  };
  _agRenderTyping();
  _agTimer = setInterval(_agRenderTimer, 1000);
}

function _agRenderTyping() {
  if (!_agState) return;
  var passage = _agState.passage;
  var typed = _agState.typedSoFar;
  var html =
    '<div class="exam-topbar" style="background:#f59e0b;"><h3><i class="fas fa-keyboard"></i> Typing Test</h3><div><span id="agTimer" class="exam-timer"></span></div></div>' +
    '<div class="exam-body"><div class="exam-main" style="align-items:center;justify-content:center;">' +
      '<div style="max-width:700px;width:100%;">' +
        '<div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px;font-size:18px;line-height:1.8;font-family:serif;">' +
          passage.split('').map(function(ch, i) {
            var cls = '';
            if (i < typed.length) {
              cls = typed[i] === ch ? ' style="color:#10b981;"' : ' style="color:#ef4444;text-decoration:underline;"';
            } else if (i === typed.length) {
              cls = ' style="background:rgba(245,166,35,0.3);border-radius:2px;"';
            }
            return '<span' + cls + '>' + htmlEscape(ch) + '</span>';
          }).join('') +
        '</div>' +
        '<textarea id="agTypingInput" placeholder="Type the passage above here..." autofocus ' +
          'style="width:100%;padding:16px;border:3px solid #e2e8f0;border-radius:12px;font-size:16px;font-family:inherit;line-height:1.6;min-height:100px;resize:none;outline:none;" ' +
          'oninput="_agUpdateTyping(this.value)"></textarea>' +
        '<div style="margin-top:16px;display:flex;gap:16px;justify-content:center;font-size:14px;">' +
          '<span>Typed: <strong>' + typed.length + '</strong></span>' +
          '<span>Errors: <strong style="color:#ef4444;">' + _agState.errors + '</strong></span>' +
          '<span>Accuracy: <strong style="color:#10b981;">' + _agCalcAccuracy() + '%</strong></span>' +
        '</div>' +
        '<div style="margin-top:16px;text-align:center;">' +
          '<button class="btn" style="background:var(--success);color:#fff;" onclick="_agFinishTyping()"><i class="fas fa-check"></i> Submit Test</button>' +
        '</div>' +
      '</div>' +
    '</div></div>';
  _agShowFullscreen(html);
  var inp = document.getElementById('agTypingInput');
  if (inp) setTimeout(function() { inp.focus(); }, 100);
  _agRenderTimer();
}

function _agUpdateTyping(val) {
  if (!_agState || _agState.finished) return;
  _agState.typedSoFar = val;
  var correct = 0;
  var errors = 0;
  for (var i = 0; i < val.length; i++) {
    if (i < _agState.passage.length && val[i] === _agState.passage[i]) correct++;
    else errors++;
  }
  _agState.correctChars = correct;
  _agState.errors = errors;
  _agRenderTyping();
  var inp = document.getElementById('agTypingInput');
  if (inp) { inp.value = _agState.typedSoFar; inp.focus(); }
}

function _agCalcAccuracy() {
  if (!_agState || _agState.typedSoFar.length === 0) return 100;
  var total = _agState.typedSoFar.length;
  var correct = _agState.correctChars || 0;
  return Math.round(correct / total * 100);
}

function _agFinishTyping() {
  if (!_agState || _agState.finished || _agGameOver) return;
  _agState.finished = true;
  var totalChars = _agState.typedSoFar.length;
  var correctChars = _agState.correctChars || 0;
  var errors = _agState.errors || 0;
  var accuracy = totalChars > 0 ? Math.round(correctChars / totalChars * 100) : 0;
  var elapsed = Math.min(_agState.duration, Date.now() - _agState.startTime);
  var wpm = totalChars > 0 ? Math.round((totalChars / 5) / (elapsed / 60000)) : 0;
  var details = [
    { question: 'Characters Typed', answer: String(totalChars), correct: true },
    { question: 'Correct Characters', answer: String(correctChars), correct: true },
    { question: 'Errors', answer: String(errors), correct: errors === 0 },
    { question: 'Typing Speed', answer: wpm + ' WPM', correct: wpm >= 30 },
    { question: 'Accuracy', answer: accuracy + '%', correct: accuracy >= 90 }
  ];
  // Score based on WPM * accuracy / 100
  var score = Math.round(wpm * accuracy / 100);
  var maxScore = 100;
  score = Math.min(score, maxScore);
  _agFinishGame('typing_test', score, maxScore, details);
}
