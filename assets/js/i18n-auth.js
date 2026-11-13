/* ==========================================================================
   Standalone language switch for the account pages (login, register,
   forgot-password, reset-password). Those pages do not load app.js, so this
   file provides the same phrase-based English -> Hindi translation and the
   shared #langToggle control. Load it after i18n-phrases.js.
   ========================================================================== */
(function (root) {
  'use strict';

  var PHRASES = root.VP_PHRASES || {};
  var PHRASE_INDEX = {};
  var langState = { lang: 'en', callbacks: [] };
  var APPLYING = false;
  var textOriginal = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var attrOriginal = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var doc = root.document;

  function $(sel, scope) { return (scope || doc).querySelector(sel); }

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
    pandits: 'पंडित', pandit: 'पंडित', bookings: 'बुकिंग', booking: 'बुकिंग',
    items: 'आइटम', item: 'आइटम', results: 'परिणाम', result: 'परिणाम',
    days: 'दिन', day: 'दिन', hours: 'घंटे', hour: 'घंटा',
    minutes: 'मिनट', minute: 'मिनट', characters: 'अक्षर', character: 'अक्षर',
    attempts: 'प्रयास', attempt: 'प्रयास', digits: 'अंक', digit: 'अंक'
  };

  function patternHi(s) {
    var m;
    if ((m = /^(\d+)\s+of\s+(\d+)$/.exec(s))) return m[2] + ' में से ' + m[1];
    if ((m = /^\((\d+)\s+reviews?\)$/i.exec(s))) return '(' + m[1] + ' समीक्षाएँ)';
    if ((m = /^(\d+)\s+stars?$/i.exec(s))) return m[1] + ' सितारे';
    if ((m = /^(\d+)\s+(rituals?|poojas?|pandits?|bookings?|items?|results?|days?|hours?|minutes?|characters?|attempts?|digits?)$/i.exec(s))) {
      return m[1] + ' ' + (COUNT_NOUN[m[2].toLowerCase()] || m[2]);
    }
    if ((m = /^Send (?:again|another code) in (\d+)s$/i.exec(s))) return m[1] + ' सेकंड में फिर भेजें';
    if ((m = /^Code expires in (\d+):(\d{2})$/i.exec(s))) return 'कोड ' + m[1] + ':' + m[2] + ' में समाप्त होगा';
    if ((m = /^Code sent to (.+)$/i.exec(s))) return 'कोड भेजा गया: ' + m[1];
    if ((m = /^Welcome to Vedic Pooja,\s*(.+?)\s*!?$/i.exec(s))) return 'वेदिक पूजा में स्वागत है, ' + m[1] + '!';
    if ((m = /^We linked (\d+) previous booking(s?) to your account\.$/i.exec(s))) {
      return 'हमने आपके खाते से ' + m[1] + ' पिछली बुकिंग जोड़ी' + (m[1] === '1' ? '' : 'ं') + '।';
    }
    if ((m = /^Welcome back\s*[—-]\s*(\d+) past booking(s?) linked to your account\.$/i.exec(s))) {
      return 'फिर से स्वागत है — आपके खाते से ' + m[1] + ' पिछली बुकिंग जुड़ी' + (m[1] === '1' ? '' : 'ं') + '।';
    }
    if ((m = /^Member since (.+)$/i.exec(s))) return 'सदस्यता आरंभ ' + m[1];
    if ((m = /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3];
    }
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]] + ' ' + m[3];
    }
    if ((m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.exec(s))) {
      return m[1] + ' ' + GREG_MONTHS[m[2]];
    }
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
    while (el && el !== doc.body) {
      if (el.getAttribute && (el.getAttribute('data-no-i18n') != null || el.getAttribute('translate') === 'no')) return true;
      if (/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE|OPTION)$/.test(el.nodeName)) return true;
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
    var el = rootNode || doc.body;
    if (!el) return;
    if (el.nodeType === 3) { translateTextNode(el); return; }
    if (el.nodeType !== 1 && el.nodeType !== 9) return;
    if (el.nodeType === 1 && skipI18n(el)) return;
    translateAttrs(el);
    if (!doc.createTreeWalker) return;
    var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
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
    try {
      doc.dispatchEvent(new CustomEvent('vp:langchange', { detail: { lang: lang } }));
    } catch (e) { /* old browsers */ }
  }

  function getLang() {
    try {
      var saved = root.localStorage.getItem('vp_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function updateToggle() {
    var btn = $('#langToggle');
    if (!btn) return;
    var hi = langState.lang === 'hi';
    btn.textContent = hi ? 'ENG' : 'हिंदी';
    btn.setAttribute('aria-label', hi ? 'Switch language to English' : 'Switch language to Hindi');
    btn.dataset.lang = langState.lang;
    btn.setAttribute('lang', hi ? 'en' : 'hi');
  }

  function setLang(lang, silent) {
    var next = lang === 'hi' ? 'hi' : 'en';
    langState.lang = next;
    try { root.localStorage.setItem('vp_lang', next); } catch (e) { /* private mode */ }
    doc.documentElement.lang = next;
    doc.documentElement.setAttribute('data-lang', next);
    updateToggle();
    translateDom(doc.body);
    if (silent !== true) fireLang(next);
    if (next === 'hi') translateDom(doc.body);
  }

  function t(en, hi) {
    if (langState.lang !== 'hi') return en;
    if (hi != null) return hi;
    return translateString(en);
  }

  function onLang(fn) {
    if (typeof fn === 'function') langState.callbacks.push(fn);
  }

  /* Insert the shared pill next to the "Back to site" link. */
  function mountToggle() {
    if ($('#langToggle')) return;
    var top = $('.auth-top');
    if (!top) return;
    var back = top.querySelector('.auth-top__back');
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.id = 'langToggle';
    btn.className = 'lang-switch';
    btn.addEventListener('click', function () {
      setLang(langState.lang === 'hi' ? 'en' : 'hi');
    });

    var actions = doc.createElement('div');
    actions.className = 'auth-top__actions';
    if (back && back.parentNode === top) {
      top.insertBefore(actions, back);
      actions.appendChild(back);
      actions.appendChild(btn);
    } else {
      top.appendChild(actions);
      actions.appendChild(btn);
    }
    updateToggle();
  }

  function init() {
    mountToggle();
    var saved = getLang();
    langState.lang = saved;
    doc.documentElement.lang = saved;
    doc.documentElement.setAttribute('data-lang', saved);
    updateToggle();
    if (saved === 'hi') translateDom(doc.body);

    if (root.MutationObserver && doc.body) {
      var queued = false;
      new root.MutationObserver(function () {
        if (APPLYING || langState.lang !== 'hi' || queued) return;
        queued = true;
        setTimeout(function () { queued = false; translateDom(doc.body); }, 30);
      }).observe(doc.body, { childList: true, subtree: true, characterData: true });
    }

    root.addEventListener('storage', function (e) {
      if (e.key !== 'vp_lang') return;
      setLang(e.newValue === 'hi' ? 'hi' : 'en', true);
      fireLang(langState.lang);
    });
  }

  root.VPAuthI18n = {
    lang: function () { return langState.lang; },
    isHi: function () { return langState.lang === 'hi'; },
    setLang: setLang,
    t: t,
    onLang: onLang,
    translate: translateDom
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
