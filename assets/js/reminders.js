/* ==========================================================================
   Festival reminders — download the computed calendar as an .ics file.
   The file is built in the browser (no server), so it also works offline.
   Phone calendars handle the actual reminder with a one-day alarm.
   ========================================================================== */
(function () {
  'use strict';

  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;

  var $ = A.$, DAY = 86400000;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var cache = {};

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function fmtDate(k) { var d = parseKey(k); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }

  function cityFromPage() {
    var sel = document.getElementById('calCity');
    var name = sel && sel.value;
    var found = D.CITIES.filter(function (c) { return c.name === name; })[0];
    if (found) return found;
    var saved = A.store.get('vp_city', 'Gurugram');
    return D.CITIES.filter(function (c) { return c.name === saved; })[0] || D.CITIES[0];
  }

  function cleanName(name) {
    return String(name)
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[\u2600-\u27BF\uFE0F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function eventForDate(key, city) {
    var p = key.split('-').map(Number);
    var pc = V.panchang(p[0], p[1], p[2], city);
    var names = [];
    try {
      var list = yearEvents(p[0], city);
      var day = list.filter(function (e) { return e.key === key; })[0];
      if (day) names = day.names.slice();
    } catch (e) { /* the tithi fallback below still works */ }

    var label;
    if (names.length) label = names.join(' · ');
    else if (pc.tithi.index === 10 || pc.tithi.index === 25) label = 'Ekadashi vrat · ' + pc.tithi.paksha + ' ' + pc.tithi.name;
    else if (pc.tithi.index === 14) label = 'Purnima · ' + pc.lunarMonthName;
    else if (pc.tithi.index === 29) label = 'Amavasya · ' + pc.lunarMonthName;
    else label = 'Satyanarayan puja · ' + pc.tithi.paksha + ' ' + pc.tithi.name;

    return {
      key: key,
      names: [label],
      tithi: pc.tithi.paksha + ' ' + pc.tithi.name,
      lunar: pc.lunarMonthName,
      nakshatra: pc.nakshatra.name,
      sunrise: V.fmtTime(pc.sunrise, city.tz)
    };
  }

  function yearEvents(year, city) {
    var ck = city.name + '|' + year;
    if (cache[ck]) return cache[ck];
    var map = V.festivalsForYear(year, city);
    var out = [];
    Object.keys(map).sort().forEach(function (k) {
      var day = map[k];
      if (!day.festivals || !day.festivals.length) return;
      var tithi = day.tithiName;
      if (tithi && typeof tithi === 'object') tithi = tithi.paksha + ' ' + tithi.name;
      out.push({
        key: k,
        names: day.festivals.map(function (f) { return f.n; }),
        tithi: tithi,
        lunar: day.lunarMonth
      });
    });
    try {
      var sank = V.makarSankranti(year, city);
      if (sank) {
        var mk = V.dateKey(sank, city.tz);
        var existing = out.filter(function (e) { return e.key === mk; })[0];
        if (existing) {
          if (existing.names.indexOf('Makar Sankranti') < 0) existing.names.push('Makar Sankranti');
        } else {
          out.push({ key: mk, names: ['Makar Sankranti'], tithi: 'Solar ingress', lunar: '' });
        }
      }
    } catch (e) { /* ignore */ }
    out.sort(function (a, b) { return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0); });
    cache[ck] = out;
    return out;
  }

  function nextEvents(city, days) {
    var start = keyOf(new Date());
    var end = addDays(start, days);
    var years = [Number(start.slice(0, 4))];
    if (Number(end.slice(0, 4)) !== years[0]) years.push(Number(end.slice(0, 4)));
    var out = [];
    years.forEach(function (y) {
      yearEvents(y, city).forEach(function (e) {
        if (e.key >= start && e.key <= end) out.push(e);
      });
    });
    return out;
  }

  function icsStamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  function icsEscape(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function fold(line) {
    if (line.length <= 73) return line;
    var out = [];
    for (var i = 0; i < line.length; i += 73) {
      out.push((i ? ' ' : '') + line.slice(i, i + 73));
    }
    return out.join('\r\n');
  }

  function slug(name) {
    var s = cleanName(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (s || 'festival').slice(0, 40);
  }

  function buildIcs(events, calName, city) {
    var stamp = icsStamp(new Date());
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vedic Pooja//Festival Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEscape(calName),
      'X-WR-TIMEZONE:Asia/Kolkata'
    ];
    events.forEach(function (ev, i) {
      var name = ev.names.join(' · ');
      var dt = ev.key.replace(/-/g, '');
      var endDt = addDays(ev.key, 1).replace(/-/g, '');
      var detail = name;
      if (ev.tithi) detail += ' · Tithi ' + ev.tithi;
      if (ev.lunar) detail += ' · ' + ev.lunar + ' month';
      if (ev.nakshatra) detail += ' · ' + ev.nakshatra + ' nakshatra';
      if (ev.sunrise) detail += ' · Sunrise ' + ev.sunrise;
      detail += ' · Computed for ' + city.name + ' by Vedic Pooja.';
      lines.push('BEGIN:VEVENT');
      lines.push(fold('UID:vp-' + dt + '-' + i + '-' + slug(name) + '@vedicpooja.in'));
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART;VALUE=DATE:' + dt);
      lines.push('DTEND;VALUE=DATE:' + endDt);
      lines.push(fold('SUMMARY:' + icsEscape(name)));
      lines.push(fold('DESCRIPTION:' + icsEscape(detail)));
      lines.push('TRANSP:TRANSPARENT');
      lines.push('STATUS:CONFIRMED');
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(fold('DESCRIPTION:' + icsEscape('Tomorrow: ' + name)));
      lines.push('TRIGGER:-P1D');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function status(msg, isError) {
    var el = $('#calIcsStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isError);
  }

  function download(filename, text, okMsg) {
    try {
      var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
      if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        window.setTimeout(function () {
          URL.revokeObjectURL(url);
          if (a.parentNode) a.parentNode.removeChild(a);
        }, 2000);
      }
      status(okMsg + ' Open the file to add it to your phone calendar. If nothing downloads, use Share → Save to Files.');
      return true;
    } catch (e) {
      status('The calendar file could not be created in this browser. Try Chrome, Safari or Edge.', true);
      return false;
    }
  }

  function downloadYear() {
    var city = cityFromPage();
    var year = Number(($('#calYearLabel') || {}).textContent) || new Date().getFullYear();
    var events = yearEvents(year, city);
    if (!events.length) { status('No festivals found for ' + year + ' in ' + city.name + '.', true); return; }
    var text = buildIcs(events, 'Vedic Pooja festivals ' + year + ' — ' + city.name, city);
    download('vedic-pooja-festivals-' + year + '-' + slug(city.name) + '.ics', text,
      events.length + ' festivals for ' + year + ' (' + city.name + ') are in the file.');
  }

  function downloadNext() {
    var city = cityFromPage();
    var events = nextEvents(city, 90);
    if (!events.length) { status('No festivals in the next 90 days for ' + city.name + '.', true); return; }
    var text = buildIcs(events, 'Vedic Pooja — next 90 days — ' + city.name, city);
    download('vedic-pooja-next-90-days-' + slug(city.name) + '.ics', text,
      events.length + ' festivals in the next 90 days (' + city.name + ') are in the file.');
  }

  function downloadDate(key) {
    var city = cityFromPage();
    var ev = eventForDate(key, city);
    var text = buildIcs([ev], 'Vedic Pooja — ' + fmtDate(key), city);
    download('vedic-pooja-' + key + '.ics', text, fmtDate(key) + ' is in the calendar file.');
  }

  function updateYearButton() {
    var btn = $('#calIcsYear');
    if (!btn) return;
    var year = Number(($('#calYearLabel') || {}).textContent) || new Date().getFullYear();
    btn.textContent = 'Add ' + year + ' festivals';
  }

  function init() {
    if (!$('#calIcsYear')) return;
    updateYearButton();
    $('#calIcsYear').addEventListener('click', downloadYear);
    if ($('#calIcsNext')) $('#calIcsNext').addEventListener('click', downloadNext);
    if ($('#calCity')) $('#calCity').addEventListener('change', function () { status(''); updateYearButton(); });
    var yearLabel = $('#calYearLabel');
    if (yearLabel && window.MutationObserver) {
      new MutationObserver(updateYearButton).observe(yearLabel, { childList: true, characterData: true, subtree: true });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-ics-date]') : null;
      if (!btn) return;
      e.preventDefault();
      downloadDate(btn.getAttribute('data-ics-date'));
    });
  }

  window.PujaReminders = {
    yearEvents: yearEvents,
    nextEvents: nextEvents,
    eventForDate: eventForDate,
    buildIcs: buildIcs,
    fmtDate: fmtDate
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
