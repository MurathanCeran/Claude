"""SQLite database backup and restore."""

from __future__ import annotations

import shutil
from datetime import date
from pathlib import Path

from cortex import db
from cortex.display import print_error

BACKUP_DIR = Path(__file__).parent.parent / "backups"
_MAX_BACKUPS = 10


def create_backup() -> Path:
    """Copy the live DB into backups/cortex_YYYY-MM-DD.db. Returns the new path."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    dest = _next_backup_path()
    shutil.copy2(db.get_db_path(), dest)
    _prune_old_backups()
    return dest


def _next_backup_path() -> Path:
    stamp = date.today().isoformat()
    dest = BACKUP_DIR / f"cortex_{stamp}.db"
    counter = 2
    while dest.exists():
        dest = BACKUP_DIR / f"cortex_{stamp}_{counter}.db"
        counter += 1
    return dest


def list_backups() -> list[Path]:
    """Return backup files, newest first."""
    if not BACKUP_DIR.exists():
        return []
    return sorted(
        BACKUP_DIR.glob("cortex_*.db"), key=lambda p: p.stat().st_mtime, reverse=True
    )


def restore_backup(backup_name: str) -> bool:
    """Restore the DB from a backup. Backs up the current DB first for safety."""
    backup_path = BACKUP_DIR / backup_name
    if not backup_path.exists():
        backup_path = Path(backup_name)
    if not backup_path.exists():
        print_error(f"Yedek dosyası bulunamadı: {backup_name}")
        return False

    create_backup()
    shutil.copy2(backup_path, db.get_db_path())
    return True


def _prune_old_backups() -> None:
    """Keep only the _MAX_BACKUPS most recent backups, deleting the rest."""
    for old in list_backups()[_MAX_BACKUPS:]:
        old.unlink()
