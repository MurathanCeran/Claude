const E=require('./engine.js')(); const L=E.L;
const B=__dirname+'/';
const pool=[...require(B+'recovered.js'),...require(B+'humanpd.js'),...require(B+'hold1.js'),...require(B+'hold2.js'),...require(B+'f1set.js')]
  .filter(s=>s.t.split(/\s+/).length>=35);
const H=pool.filter(s=>!s.l), A=pool.filter(s=>s.l);
// deterministik sözde-rastgele
let seed=+(process.env.SEED||7); function rnd(n){ seed=(seed*1103515245+12345)%2147483648; return seed%n; }
const docs=[];
for(let i=0;i<60;i++){ const h=H[rnd(H.length)], a=A[rnd(A.length)], h2=H[rnd(H.length)];
  const k=i%4;
  if(k===0) docs.push({parts:[h,a]}); else if(k===1) docs.push({parts:[a,h]}); else if(k===2) docs.push({parts:[h,a,h2]}); else docs.push({parts:[h,h2]}); }
for(let i=0;i<20;i++) docs.push({parts:[H[rnd(H.length)],H[rnd(H.length)],H[rnd(H.length)]]});
function evalMode(join){
  let segOk=0,segN=0, mixedN=0,mixedHit=0, pureN=0,pureFP=0, locN=0,locOk=0, shortSeg=0;
  for(const d of docs){
    const text=d.parts.map(p=>p.t).join(join);
    const m=L.segmentMap(text);
    const isMixed=d.parts.some(p=>p.l)&&d.parts.some(p=>!p.l);
    const isPure=d.parts.every(p=>!p.l);
    if(join==='\n\n'){
      m.segments.forEach((s,i)=>{ if(s.short){shortSeg++;return;} segN++; if((s.pct>=50?1:0)===d.parts[i].l) segOk++; });
      if(isMixed){ const aiIdx=d.parts.map((p,i)=>p.l?i:-1).filter(i=>i>=0); const sc=m.segments.map(s=>s.pct||0); const top=sc.indexOf(Math.max(...sc)); locN++; if(aiIdx.includes(top)) locOk++; }
    } else {
      if(isMixed){ // tek blokta: en yüksek skorlu parça AI metninin cümlelerini çoğunlukla içeriyor mu
        const aiP=d.parts.find(p=>p.l); const sc=m.segments.map(s=>s.pct||0); const top=m.segments[sc.indexOf(Math.max(...sc))];
        locN++; const aiSents=E.getSentencesPos(aiP.t).map(x=>x.text.trim().slice(0,25)); const hit=aiSents.filter(x=>top.text.includes(x)).length;
        if(hit>=Math.ceil(aiSents.length/2)) locOk++;
      }
    }
    if(isMixed){ mixedN++; if(m.verdict==='karışık') mixedHit++; }
    if(isPure){ pureN++; if(m.aiCount>0) pureFP++; }
  }
  return {segOk,segN,mixedN,mixedHit,pureN,pureFP,locN,locOk,shortSeg};
}
const p=evalMode('\n\n'), b=evalMode(' ');
console.log('PARAGRAFLI belge ('+docs.length+'):');
console.log('  segment doğruluğu: '+p.segOk+'/'+p.segN+' (%'+(p.segOk/p.segN*100).toFixed(1)+')  kısa atlanan: '+p.shortSeg);
console.log('  karışık tespiti: '+p.mixedHit+'/'+p.mixedN+' (%'+(p.mixedHit/p.mixedN*100).toFixed(1)+')');
console.log('  saf-insan belgede yanlış AI bölüm: '+p.pureFP+'/'+p.pureN);
console.log('  lokalizasyon (en yüksek skor = AI paragrafı): '+p.locOk+'/'+p.locN+' (%'+(p.locOk/p.locN*100).toFixed(1)+')');
console.log('TEK BLOK (paragraf boşluğu yok):');
console.log('  karışık tespiti: '+b.mixedHit+'/'+b.mixedN+'  saf-insan FP: '+b.pureFP+'/'+b.pureN+'  lokalizasyon: '+b.locOk+'/'+b.locN+' (%'+(b.locOk/b.locN*100).toFixed(1)+')');
