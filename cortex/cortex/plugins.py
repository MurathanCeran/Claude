"""Plugin system: discovery, loading, hook dispatch, and a restricted DB API."""

from __future__ import annotations

import importlib.util
import json
import re
import sqlite3
import traceback
from datetime import datetime
from pathlib import Path
from types import ModuleType
from typing import Callable

from cortex import db
from cortex.display import print_error, print_warning
from cortex.models import Note, SearchResult

PLUGIN_DIR = Path.home() / ".cortex" / "plugins"
_CONFIG_PATH = PLUGIN_DIR / "config.json"
_WARNED_MARKER = PLUGIN_DIR / ".warned"
_ERROR_LOG = PLUGIN_DIR / "errors.log"

_TABLE_NAME_RE = re.compile(
    r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\"'`]?(\w+)", re.IGNORECASE
)

_HOOKS: dict[str, list[tuple[str, Callable]]] = {
    "before_add": [],
    "after_add": [],
    "before_delete": [],
    "after_search": [],
}
_LOADED_PLUGINS: dict[str, ModuleType] = {}


class PluginAPI:
    """Handle passed to a plugin's register(api) function."""

    def __init__(self, name: str) -> None:
        self.name = name
        self._table_prefix = f"plugin_{name}_"

    def on_before_add(self, func: Callable[[dict], "dict | None"]) -> None:
        _HOOKS["before_add"].append((self.name, func))

    def on_after_add(self, func: Callable[[Note], None]) -> None:
        _HOOKS["after_add"].append((self.name, func))

    def on_before_delete(self, func: Callable[[int], "bool | None"]) -> None:
        _HOOKS["before_delete"].append((self.name, func))

    def on_after_search(self, func: Callable[[str, list], "list | None"]) -> None:
        _HOOKS["after_search"].append((self.name, func))

    def create_table(self, ddl: str) -> None:
        self._check_table_name(ddl)
        with db.get_conn() as conn:
            conn.execute(ddl)

    def execute(self, sql: str, params: tuple = ()) -> None:
        if "create table" in sql.lower():
            self._check_table_name(sql)
        with db.get_conn() as conn:
            conn.execute(sql, params)

    def query(self, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
        with db.get_conn() as conn:
            return conn.execute(sql, params).fetchall()

    def _check_table_name(self, sql: str) -> None:
        match = _TABLE_NAME_RE.search(sql)
        if not match or not match.group(1).startswith(self._table_prefix):
            raise PermissionError(
                f"Plugin '{self.name}' sadece '{self._table_prefix}*' "
                f"isimli tablo oluşturabilir."
            )


# ── Discovery & loading ─────────────────────────────────────────────────────


def discover_plugin_files() -> list[Path]:
    """Return every .py file in the plugin directory, sorted by name."""
    if not PLUGIN_DIR.exists():
        return []
    return sorted(PLUGIN_DIR.glob("*.py"))


def load_all_enabled() -> None:
    """Reset hook state and (re)import every enabled plugin's register()."""
    _reset_hooks()
    files = discover_plugin_files()
    if not files:
        return

    _maybe_warn_first_load()
    config = _load_config()
    for path in files:
        name = path.stem
        if config.get(name, {}).get("enabled", True):
            _load_plugin_file(path, name)


def _reset_hooks() -> None:
    for hook_list in _HOOKS.values():
        hook_list.clear()
    _LOADED_PLUGINS.clear()


def _maybe_warn_first_load() -> None:
    if _WARNED_MARKER.exists():
        return
    print_warning(
        "Pluginler sandboxsuz çalışır — yalnızca güvendiğiniz plugin'leri "
        "yükleyin. Cortex, plugin kodunun davranışından sorumlu değildir."
    )
    PLUGIN_DIR.mkdir(parents=True, exist_ok=True)
    _WARNED_MARKER.touch()


def _load_plugin_file(path: Path, name: str) -> None:
    try:
        spec = importlib.util.spec_from_file_location(f"cortex_plugin_{name}", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)  # type: ignore[union-attr]
        if not hasattr(module, "register"):
            print_warning(f"Plugin '{name}' bir register() fonksiyonu içermiyor.")
            return
        module.register(PluginAPI(name))
        _LOADED_PLUGINS[name] = module
    except Exception as exc:  # noqa: BLE001
        print_error(f"Plugin '{name}' yüklenirken hata: {exc}")
        _log_plugin_error(name, exc)


def _log_plugin_error(name: str, exc: Exception) -> None:
    PLUGIN_DIR.mkdir(parents=True, exist_ok=True)
    with _ERROR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{datetime.utcnow().isoformat()}] {name}: {exc}\n")
        f.write(traceback.format_exc())
        f.write("\n")


