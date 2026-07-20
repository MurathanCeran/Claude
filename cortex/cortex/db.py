"""SQLite connection, schema creation, and CRUD operations."""

import re
import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Generator, Optional

from cortex.models import Backlink, Note, NoteLink, Tag

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
    source_url TEXT,
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

CREATE TABLE IF NOT EXISTS note_links (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id    INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    target_id    INTEGER          REFERENCES notes(id) ON DELETE SET NULL,
    target_title TEXT    NOT NULL,
    is_broken    INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS review_schedule (
    note_id       INTEGER PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    next_review   TEXT    NOT NULL,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor   REAL    NOT NULL DEFAULT 2.5,
    review_count  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id     INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    result      TEXT    NOT NULL,
    reviewed_at TEXT    NOT NULL
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
        _migrate(conn)


def _migrate(conn: sqlite3.Connection) -> None:
    """Apply incremental schema migrations for existing databases."""
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(notes)").fetchall()}
    if "source_url" not in cols:
        conn.execute("ALTER TABLE notes ADD COLUMN source_url TEXT")

    # Backfill review schedules for notes that predate the review feature.
    conn.execute(
        """
        INSERT OR IGNORE INTO review_schedule
            (note_id, next_review, interval_days, ease_factor, review_count)
        SELECT id, ?, 1, 2.5, 0 FROM notes
        """,
        (date.today().isoformat(),),
    )


# ── Note CRUD ────────────────────────────────────────────────────────────────


def _now() -> str:
    return datetime.utcnow().isoformat()


def create_note(
    title: str,
    content: str,
    source: str = "manual",
    source_url: Optional[str] = None,
) -> int:
    """Insert a note and return its new id."""
    fields = _plugin_before_add(
        {
            "title": title,
            "content": content,
            "source": source,
            "source_url": source_url,
        }
    )
    title = fields.get("title", title)
    content = fields.get("content", content)
    source = fields.get("source", source)
    source_url = fields.get("source_url", source_url)

    now = _now()
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO notes (title, content, source, source_url, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (title, content, source, source_url, now, now),
        )
        note_id = cur.lastrowid
        _sync_links(conn, note_id, content)
        _schedule_review(conn, note_id)

    note = get_note(note_id)  # type: ignore[arg-type]
    if note is not None:
        _plugin_after_add(note)
    return note_id  # type: ignore[return-value]


def _plugin_before_add(fields: dict) -> dict:
    try:
        from cortex import plugins

        return plugins.run_before_add(fields)
    except Exception:  # noqa: BLE001
        return fields


def _plugin_after_add(note: Note) -> None:
    try:
        from cortex import plugins

        plugins.run_after_add(note)
    except Exception:  # noqa: BLE001
        pass


def get_note(note_id: int) -> Optional[Note]:
    """Fetch a single note with its tags."""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
        if row is None:
            return None
        note = _row_to_note(row)
        note.tags = _get_tags_for_note(conn, note_id)
        return note


def get_note_by_title(title: str) -> Optional[Note]:
    """Fetch a single note by exact title (case-insensitive)."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM notes WHERE LOWER(title) = LOWER(?)", (title,)
        ).fetchone()
        if row is None:
            return None
        note = _row_to_note(row)
        note.tags = _get_tags_for_note(conn, note.id)
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
        changed = cur.rowcount > 0
        if changed:
            _sync_links(conn, note_id, content)
        return changed


def delete_note(note_id: int) -> bool:
    """Delete a note. Links pointing to it are marked broken, not removed.

    Returns False if the note doesn't exist, or a plugin vetoes the deletion.
    """
    if not _plugin_before_delete(note_id):
        return False

    with get_conn() as conn:
        conn.execute(
            "UPDATE note_links SET is_broken = 1 WHERE target_id = ?", (note_id,)
        )
        cur = conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        return cur.rowcount > 0


def _plugin_before_delete(note_id: int) -> bool:
    try:
        from cortex import plugins

        return plugins.run_before_delete(note_id)
    except Exception:  # noqa: BLE001
        return True


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
        rows = conn.execute("""
            SELECT t.id, t.name
            FROM tags t
            ORDER BY t.name
            """).fetchall()
        return [Tag(id=r["id"], name=r["name"]) for r in rows]


def tag_stats() -> list[dict]:
    """Return tags with note counts, sorted by count desc."""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT t.name, COUNT(nt.note_id) as count
            FROM tags t
            LEFT JOIN note_tags nt ON nt.tag_id = t.id
            GROUP BY t.id
            ORDER BY count DESC
            """).fetchall()
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
        rows = conn.execute("""
            SELECT n.* FROM notes n
            LEFT JOIN note_summaries s ON s.note_id = n.id
            WHERE s.note_id IS NULL
            ORDER BY n.id
            """).fetchall()
        return [_row_to_note(r) for r in rows]


def delete_all_summaries() -> None:
    """Remove all entries from note_summaries (used by reindex --force)."""
    with get_conn() as conn:
        conn.execute("DELETE FROM note_summaries")


# ── Note Links ───────────────────────────────────────────────────────────────

_LINK_PATTERN = re.compile(r"\[\[([^\[\]]+)\]\]")


def _sync_links(conn: sqlite3.Connection, note_id: int, content: str) -> None:
    """Parse [[Title]] references from content and rebuild note_links rows."""
    conn.execute("DELETE FROM note_links WHERE source_id = ?", (note_id,))
    now = _now()
    seen: set[str] = set()
    for raw_title in _LINK_PATTERN.findall(content):
        # Support Obsidian-style [[Title|Alias]] and [[Title#Heading]] links.
        title = raw_title.split("|")[0].split("#")[0].strip()
        key = title.lower()
        if not title or key in seen:
            continue
        seen.add(key)
        row = conn.execute(
            "SELECT id FROM notes WHERE LOWER(title) = LOWER(?)", (title,)
        ).fetchone()
        target_id = row["id"] if row else None
        conn.execute(
            "INSERT INTO note_links (source_id, target_id, target_title, is_broken, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (note_id, target_id, title, 0 if target_id else 1, now),
        )


def get_outgoing_links(note_id: int) -> list[NoteLink]:
    """Links this note makes to others, including broken ones."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT target_id, target_title, is_broken
            FROM note_links
            WHERE source_id = ?
            ORDER BY id
            """,
            (note_id,),
        ).fetchall()
        return [
            NoteLink(
                target_id=r["target_id"],
                target_title=r["target_title"],
                is_broken=bool(r["is_broken"]),
            )
            for r in rows
        ]


