// Kalıcılık katmanı (localStorage).
// Oyun ve ölçüm sonuçlarını tarayıcıda saklar: skor tablosu + araştırma kaydı.
// TÜBİTAK projesi için bu kayıtlar, oyunun öğrenme üzerindeki etkisini gösteren
// veriyi (ön-test/son-test/kazanım) biriktirir.
//
// Not: Next.js sunucu tarafında render edebildiği için her erişimde `window`
// kontrolü yapılır.

const STORAGE_KEY = 'pivot:runs:v1';
const BADGES_KEY = 'pivot:badges:v1';

export type GameRun = {
  ceoName: string;
  companyName: string;
  score: number;
  budget: number;
  equity: number;
  outcome: 'FINISHED' | 'BANKRUPT';
  decisions: number;
  /** Ön-test doğru yüzdesi (0-100), yapılmadıysa null */
  preTestPercent: number | null;
  /** Son-test doğru yüzdesi (0-100), yapılmadıysa null */
  postTestPercent: number | null;
  /** Normalize öğrenme kazancı (Hake gain), hesaplanamadıysa null */
  learningGain: number | null;
  /** ISO tarih damgası */
  date: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadRuns(): GameRun[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GameRun[]) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: GameRun): GameRun[] {
  if (!isBrowser()) return [];
  const runs = loadRuns();
  runs.push(run);
  // Son 50 oyunu sakla (sınırsız büyümeyi engelle)
  const trimmed = runs.slice(-50);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // kota dolduysa sessizce geç
  }
  return trimmed;
}

export function clearRuns(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // yoksay
  }
}

/** En yüksek skoru döndürür (kayıt yoksa 0). */
export function bestScore(): number {
  const runs = loadRuns();
  if (runs.length === 0) return 0;
  return Math.max(...runs.map((r) => r.score));
}

/** Skora göre azalan, en iyi N oyunu döndürür. */
export function topRuns(limit = 5): GameRun[] {
  return [...loadRuns()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Tüm oyunlardaki ölçüm verisinin özeti — araştırma/raporlama için.
 * Geçerli ön+son testi olan oyunların ortalama kazancını verir.
 */
export function aggregateStats(): {
  totalRuns: number;
  measuredRuns: number;
  avgPre: number | null;
  avgPost: number | null;
  avgGain: number | null;
} {
  const runs = loadRuns();
  const measured = runs.filter(
    (r) => r.preTestPercent !== null && r.postTestPercent !== null,
  );
  if (measured.length === 0) {
    return {
      totalRuns: runs.length,
      measuredRuns: 0,
      avgPre: null,
      avgPost: null,
      avgGain: null,
    };
  }
  const avg = (nums: number[]) =>
    Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100;
  return {
    totalRuns: runs.length,
    measuredRuns: measured.length,
    avgPre: avg(measured.map((r) => r.preTestPercent as number)),
    avgPost: avg(measured.map((r) => r.postTestPercent as number)),
    avgGain: avg(
      measured
        .filter((r) => r.learningGain !== null)
        .map((r) => r.learningGain as number),
    ),
  };
}

/** Kalıcı olarak açılmış rozet id'lerini döndürür. */
export function loadUnlockedBadges(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(BADGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Verilen rozet id'lerini kalıcı listeye ekler ve bu çağrıda YENİ açılanları
 * döndürür (kutlama animasyonu tetiklemek için kullanışlı).
 */
export function unlockBadges(ids: string[]): string[] {
  if (!isBrowser()) return [];
  const existing = new Set(loadUnlockedBadges());
  const fresh = ids.filter((id) => !existing.has(id));
  ids.forEach((id) => existing.add(id));
  try {
    window.localStorage.setItem(BADGES_KEY, JSON.stringify(Array.from(existing)));
  } catch {
    // kota dolduysa sessizce geç
  }
  return fresh;
}
