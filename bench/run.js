// Kullanım: node bench/run.js [htmlPath] [setAdları,...]
const E=require('./engine.js')(process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:undefined);
const SETS={recovered:require('./recovered.js'),humanpd:require('./humanpd.js'),hold1:require('./hold1.js'),hold2:require('./hold2.js'),hold3:require('./hold3.js')};
const want=(process.argv.find(a=>/^[a-z0-9,]+$/.test(a)&&a.split(',').every(x=>SETS[x]))||'recovered,humanpd,hold1,hold2').split(',');
let T=0,N=0,F=0,PD=0,PDF=0;
for(const nm of want){
  const set=SETS[nm]; let ok=0,fp=0,ai=0,aiok=0,hu=0,huok=0,miss=[];
  for(const s of set){ const r=E.analyze(s.t); const pct=r.tooShort?0:r.pct; const p=pct>=50?1:0;
    if(s.l){ai++; if(p){ok++;aiok++;} else miss.push('AI '+s.n+'='+pct);} else {hu++; if(!p){ok++;huok++;} else {fp++; miss.push('FP '+s.n+'='+pct);}}
    if(!s.l && s.src==='pd'){PD++; if(p) PDF++;}
  }
  T+=ok;N+=set.length;F+=fp;
  console.log(nm.padEnd(10)+' '+ok+'/'+set.length+' (%'+(ok/set.length*100).toFixed(1)+')  AI-recall '+aiok+'/'+ai+'  insan '+huok+'/'+hu+'  FP='+fp);
  if(process.env.V) console.log('   '+miss.join('  '));
}
console.log('TOPLAM '+T+'/'+N+' (%'+(T/N*100).toFixed(1)+')  FP='+F+'  | gerçek-insan(pd) FP: '+PDF+'/'+PD);
