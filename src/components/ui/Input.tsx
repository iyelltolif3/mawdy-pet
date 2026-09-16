import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  rightAction,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-stone-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full px-3.5 py-2.5 text-sm min-h-[44px] border rounded-lg bg-white text-stone-900 placeholder:text-stone-400 transition-colors ${
            icon ? 'pl-10' : ''
          } ${rightAction ? 'pr-10' : ''} ${
            error
              ? 'border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500'
              : 'border-stone-300 focus:outline-none focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary)'
          } ${className}`}
          {...props}
        />
        {rightAction && (
          <div className="absolute right-3 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {hint && !error && <span className="text-[11px] text-stone-500">{hint}</span>}
    </div>
  );
}
