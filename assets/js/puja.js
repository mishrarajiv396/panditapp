/* ==========================================================================
   Satyanarayan Puja Guide — interactions
   Tabs, local progress, samagri checklist, mantras (device voice),
   step timer, havan counter, katha reader, muhurat dates and sankalp.
   ========================================================================== */
(function () {
  'use strict';

  var A = window.App, V = window.Vedic, D = window.PanditData, P = window.PujaData;
  var SS = window.SITE_SETTINGS || {};
  var I = window.PujaI18n || null;
  if (!A || !V || !D || !P) return;

  var $ = A.$, $$ = A.$$, esc = A.esc;
  var KEY = 'vp_pj_';
  var MONTHS_HI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  var WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function load(k, d) { return A.store.get(KEY + k, d); }
  function save(k, v) { A.store.set(KEY + k, v); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, Number(n) || 0)); }

  function findCity(name) {
    return D.CITIES.filter(function (c) { return c.name === name; })[0] || D.CITIES[0];
  }

  var state = {
    city: findCity(load('city', D.CITIES[0].name)),
    family: clamp(load('family', 4), 1, 20),
    steps: Array.isArray(load('steps', [])) ? load('steps', []) : [],
    samagri: load('samagri', {}) || {},
    stepIndex: clamp(load('step', 0), 0, P.steps.length - 1),
    havan: Math.max(0, Number(load('havan', 0)) || 0),
    target: [11, 21, 108].indexOf(Number(load('target', 21))) >= 0 ? Number(load('target', 21)) : 21,
    bookmarks: Array.isArray(load('bookmarks', [])) ? load('bookmarks', []) : [],
    textSize: clamp(load('textsize', 0), -1, 2),
    theme: load('theme', document.documentElement.getAttribute('data-theme') || 'light'),
    lang: (function () {
      try {
        var v = localStorage.getItem('vp_lang');
        if (v === 'hi' || v === 'en') return v;
      } catch (e) { /* ignore */ }
      return load('lang', 'en') === 'hi' ? 'hi' : 'en';
    })(),
    sankalp: load('sankalp', null)
  };

  /* ------------------------------------------------------------- language */
  function isHi() { return state.lang === 'hi'; }
  function t(key, vars) { return I ? I.t(state.lang, key, vars) : key; }
  function pick(en, hi) { return isHi() && hi ? hi : en; }
  function monthName(m) { return isHi() ? MONTHS_HI[m - 1] : MONTHS_EN[m - 1]; }
  function weekdayName(en, hi) { return isHi() && hi ? hi : en; }
  function pakshaName(p) { return isHi() ? t('names.paksha.' + p) : p; }
  function tithiName(n) { return isHi() ? t('names.tithi.' + n) : n; }
  function nakName(n) { return isHi() ? t('names.nakshatra.' + n) : n; }
  function lordName(n) { return isHi() ? t('names.lord.' + n) : n; }

  // English content stays the base record; Hindi overrides are merged over it
  // so Devanagari and transliteration always survive a language switch.
  function merge(base, over) {
    var out = {};
    Object.keys(base || {}).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over || {}).forEach(function (k) { out[k] = over[k]; });
    return out;
  }

  function localStep(s) {
    if (!I || !isHi()) return s;
    var h = I.hi.steps[s.id];
    if (!h) return s;
    var out = merge(s, h);
    if (typeof h.link === 'string') out.link = { tab: s.link ? s.link.tab : 'katha', label: h.link };
    out.mantras = (s.mantras || []).map(function (m, i) {
      return merge(m, (h.mantras || [])[i] || {});
    });
    return out;
  }

  function localKatha(ch) {
    if (!I || !isHi()) return ch;
    var h = I.hi.katha[ch.id];
    return h ? merge(ch, h) : ch;
  }

  function stepShort(s) { return isHi() ? t('hero.step' + s.n) : s.short; }

  function done(id) { return state.steps.indexOf(id) >= 0; }

  function markStep(id, on) {
    var i = state.steps.indexOf(id);
    if (on && i < 0) state.steps.push(id);
    if (!on && i >= 0) state.steps.splice(i, 1);
    save('steps', state.steps);
    updateProgress();
    updateHeroSteps();
  }

  function plural(unit, n) {
    var map = {
      piece: 'pieces', bunch: 'bunches', leaf: 'leaves', bottle: 'bottles',
      box: 'boxes', diya: 'diyas', copy: 'copies',
      'small bottle': 'small bottles', 'small box': 'small boxes',
      'small piece': 'small pieces', 'small bowl': 'small bowls'
    };
    if (n <= 1) return unit;
    if (map[unit]) return map[unit];
    if (/(s|g|ml)$/.test(unit)) return unit;
    return unit + 's';
  }

  function qtyFor(item, family) {
    var q = item.qtyPer ? Math.ceil(item.qtyBase + item.qtyPer * (family - 1)) : item.qtyBase;
    if (isHi()) return q + ' ' + t('units.' + item.unit);
    return q + ' ' + plural(item.unit, q);
  }

  function todayIso(city) {
    var p = V.localParts(new Date(), city.tz);
    return p.y + '-' + A.pad(p.m) + '-' + A.pad(p.d);
  }

  /* ------------------------------------------------------------------ tabs */
  var TAB_IDS = ['start', 'samagri', 'puja', 'havan', 'katha', 'muhurat', 'sankalp', 'plans', 'seva', 'about'];
  var tabs = $$('.pj-tab');
  var panels = $$('.pj-panel');
  var activeTab = 'start';
  var panelReady = {};

  // Hidden panels are rendered the first time their tab is opened, so the
  // initial page stays light on low-end phones.
  function ensurePanel(id) {
    if (panelReady[id]) return;
    panelReady[id] = true;
    if (id === 'samagri') initSamagri();
    else if (id === 'puja') initPuja();
    else if (id === 'havan') initHavan();
    else if (id === 'katha') initKatha();
    else if (id === 'muhurat') initMuhurat();
    else if (id === 'sankalp') initSankalp();
    else if (id === 'plans') initPlans();
    else if (id === 'seva') initSeva();
  }

  function activateTab(id, opts) {
    if (TAB_IDS.indexOf(id) < 0) id = 'start';
    activeTab = id;
    ensurePanel(id);
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.getAttribute('data-panel') === id;
      p.hidden = !on;
    });
    stopAudio();
    if (id === 'muhurat') renderMuhurat();
    if (id === 'sankalp') updateSankalp();
    if (opts && opts.focus) {
      var panel = document.getElementById('panel-' + id);
      if (panel) {
        try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }
      }
    }
    if (!opts || opts.hash !== false) {
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// */ }
    }
    if (opts && opts.scroll) {
      var bar = $('.pj-tabs');
      if (bar) window.scrollTo({ top: Math.max(0, bar.offsetTop - 76), behavior: 'smooth' });
    }
  }

  function initTabs() {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-tab'), { focus: true, scroll: true });
      });
    });

    // Event delegation: buttons rendered later (muhurat cards, step links,
    // celebration actions) also need to change tabs.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-go]');
      if (!btn) return;
      e.preventDefault();
      activateTab(btn.getAttribute('data-go'), { focus: true, scroll: true });
    });

    var tabsWrap = $('.pj-tabs__in');
    if (tabsWrap) {
      tabsWrap.addEventListener('keydown', function (e) {
        if (!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
        e.preventDefault();
        var i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
        if (e.key === 'Home') i = 0;
        if (e.key === 'End') i = tabs.length - 1;
        tabs[i].focus();
        activateTab(tabs[i].getAttribute('data-tab'), { focus: false, scroll: false });
      });
    }

    var hash = (location.hash || '').replace('#', '');
    if (TAB_IDS.indexOf(hash) >= 0) {
      activateTab(hash, { hash: false, focus: false, scroll: false });
      setTimeout(function () {
        var bar = $('.pj-tabs');
        if (bar) window.scrollTo({ top: Math.max(0, bar.offsetTop - 76), behavior: 'auto' });
      }, 160);
    }
  }

  /* -------------------------------------------------------------- progress */
  function updateProgress() {
    var count = state.steps.length;
    var pct = Math.round((count / P.steps.length) * 100);
    var pctEl = $('#progressPct'), ring = $('#progressRing'), ringText = $('#progressRingText');
    if (pctEl) pctEl.textContent = pct + '%';
    if (ring) ring.style.setProperty('--p', pct);
    if (ringText) ringText.textContent = count + '/' + P.steps.length;
    var bar = $('#progressBar');
    if (bar) {
      bar.style.width = pct + '%';
      var wrap = bar.parentElement;
      if (wrap) wrap.setAttribute('aria-valuenow', pct);
    }
    var text = $('#progressText');
    if (text) {
      var left = P.steps.length - count;
      text.textContent = count === P.steps.length
        ? t('progress.allDone')
        : count === 0
          ? t('progress.initial')
          : t('progress.remaining', { n: left, s: left === 1 ? '' : 's' });
    }
    var rail = $('#railProgress');
    if (rail) rail.textContent = count + ' / ' + P.steps.length + ' ' + t('progress.unit');
    var cont = $('#continuePuja');
    if (cont) cont.innerHTML = (count === 0 ? t('progress.start') : count === P.steps.length ? t('progress.review') : t('progress.continue')) + ' ' + A.icon('arrow');
    updateHeroSteps();
    updateRail();
  }

  function updateHeroSteps() {
    var wrap = $('#heroStepList');
    if (!wrap) return;
    wrap.innerHTML = P.steps.map(function (s) {
      return '<li class="' + (done(s.id) ? 'done' : '') + '"><b>' + (done(s.id) ? '✓' : s.n) + '</b><span>' + esc(stepShort(s)) + '</span></li>';
    }).join('');
  }

  /* --------------------------------------------------------------- panchang */
  function renderToday() {
    var city = state.city;
    var p;
    try { p = V.panchangForDate(new Date(), city); } catch (e) { return; }
    var tz = city.tz;
    var tithiText = pakshaName(p.tithi.paksha) + ' ' + tithiName(p.tithi.name);
    var tithi = $('#todayTithi'), tithiEnd = $('#todayTithiEnd');
    if (tithi) tithi.textContent = tithiText;
    if (tithiEnd) tithiEnd.textContent = t('panchang.ends', { time: V.fmtTime(p.tithi.end, tz) });
    var nak = $('#todayNak'), nakLord = $('#todayNakLord');
    if (nak) nak.textContent = nakName(p.nakshatra.name);
    if (nakLord) nakLord.textContent = t('panchang.pada', { lord: lordName(p.nakshatra.lord), pada: p.nakshatra.pada });
    var rahu = $('#todayRahu');
    if (rahu) rahu.textContent = V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz);
    var abhijit = $('#todayAbhijit');
    if (abhijit) abhijit.textContent = V.fmtTime(p.abhijit.start, tz) + ' – ' + V.fmtTime(p.abhijit.end, tz);
    var sunrise = $('#todaySunrise'), sunset = $('#todaySunset');
    if (sunrise) sunrise.textContent = V.fmtTime(p.sunrise, tz);
    if (sunset) sunset.textContent = V.fmtTime(p.sunset, tz);
    var hero = $('#heroToday');
    if (hero) {
      hero.textContent = tithiText + ' · ' + nakName(p.nakshatra.name) + ' ' + t('panchang.nakshatra') + ' · ' + city.name + ' · ' + t('panchang.rahu') + ' ' + V.fmtTime(p.rahu.start, tz) + '–' + V.fmtTime(p.rahu.end, tz);
    }
  }

  function initCitySelects() {
    var options = A.cityOptions(state.city.name);
    ['#todayCity', '#muhuratCity'].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      el.innerHTML = options;
      el.addEventListener('change', function () {
        state.city = findCity(el.value);
        save('city', state.city.name);
        renderToday();
        scanCache = {};
        renderNextDates();
        renderMuhurat();
        if (state.sankalp && !state.sankalp.city) {
          state.sankalp.city = state.city.name;
          save('sankalp', state.sankalp);
        }
        A.toast(pick('City set to ' + state.city.name, 'शहर ' + state.city.name + ' चुना गया'));
      });
    });
  }

  /* ---------------------------------------------------------------- dates */
  var scanCache = {};
  var muhuratDates = [];
  var DAY_MS = 86400000;

  // Cheap tithi index at sunrise. A light scan is ~8x faster than a full
  // panchang for every day; only the dates we actually show are resolved
  // into full panchang records.
  function tithiAtSunrise(date, city) {
    var p = V.localParts(date, city.tz);
    var sun = V.findSunTimes(p.y, p.m, p.d, city);
    var jd = V.julian(sun.rise.getTime());
    var idx = Math.floor(V.norm(V.moonTropical(jd) - V.sunTropical(jd)) / 12);
    return { idx: idx, sunrise: sun.rise };
  }

  function sankrantiDate(city) {
    try {
      var y = V.localParts(new Date(), city.tz).y;
      var d = V.makarSankranti(y, city);
      if (!d || d.getTime() < Date.now() - DAY_MS) d = V.makarSankranti(y + 1, city);
      return d || null;
    } catch (e) { return null; }
  }

  // Returns the next `need` Purnima / Ekadashi / Sankranti moments in order.
  function upcomingEvents(city, need) {
    var key = city.name + ':' + need;
    if (scanCache[key]) return scanCache[key];
    var events = [];
    var sank = sankrantiDate(city), sankDone = false;
    var lastKind = '', lastTime = 0;
    var now = new Date();
    for (var i = 0; i < 200 && events.length < need; i++) {
      var t;
      try { t = tithiAtSunrise(new Date(now.getTime() + i * DAY_MS), city); }
      catch (e) { break; }
      var kind = t.idx === 14 ? 'purnima' : (t.idx === 10 || t.idx === 25 ? 'ekadashi' : null);
      if (!kind) continue;
      // A tithi can touch two sunrises; keep the first date only.
      if (kind === lastKind && t.sunrise.getTime() - lastTime < 10 * DAY_MS) continue;
      if (sank && !sankDone && sank.getTime() < t.sunrise.getTime()) {
        events.push({ type: 'sankranti', date: sank });
        sankDone = true;
      }
      events.push({ type: kind, date: t.sunrise });
      lastKind = kind;
      lastTime = t.sunrise.getTime();
    }
    if (sank && !sankDone) events.push({ type: 'sankranti', date: sank });
    events.sort(function (a, b) { return a.date - b.date; });
    scanCache[key] = events;
    return events;
  }

  function dateItem(p, type, city) {
    var tz = city.tz;
    var date = V.localParts(p.sunrise, tz);
    var label = type === 'sankranti' ? t('next.labelSankranti')
      : type === 'ekadashi' ? t('next.labelEkadashi', { paksha: pakshaName(p.tithi.paksha) })
        : t('next.labelPurnima');
    var cls = type === 'sankranti' ? 'Purnima / Sankranti' : label;
    return {
      p: p,
      type: type,
      label: label,
      cls: cls,
      date: date,
      dateText: V.fmtShort(p.sunrise, tz),
      weekday: isHi() ? p.weekdayHi : p.weekday,
      tithi: pakshaName(p.tithi.paksha) + ' ' + tithiName(p.tithi.name),
      tithiEnd: V.fmtTime(p.tithi.end, tz),
      sunrise: V.fmtTime(p.sunrise, tz),
      abhijit: V.fmtTime(p.abhijit.start, tz) + ' – ' + V.fmtTime(p.abhijit.end, tz),
      rahu: V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz)
    };
  }

  function combinedDates(city, need) {
    return upcomingEvents(city, need).slice(0, need).map(function (e) {
      return dateItem(V.panchangForDate(e.date, city), e.type, city);
    });
  }

  function renderNextDates() {
    var wrap = $('#nextDates');
    if (!wrap) return;
    var list = [];
    try { list = combinedDates(state.city, 4); } catch (e) { list = []; }
    if (!list.length) {
      wrap.innerHTML = '<p class="small muted">' + esc(t('next.none')) + '</p>';
      wrap.setAttribute('data-ready', '1');
      return;
    }
    wrap.innerHTML = list.map(function (x) {
      return '<div class="pj-next-item">' +
        '<div class="d">' + x.date.d + '</div>' +
        '<div class="m">' + monthName(x.date.m) + ' · ' + x.weekday + '</div>' +
        '<span class="t"><b>' + esc(x.label) + '</b><br>' + esc(x.tithi) + ' · ' + esc(t('panchang.ends', { time: x.tithiEnd })) + '</span>' +
        '<span class="w">' + A.icon('sun') + ' ' + esc(t('panchang.abhijit')) + ' ' + x.abhijit + '</span>' +
        '</div>';
    }).join('');
    wrap.setAttribute('data-ready', '1');
  }

  // The next-dates card sits below the fold, so build it only when it is
  // about to be seen. This keeps the initial load free of the date scan.
  function scheduleDates() {
    var wrap = $('#nextDates');
    if (!wrap) return;
    var render = function () {
      renderNextDates();
      if (activeTab === 'muhurat') renderMuhurat();
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        io.disconnect();
        render();
      }, { rootMargin: '120px 0px' });
      io.observe(wrap);
    } else if (window.requestIdleCallback) {
      window.requestIdleCallback(render, { timeout: 1500 });
    } else {
      setTimeout(render, 400);
    }
  }

  /* --------------------------------------------------------------- samagri */
  function renderSamagri() {
    var wrap = $('#samagriGroups');
    if (!wrap) return;
    wrap.innerHTML = P.samagri.map(function (group) {
      var title = isHi() ? ((I.hi.samagriGroups || {})[group.id] || group.title) : group.title;
      var items = group.items.map(function (it) {
        var on = !!state.samagri[it.id];
        return '<label class="pj-samagri-item' + (on ? ' done' : '') + '">' +
          '<input type="checkbox" data-samagri="' + esc(it.id) + '"' + (on ? ' checked' : '') + '>' +
          '<span class="pj-samagri-item__text"><b>' + esc(isHi() ? it.hi : it.name) + (it.essential ? '<span class="ess">' + esc(t('samagri.essential')) + '</span>' : '') + '</b><small>' + esc(isHi() ? it.name : it.hi) + '</small></span>' +
          '<span class="pj-samagri-item__qty">' + qtyFor(it, state.family) + '</span>' +
          '</label>';
      }).join('');
      var checked = group.items.filter(function (it) { return state.samagri[it.id]; }).length;
      return '<section class="pj-samagri-group">' +
        '<div class="pj-samagri-group__head"><h3>' + esc(title) + '</h3><span>' + checked + '/' + group.items.length + ' ' + esc(t('samagri.ready').replace('{done}/{total}', '').trim()) + '</span></div>' +
        '<div class="pj-samagri-list">' + items + '</div>' +
        '</section>';
    }).join('');
    updateSamagriProgress();
  }

  function allSamagri() {
    return P.samagri.reduce(function (out, g) { return out.concat(g.items); }, []);
  }

  function updateSamagriProgress() {
    var all = allSamagri();
    var checked = all.filter(function (it) { return state.samagri[it.id]; }).length;
    var pct = all.length ? Math.round((checked / all.length) * 100) : 0;
    var txt = $('#samagriProgress');
    if (txt) txt.textContent = checked + '/' + all.length;
    var bar = $('#samagriBar');
    if (bar) {
      bar.style.width = pct + '%';
      var wrap = bar.parentElement;
      if (wrap) wrap.setAttribute('aria-valuenow', pct);
    }
    var family = $('#familyCount');
    if (family) family.textContent = state.family;
  }

  function samagriText() {
    var lines = [t('samagri.shareHeading', { n: state.family }), ''];
    P.samagri.forEach(function (g) {
      lines.push(isHi() ? ((I.hi.samagriGroups || {})[g.id] || g.title) : g.title);
      g.items.forEach(function (it) {
        lines.push((state.samagri[it.id] ? '✓ ' : '☐ ') + (isHi() ? it.hi : it.name) + ' — ' + qtyFor(it, state.family));
      });
      lines.push('');
    });
    lines.push(t('samagri.guide', { url: location.origin + location.pathname + '#samagri' }));
    return lines.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
    return Promise.resolve();
  }

  function initSamagri() {
    var wrap = $('#samagriGroups');
    if (!wrap) return;
    wrap.addEventListener('change', function (e) {
      var cb = e.target.closest('[data-samagri]');
      if (!cb) return;
      var id = cb.getAttribute('data-samagri');
      if (cb.checked) state.samagri[id] = true;
      else delete state.samagri[id];
      save('samagri', state.samagri);
      var row = cb.closest('.pj-samagri-item');
      if (row) row.classList.toggle('done', cb.checked);
      var group = cb.closest('.pj-samagri-group');
      if (group) {
        var all = group.querySelectorAll('[data-samagri]');
        var on = group.querySelectorAll('[data-samagri]:checked');
        var label = group.querySelector('.pj-samagri-group__head span');
        if (label) label.textContent = on.length + '/' + all.length + ' ' + t('samagri.ready').replace('{done}/{total}', '').trim();
      }
      updateSamagriProgress();
    });

    $$('[data-family]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.family = clamp(state.family + Number(btn.getAttribute('data-family')), 1, 20);
        save('family', state.family);
        renderSamagri();
      });
    });

    var share = $('#shareSamagri');
    if (share) share.addEventListener('click', function () {
      var url = 'https://wa.me/?text=' + encodeURIComponent(samagriText());
      window.open(url, '_blank', 'noopener');
    });

    var copy = $('#copySamagri');
    if (copy) copy.addEventListener('click', function () {
      copyText(samagriText()).then(function () { A.toast(t('samagri.copied')); });
    });

    var reset = $('#resetSamagri');
    if (reset) reset.addEventListener('click', function () {
      state.samagri = {};
      save('samagri', state.samagri);
      renderSamagri();
      A.toast(t('samagri.cleared'));
    });

    renderSamagri();
  }

  /* -------------------------------------------------------------- puja step */
  var timer = { interval: null, remaining: 0, running: false };

  function stopTimer() {
    if (timer.interval) clearInterval(timer.interval);
    timer.interval = null;
    timer.running = false;
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return A.pad(m) + ':' + A.pad(s);
  }

  function updateTimerDisplay() {
    var el = $('#timerDisplay');
    if (el) el.textContent = fmtClock(timer.remaining);
    var btn = $('#timerToggle');
    if (btn) {
      btn.innerHTML = timer.running ? A.icon('pause') + ' ' + esc(t('puja.timerPause')) : A.icon('play') + ' ' + esc(t('puja.timerStart'));
      btn.setAttribute('aria-pressed', timer.running ? 'true' : 'false');
    }
  }

  function startTimer() {
    if (timer.running) {
      stopTimer();
      updateTimerDisplay();
      return;
    }
    if (timer.remaining <= 0) {
      var step = P.steps[state.stepIndex];
      timer.remaining = step ? step.duration : 300;
    }
    timer.running = true;
    updateTimerDisplay();
    timer.interval = setInterval(function () {
      timer.remaining -= 1;
      if (timer.remaining <= 0) {
        timer.remaining = 0;
        stopTimer();
        updateTimerDisplay();
        beep();
        A.toast(t('puja.timerDone'));
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [0, 0.2].forEach(function (delay) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 740;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + delay + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.18);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 0.2);
      });
      setTimeout(function () { try { ctx.close(); } catch (e) { /* ignore */ } }, 800);
    } catch (e) { /* ignore */ }
  }

  function mantraHtml(m) {
    return '<article class="pj-mantra-card">' +
      '<div class="pj-mantra-card__head"><span class="kicker">' + esc(m.label) + '</span>' +
      '<button class="pj-audio" type="button" data-speak="' + esc(m.translit) + '" data-speak-dev="' + esc(m.dev) + '" aria-label="' + esc(t('puja.playMantra', { label: m.label })) + '">' + A.icon('play') + '</button></div>' +
      '<div class="pj-mantra__dev">' + esc(m.dev) + '</div>' +
      '<div class="pj-mantra__translit">' + esc(m.translit) + '</div>' +
      '<p class="pj-mantra__meaning">' + esc(m.meaning) + '</p>' +
      (m.repeat ? '<span class="pj-mantra__repeat">' + A.icon('spark') + esc(m.repeat) + '</span>' : '') +
      '<p class="pj-source"><b>' + esc(t('puja.source')) + '</b> ' + esc(m.source) + '</p>' +
      '</article>';
  }

  function renderRail() {
    var rail = $('#pujaRail');
    if (!rail) return;
    rail.innerHTML = P.steps.map(function (s, i) {
      var isDone = done(s.id);
      return '<li><button type="button" class="pj-rail__item' + (i === state.stepIndex ? ' active' : '') + (isDone ? ' done' : '') + '" data-step="' + i + '" aria-current="' + (i === state.stepIndex ? 'step' : 'false') + '">' +
        '<span class="n">' + (isDone ? '✓' : s.n) + '</span>' +
        '<span class="t">' + esc(stepShort(s)) + '<small>' + esc(localStep(s).title) + '</small></span>' +
        '</button></li>';
    }).join('');
  }

  function updateRail() {
    renderRail();
  }

  function setStep(i, scroll) {
    stopTimer();
    state.stepIndex = clamp(i, 0, P.steps.length - 1);
    save('step', state.stepIndex);
    renderPujaStep();
    updateRail();
    if (scroll) {
      var el = $('#pujaStep');
      if (el) {
        var y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  function renderPujaStep() {
    var wrap = $('#pujaStep');
    if (!wrap) return;
    var base = P.steps[state.stepIndex];
    if (!base) return;
    var s = localStep(base);
    var isDone = done(base.id);
    timer.remaining = s.duration;
    timer.running = false;

    var actions = s.actions.map(function (a, i) {
      return '<li><span class="n">' + (i + 1) + '</span><span>' + esc(a) + '</span></li>';
    }).join('');
    var mantras = (s.mantras || []).map(mantraHtml).join('');
    var subTitle = isHi() ? base.title : s.hi;

    wrap.innerHTML = '<article class="pj-step-card">' +
      '<header class="pj-step-head">' +
      '<div class="pj-step-head__top"><span class="pj-step-pill">' + esc(t('puja.stepOf', { n: s.n, total: P.steps.length, short: stepShort(s) })) + '</span>' +
      (isDone ? '<span class="pj-step-done">' + A.icon('check') + ' ' + esc(t('puja.completed')) + '</span>' : '<span class="pj-source pj-source--plain">' + A.icon('clock') + ' ' + esc(t('puja.minutes', { n: Math.round(s.duration / 60) })) + '</span>') +
      '</div>' +
      '<h2>' + esc(s.title) + '</h2><div class="hi">' + esc(subTitle) + '</div>' +
      '<p>' + esc(s.summary) + '</p></header>' +
      '<div class="pj-step-body">' +
      '<ul class="pj-action-list">' + actions + '</ul>' +
      (mantras || '<div class="pj-tip">' + A.icon('info') + '<span>' + esc(t('puja.readingStep')) + '</span></div>') +
      '<div class="pj-tip">' + A.icon('spark') + '<span><b>' + esc(t('puja.tip')) + '</b> ' + esc(s.tip) + '</span></div>' +
      (s.link ? '<button class="btn btn--ghost mt-2" type="button" data-go="' + esc(s.link.tab) + '">' + esc(s.link.label) + ' ' + A.icon('arrow') + '</button>' : '') +
      '<div class="pj-timer">' +
      '<div class="pj-timer__display"><div><div class="pj-timer__clock" id="timerDisplay">' + fmtClock(s.duration) + '</div><div class="pj-timer__label">' + esc(t('puja.timerOptional')) + '</div></div></div>' +
      '<div class="pj-timer__actions"><button class="btn btn--ghost btn--sm" type="button" id="timerToggle" aria-pressed="false">' + A.icon('play') + ' ' + esc(t('puja.timerStart')) + '</button>' +
      '<button class="btn btn--ghost btn--sm" type="button" id="timerReset">' + A.icon('refresh') + ' ' + esc(t('puja.timerReset')) + '</button></div>' +
      '</div></div>' +
      '<footer class="pj-step-nav">' +
      '<button class="btn btn--ghost" type="button" id="stepBack"' + (state.stepIndex === 0 ? ' disabled' : '') + '>' + A.icon('arrowLeft') + ' ' + esc(t('puja.back')) + '</button>' +
      '<div class="pj-step-nav__right">' +
      (isDone ? '<button class="btn btn--ghost" type="button" id="stepUndo">' + esc(t('puja.undo')) + '</button>' : '<button class="btn btn--ghost" type="button" id="stepComplete">' + A.icon('check') + ' ' + esc(t('puja.mark')) + '</button>') +
      '<button class="btn btn--primary" type="button" id="stepNext">' + esc(state.stepIndex === P.steps.length - 1 ? t('puja.finish') : t('puja.next')) + ' ' + A.icon('arrow') + '</button>' +
      '</div></footer></article>';

    var back = $('#stepBack');
    if (back) back.addEventListener('click', function () { setStep(state.stepIndex - 1, true); });
    var next = $('#stepNext');
    if (next) next.addEventListener('click', function () {
      markStep(base.id, true);
      if (state.stepIndex >= P.steps.length - 1) {
        showCelebration();
      } else {
        setStep(state.stepIndex + 1, true);
      }
    });
    var complete = $('#stepComplete');
    if (complete) complete.addEventListener('click', function () {
      markStep(base.id, true);
      renderPujaStep();
      A.toast(t('puja.marked', { n: base.n }));
    });
    var undo = $('#stepUndo');
    if (undo) undo.addEventListener('click', function () {
      markStep(base.id, false);
      renderPujaStep();
    });
    var toggle = $('#timerToggle');
    if (toggle) toggle.addEventListener('click', startTimer);
    var reset = $('#timerReset');
    if (reset) reset.addEventListener('click', function () {
      stopTimer();
      timer.remaining = s.duration;
      updateTimerDisplay();
    });
  }

  function showCelebration() {
    stopTimer();
    var wrap = $('#pujaStep');
    if (!wrap) return;
    wrap.innerHTML = '<article class="pj-step-card"><div class="pj-celebrate">' +
      '<div class="om">ॐ</div>' +
      '<h2>' + esc(t('puja.completeTitle')) + '</h2>' +
      '<p>' + esc(t('puja.completeText')) + '</p>' +
      '<div class="actions"><button class="btn btn--primary" type="button" data-go="sankalp">' + A.icon('print') + ' ' + esc(t('puja.printSankalp')) + '</button>' +
      '<button class="btn btn--ghost" type="button" data-go="havan">' + esc(t('puja.openHavan')) + '</button>' +
      '<button class="btn btn--ghost" type="button" data-go="katha">' + esc(t('puja.readKatha')) + '</button></div>' +
      '<p class="tiny muted mt-18">' + esc(t('puja.completeLocal')) + '</p>' +
      '</div></article>';
    updateProgress();
    A.toast(t('puja.completeToast'));
  }

  function initPuja() {
    var rail = $('#pujaRail');
    if (rail) rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-step]');
      if (!b) return;
      setStep(Number(b.getAttribute('data-step')), true);
    });
    renderRail();
    renderPujaStep();
  }

  /* ----------------------------------------------------------------- audio */
  var voices = [];
  var activeAudio = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices() || [];
  }

  function stopAudio() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
    if (activeAudio) {
      activeAudio.classList.remove('playing');
      activeAudio.innerHTML = A.icon('play');
      activeAudio.setAttribute('aria-pressed', 'false');
      activeAudio = null;
    }
  }

  function speak(text, dev, btn) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      A.toast(pick('Voice audio is not available in this browser', 'इस ब्राउज़र में आवाज़ उपलब्ध नहीं है'));
      return;
    }
    if (activeAudio === btn) { stopAudio(); return; }
    stopAudio();
    loadVoices();
    var u = new SpeechSynthesisUtterance();
    var hiVoice = voices.filter(function (v) { return /^hi([-_]|$)/i.test(v.lang); })[0];
    var enVoice = voices.filter(function (v) { return /^en-IN/i.test(v.lang); })[0];
    if (isHi()) {
      u.text = text || dev;
      if (hiVoice) { u.voice = hiVoice; u.lang = hiVoice.lang; }
      else { u.lang = 'hi-IN'; }
    } else {
      u.text = text || dev;
      u.lang = 'en-IN';
      if (enVoice) u.voice = enVoice;
    }
    u.rate = 0.82;
    u.pitch = 1;
    u.onend = function () {
      if (activeAudio === btn) {
        btn.classList.remove('playing');
        btn.innerHTML = A.icon('play');
        btn.setAttribute('aria-pressed', 'false');
        activeAudio = null;
      }
    };
    u.onerror = function () {
      if (activeAudio === btn) {
        btn.classList.remove('playing');
        btn.innerHTML = A.icon('play');
        btn.setAttribute('aria-pressed', 'false');
        activeAudio = null;
      }
    };
    activeAudio = btn;
    btn.classList.add('playing');
    btn.innerHTML = A.icon('pause');
    btn.setAttribute('aria-pressed', 'true');
    try { window.speechSynthesis.speak(u); } catch (e) { stopAudio(); }
  }

  function initAudio() {
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-speak]');
      if (!btn) return;
      speak(btn.getAttribute('data-speak'), btn.getAttribute('data-speak-dev'), btn);
    });
  }

  /* ----------------------------------------------------------------- havan */
  function updateHavan() {
    var count = state.havan, target = state.target;
    var countEl = $('#ahutiCount');
    if (countEl) countEl.textContent = count;
    var countText = $('#havanCountText');
    if (countText) countText.textContent = t('havan.offered', { done: count, target: target });
    var pct = target ? Math.min(100, Math.round((count / target) * 100)) : 0;
    var bar = $('#havanBar');
    if (bar) {
      bar.style.width = pct + '%';
      var wrap = $('#havanProgressBar');
      if (wrap) {
        wrap.setAttribute('aria-valuemax', target);
        wrap.setAttribute('aria-valuenow', Math.min(count, target));
      }
    }
    var msg = $('#havanMessage');
    if (msg) {
      if (count === 0) msg.textContent = t('havan.msg0');
      else if (count < target) msg.textContent = t('havan.msgLeft', { n: target - count });
      else if (count === target) msg.textContent = t('havan.msgDone');
      else msg.textContent = t('havan.msgExtra');
    }
    $$('.pj-target__btn').forEach(function (b) {
      b.classList.toggle('active', Number(b.getAttribute('data-target')) === target);
    });
  }

  function renderHavan() {
    var h = P.havan;
    var hh = (I && isHi() && I.hi.havan) ? I.hi.havan : {};
    var set = function (sel, text) { var el = $(sel); if (el) el.textContent = text; };
    set('#havanMantraDev', h.mantra.dev);
    set('#havanMantraTranslit', h.mantra.translit);
    set('#havanMantraMeaning', hh.meaning || h.mantra.meaning);
    set('#havanMantraSource', t('havan.source') + ' ' + (hh.source || h.mantra.source));
    set('#purnahutiDev', h.purnahuti.dev);
    set('#purnahutiTranslit', h.purnahuti.translit);
    set('#purnahutiMeaning', hh.purnahutiMeaning || h.purnahuti.meaning);
    set('#purnahutiSource', t('havan.source') + ' ' + (hh.purnahutiSource || h.purnahuti.source));
    set('#havanSafety', hh.note || h.note);
  }

  function initHavan() {
    renderHavan();

    $$('[data-target]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.target = Number(b.getAttribute('data-target'));
        save('target', state.target);
        updateHavan();
      });
    });

    var btn = $('#ahutiBtn');
    if (btn) btn.addEventListener('click', function () {
      state.havan += 1;
      save('havan', state.havan);
      updateHavan();
      btn.classList.remove('bump');
      void btn.offsetWidth;
      btn.classList.add('bump');
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* ignore */ } }
    });

    var reset = $('#havanReset');
    if (reset) reset.addEventListener('click', function () {
      state.havan = 0;
      save('havan', 0);
      updateHavan();
      A.toast(t('havan.resetToast'));
    });

    var complete = $('#havanComplete');
    if (complete) complete.addEventListener('click', function () {
      markStep('havan', true);
      A.toast(t('havan.completeToast'));
    });

    updateHavan();
  }

  /* ----------------------------------------------------------------- katha */
  function kathaOpen(id) {
    var card = $('[data-katha="' + id + '"]');
    if (!card) return false;
    return card.classList.contains('open');
  }

  function applyTextSize() {
    var list = $('#kathaList');
    if (list) list.style.setProperty('--katha-size', (0.9 + state.textSize * 0.07) + 'rem');
  }

  function renderKatha() {
    var list = $('#kathaList');
    if (!list) return;
    list.innerHTML = P.katha.map(function (base, i) {
      var ch = localKatha(base);
      var bookmarked = state.bookmarks.indexOf(base.id) >= 0;
      var small = isHi() ? base.title : ch.hi;
      return '<article class="pj-katha-card' + (i === 0 ? ' open' : '') + '" data-katha="' + esc(base.id) + '">' +
        '<div class="pj-katha-card__head">' +
        '<button class="pj-katha-toggle" type="button" data-katha-toggle="' + esc(base.id) + '" aria-expanded="' + (i === 0 ? 'true' : 'false') + '" aria-controls="body-' + esc(base.id) + '">' +
        '<span class="pj-katha-card__n">' + ch.n + '</span>' +
        '<span class="pj-katha-card__title"><b>' + esc(ch.title) + '</b><small>' + esc(small) + '</small></span>' +
        '</button>' +
        '<div class="pj-katha-card__tools">' +
        '<button type="button" data-katha-bookmark="' + esc(base.id) + '" class="' + (bookmarked ? 'bookmarked' : '') + '" aria-label="' + esc(t('katha.bookmark', { n: ch.n })) + '" aria-pressed="' + (bookmarked ? 'true' : 'false') + '">' + A.icon('star') + '</button>' +
        '<button type="button" data-katha-play="' + esc(base.id) + '" aria-label="' + esc(t('katha.listenChapter', { n: ch.n })) + '">' + A.icon('play') + '</button>' +
        '</div></div>' +
        '<div class="pj-katha-card__body" id="body-' + esc(base.id) + '">' +
        '<div class="pj-katha-body">' + ch.summary.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
        '<div class="pj-katha-teach"><b>' + esc(t('katha.teaching')) + '</b><span>' + esc(ch.teaching) + '</span></div>' +
        '<p class="pj-source"><b>' + esc(t('puja.source')) + '</b> ' + esc(ch.source) + '</p>' +
        '<div class="pj-katha-foot"><span class="tiny muted">' + esc(bookmarked ? t('katha.bookmarked') : t('katha.bookmarkHint')) + '</span>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-katha-play="' + esc(base.id) + '">' + A.icon('play') + ' ' + esc(t('katha.listen')) + '</button></div>' +
        '</div></article>';
    }).join('');
    applyTextSize();
  }

  function initKatha() {
    renderKatha();
    var list = $('#kathaList');
    if (list) {
      list.addEventListener('click', function (e) {
        var t = e.target.closest('[data-katha-toggle]');
        if (t) {
          var card = t.closest('.pj-katha-card');
          var open = card.classList.toggle('open');
          t.setAttribute('aria-expanded', open ? 'true' : 'false');
          return;
        }
        var b = e.target.closest('[data-katha-bookmark]');
        if (b) {
          var id = b.getAttribute('data-katha-bookmark');
          var idx = state.bookmarks.indexOf(id);
          if (idx >= 0) state.bookmarks.splice(idx, 1);
          else state.bookmarks.push(id);
          save('bookmarks', state.bookmarks);
          b.classList.toggle('bookmarked', idx < 0);
          b.setAttribute('aria-pressed', idx < 0 ? 'true' : 'false');
          A.toast(idx < 0 ? t('katha.bookmarkedToast') : t('katha.unbookmarkedToast'));
          return;
        }
        var play = e.target.closest('[data-katha-play]');
        if (play) {
          var ch = P.katha.filter(function (x) { return x.id === play.getAttribute('data-katha-play'); })[0];
          if (ch) {
            var loc = localKatha(ch);
            speak(loc.summary.join(' '), '', play);
          }
        }
      });
    }

    $$('[data-textsize]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.textSize = clamp(state.textSize + Number(b.getAttribute('data-textsize')), -1, 2);
        save('textsize', state.textSize);
        applyTextSize();
      });
    });

    var readAll = $('#kathaReadAll');
    if (readAll) readAll.addEventListener('click', function () {
      speak(P.katha.map(function (c) {
        var l = localKatha(c);
        return l.title + '. ' + l.summary.join(' ');
      }).join(' '), '', readAll);
    });

    var complete = $('#kathaComplete');
    if (complete) complete.addEventListener('click', function () {
      markStep('katha', true);
      A.toast(t('katha.completeToast'));
    });
  }

  /* --------------------------------------------------------------- muhurat */
  function muhuratCard(x) {
    return '<article class="pj-muhurat-card">' +
      '<span class="pj-muhurat-card__type">' + esc(x.type === 'sankranti' ? t('muhurat.sankranti') : x.type === 'ekadashi' ? t('muhurat.ekadashi') : t('muhurat.purnima')) + '</span>' +
      '<h3>' + esc(x.label) + '</h3>' +
      '<div class="date">' + x.date.d + ' ' + monthName(x.date.m) + ' ' + x.date.y + '</div>' +
      '<p class="tiny muted">' + esc(x.weekday) + ' · ' + esc(x.tithi) + '</p>' +
      '<div class="detail"><span>' + esc(t('muhurat.tithiEnds')) + ' <b>' + x.tithiEnd + '</b></span><span>' + esc(t('muhurat.sunrise')) + ' <b>' + x.sunrise + '</b></span><span>' + esc(t('muhurat.abhijit')) + ' <b>' + x.abhijit + '</b></span><span class="rahu">' + esc(t('muhurat.rahu')) + ' <b>' + x.rahu + '</b></span></div>' +
      '<div class="actions"><a class="btn btn--primary" href="booking.html?pooja=satyanarayan">' + esc(t('muhurat.book')) + ' ' + A.icon('arrow') + '</a>' +
      '<button class="btn btn--ghost" type="button" data-go="puja">' + esc(t('muhurat.use')) + '</button></div>' +
      '</article>';
  }

  function renderMuhurat() {
    var wrap = $('#muhuratGrid');
    if (!wrap) return;
    var list;
    try { list = combinedDates(state.city, 9); } catch (e) { list = []; }
    muhuratDates = list;
    if (!list.length) {
      wrap.innerHTML = '<p class="small muted">' + esc(t('muhurat.none')) + '</p>';
      return;
    }
    wrap.innerHTML = list.map(muhuratCard).join('');
    updateNotifyButton();
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function icsStamp(d) {
    return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
      pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
  }

  function icsEscape(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function icsFold(line) {
    if (line.length <= 73) return line;
    var out = [];
    for (var i = 0; i < line.length; i += 73) out.push((i ? ' ' : '') + line.slice(i, i + 73));
    return out.join('\r\n');
  }

  function icsDay(date) {
    return date.y + pad2(date.m) + pad2(date.d);
  }

  function icsNextDay(date) {
    var d = new Date(date.y, date.m - 1, date.d, 12, 0, 0);
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
  }

  function buildMuhuratIcs(list) {
    var stamp = icsStamp(new Date());
    var site = location.origin + location.pathname;
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vedic Pooja//Satyanarayan Muhurat//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEscape(pick('Satyanarayan Puja muhurat', 'सत्यनारायण पूजा मुहूर्त')),
      'X-WR-TIMEZONE:Asia/Kolkata'
    ];
    list.forEach(function (x) {
      var title = pick('Satyanarayan Puja', 'सत्यनारायण पूजा') + ' — ' + x.label;
      var detail = [
        x.tithi,
        t('muhurat.tithiEnds') + ': ' + x.tithiEnd,
        t('muhurat.sunrise') + ': ' + x.sunrise,
        t('muhurat.abhijit') + ': ' + x.abhijit,
        t('muhurat.rahu') + ': ' + x.rahu,
        state.city.name,
        t('muhurat.note'),
        site
      ].join('\n');
      lines.push('BEGIN:VEVENT');
      lines.push(icsFold('UID:vp-satyanarayan-' + icsDay(x.date) + '-' + x.type + '-' + x.date.y + '@vedicpooja.in'));
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART;VALUE=DATE:' + icsDay(x.date));
      lines.push('DTEND;VALUE=DATE:' + icsNextDay(x.date));
      lines.push(icsFold('SUMMARY:' + icsEscape(title)));
      lines.push(icsFold('DESCRIPTION:' + icsEscape(detail)));
      lines.push(icsFold('LOCATION:' + icsEscape(state.city.name)));
      lines.push('TRANSP:TRANSPARENT');
      lines.push('STATUS:CONFIRMED');
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(icsFold('DESCRIPTION:' + icsEscape(pick('Tomorrow: ', 'कल: ') + title)));
      lines.push('TRIGGER:-P1D');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function downloadMuhuratIcs() {
    if (!muhuratDates.length) {
      A.toast(t('muhurat.none'));
      return;
    }
    try {
      var blob = new Blob([buildMuhuratIcs(muhuratDates)], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'satyanarayan-muhurat-' + state.city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 2000);
      A.toast(t('muhurat.icsDone'));
    } catch (e) {
      A.toast(t('muhurat.none'));
    }
  }

  function initMuhurat() {
    var ics = $('#muhuratIcs');
    if (ics) ics.addEventListener('click', downloadMuhuratIcs);
    var notify = $('#muhuratNotify');
    if (notify) notify.addEventListener('click', toggleNotify);
    updateNotifyButton();
    scheduleReminder();
  }

  /* Local festival reminder. Without a push server the reminder fires while
     the guide is open, or on the next visit once the browser is allowed to
     show notifications. The .ics file covers phone-calendar alarms. */
  var notifyTimer = null;

  function notifySupported() { return typeof window.Notification === 'function'; }
  function notifyOn() { return load('notify', false) === true; }

  function updateNotifyButton() {
    var btn = $('#muhuratNotify');
    if (!btn) return;
    var on = notifyOn();
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = $('#muhuratNotifyLabel');
    if (label) label.textContent = on ? t('muhurat.notifyOn') : t('muhurat.notify');
  }

  function notificationTitle() { return pick('Satyanarayan Puja tomorrow', 'कल सत्यनारायण पूजा'); }

  function showReminder(x) {
    var key = x.date.y + '-' + x.date.m + '-' + x.date.d + '-' + x.type;
    if (load('notified', '') === key) return;
    save('notified', key);
    var body = x.label + ' · ' + x.date.d + ' ' + monthName(x.date.m) + ' · ' + state.city.name;
    var title = notificationTitle();
    var fallback = function () {
      try { new Notification(title, { body: body, icon: 'assets/img/icon-192.png', tag: 'vp-puja-' + key }); } catch (e) { /* ignore */ }
    };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (reg) {
          return reg.showNotification(title, {
            body: body,
            icon: 'assets/img/icon-192.png',
            badge: 'assets/img/icon-192.png',
            tag: 'vp-puja-' + key,
            data: { url: location.origin + location.pathname + '#muhurat' }
          });
        }).catch(fallback);
      } else {
        fallback();
      }
    } catch (e) { /* notifications are best-effort */ }
  }

  function scheduleReminder() {
    if (notifyTimer) {
      clearTimeout(notifyTimer);
      notifyTimer = null;
    }
    if (!notifyOn() || !notifySupported() || Notification.permission !== 'granted') return;
    if (!muhuratDates.length) {
      try { muhuratDates = combinedDates(state.city, 9); } catch (e) { return; }
    }
    var now = Date.now(), soonest = null;
    muhuratDates.forEach(function (x) {
      var when = new Date(x.date.y, x.date.m - 1, x.date.d, 8, 0, 0).getTime();
      if (when > now && (!soonest || when < soonest.when)) soonest = { when: when, event: x };
    });
    if (!soonest) return;
    var delay = soonest.when - now;
    if (delay > 2147480000) return; // longer than a browser timer can wait
    notifyTimer = setTimeout(function () { showReminder(soonest.event); }, delay);
  }

  function toggleNotify() {
    if (!notifySupported()) {
      A.toast(t('muhurat.notifyUnsupported'));
      return;
    }
    if (notifyOn()) {
      save('notify', false);
      if (notifyTimer) {
        clearTimeout(notifyTimer);
        notifyTimer = null;
      }
      updateNotifyButton();
      A.toast(t('muhurat.notifyDisabled'));
      return;
    }
    var handled = false;
    var proceed = function (ok) {
      if (handled) return;
      handled = true;
      if (!ok) {
        A.toast(t('muhurat.notifyUnsupported'));
        return;
      }
      save('notify', true);
      updateNotifyButton();
      scheduleReminder();
      A.toast(t('muhurat.notifyEnabled'));
    };
    if (Notification.permission === 'granted') {
      proceed(true);
      return;
    }
    if (Notification.permission === 'denied') {
      proceed(false);
      return;
    }
    try {
      var request = Notification.requestPermission(function (res) { proceed(res === 'granted'); });
      if (request && typeof request.then === 'function') {
        request.then(function (res) { proceed(res === 'granted'); });
      }
    } catch (e) {
      proceed(false);
    }
  }

  /* ---------------------------------------------------------------- sankalp */
  function datePartsFromIso(iso) {
    var p = String(iso || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) {
      var t = V.localParts(new Date(), state.city.tz);
      return { y: t.y, m: t.m, d: t.d };
    }
    return { y: p[0], m: p[1], d: p[2] };
  }

  function buildSankalp() {
    var s = state.sankalp || {};
    var name = (s.name || '').trim();
    var gotra = (s.gotra || '').trim();
    var city = (s.city || state.city.name).trim();
    var purpose = s.purpose || P.sankalpPurposes[0].value;
    var dp = datePartsFromIso(s.date || todayIso(state.city));
    var dt = new Date(dp.y, dp.m - 1, dp.d, 12, 0, 0);
    var wd = dt.getDay();
    var dateHi = dp.d + ' ' + MONTHS_HI[dp.m - 1] + ' ' + dp.y;
    var dateEn = dp.d + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][dp.m - 1] + ' ' + dp.y;
    var gotraText = gotra || 'Kashyap';
    var nameText = name || '—';
    var family = (s.family || '').trim();

    var dev = 'ॐ तत्सत्।\n' +
      'अद्य ' + dateHi + ', ' + WEEKDAYS_HI[wd] + ', ' + city + ' निवासी अहं ' + nameText + ', ' + gotraText + ' गोत्रः, सपरिवारः,\n' +
      'श्री सत्यनारायण स्वामी प्रीत्यर्थं, ' + purpose + ' सिद्ध्यर्थं,\n' +
      'श्री सत्यनारायण व्रत-पूजनं करिष्ये।';

    var en = 'Om Tatsat. On ' + dateEn + ', ' + WEEKDAYS_EN[wd] + ', at ' + city + ', I ' + nameText + ' of ' + gotraText + ' gotra, together with my family' + (family ? ' (' + family + ')' : '') + ', undertake the Satyanarayan vrata and puja for the pleasure of Lord Satyanarayan and for ' + (P.sankalpPurposes.filter(function (x) { return x.value === purpose; })[0] || { label: 'a personal intention' }).label.toLowerCase() + '.';

    return { dev: dev, en: en, name: nameText, gotra: gotraText, city: city, date: dateHi, enDate: dateEn };
  }

  function updateSankalp() {
    var form = $('#sankalpForm');
    if (!form) return;
    if (!state.sankalp) {
      state.sankalp = {
        name: '', gotra: '', city: state.city.name, date: todayIso(state.city),
        purpose: P.sankalpPurposes[0].value, family: ''
      };
      save('sankalp', state.sankalp);
    }
    var s = state.sankalp;
    var fields = { name: '#skName', gotra: '#skGotra', city: '#skCity', date: '#skDate', purpose: '#skPurpose', family: '#skFamily' };
    Object.keys(fields).forEach(function (k) {
      var el = $(fields[k]);
      if (el && el.value !== String(s[k] == null ? '' : s[k])) el.value = s[k] == null ? '' : s[k];
    });
    var out = buildSankalp();
    var dev = $('#sankalpDev'), en = $('#sankalpEn');
    if (dev) dev.textContent = out.dev;
    if (en) en.textContent = out.en;
    var map = { paperName: out.name, paperGotra: out.gotra, paperCity: out.city, paperDate: out.date };
    Object.keys(map).forEach(function (id) { var el = $('#' + id); if (el) el.textContent = map[id]; });
  }

  function renderSankalpOptions() {
    var purpose = $('#skPurpose');
    if (!purpose) return;
    var current = state.sankalp ? state.sankalp.purpose : '';
    purpose.innerHTML = P.sankalpPurposes.map(function (p) {
      var label = isHi() ? ((I.hi.purposes || {})[p.value] || p.value) : p.label;
      return '<option value="' + esc(p.value) + '">' + esc(label) + (isHi() ? '' : ' — ' + esc(p.value)) + '</option>';
    }).join('');
    if (current) purpose.value = current;
  }

  function initSankalp() {
    var form = $('#sankalpForm');
    if (!state.sankalp) {
      state.sankalp = {
        name: '', gotra: '', city: state.city.name, date: todayIso(state.city),
        purpose: P.sankalpPurposes[0].value, family: ''
      };
    }
    renderSankalpOptions();
    updateSankalp();

    if (form) form.addEventListener('input', function (e) {
      var t = e.target;
      if (!t.name) return;
      state.sankalp[t.name] = t.value;
      save('sankalp', state.sankalp);
      updateSankalp();
    });
    if (form) form.addEventListener('change', function (e) {
      var t = e.target;
      if (!t.name) return;
      state.sankalp[t.name] = t.value;
      save('sankalp', state.sankalp);
      updateSankalp();
    });

    var print = $('#sankalpPrintBtn');
    if (print) print.addEventListener('click', function () {
      if (form && !form.reportValidity()) return;
      A.toast(t('sankalp.printDone'));
      setTimeout(function () { window.print(); }, 260);
    });

    var copy = $('#sankalpCopy');
    if (copy) copy.addEventListener('click', function () {
      var out = buildSankalp();
      copyText(out.dev + '\n\n' + out.en + '\n\n— Vedic Pooja Satyanarayan Puja Guide').then(function () {
        A.toast(t('sankalp.copied'));
      });
    });

    var share = $('#sankalpShare');
    if (share) share.addEventListener('click', function () {
      var out = buildSankalp();
      window.open('https://wa.me/?text=' + encodeURIComponent(out.dev + '\n\n' + out.en), '_blank', 'noopener');
    });
  }

  /* ----------------------------------------------------------------- plans */
  function renderPlans() {
    var wrap = $('#plansGrid');
    if (!wrap || !P.plans) return;
    var o = SS.owner || {};
    var name = o.name || 'Rajiv Lochan Mishra';
    var phone = String(o.phone || '918889685370').replace(/[^\d]/g, '');
    var waBase = typeof SS.waLink === 'function'
      ? SS.waLink
      : function (text) {
        return 'https://wa.me/' + phone + (text ? '?text=' + encodeURIComponent(text) : '');
      };

    wrap.innerHTML = P.plans.map(function (plan) {
      var hi = (I && I.hi.plans) ? I.hi.plans[plan.id] : null;
      var loc = (isHi() && hi) ? merge(plan, hi) : plan;
      var price = '₹' + Number(plan.price).toLocaleString('en-IN');
      var msg = pick(
        'Namaste ' + name + ', I would like to book ' + plan.name + ' (' + price + ', ' + plan.duration + '). Please confirm the date, samagri and final dakshina.',
        'नमस्ते ' + name + ', मैं ' + loc.name + ' (' + price + ', ' + loc.duration + ') बुक करना चाहता/चाहती हूँ। कृपया तिथि, सामग्री और अंतिम दक्षिणा की पुष्टि करें।'
      );
      var href = waBase(msg);
      return '<article class="pj-plan' + (plan.popular ? ' pj-plan--popular' : '') + '">' +
        '<div class="pj-plan__top">' +
          '<span class="pj-plan__mode">' + esc(loc.mode) + '</span>' +
          (plan.popular ? '<span class="pj-plan__tag">' + A.icon('star') + ' ' + esc(pick('Most booked', 'सबसे लोकप्रिय')) + '</span>' : '') +
        '</div>' +
        '<h3>' + esc(loc.name) + '</h3>' +
        '<p class="pj-plan__hi">' + esc(isHi() ? plan.name : plan.hi) + '</p>' +
        '<div class="pj-plan__price"><b>' + price + '</b><span>' + esc(loc.duration) + '</span></div>' +
        '<p class="pj-plan__summary">' + esc(loc.summary) + '</p>' +
        '<ul class="pj-plan__list">' + loc.includes.map(function (x) {
          return '<li>' + A.icon('check') + '<span>' + esc(x) + '</span></li>';
        }).join('') + '</ul>' +
        '<a class="btn btn--' + (plan.popular ? 'primary' : 'ghost') + ' btn--wide" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(pick('Book this plan', 'यह योजना बुक करें')) + ' ' + A.icon('arrow') + '</a>' +
      '</article>';
    }).join('');

    var note = $('#planNote');
    if (note) note.textContent = isHi() && I.hi.planNote ? I.hi.planNote : (P.planNote || '');

    var ask = $('#plansWhatsApp');
    if (ask) {
      ask.innerHTML = esc(pick('Ask on WhatsApp', 'WhatsApp पर पूछें')) + ' ' + A.icon('arrow');
      ask.setAttribute('href', waBase(pick(
        'Namaste ' + name + ', please help me choose the right Satyanarayan puja plan.',
        'नमस्ते ' + name + ', कृपया सही सत्यनारायण पूजा योजना चुनने में सहायता करें।'
      )));
    }
    var call = $('#plansCall');
    if (call) {
      call.innerHTML = A.icon('phone') + ' ' + esc(pick('Call', 'कॉल करें'));
      call.setAttribute('href', 'tel:+' + phone);
    }
  }

  function initPlans() {
    renderPlans();
  }

  /* ------------------------------------------------------------------ seva */
  function ownerLabels() {
    var o = SS.owner || {};
    return {
      name: o.name || 'Rajiv Lochan Mishra',
      nameHi: o.nameHi || 'राजीव लोचन मिश्रा',
      city: [o.city || 'Gurugram', o.region || 'Haryana'].join(', '),
      cityHi: [o.cityHi || 'गुरुग्राम', o.regionHi || 'हरियाणा'].join(', ')
    };
  }

  function updateOwnerLabels() {
    var labels = ownerLabels();
    var main = document.getElementById('pjMain');
    if (!main) return;
    // The shared shell rewrites [data-owner-*] on every DOM change. Hand these
    // nodes to the puja page so the Hindi labels are not overwritten.
    $$('[data-owner-name], [data-pj-owner-name]', main).forEach(function (el) {
      if (el.hasAttribute('data-owner-name')) {
        el.setAttribute('data-pj-owner-name', '');
        el.removeAttribute('data-owner-name');
      }
      el.textContent = isHi() ? labels.nameHi : labels.name;
    });
    $$('[data-owner-city], [data-pj-owner-city]', main).forEach(function (el) {
      if (el.hasAttribute('data-owner-city')) {
        el.setAttribute('data-pj-owner-city', '');
        el.removeAttribute('data-owner-city');
      }
      el.textContent = isHi() ? labels.cityHi : labels.city;
    });
    var qr = $('#sevaQrImg');
    if (qr) qr.setAttribute('alt', isHi() ? 'राजीव लोचन मिश्रा के लिए UPI QR कोड' : 'UPI QR code for ' + labels.name);
  }

  function initSeva() {
    var o = SS.owner || {};
    var labels = ownerLabels();
    var name = labels.name;
    var upi = o.upi || 'rajivlochanmishra952-1@okhdfcbank';
    var phone = String(o.phone || '918889685370').replace(/[^\d]/g, '');
    var phoneDisplay = o.phoneDisplay || '+91 88896 85370';
    var email = o.email || 'rajivlochanmishra952@gmail.com';
    var payLink = typeof SS.upiLink === 'function'
      ? SS.upiLink()
      : 'upi://pay?pa=' + upi + '&pn=' + encodeURIComponent(name) + '&cu=INR';

    updateOwnerLabels();

    var upiEl = $('#sevaUpi');
    if (upiEl) upiEl.textContent = upi;
    var upiText = $('#sevaQrUpi');
    if (upiText) upiText.textContent = upi;

    var pay = $('#sevaPay');
    if (pay) pay.setAttribute('href', payLink);
    var call = $('#sevaCall');
    if (call) call.setAttribute('href', 'tel:+' + phone);
    var wa = $('#sevaWa');
    if (wa) wa.setAttribute('href', 'https://wa.me/' + phone);
    var mail = $('#sevaEmail');
    if (mail) mail.setAttribute('href', 'mailto:' + email);

    var phoneLink = $('#sevaPhoneLink');
    if (phoneLink) {
      phoneLink.setAttribute('href', 'tel:+' + phone);
      phoneLink.innerHTML = '<b>' + esc(phoneDisplay) + '</b>';
    }
    var emailLink = $('#sevaEmailLink');
    if (emailLink) {
      emailLink.setAttribute('href', 'mailto:' + email);
      emailLink.textContent = email;
    }

    var copy = $('#copyUpi');
    if (copy) copy.addEventListener('click', function () {
      copyText(upi).then(function () { A.toast(pick('UPI ID copied — ' + name, 'UPI आईडी कॉपी हो गई — ' + name)); });
    });

    // Build the QR from SITE SETTINGS so a changed UPI ID never points at the
    // old account. The static SVG stays as a no-JavaScript fallback.
    var qrWrap = $('#sevaQr');
    if (qrWrap && window.qrcode) {
      try {
        var qr = window.qrcode(0, 'M');
        qr.addData(payLink);
        qr.make();
        qrWrap.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
      } catch (e) { /* keep the static QR */ }
    }
  }

  /* ----------------------------------------------------------------- theme */
  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    save('theme', theme);
    var meta = $('#themeColor');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#15100e' : '#6d1f2c');
    var btn = $('#themeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? A.icon('sun') + ' <span>' + esc(t('theme.light')) + '</span>' : A.icon('moon') + ' <span>' + esc(t('theme.dark')) + '</span>';
      btn.setAttribute('aria-label', theme === 'dark' ? t('theme.toLight') : t('theme.toDark'));
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  function initTheme() {
    var btn = $('#themeToggle');
    if (btn) btn.addEventListener('click', function () {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
    applyTheme(state.theme === 'dark' ? 'dark' : 'light');
  }

  /* -------------------------------------------------------------- progress */
  function initProgress() {
    var reset = $('#resetProgress');
    if (reset) reset.addEventListener('click', function () {
      if (!window.confirm(t('progress.resetConfirm'))) return;
      state.steps = [];
      state.samagri = {};
      state.havan = 0;
      state.bookmarks = [];
      state.stepIndex = 0;
      save('steps', []);
      save('samagri', {});
      save('havan', 0);
      save('bookmarks', []);
      save('step', 0);
      renderSamagri();
      renderKatha();
      updateHavan();
      setStep(0, false);
      updateProgress();
      A.toast(t('progress.resetDone'));
    });
  }

  /* --------------------------------------------------------------- offline */
  function initOffline() {
    var strip = $('#offlineStrip');
    var update = function () {
      if (strip) strip.hidden = navigator.onLine !== false;
    };
    window.addEventListener('online', function () { update(); A.toast(pick('Back online', 'फिर से ऑनलाइन')); });
    window.addEventListener('offline', update);
    update();
  }

  function initShare() {
    var share = $('#shareGuide');
    if (!share) return;
    share.addEventListener('click', function () {
      var data = {
        title: t('pageTitle'),
        text: pick(
          'A free step-by-step Satyanarayan puja guide with mantras, samagri, katha, havan and sankalp.',
          'मंत्र, सामग्री, कथा, हवन और संकल्प के साथ मुफ़्त चरण-दर-चरण सत्यनारायण पूजा गाइड।'
        ),
        url: location.origin + location.pathname
      };
      if (navigator.share) {
        navigator.share(data).catch(function () { /* ignore */ });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url), '_blank', 'noopener');
      }
    });
  }

  /* --------------------------------------------------------------- display */
  var enIndex = null;

  function normText(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function buildTextIndex() {
    if (!I || enIndex) return;
    enIndex = {};
    var walk = function (obj, prefix) {
      Object.keys(obj || {}).forEach(function (k) {
        var v = obj[k], path = prefix ? prefix + '.' + k : k;
        if (v && typeof v === 'object') walk(v, path);
        else if (typeof v === 'string' && v.indexOf('{') < 0) enIndex[normText(v)] = 'ui:' + path;
      });
    };
    walk(I.ui.en, '');
    Object.keys(I.staticText || {}).forEach(function (k) {
      enIndex[normText(k)] = 'static:' + k;
    });
  }

  function translateNode(raw) {
    if (!isHi() || !I) return raw;
    buildTextIndex();
    var key = enIndex[normText(raw)];
    if (!key) return raw;
    var out, k = key.indexOf('ui:') === 0 ? key.slice(3) : key.slice(7);
    if (key.indexOf('ui:') === 0) out = t(k);
    else out = I.staticText[k];
    if (out == null || out === k) return raw;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    return m[1] + out + m[3];
  }

  function applyStatic() {
    if (!I) return;
    buildTextIndex();
    var main = document.getElementById('pjMain');
    if (!main || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (!normText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (n) {
      if (n.__en == null) n.__en = n.nodeValue;
      n.nodeValue = isHi() ? translateNode(n.__en) : n.__en;
    });

    var meta = I.meta && I.meta[state.lang];
    if (meta) {
      document.title = meta.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', meta.description);
    }
  }

  function updateLangToggle() {
    var btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.textContent = isHi() ? 'ENG' : t('lang.hi');
    btn.setAttribute('data-lang', state.lang);
    btn.setAttribute('aria-label', isHi() ? t('lang.switchToEn') : t('lang.switchToHi'));
  }

  function applyLanguage() {
    document.documentElement.setAttribute('lang', isHi() ? 'hi' : 'en');
    try { localStorage.setItem('vp_lang', state.lang); } catch (e) { /* ignore */ }
    save('lang', state.lang);
    applyStatic();
    updateLangToggle();
    updateOwnerLabels();
    renderToday();
    updateProgress();
    var dates = $('#nextDates');
    if (dates && dates.getAttribute('data-ready') === '1') renderNextDates();
    if (panelReady.samagri) renderSamagri();
    if (panelReady.puja) { renderRail(); renderPujaStep(); }
    if (panelReady.havan) { renderHavan(); updateHavan(); }
    if (panelReady.katha) renderKatha();
    if (panelReady.sankalp) { renderSankalpOptions(); updateSankalp(); }
    if (panelReady.plans) renderPlans();
    if (activeTab === 'muhurat') renderMuhurat();
  }

  function initLanguage() {
    // The shared site header owns the language switch. Listen after its own
    // handler has stored vp_lang, then re-render the puja guide in that language.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('#langToggle');
      if (!btn) return;
      setTimeout(function () {
        var next = 'en';
        try { next = localStorage.getItem('vp_lang') === 'hi' ? 'hi' : 'en'; } catch (err) { /* ignore */ }
        if (next === state.lang) return;
        state.lang = next;
        applyLanguage();
        A.toast(isHi() ? 'भाषा हिंदी में बदली' : 'Language switched to English');
      }, 0);
    });
    applyLanguage();
  }

  /* ------------------------------------------------------------------- init */
  function init() {
    // icons supplied by the shared shell
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    initTabs();
    initCitySelects();
    initLanguage();
    initAudio();
    initTheme();
    initProgress();
    initOffline();
    initShare();

    // The date scan waits until the card approaches the viewport.
    scheduleDates();
    if (notifyOn()) scheduleReminder();

    // Keep today’s panchang fresh if the page stays open across midnight.
    // The muhurat and next-date cards follow the new day too.
    var liveDay = todayIso(state.city);
    var refreshDaily = function () {
      renderToday();
      var day = todayIso(state.city);
      if (day === liveDay) return;
      liveDay = day;
      scanCache = {};
      var next = $('#nextDates');
      if (next && next.getAttribute('data-ready')) renderNextDates();
      if (panelReady.muhurat) renderMuhurat();
    };
    setInterval(refreshDaily, 60000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') refreshDaily();
    });
    window.addEventListener('pageshow', refreshDaily);
    window.addEventListener('focus', refreshDaily);
  }

  function scheduleInit() {
    // Let the first paint happen before building the heavier interactive panels.
    var run = function () { setTimeout(init, 0); };
    if (window.requestAnimationFrame) requestAnimationFrame(run);
    else run();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleInit);
  else scheduleInit();
})();
