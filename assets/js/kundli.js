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
    renderNakshatra(k);
    renderBhavas(k);
    renderAspects(k);
    renderYogas(k);
    renderVargas(k);
    renderMethod(k);
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

  function metaCell(label, value) {
    return '<div><span>' + A.esc(label) + '</span><b>' + A.esc(value) + '</b></div>';
  }

  function renderNakshatra(k) {
    var np = k.nakshatraProfile;
    var lp = k.lagnaNakshatraProfile;
    var nm = k.namakshara;
    var padaEl = $('#kNakPada');
    if (padaEl) padaEl.textContent = np.name + ' · pada ' + k.moonPada + ' of 4';

    var meta = $('#kNakshatra');
    if (meta) {
      meta.innerHTML = [
        ['Janma nakshatra', np.name],
        ['Pada', k.moonPada + ' of 4'],
        ['Nakshatra lord', np.lord],
        ['Deity', np.deity],
        ['Gana', np.gana],
        ['Yoni', np.yoni],
        ['Nadi', np.nadi],
        ['Nature', np.nature],
        ['Lagna nakshatra', lp.name + ' · pada ' + k.asc.pada]
      ].map(function (m) { return metaCell(m[0], m[1]); }).join('');
    }

    var chips = nm.all.map(function (s, i) {
      var active = i === k.moonPada - 1;
      return '<span class="nak-chip' + (active ? ' is-active' : '') + '">' +
        '<b>' + A.esc(nm.allHi[i]) + '</b><span>' + A.esc(s) + '</span><small>Pada ' + (i + 1) + '</small></span>';
    }).join('');

    var el = $('#kNamakshara');
    if (el) {
      el.innerHTML = '<div class="nak-chips">' + chips + '</div>' +
        '<div class="nak-notes">' +
          '<div><b>Nature · ' + A.esc(np.nature) + '</b><span>' + A.esc(np.natureText) + '</span></div>' +
          '<div><b>Gana · ' + A.esc(np.gana) + '</b><span>' + A.esc(np.ganaText) + '</span></div>' +
          '<div><b>Nadi · ' + A.esc(np.nadi) + '</b><span>' + A.esc(np.nadiText) + '</span></div>' +
        '</div>' +
        '<p class="small muted mt-2">The highlighted syllable is the traditional namakshara for the janma pada. Families often choose a first name beginning with it; the lagna nakshatra syllable is sometimes used for a spiritual name.</p>';
    }
  }

  function renderBhavas(k) {
    var el = $('#kBhavas');
    if (!el) return;
    var rows = k.bhavas.map(function (b) {
      return '<tr><td><b>' + b.house + '</b><span class="bhava-name">' + A.esc(b.name) + '</span></td>' +
        '<td>' + A.esc(b.signName) + '</td>' +
        '<td>' + A.esc(b.lord) + '</td>' +
        '<td>' + (b.planets.length ? b.planets.map(function (p) { return A.esc(p); }).join(', ') : '—') + '</td>' +
        '<td><b>' + A.esc(b.meaning) + '</b><small>' + A.esc(b.text) + '</small></td></tr>';
    }).join('');
    el.innerHTML = '<div class="table-wrap table-wrap--prose"><table class="kundli-table">' +
      '<thead><tr><th>House</th><th>Rashi</th><th>Lord</th><th>Grahas</th><th>Significations</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function renderAspects(k) {
    var el = $('#kAspects');
    if (!el) return;
    el.innerHTML = k.aspects.map(function (a) {
      var targets = a.planets.length ? ' · ' + a.planets.join(', ') : '';
      return '<div class="aspect-row">' +
        '<div class="aspect-from"><b>' + A.esc(a.name) + '</b><small>house ' + a.house + '</small></div>' +
        '<div class="aspect-to"><span>' + a.houses.map(function (h) { return 'H' + h; }).join(' · ') + '</span>' +
        '<small>' + A.esc(a.angles.join('°, ') + '°') + targets + '</small></div>' +
        '</div>';
    }).join('') +
      '<p class="small muted mt-2">Every graha aspects the 7th house from itself. Mars adds the 4th and 8th, Jupiter the 5th and 9th, and Saturn the 3rd and 10th. Rahu and Ketu use the 5th, 7th and 9th followed by many North Indian schools.</p>';
  }

  function renderYogas(k) {
    var el = $('#kYogas');
    if (!el) return;
    var present = k.yogas.filter(function (y) { return y.present; });
    var absent = k.yogas.filter(function (y) { return !y.present; });
    var count = $('#kYogaCount');
    if (count) count.textContent = present.length + ' of ' + k.yogas.length + ' combinations';

    var html = present.map(function (y) {
      return '<div class="dosha ' + (y.category === 'caution' ? 'caution' : 'no') + '">' +
        A.icon(y.category === 'caution' ? 'info' : 'check') +
        '<div><b>' + A.esc(y.name) + ' yoga <span class="yoga-sa">' + A.esc(y.sanskrit) + '</span></b>' +
        '<span>' + A.esc(y.text) + '</span></div></div>';
    }).join('');

    if (!present.length) {
      html = '<div class="note-strip">' + A.icon('info') +
        '<span>No major classical yoga is formed by these rules. A full reading also weighs planetary strength, dashas and transits.</span></div>';
    }
    if (absent.length) {
      html += '<details class="yoga-details"><summary>Checked but not formed · ' + absent.length + '</summary>' +
        '<div class="yoga-absent">' + absent.map(function (y) {
          return '<div><b>' + A.esc(y.name) + '</b><span>' + A.esc(y.text) + '</span></div>';
        }).join('') + '</div></details>';
    }
    el.innerHTML = html;
  }

  function renderVargas(k) {
    var el = $('#kVargas');
    if (!el) return;
    var abbr = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
    var head = '<tr><th>Graha</th>' + k.vargas.list.map(function (v) {
      return '<th title="' + A.esc(v.name + ' — ' + v.theme) + '">' + A.esc(v.short) + '</th>';
    }).join('') + '</tr>';
    var body = k.vargas.rows.map(function (r) {
      return '<tr><td><b>' + A.esc(r.name) + '</b></td>' + r.signs.map(function (s) {
        return '<td><span class="varga-sign" title="' + A.esc(V.RASHIS[s].n) + '">' + abbr[s] + '</span></td>';
      }).join('') + '</tr>';
    }).join('');
    el.innerHTML = '<div class="table-wrap"><table class="varga-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="varga-legend">Each cell is the rashi occupied in that divisional chart. Tap or hover a column header for its theme. ' +
      'D1 Rashi · D2 Hora · D3 Drekkana · D4 Chaturthamsha · D7 Saptamsha · D9 Navamsa · D10 Dashamsha · D12 Dwadashamsha · D16 Shodashamsha · D20 Vimshamsha · D24 Chaturvimshamsha · D27 Bhamsha · D30 Trimshamsha · D40 Khavedamsha · D45 Akshavedamsha · D60 Shashtiamsha.</p>';
  }

  function renderMethod(k) {
    var el = $('#kMethod');
    if (!el) return;
    el.innerHTML = [
      birthRow('Ayanamsa', 'Lahiri / Chitrapaksha · ' + k.ayanamsa.toFixed(4) + '°', 'Sidereal zodiac; subtracted from tropical longitude'),
      birthRow('Ephemeris', '<a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">Astronomy Engine</a> · MIT', 'Open-source apparent geocentric positions for the Sun–Saturn; mean node for Rahu and Ketu'),
      birthRow('Houses', 'Whole-sign from Lagna', 'The rising rashi is the 1st bhava; each following rashi is the next house'),
      birthRow('Vargas', 'Parashari rules · D1–D60', 'D2 hora and D30 trimshamsha use their classical unequal divisions'),
      birthRow('Dasha', 'Vimshottari · 120-year cycle', 'Balance derived from the Moon’s nakshatra and pada at birth'),
      birthRow('Nakshatra', '27 nakshatras · 4 padas', 'Namakshara syllables follow the traditional pada table'),
      birthRow('Classical basis', 'Brihat Parashara Hora Shastra', 'Shodashavarga, graha drishti and Vimshottari rules; Lahiri ayanamsa from the Indian Astronomical Ephemeris'),
      birthRow('How to verify', 'Compare with any standard panchang', 'A few arc-minutes of difference is normal; birth time and time zone matter most')
    ].join('');
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
