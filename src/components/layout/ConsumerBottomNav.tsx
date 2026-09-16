import { Link, useLocation } from 'react-router-dom';
import { Home, IdCard, HeartHandshake, HelpCircle } from 'lucide-react';

export default function ConsumerBottomNav() {
  const location = useLocation();
  const path = location.pathname;

  // En el flujo de creación de asistencia, en login o en el wizard de onboarding no se muestra la barra inferior
  if (path.startsWith('/asistencias/nueva') || path.startsWith('/login') || path.startsWith('/onboarding')) {
    return null;
  }

  const isHome = path === '/' || path === '/home';
  const isPoliza = path.startsWith('/poliza') || path.startsWith('/mascota');
  const isAsistencias = path.startsWith('/asistencias');
  const isSoporte = path.startsWith('/soporte');

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-50 max-w-xs mx-auto pb-safe pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-[0_10px_35px_rgba(28,25,23,0.08)] border border-stone-200/80 flex items-center justify-between">
        {/* Tab 1: Inicio */}
        <Link
          to="/home"
          title="Inicio"
          className={`flex items-center justify-center transition-all ${
            isHome
              ? 'w-11 h-11 rounded-full bg-(--color-primary) text-white shadow-md scale-105'
              : 'w-11 h-11 rounded-full text-stone-400 hover:text-stone-700'
          }`}
        >
          <Home className="w-5 h-5" />
        </Link>

        {/* Tab 2: Carnet */}
        <Link
          to="/poliza"
          title="Carnet Digital"
          className={`flex items-center justify-center transition-all ${
            isPoliza
              ? 'w-11 h-11 rounded-full bg-(--color-primary) text-white shadow-md scale-105'
              : 'w-11 h-11 rounded-full text-stone-400 hover:text-stone-700'
          }`}
        >
          <IdCard className="w-5 h-5" />
        </Link>

        {/* Tab 3: Asistencias */}
        <Link
          to="/asistencias"
          title="Asistencias"
          className={`flex items-center justify-center transition-all ${
            isAsistencias
              ? 'w-11 h-11 rounded-full bg-(--color-primary) text-white shadow-md scale-105'
              : 'w-11 h-11 rounded-full text-stone-400 hover:text-stone-700'
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
        </Link>

        {/* Tab 4: Soporte */}
        <Link
          to="/soporte"
          title="Soporte"
          className={`flex items-center justify-center transition-all ${
            isSoporte
              ? 'w-11 h-11 rounded-full bg-(--color-primary) text-white shadow-md scale-105'
              : 'w-11 h-11 rounded-full text-stone-400 hover:text-stone-700'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
        </Link>
      </div>
    </nav>
  );
}
