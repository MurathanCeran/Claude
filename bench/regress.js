// Regresyon: tüm bench metinlerinde motor + UI mantığı + ısı haritası + v25 yerel araçlar hatasız mı?
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','ai-content-detector.html'),'utf8');
let fails=0; const F=m=>{ fails++; console.log('  ✗ '+m); };
// 1) Tüm <script> blokları parse oluyor mu
let n=0; const re=/<script[^>]*>([\s\S]*?)<\/script>/gi; let m;
while((m=re.exec(html))){ n++; if(/src=/.test(m[0].slice(0,80))) continue; try{ new Function(m[1]); }catch(e){ F('script#'+n+' parse: '+e.message); } }
const E=require('./engine.js')(); const L=E.L;
const sets=['recovered','humanpd','hold1','hold2','hold3','f1set'].map(s=>require('./'+s+'.js')).flat();
const unesc=h=>h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
let rows=0;
for(const s of sets){
  try{
    const r=E.analyze(s.t); if(r.tooShort) continue;
    for(const p of E.rankedReasons(r)){ const mm=E.REASON_META[p.key]; if(!mm) F(s.n+': meta yok '+p.key); else { mm.why(r); mm.fix(r); mm.prompt(r); rows++; } }
    const th=E.buildTeacher(r); if(/undefined|NaN/.test(th)) F(s.n+': öğretmen kartında undefined/NaN');
    E.buildMasterPrompt(r, s.t);
    if(unesc(E.buildPreview(s.t, r.intervals))!==s.t) F(s.n+': önizleme metin kaybı');
    if(unesc(E.buildHeatmap(s.t, r.intervals, -1, {}))!==s.t) F(s.n+': ısı haritası metin kaybı');
    const q=L.quickFix(s.t);
    if(L.quickFix(q.text).text!==q.text) F(s.n+': Hızlı Düzelt idempotent değil');
    if(/ {2,}| [,.;:!?]|,[.!?]|,,/.test(q.text)) F(s.n+': Hızlı Düzelt biçim hatası');
    const sm=L.segmentMap(s.t+"\n\n"+s.t); if(!sm.segments.length) F(s.n+': harita boş');
    const rd=L.readability(s.t); if(!rd || !isFinite(rd.score)) F(s.n+': okunabilirlik NaN');
  }catch(e){ F(s.n+': '+e.message); }
}
// 2) Sınır durumları
for(const t of ['', 'Tek cümle.', '<script>alert(1)</script> delve into the tapestry. seamless synergy is a testament.', 'x'.repeat(400)+' kelime.', '🎉🎉 harika!! çok iyi oldu. evet.']){
  try{ const r=E.analyze(t); const pv=E.buildPreview(t, (r&&r.intervals)||[]); if(/<script>alert/.test(pv)) F('XSS kaçağı'); L.quickFix(t); L.readability(t); if(t) L.segmentMap(t); }catch(e){ F('sınır: '+e.message); }
}
console.log('script blokları: '+n+' | metin: '+sets.length+' | sebep satırı: '+rows+' | HATA: '+fails);
process.exit(fails?1:0);
