import type { TenantPublicInfo, TenantCredencialesStatus } from './tenant';

const API_BASE = '/api/admin';
const TOKEN_STORAGE_KEY = 'mawdy_admin_token';
const USER_STORAGE_KEY = 'mawdy_admin_user';

export interface AdminUser {
  username: string;
  role: 'super-admin' | 'sponsor-admin';
  loginAt?: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  message?: string;
  error?: string;
  latencyMs?: number;
  timestamp?: string;
  credenciales: TenantCredencialesStatus;
}

/**
 * Obtiene el token administrativo actual de almacenamiento local.
 */
export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Obtiene el perfil del usuario administrador en sesión.
 */
export function getAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica si hay una sesión administrativa activa.
 */
export function isAuthenticatedAdmin(): boolean {
  return Boolean(getAdminToken());
}

/**
 * Headers estándar con token de autorización Bearer.
 */
function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-admin-token'] = token;
  }
  return headers;
}

/**
 * Inicia sesión en la consola de administración.
 *
 * TODO: Reemplazar autenticación unificada por RBAC completo
 * (Super-Admin global vs. Admin delegado por Sponsor con scopes limitados)
 */
export async function loginAdmin(username: string, password: string): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Usuario o contraseña incorrectos.');
  }

  const data = await res.json();
  const token = data.token;
  const user = data.user as AdminUser;

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

  return user;
}

/**
 * Cierra la sesión administrativa activa.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Ignorar fallos de red al cerrar sesión
  } finally {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Obtiene la lista de todos los sponsors configurados en la plataforma.
 */
export async function listarSponsorsAdmin(): Promise<TenantPublicInfo[]> {
  const res = await fetch(`${API_BASE}/tenants`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al listar sponsors (${res.status})`);
  }
  const data = await res.json();
  return data.tenants as TenantPublicInfo[];
}

/**
 * Actualiza la configuración visual (colores, logo, fuente, nombre) de un sponsor en el backend.
 */
export async function actualizarSponsorAdmin(
  sponsorId: string,
  updates: Partial<TenantPublicInfo>
): Promise<{ success: boolean; message: string; tenant: TenantPublicInfo }> {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(sponsorId)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al actualizar sponsor (${res.status})`);
  }

  return res.json();
}

/**
 * Cambia el estado de activación/suspensión de un sponsor sin borrar sus datos.
 */
export async function cambiarEstadoSponsorAdmin(
  sponsorId: string,
  activo: boolean,
  modifiedBy?: string
): Promise<{ success: boolean; message: string; tenant: TenantPublicInfo }> {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(sponsorId)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ activo, modifiedBy }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al cambiar estado del sponsor (${res.status})`);
  }

  return res.json();
}

/**
 * Prueba la conexión segura con API Business OAuth2 (Cognito) sin exponer credenciales.
 */
export async function testConnectionAdmin(sponsorId: string): Promise<ConnectionTestResult> {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(sponsorId)}/test-connection`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Fallo al probar conexión (${res.status})`);
  }

  return data as ConnectionTestResult;
}

/**
 * Registra un nuevo sponsor en la plataforma con su configuración visual y cartera mock automática.
 */
export async function crearSponsorAdmin(
  newSponsor: {
    sponsorId: string;
    subdominio?: string;
    nombreVisible: string;
    countryId?: string;
    modo?: 'mock' | 'real';
    modifiedBy?: string;
    tema?: {
      logoUrl?: string;
      fuente?: string;
      colores?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        surface?: string;
        foreground?: string;
      };
    };
  }
): Promise<{ success: boolean; message: string; tenant: TenantPublicInfo }> {
  const res = await fetch(`${API_BASE}/tenants`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newSponsor),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al crear sponsor (${res.status})`);
  }

  return res.json();
}

/**
 * Sube un archivo de logotipo oficial (PNG o SVG) para un sponsor y retorna su URL estática.
 */
export async function subirLogoAdmin(
  sponsorId: string,
  file: File
): Promise<{ success: boolean; url: string; format: string; message: string }> {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (!isPng && !isSvg) {
    throw new Error('Solo se permiten archivos en formato PNG o SVG.');
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch(`${API_BASE}/upload-logo`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      sponsorId,
      filename: file.name,
      mimeType: file.type || (isSvg ? 'image/svg+xml' : 'image/png'),
      base64Data,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al subir el logo (${res.status})`);
  }

  return res.json();
}

/**
 * Sube un archivo de banner de cabecera PWA (JPG, PNG, WEBP) para un sponsor y retorna su URL estática.
 */
export async function subirBannerAdmin(
  sponsorId: string,
  file: File
): Promise<{ success: boolean; url: string; message: string }> {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  const extValid = /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!allowed.includes(file.type) && !extValid) {
    throw new Error('Solo se permiten imágenes en formato JPG, PNG o WEBP para el banner.');
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo de banner seleccionado.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch(`${API_BASE}/upload-banner`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      sponsorId,
      filename: file.name,
      mimeType: file.type || 'image/jpeg',
      base64Data,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al subir el banner (${res.status})`);
  }

  return res.json();
}

/**
 * Elimina permanentemente un sponsor y su configuración tras validación de confirmación.
 */
export async function eliminarSponsorAdmin(
  sponsorId: string,
  confirmationText: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(sponsorId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ confirmationText }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error al eliminar el sponsor (${res.status})`);
  }

  return data;
}


