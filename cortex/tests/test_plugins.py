"""Tests for cortex/plugins.py: discovery, hooks, isolation, and CLI helpers."""

from pathlib import Path

import pytest

import cortex.db as db
import cortex.plugins as plugins
import cortex.search as search


@pytest.fixture(autouse=True)
def tmp_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Redirect DB and plugin dir to temp locations; reset hook state."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()

    plugin_dir = tmp_path / "plugins"
    monkeypatch.setattr(plugins, "PLUGIN_DIR", plugin_dir)
    monkeypatch.setattr(plugins, "_CONFIG_PATH", plugin_dir / "config.json")
    monkeypatch.setattr(plugins, "_WARNED_MARKER", plugin_dir / ".warned")
    monkeypatch.setattr(plugins, "_ERROR_LOG", plugin_dir / "errors.log")
    plugins._reset_hooks()


def _write_plugin(plugin_dir: Path, name: str, code: str) -> None:
    plugin_dir.mkdir(parents=True, exist_ok=True)
    (plugin_dir / f"{name}.py").write_text(code, encoding="utf-8")


def test_after_add_hook_fires_on_note_creation() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "tagger",
        "from cortex import db\n"
        "def register(api):\n"
        "    def after_add(note):\n"
        "        db.attach_tags(note.id, ['hooked'])\n"
        "    api.on_after_add(after_add)\n",
    )
    plugins.load_all_enabled()

    note_id = db.create_note("Test", "içerik")
    note = db.get_note(note_id)
    assert "hooked" in note.tag_names


def test_before_add_hook_can_modify_fields() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "prefixer",
        "def register(api):\n"
        "    def before_add(fields):\n"
        "        fields['title'] = '[P] ' + fields['title']\n"
        "        return fields\n"
        "    api.on_before_add(before_add)\n",
    )
    plugins.load_all_enabled()

    note_id = db.create_note("Başlık", "içerik")
    assert db.get_note(note_id).title == "[P] Başlık"


def test_before_delete_veto_blocks_deletion() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "guard",
        "def register(api):\n"
        "    def before_delete(note_id):\n"
        "        return False\n"
        "    api.on_before_delete(before_delete)\n",
    )
    plugins.load_all_enabled()

    note_id = db.create_note("Silinemez", "içerik")
    result = db.delete_note(note_id)

    assert result is False
    assert db.get_note(note_id) is not None


def test_after_search_hook_filters_results() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "filter",
        "def register(api):\n"
        "    def after_search(query, results):\n"
        "        return []\n"
        "    api.on_after_search(after_search)\n",
    )
    plugins.load_all_enabled()

    db.create_note("Python Rehberi", "Python programlama notları")
    results = search.search("python")

    assert results == []


def test_plugin_hook_error_does_not_crash_and_is_logged() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "broken",
        "def register(api):\n"
        "    def after_add(note):\n"
        "        raise ValueError('kasıtlı hata')\n"
        "    api.on_after_add(after_add)\n",
    )
    plugins.load_all_enabled()

    note_id = db.create_note("Not", "içerik")  # must not raise

    assert db.get_note(note_id) is not None
    assert plugins._ERROR_LOG.exists()
    assert "kasıtlı hata" in plugins._ERROR_LOG.read_text(encoding="utf-8")


def test_create_table_rejects_non_prefixed_name() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "rogue",
        "def register(api):\n"
        "    api.create_table('CREATE TABLE evil_table (id INTEGER)')\n",
    )
    plugins.load_all_enabled()

    status = {p["name"]: p["loaded"] for p in plugins.list_plugins()}
    assert status["rogue"] is False


def test_create_table_allows_prefixed_name() -> None:
    _write_plugin(
        plugins.PLUGIN_DIR,
        "counter",
        "def register(api):\n"
        "    api.create_table("
        "'CREATE TABLE IF NOT EXISTS plugin_counter_stats (id INTEGER)')\n",
    )
    plugins.load_all_enabled()

    status = {p["name"]: p["loaded"] for p in plugins.list_plugins()}
    assert status["counter"] is True


def test_enable_disable_persists_across_loads() -> None:
    _write_plugin(plugins.PLUGIN_DIR, "toggle", "def register(api):\n    pass\n")

    plugins.set_enabled("toggle", False)
    plugins.load_all_enabled()
    assert plugins.list_plugins()[0]["loaded"] is False

    plugins.set_enabled("toggle", True)
    plugins.load_all_enabled()
    assert plugins.list_plugins()[0]["loaded"] is True


def test_create_template_writes_valid_plugin_file() -> None:
    path = plugins.create_template("my_plugin")

    assert path.exists()
    assert "def register(api):" in path.read_text(encoding="utf-8")

    with pytest.raises(FileExistsError):
        plugins.create_template("my_plugin")
