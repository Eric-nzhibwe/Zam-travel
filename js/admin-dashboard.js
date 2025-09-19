// admin-dashboard.js (enhanced without modifying admin-dashboard.html structure)
// This script injects features into the existing DOM: KPIs, alerts, advanced filters,
// bulk actions, refunds, CSV exports, basic RBAC, audit logging, and notifications.

// ------------------ Storage Helpers ------------------
function getUsers() {
  return JSON.parse(localStorage.getItem('userLogins')) || [];
}

function setUsers(users) {
  localStorage.setItem('userLogins', JSON.stringify(users));
}

function getBookings() {
  return JSON.parse(localStorage.getItem('bookings')) || [];
}

function setBookings(bookings) {
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

function getRole() {
  return localStorage.getItem('adminRole') || 'super'; // 'super' or 'staff'
}

// ------------------ Booking Save API ------------------
function generateBookingId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `BK-${ts}-${rand}`;
}

function normalizeBooking(b) {
  const copy = { ...b };
  // Normalize bookingId field name
  if (!copy.bookingId && copy.bookingID) copy.bookingId = copy.bookingID;
  if (!copy.bookingId) copy.bookingId = generateBookingId();
  // Normalize common fields
  copy.tour = copy.tour || copy.tourName || '';
  copy.customerName = copy.customerName || copy.name || '';
  copy.email = copy.email || '';
  copy.date = copy.date || '';
  copy.people = copy.people != null ? copy.people : copy.guests;
  copy.amount = copy.amount != null ? copy.amount : copy.price;
  copy.payment = copy.payment || 'Unpaid';
  copy.approved = !!copy.approved; // default false
  return copy;
}

function saveBookingToAdmin(booking, options = { overwriteIfSameId: false }) {
  const b = normalizeBooking(booking);
  let list = getBookings();
  const idx = list.findIndex(x => (x.bookingId || x.bookingID) === b.bookingId);
  if (idx >= 0) {
    if (options.overwriteIfSameId) {
      list[idx] = { ...list[idx], ...b };
    } else {
      // If duplicate and not overwriting, generate a new ID
      b.bookingId = generateBookingId();
      list.push(b);
    }
  } else {
    list.push(b);
  }
  setBookings(list);
  logAction('create_booking', { bookingId: b.bookingId, source: options.source || 'api' });
  // Refresh dashboard views if present
  if (typeof renderBookingsTableEnhanced === 'function') {
    renderBookingsTableEnhanced();
  } else if (typeof window.renderBookingsTable === 'function') {
    window.renderBookingsTable();
  }
  updateKPIBar();
  updateAlerts();
  return b.bookingId;
}

// Expose globally so client pages can call it
window.saveBookingToAdmin = saveBookingToAdmin;

// Optional: allow adding via postMessage from same-origin client pages
window.addEventListener('message', (ev) => {
  try {
    if (!ev.data) return;
    if (ev.origin !== window.location.origin) return; // basic same-origin check
    const { type, payload } = ev.data || {};
    if (type === 'save-booking' && payload) {
      const id = saveBookingToAdmin(payload, { source: 'postMessage', overwriteIfSameId: false });
      ev.source && ev.source.postMessage({ type: 'save-booking:ok', bookingId: id }, ev.origin);
    }
  } catch (e) {
    // no-op
  }
});

// ------------------ Audit Log ------------------
function logAction(type, details) {
  const logs = JSON.parse(localStorage.getItem('auditLog') || '[]');
  logs.push({
    time: new Date().toISOString(),
    actor: 'admin',
    type,
    details
  });
  localStorage.setItem('auditLog', JSON.stringify(logs));
}

