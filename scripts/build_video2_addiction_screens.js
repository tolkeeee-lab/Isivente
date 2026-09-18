const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'video2_addiction_prod');
const ttsDir = path.join(workDir, 'tts');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDownloads = path.join(userProfile, 'Downloads', 'MICROSCOPE_PUB_2_ADDICTION_ECRANS_VIVIENNE.mp4');
const outDesktop = path.join(userProfile, 'Desktop', 'MICROSCOPE_PUB_2_ADDICTION_ECRANS_VIVIENNE.mp4');
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-pub-2-addiction-ecrans.mp4');

[workDir, ttsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const v1Source = path.join(__dirname, 'tiktok_microscope', 'tiktok_1_7670480226048036103.mp4').replace(/\\/g, '/');
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';

// Voix Vivienne Multilingual (expressive, vivante et percutante)
async function generateVivienneTTS(text, destPath) {
  const tts = new MsEdgeTTS();
  const tempFolder = path.join(ttsDir, 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  fs.mkdirSync(tempFolder, { recursive: true });

  await tts.setMetadata('fr-FR-VivienneMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const result = await tts.toFile(tempFolder, text, { rate: '+10%', volume: '+25%' });
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

// 5 segments strictement séquentiels qui couvrent l'intégralité de la Vidéo 1 (29s)
const segments = [
  // 1. LE HOOK UNIQUE : Le cercle de jeunes, le téléphone et les microscopes
  {
    ss: 0.0,
    srcLen: 4.8,
    voice: "Votre enfant passe trop de temps sur les écrans de téléphone ? Voici comment changer ça immédiatement.",
    sub: "ADDICT AUX ÉCRANS ?\nVoici la solution magique !",
    isHook: true
  },
  // 2. DÉCOUVERTE DU PRODUIT : Balcon & Canapé microfibre
  {
    ss: 4.8,
    srcLen: 5.5,
    voice: "Ce mini-microscope de poche transforme n'importe quel objet du quotidien en une découverte fascinante.",
    sub: "MINI-MICROSCOPE DE POCHE\nExplorez l'infiniment petit !",
    isHook: false
  },
  // 3. ZOOM NATURE : Écorce d'arbre et fibres de bois
  {
    ss: 10.3,
    srcLen: 6.0,
    voice: "Plantes, bois, insectes... Son zoom haute définition révèle chaque détail invisible à l'œil nu.",
    sub: "ZOOM HAUTE DÉFINITION\nRévèle chaque fibre et texture",
    isHook: false
  },
  // 4. PRATIQUE & SANS FIL : Observation bois et surfaces
  {
    ss: 16.3,
    srcLen: 5.5,
    voice: "Ultra léger, résistant et autonome sur batterie, il s'emporte partout pour apprendre en s'amusant.",
    sub: "100% SANS FIL & RECHARGEABLE\nLéger, robuste et éducatif",
    isHook: false
  },
  // 5. CALL TO ACTION ISIVENTE BÉNIN : Gros plan produit et écran
  {
    ss: 21.8,
    srcLen: 7.4,
    voice: "Le cadeau parfait pour stimuler sa curiosité. Commandez sur Isivente, livraison rapide et paiement à la livraison au Bénin !",
    sub: "DISPONIBLE SUR ISIVENTE.COM\nPaiement à la livraison au Bénin",
    isHook: false
  }
];

async function run() {
  console.log('🎬 CRÉATION VIDÉO 2 (HOOK SMARTPHONE + NATURE EXPÉDITION)...');

  const cutFiles = [];
  const voiceFiles = [];
  const drawtextFilters = [];
  const srtEntries = [];
  let currentTime = 0;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    console.log(`\n--- Plan ${i + 1}/${segments.length} ---`);

    const audioFile = path.join(ttsDir, `voice_v2_${i}.mp3`);
    console.log(`  1. Génération voix Vivienne : "${s.voice}"`);
    await generateVivienneTTS(s.voice, audioFile);

    // Mesure durée exacte
    const probe = spawnSync(ffmpeg, ['-i', audioFile]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    voiceFiles.push(audioFile);

    console.log(`  2. Durée audio calée : ${exactDur.toFixed(2)}s`);

    const speedFactor = (exactDur / s.srcLen).toFixed(6);
    const cutOut = path.join(workDir, `cut_${i}.mp4`);

    // Format 1080x1920 vertical HD
    const cutArgs = [
      '-ss', s.ss.toString(),
      '-i', v1Source,
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

    // SOUS-TITRE FIXE EN BAS (y=1440) : recouvre 100% les sous-titres espagnols de la vidéo originale
    const subFilter = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=44:line_spacing=14:box=1:boxcolor=0x000000FA:boxborderw=22:borderw=3:bordercolor=black:shadowcolor=black@0.9:shadowx=2:shadowy=2:x=(w-text_w)/2:y=1440:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(subFilter);

    // Si c'est le Hook initial (segment 1), on remplace le badge anglais du haut par un badge français propre
    if (s.isHook) {
      const topBadgeBox = `drawbox=x=70:y=280:w=940:h=180:color=black@0.25:t=fill:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})',drawbox=x=74:y=284:w=932:h=172:color=white:t=fill:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
      const topBadgeText1 = `drawtext=fontfile='${font}':text='ACCRO AUX ÉCRANS ?':fontcolor=black:fontsize=50:x=(w-text_w)/2:y=305:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
      const topBadgeText2 = `drawtext=fontfile='${font}':text='Voici la vraie alternative !':fontcolor=0xD9381E:fontsize=46:x=(w-text_w)/2:y=375:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
      drawtextFilters.push(topBadgeBox);
      drawtextFilters.push(topBadgeText1);
      drawtextFilters.push(topBadgeText2);
    }
  }

  console.log(`\nDurée totale vidéo : ${currentTime.toFixed(2)} secondes`);

  // Concaténation Voix Vivienne
  console.log('3. Concaténation de la voix Vivienne...');
  const voiceListFile = path.join(workDir, 'voice_list.txt');
  fs.writeFileSync(voiceListFile, voiceFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const fullVoice = path.join(workDir, 'full_voice.mp3');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', voiceListFile, '-c', 'copy', '-y', fullVoice]);

  // Mixage Audio Broadcast
  console.log('4. Mixage audio broadcast (Voix dominante + compresseur vocal + beat discret)...');
  const mixedAudio = path.join(workDir, 'mixed_audio.mp3');
  spawnSync(ffmpeg, [
    '-i', fullVoice,
    '-stream_loop', '-1',
    '-i', bgMusic,
    '-filter_complex', '[0:a]volume=1.65,acompressor=threshold=-18dB:ratio=3:attack=10:release=100[voice];[1:a]volume=0.07[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=2',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-y',
    mixedAudio
  ]);

  // Concaténation Vidéo (Fluide et continue)
  console.log('5. Concaténation des plans vidéo...');
  const videoListFile = path.join(workDir, 'video_list.txt');
  fs.writeFileSync(videoListFile, cutFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const rawConcatVideo = path.join(workDir, 'raw_concat.mp4');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', videoListFile, '-c', 'copy', '-y', rawConcatVideo]);

  // Rendu Final
  console.log('6. Rendu final avec mastering sous-titres et audio...');
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
    console.error('Erreur rendu final:', renderRes.stderr.toString());
    return;
  }

  // Distribution vers Téléchargements, Bureau et Public
  console.log('7. Exportation vers Téléchargements et Bureau...');
  fs.copyFileSync(finalRender, outDownloads);
  fs.copyFileSync(finalRender, outDesktop);

  const pubDir = path.dirname(outPublic);
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
  fs.copyFileSync(finalRender, outPublic);

  console.log('\n✅ SUCCÈS ! La 2ème vidéo est prête :');
  console.log(`- Téléchargements : ${outDownloads}`);
  console.log(`- Bureau          : ${outDesktop}`);
  console.log(`- Web Public      : ${outPublic}`);
}

run().catch(console.error);
