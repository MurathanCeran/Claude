"""Typer CLI — all Cortex commands."""

from __future__ import annotations

import sys
from typing import Annotated, Optional

import typer
from rich.prompt import Confirm, Prompt

from cortex import clipper, db, digest, importer, search, semantic
from cortex.display import (
    console,
    print_ask_result,
    print_digest,
    print_error,
    print_note_detail,
    print_note_table,
    print_search_results,
    print_stats,
    print_success,
    print_warning,
)

app = typer.Typer(
    name="cortex",
    help="Cortex — kişisel bilgi tabanı CLI",
    no_args_is_help=True,
    pretty_exceptions_show_locals=False,
)


@app.callback(invoke_without_command=True)
def _init(_ctx: typer.Context) -> None:
    """Ensure DB is ready before every command."""
    db.init_db()


@app.command("add")
def cmd_add(
    title: Annotated[str, typer.Argument(help="Not başlığı")],
    content: Annotated[Optional[str], typer.Option("--content", "-c", help="Not içeriği")] = None,
    tags: Annotated[Optional[str], typer.Option("--tags", "-t", help="Virgülle ayrılmış etiketler")] = None,
) -> None:
    """Yeni not ekle."""
    if content is None:
        console.print("[dim]Not içeriğini girin (bitirmek için boş satır + Enter):[/dim]")
        lines: list[str] = []
        try:
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
        except EOFError:
            pass
        content = "\n".join(lines).strip()

    if not content:
        print_error("İçerik boş olamaz.")
        raise typer.Exit(1)

    note_id = db.create_note(title=title, content=content)

    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        db.attach_tags(note_id, tag_list)

    print_success(f"Not eklendi. ID: [bold]{note_id}[/bold]  Başlık: [cyan]{title}[/cyan]")


@app.command("list")
def cmd_list(
    all_notes: Annotated[bool, typer.Option("--all", "-a", help="Tüm notları getir")] = False,
    tag: Annotated[Optional[str], typer.Option("--tag", "-t", help="Etikete göre filtrele")] = None,
) -> None:
    """Son notları listele."""
    limit = 0 if all_notes else 20
    notes = db.list_notes(limit=limit or 10_000, tag=tag)
    title = "Tüm Notlar" if all_notes else "Son 20 Not"
    if tag:
        title += f" — #{tag}"
    print_note_table(notes, title=title)


@app.command("show")
def cmd_show(
    note_id: Annotated[int, typer.Argument(help="Not ID")],
) -> None:
    """Bir notu detaylı göster."""
    note = db.get_note(note_id)
    if note is None:
        print_error(f"#{note_id} numaralı not bulunamadı.")
        raise typer.Exit(1)
    print_note_detail(note)


@app.command("search")
def cmd_search(
    query: Annotated[str, typer.Argument(help="Arama sorgusu")],
    limit: Annotated[int, typer.Option("--limit", "-n", help="Maksimum sonuç sayısı")] = 10,
) -> None:
    """Notlarda arama yap (FTS5 + TF-IDF)."""
    results = search.search(query, limit=limit)
    print_search_results(results, query)


@app.command("tag")
def cmd_tag(
    note_id: Annotated[int, typer.Argument(help="Not ID")],
    tags: Annotated[str, typer.Argument(help="Virgülle ayrılmış etiketler")],
) -> None:
    """Bir nota etiket ekle."""
    note = db.get_note(note_id)
    if note is None:
        print_error(f"#{note_id} numaralı not bulunamadı.")
        raise typer.Exit(1)

    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    db.attach_tags(note_id, tag_list)
    print_success(f"Etiketler eklendi: [green]{', '.join(tag_list)}[/green]")


@app.command("import")
def cmd_import(
    path: Annotated[str, typer.Argument(help="Markdown dosyası veya klasör yolu")],
) -> None:
    """Markdown dosyalarını import et."""
    console.print(f"[cyan]Import başlıyor:[/cyan] {path}")
    imported, skipped = importer.import_path(path)
    print_success(f"Import tamamlandı: [bold]{imported}[/bold] eklendi, {skipped} atlandı.")


