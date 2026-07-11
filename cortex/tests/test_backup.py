"""Tests for backup.py: create, list, restore, and pruning."""

from pathlib import Path

import pytest

import cortex.backup as backup
import cortex.db as db


@pytest.fixture(autouse=True)
def tmp_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect both DB and backup dir to temp locations for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "data" / "test.db")
    monkeypatch.setattr(backup, "BACKUP_DIR", tmp_path / "backups")
    db.init_db()


def test_create_backup_copies_db(tmp_path: Path) -> None:
    db.create_note("Not", "içerik")
    dest = backup.create_backup()

    assert dest.exists()
    assert dest.parent == backup.BACKUP_DIR


def test_list_backups_empty() -> None:
    assert backup.list_backups() == []


def test_list_backups_newest_first() -> None:
    first = backup.create_backup()
    second = backup._next_backup_path()  # would collide same day, force distinct name
    second.write_bytes(b"fake")

    backups = backup.list_backups()
    assert len(backups) == 2
    assert backups[0].stat().st_mtime >= backups[1].stat().st_mtime


def test_restore_backup_overwrites_db() -> None:
    db.create_note("Orijinal", "içerik")
    snapshot = backup.create_backup()

    db.create_note("Sonradan Eklenen", "içerik")
    assert len(db.list_notes()) == 2

    ok = backup.restore_backup(snapshot.name)
    assert ok is True
    assert len(db.list_notes()) == 1
    assert db.list_notes()[0].title == "Orijinal"


def test_restore_missing_backup_fails() -> None:
    ok = backup.restore_backup("does-not-exist.db")
    assert ok is False


def test_prune_keeps_only_max_backups() -> None:
    for i in range(15):
        (backup.BACKUP_DIR).mkdir(parents=True, exist_ok=True)
        fake = backup.BACKUP_DIR / f"cortex_2026-01-{i:02d}.db"
        fake.write_bytes(b"x")

    backup._prune_old_backups()
    assert len(backup.list_backups()) == backup._MAX_BACKUPS
