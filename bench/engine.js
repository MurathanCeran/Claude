// Canlı HTML'den motoru çıkarır (tek kaynak: ai-content-detector.html). node ortamında çalışır.
const fs=require('fs'), path=require('path');
module.exports=function load(htmlPath){
  const html=fs.readFileSync(htmlPath||path.join(__dirname,'..','ai-content-detector.html'),'utf8');
  const a=html.indexOf('/* ---------- 1) Knowledge bases ----------');
  const b=html.indexOf('/* ---------- 8) Rendering');
  if(a<0||b<0) throw new Error('motor işaretleri bulunamadı');
  const code='var selectedGenre=undefined;var GENRE_WEIGHTS={};var window={};var document=undefined;\n'+html.slice(a,b)
    +'\n;module.exports={analyze:analyze,scoreSentence:scoreSentence,getSentencesPos:getSentencesPos,buildPreview:buildPreview,buildHeatmap:buildHeatmap,'
    +'rankedReasons:rankedReasons,REASON_META:REASON_META,buildTeacher:buildTeacher,buildMasterPrompt:buildMasterPrompt,'
    +'L:(typeof LOCAL!=="undefined"?LOCAL:null)};';
  const tmp=path.join(require('os').tmpdir(),'eng_'+process.pid+'_'+Math.random().toString(36).slice(2)+'.js');
  fs.writeFileSync(tmp,code); const m=require(tmp); fs.unlinkSync(tmp); return m;
};
