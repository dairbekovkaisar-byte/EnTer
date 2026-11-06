// Builds the public pages into web/dist. Run: node web/build/site.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '../src');
const DIST = path.join(HERE, '../dist');
const TPL = require(path.join(SRC, 'tpl.js'));
const BRAND = require(path.join(SRC, 'brand.js'));
const read = (n) => fs.readFileSync(path.join(SRC, n), 'utf8');

// Domain used in canonical links and the sitemap. Change it once the domain is bought.
const SITE_URL = process.env.SITE_URL || 'https://ВАШ-ДОМЕН.kz';

const ctxVm = {};
vm.createContext(ctxVm);
vm.runInContext('var T = {\n' + read('ru.js') + read('kk.js') + '};\n' + read('ru2.js') + read('kk2.js') + 'Object.assign(T.ru, RU2); Object.assign(T.kk, KK2); this.T = T;', ctxVm);
const T = ctxVm.T;

const PAIRS = [['math', 'phys'], ['math', 'inf'], ['math', 'geo'], ['bio', 'chem'], ['bio', 'geo'], ['chem', 'phys'], ['geo', 'lang'], ['lang', 'wh'], ['wh', 'geo'], ['wh', 'law'], ['kl', 'kt'], ['rl', 'rt']];
const REQ = ['hist', 'read', 'mlit'];
const PROF = ['math', 'phys', 'inf', 'geo', 'bio', 'chem', 'lang', 'wh', 'law', 'kl', 'kt', 'rl', 'rt'];
const STATS = { hist: [20, 20, 5], read: [10, 10, 3], mlit: [10, 10, 3] };
const CALC = [{ id: 'hist', max: 20, min: 5 }, { id: 'read', max: 10, min: 3 }, { id: 'mlit', max: 10, min: 3 }, { id: 'p1', max: 50, min: 5 }, { id: 'p2', max: 50, min: 5 }];
const RIBBON = [{ n: 20, cols: 10, cls: 'g-req' }, { n: 10, cols: 5, cls: 'g-req' }, { n: 10, cols: 5, cls: 'g-req' }, { n: 40, cols: 20, cls: '' }, { n: 40, cols: 20, cls: '' }];
const THR = [50, 65, 70, 75, 75];
const D120 = Array.from({ length: 120 }, (_, i) => (i < 54 ? 'a' : ''));
const NAV = ['subjects', 'mock', 'grants', 'pricing', 'parents'];
const ARTICLES = ['ent-format', 'porogi', 'pary'];
const FILES = { home: 'index.html', subjects: 'subjects.html', mock: 'mock.html', grants: 'grants.html', pricing: 'pricing.html', parents: 'parents.html', help: 'help.html', blog: 'articles.html', legal: 'legal.html', notfound: '404.html' };
const LETTERS = ['A', 'B', 'C', 'D'];