@app.command("delete")
def cmd_delete(
    note_id: Annotated[int, typer.Argument(help="Silinecek not ID")],
    force: Annotated[bool, typer.Option("--force", "-f", help="Onay sormadan sil")] = False,
) -> None:
    """Bir notu sil."""
    note = db.get_note(note_id)
    if note is None:
        print_error(f"#{note_id} numaralı not bulunamadı.")
        raise typer.Exit(1)

    if not force:
        confirmed = Confirm.ask(
            f"[yellow]'{note.title}'[/yellow] adlı not silinecek. Emin misiniz?"
        )
        if not confirmed:
            print_warning("Silme iptal edildi.")
            raise typer.Exit(0)

    db.delete_note(note_id)
    print_success(f"Not #{note_id} silindi.")


@app.command("stats")
def cmd_stats() -> None:
    """Genel istatistikleri göster."""
    stats = db.db_stats()
    tags = db.tag_stats()
    print_stats(stats, tags)


@app.command("clip")
def cmd_clip(
    url: Annotated[str, typer.Argument(help="Kaydedilecek web sayfası URL'i")],
    tags: Annotated[Optional[str], typer.Option("--tags", "-t", help="Virgülle ayrılmış etiketler")] = None,
) -> None:
    """Web sayfasını markdown olarak kaydet."""
    console.print(f"[cyan]Çekiliyor:[/cyan] {url}")
    tag_list = [t.strip() for t in tags.split(",")] if tags else []
    note_id = clipper.clip(url, tags=tag_list)
    if note_id is None:
        raise typer.Exit(1)
    note = db.get_note(note_id)
    if note:
        print_success(
            f"Kaydedildi. ID: [bold]{note_id}[/bold]  Başlık: [cyan]{note.title}[/cyan]"
        )
        console.print(f"[dim]Etiketler: {', '.join(note.tag_names)}[/dim]")


@app.command("digest")
def cmd_digest(
    memory_days: Annotated[int, typer.Option("--days", "-d", help="Kaç gün öncesinden hatırlat")] = 7,
    memory_count: Annotated[int, typer.Option("--count", "-n", help="Kaç not hatırlatılsın")] = 3,
) -> None:
    """Günlük özet: bugünün notları + geçmişten hatırlatmalar."""
    today_notes = digest.get_today_notes()
    memory = digest.get_memory_notes(min_days=memory_days, count=memory_count)
    print_digest(today_notes, memory)


@app.command("ask")
def cmd_ask(
    query: Annotated[str, typer.Argument(help="Doğal dil sorusu")],
) -> None:
    """Semantik arama yap ve Claude'dan yanıt al."""
    if semantic.get_client() is None:
        print_warning("ANTHROPIC_API_KEY bulunamadı. FTS5 aramasına geçiliyor...")
        results = search.search(query, limit=10)
        print_search_results(results, query)
        return

    console.print(f"[cyan]Semantik arama çalışıyor...[/cyan]")
    notes, answer = semantic.ask(query)
    print_ask_result(query, notes, answer)


@app.command("reindex")
def cmd_reindex(
    force: Annotated[
        bool, typer.Option("--force", "-f", help="Var olan özetleri de yenile")
    ] = False,
) -> None:
    """Tüm notlar için Claude özetleri oluştur."""
    if semantic.get_client() is None:
        print_warning("ANTHROPIC_API_KEY bulunamadı. Yeniden indeksleme yapılamıyor.")
        raise typer.Exit(1)

    if force:
        db.delete_all_summaries()
        console.print("[dim]Mevcut özetler silindi.[/dim]")

    notes = db.get_notes_without_summaries()
    if not notes:
        print_success("Tüm notların özeti zaten mevcut.")
        return

    console.print(f"[cyan]{len(notes)} not için özet oluşturuluyor...[/cyan]")
    created, failed = semantic.reindex_all()
    print_success(f"Tamamlandı: [bold]{created}[/bold] özet oluşturuldu, {failed} başarısız.")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
