/* ==========================================================================
   PanditApp API client — optional bridge to the MySQL backend in /server.

   The site still works as a plain static PWA: if the API is unreachable every
   call resolves to { ok: false } and the existing localStorage flow continues.
   Configure the API with a meta tag or a global before this file loads:

     <meta name="pandit-api-base" content="https://api.example.com/api">
     window.PANDIT_API_BASE = 'https://api.example.com/api';

   Local development defaults to http://localhost:4000/api when the static
   site is opened from localhost on another port.
   ========================================================================== */
(function (root) {
  'use strict';

  var cache = {};
  var TIMEOUT = 8000;

  function trimBase(value) {
    return String(value || '').replace(/\/+$/, '');
  }

  function resolveBase() {
    if (root.PANDIT_API_ENABLED === false) return '';
    if (root.PANDIT_API_BASE) return trimBase(root.PANDIT_API_BASE);

    var meta = document.querySelector('meta[name="pandit-api-base"]');
    if (meta && meta.getAttribute('content')) return trimBase(meta.getAttribute('content'));

    if (!root.location || root.location.protocol === 'file:') return '';

    var host = root.location.hostname;
    var port = root.location.port;
    if (host === 'localhost' || host === '127.0.0.1') {
      if (port && port !== '4000') {
        return root.location.protocol + '//' + host + ':4000/api';
      }
    }
    return root.location.origin + '/api';
  }

  var BASE = resolveBase();

  function request(path, options) {
    options = options || {};
    if (!BASE) return Promise.resolve({ ok: false, disabled: true });

    var controller = null;
    var timer = null;
    var init = {
      method: options.method || 'GET',
      headers: { Accept: 'application/json' }
    };

    if (options.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }
    if (options.token) init.headers.Authorization = 'Bearer ' + options.token;

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      init.signal = controller.signal;
      timer = setTimeout(function () { controller.abort(); }, options.timeout || TIMEOUT);
    }

    return fetch(BASE + path, init)
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok) {
            return { ok: false, status: res.status, error: body.error || ('HTTP ' + res.status), body: body };
          }
          return { ok: true, status: res.status, data: body.data !== undefined ? body.data : body };
        });
      })
      .catch(function (err) {
        return { ok: false, offline: true, error: err && err.name === 'AbortError' ? 'Request timed out' : String(err && err.message || err) };
      })
      .then(function (result) {
        if (timer) clearTimeout(timer);
        return result;
      });
  }

  function cached(key, path) {
    if (cache[key]) return Promise.resolve({ ok: true, data: cache[key] });
    return request(path).then(function (res) {
      if (res.ok) cache[key] = res.data;
      return res;
    });
  }

  function bookingPayload(booking) {
    return {
      id: booking.id,
      type: booking.type || 'pooja',
      status: booking.status || 'Confirmed',
      poojaId: booking.poojaId,
      poojaName: booking.poojaName,
      date: booking.date,
      dateLabel: booking.dateLabel,
      time: booking.time,
      panditId: booking.panditId || (booking.pandit && booking.pandit.id) || null,
      panditName: booking.panditName,
      city: booking.city || (booking.customer && booking.customer.city) || null,
      place: booking.place,
      base: booking.base,
      extras: booking.extras,
      gst: booking.gst,
      total: booking.total,
      payment: booking.payment,
      payNow: booking.payNow,
      balance: booking.balance,
      upi: booking.upi,
      otp: booking.otp,
      createdAt: booking.createdAt,
      extrasIds: booking.extrasIds,
      extrasList: booking.extrasList,
      customer: booking.customer || {}
    };
  }

  /** Token of the signed-in customer, if any (admin uses its own key). */
  function userToken() {
    try {
      if (!root.localStorage) return '';
      return root.localStorage.getItem('vp_user_token')
        || (root.sessionStorage ? root.sessionStorage.getItem('vp_user_token') : '')
        || '';
    } catch (err) {
      return '';
    }
  }

  var API = {
    base: BASE,
    enabled: Boolean(BASE),
    request: request,
    health: function () { return request('/health'); },
    // Live launch offer. Never cached: the counter changes with every booking.
    offer: function () { return request('/offer'); },

    /* ------------------------------------------------------------ catalogue */
    poojas: function () { return cached('poojas', '/poojas'); },
    extras: function () { return cached('extras', '/extras'); },
    cities: function () { return cached('cities', '/cities'); },
    products: function () { return cached('products', '/products'); },
    pandits: function () { return cached('pandits', '/pandits'); },
    settings: function () { return cached('settings', '/settings'); },
    clearCache: function () { cache = {}; },

    /* ------------------------------------------------------------- bookings */
    createBooking: function (booking) {
      return request('/bookings', { method: 'POST', body: bookingPayload(booking), token: userToken() });
    },
    getBooking: function (id, otp) {
      return request('/bookings/' + encodeURIComponent(id) + '?otp=' + encodeURIComponent(otp));
    },
    claimPayment: function (id, details) {
      details = details || {};
      return request('/bookings/' + encodeURIComponent(id) + '/payment', {
        method: 'PATCH',
        body: {
          otp: details.otp,
          paymentRef: details.paymentRef,
          amountPaid: details.amountPaid
        }
      });
    },
    cancelBooking: function (id, otp) {
      return request('/bookings/' + encodeURIComponent(id) + '/cancel', {
        method: 'PATCH',
        body: { otp: otp }
      });
    },

    /* ---------------------------------------------------------------- forms */
    applyPandit: function (application) {
      return request('/applications', {
        method: 'POST',
        body: {
          id: application.id,
          name: application.name,
          phone: application.phone,
          city: application.city,
          experience: application.experience,
          tradition: application.tradition,
          note: application.note,
          date: application.date
        }
      });
    },
    createOrder: function (order) {
      return request('/orders', { method: 'POST', body: order, token: userToken() });
    },
    sendContact: function (message) {
      return request('/contact', { method: 'POST', body: message });
    },

    /* --------------------------------------------------------------- reviews */
    reviews: function (params) {
      params = params || {};
      var query = Object.keys(params).filter(function (key) {
        return params[key] !== '' && params[key] !== null && params[key] !== undefined;
      }).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
      return request('/reviews' + (query ? '?' + query : ''));
    },
    createReview: function (review) {
      return request('/reviews', { method: 'POST', body: review, token: userToken() });
    },

    /* -------------------------------------------------------- customer auth */
    registerUser: function (details) {
      return request('/auth/register', { method: 'POST', body: details });
    },
    loginUser: function (identifier, password) {
      return request('/auth/login', {
        method: 'POST',
        body: { identifier: identifier, password: password }
      });
    },
    authMe: function (token) {
      return request('/auth/me', { token: token });
    },
    updateUserProfile: function (token, details) {
      return request('/auth/profile', { method: 'PATCH', body: details, token: token });
    },
    changeUserPassword: function (token, details) {
      return request('/auth/change-password', { method: 'POST', body: details, token: token });
    },
    forgotPassword: function (identifier) {
      return request('/auth/forgot-password', { method: 'POST', body: { identifier: identifier } });
    },
    resetPassword: function (details) {
      return request('/auth/reset-password', { method: 'POST', body: details });
    },
    userBookings: function (token) {
      return request('/auth/bookings', { token: token });
    },
    userOrders: function (token) {
      return request('/auth/orders', { token: token });
    },

    /* ---------------------------------------------------------------- admin */
    login: function (email, password) {
      return request('/admin/login', { method: 'POST', body: { email: email, password: password } });
    }
  };

  root.PanditAPI = API;
})(typeof window !== 'undefined' ? window : globalThis);
