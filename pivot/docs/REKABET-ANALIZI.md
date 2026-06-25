# Pivot — Rekabet Analizi ve Özgünlük Raporu

> Bu belge, Pivot'un piyasadaki benzer finansal okuryazarlık / girişimcilik
> oyunlarıyla karşılaştırmasını, tespit edilen eksikleri ve bu sürümde yapılan
> geliştirmeleri belgeler. TÜBİTAK proje raporundaki **"Literatür / Mevcut
> Durum"** ve **"Özgünlük"** bölümleri için kaynak olarak hazırlanmıştır.

## 1. Amaç ve Hedef Kitle

Pivot, **13-18 yaş gençlere finansal okuryazarlığı** bir girişim simülasyonu
üzerinden oyunlaştırarak öğretmeyi amaçlar. Oyuncu bir şirket kurar, sınırlı
sermaye ile kararlar verir ve bütçe, faiz, hisse, risk ve yatırım kavramlarını
yaşayarak öğrenir.

## 2. Piyasadaki Benzer Oyunlar (Literatür)

| Oyun | Üretici | Öğrettiği | Güçlü Yönü |
|------|---------|-----------|------------|
| **Stax** | Next Gen Personal Finance | Bileşik faiz, piyasa dalgalanması, varlık sınıfları | 20 yılı 20 dakikada yaşatan hızlandırılmış zaman |
| **Bite Club** | Next Gen Personal Finance | Emeklilik için tasarruf, fırsat maliyeti | Eğlenceli yönetim simülasyonu |
| **Shady Sam** | Next Gen Personal Finance | APR, faiz, kredi koşulları | Tersten oynatma (tefeci ol) ile farkındalık |
| **Spent** | McKinney / UMD | Kıtlık altında bütçe, ödünleşim | Güçlü duygusal etki, ödüllü |
| **Financial Football** | Visa | Genel finans bilgisi (quiz) | Spor temasıyla motivasyon |
| **Lemonade Stand** | Klasik | Arz-talep, fiyatlama, belirsizlik | Rastgele olaylar (hava) ile gerçekçilik |

## 3. Eksik Analizi — Pivot (önceki sürüm) vs. Rakipler

Önceki sürümde Pivot teknik olarak temiz ve görsel olarak güçlüydü, ancak
**eğitsel ve bilimsel açıdan** rakiplerin gerisinde kalan kritik boşlukları
vardı:

1. **Öğrenme ölçümü yoktu.** Oyun, öğrencinin bilgisini *gerçekten* artırıp
   artırmadığını ölçmüyordu. TÜBİTAK gibi bilimsel bir değerlendirmede bir
   eğitsel müdahalenin **kanıtlanabilir etkisi** beklenir.
2. **Belirsizlik / risk yoktu.** Aynı kararlar her zaman aynı sonucu veriyordu
   (deterministik). Gerçek finansta ise belirsizlik esastır; Lemonade Stand bile
   bunu hava olaylarıyla modeller.
3. **Quizler yalnızca ezber ölçüyordu.** Terim → tanım eşleştirmesi (Bloom
   taksonomisinde en alt seviye: *hatırlama*). Uygulama/analiz sorusu yoktu.
4. **Kalıcılık yoktu.** Sayfa yenilenince tüm ilerleme ve skor siliniyordu;
   tekrar oynama motivasyonu ve veri birikimi yoktu.
5. **Kişisel finans kavramları zayıftı.** İçerik ağırlıklı girişim odaklıydı;
   bileşik faiz, enflasyon, çeşitlendirme, acil durum fonu gibi temel kişisel
   finansal okuryazarlık kavramları eksikti.

## 4. Bu Sürümde Yapılan Geliştirmeler

### 4.1. Ön-Test / Son-Test ve Öğrenme Kazanımı Ölçümü ⭐ (Özgün katkı)
- Oyundan **önce** (baseline) ve **sonra** uygulanan, 8 soruluk uygulama
  seviyesinde standart bir değerlendirme eklendi (`src/data/assessment.ts`).
- Eğitim araştırmalarında standart olan **normalize öğrenme kazancı (Hake gain)**
  hesaplanır:
  
  `g = (son% − ön%) / (100% − ön%)`
  
- Sonuç ekranında ön-test, son-test ve kazanç oyuncuya gösterilir.
- Bu sayede Pivot artık bir *oyun* değil, **etkisi ölçülebilen bir eğitsel
  müdahale**dir — projenin en güçlü bilimsel farklılaştırıcısı.

### 4.2. Rastgele Piyasa Olayları (Belirsizlik)
- `src/data/events.ts`: enflasyon, döviz şoku, viral büyüme, regülasyon,
  churn gibi 8 olay. Her olay bütçeyi (kimi yüzde, kimi sabit) etkiler ve bir
  **finansal ders** verir.
- Kararlar arasında olasılıkla tetiklenir; her oynanış farklılaşır
  (tekrar oynanabilirlik ↑) ve **nakit tamponu / risk yönetimi** öğretilir.

### 4.3. Kalıcılık ve Skor Tablosu
- `src/lib/storage.ts`: oynanışlar, skorlar ve ölçüm verileri tarayıcıda saklanır.
- Açılışta en iyi skor ve oynanış sayısı; sonuç ekranında skor tablosu gösterilir.
- `aggregateStats()` ile çoklu oturumun ortalama öğrenme kazancı hesaplanabilir
  (saha çalışması / veri toplama için).

### 4.4. Kişisel Finans Derinliği
- Değerlendirme ve olaylar; bileşik faiz, enflasyon, çeşitlendirme, acil durum
  fonu, fırsat maliyeti, nakit akışı vs. kâr gibi temel kavramları kapsar.

## 5. Geliştirme Sonrası Konumlandırma

| Kriter | Önce | Sonra |
|--------|------|-------|
| Öğrenme ölçümü | ✗ | ✓ (ön/son-test + Hake gain) |
| Belirsizlik/risk | ✗ | ✓ (rastgele olaylar) |
| Tekrar oynanabilirlik | Düşük | Yüksek |
| Kalıcılık / veri | ✗ | ✓ (localStorage + skor tablosu) |
| Kişisel finans kapsamı | Dar | Geniş |
| Bilimsel raporlanabilirlik | Zayıf | Güçlü |

## 6. Gelecek Çalışma Önerileri
- Sınıf ortamında **ön-test/son-test ile saha deneyi** (kontrol grubu vs. oyun grubu).
- Çoktan fazla zorluk seviyesi ve uyarlanabilir (adaptive) soru seçimi.
- Sunucu tabanlı anonim veri toplama (şu an yalnızca yerel).
- Sesli geri bildirim ve erişilebilirlik (klavye navigasyonu, kontrast) iyileştirmeleri.
