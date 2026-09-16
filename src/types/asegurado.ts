/**
 * Asegurado — Alineado a Insured / InsuredDetail del Swagger de API Business.
 *
 * Campos obligatorios corresponden a los que siempre llegan en la respuesta
 * de búsqueda de cartera. Los opcionales dependen de la completitud de datos
 * del sponsor.
 */
export interface Asegurado {
  /** ID interno en API Business */
  insuredId: number;

  /** Contrato de negocio al que pertenece */
  businessContractId: string;

  /** Nombre de pila */
  name: string;

  /** Apellidos */
  lastName: string;

  /** Documento de identidad (RUT, DNI, etc.) */
  idNum: string;

  /** Número de póliza */
  policy: string;

  /** Dirección del asegurado */
  address: string;

  /** Provincia / Región */
  province?: string;

  /** Localidad / Comuna */
  locality?: string;

  /** Código postal */
  postalCode?: string;

  /** Código de país ISO 3166-1 alfa-2 (ej. "CL", "ES") */
  countryCd?: string;

  /** Edad del asegurado */
  age?: number;

  /** Correo electrónico */
  email?: string;

  /** Teléfono de contacto */
  phone?: string;
}
