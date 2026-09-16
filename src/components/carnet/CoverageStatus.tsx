import type { FC } from 'react';
import { Badge } from '../ui/Badge';

export interface CoverageStatusProps {
  status: 'activa' | 'inactiva' | 'vencida';
  policyNumber: string;
  sponsorName?: string;
  planName?: string;
  className?: string;
}

/**
 * CoverageStatus — Muestra inmediatamente el estado de cobertura del carnet digital:
 * ● Cobertura activa
 * y debajo el plan y número de póliza oficial.
 */
export const CoverageStatus: FC<CoverageStatusProps> = ({
  status,
  policyNumber,
  sponsorName,
  planName = 'Plan Colectivo de Asistencia y Salud',
  className = '',
}) => {
  const isActiva = status === 'activa';

  return (
    <div className={`px-5 py-3 border-b border-stone-100 flex flex-col gap-1.5 ${className}`}>
      {/* Badge de Cobertura Inmediato */}
      <div className="flex items-center justify-between gap-2">
        <Badge status={isActiva ? 'success' : 'warning'} dot size="sm">
          {isActiva ? 'Cobertura activa' : 'Póliza inactiva'}
        </Badge>

        <span className="font-mono text-[11px] font-semibold text-stone-500">
          Nº {policyNumber}
        </span>
      </div>

      {/* Detalle de Plan y Colectivo */}
      <p className="text-xs text-stone-600 font-medium">
        {planName}
        {sponsorName ? ` · Convenio ${sponsorName}` : ''}
      </p>
    </div>
  );
};
