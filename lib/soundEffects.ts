/**
 * Générateur audio Web Audio API pour le son de caisse enregistreuse "Cha-Ching! 💰🔔"
 * 100% natif, zéro dépendance externe, instantané et compatible tous navigateurs.
 */

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
 * Joue le son de caisse enregistreuse "Cha-Ching! 💰"
 * Composé de :
 * 1. Clochette métallique aiguë (son de tiroir-caisse qui s'ouvre)
 * 2. Carillon harmonieux en accord majeur (Mi / Sol# / Si / Mi aigu)
 * 3. Tintement cristallin de pièces de monnaie
 */
export function playChaChingSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // ─── 1. Bruit mécanique feutré du tiroir ("Cha-") ───
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
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // ─── 2. Les cloches métalliques / Carillon ("-Ching! 🔔") ───
    // Fréquences harmoniques de clochette brillante
    const frequencies = [1318.51, 1661.22, 2093.0, 2637.02, 3951.07]; // E6, G#6, C7, E7, B7
    const delays = [0.04, 0.07, 0.1, 0.14, 0.18];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delays[idx]);

      const startTime = now + delays[idx];
      const duration = 0.65;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });

    // ─── 3. Vibration haptique sur smartphone si supportée ───
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 100]);
    }
  } catch (err) {
    console.warn("Impossible de jouer le son de caisse:", err);
  }
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
