/* Vedic Pooja — city directory: every district, famous place and NRI hub */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  var ALL = (D.CITIES || []).slice();
  var PAGE = 60;
  var state = { q: '', kind: 'all', state: 'all', shown: PAGE };

  function rank(c, q) {
    if (!q) return 0;
    var name = c.name.toLowerCase();
    if (name === q) return 0;
    if (name.indexOf(q) === 0) return 1;
    var t = name.indexOf(' ' + q);
    if (t > 0) return 2;
    if (name.indexOf(q) >= 0) return 3;
    if (c.state.toLowerCase().indexOf(q) === 0) return 4;
    return 5;
  }

  function curried() {
    var q = state.q.trim().toLowerCase();
    var list = ALL.filter(function (c) {
      if (state.state !== 'all' && c.state !== state.state) return false;
      if (state.kind === 'district' && !c.district) return false;
      if (state.kind === 'famous' && !c.famous) return false;
      if (state.kind === 'city' && (c.district || c.famous)) return false;
      if (state.kind === 'nri' && c.tz === 'Asia/Kolkata') return false;
      // Districts and famous places are always in India; Metro & NRI cities keeps NRI hubs.
      if ((state.kind === 'district' || state.kind === 'famous') && c.tz !== 'Asia/Kolkata') return false;
      if (!q) return true;
      var hay = (c.name + ' ' + c.state + (c.district ? ' district' : '') + (c.famous ? ' famous place tirth temple beach hill station' : '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    if (q) {
      list.sort(function (a, b) {
        var ra = rank(a, q), rb = rank(b, q);
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
    } else {
      list.sort(function (a, b) {
        return a.state.localeCompare(b.state) || a.name.localeCompare(b.name);
      });
    }
    return list;
  }

  function badge(c) {
    if (c.famous) return '<span class="chip chip--gold city-card__badge">★ Famous place</span>';
    if (c.district) return '<span class="chip chip--green city-card__badge">District</span>';
    if (c.tz && c.tz !== 'Asia/Kolkata') return '<span class="chip city-card__badge">NRI</span>';
    return '<span class="chip city-card__badge">Metro</span>';
  }

  function card(c, idx) {
    var ico = c.famous ? 'star' : (c.tz !== 'Asia/Kolkata' ? 'globe' : (c.district ? 'pin' : 'compass'));
    return '<button type="button" class="city-card xp-depth" data-i="' + idx + '" aria-label="' + A.esc(c.name) + ', ' + A.esc(c.state) + ' details">' +
      '<span class="city-card__ico">' + A.icon(ico) + '</span>' +
      '<span class="city-card__body"><b>' + A.esc(c.name) + '</b><small>' + A.esc(c.state) + '</small>' +
      '<span class="city-card__meta">' + Math.abs(c.lat).toFixed(2) + '°' + (c.lat >= 0 ? 'N' : 'S') + ' · ' +
      Math.abs(c.lon).toFixed(2) + '°' + (c.lon >= 0 ? 'E' : 'W') + '</span></span>' +
      badge(c) + '</button>';
  }

  var visibleList = [];

  function render() {
    var list = curried();
    visibleList = list;
    var count = $('#cityResultCount');
    if (count) count.textContent = list.length.toLocaleString('en-IN') + ' place' + (list.length === 1 ? '' : 's');
    var grid = $('#cityGrid'), empty = $('#cityEmpty'), more = $('#cityMore');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hide');
      if (more) more.style.display = 'none';
      return;
    }
    if (empty) empty.classList.add('hide');
    var slice = list.slice(0, state.shown);
    grid.innerHTML = slice.map(card).join('');
    if (more) more.style.display = list.length > slice.length ? '' : 'none';
    $$('.city-card', grid).forEach(function (el) {
      el.addEventListener('click', function () {
        var c = visibleList[Number(el.getAttribute('data-i'))];
        if (c) detail(c);
      });
    });
  }

  function localTime(c) {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: c.tz || 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(new Date());
    } catch (e) { return '—'; }
  }

  function detail(c) {
    var p;
    try { p = V.panchangForDate(new Date(), c); } catch (e) { p = null; }
    var tz = c.tz || 'Asia/Kolkata';
    var rows = '';
    if (p) {
      rows =
        '<div class="city-detail__panch">' +
        '<div><span>Tithi</span><b>' + p.tithi.paksha + ' ' + p.tithi.name + '</b><small>till ' + V.fmtTime(p.tithi.end, tz) + '</small></div>' +
        '<div><span>Nakshatra</span><b>' + p.nakshatra.name + '</b><small>' + p.nakshatra.lord + ' · pada ' + p.nakshatra.pada + '</small></div>' +
        '<div><span>Sunrise</span><b>' + V.fmtTime(p.sunrise, tz) + '</b><small>Sunset ' + V.fmtTime(p.sunset, tz) + '</small></div>' +
        '<div><span>Rahu Kaal</span><b class="text-danger">' + V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz) + '</b><small>Avoid new starts</small></div>' +
        '</div>';
    }
    var kind = c.famous ? 'Famous place &amp; tirth' : (c.district ? 'Administrative district' : (c.tz !== 'Asia/Kolkata' ? 'NRI hub' : 'Metro city'));
    var html =
      '<div class="city-detail">' +
      '<div class="city-detail__head">' +
      '<div class="city-detail__mark">' + A.icon(c.famous ? 'star' : (c.district ? 'pin' : 'compass')) + '</div>' +
      '<div><h2>' + A.esc(c.name) + '</h2><p>' + A.esc(c.state) + ' · ' + kind + '</p></div>' +
      '</div>' +
      '<div class="city-detail__meta">' +
      '<span>' + A.cityMeta(c) + '</span>' +
      '<span>Local time: <b>' + localTime(c) + '</b></span>' +
      '</div>' + rows +
      '<div class="city-detail__actions">' +
      '<button type="button" class="btn btn--primary btn--sm" id="citySetBtn">' + A.icon('check') + ' Set as my city</button>' +
      '<a class="btn btn--ghost btn--sm" href="panchang.html?city=' + encodeURIComponent(c.name) + '">Full panchang</a>' +
      '<button type="button" class="btn btn--ghost btn--sm" id="cityShareBtn">' + A.icon('spark') + ' Share</button>' +
      '<a class="btn btn--gold btn--sm" href="booking.html?city=' + encodeURIComponent(c.name) + '">Book a pooja</a>' +
      '</div>' +
      '<p class="tiny muted mt-2">Panchang is computed for today at these exact coordinates. Choose the date on the panchang page for another day.</p>' +
      '</div>';
    A.openModal(html, { width: '640px' });

    var setBtn = $('#citySetBtn');
    if (setBtn) {
      setBtn.addEventListener('click', function () {
        A.store.set('vp_city', c.name);
        var ticker = $('#tickerText');
        if (ticker && A.teller) ticker.textContent = A.teller();
        A.toast(c.name + ' saved as your city');
        setBtn.innerHTML = A.icon('check') + ' Saved';
        setBtn.disabled = true;
      });
    }
    var shareBtn = $('#cityShareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var url = location.origin + location.pathname + '?city=' + encodeURIComponent(c.name);
        var text = 'Panchang for ' + c.name + ', ' + c.state + ' — ' + url;
        if (navigator.share) {
          navigator.share({ title: c.name + ' · Vedic Pooja', text: 'Live panchang for ' + c.name, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () { A.toast('Link copied'); }).catch(function () { A.toast('Copy this link: ' + url); });
        } else {
          A.toast('Copy this link: ' + url);
        }
      });
    }
  }

  function fillStates() {
    var sel = $('#cityState');
    if (!sel) return;
    var groups = {};
    ALL.forEach(function (c) { groups[c.state] = (groups[c.state] || 0) + 1; });
    var india = Object.keys(groups).filter(function (s) {
      return ALL.some(function (c) { return c.state === s && c.tz === 'Asia/Kolkata'; });
    }).sort();
    var world = Object.keys(groups).filter(function (s) { return india.indexOf(s) < 0; }).sort();
    var opt = '<option value="all">All states &amp; countries (' + ALL.length.toLocaleString('en-IN') + ')</option>';
    opt += '<optgroup label="Indian states &amp; union territories">';
    india.forEach(function (s) { opt += '<option value="' + A.esc(s) + '">' + A.esc(s) + ' (' + groups[s] + ')</option>'; });
    opt += '</optgroup>';
    if (world.length) {
      opt += '<optgroup label="NRI hubs">';
      world.forEach(function (s) { opt += '<option value="' + A.esc(s) + '">' + A.esc(s) + ' (' + groups[s] + ')</option>'; });
      opt += '</optgroup>';
    }
    sel.innerHTML = opt;
  }

  function fillStats() {
    var stats = $$('#cityStats b');
    if (stats.length < 4) return;
    stats[0].textContent = ALL.length.toLocaleString('en-IN');
    stats[1].textContent = ALL.filter(function (c) { return c.district; }).length.toLocaleString('en-IN');
    stats[2].textContent = ALL.filter(function (c) { return c.famous; }).length.toLocaleString('en-IN');
    var groups = {};
    ALL.forEach(function (c) { groups[c.state] = 1; });
    stats[3].textContent = Object.keys(groups).length.toLocaleString('en-IN');
  }

  function setKind(kind) {
    state.kind = kind;
    state.shown = PAGE;
    var sel = $('#cityKind');
    if (sel) sel.value = kind;
    $$('#cityQuick .chip').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-kind') === kind);
    });
    render();
  }

  function init() {
    fillStates();
    fillStats();
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });

    var search = $('#dirCitySearch');
    var timer = null;
    if (search) {
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = search.value;
          state.shown = PAGE;
          render();
        }, 120);
      });
      var q = /[?&]q=([^&]+)/.exec(location.search);
      if (q) {
        state.q = decodeURIComponent(q[1].replace(/\+/g, ' '));
        search.value = state.q;
      }
    }

    var sel = $('#cityState');
    if (sel) {
      sel.addEventListener('change', function () {
        state.state = sel.value;
        state.shown = PAGE;
        render();
      });
    }
    var kind = $('#cityKind');
    if (kind) {
      kind.addEventListener('change', function () { setKind(kind.value); });
    }
    $$('#cityQuick .chip').forEach(function (b) {
      b.addEventListener('click', function () { setKind(b.getAttribute('data-kind')); });
    });
    var more = $('#cityMore');
    if (more) {
      more.addEventListener('click', function () {
        state.shown += PAGE;
        render();
      });
    }
    var reset = $('#cityReset');
    if (reset) {
      reset.addEventListener('click', function () {
        state = { q: '', kind: 'all', state: 'all', shown: PAGE };
        if (search) search.value = '';
        if (sel) sel.value = 'all';
        if (kind) kind.value = 'all';
        setKind('all');
      });
    }

    var wanted = /[?&]city=([^&]+)/.exec(location.search);
    if (wanted) {
      var name = decodeURIComponent(wanted[1].replace(/\+/g, ' '));
      var found = ALL.filter(function (c) { return c.name === name; })[0];
      if (found) { state.q = found.name; if (search) search.value = found.name; }
    }

    setKind('all');
    if (wanted && ALL.some(function (c) { return c.name === decodeURIComponent(wanted[1].replace(/\+/g, ' ')); })) {
      var hit = ALL.filter(function (c) { return c.name === decodeURIComponent(wanted[1].replace(/\+/g, ' ')); })[0];
      setTimeout(function () { detail(hit); }, 220);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Local clocks and today's panchang in the directory stay current.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') render();
  });
  window.addEventListener('pageshow', render);
  setInterval(function () {
    if (document.visibilityState === 'visible') render();
  }, 60000);
})();
