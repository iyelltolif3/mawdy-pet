import { useContext } from 'react';
import { TenantContext } from './TenantContext';

/**
 * Hook para acceder a la config del tenant activo.
 *
 * Uso:
 *   const { tenant, loading, error } = useTenant();
 */
export function useTenant() {
  return useContext(TenantContext);
}
