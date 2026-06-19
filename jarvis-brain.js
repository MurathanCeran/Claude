/* ============================================================
   J.A.R.V.I.S — BEYİN (paylaşılan mantık + bilgi veritabanı)
   index.html ve jarvis-tests.html bu dosyayı birlikte kullanır.
   Böylece testler gerçek beyni sınar; mantık iki yerde ayrışmaz.
   window.JARVIS olarak dışa açılır.
   ============================================================ */
(function (root) {
  "use strict";

  /* ---------- Metin normalleştirme ---------- */
  function norm(s){
    return String(s).toLocaleLowerCase("tr-TR")
      .replace(/ı/g,"i").replace(/İ/g,"i").replace(/ç/g,"c").replace(/ğ/g,"g")
      .replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
      .replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  }
  /* ---------- Levenshtein (yanlış duyulanları yakalamak için) ---------- */
  function lev(a,b){
    const m=a.length,n=b.length; if(!m) return n; if(!n) return m;
    const d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);
    for(let j=0;j<=n;j++) d[0][j]=j;
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return d[m][n];
  }
  /* ---------- "Jarvis" uyandırma kelimesi (bulanık) ---------- */
  function matchesWake(text){
    const n = norm(text);
    if (n.includes("jarvis") || n.includes("carvis")) return true;
    return n.split(" ").some(w => w.length>=4 && lev(w,"jarvis")<=2);
  }
  /* ---------- Cümleden "jarvis" ve varyasyonlarını ayıkla ---------- */
  function stripWake(s){
    return s.split(/\s+/).filter(w => !(norm(w).length>=4 && lev(norm(w),"jarvis")<=2) && norm(w)!=="jarvis" && norm(w)!=="carvis").join(" ").trim();
  }

  /* ============================================================
     BİLGİ VERİTABANI — medyanın her alanından.
     Eşleşmezse istemci Wikipedia'ya (canlı medya) düşer; yani sınır yok.
     ============================================================ */
  const KNOWLEDGE = [
    // --- Sağlık & günlük yaşam ---
    { keys:["su iç","ne kadar su","günde kaç bardak su"], a:"Günde yaklaşık 2 ila 2,5 litre, yani 8-10 bardak su önerilir Murathan." },
    { keys:["uyku","kaç saat uyu","ne kadar uyumalı"], a:"Yetişkinler için 7 ila 9 saat uyku idealdir Murathan. Her gün aynı saatte yatıp kalkmak kaliteyi artırır." },
    { keys:["mola","ekran molası","20 20 20","gözlerim yoruldu"], a:"20-20-20 kuralı Murathan: her 20 dakikada bir, 20 saniye, 20 metre uzağa bakın." },
    { keys:["stres","gergin","sakinleş","nefes egzersizi"], a:"4-7-8 nefes tekniği: 4 saniye alın, 7 saniye tutun, 8 saniyede verin Murathan." },
    { keys:["pomodoro","odaklan","verimli çalış","konsantrasyon"], a:"Pomodoro: 25 dakika çalışma, 5 dakika mola. Dört turdan sonra uzun mola Murathan." },
    { keys:["spor","egzersiz","ne kadar hareket"], a:"Haftada en az 150 dakika orta tempolu hareket önerilir Murathan." },
    { keys:["sağlıklı beslen","ne yemeli","beslenme","diyet"], a:"Tabağınızın yarısını sebze-meyveye ayırın, işlenmiş gıdayı azaltın, bol su için Murathan." },
    { keys:["acil","112","acil numara"], a:"Türkiye'de tüm acil durumlar için 112'yi arayın Murathan; sağlık, polis, itfaiye ve jandarma tek numarada." },
    { keys:["ilk yardım","kanama"], a:"Acil durumda önce 112'yi arayın Murathan, ciddi kanamada yaraya temiz bezle baskı uygulayın." },
    { keys:["kalori","günlük kalori"], a:"Ortalama bir yetişkin günde kadınlarda yaklaşık 2000, erkeklerde 2500 kalori tüketir Murathan." },
    { keys:["normal nabız","kalp atışı"], a:"Dinlenme halinde normal nabız dakikada 60 ila 100 atımdır Murathan." },
    { keys:["normal vücut sıcaklığı","ateş kaç derece"], a:"Normal vücut sıcaklığı yaklaşık 36,5 ila 37 derecedir; 38 derece ve üzeri ateş sayılır Murathan." },

    // --- Uzay & astronomi ---
    { keys:["ışık hızı","ışığın hızı"], a:"Işık boşlukta saniyede yaklaşık 299 bin 792 kilometre hızla yol alır Murathan." },
    { keys:["ses hızı","sesin hızı"], a:"Ses, havada saniyede yaklaşık 343 metre hızla ilerler Murathan." },
    { keys:["evrenin yaşı","evren kaç yaşında","big bang"], a:"Evren, Büyük Patlama'dan bu yana yaklaşık 13,8 milyar yaşındadır Murathan." },
    { keys:["dünyanın yaşı","dünya kaç yaşında"], a:"Dünya yaklaşık 4,5 milyar yaşındadır Murathan." },
    { keys:["kaç gezegen"], a:"Güneş sistemimizde sekiz gezegen vardır Murathan: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün." },
    { keys:["en büyük gezegen"], a:"En büyük gezegen Jüpiter'dir Murathan." },
    { keys:["en küçük gezegen"], a:"En küçük gezegen Merkür'dür Murathan." },
    { keys:["kızıl gezegen","mars hangi"], a:"Kızıl Gezegen olarak bilinen Mars'tır Murathan; rengini yüzeyindeki demir oksitten alır." },
    { keys:["güneşe uzaklık","dünya güneş arası"], a:"Dünya ile Güneş arası ortalama 150 milyon kilometredir Murathan." },
    { keys:["aya uzaklık","ay ne kadar uzak"], a:"Dünya ile Ay arası ortalama 384 bin kilometredir Murathan." },
    { keys:["en yakın yıldız","dünyaya en yakın yıldız"], a:"Bize en yakın yıldız Güneş, ondan sonrası ise Proxima Centauri'dir Murathan." },
    { keys:["kara delik nedir"], a:"Kara delik, çekim kuvveti o kadar güçlü olan bir bölgedir ki ışık bile ondan kaçamaz Murathan." },
    { keys:["samanyolu","galaksimiz"], a:"Galaksimiz Samanyolu'dur Murathan; içinde yüz milyarlarca yıldız barındıran çubuklu bir sarmal galaksidir." },
    { keys:["ilk insan ay","aya ilk"], a:"Aya ayak basan ilk insan, 1969'da Apollo 11 göreviyle Neil Armstrong olmuştur Murathan." },

    // --- Coğrafya ---
    { keys:["kaç kıta"], a:"Dünyada yedi kıta vardır Murathan: Asya, Afrika, Avrupa, Kuzey Amerika, Güney Amerika, Avustralya ve Antarktika." },
    { keys:["en yüksek dağ","everest"], a:"Dünyanın en yüksek dağı 8 bin 849 metreyle Everest'tir Murathan." },
    { keys:["en uzun nehir"], a:"Dünyanın en uzun nehri Nil'dir; Amazon ise en büyük su hacmine sahiptir Murathan." },
    { keys:["en büyük okyanus"], a:"En büyük ve en derin okyanus Pasifik Okyanusu'dur Murathan." },
    { keys:["en büyük ülke","yüzölçümü en büyük"], a:"Yüzölçümü en büyük ülke Rusya'dır Murathan." },
    { keys:["en kalabalık ülke"], a:"En kalabalık ülke Hindistan'dır, onu Çin izler Murathan." },
    { keys:["türkiye başkenti","türkiyenin başkenti"], a:"Türkiye'nin başkenti Ankara'dır Murathan." },
    { keys:["türkiye nüfus"], a:"Türkiye'nin nüfusu yaklaşık 85 milyondur Murathan." },
    { keys:["türkiye kaç il","kaç il var"], a:"Türkiye'de 81 il bulunmaktadır Murathan." },
    { keys:["en yüksek dağ türkiye","ağrı dağı"], a:"Türkiye'nin en yüksek dağı 5 bin 137 metreyle Ağrı Dağı'dır Murathan." },
    { keys:["dünya nüfusu"], a:"Dünya nüfusu 8 milyarı aşmıştır Murathan." },
    { keys:["japonya başkenti"], a:"Japonya'nın başkenti Tokyo'dur Murathan." },
    { keys:["fransa başkenti"], a:"Fransa'nın başkenti Paris'tir Murathan." },
    { keys:["amerika başkenti","abd başkenti"], a:"Amerika Birleşik Devletleri'nin başkenti Washington'dur Murathan." },

    // --- Bilim & matematik ---
    { keys:["su kaç derecede kaynar","kaynama"], a:"Saf su deniz seviyesinde 100 derecede kaynar, sıfır derecede donar Murathan." },
    { keys:["yerçekimi"], a:"Dünya'nın yerçekimi ivmesi yaklaşık 9,81 metre bölü saniye karedir Murathan." },
    { keys:["pi sayısı"], a:"Pi sayısı yaklaşık 3,14159'dur; bir çemberin çevresinin çapına oranıdır Murathan." },
    { keys:["dna nedir"], a:"DNA, canlıların genetik bilgisini taşıyan çift sarmal yapıda bir moleküldür Murathan." },
    { keys:["fotosentez nedir"], a:"Fotosentez, bitkilerin güneş ışığı, su ve karbondioksiti kullanarak besin ve oksijen üretmesidir Murathan." },
    { keys:["periyodik tablo kaç element","kaç element"], a:"Periyodik tabloda şu an 118 element bulunmaktadır Murathan." },
    { keys:["kalbin görevi","kalp ne işe yarar"], a:"Kalp, kanı tüm vücuda pompalayarak hücrelere oksijen ve besin taşıyan bir kas organıdır Murathan." },
    { keys:["kemik sayısı","kaç kemik"], a:"Yetişkin bir insan vücudunda 206 kemik bulunur Murathan." },

    // --- Teknoloji ---
    { keys:["yapay zeka nedir"], a:"Yapay zeka, makinelerin öğrenme, akıl yürütme ve problem çözme gibi insana özgü yetenekleri taklit etmesidir Murathan." },
    { keys:["internet nedir"], a:"İnternet, dünya genelindeki bilgisayar ağlarını birbirine bağlayan küresel bir ağdır Murathan." },
    { keys:["byte kaç bit","bayt nedir","bit nedir"], a:"Bir bayt sekiz bittir Murathan; bilgisayarda en küçük adreslenebilir veri birimidir." },
    { keys:["http nedir"], a:"HTTP, web tarayıcıları ile sunucular arasında veri aktarımını sağlayan iletişim protokolüdür Murathan." },

    // --- Tarih ---
    { keys:["cumhuriyet ne zaman","cumhuriyet kaç","cumhuriyet ilan"], a:"Türkiye Cumhuriyeti 29 Ekim 1923'te ilan edilmiştir Murathan." },
    { keys:["atatürk kaç","atatürk ne zaman doğdu"], a:"Mustafa Kemal Atatürk 1881'de Selanik'te doğmuş, 10 Kasım 1938'de vefat etmiştir Murathan." },
    { keys:["birinci dünya savaşı ne zaman"], a:"Birinci Dünya Savaşı 1914 ile 1918 yılları arasında yaşanmıştır Murathan." },
    { keys:["ikinci dünya savaşı ne zaman"], a:"İkinci Dünya Savaşı 1939 ile 1945 yılları arasında yaşanmıştır Murathan." },
    { keys:["istanbul fethi","istanbulun fethi","constantinople","fethedildi","istanbul ne zaman feth"], a:"İstanbul, 1453'te Fatih Sultan Mehmet tarafından fethedilmiş ve bir çağ kapanıp yeni bir çağ açılmıştır Murathan." },

    // --- Marvel / Iron Man (tema) ---
    { keys:["iron man kim","demir adam"], a:"Iron Man, gerçek adıyla Tony Stark, dahi bir mucit ve milyarderdir Murathan; benim de yaratıcımdır sayılır." },
    { keys:["tony stark"], a:"Tony Stark, Stark Industries'in başındaki dahi mucittir Murathan. Beni o tasarladı; senin için elimden gelenin en iyisini yapacağım." },
    { keys:["avengers","yenilmezler"], a:"Avengers, dünyayı korumak için bir araya gelen süper kahraman takımıdır Murathan." },
    { keys:["jarvis ne demek","jarvis açılımı"], a:"Jarvis, 'Just A Rather Very Intelligent System', yani 'Sadece Oldukça Zeki Bir Sistem' demektir Murathan." },

    // ===================== GÜNLÜK HAYAT =====================
    { keys:["hafta sonu mu","bugün hafta sonu","tatil mi"], a:"Bunu sana hemen söyleyeyim: bugünün gününü 'bugün günlerden ne' diye sorarsan tam tarihi veririm; cumartesi ve pazar hafta sonudur Murathan." },
    { keys:["kahvaltıda ne","ne kahvaltı","kahvaltı öner"], a:"Dengeli bir kahvaltı için yumurta, peynir, zeytin, domates, salatalık ve tam tahıllı ekmek iyi gider Murathan. Yanına bol su veya çay ekle." },
    { keys:["akşam ne yesem","ne pişirsem","yemek öner","ne yemek"], a:"Pratik bir akşam yemeği için fırında tavuk ve sebze, makarna ya da mercimek çorbasıyla salata önerebilirim Murathan." },
    { keys:["uykum gelmiyor","uyuyamıyorum","nasıl uyurum"], a:"Uyumadan bir saat önce ekranları bırak, odanı serin ve karanlık tut, derin nefes al Murathan. Kafein ve ağır yemekten kaçın." },
    { keys:["yorgunum","enerjim yok","halsizim"], a:"Kısa bir yürüyüş, bir bardak su ve 10 dakikalık mola enerjini toparlar Murathan. Uzun süre aç kalmadığından da emin ol." },
    { keys:["sabah erken kalk","erken uyan"], a:"Erken kalkmak için her gün aynı saatte yat, alarmı yataktan uzağa koy ve uyanınca perdeleri açıp gün ışığı al Murathan." },
    { keys:["leke çıkar","leke nasıl","kıyafetteki leke"], a:"Çoğu lekeye hemen soğuk suyla müdahale et Murathan. Yağlı lekede bulaşık deterjanı, kan lekesinde soğuk su ve tuz işe yarar; sıcak su lekeyi sabitler, ondan kaçın." },
    { keys:["kravat nasıl bağlanır","kravat bağla"], a:"Basit dört-in-hand düğümü için: geniş ucu ince ucun üzerinden geçir, arkadan dolandır, tekrar öne getir, boyun ilmiğinden yukarı sok ve oluşan halkadan aşağı indirip sıkıştır Murathan." },
    { keys:["yumurta kaç dakika","yumurta haşla"], a:"Kaynar suda: rafadan için 6, kayısı kıvamı için 8, tam katı için 10 dakika haşla Murathan." },
    { keys:["pirinç nasıl","pilav nasıl"], a:"Genel oran bir ölçü pirince bir buçuk ölçü sudur Murathan. Tuzu ekle, kaynayınca kısık ateşte suyunu çekene kadar pişir, sonra demlenmeye bırak." },
    { keys:["nasıl tasarruf","para biriktir","tasarruf"], a:"50-30-20 kuralını dene Murathan: gelirinin yüzde ellisi ihtiyaçlara, otuzu isteklere, yirmisi birikim ve borç ödemeye. Otomatik birikim talimatı çok işe yarar." },
    { keys:["mülakat ipucu","iş görüşmesi","mülakata nasıl"], a:"Mülakat öncesi şirketi araştır, somut örneklerle konuş, sorulara hazırlıklı git ve sonunda sen de soru sor Murathan. Güçlü ama dürüst ol." },
    { keys:["nasıl sunum","sunum ipucu"], a:"İyi bir sunum için her slaytta tek fikir tut, az metin çok görsel kullan, prova yap ve göz teması kur Murathan. Güçlü bir açılış ve net bir kapanış belirle." },
    { keys:["telefon şarjı","pil ömrü","batarya"], a:"Pil sağlığı için telefonu yüzde 20 ile 80 arasında tutmaya çalış, aşırı sıcaktan kaçın ve gece boyu şarjda bırakma Murathan." },
    { keys:["nasıl motive","erteleme","prokrastinasyon"], a:"Ertelemeyi yenmek için işi iki dakikalık ilk adıma böl Murathan. Sadece başla; harekete geçmek motivasyonu getirir, tersi değil." },
    { keys:["su baskını","elektrik kesintisi","deprem anında"], a:"Deprem anında çök-kapan-tutun yap, sağlam bir masanın yanına geç ve sarsıntı bitene kadar bekle Murathan. Asansör ve pencere kenarından uzak dur." },
    { keys:["nasıl özür","özür dile"], a:"İçten bir özür için ne yaptığını net söyle, mazeret üretme, karşının duygusunu kabul et ve telafi için somut bir adım öner Murathan." },

    // ===================== KOMPLİKE KONULAR =====================
    { keys:["görelilik","izafiyet","einstein teorisi"], a:"Einstein'ın göreliliğine göre zaman ve uzay mutlak değildir Murathan. Hızın arttıkça zaman senin için yavaşlar ve kütle uzay-zamanı bükerek yerçekimini oluşturur." },
    { keys:["kuantum","kuantum fiziği","süperpozisyon"], a:"Kuantum fiziği atom altı dünyayı anlatır Murathan. Parçacıklar ölçülene kadar aynı anda birden fazla durumda olabilir; buna süperpozisyon denir." },
    { keys:["bileşik faiz","faiz nasıl işler"], a:"Bileşik faizde kazandığın faiz de faiz getirir Murathan. Yani paran katlanarak büyür; ne kadar erken başlarsan etki o kadar büyük olur." },
    { keys:["enflasyon nedir"], a:"Enflasyon, fiyatların genel seviyesinin zamanla yükselmesidir Murathan. Aynı parayla daha az mal alırsın, yani paranın alım gücü düşer." },
    { keys:["blockchain","blok zinciri","bitcoin nasıl"], a:"Blok zinciri, kayıtların birbirine bağlı bloklar halinde, dağıtık ve değiştirilemez biçimde tutulduğu bir defterdir Murathan. Bitcoin gibi kripto paralar bu teknolojiyle çalışır." },
    { keys:["makine öğrenmesi","machine learning","nasıl öğrenir yapay zeka"], a:"Makine öğrenmesinde bir modele bol veri gösterilir ve model örneklerden örüntüleri kendi çıkarır Murathan. Açıkça programlanmadan tahmin yapmayı öğrenir." },
    { keys:["nasıl çalışır internet","internet nasıl çalışır"], a:"İnternette verin küçük paketlere bölünür, IP adresleriyle adreslenip yönlendiriciler üzerinden hedefe ulaşır ve orada yeniden birleştirilir Murathan. Hepsi saniyenin altında olur." },
    { keys:["dna nasıl çalışır","gen nedir"], a:"DNA'daki diziler genleri oluşturur Murathan. Genler, vücudun protein üretmek için kullandığı talimatlardır; bu proteinler de hücrelerinin nasıl çalışacağını belirler." },
    { keys:["iklim değişikliği","küresel ısınma"], a:"İklim değişikliği, başta fosil yakıtlar olmak üzere insan kaynaklı sera gazlarının atmosferde ısı tutmasıyla gezegenin ısınmasıdır Murathan." },
    { keys:["fotosentez nasıl"], a:"Bitkiler yapraklarındaki klorofil ile güneş ışığını yakalar, su ve karbondioksiti şekere ve oksijene dönüştürür Murathan. Böylece hem beslenir hem de soluduğumuz oksijeni üretir." },

    // ===================== SİNEMA & DİZİ =====================
    { keys:["oscar nedir","akademi ödülü"], a:"Oscar, sinema dünyasının en prestijli ödülüdür Murathan; her yıl Amerikan Film Akademisi tarafından verilir." },
    { keys:["en çok hasılat","en çok kazanan film"], a:"Tüm zamanların en çok hasılat yapan filmleri arasında Avatar, Avengers Endgame ve Titanic başı çeker Murathan." },
    { keys:["star wars nedir","yıldız savaşları"], a:"Star Wars, George Lucas'ın yarattığı, iyi ile kötünün Güç üzerinden mücadelesini anlatan efsanevi bir bilim kurgu serisidir Murathan." },
    { keys:["matrix nedir","matrix filmi"], a:"Matrix, insanlığın farkında olmadan bir bilgisayar simülasyonu içinde yaşadığını anlatan, türünü değiştiren bir bilim kurgu filmidir Murathan." },
    { keys:["inception nedir","başlangıç filmi"], a:"Inception, Christopher Nolan'ın rüya içinde rüya katmanlarını işleyen, gerçeklik algısını sorgulatan bir filmidir Murathan." },
    { keys:["interstellar nedir","yıldızlararası"], a:"Interstellar, insanlığı kurtarmak için solucan deliğinden geçen astronotları anlatan, görelilik temalı bir Nolan filmidir Murathan." },
    { keys:["game of thrones","taht oyunları"], a:"Game of Thrones, Demir Taht için verilen acımasız mücadeleyi anlatan, devasa bir fantastik dizidir Murathan." },
    { keys:["breaking bad"], a:"Breaking Bad, kanser teşhisi konan bir kimya öğretmeninin uyuşturucu dünyasına düşüşünü anlatan, tüm zamanların en çok övülen dizilerinden biridir Murathan." },

    // ===================== MÜZİK =====================
    { keys:["beethoven kim"], a:"Ludwig van Beethoven, klasik müziğin dehalarından biridir Murathan; en ünlü eserleri arasında 5. ve 9. senfonileri vardır ve geç döneminde sağırdı." },
    { keys:["mozart kim"], a:"Mozart, küçük yaşta bestelemeye başlayan, klasik dönemin en yetenekli bestecilerinden biridir Murathan." },
    { keys:["beatles","the beatles"], a:"The Beatles, tüm zamanların en etkili rock grubu kabul edilen, Liverpool çıkışlı İngiliz dörtlüsüdür Murathan." },
    { keys:["bir oktav kaç nota","müzik nota sayısı"], a:"Bir oktavda yarım sesler dahil on iki nota vardır Murathan; temel diziyse do, re, mi, fa, sol, la, si olarak yedi notadır." },
    { keys:["caz nedir","jazz nedir"], a:"Caz, 20. yüzyıl başında Amerika'da doğan, doğaçlama ve senkoplu ritimlere dayanan bir müzik türüdür Murathan." },

    // ===================== VİDEO OYUNLARI =====================
    { keys:["en çok satan oyun","en çok satılan oyun","minecraft"], a:"Tüm zamanların en çok satan video oyunu Minecraft'tır Murathan." },
    { keys:["mario kim","super mario"], a:"Mario, Nintendo'nun maskotu olan, oyun tarihinin en tanınan karakteridir Murathan." },
    { keys:["the witcher oyun","witcher nedir"], a:"The Witcher, canavar avcısı Geralt'ı konu alan, kitaplardan uyarlanmış ünlü bir rol yapma oyunu serisidir Murathan." },
    { keys:["esports nedir","espor nedir"], a:"E-spor, video oyunlarının profesyonel ve rekabetçi düzeyde, turnuvalarla oynandığı bir yarışma alanıdır Murathan." },

    // ===================== EDEBİYAT =====================
    { keys:["don kişot","don quijote"], a:"Don Kişot, Cervantes'in yazdığı, ilk modern roman kabul edilen, hayalperest bir şövalyenin maceralarını anlatan başyapıttır Murathan." },
    { keys:["shakespeare kim"], a:"William Shakespeare, İngiliz edebiyatının en büyük yazarı sayılır Murathan; Hamlet, Romeo ve Juliet, Macbeth gibi eserleriyle ünlüdür." },
    { keys:["suç ve ceza","dostoyevski"], a:"Suç ve Ceza, Dostoyevski'nin, bir cinayetin ardından vicdan ve suçluluğu derinlemesine işleyen romanıdır Murathan." },
    { keys:["nobel edebiyat türk","orhan pamuk"], a:"Nobel Edebiyat Ödülü alan ilk ve tek Türk yazar, 2006'da ödülü kazanan Orhan Pamuk'tur Murathan." },

    // ===================== MİTOLOJİ =====================
    { keys:["zeus kim"], a:"Zeus, Yunan mitolojisinde gök ve şimşeğin tanrısı, Olympos tanrılarının kralıdır Murathan." },
    { keys:["poseidon kim"], a:"Poseidon, Yunan mitolojisinde denizlerin tanrısıdır Murathan; üç çatallı yabası ile bilinir." },
    { keys:["truva atı","truva savaşı"], a:"Truva Atı, Yunanların içine asker saklayıp şehre soktukları dev tahta attır Murathan; bugün gizli tehlikeleri anlatan bir deyim hâline gelmiştir." },
    { keys:["nordik mitoloji","thor kim","odin kim"], a:"Nordik mitolojide Odin tanrıların kralı, Thor ise elindeki çekiç Mjölnir ile gök gürültüsü ve şimşek tanrısıdır Murathan." },

    // ===================== SANAT =====================
    { keys:["mona lisa","monalisa"], a:"Mona Lisa, Leonardo da Vinci'nin gizemli gülümseyişiyle ünlü, dünyanın en tanınan tablosudur Murathan; Louvre Müzesi'nde sergilenir." },
    { keys:["van gogh","yıldızlı gece"], a:"Vincent van Gogh, post-empresyonist ressamdır Murathan; en ünlü eseri Yıldızlı Gece'dir ve hayattayken neredeyse hiç tablo satamamıştır." },
    { keys:["picasso kim"], a:"Pablo Picasso, kübizmin öncüsü, 20. yüzyılın en etkili ressamıdır Murathan." },

    // ===================== HAYVANLAR & DOĞA =====================
    { keys:["en hızlı hayvan","en hızlı kara"], a:"Karadaki en hızlı hayvan çitadır Murathan; kısa mesafede saatte 110 kilometreye ulaşabilir." },
    { keys:["en büyük hayvan","mavi balina"], a:"Yaşamış en büyük hayvan mavi balinadır Murathan; boyu 30 metreyi, ağırlığı 150 tonu bulabilir." },
    { keys:["en uzun yaşayan hayvan"], a:"En uzun yaşayan hayvanlardan bazı kaplumbağa türleri ve Grönland köpek balığı yüzlerce yıl yaşayabilir Murathan." },
    { keys:["arılar neden önemli","arı nedir"], a:"Arılar tozlaşmayı sağlayarak besin zincirinin temelini oluşturur Murathan; pek çok bitkinin üremesi onlara bağlıdır." },
    { keys:["ahtapot kaç kalp","ahtapot"], a:"Ahtapotun üç kalbi ve mavi kanı vardır Murathan; ayrıca son derece zeki bir canlıdır." },

    // ===================== SPOR =====================
    { keys:["dünya kupası kaç yılda","fifa dünya kupası"], a:"FIFA Dünya Kupası dört yılda bir düzenlenir Murathan." },
    { keys:["en çok dünya kupası","en çok kazanan ülke futbol"], a:"En çok Dünya Kupası kazanan ülke beş kupayla Brezilya'dır Murathan." },
    { keys:["olimpiyat kaç yılda","olimpiyatlar"], a:"Olimpiyat Oyunları dört yılda bir düzenlenir; yaz ve kış oyunları dönüşümlü olarak gerçekleşir Murathan." },
    { keys:["bir futbol maçı kaç dakika","futbol süre"], a:"Bir futbol maçı, ikişer devre halinde toplam 90 dakikadır Murathan; üstüne uzatma süresi eklenir." },
    { keys:["basketbol kaç oyuncu","bir basketbol takımı"], a:"Basketbolda her takım sahada beş oyuncuyla oynar Murathan." },
    { keys:["maraton kaç kilometre"], a:"Bir maraton 42,195 kilometredir Murathan." },

    // ===================== YEMEK & MUTFAK =====================
    { keys:["pizza nereden","pizza nerede"], a:"Pizza, İtalya'nın Napoli kentinden dünyaya yayılmıştır Murathan." },
    { keys:["sushi nedir"], a:"Sushi, Japon mutfağına ait, sirkeli pirinçle taze balık veya deniz ürünlerinin bir araya getirildiği bir yemektir Murathan." },
    { keys:["baklava nereden","baklava nedir"], a:"Baklava, ince yufka, fıstık veya ceviz ve şerbetle yapılan, Türk mutfağının dünyaca ünlü tatlısıdır Murathan." },
    { keys:["kahve nereden","kahve kökeni"], a:"Kahvenin kökeni Etiyopya'ya dayanır Murathan; dünyaya ise Yemen ve Osmanlı üzerinden yayılmıştır." },

    // ===================== FELSEFE & DÜŞÜNCE =====================
    { keys:["sokrates kim"], a:"Sokrates, sorular sorarak düşündürme yöntemiyle tanınan, Batı felsefesinin temel taşlarından biridir Murathan." },
    { keys:["düşünüyorum öyleyse varım","descartes"], a:"'Düşünüyorum, öyleyse varım' sözü Descartes'a aittir Murathan; her şeyden şüphe edilebilse de şüphe eden bir zihnin var olduğu kesindir." },
    { keys:["stoacılık","stoa felsefesi"], a:"Stoacılık, kontrol edemediğin şeyleri kabullenip yalnızca kendi tutum ve eylemlerine odaklanmayı öğütleyen bir yaşam felsefesidir Murathan." },

    // ===================== İCATLAR =====================
    { keys:["telefonu kim icat","telefon icat"], a:"Telefonun icadı genellikle 1876'da patent alan Alexander Graham Bell'e atfedilir Murathan." },
    { keys:["ampul kim icat","ampulü kim"], a:"Pratik akkor ampulü geliştiren ve yaygınlaştıran isim Thomas Edison'dur Murathan." },
    { keys:["matbaa kim","matbaayı kim icat"], a:"Hareketli harfli matbaayı 15. yüzyılda Johannes Gutenberg geliştirmiş ve bilgiye erişimi kökten değiştirmiştir Murathan." },
    { keys:["uçağı kim icat","ilk uçak"], a:"İlk motorlu, kontrollü uçuşu 1903'te Wright Kardeşler gerçekleştirmiştir Murathan." },

    // ===================== DÖVÜŞ SANATLARI (genel) =====================
    { keys:["dövüş sanatı nedir","dövüş sanatları nedir"], a:"Dövüş sanatları, kendini savunma, spor, disiplin ve zihinsel gelişim için geliştirilmiş kavga sistemleridir Murathan. Vuruş, tutuş, fırlatma ve yer mücadelesi gibi farklı alanlara odaklanırlar." },
    { keys:["en iyi dövüş sanatı","hangi dövüş sanatı"], a:"En iyi tek bir dövüş sanatı yoktur Murathan; amaca bağlıdır. Sokak savunması için boks ve muay thai, yer hakimiyeti için Brezilya jiu-jitsu, genel kavga için ise karma dövüş sanatları yani MMA çok etkilidir." },
    { keys:["dövüş sanatı başla","hangi sporla başla","yeni başlayan dövüş"], a:"Yeni başlıyorsan boks ya da muay thai temel ayak ve yumruk hissi verir, Brezilya jiu-jitsu ise yer mücadelesini öğretir Murathan. Vücuduna ve hedefine en uygun olanı seçip iyi bir hocayla başlamanı öneririm." },
    { keys:["dövüş sanatı faydaları","dövüş sporu fayda"], a:"Dövüş sanatları kondisyon, refleks, denge ve özgüven kazandırır Murathan. Ayrıca disiplin, stres yönetimi ve öz kontrol gibi zihinsel faydaları da vardır." },
    { keys:["kemer sırası","kuşak renkleri","siyah kuşak"], a:"Çoğu dövüş sanatında ilerleme kuşak renkleriyle gösterilir Murathan; genellikle beyazdan başlayıp siyah kuşağa doğru ilerler. Siyah kuşak ustalığın başlangıcı sayılır, sonu değil." },
    { keys:["karate nedir","karate"], a:"Karate, Japonya'nın Okinawa bölgesinden çıkan, yumruk, tekme, diz ve dirsek vuruşlarına dayanan bir dövüş sanatıdır Murathan. Kata denen kalıplaşmış hareket dizileriyle teknik ve disiplin geliştirilir." },
    { keys:["taekwondo nedir","tekvando","taekwondo"], a:"Taekwondo, Kore kökenli, özellikle yüksek ve hızlı tekmeleriyle bilinen bir dövüş sanatıdır Murathan. Olimpik bir spordur ve esneklik ile mesafe kullanımına büyük önem verir." },
    { keys:["judo nedir","judo"], a:"Judo, Jigoro Kano tarafından kurulan, rakibi dengesini bozarak fırlatma ve yere indirmeye dayanan Japon dövüş sanatıdır Murathan. 'Yumuşaklığın yolu' anlamına gelir ve rakibin gücünü ona karşı kullanır." },
    { keys:["aikido nedir","aikido"], a:"Aikido, saldırının enerjisini yönlendirip rakibi etkisiz hale getirmeye dayanan, eklem kilitleri ve fırlatmalar içeren Japon dövüş sanatıdır Murathan. Saldırganı incitmeden kontrol etme felsefesine sahiptir." },
    { keys:["muay thai nedir","muay thai","thai boks"], a:"Muay Thai, Tayland'ın milli sporudur ve 'sekiz uzvun sanatı' olarak bilinir Murathan; yumruk, tekme, diz ve dirsek olmak üzere sekiz vuruş noktasını birlikte kullanır." },
    { keys:["boks nedir","boks"], a:"Boks, yalnızca yumruklarla, baş hareketi ve ayak çalışmasına dayanan bir dövüş sporudur Murathan. Mesafe ayarı, zamanlama ve savunma konusunda eşsiz bir temel verir." },
    { keys:["kung fu nedir","kung fu","wing chun"], a:"Kung Fu, Çin kökenli yüzlerce stili kapsayan genel bir terimdir Murathan. Wing Chun gibi yakın mesafe stillerinden, hayvan hareketlerini taklit eden akıcı stillere kadar çok geniş bir yelpazesi vardır." },
    { keys:["jiu jitsu nedir","brezilya jiu","bjj","jujitsu"], a:"Brezilya jiu-jitsu, yer mücadelesine, pozisyon kontrolüne, boğma ve eklem kilitlerine dayanan bir dövüş sanatıdır Murathan. Küçük bir kişinin tekniğiyle daha büyük rakibi alt edebilmesi felsefesiyle ünlüdür." },
    { keys:["mma nedir","karma dövüş","ufc nedir"], a:"MMA, yani karma dövüş sanatları, boks, muay thai, güreş ve jiu-jitsu gibi farklı disiplinleri tek bir kurallar setinde birleştiren tam temaslı bir spordur Murathan. UFC bu sporun en büyük organizasyonudur." },
    { keys:["güreş nedir","wrestling"], a:"Güreş, rakibi tutarak dengesini bozma, yere indirme ve kontrol altında tutmaya dayanan dünyanın en eski sporlarından biridir Murathan. Türkiye'de yağlı güreş geleneksel bir milli spordur." },
    { keys:["kickboks nedir","kick boks","kickboks"], a:"Kickboks, boksun yumruk tekniklerini tekmelerle birleştiren bir dövüş sporudur Murathan. Ayakta, vuruş ağırlıklı ve tempolu bir mücadele biçimidir." },
    { keys:["kapoeyra","capoeira"], a:"Capoeira, Brezilya'da köleler tarafından geliştirilen, dans, akrobasi ve müzikle iç içe geçmiş bir dövüş sanatıdır Murathan. Akıcı, ritmik ve aldatıcı hareketleriyle tanınır." },
    { keys:["krav maga","kravmaga"], a:"Krav Maga, İsrail ordusu için geliştirilmiş, kural tanımayan, gerçek tehditleri en hızlı şekilde etkisiz kılmaya odaklı bir kendini savunma sistemidir Murathan. Sporla değil pratik savunmayla ilgilenir." },
    { keys:["vuruş gücü nereden","güç nasıl gelir","kalçadan güç"], a:"Dövüşte gerçek güç koldan değil, yerden başlayıp bacak, kalça ve gövde rotasyonuyla aktarılan kinetik zincirden gelir Murathan. Ayak ve kalça dönmezse vuruş yarı güçte kalır." },
    { keys:["mesafe yönetimi","menzil dövüş","distance dövüş"], a:"Mesafe yönetimi dövüşün belkemiğidir Murathan. Ustalık, rakibi kendi rahat menzilinden çıkarıp seni kendi menzilinde tutmaktır." },
    { keys:["kaldıraç dövüş","kaldıraç jiu","leverage"], a:"Yer mücadelesinde kas gücü değil kaldıraç ve açı belirleyicidir Murathan. Doğru açıyla uygulanan bir kilit, çok daha güçlü bir rakibi bile teslim olmaya zorlar." },
    { keys:["zamanlama dövüş","timing","ritim dövüş"], a:"İleri seviye dövüş hızdan çok zamanlamaya dayanır Murathan. Saldırıyı önceden okuyup tam o boşlukta karşılık vermeye karşı vuruş, yani counter denir." },
    { keys:["nefes dövüş","nefes kontrolü dövüş"], a:"Doğru nefes gücün anahtarıdır Murathan. Vuruş anında keskin nefes verme gövdeyi sıkar ve darbe gücünü artırır." },
    { keys:["zihin dövüş","dövüş felsefesi","savaşçı zihni"], a:"Çoğu dövüş sanatının özünde teknikten çok zihin kontrolü yatar Murathan. Bruce Lee'nin dediği gibi, 'su gibi ol'." },
    { keys:["güç mü teknik mi","teknik mi kuvvet mi"], a:"Genelde teknik, ham kuvvete galip gelir Murathan. İyi bir teknik, az enerjiyle çok iş çıkarır." },
  ];

  /* ---------- Hava durumu kodları ---------- */
  const WEATHER_CODES = {0:"açık",1:"az bulutlu",2:"parçalı bulutlu",3:"kapalı",45:"sisli",48:"kırağılı sis",
    51:"hafif çiseleme",53:"çiseleme",55:"yoğun çiseleme",56:"donan hafif çiseleme",57:"donan çiseleme",
    61:"hafif yağmurlu",63:"yağmurlu",65:"şiddetli yağmurlu",66:"donan hafif yağmur",67:"donan yağmur",
    71:"hafif kar yağışlı",73:"kar yağışlı",75:"yoğun kar yağışlı",77:"kar taneli",80:"hafif sağanak",
    81:"sağanak",82:"şiddetli sağanak",85:"hafif kar sağanağı",86:"yoğun kar sağanağı",
    95:"gök gürültülü fırtına",96:"dolulu fırtına",99:"şiddetli dolulu fırtına"};

  /* ---------- Bilgi araması ---------- */
  function findKnowledge(cmd){
    const n = norm(cmd);
    return KNOWLEDGE.find(it => it.keys.some(k => n.includes(norm(k)))) || null;
  }

  /* ============================================================
     ŞEHİR TANIMA — yalnızca gerçek şehir adlarını yakalar.
     Eskiden cümleden rastgele kelime "şehir" sanılıp hataya yol açıyordu
     (ör. "ne giymeliyim" -> "giymeliyim" şehri aranıyordu). Artık beyaz
     liste: 81 il + büyük dünya şehirleri.
     ============================================================ */
  const CITY_LIST = [
    // Türkiye 81 il (normalize)
    "adana","adiyaman","afyonkarahisar","agri","amasya","ankara","antalya","artvin","aydin","balikesir",
    "bilecik","bingol","bitlis","bolu","burdur","bursa","canakkale","cankiri","corum","denizli",
    "diyarbakir","edirne","elazig","erzincan","erzurum","eskisehir","gaziantep","giresun","gumushane","hakkari",
    "hatay","isparta","mersin","istanbul","izmir","kars","kastamonu","kayseri","kirklareli","kirsehir",
    "kocaeli","konya","kutahya","malatya","manisa","kahramanmaras","mardin","mugla","mus","nevsehir",
    "nigde","ordu","rize","sakarya","samsun","siirt","sinop","sivas","tekirdag","tokat",
    "trabzon","tunceli","sanliurfa","usak","van","yozgat","zonguldak","aksaray","bayburt","karaman",
    "kirikkale","batman","sirnak","bartin","ardahan","igdir","yalova","karabuk","kilis","osmaniye","duzce",
    // büyük dünya şehirleri
    "london","paris","berlin","rome","madrid","amsterdam","vienna","moscow","new york","tokyo",
    "beijing","dubai","cairo","athens","washington","los angeles","barcelona","munich","brussels"
  ];
  const CITY_ALIAS = {
    "afyon":"afyonkarahisar","maras":"kahramanmaras","antep":"gaziantep","urfa":"sanliurfa","icel":"mersin",
    "londra":"london","roma":"rome","viyana":"vienna","moskova":"moscow","pekin":"beijing","atina":"athens",
    "kahire":"cairo","munih":"munich","brüksel":"brussels","newyork":"new york"
  };
  const CITY_SET = new Set(CITY_LIST);
  // Türkçe yer eki ayıkla (ankarada -> ankara, izmirde -> izmir) — tam ad bulunmazsa
  function deSuffix(w){
    const sfx = ["dan","den","tan","ten","da","de","ta","te"];
    for (const s of sfx) if (w.length > s.length+2 && w.endsWith(s)) return w.slice(0, -s.length);
    return w;
  }
  function matchCity(w){
    if (CITY_ALIAS[w]) return CITY_ALIAS[w];
    if (CITY_SET.has(w)) return w;
    const d = deSuffix(w);
    if (d !== w){ if (CITY_ALIAS[d]) return CITY_ALIAS[d]; if (CITY_SET.has(d)) return d; }
    return null;
  }
  function extractCity(cmd){
    const words = norm(cmd).split(" ");
    for (let i=0;i<words.length;i++){
      if (i+1 < words.length && CITY_SET.has(words[i]+" "+words[i+1])) return words[i]+" "+words[i+1];
      const m = matchCity(words[i]);
      if (m) return m;
    }
    return null;
  }

  /* ============================================================
     NİYET SINIFLANDIRICI — komutun hangi yeteneğe ait olduğunu döndürür.
     route() bunu kullanır; testler de bunu sınar (tek doğruluk kaynağı).
     ============================================================ */
  const INTENTS = [
    ["name_set",  ["adımı kaydet","ismimi kaydet","benim adım","benim ismim","bana de ki","bana adımla"]],
    ["name_get",  ["adımı biliyor musun","adım ne","ismim ne","ben kimim"]],
    ["location",  ["neredeyim","konumum nerede","konumumu söyle","ben neredeyim","neresideyim"]],
    ["clothing",  ["ne giy","ne giymeli","ne giyeyim","ne giysem","ne giysem","üstüme ne","üzerime ne","kıyafet öner","kıyafet ne","kıyafet seç","mont giy","montumu","şemsiye almalı","şemsiye lazım","şemsiye gerek","dışarı ne"]],
    ["weather",   ["hava"]],
    ["time",      ["saat kaç","saat ne","saati söyle"]],
    ["date",      ["günlerden ne","bugün ne","tarih","hangi gün","bugün hangi"]],
    ["note_clear",["notları sil","notları temizle","notlarımı sil","notlarımı temizle","notları boşalt"]],
    ["note_add",  ["not al","not et","not düş","şunu yaz","sunu yaz"]],
    ["note_read", ["notlarım","notları oku","notları söyle","notlarımı"]],
    ["reminder",  ["hatırlat","alarm kur","zamanlayıcı","süre kur","dakika sonra","saat sonra"]],
    ["math",      ["hesapla","kaç eder","kaç yapar","artı","eksi","kere","bölü","çarpı","topla","çıkar"]],
  ];
  const CHAT = [
    ["greeting",  ["merhaba","selam","hey","günaydın","iyi akşamlar","iyi günler"]],
    ["identity",  ["adın ne","kimsin","sen kimsin","sen nesin"]],
    ["skills",    ["neler yapabilir","yeteneklerin","ne yapabilirsin","yardım et","komutlar"]],
    ["smalltalk", ["nasılsın","naber","ne haber"]],
    ["thanks",    ["teşekkür","sağol","sağ ol","eyvallah"]],
    ["joke",      ["şaka","espri","güldür","komik bir şey"]],
    ["sleep",     ["kapan","uyu","görüşürüz","kendini kapat","dinlemeyi durdur"]],
  ];

  function classifyIntent(cmd){
    const n = norm(cmd);
    if (!cmd || !n) return "empty";
    const hit = (list) => list.some(k => n.includes(norm(k)));
    for (const [intent, keys] of INTENTS) if (hit(keys)) return intent;
    if (findKnowledge(cmd)) return "knowledge";
    for (const [intent, keys] of CHAT) if (hit(keys)) return intent;
    return "wikipedia";
  }

  root.JARVIS = { norm, lev, matchesWake, stripWake, KNOWLEDGE, WEATHER_CODES, findKnowledge, classifyIntent, extractCity };
  if (typeof module !== "undefined" && module.exports) module.exports = root.JARVIS;

})(typeof window !== "undefined" ? window : globalThis);
