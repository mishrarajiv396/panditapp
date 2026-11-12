/* ==========================================================================
   Vedic Pooja — 3D experience layer
   Additive behaviour only: one hero canvas, gentle card tilt, a mobile bottom
   dock (single tap) and a searchable facilities sheet (double tap / header
   button). Nothing here changes any calculated panchang or kundli value.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var A = window.App || {};
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function pageName() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }
  function store(key, value) {
    try {
      if (value === undefined) {
        var raw = localStorage.getItem(key);
        return raw == null ? null : JSON.parse(raw);
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* private mode */ }
    return null;
  }
  function icon(name) {
    return A.icon ? A.icon(name) : '';
  }

  /* ---------------------------------------------------------------- hero 3D */
  /* The same starfield and zodiac rings now sit behind every dark page head,
     not just the home hero, so the whole site shares one living sky. */
  function initHero() {
    var hero = $('.hero') || $('.page-head');
    if (!hero || $('#xpHeroCanvas')) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'xp-hero-canvas';
    canvas.id = 'xpHeroCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w = 0, h = 0, dpr = 1;
    var stars = [];
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var visible = true;

    function seed() {
      stars = [];
      var count = Math.max(46, Math.min(120, Math.round((w * h) / 16000)));
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.5 + .35,
          a: Math.random() * .55 + .18,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * .9 + .3
        });
      }
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw(t) {
      if (!visible || !w || !h) return;
      ctx.clearRect(0, 0, w, h);

      // Pointer parallax, eased.
      pointer.x += (pointer.tx - pointer.x) * .04;
      pointer.y += (pointer.ty - pointer.y) * .04;
      var ox = pointer.x * 16;
      var oy = pointer.y * 10;

      // Star field.
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = reduce ? 1 : (.55 + .45 * Math.sin(t * .0011 * s.sp + s.tw));
        ctx.beginPath();
        ctx.arc(s.x * w + ox * s.r, s.y * h + oy * s.r, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,205,130,' + (s.a * tw).toFixed(3) + ')';
        ctx.fill();
      }

      // Two slowly rotating zodiac rings, drawn in true ellipse perspective.
      var cx = w * .72 + ox;
      var cy = h * .3 + oy;
      var base = Math.min(w, h);
      var rings = [
        { rx: base * .46, ry: base * .19, rot: t * .00006, ticks: 12, alpha: .20 },
        { rx: base * .34, ry: base * .14, rot: -t * .00009, ticks: 8, alpha: .14 }
      ];
      for (var r = 0; r < rings.length; r++) {
        var ring = rings[r];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.rot);
        ctx.strokeStyle = 'rgba(232,200,119,' + ring.alpha + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (var k = 0; k < ring.ticks; k++) {
          var a = (k / ring.ticks) * Math.PI * 2;
          var x1 = Math.cos(a) * ring.rx;
          var y1 = Math.sin(a) * ring.ry;
          var x2 = Math.cos(a) * (ring.rx + 6);
          var y2 = Math.sin(a) * (ring.ry + 4);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // A soft gold orbit dot.
      var oa = t * .00022;
      var dx = cx + Math.cos(oa) * base * .34;
      var dy = cy + Math.sin(oa) * base * .14;
      var g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 9);
      g.addColorStop(0, 'rgba(246,197,107,.95)');
      g.addColorStop(1, 'rgba(246,197,107,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(dx, dy, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    var inView = true;
    var running = false;

    function canRun() { return !reduce && visible && inView; }

    function loop(t) {
      if (!canRun()) { running = false; return; }
      draw(t);
      window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || !canRun()) return;
      running = true;
      window.requestAnimationFrame(loop);
    }

    resize();
    if (reduce) {
      draw(0);
    } else {
      start();
    }

    /* Only animate while the header is actually on screen. */
    if ('IntersectionObserver' in window) {
      var hio = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start();
      }, { threshold: 0 });
      hio.observe(hero);
    }

    var ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(function () { resize(); if (reduce) draw(0); });
      ro.observe(hero);
    } else {
      window.addEventListener('resize', function () { resize(); if (reduce) draw(0); });
    }

    if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        pointer.tx = ((e.clientX - rect.left) / rect.width - .5) * -1;
        pointer.ty = ((e.clientY - rect.top) / rect.height - .5) * -1;
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { pointer.tx = 0; pointer.ty = 0; });
    }

    document.addEventListener('visibilitychange', function () {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    });
  }

  /* ------------------------------------------------------------ card tilting */
  function initTilt() {
    if (reduce) return;
    if (!(window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches)) return;
    var targets = $$('.panch-card,.ritual-card,.product,.pandit,.review,.lead-shell,.band,.cta-card,.media-frame,.trustbar>div,.mini-card,.pdp,.contact-line__ico');
    targets.forEach(function (el) {
      if (el.classList.contains('xp-tilt')) return;
      el.classList.add('xp-tilt', 'xp-depth');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--xp-rx', ((py - .5) * 7).toFixed(2) + 'deg');
        el.style.setProperty('--xp-ry', ((px - .5) * -7).toFixed(2) + 'deg');
        el.style.setProperty('--xp-gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--xp-gy', (py * 100).toFixed(1) + '%');
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--xp-rx', '0deg');
        el.style.setProperty('--xp-ry', '0deg');
      });
    });
  }

  /* --------------------------------------------------------- reading bar */
  function initProgress() {
    var head = $('#siteHead');
    if (!head || $('#xpProgress')) return;
    var bar = document.createElement('span');
    bar.className = 'xp-progress';
    bar.id = 'xpProgress';
    bar.setAttribute('aria-hidden', 'true');
    head.appendChild(bar);
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ mobile dock */
  var DOCK = [
    { label: 'Home', href: 'index.html', icon: 'home', match: ['index.html', ''] },
    { label: 'Panchang', href: 'panchang.html', icon: 'sun', match: ['panchang.html'] },
    { core: true, label: 'Facilities', icon: 'grid', id: 'xpFacilities' },
    { label: 'Kundli', href: 'kundli.html', icon: 'compass', match: ['kundli.html'] },
    { label: 'Rashifal', href: 'horoscope.html', icon: 'star', match: ['horoscope.html'] }
  ];

  function initDock() {
    if ($('#xpDock')) return;
    var page = pageName();
    var items = DOCK.map(function (d) {
      if (d.core) {
        return '<button type="button" class="xp-dock__item xp-dock__item--core" id="' + d.id + '" aria-label="Open all facilities and tools" aria-haspopup="dialog">' +
          '<span class="xp-dock__orb">' + icon(d.icon) + '</span><span class="xp-dock__label">' + d.label + '</span></button>';
      }
      var active = d.match.indexOf(page) >= 0;
      return '<a class="xp-dock__item' + (active ? ' active' : '') + '" href="' + d.href + '"' + (active ? ' aria-current="page"' : '') + '>' +
        icon(d.icon) + '<span class="xp-dock__label">' + d.label + '</span></a>';
    }).join('');
    var dock = document.createElement('nav');
    dock.className = 'xp-dock';
    dock.id = 'xpDock';
    dock.setAttribute('aria-label', 'Quick navigation');
    dock.innerHTML = '<div class="xp-dock__bar">' + items + '</div>';
    document.body.appendChild(dock);
    var core = $('#xpFacilities');
    if (core) {
      core.addEventListener('click', function (e) { ripple(e, core); openSheet(); });
    }
    $$('.xp-dock__item', dock).forEach(function (el) {
      if (el.classList.contains('xp-dock__item--core')) return;
      el.addEventListener('click', function (e) { ripple(e, el); });
    });
  }

  function ripple(e, el) {
    if (reduce) return;
    var r = el.getBoundingClientRect();
    var span = document.createElement('span');
    var size = Math.max(r.width, r.height);
    span.className = 'xp-ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size / 2) + 'px';
    span.style.top = (e.clientY - r.top - size / 2) + 'px';
    el.appendChild(span);
    setTimeout(function () { span.remove(); }, 600);
  }

  /* ------------------------------------------------------- facilities sheet */
  var GROUPS = [
    {
      title: 'Today & timing',
      items: [
        { label: 'Today’s panchang', desc: 'Tithi, nakshatra, Rahu Kaal, muhurat', href: 'panchang.html', icon: 'sun', keys: 'panchang tithi nakshatra rahu muhurat today' },
        { label: 'Daily wisdom', desc: 'One Sanskrit line a day with Hindi and English', href: 'index.html#daily-wisdom', icon: 'star', keys: 'daily wisdom quote motivation subhashita sanskrit hindi english' },
        { label: 'Daily rashifal', desc: 'All 12 moon signs, in Hindi and English', href: 'horoscope.html', icon: 'star', keys: 'rashifal horoscope rashi zodiac daily' },
        { label: 'Festival calendar', desc: 'Vrat, ekadashi, purnima and 2026 festivals', href: 'calendar.html', icon: 'calendar', keys: 'festival calendar vrat ekadashi purnima 2026' },
        { label: 'Choghadiya & muhurat', desc: 'Pick an auspicious window for any ritual', href: 'panchang.html#muhurat', icon: 'clock', keys: 'choghadiya muhurat shubh time' }
      ]
    },
    {
      title: 'Kundli & matching',
      items: [
        { label: 'Free kundli', desc: 'Birth chart, dasha, doshas and remedies', href: 'kundli.html', icon: 'compass', keys: 'kundli birth chart janam patrika dasha dosha' },
        { label: 'Kundli matching', desc: '36-guna Ashtakoota compatibility', href: 'matching.html', icon: 'heart', keys: 'matching gun milan compatibility vivah marriage' },
        { label: 'Birth panchang', desc: 'The panchang at your exact birth time', href: 'kundli.html#birthPanchang', icon: 'moon', keys: 'birth panchang janam tithi nakshatra' },
        { label: 'Saved kundlis', desc: 'Charts stored safely on this device', href: 'kundli.html#saved', icon: 'book', keys: 'saved kundli history profile' }
      ]
    },
    {
      title: 'Book & shop',
      items: [
        { label: 'All poojas', desc: '100 rituals with all-inclusive pricing', href: 'poojas.html', icon: 'temple', keys: 'pooja puja book ritual satyanarayan griha pravesh' },
        { label: 'Consultations', desc: 'Astrology, Vastu, numerology and pooja paath', href: 'services.html', icon: 'spark', keys: 'services astrology jyotish vastu numerology anka consultation pooja paath' },
        { label: 'Verified pandits', desc: 'Background-checked acharyas near you', href: 'pandits.html', icon: 'user', keys: 'pandit acharya brahmin verified' },
        { label: 'Pooja samagri', desc: 'Complete kits delivered to your door', href: 'shop.html', icon: 'box', keys: 'samagri shop kit box' },
        { label: 'My bookings', desc: 'Track your upcoming rituals', href: '#bookings', icon: 'calendar', keys: 'booking my order track' }
      ]
    },
    {
      title: 'Explore Bharat',
      items: [
        { label: 'City directory', desc: 'Every district and famous place', href: 'cities.html', icon: 'pin', keys: 'city district famous place temple tirth travel' },
        { label: 'Free puja guide', desc: 'Step-by-step Satyanarayan vidhi', href: 'puja-guide.html', icon: 'book', keys: 'guide vidhi satyanarayan steps free' },
        { label: 'About & Seva', desc: 'Our standards, dakshina and UPI details', href: 'about.html', icon: 'info', keys: 'about seva dakshina upi contact' },
        { label: 'Reviews', desc: 'What families say after the ritual', href: 'reviews.html', icon: 'star', keys: 'review rating feedback testimonial stars' },
        { label: 'Policies & support', desc: 'Privacy, refunds and cancellation', href: 'policies.html', icon: 'shield', keys: 'policy privacy refund cancellation support' }
      ]
    }
  ];

  var sheet = null;
  var lastFocus = null;
  var installPrompt = null;
  var sheetOpenedAt = 0;

  function buildSheet() {
    if (sheet) return sheet;
    sheet = document.createElement('div');
    sheet.className = 'xp-sheet';
    sheet.id = 'xpSheet';
    sheet.innerHTML =
      '<div class="xp-sheet__scrim" data-xp-close></div>' +
      '<div class="xp-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="xpSheetTitle">' +
      '<div class="xp-sheet__grab" aria-hidden="true"></div>' +
      '<div class="xp-sheet__head">' +
      '<div><h2 id="xpSheetTitle">All facilities</h2><p>Everything in Vedic Pooja — one tap away.</p></div>' +
      '<button type="button" class="xp-sheet__close" data-xp-close aria-label="Close facilities">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="xp-sheet__search"><input type="search" id="xpSheetSearch" placeholder="Search panchang, kundli, rashifal, cities…" autocomplete="off" aria-label="Search facilities"></div>' +
      '<div class="xp-sheet__body" id="xpSheetBody"></div>' +
      '<div class="xp-sheet__foot">' +
      '<a class="btn btn--primary btn--sm" href="poojas.html">Book a pooja</a>' +
      '<a class="btn btn--ghost btn--sm xp-wa" href="https://wa.me/918889685370" target="_blank" rel="noopener">WhatsApp</a>' +
      '<button type="button" class="btn btn--ghost btn--sm" id="xpInstall" hidden>Install app</button>' +
      '</div></div>';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) {
      // Opening on the second tap of a double-tap can be followed by the
      // browser's synthetic click at the same spot — do not let that click
      // activate a facility underneath the finger.
      if (Date.now() - sheetOpenedAt < 350) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.target.hasAttribute('data-xp-close') || e.target.closest('[data-xp-close]')) closeSheet();
    }, true);
    var search = $('#xpSheetSearch', sheet);
    search.addEventListener('input', function () { renderSheet(search.value); });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
    });
    var install = $('#xpInstall', sheet);
    if (install) {
      // The browser event may already have fired before the sheet was built.
      install.hidden = !installPrompt;
      install.addEventListener('click', function () {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(function () { installPrompt = null; install.hidden = true; });
      });
    }
    if (A.owner && A.owner.phone) {
      var wa = $('.xp-wa', sheet);
      if (wa) wa.href = 'https://wa.me/' + A.owner.phone + '?text=' + encodeURIComponent('Namaste, I need help choosing the right puja.');
    }
    return sheet;
  }

  function renderSheet(q) {
    var body = $('#xpSheetBody');
    if (!body) return;
    var query = String(q || '').trim().toLowerCase();
    var html = '';
    var total = 0;
    GROUPS.forEach(function (g) {
      var items = g.items.filter(function (it) {
        if (!query) return true;
        return (it.label + ' ' + it.desc + ' ' + (it.keys || '')).toLowerCase().indexOf(query) >= 0;
      });
      if (!items.length) return;
      total += items.length;
      html += '<div class="xp-sheet__group"><h3>' + g.title + '</h3><div class="xp-sheet__grid">' +
        items.map(function (it) {
          var attrs = ' href="' + it.href + '"';
          if (it.href === '#bookings') attrs = ' href="#bookings" data-xp-bookings';
          return '<a class="xp-sheet__item"' + attrs + '>' + icon(it.icon) +
            '<span><b>' + it.label + '</b><small>' + it.desc + '</small></span></a>';
        }).join('') + '</div></div>';
    });
    if (!total) {
      var safe = A.esc ? A.esc(query) : query.replace(/[<>&"]/g, '');
      html = '<div class="xp-sheet__empty">No facility matches “' + safe + '”. Try “kundli”, “panchang” or “city”.</div>';
    }
    body.innerHTML = html;
    $$('[data-xp-bookings]', body).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        closeSheet();
        setTimeout(function () {
          if (A.bookingsModal) A.bookingsModal();
          else location.href = 'booking.html';
        }, 180);
      });
    });
  }

  function openSheet(trigger) {
    if (!sheet) buildSheet();
    lastFocus = trigger || document.activeElement;
    renderSheet('');
    var search = $('#xpSheetSearch', sheet);
    if (search) search.value = '';
    sheetOpenedAt = Date.now();
    sheet.classList.add('open');
    document.body.classList.add('no-scroll');
    var openBtn = $('#quickMenuOpen');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      var input = $('#xpSheetSearch', sheet);
      if (input && window.matchMedia('(hover:hover) and (pointer:fine)').matches) input.focus();
    }, 60);
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove('open');
    document.body.classList.remove('no-scroll');
    var openBtn = $('#quickMenuOpen');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* --------------------------------------------- single tap / double tap nav */
  function isInteractive(el) {
    return !!(el && el.closest && el.closest('a,button,input,select,textarea,label,summary,[contenteditable],[role="button"],[data-no-doubletap]'));
  }

  function initGestures() {
    var lastTap = 0;
    var lastX = 0, lastY = 0;
    var startX = 0, startY = 0;

    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      if (!t) return;
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      if (!t) return;
      // Ignore drags, sheets, inputs and links — a tap on those keeps its own action.
      if (Math.abs(t.clientX - startX) > 12 || Math.abs(t.clientY - startY) > 12) return;
      if (isInteractive(e.target)) return;
      if ($('#xpSheet.open')) return;
      var now = Date.now();
      var near = Math.abs(t.clientX - lastX) < 34 && Math.abs(t.clientY - lastY) < 34;
      if (now - lastTap < 330 && near) {
        lastTap = 0;
        if (navigator.vibrate) { try { navigator.vibrate(12); } catch (err) {} }
        openSheet();
      } else {
        lastTap = now; lastX = t.clientX; lastY = t.clientY;
      }
    }, { passive: true });

    document.addEventListener('dblclick', function (e) {
      if (isInteractive(e.target) || $('#xpSheet.open')) return;
      e.preventDefault();
      openSheet();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet && sheet.classList.contains('open')) closeSheet();
      // Alt+F: facilities, for keyboard users.
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (sheet && sheet.classList.contains('open')) closeSheet(); else openSheet();
      }
    });
  }

  /* ---------------------------------------------------------- onboarding hint */
  function initHint() {
    if (store('vp_doubletap_hint')) return;
    if (!window.matchMedia || !window.matchMedia('(max-width:820px)').matches) return;
    if (reduce) return;
    var hint = document.createElement('div');
    hint.className = 'xp-hint';
    hint.id = 'xpHint';
    hint.innerHTML = icon('grid') + '<span>Double-tap anywhere for all facilities</span>';
    document.body.appendChild(hint);
    setTimeout(function () { hint.classList.add('show'); }, 1400);
    var hide = function () {
      hint.classList.remove('show');
      store('vp_doubletap_hint', true);
      setTimeout(function () { hint.remove(); }, 400);
    };
    setTimeout(hide, 6800);
    document.addEventListener('touchstart', function once() {
      document.removeEventListener('touchstart', once);
      hide();
    }, { passive: true, once: true });
  }

  /* ------------------------------------------------------------ install flow */
  function initInstall() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      installPrompt = e;
      var btn = $('#xpInstall');
      if (btn) btn.hidden = false;
    });
    window.addEventListener('appinstalled', function () {
      installPrompt = null;
      var btn = $('#xpInstall');
      if (btn) btn.hidden = true;
    });
  }

  /* -------------------------------------------------------------- page boot */
  function init() {
    initHero();
    initTilt();
    initProgress();
    initDock();
    buildSheet();
    initGestures();
    initHint();
    var openBtn = $('#quickMenuOpen');
    if (openBtn) openBtn.addEventListener('click', function () { openSheet(openBtn); });
  }

  // Register the install listener before init so a very early
  // beforeinstallprompt is not missed.
  initInstall();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.VedicExperience = {
    openFacilities: openSheet,
    closeFacilities: closeSheet,
    page: pageName
  };
})(window, document);
