/**
 * EduVerse - AI Diagnostic Weakness Analysis & Personalised Remedial Tutor Module
 * Connects to Gemini API endpoint (/api/ai/diagnostic) to evaluate student CBT/exam scores,
 * map sub-topic weaknesses, and generate a 14-day remedial study plan and practice drills.
 */

(function () {
  'use strict';

  window.EduVerseAIRemedialTutor = window.EduVerseAIRemedialTutor || {};

  /**
   * Request AI Diagnostic Analysis from server API
   */
  function fetchAIDiagnosticReport(params, callback) {
    fetch('/api/ai/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    .then(function(res) { return res.json(); })
    .then(function(resData) {
      if (resData && resData.success && resData.data) {
        callback(null, resData.data);
      } else {
        callback(new Error(resData.error || 'Diagnostic report error'));
      }
    })
    .catch(function(err) {
      callback(err);
    });
  }

  /**
   * Render AI Remedial Tutor Modal/View
   */
  function openAIRemedialModal(studentName, subject, examTitle, score, total) {
    score = score || 24;
    total = total || 30;
    subject = subject || 'Mathematics & Science';
    examTitle = examTitle || 'UTME / JAMB 4-Subject Mock Simulation';
    studentName = studentName || 'Alex Johnson';

    var modalHtml = '<div style="padding:10px;max-width:700px;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
      + '  <h3 style="font-size:18px;font-weight:700;color:var(--primary);margin:0;"><i class="fas fa-brain" style="color:#f59e0b;"></i> AI Diagnostic & Personalised Remedial Tutor</h3>'
      + '  <span class="badge badge-paid" style="background:#dbeafe;color:#1e40af;"><i class="fas fa-microchip"></i> Gemini AI Engine</span>'
      + '</div>'
      + '<p style="font-size:13px;color:#64748b;margin-bottom:16px;">Evaluating CBT Performance for <strong>' + studentName + '</strong> in <em>' + subject + '</em> (' + score + '/' + total + ')</p>'
      + '<div id="aiDiagnosticBody" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i><p style="margin-top:12px;font-weight:600;">Gemini AI is analyzing topic weaknesses and building your 14-day study plan...</p></div>'
      + '</div>';

    if (typeof window.openModal === 'function') {
      window.openModal(modalHtml);
    }

    fetchAIDiagnosticReport({
      studentName: studentName,
      classLevel: 'SSS 2',
      subject: subject,
      examTitle: examTitle,
      score: score,
      totalQuestions: total,
      wrongTopics: ['Calculus & Equations', 'Graph Interpretation', 'Practical Mechanics']
    }, function(err, data) {
      var bodyEl = document.getElementById('aiDiagnosticBody');
      if (!bodyEl) return;

      if (err || !data) {
        bodyEl.innerHTML = '<div style="color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Unable to generate diagnostic report. Please try again.</div>';
        return;
      }

      var html = '<div style="text-align:left;">'
        + '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;margin-bottom:16px;">'
        + '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
        + '    <span style="font-size:14px;font-weight:700;color:#0369a1;"><i class="fas fa-award"></i> ' + (data.performanceBand || 'Developing Mastery') + '</span>'
        + '    <span style="font-size:16px;font-weight:800;color:#0284c7;">' + (data.masteryPercent || 80) + '% Score</span>'
        + '  </div>'
        + '  <p style="font-size:13px;color:#334155;margin:0;">' + (data.summary || '') + '</p>'
        + '</div>'

        + '<h4 style="font-size:14px;margin-bottom:8px;font-weight:700;color:#0f2440;"><i class="fas fa-chart-line" style="color:#ef4444;"></i> Identified Sub-Topic Weakness Areas</h4>'
        + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';

      (data.weakSubTopics || []).forEach(function(w) {
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + (w.severity === 'High' ? '#ef4444' : '#f59e0b') + ';border-radius:8px;padding:10px 14px;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
          + '  <strong style="font-size:13px;color:#0f2440;">' + w.topic + '</strong>'
          + '  <span class="badge" style="background:' + (w.severity === 'High' ? '#fee2e2;color:#991b1b;' : '#fef3c7;color:#92400e;') + 'font-size:10px;">' + w.severity + ' Severity</span>'
          + '</div>'
          + '<p style="font-size:12px;color:#64748b;margin:4px 0 0 0;">' + w.explanation + '</p>'
          + '</div>';
      });

      html += '</div>'
        + '<h4 style="font-size:14px;margin-bottom:8px;font-weight:700;color:#0f2440;"><i class="fas fa-calendar-alt" style="color:#2563eb;"></i> Tailored 14-Day Remedial Action Plan</h4>'
        + '<div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:16px;">';

      (data.remedialPlan || []).forEach(function(p) {
        html += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center;">'
          + '<div style="background:#2563eb;color:#fff;font-weight:700;font-size:11px;padding:4px 8px;border-radius:6px;white-space:nowrap;">' + p.day + '</div>'
          + '<div>'
          + '  <div style="font-size:13px;font-weight:700;color:#0f2440;">' + p.focus + '</div>'
          + '  <div style="font-size:12px;color:#64748b;">' + p.action + '</div>'
          + '</div>'
          + '</div>';
      });

      html += '</div>';

      if (data.practiceQuestions && data.practiceQuestions.length) {
        html += '<h4 style="font-size:14px;margin-bottom:8px;font-weight:700;color:#0f2440;"><i class="fas fa-tasks" style="color:#10b981;"></i> Personalised Practice Drill</h4>'
          + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;">';

        data.practiceQuestions.forEach(function(q, idx) {
          html += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #dcfce7;">'
            + '<div style="font-size:13px;font-weight:700;color:#14532d;">Q' + (idx + 1) + '. ' + q.question + '</div>'
            + '<div style="font-size:12px;color:#166534;margin-top:4px;"><strong>Correct Answer:</strong> ' + q.answer + '</div>'
            + '<div style="font-size:11px;color:#374151;margin-top:2px;"><em>' + q.explanation + '</em></div>'
            + '</div>';
        });

        html += '</div>';
      }

      html += '<div style="margin-top:20px;text-align:right;">'
        + '<button class="btn btn-outline" onclick="closeModal()">Close</button>'
        + '<button class="btn btn-primary" style="margin-left:8px;" onclick="window.print()"><i class="fas fa-print"></i> Save Study Plan PDF</button>'
        + '</div></div>';

      bodyEl.innerHTML = html;
    });
  }

  window.EduVerseAIRemedialTutor = {
    fetchAIDiagnosticReport: fetchAIDiagnosticReport,
    openAIRemedialModal: openAIRemedialModal
  };

})();
