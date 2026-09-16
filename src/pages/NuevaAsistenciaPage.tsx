import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  PhoneCall,
  HelpCircle,
  Check,
  MapPin,
  Phone,
  Send,
  Search,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Syringe,
  Home,
  ShieldCheck,
  HeartHandshake,
  Navigation,
  Loader2,
  FileText,
  Globe,
} from 'lucide-react';
import { useTenant } from '../features/tenant/useTenant';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { useActivePet } from '../hooks/useActivePet';
import { obtenerMascotaPorRiesgoId } from '../api/cartera';
import { crearAsistencia } from '../api/asistencias';
import ConsumerHeader from '../components/layout/ConsumerHeader';
import { PetBrandSeal } from '../components/ui/PetBrandSeal';
import { PetAvatar } from '../components/ui/pet/PetAvatar';
import type { Poliza } from '../types/poliza';
import type { TipoServicio, RequestAssistancePayload, ResponseAssistancePayload } from '../types/asistencia';

const SERVICIOS_OPCIONES: Array<{
  id: TipoServicio;
  titulo: string;
  subtitulo: string;
  explicacion: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}> = [
  {
    id: 'CONSULTA_URGENTE',
    titulo: 'Consulta veterinaria presencial',
    subtitulo: 'Red de clínicas asociadas sin copago',
    explicacion: 'Atención presencial inmediata en clínicas de la red preferente para emergencias o triage clínico.',
    icon: Stethoscope,
    iconBg: 'bg-rose-50 text-rose-700 border border-rose-100',
  },
  {
    id: 'TELEMEDICINA',
    titulo: 'Telemedicina veterinaria 24/7',
    subtitulo: 'Videoconsulta y orientación continua',
    explicacion: 'Videollamada o consulta telefónica inmediata con un médico veterinario para pautas, dosis y contención.',
    icon: PhoneCall,
    iconBg: 'bg-sky-50 text-sky-800 border border-sky-100',
  },
  {
    id: 'VETERINARIO_DOMICILIO',
    titulo: 'Médico veterinario a domicilio',
    subtitulo: 'Atención clínica en tu hogar',
    explicacion: 'Visita médica presencial en tu domicilio para chequeos, toma de muestras o urgencias sin mover a tu mascota.',
    icon: Home,
    iconBg: 'bg-amber-50 text-amber-800 border border-amber-100',
  },
  {
    id: 'REEMBOLSO_GASTOS',
    titulo: 'Reembolso de gastos y farmacia',
    subtitulo: 'Bonificación según arancel de póliza',
    explicacion: 'Reembolso directo de consultas externas de urgencia, recetas de medicamentos y exámenes clínicos.',
    icon: FileText,
    iconBg: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
  },
  {
    id: 'VACUNACION',
    titulo: 'Vacunación y desparasitación anual',
    subtitulo: 'Plan preventivo en red preferente',
    explicacion: 'Aplicación anual de vacuna antirrábica u óctuple/séxtuple y desparasitación interna con arancel preferencial.',
    icon: Syringe,
    iconBg: 'bg-indigo-50 text-indigo-800 border border-indigo-100',
  },
  {
    id: 'OTRO',
    titulo: 'Otro requerimiento',
    subtitulo: 'Asistencia especial de póliza',
    explicacion: 'Consultas de cobertura, vacunas de urgencia o requerimientos específicos de tu seguro.',
    icon: HelpCircle,
    iconBg: 'bg-stone-100 text-stone-700 border border-stone-200',
  },
];

