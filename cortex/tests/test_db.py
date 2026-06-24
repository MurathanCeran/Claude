"""Tests for db.py CRUD operations."""

import pytest
from pathlib import Path

import cortex.db as db


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB to a temp file for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def test_create_and_get_note() -> None:
    note_id = db.create_note("Test Başlık", "Test içerik", source="manual")
    note = db.get_note(note_id)

    assert note is not None
    assert note.id == note_id
    assert note.title == "Test Başlık"
    assert note.content == "Test içerik"
    assert note.source == "manual"


def test_list_notes_empty() -> None:
    notes = db.list_notes()
    assert notes == []


def test_list_notes_order() -> None:
    id1 = db.create_note("Birinci", "içerik 1")
    id2 = db.create_note("İkinci", "içerik 2")
    notes = db.list_notes(limit=10)
    assert len(notes) == 2
    assert notes[0].id == id2  # Most recent first


def test_delete_note() -> None:
    note_id = db.create_note("Silinecek", "içerik")
    assert db.get_note(note_id) is not None
    deleted = db.delete_note(note_id)
    assert deleted is True
    assert db.get_note(note_id) is None


def test_delete_nonexistent_note() -> None:
    assert db.delete_note(99999) is False


def test_attach_and_get_tags() -> None:
    note_id = db.create_note("Etiketli Not", "içerik")
    db.attach_tags(note_id, ["python", "AI", "  "])  # Empty string should be skipped
    note = db.get_note(note_id)

    assert note is not None
    tag_names = note.tag_names
    assert "python" in tag_names
    assert "ai" in tag_names  # lowercased
    assert "" not in tag_names


def test_attach_tags_idempotent() -> None:
    note_id = db.create_note("Not", "içerik")
    db.attach_tags(note_id, ["python"])
    db.attach_tags(note_id, ["python"])  # Should not raise or duplicate
    note = db.get_note(note_id)
    assert note is not None
    assert note.tag_names.count("python") == 1


def test_get_or_create_tag_deduplication() -> None:
    id1 = db.get_or_create_tag("python")
    id2 = db.get_or_create_tag("python")
    assert id1 == id2


def test_fts_search() -> None:
    db.create_note("Python Rehberi", "Python programlama dili hakkında notlar")
    db.create_note("JavaScript Temelleri", "JS ve web geliştirme")

    hits = db.fts_search("Python")
    ids = [h[0] for h in hits]
    assert len(ids) >= 1


def test_db_stats() -> None:
    db.create_note("A", "içerik a")
    db.create_note("B", "içerik b", source="import")
    db.attach_tags(1, ["tag1"])

    stats = db.db_stats()
    assert stats["notes"] == 2
    assert stats["tags"] >= 1
    assert "manual" in stats["sources"]
    assert "import" in stats["sources"]
