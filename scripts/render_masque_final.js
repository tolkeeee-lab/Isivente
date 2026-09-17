const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe').replace(/\\/g, '/');
const workDir = path.join(__dirname, 'masque_oculaire_prod').replace(/\\/g, '/');
const ttsDir = workDir + '/tts';
const rawConcat = workDir + '/raw_concat.mp4';
const bgMusic = 'C:/Users/fenou/.gemini/antigravity-ide/brain/7d7deeb2-a255-4f47-865c-7bbdce5fd010/scratch/stab_fast_tts/bg_music.mp3';
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const mixedAudio = workDir + '/mixed_audio.wav';
const finalOut = workDir + '/final_masque_oculaire.mp4';
const outDownloads = (process.env.USERPROFILE || 'C:/Users/fenou').replace(/\\/g, '/') + '/Downloads/MASQUE_OCULAIRE_PUB_VIVIENNE.mp4';
const outPublic = path.join(__dirname, '..', 'public', 'videos', 'masque-oculaire-pub.mp4').replace(/\\/g, '/');

function ff(args, label) {
  console.log(`\n[${label}] Running FFmpeg...`);
  const r = spawnSync(ffmpeg, args, { encoding: 'utf8', maxBuffer: 200 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(`❌ [${label}] FAILED (code ${r.status}):`);
    // Print last 2000 chars of stderr
    const err = (r.stderr || '') + (r.error ? r.error.message : '');
    console.error(err.slice(-2000));
    process.exit(1);
  }
  console.log(`✅ [${label}] Done`);
}

const scenes = [
  { dur: 5.5,  delayMs: 300,   sub1: 'VOS YEUX BRULENT APRES UNE',    sub2: 'LONGUE JOURNEE D ECRANS ?',       isHook: true },
  { dur: 7.0,  delayMs: 5700,  sub1: 'MASSAGE 4D - CHALEUR 42 DEGRES', sub2: 'BLUETOOTH - PLIABLE 180 DEGRES', isHook: false },
  { dur: 8.0,  delayMs: 12900, sub1: 'COUSSINS D AIR SUR LES TEMPES',  sub2: 'MUSIQUE VIA BLUETOOTH',          isHook: false },
  { dur: 7.0,  delayMs: 21100, sub1: 'YEUX REPOSES - ZERO TENSION',    sub2: 'SOMPTUEUX COMME UN SPA',         isHook: false },
  { dur: 5.5,  delayMs: 28300, sub1: 'MASQUE OCULAIRE 4D - 24 900 F',  sub2: 'PAIEMENT A LA LIVRAISON BENIN', isHook: false },
];
const totalDur = scenes.reduce((a, s) => a + s.dur, 0);
console.log(`📐 Total: ${totalDur}s`);

// ─── PRE-STEP: Re-cut with normalized SAR so concat works ───
const fixedCutPaths = [];
for (let i = 0; i < scenes.length; i++) {
  const src = workDir + `/cut_${i}.mp4`;
  const dst = workDir + `/cut_fixed_${i}.mp4`;
  fixedCutPaths.push(dst);
  ff(['-y', '-i', src, '-vf', 'setsar=1', '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', '-r', '24', '-an', dst], `FixSAR-cut-${i}`);
}

// Re-concat using filter_complex to avoid SAR/timecode issues
const rawConcatV2 = workDir + '/raw_concat_v2.mp4';
{
  const inputs = fixedCutPaths.flatMap(p => ['-i', p]);
  const concatFC = fixedCutPaths.map((_, i) => `[${i}:v]`).join('') + `concat=n=${fixedCutPaths.length}:v=1:a=0[vout]`;
  ff(['-y', ...inputs, '-filter_complex', concatFC, '-map', '[vout]', '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', '-r', '24', rawConcatV2], 'Concat-v2');
}

// ─── STEP 1: Mix all TTS voice tracks into a single WAV ───
const hasBg = fs.existsSync(bgMusic.replace(/\//g, '\\'));
console.log('BgMusic:', hasBg);

const voiceInputs = scenes.map((_, i) => ['-i', `${ttsDir}/voice_om_${i}.mp3`]).flat();
const delayFilters = scenes.map((sc, i) => `[${i}:a]adelay=${sc.delayMs}|${sc.delayMs}[v${i}]`);
const mixIn = scenes.map((_, i) => `[v${i}]`).join('');

let audioFC, audioExtraInputs;
if (hasBg) {
  audioExtraInputs = [...voiceInputs, '-i', bgMusic];
  audioFC = [
    ...delayFilters,
    `${mixIn}amix=inputs=${scenes.length}:normalize=0[voice_mix]`,
    `[${scenes.length}:a]volume=0.07,aloop=loop=-1:size=2000000000[bgloop]`,
    `[voice_mix][bgloop]amix=inputs=2:normalize=0,acompressor=threshold=-18dB:ratio=4:attack=5:release=50[aout]`,
  ].join(';');
} else {
  audioExtraInputs = voiceInputs;
  audioFC = [
    ...delayFilters,
    `${mixIn}amix=inputs=${scenes.length}:normalize=0,acompressor=threshold=-18dB:ratio=4:attack=5:release=50[aout]`,
  ].join(';');
}

ff([
  '-y',
  ...audioExtraInputs,
  '-filter_complex', audioFC,
  '-map', '[aout]',
  '-ar', '24000',
  '-ac', '1',
  '-t', String(totalDur),
  mixedAudio
], 'Step1-AudioMix');

// ─── STEP 2: Burn subtitles + combine video + mixed audio ───
let timeOff = 0;
const vfParts = [];
for (let i = 0; i < scenes.length; i++) {
  const { dur, sub1, sub2, isHook } = scenes[i];
  const t0 = timeOff.toFixed(2);
  const t1 = (timeOff + dur).toFixed(2);

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
  timeOff += dur;
}
const vfFull = vfParts.join(',');

ff([
  '-y',
  '-i', rawConcatV2,
  '-i', mixedAudio,
  '-map', '0:v:0',
  '-map', '1:a:0',
  '-vf', vfFull,
  '-c:v', 'libx264',
  '-crf', '18',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-t', String(totalDur),
  finalOut
], 'Step2-FinalRender');

// Copy outputs
const finalWin = finalOut.replace(/\//g, '\\');
fs.copyFileSync(finalWin, outDownloads.replace(/\//g, '\\'));
fs.copyFileSync(finalWin, outPublic.replace(/\//g, '\\'));

const size = (fs.statSync(finalWin).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ ══════════════════════════════════════`);
console.log(`🎬 MASQUE OCULAIRE SPOT TERMINÉ (${size} MB)`);
console.log(`📁 Téléchargements: ${outDownloads}`);
console.log(`🌐 Public: ${outPublic}`);
console.log(`════════════════════════════════════════`);
