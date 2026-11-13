/* Pandits page — filtering, profiles, audio preview and applications */
(function () {
  'use strict';
  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;

  var state = { q: '', tradition: 'all', language: 'all', spec: 'all', sort: 'rating' };

  var audio = { ctx: null, master: null, oscs: [], timer: null, btn: null, card: null };

  function init() {
    var initialQ = '';
    try {
      initialQ = (new URLSearchParams(location.search).get('q') || '').trim();
    } catch (e) { /* very old browser */ }
    if (initialQ) {
      state.q = initialQ.toLowerCase();
      var searchBox = $('#panditSearch');
      if (searchBox) searchBox.value = initialQ;
    }

    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });
    $$('[data-search-icon]').forEach(function (el) { el.innerHTML = A.icon('search'); });

    var traditions = ['all'].concat(D.PANDITS.map(function (p) { return p.tradition; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort());
    $('#panditTradition').innerHTML = traditions.map(function (t) {
      return '<option value="' + A.esc(t) + '">' + (t === 'all' ? A.t('All traditions') : A.esc(t)) + '</option>';
    }).join('');

    var langs = ['all'].concat(D.LANGUAGES.filter(function (l) {
      return D.PANDITS.some(function (p) { return p.langs.indexOf(l) >= 0; });
    }));
    $('#panditLanguage').innerHTML = langs.map(function (l) {
      return '<option value="' + A.esc(l) + '">' + (l === 'all' ? A.t('All languages') : A.esc(l)) + '</option>';
    }).join('');

    var counts = {};
    D.PANDITS.forEach(function (p) { p.spec.forEach(function (s) { counts[s] = (counts[s] || 0) + 1; }); });
    var specs = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).slice(0, 8);
    $('#panditSpecs').innerHTML = '<button type="button" class="filter-chip active" data-spec="all">' + A.t('All specialities') + '</button>' +
      specs.map(function (s) { return '<button type="button" class="filter-chip" data-spec="' + A.esc(s) + '">' + A.esc(s) + '</button>'; }).join('');

    $('#panditSearch').addEventListener('input', function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
    $('#panditTradition').addEventListener('change', function (e) { state.tradition = e.target.value; render(); });
    $('#panditLanguage').addEventListener('change', function (e) { state.language = e.target.value; render(); });
    $('#panditSort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $$('#panditSpecs .filter-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        state.spec = b.getAttribute('data-spec');
        $$('#panditSpecs .filter-chip').forEach(function (x) { x.classList.toggle('active', x === b); });
        render();
      });
    });
    $('#panditReset').addEventListener('click', function () {
      state = { q: '', tradition: 'all', language: 'all', spec: 'all', sort: 'rating' };
      $('#panditSearch').value = '';
      $('#panditTradition').value = 'all';
      $('#panditLanguage').value = 'all';
      $('#panditSort').value = 'rating';
      $$('#panditSpecs .filter-chip').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-spec') === 'all'); });
      render();
    });

    render();
    if (A.onLang) A.onLang(function () {
      var tr = $('#panditTradition'); if (tr && tr.options[0]) tr.options[0].textContent = A.t('All traditions');
      var lg = $('#panditLanguage'); if (lg && lg.options[0]) lg.options[0].textContent = A.t('All languages');
      var sp = $('#panditSpecs [data-spec="all"]'); if (sp) sp.textContent = A.t('All specialities');
      render();
    });
    initJoin();
  }

  function list() {
    var out = D.PANDITS.filter(function (p) {
      if (state.tradition !== 'all' && p.tradition !== state.tradition) return false;
      if (state.language !== 'all' && p.langs.indexOf(state.language) < 0) return false;
      if (state.spec !== 'all' && p.spec.indexOf(state.spec) < 0) return false;
      if (state.q) {
        var hay = [p.name, p.title, p.area, p.tradition, p.bio].concat(p.langs, p.spec).join(' ').toLowerCase();
        if (hay.indexOf(state.q) < 0) return false;
      }
      return true;
    });
    if (state.sort === 'rating') out.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
    else if (state.sort === 'experience') out.sort(function (a, b) { return b.exp - a.exp; });
    else if (state.sort === 'reviews') out.sort(function (a, b) { return b.reviews - a.reviews; });
    else out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  }

  function initials(name) {
    return name.replace(/^(Pt\.|Pandita|Acharya|Dr\.)\s*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function render() {
    var items = list();
    $('#panditCount').textContent = items.length + ' pandit' + (items.length === 1 ? '' : 's');

    if (!items.length) {
      $('#panditGrid').innerHTML = '';
      $('#panditEmpty').classList.remove('hide');
      return;
    }
    $('#panditEmpty').classList.add('hide');

    $('#panditGrid').innerHTML = items.map(function (p) {
      return '<article class="card pandit reveal">' +
        '<div class="pandit__head">' +
          '<div class="pandit__avatar" style="--pc:' + p.color + '">' + initials(p.name) +
            '<span class="pandit__verified" title="Identity &amp; institution verified">' + A.icon('check') + '</span></div>' +
          '<div class="pandit__head-txt">' +
            '<h3>' + A.esc(p.name) + '</h3>' +
            '<p class="pandit__title">' + A.esc(p.title) + ' · ' + p.exp + ' yrs</p>' +
            '<div class="pandit__rating">' + A.starIcon() + '<b>' + p.rating.toFixed(1) + '</b><span>(' + p.reviews + ' reviews)</span></div>' +
          '</div>' +
        '</div>' +
        '<p class="pandit__bio">' + A.esc(p.bio) + '</p>' +
        '<div class="pandit__meta">' +
          '<span>' + A.icon('pin') + A.esc(p.area) + '</span>' +
          '<span>' + A.icon('globe') + A.esc(p.tradition) + '</span>' +
        '</div>' +
        '<div class="pandit__langs">' + p.langs.map(function (l) { return '<span class="chip chip--sm">' + A.esc(l) + '</span>'; }).join('') + '</div>' +
        '<p class="pandit__spec">' + A.esc(p.spec.join(' · ')) + '</p>' +
        '<div class="pandit__foot">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-profile="' + p.id + '">View profile</button>' +
          '<div class="pandit__actions">' +
            '<button class="pandit__audio" type="button" data-audio="' + p.id + '" aria-label="Play a tanpura audio reference">' + A.icon('play') + '<span>Sample</span></button>' +
            '<a class="btn btn--primary btn--sm" href="booking.html?pandit=' + p.id + '">Book</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    $$('#panditGrid [data-profile]').forEach(function (b) {
      b.addEventListener('click', function () { openProfile(b.getAttribute('data-profile')); });
    });
    $$('#panditGrid [data-audio]').forEach(function (b) {
      b.addEventListener('click', function () { toggleAudio(b, D.PANDITS.filter(function (p) { return p.id === b.getAttribute('data-audio'); })[0]); });
    });
  }

  function waveform() {
    var bars = [10, 18, 26, 16, 32, 22, 12, 28, 20, 34, 24, 14, 30, 18, 26, 10, 22, 16];
    return '<div class="wave">' + bars.map(function (h, i) {
      return '<i style="height:' + h + 'px;animation-delay:' + (i * 0.06).toFixed(2) + 's"></i>';
    }).join('') + '</div>';
  }

  function openProfile(id) {
    var p = D.PANDITS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    A.openModal(
      '<div class="modal__head"><div class="pandit-profile__head">' +
        '<div class="pandit__avatar pandit__avatar--lg" style="--pc:' + p.color + '">' + initials(p.name) + '</div>' +
        '<div><span class="chip chip--green">' + A.icon('shield') + 'Verified</span><h2 class="pandit__name--lg">' + A.esc(p.name) + '</h2>' +
        '<p class="small muted">' + A.esc(p.title) + ' · ' + p.exp + ' years · ' + A.esc(p.area) + '</p></div>' +
      '</div><button class="close-x" data-modal-close aria-label="Close">' + A.icon('close') + '</button></div>' +
      '<div class="modal__body">' +
        '<p class="small muted">' + A.esc(p.bio) + '</p>' +
        '<div class="pandit-profile__grid">' +
          mini('Tradition', p.tradition) + mini('Languages', p.langs.join(', ')) +
          mini('Rating', p.rating.toFixed(1) + ' / 5 · ' + p.reviews + ' reviews') + mini('Experience', p.exp + ' years') +
        '</div>' +
        '<div class="audio-card">' +
          '<div class="audio-card__head"><b>Audio reference</b><span class="tiny muted">Tanpura + bell</span></div>' +
          waveform() +
          '<button class="btn btn--ghost btn--sm" type="button" data-audio="' + p.id + '">' + A.icon('play') + 'Play sample</button>' +
          '<p class="tiny muted">This is an audio-player reference tone. A recorded mantra sample for this pandit is shared on WhatsApp before you confirm.</p>' +
        '</div>' +
        '<div class="chip-row mt-2">' + p.spec.map(function (s) { return '<span class="chip">' + A.esc(s) + '</span>'; }).join('') + '</div>' +
        '<ul class="tick-list mt-2">' +
          '<li data-tick>Aadhaar &amp; address verified</li>' +
          '<li data-tick>Institution certification checked</li>' +
          '<li data-tick>Live chanting assessment cleared</li>' +
          '<li data-tick>Gate-pass and society protocol trained</li>' +
        '</ul>' +
        '<div class="modal-price"><div><b class="serif fs-12">All-inclusive booking</b>' +
          '<p class="tiny muted">Pandit, dakshina, travel and samagri — one transparent price.</p></div>' +
          '<a class="btn btn--primary" href="booking.html?pandit=' + p.id + '">Book ' + A.esc(p.name.replace(/^(Pt\.|Pandita|Acharya|Dr\.)\s*/, '').split(' ')[0]) + A.icon('arrow') + '</a></div>' +
      '</div>', { width: '600px' });

    $$('.modal [data-tick]').forEach(function (el) { el.innerHTML = A.icon('check') + '<span>' + el.textContent + '</span>'; });
    var ab = $('.modal [data-audio]');
    if (ab) ab.addEventListener('click', function () { toggleAudio(ab, p); });
  }

  function mini(k, v) {
    return '<div class="cal-meta"><span>' + k + '</span><b>' + A.esc(v) + '</b></div>';
  }

  /* ------------------------------------------------------------- audio */
  function stopAudio() {
    if (audio.timer) { clearTimeout(audio.timer); audio.timer = null; }
    if (audio.master) {
      try {
        audio.master.gain.cancelScheduledValues(audio.ctx.currentTime);
        audio.master.gain.setValueAtTime(audio.master.gain.value, audio.ctx.currentTime);
        audio.master.gain.linearRampToValueAtTime(0, audio.ctx.currentTime + 0.4);
      } catch (e) { /* ignore */ }
    }
    var oscs = audio.oscs.slice();
    audio.oscs = [];
    setTimeout(function () {
      oscs.forEach(function (o) { try { o.stop(); } catch (e) { /* ignore */ } });
    }, 450);
    if (audio.btn) {
      audio.btn.classList.remove('playing');
      audio.btn.innerHTML = A.icon('play') + (audio.btn.classList.contains('pandit__audio') ? '<span>Sample</span>' : 'Play sample');
    }
    if (audio.card) audio.card.classList.remove('playing');
    audio.btn = null;
    audio.card = null;
  }

  function toggleAudio(btn, p) {
    if (audio.btn === btn) { stopAudio(); return; }
    stopAudio();
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { A.toast('Audio is not supported in this browser', 'error'); return; }
    try {
      if (!audio.ctx) audio.ctx = new Ctx();
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      var ctx = audio.ctx, t = ctx.currentTime;
      var master = ctx.createGain();
      master.gain.setValueAtTime(0, t);
      master.gain.linearRampToValueAtTime(0.09, t + 1.1);
      master.connect(ctx.destination);
      audio.master = master;

      [146.83, 220.0, 293.66].forEach(function (f, i) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.value = i === 0 ? 0.55 : 0.22;
        osc.connect(g); g.connect(master);
        osc.start();
        audio.oscs.push(osc);
      });

      var bell = ctx.createOscillator();
      var bg = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.value = 880;
      bg.gain.setValueAtTime(0, t);
      bg.gain.linearRampToValueAtTime(0.16, t + 0.02);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
      bell.connect(bg); bg.connect(ctx.destination);
      bell.start(); bell.stop(t + 2.7);

      audio.btn = btn;
      btn.classList.add('playing');
      btn.innerHTML = A.icon('pause') + (btn.classList.contains('pandit__audio') ? '<span>Playing</span>' : 'Stop sample');
      audio.card = btn.closest('.audio-card');
      if (audio.card) audio.card.classList.add('playing');
      audio.timer = setTimeout(stopAudio, 6000);
      if (p) A.toast('Playing a tanpura reference · ' + p.name);
    } catch (e) {
      A.toast('Could not start audio on this device', 'error');
    }
  }

  /* -------------------------------------------------------------- join */
  function initJoin() {
    var form = $('#joinForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#jName').value.trim();
      var phone = $('#jPhone').value.trim();
      var city = $('#jCity').value.trim();
      if (!name || !phone || !city) {
        A.toast('Please add your name, phone and city', 'error');
        return;
      }
      var application = {
        id: 'PA-' + String(Date.now()).slice(-6),
        name: name, phone: phone, city: city,
        experience: $('#jExp').value, tradition: $('#jTradition').value,
        note: $('#jNote').value.trim(), date: new Date().toISOString()
      };
      var apps = A.store.get('vp_pandit_applications', []);
      apps.unshift(application);
      A.store.set('vp_pandit_applications', apps);
      if (window.PanditAPI && window.PanditAPI.enabled) {
        window.PanditAPI.applyPandit(application);
      }
      A.openModal(
        '<div class="modal__body success"><div class="success__icon">' + A.icon('check') + '</div>' +
        '<h2>Application received</h2><p class="muted mt-1">Thank you, ' + A.esc(name) + '. Our acharya desk will call you on ' + A.esc(phone) + ' within two working days.</p>' +
        '<p class="small muted mt-2">Next: identity and institution verification, then a live chanting assessment.</p>' +
        '<button class="btn btn--primary mt-3" type="button" data-modal-close>Close</button>' +
        '</div>', { width: '460px' });
      form.reset();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
