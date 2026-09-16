const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Wrapper de fetch para llamadas al backend.
 *
 * - En desarrollo, el proxy de Vite redirige /api → backend (localhost:3001)
 * - Incluye el sponsor como query param de respaldo si la URL no tiene ya
 *   un subdominio resuelto (útil para pruebas directas)
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let fullEndpoint = endpoint;
  if (typeof window !== 'undefined' && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    const sponsor = urlParams.get('sponsor');
    if (sponsor && !fullEndpoint.includes('sponsor=')) {
      const sep = fullEndpoint.includes('?') ? '&' : '?';
      fullEndpoint = `${fullEndpoint}${sep}sponsor=${encodeURIComponent(sponsor)}`;
    }
  }

  const url = `${API_BASE}${fullEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body.error || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (err: any) {
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('NetworkError'))) {
      throw new Error(
        'No fue posible establecer conexión con el servidor local. Por favor verifica que el backend esté ejecutándose o actualiza la página.'
      );
    }
    throw err;
  }
}

