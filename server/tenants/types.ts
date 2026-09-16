/**
 * TenantConfig server-side type.
 * Mirrors src/types/tenant.ts but kept separate to avoid
 * cross-imports between server and frontend.
 */
export interface TenantThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
}

export interface TenantIcons {
  icon192?: string;
  icon512?: string;
  maskable?: string;
}

export interface FichaMascotaConfig {
  lema?: string;
  estiloTarjeta?: 'linen' | 'brand-gradient' | 'minimal';
  mostrarSelloWatermark?: boolean;
  mostrarMicrochip?: boolean;
  mostrarVacunas?: boolean;
  mostrarAlergias?: boolean;
  mostrarVeterinario?: boolean;
  mostrarCoberturas?: boolean;
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

export interface TenantTheme {
  logoUrl: string;
  bannerUrl?: string;
  fuente?: string;
  iconos?: TenantIcons;
  colores: TenantThemeColors;
  fichaMascota?: FichaMascotaConfig;
}

export interface TenantCredenciales {
  businessClientId: string;
  clientIdEnvVar: string;
  clientSecretEnvVar: string;
}

export interface TenantConfig {
  sponsorId: string;
  subdominio: string;
  nombreVisible: string;
  countryId: string;
  modo: 'mock' | 'real' | 'preproductivo' | 'productivo';
  activo?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  tema: TenantTheme;
  credenciales: TenantCredenciales;
  productoAma?: ProductoAmaConfig;
}

export interface TenantAdminUpdatePayload {
  nombreVisible?: string;
  subdominio?: string;
  countryId?: string;
  modo?: 'mock' | 'real' | 'preproductivo' | 'productivo';
  activo?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  tema?: {
    logoUrl?: string;
    bannerUrl?: string;
    fuente?: string;
    iconos?: TenantIcons;
    colores?: Partial<TenantThemeColors>;
    fichaMascota?: Partial<FichaMascotaConfig>;
  };
  credenciales?: Partial<TenantCredenciales>;
  productoAma?: Partial<ProductoAmaConfig>;
}