function exportAuditLogCSV() {
  const logs = JSON.parse(localStorage.getItem('auditLog') || '[]');
  if (logs.length === 0) {
    alert('No audit logs to export.');
    return;
  }
  const header = ['time', 'actor', 'type', 'details'];
  let csv = header.join(',') + '\n';
  logs.forEach(l => {
    csv += [l.time, l.actor, l.type, (typeof l.details === 'string' ? l.details : JSON.stringify(l.details))]
      .map(v => '"' + (v || '') + '"').join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit_log.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ------------------ KPI & Alerts ------------------
function computeKPIs(bookings) {
  const total = bookings.length;
  const approved = bookings.filter(b => b.approved && b.status !== 'refunded');
  const pending = bookings.filter(b => !b.approved);
  const refunded = bookings.filter(b => b.status === 'refunded');
  const revenue = approved.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const avgOrder = approved.length ? (revenue / approved.length) : 0;
  return { total, approved: approved.length, pending: pending.length, refunded: refunded.length, revenue, avgOrder };
}

function injectKPIBar(container) {
  const kpi = document.createElement('div');
  kpi.id = 'kpiBar';
  kpi.style.display = 'grid';
  kpi.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  kpi.style.gap = '12px';
  kpi.style.margin = '12px 0 20px';
  container.prepend(kpi);
  updateKPIBar();
}

function updateKPIBar() {
  const el = document.getElementById('kpiBar');
  if (!el) return;
  const b = getBookings();
  const { total, approved, pending, refunded, revenue, avgOrder } = computeKPIs(b);
  const card = (title, value) => `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
    <div style="font-size:12px;color:#6b7280;">${title}</div>
    <div style="font-size:22px;font-weight:700;">${value}</div>
  </div>`;
  el.innerHTML = [
    card('Total Bookings', total),
    card('Approved', approved),
    card('Pending', pending),
    card('Refunded', refunded),
    card('Revenue (ZMW)', revenue.toFixed(2)),
    card('Avg Order (ZMW)', avgOrder.toFixed(2))
  ].join('');
}

function injectAlerts(container) {
  const wrap = document.createElement('div');
  wrap.id = 'alertsPanel';
  wrap.style.margin = '10px 0 18px';
  wrap.style.padding = '10px';
  wrap.style.border = '1px solid #fde68a';
  wrap.style.background = '#fffbeb';
  wrap.style.borderRadius = '8px';
  container.prepend(wrap);
  updateAlerts();
}

function updateAlerts() {
  const el = document.getElementById('alertsPanel');
  if (!el) return;
  const bookings = getBookings();
  const pending = bookings.filter(b => !b.approved);
  const disputes = bookings.filter(b => b.dispute === true);
  const upcoming = bookings.filter(b => b.date && new Date(b.date) - new Date() < 1000*60*60*24*3 && new Date(b.date) >= new Date());
  // Document expiry alerts (within 30 days)
  const docs = getDocuments ? getDocuments() : [];
  const soonExpiringDocs = docs.filter(d => d.expiryDate && (new Date(d.expiryDate) - new Date()) <= 1000*60*60*24*30 && new Date(d.expiryDate) >= new Date());
  const items = [];
  if (pending.length) items.push(`Pending approvals: ${pending.length}`);
  if (disputes.length) items.push(`Payment disputes: ${disputes.length}`);
  if (upcoming.length) items.push(`Departures in 3 days: ${upcoming.length}`);
  if (soonExpiringDocs.length) items.push(`Docs expiring < 30 days: ${soonExpiringDocs.length}`);
  el.innerHTML = items.length ? ('<strong>Alerts:</strong> ' + items.join(' | ')) : 'No alerts.';
}

// ------------------ Filters/Toolbar ------------------
const filtersState = {
  q: '',
  status: 'all', // all, approved, pending, refunded
  payment: 'all', // all, Paid, Unpaid, Deposit
  from: '',
  to: ''
};

function injectBookingsToolbar(container) {
  const box = document.createElement('div');
  box.id = 'bookingsToolbar';
  box.style.display = 'flex';
  box.style.flexWrap = 'wrap';
  box.style.gap = '8px';
  box.style.margin = '10px 0';

  box.innerHTML = `
    <input id="fltQ" placeholder="Search bookings..." style="flex:1;min-width:180px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
    <select id="fltStatus" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;">
      <option value="all">All Statuses</option>
      <option value="approved">Approved</option>
      <option value="pending">Pending</option>
      <option value="refunded">Refunded</option>
    </select>
    <select id="fltPayment" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;">
      <option value="all">All Payments</option>
      <option value="Paid">Paid</option>
      <option value="Unpaid">Unpaid</option>
      <option value="Deposit">Deposit</option>
    </select>
    <input id="fltFrom" type="date" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
    <input id="fltTo" type="date" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
    <button id="btnApplyFilters" class="btn btn-sm" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Apply</button>
    <button id="btnClrFilters" class="btn btn-sm" style="background:#e5e7eb;border:none;border-radius:6px;padding:6px 10px;">Reset</button>
    <button id="btnExportBookings" class="btn btn-sm" style="background:#10b981;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Export CSV</button>
    <button id="btnExportAudit" class="btn btn-sm" style="background:#6b7280;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Export Audit</button>
  `;

  container.insertBefore(box, document.getElementById('bookingsTable').parentElement);

  box.querySelector('#btnApplyFilters').addEventListener('click', () => {
    filtersState.q = box.querySelector('#fltQ').value.trim();
    filtersState.status = box.querySelector('#fltStatus').value;
    filtersState.payment = box.querySelector('#fltPayment').value;
    filtersState.from = box.querySelector('#fltFrom').value;
    filtersState.to = box.querySelector('#fltTo').value;
    renderBookingsTableEnhanced();
  });
  box.querySelector('#btnClrFilters').addEventListener('click', () => {
    ['#fltQ','#fltStatus','#fltPayment','#fltFrom','#fltTo'].forEach(id => box.querySelector(id).value = (id==='#fltStatus'||id==='#fltPayment')?'all':'');
    filtersState.q = filtersState.status = filtersState.payment = filtersState.from = filtersState.to = '';
    filtersState.status = 'all';
    filtersState.payment = 'all';
    renderBookingsTableEnhanced();
  });
  box.querySelector('#btnExportBookings').addEventListener('click', exportBookingsCSV);
  box.querySelector('#btnExportAudit').addEventListener('click', exportAuditLogCSV);
}

function filterBookings(list) {
  return list.filter(b => {
    // text search
    if (filtersState.q) {
      const t = (filtersState.q || '').toLowerCase();
      const hay = [b.tour || b.tourName, b.customerName, b.email, b.bookingId || b.bookingID].map(x => (x||'').toLowerCase()).join(' ');
      if (!hay.includes(t)) return false;
    }
    // status
    if (filtersState.status !== 'all') {
      const status = b.status === 'refunded' ? 'refunded' : (b.approved ? 'approved' : 'pending');
      if (status !== filtersState.status) return false;
    }
    // payment
    if (filtersState.payment !== 'all' && (b.payment || '') !== filtersState.payment) return false;
    // date range
    if (filtersState.from) {
      if (!b.date || new Date(b.date) < new Date(filtersState.from)) return false;
    }
    if (filtersState.to) {
      if (!b.date || new Date(b.date) > new Date(filtersState.to)) return false;
    }
    return true;
  });
}

function exportBookingsCSV() {
  const list = filterBookings(getBookings());
  if (!list.length) { alert('No bookings to export for current filters.'); return; }
  const header = ['Tour','Customer','Email','Date','People','Amount','Payment','BookingID','Status'];
  let csv = header.join(',') + '\n';
  list.forEach(b => {
    const status = b.status === 'refunded' ? 'refunded' : (b.approved ? 'approved' : 'pending');
    csv += [b.tour || b.tourName || '', b.customerName || '', b.email || '', b.date || '', b.people || '', b.amount || '', b.payment || '', b.bookingId || b.bookingID || '', status]
      .map(v => '"' + (v || '') + '"').join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bookings.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ------------------ Rendering (override/enhance) ------------------
function renderBookingsTableEnhanced() {
  const tbody = document.getElementById('bookingsTable').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  let bookings = getBookings();
  bookings = filterBookings(bookings);
  if (!bookings.length) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 9;
    cell.textContent = 'No bookings found.';
    cell.style.textAlign = 'center';
    updateKPIBar();
    updateAlerts();
    return;
  }
  const role = getRole();
  bookings.forEach(b => {
    const row = tbody.insertRow();
    row.style.cursor = 'pointer';
    row.insertCell(0).textContent = b.tour || b.tourName || '';
    row.insertCell(1).textContent = b.customerName || '';
    row.insertCell(2).textContent = b.email || '';
    row.insertCell(3).textContent = b.date || '';
    row.insertCell(4).textContent = b.people || '';
    row.insertCell(5).textContent = b.amount || '';
    row.insertCell(6).textContent = b.payment || '';
    row.insertCell(7).textContent = b.bookingId || b.bookingID || '';
    const actionCell = row.insertCell(8);

    // Approve button (if pending and role allows)
    if (!b.approved && b.status !== 'refunded') {
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.className = 'btn btn-success btn-sm btn-approve';
      approveBtn.disabled = role === 'staff';
      approveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        approveBookingEnhanced(b.bookingId || b.bookingID);
      });
      actionCell.appendChild(approveBtn);
    } else if (b.status === 'refunded') {
      actionCell.textContent = 'Refunded';
    } else {
      // Refund button
      const refundBtn = document.createElement('button');
      refundBtn.textContent = 'Refund';
      refundBtn.className = 'btn btn-warning btn-sm ms-1';
      refundBtn.disabled = role === 'staff';
      refundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        refundBooking(b.bookingId || b.bookingID);
      });
      actionCell.appendChild(refundBtn);
    }

    // Delete
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn btn-danger btn-sm ms-2';
    delBtn.disabled = role === 'staff';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteBookingEnhanced(b.bookingId || b.bookingID);
    });
    actionCell.appendChild(delBtn);

    // Row detail view
    row.addEventListener('dblclick', () => showBookingDetails(b));
  });

  updateKPIBar();
  updateAlerts();
}

