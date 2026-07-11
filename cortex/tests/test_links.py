"""Tests for note_links: [[link]] parsing, backlinks, orphans, broken links."""

from pathlib import Path

import pytest

import cortex.db as db


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB to a temp file for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def test_link_resolves_to_existing_note() -> None:
    target_id = db.create_note("Evrim Teorisi", "içerik")
    source_id = db.create_note("Notlarım", "Bugün [[Evrim Teorisi]] okudum.")

    links = db.get_outgoing_links(source_id)
    assert len(links) == 1
    assert links[0].target_id == target_id
    assert links[0].is_broken is False


def test_link_with_obsidian_alias_and_heading() -> None:
    target_id = db.create_note("Evrim Teorisi", "içerik")
    source_id = db.create_note(
        "Notlarım", "Bkz: [[Evrim Teorisi|evrim üzerine]] okudum."
    )
    other_id = db.create_note("Notlarım 2", "Bkz: [[Evrim Teorisi#Giriş]] bölümü.")

    for sid in (source_id, other_id):
        links = db.get_outgoing_links(sid)
        assert len(links) == 1
        assert links[0].target_id == target_id
        assert links[0].is_broken is False


def test_link_case_insensitive() -> None:
    target_id = db.create_note("Python Rehberi", "içerik")
    source_id = db.create_note("Notlarım", "[[python rehberi]] güzeldi.")

    links = db.get_outgoing_links(source_id)
    assert links[0].target_id == target_id


def test_link_broken_when_target_missing() -> None:
    source_id = db.create_note("Notlarım", "[[Olmayan Not]] hakkında.")
    links = db.get_outgoing_links(source_id)
    assert len(links) == 1
    assert links[0].target_id is None
    assert links[0].is_broken is True
    assert links[0].target_title == "Olmayan Not"


def test_backlinks_reported_on_target() -> None:
    target_id = db.create_note("Hedef Not", "içerik")
    source_id = db.create_note("Kaynak Not", "Bkz: [[Hedef Not]]")

    backlinks = db.get_backlinks(target_id)
    assert len(backlinks) == 1
    assert backlinks[0].source_id == source_id
    assert backlinks[0].source_title == "Kaynak Not"


def test_delete_target_marks_link_broken() -> None:
    target_id = db.create_note("Silinecek Not", "içerik")
    source_id = db.create_note("Kaynak Not", "[[Silinecek Not]]")

    db.delete_note(target_id)

    links = db.get_outgoing_links(source_id)
    assert links[0].is_broken is True
    assert links[0].target_id is None
    assert links[0].target_title == "Silinecek Not"


def test_orphan_notes_detected() -> None:
    linked_target = db.create_note("Bağlı Not", "içerik")
    db.create_note("Diğer Not", "[[Bağlı Not]]")
    orphan_id = db.create_note("Yalnız Not", "hiçbir yere bağlı değil")

    orphans = db.get_orphan_notes()
    orphan_ids = [n.id for n in orphans]
    assert orphan_id in orphan_ids
    assert linked_target not in orphan_ids


def test_sync_links_removes_stale_links_on_update() -> None:
    target_id = db.create_note("Eski Hedef", "içerik")
    source_id = db.create_note("Kaynak", "[[Eski Hedef]]")
    assert len(db.get_outgoing_links(source_id)) == 1

    db.update_note(source_id, "Kaynak", "artık hiçbir yere link vermiyor")
    assert db.get_outgoing_links(source_id) == []


def test_get_all_links_excludes_broken() -> None:
    target_id = db.create_note("Hedef", "içerik")
    source_id = db.create_note("Kaynak", "[[Hedef]] ve [[Yok Böyle Bir Not]]")

    links = db.get_all_links()
    assert links == [(source_id, target_id)]
