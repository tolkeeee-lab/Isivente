const fs = require('fs');
const { spawnSync } = require('child_process');
const ffmpeg = 'c:/Users/fenou/.antigravity-ide/Isivente/node_modules/ffmpeg-static/ffmpeg.exe';

const videoIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-demo.mp4';
const audioIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/audio/trozk_voix_off.mp3';
const videoOut = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-video-avec-soustitres.mp4';

// Minimalist, senior-designer grade subtitles:
// - NO black box covering the product!
// - NO spammy emojis
// - Ultra-clean, crisp white typography with thin black outline & subtle shadow
// - Spacious line height and airy positioning
const cleanSnippets = [
  // 0.00 to 4.58
  { start: 0.00, end: 2.30, text: 'Marre des batteries lourdes ?' },
  { start: 2.30, end: 4.58, text: 'Et des câbles encombrants ?' },
  
  // 4.58 to 8.44
  { start: 4.58, end: 6.50, text: 'Batterie Modulaire 3-en-1' },
  { start: 6.50, end: 8.44, text: 'Trozk T3' },

  // 8.44 to 12.47
  { start: 8.44, end: 10.40, text: 'Système Haute Capacité' },
  { start: 10.40, end: 12.47, text: '15 000 mAh de réserve' },

  // 12.47 to 18.73
  { start: 12.47, end: 15.30, text: 'Mini-bloc de poche détachable' },
  { start: 15.30, end: 18.73, text: '5 000 mAh en 1 seconde' },

  // 18.73 to 22.83
  { start: 18.73, end: 20.80, text: 'Branchement direct' },
  { start: 20.80, end: 22.83, text: 'Sans aucun câble' },

  // 22.83 to 26.69
  { start: 22.83, end: 24.70, text: 'Continuez à naviguer' },
  { start: 24.70, end: 26.69, text: 'Facilement d’une seule main' },

  // 26.69 to 34.63
  { start: 26.69, end: 29.30, text: 'Écran LED de contrôle' },
  { start: 29.30, end: 32.00, text: 'Design Cyberpunk' },
  { start: 32.00, end: 34.63, text: 'Charge rapide 22.5W' },

  // 34.63 to 38.13
  { start: 34.63, end: 36.40, text: 'Livraison express sous 24h' },
  { start: 36.40, end: 38.13, text: 'Partout au Bénin' },

  // 38.13 to 43.34
  { start: 38.13, end: 40.50, text: 'Paiement à la livraison' },
  { start: 40.50, end: 43.34, text: 'Testez avant de payer' },

  // 43.34 to 47.44
  { start: 43.34, end: 45.40, text: 'Commandez votre pack' },
  { start: 45.40, end: 47.44, text: 'Stock limité disponible' }
];

// Clean Apple / Linear video subtitle styling:
// - fontsize: 26 (balanced, not overwhelming)
// - fontcolor: white (or bright yellow on emphasis)
// - NO box!
// - borderw: 2.5, bordercolor: black (sharp, crisp outline)
// - shadowx: 1.5, shadowy: 1.5, shadowcolor: black@0.8
// - y: h-190 (optical balance, airy, does not hide product)
const filters = cleanSnippets.map(s => {
  const clean = s.text.replace(/'/g, '’').replace(/:/g, '\\:').replace(/,/g, '\\,');
  return "drawtext=text='" + clean + "':fontcolor=white:fontsize=26:borderw=2.5:bordercolor=black:shadowx=2:shadowy=2:shadowcolor=black@0.9:x=(w-text_w)/2:y=h-190:enable='between(t," + s.start.toFixed(2) + "," + s.end.toFixed(2) + ")'";
}).join(',');

console.log('Rendering clean, airy, box-free video...');

const args = [
  '-stream_loop', '-1',
  '-i', videoIn,
  '-i', audioIn,
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
];

const res = spawnSync(ffmpeg, args);
if (res.status === 0) {
  const stats = fs.statSync(videoOut);
  console.log('SUCCESS! Video compiled cleanly:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
} else {
  console.error('ERROR:', res.stderr.toString().slice(-800));
}
