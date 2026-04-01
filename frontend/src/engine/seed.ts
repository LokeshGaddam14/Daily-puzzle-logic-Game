import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import type { PuzzleType, Difficulty } from '../types';

dayjs.extend(dayOfYear);

export const PUZZLE_TYPES: PuzzleType[] = ['sudoku', 'pattern', 'sequence', 'deduction', 'binary'];

// ============================================
// SEEDED PRNG (Mulberry32 - deterministic)
// ============================================
export function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================
// DATE UTILITIES
// ============================================
export function getDateString(date?: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function getSeedForDate(dateStr: string): number {
  // Convert YYYY-MM-DD to a stable numeric seed
  const [year, month, day] = dateStr.split('-').map(Number);
  // Large prime multiplication to spread entropy
  return (year * 373 + month * 31 + day) * 2654435761;
}

export function getPuzzleTypeForDate(dateStr?: string): PuzzleType {
  const str = dateStr || getDateString();
  const doy = dayjs(str).dayOfYear();
  return PUZZLE_TYPES[doy % PUZZLE_TYPES.length];
}

export function getDifficultyForDate(dateStr?: string): Difficulty {
  const str = dateStr || getDateString();
  const doy = dayjs(str).dayOfYear();
  // Easy: Jan-Mar, Medium: Apr-Sep, Hard: Oct-Dec
  if (doy <= 90) return 'easy';
  if (doy <= 270) return 'medium';
  return 'hard';
}

// ============================================
// SEEDED SHUFFLE
// ============================================
export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================
// SEEDED RANDOM HELPERS
// ============================================
export function seededChoice<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function seededInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
