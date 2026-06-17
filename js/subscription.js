// EDUVERSE - Premium Subscription Module
// Admin manages subscription plans; all portals show status banner

(function() {

// ===== DEFAULTS =====
function ensureDefaults() {
  if (!data.subscriptionPlans) {
    data.subscriptionPlans = [
      { id: 'sp_monthly', name: 'Monthly', interval: 'monthly', amount: 5000, currency: 'NGN', description: 'Billed every month — full access', active: true },
      { id: 'sp_yearly', name: 'Yearly', interval: 'yearly', amount: 50000, currency: 'NGN', description: 'Billed annually — save 2 months', active: true }
    ];
  }
  if (!data.subscription) {
    data.subscription = { plan: 'free', status: 'active', startDate: null, endDate: null, amount: 0, currency: 'NGN', autoRenew: false, lastPaymentDate: null, lastPaymentRef: '' };
  }
}

// ===== SUBSCRIPTION BANNER =====
function renderSubscriptionBanner() {
  var sub = data.subscription || {};
  var els = document.querySelectorAll('.sub-banner');
  var html = '';
  if (sub.plan === 'free') {
    html = '<div class="sub-banner-inner" style="background:linear-gradient(135deg,#ebf8ff,#bee3f8);border:1px solid #90cdf4;border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><span style="font-size:13px;font-weight:600;color:#2b6cb0;"><i class="fas fa-star" style="color:#d69e2e;"></i> Free Plan</span><span style="font-size:12px;color:#4a5568;">Upgrade to unlock all premium features</span></div>';
  } else if (sub.status === 'active' || sub.status === 'cancelled') {
    var daysLeft = 0;
    if (sub.endDate) { daysLeft = Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)); }
    var planName = 'Premium';
    (data.subscriptionPlans || []).forEach(function(p) { if (p.id === sub.plan) planName = p.name; });
    var color = daysLeft <= 7 ? '#e53e3e' : daysLeft <= 14 ? '#dd6b20' : '#2f855a';
    var bg = daysLeft <= 7 ? '#fff5f5' : daysLeft <= 14 ? '#fffaf0' : '#f0fff4';
    var border = daysLeft <= 7 ? '#fed7d7' : daysLeft <= 14 ? '#feebc8' : '#c6f6d5';
    var renewNote = sub.autoRenew ? (daysLeft <= 3 ? ' — auto-renew pending' : ' — auto-renew on') : '';
    var renewCta = (daysLeft <= 3 || daysLeft <= 0) && sub.autoRenew ? '<button class="btn btn-sm" style="background:#e53e3e;color:white;border:none;padding:4px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:11px;" onclick="_selectedPlanId=\'' + sub.plan + '\';showUpgradeModal()"><i class="fas fa-sync"></i> Renew Now</button>' : '';
    html = '<div class="sub-banner-inner" style="background:' + bg + ';border:1px solid ' + border + ';border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><span style="font-size:13px;font-weight:600;color:' + color + ';"><i class="fas fa-crown" style="color:#d69e2e;"></i> ' + planName + ' Plan</span><span style="font-size:12px;color:#4a5568;">' + daysLeft + ' day(s) remaining' + renewNote + '</span>' + (renewCta ? '<span>' + renewCta + '</span>' : '') + '</div>';
  } else if (sub.status === 'expired') {
    html = '<div class="sub-banner-inner" style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><span style="font-size:13px;font-weight:600;color:#e53e3e;"><i class="fas fa-exclamation-triangle"></i> Subscription Expired</span><span style="font-size:12px;color:#4a5568;">Renew to restore full access</span></div>';
  }
  for (var i = 0; i < els.length; i++) els[i].innerHTML = html;
}

