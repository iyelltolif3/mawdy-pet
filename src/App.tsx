import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';

import { TenantProvider } from './features/tenant/TenantContext';
import { useTenant } from './features/tenant/useTenant';
import { InsuredAuthProvider, useInsuredAuth } from './features/auth/InsuredAuthContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { fetchPublicTenants, type PublicTenantItem } from './api/tenant';

import HomePage from './pages/HomePage';
import PolizaPage from './pages/PolizaPage';
import AsistenciasPage from './pages/AsistenciasPage';
import NuevaAsistenciaPage from './pages/NuevaAsistenciaPage';
import SoportePage from './pages/SoportePage';
import BuscarPage from './pages/BuscarPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminSponsorsPage from './pages/AdminSponsorsPage';
import ConsumerBottomNav from './components/layout/ConsumerBottomNav';

import { PetBrandSeal } from './components/ui/PetBrandSeal';

/**
 * Directorio visual dinámico de Sponsors para cuando se ingresa a un subdominio no reconocido.
 */
function SponsorNotFoundDirectory({ error }: { error: string | null }) {
  const [sponsors, setSponsors] = useState<PublicTenantItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTenants()
      .then((data) => setSponsors(data))
      .catch((e) => console.error('Error al obtener directorio de sponsors:', e))
      .finally(() => setLoading(false));
  }, []);

  const hostname = window.location.hostname;
  const currentSubdomain = hostname.replace('.localhost', '');

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--color-canvas) p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl text-center shadow-xs space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center justify-center">
          <PetBrandSeal variant="hero" size={56} />
        </div>

        <div>
          <h1 className="text-lg font-serif font-bold text-stone-900">Sponsor no encontrado</h1>
          <p className="text-xs text-stone-500 mt-1">
            {error || `El subdominio "${currentSubdomain}" no corresponde a un sponsor registrado.`}
          </p>
        </div>

        {/* Listado dinámico de Sponsors disponibles */}
        <div className="text-left space-y-2 pt-2 border-t border-stone-100">
          <p className="text-[11px] font-bold text-stone-700">
            Sponsors y convenios activos disponibles:
          </p>

          {loading ? (
            <div className="py-4 text-center text-xs text-stone-400">
              <span className="inline-block w-4 h-4 border-2 border-stone-300 border-t-[#006194] rounded-full animate-spin mr-2" />
              Cargando catálogo de sponsors...
            </div>
          ) : sponsors.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sponsors.map((s) => (
                <a
                  key={s.sponsorId}
                  href={`http://${s.subdominio}.localhost:5173`}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-[#006194]/60 hover:bg-[#006194]/5 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={s.logoUrl}
                      alt={s.nombreVisible}
                      className="h-6 w-auto max-w-[80px] object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logos/mawdy.svg';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate group-hover:text-[#006194]">
                        {s.nombreVisible}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        {s.subdominio}.localhost:5173
                      </p>
                    </div>
                  </div>
                  <span className="text-stone-400 text-xs group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-xs text-stone-400 py-2">
              No hay sponsors activos disponibles en este momento.
            </div>
          )}
        </div>

        {/* Acceso directo a administración */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Administración interna B2B2C:</span>
          <a
            href="/admin"
            className="font-bold text-[#006194] hover:underline flex items-center gap-1"
          >
            <span>Ir a /admin</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { tenant, loading, error } = useTenant();
  const { user, loading: loadingAuth } = useInsuredAuth();
  const { isOnline } = useNetworkStatus();
  const location = useLocation();

  // Detección estricta de subdominio o ruta de administración interna
  const hostname = window.location.hostname;
  const isAdminHost = hostname.startsWith('admin.') || hostname === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');
  const isInternalAdmin = isAdminHost || isAdminPath;

  // Si estamos en modo de administración interna, servir el portal exclusivo
  if (isInternalAdmin) {
    return (
      <main className="min-h-screen bg-(--color-canvas)">
        <AdminSponsorsPage />
      </main>
    );
  }

  // Si está cargando el sponsor
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-canvas)">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-stone-200 border-t-(--color-primary) rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-500">Cargando aplicación del asegurado...</p>
        </div>
      </div>
    );
  }

  // Error al resolver el tenant/sponsor
  if (error || !tenant) {
    return <SponsorNotFoundDirectory error={error} />;
  }

  // Si el sponsor está suspendido/inactivo (Requerimiento 7)
  if (tenant.activo === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-canvas) p-4">
        <div className="max-w-md w-full p-8 bg-white border border-stone-200 rounded-3xl text-center shadow-xs">
          <div className="inline-flex items-center justify-center mb-4">
            <PetBrandSeal variant="hero" className="w-16 h-16" />
          </div>
          <h1 className="font-serif text-xl font-bold text-stone-900 mb-2">
            Portal Temporalmente Suspendido
          </h1>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            El servicio de asistencias y gestión de coberturas para asegurados de{' '}
            <strong className="text-stone-900">{tenant.nombreVisible}</strong> se encuentra temporalmente
            inactivo o suspendido por mantención.
          </p>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left text-xs text-stone-700 space-y-2">
            <p className="font-semibold text-stone-900">¿Tienes una urgencia veterinaria en curso?</p>
            <p className="text-[11px] text-stone-500">
              Si tu mascota requiere atención clínica inmediata, por favor comunícate directamente con la central
              telefónica de tu aseguradora o asiste al centro de urgencias veterinarias más cercano.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Mawdy Pet Plataforma B2B2C</span>
            <a href="/admin" className="text-[#006194] hover:underline font-semibold">
              Consola Operativa
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-canvas)">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-(--color-primary) rounded-full animate-spin" />
      </div>
    );
  }

  // Experiencia PWA del Asegurado (B2C)
  return (
    <div className="min-h-screen bg-(--color-background) flex flex-col justify-between">
      {/* Banner de estado offline si se pierde la conexión */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-2 shadow-xs transition-all z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            <strong>Sin conexión a internet:</strong> Operando en modo offline. Las solicitudes requieren reconexión.
          </span>
        </div>
      )}

      {/* Rutas Principales del Asegurado con Enfoque B2B2C */}
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={user ? <OnboardingPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/home"
            element={user ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/poliza"
            element={user ? <PolizaPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/poliza/:riesgoId"
            element={user ? <PolizaPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/mascota"
            element={user ? <PolizaPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/mascota/:riesgoId"
            element={user ? <PolizaPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/asistencias"
            element={user ? <AsistenciasPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/asistencias/nueva"
            element={user ? <NuevaAsistenciaPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/asistencias/nueva/:riesgoId"
            element={user ? <NuevaAsistenciaPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/soporte" element={<SoportePage />} />
          <Route path="/buscar" element={<BuscarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Barra de Navegación Inferior Fija de 4 Módulos (Solo asegurados autenticados) */}
      {user && <ConsumerBottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <InsuredAuthProvider>
          <AppContent />
        </InsuredAuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}
