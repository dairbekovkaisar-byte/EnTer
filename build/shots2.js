// Screens for the public pages, taken from the real app with sample progress.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://127.0.0.1:8766/';
const OUT = path.join(__dirname, '../dist/assets/shots');
const TMP = path.join(__dirname, '../.shots');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });

const seed = () => {
  const D = window.ENTER_DEBUG, S = D.S, B = D.BANK.all;
  S.onboarded = true; S.diag = true; S.pair = 'mf'; S.target = 95; S.plan = 'free'; S.phone = '7015550124'; S.parentPhone = '7770000008'; S.parentOn = true; S.remindOn = true;
  S.answers = {}; S.sess = null; S.mock = null;
  const want = { read: 7, mlit: 5, hist: 12, math: 21, phys: 9 };
  const now = Date.now();
  Object.keys(want).forEach((k) => {
    const list = B.filter((q) => q.s === k);
    const byTp = {};
    list.forEach((q) => { (byTp[q.tp] = byTp[q.tp] || []).push(q); });
    // answer every topic evenly, then turn answers right until the block reaches the wanted points
    const tps = Object.keys(byTp);
    const take = {};
    const frac = [0.9, 0.7, 0.5, 0.8, 0.6, 0.4];
    const limit = (tp) => (k === 'hist' ? Math.ceil(byTp[tp].length * frac[tp % 6]) : k === 'math' ? 6 : k === 'read' ? byTp[tp].length : 4);
    tps.forEach((tp) => { take[tp] = byTp[tp].slice(0, Math.min(byTp[tp].length, limit(tp))); take[tp].forEach((q) => { S.answers[q.id] = { ok: false, n: 1, c: 0, last: now - 2 * 86400000, pick: Array.isArray(q.ans) ? [(q.ans[0] + 1) % q.opts.length] : (q.ans + 1) % q.opts.length }; }); });
    const blocks = ['read', 'mlit', 'hist', 'math', 'phys'], b = blocks.indexOf(k);
    let guard = 0, tp = 0;
    while (D.model().got[b] < want[k] && guard++ < 500) {
      const key = tps[tp % tps.length]; tp++;
      const q = take[key].find((x) => !S.answers[x.id].ok);
      if (q) S.answers[q.id] = { ok: true, n: 1, c: 1, last: now - 2 * 86400000, pick: q.ans };
    }
    // heavy topics jump by more than a point: settle on the exact value with the lightest topics
    let g2 = 0;
    while (D.model().got[b] !== want[k] && g2++ < 300) {
      const over = D.model().got[b] > want[k];
      const rows = D.model().blocks[b].slice().sort((x, y) => x.w - y.w);
      for (const r of rows) {
        const q = (take[r.i] || []).find((x) => !!S.answers[x.id].ok === over);
        if (q) { S.answers[q.id] = over ? { ok: false, n: 1, c: 0, last: now - 2 * 86400000, pick: Array.isArray(q.ans) ? [(q.ans[0] + 1) % q.opts.length] : (q.ans + 1) % q.opts.length } : { ok: true, n: 1, c: 1, last: now - 2 * 86400000, pick: q.ans }; break; }
      }
    }
  });
  const iso = (x) => { const y = new Date(now - x * 86400000); return y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0'); };
  const got = D.model().got, total = got.reduce((a, c) => a + c, 0);
  S.sessions = [9, 8, 7, 5, 4, 3, 2, 1].map((x, i) => ({ date: iso(x), ts: now - x * 86400000, kind: i === 0 ? 'diag' : 'daily', correct: 7, total: 10, before: total - 8 + i, after: total - 7 + i, beforeGot: got, afterGot: got }));
  S.mocks = [{ date: iso(4), ts: now - 4 * 86400000, got: got, total: total, lost: [{ s: 'phys', tp: 0, pts: 12 }, { s: 'math', tp: 5, pts: 8 }, { s: 'hist', tp: 2, pts: 3 }], wrong: [], answered: 96, pair: 'mf', missing: [false, false, false, false, false] }];
  S.customs = [];
  localStorage.setItem('enter-v1', JSON.stringify(S));
  return total;
};
const seedMock = (subj) => {
  const D = window.ENTER_DEBUG, S = D.S, by = (s) => D.BANK.all.filter((q) => q.s === s);
  const take = (s, n) => by(s).filter((q, i) => i % Math.max(1, Math.floor(by(s).length / n)) === 0).slice(0, n).map((q) => q.id);
  const prof = (s) => { const t = (x, n) => by(s).filter((q) => q.type === x).filter((q, i, a) => i % Math.max(1, Math.floor(a.length / n)) === 0).slice(0, n).map((q) => q.id); return [].concat(t('single', 25), t('context', 5), t('match', 5), t('multi', 5)); };
  const ids = [take('hist', 20), by('read').filter((q) => q.pid === 'sleep' || q.pid === 'library' || q.pid === 'caspian').slice(0, 10).map((q) => q.id), take('mlit', 10), prof('math'), prof('phys')];
  const sel = {};
  ids[0].slice(0, 17).forEach((id) => { sel[id] = D.BANK.byId[id].ans; });
  ids[1].slice(0, 6).forEach((id) => { sel[id] = D.BANK.byId[id].ans; });
  ids[2].slice(0, 4).forEach((id) => { sel[id] = D.BANK.byId[id].ans; });
  ids[3].slice(0, 8).forEach((id) => { const a = D.BANK.byId[id].ans; sel[id] = a; });
  const flags = {}; flags[ids[0][4]] = 1; flags[ids[3][2]] = 1;
  S.mock = { startedAt: Date.now() - 47 * 60000 - 20000, ids: ids, sel: sel, flags: flags, cur: [18, 1, 5, 9, 1], subj: subj };
  localStorage.setItem('enter-v1', JSON.stringify(S));
};

(async () => {
  const b = await chromium.launch();
  for (const lang of ['ru', 'kk']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
    const page = await ctx.newPage();
    const url = BASE + (lang === 'kk' ? 'kk/' : '') + 'app.html';
    const shot = async (name) => { await page.waitForTimeout(350); await page.screenshot({ path: path.join(TMP, name + '-' + lang + '.png') }); };
    const open = async (hash, sel) => { await page.goto('about:blank'); await page.goto(url + '#' + hash); await page.waitForSelector(sel); };
    await page.goto(url + '#start');
    await page.waitForSelector('.onb');
    const total = await page.evaluate(seed);
    console.log(lang, 'sample score', total);
    await open('today', '.hgrid'); await shot('home');
    await open('result', '.rgrid'); await shot('result');
    await open('tasks', '.tgrid'); await shot('tasks');
    await open('calendar', '.month'); await shot('calendar');
    await open('profile', '.pgrid'); await shot('profile');
    await page.evaluate(() => { const D = window.ENTER_DEBUG, S = D.S; const q = D.BANK.all.find((x) => /Жеті жарғы/.test(x.text[0]) && /хане/.test(x.text[0])); S.sess = { kind: 'daily', ids: [q.id].concat(D.BANK.all.filter((x) => x.s === 'mlit').slice(0, 9).map((x) => x.id)), i: 0, res: [], correct: 0, before: 54, beforeGot: [7, 5, 12, 21, 9] }; localStorage.setItem('enter-v1', JSON.stringify(S)); });
    await open('session', '.qcol');
    const wrong = await page.evaluate(() => { const D = window.ENTER_DEBUG, q = D.BANK.byId[D.S.sess.ids[0]]; return (q.ans + 1) % q.opts.length; });
    await page.locator('.qcol .opt').nth(wrong).click();
    await page.locator('.qfoot .btn').click();
    await page.waitForSelector('.tutor');
    await page.locator('.chip').first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('wrong');
    await page.evaluate(() => { const S = window.ENTER_DEBUG.S; S.sess = null; localStorage.setItem('enter-v1', JSON.stringify(S)); });
    await open('today', '.hgrid');
    await page.evaluate(seedMock, 0);
    await open('exam', '.mbar');
    await page.locator('.mbar .iconbtn.ph').click();
    await page.waitForSelector('.box');
    await shot('mockNav');
    await page.evaluate(seedMock, 1);
    await open('exam', '.mq .passage');
    await shot('mockRead');
    await ctx.close();
  }
  await b.close();
  execFileSync('python3', ['-c', `
from PIL import Image
import glob, os, sys
for f in glob.glob(${JSON.stringify(TMP)} + '/*.png'):
    im = Image.open(f).convert('RGB')
    im.save(os.path.join(${JSON.stringify(OUT)}, os.path.basename(f)[:-4] + '.webp'), quality=80, method=6)
print('webp done')
`], { stdio: 'inherit' });
})().catch((e) => { console.error('CRASH', e.message.slice(0, 600)); process.exit(1); });