// ------------------ Actions ------------------
function approveBookingEnhanced(bookingId) {
  const bookings = getBookings().map(b => {
    if ((b.bookingId || b.bookingID) === bookingId) {
      b.approved = true;
      b.approvedAt = new Date().toISOString();
    }
    return b;
  });
  setBookings(bookings);
  logAction('approve_booking', { bookingId });
  renderBookingsTableEnhanced();
}

function deleteBookingEnhanced(bookingId) {
  const bookings = getBookings().filter(b => (b.bookingId || b.bookingID) !== bookingId);
  setBookings(bookings);
  logAction('delete_booking', { bookingId });
  renderBookingsTableEnhanced();
}

function refundBooking(bookingId) {
  const bookings = getBookings().map(b => {
    if ((b.bookingId || b.bookingID) === bookingId) {
      b.status = 'refunded';
      b.refundedAt = new Date().toISOString();
    }
    return b;
  });
  setBookings(bookings);
  logAction('refund_booking', { bookingId });
  renderBookingsTableEnhanced();
}

function showBookingDetails(b) {
  const status = b.status === 'refunded' ? 'Refunded' : (b.approved ? 'Approved' : 'Pending');
  alert(
    `--- Booking Details ---\n` +
    `Tour: ${b.tour || b.tourName || ''}\n` +
    `Name: ${b.customerName || ''}\n` +
    `Email: ${b.email || ''}\n` +
    `Date: ${b.date || ''}\n` +
    `People: ${b.people || ''}\n` +
    `Amount: ${b.amount || ''}\n` +
    `Payment: ${b.payment || ''}\n` +
    `Booking ID: ${b.bookingId || b.bookingID || ''}\n` +
    `Status: ${status}`
  );
}

