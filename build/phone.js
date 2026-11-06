// Seeds progress and checks every screen at several widths for horizontal overflow and page errors.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || require('path').join(__dirname, '../.out/phone');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:8766/';
const WIDTHS = (process.env.WIDTHS || '320,390,768,1024,1440,1920').split(',').map(Number);
const SHOT = new Set((process.env.SHOT || '390').split(',').map(Number));
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 780 : 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(BASE + 'app.html#start');
    await page.waitForSelector('.onb');
    const seed = await page.evaluate(() => {
      const D = window.ENTER_DEBUG, S = D.S, all = D.BANK.all;
      S.onboarded = true; S.diag = true; S.plan = 'full'; S.phone = '7015550124';
      all.forEach((q, i) => { if (i % 3 === 0) S.answers[q.id] = { ok: i % 2 === 0, n: 1, c: i % 2 === 0 ? 1 : 0, last: Date.now() - 86400000 * 2, pick: Array.isArray(q.ans) ? q.ans.slice(0, 1) : (i % 2 === 0 ? q.ans : (q.ans + 1) % q.opts.length) }; });
      const d = new Date(), iso = (x) => { const y = new Date(d.getTime() - x * 86400000); return y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0'); };
      S.sessions = [5, 4, 2, 1].map((x) => ({ date: iso(x), ts: Date.now() - x * 86400000, kind: 'daily', correct: 7, total: 10, before: 40, after: 42, beforeGot: [3, 3, 8, 13, 13], afterGot: [3, 4, 8, 14, 13] }));
      S.mocks = [{ date: iso(1), ts: Date.now(), got: [5, 4, 12, 21, 9], total: 51, lost: [{ s: 'phys', tp: 0, pts: 12 }, { s: 'math', tp: 5, pts: 8 }, { s: 'hist', tp: 2, pts: 3 }], wrong: [], answered: 90, pair: 'mf', missing: [false, false, false, false, false] }];
      S.customs = [{ iso: iso(-2), time: '19:00', title: 'Повторить проценты' }];
      localStorage.setItem('enter-v1', JSON.stringify(S));
      return true;
    });
    const screens = ['today', 'tasks', 'calendar', 'map', 'mock', 'result', 'profile', 'limit', 'pay', 'login'];
    await page.goto(BASE + 'app.html#today');
    await page.waitForSelector('.hgrid');
    const check = async (name) => {
      await page.waitForTimeout(120);
      const r = await page.evaluate(() => { const de = document.documentElement; const over = de.scrollWidth - de.clientWidth; let wide = ''; if (over > 0) { const els = [...document.querySelectorAll('#app *')].filter((e) => e.getBoundingClientRect().right > de.clientWidth + 1 && !e.closest('.msubj,.caps,.ptwrap')); wide = els.slice(0, 3).map((e) => e.tagName + '.' + (e.className.baseVal === undefined ? e.className : '')).join(' '); } return { over, wide }; });
      if (r.over > 0) { bad++; console.log('OVERFLOW', w, name, r.over, r.wide); }
      if (SHOT.has(w)) await page.screenshot({ path: `${OUT}/${w}-${name}.png`, fullPage: true });
    };
    for (const s of screens) {
      await page.evaluate((x) => { location.hash = x; }, s);
      await check(s);
    }
    // a task, checked
    await page.evaluate(() => { location.hash = 'today'; });
    await page.waitForSelector('.hgrid');
    await page.locator('.sess .btn').first().click();
    await page.waitForSelector('.qcol');
    await check('task');
    await page.locator('.qcol .opt').first().click();
    await page.locator('.qfoot .btn').click();
    await page.waitForSelector('.tutor');
    await check('task-checked');
    await page.evaluate(() => { const D = window.ENTER_DEBUG; const s = D.S.sess; const q = D.BANK.all.find((x) => x.type === 'match'); s.ids[s.i + 1] = q.id; const m = D.BANK.all.find((x) => x.type === 'multi'); s.ids[s.i + 2] = m.id; const r = D.BANK.all.find((x) => x.s === 'read'); s.ids[s.i + 3] = r.id; });
    await page.locator('.qfoot .btn').click();
    await check('task-match');
    await page.locator('.qcol .opt').first().click();
    await page.locator('.qfoot .btn').click();
    await page.locator('.qfoot .btn').click();
    await check('task-multi');
    await page.locator('.qcol .opt').first().click();
    await page.locator('.qfoot .btn').click();
    await page.locator('.qfoot .btn').click();
    await check('task-read');
    // mock
    await page.evaluate(() => { location.hash = 'mock'; });
    await page.waitForSelector('.facts');
    await page.locator('.page .btn').first().click();
    await page.waitForSelector('.mbar');
    await check('exam');
    await page.locator('.msubj button').nth(1).click();
    await check('exam-read');
    await page.locator('.msubj button').nth(3).click();
    await check('exam-math');
    if (w < 900) { await page.locator('.mbar .iconbtn.ph').click(); await page.waitForSelector('.box'); await check('exam-nav'); await page.keyboard.press('Escape'); await page.locator('.toolsrow.ph .tool').first().click(); } else await page.locator('.navside .tool').first().click();
    await page.waitForSelector('.calc'); await check('exam-calc'); await page.keyboard.press('Escape');
    if (w < 900) await page.locator('.toolsrow.ph .tool').nth(1).click(); else await page.locator('.navside .tool').nth(1).click();
    await page.waitForSelector('.ptable'); await check('exam-periodic'); await page.keyboard.press('Escape');
    if (errs.length) { bad++; console.log('ERRORS', w, errs.slice(0, 3)); }
    await ctx.close();
    console.log('done', w);
  }
  await b.close();
  console.log(bad ? bad + ' problems' : 'NO PROBLEMS');
})().catch((e) => { console.error('CRASH', e.message.slice(0, 400)); process.exit(1); });
