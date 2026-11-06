// Opens every public page at phone and desktop width, in light and dark: images, overflow, errors, interactive parts.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '../.out/sitecheck');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8766/';
const D = path.join(__dirname, '../dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(D).filter((f) => f.endsWith('.html') && !/app\.html$/.test(f)).map((f) => path.relative(D, f));
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h, scheme] of [[390, 800, 'light'], [1440, 900, 'dark']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => { const de = document.documentElement; return { over: de.scrollWidth - de.clientWidth, broken: [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.getAttribute('src')).slice(0, 3), n: document.images.length, ph: (document.body.innerText.match(/\{\{|undefined|NaN|\[object/g) || []).length }; });
      if (r.over > 0 || r.broken.length || r.ph) { bad++; console.log('PROBLEM', w, p, JSON.stringify(r)); }
      if (['index.html', 'kk/index.html', 'pricing.html', 'mock.html', 'articles/ent-format.html'].includes(p)) await page.screenshot({ path: `${OUT}/${w}-${p.replace(/\W/g, '_')}.png`, fullPage: true });
    }
    if (errs.length) { bad++; console.log('ERRORS', w, errs.slice(0, 4)); }
    // interactive parts
    await page.goto(BASE + 'index.html');
    if (w < 700) { await page.locator('[data-menu-open]').first().click(); await page.waitForTimeout(100); const vis = await page.locator('#s-menu').isVisible(); if (!vis) { bad++; console.log('menu does not open'); } await page.locator('[data-menu-close]').first().click(); }
    const go = page.locator('a[href*="app.html#start"]').first();
    await go.click();
    await page.waitForSelector('.onb', { timeout: 5000 });
    await page.goBack();
    await page.goto(BASE + 'grants.html');
    const inputs = await page.locator('input[type="number"],input[type="range"]').count();
    console.log('grants inputs', inputs);
    await ctx.close();
    console.log('done', w, scheme, pages.length);
  }
  await b.close();
  console.log(bad ? bad + ' problems' : 'SITE OK');
})().catch((e) => { console.error('CRASH', e.message.slice(0, 500)); process.exit(1); });
