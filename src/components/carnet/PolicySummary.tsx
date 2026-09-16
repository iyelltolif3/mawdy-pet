import type { FC } from 'react';
import { Badge } from '../ui/Badge';
import { Stethoscope, Video, Home, CheckCircle2 } from 'lucide-react';
import type { Poliza } from '../../types/poliza';

export interface PolicySummaryProps {
  poliza: Poliza;
  sponsorName: string;
  className?: string;
}

/**
 * PolicySummary — Bloque "Mi seguro" y coberturas del Carnet Digital.
 * Muestra póliza, estado, sponsor, plan, vigencia, deducible $0 y coberturas
 * visuales utilizando estrictamente los datos oficiales existentes.
 */
export const PolicySummary: FC<PolicySummaryProps> = ({
  poliza,
  sponsorName,
  className = '',
}) => {
  const isActiva = poliza.estado === 'activa';

  return (
    <div className={`p-5 border-b border-stone-100 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900 font-headline">
          Mi seguro
        </h2>
        <Badge status={isActiva ? 'success' : 'warning'} size="sm">
          {isActiva ? 'Vigente' : 'Inactiva'}
        </Badge>
      </div>

      {/* Resumen Estructurado del Contrato */}
      <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/80 bg-stone-50/40 p-3.5 text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Póliza Nº</span>
          <span className="font-mono font-bold text-stone-900">{poliza.numeroPoliza}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Sponsor / Colectivo</span>
          <span className="font-semibold text-stone-900">{sponsorName}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Plan de asistencia</span>
          <span className="font-semibold text-stone-900">Protección Integral Pet</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Vigencia</span>
          <span className="font-semibold text-stone-900">Anual renovable</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Deducible en urgencias</span>
          <span className="font-semibold text-emerald-700">$0 (Sin deducible)</span>
        </div>
      </div>

      {/* Coberturas Disponibles de Forma Visual */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-stone-700 block">
          Servicios de Asistencia Incluidos
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 bg-white border border-stone-200/80 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Stethoscope size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-stone-900 block truncate">
                Urgencias 24/7
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                Red clínica en convenio
              </span>
            </div>
          </div>

          <div className="p-3 bg-white border border-stone-200/80 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Video size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-stone-900 block truncate">
                Telemedicina
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                Orientación telemática
              </span>
            </div>
          </div>

          <div className="p-3 bg-white border border-stone-200/80 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Home size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-stone-900 block truncate">
                A Domicilio
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                Veterinario en tu hogar
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-stone-50 rounded-lg text-[11px] text-stone-500 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>Atención operada por la red médica de Mawdy Asistencia.</span>
        </div>
      </div>
    </div>
  );
};
