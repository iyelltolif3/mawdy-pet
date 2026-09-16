import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Plus, AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useTenant } from '../features/tenant/useTenant';
import { useActivePet } from '../hooks/useActivePet';
import { listarAsistencias } from '../api/asistencias';
import ConsumerHeader from '../components/layout/ConsumerHeader';
import { AsistenciaTrackingCard } from '../components/asistencias/AsistenciaTrackingCard';
import { AsistenciaDetailModal, type PetInfoSummary } from '../components/asistencias/AsistenciaDetailModal';
import type { Asistencia } from '../types/asistencia';

export default function AsistenciasPage() {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const { activeRiesgoId, activeMascota, polizas } = useActivePet();

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<boolean>(false);
  const [filtroTab, setFiltroTab] = useState<'todas' | 'L' | 'R' | 'C'>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState<Asistencia | null>(null);

  const cargarDatos = () => {
    setCargando(true);
    setErrorCarga(false);
    listarAsistencias({ pageSize: 50 })
      .then((res) => {
        setAsistencias(res.content || []);
      })
      .catch((err) => {
        console.error('[AsistenciasPage] Error al cargar asistencias:', err);
        setErrorCarga(true);
      })
      .finally(() => {
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, [tenant?.sponsorId]);

  // Resolver mascota asociada a la asistencia
  const getPetInfoForAsistencia = (ast: Asistencia): PetInfoSummary => {
    const nombreAttr = ast.attributes?.find((a) => a.businessAttributeCd === 'MASCOTA_NOMBRE')?.value;
    const especieAttr = ast.attributes?.find((a) => a.businessAttributeCd === 'MASCOTA_ESPECIE')?.value;
    const razaAttr = ast.attributes?.find((a) => a.businessAttributeCd === 'MASCOTA_RAZA')?.value;

    if (nombreAttr) {
      return {
        nombre: nombreAttr,
        especie: especieAttr,
        raza: razaAttr,
      };
    }

    // Buscar coincidencia por póliza en el contexto de pólizas del usuario
    const pol = polizas.find((p) => p.numeroPoliza === ast.policy);
    if (pol?.mascota) {
      return {
        nombre: pol.mascota.nombre,
        especie: pol.mascota.especie,
        raza: pol.mascota.raza,
        fotoUrl: pol.mascota.fotoUrl,
      };
    }

    // Fallback a la mascota activa actual si coincide
    if (activeMascota) {
      return {
        nombre: activeMascota.nombre,
        especie: activeMascota.especie,
        raza: activeMascota.raza,
        fotoUrl: activeMascota.fotoUrl,
      };
    }

    return {
      nombre: 'Mascota asegurada',
    };
  };

  const filtradas = asistencias.filter((a) => {
    // Filtro por tab de estado
    if (filtroTab !== 'todas') {
      if (filtroTab === 'L' && a.status !== 'L' && a.status !== 'A' && a.status !== 'P') {
        return false;
      }
      if (filtroTab === 'R' && a.status !== 'R') {
        return false;
      }
      if (filtroTab === 'C' && a.status !== 'C' && a.status !== 'N') {
        return false;
      }
    }

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = String(a.assistanceId || '').toLowerCase().includes(q);
      const matchReq = String(a.requestId || '').toLowerCase().includes(q);
      const matchComment = (a.comment || '').toLowerCase().includes(q);
      const matchService = (a.businessServiceId || '').toLowerCase().includes(q);
      const matchPolicy = (a.policy || '').toLowerCase().includes(q);
      const pet = getPetInfoForAsistencia(a);
      const matchPet = pet.nombre.toLowerCase().includes(q);
      return matchId || matchReq || matchComment || matchService || matchPolicy || matchPet;
    }
    return true;
  });

  // Conteo por categorías para los badges compactos
  const conteoEnCurso = asistencias.filter(
    (a) => a.status === 'L' || a.status === 'A' || a.status === 'P'
  ).length;
  const conteoResueltas = asistencias.filter((a) => a.status === 'R').length;
  const conteoCerradas = asistencias.filter((a) => a.status === 'C' || a.status === 'N').length;

  return (
    <div className="min-h-screen bg-(--color-canvas) pb-32">
      <ConsumerHeader title="Mis asistencias" showBack backTo="/home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20 flex flex-col gap-6">
        {/* 1. Cabecera y Subheader */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Mis asistencias
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Consulta el estado de tus solicitudes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const targetId = activeMascota?.riesgoId || activeRiesgoId || polizas[0]?.mascota?.riesgoId;
              const path = targetId
                ? `/asistencias/nueva/${encodeURIComponent(targetId)}`
                : '/asistencias/nueva';
              navigate(path, { state: { riesgoId: targetId } });
            }}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva solicitud</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>

        {/* 2. Filtros Compactos (sin saturación de 8 pills) */}
        <div className="bg-[#f2efe9]/80 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-stone-200/70">
          <button
            type="button"
            onClick={() => setFiltroTab('todas')}
            className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
              filtroTab === 'todas'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Todas ({asistencias.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroTab('L')}
            className={`flex-1 min-w-[85px] py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filtroTab === 'L'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>En curso</span>
            {conteoEnCurso > 0 && (
              <span className="text-[10px] text-stone-500 font-normal">({conteoEnCurso})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFiltroTab('R')}
            className={`flex-1 min-w-[85px] py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filtroTab === 'R'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Resueltas</span>
            {conteoResueltas > 0 && (
              <span className="text-[10px] text-stone-500 font-normal">({conteoResueltas})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFiltroTab('C')}
            className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filtroTab === 'C'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span>Cerradas</span>
            {conteoCerradas > 0 && (
              <span className="text-[10px] text-stone-500 font-normal">({conteoCerradas})</span>
            )}
          </button>
        </div>

        {/* 3. Buscador Compacto Opcional */}
        {asistencias.length > 2 && (
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por mascota, caso o servicio..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-stone-200/90 rounded-xl shadow-2xs focus:ring-2 focus:ring-stone-800 focus:outline-none placeholder-stone-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-stone-400 hover:text-stone-600 flex items-center"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 4. Lista de Seguimiento / Estados */}
        {cargando ? (
          <div className="flex flex-col gap-3">
            <div className="h-28 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
            <div className="h-28 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
          </div>
        ) : errorCarga ? (
          /* Error State Humano */
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-rose-200 shadow-2xs flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-1">
              No pudimos cargar el seguimiento de tus asistencias
            </h3>
            <p className="text-xs text-stone-600 max-w-sm leading-relaxed">
              Tuvimos un inconveniente temporal para conectar con la central de asistencia. Tu cobertura continúa 100% activa.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
              <button
                type="button"
                onClick={cargarDatos}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reintentar
              </button>
              <a
                href="tel:6005008000"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Llamar a Urgencias (600 500 8000)
              </a>
            </div>
          </div>
        ) : filtradas.length > 0 ? (
          /* Lista de Tarjetas de Seguimiento Responsive */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtradas.map((ast, idx) => {
              const petInfo = getPetInfoForAsistencia(ast);
              const keyId = ast.assistanceId || ast.requestId || `ast-${idx}`;
              return (
                <AsistenciaTrackingCard
                  key={keyId}
                  asistencia={ast}
                  petInfo={petInfo}
                  onClick={() => setAsistenciaSeleccionada(ast)}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State Humano */
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/90 shadow-2xs flex flex-col items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-200/70">
              <HeartHandshake className="w-7 h-7 text-amber-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {searchTerm
                ? 'No encontramos asistencias con ese criterio'
                : 'Todavía no has solicitado una asistencia.'}
            </h3>
            <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
              {searchTerm
                ? 'Prueba buscando por otro término o limpia el buscador para ver todo el historial.'
                : 'Tu plan cuenta con consulta de urgencia, traslado asistido y orientación 24/7 sin deducible.'}
            </p>

            <button
              type="button"
              onClick={() => {
                if (searchTerm) {
                  setSearchTerm('');
                } else {
                  const target = activeMascota?.riesgoId || activeRiesgoId;
                  navigate(target ? `/poliza/${encodeURIComponent(target)}` : '/poliza');
                }
              }}
              className="mt-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{searchTerm ? 'Limpiar filtro' : 'Ver mis coberturas'}</span>
            </button>
          </div>
        )}

        {/* Modal de Detalle con Timeline */}
        <AsistenciaDetailModal
          asistencia={asistenciaSeleccionada}
          petInfo={asistenciaSeleccionada ? getPetInfoForAsistencia(asistenciaSeleccionada) : undefined}
          isOpen={Boolean(asistenciaSeleccionada)}
          onClose={() => setAsistenciaSeleccionada(null)}
        />
      </main>
    </div>
  );
}
