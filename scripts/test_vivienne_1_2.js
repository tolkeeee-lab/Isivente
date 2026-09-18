const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

const texts = [
  "Oubliez les jouets ordinaires ! Voici le laboratoire de poche qui passionne tous les enfants dès aujourd'hui.",
  "Dehors sur des gouttes d'eau ou à l'intérieur sur les tissus, il révèle les détails microscopiques en direct.",
  "Un tronc d'arbre, une planche de bois... Son zoom haute définition affiche la structure interne des matières.",
  "Grâce à sa lumière LED puissante et sa batterie rechargeable, explorer la science devient un vrai jeu d'enfant.",
  "Offrez-lui le meilleur cadeau pour développer sa curiosité. Commandez sur Isivente, avec paiement à la livraison au Bénin !"
];

async function test() {
  const dir = path.join(__dirname, 'test_v2_1_2');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata('fr-FR-VivienneMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  for (let i = 0; i < texts.length; i++) {
    const tempDir = path.join(dir, 'tmp_' + i);
    fs.mkdirSync(tempDir, { recursive: true });
    // Rate +20% is 1.2x speed!
    const res = await tts.toFile(tempDir, texts[i], { rate: '+20%', volume: '+25%' });
    const probe = spawnSync(ffmpeg, ['-i', res.audioFilePath]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    console.log(`Segment ${i + 1} (1.2x): ${exactDur.toFixed(2)}s -> "${texts[i]}"`);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  tts.close();
}

test();
