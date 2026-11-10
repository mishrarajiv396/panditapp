/* ==========================================================================
   Vedic Pooja — customer account experience.
   One small controller for login, register, forgot/reset password and the
   account dashboard. Talks to the API through assets/js/api.js.
   ========================================================================== */
(function (root) {
  'use strict';

  var API = root.PanditAPI || {};
  var TOKEN_KEY = 'vp_user_token';
  var USER_KEY = 'vp_user';
  var RESET_KEY = 'vp_reset_identifier';
  var DEV_KEY = 'vp_reset_dev_code';
  var RESET_EXPIRES_KEY = 'vp_reset_expires';
  var LOGIN_IDENTIFIER_KEY = 'vp_login_identifier';
  var NOTICE_KEY = 'vp_account_notice';

  var ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18"/><path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4"/><path d="M6.6 6.6A17.3 17.3 0 0 0 2 12s3.6 7 10 7a10.7 10.7 0 0 0 4.4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-3.5 8-9.5V5l-8-3-8 3v7.5C4 18.5 12 22 12 22Z"/><path d="m9 12 2 2 4-4"/></svg>'
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function storeGet(storage, key) {
    try { return root[storage].getItem(key); } catch (err) { return null; }
  }
  function storeSet(storage, key, value) {
    try { root[storage].setItem(key, value); } catch (err) { /* private mode */ }
  }
  function storeRemove(storage, key) {
    try { root[storage].removeItem(key); } catch (err) { /* private mode */ }
  }

  /* --------------------------------------------------------------- session */
  function token() {
    return storeGet('localStorage', TOKEN_KEY) || storeGet('sessionStorage', TOKEN_KEY) || '';
  }

  function user() {
    var raw = storeGet('localStorage', USER_KEY) || storeGet('sessionStorage', USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (err) { return null; }
  }

  function setSession(data, remember) {
    if (!data || !data.token) return;
    // "Keep me signed in" uses localStorage (30 days). Otherwise the session
    // lasts only until the browser tab is closed.
    var keep = remember !== false ? 'localStorage' : 'sessionStorage';
    var drop = keep === 'localStorage' ? 'sessionStorage' : 'localStorage';
    storeRemove(drop, TOKEN_KEY);
    storeRemove(drop, USER_KEY);
    storeSet(keep, TOKEN_KEY, data.token);
    if (data.user) storeSet(keep, USER_KEY, JSON.stringify(data.user));
  }

  function setUser(nextUser) {
    if (!nextUser) return;
    var storage = storeGet('localStorage', TOKEN_KEY) ? 'localStorage' : 'sessionStorage';
    storeSet(storage, USER_KEY, JSON.stringify(nextUser));
  }

  function clearSession() {
    storeRemove('localStorage', TOKEN_KEY);
    storeRemove('localStorage', USER_KEY);
    storeRemove('sessionStorage', TOKEN_KEY);
    storeRemove('sessionStorage', USER_KEY);
  }

  function isLoggedIn() { return Boolean(token()); }

  function safeNext(value, fallback) {
    var next = String(value || '').trim();
    if (!next || /^[a-z][a-z0-9+.-]*:/i.test(next) || next.indexOf('//') === 0 || next.indexOf('\\') >= 0) {
      return fallback || 'account.html';
    }
    return next;
  }

  function rememberNotice(message) {
    if (message) storeSet('sessionStorage', NOTICE_KEY, message);
  }

  function apiError(res, fallback) {
    if (res && res.offline) {
      return 'Cannot reach the server. Start the app with start.ps1, then try again.';
    }
    return (res && res.error) || fallback || 'Something went wrong. Please try again.';
  }

  /* ----------------------------------------------------------- form helpers */
  function fieldOf(input) { return input ? input.closest('.auth-field') : null; }

  function clearFieldError(input) {
    var field = fieldOf(input);
    if (!field) return;
    field.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    var error = field.querySelector('.auth-field__error');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }

  function fieldError(input, message) {
    var field = fieldOf(input);
    if (!field) return;
    field.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    var error = field.querySelector('.auth-field__error');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    input.focus();
  }

  function clearErrors(form) {
    if (!form) return;
    $$('.auth-field.is-invalid', form).forEach(function (field) {
      field.classList.remove('is-invalid');
      var input = field.querySelector('input, textarea');
      if (input) input.removeAttribute('aria-invalid');
      var error = field.querySelector('.auth-field__error');
      if (error) { error.textContent = ''; error.hidden = true; }
    });
  }

  function setAlert(el, message, type) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    var icon = type === 'ok' ? ICON.check : type === 'info' ? ICON.info : ICON.alert;
    el.className = 'auth-alert' + (type ? ' auth-alert--' + type : '');
    el.innerHTML = icon + '<span>' + esc(message) + '</span>';
    el.hidden = false;
  }

  function busy(button, on, label) {
    if (!button) return;
    if (on) {
      if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.classList.add('is-busy');
      if (label) button.textContent = label;
    } else {
      button.disabled = false;
      button.classList.remove('is-busy');
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
      }
    }
  }

  function passwordProblem(password) {
    if (!password) return 'Please choose a password';
    if (password.length < 8) return 'Use at least 8 characters';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Add at least one letter and one number';
    return '';
  }

  function passwordScore(value) {
    var score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
    if (value.length >= 12) score += 1;
    if (/[^A-Za-z0-9]/.test(value) || (/[a-z]/.test(value) && /[A-Z]/.test(value))) score += 1;
    return value ? score : 0;
  }

  function renderStrength(meter, value) {
    if (!meter) return;
    var score = passwordScore(value);
    meter.setAttribute('data-score', String(score));
    $$('i', meter).forEach(function (bar, index) {
      bar.classList.toggle('is-on', index < score);
    });
    var label = meter.querySelector('[data-strength-label]');
    if (label) {
      var labels = ['', 'Keep going…', 'Almost there — add a symbol or length', 'Good password', 'Strong password'];
      label.textContent = value ? labels[score] : 'Use 8+ characters with a letter and a number';
    }
  }

  function bindStrength(input, meter) {
    if (!input || !meter) return;
    input.addEventListener('input', function () { renderStrength(meter, input.value); });
    renderStrength(meter, input.value);
  }

  function requirementState(key, value) {
    if (key === 'length') return value.length >= 8;
    if (key === 'letter') return /[A-Za-z]/.test(value);
    if (key === 'number') return /\d/.test(value);
    if (key === 'symbol') return /[^A-Za-z0-9]/.test(value);
    return false;
  }

  function renderRequirements(list, value) {
    if (!list) return;
    $$('li[data-req]', list).forEach(function (item) {
      item.classList.toggle('is-met', requirementState(item.getAttribute('data-req'), value));
    });
  }

  function bindRequirements(input, list) {
    if (!input || !list) return;
    input.addEventListener('input', function () { renderRequirements(list, input.value); });
    renderRequirements(list, input.value);
  }

  function bindMatch(password, confirm, hint) {
    if (!password || !confirm || !hint) return;
    function update() {
      if (!confirm.value) {
        hint.hidden = true;
        hint.className = 'auth-match';
        return;
      }
      var same = confirm.value === password.value;
      hint.hidden = false;
      hint.className = 'auth-match ' + (same ? 'is-ok' : 'is-bad');
      hint.textContent = same ? 'Passwords match' : 'Passwords do not match yet';
    }
    password.addEventListener('input', update);
    confirm.addEventListener('input', update);
    update();
  }

  function initFieldStates() {
    $$('.auth-field__wrap input').forEach(function (input) {
      input.addEventListener('blur', function () {
        var field = fieldOf(input);
        if (!field) return;
        field.classList.toggle('is-valid', Boolean(input.value.trim()) && !field.classList.contains('is-invalid'));
      });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field) field.classList.remove('is-valid');
      });
    });
  }

  function initPasswordToggles() {
    $$('[data-pw-toggle]').forEach(function (button) {
      var input = button.getAttribute('data-target')
        ? document.getElementById(button.getAttribute('data-target'))
        : button.parentElement.querySelector('input');
      if (!input) return;
      button.innerHTML = ICON.eye;
      button.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.innerHTML = show ? ICON.eyeOff : ICON.eye;
        button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        button.setAttribute('aria-pressed', show ? 'true' : 'false');
        input.focus();
      });
    });
  }

  function initPhoneInputs() {
    $$('input[data-phone]').forEach(function (input) {
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('maxlength', '10');
      input.addEventListener('input', function () {
        var digits = input.value.replace(/\D/g, '').slice(0, 10);
        if (digits !== input.value) input.value = digits;
      });
    });
  }

  function initCapsHints() {
    $$('[data-caps]').forEach(function (hint) {
      var field = fieldOf(hint);
      var input = field ? field.querySelector('input') : null;
      if (!input) return;
      function update(event) {
        var on = false;
        try { on = Boolean(event.getModifierState && event.getModifierState('CapsLock')); } catch (err) { on = false; }
        hint.hidden = !on;
      }
      input.addEventListener('keydown', update);
      input.addEventListener('keyup', update);
      input.addEventListener('blur', function () { hint.hidden = true; });
    });
  }

  function initLiveClear() {
    $$('form').forEach(function (form) {
      $$('input', form).forEach(function (input) {
        input.addEventListener('input', function () {
          clearFieldError(input);
          var alertEl = form.querySelector('.auth-alert');
          if (alertEl && !alertEl.classList.contains('auth-alert--info')) setAlert(alertEl, '');
        });
      });
    });
  }

  function initOtpRow(row) {
    var boxes = $$('input', row);
    if (!boxes.length) return null;

    function refresh() {
      boxes.forEach(function (box) { box.classList.toggle('is-filled', Boolean(box.value)); });
    }

    boxes.forEach(function (box, index) {
      box.addEventListener('input', function () {
        box.value = box.value.replace(/\D/g, '').slice(-1);
        refresh();
        if (box.value && index < boxes.length - 1) boxes[index + 1].focus();
      });

      box.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace' && !box.value && index > 0) {
          boxes[index - 1].value = '';
          boxes[index - 1].classList.remove('is-filled');
          boxes[index - 1].focus();
          event.preventDefault();
        } else if (event.key === 'ArrowLeft' && index > 0) {
          boxes[index - 1].focus();
          event.preventDefault();
        } else if (event.key === 'ArrowRight' && index < boxes.length - 1) {
          boxes[index + 1].focus();
          event.preventDefault();
        }
      });

      box.addEventListener('paste', function (event) {
        event.preventDefault();
        var clip = (event.clipboardData || root.clipboardData);
        var text = clip ? String(clip.getData('text') || '').replace(/\D/g, '').slice(0, 6) : '';
        if (!text) return;
        text.split('').forEach(function (char, offset) {
          if (boxes[offset]) boxes[offset].value = char;
        });
        refresh();
        boxes[Math.min(text.length, boxes.length - 1)].focus();
      });
    });

    return {
      value: function () {
        return boxes.map(function (box) { return box.value; }).join('');
      },
      fill: function (code) {
        String(code || '').replace(/\D/g, '').slice(0, 6).split('').forEach(function (char, index) {
          if (boxes[index]) boxes[index].value = char;
        });
        refresh();
        if (boxes[0]) boxes[0].focus();
      },
      clear: function () {
        boxes.forEach(function (box) { box.value = ''; });
        refresh();
      },
      markInvalid: function (invalid) {
        boxes.forEach(function (box) { box.classList.toggle('is-invalid', Boolean(invalid)); });
      }
    };
  }

  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
      return root.navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    try {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      return Promise.resolve(true);
    } catch (err) {
      return Promise.resolve(false);
    }
  }

  function toast(message, type) {
    var el = document.getElementById('acctToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'acctToast';
      el.className = 'acct-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = 'acct-toast is-on' + (type === 'error' ? ' is-error' : '');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.className = 'acct-toast'; }, 3400);
  }

  function initials(name) {
    var parts = String(name || 'Bhakt').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'B';
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
  }

  function money(value) {
    return '₹' + Math.round(Number(value) || 0).toLocaleString('en-IN');
  }

  function dateParts(value) {
    if (!value) return { day: '—', month: '—' };
    var date = new Date(String(value).replace(' ', 'T'));
    if (isNaN(date.getTime())) return { day: '—', month: '—' };
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: date.toLocaleString('en-IN', { month: 'short' })
    };
  }

  function dateTime(value) {
    if (!value) return '—';
    var date = new Date(String(value).replace(' ', 'T'));
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function statusClass(status) {
    var key = String(status || '').toLowerCase();
    if (key === 'cancelled' || key === 'cancelled ') return 'bad';
    if (key === 'completed' || key === 'delivered') return 'muted';
    return 'ok';
  }

  function paymentClass(status) {
    var key = String(status || '').toLowerCase();
    if (key.indexOf('verified') >= 0 || key === 'paid') return 'ok';
    if (key.indexOf('await') >= 0) return 'wait';
    if (key.indexOf('cancel') >= 0) return 'bad';
    return 'muted';
  }

  /* ====================================================================== */
  /* Login                                                                  */
  /* ====================================================================== */
  function initLogin() {
    var form = $('#loginForm');
    if (!form) return;

    var identifier = $('#loginIdentifier');
    var label = $('#loginLabel');
    var password = $('#loginPassword');
    var remember = $('#loginRemember');
    var forgotLink = $('#loginForgot');
    var alertEl = $('#loginAlert');
    var button = $('#loginBtn');
    var tabs = $$('#loginTabs .auth-tab');
    var channel = 'email';
    var params = new URLSearchParams(root.location.search);
    var next = safeNext(params.get('next'), 'account.html');

    if (params.get('expired')) {
      setAlert(alertEl, 'Your session expired. Sign in again to continue.', 'info');
    }
    if (params.get('registered')) {
      setAlert(alertEl, 'Account created. Sign in to see your bookings.', 'ok');
    }

    function applyChannel(nextChannel, options) {
      options = options || {};
      channel = nextChannel;
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-login-channel') === channel;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (!options.keepValue) identifier.value = '';
      clearFieldError(identifier);
      if (!options.keepAlert) setAlert(alertEl, '');

      if (channel === 'email') {
        label.textContent = 'Email address';
        identifier.type = 'email';
        identifier.inputMode = 'email';
        identifier.placeholder = 'you@example.com';
        identifier.autocomplete = 'username';
        identifier.setAttribute('maxlength', '190');
      } else {
        label.textContent = 'Mobile number';
        identifier.type = 'tel';
        identifier.inputMode = 'numeric';
        identifier.placeholder = '98765 43210';
        identifier.autocomplete = 'tel';
        identifier.setAttribute('maxlength', '10');
      }
      if (options.focus !== false) identifier.focus();
      syncForgotLink();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        applyChannel(tab.getAttribute('data-login-channel'), { keepValue: false });
      });
    });

    identifier.addEventListener('input', function () {
      if (channel !== 'phone') return;
      var digits = identifier.value.replace(/\D/g, '').slice(0, 10);
      if (digits !== identifier.value) identifier.value = digits;
    });

    function syncForgotLink() {
      if (!forgotLink) return;
      var value = identifier.value.trim();
      forgotLink.href = 'forgot-password.html' + (value ? '?identifier=' + encodeURIComponent(value) : '');
    }

    identifier.addEventListener('input', syncForgotLink);

    var saved = storeGet('localStorage', LOGIN_IDENTIFIER_KEY) || '';
    if (saved) identifier.value = saved;
    applyChannel(saved && saved.indexOf('@') < 0 ? 'phone' : 'email', { keepValue: true, focus: false, keepAlert: true });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors(form);
      setAlert(alertEl, '');

      var value = identifier.value.trim();
      var pass = password.value;
      if (channel === 'email') {
        if (!value) return fieldError(identifier, 'Enter your email address');
        if (!EMAIL_RE.test(value)) return fieldError(identifier, 'Enter a valid email address');
      } else {
        var digits = value.replace(/\D/g, '');
        if (!digits) return fieldError(identifier, 'Enter your mobile number');
        if (!/^[6-9]\d{9}$/.test(digits)) return fieldError(identifier, 'Enter a valid 10-digit mobile number');
        value = digits;
      }
      if (!pass) return fieldError(password, 'Enter your password');

      var keep = remember ? remember.checked : true;
      busy(button, true, 'Signing you in…');
      API.loginUser(value, pass).then(function (res) {
        if (!res.ok) {
          var field = res.body && res.body.field;
          if (field === 'email' || field === 'phone' || field === 'identifier') {
            fieldError(identifier, apiError(res));
          } else if (field === 'password') {
            fieldError(password, apiError(res));
          }
          setAlert(alertEl, apiError(res, 'Those details do not match an account'));
          return;
        }
        setSession(res.data, keep);
        if (keep) storeSet('localStorage', LOGIN_IDENTIFIER_KEY, value);
        else storeRemove('localStorage', LOGIN_IDENTIFIER_KEY);
        var linked = res.data.linked || {};
        if (linked.bookings) {
          rememberNotice('Welcome back — ' + linked.bookings + ' past booking' + (linked.bookings === 1 ? '' : 's') + ' linked to your account.');
        }
        root.location.href = next;
      }).catch(function () {
        setAlert(alertEl, 'Something went wrong. Please try again.');
      }).finally(function () {
        busy(button, false);
      });
    });
  }

  /* ====================================================================== */
  /* Register                                                               */
  /* ====================================================================== */
  function initRegister() {
    var form = $('#registerForm');
    if (!form) return;

    var name = $('#registerName');
    var email = $('#registerEmail');
    var phone = $('#registerPhone');
    var password = $('#registerPassword');
    var confirm = $('#registerConfirm');
    var terms = $('#registerTerms');
    var alertEl = $('#registerAlert');
    var button = $('#registerBtn');

    bindStrength(password, $('#registerStrength'));
    bindRequirements(password, $('#registerReqs'));
    bindMatch(password, confirm, $('#registerMatch'));

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors(form);
      setAlert(alertEl, '');

      var nameValue = name.value.trim();
      var emailValue = email.value.trim();
      var phoneValue = phone.value.replace(/\D/g, '');
      var passValue = password.value;

      if (nameValue.length < 2) return fieldError(name, 'Please enter your full name');
      if (!EMAIL_RE.test(emailValue)) return fieldError(email, 'Enter a valid email address');
      if (!/^[6-9]\d{9}$/.test(phoneValue)) return fieldError(phone, 'Enter a valid 10-digit mobile number');
      var problem = passwordProblem(passValue);
      if (problem) return fieldError(password, problem);
      if (confirm.value !== passValue) return fieldError(confirm, 'The two passwords do not match');
      if (!terms.checked) {
        setAlert(alertEl, 'Please accept the booking terms and privacy policy to continue.');
        terms.focus();
        return;
      }

      busy(button, true, 'Creating your account…');
      API.registerUser({
        name: nameValue,
        email: emailValue,
        phone: phoneValue,
        password: passValue
      }).then(function (res) {
        if (!res.ok) {
          var field = res.body && res.body.field;
          if (field === 'name' && name) fieldError(name, apiError(res));
          else if (field === 'email') fieldError(email, apiError(res));
          else if (field === 'phone') fieldError(phone, apiError(res));
          else if (field === 'password') fieldError(password, apiError(res));
          setAlert(alertEl, apiError(res, 'Could not create your account'));
          return;
        }
        setSession(res.data);
        var linked = res.data.linked || {};
        var message = 'Welcome to Vedic Pooja, ' + (res.data.user.name || '').split(' ')[0] + '!';
        if (linked.bookings) {
          message += ' We linked ' + linked.bookings + ' previous booking' + (linked.bookings === 1 ? '' : 's') + ' to your account.';
        }
        rememberNotice(message);
        root.location.href = 'account.html?welcome=1';
      }).catch(function () {
        setAlert(alertEl, 'Something went wrong. Please try again.');
      }).finally(function () {
        busy(button, false);
      });
    });
  }

  /* ====================================================================== */
  /* Forgot password                                                        */
  /* ====================================================================== */
  function initForgot() {
    var form = $('#forgotForm');
    if (!form) return;

    var channel = 'email';
    var values = { email: '', phone: '' };
    var input = $('#forgotIdentifier');
    var label = $('#forgotLabel');
    var hint = $('#forgotChannelHint');
    var alertEl = $('#forgotAlert');
    var button = $('#forgotBtn');
    var success = $('#forgotSuccess');
    var masked = $('#forgotMasked');
    var devPanel = $('#forgotDev');
    var devCode = $('#forgotDevCode');
    var continueLink = $('#forgotContinue');
    var resend = $('#forgotResend');
    var restart = $('#forgotRestart');
    var tabs = $$('#forgotTabs .auth-tab');
    var resendTimer = null;
    var params = new URLSearchParams(root.location.search);
    var prefill = params.get('identifier') || storeGet('sessionStorage', RESET_KEY) || '';
    if (prefill && prefill.indexOf('@') < 0) prefill = prefill.replace(/\D/g, '').slice(-10);

    function applyChannel(next, options) {
      options = options || {};
      if (channel !== next) values[channel] = input.value;
      channel = next;
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-channel') === channel;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (!options.keepValue) input.value = values[channel] || '';
      clearFieldError(input);
      setAlert(alertEl, '');
      if (channel === 'email') {
        label.textContent = 'Email address';
        input.type = 'email';
        input.inputMode = 'email';
        input.placeholder = 'you@example.com';
        input.autocomplete = 'email';
        input.setAttribute('maxlength', '190');
        if (hint) hint.textContent = 'We’ll email you a single-use 6-digit code.';
      } else {
        label.textContent = 'Mobile number';
        input.type = 'tel';
        input.inputMode = 'numeric';
        input.placeholder = '98765 43210';
        input.autocomplete = 'tel';
        input.setAttribute('maxlength', '10');
        if (hint) hint.textContent = 'We’ll text you a single-use 6-digit code.';
      }
      if (options.focus !== false) input.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        applyChannel(tab.getAttribute('data-channel'));
      });
    });

    input.addEventListener('input', function () {
      if (channel !== 'phone') return;
      var digits = input.value.replace(/\D/g, '').slice(0, 10);
      if (digits !== input.value) input.value = digits;
    });

    function startResendCooldown(seconds) {
      if (!resend) return;
      var left = seconds;
      clearInterval(resendTimer);
      resend.disabled = true;
      resend.textContent = 'Send again in ' + left + 's';
      resendTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) {
          clearInterval(resendTimer);
          resend.disabled = false;
          resend.textContent = 'Send another code';
        } else {
          resend.textContent = 'Send again in ' + left + 's';
        }
      }, 1000);
    }

    function showSuccess(data, identifierValue) {
      form.hidden = true;
      success.hidden = false;
      if (masked) {
        masked.textContent = data.masked
          ? 'Code sent to ' + data.masked
          : 'If an account matches, a code has been sent.';
      }
      if (data.devCode) {
        if (devPanel) devPanel.hidden = false;
        if (devCode) devCode.textContent = data.devCode;
        storeSet('sessionStorage', DEV_KEY, data.devCode);
      } else if (devPanel) {
        devPanel.hidden = true;
      }
      storeSet('sessionStorage', RESET_KEY, identifierValue);
      storeSet('sessionStorage', RESET_EXPIRES_KEY, String(Date.now() + 15 * 60 * 1000));
      if (continueLink) {
        continueLink.href = 'reset-password.html?identifier=' + encodeURIComponent(identifierValue);
      }
      startResendCooldown(60);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors(form);
      setAlert(alertEl, '');

      var value = input.value.trim();
      if (channel === 'email') {
        if (!EMAIL_RE.test(value)) return fieldError(input, 'Enter a valid email address');
      } else {
        var digits = value.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(digits)) return fieldError(input, 'Enter a valid 10-digit mobile number');
        value = digits;
      }

      busy(button, true, 'Sending your code…');
      API.forgotPassword(value).then(function (res) {
        if (!res.ok) {
          setAlert(alertEl, apiError(res, 'Could not send a code right now'));
          return;
        }
        showSuccess(res.data || {}, value);
      }).catch(function () {
        setAlert(alertEl, 'Something went wrong. Please try again.');
      }).finally(function () {
        busy(button, false);
      });
    });

    if (resend) {
      resend.addEventListener('click', function () {
        var value = storeGet('sessionStorage', RESET_KEY);
        if (!value) return;
        resend.disabled = true;
        resend.textContent = 'Sending…';
        API.forgotPassword(value).then(function (res) {
          if (!res.ok) {
            toast(apiError(res, 'Could not resend the code'), 'error');
            resend.disabled = false;
            resend.textContent = 'Send another code';
            return;
          }
          var data = res.data || {};
          if (data.devCode) {
            if (devPanel) devPanel.hidden = false;
            if (devCode) devCode.textContent = data.devCode;
            storeSet('sessionStorage', DEV_KEY, data.devCode);
          }
          storeSet('sessionStorage', RESET_EXPIRES_KEY, String(Date.now() + 15 * 60 * 1000));
          toast('A fresh code is on its way.');
          startResendCooldown(60);
        }).catch(function () {
          resend.disabled = false;
          resend.textContent = 'Send another code';
          toast('Could not resend the code', 'error');
        });
      });
    }

    var copy = $('#forgotCopy');
    if (copy) {
      copy.addEventListener('click', function () {
        var code = devCode ? devCode.textContent : '';
        copyText(code).then(function (ok) {
          copy.textContent = ok ? 'Copied' : 'Copy failed';
          setTimeout(function () { copy.textContent = 'Copy'; }, 1800);
        });
      });
    }

    if (restart) {
      restart.addEventListener('click', function () {
        success.hidden = true;
        form.hidden = false;
        applyChannel(channel, { keepValue: true });
      });
    }

    var initialChannel = prefill && prefill.indexOf('@') < 0 ? 'phone' : 'email';
    values[initialChannel] = prefill;
    input.value = prefill;
    applyChannel(initialChannel, { keepValue: true, focus: false });
  }

  /* ====================================================================== */
  /* Reset password                                                         */
  /* ====================================================================== */
  function initReset() {
    var form = $('#resetForm');
    if (!form) return;

    var params = new URLSearchParams(root.location.search);
    var identifier = params.get('identifier') || storeGet('sessionStorage', RESET_KEY) || '';
    var chip = $('#resetIdentifier');
    var changeLink = $('#resetChange');
    var alertEl = $('#resetAlert');
    var button = $('#resetBtn');
    var password = $('#resetPassword');
    var confirm = $('#resetConfirm');
    var resend = $('#resetResend');
    var devPanel = $('#resetDev');
    var devCodeEl = $('#resetDevCode');
    var otp = initOtpRow($('#otpRow'));
    var expiryEl = $('#resetExpiry');
    var resendTimer = null;
    var expiryTimer = null;
    var expiresAt = Number(storeGet('sessionStorage', RESET_EXPIRES_KEY) || 0);

    bindStrength(password, $('#resetStrength'));
    bindRequirements(password, $('#resetReqs'));
    bindMatch(password, confirm, $('#resetMatch'));

    if (!identifier) {
      setAlert(alertEl, 'Open the link from your reset request, or start again with your email or mobile number.', 'info');
      if (button) button.disabled = true;
      if (resend) resend.hidden = true;
      if (chip) chip.textContent = 'No reset request found';
      if (changeLink) changeLink.href = 'forgot-password.html';
      return;
    }

    if (chip) chip.textContent = identifier;
    if (changeLink) changeLink.href = 'forgot-password.html';

    var savedCode = storeGet('sessionStorage', DEV_KEY);
    if (savedCode && devPanel) {
      devPanel.hidden = false;
      if (devCodeEl) devCodeEl.textContent = savedCode;
    }

    var fill = $('#resetFill');
    if (fill) {
      fill.addEventListener('click', function () {
        if (savedCode && otp) otp.fill(savedCode);
      });
    }

    function startCooldown(seconds) {
      if (!resend) return;
      var left = seconds;
      clearInterval(resendTimer);
      resend.disabled = true;
      resend.textContent = 'Send again in ' + left + 's';
      resendTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) {
          clearInterval(resendTimer);
          resend.disabled = false;
          resend.textContent = 'Send a new code';
        } else {
          resend.textContent = 'Send again in ' + left + 's';
        }
      }, 1000);
    }

    function renderExpiry() {
      if (!expiryEl) return;
      if (!expiresAt) {
        expiryEl.hidden = true;
        return;
      }
      var left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      expiryEl.hidden = false;
      if (left <= 0) {
        expiryEl.textContent = 'Code expired — send a new one';
        expiryEl.classList.add('is-low');
        clearInterval(expiryTimer);
        return;
      }
      var minutes = Math.floor(left / 60);
      var seconds = left % 60;
      expiryEl.textContent = 'Code expires in ' + minutes + ':' + String(seconds).padStart(2, '0');
      expiryEl.classList.toggle('is-low', left <= 120);
    }

    function restartExpiry() {
      expiresAt = Date.now() + 15 * 60 * 1000;
      storeSet('sessionStorage', RESET_EXPIRES_KEY, String(expiresAt));
      clearInterval(expiryTimer);
      expiryTimer = setInterval(renderExpiry, 1000);
      renderExpiry();
    }

    if (expiresAt) {
      expiryTimer = setInterval(renderExpiry, 1000);
      renderExpiry();
    } else if (expiryEl) {
      expiryEl.hidden = true;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors(form);
      setAlert(alertEl, '');
      if (otp) otp.markInvalid(false);

      var code = otp ? otp.value() : '';
      var passValue = password.value;

      if (!/^\d{6}$/.test(code)) {
        if (otp) otp.markInvalid(true);
        setAlert(alertEl, 'Enter all 6 digits of your reset code.');
        return;
      }
      var problem = passwordProblem(passValue);
      if (problem) return fieldError(password, problem);
      if (confirm.value !== passValue) return fieldError(confirm, 'The two passwords do not match');

      busy(button, true, 'Updating your password…');
      API.resetPassword({ identifier: identifier, code: code, newPassword: passValue }).then(function (res) {
        if (!res.ok) {
          if (otp) otp.markInvalid(true);
          setAlert(alertEl, apiError(res, 'Could not reset your password'));
          return;
        }
        setSession(res.data);
        storeRemove('sessionStorage', RESET_KEY);
        storeRemove('sessionStorage', DEV_KEY);
        storeRemove('sessionStorage', RESET_EXPIRES_KEY);
        clearInterval(expiryTimer);
        rememberNotice('Password updated. You are signed in — welcome back!');
        root.location.href = 'account.html?reset=1';
      }).catch(function () {
        setAlert(alertEl, 'Something went wrong. Please try again.');
      }).finally(function () {
        busy(button, false);
      });
    });

    if (resend) {
      resend.addEventListener('click', function () {
        resend.disabled = true;
        resend.textContent = 'Sending…';
        API.forgotPassword(identifier).then(function (res) {
          if (!res.ok) {
            toast(apiError(res, 'Could not send a new code'), 'error');
            resend.disabled = false;
            resend.textContent = 'Send a new code';
            return;
          }
          var data = res.data || {};
          if (data.devCode) {
            savedCode = data.devCode;
            storeSet('sessionStorage', DEV_KEY, data.devCode);
            if (devPanel) devPanel.hidden = false;
            if (devCodeEl) devCodeEl.textContent = data.devCode;
          }
          if (otp) otp.clear();
          restartExpiry();
          toast('A fresh code is on its way.');
          startCooldown(60);
        }).catch(function () {
          resend.disabled = false;
          resend.textContent = 'Send a new code';
          toast('Could not send a new code', 'error');
        });
      });
    }

    startCooldown(45);
  }

  /* ====================================================================== */
  /* Account dashboard                                                      */
  /* ====================================================================== */
  function initAccount() {
    if (!token()) {
      root.location.replace('login.html?next=' + encodeURIComponent('account.html'));
      return;
    }

    var state = { user: null, stats: {}, bookings: [], orders: [], tab: 'overview' };
    var loading = $('#accountLoading');
    var content = $('#accountContent');
    var errorPanel = $('#accountError');
    var errorText = $('#accountErrorText');
    var retry = $('#accountRetry');

    function signOut(message) {
      clearSession();
      if (message) storeSet('sessionStorage', NOTICE_KEY, message);
      root.location.href = 'index.html';
    }

    function handleAuthFailure(res) {
      if (res && (res.status === 401 || res.status === 403)) {
        clearSession();
        root.location.replace('login.html?next=' + encodeURIComponent('account.html') + '&expired=1');
        return true;
      }
      return false;
    }

    function showError(message) {
      if (loading) loading.hidden = true;
      if (content) content.hidden = true;
      if (errorPanel) errorPanel.hidden = false;
      if (errorText) errorText.textContent = message;
    }

    function renderHero() {
      var u = state.user || {};
      var hero = $('#accountHero');
      if (hero) hero.hidden = false;
      var avatar = $('#accountAvatar');
      if (avatar) avatar.textContent = initials(u.name);
      var name = $('#accountName');
      if (name) name.textContent = u.name || 'Bhakt';
      var meta = $('#accountMeta');
      if (meta) {
        var bits = [];
        if (u.email) bits.push(u.email);
        if (u.phone) bits.push('+91 ' + u.phone);
        meta.textContent = bits.join(' · ');
      }
      var since = $('#accountSince');
      if (since && u.createdAt) {
        var date = new Date(String(u.createdAt).replace(' ', 'T'));
        if (!isNaN(date.getTime())) {
          since.textContent = 'Member since ' + date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        }
      }

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var upcoming = state.bookings.filter(function (b) {
        if (String(b.status || '').toLowerCase() === 'cancelled') return false;
        var d = new Date(String(b.date || '').replace(' ', 'T'));
        return !isNaN(d.getTime()) && d >= today;
      }).length;

      var statBookings = $('#statBookings');
      if (statBookings) statBookings.textContent = state.stats.bookings != null ? state.stats.bookings : state.bookings.length;
      var statUpcoming = $('#statUpcoming');
      if (statUpcoming) statUpcoming.textContent = upcoming;
      var statSpent = $('#statSpent');
      if (statSpent) statSpent.textContent = money(state.stats.spent || 0);

      var tabCount = $('#tabBookingCount');
      if (tabCount) tabCount.textContent = state.bookings.length;
      var orderCount = $('#tabOrderCount');
      if (orderCount) orderCount.textContent = state.orders.length;

      fillProfile();
    }

    function bookingDetails(b) {
      var rows = [
        ['Booking ID', b.id],
        ['Booked on', dateTime(b.createdAt)],
        ['Pandit', b.panditName || 'Assignment in progress'],
        ['City', b.city || '—'],
        ['Address', b.customer && b.customer.address ? b.customer.address : '—'],
        ['Gotra', b.customer && b.customer.gotra ? b.customer.gotra : '—'],
        ['Payment', b.payment || '—'],
        ['UPI reference', b.paymentRef || '—'],
        ['Gate OTP', b.otp || '—'],
        ['Amount paid', money(b.amountPaid || 0)]
      ];
      return rows.map(function (row) {
        return '<div><span>' + esc(row[0]) + '</span><b>' + esc(row[1]) + '</b></div>';
      }).join('');
    }

    function renderBookings() {
      var list = $('#bookingList');
      if (!list) return;

      if (!state.bookings.length) {
        list.innerHTML =
          '<div class="acct-empty">' +
            '<div class="acct-empty__ico">🪔</div>' +
            '<b>No poojas booked yet</b>' +
            '<p>Your muhurats, pandit details and gate codes will appear here the moment you book.</p>' +
            '<a class="btn btn--primary btn--sm" href="poojas.html">Book your first pooja</a>' +
          '</div>';
        return;
      }

      list.innerHTML = state.bookings.map(function (b) {
        var parts = dateParts(b.date || b.createdAt);
        var title = b.poojaName || b.type || 'Pooja';
        var when = b.dateLabel || b.date || 'Date to be confirmed';
        var time = b.time || 'Muhurat to be confirmed';
        var meta = '<span>' + ICON.clock + esc(when) + '</span>' +
          '<span>' + ICON.clock + esc(time) + '</span>';
        if (b.city) meta += '<span>' + ICON.pin + esc(b.city) + '</span>';
        if (b.panditName) meta += '<span>' + ICON.user + esc(b.panditName) + '</span>';

        return '<article class="acct-booking">' +
          '<div class="acct-date"><b>' + esc(parts.day) + '</b><span>' + esc(parts.month) + '</span></div>' +
          '<div class="acct-booking__body">' +
            '<h3>' + esc(title) + '</h3>' +
            '<div class="acct-booking__meta">' + meta + '</div>' +
            '<details class="acct-booking__more">' +
              '<summary>Booking details</summary>' +
              '<div class="acct-booking__grid">' + bookingDetails(b) + '</div>' +
            '</details>' +
          '</div>' +
          '<div class="acct-booking__side">' +
            '<b>' + money(b.total) + '</b>' +
            '<span class="acct-pill acct-pill--' + statusClass(b.status) + '">' + esc(b.status || 'Confirmed') + '</span>' +
            '<span class="acct-pill acct-pill--' + paymentClass(b.paymentStatus) + '">' + esc(b.paymentStatus || 'Pending') + '</span>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    function renderOrders() {
      var list = $('#orderList');
      if (!list) return;

      if (!state.orders.length) {
        list.innerHTML =
          '<div class="acct-empty">' +
            '<div class="acct-empty__ico">📦</div>' +
            '<b>No samagri orders yet</b>' +
            '<p>Pooja-in-a-box kits and ritual essentials you order will be listed here.</p>' +
            '<a class="btn btn--ghost btn--sm" href="shop.html">Browse samagri</a>' +
          '</div>';
        return;
      }

      list.innerHTML = state.orders.map(function (order) {
        var items = (order.items || []).map(function (item) {
          return (item.name || item.id) + ' × ' + (item.qty || 1);
        }).join(', ');
        return '<div class="acct-order">' +
          '<div><b>' + esc(order.id) + '</b><p>' + esc(items || 'Samagri order') + '</p>' +
            '<small>' + dateTime(order.createdAt) + ' · ' + esc(order.status || 'new') + '</small></div>' +
          '<b>' + money(order.total) + '</b>' +
        '</div>';
      }).join('');
    }

    function fillProfile() {
      var u = state.user || {};
      var name = $('#profileName');
      var email = $('#profileEmail');
      var phone = $('#profilePhone');
      if (name) name.value = u.name || '';
      if (email) email.value = u.email || '';
      if (phone) phone.value = u.phone || '';
      var sessionEmail = $('#sessionEmail');
      if (sessionEmail) sessionEmail.textContent = u.email || (u.phone ? '+91 ' + u.phone : '—');
    }

    function setTab(tab) {
      state.tab = tab;
      $$('[data-acct-tab]').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-acct-tab') === tab);
      });
      $$('[data-acct-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-acct-panel') !== tab;
      });
      if (root.history && root.history.replaceState) {
        var base = root.location.pathname || 'account.html';
        root.history.replaceState(null, '', tab === 'overview' ? base : base + '#' + tab);
      }
    }

    function bindTabs() {
      $$('[data-acct-tab]').forEach(function (button) {
        if (button.dataset.bound) return;
        button.dataset.bound = '1';
        button.addEventListener('click', function () { setTab(button.getAttribute('data-acct-tab')); });
      });
      var hash = String(root.location.hash || '').replace('#', '');
      if (hash === 'profile' || hash === 'security') setTab(hash);
    }

    function load() {
      if (loading) loading.hidden = false;
      if (content) content.hidden = true;
      if (errorPanel) errorPanel.hidden = true;

      return Promise.all([
        API.authMe(token()),
        API.userBookings(token()),
        API.userOrders(token())
      ]).then(function (results) {
        var me = results[0];
        var bookings = results[1];
        var orders = results[2];

        if (handleAuthFailure(me) || handleAuthFailure(bookings) || handleAuthFailure(orders)) return;

        if (!me.ok) {
          showError(apiError(me, 'Could not load your account'));
          return;
        }
        if (!bookings.ok || !orders.ok) {
          showError(apiError(bookings.ok ? orders : bookings, 'Could not load your history'));
          return;
        }

        state.user = me.data.user;
        state.stats = me.data.stats || {};
        state.bookings = bookings.data || [];
        state.orders = orders.data || [];
        setUser(state.user);

        renderHero();
        renderBookings();
        renderOrders();

        if (loading) loading.hidden = true;
        if (content) content.hidden = false;

        var notice = storeGet('sessionStorage', NOTICE_KEY);
        if (notice) {
          var banner = $('#accountNotice');
          if (banner) {
            banner.textContent = notice;
            banner.hidden = false;
          }
          storeRemove('sessionStorage', NOTICE_KEY);
        }
        bindTabs();
      }).catch(function () {
        showError('Cannot reach the server. Check that the app is running, then retry.');
      });
    }

    function initProfileForm() {
      var form = $('#profileForm');
      if (!form) return;
      var note = $('#profileNote');
      var button = $('#profileSave');

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrors(form);
        if (note) note.hidden = true;

        var name = $('#profileName');
        var email = $('#profileEmail');
        var phone = $('#profilePhone');
        var nameValue = name.value.trim();
        var emailValue = email.value.trim();
        var phoneValue = phone.value.replace(/\D/g, '');

        if (nameValue.length < 2) return fieldError(name, 'Please enter your full name');
        if (!EMAIL_RE.test(emailValue)) return fieldError(email, 'Enter a valid email address');
        if (!/^[6-9]\d{9}$/.test(phoneValue)) return fieldError(phone, 'Enter a valid 10-digit mobile number');

        busy(button, true, 'Saving…');
        API.updateUserProfile(token(), { name: nameValue, email: emailValue, phone: phoneValue }).then(function (res) {
          if (handleAuthFailure(res)) return;
          if (!res.ok) {
            var field = res.body && res.body.field;
            if (field === 'name') fieldError(name, apiError(res));
            else if (field === 'email') fieldError(email, apiError(res));
            else if (field === 'phone') fieldError(phone, apiError(res));
            if (note) {
              note.textContent = apiError(res, 'Could not save your profile');
              note.className = 'acct-note-line acct-note-line--error';
              note.hidden = false;
            }
            return;
          }
          setSession(res.data);
          state.user = res.data.user;
          renderHero();
          if (note) {
            note.textContent = 'Profile saved. Your details are up to date.';
            note.className = 'acct-note-line';
            note.hidden = false;
          }
          toast('Profile updated');
        }).catch(function () {
          toast('Could not save your profile', 'error');
        }).finally(function () {
          busy(button, false);
        });
      });
    }

    function initSecurityForm() {
      var form = $('#securityForm');
      if (!form) return;
      var current = $('#currentPassword');
      var next = $('#newPassword');
      var confirm = $('#confirmPassword');
      var note = $('#securityNote');
      var button = $('#securitySave');

      bindStrength(next, $('#securityStrength'));

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrors(form);
        if (note) note.hidden = true;

        if (!current.value) return fieldError(current, 'Enter your current password');
        var problem = passwordProblem(next.value);
        if (problem) return fieldError(next, problem);
        if (confirm.value !== next.value) return fieldError(confirm, 'The two passwords do not match');
        if (next.value === current.value) return fieldError(next, 'Choose a password different from the current one');

        busy(button, true, 'Updating…');
        API.changeUserPassword(token(), {
          currentPassword: current.value,
          newPassword: next.value
        }).then(function (res) {
          if (handleAuthFailure(res)) return;
          if (!res.ok) {
            if (res.status === 400 && /current/i.test(res.error || '')) {
              fieldError(current, apiError(res));
            }
            if (note) {
              note.textContent = apiError(res, 'Could not change your password');
              note.className = 'acct-note-line acct-note-line--error';
              note.hidden = false;
            }
            return;
          }
          form.reset();
          renderStrength($('#securityStrength'), '');
          if (note) {
            note.textContent = 'Password updated. Use it the next time you sign in.';
            note.className = 'acct-note-line';
            note.hidden = false;
          }
          toast('Password changed');
        }).catch(function () {
          toast('Could not change your password', 'error');
        }).finally(function () {
          busy(button, false);
        });
      });
    }

    $$('[data-signout]').forEach(function (button) {
      button.addEventListener('click', function () { signOut('You have been signed out.'); });
    });

    if (retry) retry.addEventListener('click', load);

    initProfileForm();
    initSecurityForm();
    load();
  }

  /* ====================================================================== */
  /* Boot                                                                   */
  /* ====================================================================== */
  function boot() {
    initPasswordToggles();
    initPhoneInputs();
    initCapsHints();
    initLiveClear();
    initFieldStates();

    var page = document.body ? document.body.getAttribute('data-auth-page') : '';
    if (page === 'login') initLogin();
    else if (page === 'register') initRegister();
    else if (page === 'forgot') initForgot();
    else if (page === 'reset') initReset();
    else if (page === 'account') initAccount();
  }

  root.PanditAuth = {
    token: token,
    user: user,
    setSession: setSession,
    setUser: setUser,
    clearSession: clearSession,
    isLoggedIn: isLoggedIn,
    apiError: apiError,
    toast: toast,
    initials: initials,
    money: money,
    dateTime: dateTime
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
