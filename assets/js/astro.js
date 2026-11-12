/* ==========================================================================
   Vedic Pooja — Vedic Astronomy Engine (pure JS, no dependencies)
   Sidereal calculations use the Lahiri (Chitrapaksha) ayanamsa.
   Accuracy: Sun ~0.01°, Moon ~0.02°, planets ~0.1° — suitable for
   panchang, kundli display, muhurat and matching utilities.

   Every displayed value is derived here — no hard-coded panchang rows.
   Time zones accept a fixed offset (5.5) or an IANA name (Asia/Kolkata,
   Europe/London, America/New_York) so DST cities stay correct all year.
   ========================================================================== */
(function (root, factory) {
  root.Vedic = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var sin = function (d) { return Math.sin(d * RAD); };
  var cos = function (d) { return Math.cos(d * RAD); };
  var tan = function (d) { return Math.tan(d * RAD); };
  var asin = function (x) { return Math.asin(Math.max(-1, Math.min(1, x))) * DEG; };
  var atan2 = function (y, x) { return Math.atan2(y, x) * DEG; };
  var norm = function (a) { a = a % 360; return a < 0 ? a + 360 : a; };
  var sign180 = function (a) { a = norm(a); return a > 180 ? a - 360 : a; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  var UNIX_JD = 2440587.5;
  var jdOf = function (ms) { return ms / 86400000 + UNIX_JD; };
  var msOf = function (jd) { return (jd - UNIX_JD) * 86400000; };

  /* Optional high-precision ephemeris. kundli.html loads the MIT-licensed
     Astronomy Engine before astro.js; every other page keeps the lightweight
     built-in series below. Both paths return apparent tropical longitude of
     date, so the Lahiri subtraction and all downstream maths stay identical. */
  var AE = (typeof window !== 'undefined' && window.Astronomy) || null;
  var AE_BODIES = null;
  function aeBodies() {
    if (!AE || !AE.Body) return null;
    if (!AE_BODIES) {
      AE_BODIES = {
        Su: AE.Body.Sun, Mo: AE.Body.Moon, Ma: AE.Body.Mars, Me: AE.Body.Mercury,
        Ju: AE.Body.Jupiter, Ve: AE.Body.Venus, Sa: AE.Body.Saturn
      };
    }
    return AE_BODIES;
  }

  /* ---------------------------------------------------------------- names */
  var RASHIS = [
    { n: 'Aries', s: 'Mesha', hi: 'मेष', lord: 'Mars' },
    { n: 'Taurus', s: 'Vrishabha', hi: 'वृषभ', lord: 'Venus' },
    { n: 'Gemini', s: 'Mithuna', hi: 'मिथुन', lord: 'Mercury' },
    { n: 'Cancer', s: 'Karka', hi: 'कर्क', lord: 'Moon' },
    { n: 'Leo', s: 'Simha', hi: 'सिंह', lord: 'Sun' },
    { n: 'Virgo', s: 'Kanya', hi: 'कन्या', lord: 'Mercury' },
    { n: 'Libra', s: 'Tula', hi: 'तुला', lord: 'Venus' },
    { n: 'Scorpio', s: 'Vrishchika', hi: 'वृश्चिक', lord: 'Mars' },
    { n: 'Sagittarius', s: 'Dhanu', hi: 'धनु', lord: 'Jupiter' },
    { n: 'Capricorn', s: 'Makara', hi: 'मकर', lord: 'Saturn' },
    { n: 'Aquarius', s: 'Kumbha', hi: 'कुंभ', lord: 'Saturn' },
    { n: 'Pisces', s: 'Meena', hi: 'मीन', lord: 'Jupiter' }
  ];

  var NAKSHATRAS = [
    { n: 'Ashwini', lord: 'Ketu', yoni: 'Horse', gana: 'Deva', nadi: 'Adi', deity: 'Ashwini Kumaras', symbol: "Horse's head", nature: 'Kshipra' },
    { n: 'Bharani', lord: 'Venus', yoni: 'Elephant', gana: 'Manushya', nadi: 'Madhya', deity: 'Yama', symbol: 'Yoni / vulva', nature: 'Ugra' },
    { n: 'Krittika', lord: 'Sun', yoni: 'Sheep', gana: 'Rakshasa', nadi: 'Antya', deity: 'Agni', symbol: 'Knife / flame', nature: 'Mishra' },
    { n: 'Rohini', lord: 'Moon', yoni: 'Serpent', gana: 'Manushya', nadi: 'Antya', deity: 'Brahma / Prajapati', symbol: 'Ox-cart', nature: 'Dhruva' },
    { n: 'Mrigashira', lord: 'Mars', yoni: 'Serpent', gana: 'Deva', nadi: 'Madhya', deity: 'Soma', symbol: "Deer's head", nature: 'Mridu' },
    { n: 'Ardra', lord: 'Rahu', yoni: 'Dog', gana: 'Manushya', nadi: 'Adi', deity: 'Rudra', symbol: 'Teardrop', nature: 'Tikshna' },
    { n: 'Punarvasu', lord: 'Jupiter', yoni: 'Cat', gana: 'Deva', nadi: 'Adi', deity: 'Aditi', symbol: 'Bow & quiver', nature: 'Chara' },
    { n: 'Pushya', lord: 'Saturn', yoni: 'Sheep', gana: 'Deva', nadi: 'Madhya', deity: 'Brihaspati', symbol: "Cow's udder / lotus", nature: 'Kshipra' },
    { n: 'Ashlesha', lord: 'Mercury', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Antya', deity: 'Nagas', symbol: 'Coiled serpent', nature: 'Tikshna' },
    { n: 'Magha', lord: 'Ketu', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Antya', deity: 'Pitris', symbol: 'Royal throne', nature: 'Ugra' },
    { n: 'Purva Phalguni', lord: 'Venus', yoni: 'Rat', gana: 'Manushya', nadi: 'Madhya', deity: 'Bhaga', symbol: 'Front of a bed', nature: 'Ugra' },
    { n: 'Uttara Phalguni', lord: 'Sun', yoni: 'Cow', gana: 'Manushya', nadi: 'Adi', deity: 'Aryaman', symbol: 'Back of a bed', nature: 'Dhruva' },
    { n: 'Hasta', lord: 'Moon', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi', deity: 'Savitar', symbol: 'Hand', nature: 'Kshipra' },
    { n: 'Chitra', lord: 'Mars', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', deity: 'Tvashtar / Vishwakarma', symbol: 'Bright jewel', nature: 'Mridu' },
    { n: 'Swati', lord: 'Rahu', yoni: 'Buffalo', gana: 'Deva', nadi: 'Antya', deity: 'Vayu', symbol: 'Young sprout', nature: 'Chara' },
    { n: 'Vishakha', lord: 'Jupiter', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Antya', deity: 'Indra-Agni', symbol: 'Triumphal arch', nature: 'Mishra' },
    { n: 'Anuradha', lord: 'Saturn', yoni: 'Deer', gana: 'Deva', nadi: 'Madhya', deity: 'Mitra', symbol: 'Lotus', nature: 'Mridu' },
    { n: 'Jyeshtha', lord: 'Mercury', yoni: 'Deer', gana: 'Rakshasa', nadi: 'Adi', deity: 'Indra', symbol: 'Earring / talisman', nature: 'Tikshna' },
    { n: 'Mula', lord: 'Ketu', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Adi', deity: 'Nirriti', symbol: 'Tied roots', nature: 'Tikshna' },
    { n: 'Purva Ashadha', lord: 'Venus', yoni: 'Monkey', gana: 'Manushya', nadi: 'Madhya', deity: 'Apas (waters)', symbol: 'Winnowing fan', nature: 'Ugra' },
    { n: 'Uttara Ashadha', lord: 'Sun', yoni: 'Mongoose', gana: 'Manushya', nadi: 'Antya', deity: 'Vishvedevas', symbol: 'Elephant tusk', nature: 'Dhruva' },
    { n: 'Shravana', lord: 'Moon', yoni: 'Monkey', gana: 'Deva', nadi: 'Antya', deity: 'Vishnu', symbol: 'Ear / three footprints', nature: 'Chara' },
    { n: 'Dhanishtha', lord: 'Mars', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Madhya', deity: 'Vasus', symbol: 'Drum', nature: 'Chara' },
    { n: 'Shatabhisha', lord: 'Rahu', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Adi', deity: 'Varuna', symbol: 'Empty circle', nature: 'Chara' },
    { n: 'Purva Bhadrapada', lord: 'Jupiter', yoni: 'Lion', gana: 'Manushya', nadi: 'Adi', deity: 'Aja Ekapada', symbol: 'Front legs of a cot', nature: 'Ugra' },
    { n: 'Uttara Bhadrapada', lord: 'Saturn', yoni: 'Cow', gana: 'Manushya', nadi: 'Madhya', deity: 'Ahirbudhnya', symbol: 'Back legs of a cot', nature: 'Dhruva' },
    { n: 'Revati', lord: 'Mercury', yoni: 'Elephant', gana: 'Deva', nadi: 'Antya', deity: 'Pushan', symbol: 'Fish / drum', nature: 'Mridu' }
  ];

  var TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];

  /* The 15 base tithis. Nanda / Bhadra / Jaya / Rikta / Purna is the classical
     five-fold classification; Rikta (4, 9, 14) is avoided for new beginnings.
     The 30-day list is built below with the Krishna-paksha names. */
  var TITHI_BASE = [
    { name: 'Pratipada', hi: 'प्रतिपदा', meaning: 'The first step', deity: 'Agni', nature: 'Nanda', shubh: true,
      guidance: 'Begin new work, sign agreements, start a course or open a shop. The day favours first steps and fresh sankalpa.' },
    { name: 'Dwitiya', hi: 'द्वितीया', meaning: 'Foundation', deity: 'Brahma', nature: 'Bhadra', shubh: true,
      guidance: 'Good for savings, investments, house-warming and laying a foundation. Steady, accumulative energy.' },
    { name: 'Tritiya', hi: 'तृतीया', meaning: 'Growth', deity: 'Gauri', nature: 'Jaya', shubh: true,
      guidance: 'A victory tithi — weddings, engagements, travel, gold purchase and creative launches are supported.' },
    { name: 'Chaturthi', hi: 'चतुर्थी', meaning: 'Obstacle & removal', deity: 'Ganesha', nature: 'Rikta', shubh: false,
      guidance: 'Worship Ganesha to clear obstacles. Rikta tithi: avoid long journeys, marriages and major new starts; good for removal, surgery and litigation.' },
    { name: 'Panchami', hi: 'पंचमी', meaning: 'Nourishment', deity: 'Nagas', nature: 'Purna', shubh: true,
      guidance: 'A complete tithi for learning, medicine, ceremonies and hospitality. Nag Panchami and Vasant Panchami fall here.' },
    { name: 'Shashthi', hi: 'षष्ठी', meaning: 'Victory & service', deity: 'Kartikeya', nature: 'Nanda', shubh: true,
      guidance: 'Good for competition, court matters, health rituals and service. Kartikeya worship strengthens courage.' },
    { name: 'Saptami', hi: 'सप्तमी', meaning: 'Movement', deity: 'Surya', nature: 'Bhadra', shubh: true,
      guidance: 'Favourable for travel, vehicle purchase, business movement and friendly agreements. Surya worship brings clarity.' },
    { name: 'Ashtami', hi: 'अष्टमी', meaning: 'Transformation', deity: 'Shiva / Durga', nature: 'Jaya', shubh: true,
      guidance: 'Powerful for Durga and Shiva worship. Mixed for brand-new ventures — best used for courage, protection and inner work.' },
    { name: 'Navami', hi: 'नवमी', meaning: 'Courage & dharma', deity: 'Durga', nature: 'Rikta', shubh: false,
      guidance: 'Durga pooja and remedies thrive, but Rikta tithi: avoid marriage, mundan and major purchases. Ram Navami falls here.' },
    { name: 'Dashami', hi: 'दशमी', meaning: 'Success', deity: 'Dharma', nature: 'Purna', shubh: true,
      guidance: 'A fulfilment tithi for goals, donations, ceremonies and Vijayadashami. Good for concluding what was begun.' },
    { name: 'Ekadashi', hi: 'एकादशी', meaning: 'Devotion & fasting', deity: 'Vishnu', nature: 'Nanda', shubh: true,
      guidance: 'Fast and remember Vishnu. Excellent for japa, daan and self-study; avoid grain, marriage and heavy travel.' },
    { name: 'Dwadashi', hi: 'द्वादशी', meaning: 'Completion', deity: 'Vishnu', nature: 'Bhadra', shubh: true,
      guidance: 'Generosity and Vishnu pooja. Good for donations, temple work, annadaan and family ceremonies.' },
    { name: 'Trayodashi', hi: 'त्रयोदशी', meaning: 'Joy & love', deity: 'Kama / Shiva', nature: 'Jaya', shubh: true,
      guidance: 'Pradosh vrat and Shiva worship. Favourable for celebrations, romance, music and reconciliation.' },
    { name: 'Chaturdashi', hi: 'चतुर्दशी', meaning: 'Intensity', deity: 'Shiva', nature: 'Rikta', shubh: false,
      guidance: 'Shiva and protective rituals, especially Maha Shivratri. Rikta tithi: avoid new ventures, marriage and long travel.' },
    { name: 'Purnima', hi: 'पूर्णिमा', meaning: 'Fullness', deity: 'Chandra / Vishnu', nature: 'Purna', shubh: true,
      guidance: 'Satyanarayan Katha, charity, meditation and family blessings. The mind is receptive; avoid intoxicants and harsh speech.' },
    { name: 'Amavasya', hi: 'अमावस्या', meaning: 'Stillness', deity: 'Pitris / Shiva', nature: 'Purna', shubh: false,
      guidance: 'Pitru tarpan, shraddha and introspection. Not for auspicious beginnings, marriage or travel; excellent for ancestor remembrance and letting go.' }
  ];

  function tithiMeta(index) {
    var i = ((index % 30) + 30) % 30;
    var paksha = i < 15 ? 'Shukla' : 'Krishna';
    var base = TITHI_BASE[i % 15];
    if (i === 29) base = TITHI_BASE[15];
    var name = i === 14 ? 'Purnima' : i === 29 ? 'Amavasya' : base.name;
    return {
      index: i, name: name, hi: base.hi, meaning: base.meaning, deity: base.deity,
      nature: base.nature, shubh: base.shubh, guidance: base.guidance, paksha: paksha
    };
  }

  var YOGAS = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];

  var YOGA_MEANINGS = [
    'Support that can also obstruct', 'Affection and friendship', 'Long life and health',
    'Good fortune', 'Beauty and charm', 'Great obstacles', 'Good deeds', 'Steadiness',
    'Pain and conflict', 'Blockage', 'Growth and increase', 'Fixed and stable',
    'Injury and sudden loss', 'Joy and delight', 'Conflict and hardness', 'Accomplishment',
    'Calamity', 'Comfort and rest', 'Obstruction', 'Auspiciousness', 'Perfection',
    'Achievable goals', 'Auspiciousness', 'Brightness', 'Creative expansion',
    'Leadership and power', 'Calamity at the end'
  ];
  var YOGA_BAD = [0, 5, 8, 9, 12, 14, 16, 18, 26]; // Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti

  var KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

  var KARANA_META = {
    Bava: { meaning: 'Creative and supportive', shubh: true },
    Balava: { meaning: 'Strong and protective', shubh: true },
    Kaulava: { meaning: 'Friendly and social', shubh: true },
    Taitila: { meaning: 'Prosperous and steady', shubh: true },
    Gara: { meaning: 'Productive and grounded', shubh: true },
    Vanija: { meaning: 'Business and trade', shubh: true },
    Vishti: { meaning: 'Bhadra — hold new beginnings', shubh: false },
    Shakuni: { meaning: 'Sharp and unpredictable', shubh: false },
    Chatushpada: { meaning: 'Heavy and obstructing', shubh: false },
    Naga: { meaning: 'Binding and restless', shubh: false },
    Kimstughna: { meaning: 'Mixed and transitional', shubh: true }
  };

  var PLANETS = [
    { k: 'Su', n: 'Sun', hi: 'सूर्य', short: 'Su' },
    { k: 'Mo', n: 'Moon', hi: 'चंद्र', short: 'Mo' },
    { k: 'Ma', n: 'Mars', hi: 'मंगल', short: 'Ma' },
    { k: 'Me', n: 'Mercury', hi: 'बुध', short: 'Me' },
    { k: 'Ju', n: 'Jupiter', hi: 'गुरु', short: 'Ju' },
    { k: 'Ve', n: 'Venus', hi: 'शुक्र', short: 'Ve' },
    { k: 'Sa', n: 'Saturn', hi: 'शनि', short: 'Sa' },
    { k: 'Ra', n: 'Rahu', hi: 'राहु', short: 'Ra' },
    { k: 'Ke', n: 'Ketu', hi: 'केतु', short: 'Ke' }
  ];

  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

  var MONTHS = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];

  var VIMSHOTTARI = [
    { lord: 'Ketu', years: 7 },
    { lord: 'Venus', years: 20 },
    { lord: 'Sun', years: 6 },
    { lord: 'Moon', years: 10 },
    { lord: 'Mars', years: 7 },
    { lord: 'Rahu', years: 18 },
    { lord: 'Jupiter', years: 16 },
    { lord: 'Saturn', years: 19 },
    { lord: 'Mercury', years: 17 }
  ];

  /* ------------------------------------------------------------- astronomy */
  function julianCenturies(jd) { return (jd - 2451545.0) / 36525.0; }

  function obliquity(jd) {
    var T = julianCenturies(jd);
    return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
  }

  function gmst(jd) {
    var T = julianCenturies(jd);
    var g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T - (T * T * T) / 38710000;
    return norm(g);
  }

  function ayanamsa(jd) {
    var T = julianCenturies(jd);
    return 23.85236 + 1.39686 * T + 0.00013 * T * T;
  }

  function sunTropical(jd) {
    var T = julianCenturies(jd);
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
      (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    var omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  function moonTropical(jd) {
    var T = julianCenturies(jd);
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - Math.pow(T, 4) / 65194000;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - Math.pow(T, 4) / 113065000;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - Math.pow(T, 4) / 14712000;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + Math.pow(T, 4) / 863310000;

    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var terms = [
      [6288774, 0, 0, 1, 0], [1274027, 2, 0, -1, 0], [658314, 2, 0, 0, 0],
      [213618, 0, 0, 2, 0], [-185116, 0, 1, 0, 0], [-114332, 0, 0, 0, 2],
      [58793, 2, 0, -2, 0], [57066, 2, -1, -1, 0], [53322, 2, 0, 1, 0],
      [45758, 2, -1, 0, 0], [-40923, 0, 1, -1, 0], [-34720, 1, 0, 0, 0],
      [-30383, 0, 1, 1, 0], [15327, 2, 0, 0, -2], [-12528, 0, 0, 1, 2],
      [10980, 0, 0, 1, -2], [10675, 4, 0, -1, 0], [10034, 0, 0, 3, 0],
      [8548, 4, 0, -2, 0], [-7888, 2, 1, -1, 0], [-6766, 2, 1, 0, 0],
      [-5163, 1, 0, -1, 0], [4987, 1, 1, 0, 0], [4036, 2, -1, 1, 0],
      [3994, 2, 0, 2, 0], [3861, 4, 0, 0, 0], [3665, 2, 0, -3, 0],
      [-2689, 0, 1, -2, 0], [-2602, 2, 0, -1, 2], [2390, 2, -1, -2, 0],
      [-2348, 1, 0, 1, 0], [-2236, 2, -2, 0, 0], [-2120, 0, 1, 2, 0],
      [-2069, 0, 2, 0, 0], [2048, 2, -2, -1, 0], [-1773, 2, 0, 1, -2],
      [-1595, 2, 0, 0, 2], [1215, 4, -1, -1, 0], [-1110, 0, 0, 2, 2],
      [-892, 3, 0, -1, 0], [-810, 2, 1, 1, 0], [759, 4, -1, -2, 0],
      [-713, 0, 2, -1, 0], [-700, 2, 2, -1, 0], [691, 2, 1, -2, 0],
      [596, 2, -1, 0, -2], [549, 4, 0, 1, 0], [537, 0, 0, 4, 0],
      [520, 4, -1, 0, 0], [-487, 1, 0, -2, 0], [-399, 2, 1, 0, -2],
      [-381, 0, 0, 2, -2], [351, 1, 1, 1, 0], [-340, 3, 0, -2, 0],
      [330, 4, 0, -3, 0], [327, 2, -1, 2, 0], [-323, 0, 2, 1, 0],
      [299, 1, 1, -1, 0], [294, 2, 0, 3, 0]
    ];
    var sum = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var arg = t[1] * D + t[2] * M + t[3] * Mp + t[4] * F;
      var coef = t[0];
      if (t[2] === 1 || t[2] === -1) coef *= E;
      if (t[2] === 2 || t[2] === -2) coef *= E * E;
      sum += coef * sin(arg);
    }
    return norm(Lp + sum / 1000000);
  }

  /* JPL approximate heliocentric elements (J2000 ecliptic) */
  var ELEMENTS = {
    Me: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
    Ve: [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    Ea: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0.0, 0.0],
    Ma: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
    Ju: [5.20288700, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
    Sa: [9.53667594, -0.00125060, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794]
  };

  function helio(el, T) {
    var a = el[0] + el[1] * T, e = el[2] + el[3] * T;
    var I = el[4] + el[5] * T, L = el[6] + el[7] * T;
    var peri = el[8] + el[9] * T, node = el[10] + el[11] * T;
    var M = norm(L - peri);
    var E = M * RAD;
    for (var i = 0; i < 12; i++) {
      var dE = (E - e * Math.sin(E) - M * RAD) / (1 - e * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-9) break;
    }
    var xp = a * (Math.cos(E) - e);
    var yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    var w = (peri - node) * RAD, om = node * RAD, inc = I * RAD;
    var cw = Math.cos(w), sw = Math.sin(w), co = Math.cos(om), so = Math.sin(om), ci = Math.cos(inc), si = Math.sin(inc);
    return {
      x: (cw * co - sw * so * ci) * xp + (-sw * co - cw * so * ci) * yp,
      y: (cw * so + sw * co * ci) * xp + (-sw * so + cw * co * ci) * yp,
      z: (sw * si) * xp + (cw * si) * yp
    };
  }

  var PLANET_CACHE = {};

  function tropicalPositions(jd) {
    var key = jd.toFixed(4);
    if (PLANET_CACHE[key]) return PLANET_CACHE[key];
    var T = julianCenturies(jd);
    var out = {};
    var bodies = aeBodies();

    if (bodies && AE.GeoVector && AE.Ecliptic) {
      /* Apparent geocentric longitude of date, including light-time and
         aberration. This is the same quantity Swiss Ephemeris reports. */
      var when = new Date(msOf(jd));
      out.Su = norm(AE.SunPosition(when).elon);
      out.Mo = norm(AE.Ecliptic(AE.GeoVector(bodies.Mo, when, true)).elon);
      ['Me', 'Ve', 'Ma', 'Ju', 'Sa'].forEach(function (k) {
        out[k] = norm(AE.Ecliptic(AE.GeoVector(bodies[k], when, true)).elon);
      });
    } else {
      var earth = helio(ELEMENTS.Ea, T);
      var prec = 1.39686 * T; // accumulated general precession J2000 -> date
      out.Su = norm(sunTropical(jd));
      out.Mo = norm(moonTropical(jd));
      ['Me', 'Ve', 'Ma', 'Ju', 'Sa'].forEach(function (k) {
        var p = helio(ELEMENTS[k], T);
        var gx = p.x - earth.x, gy = p.y - earth.y, gz = p.z - earth.z;
        out[k] = norm(atan2(gy, gx) + prec);
      });
    }

    /* Mean lunar node — the standard Rahu/Ketu used by Lahiri panchangs. */
    var node = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + Math.pow(T, 3) / 467441 - Math.pow(T, 4) / 60616000;
    out.Ra = norm(node);
    out.Ke = norm(node + 180);

    PLANET_CACHE[key] = out;
    if (Object.keys(PLANET_CACHE).length > 400) PLANET_CACHE = {};
    return out;
  }

  function planetSet(jd) {
    var trop = tropicalPositions(jd);
    var ay = ayanamsa(jd);
    var before = tropicalPositions(jd - 0.5), after = tropicalPositions(jd + 0.5);
    var order = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    return order.map(function (k) {
      var speed = sign180(after[k] - before[k]) / 1;
      var meta = PLANETS.filter(function (p) { return p.k === k; })[0];
      var sid = norm(trop[k] - ay);
      return {
        key: k, name: meta.n, hi: meta.hi,
        lon: sid,
        tropical: trop[k],
        sign: Math.floor(sid / 30),
        degInSign: sid % 30,
        nakshatra: Math.floor(sid / (360 / 27)),
        pada: Math.floor((sid % (360 / 27)) / (360 / 108)) + 1,
        retro: k === 'Ra' || k === 'Ke' ? true : speed < 0,
        speed: speed
      };
    });
  }

  function ascendant(jd, lat, lon) {
    var T = julianCenturies(jd);
    var eps = obliquity(jd);
    var ramc = norm(gmst(jd) + lon);
    var asc = atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps)));
    asc = norm(asc);
    return { tropical: asc, sidereal: norm(asc - ayanamsa(jd)), mc: norm(atan2(sin(ramc), cos(ramc) * cos(eps))) };
  }

  /* ---------------------------------------------------- time / geo helpers */
  /* A place may carry either a fixed offset in hours (5.5) or an IANA zone
     name ('Asia/Kolkata', 'Europe/London'). IANA zones are resolved through
     Intl for the exact instant, so DST and historical offsets stay honest. */
  var ZONE_FMT = {}, OFFSET_CACHE = {};
  var HAS_INTL = (typeof Intl !== 'undefined' && Intl.DateTimeFormat);

  function offsetAt(ms, tz) {
    if (tz == null) return 5.5;
    if (typeof tz === 'number') return tz;
    if (!HAS_INTL) return 5.5;
    var bucket = tz + '|' + Math.floor(ms / 900000); // 15-minute cache buckets
    if (OFFSET_CACHE[bucket] != null) return OFFSET_CACHE[bucket];
    var off = 5.5;
    try {
      if (!ZONE_FMT[tz]) {
        ZONE_FMT[tz] = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit',
          day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
      var out = {};
      ZONE_FMT[tz].formatToParts(new Date(ms)).forEach(function (p) { out[p.type] = p.value; });
      var asUTC = Date.UTC(+out.year, +out.month - 1, +out.day, +out.hour, +out.minute, +out.second);
      off = (asUTC - ms) / 3600000;
    } catch (e) { off = 5.5; }
    OFFSET_CACHE[bucket] = off;
    return off;
  }

  function localToDate(y, m, d, hh, mm, place) {
    var tz = place && place.tz;
    var naive = Date.UTC(y, m - 1, d, hh, mm, 0, 0);
    var off = offsetAt(naive, tz);
    off = offsetAt(naive - off * 3600000, tz);
    return new Date(naive - off * 3600000);
  }

  function localParts(date, tz) {
    var off = offsetAt(date.getTime(), tz);
    var d = new Date(date.getTime() + off * 3600000);
    return {
      y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
      hh: d.getUTCHours(), mm: d.getUTCMinutes(), ss: d.getUTCSeconds(),
      wd: d.getUTCDay(), offset: off
    };
  }

  function dateKey(date, tz) {
    var p = localParts(date, tz);
    return p.y + '-' + pad(p.m) + '-' + pad(p.d);
  }

  function fmtTime(date, tz, opts) {
    if (!date) return '—';
    var p = localParts(date, tz);
    var h = p.hh, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    var s = pad(h) + ':' + pad(p.mm);
    if (opts && opts.seconds) s += ':' + pad(p.ss);
    return s + ' ' + ap;
  }

  function fmtDate(date, tz) {
    if (!date) return '—';
    var p = localParts(date, tz);
    return p.d + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.m - 1] + ' ' + p.y;
  }

  function fmtShort(date, tz) {
    if (!date) return '—';
    var p = localParts(date, tz);
    return p.d + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.m - 1];
  }

  function sunAltitude(jd, lat, lon) {
    var lam = sunTropical(jd), eps = obliquity(jd);
    var ra = atan2(cos(eps) * sin(lam), cos(lam));
    var dec = asin(sin(eps) * sin(lam));
    var H = norm(gmst(jd) + lon - ra);
    return asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H));
  }

  function findSunTimes(y, m, d, place) {
    var tz = place.tz == null ? 5.5 : place.tz;
    var start = localToDate(y, m, d, 0, 0, place).getTime();
    var step = 4 * 60000;
    var prev = sunAltitude(jdOf(start), place.lat, place.lon) + 0.833;
    var rise = null, set = null, prevT = start;
    for (var t = start + step; t <= start + 24 * 3600000; t += step) {
      var alt = sunAltitude(jdOf(t), place.lat, place.lon) + 0.833;
      if (prev < 0 && alt >= 0 && !rise) rise = bisectAlt(prevT, t, place);
      if (prev >= 0 && alt < 0 && !set) set = bisectAlt(prevT, t, place);
      prev = alt; prevT = t;
    }
    if (!rise) rise = localToDate(y, m, d, 6, 0, place);
    if (!set) set = localToDate(y, m, d, 18, 0, place);
    return { rise: rise, set: set, noon: new Date((rise.getTime() + set.getTime()) / 2) };
  }

  function bisectAlt(a, b, place) {
    var lo = jdOf(a), hi = jdOf(b);
    for (var i = 0; i < 26; i++) {
      var mid = (lo + hi) / 2;
      if (sunAltitude(mid, place.lat, place.lon) + 0.833 < 0) lo = mid; else hi = mid;
    }
    return new Date(msOf((lo + hi) / 2));
  }

  /* ------------------------------------------------------------- the Moon */
  function moonEquatorial(jd) {
    var lam = moonTropical(jd), eps = obliquity(jd);
    return {
      ra: atan2(cos(eps) * sin(lam), cos(lam)),
      dec: asin(sin(eps) * sin(lam))
    };
  }

  function moonAltitude(jd, lat, lon) {
    var m = moonEquatorial(jd);
    var H = norm(gmst(jd) + lon - m.ra);
    return asin(sin(lat) * sin(m.dec) + cos(lat) * cos(m.dec) * cos(H));
  }

  /* Moonrise / moonset use the standard lunar horizon of +0.125°
     (refraction + semi-diameter minus parallax). */
  function findMoonTimes(y, m, d, place) {
    var start = localToDate(y, m, d, 0, 0, place).getTime();
    var step = 5 * 60000;
    var h0 = 0.125;
    var prev = moonAltitude(jdOf(start), place.lat, place.lon) - h0;
    var rise = null, set = null, prevT = start;
    for (var t = start + step; t <= start + 24 * 3600000; t += step) {
      var alt = moonAltitude(jdOf(t), place.lat, place.lon) - h0;
      if (prev < 0 && alt >= 0 && !rise) rise = bisectMoon(prevT, t, place, true);
      if (prev >= 0 && alt < 0 && !set) set = bisectMoon(prevT, t, place, false);
      prev = alt; prevT = t;
    }
    return { rise: rise, set: set };
  }

  function bisectMoon(a, b, place, rising) {
    var lo = jdOf(a), hi = jdOf(b);
    for (var i = 0; i < 26; i++) {
      var mid = (lo + hi) / 2;
      var above = moonAltitude(mid, place.lat, place.lon) - 0.125 >= 0;
      if (rising ? above : !above) hi = mid; else lo = mid;
    }
    return new Date(msOf((lo + hi) / 2));
  }

  function moonPhaseInfo(elong) {
    var e = norm(elong);
    var illum = (1 - cos(e)) / 2;
    var name;
    if (e < 6 || e > 354) name = 'New Moon';
    else if (e < 84) name = 'Waxing Crescent';
    else if (e < 96) name = 'First Quarter';
    else if (e < 174) name = 'Waxing Gibbous';
    else if (e < 186) name = 'Full Moon';
    else if (e < 264) name = 'Waning Gibbous';
    else if (e < 276) name = 'Last Quarter';
    else name = 'Waning Crescent';
    return { name: name, illumination: illum, elongation: e };
  }

  /* ---------------------------------------------------------------- angles */
  function elongAt(jd) { return norm(moonTropical(jd) - sunTropical(jd)); }

  function nextCrossing(fn, target, fromJD, maxDays) {
    target = norm(target);
    var jd = fromJD;
    var prev = sign180(fn(jd) - target);
    var step = 1 / 24;
    var limit = Math.round((maxDays || 6) * 24);
    for (var i = 0; i < limit; i++) {
      var njd = jd + step;
      var cur = sign180(fn(njd) - target);
      if (prev < 0 && cur >= 0) {
        var lo = jd, hi = njd;
        for (var k = 0; k < 38; k++) {
          var mid = (lo + hi) / 2;
          if (sign180(fn(mid) - target) < 0) lo = mid; else hi = mid;
        }
        return new Date(msOf((lo + hi) / 2));
      }
      jd = njd; prev = cur;
    }
    return null;
  }

  function findNewMoon(jd) {
    var e = elongAt(jd);
    var start = jd - e / 12.19 - 2;
    return nextCrossing(elongAt, 0, start, 40);
  }

  function lunarMonth(jd) {
    var nm = findNewMoon(jd);
    var nmJD = jdOf(nm.getTime());
    var sunSid = norm(sunTropical(nmJD) - ayanamsa(nmJD));
    var sign = Math.floor(sunSid / 30);
    var num = ((sign - 11 + 12) % 12) + 1;
    var prev = nextCrossing(elongAt, 0, nmJD - 31, 12);
    var prevNum = null;
    if (prev) {
      var pj = jdOf(prev.getTime());
      var pSun = norm(sunTropical(pj) - ayanamsa(pj));
      prevNum = ((Math.floor(pSun / 30) - 11 + 12) % 12) + 1;
    }
    return { num: num, name: MONTHS[num - 1], adhika: prevNum === num, newMoon: nm };
  }

  /* --------------------------------------------------------------- panchang */
  var RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
  var GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];
  var YAMA_SEG = [5, 4, 3, 2, 1, 7, 6];

  var CHOGHADIYA = {
    0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
    1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
    2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
    3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
    4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
    5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
    6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal']
  };

  var HORA_LORDS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  var WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  var RITUS = ['Vasant', 'Grishma', 'Varsha', 'Sharad', 'Hemant', 'Shishir'];

  function tithiName(idx) {
    var paksha = idx < 15 ? 'Shukla' : 'Krishna';
    var n = idx % 15;
    var name = TITHIS[n];
    if (n === 14) name = idx < 15 ? 'Purnima' : 'Amavasya';
    var meta = tithiMeta(idx);
    return {
      name: name, paksha: paksha, num: n + 1, hi: meta.hi, nature: meta.nature,
      shubh: meta.shubh, meaning: meta.meaning, deity: meta.deity, guidance: meta.guidance
    };
  }

  function karanaName(elong) {
    var h = Math.floor(norm(elong) / 6);
    if (h === 0) return 'Kimstughna';
    if (h === 57) return 'Shakuni';
    if (h === 58) return 'Chatushpada';
    if (h === 59) return 'Naga';
    return KARANAS[(h - 1) % 7];
  }

  function horaList(riseMs, setMs, nextRiseMs, wd) {
    var out = [];
    var dayStep = (setMs - riseMs) / 12;
    var nightStep = (nextRiseMs - setMs) / 12;
    var idx = HORA_LORDS.indexOf(WEEKDAY_LORDS[wd]);
    var start = riseMs;
    for (var i = 0; i < 24; i++) {
      var step = i < 12 ? dayStep : nightStep;
      out.push({
        lord: HORA_LORDS[idx % 7], index: i + 1, day: i < 12,
        start: new Date(start), end: new Date(start + step)
      });
      start += step;
      idx++;
    }
    return out;
  }

  function panchakInfo(ref, moonSid) {
    var moonSidereal = function (j) { return norm(moonTropical(j) - ayanamsa(j)); };
    var active = norm(moonSid) >= 300;
    var cross = nextCrossing(moonSidereal, active ? 360 : 300, ref, 5);
    var end = null;
    if (active) {
      end = cross;
    } else if (cross) {
      end = nextCrossing(moonSidereal, 360, jdOf(cross.getTime()) + 0.2, 5);
    }
    return { active: active, start: active ? null : cross, end: end };
  }

  function panchang(y, m, d, place) {
    place = place || { name: 'Gurugram', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' };
    var tz = place.tz == null ? 5.5 : place.tz;
    var sun = findSunTimes(y, m, d, place);
    var sunNext = findSunTimes(y, m, d + 1, place);
    var dayLen = sun.set.getTime() - sun.rise.getTime();
    var nightLen = sunNext.rise.getTime() - sun.set.getTime();
    var wd = localParts(sun.rise, tz).wd;

    /* reference moment: sunrise (standard panchang rule) */
    var ref = jdOf(sun.rise.getTime());

    var elong = elongAt(ref);
    var tIdx = Math.floor(elong / 12);
    var tEnd = nextCrossing(elongAt, (tIdx + 1) * 12, ref, 3);
    var tStart = nextCrossing(elongAt, tIdx * 12, ref - 1.6, 3);
    var tithi = tithiName(tIdx);
    var tProg = (elong - tIdx * 12) / 12;
    var nextTithi = tithiName((tIdx + 1) % 30);

    var moon = moonTropical(ref);
    var ay = ayanamsa(ref);
    var sunSid = norm(sunTropical(ref) - ay);
    var moonSid = norm(moon - ay);
    var NAK_SIZE = 360 / 27;

    // Nakshatra, pada and yoga are sidereal (nirayana) measures. Using the
    // tropical Moon here shifts the nakshatra by roughly one position and is
    // a common source of wrong panchang data.
    var nIdx = Math.floor(moonSid / NAK_SIZE) % 27;
    var nStart = nextCrossing(function (j) { return norm(moonTropical(j) - ayanamsa(j)); }, nIdx * NAK_SIZE, ref - 1.6, 3);
    var nEnd = nextCrossing(function (j) { return norm(moonTropical(j) - ayanamsa(j)); }, (nIdx + 1) * NAK_SIZE, ref, 3);

    var yIdx = Math.floor(norm(moonSid + sunSid) / NAK_SIZE) % 27;
    var yStart = nextCrossing(function (j) {
      return norm(moonTropical(j) + sunTropical(j) - 2 * ayanamsa(j));
    }, yIdx * NAK_SIZE, ref - 1.6, 3);
    var yEnd = nextCrossing(function (j) {
      return norm(moonTropical(j) + sunTropical(j) - 2 * ayanamsa(j));
    }, (yIdx + 1) * NAK_SIZE, ref, 3);

    var kStartTarget = Math.floor(elong / 6) * 6;
    var kStart = nextCrossing(elongAt, kStartTarget, ref - 0.8, 2);
    var kEnd = nextCrossing(elongAt, kStartTarget + 6, ref, 2);
    var kName = karanaName(elong);
    var karana = {
      name: kName, start: kStart, end: kEnd, number: Math.floor(elong / 6) + 1,
      meaning: (KARANA_META[kName] || {}).meaning || '', shubh: (KARANA_META[kName] || {}).shubh !== false
    };

    var seg = dayLen / 8;
    var rahu = { start: new Date(sun.rise.getTime() + (RAHU_SEG[wd] - 1) * seg), end: new Date(sun.rise.getTime() + RAHU_SEG[wd] * seg) };
    var gulika = { start: new Date(sun.rise.getTime() + (GULIKA_SEG[wd] - 1) * seg), end: new Date(sun.rise.getTime() + GULIKA_SEG[wd] * seg) };
    var yama = { start: new Date(sun.rise.getTime() + (YAMA_SEG[wd] - 1) * seg), end: new Date(sun.rise.getTime() + YAMA_SEG[wd] * seg) };
    var abhijit = { start: new Date(sun.noon.getTime() - dayLen / 30), end: new Date(sun.noon.getTime() + dayLen / 30) };
    var brahma = { start: new Date(sun.rise.getTime() - 96 * 60000), end: new Date(sun.rise.getTime() - 48 * 60000) };

    var chog = CHOGHADIYA[wd].map(function (nm, i) {
      return {
        name: nm, start: new Date(sun.rise.getTime() + i * seg), end: new Date(sun.rise.getTime() + (i + 1) * seg),
        good: nm === 'Amrit' || nm === 'Shubh' || nm === 'Labh' || nm === 'Char'
      };
    });

    var lm = lunarMonth(ref);
    var samvat = (m > 3 || (m === 3 && d >= 25)) ? y + 57 : y + 56;
    var shaka = (m > 3 || (m === 3 && d >= 22)) ? y - 78 : y - 79;
    var phase = moonPhaseInfo(elong);
    var moonTimes = findMoonTimes(y, m, d, place);
    var panchak = panchakInfo(ref, moonSid);
    var bhadra = { active: kName === 'Vishti', end: kName === 'Vishti' ? kEnd : null };
    var festivals = FESTIVALS.filter(function (f) {
      if (f.m !== lm.num) return false;
      var idx = (f.p === 'S' ? 0 : 15) + (f.t - 1);
      return idx === tIdx;
    }).map(function (f) { return { name: f.n, icon: f.e, month: MONTHS[f.m - 1] }; });

    return {
      date: new Date(sun.rise.getTime()),
      place: place, weekday: WEEKDAYS[wd], weekdayHi: WEEKDAYS_HI[wd], weekdayIndex: wd,
      sunrise: sun.rise, sunset: sun.set, solarNoon: sun.noon,
      moonrise: moonTimes.rise, moonset: moonTimes.set,
      dayLength: dayLen, nightLength: nightLen,
      tithi: {
        index: tIdx, name: tithi.name, paksha: tithi.paksha, num: tithi.num,
        hi: tithi.hi, nature: tithi.nature, shubh: tithi.shubh, meaning: tithi.meaning,
        deity: tithi.deity, guidance: tithi.guidance,
        start: tStart, end: tEnd, progress: tProg,
        next: (tIdx + 1) % 30, nextName: nextTithi.name, nextPaksha: nextTithi.paksha,
        festivals: festivals
      },
      nakshatra: {
        index: nIdx, name: NAKSHATRAS[nIdx].n, lord: NAKSHATRAS[nIdx].lord,
        deity: NAKSHATRAS[nIdx].deity, symbol: NAKSHATRAS[nIdx].symbol, nature: NAKSHATRAS[nIdx].nature,
        gana: NAKSHATRAS[nIdx].gana, nadi: NAKSHATRAS[nIdx].nadi, yoni: NAKSHATRAS[nIdx].yoni,
        pada: Math.floor((moonSid % NAK_SIZE) / (NAK_SIZE / 4)) + 1,
        start: nStart, end: nEnd
      },
      yoga: {
        index: yIdx, name: YOGAS[yIdx], meaning: YOGA_MEANINGS[yIdx],
        shubh: YOGA_BAD.indexOf(yIdx) < 0, start: yStart, end: yEnd
      },
      karana: karana,
      rahu: rahu, gulika: gulika, yamaganda: yama, abhijit: abhijit, brahma: brahma,
      choghadiya: chog,
      hora: horaList(sun.rise.getTime(), sun.set.getTime(), sunNext.rise.getTime(), wd),
      panchak: panchak, bhadra: bhadra,
      moonPhase: phase, moonIllumination: phase.illumination,
      lunarMonth: lm.num, lunarMonthName: lm.name, adhika: lm.adhika,
      samvat: samvat, shaka: shaka,
      ritu: RITUS[Math.floor((lm.num - 1) / 2)],
      ayana: [9, 10, 11, 0, 1, 2].indexOf(Math.floor(sunSid / 30)) >= 0 ? 'Uttarayana' : 'Dakshinayana',
      solarMonth: RASHIS[Math.floor(sunSid / 30)].s,
      sunSign: Math.floor(sunSid / 30), moonSign: Math.floor(moonSid / 30),
      moonLon: moonSid, sunLon: sunSid,
      ayanamsa: ay, julianDay: ref,
      festivals: festivals
    };
  }

  function panchangForDate(date, place) {
    var tz = place && place.tz != null ? place.tz : 5.5;
    var p = localParts(date, tz);
    return panchang(p.y, p.m, p.d, place);
  }

  /* ------------------------------------------- nakshatra naming & vargas */
  /* Traditional namakshara: the four syllables assigned to each pada of the
     27 nakshatras. Used across North India for choosing a child's name. */
  var NAKSHATRA_SYLLABLES = [
    ['Chu', 'Che', 'Cho', 'La'],
    ['Li', 'Lu', 'Le', 'Lo'],
    ['A', 'I', 'U', 'E'],
    ['O', 'Va', 'Vi', 'Vu'],
    ['Ve', 'Vo', 'Ka', 'Ki'],
    ['Ku', 'Gha', 'Nga', 'Chha'],
    ['Ke', 'Ko', 'Ha', 'Hi'],
    ['Hu', 'He', 'Ho', 'Da'],
    ['Di', 'Du', 'De', 'Do'],
    ['Ma', 'Mi', 'Mu', 'Me'],
    ['Mo', 'Ta', 'Ti', 'Tu'],
    ['Te', 'To', 'Pa', 'Pi'],
    ['Pu', 'Sha', 'Na', 'Tha'],
    ['Pe', 'Po', 'Ra', 'Ri'],
    ['Ru', 'Re', 'Ro', 'Ta'],
    ['Ti', 'Tu', 'Te', 'To'],
    ['Na', 'Ni', 'Nu', 'Ne'],
    ['No', 'Ya', 'Yi', 'Yu'],
    ['Ye', 'Yo', 'Bha', 'Bhi'],
    ['Bhu', 'Dha', 'Pha', 'Dha'],
    ['Bhe', 'Bho', 'Ja', 'Ji'],
    ['Khi', 'Khu', 'Khe', 'Kho'],
    ['Ga', 'Gi', 'Gu', 'Ge'],
    ['Go', 'Sa', 'Si', 'Su'],
    ['Se', 'So', 'Da', 'Di'],
    ['Du', 'Tha', 'Jha', 'Na'],
    ['De', 'Do', 'Cha', 'Chi']
  ];
  var NAKSHATRA_SYLLABLES_HI = [
    ['चु', 'चे', 'चो', 'ला'],
    ['ली', 'लू', 'ले', 'लो'],
    ['अ', 'ई', 'उ', 'ए'],
    ['ओ', 'वा', 'वी', 'वू'],
    ['वे', 'वो', 'का', 'की'],
    ['कू', 'घ', 'ङ', 'छ'],
    ['के', 'को', 'हा', 'ही'],
    ['हू', 'हे', 'हो', 'डा'],
    ['डी', 'डू', 'डे', 'डो'],
    ['मा', 'मी', 'मू', 'मे'],
    ['मो', 'टा', 'टी', 'टू'],
    ['टे', 'टो', 'पा', 'पी'],
    ['पू', 'ष', 'ण', 'ठ'],
    ['पे', 'पो', 'रा', 'री'],
    ['रू', 'रे', 'रो', 'ता'],
    ['ती', 'तू', 'ते', 'तो'],
    ['ना', 'नी', 'नू', 'ने'],
    ['नो', 'या', 'यी', 'यू'],
    ['ये', 'यो', 'भा', 'भी'],
    ['भू', 'धा', 'फा', 'ढा'],
    ['भे', 'भो', 'जा', 'जी'],
    ['खी', 'खू', 'खे', 'खो'],
    ['गा', 'गी', 'गू', 'गे'],
    ['गो', 'सा', 'सी', 'सू'],
    ['से', 'सो', 'दा', 'दी'],
    ['दू', 'थ', 'झ', 'ञ'],
    ['दे', 'दो', 'च', 'ची']
  ];

  var NAKSHATRA_NATURE = {
    Kshipra: 'Swift and healing — quick results, medicine, travel and learning.',
    Ugra: 'Fierce and forceful — courage, transformation and decisive action.',
    Mishra: 'Mixed — a blend of gentle and sharp influences.',
    Dhruva: 'Fixed and steady — endurance, loyalty and lasting results.',
    Mridu: 'Soft and gentle — art, romance, kindness and refinement.',
    Tikshna: 'Sharp and penetrating — research, strategy and intensity.',
    Chara: 'Movable and changeable — adaptability, motion and exploration.'
  };
  var GANA_MEANING = {
    Deva: 'Divine temperament — gentle, generous and idealistic.',
    Manushya: 'Human temperament — ambitious, practical and mixed.',
    Rakshasa: 'Fierce temperament — intense, protective and strong-willed.'
  };
  var NADI_MEANING = {
    Adi: 'Adi (Vata) — movement, breath and the nervous system.',
    Madhya: 'Madhya (Pitta) — heat, digestion and transformation.',
    Antya: 'Antya (Kapha) — structure, immunity and calm.'
  };

  function nakshatraProfile(idx) {
    idx = ((idx % 27) + 27) % 27;
    var n = NAKSHATRAS[idx];
    return {
      index: idx, name: n.n, lord: n.lord, deity: n.deity, symbol: n.symbol,
      gana: n.gana, yoni: n.yoni, nadi: n.nadi, nature: n.nature,
      natureText: NAKSHATRA_NATURE[n.nature] || '',
      ganaText: GANA_MEANING[n.gana] || '',
      nadiText: NADI_MEANING[n.nadi] || '',
      syllables: NAKSHATRA_SYLLABLES[idx], syllablesHi: NAKSHATRA_SYLLABLES_HI[idx]
    };
  }

  /* The sixteen Parashari vargas shown in a shodashavarga table. */
  var VARGAS = [
    { d: 1, name: 'Rashi', short: 'D1', theme: 'Body & birth chart' },
    { d: 2, name: 'Hora', short: 'D2', theme: 'Wealth' },
    { d: 3, name: 'Drekkana', short: 'D3', theme: 'Siblings & courage' },
    { d: 4, name: 'Chaturthamsha', short: 'D4', theme: 'Home & property' },
    { d: 7, name: 'Saptamsha', short: 'D7', theme: 'Children' },
    { d: 9, name: 'Navamsa', short: 'D9', theme: 'Marriage & dharma' },
    { d: 10, name: 'Dashamsha', short: 'D10', theme: 'Career' },
    { d: 12, name: 'Dwadashamsha', short: 'D12', theme: 'Parents' },
    { d: 16, name: 'Shodashamsha', short: 'D16', theme: 'Vehicles & comforts' },
    { d: 20, name: 'Vimshamsha', short: 'D20', theme: 'Spiritual practice' },
    { d: 24, name: 'Chaturvimshamsha', short: 'D24', theme: 'Learning' },
    { d: 27, name: 'Bhamsha', short: 'D27', theme: 'Strengths & weaknesses' },
    { d: 30, name: 'Trimshamsha', short: 'D30', theme: 'Misfortunes' },
    { d: 40, name: 'Khavedamsha', short: 'D40', theme: 'Maternal legacy' },
    { d: 45, name: 'Akshavedamsha', short: 'D45', theme: 'Paternal legacy' },
    { d: 60, name: 'Shashtiamsha', short: 'D60', theme: 'Past karma' }
  ];

  /* Divisional sign of a sidereal longitude under the standard Parashari
     rules. D2 and D30 are unequal divisions and are handled separately. */
  function vargaSign(lon, D) {
    var L = norm(lon);
    var sign = Math.floor(L / 30);
    var deg = L - sign * 30;
    var odd = sign % 2 === 0;            // Aries, Gemini, … are odd signs
    var movable = sign % 3 === 0;
    var fixed = sign % 3 === 1;
    var start, part;

    switch (D) {
      case 2:
        if (odd) return deg < 15 ? 4 : 3;       // Leo then Cancer
        return deg < 15 ? 3 : 4;                // Cancer then Leo
      case 3:
        return (sign + Math.min(2, Math.floor(deg / 10)) * 4) % 12;
      case 4:
        return (sign + Math.min(3, Math.floor(deg / 7.5)) * 3) % 12;
      case 7:
        start = odd ? sign : (sign + 6) % 12;
        return (start + Math.min(6, Math.floor(deg / (30 / 7)))) % 12;
      case 9:
        return Math.floor(L / (30 / 9)) % 12;
      case 10:
        start = odd ? sign : (sign + 8) % 12;
        return (start + Math.min(9, Math.floor(deg / 3))) % 12;
      case 12:
        return (sign + Math.min(11, Math.floor(deg / 2.5))) % 12;
      case 16:
        start = movable ? 0 : fixed ? 4 : 8;
        return (start + Math.min(15, Math.floor(deg / (30 / 16)))) % 12;
      case 20:
        start = movable ? 0 : fixed ? 8 : 4;
        return (start + Math.min(19, Math.floor(deg / 1.5))) % 12;
      case 24:
        start = odd ? 4 : 3;
        return (start + Math.min(23, Math.floor(deg / 1.25))) % 12;
      case 27:
        start = sign % 4 === 0 ? 0 : sign % 4 === 1 ? 3 : sign % 4 === 2 ? 6 : 9;
        return (start + Math.min(26, Math.floor(deg / (30 / 27)))) % 12;
      case 30:
        if (odd) {
          if (deg < 5) return 0;      // Mars — Aries
          if (deg < 10) return 10;    // Saturn — Aquarius
          if (deg < 18) return 8;     // Jupiter — Sagittarius
          if (deg < 25) return 2;     // Mercury — Gemini
          return 6;                   // Venus — Libra
        }
        if (deg < 5) return 1;        // Venus — Taurus
        if (deg < 12) return 5;       // Mercury — Virgo
        if (deg < 20) return 11;      // Jupiter — Pisces
        if (deg < 25) return 9;       // Saturn — Capricorn
        return 7;                     // Mars — Scorpio
      case 40:
        start = odd ? 0 : 6;
        return (start + Math.min(39, Math.floor(deg / 0.75))) % 12;
      case 45:
        start = movable ? 0 : fixed ? 4 : 8;
        return (start + Math.min(44, Math.floor(deg / (30 / 45)))) % 12;
      case 60:
        return (sign + Math.min(59, Math.floor(deg / 0.5))) % 12;
      default:
        return sign;
    }
  }

  function vargas(planets, asc) {
    var rows = [{
      key: 'Asc', name: 'Lagna',
      signs: VARGAS.map(function (v) { return vargaSign(asc.lon, v.d); })
    }];
    planets.forEach(function (p) {
      rows.push({
        key: p.key, name: p.name,
        signs: VARGAS.map(function (v) { return vargaSign(p.lon, v.d); })
      });
    });
    return { list: VARGAS, rows: rows };
  }

  /* Baladi avastha — the planet's "age" by degree inside its sign. */
  var AVASTHA = [
    { name: 'Bala', en: 'Infant', text: 'Immature expression — potential is still developing.' },
    { name: 'Kumara', en: 'Child', text: 'Growing expression — curious, learning and playful.' },
    { name: 'Yuva', en: 'Adult', text: 'Full strength — the planet gives its results openly.' },
    { name: 'Vriddha', en: 'Old', text: 'Weakened expression — results come with effort or delay.' },
    { name: 'Mrita', en: 'Dormant', text: 'Latent expression — the planet works quietly or needs support.' }
  ];

  function avastha(deg, sign) {
    var part = Math.floor(deg / 6);
    if (part > 4) part = 4;
    if (part < 0) part = 0;
    if (sign % 2 === 1) part = 4 - part;   // even signs count in reverse
    return AVASTHA[part];
  }

  var BHAVA_META = [
    { name: 'Tanu Bhava', sanskrit: 'तनु भाव', meaning: 'Body & self', karaka: 'Sun', text: 'Physical body, health, personality, vitality and first impressions.' },
    { name: 'Dhana Bhava', sanskrit: 'धन भाव', meaning: 'Wealth & speech', karaka: 'Jupiter', text: 'Savings, family resources, food, speech, values and what you hold dear.' },
    { name: 'Sahaja Bhava', sanskrit: 'सहज भाव', meaning: 'Courage & siblings', karaka: 'Mars', text: 'Younger siblings, courage, communication, short journeys, skills and self-effort.' },
    { name: 'Sukha Bhava', sanskrit: 'सुख भाव', meaning: 'Home & mother', karaka: 'Moon', text: 'Mother, home, property, vehicles, inner peace and early education.' },
    { name: 'Putra Bhava', sanskrit: 'पुत्र भाव', meaning: 'Children & creativity', karaka: 'Jupiter', text: 'Children, romance, creative expression, intelligence, mantra and purva punya.' },
    { name: 'Shatru Bhava', sanskrit: 'शत्रु भाव', meaning: 'Obstacles & service', karaka: 'Mars / Saturn', text: 'Illness, debt, enemies, competition, daily service, discipline and litigation.' },
    { name: 'Kalatra Bhava', sanskrit: 'कलत्र भाव', meaning: 'Marriage & partners', karaka: 'Venus', text: 'Marriage, business partners, contracts, public dealing and one-to-one relationships.' },
    { name: 'Ayur Bhava', sanskrit: 'आयु भाव', meaning: 'Longevity & transformation', karaka: 'Saturn', text: 'Longevity, inheritance, occult study, research, chronic conditions and deep change.' },
    { name: 'Dharma Bhava', sanskrit: 'धर्म भाव', meaning: 'Fortune & dharma', karaka: 'Jupiter / Sun', text: 'Fortune, guru, father, higher learning, pilgrimage, ethics and long journeys.' },
    { name: 'Karma Bhava', sanskrit: 'कर्म भाव', meaning: 'Career & status', karaka: 'Sun / Mercury / Saturn', text: 'Career, authority, public reputation, action in the world and karmic duty.' },
    { name: 'Labha Bhava', sanskrit: 'लाभ भाव', meaning: 'Gains & network', karaka: 'Jupiter', text: 'Income, gains, elder siblings, friends, aspirations and fulfilment of desires.' },
    { name: 'Vyaya Bhava', sanskrit: 'व्यय भाव', meaning: 'Loss & moksha', karaka: 'Saturn', text: 'Expenditure, foreign lands, sleep, seclusion, letting go and spiritual liberation.' }
  ];

  function bhavas(planets, ascSign) {
    var out = [];
    for (var h = 1; h <= 12; h++) {
      var sign = (ascSign + h - 1) % 12;
      var meta = BHAVA_META[h - 1];
      out.push({
        house: h, sign: sign, signName: RASHIS[sign].s, signEn: RASHIS[sign].n,
        lord: RASHIS[sign].lord, name: meta.name, sanskrit: meta.sanskrit,
        meaning: meta.meaning, karaka: meta.karaka, text: meta.text,
        planets: planets.filter(function (p) { return p.house === h; }).map(function (p) { return p.name; })
      });
    }
    return out;
  }

  /* Graha drishti: every planet aspects the 7th from itself. Mars adds the
     4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and 10th. The nodes
     are given the 5th, 7th and 9th in many North Indian schools. */
  var DRISHTI = {
    Su: [7], Mo: [7], Ma: [4, 7, 8], Me: [7], Ju: [5, 7, 9],
    Ve: [7], Sa: [3, 7, 10], Ra: [5, 7, 9], Ke: [5, 7, 9]
  };

  function aspects(planets) {
    return planets.map(function (p) {
      var angles = DRISHTI[p.key] || [7];
      var houses = angles.map(function (a) { return ((p.house - 1 + a - 1) % 12) + 1; });
      var targets = [];
      houses.forEach(function (h) {
        planets.forEach(function (q) {
          if (q.house === h && q.key !== p.key) targets.push(q.name);
        });
      });
      return {
        key: p.key, name: p.name, house: p.house, angles: angles,
        houses: houses, planets: targets, node: p.key === 'Ra' || p.key === 'Ke'
      };
    });
  }

  var KENDRA = [1, 4, 7, 10];
  var TRIKONA = [1, 5, 9];
  var BENEFICS = ['Jupiter', 'Venus', 'Mercury'];

  function lordOfHouse(ascSign, house) {
    return RASHIS[(ascSign + house - 1) % 12].lord;
  }
  function planetNamed(planets, name) {
    return planets.filter(function (p) { return p.name === name; })[0];
  }
  function planetsInHouse(planets, house) {
    return planets.filter(function (p) { return p.house === house; });
  }
  function relativeHouse(base, n) {
    return ((base - 1 + n - 1) % 12) + 1;
  }
  function aspectsHouse(p, house) {
    return (DRISHTI[p.key] || [7]).some(function (a) {
      return ((p.house - 1 + a - 1) % 12) + 1 === house;
    });
  }
  function linked(a, b) {
    if (!a || !b || a.key === b.key) return false;
    return a.house === b.house || (aspectsHouse(a, b.house) && aspectsHouse(b, a.house));
  }
  function isBenefic(p) { return BENEFICS.indexOf(p.name) >= 0; }
  function strongDignity(p) { return p.dignity === 'Exalted' || p.dignity === 'Own sign'; }

  function yogas(planets, ascSign, moonP) {
    var out = [];
    function add(name, sanskrit, present, text, category) {
      out.push({ name: name, sanskrit: sanskrit, present: !!present, text: text, category: category || 'yoga' });
    }

    var p = {};
    planets.forEach(function (x) { p[x.key] = x; });
    var moonHouse = p.Mo.house;
    function fromMoon(h) { return ((h - moonHouse + 12) % 12) + 1; }

    /* Panch Mahapurusha — a strong planet in a kendra. */
    [
      { key: 'Ma', name: 'Ruchaka', sa: 'रुचक', text: 'Mars in its own or exaltation sign in a kendra — courage, command and physical vitality.' },
      { key: 'Me', name: 'Bhadra', sa: 'भद्र', text: 'Mercury in its own or exaltation sign in a kendra — sharp intellect, commerce and communication.' },
      { key: 'Ju', name: 'Hamsa', sa: 'हंस', text: 'Jupiter in its own or exaltation sign in a kendra — wisdom, ethics, teaching and respect.' },
      { key: 'Ve', name: 'Malavya', sa: 'मालव्य', text: 'Venus in its own or exaltation sign in a kendra — grace, art, comfort and relationship ease.' },
      { key: 'Sa', name: 'Sasa', sa: 'शश', text: 'Saturn in its own or exaltation sign in a kendra — discipline, organisation and authority.' }
    ].forEach(function (m) {
      var pl = p[m.key];
      add(m.name, m.sa, KENDRA.indexOf(pl.house) >= 0 && strongDignity(pl), m.text, 'mahapurusha');
    });

    add('Gajakesari', 'गजकेसरी', KENDRA.indexOf(fromMoon(p.Ju.house)) >= 0,
      'Jupiter in a kendra from the Moon — wisdom, reputation and a protective influence.', 'raja');
    add('Budhaditya', 'बुधादित्य', p.Su.sign === p.Me.sign,
      'Sun and Mercury in the same sign — analytical intelligence and clear communication.', 'raja');
    add('Chandra-Mangala', 'चंद्र-मंगल', linked(p.Mo, p.Ma),
      'Moon and Mars conjunct or in mutual aspect — earning drive, courage and wealth through effort.', 'dhana');

    var in2 = planets.filter(function (x) { return fromMoon(x.house) === 2 && x.key !== 'Su'; });
    var in12 = planets.filter(function (x) { return fromMoon(x.house) === 12 && x.key !== 'Su'; });
    var withMoon = planetsInHouse(planets, moonHouse).filter(function (x) { return x.key !== 'Mo' && x.key !== 'Su'; });

    add('Sunapha', 'सुनफा', in2.length > 0,
      'Planets in the 2nd from the Moon — self-earned resources, confidence and steady support.', 'chandra');
    add('Anapha', 'अनफा', in12.length > 0,
      'Planets in the 12th from the Moon — generosity, refinement and a reflective inner life.', 'chandra');
    add('Durudhara', 'दुरुधरा', in2.length > 0 && in12.length > 0,
      'Planets on both sides of the Moon — balance between receiving and giving, comfort and company.', 'chandra');
    add('Kemadruma', 'केमद्रुम', in2.length === 0 && in12.length === 0 && withMoon.length === 0,
      'The Moon has no planets in the 2nd, 12th or with it. Traditionally a caution about emotional self-reliance, not a curse; a strong Moon or Jupiter moderates it.', 'caution');

    var adhi = [6, 7, 8].every(function (n) {
      return planetsInHouse(planets, relativeHouse(moonHouse, n)).some(isBenefic);
    });
    add('Adhi', 'अधि', adhi,
      'Natural benefics occupy the 6th, 7th and 8th from the Moon — leadership, prosperity and lasting status.', 'raja');

    var amala = planetsInHouse(planets, relativeHouse(moonHouse, 10)).some(isBenefic) ||
      planetsInHouse(planets, 10).some(isBenefic);
    add('Amala', 'अमल', amala,
      'A natural benefic in the 10th from the Moon or Lagna — a clean reputation and lasting good name.', 'raja');

    var l6 = planetNamed(planets, lordOfHouse(ascSign, 6));
    var l8 = planetNamed(planets, lordOfHouse(ascSign, 8));
    var l12 = planetNamed(planets, lordOfHouse(ascSign, 12));
    var vipreet = (l6 && [8, 12].indexOf(l6.house) >= 0) ||
      (l8 && [6, 12].indexOf(l8.house) >= 0) ||
      (l12 && [6, 8].indexOf(l12.house) >= 0);
    add('Vipreet Raja', 'विपरीत राज', vipreet,
      'A lord of the 6th, 8th or 12th sits in another dusthana — rise through adversity, recovery and resourcefulness.', 'raja');

    var kendraLords = KENDRA.map(function (h) { return planetNamed(planets, lordOfHouse(ascSign, h)); }).filter(Boolean);
    var trikonaLords = TRIKONA.map(function (h) { return planetNamed(planets, lordOfHouse(ascSign, h)); }).filter(Boolean);
    var raja = kendraLords.some(function (a) {
      return trikonaLords.some(function (b) { return linked(a, b); });
    });
    add('Raja', 'राज', raja,
      'A kendra lord and a trikona lord are conjunct or in mutual aspect — a classical combination for authority and success.', 'raja');

    var l2 = planetNamed(planets, lordOfHouse(ascSign, 2));
    var l11 = planetNamed(planets, lordOfHouse(ascSign, 11));
    var dhana = linked(l2, l11) || (l2 && l2.house === 11) || (l11 && l11.house === 2);
    add('Dhana', 'धन', dhana,
      'The 2nd and 11th lords are linked, or occupy each other’s houses — a classical wealth combination.', 'dhana');

    var saraswati = [p.Ju, p.Ve, p.Me].every(function (x) {
      return [1, 2, 4, 5, 7, 9, 10].indexOf(x.house) >= 0;
    }) && (strongDignity(p.Ju) || relation('Jupiter', RASHIS[p.Ju.sign].lord) === 'friend');
    add('Saraswati', 'सरस्वती', saraswati,
      'Jupiter, Venus and Mercury occupy kendras, trikonas, the 2nd or 5th — learning, arts and eloquent expression.', 'raja');

    return out;
  }

  /* ---------------------------------------------------------------- kundli */
  var DIGNITY = {
    Su: { ex: 0, deb: 6, own: [4] }, Mo: { ex: 1, deb: 7, own: [3] },
    Ma: { ex: 9, deb: 3, own: [0, 7] }, Me: { ex: 5, deb: 11, own: [2, 5] },
    Ju: { ex: 3, deb: 9, own: [8, 11] }, Ve: { ex: 11, deb: 5, own: [1, 6] },
    Sa: { ex: 6, deb: 0, own: [9, 10] }, Ra: {}, Ke: {}
  };

  function dignity(p) {
    var d = DIGNITY[p.key]; if (!d) return '';
    if (d.ex === p.sign) return 'Exalted';
    if (d.deb === p.sign) return 'Debilitated';
    if (d.own && d.own.indexOf(p.sign) >= 0) return 'Own sign';
    return '';
  }

  function kundli(opts) {
    var place = opts.place || { name: 'Gurugram', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' };
    var parts = String(opts.date).split('-').map(Number);
    var tp = String(opts.time || '12:00').split(':').map(Number);
    var dt = localToDate(parts[0], parts[1], parts[2], tp[0] || 0, tp[1] || 0, place);
    var jd = jdOf(dt.getTime());
    var ay = ayanamsa(jd);
    var asc = ascendant(jd, place.lat, place.lon);
    var ascSign = Math.floor(asc.sidereal / 30);
    var planets = planetSet(jd).map(function (p) {
      var house = ((p.sign - ascSign + 12) % 12) + 1;
      var d9 = Math.floor(p.lon / (30 / 9)) % 12;
      return Object.assign({}, p, {
        house: house, d9: d9, d9House: ((d9 - (Math.floor(asc.sidereal / (30 / 9)) % 12) + 12) % 12) + 1,
        nakshatraName: NAKSHATRAS[p.nakshatra].n,
        nakshatraLord: NAKSHATRAS[p.nakshatra].lord,
        dignity: dignity(p),
        avastha: avastha(p.degInSign, p.sign)
      });
    });

    var moonP = planets[1];
    var dashas = vimshottari(moonP.lon, dt);
    var doshas = doshaCheck(planets, ascSign, moonP.sign);

    /* The five limbs of the panchang *at the birth moment* — not at sunrise.
       This is what a traditional janma-patri uses for the tithi/nakshatra row. */
    var sunTimes = findSunTimes(parts[0], parts[1], parts[2], place);
    var bpElong = elongAt(jd);
    var bpMoonSid = norm(moonTropical(jd) - ay);
    var bpSunSid = norm(sunTropical(jd) - ay);
    var NAK = 360 / 27;
    var bpTithiIdx = Math.floor(bpElong / 12);
    var bpNakIdx = Math.floor(bpMoonSid / NAK) % 27;
    var bpYogaIdx = Math.floor(norm(bpMoonSid + bpSunSid) / NAK) % 27;
    var bpKarana = karanaName(bpElong);
    var birthPanchang = {
      tithi: tithiName(bpTithiIdx),
      tithiIndex: bpTithiIdx,
      nakshatra: {
        index: bpNakIdx, name: NAKSHATRAS[bpNakIdx].n, lord: NAKSHATRAS[bpNakIdx].lord,
        deity: NAKSHATRAS[bpNakIdx].deity, pada: Math.floor((bpMoonSid % NAK) / (NAK / 4)) + 1
      },
      yoga: { index: bpYogaIdx, name: YOGAS[bpYogaIdx], meaning: YOGA_MEANINGS[bpYogaIdx] },
      karana: { name: bpKarana, meaning: (KARANA_META[bpKarana] || {}).meaning || '' },
      sunrise: sunTimes.rise, sunset: sunTimes.set,
      moonPhase: moonPhaseInfo(bpElong)
    };

    var lagnaDeg = asc.sidereal % 30;
    var ascNakIdx = Math.floor(asc.sidereal / NAK) % 27;
    var first = dashas.mahadashas[0];
    var bal = first && first.balanceAtBirth != null ? first.balanceAtBirth : 0;
    var balance = {
      years: Math.floor(bal),
      months: Math.floor((bal - Math.floor(bal)) * 12),
      days: Math.round(((bal - Math.floor(bal)) * 12 - Math.floor((bal - Math.floor(bal)) * 12)) * 30),
      lord: first ? first.lord : '',
      text: first ? (Math.floor(bal) + 'y ' + Math.floor((bal - Math.floor(bal)) * 12) + 'm') : ''
    };
    var age = (Date.now() - dt.getTime()) / (365.2425 * 86400000);

    return {
      name: opts.name || 'Seeker',
      date: opts.date, time: opts.time, place: place,
      birth: dt, jd: jd, ayanamsa: ay,
      asc: {
        lon: asc.sidereal, sign: ascSign, deg: lagnaDeg,
        signName: RASHIS[ascSign].s, signEn: RASHIS[ascSign].n,
        lord: RASHIS[ascSign].lord,
        nakshatra: NAKSHATRAS[ascNakIdx].n,
        nakshatraIndex: ascNakIdx,
        pada: Math.floor((asc.sidereal % NAK) / (NAK / 4)) + 1
      },
      moonSign: moonP.sign, sunSign: planets[0].sign,
      planets: planets,
      dashas: dashas,
      dashaBalance: balance,
      doshas: doshas,
      birthPanchang: birthPanchang,
      moonPhase: moonPhaseInfo(bpElong),
      age: age,
      moonNakshatra: NAKSHATRAS[moonP.nakshatra].n,
      moonNakshatraIndex: moonP.nakshatra,
      moonNakshatraLord: NAKSHATRAS[moonP.nakshatra].lord,
      moonPada: moonP.pada,
      navamsaAsc: Math.floor(asc.sidereal / (30 / 9)) % 12,
      nakshatraProfile: nakshatraProfile(moonP.nakshatra),
      lagnaNakshatraProfile: nakshatraProfile(ascNakIdx),
      namakshara: {
        nakshatra: NAKSHATRAS[moonP.nakshatra].n,
        pada: moonP.pada,
        syllable: NAKSHATRA_SYLLABLES[moonP.nakshatra][moonP.pada - 1],
        syllableHi: NAKSHATRA_SYLLABLES_HI[moonP.nakshatra][moonP.pada - 1],
        all: NAKSHATRA_SYLLABLES[moonP.nakshatra],
        allHi: NAKSHATRA_SYLLABLES_HI[moonP.nakshatra]
      },
      bhavas: bhavas(planets, ascSign),
      vargas: vargas(planets, { lon: asc.sidereal }),
      aspects: aspects(planets),
      yogas: yogas(planets, ascSign, moonP),
      remedies: remediesFor(moonP.sign, doshas)
    };
  }

  function vimshottari(moonLon, birthDate) {
    var nakSize = 360 / 27;
    var nak = Math.floor(norm(moonLon) / nakSize);
    var startIdx = nak % 9;
    var frac = (norm(moonLon) % nakSize) / nakSize;
    var DAY = 86400000, YEAR = 365.2425 * DAY;
    var seq = [];
    for (var c = 0; c < 3; c++) seq = seq.concat(VIMSHOTTARI);
    var start = birthDate.getTime() - frac * VIMSHOTTARI[startIdx].years * YEAR;
    var out = [];
    var t = start;
    for (var i = 0; i < 9; i++) {
      var item = seq[startIdx + i];
      var end = t + item.years * YEAR;
      out.push({
        lord: item.lord, years: item.years,
        start: new Date(t), end: new Date(end),
        balanceAtBirth: i === 0 ? (1 - frac) * item.years : null
      });
      t = end;
    }
    /* antardashas for the mahadasha running today */
    var now = Date.now();
    var current = out.filter(function (d) { return d.start.getTime() <= now && d.end.getTime() > now; })[0] || out[0];
    var sub = [];
    var st = current.start.getTime();
    var seqSub = [];
    for (var j = 0; j < 3; j++) seqSub = seqSub.concat(VIMSHOTTARI);
    var startSub = seqSub.findIndex(function (s) { return s.lord === current.lord; });
    for (var k = 0; k < 9; k++) {
      var s = seqSub[startSub + k];
      var len = current.years * s.years / 120 * YEAR;
      sub.push({ lord: s.lord, start: new Date(st), end: new Date(st + len) });
      st += len;
    }
    return { mahadashas: out, current: current, antardashas: sub };
  }

  function doshaCheck(planets, ascSign, moonSign) {
    var mars = planets.filter(function (p) { return p.key === 'Ma'; })[0];
    var marsHouses = [1, 2, 4, 7, 8, 12];
    var manglik = marsHouses.indexOf(mars.house) >= 0;
    var manglikMoon = [1, 2, 4, 7, 8, 12].indexOf(((mars.sign - moonSign + 12) % 12) + 1) >= 0;

    var rahu = planets.filter(function (p) { return p.key === 'Ra'; })[0];
    var others = planets.filter(function (p) { return ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'].indexOf(p.key) >= 0; });
    var rahuTo = norm(rahu.lon);
    var ketuTo = norm(rahuTo + 180);
    var oneSide = others.every(function (p) {
      var d = norm(p.lon - rahuTo);
      return d > 0 && d < 180;
    });
    var otherSide = others.every(function (p) {
      var d = norm(p.lon - ketuTo);
      return d > 0 && d < 180;
    });
    var kaalSarp = oneSide || otherSide;

    var saturn = planets.filter(function (p) { return p.key === 'Sa'; })[0];
    var satDiff = ((saturn.sign - moonSign + 12) % 12) + 1;
    var sadeSati = satDiff === 12 || satDiff === 1 || satDiff === 2;

    var jup = planets.filter(function (p) { return p.key === 'Ju'; })[0];
    var jupFromMoon = ((jup.sign - moonSign + 12) % 12) + 1;
    var gajkesari = [1, 4, 7, 10].indexOf(jupFromMoon) >= 0;

    var sun = planets.filter(function (p) { return p.key === 'Su'; })[0];
    var mer = planets.filter(function (p) { return p.key === 'Me'; })[0];
    var budhaditya = sun.sign === mer.sign;

    return {
      manglik: manglik, manglikMoon: manglikMoon,
      kaalSarp: kaalSarp,
      sadeSati: sadeSati, sadeSatiPhase: sadeSati ? (satDiff === 12 ? 'Rising' : satDiff === 1 ? 'Peak' : 'Setting') : null,
      gajkesari: gajkesari, budhaditya: budhaditya
    };
  }

  function remediesFor(moonSign, doshas) {
    var gems = ['Red Coral', 'Emerald', 'Pearl', 'Pearl', 'Ruby', 'Emerald', 'Diamond', 'Red Coral', 'Yellow Sapphire', 'Blue Sapphire', 'Blue Sapphire', 'Yellow Sapphire'];
    var metals = ['Copper', 'Silver', 'Silver', 'Silver', 'Gold', 'Silver', 'Silver/Platinum', 'Copper', 'Gold', 'Iron/Silver', 'Iron/Silver', 'Gold'];
    var days = ['Tuesday', 'Friday', 'Monday', 'Monday', 'Sunday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday', 'Saturday', 'Saturday', 'Thursday'];
    var mantra = ['Om Mangalaya Namah', 'Om Shukraya Namah', 'Om Chandraya Namah', 'Om Chandraya Namah', 'Om Suryaya Namah', 'Om Budhaya Namah', 'Om Shukraya Namah', 'Om Mangalaya Namah', 'Om Gurave Namah', 'Om Shanaischaraya Namah', 'Om Shanaischaraya Namah', 'Om Gurave Namah'];
    var list = [
      { title: 'Primary Gemstone', text: gems[moonSign] + ' in ' + metals[moonSign] + ', worn on ' + days[moonSign] + ' after energising.' },
      { title: 'Ishta Mantra', text: mantra[moonSign] + ' — 108 times daily at sunrise.' }
    ];
    if (doshas.manglik) list.push({ title: 'Mangal Shanti', text: 'Mangal Dosh Nivaran Pooja with 7,000 Mangal mantra jaap recommended.' });
    if (doshas.kaalSarp) list.push({ title: 'Kaal Sarp Shanti', text: 'Rahu–Ketu Shanti at Trimbakeshwar or a local Rahu-Ketu havan.' });
    if (doshas.sadeSati) list.push({ title: 'Shani Shanti', text: 'Shani Telabhishek and Hanuman Chalisa path on Saturdays.' });
    return list;
  }

  /* -------------------------------------------------------------- matching */
  var VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]; // Kshatriya 2, Vaishya 1, Shudra 0, Brahmin 3
  var VASHYA_GROUP = [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2];
  var YONI_ENEMY = {
    Horse: ['Buffalo'], Elephant: ['Lion'], Sheep: ['Monkey'], Serpent: ['Mongoose'],
    Dog: ['Deer'], Cat: ['Rat'], Rat: ['Cat'], Cow: ['Tiger'], Buffalo: ['Horse'],
    Tiger: ['Cow'], Deer: ['Dog'], Monkey: ['Sheep'], Mongoose: ['Serpent'], Lion: ['Elephant']
  };
  var FRIENDS = {
    Sun: { f: ['Moon', 'Mars', 'Jupiter'], n: ['Mercury'], e: ['Venus', 'Saturn'] },
    Moon: { f: ['Sun', 'Mercury'], n: ['Mars', 'Jupiter', 'Venus', 'Saturn'], e: [] },
    Mars: { f: ['Sun', 'Moon', 'Jupiter'], n: ['Venus', 'Saturn'], e: ['Mercury'] },
    Mercury: { f: ['Sun', 'Venus'], n: ['Mars', 'Jupiter', 'Saturn'], e: ['Moon'] },
    Jupiter: { f: ['Sun', 'Moon', 'Mars'], n: ['Saturn'], e: ['Mercury', 'Venus'] },
    Venus: { f: ['Mercury', 'Saturn'], n: ['Mars', 'Jupiter'], e: ['Sun', 'Moon'] },
    Saturn: { f: ['Mercury', 'Venus'], n: ['Jupiter'], e: ['Sun', 'Moon', 'Mars'] }
  };

  function relation(a, b) {
    if (a === b) return 'friend';
    if (FRIENDS[a].f.indexOf(b) >= 0) return 'friend';
    if (FRIENDS[a].e.indexOf(b) >= 0) return 'enemy';
    return 'neutral';
  }

  function ashtakoot(groom, bride) {
    var gSign = groom.moonSign, bSign = bride.moonSign;
    var gNak = groom.moonNakshatraIndex, bNak = bride.moonNakshatraIndex;
    var out = { items: [], total: 0, max: 36 };

    /* Varna */
    var vScore = VARNA[gSign] >= VARNA[bSign] ? 1 : 0;
    out.items.push({ name: 'Varna', max: 1, score: vScore, note: vScore ? 'Natural harmony in temperament.' : 'Different social temperaments — manageable.' });

    /* Vashya */
    var vg = VASHYA_GROUP[gSign], vb = VASHYA_GROUP[bSign];
    var vash = vg === vb ? 2 : ((vg === 1 && vb === 0) || (vg === 0 && vb === 1)) ? 1 : 0;
    out.items.push({ name: 'Vashya', max: 2, score: vash, note: vash === 2 ? 'Mutual attraction and respect.' : vash === 1 ? 'Partial magnetic pull.' : 'Needs conscious effort in understanding.' });

    /* Tara */
    var t1 = ((gNak - bNak + 27) % 27) + 1, t2 = ((bNak - gNak + 27) % 27) + 1;
    var good = function (n) { var r = n % 9; return r !== 3 && r !== 5 && r !== 7; };
    var tara = (good(t1) ? 1.5 : 0) + (good(t2) ? 1.5 : 0);
    out.items.push({ name: 'Tara', max: 3, score: tara, note: tara === 3 ? 'Destiny supports the union.' : 'Some planetary friction in timing.' });

    /* Yoni */
    var ya = NAKSHATRAS[gNak].yoni, yb = NAKSHATRAS[bNak].yoni;
    var yoni = 2;
    if (ya === yb) yoni = 4;
    else if (YONI_ENEMY[ya] && YONI_ENEMY[ya].indexOf(yb) >= 0) yoni = 0;
    else if (YONI_ENEMY[yb] && YONI_ENEMY[yb].indexOf(ya) >= 0) yoni = 0;
    else if (['Horse', 'Elephant', 'Cow', 'Serpent'].indexOf(ya) >= 0 && ['Horse', 'Elephant', 'Cow', 'Serpent'].indexOf(yb) >= 0) yoni = 3;
    else yoni = 2;
    out.items.push({ name: 'Yoni', max: 4, score: yoni, note: yoni >= 3 ? 'Physical and instinctive compatibility.' : yoni === 2 ? 'Average physical compatibility.' : 'Instinctive clash — needs patience.' });

    /* Graha Maitri */
    var lg = RASHIS[gSign].lord, lb = RASHIS[bSign].lord;
    var r1 = relation(lg, lb), r2 = relation(lb, lg);
    var gm = 3;
    if (r1 === 'friend' && r2 === 'friend') gm = 5;
    else if (r1 === 'friend' && r2 === 'neutral' || r1 === 'neutral' && r2 === 'friend') gm = 4;
    else if (r1 === 'neutral' && r2 === 'neutral') gm = 3;
    else if (r1 === 'enemy' && r2 === 'enemy') gm = 0;
    else if (r1 === 'friend' && r2 === 'enemy' || r1 === 'enemy' && r2 === 'friend') gm = 1;
    else gm = 0.5;
    out.items.push({ name: 'Graha Maitri', max: 5, score: gm, note: gm >= 4 ? 'Minds meet naturally.' : gm >= 3 ? 'Balanced mental wavelength.' : 'Different world views; communication is key.' });

    /* Gana */
    var ga = NAKSHATRAS[gNak].gana, gb = NAKSHATRAS[bNak].gana;
    var gana = 6;
    if (ga === 'Deva' && gb === 'Deva') gana = 6;
    else if (ga === 'Manushya' && gb === 'Manushya') gana = 6;
    else if (ga === 'Rakshasa' && gb === 'Rakshasa') gana = 6;
    else if (ga === 'Deva' && gb === 'Manushya') gana = 6;
    else if (ga === 'Manushya' && gb === 'Deva') gana = 5;
    else if (ga === 'Deva' && gb === 'Rakshasa') gana = 0;
    else if (ga === 'Rakshasa' && gb === 'Deva') gana = 1;
    else gana = 0;
    out.items.push({ name: 'Gana', max: 6, score: gana, note: gana >= 5 ? 'Temperaments blend beautifully.' : 'Temperament mismatch — needs maturity.' });

    /* Bhakoot */
    var d1 = ((bSign - gSign + 12) % 12) + 1;
    var d2 = ((gSign - bSign + 12) % 12) + 1;
    var bhakoot = (d1 + d2 === 14) ? 0 : 7;
    out.items.push({ name: 'Bhakoot', max: 7, score: bhakoot, note: bhakoot ? 'Emotional and material growth supported.' : 'Bhakoot dosha — traditional remedies advised.' });

    /* Nadi */
    var na = NAKSHATRAS[gNak].nadi, nb = NAKSHATRAS[bNak].nadi;
    var nadi = na === nb ? 0 : 8;
    out.items.push({ name: 'Nadi', max: 8, score: nadi, note: nadi ? 'Health and progeny indications are strong.' : 'Nadi dosha — pooja and lifestyle remedies advised.' });

    out.total = out.items.reduce(function (s, i) { return s + i.score; }, 0);
    out.percent = Math.round(out.total / 36 * 100);
    out.label = out.total >= 28 ? 'Excellent Match' : out.total >= 21 ? 'Very Good Match' : out.total >= 18 ? 'Good Match' : out.total >= 12 ? 'Average Match' : 'Needs Careful Review';
    out.manglik = { groom: groom.doshas.manglik, bride: bride.doshas.manglik, note: groom.doshas.manglik === bride.doshas.manglik ? 'Manglik status is balanced between both charts.' : 'One-sided Manglik — Mangal Shanti recommended before marriage.' };
    return out;
  }

  /* ------------------------------------------------------------- festivals */
  /* Amanta lunar month + paksha + tithi definitions (tithi 15 = Purnima in
     Shukla paksha, 15 = Amavasya in Krishna paksha). */
  var FESTIVALS = [
    { m: 1, p: 'S', t: 1, n: 'Gudi Padwa / Ugadi', e: '🌱', h: 12 },
    { m: 1, p: 'S', t: 9, n: 'Ram Navami', e: '🏹' },
    { m: 1, p: 'S', t: 15, n: 'Hanuman Jayanti', e: '🐒', h: 12 },
    { m: 2, p: 'S', t: 3, n: 'Akshaya Tritiya', e: '🪙', h: 12 },
    { m: 2, p: 'S', t: 15, n: 'Buddha Purnima', e: '🪷', h: 12 },
    { m: 3, p: 'S', t: 11, n: 'Nirjala Ekadashi', e: '🌞' },
    { m: 3, p: 'S', t: 15, n: 'Vat Purnima', e: '🌳', h: 12 },
    { m: 4, p: 'S', t: 11, n: 'Devshayani Ekadashi', e: '🛏️' },
    { m: 4, p: 'S', t: 15, n: 'Guru Purnima', e: '🪔', h: 12 },
    { m: 5, p: 'S', t: 3, n: 'Hariyali Teej', e: '🌿', h: 12 },
    { m: 5, p: 'S', t: 5, n: 'Nag Panchami', e: '🐍' },
    { m: 5, p: 'S', t: 15, n: 'Raksha Bandhan', e: '🧵', h: 12 },
    { m: 5, p: 'K', t: 8, n: 'Krishna Janmashtami', e: '🪈', h: 23 },
    { m: 6, p: 'S', t: 4, n: 'Ganesh Chaturthi', e: '🐘', h: 12 },
    { m: 6, p: 'S', t: 8, n: 'Radha Ashtami', e: '🌺', h: 12 },
    { m: 6, p: 'S', t: 14, n: 'Anant Chaturdashi', e: '🌀', h: 12 },
    { m: 6, p: 'K', t: 1, n: 'Pitru Paksha begins', e: '🙏' },
    { m: 6, p: 'K', t: 15, n: 'Mahalaya Amavasya', e: '🕯️' },
    { m: 7, p: 'S', t: 1, n: 'Navratri Ghatasthapana', e: '🌺', h: 12 },
    { m: 7, p: 'S', t: 8, n: 'Durga Ashtami', e: '🦁', h: 12 },
    { m: 7, p: 'S', t: 9, n: 'Maha Navami', e: '⚔️', h: 12 },
    { m: 7, p: 'S', t: 10, n: 'Dussehra', e: '🏹', h: 12 },
    { m: 7, p: 'S', t: 15, n: 'Sharad Purnima', e: '🌕', h: 12 },
    { m: 7, p: 'K', t: 4, n: 'Karwa Chauth', e: '🌙', h: 20 },
    { m: 7, p: 'K', t: 13, n: 'Dhanteras', e: '🪙', h: 18 },
    { m: 7, p: 'K', t: 14, n: 'Narak Chaturdashi', e: '🪔' },
    { m: 7, p: 'K', t: 15, n: 'Diwali / Lakshmi Poojan', e: '🪔', h: 18 },
    { m: 8, p: 'S', t: 1, n: 'Govardhan Puja', e: '🐄', h: 12 },
    { m: 8, p: 'S', t: 2, n: 'Bhai Dooj', e: '🤝', h: 12 },
    { m: 8, p: 'S', t: 6, n: 'Chhath Puja', e: '🌅' },
    { m: 8, p: 'S', t: 11, n: 'Dev Uthani Ekadashi', e: '🛕' },
    { m: 8, p: 'S', t: 15, n: 'Kartik Purnima', e: '🌕', h: 12 },
    { m: 9, p: 'S', t: 11, n: 'Gita Jayanti', e: '📖' },
    { m: 10, p: 'S', t: 15, n: 'Paush Purnima', e: '🌕', h: 12 },
    { m: 11, p: 'S', t: 5, n: 'Vasant Panchami', e: '📚' },
    { m: 11, p: 'K', t: 14, n: 'Maha Shivratri', e: '🔱', h: 23 },
    { m: 12, p: 'S', t: 15, n: 'Holika Dahan', e: '🔥', h: 12 },
    { m: 12, p: 'K', t: 1, n: 'Holi', e: '🎨' }
  ];

  function tithiIndexAt(jd) {
    return Math.floor(elongAt(jd) / 12);
  }

  function festivalsForYear(year, place) {
    place = place || { name: 'Gurugram', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' };
    var tz = place.tz == null ? 5.5 : place.tz;
    var map = {};
    var d = localToDate(year, 1, 1, 12, 0, place);
    var end = localToDate(year + 1, 1, 1, 12, 0, place);
    var seen = {};
    while (d < end) {
      var p = localParts(d, tz);
      var refJD = jdOf(localToDate(p.y, p.m, p.d, 6, 0, place).getTime());
      var lm = lunarMonth(refJD);
      var key = p.y + '-' + pad(p.m) + '-' + pad(p.d);
      var cache = {}, monthCache = {};
      var atJD = function (h) { return jdOf(localToDate(p.y, p.m, p.d, h, 0, place).getTime()); };
      var tAt = function (h) {
        if (cache[h] == null) cache[h] = tithiIndexAt(atJD(h));
        return cache[h];
      };
      var lmAt = function (h) {
        if (monthCache[h] == null) monthCache[h] = lunarMonth(atJD(h));
        return monthCache[h];
      };
      var tIdx = tAt(6);
      var tn = tithiName(tIdx);
      var hits = [];
      if (!lm.adhika) {
        FESTIVALS.forEach(function (f) {
          var hour = f.h == null ? 6 : f.h;
          if (f.p === 'S' && f.t === 15 && f.n.indexOf('Holika') < 0) hour = 6;
          var ti = tAt(hour);
          if (f.p !== (ti < 15 ? 'S' : 'K') || f.t !== (ti % 15 + 1)) return;
          if (lmAt(hour).adhika) return;
          if (f.m === lmAt(hour).num) hits.push(f);
        });
      }
      map[key] = {
        tithiIndex: tIdx, tithiName: tn, lunarMonth: lm.name, adhika: lm.adhika,
        festivals: hits, ekadashi: tIdx === 10 || tIdx === 25,
        purnima: tIdx === 14, amavasya: tIdx === 29
      };
      d = new Date(d.getTime() + 86400000);
    }
    /* remove consecutive duplicate festival names (keep the later observance) */
    var keys = Object.keys(map);
    keys.forEach(function (k) {
      map[k].festivals.forEach(function (f) {
        if (seen[f.n] && seen[f.n] !== k) {
          var a = new Date(seen[f.n] + 'T00:00:00Z').getTime();
          var b = new Date(k + 'T00:00:00Z').getTime();
          if (Math.abs(b - a) === 86400000) {
            var old = map[seen[f.n]];
            if (old) old.festivals = old.festivals.filter(function (x) { return x.n !== f.n; });
          }
        }
        seen[f.n] = k;
      });
    });
    return map;
  }

  /* Every festival is defined by lunar month + paksha + tithi in FESTIVALS.
     This map flips that into "which festivals can fall on tithi N". */
  function tithiFestivalMap() {
    var map = {};
    for (var i = 0; i < 30; i++) map[i] = [];
    FESTIVALS.forEach(function (f) {
      var idx = (f.p === 'S' ? 0 : 15) + (f.t - 1);
      map[idx].push({ name: f.n, icon: f.e, month: MONTHS[f.m - 1], monthNum: f.m });
    });
    return map;
  }

  /* Next civil date on which each of the 30 tithis is current.
     Two samples per day (06:00 and 18:00 local) catch short tithis. */
  function upcomingTithis(place, days, fromDate) {
    place = place || { name: 'Gurugram', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' };
    days = days || 45;
    var base = fromDate || new Date();
    var baseP = localParts(base, place.tz);
    var baseNoon = localToDate(baseP.y, baseP.m, baseP.d, 12, 0, place).getTime();
    var out = {}, found = 0;
    for (var i = 0; i < days && found < 30; i++) {
      var dayMs = baseNoon + i * 86400000;
      var p = localParts(new Date(dayMs), place.tz);
      for (var s = 0; s < 2; s++) {
        var hour = s === 0 ? 6 : 18;
        var local = localToDate(p.y, p.m, p.d, hour, 0, place);
        var jd = jdOf(local.getTime());
        var idx = Math.floor(elongAt(jd) / 12) % 30;
        if (out[idx]) continue;
        var tn = tithiName(idx);
        var lm = lunarMonth(jd);
        out[idx] = {
          index: idx, name: tn.name, paksha: tn.paksha, hi: tn.hi,
          date: local, key: p.y + '-' + pad(p.m) + '-' + pad(p.d),
          lunarMonthName: lm.name, adhika: lm.adhika
        };
        found++;
      }
    }
    return out;
  }

  /* find solar ingress into sidereal Capricorn (Makar Sankranti) */
  function makarSankranti(year, place) {
    var start = localToDate(year, 1, 10, 0, 0, place || { tz: 'Asia/Kolkata' });
    var jd = jdOf(start.getTime());
    var f = function (j) { return norm(sunTropical(j) - ayanamsa(j)); };
    var found = nextCrossing(f, 270, jd, 20);
    return found;
  }

  /* ------------------------------------------------------------ muhurat */
  function muhuratList(place, days) {
    days = days || 30;
    var out = [];
    var today = new Date();
    for (var i = 0; i < days; i++) {
      var d = new Date(today.getTime() + i * 86400000);
      var p = localParts(d, place.tz);
      var pc = panchang(p.y, p.m, p.d, place);
      var badTithi = [3, 8, 13, 18, 22, 23, 28].indexOf(pc.tithi.index) >= 0;
      var badNak = [1, 2, 5, 8, 9, 17, 18, 23].indexOf(pc.nakshatra.index) >= 0;
      out.push({
        date: new Date(pc.sunrise.getTime()), key: p.y + '-' + pad(p.m) + '-' + pad(p.d),
        day: WEEKDAYS[pc.weekdayIndex].slice(0, 3), tithi: pc.tithi, nakshatra: pc.nakshatra,
        rahu: pc.rahu, abhijit: pc.abhijit, sunrise: pc.sunrise, sunset: pc.sunset,
        shubh: !badTithi && !badNak,
        score: (!badTithi ? 2 : 0) + (!badNak ? 2 : 0) + (pc.tithi.index === 10 || pc.tithi.index === 25 ? 1 : 0)
      });
    }
    return out;
  }

  /* ------------------------------------------------------------- public API */
  return {
    RASHIS: RASHIS, NAKSHATRAS: NAKSHATRAS, TITHIS: TITHIS, YOGAS: YOGAS,
    TITHI_META: TITHI_BASE, YOGA_MEANINGS: YOGA_MEANINGS, YOGA_BAD: YOGA_BAD,
    KARANA_META: KARANA_META, FESTIVALS: FESTIVALS, RITUS: RITUS,
    PLANETS: PLANETS, VIMSHOTTARI: VIMSHOTTARI, WEEKDAYS: WEEKDAYS, MONTHS: MONTHS,
    VARGAS: VARGAS, BHAVA_META: BHAVA_META, AVASTHA: AVASTHA,
    NAKSHATRA_SYLLABLES: NAKSHATRA_SYLLABLES, NAKSHATRA_SYLLABLES_HI: NAKSHATRA_SYLLABLES_HI,
    NAKSHATRA_NATURE: NAKSHATRA_NATURE, GANA_MEANING: GANA_MEANING, NADI_MEANING: NADI_MEANING,
    vargaSign: vargaSign, nakshatraProfile: nakshatraProfile, avastha: avastha,
    norm: norm, ayanamsa: ayanamsa, sunTropical: sunTropical, moonTropical: moonTropical,
    sunLong: sunTropical, moonLong: moonTropical, tropicalPositions: tropicalPositions,
    planetSet: planetSet, ascendant: ascendant, gmst: gmst, obliquity: obliquity,
    julian: jdOf, localToDate: localToDate, localParts: localParts, dateKey: dateKey,
    offsetAt: offsetAt, fmtTime: fmtTime, fmtDate: fmtDate, fmtShort: fmtShort,
    tithiName: tithiName, tithiMeta: tithiMeta, lunarMonth: lunarMonth, findSunTimes: findSunTimes,
    findMoonTimes: findMoonTimes, moonPhaseInfo: moonPhaseInfo,
    panchang: panchang, panchangForDate: panchangForDate,
    kundli: kundli, vimshottari: vimshottari, ashtakoot: ashtakoot,
    festivalsForYear: festivalsForYear, tithiFestivalMap: tithiFestivalMap,
    upcomingTithis: upcomingTithis, makarSankranti: makarSankranti,
    muhuratList: muhuratList, sign180: sign180, nextCrossing: nextCrossing
  };
});
