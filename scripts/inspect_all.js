const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const videoPath = path.join(__dirname, 'raw_source_1.mp4');
const outDir = path.join(__dirname, 'frames_all');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Extracting overview frames...');
// 1 frame toutes les 15 secondes
execFileSync(ffmpegPath, [
  '-i', videoPath,
  '-vf', 'fps=1/15,scale=640:-1',
  '-q:v', '2',
  path.join(outDir, 'sec_%03d.jpg')
], { stdio: 'inherit' });

console.log('Overview frames extracted to:', outDir);
