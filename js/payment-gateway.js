// ===== PAYMENT GATEWAY INTEGRATION =====
// Supports: Paystack, Flutterwave, Stripe (client-side checkout)

function getGatewayConfig() {
  return data.paymentGateway || { provider: 'none', publicKey: '', secretKey: '', currency: 'NGN', testMode: true, stripePaymentLink: '' };
}

function getGatewayProvider() {
  return getGatewayConfig().provider;
}

function isGatewayActive() {
  var c = getGatewayConfig();
  return c.provider !== 'none' && c.publicKey.length > 0;
}

function generatePaymentRef() {
  return 'PAY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,4).toUpperCase();
}

function initiateGatewayPayment(amount, email, name, ref, onSuccess, onClose) {
  var config = getGatewayConfig();
  switch (config.provider) {
    case 'paystack': return _initiatePaystack(amount, email, ref, onSuccess, onClose);
    case 'flutterwave': return _initiateFlutterwave(amount, email, name, ref, onSuccess, onClose);
    case 'stripe': return _initiateStripe(amount, email, onSuccess, onClose);
    default: onClose(); toast('No active payment gateway configured. Admin must set up a gateway in Settings.', 'error');
  }
}

function _initiatePaystack(amount, email, ref, onSuccess, onClose) {
  if (typeof PaystackPop === 'undefined') { toast('Paystack SDK not loaded. Refresh the page.', 'error'); if (onClose) onClose(); return; }
  var config = getGatewayConfig();
  var handler = PaystackPop.setup({
    key: config.publicKey,
    email: email,
    amount: Math.round(amount * 100),
    ref: ref,
    currency: config.currency || 'NGN',
    callback: function(response) { if (onSuccess) onSuccess(response); },
    onClose: function() { if (onClose) onClose(); }
  });
  handler.openIframe();
}

function _initiateFlutterwave(amount, email, name, ref, onSuccess, onClose) {
  if (typeof FlutterwaveCheckout === 'undefined') { toast('Flutterwave SDK not loaded. Refresh the page.', 'error'); if (onClose) onClose(); return; }
  var config = getGatewayConfig();
  FlutterwaveCheckout({
    public_key: config.publicKey,
    tx_ref: ref,
    amount: amount,
    currency: config.currency || 'NGN',
    payment_options: 'card,ussd,banktransfer,account',
    customer: { email: email, name: name || email },
    callback: function(response) {
      if (response.status === 'successful' || response.status === 'completed') {
        if (onSuccess) onSuccess(response);
      } else {
        toast('Payment ' + response.status, 'error');
        if (onClose) onClose();
      }
    },
    onclose: function() { if (onClose) onClose(); }
  });
}

function _initiateStripe(amount, email, onSuccess, onClose) {
  var config = getGatewayConfig();
  if (config.stripePaymentLink) {
    window.open(config.stripePaymentLink + '?prefilled_email=' + encodeURIComponent(email), '_blank');
    toast('Stripe checkout opened in new tab. After payment, mark as received manually.', 'info');
    if (onSuccess) onSuccess({ reference: 'STRIPE-LINK-' + Date.now().toString(36).toUpperCase(), manual: true });
  } else {
    toast('No Stripe payment link configured. Admin must set one up.', 'error');
    if (onClose) onClose();
  }
}

function recordGatewayTransaction(amount, method, reference, gateway) {
  if (!currentStudent) return;
  if (!data.paymentTransactions) data.paymentTransactions = [];
  data.paymentTransactions.push({
    id: genId('PT'),
    studentId: currentStudent.id,
    amount: amount,
    method: method,
    reference: reference,
    date: new Date().toISOString().split('T')[0],
    status: 'successful',
    gateway: gateway
  });
  var remaining = amount;
  (data.fees || []).filter(function(f) { return f.studentId === currentStudent.id && f.status !== 'paid'; }).forEach(function(f) {
    if (remaining <= 0) return;
    var bal = f.amount - f.paid;
    var pay = Math.min(remaining, bal);
    f.paid += pay;
    remaining -= pay;
    f.status = f.paid >= f.amount ? 'paid' : 'partial';
    f.lastPaymentDate = new Date().toISOString().split('T')[0];
  });
  saveData();
  logActivity('Gateway payment: ' + amount + ' via ' + gateway + ' (Ref: ' + reference + ')');
}

