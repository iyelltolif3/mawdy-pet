import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, Info, SearchX, Lightbulb, AlertTriangle, PawPrint, Stethoscope } from 'lucide-react';
import { useTenant } from '../features/tenant/useTenant';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { buscarCartera } from '../api/cartera';
import type { Poliza } from '../types/poliza';
import { Badge, Button, Card, Select } from '../components/ui';
import { SkeletonCard, ApiErrorAlert } from '../components/ui';
import { MascotaSelectorModal } from '../features/cartera/MascotaSelectorModal';

type CriterioBusqueda = 'policy' | 'idNum' | 'phone';

export default function BuscarPage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const esModoAsistencia =
    searchParams.get('modo') === 'asistencia' ||
    searchParams.get('destino') === 'asistencia' ||
    (location.state as { destino?: string })?.destino === 'asistencia';

  const [criterio, setCriterio] = useState<CriterioBusqueda>('policy');
  const [termino, setTermino] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultados, setResultados] = useState<Poliza[]>([]);
  const [modalMascotasOpen, setModalMascotasOpen] = useState(false);
  const [filtroMicrochipLocal, setFiltroMicrochipLocal] = useState('');

  // Placeholders y labels según criterio
  const criterioLabels: Record<CriterioBusqueda, { label: string; placeholder: string; helper: string }> = {
    policy: {
      label: 'Número de póliza',
      placeholder: tenant?.sponsorId === 'consalud' ? 'Ej: CS-PET-2024-00147' : 'Ej: ZS-PET-2024-00051',
      helper: 'Búsqueda por número de contrato oficial',
    },
    idNum: {
      label: 'Documento / RUT del asegurado',
      placeholder: tenant?.sponsorId === 'consalud' ? 'Ej: 12.345.678-9' : 'Ej: 16.789.012-5',
      helper: 'Búsqueda por identificación del titular',
    },
    phone: {
      label: 'Teléfono del asegurado',
      placeholder: tenant?.sponsorId === 'consalud' ? 'Ej: +56912345678' : 'Ej: +56944445555',
      helper: 'Búsqueda por teléfono registrado',
    },
  };

  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = termino.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResultados([]);

    try {
      const polizas = await buscarCartera({
        [criterio]: query,
      });

      setResultados(polizas);

      if (polizas.length === 1) {
        // Encontrar una única mascota -> navegar según modo
        const mascota = polizas[0].mascota;
        if (esModoAsistencia) {
          navigate(`/asistencias/nueva/${encodeURIComponent(mascota.riesgoId)}`, {
            state: { riesgoId: mascota.riesgoId },
          });
        } else {
          navigate(`/poliza/${encodeURIComponent(mascota.riesgoId)}`, {
            state: { riesgoId: mascota.riesgoId },
          });
        }
      } else if (polizas.length > 1) {
        // Si hay más de una mascota (misma póliza o mismo asegurado) -> mostrar selector
        setModalMascotasOpen(true);
      }
    } catch (err) {
      console.error('Error al buscar en cartera:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error de conexión al consultar la cartera de asegurados.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Atajos rápidos para la demo según el sponsor activo
  const demoShortcuts = tenant?.sponsorId === 'consalud'
    ? [
        { label: 'Póliza con 2 mascotas', tipo: 'policy' as const, valor: 'CS-PET-2024-00147', desc: 'Luna y Rocky' },
        { label: 'Póliza única (Simón)', tipo: 'policy' as const, valor: 'CS-PET-2024-00293', desc: 'Gato British' },
        { label: 'Póliza vencida (Mía)', tipo: 'policy' as const, valor: 'CS-PET-2023-00088', desc: 'Estado vencida' },
        { label: 'Búsqueda por RUT', tipo: 'idNum' as const, valor: '15.678.901-2', desc: 'Andrés Muñoz' },
      ]
    : [
        { label: 'Póliza activa (Copito)', tipo: 'policy' as const, valor: 'ZS-PET-2024-00051', desc: 'Bichón Frisé' },
        { label: 'Póliza inactiva (Misi)', tipo: 'policy' as const, valor: 'ZS-PET-2023-00035', desc: 'Estado inactiva' },
        { label: 'Búsqueda por RUT', tipo: 'idNum' as const, valor: '13.456.789-0', desc: 'Patricio Valenzuela' },
        { label: 'Búsqueda por teléfono', tipo: 'phone' as const, valor: '+56944445555', desc: 'Javiera Contreras' },
      ];

  const handleShortcutClick = (tipo: CriterioBusqueda, valor: string) => {
    setCriterio(tipo);
    setTermino(valor);
    // Ejecutar búsqueda inmediatamente
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResultados([]);

    buscarCartera({ [tipo]: valor })
      .then((polizas) => {
        setResultados(polizas);
        if (polizas.length === 1) {
          const mascota = polizas[0].mascota;
          if (esModoAsistencia) {
            navigate(`/asistencias/nueva/${encodeURIComponent(mascota.riesgoId)}`, {
              state: { riesgoId: mascota.riesgoId },
            });
          } else {
            navigate(`/poliza/${encodeURIComponent(mascota.riesgoId)}`, {
              state: { riesgoId: mascota.riesgoId },
            });
          }
        } else if (polizas.length > 1) {
          setModalMascotasOpen(true);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al consultar cartera.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Filtrado local opcional por microchip sobre los resultados ya traídos de la API
  const resultadosFiltrados = resultados.filter((p) => {
    if (!filtroMicrochipLocal.trim()) return true;
    return p.mascota.microchip?.toLowerCase().includes(filtroMicrochipLocal.trim().toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Título y contexto operativo */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-(--color-primary)" />
          <h1 className="text-2xl font-bold text-(--color-foreground)">
            Búsqueda de Cartera
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Consulta de pólizas y mascotas aseguradas en la cartera de{' '}
          <span className="font-semibold text-(--color-primary)">{branding.brandName}</span>.
        </p>
      </div>

      {/* Formulario de búsqueda principal */}
      <Card className="mb-6 shadow-xs border-gray-200">
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Selector de Criterio */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="criterio-select" className="text-xs font-medium text-stone-600">
                Criterio de búsqueda
              </label>
              <Select
                id="criterio-select"
                value={criterio}
                onChange={(e) => {
                  setCriterio(e.target.value as CriterioBusqueda);
                  setTermino('');
                }}
                options={[
                  { value: 'policy', label: 'N° de Póliza' },
                  { value: 'idNum', label: 'Documento / RUT' },
                  { value: 'phone', label: 'Teléfono' },
                ]}
              />
            </div>

            {/* Input de término */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="termino-input" className="text-xs font-medium text-stone-600">
                {criterioLabels[criterio].label}
              </label>
              <div className="flex gap-2">
                <input
                  id="termino-input"
                  type="text"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  placeholder={criterioLabels[criterio].placeholder}
                  className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-md bg-(--color-surface) text-(--color-foreground) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent font-mono"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !termino.trim()}
                  className="px-5 shrink-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Buscando...
                    </span>
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-400" />
              {criterioLabels[criterio].helper}
            </span>
            <span className="text-gray-400">Sponsor activo: <strong className="text-gray-600">{tenant?.subdominio || branding.brandName}</strong></span>
          </div>
        </form>

        {/* Consultas sugeridas para agilizar la búsqueda */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Consultas de referencia ({branding.brandName}):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoShortcuts.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleShortcutClick(sc.tipo, sc.valor)}
                className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-gray-200"
              >
                <span>{sc.label}</span>
                <span className="font-mono text-gray-500 text-[11px]">({sc.valor})</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ESTADO 1: Cargando con Skeletons consistentes */}
      {loading && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-(--color-primary) animate-ping" />
            <span>Consultando cartera de asegurados ({criterioLabels[criterio].label.toLowerCase()}: &quot;{termino}&quot;)...</span>
          </div>
          <SkeletonCard />
          <SkeletonCard className="hidden sm:block opacity-60" />
        </div>
      )}

      {/* ESTADO 2: Error unificado con diagnóstico inteligente */}
      {!loading && error && (
        <div className="mb-6">
          <ApiErrorAlert
            error={error}
            onRetry={() => handleBuscar()}
            retryLabel="Reintentar búsqueda"
          />
        </div>
      )}

      {/* ESTADO 3: Sin resultados */}
      {!loading && !error && hasSearched && resultados.length === 0 && (
        <Card className="p-8 text-center border-gray-200 bg-white">
          <div className="mb-3 flex justify-center">
            <SearchX className="w-8 h-8 text-stone-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            No se encontraron resultados
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
            No existe ninguna póliza ni asegurado asociado al término{' '}
            <strong className="font-mono text-gray-700">&quot;{termino}&quot;</strong> en la cartera de{' '}
            <strong className="text-(--color-primary)">{branding.brandName}</strong>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 max-w-md mx-auto text-left flex items-start gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Cartera exclusiva:</strong> Cada sponsor gestiona su propia cartera de asegurados. Verifica que el asegurado corresponda a <em>{branding.brandName}</em> y no a otra aseguradora.
            </div>
          </div>
        </Card>
      )}

      {/* ESTADO 4: Resultados encontrados */}
      {!loading && resultados.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Pólizas encontradas ({resultados.length})
            </h2>
            {/* Filtro local cliente por microchip */}
            {resultados.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Filtrar por chip (local):</span>
                <input
                  type="text"
                  placeholder="N° Microchip..."
                  value={filtroMicrochipLocal}
                  onChange={(e) => setFiltroMicrochipLocal(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded font-mono bg-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {resultadosFiltrados.map((poliza) => {
              const m = poliza.mascota;
              const a = poliza.asegurado;
              const isVencida = poliza.estado === 'vencida';
              const isInactiva = poliza.estado === 'inactiva';
              const isProblematic = isVencida || isInactiva;

              const badgeEstado = {
                activa: { variant: 'success' as const, label: 'Póliza Activa' },
                inactiva: { variant: 'warning' as const, label: 'Póliza Inactiva' },
                vencida: { variant: 'danger' as const, label: 'Póliza Vencida' },
              }[poliza.estado];

              return (
                <Card
                  key={m.riesgoId}
                  className={`border transition-shadow hover:shadow-sm ${
                    isProblematic ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
                  }`}
                >
                  {/* Banner de alerta si la póliza está inactiva o vencida */}
                  {isProblematic && (
                    <div
                      className={`mb-3 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        isVencida
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Estado de cobertura:</strong> Esta póliza se encuentra{' '}
                        <span className="uppercase font-bold">{poliza.estado}</span>. El asegurado no cuenta actualmente con cobertura vigente para asistencias.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center justify-center shrink-0">
                        <PawPrint className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-(--color-foreground)">
                            {m.nombre}
                          </h3>
                          <Badge variant={badgeEstado.variant}>{badgeEstado.label}</Badge>
                          <span className="text-xs text-gray-400 font-mono">({m.riesgoId})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 flex-wrap">
                          <span className="capitalize font-medium text-stone-800">{m.especie}</span>
                          <span>{m.raza}</span>
                          <span className="text-stone-400">/</span>
                          <span className="capitalize">{m.sexo}</span>
                          <span className="text-stone-400">/</span>
                          <span>{m.pesoKg} kg</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span>
                            Titular: <strong className="text-gray-700">{a.name} {a.lastName}</strong>
                          </span>
                          <span>
                            RUT: <span className="font-mono text-gray-700">{a.idNum}</span>
                          </span>
                          <span>
                            Póliza: <span className="font-mono text-gray-700">{poliza.numeroPoliza}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="primary"
                        size="md"
                        className="flex items-center gap-1.5"
                        onClick={() =>
                          navigate(`/asistencias/nueva/${encodeURIComponent(m.riesgoId)}`, {
                            state: { riesgoId: m.riesgoId },
                          })
                        }
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Pedir Asistencia</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() =>
                          navigate(`/poliza/${encodeURIComponent(m.riesgoId)}`, {
                            state: { riesgoId: m.riesgoId },
                          })
                        }
                      >
                        Ver Póliza
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para selección de mascota en caso de múltiples resultados */}
      <MascotaSelectorModal
        open={modalMascotasOpen}
        onClose={() => setModalMascotasOpen(false)}
        polizas={resultados}
        destino={esModoAsistencia ? 'asistencia' : 'asistencia'}
      />
    </div>
  );
}
