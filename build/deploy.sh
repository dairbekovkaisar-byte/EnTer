#!/bin/sh
# Пересобирает сайт и выкладывает папку dist на GitHub Pages (ветка gh-pages).
# Запуск из папки проекта: sh build/deploy.sh "Что изменилось"
set -e
cd "$(dirname "$0")/.."
SITE_URL="${SITE_URL:-https://dairbekovkaisar-byte.github.io/EnTer}"
export SITE_URL
MSG="${1:-Обновить сайт}"

node build/site.mjs
node build/app.mjs

git add -A
git commit -m "$MSG" || echo "В исходниках изменений нет"
git push origin main

# dist ложится в gh-pages новым коммитом поверх уже опубликованного сайта
git fetch origin +refs/heads/gh-pages:refs/remotes/origin/gh-pages
TMP="$(mktemp -d)"
git worktree add --detach "$TMP" origin/gh-pages
find "$TMP" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$TMP"/
git -C "$TMP" add -A
git -C "$TMP" commit -m "$MSG" || echo "Сайт не изменился"
git -C "$TMP" push origin HEAD:gh-pages
git worktree remove --force "$TMP"
echo "Готово: сайт обновится через минуту-две, $SITE_URL/"
