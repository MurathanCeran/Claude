"""Claude API integration — semantic summarization and search."""

from __future__ import annotations

import os
import time
from typing import Optional

import anthropic

from cortex import db
from cortex.display import print_error, print_warning
from cortex.models import Note

_MODEL = "claude-opus-4-8"
_BATCH_DELAY = 1.0  # seconds between batch API calls


def get_client() -> Optional[anthropic.Anthropic]:
    """Return Anthropic client if ANTHROPIC_API_KEY is set, else None."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    return anthropic.Anthropic(api_key=key) if key else None


def summarize_note(note: Note) -> Optional[str]:
    """Generate a 1-2 sentence Turkish summary via Claude. Returns None on failure."""
    client = get_client()
    if client is None:
        return None
    return _call_summarize(client, note)


def _call_summarize(client: anthropic.Anthropic, note: Note) -> Optional[str]:
    """Inner summarize using an already-obtained client."""
    prompt = (
        f"Aşağıdaki notu 1-2 cümleyle Türkçe özetle. "
        f"Sadece özeti yaz, başka açıklama ekleme.\n\n"
        f"Başlık: {note.title}\n\nİçerik:\n{note.content[:2000]}"
    )
    try:
        msg = client.messages.create(
            model=_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text.strip()
    except anthropic.APIError as exc:
        print_error(f"Claude API hatası (#{note.id}): {exc}")
        return None


def reindex_all() -> tuple[int, int]:
    """
    Generate summaries for all notes that don't have one yet.
    Returns (created, failed) counts.
    """
    client = get_client()
    if client is None:
        print_warning("ANTHROPIC_API_KEY bulunamadı. Yeniden indeksleme atlandı.")
        return 0, 0

    notes = db.get_notes_without_summaries()
    created = failed = 0

    for i, note in enumerate(notes):
        if i > 0:
            time.sleep(_BATCH_DELAY)
        summary = _call_summarize(client, note)
        if summary:
            db.create_summary(note.id, summary)
            created += 1
        else:
            failed += 1

    return created, failed


def semantic_search(query: str, limit: int = 10) -> list[tuple[Note, str]]:
    """
    Find relevant notes using Claude as relevance judge.
    Returns list of (note, summary) tuples. Empty list if Claude unavailable.
    """
    client = get_client()
    if client is None:
        return []

    summaries = db.get_all_summaries()
    if not summaries:
        return []

    ids = _rank_notes(client, query, summaries, limit)
    results = []
    for note_id in ids:
        note = db.get_note(note_id)
        if note:
            results.append((note, summaries.get(note_id, note.short_content)))
    return results


def _rank_notes(
    client: anthropic.Anthropic,
    query: str,
    summaries: dict[int, str],
    limit: int,
) -> list[int]:
    """Ask Claude which note IDs are most relevant to query. Returns list of IDs."""
    lines = "\n".join(f"[{nid}] {s}" for nid, s in summaries.items())
    prompt = (
        f"Notlar ve özetleri aşağıda listelenmiştir. '{query}' sorgusuyla "
        f"en ilgili en fazla {limit} notun ID'sini önem sırasına göre yaz. "
        f"Sadece virgülle ayrılmış sayıları yaz, başka bir şey ekleme.\n\n{lines}"
    )
    try:
        msg = client.messages.create(
            model=_MODEL,
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}],
        )
        return _parse_ids(msg.content[0].text)
    except anthropic.APIError as exc:
        print_error(f"Claude API hatası: {exc}")
        return []


def ask(query: str) -> tuple[list[tuple[Note, str]], Optional[str]]:
    """
    Semantic search + synthesized contextual answer.
    Returns (relevant_notes, answer_text). answer_text is None on failure.
    """
    client = get_client()
    if client is None:
        return [], None

    summaries = db.get_all_summaries()
    if not summaries:
        return [], None

    ids = _rank_notes(client, query, summaries, limit=5)
    if not ids:
        return [], None

    notes_context = _build_notes_context(ids)
    answer = _synthesize_answer(client, query, notes_context)

    notes_with_summaries = []
    for nid in ids:
        note = db.get_note(nid)
        if note:
            notes_with_summaries.append((note, summaries.get(nid, note.short_content)))

    return notes_with_summaries, answer


def _build_notes_context(note_ids: list[int]) -> str:
    """Fetch notes and build a context block for Claude."""
    parts = []
    for nid in note_ids:
        note = db.get_note(nid)
        if note:
            parts.append(f"[{nid}] {note.title}\n{note.content[:1000]}")
    return "\n\n---\n\n".join(parts)


def _synthesize_answer(
    client: anthropic.Anthropic, query: str, context: str
) -> Optional[str]:
    """Synthesize a contextual answer from note content."""
    if not context:
        return None
    prompt = (
        f"Aşağıdaki notlara dayanarak '{query}' sorusunu Türkçe olarak yanıtla:\n\n"
        f"{context}"
    )
    try:
        msg = client.messages.create(
            model=_MODEL,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text.strip()
    except anthropic.APIError as exc:
        print_error(f"Claude API hatası: {exc}")
        return None


def _parse_ids(text: str) -> list[int]:
    """Parse comma-separated integers from Claude's response."""
    ids = []
    for part in text.replace("\n", ",").split(","):
        token = part.strip().strip("[]().")
        if token.isdigit():
            ids.append(int(token))
    return ids
