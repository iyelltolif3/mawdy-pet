import { useTenant } from './useTenant';
import type { TenantPublicInfo } from '../../api/tenant';

export interface TenantBrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
}

export interface TenantBranding {
  logo: string;
  logoAlt: string;
  brandName: string;
  shortName: string;
  colors: TenantBrandingColors;
  isFallbackBrand: boolean;
  serviceNetworkName: string;
  policyPlanName: string;
  copayLabel: string;
}

const DEFAULT_MAWDY_COLORS: TenantBrandingColors = {
  primary: '#006194',
  secondary: '#004b73',
  accent: '#007bb9',
  background: '#fbf9f5',
  surface: '#ffffff',
  foreground: '#1c1917',
};

const DEFAULT_MAWDY_LOGO = '/logos/mawdy.svg';

/**
 * Resuelve la identidad de marca para el tenant activo.
 *
 * REGLA PRINCIPAL:
 * 1. Si el tenant tiene sponsor y logo válido:
 *    - El sponsor es la marca visual única y dominante.
 *    - Logo, nombre y colores pertenecen al sponsor.
 * 2. Si el tenant no tiene branding o falta logo:
 *    - Se utiliza Mawdy como fallback transparente y profesional.
 */
export function getTenantBranding(tenant?: TenantPublicInfo | null): TenantBranding {
  // Caso 1: Sin tenant o modo de administración
  if (!tenant || tenant.sponsorId === 'admin') {
    return {
      logo: DEFAULT_MAWDY_LOGO,
      logoAlt: 'Mawdy Pet',
      brandName: 'Mawdy Pet',
      shortName: 'Mawdy',
      colors: tenant?.tema?.colores || DEFAULT_MAWDY_COLORS,
      isFallbackBrand: true,
      serviceNetworkName: 'Red de Asistencia Preferente',
      policyPlanName: 'Plan de Asistencia Pet',
      copayLabel: '$0 en Red Preferente',
    };
  }

  // Caso 2: Sponsor configurado
  const hasValidLogo = Boolean(tenant.tema?.logoUrl && tenant.tema.logoUrl.trim().length > 0);
  const logo = hasValidLogo ? tenant.tema.logoUrl : DEFAULT_MAWDY_LOGO;
  const shortName = tenant.nombreVisible.trim();
  const brandName = `${shortName} Pet`;

  return {
    logo,
    logoAlt: shortName,
    brandName,
    shortName,
    colors: tenant.tema?.colores || DEFAULT_MAWDY_COLORS,
    isFallbackBrand: !hasValidLogo,
    serviceNetworkName: `Red de Asistencia ${shortName}`,
    policyPlanName: `Plan ${shortName} Pet`,
    copayLabel: `$0 en Red ${shortName}`,
  };
}

/**
 * Hook reutilizable para obtener el branding dinámico en cualquier componente.
 */
export function useTenantBranding(): TenantBranding {
  const { tenant } = useTenant();
  return getTenantBranding(tenant);
}
