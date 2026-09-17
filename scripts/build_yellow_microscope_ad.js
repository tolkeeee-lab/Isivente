const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'yellow_microscope_prod');
const ttsDir = path.join(workDir, 'tts');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDownloads = path.join(userProfile, 'Downloads', 'MICROSCOPE_JAUNE_PUB_ISIVENTE.mp4');
const outDesktop = path.join(userProfile, 'Desktop', 'MICROSCOPE_JAUNE_PUB_ISIVENTE.mp4');
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-jaune-tiktok-ad.mp4');

[workDir, ttsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const v3Brocoli = path.join(__dirname, 'tiktok_microscope', 'tiktok_3_7643777690541083917.mp4').replace(/\\/g, '/');
const v2Deballage = path.join(__dirname, 'tiktok_microscope', 'tiktok_2_7582371229642788127.mp4').replace(/\\/g, '/');
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';

function downloadTTS(text, dest) {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=fr&client=tw-ob';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function formatTime(s) {
  const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
  const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(s % 60).toString().padStart(2, '0');
  const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
  return `${hrs}:${mins}:${secs},${ms}`;
}

const segments = [
  // 1. Hook Brocoli
  {
    src: v3Brocoli,
    ss: 0.0,
    srcLen: 3.2,
    voice: "Vous n'allez pas en croire vos yeux ! Regardez ce qui se cache à l'intérieur d'un simple brocoli...",
    sub: "REGARDEZ BIEN CET ÉCRAN !\nDécouverte incroyable en direct",
    tag: "MICROSCOPE NUMÉRIQUE ENFANT"
  },
  // 2. Déballage & Prise en main
  {
    src: v2Deballage,
    ss: 0.0,
    srcLen: 4.8,
    voice: "Voici le mini-microscope de poche pour enfants : ultra-léger, robuste et 100% autonome sur batterie.",
    sub: "100% SANS FIL SUR BATTERIE\nÉcran couleur HD intégré",
    tag: "LÉGER, ROBUSTE & AUTONOME"
  },
  // 3. Démonstration texte et zoom notice
  {
    src: v2Deballage,
    ss: 5.5,
    srcLen: 5.8,
    voice: "Son zoom puissant révèle les moindres détails en haute définition. Éloignez enfin vos enfants des téléphones !",
    sub: "ZOOM PUISSANT HAUTE DÉFINITION\nÉloignez vos enfants des écrans",
    tag: "JEU ÉDUCATIF FASCINANT"
  },
  // 4. Démonstration fibres & textures
  {
    src: v3Brocoli,
    ss: 3.5,
    srcLen: 4.5,
    voice: "Plantes, insectes, tissus et matières : chaque objet du quotidien devient un terrain d'aventure passionnant.",
    sub: "EXPLORATION DE LA NATURE\nPlantes, insectes et textures",
    tag: "EXPLORATION EN DIRECT"
  },
  // 5. Offre Isivente & Bénin
  {
    src: v2Deballage,
    ss: 2.2,
    srcLen: 4.8,
    voice: "Le cadeau éducatif idéal. Commandez sur Isivente, livraison rapide avec paiement à la livraison partout au Bénin !",
    sub: "COMMANDEZ SUR ISIVENTE\nPaiement à la livraison au Bénin",
    tag: "LIVRAISON PARTOUT AU BÉNIN"
  }
];

async function run() {
  console.log('🎬 DÉMARRAGE DU MONTAGE PUBLICITAIRE DU MICROSCOPE JAUNE (Format 9:16)...');

  const cutFiles = [];
  const voiceFiles = [];
  const drawtextFilters = [];
  const srtEntries = [];
  let currentTime = 0;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    console.log(`\n--- Séquence ${i + 1}/${segments.length} : ${s.tag} ---`);

    const rawAudio = path.join(ttsDir, `voice_raw_${i}.mp3`);
    const fastAudio = path.join(ttsDir, `voice_fast_${i}.mp3`);

    console.log(`  1. Téléchargement Voix-off : "${s.voice}"`);
    await downloadTTS(s.voice, rawAudio);

    // Accélération 1.35x dynamique pour TikTok
    spawnSync(ffmpeg, ['-i', rawAudio, '-filter:a', 'atempo=1.35', '-y', fastAudio]);

    // Mesure durée exacte
    const probe = spawnSync(ffmpeg, ['-i', fastAudio]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    voiceFiles.push(fastAudio);

    console.log(`  2. Durée audio calée : ${exactDur.toFixed(2)}s`);

    const speedFactor = (exactDur / s.srcLen).toFixed(6);
    const cutOut = path.join(workDir, `cut_${i}.mp4`);

    // Format 1080x1920 vertical
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

    // Badge Pill supérieur
    const tagFilter = `drawtext=fontfile='${font}':text='${s.tag}':fontcolor=white:fontsize=28:box=1:boxcolor=0x000000B3:boxborderw=12:x=(w-text_w)/2:y=140:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(tagFilter);

    // Sous-titre inférieur lisible sur mobile
    const subFilter = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=42:line_spacing=10:borderw=4.5:bordercolor=black:shadowcolor=black@0.8:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-380:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(subFilter);
  }

  console.log(`\nDurée totale vidéo : ${currentTime.toFixed(2)} secondes`);

  // Concaténation Audio
  console.log('3. Concaténation voix-off...');
  const voiceListFile = path.join(workDir, 'voice_list.txt');
  fs.writeFileSync(voiceListFile, voiceFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const fullVoice = path.join(workDir, 'full_voice.mp3');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', voiceListFile, '-c', 'copy', '-y', fullVoice]);

  // Mixage Audio avec Musique
  console.log('4. Mixage avec musique de fond...');
  const mixedAudio = path.join(workDir, 'mixed_audio.mp3');
  spawnSync(ffmpeg, [
    '-i', fullVoice,
    '-stream_loop', '-1',
    '-i', bgMusic,
    '-filter_complex', '[0:a]volume=1.2[voice];[1:a]volume=0.12[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=2',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-y',
    mixedAudio
  ]);

  // Concaténation Vidéo
  console.log('5. Concaténation des plans découpés...');
  const videoListFile = path.join(workDir, 'video_list.txt');
  fs.writeFileSync(videoListFile, cutFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const rawConcatVideo = path.join(workDir, 'raw_concat.mp4');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', videoListFile, '-c', 'copy', '-y', rawConcatVideo]);

  // Rendu Final
  console.log('6. Rendu final avec incrustations et audio mixé...');
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

  // Envoi vers Téléchargements et Bureau
  fs.copyFileSync(finalRender, outDownloads);
  fs.copyFileSync(finalRender, outDesktop);
  fs.copyFileSync(finalRender, outPublic);

  const stats = fs.statSync(outDownloads);
  console.log(`\n🎉 MONTAGE RÉUSSI AVEC SUCCÈS !`);
  console.log(`   - Téléchargements : ${outDownloads} (${(stats.size / 1024 / 1024).toFixed(2)} Mo)`);
  console.log(`   - Bureau : ${outDesktop}`);
  console.log(`   - Durée : ${currentTime.toFixed(1)} secondes`);
}

run().catch(console.error);
