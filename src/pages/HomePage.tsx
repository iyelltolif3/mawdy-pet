import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MessageCircle,
  Phone,
  QrCode,
  IdCard,
  CheckCircle2,
  Stethoscope,
  Home,
  PhoneCall,
} from 'lucide-react';
import { useTenant } from '../features/tenant/useTenant';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { useActivePet } from '../hooks/useActivePet';
import { useInsuredAuth } from '../features/auth/InsuredAuthContext';
import ConsumerHeader from '../components/layout/ConsumerHeader';
import { PetAvatar } from '../components/ui/pet/PetAvatar';
import { listarAsistencias } from '../api/asistencias';
import { resolveServiceIcon } from '../utils/serviceIcons';
import type { Asistencia } from '../types/asistencia';
import type { ServicioCobertura } from '../api/tenant';

export default function HomePage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const navigate = useNavigate();
  const { user } = useInsuredAuth();
  const { polizas, activePoliza, activeMascota, activeRiesgoId, setActiveRiesgoId, loading } = useActivePet();

  const [ultimasAsistencias, setUltimasAsistencias] = useState<Asistencia[]>([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(true);

  // Cargar asistencias reales del backend para este tenant
  useEffect(() => {
    listarAsistencias({ pageSize: 3 })
      .then((res) => {
        setUltimasAsistencias(res.content || []);
      })
      .catch((err) => {
        console.error('Error al cargar asistencias para Home:', err);
      })
      .finally(() => {
        setCargandoAsistencias(false);
      });
  }, [tenant?.sponsorId]);

  const [customPet, setCustomPet] = useState<{
    microchip?: string;
    apodo?: string;
  }>({});

  useEffect(() => {
    if (activeMascota?.riesgoId) {
      try {
        const saved = localStorage.getItem(`pet_custom_${activeMascota.riesgoId}`);
        setCustomPet(saved ? JSON.parse(saved) : {});
      } catch {
        setCustomPet({});
      }
    }
  }, [activeMascota?.riesgoId]);

  const formatearFechaCorta = (dateStr?: string) => {
    if (!dateStr) return 'Reciente';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dia = d.getDate();
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${dia} ${meses[d.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-28">
        <ConsumerHeader title="Inicio" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex flex-col gap-6">
          <div className="h-20 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-64 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
            <div className="lg:col-span-5 h-80 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
            <div className="lg:col-span-3 h-64 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  const mascota = activeMascota;
  const titular = activePoliza?.asegurado;
  const tieneMultiplesMascotas = polizas.length > 1;

  // Extraer el nombre de pila amigable para el saludo
  const primerNombre = titular?.name ? titular.name.split(' ')[0] : user?.nombre || 'Asegurado';

  // Coberturas configuradas por el sponsor en Producto AMA
  const serviciosConfigurados = tenant?.productoAma?.servicios?.filter((s) => s.activo !== false) || [];

  return (
    <div className="min-h-screen bg-(--color-canvas) pb-32">
      {/* 1. HEADER: Logo Sponsor oficial + Notificaciones + Perfil */}
      <ConsumerHeader title="Inicio" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20">
        {/* Banner o Saludo Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-stone-200/70">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Hola, {primerNombre}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Protegido
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Portal asistencial y carnet veterinario oficial de <span className="font-semibold text-stone-800">{branding.brandName}</span>
            </p>
          </div>

          {/* Selector de Mascota Activa si tiene varias */}
          {tieneMultiplesMascotas && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-stone-500 font-medium hidden md:inline">Mascotas:</span>
              {polizas.map((p) => {
                const m = p.mascota;
                const isSelected = m.riesgoId === activeRiesgoId;
                return (
                  <button
                    key={m.riesgoId}
                    type="button"
                    onClick={() => setActiveRiesgoId(m.riesgoId)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-100'
                    }`}
                  >
                    <PetAvatar
                      src={m.fotoUrl}
                      name={m.nombre}
                      species={m.especie}
                      size="xs"
                      shape="circle"
                      border={false}
                    />
                    <span className="font-semibold">{m.nombre}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. DASHBOARD RESPONSIVO WEB: 3 COLUMNAS EN DESKTOP (4 - 5 - 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-6">
          {/* ============================================================ */}
          {/* COLUMNA 1 (Desktop: 4 cols): MASCOTA, CARNET & SOPORTE       */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 space-y-5">
            {mascota ? (
              /* Tarjeta de Mascota & Carnet Quick Access */
              <div className="bg-[#fbf9f5] border border-stone-200/90 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <PetAvatar
                    src={mascota.fotoUrl}
                    name={mascota.nombre}
                    species={mascota.especie}
                    size="lg"
                    shape="rounded"
                    className="shadow-xs ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-stone-900 truncate">
                        {mascota.nombre}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800 capitalize">
                        {mascota.especie === 'perro' ? 'Canino' : mascota.especie === 'gato' ? 'Felino' : mascota.especie}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 truncate mt-0.5 font-medium">
                      {mascota.raza || 'Raza Mixta'} · {mascota.edadEstimada ? `${mascota.edadEstimada} años` : 'Edad no reg.'}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-stone-500 bg-white/80 px-2 py-1 rounded-md border border-stone-200/70 w-fit">
                      <QrCode className="w-3 h-3 text-stone-700" />
                      <span>Chip: {customPet.microchip || mascota.microchip || 'No registrado'}</span>
                    </div>
                  </div>
                </div>

                {/* Botón Destacado: Carnet Digital de la Mascota */}
                <div className="pt-2 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      const target = mascota.riesgoId || activeRiesgoId;
                      navigate(target ? `/poliza/${encodeURIComponent(target)}` : '/poliza');
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300/80 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center shrink-0">
                        <IdCard className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-stone-900 group-hover:text-(--color-primary) transition-colors">
                          Ver Carnet Digital
                        </p>
                        <p className="text-[10px] text-stone-500">QR interactivo y compartir</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-5 text-center border border-dashed border-stone-200 bg-stone-50/70 text-xs text-stone-500">
                No se encontraron pólizas activas asociadas.
              </div>
            )}

            {/* Canal de Ayuda y Emergencias 24/7 */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-(--color-primary)" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Mesa de Ayuda 24/7
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                ¿Tienes alguna consulta sobre tu plan o requieres asistencia inmediata?
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/56984123341?text=${encodeURIComponent(
                    `Hola, necesito asistencia veterinaria para mi mascota protegida por ${branding.shortName}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100 transition-colors font-semibold text-xs text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:6005008000"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 text-stone-800 border border-stone-200/80 hover:bg-stone-200 transition-colors font-semibold text-xs text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-700" />
                  <span>600 500 8000</span>
                </a>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMNA 2 (Desktop: 5 cols): COBERTURAS Y PRESTACIONES AMA   */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                  ¿Qué necesitas?
                </h2>
                <p className="text-xs text-stone-500">
                  Prestaciones asistenciales cubiertas por tu plan {branding.policyPlanName || 'Mawdy'}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {serviciosConfigurados.length > 0 ? `${serviciosConfigurados.length} coberturas` : '3 servicios'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Si hay coberturas personalizadas por el sponsor, las renderizamos dinámicamente */}
              {serviciosConfigurados.length > 0 ? (
                serviciosConfigurados.map((srv: ServicioCobertura) => {
                  const meta = resolveServiceIcon(srv.icono);
                  const IconComponent = meta.icon;
                  return (
                    <button
                      key={srv.id || srv.codigoServicio}
                      type="button"
                      onClick={() => {
                        const target = mascota?.riesgoId || activeRiesgoId || polizas[0]?.mascota?.riesgoId;
                        const path = target
                          ? `/asistencias/nueva/${encodeURIComponent(target)}?servicio=${encodeURIComponent(srv.codigoServicio)}`
                          : `/asistencias/nueva?servicio=${encodeURIComponent(srv.codigoServicio)}`;
                        navigate(path, {
                          state: {
                            riesgoId: target,
                            servicio: srv.codigoServicio,
                            servicioObj: srv,
                          },
                        });
                      }}
                      className="group bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 transition-all text-left cursor-pointer flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl ${meta.colorBg} ${meta.colorText} border ${meta.borderColor} flex items-center justify-center shrink-0`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 group-hover:text-(--color-primary) transition-colors truncate">
                            {srv.nombre}
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                            {srv.descripcion || 'Cobertura asistencial disponible en red'}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400">
                            <span>{srv.limiteEventos || '3 eventos/año'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{srv.copagoOTope || 'Sin copago'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 shrink-0">
                        <span className="hidden sm:inline text-stone-400 group-hover:text-stone-700 transition-colors">
                          Solicitar
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })
              ) : (
                /* Fallback canónico con las 3 prestaciones principales */
                <>
                  {/* Servicio 1: Consulta veterinaria */}
                  <button
                    type="button"
                    onClick={() => {
                      const target = mascota?.riesgoId || activeRiesgoId || polizas[0]?.mascota?.riesgoId;
                      navigate(`/asistencias/nueva/${encodeURIComponent(target || '')}?tipo=consulta_urgente`, {
                        state: { riesgoId: target, tipo: 'CONSULTA_URGENTE' },
                      });
                    }}
                    className="group bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 transition-all text-left cursor-pointer flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/70 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 truncate">
                          Consulta veterinaria de urgencia
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">
                          Atención médica presencial de urgencia en red
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          100% Cobertura
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 shrink-0">
                      <span className="hidden sm:inline text-stone-500">Solicitar</span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Servicio 2: Médico Veterinario a Domicilio */}
                  <button
                    type="button"
                    onClick={() => {
                      const target = mascota?.riesgoId || activeRiesgoId || polizas[0]?.mascota?.riesgoId;
                      navigate(`/asistencias/nueva/${encodeURIComponent(target || '')}?tipo=veterinario_domicilio`, {
                        state: { riesgoId: target, tipo: 'VETERINARIO_DOMICILIO' },
                      });
                    }}
                    className="group bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 transition-all text-left cursor-pointer flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-emerald-800" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 truncate">
                          Médico Veterinario a Domicilio
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">
                          Atención profesional veterinaria en la comodidad del hogar
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          3 eventos al año
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 shrink-0">
                      <span className="hidden sm:inline text-stone-500">Coordinar</span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Servicio 3: Orientación 24/7 */}
                  <button
                    type="button"
                    onClick={() => {
                      const target = mascota?.riesgoId || activeRiesgoId || polizas[0]?.mascota?.riesgoId;
                      navigate(`/asistencias/nueva/${encodeURIComponent(target || '')}?tipo=orientacion_telefonica`, {
                        state: { riesgoId: target, tipo: 'ORIENTACION_TELEFONICA' },
                      });
                    }}
                    className="group bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-stone-300 rounded-2xl p-4 transition-all text-left cursor-pointer flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-900 border border-sky-200/70 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-5 h-5 text-sky-800" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 truncate">
                          Orientación Veterinaria 24/7
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">
                          Llamada y telemedicina directa con veterinario de turno
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          Ilimitada
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 shrink-0">
                      <span className="hidden sm:inline text-stone-500">Llamar</span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMNA 3 (Desktop: 3 cols): SEGUIMIENTO & ESTADO PÓLIZA     */}
          {/* ============================================================ */}
          <div className="lg:col-span-3 space-y-5">
            {/* Actividad / Última Asistencia */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Última Asistencia
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/asistencias')}
                  className="text-xs font-semibold text-(--color-primary) hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Historial</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {cargandoAsistencias ? (
                <div className="h-16 bg-stone-100/70 rounded-xl border border-stone-200/60 animate-pulse" />
              ) : ultimasAsistencias.length > 0 ? (
                (() => {
                  const ast = ultimasAsistencias[0];
                  const isEnCurso = ast.status === 'L' || ast.status === 'A' || ast.status === 'P';
                  const isResuelta = ast.status === 'R';
                  const statusLabel = isEnCurso ? 'En curso' : isResuelta ? 'Resuelta' : 'Cerrada';

                  const serviceTitle =
                    ast.businessServiceId === 'TRASLADO'
                      ? 'Traslado'
                      : ast.businessServiceId === 'ORIENTACION_TELEFONICA'
                      ? 'Orientación 24/7'
                      : 'Consulta veterinaria';

                  return (
                    <div
                      onClick={() => navigate('/asistencias')}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 hover:border-stone-300 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {serviceTitle}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isEnCurso
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : isResuelta
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isEnCurso ? 'bg-blue-500 animate-pulse' : isResuelta ? 'bg-emerald-500' : 'bg-stone-400'
                            }`}
                          />
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Fecha: {formatearFechaCorta(ast.occurrenceDate)} · Folio: #{ast.assistanceId || 'N/D'}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-xl border border-stone-200/70 bg-stone-50 p-3 text-xs text-stone-500 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sin incidentes pendientes</span>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de Cobertura Póliza */}
            <div className="bg-[#f7f5f0] border border-stone-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">Póliza Marco</span>
                <span className="font-mono text-[10px] text-stone-500">
                  {activePoliza?.numeroPoliza || 'POL-VIGENTE'}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Producto</span>
                <span className="font-semibold text-stone-800">
                  {tenant?.productoAma?.nombreProducto || branding.policyPlanName || 'Asistencia Pet'}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Estado</span>
                <span className="text-emerald-700 font-bold">Vigente</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Red Veterinaria</span>
                <span className="text-stone-800 font-semibold">Nacional Preferente</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