// ------------------ Users table enhancements ------------------
function enhanceUsersTable() {
  const tbody = document.getElementById('usersTable')?.getElementsByTagName('tbody')[0];
  if (!tbody) return;
  // Add delete handlers that log to audit (attach after inline script renders rows)
  Array.from(tbody.querySelectorAll('button.deleteUserBtn')).forEach(btn => {
    btn.addEventListener('click', () => {
      logAction('delete_user', { source: 'button' });
      setTimeout(updateKPIBar, 0);
    }, { once: true });
  });
}

// ------------------ Notifications (simple) ------------------
function injectNotificationsButton() {
  const btn = document.createElement('button');
  btn.id = 'notifyBtn';
  btn.textContent = 'Notifications';
  btn.style.position = 'fixed';
  btn.style.right = '16px';
  btn.style.bottom = '16px';
  btn.style.zIndex = '999';
  btn.style.background = '#111827';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '999px';
  btn.style.padding = '10px 14px';
  btn.addEventListener('click', showNotifications);
  document.body.appendChild(btn);
}

function showNotifications() {
  const b = getBookings();
  const pending = b.filter(x => !x.approved).length;
  const refunded = b.filter(x => x.status === 'refunded').length;
  alert(`Notifications\nPending approvals: ${pending}\nRefunded: ${refunded}`);
}

