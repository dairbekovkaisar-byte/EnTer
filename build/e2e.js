// Click-through of the real app: fresh user to diagnostic, session, limit, pay, mock, result, tasks, calendar, profile.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || require('path').join(__dirname, '../.out/e2e');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:8766/';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

async function answer(page, right) {
  // picks using the debug handle, so the test knows which option is right
  const info = await page.evaluate(() => { const D = window.ENTER_DEBUG, s = D.S.sess; const q = D.BANK.byId[s.ids[s.i]]; return { ans: q.ans, n: q.opts.length, id: q.id }; });
  const opts = page.locator('.qcol .opt');
  const pick = async (i) => opts.nth(i).click();
  if (Array.isArray(info.ans)) {
    const list = right ? info.ans : [[...Array(info.n).keys()].find((i) => !info.ans.includes(i))];
    for (const i of list) await pick(i);
  } else {
    await pick(right ? info.ans : (info.ans + 1) % info.n);
  }
  await page.locator('.qfoot .btn').click();
  await page.locator('.tutor').waitFor();
  return info;
}
async function nextQ(page) { await page.locator('.qfoot .btn').click(); }

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });

  await page.goto(BASE + 'app.html#start');
  await page.waitForSelector('.onb');
  ok(await page.locator('.pair[aria-pressed="true"]').count() === 1, 'onboarding: one pair selected');
  await page.locator('.pair').nth(1).click();
  ok(await page.locator('.demo').count() === 1, 'onboarding: unfinished pair shows a note');
  await page.locator('.pair').nth(0).click();
  ok(await page.locator('.demo').count() === 0, 'onboarding: ready pair has no note');
  await page.locator('#up-target').evaluate((el) => { el.value = 110; el.dispatchEvent(new Event('input', { bubbles: true })); });
  ok((await page.locator('.targetn').textContent()) === '110', 'onboarding: target moves');
  await page.screenshot({ path: OUT + '/01-onboard.png' });
  await page.locator('.onbform .btn').click();
  await page.waitForSelector('.hgrid');
  ok((await page.locator('.bignum span').first().textContent()) === '?', 'home: score is unknown before the diagnostic');
  await page.screenshot({ path: OUT + '/02-home-fresh.png' });

  // leave and come back: progress must stay
  await page.reload();
  await page.waitForSelector('.hgrid');
  ok(await page.evaluate(() => window.ENTER_DEBUG.S.target) === 110, 'reload keeps target');

  // diagnostic
  await page.locator('.sess .btn').click();
  await page.waitForSelector('.qcol');
  const total = await page.evaluate(() => window.ENTER_DEBUG.S.sess.ids.length);
  ok(total === 20, 'diagnostic has 20 tasks, got ' + total);
  ok(await page.locator('.qfoot .btn').isDisabled(), 'check button waits for an answer');
  for (let i = 0; i < total; i++) {
    await answer(page, i % 3 !== 0);
    if (i === 0) {
      await page.screenshot({ path: OUT + '/03-task-checked.png' });
      const chipCount = await page.locator('.chip').count();
      ok(chipCount >= 1, 'chips shown: ' + chipCount);
    }
    if (i === 4) { await page.reload(); await page.waitForSelector('.qcol'); ok(await page.evaluate(() => window.ENTER_DEBUG.S.sess.i) === 5, 'reload in a session continues from the next task'); continue; }
    await nextQ(page);
  }
  await page.waitForSelector('.jump');
  await page.waitForTimeout(700);
  const scoreAfter = await page.evaluate(() => window.ENTER_DEBUG.model().score);
  ok(scoreAfter > 0, 'score after diagnostic: ' + scoreAfter);
  ok((await page.locator('.jump span').last().textContent()) === String(scoreAfter), 'done screen shows the real score');
  await page.screenshot({ path: OUT + '/04-done-diag.png' });

  // share card
  await page.locator('.dgrid .btn2').click();
  await page.waitForSelector('.card');
  await page.screenshot({ path: OUT + '/05-share.png' });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.locator('.narrow .btn').last().click()]);
  ok(/enter-map\.png/.test(dl.suggestedFilename()), 'share card downloads');
  await dl.saveAs(OUT + '/card.png');
  await page.evaluate(() => { location.hash = 'today'; });
  await page.waitForSelector('.hgrid');
  ok((await page.locator('.bignum span').first().textContent()) === String(scoreAfter), 'home shows score');
  ok(await page.locator('.rowbtn').count() === 3, 'three nearest topics');
  await page.screenshot({ path: OUT + '/06-home.png' });

  // daily session, all right, with wrong first
  await page.locator('.sess .btn').click();
  await page.waitForSelector('.qcol');
  const dailyN = await page.evaluate(() => window.ENTER_DEBUG.S.sess.ids.length);
  ok(dailyN === 10, 'daily session has 10 tasks, got ' + dailyN);
  for (let i = 0; i < dailyN; i++) { await answer(page, i !== 0); await nextQ(page); }
  await page.waitForSelector('.jump');
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + '/07-done.png' });
  await page.locator('.dgrid .btn').first().click();
  await page.waitForSelector('.hgrid');
  ok(await page.getByText('На сегодня занятие пройдено').count() === 1, 'home says the session is done');
  await page.locator('.panel .btn2').first().click();
  await page.waitForSelector('.price');
  await page.screenshot({ path: OUT + '/08-limit.png' });
  ok(true, 'free limit screen appears');

  // pay demo through the mock
  await page.locator('.narrow .lnk').click();
  await page.waitForSelector('.hgrid');
  await page.locator('.rail .railitem').nth(4).click();
  await page.waitForSelector('.facts');
  await page.locator('.page .btn').first().click();
  await page.waitForSelector('.paygrid');
  ok(await page.locator('.paygrid .demo').count() === 1, 'pay screen says it is a demo');
  await page.screenshot({ path: OUT + '/09-pay.png' });
  await page.locator('.paygrid .btn').click();
  await page.waitForSelector('.success');
  await page.locator('.center .btn').click();
  await page.waitForSelector('.mbar');
  const counts = await page.evaluate(() => window.ENTER_DEBUG.S.mock.ids.map((l) => l.length));
  ok(JSON.stringify(counts) === '[20,10,10,40,40]', 'mock sizes ' + JSON.stringify(counts));
  const fmts = await page.evaluate(() => { const D = window.ENTER_DEBUG; const m = D.S.mock.ids[3].map((id) => D.BANK.byId[id].type); return [m.filter((x) => x === 'single').length, m.filter((x) => x === 'context').length, m.filter((x) => x === 'match').length, m.filter((x) => x === 'multi').length]; });
  ok(JSON.stringify(fmts) === '[25,5,5,5]', 'profile format ' + JSON.stringify(fmts));
  const uniq = await page.evaluate(() => { const ids = [].concat.apply([], window.ENTER_DEBUG.S.mock.ids); return new Set(ids).size === ids.length; });
  ok(uniq, 'no repeated task in the mock');
  const maxPts = await page.evaluate(() => { const D = window.ENTER_DEBUG; const pts = (q) => (q.type === 'match' || q.type === 'multi' ? 2 : 1); return D.S.mock.ids.map((l) => l.reduce((a, id) => a + pts(D.BANK.byId[id]), 0)); });
  ok(JSON.stringify(maxPts) === '[20,10,10,50,50]', 'mock points ' + JSON.stringify(maxPts));
  const t1 = await page.locator('[data-timer]').textContent();
  await page.waitForTimeout(2200);
  const t2 = await page.locator('[data-timer]').textContent();
  ok(t1 !== t2 && /^3:59:/.test(t2), 'timer runs ' + t1 + ' -> ' + t2);
  await page.screenshot({ path: OUT + '/10-mock.png' });

  // answer: every task right in history, nothing elsewhere except a passage task
  await page.evaluate(() => { const D = window.ENTER_DEBUG, M = D.S.mock; M.ids[0].forEach((id) => { M.sel[id] = D.BANK.byId[id].ans; }); localStorage.setItem('enter-v1', JSON.stringify(D.S)); });
  await page.reload();
  await page.waitForSelector('.mbar');
  ok((await page.locator('.msubj button').first().textContent()).includes('20/20'), 'mock progress survives reload');
  await page.locator('.msubj button').nth(1).click();
  await page.waitForSelector('.mq .passage');
  await page.screenshot({ path: OUT + '/11-mock-read.png' });
  await page.locator('.mq .opt').first().click();
  await page.locator('.mfoot .mnext').click();
  await page.locator('.mfoot .btn2').nth(1).click();
  ok((await page.locator('.mfoot .btn2').nth(1).getAttribute('aria-pressed')) === 'true', 'flag works');
  // calculator
  await page.locator('.navside .tool').first().click();
  await page.waitForSelector('.calc');
  for (const k of ['1', '2', '×', '(', '3', '+', '4', ')', '=']) await page.locator('.calckey', { hasText: k }).first().click();
  ok((await page.locator('.calcres').textContent()) === '84', 'calculator 12×(3+4)=84, got ' + await page.locator('.calcres').textContent());
  await page.locator('.calckey', { hasText: 'C' }).first().click();
  for (const k of ['√', '1', '6', '+', '5', '²', '=']) await page.locator('.calckey', { hasText: k }).first().click();
  ok((await page.locator('.calcres').textContent()) === '29', 'calculator root and square, got ' + await page.locator('.calcres').textContent());
  await page.screenshot({ path: OUT + '/12-calc.png' });
  await page.keyboard.press('Escape');
  await page.locator('.navside .tool').nth(1).click();
  await page.waitForSelector('.ptable');
  ok(await page.locator('.pt').count() === 120, 'periodic table cells');
  await page.screenshot({ path: OUT + '/13-periodic.png' });
  await page.keyboard.press('Escape');
  await page.locator('.mbar .btn2').click();
  await page.waitForSelector('.box .acts');
  await page.locator('.box .acts .btn2').click();
  await page.waitForSelector('.rgrid');
  const res = await page.evaluate(() => { const m = window.ENTER_DEBUG.S.mocks[0]; return { got: m.got, total: m.total, answered: m.answered, lost: m.lost.length }; });
  ok(res.got[2] === 20 && res.total >= 20, 'result counts history 20/20: ' + JSON.stringify(res));
  await page.screenshot({ path: OUT + '/14-result.png', fullPage: true });

  // tasks
  await page.locator('.rail .railitem').nth(1).click();
  await page.waitForSelector('.tgrid');
  await page.screenshot({ path: OUT + '/15-tasks.png' });
  ok(await page.locator('.task').count() > 0, 'topic shows its tasks');
  await page.locator('.task .iconbtn').first().click();
  await page.locator('.segw button').nth(2).click();
  ok(await page.locator('.task').count() === 1, 'saved task appears');
  await page.locator('.segw button').nth(1).click();
  ok(await page.locator('.mist').count() > 0, 'mistakes list has rows');
  await page.screenshot({ path: OUT + '/16-mistakes.png' });
  await page.locator('.segw button').nth(0).click();
  await page.locator('.search input').fill('механ');
  await page.waitForTimeout(100);
  ok(await page.locator('.trow').count() === 1, 'search finds a topic in another subject');
  ok((await page.locator('.search input').evaluate((el) => document.activeElement === el)), 'search keeps focus while typing');
  await page.locator('.trow').first().click();
  ok((await page.locator('.tdetail h2').textContent()) === 'Механика', 'search result opens the topic');
  await page.locator('.search input').fill('zzz');
  await page.waitForTimeout(100);
  ok(await page.locator('.empty').count() === 1, 'empty search state');
  await page.locator('.empty .btn2').click();

  // calendar
  await page.locator('.rail .railitem').nth(2).click();
  await page.waitForSelector('.month');
  await page.locator('.calpanel .day-today').waitFor();
  await page.screenshot({ path: OUT + '/17-calendar.png' });
  await page.locator('.topacts .iconbtn').first().click();
  await page.waitForSelector('#up-add-name');
  await page.locator('#up-add-name').fill('Повторить проценты');
  await page.locator('form.box .btn').click();
  await page.waitForTimeout(100);
  ok(await page.getByText('Повторить проценты').count() >= 1, 'event added');
  const [ics] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.getByText('Добавить в календарь телефона').click()]);
  await ics.saveAs(OUT + '/cal.ics');
  const icsText = fs.readFileSync(OUT + '/cal.ics', 'utf8');
  ok(/BEGIN:VCALENDAR/.test(icsText) && /Повторить проценты/.test(icsText), 'calendar file has the event');

  // map
  await page.locator('.rail .railitem').nth(3).click();
  await page.waitForSelector('.mgrid2');
  await page.screenshot({ path: OUT + '/18-map.png' });
  ok(await page.locator('.topic').count() === 6, 'history shows 6 topics');

  // profile
  await page.locator('.rail .railitem').nth(5).click();
  await page.waitForSelector('.pgrid');
  await page.screenshot({ path: OUT + '/19-profile.png', fullPage: true });
  await page.locator('.seg').nth(1).locator('button').nth(1).click();
  ok((await page.locator('.up').getAttribute('data-theme')) === 'night', 'theme switches');
  await page.waitForTimeout(100);
  await page.screenshot({ path: OUT + '/20-profile-night.png', fullPage: true });
  await page.goto(BASE + 'kk/app.html#profile');
  await page.waitForSelector('.pgrid');
  ok((await page.locator('.who .t4').textContent()) === 'Сенің профилің', 'Kazakh page opens with the same progress');
  ok(await page.evaluate(() => window.ENTER_DEBUG.S.mocks.length) === 1, 'progress is shared across languages');
  await page.screenshot({ path: OUT + '/21-profile-kk.png', fullPage: true });
  await page.goto(BASE + 'app.html#profile');
  await page.waitForSelector('.pgrid');
  await page.getByText('Войти по номеру').click();
  await page.waitForSelector('#up-phone');
  await page.locator('#up-phone').fill('7015550124');
  await page.locator('.authbox .btn').click();
  await page.waitForSelector('.codeinp');
  await page.locator('.codeinp').fill('0000');
  await page.waitForSelector('.err');
  ok(true, 'wrong code shows an error');
  await page.locator('.codeinp').fill('1234');
  await page.waitForSelector('.hgrid');
  ok(await page.evaluate(() => window.ENTER_DEBUG.S.phone) === '7015550124', 'phone saved');
  await page.locator('.rail .railitem').nth(5).click();
  await page.waitForSelector('.pgrid');
  ok((await page.locator('.who .sm').textContent()).includes('701'), 'profile shows the masked number');
  await page.getByText('Удалить аккаунт').first().click();
  await page.waitForSelector('.box .danger');
  await page.locator('.box .danger').click();
  await page.waitForSelector('.onb');
  ok(await page.evaluate(() => { const r = localStorage.getItem('enter-v1'); return !r || JSON.parse(r).sessions.length === 0; }), 'delete clears progress');

  ok(errors.length === 0, 'no page errors ' + errors.slice(0, 5).join(' | '));
  await b.close();
  console.log(fails ? fails + ' FAILED' : 'ALL OK');
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
