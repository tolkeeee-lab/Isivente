const { spawnSync } = require('child_process');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const input = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_04.jpg');
const output = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_04_test_sub.jpg');

// Let's test with sub at y=h-440 vs y=h-360 to see if it covers the Spanish text
const subText = "MINI-MICROSCOPE DE POCHE\\nExplorez l'infiniment petit !";
const vf = `drawtext=fontfile='${font}':text='${subText}':fontcolor=white:fontsize=44:line_spacing=12:box=1:boxcolor=0x000000E6:boxborderw=20:borderw=3:bordercolor=black:x=(w-text_w)/2:y=1420`;

spawnSync(ffmpeg, ['-i', input, '-vf', vf, '-y', output]);
console.log('Rendered test subtitle on f_04');
