import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  IAsistenciasClient,
  RequestAssistancePayload,
  ResponseAssistancePayload,
  ListarAsistenciasFiltros,
  PageAssistancesResponse,
  Asistencia,
  Poliza,
} from './interfaces';
import type { TenantConfig } from '../tenants/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MockAsistenciasClient — Lee y escribe asistencias en el archivo de mocks
 * del tenant activo.
 *
 * Busca en server/mocks/<sponsorId>.mock.json. Al crear una asistencia,
 * la agrega al array y persiste el JSON (útil para probar el flujo completo
 * sin perder datos entre peticiones).
 */
export class MockAsistenciasClient implements IAsistenciasClient {
  private sponsorId: string;
  private businessClientId: string;

  constructor(tenantConfig: TenantConfig) {
    this.sponsorId = tenantConfig.sponsorId;
    this.businessClientId = tenantConfig.credenciales.businessClientId;
  }

  async crearAsistencia(payload: RequestAssistancePayload): Promise<ResponseAssistancePayload> {
    const data = this.loadMockData();
    const asistencias: Asistencia[] = data.asistencias || [];

    // Generar IDs simulados
    const seq = asistencias.length + 1;
    const prefix = this.sponsorId.toUpperCase().substring(0, 2);
    const assistanceId = `AST-${prefix}-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
    const requestId = `REQ-${prefix}-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;

    // Normalizar datos tanto de RequestAssistancePayload canónico como plano
    const businessContractId =
      payload.insured?.portfolio?.businessContractId ||
      (payload as any).businessContractId ||
      'DEFAULT_BC';
    const insuredId = payload.insured?.insuredId ?? (payload as any).insuredId;
    const policy = payload.insured?.policy || (payload as any).policy;
    const businessServiceId =
      payload.declaration?.businessServiceId || (payload as any).businessServiceId;
    const comment = payload.declaration?.comment || (payload as any).comment;
    const origin = payload.declaration?.origin || (payload as any).origin;
    const destination = payload.declaration?.destination || (payload as any).destination;
    const occurrenceDate =
      payload.declaration?.occurrenceDate ||
      (payload as any).occurrenceDate ||
      new Date().toISOString();
    const attributes = payload.attributes || (payload as any).attributes;

    const nueva: Asistencia = {
      businessClientId: this.businessClientId,
      businessContractId,
      insuredId,
      policy,
      businessServiceId,
      comment,
      origin,
      destination,
      occurrenceDate,
      status: 'L', // "Localizado" — estado inicial en mock
      assistanceId,
      requestId,
      attributes,
    };

    asistencias.push(nueva);
    data.asistencias = asistencias;
    this.saveMockData(data);

    return {
      assistanceId,
      requestId,
      status: 'L',
    };
  }


