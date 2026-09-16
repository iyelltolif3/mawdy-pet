import type { ReactNode } from 'react';

export type BadgeStatus =
  | 'default'
  | 'neutral'
  | 'success'
  | 'active'
  | 'in-progress'
  | 'resolved'
  | 'closed'
  | 'warning'
  | 'error'
  | 'danger'
  | 'emergency'
  | 'info';

export interface BadgeProps {
  status?: BadgeStatus;
  variant?: BadgeStatus; // retrocompatibilidad
  dot?: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export function Badge({
  status,
  variant = 'default',
  dot = false,
  size = 'md',
  className = '',
  children,
}: BadgeProps) {
  const currentStatus = status || variant;

  const styles: Record<BadgeStatus, { bg: string; dotColor: string }> = {
    default: { bg: 'bg-stone-100 text-stone-700 border-stone-200', dotColor: 'bg-stone-400' },
    neutral: { bg: 'bg-stone-100 text-stone-700 border-stone-200', dotColor: 'bg-stone-400' },
    success: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-600' },
    active: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-600' },
    'in-progress': { bg: 'bg-sky-50 text-sky-800 border-sky-200', dotColor: 'bg-sky-600 animate-pulse' },
    resolved: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-600' },
    closed: { bg: 'bg-stone-100 text-stone-700 border-stone-200', dotColor: 'bg-stone-400' },
    warning: { bg: 'bg-amber-50 text-amber-800 border-amber-200', dotColor: 'bg-amber-600' },
    error: { bg: 'bg-red-50 text-red-800 border-red-200', dotColor: 'bg-red-600' },
    danger: { bg: 'bg-red-50 text-red-800 border-red-200', dotColor: 'bg-red-600' },
    emergency: { bg: 'bg-rose-50 text-rose-800 border-rose-200', dotColor: 'bg-rose-600 animate-pulse' },
    info: { bg: 'bg-sky-50 text-sky-800 border-sky-200', dotColor: 'bg-sky-600' },
  };

  const current = styles[currentStatus] || styles.default;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${current.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
}
