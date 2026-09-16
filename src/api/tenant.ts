import { apiClient } from './client';
import type { TenantConfig, ProductoAmaConfig, ServicioCobertura } from '../types/tenant';

export type { ServicioCobertura, ProductoAmaConfig };

export interface TenantCredencialesStatus {
  businessClientId: boolean;
  clientId: boolean;
  clientSecret: boolean;
  clientIdEnvVar?: string;
  clientSecretEnvVar?: string;
}

/** Datos públicos del tenant (sin credenciales secretas) */
export interface TenantPublicInfo {
  sponsorId: string;
  subdominio: string;
  nombreVisible: string;
  countryId: string;
  modo: 'mock' | 'real' | 'preproductivo' | 'productivo';
  activo?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  credencialesConfiguradas?: TenantCredencialesStatus;
  tema: TenantConfig['tema'];
  productoAma?: ProductoAmaConfig;
}

export interface PublicTenantItem {
  sponsorId: string;
  subdominio: string;
  nombreVisible: string;
  logoUrl: string;
  bannerUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fuente?: string;
  productoAma?: ProductoAmaConfig;
}

/**
 * Obtiene la configuración pública del tenant activo.
 */
export function fetchTenantInfo(): Promise<TenantPublicInfo> {
  return apiClient<TenantPublicInfo>('/api/tenant');
}

/**
 * Obtiene el directorio de todos los sponsors activos (usado para pantallas de fallback y directorio).
 */
export function fetchPublicTenants(): Promise<PublicTenantItem[]> {
  return apiClient<PublicTenantItem[]>('/api/tenants/public');
}
