const E=require('./engine.js')(); const L=E.L;
// ---- 1) TR morfoloji birim testleri ----
const YOR=[["oyna","oynuyor"],["sağla","sağlıyor"],["bekle","bekliyor"],["söyle","söylüyor"],["anla","anlıyor"],["izle","izliyor"],
 ["oku","okuyor"],["yürü","yürüyor"],["taşı","taşıyor"],["gel","geliyor"],["bul","buluyor"],["gör","görüyor"],["yap","yapıyor"],
 ["ol","oluyor"],["bulun","bulunuyor"],["görül","görülüyor"],["kullanıl","kullanılıyor"],["geliş","gelişiyor"],["art","artıyor"],
 ["azal","azalıyor"],["dönüş","dönüşüyor"],["et","ediyor"],["git","gidiyor"],["ye","yiyor"],["de","diyor"],["kaybet","kaybediyor"],
 ["hisset","hissediyor"],["üret","üretiyor"],["yönet","yönetiyor"],["öğret","öğretiyor"],["yet","yetiyor"],["at","atıyor"],
 ["tut","tutuyor"],["yapma","yapmıyor"],["gelme","gelmiyor"],["olma","olmuyor"],["bitir","bitiriyor"],["düşün","düşünüyor"],
 ["iste","istiyor"],["başla","başlıyor"],["etkile","etkiliyor"],["belirle","belirliyor"],["sun","sunuyor"],["göster","gösteriyor"]];
let ok=0, bad=[];
for(const [s,e] of YOR){ const g=L._toYor(s); if(g===e) ok++; else bad.push(s+'→'+g+' (beklenen '+e+')'); }
console.log('TR -ıyor morfoloji: '+ok+'/'+YOR.length+(bad.length?'  HATALAR: '+bad.join(', '):''));
const DI=[["yapıl","yapıldı"],["açıklan","açıklandı"],["kurul","kuruldu"],["geç","geçti"],["git","gitti"],["başla","başladı"],
 ["belirlen","belirlendi"],["gör","gördü"],["düşün","düşündü"],["ortaya çık","ortaya çıktı"],["yaşa","yaşadı"],["öl","öldü"],["kes","kesti"],["bit","bitti"]];
ok=0; bad=[];
for(const [s,e] of DI){ const g=L._toDi(s); if(g===e) ok++; else bad.push(s+'→'+g+' (beklenen '+e+')'); }
console.log('TR -dı morfoloji:   '+ok+'/'+DI.length+(bad.length?'  HATALAR: '+bad.join(', '):''));
// ---- 2) Cümle düzeyi dönüşüm testleri (beklenen tam çıktı) ----
const SENT=[
 ["Eğitim, bireylerin gelişiminde önemli bir rol oynamaktadır.","Eğitim, bireylerin gelişiminde önemli bir yer tutuyor."],
 ["Teknoloji hızla gelişmektedir ve şirketler bunu kullanmaktadırlar.","Teknoloji hızla gelişiyor ve şirketler bunu kullanıyorlar."],
 ["Bu durum öğrencileri olumsuz etkilemektedir. Ayrıca, motivasyonu düşürmektedir.","Bu durum öğrencileri olumsuz etkiliyor. Motivasyonu düşürüyor."],
 ["Araştırma sonuçları açıklanmıştır.","Araştırma sonuçları açıklandı."],
 ["Bu sorun göz ardı edilmemelidir.","Bu sorun unutulmamalı."],
 ["Yetkililer projeye destek vermemektedir.","Yetkililer projeye destek vermiyor."],
 ["Moreover, it is important to note that sleep plays a crucial role in memory.","Sleep matters a lot for memory."],
 ["It is not easy, and we do not know why.","It isn't easy, and we don't know why."],
 ["That is what it is.","That's what it is."],
 ["They leverage cutting-edge tools to facilitate learning.","They use modern tools to help learning."],
 ["The plan is simple — and it works.","The plan is simple, and it works."],
 ["In today's fast-paced world, people cannot rest.","These days, people can't rest."],
];
ok=0; bad=[];
for(const [i,e] of SENT){ const g=L.quickFix(i).text; if(g===e) ok++; else bad.push('\n   GİRDİ: '+i+'\n   ÇIKTI: '+g+'\n   BEKLE: '+e); }
console.log('Cümle dönüşümleri:  '+ok+'/'+SENT.length+bad.join(''));
const EXTRA=[
 ["Solar power is not only cleaner but also increasingly affordable.","Solar power is cleaner and increasingly affordable."],
 ["Bu yöntem sadece ucuz değil, aynı zamanda hızlıdır.","Bu yöntem ucuz ve hızlıdır."],
 ["Climate change is one of the most pressing challenges of our time.","Climate change is a serious problem today."],
];
ok=0; bad=[];
for(const [i,e] of EXTRA){ const g=L.quickFix(i).text; if(g===e) ok++; else bad.push('\n   GİRDİ: '+i+'\n   ÇIKTI: '+g+'\n   BEKLE: '+e); }
console.log('Ek kalıp testleri:  '+ok+'/'+EXTRA.length+bad.join(''));
