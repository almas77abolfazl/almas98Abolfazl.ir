#!/usr/bin/env bash
set -euo pipefail

# Disaster recovery script to restore PostgreSQL + uploads/ from a backup archive.
# Usage: ./scripts/restore.sh /path/to/backup_YYYY-MM-DD_HHMMSS.tar.gz

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-archive.tar.gz>" >&2
  exit 1
fi

ARCHIVE_PATH="$1"
if [ ! -f "$ARCHIVE_PATH" ]; then
  echo "Backup archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-almas98abolfazl}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[restore] Extracting $ARCHIVE_PATH..."
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/database.sql" ]; then
  echo "Invalid backup archive: database.sql missing" >&2
  exit 1
fi

echo "[restore] Ensuring postgres service is running..."
docker compose up -d --wait postgres

echo "[restore] Restoring PostgreSQL database '$POSTGRES_DB'..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$TMP_DIR/database.sql"

if [ -d "$TMP_DIR/uploads" ]; then
  echo "[restore] Restoring uploads directory..."
  mkdir -p "$PROJECT_DIR/uploads"
  cp -a "$TMP_DIR/uploads/." "$PROJECT_DIR/uploads/"
fi

echo "[restore] Recovery completed successfully."
