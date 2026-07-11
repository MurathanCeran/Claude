"""Tests for export.py: Markdown, JSON, and HTML export."""

import json
from pathlib import Path

import pytest

import cortex.db as db
from cortex.export import export_html, export_json, export_markdown


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB to a temp file for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def test_export_markdown_writes_one_file_per_note(tmp_path: Path) -> None:
    db.create_note("Evrim Teorisi", "Darwin evrim teorisini önerdi.")
    db.create_note("Genetik", "DNA hakkında notlar.")

    out_dir = tmp_path / "export"
    count = export_markdown(str(out_dir))

    assert count == 2
    md_files = list(out_dir.glob("*.md"))
    assert len(md_files) == 2


def test_export_markdown_includes_frontmatter(tmp_path: Path) -> None:
    note_id = db.create_note("Test Notu", "İçerik burada.")
    db.attach_tags(note_id, ["python", "test"])

    out_dir = tmp_path / "export"
    export_markdown(str(out_dir))

    md_file = next(out_dir.glob("*.md"))
    text = md_file.read_text(encoding="utf-8")
    assert 'title: "Test Notu"' in text
    assert "tags: [python, test]" in text
    assert "İçerik burada." in text


def test_export_json_structure(tmp_path: Path) -> None:
    target_id = db.create_note("Hedef Not", "içerik")
    source_id = db.create_note("Kaynak Not", "Bkz: [[Hedef Not]]")
    db.attach_tags(source_id, ["biyoloji"])

    out_path = tmp_path / "export.json"
    count = export_json(str(out_path))

    assert count == 2
    data = json.loads(out_path.read_text(encoding="utf-8"))
    assert "exported_at" in data
    assert len(data["notes"]) == 2

    source_note = next(n for n in data["notes"] if n["id"] == source_id)
    assert source_note["tags"] == ["biyoloji"]
    assert source_note["links"][0]["target_id"] == target_id
    assert source_note["links"][0]["is_broken"] is False


def test_export_html_contains_working_anchor_links(tmp_path: Path) -> None:
    target_id = db.create_note("Hedef Not", "içerik")
    db.create_note("Kaynak Not", "Bkz: [[Hedef Not]] ve [[Olmayan Not]]")

    out_path = tmp_path / "export.html"
    count = export_html(str(out_path))

    assert count == 2
    html_text = out_path.read_text(encoding="utf-8")
    assert f'<section id="note-{target_id}">' in html_text
    assert f'href="#note-{target_id}"' in html_text
    assert "kırık link" in html_text


def test_export_html_escapes_special_characters(tmp_path: Path) -> None:
    db.create_note("<script>alert(1)</script>", "içerik")

    out_path = tmp_path / "export.html"
    export_html(str(out_path))

    html_text = out_path.read_text(encoding="utf-8")
    assert "<script>alert(1)</script>" not in html_text
    assert "&lt;script&gt;" in html_text
