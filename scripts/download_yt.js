const { execFileSync } = require('child_process');
const path = require('path');

const ytdlpPath = path.join(__dirname, 'yt-dlp.exe');
const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const output = path.join(__dirname, 'raw_source_1.mp4');
const url = 'https://youtu.be/fs-LmqDPQT4';

console.log('Fetching video from:', url);
try {
  execFileSync(ytdlpPath, [
    '--ffmpeg-location', ffmpegPath,
    '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best',
    '--merge-output-format', 'mp4',
    '-o', output,
    url
  ], { stdio: 'inherit' });
  console.log('Download complete:', output);
} catch (err) {
  console.error('Download error:', err.message);
}
