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
  var pCache = {}, fCache = {};

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
    $('#calMonthTitle').textContent = MONTHS[m] + ' ' + y;
    $('#calYearLabel').textContent = y;
    $('#calMonthSub').textContent = 'Vikram Samvat ' + panchangOf(keyOf(new Date(y, m, 1, 12))).samvat + ' · ' + state.city.name;

    var monthList = monthFestivals(y, m);
    $('#calCount').textContent = monthList.length + ' festival' + (monthList.length === 1 ? '' : 's');
    $('#calFestHead').textContent = 'Festivals in ' + MONTHS[m];
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

      cells.push('<div class="' + cls.join(' ') + '" data-key="' + k + '" role="button" tabindex="' + (out ? '-1' : '0') + '" aria-label="' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '">' +
        dots.join('') +
        '<div class="num">' + d.getDate() + '</div>' +
        '<div class="tithi"><b>' + pc.tithi.paksha.charAt(0) + '</b> ' + A.esc(pc.tithi.name) + '</div>' +
        fests.slice(0, 2).map(function (f) {
          return '<div class="cal-fest"><span>' + f.e + '</span>' + A.esc(f.n) + '</div>';
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
    var dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

    var festHtml = fests.map(function (f) {
      return '<div class="fest-line"><span>' + f.e + '</span><b>' + A.esc(f.n) + '</b></div>';
    }).join('');

    var html =
      '<div class="cal-detail__head">' +
        '<div><span class="kicker kicker--tight">' + dayName + '</span>' +
        '<h3>' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '</h3>' +
        '<p class="small muted">' + pc.tithi.paksha + ' ' + A.esc(pc.tithi.name) + ' · ' + A.esc(pc.nakshatra.name) + ' nakshatra · ' + A.esc(pc.lunarMonthName) + ' month</p></div>' +
        '<div class="cal-detail__actions">' +
          '<a class="btn btn--ghost btn--sm" href="panchang.html?date=' + k + '">Full panchang</a>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-ics-date="' + k + '">Add to calendar</button>' +
          '<a class="btn btn--primary btn--sm" href="booking.html">Book a pooja</a>' +
        '</div>' +
      '</div>' +
      (festHtml || '<p class="small muted mt-2">No major festival on this date. Ekadashi, Purnima and Amavasya are still observed where applicable.</p>') +
      '<div class="cal-detail__grid">' +
        meta('Tithi', pc.tithi.paksha + ' ' + pc.tithi.name) +
        meta('Nakshatra', pc.nakshatra.name + ' · pada ' + pc.nakshatra.pada) +
        meta('Sunrise', V.fmtTime(pc.sunrise, tz)) +
        meta('Sunset', V.fmtTime(pc.sunset, tz)) +
        meta('Rahu Kaal', V.fmtTime(pc.rahu.start, tz) + ' – ' + V.fmtTime(pc.rahu.end, tz)) +
        meta('Abhijit', V.fmtTime(pc.abhijit.start, tz) + ' – ' + V.fmtTime(pc.abhijit.end, tz)) +
        meta('Moonrise', V.fmtTime(pc.moonrise, tz)) +
        meta('Moonset', V.fmtTime(pc.moonset, tz)) +
        meta('Moon phase', pc.moonPhase.name + ' · ' + Math.round(pc.moonIllumination * 100) + '%') +
        meta('Panchak', pc.panchak.active ? 'Active' : 'No') +
      '</div>' +
      '<p class="tiny muted mt-2">Tithi ends ' + V.fmtTime(pc.tithi.end, tz) + ' · Yoga ' + A.esc(pc.yoga.name) + ' · Karana ' + A.esc(pc.karana.name) + ' · ' + A.esc(pc.tithi.nature) + ' tithi · computed for ' + A.esc(state.city.name) + '.</p>';

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
      el.innerHTML = '<p class="small muted">No major festivals this month. The next observance may fall in the following month.</p>';
      return;
    }
    el.innerHTML = list.map(function (f) {
      var d = parseKey(f.key);
      return '<button type="button" class="fest-item" data-key="' + f.key + '">' +
        '<span class="fest-item__icon">' + f.icon + '</span>' +
        '<span class="fest-item__txt"><b>' + A.esc(f.name) + '</b><span>' + d.getDate() + ' ' + MON[ d.getMonth() ] + ' · ' + A.esc(panchangOf(f.key).tithi.paksha) + ' ' + A.esc(panchangOf(f.key).tithi.name) + '</span></span>' +
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
      $('#calMuhurats').innerHTML = '<p class="small muted">No strong muhurats in the next three weeks — Abhijit muhurat is always available as a daily fallback.</p>';
      return;
    }
    $('#calMuhurats').innerHTML = list.map(function (m) {
      var d = parseKey(m.key);
      return '<a class="muhurat-item" href="booking.html">' +
        '<span class="muhurat-item__date"><b>' + d.getDate() + '</b><span>' + MON[d.getMonth()] + '</span></span>' +
        '<span class="muhurat-item__txt"><b>' + m.day + ' · ' + A.esc(m.tithi.paksha) + ' ' + A.esc(m.tithi.name) + '</b>' +
        '<span>' + A.esc(m.nakshatra.name) + ' · Abhijit ' + V.fmtTime(m.abhijit.start, tz) + '</span></span>' +
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
        '<div><h3>' + A.esc(f.name) + '</h3>' +
        '<p class="small muted">' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' · ' + A.esc(panchangOf(f.key).tithi.paksha) + ' ' + A.esc(panchangOf(f.key).tithi.name) + '</p></div>' +
        '<span class="link-arrow">View day ' + A.icon('arrow') + '</span></a>';
    }).join('');
  }

  function renderJump(year) {
    var sel = $('#calJump');
    var map = festivalsOfYear(year);
    var opts = ['<option value="">Jump to a festival…</option>'];
    Object.keys(map).sort().forEach(function (k) {
      map[k].forEach(function (f) {
        opts.push('<option value="' + k + '">' + A.esc(f.n) + ' · ' + V.fmtShort(parseKey(k), state.city.tz) + '</option>');
      });
    });
    sel.innerHTML = opts.join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
