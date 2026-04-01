import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  elevated?: boolean;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-6 sm:p-7',
  lg: 'p-8 sm:p-10',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  elevated = false,
  hover = false,
  onClick,
  padding = 'md',
}) => {
  const base = [
    'rounded-3xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden',
    glass
      ? 'glass-bright'
      : elevated
      ? 'bg-gradient-to-br from-bg-elevated to-bg-surface border-border-bright shadow-elevated'
      : 'bg-bg-surface/80 backdrop-blur-md border-white/5 shadow-card',
    hover && onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-glow' : '',
    paddingClasses[padding],
    className,
  ].join(' ');

  if (hover || onClick) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={{ 
          y: -4, 
          scale: 1.01,
          boxShadow: '0 24px 64px -12px rgba(93, 61, 232, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }

  return (
    <div className={base}>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
