import { useState, useMemo } from 'react';
import type { TenantPublicInfo } from '../../api/tenant';
import {
  testConnectionAdmin,
  cambiarEstadoSponsorAdmin,
} from '../../api/admin';
import type { ConnectionTestResult } from '../../api/admin';
import SponsorDeleteModal from './SponsorDeleteModal';
import {
  Plus,
  Search,
  ExternalLink,
  Zap,
  Settings,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Globe,
  Radio,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';

interface SponsorsListPageProps {
  sponsors: TenantPublicInfo[];
  loading: boolean;
  error: string | null;
  onSelectSponsorToEdit: (sponsorId: string) => void;
  onSelectCreate: () => void;
  onRefreshList: () => Promise<void>;
  onDeleteSuccess?: (sponsorId: string) => void;
}

export default function SponsorsListPage({
  sponsors,
  loading,
  error,
  onSelectSponsorToEdit,
  onSelectCreate,
  onRefreshList,
  onDeleteSuccess,
}: SponsorsListPageProps) {
  const [sponsorToDelete, setSponsorToDelete] = useState<TenantPublicInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModo, setFilterModo] = useState<'all' | 'mock' | 'real'>('all');
  const [filterEstado, setFilterEstado] = useState<'all' | 'activos' | 'suspendidos'>('all');
  const [showMetrics, setShowMetrics] = useState(true);

  // Estado de pruebas de conexión
  const [probandoConexion, setProbandoConexion] = useState<string | null>(null);
  const [conexionResult, setConexionResult] = useState<{
    sponsorId: string;
    result: ConnectionTestResult;
  } | null>(null);

  // Estado de cambio de suspensión
  const [modificandoEstado, setModificandoEstado] = useState<string | null>(null);
  const [feedbackAccion, setFeedbackAccion] = useState<string | null>(null);

  // Pestaña activa estética CRM
  const [activeTab, setActiveTab] = useState<'servicio' | 'comunicaciones' | 'documental' | 'seguimiento'>('servicio');

  // Métricas
  const totalSponsors = sponsors.length;
  const activos = sponsors.filter((s) => s.activo !== false).length;
  const suspendidos = totalSponsors - activos;
  const enModoReal = sponsors.filter((s) => s.modo === 'real').length;

  // Filtrado
  const filteredSponsors = useMemo(() => {
    return sponsors.filter((s) => {
      const matchesSearch =
        s.nombreVisible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subdominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sponsorId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModo = filterModo === 'all' || s.modo === filterModo;
      const matchesEstado =
        filterEstado === 'all' ||
        (filterEstado === 'activos' && s.activo !== false) ||
        (filterEstado === 'suspendidos' && s.activo === false);

      return matchesSearch && matchesModo && matchesEstado;
    });
  }, [sponsors, searchTerm, filterModo, filterEstado]);

  // Manejar prueba de conexión segura
  const handleProbarConexion = async (sponsorId: string) => {
    setProbandoConexion(sponsorId);
    setConexionResult(null);

    try {
      const result = await testConnectionAdmin(sponsorId);
      setConexionResult({ sponsorId, result });
    } catch (err: any) {
      setConexionResult({
        sponsorId,
        result: {
          ok: false,
          error: err.message || 'Error de red al intentar probar la conexión.',
          credenciales: {
            businessClientId: false,
            clientId: false,
            clientSecret: false,
          },
        },
      });
    } finally {
      setProbandoConexion(null);
    }
  };

  // Manejar toggle de suspensión / activación
  const handleToggleEstado = async (sponsor: TenantPublicInfo) => {
    const nuevoEstado = sponsor.activo === false;
    const accion = nuevoEstado ? 'reactivar' : 'suspender';

    const confirmar = window.confirm(
      `¿Confirmas que deseas ${accion} el acceso de asegurados para "${sponsor.nombreVisible}"?`
    );
    if (!confirmar) return;

    setModificandoEstado(sponsor.sponsorId);
    try {
      await cambiarEstadoSponsorAdmin(sponsor.sponsorId, nuevoEstado);
      await onRefreshList();
      setFeedbackAccion(`El sponsor "${sponsor.nombreVisible}" ha sido ${nuevoEstado ? 'reactivado' : 'suspendido'} exitosamente.`);
      setTimeout(() => setFeedbackAccion(null), 4000);
    } catch (err: any) {
      alert(`Error al cambiar estado: ${err.message || 'Error del servidor'}`);
    } finally {
      setModificandoEstado(null);
    }
  };

  const handleSponsorDeleted = async (deletedId: string) => {
    if (onDeleteSuccess) {
      onDeleteSuccess(deletedId);
    }
    await onRefreshList();
    setFeedbackAccion('El portal del sponsor ha sido eliminado de forma definitiva del sistema.');
    setTimeout(() => setFeedbackAccion(null), 4000);
  };

  const formatearFechaAuditoria = (iso?: string) => {
    if (!iso) return 'Sin registro';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* 1. Barra de Título y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8ebed]">
        <div>
          <h1 className="text-lg font-bold text-[#2d373d] tracking-tight flex items-center gap-2">
            <span>Gestión de Portales y Sponsors Corporativos</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#e8ebed] text-[#526570] font-normal">
              {totalSponsors} registrados
            </span>
          </h1>
          <p className="text-xs text-[#526570]">
            Aprovisionamiento de colectivos, ciclo de vida de convenios y línea de asistencias AMA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRefreshList()}
            disabled={loading}
            className="p-2 text-xs font-semibold text-[#526570] hover:text-[#2d373d] bg-white border border-[#e8ebed] hover:bg-[#f5f6f7] rounded-[4px] transition-colors cursor-pointer"
            title="Actualizar catálogo"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#d81e05]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onSelectCreate}
            className="py-2 px-4 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] active:bg-[#900303] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Sponsor</span>
          </button>
        </div>
      </div>

      {/* 2. Pestañas Corporativas Estilo CRM Minerva */}
      <div className="border-b border-[#e8ebed] flex items-center gap-6 text-xs select-none overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('servicio')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'servicio'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Directorio de Colectivos ({filteredSponsors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('comunicaciones')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'comunicaciones'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Conexión Directa AMA ({enModoReal} activos)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documental')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'documental'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Gestión de Marca & PWA MiA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seguimiento')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'seguimiento'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Seguimiento & Auditoría
        </button>
      </div>

      {/* Feedback de acciones */}
      {feedbackAccion && (
        <div className="p-3.5 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackAccion}</span>
        </div>
      )}

      {/* Error de carga */}
      {error && (
        <div className="p-3.5 rounded-[4px] bg-red-50 border border-red-200 text-[#d81e05] text-xs flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Panel de Métricas Operativas (Con toggle Ocultar/Mostrar) */}
      <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
          <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
            Resumen Operativo de Colectivos
          </span>
          <button
            type="button"
            onClick={() => setShowMetrics(!showMetrics)}
            className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showMetrics ? 'Ocultar' : 'Mostrar'}</span>
            {showMetrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showMetrics && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e8ebed]">
            <div className="px-2">
              <span className="text-[11px] font-semibold text-[#89969a] uppercase tracking-wider block">
                Total Portales
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#2d373d]">{totalSponsors}</span>
                <span className="text-[11px] text-[#526570]">sponsors</span>
              </div>
            </div>

            <div className="px-2 pt-3 sm:pt-0">
              <span className="text-[11px] font-semibold text-[#89969a] uppercase tracking-wider block">
                Operación Normal
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#2e7d32]">{activos}</span>
                <span className="text-[11px] text-[#526570]">habilitados</span>
              </div>
            </div>

            <div className="px-2 pt-3 sm:pt-0">
              <span className="text-[11px] font-semibold text-[#89969a] uppercase tracking-wider block">
                Portales Suspendidos
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${suspendidos > 0 ? 'text-[#c62828]' : 'text-[#89969a]'}`}>
                  {suspendidos}
                </span>
                <span className="text-[11px] text-[#526570]">restringidos</span>
              </div>
            </div>

            <div className="px-2 pt-3 sm:pt-0">
              <span className="text-[11px] font-semibold text-[#89969a] uppercase tracking-wider block">
                API Business Real
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0277bd]">{enModoReal}</span>
                <span className="text-[11px] text-[#526570]">Cognito OAuth2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Barra de Búsqueda y Filtros de Tablas */}
      <div className="bg-white p-3.5 rounded-[6px] border border-[#e8ebed] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#89969a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por sponsor, subdominio o ID técnico..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] focus:border-[#d81e05] focus:bg-white rounded-[4px] text-xs text-[#2d373d] placeholder:text-[#89969a] outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#89969a]" />
            <span className="text-[#526570] font-medium">Modo de Operación:</span>
            <select
              value={filterModo}
              onChange={(e) => setFilterModo(e.target.value as any)}
              className="px-2 py-1 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-[#2d373d] text-xs outline-none focus:border-[#d81e05] cursor-pointer"
            >
              <option value="all">Todos los convenios</option>
              <option value="mock">Catálogo Estándar</option>
              <option value="real">Conexión Directa AMA</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#526570] font-medium">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              className="px-2 py-1 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-[#2d373d] text-xs outline-none focus:border-[#d81e05] cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="activos">Solo Habilitados</option>
              <option value="suspendidos">Solo Suspendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner de resultado de prueba de conexión si existe */}
      {conexionResult && (
        <div
          className={`p-4 rounded-[6px] border text-xs shadow-xs animate-in fade-in ${
            conexionResult.result.ok
              ? 'bg-[#e8f5e9] border-[#a5d6a7] text-[#1b5e20]'
              : 'bg-[#ffebee] border-[#ffcdd2] text-[#b71c1c]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              {conexionResult.result.ok ? (
                <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#c62828] shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-[13px]">
                  Prueba de Conectividad API Business: {conexionResult.sponsorId}
                </h4>
                <p className="mt-0.5">
                  {conexionResult.result.message || conexionResult.result.error}
                </p>
                {conexionResult.result.latencyMs !== undefined && (
                  <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/60">
                    Latencia ida y vuelta: {conexionResult.result.latencyMs} ms
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConexionResult(null)}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 5. Tabla Corporativa de Colectivos (Estética CRM Mawdy Minerva) */}
      <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e8ebed] bg-[#f5f6f7] text-[#526570] uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Sponsor / Colectivo</th>
                <th className="py-3 px-4">Subdominio / Portal Web</th>
                <th className="py-3 px-4 text-center">Conectividad API</th>
                <th className="py-3 px-4 text-center">Estado Operativo</th>
                <th className="py-3 px-4">Última Modificación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ebed]">
              {loading && sponsors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#89969a]">
                    <RotateCw className="w-6 h-6 animate-spin text-[#d81e05] mx-auto mb-2" />
                    <span>Cargando catálogo corporativo de sponsors...</span>
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#89969a]">
                    <ShieldAlert className="w-8 h-8 text-[#89969a] mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-sm text-[#2d373d]">No se encontraron sponsors</p>
                    <p className="text-xs text-[#526570] mt-1">
                      {searchTerm ? 'Intenta modificar los criterios de búsqueda o filtros.' : 'No hay convenios registrados en el catálogo.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => {
                  const isCanonico = sponsor.sponsorId === 'mawdypet' || sponsor.sponsorId === 'admin';
                  const isActivo = sponsor.activo !== false;
                  const isTesting = probandoConexion === sponsor.sponsorId;
                  const isModifying = modificandoEstado === sponsor.sponsorId;

                  return (
                    <tr
                      key={sponsor.sponsorId}
                      className="hover:bg-[#fbfcfc] transition-colors group"
                    >
                      {/* Columna 1: Sponsor / Colectivo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[4px] border border-[#e8ebed] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                            {sponsor.tema.logoUrl ? (
                              <img
                                src={sponsor.tema.logoUrl}
                                alt={sponsor.nombreVisible}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div
                                className="w-full h-full rounded-[2px] flex items-center justify-center font-bold text-xs text-white"
                                style={{ backgroundColor: sponsor.tema.colores.primary || '#d81e05' }}
                              >
                                {sponsor.nombreVisible.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2d373d] text-[13px] truncate">
                                {sponsor.nombreVisible}
                              </span>
                              {isCanonico && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8ebed] text-[#526570] uppercase">
                                  Núcleo
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] text-[#89969a] font-mono">
                              ID: {sponsor.sponsorId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Columna 2: Subdominio / Portal Web */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#89969a] shrink-0" />
                            <a
                              href={`/?sponsor=${sponsor.subdominio}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs font-semibold text-[#006194] hover:text-[#004b73] hover:underline flex items-center gap-1"
                              title="Abrir portal web de asegurados en pestaña nueva"
                            >
                              <span>{sponsor.subdominio}.mawdypet.cl</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <span className="text-[11px] text-[#89969a] pl-5">
                            Param query: ?sponsor={sponsor.subdominio}
                          </span>
                        </div>
                      </td>

                      {/* Columna 3: Conectividad API */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          {sponsor.modo === 'real' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e1f5fe] text-[#0277bd] border border-[#b3e5fc]">
                              <Zap className="w-3 h-3 text-[#0277bd]" />
                              <span>Conexión Directa AMA</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f5f6f7] text-[#526570] border border-[#e8ebed]">
                              <Radio className="w-3 h-3 text-[#89969a]" />
                              <span>Catálogo Estándar</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleProbarConexion(sponsor.sponsorId)}
                            disabled={isTesting}
                            className="mt-1 text-[10px] font-semibold text-[#526570] hover:text-[#d81e05] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            {isTesting ? (
                              <>
                                <RotateCw className="w-2.5 h-2.5 animate-spin text-[#d81e05]" />
                                <span>Verificando canal...</span>
                              </>
                            ) : (
                              <span>Verificar canal</span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Columna 4: Estado Operativo */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleToggleEstado(sponsor)}
                            disabled={isModifying || isCanonico}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                              isActivo
                                ? 'bg-[#e8ebed]/60 text-[#2e7d32] border border-[#c8e6c9] hover:bg-[#c8e6c9]'
                                : 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] hover:bg-[#ffcdd2]'
                            } ${isCanonico ? 'opacity-70 cursor-not-allowed' : ''}`}
                            title={
                              isCanonico
                                ? 'El portal canónico no puede ser suspendido'
                                : isActivo
                                ? 'Click para suspender acceso a asegurados'
                                : 'Click para reactivar acceso a asegurados'
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActivo ? 'bg-[#2e7d32]' : 'bg-[#c62828]'
                              }`}
                            />
                            <span>{isActivo ? 'Operativo' : 'Suspendido'}</span>
                          </button>

                          <span className="text-[10px] text-[#89969a] mt-0.5">
                            {isCanonico ? 'Inmutable' : 'Click p/ alternar'}
                          </span>
                        </div>
                      </td>

                      {/* Columna 5: Auditoría */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-[11px]">
                          <div className="flex items-center gap-1 text-[#2d373d]">
                            <Clock className="w-3 h-3 text-[#89969a]" />
                            <span>{formatearFechaAuditoria(sponsor.lastModifiedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#89969a] mt-0.5">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[140px]">
                              {sponsor.lastModifiedBy || 'admin-mawdy'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Columna 6: Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Configurar */}
                          <button
                            type="button"
                            onClick={() => onSelectSponsorToEdit(sponsor.sponsorId)}
                            className="p-1.5 text-xs font-semibold text-[#526570] hover:text-[#006194] bg-[#f5f6f7] hover:bg-[#e1f5fe] border border-[#e8ebed] hover:border-[#b3e5fc] rounded-[4px] transition-colors cursor-pointer flex items-center gap-1"
                            title="Configurar coberturas AMA, identidad visual y PWA"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline text-[11px]">Configurar</span>
                          </button>

                          {/* Eliminar Portal de Sponsor */}
                          <button
                            type="button"
                            onClick={() => setSponsorToDelete(sponsor)}
                            disabled={isCanonico}
                            className={`p-1.5 text-xs font-semibold rounded-[4px] transition-colors border ${
                              isCanonico
                                ? 'text-[#89969a] bg-stone-100 border-[#e8ebed] cursor-not-allowed opacity-50'
                                : 'text-[#d81e05] hover:text-white bg-white hover:bg-[#d81e05] border-[#e8ebed] hover:border-[#d81e05] cursor-pointer'
                            }`}
                            title={
                              isCanonico
                                ? 'Este sponsor pertenece a la infraestructura base de Mawdy y no puede eliminarse'
                                : `Eliminar definitivamente el portal de ${sponsor.nombreVisible}`
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Corporativo de Eliminación Segura de Sponsor */}
      <SponsorDeleteModal
        isOpen={Boolean(sponsorToDelete)}
        sponsor={sponsorToDelete}
        onClose={() => setSponsorToDelete(null)}
        onDeleteSuccess={handleSponsorDeleted}
      />
    </div>
  );
}
