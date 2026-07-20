"""Cortex plugin: daily_digest_email — writes a mock daily-digest "email" to disk.

Copy this file to ~/.cortex/plugins/ to enable it. It does NOT send real
email — it appends each new note to a text file under
~/.cortex/plugins/digest_output/YYYY-MM-DD.txt as a stand-in for a digest
that would otherwise be emailed.
"""

from datetime import datetime
from pathlib import Path

_OUTPUT_DIR = Path.home() / ".cortex" / "plugins" / "digest_output"


def register(api):
    def after_add(note):
        _OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        today = datetime.utcnow().date().isoformat()
        path = _OUTPUT_DIR / f"{today}.txt"
        is_new_file = not path.exists() or path.stat().st_size == 0
        with path.open("a", encoding="utf-8") as f:
            if is_new_file:
                f.write(f"Konu: Cortex Günlük Özet — {today}\n")
                f.write("(Bu bir e-posta simülasyonudur, gerçekten gönderilmedi.)\n\n")
            f.write(f"- #{note.id} {note.title}\n")

    api.on_after_add(after_add)
