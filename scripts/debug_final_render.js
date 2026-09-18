const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Re-use what's already built (TTS + cuts + concat already done)
const ffmpeg = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe').replace(/\\/g, '/');
const workDir = path.join(__dirname, 'scripts', 'masque_oculaire_prod').replace(/\\/g, '/');
const ttsDir = workDir + '/tts';
const rawConcat = workDir + '/raw_concat.mp4';
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const finalOut = workDir + '/final_masque_oculaire.mp4';
const outDownloads = 'C:/Users/fenou/Downloads/MASQUE_OCULAIRE_PUB_VIVIENNE.mp4';

const scenes = [
  { dur: 5.5,  delayMs: 300,   sub1: 'VOS YEUX BRULENT APRES UNE',   sub2: 'LONGUE JOURNEE D ECRANS ?',        isHook: true },
  { dur: 7.0,  delayMs: 5700,  sub1: 'MASSAGE 4D - CHALEUR 42 DEGRES',sub2: 'BLUETOOTH - PLIABLE 180 DEGRES',  isHook: false },
  { dur: 8.0,  delayMs: 12900, sub1: 'COUSSINS D AIR SUR LES TEMPES', sub2: 'MUSIQUE VIA BLUETOOTH',           isHook: false },
  { dur: 7.0,  delayMs: 21100, sub1: 'YEUX REPOSES - ZERO TENSION',   sub2: 'SOMPTUEUX COMME UN SPA',          isHook: false },
  { dur: 5.5,  delayMs: 28300, sub1: 'MASQUE OCULAIRE 4D - 24 900 F', sub2: 'PAIEMENT A LA LIVRAISON BENIN',  isHook: false },
];
const totalDur = scenes.reduce((a,s) => a + s.dur, 0);

// ─── Audio mixing ───
const hasBgMusic = fs.existsSync(bgMusic.replace(/\//g, '\\'));
console.log('BgMusic exists:', hasBgMusic);

const voiceInputArgs = [];
const voiceDelayFilters = [];
for (let i = 0; i < scenes.length; i++) {
  voiceInputArgs.push('-i', `${ttsDir}/voice_om_${i}.mp3`);
  voiceDelayFilters.push(`[${i}:a]adelay=${scenes[i].delayMs}|${scenes[i].delayMs}[v${i}]`);
}
const mixIn = scenes.map((_,i) => `[v${i}]`).join('');
let audioFilter, audioExtraInputs;

if (hasBgMusic) {
  audioExtraInputs = [...voiceInputArgs, '-i', bgMusic];
  audioFilter = [
    ...voiceDelayFilters,
    `${mixIn}amix=inputs=${scenes.length}:normalize=0[voice_mix]`,
    `[${scenes.length}:a]volume=0.07,aloop=loop=-1:size=2000000000[bgloop]`,
    `[voice_mix][bgloop]amix=inputs=2:normalize=0,acompressor=threshold=-18dB:ratio=4:attack=5:release=50,alimiter=level_in=1:level_out=0.95[final_audio]`
  ].join(';');
} else {
  audioExtraInputs = voiceInputArgs;
  audioFilter = [
    ...voiceDelayFilters,
    `${mixIn}amix=inputs=${scenes.length}:normalize=0,acompressor=threshold=-18dB:ratio=4:attack=5:release=50,alimiter=level_in=1:level_out=0.95[final_audio]`
  ].join(';');
}

// ─── Video (subtitle) filter ───
let timeOff = 0;
const vfParts = [];
for (let i = 0; i < scenes.length; i++) {
  const t0 = timeOff.toFixed(2);
  const t1 = (timeOff + scenes[i].dur).toFixed(2);
  const { sub1, sub2, isHook } = scenes[i];

  if (isHook) {
    vfParts.push(
      `drawbox=x=20:y=240:w=1040:h=210:color=black@0.78:t=fill:enable='between(t,${t0},${t1})'`,
      `drawtext=fontfile=${font}:text='${sub1}':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=278:enable='between(t,${t0},${t1})'`,
      `drawtext=fontfile=${font}:text='${sub2}':fontcolor=0xFFD700:fontsize=46:x=(w-text_w)/2:y=350:enable='between(t,${t0},${t1})'`
    );
  }
  vfParts.push(
    `drawbox=x=0:y=1680:w=1080:h=220:color=black@0.82:t=fill:enable='between(t,${t0},${t1})'`,
    `drawtext=fontfile=${font}:text='${sub1}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=1700:enable='between(t,${t0},${t1})'`,
    `drawtext=fontfile=${font}:text='${sub2}':fontcolor=0xFFD700:fontsize=34:x=(w-text_w)/2:y=1752:enable='between(t,${t0},${t1})'`
  );
  timeOff += scenes[i].dur;
}
const vfFull = vfParts.join(',');

console.log('\n[FINAL RENDER] Starting FFmpeg...');
console.log(`Total duration: ${totalDur}s`);
console.log(`Audio filter length: ${audioFilter.length} chars`);
console.log(`Video filter parts: ${vfParts.length} drawtext/drawbox`);

const args = [
  '-y',
  '-i', rawConcat,
  ...audioExtraInputs,
  '-filter_complex', audioFilter,
  '-map', '0:v:0',
  '-map', '[final_audio]',
  '-vf', vfFull,
  '-c:v', 'libx264',
  '-crf', '20',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-t', String(totalDur),
  finalOut
];

const r = spawnSync(ffmpeg, args, { encoding: 'utf8', maxBuffer: 200 * 1024 * 1024 });
if (r.status !== 0) {
  console.error('=== STDERR START ===');
  console.error(r.stderr);
  console.error('=== STDERR END ===');
  process.exit(1);
}

console.log('✅ Final render done!');
fs.copyFileSync(finalOut.replace(/\//g, '\\'), outDownloads.replace(/\//g, '\\'));
console.log('📁 Saved to Downloads:', outDownloads);
