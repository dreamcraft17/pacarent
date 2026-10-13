#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${PACARRENT_ENV_FILE:-/etc/pacarrent/api.env}"
API_DIR="${PACARRENT_API_DIR:-/opt/pacarent/api}"

if [[ ! -f "$API_DIR/PacaRent.Api.dll" ]]; then
  echo "Missing $API_DIR/PacaRent.Api.dll" >&2
  exit 1
fi

if [[ ! -r "$ENV_FILE" ]]; then
  echo "Cannot read env file: $ENV_FILE (fix permissions for PM2 user)" >&2
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%$'\r'}"
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$key" || "$line" != *"="* ]] && continue
  export "$key=$val"
done < "$ENV_FILE"

cd "$API_DIR"
exec /usr/bin/dotnet "$API_DIR/PacaRent.Api.dll"
