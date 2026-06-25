"""Tests for clipper.py — HTML parsing, no network calls."""

import pytest
from cortex.clipper import _clean_markdown, _domain_tag, _parse


def test_parse_og_title() -> None:
    html = """<html><head>
        <meta property="og:title" content="OG Başlığı">
        <title>Sayfa Başlığı</title>
    </head><body><article><p>İçerik burada.</p></article></body></html>"""
    title, md = _parse(html, "https://example.com/article")
    assert title == "OG Başlığı"
    assert "İçerik burada" in md


def test_parse_h1_fallback() -> None:
    html = "<html><body><main><h1>Ana Başlık</h1><p>Metin</p></main></body></html>"
    title, md = _parse(html, "https://example.com")
    assert title == "Ana Başlık"


def test_parse_source_url_in_content() -> None:
    html = "<html><body><p>içerik</p></body></html>"
    _, md = _parse(html, "https://docs.python.org/3/")
    assert "https://docs.python.org/3/" in md


def test_noise_tags_removed() -> None:
    html = """<html><body>
        <nav>Gezinme menüsü</nav>
        <article><p>Gerçek içerik</p></article>
        <footer>Alt bilgi</footer>
    </body></html>"""
    _, md = _parse(html, "https://example.com")
    assert "Gezinme menüsü" not in md
    assert "Alt bilgi" not in md
    assert "Gerçek içerik" in md


def test_clean_markdown_removes_excess_newlines() -> None:
    messy = "paragraf 1\n\n\n\n\nparagraf 2"
    result = _clean_markdown(messy)
    assert "\n\n\n" not in result
    assert "paragraf 1" in result
    assert "paragraf 2" in result


def test_domain_tag_extraction() -> None:
    assert _domain_tag("https://docs.python.org/3/library/") == "python.org"
    assert _domain_tag("https://www.github.com/user/repo") == "github.com"
    assert _domain_tag("https://en.wikipedia.org/wiki/Test") == "wikipedia.org"


def test_domain_tag_invalid_url() -> None:
    result = _domain_tag("not-a-url")
    assert isinstance(result, str)