// ------------------ Bootstrap ------------------
function bootstrapEnhancements() {
  const container = document.querySelector('.dashboard-container');
  if (!container) return;
  // KPI bar and alerts
  injectAlerts(container);
  injectKPIBar(container);
  // Filters/toolbar
  injectBookingsToolbar(container);
  // Management Panels (injected UIs)
  injectPromotionsPanel(container);
  injectDocumentVaultPanel(container);
  injectAgentPerformancePanel(container);
  // Notifications button
  injectNotificationsButton();
  // Initial enhanced render (override inline function if present)
  window.renderBookingsTable = renderBookingsTableEnhanced;
  renderBookingsTableEnhanced();
  // Enhance users actions
  enhanceUsersTable();
}

// ------------------ Promotions/Coupons Manager ------------------
function getPromotions() { return JSON.parse(localStorage.getItem('promotions') || '[]'); }
function setPromotions(v) { localStorage.setItem('promotions', JSON.stringify(v)); }

function injectPromotionsPanel(container) {
  const panel = document.createElement('div');
  panel.id = 'promotionsPanel';
  panel.style.border = '1px solid #e5e7eb';
  panel.style.borderRadius = '8px';
  panel.style.padding = '12px';
  panel.style.margin = '10px 0';
  panel.innerHTML = `
    <h3 style="margin:0 0 8px;">Promotions & Coupons</h3>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
      <input id="promoCode" placeholder="Code" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="promoDesc" placeholder="Description" style="flex:1;min-width:200px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <select id="promoType" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;">
        <option value="percent">Percent %</option>
        <option value="amount">Amount (ZMW)</option>
      </select>
      <input id="promoValue" type="number" placeholder="Value" style="width:120px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="promoStart" type="date" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="promoEnd" type="date" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="promoLimit" type="number" placeholder="Usage limit" style="width:140px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <button id="promoAdd" class="btn btn-sm" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Add/Update</button>
    </div>
    <div style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Code</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Description</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Type</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Value</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Start</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">End</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Limit</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Used</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Action</th>
        </tr></thead>
        <tbody id="promoTBody"></tbody>
      </table>
    </div>
  `;
  container.prepend(panel);
  const render = () => {
    const data = getPromotions();
    const tb = panel.querySelector('#promoTBody');
    tb.innerHTML = '';
    data.forEach((p, idx) => {
      const tr = document.createElement('tr');
      const td = (t)=>{ const d=document.createElement('td'); d.style.padding='6px'; d.textContent=t; return d; };
      tr.appendChild(td(p.code));
      tr.appendChild(td(p.description||''));
      tr.appendChild(td(p.type));
      tr.appendChild(td(p.value));
      tr.appendChild(td(p.startDate||''));
      tr.appendChild(td(p.endDate||''));
      tr.appendChild(td(p.usageLimit||''));
      tr.appendChild(td(p.used||0));
      const act = document.createElement('td'); act.style.padding='6px';
      const edit = document.createElement('button'); edit.textContent='Edit'; edit.className='btn btn-sm';
      edit.addEventListener('click', ()=>{
        panel.querySelector('#promoCode').value=p.code;
        panel.querySelector('#promoDesc').value=p.description||'';
        panel.querySelector('#promoType').value=p.type;
        panel.querySelector('#promoValue').value=p.value;
        panel.querySelector('#promoStart').value=p.startDate||'';
        panel.querySelector('#promoEnd').value=p.endDate||'';
        panel.querySelector('#promoLimit').value=p.usageLimit||'';
      });
      const del = document.createElement('button'); del.textContent='Delete'; del.className='btn btn-danger btn-sm ms-1';
      del.addEventListener('click', ()=>{
        const list = getPromotions().filter((_,i)=>i!==idx);
        setPromotions(list); logAction('delete_promotion',{code:p.code}); render();
      });
      act.appendChild(edit); act.appendChild(del); tr.appendChild(act);
      tb.appendChild(tr);
    });
  };
  panel.querySelector('#promoAdd').addEventListener('click', ()=>{
    const code = panel.querySelector('#promoCode').value.trim();
    if (!code) { alert('Code is required'); return; }
    const item = {
      code,
      description: panel.querySelector('#promoDesc').value.trim(),
      type: panel.querySelector('#promoType').value,
      value: parseFloat(panel.querySelector('#promoValue').value || '0'),
      startDate: panel.querySelector('#promoStart').value,
      endDate: panel.querySelector('#promoEnd').value,
      usageLimit: parseInt(panel.querySelector('#promoLimit').value || '0',10),
      used: (getPromotions().find(p=>p.code===code)?.used) || 0
    };
    const list = getPromotions();
    const idx = list.findIndex(p=>p.code===code);
    if (idx>=0) list[idx]=item; else list.push(item);
    setPromotions(list); logAction('upsert_promotion',{code}); render();
  });
  render();
}

