import { apiClient } from './client';
import type {
  Asistencia,
  RequestAssistancePayload,
  ResponseAssistancePayload,
  ListarAsistenciasFiltros,
  PageAssistancesResponse,
} from '../types/asistencia';

export type ListarAsistenciasParams = ListarAsistenciasFiltros;

interface BackendListarAsistenciasResponse {
  asistencias?: Asistencia[];
  content?: Asistencia[];
  totalPages?: number;
  totalElements?: number;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Registra una nueva asistencia en API Business (o mock según modo del tenant).
 * Retorna { assistanceId, requestId }.
 */
export async function crearAsistencia(
  payload: RequestAssistancePayload
): Promise<ResponseAssistancePayload> {
  return apiClient<ResponseAssistancePayload>('/api/asistencias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Obtiene el listado paginado de asistencias del sponsor activo.
 */
export async function listarAsistencias(
  params: ListarAsistenciasFiltros = {}
): Promise<PageAssistancesResponse> {
  const query = new URLSearchParams();
  if (params.policy) query.append('policy', params.policy);
  if (params.idNum) query.append('idNum', params.idNum);
  if (params.businessContractId) query.append('businessContractId', params.businessContractId);
  if (params.occurrenceDateFrom) query.append('occurrenceDateFrom', params.occurrenceDateFrom);
  if (params.occurrenceDateTo) query.append('occurrenceDateTo', params.occurrenceDateTo);
  if (params.insuredId !== undefined) query.append('insuredId', String(params.insuredId));
  if (params.status) query.append('status', params.status);
  if (params.pageNumber !== undefined) query.append('pageNumber', String(params.pageNumber));
  if (params.pageSize !== undefined) query.append('pageSize', String(params.pageSize));

  const queryString = query.toString();
  const endpoint = `/api/asistencias${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient<BackendListarAsistenciasResponse>(endpoint);

  const items = response.content || response.asistencias || [];
  return {
    content: items,
    totalPages: response.totalPages ?? (items.length > 0 ? 1 : 0),
    totalElements: response.totalElements ?? items.length,
    pageNumber: response.pageNumber ?? 1,
    pageSize: response.pageSize ?? 10,
  };
}
