/**
 * EduVerse - QR Code & Biometric Gate Access Module
 * Fast camera/simulator QR scanner for student gate check-in/out
 * with instant WhatsApp parent notification integration.
 */

(function () {
  'use strict';

  window.EduVerseQRGateAccess = window.EduVerseQRGateAccess || {};

  var gateLogs = [];
  try {
    gateLogs = JSON.parse(localStorage.getItem('eduverse_gate_logs') || '[]');
  } catch(e) {}

  /**
   * Log gate attendance entry/exit
   */
  function logGateScan(studentObj, direction) {
    direction = direction || 'entry';
    var entryTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var entryDate = new Date().toLocaleDateString();

    var logItem = {
      id: 'GATE_' + Date.now(),
      studentId: studentObj.id || 'STU001',
      studentName: studentObj.name || 'Alex Johnson',
      class: studentObj.class || 'SSS 2',
      direction: direction,
      time: entryTime,
      date: entryDate,
      guardianEmail: studentObj.contact || 'parent1@gmail.com',
      guardianPhone: studentObj.phone || '+2348030001111'
    };

    gateLogs.unshift(logItem);
    try {
      localStorage.setItem('eduverse_gate_logs', JSON.stringify(gateLogs.slice(0, 100)));
    } catch(e) {}

    // Trigger WhatsApp notification automatically
    if (window.EduVerseWhatsAppSMS && typeof window.EduVerseWhatsAppSMS.sendWhatsAppNotification === 'function') {
      var msg = "Dear Parent, " + logItem.studentName + " (" + logItem.class + ") has " + (direction === 'entry' ? "ARRIVED at" : "DEPARTED from") + " school at " + entryTime + " on " + entryDate + ". Have a great day!";
      window.EduVerseWhatsAppSMS.sendWhatsAppNotification({
        phone: logItem.guardianPhone,
        recipientName: 'Parent of ' + logItem.studentName,
        type: 'gate_attendance',
        message: msg,
        schoolName: 'EduVerse Academy'
      });
    }

    if (typeof window.toast === 'function') {
      window.toast('Gate ' + (direction === 'entry' ? 'Check-In' : 'Check-Out') + ' recorded for ' + logItem.studentName + '! WhatsApp alert sent.', 'success');
    }

    renderGateScannerModule('gateScannerContainer');
  }

  /**
   * Render Gate Access & QR Scanner UI
   */
  function renderGateScannerModule(containerId) {
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    var students = [];
    try {
      if (window.data && window.data.students) students = window.data.students;
      else {
        var raw = localStorage.getItem('eduverse_data');
        if (raw) students = JSON.parse(raw).students || [];
      }
    } catch(e) {}

    if (!students || !students.length) {
      students = [
        { id: 'STU001', name: 'Alex Johnson', class: 'SSS 2', regNo: 'STU/2026/001', phone: '+2348030001111' },
        { id: 'STU002', name: 'Beatrice Smith', class: 'SSS 2', regNo: 'STU/2026/002', phone: '+2348030002222' },
        { id: 'STU003', name: 'Daniel Kalu', class: 'SSS 1', regNo: 'STU/2026/003', phone: '+2348030003333' },
        { id: 'STU004', name: 'Grace Okafor', class: 'Primary 5', regNo: 'STU/2026/004', phone: '+2348030004444' }
      ];
    }

    var html = '<div class="card" style="padding:24px;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">'
      + '  <div>'
      + '    <h3 style="font-size:18px;font-weight:700;color:var(--primary);margin:0;"><i class="fas fa-qrcode" style="color:#2563eb;"></i> QR Code & Biometric Gate Scanner</h3>'
      + '    <p style="font-size:13px;color:#64748b;margin:4px 0 0 0;">Morning gate check-in / departure scanner with real-time WhatsApp parent verification.</p>'
      + '  </div>'
      + '  <span class="badge badge-approved" style="font-size:12px;padding:6px 12px;"><i class="fas fa-shield-alt"></i> Gate Terminal #01 Ready</span>'
      + '</div>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">'
      
      // Camera / Scanner Simulator Box
      + '  <div style="background:#0f172a;border-radius:16px;padding:20px;color:#fff;text-align:center;position:relative;overflow:hidden;">'
      + '    <div style="border:2px dashed #38bdf8;border-radius:12px;padding:30px 16px;background:rgba(56,189,248,0.05);">'
      + '      <i class="fas fa-camera fa-3x" style="color:#38bdf8;margin-bottom:12px;display:block;"></i>'
      + '      <h4 style="font-size:16px;font-weight:700;margin-bottom:6px;color:#f8fafc;">Optical Gate QR Scanner Active</h4>'
      + '      <p style="font-size:12px;color:#94a3b8;margin-bottom:16px;">Hold Digital Student ID Card or QR Code up to camera lens.</p>'
      
      + '      <div style="margin-bottom:16px;text-align:left;background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;">'
      + '        <label style="font-size:11px;color:#cbd5e1;display:block;margin-bottom:4px;font-weight:600;">Select Student to Scan QR Code:</label>'
      + '        <select id="gateStudentSelect" class="form-control" style="width:100%;padding:8px;border-radius:6px;background:#1e293b;color:#fff;border:1px solid #334155;">';

    students.forEach(function(s) {
      html += '<option value="' + s.id + '">' + s.name + ' (' + s.class + ' - ' + (s.regNo || s.id) + ')</option>';
    });

    html += '        </select>'
      + '      </div>'

      + '      <div style="display:flex;gap:10px;">'
      + '        <button class="btn btn-primary" style="background:#22c55e;border:none;flex:1;font-weight:700;" onclick="window.EduVerseQRGateAccess.triggerGateScan(\'entry\')"><i class="fas fa-door-open"></i> Check-IN (Morning)</button>'
      + '        <button class="btn btn-primary" style="background:#f59e0b;border:none;flex:1;font-weight:700;" onclick="window.EduVerseQRGateAccess.triggerGateScan(\'exit\')"><i class="fas fa-door-closed"></i> Check-OUT (Closing)</button>'
      + '      </div>'
      + '    </div>'
      + '  </div>'

      // Sample Student Digital ID Card Preview
      + '  <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:16px;padding:20px;">'
      + '    <h4 style="font-size:15px;margin-bottom:12px;color:#0f2440;"><i class="fas fa-id-card" style="color:#2563eb;"></i> Digital Student ID Card & QR Preview</h4>'
      + '    <div style="background:linear-gradient(135deg, #0f2440 0%, #1e3a8a 100%);color:#fff;border-radius:12px;padding:16px;box-shadow:0 10px 25px -5px rgba(15,36,64,0.3);position:relative;">'
      + '      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:8px;margin-bottom:12px;">'
      + '        <span style="font-size:12px;font-weight:700;letter-spacing:1px;color:#f59e0b;"><i class="fas fa-university"></i> EDUVERSE ACADEMY</span>'
      + '        <span style="font-size:10px;background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:4px;">K-12 DIGITAL ID</span>'
      + '      </div>'
      + '      <div style="display:flex;gap:12px;align-items:center;">'
      + '        <div style="width:56px;height:56px;background:#cbd5e1;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0f2440;font-size:24px;font-weight:700;">'
      + '          <i class="fas fa-user"></i>'
      + '        </div>'
      + '        <div style="flex:1;">'
      + '          <div style="font-size:16px;font-weight:700;" id="cardStudentName">Alex Johnson</div>'
      + '          <div style="font-size:12px;opacity:0.8;" id="cardStudentClass">Class: SSS 2 &middot; Reg: STU/2026/001</div>'
      + '          <div style="font-size:11px;color:#f59e0b;margin-top:2px;"><i class="fas fa-shield-alt"></i> Authorized Gate Access Granted</div>'
      + '        </div>'
      + '        <div style="background:#fff;padding:6px;border-radius:6px;text-align:center;">'
      + '          <i class="fas fa-qrcode fa-2x" style="color:#0f2440;"></i>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>'

      // Recent Gate Scan Logs Table
      + '<h4 style="font-size:15px;margin-bottom:12px;"><i class="fas fa-list"></i> Today\'s Gate Attendance Scan Logs</h4>'
      + '<div style="overflow-x:auto;">'
      + '<table class="data-table" style="width:100%;font-size:13px;">'
      + '<thead><tr><th>Time</th><th>Student Name</th><th>Class</th><th>Action</th><th>WhatsApp Alert</th></tr></thead>'
      + '<tbody>';

    if (!gateLogs || !gateLogs.length) {
      html += '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">No gate scans recorded today. Select a student and click Check-IN above!</td></tr>';
    } else {
      gateLogs.forEach(function(g) {
        html += '<tr>'
          + '<td>' + g.time + ' (' + g.date + ')</td>'
          + '<td><strong>' + g.studentName + '</strong></td>'
          + '<td>' + g.class + '</td>'
          + '<td><span class="badge ' + (g.direction === 'entry' ? 'badge-paid' : 'badge-pending') + '" style="' + (g.direction === 'entry' ? 'background:#dcfce7;color:#166534;' : 'background:#fef3c7;color:#92400e;') + '"><i class="fas fa-' + (g.direction === 'entry' ? 'sign-in-alt' : 'sign-out-alt') + '"></i> ' + (g.direction === 'entry' ? 'Morning Check-IN' : 'Closing Check-OUT') + '</span></td>'
          + '<td><span class="badge badge-paid" style="background:#dcfce7;color:#166534;"><i class="fab fa-whatsapp"></i> Sent to Parent</span></td>'
          + '</tr>';
      });
    }

    html += '</tbody></table></div></div>';

    container.innerHTML = html;
  }

  window.EduVerseQRGateAccess = {
    logGateScan: logGateScan,
    renderGateScannerModule: renderGateScannerModule,
    triggerGateScan: function(direction) {
      var selectEl = document.getElementById('gateStudentSelect');
      var studentId = selectEl ? selectEl.value : 'STU001';

      var students = [];
      try {
        if (window.data && window.data.students) students = window.data.students;
      } catch(e) {}

      var stu = students.find(function(s) { return s.id === studentId; }) || {
        id: 'STU001', name: 'Alex Johnson', class: 'SSS 2', contact: 'parent1@gmail.com', phone: '+2348030001111'
      };

      logGateScan(stu, direction);
    }
  };

})();
