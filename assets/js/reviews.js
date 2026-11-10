/* ==========================================================================
   Reviews page — published reviews, rating filters and the submit form.
   Data comes from GET /api/reviews (approved only); new reviews are queued
   for moderation and never appear immediately.
   ========================================================================== */
(function () {
  'use strict';

  var A = window.App, D = window.PanditData, API = window.PanditAPI;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;

  var PAGE = 9;
  var state = {
    rating: '',
    poojaId: '',
    offset: 0,
    limit: PAGE,
    total: 0,
    summary: null,
    loading: false
  };

  function ready() {
    return Boolean(API && API.enabled);
  }

  function apiMessage(res) {
    if (res && res.error) return res.error;
    if (res && res.offline) return 'The reviews service is not reachable right now. Please try again in a minute.';
    return 'Something went wrong. Please try again.';
  }

  function monthYear(value) {
    if (!value) return '';
    var d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }

  function iconize() {
    $$('[data-ico]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico')); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
    $$('[data-ico-chip]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-chip')) + el.textContent; });
  }

  /* ------------------------------------------------------------- summary */
  function renderSummary(summary) {
    var avg = $('#reviewAverage');
    var stars = $('#reviewAverageStars');
    var count = $('#reviewCount');
    var bars = $('#reviewBars');
    if (!avg) return;

    var total = Number(summary && summary.total) || 0;
    var average = Number(summary && summary.average) || 0;
    avg.textContent = total ? average.toFixed(1) : '—';
    stars.innerHTML = total ? A.stars(average) : '';
    count.textContent = total
      ? total.toLocaleString('en-IN') + ' published review' + (total === 1 ? '' : 's')
      : 'No reviews published yet';

    var counts = (summary && summary.counts) || {};
    bars.innerHTML = [5, 4, 3, 2, 1].map(function (star) {
      var n = Number(counts[star]) || 0;
      var pct = total ? Math.round((n / total) * 100) : 0;
      return '<button type="button" class="review-bar" data-bar-rating="' + star + '" aria-label="' +
        star + ' star reviews: ' + n + '">' +
        '<span>' + star + ' ★</span>' +
        '<i><b style="width:' + pct + '%"></b></i>' +
        '<em>' + n + '</em>' +
        '</button>';
    }).join('');
  }

  /* ---------------------------------------------------------------- cards */
  function reviewCard(review) {
    var bits = [];
    if (review.city) bits.push(review.city);
    if (review.poojaName) bits.push(review.poojaName);
    var when = monthYear(review.createdAt);
    if (when) bits.push(when);

    return '<article class="card review-card reveal">' +
      '<div class="review-card__top">' +
        A.stars(review.rating) +
        '<b>' + Number(review.rating).toFixed(1) + '</b>' +
        (review.panditName ? '<span class="review-card__pandit">' + A.icon('user') + A.esc(review.panditName) + '</span>' : '') +
      '</div>' +
      (review.title ? '<h3>' + A.esc(review.title) + '</h3>' : '') +
      '<p>' + A.esc(review.message) + '</p>' +
      '<div class="review-card__by">' +
        '<span class="avatar">' + A.esc(String(review.name || '?').charAt(0)) + '</span>' +
        '<span><b>' + A.esc(review.name) + '</b><small>' + A.esc(bits.join(' · ')) + '</small></span>' +
      '</div>' +
    '</article>';
  }

  function renderList(rows, append) {
    var list = $('#reviewList');
    if (!list) return;
    if (append) list.insertAdjacentHTML('beforeend', rows.map(reviewCard).join(''));
    else list.innerHTML = rows.map(reviewCard).join('');

    var empty = $('#reviewEmpty');
    var title = $('#reviewEmptyTitle');
    var text = $('#reviewEmptyText');
    var filtered = state.rating || state.poojaId;
    var showEmpty = state.total === 0;

    empty.hidden = !showEmpty;
    if (showEmpty) {
      if (filtered) {
        title.textContent = 'No reviews match this filter.';
        text.textContent = 'Try another rating or pooja — or share your own experience.';
      } else {
        title.textContent = 'No reviews yet.';
        text.textContent = 'Be the first family to share how your ritual went — it takes less than a minute.';
      }
    }

    var more = $('#reviewMore');
    var shown = state.offset + rows.length;
    more.hidden = shown >= state.total || state.total === 0;

    var status = $('#reviewListStatus');
    if (status) {
      status.hidden = true;
      status.textContent = '';
    }
  }

  function setListStatus(message) {
    var el = $('#reviewListStatus');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
  }

  /* ---------------------------------------------------------------- load */
  function load(append) {
    if (state.loading) return;
    state.loading = true;

    if (!append) {
      state.offset = 0;
      $('#reviewList').innerHTML = '';
      $('#reviewMore').hidden = true;
      setListStatus('Loading reviews…');
    }

    if (!ready()) {
      state.loading = false;
      state.total = 0;
      renderSummary(null);
      renderList([], false);
      setListStatus('Reviews are temporarily unavailable because the review service is not connected. You can still write a review below.');
      return;
    }

    API.reviews({
      limit: state.limit,
      offset: state.offset,
      rating: state.rating,
      poojaId: state.poojaId
    }).then(function (res) {
      if (!res.ok) {
        state.total = 0;
        renderSummary(null);
        renderList([], false);
        setListStatus(apiMessage(res));
        return;
      }

      var data = res.data || {};
      var rows = data.reviews || [];
      state.total = Number(data.total) || 0;
      state.summary = data.summary || null;
      renderSummary(state.summary);
      renderList(rows, append);
      if (append) state.offset += rows.length;
    }).catch(function () {
      setListStatus('Could not load reviews. Please refresh the page.');
    }).then(function () {
      state.loading = false;
    });
  }

  /* -------------------------------------------------------------- filters */
  function setFilter(rating) {
    state.rating = String(rating || '');
    $$('#reviewFilters .review-chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-rating') === state.rating);
    });
    load(false);
  }

  function initFilters() {
    var wrap = $('#reviewFilters');
    if (!wrap) return;

    wrap.addEventListener('click', function (event) {
      var chip = event.target.closest('.review-chip');
      if (chip) {
        setFilter(chip.getAttribute('data-rating'));
        return;
      }
      var bar = event.target.closest('[data-bar-rating]');
      if (bar) setFilter(bar.getAttribute('data-bar-rating'));
    });

    var pooja = $('#reviewPoojaFilter');
    if (pooja) {
      pooja.addEventListener('change', function () {
        state.poojaId = pooja.value;
        load(false);
      });
    }

    var more = $('#reviewMore');
    if (more) {
      more.addEventListener('click', function () {
        load(true);
      });
    }
  }

  /* ---------------------------------------------------------------- form */
  function fillPoojas() {
    var list = (D.POOJAS || []).slice().sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name));
    });
    var options = list.map(function (p) {
      return '<option value="' + A.esc(p.id) + '">' + A.esc(p.name) + '</option>';
    }).join('');

    var formSelect = $('#rvPooja');
    if (formSelect) formSelect.insertAdjacentHTML('beforeend', options);

    var filterSelect = $('#reviewPoojaFilter');
    if (filterSelect) filterSelect.insertAdjacentHTML('beforeend', options);
  }

  function prefill() {
    var params = new URLSearchParams(location.search);
    var pooja = params.get('pooja');
    var rating = params.get('rating');

    if (pooja) {
      var formSelect = $('#rvPooja');
      if (formSelect) formSelect.value = pooja;
      var filterSelect = $('#reviewPoojaFilter');
      if (filterSelect && filterSelect.querySelector('option[value="' + pooja.replace(/"/g, '') + '"]')) {
        filterSelect.value = pooja;
        state.poojaId = pooja;
      }
    }
    if (rating && /^[1-5]$/.test(rating)) {
      state.rating = rating;
      $$('#reviewFilters .review-chip').forEach(function (chip) {
        chip.classList.toggle('is-active', chip.getAttribute('data-rating') === rating);
      });
    }

    try {
      var raw = (window.localStorage && localStorage.getItem('vp_user'))
        || (window.sessionStorage && sessionStorage.getItem('vp_user'));
      var user = raw ? JSON.parse(raw) : null;
      if (user && user.name) $('#rvName').value = user.name;
      if (user && user.city) $('#rvCity').value = user.city;
    } catch (err) { /* private mode */ }
  }

  function ratingLabel() {
    var checked = document.querySelector('input[name="rating"]:checked');
    var value = checked ? Number(checked.value) : 5;
    var label = $('#rvRatingLabel');
    if (label) label.textContent = value + ' out of 5';
  }

  function setStatus(message, type) {
    var el = $('#rvStatus');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
    el.className = 'review-status' + (type ? ' review-status--' + type : '');
  }

  function initForm() {
    var form = $('#reviewForm');
    if (!form) return;

    var message = $('#rvMessage');
    var count = $('#rvCount');
    if (message && count) {
      message.addEventListener('input', function () {
        count.textContent = String(message.value.length);
      });
    }

    $$('input[name="rating"]').forEach(function (input) {
      input.addEventListener('change', ratingLabel);
    });
    ratingLabel();

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var payload = {
        name: $('#rvName').value.trim(),
        city: $('#rvCity').value.trim(),
        poojaId: $('#rvPooja').value,
        rating: Number((document.querySelector('input[name="rating"]:checked') || {}).value || 5),
        title: $('#rvTitle').value.trim(),
        message: message.value.trim(),
        website: $('#rvWebsite').value
      };

      if (payload.name.length < 2) return setStatus('Please share your name.', 'error');
      if (payload.message.length < 10) return setStatus('Please write at least 10 characters about your experience.', 'error');
      if (!ready()) return setStatus('The review service is not connected right now, so this cannot be sent. Please try again later.', 'error');

      var button = $('#rvSubmit');
      button.disabled = true;
      button.textContent = 'Sending…';
      setStatus('');

      API.createReview(payload).then(function (res) {
        if (res.ok) {
          form.reset();
          ratingLabel();
          if (count) count.textContent = '0';
          setStatus('Thank you! Your review is queued for moderation and will appear here once it is approved — usually within 24 hours.', 'ok');
          form.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } else if (res.status === 429) {
          setStatus('Too many reviews from this connection. Please try again in a few minutes.', 'error');
        } else {
          setStatus(apiMessage(res), 'error');
        }
      }).catch(function () {
        setStatus('Could not send the review. Please check your connection and try again.', 'error');
      }).then(function () {
        button.disabled = false;
        button.textContent = 'Submit for review';
      });
    });
  }

  function init() {
    iconize();
    fillPoojas();
    prefill();
    initFilters();
    initForm();
    load(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
