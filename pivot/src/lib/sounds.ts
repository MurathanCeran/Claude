// Basit ses efektleri (Web Audio API ile sentezlenir, dış dosya gerekmez).
// Liseli oyuncular için anlık geri bildirimi güçlendirir: doğru/yanlış, puan,
// kutlama gibi anlarda kısa "ding/buzz/fanfar" sesleri çalar.
// Tarayıcının otomatik oynatma politikası nedeniyle yalnızca kullanıcı
// etkileşimi (tıklama) sonrası tetiklenmelidir.

const MUTE_KEY = 'pivot:muted:v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isMuted(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(MUTE_KEY) === '1';
}

export function setMuted(muted: boolean): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!isBrowser()) return null;
  if (!sharedCtx) {
    const AudioCtxCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) return null;
    sharedCtx = new AudioCtxCtor();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function tone(
  freq: number,
  duration: number,
  delay = 0,
  type: OscillatorType = 'sine',
  gain = 0.15
): void {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const start = ctx.currentTime + delay;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playCorrect(): void {
  tone(880, 0.12, 0, 'sine');
  tone(1320, 0.16, 0.08, 'sine');
}

export function playWrong(): void {
  tone(220, 0.18, 0, 'sawtooth', 0.1);
  tone(160, 0.22, 0.05, 'sawtooth', 0.1);
}

export function playCoin(): void {
  tone(988, 0.08, 0, 'square', 0.08);
  tone(1480, 0.14, 0.06, 'square', 0.08);
}

export function playClick(): void {
  tone(440, 0.05, 0, 'sine', 0.07);
}

export function playFanfare(): void {
  [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.25, i * 0.12, 'triangle', 0.13));
}

export function playStreak(): void {
  [660, 880, 1100].forEach((freq, i) => tone(freq, 0.14, i * 0.07, 'sine', 0.11));
}
