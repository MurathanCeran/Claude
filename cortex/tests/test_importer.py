"""Tests for importer.py."""

import pytest
from pathlib import Path

import cortex.db as db
from cortex.importer import _parse_markdown, import_path


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def test_parse_markdown_h1_title() -> None:
    raw = "# Benim Notum\n\nBu bir içeriktir."
    title, content, tags = _parse_markdown(raw, "fallback")
    assert title == "Benim Notum"
    assert "Bu bir içeriktir" in content
    assert tags == []


def test_parse_markdown_fallback_title() -> None:
    raw = "Başlık yok, sadece içerik."
    title, _, _ = _parse_markdown(raw, "my-note-file")
    assert title == "My Note File"


def test_parse_markdown_frontmatter_tags_inline() -> None:
    raw = "---\ntags: [python, ai, veri]\n---\n# Not\n\nİçerik"
    title, content, tags = _parse_markdown(raw, "fallback")
    assert title == "Not"
    assert "python" in tags
    assert "ai" in tags


def test_parse_markdown_frontmatter_tags_block() -> None:
    raw = "---\ntags:\n  - python\n  - ml\n---\n# Başlık\n\nİçerik"
    _, _, tags = _parse_markdown(raw, "f")
    assert "python" in tags
    assert "ml" in tags


def test_import_single_file(tmp_path: Path) -> None:
    md = tmp_path / "test-note.md"
    md.write_text("# Import Testi\n\nBu import edilecek bir not.", encoding="utf-8")

    imported, skipped = import_path(str(md))
    assert imported == 1
    assert skipped == 0

    notes = db.list_notes()
    assert len(notes) == 1
    assert notes[0].title == "Import Testi"
    assert notes[0].source == "import"


def test_import_directory(tmp_path: Path) -> None:
    (tmp_path / "a.md").write_text("# Not A\n\nİçerik A", encoding="utf-8")
    (tmp_path / "b.md").write_text("# Not B\n\nİçerik B", encoding="utf-8")
    (tmp_path / "ignore.txt").write_text("Bu import edilmemeli", encoding="utf-8")

    imported, skipped = import_path(str(tmp_path))
    assert imported == 2
    assert skipped == 0


def test_import_nonexistent_path() -> None:
    imported, skipped = import_path("/nonexistent/path/doesnt/exist")
    assert imported == 0
    assert skipped == 0
