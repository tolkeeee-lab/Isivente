const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'video2_perfect_prod');
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

// 5 moments clés alignés sur les coupures naturelles de la vidéo 1 originale (29.23s)
const scenes = [
  {
    start: 0.00,
    end: 5.67,
    audioDelayMs: 300,
    voice: "Votre enfant passe trop de temps sur les écrans de téléphone ? Voici comment changer ça immédiatement.",
    sub: "ADDICT AUX ÉCRANS ?\nVoici l'alternative magique !",
    isHook: true
  },
  {
    start: 5.67,
    end: 11.63,
    audioDelayMs: 5800,
    voice: "Ce mini-microscope de poche transforme n'importe quel objet du quotidien en une découverte fascinante.",
    sub: "MINI-MICROSCOPE DE POCHE\nExplorez l'infiniment petit !",
    isHook: false
  },
  {
    start: 11.63,
    end: 17.50,
    audioDelayMs: 11750,
    voice: "Plantes, bois, insectes... Son zoom haute définition révèle chaque détail invisible à l'œil nu.",
    sub: "ZOOM HAUTE DÉFINITION\nRévèle chaque fibre et texture",
    isHook: false
  },
  {
    start: 17.50,
    end: 23.00,
    audioDelayMs: 17600,
    voice: "Ultra léger, résistant et autonome sur batterie, il s'emporte partout pour apprendre en s'amusant.",
    sub: "AUTONOME & SANS FIL SUR BATTERIE\nLéger, robuste et éducatif",
    isHook: false
  },
  {
    start: 23.00,
    end: 29.23,
    audioDelayMs: 23100,
    voice: "Offrez-lui le meilleur cadeau éducatif. Commandez sur Isivente, livraison rapide et paiement à la livraison au Bénin !",
    sub: "DISPONIBLE SUR ISIVENTE.COM\nPaiement à la livraison au Bénin",
    isHook: false
  }
];

async function run() {
  console.log('🚀 DÉMARRAGE RENDU PARFAIT VIDÉO 2...');

  const voiceInputs = [];
  const voiceFilters = [];
  const videoFilters = [];

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    console.log(`\n--- Préparation Voix ${i + 1}/5 ---`);
    const audioPath = path.join(ttsDir, `voice_${i}.mp3`);
    console.log(`  Texte: "${sc.voice}"`);
    await generateVivienneTTS(sc.voice, audioPath);

    voiceInputs.push('-i', audioPath);
    // adelay pour caler la voix au milliseconde près
    voiceFilters.push(`[${i}:a]adelay=${sc.audioDelayMs}|${sc.audioDelayMs}[v${i}]`);

    // Sous-titre continu (aucun trou entre les sous-titres !)
    const txtPath = path.join(workDir, `sub_${i}.txt`);
    fs.writeFileSync(txtPath, sc.sub, 'utf8');
    const escapedTxt = txtPath.replace(/\\/g, '/').replace(':', '\\:');

    // Sous-titre fixe en bas (y=1440) recouvrant 100% le texte espagnol d'origine
    const subFilter = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=44:line_spacing=14:box=1:boxcolor=0x000000FA:boxborderw=24:borderw=3:bordercolor=black:shadowcolor=black@0.9:shadowx=2:shadowy=2:x=(w-text_w)/2:y=1440:enable='between(t\\,${sc.start.toFixed(2)}\\,${sc.end.toFixed(2)})'`;
    videoFilters.push(subFilter);

    // Badge français du haut uniquement pendant toute la durée du Hook (0s à 5.67s)
    if (sc.isHook) {
      const topBadgeBox = `drawbox=x=70:y=280:w=940:h=180:color=black@0.25:t=fill:enable='between(t\\,${sc.start.toFixed(2)}\\,${sc.end.toFixed(2)})',drawbox=x=74:y=284:w=932:h=172:color=white:t=fill:enable='between(t\\,${sc.start.toFixed(2)}\\,${sc.end.toFixed(2)})'`;
      const topBadgeText1 = `drawtext=fontfile='${font}':text='ACCRO AUX ÉCRANS ?':fontcolor=black:fontsize=50:x=(w-text_w)/2:y=305:enable='between(t\\,${sc.start.toFixed(2)}\\,${sc.end.toFixed(2)})'`;
      const topBadgeText2 = `drawtext=fontfile='${font}':text='Voici la vraie alternative !':fontcolor=0xD9381E:fontsize=46:x=(w-text_w)/2:y=375:enable='between(t\\,${sc.start.toFixed(2)}\\,${sc.end.toFixed(2)})'`;
      videoFilters.push(topBadgeBox);
      videoFilters.push(topBadgeText1);
      videoFilters.push(topBadgeText2);
    }
  }

  // 1. Mixage de la piste audio complète (Voix Vivienne + Musique de fond)
  console.log('\n2. Mixage de la voix Vivienne avec musique de fond...');
  const mixedAudio = path.join(workDir, 'full_audio_mix.mp3');
  const adelayOutputs = scenes.map((_, i) => `[v${i}]`).join('');
  const audioFilterComplex = `${voiceFilters.join(';')};${adelayOutputs}amix=inputs=${scenes.length}:duration=longest:dropout_transition=0[voice_raw];[voice_raw]volume=1.75,acompressor=threshold=-18dB:ratio=3:attack=10:release=100[voice_master];[${scenes.length}:a]volume=0.07[music];[voice_master][music]amix=inputs=2:duration=first:dropout_transition=2`;

  const audioArgs = [
    ...voiceInputs,
    '-stream_loop', '-1',
    '-i', bgMusic,
    '-filter_complex', audioFilterComplex,
    '-t', '29.23',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-y',
    mixedAudio
  ];

  const audioRes = spawnSync(ffmpeg, audioArgs);
  if (audioRes.status !== 0) {
    console.error('Erreur mixage audio:', audioRes.stderr.toString());
    return;
  }
  console.log('Audio masterisé avec succès !');

  // 2. Rendu vidéo HD 1080x1920 fluide avec les filtres graphiques continus
  console.log('\n3. Rendu vidéo HD continue avec sous-titres et badge...');
  const finalVideo = path.join(workDir, 'final_video2_perfect.mp4');
  const fullVideoFilter = videoFilters.join(',');

  const videoArgs = [
    '-i', v1Source,
    '-i', mixedAudio,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-t', '29.23',
    '-vf', fullVideoFilter,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    '-y',
    finalVideo
  ];

  const videoRes = spawnSync(ffmpeg, videoArgs);
  if (videoRes.status !== 0) {
    console.error('Erreur rendu vidéo:', videoRes.stderr.toString());
    return;
  }

  // 3. Déploiement vers Téléchargements, Bureau et Public
  console.log('\n4. Déploiement des fichiers...');
  fs.copyFileSync(finalVideo, outDownloads);
  fs.copyFileSync(finalVideo, outDesktop);

  const pubDir = path.dirname(outPublic);
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
  fs.copyFileSync(finalVideo, outPublic);

  console.log('\n🎉 SUCCÈS TOTAL ! Vidéo 2 générée à la perfection :');
  console.log(`- Téléchargements : ${outDownloads}`);
  console.log(`- Bureau          : ${outDesktop}`);
  console.log(`- Web Public      : ${outPublic}`);
}

run().catch(console.error);
