import type { ReactNode } from 'react';
import { Badge, type BadgeStatus } from './Badge';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, BellRing } from 'lucide-react';

export type StatusCardType = 'success' | 'warning' | 'danger' | 'info' | 'emergency';

export interface StatusCardProps {
  status: StatusCardType;
  title: string;
  description?: ReactNode;
  badgeLabel?: string;
  timestamp?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * StatusCard — Tarjeta especializada para estados de cobertura, asistencias en curso o avisos clínicos.
 */
export function StatusCard({
  status,
  title,
  description,
  badgeLabel,
  timestamp,
  icon,
  action,
  className = '',
  children,
}: StatusCardProps) {
  const styles: Record<
    StatusCardType,
    {
      container: string;
      iconBg: string;
      defaultIcon: ReactNode;
      badgeStatus: BadgeStatus;
    }
  > = {
    success: {
      container: 'border-emerald-200 bg-emerald-50/30 text-stone-900',
      iconBg: 'bg-emerald-100 text-emerald-700',
      defaultIcon: <CheckCircle2 size={18} />,
      badgeStatus: 'success',
    },
    warning: {
      container: 'border-amber-200 bg-amber-50/30 text-stone-900',
      iconBg: 'bg-amber-100 text-amber-700',
      defaultIcon: <AlertTriangle size={18} />,
      badgeStatus: 'warning',
    },
    danger: {
      container: 'border-red-200 bg-red-50/30 text-stone-900',
      iconBg: 'bg-red-100 text-red-700',
      defaultIcon: <AlertOctagon size={18} />,
      badgeStatus: 'danger',
    },
    info: {
      container: 'border-sky-200 bg-sky-50/30 text-stone-900',
      iconBg: 'bg-sky-100 text-sky-700',
      defaultIcon: <Info size={18} />,
      badgeStatus: 'info',
    },
    emergency: {
      container: 'border-rose-300 bg-rose-50/50 text-stone-900 shadow-xs',
      iconBg: 'bg-rose-100 text-rose-700 animate-pulse',
      defaultIcon: <BellRing size={18} />,
      badgeStatus: 'emergency',
    },
  };

  const current = styles[status] || styles.info;

  return (
    <div className={`border rounded-2xl p-4 sm:p-5 transition-all ${current.container} ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${current.iconBg}`}>
          {icon || current.defaultIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-stone-900 truncate">{title}</h3>
            {badgeLabel && (
              <Badge status={current.badgeStatus} size="sm">
                {badgeLabel}
              </Badge>
            )}
          </div>

          {description && (
            <div className="text-xs text-stone-600 leading-relaxed">{description}</div>
          )}

          {timestamp && (
            <span className="inline-block mt-2 text-[11px] text-stone-400 font-mono">
              {timestamp}
            </span>
          )}

          {children && <div className="mt-3">{children}</div>}
        </div>

        {action && <div className="shrink-0 self-center">{action}</div>}
      </div>
    </div>
  );
}
