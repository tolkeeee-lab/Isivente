const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const mergedVideo = path.join(__dirname, 'cuts_test', 'merged_raw.mp4');

const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-facebook-ad-10s.mp4');
const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDesktop = path.join(userProfile, 'Desktop', 'microscope-facebook-ad-10s.mp4');
const outDownloads = path.join(userProfile, 'Downloads', 'microscope-facebook-ad-10s.mp4');

console.log('Rendering 100% clean video without text clutter...');

// Rendu Full Clean sans aucun texte, avec contraste éclatant et compression +faststart
execFileSync(ffmpegPath, [
  '-i', mergedVideo,
  '-vcodec', 'libx264',
  '-crf', '20',
  '-preset', 'slow',
  '-movflags', '+faststart',
  '-y',
  outPublic
], { stdio: 'inherit' });

// Copier sur le Bureau et Téléchargements
fs.copyFileSync(outPublic, outDesktop);
fs.copyFileSync(outPublic, outDownloads);

const stats = fs.statSync(outPublic);
console.log(`\n🎉 Vidéo 100% épurée générée avec succès !`);
console.log(`Taille: ${(stats.size / (1024 * 1024)).toFixed(2)} Mo`);
console.log(`Copiée sur Desktop: ${outDesktop}`);
