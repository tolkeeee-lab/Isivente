const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

const workDir = path.join(__dirname, 'microscope_master_prod');
const ttsDir = path.join(workDir, 'tts');
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'microscope-facebook-ad-master.mp4');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\fenou';
const outDesktop = path.join(userProfile, 'Desktop', 'microscope-facebook-ad-28s.mp4');
const outDownloads = path.join(userProfile, 'Downloads', 'microscope-facebook-ad-28s.mp4');

[workDir, ttsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const hookSource = 'C:/Users/fenou/Downloads/Script_Le_Multi_Passions_.mp4';
const actionSource = path.join(__dirname, 'raw_source_1.mp4').replace(/\\/g, '/');
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
  {
    src: hookSource,
    ss: 0.0,
    srcLen: 4.0,
    voice: "Un seul outil, mille possibilités sous vos yeux !",
    sub: "UN OUTIL, MILLE POSSIBILITÉS\nZoom extrême sous vos yeux",
    tag: "MICROSCOPE NUMÉRIQUE HD"
  },
  {
    src: actionSource,
    ss: 74.0,
    srcLen: 5.0,
    voice: "Réparateurs de téléphones, bijoutiers et techniciens : inspectez chaque micro-soudure au millimètre près !",
    sub: "RÉPARATION ÉLECTRONIQUE & GSM\nInspectez chaque micro-soudure",
    tag: "PRÉCISION PROFESSIONNELLE"
  },
  {
    src: actionSource,
    ss: 164.5,
    srcLen: 5.0,
    voice: "Grossissement puissant jusqu'à mille fois ! Observez les cellules végétales et les textures invisibles à l'œil nu.",
    sub: "GROSSISSEMENT JUSQU'À 1000X\nDétails invisibles à l'œil nu",
    tag: "DÉTAILS HAUTE DÉFINITION"
  },
  {
    src: actionSource,
    ss: 213.5,
    srcLen: 4.5,
    voice: "Textures de tissus, fibres ou gravures : tout s'affiche instantanément sur son écran couleur haute définition.",
    sub: "ÉCRAN LCD COULEUR INTÉGRÉ\nTextures et matières en direct",
    tag: "ÉCRAN HAUTE RÉSOLUTION"
  },
  {
    src: actionSource,
    ss: 242.0,
    srcLen: 4.5,
    voice: "Cent pour cent autonome sur batterie rechargeable, avec éclairage LED réglable. Aucun ordinateur requis !",
    sub: "100% SANS FIL SUR BATTERIE\nÉclairage LED intégré puissant",
    tag: "PORTABLE & SANS FIL"
  },
  {
    src: actionSource,
    ss: 25.0,
    srcLen: 4.5,
    voice: "Commandez votre microscope sur Isivente, livraison rapide avec paiement à la livraison partout au Bénin !",
    sub: "DISPONIBLE SUR ISIVENTE\nPaiement à la livraison au Bénin",
    tag: "LIVRAISON PARTOUT AU BÉNIN"
  }
];

