import { Stethoscope, Truck, PhoneCall, ChevronRight, Check, Home, Receipt, Syringe } from 'lucide-react';
import type { Asistencia } from '../../types/asistencia';
import type { PetInfoSummary } from './AsistenciaDetailModal';

export interface AsistenciaTrackingCardProps {
  asistencia: Asistencia;
  petInfo: PetInfoSummary;
  onClick: () => void;
}

export function AsistenciaTrackingCard({
  asistencia,
  petInfo,
  onClick,
}: AsistenciaTrackingCardProps) {
  const isEnCurso = asistencia.status === 'L' || asistencia.status === 'A' || asistencia.status === 'P';
  const isResuelta = asistencia.status === 'R';
  const isCancelada = asistencia.status === 'N';

  const getServiceData = (serviceId: string) => {
    switch (serviceId) {
      case 'VETERINARIO_DOMICILIO':
        return {
          label: 'Veterinario a Domicilio',
          icon: Home,
          colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200/80',
        };
      case 'TELEMEDICINA':
      case 'ORIENTACION_TELEFONICA':
        return {
          label: 'Telemedicina 24/7',
          icon: PhoneCall,
          colorClass: 'text-sky-800 bg-sky-50 border-sky-200/70',
        };
      case 'REEMBOLSO_GASTOS':
        return {
          label: 'Reembolso de Gastos',
          icon: Receipt,
          colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200/70',
        };
      case 'VACUNACION':
        return {
          label: 'Vacunación & Chip',
          icon: Syringe,
          colorClass: 'text-teal-800 bg-teal-50 border-teal-200/70',
        };
      case 'TRASLADO':
        return {
          label: 'Traslado Asistido',
          icon: Truck,
          colorClass: 'text-stone-800 bg-stone-100 border-stone-200/80',
        };
      case 'CONSULTA_URGENTE':
      default:
        return {
          label: 'Consulta veterinaria',
          icon: Stethoscope,
          colorClass: 'text-amber-900 bg-amber-50 border-amber-200/70',
        };
    }
  };

  const serviceData = getServiceData(asistencia.businessServiceId);
  const ServiceIcon = serviceData.icon;

  const formatearFecha = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no registrada';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dia = String(d.getDate()).padStart(2, '0');
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const anio = d.getFullYear();
      return `${dia} ${meses[d.getMonth()]} ${anio}`;
    } catch {
      return dateStr;
    }
  };

  // Status label & tokens semánticos globales (no dependen del tema del sponsor)
  const getStatusBadge = () => {
    if (isEnCurso) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          En curso
        </span>
      );
    }
    if (isResuelta) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <Check className="w-3.5 h-3.5 text-emerald-700" />
          Resuelta
        </span>
      );
    }
    if (isCancelada) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelada
        </span>
      );
    }
    // Default: Cerrada
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        Cerrada
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group bg-white hover:bg-stone-50/80 border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col gap-3 active:scale-[0.99]"
    >
      {/* 1. Servicio con icono */}
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${serviceData.colorClass}`}>
          <ServiceIcon className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-sm font-bold text-stone-900 leading-tight">
          {serviceData.label}
        </h2>
      </div>

      {/* 2. Mascota y Fecha */}
      <div className="flex flex-col pl-0.5">
        <p className="text-sm font-semibold text-stone-800 tracking-tight">
          {petInfo.nombre}
        </p>
        <p className="text-xs text-stone-500 mt-0.5 font-medium">
          {formatearFecha(asistencia.occurrenceDate)}
        </p>
      </div>

      {/* 3. Estado con indicador y Chevron de apertura */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
        <div>{getStatusBadge()}</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-stone-400 group-hover:text-stone-700 transition-colors">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
