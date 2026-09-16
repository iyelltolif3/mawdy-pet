/**
 * Colores del tema visual de un tenant.
 * Se inyectan como CSS custom properties para que Tailwind los consuma.
 */
export interface TenantThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
}

/**
 * Íconos del sponsor para la PWA (192x192, 512x512 y maskable).
 */
export interface TenantIcons {
  icon192?: string;
  icon512?: string;
  maskable?: string;
}

/**
 * Configuración específica para la personalización de la Ficha de Mascota & Carnet Digital.
 * Permite a cada sponsor (y asegurado) definir cómo se presenta la credencial y qué módulos mostrar.
 */
export interface FichaMascotaConfig {
  /** Lema o subtítulo del carnet (ej. "Carnet Digital de Mascota Asegurada", "Plan Platinum Pet") */
  lema?: string;
  /** Estilo visual del carnet digital */
  estiloTarjeta?: 'linen' | 'brand-gradient' | 'minimal';
  /** Activa o desactiva la marca de agua del sello PetBrandSeal en la credencial */
  mostrarSelloWatermark?: boolean;
  /** Mostrar módulo de Microchip Oficial y Registro Subdere */
  mostrarMicrochip?: boolean;
  /** Mostrar módulo de Vacunas y Desparasitación */
  mostrarVacunas?: boolean;
  /** Mostrar módulo de Alergias y Condiciones Médicas */
  mostrarAlergias?: boolean;
  /** Mostrar módulo de Contacto de Emergencia / Veterinario de Cabecera */
  mostrarVeterinario?: boolean;
  /** Mostrar desglose de Coberturas Destacadas del convenio */
  mostrarCoberturas?: boolean;
  /** Mensaje de asistencia o urgencias al pie del carnet */
  mensajeAsistencia?: string;
}

export interface ServicioCobertura {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  codigoServicio: string;
  codigoGarantia: string;
  limiteEventos?: string;
  copagoOTope?: string;
  activo: boolean;
}

export interface ProductoAmaConfig {
  productoId: string;
  codigoProductoAma?: string;
  nombreProducto: string;
  polizaColectiva?: string;
  colectivoPolizaMarco?: string;
  lineaAsistencia?: string;
  servicios: ServicioCobertura[];
}

/**
 * Tema visual completo de un tenant.
 */
export interface TenantTheme {
  /** URL del logotipo del sponsor */
  logoUrl: string;

  /** URL del banner de cabecera PWA (MIA) */
  bannerUrl?: string;

  /** Fuente tipográfica principal de marca (Google Fonts, ej: 'DM Sans', 'Plus Jakarta Sans', 'Inter') */
  fuente?: string;

  /** Íconos específicos del sponsor para la PWA */
  iconos?: TenantIcons;

  /** Paleta de colores */
  colores: TenantThemeColors;

  /** Configuración de personalización para la ficha y carnet de la mascota */
  fichaMascota?: FichaMascotaConfig;
}

/**
 * Credenciales de acceso a API Business para un tenant.
 *
 * ⚠️  NUNCA almacenar secretos directamente aquí.
 *     clientIdEnvVar / clientSecretEnvVar guardan solo el NOMBRE
 *     de la variable de entorno donde vive el secreto real.
 */
export interface TenantCredenciales {
  /** ID del cliente de negocio en API Business */
  businessClientId: string;

  /** Nombre de la env var que contiene el Client ID de OAuth */
  clientIdEnvVar: string;

  /** Nombre de la env var que contiene el Client Secret de OAuth */
  clientSecretEnvVar: string;
}

/**
 * TenantConfig — Configuración completa de un sponsor.
 *
 * Cada sponsor tiene su propio archivo JSON en server/tenants/.
 * El middleware de resolución de tenant carga esta config según
 * el subdominio de la petición.
 */
export interface TenantConfig {
  /** Identificador único del sponsor (ej. "consalud") */
  sponsorId: string;

  /** Subdominio asignado (ej. "consalud" → consalud.mawdypet.cl) */
  subdominio: string;

  /** Nombre visible en la UI */
  nombreVisible: string;

  /**
   * Código de país ISO 3166-1 alfa-2.
   * Obligatorio en cada llamada a API Business.
   */
  countryId: string;

  /** Modo de operación: pre-productivo (datos sintéticos) o productivo (API Business) */
  modo: 'mock' | 'real' | 'preproductivo' | 'productivo';

  /** Estado operativo: activo (true) o suspendido (false) */
  activo?: boolean;

  /** Identificador o nombre del último operador que modificó este sponsor */
  lastModifiedBy?: string;

  /** Marca de tiempo ISO de la última modificación */
  lastModifiedAt?: string;

  /** Tema visual */
  tema: TenantTheme;

  /** Credenciales de API Business */
  credenciales: TenantCredenciales;

  /** Configuración del Producto AMA y catálogo de coberturas */
  productoAma?: ProductoAmaConfig;
}
