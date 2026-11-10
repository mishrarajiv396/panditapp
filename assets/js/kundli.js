/* Kundli generator — full D1/D9 chart, grahas, doshas, dasha and remedies */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D || !window.VedicChart) return;
  var $ = A.$, $$ = A.$$;

  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var f = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (f) city = f;
    }
  } catch (e) { /* ignore */ }

  function updateCityMeta() {
    var el = $('#kCityMeta');
    var sel = $('#kCity');
    if (!el || !sel) return;
    var place = A.findCity(sel.value);
    el.textContent = place ? place.name + ', ' + place.state + ' · ' + A.cityMeta(place) : '—';
  }

  function init() {
    $$('[data-tick]').forEach(function (el) { el.innerHTML = A.icon('check') + '<span>' + el.textContent + '</span>'; });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    var pa = $('[data-print-icon]'); if (pa) pa.innerHTML = A.icon('print');
    var sa = $('#kSubmitArrow'); if (sa) sa.innerHTML = A.icon('arrow');

    var citySel = $('#kCity');
    citySel.innerHTML = A.cityOptions(city.name);
    var citySearch = $('#kCitySearch');
    if (citySearch) {
      citySearch.addEventListener('input', function () {
        var keep = citySel.value;
        citySel.innerHTML = A.cityOptions(keep, citySearch.value);
        if (keep) citySel.value = keep;
        updateCityMeta();
      });
    }
    citySel.addEventListener('change', updateCityMeta);
    updateCityMeta();

    var dateInp = $('#kDate');
    var today = new Date();
    dateInp.max = today.getFullYear() + '-' + A.pad(today.getMonth() + 1) + '-' + A.pad(today.getDate());

    var timeInp = $('#kTime');
    $('#kUnknownTime').addEventListener('change', function (e) {
      if (e.target.checked) { timeInp.value = '12:00'; timeInp.disabled = true; }
      else timeInp.disabled = false;
    });

    $('#kSampleChart').innerHTML = sampleChart();

    $('#kSample').addEventListener('click', function () {
      $('#kName').value = 'Aarav Mehta';
      dateInp.value = '1990-01-01';
      timeInp.value = '10:30';
      timeInp.disabled = false;
      $('#kUnknownTime').checked = false;
      citySel.value = 'Gurugram';
      if ($('#kCitySearch')) $('#kCitySearch').value = '';
      citySel.innerHTML = A.cityOptions(citySel.value);
      updateCityMeta();
      $('#kGender').value = 'Male';
      generate();
    });

    $('#kundliForm').addEventListener('submit', function (e) {
      e.preventDefault();
      generate();
    });

    $('#kPrint').addEventListener('click', function () { window.print(); });
  }

  function sampleChart() {
    try {
      var k = V.kundli({ name: 'Sample', date: '1990-01-01', time: '10:30', place: D.CITIES[0] });
      return window.VedicChart.north(k, { compact: true, size: 300 });
    } catch (e) { return ''; }
  }

  function generate() {
    var name = $('#kName').value.trim();
    var date = $('#kDate').value;
    var time = $('#kTime').value || '12:00';
    var place = A.findCity($('#kCity').value);

    if (!name) { $('#kName').focus(); A.toast('Please enter a name for the chart', 'error'); return; }
    if (!date) { $('#kDate').focus(); A.toast('Please choose a birth date', 'error'); return; }
    if (date > $('#kDate').max) { A.toast('Birth date cannot be in the future', 'error'); return; }
    if (!time) { A.toast('Please enter a birth time or tick “I don’t know”', 'error'); return; }

    var k;
    try {
      k = V.kundli({ name: name, date: date, time: time, place: place });
    } catch (err) {
      A.toast('Could not compute the chart — please check the details', 'error');
      return;
    }

    render(k, name, date, time, place);

    A.store.set('vp_city', place.name);
    $('#kundliEmpty').classList.add('hide');
    $('#kundliResult').classList.remove('hide');
    var top = $('#kReport').getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function render(k, name, date, time, place) {
    var rashi = V.RASHIS;
    var d = new Date(date + 'T00:00:00');
    var dateLabel = d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear();

    $('#kResultName').textContent = name + ' · Janma Kundli';
    $('#kResultBirth').textContent = dateLabel + ' · ' + time + ' · ' + place.name + ', ' + place.state;
    $('#kChartD1').innerHTML = window.VedicChart.north(k, { size: 340 });
    $('#kChartD9').innerHTML = window.VedicChart.north(k, { size: 340, d9: true });
    $('#kPlanets').innerHTML = window.VedicChart.planetTable(k);

    $('#kMeta').innerHTML = [
      ['Lagna', rashi[k.asc.sign].n + ' ' + Math.floor(k.asc.deg) + '°'],
      ['Lagna nakshatra', k.asc.nakshatra + ' · pada ' + k.asc.pada],
      ['Moon sign', rashi[k.moonSign].n],
      ['Sun sign', rashi[k.sunSign].n],
      ['Nakshatra', k.moonNakshatra + ' · pada ' + k.moonPada],
      ['Ayanamsa', k.ayanamsa.toFixed(2) + '°'],
      ['Lagna lord', k.asc.lord],
      ['Dasha balance', k.dashaBalance.text + ' ' + k.dashaBalance.lord],
      ['Moon phase', Math.round(k.moonPhase.illumination * 100) + '% · ' + k.moonPhase.name]
    ].map(function (m) {
      return '<div><span>' + m[0] + '</span><b>' + A.esc(m[1]) + '</b></div>';
    }).join('');

    renderBirthPanchang(k);
    renderDoshas(k);
    renderDashas(k);
    renderRemedies(k);
  }

  function birthRow(k, v, sub) {
    return '<div class="pan-row"><span class="k">' + k + '</span><span class="v">' + v + (sub ? '<small>' + sub + '</small>' : '') + '</span></div>';
  }

  function renderBirthPanchang(k) {
    var bp = k.birthPanchang;
    var tz = k.place.tz;
    var t = bp.tithi;
    var phase = bp.moonPhase || k.moonPhase;
    var placeLabel = $('#kBirthPlace');
    if (placeLabel) {
      placeLabel.textContent = k.place.name + ' · ' + A.cityMeta(k.place, k.birth);
    }
    $('#kBirthPanchang').innerHTML = [
      birthRow('Tithi', t.paksha + ' ' + t.name, t.meaning + ' · deity ' + t.deity),
      birthRow('Tithi guidance', t.nature + (t.shubh ? ' · auspicious' : ' · hold new beginnings'), t.guidance),
      birthRow('Nakshatra', bp.nakshatra.name + ' · pada ' + bp.nakshatra.pada, bp.nakshatra.lord + ' · ' + bp.nakshatra.deity),
      birthRow('Yoga', bp.yoga.name, bp.yoga.meaning),
      birthRow('Karana', bp.karana.name, bp.karana.meaning),
      birthRow('Moon phase', phase.name, Math.round(phase.illumination * 100) + '% illuminated'),
      birthRow('Sunrise / Sunset', V.fmtTime(bp.sunrise, tz) + ' / ' + V.fmtTime(bp.sunset, tz), k.place.name + ' local time'),
      birthRow('Lagna', k.asc.signEn + ' · ' + k.asc.nakshatra + ' pada ' + k.asc.pada, k.asc.lord + ' rules the rising sign'),
      birthRow('Dasha at birth', k.dashaBalance.text + ' of ' + k.dashaBalance.lord, 'Vimshottari balance'),
      birthRow('Coordinates', A.cityMeta(k.place, k.birth), 'age ' + k.age.toFixed(1) + ' years · ayanamsa ' + k.ayanamsa.toFixed(2) + '°')
    ].join('');
  }

  function doshaRow(title, present, text, goodWhenPresent) {
    var positive = goodWhenPresent ? present : !present;
    var cls = positive ? 'no' : (present ? 'yes' : '');
    var icon = positive ? 'check' : (present ? 'alert' : 'info');
    return '<div class="dosha ' + cls + '">' + A.icon(icon) +
      '<div><b>' + A.esc(title) + ' · ' + (present ? 'Present' : 'Not present') + '</b><span>' + A.esc(text) + '</span></div></div>';
  }

  function renderDoshas(k) {
    var dos = k.doshas;
    var mars = k.planets.filter(function (p) { return p.key === 'Ma'; })[0];
    var saturn = k.planets.filter(function (p) { return p.key === 'Sa'; })[0];
    var rows = [];
    rows.push(doshaRow('Manglik dosha', dos.manglik,
      dos.manglik ? 'Mars sits in house ' + mars.house + '. Mangal Shanti is traditionally advised before marriage.' : 'Mars is outside the 1st, 2nd, 4th, 7th, 8th and 12th houses.',
      false));
    if (dos.manglik && dos.manglikMoon) rows.push(doshaRow('Chandra Manglik', true, 'Mars is also in a Manglik position from the Moon. Mention this during matching.', false));
    rows.push(doshaRow('Kaal Sarp dosha', dos.kaalSarp,
      dos.kaalSarp ? 'All seven planets fall on one side of the Rahu–Ketu axis.' : 'Planets are distributed on both sides of the Rahu–Ketu axis.',
      false));
    rows.push(doshaRow('Sade Sati', dos.sadeSati,
      dos.sadeSati ? 'Saturn is in the ' + dos.sadeSatiPhase.toLowerCase() + ' phase relative to your Moon. Current transit phase, not a lifelong condition.' : 'Saturn is not transiting the 12th, 1st or 2nd from your Moon.',
      false));
    rows.push(doshaRow('Gajakesari yoga', dos.gajkesari,
      dos.gajkesari ? 'Jupiter is in a kendra from the Moon — a classical wisdom and reputation yoga.' : 'Jupiter is not in a kendra from the Moon in this chart.',
      true));
    rows.push(doshaRow('Budhaditya yoga', dos.budhaditya,
      dos.budhaditya ? 'Sun and Mercury share a sign — sharp intellect and communication.' : 'Sun and Mercury are in different signs.',
      true));
    $('#kDoshas').innerHTML = rows.join('');
    $('#kMeta').setAttribute('data-manglik', dos.manglik ? 'yes' : 'no');
  }

  function fmtYear(dt) {
    return new Date(dt).getFullYear();
  }

  function renderDashas(k) {
    var now = Date.now();
    var current = null;
    var html = k.dashas.mahadashas.map(function (d) {
      var active = d.start.getTime() <= now && d.end.getTime() > now;
      if (active) current = d;
      return '<div class="dasha' + (active ? ' active' : '') + '"><i></i><span class="d">' + A.esc(d.lord) + ' Mahadasha</span>' +
        '<span class="y">' + fmtYear(d.start) + ' – ' + fmtYear(d.end) + '</span></div>';
    }).join('');
    var sub = k.dashas.antardashas.filter(function (a) { return a.start.getTime() <= now && a.end.getTime() > now; })[0];
    $('#kDashaCurrent').textContent = current ? (current.lord + (sub ? '–' + sub.lord : '')) : '—';
    if (sub) {
      html += '<div class="note-strip mt-2">' + A.icon('clock') +
        '<span><b>Current antardasha:</b> ' + A.esc(sub.lord) + ' · ' + fmtYear(sub.start) + '–' + fmtYear(sub.end) + '. ' +
        'The mahadasha sets the theme; the antardasha colours the year.</span></div>';
    } else {
      html += '<div class="note-strip mt-2">' + A.icon('info') + '<span>Dasha dates are calculated from the Moon’s nakshatra position at birth.</span></div>';
    }
    $('#kDashas').innerHTML = html;
  }

  function renderRemedies(k) {
    $('#kRemedies').innerHTML = k.remedies.map(function (r) {
      return '<div class="card"><div class="card__body card__body--pad">' +
        '<div class="flex-spark"><span class="text-saffron">' + A.icon('spark') + '</span><b class="serif fs-1">' + A.esc(r.title) + '</b></div>' +
        '<p class="small muted mt-1">' + A.esc(r.text) + '</p></div></div>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // A birth date cannot be in the future — keep that limit tied to today even
  // if the form is left open overnight.
  function refreshMaxDate() {
    var inp = $('#kDate');
    if (!inp) return;
    var t = new Date();
    inp.max = t.getFullYear() + '-' + A.pad(t.getMonth() + 1) + '-' + A.pad(t.getDate());
  }
  setInterval(refreshMaxDate, 60000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refreshMaxDate();
  });
  window.addEventListener('pageshow', refreshMaxDate);
})();
