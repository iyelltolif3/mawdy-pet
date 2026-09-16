import { apiClient } from './client';
import type { Poliza } from '../types/poliza';

export interface BuscarCarteraParams {
  policy?: string;
  idNum?: string;
  phone?: string;
  nombre?: string;
}

interface BuscarResponse {
  polizas: Poliza[];
}

interface MascotaResponse {
  poliza: Poliza;
}

/**
 * Busca pólizas en la cartera del tenant activo según los criterios reales de API Business.
 */
export async function buscarCartera(params: BuscarCarteraParams): Promise<Poliza[]> {
  const query = new URLSearchParams();
  if (params.policy) query.append('policy', params.policy.trim());
  if (params.idNum) query.append('idNum', params.idNum.trim());
  if (params.phone) query.append('phone', params.phone.trim());
  if (params.nombre) query.append('nombre', params.nombre.trim());

  const queryString = query.toString();
  const endpoint = `/api/cartera/buscar${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient<BuscarResponse>(endpoint);
  return response.polizas || [];
}

/**
 * Obtiene la póliza y ficha completa de una mascota según su riesgoId.
 */
export async function obtenerMascotaPorRiesgoId(riesgoId: string): Promise<Poliza> {
  const endpoint = `/api/cartera/mascota/${encodeURIComponent(riesgoId)}`;
  const response = await apiClient<MascotaResponse>(endpoint);
  return response.poliza;
}
