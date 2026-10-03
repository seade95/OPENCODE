/**
 * EduVerse - Dedicated Student Virtual Bank Account & USSD Reconciliation Module
 * Assigns student-specific virtual account numbers (Wema/Monnify/Paystack) and USSD codes,
 * with real-time transfer reconciliation simulator and instant bursary ledger updates.
 */

(function () {
  'use strict';

  window.EduVerseVirtualAccounts = window.EduVerseVirtualAccounts || {};

  /**
   * Generate dedicated virtual account number for student
   */
  function getStudentVirtualAccount(studentId) {
    studentId = studentId || 'STU001';
    var hash = 0;
    for (var i = 0; i < studentId.length; i++) {
      hash = studentId.charCodeAt(i) + ((hash << 5) - hash);
    }
    var num = Math.abs(hash % 8999999999) + 1000000000;
    return {
      studentId: studentId,
      bankName: 'Wema Bank / Paystack Virtual Account',
      accountNumber: '90' + num.toString().substring(0, 8),
      accountName: 'EduVerse - Student Fee Account',
      ussdCode: '*737*000*' + studentId + '#'
    };
  }

  /**
   * Trigger transfer reconciliation simulation
   */
  function simulateBankTransferReconciliation(studentObj, amount) {
    studentObj = studentObj || { id: 'STU001', name: 'Alex Johnson', class: 'SSS 2' };
    amount = amount || 120000;

    fetch('/api/virtual-accounts/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: studentObj.id,
        studentName: studentObj.name,
        amount: amount,
        reference: 'NIP_TRANSFER_' + Date.now(),
        bankName: 'Wema / Paystack Virtual Account'
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(resData) {
      if (resData && resData.success) {
        // Update local fees data
        try {
          var key = localStorage.getItem('activeTenantKey') || 'eduverse_data';
          var raw = localStorage.getItem(key);
          if (raw) {
            var data = JSON.parse(raw);
            if (!data.fees) data.fees = [];
            data.fees.unshift({
              id: 'FEE_' + Date.now(),
              studentName: studentObj.name,
              term: 'First Term 2026/2027',
              feeType: 'Tuition & ICT Fee (Virtual Account Transfer)',
              amount: amount,
              status: 'paid',
              paid: true,
              date: new Date().toISOString().split('T')[0],
              ref: resData.transactionRef
            });
            localStorage.setItem(key, JSON.stringify(data));
          }
        } catch(e) {}

        if (typeof window.toast === 'function') {
          window.toast('Bank Transfer Reconciled! ₦' + amount.toLocaleString() + ' credited to ' + studentObj.name + '\'s ledger.', 'success');
        }

        // Send WhatsApp confirmation
        if (window.EduVerseWhatsAppSMS && typeof window.EduVerseWhatsAppSMS.sendWhatsAppNotification === 'function') {
          window.EduVerseWhatsAppSMS.sendWhatsAppNotification({
            phone: '+2348030001111',
            recipientName: 'Parent of ' + studentObj.name,
            type: 'fee_receipt',
            message: 'Payment of ₦' + amount.toLocaleString() + ' for ' + studentObj.name + ' successfully received via Virtual Account. Receipt Ref: ' + resData.receiptNo + '. Thank you!',
            schoolName: 'EduVerse Academy'
          });
        }

        renderVirtualAccountsHub('virtualAccountContainer');
      }
    })
    .catch(function() {});
  }

  /**
   * Render Virtual Account & USSD Reconciliation Hub UI
   */
  function renderVirtualAccountsHub(containerId) {
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    var student = { id: 'STU001', name: 'Alex Johnson', class: 'SSS 2' };
    var acc = getStudentVirtualAccount(student.id);

    var html = '<div class="card" style="padding:24px;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">'
      + '  <div>'
      + '    <h3 style="font-size:18px;font-weight:700;color:var(--primary);margin:0;"><i class="fas fa-university" style="color:#059669;"></i> Student Virtual Bank Account & USSD Reconciliation</h3>'
      + '    <p style="font-size:13px;color:#64748b;margin:4px 0 0 0;">Automated 24/7 bank transfer reconciliation with instant bursary ledger clearance.</p>'
      + '  </div>'
      + '  <span class="badge badge-paid" style="background:#d1fae5;color:#065f46;"><i class="fas fa-check-circle"></i> Paystack / Monnify Engine Active</span>'
      + '</div>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">'
      
      // Virtual Account Details Box
      + '  <div style="background:linear-gradient(135deg, #064e3b 0%, #047857 100%);color:#fff;border-radius:16px;padding:20px;box-shadow:0 10px 25px -5px rgba(6,78,59,0.3);">'
      + '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:8px;">'
      + '      <span style="font-size:12px;font-weight:700;letter-spacing:1px;color:#f59e0b;"><i class="fas fa-wallet"></i> DEDICATED STUDENT VIRTUAL ACCOUNT</span>'
      + '      <span style="font-size:10px;background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:4px;">INSTANT CLEARANCE</span>'
      + '    </div>'
      + '    <div style="font-size:13px;opacity:0.9;margin-bottom:4px;">Bank Name: <strong>' + acc.bankName + '</strong></div>'
      + '    <div style="font-size:24px;font-weight:800;letter-spacing:2px;font-family:monospace;margin:8px 0;color:#fef08a;">' + acc.accountNumber + '</div>'
      + '    <div style="font-size:13px;opacity:0.9;">Account Name: <strong>' + acc.accountName + ' (' + student.name + ')</strong></div>'
      + '    <div style="margin-top:12px;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;font-size:12px;">'
      + '      <i class="fas fa-mobile-alt"></i> Mobile USSD Code: <code style="color:#fef08a;">' + acc.ussdCode + '</code>'
      + '    </div>'
      + '  </div>'

      // Bank Transfer Simulation Box
      + '  <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:16px;padding:20px;">'
      + '    <h4 style="font-size:15px;margin-bottom:12px;color:#0f2440;"><i class="fas fa-sync" style="color:#2563eb;"></i> Test Transfer & Reconciliation Simulator</h4>'
      + '    <p style="font-size:12px;color:#64748b;margin-bottom:12px;">Simulate a parent transferring tuition fees to this virtual account to test instant clearance.</p>'
      + '    <div style="margin-bottom:12px;">'
      + '      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Amount to Transfer (₦)</label>'
      + '      <input type="number" id="reconAmountInput" class="form-control" value="120000" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;">'
      + '    </div>'
      + '    <button class="btn btn-primary" style="background:#059669;border:none;width:100%;font-weight:700;" onclick="window.EduVerseVirtualAccounts.triggerSimulation()"><i class="fas fa-bolt"></i> Simulate Bank Transfer & Reconcile Now</button>'
      + '  </div>'
      + '</div></div>';

    container.innerHTML = html;
  }

  window.EduVerseVirtualAccounts = {
    getStudentVirtualAccount: getStudentVirtualAccount,
    simulateBankTransferReconciliation: simulateBankTransferReconciliation,
    renderVirtualAccountsHub: renderVirtualAccountsHub,
    triggerSimulation: function() {
      var amtInput = document.getElementById('reconAmountInput');
      var amount = amtInput ? parseFloat(amtInput.value) : 120000;
      simulateBankTransferReconciliation({ id: 'STU001', name: 'Alex Johnson', class: 'SSS 2' }, amount);
    }
  };

})();
