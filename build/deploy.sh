#!/bin/sh
# Пересобирает сайт и выкладывает папку dist на GitHub Pages (ветка gh-pages).
# Запуск из папки проекта: sh build/deploy.sh "Что изменилось"
set -e
cd "$(dirname "$0")/.."
SITE_URL="${SITE_URL:-https://dairbekovkaisar-byte.github.io/enter}"
export SITE_URL
node build/site.mjs
node build/app.mjs
git add -A
git commit -m "${1:-Обновить сайт}" || echo "Изменений нет"
git push origin main
git subtree push --prefix dist origin gh-pages
