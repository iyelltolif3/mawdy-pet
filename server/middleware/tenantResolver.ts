import type { Request, Response, NextFunction } from 'express';
import { getTenantConfig } from '../tenants/registry';
import type { TenantConfig } from '../tenants/types';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantConfig;
      isAdminDomain?: boolean;
      isSuspended?: boolean;
    }
  }
}

/**
 * Middleware de resolución de tenant.
 *
 * Estrategia de resolución (en orden de prioridad):
 * 1. Query param `?sponsor=xxx` (fallback para desarrollo / pruebas)
 * 2. Subdominio del header Host (ej. "consalud" de "consalud.mawdypet.cl"
 *    o "consalud" de "consalud.localhost:5173")
 *
 * Si no se puede resolver el tenant, responde 404.
 */
export function tenantResolver(req: Request, res: Response, next: NextFunction): void {
  // 1. Query param override
  const sponsorParam = req.query.sponsor as string | undefined;

  // 2. Extraer subdominio del Host header
  const host = req.headers.host || '';
  const hostname = host.split(':')[0]; // quitar puerto
  const subdomain = extractSubdomain(hostname);
  const sponsorId = sponsorParam || subdomain;

  const isInternalAdmin = subdomain === 'admin' || req.path.startsWith('/admin') || req.path.startsWith('/api/admin');
  req.isAdminDomain = subdomain === 'admin' || isInternalAdmin;

  // Rutas administrativas o subdominio admin.localhost
  if (isInternalAdmin) {
    if (sponsorId && sponsorId !== 'admin') {
      req.tenant = getTenantConfig(sponsorId);
    }
    next();
    return;
  }

  // Si no se especificó subdominio ni query param (ej. acceso directo a localhost), usar mawdypet como fallback canónico
  const effectiveSponsorId = sponsorId && sponsorId !== 'admin' ? sponsorId : 'mawdypet';

  const config = getTenantConfig(effectiveSponsorId);

  if (!config) {
    res.status(404).json({
      error: `Sponsor "${effectiveSponsorId}" no encontrado`,
      detail: `No existe configuración para el sponsor "${effectiveSponsorId}". Verifica que exista el archivo server/tenants/${effectiveSponsorId}.json`,
    });
    return;
  }

  req.tenant = config;

  // Manejo de sponsor inactivo o suspendido
  if (config.activo === false && !isInternalAdmin) {
    req.isSuspended = true;
    // Bloquear acciones de cartera o asistencias si el sponsor está suspendido
    if (!req.path.endsWith('/tenant') && !req.path.includes('manifest')) {
      res.status(423).json({
        error: 'Sponsor suspendido',
        detail: `El acceso a las asistencias y coberturas de ${config.nombreVisible} se encuentra temporalmente suspendido. Contacta al soporte de tu aseguradora.`,
        suspendido: true,
      });
      return;
    }
  }

  next();
}

/**
 * Extrae el subdominio de un hostname.
 *
 * Ejemplos:
 *   "consalud.mawdypet.cl"     → "consalud"
 *   "consalud.localhost"        → "consalud"
 *   "zurichsantander.localhost" → "zurichsantander"
 *   "localhost"                 → null
 *   "mawdypet.cl"              → null
 */
function extractSubdomain(hostname: string): string | null {
  // Para desarrollo local: xxx.localhost
  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '');
    return sub || null;
  }

  // Para producción: xxx.mawdypet.cl (o cualquier dominio con al menos 3 partes)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}
