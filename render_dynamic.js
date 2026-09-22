const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpeg = 'c:/Users/fenou/.antigravity-ide/Isivente/node_modules/ffmpeg-static/ffmpeg.exe';

const videoIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-demo.mp4';
const audioIn = 'c:/Users/fenou/.antigravity-ide/Isivente/public/audio/trozk_voix_off.mp3';
const videoOut = 'c:/Users/fenou/.antigravity-ide/Isivente/public/videos/trozk-video-avec-soustitres.mp4';

// Dynamic 1 to 2.5 seconds snippets (TikTok punchy style)
// Keep text short (max 25 chars per line) so it NEVER clips or gets cut on mobile!
const snippets = [
  // Chunk 0 (4.58s)
  { start: 0.00, end: 2.30, text: 'MARRE DES BATTERIES\\nLOURDES ? ❌', color: 'yellow' },
  { start: 2.30, end: 4.58, text: 'ET DES CÂBLES\\nQUI TRAÎNENT ?', color: 'white' },
  
  // Chunk 1 (3.86s) -> 4.58 to 8.44
  { start: 4.58, end: 6.50, text: 'DÉCOUVREZ LA BATTERIE\\nMODULAIRE 3-EN-1 ⚡', color: 'yellow' },
  { start: 6.50, end: 8.44, text: 'TROZK T3™\\nCYBERPUNK 🚀', color: 'white' },

  // Chunk 2 (4.03s) -> 8.44 to 12.47
  { start: 8.44, end: 10.40, text: 'SYSTÈME RÉVOLUTIONNAIRE', color: 'white' },
  { start: 10.40, end: 12.47, text: '15 000 mAh DE RÉSERVE 🔋', color: 'yellow' },

  // Chunk 3 (6.26s) -> 12.47 to 18.73
  { start: 12.47, end: 15.30, text: 'DÉTACHEZ LE MINI-BLOC\\nDE POCHE 🧩', color: 'white' },
  { start: 15.30, end: 18.73, text: '5 000 mAh\\nEN 1 SECONDE !', color: 'yellow' },

  // Chunk 4 (4.10s) -> 18.73 to 22.83
  { start: 18.73, end: 20.80, text: 'BRANCHEMENT DIRECT', color: 'white' },
  { start: 20.80, end: 22.83, text: 'SANS AUCUN FIL ! 📱', color: 'yellow' },

  // Chunk 5 (3.86s) -> 22.83 to 26.69
  { start: 22.83, end: 24.70, text: 'TÉLÉPHONEZ OU JOUEZ', color: 'white' },
  { start: 24.70, end: 26.69, text: 'D’UNE SEULE MAIN 🎮', color: 'yellow' },

  // Chunk 6 (7.94s) -> 26.69 to 34.63
  { start: 26.69, end: 29.30, text: 'ÉCRAN LED RÉTRO-ÉCLAIRÉ', color: 'white' },
  { start: 29.30, end: 32.00, text: 'DESIGN CYBERPUNK ✨', color: 'yellow' },
  { start: 32.00, end: 34.63, text: 'CHARGE RAPIDE 22.5W ⚡', color: 'yellow' },

  // Chunk 7 (3.50s) -> 34.63 to 38.13
  { start: 34.63, end: 36.40, text: 'LIVRAISON EXPRESS 24H 📦', color: 'white' },
  { start: 36.40, end: 38.13, text: 'PARTOUT AU BÉNIN 🇧🇯', color: 'yellow' },

  // Chunk 8 (5.21s) -> 38.13 to 43.34
  { start: 38.13, end: 40.50, text: 'PAYEZ À LA LIVRAISON', color: 'white' },
  { start: 40.50, end: 43.34, text: 'TESTEZ LE PRODUIT\\nAVANT DE PAYER ! 🛡️', color: 'green' },

  // Chunk 9 (4.10s) -> 43.34 to 47.44
  { start: 43.34, end: 45.40, text: 'COMMANDER MAINTENANT', color: 'white' },
  { start: 45.40, end: 47.44, text: 'STOCK LIMITÉ 👇', color: 'yellow' }
];

// Target resolution 576x1024:
// Text positioned at y=h-240 (cleanly in lower third, completely safe from IG/TikTok UI buttons!)
// Font size: 28px (big, bold, readable)
// Padding / Box: black with 70% opacity, rounded feel
const drawtextFilters = snippets.map(s => {
  const clean = s.text.replace(/'/g, '’').replace(/:/g, '\\:').replace(/,/g, '\\,');
  const fontColor = s.color === 'yellow' ? 'yellow' : (s.color === 'green' ? '#00FF66' : 'white');
  return "drawtext=text='" + clean + "':fontcolor=" + fontColor + ":fontsize=28:borderw=4:bordercolor=black:box=1:boxcolor=black@0.7:boxborderw=12:line_spacing=8:x=(w-text_w)/2:y=h-240:enable='between(t," + s.start.toFixed(2) + "," + s.end.toFixed(2) + ")'";
}).join(',');

console.log('Rendering dynamic TikTok-style video with 20 fast-paced cuts...');

const args = [
  '-stream_loop', '-1',
  '-i', videoIn,
  '-i', audioIn,
  '-map', '0:v:0',
  '-map', '1:a:0',
  '-vf', drawtextFilters,
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
  console.log('SUCCESS! Video compiled perfectly:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
} else {
  console.error('ERROR:', res.stderr.toString().slice(-800));
}
