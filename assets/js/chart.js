/* ==========================================================================
   North Indian chart renderer — shared by home, kundli and matching pages.
   Exposes window.VedicChart.north(kundli, {size, d9, compact})
   ========================================================================== */
(function (root) {
  'use strict';
  var V = root.Vedic;

  var CENTERS = {
    1: [150, 78], 2: [76, 27], 3: [27, 76], 4: [76, 150],
    5: [27, 224], 6: [76, 273], 7: [150, 222], 8: [224, 273],
    9: [273, 224], 10: [224, 150], 11: [273, 76], 12: [224, 27]
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function north(k, opts) {
    opts = opts || {};
    var d9 = !!opts.d9;
    var compact = !!opts.compact;
    var size = opts.size || 340;
    var ascSign = d9 ? k.navamsaAsc : k.asc.sign;
    var planets = (k.planets || []).map(function (p) {
      return {
        key: p.key,
        house: d9 ? p.d9House : p.house,
        sign: d9 ? p.d9 : p.sign,
        deg: p.degInSign,
        retro: p.retro
      };
    });
    var byHouse = {};
    planets.forEach(function (p) { (byHouse[p.house] = byHouse[p.house] || []).push(p); });

    var order = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    Object.keys(byHouse).forEach(function (h) {
      byHouse[h].sort(function (a, b) { return order.indexOf(a.key) - order.indexOf(b.key); });
    });

    var svg = '<svg class="chart-svg" viewBox="0 0 300 300" role="img" aria-label="' +
      (d9 ? 'Navamsa' : 'Birth') + ' chart for ' + esc(k.name || 'seeker') + '">';

    /* house frame */
    svg += '<rect x="1.5" y="1.5" width="297" height="297" rx="6" fill="#fffdf8" stroke="var(--line-strong)" stroke-width="1.2"/>';
    svg += '<path class="house-line" d="M150 1.5 1.5 150 150 298.5 298.5 150Z"/>';
    svg += '<path class="house-line" d="M1.5 1.5 150 150 298.5 1.5M1.5 298.5 150 150 298.5 298.5"/>';
    /* the diamond corners meet the midpoints already drawn above */

    var i, house, c, list, sign;
    for (i = 1; i <= 12; i++) {
      c = CENTERS[i];
      list = byHouse[i] || [];
      sign = (ascSign + i - 1) % 12;
      var n = list.length;
      var lineH = compact ? 11 : 14;
      var startY = c[1] - ((n - 1) * lineH) / 2 + (n ? 3 : 0);

      svg += '<text class="house-no" x="' + (c[0] + 13) + '" y="' + (c[1] - 16) + '" text-anchor="middle">' + (sign + 1) + '</text>';

      if (!n) {
        if (!compact) {
          svg += '<text x="' + c[0] + '" y="' + (c[1] + 4) + '" text-anchor="middle" font-size="8" fill="#c4b3a2">' +
            esc(V.RASHIS[sign].s) + '</text>';
        }
        continue;
      }

      list.forEach(function (p, idx) {
        var y = startY + idx * lineH;
        var label = p.key;
        if (p.retro && !compact) label += '℞';
        svg += '<text class="planet-txt" x="' + c[0] + '" y="' + y + '" text-anchor="middle">' + label + '</text>';
        if (!compact && p.deg != null) {
          svg += '<text class="planet-deg" x="' + (c[0] + 17) + '" y="' + y + '">' + Math.floor(p.deg) + '°</text>';
        }
      });
    }

    /* lagna marker */
    svg += '<text x="150" y="18" text-anchor="middle" font-size="9" font-weight="700" fill="#8a2c3b">Lagna ' + esc(V.RASHIS[ascSign].s) + '</text>';
    svg += '</svg>';

    return svg;
  }

  /* a small rows-of-3 "planet strip" used under charts */
  function planetTable(k) {
    var rows = (k.planets || []).map(function (p) {
      return '<tr><td><b>' + esc(p.name) + '</b>' + (p.retro ? '<span class="tag-retro">R</span>' : '') + '</td>' +
        '<td>' + esc(V.RASHIS[p.sign].n) + ' ' + Math.floor(p.degInSign) + '°' + Math.floor((p.degInSign % 1) * 60) + '′</td>' +
        '<td>' + esc(p.house) + '</td>' +
        '<td>' + esc(V.NAKSHATRAS[p.nakshatra].n) + ' ' + esc(p.pada) + '</td>' +
        '<td>' + esc(p.dignity || '—') + '</td>' +
        '<td>' + esc(p.avastha ? p.avastha.name : '—') + '</td></tr>';
    }).join('');
    return '<div class="table-wrap"><table><thead><tr><th>Graha</th><th>Rashi</th><th>Bhava</th><th>Nakshatra</th><th>Dignity</th><th>Avastha</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  root.VedicChart = { north: north, planetTable: planetTable };
})(window);
