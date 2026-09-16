import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useTenantBranding } from '../../features/tenant/tenantBranding';
import { useTenant } from '../../features/tenant/useTenant';
import { useInsuredAuth } from '../../features/auth/InsuredAuthContext';
import { BrandLogo } from '../ui/BrandLogo';

interface ConsumerHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

/**
 * Cabecera institucional unificada para asegurados.
 * Garantiza consistencia de marca en todas las pantallas:
 * - Logo oficial del sponsor y sello Mawdy SIEMPRE presentes.
 * - Flecha de navegación a la izquierda sin desplazar el logotipo.
 * - Responsividad completa para escritorio y móvil (hasta max-w-7xl).
 * - Control de notificaciones y perfil del asegurado.
 */
export default function ConsumerHeader({
  title = 'Inicio',
  subtitle,
  showBack = false,
  backTo = '/home',
}: ConsumerHeaderProps) {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const { user, logout } = useInsuredAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHome = !showBack && title === 'Inicio';
  const bannerUrl = tenant?.tema?.bannerUrl;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#fbf9f5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-sans">
      {/* 1. Barra opcional de campaña si el sponsor tiene banner configurado */}
      {bannerUrl && (
        <div className="h-1.5 w-full bg-linear-to-r from-(--color-primary) via-stone-800 to-(--color-secondary)" />
      )}

      {/* 2. Barra Principal Responsiva (max-w-7xl) */}
      <div className="h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        {/* Lado Izquierdo: Flecha de retorno (si aplica) + Logo Oficial Consistente */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200/90 flex items-center justify-center text-stone-700 transition-all shrink-0 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-(--color-primary)"
              aria-label="Volver a la pantalla anterior"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          )}

          {/* Logo Oficial Siempre Presente en Todas las Ventanas */}
          <Link
            to="/home"
            className="flex items-center gap-2 shrink-0 hover:opacity-95 transition-opacity"
            title={`Ir al inicio de ${branding.brandName}`}
          >
            <BrandLogo size="sm" className="max-h-7 sm:max-h-8" />
          </Link>

          {/* Separador e información de la pantalla actual */}
          {!isHome && (
            <div className="flex items-center gap-2 min-w-0 border-l border-stone-200/80 pl-2.5 sm:pl-3">
              <div className="flex flex-col min-w-0">
                <h1 className="font-bold text-xs sm:text-sm text-stone-900 truncate leading-tight">
                  {title}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 truncate hidden xs:block">
                  {subtitle || branding.brandName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Notificaciones + Perfil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">

          {/* Notificaciones */}
          <Link
            to="/soporte"
            aria-label="Notificaciones y avisos"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </Link>

          {/* Menú de Usuario Asegurado */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 text-xs text-stone-800 transition-colors cursor-pointer"
                title={`Sesión iniciada como ${user.nombre}`}
              >
                <div className="w-6 h-6 rounded-full bg-(--color-primary) text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                  {user.nombre.charAt(0)}
                </div>
                <span className="text-[11px] font-semibold hidden sm:inline max-w-[100px] truncate">
                  {user.nombre}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Popover de Sesión */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-stone-200 p-3.5 shadow-xl z-50 text-left animate-in fade-in">
                  <div className="pb-2.5 mb-2.5 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {user.nombre} {user.apellidos}
                      </p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{user.rut}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Póliza Colectiva Vigente
                    </span>
                  </div>

                  <Link
                    to="/poliza"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors mb-1"
                  >
                    Ver Carnet Digital
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 rounded-full bg-(--color-primary) text-white text-[11px] font-bold hover:opacity-95 shadow-2xs"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
