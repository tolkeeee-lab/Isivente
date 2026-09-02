/**
 * Moteur audio Web Audio API multi-sonorités pour les alertes de commandes Isivente.
 * 100% natif, zéro dépendance externe, instantané et personnalisable.
 */

export type SoundType = "chaching" | "bell" | "marimba" | "ios_pop" | "arcade";

export interface SoundOption {
  id: SoundType;
  name: string;
  desc: string;
  emoji: string;
}

export const AVAILABLE_SOUNDS: SoundOption[] = [
  {
    id: "chaching",
    name: "Caisse Enregistreuse",
    desc: "Cha-Ching! & pièces de monnaie (Recommandé)",
    emoji: "💰",
  },
  {
    id: "bell",
    name: "Carillon Doré",
    desc: "Double carillon cristallin élégant",
    emoji: "🔔",
  },
  {
    id: "marimba",
    name: "Succès & Victoire",
    desc: "Arpège marimba dynamique et joyeux",
    emoji: "🎉",
  },
  {
    id: "ios_pop",
    name: "Chime Moderne",
    desc: "Double bip feutré style smartphone",
    emoji: "📱",
  },
  {
    id: "arcade",
    name: "Pièce Rétro",
    desc: "Son de pièce d'or de jeu vidéo",
    emoji: "⭐",
  },
];

const SOUND_PREF_KEY = "isivente_sound_type";
const VOLUME_PREF_KEY = "isivente_sound_volume";

export function getSavedSoundType(): SoundType {
  if (typeof window === "undefined") return "chaching";
  const saved = localStorage.getItem(SOUND_PREF_KEY) as SoundType;
  if (saved && AVAILABLE_SOUNDS.some((s) => s.id === saved)) {
    return saved;
  }
  return "chaching";
}

export function saveSoundType(type: SoundType) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_PREF_KEY, type);
}

export function getSavedVolume(): number {
  if (typeof window === "undefined") return 0.8;
  const saved = localStorage.getItem(VOLUME_PREF_KEY);
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0 && val <= 1) return val;
  }
  return 0.8;
}

export function saveVolume(volume: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOLUME_PREF_KEY, String(Math.max(0, Math.min(1, volume))));
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Joue le son d'alerte configuré ou un son spécifique
 */
export function playOrderSound(soundType?: SoundType, volumeOverride?: number) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const type = soundType || getSavedSoundType();
    const volume = volumeOverride !== undefined ? volumeOverride : getSavedVolume();
    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case "chaching":
        playChaChing(ctx, masterGain, now);
        break;
      case "bell":
        playBell(ctx, masterGain, now);
        break;
      case "marimba":
        playMarimba(ctx, masterGain, now);
        break;
      case "ios_pop":
        playIosPop(ctx, masterGain, now);
        break;
      case "arcade":
        playArcadeCoin(ctx, masterGain, now);
        break;
      default:
        playChaChing(ctx, masterGain, now);
    }

    // Vibration haptique sur smartphone
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 100]);
    }
  } catch (err) {
    console.warn("Audio notice:", err);
  }
}

// 1. Caisse Enregistreuse "Cha-Ching!"
function playChaChing(ctx: AudioContext, destination: GainNode, now: number) {
  const bufferSize = ctx.sampleRate * 0.05;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(3000, now);
  noiseFilter.Q.setValueAtTime(3, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(destination);
  whiteNoise.start(now);

  const frequencies = [1318.51, 1661.22, 2093.0, 2637.02, 3951.07];
  const delays = [0.04, 0.07, 0.1, 0.14, 0.18];

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delays[idx]);

    const startTime = now + delays[idx];
    const duration = 0.65;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// 2. Carillon Doré (Ding-Dong)
function playBell(ctx: AudioContext, destination: GainNode, now: number) {
  const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
  const delays = [0, 0.18, 0.36];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + delays[i]);

    const startTime = now + delays[i];
    const duration = 0.8;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// 3. Marimba Victoire (Arpège 4 notes ascendantes)
function playMarimba(ctx: AudioContext, destination: GainNode, now: number) {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const delays = [0, 0.08, 0.16, 0.24];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delays[i]);

    const startTime = now + delays[i];
    const duration = 0.4;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// 4. Chime Moderne (Pop iOS)
function playIosPop(ctx: AudioContext, destination: GainNode, now: number) {
  const notes = [1760, 2637.02]; // A6, E7
  const delays = [0, 0.09];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delays[i]);

    const startTime = now + delays[i];
    const duration = 0.35;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// 5. Pièce Rétro Arcade (Coin Power-up)
function playArcadeCoin(ctx: AudioContext, destination: GainNode, now: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.5);
}

// Alias de rétro-compatibilité
export function playChaChingSound() {
  playOrderSound();
}

/**
 * Demande la permission pour les notifications navigateur push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

/**
 * Déclenche une notification système de bureau/mobile
 */
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: icon || "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
      });
    } catch {}
  }
}
