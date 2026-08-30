#!/usr/bin/env bash
# Restore a Railway (or other) Postgres dump into the Oracle compose Postgres.
# Usage:
#   bash deploy/oracle/restore-from-dump.sh /path/to/railway.dump
#   bash deploy/oracle/restore-from-dump.sh /path/to/railway.sql
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump.dump|dump.sql|dump.sql.gz>"
  exit 1
fi

DUMP="$1"
if [[ ! -f "$DUMP" ]]; then
  echo "File not found: $DUMP"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing $ROOT/.env — copy env.example and set POSTGRES_PASSWORD first."
  exit 1
fi

echo "==> Starting Postgres only"
docker compose up -d postgres
docker compose exec postgres sh -c 'until pg_isready -U medusa -d medusa-aureherb; do sleep 2; done'

echo "==> Restoring $DUMP (this replaces objects in medusa-aureherb)"
# Drop/recreate public schema so restore is clean
docker compose exec -T postgres psql -U medusa -d medusa-aureherb -c \
  "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO medusa; GRANT ALL ON SCHEMA public TO public;"

restore_sql() {
  docker compose exec -T postgres psql -U medusa -d medusa-aureherb
}

case "$DUMP" in
  *.sql.gz)
    gzip -dc "$DUMP" | restore_sql
    ;;
  *.sql)
    restore_sql <"$DUMP"
    ;;
  *)
    docker compose exec -T postgres pg_restore -U medusa -d medusa-aureherb --no-owner --role=medusa <"$DUMP"
    ;;
esac

echo "Restore finished. Start the stack with:  docker compose up -d --build"
