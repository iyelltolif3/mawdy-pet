import type { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Select({
  label,
  options,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-stone-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          className={`w-full px-3.5 py-2.5 text-sm min-h-[44px] border rounded-lg bg-white text-stone-900 transition-colors cursor-pointer ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500'
              : 'border-stone-300 focus:outline-none focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary)'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {hint && !error && <span className="text-[11px] text-stone-500">{hint}</span>}
    </div>
  );
}
