"""Textual-based full-screen terminal dashboard for Cortex."""

from __future__ import annotations

from typing import Optional

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, VerticalScroll
from textual.screen import ModalScreen, Screen
from textual.widgets import (
    Footer,
    Header,
    Input,
    Label,
    ListItem,
    ListView,
    Markdown,
    Static,
    TextArea,
)

from cortex import db, search
from cortex.models import Note

_CSS = """
Screen { background: $surface; }

#note-list-pane, #results-pane, #tag-pane {
    width: 34%;
    min-width: 24;
    border-right: solid cyan;
}

#detail-pane, #preview-pane, #tag-notes-pane {
    width: 66%;
    padding: 1 2;
}

ListView { height: 1fr; }

#search-input {
    dock: top;
    border: solid cyan;
    margin-bottom: 1;
}

#review-progress {
    dock: top;
    padding: 0 1;
    color: cyan;
    text-style: bold;
}

#review-pane { padding: 1 2; }

.hint { color: $text-muted; }

#confirm-box, #new-note-box, #tag-box {
    width: 60;
    height: auto;
    border: round cyan;
    padding: 1 2;
    background: $panel;
}

#new-note-box TextArea { height: 10; margin-top: 1; }

ModalScreen { align: center middle; }
"""


class NoteItem(ListItem):
    """A ListItem that carries the Note it represents."""

    def __init__(self, note: Note) -> None:
        super().__init__(Label(note.title, markup=False))
        self.note = note


class TagItem(ListItem):
    """A ListItem that carries a tag name."""

    def __init__(self, name: str, count: int) -> None:
        super().__init__(Label(f"#{name} ({count})", markup=False))
        self.tag_name = name


def _note_markdown(note: Note) -> str:
    return f"# {note.title}\n\n{note.content}"


class ConfirmScreen(ModalScreen[bool]):
    """Yes/No confirmation modal."""

    BINDINGS = [
        Binding("y", "confirm", "Evet", show=False),
        Binding("n", "cancel", "Hayır", show=False),
        Binding("escape", "cancel", "İptal", show=False),
    ]

    def __init__(self, message: str) -> None:
        super().__init__()
        self.message = message

    def compose(self) -> ComposeResult:
        with VerticalScroll(id="confirm-box"):
            yield Label(self.message, markup=False)
            yield Label("[y] Evet   [n] Hayır", classes="hint")

    def action_confirm(self) -> None:
        self.dismiss(True)

    def action_cancel(self) -> None:
        self.dismiss(False)


class NewNoteScreen(ModalScreen[Optional[int]]):
    """Modal for creating a new note."""

    BINDINGS = [
        Binding("escape", "cancel", "İptal", show=False),
        Binding("ctrl+s", "save", "Kaydet", show=False),
    ]

    def compose(self) -> ComposeResult:
        with VerticalScroll(id="new-note-box"):
            yield Label("Yeni Not")
            yield Input(placeholder="Başlık", id="new-title")
            yield TextArea(id="new-content")
            yield Label("[ctrl+s] Kaydet   [esc] İptal", classes="hint")

    def on_mount(self) -> None:
        self.query_one("#new-title", Input).focus()

    def action_cancel(self) -> None:
        self.dismiss(None)

    def action_save(self) -> None:
        title = self.query_one("#new-title", Input).value.strip()
        content = self.query_one("#new-content", TextArea).text.strip()
        if not title or not content:
            self.notify("Başlık ve içerik boş olamaz.", severity="warning")
            return
        note_id = db.create_note(title=title, content=content)
        self.dismiss(note_id)


class TagInputScreen(ModalScreen[Optional[list[str]]]):
    """Modal for attaching tags to a note."""

    BINDINGS = [Binding("escape", "cancel", "İptal", show=False)]

    def __init__(self, note_title: str) -> None:
        super().__init__()
        self.note_title = note_title

    def compose(self) -> ComposeResult:
        with VerticalScroll(id="tag-box"):
            yield Label(f"Etiketle: {self.note_title}", markup=False)
            yield Input(placeholder="etiket1, etiket2", id="tag-input")

    def on_mount(self) -> None:
        self.query_one(Input).focus()

    def action_cancel(self) -> None:
        self.dismiss(None)

    def on_input_submitted(self, event: Input.Submitted) -> None:
        tags = [t.strip() for t in event.value.split(",") if t.strip()]
        self.dismiss(tags or None)


