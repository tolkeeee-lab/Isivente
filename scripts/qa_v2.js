const { spawnSync } = require('child_process');
const path = require('path');
const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

const vid = 'C:/Users/fenou/Downloads/MICROSCOPE_PUB_2_ADDICTION_ECRANS_VIVIENNE.mp4';
const outDir = path.join(__dirname, 'video2_perfect_prod', 'qa');
const fs = require('fs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

[2, 8, 14, 19, 25].forEach(t => {
  const out = path.join(outDir, `frame_${t}s.jpg`);
  spawnSync(ffmpeg, ['-i', vid, '-ss', t.toString(), '-vframes', '1', '-y', out]);
  console.log(`Extracted QA frame at ${t}s`);
});
