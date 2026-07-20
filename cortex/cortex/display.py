"""Rich-powered terminal output formatters."""

from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

from rich.columns import Columns
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.tree import Tree

from cortex.models import Backlink, Note, NoteLink, SearchResult

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
    if note.source_url:
        meta += f"\n[dim]URL:[/dim] [link={note.source_url}]{note.source_url}[/link]"
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

    console.print(f"\n[cyan]'{query}'[/cyan] için [bold]{len(results)}[/bold] sonuç:\n")

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


def print_digest(today_notes: list[Note], memory: list[tuple[Note, int]]) -> None:
    """Render daily digest: today's notes + past memories."""
    today_str = __import__("datetime").datetime.utcnow().strftime("%d %B %Y")
    console.rule(f"[bold cyan]Cortex Günlük Özeti — {today_str}[/bold cyan]")

    # Today's notes
    console.print(f"\n[bold]Bugün Eklenen Notlar[/bold] ({len(today_notes)})\n")
    if today_notes:
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("ID", style="dim", width=5)
        table.add_column("Başlık", style="bold white")
        table.add_column("Etiketler", style="green")
        for note in today_notes:
            tags_str = ", ".join(note.tag_names) or "—"
            table.add_row(f"#{note.id}", note.title, tags_str)
        console.print(table)
    else:
        console.print("[dim]  Bugün henüz not eklenmedi.[/dim]")

    # Memory section
    console.print(f"\n[bold]Geçmişten Hatırlatmalar[/bold]\n")
    if not memory:
        console.print("[dim]  Hatırlatılacak eski not bulunamadı.[/dim]")
    else:
        for note, days_ago in memory:
            panel_title = f"[dim]{days_ago} gün önce[/dim]"
            snippet = note.short_content or "—"
            tags_str = "  " + " ".join(f"[green]#{t}[/green]" for t in note.tag_names)
            console.print(
                Panel(
                    f"[bold white]{note.title}[/bold white]\n"
                    f"[dim]{snippet}[/dim]\n"
                    f"{tags_str}",
                    title=panel_title,
                    title_align="right",
                    border_style="dim",
                    expand=False,
                )
            )

    console.rule(style="dim")


def print_ask_result(
    query: str,
    notes: list[tuple[Note, str]],
    answer: Optional[str],
) -> None:
    """Render semantic search result and synthesized answer."""
    console.print(f"\n[cyan]Soru:[/cyan] {query}\n")

    if answer:
        console.print(
            Panel(
                Markdown(answer),
                title="[bold cyan]Claude'un Yanıtı[/bold cyan]",
                border_style="cyan",
            )
        )
    else:
        console.print("[yellow]Yanıt oluşturulamadı.[/yellow]")

    if notes:
        console.print("\n[bold]İlgili Notlar:[/bold]\n")
        table = Table(show_header=True, header_style="bold cyan", show_lines=True)
        table.add_column("ID", width=5, justify="right")
        table.add_column("Başlık", min_width=20)
        table.add_column("Özet", min_width=40)
        table.add_column("Etiketler", min_width=12)
        for note, summary in notes:
            tags_str = ", ".join(note.tag_names) or "—"
            table.add_row(
                str(note.id), note.title, summary or note.short_content, tags_str
            )
        console.print(table)
    else:
        console.print("[yellow]İlgili not bulunamadı.[/yellow]")


def print_note_links(
    note: Note, outgoing: list[NoteLink], incoming: list[Backlink]
) -> None:
    """Render a note's outgoing links (with broken-link status) and backlinks."""
    console.print(f"\n[bold]#{note.id} — {note.title}[/bold]\n")

    console.print("[bold]Verdiği Linkler:[/bold]")
    if outgoing:
        for link in outgoing:
            if link.is_broken:
                console.print(f"  [red]✗ {link.target_title} (kırık link)[/red]")
            else:
                console.print(
                    f"  [green]✓ {link.target_title}[/green] [dim](#{link.target_id})[/dim]"
                )
    else:
        console.print("  [dim]Yok[/dim]")

    console.print("\n[bold]Bu Nota Referans Verenler (Backlink):[/bold]")
    if incoming:
        for bl in incoming:
            console.print(
                f"  [cyan]← {bl.source_title}[/cyan] [dim](#{bl.source_id})[/dim]"
            )
    else:
        console.print("  [dim]Yok[/dim]")
    console.print()


