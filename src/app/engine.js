/* The working app: saved progress, score, sessions, mock exam, calendar, tools. */
(function () {
  'use strict';
  const PAGE = window.ENTER_LANG === 'kk' ? 'kk' : 'ru';
  const t = T[PAGE];
  const L = (x) => (Array.isArray(x) ? x[PAGE === 'kk' ? 1 : 0] : x);
  const KEY = 'enter-v1';
  const DAY = 86400000;
  const MAX = [10, 10, 20, 50, 50];
  const MINS = [3, 3, 5, 5, 5];
  const OPEN_ORDER = [2, 0, 1, 3, 4]; // tab order to block order
  const MOCK_ANCHOR = Date.UTC(2026, 10, 7); // a Saturday; mocks go every 14 days from here
  const MOCK_MS = 240 * 60000;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const SUBJ = { 'Математика': 'math', 'Физика': 'phys' };
  const SUN = 'M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z';
  const MOON = 'M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z';

  const pad2 = (n) => String(n).padStart(2, '0');
  const isoOf = (y, m, d) => y + '-' + pad2(m + 1) + '-' + pad2(d);
  const parseIso = (iso) => { const a = String(iso).split('-').map(Number); return { y: a[0], m: a[1] - 1, d: a[2], ts: Date.UTC(a[0], a[1] - 1, a[2]) }; };
  const todayIso = () => { const d = new Date(); return isoOf(d.getFullYear(), d.getMonth(), d.getDate()); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };

  /* ---------- saved data ---------- */
  const DEF = () => ({ theme: null, pair: 'mf', target: 95, examIso: '2027-05-10', onboarded: false, diag: false, answers: {}, saved: {}, customs: [], sessions: [], phone: '', parentPhone: '', parentOn: false, remindOn: false, remindTime: '19:00', plan: 'free', sess: null, mock: null, mocks: [] });
  function load() {
    try { const raw = window.localStorage.getItem(KEY); if (raw) return Object.assign(DEF(), JSON.parse(raw)); } catch (e) { /* private mode: the app still works until the tab closes */ }
    return DEF();
  }
  function save() { try { window.localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* see load */ } }
  let S = load();
  /* light or dark: one choice for the app and the public pages, light until someone picks dark */
  const THEME_KEY = 'enter-theme';
  const sharedTheme = () => { try { const v = window.localStorage.getItem(THEME_KEY); return v === 'dark' ? 'night' : v === 'light' ? 'day' : null; } catch (e) { return null; } };
  const setTheme = (x) => { try { window.localStorage.setItem(THEME_KEY, x === 'night' ? 'dark' : 'light'); } catch (e) { /* the choice still holds until the tab closes */ } commit({ theme: x }); };

  /* ---------- task bank by subject and topic ---------- */
  const BY = {};
  BANK.all.forEach((q) => { BY[q.s] = BY[q.s] || {}; (BY[q.s][q.tp] = BY[q.s][q.tp] || []).push(q); });
  const allOf = (k) => BANK.all.filter((q) => q.s === k);
  const pairObj = () => PAIRS.find((x) => x.id === S.pair) || PAIRS[0];
  const blockKeys = () => { const p = pairObj(); return ['read', 'mlit', 'hist', SUBJ[p.ru[0]] || null, SUBJ[p.ru[1]] || null]; };

  function isRight(q, pick) {
    if (Array.isArray(q.ans)) {
      if (!Array.isArray(pick) || pick.length !== q.ans.length) return false;
      return q.ans.every((a) => pick.indexOf(a) >= 0);
    }
    return pick === q.ans;
  }
  /* exam scoring: single and context 1, matching 2, several answers 2 / 1 / 0 */
  function pointsOf(q) { return q.type === 'match' || q.type === 'multi' ? 2 : 1; }
  function pointsFor(q, pick) {
    if (pick === undefined || pick === null) return 0;
    if (q.type === 'multi') {
      const sel = Array.isArray(pick) ? pick : [];
      if (!sel.length) return 0;
      const miss = q.ans.filter((a) => sel.indexOf(a) < 0).length;
      const extra = sel.filter((a) => q.ans.indexOf(a) < 0).length;
      const err = miss + extra;
      return err === 0 ? 2 : err === 1 ? 1 : 0;
    }
    return isRight(q, pick) ? pointsOf(q) : 0;
  }
  function record(q, pick) {
    const prev = S.answers[q.id] || { n: 0, c: 0 };
    const ok = isRight(q, pick);
    S.answers[q.id] = { ok: ok, n: prev.n + 1, c: prev.c + (ok ? 1 : 0), last: Date.now(), pick: pick };
    return ok;
  }

  /* ---------- score: an estimate from the student's own answers ---------- */
  function model() {
    const keys = blockKeys();
    const got = [0, 0, 0, 0, 0], next = [0, 0, 0, 0, 0], blocks = [], all = [];
    keys.forEach((k, b) => {
      if (!k) { blocks.push(null); return; }
      let bn = 0, bc = 0;
      const rows = TOPICS[k].map((tp, i) => {
        let n = 0, c = 0, wrong = 0;
        const list = (BY[k] && BY[k][i]) || [];
        list.forEach((q) => { const a = S.answers[q.id]; if (a) { n++; if (a.ok) c++; else wrong++; } });
        bn += n; bc += c;
        return { i: i, key: k, block: b, name: tp[PAGE], w: tp.w, total: list.length, n: n, c: c, wrong: wrong };
      });
      const fallback = bn ? (bc / bn) * 0.5 : 0;
      let sum = 0;
      rows.forEach((r) => {
        r.m = r.n ? r.c / (r.n + 2) : fallback;
        r.pts = r.w * r.m;
        sum += r.pts;
        r.delta = Math.max(0, r.w * ((r.c + 3) / (r.n + 5) - r.m));
        r.plus = clamp(Math.round(r.delta), 1, 3);
        all.push(r);
      });
      got[b] = Math.min(MAX[b], Math.round(sum));
      blocks.push(rows);
    });
    const near = all.slice().sort((a, b) => b.delta - a.delta).slice(0, 3);
    near.forEach((r) => { next[r.block] += r.plus; });
    next.forEach((v, b) => { next[b] = Math.min(v, MAX[b] - got[b]); });
    return { got: got, next: next, blocks: blocks, near: near, score: got.reduce((a, b) => a + b, 0) };
  }

  /* ---------- choosing tasks ---------- */
  function freshPool(list) { /* never solved first, then the longest not seen */
    const unseen = [], seen = [];
    list.forEach((q) => { if (S.answers[q.id]) seen.push(q); else unseen.push(q); });
    seen.sort((a, b) => S.answers[a.id].last - S.answers[b.id].last);
    return shuffle(unseen).concat(seen);
  }
  /* takes count tasks of subject k, more from the heavier topics */
  function spread(k, count, filter) {
    const pools = {}, cycle = [];
    TOPICS[k].forEach((tp, i) => {
      const list = ((BY[k] && BY[k][i]) || []).filter((q) => !filter || filter(q));
      if (list.length) { pools[i] = freshPool(list); for (let w = 0; w < Math.max(1, Math.round(tp.w)); w++) cycle.push(i); }
    });
    const order = shuffle(cycle), out = [];
    let guard = 0;
    while (out.length < count && guard < count * cycle.length + 40 && order.length) {
      const i = order[guard % order.length]; guard++;
      if (pools[i] && pools[i].length) out.push(pools[i].shift().id);
    }
    return out;
  }
  function pickRead(count) {
    const groups = {};
    allOf('read').forEach((q) => { (groups[q.pid] = groups[q.pid] || []).push(q); });
    const ids = Object.keys(groups).reduce((acc, pid) => acc.concat(groups[pid].map((q) => q.id)), []);
    let left = ids.length - count;
    const keep = ids.slice();
    while (left-- > 0) keep.splice(Math.floor(Math.random() * keep.length), 1);
    return keep;
  }
  function buildDiag() {
    const keys = blockKeys(), ids = [];
    const simple = (q) => q.type === 'single' || !q.type;
    ids.push.apply(ids, spread('hist', 4));
    const pids = shuffle(Object.keys(QB_PASSAGES));
    ids.push.apply(ids, shuffle(allOf('read').filter((q) => q.pid === pids[0])).slice(0, 3).map((q) => q.id));
    ids.push.apply(ids, spread('mlit', 3));
    [keys[3], keys[4]].forEach((k) => { if (k) ids.push.apply(ids, spread(k, 5, simple)); });
    return ids;
  }
  const dueMistakes = () => Object.keys(S.answers)
    .filter((id) => BANK.byId[id] && !S.answers[id].ok && new Date(S.answers[id].last).toDateString() !== new Date().toDateString())
    .sort((a, b) => S.answers[a].last - S.answers[b].last);
  const allMistakes = () => Object.keys(S.answers).filter((id) => BANK.byId[id] && !S.answers[id].ok).sort((a, b) => S.answers[a].last - S.answers[b].last);
  function buildDaily() {
    const ids = [], want = 10;
    const add = (id) => { if (ids.length < want && ids.indexOf(id) < 0) ids.push(id); };
    dueMistakes().slice(0, 4).forEach(add);
    const md = model();
    md.near.slice(0, 2).forEach((r) => { freshPool(BY[r.key][r.i] || []).slice(0, 3).forEach((q) => add(q.id)); });
    const keys = blockKeys().filter(Boolean);
    let g = 0;
    while (ids.length < want && g < 200) {
      const k = keys[g % keys.length]; g++;
      const c = freshPool(allOf(k)).find((q) => ids.indexOf(q.id) < 0);
      if (c) add(c.id);
    }
    return ids;
  }
  function buildTopic(k, i, onlyWrong) {
    const list = (BY[k] && BY[k][i]) || [];
    if (onlyWrong) return list.filter((q) => S.answers[q.id] && !S.answers[q.id].ok).map((q) => q.id).slice(0, 20);
    const wrong = list.filter((q) => S.answers[q.id] && !S.answers[q.id].ok);
    const rest = freshPool(list.filter((q) => wrong.indexOf(q) < 0));
    return wrong.concat(rest).slice(0, 10).map((q) => q.id);
  }
  function buildMock() {
    const keys = blockKeys();
    const prof = (k) => [].concat(spread(k, 25, (q) => q.type === 'single'), spread(k, 5, (q) => q.type === 'context'), spread(k, 5, (q) => q.type === 'match'), spread(k, 5, (q) => q.type === 'multi'));
    return [spread('hist', 20), pickRead(10), spread('mlit', 10), keys[3] ? prof(keys[3]) : [], keys[4] ? prof(keys[4]) : []];
  }
  const studiedOn = (iso) => S.sessions.some((x) => x.date === iso);
  const doneToday = () => S.sessions.some((x) => x.date === todayIso() && x.kind !== 'diag' && x.kind !== 'one');
  const canStart = () => S.plan === 'full' || !doneToday();

  /* ---------- interface state ---------- */
  const nowIso = todayIso(), nowP = parseIso(nowIso);
  const U = {
    screen: 'home', choice: null, checked: false, chip: null, chipNote: '', doneStage: 1, last: S.sessions[S.sessions.length - 1] || null,
    block: 2, navOpen: false, confirm: false, tool: null, calc: '', calcRes: '', calcDone: false, resultI: -1,
    tasksTab: 'topics', subjF: 0, topicI: 2, topicOpen: false, query: '',
    calY: nowP.y, calM: nowP.m, calSel: nowIso, addOpen: false, addTitle: '', addDate: nowIso, addTime: '19:00', addRemind: true,
    authStep: 'phone', phoneInput: '', code: '', codeBad: false, authNext: null,
    planSel: 'm3', payMethod: 'kaspi', paid: false, payNext: null, pairsAll: false, delOpen: false, reportOpen: false, fileNote: '', pending: null
  };
  let app = null, internalHash = false, lastScreen = null, lastKey = '', hadLayer = false, justChecked = false;
  const render = () => { if (app) app.schedule(); };
  const set = (x) => { Object.assign(U, x); render(); };
  const commit = (x) => { Object.assign(S, x); save(); render(); };

  /* ---------- screens and addresses ---------- */
  const HASH = { onboard: 'start', auth: 'login', home: 'today', tasks: 'tasks', calendar: 'calendar', map: 'map', mockIntro: 'mock', profile: 'profile', pay: 'pay', q: 'session', mock: 'exam', done: 'done', result: 'result', limit: 'limit', share: 'share' };
  const ROUTE = {}; Object.keys(HASH).forEach((k) => { ROUTE[HASH[k]] = k; });
  function resolve(h) {
    let scr = ROUTE[h];
    if (!scr) scr = S.onboarded ? 'home' : 'onboard';
    if (scr === 'onboard' && S.onboarded && h === 'start') scr = 'home';
    if (!S.onboarded && ['onboard', 'auth', 'pay'].indexOf(scr) < 0) { U.pending = scr; scr = 'onboard'; }
    if (scr === 'auth' && S.phone) scr = S.onboarded ? 'home' : 'onboard';
    if (scr === 'q' && !S.sess) scr = 'home';
    if (scr === 'mock' && !S.mock) scr = 'mockIntro';
    if (scr === 'result' && !S.mocks.length) scr = 'mockIntro';
    if ((scr === 'done' || scr === 'share') && !U.last) scr = 'home';
    return scr;
  }
  function syncHash() {
    const h = HASH[U.screen];
    if (h && window.location.hash.slice(1) !== h) { internalHash = true; window.location.hash = h; }
  }
  function go(screen, extra) {
    Object.assign(U, { screen: screen, navOpen: false, confirm: false, tool: null, reportOpen: false, delOpen: false, addOpen: false, fileNote: '' }, extra || {});
    syncHash();
    render();
  }
  window.addEventListener('hashchange', () => {
    if (internalHash) { internalHash = false; return; }
    const scr = resolve(window.location.hash.slice(1));
    if (scr !== U.screen) { if (scr === 'q') openSess(); else go(scr); }
  });

  /* ---------- sessions ---------- */
  function begin(kind, ids) {
    if (!ids.length) return;
    const md = model();
    S.sess = { kind: kind, ids: ids, i: 0, res: [], correct: 0, before: S.diag ? md.score : 0, beforeGot: S.diag ? md.got : [0, 0, 0, 0, 0] };
    save();
    go('q', { choice: null, checked: false, chip: null, chipNote: '' });
  }
  function openSess() {
    const s = S.sess;
    if (!s) return go('home');
    if (s.res.length > s.i) s.i = s.res.length;
    if (s.i >= s.ids.length) return finishSession();
    go('q', { choice: null, checked: false, chip: null, chipNote: '' });
  }
  function startDaily() {
    if (S.sess && S.sess.kind !== 'one') return openSess();
    if (!S.diag) return begin('diag', buildDiag());
    if (!canStart()) return go('limit');
    begin('daily', buildDaily());
  }
  function startMore() {
    if (S.plan !== 'full') return go('limit');
    begin('extra', buildDaily());
  }
  function startTopic(k, i, onlyWrong) {
    if (!canStart()) return go('limit');
    begin(onlyWrong ? 'mist' : 'topic', buildTopic(k, i, onlyWrong));
  }
  function startOne(id) {
    if (!canStart()) return go('limit');
    begin('one', [id]);
  }
  function startMistakes() {
    if (!canStart()) return go('limit');
    begin('mist', allMistakes().slice(0, 20));
  }
  function check() {
    const s = S.sess, q = BANK.byId[s.ids[s.i]];
    const ok = record(q, U.choice);
    s.res.push(ok);
    if (ok) s.correct++;
    save();
    justChecked = true;
    set({ checked: true, chip: null, chipNote: '' });
  }
  function nextQ() {
    const s = S.sess;
    if (s.i >= s.ids.length - 1) return finishSession();
    s.i++;
    save();
    set({ choice: null, checked: false, chip: null, chipNote: '' });
  }
  function finishSession() {
    const s = S.sess;
    if (!s) return go('home');
    if (s.kind === 'diag') S.diag = true;
    const after = model();
    const entry = { date: todayIso(), ts: Date.now(), kind: s.kind, correct: s.correct, total: s.res.length, before: s.before, after: after.score, beforeGot: s.beforeGot, afterGot: after.got };
    S.sessions.push(entry);
    S.sess = null;
    save();
    if (s.kind === 'one') return go('tasks', { last: entry });
    go('done', { last: entry, doneStage: 0 });
    setTimeout(() => set({ doneStage: 1 }), 500);
  }
  function runChip(key) {
    const s = S.sess; if (!s) return;
    if (key === 'similar') {
      const q = BANK.byId[s.ids[s.i]];
      const pool = freshPool((BY[q.s] && BY[q.s][q.tp]) || []).find((x) => s.ids.indexOf(x.id) < 0);
      if (pool) { s.ids.splice(s.i + 1, 0, pool.id); save(); set({ chip: 'similar', chipNote: t.similarAdded }); }
      else set({ chip: 'similar', chipNote: t.similarNone });
      return;
    }
    set({ chip: key, chipNote: '' });
  }

  /* ---------- mock exam ---------- */
  function startMock() {
    if (S.mock) return go('mock');
    if (S.plan !== 'full') return go('pay', { payNext: 'mock', paid: false });
    S.mock = { startedAt: Date.now(), ids: buildMock(), sel: {}, flags: {}, cur: [1, 1, 1, 1, 1], subj: 0 };
    save();
    go('mock');
  }
  const mockLeft = () => (S.mock ? Math.max(0, S.mock.startedAt + MOCK_MS - Date.now()) : 0);
  function fmtLeft(ms) {
    const sec = Math.ceil(ms / 1000), h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s2 = sec % 60;
    return h + ':' + pad2(m) + ':' + pad2(s2);
  }
  function mockStep(d) {
    const M = S.mock, g = M.subj, list = M.ids[g], n = M.cur[g] + d;
    if (n >= 1 && n <= list.length) { M.cur[g] = n; }
    else {
      let k = g + d;
      while (k >= 0 && k <= 4 && !M.ids[k].length) k += d;
      if (k >= 0 && k <= 4) { M.subj = k; M.cur[k] = d > 0 ? 1 : M.ids[k].length; }
    }
    save(); render();
  }
  function finishMock() {
    const M = S.mock;
    if (!M) return;
    const got = [0, 0, 0, 0, 0], lost = {}, wrong = [];
    let answered = 0;
    M.ids.forEach((list, g) => {
      const b = OPEN_ORDER[g];
      list.forEach((id) => {
        const q = BANK.byId[id], pick = M.sel[id];
        const has = pick !== undefined && pick !== null && !(Array.isArray(pick) && !pick.length);
        const p = has ? pointsFor(q, pick) : 0;
        got[b] += p;
        const miss = pointsOf(q) - p;
        if (miss > 0) { const key = q.s + '-' + q.tp; lost[key] = (lost[key] || 0) + miss; }
        if (has) { answered++; if (!record(q, pick)) wrong.push(id); }
      });
    });
    const lostList = Object.keys(lost).map((k) => { const a = k.split('-'); return { s: a[0], tp: +a[1], pts: lost[k] }; }).sort((a, b) => b.pts - a.pts).slice(0, 3);
    S.mocks.push({ date: todayIso(), ts: Date.now(), got: got, total: got.reduce((a, b) => a + b, 0), lost: lostList, wrong: wrong, answered: answered, pair: S.pair, missing: M.ids.map((l) => !l.length) });
    S.mock = null;
    save();
    go('result', { resultI: S.mocks.length - 1 });
  }
  setInterval(() => {
    if (!S.mock) return;
    const left = mockLeft();
    if (left <= 0) { finishMock(); return; }
    const el = document.querySelector('[data-timer]');
    if (el) el.textContent = fmtLeft(left);
  }, 1000);

  /* ---------- calendar ---------- */
  function nextMockTs(from) {
    const k = Math.ceil((from - MOCK_ANCHOR) / (14 * DAY));
    return MOCK_ANCHOR + Math.max(k, from < MOCK_ANCHOR ? 0 : k) * 14 * DAY;
  }
  function dayMeta(iso) {
    const p = parseIso(iso), today = parseIso(todayIso()).ts;
    const first = S.sessions.length ? parseIso(S.sessions[0].date).ts : today;
    const exam = parseIso(S.examIso).ts;
    const dow = (new Date(p.ts).getUTCDay() + 6) % 7;
    const diff = Math.round((p.ts - MOCK_ANCHOR) / DAY);
    const mockRes = S.mocks.filter((x) => x.date === iso)[0] || null;
    const isExam = p.ts === exam;
    const isMock = !!mockRes || (dow === 5 && ((diff % 14) + 14) % 14 === 0 && p.ts >= today && p.ts < exam);
    let kind = 'none';
    if (p.ts < today) { if (p.ts >= first) kind = studiedOn(iso) ? 'done' : 'miss'; }
    else if (p.ts === today) kind = 'today';
    else if (p.ts <= exam) kind = 'plan';
    const own = S.customs.map((e, i) => Object.assign({ idx: i }, e)).filter((e) => e.iso === iso);
    return { p: p, dow: dow, kind: kind, isMock: isMock, mockRes: mockRes, isExam: isExam, own: own, isToday: p.ts === today };
  }
  function streak() {
    let n = 0, ts = parseIso(todayIso()).ts;
    const done = studiedOn(todayIso());
    if (!done) ts -= DAY;
    for (;;) {
      const d = new Date(ts);
      if (!studiedOn(isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))) break;
      n++; ts -= DAY;
    }
    return { n: n, done: done };
  }

  /* ---------- files ---------- */
  async function saveFile(filename, blob) {
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        const d = await window.claude.use('downloads');
        if (d) {
          try { await d.save({ filename: filename, data: blob }); return true; }
          catch (e) { return e && e.code === 'declined' ? true : null; }
        }
      }
    } catch (e) { /* no viewer around this page */ }
    const a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return window.top === window.self ? true : null; /* inside a frame the browser may ignore the download */
  }
  function buildIcs() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const esc = (x) => String(x).replace(/[\\,;]/g, (c) => '\\' + c);
    const ev = (iso, title, i, time) => ['BEGIN:VEVENT', 'UID:enter-' + iso + '-' + i + '@enter', 'DTSTAMP:' + stamp, time ? 'DTSTART:' + iso.replace(/-/g, '') + 'T' + time.replace(':', '') + '00' : 'DTSTART;VALUE=DATE:' + iso.replace(/-/g, ''), 'SUMMARY:' + esc(title), 'END:VEVENT'].join('\r\n');
    const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ENTer//App//' + PAGE.toUpperCase()];
    const exam = parseIso(S.examIso).ts;
    let i = 0;
    for (let ts = nextMockTs(parseIso(todayIso()).ts); ts < exam; ts += 14 * DAY) { const d = new Date(ts); out.push(ev(isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), t.evMock, i++, '10:00')); }
    S.customs.forEach((e) => out.push(ev(e.iso, e.title, i++, e.time)));
    out.push(ev(S.examIso, t.evExam, i++));
    out.push('END:VCALENDAR');
    return new Blob([out.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  }
  const rr = (x, a, b, c, d, r) => { if (x.roundRect) x.roundRect(a, b, c, d, r); else x.rect(a, b, c, d); };
  function drawCard() {
    const md = model(), W = 1080, H = 1920;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), font = '-apple-system,BlinkMacSystemFont,"SF Pro Display",Inter,"Segoe UI",Roboto,Arial,sans-serif';
    x.fillStyle = '#000000'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#F5F5F7'; x.font = '600 52px ' + font; x.textBaseline = 'alphabetic';
    x.fillText(t.cardTop, 80, 150);
    const mark = new Path2D('M78 18V50a12 12 0 0 1-12 12H24M46 40 24 62 46 84');
    x.save(); x.translate(W - 190, 80); x.scale(1.1, 1.1); x.strokeStyle = '#FF9F0A'; x.lineWidth = 13; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(mark); x.restore();
    x.fillStyle = '#F5F5F7'; x.font = '700 340px ' + font;
    x.fillText(String(md.score), 70, 560);
    const gain = U.last ? U.last.after - U.last.before : 0;
    x.fillStyle = '#A1A1A6'; x.font = '500 72px ' + font; x.fillText('/140', 84, 680);
    if (gain > 0) {
      const label = '+' + gain, wd = x.measureText('/140').width;
      x.font = '600 52px ' + font; const lw = x.measureText(label).width;
      x.fillStyle = '#FF9F0A'; x.beginPath(); rr(x, 84 + wd + 34, 626, lw + 60, 76, 38); x.fill();
      x.fillStyle = '#1D1D1F'; x.fillText(label, 84 + wd + 64, 682);
    }
    const cell = (bx, by, size, cols, count, b, from) => {
      for (let i = 0; i < count; i++) {
        const idx = from + i, cx = bx + (i % cols) * (size + 6), cy = by + Math.floor(i / cols) * (size + 6);
        x.fillStyle = idx < md.got[b] ? '#0A84FF' : idx < md.got[b] + md.next[b] ? '#FF9F0A' : '#2C2C2E';
        x.beginPath(); rr(x, cx, cy, size, size, size * 0.22); x.fill();
      }
    };
    const half = (W - 160 - 40) / 2;
    const sz = (half - 9 * 6) / 10;
    let y = 790;
    cell(80, y, sz, 10, 10, 0, 0); cell(80 + half + 40, y, sz, 10, 10, 1, 0); y += sz + 34;
    cell(80, y, sz, 10, 10, 2, 0); cell(80 + half + 40, y, sz, 10, 10, 2, 10); y += sz + 34;
    cell(80, y, sz, 10, 50, 3, 0); cell(80 + half + 40, y, sz, 10, 50, 4, 0);
    x.save(); x.translate(80, H - 110); x.scale(72 / 84, 72 / 84); x.fillStyle = '#F5F5F7';
    x.fill(new Path2D('M6.1 0H56.6V-11.2H18.9V-31.4H53.8V-42.4H18.9V-61.6H56.6V-72.8H6.1Z M64.7 0H77.6V-36.6C77.6 -39.7 77.6 -46 77.3 -54.1C81.7 -46.2 85.6 -39.8 87.6 -36.5L110.7 0H124.6V-72.8H111.7V-33.1C111.7 -30.2 111.8 -24.2 112 -18.7C109.1 -23.9 105.9 -29.4 104.2 -32.2L78.6 -72.8H64.7Z M131.7 -61.6H154.4V0H167.3V-61.6H189.9V-72.8H131.7Z M207.1 1.2C219.2 1.2 228.8 -5.8 230.7 -15.9H219.2C217.8 -11.5 213.6 -8.5 207.4 -8.5C199.1 -8.5 194.3 -14.2 194.1 -22.6H231.4V-25.9C231.4 -41.7 221.5 -52.7 206.7 -52.7C192.2 -52.7 182 -41.4 182 -25.7C182 -10.1 191.7 1.2 207.1 1.2ZM194.2 -31.1C195 -38.4 199.7 -43 206.8 -43C214 -43 218.8 -38.4 219.5 -31.1Z M238.5 0H250.8V-29.2C250.8 -37.3 255.4 -41.3 261.2 -41.3C263.7 -41.3 266.1 -41.1 267 -40.9V-51.9C266 -52 264.7 -52.1 263 -52.1C256.4 -52.1 252.4 -48.9 250.5 -43H250.4V-51.6H238.5Z'));
    x.restore();
    return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
  }

  /* ---------- calculator keys ---------- */
  function calcPress(k) {
    let e = U.calcDone && /[\d,π√(]/.test(k) ? '' : U.calc;
    if (k === 'C') return set({ calc: '', calcRes: '', calcDone: false });
    if (k === '⌫') return set({ calc: U.calc.slice(0, -1), calcDone: false });
    if (k === '=') {
      if (!U.calc) return;
      try { set({ calcRes: CALC.format(CALC.evaluate(U.calc)), calcDone: true }); }
      catch (err) { set({ calcRes: t.calcErr, calcDone: false }); }
      return;
    }
    if (U.calcDone && !/[\d,π√(]/.test(k) && U.calcRes && U.calcRes !== t.calcErr) e = U.calcRes;
    set({ calc: e + k, calcDone: false, calcRes: '' });
  }
  const CALC_KEYS = [['C', 'op'], ['(', 'op'], [')', 'op'], ['⌫', 'op'], ['7'], ['8'], ['9'], ['÷', 'op'], ['4'], ['5'], ['6'], ['×', 'op'], ['1'], ['2'], ['3'], ['−', 'op'], ['0'], [','], ['√', 'op'], ['+', 'op'], ['²', 'op'], ['%', 'op'], ['π', 'op'], ['=', 'eq']];
  const CALC_ARIA = () => ({ 'C': t.calcClear, '⌫': t.calcBack, '²': t.calcSq, '√': t.calcRoot, '=': t.calcEq });
  const PT_CELLS = PERIODIC.concat([{ n: '', sym: '57–71', mass: '', row: 6, col: 3 }, { n: '', sym: '89–103', mass: '', row: 7, col: 3 }]);

  function maskPhone(raw) {
    const d = String(raw || '').replace(/\D/g, '');
    if (d.length < 10) return t.noPhone;
    return '+7 ' + d.slice(0, 3) + ' ••• •• ' + d.slice(-2);
  }

  /* ---------- everything the template needs ---------- */
  function vals() {
    const scr = U.screen;
    const is = { onboard: scr === 'onboard', home: scr === 'home', q: scr === 'q', done: scr === 'done', map: scr === 'map', mockIntro: scr === 'mockIntro', mock: scr === 'mock', result: scr === 'result', limit: scr === 'limit', share: scr === 'share', tasks: scr === 'tasks', calendar: scr === 'calendar', profile: scr === 'profile', auth: scr === 'auth', pay: scr === 'pay' };
    const showNav = is.home || is.map || is.mockIntro || is.result || is.tasks || is.calendar || is.profile;
    const theme = sharedTheme() || S.theme || 'day';
    const md = model();
    const pair = pairObj(), names = pair[PAGE], labels = t.short.concat(names), fullNames = t.full.concat(names);
    const keys = blockKeys();
    const missingNames = [3, 4].filter((b) => !keys[b]).map((b) => fullNames[b]);
    const fresh = !S.diag, zero = [0, 0, 0, 0, 0];
    const score = fresh ? 0 : md.score;
    let shownGot = fresh ? zero : md.got, shownNext = fresh ? zero : md.next;
    if (is.done && U.last) { shownGot = U.doneStage ? (U.last.afterGot || md.got) : (U.last.beforeGot || zero); shownNext = zero; }
    const goTo = (x, extra) => () => go(x, extra);

    /* task on screen */
    const s = S.sess;
    let q = { subj: '', text: '', passage: '', multi: false }, opts = [], exp = { title: '', a: '', m: '', b: '' }, isR = false, isW = false, chips = [], chipText = '', prog = [], progLabel = '', primaryLabel = t.check, cantGo = true, verdict = '', reportId = '';
    if (is.q && s) {
      const qq = BANK.byId[s.ids[s.i]];
      reportId = qq.id;
      const multi = Array.isArray(qq.ans);
      const block = keys.indexOf(qq.s);
      q = { subj: block >= 0 ? fullNames[block] : '', text: L(qq.text), passage: L(qq.passage || qq.list || ''), multi: multi };
      isR = U.checked && isRight(qq, U.choice);
      isW = U.checked && !isR;
      opts = qq.opts.map((o, i) => {
        const inAns = multi ? qq.ans.indexOf(i) >= 0 : qq.ans === i;
        const picked = multi ? (U.choice || []).indexOf(i) >= 0 : U.choice === i;
        const ok = U.checked && inAns, no = U.checked && picked && !inAns;
        return { text: L(o), key: LETTERS[i], showKey: !ok && !no, isOk: ok, isNo: no, cls: ok ? 'ok' : no ? 'no' : (!U.checked && picked ? 'sel' : ''), pressed: picked ? 'true' : 'false',
          pick: () => {
            if (U.checked) return;
            if (multi) { const cur = (U.choice || []).slice(), at = cur.indexOf(i); if (at >= 0) cur.splice(at, 1); else cur.push(i); set({ choice: cur }); }
            else set({ choice: i });
          } };
      });
      if (U.checked) {
        exp.a = L(qq.why);
        const right = multi ? qq.ans.map((i) => L(qq.opts[i])).join(', ') : L(qq.opts[qq.ans]);
        verdict = isR ? t.right : t.wrong + right;
      }
      const list = [];
      if (qq.simple) list.push(['simple', t.chipSimple]);
      list.push(['similar', t.chipSimilar]);
      if (qq.mem) list.push(['remember', t.chipRemember]);
      chips = list.map((c) => ({ label: c[1], pressed: U.chip === c[0] ? 'true' : 'false', pick: () => runChip(c[0]) }));
      if (U.chip === 'simple') chipText = L(qq.simple); else if (U.chip === 'remember') chipText = L(qq.mem); else if (U.chip === 'similar') chipText = U.chipNote;
      prog = s.ids.map((_, i) => (i < s.res.length ? (s.res[i] ? 'ok' : 'no') : (i === s.i && !U.checked ? 'cur' : '')));
      progLabel = (s.i + 1) + ' / ' + s.ids.length;
      primaryLabel = U.checked ? (s.i >= s.ids.length - 1 ? t.finishSession : t.next) : t.check;
      cantGo = !U.checked && (U.choice === null || (Array.isArray(U.choice) && !U.choice.length));
    }

    /* map */
    const blockRows = md.blocks[U.block] || [];
    const topics = blockRows.map((r) => {
      const on = Math.round(r.pts), cells = [];
      for (let i = 0; i < r.w; i++) cells.push(!fresh && i < on ? 'on' : '');
      return { name: r.name, count: (fresh ? 0 : on) + '/' + r.w, cells: cells };
    });

    /* mock */
    const M = S.mock;
    let subjTabs = [], navGroups = [], mq = { text: '', opts: [] }, mqOpts = [], answeredTotal = 0, totalCount = 0, mqNum = '', mFlagged = 'false', mqCls = '', mqHas = false;
    if (M && is.mock) {
      const tabNames = t.tabs.concat(names), groupNames = [t.full[2], t.full[0], t.full[1]].concat(names);
      const hasAns = (id) => { const p = M.sel[id]; return p !== undefined && p !== null && !(Array.isArray(p) && !p.length); };
      const done = M.ids.map((l) => l.filter(hasAns).length);
      answeredTotal = done.reduce((a, b) => a + b, 0);
      totalCount = M.ids.reduce((a, l) => a + l.length, 0);
      subjTabs = tabNames.map((label, i) => ({ label: label, count: done[i] + '/' + M.ids[i].length, cur: M.subj === i ? 'true' : 'false',
        ref: (el) => { if (M.subj === i && el.parentNode && el.parentNode.scrollWidth > el.parentNode.clientWidth) { const box = el.parentNode; box.scrollLeft = Math.max(0, el.offsetLeft - box.offsetLeft - 16); } },
        pick: () => { M.subj = i; save(); render(); } }));
      navGroups = groupNames.map((label, g) => ({ label: label, count: done[g] + '/' + M.ids[g].length,
        items: M.ids[g].map((id, k) => ({ n: k + 1, cls: (M.flags[id] ? 'f' : hasAns(id) ? 'a' : '') + (M.subj === g && M.cur[g] === k + 1 ? ' c' : ''), aria: label + ', ' + (k + 1),
          go: () => { M.subj = g; M.cur[g] = k + 1; save(); set({ navOpen: false }); } })) }));
      const list = M.ids[M.subj];
      if (list.length) {
        const qq = BANK.byId[list[M.cur[M.subj] - 1]], multi = Array.isArray(qq.ans);
        mq = { text: L(qq.text), passage: L(qq.passage || qq.list || ''), multi: multi };
        mqHas = true;
        mqCls = qq.passage || qq.list ? 'mq-two' : '';
        mqNum = t.taskOf(M.cur[M.subj], list.length);
        const pickNow = M.sel[qq.id];
        mqOpts = qq.opts.map((o, i) => {
          const on = multi ? (pickNow || []).indexOf(i) >= 0 : pickNow === i;
          return { text: L(o), key: LETTERS[i], cls: on ? 'sel' : '', pressed: on ? 'true' : 'false',
            pick: () => {
              if (multi) { const cur = (M.sel[qq.id] || []).slice(), at = cur.indexOf(i); if (at >= 0) cur.splice(at, 1); else cur.push(i); if (cur.length) M.sel[qq.id] = cur; else delete M.sel[qq.id]; }
              else if (M.sel[qq.id] === i) delete M.sel[qq.id]; else M.sel[qq.id] = i;
              save(); render();
            } };
        });
        mFlagged = M.flags[qq.id] ? 'true' : 'false';
      } else {
        mq = { text: t.noBank(tabNames[M.subj]), opts: [] };
      }
    }
    const curMockId = M && M.ids[M.subj].length ? M.ids[M.subj][M.cur[M.subj] - 1] : null;

    /* result */
    const R = S.mocks.length ? S.mocks[U.resultI >= 0 && U.resultI < S.mocks.length ? U.resultI : S.mocks.length - 1] : null;
    const resGot = R ? R.got : zero, resTotal = R ? R.total : 0;
    const allMins = resGot.every((g, i) => (R && R.missing && R.missing[OPEN_ORDER.indexOf(i)]) || g >= MINS[i]);
    const resRows = OPEN_ORDER.map((i) => { const miss = R && R.missing && R.missing[OPEN_ORDER.indexOf(i)]; const ok = !miss && resGot[i] >= MINS[i]; return { name: fullNames[i], pts: miss ? '—' : resGot[i] + ' / ' + MAX[i], min: MINS[i], ok: ok, no: !ok }; });
    const resThr = t.thrLabels.map((label, i) => {
      const passed = resTotal >= THRESHOLDS[i] && allMins;
      const need = THRESHOLDS[i] - resTotal;
      return { label: label, min: THRESHOLDS[i], state: passed ? t.thrOk : need > 0 ? t.thrShort(need) : t.thrMin, cls: passed ? 'st-ok' : 'st-no' };
    });
    const resLost = R ? R.lost.map((x) => ({ name: TOPICS[x.s][x.tp][PAGE], pts: '−' + x.pts })) : [];
    const resReview = R ? R.wrong.filter((id) => S.answers[id] && !S.answers[id].ok) : [];

    /* week row */
    const week = [];
    const todayTs = parseIso(todayIso()).ts;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayTs - i * DAY), iso = isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      week.push({ l: t.dowShort[(d.getUTCDay() + 6) % 7], cls: studiedOn(iso) ? 'on' : i === 0 ? 'now' : '' });
    }
    const st = streak();
    const topTitle = is.home ? t.tabToday : is.map ? t.titleMap : is.mockIntro ? t.mockTitle : is.tasks ? t.titleTasks : is.calendar ? t.titleCal : is.profile ? t.tabProfile : t.titleResult;

    /* tasks */
    const blockIdx = OPEN_ORDER[U.subjF];
    const capNames = t.tabs.concat(names);
    const subjCaps = capNames.map((label, i) => ({ label: label, pressed: U.subjF === i ? 'true' : 'false',
      ref: (el) => { if (U.subjF === i && el.parentNode && el.parentNode.scrollWidth > el.parentNode.clientWidth) { const box = el.parentNode; box.scrollLeft = Math.max(0, el.offsetLeft - box.offsetLeft - 16); } },
      pick: () => set({ subjF: i, topicI: 0, topicOpen: false }) }));
    const nearKey = {}; md.near.forEach((r) => { nearKey[r.key + '-' + r.i] = r.plus; });
    const q2 = (U.query || '').trim().toLowerCase();
    const allBlocksRows = OPEN_ORDER.map((b, tab) => (md.blocks[b] || []).map((r) => Object.assign({ tab: tab }, r)));
    const pool = q2 ? allBlocksRows.reduce((a, l) => a.concat(l), []).filter((r) => r.name.toLowerCase().indexOf(q2) >= 0) : allBlocksRows[U.subjF];
    const topicRows = pool.map((r) => ({ name: r.name, meta: t.solvedOf(r.n, r.total), pct: r.total ? Math.round(r.n / r.total * 100) : 0, plus: !fresh && nearKey[r.key + '-' + r.i] ? '+' + nearKey[r.key + '-' + r.i] : '', cur: r.tab === U.subjF && r.i === U.topicI ? 'true' : 'false', pick: () => set({ subjF: r.tab, topicI: r.i, topicOpen: true }) }));
    const selRow = (allBlocksRows[U.subjF] || [])[U.topicI] || (allBlocksRows[U.subjF] || [])[0] || null;
    const fullBySubj = [t.full[2], t.full[0], t.full[1], names[0], names[1]];
    const fmtKey = { single: 'one', context: 'ctx', match: 'match', multi: 'multi' };
    let tp = { name: '', subj: '', solved: '', solvedL: t.statSolved, acc: '', near: '', wrong: false, wrongLabel: '', hasNotes: false, notes: [], hasTasks: false, noTasks: true, tasks: [] };
    if (selRow) {
      const list = (BY[selRow.key] && BY[selRow.key][selRow.i]) || [];
      const notes = NOTES[selRow.key + '-' + selRow.i];
      tp = { name: selRow.name, subj: fullBySubj[U.subjF], solved: selRow.n + '/' + selRow.total, solvedL: t.statSolved, acc: selRow.n ? Math.round(selRow.c / selRow.n * 100) + '%' : '—', near: '+' + selRow.plus,
        wrong: selRow.wrong > 0, wrongLabel: t.onlyWrong(selRow.wrong), hasNotes: !!notes, notes: notes ? notes[PAGE] : [], hasTasks: list.length > 0, noTasks: !list.length,
        solve: () => startTopic(selRow.key, selRow.i, false), solveWrong: () => startTopic(selRow.key, selRow.i, true),
        tasks: is.tasks && (U.topicOpen || window.innerWidth >= 700) ? list.slice(0, 40).map((qq) => {
          const a = S.answers[qq.id], sv = !!S.saved[qq.id];
          return { text: L(qq.text), meta: t.fmt[fmtKey[qq.type] || 'one'], stCls: a ? (a.ok ? 'sdot-ok' : 'sdot-no') : '', stAria: a ? (a.ok ? t.stAria.ok : t.stAria.no) : t.stAria.none, isOk: !!(a && a.ok), isNo: !!(a && !a.ok), saved: sv ? 'true' : 'false', saveAria: sv ? t.savedAria : t.saveAria, saveFill: sv ? 'currentColor' : 'none', saveColor: sv ? 'var(--accent-text)' : 'var(--text2)',
            go: () => startOne(qq.id), toggle: () => { const m = Object.assign({}, S.saved); if (m[qq.id]) delete m[qq.id]; else m[qq.id] = 1; commit({ saved: m }); } };
        }) : [] };
    }
    const savedRows = Object.keys(S.saved).filter((id) => BANK.byId[id]).map((id) => { const qq = BANK.byId[id]; return { text: L(qq.text), meta: t.fmt[fmtKey[qq.type] || 'one'], go: () => startOne(id), toggle: () => { const m = Object.assign({}, S.saved); delete m[id]; commit({ saved: m }); } }; });
    const mistIds = allMistakes();
    const dayKey = (ts) => new Date(ts).toDateString();
    const mistRows = is.tasks ? mistIds.slice(-30).reverse().map((id) => {
      const qq = BANK.byId[id], a = S.answers[id], block = keys.indexOf(qq.s), multi = Array.isArray(qq.ans);
      const showPick = (p) => (Array.isArray(p) ? p.map((i) => L(qq.opts[i])).join(', ') : (p === undefined || p === null ? '—' : L(qq.opts[p])));
      return { subj: block >= 0 ? fullNames[block] : '', q: L(qq.text), your: showPick(a.pick), right: multi ? qq.ans.map((i) => L(qq.opts[i])).join(', ') : L(qq.opts[qq.ans]), when: dayKey(a.last) === dayKey(Date.now()) ? t.whenTomorrow : t.whenToday };
    }) : [];

    /* calendar */
    const firstDow = (new Date(Date.UTC(U.calY, U.calM, 1)).getUTCDay() + 6) % 7;
    const daysIn = new Date(Date.UTC(U.calY, U.calM + 1, 0)).getUTCDate();
    const cellsCount = Math.ceil((firstDow + daysIn) / 7) * 7;
    const calCells = [];
    if (is.calendar) {
      for (let i = 0; i < cellsCount; i++) {
        const dt = new Date(Date.UTC(U.calY, U.calM, 1 + i - firstDow));
        const iso = isoOf(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
        const meta = dayMeta(iso), cls = [];
        let label = '';
        if (dt.getUTCMonth() !== U.calM) cls.push('day-out');
        if (meta.isExam) { cls.push('day-exam'); label = t.evExam; }
        else if (meta.isMock) { cls.push('day-mock'); label = t.evMockS; }
        else if (meta.kind === 'done') cls.push('day-done');
        else if (meta.kind === 'miss') cls.push('day-miss');
        else if (meta.kind === 'plan') cls.push('day-plan');
        if (meta.isToday) { cls.push('day-today'); label = label || t.evSession; }
        if (meta.own.length) { cls.push('day-custom'); label = label || meta.own[0].title; }
        calCells.push({ n: dt.getUTCDate(), label: label, cls: cls.join(' '), sel: U.calSel === iso ? 'true' : 'false',
          aria: t.fmtDay(t.weekdays[meta.dow], dt.getUTCDate(), t.monthsGen[dt.getUTCMonth()]) + (label ? ': ' + label : ''),
          pick: () => set({ calSel: iso, calY: dt.getUTCFullYear(), calM: dt.getUTCMonth() }) });
      }
    }
    const selMeta = dayMeta(U.calSel);
    const agenda = [];
    if (is.calendar) {
      if (selMeta.isExam) agenda.push({ title: t.ag.exam.title, sub: t.ag.exam.sub });
      if (selMeta.isMock) {
        if (selMeta.mockRes) { const idx = S.mocks.indexOf(selMeta.mockRes); agenda.push({ time: '', title: t.ag.mock.title, sub: t.ag.mockDone(selMeta.mockRes.total), cta: t.ag.mock.cta, ctaCls: 'btn2', go: goTo('result', { resultI: idx }) }); }
        else agenda.push({ time: '10:00', title: t.ag.mock.title, sub: t.ag.mock.sub, cta: t.ag.mock.cta, ctaCls: 'btn2', go: goTo('mockIntro') });
      }
      if (selMeta.kind === 'today') {
        if (!S.diag) agenda.push({ time: S.remindTime, title: t.emptyTitle, sub: t.emptyTextN(20, 15), cta: t.emptyCta, ctaCls: 'btn', go: startDaily });
        else if (!doneToday()) agenda.push({ time: S.remindTime, title: t.ag.today.title, sub: t.sessMetaN(10, 7, Math.min(4, dueMistakes().length)), cta: t.ag.today.cta, ctaCls: 'btn', go: startDaily });
        else { const list = S.sessions.filter((x) => x.date === U.calSel && x.kind !== 'one'); const lastS = list[list.length - 1]; agenda.push({ title: t.ag.done.title, sub: lastS ? t.agDoneN(lastS.after - lastS.before, lastS.correct, lastS.total) : '' }); }
        if (mistIds.length) agenda.push({ title: t.ag.review.title, sub: t.reviewSubN(Math.min(20, mistIds.length), Math.max(1, Math.round(Math.min(20, mistIds.length) * 0.7))), cta: t.ag.review.cta, ctaCls: 'btn2', go: goTo('tasks', { tasksTab: 'mistakes' }) });
      } else if (selMeta.kind === 'plan' && !selMeta.isExam) {
        agenda.push({ time: S.remindTime, title: t.ag.plan.title, sub: t.ag.plan.sub });
      } else if (selMeta.kind === 'done') {
        const list = S.sessions.filter((x) => x.date === U.calSel && x.kind !== 'one');
        const lastS = list[list.length - 1];
        agenda.push({ title: t.ag.done.title, sub: lastS ? t.agDoneN(lastS.after - lastS.before, lastS.correct, lastS.total) : '' });
      } else if (selMeta.kind === 'miss') {
        agenda.push({ title: t.ag.miss.title, sub: t.ag.miss.sub });
      }
      selMeta.own.forEach((e) => agenda.push({ time: e.time, title: e.title, sub: t.customSub, cta: t.customDel, ctaCls: 'btn2', go: () => { const c = S.customs.slice(); c.splice(e.idx, 1); commit({ customs: c }); } }));
    }
    const examTs = parseIso(S.examIso).ts;
    const daysToExam = Math.max(0, Math.round((examTs - todayTs) / DAY));
    const weeksLeft = Math.max(1, daysToExam / 7);
    const perWeekText = Math.max(0, (S.target - score) / weeksLeft).toFixed(1).replace('.', ',');
    const nextMockT = nextMockTs(todayTs);
    const nextMockD = new Date(nextMockT);
    const upcoming = [];
    if (is.calendar) {
      for (let k = 0; k < 2; k++) {
        const ts = nextMockT + k * 14 * DAY;
        if (ts < examTs) { const dd = new Date(ts); upcoming.push({ ts: ts, title: t.evMock, date: t.fmtShort(dd.getUTCDate(), t.monthsGen[dd.getUTCMonth()]) }); }
      }
      S.customs.forEach((e) => { const pe = parseIso(e.iso); if (pe.ts >= todayTs) upcoming.push({ ts: pe.ts, title: e.title, date: t.fmtShort(pe.d, t.monthsGen[pe.m]) }); });
      const pe = parseIso(S.examIso);
      upcoming.push({ ts: examTs, title: t.evExam, date: t.fmtShort(pe.d, t.monthsGen[pe.m]) });
      upcoming.sort((a, b) => a.ts - b.ts);
    }
    const shiftMonth = (d) => () => { const nx = new Date(Date.UTC(U.calY, U.calM + d, 1)); set({ calY: nx.getUTCFullYear(), calM: nx.getUTCMonth() }); };

    /* sign in */
    const digits = String(U.code || '');
    const codeCells = [0, 1, 2, 3].map((i) => ({ v: digits[i] || '', cls: U.codeBad ? 'ccell-err' : i === digits.length ? 'ccell-on' : '' }));
    const phoneDigits = String(U.phoneInput || '').replace(/\D/g, '');

    /* home copy */
    const diagN = 10 + (keys[3] ? 5 : 0) + (keys[4] ? 5 : 0);
    const diagMin = Math.round(diagN * 0.75);
    const sessMeta = S.sess && S.sess.kind !== 'one' ? t.sessMetaN(S.sess.ids.length, Math.max(1, Math.round(S.sess.ids.length * 0.7)), 0) : t.sessMetaN(10, 7, Math.min(4, dueMistakes().length));
    const nearNames = md.near.slice(0, 2).map((r) => r.name);
    const last = U.last;
    const gain = last ? Math.max(0, last.after - last.before) : 0;
    const shownScore = is.done && last ? (U.doneStage ? last.after : last.before) : score;

    const extra = {
      tasksTabs: t.tasksSeg.map((label, i) => { const id = ['topics', 'mistakes', 'saved'][i]; return { label: label, pressed: U.tasksTab === id ? 'true' : 'false', pick: () => set({ tasksTab: id, topicOpen: false }) }; }),
      tab: { topics: U.tasksTab === 'topics', mistakes: U.tasksTab === 'mistakes', saved: U.tasksTab === 'saved' },
      tabTopics: () => set({ tasksTab: 'topics' }),
      query: U.query || '', setQuery: (e) => set({ query: e.target.value, topicOpen: false }), clearQuery: () => set({ query: '' }),
      emptySearch: q2 ? t.searchEmpty(U.query) : t.noBank(capNames[U.subjF]),
      subjCaps: subjCaps, topicRows: topicRows, hasRows: topicRows.length > 0, noRows: topicRows.length === 0, hasTp: !!selRow,
      tgridCls: U.topicOpen ? 'tgrid-open' : '', segCls: U.topicOpen && U.tasksTab === 'topics' ? 'sh' : '', closeTopic: () => set({ topicOpen: false }), tp: tp,
      savedRows: savedRows, hasSaved: savedRows.length > 0, noSaved: savedRows.length === 0,
      hasMist: mistIds.length > 0, noMist: mistIds.length === 0, mistRows: mistRows, mistLead: t.mistLeadN(Math.min(20, mistIds.length), Math.max(1, Math.round(Math.min(20, mistIds.length) * 0.7))), startMistakes: startMistakes,

      calTitle: t.months[U.calM] + ' ' + U.calY, calCells: calCells, calPrev: shiftMonth(-1), calNext: shiftMonth(1),
      calToToday: () => { const p = parseIso(todayIso()); set({ calY: p.y, calM: p.m, calSel: todayIso() }); },
      calSelTitle: t.fmtDay(t.weekdays[selMeta.dow], selMeta.p.d, t.monthsGen[selMeta.p.m]),
      agenda: agenda, agendaEmpty: agenda.length === 0, paceTitle: t.paceTitle(daysToExam), paceLine: t.paceLine(score, S.target, perWeekText), pacePct: Math.min(100, Math.round((score / S.target) * 100)),
      upcoming: upcoming.slice(0, 4), addOpen: !!U.addOpen, openAdd: () => set({ addOpen: true, addDate: U.calSel, addTitle: '' }), closeAdd: () => set({ addOpen: false }),
      addTitle: U.addTitle || '', addDate: U.addDate, addTime: U.addTime, addRemind: !!U.addRemind,
      setAddTitle: (e) => set({ addTitle: e.target.value }), setAddDate: (e) => set({ addDate: e.target.value }), setAddTime: (e) => set({ addTime: e.target.value }), toggleAddRemind: (e) => set({ addRemind: e.target.checked }),
      addDisabled: !(U.addTitle || '').trim() || !U.addDate,
      saveAdd: () => { const title = (U.addTitle || '').trim(); if (!title || !U.addDate) return; const pa = parseIso(U.addDate); S.customs = S.customs.concat([{ iso: U.addDate, time: U.addTime, title: title }]); save(); set({ addOpen: false, calSel: U.addDate, calY: pa.y, calM: pa.m }); },
      doIcs: async () => { const r = await saveFile('enter-calendar.ics', buildIcs()); set({ fileNote: r === null ? t.icsBlocked : '' }); },
      fileNote: U.fileNote,

      goTasks: goTo('tasks'), goCalendar: goTo('calendar'), goProfile: goTo('profile'), goOnboard: goTo('onboard'), goPay: goTo('pay', { paid: false, payNext: null }),
      goAuth: goTo('auth', { authStep: 'phone', code: '', codeBad: false, authNext: null }),
      saveByPhone: goTo('auth', { authStep: 'phone', code: '', codeBad: false, authNext: 'done' }), canSave: !S.phone,
      pairLabel: names.join(' + '), examIso: S.examIso, setExam: (e) => { if (e.target.value) commit({ examIso: e.target.value }); },
      parentOn: !!S.parentOn, toggleParent: (e) => commit({ parentOn: e.target.checked }), parentPhone: S.parentPhone, setParentPhone: (e) => commit({ parentPhone: e.target.value }),
      remindOn: !!S.remindOn, toggleRemind: (e) => commit({ remindOn: e.target.checked }), remindTime: S.remindTime, setRemindTime: (e) => { if (e.target.value) commit({ remindTime: e.target.value }); },
      themeSeg: { day: theme === 'day' ? 'true' : 'false', night: theme === 'night' ? 'true' : 'false' }, setDay: () => setTheme('day'), setNight: () => setTheme('night'),
      planLabel: S.plan === 'full' ? t.planFull : t.planFree, planFree: S.plan !== 'full', planFull: S.plan === 'full', backToFree: () => { U.paid = false; commit({ plan: 'free' }); },
      hasPhone: !!S.phone, noPhone: !S.phone, profilePhone: maskPhone(S.phone), initial: 'E', logout: () => { commit({ phone: '' }); go('auth', { authStep: 'phone', code: '', codeBad: false, authNext: null, phoneInput: '' }); },

      authPhone: U.authStep === 'phone', authCode: U.authStep === 'code', phone: U.phoneInput || '', setPhone: (e) => set({ phoneInput: e.target.value }), phoneShort: phoneDigits.length < 10,
      sendCode: () => { if (String(U.phoneInput || '').replace(/\D/g, '').length >= 10) set({ authStep: 'code', code: '', codeBad: false }); },
      codeLead: t.codeLeadDemo(U.phoneInput || ''), code: digits, codeCells: codeCells, codeBad: !!U.codeBad,
      setCode: (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (v.length === 4 && v !== '0000') {
          S.phone = String(U.phoneInput).replace(/\D/g, ''); save();
          if (U.authNext === 'done') go('done', { code: v, codeBad: false, authNext: null, doneStage: 1 });
          else if (S.onboarded) go('home', { code: v, codeBad: false });
          else go('onboard', { code: v, codeBad: false });
        } else set({ code: v, codeBad: v === '0000' });
      },
      resendCode: () => set({ code: '', codeBad: false }), changePhone: () => set({ authStep: 'phone', code: '', codeBad: false }),

      payForm: !U.paid && S.plan !== 'full', paid: U.paid || S.plan === 'full', paidCta: U.payNext === 'mock' ? t.mockStart : t.paidCta,
      planOpts: t.payPlans.map((o) => ({ name: o.name, price: o.price, pressed: U.planSel === o.id ? 'true' : 'false', pick: () => set({ planSel: o.id }) })),
      payM: { kaspi: U.payMethod === 'kaspi' ? 'true' : 'false', card: U.payMethod === 'card' ? 'true' : 'false' }, setKaspi: () => set({ payMethod: 'kaspi' }), setCard: () => set({ payMethod: 'card' }),
      payNow: () => { commit({ plan: 'full' }); set({ paid: true }); }, payBack: () => go(S.onboarded ? (U.payNext === 'mock' ? 'mockIntro' : 'profile') : 'onboard'),
      paidGo: () => { const nx = U.payNext; U.payNext = null; U.paid = false; if (nx === 'mock') startMock(); else go('home'); },

      reportOpen: !!U.reportOpen, openReport: () => set({ reportOpen: true }), closeReport: () => set({ reportOpen: false }), reportText: t.reportD(reportId),
      openBlockTopics: () => go('tasks', { tasksTab: 'topics', subjF: OPEN_ORDER.indexOf(U.block), topicI: 0, topicOpen: false }),
      noTopicsText: t.noBank(fullNames[U.block]),
      pairNote: missingNames.length ? t.pairSoon(missingNames) : '',

      canWebShare: typeof navigator.share === 'function', saveCls: typeof navigator.share === 'function' ? 'btn2' : 'btn',
      doShare: async () => { const b = await drawCard(); const f = new File([b], 'enter-map.png', { type: 'image/png' }); try { await navigator.share({ files: [f] }); } catch (e) { if (!e || e.name !== 'AbortError') { const r = await saveFile('enter-map.png', b); set({ fileNote: r === null ? t.icsBlocked : '' }); } } },
      doSavePic: async () => { const b = await drawCard(); const r = await saveFile('enter-map.png', b); set({ fileNote: r === null ? t.icsBlocked : '' }); }
    };

    const base = {
      landingHref: PAGE === 'kk' ? 'index.html' : './', helpHref: 'help.html', legalHref: 'legal.html',
      delOpen: !!U.delOpen, askDelete: () => set({ delOpen: true }), closeDelete: () => set({ delOpen: false }),
      doDelete: () => { S = DEF(); try { window.localStorage.removeItem(KEY); } catch (e) { /* see load */ } U.last = null; go('onboard'); },
      t: t, theme: theme, lang: PAGE, is: is, showNav: showNav, showTop: showNav, topTitle: topTitle, minH: '100vh', shellCls: showNav ? 'shell-nav' : '', mainCls: '',
      cur: { home: is.home ? 'page' : undefined, map: is.map ? 'page' : undefined, mock: (is.mockIntro || is.result) ? 'page' : undefined, tasks: is.tasks ? 'page' : undefined, cal: is.calendar ? 'page' : undefined, profile: is.profile ? 'page' : undefined },
      seg: { ru: PAGE === 'ru' ? 'true' : 'false', kk: PAGE === 'kk' ? 'true' : 'false' },
      setRu: () => { if (PAGE !== 'ru') window.location.href = '../app.html#profile'; }, setKk: () => { if (PAGE !== 'kk') window.location.href = 'kk/app.html#profile'; },
      themeAria: theme === 'night' ? t.themeToDay : t.themeToNight, themeIcon: theme === 'night' ? SUN : MOON, toggleTheme: () => setTheme(theme === 'night' ? 'day' : 'night'),
      goHome: goTo('home'), goMap: goTo('map'), goMockIntro: goTo('mockIntro'), goResult: goTo('result', { resultI: -1 }), goShare: goTo('share'), goDone: goTo('done', { doneStage: 1 }),
      startSession: startDaily, startMore: startMore, startMock: startMock,
      finishDone: goTo('home'),
      true: true, false: false, zero: zero,
      m: { got: shownGot, next: shownNext, labels: labels }, mapAria: shownScore + ' / 140', fresh: fresh, hasData: !fresh,
      showSess: !fresh && !doneToday(), doneToday: !fresh && doneToday(),
      scoreText: fresh ? '?' : String(score), goalText: t.goal + ': ' + S.target,
      near: md.near.map((r) => ({ plus: '+' + r.plus, name: r.name, sub: fullNames[r.block], go: () => startTopic(r.key, r.i, false) })),
      week: week, streakText: t.streakN(st.n, st.done), daysLeftText: t.paceTitle(daysToExam) + '.',
      nextMock: t.nextMockN(t.fmtShort(nextMockD.getUTCDate(), t.monthsGen[nextMockD.getUTCMonth()])),
      emptyText: t.emptyTextN(diagN, diagMin), emptyCta: S.sess && S.sess.kind === 'diag' ? t.diagContinue : t.emptyCta,
      sessMeta: sessMeta, sessTopics: nearNames.length ? t.sessTopicsN(nearNames) : '', sessStart: S.sess && S.sess.kind !== 'one' ? t.sessContinue : t.sessStart,
      pairs: PAIRS.slice(0, U.pairsAll || PAIRS.findIndex((x) => x.id === S.pair) >= 6 ? PAIRS.length : 6).map((x) => ({ label: x[PAGE].join(' + '), pressed: S.pair === x.id ? 'true' : 'false', pick: () => commit({ pair: x.id }) })),
      pairsMore: !U.pairsAll && PAIRS.findIndex((x) => x.id === S.pair) < 6, showAllPairs: () => set({ pairsAll: true }),
      target: S.target, setTarget: (e) => commit({ target: Number(e.target.value) }),
      finishOnboard: () => { const nx = U.pending; U.pending = null; const wasOn = S.onboarded; commit({ onboarded: true }); go(nx || (wasOn && S.diag ? 'profile' : 'home')); },
      q: q, opts: opts, checked: !!U.checked, notChecked: !U.checked, isRight: isR, isWrong: isW, qCls: U.checked ? 'qwrap-two' : '', vCls: isR ? 'v-ok' : 'v-no', verdict: verdict, exp: exp, chips: chips,
      chipLoad: false, chipErr: false, chipOk: !!U.chip && !!chipText, chipText: chipText, chipRetry: () => {},
      prog: prog, progLabel: progLabel, cantGo: cantGo, primary: U.checked ? nextQ : check, primaryLabel: primaryLabel,
      doneTitle: last && last.kind === 'diag' ? t.diagDoneTitle : t.doneTitle, doneNext: last && last.kind === 'diag' ? t.diagDoneNext : t.doneTomorrow, doneBefore: last ? String(last.before) : '0', doneScore: last ? String(last.after) : '0', doneLine: last ? t.doneLineN(gain, last.correct, last.total) : '',
      block: U.block, pickBlock: (b) => set({ block: b }), blockName: fullNames[U.block], topics: topics, hasTopics: topics.length > 0, noTopics: topics.length === 0,
      mockCta: S.mock ? t.mockContinue : t.mockStart, mockNote: S.mock ? t.mockProgressN(fmtLeft(mockLeft())) : (S.plan === 'full' ? '' : t.mockFree),
      mockLast: S.mocks.length ? t.mockLastN(S.mocks[S.mocks.length - 1].total) : '',
      timerText: fmtLeft(mockLeft()), subjTabs: subjTabs, navGroups: navGroups, mq: mq, mqOpts: mqOpts, mqNum: mqNum, mqCls: mqCls, mqHas: mqHas,
      navOpen: !!U.navOpen, confirm: !!U.confirm, toolOpen: !!U.tool, openNav: () => set({ navOpen: true }), askFinish: () => set({ confirm: true }), closeLayer: () => set({ navOpen: false, confirm: false, tool: null }),
      confirmText: t.confirmTextN(totalCount - answeredTotal, fmtLeft(mockLeft())), finishMock: finishMock,
      toolTitle: U.tool === 'calc' ? t.toolCalc : U.tool === 'per' ? t.toolPeriodicLong : t.toolSolLong, toolBoxCls: U.tool === 'per' ? 'box-wide' : '',
      tool: { calc: U.tool === 'calc', per: U.tool === 'per', sol: U.tool === 'sol' }, toolCalc: () => set({ tool: 'calc' }), toolPeriodic: () => set({ tool: 'per' }), toolSol: () => set({ tool: 'sol' }),
      calcExpr: U.calc, calcRes: U.calcRes, calcKeys: U.tool === 'calc' ? CALC_KEYS.map((k) => ({ label: k[0], cls: k[1] ? 'calckey-' + k[1] : '', aria: CALC_ARIA()[k[0]] || k[0], go: () => calcPress(k[0]) })) : [], ptCells: U.tool === 'per' ? PT_CELLS : [],
      mPrev: () => mockStep(-1), mNext: () => mockStep(1), mFlagged: mFlagged, mFlagFill: mFlagged === 'true' ? 'currentColor' : 'none', mFlagLabel: mFlagged === 'true' ? t.flagged : t.flag,
      mFlag: () => { if (!curMockId) return; if (S.mock.flags[curMockId]) delete S.mock.flags[curMockId]; else S.mock.flags[curMockId] = 1; save(); render(); },
      res: { got: resGot, next: zero }, resRows: resRows, resThr: resThr, resTotal: String(resTotal), resAria: resTotal + ' / 140', resLost: resLost, resCanReview: resReview.length > 0, resNoLost: !!R && !resReview.length && !resLost.length,
      resMissing: R && R.missing && R.missing.some(Boolean) ? t.mockMissing(R.missing.map((m, g) => (m ? (t.tabs.concat(PAIRS.find((x) => x.id === R.pair)[PAGE]))[g] : null)).filter(Boolean)) : '',
      reviewMock: () => { if (resReview.length) begin('mist', resReview.slice(0, 20)); },
      shareScore: String(score), shareGain: gain > 0 ? '+' + gain : ''
    };
    return Object.assign(base, extra);
  }

  /* ---------- start ---------- */
  function afterRender() {
    const root = document.getElementById('app');
    document.documentElement.setAttribute('lang', PAGE);
    const nowTheme = (root.querySelector('.up') || {}).getAttribute ? root.querySelector('.up').getAttribute('data-theme') : 'day';
    document.documentElement.setAttribute('data-theme', nowTheme === 'night' ? 'dark' : 'light');
    const barColor = nowTheme === 'night' ? '#000000' : '#F5F5F7';
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { if (m.getAttribute('content') !== barColor) m.setAttribute('content', barColor); });
    const key = U.screen + '|' + (S.sess ? S.sess.i : '') + '|' + (S.mock ? S.mock.subj + '-' + S.mock.cur[S.mock.subj] : '') + '|' + U.tasksTab + '|' + U.topicOpen;
    if (key !== lastKey) {
      const keepScroll = lastScreen === U.screen && U.screen === 'tasks' && !U.topicOpen;
      if (!keepScroll) window.scrollTo(0, 0);
      lastKey = key; lastScreen = U.screen;
    }
    if (justChecked) {
      justChecked = false;
      const tutor = root.querySelector('.tutor');
      if (tutor && window.innerWidth < 900 && tutor.scrollIntoView) tutor.scrollIntoView({ block: 'nearest' });
    }
    const layer = root.querySelector('.layer');
    document.documentElement.style.overflow = layer ? 'hidden' : '';
    if (layer && !hadLayer) { const f = layer.querySelector('.box button, .box input, .box a'); if (f && f.focus) f.focus({ preventScroll: true }); }
    hadLayer = !!layer;
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (U.navOpen || U.confirm || U.tool) return set({ navOpen: false, confirm: false, tool: null });
      if (U.addOpen) return set({ addOpen: false });
      if (U.delOpen) return set({ delOpen: false });
      if (U.reportOpen) return set({ reportOpen: false });
      return;
    }
    if (U.screen !== 'q' || U.reportOpen || !S.sess || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (/^[1-8]$/.test(e.key) && !U.checked) {
      const qq = BANK.byId[S.sess.ids[S.sess.i]], i = +e.key - 1;
      if (i >= qq.opts.length) return;
      if (Array.isArray(qq.ans)) { const cur = (U.choice || []).slice(), at = cur.indexOf(i); if (at >= 0) cur.splice(at, 1); else cur.push(i); set({ choice: cur }); }
      else set({ choice: i });
    } else if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A') {
      const empty = U.choice === null || (Array.isArray(U.choice) && !U.choice.length);
      if (U.checked) nextQ(); else if (!empty) check();
    }
  });
  /* the theme may change on another page or tab */
  window.addEventListener('storage', (e) => { if (e.key === THEME_KEY) render(); });
  window.addEventListener('pageshow', (e) => { if (e.persisted) render(); });
  window.addEventListener('resize', (() => { let w = window.innerWidth; return () => { const n = window.innerWidth; if ((w < 700) !== (n < 700)) render(); w = n; }; })());

  const start = resolve(window.location.hash.slice(1));
  U.screen = start;
  if (S.mock && mockLeft() <= 0) { U.screen = 'home'; finishMock(); }
  if (U.screen === 'q') { const s0 = S.sess; if (s0 && s0.res.length > s0.i) s0.i = s0.res.length; if (s0 && s0.i >= s0.ids.length) { U.screen = 'home'; } }
  APPRT.mount.after = afterRender;
  const ast = TPL.compile(APP_TEMPLATE);
  const imports = {
    Logo: (p) => BRAND.logo(p),
    PointsMap: (p, ctx) => BRAND.pointsMap(Object.assign({}, p, { on: ctx.on }))
  };
  const rootEl = document.getElementById('app');
  rootEl.textContent = '';
  app = APPRT.mount(rootEl, ast, vals, imports);
  syncHash();
  if (/^(127\.0\.0\.1|localhost)$/.test(window.location.hostname)) window.ENTER_DEBUG = { get S() { return S; }, U: U, BANK: BANK, model: model };
})();
