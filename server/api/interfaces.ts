/**
 * Interfaces de clientes de API — Contratos fijos con dos implementaciones
 * intercambiables (mock y real).
 *
 * La factory `createApiClients()` elige la implementación según el modo
 * del tenant activo.
 */

// Re-declare los tipos que usa el server (no importamos de src/ para
// mantener el server independiente del frontend bundler)
export interface Ubicacion {
  latitude: number;
  longitude: number;
  place: string;
}

/**
 * TODO: Reemplazar por el catálogo real de businessServiceId que entregue Mawdy
 * para el producto de mascotas.
 */
export type TipoServicio =
  | 'CONSULTA_URGENTE'
  | 'TRASLADO'
  | 'ORIENTACION_TELEFONICA'
  | 'OTRO';


export interface Asegurado {
  insuredId: number;
  businessContractId: string;
  name: string;
  lastName: string;
  idNum: string;
  policy: string;
  address: string;
  province?: string;
  locality?: string;
  postalCode?: string;
  countryCd?: string;
  age?: number;
  email?: string;
  phone?: string;
}

export interface Mascota {
  riesgoId: string;
  nombre: string;
  especie: 'perro' | 'gato' | 'otro';
  raza: string;
  fechaNacimiento?: string;
  edadEstimada?: number;
  sexo: 'macho' | 'hembra';
  pesoKg: number;
  colorSenasParticulares: string;
  microchip?: string;
  fotoUrl?: string;
}

export interface Poliza {
  numeroPoliza: string;
  sponsorId: string;
  businessContractId: string;
  estado: 'activa' | 'inactiva' | 'vencida';
  asegurado: Asegurado;
  mascota: Mascota;
}

export interface AtributoNegocio {
  businessAttributeCd: string;
  value: string;
}

export interface Asistencia {
  businessClientId: string;
  businessContractId: string;
  insuredId: number;
  policy: string;
  businessServiceId: TipoServicio;
  comment: string;
  origin: Ubicacion;
  destination?: Ubicacion;
  occurrenceDate: string;
  status: string;
  assistanceId?: string | number;
  requestId?: string | number;
  attributes?: AtributoNegocio[];
}

// ---------- Filtros ----------

export interface BuscarAseguradosCriterio {
  /** Búsqueda por RUT / documento */
  idNum?: string;
  /** Búsqueda por número de póliza */
  policy?: string;
  /** Búsqueda por teléfono */
  phone?: string;
  /** Búsqueda por nombre (parcial) */
  nombre?: string;
}

export interface ListarAsistenciasFiltros {
  /** Filtrar por número de póliza */
  policy?: string;
  /** Filtrar por RUT / documento del asegurado */
  idNum?: string;
  /** Filtrar por código de contrato */
  businessContractId?: string;
  /** Filtrar por insuredId */
  insuredId?: number;
  /** Filtrar por estado */
  status?: string;
  /** Fecha de ocurrencia desde (formato yyyy-MM-dd o yyyy-MM-dd HH:mm:ss) */
  occurrenceDateFrom?: string;
  /** Fecha de ocurrencia hasta (formato yyyy-MM-dd o yyyy-MM-dd HH:mm:ss) */
  occurrenceDateTo?: string;
  /** Número de página (1-indexed) */
  pageNumber?: number;
  /** Tamaño de página */
  pageSize?: number;
}

export interface PageAssistancesResponse {
  content: Asistencia[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export interface RequestAssistancePayload {
  client: {
    businessClientId: string;
  };
  insured: {
    insuredId: number;
    policy: string;
    nif: string;
    name: string;
    surname1: string;
    phone: string;
    email?: string;
    portfolio: {
      businessContractId: string;
    };
  };
  declaration: {
    businessServiceId: TipoServicio;
    origin: Ubicacion;
    destination?: Ubicacion;
    comment: string;
    occurrenceDate: string;
  };
  attributes?: AtributoNegocio[];
}

export interface ResponseAssistancePayload {
  assistanceId: string | number;
  requestId: string | number;
  status?: string;
}

// Alias de retrocompatibilidad
export type CrearAsistenciaPayload = RequestAssistancePayload;

// ---------- Interfaces de clientes ----------

/**
 * Cliente de Cartera — búsqueda de asegurados/pólizas.
 */
export interface ICarteraClient {
  buscarAsegurados(criterio: BuscarAseguradosCriterio): Promise<Poliza[]>;
  obtenerPorRiesgoId(riesgoId: string): Promise<Poliza | null>;
}


/**
 * Cliente de Asistencias — creación y listado.
 */
export interface IAsistenciasClient {
  crearAsistencia(payload: RequestAssistancePayload): Promise<ResponseAssistancePayload>;
  listarAsistencias(filtros: ListarAsistenciasFiltros): Promise<PageAssistancesResponse>;
}

