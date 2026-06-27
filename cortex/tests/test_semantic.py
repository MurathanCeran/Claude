"""Tests for the semantic module — all Claude API calls are mocked."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from cortex.models import Note
from cortex.semantic import _parse_ids, _call_summarize, summarize_note


def _make_note(note_id: int = 1, title: str = "Test Notu") -> Note:
    return Note(
        id=note_id,
        title=title,
        content="Bu bir test notu içeriğidir.",
        source="manual",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


# ── _parse_ids ────────────────────────────────────────────────────────────────

def test_parse_ids_simple():
    assert _parse_ids("1, 3, 7") == [1, 3, 7]


def test_parse_ids_with_brackets():
    assert _parse_ids("[1], [3], [7]") == [1, 3, 7]


def test_parse_ids_empty():
    assert _parse_ids("") == []


def test_parse_ids_newline_separated():
    assert _parse_ids("2\n5\n8") == [2, 5, 8]


# ── summarize_note ────────────────────────────────────────────────────────────

@patch("cortex.semantic.get_client")
def test_summarize_note_returns_none_without_key(mock_get_client):
    mock_get_client.return_value = None
    assert summarize_note(_make_note()) is None


@patch("cortex.semantic.get_client")
def test_summarize_note_calls_api_and_returns_text(mock_get_client):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="  Bu bir özet.  ")]
    mock_client.messages.create.return_value = mock_response
    mock_get_client.return_value = mock_client

    result = summarize_note(_make_note())

    assert result == "Bu bir özet."
    mock_client.messages.create.assert_called_once()


# ── _call_summarize ───────────────────────────────────────────────────────────

def test_call_summarize_handles_api_error(capsys):
    import anthropic

    mock_client = MagicMock()
    mock_client.messages.create.side_effect = anthropic.APIError(
        message="quota exceeded", request=MagicMock(), body=None
    )
    note = _make_note(note_id=42)
    result = _call_summarize(mock_client, note)
    assert result is None
