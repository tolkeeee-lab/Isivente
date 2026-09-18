const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

const texts = [
  "Fini les enfants scotchés sur les téléphones ! Regardez ce qu'on leur a donné à la place.",
  "Dehors sur les gouttes d'eau, ou à la maison sur le tissu d'un canapé, chaque fibre apparaît en gros plan sur l'écran !",
  "Même l'écorce d'un arbre ou une simple planche de bois révèlent des détails microscopiques impressionnants.",
  "La lumière LED intégrée illumine tout automatiquement. Les enfants explorent le monde réel pendant des heures !",
  "Commandez le mini-microscope sur Isivente Bénin ! La livraison est rapide et vous payez directement à la réception."
];

async function test() {
  const dir = path.join(__dirname, 'test_v2_1_3');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata('fr-FR-VivienneMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  for (let i = 0; i < texts.length; i++) {
    const tempDir = path.join(dir, 'tmp_' + i);
    fs.mkdirSync(tempDir, { recursive: true });
    // Rate +30% is 1.3x speed!
    const res = await tts.toFile(tempDir, texts[i], { rate: '+30%', volume: '+25%' });
    const probe = spawnSync(ffmpeg, ['-i', res.audioFilePath]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    console.log(`Segment ${i + 1} (1.3x): ${exactDur.toFixed(2)}s -> "${texts[i]}"`);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  tts.close();
}

test();
