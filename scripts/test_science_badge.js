const { spawnSync } = require('child_process');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const input = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_01.jpg');
const output = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_01_science_badge.jpg');

const vf = `drawbox=x=70:y=280:w=940:h=180:color=black@0.25:t=fill,drawbox=x=74:y=284:w=932:h=172:color=white:t=fill,drawtext=fontfile='${font}':text='LE MINI-LABO DE POCHE':fontcolor=black:fontsize=50:x=(w-text_w)/2:y=305,drawtext=fontfile='${font}':text='Explorez le monde invisible en direct !':fontcolor=0x0066CC:fontsize=44:x=(w-text_w)/2:y=375`;

spawnSync(ffmpeg, ['-i', input, '-vf', vf, '-y', output]);
console.log('Badge rendered');
