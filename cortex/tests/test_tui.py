"""Tests for the Textual dashboard (cortex/tui.py) using headless Pilot runs."""

from datetime import date
from pathlib import Path

import pytest
from textual.widgets import Input, ListView, TextArea

import cortex.db as db
from cortex.tui import (
    ConfirmScreen,
    CortexApp,
    NewNoteScreen,
    ReviewScreen,
    SearchScreen,
    TagBrowserScreen,
)


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB to a temp file for each test."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


async def test_app_boots_with_note_list() -> None:
    db.create_note("Evrim Teorisi", "içerik")
    db.create_note("Genetik", "içerik")

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        list_view = app.screen.query_one("#note-list", ListView)
        assert len(list_view.children) == 2


async def test_selecting_note_shows_detail() -> None:
    db.create_note("Tekil Not", "Bu içerik görünmeli.")

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        list_view = app.screen.query_one("#note-list", ListView)
        list_view.index = 0
        await pilot.pause()
        assert app.screen.current_note is not None
        assert app.screen.current_note.title == "Tekil Not"


async def test_search_flow_shows_results() -> None:
    db.create_note("Python Rehberi", "Python programlama notları")
    db.create_note("JavaScript", "JS notları")

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        await pilot.press("/")
        await pilot.pause()
        assert isinstance(app.screen, SearchScreen)

        search_input = app.screen.query_one("#search-input", Input)
        search_input.value = "python"
        await pilot.press("enter")
        await pilot.pause()

        results = app.screen.query_one("#results-list", ListView)
        assert len(results.children) == 1


async def test_new_note_creates_and_refreshes_list() -> None:
    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        await pilot.press("n")
        await pilot.pause()
        assert isinstance(app.screen, NewNoteScreen)

        app.screen.query_one("#new-title", Input).value = "TUI Notu"
        app.screen.query_one("#new-content", TextArea).text = "TUI içerik"
        await pilot.press("ctrl+s")
        await pilot.pause()

        notes = db.list_notes()
        assert any(n.title == "TUI Notu" for n in notes)


async def test_delete_note_removes_it_after_confirmation() -> None:
    note_id = db.create_note("Silinecek", "içerik")

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        list_view = app.screen.query_one("#note-list", ListView)
        list_view.index = 0
        await pilot.pause()

        await pilot.press("d")
        await pilot.pause()
        assert isinstance(app.screen, ConfirmScreen)

        await pilot.press("y")
        await pilot.pause()

        assert db.get_note(note_id) is None


async def test_review_flow_grades_and_advances() -> None:
    note_id = db.create_note("Tekrar Notu", "içerik")
    with db.get_conn() as conn:
        conn.execute(
            "UPDATE review_schedule SET next_review = ? WHERE note_id = ?",
            (date.today().isoformat(), note_id),
        )

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        await pilot.press("r")
        await pilot.pause()
        assert isinstance(app.screen, ReviewScreen)

        await pilot.press("1")
        await pilot.pause()

        assert db.get_review_stats()["total_reviews"] == 1


async def test_tag_browser_filters_notes_by_tag() -> None:
    note_id = db.create_note("Etiketli Not", "içerik")
    db.attach_tags(note_id, ["python"])
    db.create_note("Etiketsiz Not", "içerik")

    app = CortexApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        await pilot.press("b")
        await pilot.pause()
        assert isinstance(app.screen, TagBrowserScreen)

        tag_list = app.screen.query_one("#tag-list", ListView)
        tag_list.index = 0
        await pilot.pause()

        notes_list = app.screen.query_one("#tag-notes-list", ListView)
        assert len(notes_list.children) == 1
