/* Vedic Pooja — daily rashifal: moon-sign transit readings computed by astro.js */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var ELEMENT = ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'];
  var DIRECTION = { Fire: 'East', Earth: 'South', Air: 'West', Water: 'North' };
  var COLOUR = ['Red', 'White', 'Green', 'Silver', 'Gold', 'Green', 'White / pink', 'Red', 'Yellow', 'Blue', 'Blue', 'Yellow'];
  var GEM = ['Red Coral', 'Emerald', 'Pearl', 'Pearl', 'Ruby', 'Emerald', 'Diamond', 'Red Coral', 'Yellow Sapphire', 'Blue Sapphire', 'Blue Sapphire', 'Yellow Sapphire'];
  var MANTRA = ['Om Mangalaya Namah', 'Om Shukraya Namah', 'Om Budhaya Namah', 'Om Chandraya Namah', 'Om Suryaya Namah', 'Om Budhaya Namah', 'Om Shukraya Namah', 'Om Mangalaya Namah', 'Om Gurave Namah', 'Om Shanaischaraya Namah', 'Om Shanaischaraya Namah', 'Om Gurave Namah'];
  var NUMBERS = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };

  var HOUSES = [
    { n: 1, title: 'Self & first steps', tone: 'good', text: 'The Moon sits in your first house today. Emotions are close to the surface, so lead with honesty and let your instincts set the pace. A good day for personal decisions, a new habit or simply being seen.', do: 'Start something that carries your name.', avoid: 'Reacting before you have slept on a big decision.' },
    { n: 2, title: 'Family & finances', tone: 'neutral', text: 'The Moon moves through your second house — the house of family, speech and savings. Conversations about money or home may surface. Steady words and a written budget keep the day calm.', do: 'Review a bill, a budget or a family plan.', avoid: 'Impulse purchases and sharp words at the dinner table.' },
    { n: 3, title: 'Courage & communication', tone: 'good', text: 'The Moon is in your third house, which favours courage, siblings and short journeys. Messages you have been postponing can be sent today; your words carry more weight than usual.', do: 'Make the call, send the message, take the short trip.', avoid: 'Over-explaining yourself to people who are not listening.' },
    { n: 4, title: 'Home & inner peace', tone: 'tough', text: 'The Moon is in your fourth house — home, mother and emotional security. The mind wants rest rather than performance. Create a quiet corner, cook something familiar and protect your evening.', do: 'Tidy one room and spend time with family.', avoid: 'Big property decisions or confrontations at home.' },
    { n: 5, title: 'Creativity & children', tone: 'neutral', text: 'The Moon lights your fifth house of creativity, romance and children. Ideas flow easily, but focus needs a gentle structure. Play, teach, write or practise — the day rewards expression more than output.', do: 'Create, teach or spend time with children.', avoid: 'Speculative bets and emotional over-investment.' },
    { n: 6, title: 'Work & wellbeing', tone: 'good', text: 'The Moon is in your sixth house, the house of service, health and daily routines. Small disciplined actions compound today. Clear the backlog, keep the meal simple and finish one nagging task.', do: 'Finish the task you keep avoiding.', avoid: 'Skipping meals or letting stress borrow tomorrow’s energy.' },
    { n: 7, title: 'Partnership & balance', tone: 'good', text: 'The Moon transits your seventh house of partnership and public dealings. Other people are mirrors today — listen first and the negotiation becomes easier. Good for meetings, agreements and repairing a bond.', do: 'Have the honest one-to-one conversation.', avoid: 'Keeping score or winning an argument at the cost of the relationship.' },
    { n: 8, title: 'Depth & transformation', tone: 'tough', text: 'The Moon travels your eighth house of hidden matters, research and shared resources. Intensity is high; certainty is low. Avoid signing in haste and let information surface before you act.', do: 'Study, investigate, clear old paperwork.', avoid: 'Loans, secrecy and decisions made from fear.' },
    { n: 9, title: 'Fortune & dharma', tone: 'neutral', text: 'The Moon is in your ninth house of dharma, teachers and long journeys. Perspective widens today. A conversation with an elder, a prayer or a plan for travel can shift how a problem looks.', do: 'Seek guidance and plan the longer journey.', avoid: 'Cynicism and dismissing advice too quickly.' },
    { n: 10, title: 'Career & visibility', tone: 'good', text: 'The Moon reaches your tenth house of career and public life. Effort is visible and superiors are receptive. Put the important meeting or submission in the first half of the day and keep the message simple.', do: 'Send the proposal and ask for the decision.', avoid: 'Office politics and emotional public statements.' },
    { n: 11, title: 'Gains & community', tone: 'good', text: 'The Moon is in your eleventh house of gains, friends and networks. People want to help. Reach out, follow up and collect the support you have earned — a group or community is your lucky channel today.', do: 'Follow up on an opportunity and thank your network.', avoid: 'Over-promising time or money you cannot spare.' },
    { n: 12, title: 'Rest & release', tone: 'tough', text: 'The Moon is in your twelfth house of sleep, expenses and foreign matters. Energy is inward, not outward. Declutter, forgive, finish quietly and protect your sleep. This is a recharge day, not a scoreboard day.', do: 'Rest, meditate, clear expenses and old files.', avoid: 'Forcing a confrontation or starting a large purchase.' }
  ];

  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var found = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (found) city = found;
    }
  } catch (e) { /* ignore */ }

  var state = { y: 0, m: 0, d: 0, selected: 0 };
  var followingToday = true;
  try {
    var prev = A.store.get('vp_rashi_index', null);
    if (typeof prev === 'number' && prev >= 0 && prev < 12) state.selected = prev;
  } catch (e2) { /* ignore */ }

  function todayParts() {
    var n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
  }
  function iso() { return state.y + '-' + A.pad(state.m) + '-' + A.pad(state.d); }
  function setDate(p) { state.y = p.y; state.m = p.m; state.d = p.d; }
  function addDays(n) {
    var x = new Date(state.y, state.m - 1, state.d, 12);
    x.setDate(x.getDate() + n);
    setDate({ y: x.getFullYear(), m: x.getMonth() + 1, d: x.getDate() });
  }

  function compute() {
    try { return V.panchang(state.y, state.m, state.d, city); }
    catch (e) { return null; }
  }

  function scoreFor(p, h) {
    var s = h.tone === 'good' ? 4.4 : (h.tone === 'neutral' ? 3.2 : 2.1);
    s += p.tithi.shubh ? .4 : -.3;
    var nat = p.nakshatra.nature;
    s += (nat === 'Kshipra' || nat === 'Chara' || nat === 'Mridu' || nat === 'Dhruva') ? .2 : -.2;
    s += p.yoga.shubh ? .3 : -.3;
    s += p.tithi.paksha === 'Shukla' ? .2 : -.2;
    s = Math.max(1, Math.min(5, s));
    return Math.round(s * 2) / 2;
  }

  function stars(score) {
    var full = Math.floor(score);
    var half = score - full >= .5;
    var out = '';
    for (var i = 0; i < 5; i++) {
      if (i < full) out += '★';
      else if (i === full && half) out += '⯨';
      else out += '☆';
    }
    return out;
  }

  function label(score) {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Strong';
    if (score >= 2.8) return 'Steady';
    if (score >= 2) return 'Mixed';
    return 'Careful';
  }

  function renderSummary(p) {
    if (!p) return;
    var d = $('#rashSummary');
    if (!d) return;
    var dateEl = $('.rash-summary__date b', d);
    var placeEl = $('.rash-summary__date span', d);
    if (dateEl) dateEl.textContent = V.fmtShort(p.sunrise, city.tz);
    if (placeEl) placeEl.textContent = p.weekday + ' · ' + city.name + ', ' + city.state;
    var rows = $('#rashSummaryRows');
    if (rows) {
      var tz = city.tz;
      var moonRashi = V.RASHIS[p.moonSign];
      rows.innerHTML = [
        ['Tithi', p.tithi.paksha + ' ' + p.tithi.name],
        ['Nakshatra', p.nakshatra.name + ' · pada ' + p.nakshatra.pada],
        ['Yoga', p.yoga.name],
        ['Moon in', moonRashi.s + ' (' + moonRashi.n + ')'],
        ['Sunrise / sunset', V.fmtTime(p.sunrise, tz) + ' / ' + V.fmtTime(p.sunset, tz)],
        ['Rahu Kaal', V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz)]
      ].map(function (r) {
        return '<div class="rash-summary__row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
      }).join('');
    }
    var wd = $('#rashWeekday');
    if (wd) wd.textContent = p.weekday + ' · ' + p.nakshatra.name + ' nakshatra';
  }

  function renderGrid(p) {
    var grid = $('#rashiGrid');
    if (!grid || !p) return;
    grid.innerHTML = V.RASHIS.map(function (r, i) {
      var house = HOUSES[((p.moonSign - i + 12) % 12)];
      var sc = scoreFor(p, house);
      var active = i === state.selected;
      return '<button type="button" class="rashi-card xp-depth' + (active ? ' is-active' : '') + '" data-i="' + i + '" aria-pressed="' + active + '">' +
        '<span class="rashi-card__glyph" aria-hidden="true">' + SIGNS[i] + '</span>' +
        '<span class="rashi-card__name"><b>' + r.s + '</b><small>' + r.n + ' · ' + r.hi + '</small></span>' +
        '<span class="rashi-card__house">Moon in house ' + house.n + '</span>' +
        '<span class="rashi-card__stars" aria-label="' + sc + ' out of 5">' + stars(sc) + '</span>' +
        '<span class="rashi-card__tone">' + label(sc) + ' · ' + house.title + '</span>' +
        '</button>';
    }).join('');
    $$('.rashi-card', grid).forEach(function (el) {
      el.addEventListener('click', function () {
        state.selected = Number(el.getAttribute('data-i'));
        try { A.store.set('vp_rashi_index', state.selected); } catch (e) { /* ignore */ }
        $$('.rashi-card', grid).forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-pressed', 'false');
        });
        el.classList.add('is-active');
        el.setAttribute('aria-pressed', 'true');
        renderDetail(p);
      });
    });
  }

  function renderDetail(p) {
    var box = $('#rashiDetail');
    if (!box || !p) return;
    var i = state.selected;
    var r = V.RASHIS[i];
    var h = HOUSES[((p.moonSign - i + 12) % 12)];
    var sc = scoreFor(p, h);
    var tz = city.tz;
    var good = p.choghadiya.filter(function (c) { return c.good; }).slice(0, 2);
    var lagna = p.weekday + ' is ruled by ' + ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][p.weekdayIndex] + '.';
    var tithiLine = p.tithi.shubh
      ? 'The ' + p.tithi.paksha + ' ' + p.tithi.name + ' tithi supports new beginnings — ' + p.tithi.guidance
      : 'The ' + p.tithi.paksha + ' ' + p.tithi.name + ' tithi is a Rikta day — keep the focus on clearing and completing rather than launching.';
    box.innerHTML =
      '<div class="panel__head"><div class="rashi-detail__title"><span class="rashi-detail__glyph">' + SIGNS[i] + '</span>' +
      '<div><h2>' + r.s + ' <span class="muted">· ' + r.n + '</span></h2><p class="small">' + r.hi + ' · ruled by ' + r.lord + ' · ' + ELEMENT[i] + ' sign · Moon in house ' + h.n + '</p></div></div>' +
      '<span class="chip chip--gold">' + label(sc) + ' · ' + sc + '/5</span></div>' +
      '<div class="panel__body">' +
      '<p class="rashi-detail__lead">' + h.text + '</p>' +
      '<p class="small muted mt-2">' + lagna + ' ' + tithiLine + '</p>' +
      '<div class="rashi-lucky">' +
      '<div><span>Lucky colour</span><b>' + COLOUR[i] + '</b></div>' +
      '<div><span>Lucky number</span><b>' + (NUMBERS[r.lord] || 5) + '</b></div>' +
      '<div><span>Direction</span><b>' + DIRECTION[ELEMENT[i]] + '</b></div>' +
      '<div><span>Gemstone</span><b>' + GEM[i] + '</b></div>' +
      '</div>' +
      '<div class="rashi-do">' +
      '<div><h3>Do</h3><ul><li>' + h.do + '</li><li>' + p.nakshatra.name + ' nakshatra favours ' + (p.nakshatra.nature === 'Kshipra' ? 'quick, decisive action' : (p.nakshatra.nature === 'Mridu' ? 'gentle, creative work' : 'steady, well-planned effort')) + '.</li>' +
      (good.length ? '<li>Use the ' + good.map(function (g) { return g.name + ' window (' + V.fmtTime(g.start, tz) + '–' + V.fmtTime(g.end, tz) + ')'; }).join(' or ') + ' for anything important.</li>' : '') +
      '</ul></div>' +
      '<div><h3>Avoid</h3><ul><li>' + h.avoid + '</li><li>Rahu Kaal ' + V.fmtTime(p.rahu.start, tz) + '–' + V.fmtTime(p.rahu.end, tz) + ' for new starts.</li>' +
      (!p.tithi.shubh ? '<li>Avoid launching a major purchase or signing on this tithi.</li>' : '') +
      (!p.yoga.shubh ? '<li>' + p.yoga.name + ' yoga is considered weak — postpone risky travel.</li>' : '') +
      '</ul></div>' +
      '</div>' +
      '<div class="rashi-mantra"><span data-ico-inline="om"></span><div><b>Mantra for ' + r.s + '</b><p>' + MANTRA[i] + ' — 108 times at sunrise, facing ' + DIRECTION[ELEMENT[i]] + '.</p></div></div>' +
      '<div class="hero__cta mt-3"><a class="btn btn--primary btn--sm" href="kundli.html">Confirm my moon sign</a><a class="btn btn--ghost btn--sm" href="panchang.html?city=' + encodeURIComponent(city.name) + '">Full panchang</a></div>' +
      '</div>';
    $$('[data-ico-inline]', box).forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
  }

  function render() {
    var p = compute();
    if (!p) return;
    var dateInp = $('#rashDate');
    if (dateInp) dateInp.value = iso();
    renderSummary(p);
    renderGrid(p);
    renderDetail(p);
  }

  function init() {
    $$('[data-prev]').forEach(function (b) { b.innerHTML = A.icon('arrowLeft'); });
    $$('[data-next]').forEach(function (b) { b.innerHTML = A.icon('arrow'); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });

    var q = /[?&]date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (q) setDate({ y: Number(q[1]), m: Number(q[2]), d: Number(q[3]) });
    else setDate(todayParts());
    followingToday = sameDay(todayParts());

    var dateInp = $('#rashDate');
    if (dateInp) {
      dateInp.value = iso();
      dateInp.addEventListener('change', function () {
        if (!dateInp.value) return;
        var parts = dateInp.value.split('-').map(Number);
        setDate({ y: parts[0], m: parts[1], d: parts[2] });
        followingToday = sameDay(todayParts());
        render();
      });
    }
    var prev = $('#rashPrev'), next = $('#rashNext'), today = $('#rashToday');
    if (prev) prev.addEventListener('click', function () { addDays(-1); followingToday = sameDay(todayParts()); render(); });
    if (next) next.addEventListener('click', function () { addDays(1); followingToday = sameDay(todayParts()); render(); });
    if (today) today.addEventListener('click', function () { setDate(todayParts()); followingToday = true; render(); });

    var sel = $('#rashCity');
    if (sel) {
      sel.innerHTML = A.cityOptions(city.name);
      var search = $('#rashCitySearch');
      if (search) {
        search.addEventListener('input', function () {
          var keep = sel.value;
          sel.innerHTML = A.cityOptions(keep, search.value);
          if (keep) sel.value = keep;
        });
      }
      sel.addEventListener('change', function () {
        var found = A.findCity(sel.value);
        if (!found) return;
        city = found;
        A.store.set('vp_city', city.name);
        render();
      });
    }

    var cityQ = /[?&]city=([^&]+)/.exec(location.search);
    if (cityQ) {
      var name = decodeURIComponent(cityQ[1].replace(/\+/g, ' '));
      var hit = D.CITIES.filter(function (c) { return c.name === name; })[0];
      if (hit) { city = hit; if (sel) sel.value = city.name; }
    }

    render();
  }

  /* The horoscope is for a date. If that date is today, refresh it at
     midnight and when the tab wakes up, without disturbing a chosen date. */
  function sameDay(t) { return state.y === t.y && state.m === t.m && state.d === t.d; }
  function liveTick() {
    var t = todayParts();
    if (!sameDay(t) && !followingToday) return;
    if (!sameDay(t)) setDate(t);
    render();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') liveTick();
  });
  window.addEventListener('pageshow', liveTick);
  window.addEventListener('focus', liveTick);
  setInterval(liveTick, 60000);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
