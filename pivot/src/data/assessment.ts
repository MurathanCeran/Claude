// Ön-test / Son-test soru bankası.
// Amaç: Oyun bir "eğitsel müdahale" olarak ölçülebilsin. Aynı sorular oyundan
// ÖNCE (ön-test / baseline) ve SONRA (son-test) sorulur; normalize öğrenme
// kazancı (Hake gain) hesaplanır.
//
// Sorular kasıtlı olarak UYGULAMA seviyesindedir (Bloom: uygula/analiz et) —
// salt terim ezberi değil. Hem kişisel finansal okuryazarlığı hem de girişim
// finansmanını kapsar.

export type AssessmentQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  /** options dizisindeki doğru cevabın indeksi */
  correctIndex: number;
  /** Son-testte gösterilen açıklama (ön-testte gizli kalır, ölçümü etkilememek için) */
  explanation: string;
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    topic: 'Bileşik Faiz',
    question:
      'Yıllık %10 bileşik getiriyle yatırılan 1.000 ₺, 2 yıl sonra yaklaşık ne kadar olur?',
    options: ['1.100 ₺', '1.200 ₺', '1.210 ₺', '1.020 ₺'],
    correctIndex: 2,
    explanation:
      'Bileşik faizde faiz, faize de işler. 1. yıl: 1.000 → 1.100. 2. yıl faiz 1.100 üzerinden işler: 1.100 × 1,10 = 1.210 ₺. Zaman, paranın en büyük dostudur.',
  },
  {
    id: 2,
    topic: 'Nakit Yakım Hızı (Burn Rate)',
    question:
      'Kasanda 60.000 ₺ var ve her ay 12.000 ₺ harcıyorsun, gelirin yok. Kaç ay "pist" (runway) süren kalmış?',
    options: ['12 ay', '6 ay', '5 ay', '3 ay'],
    correctIndex: 2,
    explanation:
      'Runway = Nakit / Aylık yakım = 60.000 / 12.000 = 5 ay. Yakım hızını bilmek, ne zaman gelir/yatırım gerektiğini önceden görmeni sağlar.',
  },
  {
    id: 3,
    topic: 'Hisse Seyrelmesi (Dilution)',
    question:
      'Şirketinin %100\'üne sahipsin. Bir yatırımcıya %20 hisse verirsen, şirket sonradan 1.000.000 ₺\'ye satılırsa senin payına ne düşer?',
    options: ['1.000.000 ₺', '800.000 ₺', '200.000 ₺', '500.000 ₺'],
    correctIndex: 1,
    explanation:
      'Hisse verdiğinde gelecekteki kazancını da paylaşırsın. %80 senin: 1.000.000 × 0,80 = 800.000 ₺. Yatırım "bedava para" değildir; gelecekteki değerinden ödersin.',
  },
  {
    id: 4,
    topic: 'Risk Dağıtımı (Çeşitlendirme)',
    question:
      'Birikimini büyütmek isteyen biri için aşağıdakilerden hangisi riski en akıllıca yönetir?',
    options: [
      'Tüm parayı tek bir hisse senedine koymak',
      'Parayı farklı varlık türlerine dağıtmak',
      'Tüm parayı yastık altında nakit tutmak',
      'Parayı tek bir arkadaşın işine yatırmak',
    ],
    correctIndex: 1,
    explanation:
      '"Tüm yumurtaları aynı sepete koyma." Çeşitlendirme, bir varlık değer kaybederken diğerlerinin dengelemesini sağlar; toplam riski düşürür.',
  },
  {
    id: 5,
    topic: 'Acil Durum Fonu',
    question:
      'Beklenmedik bir gider (örneğin ekonomik kriz) geldiğinde bir girişimi/bütçeyi ayakta tutan en kritik tampon nedir?',
    options: [
      'Daha fazla reklam harcaması',
      'Elde tutulan nakit rezervi',
      'Yeni bir ofis kiralamak',
      'Daha çok personel almak',
    ],
    correctIndex: 1,
    explanation:
      'Nakit rezervi (acil durum fonu) belirsizliğe karşı kalkanındır. Krizde elinde nakit olanlar hayatta kalır; kasası boş olanlar batar.',
  },
  {
    id: 6,
    topic: 'Enflasyon',
    question:
      'Yıllık enflasyon %30 iken parayı faizsiz, sıfır getiriyle nakit tutarsan bir yıl sonra paranın alım gücüne ne olur?',
    options: [
      'Artar',
      'Aynı kalır',
      'Yaklaşık %30 azalır',
      'İkiye katlanır',
    ],
    correctIndex: 2,
    explanation:
      'Enflasyon, paranın alım gücünü eritir. Getirisi enflasyonun altında kalan para reel olarak değer kaybeder. "Boşta duran para" aslında kaybeden paradır.',
  },
  {
    id: 7,
    topic: 'Nakit Akışı vs Kâr',
    question:
      'Bir şirket kâğıt üzerinde kârlı görünüyor ama maaşları ödeyecek nakidi yok. Bu durum en çok neyi gösterir?',
    options: [
      'Kâr ve nakit akışı aynı şeydir',
      'Şirketin sorunu yoktur',
      'Kârlı olmak nakit akışını garanti etmez',
      'Şirket kesinlikle zarardadır',
    ],
    correctIndex: 2,
    explanation:
      'Kâr bir muhasebe kavramı; nakit akışı ise kasaya gerçekten giren/çıkan paradır. Kârlı ama nakitsiz şirketler iflas edebilir — nakit kraldır.',
  },
  {
    id: 8,
    topic: 'Fırsat Maliyeti',
    question:
      '20.000 ₺\'ni ya pahalı bir ofise ya da ürün geliştirmeye harcayabilirsin. Ofisi seçersen "fırsat maliyetin" nedir?',
    options: [
      'Ödediğin 20.000 ₺',
      'Vazgeçtiğin ürün geliştirmenin getirisi',
      'Ofisin kira bedeli',
      'Hiçbir maliyet yoktur',
    ],
    correctIndex: 1,
    explanation:
      'Fırsat maliyeti, bir seçim yaparken vazgeçtiğin en iyi alternatifin değeridir. Akıllı karar, sadece harcamayı değil, "vazgeçtiğini" de hesaba katar.',
  },
];

