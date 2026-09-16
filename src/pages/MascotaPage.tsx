import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../features/tenant/useTenant';
import { obtenerMascotaPorRiesgoId } from '../api/cartera';
import type { Poliza } from '../types/poliza';
import { Badge, Button } from '../components/ui';
import { Skeleton, SkeletonProfile, ApiErrorAlert } from '../components/ui';

export default function MascotaPage() {
  const { riesgoId } = useParams<{ riesgoId: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [poliza, setPoliza] = useState<Poliza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!riesgoId) return;

    setLoading(true);
    setError(null);

    obtenerMascotaPorRiesgoId(riesgoId)
      .then((data) => {
        setPoliza(data);
      })
      .catch((err) => {
        console.error('Error al cargar mascota:', err);
        setError(
          err instanceof Error
            ? err.message
            : `No se pudo encontrar la mascota con código de riesgo "${riesgoId}".`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [riesgoId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-(--color-primary) animate-ping" />
            <span>Consultando ficha clínica de {tenant?.nombreVisible}...</span>
          </div>
        </div>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !poliza) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ApiErrorAlert
          error={error || `No se encontró la mascota con código de riesgo "${riesgoId}" en la cartera de ${tenant?.nombreVisible}.`}
          title="Ficha de mascota no encontrada"
          onRetry={() => navigate('/buscar')}
          retryLabel="Volver a la búsqueda"
        />
      </div>
    );
  }

  const { mascota, asegurado } = poliza;
  const isVencida = poliza.estado === 'vencida';
  const isInactiva = poliza.estado === 'inactiva';
  const hasCoverageAlert = isVencida || isInactiva;

  const estadoBadge = {
    activa: { variant: 'success' as const, label: 'Póliza Activa' },
    inactiva: { variant: 'warning' as const, label: 'Póliza Inactiva' },
    vencida: { variant: 'danger' as const, label: 'Póliza Vencida' },
  }[poliza.estado];

  // Cálculo de edad si existe fechaNacimiento
  const calcularEdad = (fechaStr?: string) => {
    if (!fechaStr) return null;
    const nac = new Date(fechaStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad > 0 ? `${edad} años` : 'Menos de 1 año';
  };

  const edadTexto = mascota.fechaNacimiento
    ? `${mascota.fechaNacimiento} (${calcularEdad(mascota.fechaNacimiento)})`
    : mascota.edadEstimada !== undefined
    ? `${mascota.edadEstimada} años aprox.`
    : 'No especificada';

  const handleCrearAsistencia = () => {
    navigate(`/asistencias/nueva/${encodeURIComponent(mascota.riesgoId)}`, {
      state: { riesgoId: mascota.riesgoId, poliza },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navegación y migas de pan */}
      <div className="flex items-center justify-between mb-5">
        <Link
          to="/buscar"
          className="text-xs font-medium text-(--color-primary) hover:underline flex items-center gap-1.5"
        >
          ← Volver a la búsqueda de cartera
        </Link>
        <span className="text-xs text-gray-400">
          Sponsor: <strong className="text-gray-600">{tenant?.nombreVisible}</strong> ({tenant?.countryId})
        </span>
      </div>

      {/* Alerta si la póliza está inactiva o vencida */}
      {hasCoverageAlert && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            isVencida
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-sm font-bold">
              Atención Operador: Póliza {poliza.estado.toUpperCase()}
            </h3>
            <p className="text-xs mt-1">
              Esta póliza no se encuentra activa. Si continúas con la creación de una asistencia, el caso podría requerir autorización comercial extraordinaria o cobro particular.
            </p>
          </div>
        </div>
      )}

      {/* TARJETA PRINCIPAL DE PERFIL */}
      <div className="bg-(--color-surface) border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {/* SECCIÓN 1: Encabezado de perfil */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Foto o Avatar con Inicial */}
              {mascota.fotoUrl ? (
                <img
                  src={mascota.fotoUrl}
                  alt={mascota.nombre}
                  className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-sm ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex flex-col items-center justify-center font-bold text-2xl border-3 border-white shadow-sm ring-2 ring-(--color-primary)/25 shrink-0">
                  <span>{mascota.nombre.charAt(0).toUpperCase()}</span>
                  <span className="text-sm leading-none mt-0.5">
                    {mascota.especie === 'gato' ? '🐱' : mascota.especie === 'perro' ? '🐶' : '🐾'}
                  </span>
                </div>

              )}

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-(--color-foreground)">
                    {mascota.nombre}
                  </h1>
                  <Badge variant={estadoBadge.variant} className="text-xs px-2.5 py-0.5 font-semibold">
                    {estadoBadge.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-stone-600 font-medium">
                  <span className="capitalize font-semibold text-stone-800">{mascota.especie}</span>
                  <span className="text-stone-400">/</span>
                  <span>{mascota.raza}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                  <span>ID Riesgo: <strong className="font-mono text-stone-700">{mascota.riesgoId}</strong></span>
                  {mascota.microchip && (
                    <span>Microchip: <strong className="font-mono text-stone-700">{mascota.microchip}</strong></span>
                  )}
                </p>
              </div>
            </div>

            {/* Botón superior directo para operadores con prisa */}
            <div className="shrink-0 self-end sm:self-center">
              <Button
                variant="primary"
                size="md"
                onClick={handleCrearAsistencia}
                className="shadow-sm font-semibold flex items-center gap-2"
              >
                <span>➕</span>
                <span>Crear Asistencia</span>
              </Button>
            </div>
          </div>
        </div>

        {/* CUERPO DE LA FICHA: Grid de Secciones */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECCIÓN 2: Datos de la Mascota (con marca de datos de prueba) */}
          <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-4 relative">
            {/* Marca visual de datos de prueba */}
            <div className="mb-3.5 pb-2.5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🐾</span>
                <h2 className="text-sm font-bold text-gray-800">Ficha de la Mascota</h2>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <span>🧪</span>
                <span>Datos de prueba (attributes[])</span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="font-semibold text-gray-800 text-sm">{mascota.nombre}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Especie</dt>
                <dd className="font-medium text-gray-800 capitalize">{mascota.especie}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Raza</dt>
                <dd className="font-medium text-gray-800">{mascota.raza}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Sexo</dt>
                <dd className="font-medium text-gray-800 capitalize">{mascota.sexo}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Peso</dt>
                <dd className="font-semibold text-gray-800">{mascota.pesoKg} kg</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fecha Nac. / Edad</dt>
                <dd className="font-medium text-gray-800">{edadTexto}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Color y Señas Particulares</dt>
                <dd className="font-medium text-gray-800 mt-0.5">{mascota.colorSenasParticulares}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Microchip</dt>
                <dd className="font-mono text-gray-800 mt-0.5">
                  {mascota.microchip || <span className="text-gray-400 italic">No registrado</span>}
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-[10px] text-gray-400 italic border-t border-gray-100 pt-2">
              * En API Business real, estos atributos viajan en el arreglo genérico `attributes[]` del asegurado o de la asistencia.
            </p>
          </div>

          {/* COLUMNA DERECHA: Póliza y Asegurado */}
          <div className="space-y-6">
            {/* SECCIÓN 3: Datos de la Póliza */}
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-4">
              <div className="mb-3 pb-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h2 className="text-sm font-bold text-gray-800">Datos de la Póliza</h2>
                </div>
                {/* Badge de sponsor activo */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-(--color-primary)/10 text-(--color-primary) rounded text-xs font-semibold">
                  <span>🏢</span>
                  <span>{tenant?.nombreVisible}</span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-gray-500">N° de Póliza</dt>
                  <dd className="font-mono font-bold text-sm text-(--color-foreground)">{poliza.numeroPoliza}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Estado</dt>
                  <dd className="mt-0.5">
                    <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Contrato de Negocio (businessContractId)</dt>
                  <dd className="font-mono text-gray-800 mt-0.5">{poliza.businessContractId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">País</dt>
                  <dd className="font-medium text-gray-800">{asegurado.countryCd || tenant?.countryId || 'CL'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">ID Asegurado</dt>
                  <dd className="font-mono text-gray-800">{asegurado.insuredId}</dd>
                </div>
              </dl>
            </div>

            {/* SECCIÓN 4: Datos de Contacto del Asegurado */}
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-4">
              <div className="mb-3 pb-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <h2 className="text-sm font-bold text-gray-800">Titular Asegurado</h2>
                </div>
                <span className="text-xs font-mono text-gray-500">{asegurado.idNum}</span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Nombre completo</dt>
                  <dd className="font-semibold text-sm text-gray-900">
                    {asegurado.name} {asegurado.lastName}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-500">Teléfono</dt>
                  <dd className="font-medium text-(--color-primary) mt-0.5">
                    {asegurado.phone ? (
                      <a href={`tel:${asegurado.phone}`} className="hover:underline flex items-center gap-1">
                        <span>📞</span>
                        <span className="font-mono">{asegurado.phone}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No disponible</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-500">Correo electrónico</dt>
                  <dd className="font-medium text-(--color-primary) mt-0.5 truncate">
                    {asegurado.email ? (
                      <a href={`mailto:${asegurado.email}`} className="hover:underline flex items-center gap-1">
                        <span>✉️</span>
                        <span>{asegurado.email}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No disponible</span>
                    )}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Dirección</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">
                    {asegurado.address}
                    {asegurado.locality && `, ${asegurado.locality}`}
                    {asegurado.province && ` (${asegurado.province})`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: Barra de acción inferior */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            <span>Operador: Puedes crear una asistencia inmediata para esta mascota o consultar el historial.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/buscar')}
            >
              Nueva búsqueda
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleCrearAsistencia}
              className="font-semibold flex items-center gap-2"
            >
              <span>🐾</span>
              <span>Crear Asistencia</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
