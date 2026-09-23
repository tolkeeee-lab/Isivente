const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const baseDir = path.join(__dirname, '..');

function getFiles(dir, filter) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          results = results.concat(getFiles(full, filter));
        }
      } else if (!filter || filter(full)) {
        results.push(full);
      }
    });
  } catch (e) {}
  return results;
}

const codeFiles = getFiles(baseDir, f => f.endsWith('.tsx') || f.endsWith('.ts'));
const imageRegex = /["']\/images\/([^"']+)["']/g;
const videoRegex = /["']\/videos\/([^"']+)["']/g;

const missingImages = new Set();
const missingVideos = new Set();
const foundImages = new Set();

codeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imgPath = path.join(publicDir, 'images', match[1]);
    if (!fs.existsSync(imgPath)) {
      missingImages.add(`${match[1]} (dans ${path.relative(baseDir, file)})`);
    } else {
      foundImages.add(match[1]);
    }
  }
  while ((match = videoRegex.exec(content)) !== null) {
    const vidPath = path.join(publicDir, 'videos', match[1]);
    if (!fs.existsSync(vidPath)) {
      missingVideos.add(`${match[1]} (dans ${path.relative(baseDir, file)})`);
    }
  }
});

console.log('=== IMAGES MANQUANTES (' + missingImages.size + ') ===');
missingImages.forEach(m => console.log('  -', m));

console.log('\n=== VIDEOS MANQUANTES (' + missingVideos.size + ') ===');
missingVideos.forEach(m => console.log('  -', m));

console.log('\n=== IMAGES PRÉSENTES ET VALIDES (' + foundImages.size + ') ===');
foundImages.forEach(m => console.log('  +', m));
