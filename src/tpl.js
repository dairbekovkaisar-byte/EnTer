/* Small template engine shared by the site build (Node) and the app (browser).
   Syntax: {{a.b}} holes, <sc-if value="{{x}}">, <sc-for list="{{xs}}" as="x">, <dc-import name="Logo" ...>.
   onClick/onChange/onSubmit/onKeyDown become data-e-* ids; ref="{{fn}}" becomes data-ref. */
(function (root) {
  'use strict';
  var BOOL = { disabled: 1, checked: 1, hidden: 1, inert: 1, readonly: 1, required: 1, open: 1, selected: 1, multiple: 1 };
  var EVENT = { onclick: 'click', onchange: 'change', oninput: 'change', onsubmit: 'submit', onkeydown: 'keydown' };
  var HOLE = /\{\{\s*([\w$.]+)\s*\}\}/g;
  var TAG = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:@.-]+(?:="[^"]*")?)*)\s*(\/?)>|<!--[\s\S]*?-->/g;
  var ATTR = /([\w:@.-]+)(?:="([^"]*)")?/g;

  function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(v) { return esc(v).replace(/"/g, '&quot;'); }

  function parts(str) {
    var out = [], last = 0, m;
    HOLE.lastIndex = 0;
    while ((m = HOLE.exec(str))) {
      if (m.index > last) out.push({ s: str.slice(last, m.index) });
      out.push({ p: m[1].split('.') });
      last = m.index + m[0].length;
    }
    if (last < str.length) out.push({ s: str.slice(last) });
    return out;
  }
  function parseAttrs(str) {
    var out = [], m;
    ATTR.lastIndex = 0;
    while ((m = ATTR.exec(str))) out.push({ n: m[1], v: m[2] === undefined ? '' : m[2], parts: parts(m[2] === undefined ? '' : m[2]) });
    return out;
  }
  function compile(src) {
    var rootKids = [], stack = [{ kids: rootKids }], last = 0, m;
    function push(n) { stack[stack.length - 1].kids.push(n); }
    function text(s) { parts(s).forEach(function (x) { push(x.p ? { k: 'h', p: x.p } : { k: 't', s: x.s }); }); }
    TAG.lastIndex = 0;
    while ((m = TAG.exec(src))) {
      if (m.index > last) text(src.slice(last, m.index));
      last = m.index + m[0].length;
      if (!m[2]) continue;
      var close = !!m[1], name = m[2], attrs = m[3] || '';
      if (name === 'sc-if' || name === 'sc-for') {
        if (close) { stack.pop(); continue; }
        var a = {}; parseAttrs(attrs).forEach(function (x) { a[x.n] = x; });
        var node = name === 'sc-if' ? { k: 'if', p: a.value.parts[0].p, kids: [] } : { k: 'for', p: a.list.parts[0].p, as: a.as.v, kids: [] };
        push(node); stack.push(node);
      } else if (name === 'dc-import') {
        if (close) continue;
        push({ k: 'imp', attrs: parseAttrs(attrs) });
      } else if (close) {
        push({ k: 't', s: '</' + name + '>' });
      } else {
        push({ k: 'el', name: name, attrs: parseAttrs(attrs), self: !!m[4] });
      }
    }
    if (last < src.length) text(src.slice(last));
    return rootKids;
  }
  function get(scope, p) {
    var v = scope[p[0]];
    for (var i = 1; i < p.length && v != null; i++) v = v[p[i]];
    return v;
  }
  function camel(n) { return n.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }

  function render(ast, scope, ctx) {
    var html = '';
    for (var i = 0; i < ast.length; i++) {
      var n = ast[i];
      if (n.k === 't') html += n.s;
      else if (n.k === 'h') { var v = get(scope, n.p); if (v != null && v !== false) html += esc(v); }
      else if (n.k === 'if') { if (get(scope, n.p)) html += render(n.kids, scope, ctx); }
      else if (n.k === 'for') {
        var list = get(scope, n.p) || [];
        for (var j = 0; j < list.length; j++) {
          var s2 = Object.create(scope);
          s2[n.as] = list[j]; s2.$i = j;
          html += render(n.kids, s2, ctx);
        }
      } else if (n.k === 'imp') {
        var props = {};
        n.attrs.forEach(function (a) {
          if (a.n === 'hint-size') return;
          props[camel(a.n)] = (a.parts.length === 1 && a.parts[0].p) ? get(scope, a.parts[0].p) : a.v;
        });
        html += ctx.imports[props.name](props, ctx);
      } else {
        html += '<' + n.name;
        for (var k = 0; k < n.attrs.length; k++) {
          var a = n.attrs[k], low = a.n.toLowerCase(), single = a.parts.length === 1 && a.parts[0].p;
          if (EVENT[low]) { var fn = single ? get(scope, a.parts[0].p) : null; if (fn && ctx.on) html += ' data-e-' + EVENT[low] + '="' + ctx.on(fn) + '"'; continue; }
          if (low === 'ref') { var rf = single ? get(scope, a.parts[0].p) : null; if (rf && ctx.on) html += ' data-ref="' + ctx.on(rf) + '"'; continue; }
          if (single) {
            var val = get(scope, a.parts[0].p);
            if (BOOL[low]) { if (val && val !== 'false') html += ' ' + a.n + '=""'; continue; }
            if (val == null || val === false) continue;
            html += ' ' + a.n + '="' + escA(val) + '"';
            continue;
          }
          var out = '';
          for (var q = 0; q < a.parts.length; q++) {
            var pt = a.parts[q];
            if (pt.p) { var pv = get(scope, pt.p); if (pv != null && pv !== false) out += escA(pv); } else out += pt.s;
          }
          html += ' ' + a.n + '="' + out + '"';
        }
        html += n.self ? '/>' : '>';
      }
    }
    return html;
  }
  var api = { compile: compile, render: render, esc: esc, escA: escA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TPL = api;
})(typeof window !== 'undefined' ? window : this);
