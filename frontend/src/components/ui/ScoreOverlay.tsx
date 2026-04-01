import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Share, Play, Trophy, X, Star } from 'lucide-react';
import { Button } from './Button';
import type { ScoreResult } from '../../types';
import { getGradeColor } from '../../engine/scoring';

interface ScoreOverlayProps {
  visible: boolean;
  score: ScoreResult | null;
  timeTaken: number;
  hintsUsed: number;
  isSolved: boolean;
  puzzleType: string;
  date: string;
  onPlayNext?: () => void;
  onShare?: () => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export const ScoreOverlay: React.FC<ScoreOverlayProps> = ({
  visible,
  score,
  timeTaken,
  hintsUsed,
  isSolved,
  puzzleType,
  date,
  onPlayNext,
  onShare,
  onClose,
}) => {
  useEffect(() => {
    if (visible && isSolved) {
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#5D3DE8', '#00F0FF', '#FF3C38', '#10B981', '#F59E0B'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [visible, isSolved]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pb-unsafe-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Deep blur backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg-primary/95 backdrop-blur-[32px] pointer-events-auto"
            onClick={onClose}
          />

          {/* Premium Card Surface */}
          <motion.div
            className="relative z-10 w-full max-w-[420px] bg-bg-elevated/80 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-elevated"
            initial={{ y: 150, scale: 0.9, opacity: 0, rotateX: 20 }}
            animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ y: 150, scale: 0.9, opacity: 0, rotateX: -20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.8 }}
            style={{ perspective: 1000 }}
          >
            {/* Glossy top edge highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* Dynamic Status Bar */}
            <div className={`h-1.5 w-full ${isSolved ? 'bg-gradient-to-r from-primary via-accent to-primary background-animate' : 'bg-error'}`} />

            <div className="relative p-8">
              {/* Close Button Top Right */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-text-secondary hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mt-2 mb-8">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(93,61,232,0.3)]"
                  animate={isSolved ? { 
                    rotate: [0, -10, 10, -5, 5, 0],
                    boxShadow: ['0 0 40px rgba(93,61,232,0.3)', '0 0 60px rgba(0,240,255,0.4)', '0 0 40px rgba(93,61,232,0.3)']
                  } : {}}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: isSolved ? Infinity : 0, repeatDelay: 3 }}
                >
                  {isSolved ? <Trophy className="w-10 h-10 text-accent" /> : <X className="w-10 h-10 text-error" />}
                </motion.div>
                
                <h2 className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary tracking-tight">
                  {isSolved ? 'System Cleared' : 'Logic Failed'}
                </h2>
                <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-text-secondary text-xs sm:text-sm font-bold uppercase tracking-[0.15em]">
                    {puzzleType} · {date}
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              {isSolved && score && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[50px] -z-10 rounded-full" />
                    <motion.div
                      className="text-center relative z-10"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                    >
                      <div className={`font-display text-[80px] leading-none font-black ${getGradeColor(score.grade)} drop-shadow-[0_0_20px_var(--tw-shadow-color)]`} style={{ '--tw-shadow-color': score.grade === 'S' ? 'rgba(0,240,255,0.5)' : 'rgba(93,61,232,0.5)' } as React.CSSProperties}>
                        {score.grade}
                      </div>
                      <div className="font-display text-5xl font-black text-white mt-1 tracking-tighter">
                        {score.finalScore.toLocaleString()}
                      </div>
                      <div className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">Total Points</div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Base', value: score.baseScore, color: 'text-white' },
                      { label: 'Time Bonus', value: `+${score.timeBonus}`, color: 'text-accent' },
                      { label: 'Penalty', value: score.hintPenalty ? `-${score.hintPenalty}` : '0', color: score.hintPenalty ? 'text-error' : 'text-text-secondary' },
                    ].map((item, idx) => (
                      <motion.div 
                        key={item.label} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className="bg-[#0c0c1a] rounded-2xl p-4 text-center border border-white/5 shadow-inner"
                      >
                        <div className={`font-display font-black text-xl mb-1 ${item.color}`}>{item.value}</div>
                        <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* High level stats wrap */}
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-2xl border border-white/5"
                  >
                    <div className="text-center">
                      <div className="font-display font-bold text-white text-lg">{formatTime(timeTaken)}</div>
                      <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Time</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <div className="font-display font-bold text-white text-lg">{hintsUsed}/3</div>
                      <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Hints</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <div className="flex gap-0.5 text-accent text-sm mt-1">
                        <Star className={`w-4 h-4 ${score.grade === 'S' || score.grade === 'A' || score.grade === 'B' ? 'fill-current' : 'opacity-30'}`} />
                        <Star className={`w-4 h-4 ${score.grade === 'S' || score.grade === 'A' ? 'fill-current' : 'opacity-30'}`} />
                        <Star className={`w-4 h-4 ${score.grade === 'S' ? 'fill-current' : 'opacity-30'}`} />
                      </div>
                      <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Rating</div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {onShare && (
                  <Button variant="secondary" size="lg" onClick={onShare} className="flex-1" icon={<Share className="w-4 h-4" />}>
                    Share Result
                  </Button>
                )}
                {onPlayNext ? (
                  <Button variant="primary" size="lg" onClick={onPlayNext} className="flex-1" icon={<Play className="w-4 h-4 fill-current" />}>
                    Next Protocol
                  </Button>
                ) : (
                  <Button variant="ghost" size="lg" onClick={onClose} className="flex-1 w-full border-white/10 bg-white/5">
                    Return to Hub
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
