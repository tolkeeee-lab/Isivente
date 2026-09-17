const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const overlayPath = path.join(__dirname, 'ad_overlay_square.png');
const outFinal = path.join(__dirname, '..', 'public', 'videos', 'microscope-facebook-ad-10s.mp4');

const cutsDir = path.join(__dirname, 'cuts_test');
const clipLeaf = path.join(cutsDir, 'clip_leaf_10s.mp4');
const clipFabric = path.join(cutsDir, 'clip_fabric_10s.mp4');
const clipFibers = path.join(cutsDir, 'clip_fibers_10s.mp4');

const trimmedLeaf = path.join(cutsDir, 'trim_1.mp4');
const trimmedFabric = path.join(cutsDir, 'trim_2.mp4');
const trimmedFibers = path.join(cutsDir, 'trim_3.mp4');
const concatList = path.join(cutsDir, 'concat.txt');
const mergedVideo = path.join(cutsDir, 'merged_raw.mp4');

console.log('1. Trimming 3 micro-sequences (3.2s + 3.2s + 3.4s = 9.8s)...');

// 1. Feuille verte (3.2s) - cadré sur l'écran LCD
execFileSync(ffmpegPath, [
  '-ss', '1.0',
  '-i', clipLeaf,
  '-t', '3.2',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-an',
  '-y',
  trimmedLeaf
], { stdio: 'ignore' });

// 2. Tissu macro (3.2s)
execFileSync(ffmpegPath, [
  '-ss', '0.8',
  '-i', clipFabric,
  '-t', '3.2',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-an',
  '-y',
  trimmedFabric
], { stdio: 'ignore' });

// 3. Fibres (3.4s)
execFileSync(ffmpegPath, [
  '-ss', '0.5',
  '-i', clipFibers,
  '-t', '3.4',
  '-vf', 'scale=1920:1080,crop=1080:1080:420:0',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-an',
  '-y',
  trimmedFibers
], { stdio: 'ignore' });

// 2. Concaténation des 3 clips
fs.writeFileSync(concatList, `file '${trimmedLeaf.replace(/\\/g, '/')}'\nfile '${trimmedFabric.replace(/\\/g, '/')}'\nfile '${trimmedFibers.replace(/\\/g, '/')}'\n`);

execFileSync(ffmpegPath, [
  '-f', 'concat',
  '-safe', '0',
  '-i', concatList,
  '-c', 'copy',
  '-y',
  mergedVideo
], { stdio: 'ignore' });

console.log('2. Applying Facebook Ad Overlay & faststart compression...');

// 3. Application de l'habillage graphique + compression optimale web
execFileSync(ffmpegPath, [
  '-i', mergedVideo,
  '-i', overlayPath,
  '-filter_complex', '[0:v][1:v]overlay=0:0[v]',
  '-map', '[v]',
  '-vcodec', 'libx264',
  '-crf', '24',
  '-preset', 'medium',
  '-movflags', '+faststart',
  '-y',
  outFinal
], { stdio: 'inherit' });

const stats = fs.statSync(outFinal);
console.log(`\n🎉 Vidéo Facebook Ad 10s générée avec succès !`);
console.log(`Fichier: ${outFinal}`);
console.log(`Taille: ${(stats.size / (1024 * 1024)).toFixed(2)} Mo (Idéal pour Facebook Ads)\n`);
