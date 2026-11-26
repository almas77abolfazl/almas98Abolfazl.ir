#!/usr/bin/env bash
set -euo pipefail

# Automated PostgreSQL + uploads/ backup script with 7-backup rotation.
# Usage: ./scripts/backup.sh [backup_dir]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${1:-${BACKUP_DIR:-/var/backups/almas98abolfazl}}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"
TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
ARCHIVE_NAME="backup_${TIMESTAMP}.tar.gz"

cd "$PROJECT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-almas98abolfazl}"

mkdir -p "$BACKUP_DIR"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[backup] Dumping PostgreSQL database '$POSTGRES_DB'..."
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists > "$TMP_DIR/database.sql"

echo "[backup] Archiving uploads directory..."
if [ -d "$PROJECT_DIR/uploads" ]; then
  cp -a "$PROJECT_DIR/uploads" "$TMP_DIR/uploads"
else
  mkdir -p "$TMP_DIR/uploads"
fi

tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$TMP_DIR" database.sql uploads
echo "[backup] Created $BACKUP_DIR/$ARCHIVE_NAME"

# Keep only the newest $RETENTION_COUNT backups.
cd "$BACKUP_DIR"
ls -1t backup_*.tar.gz 2>/dev/null | tail -n +"$((RETENTION_COUNT + 1))" | xargs -r rm -f
echo "[backup] Rotation complete (retaining last $RETENTION_COUNT backups)."
