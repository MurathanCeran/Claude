const E=require('./engine.js')(); const L=E.L;
const fs=require('fs'); const src=fs.readFileSync(__dirname+'/../ai-content-detector.html','utf8');
const excWords=new Set((src.match(/var exc = \{([^}]*)\}/)[1].match(/"([a-z]+)"/g)||[]).map(x=>x.replace(/"/g,'')));
// Belirsiz olmayan (sözlüklerde tek okunuşlu) İngilizce kelimeler — gerçek hece sayıları
const W={1:"cat dog strength through straight breathe friend school thought judge smile game cake tree phone house night bread clock stone",
2:"table little happy water apple garden music paper window simple sister under open river mountain morning button candle doctor teacher yellow purple kitchen sometimes pencil rabbit silver monkey basket written became hello today alone believe decide complete forget behind careful playground princess shoulder against problem",
3:"banana elephant computer important together wonderful holiday remember tomato animal hospital energy potato octopus dinosaur umbrella festival uniform telephone underneath already discover president yesterday understand history imagine beginning terrible vacation",
4:"education information television watermelon caterpillar ordinary helicopter activity invisible experiment community definition alligator january especially necessary celebration dictionary",
5:"university opportunity imagination vocabulary refrigerator international hippopotamus personality electricity organization"};
let n=0,ok=0,abs=0,nH=0,okH=0,bad=[];
for(const k in W) for(const w of W[k].split(' ')){ const g=L._sylEN(w), t=+k; n++; abs+=Math.abs(g-t); if(g===t) ok++; else bad.push(w+':'+g+'≠'+t);
  if(!excWords.has(w)){ nH++; if(g===t) okH++; } }
console.log('EN hece (tümü): '+ok+'/'+n+' (%'+(ok/n*100).toFixed(1)+')  ort.mutlak hata '+(abs/n).toFixed(2));
console.log('EN hece (istisna sözlüğü DIŞI): '+okH+'/'+nH+' (%'+(okH/nH*100).toFixed(1)+')');
if(bad.length) console.log('  yanlışlar: '+bad.join(' '));
// TR: hece = ünlü sayısı (Türkçede tanım gereği)
const TR=[["saat",2],["şiir",2],["kooperatif",5],["Türkiye",3],["öğretmen",3],["İstanbul",3],["ağaç",2],["kitaplık",3],["bilgisayar",4],["üniversite",5],["çocuk",2],["sevgi",2],["güzellik",3],["okul",2],["ekmek",2],["arkadaşlarımızdan",7],["gözlükçü",3],["dağ",1],["ilköğretim",4],["matematik",4]];
let tok=0; const tbad=[]; for(const [w,c] of TR){ const g=L._sylTR(w); if(g===c) tok++; else tbad.push(w+':'+g+'≠'+c); }
console.log('TR hece: '+tok+'/'+TR.length+(tbad.length?'  yanlış: '+tbad.join(' '):''));
// Formül tam-değer testleri
function near(a,b){ return Math.abs(a-b)<0.01; }
const r1=L.readability("The cat sat on the mat.");
console.log('Flesch "The cat sat on the mat." = '+r1.score.toFixed(3)+' (beklenen 116.145) '+(near(r1.score,116.145)?'✓':'✗')+' | FK sınıf '+r1.grade.toFixed(2)+' (beklenen -1.45) '+(near(r1.grade,-1.45)?'✓':'✗'));
const r2=L.readability("Ali okula gitti.");
console.log('Ateşman "Ali okula gitti." = '+r2.score.toFixed(3)+' (beklenen 97.253) '+(near(r2.score,97.2533)?'✓':'✗'));
const r3=L.readability("Kitap okumak, insanın düşünce dünyasını genişletir. Her gün biraz okuyun.");
// hece: Ki-tap(2) o-ku-mak(3) in-sa-nın(3) dü-şün-ce(3) dün-ya-sı-nı(4) ge-niş-le-tir(4) Her(1) gün(1) bi-raz(2) o-ku-yun(3) = 26; kelime 10; cümle 2
const exp3=198.825-40.175*(26/10)-2.610*(10/2);
console.log('Ateşman 2 cümle = '+r3.score.toFixed(3)+' (beklenen '+exp3.toFixed(3)+') '+(near(r3.score,exp3)?'✓':'✗')+' | dil='+r3.lang+' kelime='+r3.words+' cümle='+r3.sentences+' hece='+r3.syllables);
// Dil tespiti
const langT=[["Bugün hava çok güzel ve parka gittik.","tr"],["The weather is nice and we went to the park.","en"],["Saglikli beslenme cok onemli ve bir aliskanliktir.","tr"]];
let lok=0; for(const [t,l] of langT){ if(L.readability(t).lang===l) lok++; } console.log('Dil tespiti: '+lok+'/'+langT.length);
const langT2=[["Ali okula gitti.","tr"],["Annem yarın gelecek.","tr"],["I went home early.","en"],["She smiled and left.","en"],["Kitaplar masada duruyor.","tr"],["We should talk about this.","en"]];
let lok2=0; const lb=[]; for(const [t,l] of langT2){ const g=L.readability(t).lang; if(g===l) lok2++; else lb.push(t+'→'+g); }
console.log('Kısa cümle dil tespiti: '+lok2+'/'+langT2.length+(lb.length?' yanlış: '+lb.join(' | '):''));
