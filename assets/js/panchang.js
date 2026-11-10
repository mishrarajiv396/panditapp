/* Panchang page — daily timings, windows, choghadiya and upcoming festivals */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var saved = A.store.get('vp_city', 'Gurugram');
  var cityQ = /[?&]city=([^&]+)/.exec(location.search);
  if (cityQ) {
    try { saved = decodeURIComponent(cityQ[1].replace(/\+/g, ' ')); } catch (e) { /* keep saved */ }
  }
  var state = {
    city: D.CITIES.filter(function (c) { return c.name === saved; })[0] || D.CITIES[0],
    date: new Date(),
    followToday: true
  };
  if (cityQ) A.store.set('vp_city', state.city.name);
  var festCache = {};
  var guideKey = '';

  function iso(d) { return d.getFullYear() + '-' + A.pad(d.getMonth() + 1) + '-' + A.pad(d.getDate()); }
  function parts(s) { var p = s.split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() + n); return x; }
  function keyOf(d) { return iso(d); }

  function fmtDuration(ms) {
    var m = Math.round(ms / 60000);
    return Math.floor(m / 60) + 'h ' + A.pad(m % 60) + 'm';
  }

  function sameDay(a, b, tz) {
    var pa = V.localParts(a, tz), pb = V.localParts(b, tz);
    return pa.y === pb.y && pa.m === pb.m && pa.d === pb.d;
  }

  function fmtWindow(start, end, tz) {
    if (!start || !end) return V.fmtTime(start, tz) + ' – ' + V.fmtTime(end, tz);
    if (sameDay(start, end, tz)) return V.fmtTime(start, tz) + ' – ' + V.fmtTime(end, tz);
    return V.fmtShort(start, tz) + ' ' + V.fmtTime(start, tz) + ' – ' + V.fmtShort(end, tz) + ' ' + V.fmtTime(end, tz);
  }

  function init() {
    $$('[data-prev]').forEach(function (b) { b.innerHTML = A.icon('arrowLeft'); });
    $$('[data-next]').forEach(function (b) { b.innerHTML = A.icon('arrow'); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });

    var citySel = $('#panCity');
    citySel.innerHTML = A.cityOptions(state.city.name);
    var citySearch = $('#panCitySearch');
    if (citySearch) {
      citySearch.addEventListener('input', function () {
        var keep = citySel.value;
        citySel.innerHTML = A.cityOptions(keep, citySearch.value);
        if (keep) citySel.value = keep;
      });
    }
    citySel.addEventListener('change', function () {
      state.city = A.findCity(citySel.value);
      A.store.set('vp_city', state.city.name);
      guideKey = '';
      render();
    });

    var dateInp = $('#panDate');
    dateInp.value = keyOf(state.date);
    var q = /[?&]date=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (q) {
      var qp = parts(q[1]);
      state.date = new Date(qp.y, qp.m - 1, qp.d, 12);
      dateInp.value = keyOf(state.date);
    }
    state.followToday = keyOf(state.date) === keyOf(new Date());
    dateInp.addEventListener('change', function () {
      if (!dateInp.value) return;
      var p = parts(dateInp.value);
      state.date = new Date(p.y, p.m - 1, p.d, 12);
      state.followToday = keyOf(state.date) === keyOf(new Date());
      render();
    });

    $('#panPrev').addEventListener('click', function () { stepDay(-1); });
    $('#panNext').addEventListener('click', function () { stepDay(1); });
    $('#panToday').addEventListener('click', function () {
      state.date = new Date();
      state.followToday = true;
      syncDate();
      render();
    });

    render();
    startLive();
  }

  function stepDay(n) {
    state.date = addDays(state.date, n);
    state.followToday = keyOf(state.date) === keyOf(new Date());
    syncDate();
    render();
  }

  /* Keep a "today" view live: roll over at midnight, refresh after the tab
     was in the background, and recompute the windows every minute. */
  function refreshToday() {
    var now = new Date();
    if (!state.followToday) return;
    if (keyOf(state.date) !== keyOf(now)) {
      state.date = now;
      syncDate();
    }
    render();
  }

  function startLive() {
    setInterval(refreshToday, 60000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') refreshToday();
    });
    window.addEventListener('pageshow', refreshToday);
    window.addEventListener('focus', refreshToday);
  }

  function syncDate() { $('#panDate').value = keyOf(state.date); }

  function rowHtml(k, v, sub) {
    return '<div class="pan-row"><span class="k">' + k + '</span><span class="v">' + v + (sub ? '<small>' + sub + '</small>' : '') + '</span></div>';
  }

  function render() {
    var p = parts(keyOf(state.date));
    var pc = V.panchang(p.y, p.m, p.d, state.city);
    var tz = state.city.tz;
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    /* hero */
    $('#panDay').textContent = p.d;
    $('#panMonth').textContent = months[p.m - 1] + ' ' + p.y;
    $('#panWeekdayPill').textContent = pc.weekday;
    $('#panWeekday').textContent = pc.weekday + ' · ' + pc.lunarMonthName + ' ' + pc.tithi.paksha;
    $('#panTithiBig').textContent = pc.tithi.paksha + ' ' + pc.tithi.name;
    $('#panNakBig').textContent = pc.nakshatra.name + ' Nakshatra · ' + pc.nakshatra.lord + ' · pada ' + pc.nakshatra.pada;
    $('#panCityChip').textContent = state.city.name + ' · ' + A.cityMeta(state.city);
    var guideCity = $('#panGuideCity');
    if (guideCity) guideCity.textContent = state.city.name;

    $$('[data-meta]').forEach(function (el) {
      var k = el.getAttribute('data-meta');
      if (k === 'sunrise') el.innerHTML = A.icon('sun') + V.fmtTime(pc.sunrise, tz);
      if (k === 'sunset') el.innerHTML = A.icon('moon') + V.fmtTime(pc.sunset, tz);
      if (k === 'moon') el.innerHTML = A.icon('star') + V.RASHIS[pc.moonSign].n + ' Moon';
      if (k === 'month') el.innerHTML = A.icon('calendar') + pc.lunarMonthName + (pc.lunarMonth ? ' month' : '');
    });

    var panchakText = pc.panchak.active
      ? 'Active' + (pc.panchak.end ? ' · ends ' + V.fmtTime(pc.panchak.end, tz) : '')
      : (pc.panchak.start ? 'Starts ' + V.fmtTime(pc.panchak.start, tz) : 'Not active');
    var panchakSub = pc.panchak.end
      ? (pc.panchak.active ? 'moon in Dhanishta–Revati' : 'ends ' + V.fmtTime(pc.panchak.end, tz))
      : 'no Panchak in the next five days';
    var bhadraText = pc.bhadra.active
      ? 'Active' + (pc.bhadra.end ? ' · ends ' + V.fmtTime(pc.bhadra.end, tz) : '')
      : 'Not active';

    $('#panRows').innerHTML = [
      rowHtml('Tithi', pc.tithi.paksha + ' ' + pc.tithi.name, fmtWindow(pc.tithi.start, pc.tithi.end, tz) + ' · then ' + pc.tithi.nextPaksha + ' ' + pc.tithi.nextName),
      rowHtml('Tithi nature', pc.tithi.nature, pc.tithi.meaning + ' · deity ' + pc.tithi.deity),
      rowHtml('Nakshatra', pc.nakshatra.name + ' · pada ' + pc.nakshatra.pada, pc.nakshatra.lord + ' · ' + pc.nakshatra.deity + ' · ends ' + V.fmtTime(pc.nakshatra.end, tz)),
      rowHtml('Yoga', pc.yoga.name, pc.yoga.meaning + ' · ends ' + V.fmtTime(pc.yoga.end, tz)),
      rowHtml('Karana', pc.karana.name, pc.karana.meaning + ' · ends ' + V.fmtTime(pc.karana.end, tz)),
      rowHtml('Paksha', pc.tithi.paksha + ' paksha', pc.tithi.paksha === 'Shukla' ? 'waxing moon' : 'waning moon'),
      rowHtml('Lunar month', pc.lunarMonthName + (pc.adhika ? ' (adhika)' : ''), 'Vikram Samvat ' + pc.samvat + ' · Shaka ' + pc.shaka),
      rowHtml('Ritu / Ayana', pc.ritu + ' · ' + pc.ayana, 'six-season Vedic year'),
      rowHtml('Sun / Moon sign', V.RASHIS[pc.sunSign].n + ' / ' + V.RASHIS[pc.moonSign].n, 'sidereal · Lahiri'),
      rowHtml('Solar month', pc.solarMonth, 'Sun’s sidereal sign'),
      rowHtml('Sunrise / Sunset', V.fmtTime(pc.sunrise, tz) + ' / ' + V.fmtTime(pc.sunset, tz), 'day length ' + fmtDuration(pc.dayLength)),
      rowHtml('Moonrise / Moonset', V.fmtTime(pc.moonrise, tz) + ' / ' + V.fmtTime(pc.moonset, tz), pc.moonPhase.name + ' · ' + Math.round(pc.moonIllumination * 100) + '% illuminated'),
      rowHtml('Panchak', panchakText, panchakSub),
      rowHtml('Bhadra', bhadraText, pc.bhadra.active ? 'Vishti karana — hold new beginnings' : 'Vishti karana is not running'),
      rowHtml('Ayanamsa', pc.ayanamsa.toFixed(3) + '°', 'Julian day ' + pc.julianDay.toFixed(4))
    ].join('');

    /* at a glance */
    $('#glSunrise').textContent = V.fmtTime(pc.sunrise, tz);
    $('#glSunset').textContent = V.fmtTime(pc.sunset, tz);
    $('#glMoonrise').textContent = V.fmtTime(pc.moonrise, tz);
    $('#glMoonset').textContent = V.fmtTime(pc.moonset, tz);
    $('#glRahu').textContent = V.fmtTime(pc.rahu.start, tz) + ' – ' + V.fmtTime(pc.rahu.end, tz);
    $('#glAbhijit').textContent = V.fmtTime(pc.abhijit.start, tz) + ' – ' + V.fmtTime(pc.abhijit.end, tz);
    $('#glBrahma').textContent = V.fmtTime(pc.brahma.start, tz) + ' – ' + V.fmtTime(pc.brahma.end, tz);
    $('#glPanchak').textContent = pc.panchak.active ? 'Active' : (pc.panchak.start ? 'From ' + V.fmtTime(pc.panchak.start, tz) : '—');
    $('#glBhadra').textContent = pc.bhadra.active ? 'Active' : 'No';
    $('#glDay').textContent = fmtDuration(pc.dayLength);

    renderTithiFocus(pc, tz);
    renderTimeline(pc, tz);
    renderChoghadiya(pc, tz);
    renderHora(pc, tz);
    renderFestivals(pc, tz);
    renderTithiGuide();
    $('#panBook').href = 'booking.html';
  }

  function renderTithiFocus(pc, tz) {
    var t = pc.tithi;
    var pct = Math.max(0, Math.min(100, (t.progress || 0) * 100));
    var fests = (t.festivals || []).length
      ? t.festivals.map(function (f) { return '<span class="chip chip--gold">' + f.icon + ' ' + A.esc(f.name) + '</span>'; }).join('')
      : '<span class="chip">No major festival today</span>';
    $('#panTithiFocus').innerHTML =
      '<div class="tithi-focus__main">' +
        '<div class="tithi-focus__top">' +
          '<span class="tithi-focus__paksha">' + A.esc(t.paksha) + ' paksha · ' + A.esc(t.nature) + '</span>' +
          '<span class="chip ' + (t.shubh ? 'chip--green' : 'chip--gold') + '">' + (t.shubh ? 'Auspicious' : 'Hold new beginnings') + '</span>' +
        '</div>' +
        '<h3>' + A.esc(t.name) + ' <span class="dev">' + A.esc(t.hi) + '</span></h3>' +
        '<p class="tithi-focus__meaning">' + A.esc(t.meaning) + ' · deity ' + A.esc(t.deity) + '</p>' +
        '<div class="tithi-focus__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '"><span style="width:' + pct.toFixed(1) + '%"></span></div>' +
        '<p class="tithi-focus__guidance">' + A.esc(t.guidance) + '</p>' +
        '<div class="tithi-focus__fests">' + fests + '</div>' +
      '</div>' +
      '<div class="tithi-focus__side">' +
        '<div><span>Tithi window</span><b>' + fmtWindow(t.start, t.end, tz) + '</b></div>' +
        '<div><span>Next tithi</span><b>' + A.esc(t.nextPaksha) + ' ' + A.esc(t.nextName) + '</b></div>' +
        '<div><span>Moon</span><b>' + A.esc(pc.moonPhase.name) + ' · ' + Math.round(pc.moonIllumination * 100) + '%</b></div>' +
        '<div><span>Moonrise</span><b>' + V.fmtTime(pc.moonrise, tz) + '</b></div>' +
      '</div>';
  }

  function renderHora(pc, tz) {
    function block(title, list) {
      return '<div class="hora-block"><div class="hora-block__head">' + title + '</div><div class="hora-grid">' +
        list.map(function (h) {
          return '<div class="hora"><span class="hora__n">' + h.index + '</span><b>' + A.esc(h.lord) + '</b><span>' +
            V.fmtTime(h.start, tz) + ' – ' + V.fmtTime(h.end, tz) + '</span></div>';
        }).join('') + '</div></div>';
    }
    var day = pc.hora.filter(function (h) { return h.day; });
    var night = pc.hora.filter(function (h) { return !h.day; });
    $('#panHora').innerHTML = block('Day horas', day) + block('Night horas', night);
  }

  function renderTithiGuide() {
    var key = state.city.name + '|' + keyOf(state.date);
    var el = $('#panTithiGuide');
    if (!el || (guideKey === key && el.innerHTML)) return;
    guideKey = key;

    var tz = state.city.tz;
    var nextMap = V.upcomingTithis(state.city, 45, state.date);
    var festMap = V.tithiFestivalMap();
    var cards = [];
    for (var i = 0; i < 30; i++) {
      var meta = V.tithiMeta(i);
      var next = nextMap[i];
      var fests = festMap[i] || [];
      var nextText = next
        ? V.fmtShort(next.date, tz) + ' · ' + A.esc(next.lunarMonthName) + (next.adhika ? ' (adhika)' : '')
        : 'not in the next 45 days';
      cards.push(
        '<article class="tithi-card ' + (meta.shubh ? 'is-shubh' : 'is-rikta') + '">' +
          '<div class="tithi-card__top"><span class="tithi-card__num">' + (i + 1) + '</span>' +
            '<span class="chip chip--gold">' + meta.paksha + '</span></div>' +
          '<h3>' + A.esc(meta.name) + ' <span class="dev">' + A.esc(meta.hi) + '</span></h3>' +
          '<p class="tithi-card__meaning">' + A.esc(meta.meaning) + ' · deity ' + A.esc(meta.deity) + ' · ' + A.esc(meta.nature) + '</p>' +
          '<p class="tithi-card__guide">' + A.esc(meta.guidance) + '</p>' +
          '<div class="tithi-card__fest">' + (fests.length
            ? fests.map(function (f) { return '<span>' + f.icon + ' ' + A.esc(f.name) + '</span>'; }).join('')
            : '<span class="muted">No major festival mapped</span>') + '</div>' +
          '<div class="tithi-card__next"><span>Next in ' + A.esc(state.city.name) + '</span><b>' + nextText + '</b></div>' +
        '</article>'
      );
    }
    el.innerHTML = cards.join('');
  }

  function renderTimeline(pc, tz) {
    var total = pc.sunset.getTime() - pc.sunrise.getTime();
    function row(label, win, cls) {
      var left = Math.max(0, Math.min(100, (win.start.getTime() - pc.sunrise.getTime()) / total * 100));
      var right = Math.max(0, Math.min(100, (win.end.getTime() - pc.sunrise.getTime()) / total * 100));
      var width = Math.max(0.4, right - left);
      return '<div class="timeline__row timeline__row--3">' +
        '<span class="t">' + label + '</span>' +
        '<div class="timeline__bar"><span class="' + cls + '" style="margin-left:' + left.toFixed(2) + '%;width:' + width.toFixed(2) + '%"></span></div>' +
        '<span class="t timeline__end">' + V.fmtTime(win.start, tz) + ' – ' + V.fmtTime(win.end, tz) + '</span></div>';
    }
    $('#panTimeline').innerHTML =
      row('Rahu Kaal', pc.rahu, 'tl-rahu') +
      row('Gulika', pc.gulika, 'tl-gulika') +
      row('Yamaganda', pc.yamaganda, 'tl-yama') +
      row('Abhijit', pc.abhijit, 'tl-abhijit');
  }

  function renderChoghadiya(pc, tz) {
    $('#panChoghadiya').innerHTML = pc.choghadiya.map(function (c) {
      var cls = c.good ? 'good' : (c.name === 'Kaal' || c.name === 'Rog' || c.name === 'Udveg' ? 'bad' : '');
      return '<div class="chogh ' + cls + '"><b>' + A.esc(c.name) + '</b><span>' + V.fmtTime(c.start, tz) + ' – ' + V.fmtTime(c.end, tz) + '</span></div>';
    }).join('');
  }

  function yearFestivals(year) {
    if (festCache[year]) return festCache[year];
    var map = V.festivalsForYear(year, state.city);
    var out = [];
    Object.keys(map).sort().forEach(function (k) {
      var tn = map[k].tithiName;
      var label = tn && typeof tn === 'object' ? tn.paksha + ' ' + tn.name : tn;
      map[k].festivals.forEach(function (f) {
        out.push({ key: k, name: f.n, icon: f.e, tithi: label, month: map[k].lunarMonth });
      });
    });
    festCache[year] = out;
    return out;
  }

  function renderFestivals(pc, tz) {
    var selected = keyOf(state.date);
    var year = state.date.getFullYear();
    var list = yearFestivals(year).concat(yearFestivals(year + 1)).filter(function (f) { return f.key >= selected; }).slice(0, 6);
    if (!list.length) {
      $('#panFestivals').innerHTML = '<p class="small muted">No major festivals in the coming weeks.</p>';
      return;
    }
    $('#panFestivals').innerHTML = list.map(function (f) {
      var d = new Date(f.key + 'T12:00:00');
      var label = d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      return '<a href="calendar.html?date=' + f.key + '" class="pan-fest-link">' +
        '<span class="pan-fest-link__icon">' + f.icon + '</span>' +
        '<span class="pan-fest-link__body"><b class="pan-fest-link__name">' + A.esc(f.name) + '</b><span class="tiny muted">' + A.esc(f.tithi) + ' · ' + A.esc(f.month) + '</span></span>' +
        '<span class="tiny pan-fest-link__date">' + label + '</span></a>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
