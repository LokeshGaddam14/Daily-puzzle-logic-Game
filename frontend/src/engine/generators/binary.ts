import { createSeededRandom, seededShuffle } from '../seed';
import type { BinaryPuzzle, Difficulty } from '../../types';

type Cell = 0 | 1 | null;

// ============================================
// GENERATE A VALID BINAIRO SOLUTION
// ============================================
function generateSolution(size: number, rng: () => number): (0 | 1)[][] {
  const grid: (0 | 1)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // Fill using backtracking with seeded randomness
  function isValid(g: (0 | 1 | null)[][], r: number, c: number, val: 0 | 1): boolean {
    // Check no three consecutive in row
    if (c >= 2 && g[r][c - 1] === val && g[r][c - 2] === val) return false;
    if (c >= 1 && c + 1 < size && g[r][c - 1] === val && g[r][c + 1] === val) return false;
    if (c + 2 < size && g[r][c + 1] === val && g[r][c + 2] === val) return false;

    // Check no three consecutive in col
    if (r >= 2 && g[r - 1][c] === val && g[r - 2][c] === val) return false;
    if (r >= 1 && r + 1 < size && g[r - 1][c] === val && g[r + 1][c] === val) return false;
    if (r + 2 < size && g[r + 1][c] === val && g[r + 2][c] === val) return false;

    // Count in row so far
    let rowCount = 0;
    for (let col = 0; col < size; col++) {
      if (g[r][col] === val) rowCount++;
    }
    if (rowCount >= size / 2) return false;

    // Count in col so far
    let colCount = 0;
    for (let row = 0; row < size; row++) {
      if (g[row][c] === val) colCount++;
    }
    if (colCount >= size / 2) return false;

    return true;
  }

  function solve(pos: number): boolean {
    if (pos === size * size) return true;
    const r = Math.floor(pos / size);
    const c = pos % size;

    const vals: (0 | 1)[] = rng() > 0.5 ? [0, 1] : [1, 0];
    for (const v of vals) {
      if (isValid(grid, r, c, v)) {
        grid[r][c] = v;
        if (solve(pos + 1)) return true;
        grid[r][c] = null as unknown as 0 | 1;
      }
    }
    return false;
  }

  solve(0);
  return grid as (0 | 1)[][];
}

// ============================================
// REMOVE CELLS
// ============================================
const REVEAL_RATIOS: Record<Difficulty, number> = {
  easy: 0.55,   // reveal 55% of cells
  medium: 0.4,
  hard: 0.3,
};

export function generateBinary(seed: number, difficulty: Difficulty): BinaryPuzzle {
  const rng = createSeededRandom(seed + 400);
  const size = difficulty === 'hard' ? 8 : 6;

  const solution = generateSolution(size, rng);
  const revealRatio = REVEAL_RATIOS[difficulty];

  const cells: [number, number][] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      cells.push([r, c]);

  const shuffledCells = seededShuffle(cells, rng);
  const toReveal = Math.round(size * size * revealRatio);

  const board: Cell[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const given: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  for (let i = 0; i < toReveal; i++) {
    const [r, c] = shuffledCells[i];
    board[r][c] = solution[r][c];
    given[r][c] = true;
  }

  return { type: 'binary', board, solution, given, size: size as 6 | 8, difficulty };
}

// ============================================
// VALIDATOR
// ============================================
export function validateBinaryBoard(
  board: Cell[][],
  solution: (0 | 1)[][],
  size: number
): { isComplete: boolean; errors: [number, number][] } {
  const errors: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      if (v !== null && v !== solution[r][c]) errors.push([r, c]);
    }
  }
  const isComplete =
    errors.length === 0 &&
    board.every(row => row.every(cell => cell !== null));
  return { isComplete, errors };
}