export default function NuevaAsistenciaPage() {
  const { riesgoId: paramRiesgoId } = useParams<{ riesgoId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const { polizas, loading: loadingCartera, setActiveRiesgoId } = useActivePet();

  // Fuente de verdad única: URL param -> navigation state -> query param
  const rawRiesgoId =
    paramRiesgoId ||
    (location.state as { riesgoId?: string })?.riesgoId ||
    searchParams.get('riesgoId');
  const targetRiesgoId = rawRiesgoId ? decodeURIComponent(rawRiesgoId).trim() : null;

  const normalizarTipo = (val?: string | null): TipoServicio => {
    if (!val) return 'CONSULTA_URGENTE';
    const norm = val.toUpperCase().trim();
    if (norm === 'CONSULTA_URGENTE' || norm === 'CONSULTA') return 'CONSULTA_URGENTE';
    if (norm === 'TELEMEDICINA' || norm === 'ORIENTACION_TELEFONICA' || norm === 'ORIENTACION') return 'TELEMEDICINA';
    if (norm === 'VETERINARIO_DOMICILIO' || norm === 'DOMICILIO') return 'VETERINARIO_DOMICILIO';
    if (norm === 'REEMBOLSO_GASTOS' || norm === 'REEMBOLSO' || norm === 'FARMACIA') return 'REEMBOLSO_GASTOS';
    if (norm === 'VACUNACION' || norm === 'VACUNAS') return 'VACUNACION';
    if (norm === 'OTRO') return 'OTRO';
    return 'CONSULTA_URGENTE';
  };

  const initialTipo = normalizarTipo(
    searchParams.get('tipo') || (location.state as { tipo?: string })?.tipo
  );

  // Servicios dinámicos configurados en el sponsor o catálogo estándar
  const serviciosDisponibles = useMemo(() => {
    const custom = tenant?.productoAma?.servicios?.filter((s) => s.activo !== false);
    if (custom && custom.length > 0) {
      return custom.map((s) => {
        let iconComp = Stethoscope;
        let iconBg = 'bg-rose-50 text-rose-700 border border-rose-100';
        if (s.icono === 'PhoneCall' || s.icono === 'Video') {
          iconComp = PhoneCall;
          iconBg = 'bg-sky-50 text-sky-800 border border-sky-100';
        } else if (s.icono === 'Home') {
          iconComp = Home;
          iconBg = 'bg-amber-50 text-amber-800 border border-amber-100';
        } else if (s.icono === 'FileText') {
          iconComp = FileText;
          iconBg = 'bg-emerald-50 text-emerald-800 border border-emerald-100';
        } else if (s.icono === 'Syringe') {
          iconComp = Syringe;
          iconBg = 'bg-indigo-50 text-indigo-800 border border-indigo-100';
        } else if (s.icono === 'Shield') {
          iconComp = ShieldCheck;
          iconBg = 'bg-indigo-50 text-indigo-800 border border-indigo-100';
        } else if (s.icono === 'HeartHandshake') {
          iconComp = HeartHandshake;
          iconBg = 'bg-teal-50 text-teal-800 border border-teal-100';
        }

        return {
          id: s.codigoServicio || s.id,
          codigoServicio: s.codigoServicio,
          codigoGarantia: s.codigoGarantia,
          titulo: s.nombre,
          subtitulo: s.limiteEventos ? `${s.limiteEventos} • ${s.copagoOTope || 'Sin copago'}` : (s.copagoOTope || '100% Cubierto'),
          explicacion: s.descripcion,
          icon: iconComp,
          iconBg,
        };
      });
    }
    return SERVICIOS_OPCIONES;
  }, [tenant?.productoAma?.servicios]);

  const [poliza, setPoliza] = useState<Poliza | null>(null);
  const [cargandoMascota, setCargandoMascota] = useState<boolean>(Boolean(targetRiesgoId));
  const [errorMascota, setErrorMascota] = useState<string | null>(null);

  // Referencia para evitar re-ejecución infinita del fetch de mascota
  const lastFetchedRiesgoIdRef = useRef<string | null>(null);

  // Form State: inicializado con el primer servicio disponible o el query param
  const [tipoServicio, setTipoServicio] = useState<string>(() => {
    return initialTipo || (serviciosDisponibles[0]?.id as string) || 'CONSULTA_URGENTE';
  });
  const [comentario, setComentario] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [contactoNombre, setContactoNombre] = useState<string>('');
  const [contactoTelefono, setContactoTelefono] = useState<string>('');

  // OpenStreetMap (OSM) state
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lon: number } | null>({
    lat: -33.4250,
    lon: -70.6120,
  });
  const [osmSuggestions, setOsmSuggestions] = useState<Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }>>([]);
  const [buscandoOsm, setBuscandoOsm] = useState(false);
  const [showOsmSuggestions, setShowOsmSuggestions] = useState(false);
  const [gpsCargando, setGpsCargando] = useState(false);
  const [osmConfirmado, setOsmConfirmado] = useState(true);

  // Flow State
  const [enviando, setEnviando] = useState<boolean>(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [resultadoExitoso, setResultadoExitoso] = useState<ResponseAssistancePayload | null>(null);

  // Sincronizar tipo de servicio si viene en query param o estado de navegación
  useEffect(() => {
    const qTipo = searchParams.get('tipo') || (location.state as { tipo?: string })?.tipo;
    if (qTipo) {
      setTipoServicio(normalizarTipo(qTipo));
    }
  }, [searchParams, location.state]);

  // Cargar datos de la mascota y asegurado según targetRiesgoId (protegido contra loops infinitos)
  useEffect(() => {
    if (!targetRiesgoId) {
      setCargandoMascota(false);
      setPoliza(null);
      setErrorMascota(null);
      lastFetchedRiesgoIdRef.current = null;
      return;
    }

    // Si ya cargamos exitosamente este mismo riesgoId, no volver a solicitar
    if (lastFetchedRiesgoIdRef.current === targetRiesgoId && poliza) {
      return;
    }

    setCargandoMascota(true);
    setErrorMascota(null);
    lastFetchedRiesgoIdRef.current = targetRiesgoId;

    obtenerMascotaPorRiesgoId(targetRiesgoId)
      .then((data) => {
        setPoliza(data);
        setActiveRiesgoId(data.mascota.riesgoId);
        const a = data.asegurado;
        const dirCompleta = [a.address, a.locality, a.province].filter(Boolean).join(', ');
        const dirFinal = dirCompleta || 'Av. Las Condes 10200, Las Condes, Región Metropolitana';
        setDireccion(dirFinal);
        setContactoNombre(`${a.name} ${a.lastName}`);
        setContactoTelefono(a.phone || '');
        setOsmConfirmado(true);
      })
      .catch((err) => {
        console.error('[NuevaAsistenciaPage] Error al cargar mascota:', err);
        setErrorMascota(
          err instanceof Error
            ? err.message
            : `No pudimos cargar la información de la mascota "${targetRiesgoId}".`
        );
      })
      .finally(() => {
        setCargandoMascota(false);
      });
  }, [targetRiesgoId]); // Sin setActiveRiesgoId para no disparar ciclos


  const getTipoLabel = (tipo: string): string => {
    const dynamicFound = serviciosDisponibles.find((s) => s.id === tipo || (s as any).codigoServicio === tipo);
    if (dynamicFound) return dynamicFound.titulo;
    const found = SERVICIOS_OPCIONES.find((s) => s.id === tipo);
    return found ? found.titulo : tipo.replace(/_/g, ' ');
  };

  // OSM Nominatim Handlers
  const handleAddressSearch = async (query: string) => {
    setDireccion(query);
    setOsmConfirmado(false);
    if (!query || query.trim().length < 3) {
      setOsmSuggestions([]);
      setShowOsmSuggestions(false);
      return;
    }
    setBuscandoOsm(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=cl&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        setOsmSuggestions(data || []);
        setShowOsmSuggestions(true);
      }
    } catch (e) {
      console.warn('[OSM Nominatim] Error buscando dirección:', e);
    } finally {
      setBuscandoOsm(false);
    }
  };

  const handleSelectOsm = (item: { display_name: string; lat: string; lon: string }) => {
    setDireccion(item.display_name);
    setCoordenadas({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    setShowOsmSuggestions(false);
    setOsmConfirmado(true);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }
    setGpsCargando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoordenadas({ lat, lon });
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'es' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data.display_name) {
              setDireccion(data.display_name);
              setOsmConfirmado(true);
            }
          }
        } catch (e) {
          console.warn('[OSM Reverse] Error:', e);
        } finally {
          setGpsCargando(false);
        }
      },
      (err) => {
        console.warn('[GPS Error]:', err);
        setGpsCargando(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!poliza) {
      setErrorEnvio('No hay una mascota o póliza seleccionada para la asistencia.');
      return;
    }

    if (comentario.trim().length < 5) {
      setErrorEnvio('Por favor describe brevemente qué ocurrió o el motivo de la asistencia (mínimo 5 caracteres).');
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const sponsorId = tenant?.sponsorId || 'mawdy';
      const clientCode =
        (tenant as unknown as { credenciales?: { businessClientId?: string } })?.credenciales?.businessClientId ||
        `${sponsorId.toUpperCase()}_CL`;

      const lugarFinal = direccion.trim() || poliza.asegurado.address;

      const servicioSeleccionado = serviciosDisponibles.find(
        (s) => s.id === tipoServicio || (s as any).codigoServicio === tipoServicio
      );
      const codigoServicioFinal = (servicioSeleccionado as any)?.codigoServicio || tipoServicio;
      const codigoGarantiaFinal = (servicioSeleccionado as any)?.codigoGarantia || 'GAR_URG_MEDICA';
      const codigoProductoAma = tenant?.productoAma?.codigoProductoAma || 'AMA-PET-CL-01';

      const payload: RequestAssistancePayload = {
        client: {
          businessClientId: clientCode,
        },
        insured: {
          insuredId: poliza.asegurado.insuredId,
          policy: poliza.numeroPoliza,
          nif: poliza.asegurado.idNum,
          name: poliza.asegurado.name,
          surname1: poliza.asegurado.lastName,
          phone: contactoTelefono || poliza.asegurado.phone || '+56900000000',
          email: poliza.asegurado.email,
          portfolio: {
            businessContractId: poliza.businessContractId,
          },
        },
        declaration: {
          businessServiceId: codigoServicioFinal as any,
          comment: comentario.trim(),
          origin: {
            latitude: coordenadas?.lat ?? -33.425,
            longitude: coordenadas?.lon ?? -70.612,
            place: lugarFinal,
          },
          occurrenceDate: new Date().toISOString(),
        },
        attributes: [
          { businessAttributeCd: 'MASCOTA_NOMBRE', value: poliza.mascota.nombre },
          { businessAttributeCd: 'MASCOTA_ESPECIE', value: poliza.mascota.especie },
          { businessAttributeCd: 'MASCOTA_RAZA', value: poliza.mascota.raza },
          { businessAttributeCd: 'MASCOTA_RIESGO_ID', value: poliza.mascota.riesgoId },
          { businessAttributeCd: 'CODIGO_GARANTIA', value: codigoGarantiaFinal },
          { businessAttributeCd: 'PRODUCTO_AMA', value: codigoProductoAma },
        ],
      };

      const resp = await crearAsistencia(payload);
      setResultadoExitoso(resp);
    } catch (err) {
      console.error('[NuevaAsistenciaPage] Error al crear asistencia:', err);
      setErrorEnvio(
        err instanceof Error
          ? err.message
          : 'Ocurrió un inconveniente al despachar la asistencia. Por favor reintenta.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // PANTALLA DE ÉXITO (Con Sello de Marca Oficial)
  if (resultadoExitoso && poliza) {
    return (
      <div className="min-h-screen bg-(--color-canvas) flex flex-col items-center justify-center p-5 text-center">
        <div className="mb-2">
          <PetBrandSeal variant="hero" size={64} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight mt-2">
          Solicitud en coordinación
        </h2>
        <p className="text-xs text-stone-600 mt-2 max-w-sm leading-relaxed">
          Hemos recibido la solicitud para <strong>{poliza.mascota.nombre}</strong>. El equipo de despacho clínico de {branding.shortName} se comunicará al teléfono <strong>{contactoTelefono || poliza.asegurado.phone}</strong> para confirmar los detalles.
        </p>

        {/* Tarjeta Elevada de Confirmación */}
        <div className="my-5 p-5 rounded-3xl bg-white border border-stone-200/90 text-xs text-left w-full max-w-sm shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
            <span className="text-stone-500 font-medium">Número de caso:</span>
            <span className="font-mono font-bold text-stone-900 text-sm">
              {resultadoExitoso.assistanceId || 'AST-PENDIENTE'}
            </span>
          </div>
          {resultadoExitoso.requestId && (
            <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Identificador:</span>
              <span className="font-mono text-stone-600 text-xs">
                {resultadoExitoso.requestId}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
            <span className="text-stone-500 font-medium">Mascota:</span>
            <span className="font-semibold text-stone-900">
              {poliza.mascota.nombre} ({poliza.mascota.raza})
            </span>
          </div>
          <div className="flex justify-between items-center pb-2.5 border-b border-stone-100">
            <span className="text-stone-500 font-medium">Servicio:</span>
            <span className="font-semibold text-stone-900">
              {getTipoLabel(tipoServicio)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-stone-500 font-medium">Cobertura en red:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
              Copago $0
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-500 mb-5 max-w-xs">
          Puedes revisar la evolución de tu solicitud en cualquier momento en tu sección de asistencias.
        </p>

        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate('/asistencias')}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ver mis asistencias</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full py-2.5 bg-white text-stone-700 font-medium text-xs rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ESTADO DE CARGA
  if (cargandoMascota) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-32">
        <ConsumerHeader title="Solicitar asistencia" showBack backTo="/home" />
        <main className="max-w-lg mx-auto px-4 pt-16 flex flex-col gap-4">
          <div className="h-20 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
          <div className="h-64 bg-stone-100/70 rounded-3xl border border-stone-200/60 animate-pulse" />
        </main>
      </div>
    );
  }

  // CASO DE ERROR: riesgoId presente en URL/estado pero mascota no encontrada
  if (targetRiesgoId && (errorMascota || !poliza)) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-32">
        <ConsumerHeader title="Solicitar asistencia" showBack backTo="/home" />
        <main className="max-w-lg mx-auto px-4 pt-18 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-7 border border-stone-200/90 shadow-sm text-center flex flex-col items-center gap-3.5">
            <PetBrandSeal variant="hero" size={56} />
            <h1 className="text-base font-bold text-stone-900 mt-1">Mascota no encontrada</h1>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              {errorMascota || `No encontramos un registro vigente para "${targetRiesgoId}". Si acabas de agregar a tu mascota o cambiar de sponsor, los datos pueden tardar unos instantes en sincronizarse.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <button
                type="button"
                onClick={() => navigate('/asistencias/nueva')}
                className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Elegir otra mascota
              </button>
              <button
                type="button"
                onClick={() => navigate('/buscar?modo=asistencia')}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Buscar en cartera
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // CASO DE SELECCIÓN DE MASCOTA CON VOZ MAWDY PET (Sin riesgoId previo)
  if (!targetRiesgoId || !poliza) {
    return (
      <div className="min-h-screen bg-(--color-canvas) pb-32">
        <ConsumerHeader title="Solicitar asistencia" showBack backTo="/home" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20 flex flex-col gap-6">
          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              ¿Para qué mascota solicitas asistencia?
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Selecciona la mascota registrada en tu póliza para gestionar el servicio.
            </p>
          </div>

          {loadingCartera ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-24 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
              <div className="h-24 bg-stone-100/70 rounded-2xl border border-stone-200/60 animate-pulse" />
            </div>
          ) : polizas.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {polizas.map((p) => {
                  const m = p.mascota;
                  const tipoParam = searchParams.get('tipo') ? `?tipo=${searchParams.get('tipo')}` : '';
                  return (
                    <button
                      key={m.riesgoId}
                      type="button"
                      onClick={() => {
                        setActiveRiesgoId(m.riesgoId);
                        navigate(`/asistencias/nueva/${encodeURIComponent(m.riesgoId)}${tipoParam}`, {
                          state: { riesgoId: m.riesgoId, tipo: tipoServicio },
                        });
                      }}
                      className="p-4 bg-white hover:bg-stone-50 border border-stone-200/90 hover:border-stone-300 rounded-2xl transition-all flex items-center justify-between gap-3 text-left cursor-pointer active:scale-99 shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <PetAvatar
                          src={m.fotoUrl}
                          name={m.nombre}
                          species={m.especie}
                          size="md"
                          className="rounded-xl border border-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-stone-900 truncate">{m.nombre}</h2>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                            <span>{m.raza}</span>
                            <span className="text-stone-300">/</span>
                            <span className="capitalize">{m.especie}</span>
                          </div>
                          <span className="text-[11px] font-mono text-stone-400 block mt-0.5">ID: {m.riesgoId}</span>
                        </div>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-sm font-semibold shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/buscar?modo=asistencia')}
                  className="w-full py-3 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-stone-500" />
                  <span>¿No encuentras a tu mascota? Buscar en cartera</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-7 text-center border border-stone-200/90 flex flex-col items-center gap-3.5 shadow-2xs">
              <PetBrandSeal variant="hero" size={48} />
              <h2 className="text-sm font-bold text-stone-900 mt-1">Sin mascotas asociadas</h2>
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
                No detectamos mascotas activas en la sesión actual. Puedes buscar directamente en la base de pólizas.
              </p>
              <button
                type="button"
                onClick={() => navigate('/buscar?modo=asistencia')}
                className="py-2.5 px-4 bg-stone-900 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-stone-800 transition-colors"
              >
                Buscar en cartera
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  const { mascota, asegurado } = poliza;

  return (
    <div className="min-h-screen bg-(--color-canvas) pb-32">
      <ConsumerHeader title="Solicitar asistencia" showBack backTo="/home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Principal: Wizard Asistencial (8 cols en Desktop) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Cabecera contextual móvil: Mascota Seleccionada */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3 min-w-0">
                <PetAvatar
                  src={mascota.fotoUrl}
                  name={mascota.nombre}
                  species={mascota.especie}
                  size="sm"
                  className="rounded-xl border border-stone-200/80 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 truncate">{mascota.nombre}</h2>
                    <span className="text-[11px] font-medium bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded-full capitalize">
                      {mascota.especie === 'perro' ? 'Canino' : mascota.especie === 'gato' ? 'Felino' : mascota.especie}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {mascota.raza}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cobertura activa
                </span>
              </div>
            </div>

            {/* ALERTA DE ERROR SI FALLA EL ENVÍO (PRESERVA LOS DATOS) */}
            {errorEnvio && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center gap-2 font-semibold text-sm text-rose-900">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>No pudimos registrar la asistencia</span>
                </div>
                <p className="text-rose-700 leading-relaxed">
                  {errorEnvio}. Tus datos siguen guardados en el formulario para que no tengas que escribirlos de nuevo.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={enviando}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar envío</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Sección 1: Selección de Servicio */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                      ¿Qué necesitas para {mascota.nombre}?
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Selecciona el tipo de servicio requerido
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                    Copago $0
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {serviciosDisponibles.map((opcion, idx) => {
                    const isSelected = tipoServicio === opcion.id;
                    const IconComp = opcion.icon;

                    return (
                      <button
                        key={`${opcion.id}-${idx}`}
                        type="button"
                        onClick={() => setTipoServicio(opcion.id)}
                        className={`p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-stone-50/90 border-(--color-primary) ring-1 ring-(--color-primary) shadow-2xs'
                            : 'bg-white border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${opcion.iconBg}`}>
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-stone-900 truncate">
                              {opcion.titulo}
                            </h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-(--color-primary) text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 font-medium mt-0.5">
                            {opcion.subtitulo}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                            {opcion.explicacion}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sección 2: Detalle o motivo clínico */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col gap-3">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                    ¿Qué síntomas o situación presenta?
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Describe brevemente para coordinar la mejor respuesta
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <textarea
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Ej. Lleva 2 horas con vómitos frecuentes, decaimiento y dolor al tacto abdominal..."
                    className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition-all resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Mínimo 5 caracteres</span>
                    <span>{comentario.length} caracteres</span>
                  </div>
                </div>
              </div>

              {/* Sección 3: Dirección / Ubicación */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col gap-3">
                <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                      Ubicación del evento
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Lugar donde se encuentra {mascota.nombre}
                    </p>
                  </div>
                  <MapPin className="w-4 h-4 text-stone-400" />
                </div>

                <div className="flex flex-col gap-3 pt-1 relative">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Dirección del evento (Validada con OpenStreetMap)
                      </label>
                      <button
                        type="button"
                        onClick={handleUseGps}
                        disabled={gpsCargando}
                        className="text-[11px] font-semibold text-(--color-primary) hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Obtener coordenadas de mi ubicación actual"
                      >
                        {gpsCargando ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Navigation className="w-3 h-3" />
                        )}
                        <span>{gpsCargando ? 'Ubicando...' : 'Usar mi GPS'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={direccion}
                          onChange={(e) => handleAddressSearch(e.target.value)}
                          onFocus={() => {
                            if (osmSuggestions.length > 0) setShowOsmSuggestions(true);
                          }}
                          placeholder="Escribe calle y número, ej. Av. Providencia 1234..."
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition-all"
                        />
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                        {buscandoOsm && (
                          <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin absolute right-3 pointer-events-none" />
                        )}
                      </div>

                      {/* Dropdown de Sugerencias de OpenStreetMap (OSM) */}
                      {showOsmSuggestions && osmSuggestions.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-stone-200 shadow-lg max-h-48 overflow-y-auto divide-y divide-stone-100">
                          <div className="p-2 bg-stone-50 text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-sky-600" /> Resultados OpenStreetMap
                            </span>
                            <span>Chile</span>
                          </div>
                          {osmSuggestions.map((item) => (
                            <button
                              key={item.place_id}
                              type="button"
                              onClick={() => handleSelectOsm(item)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-stone-50 transition-colors flex items-start gap-2 cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-(--color-primary) shrink-0 mt-0.5" />
                              <span className="line-clamp-2 text-stone-800 leading-snug">
                                {item.display_name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Previsualización del Mapa OpenStreetMap y Coordenadas */}
                  {coordenadas && (
                    <div className="rounded-xl overflow-hidden border border-stone-200/90 shadow-2xs">
                      <div className="h-36 w-full bg-stone-100 relative">
                        <iframe
                          title="Ubicación en OpenStreetMap"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordenadas.lon - 0.005}%2C${coordenadas.lat - 0.003}%2C${coordenadas.lon + 0.005}%2C${coordenadas.lat + 0.003}&layer=mapnik&marker=${coordenadas.lat}%2C${coordenadas.lon}`}
                        />
                      </div>
                      <div className="bg-stone-50 px-3 py-2 border-t border-stone-200/70 text-[11px] text-stone-600 flex items-center justify-between flex-wrap gap-2">
                        <span className="font-mono text-stone-500">
                          Coordenadas: {coordenadas.lat.toFixed(5)}, {coordenadas.lon.toFixed(5)}
                        </span>
                        {osmConfirmado ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Georreferenciada con OSM
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" /> Coordenadas aproximadas
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Sección 4: Datos de Contacto Inmediato */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col gap-3">
                <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                      Contacto de emergencia
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Número al cual te llamará el veterinario o coordinador
                    </p>
                  </div>
                  <Phone className="w-4 h-4 text-stone-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nombre de contacto
                    </label>
                    <input
                      type="text"
                      value={contactoNombre}
                      onChange={(e) => setContactoNombre(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Teléfono directo
                    </label>
                    <input
                      type="tel"
                      value={contactoTelefono}
                      onChange={(e) => setContactoTelefono(e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-primary) transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Resumen Final & Despacho */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <h3 className="text-sm font-bold text-stone-900">
                    Resumen de la solicitud
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Garantía activa
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Mascota:</span>
                    <span className="font-semibold text-stone-900">
                      {mascota.nombre} ({mascota.raza})
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium">Servicio:</span>
                    <span className="font-semibold text-(--color-primary)">
                      {getTipoLabel(tipoServicio)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium shrink-0">Motivo:</span>
                    <span className="font-medium text-stone-700 text-right max-w-[240px] truncate">
                      {comentario.trim() || 'Pendiente de detalle'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pb-2 border-b border-stone-100">
                    <span className="text-stone-500 font-medium shrink-0">Ubicación:</span>
                    <span className="font-medium text-stone-700 text-right max-w-[240px] truncate">
                      {direccion || asegurado.address}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Contacto:</span>
                    <span className="font-semibold text-stone-900">
                      {contactoNombre || `${asegurado.name} ${asegurado.lastName}`} <span className="font-mono text-stone-500 font-normal">({contactoTelefono || asegurado.phone})</span>
                    </span>
                  </div>
                </div>

                {/* BOTÓN PRINCIPAL: "Solicitar asistencia" */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  disabled={enviando || comentario.trim().length < 5}
                  className="w-full py-3.5 bg-(--color-primary) hover:opacity-95 active:scale-98 text-white font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Estamos gestionando tu asistencia...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Solicitar asistencia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Lateral (Desktop: 4 cols): Expediente y Póliza Mascota (Sticky) */}
          <div className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="bg-[#fbf9f5] rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-3.5">
                <PetAvatar
                  src={mascota.fotoUrl}
                  name={mascota.nombre}
                  species={mascota.especie}
                  size="md"
                  className="rounded-xl border border-stone-200/80 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 truncate">{mascota.nombre}</h2>
                    <span className="text-[10px] font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full capitalize">
                      {mascota.especie === 'perro' ? 'Canino' : mascota.especie === 'gato' ? 'Felino' : mascota.especie}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {mascota.raza} · {mascota.edadEstimada ? `${mascota.edadEstimada} años` : 'Edad no reg.'}
                  </p>
                  <span className="text-[11px] font-mono text-stone-400 block mt-1">
                    Chip: {mascota.microchip || 'No registrado'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Titular Asegurado:</span>
                  <span className="font-semibold text-stone-900 truncate ml-2">
                    {asegurado.name} {asegurado.lastName}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>RUT:</span>
                  <span className="font-mono text-stone-800">{asegurado.idNum}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Póliza Marco:</span>
                  <span className="font-mono text-stone-800">{poliza.numeroPoliza}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estado Cobertura:</span>
                  <span className="text-emerald-700 font-bold">Activa 100%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700">
                <PhoneCall className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Mesa de Urgencias SOS 24/7</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Si tu mascota sufre riesgo vital inminente, puedes contactar de inmediato con la central de urgencias.
              </p>
              <a
                href="tel:6005008000"
                className="mt-2 w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>Llamar a Urgencias: 600 500 8000</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

