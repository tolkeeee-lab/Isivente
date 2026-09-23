const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\fenou\\.gemini\\antigravity-ide\\brain\\7d7deeb2-a255-4f47-865c-7bbdce5fd010';
const desktopVideosDir = 'C:\\Users\\fenou\\Desktop\\VIDEOS_TIKTOK_MICROSCOPE';
const outImagesDir = path.join(__dirname, 'public', 'images');
const outVideosDir = path.join(__dirname, 'public', 'videos');

fs.mkdirSync(outImagesDir, { recursive: true });
fs.mkdirSync(outVideosDir, { recursive: true });

const imageMap = [
  {
    src: path.join(brainDir, 'microscope_hero_1788875354211.jpg'),
    dest: path.join(outImagesDir, 'microscope-monde-decouverte.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_parent_child_ad_1789003757043.jpg'),
    dest: path.join(outImagesDir, 'microscope-scientifique-action.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_skin_demo_1788875412013.jpg'),
    dest: path.join(outImagesDir, 'microscope-detection-poux.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_unboxing_kit_1789003739702.jpg'),
    dest: path.join(outImagesDir, 'microscope-cadeau-unboxing.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_money_pcb_1788875435264.jpg'),
    dest: path.join(outImagesDir, 'microscope-pcb-monnaie.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_macro_zoom_ad_1789003722689.jpg'),
    dest: path.join(outImagesDir, 'microscope-macro-zoom.webp'),
    width: 800,
  },
  {
    src: path.join(brainDir, 'microscope_tiktok_viral_ad_1789003706345.jpg'),
    dest: path.join(outImagesDir, 'microscope-video-cover.webp'),
    width: 600,
  }
];

async function run() {
  console.log('--- Optimisation des images WebP avec Sharp ---');
  for (const item of imageMap) {
    if (fs.existsSync(item.src)) {
      await sharp(item.src)
        .resize(item.width, null, { withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(item.dest);
      const s = fs.statSync(item.dest);
      console.log(`✓ ${path.basename(item.dest)}: ${(s.size / 1024).toFixed(1)} Ko`);
    } else {
      console.warn(`! Source introuvable: ${item.src}`);
    }
  }

  // Vidéo optimisée (899 Ko)
  const videoSrc = path.join(desktopVideosDir, '2_Video_Deballage_Texte_12s.mp4');
  const videoDest = path.join(outVideosDir, 'microscope-demo.mp4');
  if (fs.existsSync(videoSrc)) {
    fs.copyFileSync(videoSrc, videoDest);
    const vs = fs.statSync(videoDest);
    console.log(`✓ Vidéo copiée: microscope-demo.mp4 (${(vs.size / 1024).toFixed(1)} Ko)`);
  } else {
    console.warn(`! Vidéo introuvable: ${videoSrc}`);
  }
  console.log('--- Terminé avec succès ---');
}

run().catch(console.error);
