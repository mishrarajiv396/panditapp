/* Kundli matching — Ashtakoot with both Moon charts, manglik and remedies */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var f = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (f) city = f;
    }
  } catch (e) { /* ignore */ }

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
    if (!g.date) { $('#gDate').focus(); A.toast('Please choose the groom’s birth date', 'error'); return; }
    if (!b.date) { $('#bDate').focus(); A.toast('Please choose the bride’s birth date', 'error'); return; }
    if (g.date > $('#gDate').max || b.date > $('#bDate').max) { A.toast('Birth dates cannot be in the future', 'error'); return; }

    var kg, kb;
    try {
      kg = V.kundli({ name: g.name || 'Groom', date: g.date, time: g.time, place: g.place });
      kb = V.kundli({ name: b.name || 'Bride', date: b.date, time: b.time, place: b.place });
    } catch (err) {
      A.toast('Could not compute one of the charts — please check the details', 'error');
      return;
    }

    var res;
    try { res = V.ashtakoot(kg, kb); }
    catch (err) { A.toast('Matching calculation failed — please try again', 'error'); return; }

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
    $('#matchLabel').textContent = res.label;
    $('#matchNames').textContent = (g.name || 'Groom') + ' & ' + (b.name || 'Bride');
    $('#matchMax').textContent = fmtScore(res.total) + ' / 36 points · ' + pct + '%';

    var verdict;
    if (res.total >= 28) verdict = 'A strong Ashtakoot match. The Moon charts support emotional understanding, mutual respect and steady family life. This is a favourable result — a full chart reading can add the practical details.';
    else if (res.total >= 21) verdict = 'A very good match. Most kootas align, and the couple is likely to navigate differences with maturity. Any isolated dosha below can be addressed before the wedding.';
    else if (res.total >= 18) verdict = 'A workable match. The traditional threshold is met, though a few kootas need conscious effort. A senior astrologer can advise on remedies rather than a decision based on the number alone.';
    else verdict = 'Below the traditional 18-guna threshold. That is a prompt for a careful chart reading — not a verdict on the relationship. Bhakoot, Nadi and Manglik positions often have straightforward remedies.';

    $('#matchVerdict').textContent = verdict;

    var badges = [];
    if (res.total >= 28) badges.push('<span class="chip chip--green">Strong overall</span>');
    if (kg.doshas.manglik && kb.doshas.manglik) badges.push('<span class="chip">Both Manglik — balanced</span>');
    else if (kg.doshas.manglik || kb.doshas.manglik) badges.push('<span class="chip chip--gold">One-sided Manglik</span>');
    else badges.push('<span class="chip chip--green">No Manglik dosha</span>');
    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    if (bhakoot && bhakoot.score === 0) badges.push('<span class="chip chip--gold">Bhakoot dosha</span>');
    if (nadi && nadi.score === 0) badges.push('<span class="chip chip--gold">Nadi dosha</span>');
    $('#matchBadges').innerHTML = badges.join('');

    $('#matchPair').innerHTML = pairCard(g.name || 'Groom', kg, 'Groom') + pairCard(b.name || 'Bride', kb, 'Bride');

    $('#matchKoots').innerHTML = res.items.map(function (i) {
      var hole = Math.round(i.score / i.max * 100);
      var tone = hole >= 75 ? 'good' : hole <= 30 ? 'low' : 'mid';
      return '<div class="koot koot--' + tone + '">' +
        '<div class="koot__head"><b>' + A.esc(i.name) + '</b><span>' + fmtScore(i.score) + ' / ' + i.max + '</span></div>' +
        '<div class="koot__bar"><i style="width:' + hole + '%"></i></div>' +
        '<p>' + A.esc(i.note) + '</p></div>';
    }).join('');

    renderDoshas(res, kg, kb);
    renderNext(res, kg, kb);
    renderRemedies(kg, kb, res);
  }

  function pairCard(name, k, role) {
    return '<div class="pair-card"><span class="pair-card__role">' + role + '</span>' +
      '<b>' + A.esc(name) + '</b>' +
      '<span>' + A.esc(V.RASHIS[k.moonSign].n) + ' Moon · ' + A.esc(k.moonNakshatra) + ' pada ' + k.moonPada + '</span>' +
      '<small>' + A.esc(V.RASHIS[k.sunSign].n) + ' Sun · lagna ' + A.esc(V.RASHIS[k.asc.sign].n) + '</small></div>';
  }

  function doshaRow(title, present, text, positiveWhenPresent) {
    var positive = positiveWhenPresent ? present : !present;
    var cls = positive ? 'no' : (present ? 'yes' : '');
    var icon = positive ? 'check' : (present ? 'alert' : 'info');
    return '<div class="dosha ' + cls + '">' + A.icon(icon) +
      '<div><b>' + A.esc(title) + ' · ' + (present ? 'Present' : 'Not present') + '</b><span>' + A.esc(text) + '</span></div></div>';
  }

  function renderDoshas(res, kg, kb) {
    var rows = [];
    rows.push(doshaRow('Groom Manglik', kg.doshas.manglik,
      kg.doshas.manglik ? 'Mars is in a Manglik house in the groom’s chart. Mangal Shanti is traditionally advised.' : 'Mars is outside the Manglik houses in the groom’s chart.', false));
    rows.push(doshaRow('Bride Manglik', kb.doshas.manglik,
      kb.doshas.manglik ? 'Mars is in a Manglik house in the bride’s chart. A matching or remedial reading is advised.' : 'Mars is outside the Manglik houses in the bride’s chart.', false));
    rows.push(doshaRow('Manglik balance', kg.doshas.manglik === kb.doshas.manglik,
      res.manglik.note, true));

    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    rows.push(doshaRow('Bhakoot dosha', bhakoot && bhakoot.score === 0,
      bhakoot && bhakoot.score === 0 ? 'Bhakoot scores zero. Traditionally addressed with a Bhakoot Shanti pooja.' : 'Emotional and material growth is supported by the Moon-sign axis.', false));
    rows.push(doshaRow('Nadi dosha', nadi && nadi.score === 0,
      nadi && nadi.score === 0 ? 'Both nakshatras share the same nadi. Nadi dosha pooja and a health-aware lifestyle are advised.' : 'Different nadis — health and progeny indications are positive.', false));
    rows.push(doshaRow('Kaal Sarp in either chart', kg.doshas.kaalSarp || kb.doshas.kaalSarp,
      (kg.doshas.kaalSarp ? 'Groom' : '') + (kg.doshas.kaalSarp && kb.doshas.kaalSarp ? ' and ' : '') + (kb.doshas.kaalSarp ? 'Bride' : '') + (kg.doshas.kaalSarp || kb.doshas.kaalSarp ? ' shows a Kaal Sarp axis. A separate reading is advised.' : 'Neither chart shows a Kaal Sarp axis.'), false));
    $('#matchDoshas').innerHTML = rows.join('');
  }

  function renderNext(res, kg, kb) {
    var out = [];
    var manglikOneSided = kg.doshas.manglik !== kb.doshas.manglik;
    if (res.total < 18) {
      out.push(['Have both charts read in full', 'A 30-minute consultation with a senior acharya before any decision. Low Ashtakoot is a prompt for detail, not a rejection.', 'about.html#contact', 'Book a consultation']);
    }
    if (manglikOneSided) {
      out.push(['Mangal Dosh Nivaran', 'Mars in a Manglik house on one side is traditionally balanced with a 7,000-mantra Mangal Shanti before marriage.', 'poojas.html?q=mangal', 'View Mangal Shanti']);
    }
    var bhakoot = res.items.filter(function (i) { return i.name === 'Bhakoot'; })[0];
    var nadi = res.items.filter(function (i) { return i.name === 'Nadi'; })[0];
    if ((bhakoot && bhakoot.score === 0) || (nadi && nadi.score === 0)) {
      out.push(['Navgrah Shanti', 'A nine-planet havan with graha-wise japa is the classical remedy for Bhakoot and Nadi indications.', 'poojas.html?q=navgrah', 'View Navgrah Shanti']);
    }
    if (res.total >= 28) {
      out.push(['Plan the Vivah Sanskar', 'A strong match — start with a muhurat consultation for the engagement or wedding date.', 'poojas.html?q=vivah', 'View wedding rituals']);
    }
    if (!out.length) {
      out.push(['A quiet, practical reading', 'No urgent remedy is indicated. If you would like the dasha and both charts explained, a consultation is the next step.', 'about.html#contact', 'Talk to an acharya']);
    }
    $('#matchNext').innerHTML = out.map(function (o) {
      return '<div class="next-item"><b>' + A.esc(o[0]) + '</b><p class="small muted mt-1">' + A.esc(o[1]) + '</p>' +
        '<a class="link-arrow mt-1" href="' + o[2] + '">' + A.esc(o[3]) + A.icon('arrow') + '</a></div>';
    }).join('');
  }

  function renderRemedies(kg, kb, res) {
    var items = [];
    items.push({ title: kg.name + '’s primary remedy', text: kg.remedies[0].title + ': ' + kg.remedies[0].text });
    items.push({ title: kb.name + '’s primary remedy', text: kb.remedies[0].title + ': ' + kb.remedies[0].text });

    if (kg.doshas.manglik || kb.doshas.manglik) {
      items.push({ title: 'Mangal Shanti', text: 'A 7,000-mantra Mangal japa, red-cloth daan and havan — performed before the wedding when either chart is Manglik.' });
    }
    if (res.total < 18) {
      items.push({ title: 'Read before deciding', text: 'Ask for a full D1, D9 and dasha reading. Ashtakoot alone is not designed to approve or reject a marriage.' });
    } else {
      items.push({ title: 'Keep it practical', text: 'Simple weekly observances — a diya on the family deity’s day, or a shared Saturday Hanuman Chalisa — are as valuable as any large ritual.' });
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