// ===== ADMIN SETTINGS PANEL =====
function renderSubscriptionSettings() {
  var container = document.getElementById('adminSubscription');
  if (!container) return;
  ensureDefaults();
  var sub = data.subscription;
  var plans = data.subscriptionPlans || [];

  // Determine active/expired
  var isExpired = false;
  if (sub.endDate && new Date(sub.endDate) < new Date() && sub.plan !== 'free') { sub.status = 'expired'; isExpired = true; }
  var daysLeft = sub.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)) : 0;

  var statusBadge = sub.plan === 'free' ? 'badge-excused' : sub.status === 'active' ? 'badge-paid' : sub.status === 'expired' ? 'badge-absent' : 'badge-excused';
  var statusLabel = sub.plan === 'free' ? 'Free' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1);

  var planName = 'Free';
  plans.forEach(function(p) { if (p.id === sub.plan) planName = p.name; });

  var html =
    '<div class="card-header"><h2><i class="fas fa-crown"></i> Premium Subscription</h2></div>' +
    '<p class="subtitle">Manage subscription plans and billing for your school</p>' +

    // Current subscription status card
    '<div class="card" style="margin-bottom:16px;">' +
    '<h4 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-info-circle"></i> Current Subscription</h4>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:12px;">' +
    '<div><span style="font-size:12px;color:var(--text-light);">Plan</span><p style="font-weight:600;font-size:16px;margin-top:2px;">' + planName + '</p></div>' +
    '<div><span style="font-size:12px;color:var(--text-light);">Status</span><p style="margin-top:2px;"><span class="badge ' + statusBadge + '">' + statusLabel + '</span></p></div>' +
    (sub.amount > 0 ? '<div><span style="font-size:12px;color:var(--text-light);">Amount</span><p style="font-weight:600;font-size:16px;margin-top:2px;">' + sub.currency + ' ' + Number(sub.amount).toLocaleString() + '</p></div>' : '') +
    (sub.endDate ? '<div><span style="font-size:12px;color:var(--text-light);">Expires</span><p style="font-weight:600;font-size:16px;margin-top:2px;' + (daysLeft <= 7 ? 'color:#e53e3e;' : '') + '">' + new Date(sub.endDate).toLocaleDateString() + (daysLeft <= 30 ? ' (' + daysLeft + ' days)' : '') + '</p></div>' : '') +
    '<div><span style="font-size:12px;color:var(--text-light);">Auto-Renew</span><p style="font-weight:600;font-size:16px;margin-top:2px;">' +
      '<span onclick="subToggleAutoRenew()" style="cursor:pointer;' + (sub.autoRenew ? 'color:#48bb78;' : 'color:#a0aec0;') + '" title="Click to toggle auto-renewal">' +
      (sub.autoRenew ? '<i class="fas fa-toggle-on"></i> On' : '<i class="fas fa-toggle-off"></i> Off') +
      '</span></p></div>' +
    '</div>' +
    (sub.lastPaymentDate ? '<p style="font-size:13px;color:var(--text-light);">Last payment: ' + new Date(sub.lastPaymentDate).toLocaleDateString() + (sub.lastPaymentRef ? ' (Ref: ' + sub.lastPaymentRef + ')' : '') + '</p>' : '') +
    '</div>' +

    // Upgrade / payment section
    '<div class="card" style="margin-bottom:16px;">' +
    '<h4 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-credit-card"></i> ' + (sub.plan === 'free' ? 'Upgrade Plan' : 'Change Plan') + '</h4>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:16px;" id="subPlanCards">' +
    plans.filter(function(p) { return p.active; }).map(function(p) {
      var isCurrent = sub.plan === p.id;
      var selected = sub.plan === p.id || (sub.plan === 'free' && p.id === 'sp_monthly');
      return '<div class="card" style="padding:20px;border:2px solid ' + (isCurrent ? '#48bb78' : selected ? '#2563eb' : '#e2e8f0') + ';cursor:pointer;" onclick="subSelectPlan(\'' + p.id + '\')" id="subCard_' + p.id + '">' +
        '<div style="font-size:24px;color:' + (isCurrent ? '#48bb78' : '#2563eb') + ';margin-bottom:8px;"><i class="fas ' + (p.interval === 'yearly' ? 'fa-calendar-alt' : 'fa-calendar') + '"></i></div>' +
        '<h3 style="font-weight:700;font-size:18px;margin-bottom:4px;">' + p.name + '</h3>' +
        '<p style="font-size:24px;font-weight:800;color:var(--primary);margin-bottom:4px;">' + (p.currency || 'NGN') + ' ' + Number(p.amount).toLocaleString() + '</p>' +
        '<p style="font-size:13px;color:var(--text-light);margin-bottom:8px;">' + (p.interval === 'yearly' ? 'per year' : 'per month') + '</p>' +
        '<p style="font-size:13px;color:var(--text-light);">' + p.description + '</p>' +
        (isCurrent ? '<div style="margin-top:8px;"><span class="badge badge-paid">Current Plan</span></div>' : '') +
        '</div>';
    }).join('') +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">' +
    '<button class="btn btn-primary" id="subPayBtn" onclick="subProcessPayment()"><i class="fas fa-shopping-cart"></i> ' + (sub.plan === 'free' ? 'Subscribe Now' : 'Upgrade') + '</button>' +
    (sub.plan !== 'free' ? '<button class="btn btn-outline" onclick="subCancel()"><i class="fas fa-times"></i> Cancel Subscription</button>' : '') +
    '<button class="btn btn-outline" onclick="subRefreshStatus()"><i class="fas fa-sync"></i> Refresh Status</button>' +
    '</div>' +
    '<div id="subPayStatus" style="margin-top:8px;"></div>' +
    '</div>' +

    // Manage plans (admin only)
    '<div class="card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">' +
    '<h4 style="font-weight:600;"><i class="fas fa-cog"></i> Subscription Plans</h4>' +
    '<button class="btn btn-sm btn-primary" onclick="subShowAddPlanModal()"><i class="fas fa-plus"></i> Add Plan</button></div>' +
    (plans.length ? '<div class="table-responsive"><table><thead><tr><th>Name</th><th>Interval</th><th>Amount</th><th>Currency</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
    plans.map(function(p) {
      return '<tr><td><strong>' + p.name + '</strong></td><td>' + p.interval + '</td><td>' + (p.currency || 'NGN') + ' ' + Number(p.amount).toLocaleString() + '</td><td>' + (p.currency || 'NGN') + '</td><td><span class="badge ' + (p.active ? 'badge-paid' : 'badge-absent') + '">' + (p.active ? 'Active' : 'Inactive') + '</span></td><td>' +
        '<button class="btn btn-sm btn-outline" onclick="subEditPlan(\'' + p.id + '\')" style="margin-right:4px;"><i class="fas fa-edit"></i></button>' +
        '<button class="btn btn-sm ' + (p.active ? '' : 'btn-outline') + '" style="background:' + (p.active ? '#fc8181' : '#48bb78') + ';color:white;margin-right:4px;" onclick="subTogglePlan(\'' + p.id + '\')">' + (p.active ? '<i class="fas fa-times"></i>' : '<i class="fas fa-check"></i>') + '</button>' +
        '<button class="btn btn-sm" style="background:#e53e3e;color:white;" onclick="subDeletePlan(\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' +
        '</td></tr>';
    }).join('') + '</tbody></table></div>' : '<div class="empty-state"><i class="fas fa-crown"></i><p>No plans defined</p></div>') +
    '</div>';

  container.innerHTML = html;
}

