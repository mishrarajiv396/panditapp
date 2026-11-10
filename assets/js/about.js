/* About page — values, Punya-Flow impact, FAQ and contact form */
(function () {
  'use strict';
  var A = window.App, D = window.PanditData, SS = window.SITE_SETTINGS || {};
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;
  var TEL = typeof SS.telLink === 'function' ? SS.telLink() : 'tel:+918889685370';

  var VALUES = [
    { icon: 'shield', title: 'Verification before visibility', text: 'A pandit is listed only after Aadhaar, institution certification and a live chanting assessment by our senior acharyas. Ratings below 4.5 are reviewed, not hidden.' },
    { icon: 'rupee', title: 'One price, dakshina included', text: 'Pandit, travel, samagri, flowers and dakshina are quoted together before you pay. No cash negotiation at the end of the katha.' },
    { icon: 'globe', title: 'The ritual in your mother tongue', text: 'North Indian, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati and Marwari vidhis — performed the way your family knows them, not a shortened generic version.' },
    { icon: 'leaf', title: 'Leave the home cleaner', text: 'Punyā-Flow collects flowers, ash and prasad waste at the end of every ritual. What was offered with respect is not sent to a landfill.' }
  ];

  var FLOW = [
    { value: '92%', label: 'of ritual waste diverted', text: 'Flowers, ash and biodegradable samagri collected across Gurugram bookings in the last 12 months.' },
    { value: '1.8 t', label: 'compost returned', text: 'Given to gaushalas, society gardens and the nurseries that grow our marigolds.' },
    { value: '7 days', label: 'to your impact note', text: 'A short WhatsApp card with the weight collected and where it went. No green claims without a receipt.' }
  ];

  function init() {
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });
    $$('[data-tick]').forEach(function (el) { el.innerHTML = A.icon('check') + '<span>' + el.textContent + '</span>'; });
    $$('[data-ico-chip]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-chip')) + el.textContent; });

    renderStats();
    renderValues();
    renderFlow();
    renderFaq();
    initContact();
  }

  function renderStats() {
    var el = $('#aboutStats');
    if (!el) return;
    el.innerHTML = D.STATS.map(function (s) {
      var v = s.decimal ? s.value.toFixed(1) : Math.round(s.value).toLocaleString('en-IN');
      return '<div><div class="trustbar__icon">' + A.icon(s.label.indexOf('rating') >= 0 ? 'star' : s.label.indexOf('pandit') >= 0 ? 'shield' : s.label.indexOf('Ritual') >= 0 ? 'fire' : 'pin') + '</div>' +
        '<div><b>' + v + (s.suffix || '') + '</b><span>' + A.esc(s.label) + '</span></div></div>';
    }).join('');
  }

  function renderValues() {
    var el = $('#valueGrid');
    if (!el) return;
    el.innerHTML = VALUES.map(function (v) {
      return '<article class="card feature card--hover">' +
        '<div class="feature__icon">' + A.icon(v.icon) + '</div>' +
        '<h3>' + A.esc(v.title) + '</h3>' +
        '<p>' + A.esc(v.text) + '</p>' +
      '</article>';
    }).join('');
  }

  function renderFlow() {
    var el = $('#flowStats');
    if (!el) return;
    el.innerHTML = FLOW.map(function (f) {
      return '<article class="card impact"><div class="card__body">' +
        '<b class="impact__value">' + A.esc(f.value) + '</b>' +
        '<h3>' + A.esc(f.label) + '</h3>' +
        '<p>' + A.esc(f.text) + '</p>' +
      '</div></article>';
    }).join('');
  }

  function renderFaq() {
    var el = $('#faqList');
    if (!el) return;
    el.innerHTML = D.FAQS.map(function (f, i) {
      return '<details class="faq__item"' + (i === 0 ? ' open' : '') + '>' +
        '<summary>' + A.esc(f.q) + '</summary>' +
        '<p>' + A.esc(f.a) + '</p>' +
      '</details>';
    }).join('');
  }

  function initContact() {
    var form = $('#contactForm');
    if (!form) return;

    function setTopic(v) {
      var box = $('#cTopic');
      if (!box || !v) return;
      if ([].some.call(box.options, function (o) { return o.value === v; })) box.value = v;
    }

    try { setTopic(new URLSearchParams(location.search).get('topic')); } catch (e) { /* ignore */ }
    if (location.hash === '#corporate') setTopic('corporate');
    $$('[data-contact-topic]').forEach(function (a) {
      a.addEventListener('click', function () { setTopic(a.getAttribute('data-contact-topic')); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#cName').value.trim();
      var phone = $('#cPhone').value.trim();
      var message = $('#cMessage').value.trim();
      if (!name || !phone || !message) {
        A.toast('Please add your name, phone and a short message', 'error');
        return;
      }
      if (!/^[0-9+\-\s()]{8,18}$/.test(phone)) {
        A.toast('That phone number looks incomplete', 'error');
        $('#cPhone').focus();
        return;
      }

      var lead = {
        id: 'C-' + String(Date.now()).slice(-6),
        name: name,
        phone: phone,
        email: $('#cEmail').value.trim(),
        topic: $('#cTopic').value,
        date: $('#cDate').value,
        message: message,
        createdAt: new Date().toISOString()
      };
      var all = A.store.get('vp_contact', []);
      all.unshift(lead);
      A.store.set('vp_contact', all.slice(0, 50));

      // Mirror the enquiry to MySQL so it also lands in the admin dashboard.
      // The modal opens either way; the site keeps working when offline.
      var api = window.PanditAPI;
      if (api && api.enabled && api.sendContact) {
        api.sendContact({
          name: name,
          email: lead.email,
          phone: phone,
          subject: lead.topic || 'Website contact',
          message: message + (lead.date ? '\nPreferred date: ' + lead.date : '')
        }).then(function (res) {
          if (!res.ok && !res.offline) {
            A.toast('Saved on your device. We could not reach the server, so please WhatsApp us if it is urgent.', 'error');
          }
        });
      }

      A.openModal(
        '<div class="modal__body success"><div class="success__icon">' + A.icon('check') + '</div>' +
        '<h2>Message received, ' + A.esc(name.split(' ')[0]) + '.</h2>' +
        '<p class="muted mt-1">A ritual coordinator will call you on ' + A.esc(phone) + ' within one working hour (6 AM – 10 PM IST). For anything within 24 hours, please call us directly.</p>' +
        '<div class="modal-price mt-18"><div><b class="serif">Reference ' + lead.id + '</b>' +
          '<p class="tiny muted">Keep this handy if you call before we do.</p></div>' +
          '<a class="btn btn--ghost" href="' + TEL + '">Call now</a></div>' +
        '<button class="btn btn--primary mt-3" type="button" data-modal-close>Close</button>' +
        '</div>', { width: '480px' });

      form.reset();
      if (location.hash === '#corporate') {
        var box = $('#cTopic');
        if (box) box.value = 'corporate';
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
