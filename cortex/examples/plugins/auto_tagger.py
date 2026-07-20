"""Cortex plugin: auto_tagger — suggests tags based on note content keywords.

Copy this file to ~/.cortex/plugins/ to enable it.
"""

from cortex import db

_KEYWORD_TAGS = {
    "python": "python",
    "javascript": "javascript",
    "sql": "veritabani",
    "veritabanı": "veritabani",
    "makine öğrenmesi": "yapay-zeka",
    "yapay zeka": "yapay-zeka",
    "docker": "devops",
    "kubernetes": "devops",
}


def register(api):
    def after_add(note):
        text = f"{note.title} {note.content}".lower()
        matches = {tag for keyword, tag in _KEYWORD_TAGS.items() if keyword in text}
        if matches:
            db.attach_tags(note.id, sorted(matches))

    api.on_after_add(after_add)
