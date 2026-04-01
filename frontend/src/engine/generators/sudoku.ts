import { createSeededRandom, seededShuffle } from '../seed';
import type { SudokuPuzzle, Difficulty } from '../../types';

// ============================================
// BASE VALID 9×9 SUDOKU (known valid solution)
// ============================================
const BASE_GRID: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6, 7, 8, 9, 1],
  [5, 6, 7, 8, 9, 1, 2, 3, 4],
  [8, 9, 1, 2, 3, 4, 5, 6, 7],
  [3, 4, 5, 6, 7, 8, 9, 1, 2],
  [6, 7, 8, 9, 1, 2, 3, 4, 5],
  [9, 1, 2, 3, 4, 5, 6, 7, 8],
];

function deepCopy(grid: number[][]): number[][] {
  return grid.map(row => [...row]);
}

// ============================================
// SHUFFLE - preserves Sudoku validity
// ============================================
function shuffleGrid(grid: number[][], rng: () => number): number[][] {
  let g = deepCopy(grid);

  // 1. Shuffle row bands (groups of 3 rows)
  const bandOrder = seededShuffle([0, 1, 2], rng);
  g = bandOrder.flatMap(band => g.slice(band * 3, band * 3 + 3));

  // 2. Shuffle rows within each band
  for (let band = 0; band < 3; band++) {
    const rowOrder = seededShuffle([0, 1, 2], rng);
    const base = band * 3;
    const rows = rowOrder.map(r => [...g[base + r]]);
    for (let i = 0; i < 3; i++) g[base + i] = rows[i];
  }

  // 3. Transpose, apply same column shuffles (shuffle column bands + within bands)
  g = transpose(g);

  const colBandOrder = seededShuffle([0, 1, 2], rng);
  g = colBandOrder.flatMap(band => g.slice(band * 3, band * 3 + 3));

  for (let band = 0; band < 3; band++) {
    const colOrder = seededShuffle([0, 1, 2], rng);
    const base = band * 3;
    const cols = colOrder.map(c => [...g[base + c]]);
    for (let i = 0; i < 3; i++) g[base + i] = cols[i];
  }

  g = transpose(g);

  // 4. Relabel digits (1→new1, 2→new2, ... 9→new9)
  const digitMap = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  return g.map(row => row.map(v => digitMap[v - 1]));
}

function transpose(grid: number[][]): number[][] {
  return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
}

// ============================================
// REMOVE CELLS TO CREATE PUZZLE
// ============================================
const GIVENS: Record<Difficulty, number> = {
  easy: 38,
  medium: 30,
  hard: 22,
};

function removeCells(
  solution: number[][],
  rng: () => number,
  givens: number
): { board: (number | null)[][]; given: boolean[][] } {
  const board: (number | null)[][] = solution.map(row => [...row] as (number | null)[]);
  const given: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(true));

  const cells: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      cells.push([r, c]);

  const shuffled = seededShuffle(cells, rng);
  let removed = 0;
  const toRemove = 81 - givens;

  for (const [r, c] of shuffled) {
    if (removed >= toRemove) break;
    board[r][c] = null;
    given[r][c] = false;
    removed++;
  }

  return { board, given };
}

// ============================================
// MAIN GENERATOR
// ============================================
export function generateSudoku(seed: number, difficulty: Difficulty): SudokuPuzzle {
  const rng = createSeededRandom(seed);
  const solution = shuffleGrid(BASE_GRID, rng);
  const { board, given } = removeCells(solution, rng, GIVENS[difficulty]);

  return {
    type: 'sudoku',
    board,
    solution,
    given,
    size: 9,
    difficulty,
  };
}

// ============================================
// VALIDATOR
// ============================================
export function validateSudokuBoard(
  board: (number | null)[][],
  solution: number[][]
): { isComplete: boolean; conflicts: [number, number][] } {
  const conflicts: [number, number][] = [];

  // Check each filled cell against solution
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null && val !== solution[r][c]) {
        conflicts.push([r, c]);
      }
    }
  }

  const isComplete =
    conflicts.length === 0 &&
    board.every(row => row.every(cell => cell !== null));

  return { isComplete, conflicts };
}

export function getSudokuHint(
  board: (number | null)[][],
  solution: number[][],
  given: boolean[][],
  rng: () => number
): [number, number] | null {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!given[r][c] && board[r][c] === null)
        emptyCells.push([r, c]);

  if (emptyCells.length === 0) return null;
  const shuffled = seededShuffle(emptyCells, rng);
  return shuffled[0];
}
