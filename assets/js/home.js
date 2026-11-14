/* Home page — live panchang card and content sections */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var found = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (found) city = found;
    }
  } catch (e) { /* ignore */ }

  /* ---------------------------------------------------------------- panchang */
  var HI_MONTHS_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }
  function hiShort(date, tz) {
    if (!isHi()) return V.fmtShort(date, tz);
    var p = V.localParts(date, tz);
    return p.d + ' ' + HI_MONTHS_SHORT[p.m - 1];
  }

  function renderPanchang() {
    var p;
    try { p = V.panchangForDate(new Date(), city); }
    catch (e) { return; }
    var tz = city.tz;

    $('#panchDate').textContent = hiShort(p.sunrise, tz);
    $('#panchPlace').textContent = A.place(city);
    $('#pcTithi').innerHTML = hn('paksha', p.tithi.paksha) + ' ' + hn('tithi', p.tithi.name) +
      '<small class="panch-card__sub">' + T('till ', 'समाप्त ') + V.fmtTime(p.tithi.end, tz) + '</small>';
    $('#pcNak').innerHTML = hn('nakshatra', p.nakshatra.name) +
      '<small class="panch-card__sub">' + hn('planet', p.nakshatra.lord) + T(' · pada ', ' · पाद ') + p.nakshatra.pada + '</small>';
    $('#pcRahu').textContent = V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz);
    $('#pcAbhijit').textContent = V.fmtTime(p.abhijit.start, tz) + ' – ' + V.fmtTime(p.abhijit.end, tz);
    $('#pcSunrise').textContent = V.fmtTime(p.sunrise, tz);
    $('#pcSunset').textContent = V.fmtTime(p.sunset, tz);
    $('#homeWeekday').textContent = hn('weekday', p.weekday) + ' · ' + hn('month', p.lunarMonthName) + (p.tithi.paksha === 'Shukla' ? T(' Shukla', ' शुक्ल') : T(' Krishna', ' कृष्ण'));
    $('#panchCityMeta').textContent = A.place(city) + ' · ' + A.cityMeta(city);

    var rows = [
      [T('Tithi', 'तिथि'), hn('paksha', p.tithi.paksha) + ' ' + hn('tithi', p.tithi.name), T('ends ', 'समाप्त ') + V.fmtTime(p.tithi.end, tz)],
      [T('Nakshatra', 'नक्षत्र'), hn('nakshatra', p.nakshatra.name), hn('planet', p.nakshatra.lord) + T(' · pada ', ' · पाद ') + p.nakshatra.pada],
      [T('Yoga', 'योग'), hn('yoga', p.yoga.name), T('ends ', 'समाप्त ') + V.fmtTime(p.yoga.end, tz)],
      [T('Karana', 'करण'), hn('karana', p.karana.name), T('ends ', 'समाप्त ') + V.fmtTime(p.karana.end, tz)],
      [T('Rahu Kaal', 'राहु काल'), V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz), T('avoid new beginnings', 'नई शुरुआत से बचें')],
      [T('Abhijit', 'अभिजीत'), V.fmtTime(p.abhijit.start, tz) + ' – ' + V.fmtTime(p.abhijit.end, tz), T('auspicious window', 'शुभ समय')],
      [T('Sunrise / Sunset', 'सूर्योदय / सूर्यास्त'), V.fmtTime(p.sunrise, tz) + ' / ' + V.fmtTime(p.sunset, tz), hn('weekday', p.weekday) + ' · ' + A.placeName(city.name)]
    ];
    $('#homePanchRows').innerHTML = rows.map(function (r) {
      return '<div class="pan-row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '<small>' + r[2] + '</small></span></div>';
    }).join('');
  }

  function initCitySelect() {
    var sel = $('#panchCity');
    if (!sel) return;
    sel.innerHTML = A.cityOptions(city.name);
    var search = $('#panchCitySearch');
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
      renderPanchang();
    });
  }

  /* ------------------------------------------------------------------- cards */
  function quote(list) {
    return (window.VPPromo && window.VPPromo.price)
      ? window.VPPromo.price(list)
      : { list: list, price: list, discount: 0, active: false };
  }

  function promoBadge() {
    return (window.VPPromo && window.VPPromo.copy)
      ? window.VPPromo.copy('badge')
      : '20% OFF';
  }

  function priceHtml(p) {
    var q = quote(p.price);
    return '<div class="price">' + A.INR(q.price) +
      '<small>all inclusive' + (q.discount ? ' <s class="promo-strike">' + A.INR(q.list) + '</s>' : '') + '</small>' +
      (q.discount ? '<span class="price__promo"><span class="promo-badge promo-badge--sm" data-promo-badge>' + promoBadge() + '</span></span>' : '') +
      '</div>';
  }

  function poojaCard(p) {
    return '<article class="card ritual-card card--hover reveal">' +
      '<div class="ritual-card__art">' +
      (p.popular ? '<span class="ritual-card__fav">Most booked</span>' : '') +
      '<span class="chip">' + A.esc(p.cat) + '</span>' +
      '<span class="ritual-card__emoji">' + p.icon + '</span></div>' +
      '<div class="ritual-card__body">' +
      '<h3 class="ritual-card__title">' + A.esc(p.name) + '</h3>' +
      '<div class="ritual-card__hi dev">' + A.esc(p.hi) + '</div>' +
      '<div class="ritual-card__meta"><span>' + A.icon('clock') + A.esc(p.duration) + '</span><span>' + A.icon('shield') + 'Verified pandit</span></div>' +
      '<p class="ritual-card__desc">' + A.esc(p.desc) + '</p>' +
      '<div class="ritual-card__foot">' + priceHtml(p) +
      '<a class="ritual-card__add" href="booking.html?pooja=' + p.id + '" aria-label="Book ' + A.esc(p.name) + '">Book ' + A.icon('arrow') + '</a></div>' +
      '</div></article>';
  }

  function renderFeatured() {
    var list = D.POOJAS.slice().sort(function (a, b) { return (b.popular ? 1 : 0) - (a.popular ? 1 : 0); }).slice(0, 6);
    $('#featuredPoojas').innerHTML = list.map(poojaCard).join('');
  }

  function renderFeatures() {
    $('#featureGrid').innerHTML = D.FEATURES.map(function (f) {
      return '<article class="card feature reveal"><div class="feature__icon">' + A.icon(f.icon) + '</div>' +
        '<h3>' + A.esc(f.title) + '</h3><p>' + A.esc(f.text) + '</p></article>';
    }).join('');
  }

  function renderSteps() {
    $('#howSteps').innerHTML = D.HOW_IT_WORKS.map(function (s) {
      return '<div class="step reveal"><div class="step__num">' + s.step + '</div><h3>' + A.esc(s.title) + '</h3><p>' + A.esc(s.text) + '</p></div>';
    }).join('');
  }

  function renderTestimonials() {
    $('#testimonials').innerHTML = D.TESTIMONIALS.map(function (t) {
      return '<article class="card quote reveal">' + A.stars(t.rating) +
        '<p>“' + A.esc(t.text) + '”</p>' +
        '<div class="quote__by"><span class="avatar">' + A.esc(t.name.charAt(0)) + '</span>' +
        '<span><b>' + A.esc(t.name) + '</b><span>' + A.esc(t.area) + ' · ' + A.esc(t.pooja) + '</span></span></div></article>';
    }).join('');
  }

  function renderCities() {
    var hot = D.CITIES.filter(function (c) { return c.hot; });
    var shown = (hot.length ? hot : D.CITIES).slice(0, 24);
    var more = D.CITIES.length - shown.length;
    $('#cityStrip').innerHTML = shown.map(function (c) {
      return '<span class="city-pill">' + A.icon('pin') + A.esc(c.name) + '</span>';
    }).join('') + (more > 0
      ? '<a class="city-pill city-pill--link" href="cities.html">' + A.icon('globe') + '+' + more + ' more places</a>'
      : '');
  }

  function renderFaq() {
    $('#homeFaq').innerHTML = D.FAQS.slice(0, 6).map(function (f, i) {
      return '<details class="faq__item"' + (i === 0 ? ' open' : '') + '><summary>' + A.esc(f.q) + '</summary><p>' + A.esc(f.a) + '</p></details>';
    }).join('');
  }

  function renderIcons() {
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-tick]').forEach(function (el) { el.innerHTML = A.icon('check') + '<span>' + el.textContent + '</span>'; });
    $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });
  }

  function renderSampleChart() {
    var el = $('#homeChart');
    if (!el || !window.VedicChart) return;
    try {
      var k = V.kundli({ name: 'Sample', date: '1990-01-01', time: '10:30', place: D.CITIES[0] });
      el.innerHTML = window.VedicChart.north(k, { compact: true, size: 320 });
    } catch (e) { el.innerHTML = ''; }
  }

  // The sample chart is below the fold and the kundli maths is costly.
  // Build it shortly before the visitor scrolls to it.
  function whenVisible(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (en) { return en.isIntersecting; })) return;
      io.disconnect();
      fn();
    }, { rootMargin: '240px 0px' });
    io.observe(el);
  }

  function init() {
    if (A.onLang) A.onLang(renderPanchang);
    initCitySelect();
    renderPanchang();
    renderIcons();
    // Prices follow the live launch offer; redraw when /api/offer answers.
    document.addEventListener('vp:promo', renderFeatured);
    // The sections below the hero are not part of the first paint. Rendering
    // them in small batches keeps a single long main-thread task from forming.
    var queue = [
      renderFeatured,
      renderFeatures,
      renderSteps,
      renderTestimonials,
      renderCities,
      renderFaq
    ];
    var run = function () {
      var job = queue.shift();
      if (!job) { whenVisible($('#homeChart'), renderSampleChart); return; }
      job();
      setTimeout(run, 0);
    };
    setTimeout(run, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Keep the panchang card live: refresh every minute and whenever the tab
  // becomes visible again (covers overnight sessions and bfcache restores).
  setInterval(renderPanchang, 60000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') renderPanchang();
  });
  window.addEventListener('pageshow', renderPanchang);
  window.addEventListener('focus', renderPanchang);
})();
