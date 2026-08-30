#!/usr/bin/env bash
# Dump Postgres from the running compose stack. Keep 14 daily files.
# Install cron:  bash deploy/oracle/backup-postgres.sh --install
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/aureherb-backups}"
mkdir -p "$BACKUP_DIR"

if [[ "${1:-}" == "--install" ]]; then
  CRON="15 3 * * * $ROOT/backup-postgres.sh >>$BACKUP_DIR/backup.log 2>&1"
  (crontab -l 2>/dev/null | grep -v backup-postgres.sh; echo "$CRON") | crontab -
  echo "Installed daily 03:15 backup cron → $BACKUP_DIR"
  exit 0
fi

cd "$ROOT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/medusa-$STAMP.dump"

docker compose exec -T postgres pg_dump -U medusa -d medusa-aureherb -Fc >"$OUT"
gzip -f "$OUT"
echo "Wrote $OUT.gz"

# Keep 14 days
find "$BACKUP_DIR" -name 'medusa-*.dump.gz' -mtime +14 -delete
