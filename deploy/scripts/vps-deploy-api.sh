#!/usr/bin/env bash
# Publish API, sync ke /opt/pacarent/api, restart PM2. Dipanggil otomatis setelah `git pull` (hook post-merge).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PUBLISH_DIR="$ROOT/publish/api"
OPT_DIR="/opt/pacarent/api"
PM2_NAME="${PACARRENT_PM2_NAME:-pacarrent-api}"
FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1
[[ "${PACARRENT_FORCE_DEPLOY:-0}" == "1" ]] && FORCE=1

log() { echo "[pacarrent-deploy] $*"; }

if [[ ! -d "$OPT_DIR" ]]; then
  log "Lewati: $OPT_DIR belum ada (bukan VPS production?)."
  exit 0
fi

if [[ "$FORCE" != "1" ]]; then
  PREV="$(git -C "$ROOT" rev-parse -q --verify HEAD@{1} 2>/dev/null || true)"
  if [[ -n "$PREV" ]]; then
    if git -C "$ROOT" diff --quiet "$PREV" HEAD -- api/ deploy/scripts/run-api.sh; then
      log "Pull OK — tidak ada perubahan API/deploy, lewati build."
      exit 0
    fi
  fi
fi

export PATH="${HOME}/.dotnet:${PATH}"
if ! command -v dotnet >/dev/null; then
  log "ERROR: dotnet tidak ditemukan. Pasang .NET 8 SDK/runtime."
  exit 1
fi

log "Ada update API — publish Release → $PUBLISH_DIR"
dotnet publish "$ROOT/api/PacaRent.Api/PacaRent.Api.csproj" -c Release -o "$PUBLISH_DIR"

log "Sync → $OPT_DIR"
if [[ -w "$OPT_DIR" ]]; then
  cp -r "$PUBLISH_DIR/"* "$OPT_DIR/"
else
  sudo cp -r "$PUBLISH_DIR/"* "$OPT_DIR/"
fi

if command -v pm2 >/dev/null; then
  log "PM2 restart $PM2_NAME"
  pm2 restart "$PM2_NAME" --update-env || pm2 start "$ROOT/deploy/scripts/run-api.sh" --name "$PM2_NAME" --interpreter bash
  pm2 save >/dev/null 2>&1 || true
else
  log "WARN: pm2 tidak ada — lewati restart."
fi

sleep 2
if curl -sf "http://127.0.0.1:5000/health" >/dev/null; then
  log "Selesai — health OK (127.0.0.1:5000)"
else
  log "WARN: health check gagal — cek: pm2 logs $PM2_NAME --lines 40"
  exit 1
fi
