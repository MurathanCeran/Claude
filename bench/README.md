# bench — dürüst doğruluk testleri

Test setleri ve koşucular repo'da tutulur ki bir daha kaybolmasın ve herkes sonuçları tekrar üretebilsin.

| Komut | Ne yapar |
|---|---|
| `node bench/run.js` | Motoru dev setlerinde ölçer (recovered, humanpd, hold1, hold2). `V=1` ile kaçakları listeler. |
| `node bench/run.js hold3` | Holdout-3 — v25 öncesi kilitlendi; **üzerinde ayar yapılmaz**, sürüm başına bir kez ölçülür. |
| `node bench/regress.js` | Motor + UI mantığı + ısı haritası + yerel araçlar regresyonu (0 hata beklenir). |
| `node bench/features.js` | API'siz özelliklerin (Hızlı Düzelt, Paragraf haritası, Okunabilirlik) ayrı doğruluk testleri. |

Setler: `humanpd.js` / `hold3.js` insan metinleri kamu malı verbatim (`src:"pd"`); `src:"synth"` olanlar insan-üslubu taklididir ve gerçek-insan rakamına katılmaz. `recovered.js` önceki oturumlardan kurtarılan, çoğu zor (eski kaçak) vakalardır.
