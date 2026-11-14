/* ==========================================================================
   Vedic Pooja — Muhurat Studio
   --------------------------------------------------------------------------
   Everything on this page is computed in the browser from assets/js/astro.js:
   no copied almanac rows and no network call.

   1. Scans a date range for the chosen ritual.
   2. Scores each day from tithi, nakshatra, weekday, yoga, karana, bhadra,
      panchak and festivals — using the traditional preference sets below.
   3. Picks the cleanest time window inside that day (Abhijit / choghadiya),
      never overlapping Rahu Kaal, Gulika or Yamaganda.
   4. Builds a complete runbook: timeline, scaled samagri, budget and reminders.

   The score is a planning aid, not a substitute for a pandit's lagna check.
   ========================================================================== */
(function (root) {
  'use strict';

  var A = root.App, V = root.Vedic, D = root.PanditData;
  if (!A || !V || !D) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = A.esc;
  var KEY = 'vp_muhurat_studio_v1';
  var DAY = 86400000;

  function L(en, hi) { return A.isHi() ? hi : en; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function money(n) { return '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function T(kind, name) {
    try { return A.isHi() ? A.astro(kind, name) : name; } catch (e) { return name; }
  }
  function ritualName(p) { return (A.isHi() && p.hi) ? p.hi : p.name; }

  /* ------------------------------------------------------------ preferences
     Traditional tithi / nakshatra / weekday sets. Tithi numbers are 1–15 in
     each paksha (15 = Purnima in Shukla, Amavasya in Krishna). Nakshatra
     indexes are 0 = Ashwini … 26 = Revati. Weekday 0 = Sunday. */
  var RULES = {
    vivah: {
      key: 'vivah', en: 'marriage', hi: 'विवाह',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13], badT: [4, 6, 8, 9, 14, 15],
      goodN: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [1, 3, 4, 5], badWd: [2, 6]
    },
    griha: {
      key: 'griha', en: 'griha pravesh and bhoomi work', hi: 'गृह प्रवेश व भूमि कार्य',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13], badT: [4, 6, 8, 9, 14, 15],
      goodN: [3, 4, 11, 12, 13, 16, 20, 25, 26], badN: [1, 2, 5, 8, 9, 17, 23, 24],
      goodWd: [1, 3, 4, 5], badWd: [2, 6]
    },
    katha: {
      key: 'katha', en: 'katha and vrat', hi: 'कथा व व्रत',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13, 15], badT: [4, 6, 8, 9, 14],
      goodN: [3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [1, 3, 4, 5], badWd: [2, 6]
    },
    shanti: {
      key: 'shanti', en: 'graha shanti and remedies', hi: 'ग्रह शांति व उपाय',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13], badT: [4, 8, 9, 14],
      goodN: [3, 4, 6, 7, 12, 13, 16, 20, 21, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [1, 2, 3, 4, 5], badWd: []
    },
    business: {
      key: 'business', en: 'business and office rituals', hi: 'व्यापार व कार्यालय',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13], badT: [4, 6, 8, 9, 14, 15],
      goodN: [3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [1, 3, 4, 5], badWd: [2, 6]
    },
    homa: {
      key: 'homa', en: 'homa and havan', hi: 'होम व हवन',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13, 15], badT: [4, 6, 8, 9, 14],
      goodN: [3, 4, 7, 12, 13, 16, 20, 21, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [0, 1, 3, 4, 5], badWd: [2, 6]
    },
    general: {
      key: 'general', en: 'this ritual', hi: 'इस अनुष्ठान',
      goodT: [2, 3, 5, 7, 10, 11, 12, 13], badT: [4, 6, 8, 9, 14, 15],
      goodN: [3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 25, 26], badN: [1, 2, 5, 8, 17, 23, 24],
      goodWd: [1, 3, 4, 5], badWd: [2, 6]
    }
  };

  function ruleFor(p) {
    var hay = ((p.id || '') + ' ' + (p.name || '') + ' ' + (p.cat || '')).toLowerCase();
    if (/vivah|wedding|marriage|sagai|engagement|roka/.test(hay)) return RULES.vivah;
    if (/griha|graha pravesh|bhoomi|vastu|house|flat|shop opening|office opening/.test(hay)) return RULES.griha;
    if (/satyanarayan|katha|vrat|purnima|ekadashi|sundarkand|ramayan|bhagwat/.test(hay)) return RULES.katha;
    if (/shanti|dosh|dosha|navgrah|mangal|kaal sarp|mahamrityunjay|rudrabhishek|remedy|nivaran/.test(hay)) return RULES.shanti;
    if (/corporate|express|office|business|vehicle|launch|factory|shop/.test(hay)) return RULES.business;
    if (/homa|havan|yagya|yajna|agni|fire/.test(hay)) return RULES.homa;
    return RULES.general;
  }

  /* --------------------------------------------------------------- state */
  var state = {
    poojaId: 'satyanarayan', city: 'Gurugram', days: 45, guests: 11,
    gotra: 'Kashyap', name: '', extras: [], autoSave: true, tab: 'timeline',
    selected: 0, done: []
  };
  var results = [];
  var ranked = [];
  var scanning = false;
  var scanToken = 0;
  var lastDayKey = '';
  var timer = null;
  var pendingDate = '';

  function findPooja() {
    return D.POOJAS.filter(function (p) { return p.id === state.poojaId; })[0] || D.POOJAS[0];
  }
  function findCity() { return A.findCity(state.city) || A.findCity('Gurugram'); }
  function cityLabel() {
    var c = findCity();
    return c ? A.place(c) : (state.city || 'Gurugram');
  }
  function selectedExtras() {
    return (D.EXTRAS || []).filter(function (x) { return state.extras.indexOf(x.id) >= 0; });
  }

  function save() {
    if (!state.autoSave) {
      A.store.set(KEY, { autoSave: false, poojaId: state.poojaId, city: state.city });
      return;
    }
    A.store.set(KEY, {
      poojaId: state.poojaId, city: state.city, days: state.days, guests: state.guests,
      gotra: state.gotra, name: state.name, extras: state.extras,
      autoSave: state.autoSave, tab: state.tab, done: state.done
    });
  }
  function load() {
    var saved = A.store.get(KEY, null);
    if (saved && typeof saved === 'object') {
      Object.keys(state).forEach(function (k) {
        if (saved[k] !== undefined) state[k] = saved[k];
      });
    }
    if (!state.city) {
      var c = A.store.get('vp_city', null);
      if (c) state.city = c;
    }
    if (!Array.isArray(state.extras)) state.extras = [];
    if (!Array.isArray(state.done)) state.done = [];
    if (!findPooja()) state.poojaId = D.POOJAS[0].id;
  }

  /* --------------------------------------------------------------- form */
  function poojaOptions(query) {
    var q = String(query || '').trim().toLowerCase();
    var list = D.POOJAS.filter(function (p) {
      if (!q) return true;
      return (p.name + ' ' + (p.hi || '') + ' ' + p.cat + ' ' + (p.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    // Keep the current pick selectable even when the search text hides it.
    var current = findPooja();
    if (current && list.indexOf(current) < 0 && q) list = [current].concat(list);
    if (!list.length) return '<option value="">' + L('No ritual matches that search', 'इस खोज से कोई अनुष्ठान नहीं मिला') + '</option>';
    var cats = D.CATEGORIES.filter(function (c) { return c !== 'All Rituals'; });
    return cats.map(function (cat) {
      var items = list.filter(function (p) { return p.cat === cat; });
      if (!items.length) return '';
      return '<optgroup label="' + esc(A.translateString(cat)) + '">' + items.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === state.poojaId ? ' selected' : '') + '>' +
          esc(ritualName(p)) + ' — ' + money(p.price) + ' · ' + esc(p.duration) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function gotraOptions() {
    return (D.GOTRAS || []).map(function (g) {
      return '<option value="' + esc(g) + '"' + (g === state.gotra ? ' selected' : '') + '>' + esc(g) + '</option>';
    }).join('');
  }

  function buildForm() {
    var form = $('#studioForm');
    if (!form) return;
    var pooja = findPooja();
    form.innerHTML =
      '<div class="studio-form__head">' +
        '<span class="badge" aria-hidden="true">' + A.icon('compass') + '</span>' +
        '<div><h2>' + L('Plan a ritual', 'अनुष्ठान की योजना') + '</h2>' +
        '<p>' + L('Live muhurat engine', 'लाइव मुहूर्त इंजन') + '</p></div>' +
      '</div>' +

      '<div class="studio-step"><i>1</i>' + L('The ritual', 'अनुष्ठान') + '</div>' +
      '<div class="studio-field">' +
        '<label for="stPooja">' + L('Choose a pooja', 'पूजा चुनें') + '</label>' +
        '<div class="studio-search">' + A.icon('search') +
          '<input type="search" id="stPoojaSearch" placeholder="' + L('Search 100 rituals…', '100 अनुष्ठान खोजें…') + '" autocomplete="off" aria-label="' + L('Search rituals', 'अनुष्ठान खोजें') + '">' +
        '</div>' +
        '<select id="stPooja" aria-label="' + L('Choose a pooja', 'पूजा चुनें') + '">' + poojaOptions('') + '</select>' +
        '<div class="studio-market" id="stMarket"></div>' +
      '</div>' +

      '<div class="studio-step"><i>2</i>' + L('Time &amp; place', 'समय व स्थान') + '</div>' +
      '<div class="studio-field">' +
        '<label for="stCity">' + L('City', 'शहर') + '</label>' +
        '<div class="studio-search">' + A.icon('search') +
          '<input type="search" id="stCitySearch" placeholder="' + L('Search cities…', 'शहर खोजें…') + '" autocomplete="off" aria-label="' + L('Search cities', 'शहर खोजें') + '">' +
        '</div>' +
        '<select id="stCity" aria-label="' + L('Choose a city', 'शहर चुनें') + '">' + A.cityOptions(state.city) + '</select>' +
        '<div class="hint" id="stCityMeta"></div>' +
      '</div>' +
      '<div class="studio-row">' +
        '<div class="studio-field"><label for="stDays">' + L('Scan ahead', 'आगे देखें') + '</label>' +
          '<select id="stDays">' +
            [15, 30, 45, 60, 90].map(function (n) {
              return '<option value="' + n + '"' + (Number(state.days) === n ? ' selected' : '') + '>' + n + ' ' + L('days', 'दिन') + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="studio-field"><label for="stGuests">' + L('Guests', 'अतिथि') + '</label>' +
          '<input type="number" id="stGuests" min="1" max="300" value="' + esc(state.guests) + '"></div>' +
      '</div>' +

      '<div class="studio-step"><i>3</i>' + L('Sankalp details', 'संकल्प विवरण') + '</div>' +
      '<div class="studio-row">' +
        '<div class="studio-field"><label for="stName">' + L('Your name', 'आपका नाम') + '</label>' +
          '<input type="text" id="stName" value="' + esc(state.name) + '" placeholder="' + L('Optional', 'वैकल्पिक') + '"></div>' +
        '<div class="studio-field"><label for="stGotra">' + L('Gotra', 'गोत्र') + '</label>' +
          '<select id="stGotra">' + gotraOptions() + '</select></div>' +
      '</div>' +

      '<details class="studio-extras"' + (state.extras.length ? ' open' : '') + '>' +
        '<summary>' + L('Add-ons', 'अतिरिक्त सेवाएँ') + ' <span class="tiny muted">' + (state.extras.length ? state.extras.length + ' ' + L('selected', 'चुनी') : '') + '</span></summary>' +
        '<div class="studio-extras__body">' + (D.EXTRAS || []).map(function (x) {
          return '<label class="studio-check"><input type="checkbox" data-extra="' + esc(x.id) + '"' +
            (state.extras.indexOf(x.id) >= 0 ? ' checked' : '') + '> ' +
            '<span>' + esc(x.name) + ' <span>+' + money(x.price) + '</span></span></label>';
        }).join('') + '</div>' +
      '</details>' +

      '<div class="studio-auto">' + A.icon('shield') +
        '<div><label><input type="checkbox" id="stAuto"' + (state.autoSave ? ' checked' : '') + '> ' +
        L('Auto-save this plan', 'यह योजना स्वतः सहेजें') + '</label>' +
        '<div>' + L('Your inputs, checklist and city stay on this device. Nothing is uploaded.', 'आपके इनपुट, सूची और शहर इसी डिवाइस पर रहते हैं। कुछ भी अपलोड नहीं होता।') + '</div></div>' +
      '</div>' +

      '<div class="studio-cta">' +
        '<button type="submit" class="btn btn--primary w-full">' + A.icon('spark') + ' ' + L('Find my muhurat', 'मेरा मुहूर्त खोजें') + '</button>' +
        '<button type="button" class="btn btn--ghost w-full" id="stAutoPick">' + A.icon('star') + ' ' + L('Auto-pick the best day', 'सर्वोत्तम दिन स्वतः चुनें') + '</button>' +
      '</div>' +
      '<p class="studio-footnote">' + L('Computed from your city’s sunrise. Final muhurat is confirmed by the pandit.', 'आपके शहर के सूर्योदय से गणना। अंतिम मुहूर्त पंडित जी पुष्ट करेंगे।') + '</p>';

    renderMarket();
    renderCityMeta();
  }

  function renderMarket() {
    var el = $('#stMarket');
    if (!el) return;
    var p = findPooja();
    el.innerHTML = '<b>' + esc(ritualName(p)) + '</b> · ' + esc(p.duration) +
      ' · <span class="mrp">' + money(p.mrp || p.price) + '</span> ' + money(p.price) +
      ' <span class="tiny">' + L('all-inclusive', 'सर्व-समावेशी') + '</span>';
  }

  function renderCityMeta() {
    var el = $('#stCityMeta');
    if (!el) return;
    var c = findCity();
    el.textContent = c ? A.cityMeta(c) : '';
  }

  /* ----------------------------------------------------------- scoring */
  function overlaps(a1, a2, b1, b2) {
    if (!a1 || !a2 || !b1 || !b2) return false;
    return a1.getTime() < b2.getTime() && b1.getTime() < a2.getTime();
  }

  function scoreDay(pc, rule) {
    var score = 52, pros = [], cons = [];
    var purnima = pc.tithi.name === 'Purnima';
    var amavasya = pc.tithi.name === 'Amavasya';

    if (pc.tithi.paksha === 'Shukla') {
      score += 8;
      pros.push(L('Shukla paksha — the waxing fortnight is preferred for new beginnings',
        'शुक्ल पक्ष — नए कार्यों के लिए श्रेष्ठ'));
    } else {
      score -= 3;
      cons.push(L('Krishna paksha — better for shanti, daan and completion than for a fresh start',
        'कृष्ण पक्ष — नई शुरुआत से अधिक शांति, दान व समापन के लिए'));
    }

    if (purnima) {
      if (rule.key === 'katha') {
        score += 26;
        pros.push(L('Purnima — the traditional day for Satyanarayan katha and family vrats',
          'पूर्णिमा — सत्यनारायण कथा व पारिवारिक व्रत का पारंपरिक दिन'));
      } else {
        score += 6;
        pros.push(L('Purnima adds fullness and a receptive mind to family rituals',
          'पूर्णिमा पारिवारिक अनुष्ठान में पूर्णता जोड़ती है'));
      }
    } else if (amavasya) {
      score -= 16;
      cons.push(L('Amavasya is for pitru tarpan, not auspicious beginnings',
        'अमावस्या पितृ तर्पण के लिए है, शुभ आरंभ के लिए नहीं'));
    } else {
      if (rule.goodT.indexOf(pc.tithi.num) >= 0) {
        score += 13;
        pros.push(L(T('tithi', pc.tithi.name) + ' is a shubh tithi for ' + rule.en,
          T('tithi', pc.tithi.name) + ' तिथि ' + rule.hi + ' के लिए शुभ है'));
      }
      if (rule.badT.indexOf(pc.tithi.num) >= 0) {
        score -= 18;
        cons.push(L(pc.tithi.name + ' is a rikta / avoided tithi for this ritual',
          pc.tithi.name + ' तिथि इस अनुष्ठान के लिए टाली जाती है'));
      }
    }

    if (rule.goodN.indexOf(pc.nakshatra.index) >= 0) {
      score += 12;
      pros.push(L(T('nakshatra', pc.nakshatra.name) + ' nakshatra supports ' + rule.en,
        T('nakshatra', pc.nakshatra.name) + ' नक्षत्र ' + rule.hi + ' के अनुकूल है'));
    } else if (rule.badN.indexOf(pc.nakshatra.index) >= 0) {
      score -= 14;
      cons.push(L(pc.nakshatra.name + ' nakshatra is traditionally avoided for this ritual',
        pc.nakshatra.name + ' नक्षत्र पारंपरिक रूप से टाला जाता है'));
    }

    if (rule.goodWd.indexOf(pc.weekdayIndex) >= 0) {
      score += 6;
      pros.push(L(pc.weekday + ' is a favourable weekday for this ritual',
        pc.weekdayHi + 'वार इस अनुष्ठान के लिए अनुकूल है'));
    } else if (rule.badWd.indexOf(pc.weekdayIndex) >= 0) {
      score -= 7;
      cons.push(L(pc.weekday + ' is not ideal for new beginnings',
        pc.weekdayHi + 'वार नई शुरुआत के लिए उपयुक्त नहीं'));
    }

    if (!pc.yoga.shubh) {
      score -= 7;
      cons.push(L('Yoga ' + pc.yoga.name + ' is a caution yoga',
        pc.yoga.name + ' योग सावधानी वाला है'));
    }
    if (pc.bhadra.active) {
      score -= 14;
      cons.push(L('Bhadra (Vishti karana) is running at sunrise — avoid the main muhurat',
        'सूर्योदय पर भद्रा (विष्टि करण) है — मुख्य मुहूर्त टालें'));
    }
    if (pc.panchak.active) {
      score -= 5;
      cons.push(L('Panchak is active — some families avoid bhoomi, marriage and new beds',
        'पंचक चल रहा है — कुछ परिवार भूमि, विवाह व नई शय्या टालते हैं'));
    }
    if (pc.festivals && pc.festivals.length) {
      score += 4;
      pros.push(L(pc.festivals[0].name + ' falls on this day', 'इस दिन ' + pc.festivals[0].name + ' है'));
    }

    if (!pros.length) pros.push(L('The day has no major negative flag at sunrise', 'सूर्योदय पर कोई बड़ा दोष नहीं'));
    if (!cons.length) cons.push(L('No major avoid flag — still confirm the lagna with your pandit', 'कोई बड़ा दोष नहीं — लग्न पंडित जी से पुष्ट करें'));

    return { score: clamp(Math.round(score), 0, 100), pros: pros, cons: cons };
  }

  function windowsFor(pc) {
    var list = [];
    var now = Date.now() + 10 * 60000;
    var bonusByName = { Amrit: 22, Shubh: 16, Labh: 14, Char: 10 };

    function add(name, start, end, bonus, kind) {
      if (!start || !end) return;
      if (start.getTime() < pc.sunrise.getTime() || end.getTime() > pc.sunset.getTime()) return;
      if (end.getTime() <= now) return;
      if (overlaps(start, end, pc.rahu.start, pc.rahu.end)) return;
      if (overlaps(start, end, pc.gulika.start, pc.gulika.end)) return;
      if (overlaps(start, end, pc.yamaganda.start, pc.yamaganda.end)) return;
      list.push({
        name: name, kind: kind, start: start, end: end,
        score: clamp(52 + bonus, 0, 100), bonus: bonus
      });
    }

    pc.choghadiya.forEach(function (c) {
      if (c.good) add(c.name, c.start, c.end, bonusByName[c.name] || 8, 'choghadiya');
    });
    if (pc.weekdayIndex !== 3) add('Abhijit', pc.abhijit.start, pc.abhijit.end, 26, 'abhijit');

    list.sort(function (a, b) { return b.score - a.score; });
    var kept = [];
    list.forEach(function (w) {
      var clash = kept.some(function (k) { return overlaps(w.start, w.end, k.start, k.end); });
      if (!clash) kept.push(w);
    });
    return kept.slice(0, 4);
  }

  /* ---------------------------------------------------------------- scan */
  function scan() {
    var pooja = findPooja();
    var rule = ruleFor(pooja);
    var place = findCity();
    if (!place) return;

    var token = ++scanToken;
    var total = clamp(Number(state.days) || 45, 7, 90);
    var base = V.localParts(new Date(), place.tz);
    var i = 0;
    results = [];
    ranked = [];
    state.selected = 0;
    scanning = true;
    lastDayKey = dayKeyNow();
    var host = $('#studioResult');
    if (host) host.setAttribute('aria-busy', 'true');

    renderScan(0, total, pooja);

    function chunk() {
      if (token !== scanToken) return;
      var end = Math.min(total, i + 3);
      for (; i < end; i++) {
        var dt = new Date(Date.UTC(base.y, base.m - 1, base.d + i, 12));
        var y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
        var pc = V.panchang(y, m, d, place);
        var day = scoreDay(pc, rule);
        var wins = windowsFor(pc);
        var best = wins[0] || null;
        var totalScore = best
          ? Math.round(day.score * 0.72 + best.score * 0.28)
          : Math.round(day.score * 0.55);
        results.push({
          pc: pc, score: clamp(totalScore, 0, 100), dayScore: day.score,
          pros: day.pros, cons: day.cons, windows: wins,
          key: y + '-' + pad(m) + '-' + pad(d), ts: pc.sunrise.getTime()
        });
      }
      renderScan(i, total, pooja);
      if (i < total) setTimeout(chunk, 10);
      else finishScan();
    }
    setTimeout(chunk, 30);
  }

  function finishScan() {
    scanning = false;
    ranked = results.filter(function (r) { return r.windows.length; })
      .sort(function (a, b) { return b.score - a.score || a.ts - b.ts; });
    if (!ranked.length) {
      ranked = results.slice().sort(function (a, b) { return b.score - a.score; });
    }
    if (pendingDate) {
      var pick = ranked.filter(function (r) { return r.key === pendingDate; })[0];
      if (pick) state.selected = ranked.indexOf(pick);
      pendingDate = '';
    }
    if (state.selected >= ranked.length) state.selected = 0;
    var host = $('#studioResult');
    if (host) host.setAttribute('aria-busy', 'false');
    renderResults();
    syncHash();
  }

  function rankedResults() { return ranked; }

  /* -------------------------------------------------------------- render */
  function renderScan(done, total, pooja) {
    var el = $('#studioResult');
    if (!el) return;
    var pct = total ? Math.round(done / total * 100) : 0;
    el.innerHTML =
      '<div class="studio-scan" role="status" aria-live="polite">' +
        '<div class="studio-scan__ring" aria-hidden="true"></div>' +
        '<h3>' + L('Scanning the next ' + total + ' days', 'अगले ' + total + ' दिनों की गणना') + '</h3>' +
        '<p>' + L('Checking tithi, nakshatra, yoga, karana, bhadra, panchak and every Rahu, Gulika and Yamaganda window for ', 'तिथि, नक्षत्र, योग, करण, भद्रा, पंचक और राहु, गुलिक, यमगंड की जाँच ') +
          '<b>' + esc(ritualName(pooja)) + '</b> ' + L('in', 'के लिए') + ' <b>' + esc(cityLabel()) + '</b>.</p>' +
        '<div class="studio-progress"><span style="width:' + pct + '%"></span></div>' +
        '<div class="studio-scan__count">' + done + ' / ' + total + ' ' + L('days computed', 'दिन पूर्ण') + '</div>' +
      '</div>';
  }

  function dateParts(d) {
    var tz = findCity().tz;
    return V.localParts(d, tz);
  }
  function fmt(t) {
    if (!t) return '—';
    return V.fmtTime(t, findCity().tz);
  }
  function longDate(d) {
    var tz = findCity().tz, p = V.localParts(d, tz);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return p.d + ' ' + months[p.m - 1] + ' ' + p.y;
  }

  function bestWindow(r) {
    return (r.windows && r.windows[0]) || {
      name: 'Abhijit', start: r.pc.abhijit.start, end: r.pc.abhijit.end, score: 70
    };
  }

  function renderResults() {
    var el = $('#studioResult');
    if (!el) return;
    var best = ranked[clamp(state.selected, 0, Math.max(0, ranked.length - 1))];
    if (!best) {
      el.innerHTML =
        '<div class="studio-empty">' + A.icon('moon') +
          '<h3>' + L('No clean window in this range', 'इस अवधि में कोई शुभ समय नहीं') + '</h3>' +
          '<p>' + L('Every day in the range is carrying a strong avoid flag. Widen the range, change the city, or ask a pandit to check a specific lagna.', 'इस पूरी अवधि में दोष है। अवधि बढ़ाएँ, शहर बदलें या पंडित जी से विशेष लग्न जाँच कराएँ।') + '</p>' +
        '</div>';
      return;
    }

    var pooja = findPooja();
    var win = bestWindow(best);
    var p = dateParts(win.start);
    var current = L('Best match', 'सर्वोत्तम') + ' · ' + (ranked.indexOf(best) + 1) + ' / ' + ranked.length;

    el.innerHTML =
      '<section class="studio-best" aria-labelledby="studioBestTitle">' +
        '<div>' +
          '<span class="studio-best__tag">' + A.icon('spark') + ' ' + current + '</span>' +
          '<h2 id="studioBestTitle">' + longDate(win.start) + '</h2>' +
          '<div class="studio-best__day">' + esc(pcWeekday(best.pc)) + ' · ' + esc(cityLabel()) + '</div>' +
          '<div class="studio-best__time">' + A.icon('clock') + ' ' + fmt(win.start) + ' – ' + fmt(win.end) + ' <span class="tiny" style="opacity:.55">(' + esc(win.name) + ')</span></div>' +
          '<div class="studio-best__meta">' +
            '<span>' + T('paksha', best.pc.tithi.paksha) + ' ' + T('tithi', best.pc.tithi.name) + '</span>' +
            '<span>' + T('nakshatra', best.pc.nakshatra.name) + '</span>' +
            '<span>' + esc(ritualName(pooja)) + '</span>' +
            '<span>' + state.guests + ' ' + L('guests', 'अतिथि') + '</span>' +
          '</div>' +
          '<div class="studio-best__actions">' +
            '<a class="btn btn--gold" href="' + bookUrl(best, pooja) + '">' + L('Book this muhurat', 'यह मुहूर्त बुक करें') + '</a>' +
            '<button type="button" class="btn btn--light" data-act="ics">' + A.icon('calendar') + ' ' + L('Add to calendar', 'कैलेंडर में जोड़ें') + '</button>' +
            '<button type="button" class="btn btn--light" data-act="wa">' + A.icon('wa') + ' WhatsApp</button>' +
            '<button type="button" class="btn btn--light" data-act="copy">' + L('Copy plan', 'योजना कॉपी') + '</button>' +
          '</div>' +
          '<div class="studio-best__count">' + A.icon('clock') + ' <span data-count="' + win.start.getTime() + '">' + countdown(win.start.getTime()) + '</span></div>' +
        '</div>' +
        '<div class="studio-score">' +
          '<div class="studio-score__dial" style="--pct:' + best.score + '" role="img" aria-label="' + L('Muhurat score', 'मुहूर्त स्कोर') + ' ' + best.score + ' ' + L('out of 100', 'में से 100') + '">' +
            '<div class="studio-score__val">' + best.score + '<small>/ 100</small></div>' +
          '</div>' +
          '<div class="studio-score__label">' + L('Muhurat score', 'मुहूर्त स्कोर') + '</div>' +
        '</div>' +
      '</section>' +

      whyHtml(best) +
      panchBar(best) +
      windowsHtml(ranked) +
      blueprintHtml(best, pooja, win) +
      methodologyHtml();

    bindResult();
  }

  function pcWeekday(pc) {
    return A.isHi() ? (pc.weekdayHi + 'वार') : pc.weekday;
  }

  function whyHtml(best) {
    return '<div class="studio-why">' +
      '<div class="studio-why__card studio-why__card--pro"><h4>' + A.icon('check') + ' ' + L('Why this day works', 'यह दिन क्यों उपयुक्त है') + '</h4><ul>' +
        best.pros.slice(0, 5).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="studio-why__card studio-why__card--con"><h4>' + A.icon('alert') + ' ' + L('What to keep in mind', 'ध्यान रखें') + '</h4><ul>' +
        best.cons.slice(0, 5).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul></div>' +
    '</div>';
  }

  function panchBar(best) {
    var pc = best.pc, win = bestWindow(best);
    var cells = [
      [L('Tithi', 'तिथि'), T('tithi', pc.tithi.name)],
      [L('Nakshatra', 'नक्षत्र'), T('nakshatra', pc.nakshatra.name)],
      [L('Yoga', 'योग'), T('yoga', pc.yoga.name)],
      [L('Karana', 'करण'), pc.karana.name],
      [L('Rahu Kaal', 'राहु काल'), fmt(pc.rahu.start) + '–' + fmt(pc.rahu.end), 'danger'],
      [L('Window', 'समय'), fmt(win.start) + '–' + fmt(win.end), 'good']
    ];
    return '<div class="studio-panch">' + cells.map(function (c) {
      return '<div' + (c[2] ? ' class="' + c[2] + '"' : '') + '><span>' + esc(c[0]) + '</span><b>' + esc(c[1]) + '</b></div>';
    }).join('') + '</div>';
  }

  function windowsHtml(list) {
    var top = list.slice(0, 8);
    return '<section class="studio-windows" aria-labelledby="studioWindowsTitle">' +
      '<div class="studio-windows__head"><h3 id="studioWindowsTitle">' + L('Other clean windows', 'अन्य शुभ समय') + '</h3>' +
      '<span>' + L('Tap one to rebuild the blueprint', 'योजना बदलने के लिए चुनें') + '</span></div>' +
      '<div class="studio-window-list">' + top.map(function (r, i) {
        var w = bestWindow(r), lp = dateParts(w.start);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return '<button type="button" class="studio-window' + (i === state.selected ? ' is-active' : '') + '" data-window="' + i + '" aria-pressed="' + (i === state.selected) + '">' +
          '<span class="studio-window__date"><b>' + lp.d + '</b><span>' + months[lp.m - 1] + '</span></span>' +
          '<span class="studio-window__body"><b>' + T('tithi', r.pc.tithi.name) + ' · ' + fmt(w.start) + '–' + fmt(w.end) + '</b>' +
          '<span>' + pcWeekday(r.pc) + ' · ' + T('nakshatra', r.pc.nakshatra.name) + ' · ' + esc(w.name) + '</span></span>' +
          '<span class="studio-window__score"><b>' + r.score + '</b><i>' + L('score', 'स्कोर') + '</i></span>' +
          '<span class="studio-window__bar"><i style="width:' + r.score + '%"></i></span>' +
        '</button>';
      }).join('') + '</div>' +
    '</section>';
  }

  /* ------------------------------------------------------------ blueprint */
  function blueprintHtml(best, pooja, win) {
    var tabs = [
      ['timeline', L('Timeline', 'समय-सारणी'), 'clock'],
      ['samagri', L('Samagri', 'सामग्री'), 'box'],
      ['budget', L('Budget', 'बजट'), 'rupee'],
      ['remind', L('Reminders', 'रिमाइंडर'), 'calendar']
    ];
    return '<section class="studio-blueprint" aria-labelledby="studioBlueprintTitle">' +
      '<div class="studio-windows__head"><h3 id="studioBlueprintTitle">' + L('Your ritual blueprint', 'आपकी पूजा योजना') + '</h3>' +
      '<span>' + L('Auto-generated for', 'स्वतः बनी') + ' ' + esc(ritualName(pooja)) + '</span></div>' +
      '<div class="studio-tabs" role="tablist">' + tabs.map(function (t) {
        return '<button type="button" class="studio-tab' + (state.tab === t[0] ? ' is-active' : '') + '" role="tab" data-tab="' + t[0] + '" aria-selected="' + (state.tab === t[0]) + '">' +
          A.icon(t[2]) + ' ' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="studio-pane' + (state.tab === 'timeline' ? ' is-active' : '') + '" data-pane="timeline" data-print-title="' + L('Timeline', 'समय-सारणी') + '">' + timelineHtml(best, pooja, win) + '</div>' +
      '<div class="studio-pane' + (state.tab === 'samagri' ? ' is-active' : '') + '" data-pane="samagri" data-print-title="' + L('Samagri checklist', 'सामग्री सूची') + '">' + samagriHtml(pooja) + '</div>' +
      '<div class="studio-pane' + (state.tab === 'budget' ? ' is-active' : '') + '" data-pane="budget" data-print-title="' + L('Budget', 'बजट') + '">' + budgetHtml(pooja) + '</div>' +
      '<div class="studio-pane' + (state.tab === 'remind' ? ' is-active' : '') + '" data-pane="remind" data-print-title="' + L('Reminders', 'रिमाइंडर') + '">' + remindHtml(best, pooja, win) + '</div>' +
    '</section>';
  }

  function parseMinutes(d) {
    var s = String(d || '').toLowerCase();
    var n = parseFloat(s) || 2;
    if (s.indexOf('min') >= 0) return Math.max(15, Math.round(n));
    return Math.max(30, Math.round(n * 60));
  }

  function timelineHtml(best, pooja, win) {
    var total = parseMinutes(pooja.duration);
    var steps = [
      [45, L('Setup & samagri check', 'तैयारी व सामग्री जाँच'), L('Lay the chowki, keep the samagri tray on the right and the katha book on the left. Tick the samagri list before the pandit arrives.', 'चौकी बिछाएँ, सामग्री दाईं ओर और कथा पुस्तक बाईं ओर रखें। पंडित जी आने से पहले सूची पूरी करें।')],
      [15, L('Snan, altar & sankalp', 'स्नान, वेदी व संकल्प'), L('Family bathes and wears clean clothes. The pandit states the sankalp with your name, gotra and purpose.', 'परिवार स्नान कर स्वच्छ वस्त्र पहने। पंडित जी आपके नाम, गोत्र व संकल्प के साथ शुरुआत करें।')],
      [Math.max(10, Math.round(total * 0.12)), L('Ganpati vandana & kalash sthapana', 'गणपति वंदना व कलश स्थापना'), L('Ganesh invocation, kalash and Navgrah sthapana, then the family is seated for the main ritual.', 'गणेश वंदना, कलश व नवग्रह स्थापना, फिर परिवार मुख्य अनुष्ठान के लिए बैठे।')],
      [Math.max(30, Math.round(total * 0.55)), L('Main ritual — ' + pooja.name, 'मुख्य अनुष्ठान — ' + ritualName(pooja)), L('The heart of the ceremony: katha, havan or abhishek as per the chosen package. Keep phones away and follow the pandit’s cues.', 'समारोह का मुख्य भाग: कथा, हवन या अभिषेक। फोन दूर रखें और पंडित जी के निर्देशों का पालन करें।')],
      [Math.max(8, Math.round(total * 0.1)), L('Aarti & purnahuti', 'आरती व पूर्णाहुति'), L('Family joins the aarti. The pandit completes the purnahuti and ties the raksha kalava.', 'परिवार आरती में शामिल हो। पंडित जी पूर्णाहुति कर रक्षा कलावा बाँधें।')],
      [Math.max(7, Math.round(total * 0.1)), L('Prasad, daan & visarjan', 'प्रसाद, दान व विसर्जन'), L('Prasad is distributed, dakshina is offered and flowers are collected for respectful visarjan.', 'प्रसाद बाँटें, दक्षिणा अर्पित करें और फूलों का विधिपूर्वक विसर्जन करें।')]
    ];
    var t = win.start.getTime() - steps[0][0] * 60000;
    var rows = steps.map(function (s, i) {
      var start = new Date(t);
      t += s[0] * 60000;
      return '<li' + (i === 3 ? ' class="is-key"' : '') + '>' +
        '<span class="studio-timeline__dot">' + (i + 1) + '</span>' +
        '<span class="studio-timeline__time">' + fmt(start) + ' · ' + s[0] + ' ' + L('min', 'मिनट') + '</span>' +
        '<div class="studio-timeline__title">' + esc(s[1]) + '</div>' +
        '<p class="studio-timeline__desc">' + esc(s[2]) + '</p>' +
      '</li>';
    }).join('');

    return '<div class="studio-samagri-head"><p>' + L('Anchored to your muhurat on', 'आपके मुहूर्त पर आधारित') + ' <b>' + longDate(win.start) + ', ' + fmt(win.start) + '</b>. ' +
      L('Total ritual window', 'कुल अवधि') + ': <b>' + total + ' ' + L('minutes', 'मिनट') + '</b>.</p>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-act="print">' + A.icon('print') + ' ' + L('Print', 'प्रिंट') + '</button></div>' +
      '<ol class="studio-timeline">' + rows + '</ol>';
  }

  function qtyFor(name, guests) {
    var n = String(name).toLowerCase();
    if (/flower|garland|phool|mala/.test(n)) return Math.max(1, Math.ceil(guests / 8)) + ' ' + L('bunch', 'गुच्छा');
    if (/prasad|panjiri|bhog|laddu|fruit|sweets/.test(n)) return guests + ' ' + L('portions', 'भाग');
    if (/ghee/.test(n)) return Math.max(1, Math.ceil(guests / 15)) + ' kg';
    if (/havan|samagri|wood|samidha|kund/.test(n)) return Math.max(1, Math.ceil(guests / 20)) + ' ' + L('pack', 'पैकेट');
    if (/coconut/.test(n)) return String(Math.max(1, Math.ceil(guests / 12)));
    if (/kalash|kalava|diya|yantra|murti|idol|shivling|book|nag-nagin|rudraksha/.test(n)) return L('1 set', '1 सेट');
    if (/milk|curd|honey|gangajal|water/.test(n)) return Math.max(1, Math.ceil(guests / 10)) + ' ' + L('litre', 'लीटर');
    if (/rice|akshata|dal|grain|til|sesame|masoor/.test(n)) return Math.max(1, Math.ceil(guests / 15)) + ' ' + L('pack', 'पैकेट');
    if (/cloth|saree|dhoti/.test(n)) return String(Math.max(1, Math.ceil(guests / 25)));
    return L('1', '1');
  }

  function samagriHtml(pooja) {
    var items = pooja.samagri || [];
    var doneKey = function (name) { return state.poojaId + '|' + name; };
    var doneCount = items.filter(function (n) { return state.done.indexOf(doneKey(n)) >= 0; }).length;
    return '<div class="studio-samagri-head"><p>' + L('Scaled for', 'अनुसार') + ' <b>' + state.guests + ' ' + L('guests', 'अतिथि') + '</b>. ' +
      L('Tick items as you arrange them — the checklist is saved on this device.', 'व्यवस्था के अनुसार टिक करें — सूची इस डिवाइस पर सहेजी जाती है।') + '</p>' +
      '<span class="chip chip--gold">' + doneCount + ' / ' + items.length + ' ' + L('ready', 'तैयार') + '</span></div>' +
      '<div class="studio-samagri">' + items.map(function (name, i) {
        var done = state.done.indexOf(doneKey(name)) >= 0;
        return '<label class="studio-item' + (done ? ' is-done' : '') + '">' +
          '<input type="checkbox" data-samagri="' + esc(name) + '"' + (done ? ' checked' : '') + '>' +
          '<span class="studio-item__txt"><span class="name">' + esc(name) + '</span></span>' +
          '<span class="qty">' + esc(qtyFor(name, state.guests)) + '</span>' +
        '</label>';
      }).join('') + '</div>' +
      '<div class="studio-samagri-foot"><span>' + L('Included in the package price. Extra flowers or a larger havan can be added from Add-ons.', 'पैकेज मूल्य में शामिल। अधिक फूल या बड़ा हवन अतिरिक्त सेवाओं से जोड़ें।') + '</span>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-act="clearsamagri">' + L('Clear ticks', 'टिक हटाएँ') + '</button></div>';
  }

  function budgetHtml(pooja) {
    var extras = selectedExtras();
    var extraTotal = extras.reduce(function (s, x) { return s + x.price; }, 0);
    var base = Number(pooja.price) || 0;
    var gst = Math.round((base + extraTotal) * 0.18);
    var total = base + extraTotal + gst;
    var save = Math.max(0, (Number(pooja.mrp) || base) - base);
    return '<div class="studio-budget">' +
      '<div class="studio-budget__card">' +
        '<h4>' + L('Transparent estimate', 'पारदर्शी अनुमान') + '</h4>' +
        '<div class="studio-budget__row"><span>' + esc(ritualName(pooja)) + '</span><b>' + money(base) + '</b></div>' +
        (extras.length ? extras.map(function (x) {
          return '<div class="studio-budget__row"><span>' + esc(x.name) + '</span><b>' + money(x.price) + '</b></div>';
        }).join('') : '<div class="studio-budget__row"><span>' + L('Add-ons', 'अतिरिक्त सेवाएँ') + '</span><b>—</b></div>') +
        '<div class="studio-budget__row"><span>' + L('GST (18%)', 'जीएसटी (18%)') + '</span><b>' + money(gst) + '</b></div>' +
        '<div class="studio-budget__row studio-budget__row--total"><span>' + L('Total', 'कुल') + '</span><b>' + money(total) + '</b></div>' +
        '<p class="studio-budget__note">' + L('The final invoice is generated after pandit assignment. Samagri, flowers and dakshina are already inside the package price.', 'पंडित नियुक्ति के बाद अंतिम बिल बनेगा। सामग्री, फूल व दक्षिणा पैकेज मूल्य में शामिल हैं।') + '</p>' +
      '</div>' +
      '<div class="studio-budget__card studio-budget__card--dark">' +
        '<h4>' + L('What the package includes', 'पैकेज में क्या शामिल') + '</h4>' +
        '<ul class="studio-budget__list">' + (pooja.includes || []).map(function (x) {
          return '<li>' + A.icon('check') + ' <span>' + esc(x) + '</span></li>';
        }).join('') + '</ul>' +
        (save ? '<div class="studio-budget__row studio-budget__row--total"><span>' + L('You save', 'आपकी बचत') + '</span><b>' + money(save) + '</b></div>' : '') +
        '<p class="studio-budget__note">' + L('Prices are recomputed on the server at checkout, so the amount you see here is the amount that is stored.', 'चेकआउट पर सर्वर मूल्य की पुनर्गणना करता है, इसलिए यहाँ दिख रही राशि ही सहेजी जाती है।') + '</p>' +
      '</div>' +
    '</div>';
  }

  function reminderText(best, pooja, win) {
    var name = state.name ? state.name : L('a family', 'एक परिवार');
    return L(
      'Namaste! I would like to book ' + pooja.name + '.\n' +
      'Date: ' + longDate(win.start) + '\n' +
      'Muhurat: ' + fmt(win.start) + ' – ' + fmt(win.end) + ' (' + win.name + ')\n' +
      'City: ' + cityLabel() + '\n' +
      'Family: ' + state.guests + ' guests · Gotra: ' + state.gotra + '\n' +
      'Name: ' + name + '\n' +
      'Muhurat score: ' + best.score + '/100',
      'नमस्ते! मैं ' + ritualName(pooja) + ' बुक करना चाहता/चाहती हूँ।\n' +
      'तिथि: ' + longDate(win.start) + '\n' +
      'मुहूर्त: ' + fmt(win.start) + ' – ' + fmt(win.end) + ' (' + win.name + ')\n' +
      'शहर: ' + cityLabel() + '\n' +
      'परिवार: ' + state.guests + ' अतिथि · गोत्र: ' + state.gotra + '\n' +
      'नाम: ' + name + '\n' +
      'मुहूर्त स्कोर: ' + best.score + '/100'
    );
  }

  function remindHtml(best, pooja, win) {
    var msg = reminderText(best, pooja, win);
    return '<div class="studio-remind">' +
      '<div class="studio-remind__card"><h4>' + L('Phone calendar', 'फोन कैलेंडर') + '</h4>' +
        '<p>' + L('Downloads an .ics file with a one-day-before alarm. Works with Google Calendar, Apple Calendar and Outlook, online or offline.', 'एक दिन पहले अलार्म के साथ .ics फ़ाइल। Google, Apple और Outlook कैलेंडर में काम करती है।') + '</p>' +
        '<button type="button" class="btn btn--primary btn--sm" data-act="ics">' + A.icon('download') + ' ' + L('Download .ics', '.ics डाउनलोड') + '</button></div>' +
      '<div class="studio-remind__card"><h4>Google Calendar</h4>' +
        '<p>' + L('Opens a pre-filled event with the muhurat, city and ritual details. Save it in one tap.', 'मुहूर्त, शहर व अनुष्ठान विवरण के साथ इवेंट खुलता है। एक टैप में सहेजें।') + '</p>' +
        '<a class="btn btn--ghost btn--sm" href="' + googleUrl(best, pooja, win) + '" target="_blank" rel="noopener">' + A.icon('calendar') + ' ' + L('Open Google Calendar', 'Google Calendar खोलें') + '</a></div>' +
      '<div class="studio-remind__card"><h4>' + L('WhatsApp reminder', 'व्हाट्सएप रिमाइंडर') + '</h4>' +
        '<p>' + L('Sends the full plan to the seva number. The pandit can confirm availability and suggest a lagna-specific tweak.', 'पूरी योजना सेवा नंबर पर भेजें। पंडित जी उपलब्धता व लग्न सुधार बता सकेंगे।') + '</p>' +
        '<button type="button" class="btn btn--whatsapp btn--sm" data-act="wa">' + A.icon('wa') + ' ' + L('WhatsApp the pandit', 'पंडित जी को भेजें') + '</button></div>' +
      '<div class="studio-remind__card"><h4>' + L('Share or print', 'साझा या प्रिंट') + '</h4>' +
        '<p>' + L('Copy the plan for the family group, or print a clean one-page runbook for the day.', 'परिवार समूह के लिए योजना कॉपी करें या एक पृष्ठ की साफ़ योजना प्रिंट करें।') + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn--ghost btn--sm" data-act="copy">' + L('Copy', 'कॉपी') + '</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-act="print">' + A.icon('print') + ' ' + L('Print', 'प्रिंट') + '</button></div></div>' +
      '<div class="studio-remind__card studio-remind__card--wide"><h4>' + L('Message preview', 'संदेश पूर्वावलोकन') + '</h4>' +
        '<div class="studio-msg">' + esc(msg) + '</div></div>' +
    '</div>';
  }

  function methodologyHtml() {
    return '<div class="studio-method">' +
      '<h3>' + L('How this muhurat is calculated', 'यह मुहूर्त कैसे निकाला जाता है') + '</h3>' +
      '<p>' + L('The scanner recomputes the panchang for every day in your range from the city’s sunrise using the Lahiri (Chitrapaksha) ayanamsa. It then scores the tithi, nakshatra, weekday, yoga, karana, bhadra, panchak and festivals against the traditional preference set for the selected ritual.', 'स्कैनर आपके शहर के सूर्योदय से लाहिरी अयनांश के अनुसार हर दिन का पंचांग फिर से निकालता है। फिर तिथि, नक्षत्र, वार, योग, करण, भद्रा, पंचक व पर्व को चुने गए अनुष्ठान के पारंपरिक नियमों से अंक देता है।') + '</p>' +
      '<p>' + L('The time window is the cleanest available block: Abhijit muhurat or a good choghadiya (Amrit, Shubh, Labh, Char) that does not overlap Rahu Kaal, Gulika or Yamaganda. Windows already past today are skipped.', 'समय खंड सबसे स्वच्छ उपलब्ध होता है: अभिजीत मुहूर्त या शुभ चौघड़िया (अमृत, शुभ, लाभ, चर) जो राहु काल, गुलिक या यमगंड से न टकराए। बीते हुए समय छोड़ दिए जाते हैं।') + '</p>' +
      '<p><b>' + L('Important:', 'ध्यान दें:') + '</b> ' + L('A complete muhurat also checks the lagna, navamsa and the family’s own sampradaya. Use this score to shortlist a date, then let the pandit confirm it before any booking is final.', 'पूर्ण मुहूर्त में लग्न, नवांश और पारिवारिक संप्रदाय भी देखा जाता है। इस स्कोर से तिथि चुनें, अंतिम पुष्टि पंडित जी से कराएँ।') + '</p>' +
    '</div>';
  }

  /* -------------------------------------------------------------- actions */
  function bookUrl(best, pooja) {
    var w = bestWindow(best);
    var key = best.key || V.dateKey(w.start, findCity().tz);
    return 'booking.html?pooja=' + encodeURIComponent(pooja.id) + '&date=' + encodeURIComponent(key);
  }

  function planText(best, pooja, win) {
    return reminderText(best, pooja, win) +
      '\n\n' + L('Prepared with the Muhurat Studio — computed panchang, not copied.', 'मुहूर्त स्टूडियो से तैयार — गणना किया पंचांग, नकल नहीं।');
  }

  function icsDate(d) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function icsFor(best, pooja, win) {
    var total = Math.max(30, parseMinutes(pooja.duration));
    var end = new Date(win.start.getTime() + total * 60000);
    var desc = reminderText(best, pooja, win).replace(/\r?\n/g, '\\n');
    var summary = ritualName(pooja) + ' · ' + win.name;
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vedic Pooja//Muhurat Studio//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:muhurat-' + best.key + '-' + pooja.id + '@panditapp',
      'DTSTAMP:' + icsDate(new Date()),
      'DTSTART:' + icsDate(win.start),
      'DTEND:' + icsDate(end),
      'SUMMARY:' + summary,
      'LOCATION:' + cityLabel(),
      'DESCRIPTION:' + desc,
      'STATUS:CONFIRMED', 'TRANSP:OPAQUE',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
      'DESCRIPTION:' + ritualName(pooja) + ' tomorrow — ' + fmt(win.start),
      'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY',
      'DESCRIPTION:' + ritualName(pooja) + ' starts in 2 hours',
      'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
  }

  function googleUrl(best, pooja, win) {
    var total = Math.max(30, parseMinutes(pooja.duration));
    var end = new Date(win.start.getTime() + total * 60000);
    var q = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent(ritualName(pooja) + ' · ' + win.name),
      'dates=' + icsDate(win.start) + '/' + icsDate(end),
      'details=' + encodeURIComponent(reminderText(best, pooja, win)),
      'location=' + encodeURIComponent(cityLabel()),
      'ctz=' + encodeURIComponent(findCity().tz || 'Asia/Kolkata')
    ].join('&');
    return 'https://calendar.google.com/calendar/render?' + q;
  }

  function waUrl(best, pooja, win) {
    var phone = (A.owner && A.owner.phone) || '918889685370';
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(planText(best, pooja, win));
  }

  function downloadIcs(name, text) {
    try {
      var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      return true;
    } catch (e) { return false; }
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(fallback);
    }
    return Promise.resolve(fallback());
  }

  function current() {
    var b = ranked[clamp(state.selected, 0, Math.max(0, ranked.length - 1))];
    if (!b) return null;
    return { best: b, pooja: findPooja(), win: bestWindow(b) };
  }

  function act(name) {
    var c = current();
    if (!c) return;
    var best = c.best, pooja = c.pooja, win = c.win;
    if (name === 'ics') {
      var ok = downloadIcs('muhurat-' + best.key + '-' + pooja.id + '.ics', icsFor(best, pooja, win));
      A.toast(ok
        ? L('Calendar file ready — open it to add the muhurat with reminders', 'कैलेंडर फ़ाइल तैयार — रिमाइंडर के साथ मुहूर्त जोड़ें')
        : L('Could not create the calendar file', 'कैलेंडर फ़ाइल नहीं बन सकी'), ok ? '' : 'error');
    } else if (name === 'wa') {
      window.open(waUrl(best, pooja, win), '_blank', 'noopener');
    } else if (name === 'copy') {
      copyText(planText(best, pooja, win)).then(function (ok) {
        A.toast(ok ? L('Plan copied to the clipboard', 'योजना क्लिपबोर्ड पर कॉपी हुई') : L('Could not copy the plan', 'योजना कॉपी नहीं हुई'), ok ? '' : 'error');
      });
    } else if (name === 'print') {
      window.print();
    } else if (name === 'clearsamagri') {
      var prefix = state.poojaId + '|';
      state.done = state.done.filter(function (k) { return k.indexOf(prefix) !== 0; });
      save(); renderResults();
      A.toast(L('Checklist cleared', 'सूची साफ़ हुई'));
    }
  }

  function bindResult() {
    /* delegated below in init(); kept as a no-op hook for future renderers */
  }

  /* ---------------------------------------------------------------- events */
  function bindEvents() {
    document.addEventListener('submit', function (e) {
      if (!e.target || e.target.id !== 'studioForm') return;
      e.preventDefault();
      readForm();
      save();
      scan();
      var res = $('#studioResult');
      if (res && res.scrollIntoView) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('input', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'stPoojaSearch') {
        var sel = $('#stPooja');
        if (sel) sel.innerHTML = poojaOptions(t.value);
      } else if (t.id === 'stCitySearch') {
        var cs = $('#stCity');
        if (cs) cs.innerHTML = A.cityOptions(state.city, t.value);
      }
    });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'stPooja') {
        state.poojaId = t.value;
        renderMarket(); save();
        if (!scanning && ranked.length) scan();
      } else if (t.id === 'stCity') {
        state.city = t.value;
        renderCityMeta(); save();
        if (!scanning && ranked.length) scan();
      } else if (t.id === 'stDays' || t.id === 'stGuests' || t.id === 'stGotra') {
        readForm(); save();
        if (t.id === 'stGuests' && ranked.length && !scanning) renderResults();
      } else if (t.id === 'stName' || t.id === 'stAuto') {
        readForm(); save();
      } else if (t.getAttribute && t.getAttribute('data-extra') !== null) {
        readForm(); save();
        if (ranked.length && !scanning) renderResults();
      } else if (t.getAttribute && t.getAttribute('data-samagri') !== null) {
        var key = state.poojaId + '|' + t.getAttribute('data-samagri');
        var at = state.done.indexOf(key);
        if (t.checked && at < 0) state.done.push(key);
        if (!t.checked && at >= 0) state.done.splice(at, 1);
        save();
        var label = t.closest ? t.closest('.studio-item') : null;
        if (label) label.classList.toggle('is-done', t.checked);
        var chip = $('.studio-samagri-head .chip');
        if (chip) {
          var total = (findPooja().samagri || []).length;
          var prefix = state.poojaId + '|';
          var n = state.done.filter(function (k) { return k.indexOf(prefix) === 0; }).length;
          chip.textContent = n + ' / ' + total + ' ' + L('ready', 'तैयार');
        }
      }
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var win = t.closest('[data-window]');
      if (win) {
        state.selected = Number(win.getAttribute('data-window')) || 0;
        renderResults();
        syncHash();
        var best = $('#studioBestTitle');
        if (best && best.scrollIntoView) best.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      var tab = t.closest('[data-tab]');
      if (tab) {
        state.tab = tab.getAttribute('data-tab');
        save();
        $$('.studio-tab').forEach(function (b) {
          var on = b.getAttribute('data-tab') === state.tab;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        $$('.studio-pane').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-pane') === state.tab);
        });
        return;
      }
      var actEl = t.closest('[data-act]');
      if (actEl) {
        e.preventDefault();
        act(actEl.getAttribute('data-act'));
        return;
      }
      if (t.id === 'stAutoPick') {
        e.preventDefault();
        if (!ranked.length) {
          readForm(); scan();
        } else {
          state.selected = 0;
          renderResults();
          A.toast(L('Best day selected — scroll down for the blueprint', 'सर्वोत्तम दिन चुना — नीचे योजना देखें'));
        }
      }
    });
  }

  function readForm() {
    var p = $('#stPooja'); if (p && p.value) state.poojaId = p.value;
    var c = $('#stCity'); if (c && c.value) state.city = c.value;
    var d = $('#stDays'); if (d) state.days = Number(d.value) || 45;
    var g = $('#stGuests'); if (g) state.guests = clamp(Number(g.value) || 11, 1, 300);
    var go = $('#stGotra'); if (go) state.gotra = go.value;
    var n = $('#stName'); if (n) state.name = n.value.trim();
    var a = $('#stAuto'); if (a) state.autoSave = a.checked;
    state.extras = $$('#studioForm input[data-extra]:checked').map(function (x) { return x.getAttribute('data-extra'); });
  }

  /* ---------------------------------------------------------------- misc */
  function dayKeyNow() {
    var tz = findCity().tz;
    return V.dateKey(new Date(), tz);
  }

  function countdown(ts) {
    var diff = ts - Date.now();
    if (diff <= 0) return L('Window has started', 'समय आरंभ हो गया');
    var d = Math.floor(diff / DAY);
    var h = Math.floor((diff % DAY) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return d + L('d ', 'दिन ') + h + L('h to this window', 'घंटे शेष');
    if (h > 0) return h + L('h ', 'घंटे ') + m + L('m to this window', 'मिनट शेष');
    return m + L('m to this window', 'मिनट शेष');
  }

  function tick() {
    $$('[data-count]').forEach(function (el) {
      var ts = Number(el.getAttribute('data-count'));
      if (ts) el.textContent = countdown(ts);
    });
  }

  function syncHash() {
    var c = current();
    if (!c) return;
    try {
      var u = new URL(location.href);
      u.searchParams.set('pooja', state.poojaId);
      u.searchParams.set('city', findCity().name);
      u.searchParams.set('date', c.best.key);
      history.replaceState(null, '', u);
    } catch (e) { /* older browsers */ }
  }

  function readHash() {
    try {
      var p = new URLSearchParams(location.search);
      if (p.get('pooja')) state.poojaId = p.get('pooja');
      if (p.get('city')) state.city = p.get('city');
      if (p.get('date')) pendingDate = p.get('date');
    } catch (e) { /* ignore */ }
    if (!findPooja()) state.poojaId = D.POOJAS[0].id;
    if (!A.findCity(state.city)) state.city = 'Gurugram';
  }

  function init() {
    load();
    readHash();
    buildForm();
    bindEvents();
    renderScan(0, clamp(Number(state.days) || 45, 7, 90), findPooja());
    scan();
    lastDayKey = dayKeyNow();

    A.onLang(function () {
      buildForm();
      if (ranked.length) renderResults();
      else if (!scanning) renderScan(0, state.days, findPooja());
    });

    tick();
    timer = setInterval(function () {
      tick();
      if (state.autoSave && dayKeyNow() !== lastDayKey) {
        lastDayKey = dayKeyNow();
        scan();
      }
    }, 45000);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      tick();
      if (state.autoSave && dayKeyNow() !== lastDayKey) {
        lastDayKey = dayKeyNow();
        scan();
      }
    });

    root.addEventListener('pagehide', function () { if (timer) clearInterval(timer); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  root.MuhuratStudio = {
    scan: scan,
    state: state,
    results: function () { return results; },
    ranked: function () { return ranked; }
  };
})(window);
