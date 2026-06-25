"""Tests for digest.py — today's notes and memory."""

import pytest
from datetime import datetime, timedelta
from pathlib import Path

import cortex.db as db
from cortex import digest


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def _insert_note_at(title: str, days_ago: int) -> int:
    """Insert a note with a backdated created_at timestamp."""
    dt = (datetime.utcnow() - timedelta(days=days_ago)).isoformat()
    with db.get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO notes (title, content, source, created_at, updated_at) VALUES (?,?,?,?,?)",
            (title, "içerik", "manual", dt, dt),
        )
        rowid = cur.lastrowid
        conn.execute(
            "INSERT INTO notes_fts(rowid, title, content) VALUES (?,?,?)",
            (rowid, title, "içerik"),
        )
        return rowid


def test_get_today_notes_empty() -> None:
    result = digest.get_today_notes()
    assert result == []


def test_get_today_notes_finds_new_note() -> None:
    db.create_note("Bugünün Notu", "içerik")
    result = digest.get_today_notes()
    assert len(result) == 1
    assert result[0].title == "Bugünün Notu"


def test_get_today_notes_excludes_old() -> None:
    db.create_note("Bugünün Notu", "içerik")
    _insert_note_at("Geçmiş Not", days_ago=5)
    result = digest.get_today_notes()
    assert len(result) == 1


def test_get_memory_notes_empty() -> None:
    result = digest.get_memory_notes(min_days=7)
    assert result == []


def test_get_memory_notes_returns_old() -> None:
    _insert_note_at("Eski Not 1", days_ago=30)
    _insert_note_at("Eski Not 2", days_ago=15)
    db.create_note("Yeni Not", "içerik")  # Today — should be excluded

    result = digest.get_memory_notes(min_days=7, count=5)
    titles = [n.title for n, _ in result]
    assert "Eski Not 1" in titles
    assert "Eski Not 2" in titles
    assert "Yeni Not" not in titles


def test_get_memory_notes_days_ago_accurate() -> None:
    _insert_note_at("Eski Not", days_ago=20)
    result = digest.get_memory_notes(min_days=7, count=1)
    assert len(result) == 1
    _, days_ago = result[0]
    assert 19 <= days_ago <= 21  # Allow 1-day margin for UTC drift


def test_get_memory_notes_count_limit() -> None:
    for i in range(10):
        _insert_note_at(f"Eski {i}", days_ago=30 + i)
    result = digest.get_memory_notes(min_days=7, count=3)
    assert len(result) == 3
