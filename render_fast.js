const fs = require('fs');
const { spawnSync } = require('child_process');
const ffmpeg = 'c:/Users/fenou/.antigravity-ide/Isivente/node_modules/ffmpeg-static/ffmpeg.exe';

const videoIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-demo.mp4';
const audioIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/audio/trozk_voix_off.mp3';
const audioFast = 'c:/Users/fenou/.antigravity-ide/Isivente/public/audio/trozk_voix_off_1.5x.mp3';
const videoOut = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-video-avec-soustitres.mp4';

const SPEED = 1.45;

// Speed up audio cleanly using atempo filter (no pitch distortion)
console.log('Accelerating audio to dynamic commercial pace at ' + SPEED + 'x...');
const speedAudioRes = spawnSync(ffmpeg, [
  '-i', audioIn,
  '-filter:a', 'atempo=' + SPEED,
  '-b:a', '192k',
  '-y',
  audioFast
]);

if (speedAudioRes.status !== 0) {
  console.error('Audio speedup failed');
  process.exit(1);
}

// Subtitles scaled by 1.3:
const cleanSnippets = [
  { start: 0.00, end: 2.30, text: 'Marre des batteries lourdes ?' },
  { start: 2.30, end: 4.58, text: 'Et des câbles encombrants ?' },
  { start: 4.58, end: 6.50, text: 'Batterie Modulaire 3-en-1' },
  { start: 6.50, end: 8.44, text: 'Trozk T3' },
  { start: 8.44, end: 10.40, text: 'Système Haute Capacité' },
  { start: 10.40, end: 12.47, text: '15 000 mAh de réserve' },
  { start: 12.47, end: 15.30, text: 'Mini-bloc de poche détachable' },
  { start: 15.30, end: 18.73, text: '5 000 mAh en 1 seconde' },
  { start: 18.73, end: 20.80, text: 'Branchement direct' },
  { start: 20.80, end: 22.83, text: 'Sans aucun câble' },
  { start: 22.83, end: 24.70, text: 'Continuez à naviguer' },
  { start: 24.70, end: 26.69, text: 'Facilement d’une seule main' },
  { start: 26.69, end: 29.30, text: 'Écran LED de contrôle' },
  { start: 29.30, end: 32.00, text: 'Design Cyberpunk' },
  { start: 32.00, end: 34.63, text: 'Charge rapide 22.5W' },
  { start: 34.63, end: 36.40, text: 'Livraison express sous 24h' },
  { start: 36.40, end: 38.13, text: 'Partout au Bénin' },
  { start: 38.13, end: 40.50, text: 'Paiement à la livraison' },
  { start: 40.50, end: 43.34, text: 'Testez avant de payer' },
  { start: 43.34, end: 45.40, text: 'Commandez votre pack' },
  { start: 45.40, end: 47.44, text: 'Stock limité disponible' }
];

const filters = cleanSnippets.map(s => {
  const clean = s.text.replace(/'/g, '’').replace(/:/g, '\\:').replace(/,/g, '\\,');
  const newStart = (s.start / SPEED).toFixed(2);
  const newEnd = (s.end / SPEED).toFixed(2);
  return "drawtext=text='" + clean + "':fontcolor=white:fontsize=26:borderw=2.5:bordercolor=black:shadowx=2:shadowy=2:shadowcolor=black@0.9:x=(w-text_w)/2:y=h-190:enable='between(t," + newStart + "," + newEnd + ")'";
}).join(',');

console.log('Rendering accelerated video...');
const res = spawnSync(ffmpeg, [
  '-stream_loop', '-1',
  '-i', videoIn,
  '-i', audioFast,
  '-map', '0:v:0',
  '-map', '1:a:0',
  '-vf', filters,
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '22',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  '-y',
  videoOut
]);

if (res.status === 0) {
  const stats = fs.statSync(videoOut);
  console.log('SUCCESS! Video compiled:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
} else {
  console.error('ERROR:', res.stderr.toString().slice(-800));
}
