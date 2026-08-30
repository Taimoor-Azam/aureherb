#!/usr/bin/env bash
# Dump production Postgres from Railway (or any Postgres URL) onto this machine.
# Usage:
#   DATABASE_URL='postgres://...' bash deploy/oracle/dump-railway.sh
#   bash deploy/oracle/dump-railway.sh postgres://user:pass@host:5432/railway
set -euo pipefail

URL="${1:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "Set DATABASE_URL or pass the connection string as argv[1]."
  echo "Railway: Project → Postgres → Variables → DATABASE_URL"
  exit 1
fi

OUT="${2:-./railway-$(date -u +%Y%m%dT%H%M%SZ).dump}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Installing postgresql-client..."
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-client
fi

echo "==> Dumping to $OUT"
pg_dump -Fc "$URL" -f "$OUT"
echo "Done. Restore on the VM with:  bash deploy/oracle/restore-from-dump.sh $OUT"
