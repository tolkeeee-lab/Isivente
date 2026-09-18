const { execFileSync } = require('child_process');
const path = require('path');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const inputVideo = 'C:\\Users\\fenou\\Downloads\\Script_Le_Multi_Passions_.mp4';
const outAudio = path.join(__dirname, 'multipassions_audio.wav');

execFileSync(ffmpegPath, [
  '-i', inputVideo,
  '-vn',
  '-acodec', 'pcm_s16le',
  '-ar', '16000',
  '-ac', '1',
  '-y',
  outAudio
], { stdio: 'inherit' });

console.log('Audio extracted:', outAudio);
