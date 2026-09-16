import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'flat' | 'elevated' | 'tinted' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function Card({
  variant = 'primary',
  padding = 'lg',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-4 sm:p-5',
    xl: 'p-6',
  };

  const variants = {
    primary: 'bg-white rounded-2xl border border-stone-200 shadow-xs',
    secondary: 'bg-stone-50 rounded-2xl border border-stone-200/80',
    tinted: 'bg-stone-50/80 rounded-2xl border border-stone-200/70',
    flat: 'bg-stone-50/60 rounded-2xl border border-stone-200/60',
    elevated: 'bg-white rounded-2xl border border-stone-200 shadow-sm',
    ghost: 'bg-transparent border-0',
  };

  return (
    <div className={`${variants[variant] || variants.primary} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