const META = {
  ru: {
    home: ['ENTer: подготовка к ЕНТ онлайн', 'Бесплатная диагностика покажет твой балл ЕНТ и темы, которые дадут больше всего. Дальше 7 минут в день, на казахском или русском.'],
    subjects: ['Все предметы ЕНТ и темы | ENTer', 'Три обязательных предмета и пары профильных: сколько заданий, баллов и какой минимум, какие темы внутри.'],
    mock: ['Пробный ЕНТ онлайн: 120 заданий и 4 часа | ENTer', 'Пробный ЕНТ как настоящий: таймер, те же предметы и минимумы, калькулятор и таблицы. Балл по каждому предмету и разбор ошибок.'],
    grants: ['Калькулятор баллов ЕНТ: пороги и минимумы | ENTer', 'Укажи баллы по предметам и посмотри, какие пороги вузов ты проходишь и хватает ли минимума по каждому предмету.'],
    pricing: ['Цены | ENTer', 'Диагностика, карта баллов и одно занятие в день бесплатны. Полный доступ открывает все занятия и пробные ЕНТ.'],
    parents: ['Родителям | ENTer', 'Короткий отчёт о подготовке раз в неделю в WhatsApp: сколько было занятий, какой балл и что отстаёт.'],
    help: ['Помощь | ENTer', 'Ответы на частые вопросы про вход, занятия, пробный ЕНТ и оплату.'],
    blog: ['Статьи об ЕНТ | ENTer', 'Как устроен ЕНТ, сколько баллов нужно и какие пары предметов можно сдавать.'],
    legal: ['Документы | ENTer', 'Условия использования, оплата и возврат, конфиденциальность и реквизиты ENTer.'],
    notfound: ['Страница не найдена | ENTer', 'Такой страницы нет.']
  },
  kk: {
    home: ['ENTer: ҰБТ-ға онлайн дайындық', 'Тегін диагностика ұпайыңды және ең көп балл беретін тақырыптарды көрсетеді. Содан кейін күніне 7 минут, қазақша немесе орысша.'],
    subjects: ['ҰБТ-ның барлық пәні мен тақырыбы | ENTer', 'Үш міндетті пән және бейіндік жұптар: қанша тапсырма, ұпай және шекті балл, ішінде қандай тақырыптар бар.'],
    mock: ['Онлайн сынақ ҰБТ: 120 тапсырма және 4 сағат | ENTer', 'Сынақ ҰБТ нағыз емтихандай: таймер, сол пәндер мен шекті балдар, калькулятор және кестелер. Әр пән бойынша ұпай және қате талдауы.'],
    grants: ['ҰБТ ұпай калькуляторы: шектер мен шекті балдар | ENTer', 'Пәндер бойынша ұпайыңды көрсет те, ЖОО-ның қай шектерінен өтетініңді және әр пәннен шекті балл жететінін қара.'],
    pricing: ['Бағалар | ENTer', 'Диагностика, ұпай картасы және күніне бір сабақ тегін. Толық қолжетімділік барлық сабақ пен сынақ ҰБТ-ны ашады.'],
    parents: ['Ата-анаға | ENTer', 'Дайындық туралы аптасына бір рет WhatsApp-қа қысқа есеп: қанша сабақ болды, ұпай қандай, не артта қалды.'],
    help: ['Көмек | ENTer', 'Кіру, сабақ, сынақ ҰБТ және төлем туралы жиі қойылатын сұрақтарға жауап.'],
    blog: ['ҰБТ туралы мақалалар | ENTer', 'ҰБТ қалай құрылған, қанша ұпай керек және қандай пән жұптарын тапсыруға болады.'],
    legal: ['Құжаттар | ENTer', 'ENTer пайдалану шарттары, төлем және қайтару, құпиялылық және деректемелер.'],
    notfound: ['Бет табылмады | ENTer', 'Мұндай бет жоқ.']
  }
};

const ast = TPL.compile(read('chrome-top.html') + read('home.html') + read('pages.html') + read('pages2.html') + read('chrome-bottom.html'));

function rel(from, to) {
  const dir = path.posix.dirname(from);
  let r = path.posix.relative(dir === '.' ? '' : dir, to);
  return r === '' ? './' : r;
}
const pathOf = (page, lang, art) => {
  const f = page === 'article' ? 'articles/' + ARTICLES[art] + '.html' : FILES[page];
  return (lang === 'kk' ? 'kk/' : '') + f;
};
// Home in Russian is the site root, so its link stays a folder link.
const hrefTo = (from, target) => (target === 'index.html' ? (rel(from, 'x').replace(/x$/, '') || './') : rel(from, target));

