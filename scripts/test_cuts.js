const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const videoPath = path.join(__dirname, 'raw_source_1.mp4');
const outDir = path.join(__dirname, 'cuts_test');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Testing cuts...');

// Clip A: 164s à 174s (Zoom feuille en action avec ajustement de netteté)
execFileSync(ffmpegPath, [
  '-ss', '164',
  '-i', videoPath,
  '-t', '10',
  '-c:v', 'libx264',
  '-c:a', 'aac',
  '-y',
  path.join(outDir, 'clip_leaf_10s.mp4')
], { stdio: 'inherit' });

// Clip B: 213s à 223s (Zoom tissu vert en action)
execFileSync(ffmpegPath, [
  '-ss', '213',
  '-i', videoPath,
  '-t', '10',
  '-c:v', 'libx264',
  '-c:a', 'aac',
  '-y',
  path.join(outDir, 'clip_fabric_10s.mp4')
], { stdio: 'inherit' });

// Clip C: 238s à 248s (Zoom fibres/peau)
execFileSync(ffmpegPath, [
  '-ss', '238',
  '-i', videoPath,
  '-t', '10',
  '-c:v', 'libx264',
  '-c:a', 'aac',
  '-y',
  path.join(outDir, 'clip_fibers_10s.mp4')
], { stdio: 'inherit' });

console.log('Cuts finished!');