export const ASSESSMENT_COUNT = ASSESSMENT_QUESTIONS.length;

/** Doğru sayısından yüzde hesaplar (0-100). */
export function toPercent(correct: number): number {
  if (ASSESSMENT_COUNT === 0) return 0;
  return Math.round((correct / ASSESSMENT_COUNT) * 100);
}

/**
 * Normalize öğrenme kazancı (Hake gain):
 *   g = (son% - ön%) / (100% - ön%)
 * Eğitim araştırmalarında bir müdahalenin etkisini ölçmenin standart yoludur.
 * Ön-test zaten %100 ise tanımsızdır; bu durumda 1 (tam) döndürürüz.
 */
export function normalizedGain(prePercent: number, postPercent: number): number {
  if (prePercent >= 100) return 1;
  return (postPercent - prePercent) / (100 - prePercent);
}

/** Hake kazancını okunabilir bir seviyeye çevirir. */
export function gainLevel(gain: number): { label: string; desc: string } {
  if (gain >= 0.7)
    return {
      label: 'Yüksek Kazanım',
      desc: 'Oyun, konuları kavramanda büyük bir sıçrama sağladı.',
    };
  if (gain >= 0.3)
    return {
      label: 'Orta Kazanım',
      desc: 'Bilgini gözle görülür biçimde geliştirdin.',
    };
  if (gain > 0)
    return {
      label: 'Düşük Kazanım',
      desc: 'Biraz ilerleme var; tekrar oynayarak pekiştirebilirsin.',
    };
  return {
    label: 'Kazanım Yok',
    desc: 'Bu sefer fark oluşmadı — kavramları tekrar gözden geçir ve yeniden dene.',
  };
}
