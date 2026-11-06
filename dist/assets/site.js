/* Behaviour for the public pages. Every page reads fully without it. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* phone menu */
  var menu = $('#s-menu');
  if (menu) {
    var opener = $('[data-menu-open]');
    var closeBtn = $('[data-menu-close]', menu);
    var setMenu = function (open) {
      menu.hidden = !open;
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      (open ? closeBtn : opener).focus();
    };
    opener.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  }

  /* one question on the home page */
  var box = $('[data-try]');
  if (box) {
    var labels = box.getAttribute('data-labels').split('|');
    var opts = $$('[data-opt]', box);
    var fb = $('[data-try-fb]', box), again = $('[data-try-again]', box);
    var score = $('[data-try-score]', box), mapBox = $('[data-try-map]', box);
    var drawMap = function (right) {
      mapBox.innerHTML = window.BRAND.pointsMap({ got: [7, 5, right ? 13 : 12, 21, 9], next: [1, 2, right ? 2 : 3, 0, 0], labels: labels });
      score.textContent = right ? '55' : '54';
    };
    var RIGHT = 2;
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.getAttribute('data-opt')), ok = i === RIGHT;
        opts.forEach(function (o, k) { o.disabled = true; o.classList.toggle('ok', k === RIGHT); o.classList.toggle('no', k === i && !ok); });
        fb.textContent = ok ? box.getAttribute('data-ok') : box.getAttribute('data-no' + i);
        fb.className = 's-fb ' + (ok ? 's-fb-ok' : 's-fb-no');
        fb.hidden = false; again.hidden = false;
        drawMap(ok);
      });
    });
    again.addEventListener('click', function () {
      opts.forEach(function (o) { o.disabled = false; o.classList.remove('ok', 'no'); });
      fb.hidden = true; again.hidden = true;
      drawMap(false);
      opts[0].focus();
    });
  }

  /* subject pair table */
  var chips = $$('[data-pair-a]');
  if (chips.length) {
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        $('[data-prof="0"]').textContent = c.getAttribute('data-pair-a');
        $('[data-prof="1"]').textContent = c.getAttribute('data-pair-b');
        var rail = c.parentElement;
        if (rail.scrollWidth > rail.clientWidth) rail.scrollLeft = c.offsetLeft - rail.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2;
      });
    });
  }

  /* subjects page */
  var subjBtns = $$('[data-subj]');
  if (subjBtns.length) {
    var show = function (id, move) {
      subjBtns.forEach(function (b) {
        var on = b.getAttribute('data-subj') === id;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) {
          var rail = b.parentElement;
          if (rail.scrollWidth > rail.clientWidth) rail.scrollLeft = b.offsetLeft - rail.offsetLeft - (rail.clientWidth - b.offsetWidth) / 2;
        }
      });
      $$('[data-panel]').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-panel') === id); });
      if (move) { var panel = $('[data-panel="' + id + '"]'); var r = panel.getBoundingClientRect(); if (r.top < 60 || r.top > window.innerHeight * 0.7) window.scrollTo({ top: window.scrollY + r.top - 70 }); }
    };
    subjBtns.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-subj'), true); });
    });
    var h = (location.hash || '').slice(1);
    if (h && $('[data-panel="' + h + '"]')) show(h, false);
  }

  /* score calculator */
  var calcHost = $('[data-calc-i18n]');
  if (calcHost) {
    var L = JSON.parse(calcHost.getAttribute('data-calc-i18n'));
    var MAXES = [20, 10, 10, 50, 50], MINS = [5, 3, 3, 5, 5];
    var sliders = $$('[data-calc-i]');
    var alertBox = $('[data-calc-alert]');
    var fill = function (s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); };
    var update = function () {
      var total = 0, blocked = [];
      sliders.forEach(function (s, i) {
        var v = Number(s.value); total += v;
        $('[data-calc-v="' + i + '"]').textContent = v + ' / ' + MAXES[i];
        var m = $('[data-calc-m="' + i + '"]'), bad = v < MINS[i];
        m.textContent = bad ? fill(L.minBad, { m: MINS[i], n: MINS[i] - v }) : fill(L.minOk, { m: MINS[i] });
        m.classList.toggle('bad', bad);
        if (bad) blocked.push(L.labels[i]);
      });
      $('[data-calc-total]').textContent = total;
      var t2 = $('[data-calc-total2]'); if (t2) t2.textContent = total + ' / 140';
      alertBox.hidden = !blocked.length;
      if (blocked.length) alertBox.textContent = fill(L.blocked, { list: blocked.join(', ') });
      $$('[data-thr]').forEach(function (row) {
        var need = Number(row.getAttribute('data-thr')), reach = total >= need, ok = reach && !blocked.length;
        var st = $('.a-st', row);
        st.className = 'a-st ' + (ok ? 'a-st-ok' : reach ? 'a-st-warn' : 'a-st-no');
        st.textContent = (ok ? '✓ ' + L.thrOk : reach ? L.thrBlock : fill(L.thrNo, { n: need - total }));
      });
    };
    sliders.forEach(function (s) { s.addEventListener('input', update); });
    update();
  }

  /* plan length */
  var terms = $$('[data-term]');
  if (terms.length) {
    terms.forEach(function (b) {
      b.addEventListener('click', function () {
        terms.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $('[data-term-price]').textContent = b.getAttribute('data-term');
      });
    });
  }

  /* help search */
  var list = $('[data-help-list]');
  if (list) {
    var items = $$('details', list), q = $('#up-help'), empty = $('[data-help-empty]'), cats = $$('[data-cat]');
    var cat = 'all';
    var apply = function () {
      var needle = q.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var hit = (cat === 'all' || d.getAttribute('data-c') === cat) && (!needle || d.textContent.toLowerCase().indexOf(needle) >= 0);
        d.hidden = !hit; if (hit) shown++;
      });
      list.hidden = !shown; empty.hidden = !!shown;
    };
    q.addEventListener('input', apply);
    cats.forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-cat');
        cats.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply();
      });
    });
    $('[data-help-reset]').addEventListener('click', function () {
      q.value = ''; cat = 'all';
      cats.forEach(function (x, i) { x.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); });
      apply(); q.focus();
    });
  }
})();
