#!/bin/bash
# Calcula la siguiente version del dataset segun la franja:
#   manana (UTC<12) = major · tarde (UTC<20) = minor · noche = patch
# Uso: next-version.sh [major|minor|patch|auto]
# Con una franja forzada no se comprueba si hubo cambios de datos.
# Imprime la version (vX.Y.Z) o nada si no toca release.
set -euo pipefail

FORCED="${1:-auto}"
LAST=$(git tag -l 'v*' --sort=-v:refname | head -1 || true)

if [ "$FORCED" = "auto" ] && [ -n "$LAST" ] && git diff --quiet "$LAST" HEAD -- data/ index.json; then
  echo "Sin cambios de datos desde $LAST: no se crea release" >&2
  exit 0
fi

if [ -z "$LAST" ]; then
  echo "v1.0.0"
  exit 0
fi

V="${LAST#v}"
MAJOR="${V%%.*}"
REST="${V#*.}"
MINOR="${REST%%.*}"
PATCH="${REST#*.}"

if [ "$FORCED" = "auto" ]; then
  HOUR=$(date -u +%H)
  if [ "$HOUR" -lt 12 ]; then FORCED=major; elif [ "$HOUR" -lt 20 ]; then FORCED=minor; else FORCED=patch; fi
fi

case "$FORCED" in
  major) echo "v$((MAJOR + 1)).0.0" ;;
  minor) echo "v$MAJOR.$((MINOR + 1)).0" ;;
  patch) echo "v$MAJOR.$MINOR.$((PATCH + 1))" ;;
  *) echo "franja desconocida: $FORCED" >&2; exit 1 ;;
esac
