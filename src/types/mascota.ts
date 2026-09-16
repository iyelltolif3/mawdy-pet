/**
 * Mascota — Modelo propio de Mawdy Pet.
 *
 * ⚠️  Este modelo NO tiene respaldo confirmado en el Swagger de API Business.
 *     En la API real los datos de la mascota se envían como `attributes[]`
 *     (pares businessAttributeCd / value). Ver `mapMascotaAAtributos()` en
 *     src/types/atributo-negocio.ts para la conversión.
 */
export interface Mascota {
  /** Identificador del riesgo asegurado (asignado por la póliza) */
  riesgoId: string;

  /** Nombre de la mascota */
  nombre: string;

  /** Especie */
  especie: 'perro' | 'gato' | 'otro';

  /** Raza */
  raza: string;

  /**
   * Fecha de nacimiento en formato ISO (YYYY-MM-DD).
   * Si no se conoce la fecha exacta, se puede usar `edadEstimada`.
   */
  fechaNacimiento?: string;

  /**
   * Edad estimada en años. Se usa como alternativa cuando
   * no hay fecha de nacimiento exacta.
   */
  edadEstimada?: number;

  /** Sexo de la mascota */
  sexo: 'macho' | 'hembra';

  /** Peso en kilogramos */
  pesoKg: number;

  /** Color y señas particulares en texto libre */
  colorSenasParticulares: string;

  /** Número de microchip (si tiene) */
  microchip?: string;

  /** URL de foto de la mascota (si hay) */
  fotoUrl?: string;
}