// ------------------ Document Vault ------------------
function getDocuments() { return JSON.parse(localStorage.getItem('documents') || '[]'); }
function setDocuments(v) { localStorage.setItem('documents', JSON.stringify(v)); }

function injectDocumentVaultPanel(container) {
  const panel = document.createElement('div');
  panel.id = 'documentVaultPanel';
  panel.style.border = '1px solid #e5e7eb';
  panel.style.borderRadius = '8px';
  panel.style.padding = '12px';
  panel.style.margin = '10px 0';
  panel.innerHTML = `
    <h3 style="margin:0 0 8px;">Document Vault</h3>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
      <input id="docEmail" placeholder="Customer Email" style="min-width:200px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="docType" placeholder="Type (Passport/Visa/Insurance)" style="min-width:200px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="docNumber" placeholder="Number" style="min-width:140px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="docExpiry" type="date" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <input id="docNotes" placeholder="Notes" style="flex:1;min-width:200px;padding:6px;border:1px solid #d1d5db;border-radius:6px;" />
      <button id="docAdd" class="btn btn-sm" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Add</button>
    </div>
    <div style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Email</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Type</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Number</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Expiry</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Notes</th>
          <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;">Action</th>
        </tr></thead>
        <tbody id="docTBody"></tbody>
      </table>
    </div>
  `;
  container.prepend(panel);
  const render = () => {
    const data = getDocuments();
    const tb = panel.querySelector('#docTBody'); tb.innerHTML='';
    data.forEach((d, idx) => {
      const tr = document.createElement('tr');
      const td = (t)=>{ const d=document.createElement('td'); d.style.padding='6px'; d.textContent=t; return d; };
      tr.appendChild(td(d.customerEmail||''));
      tr.appendChild(td(d.type||''));
      tr.appendChild(td(d.number||''));
      tr.appendChild(td(d.expiryDate||''));
      tr.appendChild(td(d.notes||''));
      const act = document.createElement('td'); act.style.padding='6px';
      const del = document.createElement('button'); del.textContent='Delete'; del.className='btn btn-danger btn-sm';
      del.addEventListener('click', ()=>{ const list=getDocuments().filter((_,i)=>i!==idx); setDocuments(list); logAction('delete_document',{idx}); render(); updateAlerts(); });
      act.appendChild(del); tr.appendChild(act);
      tb.appendChild(tr);
    });
  };
  panel.querySelector('#docAdd').addEventListener('click', ()=>{
    const item = {
      customerEmail: panel.querySelector('#docEmail').value.trim(),
      type: panel.querySelector('#docType').value.trim(),
      number: panel.querySelector('#docNumber').value.trim(),
      expiryDate: panel.querySelector('#docExpiry').value,
      notes: panel.querySelector('#docNotes').value.trim()
    };
    if (!item.customerEmail || !item.type) { alert('Email and Type are required.'); return; }
    const list = getDocuments(); list.push(item); setDocuments(list); logAction('add_document', { email:item.customerEmail, type:item.type }); render(); updateAlerts();
  });
  render();
}

// ------------------ Agent Performance ------------------
function getAgents() { return JSON.parse(localStorage.getItem('agents') || '[]'); }
function setAgents(v) { localStorage.setItem('agents', JSON.stringify(v)); }

