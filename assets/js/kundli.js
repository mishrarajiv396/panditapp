/* Kundli generator — full D1/D9 chart, grahas, doshas, dasha and remedies */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D || !window.VedicChart) return;
  var $ = A.$, $$ = A.$$;

  var HI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  var EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var GEMS_HI = ['लाल मूंगा', 'पन्ना', 'मोती', 'मोती', 'माणिक', 'पन्ना', 'हीरा', 'लाल मूंगा', 'पुखराज', 'नीलम', 'नीलम', 'पुखराज'];
  var METALS_HI = ['तांबा', 'चांदी', 'चांदी', 'चांदी', 'सोना', 'चांदी', 'चांदी/प्लेटिनम', 'तांबा', 'सोना', 'लोहा/चांदी', 'लोहा/चांदी', 'सोना'];
  var DAYS_HI = ['मंगलवार', 'शुक्रवार', 'सोमवार', 'सोमवार', 'रविवार', 'बुधवार', 'शुक्रवार', 'मंगलवार', 'गुरुवार', 'शनिवार', 'शनिवार', 'गुरुवार'];

  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var f = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (f) city = f;
    }
  } catch (e) { /* ignore */ }

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }

  var last = null;

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

    A.onLang(function () {
      $('#kSampleChart').innerHTML = sampleChart();
      if (last) draw();
    });
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

    if (!name) { $('#kName').focus(); A.toast(T('Please enter a name for the chart', 'कुंडली के लिए नाम दर्ज करें'), 'error'); return; }
    if (!date) { $('#kDate').focus(); A.toast(T('Please choose a birth date', 'जन्म तिथि चुनें'), 'error'); return; }
    if (date > $('#kDate').max) { A.toast(T('Birth date cannot be in the future', 'जन्म तिथि भविष्य की नहीं हो सकती'), 'error'); return; }
    if (!time) { A.toast(T('Please enter a birth time or tick “I don’t know”', 'जन्म समय दर्ज करें या “मुझे नहीं पता” पर टिक करें'), 'error'); return; }

    var k;
    try {
      k = V.kundli({ name: name, date: date, time: time, place: place });
    } catch (err) {
      A.toast(T('Could not compute the chart — please check the details', 'कुंडली की गणना नहीं हो सकी — विवरण जाँचें'), 'error');
      return;
    }

    last = { k: k, name: name, date: date, time: time, place: place };
    draw();

    A.store.set('vp_city', place.name);
    $('#kundliEmpty').classList.add('hide');
    $('#kundliResult').classList.remove('hide');
    var top = $('#kReport').getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function draw() {
    if (!last) return;
    render(last.k, last.name, last.date, last.time, last.place);
  }

  function render(k, name, date, time, place) {
    var hi = isHi();
    var rashi = V.RASHIS;
    var d = new Date(date + 'T00:00:00');
    var dateLabel = d.getDate() + ' ' + (hi ? HI_MONTHS[d.getMonth()] : EN_MONTHS[d.getMonth()]) + ' ' + d.getFullYear();

    $('#kResultName').textContent = name + (hi ? ' · जन्म कुंडली' : ' · Janma Kundli');
    $('#kResultBirth').textContent = dateLabel + ' · ' + time + ' · ' + place.name + ', ' + place.state;
    $('#kChartD1').innerHTML = window.VedicChart.north(k, { size: 340 });
    $('#kChartD9').innerHTML = window.VedicChart.north(k, { size: 340, d9: true });
    $('#kPlanets').innerHTML = window.VedicChart.planetTable(k);

    var bal = k.dashaBalance;
    $('#kMeta').innerHTML = [
      [T('Lagna', 'लग्न'), (hi ? rashi[k.asc.sign].hi : rashi[k.asc.sign].n) + ' ' + Math.floor(k.asc.deg) + '°'],
      [T('Lagna nakshatra', 'लग्न नक्षत्र'), hn('nakshatra', k.asc.nakshatra) + T(' · pada ', ' · पाद ') + k.asc.pada],
      [T('Moon sign', 'चंद्र राशि'), hi ? rashi[k.moonSign].hi : rashi[k.moonSign].n],
      [T('Sun sign', 'सूर्य राशि'), hi ? rashi[k.sunSign].hi : rashi[k.sunSign].n],
      [T('Nakshatra', 'नक्षत्र'), hn('nakshatra', k.moonNakshatra) + T(' · pada ', ' · पाद ') + k.moonPada],
      [T('Ayanamsa', 'अयनांश'), k.ayanamsa.toFixed(2) + '°'],
      [T('Lagna lord', 'लग्नेश'), hn('planet', k.asc.lord)],
      [T('Dasha balance', 'दशा शेष'), hi ? (bal.years + ' वर्ष ' + bal.months + ' माह') : (bal.text + ' ' + bal.lord)],
      [T('Moon phase', 'चंद्र कला'), Math.round(k.moonPhase.illumination * 100) + '% · ' + hn('moonPhase', k.moonPhase.name)]
    ].map(function (m) {
      return '<div><span>' + A.esc(m[0]) + '</span><b>' + A.esc(m[1]) + '</b></div>';
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
      birthRow(T('Tithi', 'तिथि'), hn('paksha', t.paksha) + ' ' + hn('tithi', t.name),
        hn('tithiMeaning', t.name) + T(' · deity ', ' · देवता ') + hn('tithiDeity', t.name)),
      birthRow(T('Tithi guidance', 'तिथि मार्गदर्शन'), hn('tithiNature', t.nature) + (t.shubh ? T(' · auspicious', ' · शुभ') : T(' · hold new beginnings', ' · नई शुरुआत टालें')), hn('tithiGuidance', t.name)),
      birthRow(T('Nakshatra', 'नक्षत्र'), hn('nakshatra', bp.nakshatra.name) + T(' · pada ', ' · पाद ') + bp.nakshatra.pada, hn('planet', bp.nakshatra.lord) + ' · ' + hn('deity', bp.nakshatra.deity)),
      birthRow(T('Yoga', 'योग'), hn('yoga', bp.yoga.name), hn('yogaMeaning', bp.yoga.meaning)),
      birthRow(T('Karana', 'करण'), hn('karana', bp.karana.name), hn('karanaMeaning', bp.karana.meaning)),
      birthRow(T('Moon phase', 'चंद्र कला'), hn('moonPhase', phase.name), Math.round(phase.illumination * 100) + T('% illuminated', '% प्रकाशित')),
      birthRow(T('Sunrise / Sunset', 'सूर्योदय / सूर्यास्त'), V.fmtTime(bp.sunrise, tz) + ' / ' + V.fmtTime(bp.sunset, tz), k.place.name + T(' local time', ' स्थानीय समय')),
      birthRow(T('Lagna', 'लग्न'), hn('rashi', k.asc.signEn) + ' · ' + hn('nakshatra', k.asc.nakshatra) + T(' pada ', ' पाद ') + k.asc.pada, hn('planet', k.asc.lord) + T(' rules the rising sign', ' लग्नेश हैं')),
      birthRow(T('Dasha at birth', 'जन्म समय दशा'), (isHi() ? (k.dashaBalance.years + ' वर्ष ' + k.dashaBalance.months + ' माह') : k.dashaBalance.text) + T(' of ', ' · ') + hn('planet', k.dashaBalance.lord), T('Vimshottari balance', 'विंशोत्तरी शेष')),
      birthRow(T('Coordinates', 'निर्देशांक'), A.cityMeta(k.place, k.birth), T('age ' + k.age.toFixed(1) + ' years · ayanamsa ', 'आयु ' + k.age.toFixed(1) + ' वर्ष · अयनांश ') + k.ayanamsa.toFixed(2) + '°')
    ].join('');
  }

  function doshaRow(title, present, text, goodWhenPresent) {
    var positive = goodWhenPresent ? present : !present;
    var cls = positive ? 'no' : (present ? 'yes' : '');
    var icon = positive ? 'check' : (present ? 'alert' : 'info');
    return '<div class="dosha ' + cls + '">' + A.icon(icon) +
      '<div><b>' + A.esc(title) + ' · ' + (present ? T('Present', 'उपस्थित') : T('Not present', 'अनुपस्थित')) + '</b><span>' + A.esc(text) + '</span></div></div>';
  }

  function renderDoshas(k) {
    var dos = k.doshas;
    var mars = k.planets.filter(function (p) { return p.key === 'Ma'; })[0];
    var rows = [];
    rows.push(doshaRow(T('Manglik dosha', 'मांगलिक दोष'), dos.manglik,
      dos.manglik
        ? T('Mars sits in house ' + mars.house + '. Mangal Shanti is traditionally advised before marriage.', 'मंगल ' + mars.house + ' भाव में है। विवाह से पहले मंगल शांति का पारंपरिक परामर्श दिया जाता है।')
        : T('Mars is outside the 1st, 2nd, 4th, 7th, 8th and 12th houses.', 'मंगल पहले, दूसरे, चौथे, सातवें, आठवें और बारहवें भाव से बाहर है।'),
      false));
    if (dos.manglik && dos.manglikMoon) {
      rows.push(doshaRow(T('Chandra Manglik', 'चंद्र मांगलिक'), true,
        T('Mars is also in a Manglik position from the Moon. Mention this during matching.', 'चंद्रमा से भी मंगल मांगलिक स्थिति में है। मिलान के समय इसका उल्लेख करें।'),
        false));
    }
    rows.push(doshaRow(T('Kaal Sarp dosha', 'काल सर्प दोष'), dos.kaalSarp,
      dos.kaalSarp
        ? T('All seven planets fall on one side of the Rahu–Ketu axis.', 'सातों ग्रह राहु–केतु अक्ष के एक ही ओर हैं।')
        : T('Planets are distributed on both sides of the Rahu–Ketu axis.', 'ग्रह राहु–केतु अक्ष के दोनों ओर फैले हैं।'),
      false));
    rows.push(doshaRow(T('Sade Sati', 'साढ़ेसाती'), dos.sadeSati,
      dos.sadeSati
        ? T('Saturn is in the ' + dos.sadeSatiPhase.toLowerCase() + ' phase relative to your Moon. Current transit phase, not a lifelong condition.', 'चंद्रमा से शनि ' + hn('sadeSatiPhase', dos.sadeSatiPhase) + ' चरण में है। यह वर्तमान गोचर चरण है, आजीवन स्थिति नहीं।')
        : T('Saturn is not transiting the 12th, 1st or 2nd from your Moon.', 'चंद्रमा से 12वें, पहले या दूसरे भाव में शनि का गोचर नहीं है।'),
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
      return '<div class="dasha' + (active ? ' active' : '') + '"><i></i><span class="d">' + A.esc(hn('planet', d.lord)) + T(' Mahadasha', ' महादशा') + '</span>' +
        '<span class="y">' + fmtYear(d.start) + ' – ' + fmtYear(d.end) + '</span></div>';
    }).join('');
    var sub = k.dashas.antardashas.filter(function (a) { return a.start.getTime() <= now && a.end.getTime() > now; })[0];
    $('#kDashaCurrent').textContent = current ? (hn('planet', current.lord) + (sub ? '–' + hn('planet', sub.lord) : '')) : '—';
    if (sub) {
      html += '<div class="note-strip mt-2">' + A.icon('clock') +
        '<span><b>' + T('Current antardasha:', 'वर्तमान अंतर्दशा:') + '</b> ' + A.esc(hn('planet', sub.lord)) + ' · ' + fmtYear(sub.start) + '–' + fmtYear(sub.end) + '. ' +
        T('The mahadasha sets the theme; the antardasha colours the year.', 'महादशा मुख्य विषय तय करती है; अंतर्दशा वर्ष को रंगती है।') + '</span></div>';
    } else {
      html += '<div class="note-strip mt-2">' + A.icon('info') + '<span>' +
        T('Dasha dates are calculated from the Moon’s nakshatra position at birth.', 'दशा तिथियाँ जन्म के समय चंद्रमा की नक्षत्र स्थिति से गणना की जाती हैं।') +
        '</span></div>';
    }
    $('#kDashas').innerHTML = html;
  }

  function remedyText(r, k) {
    if (!isHi()) return r.text;
    var s = k.moonSign;
    if (r.title === 'Primary Gemstone') {
      return GEMS_HI[s] + ' ' + METALS_HI[s] + ' में, ऊर्जित करके ' + DAYS_HI[s] + ' को धारण करें।';
    }
    if (r.title === 'Ishta Mantra') {
      var mantra = String(r.text).split(' — ')[0];
      return mantra + ' — प्रतिदिन सूर्योदय पर 108 बार।';
    }
    if (r.title === 'Mangal Shanti') return '7,000 मंगल मंत्र जाप के साथ मंगल दोष निवारण पूजा सुझाई जाती है।';
    if (r.title === 'Kaal Sarp Shanti') return 'त्रिंबकेश्वर में राहु–केतु शांति या स्थानीय राहु-केतु हवन।';
    if (r.title === 'Shani Shanti') return 'शनिवार को शनि तेलाभिषेक और हनुमान चालीसा पाठ।';
    return r.text;
  }

  function renderRemedies(k) {
    $('#kRemedies').innerHTML = k.remedies.map(function (r) {
      return '<div class="card"><div class="card__body card__body--pad">' +
        '<div class="flex-spark"><span class="text-saffron">' + A.icon('spark') + '</span><b class="serif fs-1">' + A.esc(hn('remedyTitle', r.title)) + '</b></div>' +
        '<p class="small muted mt-1">' + A.esc(remedyText(r, k)) + '</p></div></div>';
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
    if (padaEl) padaEl.textContent = hn('nakshatra', np.name) + T(' · pada ', ' · पाद ') + k.moonPada + T(' of 4', '/4');

    var meta = $('#kNakshatra');
    if (meta) {
      meta.innerHTML = [
        [T('Janma nakshatra', 'जन्म नक्षत्र'), hn('nakshatra', np.name)],
        [T('Pada', 'पाद'), k.moonPada + T(' of 4', '/4')],
        [T('Nakshatra lord', 'नक्षत्र स्वामी'), hn('planet', np.lord)],
        [T('Deity', 'देवता'), hn('deity', np.deity)],
        [T('Gana', 'गण'), hn('gana', np.gana)],
        [T('Yoni', 'योनि'), hn('yoni', np.yoni)],
        [T('Nadi', 'नाड़ी'), hn('nadi', np.nadi)],
        [T('Nature', 'प्रकृति'), hn('nature', np.nature)],
        [T('Lagna nakshatra', 'लग्न नक्षत्र'), hn('nakshatra', lp.name) + T(' · pada ', ' · पाद ') + k.asc.pada]
      ].map(function (m) { return metaCell(m[0], m[1]); }).join('');
    }

    var chips = nm.all.map(function (s, i) {
      var active = i === k.moonPada - 1;
      return '<span class="nak-chip' + (active ? ' is-active' : '') + '">' +
        '<b>' + A.esc(nm.allHi[i]) + '</b><span>' + A.esc(s) + '</span><small>' + T('Pada ', 'पाद ') + (i + 1) + '</small></span>';
    }).join('');

    var el = $('#kNamakshara');
    if (el) {
      el.innerHTML = '<div class="nak-chips">' + chips + '</div>' +
        '<div class="nak-notes">' +
          '<div><b>' + T('Nature', 'प्रकृति') + ' · ' + A.esc(hn('nature', np.nature)) + '</b><span>' + A.esc(hn('natureText', np.nature)) + '</span></div>' +
          '<div><b>' + T('Gana', 'गण') + ' · ' + A.esc(hn('gana', np.gana)) + '</b><span>' + A.esc(hn('ganaText', np.gana)) + '</span></div>' +
          '<div><b>' + T('Nadi', 'नाड़ी') + ' · ' + A.esc(hn('nadi', np.nadi)) + '</b><span>' + A.esc(hn('nadiText', np.nadi)) + '</span></div>' +
        '</div>' +
        '<p class="small muted mt-2">' + T(
          'The highlighted syllable is the traditional namakshara for the janma pada. Families often choose a first name beginning with it; the lagna nakshatra syllable is sometimes used for a spiritual name.',
          'चिह्नित अक्षर जन्म पाद का पारंपरिक नामाक्षर है। परिवार अक्सर इससे शुरू होने वाला नाम चुनते हैं; लग्न नक्षत्र का अक्षर कभी-कभी आध्यात्मिक नाम के लिए प्रयोग होता है।'
        ) + '</p>';
    }
  }

  function renderBhavas(k) {
    var el = $('#kBhavas');
    if (!el) return;
    var rows = k.bhavas.map(function (b) {
      return '<tr><td><b>' + b.house + '</b><span class="bhava-name">' + A.esc(hn('bhavaName', b.name)) + '</span></td>' +
        '<td>' + A.esc(b.signName) + '</td>' +
        '<td>' + A.esc(hn('planet', b.lord)) + '</td>' +
        '<td>' + (b.planets.length ? b.planets.map(function (p) { return A.esc(hn('planet', p)); }).join(', ') : '—') + '</td>' +
        '<td><b>' + A.esc(hn('bhavaMeaning', b.meaning)) + '</b><small>' + A.esc(hn('bhavaText', b.name)) + '</small></td></tr>';
    }).join('');
    el.innerHTML = '<div class="table-wrap table-wrap--prose"><table class="kundli-table">' +
      '<thead><tr><th>' + T('House', 'भाव') + '</th><th>' + T('Rashi', 'राशि') + '</th><th>' + T('Lord', 'स्वामी') + '</th><th>' + T('Grahas', 'ग्रह') + '</th><th>' + T('Significations', 'अर्थ') + '</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function renderAspects(k) {
    var el = $('#kAspects');
    if (!el) return;
    el.innerHTML = k.aspects.map(function (a) {
      var targets = a.planets.length ? ' · ' + a.planets.map(function (p) { return hn('planet', p); }).join(', ') : '';
      return '<div class="aspect-row">' +
        '<div class="aspect-from"><b>' + A.esc(hn('planet', a.name)) + '</b><small>' + T('house ', 'भाव ') + a.house + '</small></div>' +
        '<div class="aspect-to"><span>' + a.houses.map(function (h) { return T('H', 'भा ') + h; }).join(' · ') + '</span>' +
        '<small>' + A.esc(a.angles.join('°, ') + '°') + targets + '</small></div>' +
        '</div>';
    }).join('') +
      '<p class="small muted mt-2">' + T(
        'Every graha aspects the 7th house from itself. Mars adds the 4th and 8th, Jupiter the 5th and 9th, and Saturn the 3rd and 10th. Rahu and Ketu use the 5th, 7th and 9th followed by many North Indian schools.',
        'प्रत्येक ग्रह अपने से सातवें भाव को देखता है। मंगल चौथे और आठवें, गुरु पाँचवें और नवें, तथा शनि तीसरे और दसवें को देखता है। राहु और केतु को अनेक उत्तर भारतीय परंपराओं में पाँचवें, सातवें और नवें भाव की दृष्टि दी जाती है।'
      ) + '</p>';
  }

  function renderYogas(k) {
    var el = $('#kYogas');
    if (!el) return;
    var present = k.yogas.filter(function (y) { return y.present; });
    var absent = k.yogas.filter(function (y) { return !y.present; });
    var count = $('#kYogaCount');
    if (count) {
      count.textContent = isHi()
        ? (k.yogas.length + ' में से ' + present.length + ' योग')
        : (present.length + ' of ' + k.yogas.length + ' combinations');
    }

    var html = present.map(function (y) {
      return '<div class="dosha ' + (y.category === 'caution' ? 'caution' : 'no') + '">' +
        A.icon(y.category === 'caution' ? 'info' : 'check') +
        '<div><b>' + A.esc(hn('kundliYoga', y.name)) + T(' yoga ', ' योग ') + '<span class="yoga-sa">' + A.esc(y.sanskrit) + '</span></b>' +
        '<span>' + A.esc(hn('kundliYogaText', y.name)) + '</span></div></div>';
    }).join('');

    if (!present.length) {
      html = '<div class="note-strip">' + A.icon('info') +
        '<span>' + T(
          'No major classical yoga is formed by these rules. A full reading also weighs planetary strength, dashas and transits.',
          'इन नियमों से कोई प्रमुख शास्त्रीय योग नहीं बनता। पूर्ण पठन में ग्रह बल, दशाएँ और गोचर भी देखे जाते हैं।'
        ) + '</span></div>';
    }
    if (absent.length) {
      html += '<details class="yoga-details"><summary>' + T('Checked but not formed · ', 'जाँचे गए पर नहीं बने · ') + absent.length + '</summary>' +
        '<div class="yoga-absent">' + absent.map(function (y) {
          return '<div><b>' + A.esc(hn('kundliYoga', y.name)) + '</b><span>' + A.esc(hn('kundliYogaText', y.name)) + '</span></div>';
        }).join('') + '</div></details>';
    }
    el.innerHTML = html;
  }

  function renderVargas(k) {
    var el = $('#kVargas');
    if (!el) return;
    var abbr = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
    var head = '<tr><th>' + T('Graha', 'ग्रह') + '</th>' + k.vargas.list.map(function (v) {
      return '<th title="' + A.esc(hn('varga', v.name) + ' — ' + hn('vargaTheme', v.theme)) + '">' + A.esc(v.short) + '</th>';
    }).join('') + '</tr>';
    var body = k.vargas.rows.map(function (r) {
      return '<tr><td><b>' + A.esc(r.key === 'Asc' ? T('Lagna', 'लग्न') : hn('planet', r.name)) + '</b></td>' + r.signs.map(function (s) {
        return '<td><span class="varga-sign" title="' + A.esc(V.RASHIS[s].hi) + '">' + abbr[s] + '</span></td>';
      }).join('') + '</tr>';
    }).join('');
    el.innerHTML = '<div class="table-wrap"><table class="varga-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="varga-legend">' + T(
        'Each cell is the rashi occupied in that divisional chart. Tap or hover a column header for its theme. ',
        'प्रत्येक कोशिका उस विभागीय कुंडली में ग्रह की राशि है। स्तंभ शीर्षक पर टैप या हॉवर करके उसका विषय देखें। '
      ) + k.vargas.list.map(function (v) { return v.short + ' ' + hn('varga', v.name); }).join(' · ') + '.</p>';
  }

  function renderMethod(k) {
    var el = $('#kMethod');
    if (!el) return;
    el.innerHTML = [
      birthRow(T('Ayanamsa', 'अयनांश'), T('Lahiri / Chitrapaksha · ', 'लाहिरी / चित्रपक्ष · ') + k.ayanamsa.toFixed(4) + '°',
        T('Sidereal zodiac; subtracted from tropical longitude', 'निरयण राशिचक्र; उष्णकटिबंधीय देशांतर से घटाया गया')),
      birthRow(T('Ephemeris', 'ग्रह पंचांग'), '<a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">Astronomy Engine</a> · MIT',
        T('Open-source apparent geocentric positions for the Sun–Saturn; mean node for Rahu and Ketu', 'सूर्य–शनि के लिए ओपन-सोर्स स्पष्ट भूकेंद्रीय स्थिति; राहु और केतु के लिए माध्य नोड')),
      birthRow(T('Houses', 'भाव'), T('Whole-sign from Lagna', 'लग्न से पूर्ण-राशि'),
        T('The rising rashi is the 1st bhava; each following rashi is the next house', 'उदय राशि पहला भाव है; आगे की प्रत्येक राशि अगला भाव')),
      birthRow(T('Vargas', 'वर्ग'), T('Parashari rules · D1–D60', 'पराशरी नियम · D1–D60'),
        T('D2 hora and D30 trimshamsha use their classical unequal divisions', 'D2 होरा और D30 त्रिंशांश अपने शास्त्रीय असमान विभाजन प्रयोग करते हैं')),
      birthRow(T('Dasha', 'दशा'), T('Vimshottari · 120-year cycle', 'विंशोत्तरी · 120 वर्ष चक्र'),
        T('Balance derived from the Moon’s nakshatra and pada at birth', 'शेष जन्म के समय चंद्रमा के नक्षत्र और पाद से निकाला जाता है')),
      birthRow(T('Nakshatra', 'नक्षत्र'), T('27 nakshatras · 4 padas', '27 नक्षत्र · 4 पाद'),
        T('Namakshara syllables follow the traditional pada table', 'नामाक्षर अक्षर पारंपरिक पाद तालिका का पालन करते हैं')),
      birthRow(T('Classical basis', 'शास्त्रीय आधार'), T('Brihat Parashara Hora Shastra', 'बृहत् पराशर होरा शास्त्र'),
        T('Shodashavarga, graha drishti and Vimshottari rules; Lahiri ayanamsa from the Indian Astronomical Ephemeris', 'षोडशवर्ग, ग्रह दृष्टि और विंशोत्तरी नियम; भारतीय खगोलीय पंचांग से लाहिरी अयनांश')),
      birthRow(T('How to verify', 'कैसे सत्यापित करें'), T('Compare with any standard panchang', 'किसी भी मानक पंचांग से तुलना करें'),
        T('A few arc-minutes of difference is normal; birth time and time zone matter most', 'कुछ चाप-मिनट का अंतर सामान्य है; जन्म समय और समय क्षेत्र सबसे महत्वपूर्ण हैं'))
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
