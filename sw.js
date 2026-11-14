/* Vedic Pooja — offline shell.
   Everything same-origin is network-first so a deploy is visible on the next
   load. The cache is only used when the network is unavailable. */
'use strict';

var VERSION = 'vp-static-v60';
var RUNTIME = 'vp-runtime-v2';

var CORE = [
  './',
  './index.html',
  './puja-guide.html',
  './poojas.html',
  './services.html',
  './booking.html',
  './panchang.html',
  './muhurat.html',
  './mantra.html',
  './calendar.html',
  './horoscope.html',
  './cities.html',
  './kundli.html',
  './matching.html',
  './pandits.html',
  './shop.html',
  './reviews.html',
  './about.html',
  './policies.html',
  './login.html',
  './register.html',
  './forgot-password.html',
  './reset-password.html',
  './account.html',
  './assets/css/style.css',
  './assets/css/puja.css',
  './assets/css/experience.css',
  './assets/css/studio.css',
  './assets/css/promo.css',
  './assets/css/mantra.css',
  './assets/css/auth.css',
  './assets/css/services.css',
  './assets/css/fonts.css',
  './assets/css/map.css',
  './assets/vendor/leaflet/leaflet.css',
  './assets/vendor/leaflet/leaflet.js',
  './assets/vendor/leaflet/images/layers.png',
  './assets/vendor/leaflet/images/layers-2x.png',
  './assets/vendor/leaflet/images/marker-icon.png',
  './assets/vendor/leaflet/images/marker-icon-2x.png',
  './assets/vendor/leaflet/images/marker-shadow.png',
  './assets/fonts/inter-400.woff2',
  './assets/fonts/marcellus-400.woff2',
  './assets/fonts/tiro-devanagari-400.woff2',
  './assets/fonts/tiro-devanagari-latin-400.woff2',
  './assets/js/astro.js',
  './assets/js/data.js',
  './assets/js/site-settings.js',
  './assets/js/i18n-phrases.js',
  './assets/js/i18n-astro.js',
  './assets/js/i18n-auth.js',
  './assets/js/app.js',
  './assets/js/promo.js',
  './assets/js/search.js',
  './assets/js/api.js',
  './assets/js/auth.js',
  './assets/js/home.js',
  './assets/js/daily-wisdom.js',
  './assets/js/chart.js',
  './assets/js/poojas.js',
  './assets/js/services.js',
  './assets/js/pandits.js',
  './assets/js/panchang.js',
  './assets/js/studio.js',
  './assets/js/mantra.js',
  './assets/js/calendar.js',
  './assets/js/cities.js',
  './assets/js/horoscope.js',
  './assets/js/experience.js',
  './assets/js/reminders.js',
  './assets/js/kundli.js',
  './assets/js/matching.js',
  './assets/js/booking.js',
  './assets/js/map.js',
  './assets/js/shop.js',
  './assets/js/about.js',
  './assets/js/reviews.js',
  './assets/js/puja-data.js',
  './assets/js/puja-i18n.js',
  './assets/js/vendor/qrcode.js',
  './assets/js/vendor/astronomy.min.js',
  './assets/js/puja.js',
  './assets/img/upi-qr.svg',
  './assets/img/favicon.svg',
  './assets/img/icon.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION)
      .then(function (cache) {
        // Add files one by one: one optional 404 must not abort the install.
        return Promise.all(CORE.map(function (url) {
          return cache.add(url).catch(function () { return null; });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== VERSION && key !== RUNTIME) return caches.delete(key);
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function putIn(cacheName, request, response) {
  if (!response || (!response.ok && response.type !== 'opaque')) return null;
  var copy = response.clone();
  caches.open(cacheName).then(function (cache) { cache.put(request, copy); });
  return null;
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try { url = new URL(request.url); } catch (e) { return; }

  // Fonts and other CDN assets: keep a copy for offline typography.
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.match(request).then(function (cached) {
          var network = fetch(request).then(function (res) {
            putIn(RUNTIME, request, res);
            return res;
          }).catch(function () { return cached; });
          return cached || network;
        })
      );
    }
    return;
  }

  // Same-origin HTML, JS, CSS, images: always try the network first so edits
  // appear immediately, then fall back to the cache for offline use.
  var offlineFallback = request.mode === 'navigate'
    ? caches.match('./puja-guide.html').then(function (page) {
        return page || caches.match('./index.html');
      })
    : Promise.resolve(undefined);

  event.respondWith(
    fetch(request, { cache: 'no-store' }).then(function (res) {
      putIn(VERSION, request, res);
      return res;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        return offlineFallback;
      });
    })
  );
});

// Let the page ask the waiting worker to take over after a deploy.
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Focus the muhurat panel when a local festival reminder is tapped.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || self.registration.scope + 'puja-guide.html#muhurat';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) {
          if ('navigate' in list[i]) list[i].navigate(target);
          return list[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return null;
    })
  );
});
