#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${PACARRENT_ENV_FILE:-/etc/pacarrent/api.env}"
API_DIR="${PACARRENT_API_DIR:-/opt/pacarent/api}"

if [[ ! -f "$API_DIR/PacaRent.Api.dll" ]]; then
  echo "Missing $API_DIR/PacaRent.Api.dll" >&2
  exit 1
fi

if [[ -r "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "Cannot read env file: $ENV_FILE (fix permissions for PM2 user)" >&2
  exit 1
fi

cd "$API_DIR"
exec /usr/bin/dotnet "$API_DIR/PacaRent.Api.dll"
