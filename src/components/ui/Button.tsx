import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'emergency' | 'icon' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isIconVariant = variant === 'icon';

  const base =
    'inline-flex items-center justify-center font-semibold transition-colors cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const radii = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-lg',
  };

  const sizes = {
    sm: isIconVariant ? 'p-2 min-w-[36px] min-h-[36px]' : 'px-3 py-1.5 text-xs min-h-[36px] gap-1.5',
    md: isIconVariant ? 'p-2.5 min-w-[44px] min-h-[44px]' : 'px-4 py-2.5 text-sm min-h-[44px] gap-2',
    lg: isIconVariant ? 'p-3 min-w-[48px] min-h-[48px]' : 'px-5 py-3 text-base min-h-[48px] gap-2.5',
  };

  const variants = {
    primary:
      'bg-(--color-primary) text-white hover:opacity-95 shadow-xs focus-visible:ring-(--color-primary)',
    secondary:
      'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 focus-visible:ring-stone-400',
    tertiary:
      'bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-stone-400',
    danger:
      'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:ring-red-500',
    emergency:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm ring-2 ring-rose-200 focus-visible:ring-rose-600 font-bold',
    icon:
      'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent hover:border-stone-200',
    accent:
      'bg-(--color-accent) text-white hover:opacity-90 shadow-xs focus-visible:ring-(--color-accent)',
    ghost:
      'bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-300',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${base} ${radii[size]} ${sizes[size]} ${variants[variant]} ${width} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
    </button>
  );
}