function vals(page, lang, art) {
  const t = T[lang];
  const self = pathOf(page, lang, art);
  const other = lang === 'kk' ? 'ru' : 'kk';
  const href = {};
  Object.keys(FILES).forEach((id) => { href[id] = hrefTo(self, pathOf(id, lang)); });
  href.other = hrefTo(self, pathOf(page, other, art));
  href.ruHere = hrefTo(self, pathOf(page, 'ru', art));
  href.kkHere = hrefTo(self, pathOf(page, 'kk', art));
  const app = hrefTo(self, (lang === 'kk' ? 'kk/' : '') + 'app.html');
  href.onb = app + '#start'; href.auth = app + '#login'; href.tasks = app + '#tasks'; href.mockStart = app + '#mock'; href.pay = app + '#pay';
  const legal = (id) => (page === 'legal' ? '#' : href.legal + '#') + id;
  const is = {}; [...Object.keys(FILES), 'article'].forEach((id) => { is[id] = id === page; });
  const nameOf = (id) => t.subj[id].n;
  const pair = PAIRS[0];
  const fmtOf = (id) => t.fmt[STATS[id] ? id : 'prof'];
  const artD = t.blArticles[art || 0];
  const nextI = ((art || 0) + 1) % ARTICLES.length;
  const blockOf = (b) => ({ h: b.h || '', p: b.p || '', ul: b.ul || [], hasUl: !!b.ul, t4: b.t4 || [], hasT4: !!b.t4, t2: b.t2 || [], hasT2: !!b.t2 });
  const links = { onb: href.onb, grants: href.grants, subjects: href.subjects };
  const calc = [12, 7, 5, 21, 9];
  const total = calc.reduce((a, b) => a + b, 0);
  return {
    t, lang, is, href, otherLang: other,
    navItems: NAV.map((id) => ({ label: t.nav[id], href: href[id], cur: id === page ? 'page' : 'false' })),
    menuMore: [{ label: t.blNav, href: href.blog, cur: page === 'blog' ? 'page' : 'false' }, { label: t.hpNav, href: href.help, cur: page === 'help' ? 'page' : 'false' }],
    footCols: [
      { t: t.fc1, links: [{ label: t.nav.subjects, href: href.subjects }, { label: t.nav.mock, href: href.mock }, { label: t.nav.grants, href: href.grants }, { label: t.nav.pricing, href: href.pricing }, { label: t.blNav, href: href.blog }] },
      { t: t.fc2, links: [{ label: t.nav.parents, href: href.parents }, { label: t.fFaq, href: href.help }, { label: t.fWrite, href: (page === 'help' ? '' : href.help) + '#contact' }, { label: t.login, href: href.auth }] },
      { t: t.fc3, links: [{ label: t.fTerms, href: legal('terms') }, { label: t.fPay, href: legal('payment') }, { label: t.fPriv, href: legal('privacy') }, { label: t.fCo, href: legal('company') }] }
    ],
    showEnd: ['help', 'legal', 'notfound'].indexOf(page) < 0,
    endH: page === 'blog' || page === 'article' ? t.endBlog : (t.end[page] || ''),
    seg: { ru: lang === 'ru' ? 'true' : 'false', kk: lang === 'kk' ? 'true' : 'false' },
    map: { got: [7, 5, 12, 21, 9], next: [1, 2, 3, 0, 0], labels: t.labels }, mapAria: '54 / 140', mapLabels: t.labels.join('|'), score: 54,
    no: { a: t.fbNo[0], b: t.fbNo[1], d: t.fbNo[3] },
    opts: t.opts.map((text, i) => ({ text, key: LETTERS[i] })),
    d120: D120,
    pairChips: PAIRS.map((x, i) => ({ label: nameOf(x[0]) + ' + ' + nameOf(x[1]), a: nameOf(x[0]), b: nameOf(x[1]), pressed: i === 0 ? 'true' : 'false' })),
    pairRows: REQ.map((id) => ({ n: nameOf(id), q: STATS[id][0], p: STATS[id][1], m: STATS[id][2], cls: '' })).concat(pair.map((id, i) => ({ n: nameOf(id), q: 40, p: 50, m: 5, cls: 'prof', pi: i }))),
    pairNames: PAIRS.map((x) => nameOf(x[0]) + ' + ' + nameOf(x[1])),
    subjReq: REQ.map((id, i) => ({ id, label: nameOf(id), pressed: i === 0 ? 'true' : 'false' })),
    subjProf: PROF.map((id) => ({ id, label: nameOf(id), pressed: 'false' })),
    panels: REQ.concat(PROF).map((id, i) => {
      const s = STATS[id] || [40, 50, 5];
      return { id, cls: i === 0 ? 'on' : '', name: nameOf(id), q: s[0], p: s[1], m: s[2], types: fmtOf(id), topics: t.subj[id].topics };
    }),
    ribbon: RIBBON.map((g, i) => ({ label: t.mkRibbon[i], n: g.n, cols: g.cols, cls: g.cls, cells: new Array(g.n).fill(0) })),
    calcRows: CALC.map((c, i) => ({ id: 'up-' + c.id, label: t.grLabels[i], v: calc[i], max: c.max, cls: '', minText: t.grMinOk(c.min) })),
    calcI18n: JSON.stringify({ minOk: t.grMinOk('{m}'), minBad: t.grMinBad('{m}', '{n}'), blocked: t.grBlocked('{list}'), thrOk: t.thrOk, thrNo: t.thrNo('{n}'), thrBlock: t.thrBlock, labels: t.grLabels }),
    total,
    thr: t.thrL.map((label, i) => {
      const ok = total >= THR[i];
      return { label, min: THR[i], cls: ok ? 'a-st-ok' : 'a-st-no', state: ok ? '✓ ' + t.thrOk : t.thrNo(THR[i] - total) };
    }),
    terms: ['m1', 'm3', 'exam'].map((id) => ({ label: t.termNames[id], price: t.termPrices[id], pressed: id === 'm3' ? 'true' : 'false' })),
    termPrice: t.termPrices.m3,
    cmpRows: t.cmp.map((r) => ({ n: r.n, aYes: r.a === 1, aNo: r.a === 0, aText: typeof r.a === 'string' ? r.a : '', bYes: r.b === 1, bText: typeof r.b === 'string' ? r.b : '' })),
    helpCats: ['all', 'login', 'learn', 'mock', 'pay', 'parents', 'account'].map((id) => ({ id, label: t.hpCats[id], pressed: id === 'all' ? 'true' : 'false' })),
    helpItems: t.hpItems,
    docs: t.lgDocs.map((d) => ({ id: d.id, t: d.t, blocks: d.blocks.map(blockOf) })),
    articles: t.blArticles.map((a, i) => ({ t: a.t, d: a.d, href: hrefTo(self, pathOf('article', lang, i)) })),
    art: {
      t: artD.t, ctaT: artD.ctaT, ctaL: artD.ctaL, ctaHref: links[artD.ctaK], src: artD.src,
      blocks: artD.blocks.map((b) => blockOf(b.pairs ? { h: b.h, ul: PAIRS.map((x) => nameOf(x[0]) + ' + ' + nameOf(x[1])) } : b)),
      next: { t: t.blArticles[nextI].t, href: hrefTo(self, pathOf('article', lang, nextI)) }
    }
  };
}

