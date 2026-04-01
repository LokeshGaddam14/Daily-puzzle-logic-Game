import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../store';
import { updateUserState, setSelectedCell, clearHintReveal } from '../../store/slices/puzzleSlice';
import type { SudokuPuzzle } from '../../types';

interface SudokuBoardProps {
  puzzle: SudokuPuzzle;
}

const NUM_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const SudokuBoard: React.FC<SudokuBoardProps> = ({ puzzle }) => {
  const dispatch = useDispatch();
  const { userState, selectedCell, hintsReveal, isCompleted } = useSelector(
    (s: RootState) => s.puzzle
  );

  const board = (userState as (number | null)[][]) || puzzle.board.map(r => [...r]);
  const selected = selectedCell;
  const hintCell = hintsReveal as [number, number] | null;

  const selectCell = useCallback(
    (r: number, c: number) => {
      if (isCompleted) return;
      if (puzzle.given[r][c]) return;
      dispatch(setSelectedCell([r, c]));
      if (hintCell) dispatch(clearHintReveal());
    },
    [dispatch, puzzle.given, isCompleted, hintCell]
  );

  const enterNumber = useCallback(
    (num: number | null) => {
      if (!selected || isCompleted) return;
      const [r, c] = selected;
      if (puzzle.given[r][c]) return;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = num;
      dispatch(updateUserState(newBoard));
    },
    [board, dispatch, puzzle.given, selected, isCompleted]
  );

  // Handle keyboard
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected || isCompleted) return;
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= 9) enterNumber(n);
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') enterNumber(null);
      // Arrow navigation
      const [r, c] = selected;
      if (e.key === 'ArrowUp' && r > 0) dispatch(setSelectedCell([r - 1, c]));
      if (e.key === 'ArrowDown' && r < 8) dispatch(setSelectedCell([r + 1, c]));
      if (e.key === 'ArrowLeft' && c > 0) dispatch(setSelectedCell([r, c - 1]));
      if (e.key === 'ArrowRight' && c < 8) dispatch(setSelectedCell([r, c + 1]));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, enterNumber, dispatch, isCompleted]);

  const getCellClass = (r: number, c: number): string => {
    const classes = ['sudoku-cell'];
    if (puzzle.given[r][c]) {
      classes.push('given');
    } else {
      classes.push('user-entered');
    }
    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) classes.push('selected');
      else if (board[sr][sc] !== null && board[r][c] === board[sr][sc]) classes.push('same-number');
    }
    if (hintCell && hintCell[0] === r && hintCell[1] === c) classes.push('selected');
    return classes.join(' ');
  };

  // Desktop: 3x3 box borders
  const boxBorderRight = (c: number) => c === 2 || c === 5 ? 'border-r-2 border-r-border-bright' : '';
  const boxBorderBottom = (r: number) => r === 2 || r === 5 ? 'border-b-2 border-b-border-bright' : '';

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Board */}
      <div
        className="sudoku-grid sudoku-9x9"
        style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}
        role="grid"
        aria-label="Sudoku board"
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <motion.div
              key={`${r}-${c}`}
              className={`${getCellClass(r, c)} ${boxBorderRight(c)} ${boxBorderBottom(r)}`}
              onClick={() => selectCell(r, c)}
              whileTap={!puzzle.given[r][c] ? { scale: 0.92 } : {}}
              role="gridcell"
              aria-label={`Row ${r + 1}, Column ${c + 1}: ${cell ?? 'empty'}`}
              aria-selected={selected?.[0] === r && selected?.[1] === c}
            >
              {cell !== null && (
                <motion.span
                  key={cell}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Mobile Numpad */}
      <div className="numpad-grid w-full max-w-xs sm:max-w-sm">
        {NUM_KEYS.map(k => (
          <button
            key={k}
            className="numpad-key"
            onClick={() => enterNumber(parseInt(k))}
            aria-label={`Enter ${k}`}
          >
            {k}
          </button>
        ))}
        <button
          className="numpad-key erase"
          onClick={() => enterNumber(null)}
          aria-label="Erase"
          style={{ gridColumn: 'span 1' }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
};
