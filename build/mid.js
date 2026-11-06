// Screens at in-between widths, where two columns can get squeezed without overflowing.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '../.out/mid');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8766/';
const WIDTHS = (process.env.WIDTHS || '700,900,1024,1180').split(',').map(Number);
const SCREENS = (process.env.SCREENS || 'today,tasks,calendar,map,result,profile,pay').split(',');
(async () => {
  const b = await chromium.launch();
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: process.env.SCHEME || 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + 'app.html#start');
    await page.waitForSelector('.onb');
    await page.evaluate(() => {
      const D = window.ENTER_DEBUG, S = D.S, all = D.BANK.all;
      S.onboarded = true; S.diag = true; S.plan = 'free'; S.phone = '7015550124';
      all.forEach((q, i) => { if (i % 3 === 0) S.answers[q.id] = { ok: i % 2 === 0, n: 1, c: i % 2 === 0 ? 1 : 0, last: Date.now() - 86400000 * 2, pick: Array.isArray(q.ans) ? q.ans.slice(0, 1) : (i % 2 === 0 ? q.ans : (q.ans + 1) % q.opts.length) }; });
      const d = new Date(), iso = (x) => { const y = new Date(d.getTime() - x * 86400000); return y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0'); };
      S.sessions = [5, 4, 2, 1].map((x) => ({ date: iso(x), ts: Date.now() - x * 86400000, kind: 'daily', correct: 7, total: 10, before: 40, after: 42, beforeGot: [3, 3, 8, 13, 13], afterGot: [3, 4, 8, 14, 13] }));
      S.mocks = [{ date: iso(1), ts: Date.now(), got: [5, 4, 12, 21, 9], total: 51, lost: [{ s: 'phys', tp: 0, pts: 12 }, { s: 'math', tp: 5, pts: 8 }, { s: 'hist', tp: 2, pts: 3 }], wrong: [], answered: 90, pair: 'mf', missing: [false, false, false, false, false] }];
      S.customs = [{ iso: iso(-2), time: '19:00', title: 'Повторить проценты' }];
      localStorage.setItem('enter-v1', JSON.stringify(S));
    });
    await page.goto(BASE + 'app.html#today');
    await page.waitForSelector('.hgrid');
    for (const s of SCREENS) {
      await page.evaluate((x) => { location.hash = x; }, s);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${OUT}/${w}-${s}.png` });
    }
    await page.evaluate(() => { location.hash = 'today'; });
    await page.waitForSelector('.hgrid');
    await page.locator('.sess .btn').first().click();
    await page.waitForSelector('.qcol');
    await page.locator('.qcol .opt').first().click();
    await page.locator('.qfoot .btn').click();
    await page.waitForSelector('.tutor');
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${OUT}/${w}-task.png` });
    await page.evaluate(() => { const S = window.ENTER_DEBUG.S; S.plan = 'full'; S.sess = null; localStorage.setItem('enter-v1', JSON.stringify(S)); location.hash = 'mock'; });
    await page.reload();
    await page.waitForSelector('.facts');
    await page.locator('.page .btn').first().click();
    await page.waitForSelector('.mbar');
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${OUT}/${w}-exam.png` });
    await ctx.close();
  }
  await b.close();
  console.log('shots done');
})().catch((e) => { console.error('CRASH', e.message.slice(0, 400)); process.exit(1); });
