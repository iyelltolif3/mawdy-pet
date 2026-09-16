import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, X, Edit3, ShieldCheck } from 'lucide-react';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { useTenant } from '../features/tenant/useTenant';
import { useActivePet } from '../hooks/useActivePet';
import { obtenerMascotaPorRiesgoId } from '../api/cartera';
import { Button } from '../components/ui/Button';
import ConsumerHeader from '../components/layout/ConsumerHeader';

// Componentes modulares del Carnet Digital
import {
  CoverageStatus,
  PetDetails,
  PolicySummary,
  EmergencyContact,
  PetShareModal,
  CarnetDigitalCard,
} from '../components/carnet';
import type { Poliza } from '../types/poliza';

export default function PolizaPage() {
  const { riesgoId: paramRiesgoId } = useParams<{ riesgoId: string }>();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const navigate = useNavigate();
  const { polizas: userPolizas, activeRiesgoId, setActiveRiesgoId } = useActivePet();

  const [poliza, setPoliza] = useState<Poliza | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [customData, setCustomData] = useState<{
    avatar?: string;
    apodo?: string;
    veterinario?: string;
    telefonoEmergencia?: string;
    notasAlergias?: string;
  }>({});

  const targetRiesgoId = paramRiesgoId || activeRiesgoId;

  // Cargar datos personalizados de la mascota desde localStorage
  useEffect(() => {
    if (targetRiesgoId) {
      try {
        const saved = localStorage.getItem(`pet_custom_${targetRiesgoId}`);
        setCustomData(saved ? JSON.parse(saved) : {});
      } catch {
        setCustomData({});
      }
    }
  }, [targetRiesgoId]);

  // Cargar datos de la póliza y mascota desde la API de cartera
  useEffect(() => {
    if (!targetRiesgoId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    obtenerMascotaPorRiesgoId(targetRiesgoId)
      .then((data) => {
        setPoliza(data);
      })
      .catch((err) => {
        console.error('[PolizaPage] Error al obtener mascota:', err);
        setError(err instanceof Error ? err.message : 'No se pudo cargar el carnet de la mascota.');
      })
      .finally(() => {
        setCargando(false);
      });
  }, [targetRiesgoId]);

  const handleSaveCustom = (newCustom: typeof customData) => {
    setCustomData(newCustom);
    if (targetRiesgoId) {
      localStorage.setItem(`pet_custom_${targetRiesgoId}`, JSON.stringify(newCustom));
    }
    setShowEditModal(false);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-28 font-sans">
        <ConsumerHeader title="Carnet Digital" showBack backTo="/home" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-80 bg-stone-100 rounded-3xl animate-pulse" />
            <div className="lg:col-span-7 space-y-4">
              <div className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
              <div className="h-44 bg-stone-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !poliza) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-28 flex flex-col font-sans">
        <ConsumerHeader title="Carnet Digital" showBack backTo="/home" />
        <main className="flex-1 max-w-lg mx-auto px-4 pt-24 flex items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-7 border border-stone-200/90 shadow-sm w-full space-y-3">
            <AlertCircle size={40} className="text-stone-400 mx-auto" />
            <h2 className="text-base font-bold text-stone-900 font-headline">
              Carnet no encontrado
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {error || 'No fue posible localizar el registro de la mascota solicitada en esta póliza.'}
            </p>
            <Button variant="secondary" fullWidth onClick={() => navigate('/home')}>
              Volver al inicio
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { mascota, asegurado } = poliza;
  const tieneMultiplesMascotas = userPolizas.length > 1;

  return (
    <div className="min-h-screen bg-(--color-canvas) pb-28 font-sans">
      {/* 1. Header con Logo Consistente y Flecha de Retorno */}
      <ConsumerHeader
        title="Carnet Digital"
        subtitle={`${mascota.nombre} · ${branding.brandName} Pet`}
        showBack={true}
        backTo="/home"
      />

      {/* 2. Contenido Principal a Pantalla Completa Responsiva */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20">
        {/* Selector de Mascotas (si el titular tiene más de una) */}
        {tieneMultiplesMascotas && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-stone-500 pl-2 shrink-0">Mascotas:</span>
            {userPolizas.map((p) => {
              const m = p.mascota;
              const isSelected = m.riesgoId === mascota.riesgoId;
              return (
                <button
                  key={m.riesgoId}
                  type="button"
                  onClick={() => {
                    setActiveRiesgoId(m.riesgoId);
                    navigate(`/poliza/${encodeURIComponent(m.riesgoId)}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
                  }`}
                >
                  <span>{m.nombre}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Título de Sección y Acción de Edición */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-stone-200/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              Credencial de {mascota.nombre}
            </h1>
            <p className="text-xs text-stone-500">
              Póliza Colectiva Nº {poliza.numeroPoliza} • Convenio {branding.brandName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Editar Datos Clínicos</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/asistencias/nueva/${encodeURIComponent(mascota.riesgoId)}`)}
              className="px-3.5 py-1.5 rounded-xl bg-(--color-primary) hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Solicitar Asistencia</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* LAYOUT WEB RESPONSIVO: DUAL COLUMN (CARNET A LA IZQ, DOSSIER A LA DER) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Carnet Digital Interactivo 3D + Billeteras */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Credencial Digital Interactiva
              </span>
              <p className="text-[11px] text-stone-500 mb-3">
                Toca la credencial para ver el anverso (identidad) o el reverso (QR de validación clínica).
              </p>

              <CarnetDigitalCard
                mascota={mascota}
                asegurado={asegurado}
                numeroPoliza={poliza.numeroPoliza}
                nombreSponsor={branding.brandName}
                subdominioSponsor={tenant?.subdominio || 'mawdypet'}
                logoUrl={branding.logo}
                primaryColor={branding.colors.primary}
                secondaryColor={branding.colors.secondary}
                tema={tenant?.tema}
                customData={customData}
                onEditRequest={() => setShowEditModal(true)}
              />
            </div>
          </div>

          {/* Columna Derecha: Resumen de Cobertura, Ficha Médica y Contactos */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Estado de Cobertura y Póliza */}
            <CoverageStatus
              status={poliza.estado}
              policyNumber={poliza.numeroPoliza}
              sponsorName={branding.brandName}
            />

            {/* Dossier de Coberturas */}
            <PolicySummary
              poliza={poliza}
              sponsorName={branding.brandName}
            />

            {/* Ficha de la Mascota */}
            <PetDetails
              mascota={mascota}
              ageText={mascota.edadEstimada ? `${mascota.edadEstimada} años` : 'Edad no reg.'}
            />

            {/* Contactos de Emergencia */}
            <EmergencyContact
              asegurado={asegurado}
              veterinario={customData.veterinario}
              telefonoEmergencia={customData.telefonoEmergencia}
              notasAlergias={customData.notasAlergias}
            />
          </div>
        </div>
      </main>

      {/* Modal de Compartir Carnet */}
      {showShareModal && (
        <PetShareModal
          mascota={mascota}
          asegurado={asegurado}
          policyNumber={poliza.numeroPoliza}
          sponsorName={branding.brandName}
          nickname={customData.apodo}
          veterinario={customData.veterinario}
          telefonoEmergencia={customData.telefonoEmergencia}
          notasAlergias={customData.notasAlergias}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de Edición de Datos Complementarios */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Personalizar Ficha de {mascota.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Apodo o Nombre de Cariño
                </label>
                <input
                  type="text"
                  value={customData.apodo || ''}
                  onChange={(e) => setCustomData({ ...customData, apodo: e.target.value })}
                  placeholder="Ej. Gordito, Chiquita..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:border-(--color-primary) outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Veterinario de Cabecera
                </label>
                <input
                  type="text"
                  value={customData.veterinario || ''}
                  onChange={(e) => setCustomData({ ...customData, veterinario: e.target.value })}
                  placeholder="Ej. Dr. Andrés Gómez (Clínica PetCare)"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:border-(--color-primary) outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Teléfono de Emergencia Adicional
                </label>
                <input
                  type="tel"
                  value={customData.telefonoEmergencia || ''}
                  onChange={(e) => setCustomData({ ...customData, telefonoEmergencia: e.target.value })}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:border-(--color-primary) outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Alergias o Notas Clínicas Críticas
                </label>
                <textarea
                  rows={3}
                  value={customData.notasAlergias || ''}
                  onChange={(e) => setCustomData({ ...customData, notasAlergias: e.target.value })}
                  placeholder="Ej. Alérgico a la penicilina, sensible a cambios de alimento..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:border-(--color-primary) outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveCustom(customData)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                Guardar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
