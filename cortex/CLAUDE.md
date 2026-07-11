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
- [x] Faz 2: Search (FTS5 + TF-IDF)
- [x] Faz 3: Import sistemi
- [x] Faz 4: Claude API entegrasyonu (semantic search)
- [x] Faz 5: Web clipper (URL'den içerik çekme)
- [x] Faz 6: Not ilişkileri ve graf ([[link]] sistemi)
- [x] Faz 7: Günlük not sistemi ve spaced repetition (Leitner)
- [x] Bonus: Günlük özet (digest) komutu

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
| `cortex clip <url>` | Web sayfasını markdown olarak kaydet |
| `cortex digest` | Günlük özet: bugünün notları + geçmişten hatırlatmalar |
| `cortex ask "soru"` | Semantik arama + Claude'dan bağlamsal yanıt |
| `cortex reindex` | Tüm notlar için Claude özetleri oluştur |
| `cortex links <id>` | Notun verdiği ve aldığı linkleri göster |
| `cortex orphans` | Hiçbir yere bağlı olmayan notları listele |
| `cortex graph` | Not ilişki haritasını ASCII ağaç olarak göster |
| `cortex daily` | Bugünün günlük notunu aç veya oluştur |
| `cortex review` | Bugün tekrar edilecek notları Leitner sistemiyle göster |
| `cortex review --stats` | Toplam tekrar sayısı, seri ve en çok tekrar edilen notlar |
