const { spawnSync } = require('child_process');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const input = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_01.jpg');
const output = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_01_masked.jpg');

// We test covering the English box with a clean French badge
// Box in original is white with black text:
// Let's create a matching clean white box with black text or stylish black box
const vf = `drawbox=x=70:y=280:w=940:h=180:color=black@0.25:t=fill,drawbox=x=74:y=284:w=932:h=172:color=white:t=fill,drawtext=fontfile='${font}':text='ACCRO AUX ÉCRANS ?':fontcolor=black:fontsize=50:x=(w-text_w)/2:y=305,drawtext=fontfile='${font}':text='Voici la vraie alternative !':fontcolor=0xD9381E:fontsize=46:x=(w-text_w)/2:y=375`;

spawnSync(ffmpeg, ['-i', input, '-vf', vf, '-y', output]);
console.log('Done rendering test mask');
