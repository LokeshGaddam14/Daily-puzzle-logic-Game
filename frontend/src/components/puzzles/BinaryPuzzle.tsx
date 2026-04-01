import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../store';
import { updateUserState } from '../../store/slices/puzzleSlice';
import type { BinaryPuzzle } from '../../types';

interface BinaryPuzzleProps {
  puzzle: BinaryPuzzle;
}

type Cell = 0 | 1 | null;

export const BinaryPuzzleBoard: React.FC<BinaryPuzzleProps> = ({ puzzle }) => {
  const dispatch = useDispatch();
  const { userState, hintsReveal, isCompleted } = useSelector((s: RootState) => s.puzzle);
  const hintCell = hintsReveal as [number, number] | null;

  const { size } = puzzle;
  const board = (userState as Cell[][]) || puzzle.board.map(r => [...r]);

  const cycleCell = (r: number, c: number) => {
    if (isCompleted || puzzle.given[r][c]) return;
    const cur = board[r][c];
    const next: Cell = cur === null ? 0 : cur === 0 ? 1 : null;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = next;
    dispatch(updateUserState(newBoard));
  };

  // Check row/col balance for visual feedback
  const rowCounts = board.map(row => ({
    zeros: row.filter(v => v === 0).length,
    ones: row.filter(v => v === 1).length,
  }));
  const colCounts = Array.from({ length: size }, (_, c) => ({
    zeros: board.filter(row => row[c] === 0).length,
    ones: board.filter(row => row[c] === 1).length,
  }));

  const half = size / 2;
  const rowErrors = rowCounts.map(rc => rc.zeros > half || rc.ones > half);
  const colErrors = colCounts.map(cc => cc.zeros > half || cc.ones > half);

  const getCellClass = (r: number, c: number) => {
    const val = board[r][c];
    const isGiven = puzzle.given[r][c];
    const hasRowError = rowErrors[r];
    const hasColError = colErrors[c];
    const hasError = !isGiven && (hasRowError || hasColError);

    const isHint = hintCell && hintCell[0] === r && hintCell[1] === c;

    if (val === 0) return `binary-cell zero ${isGiven ? 'given' : ''} ${hasError ? 'error' : ''} ${isHint ? 'shadow-glow-accent border-accent animate-pulse' : ''}`;
    if (val === 1) return `binary-cell one ${isGiven ? 'given' : ''} ${hasError ? 'error' : ''} ${isHint ? 'shadow-glow-accent border-accent animate-pulse' : ''}`;
    return `binary-cell empty ${isHint ? 'border-accent animate-pulse' : ''}`;
  };

  const filledCount = board.flat().filter(v => v !== null).length;
  const totalCells = size * size;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Rules reminder */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 w-full max-w-sm">
        <p className="text-xs font-body text-text-muted uppercase tracking-widest mb-2">Rules</p>
        <ul className="space-y-1">
          {[
            'Equal 0s and 1s in each row & column',
            'No three consecutive identical numbers',
          ].map((rule, i) => (
            <li key={i} className="flex gap-2 text-xs font-body text-text-secondary">
              <span className="text-primary">•</span> {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Board */}
      <div>
        {/* Column indicators */}
        <div className="flex gap-1.5 mb-1.5 ml-0.5">
          {colCounts.map((cc, c) => (
            <div
              key={c}
              className={`w-10 text-center text-[10px] font-body font-medium ${
                colErrors[c] ? 'text-error' : 'text-text-muted'
              }`}
              style={{ width: 40 }}
            >
              {cc.zeros}/{cc.ones}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div
            className={`grid gap-1.5`}
            style={{ gridTemplateColumns: `repeat(${size}, 40px)` }}
          >
            {board.map((row, r) =>
              row.map((_, c) => (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => cycleCell(r, c)}
                  disabled={isCompleted}
                  className={getCellClass(r, c)}
                  style={{ width: 40, height: 40 }}
                  whileTap={!puzzle.given[r][c] ? { scale: 0.9 } : {}}
                  aria-label={`Row ${r + 1}, Col ${c + 1}: ${board[r][c] ?? 'empty'}`}
                >
                  {board[r][c] !== null && (
                    <motion.span
                      key={board[r][c]}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {board[r][c]}
                    </motion.span>
                  )}
                </motion.button>
              ))
            )}
          </div>

          {/* Row indicators */}
          <div className="flex flex-col gap-1.5 justify-center">
            {rowCounts.map((rc, r) => (
              <div
                key={r}
                className={`text-[10px] font-body font-medium ${
                  rowErrors[r] ? 'text-error' : 'text-text-muted'
                }`}
                style={{ height: 40, lineHeight: '40px' }}
              >
                {rc.zeros}/{rc.ones}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-body">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-primary/20 border border-primary/40 inline-flex items-center justify-center text-primary font-bold text-xs">0</span>
          Tap to place 0
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-accent/20 border border-accent/40 inline-flex items-center justify-center text-accent font-bold text-xs">1</span>
          Tap again for 1
        </span>
      </div>

      {/* Progress */}
      <div className="text-center text-xs font-body text-text-muted">
        {filledCount}/{totalCells} cells filled
        <div className="w-48 h-1 bg-border rounded-full mt-1.5 overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${(filledCount / totalCells) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
