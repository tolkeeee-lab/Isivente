const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const input = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_04.jpg');
const output = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'f_04_test_sub2.jpg');
const txtPath = path.join(__dirname, 'tiktok_microscope', 'v1_frames', 'sub_test.txt');

fs.writeFileSync(txtPath, "MINI-MICROSCOPE DE POCHE\nExplorez l'infiniment petit !", 'utf8');

const escapedTxt = txtPath.replace(/\\/g, '/').replace(':', '\\:');

// y=1440 with boxborderw=20, boxcolor=0x000000FA (98% solid black)
const vf = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=44:line_spacing=14:box=1:boxcolor=0x000000FA:boxborderw=22:borderw=3:bordercolor=black:shadowcolor=black@0.9:shadowx=2:shadowy=2:x=(w-text_w)/2:y=1440`;

spawnSync(ffmpeg, ['-i', input, '-vf', vf, '-y', output]);
console.log('Rendered test subtitle 2 on f_04');
