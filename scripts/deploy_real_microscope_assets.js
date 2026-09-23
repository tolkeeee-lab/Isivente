const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const tempDir = 'C:\\Users\\fenou\\.gemini\\antigravity-ide\\brain\\7d7deeb2-a255-4f47-865c-7bbdce5fd010\\.tempmediaStorage';
const outDir = path.join(__dirname, '..', 'public', 'images');

fs.mkdirSync(outDir, { recursive: true });

// Mapping of verified authentic user/supplier product photos
const assets = [
  // Core Product & Hero
  {
    src: 'media_1789606670208.jpg',
    base: 'microscope-real-infographic',
    width: 1000
  },
  {
    src: 'media_1789617542328.jpg',
    base: 'microscope-real-action-broccoli',
    width: 1000
  },
  {
    src: 'media_1789610377031.jpg',
    base: 'microscope-real-action-leaf',
    width: 1000
  },
  {
    src: 'media_1789620484702.jpg',
    base: 'microscope-real-kids-outdoor',
    width: 1000
  },
  {
    src: 'media_1789606649045.jpg',
    base: 'microscope-real-desk',
    width: 1000
  },
  {
    src: 'media_1789610340018.jpg',
    base: 'microscope-real-presenter',
    width: 1000
  },
  {
    src: 'media_1789620504582.jpg',
    base: 'microscope-real-bark-zoom',
    width: 1000
  },
  // Macro Explorations
  {
    src: 'media_1789606656696.jpg',
    base: 'microscope-macro-fibre',
    width: 800
  },
  {
    src: 'media_1789606663304.jpg',
    base: 'microscope-macro-gears',
    width: 800
  },
  {
    src: 'media_1789619502149.jpg',
    base: 'microscope-macro-fabric',
    width: 800
  },
  {
    src: 'media_1789620494904.jpg',
    base: 'microscope-macro-nature',
    width: 800
  },
  {
    src: 'media_1789605495175.jpg',
    base: 'microscope-real-offer-banner',
    width: 1000
  }
];

async function deploy() {
  console.log('--- Déploiement des Vraies Photos Microscope (0% IA) ---');
  let successCount = 0;

  for (const item of assets) {
    const srcPath = path.join(tempDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.error(`❌ Source introuvable: ${srcPath}`);
      continue;
    }

    const webpPath = path.join(outDir, `${item.base}.webp`);
    const jpgPath = path.join(outDir, `${item.base}.jpg`);

    // 1. Export WebP optimisé pour mobile
    await sharp(srcPath)
      .resize(item.width, null, { withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(webpPath);

    // 2. Export JPG fallback haute fidélité
    await sharp(srcPath)
      .resize(item.width, null, { withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(jpgPath);

    const sWebp = fs.statSync(webpPath);
    const sJpg = fs.statSync(jpgPath);
    console.log(`✓ ${item.base} : WebP ${(sWebp.size/1024).toFixed(1)} Ko | JPG ${(sJpg.size/1024).toFixed(1)} Ko`);
    successCount++;
  }

  console.log(`--- Terminé : ${successCount}/${assets.length} photos réelles déployées ---`);
}

deploy().catch(console.error);
