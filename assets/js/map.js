/* Coverage & location maps — Leaflet 1.9.4 (vendored), lazy loaded, with an
   offline schematic fallback. Two placements only:
     [data-map="coverage"]  pandits.html — Gurugram & NCR service area
     [data-map="booking"]   booking.html — visual location confirmation
   Leaflet is only fetched when a card scrolls into view. Booking coordinates
   are never added to the payload; the pin is a visual check for the buyer. */
(function (root) {
  'use strict';
  var A = root.App, D = root.PanditData;
  if (!A || !D) return;
  var doc = root.document;

  var BASE = { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 };

  /* Real, approximate coordinates. Distances are haversine from the base. */
  var ZONES = [
    {
      id: 'core', city: 'Gurugram', color: '#6d1f2c',
      name: 'Gurugram core', hi: 'गुरुग्राम कोर',
      lat: 28.4595, lon: 77.0266, radius: 7000, eta: [20, 35], sameDay: true,
      blurb: 'Our base. DLF phases, Golf Course Road, Sushant Lok and Sectors 1–57 — the fastest same-day response.',
      hiBlurb: 'हमारा आधार। DLF फेज़, गोल्फ कोर्स रोड, सुशांत लोक और सेक्टर 1–57 — सबसे तेज़ सेम-डे उपलब्धता।',
      localities: ['DLF Phase 1–5', 'Golf Course Road', 'Sushant Lok', 'Sectors 1–57', 'MG Road'],
      hiLocalities: ['DLF फेज़ 1–5', 'गोल्फ कोर्स रोड', 'सुशांत लोक', 'सेक्टर 1–57', 'एमजी रोड']
    },
    {
      id: 'new-gurugram', city: 'Gurugram', color: '#8a2c3b',
      name: 'New Gurugram & Dwarka Expressway', hi: 'नया गुरुग्राम और द्वारका एक्सप्रेसवे',
      lat: 28.4230, lon: 76.9800, radius: 7000, eta: [30, 45], sameDay: true,
      blurb: 'Sectors 58–115, New Gurugram towers and the Dwarka Expressway belt, including Pataudi Road.',
      hiBlurb: 'सेक्टर 58–115, नया गुरुग्राम और द्वारका एक्सप्रेसवे क्षेत्र, पटौदी रोड सहित।',
      localities: ['Sectors 58–115', 'Dwarka Expressway', 'New Gurugram', 'Pataudi Road', 'Sector 84'],
      hiLocalities: ['सेक्टर 58–115', 'द्वारका एक्सप्रेसवे', 'नया गुरुग्राम', 'पटौदी रोड', 'सेक्टर 84']
    },
    {
      id: 'sohna-road', city: 'Gurugram', color: '#a8452e',
      name: 'Sohna Road & Badshahpur', hi: 'सोहना रोड और बड़शाहपुर',
      lat: 28.4030, lon: 77.0450, radius: 6000, eta: [25, 40], sameDay: true,
      blurb: 'Sohna Road, Badshahpur, Sectors 65–70, Vatika City and the Sector 57 belt.',
      hiBlurb: 'सोहना रोड, बड़शाहपुर, सेक्टर 65–70, वाटिका सिटी और सेक्टर 57 क्षेत्र।',
      localities: ['Sohna Road', 'Badshahpur', 'Sectors 65–70', 'Vatika City', 'Sector 57'],
      hiLocalities: ['सोहना रोड', 'बड़शाहपुर', 'सेक्टर 65–70', 'वाटिका सिटी', 'सेक्टर 57']
    },
    {
      id: 'manesar', city: 'Gurugram', color: '#b06a1f',
      name: 'Manesar & IMT', hi: 'मानेसर और आईएमटी',
      lat: 28.3545, lon: 76.9425, radius: 5500, eta: [35, 50], sameDay: true,
      blurb: 'Manesar, IMT Manesar, Kasan and Bilaspur. Same day for morning muhurats.',
      hiBlurb: 'मानेसर, आईएमटी मानेसर, कासन और बिलासपुर। सुबह के मुहूर्त के लिए सेम-डे।',
      localities: ['Manesar', 'IMT Manesar', 'Kasan', 'Bilaspur', 'Sector 8'],
      hiLocalities: ['मानेसर', 'आईएमटी मानेसर', 'कासन', 'बिलासपुर', 'सेक्टर 8']
    },
    {
      id: 'faridabad', city: 'Faridabad', color: '#8a6a12',
      name: 'Faridabad', hi: 'फरीदाबाद',
      lat: 28.4089, lon: 77.3178, radius: 8000, eta: [50, 70], sameDay: false,
      blurb: 'Faridabad, NIT, Neharpar, Ballabgarh and Sectors 15–21. Planned in advance with the muhurat.',
      hiBlurb: 'फरीदाबाद, एनआईटी, नहरपार, बल्लभगढ़ और सेक्टर 15–21। मुहूर्त के साथ पहले से योजना।',
      localities: ['NIT Faridabad', 'Sector 15', 'Neharpar', 'Old Faridabad', 'Ballabgarh'],
      hiLocalities: ['एनआईटी फरीदाबाद', 'सेक्टर 15', 'नहरपार', 'पुराना फरीदाबाद', 'बल्लभगढ़']
    },
    {
      id: 'delhi', city: 'Delhi', color: '#5f6b2f',
      name: 'South & Central Delhi', hi: 'दक्षिण और मध्य दिल्ली',
      lat: 28.5600, lon: 77.2100, radius: 9000, eta: [55, 80], sameDay: false,
      blurb: 'South Delhi, Central Delhi, Dwarka and the airport belt. By appointment; allow 60–90 minutes.',
      hiBlurb: 'दक्षिण दिल्ली, मध्य दिल्ली, द्वारका और एयरपोर्ट क्षेत्र। अपॉइंटमेंट से; 60–90 मिनट का समय रखें।',
      localities: ['South Delhi', 'Central Delhi', 'Dwarka', 'Saket', 'Vasant Kunj'],
      hiLocalities: ['दक्षिण दिल्ली', 'मध्य दिल्ली', 'द्वारका', 'साकेत', 'वसंत कुंज']
    },
    {
      id: 'noida', city: 'Noida', color: '#2f6b5a',
      name: 'Noida & Greater Noida', hi: 'नोएडा और ग्रेटर नोएडा',
      lat: 28.5355, lon: 77.3910, radius: 8500, eta: [70, 95], sameDay: false,
      blurb: 'Noida, Greater Noida, Noida Extension and Sector 62. By appointment for morning slots.',
      hiBlurb: 'नोएडा, ग्रेटर नोएडा, नोएडा एक्सटेंशन और सेक्टर 62। सुबह के स्लॉट के लिए अपॉइंटमेंट से।',
      localities: ['Noida', 'Greater Noida', 'Noida Extension', 'Sector 18', 'Sector 62'],
      hiLocalities: ['नोएडा', 'ग्रेटर नोएडा', 'नोएडा एक्सटेंशन', 'सेक्टर 18', 'सेक्टर 62']
    },
    {
      id: 'ghaziabad', city: 'Ghaziabad', color: '#3f5a7a',
      name: 'Ghaziabad & Indirapuram', hi: 'गाज़ियाबाद और इंदिरापुरम',
      lat: 28.6406, lon: 77.3700, radius: 7500, eta: [75, 100], sameDay: false,
      blurb: 'Ghaziabad, Indirapuram, Vaishali, Vasundhara and Raj Nagar Extension. By appointment.',
      hiBlurb: 'गाज़ियाबाद, इंदिरापुरम, वैशाली, वसुंधरा और राज नगर एक्सटेंशन। अपॉइंटमेंट से।',
      localities: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar Extension', 'Kaushambi'],
      hiLocalities: ['इंदिरापुरम', 'वैशाली', 'वसुंधरा', 'राज नगर एक्सटेंशन', 'कौशांबी']
    }
  ];

  /* Localities missing from PanditData.CITIES. Approximate WGS-84 centres. */
  var EXTRA_PLACES = [
    { name: 'DLF Phase 1', hi: 'DLF फेज़ 1', state: 'Haryana', lat: 28.4720, lon: 77.0930 },
    { name: 'DLF Phase 2', hi: 'DLF फेज़ 2', state: 'Haryana', lat: 28.4800, lon: 77.0900 },
    { name: 'DLF Phase 3', hi: 'DLF फेज़ 3', state: 'Haryana', lat: 28.4900, lon: 77.0930 },
    { name: 'DLF Phase 4', hi: 'DLF फेज़ 4', state: 'Haryana', lat: 28.4750, lon: 77.0800 },
    { name: 'DLF Phase 5', hi: 'DLF फेज़ 5', state: 'Haryana', lat: 28.4650, lon: 77.0900 },
    { name: 'Golf Course Road', hi: 'गोल्फ कोर्स रोड', state: 'Haryana', lat: 28.4420, lon: 77.1000 },
    { name: 'Sushant Lok', hi: 'सुशांत लोक', state: 'Haryana', lat: 28.4600, lon: 77.0800 },
    { name: 'Sector 29', hi: 'सेक्टर 29', state: 'Haryana', lat: 28.4700, lon: 77.0700 },
    { name: 'Sector 31', hi: 'सेक्टर 31', state: 'Haryana', lat: 28.4550, lon: 77.0480 },
    { name: 'Sector 42', hi: 'सेक्टर 42', state: 'Haryana', lat: 28.4400, lon: 77.0900 },
    { name: 'Sector 45', hi: 'सेक्टर 45', state: 'Haryana', lat: 28.4440, lon: 77.0650 },
    { name: 'Sector 47', hi: 'सेक्टर 47', state: 'Haryana', lat: 28.4350, lon: 77.0550 },
    { name: 'Sector 56', hi: 'सेक्टर 56', state: 'Haryana', lat: 28.4210, lon: 77.0970 },
    { name: 'Sector 57', hi: 'सेक्टर 57', state: 'Haryana', lat: 28.4180, lon: 77.0900 },
    { name: 'Sector 65', hi: 'सेक्टर 65', state: 'Haryana', lat: 28.4050, lon: 77.0700 },
    { name: 'Sector 70', hi: 'सेक्टर 70', state: 'Haryana', lat: 28.4050, lon: 77.0800 },
    { name: 'Sohna Road', hi: 'सोहना रोड', state: 'Haryana', lat: 28.4100, lon: 77.0400 },
    { name: 'Badshahpur', hi: 'बड़शाहपुर', state: 'Haryana', lat: 28.3930, lon: 77.0480 },
    { name: 'Vatika City', hi: 'वाटिका सिटी', state: 'Haryana', lat: 28.4080, lon: 77.0380 },
    { name: 'New Gurugram', hi: 'नया गुरुग्राम', state: 'Haryana', lat: 28.4200, lon: 76.9800 },
    { name: 'Dwarka Expressway', hi: 'द्वारका एक्सप्रेसवे', state: 'Haryana', lat: 28.4300, lon: 76.9600 },
    { name: 'Pataudi Road', hi: 'पटौदी रोड', state: 'Haryana', lat: 28.4400, lon: 76.9000 },
    { name: 'Manesar', hi: 'मानेसर', state: 'Haryana', lat: 28.3545, lon: 76.9425 },
    { name: 'IMT Manesar', hi: 'आईएमटी मानेसर', state: 'Haryana', lat: 28.3700, lon: 76.9300 },
    { name: 'Sohna', hi: 'सोहना', state: 'Haryana', lat: 28.2470, lon: 77.0650 },
    { name: 'NIT Faridabad', hi: 'एनआईटी फरीदाबाद', state: 'Haryana', lat: 28.3900, lon: 77.2900 },
    { name: 'Neharpar Faridabad', hi: 'नहरपार फरीदाबाद', state: 'Haryana', lat: 28.3700, lon: 77.3300 },
    { name: 'Indirapuram', hi: 'इंदिरापुरम', state: 'Uttar Pradesh', lat: 28.6400, lon: 77.3700 },
    { name: 'Vaishali Ghaziabad', hi: 'वैशाली गाज़ियाबाद', state: 'Uttar Pradesh', lat: 28.6500, lon: 77.3400 },
    { name: 'Noida Sector 18', hi: 'नोएडा सेक्टर 18', state: 'Uttar Pradesh', lat: 28.5700, lon: 77.3200 },
    { name: 'Noida Sector 62', hi: 'नोएडा सेक्टर 62', state: 'Uttar Pradesh', lat: 28.6200, lon: 77.3600 },
    { name: 'Noida Extension', hi: 'नोएडा एक्सटेंशन', state: 'Uttar Pradesh', lat: 28.6100, lon: 77.4300 },
    { name: 'Greater Noida', hi: 'ग्रेटर नोएडा', state: 'Uttar Pradesh', lat: 28.4744, lon: 77.5040 }
  ];

  var ALIASES = { gurgaon: 'Gurugram', 'gurgaon sector': 'Gurugram' };
  var STATE_HI = { Haryana: 'हरियाणा', Delhi: 'दिल्ली', 'Uttar Pradesh': 'उत्तर प्रदेश' };

  var leaflet = { state: 'idle', failed: false, waiters: [] };
  var widgets = [];

  function T(en, hi) { return A.isHi() ? hi : en; }
  function esc(s) { return A.esc(s); }
  function isHi() { return A.isHi && A.isHi(); }

  function distKm(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  ZONES.forEach(function (z) { z.km = distKm(BASE, z); });

  function istHour() {
    try {
      var s = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false
      }).format(new Date());
      return Number(String(s).replace(/\D/g, '')) % 24;
    } catch (e) {
      return new Date().getHours();
    }
  }
  function sameDayOpen() { return istHour() < 16; }

  function zoneById(id) {
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i];
    return null;
  }

  function kmShort(km) {
    if (km < 0.1) return T('Base', 'आधार');
    if (km < 0.95) return '<1 ' + T('km', 'किमी');
    return (km < 10 ? km.toFixed(1) : Math.round(km)) + ' ' + T('km', 'किमी');
  }
  function kmLabel(km, approx) {
    if (km < 0.1) return T('at this spot', 'इसी स्थान पर');
    return (approx ? '~' : '') + (km < 10 ? km.toFixed(1) : Math.round(km)) + ' ' + T('km', 'किमी');
  }
  function etaText(z) { return '~' + z.eta[0] + '–' + z.eta[1] + ' ' + T('min', 'मिनट'); }

  function badgeFor(z) {
    if (z.sameDay && sameDayOpen()) return { cls: 'same', text: T('Same day', 'सेम-डे') };
    if (z.sameDay) return { cls: 'next', text: T('Next day', 'अगले दिन') };
    return { cls: 'appt', text: T('By appointment', 'अपॉइंटमेंट') };
  }
  function badgeHtml(z) {
    var b = badgeFor(z);
    return '<em class="map-badge map-badge--' + b.cls + '">' + b.text + '</em>';
  }
  function availabilityText(z) {
    if (z.sameDay) {
      return sameDayOpen()
        ? T('Same day until 4 pm', 'सेम-डे, शाम 4 बजे तक')
        : T('Next day or by appointment', 'अगले दिन या अपॉइंटमेंट से');
    }
    return T('By appointment', 'अपॉइंटमेंट से');
  }
  function zoneName(z) { return T(z.name, z.hi); }
  function zoneLocalities(z) { return (isHi() ? z.hiLocalities : z.localities) || z.localities; }
  function placeName(p) {
    if (!p) return '';
    if (p.hi && isHi()) return p.hi;
    return A.placeName ? A.placeName(p.name) : p.name;
  }
  function stateName(s) {
    if (!s) return '';
    if (isHi()) return STATE_HI[s] || (A.placeName ? A.placeName(s) : s);
    return s;
  }

  /* ------------------------------------------------------------- place search */
  var ALL_PLACES = null;
  var NAME_INDEX = null;

  function keyName(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function allPlaces() {
    if (ALL_PLACES) return ALL_PLACES;
    ALL_PLACES = [];
    var seen = {};
    (D.CITIES || []).forEach(function (c) {
      if (typeof c.lat !== 'number' || typeof c.lon !== 'number') return;
      seen[keyName(c.name)] = true;
      ALL_PLACES.push({ name: c.name, state: c.state, lat: c.lat, lon: c.lon, approx: false });
    });
    EXTRA_PLACES.forEach(function (p) {
      if (seen[keyName(p.name)]) return;
      seen[keyName(p.name)] = true;
      ALL_PLACES.push({ name: p.name, hi: p.hi, state: p.state, lat: p.lat, lon: p.lon, approx: true });
    });
    return ALL_PLACES;
  }

  function nearestPlace(lat, lon) {
    var point = { lat: lat, lon: lon };
    var best = null;
    allPlaces().forEach(function (p) {
      var d = distKm(point, p);
      if (!best || d < best.distance) {
        best = { name: p.name, hi: p.hi, state: p.state, lat: p.lat, lon: p.lon, approx: p.approx, distance: d };
      }
    });
    return best;
  }

  function nearestExtra(lat, lon) {
    var point = { lat: lat, lon: lon };
    var best = null;
    EXTRA_PLACES.forEach(function (p) {
      var d = distKm(point, p);
      if (!best || d < best.distance) {
        best = { name: p.name, hi: p.hi, state: p.state, lat: p.lat, lon: p.lon, approx: true, distance: d };
      }
    });
    return best;
  }

  function nearestZone(lat, lon) {
    var point = { lat: lat, lon: lon };
    var best = null, inside = null;
    ZONES.forEach(function (z) {
      var d = distKm(point, z);
      if (!best || d < best.distance) best = { zone: z, distance: d };
      if (d <= z.radius / 1000 && (!inside || d < inside.distance)) inside = { zone: z, distance: d };
    });
    return inside
      ? { zone: inside.zone, distance: inside.distance, inside: true }
      : { zone: best.zone, distance: best.distance, inside: false };
  }

  function matchAddress(text) {
    var q = ' ' + keyName(String(text || '').replace(/[^A-Za-z0-9\u0900-\u097F ]+/g, ' ')).replace(/\s+/g, ' ') + ' ';
    if (q.replace(/\s/g, '').length < 3) return null;
    var found = null;
    allPlaces().forEach(function (p) {
      var key = keyName(p.name);
      if (key.length < 4) return;
      if (q.indexOf(' ' + key + ' ') >= 0 && (!found || key.length > found.key.length)) {
        found = { key: key, place: p };
      }
    });
    Object.keys(ALIASES).forEach(function (alias) {
      if (q.indexOf(' ' + alias + ' ') >= 0 && (!found || alias.length > found.key.length)) {
        var name = ALIASES[alias];
        var target = null;
        allPlaces().forEach(function (p) { if (keyName(p.name) === keyName(name)) target = p; });
        if (target) found = { key: alias, place: target };
      }
    });
    return found ? found.place : null;
  }

  /* --------------------------------------------------------------- leaflet load */
  function ensureLeafletCss() {
    if (doc.querySelector('link[data-leaflet-css]')) return;
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/vendor/leaflet/leaflet.css';
    link.setAttribute('data-leaflet-css', '');
    doc.head.appendChild(link);
  }

  function loadLeaflet(cb) {
    if (root.L && root.L.map) { cb(null); return; }
    if (leaflet.failed) { cb(new Error('leaflet-failed')); return; }
    leaflet.waiters.push(cb);
    if (leaflet.state === 'loading') return;
    leaflet.state = 'loading';
    ensureLeafletCss();
    var script = doc.createElement('script');
    script.src = 'assets/vendor/leaflet/leaflet.js';
    script.async = true;
    script.onload = function () {
      leaflet.state = 'ready';
      var queue = leaflet.waiters.slice();
      leaflet.waiters = [];
      queue.forEach(function (fn) { try { fn(null); } catch (e) { /* keep going */ } });
    };
    script.onerror = function () {
      leaflet.state = 'failed';
      leaflet.failed = true;
      var queue = leaflet.waiters.slice();
      leaflet.waiters = [];
      queue.forEach(function (fn) { try { fn(new Error('leaflet-failed')); } catch (e) { /* keep going */ } });
    };
    doc.head.appendChild(script);
  }

  function closest(node, sel) {
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(sel)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var self = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; fn.apply(self, args); }, wait);
    };
  }

  function projectKm(lat, lon, center, pxPerKm, cx, cy, clampKm) {
    var kmPerLon = 111.32 * Math.cos(center.lat * Math.PI / 180);
    var dx = (lon - center.lon) * kmPerLon;
    var dy = (lat - center.lat) * 110.574;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (clampKm && d > clampKm) {
      dx = dx * (clampKm / d);
      dy = dy * (clampKm / d);
    }
    return { x: +(cx + dx * pxPerKm).toFixed(1), y: +(cy - dy * pxPerKm).toFixed(1) };
  }

  function svgNorth(cx, cy) {
    return '<g class="map-north" aria-hidden="true">' +
      '<path d="M' + cx + ' ' + (cy - 6) + 'l-5 12h10Z"/>' +
      '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle">N</text></g>';
  }

  /* ============================================================ widget base */
  function Widget(el, kind) {
    this.el = el;
    this.kind = kind;
    this.mode = 'map';
    this.started = false;
    this.map = null;
    this.tiles = null;
    this.tileErrors = 0;
    this.selected = ZONES[0].id;
    this.noteKey = '';
    this.userPoint = null;
    this.youMarker = null;
    this.canvas = el.querySelector('[data-map-canvas]');
    this.stage = el.querySelector('.map-stage');
    this.schematicEl = el.querySelector('[data-map-schematic]');
    this.panel = el.querySelector('[data-map-panel]');
    this.bar = el.querySelector('[data-map-bar]');
    this.foot = el.querySelector('[data-map-foot]');
    this.loadingEl = el.querySelector('[data-map-loading]');
    this.noteEl = el.querySelector('[data-map-note]');
    this._resizeQueued = false;
    if (this.stage) {
      this.stage.setAttribute('role', 'region');
      this.stage.setAttribute('aria-label', kind === 'booking'
        ? T('Location confirmation map', 'स्थान पुष्टि मैप')
        : T('Gurugram and NCR coverage map', 'गुरुग्राम और एनसीआर कवरेज मैप'));
    }
  }

  Widget.prototype.loadingHtml = function () {
    return '<span class="map-shimmer" aria-hidden="true"></span>' +
      '<span class="map-loading__copy">' + A.icon('compass') + '<span>' +
      T('Loading the live map…', 'लाइव मैप लोड हो रहा है…') + '</span></span>';
  };

  Widget.prototype.setLoading = function (on) {
    if (!this.loadingEl) return;
    if (on) {
      this.loadingEl.innerHTML = this.loadingHtml();
      this.loadingEl.classList.remove('hide');
    } else {
      this.loadingEl.classList.add('hide');
    }
  };

  Widget.prototype.showNote = function (text) {
    if (!this.noteEl) return;
    this.noteEl.innerHTML = A.icon('info') + '<span>' + esc(text) + '</span>';
    this.noteEl.classList.remove('hide');
  };
  Widget.prototype.hideNote = function () {
    if (!this.noteEl) return;
    this.noteEl.classList.add('hide');
    this.noteEl.innerHTML = '';
  };

  Widget.prototype.observe = function () {
    var self = this;
    if (!this.el) return;
    if (root.IntersectionObserver) {
      this.io = new root.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          self.start();
          if (self.map) self.invalidateSoon();
        });
      }, { rootMargin: '160px 0px' });
      this.io.observe(this.el);
    } else {
      this.start();
    }
    if (root.ResizeObserver) {
      this.ro = new root.ResizeObserver(function () { self.invalidateSoon(); });
      this.ro.observe(this.stage || this.el);
    }
  };

  Widget.prototype.invalidateSoon = function () {
    var self = this;
    if (this._resizeQueued) return;
    this._resizeQueued = true;
    setTimeout(function () {
      self._resizeQueued = false;
      if (self.map && self.mode === 'map') {
        try { self.map.invalidateSize(); } catch (e) { /* detached */ }
      }
    }, 90);
  };

  Widget.prototype.start = function () {
    if (this.started) return;
    this.started = true;
    this.renderSchematic();
    if (root.navigator && root.navigator.onLine === false) {
      this.noteKey = 'offline';
      this.setMode('schematic', true);
      return;
    }
    this.setLoading(true);
    var self = this;
    loadLeaflet(function (err) {
      if (err) {
        self.noteKey = 'failed';
        self.setMode('schematic', true);
        return;
      }
      try {
        self.initMap();
      } catch (e) {
        self.noteKey = 'failed';
        self.setMode('schematic', true);
      }
    });
  };

  Widget.prototype.setMode = function (mode, auto) {
    this.mode = mode;
    var schematic = mode === 'schematic';
    this.el.classList.toggle('is-schematic', schematic);
    setHidden(this.canvas, schematic);
    setHidden(this.schematicEl, !schematic);
    if (schematic) {
      this.renderSchematic();
      this.setLoading(false);
      if (auto && this.noteKey) {
        this.showNote(this.noteKey === 'offline'
          ? T('You are offline. Showing the offline coverage chart.', 'आप ऑफ़लाइन हैं। ऑफ़लाइन कवरेज चार्ट दिखाया जा रहा है।')
          : T('The live map could not load tiles here. Showing a schematic — every zone detail still works.', 'लाइव मैप यहाँ टाइल्स लोड नहीं कर सका। स्केमैटिक दिखाया जा रहा है — हर क्षेत्र का विवरण उपलब्ध है।'));
      }
    } else {
      this.hideNote();
      if (leaflet.failed) {
        this.noteKey = 'failed';
        this.setMode('schematic', true);
        return;
      }
      if (!this.started) this.start();
      if (this.map) {
        this.tileErrors = 0;
        if (this.tiles) this.tiles.redraw();
        this.setLoading(true);
        this.invalidateSoon();
      } else if (leaflet.state !== 'loading') {
        // First attempt was offline or failed before a map existed. Retry when
        // the visitor asks for the live view again.
        this.started = false;
        this.noteKey = '';
        this.start();
        this.renderBar();
        return;
      }
    }
    this.renderBar();
  };

  Widget.prototype.modeLabel = function () {
    return this.mode === 'schematic'
      ? { icon: 'compass', text: T('Live map', 'लाइव मैप') }
      : { icon: 'grid', text: T('Schematic view', 'स्केमैटिक दृश्य') };
  };

  Widget.prototype.toolsHtml = function () {
    var m = this.modeLabel();
    return '<div class="map-tools">' +
      '<button class="map-btn" type="button" data-mv-locate>' + A.icon('pin') + '<span>' + T('Use my location', 'मेरा स्थान') + '</span></button>' +
      '<button class="map-btn" type="button" data-mv-schematic aria-pressed="' + (this.mode === 'schematic') + '">' + A.icon(m.icon) + '<span>' + m.text + '</span></button>' +
      '</div>';
  };

  Widget.prototype.locating = function () {
    A.toast(T('Finding your location…', 'आपका स्थान खोजा जा रहा है…'));
  };

  Widget.prototype.locateFailed = function (err) {
    var denied = err && err.code === 1;
    A.toast(denied
      ? T('Location permission was not granted. Drag the pin or pick a zone instead.', 'स्थान की अनुमति नहीं मिली। कृपया पिन खींचें या क्षेत्र चुनें।')
      : T('We could not read your location. Drag the pin or pick a zone instead.', 'आपका स्थान पढ़ा नहीं जा सका। कृपया पिन खींचें या क्षेत्र चुनें।'), 'error');
  };

  Widget.prototype.locate = function (onOk) {
    var self = this;
    if (!root.navigator || !root.navigator.geolocation) {
      this.locateFailed({ code: 2 });
      return;
    }
    this.locating();
    root.navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      self.userPoint = { lat: lat, lon: lon };
      if (self.map) self.setYou(lat, lon);
      onOk(lat, lon);
    }, function (err) {
      self.locateFailed(err);
    }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 60000 });
  };

  Widget.prototype.setYou = function (lat, lon) {
    if (!this.map || !root.L) return;
    var icon = root.L.divIcon({
      className: 'map-you-wrap',
      html: '<span class="map-you"><i></i></span>',
      iconSize: [22, 22], iconAnchor: [11, 11]
    });
    if (!this.youMarker) {
      this.youMarker = root.L.marker([lat, lon], { icon: icon, interactive: false, keyboard: false, zIndexOffset: 700 });
      this.youMarker.addTo(this.map);
    } else {
      this.youMarker.setLatLng([lat, lon]);
    }
  };

  Widget.prototype.createMap = function (center, zoom, widget) {
    var L = root.L;
    var map = L.map(this.canvas, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: true,
      tap: true,
      zoomSnap: 0.5,
      minZoom: 8,
      maxZoom: 18
    }).setView([center.lat, center.lon], zoom);
    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: 'abc',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    });
    tiles.addTo(map);
    tiles.on('load', function () { widget.setLoading(false); });
    tiles.on('tileerror', function () {
      widget.tileErrors++;
      if (widget.tileErrors >= 4 && widget.mode === 'map') {
        widget.noteKey = 'failed';
        widget.setMode('schematic', true);
      }
    });
    setTimeout(function () { widget.setLoading(false); }, 4200);
    this.map = map;
    this.tiles = tiles;
    return map;
  };

  Widget.prototype.onLang = function () {
    if (this.stage) {
      this.stage.setAttribute('aria-label', this.kind === 'booking'
        ? T('Location confirmation map', 'स्थान पुष्टि मैप')
        : T('Gurugram and NCR coverage map', 'गुरुग्राम और एनसीआर कवरेज मैप'));
    }
    this.renderBar();
    this.renderPanel();
    this.renderFoot();
    this.renderSchematic();
    if (this.noteKey && this.noteEl && !this.noteEl.classList.contains('hide')) {
      this.showNote(this.noteKey === 'offline'
        ? T('You are offline. Showing the offline coverage chart.', 'आप ऑफ़लाइन हैं। ऑफ़लाइन कवरेज चार्ट दिखाया जा रहा है।')
        : T('The live map could not load tiles here. Showing a schematic — every zone detail still works.', 'लाइव मैप यहाँ टाइल्स लोड नहीं कर सका। स्केमैटिक दिखाया जा रहा है — हर क्षेत्र का विवरण उपलब्ध है।'));
    }
    this.refreshMapText();
  };

  Widget.prototype.refreshMapText = function () { /* overridden */ };
  Widget.prototype.renderBar = function () { /* overridden */ };
  Widget.prototype.renderPanel = function () { /* overridden */ };
  Widget.prototype.renderFoot = function () { /* overridden */ };
  Widget.prototype.renderSchematic = function () { /* overridden */ };

  /* ======================================================== coverage widget */
  function Coverage(el) {
    Widget.call(this, el, 'coverage');
    this.renderBar();
    this.renderPanel();
    this.renderFoot();
    this.renderSchematic();
    this.bind();
    this.observe();
  }
  Coverage.prototype = Object.create(Widget.prototype);
  Coverage.prototype.constructor = Coverage;

  Coverage.prototype.renderBar = function () {
    this.bar.innerHTML =
      '<div class="map-ident">' +
        '<span class="map-orb">' + A.icon('compass') + '</span>' +
        '<div><b>' + T('Gurugram & NCR coverage', 'गुरुग्राम और एनसीआर कवरेज') + '</b>' +
        '<span>' + T('Live map · 8 travel zones', 'लाइव मैप · 8 यात्रा क्षेत्र') + '</span></div>' +
      '</div>' + this.toolsHtml();
  };

  Coverage.prototype.renderPanel = function () {
    var selected = zoneById(this.selected) || ZONES[0];
    var list = ZONES.map(function (z, i) {
      var active = z.id === selected.id;
      return '<button type="button" class="map-zone' + (active ? ' is-active' : '') + '" data-zone="' + z.id + '" aria-pressed="' + active + '">' +
        '<span class="map-dot map-dot--' + i + '"></span>' +
        '<span class="map-zone__body"><b>' + esc(zoneName(z)) + '</b>' +
        '<span class="map-zone__sub">' + esc(zoneLocalities(z).slice(0, 3).join(' · ')) + '</span></span>' +
        '<span class="map-zone__meta"><span class="map-zone__km">' + kmShort(z.km) + '</span>' + badgeHtml(z) + '</span>' +
        '</button>';
    }).join('');

    var chips = zoneLocalities(selected).map(function (l) {
      return '<span class="chip chip--sm">' + esc(l) + '</span>';
    }).join('');

    var cutoff = sameDayOpen()
      ? T('Same-day requests close at 4:00 pm IST. After that, pick tomorrow or ask us for an appointment.', 'सेम-डे अनुरोध शाम 4:00 बजे IST तक। उसके बाद कल चुनें या हमसे अपॉइंटमेंट माँगें।')
      : T('Same-day requests are closed for today (after 4:00 pm IST). Choose tomorrow, or we will plan an appointment.', 'आज के सेम-डे अनुरोध बंद हैं (शाम 4:00 बजे IST के बाद)। कल चुनें, या हम अपॉइंटमेंट की योजना बनाएँगे।');

    this.panel.innerHTML =
      '<div class="map-zone-list" role="group" aria-label="' + T('Coverage zones', 'कवरेज क्षेत्र') + '">' + list + '</div>' +
      '<article class="map-detail">' +
        '<span class="map-kicker">' + T('Selected zone', 'चयनित क्षेत्र') + '</span>' +
        '<h3>' + esc(zoneName(selected)) + '</h3>' +
        '<p>' + esc(T(selected.blurb, selected.hiBlurb)) + '</p>' +
        '<div class="map-facts">' +
          '<div><span>' + T('Distance from base', 'आधार से दूरी') + '</span><b>' + kmShort(selected.km) + '</b></div>' +
          '<div><span>' + T('Travel time', 'यात्रा समय') + '</span><b>' + etaText(selected) + '</b></div>' +
          '<div><span>' + T('Availability', 'उपलब्धता') + '</span><b>' + availabilityText(selected) + '</b></div>' +
        '</div>' +
        '<div class="map-chips">' + chips + '</div>' +
        '<div class="map-actions">' +
          '<a class="btn btn--primary btn--sm" href="booking.html" data-book-zone="' + selected.id + '">' + T('Book in this zone', 'इस क्षेत्र में बुक करें') + '</a>' +
          '<a class="btn btn--ghost btn--sm" href="https://wa.me/' + String(A.owner && A.owner.phone || '918889685370').replace(/\D/g, '') + '" target="_blank" rel="noopener">' + T('Ask on WhatsApp', 'व्हाट्सएप पर पूछें') + '</a>' +
        '</div>' +
        '<p class="map-cutoff' + (sameDayOpen() ? '' : ' is-closed') + '">' + A.icon('clock') + '<span>' + cutoff + '</span></p>' +
      '</article>';

    this.renderFoot();
    if (this.map) this.highlight();
  };

  Coverage.prototype.renderFoot = function () {
    this.foot.innerHTML =
      '<span class="map-foot__note">' + A.icon('info') + '<span>' +
      T('Coverage is approximate. We confirm the exact address and travel on WhatsApp after you book.', 'कवरेज अनुमानित है। बुकिंग के बाद हम व्हाट्सएप पर सटीक पता और यात्रा की पुष्टि करते हैं।') +
      '</span></span>' +
      '<span class="map-credit" data-no-i18n>Map data © OpenStreetMap contributors</span>';
  };

  Coverage.prototype.bind = function () {
    var self = this;
    this.el.addEventListener('click', function (e) {
      var zoneBtn = closest(e.target, '[data-zone]');
      if (zoneBtn) {
        var id = zoneBtn.getAttribute('data-zone');
        if (id) self.selectZone(id, true);
        return;
      }
      if (closest(e.target, '[data-mv-locate]')) { self.start(); self.locateCoverage(); return; }
      if (closest(e.target, '[data-mv-schematic]')) {
        self.setMode(self.mode === 'schematic' ? 'map' : 'schematic', false);
        return;
      }
      var book = closest(e.target, '[data-book-zone]');
      if (book) {
        var z = zoneById(book.getAttribute('data-book-zone'));
        if (z && A.store) A.store.set('vp_city', z.city);
      }
    });
    this.el.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var dot = closest(e.target, '[data-zone]');
      if (!dot) return;
      e.preventDefault();
      self.selectZone(dot.getAttribute('data-zone'), true);
    });
  };

  Coverage.prototype.selectZone = function (id, fly) {
    var z = zoneById(id);
    if (!z) return;
    this.selected = id;
    this.renderPanel();
    this.renderSchematic();
    if (this.map && this.mode === 'map') {
      this.highlight();
      if (fly) {
        if (typeof this.map.flyTo === 'function') this.map.flyTo([z.lat, z.lon], 11, { duration: 0.75 });
        else this.map.setView([z.lat, z.lon], 11);
        if (this.markers && this.markers[z.id]) {
          this.markers[z.id].openTooltip();
        }
      }
    }
  };

  Coverage.prototype.locateCoverage = function () {
    var self = this;
    this.locate(function (lat, lon) {
      var info = nearestZone(lat, lon);
      if (info.inside || info.distance <= 60) {
        self.selectZone(info.zone.id, true);
        if (self.map && self.userPoint) {
          self.map.flyTo([lat, lon], 12, { duration: 0.8 });
        }
        A.toast(T('Nearest zone: ', 'निकटतम क्षेत्र: ') + zoneName(info.zone) + ' · ' + kmLabel(info.distance));
      } else {
        if (self.map) self.map.setView([lat, lon], 11);
        A.toast(T('You are outside our NCR coverage. WhatsApp us and we will plan by appointment.', 'आप हमारे एनसीआर कवरेज से बाहर हैं। व्हाट्सएप करें, हम अपॉइंटमेंट से योजना बनाएँगे।'), 'error');
      }
    });
  };

  Coverage.prototype.initMap = function () {
    var self = this;
    var L = root.L;
    var map = this.createMap(BASE, 10, this);
    var bounds = L.latLngBounds(ZONES.map(function (z) { return [z.lat, z.lon]; }));
    map.fitBounds(bounds, { padding: [26, 26], maxZoom: 11 });

    var baseIcon = L.divIcon({
      className: 'map-base-wrap',
      html: '<span class="map-base"><i></i></span>',
      iconSize: [30, 30], iconAnchor: [15, 15]
    });
    this.baseMarker = L.marker([BASE.lat, BASE.lon], { icon: baseIcon, keyboard: false, zIndexOffset: 400 })
      .addTo(map)
      .bindTooltip(T('Gurugram base', 'गुरुग्राम आधार'), { direction: 'top', offset: [0, -10] });

    this.markers = {};
    this.circles = {};
    this.spokes = {};

    ZONES.forEach(function (z, i) {
      var spoke = L.polyline([[BASE.lat, BASE.lon], [z.lat, z.lon]], {
        color: z.color, weight: 1.4, opacity: 0.5, dashArray: '4 7', interactive: false
      }).addTo(map);
      self.spokes[z.id] = spoke;

      var circle = L.circle([z.lat, z.lon], {
        radius: z.radius,
        color: z.color,
        weight: 1.5,
        opacity: 0.55,
        fillColor: z.color,
        fillOpacity: 0.08
      }).addTo(map);
      circle.bindTooltip(esc(zoneName(z)) + ' · ' + kmShort(z.km), { direction: 'top' });
      circle.on('click', function () { self.selectZone(z.id, true); });
      self.circles[z.id] = circle;

      var pin = L.divIcon({
        className: 'map-zone-pin-wrap',
        html: '<span class="map-zone-pin map-zone-pin--' + i + '"><i></i></span>',
        iconSize: [28, 28], iconAnchor: [14, 14]
      });
      var marker = L.marker([z.lat, z.lon], {
        icon: pin, keyboard: true, title: zoneName(z), riseOnHover: true, zIndexOffset: 200
      }).addTo(map);
      marker.bindTooltip(esc(zoneName(z)), { direction: 'top', offset: [0, -12] });
      marker.on('click', function () { self.selectZone(z.id, true); });
      self.markers[z.id] = marker;
    });

    if (this.userPoint) this.setYou(this.userPoint.lat, this.userPoint.lon);
    this.highlight();
    this.bindMapResize();
  };

  Coverage.prototype.bindMapResize = function () {
    var self = this;
    if (!this.map || this._resizeBound) return;
    this._resizeBound = true;
    this.map.on('resize', function () { self.invalidateSoon(); });
  };

  Coverage.prototype.highlight = function () {
    var self = this;
    ZONES.forEach(function (z) {
      var active = z.id === self.selected;
      var circle = self.circles && self.circles[z.id];
      if (circle) {
        circle.setStyle({
          weight: active ? 3 : 1.5,
          opacity: active ? 0.9 : 0.5,
          fillOpacity: active ? 0.16 : 0.07
        });
      }
      var marker = self.markers && self.markers[z.id];
      var iconEl = marker && marker.getElement && marker.getElement();
      if (iconEl) iconEl.classList.toggle('is-active', active);
      var spoke = self.spokes && self.spokes[z.id];
      if (spoke) spoke.setStyle({ opacity: active ? 0.85 : 0.4, weight: active ? 2 : 1.4 });
    });
  };

  Coverage.prototype.renderSchematic = function () {
    if (!this.schematicEl) return;
    var cx = 210, cy = 210, maxKm = 45, scale = 188 / maxKm;
    var rings = [5, 10, 20, 40].map(function (km) {
      var r = +(km * scale).toFixed(1);
      return '<circle class="map-ring" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
        '<text class="map-ring-label" x="' + cx + '" y="' + (cy - r - 5) + '" text-anchor="middle">' + km + ' ' + T('km', 'किमी') + '</text>';
    }).join('');

    var dots = ZONES.map(function (z, i) {
      var p = projectKm(z.lat, z.lon, BASE, scale, cx, cy, maxKm * 0.94);
      var active = z.id === this.selected;
      return '<line class="map-spoke" x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '"/>' +
        '<g class="map-szone' + (active ? ' is-active' : '') + '" data-zone="' + z.id + '" role="button" tabindex="0" aria-label="' + esc(zoneName(z)) + '">' +
          '<circle class="map-szone__halo" cx="' + p.x + '" cy="' + p.y + '" r="' + (active ? 13 : 10) + '"/>' +
          '<circle class="map-szone__dot map-sdot--' + i + '" cx="' + p.x + '" cy="' + p.y + '" r="5.5"/>' +
          '<text class="map-szone__n" x="' + p.x + '" y="' + (p.y + 2.6) + '" text-anchor="middle">' + (i + 1) + '</text>' +
        '</g>';
    }, this).join('');

    this.schematicEl.innerHTML =
      '<svg class="map-svg" viewBox="0 0 420 420" role="img" aria-label="' +
        esc(T('Schematic coverage chart: eight travel zones around the Gurugram base.', 'स्केमैटिक कवरेज चार्ट: गुरुग्राम आधार के चारों ओर आठ यात्रा क्षेत्र।')) + '">' +
        '<circle class="map-ring map-ring--soft" cx="' + cx + '" cy="' + cy + '" r="' + (maxKm * scale).toFixed(1) + '"/>' +
        rings + dots +
        '<circle class="map-sbase" cx="' + cx + '" cy="' + cy + '" r="5"/>' +
        '<circle class="map-sbase__halo" cx="' + cx + '" cy="' + cy + '" r="12"/>' +
        '<text class="map-sbase__label" x="' + cx + '" y="' + (cy + 26) + '" text-anchor="middle">' + T('Gurugram base', 'गुरुग्राम आधार') + '</text>' +
        svgNorth(cx, 28) +
      '</svg>';
  };

  Coverage.prototype.refreshMapText = function () {
    var self = this;
    if (!this.map) return;
    if (this.baseMarker) this.baseMarker.setTooltipContent(T('Gurugram base', 'गुरुग्राम आधार'));
    ZONES.forEach(function (z) {
      var marker = self.markers && self.markers[z.id];
      if (marker) {
        marker.setTooltipContent(esc(zoneName(z)));
        marker.options.title = zoneName(z);
        var iconEl = marker.getElement && marker.getElement();
        if (iconEl) iconEl.setAttribute('title', zoneName(z));
      }
      var circle = self.circles && self.circles[z.id];
      if (circle) circle.setTooltipContent(esc(zoneName(z)) + ' · ' + kmShort(z.km));
    });
  };

  /* ========================================================= booking widget */
  function Booking(el) {
    Widget.call(this, el, 'booking');
    this.city = this.readCity();
    this.pin = { lat: this.city.lat, lon: this.city.lon };
    this.source = 'city';
    this.userDragged = false;
    this.pinMarker = null;
    this.covCircle = null;
    this.addrTimer = null;
    this.renderBar();
    this.renderPanel();
    this.renderFoot();
    this.renderSchematic();
    this.bind();
    this.watchPick();
    this.watchAddress();
    this.observe();
  }
  Booking.prototype = Object.create(Widget.prototype);
  Booking.prototype.constructor = Booking;

  Booking.prototype.readCity = function () {
    var sel = doc.getElementById('bookingCity');
    var name = sel && sel.value ? sel.value : (A.store ? A.store.get('vp_city', 'Gurugram') : 'Gurugram');
    return A.findCity(name) || A.findCity('Gurugram') || BASE;
  };

  Booking.prototype.info = function () {
    var pin = this.pin;
    var city = this.city || BASE;
    var place = nearestPlace(pin.lat, pin.lon);
    if (place && keyName(place.name) === keyName(city.name)) {
      var local = nearestExtra(pin.lat, pin.lon);
      if (local && local.distance <= 6) place = local;
    }
    return {
      city: city,
      place: place,
      zoneInfo: nearestZone(pin.lat, pin.lon),
      cityDistance: distKm(pin, city)
    };
  };

  Booking.prototype.renderBar = function () {
    this.bar.innerHTML =
      '<div class="map-ident">' +
        '<span class="map-orb">' + A.icon('pin') + '</span>' +
        '<div><b>' + T('Location confirmation', 'स्थान की पुष्टि') + '</b>' +
        '<span>' + T('Drag the pin · approximate only', 'पिन खींचें · केवल अनुमान') + '</span></div>' +
      '</div>' + this.toolsHtml();
  };

  Booking.prototype.coverageStatus = function (info) {
    var zi = info.zoneInfo;
    var z = zi.zone;
    var b, sub;
    if (zi.inside) {
      b = badgeFor(z);
      if (b.cls === 'same') sub = T('Travel planned from the Gurugram base', 'गुरुग्राम आधार से यात्रा नियोजित');
      else if (b.cls === 'next') sub = T('Same-day cut-off has passed — pick tomorrow', 'सेम-डे समय सीमा बीत गई — कल चुनें');
      else sub = T('Travel planned in advance with the muhurat', 'मुहूर्त के साथ पहले से यात्रा नियोजित');
      return {
        cls: b.cls,
        title: zoneName(z),
        text: b.text,
        sub: sub + ' · ' + etaText(z)
      };
    }
    if (zi.distance <= 60) {
      return {
        cls: 'near',
        title: T('Nearest zone: ', 'निकटतम क्षेत्र: ') + zoneName(z),
        text: kmLabel(zi.distance, true),
        sub: availabilityText(z) + ' · ' + etaText(z)
      };
    }
    return {
      cls: 'out',
      title: T('Outside our NCR coverage', 'हमारे एनसीआर कवरेज से बाहर'),
      text: T('By appointment', 'अपॉइंटमेंट से'),
      sub: T('We will confirm travel with you on WhatsApp', 'हम व्हाट्सएप पर यात्रा की पुष्टि करेंगे')
    };
  };

  Booking.prototype.renderPanel = function () {
    var info = this.info();
    var place = info.place;
    var status = this.coverageStatus(info);
    var placeLabel = place ? placeName(place) : T('Unknown area', 'अज्ञात क्षेत्र');
    var placeMeta = place
      ? [stateName(place.state), place.approx ? T('approx. area', 'अनुमानित क्षेत्र') : T('known locality', 'ज्ञात इलाका'), kmLabel(place.distance, true) + ' ' + T('from the pin', 'पिन से')]
        .filter(Boolean).join(' · ')
      : '';

    this.panel.innerHTML =
      '<div class="map-booking__head">' +
        '<span class="map-kicker">' + T('Location check', 'स्थान जाँच') + '</span>' +
        '<h3>' + T('Confirm where the pandit should come', 'पुष्टि करें कि पंडित कहाँ आएँ') + '</h3>' +
        '<p>' + T('Drag the pin to your building or tap the map. This is a visual check for you — exact coordinates are never sent with the booking.', 'पिन को अपनी इमारत पर खींचें या मैप पर टैप करें। यह आपके लिए एक दृश्य पुष्टि है — बुकिंग के साथ सटीक निर्देशांक कभी नहीं भेजे जाते।') + '</p>' +
      '</div>' +
      '<div class="map-place">' +
        '<span class="map-place__icon">' + A.icon('pin') + '</span>' +
        '<div><span class="map-kicker">' + T('Nearest known area', 'निकटतम ज्ञात क्षेत्र') + '</span>' +
        '<b>' + esc(placeLabel) + '</b>' +
        '<span class="map-place__meta">' + esc(placeMeta) + '</span></div>' +
      '</div>' +
      '<div class="map-facts map-facts--stack">' +
        '<div><span>' + T('City centre', 'शहर का केंद्र') + '</span><b>' + esc(A.placeName ? A.placeName(info.city.name) : info.city.name) + ' · ' + kmLabel(info.cityDistance) + '</b></div>' +
        '<div><span>' + T('Coverage', 'कवरेज') + '</span><b class="map-status map-status--' + status.cls + '">' + esc(status.title) + '</b><small>' + esc(status.sub) + '</small></div>' +
        '<div><span>' + T('Coordinates', 'निर्देशांक') + '</span><b class="map-coords">' + this.pin.lat.toFixed(4) + ', ' + this.pin.lon.toFixed(4) + '</b><small>' + T('Not sent with your booking', 'बुकिंग के साथ नहीं भेजे जाते') + '</small></div>' +
      '</div>' +
      '<div class="map-actions map-actions--wrap">' +
        '<button class="map-btn map-btn--solid" type="button" data-mv-locate>' + A.icon('pin') + '<span>' + T('Use my location', 'मेरा स्थान') + '</span></button>' +
        '<button class="map-btn" type="button" data-mv-reset>' + A.icon('compass') + '<span>' + T('Reset pin', 'पिन रीसेट करें') + '</span></button>' +
        '<button class="map-btn" type="button" data-mv-add>' + A.icon('check') + '<span>' + T('Add area to address', 'क्षेत्र पते में जोड़ें') + '</span></button>' +
      '</div>' +
      '<p class="map-privacy">' + A.icon('lock') + '<span>' + T('Only your typed address is shared with the pandit. The pin stays on this device.', 'पंडित के साथ केवल आपका लिखा पता साझा किया जाता है। पिन इसी डिवाइस पर रहता है।') + '</span></p>';
  };

  Booking.prototype.renderFoot = function () {
    this.foot.innerHTML =
      '<span class="map-foot__note">' + A.icon('info') + '<span>' +
      T('The pin is for your confirmation only. We verify the address and gate details on WhatsApp before the muhurat.', 'पिन केवल आपकी पुष्टि के लिए है। मुहूर्त से पहले हम व्हाट्सएप पर पता और गेट विवरण सत्यापित करते हैं।') +
      '</span></span>' +
      '<span class="map-credit" data-no-i18n>Map data © OpenStreetMap contributors</span>';
  };

  Booking.prototype.bind = function () {
    var self = this;
    this.el.addEventListener('click', function (e) {
      if (closest(e.target, '[data-mv-locate]')) { self.start(); self.locateBooking(); return; }
      if (closest(e.target, '[data-mv-reset]')) { self.resetPin(); return; }
      if (closest(e.target, '[data-mv-add]')) { self.addArea(); return; }
      if (closest(e.target, '[data-mv-schematic]')) {
        self.setMode(self.mode === 'schematic' ? 'map' : 'schematic', false);
      }
    });
  };

  Booking.prototype.watchPick = function () {
    var self = this;
    var sel = doc.getElementById('bookingCity');
    if (!sel) return;
    sel.addEventListener('change', function () {
      self.city = self.readCity();
      self.userDragged = false;
      self.source = 'city';
      self.setPin(self.city.lat, self.city.lon, 'city', { recenter: true, zoom: 12 });
    });
  };

  Booking.prototype.watchAddress = function () {
    var self = this;
    var input = doc.getElementById('bookAddress');
    if (!input) return;
    input.addEventListener('input', function () {
      if (self.userDragged) return;
      if (self.addrTimer) clearTimeout(self.addrTimer);
      self.addrTimer = setTimeout(function () {
        if (self.userDragged) return;
        var match = matchAddress(input.value);
        if (!match) return;
        if (distKm(match, self.city) > 120) return;
        self.setPin(match.lat, match.lon, 'address', { recenter: true, zoom: self.map && self.map.getZoom() > 13 ? self.map.getZoom() : 14 });
      }, 340);
    });
  };

  Booking.prototype.setPin = function (lat, lon, source, opts) {
    opts = opts || {};
    this.pin = { lat: lat, lon: lon };
    this.source = source;
    if (source === 'drag') this.userDragged = true;
    if (this.pinMarker) {
      this.pinMarker.setLatLng([lat, lon]);
      this.pinMarker.setTooltipContent(T('Your pin', 'आपका पिन'));
    }
    if (this.map && opts.recenter) {
      if (opts.zoom && this.map.getZoom() !== opts.zoom) this.map.setView([lat, lon], opts.zoom, { animate: false });
      else this.map.panTo([lat, lon], { animate: false });
    }
    this.drawCoverage();
    this.renderPanel();
    this.renderSchematic();
  };

  Booking.prototype.resetPin = function () {
    this.userDragged = false;
    this.city = this.readCity();
    this.setPin(this.city.lat, this.city.lon, 'city', { recenter: true, zoom: 12 });
    A.toast(T('Pin reset to the city centre', 'पिन शहर के केंद्र पर रीसेट हो गई'));
  };

  Booking.prototype.addArea = function () {
    var input = doc.getElementById('bookAddress');
    if (!input) return;
    var info = this.info();
    var name = info.place ? placeName(info.place) : '';
    if (!name) return;
    var current = input.value.trim();
    if (keyName(current).indexOf(keyName(name)) >= 0) {
      A.toast(T('That area is already in your address', 'यह क्षेत्र आपके पते में पहले से है'));
      return;
    }
    input.value = (current ? current.replace(/[,\s]+$/, '') + ', ' : '') + name;
    this.userDragged = true;
    A.toast(T('Area added to your address', 'क्षेत्र आपके पते में जोड़ दिया गया'));
  };

  Booking.prototype.locateBooking = function () {
    var self = this;
    this.locate(function (lat, lon) {
      self.userDragged = true;
      self.setPin(lat, lon, 'geolocation', { recenter: true, zoom: 15 });
      A.toast(T('Pin moved to your current location', 'पिन आपके वर्तमान स्थान पर चली गई'));
    });
  };

  Booking.prototype.initMap = function () {
    var self = this;
    var L = root.L;
    var map = this.createMap(this.pin, 12, this);

    var icon = L.divIcon({
      className: 'map-pin-wrap',
      html: '<span class="map-pin map-pin--drop"><i></i></span>',
      iconSize: [34, 44], iconAnchor: [17, 42]
    });
    this.pinMarker = L.marker([this.pin.lat, this.pin.lon], {
      icon: icon,
      draggable: true,
      autoPan: true,
      keyboard: true,
      riseOnHover: true,
      title: T('Your pin', 'आपका पिन'),
      zIndexOffset: 600
    }).addTo(map);
    this.pinMarker.bindTooltip(T('Your pin', 'आपका पिन'), { direction: 'top', offset: [0, -34] });
    this.pinMarker.on('dragend', function () {
      var ll = self.pinMarker.getLatLng();
      self.setPin(ll.lat, ll.lng, 'drag');
      A.toast(T('Pin moved — check the nearest area', 'पिन खिसक गई — निकटतम क्षेत्र देखें'));
    });
    map.on('click', function (e) {
      self.setPin(e.latlng.lat, e.latlng.lng, 'drag');
    });

    if (this.userPoint) this.setYou(this.userPoint.lat, this.userPoint.lon);
    this.drawCoverage(true);
    this.bindMapResize();
  };

  Booking.prototype.bindMapResize = function () {
    var self = this;
    if (!this.map || this._resizeBound) return;
    this._resizeBound = true;
    this.map.on('resize', function () { self.invalidateSoon(); });
  };

  Booking.prototype.drawCoverage = function (initial) {
    if (!this.map) return;
    var L = root.L;
    var info = nearestZone(this.pin.lat, this.pin.lon);
    var z = info.zone;
    if (!info.inside && info.distance > 60) {
      if (this.covCircle) { this.map.removeLayer(this.covCircle); this.covCircle = null; }
      return;
    }
    if (!this.covCircle) {
      this.covCircle = L.circle([z.lat, z.lon], {
        radius: z.radius,
        color: z.color,
        weight: 1.6,
        opacity: 0.7,
        fillColor: z.color,
        fillOpacity: 0.08,
        interactive: false,
        dashArray: '5 6'
      }).addTo(this.map);
    } else {
      this.covCircle.setLatLng([z.lat, z.lon]);
      this.covCircle.setRadius(z.radius);
      this.covCircle.setStyle({ color: z.color, fillColor: z.color });
    }
    if (initial && !info.inside && this.map && !this.map.getBounds().contains([this.pin.lat, this.pin.lon])) {
      this.map.panTo([this.pin.lat, this.pin.lon]);
    }
  };

  Booking.prototype.renderSchematic = function () {
    if (!this.schematicEl) return;
    var cx = 210, cy = 210, maxKm = 16, scale = 180 / maxKm;
    var city = this.city || BASE;
    var pin = this.pin || { lat: city.lat, lon: city.lon };
    var d = distKm(city, pin);
    var rings = [1, 3, 7, 15].map(function (km) {
      var r = +(km * scale).toFixed(1);
      return '<circle class="map-ring" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
        '<text class="map-ring-label" x="' + cx + '" y="' + (cy - r - 5) + '" text-anchor="middle">' + km + ' ' + T('km', 'किमी') + '</text>';
    }).join('');
    var p = projectKm(pin.lat, pin.lon, city, scale, cx, cy, maxKm * 0.92);
    var outside = d > maxKm * 0.92;

    this.schematicEl.innerHTML =
      '<svg class="map-svg" viewBox="0 0 420 420" role="img" aria-label="' +
        esc(T('Schematic location chart: your pin and the city centre with distance rings.', 'स्केमैटिक स्थान चार्ट: आपका पिन और शहर का केंद्र, दूरी के छल्लों के साथ।')) + '">' +
        '<circle class="map-ring map-ring--soft" cx="' + cx + '" cy="' + cy + '" r="' + (maxKm * scale).toFixed(1) + '"/>' +
        rings +
        '<line class="map-spoke map-spoke--active" x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '"/>' +
        '<circle class="map-sbase" cx="' + cx + '" cy="' + cy + '" r="5"/>' +
        '<circle class="map-sbase__halo" cx="' + cx + '" cy="' + cy + '" r="11"/>' +
        '<text class="map-sbase__label" x="' + cx + '" y="' + (cy + 25) + '" text-anchor="middle">' + esc(A.placeName ? A.placeName(city.name) : city.name) + '</text>' +
        '<g class="map-spin' + (this.userDragged ? ' is-moved' : '') + '">' +
          '<circle class="map-spin__halo" cx="' + p.x + '" cy="' + p.y + '" r="12"/>' +
          '<circle class="map-spin__dot" cx="' + p.x + '" cy="' + p.y + '" r="6"/>' +
          '<text class="map-spin__label" x="' + p.x + '" y="' + (p.y - 18) + '" text-anchor="middle">' + T('Your pin', 'आपका पिन') + '</text>' +
        '</g>' +
        (outside ? '<text class="map-spin__outside" x="' + cx + '" y="' + (cy + 300) + '" text-anchor="middle">' + T('Pin is beyond this chart · ', 'पिन इस चार्ट से आगे है · ') + kmLabel(d) + '</text>' : '') +
        svgNorth(cx, 28) +
      '</svg>';
  };

  Booking.prototype.refreshMapText = function () {
    if (this.pinMarker) {
      this.pinMarker.setTooltipContent(T('Your pin', 'आपका पिन'));
      this.pinMarker.options.title = T('Your pin', 'आपका पिन');
      var iconEl = this.pinMarker.getElement && this.pinMarker.getElement();
      if (iconEl) iconEl.setAttribute('title', T('Your pin', 'आपका पिन'));
    }
  };

  /* ==================================================================== boot */
  function init() {
    var nodes = A.$$('[data-map]');
    if (!nodes.length) return;
    nodes.forEach(function (el) {
      var kind = el.getAttribute('data-map');
      try {
        if (kind === 'coverage') widgets.push(new Coverage(el));
        else if (kind === 'booking') widgets.push(new Booking(el));
      } catch (e) {
        el.classList.add('map-card--error');
        var panel = el.querySelector('[data-map-panel]');
        if (panel) {
          panel.innerHTML = '<p class="map-privacy">' + A.icon('alert') + '<span>' +
            T('The map could not start on this device. All coverage and booking details are still available.', 'इस डिवाइस पर मैप शुरू नहीं हो सका। कवरेज और बुकिंग विवरण अभी भी उपलब्ध हैं।') +
            '</span></p>';
        }
      }
    });
    if (A.onLang) {
      A.onLang(function () {
        widgets.forEach(function (w) { try { w.onLang(); } catch (e) { /* keep page usable */ } });
      });
    }
    root.addEventListener('offline', function () {
      widgets.forEach(function (w) {
        if (w.mode === 'map') { w.noteKey = 'offline'; w.setMode('schematic', true); }
      });
    });
  }

  root.VedicMap = {
    zones: ZONES,
    base: BASE,
    distance: distKm,
    nearestPlace: nearestPlace,
    nearestZone: nearestZone,
    matchAddress: matchAddress,
    open: function (id) {
      widgets.forEach(function (w) {
        if (w instanceof Coverage && id) w.selectZone(id, true);
      });
    },
    widgets: widgets
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
