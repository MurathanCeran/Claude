// Başarı rozetleri — liseli oyunculara ek motivasyon ve tekrar oynanabilirlik
// katan hafif bir "achievement" katmanı. Rozetler tarayıcıda birikir
// (src/lib/storage.ts) ve sonuç ekranında koleksiyon olarak gösterilir.

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
};

export const BADGES: Badge[] = [
  { id: 'first-finish', emoji: '🚀', title: 'İlk Adım', desc: 'Oyunu ilk kez baştan sona tamamladın.' },
  { id: 'unicorn', emoji: '🦄', title: 'Unicorn Avcısı', desc: '"Unicorn Adayı" seviyesine ulaştın.' },
  { id: 'fast-learner', emoji: '🧠', title: 'Hızlı Öğrenen', desc: 'Öğrenme kazancın (g) 0.5 ve üzerinde.' },
  { id: 'full-marks', emoji: '🎯', title: 'Tam İsabet', desc: 'Son-testte 8 sorunun 8’ini de doğru bildin.' },
  { id: 'cash-king', emoji: '💰', title: 'Kasa Ağası', desc: 'Final sermayen $80.000’in üzerinde.' },
  { id: 'no-loan', emoji: '🛡️', title: 'Bağımsız Girişimci', desc: 'Hiç dış finansman almadan oyunu bitirdin.' },
  { id: 'comeback', emoji: '🔥', title: 'Krizden Dönüş', desc: 'Bir piyasa krizi atlattın ve oyunu bitirdin.' },
  { id: 'persistent', emoji: '🔄', title: 'Azimli', desc: '3’ten fazla kez oynadın.' },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function computeEarnedBadgeIds(run: {
  outcome: 'FINISHED' | 'BANKRUPT';
  successLabel: string | null;
  budget: number;
  hasUsedFinance: boolean;
  postTestCorrect: number | null;
  postTestTotal: number;
  learningGain: number | null;
  hadMarketEvent: boolean;
  totalPlays: number;
}): string[] {
  const ids: string[] = [];

  if (run.outcome === 'FINISHED') {
    ids.push('first-finish');
    if (run.successLabel === 'Unicorn Adayı') ids.push('unicorn');
    if (!run.hasUsedFinance) ids.push('no-loan');
    if (run.hadMarketEvent) ids.push('comeback');
  }

  if (run.learningGain !== null && run.learningGain >= 0.5) ids.push('fast-learner');
  if (run.postTestCorrect !== null && run.postTestCorrect === run.postTestTotal) ids.push('full-marks');
  if (run.budget >= 80000) ids.push('cash-king');
  if (run.totalPlays > 3) ids.push('persistent');

  return ids;
}
