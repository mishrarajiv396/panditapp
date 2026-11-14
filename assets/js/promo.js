/* ==========================================================================
   Launch offer — 20% off every pooja, first 100 bookings.

   This file is the single browser-side source for the offer:
     • VPPromo.price(list)   → { list, price, discount, percent, active }
     • the homepage teaser, compact strips and live counter
     • English/Hindi copy for every offer element

   The amount charged still comes from the server (see server/src/offer.js).
   Pages re-render their prices when the `vp:promo` event arrives, so an
   expired offer flips the whole site back to list prices in one step.
   ========================================================================== */
(function (root) {
  'use strict';

  var doc = root.document;

  var state = {
    loaded: false,
    active: true,        // optimistic until /api/offer answers; server decides
    code: 'TOP100',
    percent: 20,
    limit: 100,
    claimed: null,       // null = not known yet, never invented
    remaining: null,
    error: false
  };

  /* ------------------------------------------------------------------ copy */
  var TEXT = {
    en: {
      badge: '20% OFF',
      kicker: 'Launch offer · first 100 bookings only',
      titleTail: 'off every pooja',
      sub: 'No code, no haggling. The launch discount is applied automatically to every ritual — samagri, pandit and GST stay exactly as before.',
      fact_auto: 'Applied automatically — no promo code',
      fact_poojas: 'Every one of the 100+ pooja packages',
      fact_live: 'Real booking counter — no fake urgency',
      cta: 'Claim one of the first 100 slots',
      altCta: 'See the discounted poojas',
      altEndedCta: 'See the full pooja catalogue',
      note: 'Shop samagri and astrology/Vastu consultations are not part of this offer.',
      meterEyebrow: 'Launch slots',
      slotsLeft: 'slots left',
      limitLabel: 'booking limit',
      limitNote: 'First 100 confirmed bookings',
      claimedOf: '{used} of {limit} claimed',
      claimedAll: 'All {limit} launch slots claimed',
      stripText: '<b>Launch offer:</b> 20% off every pooja for the first 100 bookings. Applied automatically — no code needed.',
      stripEnded: '<b>Launch offer ended.</b> All 100 slots are claimed — every pooja is back at its regular all-inclusive price.',
      stripRemaining: '<b>{remaining}</b> of {limit} launch slots left',
      stripLimit: '<b>First 100</b> bookings',
      stripCta: 'See discounted poojas',
      stripEndedCta: 'Browse all poojas',
      endedKicker: 'Launch offer complete',
      endedTitle: 'All 100 launch slots are claimed',
      endedSub: 'The 20% launch offer has ended. Every pooja continues at its regular all-inclusive price — verified pandit, samagri and GST included.',
      endedNote: 'Thank you — 100 families booked during the launch.',
      endedCta: 'Browse all poojas',
      save: 'save'
    },
    hi: {
      badge: '20% छूट',
      kicker: 'लॉन्च ऑफ़र · सिर्फ़ पहली 100 बुकिंग',
      titleTail: 'हर पूजा पर छूट',
      sub: 'कोई कोड नहीं, कोई मोल-भाव नहीं। लॉन्च छूट हर अनुष्ठान पर अपने आप लागू होती है — सामग्री, पंडित और जीएसटी पहले की तरह शामिल।',
      fact_auto: 'अपने आप लागू — कोई प्रोमो कोड नहीं',
      fact_poojas: 'सभी 100+ पूजा पैकेज',
      fact_live: 'असली बुकिंग काउंटर — कोई नकली जल्दबाज़ी नहीं',
      cta: 'पहली 100 में अपनी सीट बुक करें',
      altCta: 'छूट वाली पूजाएँ देखें',
      altEndedCta: 'पूरी पूजा सूची देखें',
      note: 'सामग्री की दुकान और ज्योतिष/वास्तु परामर्श इस ऑफ़र में शामिल नहीं हैं।',
      meterEyebrow: 'लॉन्च सीटें',
      slotsLeft: 'सीटें बचीं',
      limitLabel: 'बुकिंग सीमा',
      limitNote: 'पहली 100 कन्फ़र्म बुकिंग',
      claimedOf: '{limit} में से {used} बुक हो चुकी',
      claimedAll: 'सभी {limit} लॉन्च सीटें भर गईं',
      stripText: '<b>लॉन्च ऑफ़र:</b> पहली 100 बुकिंग पर हर पूजा में 20% छूट। अपने आप लागू — कोई कोड नहीं।',
      stripEnded: '<b>लॉन्च ऑफ़र समाप्त।</b> सभी 100 सीटें भर गईं — हर पूजा अब नियमित सर्व-समावेशी मूल्य पर है।',
      stripRemaining: '<b>{limit}</b> में से <b>{remaining}</b> लॉन्च सीटें बचीं',
      stripLimit: '<b>पहली 100</b> बुकिंग',
      stripCta: 'छूट वाली पूजाएँ देखें',
      stripEndedCta: 'सभी पूजाएँ देखें',
      endedKicker: 'लॉन्च ऑफ़र पूरा',
      endedTitle: 'सभी 100 लॉन्च सीटें भर गईं',
      endedSub: '20% लॉन्च ऑफ़र समाप्त हो गया है। हर पूजा अपने नियमित सर्व-समावेशी मूल्य पर जारी है — सत्यापित पंडित, सामग्री और जीएसटी शामिल।',
      endedNote: 'धन्यवाद — लॉन्च के दौरान 100 परिवारों ने बुक किया।',
      endedCta: 'सभी पूजाएँ देखें',
      save: 'बचत'
    }
  };

  function isHi() {
    return !!(root.App && root.App.isHi && root.App.isHi());
  }

  function copy(key, vars) {
    var table = TEXT[isHi() ? 'hi' : 'en'];
    var s = table[key] != null ? table[key] : (TEXT.en[key] || '');
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        s = s.split('{' + name + '}').join(String(vars[name]));
      });
    }
    return s;
  }

  function inr(n) {
    var value = Math.round(Number(n) || 0);
    if (root.App && root.App.INR) return root.App.INR(value);
    return '₹' + value.toLocaleString('en-IN');
  }

  /* ----------------------------------------------------------------- price */
  function price(listPrice) {
    var list = Math.max(0, Number(listPrice) || 0);
    if (!state.active) {
      return { list: list, price: list, discount: 0, percent: 0, active: false };
    }
    var now = Math.round(list * (100 - state.percent) / 100);
    return {
      list: list,
      price: now,
      discount: list - now,
      percent: state.percent,
      active: true
    };
  }

  function snapshot() {
    return {
      code: state.code,
      percent: state.percent,
      limit: state.limit,
      claimed: state.claimed,
      remaining: state.remaining,
      active: state.active,
      loaded: state.loaded,
      error: state.error
    };
  }

  function apply(data) {
    if (!data || typeof data !== 'object') return;
    var percent = Number(data.percent);
    var limit = Number(data.limit);
    var claimed = Number(data.claimed);
    var remaining = Number(data.remaining);
    if (percent > 0 && percent <= 100) state.percent = percent;
    if (limit > 0) state.limit = limit;
    if (isFinite(claimed) && claimed >= 0) state.claimed = claimed;
    if (isFinite(remaining) && remaining >= 0) state.remaining = remaining;
    else if (state.claimed != null) state.remaining = Math.max(0, state.limit - state.claimed);
    state.active = data.active != null
      ? Boolean(data.active)
      : (state.remaining == null ? true : state.remaining > 0);
    if (data.code) state.code = String(data.code);
    state.error = false;
  }

  function load() {
    var api = root.PanditAPI;
    if (!api || !api.enabled || typeof api.offer !== 'function') {
      state.loaded = true;
      state.error = true;
      render();
      return Promise.resolve(snapshot());
    }
    return api.offer().then(function (res) {
      if (res && res.ok && res.data) apply(res.data);
      else state.error = true;
      state.loaded = true;
      render();
      fire();
      return snapshot();
    }).catch(function () {
      state.loaded = true;
      state.error = true;
      render();
      return snapshot();
    });
  }

  function fire() {
    try {
      doc.dispatchEvent(new CustomEvent('vp:promo', { detail: snapshot() }));
    } catch (err) {
      var ev;
      try {
        ev = doc.createEvent('CustomEvent');
        ev.initCustomEvent('vp:promo', false, false, snapshot());
        doc.dispatchEvent(ev);
      } catch (ignored) { /* very old browser */ }
    }
  }

  /* ---------------------------------------------------------------- render */
  function setText(selector, value) {
    Array.prototype.forEach.call(doc.querySelectorAll(selector), function (el) {
      el.textContent = value;
    });
  }

  function setHtml(selector, value) {
    Array.prototype.forEach.call(doc.querySelectorAll(selector), function (el) {
      el.innerHTML = value;
    });
  }

  function counter() {
    if (state.claimed == null) {
      return {
        num: state.limit,
        label: copy('limitLabel'),
        note: copy('limitNote'),
        width: 0
      };
    }
    if (!state.active) {
      return {
        num: 0,
        label: copy('slotsLeft'),
        note: copy('claimedAll', { limit: state.limit }),
        width: 100
      };
    }
    return {
      num: state.remaining == null ? Math.max(0, state.limit - state.claimed) : state.remaining,
      label: copy('slotsLeft'),
      note: copy('claimedOf', { used: state.claimed, limit: state.limit }),
      width: Math.max(0, Math.min(100, Math.round(state.claimed / state.limit * 100)))
    };
  }

  function render() {
    if (!doc || !doc.querySelectorAll) return;
    var ended = !state.active;
    var box = counter();

    if (doc.documentElement) {
      doc.documentElement.classList.toggle('promo-off', ended);
      doc.documentElement.setAttribute('data-promo-active', ended ? '0' : '1');
    }

    Array.prototype.forEach.call(doc.querySelectorAll('.promo-teaser'), function (el) {
      el.classList.toggle('promo-teaser--ended', ended);
    });

    /* Headline + supporting copy */
    setHtml('[data-promo-kicker]',
      '<span class="promo-dot" aria-hidden="true"></span>' + copy(ended ? 'endedKicker' : 'kicker'));
    setHtml('[data-promo-title]', ended
      ? copy('endedTitle')
      : '<span class="promo-teaser__num">' + state.percent + '%</span> ' + copy('titleTail'));
    setText('[data-promo-sub]', copy(ended ? 'endedSub' : 'sub'));
    setText('[data-promo-note]', copy(ended ? 'endedNote' : 'note'));

    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-fact]'), function (el) {
      var key = el.getAttribute('data-promo-fact');
      el.textContent = copy('fact_' + key);
    });

    /* Buttons */
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-cta]'), function (el) {
      el.textContent = copy(ended ? 'endedCta' : 'cta');
      el.setAttribute('href', 'poojas.html');
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-strip-cta]'), function (el) {
      el.textContent = copy(ended ? 'stripEndedCta' : 'stripCta');
      el.setAttribute('href', ended ? 'poojas.html' : 'poojas.html#poojaGrid');
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-alt-cta]'), function (el) {
      el.textContent = copy(ended ? 'altEndedCta' : 'altCta');
    });

    /* Live counter */
    setText('[data-promo-meter-eyebrow]', copy('meterEyebrow'));
    setText('[data-promo-remaining]', String(box.num));
    setText('[data-promo-remaining-label]', box.label);
    setText('[data-promo-claimed]', box.note);
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-bar]'), function (el) {
      el.style.width = box.width + '%';
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-meter]'), function (el) {
      el.setAttribute('aria-label',
        ended ? copy('claimedAll', { limit: state.limit }) : (copy('slotsLeft') + ': ' + box.num));
    });

    /* Compact strips */
    setHtml('[data-promo-strip-text]', copy(ended ? 'stripEnded' : 'stripText'));
    Array.prototype.forEach.call(doc.querySelectorAll('[data-promo-strip-count]'), function (el) {
      if (state.claimed == null) el.innerHTML = copy('stripLimit');
      else if (ended) el.innerHTML = copy('claimedAll', { limit: state.limit });
      else el.innerHTML = copy('stripRemaining', { remaining: box.num, limit: state.limit });
    });

    /* Badges rendered inside cards and the booking summary */
    setText('[data-promo-badge]', copy('badge'));
    setText('[data-promo-save]', copy('save'));
  }

  /* ------------------------------------------------------------ public API */
  root.VPPromo = {
    price: price,
    quote: price,
    status: snapshot,
    load: load,
    render: render,
    isActive: function () { return state.active; },
    percent: function () { return state.percent; },
    copy: copy,
    inr: inr,
    badge: function () {
      return '<span class="promo-badge" data-promo-badge>' + copy('badge') + '</span>';
    },
    strike: function (list) {
      return '<s class="promo-strike">' + inr(list) + '</s>';
    }
  };

  /* ------------------------------------------------------------------ init */
  function init() {
    if (root.App && root.App.onLang) root.App.onLang(render);
    render();
    load();

    // The counter is cheap and live: refresh on focus and every minute so a
    // long-lived tab never shows a stale "slots left".
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden) load();
    });
    root.setInterval(load, 60000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