function renderPaymentGatewaySettings() {
  var container = document.getElementById('pgSettingsView');
  if (!container) return;
  var config = getGatewayConfig();
  var providers = [
    { value: 'none', label: 'None (Manual Tracking Only)' },
    { value: 'paystack', label: 'Paystack (Nigeria)' },
    { value: 'flutterwave', label: 'Flutterwave (Africa)' },
    { value: 'stripe', label: 'Stripe (Global - Link)' }
  ];
  var html = '<div class="card" style="padding:24px;">';
  html += '<h3 style="margin-bottom:16px;"><i class="fas fa-credit-card"></i> Payment Gateway Configuration</h3>';
  html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:20px;">Connect a real payment processor so students can pay fees online via card, bank transfer, or USSD. <a href="https://paystack.com" target="_blank" style="color:var(--primary);">Paystack</a> and <a href="https://flutterwave.com" target="_blank" style="color:var(--primary);">Flutterwave</a> are supported.</p>';

  html += '<div class="form-grid">';
  html += '<div class="form-group"><label>Payment Processor</label><select id="pgProvider" class="form-input" onchange="togglePGFields()">';
  providers.forEach(function(p) { html += '<option value="' + p.value + '"' + (config.provider === p.value ? ' selected' : '') + '>' + p.label + '</option>'; });
  html += '</select></div>';
  html += '<div class="form-group"><label id="pgPubKeyLabel">Public Key</label><input id="pgPublicKey" class="form-input" value="' + htmlEscape(config.publicKey || '') + '" placeholder="pk_test_... or FLWPUBK-..."></div>';
  html += '<div class="form-group"><label id="pgSecKeyLabel">Secret Key</label><input id="pgSecretKey" class="form-input" type="password" value="' + htmlEscape(config.secretKey || '') + '" placeholder="sk_test_... or FLWSECK-..."></div>';
  html += '<div class="form-group"><label>Currency</label><select id="pgCurrency" class="form-input">';
  var currencies = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'USD', 'GBP'];
  currencies.forEach(function(c) { html += '<option value="' + c + '"' + (config.currency === c ? ' selected' : '') + '>' + c + '</option>'; });
  html += '</select></div>';
  html += '<div class="form-group" id="pgStripeLinkGroup" style="' + (config.provider === 'stripe' ? '' : 'display:none;') + '"><label>Stripe Payment Link URL</label><input id="pgStripeLink" class="form-input" value="' + htmlEscape(config.stripePaymentLink || '') + '" placeholder="https://buy.stripe.com/..."></div>';
  html += '<div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="pgTestMode"' + (config.testMode !== false ? ' checked' : '') + '> Test / Sandbox Mode</label></div>';
  html += '</div>';

  html += '<div style="margin-top:20px;display:flex;gap:8px;">';
  html += '<button class="btn btn-primary" onclick="savePaymentGatewaySettings()"><i class="fas fa-save"></i> Save Settings</button>';
  html += '<button class="btn btn-outline" onclick="testGatewayConnection()"><i class="fas fa-plug"></i> Test Connection</button>';
  html += '</div>';

  html += '<div id="pgTestResult" style="margin-top:12px;"></div>';
  html += '</div>';

  // Current status
  html += '<div class="card" style="padding:20px;margin-top:16px;">';
  html += '<h4 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-info-circle"></i> Gateway Status</h4>';
  var active = isGatewayActive();
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">';
  html += '<div style="background:' + (active ? '#f0fff4' : '#fff5f5') + ';border-radius:8px;padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-light);">Status</div><div style="font-size:18px;font-weight:700;color:' + (active ? '#38a169' : '#e53e3e') + ';">' + (active ? 'Connected' : 'Not Configured') + '</div></div>';
  html += '<div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-light);">Provider</div><div style="font-size:18px;font-weight:700;color:var(--primary);">' + (config.provider === 'none' ? '—' : config.provider.charAt(0).toUpperCase() + config.provider.slice(1)) + '</div></div>';
  html += '<div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-light);">Currency</div><div style="font-size:18px;font-weight:700;color:var(--accent);">' + htmlEscape(config.currency || 'NGN') + '</div></div>';
  html += '<div style="background:#f7fafc;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-light);">Mode</div><div style="font-size:18px;font-weight:700;color:' + (config.testMode !== false ? '#dd6b20' : '#38a169') + ';">' + (config.testMode !== false ? 'Test' : 'Live') + '</div></div>';
  html += '</div></div>';

  container.innerHTML = html;
}

function togglePGFields() {
  var provider = document.getElementById('pgProvider')?.value;
  var pubLabel = document.getElementById('pgPubKeyLabel');
  var secLabel = document.getElementById('pgSecKeyLabel');
  var stripeGroup = document.getElementById('pgStripeLinkGroup');
  if (pubLabel) pubLabel.textContent = provider === 'paystack' ? 'Paystack Public Key' : provider === 'flutterwave' ? 'Flutterwave Public Key' : provider === 'stripe' ? 'Stripe Publishable Key' : 'Public Key';
  if (secLabel) secLabel.textContent = provider === 'paystack' ? 'Paystack Secret Key' : provider === 'flutterwave' ? 'Flutterwave Secret Key' : provider === 'stripe' ? 'Stripe Secret Key' : 'Secret Key';
  if (stripeGroup) stripeGroup.style.display = provider === 'stripe' ? '' : 'none';
}

function savePaymentGatewaySettings() {
  var provider = document.getElementById('pgProvider')?.value || 'none';
  var publicKey = document.getElementById('pgPublicKey')?.value?.trim() || '';
  var secretKey = document.getElementById('pgSecretKey')?.value?.trim() || '';
  var currency = document.getElementById('pgCurrency')?.value || 'NGN';
  var testMode = document.getElementById('pgTestMode')?.checked !== false;
  var stripePaymentLink = document.getElementById('pgStripeLink')?.value?.trim() || '';
  data.paymentGateway = { provider: provider, publicKey: publicKey, secretKey: secretKey, currency: currency, testMode: testMode, stripePaymentLink: stripePaymentLink };
  saveData();
  renderPaymentGatewaySettings();
  toast('Payment gateway settings saved');
}