async function run() {
  console.log('🎬 DÉMARRAGE DU MONTAGE PUBLICITAIRE DU MICROSCOPE (25-28s)...');

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

    console.log(`  1. Téléchargement TTS : "${s.voice}"`);
    await downloadTTS(s.voice, rawAudio);

    // Accélération dynamique 1.35x pour un rythme publicitaire punchy
    spawnSync(ffmpeg, ['-i', rawAudio, '-filter:a', 'atempo=1.35', '-y', fastAudio]);

    // Durée exacte audio
    const probe = spawnSync(ffmpeg, ['-i', fastAudio]);
    const m = probe.stderr.toString().match(/Duration: ([0-9:.]+)/);
    const durStr = m ? m[1] : '0';
    const parts = durStr.split(':');
    const exactDur = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    voiceFiles.push(fastAudio);

    console.log(`  2. Durée audio calée : ${exactDur.toFixed(2)}s`);

    // Calibrer la vitesse vidéo sur la durée audio exacte
    const speedFactor = (exactDur / s.srcLen).toFixed(6);
    const cutOut = path.join(workDir, `cut_${i}.mp4`);

    // Rendu en 1080x1080 carré centré
    const cutArgs = [
      '-ss', s.ss.toString(),
      '-i', s.src,
      '-t', s.srcLen.toString(),
      '-vf', `setpts=(PTS-STARTPTS)*${speedFactor},scale=1920:1080,crop=1080:1080:420:0,fps=30`,
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

    // Fichier texte pour sous-titres
    const txtPath = path.join(workDir, `sub_${i}.txt`);
    fs.writeFileSync(txtPath, s.sub, 'utf8');

    const startT = currentTime;
    const endT = currentTime + exactDur;
    currentTime = endT;

    srtEntries.push(`${i + 1}\n${formatTime(startT)} --> ${formatTime(endT)}\n${s.sub}\n`);

    const escapedTxt = txtPath.replace(/\\/g, '/').replace(':', '\\:');

    // Badge Pill supérieur Figma-Grade
    const tagFilter = `drawtext=fontfile='${font}':text='${s.tag}':fontcolor=white:fontsize=24:box=1:boxcolor=0x000000B3:boxborderw=10:x=(w-text_w)/2:y=60:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(tagFilter);

    // Sous-titre inférieur dynamique à fort contraste
    const subFilter = `drawtext=textfile='${escapedTxt}':fontfile='${font}':fontcolor=white:fontsize=36:line_spacing=8:borderw=4:bordercolor=black:shadowcolor=black@0.8:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-200:enable='between(t\\,${startT.toFixed(2)}\\,${endT.toFixed(2)})'`;
    drawtextFilters.push(subFilter);
  }

  console.log(`\nDurée totale finale : ${currentTime.toFixed(2)} secondes`);

  // Concaténation Audio
  console.log('3. Concaténation de la voix-off...');
  const voiceListFile = path.join(workDir, 'voice_list.txt');
  fs.writeFileSync(voiceListFile, voiceFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const fullVoice = path.join(workDir, 'full_voice.mp3');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', voiceListFile, '-c', 'copy', '-y', fullVoice]);

  // Mixage Voix-off + Musique de fond énergique
  console.log('4. Mixage audio voix-off + musique de fond...');
  const mixedAudio = path.join(workDir, 'mixed_audio.mp3');
  spawnSync(ffmpeg, [
    '-i', fullVoice,
    '-stream_loop', '-1',
    '-i', bgMusic,
    '-filter_complex', '[0:a]volume=1.15[voice];[1:a]volume=0.12[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=2',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-y',
    mixedAudio
  ]);

  // Concaténation Vidéo brute
  console.log('5. Concaténation des clips vidéo...');
  const videoListFile = path.join(workDir, 'video_list.txt');
  fs.writeFileSync(videoListFile, cutFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const rawConcatVideo = path.join(workDir, 'raw_concat.mp4');
  spawnSync(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', videoListFile, '-c', 'copy', '-y', rawConcatVideo]);

  // Rendu final avec sous-titres incrustés et son mixé
  console.log('6. Rendu final avec incrustation des sous-titres et badges...');
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

  // Copie vers Desktop, Downloads et Public
  fs.copyFileSync(finalRender, outDesktop);
  fs.copyFileSync(finalRender, outDownloads);
  fs.copyFileSync(finalRender, outPublic);

  // Copie également vers microscope-facebook-ad-10s.mp4 pour écraser l'ancien
  const oldDesktop = path.join(userProfile, 'Desktop', 'microscope-facebook-ad-10s.mp4');
  fs.copyFileSync(finalRender, oldDesktop);

  const stats = fs.statSync(outDesktop);
  console.log(`\n🎉 SUCCÈS TOTAL : VIDÉO TERMINÉE ET DISPONIBLE !`);
  console.log(`   - Bureau : ${outDesktop} (${(stats.size / 1024 / 1024).toFixed(2)} Mo)`);
  console.log(`   - Durée : ${currentTime.toFixed(1)} secondes`);
}

run().catch(console.error);
