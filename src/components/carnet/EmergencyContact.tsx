import type { FC } from 'react';
import { Phone, MessageCircle, AlertTriangle, User } from 'lucide-react';
import type { Asegurado } from '../../types/asegurado';

export interface EmergencyContactProps {
  asegurado: Asegurado;
  veterinario?: string;
  telefonoEmergencia?: string;
  notasAlergias?: string;
  className?: string;
}

/**
 * EmergencyContact — Sección de Contactos de Emergencia e Información Útil del Carnet Digital.
 */
export const EmergencyContact: FC<EmergencyContactProps> = ({
  asegurado,
  veterinario,
  telefonoEmergencia,
  notasAlergias,
  className = '',
}) => {
  return (
    <div className={`p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900 font-headline">
          Contactos y Urgencias
        </h2>
        <span className="text-[11px] text-stone-500 font-medium">
          Líneas 24/7
        </span>
      </div>

      {/* Alergias / Alerta Médica si existen */}
      {notasAlergias && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900 block">
              Cuidados médicos / Alergias
            </span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              {notasAlergias}
            </p>
          </div>
        </div>
      )}

      {/* Veterinario de Cabecera */}
      {veterinario && (
        <div className="p-3 bg-white border border-stone-200/80 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
              Veterinario de Cabecera
            </span>
            <span className="font-semibold text-stone-900 block truncate mt-0.5">
              {veterinario}
            </span>
          </div>
          {telefonoEmergencia && (
            <a
              href={`tel:${telefonoEmergencia}`}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shrink-0"
              title="Llamar al veterinario habitual"
            >
              <Phone size={14} />
            </a>
          )}
        </div>
      )}

      {/* Titular Asegurado */}
      <div className="p-3 bg-white border border-stone-200/80 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
            <User size={15} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-stone-900 block truncate">
              {asegurado.name} {asegurado.lastName}
            </span>
            <span className="text-[11px] text-stone-500 font-mono block truncate">
              {asegurado.idNum || asegurado.policy} {asegurado.phone ? `· ${asegurado.phone}` : ''}
            </span>
          </div>
        </div>

        {asegurado.phone && (
          <a
            href={`tel:${asegurado.phone}`}
            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shrink-0"
            title="Llamar al titular asegurado"
          >
            <Phone size={14} />
          </a>
        )}
      </div>

      {/* Central de Urgencias Mawdy Pet */}
      <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl space-y-2">
        <span className="text-[11px] font-semibold text-stone-700 block">
          Líneas de Atención Clínica 24/7
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a
            href="https://wa.me/56987654321?text=Hola,%20necesito%20asistencia%20veterinaria%20con%20mi%20carnet%20Mawdy%20Pet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 bg-white border border-stone-200/80 rounded-lg text-stone-800 hover:bg-stone-50 transition-colors"
          >
            <MessageCircle size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">WhatsApp Urgencias</span>
          </a>

          <a
            href="tel:+56223456789"
            className="flex items-center justify-center gap-2 p-2.5 bg-white border border-stone-200/80 rounded-lg text-stone-800 hover:bg-stone-50 transition-colors"
          >
            <Phone size={15} className="text-stone-600 shrink-0" />
            <span className="truncate">Central Telefónica</span>
          </a>
        </div>
      </div>
    </div>
  );
};
