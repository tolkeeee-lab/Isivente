const fs = require('fs');
const path = require('path');

// 1. Audit defaultCatalog images
const catalogPath = path.join(__dirname, '..', 'lib', 'defaultCatalog.ts');
const catalogContent = fs.readFileSync(catalogPath, 'utf8');
const catalogMatches = catalogContent.match(/\/images\/[a-zA-Z0-9._-]+/g) || [];

console.log('=== AUDIT DES IMAGES DU CATALOGUE ===');
let missingCount = 0;
const checked = new Set();

for (const match of catalogMatches) {
  if (checked.has(match)) continue;
  checked.add(match);
  const fullPath = path.join(__dirname, '..', 'public', match.replace(/^\//, ''));
  const exists = fs.existsSync(fullPath);
  if (!exists) {
    console.error(`❌ IMAGE MANQUANTE : ${match}`);
    missingCount++;
  } else {
    console.log(`✅ ${match}`);
  }
}

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

console.log('\n=== AUDIT DES ASSETS DANS TOUT LE PROJET ===');
const allSourceFiles = [...scanDir(path.join(__dirname, '..', 'app')), ...scanDir(path.join(__dirname, '..', 'components'))];
const mediaRegex = /['"](\/(?:images|videos)\/[a-zA-Z0-9._-]+)['"]/g;
let brokenAssets = [];

for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = mediaRegex.exec(content)) !== null) {
    const assetPath = match[1];
    const fullPath = path.join(__dirname, '..', 'public', assetPath.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      brokenAssets.push({ file: path.relative(path.join(__dirname, '..'), file), asset: assetPath });
    }
  }
}

if (brokenAssets.length === 0) {
  console.log('✅ Aucun asset cassé ou manquant dans tout le projet !');
} else {
  console.log(`❌ ${brokenAssets.length} références d'assets introuvables :`);
  brokenAssets.forEach(b => console.log(`- ${b.asset} dans ${b.file}`));
}