const SHOT = { home: 1, wrong: 1, result: 1, tasks: 1, calendar: 1, mockNav: 1, profile: 1, mockRead: 1 };
function imports(page, lang, self) {
  return {
    Logo: (p) => BRAND.logo(p),
    PointsMap: (p) => BRAND.pointsMap(p),
    App: (p) => {
      if (!SHOT[p.preset]) throw new Error('no picture for preset ' + p.preset);
      const wide = p.preset === 'mockRead';
      const src = rel(self, 'assets/shots/' + p.preset + '-' + lang + '.webp');
      return '<img src="' + src + '" alt="" loading="lazy" decoding="async" width="' + (wide ? 1280 : 390) + '" height="' + (wide ? 800 : 844) + '">';
    }
  };
}

function page(pageId, lang, art) {
  const self = pathOf(pageId, lang, art);
  const v = vals(pageId, lang, art);
  const body = TPL.render(ast, Object.assign(Object.create(null), v), { imports: imports(pageId, lang, self) });
  const [title, desc] = pageId === 'article'
    ? [T[lang].blArticles[art].t.replace(/ /g, ' ') + ' | ENTer', T[lang].blArticles[art].d]
    : META[lang][pageId];
  const other = lang === 'kk' ? 'ru' : 'kk';
  const url = (p) => SITE_URL + '/' + p.replace(/index\.html$/, '');
  const asset = (a) => rel(self, 'assets/' + a);
  const head = `<title>${TPL.esc(title)}</title>
<meta name="description" content="${TPL.escA(desc)}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
${pageId === 'notfound' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(self)}">
<link rel="alternate" hreflang="${lang}" href="${url(self)}">
<link rel="alternate" hreflang="${other}" href="${url(pathOf(pageId, other, art))}">
<link rel="alternate" hreflang="x-default" href="${url(pathOf(pageId, 'ru', art))}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="ENTer">
<meta property="og:title" content="${TPL.escA(title)}">
<meta property="og:description" content="${TPL.escA(desc)}">
<meta property="og:url" content="${url(self)}">
<meta property="og:image" content="${SITE_URL}/assets/og-${lang}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${lang === 'kk' ? 'kk_KZ' : 'ru_RU'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${asset('favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${asset('icon-180.png')}">
<link rel="manifest" href="${rel(self, 'manifest.webmanifest')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap">
<link rel="stylesheet" href="${asset('site.css')}">
<script>document.documentElement.className='js'</script>`;
  const scripts = `<script src="${asset('brand.js')}" defer></script>
<script src="${asset('site.js')}" defer></script>`;
  return { self, head, body, scripts, lang };
}

