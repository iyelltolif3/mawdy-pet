import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../features/tenant/useTenant';
import { useInsuredAuth } from '../features/auth/InsuredAuthContext';
import { buscarCartera } from '../api/cartera';
import type { Poliza } from '../types/poliza';
import type { Mascota } from '../types/mascota';

export function useActivePet() {
  const { tenant } = useTenant();
  const { user, polizas: authPolizas } = useInsuredAuth();
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [activeRiesgoId, setActiveRiesgoIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sponsorId = tenant?.sponsorId;

  const syncActivePet = useCallback((availablePolizas: Poliza[]) => {
    if (!sponsorId) return;
    if (availablePolizas.length > 0) {
      const storageKey = `active_pet_${sponsorId}`;
      const savedId = localStorage.getItem(storageKey);
      const exists = availablePolizas.some((p) => p.mascota.riesgoId === savedId);

      if (savedId && exists) {
        setActiveRiesgoIdState(savedId);
      } else {
        const defaultId = availablePolizas[0].mascota.riesgoId;
        setActiveRiesgoIdState(defaultId);
        localStorage.setItem(storageKey, defaultId);
      }
    } else {
      setActiveRiesgoIdState(null);
    }
  }, [sponsorId]);

  const loadCartera = useCallback(async () => {
    if (!sponsorId) return;

    // Si el usuario está autenticado, sus pólizas ya están filtradas en el contexto
    if (user && authPolizas.length > 0) {
      setPolizas(authPolizas);
      syncActivePet(authPolizas);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await buscarCartera(user ? { idNum: user.rut } : {});
      setPolizas(data);
      syncActivePet(data);
    } catch (err) {
      console.error('[useActivePet] Error al cargar cartera:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar mascotas');
    } finally {
      setLoading(false);
    }
  }, [sponsorId, user, authPolizas, syncActivePet]);

  useEffect(() => {
    loadCartera();
  }, [loadCartera]);

  const setActiveRiesgoId = useCallback((riesgoId: string) => {
    setActiveRiesgoIdState((prev) => (prev === riesgoId ? prev : riesgoId));
    if (sponsorId) {
      localStorage.setItem(`active_pet_${sponsorId}`, riesgoId);
    }
  }, [sponsorId]);

  const activePoliza = polizas.find((p) => p.mascota.riesgoId === activeRiesgoId) || polizas[0] || null;
  const activeMascota: Mascota | null = activePoliza ? activePoliza.mascota : null;

  return {
    polizas,
    activePoliza,
    activeMascota,
    activeRiesgoId: activeMascota ? activeMascota.riesgoId : null,
    setActiveRiesgoId,
    loading,
    error,
    refresh: loadCartera,
  };
}
