/* Panchang page — daily timings, windows, choghadiya and upcoming festivals */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var HI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  var HI_MONTHS_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
  var EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var EN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }

  function iso(d) { return d.getFullYear() + '-' + A.pad(d.getMonth() + 1) + '-' + A.pad(d.getDate()); }
  function parts(s) { var p = s.split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() + n); return x; }
  function keyOf(d) { return iso(d); }

  function fmtDuration(ms) {
    var m = Math.round(ms / 60000);
    return Math.floor(m / 60) + T('h ', ' घंटे ') + A.pad(m % 60) + T('m', ' मिनट');
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

  function hiShort(date, tz) {
    if (!isHi()) return V.fmtShort(date, tz);
    var p = V.localParts(date, tz);
    return p.d + ' ' + HI_MONTHS_SHORT[p.m - 1];
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

    A.onLang(function () {
      festCache = {};
      guideKey = '';
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

    /* hero */
    $('#panDay').textContent = p.d;
    $('#panMonth').textContent = (isHi() ? HI_MONTHS[p.m - 1] : EN_MONTHS[p.m - 1]) + ' ' + p.y;
    $('#panWeekdayPill').textContent = hn('weekday', pc.weekday);
    $('#panWeekday').textContent = hn('weekday', pc.weekday) + ' · ' + hn('month', pc.lunarMonthName) + ' ' + hn('paksha', pc.tithi.paksha);
    $('#panTithiBig').textContent = hn('paksha', pc.tithi.paksha) + ' ' + hn('tithi', pc.tithi.name);
    $('#panNakBig').textContent = hn('nakshatra', pc.nakshatra.name) + T(' Nakshatra · ', ' नक्षत्र · ') + hn('planet', pc.nakshatra.lord) + T(' · pada ', ' · पाद ') + pc.nakshatra.pada;
    $('#panCityChip').textContent = A.placeName(state.city.name) + ' · ' + A.cityMeta(state.city);
    var guideCity = $('#panGuideCity');
    if (guideCity) guideCity.textContent = A.placeName(state.city.name);

    $$('[data-meta]').forEach(function (el) {
      var k = el.getAttribute('data-meta');
      if (k === 'sunrise') el.innerHTML = A.icon('sun') + V.fmtTime(pc.sunrise, tz);
      if (k === 'sunset') el.innerHTML = A.icon('moon') + V.fmtTime(pc.sunset, tz);
      if (k === 'moon') el.innerHTML = A.icon('star') + (isHi() ? V.RASHIS[pc.moonSign].hi : V.RASHIS[pc.moonSign].n) + T(' Moon', ' चंद्र');
      if (k === 'month') el.innerHTML = A.icon('calendar') + hn('month', pc.lunarMonthName) + (pc.lunarMonth ? T(' month', ' मास') : '');
    });

    var panchakText = pc.panchak.active
      ? T('Active', 'सक्रिय') + (pc.panchak.end ? T(' · ends ', ' · समाप्त ') + V.fmtTime(pc.panchak.end, tz) : '')
      : (pc.panchak.start ? T('Starts ', 'आरंभ ') + V.fmtTime(pc.panchak.start, tz) : T('Not active', 'सक्रिय नहीं'));
    var panchakSub = pc.panchak.end
      ? (pc.panchak.active ? T('moon in Dhanishta–Revati', 'चंद्रमा धनिष्ठा–रेवती में') : T('ends ', 'समाप्त ') + V.fmtTime(pc.panchak.end, tz))
      : T('no Panchak in the next five days', 'अगले पाँच दिनों में पंचक नहीं');
    var bhadraText = pc.bhadra.active
      ? T('Active', 'सक्रिय') + (pc.bhadra.end ? T(' · ends ', ' · समाप्त ') + V.fmtTime(pc.bhadra.end, tz) : '')
      : T('Not active', 'सक्रिय नहीं');

    $('#panRows').innerHTML = [
      rowHtml(T('Tithi', 'तिथि'), hn('paksha', pc.tithi.paksha) + ' ' + hn('tithi', pc.tithi.name),
        fmtWindow(pc.tithi.start, pc.tithi.end, tz) + T(' · then ', ' · फिर ') + hn('paksha', pc.tithi.nextPaksha) + ' ' + hn('tithi', pc.tithi.nextName)),
      rowHtml(T('Tithi nature', 'तिथि प्रकृति'), hn('tithiNature', pc.tithi.nature),
        hn('tithiMeaning', pc.tithi.name) + T(' · deity ', ' · देवता ') + hn('tithiDeity', pc.tithi.name)),
      rowHtml(T('Nakshatra', 'नक्षत्र'), hn('nakshatra', pc.nakshatra.name) + T(' · pada ', ' · पाद ') + pc.nakshatra.pada,
        hn('planet', pc.nakshatra.lord) + ' · ' + hn('deity', pc.nakshatra.deity) + T(' · ends ', ' · समाप्त ') + V.fmtTime(pc.nakshatra.end, tz)),
      rowHtml(T('Yoga', 'योग'), hn('yoga', pc.yoga.name),
        hn('yogaMeaning', pc.yoga.meaning) + T(' · ends ', ' · समाप्त ') + V.fmtTime(pc.yoga.end, tz)),
      rowHtml(T('Karana', 'करण'), hn('karana', pc.karana.name),
        hn('karanaMeaning', pc.karana.meaning) + T(' · ends ', ' · समाप्त ') + V.fmtTime(pc.karana.end, tz)),
      rowHtml(T('Paksha', 'पक्ष'), hn('paksha', pc.tithi.paksha) + T(' paksha', ' पक्ष'),
        pc.tithi.paksha === 'Shukla' ? T('waxing moon', 'बढ़ता चंद्रमा') : T('waning moon', 'घटता चंद्रमा')),
      rowHtml(T('Lunar month', 'चंद्र मास'), hn('month', pc.lunarMonthName) + (pc.adhika ? T(' (adhika)', ' (अधिक)') : ''),
        T('Vikram Samvat ', 'विक्रम संवत ') + pc.samvat + T(' · Shaka ', ' · शक ') + pc.shaka),
      rowHtml(T('Ritu / Ayana', 'ऋतु / अयन'), hn('ritu', pc.ritu) + ' · ' + hn('ayana', pc.ayana), T('six-season Vedic year', 'छह-ऋतु वैदिक वर्ष')),
      rowHtml(T('Sun / Moon sign', 'सूर्य / चंद्र राशि'), (isHi() ? V.RASHIS[pc.sunSign].hi : V.RASHIS[pc.sunSign].n) + ' / ' + (isHi() ? V.RASHIS[pc.moonSign].hi : V.RASHIS[pc.moonSign].n), T('sidereal · Lahiri', 'निरयण · लाहिरी')),
      rowHtml(T('Solar month', 'सौर मास'), pc.solarMonth, T('Sun’s sidereal sign', 'सूर्य की निरयण राशि')),
      rowHtml(T('Sunrise / Sunset', 'सूर्योदय / सूर्यास्त'), V.fmtTime(pc.sunrise, tz) + ' / ' + V.fmtTime(pc.sunset, tz), T('day length ', 'दिन की लंबाई ') + fmtDuration(pc.dayLength)),
      rowHtml(T('Moonrise / Moonset', 'चंद्रोदय / चंद्रास्त'), V.fmtTime(pc.moonrise, tz) + ' / ' + V.fmtTime(pc.moonset, tz),
        hn('moonPhase', pc.moonPhase.name) + ' · ' + Math.round(pc.moonIllumination * 100) + T('% illuminated', '% प्रकाशित')),
      rowHtml(T('Panchak', 'पंचक'), panchakText, panchakSub),
      rowHtml(T('Bhadra', 'भद्रा'), bhadraText, pc.bhadra.active ? T('Vishti karana — hold new beginnings', 'विष्टि करण — नई शुरुआत टालें') : T('Vishti karana is not running', 'विष्टि करण नहीं चल रहा')),
      rowHtml(T('Ayanamsa', 'अयनांश'), pc.ayanamsa.toFixed(3) + '°', T('Julian day ', 'जूलियन दिन ') + pc.julianDay.toFixed(4))
    ].join('');

    /* at a glance */
    $('#glSunrise').textContent = V.fmtTime(pc.sunrise, tz);
    $('#glSunset').textContent = V.fmtTime(pc.sunset, tz);
    $('#glMoonrise').textContent = V.fmtTime(pc.moonrise, tz);
    $('#glMoonset').textContent = V.fmtTime(pc.moonset, tz);
    $('#glRahu').textContent = V.fmtTime(pc.rahu.start, tz) + ' – ' + V.fmtTime(pc.rahu.end, tz);
    $('#glAbhijit').textContent = V.fmtTime(pc.abhijit.start, tz) + ' – ' + V.fmtTime(pc.abhijit.end, tz);
    $('#glBrahma').textContent = V.fmtTime(pc.brahma.start, tz) + ' – ' + V.fmtTime(pc.brahma.end, tz);
    $('#glPanchak').textContent = pc.panchak.active ? T('Active', 'सक्रिय') : (pc.panchak.start ? T('From ', 'से ') + V.fmtTime(pc.panchak.start, tz) : '—');
    $('#glBhadra').textContent = pc.bhadra.active ? T('Active', 'सक्रिय') : T('No', 'नहीं');
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
      ? t.festivals.map(function (f) { return '<span class="chip chip--gold">' + f.icon + ' ' + A.esc(hn('festival', f.name)) + '</span>'; }).join('')
      : '<span class="chip">' + T('No major festival today', 'आज कोई प्रमुख त्योहार नहीं') + '</span>';
    $('#panTithiFocus').innerHTML =
      '<div class="tithi-focus__main">' +
        '<div class="tithi-focus__top">' +
          '<span class="tithi-focus__paksha">' + A.esc(hn('paksha', t.paksha)) + T(' paksha · ', ' पक्ष · ') + A.esc(hn('tithiNature', t.nature)) + '</span>' +
          '<span class="chip ' + (t.shubh ? 'chip--green' : 'chip--gold') + '">' + (t.shubh ? T('Auspicious', 'शुभ') : T('Hold new beginnings', 'नई शुरुआत टालें')) + '</span>' +
        '</div>' +
        '<h3>' + A.esc(hn('tithi', t.name)) + (isHi() ? '' : ' <span class="dev">' + A.esc(t.hi) + '</span>') + '</h3>' +
        '<p class="tithi-focus__meaning">' + A.esc(hn('tithiMeaning', t.name)) + T(' · deity ', ' · देवता ') + A.esc(hn('tithiDeity', t.name)) + '</p>' +
        '<div class="tithi-focus__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '"><span style="width:' + pct.toFixed(1) + '%"></span></div>' +
        '<p class="tithi-focus__guidance">' + A.esc(hn('tithiGuidance', t.name)) + '</p>' +
        '<div class="tithi-focus__fests">' + fests + '</div>' +
      '</div>' +
      '<div class="tithi-focus__side">' +
        '<div><span>' + T('Tithi window', 'तिथि अवधि') + '</span><b>' + fmtWindow(t.start, t.end, tz) + '</b></div>' +
        '<div><span>' + T('Next tithi', 'अगली तिथि') + '</span><b>' + A.esc(hn('paksha', t.nextPaksha)) + ' ' + A.esc(hn('tithi', t.nextName)) + '</b></div>' +
        '<div><span>' + T('Moon', 'चंद्र') + '</span><b>' + A.esc(hn('moonPhase', pc.moonPhase.name)) + ' · ' + Math.round(pc.moonIllumination * 100) + '%</b></div>' +
        '<div><span>' + T('Moonrise', 'चंद्रोदय') + '</span><b>' + V.fmtTime(pc.moonrise, tz) + '</b></div>' +
      '</div>';
  }

  function renderHora(pc, tz) {
    function block(title, list) {
      return '<div class="hora-block"><div class="hora-block__head">' + title + '</div><div class="hora-grid">' +
        list.map(function (h) {
          return '<div class="hora"><span class="hora__n">' + h.index + '</span><b>' + A.esc(hn('planet', h.lord)) + '</b><span>' +
            V.fmtTime(h.start, tz) + ' – ' + V.fmtTime(h.end, tz) + '</span></div>';
        }).join('') + '</div></div>';
    }
    var day = pc.hora.filter(function (h) { return h.day; });
    var night = pc.hora.filter(function (h) { return !h.day; });
    $('#panHora').innerHTML = block(T('Day horas', 'दिन की होरा'), day) + block(T('Night horas', 'रात की होरा'), night);
  }

  function renderTithiGuide() {
    var key = state.city.name + '|' + keyOf(state.date) + '|' + (isHi() ? 'hi' : 'en');
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
        ? hiShort(next.date, tz) + ' · ' + A.esc(hn('month', next.lunarMonthName)) + (next.adhika ? T(' (adhika)', ' (अधिक)') : '')
        : T('not in the next 45 days', 'अगले 45 दिनों में नहीं');
      cards.push(
        '<article class="tithi-card ' + (meta.shubh ? 'is-shubh' : 'is-rikta') + '">' +
          '<div class="tithi-card__top"><span class="tithi-card__num">' + (i + 1) + '</span>' +
            '<span class="chip chip--gold">' + hn('paksha', meta.paksha) + '</span></div>' +
          '<h3>' + A.esc(hn('tithi', meta.name)) + (isHi() ? '' : ' <span class="dev">' + A.esc(meta.hi) + '</span>') + '</h3>' +
          '<p class="tithi-card__meaning">' + A.esc(hn('tithiMeaning', meta.name)) + T(' · deity ', ' · देवता ') + A.esc(hn('tithiDeity', meta.name)) + ' · ' + A.esc(hn('tithiNature', meta.nature)) + '</p>' +
          '<p class="tithi-card__guide">' + A.esc(hn('tithiGuidance', meta.name)) + '</p>' +
          '<div class="tithi-card__fest">' + (fests.length
            ? fests.map(function (f) { return '<span>' + f.icon + ' ' + A.esc(hn('festival', f.name)) + '</span>'; }).join('')
            : '<span class="muted">' + T('No major festival mapped', 'कोई प्रमुख त्योहार मैप नहीं') + '</span>') + '</div>' +
          '<div class="tithi-card__next"><span>' + T('Next in ', 'अगली बार ') + A.esc(A.placeName(state.city.name)) + '</span><b>' + nextText + '</b></div>' +
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
      row(T('Rahu Kaal', 'राहु काल'), pc.rahu, 'tl-rahu') +
      row(T('Gulika', 'गुलिक'), pc.gulika, 'tl-gulika') +
      row(T('Yamaganda', 'यमगंड'), pc.yamaganda, 'tl-yama') +
      row(T('Abhijit', 'अभिजीत'), pc.abhijit, 'tl-abhijit');
  }

  function renderChoghadiya(pc, tz) {
    $('#panChoghadiya').innerHTML = pc.choghadiya.map(function (c) {
      var cls = c.good ? 'good' : (c.name === 'Kaal' || c.name === 'Rog' || c.name === 'Udveg' ? 'bad' : '');
      return '<div class="chogh ' + cls + '"><b>' + A.esc(hn('choghadiya', c.name)) + '</b><span>' + V.fmtTime(c.start, tz) + ' – ' + V.fmtTime(c.end, tz) + '</span></div>';
    }).join('');
  }

  function yearFestivals(year) {
    var cacheKey = year + '|' + (isHi() ? 'hi' : 'en');
    if (festCache[cacheKey]) return festCache[cacheKey];
    var map = V.festivalsForYear(year, state.city);
    var out = [];
    Object.keys(map).sort().forEach(function (k) {
      var tn = map[k].tithiName;
      var label = tn && typeof tn === 'object' ? hn('paksha', tn.paksha) + ' ' + hn('tithi', tn.name) : tn;
      map[k].festivals.forEach(function (f) {
        out.push({ key: k, name: f.n, icon: f.e, tithi: label, month: hn('month', map[k].lunarMonth) });
      });
    });
    festCache[cacheKey] = out;
    return out;
  }

  function renderFestivals(pc, tz) {
    var selected = keyOf(state.date);
    var year = state.date.getFullYear();
    var list = yearFestivals(year).concat(yearFestivals(year + 1)).filter(function (f) { return f.key >= selected; }).slice(0, 6);
    if (!list.length) {
      $('#panFestivals').innerHTML = '<p class="small muted">' + T('No major festivals in the coming weeks.', 'आने वाले सप्ताहों में कोई प्रमुख त्योहार नहीं।') + '</p>';
      return;
    }
    $('#panFestivals').innerHTML = list.map(function (f) {
      var d = new Date(f.key + 'T12:00:00');
      var label = d.getDate() + ' ' + (isHi() ? HI_MONTHS_SHORT[d.getMonth()] : EN_MONTHS_SHORT[d.getMonth()]);
      return '<a href="calendar.html?date=' + f.key + '" class="pan-fest-link">' +
        '<span class="pan-fest-link__icon">' + f.icon + '</span>' +
        '<span class="pan-fest-link__body"><b class="pan-fest-link__name">' + A.esc(hn('festival', f.name)) + '</b><span class="tiny muted">' + A.esc(f.tithi) + ' · ' + A.esc(f.month) + '</span></span>' +
        '<span class="tiny pan-fest-link__date">' + label + '</span></a>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