function write(p, s) {
  const f = path.join(DIST, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
}

const pages = [];
for (const lang of ['ru', 'kk']) {
  for (const id of Object.keys(FILES)) pages.push(page(id, lang));
  ARTICLES.forEach((_, i) => pages.push(page('article', lang, i)));
}
// A 404 page is shown at whatever address was mistyped, so its links must not depend on that address.
const REAL_URL = /^https?:\/\//.test(SITE_URL) && !/ВАШ-ДОМЕН/.test(SITE_URL);
const absolutize = (html, self) => {
  if (!REAL_URL) return html;
  const base = new URL(self, SITE_URL + '/');
  return html.replace(/(\s)(href|src)="([^"#][^"]*)"/g, (m, sp, a, u) => (/^([a-z]+:|\/\/)/i.test(u) ? m : sp + a + '="' + new URL(u, base).href + '"'));
};
for (const p of pages) {
  write(p.self, (/(^|\/)404\.html$/.test(p.self) ? (h) => absolutize(h, p.self) : (h) => h)(`<!doctype html>
<html lang="${p.lang}">
<head>
<meta charset="utf-8">
${p.head}
</head>
<body>
${p.body}
${p.scripts}
</body>
</html>
`));
}
// The published artifact's main page is written without its own skeleton.
const rootPage = pages.find((p) => p.self === 'index.html');
fs.mkdirSync(path.join(HERE, '../publish'), { recursive: true });
fs.writeFileSync(path.join(HERE, '../publish/index.html'), rootPage.head.replace(/<title>.*?<\/title>/, '<title>ENTer подготовка к ЕНТ</title>') + '\n' + rootPage.body + '\n' + rootPage.scripts + '\n');

fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.copyFileSync(path.join(SRC, 'css.css'), path.join(DIST, 'assets/site.css'));
fs.copyFileSync(path.join(SRC, 'site.js'), path.join(DIST, 'assets/site.js'));
fs.copyFileSync(path.join(SRC, 'brand.js'), path.join(DIST, 'assets/brand.js'));

const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => !/404\.html$/.test(p.self)).map((p) => `  <url><loc>${SITE_URL}/${p.self.replace(/index\.html$/, '')}</loc><lastmod>${today}</lastmod></url>`).join('\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
const BASE_PATH = REAL_URL ? new URL(SITE_URL + '/').pathname : '/';
write('robots.txt', `User-agent: *\nAllow: ${BASE_PATH}\nDisallow: ${BASE_PATH}app.html\nDisallow: ${BASE_PATH}kk/app.html\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('.nojekyll', ''); // GitHub Pages: serve the files as they are
write('manifest.webmanifest', JSON.stringify({ name: 'ENTer', short_name: 'ENTer', lang: 'ru', start_url: 'app.html', display: 'standalone', background_color: '#000000', theme_color: '#0071E3', icons: [{ src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 1));
console.log('pages', pages.length);
