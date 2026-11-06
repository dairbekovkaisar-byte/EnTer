/* Renders the template into a root element and keeps the DOM in place between renders. */
const APPRT = (function () {
  function syncAttrs(from, to) {
    var name, i;
    for (i = from.attributes.length - 1; i >= 0; i--) {
      name = from.attributes[i].name;
      if (from.nodeName === 'DETAILS' && name === 'open') continue;
      if (!to.hasAttribute(name)) from.removeAttribute(name);
    }
    for (i = 0; i < to.attributes.length; i++) {
      name = to.attributes[i].name;
      if (from.getAttribute(name) !== to.attributes[i].value) from.setAttribute(name, to.attributes[i].value);
    }
    if (from.nodeName === 'INPUT') {
      if (from.type === 'checkbox' || from.type === 'radio') from.checked = to.hasAttribute('checked');
      else { var want = to.getAttribute('value') || ''; if (from.value !== want) from.value = want; }
    }
  }
  function morph(parent, next) {
    var a = parent.firstChild, b = next.firstChild, nextA, nextB;
    while (b) {
      nextB = b.nextSibling;
      if (!a) { parent.appendChild(b); b = nextB; continue; }
      nextA = a.nextSibling;
      if (a.nodeType === b.nodeType && a.nodeName === b.nodeName) {
        if (a.nodeType === 1) { syncAttrs(a, b); morph(a, b); }
        else if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
      } else {
        parent.replaceChild(b, a);
      }
      a = nextA; b = nextB;
    }
    while (a) { nextA = a.nextSibling; parent.removeChild(a); a = nextA; }
  }
  function mount(root, ast, getVals, imports) {
    var handlers = [], scheduled = false, tpl = document.createElement('template');
    var ctx = { imports: imports, on: function (fn) { handlers.push(fn); return String(handlers.length - 1); } };
    function render() {
      scheduled = false;
      handlers = [];
      tpl.innerHTML = TPL.render(ast, getVals(), ctx);
      morph(root, tpl.content);
      var refs = root.querySelectorAll('[data-ref]');
      for (var i = 0; i < refs.length; i++) { var fn = handlers[+refs[i].getAttribute('data-ref')]; if (fn) fn(refs[i]); }
      if (mount.after) mount.after();
    }
    function schedule() { if (scheduled) return; scheduled = true; Promise.resolve().then(render); }
    function fire(kind, e) {
      var el = e.target;
      while (el && el !== root.parentNode) {
        if (el.nodeType === 1) {
          var id = el.getAttribute('data-e-' + kind);
          if (id !== null) { var fn = handlers[+id]; if (fn) fn(e, el); return true; }
        }
        el = el.parentNode;
      }
      return false;
    }
    root.addEventListener('click', function (e) { fire('click', e); });
    root.addEventListener('input', function (e) { fire('change', e); });
    root.addEventListener('change', function (e) { var t = e.target; if (t && (t.type === 'checkbox' || t.type === 'radio' || t.type === 'date' || t.type === 'time')) fire('change', e); });
    root.addEventListener('submit', function (e) { e.preventDefault(); fire('submit', e); });
    render();
    return { render: render, schedule: schedule };
  }
  return { mount: mount };
})();