class MainScreen(Screen):
    """Split view: note list on the left, selected note detail on the right."""

    BINDINGS = [
        Binding("j", "cursor_down", "Aşağı", show=False),
        Binding("k", "cursor_up", "Yukarı", show=False),
        Binding("/", "search", "Ara"),
        Binding("n", "new_note", "Yeni"),
        Binding("d", "delete_note", "Sil"),
        Binding("t", "tag_note", "Etiketle"),
        Binding("r", "review", "Review"),
        Binding("b", "tag_browser", "Etiketler"),
        Binding("q", "quit", "Çıkış"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self.current_note: Optional[Note] = None

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal():
            with VerticalScroll(id="note-list-pane"):
                yield ListView(id="note-list")
            with VerticalScroll(id="detail-pane"):
                yield Markdown("*Not seçin.*", id="detail")
        yield Footer()

    def on_mount(self) -> None:
        self.refresh_notes()

    def refresh_notes(self) -> None:
        list_view = self.query_one("#note-list", ListView)
        list_view.clear()
        for note in db.list_notes(limit=200):
            list_view.append(NoteItem(note))

    async def on_list_view_highlighted(self, event: ListView.Highlighted) -> None:
        if isinstance(event.item, NoteItem):
            self.current_note = event.item.note
            await self.query_one("#detail", Markdown).update(
                _note_markdown(event.item.note)
            )

    def action_cursor_down(self) -> None:
        self.query_one("#note-list", ListView).action_cursor_down()

    def action_cursor_up(self) -> None:
        self.query_one("#note-list", ListView).action_cursor_up()

    def action_search(self) -> None:
        self.app.push_screen(SearchScreen())

    def action_review(self) -> None:
        self.app.push_screen(ReviewScreen())

    def action_tag_browser(self) -> None:
        self.app.push_screen(TagBrowserScreen())

    def action_new_note(self) -> None:
        self.app.push_screen(NewNoteScreen(), self._on_note_created)

    def _on_note_created(self, note_id: Optional[int]) -> None:
        if note_id:
            self.refresh_notes()
            self.notify(f"Not eklendi: #{note_id}")

    def action_delete_note(self) -> None:
        if self.current_note is None:
            self.notify("Önce bir not seçin.", severity="warning")
            return
        message = f"'{self.current_note.title}' silinsin mi?"
        self.app.push_screen(ConfirmScreen(message), self._on_delete_confirmed)

    def _on_delete_confirmed(self, confirmed: bool) -> None:
        if not confirmed or self.current_note is None:
            return
        if db.delete_note(self.current_note.id):
            self.notify(f"Not silindi: #{self.current_note.id}")
            self.current_note = None
            self.refresh_notes()
        else:
            self.notify("Silme bir plugin tarafından engellendi.", severity="warning")

    def action_tag_note(self) -> None:
        if self.current_note is None:
            self.notify("Önce bir not seçin.", severity="warning")
            return
        self.app.push_screen(
            TagInputScreen(self.current_note.title), self._on_tags_entered
        )

    def _on_tags_entered(self, tags: Optional[list[str]]) -> None:
        if tags and self.current_note is not None:
            db.attach_tags(self.current_note.id, tags)
            self.notify(f"Etiketlendi: {', '.join(tags)}")
            self.refresh_notes()


class SearchScreen(Screen):
    """Search box, result list, and a live preview pane."""

    BINDINGS = [
        Binding("escape", "close", "Geri"),
        Binding("j", "cursor_down", "Aşağı", show=False),
        Binding("k", "cursor_up", "Yukarı", show=False),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield Input(placeholder="Ara...", id="search-input")
        with Horizontal():
            with VerticalScroll(id="results-pane"):
                yield ListView(id="results-list")
            with VerticalScroll(id="preview-pane"):
                yield Markdown("*Sonuç seçin.*", id="preview")
        yield Footer()

    def on_mount(self) -> None:
        self.query_one("#search-input", Input).focus()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        list_view = self.query_one("#results-list", ListView)
        list_view.clear()
        if not event.value.strip():
            return
        for result in search.search(event.value, limit=30):
            list_view.append(NoteItem(result.note))
        if list_view.children:
            list_view.index = 0

    async def on_list_view_highlighted(self, event: ListView.Highlighted) -> None:
        if isinstance(event.item, NoteItem):
            await self.query_one("#preview", Markdown).update(
                _note_markdown(event.item.note)
            )

    def action_close(self) -> None:
        self.app.pop_screen()

    def action_cursor_down(self) -> None:
        self.query_one("#results-list", ListView).action_cursor_down()

    def action_cursor_up(self) -> None:
        self.query_one("#results-list", ListView).action_cursor_up()


class TagBrowserScreen(Screen):
    """Browse tags on the left, notes carrying the selected tag on the right."""

    BINDINGS = [
        Binding("escape", "close", "Geri"),
        Binding("j", "cursor_down", "Aşağı", show=False),
        Binding("k", "cursor_up", "Yukarı", show=False),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        with Horizontal():
            with VerticalScroll(id="tag-pane"):
                yield ListView(id="tag-list")
            with VerticalScroll(id="tag-notes-pane"):
                yield ListView(id="tag-notes-list")
        yield Footer()

    def on_mount(self) -> None:
        tag_list = self.query_one("#tag-list", ListView)
        for row in db.tag_stats():
            tag_list.append(TagItem(row["name"], row["count"]))

    def on_list_view_highlighted(self, event: ListView.Highlighted) -> None:
        if event.list_view.id == "tag-list" and isinstance(event.item, TagItem):
            self._load_notes_for_tag(event.item.tag_name)

    def _load_notes_for_tag(self, tag_name: str) -> None:
        notes_list = self.query_one("#tag-notes-list", ListView)
        notes_list.clear()
        for note in db.list_notes(limit=200, tag=tag_name):
            notes_list.append(NoteItem(note))

    def action_close(self) -> None:
        self.app.pop_screen()

    def _focused_list(self) -> ListView:
        if isinstance(self.focused, ListView):
            return self.focused
        return self.query_one("#tag-list", ListView)

    def action_cursor_down(self) -> None:
        self._focused_list().action_cursor_down()

    def action_cursor_up(self) -> None:
        self._focused_list().action_cursor_up()


class ReviewScreen(Screen):
    """Spaced-repetition flashcards: one due note at a time."""

    BINDINGS = [
        Binding("escape", "close", "Geri"),
        Binding("1", "grade_remembered", "Hatırlıyorum"),
        Binding("2", "grade_unsure", "Belirsiz"),
        Binding("3", "grade_forgot", "Unutmuşum"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self.due_notes: list[Note] = []
        self.position = 0
        self.reviewed = 0

    def compose(self) -> ComposeResult:
        yield Header()
        yield Static("", id="review-progress")
        with VerticalScroll(id="review-pane"):
            yield Markdown("", id="review-content")
        yield Footer()

    def on_mount(self) -> None:
        self.due_notes = db.get_due_notes()
        self.run_worker(self._show_current())

    async def _show_current(self) -> None:
        progress = self.query_one("#review-progress", Static)
        content = self.query_one("#review-content", Markdown)
        if self.position >= len(self.due_notes):
            progress.update(f"Tamamlandı — {self.reviewed} not tekrar edildi.")
            await content.update("*Bugün tekrar edilecek not yok.*")
            return
        note = self.due_notes[self.position]
        progress.update(f"Tekrar {self.position + 1}/{len(self.due_notes)}")
        await content.update(_note_markdown(note))

    def action_close(self) -> None:
        self.app.pop_screen()

    def action_grade_remembered(self) -> None:
        self.run_worker(self._grade("remembered"))

    def action_grade_unsure(self) -> None:
        self.run_worker(self._grade("unsure"))

    def action_grade_forgot(self) -> None:
        self.run_worker(self._grade("forgot"))

    async def _grade(self, result: str) -> None:
        if self.position >= len(self.due_notes):
            return
        db.record_review(self.due_notes[self.position].id, result)
        self.reviewed += 1
        self.position += 1
        await self._show_current()


class CortexApp(App):
    """Full-screen terminal dashboard for Cortex."""

    TITLE = "Cortex"
    CSS = _CSS

    def on_mount(self) -> None:
        db.init_db()
        self.push_screen(MainScreen())
