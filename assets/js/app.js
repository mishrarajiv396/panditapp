/* ==========================================================================
   Vedic Pooja — shared app shell: header, footer, icons, cart, toasts, modals
   ========================================================================== */
(function (root) {
  'use strict';
  var V = root.Vedic;
  var D = root.PanditData;
  var S = root.SITE_SETTINGS || {};
  var OWNER = S.owner || {};
  var OWNER_PHONE = String(OWNER.phone || '918889685370').replace(/[^\d]/g, '');
  var OWNER_PHONE_DISPLAY = OWNER.phoneDisplay || '+91 88896 85370';
  var OWNER_TEL = 'tel:+' + OWNER_PHONE;
  var OWNER_WA = 'https://wa.me/' + OWNER_PHONE;
  var OWNER_EMAIL = OWNER.email || 'rajivlochanmishra952@gmail.com';
  var OWNER_UPI = OWNER.upi || 'rajivlochanmishra952-1@okhdfcbank';
  var OWNER_NAME = OWNER.name || 'Rajiv Lochan Mishra';
  var OWNER_UPI_NAME = OWNER.upiName || OWNER_NAME;

  // Values that older pages may still contain in their HTML. syncOwner()
  // rewrites them from SITE_SETTINGS, so changing site-settings.js is enough.
  var LEGACY = {
    phones: [/\+91[\s-]*88896[\s-]*85370/g, /(?:\+?91)?[\s-]*88896[\s-]*85370/g, /918889685370/g],
    email: /rajivlochanmishra952@gmail\.com/gi,
    upi: /rajivlochanmishra952-1@okhdfcbank/gi
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var INR = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ------------------------------------------------------------ city helpers
     The city database is country-wide, so every select is grouped by state
     and searchable. Coordinates and the live UTC offset always come from the
     same record the astronomy engine uses. */
  function findCity(name) {
    var list = (D && D.CITIES) || [];
    return list.filter(function (c) { return c.name === name; })[0] || list[0] || null;
  }

  function cityOffset(city, when) {
    var tz = city && city.tz;
    if (tz == null) return 5.5;
    if (typeof tz === 'number') return tz;
    try { return V.offsetAt((when || new Date()).getTime(), tz); } catch (e) { return 5.5; }
  }

  function utcOffsetLabel(off) {
    var totalMinutes = Math.round(off * 60);
    var sign = totalMinutes < 0 ? '−' : '+';
    var abs = Math.abs(totalMinutes);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    return 'UTC' + sign + pad(h) + ':' + pad(m);
  }

  function cityMeta(city, when) {
    if (!city) return '';
    var lat = Math.abs(Number(city.lat)).toFixed(2) + '° ' + (Number(city.lat) >= 0 ? 'N' : 'S');
    var lon = Math.abs(Number(city.lon)).toFixed(2) + '° ' + (Number(city.lon) >= 0 ? 'E' : 'W');
    return lat + ' · ' + lon + ' · ' + utcOffsetLabel(cityOffset(city, when));
  }

  /* City and state names live in the English data file, so render them through
     the phrase dictionary when Hindi is active. The English name remains the
     option value and the storage key. */
  function placeName(name) {
    var s = typeof name === 'string' ? name : (name && name.name) || '';
    if (!s || langState.lang !== 'hi') return s;
    return translateString(s);
  }

  function place(city) {
    if (!city) return '';
    if (typeof city === 'string') return placeName(city);
    return [placeName(city.name), placeName(city.state)].filter(Boolean).join(', ');
  }

  function cityOption(city, selected) {
    var star = city.famous ? ' ★' : '';
    return '<option value="' + esc(city.name) + '"' + (city.name === selected ? ' selected' : '') + '>' + esc(placeName(city.name)) + star + '</option>';
  }

  function cityCount() {
    return (D && D.CITIES && D.CITIES.length) || 0;
  }

  function applyCityCopy() {
    var n = cityCount();
    if (!n) return;
    var hi = langState.lang === 'hi';
    var label = n.toLocaleString('en-IN');
    $$('[data-city-count]').forEach(function (el) { el.textContent = label; });
    $$('input[type="search"][id$="CitySearch"]').forEach(function (inp) {
      inp.placeholder = hi
        ? label + ' शहर, ज़िले और प्रसिद्ध स्थान खोजें…'
        : 'Search ' + label + ' cities, districts & places…';
    });
  }

  function cityOptions(selected, query) {
    var all = (D && D.CITIES) || [];
    var q = String(query == null ? '' : query).trim().toLowerCase();
    var list = q ? all.filter(function (c) {
      var hay = (c.name + ' ' + c.state + (c.famous ? ' famous place tirth' : '') + (c.district ? ' district' : '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    }) : all.slice();

    // Keep the current city selectable even while the search text changes.
    var current = all.filter(function (c) { return c.name === selected; })[0];
    if (current && list.indexOf(current) < 0) list = [current].concat(list);
    if (!list.length) {
      return '<option value="" disabled selected>' +
        (langState.lang === 'hi'
          ? '“' + esc(query) + '” से कोई शहर नहीं मिला'
          : 'No city matches “' + esc(query) + '”') +
        '</option>';
    }

    var groups = [], byState = {};
    list.forEach(function (c) {
      if (!byState[c.state]) {
        byState[c.state] = { state: c.state, cities: [] };
        groups.push(byState[c.state]);
      }
      byState[c.state].cities.push(c);
    });

    return groups.map(function (g) {
      return '<optgroup label="' + esc(placeName(g.state)) + '">' +
        g.cities.map(function (c) { return cityOption(c, selected); }).join('') +
        '</optgroup>';
    }).join('');
  }

  /* ------------------------------------------------------------------ language
     English is the base language in the markup and in the astronomical engine.
     Every visible English phrase is looked up in window.VP_PHRASES and replaced
     in place. Data-driven renderers (kundli, matching, panchang, chart) register
     a callback with App.onLang() and redraw themselves in the chosen language. */
  var PHRASES = root.VP_PHRASES || {};
  var PHRASE_INDEX = {};
  var ASTR = root.VPAstroHi || null;
  var langState = { lang: 'en', callbacks: [] };
  var APPLYING = false;
  var textOriginal = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var attrOriginal = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'label'];

  function normText(s) {
    return String(s == null ? '' : s)
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014\u2212]/g, '-')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  Object.keys(PHRASES).forEach(function (k) { PHRASE_INDEX[normText(k)] = PHRASES[k]; });

  var GREG_MONTHS = {
    Jan: 'जनवरी', Feb: 'फ़रवरी', Mar: 'मार्च', Apr: 'अप्रैल', May: 'मई', Jun: 'जून',
    Jul: 'जुलाई', Aug: 'अगस्त', Sep: 'सितंबर', Oct: 'अक्टूबर', Nov: 'नवंबर', Dec: 'दिसंबर',
    January: 'जनवरी', February: 'फ़रवरी', March: 'मार्च', April: 'अप्रैल', June: 'जून',
    July: 'जुलाई', August: 'अगस्त', September: 'सितंबर', October: 'अक्टूबर',
    November: 'नवंबर', December: 'दिसंबर'
  };
  var COUNT_NOUN = {
    rituals: 'अनुष्ठान', ritual: 'अनुष्ठान', poojas: 'पूजाएँ', pooja: 'पूजा',
    pandits: 'पंडित', pandit: 'पंडित', places: 'स्थान', place: 'स्थान',
    products: 'उत्पाद', product: 'उत्पाद', cities: 'शहर', city: 'शहर',
    festivals: 'त्योहार', festival: 'त्योहार', reviews: 'समीक्षाएँ', review: 'समीक्षा',
    bookings: 'बुकिंग', booking: 'बुकिंग', items: 'आइटम', item: 'आइटम',
    results: 'परिणाम', result: 'परिणाम', days: 'दिन', day: 'दिन',
    points: 'अंक', point: 'अंक', ahutis: 'आहुतियाँ', ahuti: 'आहुति',
    pandits: 'पंडित', hours: 'घंटे', hour: 'घंटा', minutes: 'मिनट', minute: 'मिनट'
  };

  function astro(cat, key) {
    if (ASTR && ASTR.get) return ASTR.get(cat, key);
    return key;
  }

  function patternHi(s) {
    var m;
    if ((m = /^(\d+)\s+of\s+(\d+)$/.exec(s))) return m[2] + ' में से ' + m[1];
    if ((m = /^(\d+)\s+of\s+(\d+)\s+offered$/i.exec(s))) return m[2] + ' में से ' + m[1] + ' उपलब्ध';
    if ((m = /^(\d+)\s+of\s+(\d+)\s+complete$/i.exec(s))) return m[2] + ' में से ' + m[1] + ' पूर्ण';
    if ((m = /^\((\d+)\s+reviews?\)$/i.exec(s))) return '(' + m[1] + ' समीक्षाएँ)';
    if ((m = /^(\d+)\s+stars?$/i.exec(s))) return m[1] + ' सितारे';
    if ((m = /^(\d+)\s+star reviews?:\s*(\d+)$/i.exec(s))) return m[1] + ' स्टार समीक्षाएँ: ' + m[2];
    if ((m = /^(\d+)\s+(rituals?|poojas?|pandits?|places?|products?|cities?|festivals?|reviews?|bookings?|items?|results?|days?|hours?|minutes?|points?|ahutis?)$/i.exec(s))) {
      return m[1] + ' ' + (COUNT_NOUN[m[2].toLowerCase()] || m[2]);
    }
    if ((m = /^(\d+)\s+(min|mins|minutes?)\s+read$/i.exec(s))) return m[1] + ' मिनट पढ़ें';
    if ((m = /^Page\s+(\d+)\s+of\s+(\d+)$/i.exec(s))) return 'पृष्ठ ' + m[1] + ' / ' + m[2];
    if ((m = /^(.+?)\s+Nakshatra\s*·\s*(.+)$/.exec(s))) {
      return astro('nakshatra', m[1]) + ' नक्षत्र · ' + translateString(m[2], true);
    }
    if ((m = /^(.+?)\s+Nakshatra$/i.exec(s))) return astro('nakshatra', m[1]) + ' नक्षत्र';
    if ((m = /^(.+?)\s*·\s*pada\s+(\d+)\s+of\s+4$/i.exec(s))) {
      return astro('nakshatra', m[1]) + ' · पाद ' + m[2] + '/4';
    }
    if ((m = /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3];
    }
    if ((m = /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3] + ', ' + m[4] + ':' + m[5] + ' ' + (/^am$/i.test(m[6]) ? 'पूर्वाह्न' : 'अपराह्न');
    }
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3] + ', ' + m[4] + ':' + m[5] + ' ' + (/^am$/i.test(m[6]) ? 'पूर्वाह्न' : 'अपराह्न');
    }
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3];
    }
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]];
    }
    if ((m = /^(\d+(?:\.\d+)?)\s*(hr|hrs|hours?)$/i.exec(s))) return m[1] + ' घंटे';
    if ((m = /^(\d+)\s*(min|mins|minutes?)$/i.exec(s))) return m[1] + ' मिनट';
    if ((m = /^(\d+)\s*(hr|hrs|hours?)\s+(\d+)\s*(min|mins|minutes?)$/i.exec(s))) return m[1] + ' घंटे ' + m[3] + ' मिनट';
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*·\s*(.+)$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' · ' + astro('month', m[3]);
    }
    if ((m = /^Open samagri cart,\s*(\d+)\s+items?$/i.exec(s))) return 'सामग्री कार्ट खोलें, ' + m[1] + ' आइटम';
    if ((m = /^(\d+)\s+(days?|hours?|minutes?)\s+ago$/i.exec(s))) return m[1] + ' ' + COUNT_NOUN[m[2].toLowerCase()] + ' पहले';
    return null;
  }

  function translateString(s, skipPattern) {
    if (!s) return s;
    var exact = PHRASES[s];
    if (exact != null) return exact;
    var key = normText(s);
    if (PHRASE_INDEX[key] != null) return PHRASE_INDEX[key];
    if (!skipPattern) {
      var p = patternHi(key);
      if (p != null) return p;
    }
    return s;
  }

  function skipI18n(node) {
    var el = node && node.nodeType === 1 ? node : (node && node.parentNode);
    while (el && el !== document.body) {
      if (el.id === 'pjMain') return true;
      if (el.getAttribute && (el.getAttribute('data-no-i18n') != null || el.getAttribute('translate') === 'no')) return true;
      if (/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(el.nodeName)) return true;
      el = el.parentNode;
    }
    return false;
  }

  function translateTextNode(node) {
    if (!node || node.nodeType !== 3 || skipI18n(node)) return;
    var raw = textOriginal ? textOriginal.get(node) : node.__vpEn;
    if (raw == null) {
      raw = node.nodeValue;
      if (textOriginal) textOriginal.set(node, raw); else node.__vpEn = raw;
    }
    if (!raw || !/[A-Za-z]/.test(raw)) return;
    var target = raw;
    if (langState.lang === 'hi') {
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
      var lead = m[1], core = m[2], trail = m[3];
      if (core) {
        var out = translateString(core);
        if (out !== core) target = lead + out + trail;
      }
    }
    if (node.nodeValue !== target) {
      APPLYING = true;
      node.nodeValue = target;
      APPLYING = false;
    }
  }

  function translateAttrs(el) {
    if (!el || el.nodeType !== 1 || skipI18n(el)) return;
    var names = ATTRS.slice();
    if (el.nodeName === 'INPUT' && /^(submit|button|reset)$/i.test(el.type || '')) names.push('value');
    var store = attrOriginal ? attrOriginal.get(el) : el.__vpAttrs;
    if (!store) { store = {}; if (attrOriginal) attrOriginal.set(el, store); else el.__vpAttrs = store; }
    names.forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      if (store[name] == null) store[name] = el.getAttribute(name);
      var raw = store[name];
      if (!raw || !/[A-Za-z]/.test(raw)) return;
      var target = langState.lang === 'hi' ? translateString(raw) : raw;
      if (el.getAttribute(name) !== target) el.setAttribute(name, target);
    });
  }

  function translateDom(rootNode) {
    var root = rootNode || document.body;
    if (!root) return;
    if (root.nodeType === 3) { translateTextNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1 && skipI18n(root)) return;
    translateAttrs(root);
    if (!document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
    var batch = [];
    while (walker.nextNode()) batch.push(walker.currentNode);
    batch.forEach(function (n) {
      if (n.nodeType === 3) translateTextNode(n); else translateAttrs(n);
    });
  }

  function fireLang(lang) {
    langState.callbacks.slice().forEach(function (fn) {
      try { fn(lang); } catch (e) { /* keep the page usable */ }
    });
  }

  function setLang(lang) {
    var next = lang === 'hi' ? 'hi' : 'en';
    langState.lang = next;
    try { localStorage.setItem('vp_lang', next); } catch (e) { /* private mode */ }
    document.documentElement.lang = next;
    document.documentElement.setAttribute('data-lang', next);
    var btn = $('#langToggle');
    if (btn) {
      btn.textContent = next === 'hi' ? 'ENG' : 'हिंदी';
      btn.setAttribute('aria-label', next === 'hi' ? 'Switch language to English' : 'Switch language to Hindi');
      btn.dataset.lang = next;
    }
    translateDom(document.body);
    var ticker = $('#tickerText');
    if (ticker) ticker.textContent = topbarText();
    fireLang(next);
    if (next === 'hi') translateDom(document.body);
  }

  function getLang() {
    try {
      var saved = localStorage.getItem('vp_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function t(en, hi) {
    if (langState.lang !== 'hi') return en;
    if (hi != null) return hi;
    return translateString(en);
  }

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ }
    }
  };

  /* ------------------------------------------------------------------ icons */
  var P = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    cart: '<circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L22 7H6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    star: '<path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9L12 3Z"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    shield: '<path d="M12 22s8-3.5 8-9.5V5l-8-3-8 3v7.5C4 18.5 12 22 12 22Z"/><path d="m9 12 2 2 4-4"/>',
    box: '<path d="M21 8.5v7L12 21 3 15.5v-7L12 2l9 6.5Z"/><path d="M3 8.5 12 15l9-6.5M12 15v6"/>',
    gate: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20M15 12h.01"/>',
    fire: '<path d="M12 22c4 0 7-2.8 7-6.5 0-2.6-1.3-4.7-3.2-6.6-.4 1.7-1.3 2.8-2.3 3.4C13 8.6 11 5.4 8.2 2c0 3.5-1.4 5.3-3 7.3A8.2 8.2 0 0 0 5 15.5C5 19.2 8 22 12 22Z"/>',
    rupee: '<path d="M6 3h12M6 8h12M15 21 6 12h3a5 5 0 0 0 0-10"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-7 7-10 16-10 0 9-4 15-9 17Z"/><path d="M4 21c2-6 6-9 12-11"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18-3-4-3-14.5 0-18Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
    spark: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>',
    heart: '<path d="M12 21S3 15 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 15 12 21 12 21Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    wa: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 21l1.9-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.5 8.5c.2 3 2 4.8 5 5.2 1 .1 1.5-.4 1.6-1.2l-2-.9-.8.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.8-.9-2c-.8.1-1.4.6-1.6 1.6Z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    truck: '<path d="M3 6h11v11H3zM14 9h4l3 3v5h-7"/><circle cx="7" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/>',
    gift: '<path d="M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9C9 9 7 7.5 7 5.5S8 3 9.5 3 12 5 12 9ZM12 9c3 0 5-1.5 5-3.5S16 3 14.5 3 12 5 12 9Z"/>',
    play: '<path d="M8 5v14l11-7Z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    temple: '<path d="M12 2 4 8h16L12 2ZM6 8v10M18 8v10M10 8v10M14 8v10M3 21h18M5 18h14"/>',
    om: '<path d="M7 9.5a3 3 0 1 1 4.2 2.7c-1.7.7-2.4 1.8-1.6 3.1.8 1.3 2.7 1.2 3.7-.1"/><path d="M14.5 7c2.4 0 4 1.6 4 3.6 0 1.5-.8 2.4-2 3.2"/><circle cx="17.6" cy="16.8" r=".9"/><path d="M9 17c.6 1.5 2 2.5 3.8 2.5"/>',
    star: '<path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9L12 3Z"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.spark) + '</svg>';
  }
  function starIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9L12 3Z"/></svg>';
  }
  function stars(n) {
    var score = Math.max(0, Math.min(5, Number(n) || 0));
    var out = '<span class="stars" role="img" aria-label="' + score + ' out of 5">';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="' + (i <= Math.round(score) ? '' : 'is-empty') + '">' + starIcon() + '</span>';
    }
    return out + '</span>';
  }

  /* ------------------------------------------------------------------- logo */
  var LOGO = '<svg class="brand__mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="22.2" stroke="#c9a227" stroke-width="1.1" opacity=".55"/>' +
    '<circle cx="24" cy="24" r="18" stroke="#c9a227" stroke-width=".7" opacity=".3" stroke-dasharray="2 3"/>' +
    '<path d="M24 8.5c2.6 3.5 2.6 7 0 9.6-2.6-2.6-2.6-6.1 0-9.6Z" fill="#e08a2e"/>' +
    '<path d="M24 10.6c1.3 2.1 1.3 4.2 0 5.8-1.3-1.6-1.3-3.7 0-5.8Z" fill="#f6c56b"/>' +
    '<path d="M13.5 23.5h21c.4 6-4.3 11-10.5 11s-10.9-5-10.5-11Z" fill="#6d1f2c"/>' +
    '<path d="M11 23.5h26" stroke="#c9a227" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M18.5 27.2c4.5 1.8 6.5 1.8 11 0" stroke="#e8d3a0" stroke-width=".9" opacity=".7"/>' +
    '<circle cx="24" cy="39.5" r="1.3" fill="#c9a227"/>' +
    '</svg>';

  /* ----------------------------------------------------------------- header */
  /* Eight primary links plus a "More" menu keep the bar inside its 1180px
     container. Everything else (home, about, puja guide, rashifal, cities,
     matching, reviews, policies) lives in that menu on desktop and in the
     expanded mobile list. */
  var NAV = [
    ['poojas.html', 'Poojas'],
    ['services.html', 'Services'],
    ['pandits.html', 'Pandits'],
    ['kundli.html', 'Kundli'],
    ['panchang.html', 'Panchang'],
    ['muhurat.html', 'Muhurat'],
    ['calendar.html', 'Calendar'],
    ['shop.html', 'Samagri']
  ];

  /* Desktop "More" menu and mobile menu extras. */
  var NAV_EXTRA = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['puja-guide.html', 'Puja Guide'],
    ['mantra.html', 'Mantra Library'],
    ['horoscope.html', 'Rashifal'],
    ['cities.html', 'Cities'],
    ['matching.html', 'Matching'],
    ['reviews.html', 'Reviews'],
    ['policies.html', 'Policies & support']
  ];

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function topbarText() {
    var hi = langState.lang === 'hi';
    if (!V) return hi ? 'दैनिक पंचांग, सत्यापित पंडित और पूजा-इन-ए-बॉक्स' : 'Daily panchang, verified pandits & pooja-in-a-box';
    try {
      var saved = store.get('vp_city', null);
      var place = (D && D.CITIES && (D.CITIES.filter(function (c) { return c.name === saved; })[0] || D.CITIES[0])) || { name: 'Gurugram', tz: 'Asia/Kolkata' };
      var pc = V.panchangForDate(new Date(), place);
      if (hi) {
        return 'आज · ' + astro('paksha', pc.tithi.paksha) + ' ' + astro('tithi', pc.tithi.name) + ' · ' +
          astro('nakshatra', pc.nakshatra.name) + ' नक्षत्र · राहु काल ' +
          V.fmtTime(pc.rahu.start, place.tz) + ' – ' + V.fmtTime(pc.rahu.end, place.tz);
      }
      return 'Today · ' + pc.tithi.paksha + ' ' + pc.tithi.name + ' · ' + pc.nakshatra.name + ' Nakshatra · Rahu Kaal ' +
        V.fmtTime(pc.rahu.start, place.tz) + ' – ' + V.fmtTime(pc.rahu.end, place.tz);
    } catch (e) {
      return hi ? 'दैनिक पंचांग, सत्यापित पंडित और पूजा-इन-ए-बॉक्स' : 'Daily panchang, verified pandits & pooja-in-a-box';
    }
  }

  /* ------------------------------------------------------- live owner details
     One source of truth: SITE_SETTINGS.owner. Every visible number, email,
     UPI ID and every tel:/wa.me/mailto: link is rewritten in place, including
     markup that is injected later by other scripts. */
  function rewriteText(value) {
    if (!value) return value;
    LEGACY.phones.forEach(function (re) { value = value.replace(re, OWNER_PHONE_DISPLAY); });
    return value
      .replace(LEGACY.email, OWNER_EMAIL)
      .replace(LEGACY.upi, OWNER_UPI);
  }

  function syncOwner(rootNode) {
    var rootEl = rootNode && rootNode.nodeType === 1 ? rootNode : document.body;
    if (!rootEl) return;

    // Links — keep any ?text= / ?subject= query string intact.
    Array.prototype.forEach.call(rootEl.querySelectorAll('a[href]'), function (a) {
      var href = a.getAttribute('href') || '';
      var next = href;
      if (/^tel:/i.test(href)) next = OWNER_TEL;
      else if (/^mailto:/i.test(href)) next = href.replace(/^mailto:[^?]*/i, 'mailto:' + OWNER_EMAIL);
      else if (/^https?:\/\/wa\.me\/\d+/i.test(href)) next = href.replace(/^https?:\/\/wa\.me\/\d+/i, OWNER_WA);
      else if (/^upi:\/\/pay\?/i.test(href)) {
        next = href.replace(/([?&]pa=)[^&]*/i, '$1' + OWNER_UPI)
          .replace(/([?&]pn=)[^&]*/i, '$1' + encodeURIComponent(OWNER_UPI_NAME));
      }
      if (next !== href) a.setAttribute('href', next);
    });

    // Explicit hooks for markup that wants the value in a specific place.
    var setText = function (nodes, value) {
      Array.prototype.forEach.call(nodes, function (el) {
        if (el.textContent !== value) el.textContent = value;
      });
    };
    setText(rootEl.querySelectorAll('[data-owner-name]'), OWNER_NAME);
    setText(rootEl.querySelectorAll('[data-owner-phone]'), OWNER_PHONE_DISPLAY);
    setText(rootEl.querySelectorAll('[data-owner-email]'), OWNER_EMAIL);
    setText(rootEl.querySelectorAll('[data-owner-upi]'), OWNER_UPI);
    setText(rootEl.querySelectorAll('[data-owner-city]'),
      [OWNER.city || 'Gurugram', OWNER.region || 'Haryana'].filter(Boolean).join(', '));

    // Visible legacy text and placeholders/attributes.
    var walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/i.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var nextText = rewriteText(node.nodeValue);
      if (nextText !== node.nodeValue) node.nodeValue = nextText;
    }

    Array.prototype.forEach.call(rootEl.querySelectorAll('[placeholder], [title], [aria-label], [alt]'), function (el) {
      ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v == null) return;
        var out = rewriteText(String(v));
        if (out !== v) el.setAttribute(attr, out);
      });
    });
  }

  function initLiveUpdates() {
    syncOwner();

    // Content rendered after load (cart, modals, puja panels) is synced too.
    if ('MutationObserver' in window && document.body) {
      var scheduled = false;
      var run = function () {
        if (scheduled) return;
        scheduled = true;
        var go = function () { scheduled = false; syncOwner(); };
        if (window.requestAnimationFrame) requestAnimationFrame(go); else setTimeout(go, 0);
      };
      new MutationObserver(run).observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    // Ticker and copyright stay correct while the tab is left open.
    var tick = function () {
      var t = $('#tickerText');
      if (t) t.textContent = topbarText();
      var y = $('#year');
      if (y) y.textContent = new Date().getFullYear();
    };
    setInterval(tick, 60000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      tick();
      syncOwner();
    });
    window.addEventListener('pageshow', function () { tick(); syncOwner(); });
  }

  function injectHeader() {
    if ($('#siteHead')) return;
    var page = currentPage();
    function isActive(href) { return href === page || (page === '' && href === 'index.html'); }
    function extraClass(n) { return (n[0] === page || (page === '' && n[0] === 'index.html')) ? ' active' : ''; }
    function activeAttrs(n) {
      return isActive(n[0]) ? ' class="active" aria-current="page"' : '';
    }
    var links = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + activeAttrs(n) + '>' + n[1] + '</a>';
    }).join('');
    var moreMenu = NAV_EXTRA.map(function (n) {
      return '<a href="' + n[0] + '"' + activeAttrs(n) + '>' + n[1] + '</a>';
    }).join('');
    var moreActive = NAV_EXTRA.some(function (n) { return isActive(n[0]); });
    var mobileExtras = NAV_EXTRA.map(function (n) {
      var extra = extraClass(n);
      return '<a class="nav__extra' + extra + '"' + (extra ? ' aria-current="page"' : '') +
        ' href="' + n[0] + '">' + n[1] + '</a>';
    }).join('');
    links +=
      '<div class="nav__more-wrap">' +
      '<button type="button" class="nav__more-btn' + (moreActive ? ' is-active' : '') + '" id="navMoreBtn" aria-expanded="false" aria-controls="navMoreMenu">More<span class="nav__caret" aria-hidden="true"></span></button>' +
      '<div class="nav__more-menu" id="navMoreMenu" hidden>' + moreMenu + '</div>' +
      '</div>' +
      '<span class="nav__more" aria-hidden="true">More</span>' + mobileExtras;
    var html =
      '<div class="topbar"><div class="container topbar__in">' +
      '<div class="topbar__ticker"><span class="dot"></span><span id="tickerText">' + esc(topbarText()) + '</span></div>' +
      '<div class="topbar__links">' +
      '<a href="' + OWNER_TEL + '">' + icon('phone') + OWNER_PHONE_DISPLAY + '</a><span class="sep"></span>' +
      '<a href="puja-guide.html">Free puja guide</a><span class="sep"></span>' +
      '<a href="puja-guide.html#seva">Seva &amp; dakshina</a><span class="sep"></span>' +
      '<a href="#bookings">Track booking</a></div></div></div>' +
      '<header class="site-head" id="siteHead"><div class="container head-in">' +
      '<a class="brand" href="index.html" aria-label="Vedic Pooja home">' + LOGO +
      '<span class="brand__text"><strong>Vedic Pooja</strong><small>Gurugram · NCR · Bharat</small></span></a>' +
      '<nav class="nav" id="mainNav" aria-label="Main">' + links + '</nav>' +
      '<div class="head-actions">' +
      '<button type="button" class="head-search" id="globalSearchOpen" data-gs-open aria-label="Search the website" aria-haspopup="dialog" aria-expanded="false" title="Search (Ctrl K)">' +
      '<span class="head-search__icon">' + icon('search') + '</span>' +
      '<span class="head-search__text">Search anything…</span>' +
      '</button>' +
      '<button type="button" class="lang-switch" id="langToggle" aria-label="Switch language">हिंदी</button>' +
      '<button class="icon-btn" id="cartOpen" aria-label="Open samagri cart, 0 items">' + icon('cart') + '<span class="cart-count" id="cartCount" aria-hidden="true">0</span></button>' +
      '<a class="icon-btn icon-btn--account" id="accountLink" href="account.html" aria-label="My account">' + icon('user') + '<span class="account-dot" id="accountDot" aria-hidden="true" hidden></span></a>' +
      '<button class="icon-btn" id="bookingsOpen" aria-label="My bookings">' + icon('calendar') + '</button>' +
      '<button class="icon-btn icon-btn--facilities" id="quickMenuOpen" aria-label="All facilities and tools" aria-haspopup="dialog" aria-expanded="false">' + icon('grid') + '</button>' +
      '<a class="btn btn--primary btn--sm" href="poojas.html" data-i18n="homeBook">Book a pooja</a>' +
      '<button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>' +
      '</div></div></header>';
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  /* Keep the keyboard skip link as the first tab stop even though the shell
     (and the demo notice) are injected into an already-parsed body. */
  function placeSkipLink() {
    var skip = document.querySelector('.skip-link');
    if (skip && skip.parentNode === document.body && document.body.firstChild !== skip) {
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }

  function initAccountLink() {
    var link = $('#accountLink');
    if (!link) return;
    var token = '';
    var person = null;
    try {
      var ls = root.localStorage;
      var ss = root.sessionStorage;
      // "Keep me signed in" stores the token in localStorage, an ordinary
      // session stores it in sessionStorage. The header must honour both.
      token = (ls && ls.getItem('vp_user_token')) || (ss && ss.getItem('vp_user_token')) || '';
      var raw = (ls && ls.getItem('vp_user')) || (ss && ss.getItem('vp_user')) || '';
      person = raw ? JSON.parse(raw) : null;
    } catch (err) { /* private mode */ }

    var signedIn = Boolean(token);
    var dot = $('#accountDot');
    if (dot) dot.hidden = !signedIn;
    link.classList.toggle('is-user', signedIn);
    var first = person && person.name ? String(person.name).trim().split(/\s+/)[0] : '';
    link.setAttribute('aria-label', signedIn ? 'My account' + (first ? ' — ' + first : '') : 'Sign in or create an account');
    link.setAttribute('title', signedIn ? 'My account' : 'Sign in');

    if (!signedIn) {
      link.setAttribute('href', 'login.html?next=' + encodeURIComponent('account.html'));
    } else {
      link.setAttribute('href', 'account.html');
    }
  }

  function injectFooter() {
    if ($('#siteFooter')) return;
    var cols = [
      ['Rituals', [['Satyanarayan Katha', 'poojas.html?q=satyanarayan'], ['Griha Pravesh', 'poojas.html?q=griha'], ['Rudrabhishek', 'poojas.html?q=rudra'], ['Navgrah Shanti', 'poojas.html?q=navgrah'], ['All poojas', 'poojas.html']]],
      ['Tools', [['Daily wisdom', 'index.html#daily-wisdom'], ['Satyanarayan puja guide', 'puja-guide.html'], ['Mantra & aarti library', 'mantra.html'], ['Kundli generator', 'kundli.html'], ['Today’s panchang', 'panchang.html'], ['Muhurat Studio', 'muhurat.html'], ['Festival calendar', 'calendar.html'], ['Daily rashifal', 'horoscope.html'], ['City directory', 'cities.html'], ['Kundli matching', 'matching.html'], ['Samagri shop', 'shop.html']]],
      ['Company', [['Services', 'services.html'], ['Astrology', 'services.html#astrology'], ['Vastu Shastra', 'services.html#vastu'], ['Numerology', 'services.html#numerology'], ['Pooja Paath', 'services.html#pooja-paath'], ['About us', 'about.html'], ['Our pandits', 'pandits.html'], ['Reviews', 'reviews.html'], ['Punya-Flow recycling', 'about.html#punyaflow'], ['Corporate poojas', 'about.html#corporate'], ['Contact', 'about.html#contact'], ['Policies', 'policies.html']]]
    ];
    var html =
      '<footer class="site-foot" id="siteFooter"><div class="container">' +
      '<div class="foot-top">' +
      '<div><a class="brand" href="index.html">' + LOGO + '<span class="brand__text"><strong>Vedic Pooja</strong><small>Gurugram · NCR · Bharat</small></span></a>' +
      '<p class="mt-2">End-to-end Vedic rituals with background-verified pandits, pooja-in-a-box samagri, live panchang and respectful waste recycling. Rooted in tradition, engineered for modern homes.</p>' +
      '<div class="foot-badges"><span>UPI · Cards · Netbanking</span><span>GST invoices</span><span>ISO-grade samagri</span></div></div>' +
      cols.map(function (c) {
        return '<div class="foot-col"><h3>' + c[0] + '</h3><ul>' + c[1].map(function (l) { return '<li><a href="' + l[1] + '">' + l[0] + '</a></li>'; }).join('') + '</ul></div>';
      }).join('') +
      '<div class="foot-col"><h3>Puja support</h3><p>Questions about the vidhi, samagri or a step? Call or message the owner directly.</p>' +
      '<p class="tiny foot-contact mt-2"><a href="' + OWNER_TEL + '">' + OWNER_PHONE_DISPLAY + '</a><br><a href="mailto:' + esc(OWNER_EMAIL) + '">' + esc(OWNER_EMAIL) + '</a></p>' +
      '<p class="tiny mt-2"><a class="link-arrow" href="puja-guide.html#seva">Seva &amp; UPI details</a></p></div>' +
      '</div>' +
      '<div class="foot-bottom"><span>© <span id="year">2026</span> Rajiv Lochan Mishra. All rights reserved.</span>' +
      '<span><a href="about.html#faq">FAQ</a> · <a href="policies.html#privacy">Privacy</a> · <a href="policies.html#booking">Terms</a> · <a href="about.html#contact">Support</a></span>' +
      '<span>Made with devotion in Gurugram 🪔</span></div>' +
      '</div></footer>';
    document.body.insertAdjacentHTML('beforeend', html);
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------- demo-content notice
     The marketplace pages (pandit profiles, ratings, prices, checkout) are
     illustrative until pandit verification and live payments are complete.
     The free puja guide and the owner's Seva details are real, so the notice
     links there instead of pretending the whole site is a demo. */
  var DEMO_PAGES = ['index.html', 'poojas.html', 'pandits.html', 'booking.html', 'shop.html', 'about.html'];

  function injectDemoNotice() {
    if (DEMO_PAGES.indexOf(currentPage()) < 0) return;
    if (store.get('vp_demo_notice_hidden', false)) return;
    if ($('#demoNotice')) return;
    var html = '<div class="demo-notice" id="demoNotice" role="note">' +
      '<div class="container demo-notice__in">' +
      '<span class="demo-notice__tag">Pre-launch</span>' +
      '<p><b>Demo content.</b> Pandit profiles, ratings, prices and checkout on this page are illustrative — pandit verification and live payments are still pending. The free Satyanarayan guide and the Seva/UPI details are real.</p>' +
      '<a class="demo-notice__link" href="puja-guide.html">Open the free guide</a>' +
      '<button type="button" class="demo-notice__close" id="demoNoticeClose" aria-label="Dismiss notice">' + icon('close') + '</button>' +
      '</div></div>';
    document.body.insertAdjacentHTML('afterbegin', html);
    var close = $('#demoNoticeClose');
    if (close) {
      close.addEventListener('click', function () {
        store.set('vp_demo_notice_hidden', true);
        var el = $('#demoNotice');
        if (el) el.remove();
      });
    }
  }

  function injectFloatingActions() {
    if ($('#floatingActions')) return;
    var html = '<div class="floating-actions" id="floatingActions">' +
      '<a class="floating-actions__btn floating-actions__btn--wa" href="https://wa.me/' + OWNER_PHONE + '?text=' + encodeURIComponent('Namaste, I want to book a puja and need guidance on the right muhurat.') + '"> ' + icon('wa') + '<span data-i18n="floatingWhatsApp">WhatsApp</span></a>' +
      '<a class="floating-actions__btn floating-actions__btn--book" href="booking.html">' + icon('calendar') + '<span data-i18n="floatingBook">Book now</span></a>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function initLanguageToggle() {
    var btn = $('#langToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      setLang(langState.lang === 'hi' ? 'en' : 'hi');
    });
    // Translate the already-rendered shell, then watch for content injected by
    // page scripts, the cart, modals and live updates.
    setLang(getLang());
    if (root.MutationObserver && document.body) {
      var pending = [];
      var scheduled = false;
      var observer = new MutationObserver(function (records) {
        if (langState.lang !== 'hi' || APPLYING) return;
        for (var i = 0; i < records.length; i++) {
          var r = records[i];
          if (r.type === 'characterData') pending.push(r.target);
          else if (r.addedNodes) {
            for (var j = 0; j < r.addedNodes.length; j++) pending.push(r.addedNodes[j]);
          }
        }
        if (!pending.length || scheduled) return;
        scheduled = true;
        var run = function () {
          scheduled = false;
          var list = pending; pending = [];
          list.forEach(function (n) {
            if (!n) return;
            if (n.nodeType === 1 && !n.isConnected) return;
            if (n.nodeType === 3 && !n.parentNode) return;
            translateDom(n.nodeType === 3 ? n : n);
          });
        };
        if (root.requestAnimationFrame) root.requestAnimationFrame(run); else setTimeout(run, 16);
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  function initQuickEnquiry() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    var submit = form.querySelector('[type="submit"]');
    if (submit) {
      submit.setAttribute('data-i18n', 'leadSubmit');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name: form.querySelector('[name="leadName"]').value.trim(),
        phone: form.querySelector('[name="leadPhone"]').value.trim(),
        city: form.querySelector('[name="leadCity"]').value.trim(),
        pooja: form.querySelector('[name="leadPooja"]').value.trim(),
        date: form.querySelector('[name="leadDate"]').value,
        createdAt: new Date().toISOString()
      };
      var list = store.get('vp_leads', []);
      list.unshift(data);
      store.set('vp_leads', list.slice(0, 25));
      var msg = 'Namaste, I am ' + (data.name || 'a family member') + '. I need guidance for ' + (data.pooja || 'a puja') + ' in ' + (data.city || 'Gurugram') + ' on ' + (data.date || 'my preferred date') + '. My WhatsApp number is ' + (data.phone || 'please share') + '.';

      // Keep the local copy (works offline) and also file it in the admin
      // dashboard. WhatsApp opens immediately so the popup is not blocked.
      var api = root.PanditAPI;
      if (api && api.enabled && api.sendContact) {
        api.sendContact({
          name: data.name,
          phone: data.phone,
          subject: 'Quick enquiry — ' + (data.pooja || 'General'),
          message: 'Home-page enquiry\n\nName: ' + (data.name || '—') +
            '\nWhatsApp: ' + (data.phone || '—') +
            '\nCity: ' + (data.city || '—') +
            '\nPooja: ' + (data.pooja || '—') +
            '\nPreferred date: ' + (data.date || '—')
        }).then(function (res) {
          if (!res.ok && !res.offline) {
            toast('Saved on your device. Please send it on WhatsApp too so we do not miss it.', 'error');
          }
        });
      }

      window.open('https://wa.me/' + OWNER_PHONE + '?text=' + encodeURIComponent(msg), '_blank');
      form.reset();
      toast(translations[localStorage.getItem('vp_lang') || 'en'].leadSuccess || 'Your enquiry is saved locally and shared on WhatsApp.');
    });
  }

  /* ------------------------------------------------------------------ toasts */
  function toast(msg, kind) {
    var wrap = $('#toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap'; wrap.id = 'toastWrap';
      document.body.appendChild(wrap);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(kind === 'error' ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, 3200);
  }

  /* ------------------------------------------------------------------ modals */
  function ensureModal() {
    var m = $('#appModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'appModal'; m.className = 'modal';
    m.innerHTML = '<div class="modal__scrim" data-modal-close></div><div class="modal__panel" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-modal-close') || e.target.closest('[data-modal-close]')) closeModal();
      var cancel = e.target.closest('[data-cancel]');
      if (cancel) cancelBooking(cancel.getAttribute('data-cancel'), cancel.getAttribute('data-otp'));
      var ics = e.target.closest('[data-ics]');
      if (ics) {
        var saved = findSavedBooking(ics.getAttribute('data-ics'));
        if (saved) addToCalendar(saved);
      }
      var print = e.target.closest('[data-print]');
      if (print) {
        var receipt = findSavedBooking(print.getAttribute('data-print'));
        if (receipt) printBooking(receipt);
      }
    });
    return m;
  }
  function openModal(html, opts) {
    var m = ensureModal();
    $('.modal__panel', m).innerHTML = html;
    $('.modal__panel', m).style.maxWidth = (opts && opts.width) || '640px';
    m.classList.add('open');
    document.body.classList.add('no-scroll');
  }
  function closeModal() {
    var m = $('#appModal');
    if (m) m.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); Cart.close(); }
  });

  /* -------------------------------------------------------------------- cart */
  var Cart = {
    items: [],
    load: function () { this.items = store.get('vp_cart', []); this.render(); },
    save: function () { store.set('vp_cart', this.items); this.render(); },
    add: function (obj) {
      var found = this.items.filter(function (i) { return i.id === obj.id; })[0];
      if (found) found.qty += 1;
      else this.items.push(Object.assign({ qty: 1 }, obj));
      this.save(); this.open();
      toast(obj.name + ' added to your samagri bag');
    },
    remove: function (id) {
      this.items = this.items.filter(function (i) { return i.id !== id; });
      this.save();
    },
    setQty: function (id, q) {
      var it = this.items.filter(function (i) { return i.id === id; })[0];
      if (!it) return;
      it.qty = Math.max(1, Math.min(9, q));
      this.save();
    },
    total: function () {
      return this.items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    },
    count: function () {
      return this.items.reduce(function (s, i) { return s + i.qty; }, 0);
    },
    render: function () {
      var c = $('#cartCount');
      if (c) {
        var n = this.count();
        c.textContent = n;
        var b = $('#cartOpen');
        if (b) b.setAttribute('aria-label', 'Open samagri cart, ' + n + ' item' + (n === 1 ? '' : 's'));
      }
      var body = $('#cartBody');
      if (!body) return;
      if (!this.items.length) {
        body.innerHTML = '<div class="cart-empty"><div class="big">🪔</div><p>Your samagri bag is empty.</p><p class="tiny mt-1">Kits, ghee, flowers and gemstones delivered before your muhurat.</p><a class="btn btn--ghost btn--sm mt-2" href="shop.html">Browse the shop</a></div>';
        var f = $('#cartFoot'); if (f) f.style.display = 'none';
        return;
      }
      var f2 = $('#cartFoot'); if (f2) f2.style.display = '';
      body.innerHTML = this.items.map(function (i) {
        return '<div class="cart-line"><div class="cart-line__art">' + (i.icon || '🪔') + '</div>' +
          '<div><b>' + esc(i.name) + '</b><small>' + INR(i.price) + ' each</small>' +
          '<div class="qty"><button data-qty="-1" data-id="' + i.id + '" aria-label="Decrease">−</button><span>' + i.qty + '</span><button data-qty="1" data-id="' + i.id + '" aria-label="Increase">+</button>' +
          '<button data-remove="' + i.id + '" class="cart-line__remove">remove</button></div></div>' +
          '<b class="cart-line__price">' + INR(i.price * i.qty) + '</b></div>';
      }).join('');
      var sub = $('#cartSubtotal'); if (sub) sub.textContent = INR(this.total());
      var ship = this.total() >= 999 ? 0 : 79;
      var sh = $('#cartShipping'); if (sh) sh.textContent = ship ? INR(ship) : 'Free';
      var gr = $('#cartGrand'); if (gr) gr.textContent = INR(this.total() + ship);
    },
    open: function () {
      var d = $('#cartDrawer');
      if (d) { d.classList.add('open'); document.body.classList.add('no-scroll'); }
    },
    close: function () {
      var d = $('#cartDrawer');
      if (d) d.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  };

  function injectCart() {
    if ($('#cartDrawer')) return;
    var html =
      '<div class="drawer" id="cartDrawer"><div class="drawer__scrim" data-cart-close></div>' +
      '<aside class="drawer__panel" aria-label="Samagri cart"><div class="drawer__head"><div><h3>Samagri bag</h3><p class="tiny muted">Delivered before your muhurat</p></div><button class="close-x" data-cart-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="drawer__body" id="cartBody"></div>' +
      '<div class="drawer__foot" id="cartFoot">' +
      '<div class="cart-total"><span>Subtotal</span><span id="cartSubtotal">₹0</span></div>' +
      '<div class="cart-total"><span>Delivery</span><span id="cartShipping">Free</span></div>' +
      '<div class="cart-total grand"><span>Total</span><span id="cartGrand">₹0</span></div>' +
      '<button class="btn btn--primary btn--wide mt-2" id="cartCheckout">Checkout securely ' + icon('arrow') + '</button>' +
      '<p class="tiny muted center mt-1">UPI · Cards · Netbanking · GST invoice on request</p>' +
      '</div></aside></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    $('#cartDrawer').addEventListener('click', function (e) {
      var t = e.target.closest('[data-cart-close]'); if (t) { Cart.close(); return; }
      var q = e.target.closest('[data-qty]');
      if (q) {
        var id = q.getAttribute('data-id');
        var it = Cart.items.filter(function (i) { return i.id === id; })[0];
        Cart.setQty(id, it.qty + Number(q.getAttribute('data-qty')));
        return;
      }
      var r = e.target.closest('[data-remove]');
      if (r) { Cart.remove(r.getAttribute('data-remove')); return; }
    });
    $('#cartCheckout').addEventListener('click', checkoutCart);
  }

  function checkoutCart() {
    if (!Cart.items.length) return;
    var goods = Cart.total();
    var shipping = goods >= 999 ? 0 : 79;
    var total = goods + shipping;
    openModal(
      '<div class="modal__head"><div><span class="kicker">Checkout</span><h2 class="fs-15">Deliver my samagri</h2></div><button class="close-x" data-modal-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="modal__body"><form id="cartCheckoutForm" class="form-grid">' +
      '<div class="field"><label>Full name</label><input required name="name" placeholder="Your name"></div>' +
      '<div class="field"><label>Phone</label><input required name="phone" type="tel" pattern="[0-9+ ]{10,15}" placeholder="+91 88896 85370"></div>' +
      '<div class="field"><label>Email <span class="opt">optional</span></label><input name="email" type="email" placeholder="you@example.com"></div>' +
      '<div class="field"><label>City</label><input required name="city" placeholder="Gurugram"></div>' +
      '<div class="field field--full"><label>Delivery address</label><textarea required name="address" placeholder="Flat, tower, society, sector"></textarea></div>' +
      '<div class="field"><label>Pincode</label><input required name="pin" inputmode="numeric" pattern="[0-9]{5,6}" placeholder="122002"></div>' +
      '<div class="field"><label>Payment</label><select name="pay"><option>UPI on confirmation</option><option>Card on delivery</option><option>Netbanking link</option></select></div>' +
      '<div class="field field--full"><div class="note-strip">' + icon('truck') + '<span>Dispatch within 2 hours for Gurugram orders placed before 4 PM. Fresh flowers are scheduled for 5 AM delivery on the ritual date.</span></div></div>' +
      '<div class="field field--full"><button class="btn btn--primary btn--wide" type="submit">Place order · ' + INR(total) + '</button></div>' +
      '</form></div>'
    );
    $('#cartCheckoutForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      var data = Object.fromEntries(new FormData(form).entries());
      var id = 'VP-' + String(Date.now()).slice(-6);
      var items = Cart.items.slice();
      var order = {
        id: id,
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address,
        city: data.city,
        pincode: data.pin,
        items: items.map(function (i) { return { id: i.id, name: i.name, price: i.price, qty: i.qty }; }),
        subtotal: goods,
        shipping: shipping,
        total: total,
        paymentStatus: 'Pending',
        notes: 'Payment preference: ' + (data.pay || 'UPI on confirmation')
      };

      var orders = store.get('vp_orders', []);
      orders.unshift({ id: id, type: 'shop', date: new Date().toISOString(), items: items, total: total, customer: data, status: 'Confirmed' });
      store.set('vp_orders', orders);

      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Placing order…'; }

      var showSuccess = function (synced) {
        Cart.items = []; Cart.save();
        openModal(
          '<div class="modal__body success"><div class="success__icon">' + icon('check') + '</div>' +
          '<h2>' + (synced ? 'Order confirmed' : 'Order saved') + '</h2>' +
          '<p class="muted mt-1">' + (synced
            ? 'Your samagri is being packed at our Sector 43 hub.'
            : 'Your order is saved on this device. Send it on WhatsApp so we can pack it while the server is unreachable.') + '</p>' +
          '<div class="booking-id mt-2">' + id + '</div>' +
          '<p class="small muted mt-3">We will WhatsApp the dispatch details to <b>' + esc(data.phone) + '</b>. For fresh flowers, our team confirms the ritual date separately.</p>' +
          '<div class="success-actions">' +
          '<a class="btn btn--primary" href="shop.html">Continue shopping</a>' +
          (!synced ? '<a class="btn btn--whatsapp" href="' +
            ((root.SITE_SETTINGS && typeof root.SITE_SETTINGS.waLink === 'function')
              ? root.SITE_SETTINGS.waLink('Namaste, my samagri order ' + id + ' (' + INR(total) + ') could not reach the site server. Please confirm it on WhatsApp.')
              : 'https://wa.me/' + OWNER_PHONE + '?text=' + encodeURIComponent('Namaste, my samagri order ' + id + ' (' + INR(total) + ') needs confirmation.')) +
            '" target="_blank" rel="noopener">Send on WhatsApp</a>' : '') +
          '</div>' +
          '</div>', { width: '480px' });
      };

      var api = root.PanditAPI;
      if (api && api.enabled && api.createOrder) {
        api.createOrder(order).then(function (res) {
          if (!res.ok && !res.offline) toast(res.error || 'Order saved on this device', 'error');
          showSuccess(Boolean(res.ok));
        });
      } else {
        showSuccess(false);
      }
    });
  }

  /* --------------------------------------------------------------- bookings */
  function bookingCard(b, note) {
    var canCancel = b.status !== 'Cancelled' && b.status !== 'Completed';
    return '<div class="form-section bookings-item"><div class="bookings-item__row">' +
      '<div><span class="step-pill">' + esc(b.status) + '</span><h3 class="bookings-item__title">' + esc(b.poojaName) + '</h3>' +
      '<p class="small muted">' + esc(b.dateLabel || b.date || 'Date to be confirmed') + ' · ' +
        esc(b.time || 'Muhurat to be confirmed') + ' · ' + esc(b.panditName || 'Pandit assignment in progress') + '</p>' +
      '<p class="tiny muted mt-1">Booking ' + esc(b.id) + ' · Gate OTP ' + esc(b.otp || '—') +
        (b.paymentStatus ? ' · Payment: ' + esc(b.paymentStatus) : '') +
        (note ? ' · ' + esc(note) : '') + '</p></div>' +
      '<div class="bookings-item__money"><b class="serif fs-12 text-maroon">' + INR(Number(b.total) || 0) + '</b>' +
      '<p class="tiny muted">' + esc(b.place || b.city || '') + '</p>' +
      '</div></div>' +
      '<div class="bookings-item__actions">' +
      '<a class="btn btn--whatsapp btn--sm" target="_blank" rel="noopener" href="' + esc(waBookingLink(b)) + '">' + icon('wa') + ' WhatsApp</a>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-ics="' + esc(b.id) + '">Add to calendar</button>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-print="' + esc(b.id) + '">Receipt</button>' +
      (canCancel ? '<button class="btn btn--ghost btn--sm" type="button" data-cancel="' + esc(b.id) + '" data-otp="' + esc(b.otp || '') + '">Cancel</button>' : '') +
      '</div></div>';
  }

  function rememberBooking(booking) {
    if (!booking || !booking.id) return;
    var all = store.get('vp_bookings', []);
    var found = false;
    all.forEach(function (b, i) {
      if (b.id === booking.id) { all[i] = Object.assign({}, b, booking); found = true; }
    });
    if (!found) all.unshift(booking);
    store.set('vp_bookings', all.slice(0, 25));
  }

  function findSavedBooking(id) {
    return store.get('vp_bookings', []).filter(function (b) {
      return String(b.id) === String(id);
    })[0] || null;
  }

  /* ------------------------------------------------ booking → WhatsApp
     One message with everything the pandit needs: who booked, which pooja,
     when, where and how much. Used by the booking flow the moment a pooja
     is confirmed and by the saved-bookings list, so every entry can be
     re-sent to the owner's WhatsApp. */
  function waBookingText(booking, paymentNote) {
    var b = booking || {};
    var c = b.customer || {};
    var lines = [
      '🙏 New pooja booking — ' + (b.id || ''),
      '',
      '🪔 Pooja: ' + (b.poojaName || 'Vedic pooja'),
      '📅 Date: ' + (b.dateLabel || b.date || 'to be confirmed'),
      '⏰ Muhurat: ' + (b.time || 'to be confirmed')
    ];
    var place = b.place || b.city || '';
    if (place) lines.push('📍 Place: ' + place);
    if (c.name) lines.push('👤 Name: ' + c.name);
    if (c.phone) lines.push('📱 Phone: ' + c.phone);
    var address = c.address || '';
    var society = (c.society && address.indexOf(c.society) < 0) ? ', ' + c.society : '';
    if (address || society) lines.push('🏠 Address: ' + address + society + (c.pin ? ' — ' + c.pin : ''));
    if (c.gate) lines.push('🚪 Gate / access: ' + c.gate);
    if (c.gotra) lines.push('🕉️ Gotra: ' + c.gotra);
    if (c.language) lines.push('🗣️ Language: ' + c.language);
    lines.push('🧑‍🏫 Pandit: ' + (b.panditName || 'Best match — assign for me'));
    if (b.extrasList && b.extrasList.length) lines.push('➕ Add-ons: ' + b.extrasList.join(', '));
    lines.push('');
    lines.push('💰 Total: ' + INR(Number(b.total) || 0) + ' (incl. GST ' + INR(Number(b.gst) || 0) + ')');
    if (paymentNote) {
      lines.push(paymentNote);
    } else {
      var balance = Number(b.balance) || 0;
      lines.push('💳 Payment: ' + (b.payment || 'UPI') + ' · ' + INR(Number(b.payNow) || Number(b.total) || 0) +
        (balance > 0 ? ' now, ' + INR(balance) + ' after the pooja' : ' due'));
    }
    if (b.paymentStatus && b.paymentStatus !== 'Pending') lines.push('🧾 Status: ' + b.paymentStatus);
    if (c.notes) lines.push('📝 Notes: ' + c.notes);
    lines.push('');
    lines.push('🔖 Booking ' + (b.id || '') + ' · Gate OTP ' + (b.otp || '—'));
    return lines.join('\n');
  }

  function waBookingLink(booking, paymentNote) {
    var text = waBookingText(booking, paymentNote);
    if (S && typeof S.waLink === 'function') return S.waLink(text);
    return 'https://wa.me/' + OWNER_PHONE + '?text=' + encodeURIComponent(text);
  }

  /* ------------------------------------------------- calendar + receipt */
  function icsEscape(value) {
    return String(value == null ? '' : value)
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function icsStamp(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function bookingIcs(booking) {
    if (!booking || !/^\d{4}-\d{2}-\d{2}$/.test(String(booking.date || ''))) return null;
    var parts = String(booking.date).split('-').map(Number);
    var start = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    if (isNaN(start.getTime())) return null;
    var end = new Date(start.getTime() + 86400000);
    var day = function (d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); };
    var description = [
      'Pooja: ' + (booking.poojaName || 'Vedic pooja'),
      'Muhurat: ' + (booking.time || 'To be confirmed'),
      'Pandit: ' + (booking.panditName || 'Assignment in progress'),
      'Booking: ' + (booking.id || ''),
      'Payment: ' + (booking.paymentStatus || 'Pending'),
      'Help: ' + OWNER_PHONE_DISPLAY
    ].join('\n');
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vedic Pooja//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + icsEscape(booking.id || ('booking-' + Date.now())) + '@vedicpooja',
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART;VALUE=DATE:' + day(start),
      'DTEND;VALUE=DATE:' + day(end),
      'SUMMARY:' + icsEscape('Pooja: ' + (booking.poojaName || 'Vedic pooja')),
      'DESCRIPTION:' + icsEscape(description),
      'LOCATION:' + icsEscape(booking.place || booking.city || ''),
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape('Tomorrow: ' + (booking.poojaName || 'your pooja')),
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n') + '\r\n';
  }

  function downloadFile(name, text, mime) {
    try {
      var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1200);
      return true;
    } catch (err) { return false; }
  }

  function addToCalendar(booking) {
    var ics = bookingIcs(booking);
    if (!ics) {
      toast('This booking has no pooja date yet, so it cannot go to a calendar', 'error');
      return false;
    }
    var ok = downloadFile(
      'vedic-pooja-' + String(booking.id || 'booking') + '.ics',
      ics,
      'text/calendar;charset=utf-8'
    );
    toast(ok
      ? 'Calendar file ready — open it to add the pooja with a one-day reminder'
      : 'Could not create the calendar file', ok ? '' : 'error');
    return ok;
  }

  function printBooking(booking) {
    if (!booking) return;
    var details = [
      ['Booking ID', booking.id],
      ['Pooja', booking.poojaName],
      ['Date', booking.dateLabel || booking.date],
      ['Muhurat', booking.time],
      ['Pandit', booking.panditName || 'Assignment in progress'],
      ['Place', booking.place || booking.city],
      ['Gate OTP', booking.otp],
      ['Payment', booking.paymentStatus || 'Pending'],
      ['UPI reference', booking.paymentRef]
    ];
    var amounts = [
      ['Pooja', booking.base],
      ['Extras', booking.extras],
      ['GST', booking.gst],
      ['Paid', booking.amountPaid],
      ['Balance', booking.balance]
    ];
    var customer = booking.customer || {};
    var rows = details.filter(function (r) { return r[1] != null && r[1] !== ''; })
      .map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('');
    var money = amounts.filter(function (r) { return r[1] != null; })
      .map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + INR(Number(r[1]) || 0) + '</td></tr>'; }).join('');
    var html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Receipt ' + esc(booking.id) + '</title><style>' +
      '*{box-sizing:border-box}body{margin:0;padding:32px;font:14px/1.55 Georgia,serif;color:#2b1a12;background:#fff}' +
      '.wrap{max-width:680px;margin:0 auto;border:1px solid #d9c9a5;border-radius:14px;padding:30px}' +
      'h1{font-size:1.5rem;margin:0 0 2px}h1 span{color:#8a5a12}' +
      '.muted{color:#6c5a4a;font-size:.8rem;margin:0 0 18px}' +
      'table{width:100%;border-collapse:collapse;margin:14px 0}' +
      'th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #eee4cf;vertical-align:top}' +
      'th{width:42%;color:#6c5a4a;font-weight:400}' +
      '.total th,.total td{font-weight:700;border-bottom:0;font-size:1rem}' +
      '.foot{margin-top:18px;font-size:.78rem;color:#6c5a4a}' +
      '.actions{max-width:680px;margin:18px auto 0;display:flex;gap:10px}' +
      'button{font:inherit;padding:10px 18px;border-radius:999px;border:0;background:#6d1f2c;color:#fff;cursor:pointer}' +
      '@media print{body{padding:0}.wrap{border:0;border-radius:0}.actions{display:none}}' +
      '</style></head><body><div class="wrap">' +
      '<h1>Vedic Pooja <span>receipt</span></h1>' +
      '<p class="muted">' + esc(OWNER_NAME) + ' · ' + esc(OWNER_PHONE_DISPLAY) + ' · ' + esc(OWNER_EMAIL) + '</p>' +
      (customer.name ? '<p><b>' + esc(customer.name) + '</b>' + (customer.phone ? '<br>' + esc(customer.phone) : '') + '</p>' : '') +
      '<table>' + rows + '</table>' +
      '<table>' + money + '<tr class="total"><th>Total</th><td>' + INR(Number(booking.total) || 0) + '</td></tr></table>' +
      '<p class="foot">This is a booking receipt, not a tax invoice. Keep the gate OTP private — it is used to look up or cancel the booking. Questions? WhatsApp ' +
      esc(OWNER_PHONE_DISPLAY) + '.</p>' +
      '</div><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div></body></html>';

    var win = window.open('', '_blank', 'width=760,height=920');
    if (!win) {
      toast('Allow pop-ups to open the printable receipt', 'error');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  function cancelBooking(id, otp) {
    var all = store.get('vp_bookings', []);
    var found = false;
    all.forEach(function (b) { if (b.id === id) { b.status = 'Cancelled'; found = true; } });
    if (!found) all.unshift({ id: id, status: 'Cancelled', otp: otp });
    store.set('vp_bookings', all);

    var api = root.PanditAPI;
    if (api && api.enabled && api.cancelBooking && otp) {
      api.cancelBooking(id, otp).then(function (res) {
        if (res.ok) toast('Booking ' + id + ' cancelled');
        else toast('Cancelled on this device. Please WhatsApp us so we can confirm the cancellation.', 'error');
        bookingsModal();
      });
    } else {
      toast('Booking ' + id + ' cancelled on this device');
      bookingsModal();
    }
  }

  function bookingsModal() {
    var list = store.get('vp_bookings', []);
    var body = list.length
      ? list.map(function (b) { return bookingCard(b); }).join('')
      : '<div class="empty-state"><div class="big">📿</div><p>No bookings saved on this device.</p>' +
        '<p class="tiny mt-1">If you booked on another device, enter the booking ID and gate OTP above.</p>' +
        '<a class="btn btn--primary btn--sm mt-2" href="poojas.html">Book your first pooja</a></div>';

    var trackForm = '<form id="trackBookingForm" class="form-grid track-form">' +
      '<div class="field"><label for="trackId">Booking ID</label>' +
      '<input id="trackId" name="id" required autocomplete="off" placeholder="VP-123456"></div>' +
      '<div class="field"><label for="trackOtp">Gate OTP</label>' +
      '<input id="trackOtp" name="otp" required inputmode="numeric" maxlength="8" autocomplete="off" placeholder="6-digit OTP"></div>' +
      '<div class="field field--full"><button class="btn btn--primary btn--sm" type="submit">Find my booking</button></div>' +
      '</form><div id="trackBookingResult"></div>';

    openModal(
      '<div class="modal__head"><div><span class="kicker">Your account</span><h2 class="fs-15">My bookings</h2></div>' +
      '<button class="close-x" data-modal-close>' + icon('close') + '</button></div>' +
      '<div class="modal__body">' +
      '<div class="note-strip">' + icon('lock') + '<span>Enter the booking ID and gate OTP from your confirmation to see the live status, even on another device.</span></div>' +
      trackForm +
      '<h3 class="fs-12 mt-3">Saved on this device</h3>' + body +
      '</div>', { width: '560px' });

    var form = $('#trackBookingForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var id = String(form.elements.id.value || '').trim().toUpperCase();
        var otp = String(form.elements.otp.value || '').trim();
        var out = $('#trackBookingResult');
        if (!id || !otp) return;
        var local = list.filter(function (b) {
          return String(b.id).toUpperCase() === id && String(b.otp) === otp;
        })[0];

        var renderLocal = function () {
          if (!local) return false;
          out.innerHTML = bookingCard(local, 'Saved on this device');
          return true;
        };

        var api = root.PanditAPI;
        if (api && api.enabled && api.getBooking) {
          out.innerHTML = '<p class="small muted mt-2">Looking up booking…</p>';
          api.getBooking(id, otp).then(function (res) {
            if (res.ok) {
              res.data.otp = res.data.otp || otp;
              rememberBooking(res.data);
              out.innerHTML = bookingCard(res.data, 'Live from server');
            } else if (!renderLocal()) {
              out.innerHTML = '<p class="small text-danger mt-2">' + esc(res.error || 'Booking not found. Check the ID and OTP.') + '</p>';
            }
          });
        } else if (!renderLocal()) {
          out.innerHTML = '<p class="small muted mt-2">Connect to the internet to look up this booking, or use the saved list below.</p>';
        }
      });
    }

  }

  /* -------------------------------------------------------------- page init */
  function initNav() {
    var burger = $('#burger'), nav = $('#mainNav');
    if (burger && nav) {
      var closeNav = function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      };
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      /* A phone menu should close as soon as the user picks a page, taps
         outside it or presses Escape — it should never stay open behind the
         next screen. */
      nav.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a')) closeNav();
      });
      document.addEventListener('click', function (e) {
        if (!nav.classList.contains('open')) return;
        if (nav.contains(e.target) || burger.contains(e.target)) return;
        closeNav();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNav();
      });
    }
    /* Desktop "More" menu (hidden below 1241px where the burger takes over). */
    var moreBtn = $('#navMoreBtn'), moreMenu = $('#navMoreMenu');
    if (moreBtn && moreMenu) {
      var closeMore = function () {
        moreMenu.hidden = true;
        moreBtn.setAttribute('aria-expanded', 'false');
      };
      var openMore = function () {
        moreMenu.hidden = false;
        moreBtn.setAttribute('aria-expanded', 'true');
      };
      moreBtn.addEventListener('click', function () {
        if (moreMenu.hidden) openMore(); else closeMore();
      });
      moreMenu.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a')) closeMore();
      });
      document.addEventListener('click', function (e) {
        if (moreMenu.hidden) return;
        if (moreMenu.contains(e.target) || moreBtn.contains(e.target)) return;
        closeMore();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || moreMenu.hidden) return;
        closeMore();
        moreBtn.focus();
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 1240) return;
        closeMore();
      });
    }
    window.addEventListener('scroll', function () {
      var h = $('#siteHead');
      if (h) h.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    var observe = function (el) { if (el && !el.classList.contains('in')) io.observe(el); };
    els.forEach(observe);

    /* page scripts render cards after this init — pick those up too */
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList.contains('reveal')) observe(n);
            Array.prototype.forEach.call(n.querySelectorAll('.reveal'), observe);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ---------------------------------------------------------------- motion
     One calm entrance layer for the whole site. Blocks are claimed with
     .motion only after this runs, so a blocked script never hides content.
     Each entrance uses the Web Animations API with no fill mode; when it
     finishes the component's own hover transform takes over again. */
  function initMotion() {
    if (!document.body || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }
    if (reduce) return;

    var TARGETS = [
      '.sec-head', '.page-head', '.toolbar',
      '.card', '.panel', '.feature', '.step', '.svc-card', '.svc-step',
      '.paath-card', '.pandit', '.review-card', '.product', '.kit-step',
      '.city-card', '.rashi-card', '.trustbar > div', '.mini-card', '.band',
      '.cta-card', '.lead-shell', '.form-section', '.summary-card', '.chart-card',
      '.num-panel', '.daily-card', '.join-band', '.pj-card', '.pj-section-head',
      '.pj-step-wrap', '.book-step', '.acct-card', '.contact-line', '.faq__item',
      '.review-side', '.review-write', '.review-summary', '.match-hero',
      '.pan-hero__main', '.pan-hero__meta', '.cal-day', '.fest-item', '.foot-col'
    ].join(',');
    var BARS = '.koot__bar i,.review-bar i b,.daily-progress span';

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var delay = Number(el.getAttribute('data-motion-delay')) || 0;
        // A full-width page head only fades: sliding it would briefly expose
        // the page background above the fold.
        var head = el.classList.contains('page-head');
        var frames = head
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 0, transform: 'translate3d(0,20px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }];
        el.classList.remove('motion');
        try {
          el.animate(frames, { duration: 620, delay: delay, easing: 'cubic-bezier(.22,.68,.24,1)', fill: 'backwards' });
        } catch (e) { /* older browsers just show the block */ }
      });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });

    var barIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        barIo.unobserve(en.target);
        var el = en.target;
        el.classList.add('motion-bar');
        try {
          el.animate(
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: 820, easing: 'cubic-bezier(.22,.68,.24,1)' }
          );
        } catch (e) { /* ignore */ }
      });
    }, { threshold: .3 });

    var parentCount = 'WeakMap' in window ? new WeakMap() : null;

    function claim(el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('data-motion') === '1') return false;
      if (el.classList.contains('reveal') || el.classList.contains('motion')) return false;
      if (el.closest && el.closest('.no-motion,.xp-sheet,.modal,.drawer,#xpDock')) return false;
      // These elements own their transform; leave them to the experience layer.
      if (el.matches && el.matches('.xp-tilt,.xp-float,.xp-parallax,.hero__mandala,.hero__glow,.panch-card')) return false;
      el.setAttribute('data-motion', '1');
      el.classList.add('motion');
      return true;
    }

    function claimBars(root) {
      $$(BARS, root).forEach(function (el) {
        if (el.getAttribute('data-motion-bar') === '1') return;
        el.setAttribute('data-motion-bar', '1');
        barIo.observe(el);
      });
    }

    function scan(root) {
      var scope = (root && root.nodeType === 1) ? root : document;
      var list = $$(TARGETS, scope);
      if (scope.matches && scope.matches(TARGETS)) list.unshift(scope);
      list.forEach(function (el) {
        if (!claim(el)) return;
        var parent = el.parentNode;
        var n = 0;
        if (parent && parentCount) {
          n = parentCount.get(parent) || 0;
          parentCount.set(parent, n + 1);
        }
        el.setAttribute('data-motion-delay', String(Math.min(n, 7) * 55));
        io.observe(el);
      });
      claimBars(scope);
    }

    scan(document);

    /* Page scripts render most cards after this init — pick those up too. */
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType === 1) scan(n);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = el.hasAttribute('data-decimal');
      var started = false;
      var run = function () {
        if (started) return; started = true;
        var t0 = performance.now(), dur = 1400;
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          var v = target * e;
          el.textContent = (dec ? v.toFixed(1) : Math.round(v).toLocaleString('en-IN')) + (el.getAttribute('data-suffix') || '');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .4 });
        io.observe(el);
      } else run();
    });
  }

  function initNewsletter() {
    $$('[data-newsletter]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        toast('Subscribed — your first panchang digest is on its way');
        f.reset();
      });
    });
  }

  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

    var hadController = !!navigator.serviceWorker.controller;
    var reloading = false;
    var lastCheck = 0;

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      // A new worker took over. Reload once so HTML, CSS and JS all match.
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });

    var check = function (force) {
      if (!navigator.serviceWorker.controller || !navigator.serviceWorker.getRegistration) return;
      var now = Date.now();
      if (!force && now - lastCheck < 5 * 60 * 1000) return;
      lastCheck = now;
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (!reg) return;
        if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
        reg.update().catch(function () { /* offline */ });
      }).catch(function () { /* ignore */ });
    };

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', function () {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage('SKIP_WAITING');
            }
          });
        });
      }).catch(function () { /* unsupported or blocked */ });
      check(true);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') check(true);
    });
    window.addEventListener('online', function () { check(true); });
    setInterval(function () { check(false); }, 15 * 60 * 1000);
  }

  function init() {
    applyCityCopy();
    injectHeader();
    initAccountLink();
    injectDemoNotice();
    placeSkipLink();
    if (document.body) document.body.classList.add('shell-ready');
    injectFooter();
    injectFloatingActions();
    injectCart();
    initLanguageToggle();
    initQuickEnquiry();
    initNav();
    initReveal();
    initMotion();
    initCounters();
    initNewsletter();
    initPWA();
    initLiveUpdates();
    Cart.load();
    var co = $('#cartOpen'); if (co) co.addEventListener('click', function () { Cart.open(); });
    var bo = $('#bookingsOpen'); if (bo) bo.addEventListener('click', bookingsModal);
    $$('a[href="#bookings"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); bookingsModal(); });
    });
    if (location.hash === '#bookings') bookingsModal();
    initHashScroll();
  }

  function initHashScroll() {
    if (!location.hash || location.hash === '#bookings') return;
    var id = location.hash.slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    var go = function () {
      var t = document.getElementById(id);
      if (t) t.scrollIntoView({ block: 'start' });
    };
    setTimeout(go, 120);
    setTimeout(go, 550);
  }

  root.App = {
    $: $, $$: $$, INR: INR, esc: esc, pad: pad, store: store,
    icon: icon, stars: stars, starIcon: starIcon,
    findCity: findCity, cityOptions: cityOptions, cityMeta: cityMeta, cityOffset: cityOffset,
    cityCount: cityCount, applyCityCopy: applyCityCopy,
    place: place, placeName: placeName, translateString: translateString,
    toast: toast, openModal: openModal, closeModal: closeModal,
    Cart: Cart, bookingsModal: bookingsModal, syncOwner: syncOwner,
    rememberBooking: rememberBooking, findSavedBooking: findSavedBooking,
    addToCalendar: addToCalendar, printBooking: printBooking,
    waBookingText: waBookingText, waBookingLink: waBookingLink,
    lang: function () { return langState.lang; },
    isHi: function () { return langState.lang === 'hi'; },
    setLang: setLang,
    t: t,
    astro: astro,
    translateDom: translateDom,
    onLang: function (fn) {
      if (typeof fn !== 'function') return function () {};
      langState.callbacks.push(fn);
      return function () {
        var i = langState.callbacks.indexOf(fn);
        if (i >= 0) langState.callbacks.splice(i, 1);
      };
    },
    owner: { name: OWNER_NAME, phone: OWNER_PHONE, phoneDisplay: OWNER_PHONE_DISPLAY, email: OWNER_EMAIL, upi: OWNER_UPI },
    teller: topbarText
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
