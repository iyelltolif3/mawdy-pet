import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTenant } from '../tenant/useTenant';
import { buscarCartera } from '../../api/cartera';
import type { Poliza } from '../../types/poliza';

export interface InsuredUser {
  rut: string;
  nombre: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  numeroPoliza: string;
  sponsorId: string;
}

interface InsuredAuthContextType {
  user: InsuredUser | null;
  polizas: Poliza[];
  loading: boolean;
  login: (rut: string, password?: string) => Promise<boolean>;
  logout: () => void;
  refreshCartera: () => Promise<void>;
}

const InsuredAuthContext = createContext<InsuredAuthContextType>({
  user: null,
  polizas: [],
  loading: true,
  login: async () => false,
  logout: () => {},
  refreshCartera: async () => {},
});

export function InsuredAuthProvider({ children }: { children: React.ReactNode }) {
  const { tenant, loading: loadingTenant } = useTenant();
  const sponsorId = tenant?.sponsorId;

  const [user, setUser] = useState<InsuredUser | null>(() => {
    try {
      // Intento sincrónico de restaurar usuario para evitar redirecciones indeseadas a /login
      const keys = Object.keys(localStorage);
      const insuredKey = keys.find((k) => k.startsWith('mawdy_insured_'));
      if (insuredKey) {
        const raw = localStorage.getItem(insuredKey);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Ignorar error de parsing en inicialización
    }
    return null;
  });

  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  const restoreSession = useCallback(async () => {
    if (loadingTenant) return;
    if (!sponsorId) {
      setLoading(false);
      return;
    }

    const storageKey = `mawdy_insured_${sponsorId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed: InsuredUser = JSON.parse(saved);
        setUser(parsed);

        // Verificar y sincronizar pólizas activas en cartera
        const result = await buscarCartera({ idNum: parsed.rut });
        if (result && result.length > 0) {
          setUser(parsed);
          setPolizas(result);
        }
      } catch (e) {
        console.warn('[InsuredAuth] Error al verificar cartera en servidor:', e);
        // Preservar la sesión local si se tratara de un microcorte de red
      }
    } else {
      setUser(null);
      setPolizas([]);
    }
    setLoading(false);
  }, [sponsorId, loadingTenant]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (rawRut: string, _password?: string): Promise<boolean> => {
    if (!sponsorId) return false;

    // Normalizar RUT quitando espacios
    const cleanRut = rawRut.trim();
    if (!cleanRut) throw new Error('Debes ingresar tu RUT de asegurado.');

    const polizasEncontradas = await buscarCartera({ idNum: cleanRut });

    if (!polizasEncontradas || polizasEncontradas.length === 0) {
      throw new Error(
        `No encontramos una póliza activa asociada al RUT ${cleanRut} en ${tenant?.nombreVisible || 'el sistema'}. Verifica que tus datos coincidan con el correo de bienvenida.`
      );
    }

    const primera = polizasEncontradas[0];
    const asegurado = primera.asegurado;

    const loggedUser: InsuredUser = {
      rut: cleanRut,
      nombre: asegurado.name,
      apellidos: asegurado.lastName,
      email: asegurado.email,
      telefono: asegurado.phone,
      numeroPoliza: primera.numeroPoliza,
      sponsorId,
    };

    setUser(loggedUser);
    setPolizas(polizasEncontradas);

    const storageKey = `mawdy_insured_${sponsorId}`;
    localStorage.setItem(storageKey, JSON.stringify(loggedUser));

    return true;
  };

  const logout = () => {
    if (sponsorId) {
      localStorage.removeItem(`mawdy_insured_${sponsorId}`);
      localStorage.removeItem(`active_pet_${sponsorId}`);
    }
    setUser(null);
    setPolizas([]);
  };

  return (
    <InsuredAuthContext.Provider
      value={{
        user,
        polizas,
        loading,
        login,
        logout,
        refreshCartera: restoreSession,
      }}
    >
      {children}
    </InsuredAuthContext.Provider>
  );
}

export function useInsuredAuth() {
  return useContext(InsuredAuthContext);
}
