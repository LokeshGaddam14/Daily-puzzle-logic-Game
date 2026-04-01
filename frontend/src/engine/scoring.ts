import type { ScoreResult, Difficulty } from '../types';

// ============================================
// SCORING ENGINE
// ============================================

const BASE_SCORE = 1000;
const TIME_BONUS_MAX = 300;     // bonus for solving in < 60 seconds
const TIME_BONUS_THRESHOLD = 60; // seconds for max time bonus
const TIME_DECAY_RATE = 300;     // at 300s, no time bonus
const HINT_PENALTY = 100;        // per hint used
const MIN_SCORE = 100;

export function calculateScore(
  timeTaken: number,
  hintsUsed: number,
  difficulty: Difficulty
): ScoreResult {
  // Base score by difficulty
  const difficultyMultiplier = difficulty === 'hard' ? 1.2 : difficulty === 'medium' ? 1.0 : 0.8;
  const base = Math.round(BASE_SCORE * difficultyMultiplier);

  // Time bonus: linear decay from 300 at 0s to 0 at 300s, capped at max
  const timeBonus = timeTaken <= TIME_BONUS_THRESHOLD
    ? TIME_BONUS_MAX
    : Math.max(0, Math.round(TIME_BONUS_MAX * (1 - (timeTaken - TIME_BONUS_THRESHOLD) / (TIME_DECAY_RATE - TIME_BONUS_THRESHOLD))));

  // Hint penalty
  const hintPenalty = hintsUsed * HINT_PENALTY;

  const raw = base + timeBonus - hintPenalty;
  const finalScore = Math.max(MIN_SCORE, Math.round(raw));

  const grade = finalScore >= 1100 ? 'S'
    : finalScore >= 900  ? 'A'
    : finalScore >= 700  ? 'B'
    : finalScore >= 500  ? 'C'
    : 'D';

  return { finalScore, baseScore: base, timeBonus, hintPenalty, grade };
}

export function getGradeColor(grade: ScoreResult['grade']): string {
  switch (grade) {
    case 'S': return 'text-accent';
    case 'A': return 'text-success';
    case 'B': return 'text-primary-light';
    case 'C': return 'text-warning';
    case 'D': return 'text-error';
  }
}
