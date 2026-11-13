/* Festival calendar — computed tithis, festivals, month grid and day detail */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var saved = A.store.get('vp_city', 'Gurugram');
  var state = {
    city: D.CITIES.filter(function (c) { return c.name === saved; })[0] || D.CITIES[0],
    view: new Date(),
    selected: null
  };
  state.view = new Date(state.view.getFullYear(), state.view.getMonth(), 1, 12);
  state.selected = keyOf(new Date());

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var HI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  var HI_MON = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
  var HI_DAYS = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  var pCache = {}, fCache = {};

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }
  function hMonth(m) { return isHi() ? HI_MONTHS[m] : MONTHS[m]; }
  function hMon(m) { return isHi() ? HI_MON[m] : MON[m]; }
  function hDay(i) { return isHi() ? HI_DAYS[i] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]; }
  function hDate(d) { return d.getDate() + ' ' + hMonth(d.getMonth()) + ' ' + d.getFullYear(); }
  function hShortDate(d) {
    if (!isHi()) return V.fmtShort(d, state.city.tz);
    var p = V.localParts(d, state.city.tz);
    return p.d + ' ' + HI_MON[p.m - 1];
  }

  var HIGHLIGHTS = [
    'Makar Sankranti', 'Vasant Panchami', 'Maha Shivratri', 'Holika Dahan', 'Holi',
    'Gudi Padwa / Ugadi', 'Ram Navami', 'Akshaya Tritiya', 'Guru Purnima',
    'Raksha Bandhan', 'Krishna Janmashtami', 'Ganesh Chaturthi',
    'Navratri Ghatasthapana', 'Durga Ashtami', 'Dussehra', 'Karwa Chauth',
    'Dhanteras', 'Diwali / Lakshmi Poojan', 'Chhath Puja', 'Paush Purnima'
  ];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function cityKey() { return state.city.name; }

  function panchangOf(key) {
    var ck = cityKey() + '|' + key;
    if (pCache[ck]) return pCache[ck];
    var p = key.split('-').map(Number);
    var pc = V.panchang(p[0], p[1], p[2], state.city);
    pCache[ck] = pc;
    return pc;
  }

  function festivalsOfYear(year) {
    var ck = cityKey() + '|' + year;
    if (fCache[ck]) return fCache[ck];
    var map = V.festivalsForYear(year, state.city);
    var out = {};
    Object.keys(map).forEach(function (k) {
      if (map[k].festivals.length) {
        out[k] = map[k].festivals.map(function (f) { return { n: f.n, e: f.e }; });
      }
    });
    /* Makar Sankranti is solar, not tithi-based */
    try {
      var ms = V.makarSankranti(year, state.city);
      var msKey = V.dateKey(ms, state.city.tz);
      out[msKey] = (out[msKey] || []).concat([{ n: 'Makar Sankranti', e: '☀️' }]);
    } catch (e) { /* ignore */ }
    fCache[ck] = out;
    return out;
  }

  function festsOn(key) {
    var y = Number(key.slice(0, 4));
    return festivalsOfYear(y)[key] || [];
  }

  function monthFestivals(year, month) {
    var map = festivalsOfYear(year);
    var prefix = year + '-' + pad(month + 1);
    var list = [];
    Object.keys(map).filter(function (k) { return k.indexOf(prefix) === 0; }).sort().forEach(function (k) {
      map[k].forEach(function (f) { list.push({ key: k, name: f.n, icon: f.e }); });
    });
    return list;
  }

  function muhurats(days) {
    var list;
    try { list = V.muhuratList(state.city, days); } catch (e) { return []; }
    return list.filter(function (m) { return m.shubh; }).slice(0, 5);
  }

  function init() {
    $$('[data-prev]').forEach(function (b) { b.innerHTML = A.icon('arrowLeft'); });
    $$('[data-next]').forEach(function (b) { b.innerHTML = A.icon('arrow'); });
    $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });
    $('#calTitleIcon').innerHTML = A.icon('calendar');

    var sel = $('#calCity');
    sel.innerHTML = A.cityOptions(state.city.name);
    sel.addEventListener('change', function () {
      state.city = A.findCity(sel.value);
      A.store.set('vp_city', state.city.name);
      pCache = {}; fCache = {};
      render();
    });

    $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
    $('#calNext').addEventListener('click', function () { shiftMonth(1); });
    $('#calToday').addEventListener('click', function () {
      state.view = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
      state.selected = keyOf(new Date());
      render();
    });

    $('#calJump').addEventListener('change', function () {
      var k = $('#calJump').value;
      if (!k) return;
      state.selected = k;
      var d = parseKey(k);
      state.view = new Date(d.getFullYear(), d.getMonth(), 1, 12);
      render();
      detailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* deep link: calendar.html?date=YYYY-MM-DD */
    var q = /[?&]date=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (q) {
      var d0 = parseKey(q[1]);
      state.view = new Date(d0.getFullYear(), d0.getMonth(), 1, 12);
      state.selected = q[1];
    }

    if (A.onLang) A.onLang(function () { pCache = {}; fCache = {}; render(); });

    render();
    startLive();
  }

  /* Move the "today" highlight when the date changes while the page is open,
     and refresh the month after the tab returns from the background. */
  var lastToday = keyOf(new Date());

  function liveTick() {
    var now = new Date();
    var nowKey = keyOf(now);
    if (nowKey === lastToday) return;
    var followedToday = state.selected === lastToday;
    lastToday = nowKey;
    if (followedToday) {
      state.selected = nowKey;
      state.view = new Date(now.getFullYear(), now.getMonth(), 1, 12);
    }
    render();
  }

  function startLive() {
    setInterval(liveTick, 60000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') liveTick();
    });
    window.addEventListener('pageshow', liveTick);
    window.addEventListener('focus', liveTick);
  }

  function shiftMonth(n) {
    var y = state.view.getFullYear(), m = state.view.getMonth() + n;
    state.view = new Date(y, m, 1, 12);
    render();
  }

  function render() {
    var y = state.view.getFullYear(), m = state.view.getMonth();
    $('#calMonthTitle').textContent = hMonth(m) + ' ' + y;
    $('#calYearLabel').textContent = y;
    $('#calMonthSub').textContent = T('Vikram Samvat ', 'विक्रम संवत् ') + panchangOf(keyOf(new Date(y, m, 1, 12))).samvat + ' · ' + A.placeName(state.city.name);

    var monthList = monthFestivals(y, m);
    $('#calCount').textContent = isHi()
      ? monthList.length + ' त्योहार'
      : monthList.length + ' festival' + (monthList.length === 1 ? '' : 's');
    $('#calFestHead').textContent = T('Festivals in ' + hMonth(m), hMonth(m) + ' के त्योहार');
    $('#calFestCount').textContent = monthList.length;

    renderGrid(y, m);
    renderFestList(monthList);
    renderMuhurats();
    renderHighlights(y);
    renderJump(y);
    renderDetail();
  }

  function renderGrid(y, m) {
    var first = new Date(y, m, 1, 12);
    var start = new Date(first.getTime());
    start.setDate(start.getDate() - start.getDay());
    var todayKey = keyOf(new Date());
    var cells = [];

    for (var i = 0; i < 42; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12);
      var k = keyOf(d);
      var out = d.getMonth() !== m;
      var pc = panchangOf(k);
      var fests = festsOn(k);
      var cls = ['cal-day'];
      if (out) cls.push('out');
      if (k === todayKey) cls.push('today');
      if (k === state.selected) cls.push('selected');

      var dots = [];
      if (fests.length) dots.push('<span class="cal-dot cal-dot--gold"></span>');
      else if (pc.tithi.index === 10 || pc.tithi.index === 25) dots.push('<span class="cal-dot cal-dot--green"></span>');
      else if (pc.tithi.index === 14 || pc.tithi.index === 29) dots.push('<span class="cal-dot cal-dot--red"></span>');

      cells.push('<div class="' + cls.join(' ') + '" data-key="' + k + '" role="button" tabindex="' + (out ? '-1' : '0') + '" aria-label="' + d.getDate() + ' ' + hMonth(d.getMonth()) + ' ' + d.getFullYear() + '">' +
        dots.join('') +
        '<div class="num">' + d.getDate() + '</div>' +
        '<div class="tithi"><b>' + (isHi() ? (pc.tithi.paksha === 'Shukla' ? 'शु' : 'कृ') : pc.tithi.paksha.charAt(0)) + '</b> ' + A.esc(hn('tithi', pc.tithi.name)) + '</div>' +
        fests.slice(0, 2).map(function (f) {
          return '<div class="cal-fest"><span>' + f.e + '</span>' + A.esc(hn('festival', f.n)) + '</div>';
        }).join('') +
        '</div>');
    }
    $('#calGrid').innerHTML = cells.join('');

    $$('#calGrid .cal-day').forEach(function (cell) {
      cell.addEventListener('click', function () {
        state.selected = cell.getAttribute('data-key');
        renderGrid(y, m);
        renderDetail();
      });
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cell.click();
        }
      });
    });
  }

  function renderDetail() {
    if (!state.selected) return;
    var k = state.selected;
    var d = parseKey(k);
    var pc = panchangOf(k);
    var fests = festsOn(k);
    var tz = state.city.tz;
    var dayName = hDay(d.getDay());

    var festHtml = fests.map(function (f) {
      return '<div class="fest-line"><span>' + f.e + '</span><b>' + A.esc(hn('festival', f.n)) + '</b></div>';
    }).join('');

    var html =
      '<div class="cal-detail__head">' +
        '<div><span class="kicker kicker--tight">' + dayName + '</span>' +
        '<h3>' + hDate(d) + '</h3>' +
        '<p class="small muted">' + hn('paksha', pc.tithi.paksha) + ' ' + A.esc(hn('tithi', pc.tithi.name)) + ' · ' + A.esc(hn('nakshatra', pc.nakshatra.name)) + T(' nakshatra', ' नक्षत्र') + ' · ' + A.esc(hn('month', pc.lunarMonthName)) + T(' month', ' मास') + '</p></div>' +
        '<div class="cal-detail__actions">' +
          '<a class="btn btn--ghost btn--sm" href="panchang.html?date=' + k + '">' + T('Full panchang', 'पूरा पंचांग') + '</a>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-ics-date="' + k + '">' + T('Add to calendar', 'कैलेंडर में जोड़ें') + '</button>' +
          '<a class="btn btn--primary btn--sm" href="booking.html">' + T('Book a pooja', 'पूजा बुक करें') + '</a>' +
        '</div>' +
      '</div>' +
      (festHtml || '<p class="small muted mt-2">' + T('No major festival on this date. Ekadashi, Purnima and Amavasya are still observed where applicable.', 'इस तिथि पर कोई बड़ा त्योहार नहीं है। जहाँ लागू हो, एकादशी, पूर्णिमा और अमावस्या का पालन अभी भी किया जाता है।') + '</p>') +
      '<div class="cal-detail__grid">' +
        meta(T('Tithi', 'तिथि'), hn('paksha', pc.tithi.paksha) + ' ' + hn('tithi', pc.tithi.name)) +
        meta(T('Nakshatra', 'नक्षत्र'), hn('nakshatra', pc.nakshatra.name) + T(' · pada ', ' · पाद ') + pc.nakshatra.pada) +
        meta(T('Sunrise', 'सूर्योदय'), V.fmtTime(pc.sunrise, tz)) +
        meta(T('Sunset', 'सूर्यास्त'), V.fmtTime(pc.sunset, tz)) +
        meta(T('Rahu Kaal', 'राहु काल'), V.fmtTime(pc.rahu.start, tz) + ' – ' + V.fmtTime(pc.rahu.end, tz)) +
        meta(T('Abhijit', 'अभिजीत'), V.fmtTime(pc.abhijit.start, tz) + ' – ' + V.fmtTime(pc.abhijit.end, tz)) +
        meta(T('Moonrise', 'चंद्रोदय'), V.fmtTime(pc.moonrise, tz)) +
        meta(T('Moonset', 'चंद्रास्त'), V.fmtTime(pc.moonset, tz)) +
        meta(T('Moon phase', 'चंद्र कला'), hn('moonPhase', pc.moonPhase.name) + ' · ' + Math.round(pc.moonIllumination * 100) + '%') +
        meta(T('Panchak', 'पंचक'), pc.panchak.active ? T('Active', 'सक्रिय') : T('No', 'नहीं')) +
      '</div>' +
      '<p class="tiny muted mt-2">' + T('Tithi ends ', 'तिथि समाप्त ') + V.fmtTime(pc.tithi.end, tz) + ' · ' + T('Yoga ', 'योग ') + A.esc(hn('yoga', pc.yoga.name)) + ' · ' + T('Karana ', 'करण ') + A.esc(hn('karana', pc.karana.name)) + ' · ' + A.esc(hn('tithiNature', pc.tithi.nature)) + T(' tithi', ' तिथि') + ' · ' + T('computed for ', 'गणना: ') + A.esc(A.placeName(state.city.name)) + '.</p>';

    var el = $('#calDetail');
    el.innerHTML = html;
    detailPanel = el;
  }

  function meta(k, v) {
    return '<div class="cal-meta"><span>' + k + '</span><b>' + A.esc(v) + '</b></div>';
  }

  var detailPanel = null;

  function renderFestList(list) {
    var el = $('#calFestList');
    if (!list.length) {
      el.innerHTML = '<p class="small muted">' + T('No major festivals this month. The next observance may fall in the following month.', 'इस महीने कोई बड़ा त्योहार नहीं है। अगला पर्व अगले महीने में पड़ सकता है।') + '</p>';
      return;
    }
    el.innerHTML = list.map(function (f) {
      var d = parseKey(f.key);
      return '<button type="button" class="fest-item" data-key="' + f.key + '">' +
        '<span class="fest-item__icon">' + f.icon + '</span>' +
        '<span class="fest-item__txt"><b>' + A.esc(hn('festival', f.name)) + '</b><span>' + d.getDate() + ' ' + hMon(d.getMonth()) + ' · ' + A.esc(hn('paksha', panchangOf(f.key).tithi.paksha)) + ' ' + A.esc(hn('tithi', panchangOf(f.key).tithi.name)) + '</span></span>' +
        A.icon('arrow') + '</button>';
    }).join('');

    $$('#calFestList .fest-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.selected = btn.getAttribute('data-key');
        renderGrid(state.view.getFullYear(), state.view.getMonth());
        renderDetail();
        if (detailPanel) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function renderMuhurats() {
    var list = muhurats(21);
    var tz = state.city.tz;
    if (!list.length) {
      $('#calMuhurats').innerHTML = '<p class="small muted">' + T('No strong muhurats in the next three weeks — Abhijit muhurat is always available as a daily fallback.', 'अगले तीन सप्ताह में कोई प्रबल मुहूर्त नहीं है — अभिजीत मुहूर्त हर दिन वैकल्पिक रूप से उपलब्ध रहता है।') + '</p>';
      return;
    }
    $('#calMuhurats').innerHTML = list.map(function (m) {
      var d = parseKey(m.key);
      return '<a class="muhurat-item" href="booking.html">' +
        '<span class="muhurat-item__date"><b>' + d.getDate() + '</b><span>' + hMon(d.getMonth()) + '</span></span>' +
        '<span class="muhurat-item__txt"><b>' + hn('weekday', m.day) + ' · ' + A.esc(hn('paksha', m.tithi.paksha)) + ' ' + A.esc(hn('tithi', m.tithi.name)) + '</b>' +
        '<span>' + A.esc(hn('nakshatra', m.nakshatra.name)) + ' · ' + T('Abhijit ', 'अभिजीत ') + V.fmtTime(m.abhijit.start, tz) + '</span></span>' +
        A.icon('arrow') + '</a>';
    }).join('');
  }

  function renderHighlights(year) {
    var map = festivalsOfYear(year);
    var seen = {};
    var list = [];
    Object.keys(map).sort().forEach(function (k) {
      map[k].forEach(function (f) {
        if (HIGHLIGHTS.indexOf(f.n) >= 0 && !seen[f.n]) {
          seen[f.n] = true;
          list.push({ key: k, name: f.n, icon: f.e });
        }
      });
    });
    list = list.slice(0, 9);
    $('#calHighlights').innerHTML = list.map(function (f) {
      var d = parseKey(f.key);
      return '<a class="card fest-card card--hover" href="calendar.html?date=' + f.key + '">' +
        '<div class="fest-card__icon">' + f.icon + '</div>' +
        '<div><h3>' + A.esc(hn('festival', f.name)) + '</h3>' +
        '<p class="small muted">' + hDate(d) + ' · ' + A.esc(hn('paksha', panchangOf(f.key).tithi.paksha)) + ' ' + A.esc(hn('tithi', panchangOf(f.key).tithi.name)) + '</p></div>' +
        '<span class="link-arrow">' + T('View day ', 'दिन देखें ') + A.icon('arrow') + '</span></a>';
    }).join('');
  }

  function renderJump(year) {
    var sel = $('#calJump');
    var map = festivalsOfYear(year);
    var opts = ['<option value="">' + T('Jump to a festival…', 'किसी त्योहार पर जाएँ…') + '</option>'];
    Object.keys(map).sort().forEach(function (k) {
      map[k].forEach(function (f) {
        opts.push('<option value="' + k + '">' + A.esc(hn('festival', f.n)) + ' · ' + hShortDate(parseKey(k)) + '</option>');
      });
    });
    sel.innerHTML = opts.join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
