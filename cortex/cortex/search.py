"""Search engine: FTS5 (SQLite) + TF-IDF re-ranking via scikit-learn."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from cortex import db
from cortex.models import Note, SearchResult

if TYPE_CHECKING:
    pass


def search(query: str, limit: int = 10) -> list[SearchResult]:
    """
    Two-stage search:
    1. FTS5 candidate retrieval (fast, exact token match)
    2. TF-IDF cosine re-ranking for relevance ordering
    """
    results = _run_search(query, limit)
    return _plugin_after_search(query, results)


def _run_search(query: str, limit: int) -> list[SearchResult]:
    fts_hits = db.fts_search(query, limit=limit * 3)
    if not fts_hits:
        return []

    ids = [note_id for note_id, _ in fts_hits]
    snippets = {note_id: snip for note_id, snip in fts_hits}

    notes = _fetch_notes_by_ids(ids)
    if not notes:
        return []

    if len(notes) == 1:
        note = notes[0]
        return [SearchResult(note=note, score=1.0, snippet=snippets.get(note.id, ""))]

    scored = _tfidf_rank(query, notes)
    results = [
        SearchResult(
            note=note,
            score=round(float(score), 4),
            snippet=snippets.get(note.id, note.short_content),
        )
        for note, score in scored
    ]
    return results[:limit]


def _plugin_after_search(query: str, results: list[SearchResult]) -> list[SearchResult]:
    try:
        from cortex import plugins

        return plugins.run_after_search(query, results)
    except Exception:  # noqa: BLE001
        return results


def _fetch_notes_by_ids(ids: list[int]) -> list[Note]:
    notes = []
    for note_id in ids:
        note = db.get_note(note_id)
        if note:
            notes.append(note)
    return notes


def _tfidf_rank(query: str, notes: list[Note]) -> list[tuple[Note, float]]:
    """Return notes sorted by TF-IDF cosine similarity descending."""
    corpus = [f"{n.title} {n.content}" for n in notes]
    vectorizer = TfidfVectorizer(
        strip_accents="unicode",
        analyzer="word",
        min_df=1,
        sublinear_tf=True,
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        query_vec = vectorizer.transform([query])
        scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
    except ValueError:
        # Empty vocabulary edge-case
        return [(n, 0.0) for n in notes]

    ranked = sorted(zip(notes, scores), key=lambda x: x[1], reverse=True)
    return ranked
