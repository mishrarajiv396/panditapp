/* Vedic Pooja — site-wide search.
   A lightweight command palette that searches poojas, pandits, samagri,
   services, tools, pages and all 1,000+ cities. It is injected by app.js on
   every page, so this file only talks to the header button and the overlay. */
(function () {
  'use strict';

  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon;

  var RECENT_KEY = 'vp_recent_searches';
  var MAX_RECENT = 5;
  var GROUP_LIMIT = 5;
  var TOTAL_LIMIT = 26;

  var PAGES = [
    { title: 'All poojas & rituals', sub: '100 all-inclusive Vedic poojas', href: 'poojas.html', icon: 'fire', keys: 'pooja puja ritual catalogue book satyanarayan griha pravesh' },
    { title: 'Services & consultations', sub: 'Astrology, Vastu, numerology, pooja paath', href: 'services.html', icon: 'spark', keys: 'service consultation jyotish astrology vastu numerology anka' },
    { title: 'Free puja guide', sub: 'Step-by-step Satyanarayan vidhi', href: 'puja-guide.html', icon: 'book', keys: 'guide vidhi steps satyanarayan katha free samagri' },
    { title: 'Verified pandits', sub: 'Background-checked acharyas near you', href: 'pandits.html', icon: 'user', keys: 'pandit acharya priest brahmin verified book' },
    { title: 'Free kundli', sub: 'Birth chart, dasha, doshas and remedies', href: 'kundli.html', icon: 'compass', keys: 'kundli janam patrika birth chart dasha dosha horoscope' },
    { title: 'Kundli matching', sub: '36-guna Ashtakoota compatibility', href: 'matching.html', icon: 'heart', keys: 'matching gun milan compatibility vivah marriage ashtakoota' },
    { title: 'Today’s panchang', sub: 'Tithi, nakshatra, Rahu Kaal, muhurat', href: 'panchang.html', icon: 'sun', keys: 'panchang tithi nakshatra rahu kaal muhurat choghadiya today' },
    { title: 'Muhurat Studio', sub: 'Find the best day and build the full ritual plan', href: 'muhurat.html', icon: 'compass', keys: 'muhurat studio shubh time finder planner samagri budget reminder ritual plan' },
    { title: 'Mantra & aarti library', sub: '16 mantras, 4 aartis, meaning and japa counter', href: 'mantra.html', icon: 'book', keys: 'mantra aarti japa mala gayatri mahamrityunjay om jai jagdish chanting sanskrit devanagari' },
    { title: 'Festival calendar', sub: 'Vrat, ekadashi, purnima and festivals', href: 'calendar.html', icon: 'calendar', keys: 'calendar festival vrat ekadashi purnima 2026' },
    { title: 'Daily rashifal', sub: 'All 12 moon signs in Hindi and English', href: 'horoscope.html', icon: 'star', keys: 'rashifal horoscope rashi zodiac daily aaj ka' },
    { title: 'City directory', sub: '1,057 districts, tirths and famous places', href: 'cities.html', icon: 'pin', keys: 'city district famous place temple tirth travel panchang' },
    { title: 'Pooja samagri shop', sub: 'Kits, havan goods, flowers and gemstones', href: 'shop.html', icon: 'box', keys: 'samagri shop kit havan ghee flowers rudraksha gemstone' },
    { title: 'Reviews', sub: 'What families say after the ritual', href: 'reviews.html', icon: 'star', keys: 'review rating feedback testimonial' },
    { title: 'About & Seva', sub: 'Standards, dakshina and UPI details', href: 'about.html', icon: 'info', keys: 'about seva dakshina upi contact us' },
    { title: 'Policies & support', sub: 'Privacy, refunds and cancellation', href: 'policies.html', icon: 'shield', keys: 'policy privacy refund cancellation support help' },
    { title: 'My bookings', sub: 'Track and manage your upcoming rituals', href: '#bookings', icon: 'calendar', keys: 'my booking order track manage cancel', action: 'bookings' }
  ];

  var SERVICES = [
    { title: 'Astrology consultation', sub: 'Career, marriage, gemstones and birth-chart reading', href: 'services.html#astrology', icon: 'star', keys: 'astrology jyotish gemstone kundli career marriage palm prashna consultation' },
    { title: 'Vastu Shastra consultation', sub: 'Home, office and factory direction remedies', href: 'services.html#vastu', icon: 'compass', keys: 'vastu shastra home office factory direction remedy consultation' },
    { title: 'Numerology consultation', sub: 'Birth, destiny and name numbers', href: 'services.html#numerology', icon: 'chart', keys: 'numerology anka birth number destiny name number lucky' },
    { title: 'Pooja Paath guidance', sub: 'Nine living ritual traditions explained', href: 'services.html#pooja-paath', icon: 'temple', keys: 'pooja paath ritual tradition business festival grah shanti marriage navratri homa' }
  ];

  var CHIPS = ['Satyanarayan', 'Griha Pravesh', 'Rudrabhishek', 'Kundli', 'Panchang', 'Vastu', 'Pandit', 'Gurugram'];

  var GROUP_ORDER = { Poojas: 1, Pandits: 2, Samagri: 3, Services: 4, Tools: 5, Pages: 6, Cities: 7 };

  var items = null;
  var byHref = {};
  var overlay = null;
  var input = null;
  var body = null;
  var activeIndex = -1;
  var lastFocus = null;

  /* ------------------------------------------------------------- utilities */
  function norm(value) {
    return String(value == null ? '' : value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function reEsc(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function tokensFor(query) {
    return norm(query).split(/[\s,]+/).filter(function (t) { return t.length > 0; }).slice(0, 5);
  }

  function highlight(text, tokens) {
    var raw = String(text == null ? '' : text);
    if (!tokens.length) return esc(raw);
    var sorted = tokens.slice().sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('(' + sorted.map(reEsc).join('|') + ')', 'ig');
    return raw.split(re).map(function (part, i) {
      return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part);
    }).join('');
  }

  function recent() {
    var list = A.store.get(RECENT_KEY, []);
    return Array.isArray(list) ? list.filter(function (v) { return typeof v === 'string' && v; }).slice(0, MAX_RECENT) : [];
  }

  function remember(query) {
    var q = String(query || '').trim();
    if (!q) return;
    var list = recent().filter(function (v) { return norm(v) !== norm(q); });
    list.unshift(q);
    A.store.set(RECENT_KEY, list.slice(0, MAX_RECENT));
  }

  /* ----------------------------------------------------------------- index */
  function makeItem(group, data) {
    return {
      group: group,
      title: data.title,
      sub: data.sub || '',
      href: data.href,
      icon: data.icon || 'spark',
      action: data.action || '',
      nk: norm([data.title, data.sub, data.keys].join(' ')),
      nt: norm(data.title),
      priority: data.priority || 0
    };
  }

  function buildIndex() {
    if (items) return items;
    items = [];

    D.POOJAS.forEach(function (p) {
      items.push(makeItem('Poojas', {
        title: p.name,
        sub: [p.cat, p.duration, 'from ' + A.INR(p.price)].filter(Boolean).join(' · '),
        href: 'poojas.html?q=' + encodeURIComponent(p.name),
        icon: 'fire',
        keys: [p.hi, p.cat, (p.tags || []).join(' '), p.desc].join(' '),
        priority: p.popular ? 10 : 0
      }));
    });

    D.PANDITS.forEach(function (p) {
      items.push(makeItem('Pandits', {
        title: p.name,
        sub: [p.title, p.area, p.exp + ' yrs', p.tradition].filter(Boolean).join(' · '),
        href: 'pandits.html?q=' + encodeURIComponent(p.name),
        icon: 'user',
        keys: [p.title, p.area, p.tradition, (p.langs || []).join(' '), (p.spec || []).join(' '), p.bio].join(' '),
        priority: 4
      }));
    });

    D.PRODUCTS.forEach(function (p) {
      items.push(makeItem('Samagri', {
        title: p.name,
        sub: [p.cat, A.INR(p.price)].filter(Boolean).join(' · '),
        href: 'shop.html?q=' + encodeURIComponent(p.name),
        icon: 'box',
        keys: [p.cat, p.desc].join(' ')
      }));
    });

    SERVICES.forEach(function (s) {
      items.push(makeItem('Services', {
        title: s.title, sub: s.sub, href: s.href, icon: s.icon, keys: s.keys, priority: 3
      }));
    });

    PAGES.forEach(function (p) {
      items.push(makeItem('Pages', {
        title: p.title, sub: p.sub, href: p.href, icon: p.icon, keys: p.keys,
        action: p.action, priority: 2
      }));
    });

    D.CITIES.forEach(function (c) {
      items.push(makeItem('Cities', {
        title: c.name,
        sub: (c.state ? c.state + ' · ' : '') + 'panchang & timings',
        href: 'panchang.html?city=' + encodeURIComponent(c.name),
        icon: 'pin',
        keys: [c.state, 'city district panchang'].join(' '),
        priority: c.famous ? 2 : 0
      }));
    });

    items.forEach(function (it) { byHref[it.href] = it; });
    return items;
  }

  function scoreItem(item, tokens) {
    var score = item.priority;
    var title = item.nt;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (title === t) score += 130;
      else if (title.indexOf(t) === 0) score += 90;
      else if (new RegExp('(^|[\\s·(])' + reEsc(t)).test(title)) score += 65;
      else if (title.indexOf(t) >= 0) score += 48;
      else if (item.nk.indexOf(t) >= 0) score += 16;
      else return -1;
    }
    // A shorter title is usually the better match for the same words.
    return score + Math.max(0, 12 - title.length / 8);
  }

  function search(query) {
    var tokens = tokensFor(query);
    if (!tokens.length) return [];
    var hits = [];
    buildIndex().forEach(function (item) {
      var s = scoreItem(item, tokens);
      if (s > 0) hits.push({ item: item, score: s });
    });
    hits.sort(function (a, b) {
      return b.score - a.score ||
        (GROUP_ORDER[a.item.group] || 9) - (GROUP_ORDER[b.item.group] || 9) ||
        a.item.title.localeCompare(b.item.title);
    });
    return hits.slice(0, TOTAL_LIMIT).map(function (h) { return h.item; });
  }

  function grouped(list) {
    var groups = [];
    var map = {};
    list.forEach(function (item) {
      if (!map[item.group]) {
        map[item.group] = { title: item.group, items: [] };
        groups.push(map[item.group]);
      }
      map[item.group].items.push(item);
    });
    groups.forEach(function (g) { g.items = g.items.slice(0, GROUP_LIMIT); });
    return groups;
  }

  /* --------------------------------------------------------------- markup */
  function itemHTML(item, tokens, index) {
    var attrs = ' href="' + esc(item.href) + '" data-gs-item data-gs-index="' + index + '"';
    if (item.action) attrs += ' data-gs-action="' + esc(item.action) + '"';
    return '<a class="gs__item"' + attrs + ' role="option" aria-selected="false">' +
      '<span class="gs__ico">' + icon(item.icon) + '</span>' +
      '<span class="gs__txt"><b>' + highlight(item.title, tokens) + '</b>' +
      (item.sub ? '<small>' + highlight(item.sub, tokens) + '</small>' : '') + '</span>' +
      '<span class="gs__go" aria-hidden="true">' + icon('arrow') + '</span>' +
      '</a>';
  }

  function groupHTML(group, tokens, start) {
    var html = '<div class="gs__group"><h3>' + esc(group.title) + '</h3><div class="gs__list" role="presentation">';
    group.items.forEach(function (item, i) { html += itemHTML(item, tokens, start + i); });
    return html + '</div></div>';
  }

  function chipsHTML(list, label, iconName) {
    if (!list.length) return '';
    return '<div class="gs__chips-wrap"><span class="gs__label">' + esc(label) + '</span>' +
      '<div class="gs__chips">' + list.map(function (q) {
        return '<button type="button" class="gs__chip" data-gs-chip="' + esc(q) + '">' +
          (iconName ? icon(iconName) : '') + esc(q) + '</button>';
      }).join('') + '</div></div>';
  }

  /* Queries worth trying on an empty box. */
  function defaults() {
    buildIndex();
    function titleIn(list, name) { return list.filter(function (p) { return p.title === name; })[0]; }
    var popular = D.POOJAS.filter(function (p) { return p.popular; }).slice(0, 4)
      .map(function (p) { return titleIn(items, p.name); }).filter(Boolean);
    var tools = ['Free kundli', 'Today’s panchang', 'Verified pandits', 'Kundli matching', 'Festival calendar']
      .map(function (title) {
        var page = titleIn(PAGES, title);
        return page ? byHref[page.href] : null;
      }).filter(Boolean);
    var cities = D.CITIES.filter(function (c) { return c.famous; }).slice(0, 4)
      .map(function (c) { return items.filter(function (i) { return i.group === 'Cities' && i.title === c.name; })[0]; })
      .filter(Boolean);

    return [
      { title: 'Popular poojas', items: popular },
      { title: 'Tools & timings', items: tools },
      { title: 'Top cities', items: cities }
    ].filter(function (g) { return g.items.length; });
  }

  function render(query) {
    var q = String(query || '').trim();
    var tokens = tokensFor(q);
    var html = '';

    if (!q) {
      var rec = recent();
      html += '<div class="gs__home">' +
        chipsHTML(rec, 'Recent searches', 'clock') +
        chipsHTML(CHIPS, 'Try searching') +
        '</div>';
      var startIndex = 0;
      defaults().forEach(function (g) {
        html += groupHTML(g, [], startIndex);
        startIndex += g.items.length;
      });
    } else {
      var hits = search(q);
      if (!hits.length) {
        html = '<div class="gs__empty">' +
          '<span class="gs__empty-ico">' + icon('search') + '</span>' +
          '<b>No match for “' + esc(q) + '”</b>' +
          '<span>Try “Satyanarayan”, “Griha Pravesh”, “Kundli”, “Vastu” or a city name.</span>' +
          '<div class="gs__chips">' + CHIPS.slice(0, 6).map(function (c) {
            return '<button type="button" class="gs__chip" data-gs-chip="' + esc(c) + '">' + esc(c) + '</button>';
          }).join('') + '</div></div>';
      } else {
        var start = 0;
        grouped(hits).forEach(function (g) {
          html += groupHTML(g, tokens, start);
          start += g.items.length;
        });
      }
    }

    body.innerHTML = html;
    activeIndex = -1;
    setActive(q ? 0 : -1);
  }

  /* ------------------------------------------------------------ interaction */
  function visibleItems() {
    return body ? Array.prototype.slice.call(body.querySelectorAll('[data-gs-item]')) : [];
  }

  function setActive(index) {
    var list = visibleItems();
    if (!list.length) { activeIndex = -1; return; }
    if (index >= list.length) index = 0;
    if (index < 0) {
      activeIndex = -1;
      list.forEach(function (el) {
        el.classList.remove('is-active');
        el.setAttribute('aria-selected', 'false');
      });
      return;
    }
    activeIndex = index;
    list.forEach(function (el, i) {
      var on = i === index;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var el = list[index];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'gs';
    overlay.id = 'globalSearch';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gs__scrim" data-gs-close></div>' +
      '<div class="gs__panel" role="dialog" aria-modal="true" aria-labelledby="gsTitle">' +
      '<div class="gs__bar">' +
      '<span class="gs__search-ico" aria-hidden="true">' + icon('search') + '</span>' +
      '<h2 class="gs__sr" id="gsTitle">Search Vedic Pooja</h2>' +
      '<input type="search" id="gsInput" placeholder="Search poojas, pandits, samagri, cities…" autocomplete="off" spellcheck="false" aria-label="Search the website" aria-controls="gsBody">' +
      '<button type="button" class="gs__clear" data-gs-clear aria-label="Clear search" hidden>' + icon('close') + '</button>' +
      '<button type="button" class="gs__close" data-gs-close aria-label="Close search">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="gs__body" id="gsBody" role="listbox" aria-label="Search results"></div>' +
      '<div class="gs__foot">' +
      '<span class="gs__hints"><kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close</span>' +
      '<span class="gs__brand">' + icon('om') + ' Vedic Pooja</span>' +
      '</div></div>';
    document.body.appendChild(overlay);

    input = $('#gsInput', overlay);
    body = $('#gsBody', overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-gs-close]')) { close(); return; }
      if (e.target.closest('[data-gs-clear]')) {
        input.value = '';
        syncClear();
        render('');
        input.focus();
        return;
      }
      var chip = e.target.closest('[data-gs-chip]');
      if (chip) {
        input.value = chip.getAttribute('data-gs-chip');
        syncClear();
        render(input.value);
        input.focus();
        return;
      }
      var item = e.target.closest('[data-gs-item]');
      if (item) {
        remember(input.value);
        var action = item.getAttribute('data-gs-action');
        if (action === 'bookings') {
          e.preventDefault();
          close();
          if (A.bookingsModal) A.bookingsModal();
        }
      }
    });

    overlay.addEventListener('mousemove', function (e) {
      var item = e.target.closest('[data-gs-item]');
      if (!item) return;
      var list = visibleItems();
      var i = list.indexOf(item);
      if (i >= 0 && i !== activeIndex) setActive(i);
    });

    input.addEventListener('input', function () {
      syncClear();
      render(input.value);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var up = visibleItems();
        setActive(activeIndex <= 0 ? up.length - 1 : activeIndex - 1);
      }
      else if (e.key === 'Enter') {
        var list = visibleItems();
        var el = list[activeIndex] || list[0];
        if (!el) return;
        e.preventDefault();
        remember(input.value);
        if (el.getAttribute('data-gs-action') === 'bookings') {
          close();
          if (A.bookingsModal) A.bookingsModal();
        } else {
          location.href = el.getAttribute('href');
        }
      }
    });

    return overlay;
  }

  function syncClear() {
    var btn = overlay && overlay.querySelector('[data-gs-clear]');
    if (btn) btn.hidden = !input.value;
  }

  function isOpen() {
    return Boolean(overlay && !overlay.hidden);
  }

  function open(query) {
    build();
    if (isOpen() && document.activeElement === input) {
      if (typeof query === 'string') { input.value = query; syncClear(); render(query); }
      return;
    }
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('gs-open');
    document.documentElement.classList.add('gs-open');
    $$('[data-gs-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    input.value = typeof query === 'string' ? query : '';
    syncClear();
    render(input.value);
    window.setTimeout(function () { input.focus({ preventScroll: true }); input.select(); }, 30);
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('gs-open');
    document.documentElement.classList.remove('gs-open');
    $$('[data-gs-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }

  function isTyping(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function init() {
    build();
    if (A) A.openSearch = open;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-gs-open]');
      if (!trigger) return;
      e.preventDefault();
      open();
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen()) close(); else open();
        return;
      }
      if (e.key === '/' && !isOpen() && !isTyping(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open();
        return;
      }
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
