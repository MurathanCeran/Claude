// v25 API'siz özelliklerin ayrı ayrı doğruluk testleri. Kullanım: node bench/features.js
const {execSync}=require('child_process'); const d=__dirname;
const run=(f,env)=>execSync('node '+d+'/'+f, {env:Object.assign({},process.env,env||{})}).toString().trim();
console.log('══ F1 · Hızlı Düzelt — birim testleri ══\n'+run('testF1.js'));
console.log('══ F1 · Hızlı Düzelt — korpus güvenliği ══\n'+run('testF1b.js'));
console.log('══ F2 · Paragraf haritası — 6 farklı rastgele belge tohumu ══');
for(const s of [7,11,23,101,777,2024]) console.log('tohum '+s+': '+run('testF2.js',{SEED:String(s)}).split('\n').filter(l=>/segment|karışık|saf-insan|lokalizasyon/.test(l)).map(l=>l.trim()).join(' · '));
console.log('══ F3 · Okunabilirlik ══\n'+run('testF3.js'));
