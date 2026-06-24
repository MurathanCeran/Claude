"""Rich-powered terminal output formatters."""

from rich.columns import Columns
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from cortex.models import Note, SearchResult

console = Console()


def print_note_table(notes: list[Note], title: str = "Notlar") -> None:
    """Render a compact table of notes."""
    if not notes:
        console.print("[yellow]Hiç not bulunamadı.[/yellow]")
        return

    table = Table(title=title, show_lines=False, header_style="bold cyan")
    table.add_column("ID", style="dim", width=5, justify="right")
    table.add_column("Başlık", style="bold white", min_width=24)
    table.add_column("Etiketler", style="green", min_width=14)
    table.add_column("Kaynak", style="magenta", width=8)
    table.add_column("Tarih", style="dim", width=12)

    for note in notes:
        tags_str = ", ".join(note.tag_names) if note.tag_names else "—"
        date_str = note.updated_at.strftime("%d.%m.%Y")
        table.add_row(
            str(note.id),
            note.title,
            tags_str,
            note.source,
            date_str,
        )

    console.print(table)


def print_note_detail(note: Note) -> None:
    """Render a full note in a rich panel with markdown."""
    tags_str = " ".join(f"[green]#{t}[/green]" for t in note.tag_names)
    meta = (
        f"[dim]ID:[/dim] {note.id}  "
        f"[dim]Kaynak:[/dim] {note.source}  "
        f"[dim]Oluşturulma:[/dim] {note.created_at.strftime('%d.%m.%Y %H:%M')}  "
        f"[dim]Güncelleme:[/dim] {note.updated_at.strftime('%d.%m.%Y %H:%M')}"
    )
    header = Text.assemble(("● ", "cyan"), (note.title, "bold white"))

    console.print()
    console.print(header)
    console.print(meta)
    if tags_str:
        console.print(tags_str)
    console.rule(style="dim")
    console.print(Markdown(note.content))
    console.print()


def print_search_results(results: list[SearchResult], query: str) -> None:
    """Render search results with scores and snippets."""
    if not results:
        console.print(f"[yellow]'{query}' için sonuç bulunamadı.[/yellow]")
        return

    console.print(
        f"\n[cyan]'{query}'[/cyan] için [bold]{len(results)}[/bold] sonuç:\n"
    )

    table = Table(show_header=True, header_style="bold cyan", show_lines=True)
    table.add_column("ID", width=5, justify="right")
    table.add_column("Başlık", min_width=20)
    table.add_column("Skor", width=6, justify="right")
    table.add_column("Özet", min_width=40)
    table.add_column("Etiketler", min_width=12)

    for r in results:
        score_color = "green" if r.score > 0.5 else "yellow" if r.score > 0.2 else "red"
        tags_str = ", ".join(r.note.tag_names) or "—"
        table.add_row(
            str(r.note.id),
            r.note.title,
            f"[{score_color}]{r.score:.2f}[/{score_color}]",
            r.snippet or r.note.short_content,
            tags_str,
        )

    console.print(table)


def print_stats(stats: dict, tag_stats: list[dict]) -> None:
    """Render aggregate statistics."""
    summary = Panel(
        f"[bold cyan]Toplam Not:[/bold cyan] {stats['notes']}\n"
        f"[bold green]Toplam Etiket:[/bold green] {stats['tags']}\n"
        + "\n".join(
            f"  [dim]{k}:[/dim] {v}" for k, v in stats.get("sources", {}).items()
        ),
        title="[bold]Cortex İstatistikleri[/bold]",
        expand=False,
    )
    console.print(summary)

    if tag_stats:
        console.print("\n[bold]En Çok Kullanılan Etiketler:[/bold]")
        tag_table = Table(show_header=False, box=None, padding=(0, 2))
        tag_table.add_column("Etiket", style="green")
        tag_table.add_column("Not Sayısı", style="cyan", justify="right")
        for row in tag_stats[:10]:
            tag_table.add_row(f"#{row['name']}", str(row["count"]))
        console.print(tag_table)


def print_error(message: str) -> None:
    console.print(f"[bold red]Hata:[/bold red] {message}")


def print_success(message: str) -> None:
    console.print(f"[bold green]✓[/bold green] {message}")


def print_warning(message: str) -> None:
    console.print(f"[yellow]Uyarı:[/yellow] {message}")
