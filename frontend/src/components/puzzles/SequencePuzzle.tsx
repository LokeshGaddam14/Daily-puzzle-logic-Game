import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../../store';
import { updateUserState } from '../../store/slices/puzzleSlice';
import type { SequencePuzzle } from '../../types';

interface SequencePuzzleProps {
  puzzle: SequencePuzzle;
}

export const SequencePuzzleBoard: React.FC<SequencePuzzleProps> = ({ puzzle }) => {
  const dispatch = useDispatch();
  const { userState, isCompleted } = useSelector((s: RootState) => s.puzzle);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const answers = (userState as (string | null)[]) || puzzle.answers.map(() => null);

  const blankCount = puzzle.missingIndices.length;

  const handleChange = (blankIndex: number, value: string) => {
    if (isCompleted) return;
    // Only allow numbers (including negative)
    if (value !== '' && value !== '-' && isNaN(Number(value))) return;
    const newAnswers = [...answers];
    newAnswers[blankIndex] = value === '' ? null : value;
    dispatch(updateUserState(newAnswers));

    // Auto-focus next input when a number is entered
    if (value !== '' && value !== '-' && blankIndex < blankCount - 1) {
      setTimeout(() => inputRefs.current[blankIndex + 1]?.focus(), 50);
    }
  };

  let blankIdx = 0;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Rule hint */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 w-full max-w-md">
        <p className="text-xs font-body text-text-muted uppercase tracking-wider mb-1">Pattern Hint</p>
        <p className="text-sm font-body text-text-primary">{puzzle.rule}</p>
      </div>

      {/* Sequence */}
      <div className="bg-bg-surface border border-border rounded-2xl p-6 w-full max-w-md">
        <p className="text-text-muted text-xs font-body uppercase tracking-widest mb-5 text-center">
          Fill in the missing numbers
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {puzzle.sequence.map((item, i) => {
            if (item === null) {
              const currentBlank = blankIdx++;
              return (
                <motion.div
                  key={i}
                  className="flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <input
                    ref={el => { inputRefs.current[currentBlank] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={answers[currentBlank] ?? ''}
                    onChange={e => handleChange(currentBlank, e.target.value)}
                    disabled={isCompleted}
                    className={[
                      'w-14 h-14 text-center font-display font-bold text-lg rounded-xl border-2 transition-all',
                      'bg-bg-elevated focus:outline-none',
                      answers[currentBlank]
                        ? 'border-primary text-primary bg-primary/10 shadow-glow'
                        : 'border-dashed border-primary/50 text-text-muted',
                    ].join(' ')}
                    aria-label={`Blank ${currentBlank + 1}`}
                    maxLength={6}
                  />
                  <span className="text-primary text-[10px] font-body font-medium">
                    #{currentBlank + 1}
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-14 h-14 bg-bg-elevated border border-border rounded-xl flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-text-primary">{item}</span>
                </div>
                <span className="text-text-muted text-[10px] font-body">{i + 1}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fill status */}
      <div className="flex items-center gap-3 text-sm font-body text-text-muted">
        <span>
          {answers.filter(a => a !== null).length} of {blankCount} filled
        </span>
        <div className="flex gap-1">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                a !== null ? 'bg-primary shadow-glow' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
