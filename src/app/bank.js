/* Builds the task bank from the hand-written lists and the generators. Same result on every load. */
var BANK = (function () {
  var all = [], byId = {};
  function add(q) { all.push(q); byId[q.id] = q; }
  QB_HIST.forEach(function (x, i) {
    /* options are written with the right one first; show them in a stable mixed order */
    var r = QGEN.rng(i + 11), order = x[2].map(function (_, k) { return k; });
    for (var a = order.length - 1; a > 0; a--) { var b = Math.floor(r() * (a + 1)); var t = order[a]; order[a] = order[b]; order[b] = t; }
    add({ id: 'h' + i, s: 'hist', tp: x[0], type: 'single', text: x[1], opts: order.map(function (k) { return x[2][k]; }), ans: order.indexOf(x[3]), why: x[4], simple: x[5], mem: x[6] });
  });
  QB_READ.forEach(function (x, i) {
    var r = QGEN.rng(i + 101), order = x[3].map(function (_, k) { return k; });
    for (var a = order.length - 1; a > 0; a--) { var b = Math.floor(r() * (a + 1)); var t = order[a]; order[a] = order[b]; order[b] = t; }
    add({ id: 'r' + i, s: 'read', tp: x[1], type: 'single', passage: QB_PASSAGES[x[0]], pid: x[0], text: x[2], opts: order.map(function (k) { return x[3][k]; }), ans: order.indexOf(x[4]), why: x[5] });
  });
  function gen(prefix, subj, list, perGen) {
    list.forEach(function (g, gi) {
      var seen = {};
      for (var v = 1, made = 0; v <= perGen * 4 && made < perGen; v++) {
        var q = g(QGEN.rng(gi * 97 + v * 13 + prefix.charCodeAt(0)));
        var key = (Array.isArray(q.text) ? q.text[0] : q.text) + '|' + (q.list ? q.list[0] : '');
        if (seen[key]) continue;
        seen[key] = 1; made++;
        q.id = prefix + gi + '-' + v; q.s = subj; q.type = q.type || 'single';
        add(q);
      }
    });
  }
  gen('l', 'mlit', QGEN.MLIT, 14);
  gen('m', 'math', QGEN.MATH, 14);
  gen('p', 'phys', QGEN.PHYS, 12);
  return { all: all, byId: byId };
})();
