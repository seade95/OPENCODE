// EDUVERSE - Exam Simulation System
// Interactive timed exams for Nigerian 9-3-4 system: Common Entrance, BECE, WASSCE, NECO, CBT

// ===== SEED QUESTION BANK — Nigerian Curriculum =====
function getDefaultSimQuestions() {
  var Q = [];
  var _c = 0;
  function _i() { _c++; return 'SIM' + String(_c).padStart(3, '0'); }
  function _a(cls, subj, q, opts, ans, diff, eType) { Q.push({ id: _i(), class: cls, subject: subj, question: q, options: opts, answer: ans, difficulty: diff || 'medium', examType: eType || 'general' }); }
  function _g(cls, subj, n, fn, eType) { for (var i = 0; i < n; i++) { var r = fn(i); if (!r) continue; Q.push({ id: _i(), class: cls, subject: subj, question: r[0], options: r[1], answer: r[2], difficulty: r[3] || 'medium', examType: eType || (cls === 'Basic 6' ? 'common_entrance' : cls === 'JSS 3' ? 'bece' : cls === 'SSS 3' ? 'wassce' : cls === 'SSS 1' || cls === 'SSS 2' || cls === 'JSS 1' || cls === 'JSS 2' ? 'cbt' : 'general') }); } }
  function _r(s) { return function(a, b) { return a + (Math.abs(Math.sin(s * 9301 + 49297)) * (b - a + 1)) << 0; }; }
  function _addSub(i, m, o) { o=o||0; var r=_r((i+o)*7+13); var a=r(1,m), b=r(1,Math.max(1,m-(a>>1))); if((i+o)%3){if(a<b){var t=a;a=b;b=t;} var x=a-b;return [a+' - '+b+' = ?',[Math.max(0,x-1),x,x+1,x+2].map(String),1,'easy'];} var x=a+b;return [a+' + '+b+' = ?',[Math.max(0,x-1),x,x+1,x+2].map(String),1,x>15?'medium':'easy'];}
  function _mul(i, mA, mB, o) { o=o||0; var r=_r((i+o)*11+23); var a=r(1,mA),b=r(1,mB),x=a*b; return [a+' × '+b+' = ?',[Math.max(0,x-1),x,x+1,x+2].map(String),1,x>50?'hard':x>20?'medium':'easy'];}
  function _wProbs(i,m,o) { o=o||0; var r=_r((i+o)*17+5); var a=r(1,m),b=r(2,m); if((i+o)%2){var x=a*b;return ['Area of rectangle '+a+'cm × '+b+'cm?',[x+'cm2',(x+1)+'cm2',(x-1)+'cm2',(x+2)+'cm2'],0,'medium'];} var x=a+b;return ['Perimeter of rectangle '+a+'cm × '+b+'cm?',[x*2+'cm',(x*2+1)+'cm',(x*2-1)+'cm',(x*2+2)+'cm'],0,'medium'];}
  function _avg(i,m,o) { o=o||0; var r=_r((i+o)*23+7); var a=r(1,m),b=r(1,m),c=r(1,m); var x=Math.round((a+b+c)/3); return ['Find the mean of '+a+', '+b+', '+c+':',[x-2,x-1,x,x+1].map(String),2,'medium'];}
  function _pct(i,o) { o=o||0; var r=_r((i+o)*31+11); var a=r(10,200); var p=r(5,50); var x=Math.round(a*p/100); return ['What is '+p+'% of '+a+'?',[x-5,x-5<0?0:x-5,x+5,x+10].map(String),1,'medium'];}
  function _frac(i,o) { o=o||0; var r=_r((i+o)*37+3); var a=r(1,9),b=r(2,10); if(a>=b){var t=a;a=b;b=t;} return ['Which is larger: '+a+'/'+b+' or '+(a+1)+'/'+b+'?',[(a+1)+'/'+b,a+'/'+b,'Equal','Cannot tell'],0,'medium'];}
  function _wordProb(i,o) { o=o||0; var r=_r((i+o)*41+17); var a=r(2,12),b=r(2,12),c=r(2,12); return ['If '+a+' books cost ₦'+(a*50)+', what is the cost of 1 book?',['₦'+((a*50)-10),'₦'+((a*50)-5),'₦'+(a*50/a),'₦'+((a*50)+5)].map(String),2,'medium'];}
  function _money(i,o) { o=o||0; var r=_r((i+o)*43+29); var a=r(1,20)*50; var b=r(2,10); return ['If one item costs ₦'+a+', what is the cost of '+b+' items?',['₦'+(a*b-100),'₦'+(a*b-50),'₦'+a*b,'₦'+(a*b+50)].map(String),2,'medium'];}
  function _geo(i,o) { o=o||0; var r=_r((i+o)*47+2); var sa=[3,4,5,6,8,10]; var s=sa[r(0,sa.length-1)]; return ['How many sides does a '+['triangle','quadrilateral','pentagon','hexagon','octagon','decagon'][sa.indexOf(s)]+' have?',[s-1,s,s+1,s+2].map(String),1,'easy'];}
  function _addFrac(i,o) { o=o||0; var r=_r((i+o)*53+19); var d=r(2,8),a=r(1,d-1),b=r(1,d-1);return ['What is '+a+'/'+d+' + '+b+'/'+d+'?',[(a+b-1)+'/'+d,(a+b)+'/'+d,(a+b+1)+'/'+d,(a*b)+'/'+d].map(String),1,'medium'];}
  function _time(i,o) { o=o||0; var r=_r((i+o)*59+31); var h=r(1,12); var m=[0,15,30,45][r(0,3)]; var h2=m===0?h+1:h; return ['If the time is '+h+':'+(m<10?'0'+m:m)+', what will the time be in 30 min?',[(h%12+1)+':'+(m<10?'0'+m:m),(h%12)+':'+(m+30<60?m+30:m+30-60)+(h<10?'0'+h:h),(h%12+1)+':'+((m+30)%60<10?'0'+(m+30)%60:(m+30)%60),(h%12)+':'+m].map(String),2,'medium'];}
  function _alg(i,o) { o=o||0; var r=_r((i+o)*61+37); var x=r(1,20); var c=r(1,10); var a=x*2+c; return ['Solve: 2x + '+c+' = '+a+', find x.',[x-2,x-1,x,x+1].map(String),2,'hard'];}
  function _trig(i,o) { o=o||0; var r=_r((i+o)*67+41); var ang=[0,30,45,60,90][r(0,4)]; var vals=['0','1/2','√2/2','√3/2','1']; return ['What is sin '+ang+'°?',[vals[r(0,4)],vals[r(0,4)],vals[r(0,4)],vals[r(0,4)]].map(String),0,'hard'];}
  function _set(i,o) { o=o||0; var r=_r((i+o)*71+53); var a=r(1,10),b=r(a+1,15); return ['If A = {'+a+','+b+'}, B = {'+b+','+(b+1)+'}, what is |A∪B|?',[2,3,4,1].map(String),1,'hard'];}
  function _exp(i,o) { o=o||0; var r=_r((i+o)*73+59); var b=r(2,4),p=r(2,4); return ['What is '+b+'^'+p+'?',[Math.pow(b,p)-1,Math.pow(b,p),Math.pow(b,p)+1,Math.pow(b,p)+2].map(String),1,'hard'];}
  function _log(i,o) { o=o||0; var r=_r((i+o)*79+61); var bases=[10,2,5]; var b=bases[r(0,2)]; var vals=[100,8,25]; var v=vals[bases.indexOf(b)]; var a=Math.round(Math.log(v)/Math.log(b)); return ['What is log_'+b+' '+v+'?',[a-1,a,a+1,a+2].map(String),1,'hard'];}
  function _place(i,o) { o=o||0; var r=_r((i+o)*83+67); var n=['thousand','hundred','ten','unit'][r(0,3)]; var p=[1000,100,10,1][['thousand','hundred','ten','unit'].indexOf(n)]; var num=r(1,9)*p+r(0,p-1); var d=Math.floor(num/p)%10; return ['What is the place value of '+d+' in '+num+'?',[d,d*10,d*100,d*1000].map(String),1,'medium'];}
  function _fibo(i,o) { o=o||0; var r=_r((i+o)*89+71); var a=r(1,5),b=r(a+1,10); return ['What is the next number: '+a+', '+b+', '+(a+b)+'?',[a+b,a+b+b,a+b*2,b*2].map(String),0,'medium'];}

  // ===== BASIC 1 =====
  _g('Basic 1','Mathematics',30,function(i){return _addSub(i,10,0);});
  _g('Basic 1','Mathematics',20,function(i){return _addSub(i,10,50);});
  _g('Basic 1','Mathematics',15,function(i){return _mul(i,5,5,0);});
  _g('Basic 1','Mathematics',10,function(i){return _money(i,0);});
  _a('Basic 1','English','Which word starts with A?',['Ball','Apple','Cat','Dog'],1,'easy');
  _a('Basic 1','English','Opposite of "big"?',['Tall','Small','Wide','Long'],1,'easy');
  _a('Basic 1','English','What letter comes after A?',['A','B','C','D'],1,'easy');
  _a('Basic 1','English','Correct spelling: "kat" or "cat"?',['Kat','Cat','Katt','Catt'],1,'easy');
  _a('Basic 1','English','Plural of "book"?',['Book','Books','Bookes','Booken'],1,'easy');
  _a('Basic 1','English','___ is a naming word.',['A verb','A noun','An adverb','An adjective'],1,'easy');
  _a('Basic 1','English','"The dog ____ barking."',['am','is','are','be'],1,'easy');
  _a('Basic 1','English','First letter of "elephant"?',['A','E','I','O'],1,'easy');
  _a('Basic 1','English','Which is a colour?',['Table','Red','Chair','Book'],1,'easy');
  _a('Basic 1','English','Opposite of "hot"?',['Warm','Cold','Cool','Mild'],1,'easy');
  _a('Basic 1','English','"I ___ a student."',['am','is','are','be'],0,'easy');
  _a('Basic 1','English','Which word has "b"?',['Apple','Cat','Ball','Dog'],2,'easy');
  _a('Basic 1','English','How many letters in "cat"?',['1','2','3','4'],2,'easy');
  _a('Basic 1','English','Fill: "She ____ a girl."',['am','is','are','be'],1,'easy');
  _a('Basic 1','English','Which is a fruit?',['Chair','Apple','Table','Book'],1,'easy');
  _a('Basic 1','English','What is the opposite of "up"?',['Down','Left','Right','Over'],0,'easy');
  _a('Basic 1','English','Which word means the same as "small"?',['Big','Tiny','Huge','Tall'],1,'easy');
  _a('Basic 1','English','Choose the correct: "They ___ playing."',['am','is','are','be'],2,'easy');
  _a('Basic 1','English','What colour is the sky?',['Green','Red','Blue','Yellow'],2,'easy');
  _a('Basic 1','Science','What colour are leaves?',['Red','Blue','Green','Yellow'],2,'easy');
  _a('Basic 1','Science','How many eyes do you have?',['1','2','3','4'],1,'easy');
  _a('Basic 1','Science','What do fish live in?',['Land','Water','Sky','Fire'],1,'easy');
  _a('Basic 1','Science','Which animal says "moo"?',['Dog','Cat','Cow','Sheep'],2,'easy');
  _a('Basic 1','Science','What part of the body do you see with?',['Ears','Eyes','Nose','Mouth'],1,'easy');
  _a('Basic 1','Science','How many legs does a bird have?',['1','2','3','4'],1,'easy');
  _a('Basic 1','Science','What do plants need to grow?',['Water only','Sunlight only','Water and sunlight','Nothing'],2,'easy');
  _a('Basic 1','Science','Which animal lives on a farm?',['Lion','Tiger','Cow','Bear'],2,'easy');
  _a('Basic 1','Science','What is water in solid form?',['Ice','Steam','Rain','Juice'],0,'easy');
  _a('Basic 1','Science','Which sense organ do you hear with?',['Eyes','Ears','Nose','Skin'],1,'easy');
  _a('Basic 1','Science','What does a plant have on its branches?',['Feet','Leaves','Fur','Scales'],1,'easy');
  _a('Basic 1','Science','Which animal can fly?',['Fish','Bird','Dog','Cat'],1,'easy');
  _a('Basic 1','Science','What is the sun?',['A planet','A star','A moon','A cloud'],1,'easy');
  _a('Basic 1','Science','What do cows give us?',['Eggs','Milk','Bread','Rice'],1,'easy');
  _a('Basic 1','Social Studies','Who is the father of a family?',['Mother','Father','Sister','Brother'],1,'easy');
  _a('Basic 1','Social Studies','What is the Nigerian flag colour?',['Red/white','Green/white','Blue/white','Green/yellow'],1,'easy');
  _a('Basic 1','Social Studies','Where do you live?',['School','Home','Market','Church'],1,'easy');
  _a('Basic 1','Social Studies','Who teaches in school?',['Doctor','Teacher','Driver','Farmer'],1,'easy');
  _a('Basic 1','Social Studies','What day comes after Monday?',['Sunday','Tuesday','Wednesday','Friday'],1,'easy');
  _a('Basic 1','Social Studies','Which is a Nigerian food?',['Pizza','Jollof rice','Sushi','Pasta'],1,'easy');
  _a('Basic 1','Social Studies','What do you wear on your feet?',['Hat','Shoes','Gloves','Scarf'],1,'easy');
  _a('Basic 1','Social Studies','Who is the president of Nigeria?',['Buhari','Tinubu','Obasanjo','YarAdua'],1,'medium');
  _a('Basic 1','Social Studies','Where do children learn?',['Market','School','Hospital','Bank'],1,'easy');
  _a('Basic 1','Social Studies','What is the name of your country?',['Ghana','Nigeria','Kenya','Mali'],1,'easy');

  // ===== BASIC 2 =====
  _g('Basic 2','Mathematics',20,function(i){return _addSub(i,20);});
  _g('Basic 2','Mathematics',8,function(i){return _mul(i,6,6);});
  _a('Basic 2','English','Correct: "She ____ to school."',['go','goes','going','gone'],1,'easy');
  _a('Basic 2','English','Correct spelling:',['Recieve','Receive','Receve','Reseive'],1,'easy');
  _a('Basic 2','English','Opposite of "happy"?',['Glad','Sad','Joyful','Excited'],1,'easy');
  _a('Basic 2','English','"The cat is _____ the table."',['on','in','at','under'],0,'easy');
  _a('Basic 2','English','What is a verb?',['Naming word','Action word','Describing word','Joining word'],1,'easy');
  _a('Basic 2','English','Which is correct? "He ___ a book."',['have','has','had','having'],1,'easy');
  _a('Basic 2','English','Fill: "They ___ happy."',['am','is','are','be'],2,'easy');
  _a('Basic 2','English','What is the plural of "child"?',['Childs','Childen','Children','Childes'],2,'easy');
  _a('Basic 2','English','Which is an adjective?',['Run','Beautiful','And','Quickly'],1,'easy');
  _a('Basic 2','English','Opposite of "clean"?',['Dirty','Neat','Fresh','Pure'],0,'easy');
  _a('Basic 2','English','Past tense of "walk"?',['Walked','Walking','Walks','Walk'],0,'easy');
  _a('Basic 2','English','"I ___ my homework yesterday."',['do','did','done','does'],1,'easy');
  _a('Basic 2','English','Which is a month?',['Monday','January','Summer','Morning'],1,'easy');
  _a('Basic 2','English','Choose the pronoun: "___ is my friend."',['Him','He','His','Her'],1,'easy');
  _a('Basic 2','English','Which word means "to look at"?',['See','Saw','Seen','Seeing'],0,'easy');
  _a('Basic 2','Science','What do fish use to breathe?',['Lungs','Gills','Skin','Mouth'],1,'easy');
  _a('Basic 2','Science','What is the boiling point of water?',['50C','100C','150C','200C'],1,'medium');
  _a('Basic 2','Science','Which animal lays eggs?',['Cow','Dog','Chicken','Horse'],2,'easy');
  _a('Basic 2','Science','What part of the plant is underground?',['Leaves','Stem','Roots','Flowers'],2,'easy');
  _a('Basic 2','Science','What is the largest animal?',['Elephant','Whale','Giraffe','Hippo'],1,'easy');
  _a('Basic 2','Science','What do we breathe in?',['Oxygen','Carbon dioxide','Nitrogen','Hydrogen'],0,'easy');
  _a('Basic 2','Science','Which planet do we live on?',['Mars','Venus','Earth','Jupiter'],2,'easy');
  _a('Basic 2','Science','What is the colour of the sky at night?',['Blue','Red','Black','White'],2,'easy');
  _a('Basic 2','Science','Which organ pumps blood?',['Lungs','Liver','Heart','Brain'],2,'easy');
  _a('Basic 2','Science','What do birds use to fly?',['Legs','Wings','Mouth','Tail'],1,'easy');
  _a('Basic 2','Science','What is ice made of?',['Water','Air','Soil','Wood'],0,'easy');
  _a('Basic 2','Science','Which animal has a long neck?',['Dog','Giraffe','Cat','Fish'],1,'easy');
  _a('Basic 2','Science','What gives us light during the day?',['Moon','Stars','Sun','Clouds'],2,'easy');
  _a('Basic 2','Social Studies','What is the capital of Nigeria?',['Lagos','Abuja','Kano','Ibadan'],1,'medium');
  _a('Basic 2','Social Studies','Who is the head of a family?',['Father','Mother','Child','Grandparent'],0,'easy');
  _a('Basic 2','Social Studies','What do you call a person who sells things?',['Teacher','Doctor','Trader','Farmer'],2,'easy');
  _a('Basic 2','Social Studies','Which is a means of transport?',['Car','Table','Chair','Bed'],0,'easy');
  _a('Basic 2','Social Studies','What is the first day of the week?',['Monday','Sunday','Tuesday','Saturday'],1,'easy');
  _a('Basic 2','Social Studies','How many local governments in Nigeria?',['774','700','800','750'],0,'hard');
  _a('Basic 2','Social Studies','What is the Nigerian currency?',['Cedi','Naira','Franc','Shilling'],1,'easy');
  _a('Basic 2','Social Studies','Who takes care of sick people?',['Teacher','Doctor','Engineer','Lawyer'],1,'easy');
  _a('Basic 2','Social Studies','What does "cleanliness" mean?',['Being dirty','Being neat','Being lazy','Being fast'],1,'easy');

  // ===== BASIC 3 =====
  _g('Basic 3','Mathematics',15,function(i){return _addSub(i,30);});
  _g('Basic 3','Mathematics',8,function(i){return _mul(i,7,7);});
  _a('Basic 3','Mathematics','What is 15 ÷ 3?',['3','5','7','4'],1,'medium');
  _a('Basic 3','Mathematics','What fraction is half?',['1/4','1/2','3/4','2/4'],1,'medium');
  _a('Basic 3','Mathematics','What is double of 9?',['16','18','20','14'],1,'easy');
  _a('Basic 3','Mathematics','Next: 2,4,6,8,?',['9','10','11','12'],1,'easy');
  _a('Basic 3','Mathematics','What is 100-30?',['60','70','80','90'],1,'medium');
  _a('Basic 3','Mathematics','How many minutes in an hour?',['30','45','60','100'],2,'easy');
  _a('Basic 3','Mathematics','What is 9+8?',['15','16','17','18'],2,'medium');
  _a('Basic 3','Mathematics','What is half of 50?',['20','25','30','35'],1,'medium');
  _a('Basic 3','English','What is a noun?',['Action word','Naming word','Describing word','Joining word'],1,'medium');
  _a('Basic 3','English','Synonym of "happy"?',['Sad','Joyful','Angry','Tired'],1,'easy');
  _a('Basic 3','English','"They ___ playing football."',['am','is','are','be'],2,'easy');
  _a('Basic 3','English','Correct: "He runs ____ than me."',['fast','faster','fastest','fastly'],1,'medium');
  _a('Basic 3','English','What is an adverb?',['Describes noun','Describes verb','Names thing','Joins words'],1,'medium');
  _a('Basic 3','English','Fill: "She ___ her lunch already."',['eat','eats','ate','eating'],2,'medium');
  _a('Basic 3','English','Which is a conjunction?',['Run','And','Beautiful','Quickly'],1,'easy');
  _a('Basic 3','English','Opposite of "first"?',['Second','Last','Next','Third'],1,'medium');
  _a('Basic 3','English','Correct spelling meaning "a place to live":',['House','Hous','Howse','Hause'],0,'easy');
  _a('Basic 3','English','"We ___ going to the market."',['am','is','are','be'],2,'easy');
  _a('Basic 3','English','Which is a collective noun?',['Flock','Run','Sweet','Tall'],0,'medium');
  _a('Basic 3','English','What does "quickly" describe?',['A noun','A verb','An adjective','A pronoun'],1,'medium');
  _a('Basic 3','Science','Which sense organ for hearing?',['Eye','Nose','Ear','Tongue'],2,'easy');
  _a('Basic 3','Science','What part absorbs water?',['Leaves','Stem','Roots','Flowers'],2,'easy');
  _a('Basic 3','Science','Which is a mammal?',['Fish','Snake','Dog','Lizard'],2,'easy');
  _a('Basic 3','Science','What causes day and night?',['Moon','Sun movement','Earth rotation','Stars'],2,'medium');
  _a('Basic 3','Science','What is water vapour?',['Solid water','Gas water','Liquid water','Ice'],1,'medium');
  _a('Basic 3','Science','Which sense do you use to smell?',['Eyes','Ears','Nose','Skin'],2,'easy');
  _a('Basic 3','Science','What is the skeleton for?',['Support body','Digest food','Pump blood','Breathe'],0,'medium');
  _a('Basic 3','Science','What is the biggest planet?',['Earth','Mars','Jupiter','Saturn'],2,'medium');
  _a('Basic 3','Science','What do plants produce?',['Carbon dioxide','Oxygen','Nitrogen','Hydrogen'],1,'medium');
  _a('Basic 3','Social Studies','Who is the father of a family?',['Mother','Father','Sister','Brother'],1,'easy');
  _a('Basic 3','Social Studies','Nigerian currency?',['Cedi','Naira','Franc','Dollar'],1,'easy');
  _a('Basic 3','Social Studies','What is a community?',['A person','Group living together','A building','A country'],1,'medium');
  _a('Basic 3','Social Studies','Who makes laws in Nigeria?',['President','Senate','Judges','Police'],1,'medium');
  _a('Basic 3','Social Studies','Which ethnic group is largest?',['Igbo','Yoruba','Hausa','Ijaw'],2,'medium');
  _a('Basic 3','Social Studies','What is marriage?',['Union of two people','A party','A job','A school'],0,'medium');
  _a('Basic 3','Social Studies','How many states in Nigeria?',['34','35','36','37'],2,'medium');
  _a('Basic 3','Social Studies','Which ocean borders Nigeria?',['Indian','Atlantic','Pacific','Arctic'],1,'medium');

  // ===== BASIC 4 =====
  _g('Basic 4','Mathematics',15,function(i){return _addSub(i,50);});
  _g('Basic 4','Mathematics',10,function(i){return _mul(i,8,8);});
  _a('Basic 4','Mathematics','What is 3/4 as decimal?',['0.25','0.5','0.75','1.0'],2,'medium');
  _a('Basic 4','Mathematics','Perimeter of square side 5cm?',['15cm','20cm','25cm','10cm'],1,'medium');
  _a('Basic 4','Mathematics','LCM of 4 and 6?',['10','12','14','24'],1,'medium');
  _a('Basic 4','Mathematics','Which is a proper noun?',['City','Lagos','River','Country'],1,'medium');
  _a('Basic 4','Mathematics','What is 1/4 of 100?',['20','25','30','40'],1,'medium');
  _a('Basic 4','Mathematics','How many sides in a hexagon?',['4','5','6','8'],2,'medium');
  _a('Basic 4','Mathematics','What is 7x8?',['54','56','58','62'],1,'medium');
  _a('Basic 4','Mathematics','Area of rectangle 6cm by 4cm?',['20cm2','24cm2','28cm2','30cm2'],1,'medium');
  _a('Basic 4','Mathematics','Round 47 to nearest ten?',['40','45','50','55'],2,'medium');
  _a('Basic 4','Mathematics','What is 2+3x4?',['20','14','24','12'],1,'hard');
  _a('Basic 4','English','Identify verb: "The boy ran."',['Boy','Ran','Quickly','The'],1,'medium');
  _a('Basic 4','English','What is a preposition?',['Action word','Position word','Naming word','Describing word'],1,'medium');
  _a('Basic 4','English','Which is a compound sentence?',['I went home.','I went home and ate.','Going home.','Home sweet home.'],1,'medium');
  _a('Basic 4','English','Correct: "Neither the teacher ___ the students."',['or','nor','and','but'],1,'medium');
  _a('Basic 4','English','What is an antonym?',['Same meaning','Opposite meaning','Rhyming word','Describing word'],1,'easy');
  _a('Basic 4','English','Which is a simile?',['He is a lion','He runs like a lion','He is brave','He is strong'],1,'medium');
  _a('Basic 4','English','Fill: "If I ___ rich, I would travel."',['am','was','were','be'],2,'medium');
  _a('Basic 4','English','What is the subject in "Dogs bark"?',['Dogs','Bark','The','Dogs bark'],0,'medium');
  _a('Basic 4','English','Correct: "Each of the boys ___ a book."',['have','has','had','having'],1,'medium');
  _a('Basic 4','English','What is a clause?',['A word','Group with subject+verb','A sentence','A paragraph'],1,'medium');
  _a('Basic 4','English','Which is a linking verb?',['Run','Is','Jump','Sing'],1,'medium');
  _a('Basic 4','English','Opposite of "ancient"?',['Old','Modern','Aged','Historic'],1,'medium');
  _a('Basic 4','English','Correct meaning of "bicycle"?',['Car','Two-wheeled vehicle','Motorcycle','Scooter'],1,'medium');
  _a('Basic 4','Science','Largest planet in our solar system?',['Earth','Mars','Jupiter','Saturn'],2,'medium');
  _a('Basic 4','Science','What is a renewable energy source?',['Coal','Natural gas','Solar','Diesel'],2,'medium');
  _a('Basic 4','Science','What is the function of the heart?',['Digest food','Pump blood','Filter air','Store energy'],1,'medium');
  _a('Basic 4','Science','What are the states of matter?',['Solid,liquid,gas','Hot,cold,warm','Big,small,medium','Fast,slow'],0,'medium');
  _a('Basic 4','Science','What is the chemical symbol for water?',['H2O','CO2','NaCl','O2'],0,'medium');
  _a('Basic 4','Science','Which organ helps us digest food?',['Heart','Stomach','Lungs','Brain'],1,'medium');
  _a('Basic 4','Science','What causes rust on iron?',['Heat','Cold','Oxidation','Friction'],2,'medium');
  _a('Basic 4','Science','What is the largest ocean?',['Atlantic','Indian','Pacific','Arctic'],2,'medium');
  _a('Basic 4','Science','Which gas do plants absorb?',['Oxygen','CO2','Nitrogen','Hydrogen'],1,'medium');
  _a('Basic 4','Science','What is a mammal?',['Fish','Snake','Whale','Lizard'],2,'medium');
  _a('Basic 4','Social Studies','Capital of Nigeria?',['Lagos','Abuja','Kano','Ibadan'],1,'medium');
  _a('Basic 4','Social Studies','Nigerian flag colours?',['Red/white','Green/white','Blue/white','Green/yellow'],1,'easy');
  _a('Basic 4','Social Studies','Who founded Nigeria?',['Colonial Britain','Portugal','France','Spain'],0,'hard');
  _a('Basic 4','Social Studies','What is culture?',['Way of life','Government','Economy','Geography'],0,'medium');
  _a('Basic 4','Social Studies','Which is a Nigerian language?',['Swahili','Yoruba','Zulu','Amharic'],1,'easy');
  _a('Basic 4','Social Studies','What is democracy?',['Rule by one','Rule by people','Rule by military','Rule by rich'],1,'medium');
  _a('Basic 4','Social Studies','Nigeria\'s independence year?',['1957','1960','1963','1965'],1,'medium');

  // ===== BASIC 5 =====
  _g('Basic 5','Mathematics',15,function(i){return _addSub(i,100);});
  _g('Basic 5','Mathematics',10,function(i){return _mul(i,9,9);});
  _a('Basic 5','Mathematics','What is 25% of 200?',['25','50','75','100'],1,'medium');
  _a('Basic 5','Mathematics','Convert 0.5 to fraction:',['1/4','1/3','1/2','3/4'],2,'medium');
  _a('Basic 5','Mathematics','What is the area of triangle base 8cm, height 5cm?',['20cm2','30cm2','40cm2','13cm2'],0,'medium');
  _a('Basic 5','Mathematics','What is the mode of: 2,3,3,5,7?',['2','3','5','7'],1,'medium');
  _a('Basic 5','Mathematics','Simplify: 12/16',['3/4','2/3','4/5','6/8'],0,'medium');
  _a('Basic 5','Mathematics','What is 3+7×2?',['17','20','14','24'],0,'hard');
  _a('Basic 5','Mathematics','Find 2/3 of 60:',['20','30','40','50'],2,'medium');
  _a('Basic 5','Mathematics','What is the square of 9?',['18','27','81','99'],2,'medium');
  _a('Basic 5','Mathematics','How many degrees in a circle?',['180','270','360','90'],2,'medium');
  _a('Basic 5','Mathematics','Roman numeral for 50?',['X','L','C','D'],1,'medium');
  _a('Basic 5','English','Which is a compound sentence?',['I went home.','I went home and ate.','Going home.','Home sweet home.'],1,'medium');
  _a('Basic 5','English','What is a preposition?',['Action word','Position word','Naming word','Describing word'],1,'medium');
  _a('Basic 5','English','Replace pronoun: "John and I went"',['We went','They went','He went','She went'],0,'medium');
  _a('Basic 5','English','Correct: "The book, ___ is on the table, is mine."',['who','which','whom','whose'],1,'medium');
  _a('Basic 5','English','What is an interjection?',['A greeting','A sudden exclamation','A question','A command'],1,'medium');
  _a('Basic 5','English','Which tense: "She had gone"',['Present','Past','Past perfect','Future'],2,'medium');
  _a('Basic 5','English','Correct: "He is the ___ boy."',['tall','taller','tallest','most tall'],2,'medium');
  _a('Basic 5','English','What is an idiom?',['A figure of speech','A literal meaning','A type of verb','A punctuation'],0,'medium');
  _a('Basic 5','English','Active to passive: "The cat ate the fish."',['The fish ate the cat','The fish was eaten by the cat','The cat was eaten','The fish eats the cat'],1,'hard');
  _a('Basic 5','English','Which is a prefix?',['-ing','un-','-ed','-ly'],1,'medium');
  _a('Basic 5','English','What is the object in "She kicked the ball"?',['She','kicked','the ball','She kicked'],2,'medium');
  _a('Basic 5','English','Correct the sentence: "He do his work."',['He does his work','He did his work','He doing his work','He done his work'],0,'medium');
  _a('Basic 5','Science','What is the powerhouse of the cell?',['Nucleus','Mitochondria','Ribosome','Membrane'],1,'medium');
  _a('Basic 5','Science','Three states of matter?',['Solid,liquid,gas','Hot,cold,warm','Big,small,medium','Fast,slow,steady'],0,'medium');
  _a('Basic 5','Science','What causes day and night?',['Moon','Earth rotation','Sun moving','Clouds'],1,'medium');
  _a('Basic 5','Science','Which is a non-renewable resource?',['Solar','Wind','Coal','Water'],2,'medium');
  _a('Basic 5','Science','What is the function of the kidneys?',['Pump blood','Filter waste','Digest food','Store energy'],1,'medium');
  _a('Basic 5','Science','What is a food chain?',['Transfer of energy','A recipe','A type of food','A diet plan'],0,'medium');
  _a('Basic 5','Science','Which planet is known as the red planet?',['Venus','Mars','Jupiter','Saturn'],1,'medium');
  _a('Basic 5','Science','What is evaporation?',['Gas to liquid','Liquid to gas','Solid to liquid','Liquid to solid'],1,'medium');
  _a('Basic 5','Science','What is the function of the skeleton?',['Support and protect','Digest food','Pump blood','Breathe'],0,'medium');
  _a('Basic 5','Social Studies','Largest ethnic group in Nigeria?',['Igbo','Yoruba','Hausa','Ijaw'],2,'medium');
  _a('Basic 5','Social Studies','Which ocean borders Nigeria?',['Indian','Atlantic','Pacific','Arctic'],1,'medium');
  _a('Basic 5','Social Studies','What is the highest court?',['High Court','Appeal Court','Supreme Court','Magistrate'],2,'medium');
  _a('Basic 5','Social Studies','Who was first president of Nigeria?',['Azikiwe','Balewa','Obasanjo','YarAdua'],0,'hard');
  _a('Basic 5','Social Studies','What is the population of Nigeria approx?',['100M','150M','200M','250M'],2,'medium');
  _a('Basic 5','Social Studies','What is a federal system?',['Central govt only','Shared power central+states','Local govt only','No government'],1,'medium');
  _a('Basic 5','Social Studies','What is the name of Nigeria\'s national anthem?',['Arise O Compatriots','Nigeria We Hail Thee','God Bless Nigeria','Land of the Rising Sun'],0,'medium');

  // ===== BASIC 6 — COMMON ENTRANCE =====
  _g('Basic 6','Mathematics',20,function(i){return _addSub(i,100);});
  _g('Basic 6','Mathematics',10,function(i){return _mul(i,12,12);});
  _a('Basic 6','Mathematics','Speed: 240km in 3hrs?',['60','80','90','120'],1,'hard');
  _a('Basic 6','Mathematics','Solve: 2x+5=15, x=?',['3','5','7','10'],1,'hard');
  _a('Basic 6','Mathematics','Area of rectangle 48cm2, width 6cm, length?',['6cm','8cm','10cm','12cm'],1,'hard');
  _a('Basic 6','Mathematics','Mean of 5,10,15,20,25?',['10','15','20','12.5'],1,'medium');
  _a('Basic 6','Mathematics','12 × 11 = ?',['121','132','144','110'],1,'medium');
  _a('Basic 6','Mathematics','Cost of one pencil if 15 cost ₦300?',['₦10','₦15','₦20','₦25'],2,'medium');
  _a('Basic 6','Mathematics','Prime factors of 12?',['2×2×3','2×6','3×4','12×1'],0,'medium');
  _a('Basic 6','Mathematics','What is the LCD of 3 and 5?',['3','5','15','30'],2,'medium');
  _a('Basic 6','Mathematics','Find 1/5 of 200?',['20','40','50','60'],1,'medium');
  _a('Basic 6','Mathematics','What is 0.25 + 0.5?',['0.75','0.25','0.50','1.0'],0,'medium');
  _a('Basic 6','Mathematics','What is the range of 5,8,12,15?',['5','10','15','20'],1,'medium');
  _a('Basic 6','English','Meaning of "benevolent"?',['Angry','Kind','Fearful','Lazy'],1,'hard');
  _a('Basic 6','English','Figure of speech: wind whispered',['Simile','Metaphor','Personification','Alliteration'],2,'hard');
  _a('Basic 6','English','Correct punctuation: "What is your name"',['What is your name','What is your name?','What is your name!','what is your name'],1,'medium');
  _a('Basic 6','English','Antonym of "dark"?',['Night','Light','Dull','Shadow'],1,'easy');
  _a('Basic 6','English','What is an antonym?',['Same meaning','Opposite meaning','Rhyming word','Describing word'],1,'medium');
  _a('Basic 6','English','Which is a complex sentence?',['I went home.','I went home because I was tired.','I went home and ate.','Home is sweet.'],1,'hard');
  _a('Basic 6','English','Identify the clause: "who came late" is a:',['Main clause','Subordinate clause','Phrase','Sentence'],1,'hard');
  _a('Basic 6','English','Correct: "I have ___ to school."',['go','went','gone','going'],2,'medium');
  _a('Basic 6','English','Which is a conjunction?',['Beautiful','Because','Quickly','Slowly'],1,'medium');
  _a('Basic 6','English','What is a prefix?',['Letter at the beginning','Letter at the end','Middle letter','Whole word'],0,'medium');
  _a('Basic 6','English','Fill: "Neither the teacher ___ the students."',['or','nor','and','but'],1,'medium');
  _a('Basic 6','English','What is an abstract noun?',['Table','Love','Book','Chair'],1,'medium');
  _a('Basic 6','English','Change to reported speech: "I am tired"',['He said he is tired','He said he was tired','He said I am tired','He said he tired'],1,'hard');
  _a('Basic 6','English','Which is an oxymoron?',['Jumbo shrimp','Big dog','Red rose','Cold water'],0,'hard');
  _a('Basic 6','English','What is a palindrome?',['Forward only word','Same forward/backward','Longest word','Rhyming word'],1,'medium');
  _a('Basic 6','General Studies','Chemical symbol for water?',['H2O','CO2','NaCl','O2'],0,'hard');
  _a('Basic 6','General Studies','Powerhouse of the cell?',['Nucleus','Mitochondria','Ribosome','Membrane'],1,'hard');
  _a('Basic 6','General Studies','Governor of CBN?',['Emefiele','Sanusi','Cardoso','Soludo'],2,'hard');
  _a('Basic 6','General Studies','How many states in Nigeria?',['34','35','36','37'],2,'medium');
  _a('Basic 6','General Studies','Nigeria independence year?',['1957','1960','1963','1965'],1,'medium');
  _a('Basic 6','General Studies','Heart pumps blood to:',['Lungs','Liver','Heart','Kidney'],2,'easy');
  _a('Basic 6','General Studies','Longest river in Nigeria?',['Benue','Niger','Cross','Imo'],1,'medium');
  _a('Basic 6','General Studies','Main source of energy on Earth?',['Moon','Sun','Stars','Geothermal'],1,'easy');
  _a('Basic 6','General Studies','Largest continent?',['Africa','Asia','Europe','America'],1,'medium');
  _a('Basic 6','General Studies','Who wrote Things Fall Apart?',['Achebe','Soyinka','Adichie','Okri'],0,'medium');
  _a('Basic 6','General Studies','Tallest mountain in Africa?',['Kilimanjaro','Everest','Matterhorn','Atlas'],0,'medium');
  _a('Basic 6','General Studies','Number of local governments in Nigeria?',['700','774','800','750'],1,'hard');
  _a('Basic 6','General Studies','Nigerian first republic president?',['Azikiwe','Balewa','Obasanjo','YarAdua'],0,'hard');
  _a('Basic 6','General Studies','Which is a Nigerian mineral resource?',['Gold','Diamond','Crude oil','All'],3,'medium');
  _a('Basic 6','General Studies','Capital of Niger State?',['Minna','Lagos','Abuja','Ibadan'],0,'medium');
  _a('Basic 6','General Studies','Slogan: "Giant of Africa"?',['Ghana','Nigeria','South Africa','Kenya'],1,'easy');
  _a('Basic 6','General Studies','What is HIV?',['A virus','A bacteria','A fungus','A parasite'],0,'medium');
  _a('Basic 6','General Studies','Full meaning of UNICEF?',['United Nations...','Universal...','Union...','United...'],0,'hard');
  _a('Basic 6','General Studies','Which organ purifies blood?',['Heart','Kidney','Liver','Lungs'],1,'medium');
  _a('Basic 6','General Studies','Speed of light approx?',['3×10^6','3×10^8','3×10^10','3×10^4'],1,'hard');
  _a('Basic 6','General Studies','Father of Nigeria\'s independence?',['Azikiwe','Balewa','Awolowo','Akintola'],0,'hard');
  _a('Basic 6','General Studies','Nigeria became republic in?',['1960','1961','1963','1965'],2,'medium');

  // ===== JSS 1 =====
  _g('JSS 1','Mathematics',15,function(i){return _addSub(i,200);});
  _g('JSS 1','Mathematics',10,function(i){return _mul(i,10,10);});
  _a('JSS 1','Mathematics','Simplify: 3(a+2b)-2(a-b)',['a+8b','a+4b','5a+4b','a-8b'],0,'medium');
  _a('JSS 1','Mathematics','Place value of 7 in 3,785?',['7','70','700','7000'],2,'easy');
  _a('JSS 1','Mathematics','Convert 1011 binary to decimal:',['9','10','11','12'],2,'hard');
  _a('JSS 1','Mathematics','What is the square root of 144?',['10','11','12','13'],2,'medium');
  _a('JSS 1','Mathematics','Find LCM of 6 and 8?',['12','16','24','48'],2,'medium');
  _a('JSS 1','Mathematics','What is 20% of 250?',['25','50','75','100'],1,'medium');
  _a('JSS 1','Mathematics','Simplify: 3/4 + 5/6',['19/12','8/10','15/24','9/12'],0,'hard');
  _a('JSS 1','English','What is a metaphor?',['Like/as comparison','Direct comparison','Repeated sound','Exaggeration'],1,'medium');
  _a('JSS 1','English','Past tense of "go"?',['Goed','Went','Gone','Going'],1,'easy');
  _a('JSS 1','English','What is an essay?',['A poem','A written composition','A speech','A story'],1,'medium');
  _a('JSS 1','English','Identify noun phrase: "The big red ball"',['Big red ball','The big red ball','Red ball','Ball'],1,'medium');
  _a('JSS 1','English','Correct: "You, he and ___ went."',['I','me','my','mine'],0,'medium');
  _a('JSS 1','English','What is a synonym?',['Opposite word','Same meaning word','Rhyming word','Long word'],1,'medium');
  _a('JSS 1','English','"Either John ___ Peter will come."',['or','nor','and','but'],0,'medium');
  _a('JSS 1','English','What is alliteration?',['Repeated vowel','Repeated consonant','Repeated word','Rhyme'],1,'medium');
  _a('JSS 1','English','Fill: "He ___ to school every day."',['go','goes','going','gone'],1,'easy');
  _a('JSS 1','English','Which is a reflexive pronoun?',['Himself','His','He','Him'],0,'medium');
  _a('JSS 1','English','What is the opposite of "generous"?',['Kind','Stingy','Brave','Smart'],1,'medium');
  _a('JSS 1','English','Correct: "The news ___ good."',['are','is','were','have been'],1,'medium');
  _a('JSS 1','Basic Science','Boiling point of water?',['90C','100C','110C','120C'],1,'easy');
  _a('JSS 1','Basic Science','What is matter?',['Anything with weight','Anything with mass+space','Only liquids','Only solids'],1,'medium');
  _a('JSS 1','Basic Science','What is an atom?',['Smallest particle of an element','A molecule','A cell','A proton'],0,'medium');
  _a('JSS 1','Basic Science','What is diffusion?',['Movement from high to low concentration','Mixing only','Separation','Boiling'],0,'medium');
  _a('JSS 1','Basic Science','What is a habitat?',['A home of an organism','A type of food','A weather pattern','A body part'],0,'medium');
  _a('JSS 1','Basic Science','What is force?',['A push or pull','A type of energy','A speed','A weight'],0,'medium');
  _a('JSS 1','Basic Science','What is the SI unit of mass?',['Gram','Kilogram','Pound','Tonne'],1,'easy');
  _a('JSS 1','Basic Science','What is an element?',['A pure substance','A mixture','A solution','A compound'],0,'medium');
  _a('JSS 1','Basic Science','What is the function of the nucleus?',['Energy production','Control centre','Protein synthesis','Storage'],1,'medium');
  _a('JSS 1','Basic Technology','What does a lever do?',['Multiply force','Store energy','Measure weight','Cut materials'],0,'medium');
  _a('JSS 1','Basic Technology','What is ICT?',['Internet Computing Tech','Info and Comm Tech','Integrated Comp Training','International Comp Trade'],1,'easy');
  _a('JSS 1','Basic Technology','What is a machine?',['A device that makes work easier','A computer','A vehicle','A tool'],0,'medium');
  _a('JSS 1','Basic Technology','What does a screw do?',['Cut wood','Hold things together','Measure length','Drill holes'],1,'medium');
  _a('JSS 1','Basic Technology','What is a wedge?',['A simple machine','A type of lever','A pulley','A gear'],0,'medium');
  _a('JSS 1','Social Studies','What is the family?',['Group of friends','Group related by blood/marriage','School club','Sports team'],1,'easy');
  _a('JSS 1','Social Studies','Capital of Nigeria?',['Lagos','Abuja','Port Harcourt','Kaduna'],1,'easy');
  _a('JSS 1','Social Studies','What is socialization?',['Learning to interact in society','Playing games','Going to school','Watching TV'],0,'medium');
  _a('JSS 1','Social Studies','Which is a value in Nigeria?',['Honesty','Dishonesty','Greed','Laziness'],0,'medium');
  _a('JSS 1','Social Studies','What is a nuclear family?',['Father+mother+children','Extended relatives','Grandparents only','Single person'],0,'medium');
  _a('JSS 1','Social Studies','What is culture?',['Way of life of a people','Government structure','Economic system','Geographic features'],0,'medium');
  _a('JSS 1','Social Studies','What is a right?',['A privilege','An entitlement','A duty','A law'],1,'medium');
  _a('JSS 1','Social Studies','Who is a citizen?',['A legal member of a country','A visitor','A tourist','A resident'],0,'medium');

  // ===== JSS 2 =====
  _g('JSS 2','Mathematics',15,function(i){return _addSub(i,500);});
  _g('JSS 2','Mathematics',10,function(i){return _mul(i,12,12);});
  _a('JSS 2','Mathematics','Gradient of y=3x+2?',['2','3','-2','-3'],1,'medium');
  _a('JSS 2','Mathematics','Expand (x+3)(x-2)',['x2+x-6','x2-x-6','x2+5x-6','x2-5x-6'],0,'medium');
  _a('JSS 2','Mathematics','Solve: 2x+3=11',['3','4','5','6'],1,'medium');
  _a('JSS 2','Mathematics','What is the median of 3,7,9,12,15?',['7','9','12','15'],1,'medium');
  _a('JSS 2','Mathematics','What is 3^4?',['27','64','81','243'],2,'medium');
  _a('JSS 2','Mathematics','Find HCF of 12 and 18?',['2','3','6','9'],2,'medium');
  _a('JSS 2','Mathematics','Simplify: 2/3 ÷ 4/5',['10/12','5/6','8/15','5/8'],1,'medium');
  _a('JSS 2','Mathematics','What is the cube root of 27?',['2','3','4','5'],1,'medium');
  _a('JSS 2','Mathematics','What is the formula for area of a circle?',['πr2','2πr','πd','πr'],0,'medium');
  _a('JSS 2','English','Type of essay that tells a story?',['Descriptive','Narrative','Argumentative','Expository'],1,'medium');
  _a('JSS 2','English','What is an adverb?',['Describes noun','Describes verb','Names thing','Joins sentences'],1,'medium');
  _a('JSS 2','English','Difference between "affect" and "effect"?',['Same meaning','Affect verb, Effect noun','Affect noun, Effect verb','No difference'],1,'medium');
  _a('JSS 2','English','Correct: "I wish I ___ there."',['was','were','am','is'],1,'medium');
  _a('JSS 2','English','What is a subordinate clause?',['Main idea','Depends on main clause','A phrase','A word'],1,'medium');
  _a('JSS 2','English','Identify: "The classroom was a zoo"',['Simile','Metaphor','Irony','Hyperbole'],1,'medium');
  _a('JSS 2','English','What is an intransitive verb?',['Takes object','No object','Linking verb','Auxiliary'],1,'medium');
  _a('JSS 2','English','Correct: "Neither the teachers ___ the students."',['or','nor','and','but'],1,'medium');
  _a('JSS 2','English','What is the function of a colon?',['End sentence','Introduce list','Show possession','Join clauses'],1,'medium');
  _a('JSS 2','English','Which is a gerund?',['Running','Ran','Runs','Run'],0,'medium');
  _a('JSS 2','Basic Science','Function of red blood cells?',['Fight infection','Carry oxygen','Clot blood','Produce antibodies'],1,'medium');
  _a('JSS 2','Basic Science','What is an ecosystem?',['Community+environment','Single organism','Weather pattern','Rock type'],0,'medium');
  _a('JSS 2','Basic Science','What is photosynthesis?',['Plant respiration','Light to chemical energy','Water absorption','Nutrient transport'],1,'medium');
  _a('JSS 2','Basic Science','What is an acid?',['pH<7','pH=7','pH>7','pH=0'],0,'medium');
  _a('JSS 2','Basic Science','What is excretion?',['Removal of waste','Taking in food','Digestion','Circulation'],0,'medium');
  _a('JSS 2','Basic Science','What is a catalyst?',['Speeds up reaction','Slows reaction','Stops reaction','No effect'],0,'medium');
  _a('JSS 2','Basic Science','What is the function of the spinal cord?',['Transmit nerve signals','Pump blood','Filter air','Digest food'],0,'medium');
  _a('JSS 2','Basic Technology','Full meaning of ICT?',['Internet Computing Tech','Info and Comm Tech','Integrated Comp Training','International Comp Trade'],1,'easy');
  _a('JSS 2','Basic Technology','Function of a transistor?',['Store charge','Amplify/switch signals','Generate current','Measure resistance'],1,'hard');
  _a('JSS 2','Basic Technology','What is a flowchart used for?',['Drawing','Programming logic','Accounting','Measurements'],1,'medium');
  _a('JSS 2','Basic Technology','What is a gear used for?',['Transmit motion','Measure time','Store data','Generate power'],0,'medium');
  _a('JSS 2','Basic Technology','What does CPU stand for?',['Central Process Unit','Central Processing Unit','Computer Personal Unit','Core Process Unit'],1,'easy');
  _a('JSS 2','Social Studies','What is democracy?',['Rule by one','Rule by people','Rule by military','Rule by rich'],1,'medium');
  _a('JSS 2','Social Studies','Which constitution introduced presidential system?',['1960','1963','1979','1999'],2,'hard');
  _a('JSS 2','Social Studies','Highest court in Nigeria?',['High Court','Appeal Court','Supreme Court','Magistrate'],2,'medium');
  _a('JSS 2','Social Studies','What is federalism?',['Centralized govt','Shared power central+regional','Local only','International'],1,'medium');
  _a('JSS 2','Social Studies','What is drug abuse?',['Proper medication','Misuse of drugs','Exercise','Healthy eating'],1,'medium');
  _a('JSS 2','Social Studies','What is the meaning of HIV?',['Human Immunity Virus','Human Immunodeficiency Virus','Human Infection Virus','Health Issue Virus'],1,'medium');

  // ===== JSS 3 — BECE =====
  _g('JSS 3','Mathematics',20,function(i){return _addSub(i,1000);});
  _g('JSS 3','Mathematics',10,function(i){return _mul(i,15,15);});
  _a('JSS 3','Mathematics','Solve: 3x-7=2x+5',['10','12','14','16'],1,'hard');
  _a('JSS 3','Mathematics','Volume of cylinder r=7cm h=10cm π=22/7',['1540','1500','1450','1600'],0,'hard');
  _a('JSS 3','Mathematics','Probability of rolling even on die?',['1/6','1/3','1/2','2/3'],2,'medium');
  _a('JSS 3','Mathematics','Median of 3,7,9,12,15?',['7','9','12','15'],1,'medium');
  _a('JSS 3','Mathematics','Simple interest on ₦50k at 5% for 2yrs?',['₦2,500','₦5,000','₦7,500','₦10,000'],1,'hard');
  _a('JSS 3','Mathematics','Find x: 2(x-3)=12',['6','7','8','9'],2,'medium');
  _a('JSS 3','Mathematics','Area of triangle base 10cm height 6cm?',['20','30','40','60'],1,'medium');
  _a('JSS 3','Mathematics','What is the product of 15 and 12?',['150','160','170','180'],3,'medium');
  _a('JSS 3','Mathematics','Convert 25% to decimal?',['0.025','0.25','2.5','0.0025'],1,'medium');
  _a('JSS 3','Mathematics','What is the mode of 2,3,3,5,7,7,7?',['2','3','5','7'],3,'medium');
  _a('JSS 3','Mathematics','What is the LCM of 8, 12 and 18?',['36','48','72','96'],2,'hard');
  _a('JSS 3','Mathematics','Simplify: 5+3×4-2',['10','15','18','20'],1,'hard');
  _a('JSS 3','English','Spelling: "a written account of events"',['Narative','Narrative','Narrativ','Nerative'],1,'medium');
  _a('JSS 3','English','"The classroom was a zoo" is a?',['Simile','Metaphor','Irony','Hyperbole'],1,'medium');
  _a('JSS 3','English','Change to passive: "The boy ate the mango."',['Mango was eaten by boy','Mango is eaten by boy','Mango ate boy','Boy was eaten'],0,'hard');
  _a('JSS 3','English','"If I _____ rich, I would travel."',['am','was','were','be'],2,'hard');
  _a('JSS 3','English','Meaning of the idiom "bite the bullet"?',['Eat quickly','Face unpleasant situation','Fight hard','Shoot a gun'],1,'hard');
  _a('JSS 3','English','What is a complex sentence?',['One clause','Main+subordinate clause','Two main clauses','No clause'],1,'medium');
  _a('JSS 3','English','Correct: "He has ___ to Lagos."',['go','went','gone','going'],2,'medium');
  _a('JSS 3','English','What is the antonym of "brave"?',['Bold','Cowardly','Strong','Fearless'],1,'medium');
  _a('JSS 3','English','Which is a relative pronoun?',['Who','He','She','It'],0,'medium');
  _a('JSS 3','English','Identify the prepositional phrase: "He sat on the chair."',['He sat','on the chair','sat on','the chair'],1,'medium');
  _a('JSS 3','English','What is the past perfect tense of "eat"?',['ate','has eaten','had eaten','was eating'],2,'medium');
  _a('JSS 3','English','What does the prefix "un-" mean?',['Again','Not','Before','After'],1,'medium');
  _a('JSS 3','English','Correct: "He is the ___ of the two."',['tall','taller','tallest','more tall'],1,'medium');
  _a('JSS 3','English','Which is a collective noun?',['Team','Run','Happy','Carefully'],0,'medium');
  _a('JSS 3','Basic Science','Formula for pressure?',['P=F×A','P=F/A','P=A/F','P=F+A'],1,'hard');
  _a('JSS 3','Basic Science','What causes rusting?',['Heat','Cold','Oxidation','Friction'],2,'medium');
  _a('JSS 3','Basic Science','Vitamin produced by sunlight?',['A','B','C','D'],3,'medium');
  _a('JSS 3','Basic Science','Most abundant gas in atmosphere?',['Oxygen','Nitrogen','CO2','Argon'],1,'medium');
  _a('JSS 3','Basic Science','Chemical symbol for Sodium?',['So','Sd','Na','Nd'],2,'medium');
  _a('JSS 3','Basic Science','What is a compound?',['Two+ elements bonded','A mixture','An element','A solution'],0,'medium');
  _a('JSS 3','Basic Science','What is the pH of pure water?',['0','7','14','1'],1,'medium');
  _a('JSS 3','Basic Science','What is the function of the liver?',['Pump blood','Filter toxins','Digest food','Store oxygen'],1,'medium');
  _a('JSS 3','Basic Science','What is a contraceptive?',['Prevents pregnancy','Kills germs','Treats disease','Cures infection'],0,'medium');
  _a('JSS 3','Basic Science','What is the life process of reproduction?',['Producing offspring','Eating','Moving','Breathing'],0,'medium');
  _a('JSS 3','Basic Technology','What is a motherboard?',['Brain of computer','Main circuit board','Power supply','Storage device'],1,'medium');
  _a('JSS 3','Basic Technology','What does RAM stand for?',['Read Access Memory','Random Access Memory','Run Application Module','Rapid Action Memory'],1,'easy');
  _a('JSS 3','Basic Technology','What is a flowchart used for?',['Drawing','Programming logic','Accounting','Measurements'],1,'medium');
  _a('JSS 3','Basic Technology','What does ROM stand for?',['Random Only Memory','Read Only Memory','Run On Memory','Real Output Memory'],1,'easy');
  _a('JSS 3','Basic Technology','What is a computer virus?',['A program that replicates and harms','A hardware problem','A type of bug','A system error'],0,'medium');
  _a('JSS 3','Social Studies','Constitution that introduced presidential system?',['1960','1963','1979','1999'],2,'hard');
  _a('JSS 3','Social Studies','Highest court in Nigeria?',['High Court','Appeal Court','Supreme Court','Magistrate'],2,'medium');
  _a('JSS 3','Social Studies','Meaning of "culture"?',['Way of life of a people','Government structure','Economic system','Geographical features'],0,'medium');
  _a('JSS 3','Social Studies','Which is a Nigerian language?',['Swahili','Yoruba','Zulu','Amharic'],1,'easy');
  _a('JSS 3','Social Studies','What is marriage?',['Union of man and woman','A party','A job','A school'],0,'medium');
  _a('JSS 3','Social Studies','What is the population of Nigeria?',['~100M','~150M','~200M','~250M'],2,'medium');
  _a('JSS 3','Social Studies','What is human trafficking?',['Legal migration','Illegal trade of humans','Traveling','Job search'],1,'medium');

  // ===== SSS 1 =====
  _g('SSS 1','Mathematics',20,function(i){return _addSub(i,1000);});
  _g('SSS 1','Mathematics',10,function(i){return _mul(i,20,20);});
  _a('SSS 1','Mathematics','If f(x)=2x2+3x-5, find f(2)',['5','9','11','15'],1,'hard');
  _a('SSS 1','Mathematics','Solve: 5x-3=2x+9',['2','3','4','5'],3,'medium');
  _a('SSS 1','Mathematics','What is the sum of interior angles of a triangle?',['90','180','270','360'],1,'medium');
  _a('SSS 1','Mathematics','Find the length of arc with angle 60°, radius 7cm',['7.33cm','14.67cm','22cm','44cm'],0,'hard');
  _a('SSS 1','Mathematics','What is the value of sin 90°?',['0','1','-1','0.5'],1,'medium');
  _a('SSS 1','Mathematics','Solve: log10 100 = ?',['1','2','3','10'],1,'medium');
  _a('SSS 1','English','Identify adverbial clause: "She arrived after the meeting had started."',['She arrived','after the meeting had started','the meeting','had started'],1,'hard');
  _a('SSS 1','English','What is a constitution? (figurative)',['A set of laws','Fundamental principles','International treaty','Court judgment'],1,'medium');
  _a('SSS 1','English','What is a paradox?',['A contradiction that may be true','A simile','A metaphor','A hyperbole'],0,'hard');
  _a('SSS 1','English','Correct: "The committee ___ divided."',['are','is','were','have been'],1,'medium');
  _a('SSS 1','English','What is an epigram?',['A short witty saying','A long poem','A type of essay','A novel'],0,'medium');
  _a('SSS 1','English','Which is a diphthong?',['/aɪ/','/b/','/t/','/m/'],0,'hard');
  _a('SSS 1','English','What is the object of a preposition?',['A noun after preposition','A verb','An adverb','An adjective'],0,'medium');
  _a('SSS 1','English','Correct: "She has been ___ for an hour."',['wait','waits','waiting','waited'],2,'medium');
  _a('SSS 1','English','What is semantic change?',['Change in word meaning','Sound change','Grammar change','Spelling change'],0,'hard');
  _a('SSS 1','Biology','Function of mitochondria?',['Protein synthesis','Energy production','Lipid storage','Waste elimination'],1,'medium');
  _a('SSS 1','Biology','What is a cell?',['Basic unit of life','A tissue','An organ','A molecule'],0,'medium');
  _a('SSS 1','Biology','What is osmosis?',['Water movement across membrane','Gas exchange','Nutrient absorption','Cell division'],0,'medium');
  _a('SSS 1','Biology','Which organelle controls the cell?',['Nucleus','Mitochondria','Ribosome','Cell membrane'],0,'medium');
  _a('SSS 1','Biology','What is the function of enzymes?',['Speed up reactions','Store energy','Transport oxygen','Fight infection'],0,'medium');
  _a('SSS 1','Biology','What is a tissue?',['Group of similar cells','An organ','A system','An organism'],0,'medium');
  _a('SSS 1','Chemistry','Atomic number of Carbon?',['4','6','8','12'],1,'easy');
  _a('SSS 1','Chemistry','What is an element?',['Pure substance of one atom type','A mixture','A compound','A solution'],0,'medium');
  _a('SSS 1','Chemistry','What is the chemical symbol for Potassium?',['Po','Pt','K','P'],2,'medium');
  _a('SSS 1','Chemistry','What is a valence electron?',['Outer shell electron','Inner shell electron','Core electron','Free electron'],0,'medium');
  _a('SSS 1','Chemistry','What is a chemical bond?',['Force holding atoms together','A mixture','A solution','A reaction'],0,'medium');
  _a('SSS 1','Physics','SI unit of force?',['Newton','Joule','Watt','Pascal'],0,'easy');
  _a('SSS 1','Physics','Formula for kinetic energy?',['KE=mgh','KE=1/2 mv2','KE=mv','KE=ma'],1,'medium');
  _a('SSS 1','Physics','What is velocity?',['Speed with direction','Speed only','Acceleration','Distance'],0,'medium');
  _a('SSS 1','Physics','What is the SI unit of work?',['Newton','Watt','Joule','Pascal'],2,'medium');
  _a('SSS 1','Geography','What is latitude?',['Distance east-west','Distance north-south','Height above sea','Time zone'],1,'medium');
  _a('SSS 1','Geography','What is longitude?',['Distance north-south','Distance east-west','Altitude','Depth'],1,'medium');
  _a('SSS 1','Geography','What is the Earth\'s circumference?',['~40,000km','~30,000km','~50,000km','~20,000km'],0,'medium');
  _a('SSS 1','Government','What is a constitution?',['Fundamental principles of a state','A set of laws','International treaty','Court judgment'],1,'medium');
  _a('SSS 1','Government','What is democracy?',['Rule by one','Rule by the people','Rule by military','Rule by the rich'],1,'medium');
  _a('SSS 1','Government','What is a political party?',['Group seeking political power','A social club','An NGO','A business'],0,'medium');

  // ===== SSS 2 =====
  _g('SSS 2','Mathematics',20,function(i){return _addSub(i,2000);});
  _g('SSS 2','Mathematics',10,function(i){return _mul(i,25,25);});
  _a('SSS 2','Mathematics','Differentiate y=x3+2x2-5x+1',['3x2+4x-5','3x2+4x+5','x2+4x-5','3x2-4x-5'],0,'hard');
  _a('SSS 2','Mathematics','What is the derivative of sin x?',['cos x','-sin x','tan x','-cos x'],0,'hard');
  _a('SSS 2','Mathematics','Find ∫(2x+3)dx',['x2+3x+C','2x2+3x+C','x2+3+C','2x+3+C'],0,'hard');
  _a('SSS 2','Mathematics','What is the mean of 4,8,12,16,20?',['10','12','14','16'],1,'medium');
  _a('SSS 2','Mathematics','Solve: 2x2-8=0',['x=±2','x=±4','x=±1','x=±8'],0,'medium');
  _a('SSS 2','English','Difference between "affect" and "effect"?',['Same meaning','Affect verb, Effect noun','Affect noun, Effect verb','No difference'],1,'medium');
  _a('SSS 2','English','What is a periodic sentence?',['Main idea at beginning','Main idea at end','No main idea','Repeated words'],1,'hard');
  _a('SSS 2','English','What is an aphorism?',['A short truth','A long story','A poem','A drama'],0,'medium');
  _a('SSS 2','English','Correct: "The data ___ collected."',['is','are','was','have'],1,'medium');
  _a('SSS 2','English','What is a rhetorical question?',['No answer expected','Yes/no question','Command','Exclamation'],0,'medium');
  _a('SSS 2','English','What is a clause?',['Group with subject+verb','A word','A phrase','A sentence'],0,'medium');
  _a('SSS 2','English','Identify the participle: "The crying baby"',['The','crying','baby','The crying'],1,'medium');
  _a('SSS 2','Biology','What is photosynthesis?',['Plant respiration','Light to chemical energy','Water absorption','Nutrient transport'],1,'medium');
  _a('SSS 2','Biology','Function of DNA?',['Store energy','Carry genetic info','Transport oxygen','Digest food'],1,'medium');
  _a('SSS 2','Biology','What is a gene?',['Segment of DNA','A chromosome','A protein','A cell'],0,'medium');
  _a('SSS 2','Biology','What is natural selection?',['Survival of fittest','Artificial breeding','Random mutation','Genetic drift'],0,'medium');
  _a('SSS 2','Biology','What is the function of insulin?',['Regulate blood sugar','Digest food','Fight infection','Transport oxygen'],0,'hard');
  _a('SSS 2','Chemistry','What is the pH of a neutral solution?',['0','7','14','1'],1,'easy');
  _a('SSS 2','Chemistry','What is an isotope?',['Same protons different neutrons','Diff protons','Same mass','No charge'],0,'hard');
  _a('SSS 2','Chemistry','What is oxidation?',['Gain of electrons','Loss of electrons','Gain of protons','Neutralization'],1,'hard');
  _a('SSS 2','Chemistry','What is a covalent bond?',['Shared electron pair','Electron transfer','Metal bond','Ionic bond'],0,'medium');
  _a('SSS 2','Physics','Ohm\'s Law?',['V=IR','I=VR','R=VI','V=I/R'],0,'medium');
  _a('SSS 2','Physics','What is the unit of resistance?',['Volt','Ohm','Ampere','Watt'],1,'medium');
  _a('SSS 2','Physics','What is refraction?',['Bending of light','Reflection of light','Absorption of light','Scattering'],0,'medium');
  _a('SSS 2','Economics','What does GDP stand for?',['Gross Domestic Product','General Demand Policy','Global Development Plan','Gross Demand Product'],0,'medium');
  _a('SSS 2','Economics','What is inflation?',['Decrease in prices','General increase in prices','Stable prices','Price regulation'],1,'medium');
  _a('SSS 2','Economics','What is supply?',['Quantity producers offer','Quantity consumers want','Price of goods','Cost of production'],0,'medium');
  _a('SSS 2','Accounting','What does a debit entry represent?',['Increase in asset','Decrease in asset','Increase in liability','Revenue'],0,'hard');
  _a('SSS 2','Accounting','What is a balance sheet?',['Financial position','Profit/loss','Cash flow','Expenses'],0,'medium');
  _a('SSS 2','Accounting','What is double entry bookkeeping?',['Two entries per transaction','Two accounts','Two books','Two columns'],0,'medium');

  // ===== SSS 3 — WASSCE/NECO =====
  _g('SSS 3','Mathematics',20,function(i){return _addSub(i,5000);});
  _g('SSS 3','Mathematics',10,function(i){return _mul(i,30,30);});
  _g('SSS 3','Mathematics',10,function(i){return _wProbs(i,50);});
  _a('SSS 3','Mathematics','Evaluate ∫(2x+3)dx',['x2+3x+C','2x2+3x+C','x2+3+C','2x+3+C'],0,'hard');
  _a('SSS 3','Mathematics','Determinant of [[2,3],[1,4]]?',['5','7','11','8'],0,'hard');
  _a('SSS 3','Mathematics','Sum to infinity GP: 1+1/2+1/4+...',['1','2','3','1.5'],1,'hard');
  _a('SSS 3','Mathematics','Find the limit of (x2-1)/(x-1) as x→1',['0','1','2','Undefined'],2,'hard');
  _a('SSS 3','Mathematics','What is the derivative of tan x?',['sec2 x','cosec2 x','cot x','-cos x'],0,'hard');
  _a('SSS 3','Mathematics','Solve: 2^x = 32',['2','4','5','6'],2,'hard');
  _a('SSS 3','Mathematics','Find the 5th term of AP: 2,5,8,...',['11','14','17','20'],1,'hard');
  _a('SSS 3','Mathematics','What is the area under y=x2 from 0 to 2?',['4/3','8/3','2','4'],1,'hard');
  _a('SSS 3','Mathematics','What is the angle between vectors (1,2) and (2,-1)?',['30°','60°','90°','45°'],2,'hard');
  _a('SSS 3','Further Math','Vector product of i × j?',['k','-k','i','0'],0,'hard');
  _a('SSS 3','Further Math','Find the limit of sin x/x as x→0',['0','1','∞','-1'],1,'hard');
  _a('SSS 3','Further Math','What is the modulus of 3+4i?',['3','4','5','7'],2,'hard');
  _a('SSS 3','Further Math','What is the rank of a 3×3 identity matrix?',['1','2','3','0'],2,'hard');
  _a('SSS 3','Further Math','What is the nth term of GP?',['ar^(n-1)','a+(n-1)d','a×d','a+nr'],0,'hard');
  _a('SSS 3','English','"I have a dream" repeated is what device?',['Alliteration','Anaphora','Epistrophe','Antithesis'],1,'hard');
  _a('SSS 3','English','Word meaning "to formally give up power"?',['Abdicate','Renounce','Resign','Retire'],0,'hard');
  _a('SSS 3','English','What is a periodic sentence?',['Main idea at beginning','Main idea at end','No main idea','Repeated words'],1,'hard');
  _a('SSS 3','English','What is meiosis in literature?',['Understatement','Exaggeration','Repetition','Comparison'],0,'hard');
  _a('SSS 3','English','Identify: "He is a lion in battle."',['Simile','Metaphor','Personification','Hyperbole'],1,'medium');
  _a('SSS 3','English','What is the structure of a sonnet?',['14 lines','10 lines','8 lines','20 lines'],0,'medium');
  _a('SSS 3','English','What is a euphemism?',['Mild expression for harsh one','Exaggeration','Contradiction','Repetition'],0,'hard');
  _a('SSS 3','English','What is the function of a semicolon?',['Join independent clauses','End a sentence','Introduce list','Show possession'],0,'medium');
  _a('SSS 3','English','Correct: "He would have ___ if he had known."',['come','came','comes','coming'],0,'medium');
  _a('SSS 3','English','What is register in language?',['Variety based on context','Dialect','Accent','Grammar'],0,'hard');
  _a('SSS 3','Biology','What is natural selection?',['Survival of fittest','Genetic mutation only','Artificial breeding','Random chance'],0,'hard');
  _a('SSS 3','Biology','Which organelle for protein synthesis?',['Mitochondria','Ribosome','Golgi','Lysosome'],1,'hard');
  _a('SSS 3','Biology','What is mitosis?',['2 identical cells','4 gametes','Cell death','Cell growth'],0,'hard');
  _a('SSS 3','Biology','What is a heterotroph?',['Eats other organisms','Makes own food','Decomposes','Parasite'],0,'medium');
  _a('SSS 3','Biology','What is the function of chlorophyll?',['Absorb light','Store water','Provide structure','Transport nutrients'],0,'medium');
  _a('SSS 3','Biology','What is a mutation?',['Change in DNA','Cell division','Protein synthesis','Energy release'],0,'medium');
  _a('SSS 3','Biology','What is a gamete?',['Sex cell','Body cell','Nerve cell','Blood cell'],0,'medium');
  _a('SSS 3','Biology','What is excretion?',['Removal of metabolic waste','Digestion','Circulation','Respiration'],0,'medium');
  _a('SSS 3','Chemistry','Molar mass of H2SO4?',['98 g/mol','96 g/mol','100 g/mol','94 g/mol'],0,'hard');
  _a('SSS 3','Chemistry','Allotrope of carbon?',['Water','Diamond','Salt','Sand'],1,'medium');
  _a('SSS 3','Chemistry','What is oxidation?',['Gain of electrons','Loss of electrons','Gain of protons','Neutralization'],1,'hard');
  _a('SSS 3','Chemistry','What is a redox reaction?',['Both oxidation and reduction','Only oxidation','Only reduction','No change'],0,'medium');
  _a('SSS 3','Chemistry','What is the periodic table?',['Arrangement of elements','Table of compounds','Reaction table','Atomic weights'],0,'medium');
  _a('SSS 3','Chemistry','What is a catalyst?',['Speeds up reaction without being consumed','Slows reaction','Stops reaction','No effect'],0,'medium');
  _a('SSS 3','Chemistry','What is the gas law: PV=nRT?',['Ideal gas law','Boyle\'s law','Charles\' law','Avogadro\'s law'],0,'hard');
  _a('SSS 3','Physics','Wavelength of wave f=50Hz, v=340m/s?',['6.8m','5.8m','7.8m','4.8m'],0,'hard');
  _a('SSS 3','Physics','Principle of conservation of energy?',['Energy created','Cannot be created/destroyed','Energy destroyed','Energy constant'],1,'medium');
  _a('SSS 3','Physics','Speed of light in vacuum?',['3×10^6 m/s','3×10^8 m/s','3×10^10 m/s','3×10^4 m/s'],1,'medium');
  _a('SSS 3','Physics','What is the photoelectric effect?',['Electron emission by light','Light bending','Sound production','Heat transfer'],0,'hard');
  _a('SSS 3','Physics','What is a transformer?',['Changes voltage','Changes frequency','Changes resistance','Changes current'],0,'medium');
  _a('SSS 3','Physics','What is the SI unit of magnetic flux?',['Tesla','Weber','Gauss','Henry'],1,'hard');
  _a('SSS 3','Physics','What is Hooke\'s Law?',['F=kx','F=ma','E=mc2','V=IR'],0,'medium');
  _a('SSS 3','Government','Head of state in presidential system?',['Prime Minister','President','Chief Justice','Speaker'],1,'medium');
  _a('SSS 3','Government','What is federalism?',['Centralized govt','Power shared central+regional','Local only','International'],1,'hard');
  _a('SSS 3','Government','Separation of powers?',['Three branches','United govt','Military rule','One-party'],0,'hard');
  _a('SSS 3','Government','What is the legislature?',['Law-making body','Law enforcement','Judiciary','Executive'],0,'medium');
  _a('SSS 3','Government','What is a constitution?',['Fundamental laws','A statute','A treaty','A decree'],0,'medium');
  _a('SSS 3','Government','What is a pressure group?',['Influences government policy','Political party','Government agency','International org'],0,'hard');
  _a('SSS 3','Economics','What is opportunity cost?',['Money cost','Next best alternative','Total cost','Fixed cost'],1,'medium');
  _a('SSS 3','Economics','What is a market economy?',['Government controls prices','Supply and demand','Traditional barter','No prices'],1,'medium');
  _a('SSS 3','Economics','What is demand?',['Quantity consumers will buy','Quantity produced','Price level','Supply'],0,'medium');
  _a('SSS 3','Economics','What is elasticity?',['Responsiveness of demand/supply','Price level','Quantity','Cost'],0,'hard');
  _a('SSS 3','Economics','What is a monopoly?',['Single seller','Many sellers','Two sellers','No sellers'],0,'medium');
  _a('SSS 3','Commerce','Limited liability company?',['Owners personally liable','Liability limited to shares','No liability','Government owned'],1,'hard');
  _a('SSS 3','Commerce','Principle of insurance?',['Profit','Indemnity','Investment','Credit'],1,'hard');
  _a('SSS 3','Commerce','What is a bill of lading?',['Shipping document','Insurance policy','Bank statement','Invoice'],0,'hard');
  _a('SSS 3','Commerce','What is trade?',['Exchange of goods/services','Production','Consumption','Storage'],0,'medium');
  _a('SSS 3','Literature','Who wrote Things Fall Apart?',['Achebe','Soyinka','Adichie','Okri'],0,'medium');
  _a('SSS 3','Literature','In "The Lion and the Jewel", Sidi marries?',['Lakunle','Baroka','Sadiku','No one'],1,'hard');
  _a('SSS 3','Literature','Who wrote "Weep Not, Child"?',['Ngugi wa Thiongo','Achebe','Soyinka','Armah'],0,'hard');
  _a('SSS 3','Literature','What is a tragic hero?',['Noble character with fatal flaw','Comic character','Villain','Side character'],0,'hard');
  _a('SSS 3','CRS','How many books in the Bible?',['64','66','68','70'],1,'medium');
  _a('SSS 3','CRS','Who denied Jesus three times?',['John','Peter','James','Andrew'],1,'medium');
  _a('SSS 3','CRS','What is the first book of the Bible?',['Genesis','Exodus','Leviticus','Numbers'],0,'medium');
  _a('SSS 3','CRS','Who was the first king of Israel?',['David','Solomon','Saul','Samuel'],2,'medium');
  _a('SSS 3','Geography','Largest continent?',['Africa','Asia','Europe','America'],1,'easy');
  _a('SSS 3','Geography','What is a map?',['Representation of Earth\'s surface','A drawing','A photo','A chart'],0,'medium');
  _a('SSS 3','Geography','What is climate?',['Long-term weather pattern','Daily weather','Temperature','Rainfall'],0,'medium');
  _a('SSS 3','Data Processing','Which is a programming language?',['Python','Word','Excel','PowerPoint'],0,'easy');
  _a('SSS 3','Data Processing','What is a database?',['Organized data collection','A file','A folder','A document'],0,'medium');
  _a('SSS 3','Data Processing','What does SQL stand for?',['Structured Query Language','Simple Query Language','Standard Query Language','System Query Language'],0,'medium');
  _a('SSS 3','Data Processing','What is a network?',['Connected computers','Single computer','A printer','A cable'],0,'medium');
  _a('SSS 3','Data Processing','What is an algorithm?',['Step-by-step solution','A program','A function','A variable'],0,'medium');

  // ===== EXTRA GENERATED QUESTIONS (all classes) =====
  var _cls = ['Basic 1','Basic 2','Basic 3','Basic 4','Basic 5','Basic 6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3'];
  var _off = [0,100,200,300,400,500,600,700,800,900,1000,1100];
  for (var xi = 0; xi < _cls.length; xi++) { (function(c, o) {
    _g(c,'Mathematics',15,function(i){return _addSub(i,100,o+500);});
    _g(c,'Mathematics',15,function(i){return _avg(i,50,o+100);});
    _g(c,'Mathematics',15,function(i){return _pct(i,o+200);});
    _g(c,'Mathematics',10,function(i){return _wordProb(i,o+300);});
    _g(c,'Mathematics',10,function(i){return _money(i,o+400);});
    _g(c,'Mathematics',10,function(i){return _geo(i,o+600);});
    _g(c,'Mathematics',10,function(i){return _fibo(i,o+700);});
    _g(c,'Mathematics',10,function(i){return _time(i,o+800);});
    if (c !== 'Basic 1' && c !== 'Basic 2' && c !== 'Basic 3') {
      _g(c,'Mathematics',10,function(i){return _addFrac(i,o+900);});
      _g(c,'Mathematics',10,function(i){return _alg(i,o+1000);});
    }
    if (c === 'SSS 1' || c === 'SSS 2' || c === 'SSS 3') {
      _g(c,'Mathematics',10,function(i){return _set(i,o+1100);});
      _g(c,'Mathematics',10,function(i){return _exp(i,o+1200);});
      _g(c,'Mathematics',10,function(i){return _trig(i,o+1300);});
    }
  })(_cls[xi], _off[xi]); }

  return Q;
}

