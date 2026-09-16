import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * FeatureCard — Tarjeta especializada para módulos de acción, triage clínico o capacidades del servicio.
 */
export function FeatureCard({
  title,
  description,
  icon,
  badge,
  action,
  onClick,
  className = '',
  children,
}: FeatureCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 transition-all text-left ${
        isClickable
          ? 'cursor-pointer hover:border-stone-300 hover:shadow-xs active:scale-[0.99]'
          : ''
      } ${className}`}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3.5">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-stone-900 truncate">{title}</h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {description && (
            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {children && <div className="mt-3">{children}</div>}
        </div>

        {action ? (
          <div className="shrink-0 self-center">{action}</div>
        ) : isClickable ? (
          <div className="shrink-0 self-center text-stone-400">
            <ArrowRight size={16} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
