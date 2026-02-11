/**
 * Browser-based chime sound using Web Audio API.
 * No external audio files needed — generates a pleasant two-tone chime.
 * Uses AudioContext which mixes with other audio without interrupting it.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }
  // Resume if suspended (browsers require user interaction first)
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Play a pleasant two-tone chime (like a doorbell).
 * Safe to call multiple times — each call creates a short-lived oscillator.
 */
export function playWelcomeChime(volume = 0.3): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // First tone — E5 (659 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second tone — G5 (784 Hz), slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.15);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.6, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);

    // Cleanup
    setTimeout(() => {
      masterGain.disconnect();
    }, 1000);
  } catch {
    // Silently fail if Web Audio API is not available
  }
}

/**
 * Play an urgent reminder chime — slightly different tone (lower, more attention-grabbing).
 */
export function playReminderChime(volume = 0.25): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // First tone — C5 (523 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second tone — E5 (659 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(659.25, now + 0.12);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.5, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);

    // Third tone — G5 (784 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(783.99, now + 0.24);
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.setValueAtTime(0.5, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.7);

    setTimeout(() => {
      masterGain.disconnect();
    }, 1000);
  } catch {
    // Silently fail if Web Audio API is not available
  }
}
