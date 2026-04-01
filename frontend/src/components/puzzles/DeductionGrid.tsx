import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../store';
import { updateUserState } from '../../store/slices/puzzleSlice';
import type { DeductionPuzzle } from '../../types';

interface DeductionGridProps {
  puzzle: DeductionPuzzle;
}

export const DeductionGrid: React.FC<DeductionGridProps> = ({ puzzle }) => {
  const dispatch = useDispatch();
  const { userState, hintsReveal, isCompleted } = useSelector((s: RootState) => s.puzzle);
  const hintRow = hintsReveal as number[] | null;

  const size = puzzle.categories.length; // 4

  // userGrid[person][category] = itemIndex (-1 = unknown)
  const userGrid = (userState as number[][]) ||
    Array.from({ length: size }, () => Array(size).fill(-1));

  const cycleValue = (person: number, category: number) => {
    if (isCompleted || category === 0) return; // category 0 = person (identity)
    const current = userGrid[person][category];
    const next = current >= size - 1 ? -1 : current + 1;
    const newGrid = userGrid.map(row => [...row]);
    newGrid[person][category] = next;
    dispatch(updateUserState(newGrid));
  };

  const getCellContent = (gridVal: number, category: number): React.ReactNode => {
    if (category === 0) {
      // Person name column — always filled
      return puzzle.items[0][gridVal >= 0 ? gridVal : 0];
    }
    if (gridVal === -1) return '?';
    return puzzle.items[category][gridVal];
  };

  const completedCount = userGrid.flat().filter(v => v !== -1).length;
  const totalCells = size * size;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Clues */}
      <div className="bg-bg-surface border border-border rounded-2xl p-4 max-h-48 overflow-y-auto">
        <p className="text-text-muted text-xs uppercase tracking-widest font-body mb-3">Clues</p>
        <ul className="space-y-2">
          {puzzle.clues.map((clue, i) => (
            <motion.li
              key={i}
              className="flex gap-2 text-sm font-body text-text-secondary"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span className="text-primary shrink-0 font-bold">{i + 1}.</span>
              <span>{clue.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Category headers */}
          <div
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: `80px repeat(${size - 1}, 1fr)` }}
          >
            <div /> {/* Empty corner */}
            {puzzle.categories.slice(1).map(cat => (
              <div key={cat} className="text-center text-xs font-body text-text-muted uppercase tracking-wider py-1">
                {cat}
              </div>
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: size }).map((_, person) => (
            <div
              key={person}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: `80px repeat(${size - 1}, 1fr)` }}
            >
              {/* Person label */}
              <div className="flex items-center">
                <span className="text-sm font-body font-medium text-text-primary truncate">
                  {puzzle.items[0][person]}
                </span>
              </div>

              {/* Category cells (skip 0 = person) */}
              {Array.from({ length: size - 1 }).map((_, ci) => {
                const cat = ci + 1;
                const val = userGrid[person]?.[cat] ?? -1;
                const isEmpty = val === -1;

                const isHint = hintRow && person === hintRow[0] && val === hintRow[cat];

                return (
                  <motion.button
                    key={cat}
                    onClick={() => cycleValue(person, cat)}
                    disabled={isCompleted}
                    className={`deduction-cell h-12 text-xs font-body font-medium ${
                      !isEmpty ? 'filled' : ''
                    } ${isCompleted ? 'cursor-default' : ''} ${
                      isHint ? 'ring-2 ring-accent ring-inset shadow-glow-accent' : ''
                    }`}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${puzzle.items[0][person]}, ${puzzle.categories[cat]}: ${isEmpty ? 'unknown' : puzzle.items[cat][val]}`}
                  >
                    {isEmpty ? (
                      <span className="text-text-muted text-xs">–</span>
                    ) : (
                      <motion.span
                        key={val}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {puzzle.items[cat][val]}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-sm font-body text-text-muted">
        {completedCount} / {totalCells} cells filled
        <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(completedCount / totalCells) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};
