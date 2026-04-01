import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../store';
import { updateUserState } from '../../store/slices/puzzleSlice';
import type { PatternPuzzle, PatternItem, PatternColor, PatternShape } from '../../types';

const COLOR_CLASSES: Record<PatternColor, string> = {
  primary: 'text-primary bg-primary/20 border-primary/40',
  accent:  'text-accent bg-accent/20 border-accent/40',
  warning: 'text-warning bg-warning/20 border-warning/40',
  error:   'text-error bg-error/20 border-error/40',
  success: 'text-success bg-success/20 border-success/40',
};

const SHAPE_SYMBOLS: Record<PatternShape, string> = {
  circle:   '●',
  square:   '■',
  triangle: '▲',
  diamond:  '◆',
  star:     '★',
};

const PatternItemDisplay: React.FC<{
  item: PatternItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ item, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl rounded-xl border',
    md: 'w-16 h-16 text-3xl rounded-xl border-2',
    lg: 'w-20 h-20 text-4xl rounded-2xl border-2',
  };

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses[size]} ${COLOR_CLASSES[item.color]} ${className}`}
    >
      <span>{SHAPE_SYMBOLS[item.shape]}</span>
    </div>
  );
};

interface PatternPuzzleProps {
  puzzle: PatternPuzzle;
}

export const PatternPuzzleBoard: React.FC<PatternPuzzleProps> = ({ puzzle }) => {
  const dispatch = useDispatch();
  const { userState, hintsReveal, isCompleted } = useSelector((s: RootState) => s.puzzle);
  const selected = (userState as number) ?? -1;

  const handleSelect = (idx: number) => {
    if (isCompleted) return;
    dispatch(updateUserState(idx));
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Sequence display */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5 w-full max-w-md">
        <p className="text-text-muted text-xs font-body uppercase tracking-widest mb-4 text-center">
          Find the missing pattern
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {puzzle.sequence.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1"
            >
              {item === null ? (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-primary/60 bg-primary/5 flex items-center justify-center">
                  <span className="text-primary text-2xl font-display font-bold">?</span>
                </div>
              ) : (
                <PatternItemDisplay item={item} size="md" />
              )}
              <span className="text-text-muted text-[10px] font-body">{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="w-full max-w-md">
        <p className="text-text-muted text-xs font-body uppercase tracking-widest mb-4 text-center">
          Choose the answer
        </p>
        <div className="grid grid-cols-2 gap-3">
          {puzzle.options.map((option, i) => {
            const isSelected = selected === i;
            const label = ['A', 'B', 'C', 'D'][i];

            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isCompleted}
                className={[
                  'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 no-tap-highlight relative',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-glow'
                    : hintsReveal === i
                    ? 'border-accent bg-accent/5 shadow-glow-accent animate-pulse'
                    : 'border-border bg-bg-surface hover:border-primary/40 hover:bg-bg-elevated',
                ].join(' ')}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                aria-label={`Option ${label}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3 w-full">
                  <span
                    className={`w-6 h-6 rounded-full border text-xs font-display font-bold flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-sm font-body text-text-secondary capitalize ml-auto">
                    {option.color} {option.shape}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
