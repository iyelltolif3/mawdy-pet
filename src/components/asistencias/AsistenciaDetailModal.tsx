import { Stethoscope, Truck, PhoneCall, Check, Clock, X, MapPin, ShieldCheck, Phone, MessageCircle, Home, Receipt, Syringe } from 'lucide-react';
import type { Asistencia } from '../../types/asistencia';
import { PetAvatar } from '../ui/pet/PetAvatar';

export interface PetInfoSummary {
  nombre: string;
  especie?: string;
  raza?: string;
  fotoUrl?: string;
}

export interface AsistenciaDetailModalProps {
  asistencia: Asistencia | null;
  petInfo?: PetInfoSummary;
  isOpen: boolean;
  onClose: () => void;
}

export function AsistenciaDetailModal({
  asistencia,
  petInfo,
  isOpen,
  onClose,
}: AsistenciaDetailModalProps) {
  if (!isOpen || !asistencia) return null;

  const isEnCurso = asistencia.status === 'L' || asistencia.status === 'A' || asistencia.status === 'P';
  const isResuelta = asistencia.status === 'R';
  const isCancelada = asistencia.status === 'N';
  const isCerrada = asistencia.status === 'C';

  const caseId = asistencia.assistanceId || asistencia.requestId || 'S/ID';

  const getServiceData = (serviceId: string) => {
    switch (serviceId) {
      case 'VETERINARIO_DOMICILIO':
        return {
          label: 'Médico Veterinario a Domicilio',
          icon: Home,
          colorClass: 'bg-emerald-50 text-emerald-900 border-emerald-200/70',
        };
      case 'TELEMEDICINA':
      case 'ORIENTACION_TELEFONICA':
        return {
          label: 'Telemedicina y Orientación 24/7',
          icon: PhoneCall,
          colorClass: 'bg-sky-50 text-sky-800 border-sky-200/70',
        };
      case 'REEMBOLSO_GASTOS':
        return {
          label: 'Reembolso de Gastos Médicos',
          icon: Receipt,
          colorClass: 'bg-indigo-50 text-indigo-900 border-indigo-200/70',
        };
      case 'VACUNACION':
        return {
          label: 'Vacunación y Desparasitación',
          icon: Syringe,
          colorClass: 'bg-teal-50 text-teal-900 border-teal-200/70',
        };
      case 'TRASLADO':
        return {
          label: 'Traslado a clínica',
          icon: Truck,
          colorClass: 'bg-stone-100 text-stone-800 border-stone-200/80',
        };
      case 'CONSULTA_URGENTE':
      default:
        return {
          label: 'Consulta veterinaria de urgencia',
          icon: Stethoscope,
          colorClass: 'bg-amber-50 text-amber-900 border-amber-200/70',
        };
    }
  };

  const serviceData = getServiceData(asistencia.businessServiceId);
  const ServiceIcon = serviceData.icon;

  const formatearFechaCompleta = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no registrada';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
              Exp. #{caseId}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
              <ShieldCheck className="w-3.5 h-3.5" />
              Copago $0
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* Identificación del Servicio */}
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${serviceData.colorClass}`}>
              <ServiceIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="modal-title" className="text-base font-bold text-stone-900 leading-snug">
                {serviceData.label}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {formatearFechaCompleta(asistencia.occurrenceDate)}
              </p>
            </div>
          </div>

          {/* Timeline de Seguimiento (Sin inventar eventos) */}
          <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-stone-200/80 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-stone-900 tracking-tight">
              Línea de seguimiento
            </h3>

            <div className="space-y-4 pl-1">
              {/* Paso 1: Solicitud recibida */}
              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 text-xs font-bold z-10">
                  <Check className="w-3.5 h-3.5" />
                </div>
                {/* Línea vertical conectora */}
                <div className="absolute left-3 top-6 bottom-[-16px] w-0.5 bg-stone-200 -translate-x-1/2" />
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-bold text-stone-900">Solicitud recibida</p>
                  <p className="text-[11px] text-stone-500">
                    Registro confirmado en sistema de asistencia
                  </p>
                </div>
              </div>

              {/* Paso 2: Asistencia en gestión */}
              <div className="flex items-start gap-3 relative">
                {isEnCurso ? (
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 text-xs font-bold z-10 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                ) : isResuelta || isCerrada ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 text-xs font-bold z-10">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 border border-stone-300 text-xs z-10">
                    ✕
                  </div>
                )}
                {/* Línea vertical conectora */}
                <div className="absolute left-3 top-6 bottom-[-16px] w-0.5 bg-stone-200 -translate-x-1/2" />
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-bold text-stone-900">
                    {isCancelada ? 'Solicitud cancelada' : 'Asistencia en gestión'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {isEnCurso
                      ? 'Coordinando con equipo médico y central de despacho'
                      : isResuelta || isCerrada
                      ? 'Coordinación clínica y derivación completada'
                      : 'La solicitud no requirió activación operativa'}
                  </p>
                </div>
              </div>

              {/* Paso 3: Atención finalizada */}
              <div className="flex items-start gap-3 relative">
                {isResuelta || isCerrada ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 text-xs font-bold z-10">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shrink-0 border border-stone-300 text-xs z-10">
                    ○
                  </div>
                )}
                <div className="min-w-0 pt-0.5">
                  <p className={`text-xs font-bold ${isResuelta || isCerrada ? 'text-stone-900' : 'text-stone-400'}`}>
                    Atención finalizada
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {isResuelta
                      ? 'Servicio prestado conforme a cobertura de póliza'
                      : isCerrada
                      ? 'Expediente cerrado y archivado'
                      : 'Pendiente de cierre médico'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha de la Mascota Vinculada */}
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <PetAvatar
                src={petInfo?.fotoUrl}
                name={petInfo?.nombre || 'Mascota'}
                species={petInfo?.especie}
                size="sm"
                shape="rounded"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {petInfo?.nombre || 'Mascota asegurada'}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {petInfo?.raza || (petInfo?.especie ? (petInfo.especie === 'perro' ? 'Canino' : 'Felino') : 'Paciente en póliza')}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-stone-400 block font-mono">Póliza</span>
              <span className="text-xs font-bold text-stone-800 font-mono">{asistencia.policy}</span>
            </div>
          </div>

          {/* Motivo o Descripción reportada */}
          {asistencia.comment && (
            <div>
              <span className="text-xs font-bold text-stone-900 block mb-1">
                Motivo reportado
              </span>
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 text-xs text-stone-700 leading-relaxed italic">
                "{asistencia.comment}"
              </div>
            </div>
          )}

          {/* Ubicación reportada */}
          {asistencia.origin?.place && (
            <div className="flex items-start gap-2.5 text-xs text-stone-700">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-stone-900 block">Lugar de origen:</span>
                <span className="text-stone-600">{asistencia.origin.place}</span>
              </div>
            </div>
          )}

          {/* Canales de Contacto Directo si está en curso */}
          {isEnCurso && (
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <p className="text-[11px] text-stone-500 text-center">
                ¿Necesitas agregar información médica urgente a este caso?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:6005008000"
                  className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar central</span>
                </a>
                <a
                  href={`https://wa.me/56984123341?text=${encodeURIComponent(
                    `Hola, consulto por el estado de mi caso de asistencia Exp #${caseId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
