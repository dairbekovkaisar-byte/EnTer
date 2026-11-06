// Table for the teacher: every hand-written task plus one example of each template.
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '../src/app/'); const c = {}; vm.createContext(c);
for (const f of ['q-hist-read.js', 'q-hist2.js', 'q-gen.js', 'q-gen2.js', 'bank.js', 'strings.js', 'strings2.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8'), c, { filename: f });
const B = vm.runInContext('BANK', c), TOPICS = vm.runInContext('TOPICS', c);
const SUBJ = { hist: 'История Казахстана', read: 'Грамотность чтения', mlit: 'Математическая грамотность', math: 'Математика', phys: 'Физика' };
const FMT = { single: 'один ответ', context: 'контекст', match: 'соответствие', multi: 'несколько ответов' };
const L = (x, i) => (Array.isArray(x) ? x[i] : (x == null ? '' : x));
const right = (q, i) => (Array.isArray(q.ans) ? q.ans.map((a) => L(q.opts[a], i)).join(' | ') : L(q.opts[q.ans], i));
const all = (q, i) => q.opts.map((o) => L(o, i)).join(' | ');
const tmpl = {}; B.all.forEach((q) => { if (/^[lmp]/.test(q.id)) { const k = q.id.split('-')[0]; tmpl[k] = (tmpl[k] || 0) + 1; } });
const seen = {}, rows = [['Номер', 'Предмет', 'Тема', 'Формат', 'Как сделано', 'Вариантов', 'Текст к заданию (рус)', 'Вопрос (рус)', 'Варианты (рус)', 'Верный ответ (рус)', 'Объяснение (рус)', 'Текст к заданию (каз)', 'Вопрос (каз)', 'Варианты (каз)', 'Верный ответ (каз)', 'Объяснение (каз)', 'Статус', 'Комментарий учителя']];
let hand = 0;
B.all.forEach((q) => {
  const gen = /^[lmp]/.test(q.id), k = q.id.split('-')[0];
  if (gen) { if (seen[k]) return; seen[k] = 1; } else hand++;
  const ctx = (i) => L(q.passage || q.list, i);
  rows.push([gen ? k : q.id, SUBJ[q.s], TOPICS[q.s][q.tp].ru, FMT[q.type] || FMT.single, gen ? 'шаблон: цифры меняются, ответ считает код' : 'написано вручную', gen ? tmpl[k] : 1, ctx(0), L(q.text, 0), all(q, 0), right(q, 0), L(q.why, 0), ctx(1), L(q.text, 1), all(q, 1), right(q, 1), L(q.why, 1), 'не проверено', '']);
});
const esc = (v) => { const s = String(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const out = process.argv[2] || path.join(__dirname, '../bank-review.csv');
fs.writeFileSync(out, '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n') + '\r\n');
const by = {}; B.all.forEach((q) => { by[q.s] = (by[q.s] || 0) + 1; });
console.log(JSON.stringify({ total: B.all.length, hand: hand, templates: Object.keys(tmpl).length, generated: B.all.length - hand, rows: rows.length - 1, by: by }));
