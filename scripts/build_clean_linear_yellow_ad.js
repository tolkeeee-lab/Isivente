const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'clean_linear_prod');
const ttsDir = path.join(workDir, 'tts');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDownloads = path.join(userProfile, 'Downloads', 'MICROSCOPE_JAUNE_PUB_PRO.mp4');
const outDesktop = path.join(userProfile, 'Desktop', 'MICROSCOPE_JAUNE_PUB_PRO.mp4');
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-jaune-pub-pro.mp4');

[workDir, ttsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const v3Brocoli = path.join(__dirname, 'tiktok_microscope', 'tiktok_3_7643777690541083917.mp4').replace(/\\/g, '/');
const v2Deballage = path.join(__dirname, 'tiktok_microscope', 'tiktok_2_7582371229642788127.mp4').replace(/\\/g, '/');
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';

// Voix IA Microsoft Edge Henri (naturelle, forte, confiante)
async function generateNeuralTTS(text, destPath) {
  const tts = new MsEdgeTTS();
  const tempFolder = path.join(ttsDir, 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  fs.mkdirSync(tempFolder, { recursive: true });

  await tts.setMetadata('fr-FR-HenriNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const result = await tts.toFile(tempFolder, text, { rate: '+10%' });
  tts.close();

  fs.copyFileSync(result.audioFilePath, destPath);
  fs.rmSync(tempFolder, { recursive: true, force: true });
}

function formatTime(s) {
  const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
  const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(s % 60).toString().padStart(2, '0');
  const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
  return `${hrs}:${mins}:${secs},${ms}`;
}

// 4 plans strictement linéaires : Brocoli (Hook unique) -> Déballage -> Zoom texte -> Offre
const segments = [
  // 1. LE HOOK UNIQUE (Brocoli - Vidéo 3 - 0s à 3s)
  {
    src: v3Brocoli,
    ss: 0.0,
    srcLen: 3.2,
    voice: "Regardez bien ce qui se cache à l'intérieur d'un simple brocoli !",
    sub: "REGARDEZ BIEN CET ÉCRAN !\nDécouverte incroyable en direct"
  },
  // 2. LE DÉBALLAGE FLUIDE (Vidéo 2 - 0s à 4.8s)
  {
    src: v2Deballage,
    ss: 0.0,
    srcLen: 4.8,
    voice: "Voici le mini-microscope de poche numérique : léger, robuste et 100% autonome sur batterie.",
    sub: "MINI-MICROSCOPE DE POCHE\n100% sans fil sur batterie"
  },
  // 3. LA DÉMONSTRATION ZOOM EN DIRECT (Vidéo 2 - 5.5s à 11s)
  {
    src: v2Deballage,
    ss: 5.5,
    srcLen: 5.8,
    voice: "Son zoom haute définition révèle les moindres détails. Éloignez enfin vos enfants des écrans de téléphone !",
    sub: "ZOOM HAUTE DÉFINITION\nÉloignez vos enfants des téléphones"
  },
  // 4. L'OFFRE FINALE (Vidéo 2 - 2.5s à 6.8s)
  {
    src: v2Deballage,
    ss: 2.5,
    srcLen: 4.3,
    voice: "Le cadeau éducatif idéal. Commandez sur Isivente, livraison rapide et paiement à la livraison partout au Bénin !",
    sub: "DISPONIBLE SUR ISIVENTE\nPaiement à la livraison au Bénin"
  }
];

async function run() {
  console.log('🎬 CRÉATION DU MONTAGE LINÉAIRE PRO (Voix Forte + Zéro Saut)...');

  const cutFiles = [];
  const voiceFiles = [];
  const drawtextFilters = [];
  const srtEntries = [];
  let currentTime = 0;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    console.log(`\n--- Plan ${i + 1}/${segments.length} ---`);

    const audioFile = path.join(ttsDir, `voice_henri_${i}.mp3`);
    console.log(`  1. Génération voix forte Henri : "${s.voice}"`);
    await generateNeuralTTS(s.voice, audioFile);

    // Mesure durée exacte
    const probe = spawnSync(ffmpeg, ['-i', audioFile]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    voiceFiles.push(audioFile);

    console.log(`  2. Durée calée : ${exactDur.toFixed(2)}s`);

    const speedFactor = (exactDur / s.srcLen).toFixed(6);
    const cutOut = path.join(workDir, `cut_${i}.mp4`);

    // Format 1080x1920 propre
    const cutArgs = [
      '-ss', s.ss.toString(),
      '-i', s.src,
      '-t', s.srcLen.toString(),
      '-vf', `setpts=(PTS-STARTPTS)*${speedFactor},scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30`,
      '-t', exactDur.toFixed(3),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '19',
      '-an',
      '-y',
      cutOut
    ];

    const cutRes = spawnSync(ffmpeg, cutArgs);
    if (cutRes.status !== 0) {
      console.error(`  Erreur découpe ${i}:`, cutRes.stderr.toString());
      return;
    }
    cutFiles.push(cutOut);

    const txtPath = path.join(workDir, `sub_${i}.txt`);
    fs.writeFileSync(txtPath, s.sub, 'utf8');

    const startT = currentTime;
    const endT = currentTime + exactDur;
    currentTime = endT;

    srtEntries.push(`${i + 1}\n${formatTime(startT)} --> ${formatTime(endT)}\n${s.sub}\n`);

    const escapedTxt = txtPath.replace(/\\/g, '/').replace(':', '\\:');

    // UN SEUL SOUS-TITRE FIXE EN BAS (y=h-360) : bandeau sombre translucide + lettrage blanc gras
    const subFilter = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=44:line_spacing=12:box=1:boxcolor=0x000000CC:boxborderw=16:borderw=3:bordercolor=black:shadowcolor=black@0.9:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-360:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(subFilter);
  }

  console.log(`\nDurée totale : ${currentTime.toFixed(2)} secondes`);

  // Concaténation Audio
  console.log('3. Concaténation voix-off...');
  const voiceListFile = path.join(workDir, 'voice_list.txt');
  fs.writeFileSync(voiceListFile, voiceFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const fullVoice = path.join(workDir, 'full_voice.mp3');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', voiceListFile, '-c', 'copy', '-y', fullVoice]);

  // Mixage : Voix forte (volume=1.45) + Musique de fond très discrète (volume=0.08)
  console.log('4. Mixage audio voix forte + musique...');
  const mixedAudio = path.join(workDir, 'mixed_audio.mp3');
  spawnSync(ffmpeg, [
    '-i', fullVoice,
    '-stream_loop', '-1',
    '-i', bgMusic,
    '-filter_complex', '[0:a]volume=1.45[voice];[1:a]volume=0.08[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=2',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-y',
    mixedAudio
  ]);

  // Concaténation Vidéo (Plans lisses, zéro va-et-vient)
  console.log('5. Concaténation des plans linéaires...');
  const videoListFile = path.join(workDir, 'video_list.txt');
  fs.writeFileSync(videoListFile, cutFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const rawConcatVideo = path.join(workDir, 'raw_concat.mp4');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', videoListFile, '-c', 'copy', '-y', rawConcatVideo]);

  // Rendu Final avec le sous-titre fixe en bas
  console.log('6. Rendu final...');
  const finalRender = path.join(workDir, 'final_rendered.mp4');
  const fullVf = drawtextFilters.join(',');

  const renderRes = spawnSync(ffmpeg, [
    '-i', rawConcatVideo,
    '-i', mixedAudio,
    '-vf', fullVf,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    '-y',
    finalRender
  ]);

  if (renderRes.status !== 0) {
    console.error('Erreur rendu final :', renderRes.stderr.toString());
    return;
  }

  // Copie vers Téléchargements et Bureau
  fs.copyFileSync(finalRender, outDownloads);
  fs.copyFileSync(finalRender, outDesktop);
  fs.copyFileSync(finalRender, outPublic);

  // Remplace également l'ancien fichier
  const oldDl = path.join(userProfile, 'Downloads', 'MICROSCOPE_JAUNE_PUB_ISIVENTE.mp4');
  fs.copyFileSync(finalRender, oldDl);

  const stats = fs.statSync(outDownloads);
  console.log(`\n🎉 SUCCÈS : NOUVELLE VIDÉO NETTE & LINÉAIRE TERMINÉE !`);
  console.log(`   - Fichier : ${outDownloads} (${(stats.size / 1024 / 1024).toFixed(2)} Mo)`);
  console.log(`   - Durée : ${currentTime.toFixed(1)} secondes`);
}

run().catch(console.error);