def get_backlinks(note_id: int) -> list[Backlink]:
    """Notes that link to this note (valid links only)."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT n.id AS source_id, n.title AS source_title
            FROM note_links nl
            JOIN notes n ON n.id = nl.source_id
            WHERE nl.target_id = ? AND nl.is_broken = 0
            ORDER BY n.id
            """,
            (note_id,),
        ).fetchall()
        return [
            Backlink(source_id=r["source_id"], source_title=r["source_title"])
            for r in rows
        ]


def get_orphan_notes() -> list[Note]:
    """Notes with no incoming links and no valid outgoing links."""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT n.* FROM notes n
            WHERE n.id NOT IN (
                SELECT target_id FROM note_links WHERE target_id IS NOT NULL
            )
            AND n.id NOT IN (
                SELECT source_id FROM note_links WHERE is_broken = 0
            )
            ORDER BY n.id
            """).fetchall()
        return [_row_to_note(r) for r in rows]


def get_all_links() -> list[tuple[int, int]]:
    """All valid (non-broken) links as (source_id, target_id) pairs, for graphing."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT source_id, target_id FROM note_links WHERE is_broken = 0"
        ).fetchall()
        return [(r["source_id"], r["target_id"]) for r in rows]


# ── Review Schedule (Leitner / simplified SM-2) ─────────────────────────────

_LEITNER_INTERVALS = [1, 3, 7, 14, 30, 90]  # days
_MIN_EASE = 1.3
_MAX_EASE = 3.0


def _schedule_review(conn: sqlite3.Connection, note_id: int) -> None:
    """Seed a fresh note into the review queue, due tomorrow."""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    conn.execute(
        "INSERT OR IGNORE INTO review_schedule "
        "(note_id, next_review, interval_days, ease_factor, review_count) "
        "VALUES (?, ?, 1, 2.5, 0)",
        (note_id, tomorrow),
    )


