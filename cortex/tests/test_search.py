"""Tests for search.py TF-IDF ranking."""

import pytest
from pathlib import Path

import cortex.db as db
from cortex.search import search


@pytest.fixture(autouse=True)
def tmp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()


def _seed() -> None:
    db.create_note("Python Temelleri", "Python programlama list dict tuple")
    db.create_note("Makine Öğrenmesi", "scikit-learn numpy pandas veri bilimi Python")
    db.create_note("Web Geliştirme", "Django Flask REST API Python backend")
    db.create_note("JavaScript ES6", "arrow function promise async await JS")


def test_search_returns_results() -> None:
    _seed()
    results = search("Python", limit=5)
    assert len(results) >= 1
    assert all(r.score >= 0 for r in results)


def test_search_no_results() -> None:
    _seed()
    results = search("xyzzyquux")
    assert results == []


def test_search_ranking_order() -> None:
    _seed()
    results = search("Python programlama", limit=5)
    # Scores should be descending
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)


def test_search_result_has_snippet() -> None:
    _seed()
    results = search("scikit", limit=3)
    assert len(results) >= 1
    assert results[0].snippet != ""


def test_search_single_note() -> None:
    db.create_note("Tek Not", "yalnız içerik")
    results = search("yalnız")
    assert len(results) == 1
    assert results[0].score == 1.0
