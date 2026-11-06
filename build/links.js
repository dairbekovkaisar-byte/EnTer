// Checks every internal link and asset of the built site, including #anchors.
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '../dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const html = walk(D).filter((f) => f.endsWith('.html'));
let bad = 0, n = 0, ext = new Set();
for (const f of html) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:)?\/\//.test(u)) { ext.add(u); continue; }
    if (/^(mailto|tel):/.test(u)) continue;
    n++;
    const [p, hash] = u.split('#');
    let t = p ? path.resolve(path.dirname(f), p) : f;
    if (fs.existsSync(t) && fs.statSync(t).isDirectory()) t = path.join(t, 'index.html');
    if (!fs.existsSync(t)) { bad++; console.log('MISSING', path.relative(D, f), u); continue; }
    if (hash && t.endsWith('.html') && !/app\.html$/.test(t)) {
      const c = fs.readFileSync(t, 'utf8');
      if (!new RegExp('id="' + hash + '"').test(c)) { bad++; console.log('NO ANCHOR', path.relative(D, f), u); }
    }
  }
}
console.log('pages', html.length, 'links', n, 'bad', bad, 'external', ext.size);
console.log([...ext].filter((u) => !/fonts\.g/.test(u)).slice(0, 12).join('\n'));
