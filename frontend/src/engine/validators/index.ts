import type { AnyPuzzle } from '../../types';
import { validateSudokuBoard } from '../generators/sudoku';
import { validateBinaryBoard } from '../generators/binary';

export interface ValidationResult {
  isComplete: boolean;
  isCorrect: boolean;
  errors?: unknown[];
}

export function validatePuzzle(
  puzzle: AnyPuzzle,
  userState: unknown
): ValidationResult {
  switch (puzzle.type) {
    case 'sudoku': {
      const board = userState as (number | null)[][];
      const { isComplete, conflicts } = validateSudokuBoard(board, puzzle.solution);
      return { isComplete, isCorrect: isComplete, errors: conflicts };
    }

    case 'pattern': {
      const selected = userState as number;
      const isCorrect = selected === puzzle.correctIndex;
      return { isComplete: selected !== -1, isCorrect };
    }

    case 'sequence': {
      const answers = userState as (number | null)[];
      const isComplete = answers.every(a => a !== null);
      const isCorrect =
        isComplete &&
        puzzle.answers.every((ans, i) => answers[i] === ans);
      return { isComplete, isCorrect };
    }

    case 'deduction': {
      const userGrid = userState as number[][];
      const size = puzzle.categories.length;
      const isComplete = userGrid.every(row =>
        row.every(cell => cell !== -1)
      );
      if (!isComplete) return { isComplete: false, isCorrect: false };
      let isCorrect = true;
      for (let p = 0; p < size; p++) {
        for (let c = 0; c < size; c++) {
          if (userGrid[p][c] !== puzzle.solution[p][c]) {
            isCorrect = false;
            break;
          }
        }
      }
      return { isComplete, isCorrect };
    }

    case 'binary': {
      const board = userState as (0 | 1 | null)[][];
      const { isComplete, errors } = validateBinaryBoard(board, puzzle.solution, puzzle.size);
      return { isComplete, isCorrect: isComplete, errors };
    }

    default:
      return { isComplete: false, isCorrect: false };
  }
}
