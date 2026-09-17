const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const hookSource = 'C:\\Users\\fenou\\Downloads\\Script_Le_Multi_Passions_.mp4';
const actionSource = path.join(__dirname, 'raw_source_1.mp4');

const outDir = path.join(__dirname, 'merged_ad');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const part1Hook = path.join(outDir, 'part1_hook.mp4');
const part2Leaf = path.join(outDir, 'part2_leaf.mp4');
const part3Fabric = path.join(outDir, 'part3_fabric.mp4');
const concatList = path.join(outDir, 'concat_list.txt');

const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-facebook-ad-10s.mp4');
const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDesktop = path.join(userProfile, 'Desktop', 'microscope-facebook-ad-10s.mp4');
const outDownloads = path.join(userProfile, 'Downloads', 'microscope-facebook-ad-10s.mp4');

console.log('1. Cutting Hook (0s to 3.8s) from Script_Le_Multi_Passions_.mp4 in 1080x1080...');
// Hook de 3.8s avec son audio
execFileSync(ffmpegPath, [
  '-ss', '0.0',
  '-i', hookSource,
  '-t', '3.8',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-ar', '44100',
  '-b:a', '128k',
  '-y',
  part1Hook
], { stdio: 'inherit' });

console.log('2. Cutting Action Leaf (3.2s) in 1080x1080...');
// Clip action feuille (3.2s) avec audio silencieux pour matcher les pistes
execFileSync(ffmpegPath, [
  '-ss', '164.5',
  '-i', actionSource,
  '-t', '3.2',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-ar', '44100',
  '-b:a', '128k',
  '-y',
  part2Leaf
], { stdio: 'inherit' });

console.log('3. Cutting Action Fabric (3.0s) in 1080x1080...');
// Clip action tissu (3.0s)
execFileSync(ffmpegPath, [
  '-ss', '213.5',
  '-i', actionSource,
  '-t', '3.0',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-ar', '44100',
  '-b:a', '128k',
  '-y',
  part3Fabric
], { stdio: 'inherit' });

console.log('4. Concatenating Hook + Real Action...');
fs.writeFileSync(concatList, `file '${part1Hook.replace(/\\/g, '/')}'\nfile '${part2Leaf.replace(/\\/g, '/')}'\nfile '${part3Fabric.replace(/\\/g, '/')}'\n`);

execFileSync(ffmpegPath, [
  '-f', 'concat',
  '-safe', '0',
  '-i', concatList,
  '-c:v', 'libx264',
  '-crf', '20',
  '-preset', 'medium',
  '-c:a', 'aac',
  '-movflags', '+faststart',
  '-y',
  outPublic
], { stdio: 'inherit' });

fs.copyFileSync(outPublic, outDesktop);
fs.copyFileSync(outPublic, outDownloads);

const stats = fs.statSync(outPublic);
console.log(`\n🎉 Montage Hook + Action terminé avec succès !`);
console.log(`Durée totale: exactement 10.0 secondes`);
console.log(`Taille: ${(stats.size / (1024 * 1024)).toFixed(2)} Mo`);
console.log(`Mis à jour sur le Bureau: ${outDesktop}`);
