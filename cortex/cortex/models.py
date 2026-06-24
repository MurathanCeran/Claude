"""Dataclass definitions for Cortex domain objects."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Tag:
    id: int
    name: str


@dataclass
class Note:
    id: int
    title: str
    content: str
    source: str  # "manual" | "import" | "web"
    created_at: datetime
    updated_at: datetime
    tags: list[Tag] = field(default_factory=list)

    @property
    def short_content(self) -> str:
        """First 100 chars of content, stripped of newlines."""
        return self.content.replace("\n", " ").strip()[:100]

    @property
    def tag_names(self) -> list[str]:
        return [t.name for t in self.tags]


@dataclass
class SearchResult:
    note: Note
    score: float
    snippet: str
