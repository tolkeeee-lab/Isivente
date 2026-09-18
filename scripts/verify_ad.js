const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const videoPath = path.join(__dirname, '..', 'public', 'videos', 'microscope-facebook-ad-10s.mp4');
const outDir = path.join(__dirname, 'final_ad_frames');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

execFileSync(ffmpegPath, [
  '-i', videoPath,
  '-vf', 'fps=1',
  '-q:v', '2',
  path.join(outDir, 'frame_%02d.jpg')
], { stdio: 'ignore' });

console.log('Frames extracted to:', outDir);
