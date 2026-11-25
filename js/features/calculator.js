/**
 * EduVerse - Interactive Scientific Calculator Engine
 * Handles scientific calculations for the floating calculator.
 */

(function () {
  'use strict';

  window.EduVerseCalculator = window.EduVerseCalculator || {};

  var calcExpression = '';
  var calcHistory = '';
  var lastAns = '0';

  /**
   * Open Scientific Calculator Modal
   */
  function openCalculator() {
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
   * Render Calculator UI
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
      + '        <h3 style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">EduVerse Scientific Calculator</h3>'
      + '        <span style="font-size:11px;color:#94a3b8;">Scientific functions · Instant results</span>'
      + '      </div>'
      + '    </div>'
      + '    <button onclick="window.EduVerseCalculator.closeCalculator()" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color 0.2s;" hover="color:#ffffff;">&times;</button>'
      + '  </div>'

      // Body
      + '  <div style="padding:16px;">';

    html += renderScientificTab();

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
   * Keyboard Listener for Scientific Calculator
   */
  function attachKeyListeners() {
    if (window._calcKeyListenerAttached) return;
    window._calcKeyListenerAttached = true;

    document.addEventListener('keydown', function(e) {
      var modal = document.getElementById('calcModal');
      if (!modal || !modal.classList.contains('active')) return;

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
    calcInput: calcInput,
    calcEvaluate: calcEvaluate
  };

  window.openCalculator = openCalculator;

})();
