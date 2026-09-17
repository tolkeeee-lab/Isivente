const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe').replace(/\\/g, '/');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'masque_oculaire_prod');
const ttsDir = path.join(workDir, 'tts');
[workDir, ttsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const srcDir = path.join(__dirname, 'eye_massager').replace(/\\/g, '/');
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';

const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDownloads = path.join(userProfile, 'Downloads', 'MASQUE_OCULAIRE_PUB_VIVIENNE.mp4');
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'masque-oculaire-pub.mp4');

// ─── TTS Vivienne 1.2x ───
async function generateTTS(text, destPath) {
  const tts = new MsEdgeTTS();
  const tempDir = path.join(ttsDir, 'tmp_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });
  await tts.setMetadata('fr-FR-VivienneMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const result = await tts.toFile(tempDir, text, { rate: '+20%', volume: '+25%' });
  tts.close();
  fs.copyFileSync(result.audioFilePath, destPath);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// ─── 5 SCÈNES (voix + sous-titres + timecode source + segment) ───
// Source 1f0jsklT7tQ = 61s — homme fatigué devant laptop (hook)
// Source d73rrqeXcRk = 61s — femme tenant/portant masque sur canapé
// Source bum2LnHG23Q = 57s — avatar 3D + animations produit
// Source SxTjzD4jwBQ = 53s — product studio shots
// Source JaKLrW8UfPk = 30s — cinématique bord de mer + relaxation soir

const scenes = [
  {
    id: 0,
    sourceFile: `${srcDir}/source_1f0jsklT7tQ.mp4`,
    srcStart: 0,
    srcDuration: 5.5,
    // homme se frottant les yeux devant laptop — hook parfait
    cropX: 'iw/2-iw/4',  // centre gauche
    voice: "Vos yeux brûlent après une longue journée ? Ce masque change tout en quinze minutes.",
    sub: "VOS YEUX BRÛLENT APRÈS UNE\nLONGUE JOURNÉE D'ÉCRANS ?",
    audioDelayMs: 300,
    isHook: true,
  },
  {
    id: 1,
    sourceFile: `${srcDir}/source_SxTjzD4jwBQ.mp4`,
    srcStart: 1,
    srcDuration: 7,
    // product shot élégant en studio
    cropX: 'iw/2-iw/4',
    voice: "Massage 4D pneumatique, chaleur thérapeutique à quarante-deux degrés et Bluetooth intégré. Pliable cent quatre-vingts degrés, prêt en un seul clic.",
    sub: "MASSAGE 4D • CHALEUR 42°C\nBLUETOOTH • PLIABLE 180°",
    audioDelayMs: 5700,
    isHook: false,
  },
  {
    id: 2,
    sourceFile: `${srcDir}/source_bum2LnHG23Q.mp4`,
    srcStart: 2,
    srcDuration: 8,
    // avatar 3D avec coussins d'air en action
    cropX: 'iw/2-iw/4',
    voice: "Les coussins d'air massent doucement vos tempes et vos contours d'yeux, pendant que votre musique préférée joue.",
    sub: "COUSSINS D'AIR SUR LES TEMPES\nMUSIQUE VIA BLUETOOTH",
    audioDelayMs: 12900,
    isHook: false,
  },
  {
    id: 3,
    sourceFile: `${srcDir}/source_d73rrqeXcRk.mp4`,
    srcStart: 0,
    srcDuration: 7,
    // femme souriante, allongée, détendue
    cropX: 'iw/2-iw/4',
    voice: "Résultat : yeux reposés, tension en moins, endormissement naturel le soir. La détente spa chez vous.",
    sub: "YEUX REPOSÉS • ZÉRO TENSION\nSOMPTUEUX COMME UN SPA",
    audioDelayMs: 21100,
    isHook: false,
  },
  {
    id: 4,
    sourceFile: `${srcDir}/source_d73rrqeXcRk.mp4`,
    srcStart: 28,
    srcDuration: 5.5,
    // femme tenant le masque et souriant — fin
    cropX: 'iw/2-iw/4',
    voice: "Commandez le vôtre sur Isivente. Vingt-quatre mille neuf cents francs, paiement à la livraison au Bénin !",
    sub: "MASQUE OCULAIRE 4D — 24 900 FCFA\nPAIEMENT À LA LIVRAISON AU BÉNIN",
    audioDelayMs: 28300,
    isHook: false,
  },
];

// Total duration: sum of srcDurations
const totalDuration = scenes.reduce((acc, s) => acc + s.srcDuration, 0);
console.log(`📐 Total durée visée: ${totalDuration.toFixed(1)}s`);

async function run() {
  console.log('\n🎙️ GÉNÉRATION VOIX OFF VIVIENNE 1.2x...\n');

  // 1. Generate all TTS
  const audioPaths = [];
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const dest = path.join(ttsDir, `voice_om_${i}.mp3`);
    console.log(`[${i+1}/5] "${sc.voice.substring(0, 60)}..."`);
    await generateTTS(sc.voice, dest);
    audioPaths.push(dest);
    console.log(`  ✅ Saved: ${dest}`);
  }

  console.log('\n🎬 MONTAGE VIDÉO...\n');

  // 2. Cut + crop each scene to 1080x1920 (9:16)
  const cutPaths = [];
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const cutPath = path.join(workDir, `cut_${i}.mp4`).replace(/\\/g, '/');
    cutPaths.push(cutPath);

    console.log(`[Coupe ${i+1}/5] ${path.basename(sc.sourceFile)} — ${sc.srcStart}s à ${(sc.srcStart + sc.srcDuration).toFixed(1)}s`);

    // Crop center of 16:9 → 9:16 (take 9/16 width from 16/9 → scale to 1080x1920)
    // from 16:9 source: take a 9:16 center crop then scale
    const cropFilter = `crop=ih*9/16:ih:iw/2-ih*9/32:0,scale=1080:1920:flags=lanczos`;

    const r = spawnSync(ffmpeg, [
      '-y',
      '-ss', String(sc.srcStart),
      '-t', String(sc.srcDuration),
      '-i', sc.sourceFile,
      '-vf', cropFilter,
      '-c:v', 'libx264',
      '-crf', '20',
      '-preset', 'fast',
      '-an',
      cutPath
    ], { encoding: 'utf8' });

    if (r.status !== 0) {
      console.error(`❌ Erreur coupe ${i}:`, r.stderr?.substring(0, 500));
    } else {
      console.log(`  ✅ ${cutPath}`);
    }
  }

  // 3. Concat all cuts
  const concatList = path.join(workDir, 'concat.txt');
  fs.writeFileSync(concatList, cutPaths.map(p => `file '${p}'`).join('\n'), 'utf8');
  const rawConcat = path.join(workDir, 'raw_concat.mp4').replace(/\\/g, '/');

  console.log('\n[Concat] Assemblage des coupes...');
  const concatR = spawnSync(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatList,
    '-c', 'copy',
    rawConcat
  ], { encoding: 'utf8' });
  if (concatR.status !== 0) {
    console.error('❌ Concat error:', concatR.stderr?.substring(0, 500));
    process.exit(1);
  }
  console.log('✅ Concat:', rawConcat);

  // 4. Mix all TTS audio with delays
  const voiceInputs = [];
  const voiceFilters = [];
  for (let i = 0; i < scenes.length; i++) {
    voiceInputs.push('-i', audioPaths[i]);
    voiceFilters.push(`[${i}:a]adelay=${scenes[i].audioDelayMs}|${scenes[i].audioDelayMs}[v${i}]`);
  }
  const mixLabel = scenes.map((_, i) => `[v${i}]`).join('');
  const mixFilter = voiceFilters.join(';') + `;${mixLabel}amix=inputs=${scenes.length}:normalize=0[voice_mix]`;

  const hasBgMusic = fs.existsSync(bgMusic);
  let audioFilter, audioInputs;

  if (hasBgMusic) {
    audioInputs = [...voiceInputs, '-i', bgMusic];
    audioFilter = `${mixFilter};[${scenes.length}:a]volume=0.07,aloop=loop=-1:size=2e+09[bgloop];[voice_mix][bgloop]amix=inputs=2:normalize=0,acompressor=threshold=-18dB:ratio=4:attack=5:release=50,alimiter=level_in=1:level_out=0.95[final_audio]`;
  } else {
    audioInputs = voiceInputs;
    audioFilter = `${mixFilter};[voice_mix]acompressor=threshold=-18dB:ratio=4:attack=5:release=50,alimiter=level_in=1:level_out=0.95[final_audio]`;
  }

  // Write subtitle files
  const subFiles = [];
  for (let i = 0; i < scenes.length; i++) {
    const p = path.join(workDir, `sub_${i}.txt`).replace(/\\/g, '/');
    fs.writeFileSync(p, scenes[i].sub, 'utf8');
    subFiles.push(p);
  }

  // 5. Build subtitle filter (cumulative time offsets)
  let timeOffset = 0;
  const subFilters = [];
  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const t0 = timeOffset;
    const t1 = timeOffset + sc.srcDuration;
    const subLines = sc.sub.split('\n');

    if (sc.isHook) {
      // Hook: big centered badge at top
      subFilters.push(
        `drawbox=x=20:y=240:w=1040:h=200:color=black@0.75:t=fill:enable='between(t,${t0},${t1})'`,
        `drawtext=fontfile=${font}:text='${subLines[0]}':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=280:enable='between(t,${t0},${t1})'`,
        `drawtext=fontfile=${font}:text='${subLines[1] || ''}':fontcolor=#FFD700:fontsize=46:x=(w-text_w)/2:y=355:enable='between(t,${t0},${t1})'`
      );
    }

    // Bottom subtitle bar — always show
    subFilters.push(
      `drawbox=x=0:y=1680:w=1080:h=220:color=black@0.80:t=fill:enable='between(t,${t0},${t1})'`,
      `drawtext=fontfile=${font}:text='${subLines[0].replace(/'/g, "\\u0027")}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=1700:enable='between(t,${t0},${t1})'`,
      `drawtext=fontfile=${font}:text='${(subLines[1] || '').replace(/'/g, "\\u0027")}':fontcolor=#FFD700:fontsize=36:x=(w-text_w)/2:y=1755:enable='between(t,${t0},${t1})'`
    );

    timeOffset += sc.srcDuration;
  }

  const vfFull = subFilters.join(',');
  const finalOut = path.join(workDir, 'final_masque_oculaire.mp4').replace(/\\/g, '/');

  console.log('\n[Rendu Final] Assemblage vidéo + voix + sous-titres...');

  const finalArgs = [
    '-y',
    '-i', rawConcat,
    ...audioInputs,
    '-filter_complex', audioFilter,
    '-map', '0:v:0',
    '-map', '[final_audio]',
    '-vf', vfFull,
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', String(totalDuration),
    finalOut
  ];

  const finalR = spawnSync(ffmpeg, finalArgs, { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
  if (finalR.status !== 0) {
    console.error('❌ Rendu final error:', finalR.stderr?.substring(0, 1000));
    process.exit(1);
  }

  // 6. Copy to destinations
  fs.copyFileSync(finalOut.replace(/\//g, '\\'), outDownloads);
  fs.copyFileSync(finalOut.replace(/\//g, '\\'), outPublic);

  const size = (fs.statSync(outDownloads).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ ========================================`);
  console.log(`🎬 SPOT MASQUE OCULAIRE TERMINÉ ! (${size} MB)`);
  console.log(`📁 Téléchargements: ${outDownloads}`);
  console.log(`🌐 Public: ${outPublic}`);
  console.log(`========================================`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
