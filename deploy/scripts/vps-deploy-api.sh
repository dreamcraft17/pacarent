#!/usr/bin/env bash
# Publish API, sync ke /opt/pacarent/api, restart service. Dipanggil otomatis setelah `git pull` (hook post-merge).
#
# The real production process is the systemd unit (pacarrent-api.service) —
# PM2 is only a fallback for environments that don't run it under systemd.
# Restarting PM2 when systemd already owns the port just spawns a duplicate
# that crash-loops forever trying to bind a port systemd already holds,
# while the systemd-managed process (the one actually serving traffic)
# never sees the new build. Always prefer systemd when the unit exists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PUBLISH_DIR="$ROOT/publish/api"
OPT_DIR="/opt/pacarent/api"
SYSTEMD_UNIT="${PACARRENT_SYSTEMD_UNIT:-pacarrent-api.service}"
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

if command -v systemctl >/dev/null && systemctl list-unit-files "$SYSTEMD_UNIT" >/dev/null 2>&1 && \
    systemctl list-unit-files "$SYSTEMD_UNIT" | grep -q "$SYSTEMD_UNIT"; then
  log "systemd restart $SYSTEMD_UNIT"
  sudo systemctl restart "$SYSTEMD_UNIT"
  if command -v pm2 >/dev/null && pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    log "WARN: PM2 juga punya entry '$PM2_NAME' — itu duplikat dari $SYSTEMD_UNIT, menghapusnya."
    pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true
    pm2 save >/dev/null 2>&1 || true
  fi
elif command -v pm2 >/dev/null; then
  log "PM2 restart $PM2_NAME (tidak ada unit systemd $SYSTEMD_UNIT di host ini)"
  pm2 restart "$PM2_NAME" --update-env || pm2 start "$ROOT/deploy/scripts/run-api.sh" --name "$PM2_NAME" --interpreter bash
  pm2 save >/dev/null 2>&1 || true
else
  log "WARN: systemd unit dan pm2 sama-sama tidak ada — lewati restart."
fi

sleep 2
if curl -sf "http://127.0.0.1:5000/health" >/dev/null; then
  log "Selesai — health OK (127.0.0.1:5000)"
else
  log "WARN: health check gagal — cek: sudo journalctl -u $SYSTEMD_UNIT -n 40 --no-pager (atau: pm2 logs $PM2_NAME --lines 40)"
  exit 1
fi
