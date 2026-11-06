// Other pairs, keyboard, returning user, Kazakh flow.
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8766/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  // biology + chemistry: no profile tasks yet
  await page.goto(BASE + 'kk/app.html#start');
  await page.waitForSelector('.onb');
  await page.locator('.pair').nth(3).click();
  ok(await page.locator('.onbform .demo').count() === 1, 'pair without tasks shows a note');
  await page.locator('.onbform .btn').click();
  await page.waitForSelector('.hgrid');
  ok(/10 тапсырма/.test(await page.locator('.sess .meta').textContent()), 'diagnostic text counts the available tasks: ' + (await page.locator('.sess .meta').textContent()).slice(0, 60));
  await page.locator('.sess .btn').click();
  await page.waitForSelector('.qcol');
  ok(await page.evaluate(() => window.ENTER_DEBUG.S.sess.ids.length) === 10, 'diagnostic of 10');
  // keyboard: digits choose, Enter checks and moves on
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.tutor');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(40);
  }
  await page.waitForSelector('.jump');
  ok(true, 'whole diagnostic works from the keyboard');
  await page.waitForTimeout(600);
  await page.evaluate(() => { location.hash = 'map'; });
  await page.waitForSelector('.mgrid2');
  const mapBtns = page.locator('.mgrid2 [aria-pressed]');
  ok(await mapBtns.count() >= 5, 'map blocks can be picked');
  await page.locator('.mgrid2 button[aria-label^="Биология"]').first().click();
  await page.waitForTimeout(80);
  ok((await page.locator('.mgrid2 h2').textContent()) === 'Биология', 'block heading follows the pick');
  ok(await page.locator('.topic').count() === 0, 'no topics for a subject without tasks');
  await page.evaluate(() => { location.hash = 'tasks'; });
  await page.waitForSelector('.tgrid');
  await page.locator('.cap', { hasText: 'Биология' }).click();
  await page.waitForTimeout(80);
  ok(await page.locator('.empty').count() === 1, 'subject without tasks has an empty state');
  ok(await page.locator('.tdetail').count() === 0, 'and no detail panel');
  // mock with two empty subjects
  await page.evaluate(() => { const S = window.ENTER_DEBUG.S; S.plan = 'full'; localStorage.setItem('enter-v1', JSON.stringify(S)); location.hash = 'mock'; });
  await page.waitForSelector('.facts');
  await page.reload();
  await page.waitForSelector('.facts');
  await page.locator('.page .btn').first().click();
  await page.waitForSelector('.mbar');
  ok(JSON.stringify(await page.evaluate(() => window.ENTER_DEBUG.S.mock.ids.map((l) => l.length))) === '[20,10,10,0,0]', 'mock has only the ready subjects');
  await page.locator('.msubj button').nth(3).click();
  await page.waitForTimeout(80);
  ok(await page.locator('.mq .opt').count() === 0, 'empty subject shows no options');
  await page.locator('.mfoot .btn2').first().click();
  await page.waitForTimeout(60);
  await page.locator('.mbar .btn2').click();
  await page.waitForSelector('.box .acts');
  await page.locator('.box .acts .btn2').click();
  await page.waitForSelector('.rgrid');
  ok(/Биология/.test(await page.locator('.rgrid').textContent()), 'result names the missing subject');
  // mock runs out of time while away
  await page.evaluate(() => { const D = window.ENTER_DEBUG, S = D.S; S.mock = { startedAt: Date.now() - 241 * 60000, ids: [['h0'], [], [], [], []], sel: { h0: D.BANK.byId.h0.ans }, flags: {}, cur: [1, 1, 1, 1, 1], subj: 0 }; localStorage.setItem('enter-v1', JSON.stringify(S)); });
  await page.reload();
  await page.waitForSelector('.rgrid');
  ok(await page.evaluate(() => window.ENTER_DEBUG.S.mock === null && window.ENTER_DEBUG.S.mocks.length === 2), 'expired mock finishes by itself');
  // language switch from the profile
  await page.evaluate(() => { location.hash = 'profile'; });
  await page.waitForSelector('.pgrid');
  await page.locator('.seg').first().locator('button').nth(1).click();
  await page.waitForURL(/\/app\.html#profile$/);
  await page.waitForSelector('.pgrid');
  ok(await page.locator('html').getAttribute('lang') === 'ru', 'language switch opens the Russian app');
  await page.locator('.seg').first().locator('button').nth(0).click();
  await page.waitForURL(/kk\/app\.html#profile$/);
  await page.waitForSelector('.pgrid');
  ok(await page.locator('html').getAttribute('lang') === 'kk', 'and back to Kazakh');
  // links out of the app
  await page.getByText('Көмек').click();
  await page.waitForURL(/kk\/help\.html$/);
  ok(true, 'help link stays in Kazakh');
  await page.goto(BASE + 'app.html#login');
  await page.waitForSelector('.hgrid, .authbox');
  ok(await page.locator('.authbox').count() === 1, 'sign-in opens for a user without a number');
  // browser back between sections
  await page.goto(BASE + 'app.html#today');
  await page.waitForSelector('.hgrid');
  await page.locator('.rail .railitem').nth(1).click();
  await page.waitForSelector('.tgrid');
  await page.locator('.rail .railitem').nth(2).click();
  await page.waitForSelector('.month');
  await page.goBack();
  await page.waitForSelector('.tgrid');
  ok(true, 'browser back returns to the previous section');
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(fails ? fails + ' FAILED' : 'ALL OK');
})().catch((e) => { console.error('CRASH', e.message.slice(0, 500)); process.exit(1); });