// ===== PLAN SELECTION =====
var _selectedPlanId = 'sp_monthly';

function subSelectPlan(id) {
  _selectedPlanId = id;
  document.querySelectorAll('#subPlanCards .card').forEach(function(el) { el.style.borderColor = '#e2e8f0'; });
  var card = document.getElementById('subCard_' + id);
  if (card) card.style.borderColor = '#2563eb';
}

// ===== PROCESS PAYMENT =====
function subProcessPayment() {
  var sub = data.subscription;
  var plans = data.subscriptionPlans || [];
  var plan = null;
  for (var i = 0; i < plans.length; i++) {
    if (plans[i].id === _selectedPlanId && plans[i].active) { plan = plans[i]; break; }
  }
  if (!plan) { toast('Please select a valid plan', 'error'); return; }
  if (!isGatewayActive()) { toast('No payment gateway configured. Set up a gateway in Payment Gateway settings first.', 'error'); return; }

  var email = (currentAdmin && currentAdmin.email) || 'admin@school.com';
  var name = (currentAdmin && currentAdmin.name) || 'School Admin';
  var ref = generatePaymentRef();
  var statusEl = document.getElementById('subPayStatus');
  if (statusEl) statusEl.innerHTML = '<p style="color:#4a5568;"><i class="fas fa-spinner fa-spin"></i> Processing payment...</p>';

  initiateGatewayPayment(plan.amount, email, name, ref, function(response) {
    // Payment success
    var now = new Date();
    var endDate = new Date(now);
    if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (plan.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

    // If upgrading from an existing subscription, extend from current end date
    if (sub.endDate && sub.plan !== 'free' && sub.status === 'active') {
      endDate = new Date(sub.endDate);
      if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
      else if (plan.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    }

    sub.plan = plan.id;
    sub.status = 'active';
    sub.startDate = sub.startDate || now.toISOString();
    sub.endDate = endDate.toISOString();
    sub.amount = plan.amount;
    sub.currency = plan.currency || 'NGN';
    if (typeof sub.autoRenew !== 'boolean') sub.autoRenew = false;
    sub.lastPaymentDate = now.toISOString();
    sub.lastPaymentRef = ref;

    // Record transaction
    if (!data.paymentTransactions) data.paymentTransactions = [];
    data.paymentTransactions.push({
      id: genId('PT'),
      studentId: 'SYSTEM',
      amount: plan.amount,
      method: getGatewayProvider(),
      reference: ref,
      date: now.toISOString(),
      status: 'successful',
      description: 'Subscription: ' + plan.name
    });

    saveData();
    renderSubscriptionSettings();
    renderSubscriptionBanner();
    if (statusEl) statusEl.innerHTML = '<p style="color:#48bb78;font-weight:600;"><i class="fas fa-check-circle"></i> Payment successful! Subscription activated.</p>';
    toast('Subscription activated successfully!');
  }, function() {
    if (statusEl) statusEl.innerHTML = '';
    toast('Payment cancelled', 'warning');
  });
}

// ===== CANCEL SUBSCRIPTION =====
function subCancel() {
  if (!confirm('Cancel subscription? Auto-renewal will be disabled, but you can continue using the current plan until the expiry date.')) return;
  subToggleAutoRenew(false);
}

// ===== AUTO-RENEWAL TOGGLE =====
function subToggleAutoRenew(forceVal) {
  var sub = data.subscription;
  if (sub.plan === 'free') { toast('Upgrade to a premium plan first to enable auto-renewal', 'warning'); return; }
  sub.autoRenew = typeof forceVal === 'boolean' ? forceVal : !sub.autoRenew;
  saveData();
  renderSubscriptionSettings();
  renderSubscriptionBanner();
  toast(sub.autoRenew ? 'Auto-renewal enabled — we will remind you before expiry' : 'Auto-renewal disabled');
}

// ===== CHECK APPROACHING EXPIRY =====
var _subRenewNotified = {};
function _checkAutoRenew() {
  var sub = data.subscription;
  if (!sub || sub.plan === 'free' || !sub.endDate) return;
  var now = new Date();
  var end = new Date(sub.endDate);
  var daysLeft = Math.ceil((end - now) / 86400000);
  if (daysLeft > 14) return;

  // Update banner color in real-time
  renderSubscriptionBanner();

  if (daysLeft <= 3 && daysLeft > 0 && sub.autoRenew && !_subRenewNotified['3day']) {
    _subRenewNotified['3day'] = true;
    toast('Your premium subscription expires in ' + daysLeft + ' day(s). Auto-renew will process soon.', 'warning');
    // Auto-select the plan and prompt renewal
    if (sub.plan && sub.plan !== 'free') {
      _selectedPlanId = sub.plan;
    }
  }

  if (daysLeft <= 1 && daysLeft > 0 && sub.autoRenew && !_subRenewNotified['1day']) {
    _subRenewNotified['1day'] = true;
    showUpgradeModal();
    toast('Your subscription expires tomorrow! Renew now to keep premium access.', 'warning');
  }

  if (daysLeft <= 0 && sub.status === 'expired' && sub.autoRenew && !_subRenewNotified['expired']) {
    _subRenewNotified['expired'] = true;
    toast('Your subscription has expired. Auto-renew was enabled — please renew to restore access.', 'error');
  }
}

// ===== REFRESH STATUS =====
function subRefreshStatus() {
  ensureDefaults();
  // Recalculate expiry
  if (data.subscription.endDate && new Date(data.subscription.endDate) < new Date() && data.subscription.plan !== 'free') {
    data.subscription.status = 'expired';
    saveData();
    toast('Subscription has expired');
  } else {
    toast('Subscription is active');
  }
  renderSubscriptionSettings();
  renderSubscriptionBanner();
}

// ===== ADD / EDIT / DELETE PLANS =====
function subShowAddPlanModal() {
  openModal(
    '<h3><i class="fas fa-plus-circle"></i> Add Subscription Plan</h3>' +
    '<div class="form-group" style="margin-top:16px;"><label>Plan Name</label><input type="text" id="subPlanName" placeholder="e.g. Monthly Premium"></div>' +
    '<div class="form-group"><label>Billing Interval</label><select id="subPlanInterval" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>' +
    '<div class="form-group"><label>Amount (NGN)</label><input type="number" id="subPlanAmount" placeholder="5000" min="1"></div>' +
    '<div class="form-group"><label>Description</label><textarea id="subPlanDesc" rows="2" placeholder="Brief description of this plan" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;resize:vertical;"></textarea></div>' +
    '<div class="form-group"><label>Currency</label><input type="text" id="subPlanCurrency" value="NGN" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;"></div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="subSaveNewPlan()">Save Plan</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>'
  );
}

function subSaveNewPlan() {
  var name = document.getElementById('subPlanName').value.trim();
  var interval = document.getElementById('subPlanInterval').value;
  var amount = parseFloat(document.getElementById('subPlanAmount').value);
  var desc = document.getElementById('subPlanDesc').value.trim();
  var currency = (document.getElementById('subPlanCurrency').value || 'NGN').trim();
  if (!name || !amount || amount <= 0) { toast('Please fill in all required fields', 'error'); return; }
  if (!data.subscriptionPlans) data.subscriptionPlans = [];
  data.subscriptionPlans.push({ id: genId('SP'), name: name, interval: interval, amount: amount, currency: currency, description: desc || '', active: true });
  saveData();
  closeModal();
  renderSubscriptionSettings();
  toast('Plan created');
}

function subEditPlan(id) {
  var plans = data.subscriptionPlans || [];
  var plan = null;
  for (var i = 0; i < plans.length; i++) { if (plans[i].id === id) { plan = plans[i]; break; } }
  if (!plan) return;
  openModal(
    '<h3><i class="fas fa-edit"></i> Edit Plan</h3>' +
    '<div class="form-group" style="margin-top:16px;"><label>Plan Name</label><input type="text" id="subPlanName" value="' + htmlEscape(plan.name) + '"></div>' +
    '<div class="form-group"><label>Billing Interval</label><select id="subPlanInterval" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;"><option value="monthly"' + (plan.interval === 'monthly' ? ' selected' : '') + '>Monthly</option><option value="yearly"' + (plan.interval === 'yearly' ? ' selected' : '') + '>Yearly</option></select></div>' +
    '<div class="form-group"><label>Amount</label><input type="number" id="subPlanAmount" value="' + plan.amount + '" min="1"></div>' +
    '<div class="form-group"><label>Description</label><textarea id="subPlanDesc" rows="2" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;resize:vertical;">' + htmlEscape(plan.description || '') + '</textarea></div>' +
    '<div class="form-group"><label>Currency</label><input type="text" id="subPlanCurrency" value="' + htmlEscape(plan.currency || 'NGN') + '" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;"></div>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="subSaveEditPlan(\'' + id + '\')">Update Plan</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>'
  );
}

function subSaveEditPlan(id) {
  var plans = data.subscriptionPlans || [];
  for (var i = 0; i < plans.length; i++) {
    if (plans[i].id === id) {
      plans[i].name = document.getElementById('subPlanName').value.trim();
      plans[i].interval = document.getElementById('subPlanInterval').value;
      plans[i].amount = parseFloat(document.getElementById('subPlanAmount').value);
      plans[i].description = document.getElementById('subPlanDesc').value.trim();
      plans[i].currency = (document.getElementById('subPlanCurrency').value || 'NGN').trim();
      saveData();
      closeModal();
      renderSubscriptionSettings();
      toast('Plan updated');
      return;
    }
  }
}

function subTogglePlan(id) {
  var plans = data.subscriptionPlans || [];
  for (var i = 0; i < plans.length; i++) {
    if (plans[i].id === id) { plans[i].active = !plans[i].active; saveData(); renderSubscriptionSettings(); toast(plans[i].active ? 'Plan activated' : 'Plan deactivated'); return; }
  }
}

function subDeletePlan(id) {
  if (!confirm('Delete this plan?')) return;
  var plans = data.subscriptionPlans || [];
  for (var i = 0; i < plans.length; i++) {
    if (plans[i].id === id) { plans.splice(i, 1); saveData(); renderSubscriptionSettings(); toast('Plan deleted'); return; }
  }
}

// ===== EXPIRY CHECK =====
function subCheckExpiry() {
  ensureDefaults();
  var sub = data.subscription;
  if (!sub || sub.plan === 'free' || !sub.endDate) return;
  if (new Date(sub.endDate) < new Date()) {
    sub.status = 'expired';
    saveData();
  }
  _checkAutoRenew();
}

// ===== PREMIUM FEATURE GATING =====

// Admin panels that require premium
var _PREMIUM_ADMIN = ['hostel','gradebook','promotion','library','hr','payments','analytics','reportbuilder','predictive','aitools','idcards','transcript','reportcards','paymentgateway','simquestions','simattempts','activitygames','alumni','handwritingocr','teacherexams'];
// Teacher panels that require premium
var _PREMIUM_TEACHER = ['gallery','aitools','eschool','calendar','handwritingocr','teacherexams'];
// Student tabs that require premium
var _PREMIUM_STUDENT = ['activitygames','alumni','library','payments','simulation','hostel'];

function _isPremium() {
  var sub = data.subscription || {};
  return sub.plan !== 'free' && (sub.status === 'active' || sub.status === 'cancelled') && sub.endDate && new Date(sub.endDate) > new Date();
}

function _isFree() {
  var sub = data.subscription || {};
  return sub.plan === 'free' || (sub.status !== 'active' && sub.status !== 'cancelled') || (sub.endDate && new Date(sub.endDate) <= new Date());
}

function showUpgradeModal() {
  var plans = data.subscriptionPlans || [];
  var planCards = plans.filter(function(p) { return p.active; }).map(function(p) {
    return '<div style="border:2px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;cursor:pointer;" onclick="closeModal();subSelectPlan(\'' + p.id + '\');setTimeout(function(){document.getElementById(\'subPayBtn\')?.click();},300)"><div style="font-size:32px;color:var(--primary);margin-bottom:8px;"><i class="fas ' + (p.interval === 'yearly' ? 'fa-calendar-alt' : 'fa-calendar') + '"></i></div><h3 style="font-weight:700;font-size:16px;">' + p.name + '</h3><p style="font-size:22px;font-weight:800;color:var(--primary);margin:4px 0;">' + (p.currency || 'NGN') + ' ' + Number(p.amount).toLocaleString() + '</p><p style="font-size:13px;color:var(--text-light);">' + (p.interval === 'yearly' ? 'per year' : 'per month') + '</p></div>';
  }).join('');

  openModal(
    '<div style="text-align:center;">' +
    '<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#f6e05e,#d69e2e);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px;"><i class="fas fa-crown" style="color:#744210;"></i></div>' +
    '<h2 style="font-size:22px;font-weight:800;color:var(--primary);margin-bottom:4px;">Upgrade to Premium</h2>' +
    '<p style="font-size:14px;color:var(--text-light);margin-bottom:16px;">This feature requires a premium subscription</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;">' + planCards + '</div>' +
    '<div style="text-align:left;background:#f7fafc;border-radius:8px;padding:16px;margin-bottom:16px;font-size:14px;">' +
    '<p style="font-weight:600;margin-bottom:8px;">&#10003; Premium includes:</p>' +
    '<p style="color:#4a5568;margin-bottom:4px;">&#10003; All modules (Hostel, Library, Analytics, and more)</p>' +
    '<p style="color:#4a5568;margin-bottom:4px;">&#10003; Report Builder &amp; Predictive AI</p>' +
    '<p style="color:#4a5568;margin-bottom:4px;">&#10003; Exam Simulation &amp; Activity Games</p>' +
    '<p style="color:#4a5568;margin-bottom:4px;">&#10003; Payment Gateway &amp; Bulk Operations</p>' +
    '<p style="color:#4a5568;">&#10003; Priority support &amp; unlimited data</p>' +
    '</div>' +
    '<p style="font-size:12px;color:var(--text-light);">Click a plan above to subscribe</p>' +
    '<button class="btn btn-outline" onclick="closeModal()" style="margin-top:8px;">Maybe Later</button>' +
    '</div>'
  );
}

// ===== GUARD SIDEBAR ITEMS =====
function _guardAdminSidebar() {
  document.querySelectorAll('.admin-sidebar-item[data-panel]').forEach(function(item) {
    var panel = item.dataset.panel;
    if (_PREMIUM_ADMIN.indexOf(panel) >= 0 && !item.querySelector('.fa-lock')) {
      var lock = document.createElement('i');
      lock.className = 'fas fa-lock';
      lock.style.cssText = 'font-size:11px;color:#a0aec0;margin-left:auto;opacity:0.6;';
      item.appendChild(lock);
      item.addEventListener('click', function(e) {
        if (_isFree()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showUpgradeModal();
          return false;
        }
      }, true);
    }
  });
}

function _guardTeacherSidebar() {
  document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(function(item) {
    var panel = item.dataset.teacherPanel;
    if (_PREMIUM_TEACHER.indexOf(panel) >= 0 && !item.querySelector('.fa-lock')) {
      var lock = document.createElement('i');
      lock.className = 'fas fa-lock';
      lock.style.cssText = 'font-size:11px;color:#a0aec0;margin-left:auto;opacity:0.6;';
      item.appendChild(lock);
      item.addEventListener('click', function(e) {
        if (_isFree()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showUpgradeModal();
          return false;
        }
      }, true);
    }
  });
}

function _guardStudentTabs() {
  document.querySelectorAll('.student-tab').forEach(function(tab) {
    var tabName = tab.dataset.tab;
    if (_PREMIUM_STUDENT.indexOf(tabName) >= 0 && !tab.dataset.spGuarded) {
      tab.dataset.spGuarded = '1';
      tab.addEventListener('click', function(e) {
        if (_isFree()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showUpgradeModal();
          return false;
        }
      }, true);
    }
  });
}

// Wrap switchAdminPanel to guard premium panels
var _origSwitchAdmin = window.switchAdminPanel;
if (typeof _origSwitchAdmin === 'function') {
  window.switchAdminPanel = function(panel) {
    if (_PREMIUM_ADMIN.indexOf(panel) >= 0 && _isFree()) {
      // Find and highlight the sidebar item
      var si = document.querySelector('.admin-sidebar-item[data-panel="' + panel + '"]');
      if (si) {
        document.querySelectorAll('.admin-sidebar-item[data-panel]').forEach(function(i) { i.classList.remove('active'); });
        si.classList.add('active');
      }
      showUpgradeModal();
      return;
    }
    _origSwitchAdmin(panel);
  };
}

// Wrap switchTeacherPanel to guard premium panels
var _origSwitchTeacher = window.switchTeacherPanel;
if (typeof _origSwitchTeacher === 'function') {
  window.switchTeacherPanel = function(panel) {
    if (_PREMIUM_TEACHER.indexOf(panel) >= 0 && _isFree()) {
      var si = document.querySelector('.admin-sidebar-item[data-teacher-panel="' + panel + '"]');
      if (si) {
        document.querySelectorAll('.admin-sidebar-item[data-teacher-panel]').forEach(function(i) { i.classList.remove('active'); });
        si.classList.add('active');
      }
      showUpgradeModal();
      return;
    }
    _origSwitchTeacher(panel);
  };
}

// ===== UPDATE BANNER WITH CTA =====
var _origRenderBanner = renderSubscriptionBanner;
renderSubscriptionBanner = function() {
  _origRenderBanner();
  var els = document.querySelectorAll('.sub-banner');
  var sub = data.subscription || {};
  if (sub.plan === 'free') {
    var cta = '<button class="btn btn-sm" style="background:#2563eb;color:white;border:none;padding:6px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;" onclick="showUpgradeModal()"><i class="fas fa-crown"></i> Upgrade</button>';
    for (var i = 0; i < els.length; i++) {
      var inner = els[i].querySelector('.sub-banner-inner');
      if (inner) inner.innerHTML += '<span>' + cta + '</span>';
    }
  } else if (sub.status === 'expired') {
    var cta = '<button class="btn btn-sm" style="background:#e53e3e;color:white;border:none;padding:6px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;" onclick="showUpgradeModal()"><i class="fas fa-sync"></i> Renew Now</button>';
    for (var i = 0; i < els.length; i++) {
      var inner = els[i].querySelector('.sub-banner-inner');
      if (inner) inner.innerHTML += '<span>' + cta + '</span>';
    }
  }
};

// ===== INIT GUARDS =====
function _initFeatureGating() {
  ensureDefaults();
  _guardAdminSidebar();
  _guardTeacherSidebar();
  _guardStudentTabs();
  renderSubscriptionBanner();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initFeatureGating);
} else {
  _initFeatureGating();
}

// Re-guard once on dynamic content
setTimeout(function() {
  _guardAdminSidebar();
  _guardTeacherSidebar();
  _guardStudentTabs();
  renderSubscriptionBanner();
}, 1000);

// ===== EXPORT =====
window.renderSubscriptionSettings = renderSubscriptionSettings;
window.renderSubscriptionBanner = renderSubscriptionBanner;
window.subSelectPlan = subSelectPlan;
window.subProcessPayment = subProcessPayment;
window.subCancel = subCancel;
window.subToggleAutoRenew = subToggleAutoRenew;
window.subRefreshStatus = subRefreshStatus;
window.subShowAddPlanModal = subShowAddPlanModal;
window.subSaveNewPlan = subSaveNewPlan;
window.subEditPlan = subEditPlan;
window.subSaveEditPlan = subSaveEditPlan;
window.subTogglePlan = subTogglePlan;
window.subDeletePlan = subDeletePlan;
window.subCheckExpiry = subCheckExpiry;
window._isPremium = _isPremium;
window._isFree = _isFree;
window.showUpgradeModal = showUpgradeModal;

// Run expiry check on load
setTimeout(subCheckExpiry, 500);
setInterval(subCheckExpiry, 60000); // Check every minute

})();
