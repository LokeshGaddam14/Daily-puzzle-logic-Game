import React from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  'aria-label'?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-glow hover:shadow-glow-strong border border-primary-light/40 relative overflow-hidden group',
  secondary:
    'bg-bg-elevated hover:bg-border-bright text-text-primary border border-border hover:border-primary/50 shadow-glass hover:shadow-glow',
  ghost:
    'bg-transparent hover:bg-bg-elevated/50 text-text-secondary hover:text-text-primary border border-transparent hover:border-border/50',
  danger:
    'bg-error/10 hover:bg-error/20 text-error border border-error/30 hover:border-error/60 shadow-glass hover:shadow-glow-error',
  accent:
    'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent/60 hover:shadow-[0_0_24px_rgba(0,240,255,0.4)] relative overflow-hidden group',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl gap-2 font-semibold',
  md: 'px-6 py-3 text-base rounded-2xl gap-2.5 font-bold',
  lg: 'px-8 py-4 text-lg rounded-[20px] gap-3 font-bold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
  id,
  'aria-label': ariaLabel,
}) => {
  const isSheenActive = variant === 'primary' || variant === 'accent';
  
  const cls = [
    'inline-flex items-center justify-center font-display transition-all duration-300 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'no-tap-highlight select-none cursor-pointer',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <motion.button
      type={type}
      id={id}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      className={cls}
      onClick={onClick}
      whileTap={{ scale: disabled || loading ? 1 : 0.94 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.03, y: disabled ? 0 : -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {isSheenActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-sweep pointer-events-none" />
      )}
      
      {loading ? (
        <span className="w-5 h-5 border-[3px] border-current border-t-transparent rounded-full animate-spin z-10" />
      ) : icon ? (
        <span className="shrink-0 z-10">{icon}</span>
      ) : null}
      {children && <span className="z-10 relative">{children}</span>}
    </motion.button>
  );
};
