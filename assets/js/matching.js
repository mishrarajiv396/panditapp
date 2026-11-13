/* Kundli matching — Ashtakoot with both Moon charts, manglik and remedies */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

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

  var last = null;

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }

  function person(prefix) {
    return {
      name: $('#' + prefix + 'Name').value.trim(),
      date: $('#' + prefix + 'Date').value,
      time: $('#' + prefix + 'Time').value || '12:00',
      place: A.findCity($('#' + prefix + 'City').value)
    };
  }

  function init() {
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    var ar = $('#matchArrow'); if (ar) ar.innerHTML = A.icon('arrow');

    ['g', 'b'].forEach(function (p) {
      var sel = $('#' + p + 'City');
      sel.innerHTML = A.cityOptions(city.name);
      var unk = $('#' + p + 'Unknown');
      unk.addEventListener('change', function () {
        var t = $('#' + p + 'Time');
        if (unk.checked) { t.value = '12:00'; t.disabled = true; }
        else t.disabled = false;
      });
    });

    var today = new Date();
    var max = today.getFullYear() + '-' + A.pad(today.getMonth() + 1) + '-' + A.pad(today.getDate());
    ['gDate', 'bDate'].forEach(function (id) { $('#' + id).max = max; });

    $('#matchRun').addEventListener('click', run);
    $('#matchSample').addEventListener('click', loadSample);
    $('#matchPrintBtn').addEventListener('click', function () { window.print(); });

    A.onLang(function () { if (last) render(last.res, last.kg, last.kb, last.g, last.b); });
  }

  function loadSample() {
    $('#gName').value = 'Aarav Mehta';
    $('#gDate').value = '1992-05-14';
    $('#gTime').value = '08:15';
    $('#gTime').disabled = false;
    $('#gUnknown').checked = false;
    $('#gCity').value = 'Gurugram';

    $('#bName').value = 'Meera Sharma';
    $('#bDate').value = '1994-02-28';
    $('#bTime').value = '14:40';
    $('#bTime').disabled = false;
    $('#bUnknown').checked = false;
    $('#bCity').value = 'Gurugram';

    run();
  }

  function run() {
    var g = person('g'), b = person('b');
    if (!g.date) { $('#gDate').focus(); A.toast(T('Please choose the groom’s birth date', 'वर की जन्म तिथि चुनें'), 'error'); return; }
    if (!b.date) { $('#bDate').focus(); A.toast(T('Please choose the bride’s birth date', 'वधू की जन्म तिथि चुनें'), 'error'); return; }
    if (g.date > $('#gDate').max || b.date > $('#bDate').max) { A.toast(T('Birth dates cannot be in the future', 'जन्म तिथियाँ भविष्य की नहीं हो सकतीं'), 'error'); return; }

    var kg, kb;
    try {
      kg = V.kundli({ name: g.name || T('Groom', 'वर'), date: g.date, time: g.time, place: g.place });
      kb = V.kundli({ name: b.name || T('Bride', 'वधू'), date: b.date, time: b.time, place: b.place });
    } catch (err) {
      A.toast(T('Could not compute one of the charts — please check the details', 'एक कुंडली की गणना नहीं हो सकी — विवरण जाँचें'), 'error');
      return;
    }

    var res;
    try { res = V.ashtakoot(kg, kb); }
    catch (err) { A.toast(T('Matching calculation failed — please try again', 'मिलान की गणना विफल — फिर प्रयास करें'), 'error'); return; }

    last = { res: res, kg: kg, kb: kb, g: g, b: b };
    render(res, kg, kb, g, b);
    $('#matchEmpty').classList.add('hide');
    $('#matchResult').classList.remove('hide');
    A.store.set('vp_city', g.place.name);
    var top = $('#matchResult').getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function fmtScore(n) {
    return (Math.round(n * 10) / 10).toString();
  }

  function render(res, kg, kb, g, b) {
    var pct = Math.round(res.total / 36 * 100);
    $('#matchTotal').textContent = fmtScore(res.total);
    $('#matchRing').style.setProperty('--pct', pct);
    $('#matchLabel').textContent = hn('matchLabel', res.label);
    $('#matchNames').textContent = (g.name || T('Groom', 'वर')) + T(' & ', ' और ') + (b.name || T('Bride', 'वधू'));
    $('#matchMax').textContent = fmtScore(res.total) + T(' / 36 points · ', ' / 36 अंक · ') + pct + '%';

    var verdict;
    if (res.total >= 28) {
      verdict = T(
        'A strong Ashtakoot match. The Moon charts support emotional understanding, mutual respect and steady family life. This is a favourable result — a full chart reading can add the practical details.',
        'मजबूत अष्टकूट मिलान। चंद्र कुंडलियाँ भावनात्मक समझ, परस्पर सम्मान और स्थिर पारिवारिक जीवन का समर्थन करती हैं। यह अनुकूल परिणाम है — पूर्ण कुंडली पठन व्यावहारिक विवरण जोड़ सकता है।'
      );
    } else if (res.total >= 21) {
      verdict = T(
        'A very good match. Most kootas align, and the couple is likely to navigate differences with maturity. Any isolated dosha below can be addressed before the wedding.',
        'बहुत अच्छा मिलान। अधिकांश कूट मेल खाते हैं और जोड़ा मतभेदों को परिपक्वता से संभाल सकता है। नीचे दिया कोई भी अलग दोष विवाह से पहले दूर किया जा सकता है।'
      );
    } else if (res.total >= 18) {
      verdict = T(
        'A workable match. The traditional threshold is met, though a few kootas need conscious effort. A senior astrologer can advise on remedies rather than a decision based on the number alone.',
        'काम चलाने योग्य मिलान। पारंपरिक सीमा पूरी होती है, फिर भी कुछ कूटों में सचेत प्रयास आवश्यक है। वरिष्ठ ज्योतिषी केवल संख्या के आधार पर निर्णय के बजाय उपायों का परामर्श दे सकते हैं।'
      );
    } else {
      verdict = T(
        'Below the traditional 18-guna threshold. That is a prompt for a careful chart reading — not a verdict on the relationship. Bhakoot, Nadi and Manglik positions often have straightforward remedies.',
        'पारंपरिक 18-गुण सीमा से नीचे। यह सावधानीपूर्वक कुंडली पठन का संकेत है — संबंध पर फैसला नहीं। भकूट, नाड़ी और मांगलिक स्थितियों के लिए अक्सर सरल उपाय होते हैं।'
      );
    }

    $('#matchVerdict').textContent = verdict;

    var badges = [];
    if (res.total >= 28) badges.push('<span class="chip chip--green">' + T('Strong overall', 'कुल मिलाकर मजबूत') + '</span>');
    if (kg.doshas.manglik && kb.doshas.manglik) badges.push('<span class="chip">' + T('Both Manglik — balanced', 'दोनों मांगलिक — संतुलित') + '</span>');
    else if (kg.doshas.manglik || kb.doshas.manglik) badges.push('<span class="chip chip--gold">' + T('One-sided Manglik', 'एकतरफा मांगलिक') + '</span>');
    else badges.push('<span class="chip chip--green">' + T('No Manglik dosha', 'कोई मांगलिक दोष नहीं') + '</span>');
    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    if (bhakoot && bhakoot.score === 0) badges.push('<span class="chip chip--gold">' + T('Bhakoot dosha', 'भकूट दोष') + '</span>');
    if (nadi && nadi.score === 0) badges.push('<span class="chip chip--gold">' + T('Nadi dosha', 'नाड़ी दोष') + '</span>');
    $('#matchBadges').innerHTML = badges.join('');

    $('#matchPair').innerHTML = pairCard(g.name || T('Groom', 'वर'), kg, T('Groom', 'वर')) + pairCard(b.name || T('Bride', 'वधू'), kb, T('Bride', 'वधू'));

    $('#matchKoots').innerHTML = res.items.map(function (i) {
      var hole = Math.round(i.score / i.max * 100);
      var tone = hole >= 75 ? 'good' : hole <= 30 ? 'low' : 'mid';
      return '<div class="koot koot--' + tone + '">' +
        '<div class="koot__head"><b>' + A.esc(hn('koota', i.name)) + '</b><span>' + fmtScore(i.score) + ' / ' + i.max + '</span></div>' +
        '<div class="koot__bar"><i style="width:' + hole + '%"></i></div>' +
        '<p>' + A.esc(hn('kootaNote', i.note)) + '</p></div>';
    }).join('');

    renderDoshas(res, kg, kb);
    renderNext(res, kg, kb);
    renderRemedies(kg, kb, res);
  }

  function pairCard(name, k, role) {
    return '<div class="pair-card"><span class="pair-card__role">' + role + '</span>' +
      '<b>' + A.esc(name) + '</b>' +
      '<span>' + A.esc(isHi() ? V.RASHIS[k.moonSign].hi : V.RASHIS[k.moonSign].n) + T(' Moon · ', ' चंद्र · ') + A.esc(hn('nakshatra', k.moonNakshatra)) + T(' pada ', ' पाद ') + k.moonPada + '</span>' +
      '<small>' + A.esc(isHi() ? V.RASHIS[k.sunSign].hi : V.RASHIS[k.sunSign].n) + T(' Sun · lagna ', ' सूर्य · लग्न ') + A.esc(isHi() ? V.RASHIS[k.asc.sign].hi : V.RASHIS[k.asc.sign].n) + '</small></div>';
  }

  function doshaRow(title, present, text, positiveWhenPresent) {
    var positive = positiveWhenPresent ? present : !present;
    var cls = positive ? 'no' : (present ? 'yes' : '');
    var icon = positive ? 'check' : (present ? 'alert' : 'info');
    return '<div class="dosha ' + cls + '">' + A.icon(icon) +
      '<div><b>' + A.esc(title) + ' · ' + (present ? T('Present', 'उपस्थित') : T('Not present', 'अनुपस्थित')) + '</b><span>' + A.esc(text) + '</span></div></div>';
  }

  function renderDoshas(res, kg, kb) {
    var rows = [];
    rows.push(doshaRow(T('Groom Manglik', 'वर मांगलिक'), kg.doshas.manglik,
      kg.doshas.manglik
        ? T('Mars is in a Manglik house in the groom’s chart. Mangal Shanti is traditionally advised.', 'वर की कुंडली में मंगल मांगलिक भाव में है। मंगल शांति का पारंपरिक परामर्श दिया जाता है।')
        : T('Mars is outside the Manglik houses in the groom’s chart.', 'वर की कुंडली में मंगल मांगलिक भावों से बाहर है।'),
      false));
    rows.push(doshaRow(T('Bride Manglik', 'वधू मांगलिक'), kb.doshas.manglik,
      kb.doshas.manglik
        ? T('Mars is in a Manglik house in the bride’s chart. A matching or remedial reading is advised.', 'वधू की कुंडली में मंगल मांगलिक भाव में है। मिलान या उपाय पठन का परामर्श दिया जाता है।')
        : T('Mars is outside the Manglik houses in the bride’s chart.', 'वधू की कुंडली में मंगल मांगलिक भावों से बाहर है।'),
      false));
    rows.push(doshaRow(T('Manglik balance', 'मांगलिक संतुलन'), kg.doshas.manglik === kb.doshas.manglik,
      hn('kootaNote', res.manglik.note), true));

    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    rows.push(doshaRow(T('Bhakoot dosha', 'भकूट दोष'), bhakoot && bhakoot.score === 0,
      bhakoot && bhakoot.score === 0
        ? T('Bhakoot scores zero. Traditionally addressed with a Bhakoot Shanti pooja.', 'भकूट शून्य है। पारंपरिक रूप से भकूट शांति पूजा से इसे संबोधित किया जाता है।')
        : T('Emotional and material growth is supported by the Moon-sign axis.', 'चंद्र-राशि अक्ष भावनात्मक और भौतिक विकास का समर्थन करता है।'),
      false));
    rows.push(doshaRow(T('Nadi dosha', 'नाड़ी दोष'), nadi && nadi.score === 0,
      nadi && nadi.score === 0
        ? T('Both nakshatras share the same nadi. Nadi dosha pooja and a health-aware lifestyle are advised.', 'दोनों नक्षत्रों की नाड़ी एक ही है। नाड़ी दोष पूजा और स्वास्थ्य-सजग जीवनशैली का परामर्श दिया जाता है।')
        : T('Different nadis — health and progeny indications are positive.', 'नाड़ियाँ अलग हैं — स्वास्थ्य और संतान के संकेत सकारात्मक हैं।'),
      false));
    var either = kg.doshas.kaalSarp || kb.doshas.kaalSarp;
    var who = kg.doshas.kaalSarp && kb.doshas.kaalSarp ? T('Groom and bride', 'वर और वधू')
      : kg.doshas.kaalSarp ? T('Groom', 'वर') : kb.doshas.kaalSarp ? T('Bride', 'वधू') : '';
    rows.push(doshaRow(T('Kaal Sarp in either chart', 'किसी भी कुंडली में काल सर्प'), either,
      either
        ? T(who + ' shows a Kaal Sarp axis. A separate reading is advised.', who + ' में काल सर्प अक्ष दिखता है। अलग पठन का परामर्श दिया जाता है।')
        : T('Neither chart shows a Kaal Sarp axis.', 'किसी भी कुंडली में काल सर्प अक्ष नहीं है।'),
      false));
    $('#matchDoshas').innerHTML = rows.join('');
  }

  function renderNext(res, kg, kb) {
    var out = [];
    var manglikOneSided = kg.doshas.manglik !== kb.doshas.manglik;
    if (res.total < 18) {
      out.push([
        T('Have both charts read in full', 'दोनों कुंडलियों का पूर्ण पठन कराएँ'),
        T('A 30-minute consultation with a senior acharya before any decision. Low Ashtakoot is a prompt for detail, not a rejection.', 'किसी भी निर्णय से पहले वरिष्ठ आचार्य से 30 मिनट का परामर्श। कम अष्टकूट विस्तार का संकेत है, अस्वीकृति नहीं।'),
        'about.html#contact', T('Book a consultation', 'परामर्श बुक करें')
      ]);
    }
    if (manglikOneSided) {
      out.push([
        T('Mangal Dosh Nivaran', 'मंगल दोष निवारण'),
        T('Mars in a Manglik house on one side is traditionally balanced with a 7,000-mantra Mangal Shanti before marriage.', 'एक पक्ष में मंगल के मांगलिक भाव में होने पर विवाह से पहले 7,000 मंत्रों वाली मंगल शांति पारंपरिक रूप से की जाती है।'),
        'poojas.html?q=mangal', T('View Mangal Shanti', 'मंगल शांति देखें')
      ]);
    }
    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    if ((bhakoot && bhakoot.score === 0) || (nadi && nadi.score === 0)) {
      out.push([
        T('Navgrah Shanti', 'नवग्रह शांति'),
        T('A nine-planet havan with graha-wise japa is the classical remedy for Bhakoot and Nadi indications.', 'ग्रह-वार जप के साथ नवग्रह हवन भकूट और नाड़ी संकेतों का शास्त्रीय उपाय है।'),
        'poojas.html?q=navgrah', T('View Navgrah Shanti', 'नवग्रह शांति देखें')
      ]);
    }
    if (res.total >= 28) {
      out.push([
        T('Plan the Vivah Sanskar', 'विवाह संस्कार की योजना बनाएँ'),
        T('A strong match — start with a muhurat consultation for the engagement or wedding date.', 'मजबूत मिलान — सगाई या विवाह की तिथि के लिए मुहूर्त परामर्श से शुरुआत करें।'),
        'poojas.html?q=vivah', T('View wedding rituals', 'विवाह अनुष्ठान देखें')
      ]);
    }
    if (!out.length) {
      out.push([
        T('A quiet, practical reading', 'शांत, व्यावहारिक पठन'),
        T('No urgent remedy is indicated. If you would like the dasha and both charts explained, a consultation is the next step.', 'कोई तत्काल उपाय संकेतित नहीं है। यदि आप दशा और दोनों कुंडलियों की व्याख्या चाहते हैं, तो परामर्श अगला कदम है।'),
        'about.html#contact', T('Talk to an acharya', 'आचार्य से बात करें')
      ]);
    }
    $('#matchNext').innerHTML = out.map(function (o) {
      return '<div class="next-item"><b>' + A.esc(o[0]) + '</b><p class="small muted mt-1">' + A.esc(o[1]) + '</p>' +
        '<a class="link-arrow mt-1" href="' + o[2] + '">' + A.esc(o[3]) + A.icon('arrow') + '</a></div>';
    }).join('');
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

  function renderRemedies(kg, kb, res) {
    var items = [];
    items.push({ title: kg.name + T('’s primary remedy', ' का प्राथमिक उपाय'), text: hn('remedyTitle', kg.remedies[0].title) + ': ' + remedyText(kg.remedies[0], kg) });
    items.push({ title: kb.name + T('’s primary remedy', ' का प्राथमिक उपाय'), text: hn('remedyTitle', kb.remedies[0].title) + ': ' + remedyText(kb.remedies[0], kb) });

    if (kg.doshas.manglik || kb.doshas.manglik) {
      items.push({
        title: T('Mangal Shanti', 'मंगल शांति'),
        text: T('A 7,000-mantra Mangal japa, red-cloth daan and havan — performed before the wedding when either chart is Manglik.', '7,000 मंत्रों का मंगल जप, लाल वस्त्र दान और हवन — जब किसी भी कुंडली में मांगलिक हो तो विवाह से पहले किया जाता है।')
      });
    }
    if (res.total < 18) {
      items.push({
        title: T('Read before deciding', 'निर्णय से पहले पढ़ें'),
        text: T('Ask for a full D1, D9 and dasha reading. Ashtakoot alone is not designed to approve or reject a marriage.', 'पूर्ण D1, D9 और दशा पठन माँगें। अष्टकूट अकेला विवाह को स्वीकृति या अस्वीकृति देने के लिए नहीं बना है।')
      });
    } else {
      items.push({
        title: T('Keep it practical', 'व्यावहारिक रखें'),
        text: T('Simple weekly observances — a diya on the family deity’s day, or a shared Saturday Hanuman Chalisa — are as valuable as any large ritual.', 'सरल साप्ताहिक अनुष्ठान — कुलदेवता के दिन दीया या शनिवार को साथ हनुमान चालीसा — किसी भी बड़े अनुष्ठान जितने मूल्यवान हैं।')
      });
    }

    $('#matchRemedies').innerHTML = items.map(function (r) {
      return '<div class="card"><div class="card__body card__body--pad">' +
        '<div class="flex-spark"><span class="text-saffron">' + A.icon('spark') + '</span><b class="serif fs-1">' + A.esc(r.title) + '</b></div>' +
        '<p class="small muted mt-1">' + A.esc(r.text) + '</p></div></div>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Keep the no-future-birth-date limit current across midnight.
  function refreshMaxDate() {
    var t = new Date();
    var max = t.getFullYear() + '-' + A.pad(t.getMonth() + 1) + '-' + A.pad(t.getDate());
    ['gDate', 'bDate'].forEach(function (id) {
      var el = $('#' + id);
      if (el) el.max = max;
    });
  }
  setInterval(refreshMaxDate, 60000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refreshMaxDate();
  });
  window.addEventListener('pageshow', refreshMaxDate);
})();
