/* Services — icons, Pooja Paath counts and the numerology calculator */
(function () {
  'use strict';
  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;
  var esc = A.esc;

  /* ---------------------------------------------------------------- icons */
  function paintIcons(root) {
    $$('[data-svc-icon]', root || document).forEach(function (el) {
      var name = el.getAttribute('data-svc-icon');
      if (el.getAttribute('data-painted') === '1') return;
      var svg = A.icon(name);
      if (svg) {
        el.innerHTML = svg;
        el.setAttribute('data-painted', '1');
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ------------------------------------------------- Pooja Paath counts */
  function matchPooja(p, filter) {
    var bits = filter.split(':');
    var kind = bits[0], value = bits.slice(1).join(':');
    if (kind === 'cat') return p.cat === value;
    var q = value.toLowerCase();
    var hay = [p.name, p.hi, p.cat, p.desc, (p.tags || []).join(' '), (p.includes || []).join(' ')].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function paintPaathCounts() {
    $$('[data-paath]').forEach(function (card) {
      var filter = card.getAttribute('data-paath');
      var n = D.POOJAS.filter(function (p) { return matchPooja(p, filter); }).length;
      var out = $('[data-paath-count]', card);
      if (out) out.textContent = n + (n === 1 ? ' ritual' : ' rituals');
    });
  }

  /* --------------------------------------------------------- numerology */
  var NUM = {
    1: {
      planet: 'Sun (Surya)', title: 'The leader', day: 'Sunday', colour: 'Gold & deep red', gem: 'Ruby',
      text: 'You lead before you are asked to. Authority, visibility and a clean reputation matter to you, and you do best when you are accountable for a whole outcome rather than a fragment of it. Watch the tendency to carry everything alone — delegation is the discipline that keeps the Sun from burning out.'
    },
    2: {
      planet: 'Moon (Chandra)', title: 'The diplomat', day: 'Monday', colour: 'White & silver', gem: 'Pearl',
      text: 'You read a room before anyone speaks. Partnership, care and quiet negotiation are your natural instruments, and people trust you with the things they do not say aloud. The shadow side is indecision and absorbing other people’s moods; a steady daily routine is your anchor.'
    },
    3: {
      planet: 'Jupiter (Brihaspati)', title: 'The teacher', day: 'Thursday', colour: 'Yellow & saffron', gem: 'Yellow sapphire',
      text: 'You learn quickly and explain well, which makes you the natural teacher, adviser or storyteller in any group. Growth comes through knowledge, mentors and doing things for the right reason. Guard against scattering your energy across too many ideas at once.'
    },
    4: {
      planet: 'Rahu', title: 'The builder', day: 'Saturday', colour: 'Grey & slate blue', gem: 'Hessonite',
      text: 'You are here to make structures that outlast the mood of the moment. Systems, discipline and patient repetition suit you, and you often arrive at success by an unconventional route. The lesson is to respect the process without letting fear of disorder run the whole show.'
    },
    5: {
      planet: 'Mercury (Budh)', title: 'The communicator', day: 'Wednesday', colour: 'Green', gem: 'Emerald',
      text: 'Change does not unsettle you — it refreshes you. You are quick, adaptable and good with words, numbers and negotiation, which suits commerce, media and anything that moves. Your work is to finish what you start and to keep your word when the novelty fades.'
    },
    6: {
      planet: 'Venus (Shukra)', title: 'The harmoniser', day: 'Friday', colour: 'White & soft pink', gem: 'Diamond',
      text: 'You are wired for beauty, comfort and the people you love. Homes, hospitality, design, food and relationship-led work bring out your best. The trap is over-giving in order to keep the peace; boundaries make your generosity sustainable rather than resentful.'
    },
    7: {
      planet: 'Ketu', title: 'The seeker', day: 'Monday', colour: 'Sea green & grey', gem: 'Cat’s eye',
      text: 'You need meaning, not just results. Research, spiritual practice, analysis and solitude restore you, and you often see the pattern others miss. Because detachment comes easily, the work is to stay present with people and to trust the ordinary as well as the profound.'
    },
    8: {
      planet: 'Saturn (Shani)', title: 'The steward', day: 'Saturday', colour: 'Navy & black', gem: 'Blue sapphire',
      text: 'You are built for long games — money, governance, land, legacy. Authority sits well on you when it is earned, and you usually learn discipline through experience rather than instruction. Patience with slow results is the single lever that changes everything for this number.'
    },
    9: {
      planet: 'Mars (Mangal)', title: 'The warrior', day: 'Tuesday', colour: 'Red & coral', gem: 'Red coral',
      text: 'You move on conviction and have a low tolerance for injustice. Courage, service and physical effort are your strengths, which suits defence, sport, surgery and enterprise. The practice is to aim the fire deliberately — channel it into a cause rather than a quarrel.'
    }
  };

  var CHALDEAN = {
    a: 1, i: 1, j: 1, q: 1, y: 1,
    b: 2, k: 2, r: 2,
    c: 3, g: 3, l: 3, s: 3,
    d: 4, m: 4, t: 4,
    e: 5, h: 5, n: 5, x: 5,
    u: 6, v: 6, w: 6,
    o: 7, z: 7,
    f: 8, p: 8
  };

  function reduce(n) {
    while (n > 9) {
      var s = 0;
      String(n).split('').forEach(function (d) { s += Number(d); });
      n = s;
    }
    return n;
  }

  function sumDigits(text) {
    var s = 0;
    String(text).replace(/\D/g, '').split('').forEach(function (d) { s += Number(d); });
    return s;
  }

  function nameNumber(name) {
    var letters = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!letters) return 0;
    var total = 0;
    letters.split('').forEach(function (ch) { total += CHALDEAN[ch] || 0; });
    return total ? reduce(total) : 0;
  }

  function renderNumber(n, label) {
    return '<div class="num-score"><b>' + n + '</b><span>' + label + '</span></div>';
  }

  function renderResult(d) {
    var out = $('#numOut');
    if (!out) return;
    var info = NUM[d.destiny] || NUM[1];
    var chips = [
      ['spark', 'Ruling planet: ' + info.planet],
      ['sun', 'Lucky day: ' + info.day],
      ['leaf', 'Lucky colour: ' + info.colour],
      ['star', 'Lucky number: ' + d.birth]
    ];
    if (info.gem) chips.push(['shield', 'Stone: ' + info.gem]);

    out.innerHTML =
      '<div class="num-head"><h3>' + esc(info.title) + '</h3><span>' + esc(d.dobDisplay) + '</span></div>' +
      '<div class="num-scores">' +
        renderNumber(d.birth, 'Mulank · birth') +
        renderNumber(d.destiny, 'Bhagyank · destiny') +
        (d.nameNum ? renderNumber(d.nameNum, 'Namank · name') : renderNumber('—', 'Namank · name')) +
      '</div>' +
      '<div class="num-read"><h4>Destiny number ' + d.destiny + ' — ' + esc(info.title) + '</h4>' +
      '<p>' + esc(info.text) + '</p></div>' +
      '<div class="num-meta">' + chips.map(function (c) {
        return '<span><span data-svc-icon="' + c[0] + '"></span>' + esc(c[1]) + '</span>';
      }).join('') + '</div>' +
      '<p class="tiny muted mt-3">A calculator is a starting point, not a verdict. For a name or business-number change, cross-check with a full reading.</p>';
    paintIcons(out);
  }

  function showError(msg) {
    var el = $('#numErr');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hide');
  }

  function clearError() {
    var el = $('#numErr');
    if (el) el.classList.add('hide');
  }

  function onCalculate(e) {
    e.preventDefault();
    clearError();
    var dob = $('#numDob');
    var name = $('#numName');
    if (!dob || !dob.value) { showError('Please enter your date of birth.'); return; }

    var parts = dob.value.split('-');
    var y = Number(parts[0]), m = Number(parts[1]), day = Number(parts[2]);
    var dt = new Date(y, m - 1, day);
    if (!y || !m || !day || dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== day) {
      showError('That date does not look valid. Please check the day and month.');
      return;
    }
    if (dt > new Date()) { showError('The date of birth cannot be in the future.'); return; }

    var birth = reduce(day);
    var destiny = reduce(sumDigits(dob.value));
    var nameNum = name ? nameNumber(name.value) : 0;

    var display = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    renderResult({ birth: birth, destiny: destiny, nameNum: nameNum, dobDisplay: display });
  }

  function init() {
    paintIcons();
    paintPaathCounts();
    var form = $('#numForm');
    if (form) form.addEventListener('submit', onCalculate);
    var dob = $('#numDob');
    if (dob) {
      var today = new Date();
      var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      dob.setAttribute('max', iso);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
