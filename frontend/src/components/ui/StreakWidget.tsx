import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakWidgetProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  streak,
  className = '',
  size = 'md',
}) => {
  const isActive = streak > 0;

  const sizeMap = {
    sm: { flame: 'text-xl', count: 'text-lg', label: 'text-xs' },
    md: { flame: 'text-3xl', count: 'text-2xl', label: 'text-xs' },
    lg: { flame: 'text-5xl', count: 'text-4xl', label: 'text-sm' },
  };
  const sz = sizeMap[size];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label={`${streak} day streak`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={streak}
          className={`${sz.flame} ${isActive ? 'flame-icon' : 'opacity-30'} select-none`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          🔥
        </motion.span>
      </AnimatePresence>
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.span
            key={streak}
            className={`font-display font-bold ${sz.count} ${isActive ? 'text-streak text-glow-streak' : 'text-text-muted'}`}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {streak}
          </motion.span>
        </AnimatePresence>
        <span className={`${sz.label} text-text-muted font-body uppercase tracking-wider`}>
          day streak
        </span>
      </div>
    </div>
  );
};
