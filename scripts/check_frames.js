const { spawnSync } = require('child_process');
const path = require('path');
const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

// Check frame at 10s, 14s, 18s, 22s
[5, 10, 14, 18, 22].forEach(t => {
  const out = path.join(__dirname, 'video2_addiction_prod', `check_${t}s.jpg`);
  spawnSync(ffmpeg, ['-ss', t.toString(), '-i', path.join(__dirname, 'video2_addiction_prod', 'final_rendered.mp4'), '-vframes', '1', '-y', out]);
  console.log(`Extracted check at ${t}s`);
});
