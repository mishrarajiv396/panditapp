/* Vedic Pooja — daily rashifal: moon-sign transit readings computed by astro.js */
(function () {
  'use strict';
  var A = window.App, V = window.Vedic, D = window.PanditData;
  if (!A || !V || !D) return;
  var $ = A.$, $$ = A.$$;

  function isHi() { return A.isHi && A.isHi(); }
  function hn(cat, key) {
    if (!isHi()) return key;
    var t = window.VPAstroHi;
    return t && t.get ? t.get(cat, key) : key;
  }
  function T(en, hi) { return isHi() ? hi : en; }
  function hiShort(date, tz) {
    if (!isHi()) return V.fmtShort(date, tz);
    var p = V.localParts(date, tz);
    return p.d + ' ' + HI_MONTHS_SHORT[p.m - 1];
  }
  function houseOf(i) { return isHi() ? HI_HOUSES[i] : HOUSES[i]; }

  var SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var ELEMENT = ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'];
  var DIRECTION = { Fire: 'East', Earth: 'South', Air: 'West', Water: 'North' };
  var COLOUR = ['Red', 'White', 'Green', 'Silver', 'Gold', 'Green', 'White / pink', 'Red', 'Yellow', 'Blue', 'Blue', 'Yellow'];
  var GEM = ['Red Coral', 'Emerald', 'Pearl', 'Pearl', 'Ruby', 'Emerald', 'Diamond', 'Red Coral', 'Yellow Sapphire', 'Blue Sapphire', 'Blue Sapphire', 'Yellow Sapphire'];
  var MANTRA = ['Om Mangalaya Namah', 'Om Shukraya Namah', 'Om Budhaya Namah', 'Om Chandraya Namah', 'Om Suryaya Namah', 'Om Budhaya Namah', 'Om Shukraya Namah', 'Om Mangalaya Namah', 'Om Gurave Namah', 'Om Shanaischaraya Namah', 'Om Shanaischaraya Namah', 'Om Gurave Namah'];
  var HI_MANTRA = [
    'ॐ मंगलाय नमः', 'ॐ शुक्राय नमः', 'ॐ बुधाय नमः', 'ॐ चन्द्राय नमः',
    'ॐ सूर्याय नमः', 'ॐ बुधाय नमः', 'ॐ शुक्राय नमः', 'ॐ मंगलाय नमः',
    'ॐ गुरवे नमः', 'ॐ शनैश्चराय नमः', 'ॐ शनैश्चराय नमः', 'ॐ गुरवे नमः'
  ];
  var NUMBERS = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };

  var HOUSES = [
    { n: 1, title: 'Self & first steps', tone: 'good', text: 'The Moon sits in your first house today. Emotions are close to the surface, so lead with honesty and let your instincts set the pace. A good day for personal decisions, a new habit or simply being seen.', do: 'Start something that carries your name.', avoid: 'Reacting before you have slept on a big decision.' },
    { n: 2, title: 'Family & finances', tone: 'neutral', text: 'The Moon moves through your second house — the house of family, speech and savings. Conversations about money or home may surface. Steady words and a written budget keep the day calm.', do: 'Review a bill, a budget or a family plan.', avoid: 'Impulse purchases and sharp words at the dinner table.' },
    { n: 3, title: 'Courage & communication', tone: 'good', text: 'The Moon is in your third house, which favours courage, siblings and short journeys. Messages you have been postponing can be sent today; your words carry more weight than usual.', do: 'Make the call, send the message, take the short trip.', avoid: 'Over-explaining yourself to people who are not listening.' },
    { n: 4, title: 'Home & inner peace', tone: 'tough', text: 'The Moon is in your fourth house — home, mother and emotional security. The mind wants rest rather than performance. Create a quiet corner, cook something familiar and protect your evening.', do: 'Tidy one room and spend time with family.', avoid: 'Big property decisions or confrontations at home.' },
    { n: 5, title: 'Creativity & children', tone: 'neutral', text: 'The Moon lights your fifth house of creativity, romance and children. Ideas flow easily, but focus needs a gentle structure. Play, teach, write or practise — the day rewards expression more than output.', do: 'Create, teach or spend time with children.', avoid: 'Speculative bets and emotional over-investment.' },
    { n: 6, title: 'Work & wellbeing', tone: 'good', text: 'The Moon is in your sixth house, the house of service, health and daily routines. Small disciplined actions compound today. Clear the backlog, keep the meal simple and finish one nagging task.', do: 'Finish the task you keep avoiding.', avoid: 'Skipping meals or letting stress borrow tomorrow’s energy.' },
    { n: 7, title: 'Partnership & balance', tone: 'good', text: 'The Moon transits your seventh house of partnership and public dealings. Other people are mirrors today — listen first and the negotiation becomes easier. Good for meetings, agreements and repairing a bond.', do: 'Have the honest one-to-one conversation.', avoid: 'Keeping score or winning an argument at the cost of the relationship.' },
    { n: 8, title: 'Depth & transformation', tone: 'tough', text: 'The Moon travels your eighth house of hidden matters, research and shared resources. Intensity is high; certainty is low. Avoid signing in haste and let information surface before you act.', do: 'Study, investigate, clear old paperwork.', avoid: 'Loans, secrecy and decisions made from fear.' },
    { n: 9, title: 'Fortune & dharma', tone: 'neutral', text: 'The Moon is in your ninth house of dharma, teachers and long journeys. Perspective widens today. A conversation with an elder, a prayer or a plan for travel can shift how a problem looks.', do: 'Seek guidance and plan the longer journey.', avoid: 'Cynicism and dismissing advice too quickly.' },
    { n: 10, title: 'Career & visibility', tone: 'good', text: 'The Moon reaches your tenth house of career and public life. Effort is visible and superiors are receptive. Put the important meeting or submission in the first half of the day and keep the message simple.', do: 'Send the proposal and ask for the decision.', avoid: 'Office politics and emotional public statements.' },
    { n: 11, title: 'Gains & community', tone: 'good', text: 'The Moon is in your eleventh house of gains, friends and networks. People want to help. Reach out, follow up and collect the support you have earned — a group or community is your lucky channel today.', do: 'Follow up on an opportunity and thank your network.', avoid: 'Over-promising time or money you cannot spare.' },
    { n: 12, title: 'Rest & release', tone: 'tough', text: 'The Moon is in your twelfth house of sleep, expenses and foreign matters. Energy is inward, not outward. Declutter, forgive, finish quietly and protect your sleep. This is a recharge day, not a scoreboard day.', do: 'Rest, meditate, clear expenses and old files.', avoid: 'Forcing a confrontation or starting a large purchase.' }
  ];

  var HI_HOUSES = [
    { title: 'स्वयं और नई शुरुआत', text: 'आज चंद्रमा आपके प्रथम भाव में है। भावनाएँ सतह के करीब हैं, इसलिए ईमानदारी से आगे बढ़ें और अपनी सहज बुद्धि को गति तय करने दें। निजी निर्णय, एक नई आदत या बस अपनी उपस्थिति दर्ज कराने के लिए अच्छा दिन है।', do: 'ऐसा कुछ शुरू करें जिस पर आपका नाम हो।', avoid: 'बड़े निर्णय पर सोच-विचार से पहले प्रतिक्रिया देने से बचें।' },
    { title: 'परिवार और आर्थिक स्थिति', text: 'चंद्रमा आपके द्वितीय भाव — परिवार, वाणी और बचत के भाव — से गुजर रहा है। पैसे या घर से जुड़ी बातचीत उभर सकती है। संयमित शब्द और लिखित बजट दिन को शांत रखेंगे।', do: 'किसी बिल, बजट या पारिवारिक योजना की समीक्षा करें।', avoid: 'भावनाओं में खरीदारी और खाने की मेज पर तीखे शब्दों से बचें।' },
    { title: 'साहस और संवाद', text: 'चंद्रमा आपके तृतीय भाव में है, जो साहस, भाई-बहनों और छोटी यात्राओं का पक्षधर है। जिन संदेशों को आप टाल रहे थे, वे आज भेजे जा सकते हैं; आपके शब्दों में सामान्य से अधिक वजन होगा।', do: 'कॉल करें, संदेश भेजें, छोटी यात्रा करें।', avoid: 'जो सुन नहीं रहे हैं उन्हें खुद को समझाने से बचें।' },
    { title: 'घर और आंतरिक शांति', text: 'चंद्रमा आपके चतुर्थ भाव — घर, माता और भावनात्मक सुरक्षा — में है। मन प्रदर्शन से अधिक विश्राम चाहता है। एक शांत कोना बनाएं, परिचित कुछ पकाएं और अपनी शाम सुरक्षित रखें।', do: 'एक कमरा व्यवस्थित करें और परिवार के साथ समय बिताएं।', avoid: 'बड़े संपत्ति निर्णय या घर पर टकराव से बचें।' },
    { title: 'रचनात्मकता और संतान', text: 'चंद्रमा आपके पंचम भाव — रचनात्मकता, प्रेम और संतान — को प्रकाशित करता है। विचार सहज बहते हैं, पर एकाग्रता को सौम्य ढांचा चाहिए। खेलें, सिखाएं, लिखें या अभ्यास करें — दिन उत्पादन से अधिक अभिव्यक्ति को पुरस्कृत करता है।', do: 'रचना करें, सिखाएं या बच्चों के साथ समय बिताएं।', avoid: 'सट्टेबाजी और भावनात्मक अति-निवेश से बचें।' },
    { title: 'काम और स्वास्थ्य', text: 'चंद्रमा आपके षष्ठ भाव — सेवा, स्वास्थ्य और दिनचर्या — में है। छोटे अनुशासित कदम आज संचित होते हैं। बैकलॉग साफ करें, भोजन सरल रखें और एक लंबित काम पूरा करें।', do: 'जो काम आप टाल रहे हैं उसे पूरा करें।', avoid: 'भोजन छोड़ने या तनाव को कल की ऊर्जा उधार लेने देने से बचें।' },
    { title: 'साझेदारी और संतुलन', text: 'चंद्रमा आपके सप्तम भाव — साझेदारी और सार्वजनिक व्यवहार — से गुजरता है। आज दूसरे लोग दर्पण हैं — पहले सुनें और बातचीत आसान हो जाएगी। बैठकों, समझौतों और रिश्ते सुधारने के लिए अच्छा दिन।', do: 'ईमानदार आमने-सामने की बातचीत करें।', avoid: 'हिसाब रखने या रिश्ते की कीमत पर बहस जीतने से बचें।' },
    { title: 'गहराई और परिवर्तन', text: 'चंद्रमा आपके अष्टम भाव — छिपे मामले, शोध और साझा संसाधन — में यात्रा करता है। तीव्रता अधिक है; निश्चितता कम। जल्दबाजी में हस्ताक्षर से बचें और कार्य करने से पहले जानकारी सामने आने दें।', do: 'अध्ययन करें, जाँच करें, पुराने कागज़ात निपटाएँ।', avoid: 'ऋण, गोपनीयता और डर से लिए गए निर्णयों से बचें।' },
    { title: 'भाग्य और धर्म', text: 'चंद्रमा आपके नवम भाव — धर्म, गुरु और लंबी यात्राओं — में है। आज दृष्टिकोण विस्तृत होता है। किसी वरिष्ठ से बातचीत, प्रार्थना या यात्रा की योजना किसी समस्या का रूप बदल सकती है।', do: 'मार्गदर्शन लें और लंबी यात्रा की योजना बनाएं।', avoid: 'निंदकता और सलाह को जल्दी खारिज करने से बचें।' },
    { title: 'करियर और पहचान', text: 'चंद्रमा आपके दशम भाव — करियर और सार्वजनिक जीवन — तक पहुँचता है। प्रयास दिखाई देता है और वरिष्ठ सहयोगी हैं। महत्वपूर्ण बैठक या प्रस्तुति दिन के पहले भाग में रखें और संदेश सरल रखें।', do: 'प्रस्ताव भेजें और निर्णय मांगें।', avoid: 'ऑफिस की राजनीति और भावनात्मक सार्वजनिक बयानों से बचें।' },
    { title: 'लाभ और समुदाय', text: 'चंद्रमा आपके एकादश भाव — लाभ, मित्र और नेटवर्क — में है। लोग मदद करना चाहते हैं। संपर्क करें, फॉलो-अप करें और अर्जित सहयोग एकत्र करें — आज कोई समूह या समुदाय आपका भाग्यशाली माध्यम है।', do: 'किसी अवसर पर फॉलो-अप करें और अपने नेटवर्क को धन्यवाद दें।', avoid: 'जितना समय या पैसा नहीं दे सकते उसका वादा करने से बचें।' },
    { title: 'विश्राम और मुक्ति', text: 'चंद्रमा आपके द्वादश भाव — नींद, खर्च और विदेशी मामलों — में है। ऊर्जा भीतर की ओर है, बाहर की नहीं। अव्यवस्था हटाएं, क्षमा करें, चुपचाप काम पूरा करें और नींद की रक्षा करें। यह रिचार्ज का दिन है, स्कोरबोर्ड का नहीं।', do: 'आराम करें, ध्यान करें, खर्च और पुरानी फाइलें साफ करें।', avoid: 'टकराव थोपने या बड़ी खरीद शुरू करने से बचें।' }
  ];

  var HI_ELEMENT = { Fire: 'अग्नि', Earth: 'पृथ्वी', Air: 'वायु', Water: 'जल' };
  var HI_DIRECTION = { Fire: 'पूर्व', Earth: 'दक्षिण', Air: 'पश्चिम', Water: 'उत्तर' };
  var HI_COLOUR = ['लाल', 'सफ़ेद', 'हरा', 'चाँदी', 'सोना', 'हरा', 'सफ़ेद / गुलाबी', 'लाल', 'पीला', 'नीला', 'नीला', 'पीला'];
  var HI_GEM = ['मूँगा', 'पन्ना', 'मोती', 'मोती', 'माणिक्य', 'पन्ना', 'हीरा', 'मूँगा', 'पुखराज', 'नीलम', 'नीलम', 'पुखराज'];
  var HI_LABEL = { Excellent: 'उत्कृष्ट', Strong: 'प्रबल', Steady: 'स्थिर', Mixed: 'मिश्रित', Careful: 'सावधानी' };
  var HI_MONTHS_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];


  var city = D.CITIES[0];
  try {
    var saved = A.store.get('vp_city', null);
    if (saved) {
      var found = D.CITIES.filter(function (c) { return c.name === saved; })[0];
      if (found) city = found;
    }
  } catch (e) { /* ignore */ }

  var state = { y: 0, m: 0, d: 0, selected: 0 };
  var followingToday = true;
  try {
    var prev = A.store.get('vp_rashi_index', null);
    if (typeof prev === 'number' && prev >= 0 && prev < 12) state.selected = prev;
  } catch (e2) { /* ignore */ }

  function todayParts() {
    var n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
  }
  function iso() { return state.y + '-' + A.pad(state.m) + '-' + A.pad(state.d); }
  function setDate(p) { state.y = p.y; state.m = p.m; state.d = p.d; }
  function addDays(n) {
    var x = new Date(state.y, state.m - 1, state.d, 12);
    x.setDate(x.getDate() + n);
    setDate({ y: x.getFullYear(), m: x.getMonth() + 1, d: x.getDate() });
  }

  function compute() {
    try { return V.panchang(state.y, state.m, state.d, city); }
    catch (e) { return null; }
  }

  function scoreFor(p, h) {
    var s = h.tone === 'good' ? 4.4 : (h.tone === 'neutral' ? 3.2 : 2.1);
    s += p.tithi.shubh ? .4 : -.3;
    var nat = p.nakshatra.nature;
    s += (nat === 'Kshipra' || nat === 'Chara' || nat === 'Mridu' || nat === 'Dhruva') ? .2 : -.2;
    s += p.yoga.shubh ? .3 : -.3;
    s += p.tithi.paksha === 'Shukla' ? .2 : -.2;
    s = Math.max(1, Math.min(5, s));
    return Math.round(s * 2) / 2;
  }

  function stars(score) {
    var full = Math.floor(score);
    var half = score - full >= .5;
    var out = '';
    for (var i = 0; i < 5; i++) {
      if (i < full) out += '★';
      else if (i === full && half) out += '⯨';
      else out += '☆';
    }
    return out;
  }

  function label(score) {
    var key = 'Careful';
    if (score >= 4.5) key = 'Excellent';
    else if (score >= 3.5) key = 'Strong';
    else if (score >= 2.8) key = 'Steady';
    else if (score >= 2) key = 'Mixed';
    return isHi() ? HI_LABEL[key] : key;
  }

  function renderSummary(p) {
    if (!p) return;
    var d = $('#rashSummary');
    if (!d) return;
    var dateEl = $('.rash-summary__date b', d);
    var placeEl = $('.rash-summary__date span', d);
    if (dateEl) dateEl.textContent = hiShort(p.sunrise, city.tz);
    if (placeEl) placeEl.textContent = hn('weekday', p.weekday) + ' · ' + A.place(city);
    var rows = $('#rashSummaryRows');
    if (rows) {
      var tz = city.tz;
      var moonRashi = V.RASHIS[p.moonSign];
      rows.innerHTML = [
        [T('Tithi', 'तिथि'), hn('paksha', p.tithi.paksha) + ' ' + hn('tithi', p.tithi.name)],
        [T('Nakshatra', 'नक्षत्र'), hn('nakshatra', p.nakshatra.name) + T(' · pada ', ' · पाद ') + p.nakshatra.pada],
        [T('Yoga', 'योग'), hn('yoga', p.yoga.name)],
        [T('Moon in', 'चंद्रमा'), isHi()
          ? moonRashi.hi + ' राशि'
          : moonRashi.s + ' (' + moonRashi.n + ')'],
        [T('Sunrise / sunset', 'सूर्योदय / सूर्यास्त'), V.fmtTime(p.sunrise, tz) + ' / ' + V.fmtTime(p.sunset, tz)],
        [T('Rahu Kaal', 'राहु काल'), V.fmtTime(p.rahu.start, tz) + ' – ' + V.fmtTime(p.rahu.end, tz)]
      ].map(function (r) {
        return '<div class="rash-summary__row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
      }).join('');
    }
    var wd = $('#rashWeekday');
    if (wd) wd.textContent = hn('weekday', p.weekday) + ' · ' + hn('nakshatra', p.nakshatra.name) + T(' nakshatra', ' नक्षत्र');
  }

  function renderGrid(p) {
    var grid = $('#rashiGrid');
    if (!grid || !p) return;
    grid.innerHTML = V.RASHIS.map(function (r, i) {
      var house = HOUSES[((p.moonSign - i + 12) % 12)];
      var hiHouse = HI_HOUSES[((p.moonSign - i + 12) % 12)];
      var sc = scoreFor(p, house);
      var active = i === state.selected;
      return '<button type="button" class="rashi-card xp-depth' + (active ? ' is-active' : '') + '" data-i="' + i + '" aria-pressed="' + active + '">' +
        '<span class="rashi-card__glyph" aria-hidden="true">' + SIGNS[i] + '</span>' +
        '<span class="rashi-card__name"><b>' + (isHi() ? r.hi : r.s) + '</b><small>' +
          (isHi() ? HI_ELEMENT[ELEMENT[i]] + ' · स्वामी ' + hn('planet', r.lord) : r.n + ' · ' + r.hi) + '</small></span>' +
        '<span class="rashi-card__house">' + T('Moon in house ' + house.n, 'चंद्रमा ' + house.n + ' भाव में') + '</span>' +
        '<span class="rashi-card__stars" aria-label="' + T(sc + ' out of 5', '5 में से ' + sc) + '">' + stars(sc) + '</span>' +
        '<span class="rashi-card__tone">' + label(sc) + ' · ' + (isHi() ? hiHouse.title : house.title) + '</span>' +
        '</button>';
    }).join('');
    $$('.rashi-card', grid).forEach(function (el) {
      el.addEventListener('click', function () {
        state.selected = Number(el.getAttribute('data-i'));
        try { A.store.set('vp_rashi_index', state.selected); } catch (e) { /* ignore */ }
        $$('.rashi-card', grid).forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-pressed', 'false');
        });
        el.classList.add('is-active');
        el.setAttribute('aria-pressed', 'true');
        renderDetail(p);
      });
    });
  }

  function renderDetail(p) {
    var box = $('#rashiDetail');
    if (!box || !p) return;
    var i = state.selected;
    var r = V.RASHIS[i];
    var h = HOUSES[((p.moonSign - i + 12) % 12)];
    var sc = scoreFor(p, h);
    var tz = city.tz;
    var good = p.choghadiya.filter(function (c) { return c.good; }).slice(0, 2);
    var lord = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][p.weekdayIndex];
    var lagna = T(
      p.weekday + ' is ruled by ' + lord + '.',
      hn('weekday', p.weekday) + ' का स्वामी ' + hn('planet', lord) + ' है।'
    );
    var tithiLine = p.tithi.shubh
      ? T('The ' + p.tithi.paksha + ' ' + p.tithi.name + ' tithi supports new beginnings — ' + p.tithi.guidance,
          hn('paksha', p.tithi.paksha) + ' ' + hn('tithi', p.tithi.name) + ' तिथि नई शुरुआत का समर्थन करती है — ' + hn('tithiGuidance', p.tithi.name))
      : T('The ' + p.tithi.paksha + ' ' + p.tithi.name + ' tithi is a Rikta day — keep the focus on clearing and completing rather than launching.',
          hn('paksha', p.tithi.paksha) + ' ' + hn('tithi', p.tithi.name) + ' तिथि रिक्ता है — नई शुरुआत के बजाय सफाई और पूर्णता पर ध्यान दें।');
    box.innerHTML =
      '<div class="panel__head"><div class="rashi-detail__title"><span class="rashi-detail__glyph">' + SIGNS[i] + '</span>' +
      '<div><h2>' + (isHi() ? r.hi + ' <span class="muted">· राशि</span>' : r.s + ' <span class="muted">· ' + r.n + '</span>') + '</h2><p class="small">' +
      (isHi() ? '' : r.hi + ' · ') +
      T('ruled by ' + r.lord + ' · ' + ELEMENT[i] + ' sign · Moon in house ' + h.n,
        'स्वामी ' + hn('planet', r.lord) + ' · ' + HI_ELEMENT[ELEMENT[i]] + ' राशि · चंद्रमा ' + h.n + ' भाव में') + '</p></div></div>' +
      '<span class="chip chip--gold">' + label(sc) + ' · ' + sc + '/5</span></div>' +
      '<div class="panel__body">' +
      '<p class="rashi-detail__lead">' + (isHi() ? HI_HOUSES[((p.moonSign - i + 12) % 12)].text : h.text) + '</p>' +
      '<p class="small muted mt-2">' + lagna + ' ' + tithiLine + '</p>' +
      '<div class="rashi-lucky">' +
      '<div><span>' + T('Lucky colour', 'शुभ रंग') + '</span><b>' + (isHi() ? HI_COLOUR[i] : COLOUR[i]) + '</b></div>' +
      '<div><span>' + T('Lucky number', 'शुभ अंक') + '</span><b>' + (NUMBERS[r.lord] || 5) + '</b></div>' +
      '<div><span>' + T('Direction', 'दिशा') + '</span><b>' + (isHi() ? HI_DIRECTION[ELEMENT[i]] : DIRECTION[ELEMENT[i]]) + '</b></div>' +
      '<div><span>' + T('Gemstone', 'रत्न') + '</span><b>' + (isHi() ? HI_GEM[i] : GEM[i]) + '</b></div>' +
      '</div>' +
      '<div class="rashi-do">' +
      '<div><h3>' + T('Do', 'करें') + '</h3><ul><li>' + (isHi() ? HI_HOUSES[((p.moonSign - i + 12) % 12)].do : h.do) + '</li><li>' +
      hn('nakshatra', p.nakshatra.name) + T(' nakshatra favours ' + (p.nakshatra.nature === 'Kshipra' ? 'quick, decisive action' : (p.nakshatra.nature === 'Mridu' ? 'gentle, creative work' : 'steady, well-planned effort')) + '.',
        ' नक्षत्र ' + (p.nakshatra.nature === 'Kshipra' ? 'तेज, निर्णायक कार्य' : (p.nakshatra.nature === 'Mridu' ? 'सौम्य, रचनात्मक कार्य' : 'स्थिर, सुनियोजित प्रयास')) + ' के लिए अनुकूल है।') + '</li>' +
      (good.length ? '<li>' + T('Use the ' + good.map(function (g) { return g.name + ' window (' + V.fmtTime(g.start, tz) + '–' + V.fmtTime(g.end, tz) + ')'; }).join(' or ') + ' for anything important.',
        'किसी भी महत्वपूर्ण कार्य के लिए ' + good.map(function (g) { return hn('choghadiya', g.name) + ' अवधि (' + V.fmtTime(g.start, tz) + '–' + V.fmtTime(g.end, tz) + ')'; }).join(' या ') + ' का उपयोग करें।') + '</li>' : '') +
      '</ul></div>' +
      '<div><h3>' + T('Avoid', 'बचें') + '</h3><ul><li>' + (isHi() ? HI_HOUSES[((p.moonSign - i + 12) % 12)].avoid : h.avoid) + '</li><li>' +
      T('Rahu Kaal ' + V.fmtTime(p.rahu.start, tz) + '–' + V.fmtTime(p.rahu.end, tz) + ' for new starts.',
        'नई शुरुआत के लिए राहु काल ' + V.fmtTime(p.rahu.start, tz) + '–' + V.fmtTime(p.rahu.end, tz) + ' से बचें।') + '</li>' +
      (!p.tithi.shubh ? '<li>' + T('Avoid launching a major purchase or signing on this tithi.', 'इस तिथि पर बड़ी खरीद या हस्ताक्षर टालें।') + '</li>' : '') +
      (!p.yoga.shubh ? '<li>' + T(p.yoga.name + ' yoga is considered weak — postpone risky travel.', hn('yoga', p.yoga.name) + ' योग कमजोर माना जाता है — जोखिम भरी यात्रा टालें।') + '</li>' : '') +
      '</ul></div>' +
      '</div>' +
      '<div class="rashi-mantra"><span data-ico-inline="om"></span><div><b>' + T('Mantra for ' + r.s, r.hi + ' के लिए मंत्र') + '</b><p>' + (isHi() ? HI_MANTRA[i] : MANTRA[i]) + T(' — 108 times at sunrise, facing ' + DIRECTION[ELEMENT[i]] + '.', ' — सूर्योदय के समय ' + HI_DIRECTION[ELEMENT[i]] + ' की ओर मुख करके 108 बार जपें।') + '</p></div></div>' +
      '<div class="hero__cta mt-3"><a class="btn btn--primary btn--sm" href="kundli.html">' + T('Confirm my moon sign', 'अपनी राशि पुष्ट करें') + '</a><a class="btn btn--ghost btn--sm" href="panchang.html?city=' + encodeURIComponent(city.name) + '">' + T('Full panchang', 'पूरा पंचांग') + '</a></div>' +
      '</div>';
    $$('[data-ico-inline]', box).forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });
  }

  function render() {
    var p = compute();
    if (!p) return;
    var dateInp = $('#rashDate');
    if (dateInp) dateInp.value = iso();
    renderSummary(p);
    renderGrid(p);
    renderDetail(p);
  }

  function init() {
    $$('[data-prev]').forEach(function (b) { b.innerHTML = A.icon('arrowLeft'); });
    $$('[data-next]').forEach(function (b) { b.innerHTML = A.icon('arrow'); });
    $$('[data-ico-inline]').forEach(function (el) { el.innerHTML = A.icon(el.getAttribute('data-ico-inline')); });

    var q = /[?&]date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (q) setDate({ y: Number(q[1]), m: Number(q[2]), d: Number(q[3]) });
    else setDate(todayParts());
    followingToday = sameDay(todayParts());

    var dateInp = $('#rashDate');
    if (dateInp) {
      dateInp.value = iso();
      dateInp.addEventListener('change', function () {
        if (!dateInp.value) return;
        var parts = dateInp.value.split('-').map(Number);
        setDate({ y: parts[0], m: parts[1], d: parts[2] });
        followingToday = sameDay(todayParts());
        render();
      });
    }
    var prev = $('#rashPrev'), next = $('#rashNext'), today = $('#rashToday');
    if (prev) prev.addEventListener('click', function () { addDays(-1); followingToday = sameDay(todayParts()); render(); });
    if (next) next.addEventListener('click', function () { addDays(1); followingToday = sameDay(todayParts()); render(); });
    if (today) today.addEventListener('click', function () { setDate(todayParts()); followingToday = true; render(); });

    var sel = $('#rashCity');
    if (sel) {
      sel.innerHTML = A.cityOptions(city.name);
      var search = $('#rashCitySearch');
      if (search) {
        search.addEventListener('input', function () {
          var keep = sel.value;
          sel.innerHTML = A.cityOptions(keep, search.value);
          if (keep) sel.value = keep;
        });
      }
      sel.addEventListener('change', function () {
        var found = A.findCity(sel.value);
        if (!found) return;
        city = found;
        A.store.set('vp_city', city.name);
        render();
      });
    }

    var cityQ = /[?&]city=([^&]+)/.exec(location.search);
    if (cityQ) {
      var name = decodeURIComponent(cityQ[1].replace(/\+/g, ' '));
      var hit = D.CITIES.filter(function (c) { return c.name === name; })[0];
      if (hit) { city = hit; if (sel) sel.value = city.name; }
    }

    if (A.onLang) A.onLang(function () { render(); });

    render();
  }

  /* The horoscope is for a date. If that date is today, refresh it at
     midnight and when the tab wakes up, without disturbing a chosen date. */
  function sameDay(t) { return state.y === t.y && state.m === t.m && state.d === t.d; }
  function liveTick() {
    var t = todayParts();
    if (!sameDay(t) && !followingToday) return;
    if (!sameDay(t)) setDate(t);
    render();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') liveTick();
  });
  window.addEventListener('pageshow', liveTick);
  window.addEventListener('focus', liveTick);
  setInterval(liveTick, 60000);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
