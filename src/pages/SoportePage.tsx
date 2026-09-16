import { useState } from 'react';
import { Phone, MessageCircle, FileText, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import ConsumerHeader from '../components/layout/ConsumerHeader';

export default function SoportePage() {
  const branding = useTenantBranding();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    {
      pregunta: '¿Cómo opera el copago $0 en urgencias?',
      respuesta: `Al acudir a cualquier centro veterinario en convenio de la red de asistencia de ${branding.shortName} o al solicitar un móvil de urgencia, tu póliza cubre el 100% de la atención inicial sin desembolso previo.`,
    },
    {
      pregunta: '¿Qué hacer ante una sospecha de urgencia veterinaria?',
      respuesta:
        'Comunícate de inmediato a la Línea de Urgencia 24/7 (600 500 8000) o solicita una consulta presencial o traslado desde Inicio para recibir triaje prioritario con un veterinario de guardia.',
    },
    {
      pregunta: '¿Cómo solicito orientación veterinaria inmediata?',
      respuesta:
        'Puedes solicitar orientación telefónica desde la sección de inicio o comunicarte directamente por WhatsApp para resolver dudas sobre síntomas, dosificación o cuidados de tu mascota.',
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-canvas) pb-32">
      <ConsumerHeader title="Soporte y contacto" showBack backTo="/home" />

      <main className="max-w-lg mx-auto px-4 pt-16 flex flex-col gap-5">
        {/* Encabezado editorial */}
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Centro de soporte
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Canales directos de atención y preguntas frecuentes
          </p>
        </div>

        {/* Disponibilidad 24/7 */}
        <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center shrink-0 border border-stone-700">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Central de asistencia {branding.shortName}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                Coordinación médica disponible las 24 horas, los 365 días del año
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-semibold border border-emerald-800/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Activa
          </span>
        </div>

        {/* Canales Directos */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:6005008000"
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 active:scale-[0.99] flex flex-col items-center text-center gap-2.5 transition-all min-h-[115px] justify-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Urgencia 24/7</p>
              <p className="text-[11px] text-stone-500 font-mono mt-0.5">600 500 8000</p>
            </div>
          </a>

          <a
            href={`https://wa.me/56984123341?text=${encodeURIComponent(
              `Hola, necesito asistencia para mi mascota asegurada con ${branding.shortName}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 active:scale-[0.99] flex flex-col items-center text-center gap-2.5 transition-all min-h-[115px] justify-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">WhatsApp</p>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">Atención en línea</p>
            </div>
          </a>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h2 className="text-xs font-bold text-stone-900 tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Respuestas sobre coberturas y uso de asistencias
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div key={index} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-4 hover:bg-stone-50/60 flex items-center justify-between text-left text-xs font-semibold text-stone-800 transition-colors cursor-pointer gap-2"
                  >
                    <span>{faq.pregunta}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed bg-stone-50/30">
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Condiciones Generales */}
        <div className="p-4 bg-[#f5f2ec]/70 rounded-2xl border border-stone-200/70 text-xs text-stone-600 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-stone-200/80 text-stone-700 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-stone-900 truncate">Condiciones generales del seguro</p>
              <p className="text-[11px] text-stone-500 truncate">Póliza registrada bajo regulación oficial</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.open('/docs/condiciones_generales.pdf', '_blank')}
            className="text-stone-900 font-bold text-xs hover:underline cursor-pointer shrink-0"
          >
            Descargar
          </button>
        </div>
      </main>
    </div>
  );
}
