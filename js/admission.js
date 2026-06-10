// EDUVERSE - Admission & Exam Center
// Manages program listings, applications, entrance exams (with proctor), and results

// ===== STATE =====
let currentApp = null;         // current application object being processed
let examState = null;          // { appId, questions, answers: [], currentIdx, timer, startTime, proctorStream, snapshots, tabSwitches }
let proctorInterval = null;

// ===== EXAM QUESTION BANK SEEDER =====
function seedExamQuestions() {
  var qs = data.examQuestions || [];
  if (qs.length >= 1000) return;

  // Subject question pools per program (50 questions per subject = 200 per program = 1000 total)
  var questionPools = {
    'PG001': { // Science & Technology: Mathematics, English, Science, Technology
      subjects: ['Mathematics', 'English', 'Science', 'Technology'],
      questions: {
        Mathematics: [
          { q: 'What is 25 × 18?', opts: ['400', '450', '500', '475'], ans: 1 },
          { q: 'What is the square root of 225?', opts: ['12', '15', '18', '20'], ans: 1 },
          { q: 'If x + 7 = 15, what is x?', opts: ['6', '7', '8', '9'], ans: 2 },
          { q: 'What is 3/4 as a decimal?', opts: ['0.25', '0.5', '0.75', '0.8'], ans: 2 },
          { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], ans: 1 },
          { q: 'What is 2^5?', opts: ['16', '24', '32', '64'], ans: 2 },
          { q: 'What is the area of a rectangle 6m by 4m?', opts: ['10 sq m', '20 sq m', '24 sq m', '30 sq m'], ans: 2 },
          { q: 'What is 15% of 200?', opts: ['15', '20', '30', '45'], ans: 2 },
          { q: 'How many degrees in a right angle?', opts: ['45', '60', '90', '180'], ans: 2 },
          { q: 'What is 144 ÷ 12?', opts: ['10', '11', '12', '14'], ans: 2 },
          { q: 'What is the LCM of 6 and 8?', opts: ['14', '24', '48', '16'], ans: 1 },
          { q: 'What is 0.5 × 0.3?', opts: ['0.15', '0.8', '1.5', '0.015'], ans: 0 },
          { q: 'What is the perimeter of a square with side 9cm?', opts: ['18cm', '27cm', '36cm', '81cm'], ans: 2 },
          { q: 'What is 7! (7 factorial)?', opts: ['720', '5040', '2520', '40320'], ans: 1 },
          { q: 'Simplify: 2(3x + 4)', opts: ['6x+4', '6x+8', '5x+6', '3x+8'], ans: 1 },
          { q: 'What is the next prime number after 17?', opts: ['19', '21', '23', '29'], ans: 0 },
          { q: 'How many faces does a cube have?', opts: ['4', '6', '8', '12'], ans: 1 },
          { q: 'What is log₁₀(100)?', opts: ['1', '2', '10', '100'], ans: 1 },
          { q: 'What is the value of π to 2 decimal places?', opts: ['3.14', '3.16', '3.12', '3.18'], ans: 0 },
          { q: 'What is the sum of interior angles of a triangle?', opts: ['90°', '180°', '270°', '360°'], ans: 1 },
          { q: 'What is the mean of 4, 8, 12, 16?', opts: ['8', '10', '12', '14'], ans: 1 },
          { q: 'What is the median of 3, 7, 9, 12, 15?', opts: ['7', '9', '12', '3'], ans: 1 },
          { q: 'Solve: 5x - 3 = 2x + 9', opts: ['x=3', 'x=4', 'x=5', 'x=6'], ans: 1 },
          { q: 'What is 10^-2?', opts: ['0.01', '0.1', '100', '-100'], ans: 0 },
          { q: 'A car travels 180km in 3 hours. What is its speed?', opts: ['50 km/h', '60 km/h', '70 km/h', '90 km/h'], ans: 1 },
          { q: 'How many vertices does a cuboid have?', opts: ['6', '8', '10', '12'], ans: 1 },
          { q: 'What is the mode of 2,2,3,4,5,5,5,6?', opts: ['2', '3', '5', '6'], ans: 2 },
          { q: 'What is the range of 12, 15, 20, 25, 30?', opts: ['12', '15', '18', '30'], ans: 2 },
          { q: 'What is the product of -3 and -7?', opts: ['-21', '21', '-10', '10'], ans: 1 },
          { q: 'If y = 2x + 1, what is y when x = 5?', opts: ['10', '11', '12', '15'], ans: 1 },
          { q: 'What is the volume of a cube with side 4cm?', opts: ['16 cm³', '32 cm³', '64 cm³', '128 cm³'], ans: 2 },
          { q: 'What is 8³?', opts: ['64', '256', '512', '1024'], ans: 2 },
          { q: 'What percentage is 3/5?', opts: ['30%', '50%', '60%', '75%'], ans: 2 },
          { q: 'How many edges does a triangular prism have?', opts: ['6', '9', '12', '15'], ans: 1 },
          { q: 'What is the simple interest on $1000 at 5% for 2 years?', opts: ['$50', '$100', '$150', '$200'], ans: 1 },
          { q: 'What is the approximate value of √50?', opts: ['5', '7', '9', '25'], ans: 1 },
          { q: 'What is 2/5 + 3/10?', opts: ['5/15', '7/10', '5/10', '7/15'], ans: 1 },
          { q: 'How many minutes are in 2.5 hours?', opts: ['120', '150', '180', '200'], ans: 1 },
          { q: 'What is the GCF of 24 and 36?', opts: ['6', '8', '12', '18'], ans: 2 },
          { q: 'What is 1/8 as a decimal?', opts: ['0.125', '0.25', '0.5', '0.75'], ans: 0 },
          { q: 'Simplify: √(9 × 16)', opts: ['7', '12', '25', '36'], ans: 1 },
          { q: 'What is the next number: 2, 6, 18, 54, ?', opts: ['108', '162', '216', '324'], ans: 1 },
          { q: 'What is 75% of 600?', opts: ['350', '400', '450', '500'], ans: 2 },
          { q: 'How many degrees in a circle?', opts: ['180', '270', '360', '400'], ans: 2 },
          { q: 'What type of angle is 120°?', opts: ['Acute', 'Right', 'Obtuse', 'Reflex'], ans: 2 },
          { q: 'What is 0.25 × 0.4?', opts: ['0.01', '0.1', '1.0', '10'], ans: 1 },
          { q: 'What is the reciprocal of 5?', opts: ['5', '-5', '1/5', '5/1'], ans: 2 },
          { q: 'How many lines of symmetry does a square have?', opts: ['2', '4', '6', '8'], ans: 1 },
          { q: 'What is (a + b)²?', opts: ['a²+b²', 'a²+2ab+b²', 'a²-2ab+b²', '2a+2b'], ans: 1 },
          { q: 'What is the circumference of a circle with radius 7cm? (π=22/7)', opts: ['22cm', '44cm', '88cm', '154cm'], ans: 1 }
        ],
        English: [
          { q: 'What is a synonym for "happy"?', opts: ['Sad', 'Angry', 'Joyful', 'Tired'], ans: 2 },
          { q: 'Identify the noun in: "The boy ran fast."', opts: ['ran', 'fast', 'The', 'boy'], ans: 3 },
          { q: 'What is the past tense of "go"?', opts: ['goed', 'gone', 'went', 'going'], ans: 2 },
          { q: 'What is an antonym for "hot"?', opts: ['Warm', 'Cold', 'Bright', 'Big'], ans: 1 },
          { q: 'Which is a complete sentence?', opts: ['Running fast', 'The dog', 'She sings well', 'Under the'], ans: 2 },
          { q: 'What punctuation ends a question?', opts: ['.', '!', '?', ','], ans: 2 },
          { q: 'What is the plural of "child"?', opts: ['childs', 'childes', 'children', 'children'], ans: 2 },
          { q: 'Identify the verb: "She writes beautifully."', opts: ['She', 'writes', 'beautifully', 'the'], ans: 1 },
          { q: 'What is the opposite of "always"?', opts: ['Often', 'Sometimes', 'Never', 'Frequently'], ans: 2 },
          { q: 'Which word is an adjective?', opts: ['Run', 'Beautiful', 'Quickly', 'And'], ans: 1 },
          { q: 'What is a metaphor?', opts: ['A comparison using like/as', 'A direct comparison', 'A sound word', 'A repeated consonant'], ans: 1 },
          { q: 'Correct this: "He dont like coffee."', opts: ["He doesn't like coffee", "He don't likes coffee", "He not like coffee", "He no like coffee"], ans: 0 },
          { q: 'What is the root word of "unhappiness"?', opts: ['un', 'ness', 'happy', 'hap'], ans: 2 },
          { q: 'What is a prefix?', opts: ['Added to end', 'Added to beginning', 'Whole word', 'A suffix'], ans: 1 },
          { q: 'Which is a compound word?', opts: ['Butterfly', 'Beautiful', 'Running', 'Quickly'], ans: 0 },
          { q: 'What is alliteration?', opts: ['Repeated vowel', 'Repeated consonant', 'Repeated word', 'Rhyming'], ans: 1 },
          { q: 'What is the subject in: "The cat slept on the mat."?', opts: ['slept', 'mat', 'cat', 'the'], ans: 2 },
          { q: 'Which is a proper noun?', opts: ['city', 'dog', 'London', 'book'], ans: 2 },
          { q: 'What is the comparative form of "good"?', opts: ['gooder', 'better', 'best', 'more good'], ans: 1 },
          { q: 'What does "benevolent" mean?', opts: ['Cruel', 'Kind', 'Sad', 'Fast'], ans: 1 },
          { q: 'Identify the preposition: "The book is on the table."', opts: ['book', 'is', 'on', 'table'], ans: 2 },
          { q: 'What is an idiom?', opts: ['Literal phrase', 'Figurative phrase', 'Technical term', 'Formal word'], ans: 1 },
          { q: 'Which tense is "She had eaten"?', opts: ['Present', 'Past', 'Past Perfect', 'Future'], ans: 2 },
          { q: 'What is a conjunction?', opts: ['A person', 'A place', 'A connecting word', 'A describing word'], ans: 2 },
          { q: 'What is the meaning of "break the ice"?', opts: ['Break frozen water', 'Start a conversation', 'Destroy something', 'Cold weather'], ans: 1 },
          { q: 'Which is an adverb?', opts: ['happy', 'quickly', 'beauty', 'friend'], ans: 1 },
          { q: 'What is the opposite of "expand"?', opts: ['Grow', 'Increase', 'Contract', 'Extend'], ans: 2 },
          { q: 'What is personification?', opts: ['Animal talking', 'Human qualities to objects', 'Exaggeration', 'Comparison'], ans: 1 },
          { q: 'How many syllables in "beautiful"?', opts: ['2', '3', '4', '5'], ans: 1 },
          { q: 'What is a homophone?', opts: ['Same spelling', 'Same sound, different meaning', 'Same meaning', 'Opposite meaning'], ans: 1 },
          { q: 'Which is correct: "Their" or "There"?', opts: ['Their showing up', 'There coming', 'They\'re here', 'There car'], ans: 2 },
          { q: 'What is a paragraph?', opts: ['A sentence', 'A group of sentences on one topic', 'A word', 'A chapter'], ans: 1 },
          { q: 'What is an autobiography?', opts: ['Biography of another', 'Story written by oneself', 'Fiction story', 'Poem'], ans: 1 },
          { q: 'What is a simile?', opts: ['Comparison with like/as', 'Direct comparison', 'Sound word', 'Exaggeration'], ans: 0 },
          { q: 'Which is a synonym for "difficult"?', opts: ['Easy', 'Simple', 'Hard', 'Light'], ans: 2 },
          { q: 'What is the main idea of a text?', opts: ['Details', 'Central point', 'Examples', 'Introduction'], ans: 1 },
          { q: 'What is an antagonist?', opts: ['Main character', 'Opposing character', 'Supporting character', 'Narrator'], ans: 1 },
          { q: 'What is a climax in a story?', opts: ['Beginning', 'Highest point of tension', 'Ending', 'Introduction'], ans: 1 },
          { q: 'Which is a type of poem?', opts: ['Novel', 'Sonnet', 'Essay', 'Article'], ans: 1 },
          { q: 'What is foreshadowing?', opts: ['Looking back', 'Hinting future events', 'Describing setting', 'Dialogue'], ans: 1 },
          { q: 'What is the resolution of a story?', opts: ['Problem introduced', 'Conflict resolved', 'Characters introduced', 'Climax'], ans: 1 },
          { q: 'What is dialogue?', opts: ['Description', 'Conversation between characters', 'Narration', 'Monologue'], ans: 1 },
          { q: 'What is the setting of a story?', opts: ['Characters', 'Time and place', 'Plot', 'Theme'], ans: 1 },
          { q: 'What is a plot?', opts: ['The characters', 'The sequence of events', 'The location', 'The moral'], ans: 1 },
          { q: 'What is a theme?', opts: ['Story location', 'Central message', 'Character name', 'Chapter title'], ans: 1 },
          { q: 'What is conflict in literature?', opts: ['Peaceful scene', 'Struggle between forces', 'Happy ending', 'Character description'], ans: 1 },
          { q: 'What is point of view?', opts: ['Location', 'Who tells the story', 'Time period', 'Title'], ans: 1 },
          { q: 'What is a stanza?', opts: ['Line in poem', 'Group of lines in poem', 'Chapter', 'Paragraph'], ans: 1 },
          { q: 'What is a synonym for "quick"?', opts: ['Slow', 'Fast', 'Late', 'Early'], ans: 1 },
          { q: 'Which word is spelled correctly?', opts: ['Recieve', 'Receive', 'Receeve', 'Receve'], ans: 1 }
        ],
        Science: [
          { q: 'What is the chemical symbol for iron?', opts: ['Ir', 'Fe', 'In', 'I'], ans: 1 },
          { q: 'What gas do plants release during photosynthesis?', opts: ['CO₂', 'O₂', 'N₂', 'H₂'], ans: 1 },
          { q: 'What is the smallest unit of life?', opts: ['Tissue', 'Organ', 'Cell', 'Molecule'], ans: 2 },
          { q: 'What is the boiling point of water in Celsius?', opts: ['50°C', '100°C', '150°C', '200°C'], ans: 1 },
          { q: 'What planet is closest to the Sun?', opts: ['Venus', 'Mercury', 'Earth', 'Mars'], ans: 1 },
          { q: 'What is the chemical formula for table salt?', opts: ['NaCl', 'KCl', 'CaCl₂', 'NaOH'], ans: 0 },
          { q: 'What force keeps planets orbiting the Sun?', opts: ['Magnetism', 'Gravity', 'Friction', 'Inertia'], ans: 1 },
          { q: 'What organ pumps blood in the body?', opts: ['Brain', 'Lungs', 'Heart', 'Liver'], ans: 2 },
          { q: 'What is the pH of pure water?', opts: ['5', '7', '9', '11'], ans: 1 },
          { q: 'What type of rock is formed from cooling magma?', opts: ['Sedimentary', 'Metamorphic', 'Igneous', 'Fossil'], ans: 2 },
          { q: 'What is the speed of light approximately?', opts: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], ans: 0 },
          { q: 'What is the atomic number of oxygen?', opts: ['6', '8', '10', '16'], ans: 1 },
          { q: 'What is a chemical bond?', opts: ['Physical link', 'Force holding atoms together', 'Nuclear reaction', 'Electron shell'], ans: 1 },
          { q: 'What is the function of the mitochondria?', opts: ['Protein synthesis', 'Energy production', 'Waste removal', 'Cell division'], ans: 1 },
          { q: 'What is a mammal?', opts: ['Cold-blooded', 'Has fur and milk glands', 'Lays eggs', 'Has gills'], ans: 1 },
          { q: 'What is the chemical symbol for gold?', opts: ['Go', 'Gd', 'Au', 'Ag'], ans: 2 },
          { q: 'What is a hypothesis?', opts: ['Proven fact', 'Testable explanation', 'Scientific law', 'Conclusion'], ans: 1 },
          { q: 'What is the largest organ in the human body?', opts: ['Brain', 'Liver', 'Skin', 'Heart'], ans: 2 },
          { q: 'What is condensation?', opts: ['Solid to liquid', 'Gas to liquid', 'Liquid to gas', 'Solid to gas'], ans: 1 },
          { q: 'What is the main gas in Earth\'s atmosphere?', opts: ['Oxygen', 'CO₂', 'Nitrogen', 'Argon'], ans: 2 },
          { q: 'What are the products of photosynthesis?', opts: ['Water + CO₂', 'Glucose + O₂', 'O₂ + Water', 'CO₂ + Glucose'], ans: 1 },
          { q: 'What is the atomic mass of carbon?', opts: ['6', '8', '12', '14'], ans: 2 },
          { q: 'What is oxidation?', opts: ['Gain of electrons', 'Loss of electrons', 'Neutral reaction', 'No change'], ans: 1 },
          { q: 'What is the function of red blood cells?', opts: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Produce antibodies'], ans: 1 },
          { q: 'What is a fossil?', opts: ['Live organism', 'Preserved remains', 'Rock type', 'Mineral'], ans: 1 },
          { q: 'What is the SI unit of force?', opts: ['Joule', 'Newton', 'Watt', 'Pascal'], ans: 1 },
          { q: 'What is a chemical reaction?', opts: ['Physical change', 'Substance transforms', 'Temperature change', 'Phase change'], ans: 1 },
          { q: 'What is DNA?', opts: ['Protein', 'Genetic material', 'Sugar', 'Lipid'], ans: 1 },
          { q: 'What is an ecosystem?', opts: ['Single organism', 'Community + environment', 'Only plants', 'Only animals'], ans: 1 },
          { q: 'What is a catalyst?', opts: ['Slows reaction', 'Speeds up reaction', 'Stops reaction', 'No effect'], ans: 1 },
          { q: 'What is a base in chemistry?', opts: ['pH < 7', 'pH = 7', 'pH > 7', 'No pH'], ans: 2 },
          { q: 'What is a neutron?', opts: ['Positive particle', 'Negative particle', 'Neutral particle', 'No particle'], ans: 2 },
          { q: 'What is the law of conservation of mass?', opts: ['Mass created', 'Mass destroyed', 'Mass unchanged in reaction', 'Mass converted'], ans: 2 },
          { q: 'What is the function of roots in plants?', opts: ['Photosynthesis', 'Water absorption', 'Reproduction', 'Flowering'], ans: 1 },
          { q: 'What is a vertebrate?', opts: ['Animal with backbone', 'Animal without backbone', 'Plant', 'Fungus'], ans: 0 },
          { q: 'What is a planet?', opts: ['Star', 'Orbits a star', 'Moon', 'Asteroid'], ans: 1 },
          { q: 'What is an acid?', opts: ['pH > 7', 'pH = 7', 'pH < 7', 'Neutral'], ans: 2 },
          { q: 'What is a pure substance?', opts: ['Mixture', 'Single element/compound', 'Solution', 'Alloy'], ans: 1 },
          { q: 'What is mitosis?', opts: ['Cell division for reproduction', 'Cell division for growth', 'Cell death', 'Cell fusion'], ans: 1 },
          { q: 'What is an element?', opts: ['Combination of atoms', 'One type of atom', 'Molecule', 'Compound'], ans: 1 },
          { q: 'What is friction?', opts: ['Force that speeds up', 'Force that opposes motion', 'No force', 'Gravitational force'], ans: 1 },
          { q: 'What is a solute?', opts: ['Substance dissolved', 'Substance doing dissolving', 'Mixture', 'Solution'], ans: 0 },
          { q: 'What is evaporation?', opts: ['Gas to liquid', 'Liquid to gas', 'Solid to liquid', 'Solid to gas'], ans: 1 },
          { q: 'What is the function of the nervous system?', opts: ['Digestion', 'Sends signals', 'Circulation', 'Respiration'], ans: 1 },
          { q: 'What is an atom?', opts: ['Molecule', 'Smallest particle of element', 'Cell', 'Compound'], ans: 1 },
          { q: 'What is an isotope?', opts: ['Same protons, different neutrons', 'Same neutrons, different protons', 'Same electrons', 'Different element'], ans: 0 },
          { q: 'What is a saturated solution?', opts: ['No more solute dissolves', 'Partial solute', 'Dilute', 'Concentrated'], ans: 0 },
          { q: 'What is the ozone layer?', opts: ['CO₂ layer', 'O₃ layer protecting from UV', 'Cloud layer', 'O₂ layer'], ans: 1 },
          { q: 'What is a food chain?', opts: ['Energy flow in ecosystem', 'Food types', 'Cooking process', 'Plant growth'], ans: 0 },
          { q: 'What is the function of enzymes?', opts: ['Speed up reactions', 'Slow down reactions', 'Provide energy', 'Build cells'], ans: 0 }
        ],
        Technology: [
          { q: 'What does CPU stand for?', opts: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Core Process Unit'], ans: 1 },
          { q: 'What is the binary equivalent of 5?', opts: ['100', '101', '110', '111'], ans: 1 },
          { q: 'What does RAM stand for?', opts: ['Read Access Memory', 'Random Access Memory', 'Run Application Memory', 'Rapid Access Module'], ans: 1 },
          { q: 'What is an algorithm?', opts: ['Computer hardware', 'Step-by-step solution', 'Programming language', 'Data type'], ans: 1 },
          { q: 'What is the function of an operating system?', opts: ['Run applications', 'Manage hardware/software', 'Browse internet', 'Edit documents'], ans: 1 },
          { q: 'What is HTML?', opts: ['Programming language', 'Markup language for web', 'Database', 'Network protocol'], ans: 1 },
          { q: 'What is a website?', opts: ['Computer program', 'Collection of web pages', 'Search engine', 'File type'], ans: 1 },
          { q: 'What is a database?', opts: ['Spreadsheet', 'Organized data collection', 'Text file', 'Image'], ans: 1 },
          { q: 'What is a computer virus?', opts: ['Hardware issue', 'Malicious software', 'User error', 'Network problem'], ans: 1 },
          { q: 'What does Wi-Fi stand for?', opts: ['Wireless Fidelity', 'Wide Frequency', 'Wireless Finder', 'Wired Fiber'], ans: 0 },
          { q: 'What is a byte?', opts: ['2 bits', '8 bits', '16 bits', '32 bits'], ans: 1 },
          { q: 'What is a programming language?', opts: ['Hardware component', 'Instructions for computer', 'Network device', 'Storage medium'], ans: 1 },
          { q: 'What is the Internet?', opts: ['Single computer', 'Global network of networks', 'Software', 'Protocol'], ans: 1 },
          { q: 'What is cybersecurity?', opts: ['Protecting computers from theft/damage', 'Building computers', 'Network design', 'Data entry'], ans: 0 },
          { q: 'What is a server?', opts: ['Personal device', 'Computer serving resources', 'Network cable', 'Software'], ans: 1 },
          { q: 'What does URL stand for?', opts: ['User Resource Link', 'Uniform Resource Locator', 'Universal Response Line', 'Unified Resource List'], ans: 1 },
          { q: 'What is a compiler?', opts: ['Translates code to machine language', 'Runs code directly', 'Debugs code', 'Edits code'], ans: 0 },
          { q: 'What is a gigabyte in bytes?', opts: ['Million', 'Billion', 'Trillion', 'Thousand'], ans: 1 },
          { q: 'What is the cloud?', opts: ['Weather data', 'Internet-based computing', 'Physical server', 'Storage device'], ans: 1 },
          { q: 'What is a spreadsheet?', opts: ['Word document', 'Grid of cells for data', 'Presentation', 'Database'], ans: 1 },
          { q: 'What is a pixel?', opts: ['Program element', 'Smallest display unit', 'File format', 'Color code'], ans: 1 },
          { q: 'What is AI?', opts: ['Automatic Input', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Interface'], ans: 1 },
          { q: 'What is a firewall?', opts: ['Physical wall', 'Network security system', 'Hardware device', 'Cable type'], ans: 1 },
          { q: 'What does VPN stand for?', opts: ['Virtual Public Network', 'Virtual Private Network', 'Very Private Network', 'Visual Private Node'], ans: 1 },
          { q: 'What is a browser?', opts: ['Database tool', 'Web access software', 'Programming IDE', 'File manager'], ans: 1 },
          { q: 'What is a cookie in computing?', opts: ['Deleted data', 'Stored browsing data', 'Virus', 'Hardware'], ans: 1 },
          { q: 'What is open-source software?', opts: ['Free only', 'Source code available publicly', 'No license needed', 'Trial software'], ans: 1 },
          { q: 'What is a router?', opts: ['Connects networks', 'Computer type', 'Cable', 'Software'], ans: 0 },
          { q: 'What is an IP address?', opts: ['Web address', 'Device identifier on network', 'Email address', 'Location'], ans: 1 },
          { q: 'What is encryption?', opts: ['Code breaking', 'Converting data to secure format', 'Data deletion', 'File compression'], ans: 1 },
          { q: 'What is a variable in programming?', opts: ['Fixed value', 'Storage for changing data', 'Function', 'Constant'], ans: 1 },
          { q: 'What is a loop?', opts: ['Repeated code block', 'One-time execution', 'Condition check', 'Variable declaration'], ans: 0 },
          { q: 'What is a function in programming?', opts: ['Variable', 'Reusable code block', 'Data type', 'Operator'], ans: 1 },
          { q: 'What is CSS?', opts: ['Style sheet language', 'Programming language', 'Database', 'Server script'], ans: 0 },
          { q: 'What is JavaScript?', opts: ['Java version', 'Web scripting language', 'CSS framework', 'Database'], ans: 1 },
          { q: 'What is a data structure?', opts: ['Data type', 'Organizing data format', 'File system', 'Network'], ans: 1 },
          { q: 'What is a query in databases?', opts: ['Data entry', 'Data retrieval request', 'Data deletion', 'Table creation'], ans: 1 },
          { q: 'What is a network topology?', opts: ['Network location', 'Layout of connected devices', 'Cable type', 'Speed test'], ans: 1 },
          { q: 'What is a protocol in networking?', opts: ['Hardware device', 'Set of communication rules', 'Software', 'Cable'], ans: 1 },
          { q: 'What is machine learning?', opts: ['Manual programming', 'AI that learns from data', 'Database query', 'Hardware setup'], ans: 1 },
          { q: 'What is a search engine?', opts: ['Web browser', 'Finds web information', 'Email client', 'File manager'], ans: 1 },
          { q: 'What is an API?', opts: ['Application Program Interface', 'Advanced Program Integration', 'Automated Protocol Interface', 'Application Process Integration'], ans: 0 },
          { q: 'What is a software license?', opts: ['Hardware key', 'Legal use agreement', 'Program file', 'Installation guide'], ans: 1 },
          { q: 'What is debugging?', opts: ['Writing code', 'Fixing errors in code', 'Running code', 'Compiling code'], ans: 1 },
          { q: 'What is a function argument?', opts: ['Return value', 'Input to function', 'Function name', 'Variable type'], ans: 1 },
          { q: 'What is a boolean?', opts: ['Number type', 'True/false value', 'String type', 'Array'], ans: 1 },
          { q: 'What is the Internet of Things (IoT)?', opts: ['Internet speed', 'Connected devices network', 'Web browsers', 'Social media'], ans: 1 },
          { q: 'What is cloud storage?', opts: ['Local hard drive', 'Online data storage', 'USB drive', 'CD-ROM'], ans: 1 },
          { q: 'What is a hash function?', opts: ['Encryption', 'Maps data to fixed size', 'Sorting algorithm', 'Search algorithm'], ans: 1 },
          { q: 'What is an algorithm\'s time complexity?', opts: ['Time to write', 'Measure of efficiency', 'Code length', 'Number of lines'], ans: 1 }
        ]
      }
    },
    'PG002': { // Arts & Humanities: English, Literature, History, Arts
      subjects: ['English', 'Literature', 'History', 'Arts'],
      questions: {
        English: [],  // English questions generated above (shared)
        Literature: [
          { q: 'Who wrote "Things Fall Apart"?', opts: ['Wole Soyinka', 'Chinua Achebe', 'Chimamanda Adichie', 'Ben Okri'], ans: 1 },
          { q: 'What is a protagonist?', opts: ['Villain', 'Main character', 'Narrator', 'Side character'], ans: 1 },
          { q: 'What is a tragedy in literature?', opts: ['Happy ending', 'Serious drama with sad ending', 'Comedy', 'Satire'], ans: 1 },
          { q: 'Who wrote "Pride and Prejudice"?', opts: ['Emily Brontë', 'Jane Austen', 'Charles Dickens', 'George Eliot'], ans: 1 },
          { q: 'What is a novel?', opts: ['Short story', 'Long fictional narrative', 'Poem', 'Play'], ans: 1 },
          { q: 'What is imagery in literature?', opts: ['Pictures in book', 'Vivid descriptive language', 'Chapter title', 'Book cover'], ans: 1 },
          { q: 'Who wrote "1984"?', opts: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H.G. Wells'], ans: 1 },
          { q: 'What is a sonnet?', opts: ['Type of novel', '14-line poem', 'Short story', 'Essay'], ans: 1 },
          { q: 'What is symbolism?', opts: ['Direct meaning', 'Using symbols to represent ideas', 'Rhyme scheme', 'Plot device'], ans: 1 },
          { q: 'Who wrote "The Great Gatsby"?', opts: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck', 'Mark Twain'], ans: 1 },
          { q: 'What is a flashback?', opts: ['Scene from future', 'Scene from earlier time', 'Current scene', 'Dialogue'], ans: 1 },
          { q: 'What is irony?', opts: ['Expected outcome', 'Opposite of what is expected', 'Sad event', 'Funny event'], ans: 1 },
          { q: 'Who wrote "Animal Farm"?', opts: ['George Orwell', 'Aldous Huxley', 'H.G. Wells', 'Jules Verne'], ans: 0 },
          { q: 'What is a genre?', opts: ['Author name', 'Category of literature', 'Book title', 'Chapter number'], ans: 1 },
          { q: 'What is a narrator?', opts: ['Character in story', 'Voice telling the story', 'Author', 'Publisher'], ans: 1 },
          { q: 'Who wrote "The Odyssey"?', opts: ['Sophocles', 'Homer', 'Virgil', 'Plato'], ans: 1 },
          { q: 'What is a prologue?', opts: ['Final chapter', 'Introductory section', 'Middle chapter', 'Epilogue'], ans: 1 },
          { q: 'What is satire?', opts: ['Serious writing', 'Humor/criticism of society', 'Love poem', 'Historical account'], ans: 1 },
          { q: 'Who wrote "To Kill a Mockingbird"?', opts: ['Harper Lee', 'Mark Twain', 'John Steinbeck', 'William Faulkner'], ans: 0 },
          { q: 'What is a metaphor?', opts: ['Comparison with like/as', 'Direct comparison without like/as', 'Sound word', 'Exaggeration'], ans: 1 },
          { q: 'What is a theme in literature?', opts: ['Character name', 'Central idea/message', 'Plot point', 'Chapter title'], ans: 1 },
          { q: 'Who wrote "Wuthering Heights"?', opts: ['Jane Austen', 'Charlotte Brontë', 'Emily Brontë', 'Anne Brontë'], ans: 2 },
          { q: 'What is an epic?', opts: ['Short poem', 'Long narrative poem', 'Novel', 'Play'], ans: 1 },
          { q: 'What is characterization?', opts: ['Book description', 'Creating/developing characters', 'Plot summary', 'Setting description'], ans: 1 },
          { q: 'Who wrote "The Adventures of Huckleberry Finn"?', opts: ['Mark Twain', 'Ernest Hemingway', 'Charles Dickens', 'Jack London'], ans: 0 },
          { q: 'What is a soliloquy?', opts: ['Conversation', 'Character speaking thoughts aloud', 'Dialogue', 'Stage direction'], ans: 1 },
          { q: 'What is the climax of a story?', opts: ['Introduction', 'Point of highest tension', 'Resolution', 'Exposition'], ans: 1 },
          { q: 'Who wrote "One Hundred Years of Solitude"?', opts: ['Pablo Neruda', 'Gabriel García Márquez', 'Jorge Luis Borges', 'Isabel Allende'], ans: 1 },
          { q: 'What is an allegory?', opts: ['Short story', 'Story with hidden meaning', 'Biography', 'Autobiography'], ans: 1 },
          { q: 'What is a fable?', opts: ['True story', 'Short story with moral', 'Historical account', 'Scientific text'], ans: 1 },
          { q: 'Who wrote "The Lord of the Rings"?', opts: ['C.S. Lewis', 'J.R.R. Tolkien', 'J.K. Rowling', 'George R.R. Martin'], ans: 1 },
          { q: 'What is first-person narration?', opts: ['Multiple viewpoints', 'I/we perspective', 'Third person', 'Omniscient'], ans: 1 },
          { q: 'What is a stanza?', opts: ['Chapter in novel', 'Group of lines in poem', 'Paragraph', 'Scene in play'], ans: 1 },
          { q: 'Who wrote "Heart of Darkness"?', opts: ['Joseph Conrad', 'Virginia Woolf', 'James Joyce', 'D.H. Lawrence'], ans: 0 },
          { q: 'What is epilogue?', opts: ['Opening section', 'Concluding section', 'Main body', 'Preface'], ans: 1 },
          { q: 'What is a motif?', opts: ['Character type', 'Recurring element/theme', 'Plot twist', 'Setting'], ans: 1 },
          { q: 'Who wrote "The Scarlet Letter"?', opts: ['Nathaniel Hawthorne', 'Herman Melville', 'Edgar Allan Poe', 'Walt Whitman'], ans: 0 },
          { q: 'What is a biography?', opts: ['Self-written story', 'Story of someone\'s life by another', 'Fiction', 'Poem'], ans: 1 },
          { q: 'What is a plot twist?', opts: ['Expected ending', 'Unexpected development', 'Character death', 'Happy ending'], ans: 1 },
          { q: 'Who wrote "The Picture of Dorian Gray"?', opts: ['Oscar Wilde', 'Bram Stoker', 'Mary Shelley', 'Robert Louis Stevenson'], ans: 0 },
          { q: 'What is dialogue in literature?', opts: ['Description', 'Conversation between characters', 'Narration', 'Author note'], ans: 1 },
          { q: 'What is a simile?', opts: ['Direct comparison', 'Comparison using like/as', 'Metaphor', 'Symbol'], ans: 1 },
          { q: 'Who wrote "Brave New World"?', opts: ['George Orwell', 'Aldous Huxley', 'H.G. Wells', 'Jules Verne'], ans: 1 },
          { q: 'What is a drama?', opts: ['Novel', 'Play for performance', 'Poem', 'Essay'], ans: 1 },
          { q: 'What is tone in literature?', opts: ['Volume', 'Author\'s attitude', 'Character voice', 'Plot speed'], ans: 1 },
          { q: 'Who wrote "The Old Man and the Sea"?', opts: ['F. Scott Fitzgerald', 'Ernest Hemingway', 'William Faulkner', 'John Steinbeck'], ans: 1 },
          { q: 'What is a parable?', opts: ['Long poem', 'Short story with moral lesson', 'Historical text', 'Drama'], ans: 1 },
          { q: 'What is foreshadowing?', opts: ['Looking back', 'Hint of future events', 'Character introduction', 'Setting description'], ans: 1 },
          { q: 'Who wrote "The Waste Land"?', opts: ['W.B. Yeats', 'T.S. Eliot', 'Ezra Pound', 'Robert Frost'], ans: 1 },
          { q: 'What is the difference between prose and poetry?', opts: ['None', 'Prose has no line breaks, poetry does', 'Poetry is longer', 'Prose is fiction'], ans: 1 }
        ],
        History: [
          { q: 'What year did Nigeria gain independence?', opts: ['1957', '1960', '1963', '1965'], ans: 1 },
          { q: 'Who was the first President of Nigeria?', opts: ['Nnamdi Azikiwe', 'Abubakar Tafawa Balewa', 'Olusegun Obasanjo', 'Shehu Shagari'], ans: 0 },
          { q: 'What was the Berlin Conference about?', opts: ['World War I', 'Division of Africa', 'Trade agreement', 'Peace treaty'], ans: 1 },
          { q: 'Who discovered penicillin?', opts: ['Louis Pasteur', 'Alexander Fleming', 'Joseph Lister', 'Robert Koch'], ans: 1 },
          { q: 'What year did World War II end?', opts: ['1943', '1944', '1945', '1946'], ans: 2 },
          { q: 'Who was the first person to walk on the moon?', opts: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], ans: 1 },
          { q: 'What was the Cold War?', opts: ['Physical war', 'Tension between US and USSR', ['Trade war', 'Religious conflict'], ans: 1 },
          { q: 'Who was Martin Luther King Jr.?', opts: ['President', 'Civil rights leader', 'Inventor', 'Writer'], ans: 1 },
          { q: 'What is the oldest civilization?', opts: ['Greek', 'Roman', 'Mesopotamian', 'Egyptian'], ans: 2 },
          { q: 'What year did the French Revolution begin?', opts: ['1776', '1789', '1799', '1804'], ans: 1 },
          { q: 'Who was the first Emperor of Rome?', opts: ['Julius Caesar', 'Augustus', 'Nero', 'Marcus Aurelius'], ans: 1 },
          { q: 'What was the Industrial Revolution?', opts: ['Political change', 'Transition to manufacturing', 'Agricultural change', 'Social reform'], ans: 1 },
          { q: 'Who was Cleopatra?', opts: ['Greek goddess', 'Egyptian queen', 'Roman empress', 'Persian ruler'], ans: 1 },
          { q: 'What year did the Berlin Wall fall?', opts: ['1987', '1988', '1989', '1990'], ans: 2 },
          { q: 'Who was the first African American US President?', opts: ['Bill Clinton', 'George W. Bush', 'Barack Obama', 'Joe Biden'], ans: 2 },
          { q: 'What was the Renaissance?', opts: ['War period', 'Cultural rebirth in Europe', 'Religious movement', 'Economic depression'], ans: 1 },
          { q: 'Who is known as the Father of History?', opts: ['Socrates', 'Herodotus', 'Thucydides', 'Plato'], ans: 1 },
          { q: 'What year was the United Nations founded?', opts: ['1942', '1945', '1948', '1950'], ans: 1 },
          { q: 'What was the Magna Carta?', opts: ['War declaration', 'French treaty', 'English charter of rights', 'Roman law'], ans: 2 },
          { q: 'Who discovered America in 1492?', opts: ['Vasco da Gama', 'Ferdinand Magellan', 'Christopher Columbus', 'Amerigo Vespucci'], ans: 2 },
          { q: 'What was the Roman Empire?', opts: ['Greek city-state', 'Ancient Mediterranean empire', 'Egyptian dynasty', 'Persian kingdom'], ans: 1 },
          { q: 'Who was Socrates?', opts: ['Roman emperor', 'Greek philosopher', 'Egyptian pharaoh', 'Persian king'], ans: 1 },
          { q: 'What year did apartheid end in South Africa?', opts: ['1990', '1992', '1994', '1996'], ans: 2 },
          { q: 'What was the Silk Road?', opts: ['Roman road', 'Ancient trade route', 'Chinese wall', 'Indian railway'], ans: 1 },
          { q: 'Who was Mahatma Gandhi?', opts: ['Indian prime minister', 'Indian independence leader', 'British viceroy', 'Religious leader'], ans: 1 },
          { q: 'What was the Enlightenment?', opts: ['Scientific period', 'Intellectual/philosophical movement', 'Artistic period', 'Industrial period'], ans: 1 },
          { q: 'Who was the last Pharaoh of Egypt?', opts: ['Ramesses', 'Cleopatra VII', 'Hatshepsut', 'Nefertiti'], ans: 1 },
          { q: 'What year did World War I begin?', opts: ['1912', '1913', '1914', '1915'], ans: 2 },
          { q: 'What was the Black Death?', opts: ['War', 'Plague pandemic', 'Famine', 'Religious movement'], ans: 1 },
          { q: 'Who was Queen Victoria?', opts: ['French queen', 'British monarch', 'Spanish queen', 'Russian empress'], ans: 1 },
          { q: 'What was the Great Depression?', opts: ['Weather event', 'Global economic downturn', 'War', 'Disease outbreak'], ans: 1 },
          { q: 'Who wrote the Universal Declaration of Human Rights?', opts: ['US Congress', 'United Nations', 'European Union', 'African Union'], ans: 1 },
          { q: 'What year was the European Union formed?', opts: ['1990', '1991', '1993', '1995'], ans: 2 },
          { q: 'What was the Gold Coast?', opts: ['South African region', 'Pre-independence Ghana', 'Australian territory', 'Gold mining town'], ans: 1 },
          { q: 'Who was the first woman in space?', opts: ['Sally Ride', 'Valentina Tereshkova', 'Mae Jemison', 'Peggy Whitson'], ans: 1 },
          { q: 'What was the transatlantic slave trade?', opts: ['African-South America trade', 'Enslaved Africans to Americas', 'European goods trade', 'Silk trade'], ans: 1 },
          { q: 'Who built the Great Wall of China?', opts: ['Ming emperors', 'Various Chinese dynasties', 'Qin emperor', 'Han dynasty'], ans: 1 },
          { q: 'What was the Scramble for Africa?', opts: ['African war', 'European colonization of Africa', 'African independence', 'Trade agreement'], ans: 1 },
          { q: 'Who was Napoleon Bonaparte?', opts: ['British king', 'French emperor', 'Russian tsar', 'German chancellor'], ans: 1 },
          { q: 'What year did the American Civil War end?', opts: ['1863', '1864', '1865', '1866'], ans: 2 },
          { q: 'What was the Treaty of Versailles?', opts: ['WWI peace treaty', 'Trade agreement', 'Colonial treaty', 'Military alliance'], ans: 0 },
          { q: 'Who was the first Secretary-General of the UN?', opts: ['Dag Hammarskjöld', 'Trygve Lie', 'Kofi Annan', 'U Thant'], ans: 1 },
          { q: 'What was the Aztec Empire?', opts: ['South American empire', 'Mesoamerican empire', 'North American tribe', 'European kingdom'], ans: 1 },
          { q: 'Who discovered the sea route to India?', opts: ['Vasco da Gama', 'Columbus', 'Magellan', 'Cook'], ans: 0 },
          { q: 'What year did the Korean War begin?', opts: ['1948', '1950', '1952', '1954'], ans: 1 },
          { q: 'What was the League of Nations?', opts: ['Military alliance', 'Predecessor to UN', 'European union', 'Trade bloc'], ans: 1 },
          { q: 'Who was the last Emperor of China?', opts: ['Kangxi', 'Puyi', 'Qianlong', 'Hongwu'], ans: 1 },
          { q: 'What was the Cuban Missile Crisis?', opts: ['Nuclear war', 'US-Soviet confrontation', ['Trade dispute', 'Civil war'], ans: 1 },
          { q: 'Who founded the Mongol Empire?', opts: ['Kublai Khan', 'Genghis Khan', 'Attila', 'Tamerlane'], ans: 1 },
          { q: 'What was the Reformation?', opts: ['Catholic reform', 'Protestant religious movement', 'Monastic movement', 'Artistic movement'], ans: 1 }
        ],
        Arts: [
          { q: 'What primary colors make green?', opts: ['Red+Blue', 'Blue+Yellow', 'Red+Yellow', 'Black+White'], ans: 1 },
          { q: 'Who painted the Mona Lisa?', opts: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], ans: 1 },
          { q: 'What is a palette in painting?', opts: ['Type of paint', 'Surface for mixing colors', ['Brush type', 'Canvas type'], ans: 1 },
          { q: 'What is perspective in art?', opts: ['Color choice', '3D depth on 2D surface', 'Subject matter', 'Brush technique'], ans: 1 },
          { q: 'Who painted The Starry Night?', opts: ['Pablo Picasso', 'Vincent van Gogh', 'Claude Monet', 'Salvador Dali'], ans: 1 },
          { q: 'What is sculpture?', opts: ['2D drawing', '3D artwork', 'Painting', 'Print'], ans: 1 },
          { q: 'What is a self-portrait?', opts: ['Painting of landscape', 'Artist\'s own portrait', 'Group painting', 'Abstract art'], ans: 1 },
          { q: 'What is a fresco?', opts: ['Oil painting', 'Wall painting on wet plaster', 'Watercolor', 'Pastel'], ans: 1 },
          { q: 'Who painted the Sistine Chapel ceiling?', opts: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'], ans: 1 },
          { q: 'What is the color wheel?', opts: ['Color mixing tool', 'Artist\'s palette', 'Circle of colors', 'Brush set'], ans: 2 },
          { q: 'What is a still life?', opts: ['Living model painting', 'Inanimate objects painting', 'Landscape', 'Portrait'], ans: 1 },
          { q: 'What is abstract art?', opts: ['Realistic representation', 'Non-representational art', 'Portrait art', 'Nature art'], ans: 1 },
          { q: 'Who is known as the Father of Modern Art?', opts: ['Picasso', 'Cézanne', 'Monet', 'Van Gogh'], ans: 1 },
          { q: 'What is a canvas?', opts: ['Paint type', 'Surface for painting', ['Brush', 'Easel'], ans: 1 },
          { q: 'What is impressionism?', opts: ['Detailed realism', 'Capturing light/impression', 'Abstract forms', 'Geometric shapes'], ans: 1 },
          { q: 'What is a mosaic?', opts: ['Single material', 'Image from small pieces', 'Drawing', 'Print'], ans: 1 },
          { q: 'Who painted The Persistence of Memory?', opts: ['Picasso', 'Salvador Dali', 'Magritte', 'Monet'], ans: 1 },
          { q: 'What is chiaroscuro?', opts: ['Bright colors', 'Light and shadow contrast', 'Symmetry', 'Perspective'], ans: 1 },
          { q: 'What is a lithograph?', opts: ['Oil painting', 'Print from stone/metal', 'Drawing', 'Sculpture'], ans: 1 },
          { q: 'What is surrealism?', opts: ['Realistic art', 'Dream-like art', 'Geometric art', 'Nature art'], ans: 1 },
          { q: 'Who painted The Scream?', opts: ['Van Gogh', 'Edvard Munch', 'Picasso', 'Klimt'], ans: 1 },
          { q: 'What is a landscape in art?', opts: ['City view', 'Natural scenery painting', 'Portrait', ['Abstract'], ans: 1 },
          { q: 'What is a medium in art?', opts: ['Art size', 'Material used', ['Subject', 'Style'], ans: 1 },
          { q: 'What is cubism?', opts: ['Realistic portraits', 'Geometric fragmented forms', 'Impressionist style', 'Abstract expression'], ans: 1 },
          { q: 'Who co-founded Cubism?', opts: ['Van Gogh+Monet', 'Picasso+Braque', 'Dali+Magritte', 'Pollock+Warhol'], ans: 1 },
          { q: 'What is an easel?', opts: ['Paint type', 'Stand for canvas', 'Brush', 'Palette'], ans: 1 },
          { q: 'What is a gallery?', opts: ['Art store', 'Art exhibition space', 'Studio', 'Workshop'], ans: 1 },
          { q: 'What is a pigment?', opts: ['Canvas type', 'Coloring substance', 'Brush material', 'Frame type'], ans: 1 },
          { q: 'What is symmetry in art?', opts: ['Random arrangement', 'Balanced proportions', 'Color harmony', 'Light balance'], ans: 1 },
          { q: 'What is a primary color?', opts: ['Mixed color', 'Cannot be made by mixing', 'Pastel color', 'Dark color'], ans: 1 },
          { q: 'What is a secondary color?', opts: ['Pure color', 'Made by mixing two primaries', 'Black and white', 'Earth tone'], ans: 1 },
          { q: 'What is watercolor?', opts: ['Oil-based paint', 'Water-soluble paint', 'Acrylic paint', 'Pastel'], ans: 1 },
          { q: 'What is pop art?', opts: ['Traditional art', 'Art using popular culture', 'Religious art', 'Classical art'], ans: 1 },
          { q: 'Who is known for pop art?', opts: ['Picasso', 'Andy Warhol', 'Monet', 'Rembrandt'], ans: 1 },
          { q: 'What is a nude in art?', opts: ['Clothed figure', 'Unclothed human figure', 'Animal', 'Still life'], ans: 1 },
          { q: 'What is a museum?', opts: ['Art store', 'Institution displaying art', 'Studio', 'Gallery shop'], ans: 1 },
          { q: 'What is a masterpiece?', opts: ['Student work', 'Great work of art', ['Copy', 'Sketch'], ans: 1 },
          { q: 'What is a sketch?', opts: ['Finished painting', 'Rough drawing', 'Sculpture', 'Print'], ans: 1 },
          { q: 'What is an art movement?', opts: ['Physical movement', 'Style/trend in art period', 'Art class', 'Exhibition type'], ans: 1 },
          { q: 'What is Baroque art?', opts: ['Simple style', 'Ornate/dramatic style (1600-1750)', 'Minimalist style', 'Modern style'], ans: 1 },
          { q: 'What is a commission in art?', opts: ['Art sale', 'Request for custom artwork', 'Exhibition fee', 'Art competition'], ans: 1 },
          { q: 'What is a palette knife?', opts: ['Eating utensil', 'Tool for mixing/applying paint', ['Sculpture tool', 'Drawing tool'], ans: 1 },
          { q: 'What is an art critic?', opts: ['Artist', 'Person evaluating art', 'Collector', 'Curator'], ans: 1 },
          { q: 'What is aesthetics?', opts: ['Art technique', 'Philosophy of beauty', 'Color theory', 'Art history'], ans: 1 },
          { q: 'What is a triptych?', opts: ['Single panel', 'Three-panel artwork', 'Diptych', 'Polyptych'], ans: 1 },
          { q: 'What is a focal point in art?', opts: ['Camera lens', 'Main area of interest', 'Center of canvas', 'Light source'], ans: 1 },
          { q: 'What is texture in art?', opts: ['Color quality', 'Surface feel/appearance', 'Brush size', 'Paint thickness'], ans: 1 },
          { q: 'What is a collage?', opts: ['Painted artwork', 'Assemblage of materials', 'Drawing', 'Print'], ans: 1 },
          { q: 'What is an etching?', opts: ['Oil painting', 'Print from engraved plate', 'Drawing', 'Sculpture'], ans: 1 },
          { q: 'What is the Renaissance in art?', opts: ['Medieval art', 'Rebirth of classical art (14-17th c)', 'Modern art', 'Ancient art'], ans: 1 }
        ]
      }
    },
    'PG003': { // Commerce & Business: Mathematics, English, Business Studies, Economics
      subjects: ['Mathematics', 'English', 'Business Studies', 'Economics'],
      questions: {
        Mathematics: [], English: [],
        'Business Studies': [
          { q: 'What is a business?', opts: ['Charity', 'Organization for profit', 'Government agency', 'School'], ans: 1 },
          { q: 'What is a sole proprietorship?', opts: ['Multiple owners', 'Single owner business', 'Shareholders', 'Partners'], ans: 1 },
          { q: 'What is profit?', opts: ['Total income', 'Revenue minus costs', 'Total costs', 'Salary'], ans: 1 },
          { q: 'What is marketing?', opts: ['Production process', 'Promoting/selling products', 'Accounting', 'Human resources'], ans: 1 },
          { q: 'What is a partnership?', opts: ['Government business', 'Business with two+ owners', 'Single owner', 'Public company'], ans: 1 },
          { q: 'What is a balance sheet?', opts: ['Income record', 'Financial statement of assets/liabilities', 'Sales report', 'Cash flow'], ans: 1 },
          { q: 'What is supply?', opts: ['Product demand', 'Quantity available for sale', 'Price level', 'Production cost'], ans: 1 },
          { q: 'What is a corporation?', opts: ['Small business', 'Legal entity separate from owners', 'Partnership', 'Sole trader'], ans: 1 },
          { q: 'What is a shareholder?', opts: ['Customer', 'Owner of shares in company', 'Employee', 'Manager'], ans: 1 },
          { q: 'What is entrepreneurship?', opts: ['Working for government', 'Starting/running a business', 'Investing in stocks', 'Managing employees'], ans: 1 },
          { q: 'What is a business plan?', opts: ['Employee schedule', 'Document outlining business goals', 'Marketing ad', 'Financial report'], ans: 1 },
          { q: 'What is revenue?', opts: ['Total costs', 'Income from sales', 'Net profit', 'Expenses'], ans: 1 },
          { q: 'What is a company mission statement?', opts: ['Product description', 'Purpose and goals of company', 'Annual report', 'Marketing slogan'], ans: 1 },
          { q: 'What is inventory?', opts: ['Cash on hand', 'Goods held for sale', 'Equipment', 'Building'], ans: 1 },
          { q: 'What is a franchise?', opts: ['Independent business', 'Licensed business model', 'Government business', 'Cooperative'], ans: 1 },
          { q: 'What is a business model?', opts: ['Company structure', 'How business creates value/profit', 'Product design', 'Office layout'], ans: 1 },
          { q: 'What is a cash flow statement?', opts: ['Profit record', 'Money inflow/outflow record', 'Asset list', 'Tax return'], ans: 1 },
          { q: 'What is a stakeholder?', opts: ['Only shareholders', 'Anyone affected by business', 'Only employees', 'Only customers'], ans: 1 },
          { q: 'What is a cooperative?', opts: ['Government agency', 'Member-owned business', 'Private company', 'Multinational'], ans: 1 },
          { q: 'What is a business strategy?', opts: ['Employee policy', 'Long-term plan for success', 'Marketing campaign', 'Budget plan'], ans: 1 },
          { q: 'What is e-commerce?', opts: ['In-store shopping', 'Online buying/selling', 'Mail order', 'Telephone sales'], ans: 1 },
          { q: 'What is a monopoly?', opts: ['Multiple sellers', 'Single seller dominating market', 'Government control', 'Fair competition'], ans: 1 },
          { q: 'What is a tariff?', opts: ['Product price', 'Tax on imports/exports', 'Shipping cost', 'Insurance fee'], ans: 1 },
          { q: 'What is a business ethics?', opts: ['Profit maximization', 'Moral principles in business', 'Legal compliance', 'Marketing rules'], ans: 1 },
          { q: 'What is a startup?', opts: ['Established company', 'Newly created business', 'Large corporation', 'Government venture'], ans: 1 },
          { q: 'What is a dividend?', opts: ['Company expense', 'Profit share to shareholders', 'Employee bonus', 'Tax payment'], ans: 1 },
          { q: 'What is a competitive advantage?', opts: ['Market share', 'Edge over competitors', 'Profit margin', 'Revenue'], ans: 1 },
          { q: 'What is a merger?', opts: ['Company closure', 'Combining two companies', 'Company split', 'New company'], ans: 1 },
          { q: 'What is a trademark?', opts: ['Company name', 'Protected brand identifier', 'Product', 'Service'], ans: 1 },
          { q: 'What is outsourcing?', opts: ['In-house production', 'Contracting external services', 'Hiring employees', 'Training staff'], ans: 1 },
          { q: 'What is a business cycle?', opts: ['Production cycle', 'Economic expansion/contraction pattern', 'Sales cycle', 'Accounting period'], ans: 1 },
          { q: 'What is a liability?', opts: ['Company asset', 'Company debt/obligation', 'Company revenue', 'Company profit'], ans: 1 },
          { q: 'What is an asset?', opts: ['Company debt', 'Resource owned by company', 'Company expense', 'Tax payment'], ans: 1 },
          { q: 'What is a budget?', opts: ['Profit target', 'Financial plan for period', 'Sales target', 'Production goal'], ans: 1 },
          { q: 'What is a market?', opts: ['Physical store only', 'Where buyers/sellers interact', 'Online platform', 'Shopping mall'], ans: 1 },
          { q: 'What is a product?', opts: ['Service only', 'Good or service offered for sale', 'Manufacturing process', 'Packaging'], ans: 1 },
          { q: 'What is a service business?', opts: ['Sells physical goods', 'Provides intangible services', 'Manufacturing', 'Agriculture'], ans: 1 },
          { q: 'What is a wholesale?', opts: ['Selling to consumers', 'Selling in bulk to retailers', 'Retail sales', 'Online selling'], ans: 1 },
          { q: 'What is retail?', opts: ['Bulk selling', 'Selling directly to consumers', ['Manufacturing', 'Distribution'], ans: 1 },
          { q: 'What is quality control?', opts: ['Price setting', 'Ensuring product standards', 'Marketing', 'Distribution'], ans: 1 },
          { q: 'What is a business license?', opts: ['Product patent', 'Legal permission to operate', 'Tax ID', 'Insurance'], ans: 1 },
          { q: 'What is branding?', opts: ['Product creation', 'Creating unique identity for product', 'Logo design only', 'Advertising'], ans: 1 },
          { q: 'What is customer service?', opts: ['Product development', 'Support to customers before/after sale', 'Sales process', 'Delivery'], ans: 1 },
          { q: 'What is a supply chain?', opts: ['Customer network', 'Production to delivery process', 'Retail network', 'Marketing channels'], ans: 1 },
          { q: 'What is a business analyst?', opts: ['Accountant', 'Analyzes business needs/solutions', 'Salesperson', 'Manager'], ans: 1 },
          { q: 'What is a joint venture?', opts: ['Company merger', 'Two companies partnering on project', 'Acquisition', 'Partnership dissolution'], ans: 1 },
          { q: 'What is a business incubator?', opts: ['Company nursery', 'Supports early-stage startups', 'Office space rental', 'Investment firm'], ans: 1 },
          { q: 'What is a value chain?', opts: ['Product price', 'Activities creating product value', 'Supply chain', 'Distribution network'], ans: 1 },
          { q: 'What is a feasibility study?', opts: ['Market research', 'Assessment of project viability', 'Financial audit', 'Employee evaluation'], ans: 1 },
          { q: 'What is the role of management?', opts: ['Production only', 'Planning/organizing/leading/controlling', 'Sales only', 'Accounting only'], ans: 1 }
        ],
        Economics: [
          { q: 'What is economics?', opts: ['Money management', 'Study of resource allocation', 'Business studies', 'Accounting'], ans: 1 },
          { q: 'What is scarcity?', opts: ['Abundant resources', 'Limited resources vs unlimited wants', 'Resource surplus', 'Equal distribution'], ans: 1 },
          { q: 'What is demand?', opts: ['Supply level', 'Consumer willingness to buy', 'Production capacity', 'Price level'], ans: 1 },
          { q: 'What is inflation?', opts: ['Price decrease', 'General price increase', 'Stable prices', 'Price fluctuation'], ans: 1 },
          { q: 'What is GDP?', opts: ['Net profit', 'Gross Domestic Product', 'Total tax', 'Government debt'], ans: 1 },
          { q: 'What is opportunity cost?', opts: ['Production cost', 'Value of next best alternative forgone', 'Total cost', 'Marginal cost'], ans: 1 },
          { q: 'What is a market economy?', opts: ['Government controlled', 'Decentralized decisions by consumers/producers', 'Planned economy', 'Traditional economy'], ans: 1 },
          { q: 'What is unemployment?', opts: ['Full employment', 'People without jobs seeking work', 'Retirement', 'Underemployment'], ans: 1 },
          { q: 'What is a tax?', opts: ['Voluntary payment', 'Compulsory payment to government', ['Donation', 'Fine'], ans: 1 },
          { q: 'What is a bank?', opts: ['Government agency', 'Financial institution accepting deposits', 'Investment fund', 'Insurance company'], ans: 1 },
          { q: 'What is interest rate?', opts: ['Tax rate', 'Cost of borrowing money', 'Exchange rate', 'Inflation rate'], ans: 1 },
          { q: 'What is a recession?', opts: ['Economic growth', 'Economic decline for two+ quarters', 'Stable economy', 'Inflation period'], ans: 1 },
          { q: 'What is international trade?', opts: ['Domestic trade', 'Exchange across national borders', 'Local market', 'Online trading'], ans: 1 },
          { q: 'What is microeconomics?', opts: ['Whole economy', 'Individual markets/consumers', 'Government policy', 'Global trade'], ans: 1 },
          { q: 'What is macroeconomics?', opts: ['Individual firms', 'Economy as a whole', 'Consumer behavior', 'Market structure'], ans: 1 },
          { q: 'What is a central bank?', opts: ['Commercial bank', 'Nation\'s monetary authority', ['Investment bank', 'Savings bank'], ans: 1 },
          { q: 'What is fiscal policy?', opts: ['Money supply control', 'Government spending/taxation policy', 'Trade policy', 'Labor policy'], ans: 1 },
          { q: 'What is monetary policy?', opts: ['Government spending', 'Central bank controlling money supply', 'Tax policy', 'Trade regulation'], ans: 1 },
          { q: 'What is the law of supply?', opts: ['Price up, supply down', 'Price up, supply up', 'No relation', 'Price equals supply'], ans: 1 },
          { q: 'What is equilibrium price?', opts: ['Highest price', 'Supply equals demand price', 'Minimum price', 'Government price'], ans: 1 },
          { q: 'What is a subsidy?', opts: ['Tax increase', 'Government financial support', 'Price control', 'Trade barrier'], ans: 1 },
          { q: 'What is globalization?', opts: ['Local trade', 'Increasing global interconnectedness', 'Regional trade', 'Nationalism'], ans: 1 },
          { q: 'What is a stock market?', opts: ['Grocery market', 'Market for buying/selling shares', 'Bond market', 'Commodity market'], ans: 1 },
          { q: 'What is a bond?', opts: ['Stock certificate', 'Debt investment', 'Insurance policy', 'Bank account'], ans: 1 },
          { q: 'What is a trade deficit?', opts: ['Exports > imports', 'Imports > exports', 'Balanced trade', 'No trade'], ans: 1 },
          { q: 'What is a progressive tax?', opts: ['Same rate all', 'Higher rate for higher income', 'Lower rate for higher income', 'No tax'], ans: 1 },
          { q: 'What is a mixed economy?', opts: ['Only government', 'Government + market elements', 'Only market', ['Traditional'], ans: 1 },
          { q: 'What is productivity?', opts: ['Total output', 'Output per unit of input', ['Profit', 'Revenue'], ans: 1 },
          { q: 'What is capital?', opts: ['Money only', 'Goods used for production', 'Labor force', 'Land'], ans: 1 },
          { q: 'What is labor?', opts: ['Management', 'Human effort in production', 'Machinery', 'Natural resources'], ans: 1 },
          { q: 'What is a monopoly?', opts: ['Competition', 'Single seller, no substitutes', 'Many sellers', 'Oligopoly'], ans: 1 },
          { q: 'What is an oligopoly?', opts: ['Single seller', 'Few large sellers dominate', 'Many small sellers', 'Government seller'], ans: 1 },
          { q: 'What is perfect competition?', opts: ['One seller', 'Many small firms, identical products', 'Few firms', 'Government control'], ans: 1 },
          { q: 'What is a public good?', opts: ['Private good', 'Non-excludable, non-rivalrous good', 'Luxury good', 'Consumer good'], ans: 1 },
          { q: 'What is externalities?', opts: ['Production costs', 'Spillover effects on third parties', 'Internal costs', 'Profit margins'], ans: 1 },
          { q: 'What is a budget deficit?', opts: ['Revenue > spending', 'Spending > revenue', 'Balanced budget', 'Surplus'], ans: 1 },
          { q: 'What is national debt?', opts: ['Personal loan', 'Total government borrowing', 'Corporate debt', 'Foreign debt'], ans: 1 },
          { q: 'What is a tariff?', opts: ['Subsidy', 'Tax on imported goods', 'Export tax', 'Sales tax'], ans: 1 },
          { q: 'What is comparative advantage?', opts: ['Absolute efficiency', 'Lower opportunity cost in production', 'Higher output', 'More resources'], ans: 1 },
          { q: 'What is a business cycle?', opts: ['Annual cycle', 'Economic expansion/contraction pattern', ['Fiscal year', 'Production cycle'], ans: 1 },
          { q: 'What is stagflation?', opts: ['Growth + low inflation', 'Stagnation + high inflation', 'Recession + deflation', 'Boom'], ans: 1 },
          { q: 'What is a laissez-faire economy?', opts: ['Government-controlled', 'Minimal government intervention', 'Mixed economy', 'Planned economy'], ans: 1 },
          { q: 'What is a commodity?', opts: ['Manufactured good', 'Raw material/primary product', 'Service', 'Technology'], ans: 1 },
          { q: 'What is elasticity of demand?', opts: ['Demand quantity', 'Responsiveness to price changes', 'Supply response', 'Market size'], ans: 1 },
          { q: 'What is a utility in economics?', opts: ['Public service', 'Satisfaction from consumption', 'Useful product', 'Efficiency'], ans: 1 },
          { q: 'What is a marginal cost?', opts: ['Total cost', 'Cost of producing one more unit', 'Average cost', 'Fixed cost'], ans: 1 },
          { q: 'What is a price ceiling?', opts: ['Minimum price', 'Maximum legal price', 'Equilibrium price', 'Market price'], ans: 1 },
          { q: 'What is a price floor?', opts: ['Maximum price', 'Minimum legal price', 'Equilibrium', 'Discounted price'], ans: 1 },
          { q: 'What is the Consumer Price Index (CPI)?', opts: ['Production index', 'Measure of price level changes', 'Employment index', 'Trade index'], ans: 1 },
          { q: 'What is sustainable development?', opts: ['Economic growth', 'Development meeting present without compromising future', 'Industrial growth', 'Globalization'], ans: 1 }
        ]
      }
    },
    'PG004': { // STEM Accelerated: Advanced Mathematics, Physics, Chemistry, Computer Science
      subjects: ['Advanced Mathematics', 'Physics', 'Chemistry', 'Computer Science'],
      questions: {
        'Advanced Mathematics': [
          { q: 'What is the derivative of x²?', opts: ['x', '2x', 'x²', '2'], ans: 1 },
          { q: 'What is ∫ x dx?', opts: ['x² + C', '½x² + C', 'x²/2 + C', 'x + C'], ans: 1 },
          { q: 'What is the limit of 1/x as x→∞?', opts: ['∞', '1', '0', '-∞'], ans: 2 },
          { q: 'What is a matrix?', opts: ['Number line', 'Rectangular array of numbers', 'Equation', 'Function'], ans: 1 },
          { q: 'What is a logarithm?', opts: ['Multiplication', 'Inverse of exponentiation', 'Addition', 'Division'], ans: 1 },
          { q: 'What is a vector?', opts: ['Scalar', 'Quantity with magnitude and direction', 'Number', 'Function'], ans: 1 },
          { q: 'What is a complex number?', opts: ['Real number', 'a + bi form', 'Integer', 'Prime'], ans: 1 },
          { q: 'What is a factorial of 0?', opts: ['0', '1', 'Undefined', '∞'], ans: 1 },
          { q: 'What is probability?', opts: ['0 to ∞', '0 to 1', '-1 to 1', '0 to 100'], ans: 1 },
          { q: 'What is a prime number?', opts: ['Divisible by many numbers', 'Only divisible by 1 and itself', 'Even number', 'Odd number'], ans: 1 },
          { q: 'What is the determinant of [[1,0],[0,1]]?', opts: ['0', '1', '-1', '2'], ans: 1 },
          { q: 'What is an eigenvalue?', opts: ['Matrix value', 'Scalar λ satisfying Ax=λx', 'Vector norm', 'Matrix determinant'], ans: 1 },
          { q: 'What is a function?', opts: ['Object', 'Relation mapping input to exactly one output', 'Set', 'Array'], ans: 1 },
          { q: 'What is a sequence?', opts: ['Random numbers', 'Ordered list of elements', 'Function set', 'Data type'], ans: 1 },
          { q: 'What is the sum of first n natural numbers?', opts: ['n(n+1)/2', 'n²', 'n(n-1)/2', 'n'], ans: 0 },
          { q: 'What is a permutation?', opts: ['Selection order matters', 'Arrangement order matters', 'Combination', 'Selection'], ans: 1 },
          { q: 'What is a combination?', opts: ['Selection order matters', 'Selection order doesn\'t matter', 'Arrangement', 'Sequence'], ans: 1 },
          { q: 'What is the binomial theorem?', opts: ['Matrix theorem', 'Expands (a+b)^n', 'Calculus theorem', 'Probability theorem'], ans: 1 },
          { q: 'What is a set?', opts: ['Collection of distinct elements', 'Sequence', 'Function', 'Array'], ans: 0 },
          { q: 'What is a subset?', opts: ['Parent set', 'Set within another set', 'Union', 'Intersection'], ans: 1 },
          { q: 'What is a hypothesis test?', opts: ['Survey method', 'Statistical decision method', 'Data collection', 'Sampling'], ans: 1 },
          { q: 'What is regression analysis?', opts: ['Data sorting', 'Modeling variable relationships', 'Data validation', 'Random sampling'], ans: 1 },
          { q: 'What is a limit?', opts: ['Function maximum', 'Value function approaches', 'Function minimum', 'Derivative'], ans: 1 },
          { q: 'What is continuity?', opts: ['Function jumps', 'Function without breaks', 'Function stops', 'Discrete function'], ans: 1 },
          { q: 'What is a differential equation?', opts: ['Equation without variables', 'Equation involving derivatives', 'Algebraic equation', 'Polynomial equation'], ans: 1 },
          { q: 'What is an integral?', opts: ['Derivative reverse', 'Area under curve', 'Slope', 'Limit'], ans: 1 },
          { q: 'What is a power series?', opts: ['Infinite sum of powers', 'Matrix series', 'Function series', 'Number sequence'], ans: 0 },
          { q: 'What is a gradient?', opts: ['Scalar', 'Vector of partial derivatives', 'Matrix', 'Function'], ans: 1 },
          { q: 'What is a double integral?', opts: ['1D integration', '2D integration over area', 'Triple integral', 'Line integral'], ans: 1 },
          { q: 'What is the chain rule?', opts: ['Product differentiation rule', 'Derivative of composite function', 'Integration rule', 'Quotient rule'], ans: 1 },
          { q: 'What is a rational number?', opts: ['Whole number', 'Quotient of integers', 'Irrational', 'Prime'], ans: 1 },
          { q: 'What is an irrational number?', opts: ['Cannot be expressed as fraction', 'Repeating decimal', 'Integer', 'Rational'], ans: 0 },
          { q: 'What is a real number?', opts: ['Only integers', 'All rational and irrational numbers', 'Only fractions', 'Complex'], ans: 1 },
          { q: 'What is a modulus?', opts: ['Absolute value', 'Relative value', 'Square root', 'Power'], ans: 0 },
          { q: 'What is mathematical induction?', opts: ['Pattern observation', 'Proof technique for all n', 'Deduction', 'Experiment'], ans: 1 },
          { q: 'What is a group in algebra?', opts: ['Collection of sets', 'Set with binary operation satisfying axioms', 'Vector space', 'Ring'], ans: 1 },
          { q: 'What is the Pythagoras theorem?', opts: ['a²+b²=c²', 'a+b=c', 'a²=b²+c²', 'a=b=c'], ans: 0 },
          { q: 'What is the quadratic formula?', opts: ['x=(-b±√(b²-4ac))/2a', 'x=(-b±√(b²+4ac))/2a', 'x=(b±√(b²-4ac))/a', 'x=(-b±√(4ac))/2a'], ans: 0 },
          { q: 'What is a scatter plot?', opts: ['Bar chart', 'Graph of paired data points', 'Line graph', 'Histogram'], ans: 1 },
          { q: 'What is standard deviation?', opts: ['Mean', 'Measure of data spread', 'Median', 'Mode'], ans: 1 },
          { q: 'What is correlation?', opts: ['No relation', 'Statistical relationship between variables', 'Causation', 'Randomness'], ans: 1 },
          { q: 'What is Bayes\' theorem?', opts: ['Conditional probability', 'Simple probability', 'Random event', 'Independent event'], ans: 0 },
          { q: 'What is a tangent?', opts: ['Line that intersects', 'Line touching curve at one point', 'Secant line', 'Chord'], ans: 1 },
          { q: 'What is an asymptote?', opts: ['Curve maximum', 'Line curve approaches', 'Point of inflection', 'Critical point'], ans: 1 },
          { q: 'What is a parametric equation?', opts: ['Equation with parameters', 'Equation with independent variable', 'Direct relation', 'Implicit equation'], ans: 0 },
          { q: 'What is a polar coordinate?', opts: ['Cartesian grid', 'Coordinate by distance and angle', '3D coordinate', 'Linear coordinate'], ans: 1 },
          { q: 'What is a Fourier series?', opts: ['Sum of sines/cosines', 'Taylor series', 'Power series', 'Laurent series'], ans: 0 },
          { q: 'What is a Laplacian?', opts: ['First derivative', 'Second derivative sum', 'Gradient', 'Divergence'], ans: 1 },
          { q: 'What is a tensor?', opts: ['Matrix', 'Multi-dimensional array generalization', 'Vector', 'Scalar'], ans: 1 },
          { q: 'What is the mean value theorem?', opts: ['Average derivative equals slope of secant', 'Function minimum', 'Integral average', 'Limit existance'], ans: 0 }
        ],
        Physics: [
          { q: 'What is Newton\'s First Law?', opts: ['F=ma', 'Object stays in motion unless acted upon', 'Equal/opposite reaction', 'Energy conservation'], ans: 1 },
          { q: 'What is the speed of light in vacuum?', opts: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁵ m/s'], ans: 1 },
          { q: 'What is kinetic energy?', opts: ['Stored energy', 'Energy of motion', 'Heat energy', 'Chemical energy'], ans: 1 },
          { q: 'What is potential energy?', opts: ['Energy in motion', 'Stored energy by position', 'Nuclear energy', 'Electrical'], ans: 1 },
          { q: 'What is the unit of force?', opts: ['Joule', 'Newton', 'Watt', 'Pascal'], ans: 1 },
          { q: 'What is frequency?', opts: ['Period', 'Cycles per second', 'Wavelength', 'Amplitude'], ans: 1 },
          { q: 'What is resistance?', opts: ['Voltage', 'Opposition to current', 'Current', 'Power'], ans: 1 },
          { q: 'What is Ohm\'s Law?', opts: ['V=IR', 'P=VI', 'I=V/R', 'V=I/R'], ans: 0 },
          { q: 'What is wavelength?', opts: ['Wave speed', 'Distance between wave crests', 'Wave amplitude', 'Wave period'], ans: 1 },
          { q: 'What is gravity?', opts: ['Electromagnetic force', 'Attractive force between masses', 'Strong force', 'Weak force'], ans: 1 },
          { q: 'What is a photon?', opts: ['Electron particle', 'Light particle/quantum', 'Proton', 'Neutron'], ans: 1 },
          { q: 'What is Einstein\'s E=mc²?', opts: ['Kinetic equation', 'Energy-mass equivalence', 'Gravity equation', 'Quantum equation'], ans: 1 },
          { q: 'What is absolute zero?', opts: ['0°C', '-273.15°C', '0°F', '100K'], ans: 1 },
          { q: 'What is a vector?', opts: ['Scalar quantity', 'Magnitude + direction', 'Number', 'Speed'], ans: 1 },
          { q: 'What is velocity?', opts: ['Speed', 'Speed with direction', 'Acceleration', 'Displacement'], ans: 1 },
          { q: 'What is conservation of energy?', opts: ['Energy created', 'Energy cannot be created/destroyed', 'Energy destroyed', 'Energy constant'], ans: 1 },
          { q: 'What is a wave?', opts: ['Particle motion', 'Energy transfer without mass transfer', 'Matter transfer', 'Stationary pattern'], ans: 1 },
          { q: 'What is voltage?', opts: ['Current', 'Electrical potential difference', 'Resistance', 'Power'], ans: 1 },
          { q: 'What is an electromagnetic wave?', opts: ['Sound wave', 'Oscillating electric/magnetic fields', 'Water wave', 'Seismic wave'], ans: 1 },
          { q: 'What is momentum?', opts: ['Mass×velocity', 'Mass×acceleration', 'Force×time', 'Energy'], ans: 0 },
          { q: 'What is the photoelectric effect?', opts: ['Heat emission', 'Electron emission from light', 'Light emission', 'X-ray generation'], ans: 1 },
          { q: 'What is a magnetic field?', opts: ['Electric field', 'Force field from magnets/current', 'Gravitational field', 'Nuclear field'], ans: 1 },
          { q: 'What is thermodynamics?', opts: ['Heat mechanics', 'Study of heat and temperature', 'Quantum mechanics', 'Fluid dynamics'], ans: 1 },
          { q: 'What is entropy?', opts: ['Energy increase', 'Measure of disorder', 'Temperature', 'Heat flow'], ans: 1 },
          { q: 'What is a capacitor?', opts: ['Resistor', 'Stores electrical energy', 'Inductor', 'Battery'], ans: 1 },
          { q: 'What is diffraction?', opts: ['Wave absorption', 'Wave bending around obstacles', 'Wave reflection', 'Wave refraction'], ans: 1 },
          { q: 'What is refraction?', opts: ['Wave direction change between media', 'Wave reflection', 'Wave absorption', 'Wave diffraction'], ans: 0 },
          { q: 'What is the Doppler effect?', opts: ['Frequency change due to motion', 'Pitch change with volume', 'Sound amplification', 'Wave speed change'], ans: 0 },
          { q: 'What is a transistor?', opts: ['Resistor', 'Semiconductor switch/amplifier', 'Capacitor', 'Diode'], ans: 1 },
          { q: 'What is nuclear fusion?', opts: ['Atom splitting', 'Nuclei combining, releasing energy', 'Electron capture', 'Radioactive decay'], ans: 1 },
          { q: 'What is nuclear fission?', opts: ['Nuclei combining', 'Atom splitting into smaller nuclei', 'Fusion', 'Decay'], ans: 1 },
          { q: 'What is a quantum?', opts: ['Large unit', 'Smallest discrete unit of energy', 'Continuous wave', 'Particle'], ans: 1 },
          { q: 'What is the Heisenberg uncertainty principle?', opts: ['Exact measurement possible', 'Cannot know position/momentum precisely', 'Energy-time certainty', 'Wave-particle duality'], ans: 1 },
          { q: 'What is mass?', opts: ['Weight', 'Amount of matter in object', 'Volume', 'Density'], ans: 1 },
          { q: 'What is density?', opts: ['Mass is volume', 'Mass per unit volume', 'Volume per mass', 'Weight'], ans: 1 },
          { q: 'What is pressure?', opts: ['Force per area', 'Area per force', 'Volume', 'Mass per area'], ans: 0 },
          { q: 'What is buoyancy?', opts: ['Weight in water', 'Upward force on submerged object', 'Downward force', 'Lateral force'], ans: 1 },
          { q: 'What is work in physics?', opts: ['Effort', 'Force×distance', 'Power×time', 'Energy×time'], ans: 1 },
          { q: 'What is power?', opts: ['Work per time', 'Force per distance', 'Energy per mass', 'Speed'], ans: 0 },
          { q: 'What is the law of reflection?', opts: ['Angle of incidence equals reflection', 'Light bends', 'Light absorbed', 'Light scattered'], ans: 0 },
          { q: 'What is a lens?', opts: ['Mirror', 'Transparent material focusing light', 'Prism', 'Filter'], ans: 1 },
          { q: 'What is a spectrometer?', opts: ['Measures time', 'Measures light spectrum', 'Measures distance', 'Measures mass'], ans: 1 },
          { q: 'What is a quark?', opts: ['Atom particle', 'Fundamental particle of matter', 'Molecule', 'Electron'], ans: 1 },
          { q: 'What is dark matter?', opts: ['Visible matter', 'Invisible matter with gravitational effects', ['Antimatter', 'Regular matter'], ans: 1 },
          { q: 'What is a black hole?', opts: ['Empty space', 'Region with extreme gravity, light cannot escape', 'Dark star', 'Nebula'], ans: 1 },
          { q: 'What is relativity?', opts: ['Absolute motion', 'Physics same in all inertial frames', 'Constant speed principle', 'Energy conservation'], ans: 1 },
          { q: 'What is a superconductor?', opts: ['Good conductor', 'Zero electrical resistance below critical temperature', 'Insulator', 'Semiconductor'], ans: 1 },
          { q: 'What is a semiconductor?', opts: ['Good conductor', 'Conductivity between conductor and insulator', 'Insulator', 'Superconductor'], ans: 1 },
          { q: 'What is wave-particle duality?', opts: ['Either wave or particle', 'Light/elementary particles exhibit both', 'Only wave', 'Only particle'], ans: 1 },
          { q: 'What is the Standard Model?', opts: ['Classical theory', 'Theory of fundamental particles/forces', 'Quantum gravity', 'String theory'], ans: 1 }
        ],
        Chemistry: [
          { q: 'What is an element?', opts: ['Combined atoms', 'Pure substance of one atom type', 'Mixture', 'Compound'], ans: 1 },
          { q: 'What is a compound?', opts: ['Element mixture', 'Substance with bonded different elements', 'Single element', 'Alloy'], ans: 1 },
          { q: 'What is a covalent bond?', opts: ['Electron transfer', 'Electron sharing between atoms', 'Ionic attraction', 'Metallic bond'], ans: 1 },
          { q: 'What is an ionic bond?', opts: ['Electron sharing', 'Electron transfer, electrostatic attraction', 'Covalent bond', 'Hydrogen bond'], ans: 1 },
          { q: 'What is a mole?', opts: ['Mass number', '6.022×10²³ particles', 'Volume unit', 'Atomic number'], ans: 1 },
          { q: 'What is the periodic table?', opts: ['Element weights', 'Organized elements by atomic number', 'Reaction table', 'Compound list'], ans: 1 },
          { q: 'What is a redox reaction?', opts: ['No change', 'Simultaneous reduction and oxidation', 'Precipitation', 'Neutralization'], ans: 1 },
          { q: 'What is an acid?', opts: ['pH>7', 'Donates H⁺ ions', 'Accepts H⁺', 'Neutral'], ans: 1 },
          { q: 'What is a base?', opts: ['Donates H⁺', 'Accepts H⁺ / donates OH⁻', 'pH<7', 'Salts'], ans: 1 },
          { q: 'What is neutralization?', opts: ['Acid+base reaction producing salt+water', 'Acid+acid', 'Base+base', 'Salt+water'], ans: 0 },
          { q: 'What is an isomer?', opts: ['Same element', 'Same formula, different structure', 'Same structure', 'Different formula'], ans: 1 },
          { q: 'What is a polymer?', opts: ['Small molecule', 'Large molecule of repeating units', 'Single atom', 'Gas molecule'], ans: 1 },
          { q: 'What is a catalyst?', opts: ['Stops reaction', 'Speeds reaction without being consumed', 'Slows reaction', 'Changes products'], ans: 1 },
          { q: 'What is a pH scale?', opts: ['0-7 scale', '0-14 acidity/basicity scale', '1-10 scale', '0-100 scale'], ans: 1 },
          { q: 'What is the atomic number?', opts: ['Neutron count', 'Proton count in nucleus', 'Electron count', 'Mass number'], ans: 1 },
          { q: 'What is a valence electron?', opts: ['Inner electron', 'Outermost shell electron', 'Core electron', 'Free electron'], ans: 1 },
          { q: 'What is electronegativity?', opts: ['Atom size', 'Atom\'s attraction for bonding electrons', 'Ionization energy', 'Atomic mass'], ans: 1 },
          { q: 'What is an orbital?', opts: ['Electron path', 'Region with high electron probability', 'Nucleus', 'Energy level'], ans: 1 },
          { q: 'What is a bond energy?', opts: ['Breaking energy', 'Energy to break a chemical bond', 'Formation energy', 'Activation energy'], ans: 1 },
          { q: 'What is enthalpy?', opts: ['Temperature', 'Heat content of system', 'Pressure', 'Volume'], ans: 1 },
          { q: 'What is activation energy?', opts: ['Required heat', 'Minimum energy for reaction', 'Released energy', 'Bond energy'], ans: 1 },
          { q: 'What is an exothermic reaction?', opts: ['Absorbs heat', 'Releases heat', 'Requires catalyst', 'No heat change'], ans: 1 },
          { q: 'What is an endothermic reaction?', opts: ['Releases heat', 'Absorbs heat', 'Fast reaction', 'Spontaneous'], ans: 1 },
          { q: 'What is a salt?', opts: ['NaCl only', 'Ionic compound from acid+base', 'Base', 'Acid'], ans: 1 },
          { q: 'What is an electrolyte?', opts: ['Non-conductor', 'Substance conducting electricity when dissolved', 'Insulator', 'Metal'], ans: 1 },
          { q: 'What is a precipitate?', opts: ['Dissolved solid', 'Insoluble solid from reaction', 'Gas', 'Liquid'], ans: 1 },
          { q: 'What is chromatography?', opts: ['Heat measurement', 'Separation technique based on affinity', 'Weight analysis', 'Volume measurement'], ans: 1 },
          { q: 'What is distillation?', opts: ['Filtration', 'Separation by boiling points', 'Crystallization', 'Extraction'], ans: 1 },
          { q: 'What is a functional group?', opts: ['Carbon skeleton', 'Atom group giving characteristic properties', 'Side chain', 'Branch'], ans: 1 },
          { q: 'What is an alcohol?', opts: ['C=O group', 'OH functional group', 'COOH group', 'NH₂ group'], ans: 1 },
          { q: 'What is an alkane?', opts: ['C=C bonds', 'Single C-C bonds, saturated', 'Triple bonds', 'Aromatic'], ans: 1 },
          { q: 'What is an alkene?', opts: ['Single bonds', 'C=C double bond, unsaturated', 'Triple bonds', 'Benzene ring'], ans: 1 },
          { q: 'What is a hydrocarbon?', opts: ['C and O only', 'Carbon and hydrogen compound', 'C and N', 'H and O'], ans: 1 },
          { q: 'What is the ideal gas equation?', opts: ['PV=nRT', 'PV=nR/T', 'P/V=nRT', 'PVT=nR'], ans: 0 },
          { q: 'What is Boyle\'s Law?', opts: ['PV=constant at constant T', 'V/T=constant', 'P/T=constant', 'PV=nRT'], ans: 0 },
          { q: 'What is Avogadro\'s number?', opts: ['6.022×10²³', '3.14', '1.602×10⁻¹⁹', '9.8'], ans: 0 },
          { q: 'What is a base metal?', opts: ['Gold', 'Metal that oxidizes easily', 'Platinum', 'Silver'], ans: 1 },
          { q: 'What is an ore?', opts: ['Pure metal', 'Rock with extractable metal', 'Gemstone', 'Alloy'], ans: 1 },
          { q: 'What is an alloy?', opts: ['Pure element', 'Mixture of metals', 'Compound', 'Mineral'], ans: 1 },
          { q: 'What is corrosion?', opts: ['Metal purification', 'Metal degradation by reaction', 'Metal formation', 'Metal coating'], ans: 1 },
          { q: 'What is a buffer solution?', opts: ['Neutral solution', 'Resists pH changes', 'Acidic solution', 'Basic solution'], ans: 1 },
          { q: 'What is a half-life?', opts: ['Full decay time', 'Time for half to decay', 'Double time', 'Zero time'], ans: 1 },
          { q: 'What is radioactive decay?', opts: ['Chemical reaction', 'Spontaneous nucleus breakdown', 'Electron change', 'Molecular change'], ans: 1 },
          { q: 'What is an alpha particle?', opts: ['Electron', 'Helium nucleus (2p,2n)', 'Proton', 'Neutron'], ans: 1 },
          { q: 'What is a beta particle?', opts: ['Helium nucleus', 'High-energy electron from nucleus', 'Proton', 'Photon'], ans: 1 },
          { q: 'What is a sigma bond?', opts: ['Side-by-side overlap', 'End-to-end orbital overlap', 'Pi bond', 'Ionic bond'], ans: 1 },
          { q: 'What is a pi bond?', opts: ['End-to-end overlap', 'Side-by-side orbital overlap', 'Sigma bond', 'Covalent bond'], ans: 1 },
          { q: 'What is hybridization?', opts: ['Isotope mixing', 'Orbital mixing for bonding', 'Element mixing', 'Isomer formation'], ans: 1 },
          { q: 'What is Le Chatelier\'s principle?', opts: ['No change', 'System shifts to counteract disturbance', 'Forward reaction', 'Backward reaction'], ans: 1 },
          { q: 'What is titration?', opts: ['Heating method', 'Concentration determination by reaction', 'Filtration', 'Distillation'], ans: 1 }
        ],
        'Computer Science': [
          { q: 'What is an algorithm?', opts: ['Software', 'Step-by-step procedure', 'Hardware', 'Data'], ans: 1 },
          { q: 'What is a variable?', opts: ['Fixed value', 'Named storage for data', 'Function', 'Operator'], ans: 1 },
          { q: 'What is a data type?', opts: ['File type', 'Classification of data values', 'Program type', 'Computer type'], ans: 1 },
          { q: 'What is a loop?', opts: ['Conditional', 'Repeated code execution', 'Function call', 'Variable declaration'], ans: 1 },
          { q: 'What is object-oriented programming?', opts: ['Function-based', 'Organizing code with objects/classes', 'Sequential programming', 'Logic programming'], ans: 1 },
          { q: 'What is recursion?', opts: ['Looping', 'Function calling itself', 'Function definition', 'Variable assignment'], ans: 1 },
          { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
          { q: 'What is a linked list?', opts: ['Array', 'Sequential data with pointers', 'Stack', 'Queue'], ans: 1 },
          { q: 'What is a stack?', opts: ['FIFO structure', 'LIFO structure', 'Array', 'Tree'], ans: 1 },
          { q: 'What is a queue?', opts: ['LIFO structure', 'FIFO structure', 'Array', 'Graph'], ans: 1 },
          { q: 'What is a binary tree?', opts: ['No children', 'Tree with max 2 children per node', 'Graph', 'Array'], ans: 1 },
          { q: 'What is a hash table?', opts: ['Array', 'Key-value storage with hash function', 'Linked list', 'Tree'], ans: 1 },
          { q: 'What is a database index?', opts: ['Data file', 'Speeds up data retrieval', 'Table', 'Query'], ans: 1 },
          { q: 'What is SQL?', opts: ['Programming language', 'Database query language', 'Markup language', 'Script'], ans: 1 },
          { q: 'What is a primary key?', opts: ['Unique identifier for records', 'Foreign key', 'Index', 'Relation'], ans: 0 },
          { q: 'What is normalization?', opts: ['Data duplication', 'Organizing data to reduce redundancy', 'Data deletion', 'Data encryption'], ans: 1 },
          { q: 'What is ACID in databases?', opts: ['Acid-base property', 'Atomicity/Consistency/Isolation/Durability', 'Database type', 'Query type'], ans: 1 },
          { q: 'What is a transaction?', opts: ['Single query', 'Unit of database operations', 'Data read', 'Table creation'], ans: 1 },
          { q: 'What is a deadlock?', opts: ['Normal operation', 'Processes waiting for each other indefinitely', 'Process completion', 'Resource sharing'], ans: 1 },
          { q: 'What is an operating system?', opts: ['Application', 'Manages hardware/software resources', 'Utility', 'Driver'], ans: 1 },
          { q: 'What is a process?', opts: ['Program in execution', 'Program on disk', 'Thread', 'Application'], ans: 0 },
          { q: 'What is a thread?', opts: ['Process', 'Lightweight unit of execution in process', 'Program', 'Service'], ans: 1 },
          { q: 'What is virtual memory?', opts: ['Additional RAM', 'Using disk as extended memory', 'Cache', 'ROM'], ans: 1 },
          { q: 'What is a file system?', opts: ['Database', 'Method to store/organize files', 'File type', 'Storage device'], ans: 1 },
          { q: 'What is a network protocol?', opts: ['Hardware', 'Rules for data communication', 'Cable', 'Software'], ans: 1 },
          { q: 'What is TCP?', opts: ['User Datagram Protocol', 'Transmission Control Protocol', 'Internet Protocol', 'File Protocol'], ans: 1 },
          { q: 'What is UDP?', opts: ['Reliable protocol', 'User Datagram Protocol (connectionless)', 'Guaranteed delivery', 'Sequenced'], ans: 1 },
          { q: 'What is an IP address?', opts: ['Server name', 'Numeric identifier for network device', 'Web address', 'Email'], ans: 1 },
          { q: 'What is DNS?', opts: ['Domain Name System (name to IP)', 'Data Network Service', 'Digital Network Standard', 'Domain Number System'], ans: 0 },
          { q: 'What is HTTP?', opts: ['File transfer protocol', 'Hypertext Transfer Protocol', 'Mail protocol', 'Security protocol'], ans: 1 },
          { q: 'What is encryption?', opts: ['Data deletion', 'Converting data to secure form', 'Data compression', 'Data sorting'], ans: 1 },
          { q: 'What is a firewall?', opts: ['Physical barrier', 'Network security filter', 'Antivirus', 'Password'], ans: 1 },
          { q: 'What is cybersecurity?', opts: ['Building security', 'Protecting systems from attacks', 'Network design', 'Software development'], ans: 1 },
          { q: 'What is a compiler?', opts: ['Runs code', 'Translates source code to machine code', 'Debugs code', 'Edits code'], ans: 1 },
          { q: 'What is an interpreter?', opts: ['Translates and executes line by line', 'Compiles entire program', 'Debugs code', 'Links code'], ans: 0 },
          { q: 'What is machine learning?', opts: ['Explicit programming', 'Algorithms learning from data', 'Rules engine', 'Hardware design'], ans: 1 },
          { q: 'What is deep learning?', opts: ['Simple neural network', 'Multi-layer neural network learning', 'Basic algorithm', 'Database learning'], ans: 1 },
          { q: 'What is a neural network?', opts: ['Social network', 'Computing system of interconnected nodes', 'Computer network', 'Database'], ans: 1 },
          { q: 'What is natural language processing?', opts: ['Computer vision', 'AI processing human language', 'Speech recognition', 'Text analysis'], ans: 1 },
          { q: 'What is a Turing machine?', opts: ['Physical computer', 'Abstract computational model', 'Supercomputer', 'Microcontroller'], ans: 1 },
          { q: 'What is the halting problem?', opts: ['Program crash', 'Determining if program terminates', 'Memory error', 'Infinite loop'], ans: 1 },
          { q: 'What is Big O notation?', opts: ['Exact runtime', 'Algorithm performance scaling', 'Memory usage', 'Code length'], ans: 1 },
          { q: 'What is a greedy algorithm?', opts: ['Optimal solution', 'Locally optimal choices', 'Random algorithm', 'Exact algorithm'], ans: 1 },
          { q: 'What is dynamic programming?', opts: ['Changing code', 'Solving subproblems once, reusing results', 'Runtime compilation', 'Memory allocation'], ans: 1 },
          { q: 'What is a graph in CS?', opts: ['Chart', 'Nodes and edges data structure', 'Tree', 'Array'], ans: 1 },
          { q: 'What is a breadth-first search?', opts: ['Depth-first traversal', 'Level-by-level graph traversal', 'Binary search', 'Merge sort'], ans: 1 },
          { q: 'What is polymorphism?', opts: ['Single form', 'Same interface, different implementations', 'Same type', 'One class'], ans: 1 },
          { q: 'What is inheritance in OOP?', opts: ['Copying code', 'Class acquiring properties of another', ['Import', 'Encapsulation'], ans: 1 },
          { q: 'What is encapsulation?', opts: ['Public data', 'Hiding internal state, requiring methods', 'Global variables', 'Direct access'], ans: 1 },
          { q: 'What is abstraction?', opts: ['Full details', 'Hiding complexity, showing essentials', ['Concrete implementation', 'Low-level code'], ans: 1 }
        ]
      }
    },
    'PG005': { // Creative & Performing Arts: English, Music, Drama, Fine Arts
      subjects: ['English', 'Music', 'Drama', 'Fine Arts'],
      questions: {
        English: [], Music: [], Drama: [],
        'Fine Arts': [
          { q: 'What is the color wheel?', opts: ['Paint set', 'Circular arrangement of colors', 'Artist palette', 'Brush type'], ans: 1 },
          { q: 'What is a primary color?', opts: ['Mixed color', 'Cannot be made by mixing', 'Secondary', 'Tertiary'], ans: 1 },
          { q: 'What is complementary color?', opts: ['Same color', 'Opposite on color wheel', 'Adjacent color', 'Neutral'], ans: 1 },
          { q: 'What is a tint in color?', opts: ['Color+black', 'Color+white', 'Pure color', 'Grayscale'], ans: 1 },
          { q: 'What is a shade?', opts: ['Color+white', 'Color+black', 'Pure color', 'Brightness'], ans: 1 },
          { q: 'What is composition in art?', opts: ['Color mixing', 'Arrangement of elements', 'Brush technique', 'Canvas size'], ans: 1 },
          { q: 'What is a focal point?', opts: ['Random spot', 'Main area of interest', 'Edge', 'Background'], ans: 1 },
          { q: 'What is balance in art?', opts: ['Equal colors', 'Visual equilibrium', 'Symmetry only', 'Weight'], ans: 1 },
          { q: 'What is proportion?', opts: ['Color relation', 'Size relationship between parts', 'Texture', 'Balance'], ans: 1 },
          { q: 'What is scale in art?', opts: ['Color scale', 'Size relative to reference', 'Gray scale', 'Weight scale'], ans: 1 },
          { q: 'What is emphasis?', opts: ['Background', 'Drawing attention to element', 'Texture', 'Color'], ans: 1 },
          { q: 'What is movement in art?', opts: ['Physical move', 'Visual flow guiding eye', 'Animation', 'Kinetic art'], ans: 1 },
          { q: 'What is rhythm in art?', opts: ['Musical rhythm', 'Repeated visual elements', 'Pattern', 'Texture'], ans: 1 },
          { q: 'What is texture in art?', opts: ['Color quality', 'Surface quality feel/appearance', 'Shape', 'Line'], ans: 1 },
          { q: 'What is value in art?', opts: ['Monetary worth', 'Lightness or darkness of color', ['Color intensity', 'Saturation'], ans: 1 },
          { q: 'What is a hue?', opts: ['Brightness', 'Pure color name', 'Value', 'Saturation'], ans: 1 },
          { q: 'What is saturation?', opts: ['Lightness', 'Color intensity/purity', 'Darkness', 'Opacity'], ans: 1 },
          { q: 'What is analogous color?', opts: ['Opposite colors', 'Adjacent colors on color wheel', 'Complementary', 'Triadic'], ans: 1 },
          { q: 'What is a monochromatic scheme?', opts: ['All colors', 'One hue with tints/shades', 'Two colors', 'Rainbow'], ans: 1 },
          { q: 'What is a triadic color scheme?', opts: ['Two colors', 'Three evenly spaced colors', 'Four colors', 'Complementary'], ans: 1 },
          { q: 'What is a vanishing point?', opts: ['Missing point', 'Where parallel lines converge', 'Center point', 'Focal point'], ans: 1 },
          { q: 'What is one-point perspective?', opts: ['Multiple vanishing points', 'Single vanishing point on horizon', 'No perspective', 'Isometric'], ans: 1 },
          { q: 'What is two-point perspective?', opts: ['One vanishing point', 'Two vanishing points', 'No vanishing point', 'Aerial perspective'], ans: 1 },
          { q: 'What is atmospheric perspective?', opts: ['Linear lines', 'Distant objects appear faded/bluer', 'Bold colors', 'High contrast'], ans: 1 },
          { q: 'What is a contour line?', opts: ['Colored line', 'Line defining edge/form', 'Texture', 'Value'], ans: 1 },
          { q: 'What is cross-hatching?', opts: ['Parallel lines', 'Crossed lines for shading', 'Dot pattern', 'Blending'], ans: 1 },
          { q: 'What is stippling?', opts: ['Line drawing', 'Dot pattern for shading', 'Hatching', 'Scumbling'], ans: 1 },
          { q: 'What is a gesture drawing?', opts: ['Detailed drawing', 'Quick capture of form/movement', 'Still life', 'Portrait'], ans: 1 },
          { q: 'What is a life drawing?', opts: ['Still life', 'Drawing live model', 'Abstract', 'Landscape'], ans: 1 },
          { q: 'What is a portrait?', opts: ['Landscape', 'Representation of a person', 'Still life', 'Abstract'], ans: 1 },
          { q: 'What is a self-portrait?', opts: ['Portrait of another', 'Portrait by artist of self', 'Group portrait', 'Profile'], ans: 1 },
          { q: 'What is a landscape?', opts: ['Person', 'Natural scenery depiction', 'Object arrangement', 'Abstract'], ans: 1 },
          { q: 'What is a seascape?', opts: ['Mountain scene', 'Sea/ocean scene', 'City scene', 'Desert'], ans: 1 },
          { q: 'What is a cityscape?', opts: ['Rural scene', 'Urban/city scene', 'Suburban', 'Industrial'], ans: 1 },
          { q: 'What is genre painting?', opts: ['Landscape', 'Scenes of everyday life', 'Portrait', 'History'], ans: 1 },
          { q: 'What is still life?', opts: ['Living beings', 'Inanimate objects arrangement', 'Portrait', 'Landscape'], ans: 1 },
          { q: 'What is an art movement?', opts: ['Physical activity', 'Style/trend in art period', 'Exhibition', 'Technique'], ans: 1 },
          { q: 'What is realism?', opts: ['Idealized form', 'Accurate detailed representation', 'Abstract', 'Expressionist'], ans: 1 },
          { q: 'What is expressionism?', opts: ['Objective reality', 'Emotional/subjective expression', 'Detailed realism', 'Geometric'], ans: 1 },
          { q: 'What is impressionism?', opts: ['Detailed finish', 'Capturing light and color impressions', 'Dark tones', 'Sharp lines'], ans: 1 },
          { q: 'What is surrealism?', opts: ['Everyday scenes', 'Dream-like, irrational imagery', 'Scientific art', 'Realistic'], ans: 1 },
          { q: 'What is abstract expressionism?', opts: ['Representational', 'Spontaneous, automatic creation', 'Geometric', 'Figurative'], ans: 1 },
          { q: 'What is minimalism?', opts: ['Ornate detail', 'Simple, essential elements', 'Complex patterns', 'Bright colors'], ans: 1 },
          { q: 'What is a curator?', opts: ['Artist', 'Person managing art collection/exhibition', 'Critic', 'Collector'], ans: 1 },
          { q: 'What is an art gallery?', opts: ['Studio', 'Space displaying artworks', 'Store', 'Workshop'], ans: 1 },
          { q: 'What is a museum?', opts: ['Temporary exhibition', 'Institution preserving/displaying art', 'Private collection', 'Art fair'], ans: 1 },
          { q: 'What is a biennial?', opts: ['Annual event', 'Art exhibition every two years', 'Monthly event', 'Weekly event'], ans: 1 },
          { q: 'What is a masterpiece?', opts: ['Average work', 'Outstanding work of art', ['Student work', 'Copy'], ans: 1 },
          { q: 'What is a sketch?', opts: ['Finished work', 'Preliminary rough drawing', 'Sculpture', 'Print'], ans: 1 },
          { q: 'What is art criticism?', opts: ['Art creation', 'Evaluation and interpretation of art', ['Art selling', 'Art collecting'], ans: 1 }
        ]
      }
    }
  };

  // Subject questions for shared subjects (English, Mathematics)
  // PG002 - Arts & Humanities: English uses the same pool from PG001
  // PG003 - Commerce & Business: Mathematics and English use PG001 pools
  // PG005 - Creative & Performing Arts: English uses the same pool from PG001

  // Generate questions
  var programs = [questionPools.PG001, questionPools.PG002, questionPools.PG003, questionPools.PG004, questionPools.PG005];
  var programIds = ['PG001', 'PG002', 'PG003', 'PG004', 'PG005'];
  var existingIds = {};
  qs.forEach(function(q) { existingIds[q.id] = true; });

  programs.forEach(function(pool, pi) {
    var subjKeys = Object.keys(pool.questions);
    subjKeys.forEach(function(subj) {
      var poolQ = pool.questions[subj];
      poolQ.forEach(function(data, qi) {
        var id = 'EQS_' + programIds[pi] + '_' + subj.replace(/[^a-z0-9]/gi,'') + '_' + qi;
        if (existingIds[id]) return;
        qs.push({
          id: id,
          programId: programIds[pi],
          question: data.q,
          options: data.opts,
          answer: data.ans
        });
      });
    });
  });

  data.examQuestions = qs;
  saveData();
}

// ===== SHOW ADMISSION PORTAL =====
function showAdmissionPortal() {
  var lp = document.getElementById('landing-page'); if (lp) { lp.classList.add('hidden'); lp.style.display = 'none'; }
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
  var ap = document.getElementById('admissionPage'); if (ap) ap.classList.add('active');
  cleanupExam();
  renderAdmissionPage();
}

function hideAdmissionPortal() {
  document.querySelectorAll('.portal-page').forEach(p => p.classList.remove('active'));
}

function cleanupExam() {
  const ef = document.getElementById('examFullscreen');
  if (ef) ef.remove();
  stopProctor();
  examState = null;
  currentApp = null;
}

// ===== RENDER ADMISSION PORTAL =====
function renderAdmissionPage() {
  var content = document.getElementById('admissionPageContent');
  var badge = document.getElementById('admBadge');
  if (!content) return;
  const apps = data.applications || [];
  const pending = apps.filter(a => a.status === 'pending' || a.status === 'exam_scheduled').length;
  if (badge) badge.textContent = pending ? `${pending} pending` : '';
  content.innerHTML = `
    <div class="adm-hero">
      <h1>Admissions Open for 2026/2027 Session</h1>
      <p>Explore our programs, submit your application, take the entrance exam, and begin your journey at ${htmlEscape((data && data.schoolName) ? data.schoolName : 'EDUVERSE')}</p>
    </div>
    <div style="margin-bottom:24px;display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="showAdmissionHome()"><i class="fas fa-list"></i> View Programs</button>
      <button class="btn btn-success" onclick="showMyApplication()"><i class="fas fa-search"></i> Check Application Status</button>
    </div>
    <div id="admContent">${renderProgramList()}</div>
  `;
}

function renderProgramList() {
  const programs = data.admissionPrograms || [];
  return `
    <h3 style="margin-bottom:16px;font-size:22px;font-weight:700;">Our Programs</h3>
    <div class="adm-programs">
      ${programs.map(p => `
        <div class="adm-program-card">
          <div class="header">
            <h3>${htmlEscape(p.name)}</h3>
            <span class="badge">${htmlEscape(p.duration)}</span>
          </div>
          <div class="body">
            <p>${htmlEscape(p.description)}</p>
            <div class="info-row"><span class="label">Tuition (per term)</span><span class="value">₦${(+p.fee).toLocaleString()}</span></div>
            <div class="info-row"><span class="label">Exam Duration</span><span class="value">${p.examDuration || 30} min</span></div>
            <div class="info-row"><span class="label">Subjects</span><span class="value">${p.subjects.length}</span></div>
            <div class="req-title">Requirements</div>
            <ul class="req-list">${p.requirements.map(r => `<li>${htmlEscape(r)}</li>`).join('')}</ul>
            <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;" onclick="showApplicationForm('${p.id}')"><i class="fas fa-paper-plane"></i> Apply Now</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showAdmissionHome() {
  var ac = document.getElementById('admContent'); if (ac) ac.innerHTML = renderProgramList();
}

// ===== APPLICATION FORM =====
function showApplicationForm(programId) {
  const program = data.admissionPrograms.find(p => p.id === programId);
  var ac = document.getElementById('admContent'); if (ac) ac.innerHTML = `
    <div class="card" style="max-width:600px;margin:0 auto;padding:32px;">
      <h3 style="margin-bottom:16px;"><i class="fas fa-paper-plane"></i> Application Form</h3>
      <p style="color:var(--text-light);margin-bottom:20px;font-size:14px;">Applying for: <strong>${htmlEscape(program?.name || 'Unknown')}</strong></p>
      <div class="form-grid">
        <div class="form-group"><label>First Name *</label><input type="text" id="appFname" placeholder="First name"></div>
        <div class="form-group"><label>Last Name *</label><input type="text" id="appLname" placeholder="Last name"></div>
        <div class="form-group"><label>Email *</label><input type="email" id="appEmail" placeholder="your@email.com"></div>
        <div class="form-group"><label>Phone *</label><input type="tel" id="appPhone" placeholder="080xxxxxxxx"></div>
        <div class="form-group"><label>Date of Birth *</label><input type="date" id="appDob"></div>
        <div class="form-group"><label>Previous School</label><input type="text" id="appPrevSchool" placeholder="Previous school name"></div>
        <div class="form-group" style="grid-column:1/-1;"><label>Home Address *</label><input type="text" id="appAddress" placeholder="Home address"></div>
      </div>
      <div class="modal-actions" style="margin-top:20px;">
        <button class="btn btn-outline" onclick="showAdmissionHome()" style="color:var(--text);border-color:#e2e8f0;">Cancel</button>
        <button class="btn btn-primary" onclick="submitApplication('${programId}')"><i class="fas fa-save"></i> Submit Application</button>
      </div>
    </div>
  `;
}

function submitApplication(programId) {
  const fname = (document.getElementById('appFname')?.value ?? '').trim();
  const lname = (document.getElementById('appLname')?.value ?? '').trim();
  const email = (document.getElementById('appEmail')?.value ?? '').trim();
  const phone = (document.getElementById('appPhone')?.value ?? '').trim();
  const dob = document.getElementById('appDob')?.value ?? '';
  const prevSchool = (document.getElementById('appPrevSchool')?.value ?? '').trim();
  const address = (document.getElementById('appAddress')?.value ?? '').trim();
  const missing = [];
  if (!fname) missing.push('First Name');
  if (!lname) missing.push('Last Name');
  if (!email) missing.push('Email');
  if (!phone) missing.push('Phone');
  if (!dob) missing.push('Date of Birth');
  if (!address) missing.push('Home Address');
  if (missing.length) { toast('Missing: ' + missing.join(', '), 'error'); return; }
  const app = {
    id: genId('APP'),
    firstName: fname, lastName: lname, email, phone, programId,
    status: 'pending', date: new Date().toISOString().split('T')[0],
    dob, prevSchool, address,
    examScheduled: false, examCompleted: false, examScore: null, examPassed: null
  };
  data.applications.push(app);
  saveData();
  toast('Application submitted! Your ID: ' + app.id);
  showApplicationStatus(app.id);
}

// ===== APPLICATION STATUS =====
function showMyApplication() {
  var ac = document.getElementById('admContent'); if (ac) ac.innerHTML = `
    <div class="card" style="max-width:500px;margin:32px auto;padding:32px;text-align:center;">
      <h3 style="margin-bottom:16px;"><i class="fas fa-search"></i> Check Application Status</h3>
      <div class="form-group"><label>Enter your Application ID</label><input type="text" id="checkAppId" placeholder="e.g. APPxxx" style="text-align:center;font-weight:600;"></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="showApplicationStatus(document.getElementById('checkAppId').value.trim())"><i class="fas fa-arrow-right"></i> Check Status</button>
    </div>
  `;
}

function showApplicationStatus(appId) {
  if (!appId) { toast('Please enter an Application ID', 'error'); return; }
  const app = data.applications.find(a => a.id === appId);
  if (!app) { toast('Application not found', 'error'); return; }
  const program = data.admissionPrograms.find(p => p.id === app.programId);
  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Under Review', done: app.status !== 'pending' },
    { label: 'Exam Scheduled', done: app.examScheduled },
    { label: 'Exam Completed', done: app.examCompleted },
    { label: app.examPassed === true ? 'Accepted' : app.examPassed === false ? 'Not Accepted' : 'Decision Pending', done: app.examPassed !== null }
  ];
  const passScore = app.examScore != null ? Math.round(app.examScore) : null;
  let statusHtml = `
    <div class="card" style="max-width:600px;margin:32px auto;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:8px;color:${app.examPassed === true ? 'var(--success)' : app.examPassed === false ? 'var(--danger)' : 'var(--accent)'}">
          <i class="fas ${app.examPassed === true ? 'fa-check-circle' : app.examPassed === false ? 'fa-times-circle' : 'fa-clock'}"></i>
        </div>
        <h3>Application Status: <span style="color:${app.examPassed === true ? 'var(--success)' : app.examPassed === false ? 'var(--danger)' : 'var(--accent)'}">${app.examPassed === true ? 'ACCEPTED' : app.examPassed === false ? 'Not Accepted' : app.status.replace('_',' ').toUpperCase()}</span></h3>
        <p style="color:var(--text-light);font-size:13px;">App ID: ${app.id} | ${htmlEscape(app.firstName + ' ' + app.lastName)} | ${htmlEscape(program?.name || '')}</p>
      </div>
      <div class="adm-status-timeline">
        ${steps.map((s, i) => {
          let lastDone = -1;
          for (let j = steps.length - 1; j >= 0; j--) { if (steps[j].done) { lastDone = j; break; } }
          return `<div class="step ${s.done ? 'completed' : ''} ${s.done && i === lastDone ? 'active' : ''}"><div class="dot"><i class="fas ${s.done ? 'fa-check' : 'fa-circle'}"></i></div>${s.label}</div>`;
        }).join('')}
      </div>
      <div style="text-align:center;margin-top:20px;">
        ${passScore !== null ? `<p style="margin-bottom:8px;">Entrance Exam Score: <strong>${passScore}%</strong> (${app.examPassed ? 'PASSED' : 'FAILED'})</p>` : ''}
        ${app.examPassed === true ? `<div class="acceptance-letter" style="margin-top:16px;"><h2><i class="fas fa-certificate"></i> Congratulations!</h2><div class="letter-body"><p>Dear ${htmlEscape(app.firstName)} ${htmlEscape(app.lastName)},</p><p>We are delighted to inform you that you have been accepted into <strong>${htmlEscape(program?.name || '')}</strong> at <strong>EDUVERSE</strong> for the 2026/2027 academic session.</p><p>Please proceed to the school admin office with this confirmation and your original documents for further processing.</p><p>Welcome to EDUVERSE!</p><div class="signature">— Admissions Office<br>EDUVERSE</div></div></div>` : ''}
        ${app.examPassed === false ? `<p style="color:var(--danger);">Unfortunately, you did not meet the minimum pass mark for your chosen program. You may re-apply next session.</p>` : ''}
        ${!app.examCompleted && app.examScheduled ? `<button class="btn btn-primary" onclick="startEntranceExam('${app.id}')"><i class="fas fa-play"></i> Take Entrance Exam</button>` : ''}
        ${!app.examScheduled && app.status !== 'rejected' ? `<p style="font-size:13px;color:var(--text-light);">Your application is being reviewed. You will be notified when your exam is scheduled.</p>` : ''}
        ${app.status === 'rejected' ? `<p style="color:var(--danger);">Your application has been reviewed and was not approved at this time.</p>` : ''}
        <button class="btn btn-outline" style="margin-top:12px;" onclick="showAdmissionPortal()"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
    </div>
  `;
}

var letters = ['A', 'B', 'C', 'D'];

// ===== ENTRANCE EXAM =====
function startEntranceExam(appId) {
  currentApp = data.applications.find(a => a.id === appId);
  if (!currentApp) { toast('Application not found', 'error'); return; }
  const program = data.admissionPrograms.find(p => p.id === currentApp.programId);
  const examDurationMin = program?.examDuration || 30;
  const questions = data.examQuestions.filter(q => q.programId === currentApp.programId);
  if (questions.length < 5) { toast('Not enough questions for this program. Contact admin.', 'error'); return; }
  // Shuffle questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 20);
  examState = {
    appId, programName: program?.name || 'Unknown', duration: examDurationMin * 60 * 1000,
    questions: shuffled, answers: new Array(shuffled.length).fill(null),
    currentIdx: 0, startTime: Date.now(),
    proctorStream: null, snapshots: [], tabSwitches: 0, active: true, finished: false
  };
  // Request camera
  if (navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      .then(stream => {
        examState.proctorStream = stream;
        renderExamFullscreen();
        startProctorCaptures();
      })
      .catch(() => {
        toast('Camera access is required for the exam. Please allow camera access.', 'error');
        renderExamFullscreen();
      });
  } else {
    toast('Camera not available on this device. Exam cannot proceed without proctor.', 'error');
    renderExamFullscreen();
  }
  // Tab switch detection
  document.addEventListener('visibilitychange', onTabSwitch);
}

function onTabSwitch() {
  if (examState && examState.active && !examState.finished) {
    if (document.hidden) {
      examState.tabSwitches++;
      toast('Warning: Tab switch detected! (' + examState.tabSwitches + ')', 'error');
      updateProctorAlert();
    }
  }
}

function startProctorCaptures() {
  if (proctorInterval) clearInterval(proctorInterval);
  proctorInterval = setInterval(() => {
    if (!examState || !examState.active || examState.finished || !examState.proctorStream) return;
    try {
      const video = document.querySelector('.exam-proctor video');
      if (!video) return;
      const canvas = document.createElement('canvas');
      canvas.width = 160; canvas.height = 120;
      canvas.getContext('2d').drawImage(video, 0, 0);
      examState.snapshots.push(canvas.toDataURL('image/jpeg', 0.5));
      if (examState.snapshots.length > 20) examState.snapshots.shift();
    } catch(e) { if (typeof console !== 'undefined') console.warn('Proctor capture failed:', e); }
  }, 15000);
}

function stopProctor() {
  if (proctorInterval) { clearInterval(proctorInterval); proctorInterval = null; }
  if (examState && examState.proctorStream) {
    examState.proctorStream.getTracks().forEach(t => t.stop());
  }
  document.removeEventListener('visibilitychange', onTabSwitch);
}

function renderExamFullscreen() {
  const total = examState.questions.length;
  const answered = examState.answers.filter(a => a !== null).length;
  const q = examState.questions[examState.currentIdx];
  const elapsed = Date.now() - examState.startTime;
  const durationMins = Math.floor(examState.duration / 60000);
  const em = Math.floor(elapsed / 60000);
  const es = Math.floor((elapsed % 60000) / 1000);
  const ratio = elapsed / examState.duration;
  const timerClass = ratio > 0.9 ? 'danger' : ratio > 0.7 ? 'warning' : '';
  const existing = document.getElementById('examFullscreen');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', '<div class="exam-fullscreen" id="examFullscreen"></div>');
  var ef = document.getElementById('examFullscreen'); if (ef) ef.innerHTML = `
    <div class="exam-topbar">
      <div><h3><i class="fas fa-file-alt"></i> ${htmlEscape(examState.programName)} Exam</h3></div>
      <div style="text-align:center;">
        <div class="exam-timer ${timerClass}" id="examTimer">${String(em).padStart(2,'0')}:${String(es).padStart(2,'0')}</div>
        <div style="font-size:11px;opacity:0.7;">of ${String(durationMins).padStart(2,'0')}:00</div>
      </div>
      <div><span style="font-size:13px;">${answered}/${total} answered</span></div>
      <div><button class="btn btn-sm btn-danger" onclick="confirmFinishExam()"><i class="fas fa-flag-checkered"></i> Submit</button></div>
    </div>
    <div class="exam-body">
      <div class="exam-main">
        <div class="exam-proctor">
          <video autoplay muted playsinline></video>
          <div class="proctor-overlay"><span><span class="dot" id="proctorDot"></span> Proctor Active</span><span id="proctorInfo">0 tab switches</span></div>
        </div>
        <div class="proctor-alert" id="proctorAlert"><i class="fas fa-exclamation-triangle"></i> <span id="proctorAlertMsg"></span></div>
        <div id="examQuestionArea"></div>
        <div class="exam-nav-btns">
          <button class="btn btn-outline" onclick="prevQuestion()" ${examState.currentIdx === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Previous</button>
          <button class="btn btn-primary" onclick="nextQuestion()">${examState.currentIdx < total - 1 ? 'Next <i class="fas fa-chevron-right"></i>' : 'Review <i class="fas fa-check"></i>'}</button>
        </div>
      </div>
      <div class="exam-sidebar">
        <h4 style="margin-bottom:8px;font-size:14px;">Question Navigator</h4>
        <div class="exam-question-count">
          ${examState.questions.map((_, i) => `
            <div class="qnum ${examState.answers[i] !== null ? 'answered' : ''} ${examState.currentIdx === i ? 'current' : ''}" onclick="goToQuestion(${i})">${i + 1}</div>
          `).join('')}
        </div>
        <div class="proctor-strip" id="proctorStrip"></div>
      </div>
    </div>
  `;
  // Attach camera
  if (examState.proctorStream) {
    const video = ef.querySelector('.exam-proctor video');
    if (video) video.srcObject = examState.proctorStream;
  }
  renderExamQuestion(examState.currentIdx);
  startExamTimer();
}

function renderExamQuestion(idx) {
  const q = examState.questions[idx];
  if (!q) return;
  const area = document.getElementById('examQuestionArea');
  if (!area) return;
  const letters = ['A', 'B', 'C', 'D'];
  const selected = examState.answers[idx];
  document.querySelectorAll('.qnum').forEach((el, i) => {
    el.className = 'qnum';
    if (examState.answers[i] !== null) el.classList.add('answered');
    if (i === idx) el.classList.add('current');
  });
  area.innerHTML = `
    <div class="exam-question">
      <div class="q-text">${htmlEscape(q.question)}</div>
      <div class="q-options">
        ${q.options.map((opt, oi) => `
          <div class="q-option ${selected === oi ? 'selected' : ''}" onclick="selectAnswer(${oi})">
            <div class="letter">${letters[oi]}</div>
            <span>${htmlEscape(opt)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function selectAnswer(optionIdx) {
  examState.answers[examState.currentIdx] = optionIdx;
  renderExamQuestion(examState.currentIdx);
  const answered = examState.answers.filter(a => a !== null).length;
  var _tb = document.querySelector('.exam-topbar'); if (_tb) { var _sp = _tb.querySelector('span'); if (_sp) _sp.textContent = answered + '/' + examState.questions.length + ' answered'; }
}

function nextQuestion() {
  if (examState.currentIdx < examState.questions.length - 1) {
    examState.currentIdx++;
    renderExamQuestion(examState.currentIdx);
  } else {
    confirmFinishExam();
  }
}

function prevQuestion() {
  if (examState.currentIdx > 0) {
    examState.currentIdx--;
    renderExamQuestion(examState.currentIdx);
  }
}

function goToQuestion(idx) {
  if (idx >= 0 && idx < examState.questions.length) {
    examState.currentIdx = idx;
    renderExamQuestion(idx);
  }
}

function startExamTimer() {
  const timerEl = document.getElementById('examTimer');
  if (!timerEl) return;
  const interval = setInterval(() => {
    if (!examState || examState.finished || !document.getElementById('examFullscreen')) {
      clearInterval(interval);
      return;
    }
    const elapsed = Date.now() - examState.startTime;
    const em = Math.floor(elapsed / 60000);
    const es = Math.floor((elapsed % 60000) / 1000);
    const ratio = elapsed / examState.duration;
    timerEl.textContent = String(em).padStart(2,'0') + ':' + String(es).padStart(2,'0');
    timerEl.className = 'exam-timer ' + (ratio > 0.9 ? 'danger' : ratio > 0.7 ? 'warning' : '');
    // Update proctor info
    const info = document.getElementById('proctorInfo');
    if (info) info.textContent = examState.tabSwitches + ' tab switches';
    if (elapsed >= examState.duration) {
      clearInterval(interval);
      toast('Time is up! Auto-submitting exam.', 'warning');
      finishExam();
    }
  }, 1000);
}

function updateProctorAlert() {
  const alert = document.getElementById('proctorAlert');
  const msg = document.getElementById('proctorAlertMsg');
  if (alert && msg) {
    alert.classList.add('show');
    msg.textContent = 'Tab switch detected! (' + examState.tabSwitches + ' violation' + (examState.tabSwitches > 1 ? 's' : '') + ')';
    setTimeout(() => alert.classList.remove('show'), 4000);
  }
}

function confirmFinishExam() {
  const unanswered = examState.answers.filter(a => a === null).length;
  const msg = unanswered > 0
    ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
    : 'Are you sure you want to submit your exam?';
  if (!confirm(msg)) return;
  finishExam();
}

function finishExam() {
  if (!examState || examState.finished) return;
  examState.finished = true;
  examState.active = false;
  stopProctor();
  // Grade
  const correct = examState.answers.reduce((acc, ans, i) => {
    return acc + (ans === examState.questions[i].answer ? 1 : 0);
  }, 0);
  const total = examState.questions.length;
  const score = (correct / total) * 100;
  const passed = score >= 50;
  const attempt = {
    id: genId('EAT'),
    appId: examState.appId,
    applicantName: currentApp ? currentApp.firstName + ' ' + currentApp.lastName : 'Unknown',
    programId: currentApp ? currentApp.programId : '',
    answers: examState.answers,
    correct, total, score: Math.round(score), passed,
    startTime: new Date(examState.startTime).toISOString(),
    endTime: new Date().toISOString(),
    tabSwitches: examState.tabSwitches,
    snapshots: examState.snapshots
  };
  data.examAttempts.push(attempt);
  // Update application
  if (currentApp) {
    currentApp.examScheduled = true;
    currentApp.examCompleted = true;
    currentApp.examScore = Math.round(score);
    currentApp.examPassed = passed;
    currentApp.status = passed ? 'accepted' : 'rejected';
  }
  saveData();
  // Remove fullscreen
  const ef = document.getElementById('examFullscreen');
  if (ef) ef.remove();
  renderExamResult(attempt);
}

function renderExamResult(attempt) {
  var ac = document.getElementById('admContent'); if (ac) ac.innerHTML = `
    <div class="exam-result">
      <div class="result-icon ${attempt.passed ? 'pass' : 'fail'}"><i class="fas ${attempt.passed ? 'fa-check-circle' : 'fa-times-circle'}"></i></div>
      <div class="result-label">${attempt.passed ? 'CONGRATULATIONS!' : 'NOT ELIGIBLE'}</div>
      <div class="result-score" style="color:${attempt.passed ? 'var(--success)' : 'var(--danger)'};">${attempt.score}%</div>
      <p style="font-size:16px;margin-bottom:4px;">${attempt.correct} out of ${attempt.total} correct</p>
      <div class="result-msg">${attempt.passed
        ? 'You have passed the entrance examination for your chosen program. Your acceptance letter is ready below.'
        : 'Unfortunately, your score did not meet the minimum pass mark required. You may re-apply for the next academic session.'}</div>
      ${attempt.tabSwitches > 0 ? `<p style="font-size:13px;color:var(--danger);margin-bottom:8px;"><i class="fas fa-exclamation-triangle"></i> Proctor flags: ${attempt.tabSwitches} tab switch${attempt.tabSwitches > 1 ? 'es' : ''} detected</p>` : ''}
      ${attempt.snapshots.length > 0 ? `<div style="margin-bottom:16px;"><p style="font-size:12px;color:var(--text-light);margin-bottom:4px;">Proctor snapshots (${attempt.snapshots.length}):</p><div class="proctor-strip">${attempt.snapshots.map(s => `<img src="${s}" alt="snapshot">`).join('')}</div></div>` : ''}
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="showApplicationStatus('${attempt.appId}')"><i class="fas fa-id-card"></i> View Acceptance Letter</button>
        <button class="btn btn-outline" onclick="showAdmissionPortal()"><i class="fas fa-arrow-left"></i> Back to Admissions</button>
      </div>
    </div>
  `;
  toast(attempt.passed ? 'Congratulations! You passed the entrance exam!' : 'Exam completed. See results above.', attempt.passed ? 'success' : 'error');
}

// ===== ADMIN: PROGRAMS =====
function renderPrograms() {
  const container = document.getElementById('adminPrograms');
  if (!container) return;
  const programs = data.admissionPrograms || [];
  container.innerHTML = `
    <div class="table-responsive">
      <table><thead><tr><th>Program</th><th>Academic Duration</th><th>Exam Time</th><th>Tuition</th><th>Requirements</th><th>Subjects</th><th>Actions</th></tr></thead>
      <tbody>${programs.map(p => `<tr>
        <td><strong>${htmlEscape(p.name)}</strong></td>
        <td>${htmlEscape(p.duration)}</td>
        <td style="font-weight:600;color:var(--primary);">${p.examDuration || 30} min</td>
        <td>₦${(+p.fee).toLocaleString()}</td>
        <td>${p.requirements.length} items</td>
        <td>${htmlEscape(p.subjects.join(', '))}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteProgram('${p.id}')"><i class="fas fa-trash"></i></button></td>
      </tr>`).join('')}</tbody>
    </table></div>
    ${programs.length ? '' : '<div class="empty-state"><i class="fas fa-book"></i><p>No programs created yet</p></div>'}
  `;
}

function showAddProgramModal() {
  openModal(`
    <h3><i class="fas fa-plus-circle"></i> Add Program</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Program Name</label><input type="text" id="fPrgName" placeholder="e.g. Science & Technology"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea id="fPrgDesc" rows="2" placeholder="Program description"></textarea></div>
      <div class="form-group"><label>Duration</label><input type="text" id="fPrgDuration" placeholder="6 years"></div>
      <div class="form-group"><label>Tuition (per term)</label><input type="number" id="fPrgFee" placeholder="350000"></div>
      <div class="form-group"><label>Exam Time (minutes)</label><input type="number" id="fPrgExamTime" value="30" min="5" max="180" style="font-weight:600;"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Subjects (comma separated)</label><input type="text" id="fPrgSubjects" placeholder="Math, English, Science"></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Requirements (one per line)</label><textarea id="fPrgReqs" rows="3" placeholder="Pass Entrance Exam (60%+)&#10;Age 10-15&#10;Previous school report"></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()" style="color:var(--text);border-color:#e2e8f0;">Cancel</button>
      <button class="btn btn-primary" onclick="saveProgram()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveProgram() {
  var name = (document.getElementById('fPrgName')?.value ?? '').trim();
  var desc = (document.getElementById('fPrgDesc')?.value ?? '').trim();
  var duration = (document.getElementById('fPrgDuration')?.value ?? '').trim();
  var fee = parseFloat(document.getElementById('fPrgFee')?.value ?? '');
  var examDuration = parseInt(document.getElementById('fPrgExamTime')?.value ?? '') || 30;
  var subjects = (document.getElementById('fPrgSubjects')?.value ?? '').split(',').map(s => s.trim()).filter(Boolean);
  var reqs = (document.getElementById('fPrgReqs')?.value ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!name || !desc || !duration || !fee || subjects.length === 0 || reqs.length === 0) { toast('Please fill all fields', 'error'); return; }
  data.admissionPrograms.push({ id: genId('PG'), name, description: desc, duration, fee, requirements: reqs, subjects, examDuration });
  saveData();
  closeModal();
  renderPrograms();
  toast('Program added');
}

function deleteProgram(id) {
  if (!confirm('Delete this program? This will also remove related questions.')) return;
  data.admissionPrograms = data.admissionPrograms.filter(p => p.id !== id);
  data.examQuestions = data.examQuestions.filter(q => q.programId !== id);
  saveData();
  renderPrograms();
  toast('Program deleted');
}

// ===== ADMIN: APPLICATIONS =====
function renderApplications() {
  const container = document.getElementById('adminApplications');
  if (!container) return;
  const apps = data.applications || [];
  container.innerHTML = `
    <div class="table-responsive">
      <table><thead><tr><th>App ID</th><th>Applicant</th><th>Email</th><th>Program</th><th>Date</th><th>Status</th><th>Score</th><th>Actions</th></tr></thead>
      <tbody id="applicationsTable">${apps.map(a => {
        const p = data.admissionPrograms.find(pr => pr.id === a.programId);
        return `<tr>
          <td>${a.id}</td>
          <td>${htmlEscape(a.firstName + ' ' + a.lastName)}</td>
          <td>${htmlEscape(a.email)}</td>
          <td>${p ? htmlEscape(p.name) : '--'}</td>
          <td>${a.date}</td>
          <td><span class="badge ${a.examPassed === true ? 'badge-paid' : a.examPassed === false ? 'badge-absent' : 'badge-pending'}">${a.examPassed === true ? 'Accepted' : a.examPassed === false ? 'Rejected' : a.status.replace('_', ' ')}</span></td>
          <td>${a.examScore !== null ? a.examScore + '%' : '--'}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewApplicationDetail('${a.id}')"><i class="fas fa-eye"></i></button>
            ${!a.examScheduled && a.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="approveApplication('${a.id}')"><i class="fas fa-check"></i> Approve</button>` : ''}
            ${!a.examCompleted && a.examScheduled ? `<button class="btn btn-sm btn-info" onclick="resetExam('${a.id}')" style="background:var(--info);color:white;"><i class="fas fa-redo"></i> Reset</button>` : ''}
            ${a.status === 'pending' ? `<button class="btn btn-sm btn-danger" onclick="rejectApplication('${a.id}')"><i class="fas fa-times"></i></button>` : ''}
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
    ${apps.length ? '' : '<div class="empty-state"><i class="fas fa-file-signature"></i><p>No applications yet</p></div>'}
  `;
}

function approveApplication(id) {
  const app = data.applications.find(a => a.id === id);
  if (!app) return;
  app.examScheduled = true;
  app.status = 'exam_scheduled';
  saveData();
  renderApplications();
  toast('Application approved. Exam scheduled.');
  // Notify via notification system
  data.notifications.push({ id: genId('NOT'), to: app.email, type: 'admission', message: 'Your entrance exam has been scheduled. Please visit the admission portal to take your exam.', date: new Date().toISOString().split('T')[0], read: false });
  saveData();
}

function rejectApplication(id) {
  if (!confirm('Reject this application?')) return;
  const app = data.applications.find(a => a.id === id);
  if (!app) return;
  app.status = 'rejected';
  saveData();
  renderApplications();
  toast('Application rejected');
}

function resetExam(id) {
  if (!confirm('Reset exam for this applicant? This will allow them to retake.')) return;
  const app = data.applications.find(a => a.id === id);
  if (!app) return;
  app.examCompleted = false;
  app.examScore = null;
  app.examPassed = null;
  app.status = 'exam_scheduled';
  // Remove old attempts
  data.examAttempts = data.examAttempts.filter(e => e.appId !== id);
  saveData();
  renderApplications();
  toast('Exam reset for applicant');
}

function viewApplicationDetail(id) {
  const a = data.applications.find(app => app.id === id);
  if (!a) return;
  const p = data.admissionPrograms.find(pr => pr.id === a.programId);
  openModal(`
    <h3><i class="fas fa-user"></i> Application Detail</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div><strong>Name:</strong> ${htmlEscape(a.firstName + ' ' + a.lastName)}</div>
      <div><strong>Email:</strong> ${htmlEscape(a.email)}</div>
      <div><strong>Phone:</strong> ${htmlEscape(a.phone)}</div>
      <div><strong>DOB:</strong> ${htmlEscape(a.dob)}</div>
      <div><strong>Program:</strong> ${p ? htmlEscape(p.name) : '--'}</div>
      <div><strong>Prev School:</strong> ${htmlEscape(a.prevSchool || '--')}</div>
      <div style="grid-column:1/-1;"><strong>Address:</strong> ${htmlEscape(a.address)}</div>
      <div style="grid-column:1/-1;"><strong>Status:</strong> <span class="badge ${a.examPassed === true ? 'badge-paid' : a.examPassed === false ? 'badge-absent' : 'badge-pending'}">${a.status}</span></div>
      ${a.examScore !== null ? `<div style="grid-column:1/-1;"><strong>Exam Score:</strong> ${a.examScore}% ${a.examPassed ? '(PASSED)' : '(FAILED)'}</div>` : ''}
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()" style="color:var(--text);border-color:#e2e8f0;">Close</button>
      ${!a.examScheduled && a.status === 'pending' ? `<button class="btn btn-success" onclick="closeModal();approveApplication('${a.id}')"><i class="fas fa-check"></i> Approve & Schedule Exam</button>` : ''}
    </div>
  `);
}

// ===== ADMIN: EXAM BANK =====
var letters = ['A', 'B', 'C', 'D'];

function renderExamBank() {
  const container = document.getElementById('adminExamBank');
  const filter = document.getElementById('filterExamProgram');
  if (!container) return;
  // Populate filter
  if (filter) {
    const programs = data.admissionPrograms || [];
    filter.innerHTML = '<option value="">All Programs</option>' + programs.map(p => `<option value="${p.id}">${htmlEscape(p.name)}</option>`).join('');
    const sel = filter.value;
  }
  const selectedProgram = filter ? filter.value : '';
  let questions = data.examQuestions || [];
  if (selectedProgram) questions = questions.filter(q => q.programId === selectedProgram);
  const programs = data.admissionPrograms || [];
  container.innerHTML = `
    <div class="table-responsive">
      <table><thead><tr><th>#</th><th>Program</th><th>Question</th><th>Options</th><th>Answer</th><th>Actions</th></tr></thead>
      <tbody>${questions.map((q, i) => {
        const p = programs.find(pr => pr.id === q.programId);
        return `<tr>
          <td>${i + 1}</td>
          <td>${p ? htmlEscape(p.name) : '--'}</td>
          <td>${htmlEscape(q.question.length > 50 ? q.question.slice(0, 50) + '...' : q.question)}</td>
          <td>${q.options.map((o, oi) => `${letters[oi] || (String.fromCharCode(65 + oi))}. ${htmlEscape(o)}`).join('<br>')}</td>
          <td><span class="badge badge-paid">${letters[q.answer] || q.answer}</span></td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteQuestion('${q.id}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
    ${questions.length ? '' : '<div class="empty-state"><i class="fas fa-question-circle"></i><p>No questions for this program</p></div>'}
  `;
}

function showAddQuestionModal() {
  const programs = data.admissionPrograms || [];
  const opts = programs.map(p => `<option value="${p.id}">${htmlEscape(p.name)}</option>`).join('');
  openModal(`
    <h3><i class="fas fa-plus-circle"></i> Add Exam Question</h3>
    <div class="form-grid">
      <div class="form-group" style="grid-column:1/-1;"><label>Program</label><select id="fQProgram">${opts}</select></div>
      <div class="form-group" style="grid-column:1/-1;"><label>Question</label><textarea id="fQQuestion" rows="2" placeholder="Enter the question text"></textarea></div>
      <div class="form-group"><label>Option A</label><input type="text" id="fQOptA" placeholder="Option A"></div>
      <div class="form-group"><label>Option B</label><input type="text" id="fQOptB" placeholder="Option B"></div>
      <div class="form-group"><label>Option C</label><input type="text" id="fQOptC" placeholder="Option C"></div>
      <div class="form-group"><label>Option D</label><input type="text" id="fQOptD" placeholder="Option D"></div>
      <div class="form-group"><label>Correct Answer</label>
        <select id="fQAnswer"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()" style="color:var(--text);border-color:#e2e8f0;">Cancel</button>
      <button class="btn btn-primary" onclick="saveQuestion()"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveQuestion() {
  var programId = document.getElementById('fQProgram')?.value ?? '';
  var question = (document.getElementById('fQQuestion')?.value ?? '').trim();
  var opts = [
    (document.getElementById('fQOptA')?.value ?? '').trim(),
    (document.getElementById('fQOptB')?.value ?? '').trim(),
    (document.getElementById('fQOptC')?.value ?? '').trim(),
    (document.getElementById('fQOptD')?.value ?? '').trim()
  ];
  var answer = parseInt(document.getElementById('fQAnswer')?.value ?? '');
  if (!question || opts.some(o => !o) || !programId) { toast('Please fill all fields', 'error'); return; }
  data.examQuestions.push({ id: genId('EQ'), programId, question, options: opts, answer });
  saveData();
  closeModal();
  renderExamBank();
  toast('Question added');
}

function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;
  data.examQuestions = data.examQuestions.filter(q => q.id !== id);
  saveData();
  renderExamBank();
  toast('Question deleted');
}

// ===== ADMIN: EXAM RESULTS =====
function renderExamResults() {
  const container = document.getElementById('adminExamResults');
  if (!container) return;
  const attempts = data.examAttempts || [];
  container.innerHTML = `
    <div class="table-responsive">
      <table><thead><tr><th>Applicant</th><th>Program</th><th>Score</th><th>Correct/Total</th><th>Passed</th><th>Date</th><th>Tab Switches</th></tr></thead>
      <tbody id="examResultsTable">${attempts.map(e => {
        const p = data.admissionPrograms.find(pr => pr.id === e.programId);
        return `<tr>
          <td>${htmlEscape(e.applicantName)}</td>
          <td>${p ? htmlEscape(p.name) : '--'}</td>
          <td><strong>${e.score}%</strong></td>
          <td>${e.correct}/${e.total}</td>
          <td><span class="badge ${e.passed ? 'badge-paid' : 'badge-absent'}">${e.passed ? 'PASS' : 'FAIL'}</span></td>
          <td>${e.endTime ? e.endTime.split('T')[0] : '--'}</td>
          <td>${e.tabSwitches > 0 ? `<span style="color:var(--danger)">${e.tabSwitches}</span>` : '0'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
    ${attempts.length ? '' : '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No exam attempts recorded yet</p></div>'}
  `;
}
