import type {
  ICarteraClient,
  BuscarAseguradosCriterio,
  Poliza,
} from './interfaces';

/**
 * RealCarteraClient — Implementación real contra API Business de Mawdy.
 *
 * Basado en la especificación OpenAPI 3.0.1 de "API Business PRE":
 * - Servidor PRE: https://api-pre.mia-assistance.com/maip_api_bss_assist
 * - OAuth2 Token: https://auth-pre.mia-assistance.com/oauth2/token (client_credentials)
 * - Headers obligatorios:
 *     - countryId: ISO de 2 letras (ej. "CL")
 *     - Accept-Language: "ES" o "EN"
 *     - Authorization: Bearer <token>
 * - Endpoint búsqueda:
 *     GET /api/business/client/{businessClientId}/insureds?idNum={rut}&policy={num}
 * - Endpoint detalle asegurado:
 *     GET /api/business/client/{businessClientId}/insured/{insuredId}
 *
 * ⚠️  Pendiente de activación: Requiere credenciales OAuth (CLIENT_ID y CLIENT_SECRET)
 *     para cada sponsor.
 */
export class RealCarteraClient implements ICarteraClient {
  private _sponsorId: string;
  private _countryId: string;
  private _businessClientId: string;
  private _apiBaseUrl: string;
  private _clientIdEnvVar: string;
  private _clientSecretEnvVar: string;

  constructor(config: {
    sponsorId: string;
    countryId: string;
    businessClientId: string;
    apiBaseUrl?: string;
    clientIdEnvVar: string;
    clientSecretEnvVar: string;
  }) {
    this._sponsorId = config.sponsorId;
    this._countryId = config.countryId;
    this._businessClientId = config.businessClientId;
    this._apiBaseUrl = config.apiBaseUrl || 'https://api-pre.mia-assistance.com/maip_api_bss_assist';
    this._clientIdEnvVar = config.clientIdEnvVar;
    this._clientSecretEnvVar = config.clientSecretEnvVar;
  }

  async buscarAsegurados(_criterio: BuscarAseguradosCriterio): Promise<Poliza[]> {
    const clientId = process.env[this._clientIdEnvVar];
    const clientSecret = process.env[this._clientSecretEnvVar];

    if (!clientId || !clientSecret) {
      throw new Error(
        `[RealCarteraClient] No hay credenciales configuradas para el sponsor "${this._sponsorId}". ` +
        `Define ${this._clientIdEnvVar} y ${this._clientSecretEnvVar} en el archivo .env.`
      );
    }

    throw new Error(
      `[RealCarteraClient] Endpoint ${this._apiBaseUrl}/api/business/client/${this._businessClientId}/insureds ` +
      `listo para integración con credenciales configuradas. (Implementación completa en fase de integración).`
    );
  }

  async obtenerPorRiesgoId(riesgoId: string): Promise<Poliza | null> {
    const clientId = process.env[this._clientIdEnvVar];
    const clientSecret = process.env[this._clientSecretEnvVar];

    if (!clientId || !clientSecret) {
      throw new Error(
        `[RealCarteraClient] No hay credenciales configuradas para el sponsor "${this._sponsorId}". ` +
        `Define ${this._clientIdEnvVar} y ${this._clientSecretEnvVar} en el archivo .env.`
      );
    }

    throw new Error(
      `[RealCarteraClient] obtenerPorRiesgoId(${riesgoId}) listo para integración con API Business de Mawdy.`
    );
  }
}