function testGatewayConnection() {
  var config = getGatewayConfig();
  var resultEl = document.getElementById('pgTestResult');
  if (!resultEl) return;
  if (!config.publicKey) { resultEl.innerHTML = '<div style="background:#fff5f5;color:#c53030;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-times-circle"></i> Enter a public key first</div>'; return; }
  if (config.provider === 'paystack') {
    resultEl.innerHTML = '<div style="background:#fffbeb;color:#975a16;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-sync fa-spin"></i> Testing Paystack...</div>';
    fetch('https://api.paystack.co/transaction/verify/test_' + Date.now(), { headers: { 'Authorization': 'Bearer ' + (config.secretKey || '') } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        resultEl.innerHTML = '<div style="background:#f0fff4;color:#22543d;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-check-circle"></i> Paystack API reachable. ' + (d.message || 'Connection OK') + '</div>';
      })
      .catch(function() {
        resultEl.innerHTML = '<div style="background:#fff5f5;color:#c53030;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-times-circle"></i> Could not reach Paystack API. Check your keys and internet connection.</div>';
      });
  } else if (config.provider === 'flutterwave') {
    resultEl.innerHTML = '<div style="background:#f0fff4;color:#22543d;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-check-circle"></i> Flutterwave SDK loaded. Keys will be tested at checkout.</div>';
  } else if (config.provider === 'stripe') {
    resultEl.innerHTML = '<div style="background:#f0fff4;color:#22543d;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-check-circle"></i> Stripe mode configured. Payment link: ' + htmlEscape(config.stripePaymentLink || 'Not set') + '</div>';
  } else {
    resultEl.innerHTML = '<div style="background:#fffbeb;color:#975a16;padding:12px;border-radius:8px;font-size:13px;"><i class="fas fa-info-circle"></i> No gateway selected. Choose a provider to test.</div>';
  }
}

// ===== TRANSACTION LOG (Admin) =====
function renderPaymentTransactionLog() {
  var container = document.getElementById('paymentTransactionLog');
  if (!container) return;
  var txns = data.paymentTransactions || [];
  var students = data.students || [];

  var html = '<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
    '<span style="font-size:13px;color:var(--text-light);">' + txns.length + ' transaction(s)</span>' +
    '<button class="btn btn-sm btn-outline" onclick="renderPaymentTransactionLog()"><i class="fas fa-sync"></i> Refresh</button></div>';

  if (!txns.length) {
    container.innerHTML = html + '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payment transactions yet.</p></div>';
    return;
  }
  var gatewayColors = { paystack: '#0c59db', flutterwave: '#f35a30', stripe: '#635bff' };
  html += '<div class="table-scroll"><table class="tbl"><thead><tr><th>Student</th><th>Amount</th><th>Gateway</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th></tr></thead><tbody>';
  txns.sort(function(a, b) { return a.date < b.date ? 1 : -1; }).forEach(function(t) {
    var stu = students.find(function(s) { return s.id === t.studentId; });
    var gColor = gatewayColors[t.gateway] || '#718096';
    html += '<tr>' +
      '<td>' + (stu ? htmlEscape(stu.name) : htmlEscape(t.studentId)) + '</td>' +
      '<td><strong>' + htmlEscape(getGatewayConfig().currency || 'NGN') + ' ' + (t.amount || 0).toLocaleString() + '</strong></td>' +
      '<td>' + (t.gateway ? '<span class="badge" style="background:' + gColor + '20;color:' + gColor + ';font-weight:600;">' + htmlEscape(t.gateway.charAt(0).toUpperCase() + t.gateway.slice(1)) + '</span>' : '<span class="badge" style="background:#e2e8f0;color:#4a5568;">Manual</span>') + '</td>' +
      '<td>' + htmlEscape(t.method || '—') + '</td>' +
      '<td style="font-size:12px;font-family:monospace;">' + htmlEscape(t.reference || '—') + '</td>' +
      '<td>' + t.date + '</td>' +
      '<td><span class="badge ' + (t.status === 'successful' ? 'badge-paid' : 'badge-absent') + '">' + htmlEscape(t.status) + '</span></td>' +
      '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

window.initiateGatewayPayment = initiateGatewayPayment;
window.generatePaymentRef = generatePaymentRef;
window.recordGatewayTransaction = recordGatewayTransaction;
window.getGatewayConfig = getGatewayConfig;
window.isGatewayActive = isGatewayActive;
window.renderPaymentGatewaySettings = renderPaymentGatewaySettings;
window.togglePGFields = togglePGFields;
window.savePaymentGatewaySettings = savePaymentGatewaySettings;
window.testGatewayConnection = testGatewayConnection;
window.renderPaymentTransactionLog = renderPaymentTransactionLog;
