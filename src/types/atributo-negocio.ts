import type { Mascota } from './mascota';

/**
 * AtributoNegocio — Representa un par clave/valor del arreglo `attributes[]`
 * genérico de API Business.
 *
 * API Business usa este mecanismo para datos extendidos que no tienen campo
 * propio en el modelo estándar (ej. datos de la mascota).
 */
export interface AtributoNegocio {
  /** Código del atributo de negocio (ej. "MASCOTA_ESPECIE") */
  businessAttributeCd: string;

  /** Valor del atributo como string */
  value: string;
}

/**
 * Convierte un objeto Mascota al formato `attributes[]` de API Business.
 *
 * TODO: ⚠️ REEMPLAZAR LOS businessAttributeCd POR LOS CÓDIGOS REALES
 * QUE ENTREGUE MAWDY. Los valores actuales ("MASCOTA_ESPECIE",
 * "MASCOTA_RAZA", etc.) son placeholders de desarrollo.
 *
 * @param mascota - Datos de la mascota a convertir
 * @returns Array de AtributoNegocio listo para enviar a la API
 */
export function mapMascotaAAtributos(mascota: Mascota): AtributoNegocio[] {
  // TODO: ⚠️ REEMPLAZAR por los businessAttributeCd reales que entregue Mawdy
  const atributos: AtributoNegocio[] = [
    { businessAttributeCd: 'MASCOTA_NOMBRE', value: mascota.nombre },
    { businessAttributeCd: 'MASCOTA_ESPECIE', value: mascota.especie },
    { businessAttributeCd: 'MASCOTA_RAZA', value: mascota.raza },
    { businessAttributeCd: 'MASCOTA_SEXO', value: mascota.sexo },
    { businessAttributeCd: 'MASCOTA_PESO_KG', value: String(mascota.pesoKg) },
    { businessAttributeCd: 'MASCOTA_COLOR_SENAS', value: mascota.colorSenasParticulares },
  ];

  if (mascota.fechaNacimiento) {
    atributos.push({
      businessAttributeCd: 'MASCOTA_FECHA_NACIMIENTO',
      value: mascota.fechaNacimiento,
    });
  }

  if (mascota.edadEstimada !== undefined) {
    atributos.push({
      businessAttributeCd: 'MASCOTA_EDAD_ESTIMADA',
      value: String(mascota.edadEstimada),
    });
  }

  if (mascota.microchip) {
    atributos.push({
      businessAttributeCd: 'MASCOTA_MICROCHIP',
      value: mascota.microchip,
    });
  }

  if (mascota.riesgoId) {
    atributos.push({
      businessAttributeCd: 'MASCOTA_RIESGO_ID',
      value: mascota.riesgoId,
    });
  }

  return atributos;
}