def get_due_notes(today: Optional[str] = None) -> list[Note]:
    """Notes due for review today or earlier, weakest ease_factor first."""
    today = today or date.today().isoformat()
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT n.* FROM notes n
            JOIN review_schedule rs ON rs.note_id = n.id
            WHERE rs.next_review <= ?
            ORDER BY rs.ease_factor ASC, rs.next_review ASC
            """,
            (today,),
        ).fetchall()
        notes = [_row_to_note(r) for r in rows]
        for note in notes:
            note.tags = _get_tags_for_note(conn, note.id)
        return notes


def record_review(note_id: int, result: str) -> None:
    """Update a note's review schedule and log the outcome.

    result must be one of: 'remembered', 'unsure', 'forgot'.
    """
    with get_conn() as conn:
        row = conn.execute(
            "SELECT interval_days, ease_factor, review_count "
            "FROM review_schedule WHERE note_id = ?",
            (note_id,),
        ).fetchone()
        interval_days = row["interval_days"] if row else 1
        ease_factor = row["ease_factor"] if row else 2.5
        review_count = row["review_count"] if row else 0

        interval_days, ease_factor = _next_schedule(interval_days, ease_factor, result)
        next_review = (date.today() + timedelta(days=interval_days)).isoformat()

        conn.execute(
            """
            INSERT INTO review_schedule
                (note_id, next_review, interval_days, ease_factor, review_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(note_id) DO UPDATE SET
                next_review = excluded.next_review,
                interval_days = excluded.interval_days,
                ease_factor = excluded.ease_factor,
                review_count = excluded.review_count
            """,
            (note_id, next_review, interval_days, ease_factor, review_count + 1),
        )
        conn.execute(
            "INSERT INTO review_log (note_id, result, reviewed_at) VALUES (?, ?, ?)",
            (note_id, result, _now()),
        )


def _next_schedule(
    interval_days: int, ease_factor: float, result: str
) -> tuple[int, float]:
    """Compute the next (interval_days, ease_factor) via Leitner boxes."""
    try:
        box = _LEITNER_INTERVALS.index(interval_days)
    except ValueError:
        box = 0

    if result == "remembered":
        box = min(box + 1, len(_LEITNER_INTERVALS) - 1)
        ease_factor = min(ease_factor + 0.1, _MAX_EASE)
    elif result == "unsure":
        ease_factor = max(ease_factor - 0.15, _MIN_EASE)
    else:  # forgot
        box = 0
        ease_factor = max(ease_factor - 0.3, _MIN_EASE)

    return _LEITNER_INTERVALS[box], round(ease_factor, 2)


def get_review_stats() -> dict:
    """Aggregate review stats: total reviews, current streak, top notes."""
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM review_log").fetchone()[0]
        streak = _compute_streak(conn)
        rows = conn.execute("""
            SELECT n.id, n.title, COUNT(rl.id) as cnt
            FROM review_log rl
            JOIN notes n ON n.id = rl.note_id
            GROUP BY rl.note_id
            ORDER BY cnt DESC
            LIMIT 5
            """).fetchall()
        top_notes = [
            {"id": r["id"], "title": r["title"], "count": r["cnt"]} for r in rows
        ]
        return {"total_reviews": total, "streak": streak, "top_notes": top_notes}


def _compute_streak(conn: sqlite3.Connection) -> int:
    """Consecutive days (ending today or yesterday) with at least one review."""
    rows = conn.execute(
        "SELECT DISTINCT DATE(reviewed_at) as d FROM review_log ORDER BY d DESC"
    ).fetchall()
    review_dates = {r["d"] for r in rows}
    if not review_dates:
        return 0

    cursor = date.today()
    if cursor.isoformat() not in review_dates:
        cursor -= timedelta(days=1)

    streak = 0
    while cursor.isoformat() in review_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


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
    return " OR ".join(tokens)


# ── Internal helpers ──────────────────────────────────────────────────────────


def _row_to_note(row: sqlite3.Row) -> Note:
    return Note(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        source=row["source"],
        source_url=row["source_url"],
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
