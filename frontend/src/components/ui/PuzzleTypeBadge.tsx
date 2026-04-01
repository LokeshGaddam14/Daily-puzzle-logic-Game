import React from 'react';
import type { PuzzleType } from '../../types';

interface PuzzleTypeBadgeProps {
  type: PuzzleType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const TYPE_CONFIG: Record<PuzzleType, {
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  sudoku:    { icon: '⊞',  label: 'Number Matrix',  color: 'text-primary',       bg: 'bg-primary/10',    border: 'border-primary/30' },
  pattern:   { icon: '◈',  label: 'Pattern Match',  color: 'text-accent',        bg: 'bg-accent/10',     border: 'border-accent/30' },
  sequence:  { icon: '∿',  label: 'Sequence',       color: 'text-warning',       bg: 'bg-warning/10',    border: 'border-warning/30' },
  deduction: { icon: '⊕',  label: 'Deduction',      color: 'text-success',       bg: 'bg-success/10',    border: 'border-success/30' },
  binary:    { icon: '⊻',  label: 'Binary Logic',   color: 'text-streak',        bg: 'bg-streak/10',     border: 'border-streak/30' },
};

const sizeMap = {
  sm:  { icon: 'text-base', label: 'text-xs',  pad: 'px-2 py-0.5', gap: 'gap-1' },
  md:  { icon: 'text-lg',   label: 'text-sm',  pad: 'px-3 py-1',   gap: 'gap-1.5' },
  lg:  { icon: 'text-2xl',  label: 'text-base', pad: 'px-4 py-1.5', gap: 'gap-2' },
};

export const PuzzleTypeBadge: React.FC<PuzzleTypeBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const cfg = TYPE_CONFIG[type];
  const sz = sizeMap[size];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-body font-medium',
        cfg.bg, cfg.border, cfg.color,
        sz.pad, sz.gap,
        className,
      ].join(' ')}
    >
      <span className={sz.icon}>{cfg.icon}</span>
      {showLabel && <span className={sz.label}>{cfg.label}</span>}
    </span>
  );
};

export function getPuzzleTypeConfig(type: PuzzleType) {
  return TYPE_CONFIG[type];
}
