import React from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { outer: 'w-7 h-7', text: 'text-xs' },
  md: { outer: 'w-9 h-9', text: 'text-sm' },
  lg: { outer: 'w-12 h-12', text: 'text-base' },
  xl: { outer: 'w-16 h-16', text: 'text-xl' },
};

const GRADIENT_COLORS = [
  'from-primary to-accent',
  'from-primary to-pink-500',
  'from-accent to-primary',
  'from-warning to-streak',
  'from-success to-accent',
];

function getGradient(name?: string): string {
  if (!name) return GRADIENT_COLORS[0];
  const idx = name.charCodeAt(0) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[idx];
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const { outer, text } = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${outer} rounded-full object-cover border-2 border-border ${className}`}
      />
    );
  }

  return (
    <div
      className={`${outer} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center shrink-0 ${className}`}
    >
      <span className={`${text} font-display font-bold text-white`}>
        {getInitials(name)}
      </span>
    </div>
  );
};
