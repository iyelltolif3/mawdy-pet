import React, { createContext, useEffect, useState } from 'react';
import { fetchTenantInfo, type TenantPublicInfo } from '../../api/tenant';

interface TenantContextValue {
  tenant: TenantPublicInfo | null;
  loading: boolean;
  error: string | null;
  setTenantLocally: (info: TenantPublicInfo) => void;
  reloadTenant: () => Promise<void>;
}

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  loading: true,
  error: null,
  setTenantLocally: () => {},
  reloadTenant: async () => {},
});

/**
 * TenantProvider — Carga la config del tenant al montar y aplica las
 * CSS custom properties al :root para que Tailwind las consuma.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const info = await fetchTenantInfo();
      setTenant(info);
      applyThemeVariables(info);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, []);

  const setTenantLocally = (newInfo: TenantPublicInfo) => {
    setTenant(newInfo);
    applyThemeVariables(newInfo);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        setTenantLocally,
        reloadTenant: loadTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Inyecta las variables CSS del tenant al :root para que Tailwind
 * y los componentes las usen, respetando los tokens fijos de estado.
 */
function applyThemeVariables(info: TenantPublicInfo) {
  const root = document.documentElement;
  const c = info.tema.colores;

  // Variables específicas del tenant
  root.style.setProperty('--tenant-primary', c.primary);
  root.style.setProperty('--tenant-secondary', c.secondary);
  root.style.setProperty('--tenant-accent', c.accent);
  root.style.setProperty('--tenant-background', c.background);
  root.style.setProperty('--tenant-surface', c.surface);
  root.style.setProperty('--tenant-foreground', c.foreground);

  // Variables directas para Tailwind y componentes
  root.style.setProperty('--color-primary', c.primary);
  root.style.setProperty('--color-secondary', c.secondary);
  root.style.setProperty('--color-accent', c.accent);
  root.style.setProperty('--color-background', c.background);
  root.style.setProperty('--color-surface', c.surface);
  root.style.setProperty('--color-foreground', c.foreground);

  // Aplicar fondo y color base al body
  document.body.style.backgroundColor = c.background;
  document.body.style.color = c.foreground;

  // Aplicar fuente tipográfica configurada por el sponsor
  const fuente = info.tema.fuente || 'Plus Jakarta Sans';
  root.style.setProperty('--tenant-font', `'${fuente}', system-ui, -apple-system, sans-serif`);
  root.style.setProperty('--tenant-font-headline', `'${fuente}', system-ui, -apple-system, sans-serif`);
  document.body.style.fontFamily = `'${fuente}', system-ui, -apple-system, sans-serif`;

  // Asegurar que la fuente de Google Fonts esté inyectada
  ensureGoogleFontLoaded(fuente);

  // Actualizar meta theme-color para navegadores móviles y PWA
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', c.primary);

  // Actualizar el título del navegador según la regla de marca principal
  const isFallback = !info.nombreVisible || info.sponsorId === 'admin' || info.sponsorId === 'mawdy';
  document.title = isFallback ? 'Mawdy Pet' : `${info.nombreVisible} Pet`;

  // Actualizar favicon con el logo del sponsor si existe, o fallback oficial
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.href = info.tema.logoUrl || '/logos/mawdy.svg';
  }

  // Sincronizar link del manifest con el sponsor activo
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (manifestLink) {
    const params = new URLSearchParams(window.location.search);
    const sponsorParam = params.get('sponsor');
    manifestLink.href = sponsorParam ? `/manifest.json?sponsor=${sponsorParam}` : '/manifest.json';
  }
}

/**
 * Inyecta dinámicamente un <link> para cargar cualquier fuente de Google Fonts
 * elegida por el administrador del sponsor.
 */
function ensureGoogleFontLoaded(fontName: string) {
  if (typeof document === 'undefined') return;
  const id = `gfont-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;

  const fontUrlParam = fontName.replace(/\s+/g, '+');
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontUrlParam}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}


