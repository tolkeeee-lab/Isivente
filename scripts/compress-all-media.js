const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const VIDEOS_DIR = path.join(__dirname, '..', 'public', 'videos');

async function compressImages() {
  console.log('--- 📸 COMPRESSION DES IMAGES AVEC SHARP ---');
  if (!fs.existsSync(IMAGES_DIR)) return;

  const files = fs.readdirSync(IMAGES_DIR);
  let totalOrig = 0;
  let totalNew = 0;
  let count = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const filePath = path.join(IMAGES_DIR, file);
    const stat = fs.statSync(filePath);
    const origSize = stat.size;
    totalOrig += origSize;

    const tmpPath = path.join(IMAGES_DIR, `_tmp_${file}`);

    try {
      let pipeline = sharp(filePath);
      const metadata = await pipeline.metadata();

      // Redimensionner si largeur > 1280px
      if (metadata.width && metadata.width > 1280) {
        pipeline = pipeline.resize({ width: 1280, withoutEnlargement: true });
      }

      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 80 });
      }

      await pipeline.toFile(tmpPath);
      const newStat = fs.statSync(tmpPath);

      if (newStat.size < origSize) {
        fs.unlinkSync(filePath);
        fs.renameSync(tmpPath, filePath);
        totalNew += newStat.size;
        const savedPct = Math.round(((origSize - newStat.size) / origSize) * 100);
        console.log(`✓ ${file}: ${(origSize / 1024).toFixed(0)}KB -> ${(newStat.size / 1024).toFixed(0)}KB (-${savedPct}%)`);
        count++;
      } else {
        fs.unlinkSync(tmpPath);
        totalNew += origSize;
      }
    } catch (err) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      console.error(`✗ Erreur sur ${file}:`, err.message);
      totalNew += origSize;
    }
  }

  const savedMB = ((totalOrig - totalNew) / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Images compressées: ${count} fichiers. Économie: ${savedMB} Mo\n`);
}

function compressVideos() {
  console.log('--- 🎬 COMPRESSION DES VIDÉOS AVEC FFMPEG ---');
  if (!fs.existsSync(VIDEOS_DIR)) return;

  const files = fs.readdirSync(VIDEOS_DIR);
  let totalOrig = 0;
  let totalNew = 0;
  let count = 0;

  for (const file of files) {
    if (!file.endsWith('.mp4') || file.startsWith('_tmp_')) continue;

    const filePath = path.join(VIDEOS_DIR, file);
    const stat = fs.statSync(filePath);
    const origSize = stat.size;
    totalOrig += origSize;

    const tmpPath = path.join(VIDEOS_DIR, `_tmp_${file}`);

    try {
      console.log(`⏳ Compression de ${file} (${(origSize / (1024 * 1024)).toFixed(1)} Mo)...`);
      
      // Paramètres de compression web ultra-efficaces:
      // - CRF 28 (visuellement très net pour mobile, poids divisé par 4 à 8)
      // - Largeur max 720p (idéal pour mobile/tablette sur landing page)
      // - faststart (streaming immédiat sans attendre le téléchargement complet)
      execFileSync(ffmpegPath, [
        '-y',
        '-i', filePath,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-vf', "scale='min(720,iw)':-2",
        '-acodec', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        tmpPath
      ], { stdio: 'ignore' });

      if (fs.existsSync(tmpPath)) {
        const newStat = fs.statSync(tmpPath);
        if (newStat.size < origSize) {
          fs.unlinkSync(filePath);
          fs.renameSync(tmpPath, filePath);
          totalNew += newStat.size;
          const savedPct = Math.round(((origSize - newStat.size) / origSize) * 100);
          console.log(`✓ ${file}: ${(origSize / (1024 * 1024)).toFixed(1)}Mo -> ${(newStat.size / (1024 * 1024)).toFixed(1)}Mo (-${savedPct}%)`);
          count++;
        } else {
          fs.unlinkSync(tmpPath);
          totalNew += origSize;
          console.log(`- ${file} déjà optimal.`);
        }
      }
    } catch (err) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      console.error(`✗ Erreur sur ${file}:`, err.message);
      totalNew += origSize;
    }
  }

  const savedMB = ((totalOrig - totalNew) / (1024 * 1024)).toFixed(2);
  const finalMB = (totalNew / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Vidéos compressées: ${count} fichiers. Économie: ${savedMB} Mo. Poids final total: ${finalMB} Mo\n`);
}

async function run() {
  await compressImages();
  compressVideos();
}

run();
