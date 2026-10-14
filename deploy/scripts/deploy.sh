#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PUBLISH_DIR="${PUBLISH_DIR:-$ROOT/publish}"

export PATH="${HOME}/.dotnet:${PATH}"

echo "==> Build API"
dotnet publish "$ROOT/api/PacaRent.Api/PacaRent.Api.csproj" -c Release -o "$PUBLISH_DIR/api"

echo "==> Build Web"
cd "$ROOT/web"
npm ci
npm run build
mkdir -p "$PUBLISH_DIR/web"
cp -R dist/* "$PUBLISH_DIR/web/"

echo "==> Artefak siap di $PUBLISH_DIR"
echo "Unggah ke VPS, jalankan migrasi, lalu: sudo systemctl restart pacarrent-api && sudo systemctl reload nginx"
