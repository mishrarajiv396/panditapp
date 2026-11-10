/* ==========================================================================
   PanditApp admin console — login, stats, review queues, account settings.
   Talks to the Express/MySQL API through assets/js/api.js.
   ========================================================================== */
(function () {
  'use strict';

  var API = window.PanditAPI;
  var TOKEN_KEY = 'vp_admin_token';
  var THEME_KEY = 'vp_admin_theme';
  var AUTO_KEY = 'vp_admin_auto';

  var token = '';
  var refreshTimer = null;

  var state = {
    tab: 'bookings',
    bookings: [],
    applications: [],
    orders: [],
    messages: [],
    search: '',
    paymentFilter: '',
    admin: null,
    autoRefresh: true,
    activeBooking: null
  };

  var $ = function (id) { return document.getElementById(id); };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(value) {
    return '₹' + Math.round(Number(value) || 0).toLocaleString('en-IN');
  }

  function dateTime(value) {
    if (!value) return '—';
    var d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function jsonList(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value) || []; } catch (err) { return []; }
    }
    return [];
  }

  function toast(message, type) {
    var el = $('toast');
    el.textContent = message;
    el.className = 'admin-toast is-on' + (type ? ' is-' + type : '');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.className = 'admin-toast'; }, 3400);
  }

  function note(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
    el.className = 'admin-note' + (type ? ' admin-note--' + type : '');
  }

  function api(path, options) {
    options = options || {};
    return API.request(path, {
      method: options.method || 'GET',
      body: options.body,
      token: token
    }).then(function (res) {
      if (res.status === 401) {
        signOut('Session expired, please sign in again.');
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!res.ok) {
        setLive(false);
        throw new Error(res.error || 'Request failed');
      }
      setLive(true);
      return res.data;
    });
  }

  function setLive(online) {
    var badge = $('liveBadge');
    if (!badge) return;
    badge.classList.toggle('is-offline', !online);
    badge.innerHTML = online ? '<i></i> Live' : '<i></i> Offline';
  }

  function setUpdated() {
    var el = $('lastUpdated');
    if (!el) return;
    el.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  /* ---------------------------------------------------------------- theme */
  function isDark() {
    return document.documentElement.getAttribute('data-admin-theme') === 'dark';
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-admin-theme', dark ? 'dark' : 'light');
    var sw = $('themeSwitch');
    if (sw) {
      sw.classList.toggle('is-on', dark);
      sw.setAttribute('aria-checked', dark ? 'true' : 'false');
    }
    var btn = $('themeToggle');
    if (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (err) { /* ignore */ }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
    var dark = saved ? saved === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(dark);
  }

  function toggleTheme() { applyTheme(!isDark()); }

  function setAutoRefresh(on) {
    state.autoRefresh = on;
    var sw = $('autoSwitch');
    if (sw) {
      sw.classList.toggle('is-on', on);
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
    }
    try { localStorage.setItem(AUTO_KEY, on ? 'on' : 'off'); } catch (err) { /* ignore */ }
  }

  function initAutoRefresh() {
    var saved = null;
    try { saved = localStorage.getItem(AUTO_KEY); } catch (err) { /* ignore */ }
    setAutoRefresh(saved === null ? true : saved === 'on');

    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () {
      if (token && state.autoRefresh && !document.hidden && !state.activeBooking) loadAll(true);
    }, 60000);
  }

  /* ---------------------------------------------------------------- auth */
  function showApp() {
    $('loginView').hidden = true;
    $('appView').hidden = false;
    loadProfile();
    loadAll();
  }

  function signOut(message) {
    token = '';
    state.admin = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch (err) { /* ignore */ }
    closeModal();
    $('appView').hidden = true;
    $('loginView').hidden = false;
    $('loginPassword').value = '';
    if (message) toast(message, 'error');
  }

  function initLogin() {
    $('loginForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var email = $('loginEmail').value.trim();
      var password = $('loginPassword').value;
      var error = $('loginError');
      var btn = $('loginBtn');

      error.hidden = true;
      if (!email || !password) {
        error.textContent = 'Please enter your email and password.';
        error.hidden = false;
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Signing in…';

      API.login(email, password).then(function (res) {
        if (!res.ok) {
          error.textContent = res.offline
            ? 'Cannot reach the API. Start the server with start.ps1 first.'
            : (res.error || 'Login failed.');
          error.hidden = false;
          return;
        }
        token = res.data.token;
        state.admin = res.data.admin || null;
        try { localStorage.setItem(TOKEN_KEY, token); } catch (err) { /* ignore */ }
        $('loginPassword').value = '';
        showApp();
      }).catch(function (err) {
        error.textContent = err.message || 'Login failed.';
        error.hidden = false;
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'Sign in';
      });
    });
  }

  /* --------------------------------------------------------------- stats */
  function loadStats() {
    return api('/admin/stats').then(function (stats) {
      $('statBookings').textContent = stats.bookings;
      $('statToday').textContent = stats.bookingsToday + ' today';
      $('statPending').textContent = stats.awaitingVerification;
      $('statRevenue').textContent = money(stats.verifiedRevenue);
      $('statEnquiries').textContent = stats.applications + stats.newOrders + stats.newMessages;
      $('navBookings').textContent = stats.bookings;
      $('navApplications').textContent = stats.applications;
      $('navOrders').textContent = stats.newOrders;
      $('navMessages').textContent = stats.newMessages;
    });
  }

  function loadAll(silent) {
    var btn = $('refreshBtn');
    if (btn && !silent) { btn.disabled = true; btn.textContent = 'Refreshing…'; }

    return Promise.all([
      loadStats(),
      api('/admin/bookings?limit=200').then(function (rows) { state.bookings = rows; }),
      api('/admin/applications?limit=200').then(function (rows) { state.applications = rows; }),
      api('/admin/orders?limit=200').then(function (rows) { state.orders = rows; }),
      api('/admin/messages?limit=200').then(function (rows) { state.messages = rows; })
    ]).then(function () {
      renderBookings();
      renderApplications();
      renderOrders();
      renderMessages();
      setUpdated();
    }).catch(function (err) {
      if (!silent) toast(err.message || 'Could not load dashboard', 'error');
    }).finally(function () {
      if (btn && !silent) { btn.disabled = false; btn.textContent = 'Refresh'; }
    });
  }

  /* ------------------------------------------------------------ bookings */
  function paymentPill(status) {
    var map = {
      'Pending': 'pending',
      'Awaiting verification': 'wait',
      'Paid': 'paid',
      'Verified': 'verified',
      'Cancelled': 'cancel'
    };
    return '<span class="admin-pill admin-pill--' + (map[status] || 'muted') + '">' + esc(status || 'Pending') + '</span>';
  }

  function bookingRows() {
    var q = state.search.toLowerCase();
    return state.bookings.filter(function (row) {
      if (state.paymentFilter && row.payment_status !== state.paymentFilter) return false;
      if (!q) return true;
      return [row.id, row.customer_name, row.customer_phone, row.pooja_name, row.city, row.pandit_name]
        .join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }

  function renderBookings() {
    var body = $('bookingsBody');
    var rows = bookingRows();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="7" class="admin-empty">No bookings match this filter yet.</td></tr>';
      return;
    }

    body.innerHTML = rows.map(function (row) {
      var phone = String(row.customer_phone || '').replace(/[^\d]/g, '');
      var wa = phone ? '<a class="admin-btn admin-btn--mini admin-btn--ghost" target="_blank" rel="noopener" href="https://wa.me/' + (phone.length === 10 ? '91' + phone : phone) + '">WhatsApp</a>' : '';
      var verify = (row.payment_status === 'Awaiting verification' || row.payment_status === 'Pending')
        ? '<button class="admin-btn admin-btn--mini admin-btn--ok" data-action="verify" data-id="' + esc(row.id) + '" data-total="' + Number(row.total_amount || 0) + '">Verify paid</button>'
        : '';
      var cancel = row.status !== 'Cancelled'
        ? '<button class="admin-btn admin-btn--mini admin-btn--danger" data-action="cancel" data-id="' + esc(row.id) + '">Cancel</button>'
        : '';

      return '<tr>' +
        '<td><span class="admin-id">' + esc(row.id) + '</span><span class="admin-sub">' + dateTime(row.created_at) + '</span></td>' +
        '<td><b>' + esc(row.customer_name) + '</b><span class="admin-sub">' + esc(row.customer_phone) + '</span></td>' +
        '<td>' + esc(row.pooja_name) + '<span class="admin-sub">' + esc(row.date_label || row.booking_date || '') + '</span></td>' +
        '<td>' + esc(row.booking_date || '—') + '<span class="admin-sub">' + esc(row.muhurat || 'Time TBC') + '</span></td>' +
        '<td><b>' + money(row.total_amount) + '</b><span class="admin-sub">Pay now ' + money(row.pay_now) + '</span></td>' +
        '<td>' + paymentPill(row.payment_status) + (row.payment_ref ? '<span class="admin-sub">UTR ' + esc(row.payment_ref) + '</span>' : '') + '</td>' +
        '<td><div class="admin-actions">' +
          '<button class="admin-btn admin-btn--mini admin-btn--gold" data-view="' + esc(row.id) + '">View</button>' +
          verify + wa + cancel +
        '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* -------------------------------------------------------- applications */
  function statusPill(status) {
    var map = {
      new: 'pending', contacted: 'wait', verified: 'verified',
      rejected: 'cancel', packed: 'wait', shipped: 'wait',
      delivered: 'paid', cancelled: 'cancel', read: 'muted', replied: 'paid'
    };
    return '<span class="admin-pill admin-pill--' + (map[status] || 'muted') + '">' + esc(status || 'new') + '</span>';
  }

  function renderApplications() {
    var body = $('applicationsBody');
    if (!state.applications.length) {
      body.innerHTML = '<tr><td colspan="7" class="admin-empty">No pandit applications yet.</td></tr>';
      return;
    }

    body.innerHTML = state.applications.map(function (row) {
      var actions = '';
      if (row.status !== 'contacted' && row.status !== 'verified') {
        actions += '<button class="admin-btn admin-btn--mini admin-btn--gold" data-app-action="contacted" data-id="' + esc(row.id) + '">Contacted</button>';
      }
      if (row.status !== 'verified') {
        actions += '<button class="admin-btn admin-btn--mini admin-btn--ok" data-app-action="verified" data-id="' + esc(row.id) + '">Verify</button>';
      }
      if (row.status !== 'rejected') {
        actions += '<button class="admin-btn admin-btn--mini admin-btn--danger" data-app-action="rejected" data-id="' + esc(row.id) + '">Reject</button>';
      }

      return '<tr>' +
        '<td><b>' + esc(row.name) + '</b><span class="admin-sub">' + dateTime(row.created_at) + '</span></td>' +
        '<td>' + esc(row.phone) + '</td>' +
        '<td>' + esc(row.city) + '</td>' +
        '<td>' + esc(row.experience || '—') + '</td>' +
        '<td>' + esc(row.tradition || '—') + '</td>' +
        '<td>' + statusPill(row.status) + '</td>' +
        '<td><div class="admin-actions">' + actions + '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* --------------------------------------------------------------- orders */
  function renderOrders() {
    var body = $('ordersBody');
    if (!state.orders.length) {
      body.innerHTML = '<tr><td colspan="6" class="admin-empty">No shop orders yet.</td></tr>';
      return;
    }

    body.innerHTML = state.orders.map(function (row) {
      var items = jsonList(row.items);
      var qty = items.reduce(function (sum, item) { return sum + (Number(item.qty) || 1); }, 0);
      var names = items.map(function (item) { return item.name; }).join(', ');
      var actions = '';
      if (row.status === 'new') actions += '<button class="admin-btn admin-btn--mini admin-btn--gold" data-order-action="packed" data-id="' + esc(row.id) + '">Packed</button>';
      if (row.status === 'packed') actions += '<button class="admin-btn admin-btn--mini admin-btn--gold" data-order-action="shipped" data-id="' + esc(row.id) + '">Shipped</button>';
      if (row.status === 'shipped') actions += '<button class="admin-btn admin-btn--mini admin-btn--ok" data-order-action="delivered" data-id="' + esc(row.id) + '">Delivered</button>';
      if (row.status !== 'delivered' && row.status !== 'cancelled') actions += '<button class="admin-btn admin-btn--mini admin-btn--danger" data-order-action="cancelled" data-id="' + esc(row.id) + '">Cancel</button>';

      return '<tr>' +
        '<td><span class="admin-id">' + esc(row.id) + '</span><span class="admin-sub">' + dateTime(row.created_at) + '</span></td>' +
        '<td><b>' + esc(row.customer_name) + '</b><span class="admin-sub">' + esc(row.phone) + '</span></td>' +
        '<td>' + qty + ' item' + (qty === 1 ? '' : 's') + '<span class="admin-sub">' + esc(names || '—') + '</span></td>' +
        '<td><b>' + money(row.total) + '</b></td>' +
        '<td>' + statusPill(row.status) + '</td>' +
        '<td><div class="admin-actions">' + actions + '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------- messages */
  function renderMessages() {
    var body = $('messagesBody');
    if (!state.messages.length) {
      body.innerHTML = '<tr><td colspan="6" class="admin-empty">No messages yet.</td></tr>';
      return;
    }

    body.innerHTML = state.messages.map(function (row) {
      var actions = '';
      if (row.status === 'new') actions += '<button class="admin-btn admin-btn--mini admin-btn--gold" data-msg-action="read" data-id="' + esc(row.id) + '">Mark read</button>';
      if (row.status !== 'replied') actions += '<button class="admin-btn admin-btn--mini admin-btn--ok" data-msg-action="replied" data-id="' + esc(row.id) + '">Replied</button>';

      return '<tr>' +
        '<td><b>' + esc(row.name) + '</b></td>' +
        '<td>' + esc(row.email || row.phone || '—') + '</td>' +
        '<td><div class="admin-msg">' + esc(row.message) + '</div></td>' +
        '<td>' + dateTime(row.created_at) + '</td>' +
        '<td>' + statusPill(row.status) + '</td>' +
        '<td><div class="admin-actions">' + actions + '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* ---------------------------------------------------------- detail modal */
  function detailItem(label, value) {
    return '<div class="admin-detail__item"><span>' + esc(label) + '</span><b>' + esc(value || '—') + '</b></div>';
  }

  function openBooking(id) {
    var row = state.bookings.filter(function (b) { return b.id === id; })[0];
    if (!row) return;
    state.activeBooking = row;

    var extras = jsonList(row.extras_list).map(function (item) {
      return '<span class="admin-chip">' + esc(item.name || item.id) + (item.price ? ' · ' + money(item.price) : '') + '</span>';
    }).join('');

    var phone = String(row.customer_phone || '').replace(/[^\d]/g, '');
    var wa = phone ? 'https://wa.me/' + (phone.length === 10 ? '91' + phone : phone) : '';

    $('detailEyebrow').textContent = 'Booking · ' + (row.type || 'pooja');
    $('detailTitle').textContent = row.pooja_name || 'Booking details';

    $('detailBody').innerHTML =
      '<div class="admin-detail__banner">' +
        '<div><span>Total</span><b>' + money(row.total_amount) + '</b></div>' +
        '<div><span>Pay now</span><b>' + money(row.pay_now) + '</b></div>' +
        '<div><span>Balance</span><b>' + money(row.balance) + '</b></div>' +
        '<div>' + paymentPill(row.payment_status) + '</div>' +
      '</div>' +
      '<div class="admin-detail__section"><h3>Customer</h3><div class="admin-detail__grid">' +
        detailItem('Name', row.customer_name) +
        detailItem('Phone', row.customer_phone) +
        detailItem('Email', row.customer_email) +
        detailItem('Address', row.address) +
        detailItem('Society', row.society) +
        detailItem('Pincode', row.pincode) +
        detailItem('Gotra', row.gotra) +
        detailItem('Language', row.language) +
      '</div></div>' +
      '<div class="admin-detail__section"><h3>Ritual</h3><div class="admin-detail__grid">' +
        detailItem('Pooja', row.pooja_name) +
        detailItem('Date', row.date_label || row.booking_date) +
        detailItem('Muhurat', row.muhurat) +
        detailItem('City', row.city) +
        detailItem('Place', row.place) +
        detailItem('Pandit', row.pandit_name) +
        detailItem('Tradition', row.tradition) +
        detailItem('Created', dateTime(row.created_at)) +
      '</div></div>' +
      '<div class="admin-detail__section"><h3>Payment</h3><div class="admin-detail__grid">' +
        detailItem('Method', row.payment_method) +
        detailItem('Status', row.payment_status) +
        detailItem('UPI ID', row.upi_id) +
        detailItem('Reference', row.payment_ref) +
        detailItem('Amount paid', money(row.amount_paid)) +
        detailItem('Claimed at', dateTime(row.payment_claimed_at)) +
      '</div>' + (extras ? '<div class="admin-detail__extras"><span>Add-ons</span><div>' + extras + '</div></div>' : '') + '</div>' +
      '<div class="admin-detail__section"><h3>Internal notes</h3>' +
        '<label class="admin-field"><span>Pandit assigned</span><input type="text" id="detailPandit" maxlength="190" value="' + esc(row.pandit_name || '') + '" placeholder="Pandit name"></label>' +
        '<label class="admin-field"><span>Notes (visible to the team only)</span><textarea id="detailNotes" rows="3" maxlength="4000" placeholder="Address landmark, family preference, follow-up…">' + esc(row.notes || '') + '</textarea></label>' +
      '</div>';

    $('detailFoot').innerHTML =
      '<div class="admin-actions">' +
        ((row.payment_status === 'Awaiting verification' || row.payment_status === 'Pending')
          ? '<button class="admin-btn admin-btn--ok" data-modal-verify="' + esc(row.id) + '" data-total="' + Number(row.total_amount || 0) + '">Verify paid</button>'
          : '') +
        (row.status !== 'Cancelled'
          ? '<button class="admin-btn admin-btn--danger" data-modal-cancel="' + esc(row.id) + '">Cancel booking</button>'
          : '') +
        (wa ? '<a class="admin-btn admin-btn--ghost" target="_blank" rel="noopener" href="' + wa + '">WhatsApp</a>' : '') +
      '</div>' +
      '<div class="admin-actions">' +
        '<button class="admin-btn admin-btn--ghost" type="button" data-close-modal>Close</button>' +
        '<button class="admin-btn admin-btn--primary" type="button" data-modal-save="' + esc(row.id) + '">Save notes</button>' +
      '</div>';

    $('detailModal').hidden = false;
    document.body.classList.add('admin-modal-open');
    var first = $('detailPandit');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal() {
    var modal = $('detailModal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('admin-modal-open');
    state.activeBooking = null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  /* ------------------------------------------------------------- CSV export */
  function csvCell(value) {
    var s = value == null ? '' : String(value);
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function downloadCsv(filename, rows, columns) {
    if (!rows.length) {
      toast('Nothing to export in this view.', 'error');
      return;
    }
    var head = columns.map(function (c) { return csvCell(c.label); }).join(',');
    var body = rows.map(function (row) {
      return columns.map(function (c) {
        var value = typeof c.value === 'function' ? c.value(row) : row[c.key];
        return csvCell(value);
      }).join(',');
    }).join('\r\n');

    var blob = new Blob(['\uFEFF' + head + '\r\n' + body], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Exported ' + rows.length + ' row' + (rows.length === 1 ? '' : 's') + '.', 'ok');
  }

  function stamp() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function initExport() {
    $('exportBookings').addEventListener('click', function () {
      downloadCsv('bookings-' + stamp() + '.csv', bookingRows(), [
        { label: 'Booking ID', key: 'id' },
        { label: 'Created', value: function (r) { return dateTime(r.created_at); } },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Phone', key: 'customer_phone' },
        { label: 'Pooja', key: 'pooja_name' },
        { label: 'Date', key: 'booking_date' },
        { label: 'Muhurat', key: 'muhurat' },
        { label: 'City', key: 'city' },
        { label: 'Total', key: 'total_amount' },
        { label: 'Pay now', key: 'pay_now' },
        { label: 'Balance', key: 'balance' },
        { label: 'Payment', key: 'payment_status' },
        { label: 'Reference', key: 'payment_ref' },
        { label: 'Pandit', key: 'pandit_name' },
        { label: 'Status', key: 'status' }
      ]);
    });

    $('exportApplications').addEventListener('click', function () {
      downloadCsv('pandit-applications-' + stamp() + '.csv', state.applications, [
        { label: 'ID', key: 'id' },
        { label: 'Created', value: function (r) { return dateTime(r.created_at); } },
        { label: 'Name', key: 'name' },
        { label: 'Phone', key: 'phone' },
        { label: 'City', key: 'city' },
        { label: 'Experience', key: 'experience' },
        { label: 'Tradition', key: 'tradition' },
        { label: 'Status', key: 'status' },
        { label: 'Note', key: 'note' }
      ]);
    });

    $('exportOrders').addEventListener('click', function () {
      downloadCsv('orders-' + stamp() + '.csv', state.orders, [
        { label: 'Order ID', key: 'id' },
        { label: 'Created', value: function (r) { return dateTime(r.created_at); } },
        { label: 'Customer', key: 'customer_name' },
        { label: 'Phone', key: 'phone' },
        { label: 'City', key: 'city' },
        { label: 'Pincode', key: 'pincode' },
        { label: 'Items', value: function (r) { return jsonList(r.items).map(function (i) { return (i.name || i.id) + ' x' + (i.qty || 1); }).join('; '); } },
        { label: 'Total', key: 'total' },
        { label: 'Status', key: 'status' },
        { label: 'Payment', key: 'payment_status' }
      ]);
    });

    $('exportMessages').addEventListener('click', function () {
      downloadCsv('messages-' + stamp() + '.csv', state.messages, [
        { label: 'ID', key: 'id' },
        { label: 'Received', value: function (r) { return dateTime(r.created_at); } },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Subject', key: 'subject' },
        { label: 'Message', key: 'message' },
        { label: 'Status', key: 'status' }
      ]);
    });
  }

  /* ------------------------------------------------------------- account */
  function initials(name) {
    var parts = String(name || 'A').trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function loadProfile() {
    if (state.admin) fillProfile(state.admin);
    return api('/admin/me').then(function (admin) {
      state.admin = admin;
      fillProfile(admin);
    }).catch(function () { /* session errors are handled by api() */ });
  }

  function fillProfile(admin) {
    if (!admin) return;
    var name = admin.name || 'Admin';
    if ($('profileName')) $('profileName').value = name;
    if ($('profileEmail')) $('profileEmail').value = admin.email || '';
    if ($('accountAvatar')) $('accountAvatar').textContent = initials(name);
    if ($('sessionEmail')) $('sessionEmail').textContent = admin.email || '—';
  }

  function passwordScore(value) {
    var score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
    if (value.length >= 12) score += 1;
    if (/[^A-Za-z0-9]/.test(value) || (/[a-z]/.test(value) && /[A-Z]/.test(value))) score += 1;
    return value ? score : 0;
  }

  function renderStrength(value) {
    var meter = $('passwordStrength');
    if (!meter) return;
    var score = passwordScore(value);
    meter.setAttribute('data-score', String(score));
    Array.prototype.forEach.call(meter.children, function (bar, index) {
      bar.classList.toggle('is-on', index < score);
    });
  }

  function initAccount() {
    $('profileForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var btn = $('profileSave');
      var noteEl = $('profileNote');
      var name = $('profileName').value.trim();
      var email = $('profileEmail').value.trim();

      note(noteEl, '');
      if (!name) return note(noteEl, 'Please enter a display name.', 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return note(noteEl, 'Enter a valid email address.', 'error');

      btn.disabled = true;
      btn.textContent = 'Saving…';
      api('/admin/profile', { method: 'PATCH', body: { name: name, email: email } }).then(function (res) {
        state.admin = res.admin;
        if (res.token) {
          token = res.token;
          try { localStorage.setItem(TOKEN_KEY, token); } catch (err) { /* ignore */ }
        }
        fillProfile(res.admin);
        note(noteEl, 'Profile saved.', 'ok');
        toast('Profile updated', 'ok');
      }).catch(function (err) {
        note(noteEl, err.message || 'Could not save profile.', 'error');
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'Save profile';
      });
    });

    $('newPassword').addEventListener('input', function (event) {
      renderStrength(event.target.value);
    });

    $('passwordForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var btn = $('passwordSave');
      var noteEl = $('passwordNote');
      var current = $('currentPassword').value;
      var next = $('newPassword').value;
      var confirm = $('confirmPassword').value;

      note(noteEl, '');
      if (!current) return note(noteEl, 'Enter your current password.', 'error');
      if (next.length < 8) return note(noteEl, 'New password must be at least 8 characters.', 'error');
      if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) return note(noteEl, 'Use at least one letter and one number.', 'error');
      if (next !== confirm) return note(noteEl, 'The two new passwords do not match.', 'error');
      if (next === current) return note(noteEl, 'New password must be different from the current one.', 'error');

      btn.disabled = true;
      btn.textContent = 'Updating…';
      api('/admin/change-password', {
        method: 'POST',
        body: { currentPassword: current, newPassword: next }
      }).then(function () {
        $('currentPassword').value = '';
        $('newPassword').value = '';
        $('confirmPassword').value = '';
        renderStrength('');
        note(noteEl, 'Password updated. Use the new password next time you sign in.', 'ok');
        toast('Password changed', 'ok');
      }).catch(function (err) {
        note(noteEl, err.message || 'Could not change password.', 'error');
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'Update password';
      });
    });

    $('themeSwitch').addEventListener('click', toggleTheme);
    $('autoSwitch').addEventListener('click', function () { setAutoRefresh(!state.autoRefresh); });
    $('accountSignOut').addEventListener('click', function () { signOut('Signed out.'); });
  }

  /* ------------------------------------------------------------- actions */
  function patch(path, body, message) {
    return api(path, { method: 'PATCH', body: body }).then(function () {
      toast(message, 'ok');
      return loadAll(true);
    }).catch(function (err) {
      toast(err.message || 'Update failed', 'error');
    });
  }

  function initActions() {
    document.addEventListener('click', function (event) {
      var view = event.target.closest('[data-view]');
      if (view) {
        openBooking(view.getAttribute('data-view'));
        return;
      }

      if (event.target.closest('[data-close-modal]')) {
        closeModal();
        return;
      }

      var modalVerify = event.target.closest('[data-modal-verify]');
      if (modalVerify) {
        var id = modalVerify.getAttribute('data-modal-verify');
        var total = Number(modalVerify.getAttribute('data-total')) || 0;
        closeModal();
        patch('/admin/bookings/' + encodeURIComponent(id), {
          paymentStatus: 'Verified',
          amountPaid: total
        }, 'Payment verified');
        return;
      }

      var modalCancel = event.target.closest('[data-modal-cancel]');
      if (modalCancel) {
        var cancelId = modalCancel.getAttribute('data-modal-cancel');
        closeModal();
        patch('/admin/bookings/' + encodeURIComponent(cancelId), { status: 'Cancelled' }, 'Booking cancelled');
        return;
      }

      var modalSave = event.target.closest('[data-modal-save]');
      if (modalSave) {
        var saveId = modalSave.getAttribute('data-modal-save');
        modalSave.disabled = true;
        modalSave.textContent = 'Saving…';
        api('/admin/bookings/' + encodeURIComponent(saveId), {
          method: 'PATCH',
          body: {
            panditName: $('detailPandit').value.trim(),
            notes: $('detailNotes').value.trim()
          }
        }).then(function () {
          toast('Booking notes saved', 'ok');
          closeModal();
          return loadAll(true);
        }).catch(function (err) {
          toast(err.message || 'Could not save notes', 'error');
          modalSave.disabled = false;
          modalSave.textContent = 'Save notes';
        });
        return;
      }

      var verify = event.target.closest('[data-action="verify"]');
      if (verify) {
        patch('/admin/bookings/' + encodeURIComponent(verify.getAttribute('data-id')), {
          paymentStatus: 'Verified',
          amountPaid: Number(verify.getAttribute('data-total')) || 0
        }, 'Payment verified');
        return;
      }

      var cancel = event.target.closest('[data-action="cancel"]');
      if (cancel) {
        patch('/admin/bookings/' + encodeURIComponent(cancel.getAttribute('data-id')), {
          status: 'Cancelled'
        }, 'Booking cancelled');
        return;
      }

      var app = event.target.closest('[data-app-action]');
      if (app) {
        patch('/admin/applications/' + encodeURIComponent(app.getAttribute('data-id')), {
          status: app.getAttribute('data-app-action')
        }, 'Application updated');
        return;
      }

      var order = event.target.closest('[data-order-action]');
      if (order) {
        patch('/admin/orders/' + encodeURIComponent(order.getAttribute('data-id')), {
          status: order.getAttribute('data-order-action')
        }, 'Order updated');
        return;
      }

      var msg = event.target.closest('[data-msg-action]');
      if (msg) {
        patch('/admin/messages/' + encodeURIComponent(msg.getAttribute('data-id')), {
          status: msg.getAttribute('data-msg-action')
        }, 'Message updated');
      }
    });
  }

  /* ----------------------------------------------------------------- tabs */
  function initTabs() {
    var titles = {
      bookings: 'Bookings',
      applications: 'Pandit applications',
      orders: 'Shop orders',
      messages: 'Messages',
      account: 'Account & settings'
    };
    var panels = {
      bookings: 'panelBookings',
      applications: 'panelApplications',
      orders: 'panelOrders',
      messages: 'panelMessages',
      account: 'panelAccount'
    };

    Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (button) {
      button.addEventListener('click', function () {
        state.tab = button.getAttribute('data-tab');
        Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (b) {
          b.classList.toggle('is-active', b === button);
        });
        Object.keys(panels).forEach(function (key) {
          $(panels[key]).hidden = key !== state.tab;
        });
        $('pageTitle').textContent = titles[state.tab];
        $('statsRow').hidden = state.tab === 'account';
        if (state.tab === 'account') loadProfile();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* -------------------------------------------------------------- filters */
  function debounce(fn, wait) {
    var timer = null;
    return function (event) {
      clearTimeout(timer);
      timer = setTimeout(function () { fn(event); }, wait);
    };
  }

  function initFilters() {
    $('bookingSearch').addEventListener('input', debounce(function (event) {
      state.search = event.target.value.trim();
      renderBookings();
    }, 140));

    $('bookingFilter').addEventListener('change', function (event) {
      state.paymentFilter = event.target.value;
      renderBookings();
    });

    $('refreshBtn').addEventListener('click', function () { loadAll(); });
    $('themeToggle').addEventListener('click', toggleTheme);
    $('logoutBtn').addEventListener('click', function () { signOut('Signed out.'); });
  }

  function initShortcuts() {
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key === '/' && state.tab === 'bookings') {
        var tag = (event.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        event.preventDefault();
        $('bookingSearch').focus();
      }
    });
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    initTheme();
    initAutoRefresh();
    initLogin();
    initTabs();
    initFilters();
    initActions();
    initExport();
    initAccount();
    initShortcuts();

    try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (err) { token = ''; }
    if (!token) return;

    api('/admin/me').then(function (admin) {
      state.admin = admin;
      showApp();
    }).catch(function () {
      token = '';
      try { localStorage.removeItem(TOKEN_KEY); } catch (err) { /* ignore */ }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
