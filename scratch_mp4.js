const fs = require('fs');

// Read basic mp4 info
const buf = fs.readFileSync('public/videos/trozk-hero-1.mp4');
console.log('File size:', buf.length);
// Find mvhd atom
const mvhdIndex = buf.indexOf(Buffer.from('mvhd'));
if (mvhdIndex !== -1) {
  const version = buf.readUInt8(mvhdIndex + 4);
  const timescale = version === 0 ? buf.readUInt32BE(mvhdIndex + 16) : buf.readUInt32BE(mvhdIndex + 24);
  const duration = version === 0 ? buf.readUInt32BE(mvhdIndex + 20) : Number(buf.readBigUInt64BE(mvhdIndex + 28));
  console.log('Timescale:', timescale, 'Duration in timescale units:', duration);
  console.log('Total Duration (seconds):', duration / timescale);
}
