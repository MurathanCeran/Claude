"""Markdown file importer — single file or directory."""

from __future__ import annotations

import re
from pathlib import Path

from cortex import db
from cortex.display import console, print_error, print_success


def import_path(path_str: str, source: str = "import") -> tuple[int, int]:
    """
    Import .md files from a file or directory.
    Returns (imported_count, skipped_count).
    """
    target = Path(path_str).expanduser().resolve()
    if not target.exists():
        print_error(f"Dosya veya klasör bulunamadı: {path_str}")
        return 0, 0

    if target.is_file():
        files = [target] if target.suffix == ".md" else []
    else:
        files = sorted(target.rglob("*.md"))

    if not files:
        print_error("Import edilecek .md dosyası bulunamadı.")
        return 0, 0

    imported = 0
    skipped = 0
    for md_file in files:
        ok = _import_file(md_file, source=source)
        if ok:
            imported += 1
        else:
            skipped += 1

    return imported, skipped


def _import_file(path: Path, source: str = "import") -> bool:
    """Parse and insert a single markdown file. Returns True on success."""
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as exc:
        print_error(f"Dosya okunamadı ({path.name}): {exc}")
        return False

    title, content, tags = _parse_markdown(raw, path.stem)
    note_id = db.create_note(title=title, content=content, source=source)

    if tags:
        db.attach_tags(note_id, tags)

    console.print(f"  [green]+[/green] {path.name} → not #{note_id}")
    return True


def _parse_markdown(raw: str, fallback_title: str) -> tuple[str, str, list[str]]:
    """
    Extract title (first # heading or filename), content, and frontmatter tags.
    Returns (title, content, tag_list).
    """
    tags: list[str] = []
    content = raw

    # Simple YAML frontmatter (---...---) parsing for tags field
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", raw, re.DOTALL)
    if fm_match:
        fm_block = fm_match.group(1)
        content = raw[fm_match.end() :]
        tags = _extract_frontmatter_tags(fm_block)

    # Title from first H1
    h1_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if h1_match:
        title = h1_match.group(1).strip()
    else:
        title = fallback_title.replace("-", " ").replace("_", " ").title()

    return title, content.strip(), tags


def _extract_frontmatter_tags(fm_block: str) -> list[str]:
    """Pull tags from 'tags: [a, b]' or 'tags:\n  - a\n  - b' style."""
    # Inline list: tags: [a, b, c]
    inline = re.search(r"^tags:\s*\[(.+?)\]", fm_block, re.MULTILINE)
    if inline:
        return [t.strip().strip("\"'") for t in inline.group(1).split(",")]

    # Block list:
    # tags:
    #   - a
    block_start = re.search(r"^tags:\s*$", fm_block, re.MULTILINE)
    if block_start:
        rest = fm_block[block_start.end() :]
        items = re.findall(r"^\s+-\s+(.+)$", rest, re.MULTILINE)
        return [i.strip() for i in items]

    return []
