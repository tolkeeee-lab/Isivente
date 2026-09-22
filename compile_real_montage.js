const fs = require('fs');
const path = require('path');
const ffmpeg = 'c:/Users/fenou/.antigravity-ide/Isivente/node_modules/ffmpeg-static/ffmpeg.exe';
const { spawnSync } = require('child_process');

const cutsDir = 'c:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/montage_cuts';
const audioFast = 'c:/Users/fenou/.antigravity-ide/Isivente/public/audio/trozk_voix_off_1.5x.mp3';
const rawMontage = path.join(cutsDir, 'raw_montage.mp4');
const videoFinal = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-video-avec-soustitres.mp4';

// Step 1: Concat the 6 clips cleanly
const concatList = path.join(cutsDir, 'list.txt');
fs.writeFileSync(concatList, [
  "file 'c1.mp4'",
  "file 'c2.mp4'",
  "file 'c3.mp4'",
  "file 'c4.mp4'",
  "file 'c5.mp4'",
  "file 'c6.mp4'"
].join('\n'));

console.log('Concatenating 6 dynamic clips...');
spawnSync(ffmpeg, [
  '-f', 'concat',
  '-safe', '0',
  '-i', concatList,
  '-c', 'copy',
  '-y',
  rawMontage
]);

// Step 2: Burn the clean subtitles + mapped audio
// Total speed is 1.45x, matching 32.7s total duration
const SPEED = 1.45;
const cleanSnippets = [
  { start: 0.00, end: 2.30, text: 'Marre des batteries lourdes ?' },
  { start: 2.30, end: 4.58, text: 'Et des câbles encombrants ?' },
  { start: 4.58, end: 6.50, text: 'Batterie Modulaire 3-en-1' },
  { start: 6.50, end: 8.44, text: 'Trozk T3™ Cyberpunk' },
  { start: 8.44, end: 10.40, text: 'Système Haute Capacité' },
  { start: 10.40, end: 12.47, text: '15 000 mAh de réserve' },
  { start: 12.47, end: 15.30, text: 'Mini-bloc détachable de poche' },
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

// In 720x1280:
// Font size: 30px (clean, bold, high-legibility)
// Position: y=h-220 (centered lower-third, completely unobtrusive)
const filters = cleanSnippets.map(s => {
  const clean = s.text.replace(/'/g, '’').replace(/:/g, '\\:').replace(/,/g, '\\,');
  const newStart = (s.start / SPEED).toFixed(2);
  const newEnd = (s.end / SPEED).toFixed(2);
  return "drawtext=text='" + clean + "':fontcolor=white:fontsize=30:borderw=3:bordercolor=black:shadowx=2:shadowy=2:shadowcolor=black@0.9:x=(w-text_w)/2:y=h-220:enable='between(t," + newStart + "," + newEnd + ")'";
}).join(',');

console.log('Rendering final polished montage with voiceover and clean subtitles...');
const res = spawnSync(ffmpeg, [
  '-i', rawMontage,
  '-i', audioFast,
  '-map', '0:v:0',
  '-map', '1:a:0',
  '-vf', filters,
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '21',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  '-y',
  videoFinal
]);

if (res.status === 0) {
  const stats = fs.statSync(videoFinal);
  console.log('FINAL MONTAGE READY! Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
} else {
  console.error('Final render error:', res.stderr.toString().slice(-600));
}
