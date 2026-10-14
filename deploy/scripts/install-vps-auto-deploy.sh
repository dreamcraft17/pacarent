#!/usr/bin/env bash
# Sekali di VPS: setiap `git pull` → auto build + deploy API (jika ada file API baru).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

chmod +x deploy/scripts/vps-deploy-api.sh
chmod +x deploy/scripts/run-api.sh 2>/dev/null || true
chmod +x deploy/git-hooks/post-merge

git config core.hooksPath deploy/git-hooks

cat <<EOF

╔══════════════════════════════════════════════════════════════╗
║  Auto-deploy VPS AKTIF                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Sekarang cukup:                                             ║
║    cd ~/pacarent && git pull                                 ║
║                                                              ║
║  Kalau commit baru mengubah folder api/ atau run-api.sh:     ║
║    → dotnet publish → /opt/pacarent/api → pm2 restart       ║
║  Kalau pull cuma docs/web saja: build dilewati.              ║
║                                                              ║
║  Pakai merge pull (default). Hindari: git pull --rebase      ║
║  Deploy paksa: ./deploy/scripts/vps-deploy-api.sh --force    ║
╚══════════════════════════════════════════════════════════════╝

EOF

if [[ ! -d /opt/pacarent/api ]]; then
  echo "CATATAN: /opt/pacarent/api belum ada — hook deploy baru jalan setelah API terpasang."
fi

if [[ ! -w /opt/pacarent/api ]] 2>/dev/null; then
  echo "TIP: agar pull tanpa sudo password → sudo chown -R \$(whoami):\$(whoami) /opt/pacarent/api"
fi
