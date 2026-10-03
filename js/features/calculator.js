/**
 * EduVerse - Reconstructed Interactive Scientific & Academic Calculator Engine
 * Handles scientific calculations, grade/GPA calculations, and fee discount computations.
 */

(function () {
  'use strict';

  window.EduVerseCalculator = window.EduVerseCalculator || {};

  var calcExpression = '';
  var calcHistory = '';
  var activeTab = 'scientific'; // 'scientific' | 'gpa' | 'fees'
  var lastAns = '0';

  // GPA Subjects Array
  var gpaSubjects = [
    { name: 'Mathematics', ca: 28, exam: 58, unit: 3 },
    { name: 'English Language', ca: 25, exam: 55, unit: 3 },
    { name: 'Integrated Sciences', ca: 27, exam: 60, unit: 3 },
    { name: 'Computer Studies & AI', ca: 29, exam: 62, unit: 3 }
  ];

  // Fee Calculator Fields
  var feeInputs = {
    tuition: 150000,
    ict: 15000,
    lab: 10000,
    boarding: 45000,
    discountPct: 10
  };

  /**
   * Open Scientific & Academic Calculator Modal
   */
  function openCalculator(tab) {
    if (tab) activeTab = tab;

    var modal = document.getElementById('calcModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'calcModal';
      modal.className = 'modal-overlay active';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }

    renderCalculatorUI();
    attachKeyListeners();
  }

  /**
   * Close Calculator Modal
   */
  function closeCalculator() {
    var modal = document.getElementById('calcModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  /**
   * Switch Active Mode Tab
   */
  function setTab(tab) {
    activeTab = tab;
    renderCalculatorUI();
  }

  /**
   * Render Reconstructed Calculator UI
   */
  function renderCalculatorUI() {
    var modal = document.getElementById('calcModal');
    if (!modal) return;

    var html = ''
      + '<div style="background:#0f172a;border:1px solid #334155;border-radius:20px;width:100%;max-width:540px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);color:#f8fafc;overflow:hidden;font-family:Inter,system-ui,sans-serif;">'
      
      // Header Bar
      + '  <div style="background:#1e293b;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;">'
      + '    <div style="display:flex;align-items:center;gap:10px;">'
      + '      <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#3b82f6);display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:16px;">'
      + '        <i class="fas fa-calculator"></i>'
      + '      </div>'
      + '      <div>'
      + '        <h3 style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">EduVerse Academic Calculator</h3>'
      + '        <span style="font-size:11px;color:#94a3b8;">Scientific · GPA Grade Point · Fee Discount</span>'
      + '      </div>'
      + '    </div>'
      + '    <button onclick="window.EduVerseCalculator.closeCalculator()" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color 0.2s;" hover="color:#ffffff;">&times;</button>'
      + '  </div>'

      // Mode Navigation Tabs
      + '  <div style="display:flex;background:#0f172a;padding:8px 16px;border-bottom:1px solid #1e293b;gap:6px;">'
      + '    <button onclick="window.EduVerseCalculator.setTab(\'scientific\')" style="flex:1;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;' + (activeTab === 'scientific' ? 'background:#2563eb;color:#ffffff;box-shadow:0 2px 6px rgba(37,99,235,0.4);' : 'background:#1e293b;color:#94a3b8;') + '">'
      + '      <i class="fas fa-microchip"></i> Scientific'
      + '    </button>'
      + '    <button onclick="window.EduVerseCalculator.setTab(\'gpa\')" style="flex:1;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;' + (activeTab === 'gpa' ? 'background:#2563eb;color:#ffffff;box-shadow:0 2px 6px rgba(37,99,235,0.4);' : 'background:#1e293b;color:#94a3b8;') + '">'
      + '      <i class="fas fa-graduation-cap"></i> GPA & Grades'
      + '    </button>'
      + '    <button onclick="window.EduVerseCalculator.setTab(\'fees\')" style="flex:1;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;' + (activeTab === 'fees' ? 'background:#2563eb;color:#ffffff;box-shadow:0 2px 6px rgba(37,99,235,0.4);' : 'background:#1e293b;color:#94a3b8;') + '">'
      + '      <i class="fas fa-file-invoice-dollar"></i> Fee Discount'
      + '    </button>'
      + '  </div>'

      // Body Section based on active tab
      + '  <div style="padding:16px;">';

    if (activeTab === 'scientific') {
      html += renderScientificTab();
    } else if (activeTab === 'gpa') {
      html += renderGpaTab();
    } else {
      html += renderFeesTab();
    }

    html += '  </div>'
      + '</div>';

    modal.innerHTML = html;
  }

  /**
   * Render Tab 1: Scientific Calculator
   */
  function renderScientificTab() {
    var displayVal = calcExpression || '0';
    var historyVal = calcHistory || '&nbsp;';

    return ''
      // Digital LCD Display Screen
      + '<div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:14px 18px;margin-bottom:14px;text-align:right;box-shadow:inset 0 2px 6px rgba(0,0,0,0.8);">'
      + '  <div style="font-size:12px;color:#64748b;font-family:monospace;min-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + historyVal + '</div>'
      + '  <div style="font-size:28px;font-weight:700;color:#38bdf8;font-family:monospace;letter-spacing:1px;overflow-x:auto;white-space:nowrap;">' + esc(displayVal) + '</div>'
      + '</div>'

      // Tactile Scientific Keypad Grid
      + '<div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;">'
      
      // Scientific Functions (Row 1 & 2)
      + btn('sin', 'sin(', 'btn-func') + btn('cos', 'cos(', 'btn-func') + btn('tan', 'tan(', 'btn-func') + btn('log', 'log(', 'btn-func') + btn('ln', 'ln(', 'btn-func')
      + btn('√', '√(', 'btn-func') + btn('x²', '^2', 'btn-func') + btn('x³', '^3', 'btn-func') + btn('(', '(', 'btn-func') + btn(')', ')', 'btn-func')

      // Action Keys (Row 3)
      + btn('AC', 'AC', 'btn-action-danger')
      + btn('DEL', 'DEL', 'btn-action-warning')
      + btn('%', '%', 'btn-op')
      + btn('÷', '÷', 'btn-op')
      + btn('π', 'π', 'btn-func')

      // Digits & Operators (Row 4)
      + btn('7', '7', 'btn-num') + btn('8', '8', 'btn-num') + btn('9', '9', 'btn-num') + btn('×', '×', 'btn-op') + btn('^', '^', 'btn-op')

      // Digits & Operators (Row 5)
      + btn('4', '4', 'btn-num') + btn('5', '5', 'btn-num') + btn('6', '6', 'btn-num') + btn('-', '-', 'btn-op') + btn('√x', '√(', 'btn-func')

      // Digits & Operators (Row 6)
      + btn('1', '1', 'btn-num') + btn('2', '2', 'btn-num') + btn('3', '3', 'btn-num') + btn('+', '+', 'btn-op') + btn('Ans', 'Ans', 'btn-func')

      // Bottom Row
      + btn('0', '0', 'btn-num') + btn('.', '.', 'btn-num') + btn('00', '00', 'btn-num')
      + '<button onclick="window.EduVerseCalculator.calcEvaluate()" style="grid-column:span 2;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:none;border-radius:10px;font-size:18px;font-weight:800;padding:12px;cursor:pointer;box-shadow:0 4px 10px rgba(16,185,129,0.3);">=</button>'

      + '</div>';
  }

  function btn(label, value, btnClass) {
    var bg = '#1e293b';
    var fg = '#f8fafc';
    var border = '1px solid #334155';

    if (btnClass === 'btn-num') {
      bg = '#1e293b';
      fg = '#ffffff';
    } else if (btnClass === 'btn-op') {
      bg = '#2563eb';
      fg = '#ffffff';
      border = 'none';
    } else if (btnClass === 'btn-func') {
      bg = '#0f172a';
      fg = '#38bdf8';
      border = '1px solid #1e293b';
    } else if (btnClass === 'btn-action-danger') {
      bg = '#ef4444';
      fg = '#ffffff';
      border = 'none';
    } else if (btnClass === 'btn-action-warning') {
      bg = '#f59e0b';
      fg = '#0f172a';
      border = 'none';
    }

    return '<button onclick="window.EduVerseCalculator.calcInput(\'' + value + '\')" style="background:' + bg + ';color:' + fg + ';border:' + border + ';border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;transition:transform 0.1s, background 0.1s;box-shadow:0 2px 4px rgba(0,0,0,0.2);">' + label + '</button>';
  }

  /**
   * Handle Calculator Input Key Press
   */
  function calcInput(val) {
    if (val === 'AC') {
      calcExpression = '';
      calcHistory = '';
    } else if (val === 'DEL') {
      calcExpression = calcExpression.slice(0, -1);
    } else if (val === 'Ans') {
      calcExpression += lastAns;
    } else {
      calcExpression += val;
    }
    renderCalculatorUI();
  }

  /**
   * Evaluate Scientific Expression
   */
  function calcEvaluate() {
    if (!calcExpression) return;

    try {
      calcHistory = calcExpression + ' =';
      var expr = calcExpression;

      // Safe String Transformations
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'Math.PI');
      expr = expr.replace(/\^2/g, '**2').replace(/\^3/g, '**3').replace(/\^/g, '**');
      expr = expr.replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(');
      expr = expr.replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/√\(/g, 'Math.sqrt(');
      expr = expr.replace(/%/g, '/100');

      // Strict evaluation safety
      var result = Function('"use strict"; return (' + expr + ')')();
      if (typeof result === 'number' && !isNaN(result)) {
        if (!Number.isInteger(result)) {
          result = parseFloat(result.toFixed(6));
        }
        calcExpression = String(result);
        lastAns = calcExpression;
      } else {
        calcExpression = 'Error';
      }
    } catch (e) {
      calcExpression = 'Error';
    }
    renderCalculatorUI();
  }

  /**
   * Render Tab 2: GPA / Grade Point Calculator
   */
  function renderGpaTab() {
    var totalWeightedPoints = 0;
    var totalUnits = 0;

    var rowsHtml = '';
    gpaSubjects.forEach(function(s, idx) {
      var ca = parseFloat(s.ca) || 0;
      var exam = parseFloat(s.exam) || 0;
      var total = ca + exam;
      var unit = parseFloat(s.unit) || 1;

      var gradeInfo = calculateGradeLetter(total);
      var points = gradeInfo.point * unit;

      totalWeightedPoints += points;
      totalUnits += unit;

      rowsHtml += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 30px;gap:8px;align-items:center;background:#1e293b;padding:8px 12px;border-radius:8px;margin-bottom:6px;font-size:12px;">'
        + '  <input type="text" value="' + esc(s.name) + '" onchange="window.EduVerseCalculator.updateGpaSubj(' + idx + ',\'name\',this.value)" style="background:#0f172a;border:1px solid #334155;color:#fff;padding:4px 8px;border-radius:6px;width:100%;font-size:12px;">'
        + '  <input type="number" value="' + ca + '" max="40" onchange="window.EduVerseCalculator.updateGpaSubj(' + idx + ',\'ca\',this.value)" style="background:#0f172a;border:1px solid #334155;color:#fff;padding:4px 6px;border-radius:6px;width:100%;font-size:12px;text-align:center;">'
        + '  <input type="number" value="' + exam + '" max="60" onchange="window.EduVerseCalculator.updateGpaSubj(' + idx + ',\'exam\',this.value)" style="background:#0f172a;border:1px solid #334155;color:#fff;padding:4px 6px;border-radius:6px;width:100%;font-size:12px;text-align:center;">'
        + '  <div style="font-weight:700;color:#38bdf8;text-align:center;">' + total + ' (' + gradeInfo.letter + ')</div>'
        + '  <input type="number" value="' + unit + '" min="1" max="6" onchange="window.EduVerseCalculator.updateGpaSubj(' + idx + ',\'unit\',this.value)" style="background:#0f172a;border:1px solid #334155;color:#fff;padding:4px 6px;border-radius:6px;width:100%;font-size:12px;text-align:center;">'
        + '  <button onclick="window.EduVerseCalculator.removeGpaSubj(' + idx + ')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;"><i class="fas fa-trash-alt"></i></button>'
        + '</div>';
    });

    var gpa = totalUnits > 0 ? (totalWeightedPoints / totalUnits).toFixed(2) : '0.00';
    var classStanding = getAcademicClass(parseFloat(gpa));

    return ''
      + '<div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
      + '  <div>'
      + '    <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Calculated Termly GPA / CGPA</div>'
      + '    <div style="font-size:32px;font-weight:800;color:#10b981;font-family:monospace;">' + gpa + ' <span style="font-size:14px;color:#64748b;">/ 5.00</span></div>'
      + '  </div>'
      + '  <div style="text-align:right;">'
      + '    <span style="background:#1e3a8a;color:#93c5fd;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;">' + classStanding + '</span>'
      + '    <div style="font-size:11px;color:#64748b;margin-top:4px;">Total Credits: ' + totalUnits + ' Units</div>'
      + '  </div>'
      + '</div>'

      // Column Headers
      + '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 30px;gap:8px;padding:0 12px 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">'
      + '  <div>Subject Name</div>'
      + '  <div style="text-align:center;">CA (40)</div>'
      + '  <div style="text-align:center;">Exam (60)</div>'
      + '  <div style="text-align:center;">Score</div>'
      + '  <div style="text-align:center;">Unit</div>'
      + '  <div></div>'
      + '</div>'

      + '<div style="max-height:200px;overflow-y:auto;margin-bottom:12px;">' + rowsHtml + '</div>'

      + '<button onclick="window.EduVerseCalculator.addGpaSubj()" class="btn btn-sm btn-outline" style="width:100%;border-color:#334155;color:#38bdf8;padding:8px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-plus-circle"></i> Add Subject</button>';
  }

  function calculateGradeLetter(total) {
    if (total >= 70) return { letter: 'A', point: 5.0 };
    if (total >= 60) return { letter: 'B', point: 4.0 };
    if (total >= 50) return { letter: 'C', point: 3.0 };
    if (total >= 45) return { letter: 'D', point: 2.0 };
    if (total >= 40) return { letter: 'E', point: 1.0 };
    return { letter: 'F', point: 0.0 };
  }

  function getAcademicClass(gpa) {
    if (gpa >= 4.50) return 'First Class / Distinction';
    if (gpa >= 3.50) return 'Second Class Upper / Merit';
    if (gpa >= 2.40) return 'Second Class Lower';
    if (gpa >= 1.50) return 'Third Class Pass';
    return 'Probation / Unsatisfactory';
  }

  function updateGpaSubj(idx, field, val) {
    if (gpaSubjects[idx]) {
      gpaSubjects[idx][field] = field === 'name' ? val : (parseFloat(val) || 0);
      renderCalculatorUI();
    }
  }

  function addGpaSubj() {
    gpaSubjects.push({ name: 'Subject ' + (gpaSubjects.length + 1), ca: 25, exam: 50, unit: 3 });
    renderCalculatorUI();
  }

  function removeGpaSubj(idx) {
    gpaSubjects.splice(idx, 1);
    renderCalculatorUI();
  }

  /**
   * Render Tab 3: Fee Discount Calculator
   */
  function renderFeesTab() {
    var gross = (feeInputs.tuition || 0) + (feeInputs.ict || 0) + (feeInputs.lab || 0) + (feeInputs.boarding || 0);
    var discPct = parseFloat(feeInputs.discountPct) || 0;
    var discAmt = (gross * discPct) / 100;
    var netPayable = gross - discAmt;

    return ''
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">'
      + '  <div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:12px;">'
      + '    <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Gross Fee Total</div>'
      + '    <div style="font-size:20px;font-weight:700;color:#f8fafc;font-family:monospace;margin-top:2px;">₦' + gross.toLocaleString() + '</div>'
      + '  </div>'
      + '  <div style="background:#020617;border:1px solid #10b981;border-radius:12px;padding:12px;">'
      + '    <div style="font-size:11px;color:#10b981;font-weight:700;text-transform:uppercase;">Net Payable Fee</div>'
      + '    <div style="font-size:20px;font-weight:800;color:#10b981;font-family:monospace;margin-top:2px;">₦' + netPayable.toLocaleString() + '</div>'
      + '  </div>'
      + '</div>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;font-size:12px;">'
      + '  <div>'
      + '    <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Tuition Fee (₦)</label>'
      + '    <input type="number" value="' + feeInputs.tuition + '" onchange="window.EduVerseCalculator.updateFee(\'tuition\',this.value)" style="width:100%;background:#1e293b;border:1px solid #334155;color:#fff;padding:8px;border-radius:6px;">'
      + '  </div>'
      + '  <div>'
      + '    <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">ICT & E-Learning (₦)</label>'
      + '    <input type="number" value="' + feeInputs.ict + '" onchange="window.EduVerseCalculator.updateFee(\'ict\',this.value)" style="width:100%;background:#1e293b;border:1px solid #334155;color:#fff;padding:8px;border-radius:6px;">'
      + '  </div>'
      + '  <div>'
      + '    <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Lab & STEM Suite (₦)</label>'
      + '    <input type="number" value="' + feeInputs.lab + '" onchange="window.EduVerseCalculator.updateFee(\'lab\',this.value)" style="width:100%;background:#1e293b;border:1px solid #334155;color:#fff;padding:8px;border-radius:6px;">'
      + '  </div>'
      + '  <div>'
      + '    <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Boarding / Transport (₦)</label>'
      + '    <input type="number" value="' + feeInputs.boarding + '" onchange="window.EduVerseCalculator.updateFee(\'boarding\',this.value)" style="width:100%;background:#1e293b;border:1px solid #334155;color:#fff;padding:8px;border-radius:6px;">'
      + '  </div>'
      + '</div>'

      + '<div style="background:#1e293b;border-radius:10px;padding:12px;margin-bottom:14px;">'
      + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
      + '    <label style="color:#f59e0b;font-weight:700;font-size:12px;"><i class="fas fa-tag"></i> Scholarship / Early Bird Discount (%)</label>'
      + '    <span style="font-weight:700;color:#f59e0b;font-size:13px;">' + discPct + '% (-₦' + discAmt.toLocaleString() + ')</span>'
      + '  </div>'
      + '  <input type="range" min="0" max="50" step="5" value="' + discPct + '" oninput="window.EduVerseCalculator.updateFee(\'discountPct\',this.value)" style="width:100%;accent-color:#f59e0b;cursor:pointer;">'
      + '</div>'

      + '<div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:12px;font-size:12px;color:#94a3b8;display:flex;justify-content:space-between;">'
      + '  <span><strong>60% 1st Term Deposit:</strong> ₦' + (netPayable * 0.6).toLocaleString() + '</span>'
      + '  <span><strong>40% Balance:</strong> ₦' + (netPayable * 0.4).toLocaleString() + '</span>'
      + '</div>';
  }

  function updateFee(field, val) {
    feeInputs[field] = parseFloat(val) || 0;
    renderCalculatorUI();
  }

  /**
   * Keyboard Listener for Scientific Calculator
   */
  function attachKeyListeners() {
    if (window._calcKeyListenerAttached) return;
    window._calcKeyListenerAttached = true;

    document.addEventListener('keydown', function(e) {
      var modal = document.getElementById('calcModal');
      if (!modal || !modal.classList.contains('active') || activeTab !== 'scientific') return;

      var key = e.key;
      if (key >= '0' && key <= '9') calcInput(key);
      else if (key === '.') calcInput('.');
      else if (key === '+' || key === '-' || key === '*' || key === '/') {
        var map = { '*': '×', '/': '÷' };
        calcInput(map[key] || key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calcEvaluate();
      } else if (key === 'Backspace') {
        calcInput('DEL');
      } else if (key === 'Escape') {
        closeCalculator();
      }
    });
  }

  // Export module globally
  window.EduVerseCalculator = {
    openCalculator: openCalculator,
    closeCalculator: closeCalculator,
    setTab: setTab,
    calcInput: calcInput,
    calcEvaluate: calcEvaluate,
    updateGpaSubj: updateGpaSubj,
    addGpaSubj: addGpaSubj,
    removeGpaSubj: removeGpaSubj,
    updateFee: updateFee
  };

  window.openCalculator = openCalculator;

})();
