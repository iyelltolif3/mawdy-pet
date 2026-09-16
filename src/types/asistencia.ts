/**
 * Ubicación geográfica para origen / destino de una asistencia.
 */
export interface Ubicacion {
  latitude: number;
  longitude: number;
  /** Dirección o nombre del lugar en texto libre */
  place: string;
}

import type { AtributoNegocio } from './atributo-negocio';

/**
 * Tipos de servicio de asistencia.
 *
 * TODO: Reemplazar por el catálogo real de businessServiceId que entregue Mawdy
 * para el producto de mascotas.
 */
export type TipoServicio =
  | 'CONSULTA_URGENTE'
  | 'TELEMEDICINA'
  | 'ORIENTACION_TELEFONICA'
  | 'VETERINARIO_DOMICILIO'
  | 'REEMBOLSO_GASTOS'
  | 'VACUNACION'
  | 'TRASLADO'
  | 'OTRO';

/**
 * Asistencia — Alineada a RequestAssistance / Assistance del Swagger de API Business.
 *
 * Los campos con comentario "asignado por la API" se reciben en la respuesta
 * de creación y no se envían en el request.
 */
export interface Asistencia {
  /** ID del cliente de negocio (sponsor) en API Business */
  businessClientId: string;

  /** Contrato de negocio */
  businessContractId: string;

  /** ID del asegurado */
  insuredId: number;

  /** Número de póliza */
  policy: string;

  /**
   * Tipo de servicio solicitado.
   * En API Business corresponde a `businessServiceId`.
   */
  businessServiceId: TipoServicio;

  /**
   * Descripción / motivo de la asistencia.
   * Máximo 500 caracteres.
   */
  comment: string;

  /** Lugar de origen de la asistencia */
  origin: Ubicacion;

  /** Lugar de destino (opcional, aplica para traslados) */
  destination?: Ubicacion;

  /** Fecha/hora del siniestro en formato "yyyy-MM-dd HH:mm:ss" o ISO */
  occurrenceDate: string;

  /**
   * Estado crudo de la API.
   *
   * Códigos según Swagger API Business:
   * - "L": Localizado / Abierto
   * - "A": Actuated
   * - "C": Loaded Vehicle / Cerrado
   * - "N": Cancelled
   * - "P": PreAssigned
   * - "F": Future
   * - "R": No Resource Assigned
   */
  status: string;

  /** ID de la asistencia — asignado por la API al crear (entero int64 en API Business) */
  assistanceId?: string | number;

  /** ID de la solicitud — asignado por la API al crear (entero int64 en API Business) */
  requestId?: string | number;

  /** Atributos extendidos (datos de la mascota) */
  attributes?: AtributoNegocio[];
}

/**
 * Payload canónico para creación de asistencia alineado a RequestAssistance del Swagger de API Business.
 */
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

/**
 * Respuesta de creación de asistencia según ResponseAssistance del Swagger de API Business.
 * Nota: La API real solo devuelve assistanceId y requestId, sin estado inicial.
 */
export interface ResponseAssistancePayload {
  assistanceId: string | number;
  requestId: string | number;
}

/**
 * Filtros de búsqueda para el listado de asistencias de API Business.
 */
export interface ListarAsistenciasFiltros {
  /** N° de póliza */
  policy?: string;
  /** RUT o documento de identidad del asegurado */
  idNum?: string;
  /** Identificador de contrato */
  businessContractId?: string;
  /** ID del asegurado */
  insuredId?: number;
  /** Código de estado de la asistencia */
  status?: string;
  /** Fecha de ocurrencia desde (formato yyyy-MM-dd o yyyy-MM-dd HH:mm:ss) */
  occurrenceDateFrom?: string;
  /** Fecha de ocurrencia hasta (formato yyyy-MM-dd o yyyy-MM-dd HH:mm:ss) */
  occurrenceDateTo?: string;
  /** Número de página para paginación (1-indexed) */
  pageNumber?: number;
  /** Cantidad de elementos por página */
  pageSize?: number;
}

/**
 * Respuesta paginada de asistencias alineada a PageAssistances del Swagger.
 */
export interface PageAssistancesResponse {
  content: Asistencia[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

// TODO: reemplazar por la tabla real de códigos de estado que entregue Mawdy
const ESTADOS_MAP: Record<string, string> = {
  L: 'Activa',
  A: 'En Curso',
  R: 'Resuelta',
  C: 'Cerrada',
  N: 'Cancelada',
  P: 'Pendiente',
  F: 'Programada',
};

/**
 * mapEstado — Convierte el código de estado devuelto por API Business a una etiqueta legible.
 * Si el código no está en el mapa placeholder, lo muestra tal cual sin romper la UI.
 */
export function mapEstado(codigo: string): string {
  if (!codigo) return 'Sin Estado';
  const normalizado = codigo.trim().toUpperCase();
  return ESTADOS_MAP[normalizado] || codigo;
}

/**
 * Retorna la variante de Badge según el código de estado.
 */
export function getEstadoBadgeVariant(
  codigo: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (codigo?.trim().toUpperCase()) {
    case 'L':
      return 'info'; // Activa / Localizada
    case 'A':
    case 'P':
    case 'F':
      return 'warning'; // En Curso / Pendiente / Programada
    case 'R':
      return 'success'; // Resuelta
    case 'N':
      return 'danger'; // Cancelada
    case 'C':
    default:
      return 'default'; // Cerrada u otro código desconocido
  }
}

/**
 * Retorna una etiqueta amigable para el tipo de servicio.
 */
export function mapTipoServicio(tipo: TipoServicio | string): string {
  switch (tipo) {
    case 'CONSULTA_URGENTE':
      return 'Consulta urgente';
    case 'TRASLADO':
      return 'Traslado';
    case 'ORIENTACION_TELEFONICA':
      return 'Orientación telefónica';
    case 'OTRO':
      return 'Otro';
    default:
      return tipo ? tipo.replace(/_/g, ' ') : 'Servicio';
  }
}