def print_orphans(notes: list[Note]) -> None:
    """Render notes with no incoming or outgoing links."""
    if not notes:
        console.print("[green]Tüm notlar birbirine bağlı — yalnız not yok.[/green]")
        return
    print_note_table(notes, title="Yalnız (Bağlantısız) Notlar")


def print_graph(id_to_title: dict[int, str], links: list[tuple[int, int]]) -> None:
    """Render a simple ASCII graph of note → note links as a Rich Tree."""
    if not links:
        console.print("[yellow]Henüz not ilişkisi yok.[/yellow]")
        return

    outgoing: dict[int, list[int]] = defaultdict(list)
    for source_id, target_id in links:
        outgoing[source_id].append(target_id)

    tree = Tree("[bold cyan]Not Grafiği[/bold cyan]")
    for source_id in sorted(outgoing):
        title = id_to_title.get(source_id, f"#{source_id}")
        branch = tree.add(f"[bold white]{title}[/bold white] [dim](#{source_id})[/dim]")
        for target_id in outgoing[source_id]:
            target_title = id_to_title.get(target_id, f"#{target_id}")
            branch.add(f"[green]→ {target_title}[/green] [dim](#{target_id})[/dim]")

    console.print(tree)


def print_review_card(note: Note, position: int, total: int) -> None:
    """Render a single note as a review flashcard."""
    console.print(f"\n[dim]Tekrar {position}/{total}[/dim]")
    console.print(
        Panel(
            Markdown(note.content[:1500]),
            title=f"[bold white]#{note.id} — {note.title}[/bold white]",
            border_style="cyan",
        )
    )


def print_review_summary(reviewed: int, streak: int) -> None:
    """Render the end-of-session review summary."""
    console.print()
    print_success(f"{reviewed} not tekrar edildi.")
    console.print(f"[bold cyan]Güncel seri:[/bold cyan] {streak} gün")


def print_review_stats(stats: dict) -> None:
    """Render aggregate review statistics."""
    panel = Panel(
        f"[bold cyan]Toplam Tekrar:[/bold cyan] {stats['total_reviews']}\n"
        f"[bold green]Güncel Seri:[/bold green] {stats['streak']} gün",
        title="[bold]Review İstatistikleri[/bold]",
        expand=False,
    )
    console.print(panel)

    if stats["top_notes"]:
        console.print("\n[bold]En Çok Tekrar Edilen Notlar:[/bold]")
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Başlık", style="bold white")
        table.add_column("Tekrar", style="cyan", justify="right")
        for row in stats["top_notes"]:
            table.add_row(f"#{row['id']} {row['title']}", str(row["count"]))
        console.print(table)
    else:
        console.print("[dim]Henüz tekrar yapılmadı.[/dim]")


def print_backup_list(backups: list[Path]) -> None:
    """Render the list of available DB backups."""
    if not backups:
        console.print("[yellow]Henüz yedek alınmamış.[/yellow]")
        return

    table = Table(title="Yedekler", header_style="bold cyan")
    table.add_column("Dosya", style="bold white")
    table.add_column("Boyut", justify="right", style="dim")
    table.add_column("Tarih", style="dim")
    for path in backups:
        size_kb = path.stat().st_size / 1024
        mtime = datetime.fromtimestamp(path.stat().st_mtime).strftime("%d.%m.%Y %H:%M")
        table.add_row(path.name, f"{size_kb:.1f} KB", mtime)
    console.print(table)


def print_plugin_list(plugins: list[dict]) -> None:
    """Render the list of discovered plugins with enabled/loaded status."""
    if not plugins:
        console.print(
            "[yellow]Henüz plugin yok.[/yellow] "
            "~/.cortex/plugins/ klasörüne .py dosyası ekleyin veya "
            "'cortex plugins --new <isim>' kullanın."
        )
        return

    table = Table(title="Pluginler", header_style="bold cyan")
    table.add_column("İsim", style="bold white")
    table.add_column("Durum", justify="center")
    table.add_column("Yüklendi", justify="center")
    for p in plugins:
        status = "[green]açık[/green]" if p["enabled"] else "[dim]kapalı[/dim]"
        loaded = "[green]✓[/green]" if p["loaded"] else "[red]✗[/red]"
        table.add_row(p["name"], status, loaded)
    console.print(table)


def print_error(message: str) -> None:
    console.print(f"[bold red]Hata:[/bold red] {message}")


def print_success(message: str) -> None:
    console.print(f"[bold green]✓[/bold green] {message}")


def print_warning(message: str) -> None:
    console.print(f"[yellow]Uyarı:[/yellow] {message}")
