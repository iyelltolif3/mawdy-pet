import type {
  IAsistenciasClient,
  RequestAssistancePayload,
  ResponseAssistancePayload,
  ListarAsistenciasFiltros,
  PageAssistancesResponse,
  Asistencia,
} from './interfaces';

interface TokenCache {
  token: string;
  expiresAt: number; // timestamp en ms
}

/**
 * RealAsistenciasClient — Implementación real contra API Business de Mawdy.
 *
 * Flujo de autenticación y consumo:
 * 1. `obtenerToken()`: Petición a Cognito OAuth2 token endpoint con grant_type=client_credentials,
 *    usando Basic Auth con las credenciales leídas de las env vars del tenant.
 *    Cachea el token en memoria hasta que falten 60s para su expiración.
 * 2. `crearCasoReal()`: Petición POST a /api/business/assistances con headers Authorization,
 *    countryId y Accept-Language, enviando el body canónico RequestAssistance.
 * 3. `listarAsistencias()`: Petición GET a /api/business/client/{businessClientId}/assistances.
 *
 * ⚠️  ACTIVACIÓN:
 *     Esta clase se utiliza automáticamente cuando el sponsor tiene `modo: "real"` en su
 *     archivo de configuración (o vía `<SPONSOR>_MODE=real` en .env) y sus credenciales
 *     están presentes en el entorno.
 */
export class RealAsistenciasClient implements IAsistenciasClient {
  private _sponsorId: string;
  private _countryId: string;
  private _businessClientId: string;
  private _apiBaseUrl: string;
  private _tokenUrl: string;
  private _clientIdEnvVar: string;
  private _clientSecretEnvVar: string;
  private _tokenCache: TokenCache | null = null;

  constructor(config: {
    sponsorId: string;
    countryId: string;
    businessClientId: string;
    apiBaseUrl?: string;
    tokenUrl?: string;
    clientIdEnvVar: string;
    clientSecretEnvVar: string;
  }) {
    this._sponsorId = config.sponsorId;
    this._countryId = config.countryId;
    this._businessClientId = config.businessClientId;
    this._apiBaseUrl = config.apiBaseUrl || 'https://api-pre.mia-assistance.com/maip_api_bss_assist';
    this._tokenUrl = config.tokenUrl || 'https://auth-pre.mia-assistance.com/oauth2/token';
    this._clientIdEnvVar = config.clientIdEnvVar;
    this._clientSecretEnvVar = config.clientSecretEnvVar;
  }

  /**
   * Obtiene un token de acceso OAuth2 (Cognito) usando client_credentials.
   * Si ya existe un token en memoria válido, lo reutiliza.
   */
  async obtenerToken(): Promise<string> {
    // 1. Verificar si existe token válido en caché (con 60s de margen)
    if (this._tokenCache && Date.now() < this._tokenCache.expiresAt - 60000) {
      return this._tokenCache.token;
    }

    // 2. Leer credenciales desde variables de entorno del tenant
    const clientId = process.env[this._clientIdEnvVar];
    const clientSecret = process.env[this._clientSecretEnvVar];

    if (!clientId || !clientSecret) {
      throw new Error(
        `[RealAsistenciasClient] Credenciales no configuradas para el sponsor "${this._sponsorId}". ` +
        `Por favor define ${this._clientIdEnvVar} y ${this._clientSecretEnvVar} en el archivo .env.`
      );
    }

    // 3. Petición POST a Cognito con Basic Auth y grant_type=client_credentials
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    try {
      const response = await fetch(this._tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al autenticar con Mawdy Cognito (${response.status}): ${errorText}`
        );
      }

      const data = (await response.json()) as {
        access_token: string;
        token_type: string;
        expires_in: number;
      };

      // 4. Guardar en caché con tiempo de expiración
      const expiresInMs = (data.expires_in || 3600) * 1000;
      this._tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + expiresInMs,
      };

      return data.access_token;
    } catch (err) {
      console.error(`[RealAsistenciasClient] Error en obtenerToken para ${this._sponsorId}:`, err);
      throw err;
    }
  }

  /**
   * Crea un caso real de asistencia en API Business (POST /api/business/assistances).
   */
  async crearCasoReal(payload: RequestAssistancePayload): Promise<ResponseAssistancePayload> {
    const token = await this.obtenerToken();
    const endpoint = `${this._apiBaseUrl}/api/business/assistances`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'countryId': this._countryId,
          'Accept-Language': 'ES',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.message || errorBody.error || response.statusText;
        throw new Error(
          `Error en API Business (${response.status}): ${message}`
        );
      }

      const data = (await response.json()) as ResponseAssistancePayload;
      return {
        assistanceId: data.assistanceId,
        requestId: data.requestId,
      };
    } catch (err) {
      console.error(`[RealAsistenciasClient] Error en crearCasoReal para ${this._sponsorId}:`, err);
      throw err;
    }
  }

  /**
   * Implementación de IAsistenciasClient.crearAsistencia
   */
  async crearAsistencia(payload: RequestAssistancePayload): Promise<ResponseAssistancePayload> {
    return this.crearCasoReal(payload);
  }

  /**
   * Implementación de IAsistenciasClient.listarAsistencias
   */
  async listarAsistencias(filtros: ListarAsistenciasFiltros): Promise<PageAssistancesResponse> {
    const token = await this.obtenerToken();

    const query = new URLSearchParams();
    if (filtros.policy) query.append('policy', filtros.policy);
    if (filtros.idNum) query.append('idNum', filtros.idNum);
    if (filtros.businessContractId) query.append('businessContractId', filtros.businessContractId);
    if (filtros.occurrenceDateFrom) query.append('occurrenceDateFrom', filtros.occurrenceDateFrom);
    if (filtros.occurrenceDateTo) query.append('occurrenceDateTo', filtros.occurrenceDateTo);
    if (filtros.insuredId) query.append('insuredId', String(filtros.insuredId));
    if (filtros.status) query.append('status', filtros.status);
    if (filtros.pageNumber) query.append('pageNumber', String(filtros.pageNumber));
    if (filtros.pageSize) query.append('pageSize', String(filtros.pageSize));

    const qStr = query.toString();
    const endpoint = `${this._apiBaseUrl}/api/business/client/${this._businessClientId}/assistances${qStr ? `?${qStr}` : ''}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'countryId': this._countryId,
          'Accept-Language': 'ES',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al listar asistencias en API Business (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        content?: Asistencia[];
        assistances?: Asistencia[];
        totalPages?: number;
        totalElements?: number;
      };

      const content = data.content || data.assistances || [];
      return {
        content,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements ?? content.length,
        pageNumber: filtros.pageNumber || 1,
        pageSize: filtros.pageSize || 10,
      };
    } catch (err) {
      console.error(`[RealAsistenciasClient] Error en listarAsistencias para ${this._sponsorId}:`, err);
      throw err;
    }
  }
}
