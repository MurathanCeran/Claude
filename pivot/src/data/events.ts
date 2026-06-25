// Rastgele piyasa / ekonomi olayları.
// Gerçek piyasalar belirsizdir: aynı kararlar her zaman aynı sonucu vermez.
// Bu sistem oyuna "şans + risk" boyutu ekler ve nakit tamponu tutmanın,
// riske hazırlıklı olmanın değerini öğretir. (Lemonade Stand'in hava durumu,
// Stax'in piyasa dalgalanması mantığı.)

export type MarketEvent = {
  id: string;
  kind: 'positive' | 'negative' | 'neutral';
  title: string;
  text: string;
  /**
   * Bütçeye etki. `percent` verilirse mevcut bütçenin yüzdesi olarak,
   * yoksa `flat` sabit tutar olarak uygulanır. (negatif = kayıp)
   */
  percent?: number;
  flat?: number;
  /** Oyuncuya bırakılan finansal okuryazarlık dersi. */
  lesson: string;
};

export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'inflation',
    kind: 'negative',
    title: 'Enflasyon Sıçradı',
    text: 'Ekonomide enflasyon beklenmedik şekilde yükseldi. Tedarik ve operasyon maliyetlerin arttı.',
    percent: -12,
    lesson:
      'Enflasyon nakdin alım gücünü eritir. Maliyetler oransal arttığı için büyük kasalar oransal olarak daha çok etkilenir — ama nakit tamponu seni ayakta tutar.',
  },
  {
    id: 'viral',
    kind: 'positive',
    title: 'Viral Oldun!',
    text: 'Ürünün sosyal medyada beklenmedik şekilde viral oldu. Organik kullanıcı akını ve ek gelir geldi.',
    percent: 18,
    lesson:
      'Bazı kazançlar şanstır, strateji değil. Beklenmedik geliri tamamen harcamak yerine bir kısmını rezerve ayırmak akıllıcadır.',
  },
  {
    id: 'fx-shock',
    kind: 'negative',
    title: 'Döviz Kuru Şoku',
    text: 'Kur aniden yükseldi; yurt dışından aldığın hizmet ve araçların maliyeti fırladı.',
    flat: -6000,
    lesson:
      'Döviz riski (kur riski) gerçek bir tehdittir. Gelir ve giderini mümkünse aynı para biriminde dengelemek bu riski azaltır.',
  },
  {
    id: 'grant-bonus',
    kind: 'positive',
    title: 'Beklenmedik Destek',
    text: 'Bir hızlandırma programı (akseleratör) seni seçti ve küçük bir nakit destek sağladı.',
    flat: 8000,
    lesson:
      'Hibe ve destek programları nakit akışını rahatlatır. Fırsatları takip etmek, sürekli yatırım aramaktan daha ucuz olabilir.',
  },
  {
    id: 'churn',
    kind: 'negative',
    title: 'Kullanıcı Kaybı (Churn)',
    text: 'Bir rakip agresif kampanya yaptı; bazı kullanıcıların gitti ve gelir geçici düştü.',
    percent: -8,
    lesson:
      'Churn (kullanıcı kaybı oranı) bir sağlık göstergesidir. Tek bir gelir kaynağına bağımlı olmak riski büyütür; sadakat ve çeşitlilik korur.',
  },
  {
    id: 'cost-cut',
    kind: 'positive',
    title: 'Maliyet Optimizasyonu',
    text: 'Ekibin gereksiz harcamaları tespit etti ve süreçleri verimli hale getirdi.',
    flat: 5000,
    lesson:
      'Geliri artırmak kadar gideri kısmak da değer yaratır. Verimlilik, en güvenli "kâr" kaynağıdır.',
  },
  {
    id: 'regulation',
    kind: 'negative',
    title: 'Yeni Regülasyon',
    text: 'Sektörüne yeni bir yasal düzenleme geldi; uyum için tek seferlik masraf yaptın.',
    flat: -4000,
    lesson:
      'Düzenleyici risk (regülasyon) öngörülemez. Yasal uyum bütçesi ayırmak, sürpriz maliyetlerin seni sarsmasını önler.',
  },
  {
    id: 'stable',
    kind: 'neutral',
    title: 'Piyasa Sakin',
    text: 'Bu dönem piyasa dengeli seyretti. Beklenmedik bir gelişme olmadı.',
    flat: 0,
    lesson:
      'Her dönem fırtınalı geçmez. Sakin dönemler, rezerv biriktirmek ve bir sonraki riske hazırlanmak için en iyi zamandır.',
  },
];

/**
 * Belirli olasılıkla rastgele bir olay döndürür; olay yoksa null.
 * Varsayılan tetiklenme şansı %45 — oyunu olaylarla boğmadan belirsizlik katar.
 */
export function rollMarketEvent(chance = 0.45): MarketEvent | null {
  if (Math.random() > chance) return null;
  const index = Math.floor(Math.random() * MARKET_EVENTS.length);
  return MARKET_EVENTS[index];
}

/** Bir olayın bütçeye etkisini hesaplar (yuvarlanmış tam sayı). */
export function eventDelta(event: MarketEvent, currentBudget: number): number {
  if (typeof event.percent === 'number') {
    return Math.round((currentBudget * event.percent) / 100);
  }
  return event.flat ?? 0;
}
