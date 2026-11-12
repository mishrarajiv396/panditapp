/* Booking flow — ritual, muhurat, household details, pandit and payment */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var params = new URLSearchParams(location.search);
  var savedCity = A.store.get('vp_city', 'Gurugram');

  var state = {
    pooja: null,
    city: D.CITIES.filter(function (c) { return c.name === savedCity; })[0] || D.CITIES[0],
    date: '',
    muhurat: null,
    pandit: null,
    extras: {},
    payment: 'UPI',
    nri: params.get('nri') === '1'
  };

  /* ------------------------------------------------------------------ setup */
  function isoDate(d) {
    return d.getFullYear() + '-' + A.pad(d.getMonth() + 1) + '-' + A.pad(d.getDate());
  }
  function parseDate(s) {
    var p = String(s).split('-').map(Number);
    return { y: p[0], m: p[1], d: p[2] };
  }
  function prettyDate(s) {
    var p = parseDate(s);
    var d = new Date(p.y, p.m - 1, p.d);
    return V.WEEKDAYS[d.getDay()].slice(0, 3) + ', ' + p.d + ' ' +
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.m - 1] + ' ' + p.y;
  }
  function todayISO() { return isoDate(new Date()); }
  function tomorrowISO() { var d = new Date(); d.setDate(d.getDate() + 1); return isoDate(d); }

  // Six digits, drawn from the browser's CSPRNG when available. The server
  // also accepts the older 4-digit codes so saved bookings keep working.
  function randomOtp() {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return String(100000 + (buf[0] % 900000));
    }
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /* ----------------------------------------------------------- UPI payment */
  var OWNER = (window.SITE_SETTINGS && window.SITE_SETTINGS.owner) || {};
  var OWNER_UPI = OWNER.upi || 'rajivlochanmishra952-1@okhdfcbank';
  var OWNER_UPI_NAME = OWNER.upiName || OWNER.name || 'Rajiv Lochan Mishra';
  var OWNER_PHONE = String(OWNER.phone || '918889685370').replace(/[^\d]/g, '');

  function currentPayment() {
    var picked = $$('input[name="payment"]').filter(function (r) { return r.checked; })[0];
    return picked ? picked.value : 'UPI';
  }

  function payNowAmount(total, method) {
    if (method === '25% now') return Math.max(1, Math.round(total * 0.25));
    return total;
  }

  function upiPayLink(amount, note) {
    return 'upi://pay?pa=' + OWNER_UPI +
      '&pn=' + encodeURIComponent(OWNER_UPI_NAME) +
      '&am=' + Number(amount).toFixed(2) +
      '&cu=INR&tn=' + encodeURIComponent(String(note).slice(0, 50));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function saveBooking(booking) {
    var all = A.store.get('vp_bookings', []);
    var found = false;
    all.forEach(function (b, i) { if (b.id === booking.id) { all[i] = booking; found = true; } });
    if (!found) all.unshift(booking);
    A.store.set('vp_bookings', all);

    // Mirror to MySQL when the backend is reachable. The site keeps working
    // from localStorage when it is not.
    if (window.PanditAPI && window.PanditAPI.enabled) {
      if (booking.paymentStatus === 'Awaiting verification') {
        window.PanditAPI.claimPayment(booking.id, {
          otp: booking.otp,
          paymentRef: booking.paymentRef,
          amountPaid: booking.payNow
        });
      } else {
        window.PanditAPI.createBooking(booking);
      }
    }
  }

  /* The WhatsApp message the buyer sends after paying: the full booking
     plus the UPI reference, so the owner verifies in one glance. */
  function receiptLink(booking) {
    var note = '✅ Paid via UPI: ' + A.INR(booking.payNow) +
      (booking.paymentRef ? '\n🔖 UTR / reference: ' + booking.paymentRef : '') +
      '\nPlease verify my payment and confirm the booking.';
    if (typeof A.waBookingLink === 'function') return A.waBookingLink(booking, note);
    var text = 'Booking ' + booking.id + ' — ' + booking.poojaName + '\n' +
      booking.dateLabel + ' · ' + booking.time + '\n' +
      'Paid via UPI: ' + A.INR(booking.payNow) +
      (booking.paymentRef ? '\nUTR / reference: ' + booking.paymentRef : '') +
      '\nPlease verify my payment and confirm the booking.';
    if (window.SITE_SETTINGS && typeof window.SITE_SETTINGS.waLink === 'function') {
      return window.SITE_SETTINGS.waLink(text);
    }
    return 'https://wa.me/' + OWNER_PHONE + '?text=' + encodeURIComponent(text);
  }

  /* Every confirmed pooja booking goes to the owner's WhatsApp with every
     detail pre-filled — the buyer just presses Send. Same link powers the
     buttons in the payment sheet and the success dialog, so a blocked
     pop-up never stops the handoff. */
  function openBookingWhatsApp(booking) {
    var url = (typeof A.waBookingLink === 'function')
      ? A.waBookingLink(booking)
      : receiptLink(booking);
    var win = window.open(url, '_blank');
    if (win) {
      A.toast('WhatsApp opened — press Send to deliver your booking');
    } else {
      A.toast('Allow pop-ups, or use the WhatsApp button below', 'error');
    }
    return win;
  }

  function poojaById(id) { return D.POOJAS.filter(function (p) { return p.id === id; })[0]; }

  function initPoojaSelect() {
    var sel = $('#poojaSelect');
    var groups = D.CATEGORIES.filter(function (c) { return c !== 'All Rituals'; });
    sel.innerHTML = groups.map(function (cat) {
      var items = D.POOJAS.filter(function (p) { return p.cat === cat; });
      return '<optgroup label="' + A.esc(cat) + '">' + items.map(function (p) {
        return '<option value="' + p.id + '">' + A.esc(p.name) + ' — ' + A.INR(p.price) + ' · ' + A.esc(p.duration) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
    var wanted = params.get('pooja');
    if (!poojaById(wanted)) wanted = D.POOJAS[2].id;
    sel.value = wanted;
    state.pooja = poojaById(wanted);
    sel.addEventListener('change', function () {
      state.pooja = poojaById(sel.value);
      var u = new URL(location.href);
      u.searchParams.set('pooja', sel.value);
      history.replaceState(null, '', u);
      renderSummary();
      renderPoojaHint();
    });
  }

  function initCity() {
    var sel = $('#bookingCity');
    sel.innerHTML = A.cityOptions(state.city.name);
    sel.addEventListener('change', function () {
      state.city = A.findCity(sel.value);
      A.store.set('vp_city', state.city.name);
      renderDates();
      renderMuhurat();
      renderSummary();
    });
  }

  function initDate() {
    var inp = $('#bookingDate');
    inp.min = todayISO();
    inp.value = tomorrowISO();
    var dp = params.get('date');
    if (dp && /^\d{4}-\d{2}-\d{2}$/.test(dp) && dp >= inp.min) inp.value = dp;
    state.date = inp.value;
    inp.addEventListener('change', function () {
      if (!inp.value) return;
      state.date = inp.value;
      renderDates();
      renderMuhurat();
      renderSummary();
    });
  }

  function initStatic() {
    $$('[data-head-chip]').forEach(function (el) { el.insertAdjacentHTML('afterbegin', A.icon(el.getAttribute('data-head-chip'))); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-arrow]').forEach(function (el) { el.innerHTML = A.icon('arrow'); });
    $$('[data-back]').forEach(function (el) { if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', A.icon('arrowLeft')); });

    var lang = $('#bookLanguage');
    lang.innerHTML = D.LANGUAGES.map(function (l) { return '<option>' + A.esc(l) + '</option>'; }).join('');

    var trad = $('#bookTradition');
    D.TRADITIONS.forEach(function (t) {
      var o = document.createElement('option');
      o.textContent = t;
      trad.appendChild(o);
    });

    $('#gotraList').innerHTML = D.GOTRAS.map(function (g) { return '<option value="' + g + '">'; }).join('');
  }

  /* --------------------------------------------------------------- muhurat */
  function renderDates() {
    var p = parseDate(state.date);
    var pc;
    try { pc = V.panchang(p.y, p.m, p.d, state.city); } catch (e) { return; }

    var badTithi = [3, 8, 13, 18, 22, 23, 28].indexOf(pc.tithi.index) >= 0;
    var badNak = [1, 2, 5, 8, 9, 17, 18, 23].indexOf(pc.nakshatra.index) >= 0;
    var note = $('#dateNote');
    if (badTithi || badNak) {
      note.innerHTML = '<div class="note-strip warn-strip">' + A.icon('alert') +
        '<span><b>A gentle note:</b> ' + A.esc(pc.tithi.paksha + ' ' + pc.tithi.name) + ' and ' + A.esc(pc.nakshatra.name) +
        ' are not the strongest combination for a new beginning. You can still book — the pandit will add a shanti mantram — or choose one of the green dates below.</span></div>';
    } else {
      note.innerHTML = '<div class="note-strip">' + A.icon('check') +
        '<span><b>Shubh date:</b> ' + A.esc(pc.tithi.paksha + ' ' + pc.tithi.name) + ' · ' + A.esc(pc.nakshatra.name) +
        ' nakshatra · Rahu Kaal ' + V.fmtTime(pc.rahu.start, state.city.tz) + ' – ' + V.fmtTime(pc.rahu.end, state.city.tz) + '.</span></div>';
    }
    renderShubhDates();
    renderMuhurat(pc);
  }

  function renderShubhDates() {
    var wrap = $('#shubhDates');
    var list;
    try { list = V.muhuratList(state.city, 30); } catch (e) { wrap.innerHTML = ''; return; }
    var picked = state.date;
    var next = list.filter(function (d) { return d.key >= picked && d.shubh; }).slice(0, 5);
    if (!next.length) {
      wrap.innerHTML = '<span class="tiny muted">No extra-strong dates in the next 30 days — your selected date can still be confirmed by the pandit.</span>';
      return;
    }
    wrap.innerHTML = '<span class="tiny muted shubh-label">Next shubh dates:</span>' +
      next.map(function (d) {
        var cls = 'filter-chip' + (d.key === picked ? ' active' : '');
        return '<button type="button" class="' + cls + '" data-shubh="' + d.key + '">' + A.esc(d.day) + ' ' + A.esc(V.fmtShort(d.date, state.city.tz)) +
          ' <span class="op-60">· ' + A.esc(d.tithi.name) + '</span></button>';
      }).join('');
    $$('[data-shubh]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        state.date = b.getAttribute('data-shubh');
        $('#bookingDate').value = state.date;
        renderDates();
        renderSummary();
      });
    });
  }

  function overlaps(a, b) {
    return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
  }

  function renderMuhurat(pc) {
    if (!pc) {
      var p = parseDate(state.date);
      try { pc = V.panchang(p.y, p.m, p.d, state.city); } catch (e) { return; }
    }
    var tz = state.city.tz;
    var slots = [
      { id: 'brahma', label: 'Brahma Muhurat', start: pc.brahma.start, end: pc.brahma.end, note: 'Most spiritually potent' },
      { id: 'abhijit', label: 'Abhijit Muhurat', start: pc.abhijit.start, end: pc.abhijit.end, note: 'Victory window' }
    ];
    pc.choghadiya.forEach(function (c) {
      if (!c.good) return;
      if (overlaps(c, pc.rahu)) return;
      if (c.start.getTime() < pc.sunrise.getTime()) return;
      slots.push({ id: 'chog-' + c.name, label: c.name + ' Choghadiya', start: c.start, end: c.end, note: 'Auspicious daytime' });
    });
    slots = slots.slice(0, 6);
    slots.push({ id: 'custom', label: 'Pandit will confirm', start: null, end: null, note: 'Family muhurat or custom time' });

    var previousId = state.muhurat && state.muhurat.id;
    var pick = slots.filter(function (s) { return s.id === previousId; })[0] || slots.filter(function (s) { return s.id === 'abhijit'; })[0] || slots[0];
    state.muhurat = pick;

    var wrap = $('#muhuratSlots');
    wrap.innerHTML = slots.map(function (s) {
      var time = s.start ? V.fmtTime(s.start, tz) + ' – ' + V.fmtTime(s.end, tz) : 'Time to be advised';
      return '<button type="button" class="slot' + (s.id === pick.id ? ' active' : '') + '" data-slot="' + s.id + '">' +
        '<b>' + A.esc(s.label) + '</b><span>' + time + '</span><span class="slot__note">' + A.esc(s.note) + '</span></button>';
    }).join('');
    $$('[data-slot]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = slots.filter(function (x) { return x.id === b.getAttribute('data-slot'); })[0];
        if (!s) return;
        state.muhurat = s;
        $$('[data-slot]', wrap).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        renderSummary();
      });
    });
    renderSummary();
  }

  /* ------------------------------------------------------------------ gotra */
  function initGotra() {
    var btn = $('#gotraFinder');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var chips = D.GOTRAS.map(function (g) {
        return '<button type="button" class="filter-chip" data-gotra="' + g + '">' + g + '</button>';
      }).join('');
      A.openModal(
        '<div class="modal__head"><div><span class="kicker">Sankalpa</span><h2 class="fs-14">Find your gotra</h2></div>' +
        '<button class="close-x" data-modal-close aria-label="Close">' + A.icon('close') + '</button></div>' +
        '<div class="modal__body"><p class="small muted">Gotra is the sage lineage of your paternal family, spoken in the sankalpa. It is not a caste. If you are unsure, <b>Kashyap</b> is the traditional default used by many families.</p>' +
        '<div class="search search--full mt-2"><span>' + A.icon('search') + '</span><input id="gotraSearch" placeholder="Search your gotra…" aria-label="Search gotras"></div>' +
        '<div class="chip-row mt-2" id="gotraChips">' + chips + '</div>' +
        '<div class="modal-price"><span class="tiny muted">30 commonly used gotras across North India.</span>' +
        '<button class="btn btn--primary btn--sm" type="button" id="useKashyap">Use Kashyap (default)</button></div></div>',
        { width: '560px' }
      );
      $('#gotraSearch').addEventListener('input', function (e) {
        var q = e.target.value.toLowerCase();
        $$('#gotraChips [data-gotra]').forEach(function (c) {
          c.style.display = c.getAttribute('data-gotra').toLowerCase().indexOf(q) >= 0 ? '' : 'none';
        });
      });
      $$('#gotraChips [data-gotra]').forEach(function (c) {
        c.addEventListener('click', function () {
          $('#bookGotra').value = c.getAttribute('data-gotra');
          A.closeModal();
          A.toast('Gotra set to ' + c.getAttribute('data-gotra'));
        });
      });
      $('#useKashyap').addEventListener('click', function () {
        $('#bookGotra').value = 'Kashyap';
        A.closeModal();
        A.toast('Kashyap set as your gotra');
      });
    });
  }

  /* ----------------------------------------------------------------- pandit */
  function initPandits() {
    var wrap = $('#panditChoices');
    var sorted = D.PANDITS.slice().sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
    var html = '<label class="choice choice--wide"><input type="radio" name="pandit" value="" checked><span class="choice__box"></span>' +
      '<span class="choice__text"><b>Best match — assign for me</b><span>We pick a pandit by ritual, language and your area. Most families choose this.</span></span></label>';
    html += sorted.map(function (p, i) {
      return '<label class="choice pandit-choice' + (i >= 4 ? ' hide' : '') + '" data-pandit-card="' + p.id + '">' +
        '<input type="radio" name="pandit" value="' + p.id + '">' +
        '<span class="choice__box"></span>' +
        '<span class="choice__text"><b>' + A.esc(p.name) + ' <span class="chip chip--sm chip--gold">' + p.rating.toFixed(1) + ' ★</span></b>' +
        '<span>' + A.esc(p.title) + ' · ' + p.exp + ' yrs · ' + A.esc(p.area) + '</span>' +
        '<span>' + A.esc(p.tradition) + ' · ' + A.esc(p.langs.join(', ')) + '</span>' +
        '<span class="choice__note">' + A.esc(p.spec.join(' · ')) + '</span></span></label>';
    }).join('');
    wrap.innerHTML = html;

    wrap.addEventListener('change', function (e) {
      if (e.target.name !== 'pandit') return;
      state.pandit = e.target.value ? D.PANDITS.filter(function (p) { return p.id === e.target.value; })[0] : null;
      renderSummary();
    });

    var all = $('#showAllPandits');
    var expanded = false;
    all.addEventListener('click', function () {
      expanded = !expanded;
      $$('.pandit-choice').forEach(function (c, i) { c.classList.toggle('hide', !expanded && i >= 4); });
      all.textContent = expanded ? 'Show fewer pandits' : 'Show all ' + sorted.length + ' pandits';
    });
  }

  /* ----------------------------------------------------------------- extras */
  function initExtras() {
    var wrap = $('#extraChoices');
    wrap.innerHTML = D.EXTRAS.map(function (x) {
      return '<label class="choice"><input type="checkbox" value="' + x.id + '" data-extra="' + x.id + '">' +
        '<span class="choice__box"></span><span class="choice__text"><b>' + x.icon + ' ' + A.esc(x.name) +
        ' <span class="extra-price">+' + A.INR(x.price) + '</span></b><span>' + A.esc(x.note) + '</span></span></label>';
    }).join('');
    wrap.addEventListener('change', function (e) {
      var id = e.target.getAttribute('data-extra');
      if (!id) return;
      if (e.target.checked) state.extras[id] = true; else delete state.extras[id];
      renderSummary();
    });

    if (state.nri) {
      var live = wrap.querySelector('[data-extra="x6"]');
      if (live) { live.checked = true; state.extras.x6 = true; }
      A.toast('NRI live-stream added to your booking');
    }
  }

  /* ---------------------------------------------------------------- summary */
  function extrasTotal() {
    return D.EXTRAS.reduce(function (s, x) { return s + (state.extras[x.id] ? x.price : 0); }, 0);
  }

  function renderSummary() {
    var p = state.pooja;
    if (!p) return;
    $('#sumPooja').textContent = p.name;
    $('#sumMeta').textContent = p.duration + ' · ' + p.cat + ' · save ' + A.INR(p.mrp - p.price);
    var m = state.muhurat;
    var dp = parseDate(state.date);
    var dateTxt = dp.d + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dp.m - 1];
    $('#sumMuhurat').textContent = m ? (dateTxt + ' · ' + m.label + (m.start ? ' ' + V.fmtTime(m.start, state.city.tz) : ' · TBC')) : '—';
    $('#sumCity').textContent = state.city.name;
    $('#sumPandit').textContent = state.pandit ? state.pandit.name.replace('Pt. ', '').replace('Pandita ', '') : 'Best match';
    var extra = extrasTotal();
    var gst = Math.round((p.price + extra) * 0.18);
    $('#sumBase').textContent = A.INR(p.price);
    $('#sumExtras').textContent = extra ? A.INR(extra) : '—';
    $('#sumGst').textContent = A.INR(gst);
    $('#sumTotal').textContent = A.INR(p.price + extra + gst);
    renderPoojaHint();
    renderPayNow();
  }

  function renderPayNow() {
    var line = $('#payNowLine');
    if (!line || !state.pooja) return;
    var extra = extrasTotal();
    var gst = Math.round((state.pooja.price + extra) * 0.18);
    var total = state.pooja.price + extra + gst;
    var method = currentPayment();
    var now = payNowAmount(total, method);
    if (method === '25% now') {
      line.innerHTML = '<b>' + A.INR(now) + ' now</b> · ' + A.INR(total - now) +
        ' after the ritual · UPI to ' + A.esc(OWNER_UPI_NAME) + '.';
    } else if (method === 'UPI') {
      line.innerHTML = '<b>' + A.INR(now) + ' now over UPI</b> · paid directly to ' +
        A.esc(OWNER_UPI_NAME) + '.';
    } else {
      line.innerHTML = '<b>' + A.INR(now) + ' total</b> · we will send a secure ' +
        A.esc(method.toLowerCase()) + ' link on WhatsApp. UPI confirms fastest.';
    }
  }

  function renderPoojaHint() {
    var p = state.pooja;
    if (!p) return;
    $('#poojaHint').innerHTML = '<b>' + A.esc(p.name) + '</b> · ' + A.esc(p.duration) + ' · ' + A.esc(p.cat) +
      ' · all-inclusive ' + A.INR(p.price) + ' <a href="poojas.html?q=' + encodeURIComponent(p.name.split(' ')[0]) + '" class="link-underline">what’s included?</a>';
  }

  /* ------------------------------------------------------------------- flow */
  function go(step) {
    $$('.book-step').forEach(function (s) { s.classList.toggle('hide', Number(s.getAttribute('data-step')) !== step); });
    $$('[data-step-label]').forEach(function (s) {
      var n = Number(s.getAttribute('data-step-label'));
      s.classList.toggle('active', n === step);
      s.classList.toggle('done', n < step);
    });
    var anchor = $('.stepper');
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
  }

  function showError(f) {
    f.reportValidity ? f.reportValidity() : null;
    f.focus();
  }

  function validateStep(step) {
    var wrap = $('.book-step[data-step="' + step + '"]');
    var fields = $$('input[required],select[required],textarea[required]', wrap);
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) { showError(fields[i]); return false; }
    }
    if (step === 1 && !state.muhurat) { A.toast('Please choose a muhurat'); return false; }
    if (step === 3 && !$('#policyConsent').checked) {
      A.toast('Please accept the cancellation policy', 'error');
      $('#policyConsent').focus();
      return false;
    }
    return true;
  }

  function initNav() {
    $$('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () {
        var from = Number(b.getAttribute('data-next')) - 1;
        if (!validateStep(from)) return;
        go(Number(b.getAttribute('data-next')));
      });
    });
    $$('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { go(Number(b.getAttribute('data-back'))); });
    });
    $('#bookingForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(3)) return;
      confirmBooking();
    });
  }

  function confirmBooking() {
    var btn = $('#confirmBooking');
    btn.disabled = true;
    btn.style.opacity = '.7';
    btn.innerHTML = 'Confirming your sankalpa…';

    var customer = {
      name: $('#bookName').value.trim(),
      phone: $('#bookPhone').value.trim(),
      address: $('#bookAddress').value.trim(),
      society: $('#bookSociety').value.trim(),
      pin: $('#bookPin').value.trim(),
      gate: $('#bookGate').value.trim(),
      gotra: $('#bookGotra').value.trim() || 'Kashyap',
      language: $('#bookLanguage').value,
      tradition: $('#bookTradition').value,
      notes: $('#bookNotes').value.trim(),
      gstin: $('#bookGst').value.trim(),
      company: $('#bookCompany').value.trim(),
      gatePass: $('#gateConsent').checked
    };
    var payment = currentPayment();
    state.payment = payment;

    var extra = extrasTotal();
    var gst = Math.round((state.pooja.price + extra) * 0.18);
    var total = state.pooja.price + extra + gst;
    var payNow = payNowAmount(total, payment);
    var id = 'VP-' + String(Date.now()).slice(-6);
    var otp = randomOtp();

    var booking = {
      id: id, type: 'pooja', status: 'Confirmed', createdAt: new Date().toISOString(),
      poojaId: state.pooja.id, poojaName: state.pooja.name,
      date: state.date, dateLabel: prettyDate(state.date),
      time: state.muhurat ? state.muhurat.label + (state.muhurat.start ? ' · ' + V.fmtTime(state.muhurat.start, state.city.tz) + ' – ' + V.fmtTime(state.muhurat.end, state.city.tz) : ' · time TBC') : '—',
      panditName: state.pandit ? state.pandit.name : '',
      place: state.city.name + (customer.society ? ' · ' + customer.society : ''),
      base: state.pooja.price, extras: extra, gst: gst, total: total,
      payment: payment, paymentStatus: 'Pending', paymentRef: '',
      payNow: payNow, balance: total - payNow, amountPaid: 0, upi: OWNER_UPI,
      otp: otp, customer: customer,
      extrasList: D.EXTRAS.filter(function (x) { return state.extras[x.id]; }).map(function (x) { return x.name; })
    };

    saveBooking(booking);

    // Straight to the owner's WhatsApp: opened synchronously inside the
    // click handler so popup blockers allow it. The buyer only has to
    // press Send; the payment sheet opens behind this tab.
    openBookingWhatsApp(booking);

    setTimeout(function () {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.innerHTML = 'Confirm booking ' + A.icon('arrow');
      showPaymentSheet(booking);
    }, 700);
  }

  function showPaymentSheet(booking) {
    var link = upiPayLink(booking.payNow, booking.id + ' ' + booking.poojaName);
    var qr = '';
    if (window.qrcode) {
      try {
        var q = window.qrcode(0, 'M');
        q.addData(link);
        q.make();
        qr = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
      } catch (e) { qr = ''; }
    }
    var methodNote = (booking.payment === 'Card' || booking.payment === 'Netbanking')
      ? '<p class="tiny muted center mt-2">You picked ' + A.esc(booking.payment) +
        '. A secure link follows on WhatsApp once you notify us — UPI below confirms instantly.</p>'
      : '';

    A.openModal(
      '<div class="modal__body pay-sheet">' +
      '<span class="kicker kicker--center">' + (booking.payment === '25% now' ? 'Pay 25% now' : 'Secure UPI payment') + '</span>' +
      '<h2 class="pay-sheet__amount">' + A.INR(booking.payNow) + '</h2>' +
      '<p class="small muted center">' + A.esc(booking.poojaName) + ' · ' + A.esc(booking.dateLabel) + '</p>' +
      '<div class="pay-sheet__id">Booking ' + A.esc(booking.id) + '</div>' +
      (qr ? '<div class="pay-sheet__qr"><div class="pay-sheet__frame">' + qr + '</div>' +
        '<p class="small"><b>' + A.esc(OWNER_UPI_NAME) + '</b></p>' +
        '<p class="tiny muted">Scan with GPay, PhonePe, Paytm or any UPI app</p></div>' : '') +
      '<div class="pay-sheet__upi"><span class="tiny muted">UPI ID</span>' +
      '<div class="pay-sheet__copy"><code id="payUpiId">' + A.esc(OWNER_UPI) + '</code>' +
      '<button class="btn btn--ghost btn--sm" type="button" id="payCopy">Copy</button></div></div>' +
      '<a class="btn btn--primary btn--wide mt-2" id="payOpen" href="' + A.esc(link) + '">Open UPI app · ' + A.INR(booking.payNow) + '</a>' +
      '<a class="btn btn--whatsapp btn--wide" id="payWa" target="_blank" rel="noopener" href="' + A.esc((typeof A.waBookingLink === 'function') ? A.waBookingLink(booking) : receiptLink(booking)) + '">' + A.icon('wa') + ' Send booking on WhatsApp</a>' +
      '<div class="field mt-2"><label for="payRef">UTR / UPI reference <span class="opt">optional, helps us verify faster</span></label>' +
      '<input id="payRef" inputmode="numeric" maxlength="30" placeholder="e.g. 402183746592"></div>' +
      '<div class="pay-sheet__actions">' +
      '<button class="btn btn--gold" type="button" id="payPaid">I have paid — notify on WhatsApp</button>' +
      '<button class="btn btn--ghost" type="button" id="payLater">Pay later</button></div>' +
      '<p class="tiny muted center mt-2">Pay only <b>' + A.esc(OWNER_UPI_NAME) + '</b> · ' + A.esc(OWNER_UPI) +
      '. Your slot is held for 60 minutes.</p>' +
      methodNote +
      '</div>', { width: '470px' }
    );

    var copy = $('#payCopy');
    if (copy) copy.addEventListener('click', function () {
      copyText(OWNER_UPI).then(function () {
        A.toast('UPI ID copied — ' + OWNER_UPI);
      }, function () {
        A.toast('Could not copy. Select the UPI ID manually.', 'error');
      });
    });

    var paid = $('#payPaid');
    if (paid) paid.addEventListener('click', function () {
      var ref = $('#payRef');
      booking.paymentRef = ref ? ref.value.trim() : '';
      booking.paymentStatus = 'Awaiting verification';
      booking.paymentClaimedAt = new Date().toISOString();
      saveBooking(booking);
      window.open(receiptLink(booking), '_blank', 'noopener');
      showSuccess(booking);
    });

    var later = $('#payLater');
    if (later) later.addEventListener('click', function () { showSuccess(booking); });
  }

  function showSuccess(booking) {
    var pending = booking.paymentStatus !== 'Awaiting verification';
    var payLine = pending
      ? '<div class="summary-line"><span>Payment</span><b>' + A.INR(booking.payNow) + ' due · UPI</b></div>'
      : '<div class="summary-line"><span>Payment</span><b>' + A.INR(booking.payNow) + ' · awaiting verification</b></div>';

    A.openModal(
      '<div class="modal__body success">' +
      '<div class="success__icon">' + A.icon('check') + '</div>' +
      '<span class="kicker kicker--center">Sankalpa accepted</span>' +
      '<h2>Your pooja is booked</h2>' +
      '<p class="muted mt-1">' + A.esc(booking.poojaName) + ' on ' + A.esc(booking.dateLabel) + '</p>' +
      '<div class="booking-id mt-2">' + A.esc(booking.id) + '</div>' +
      '<div class="summary-lines summary-lines--dialog">' +
      '<div class="summary-line"><span>Muhurat</span><b>' + A.esc(booking.time) + '</b></div>' +
      '<div class="summary-line"><span>Pandit</span><b>' + A.esc(booking.panditName || 'Assignment in progress') + '</b></div>' +
      '<div class="summary-line"><span>Gate OTP</span><b>' + A.esc(booking.otp) + '</b></div>' +
      payLine +
      '<div class="summary-line total"><span>Total</span><b>' + A.INR(booking.total) + '</b></div></div>' +
      '<p class="small muted mt-3">We’ve saved the confirmation for <b>' + A.esc(booking.customer.phone) + '</b>. Samagri arrives before the muhurat; the pandit’s gate pass is shared one hour prior.</p>' +
      '<div class="note-strip mt-2">' + A.icon('wa') + '<span><b>Send it on WhatsApp.</b> Your full booking details are ready as a message to ' +
        A.esc(OWNER_UPI_NAME) + ' — press Send in WhatsApp so the pooja is confirmed instantly.</span></div>' +
      (pending
        ? '<p class="tiny muted mt-2">Your slot is held for 60 minutes. Pay by UPI to confirm it.</p>'
        : '<p class="tiny muted mt-2">We’ll verify the UPI reference and confirm on WhatsApp within 30 minutes.</p>') +
      '<div class="success-actions">' +
      (pending ? '<button class="btn btn--gold" type="button" id="successPay">Pay ' + A.INR(booking.payNow) + ' now</button>' : '') +
      '<a class="btn btn--whatsapp" id="successWa" target="_blank" rel="noopener" href="' + A.esc((typeof A.waBookingLink === 'function') ? A.waBookingLink(booking) : receiptLink(booking)) + '">' + A.icon('wa') + ' Send on WhatsApp</a>' +
      '<button class="btn btn--primary" type="button" id="viewBookings">View my bookings</button>' +
      '<button class="btn btn--ghost" type="button" id="successIcs">Add to calendar</button>' +
      '<button class="btn btn--ghost" type="button" id="successReceipt">Receipt</button>' +
      '<a class="btn btn--ghost" href="shop.html">Add samagri</a></div>' +
      '</div>', { width: '500px' }
    );

    if (pending) {
      var pay = $('#successPay');
      if (pay) pay.addEventListener('click', function () { showPaymentSheet(booking); });
    }
    var view = $('#viewBookings');
    if (view) view.addEventListener('click', function () { A.closeModal(); A.bookingsModal(); });
    var ics = $('#successIcs');
    if (ics) ics.addEventListener('click', function () { A.addToCalendar(booking); });
    var receipt = $('#successReceipt');
    if (receipt) receipt.addEventListener('click', function () { A.printBooking(booking); });
  }

  function init() {
    initStatic();
    initPoojaSelect();
    initCity();
    initDate();
    initGotra();
    initPandits();
    initExtras();
    var pid = params.get('pandit');
    if (pid) {
      var pr = document.querySelector('input[name="pandit"][value="' + pid + '"]');
      if (pr) { pr.checked = true; pr.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    $$('input[name="payment"]').forEach(function (r) {
      r.addEventListener('change', function () { state.payment = r.value; renderPayNow(); });
    });
    renderDates();
    renderMuhurat();
    renderSummary();
    initNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Keep the earliest bookable date tied to the real "today" if the page
  // stays open past midnight.
  function refreshMinDate() {
    var inp = $('#bookingDate');
    if (!inp) return;
    var min = todayISO();
    if (inp.min === min) return;
    inp.min = min;
    if (inp.value && inp.value < min) {
      inp.value = tomorrowISO();
      state.date = inp.value;
      renderDates();
      renderMuhurat();
      renderSummary();
    }
  }
  setInterval(refreshMinDate, 60000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refreshMinDate();
  });
  window.addEventListener('pageshow', refreshMinDate);
})();
