"""SQLite connection, schema creation, and CRUD operations."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Generator, Optional

from cortex.models import Note, Tag

DB_PATH = Path(__file__).parent.parent / "data" / "cortex.db"

DDL = """
CREATE TABLE IF NOT EXISTS note_summaries (
    note_id    INTEGER PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    summary    TEXT    NOT NULL,
    created_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    source     TEXT    NOT NULL DEFAULT 'manual',
    created_at TEXT    NOT NULL,
    updated_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title,
    content,
    content='notes',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content)
        VALUES ('delete', old.id, old.title, old.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content)
        VALUES ('delete', old.id, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;
"""


def get_db_path() -> Path:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return DB_PATH


@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
    """Context manager yielding a WAL-mode, row-factory connection."""
    conn = sqlite3.connect(str(get_db_path()))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Create all tables and triggers if they don't exist."""
    with get_conn() as conn:
        conn.executescript(DDL)


# ── Note CRUD ────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.utcnow().isoformat()


def create_note(title: str, content: str, source: str = "manual") -> int:
    """Insert a note and return its new id."""
    now = _now()
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO notes (title, content, source, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (title, content, source, now, now),
        )
        return cur.lastrowid  # type: ignore[return-value]


def get_note(note_id: int) -> Optional[Note]:
    """Fetch a single note with its tags."""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
        if row is None:
            return None
        note = _row_to_note(row)
        note.tags = _get_tags_for_note(conn, note_id)
        return note


def list_notes(limit: int = 20, tag: Optional[str] = None) -> list[Note]:
    """Return recent notes, optionally filtered by tag name."""
    with get_conn() as conn:
        if tag:
            rows = conn.execute(
                """
                SELECT n.* FROM notes n
                JOIN note_tags nt ON nt.note_id = n.id
                JOIN tags t ON t.id = nt.tag_id
                WHERE t.name = ?
                ORDER BY n.updated_at DESC
                LIMIT ?
                """,
                (tag, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM notes ORDER BY updated_at DESC LIMIT ?", (limit,)
            ).fetchall()

        notes = [_row_to_note(r) for r in rows]
        for note in notes:
            note.tags = _get_tags_for_note(conn, note.id)
        return notes


def update_note(note_id: int, title: str, content: str) -> bool:
    """Update title and content. Returns True if a row was changed."""
    with get_conn() as conn:
        cur = conn.execute(
            "UPDATE notes SET title=?, content=?, updated_at=? WHERE id=?",
            (title, content, _now(), note_id),
        )
        return cur.rowcount > 0


def delete_note(note_id: int) -> bool:
    """Delete a note and its tag links. Returns True if deleted."""
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        return cur.rowcount > 0


# ── Tag CRUD ─────────────────────────────────────────────────────────────────

def get_or_create_tag(name: str) -> int:
    """Return tag id, creating the tag if it doesn't exist."""
    with get_conn() as conn:
        row = conn.execute("SELECT id FROM tags WHERE name = ?", (name,)).fetchone()
        if row:
            return row["id"]
        cur = conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
        return cur.lastrowid  # type: ignore[return-value]


def attach_tags(note_id: int, tag_names: list[str]) -> None:
    """Attach one or more tags to a note (idempotent)."""
    for raw in tag_names:
        name = raw.strip().lower()
        if not name:
            continue
        tag_id = get_or_create_tag(name)
        with get_conn() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
                (note_id, tag_id),
            )


def get_all_tags() -> list[Tag]:
    """Return every tag with usage count as Tag objects."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT t.id, t.name
            FROM tags t
            ORDER BY t.name
            """
        ).fetchall()
        return [Tag(id=r["id"], name=r["name"]) for r in rows]


def tag_stats() -> list[dict]:
    """Return tags with note counts, sorted by count desc."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT t.name, COUNT(nt.note_id) as count
            FROM tags t
            LEFT JOIN note_tags nt ON nt.tag_id = t.id
            GROUP BY t.id
            ORDER BY count DESC
            """
        ).fetchall()
        return [{"name": r["name"], "count": r["count"]} for r in rows]


def db_stats() -> dict:
    """Return aggregate statistics for the stats command."""
    with get_conn() as conn:
        note_count = conn.execute("SELECT COUNT(*) FROM notes").fetchone()[0]
        tag_count = conn.execute("SELECT COUNT(*) FROM tags").fetchone()[0]
        source_rows = conn.execute(
            "SELECT source, COUNT(*) as c FROM notes GROUP BY source"
        ).fetchall()
        sources = {r["source"]: r["c"] for r in source_rows}
        return {
            "notes": note_count,
            "tags": tag_count,
            "sources": sources,
        }


# ── Note Summaries ───────────────────────────────────────────────────────────

def create_summary(note_id: int, summary: str) -> None:
    """Insert or replace a summary for a note."""
    now = _now()
    with get_conn() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO note_summaries (note_id, summary, created_at) "
            "VALUES (?, ?, ?)",
            (note_id, summary, now),
        )


def get_summary(note_id: int) -> Optional[str]:
    """Return the summary text for a note, or None if not found."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT summary FROM note_summaries WHERE note_id = ?", (note_id,)
        ).fetchone()
        return row["summary"] if row else None


def get_all_summaries() -> dict[int, str]:
    """Return all summaries as {note_id: summary} dict."""
    with get_conn() as conn:
        rows = conn.execute("SELECT note_id, summary FROM note_summaries").fetchall()
        return {r["note_id"]: r["summary"] for r in rows}


def get_notes_without_summaries() -> list[Note]:
    """Return all notes that have no entry in note_summaries."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT n.* FROM notes n
            LEFT JOIN note_summaries s ON s.note_id = n.id
            WHERE s.note_id IS NULL
            ORDER BY n.id
            """
        ).fetchall()
        return [_row_to_note(r) for r in rows]


def delete_all_summaries() -> None:
    """Remove all entries from note_summaries (used by reindex --force)."""
    with get_conn() as conn:
        conn.execute("DELETE FROM note_summaries")


# ── FTS5 search ──────────────────────────────────────────────────────────────

def fts_search(query: str, limit: int = 20) -> list[tuple[int, str]]:
    """Full-text search via FTS5. Returns list of (note_id, snippet).

    Multi-word queries fall back to OR so partial matches still surface.
    """
    fts_query = _build_fts_query(query)
    with get_conn() as conn:
        try:
            rows = conn.execute(
                """
                SELECT rowid,
                       snippet(notes_fts, 1, '[', ']', '...', 10) AS snip
                FROM notes_fts
                WHERE notes_fts MATCH ?
                ORDER BY rank
                LIMIT ?
                """,
                (fts_query, limit),
            ).fetchall()
        except sqlite3.OperationalError:
            # Malformed FTS5 query — return empty
            return []
        return [(r["rowid"], r["snip"]) for r in rows]


def _build_fts_query(query: str) -> str:
    """Convert a plain query to FTS5 syntax (OR for multi-word)."""
    tokens = [t for t in query.split() if t]
    if len(tokens) <= 1:
        return query
    # Try AND first (more precise); caller may fall back to OR if no results
    return " OR ".join(tokens)


# ── Internal helpers ──────────────────────────────────────────────────────────

def _row_to_note(row: sqlite3.Row) -> Note:
    return Note(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        source=row["source"],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
    )


def _get_tags_for_note(conn: sqlite3.Connection, note_id: int) -> list[Tag]:
    rows = conn.execute(
        """
        SELECT t.id, t.name FROM tags t
        JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = ?
        ORDER BY t.name
        """,
        (note_id,),
    ).fetchall()
    return [Tag(id=r["id"], name=r["name"]) for r in rows]
