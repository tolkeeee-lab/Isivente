const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

const texts = [
  "Votre enfant passe trop de temps sur les écrans de téléphone ? Voici comment changer ça immédiatement.",
  "Ce mini-microscope de poche transforme n'importe quel objet du quotidien en une découverte fascinante.",
  "Plantes, bois, insectes... Son zoom haute définition révèle chaque détail invisible à l'œil nu.",
  "Ultra léger, résistant et autonome sur batterie, il s'emporte partout pour apprendre en s'amusant.",
  "Le cadeau parfait pour stimuler sa curiosité. Commandez sur Isivente, livraison rapide et paiement à la livraison au Bénin !"
];

async function test() {
  const dir = path.join(__dirname, 'test_tts_v2');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata('fr-FR-VivienneMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  let totalDur = 0;
  for (let i = 0; i < texts.length; i++) {
    const tempDir = path.join(dir, 'tmp_' + i);
    fs.mkdirSync(tempDir, { recursive: true });
    const res = await tts.toFile(tempDir, texts[i], { rate: '+10%', volume: '+25%' });
    const probe = spawnSync(ffmpeg, ['-i', res.audioFilePath]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    totalDur += exactDur;
    console.log(`Segment ${i + 1}: ${exactDur.toFixed(2)}s -> "${texts[i]}"`);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log(`Total duration: ${totalDur.toFixed(2)}s`);
  tts.close();
}

test();