# ── Hook dispatch ────────────────────────────────────────────────────────────


def run_before_add(fields: dict) -> dict:
    for name, func in _HOOKS["before_add"]:
        try:
            result = func(dict(fields))
            if isinstance(result, dict):
                fields = result
        except Exception as exc:  # noqa: BLE001
            print_error(f"Plugin '{name}' (before_add) hata: {exc}")
            _log_plugin_error(name, exc)
    return fields


def run_after_add(note: Note) -> None:
    for name, func in _HOOKS["after_add"]:
        try:
            func(note)
        except Exception as exc:  # noqa: BLE001
            print_error(f"Plugin '{name}' (after_add) hata: {exc}")
            _log_plugin_error(name, exc)


def run_before_delete(note_id: int) -> bool:
    """Returns False if any plugin vetoes the deletion."""
    for name, func in _HOOKS["before_delete"]:
        try:
            if func(note_id) is False:
                return False
        except Exception as exc:  # noqa: BLE001
            print_error(f"Plugin '{name}' (before_delete) hata: {exc}")
            _log_plugin_error(name, exc)
    return True


def run_after_search(query: str, results: list[SearchResult]) -> list[SearchResult]:
    for name, func in _HOOKS["after_search"]:
        try:
            result = func(query, results)
            if isinstance(result, list):
                results = result
        except Exception as exc:  # noqa: BLE001
            print_error(f"Plugin '{name}' (after_search) hata: {exc}")
            _log_plugin_error(name, exc)
    return results


# ── Enable / disable / list / scaffold ──────────────────────────────────────


def list_plugins() -> list[dict]:
    config = _load_config()
    return [
        {
            "name": path.stem,
            "enabled": config.get(path.stem, {}).get("enabled", True),
            "loaded": path.stem in _LOADED_PLUGINS,
        }
        for path in discover_plugin_files()
    ]


def set_enabled(name: str, enabled: bool) -> None:
    config = _load_config()
    config.setdefault(name, {})["enabled"] = enabled
    _save_config(config)


def _load_config() -> dict:
    if not _CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(_CONFIG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def _save_config(config: dict) -> None:
    PLUGIN_DIR.mkdir(parents=True, exist_ok=True)
    _CONFIG_PATH.write_text(
        json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8"
    )


_TEMPLATE = '''"""Cortex plugin: __NAME__."""


def register(api):
    """Called once when the plugin loads. Register hooks on `api`."""

    def before_add(fields):
        # fields: {"title": str, "content": str, "source": str, "source_url": str | None}
        # Return a modified dict to change the note before it's saved,
        # or None/nothing to leave it unchanged.
        return None

    def after_add(note):
        # note: the newly created cortex.models.Note (has .id)
        pass

    def before_delete(note_id):
        # Return False to cancel the deletion.
        return True

    def after_search(query, results):
        # results: list[cortex.models.SearchResult]
        # Return a modified list to filter/reorder, or None to leave as-is.
        return results

    api.on_before_add(before_add)
    api.on_after_add(after_add)
    api.on_before_delete(before_delete)
    api.on_after_search(after_search)
'''


def create_template(name: str) -> Path:
    """Write a blank plugin file to the plugin directory. Raises if it exists."""
    PLUGIN_DIR.mkdir(parents=True, exist_ok=True)
    path = PLUGIN_DIR / f"{name}.py"
    if path.exists():
        raise FileExistsError(f"Plugin zaten var: {path}")
    path.write_text(_TEMPLATE.replace("__NAME__", name), encoding="utf-8")
    return path
