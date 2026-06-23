// EDUVERSE - Data Layer
// Handles localStorage persistence, default data seeding, and data access utilities

// ===== APP VERSION (bump to force cache refresh) =====
var APP_VERSION = '2026.06.19.1';
(function() {
  var key = 'app_cache_version';
  try {
    var stored = localStorage.getItem(key);
    if (stored !== APP_VERSION) {
      localStorage.setItem(key, APP_VERSION);
      // Clear possibly stale computed data
      try { localStorage.removeItem('eduverse_session'); } catch(e) {}
    }
  } catch(e) {}
})();

// ===== DATA LAYER =====
const DATA_KEY = 'schoolData';

function getDataKey() {
  try {
    const activeTenant = localStorage.getItem('activeTenant');
    if (activeTenant) return 'schoolData_' + activeTenant;
  } catch(e) {}
  return DATA_KEY;
}

function getDefaultData() {
  return {
    students: [
      { id: 'STU001', name: 'Alice Johnson', class: 'Basic 5A', contact: 'alice@example.com', username: 'alice.johnson', password: 'stu001' },
      { id: 'STU002', name: 'Bob Smith', class: 'Basic 5B', contact: 'bob@example.com', username: 'bob.smith', password: 'stu002' },
      { id: 'STU003', name: 'Carol Williams', class: 'Basic 6A', contact: 'carol@example.com', username: 'carol.williams', password: 'stu003' },
      { id: 'STU004', name: 'David Brown', class: 'Basic 4A', contact: 'david@example.com', username: 'david.brown', password: 'stu004' },
      { id: 'STU005', name: 'Eve Davis', class: 'Basic 6C', contact: 'eve@example.com', username: 'eve.davis', password: 'stu005' },
      { id: 'STU006', name: 'Frank Miller', class: 'Basic 5A', contact: 'frank@example.com', username: 'frank.miller', password: 'stu006' },
      { id: 'STU007', name: 'Grace Wilson', class: 'Basic 6B', contact: 'grace@example.com', username: 'grace.wilson', password: 'stu007' },
      { id: 'STU008', name: 'Henry Taylor', class: 'Basic 4B', contact: 'henry@example.com', username: 'henry.taylor', password: 'stu008' }
    ],
    fees: [
      { id: 'FEE001', studentId: 'STU001', term: 'Term 1 2026', amount: 500, paid: 500, status: 'paid' },
      { id: 'FEE002', studentId: 'STU002', term: 'Term 1 2026', amount: 500, paid: 250, status: 'partial', lastPaymentDate: '2026-06-14' },
      { id: 'FEE003', studentId: 'STU003', term: 'Term 1 2026', amount: 500, paid: 0, status: 'pending' }
    ],
    results: [
      { id: 'RES001', studentId: 'STU001', subject: 'Mathematics', score: 85, grade: 'A', term: 'Term 1 2026' },
      { id: 'RES002', studentId: 'STU001', subject: 'English', score: 78, grade: 'B+', term: 'Term 1 2026' },
      { id: 'RES003', studentId: 'STU001', subject: 'Science', score: 92, grade: 'A', term: 'Term 1 2026' },
      { id: 'RES004', studentId: 'STU002', subject: 'Mathematics', score: 65, grade: 'C+', term: 'Term 1 2026' },
      { id: 'RES005', studentId: 'STU002', subject: 'English', score: 70, grade: 'B-', term: 'Term 1 2026' }
    ],
    cat: [
      { id: 'CAT001', studentId: 'STU001', subject: 'Mathematics', test1: 18, test2: 19, test3: 20 },
      { id: 'CAT002', studentId: 'STU001', subject: 'English', test1: 15, test2: 17, test3: 16 },
      { id: 'CAT003', studentId: 'STU002', subject: 'Mathematics', test1: 12, test2: 14, test3: 13 }
    ],
    activities: [
      { id: 'ACT001', name: 'Basketball Club', type: 'Sports', day: 'Monday & Wednesday', time: '3:00 PM - 5:00 PM', participants: [] },
      { id: 'ACT002', name: 'Debate Team', type: 'Academic', day: 'Tuesday & Thursday', time: '2:00 PM - 3:30 PM', participants: [] },
      { id: 'ACT003', name: 'Art Club', type: 'Arts', day: 'Friday', time: '2:00 PM - 4:00 PM', participants: [] },
      { id: 'ACT004', name: 'Music Band', type: 'Arts', day: 'Monday, Wednesday & Friday', time: '3:30 PM - 5:00 PM', participants: [] },
      { id: 'ACT005', name: 'Science Club', type: 'Academic', day: 'Thursday', time: '2:00 PM - 3:30 PM', participants: [] }
    ],
    attendance: [
      { id: 'ATT001', studentId: 'STU001', date: '2026-06-01', status: 'present' },
      { id: 'ATT002', studentId: 'STU001', date: '2026-06-02', status: 'present' },
      { id: 'ATT003', studentId: 'STU001', date: '2026-06-03', status: 'present' },
      { id: 'ATT004', studentId: 'STU002', date: '2026-06-01', status: 'present' },
      { id: 'ATT005', studentId: 'STU002', date: '2026-06-02', status: 'absent' },
      { id: 'ATT006', studentId: 'STU002', date: '2026-06-03', status: 'present' },
      { id: 'ATT007', studentId: 'STU003', date: '2026-06-01', status: 'absent' },
      { id: 'ATT008', studentId: 'STU003', date: '2026-06-02', status: 'excused' }
    ],
    teachers: [
      { id: 'TCH001', name: 'Mr. John Doe', email: 'john@eduverse.com', password: 'teacher123', assignedClass: 'Basic 5A' },
      { id: 'TCH002', name: 'Ms. Jane Smith', email: 'jane@eduverse.com', password: 'teacher123', assignedClass: 'Basic 5B' },
      { id: 'TCH003', name: 'Dr. Peter Jones', email: 'peter@eduverse.com', password: 'teacher123', assignedClass: 'Basic 6A' }
    ],
    assignments: [
      { id: 'ASN001', teacherId: 'TCH001', title: 'Algebra Homework', description: 'Solve problems 1-20 from Chapter 5: Linear Equations', dueDate: '2026-06-15', class: 'Basic 5A', createdAt: '2026-06-05' },
      { id: 'ASN002', teacherId: 'TCH002', title: 'Essay on Ecology', description: 'Write a 500-word essay on ecosystem conservation and biodiversity.', dueDate: '2026-06-20', class: 'Basic 5B', createdAt: '2026-06-05' }
    ],
    submissions: [],
    timetables: [
      { id: 'TT001', class: 'Basic 5A', day: 'Monday', period: '08:00-09:00', subject: 'Mathematics', teacher: 'Mr. John Doe' },
      { id: 'TT002', class: 'Basic 5A', day: 'Monday', period: '09:00-10:00', subject: 'English', teacher: 'Ms. Jane Smith' },
      { id: 'TT003', class: 'Basic 5A', day: 'Monday', period: '10:00-11:00', subject: 'Science', teacher: 'Dr. Peter Jones' },
      { id: 'TT004', class: 'Basic 5A', day: 'Tuesday', period: '08:00-09:00', subject: 'Mathematics', teacher: 'Mr. John Doe' },
      { id: 'TT005', class: 'Basic 5A', day: 'Tuesday', period: '09:00-10:00', subject: 'History', teacher: 'Ms. Jane Smith' },
      { id: 'TT006', class: 'Basic 5A', day: 'Wednesday', period: '08:00-09:00', subject: 'English', teacher: 'Ms. Jane Smith' },
      { id: 'TT007', class: 'Basic 5A', day: 'Wednesday', period: '09:00-10:00', subject: 'Mathematics', teacher: 'Mr. John Doe' },
      { id: 'TT008', class: 'Basic 5A', day: 'Thursday', period: '08:00-09:00', subject: 'Science', teacher: 'Dr. Peter Jones' },
      { id: 'TT009', class: 'Basic 5A', day: 'Thursday', period: '09:00-10:00', subject: 'Physical Education', teacher: 'Mr. John Doe' },
      { id: 'TT010', class: 'Basic 5A', day: 'Friday', period: '08:00-09:00', subject: 'Mathematics', teacher: 'Mr. John Doe' },
      { id: 'TT011', class: 'Basic 5A', day: 'Friday', period: '09:00-10:00', subject: 'Art', teacher: 'Ms. Jane Smith' }
    ],
    gradebook: [
      { id: 'GB001', studentId: 'STU001', subject: 'Mathematics', score: 85, term: 'Term 2 2026' },
      { id: 'GB002', studentId: 'STU001', subject: 'English', score: 78, term: 'Term 2 2026' },
      { id: 'GB003', studentId: 'STU001', subject: 'Science', score: 92, term: 'Term 2 2026' },
      { id: 'GB004', studentId: 'STU002', subject: 'Mathematics', score: 65, term: 'Term 2 2026' },
      { id: 'GB005', studentId: 'STU002', subject: 'English', score: 70, term: 'Term 2 2026' }
    ],
    messages: [
      { id: 'MSG001', from: 'Admin', to: 'TCH001', subject: 'Staff Meeting Reminder', body: 'Reminder: Staff meeting this Friday at 2:00 PM in the conference room.', date: '2026-06-01', read: false },
      { id: 'MSG002', from: 'Admin', to: 'STU001', subject: 'Welcome to Term 2', body: 'Welcome back! Term 2 begins Monday June 8th. Check your timetable for updates.', date: '2026-06-02', read: false },
      { id: 'MSG003', from: 'TCH001', to: 'Admin', subject: 'Grade Submission', body: 'All grades for Term 1 have been submitted.', date: '2026-06-03', read: true },
      { id: 'MSG004', from: 'Admin', to: 'TCH002', subject: 'Curriculum Update', body: 'Please review the updated curriculum guidelines for next term.', date: '2026-06-04', read: false }
    ],
    exams: [
      { id: 'EXM001', class: 'Basic 5A', subject: 'Mathematics', date: '2026-06-20', startTime: '09:00', endTime: '11:00', term: 'Term 2 2026' },
      { id: 'EXM002', class: 'Basic 5A', subject: 'English', date: '2026-06-22', startTime: '09:00', endTime: '11:00', term: 'Term 2 2026' },
      { id: 'EXM003', class: 'Basic 5A', subject: 'Science', date: '2026-06-24', startTime: '09:00', endTime: '11:00', term: 'Term 2 2026' }
    ],
    parents: [
      { id: 'PAR001', name: 'Mr. Robert Johnson', email: 'robert@example.com', password: 'parent123', studentIds: ['STU001'] },
      { id: 'PAR002', name: 'Mrs. Lisa Smith', email: 'lisa@example.com', password: 'parent123', studentIds: ['STU002'] }
    ],
    currentTerm: 'Term 2 2026',
    leaveRequests: [
      { id: 'LEV001', teacherId: 'TCH001', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Personal leave', status: 'pending', date: '2026-06-01' }
    ],
    library: [
      { id: 'LIB001', title: 'Introduction to Mathematics', author: 'Dr. James Wilson', isbn: '978-0-1234-5678-0', total: 10, available: 7, category: 'Academic', coverUrl: null },
      { id: 'LIB002', title: 'English Literature Anthology', author: 'Prof. Sarah Blake', isbn: '978-0-1234-5678-1', total: 8, available: 5, category: 'Academic', coverUrl: null },
      { id: 'LIB003', title: 'Physics for Beginners', author: 'Dr. Robert Brown', isbn: '978-0-1234-5678-2', total: 6, available: 3, category: 'Science', coverUrl: null },
      { id: 'LIB004', title: 'World History Encyclopedia', author: 'Dr. Emily Davis', isbn: '978-0-1234-5678-3', total: 5, available: 4, category: 'Humanities', coverUrl: null },
      { id: 'LIB005', title: 'Chemistry Lab Manual', author: 'Prof. Mark Taylor', isbn: '978-0-1234-5678-4', total: 12, available: 10, category: 'Science', coverUrl: null }
    ],
    borrowings: [
      { id: 'BRW001', bookId: 'LIB001', studentId: 'STU002', borrowDate: '2026-05-20', dueDate: '2026-06-03', returnDate: null, status: 'active' },
      { id: 'BRW002', bookId: 'LIB003', studentId: 'STU001', borrowDate: '2026-05-25', dueDate: '2026-06-08', returnDate: '2026-06-05', status: 'returned' },
      { id: 'BRW003', bookId: 'LIB002', studentId: 'STU004', borrowDate: '2026-05-15', dueDate: '2026-05-29', returnDate: null, status: 'overdue' }
    ],
    waitlists: [],
    lessonNotes: [
      { id: 'LN001', teacherId: 'TCH001', class: 'Basic 5A', subject: 'Mathematics', title: 'Linear Equations', content: 'Introduction to solving linear equations with one variable. Practice problems from Chapter 5.', week: 'Week 1', term: 'Term 2 2026', date: '2026-06-01' },
      { id: 'LN002', teacherId: 'TCH002', class: 'Basic 5B', subject: 'English', title: 'Essay Writing', content: 'Structure of a five-paragraph essay. Thesis statements and topic sentences.', week: 'Week 1', term: 'Term 2 2026', date: '2026-06-01' }
    ],
    behaviorLog: [
      { id: 'BEH001', studentId: 'STU002', type: 'positive', description: 'Helped organize class science fair project', date: '2026-05-28', teacherId: 'TCH001', action: 'Commendation' },
      { id: 'BEH002', studentId: 'STU003', type: 'negative', description: 'Disruptive behavior during English class', date: '2026-05-25', teacherId: 'TCH002', action: 'Verbal warning' }
    ],
    staffHR: [
      { id: 'HR001', teacherId: 'TCH001', type: 'attendance', date: '2026-06-01', status: 'present' },
      { id: 'HR002', teacherId: 'TCH002', type: 'attendance', date: '2026-06-01', status: 'present' },
      { id: 'HR003', teacherId: 'TCH003', type: 'leave', date: '2026-06-01', leaveType: 'Sick Leave', reason: 'Medical appointment', status: 'approved' }
    ],
    payrollRecords: [
      { id: 'PAY001', teacherId: 'TCH001', month: 'June 2026', basicSalary: 250000, allowances: 50000, deductions: 30000, netSalary: 270000, paid: true },
      { id: 'PAY002', teacherId: 'TCH002', month: 'June 2026', basicSalary: 230000, allowances: 40000, deductions: 25000, netSalary: 245000, paid: true },
      { id: 'PAY003', teacherId: 'TCH003', month: 'June 2026', basicSalary: 280000, allowances: 60000, deductions: 35000, netSalary: 305000, paid: false }
    ],
    forumPosts: [
      { id: 'FRM001', author: 'STU001', authorName: 'Alice Johnson', class: 'Basic 5A', title: 'Math homework help', content: 'Can someone explain how to solve question 15 from Chapter 5?', date: '2026-06-02', replies: [{ author: 'TCH001', authorName: 'Mr. John Doe', content: 'Use the quadratic formula: x = (-b ± sqrt(b²-4ac))/2a', date: '2026-06-02' }] },
      { id: 'FRM002', author: 'STU004', authorName: 'David Brown', class: 'Basic 4A', title: 'Science project ideas', content: 'Looking for ideas for the upcoming science fair. Any suggestions?', date: '2026-06-03', replies: [] }
    ],
    fileRepo: [
      { id: 'FILE001', name: 'Mathematics_Chapter5.pdf', subject: 'Mathematics', class: 'Basic 5A', uploadedBy: 'TCH001', uploadDate: '2026-05-30', size: '2.4 MB' },
      { id: 'FILE002', name: 'English_Essay_Guide.docx', subject: 'English', class: 'Basic 5B', uploadedBy: 'TCH002', uploadDate: '2026-05-28', size: '1.1 MB' }
    ],
    paymentTransactions: [
      { id: 'PT001', studentId: 'STU001', amount: 500, method: 'Card', reference: 'PAY-2026-001', date: '2026-06-01', status: 'successful' },
      { id: 'PT002', studentId: 'STU002', amount: 250, method: 'Transfer', reference: 'PAY-2026-002', date: '2026-06-02', status: 'successful' },
      { id: 'PT003', studentId: 'STU003', amount: 500, method: 'Cash', reference: 'PAY-2026-003', date: '2026-06-03', status: 'pending' }
    ],
    feeConfig: {
      amount: 50000,
      windowStart: '2026-06-01',
      windowEnd: '2026-08-15',
      enabled: true,
      currentTerm: 'Term 2 2026',
      partPaymentGraceDays: 7
    },
    idCards: [
      { id: 'IDC001', type: 'student', personId: 'STU001', issuedDate: '2026-01-15', expiryDate: '2027-01-15', status: 'active', photoUrl: null },
      { id: 'IDC002', type: 'student', personId: 'STU002', issuedDate: '2026-01-15', expiryDate: '2027-01-15', status: 'active', photoUrl: null }
    ],
    admissionPrograms: [
      { id: 'PG001', name: 'Science & Technology', description: 'Advanced sciences, mathematics, and technology with state-of-the-art lab facilities', duration: '6 years (JSS1-SS3)', fee: 350000, requirements: ['Pass Entrance Exam (60%+)', 'Age 10-15', 'Previous school report', 'Birth certificate'], subjects: ['Mathematics', 'English', 'Science', 'Technology'], examDuration: 30 },
      { id: 'PG002', name: 'Arts & Humanities', description: 'Literature, history, creative arts, and social sciences for well-rounded scholars', duration: '6 years (JSS1-SS3)', fee: 280000, requirements: ['Pass Entrance Exam (50%+)', 'Age 10-15', 'Previous school report', 'Birth certificate'], subjects: ['English', 'Literature', 'History', 'Arts'], examDuration: 25 },
      { id: 'PG003', name: 'Commerce & Business', description: 'Business studies, accounting, economics, and entrepreneurship for future leaders', duration: '6 years (JSS1-SS3)', fee: 300000, requirements: ['Pass Entrance Exam (55%+)', 'Age 10-15', 'Previous school report', 'Birth certificate'], subjects: ['Mathematics', 'English', 'Business Studies', 'Economics'], examDuration: 30 },
      { id: 'PG004', name: 'STEM Accelerated', description: 'Intensive science, tech, engineering, math program for gifted students', duration: '5 years (JSS1-SS2)', fee: 450000, requirements: ['Pass Entrance Exam (75%+)', 'Age 9-14', 'Principal\'s recommendation', 'IQ assessment'], subjects: ['Advanced Mathematics', 'Physics', 'Chemistry', 'Computer Science'], examDuration: 45 },
      { id: 'PG005', name: 'Creative & Performing Arts', description: 'Music, drama, dance, fine arts combined with core academic curriculum', duration: '6 years (JSS1-SS3)', fee: 320000, requirements: ['Pass Entrance Exam (50%+)', 'Audition/Portfolio', 'Age 10-15'], subjects: ['English', 'Music', 'Drama', 'Fine Arts'], examDuration: 25 }
    ],
    applications: [
      { id: 'APP001', firstName: 'Michael', lastName: 'Johnson', email: 'michael@example.com', phone: '08012345678', programId: 'PG001', status: 'pending', date: '2026-06-01', dob: '2013-04-15', prevSchool: 'Sunrise Academy', address: '15 Peace Avenue, Lagos', examScheduled: false, examCompleted: false, examScore: null, examPassed: null }
    ],
    examQuestions: [
      { id: 'EQ001', programId: 'PG001', question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 0 },
      { id: 'EQ002', programId: 'PG001', question: 'Who discovered gravity when an apple fell?', options: ['Einstein', 'Newton', 'Galileo', 'Darwin'], answer: 1 },
      { id: 'EQ003', programId: 'PG001', question: 'What is 15 × 12?', options: ['150', '170', '180', '160'], answer: 2 },
      { id: 'EQ004', programId: 'PG001', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2 },
      { id: 'EQ005', programId: 'PG001', question: 'What is the speed of sound approximately?', options: ['340 m/s', '500 m/s', '150 m/s', '1000 m/s'], answer: 0 },
      { id: 'EQ006', programId: 'PG001', question: 'How many bones are in the adult human body?', options: ['106', '206', '306', '156'], answer: 1 },
      { id: 'EQ007', programId: 'PG001', question: 'What does CPU stand for?', options: ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Core Process Unit'], answer: 2 },
      { id: 'EQ008', programId: 'PG001', question: 'Which gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
      { id: 'EQ009', programId: 'PG001', question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], answer: 2 },
      { id: 'EQ010', programId: 'PG001', question: 'What is the largest organ in the human body?', options: ['Liver', 'Brain', 'Skin', 'Heart'], answer: 2 },
      { id: 'EQ011', programId: 'PG002', question: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1 },
      { id: 'EQ012', programId: 'PG002', question: 'What is a synonym for "benevolent"?', options: ['Cruel', 'Kind', 'Angry', 'Sad'], answer: 1 },
      { id: 'EQ013', programId: 'PG002', question: 'Which literary device compares using "like" or "as"?', options: ['Metaphor', 'Simile', 'Alliteration', 'Personification'], answer: 1 },
      { id: 'EQ014', programId: 'PG002', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 2 },
      { id: 'EQ015', programId: 'PG002', question: 'In which year did Nigeria gain independence?', options: ['1957', '1960', '1963', '1965'], answer: 1 },
      { id: 'EQ016', programId: 'PG003', question: 'What is the primary purpose of accounting?', options: ['Sell products', 'Record financial transactions', 'Hire staff', 'Market products'], answer: 1 },
      { id: 'EQ017', programId: 'PG003', question: 'What does "GDP" stand for?', options: ['Gross Domestic Product', 'General Demand Plan', 'Global Development Program', 'Gross Demand Product'], answer: 0 },
      { id: 'EQ018', programId: 'PG003', question: 'Which is NOT a factor of production?', options: ['Land', 'Labour', 'Capital', 'Marketing'], answer: 3 },
      { id: 'EQ019', programId: 'PG003', question: 'What is 25% of 400?', options: ['50', '75', '100', '125'], answer: 2 },
      { id: 'EQ020', programId: 'PG003', question: 'What is the law of demand?', options: ['Price up, demand up', 'Price up, demand down', 'Price and demand equal', 'No relation'], answer: 1 },
      { id: 'EQ021', programId: 'PG004', question: 'What is the value of Pi to 2 decimal places?', options: ['3.14', '3.16', '3.12', '3.18'], answer: 0 },
      { id: 'EQ022', programId: 'PG004', question: 'Which programming language is known as the language of AI?', options: ['Java', 'Python', 'C++', 'Ruby'], answer: 1 },
      { id: 'EQ023', programId: 'PG004', question: 'What is Newton\'s Second Law of Motion?', options: ['F = ma', 'E = mc²', 'v = u + at', 's = ut + ½at²'], answer: 0 },
      { id: 'EQ024', programId: 'PG004', question: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], answer: 1 },
      { id: 'EQ025', programId: 'PG004', question: 'What does "AI" stand for in technology?', options: ['Automatic Interface', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Input'], answer: 1 },
      { id: 'EQ026', programId: 'PG005', question: 'Which musical instrument has 88 keys?', options: ['Violin', 'Guitar', 'Piano', 'Flute'], answer: 2 },
      { id: 'EQ027', programId: 'PG005', question: 'What primary colors make green?', options: ['Red + Blue', 'Blue + Yellow', 'Red + Yellow', 'Black + White'], answer: 1 },
      { id: 'EQ028', programId: 'PG005', question: 'In drama, what is a "monologue"?', options: ['A song', 'A long speech by one character', 'A dance', 'A group scene'], answer: 1 },
      { id: 'EQ029', programId: 'PG005', question: 'Which dance form originated in Nigeria?', options: ['Salsa', 'Bata', 'Tango', 'Ballet'], answer: 1 },
      { id: 'EQ030', programId: 'PG005', question: 'What is the "forte" dynamic in music?', options: ['Soft', 'Loud', 'Fast', 'Slow'], answer: 1 }
    ],
    examAttempts: [],
    notifications: [
      { id: 'NOT001', to: 'STU001', type: 'result', message: 'New results posted for Term 1', date: '2026-06-01', read: false },
      { id: 'NOT002', to: 'STU001', type: 'assignment', message: 'New assignment: Algebra Homework', date: '2026-06-05', read: false },
      { id: 'NOT003', to: 'TCH001', type: 'general', message: 'Staff meeting reminder this Friday', date: '2026-06-01', read: true }
    ],
    academicTerms: [
      { id: 'TRM001', name: 'Term 1 2026', startDate: '2026-01-15', endDate: '2026-04-15', isActive: false },
      { id: 'TRM002', name: 'Term 2 2026', startDate: '2026-05-01', endDate: '2026-08-15', isActive: true },
      { id: 'TRM003', name: 'Term 3 2026', startDate: '2026-09-01', endDate: '2026-12-15', isActive: false }
    ],
    translations: {
      en: { siteTitle: 'EDUVERSE', dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers', fees: 'School Fees', results: 'Results', cat: 'Assessments', activities: 'Activities', attendance: 'Attendance', timetable: 'Timetable', exams: 'Exams', library: 'Library', messages: 'Messages', assignments: 'Assignments', settings: 'Settings', login: 'Login', logout: 'Logout', home: 'Home', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search', export: 'Export', print: 'Print', noData: 'No data available', loading: 'Loading...', submit: 'Submit', view: 'View', name: 'Name', email: 'Email', phone: 'Phone', class: 'Class', subject: 'Subject', date: 'Date', status: 'Status', actions: 'Actions', username: 'Username', password: 'Password', admissions: 'Admissions', id: 'ID', score: 'Score', grade: 'Grade', term: 'Term', amount: 'Amount', paid: 'Paid', balance: 'Balance', description: 'Description', title: 'Title', active: 'Active', inactive: 'Inactive', pending: 'Pending', approved: 'Approved', completed: 'Completed', cancelled: 'Cancelled', unpaid: 'Unpaid', partial: 'Partial', overdue: 'Overdue', all: 'All', filter: 'Filter', total: 'Total', count: 'Count', overview: 'Overview', yes: 'Yes', no: 'No', ok: 'OK', areYouSure: 'Are you sure?', confirm: 'Confirm', close: 'Close', back: 'Back', continue: 'Continue', import: 'Import', download: 'Download', upload: 'Upload', generate: 'Generate', reset: 'Reset', exportCsv: 'Export CSV', address: 'Address', gender: 'Gender', male: 'Male', female: 'Female', dateOfBirth: 'Date of Birth', age: 'Age', nationality: 'Nationality', religion: 'Religion', hostel: 'Hostel', payments: 'Payments', reports: 'Reports', profile: 'Profile', statistics: 'Statistics', lessonNotes: 'Lesson Notes', gradebook: 'Gradebook', chat: 'Chat', notifications: 'Notifications', revenue: 'Revenue', analytics: 'Analytics', reportbuilder: 'Report Builder', activitygames: 'Activity Games', alumni: 'Alumni', eschool: 'E-School', academiccalendar: 'Academic Calendar', idcards: 'ID Cards', gallery: 'Gallery', transcript: 'Transcript', reportcards: 'Report Cards', customizeportal: 'Customize Portal', paymentgateway: 'Payment Gateway', subscription: 'Subscription', systemtools: 'System Tools', handwritingocr: 'Handwriting OCR', teacherexams: 'Teacher Uploads', promotionlist: 'Promotion List', lessonplans: 'Lesson Plans', staffhr: 'Staff HR', examsim: 'Exam Sim', simresults: 'Sim Results', predictiveai: 'Predictive AI', aitools: 'AI Tools', calendar: 'Calendar', subjects: 'Subjects', classroster: 'Class Roster', uploadexam: 'Upload Exam', payfees: 'Pay Fees', reportcard: 'Report Card', programs: 'Programs', applications: 'Applications', exambank: 'Exam Bank', termsession: 'Terms', schoolsetup: 'School Setup', streams: 'Streams', exammodules: 'Exam Modules', utmemock: 'UTME Mock' },
      fr: { siteTitle: 'COLE INTERNATIONAL EDUVERSE', dashboard: 'Tableau de bord', students: 'Élèves', teachers: 'Enseignants', fees: 'Frais scolaires', results: 'Résultats', cat: 'Évaluations', activities: 'Activités', attendance: 'Présence', timetable: 'Emploi du temps', exams: 'Examens', library: 'Bibliothèque', messages: 'Messages', assignments: 'Devoirs', settings: 'Paramètres', login: 'Connexion', logout: 'Déconnexion', home: 'Accueil', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', add: 'Ajouter', search: 'Rechercher', export: 'Exporter', print: 'Imprimer', noData: 'Aucune donnée', loading: 'Chargement...', submit: 'Soumettre', view: 'Voir', name: 'Nom', email: 'Email', phone: 'Téléphone', class: 'Classe', subject: 'Matière', date: 'Date', status: 'Statut', actions: 'Actions', username: 'Nom d\'utilisateur', password: 'Mot de passe', admissions: 'Admissions', id: 'ID', score: 'Score', grade: 'Note', term: 'Trimestre', amount: 'Montant', paid: 'Payé', balance: 'Solde', description: 'Description', title: 'Titre', active: 'Actif', inactive: 'Inactif', pending: 'En attente', approved: 'Approuvé', completed: 'Terminé', cancelled: 'Annulé', unpaid: 'Impayé', partial: 'Partiel', overdue: 'En retard', all: 'Tout', filter: 'Filtrer', total: 'Total', count: 'Nombre', overview: 'Aperçu', yes: 'Oui', no: 'Non', ok: 'OK', areYouSure: 'Êtes-vous sûr ?', confirm: 'Confirmer', close: 'Fermer', back: 'Retour', continue: 'Continuer', import: 'Importer', download: 'Télécharger', upload: 'Téléverser', generate: 'Générer', reset: 'Réinitialiser', exportCsv: 'Exporter CSV', address: 'Adresse', gender: 'Genre', male: 'Masculin', female: 'Féminin', dateOfBirth: 'Date de naissance', age: 'Âge', nationality: 'Nationalité', religion: 'Religion', hostel: 'Internat', payments: 'Paiements', reports: 'Rapports', profile: 'Profil', statistics: 'Statistiques', lessonNotes: 'Notes de cours', gradebook: 'Carnet de notes', chat: 'Discussion', notifications: 'Notifications', revenue: 'Revenus', analytics: 'Analytique', reportbuilder: 'Générateur de rapports', activitygames: 'Jeux d\'activités', alumni: 'Anciens', eschool: 'E-École', academiccalendar: 'Calendrier scolaire', idcards: 'Cartes d\'identité', gallery: 'Galerie', transcript: 'Relevé de notes', reportcards: 'Bulletins', customizeportal: 'Personnaliser le portail', paymentgateway: 'Passerelle de paiement', subscription: 'Abonnement', systemtools: 'Outils système', handwritingocr: 'OCR manuscrit', teacherexams: 'Documents enseignants', promotionlist: 'Liste de promotion', lessonplans: 'Plans de cours', staffhr: 'RH', examsim: 'Simulation d\'examen', simresults: 'Résultats de simulation', predictiveai: 'IA prédictive', aitools: 'Outils IA', calendar: 'Calendrier', subjects: 'Matières', classroster: 'Liste de classe', uploadexam: 'Téléverser examen', payfees: 'Payer frais', reportcard: 'Bulletin', programs: 'Programmes', applications: 'Candidatures', exambank: 'Banque d\'examens', termsession: 'Périodes', schoolsetup: 'Configuration école', streams: 'Filières', exammodules: 'Modules d\'examen', utmemock: 'Simulacre UTME' },
      yo: { siteTitle: 'EDUVERSE', dashboard: 'Dashiboodu', students: 'Awon akeko', teachers: 'Awon oluko', fees: 'Owo ile-iwe', results: 'Awon esi', cat: 'Awon igbelewon', activities: 'Awon ise', attendance: 'Wiwakun', timetable: 'Akoko iso', exams: 'Awon idanwo', library: 'Ile-ikawe', messages: 'Awon ifiranse', assignments: 'Awon ise ile', settings: 'Awon eto', login: 'Woole', logout: 'Jade', home: 'Ile', save: 'Fipamọ', cancel: 'Fagilee', delete: 'Parẹ', edit: 'Satunkọ', add: 'Fikun', search: 'Wa', export: 'Okeere', print: 'Tẹjade', noData: 'Ko si data', loading: 'N gbe...', submit: 'Fi silẹ', view: 'Wo', name: 'Orukọ', email: 'Imeeli', phone: 'Telefonu', class: 'Kilaasi', subject: 'Koko-oro', date: 'Ọjọ', status: 'Ipo', actions: 'Awọn iṣe', username: 'Orukọ olumulo', password: 'Ọrọ igbaniwọle', admissions: 'Awọn iwe iwọle', id: 'ID', score: 'Dimegrio', grade: 'Ipele', term: 'Igba', amount: 'Iye', paid: 'Sanwo', balance: 'Iwontunws.fun', description: 'Apejuwe', title: 'Akọle', active: 'Nṣiṣe', inactive: 'Ko siṣe', pending: 'Nduro', approved: 'Ti fọwọsi', completed: 'Ti pari', cancelled: 'Ti fagilee', unpaid: 'Aisanwo', partial: 'Apakan', overdue: 'Ti pẹ', all: 'Gbogbo', filter: 'Ajọ', total: 'Lapapọ', count: 'Kika', overview: 'Akọsile', yes: 'Bẹẹni', no: 'Bẹẹkọ', ok: 'Dara', areYouSure: 'Ṣe o da ọ loju?', confirm: 'Jẹrisi', close: 'Ti pa', back: 'Pada', continue: 'Tesiwaju', import: 'Gbe wọle', download: 'Gba lati ayelujara', upload: 'Gbe soke', generate: 'Ṣe ipilẹṣẹ', reset: 'Tunto', exportCsv: 'Ko jade CSV', address: 'Adirẹsi', gender: 'Akọ-abo', male: 'Akọ', female: 'Abo', dateOfBirth: 'Ọjọ ibi', age: 'Ọjọ ori', nationality: 'Orilẹ-ede', religion: 'Ẹsin', hostel: 'Ibugbe', payments: 'Awọn sisanwo', reports: 'Awọn ijabọ', profile: 'Profaili', statistics: 'Awọn eeka', lessonNotes: 'Awọn akọsilẹ ẹkọ', gradebook: 'Iwe ite', chat: 'Ifọrọwanilẹnuwo', notifications: 'Awọn ifitonileti', revenue: 'Owo ti nwọle', analytics: 'Awọn atupale', reportbuilder: 'Olupilẹṣẹ ijabọ', activitygames: 'Awọn ere iṣẹ', alumni: 'Awọn ọmọ ile-iwe tẹlẹ', eschool: 'E-Ile-iwe', academiccalendar: 'Kalẹnda ẹkọ', idcards: 'Awọn kaadi idanimọ', gallery: 'Aworan', transcript: 'Iwe-ẹri', reportcards: 'Awọn kaadi ijabọ', customizeportal: 'Ṣe will portal naa', paymentgateway: 'Ọna isanwo', subscription: 'Alabapin', systemtools: 'Awọn irinṣẹ eto', handwritingocr: 'OCR Afọwọkọ', teacherexams: 'Awọn idanwo olukọ', promotionlist: 'Akojọ igbega', lessonplans: 'Awọn ero ẹkọ', staffhr: 'Oṣiṣẹ HR', examsim: 'Idanwo Sim', simresults: 'Awọn abajade Sim', predictiveai: 'AI Asọtẹlẹ', aitools: 'Awọn irinṣẹ AI', calendar: 'Kalẹnda', subjects: 'Awọn koko-oro', classroster: 'Akojọ kilaasi', uploadexam: 'Gbe idanwo soke', payfees: 'San owo ile-iwe', reportcard: 'Kaadi ijabọ', programs: 'Awọn eto', applications: 'Awọn ohun elo', exambank: 'Banki idanwo', termsession: 'Awọn igba', schoolsetup: 'Eto ile-iwe', streams: 'Awọn ṣiṣan', exammodules: 'Awọn modulu idanwo', utmemock: 'UTME Mock' },
      ha: { siteTitle: 'MAKARANTUN DUNIYA NA EDUVERSE', dashboard: 'Dashboard', students: 'Dalibai', teachers: 'Malamai', fees: 'Kudin makaranta', results: 'Sakamako', cat: 'Kima', activities: 'Ayyuka', attendance: 'Halar', timetable: 'Jadawalin', exams: 'Jarrabawa', library: 'Laburare', messages: 'Saƙonni', assignments: 'Ayyukan gida', settings: 'Saituna', login: 'Shiga', logout: 'Fita', home: 'Gida', save: 'Ajiye', cancel: 'Soke', delete: 'Goge', edit: 'Gyara', add: "Ƙara", search: 'Bincike', export: 'Fitarwa', print: 'Buga', noData: 'Babu bayanai', loading: 'Ana lodi...', submit: 'Gabatar', view: 'Duba', name: 'Suna', email: 'Imel', phone: 'Wayar', class: 'Aji', subject: 'Maudu\'i', date: 'Kwanan', status: 'Matsayi', actions: 'Ayyuka', username: 'Sunan mai amfani', password: 'Kalmar sirri', admissions: 'Shiga', id: 'ID', score: 'Maki', grade: 'Maki', term: 'Lokaci', amount: 'Adadin', paid: 'Biya', balance: 'Ma\'auni', description: 'Bayani', title: 'Take', active: 'Aiki', inactive: 'Ba aiki', pending: 'Ana jira', approved: 'An amince', completed: 'An kammala', cancelled: 'An soke', unpaid: 'Ba a biya ba', partial: 'Bangare', overdue: 'Ya wuce', all: 'Duka', filter: 'Tace', total: 'Jimla', count: 'Ƙidaya', overview: 'Duba', yes: 'Ee', no: 'A\'a', ok: 'Yayi', areYouSure: 'Ka tabbata?', confirm: 'Tabbatar', close: 'Rufe', back: 'Geri', continue: 'Ci gaba', import: 'Shigo da', download: 'Sauke', upload: 'Loda', generate: 'Ƙirƙira', reset: 'Sake saiti', exportCsv: 'Fitar da CSV', address: 'Adireshi', gender: 'Jinsi', male: 'Namiji', female: 'Mace', dateOfBirth: 'Ranar haihuwa', age: 'Shekaru', nationality: 'Ƙasa', religion: 'Addini', hostel: 'Dakin kwana', payments: 'Biyuwa', reports: 'Rahotanni', profile: 'Bayanan', statistics: 'Ƙididdiga', lessonNotes: 'Bayanan darasi', gradebook: 'Littafin maki', chat: 'Taɗi', notifications: 'Sanarwa', revenue: 'Kudin shiga', analytics: 'Nazari', reportbuilder: 'Mai Gina Rahoti', activitygames: 'Wasannin Ayyuka', alumni: 'Tsofaffin Dalibai', eschool: 'E-Makaranta', academiccalendar: 'Kalanda Ilimi', idcards: 'Katunan Shaida', gallery: 'Hotuna', transcript: 'Kwafin Maki', reportcards: 'Katunan Rahoti', customizeportal: 'Keɓance Portal', paymentgateway: 'Ƙofar Biya', subscription: 'Biyan Kuɗi', systemtools: 'Kayan Aikin Tsarin', handwritingocr: 'OCR Rubutun Hannu', teacherexams: 'Jarrabawar Malamai', promotionlist: 'Jerin Ɗaukaka', lessonplans: 'Shirye-shiryen Darasi', staffhr: 'Ma\'aikatan HR', examsim: 'Sim Jarrabawa', simresults: 'Sakamakon Sim', predictiveai: 'AI Hangewa', aitools: 'Kayan Aikin AI', calendar: 'Kalanda', subjects: 'Maudu\'ai', classroster: 'Jerin Aji', uploadexam: 'Loda Jarrabawa', payfees: 'Biya Kuɗi', reportcard: 'Katin Rahoti', programs: 'Shirye-shirye', applications: 'Aikace-aikace', exambank: 'Bankin Jarrabawa', termsession: 'Lokaci', schoolsetup: 'Saitin Makaranta', streams: 'Rukunoni', exammodules: 'Sassan Jarrabawa', utmemock: 'Mock UTME' },
      ig: { siteTitle: 'ULOO Akwukwo Mba Nile nke EDUVERSE', dashboard: 'Dashboard', students: 'Umu akwukwo', teachers: 'Ndi nkuzi', fees: 'Ego ulo akwukwo', results: 'Nsonaazu', cat: 'Nleta', activities: 'Oru', attendance: 'Onunu', timetable: 'Oge ihe omume', exams: 'Ule', library: 'Oba akwukwo', messages: 'Ozi', assignments: 'Oru ulo', settings: 'Ntoala', login: 'Banye', logout: 'Puo', home: 'Ulo', save: 'Chekwa', cancel: 'Kagbuo', delete: 'Hichapu', edit: 'Dezie', add: 'Tinye', search: 'Choo', export: 'Mputa', print: 'Biputa', noData: 'Enweghi data', loading: 'Na-ebu...', submit: 'Nyefee', view: 'Lelee', name: 'Aha', email: 'Email', phone: 'Ekwenti', class: 'Klaasi', subject: 'Isiokwu', date: 'Ubochi', status: 'Onodu', actions: 'Omume', username: 'Aha njirimara', password: 'Okwuntughe', admissions: 'Nbanye', id: 'ID', score: 'Akara', grade: 'Okwa', term: 'Oge', amount: 'Onu ego', paid: 'Akpaghi', balance: 'Ihe foduru', description: 'Nkowa', title: 'Isiokwu', active: 'Na-arụ ọrụ', inactive: 'Anaghị arụ ọrụ', pending: 'Na-echere', approved: 'Akwenyeela', completed: 'Emechara', cancelled: 'Akagbuola', unpaid: 'Akpaghị ụgwọ', partial: 'Akụkụ', overdue: 'Gafeela oge', all: 'Ha niile', filter: 'Nyochaa', total: 'Mkpokọta', count: 'Ọnụọgụ', overview: 'Nchịkọta', yes: 'Ee', no: 'Mba', ok: 'Ọ dị mma', areYouSure: 'Ị ji n\'aka?', confirm: 'Kwenye', close: 'Mechi', back: 'Laghachi', continue: 'Gaa n\'ihu', import: 'Bubata', download: 'Budata', upload: 'Bulite', generate: 'Mepụta', reset: 'Tọgharịa', exportCsv: 'Mpụpụ CSV', address: 'Adreesị', gender: 'Okike', male: 'Nwoke', female: 'Nwanyị', dateOfBirth: 'Ụbọchị ọmụmụ', age: 'Afọ', nationality: 'Obodo', religion: 'Okpukpe', hostel: 'Ebe obibi', payments: 'Ịkwụ ụgwọ', reports: 'Akụkọ', profile: 'Profaịlụ', statistics: 'Ọnụ ọgụgụ', lessonNotes: 'Ihe ndetu nkuzi', gradebook: 'Akwụkwọ akara', chat: 'Mkparịta ụka', notifications: 'Ngosi', revenue: 'Ego mbata', analytics: 'Nyocha', reportbuilder: 'Onye nrụpụta akụkọ', activitygames: 'Egwuregwu ọrụ', alumni: 'Ụmụ akwụkwọ ochie', eschool: 'E-ụlọ akwụkwọ', academiccalendar: 'Kalenda agụmakwụkwọ', idcards: 'Kaadị njirimara', gallery: 'Ụlọ ihe ngosi', transcript: 'Idegharị', reportcards: 'Kaadị akụkọ', customizeportal: 'Hazie portal', paymentgateway: 'Ụzọ ịkwụ ụgwọ', subscription: 'Ndenye aha', systemtools: 'Ngwaọrụ sistemụ', handwritingocr: 'OCR akaede', teacherexams: 'Ule ndị nkuzi', promotionlist: 'Ndepụta nkwalite', lessonplans: 'Atụmatụ nkuzi', staffhr: 'HR ndị ọrụ', examsim: 'Sim ule', simresults: 'Nsonaazụ Sim', predictiveai: 'AI amụma', aitools: 'Ngwaọrụ AI', calendar: 'Kalenda', subjects: 'Isiokwu', classroster: 'Ndepụta klaasị', uploadexam: 'Bulite ule', payfees: 'Kwụ ụgwọ', reportcard: 'Kaadị akụkọ', programs: 'Mmemme', applications: 'Ngwa', exambank: 'Ụlọ akụ ule', termsession: 'Oge', schoolsetup: 'Ntọlite ụlọ akwụkwọ', streams: 'Iyi', exammodules: 'Modul ule', utmemock: 'Mock UTME' },
    },
    currentLanguage: 'en',
    activityLog: [],
    admins: [],
    broadcasts: [],
    storeProducts: [
      { id: 'PROD001', name: 'School Uniform - Basic', description: 'Standard school uniform shirt and trousers', price: 15000, category: 'Uniform', image: '', stock: 50 },
      { id: 'PROD002', name: 'Mathematics Textbook Gr.5', description: 'Approved mathematics textbook for Basic 5', price: 8500, category: 'Books', image: '', stock: 30 },
      { id: 'PROD003', name: 'School Sports Kit', description: 'Complete PE kit including shorts, jersey, and trainers', price: 25000, category: 'Sports', image: '', stock: 20 },
      { id: 'PROD004', name: 'School Logo Mug', description: 'Ceramic mug with school emblem', price: 4500, category: 'Merchandise', image: '', stock: 100 }
    ],
    storeOrders: [],
    mealPlans: [],
    dietaryRestrictions: [],
    websiteConfig: {
      enabled: false,
      subdomain: '',
      schoolName: '',
      motto: '',
      logo: '',
      banner: '',
      primaryColor: '#1e40af',
      secondaryColor: '#059669',
      fontFamily: 'Inter, sans-serif',
      sections: [
        { id: 'sec-hero', type: 'hero', title: 'Welcome', content: '', visible: true, order: 0 },
        { id: 'sec-about', type: 'about', title: 'About Us', content: '', visible: true, order: 1 },
        { id: 'sec-announcements', type: 'announcements', title: 'Announcements', items: [], visible: true, order: 2 },
        { id: 'sec-gallery', type: 'gallery', title: 'Photo Gallery', images: [], visible: true, order: 3 },
        { id: 'sec-contact', type: 'contact', title: 'Contact Us', visible: true, order: 4 }
      ]
    },
    schoolTier: 'full_k12',
    examRegistrations: [],
    schoolProfile: {
      schoolName: '',
      logoUrl: '',
      services: [
        { icon: 'fa-graduation-cap', title: 'Academic Excellence', description: 'Rigorous curriculum aligned with national standards, delivered by qualified educators.' },
        { icon: 'fa-chalkboard-teacher', title: 'Expert Teachers', description: 'Highly qualified and experienced teaching staff committed to student success.' },
        { icon: 'fa-flask', title: 'Science & Technology', description: 'Modern laboratories and technology integration across all subjects.' },
        { icon: 'fa-palette', title: 'Creative Arts', description: 'Music, drama, visual arts, and creative expression programs.' },
        { icon: 'fa-running', title: 'Sports & Athletics', description: 'Comprehensive physical education and competitive sports programs.' },
        { icon: 'fa-hand-holding-heart', title: 'Character Development', description: 'Moral education, leadership training, and community service initiatives.' }
      ],
      courses: [
        { icon: 'fa-calculator', title: 'Mathematics', description: 'Comprehensive mathematics from basic arithmetic to advanced calculus.', duration: 'Full Term' },
        { icon: 'fa-book-open', title: 'English Language', description: 'English language arts, literature, and communication skills.', duration: 'Full Term' },
        { icon: 'fa-flask', title: 'Sciences', description: 'Physics, chemistry, biology with practical laboratory sessions.', duration: 'Full Term' },
        { icon: 'fa-globe-africa', title: 'Social Studies', description: 'History, geography, government, and cultural studies.', duration: 'Full Term' },
        { icon: 'fa-laptop-code', title: 'Computer Studies', description: 'Digital literacy, programming, and information technology.', duration: 'Full Term' },
        { icon: 'fa-language', title: 'Languages', description: 'French, Yoruba, Hausa, Igbo and other Nigerian languages.', duration: 'Full Term' }
      ],
      features: [
        { icon: 'fa-user-graduate', title: 'Student Portal', description: 'Access grades, assignments, timetable, and communicate with teachers.' },
        { icon: 'fa-chalkboard-teacher', title: 'Teacher Portal', description: 'Manage classes, assignments, attendance, and grade submissions.' },
        { icon: 'fa-users', title: 'Parent Portal', description: 'Monitor your child\'s progress, fees, and school communication.' },
        { icon: 'fa-chart-line', title: 'Analytics', description: 'Detailed academic analytics and performance tracking across terms.' }
      ],
      activities: [
        { name: 'Sports Club', type: 'Sports', description: 'Football, basketball, athletics, and swimming competitions.', schedule: 'Mon & Wed 3-5pm' },
        { name: 'Debate Team', type: 'Academic', description: 'Public speaking, critical thinking, and competitive debating.', schedule: 'Tue & Thu 2-3:30pm' },
        { name: 'Science Club', type: 'Academic', description: 'Science experiments, projects, and innovation challenges.', schedule: 'Thu 2-4pm' },
        { name: 'Music Band', type: 'Arts', description: 'Instrumental and vocal music training and performances.', schedule: 'Mon, Wed & Fri 3:30-5pm' },
        { name: 'Art Club', type: 'Arts', description: 'Painting, drawing, sculpture, and creative design.', schedule: 'Fri 2-4pm' }
      ],
      events: [
        { title: 'Academic Year Opening', date: '2026-09-15', description: 'Opening ceremony for the new academic year.' },
        { title: 'Inter-House Sports', date: '2026-10-20', description: 'Annual sports competition between school houses.' },
        { title: 'Science Fair', date: '2026-11-10', description: 'Students showcase their science and innovation projects.' }
      ],
      testimonials: [
        { name: 'Mr. Robert Johnson', text: 'This school has transformed my child\'s academic performance. The teachers are dedicated and the facilities are excellent.', role: 'Parent' },
        { name: 'Alice Johnson', text: 'I love the science labs and the debate club! The teachers make learning fun and interesting.', role: 'Student' },
        { name: 'Mr. John Doe', text: 'Teaching here is a privilege. The school provides all the resources we need to deliver quality education.', role: 'Teacher' }
      ],
      heroTitle: 'Shape Your Future With Us',
      heroSubtitle: 'Empowering students with world-class education, innovative learning, and a supportive community.',
      aboutText: 'We are committed to providing quality education that nurtures academic excellence, character development, and lifelong learning.',
      contactEmail: 'info@school.edu',
      contactPhone: '+234 800 000 0000',
      whatsappNumber: '',
      contactAddress: 'Education Avenue, City',
      graduationClass: 'Basic 6',
      socialLinks: [
        { platform: 'facebook', url: '' },
        { platform: 'twitter', url: '' },
        { platform: 'linkedin', url: '' },
        { platform: 'instagram', url: '' },
        { platform: 'youtube', url: '' }
      ],
      heroImages: ['images/hero/slide1.jpg', 'images/hero/slide2.jpg', 'images/hero/slide3.jpg'],
      theme: { primaryColor: '#2563eb', accentColor: '#fbbf24', successColor: '#38a169', infoColor: '#3182ce' },
      // Branding
      schoolMotto: '',
      schoolSecondaryColor: '#7c3aed',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      faviconUrl: 'icons/icon.svg',
      watermarkText: '',
      customCSS: '',
      dashboardLogo: '',
      loginBackground: '',
      defaultLanguage: 'en',
      sessionTimeout: 30,
      dateFormat: 'DD/MM/YYYY',
      // School info
      foundingYear: '',
      schoolType: 'day',
      gender: 'coeducational',
      curriculumLabel: 'Nigerian Curriculum',
      operatingHours: 'Mon - Fri: 8:00 AM - 3:00 PM',
      emergencyContact: '',
      termNames: ['Term 1', 'Term 2', 'Term 3'],
      // Admissions
      admissionOpen: false,
      admissionSeason: '2026/2027 Admissions Open',
      admissionRequirements: [],
      // About
      aboutImages: [],
      // Facilities
      facilities: [],
      // Staff
      staff: [],
      // FAQs
      faqs: [],
      // Footer
      footerColumns: [],
      accreditations: [],
      alumniCount: '',
      newsletterText: 'Subscribe to receive updates on school activities and academic news.',
      // Portal feature toggles
      enableFeatures: { library: true, transport: true, health: true, activities: true, alumni: true, hostel: true, chat: true, gallery: true, examSimulation: true },
      // Grading
      gradingScale: [],
      // Announcements
      announcementBar: { text: '', enabled: false },
      // Custom domains
      customDomains: [],
      // Map embed
      mapEmbedUrl: '',
      // Social feed
      socialFeed: { instagram: '', twitter: '' },
      // Sports houses
      sportHouses: []
    },
    academicCalendar: [
      { id: 'CAL001', title: 'First Term Begins', date: '2026-09-15', type: 'academic', description: 'Opening day for the first academic term.' },
      { id: 'CAL002', title: 'Inter-House Sports', date: '2026-10-20', type: 'sports', description: 'Annual athletics and team sports competition.' },
      { id: 'CAL003', title: 'Mid-Term Break', date: '2026-11-01', type: 'holiday', description: 'School closed for mid-term break.' },
      { id: 'CAL004', title: 'Revision Week', date: '2026-11-15', type: 'academic', description: 'Revision and preparation for end-of-term exams.' }
    ],
    chatRooms: [],
    chatMessages: [],
    virtualClasses: [
      { id: 'VCL001', title: 'Maths Revision — Algebra', topic: 'Algebra', date: '2026-10-15', time: '10:00', platform: 'zoom', link: 'https://zoom.us/j/example1', teacherName: 'Mr. Johnson', description: 'Algebra fundamentals review for upcoming exams.' },
      { id: 'VCL002', title: 'English Literature — Shakespeare', topic: 'Romeo & Juliet', date: '2026-10-17', time: '14:00', platform: 'meet', link: 'https://meet.google.com/example2', teacherName: 'Ms. Williams', description: 'Analysis of key scenes from Romeo and Juliet.' },
      { id: 'VCL003', title: 'Physics — Forces & Motion', topic: 'Newton\'s Laws', date: '2026-10-20', time: '09:00', platform: 'zoom', link: 'https://zoom.us/j/example3', teacherName: 'Mr. Johnson', description: 'Interactive session on Newton\'s laws of motion.' }
    ],
    gallery: [
      { id: 'GAL001', title: 'Annual Sports Day', description: 'Students competing in track and field events during the annual sports festival.', category: 'sports', image: '', uploadedAt: '2026-05-15' },
      { id: 'GAL002', title: 'Science Exhibition', description: 'Students showcasing their innovative science projects at the annual exhibition.', category: 'exhibition', image: '', uploadedAt: '2026-04-20' },
      { id: 'GAL003', title: 'Inter-House Football', description: 'Intense football match between the Blue and Green houses.', category: 'sports', image: '', uploadedAt: '2026-03-10' },
      { id: 'GAL004', title: 'Cultural Day', description: 'Students celebrating diversity through traditional music, dance, and attire.', category: 'extracurricular', image: '', uploadedAt: '2026-06-01' },
      { id: 'GAL005', title: 'Chess Tournament', description: 'Students battling it out in the annual inter-house chess championship.', category: 'games', image: '', uploadedAt: '2026-02-18' }
    ],
    rooms: [
      { id: 'RM001', name: 'Room 101', capacity: 40 },
      { id: 'RM002', name: 'Room 102', capacity: 35 },
      { id: 'RM003', name: 'Science Lab', capacity: 30 },
      { id: 'RM004', name: 'Computer Lab', capacity: 25 },
      { id: 'RM005', name: 'Library', capacity: 50 }
    ],
    teacherSubjects: [],
    classTeachers: {},
    timetableSettings: { periodsPerDay: 8, startHour: 8, breaks: [3] },
    notifLog: [],
    hostels: [
      { id: 'HST001', name: 'Red House', type: 'boys', warden: '' },
      { id: 'HST002', name: 'Blue House', type: 'girls', warden: '' }
    ],
    hostelRooms: [
      { id: 'HRM001', hostelId: 'HST001', roomNumber: '101', capacity: 4, feePerMonth: 25000 },
      { id: 'HRM002', hostelId: 'HST001', roomNumber: '102', capacity: 2, feePerMonth: 35000 },
      { id: 'HRM003', hostelId: 'HST002', roomNumber: '201', capacity: 4, feePerMonth: 25000 },
      { id: 'HRM004', hostelId: 'HST002', roomNumber: '202', capacity: 3, feePerMonth: 30000 }
    ],
    hostelAllocations: [],
    maintenanceReqs: [],
    hostelPayments: [],
    paymentGateway: { provider: 'none', publicKey: '', secretKey: '', currency: 'NGN', testMode: true, stripePaymentLink: '' },
    subscriptionPlans: [
      { id: 'sp_monthly', name: 'Monthly', interval: 'monthly', amount: 5000, currency: 'NGN', description: 'Billed every month — full access', active: true },
      { id: 'sp_yearly', name: 'Yearly', interval: 'yearly', amount: 50000, currency: 'NGN', description: 'Billed annually — save 2 months', active: true }
    ],
    subscription: { plan: 'free', status: 'active', startDate: null, endDate: null, amount: 0, currency: 'NGN', autoRenew: false, lastPaymentDate: null, lastPaymentRef: '' },
    simQuestions: [],
    simAttempts: [],
    customReports: [],
    teacherExams: [],
    activityScores: [],
    alumni: [
      { id: 'ALM001', studentId: 'STU001', name: 'Alice Johnson', graduationYear: '2024', class: 'Basic 5A', email: 'alice@alumni.com', phone: '08012345678', occupation: 'Undergraduate', organization: 'University of Lagos', lastUpdated: '2025-06-01' },
      { id: 'ALM002', studentId: 'STU005', name: 'Eve Davis', graduationYear: '2024', class: 'Basic 6C', email: 'eve@alumni.com', phone: '08087654321', occupation: 'Law Student', organization: 'UNILAG', lastUpdated: '2025-06-01' },
      { id: 'ALM003', studentId: '', name: 'Mr. John Bull', graduationYear: '2010', class: 'SSS 3', email: 'john@example.com', phone: '08055556666', occupation: 'Businessman', organization: 'Bull Enterprises', lastUpdated: '2025-06-01' }
    ],
    reunions: [
      { id: 'REU001', name: 'Class of 2010 Reunion', date: '2026-12-20', time: '16:00', venue: 'School Main Hall', organizer: 'Mr. John Bull', description: '15-year reunion for the graduating class of 2010', attendees: [] }
    ],
    donations: [
      { id: 'DON001', alumniId: 'ALM003', donorName: 'Mr. John Bull', amount: 500000, date: '2026-01-15', purpose: 'Infrastructure', notes: 'Donation for new library wing' }
    ],
    healthRecords: [],
    transportRoutes: [],
    conferences: [],
    gradebookGrid: { rows: [], term: '' },
    customInstitutions: []
  };
}

function loadData() {
  try {
    const dataKey = getDataKey();
    const raw = localStorage.getItem(dataKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultData();
      for (const dk of Object.keys(defaults)) {
        const isDefaultArray = Array.isArray(defaults[dk]);
        const isParsedArray = Array.isArray(parsed[dk]);
        if (!(dk in parsed) || (isDefaultArray && !isParsedArray)) {
          parsed[dk] = defaults[dk];
        }
      }
      // Add new keys that might be missing from old localStorage
      const newKeys = ['timetables', 'gradebook', 'messages', 'exams', 'parents', 'leaveRequests', 'library', 'borrowings', 'lessonNotes', 'behaviorLog', 'staffHR', 'payrollRecords', 'forumPosts', 'fileRepo', 'notifications', 'academicTerms', 'admissionPrograms', 'applications', 'examQuestions', 'examAttempts', 'idCards', 'paymentTransactions', 'admins', 'examRegistrations', 'academicCalendar', 'virtualClasses', 'submissions', 'gallery', 'notifLog', 'rooms', 'teacherSubjects', 'hostels', 'hostelRooms', 'hostelAllocations', 'maintenanceReqs', 'hostelPayments', 'waitlists', 'simQuestions', 'simAttempts', 'customReports', 'activityScores', 'alumni', 'reunions', 'donations', 'teacherExams', 'healthRecords', 'transportRoutes', 'conferences', 'customInstitutions'];
      for (const nk of newKeys) {
        if (!parsed[nk] || !Array.isArray(parsed[nk])) {
          parsed[nk] = defaults[nk];
        }
      }
      if (!parsed.timetableSettings || typeof parsed.timetableSettings !== 'object') {
        parsed.timetableSettings = defaults.timetableSettings;
      }
          if (!parsed.paymentGateway || typeof parsed.paymentGateway !== 'object') {
        parsed.paymentGateway = defaults.paymentGateway;
      }
      if (!Array.isArray(parsed.simQuestions)) parsed.simQuestions = defaults.simQuestions;
      if (!Array.isArray(parsed.simAttempts)) parsed.simAttempts = defaults.simAttempts;
      if (!Array.isArray(parsed.customReports)) parsed.customReports = defaults.customReports;
      if (!Array.isArray(parsed.activityScores)) parsed.activityScores = defaults.activityScores;
      if (!Array.isArray(parsed.alumni)) parsed.alumni = defaults.alumni;
      if (!Array.isArray(parsed.reunions)) parsed.reunions = defaults.reunions;
      if (!Array.isArray(parsed.customInstitutions)) parsed.customInstitutions = defaults.customInstitutions;
      if (!Array.isArray(parsed.donations)) parsed.donations = defaults.donations;
      if (!Array.isArray(parsed.teacherExams)) parsed.teacherExams = defaults.teacherExams;
      if (!parsed.subscriptionPlans || !Array.isArray(parsed.subscriptionPlans)) parsed.subscriptionPlans = defaults.subscriptionPlans;
      if (!parsed.subscription || typeof parsed.subscription !== 'object') parsed.subscription = defaults.subscription;
      // Deep-clean any stale OMOLOLA branding from all stored data
      var _needsSave = false;
      function _cleanBranding(v) {
        if (typeof v === 'string' && v.indexOf('OMOLOLA') !== -1) { _needsSave = true; return v.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE'); }
        if (Array.isArray(v)) { for (var _i = 0; _i < v.length; _i++) v[_i] = _cleanBranding(v[_i]); return v; }
        if (v && typeof v === 'object') { for (var _k in v) { try { v[_k] = _cleanBranding(v[_k]); } catch(e) {} } return v; }
        return v;
      }
      parsed = _cleanBranding(parsed);
      if (typeof parsed.schoolName === 'string' && parsed.schoolName.indexOf('OMOLOLA') !== -1) { _needsSave = true; parsed.schoolName = parsed.schoolName.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE'); }
      if (typeof parsed.schoolMotto === 'string' && parsed.schoolMotto.indexOf('OMOLOLA') !== -1) { _needsSave = true; parsed.schoolMotto = parsed.schoolMotto.replace(/OMOLOLA\s*INTERNATIONAL\s*SCHOOLS?/gi, 'EDUVERSE - SCHOOL MANAGEMENT PLATFORM').replace(/OMOLOLA/gi, 'EDUVERSE'); }
      if (_needsSave) { localStorage.setItem(getDataKey(), JSON.stringify(parsed)); }
      return parsed;
    }
  } catch(e) {}
  return getDefaultData();
}

function saveData() {
  localStorage.setItem(getDataKey(), JSON.stringify(data));
}

function __saveCurrentData() {
  saveData();
}

// data is loaded via loadData() in app.js on DOMContentLoaded (faster startup)
var data = null;

// ===== UTILITIES =====
function genId(prefix) {
  const n = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,4).toUpperCase();
  return prefix + n;
}

function getStudent(id) { return (data.students || []).find(s => s.id === id); }
function getTeacher(id) { return (data.teachers || []).find(t => t.id === id); }
function getAssignment(id) { return (data.assignments || []).find(a => a.id === id); }

function getGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'D+';
  if (score >= 50) return 'D';
  return 'F';
}

// Global translate function
function __(key, fallback) {
  const lang = data.currentLanguage || 'en';
  const t = data.translations?.[lang];
  return t?.[key] || fallback || key;
}

// Export for use by other modules
window.__getData = function() { return data; };
Object.defineProperty(window, '__data', { get: function() { return data; }, configurable: true });
window.__getDefaultData = getDefaultData;
window.__loadData = loadData;
window.__saveData = saveData;
window.__genId = genId;
window.__getStudent = getStudent;
window.__getTeacher = getTeacher;
window.__getAssignment = getAssignment;
window.__getGrade = getGrade;
