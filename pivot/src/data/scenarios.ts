export type Definition = {
  term: string;
  description: string;
};

export type ScenarioOption = {
  id: string;
  text: string;
  pros: string;
  cons: string;
  cost: number;
  nextScenarioId: number | null;
  risk: 'low' | 'medium' | 'high' | 'extreme';
  feedback: string;
  ending?: string;
};

export type Scenario = {
  id: number;
  phase: string;
  text: string;
  options: ScenarioOption[];
  info: string;
  definitions: Definition[];
};

export const scenarios: Scenario[] = [
  // ── BÖLÜM 1: KURULUŞ ──────────────────────────────────────────────
  {
    id: 1,
    phase: "Kuruluş",
    text: "Tebrikler! Bir melek yatırımcı fikrine inanarak şirketine 50.000$ yatırım yaptı. İlk kararın çalışma ortamı. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Plazadan ofis tut",
        pros: "Profesyonel görünüm, müşteri güveni",
        cons: "Yüksek sabit maliyet, burn rate artar",
        cost: -12000,
        nextScenarioId: 2,
        risk: "high",
        feedback: "Prestijli ofis güven verdi ama aylık 3.000$ kira seni hızla yakıyor."
      },
      {
        id: "b",
        text: "Coworking space kirala",
        pros: "Düşük maliyet, network imkanı",
        cons: "Özel değil, gürültülü ortam",
        cost: -3000,
        nextScenarioId: 2,
        risk: "medium",
        feedback: "Akıllıca bir tercih. Hem tasarruf ettin hem sektörden insanlarla tanıştın."
      },
      {
        id: "c",
        text: "Evden / garajdan çalış",
        pros: "Sıfır kira maliyeti",
        cons: "Profesyonellikten uzak, motivasyon düşebilir",
        cost: 0,
        nextScenarioId: 2,
        risk: "low",
        feedback: "Paranı korudun. Ama potansiyel ortaklar seni ciddiye almayabilir."
      }
    ],
    info: "Startup'larda 'Burn Rate' (aylık nakit tüketimi) kritik bir metriktir. Sabit giderler ne kadar düşükse, piste o kadar uzun kalırsın.",
    definitions: [
      { term: "Burn Rate", description: "Bir şirketin kârlılığa ulaşmadan önce genel giderler için para harcama hızıdır. Çoğunlukla ay bazında hesaplanır." },
      { term: "Sermaye", description: "Kişinin veya şirketin elinde bulunan nakit para, mal ve varlıklardır." },
      { term: "Bootstrapping", description: "Kişisel tasarruf veya ilk satışlardan elde edilen parayla, dışarıdan yatırım almadan girişim kurma yöntemidir." },
      { term: "Nakit Akışı", description: "Bir işletmeye giren ve çıkan net nakit miktarıdır. Pozitif nakit akışı likit varlıkların arttığını gösterir." }
    ]
  },

  {
    id: 2,
    phase: "Kuruluş",
    text: "Çalışma ortamını kurdun. Şimdi ilk ekibini oluşturman gerekiyor. Ürünü geliştirmek için kime ihtiyacın var?",
    options: [
      {
        id: "a",
        text: "Deneyimli ama pahalı 2 yazılımcı işe al",
        pros: "Hız, kalite, az hata",
        cons: "Aylık 15.000$ maaş yükü",
        cost: -15000,
        nextScenarioId: 3,
        risk: "medium",
        feedback: "Ekibin güçlü ama nakit hızla eriyor. Ürünün hızlı değer üretmesi şart."
      },
      {
        id: "b",
        text: "Stajyerler ve freelancer'larla çalış",
        pros: "Düşük maliyet, esneklik",
        cons: "Yavaş gelişim, yüksek devir oranı",
        cost: -4000,
        nextScenarioId: 3,
        risk: "high",
        feedback: "Tasarruf ettin ama ürün geliştirme süreci oldukça yavaşladı."
      },
      {
        id: "c",
        text: "Equity karşılığı ortak/co-founder bul",
        pros: "Nakit harcamıyorsun, motivasyonu yüksek",
        cons: "Hisse seyrelmesi, gelecekte çatışma riski",
        cost: 0,
        nextScenarioId: 3,
        risk: "medium",
        feedback: "Nakitten tasarruf ettin. Ama ileride vizyon çatışması yaşayabilirsin."
      }
    ],
    info: "Erken dönem startup'larda ekip seçimi şirketi yapan veya yıkan en kritik karardır. 'Hire slow, fire fast' ilkesi burada geçerlidir.",
    definitions: [
      { term: "Sermaye Dağılımı Tablosu", description: "Bir şirketin çıkardığı menkul kıymetlerin toplam tutarını ve bu kıymetlerin sahiplik detaylarını gösteren tablodur." },
      { term: "Cliff", description: "Bir kurucunun veya hisse senedi alıcısının, kısıtlı hisselerinde kısmen hak kazanmasından önce geçen süreyi tanımlar." },
      { term: "Seed Funding", description: "Aile üyeleri, arkadaşlar veya bir yatırımcı tarafından yapılan küçük, erken aşamadaki ilk yatırım turudur." }
    ]
  },

  {
    id: 3,
    phase: "Kuruluş",
    text: "Ekibini kurdun. Şimdi ürününü tanımla. Hangi stratejiyle piyasaya çıkacaksın?",
    options: [
      {
        id: "a",
        text: "MVP ile hızlı çık, kullanıcı geri bildirimiyle geliştir",
        pros: "Hız, erken feedback, first mover avantajı",
        cons: "Eksik ürün kötü ilk izlenim bırakabilir",
        cost: -5000,
        nextScenarioId: 4,
        risk: "medium",
        feedback: "Hızlı hareket ettin. İlk kullanıcılar geldi ama ürünün hâlâ eksik."
      },
      {
        id: "b",
        text: "Full ürünü tamamla, sonra çık",
        pros: "Güçlü ilk izlenim, düşük churn",
        cons: "Geç kalabilirsin, rakipler pazarı ele geçirebilir",
        cost: -18000,
        nextScenarioId: 7,
        risk: "low",
        feedback: "Ürünün güçlü ama rakipler pazarda senden önce yerini aldı."
      }
    ],
    info: "Lean Startup metodolojisi: 'Build → Measure → Learn' döngüsü. MVP (Minimum Viable Product), pazarı test etmenin en ucuz yoludur.",
    definitions: [
      { term: "Prototype", description: "Bir fikri veya ürünü test etmek için oluşturulmuş ilk örnek, model ya da sürümdür." },
      { term: "Launch", description: "Bir girişim fikrinin hayata geçmesi veya bir ürünün aktif olarak pazara sunulmasıdır." },
      { term: "Oluştur-Ölç-Öğren", description: "Bir ürünü sürekli araştırmak ve geliştirmek için kullanılan geri bildirim döngüsüdür." },
      { term: "Ürün Farklılaştırması", description: "Bir ürünü rakiplerinden ayıran kalite, tasarım veya marka gibi özelliklerdir. Talebi artırabilir." }
    ]
  },

  // ── BÖLÜM 2: MVP YOLU ─────────────────────────────────────────────
  {
    id: 4,
    phase: "İlk Ürün",
    text: "MVP'ni yayınladın. İlk kullanıcılar geliyor ama bazı hatalar ve şikayetler var. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Hızlı güncelleme yap, ürünü sürekli iterate et",
        pros: "Kullanıcı memnuniyeti artar, ürün gelişir",
        cons: "Kısa vadede kar yok, geliştirme maliyeti",
        cost: -6000,
        nextScenarioId: 5,
        risk: "low",
        feedback: "Doğru karar. Kullanıcılar ürünün geliştiğini görüyor ve güven oluşuyor."
      },
      {
        id: "b",
        text: "Pazarlamaya yüklen, sorunları görmezden gel",
        pros: "Kısa vadede kullanıcı artışı",
        cons: "Kötü yorumlar yayılır, marka zarar görür",
        cost: -8000,
        nextScenarioId: 6,
        risk: "high",
        feedback: "Yeni kullanıcılar geldi ama memnun olmayanlar çığ gibi büyüdü."
      }
    ],
    info: "Product-Market Fit: Kullanıcıların ürününe gerçekten ihtiyaç duyduğunu gösteren durum. Bunu bulmadan ölçeklenmek tehlikelidir.",
    definitions: [
      { term: "Pazar Segmentasyonu", description: "Bir pazarı benzer ihtiyaç, davranış ya da özelliklere göre gruplara ayırma yöntemidir." },
      { term: "Hedef Pazar", description: "Bir ürünün potansiyel toplam pazarıdır." },
      { term: "Alfa Testi", description: "Üretim öncesi modelin tasarım hatalarını veya işlevsellik eksikliklerini tespit etmek için yapılan kontrollü dahili testtir." }
    ]
  },

  {
    id: 5,
    phase: "İlk Ürün",
    text: "Ürünün gelişti, kullanıcılar memnun. Şimdi gelir modelini belirleme zamanı.",
    options: [
      {
        id: "a",
        text: "Freemium model başlat",
        pros: "Kullanıcı kitlesi hızla büyür",
        cons: "Kısa vadede gelir düşük kalır",
        cost: -3000,
        nextScenarioId: 8,
        risk: "medium",
        feedback: "Kullanıcı sayısı patladı. Ama henüz çok az kişi premium'a geçiyor."
      },
      {
        id: "b",
        text: "Direkt ücretli (subscription) model",
        pros: "Erken nakit akışı",
        cons: "Büyüme yavaşlayabilir",
        cost: 8000,
        nextScenarioId: 8,
        risk: "low",
        feedback: "Gelir gelmeye başladı. Ama rakiplerin ücretsiz alternatifleri seni tehdit ediyor."
      }
    ],
    info: "Freemium Model: Temel özellikler ücretsiz, gelişmiş özellikler ücretlidir. Kullanıcı tabanını hızla büyütür ama dönüşüm oranı genellikle %2-5 arasındadır.",
    definitions: [
      { term: "Talep Esnekliği", description: "Bir ürünün fiyatındaki değişimin, talep edilen miktarı ne ölçüde etkilediğini gösteren ölçüdür." },
      { term: "Kullanıcı Başına Ortalama Gelir (ARPU)", description: "Toplam gelirin kullanıcı sayısına bölünmesiyle elde edilen değerdir." },
      { term: "Müşteri Edinme Maliyeti", description: "Bir müşteriyi edinmek için gereken toplam maliyettir." }
    ]
  },

  {
    id: 6,
    phase: "Kriz",
    text: "Kötü yorumlar sosyal medyada yayıldı. Şirketinin itibarı tehlikede. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Kriz iletişimi yap, özür yayınla ve ürünü düzelt",
        pros: "Güven yeniden inşa edilebilir",
        cons: "Kısa vadede maliyet ve itibar kaybı",
        cost: -10000,
        nextScenarioId: 8,
        risk: "medium",
        feedback: "Dürüst davrandın. Bazı kullanıcılar geri döndü, marka toparlanıyor."
      },
      {
        id: "b",
        text: "Aynı şekilde devam et, umursamazlık göster",
        pros: "Kısa vadede maliyet yok",
        cons: "Marka kalıcı hasar görür, kullanıcılar kaçar",
        cost: 3000,
        nextScenarioId: 14,
        risk: "extreme",
        feedback: "Felaket. Büyük bir teknoloji blogu şirketi hedef aldı. Kullanıcıların %40'ı gitti."
      }
    ],
    info: "Kriz Yönetimi: Hızlı, şeffaf ve özür içeren iletişim, uzun vadede marka değerini korur. Suskunluk veya inkâr genellikle durumu daha da kötüleştirir.",
    definitions: [
      { term: "Sürdürülebilirlik", description: "Şirketin uzun süre ayakta kalabilme kapasitesidir. Aşırı risk sürdürülebilirliği düşürür." },
      { term: "Müşteri Yaşam Döngüsü", description: "Bir müşterinin bir ürünü kullanırken geçtiği aşamalardır." }
    ]
  },

  // ── BÖLÜM 2B: FULL ÜRÜN YOLU ──────────────────────────────────────
  {
    id: 7,
    phase: "İlk Ürün",
    text: "Full ürününü çıkardın. Kaliteli ama rakipler pazarda senden önce yerini aldı. Fiyat stratejin ne olacak?",
    options: [
      {
        id: "a",
        text: "Penetration pricing: Düşük fiyatla pazara gir",
        pros: "Hızlı kullanıcı kazanımı",
        cons: "Marka 'ucuz' algısı oluşabilir",
        cost: -5000,
        nextScenarioId: 9,
        risk: "medium",
        feedback: "Kullanıcılar geldi ama 'Bu kadar mı?' diye düşünüyorlar. Marka algısı biraz zayıfladı."
      },
      {
        id: "b",
        text: "Premium fiyat: Kalite vurgusuyla piyasaya gir",
        pros: "Yüksek marka değeri, sadık müşteri",
        cons: "Büyüme yavaş",
        cost: 10000,
        nextScenarioId: 10,
        risk: "low",
        feedback: "Az ama sadık kullanıcı kitlesi oluşturdun. Büyüme yavaş ama sağlam."
      }
    ],
    info: "Penetration Pricing: Pazara hızlı girmek için düşük fiyat. Price Skimming: Önce yüksek fiyat, sonra düşürme. İkisi farklı marka konumlandırmaları yaratır.",
    definitions: [
      { term: "Esneklik", description: "Fiyattaki küçük bir değişikliğin talepte büyük bir değişikliğe yol açması durumudur." },
      { term: "Piyasa Maliyetinin Üzerinde", description: "Bir ürünün alternatiflerine kıyasla ne kadar daha pahalı olduğunu gösterir." }
    ]
  },

  // ── BÖLÜM 3: BÜYÜME BASKISI ────────────────────────────────────────
  {
    id: 8,
    phase: "Büyüme",
    text: "Kullanıcı tabanın büyüyor. Bir rakip firma seninle aynı pazarda fiyatlarını düşürdü. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Sen de fiyatı düşür",
        pros: "Pazar payını korursun",
        cons: "Kâr marjı düşer, fiyat savaşı başlayabilir",
        cost: -4000,
        nextScenarioId: 11,
        risk: "medium",
        feedback: "Fiyat savaşına girdin. Kullanıcı sayısı arttı ama kâr marjın ciddi daraldı."
      },
      {
        id: "b",
        text: "Fiyatı koru, değer önerini güçlendir",
        pros: "Marka değeri korunur",
        cons: "Bazı fiyat odaklı kullanıcıları kaybedebilirsin",
        cost: -2000,
        nextScenarioId: 11,
        risk: "low",
        feedback: "Bazı kullanıcılar rakibe geçti. Ama seninle kalan kullanıcılar daha sadık."
      },
      {
        id: "c",
        text: "Rakibi satın almayı teklif et",
        pros: "Rekabeti ortadan kaldır, pazar payını artır",
        cons: "Çok yüksek maliyet, entegrasyon riski",
        cost: -20000,
        nextScenarioId: 12,
        risk: "high",
        feedback: "Rakibini satın aldın. Pazar payın büyüdü ama nakit durumun kritik."
      }
    ],
    info: "Rekabetçi Fiyatlandırma: Rakip fiyatlarına göre belirlenen strateji. Uzun vadede fiyat savaşları genellikle tüm oyuncuların zararına sonuçlanır.",
    definitions: [
      { term: "Tam Rekabet", description: "Çok sayıda firmanın benzer ürün sattığı pazar yapısıdır. Fiyatlar üzerinde kontrol düşüktür." },
      { term: "Oligopol", description: "Piyasada az sayıda büyük firmanın olduğu pazar yapısıdır. Rakiplerin kararları çok önemlidir." },
      { term: "Giriş Engelleri", description: "Yeni firmaların pazara girmesini zorlaştıran faktörlerdir (yüksek maliyet, marka gücü)." }
    ]
  },

  {
    id: 9,
    phase: "Büyüme",
    text: "Kullanıcıların arttı ama marka değerin biraz zayıf. Bir influencer ile anlaşma teklifi geldi. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Büyük influencer ile pahalı anlaşma yap",
        pros: "Kitleye hızlı ulaş, marka bilinirliği artar",
        cons: "Yüksek maliyet, ROI garantisi yok",
        cost: -12000,
        nextScenarioId: 11,
        risk: "high",
        feedback: "Büyük erişim sağladın ama harcama çok yüksekti. Dönüşüm oranı beklentinin altında kaldı."
      },
      {
        id: "b",
        text: "Micro-influencer ağı kur, düşük bütçeyle geniş erişim",
        pros: "Maliyet etkin, daha güvenilir algı",
        cons: "Zaman alıcı, yönetim karmaşık",
        cost: -4000,
        nextScenarioId: 11,
        risk: "low",
        feedback: "Akıllıca. Micro-influencer'lar daha niş ve sadık kitlelere ulaştı."
      },
      {
        id: "c",
        text: "Pazarlama yerine ürün geliştirmeye yatır",
        pros: "Ürün kalitesi artar, organik büyüme",
        cons: "Görünürlük artmaz",
        cost: -6000,
        nextScenarioId: 11,
        risk: "medium",
        feedback: "Ürünün daha da iyileşti. Ağızdan ağza yavaş ama güvenilir büyüme geliyor."
      }
    ],
    info: "ROI (Return on Investment): Yatırımın geri dönüşü. Pazarlamada ROI ölçümü zordur; bu yüzden test ve ölçüm kritiktir.",
    definitions: [
      { term: "Tıklama Oranı (CTR)", description: "Belirli bir bağlantıya tıklayan kullanıcı sayısının, o sayfayı ziyaret eden kullanıcı sayısına oranıdır." },
      { term: "Damla Pazarlama Kampanyası", description: "Tekrarlayan pazarlama eylemleri ve reklamlar aracılığıyla müşterileri çekmeyi amaçlayan bir yöntemdir." },
      { term: "Ortalama Satış Tutarı", description: "Her bir satış sözleşmesinin getirdiği ortalama dolar tutarıdır." }
    ]
  },

  {
    id: 10,
    phase: "Büyüme",
    text: "Premium fiyat stratejin çalıştı. Sadık bir müşteri kitlesi var. Şimdi büyüme kararı: ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Niche markete odaklanmaya devam et",
        pros: "Güçlü marka, yüksek kâr marjı",
        cons: "Büyüme tavanı düşük",
        cost: 5000,
        nextScenarioId: 11,
        risk: "low",
        feedback: "Küçük ama çok güçlü bir marka oldun. Büyüme yavaş ama kârlısın."
      },
      {
        id: "b",
        text: "Yeni pazara açıl (uluslararası expansion)",
        pros: "Büyüme potansiyeli çok yüksek",
        cons: "Yüksek maliyet, yerel pazarı tanımıyorsun",
        cost: -15000,
        nextScenarioId: 12,
        risk: "high",
        feedback: "Yeni pazara girdin. Kültürel farklılıklar beklenmedik sorunlar yarattı."
      }
    ],
    info: "International Expansion: Yeni pazarlara girerken yerel regülasyonlar, kültür ve rekabet ortamı dikkatlice analiz edilmelidir.",
    definitions: [
      { term: "Niş Pazar", description: "Geniş pazarın içinde, belirli ihtiyaçlara veya özelliklere sahip dar ve özel bir tüketici grubuna hitap eden pazar türüdür." },
      { term: "Ölçek Ekonomisi", description: "Üretim miktarı arttıkça birim başına maliyetin azalmasıdır. Büyüdükçe daha verimli olma durumudur." },
      { term: "Yer Üstü Riski", description: "İşletmeyi etkileyebilecek siyasi, sosyal veya kültürel faktörlerin riskidir." }
    ]
  },

  // ── BÖLÜM 4: KRİZ VE DÖNÜM NOKTALARI ─────────────────────────────
  {
    id: 11,
    phase: "Olgunlaşma",
    text: "Şirketin büyüdü. Çalışanların maaş artışı talep ediyor. Aynı anda yeni bir pazara girme fırsatı da var. Önce ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Maaşları artır, ekibi mutlu et",
        pros: "Çalışan bağlılığı artar, yetenek kaybı önlenir",
        cons: "Sabit giderler artar",
        cost: -8000,
        nextScenarioId: 13,
        risk: "medium",
        feedback: "Ekip memnun. Verimlilik arttı ve yetenekli çalışanlar şirkette kaldı."
      },
      {
        id: "b",
        text: "Talepleri reddet, fırsata yatır",
        pros: "Kısa vadede nakit korunur",
        cons: "İyi çalışanlar rakiplere geçebilir",
        cost: 0,
        nextScenarioId: 13,
        risk: "high",
        feedback: "İki kıdemli yazılımcın ayrıldı. Ürün geliştirme yavaşladı."
      },
      {
        id: "c",
        text: "Kısmi zam + performans primi sistemi kur",
        pros: "Dengeli çözüm, motivasyon korunur",
        cons: "Orta vadede maliyet artabilir",
        cost: -4000,
        nextScenarioId: 13,
        risk: "low",
        feedback: "Ekip makul buldu. Herkes şirkette kaldı, verimlilik stabil."
      }
    ],
    info: "Çalışan Bağlılığı (Employee Retention): Yetenekli bir çalışanı kaybetmenin maliyeti, o çalışanın yıllık maaşının 1,5-2 katı olarak hesaplanır.",
    definitions: [
      { term: "Fırsat Maliyeti", description: "Bir tercih yapıldığında vazgeçilen en iyi alternatifin sağladığı faydadır. Bir seçimin gizli maliyetidir." },
      { term: "Verimlilik", description: "En az kaynakla en fazla çıktıyı elde etme durumudur. Maliyet avantajı sağlar." }
    ]
  },

  {
    id: 12,
    phase: "Olgunlaşma",
    text: "Yatırımcılar kısa vadeli kâr maksimizasyonu talep ediyor. Uzun vadeli büyüme planın ile çelişiyor. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Yatırımcıları dinle, kısa vadeli kârı artır",
        pros: "Yatırımcı ilişkileri güçlenir, nakit gelir",
        cons: "Uzun vadeli büyüme fırsatları kaçabilir",
        cost: 12000,
        nextScenarioId: 13,
        risk: "medium",
        feedback: "Yatırımcılar memnun. Ama Ar-Ge harcamalarını kestin ve rakipler yenilik konusunda seni geçmeye başladı."
      },
      {
        id: "b",
        text: "Uzun vadeli sürdürülebilir büyüme stratejisini savun",
        pros: "Güçlü temel, gerçek değer yaratımı",
        cons: "Yatırımcı baskısı artar, bazıları çıkabilir",
        cost: -5000,
        nextScenarioId: 13,
        risk: "low",
        feedback: "Bir yatırımcı ayrıldı ama şirketi doğru yolda tutmayı başardın."
      }
    ],
    info: "Shareholder vs Stakeholder Theory: Şirketin sadece hissedarlar için mi yoksa tüm paydaşlar için mi var olduğu sorusu. Uzun vadeli değer yaratımı genellikle ikinci görüşü destekler.",
    definitions: [
      { term: "Kâr Maksimizasyonu", description: "Şirketin en yüksek kârı elde etmeyi hedeflemesidir. Genellikle marjinal gelir = marjinal maliyet noktasında olur." },
      { term: "Marjinal Gelir", description: "Bir birim daha fazla satış yapıldığında elde edilen ek gelirdir." },
      { term: "Sürdürülebilirlik", description: "Şirketin uzun süre ayakta kalabilme kapasitesidir." }
    ]
  },

  {
    id: 13,
    phase: "Olgunlaşma",
    text: "Ürününde küçük bir teknik kusur tespit edildi. Kullanıcılar henüz farkında değil (information asymmetry). Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Ürünü geri çağır (product recall), kullanıcıları bilgilendir",
        pros: "Güven inşa eder, uzun vadeli marka değeri artar",
        cons: "Yüksek kısa vadeli maliyet",
        cost: -15000,
        nextScenarioId: 15,
        risk: "low",
        feedback: "Pahalı ama doğru karar. Kullanıcılar dürüstlüğüne saygı duyuyor."
      },
      {
        id: "b",
        text: "Sessiz kal, satışa devam et",
        pros: "Kısa vadede gelir korunur",
        cons: "Kusur ortaya çıkarsa marka kalıcı hasar görür",
        cost: 8000,
        nextScenarioId: 14,
        risk: "extreme",
        feedback: "Şimdilik kurtuldun. Ama bu bomba her an patlayabilir."
      }
    ],
    info: "Information Asymmetry (Bilgi Asimetrisi): Bir tarafın diğerinden daha fazla bilgiye sahip olduğu durum. Tüketicilerin farkında olmadığı kusurlar yasal ve etik sorumluluk doğurabilir.",
    definitions: [
      { term: "Bilanço", description: "Bir şirketin varlıklarını, gelirlerini ve giderlerini detaylandıran bir belgedir." },
      { term: "Fırsat Maliyeti", description: "Bir tercih yapıldığında vazgeçilen en iyi alternatifin sağladığı faydadır." }
    ]
  },

  {
    id: 14,
    phase: "Kriz",
    text: "Gizlediğin sorun/itibar krizi büyük bir medya kuruluşu tarafından ifşa edildi. Şirketin gündem oldu. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Şeffaf kriz iletişimi yap, hatayı kabul et",
        pros: "Bir kısım güven geri kazanılabilir",
        cons: "Kısa vadede büyük maliyet ve itibar kaybı",
        cost: -18000,
        nextScenarioId: 15,
        risk: "medium",
        feedback: "Zor ama doğru adım. Bazı kullanıcılar geri döndü. Toparlanma başlıyor."
      },
      {
        id: "b",
        text: "Sorumluluğu reddet, hukuki yola git",
        pros: "Kısa vadede zaman kazanabilirsin",
        cons: "Hukuk masrafı, marka tamamen çöker",
        cost: -25000,
        nextScenarioId: 20,
        risk: "extreme",
        feedback: "Felaket. Hukuki süreç uzadı, kullanıcıların büyük çoğunluğu seni terk etti."
      }
    ],
    info: "Reputational Risk: Bir şirketin marka değerinin olumsuz algı nedeniyle düşmesi. Dijital çağda itibar krizleri saatler içinde küresel boyut kazanabilir.",
    definitions: [
      { term: "Yer Üstü Riski", description: "İşletmeyi etkileyebilecek siyasi, sosyal veya kültürel faktörlerin riskidir." },
      { term: "Sürdürülebilirlik", description: "Şirketin uzun süre ayakta kalabilme kapasitesidir. Aşırı risk sürdürülebilirliği düşürür." }
    ]
  },

  // ── BÖLÜM 5: İLERİ AŞAMA ─────────────────────────────────────────
  {
    id: 15,
    phase: "Ölçekleme",
    text: "Şirketin kritik bir büyüme noktasına geldi. Sunucular yetişemiyor, altyapı yetersiz. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Venture Capital'dan büyük yatırım al",
        pros: "Hızlı ölçeklenme, güçlü altyapı",
        cons: "Hisse seyrelmesi, yatırımcı baskısı artar",
        cost: 40000,
        nextScenarioId: 16,
        risk: "high",
        feedback: "Altyapı sorunu çözüldü. Ama artık yatırımcılar her kararında görüş bildiriyor."
      },
      {
        id: "b",
        text: "Organik büyüme, kendi kaynaklarınla ilerle",
        pros: "Kontrol sende kalır",
        cons: "Büyüme yavaş, rakipler önüne geçebilir",
        cost: -10000,
        nextScenarioId: 16,
        risk: "medium",
        feedback: "Kontrolü korudun. Büyüme yavaş ama temeller sağlam."
      },
      {
        id: "c",
        text: "Rakip bir firmayı satın al (inorganic growth)",
        pros: "Hızlı pazar payı, hazır altyapı",
        cons: "Entegrasyon sorunu, yüksek maliyet",
        cost: -22000,
        nextScenarioId: 17,
        risk: "high",
        feedback: "Pazar payın büyüdü. Ama entegrasyon düşündüğünden çok daha zor."
      }
    ],
    info: "Venture Capital (Risk Sermayesi): Yüksek büyüme potansiyeli olan startup'lara hisse karşılığı yapılan yatırım. Yatırımcılar genellikle yönetimde söz hakkı talep eder.",
    definitions: [
      { term: "Melek Yatırımcı Turu", description: "Melek yatırımcıları çekmeye yönelik fonlama turudur." },
      { term: "Accelerator", description: "Küçük işletmelerin ve girişimlerin büyümesine yardımcı olacak fon, danışmanlık, mentorluk ve eğitim desteği sunan organizasyon veya programdır." },
      { term: "Bridge Financing", description: "Yatırımcıların girişimin bir sonraki fon turuna ulaşmasına yardımcı olmak amacıyla yaptıkları kısa vadeli kredi şeklindeki yatırımdır." }
    ]
  },

  {
    id: 16,
    phase: "Ölçekleme",
    text: "Şirketin büyüdü. Yapay zeka entegrasyonu için büyük bir fırsat var. Rakipler de bu yönde hareket ediyor.",
    options: [
      {
        id: "a",
        text: "Hızlı AI entegrasyonu yap",
        pros: "Rekabette öne geç, ürün güçlenir",
        cons: "Yüksek geliştirme maliyeti, hatalı AI kötü kullanıcı deneyimi",
        cost: -20000,
        nextScenarioId: 18,
        risk: "high",
        feedback: "Hızlı hareket ettin. Ürün güçlendi ama birkaç AI hatası kullanıcıları rahatsız etti."
      },
      {
        id: "b",
        text: "Bekle, rakiplerin AI'larını izle ve daha güvenli ilerle",
        pros: "Riski azaltır, rakiplerin hatalarından öğrenirsin",
        cons: "First mover avantajını kaybedebilirsin",
        cost: -3000,
        nextScenarioId: 18,
        risk: "low",
        feedback: "Temkinli davrandın. Rakipler birkaç AI skandalı yaşadı, sen bunlardan kaçındın."
      }
    ],
    info: "AI Entegrasyonu: Yapay zeka ürünlere güçlü özellikler katabilir. Ancak 'hallucination' ve veri gizliliği sorunları ciddi riskler barındırır.",
    definitions: [
      { term: "Giriş Engelleri", description: "Yeni firmaların pazara girmesini zorlaştıran faktörlerdir (yüksek maliyet, marka gücü)." },
      { term: "Ürün Farklılaştırması", description: "Ürünü rakiplerden ayıran özelliklerdir (kalite, tasarım, marka). Talebi artırabilir." }
    ]
  },

  {
    id: 17,
    phase: "Ölçekleme",
    text: "Satın aldığın şirketin entegrasyonu çok zorlanıyor. İki farklı kültür çatışıyor. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Satın alınan şirketi kendi kültürüne entegre et",
        pros: "Tek homojen kültür",
        cons: "Yetenek kaybı, direniş",
        cost: -8000,
        nextScenarioId: 18,
        risk: "medium",
        feedback: "Zorlu bir süreç. Bazı değerli çalışanlar ayrıldı ama kültür birleşti."
      },
      {
        id: "b",
        text: "İki şirketi ayrı markalar olarak tut",
        pros: "Her iki kültür korunur, esneklik",
        cons: "Yönetim karmaşıklığı artar",
        cost: -5000,
        nextScenarioId: 18,
        risk: "low",
        feedback: "Her iki marka da kendi güçlü yönlerini korudu. Yönetim daha karmaşık ama etkili."
      }
    ],
    info: "M&A (Merger & Acquisition): Şirket birleşme ve satın almalarında kültürel entegrasyon, teknik entegrasyondan genellikle daha zor ve kritiktir.",
    definitions: [
      { term: "Acquisition", description: "Bir şirketin diğer şirketin kontrolünü kazanmak için hisselerinin çoğunu veya tamamını satın almasıdır." },
      { term: "Rekabet Matrisi", description: "Bir ürünün rakip bir ürünle karşılaştırılmasını sağlayan bir araçtır." }
    ]
  },

  // ── BÖLÜM 6: FİNAL ────────────────────────────────────────────────
  {
    id: 18,
    phase: "Exit / Zirve",
    text: "Şirketin olgunlaştı. Ürün yaşam eğrisinde zirvedeyken yeni bir karar anı: ürünü nasıl konumlandıracaksın?",
    options: [
      {
        id: "a",
        text: "Yeni ürün çıkar (product cannibalization riskini göze al)",
        pros: "Büyüme devam eder, yenilikçi marka algısı",
        cons: "Mevcut ürün satışları düşebilir",
        cost: -12000,
        nextScenarioId: 19,
        risk: "medium",
        feedback: "Cesur hamle. Eski ürün biraz zarar gördü ama yeni ürün büyük ilgi topladı."
      },
      {
        id: "b",
        text: "Mevcut ürünü rebranding ile yeniden konumlandır",
        pros: "Düşük maliyet, mevcut kitleyi koru",
        cons: "Büyüme sınırlı",
        cost: -5000,
        nextScenarioId: 19,
        risk: "low",
        feedback: "Mevcut kullanıcılar memnun. Ama yeni kullanıcı kazanımı zayıf kaldı."
      },
      {
        id: "c",
        text: "Kullanıcı verisini gelir modeline ekle (data monetization)",
        pros: "Yeni gelir akışı",
        cons: "Ciddi gizlilik riski, marka değeri çöker",
        cost: 15000,
        nextScenarioId: 20,
        risk: "extreme",
        feedback: "Gelir arttı ama bir veri sızıntısı skandalı patlak verdi."
      }
    ],
    info: "Product Life Cycle (Ürün Yaşam Eğrisi): Giriş → Büyüme → Olgunluk → Düşüş. Olgunluk aşamasında yenilik yapılmazsa düşüş kaçınılmazdır.",
    definitions: [
      { term: "Ölçek Ekonomisi", description: "Üretim miktarı arttıkça birim başına maliyetin azalmasıdır." },
      { term: "Aktif Kullanıcılar", description: "Bir ürün veya platformda işlem yapan kullanıcıların ölçülebilir sayısıdır." },
      { term: "Kullanıcı Başına Ortalama Gelir (ARPU)", description: "Toplam gelirin kullanıcı sayısına bölünmesiyle elde edilen değerdir." }
    ]
  },

  {
    id: 19,
    phase: "Exit / Zirve",
    text: "Şirketin güçlü bir konuma geldi. Büyük bir teknoloji şirketi seni satın almak istiyor. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Teklifi kabul et, şirketi sat",
        pros: "Büyük nakit çıkışı, kişisel servet",
        cons: "Şirket üzerindeki kontrol tamamen gidiyor",
        cost: 80000,
        nextScenarioId: null,
        risk: "low",
        ending: "acquisition",
        feedback: "Başarılı bir exit. Şirketini güçlü bir konumda sattın. Kariyerin için harika bir sayfa."
      },
      {
        id: "b",
        text: "Teklifi reddet, bağımsız büyümeye devam et",
        pros: "Tam kontrol, uzun vadede daha büyük değer",
        cons: "Risk devam ediyor, pazar değişebilir",
        cost: 0,
        nextScenarioId: null,
        risk: "medium",
        ending: "independent",
        feedback: "Bağımsızlığını korudun. Şirketin büyümeye devam ediyor. Yol uzun ama söz senindir."
      },
      {
        id: "c",
        text: "IPO'ya çık, halka arz et",
        pros: "Büyük sermaye, marka görünürlüğü",
        cons: "Yatırımcı baskısı, şeffaflık yükümlülüğü, yüksek maliyet",
        cost: 60000,
        nextScenarioId: null,
        risk: "high",
        ending: "ipo",
        feedback: "Halka arza çıktın. Büyük sermaye elde ettin ama artık her kararın kamuoyunun gözü altında."
      }
    ],
    info: "Exit Strategy: Bir girişimcinin şirketten ayrılma veya değer realize etme planı. Acquisition, IPO ve bağımsız büyüme en yaygın üç yoldur.",
    definitions: [
      { term: "Exit", description: "Bir yatırımcının kazançlarını veya zararlarını toparlamak için bir firmadaki hissesini satmasıdır." },
      { term: "Acquisition", description: "Bir şirketin diğer şirketin kontrolünü kazanmak için hisselerinin çoğunu veya tamamını satın almasıdır." },
      { term: "Unicorn", description: "1 milyar doların üzerinde değere ulaşmış startup'lara verilen addır." },
      { term: "Gelecek Değer", description: "Bir varlığın gelecekteki olası değeridir." }
    ]
  },

  {
    id: 20,
    phase: "Kriz / Çöküş",
    text: "Şirketin nakit krizi içinde, marka büyük hasar gördü. Son bir hamlen var. Ne yapacaksın?",
    options: [
      {
        id: "a",
        text: "Acil yatırımcı bul, şirketi kurtar",
        pros: "Hayatta kalma şansı",
        cons: "Çok düşük değerleme ile hisse satmak zorunda kalırsın",
        cost: 20000,
        nextScenarioId: null,
        risk: "high",
        ending: "rescue",
        feedback: "Distress funding aldın. Şirket hayatta ama büyük hisse kaybettin. Yeniden başlama şansın var."
      },
      {
        id: "b",
        text: "Şirketi kapat, varlıkları sat (liquidation)",
        pros: "Borçları kapatırsın, temiz çıkış",
        cons: "Her şey bitiyor",
        cost: 5000,
        nextScenarioId: null,
        risk: "low",
        ending: "bankruptcy",
        feedback: "Kapıları kapattın. Acı ama dürüst bir son. Öğrendiklerin bir dahaki girişimde çok değerli olacak."
      },
      {
        id: "c",
        text: "Şirketi rakibe düşük fiyata sat",
        pros: "Hızlı çıkış, kısmi değer kurtarma",
        cons: "Emeğinin karşılığını alamazsın",
        cost: 15000,
        nextScenarioId: null,
        risk: "medium",
        ending: "firesale",
        feedback: "Düşük fiyata sattın. Tam istediğin son değil ama en azından borçlarından kurtuldun."
      }
    ],
    info: "Liquidation vs Acquisition: Şirket kapanışında varlıkların satılması (liquidation) ile başka bir firma tarafından satın alınması (acquisition) farklı sonuçlar doğurur.",
    definitions: [
      { term: "Bridge Financing", description: "Yatırımcıların girişimin bir sonraki fon turuna ulaşmasına yardımcı olmak amacıyla yaptıkları kısa vadeli kredi şeklindeki yatırımdır." },
      { term: "Breakeven Point", description: "Gelir ve giderin eşitlendiği, kara geçişin başladığı noktadır." },
      { term: "Burn Rate", description: "Bir şirketin kârlılığa ulaşmadan önce genel giderler için para harcama hızıdır." }
    ]
  }
];

/** All definitions across scenarios — used for quiz distractors */
export function getAllDefinitions(): Definition[] {
  return scenarios.flatMap((s) => s.definitions);
}
