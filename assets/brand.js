/* Logo and points map, used by the site build and in the browser. */
(function (root) {
  'use strict';
  var WORD_D = 'M6.1 0H56.6V-11.2H18.9V-31.4H53.8V-42.4H18.9V-61.6H56.6V-72.8H6.1Z M64.7 0H77.6V-36.6C77.6 -39.7 77.6 -46 77.3 -54.1C81.7 -46.2 85.6 -39.8 87.6 -36.5L110.7 0H124.6V-72.8H111.7V-33.1C111.7 -30.2 111.8 -24.2 112 -18.7C109.1 -23.9 105.9 -29.4 104.2 -32.2L78.6 -72.8H64.7Z M131.7 -61.6H154.4V0H167.3V-61.6H189.9V-72.8H131.7Z M207.1 1.2C219.2 1.2 228.8 -5.8 230.7 -15.9H219.2C217.8 -11.5 213.6 -8.5 207.4 -8.5C199.1 -8.5 194.3 -14.2 194.1 -22.6H231.4V-25.9C231.4 -41.7 221.5 -52.7 206.7 -52.7C192.2 -52.7 182 -41.4 182 -25.7C182 -10.1 191.7 1.2 207.1 1.2ZM194.2 -31.1C195 -38.4 199.7 -43 206.8 -43C214 -43 218.8 -38.4 219.5 -31.1Z M238.5 0H250.8V-29.2C250.8 -37.3 255.4 -41.3 261.2 -41.3C263.7 -41.3 266.1 -41.1 267 -40.9V-51.9C266 -52 264.7 -52.1 263 -52.1C256.4 -52.1 252.4 -48.9 250.5 -43H250.4V-51.6H238.5Z';
  var AX = 277.6, TW = 343.6, WW = 269.6;
  function logo(p) {
    p = p || {};
    var kind = p.kind || 'lockup', size = Number(p.size) || 30;
    var lit = p.lit || 'var(--logo-accent,var(--accent,#0071E3))';
    var stroke = size <= 20 ? 16 : size <= 34 ? 14 : 13;
    var wrap = '<span role="img" aria-label="ENTer" style="display:inline-flex;align-items:center;vertical-align:middle;line-height:0;color:inherit">';
    if (kind === 'mark') {
      return wrap + '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 100 100" fill="none" style="display:block;flex:none"><path d="M78 18V50a12 12 0 0 1-12 12H24M46 40 24 62 46 84" stroke="' + lit + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>';
    }
    var arrow = kind === 'lockup', boxW = arrow ? TW : WW;
    var a = 'M' + (AX + 54).toFixed(1) + ' -66V-40a12 12 0 0 1-12 12H' + (AX + 6).toFixed(1) + 'M' + (AX + 28).toFixed(1) + ' -50 ' + (AX + 6).toFixed(1) + ' -28 ' + (AX + 28).toFixed(1) + ' -6';
    return wrap + '<svg aria-hidden="true" width="' + Math.round(size * boxW / 84) + '" height="' + size + '" viewBox="0 -78 ' + boxW + ' 84" style="display:block;flex:none"><path fill="currentColor" d="' + WORD_D + '"></path>' +
      (arrow ? '<path d="' + a + '" fill="none" stroke="' + lit + '" stroke-width="12.5" stroke-linecap="round" stroke-linejoin="round"></path>' : '') + '</svg></span>';
  }
  var MAX = [10, 10, 20, 50, 50];
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pointsMap(p) {
    var got = p.got || [0, 0, 0, 0, 0], next = p.next || [0, 0, 0, 0, 0], labels = p.labels || ['', '', '', '', ''];
    var show = p.showLabels !== false && p.showLabels !== 'false';
    var counts = p.counts !== false;
    var gap = p.cellGap != null ? p.cellGap : 3, rowGap = p.rowGap != null ? p.rowGap : 12, midGap = p.midGap != null ? p.midGap : 12;
    var radius = p.radius || '22%', size = p.labelSize || 13;
    var pick = p.onPick, on = p.on;
    function cells(b, from, to) {
      var h = '';
      for (var i = from; i < to; i++) {
        var c = i < got[b] ? 'var(--fill,#0071E3)' : i < got[b] + next[b] ? 'var(--near,#FF9500)' : 'var(--cell,#E5E5EA)';
        h += '<span style="display:block;aspect-ratio:1;border-radius:' + radius + ';background-color:' + c + ';transition:background-color .45s ease"></span>';
      }
      return h;
    }
    function half(b, title, count, justify, from, to, first) {
      var sel = p.selected === b;
      var h = '<div style="position:relative;min-width:0">';
      if (show) {
        h += '<div style="display:flex;justify-content:' + justify + ';align-items:baseline;gap:8px;min-height:19px;margin-bottom:6px;font-size:' + size + 'px;line-height:1.3;letter-spacing:-.005em"><span style="min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:' + (sel ? 700 : 500) + ';color:' + (sel ? 'var(--accent-text,#0066CC)' : 'inherit') + '">' + esc(title) + '</span><span style="flex:none;font-variant-numeric:tabular-nums;color:var(--text2,#6E6E73)">' + esc(count) + '</span></div>';
      }
      h += '<div style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:' + gap + 'px">' + cells(b, from, to) + '</div>';
      if (pick && on) {
        h += '<button type="button" aria-label="' + esc(labels[b] + ': ' + got[b] + '/' + MAX[b]) + '" aria-pressed="' + (sel ? 'true' : 'false') + '"' + (first ? '' : ' tabindex="-1"') + ' data-e-click="' + on(function () { pick(b); }) + '" style="position:absolute;inset:-4px;min-height:44px;padding:0;border:0;border-radius:10px;background:transparent;cursor:pointer"></button>';
      }
      return h + '</div>';
    }
    function cnt(i) { return counts ? got[i] + '/' + MAX[i] : ''; }
    function row(a, b) { return '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:' + midGap + 'px">' + a + b + '</div>'; }
    var total = got.reduce(function (a, b) { return a + b; }, 0);
    return '<div role="' + (pick ? 'group' : 'img') + '" aria-label="' + esc(p.aria || (total + ' / 140')) + '" style="display:flex;flex-direction:column;gap:' + rowGap + 'px;width:100%;box-sizing:border-box">' +
      row(half(0, labels[0], cnt(0), 'space-between', 0, 10, true), half(1, labels[1], cnt(1), 'space-between', 0, 10, true)) +
      row(half(2, labels[2], '', 'flex-start', 0, 10, true), half(2, '', cnt(2), 'flex-end', 10, 20, false)) +
      row(half(3, labels[3], cnt(3), 'space-between', 0, 50, true), half(4, labels[4], cnt(4), 'space-between', 0, 50, true)) +
      '</div>';
  }
  var api = { logo: logo, pointsMap: pointsMap };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BRAND = api;
})(typeof window !== 'undefined' ? window : this);