function injectAgentPerformancePanel(container) {
  const panel = document.createElement('div');
  panel.id = 'agentPerformancePanel';
  panel.style.border = '1px solid #e5e7eb';
  panel.style.borderRadius = '8px';
  panel.style.padding = '12px';
  panel.style.margin = '10px 0';
  panel.innerHTML = `
    <h3 style=\"margin:0 0 8px;\">Agent Performance</h3>
    <div style=\"display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;\">
      <input id=\"agentName\" placeholder=\"Agent Name\" style=\"min-width:200px;padding:6px;border:1px solid #d1d5db;border-radius:6px;\" />
      <input id=\"agentCode\" placeholder=\"Agent Code\" style=\"min-width:140px;padding:6px;border:1px solid #d1d5db;border-radius:6px;\" />
      <input id=\"agentCommission\" type=\"number\" placeholder=\"Commission %\" style=\"width:140px;padding:6px;border:1px solid #d1d5db;border-radius:6px;\" />
      <button id=\"agentAdd\" class=\"btn btn-sm\" style=\"background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 10px;\">Add</button>
    </div>
    <div style=\"overflow:auto;\">
      <table style=\"width:100%;border-collapse:collapse;\">
        <thead><tr>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Agent</th>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Code</th>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Commission %</th>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Bookings</th>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Revenue (ZMW)</th>
          <th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">Action</th>
        </tr></thead>
        <tbody id=\"agentTBody\"></tbody>
      </table>
    </div>
  `;
  container.prepend(panel);
  const render = () => {
    const agents = getAgents();
    const bookings = getBookings();
    const tb = panel.querySelector('#agentTBody'); tb.innerHTML='';
    agents.forEach((a, idx) => {
      const myBookings = bookings.filter(b => (b.agentCode && a.code && b.agentCode===a.code) || (b.agent && a.name && b.agent===a.name));
      const revenue = myBookings.filter(b => b.approved && b.status !== 'refunded').reduce((s,b)=> s + (parseFloat(b.amount)||0), 0);
      const tr = document.createElement('tr');
      const td = (t)=>{ const d=document.createElement('td'); d.style.padding='6px'; d.textContent=t; return d; };
      tr.appendChild(td(a.name||''));
      tr.appendChild(td(a.code||''));
      tr.appendChild(td(a.commissionPct||''));
      tr.appendChild(td(myBookings.length));
      tr.appendChild(td(revenue.toFixed(2)));
      const act = document.createElement('td'); act.style.padding='6px';
      const del = document.createElement('button'); del.textContent='Delete'; del.className='btn btn-danger btn-sm';
      del.addEventListener('click', ()=>{ const list=getAgents().filter((_,i)=>i!==idx); setAgents(list); logAction('delete_agent',{code:a.code}); render(); });
      act.appendChild(del); tr.appendChild(act);
      tb.appendChild(tr);
    });
  };
  panel.querySelector('#agentAdd').addEventListener('click', ()=>{
    const item = {
      name: panel.querySelector('#agentName').value.trim(),
      code: panel.querySelector('#agentCode').value.trim(),
      commissionPct: parseFloat(panel.querySelector('#agentCommission').value || '0')
    };
    if (!item.name) { alert('Agent name required'); return; }
    const list = getAgents(); list.push(item); setAgents(list); logAction('add_agent',{code:item.code}); render();
  });
  render();
}

// Wrap existing global functions (from inline script) for audit + consistency
function wrapGlobals() {
  if (typeof window.deleteUser === 'function') {
    const orig = window.deleteUser;
    window.deleteUser = function(email) {
      orig(email);
      logAction('delete_user', { email });
      updateKPIBar();
    };
  }
  if (typeof window.deleteBooking === 'function') {
    const origD = window.deleteBooking;
    window.deleteBooking = function(id) {
      origD(id);
      logAction('delete_booking', { bookingId: id });
      updateKPIBar();
      updateAlerts();
    };
  }
  if (typeof window.approveBooking === 'function') {
    const origA = window.approveBooking;
    window.approveBooking = function(id) {
      origA(id);
      logAction('approve_booking', { bookingId: id });
      updateKPIBar();
      updateAlerts();
    };
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Keep existing logout behavior
  const logout = document.getElementById('logoutBtn');
  if (logout) {
    logout.addEventListener('click', function() {
      window.location.href = 'admin.html';
    });
  }
  bootstrapEnhancements();
  wrapGlobals();
});

// React to cross-tab changes
window.addEventListener('storage', function(event) {
  if (event.key === 'bookings') {
    renderBookingsTableEnhanced();
  }
  if (event.key === 'userLogins') {
    enhanceUsersTable();
  }
});