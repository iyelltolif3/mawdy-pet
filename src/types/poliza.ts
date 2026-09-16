import type { Asegurado } from './asegurado';
import type { Mascota } from './mascota';

/**
 * Póliza — Agrupa un asegurado con su mascota bajo un número de póliza.
 *
 * Es la unidad principal de búsqueda en la cartera: el operador busca
 * por RUT o número de póliza y obtiene este objeto como resultado.
 */
export interface Poliza {
  /** Número de póliza */
  numeroPoliza: string;

  /** ID del sponsor al que pertenece la póliza */
  sponsorId: string;

  /** Contrato de negocio en API Business */
  businessContractId: string;

  /** Estado vigente de la póliza */
  estado: 'activa' | 'inactiva' | 'vencida';

  /** Datos del asegurado (titular) */
  asegurado: Asegurado;

  /** Datos de la mascota asegurada */
  mascota: Mascota;
}
