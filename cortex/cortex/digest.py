"""Daily digest — today's notes + random memory from the past."""

from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from cortex import db
from cortex.models import Note


def get_today_notes() -> list[Note]:
    """Return all notes created today (UTC)."""
    today = datetime.utcnow().date().isoformat()
    all_notes = db.list_notes(limit=10_000)
    return [n for n in all_notes if n.created_at.date().isoformat() == today]


def get_memory_notes(min_days: int = 7, count: int = 3) -> list[tuple[Note, int]]:
    """
    Return up to `count` random notes older than `min_days`.
    Each tuple is (note, days_ago).
    """
    cutoff = datetime.utcnow() - timedelta(days=min_days)
    all_notes = db.list_notes(limit=10_000)
    old_notes = [n for n in all_notes if n.created_at < cutoff]

    if not old_notes:
        return []

    selected = random.sample(old_notes, min(count, len(old_notes)))
    now = datetime.utcnow()
    return [(n, (now - n.created_at).days) for n in selected]
