// Builds the working app: dist/app.html, dist/kk/app.html, assets/app.css, assets/app.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const DIST = path.join(ROOT, 'dist');

execFileSync('python3', [path.join(HERE, 'patch-tpl.py'), ROOT], { stdio: 'inherit' });
const read = (p) => fs.readFileSync(p, 'utf8');
const tpl = read(path.join(APP, 'app.final.html'));
const js = [
  read(path.join(SRC, 'tpl.js')), read(path.join(SRC, 'brand.js')),
  read(path.join(APP, 'q-hist-read.js')), read(path.join(APP, 'q-hist2.js')), read(path.join(APP, 'q-gen.js')), read(path.join(APP, 'q-gen2.js')), read(path.join(APP, 'bank.js')),
  read(path.join(APP, 'strings.js')), read(path.join(APP, 'strings2.js')), read(path.join(APP, 'tools.js')), read(path.join(APP, 'runtime.js')),
  'const APP_TEMPLATE = ' + JSON.stringify(tpl) + ';',
  read(path.join(APP, 'engine.js'))
].join('\n');
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets/app.js'), js);
fs.writeFileSync(path.join(DIST, 'assets/app.css'), read(path.join(APP, 'app.css')) + '\n' + read(path.join(APP, 'app-extra.css')));

const shell = (lang, base) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${lang === 'kk' ? 'ENTer: қолданба' : 'ENTer: приложение'}</title>
<meta name="description" content="${lang === 'kk' ? 'ҰБТ-ға дайындық: диагностика, ұпай картасы, күнделікті сабақ және сынақ ҰБТ.' : 'Подготовка к ЕНТ: диагностика, карта баллов, занятия и пробный ЕНТ.'}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F5F7">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${base}assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${base}assets/icon-180.png">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap">
<link rel="stylesheet" href="${base}assets/app.css">
<style>
:root{--page:#F5F5F7;--page-text:#1D1D1F;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--page:#000000;--page-text:#F5F5F7;color-scheme:dark}}
:root[data-theme="dark"]{--page:#000000;--page-text:#F5F5F7;color-scheme:dark}
html,body{background:var(--page);color:var(--page-text)}
.nojs{max-width:520px;margin:48px auto;padding:0 16px;font:400 17px/1.47 -apple-system,BlinkMacSystemFont,Inter,"Segoe UI",Roboto,Arial,sans-serif}
</style>
</head>
<body>
<div id="app"></div>
<noscript><p class="nojs">${lang === 'kk' ? 'Қолданба JavaScript-сіз жұмыс істемейді. Браузерде оны қосып, бетті жаңарт.' : 'Приложение не работает без JavaScript. Включи его в браузере и обнови страницу.'}</p></noscript>
<script>window.ENTER_LANG=${JSON.stringify(lang)}</script>
<script src="${base}assets/app.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(DIST, 'app.html'), shell('ru', ''));
fs.mkdirSync(path.join(DIST, 'kk'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'kk/app.html'), shell('kk', '../'));
console.log('app built', Math.round(js.length / 1024) + ' KB js');