// ===== SIMULATION STATE =====
var simState = null;
var simTimer = null;

// ===== CLASS LIST FOR NIGERIAN 9-3-4 SYSTEM =====
function getSimClassList() {
  return [
    'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6',
    'JSS 1', 'JSS 2', 'JSS 3',
    'SSS 1', 'SSS 2', 'SSS 3'
  ];
}

function getExamTypeForClass(cls) {
  var map = { 'Basic 6': 'common_entrance', 'JSS 3': 'bece', 'SSS 3': 'wassce' };
  return map[cls] || 'cbt';
}

// ===== ADMIN: Render Question Bank Manager =====
function renderSimQuestionBank() {
  var container = document.getElementById('adminSimQuestions');
  if (!container) return;
  var questions = data.simQuestions || [];
  var classes = getSimClassList();
  var allSubjects = [];
  questions.forEach(function(q) { if (allSubjects.indexOf(q.subject) === -1) allSubjects.push(q.subject); });
  allSubjects.sort();

  var html = '<div style="margin-bottom:24px;">' +
    '<h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-graduation-cap"></i> Exam Simulation — Question Bank</h2>' +
    '<p style="color:var(--text-light);">Manage practice questions for Nigerian 9-3-4 system (Basic 1–SSS 3)</p>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">' +
    '<select id="simFilterClass" onchange="renderSimQuestionBank()" style="padding:8px;border-radius:6px;border:1px solid #e2e8f0;background:var(--card-bg);color:var(--text);"><option value="">All Classes</option>' +
    classes.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select>' +
    '<select id="simFilterSubject" onchange="renderSimQuestionBank()" style="padding:8px;border-radius:6px;border:1px solid #e2e8f0;background:var(--card-bg);color:var(--text);"><option value="">All Subjects</option>' +
    allSubjects.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('') + '</select>' +
    '<select id="simFilterExamType" onchange="renderSimQuestionBank()" style="padding:8px;border-radius:6px;border:1px solid #e2e8f0;background:var(--card-bg);color:var(--text);"><option value="">All Exam Types</option><option value="general">General</option><option value="common_entrance">Common Entrance</option><option value="bece">BECE</option><option value="wassce">WASSCE/NECO</option><option value="cbt">CBT</option></select>' +
    '<button class="btn btn-primary btn-sm" onclick="showAddSimQuestionModal()"><i class="fas fa-plus"></i> Add Question</button>' +
    '<button class="btn btn-sm btn-outline" onclick="seedDefaultSimQuestions()"><i class="fas fa-database"></i> Seed Questions</button>' +
    '</div>';

  var fc = document.getElementById('simFilterClass')?.value || '';
  var fs = document.getElementById('simFilterSubject')?.value || '';
  var fe = document.getElementById('simFilterExamType')?.value || '';
  var filtered = questions.filter(function(q) {
    if (fc && q.class !== fc) return false;
    if (fs && q.subject !== fs) return false;
    if (fe && q.examType !== fe) return false;
    return true;
  });
  filtered.sort(function(a, b) { return a.class < b.class ? -1 : a.class > b.class ? 1 : a.subject < b.subject ? -1 : 0; });

  html += '<div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">' + filtered.length + ' question(s) shown (' + questions.length + ' total)</div>';
  html += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>Class</th><th>Subject</th><th>Question</th><th>Options</th><th>Answer</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
  filtered.forEach(function(q) {
    var letters = ['A', 'B', 'C', 'D'];
    var optsStr = q.options.map(function(o, i) { return letters[i] + '. ' + o; }).join(' | ');
    html += '<tr><td>' + htmlEscape(q.class) + '</td><td>' + htmlEscape(q.subject) + '</td><td>' + htmlEscape(q.question) + '</td><td style="font-size:12px;">' + htmlEscape(optsStr) + '</td><td><strong>' + letters[q.answer] + '</strong></td>' +
      '<td><span class="badge" style="background:#ebf8ff;color:#2b6cb0;">' + htmlEscape(q.examType) + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="showEditSimQuestionModal(\'' + q.id + '\')" style="font-size:11px;"><i class="fas fa-edit"></i></button> ' +
      '<button class="btn btn-sm btn-outline" onclick="deleteSimQuestion(\'' + q.id + '\')" style="font-size:11px;color:var(--danger);"><i class="fas fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div>';
  if (!filtered.length) html += '<p class="empty-state"><i class="fas fa-question-circle"></i> No questions found</p>';

  container.innerHTML = html;
}

function showAddSimQuestionModal() {
  var classes = getSimClassList();
  openModal('<h3><i class="fas fa-plus-circle"></i> Add Simulation Question</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Class</label><select id="fSimQClass">' + classes.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-group"><label>Subject</label><input type="text" id="fSimQSubject" placeholder="e.g. Mathematics"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Question</label><textarea id="fSimQQuestion" rows="2" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;"></textarea></div>' +
    '<div class="form-group"><label>Option A</label><input type="text" id="fSimQA"></div>' +
    '<div class="form-group"><label>Option B</label><input type="text" id="fSimQB"></div>' +
    '<div class="form-group"><label>Option C</label><input type="text" id="fSimQC"></div>' +
    '<div class="form-group"><label>Option D</label><input type="text" id="fSimQD"></div>' +
    '<div class="form-group"><label>Correct Answer</label><select id="fSimQAnswer"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></div>' +
    '<div class="form-group"><label>Difficulty</label><select id="fSimQDiff"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select></div>' +
    '<div class="form-group"><label>Exam Type</label><select id="fSimQType"><option value="general">General</option><option value="common_entrance">Common Entrance</option><option value="bece">BECE</option><option value="wassce">WASSCE/NECO</option><option value="cbt">CBT</option></select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveSimQuestion()"><i class="fas fa-save"></i> Save</button></div>');
}

function saveSimQuestion() {
  var cls = document.getElementById('fSimQClass')?.value;
  var subject = document.getElementById('fSimQSubject')?.value.trim();
  var question = document.getElementById('fSimQQuestion')?.value.trim();
  var opts = [
    document.getElementById('fSimQA')?.value.trim(),
    document.getElementById('fSimQB')?.value.trim(),
    document.getElementById('fSimQC')?.value.trim(),
    document.getElementById('fSimQD')?.value.trim()
  ];
  var answer = parseInt(document.getElementById('fSimQAnswer')?.value);
  var difficulty = document.getElementById('fSimQDiff')?.value;
  var examType = document.getElementById('fSimQType')?.value;
  if (!cls || !subject || !question || opts.some(function(o) { return !o; })) { toast('Please fill all fields', 'error'); return; }
  if (answer < 0 || answer > 3) { toast('Invalid answer selection', 'error'); return; }
  if (!data.simQuestions) data.simQuestions = [];
  data.simQuestions.push({ id: genId('SIM'), class: cls, subject: subject, question: question, options: opts, answer: answer, difficulty: difficulty, examType: examType });
  saveData();
  closeModal();
  renderSimQuestionBank();
  toast('Question added');
}

function showEditSimQuestionModal(id) {
  var q = (data.simQuestions || []).find(function(x) { return x.id === id; });
  if (!q) return;
  var classes = getSimClassList();
  openModal('<h3><i class="fas fa-edit"></i> Edit Question</h3>' +
    '<div class="form-grid">' +
    '<div class="form-group"><label>Class</label><select id="fSimQClass">' + classes.map(function(c) { return '<option value="' + c + '"' + (c === q.class ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-group"><label>Subject</label><input type="text" id="fSimQSubject" value="' + htmlEscape(q.subject) + '"></div>' +
    '<div class="form-group" style="grid-column:1/-1;"><label>Question</label><textarea id="fSimQQuestion" rows="2" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;">' + htmlEscape(q.question) + '</textarea></div>' +
    '<div class="form-group"><label>Option A</label><input type="text" id="fSimQA" value="' + htmlEscape(q.options[0]) + '"></div>' +
    '<div class="form-group"><label>Option B</label><input type="text" id="fSimQB" value="' + htmlEscape(q.options[1]) + '"></div>' +
    '<div class="form-group"><label>Option C</label><input type="text" id="fSimQC" value="' + htmlEscape(q.options[2]) + '"></div>' +
    '<div class="form-group"><label>Option D</label><input type="text" id="fSimQD" value="' + htmlEscape(q.options[3]) + '"></div>' +
    '<div class="form-group"><label>Correct Answer</label><select id="fSimQAnswer"><option value="0"' + (q.answer === 0 ? ' selected' : '') + '>A</option><option value="1"' + (q.answer === 1 ? ' selected' : '') + '>B</option><option value="2"' + (q.answer === 2 ? ' selected' : '') + '>C</option><option value="3"' + (q.answer === 3 ? ' selected' : '') + '>D</option></select></div>' +
    '<div class="form-group"><label>Difficulty</label><select id="fSimQDiff"><option value="easy"' + (q.difficulty === 'easy' ? ' selected' : '') + '>Easy</option><option value="medium"' + (q.difficulty === 'medium' ? ' selected' : '') + '>Medium</option><option value="hard"' + (q.difficulty === 'hard' ? ' selected' : '') + '>Hard</option></select></div>' +
    '<div class="form-group"><label>Exam Type</label><select id="fSimQType"><option value="general"' + (q.examType === 'general' ? ' selected' : '') + '>General</option><option value="common_entrance"' + (q.examType === 'common_entrance' ? ' selected' : '') + '>Common Entrance</option><option value="bece"' + (q.examType === 'bece' ? ' selected' : '') + '>BECE</option><option value="wassce"' + (q.examType === 'wassce' ? ' selected' : '') + '>WASSCE/NECO</option><option value="cbt"' + (q.examType === 'cbt' ? ' selected' : '') + '>CBT</option></select></div>' +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="updateSimQuestion(\'' + id + '\')"><i class="fas fa-save"></i> Save Changes</button></div>');
}

function updateSimQuestion(id) {
  var q = (data.simQuestions || []).find(function(x) { return x.id === id; });
  if (!q) return;
  q.class = document.getElementById('fSimQClass')?.value || q.class;
  q.subject = document.getElementById('fSimQSubject')?.value.trim() || q.subject;
  q.question = document.getElementById('fSimQQuestion')?.value.trim() || q.question;
  q.options = [
    document.getElementById('fSimQA')?.value.trim() || q.options[0],
    document.getElementById('fSimQB')?.value.trim() || q.options[1],
    document.getElementById('fSimQC')?.value.trim() || q.options[2],
    document.getElementById('fSimQD')?.value.trim() || q.options[3]
  ];
  q.answer = parseInt(document.getElementById('fSimQAnswer')?.value) ?? q.answer;
  q.difficulty = document.getElementById('fSimQDiff')?.value || q.difficulty;
  q.examType = document.getElementById('fSimQType')?.value || q.examType;
  saveData();
  closeModal();
  renderSimQuestionBank();
  toast('Question updated');
}

function deleteSimQuestion(id) {
  if (!confirm('Delete this question?')) return;
  data.simQuestions = (data.simQuestions || []).filter(function(q) { return q.id !== id; });
  saveData();
  renderSimQuestionBank();
  toast('Question deleted');
}

function seedDefaultSimQuestions() {
  if (confirm('This will add 2000 Nigerian curriculum questions (Basic 1–SSS 3). Continue?')) {
    if (!data.simQuestions) data.simQuestions = [];
    var existing = getDefaultSimQuestions();
    var count = 0;
    existing.forEach(function(eq) {
      if (!data.simQuestions.some(function(q) { return q.id === eq.id; })) {
        data.simQuestions.push(eq);
        count++;
      }
    });
    saveData();
    renderSimQuestionBank();
    toast(count + ' question(s) seeded');
  }
}

// ===== ADMIN: Simulation Attempts Log =====
function renderSimAttempts() {
  var container = document.getElementById('admin-simattempts');
  if (!container) return;
  var attempts = data.simAttempts || [];
  var html = '<div style="margin-bottom:24px;"><h2 style="font-size:22px;font-weight:700;color:var(--primary);"><i class="fas fa-history"></i> Simulation Results</h2>' +
    '<p style="color:var(--text-light);">View all student simulation attempts and performance</p></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px;">';
  var total = attempts.length;
  var passed = attempts.filter(function(a) { return a.score >= 50; }).length;
  var totalQ = attempts.reduce(function(s, a) { return s + (a.total || 0); }, 0);
  var correctQ = attempts.reduce(function(s, a) { return s + (a.correct || 0); }, 0);
  var avgScore = total ? Math.round(attempts.reduce(function(s, a) { return s + a.score; }, 0) / total) : 0;
  html += '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--primary);">' + total + '</div><div style="font-size:11px;color:var(--text-light);">Total Attempts</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--success);">' + passed + '</div><div style="font-size:11px;color:var(--text-light);">Passed (≥50%)</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:var(--accent);">' + avgScore + '%</div><div style="font-size:11px;color:var(--text-light);">Avg Score</div></div>' +
    '<div class="card" style="text-align:center;padding:12px;"><div style="font-size:22px;font-weight:700;color:#3182ce;">' + correctQ + '/' + totalQ + '</div><div style="font-size:11px;color:var(--text-light);">Correct Answers</div></div>' +
    '</div>';

  if (attempts.length) {
    attempts.sort(function(a, b) { return b.date < a.date ? 1 : -1; });
    html += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>Student</th><th>Class</th><th>Subject</th><th>Mode</th><th>Score</th><th>Result</th><th>Date</th></tr></thead><tbody>';
    attempts.forEach(function(a) {
      var stu = getStudent(a.studentId);
      var pct = a.total > 0 ? Math.round(a.correct / a.total * 100) : 0;
      html += '<tr><td>' + (stu ? htmlEscape(stu.name) : htmlEscape(a.studentId)) + '</td>' +
        '<td>' + htmlEscape(a.class) + '</td>' +
        '<td>' + htmlEscape(a.subject) + '</td>' +
        '<td>' + htmlEscape(a.mode) + '</td>' +
        '<td>' + a.correct + '/' + a.total + ' (' + pct + '%)</td>' +
        '<td><span class="badge ' + (pct >= 50 ? 'badge-paid' : 'badge-absent') + '">' + (pct >= 50 ? 'Pass' : 'Fail') + '</span></td>' +
        '<td>' + htmlEscape(a.date) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<p class="empty-state"><i class="fas fa-history"></i> No simulation attempts yet</p>';
  }
  container.innerHTML = html;
}

// ===== STUDENT: Exam Simulation Center =====
function renderSimCenter() {
  if (!currentStudent) return;
  var container = document.getElementById('stuSimCenter');
  if (!container) return;
  var baseClass = _stripStream(currentStudent.class);
  var questions = data.simQuestions || [];
  var myAttempts = (data.simAttempts || []).filter(function(a) { return a.studentId === currentStudent.id; });
  var available = questions.filter(function(q) { return _stripStream(q.class) === baseClass; });
  var subjects = [];
  available.forEach(function(q) { if (subjects.indexOf(q.subject) === -1) subjects.push(q.subject); });
  subjects.sort();

  var html = '<div style="margin-bottom:16px;">' +
    '<h2 style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;"><i class="fas fa-graduation-cap"></i> Exam Simulation Center</h2>' +
    '<p style="color:var(--text-light);font-size:13px;">Practice with timed exams for ' + htmlEscape(currentStudent.class) + ' following Nigerian curriculum standards</p>' +
    '</div>';

  // Exam type badge
  var examType = getExamTypeForClass(baseClass);
  var examLabel = examType === 'common_entrance' ? 'Common Entrance Mode' : examType === 'bece' ? 'BECE CBT Mode' : examType === 'wassce' ? 'WASSCE/NECO Mode' : 'CBT Practice Mode';
  var examIcon = examType === 'common_entrance' ? 'fa-door-open' : examType === 'bece' ? 'fa-certificate' : examType === 'wassce' ? 'fa-scroll' : 'fa-laptop-code';
  html += '<div class="card" style="padding:16px;margin-bottom:16px;border-left:4px solid var(--accent);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
    '<div><i class="fas ' + examIcon + '" style="color:var(--accent);font-size:24px;margin-right:12px;"></i>' +
    '<span style="font-weight:600;font-size:15px;">' + examLabel + '</span>' +
    '<span style="font-size:13px;color:var(--text-light);margin-left:8px;">(' + available.length + ' questions available)</span></div>' +
    '</div>';

  // Subject cards
  html += '<h4 style="font-weight:600;font-size:14px;margin-bottom:8px;">Select Subject to Practice</h4>';
  if (!subjects.length) {
    html += '<p class="empty-state"><i class="fas fa-database"></i> No practice questions available for ' + htmlEscape(baseClass) + '. Contact the admin to seed the question bank.</p>';
  } else {
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px;">';
  subjects.forEach(function(subj) {
    var subjQuestions = available.filter(function(q) { return q.subject === subj; });
    var subjAttempts = myAttempts.filter(function(a) { return a.subject === subj; });
    var best = subjAttempts.length ? Math.max.apply(null, subjAttempts.map(function(a) { return a.total > 0 ? Math.round(a.correct / a.total * 100) : 0; })) : null;
    html += '<div class="card sim-subject-card" style="padding:16px;cursor:pointer;" onclick="startSimulation(\'' + htmlEscape(subj) + '\')" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
      '<div style="font-size:20px;margin-bottom:8px;"><i class="fas ' + (subj.toLowerCase().indexOf('math') >= 0 ? 'fa-calculator' : subj.toLowerCase().indexOf('sci') >= 0 || subj.toLowerCase().indexOf('biol') >= 0 || subj.toLowerCase().indexOf('chem') >= 0 || subj.toLowerCase().indexOf('phys') >= 0 ? 'fa-flask' : subj.toLowerCase().indexOf('engl') >= 0 || subj.toLowerCase().indexOf('liter') >= 0 ? 'fa-book-open' : subj.toLowerCase().indexOf('gov') >= 0 || subj.toLowerCase().indexOf('social') >= 0 || subj.toLowerCase().indexOf('hist') >= 0 ? 'fa-globe-africa' : subj.toLowerCase().indexOf('tech') >= 0 || subj.toLowerCase().indexOf('comp') >= 0 || subj.toLowerCase().indexOf('data') >= 0 ? 'fa-laptop-code' : subj.toLowerCase().indexOf('account') >= 0 || subj.toLowerCase().indexOf('commerce') >= 0 || subj.toLowerCase().indexOf('econom') >= 0 ? 'fa-chart-line' : 'fa-book') + '"></i></div>' +
      '<h5 style="font-weight:600;font-size:14px;margin-bottom:4px;">' + htmlEscape(subj) + '</h5>' +
      '<div style="font-size:12px;color:var(--text-light);">' + subjQuestions.length + ' questions</div>' +
      (subjAttempts.length ? '<div style="font-size:12px;color:var(--success);margin-top:4px;">Best: ' + best + '%</div>' : '<div style="font-size:12px;color:var(--text-light);margin-top:4px;">Not attempted</div>') +
      '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" style="width:100%;font-size:11px;"><i class="fas fa-play"></i> Start Exam</button></div>' +
      '</div>';
  });
  html += '</div>';
  }

  // Mixed exam option
  if (subjects.length > 1) {
    html += '<div class="card" style="padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      '<div><strong><i class="fas fa-random"></i> Mixed Subject Exam</strong><br><span style="font-size:12px;color:var(--text-light);">Questions from all subjects for your class</span></div>' +
      '<button class="btn btn-primary" onclick="startMixedSimulation()"><i class="fas fa-play"></i> Start Mixed Exam</button></div>';
  }

  // Performance History
  if (myAttempts.length) {
    myAttempts.sort(function(a, b) { return b.date < a.date ? 1 : -1; });
    html += '<h4 style="font-weight:600;font-size:14px;margin:20px 0 8px;"><i class="fas fa-chart-line"></i> My Performance History</h4>';
    html += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>Subject</th><th>Mode</th><th>Score</th><th>%</th><th>Correct</th><th>Wrong</th><th>Date</th></tr></thead><tbody>';
    myAttempts.forEach(function(a) {
      var pct = a.total > 0 ? Math.round(a.correct / a.total * 100) : 0;
      html += '<tr><td>' + htmlEscape(a.subject) + '</td><td><span class="badge" style="background:#ebf8ff;color:#2b6cb0;">' + htmlEscape(a.mode) + '</span></td>' +
        '<td>' + a.correct + '/' + a.total + '</td>' +
        '<td><strong style="color:' + (pct >= 70 ? '#38a169' : pct >= 50 ? '#dd6b20' : '#e53e3e') + ';">' + pct + '%</strong></td>' +
        '<td style="color:#38a169;">' + a.correct + '</td>' +
        '<td style="color:#e53e3e;">' + (a.total - a.correct) + '</td>' +
        '<td>' + htmlEscape(a.date) + '</td></tr>';
    });
    html += '</tbody></table></div>';

    // Weak areas analysis
    html += '<h4 style="font-weight:600;font-size:14px;margin:20px 0 8px;"><i class="fas fa-exclamation-triangle" style="color:#dd6b20;"></i> Weak Areas — Needs Improvement</h4>';
    var weakAreas = [];
    var subjectAttempts = {};
    myAttempts.forEach(function(a) {
      if (!subjectAttempts[a.subject]) subjectAttempts[a.subject] = { correct: 0, total: 0, count: 0 };
      subjectAttempts[a.subject].correct += a.correct;
      subjectAttempts[a.subject].total += a.total;
      subjectAttempts[a.subject].count++;
    });
    Object.keys(subjectAttempts).forEach(function(subj) {
      var data = subjectAttempts[subj];
      var pct = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
      if (pct < 60) weakAreas.push({ subject: subj, pct: pct });
    });
    if (weakAreas.length) {
      weakAreas.sort(function(a, b) { return a.pct - b.pct; });
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;">';
      weakAreas.forEach(function(w) {
        var barColor = w.pct < 30 ? '#e53e3e' : w.pct < 50 ? '#dd6b20' : '#d69e2e';
        html += '<div class="card" style="padding:12px;"><div style="font-weight:600;font-size:13px;">' + htmlEscape(w.subject) + '</div>' +
          '<div style="margin:6px 0;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + w.pct + '%;background:' + barColor + ';border-radius:4px;"></div></div>' +
          '<div style="font-size:12px;color:var(--text-light);">' + w.pct + '% accuracy — ' + (w.pct < 30 ? 'Critical' : w.pct < 50 ? 'Needs work' : 'Improving') + '</div></div>';
      });
      html += '</div>';
    } else {
      html += '<p class="empty-state" style="margin:0;"><i class="fas fa-check-circle" style="color:#38a169;"></i> Great job! No weak areas detected.</p>';
    }
  }

  container.innerHTML = html;
}

// ===== SIMULATION ENGINE =====
function _stripStream(cls) { return cls ? cls.replace(/[A-Z]$/, '').trim() : cls; }

function startSimulation(subject) {
  if (!currentStudent) { toast('Please log in as a student', 'error'); return; }
  var baseClass = _stripStream(currentStudent.class);
  var questions = (data.simQuestions || []).filter(function(q) { return _stripStream(q.class) === baseClass && q.subject === subject; });
  if (questions.length < 3) { toast('Not enough questions for ' + subject + '. Contact admin.', 'error'); return; }
  var shuffled = questions.sort(function() { return Math.random() - 0.5; }).slice(0, Math.min(questions.length, 20));
  var durationMin = getExamDuration(baseClass);
  simState = {
    studentId: currentStudent.id, className: currentStudent.class, subject: subject,
    mode: getExamTypeForClass(baseClass), duration: durationMin * 60 * 1000,
    questions: shuffled, answers: new Array(shuffled.length).fill(null),
    currentIdx: 0, startTime: Date.now(), finished: false
  };
  renderSimFullscreen();
  startSimTimer();
  document.addEventListener('visibilitychange', simTabSwitch);
}

function startMixedSimulation() {
  if (!currentStudent) return;
  var baseClass = _stripStream(currentStudent.class);
  var questions = (data.simQuestions || []).filter(function(q) { return _stripStream(q.class) === baseClass; });
  if (questions.length < 5) { toast('Not enough questions for this class', 'error'); return; }
  var shuffled = questions.sort(function() { return Math.random() - 0.5; }).slice(0, Math.min(questions.length, 20));
  var durationMin = getExamDuration(baseClass);
  simState = {
    studentId: currentStudent.id, className: currentStudent.class, subject: 'Mixed',
    mode: getExamTypeForClass(baseClass), duration: durationMin * 60 * 1000,
    questions: shuffled, answers: new Array(shuffled.length).fill(null),
    currentIdx: 0, startTime: Date.now(), finished: false
  };
  renderSimFullscreen();
  startSimTimer();
  document.addEventListener('visibilitychange', simTabSwitch);
}

function getExamDuration(cls) {
  if (cls === 'Basic 6') return 45;
  if (cls === 'JSS 3') return 60;
  if (cls === 'SSS 3') return 90;
  if (cls.indexOf('Basic') >= 0) return 30;
  if (cls.indexOf('JSS') >= 0) return 45;
  if (cls.indexOf('SSS') >= 0) return 60;
  return 30;
}

var simTabSwitchCount = 0;

function simTabSwitch() {
  if (simState && !simState.finished && document.hidden) {
    simTabSwitchCount++;
    if (simTabSwitchCount <= 3) toast('Warning: Tab switch #' + simTabSwitchCount, 'error');
  }
}

function renderSimFullscreen() {
  var existing = document.getElementById('simFullscreen');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', '<div class="exam-fullscreen" id="simFullscreen"></div>');
  updateSimUI();
}

function updateSimUI() {
  if (!simState) return;
  var total = simState.questions.length;
  var answered = simState.answers.filter(function(a) { return a !== null; }).length;
  var q = simState.questions[simState.currentIdx];
  var elapsed = Date.now() - simState.startTime;
  var em = Math.floor(elapsed / 60000);
  var es = Math.floor((elapsed % 60000) / 1000);
  var ratio = elapsed / simState.duration;
  var timerClass = ratio > 0.9 ? 'danger' : ratio > 0.7 ? 'warning' : '';
  var durationMins = Math.floor(simState.duration / 60000);
  var examLabel = simState.mode === 'common_entrance' ? 'Common Entrance' : simState.mode === 'bece' ? 'BECE' : simState.mode === 'wassce' ? 'WASSCE/NECO' : 'CBT Practice';
  var letters = ['A', 'B', 'C', 'D'];
  var selected = simState.answers[simState.currentIdx];

  var ef = document.getElementById('simFullscreen');
  if (!ef) return;
  ef.innerHTML = '<div class="exam-topbar">' +
    '<div><h3><i class="fas fa-graduation-cap"></i> ' + examLabel + ' — ' + htmlEscape(simState.subject) + '</h3></div>' +
    '<div style="text-align:center;"><div class="exam-timer ' + timerClass + '" id="simTimer">' + String(em).padStart(2,'0') + ':' + String(es).padStart(2,'0') + '</div>' +
    '<div style="font-size:11px;opacity:0.7;">of ' + String(durationMins).padStart(2,'0') + ':00</div></div>' +
    '<div><span style="font-size:13px;">' + answered + '/' + total + ' answered</span></div>' +
    '<div><button class="btn btn-sm btn-danger" onclick="confirmFinishSim()"><i class="fas fa-flag-checkered"></i> Submit</button></div>' +
    '</div>' +
    '<div class="exam-body">' +
    '<div class="exam-main">' +
    '<div class="exam-question" style="padding:24px;">' +
    '<div class="q-text" style="font-size:16px;margin-bottom:20px;">Question ' + (simState.currentIdx + 1) + ' of ' + total + ':<br><strong>' + htmlEscape(q.question) + '</strong></div>' +
    '<div class="q-options">' +
    q.options.map(function(opt, oi) {
      return '<div class="q-option ' + (selected === oi ? 'selected' : '') + '" onclick="simSelectAnswer(' + oi + ')">' +
        '<div class="letter">' + letters[oi] + '</div><span>' + htmlEscape(opt) + '</span></div>';
    }).join('') +
    '</div></div>' +
    '<div class="exam-nav-btns">' +
    '<button class="btn btn-outline" onclick="simPrevQuestion()" ' + (simState.currentIdx === 0 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i> Previous</button>' +
    '<button class="btn btn-primary" onclick="simNextQuestion()">' + (simState.currentIdx < total - 1 ? 'Next <i class="fas fa-chevron-right"></i>' : 'Review <i class="fas fa-check"></i>') + '</button></div>' +
    '</div>' +
    '<div class="exam-sidebar">' +
    '<h4 style="margin-bottom:8px;font-size:14px;">Question Navigator</h4>' +
    '<div class="exam-question-count">' +
    simState.questions.map(function(_, i) {
      return '<div class="qnum ' + (simState.answers[i] !== null ? 'answered' : '') + ' ' + (simState.currentIdx === i ? 'current' : '') + '" onclick="simGoToQuestion(' + i + ')">' + (i + 1) + '</div>';
    }).join('') +
    '</div></div></div>';
}

function simSelectAnswer(optionIdx) {
  simState.answers[simState.currentIdx] = optionIdx;
  updateSimUI();
}

function simNextQuestion() {
  if (simState.currentIdx < simState.questions.length - 1) {
    simState.currentIdx++;
    updateSimUI();
  } else {
    confirmFinishSim();
  }
}

function simPrevQuestion() {
  if (simState.currentIdx > 0) {
    simState.currentIdx--;
    updateSimUI();
  }
}

function simGoToQuestion(idx) {
  if (idx >= 0 && idx < simState.questions.length) {
    simState.currentIdx = idx;
    updateSimUI();
  }
}

function startSimTimer() {
  if (simTimer) clearInterval(simTimer);
  simTimer = setInterval(function() {
    if (!simState || simState.finished || !document.getElementById('simFullscreen')) { clearInterval(simTimer); return; }
    var elapsed = Date.now() - simState.startTime;
    var em = Math.floor(elapsed / 60000);
    var es = Math.floor((elapsed % 60000) / 1000);
    var ratio = elapsed / simState.duration;
    var timerEl = document.getElementById('simTimer');
    if (timerEl) {
      timerEl.textContent = String(em).padStart(2,'0') + ':' + String(es).padStart(2,'0');
      timerEl.className = 'exam-timer ' + (ratio > 0.9 ? 'danger' : ratio > 0.7 ? 'warning' : '');
    }
    if (elapsed >= simState.duration) finishSimulation();
  }, 1000);
}

function confirmFinishSim() {
  if (!simState) return;
  var answered = simState.answers.filter(function(a) { return a !== null; }).length;
  var total = simState.questions.length;
  openModal('<h3><i class="fas fa-flag-checkered"></i> Submit Exam?</h3>' +
    '<p style="margin:16px 0;">You have answered <strong>' + answered + '/' + total + '</strong> questions.</p>' +
    '<p style="color:var(--text-light);font-size:13px;margin-bottom:16px;">' + (total - answered) + ' question(s) unanswered will be marked wrong.</p>' +
    '<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Continue Exam</button>' +
    '<button class="btn btn-danger" onclick="closeModal();finishSimulation();"><i class="fas fa-check"></i> Submit</button></div>');
}

function finishSimulation() {
  if (!simState || simState.finished) return;
  closeModal();
  simState.finished = true;
  if (simTimer) { clearInterval(simTimer); simTimer = null; }
  document.removeEventListener('visibilitychange', simTabSwitch);

  var correct = 0;
  var wrongBySubject = {};
  var details = [];
  simState.questions.forEach(function(q, i) {
    var selected = simState.answers[i];
    var isCorrect = selected === q.answer;
    if (isCorrect) correct++;
    else {
      if (!wrongBySubject[q.subject]) wrongBySubject[q.subject] = 0;
      wrongBySubject[q.subject]++;
    }
    details.push({ question: q.question, options: q.options, correct: q.answer, selected: selected, isCorrect: isCorrect, subject: q.subject });
  });
  var total = simState.questions.length;
  var pct = Math.round(correct / total * 100);

  if (!data.simAttempts) data.simAttempts = [];
  data.simAttempts.push({
    id: genId('SIMAT'), studentId: simState.studentId,
    class: simState.className, subject: simState.subject, mode: simState.mode,
    correct: correct, total: total, score: pct,
    tabSwitches: simTabSwitchCount,
    details: JSON.parse(JSON.stringify(details)),
    date: new Date().toISOString().split('T')[0]
  });
  saveData();

  var existing = document.getElementById('simFullscreen');
  if (existing) existing.remove();

  renderSimResult(pct, correct, total, wrongBySubject, details);
}

function renderSimResult(pct, correct, total, wrongBySubject, details) {
  var cls = simState ? simState.className : '';
  var subj = simState ? simState.subject : '';
  simTabSwitchCount = 0;
  var container = document.getElementById('stuSimCenter');
  if (!container) return;
  var modeLabel = simState ? simState.mode : '';
  simState = null;

  var grade = pct >= 90 ? 'A1 (Excellent)' : pct >= 80 ? 'B2 (Very Good)' : pct >= 70 ? 'B3 (Good)' : pct >= 60 ? 'C4 (Credit)' : pct >= 55 ? 'C5 (Credit)' : pct >= 50 ? 'C6 (Pass)' : pct >= 45 ? 'D7 (Pass)' : pct >= 40 ? 'E8 (Pass)' : 'F9 (Fail)';
  var gradeColor = pct >= 70 ? '#38a169' : pct >= 50 ? '#dd6b20' : '#e53e3e';

  var html = '<div style="margin-bottom:16px;">' +
    '<h2 style="font-size:18px;font-weight:700;color:var(--primary);"><i class="fas fa-file-alt"></i> Exam Simulation Result</h2>' +
    '</div>' +
    '<div class="card" style="padding:24px;text-align:center;margin-bottom:16px;border-left:4px solid ' + gradeColor + ';">' +
    '<div style="font-size:48px;font-weight:800;color:' + gradeColor + ';">' + pct + '%</div>' +
    '<div style="font-size:18px;font-weight:600;color:' + gradeColor + ';margin-top:4px;">' + grade + '</div>' +
    '<div style="margin-top:12px;display:flex;justify-content:center;gap:24px;flex-wrap:wrap;font-size:14px;">' +
    '<span><strong>' + correct + '</strong> Correct</span>' +
    '<span><strong>' + (total - correct) + '</strong> Wrong</span>' +
    '<span><strong>' + total + '</strong> Total</span>' +
    '<span><strong>' + modeLabel + '</strong> Mode</span>' +
    '</div></div>';

  // Wrong answers by subject (weak areas)
  var weakSubjs = Object.keys(wrongBySubject);
  if (weakSubjs.length) {
    html += '<h4 style="font-weight:600;font-size:14px;margin-bottom:8px;"><i class="fas fa-exclamation-triangle" style="color:#dd6b20;"></i> Areas to Improve</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:16px;">';
    weakSubjs.forEach(function(sub) {
      html += '<div class="card" style="padding:12px;border-left:3px solid #e53e3e;">' +
        '<div style="font-weight:600;font-size:13px;">' + htmlEscape(sub) + '</div>' +
        '<div style="font-size:12px;color:#e53e3e;">' + wrongBySubject[sub] + ' wrong answer(s)</div></div>';
    });
    html += '</div>';
  }

  // Question review
  html += '<h4 style="font-weight:600;font-size:14px;margin-bottom:8px;"><i class="fas fa-list"></i> Question Review</h4>';
  html += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr><th>#</th><th>Question</th><th>Your Answer</th><th>Correct</th><th>Result</th></tr></thead><tbody>';
  var letters = ['A', 'B', 'C', 'D'];
  details.forEach(function(d, i) {
    var yourAns = d.selected !== null ? letters[d.selected] : '—';
    var correctAns = letters[d.correct];
    var resultClass = d.isCorrect ? 'badge-paid' : 'badge-absent';
    var resultText = d.isCorrect ? 'Correct' : 'Wrong';
    html += '<tr><td>' + (i + 1) + '</td><td>' + htmlEscape(d.question) + '</td><td>' + yourAns + '</td><td>' + correctAns + '</td>' +
      '<td><span class="badge ' + resultClass + '">' + resultText + '</span></td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="renderSimCenter()"><i class="fas fa-arrow-left"></i> Back to Exam Center</button>' +
    '<button class="btn btn-success" onclick="startSimulation(\'' + htmlEscape(subj) + '\')"><i class="fas fa-redo"></i> Retake ' + htmlEscape(subj) + '</button></div>';

  container.innerHTML = html;
}

function cleanupSim() {
  if (simTimer) { clearInterval(simTimer); simTimer = null; }
  simState = null;
  simTabSwitchCount = 0;
  var ef = document.getElementById('simFullscreen');
  if (ef) ef.remove();
  document.removeEventListener('visibilitychange', simTabSwitch);
}

// Window exports
window.getDefaultSimQuestions = getDefaultSimQuestions;
window.renderSimQuestionBank = renderSimQuestionBank;
window.showAddSimQuestionModal = showAddSimQuestionModal;
window.saveSimQuestion = saveSimQuestion;
window.showEditSimQuestionModal = showEditSimQuestionModal;
window.updateSimQuestion = updateSimQuestion;
window.deleteSimQuestion = deleteSimQuestion;
window.seedDefaultSimQuestions = seedDefaultSimQuestions;
window.renderSimAttempts = renderSimAttempts;
window.renderSimCenter = renderSimCenter;
window.startSimulation = startSimulation;
window.startMixedSimulation = startMixedSimulation;
window.renderSimFullscreen = renderSimFullscreen;
window.updateSimUI = updateSimUI;
window.simSelectAnswer = simSelectAnswer;
window.simNextQuestion = simNextQuestion;
window.simPrevQuestion = simPrevQuestion;
window.simGoToQuestion = simGoToQuestion;
window.confirmFinishSim = confirmFinishSim;
window.finishSimulation = finishSimulation;
window.renderSimResult = renderSimResult;
window.cleanupSim = cleanupSim;
