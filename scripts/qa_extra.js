const {spawnSync}=require('child_process');
const ff='node_modules/ffmpeg-static/ffmpeg.exe';
[21,26].forEach(t=>{
  const out=`scripts/masque_oculaire_prod/qa_${t}s.jpg`;
  const r=spawnSync(ff,['-y','-ss',String(t),'-i','scripts/masque_oculaire_prod/final_masque_oculaire.mp4','-vframes','1','-q:v','2',out],{encoding:'utf8'});
  console.log(t+'s status:',r.status);
});
console.log('done');
