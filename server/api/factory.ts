import type { TenantConfig } from '../tenants/types';
import type { ICarteraClient, IAsistenciasClient } from './interfaces';
import { MockCarteraClient } from './mock-cartera';
import { MockAsistenciasClient } from './mock-asistencias';
import { RealCarteraClient } from './real-cartera';
import { RealAsistenciasClient } from './real-asistencias';

export interface ApiClients {
  cartera: ICarteraClient;
  asistencias: IAsistenciasClient;
}

/**
 * Factory que, según el modo del tenant activo, devuelve la implementación
 * mock o real de cada cliente de API.
 *
 * @param tenantConfig - Configuración del tenant resuelto por el middleware
 * @returns Objeto con ambos clientes (cartera y asistencias)
 */
export function createApiClients(tenantConfig: TenantConfig): ApiClients {
  if (tenantConfig.modo === 'real') {
    const realConfig = {
      sponsorId: tenantConfig.sponsorId,
      countryId: tenantConfig.countryId,
      businessClientId: tenantConfig.credenciales.businessClientId,
      apiBaseUrl: process.env[`${tenantConfig.sponsorId.toUpperCase()}_API_URL`] || '',
      clientIdEnvVar: tenantConfig.credenciales.clientIdEnvVar,
      clientSecretEnvVar: tenantConfig.credenciales.clientSecretEnvVar,
    };

    return {
      cartera: new RealCarteraClient(realConfig),
      asistencias: new RealAsistenciasClient(realConfig),
    };
  }

  // Modo mock (default)
  return {
    cartera: new MockCarteraClient(tenantConfig.sponsorId),
    asistencias: new MockAsistenciasClient(tenantConfig),
  };
}
