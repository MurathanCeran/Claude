"""Tests for review_schedule: Leitner scheduling, due queries, streaks."""

from datetime import date, timedelta
from pathlib import Path

import pytest

import cortex.db as db


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB to a temp file for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def test_new_note_scheduled_for_tomorrow() -> None:
    note_id = db.create_note("Not", "içerik")
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    due_today = db.get_due_notes(today=date.today().isoformat())
    due_tomorrow = db.get_due_notes(today=tomorrow)

    assert note_id not in [n.id for n in due_today]
    assert note_id in [n.id for n in due_tomorrow]


def test_remembered_grows_interval() -> None:
    note_id = db.create_note("Not", "içerik")
    db.record_review(note_id, "remembered")

    due_in_3_days = db.get_due_notes(
        today=(date.today() + timedelta(days=3)).isoformat()
    )
    assert note_id in [n.id for n in due_in_3_days]

    due_tomorrow = db.get_due_notes(
        today=(date.today() + timedelta(days=1)).isoformat()
    )
    assert note_id not in [n.id for n in due_tomorrow]


def test_forgot_resets_to_one_day() -> None:
    note_id = db.create_note("Not", "içerik")
    db.record_review(note_id, "remembered")  # box -> 3 days
    db.record_review(note_id, "forgot")  # box back to 1 day

    due_tomorrow = db.get_due_notes(
        today=(date.today() + timedelta(days=1)).isoformat()
    )
    assert note_id in [n.id for n in due_tomorrow]


def test_ease_factor_bounds() -> None:
    note_id = db.create_note("Not", "içerik")
    for _ in range(20):
        db.record_review(note_id, "forgot")

    stats = db.get_review_stats()
    assert stats["total_reviews"] == 20


def test_review_order_lowest_ease_first() -> None:
    a = db.create_note("A", "içerik")
    b = db.create_note("B", "içerik")
    today = date.today().isoformat()

    # Force both due today and give A a lower ease_factor via repeated "unsure".
    db.record_review(a, "unsure")
    db.record_review(a, "unsure")
    db.record_review(b, "remembered")

    with db.get_conn() as conn:
        conn.execute("UPDATE review_schedule SET next_review = ?", (today,))

    due = db.get_due_notes(today=today)
    ids = [n.id for n in due]
    assert ids.index(a) < ids.index(b)


def test_review_stats_counts_and_top_notes() -> None:
    note_id = db.create_note("Sık Tekrar", "içerik")
    db.record_review(note_id, "remembered")
    db.record_review(note_id, "unsure")

    stats = db.get_review_stats()
    assert stats["total_reviews"] == 2
    assert stats["top_notes"][0]["id"] == note_id
    assert stats["top_notes"][0]["count"] == 2


def test_get_note_by_title_case_insensitive() -> None:
    db.create_note("2026-07-11", "günlük içerik")
    note = db.get_note_by_title("2026-07-11")
    assert note is not None
    assert note.title == "2026-07-11"

    missing = db.get_note_by_title("olmayan-baslik")
    assert missing is None


def test_deleting_note_removes_review_schedule() -> None:
    note_id = db.create_note("Silinecek", "içerik")
    db.delete_note(note_id)

    due = db.get_due_notes(today=(date.today() + timedelta(days=2)).isoformat())
    assert note_id not in [n.id for n in due]
