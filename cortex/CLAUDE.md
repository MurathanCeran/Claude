# Cortex — Proje Kuralları

## Genel
- Python 3.12+, type hints zorunlu
- Raw SQL kullan, ORM yok
- Her fonksiyon max 30 satır — uzarsa böl
- Print yerine Rich console kullan
- Türkçe kullanıcı mesajları, İngilizce kod/değişken isimleri

## Git
- Commit mesajları İngilizce, conventional commits (feat:, fix:, refactor:)
- data/ klasörü .gitignore'da

## Test
- pytest kullan
- Her yeni modül için en az 2 test yaz
- Test dosyaları tests/ altında

## Stil
- Black formatter, 88 karakter satır limiti
- Import sırası: stdlib → third-party → local

## Yapılacaklar (sırayla)
- [x] Faz 1: DB + CRUD
- [ ] Faz 2: Search (FTS5 + TF-IDF)
- [ ] Faz 3: Import sistemi
- [ ] Faz 4: Claude API entegrasyonu (semantic search)
- [ ] Faz 5: Web clipper (URL'den içerik çekme)

## Veritabanı
- Parameterized queries zorunlu (SQL injection yok)
- FTS5 virtual table ile full-text search
- data/cortex.db gitignore'da tutulur

## CLI Komutları
| Komut | Açıklama |
|---|---|
| `cortex add "başlık"` | İnteraktif not ekleme |
| `cortex search "sorgu"` | FTS5 + TF-IDF arama |
| `cortex list` | Son 20 notu listele |
| `cortex show <id>` | Tek not detayı |
| `cortex tag <id> "etiket"` | Not etiketle |
| `cortex import <yol>` | .md dosyaları import et |
| `cortex delete <id>` | Not sil |
| `cortex stats` | İstatistikler |
