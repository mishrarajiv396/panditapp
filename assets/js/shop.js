/* Samagri shop — catalogue filters, product details and add-to-cart */
(function () {
  'use strict';
  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;

  var state = { q: '', cat: 'all', sort: 'recommended' };

  function init() {
    var initialQ = '';
    try {
      initialQ = (new URLSearchParams(location.search).get('q') || '').trim();
    } catch (e) { /* very old browser */ }
    if (initialQ) {
      state.q = initialQ.toLowerCase();
      var searchBox = $('#shopSearch');
      if (searchBox) searchBox.value = initialQ;
    }

    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-search-icon]').forEach(function (el) { el.innerHTML = A.icon('search'); });
    $$('[data-band]').forEach(function (el) { el.innerHTML = A.icon('spark') + '<span>' + el.textContent + '</span>'; });

    var cats = ['all'].concat(D.PRODUCTS.map(function (p) { return p.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    $('#shopCats').innerHTML = cats.map(function (c) {
      return '<button type="button" class="filter-chip' + (c === 'all' ? ' active' : '') + '" data-cat="' + A.esc(c) + '" role="tab">' +
        (c === 'all' ? 'All samagri' : A.esc(c)) + '</button>';
    }).join('');

    $('#shopCats').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.getAttribute('data-cat');
      $$('#shopCats .filter-chip').forEach(function (x) { x.classList.toggle('active', x === b); });
      render();
    });

    $('#shopSearch').addEventListener('input', function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
    $('#shopSort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $('#shopReset').addEventListener('click', reset);

    $('#shopGrid').addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) { e.stopPropagation(); addToBag(add.getAttribute('data-add')); return; }
      var view = e.target.closest('[data-view]');
      var card = e.target.closest('[data-product]');
      if (view || card) openProduct((view || card).getAttribute('data-view') || (view || card).getAttribute('data-product'));
    });

    $('#shopGrid').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('button')) return;
      var card = e.target.closest('[data-product]');
      if (!card) return;
      e.preventDefault();
      openProduct(card.getAttribute('data-product'));
    });

    render();
  }

  function reset() {
    state = { q: '', cat: 'all', sort: 'recommended' };
    $('#shopSearch').value = '';
    $('#shopSort').value = 'recommended';
    $$('#shopCats .filter-chip').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-cat') === 'all'); });
    render();
  }

  function byId(id) {
    return D.PRODUCTS.filter(function (p) { return p.id === id; })[0];
  }

  function list() {
    var out = D.PRODUCTS.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.q) {
        var hay = [p.name, p.cat, p.desc].join(' ').toLowerCase();
        if (hay.indexOf(state.q) < 0) return false;
      }
      return true;
    });
    if (state.sort === 'price-asc') out.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') out.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'name') out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  }

  function money(n) { return A.INR(n); }

  function discount(p) {
    return Math.round((1 - p.price / p.mrp) * 100);
  }

  function render() {
    var items = list();
    $('#shopCount').textContent = items.length + ' product' + (items.length === 1 ? '' : 's') +
      (state.cat !== 'all' ? ' · ' + state.cat : '');

    if (!items.length) {
      $('#shopGrid').innerHTML = '';
      $('#shopEmpty').classList.remove('hide');
      return;
    }
    $('#shopEmpty').classList.add('hide');

    $('#shopGrid').innerHTML = items.map(function (p) {
      return '<article class="card product card--hover" data-product="' + p.id + '" tabindex="0" role="button" aria-label="' + A.esc(p.name) + ' details">' +
        '<div class="product__art">' + p.icon +
          '<span class="chip">' + A.esc(p.cat) + '</span>' +
          '<span class="product__off">' + discount(p) + '% off</span>' +
        '</div>' +
        '<div class="product__body">' +
          '<h3>' + A.esc(p.name) + '</h3>' +
          '<p>' + A.esc(p.desc) + '</p>' +
          '<div class="price">' + money(p.price) + ' <span class="mrp">' + money(p.mrp) + '</span></div>' +
          '<div class="product__row">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-view="' + p.id + '">Details</button>' +
            '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Add ' + A.esc(p.name) + ' to bag">' + A.icon('plus') + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function addToBag(id) {
    var p = byId(id);
    if (!p) return;
    A.Cart.add({ id: p.id, name: p.name, price: p.price, icon: p.icon });
  }

  function boxItems(p) {
    if (p.cat === 'Samagri Kits') {
      return ['Every pouch numbered in ritual order', 'One-page Hindi + English vidhi card', 'Fresh flowers and havan samagri included', 'Packed the evening before, delivered before the muhurat'];
    }
    if (p.cat === 'Gemstones & Rudraksha') {
      return ['Lab certificate with the piece', 'Energised with the graha mantra before dispatch', 'Silver cap or ring setting where listed', 'Free 10-minute consultation before you wear it'];
    }
    if (p.cat === 'Flowers & Garlands') {
      return ['Picked at 5 AM from the Gurugram mandi', 'Delivered before 8 AM in Gurugram', 'Seasonal blooms, no synthetic colour', 'Flowers accepted back by Punya-Flow for composting'];
    }
    if (p.cat === 'Havan & Ghee') {
      return ['Pooja-grade, lab-tested and sealed', 'Low-smoke, society-safe formulation', 'Batch and purity details on the pack', 'Plastic-free outer packaging'];
    }
    if (p.cat === 'Brass & Pooja Ware') {
      return ['Pure brass, hand-finished in Moradabad', 'Food-safe and easy to clean', 'Arrives in a reusable cloth pouch', 'GST invoice for gifting and corporate orders'];
    }
    return ['Prepared in a clean satvik kitchen', 'Sealed the same morning', 'No preservatives or artificial colour', 'Delivered chilled where needed'];
  }

  function openProduct(id) {
    var p = byId(id);
    if (!p) return;
    A.openModal(
      '<div class="modal__head"><div>' +
        '<span class="chip">' + A.esc(p.cat) + '</span>' +
        '<h2 class="shop-h2">' + A.esc(p.name) + '</h2>' +
        '<p class="small muted">' + A.esc(p.desc) + '</p>' +
      '</div><button class="close-x" data-modal-close aria-label="Close">' + A.icon('close') + '</button></div>' +
      '<div class="modal__body">' +
        '<div class="pdp">' +
          '<div class="pdp__art">' + p.icon + '</div>' +
          '<div>' +
            '<div class="price">' + money(p.price) + ' <span class="mrp">' + money(p.mrp) + '</span>' +
              '<span class="pdp__save">Save ' + money(p.mrp - p.price) + '</span></div>' +
            '<p class="tiny muted mt-6">Inclusive of all taxes · GST invoice available</p>' +
            '<div class="pdp__facts">' +
              '<div class="pdp__fact">' + A.icon('truck') + '<div><b>Before 8 AM</b><span>Gurugram delivery · free over ₹999</span></div></div>' +
              '<div class="pdp__fact">' + A.icon('shield') + '<div><b>Quality checked</b><span>Sealed, pooja-ready, no substitutions</span></div></div>' +
              '<div class="pdp__fact">' + A.icon('leaf') + '<div><b>Plastic-free</b><span>Compostable pouches · Punya-Flow pickup</span></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<h3 class="shop-h3">What you get</h3>' +
        '<ul class="tick-list mt-1">' + boxItems(p).map(function (t) { return '<li data-tick>' + A.esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="modal-price">' +
          '<div><b class="pdp__price">' + money(p.price) + '</b>' +
            '<p class="tiny muted">Delivered before your muhurat. Need the ritual done too?</p></div>' +
          '<div class="modal-price__actions">' +
            '<a class="btn btn--ghost" href="booking.html">Book a pandit</a>' +
            '<button class="btn btn--primary" type="button" data-modal-add="' + p.id + '">' + A.icon('cart') + 'Add to bag</button>' +
          '</div>' +
        '</div>' +
      '</div>', { width: '620px' });

    $$('.modal [data-tick]').forEach(function (el) { el.innerHTML = A.icon('check') + '<span>' + el.textContent + '</span>'; });
    var ab = $('.modal [data-modal-add]');
    if (ab) ab.addEventListener('click', function () {
      A.closeModal();
      addToBag(ab.getAttribute('data-modal-add'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
