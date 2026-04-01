// ============================================
// PUZZLE TYPES
// ============================================

export type PuzzleType = 'sudoku' | 'pattern' | 'sequence' | 'deduction' | 'binary';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Sudoku
export interface SudokuPuzzle {
  type: 'sudoku';
  board: (number | null)[][];  // null = empty cell
  solution: number[][];
  given: boolean[][];          // true = pre-filled (immutable)
  size: 9 | 6 | 4;
  difficulty: Difficulty;
}

// Pattern Puzzle
export type PatternColor = 'primary' | 'accent' | 'warning' | 'error' | 'success';
export type PatternShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';

export interface PatternItem {
  shape: PatternShape;
  color: PatternColor;
  number?: number;
}

export interface PatternPuzzle {
  type: 'pattern';
  sequence: (PatternItem | null)[];  // null = the missing item
  missingIndex: number;
  options: PatternItem[];            // 4 options, 1 correct
  correctIndex: number;
  difficulty: Difficulty;
}

// Sequence Puzzle
export interface SequencePuzzle {
  type: 'sequence';
  sequence: (number | null)[];      // null = blank to fill
  missingIndices: number[];
  answers: number[];                 // correct values for each null
  rule: string;                     // human-readable hint (e.g., "+3 each step")
  difficulty: Difficulty;
}

// Deduction Grid (Einstein puzzle)
export interface DeductionClue {
  text: string;
  type: 'direct' | 'adjacent' | 'position' | 'relative';
}

export interface DeductionPuzzle {
  type: 'deduction';
  categories: string[];          // e.g., ['Person', 'Color', 'Animal', 'Drink']
  items: string[][];             // items[category] = [item1, item2, item3, item4]
  solution: number[][];          // solution[person][category] = itemIndex
  clues: DeductionClue[];
  difficulty: Difficulty;
}

// Binary Puzzle (Binairo)
export interface BinaryPuzzle {
  type: 'binary';
  board: (0 | 1 | null)[][];    // null = empty
  solution: (0 | 1)[][];
  given: boolean[][];
  size: 6 | 8;
  difficulty: Difficulty;
}

export type AnyPuzzle = SudokuPuzzle | PatternPuzzle | SequencePuzzle | DeductionPuzzle | BinaryPuzzle;

// ============================================
// GAME STATE
// ============================================

export interface PuzzleProgress {
  date: string;               // YYYY-MM-DD
  puzzleType: PuzzleType;
  difficulty: Difficulty;
  completed: boolean;
  gaveUp: boolean;
  score: number;
  timeTaken: number;          // seconds
  hintsUsed: number;
  boardState?: unknown;       // type-specific saved board state
}

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  streakCount: number;
  lastPlayed?: string;
  totalPoints: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// STREAK
// ============================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayed: string | null;    // YYYY-MM-DD
  history: Record<string, number>; // date → score (0 if played but no score)
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  timeTaken: number;
  hintsUsed: number;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flame',    title: 'First Flame',     description: '3-day streak',              icon: '🔥' },
  { id: 'speed_demon',    title: 'Speed Demon',      description: 'Solve in under 60 seconds', icon: '⚡' },
  { id: 'no_hints',       title: 'Pure Logic',       description: 'Solve without any hints',   icon: '🧠' },
  { id: 'perfect_score',  title: 'Perfect Score',    description: 'Score 950 or above',        icon: '💎' },
  { id: 'weekly_warrior', title: 'Weekly Warrior',   description: '7-day streak',              icon: '🌟' },
  { id: 'month_master',   title: 'Month Master',     description: '30-day streak',             icon: '🏆' },
  { id: 'legend',         title: 'Logic Legend',     description: '100-day streak',            icon: '👑' },
  { id: 'variety',        title: 'All-Rounder',      description: 'Solve all 5 puzzle types',  icon: '🎯' },
];

// ============================================
// SCORING
// ============================================

export interface ScoreResult {
  finalScore: number;
  baseScore: number;
  timeBonus: number;
  hintPenalty: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}
