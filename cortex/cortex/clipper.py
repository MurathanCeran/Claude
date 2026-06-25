"""Web clipper — fetch a URL, extract content, convert to Markdown."""

from __future__ import annotations

import re
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify

from cortex import db
from cortex.display import print_error

# Tags to strip before markdown conversion (nav, ads, footers, etc.)
_NOISE_TAGS = [
    "script", "style", "noscript", "nav", "footer", "header",
    "aside", "form", "button", "svg", "iframe", "figure",
]

# CSS selectors tried in order; first match wins as main content
_CONTENT_SELECTORS = [
    "article",
    "main",
    '[role="main"]',
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    "#content",
    "body",
]

_TIMEOUT = 10  # seconds
_MAX_BYTES = 5 * 1024 * 1024  # 5 MB


def clip(url: str, tags: list[str] | None = None) -> int | None:
    """
    Fetch URL, extract readable content, save as a note.
    Returns the new note id, or None on failure.
    """
    html = _fetch(url)
    if html is None:
        return None

    title, markdown_content = _parse(html, url)
    note_id = db.create_note(title=title, content=markdown_content, source="web")

    all_tags = list(tags or []) + [_domain_tag(url)]
    db.attach_tags(note_id, [t for t in all_tags if t])

    return note_id


def _fetch(url: str) -> str | None:
    """Download URL and return raw HTML string."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; Cortex-Clipper/1.0; +https://github.com)"
        )
    }
    try:
        resp = requests.get(url, headers=headers, timeout=_TIMEOUT, stream=True)
        resp.raise_for_status()
        content = b""
        for chunk in resp.iter_content(chunk_size=8192):
            content += chunk
            if len(content) > _MAX_BYTES:
                break
        return content.decode(resp.apparent_encoding or "utf-8", errors="replace")
    except requests.exceptions.ConnectionError:
        print_error(f"Bağlantı kurulamadı: {url}")
    except requests.exceptions.Timeout:
        print_error(f"Bağlantı zaman aşımına uğradı: {url}")
    except requests.exceptions.HTTPError as exc:
        print_error(f"HTTP hatası: {exc.response.status_code} — {url}")
    except Exception as exc:  # noqa: BLE001
        print_error(f"Bilinmeyen hata: {exc}")
    return None


def _parse(html: str, url: str) -> tuple[str, str]:
    """Return (title, markdown) from raw HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # Extract <title>
    title_tag = soup.find("title")
    og_title = soup.find("meta", property="og:title")
    h1_tag = soup.find("h1")

    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    elif title_tag:
        title = title_tag.get_text(strip=True)
    elif h1_tag:
        title = h1_tag.get_text(strip=True)
    else:
        title = urlparse(url).netloc

    # Remove noise elements
    for tag in _NOISE_TAGS:
        for el in soup.find_all(tag):
            el.decompose()

    # Find main content block
    content_el = None
    for selector in _CONTENT_SELECTORS:
        content_el = soup.select_one(selector)
        if content_el:
            break

    raw_html = str(content_el) if content_el else str(soup)

    md = markdownify(
        raw_html,
        heading_style="ATX",
        strip=["a", "img"],
        newline_style="backslash",
    )
    md = _clean_markdown(md)

    # Prepend source URL as reference
    md = f"> Kaynak: {url}\n\n" + md

    return title, md


def _clean_markdown(md: str) -> str:
    """Remove excessive blank lines and leading/trailing whitespace."""
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def _domain_tag(url: str) -> str:
    """Extract domain as a tag, e.g. 'docs.python.org' → 'python.org'."""
    try:
        parts = urlparse(url).netloc.lstrip("www.").split(".")
        if len(parts) >= 2:
            return ".".join(parts[-2:])
    except Exception:  # noqa: BLE001
        pass
    return ""
