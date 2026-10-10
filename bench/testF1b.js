const E=require('./engine.js')(); const L=E.L;
const B=__dirname+'/';
const all=[...require(B+'recovered.js'),...require(B+'humanpd.js'),...require(B+'hold1.js'),...require(B+'hold2.js')];
let aiN=0,aiDrop=0,aiImproved=0,aiCrossed=0,aiTouched=0, huN=0,huChanges=0,huFP=0,huUp=0, idemFail=[], badFmt=[], retention=[];
const STOP=new Set(['that','this','with','from','have','they','their','there','what','when','which','would','could','should','about','into','more','than','then','them','were','been','will','your','ve','bir','için','olarak','daha','gibi']);
function cw(t){ return (t.toLowerCase().match(/[a-zçğıöşüâîû]{4,}/g)||[]).filter(w=>!STOP.has(w)); }
const DEMO=[];
for(const s of all){
  const r0=E.analyze(s.t); if(r0.tooShort) continue;
  const q=L.quickFix(s.t); const r1=E.analyze(q.text);
  // biçim kontrolleri
  if(/ {2,}| [,.;:!?]|,[.!?]|,,/.test(q.text)) badFmt.push(s.n+': biçim');
  if(/(^|[.!?]\s+)[a-zçğıöşü]/.test(q.text)) badFmt.push(s.n+': küçük harfle cümle başı');
  if(L.quickFix(q.text).text!==q.text) idemFail.push(s.n);
  // içerik-kelime korunumu (değiştirilen kalıp kelimeleri hariç)
  const before=cw(s.t), after=new Set(cw(q.text));
  const removed=new Set(q.changes.flatMap(c=>cw(c.from)));
  const keep=before.filter(w=>!removed.has(w)); const kept=keep.filter(w=>after.has(w)||[...after].some(a=>a.slice(0,4)===w.slice(0,4)));
  if(keep.length) retention.push(kept.length/keep.length);
  if(s.l){ aiN++; aiDrop+=r0.pct-r1.pct; if(q.changes.length) aiTouched++; if(r1.pct<r0.pct) aiImproved++; if(r0.pct>=50&&r1.pct<50) aiCrossed++; if(q.changes.length>=3) DEMO.push([s.n,r0.pct,r1.pct,q.changes.length]); }
  else { huN++; huChanges+=q.changes.length; if(r1.pct>=50) huFP++; if(r1.pct>r0.pct+5) huUp++; }
}
const ret=retention.reduce((a,b)=>a+b,0)/retention.length, minRet=Math.min(...retention);
console.log('AI metinleri ('+aiN+'): dokunulan '+aiTouched+' | skoru düşen '+aiImproved+' | ort. düşüş '+(aiDrop/aiN).toFixed(1)+' puan | %50 altına inen '+aiCrossed);
console.log('İnsan metinleri ('+huN+'): ort. değişiklik '+(huChanges/huN).toFixed(2)+' | düzeltme sonrası FP '+huFP+' | skoru 5+ puan artan '+huUp);
console.log('İdempotence hatası: '+idemFail.length+(idemFail.length?' '+idemFail.join(','):''));
console.log('Biçim hatası: '+badFmt.length+(badFmt.length?' '+badFmt.join(' | '):''));
console.log('İçerik-kelime korunumu: ort %'+(ret*100).toFixed(1)+', en düşük %'+(minRet*100).toFixed(1));
console.log('En çok düzeltilen AI örnekleri:', DEMO.sort((a,b)=>b[3]-a[3]).slice(0,6).map(d=>d[0]+' '+d[1]+'→'+d[2]+' ('+d[3]+' değişiklik)').join('  '));
