"""Export notes to Markdown files, JSON, or a single offline HTML file."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path

import markdown as md_lib

from cortex import db
from cortex.models import Note

_LINK_PATTERN = re.compile(r"\[\[([^\[\]]+)\]\]")


def export_markdown(output_dir: str) -> int:
    """Write each note as a .md file with YAML frontmatter. Returns note count."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    notes = db.list_notes(limit=10_000)

    for note in notes:
        filename = f"{note.id}-{_slugify(note.title)}.md"
        body = f"{_build_frontmatter(note)}\n\n{note.content}\n"
        (out / filename).write_text(body, encoding="utf-8")

    return len(notes)


def _build_frontmatter(note: Note) -> str:
    lines = ["---", f'title: "{note.title}"']
    if note.tag_names:
        lines.append(f"tags: [{', '.join(note.tag_names)}]")
    lines.append(f"created: {note.created_at.isoformat()}")
    lines.append(f"updated: {note.updated_at.isoformat()}")
    lines.append(f"source: {note.source}")
    if note.source_url:
        lines.append(f"source_url: {note.source_url}")
    lines.append("---")
    return "\n".join(lines)


def _slugify(title: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[\s_-]+", "-", slug).strip("-")
    return slug or "not"


def export_json(output_path: str) -> int:
    """Dump all notes (with tags and links) as a single re-importable JSON file."""
    notes = db.list_notes(limit=10_000)
    payload = {
        "exported_at": datetime.utcnow().isoformat(),
        "notes": [_note_to_dict(n) for n in notes],
    }
    Path(output_path).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return len(notes)


def _note_to_dict(note: Note) -> dict:
    links = db.get_outgoing_links(note.id)
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "source": note.source,
        "source_url": note.source_url,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
        "tags": note.tag_names,
        "links": [
            {
                "target_title": link.target_title,
                "target_id": link.target_id,
                "is_broken": link.is_broken,
            }
            for link in links
        ],
    }


def export_html(output_path: str) -> int:
    """Render all notes as a single self-contained, offline-readable HTML file."""
    notes = db.list_notes(limit=10_000)
    nav = "\n".join(
        f'<li><a href="#note-{n.id}">{html.escape(n.title)}</a></li>' for n in notes
    )
    body = "\n".join(_note_to_html_section(n) for n in notes)
    page = _HTML_TEMPLATE.format(nav=nav, body=body, count=len(notes))
    Path(output_path).write_text(page, encoding="utf-8")
    return len(notes)


def _note_to_html_section(note: Note) -> str:
    content_html = md_lib.markdown(_linkify(note.content))
    tags = ", ".join(note.tag_names) or "—"
    meta = f"{note.source} · {tags} · {note.updated_at.strftime('%d.%m.%Y')}"
    return (
        f'<section id="note-{note.id}">'
        f"<h2>{html.escape(note.title)}</h2>"
        f'<div class="meta">{html.escape(meta)}</div>'
        f'<div class="content">{content_html}</div>'
        f"</section>"
    )


def _linkify(content: str) -> str:
    """Turn [[Title]] references into real anchor links (or a broken marker)."""

    def repl(match: re.Match) -> str:
        title = match.group(1).split("|")[0].split("#")[0].strip()
        target = db.get_note_by_title(title)
        if target:
            return f"[{title}](#note-{target.id})"
        return f"*{title}* (kırık link)"

    return _LINK_PATTERN.sub(repl, content)


_HTML_TEMPLATE = """<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Cortex Export</title>
<style>
  :root {{ color-scheme: light dark; }}
  body {{
    font-family: -apple-system, "Segoe UI", sans-serif;
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
    line-height: 1.6;
  }}
  nav {{ margin-bottom: 2rem; border-bottom: 1px solid #8884; padding-bottom: 1rem; }}
  nav ul {{ columns: 2; padding-left: 1.2rem; }}
  section {{
    margin-bottom: 3rem;
    scroll-margin-top: 1rem;
    border-top: 1px solid #8884;
    padding-top: 1rem;
  }}
  .meta {{ color: #888; font-size: 0.85rem; margin-bottom: 1rem; }}
  a {{ color: #4a9eff; }}
  code, pre {{ background: #8881; padding: 0.2rem 0.4rem; border-radius: 4px; }}
</style>
</head>
<body>
<h1>Cortex — Not Arşivi ({count} not)</h1>
<nav><ul>
{nav}
</ul></nav>
<main>
{body}
</main>
</body>
</html>
"""
