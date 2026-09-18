const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const inputVideo = 'C:\\Users\\fenou\\Downloads\\Script_Le_Multi_Passions_.mp4';
const outDir = path.join(__dirname, 'inspect_script_multipassions');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Inspecting Script_Le_Multi_Passions_.mp4...');

// Extraire 1 frame toutes les secondes sur les 15 premières secondes
execFileSync(ffmpegPath, [
  '-i', inputVideo,
  '-t', '15',
  '-vf', 'fps=1,scale=640:-1',
  '-q:v', '2',
  path.join(outDir, 'sec_%02d.jpg')
], { stdio: 'inherit' });

console.log('Frames extracted to:', outDir);
