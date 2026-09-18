const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const videoPath = path.join(__dirname, 'raw_source_1.mp4');
const outDir = path.join(__dirname, 'frames_157');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Extracting frames around 157s...');
// Extraire 1 image toutes les 2 secondes entre 155s et 185s
execFileSync(ffmpegPath, [
  '-ss', '155',
  '-i', videoPath,
  '-t', '35',
  '-vf', 'fps=0.5,scale=640:-1',
  '-q:v', '2',
  path.join(outDir, 'frame_%02d.jpg')
], { stdio: 'inherit' });

console.log('Frames extracted to:', outDir);
