#!/bin/bash
# Worker del dataset publico: exporta SQLite -> repo -> push.
# Cron (root): 06:17 y 18:17 UTC. Log: export.log junto al clon.
set -euo pipefail

LOCK=/tmp/radar-dataset-export.lock
exec 9>"$LOCK"
flock -n 9 || { echo "$(date -u +%FT%TZ) otra ejecucion en curso, se sale"; exit 0; }

CLONE=/opt/radar-huggingface-dataset
VOLUME=/var/lib/docker/volumes/kbfm1drm9fqjq0i0rb3tts9q_hf-model-data/_data
BACKEND=$(docker ps --format '{{.Names}}' | grep '^backend-kbfm' | head -1)

echo "$(date -u +%FT%TZ) inicio (backend: $BACKEND)"

# 1. Export dentro del contenedor (tiene el codigo y la BD) hacia el volumen
docker exec "$BACKEND" node /app/dist/src/lib/export-dataset.js \
  --db /app/data/models.db --out /app/data/export

# 2. Sincronizar al clon (solo data/ e index.json; no tocar docs/CI/.git)
sudo -n rsync -a --delete "$VOLUME/export/data/" "$CLONE/data/"
sudo -n cp "$VOLUME/export/index.json" "$CLONE/index.json"
sudo -n chown -R 686f6c61:686f6c61 "$CLONE/data" "$CLONE/index.json"

# 3. Commit estructurado + pull --rebase + push si hay cambios
cd "$CLONE"
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/radar-dataset-deploy -o StrictHostKeyChecking=accept-new"
git add -A
if git diff --cached --quiet; then
  git pull -q --rebase origin main || true
  echo "$(date -u +%FT%TZ) sin cambios"
  exit 0
fi
A=$(git diff --cached --name-status | grep -c '^A' || true)
M=$(git diff --cached --name-status | grep -c '^M' || true)
D=$(git diff --cached --name-status | grep -c '^D' || true)
git commit -q -m "data: +$((A/2)) ~$((M/2)) -$((D/2)) ($(date -u +%Y-%m-%d' '%H:%M) UTC)"
git pull -q --rebase --autostash origin main
git push -q origin main
echo "$(date -u +%FT%TZ) push OK (+$((A/2)) ~$((M/2)) -$((D/2)))"
