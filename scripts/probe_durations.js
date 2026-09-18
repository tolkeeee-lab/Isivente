const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const files = [0,1,2,3,4].map(i => path.join(__dirname, `masque_oculaire_prod/cut_${i}.mp4`));
files.push(path.join(__dirname, 'masque_oculaire_prod/raw_concat.mp4'));

for (const f of files) {
  if (!fs.existsSync(f)) { console.log('MISSING:', f); continue; }
  const r = spawnSync(ffmpeg, [
    '-i', f
  ], { encoding: 'utf8' });
  // Duration is in stderr
  const match = (r.stderr||'').match(/Duration:\s*([\d:.]+)/);
  console.log(path.basename(f), '→', match ? match[1] : 'n/a');
}
