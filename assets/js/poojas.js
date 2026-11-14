/* Pooja catalogue — search, category filter, sort and detail modal */
(function () {
  'use strict';
  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;

  var params = new URLSearchParams(location.search);
  var state = {
    q: (params.get('q') || '').trim(),
    cat: params.get('cat') || 'All Rituals',
    sort: params.get('sort') || 'recommended'
  };

  var search = $('#poojaSearch');
  var sortSel = $('#poojaSort');
  var grid = $('#poojaGrid');
  var empty = $('#poojaEmpty');
  var count = $('#poojaCount');
  var cats = $('#poojaCats');

  if (search) search.value = state.q;
  if (sortSel) sortSel.value = state.sort;

  function catMatch(p) { return state.cat === 'All Rituals' || p.cat === state.cat; }

  function textMatch(p) {
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    var hay = [p.name, p.hi, p.cat, p.desc, p.tags.join(' '), p.includes.join(' ')].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function sortList(list) {
    var l = list.slice();
    if (state.sort === 'price-asc') l.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') l.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'name') l.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else l.sort(function (a, b) { return (b.popular ? 1 : 0) - (a.popular ? 1 : 0); });
    return l;
  }

  function card(p) {
    var q = quote(p.price);
    return '<article class="card ritual-card card--hover">' +
      '<div class="ritual-card__art">' +
      (p.popular ? '<span class="ritual-card__fav">Most booked</span>' : '') +
      '<span class="chip">' + A.esc(p.cat) + '</span>' +
      '<span class="ritual-card__emoji">' + p.icon + '</span></div>' +
      '<div class="ritual-card__body">' +
      '<h3 class="ritual-card__title">' + A.esc(p.name) + '</h3>' +
      '<div class="ritual-card__hi dev">' + A.esc(p.hi) + '</div>' +
      '<div class="ritual-card__meta"><span>' + A.icon('clock') + A.esc(p.duration) + '</span><span>' + A.icon('shield') + 'Verified pandit</span></div>' +
      '<p class="ritual-card__desc">' + A.esc(p.desc) + '</p>' +
      (p.id === 'satyanarayan' ? '<a class="link-arrow ritual-card__guide" href="puja-guide.html">Free step-by-step guide ' + A.icon('arrow') + '</a>' : '') +
      '<div class="ritual-card__foot">' + priceBlock(p, q) +
      '<div class="pooja-actions">' +
      '<button class="btn btn--ghost btn--sm" data-detail="' + p.id + '">Details</button>' +
      '<a class="ritual-card__add" href="booking.html?pooja=' + p.id + '">Book ' + A.icon('arrow') + '</a>' +
      '</div></div></div></article>';
  }

  function quote(list) {
    return (window.VPPromo && window.VPPromo.price)
      ? window.VPPromo.price(list)
      : { list: list, price: list, discount: 0, active: false };
  }

  function promoBadge() {
    return (window.VPPromo && window.VPPromo.copy)
      ? window.VPPromo.copy('badge')
      : '20% OFF';
  }

  function priceBlock(p, q) {
    q = q || quote(p.price);
    if (!q.discount) {
      return '<div class="price">' + A.INR(q.price) +
        '<small>all inclusive <span class="mrp">' + A.INR(p.mrp) + '</span></small></div>';
    }
    return '<div class="price">' + A.INR(q.price) +
      '<small>all inclusive <s class="promo-strike">' + A.INR(q.list) + '</s></small>' +
      '<span class="price__promo"><span class="promo-badge promo-badge--sm" data-promo-badge>' + promoBadge() + '</span></span></div>';
  }

  function renderCats() {
    cats.innerHTML = D.CATEGORIES.map(function (c) {
      return '<button class="filter-chip' + (state.cat === c ? ' active' : '') + '" data-cat="' + A.esc(c) + '" role="tab" aria-selected="' + (state.cat === c) + '">' + A.esc(c) + '</button>';
    }).join('');
  }

  function render() {
    var list = sortList(D.POOJAS.filter(function (p) { return catMatch(p) && textMatch(p); }));
    grid.innerHTML = list.map(card).join('');
    empty.classList.toggle('hide', list.length > 0);
    grid.classList.toggle('hide', list.length === 0);
    count.textContent = list.length + (list.length === 1 ? ' ritual' : ' rituals');
    $$('[data-detail]', grid).forEach(function (b) {
      b.addEventListener('click', function () { openDetail(b.getAttribute('data-detail')); });
    });
  }

  function openDetail(id) {
    var p = D.POOJAS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var q = quote(p.price);
    var html = '<div class="modal__head"><div><span class="kicker">' + A.esc(p.cat) + '</span><h2 class="fs-15">' + A.esc(p.name) + '</h2><div class="hi dev">' + A.esc(p.hi) + '</div></div>' +
      '<button class="close-x" data-modal-close aria-label="Close">' + A.icon('close') + '</button></div>' +
      '<div class="modal__body">' +
      '<div class="modal__art">' + p.icon + '</div>' +
      '<p class="small muted">' + A.esc(p.desc) + '</p>' +
      '<div class="pooja-chips">' +
      '<span class="chip">' + A.icon('clock') + A.esc(p.duration) + '</span>' +
      '<span class="chip">' + A.icon('shield') + 'Verified pandit</span>' +
      '<span class="chip chip--green">' + A.icon('box') + 'Samagri included</span>' +
      '<span class="chip chip--gold">' + A.icon('leaf') + 'Punya-Flow pickup</span></div>' +
      '<h3 class="pooja-h3">What’s included</h3>' +
      '<ul class="modal-list">' + p.includes.map(function (i) { return '<li>' + A.icon('check') + '<span>' + A.esc(i) + '</span></li>'; }).join('') + '</ul>' +
      '<h3 class="pooja-h3 pooja-h3--mt18">Samagri in the box</h3>' +
      '<div class="pooja-chiprow">' + p.samagri.map(function (s) { return '<span class="chip chip--sm">' + A.esc(s) + '</span>'; }).join('') + '</div>' +
      '<div class="note-strip note-strip--mt18">' + A.icon('pin') + '<span>Available across Gurugram, NCR and <span data-city-count>1,057</span> cities, districts and famous places. Society gate-pass and smokeless havan options at checkout.</span></div>' +
      (p.id === 'satyanarayan' ? '<div class="note-strip note-strip--gold">' + A.icon('spark') + '<span><b>Want to understand the vidhi first?</b><br>Open the <a href="puja-guide.html">free 8-step Satyanarayan puja guide</a> — mantras, samagri, katha, havan counter and a printable sankalp.</span></div>' : '') +
      '<div class="modal-price"><div><div class="price">' + A.INR(q.price) +
      '<small>all inclusive · GST extra' + (q.discount ? ' <s class="promo-strike">' + A.INR(q.list) + '</s>' : '') + '</small>' +
      (q.discount ? '<span class="price__promo"><span class="promo-badge promo-badge--sm" data-promo-badge>' + promoBadge() + '</span></span>' : '') +
      '</div><span class="tiny muted">Mrp ' + A.INR(p.mrp) + ' · you save ' + A.INR(p.mrp - q.price) + '</span></div>' +
      '<a class="btn btn--primary" href="booking.html?pooja=' + p.id + '">Book this pooja ' + A.icon('arrow') + '</a></div>' +
      '</div>';
    A.openModal(html, { width: '600px' });
  }

  if (search) {
    search.addEventListener('input', function () {
      state.q = search.value.trim();
      render();
    });
  }
  if (sortSel) {
    sortSel.addEventListener('change', function () {
      state.sort = sortSel.value;
      render();
    });
  }
  if (cats) {
    cats.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.getAttribute('data-cat');
      renderCats();
      render();
    });
  }
  var reset = $('#poojaReset');
  if (reset) reset.addEventListener('click', function () {
    state = { q: '', cat: 'All Rituals', sort: 'recommended' };
    if (search) search.value = '';
    if (sortSel) sortSel.value = 'recommended';
    renderCats(); render();
  });

  var si = $('[data-search-icon]'); if (si) si.innerHTML = A.icon('search');
  var ii = $('[data-info-icon]'); if (ii) ii.innerHTML = A.icon('info');
  $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });

  renderCats();
  render();
  // The live launch counter may change the displayed price after first paint.
  document.addEventListener('vp:promo', render);
})();
