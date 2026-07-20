"""Cortex plugin: word_counter — records each note's word count.

Copy this file to ~/.cortex/plugins/ to enable it. Demonstrates a
plugin-owned table (must be prefixed with plugin_word_counter_).
"""

from datetime import datetime

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS plugin_word_counter_stats (
    note_id    INTEGER PRIMARY KEY,
    word_count INTEGER NOT NULL,
    counted_at TEXT NOT NULL
)
"""


def register(api):
    api.create_table(_CREATE_TABLE)

    def after_add(note):
        word_count = len(note.content.split())
        api.execute(
            "INSERT OR REPLACE INTO plugin_word_counter_stats "
            "(note_id, word_count, counted_at) VALUES (?, ?, ?)",
            (note.id, word_count, datetime.utcnow().isoformat()),
        )

    api.on_after_add(after_add)
