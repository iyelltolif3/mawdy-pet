import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  ICarteraClient,
  BuscarAseguradosCriterio,
  Poliza,
} from './interfaces';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MockCarteraClient — Lee pólizas del archivo de mocks del tenant activo.
 *
 * Busca en server/mocks/<sponsorId>.mock.json y filtra en memoria
 * según el criterio recibido.
 */
export class MockCarteraClient implements ICarteraClient {
  private sponsorId: string;

  constructor(sponsorId: string) {
    this.sponsorId = sponsorId;
  }

  async buscarAsegurados(criterio: BuscarAseguradosCriterio): Promise<Poliza[]> {
    const data = this.loadMockData();
    let polizas: Poliza[] = data.polizas || [];

    // Filtrar por RUT/documento
    if (criterio.idNum) {
      const search = criterio.idNum.toLowerCase().replace(/\./g, '');
      polizas = polizas.filter((p) =>
        p.asegurado.idNum.toLowerCase().replace(/\./g, '').includes(search)
      );
    }

    // Filtrar por número de póliza
    if (criterio.policy) {
      const search = criterio.policy.toLowerCase().trim();
      polizas = polizas.filter((p) =>
        p.numeroPoliza.toLowerCase().includes(search)
      );
    }

    // Filtrar por teléfono (limpiando espacios, +, guiones)
    if (criterio.phone) {
      const cleanSearch = criterio.phone.replace(/[\s\+\-\(\)]/g, '');
      polizas = polizas.filter((p) => {
        const cleanPhone = (p.asegurado.phone || '').replace(/[\s\+\-\(\)]/g, '');
        return cleanPhone.includes(cleanSearch);
      });
    }

    // Filtrar por nombre (parcial, case-insensitive)
    if (criterio.nombre) {
      const search = criterio.nombre.toLowerCase().trim();
      polizas = polizas.filter((p) => {
        const fullName = `${p.asegurado.name} ${p.asegurado.lastName}`.toLowerCase();
        return fullName.includes(search);
      });
    }

    return polizas;
  }

  async obtenerPorRiesgoId(riesgoId: string): Promise<Poliza | null> {
    const data = this.loadMockData();
    const polizas: Poliza[] = data.polizas || [];
    const norm = (id: string) => id.toLowerCase().replace(/[-_]/g, '');
    const target = polizas.find((p) => norm(p.mascota.riesgoId) === norm(riesgoId));
    return target || null;
  }

  private loadMockData(): { polizas: Poliza[] } {

    const mockPath = path.resolve(
      __dirname,
      '..',
      'mocks',
      `${this.sponsorId}.mock.json`
    );

    if (!fs.existsSync(mockPath)) {
      console.warn(`[MockCarteraClient] No se encontró archivo de mocks: ${mockPath}`);
      return { polizas: [] };
    }

    const raw = fs.readFileSync(mockPath, 'utf-8');
    return JSON.parse(raw);
  }
}
