import type { ReactNode } from 'react';
import { Badge, type BadgeStatus } from './Badge';
import { Stethoscope, Truck, PhoneCall, Calendar, ArrowRight, Home, Receipt } from 'lucide-react';

export type AssistanceStatus = 'in_progress' | 'active' | 'completed' | 'resolved' | 'cancelled' | 'pending';

export interface AssistanceCardProps {
  code: string;
  serviceType: string;
  category?: 'urgencia' | 'telemedicina' | 'traslado' | 'preventivo' | 'consulta' | 'domicilio' | 'reembolso';
  date: string;
  status: AssistanceStatus;
  statusLabel?: string;
  petName?: string;
  petAvatarEmoji?: string;
  description?: string;
  onViewDetails?: () => void;
  action?: ReactNode;
  className?: string;
}

/**
 * AssistanceCard — Tarjeta de expediente de asistencia médica o ticket de triage veterinario.
 */
export function AssistanceCard({
  code,
  serviceType,
  category = 'consulta',
  date,
  status,
  statusLabel,
  petName,
  petAvatarEmoji,
  description,
  onViewDetails,
  action,
  className = '',
}: AssistanceCardProps) {
  const isClickable = Boolean(onViewDetails);

  const statusMap: Record<AssistanceStatus, { badgeStatus: BadgeStatus; label: string }> = {
    in_progress: { badgeStatus: 'in-progress', label: statusLabel || 'En curso' },
    active: { badgeStatus: 'active', label: statusLabel || 'Activa' },
    completed: { badgeStatus: 'resolved', label: statusLabel || 'Completada' },
    resolved: { badgeStatus: 'resolved', label: statusLabel || 'Atendida' },
    cancelled: { badgeStatus: 'closed', label: statusLabel || 'Cancelada' },
    pending: { badgeStatus: 'warning', label: statusLabel || 'Por confirmar' },
  };

  const categoryIcons: Record<string, ReactNode> = {
    urgencia: <Stethoscope size={18} className="text-rose-700" />,
    telemedicina: <PhoneCall size={18} className="text-sky-700" />,
    domicilio: <Home size={18} className="text-emerald-700" />,
    reembolso: <Receipt size={18} className="text-indigo-700" />,
    traslado: <Truck size={18} className="text-stone-700" />,
    preventivo: <Calendar size={18} className="text-emerald-700" />,
    consulta: <Stethoscope size={18} className="text-stone-700" />,
  };

  const categoryBg: Record<string, string> = {
    urgencia: 'bg-rose-50 border-rose-100',
    telemedicina: 'bg-sky-50 border-sky-100',
    domicilio: 'bg-emerald-50 border-emerald-100',
    reembolso: 'bg-indigo-50 border-indigo-100',
    traslado: 'bg-stone-50 border-stone-200/80',
    preventivo: 'bg-emerald-50 border-emerald-100',
    consulta: 'bg-stone-50 border-stone-200/80',
  };

  const currentStatus = statusMap[status] || statusMap.in_progress;
  const currentIcon = categoryIcons[category] || categoryIcons.consulta;
  const currentBg = categoryBg[category] || categoryBg.consulta;

  return (
    <div
      onClick={onViewDetails}
      className={`bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
        isClickable ? 'cursor-pointer hover:border-stone-300 active:scale-[0.99]' : ''
      } ${className}`}
    >
      {/* Cabecera: Código AST + Badge de Estado */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100 mb-3">
        <span className="font-mono text-xs font-semibold text-stone-500 tracking-tight">
          {code}
        </span>
        <Badge status={currentStatus.badgeStatus} dot size="sm">
          {currentStatus.label}
        </Badge>
      </div>

      {/* Cuerpo principal: Icono + Servicio + Mascota */}
      <div className="flex items-start gap-3.5">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentBg}`}>
          {currentIcon}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-stone-900 truncate mb-0.5">
            {serviceType}
          </h4>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            {petName && (
              <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                {petAvatarEmoji && <span>{petAvatarEmoji}</span>}
                {petName}
                <span>·</span>
              </span>
            )}
            <span>{date}</span>
          </div>

          {description && (
            <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Acción opcional o flecha de detalle */}
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