  async listarAsistencias(filtros: ListarAsistenciasFiltros): Promise<PageAssistancesResponse> {
    const data = this.loadMockData();
    let asistencias: Asistencia[] = (data.asistencias as Asistencia[]) || [];
    const polizas: Poliza[] = (data.polizas as Poliza[]) || [];

    // Enriquecer asistencias que no tengan attributes mapeando su mascota desde polizas
    asistencias = asistencias.map((a) => {
      if (a.attributes && a.attributes.length > 0) return a;
      const pol = polizas.find((p) => p.numeroPoliza === a.policy);
      if (pol && pol.mascota) {
        return {
          ...a,
          attributes: [
            { businessAttributeCd: 'MASCOTA_NOMBRE', value: pol.mascota.nombre },
            { businessAttributeCd: 'MASCOTA_ESPECIE', value: pol.mascota.especie },
            { businessAttributeCd: 'MASCOTA_RAZA', value: pol.mascota.raza },
            { businessAttributeCd: 'MASCOTA_RIESGO_ID', value: pol.mascota.riesgoId },
          ],
        };
      }
      return a;
    });

    // 1. Filtro por N° de póliza (policy)
    if (filtros.policy && filtros.policy.trim()) {
      const polSearch = filtros.policy.trim().toLowerCase();
      asistencias = asistencias.filter((a) => a.policy.toLowerCase().includes(polSearch));
    }

    // 2. Filtro por Documento de identidad (idNum)
    if (filtros.idNum && filtros.idNum.trim()) {
      const idSearch = filtros.idNum.trim().toLowerCase();
      const matchedPolicies = new Set(
        polizas
          .filter((p) => p.asegurado.idNum.toLowerCase().includes(idSearch))
          .map((p) => p.numeroPoliza)
      );
      asistencias = asistencias.filter((a) => matchedPolicies.has(a.policy));
    }

    // 3. Filtro por Contrato (businessContractId)
    if (filtros.businessContractId && filtros.businessContractId.trim()) {
      const bcSearch = filtros.businessContractId.trim().toLowerCase();
      asistencias = asistencias.filter((a) =>
        a.businessContractId.toLowerCase().includes(bcSearch)
      );
    }

    // 4. Filtro por insuredId
    if (filtros.insuredId !== undefined && !isNaN(Number(filtros.insuredId))) {
      asistencias = asistencias.filter((a) => a.insuredId === Number(filtros.insuredId));
    }

    // 5. Filtro por estado (status)
    if (filtros.status && filtros.status.trim()) {
      asistencias = asistencias.filter(
        (a) => a.status.toUpperCase() === filtros.status!.trim().toUpperCase()
      );
    }

    // 6. Filtro por rango de fechas (occurrenceDateFrom / occurrenceDateTo)
    if (filtros.occurrenceDateFrom && filtros.occurrenceDateFrom.trim()) {
      const fromDate = new Date(filtros.occurrenceDateFrom).getTime();
      if (!isNaN(fromDate)) {
        asistencias = asistencias.filter((a) => {
          const occ = new Date(a.occurrenceDate).getTime();
          return !isNaN(occ) && occ >= fromDate;
        });
      }
    }

    if (filtros.occurrenceDateTo && filtros.occurrenceDateTo.trim()) {
      const toStr =
        filtros.occurrenceDateTo.length === 10
          ? `${filtros.occurrenceDateTo} 23:59:59`
          : filtros.occurrenceDateTo;
      const toDate = new Date(toStr).getTime();
      if (!isNaN(toDate)) {
        asistencias = asistencias.filter((a) => {
          const occ = new Date(a.occurrenceDate).getTime();
          return !isNaN(occ) && occ <= toDate;
        });
      }
    }

    // Ordenar por fecha de ocurrencia descendente (más recientes primero)
    asistencias.sort((a, b) => {
      const tA = new Date(a.occurrenceDate).getTime() || 0;
      const tB = new Date(b.occurrenceDate).getTime() || 0;
      return tB - tA;
    });

    // 7. Paginación
    const totalElements = asistencias.length;
    const pageSize = Math.max(1, Number(filtros.pageSize) || 10);
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const pageNumber = Math.max(1, Math.min(Number(filtros.pageNumber) || 1, totalPages));

    const offset = (pageNumber - 1) * pageSize;
    const content = asistencias.slice(offset, offset + pageSize);

    return {
      content,
      totalPages,
      totalElements,
      pageNumber,
      pageSize,
    };
  }

  private static inMemoryCache: Map<string, Record<string, unknown[]>> = new Map();

  private getMockPath(): string {
    return path.resolve(
      __dirname,
      '..',
      'mocks',
      `${this.sponsorId}.mock.json`
    );
  }

  private loadMockData(): Record<string, unknown[]> {
    if (MockAsistenciasClient.inMemoryCache.has(this.sponsorId)) {
      return MockAsistenciasClient.inMemoryCache.get(this.sponsorId)!;
    }

    const mockPath = this.getMockPath();

    if (!fs.existsSync(mockPath)) {
      console.warn(`[MockAsistenciasClient] No se encontró archivo de mocks: ${mockPath}`);
      const empty = { polizas: [], asistencias: [] };
      MockAsistenciasClient.inMemoryCache.set(this.sponsorId, empty);
      return empty;
    }

    try {
      const raw = fs.readFileSync(mockPath, 'utf-8');
      const parsed = JSON.parse(raw);
      MockAsistenciasClient.inMemoryCache.set(this.sponsorId, parsed);
      return parsed;
    } catch {
      const empty = { polizas: [], asistencias: [] };
      MockAsistenciasClient.inMemoryCache.set(this.sponsorId, empty);
      return empty;
    }
  }

  private saveMockData(data: Record<string, unknown[]>): void {
    // Almacenar en memoria para no disparar reinicios del watcher de tsx ni Vite
    MockAsistenciasClient.inMemoryCache.set(this.sponsorId, data);
  }
}
