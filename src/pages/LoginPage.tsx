import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  MessageCircle,
  Mail,
  Stethoscope,
  Home,
  Video,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useTenant } from '../features/tenant/useTenant';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { useInsuredAuth } from '../features/auth/InsuredAuthContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';

// Formateador estándar de RUT chileno: 123456789 -> 12.345.678-9
function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

export default function LoginPage() {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const { login } = useInsuredAuth();
  const navigate = useNavigate();

  const isPreproductivo = tenant?.modo === 'mock' || tenant?.modo === 'preproductivo';
  const showDevProfiles = import.meta.env.DEV || isPreproductivo;

  const [rut, setRut] = useState('16.789.123-4');
  const [password, setPassword] = useState('pet2026');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [textScale, setTextScale] = useState<'sm' | 'md' | 'lg'>('md');

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRut(formatRut(val));
    setErrorLogin(null);
  };

  const handleSelectPreproductivoProfile = (rutEjemplo: string) => {
    setRut(rutEjemplo);
    setPassword('pet2026');
    setErrorLogin(null);
  };

  const handleTextScaleChange = (scale: 'sm' | 'md' | 'lg') => {
    setTextScale(scale);
    document.documentElement.setAttribute('data-text-scale', scale);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);
    setCargando(true);

    try {
      await login(rut, password);
      // Redirigir a bienvenida/onboarding si la ficha no ha sido configurada aún
      const cleanRut = rut.trim();
      const hasOnboarded = localStorage.getItem(`pet_onboarded_${cleanRut}`);
      if (!hasOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/home');
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Credenciales no reconocidas. Revisa tu RUT o el correo con tus datos de acceso.';
      setErrorLogin(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col justify-between items-center py-6 sm:py-10 px-4">
      {/* Contenedor Principal (Dos Columnas en Desktop, Una en Móvil) */}
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* ==================================================================== */}
        {/* COLUMNA IZQUIERDA: FORMULARIO COMERCIAL DE ACCESO                     */}
        {/* ==================================================================== */}
        <div className="p-6 sm:p-10 lg:col-span-7 flex flex-col justify-between gap-6">
          
          {/* Cabecera de Marca: Solo logotipo del sponsor (o Mawdy si no tiene) */}
          <div className="flex items-center justify-between gap-4">
            <BrandLogo size="md" />

            {/* Selector discreto de accesibilidad tipográfica */}
            <div className="inline-flex items-center gap-1 bg-stone-100/80 rounded-md p-0.5 border border-stone-200/80">
              <button
                type="button"
                onClick={() => handleTextScaleChange('sm')}
                className={`w-6 h-6 rounded text-[11px] font-medium flex items-center justify-center cursor-pointer transition-colors ${
                  textScale === 'sm' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Texto estándar compacto"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleTextScaleChange('md')}
                className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors ${
                  textScale === 'md' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Texto estándar normal"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleTextScaleChange('lg')}
                className={`w-6 h-6 rounded text-sm font-medium flex items-center justify-center cursor-pointer transition-colors ${
                  textScale === 'lg' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Texto grande accesible"
              >
                A+
              </button>
            </div>
          </div>

          {/* Bienvenida y Explicación Breve */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Bienvenido
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed">
              Ingresa a tu plataforma de asistencia para mascotas con tu convenio {branding.brandName}.
            </p>
          </div>

          {/* Alerta de Error de Acceso */}
          {errorLogin && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-xs">Error de acceso</p>
                <p className="text-[11px] mt-0.5 leading-relaxed text-red-700">{errorLogin}</p>
              </div>
            </div>
          )}

          {/* Formulario de Ingreso */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="rut-input" className="block text-xs font-semibold text-stone-700 mb-1.5">
                RUT del Titular
              </label>
              <input
                id="rut-input"
                type="text"
                value={rut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                className="w-full px-3.5 py-2.5 text-sm font-mono min-h-[44px] border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-input" className="block text-xs font-semibold text-stone-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/soporte')}
                  className="text-xs text-stone-500 hover:text-(--color-primary) hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm min-h-[44px] border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Contraseña despachada a tu correo al contratar tu póliza.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={cargando}
              className="mt-2"
            >
              {cargando ? (
                <span>Verificando credenciales...</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Ingresar</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Soporte 24/7 Compacto */}
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Soporte y Asistencia 24/7</span>
              <span>Línea activa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="https://wa.me/56987654321?text=Hola,%20necesito%20asistencia%20con%20mi%20seguro%20de%20mascota"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 transition-colors"
              >
                <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                <span className="truncate">WhatsApp: +56 9 8765 4321</span>
              </a>

              <a
                href={`mailto:asistencias@${tenant?.subdominio || 'mawdypet'}.cl`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 transition-colors truncate"
              >
                <Mail size={15} className="text-stone-500 shrink-0" />
                <span className="truncate">soporte@{tenant?.subdominio || 'mawdypet'}.cl</span>
              </a>
            </div>
          </div>

          {/* Acceso Rápido de Prueba (Tucked Away exclusively for Development/Staging) */}
          {showDevProfiles && (
            <details className="text-xs text-stone-400 group pt-1">
              <summary className="cursor-pointer hover:text-stone-600 transition-colors select-none text-[11px] list-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 group-open:bg-sky-500" />
                <span>Cuentas de prueba pre-configuradas (Modo Simulación)</span>
              </summary>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreproductivoProfile('16.789.123-4')}
                  className="p-2 rounded-lg border border-stone-200 bg-stone-50 text-left hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-semibold text-stone-800 block">Camila Valenzuela</span>
                  <span className="text-[10px] text-stone-500 font-mono block">16.789.123-4 · Milo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreproductivoProfile('14.567.890-K')}
                  className="p-2 rounded-lg border border-stone-200 bg-stone-50 text-left hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-semibold text-stone-800 block">Rodrigo Pizarro</span>
                  <span className="text-[10px] text-stone-500 font-mono block">14.567.890-K · Bruno</span>
                </button>
              </div>
            </details>
          )}

        </div>

        {/* ==================================================================== */}
        {/* COLUMNA DERECHA: FOTOGRAFÍA EDITORIAL Y BENEFICIOS CLAVE              */}
        {/* ==================================================================== */}
        <div className="hidden lg:flex lg:col-span-5 bg-stone-50 border-l border-stone-200/80 flex-col justify-between overflow-hidden">
          {/* Fotografía Editorial de Alta Calidad (Protección, Confianza, Cercanía) */}
          <div className="relative h-64 w-full overflow-hidden bg-stone-200 shrink-0">
            <img
              src="/images/login-editorial-pet.jpg"
              alt="Paciente protegido con cobertura médica"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
              <span className="font-semibold block">Protección de Salud Veterinaria</span>
              <span className="text-[11px] text-white/80 block">Respaldo continuo ante cualquier eventualidad</span>
            </div>
          </div>

          {/* 3 Beneficios Principales con Iconos Lucide */}
          <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <Stethoscope size={18} strokeWidth={2} />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-semibold text-stone-900">Atención veterinaria 24/7</p>
                <p className="text-stone-500 text-[11px] mt-0.5 leading-snug">
                  Consultas y urgencias en centros clínicos de la red.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <Home size={18} strokeWidth={2} />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-semibold text-stone-900">Médico veterinario a domicilio</p>
                <p className="text-stone-500 text-[11px] mt-0.5 leading-snug">
                  Atención profesional coordinada en el hogar para tu mascota.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                <Video size={18} strokeWidth={2} />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-semibold text-stone-900">Orientación especializada</p>
                <p className="text-stone-500 text-[11px] mt-0.5 leading-snug">
                  Telemedicina veterinaria inmediata sin deducible.
                </p>
              </div>
            </div>
          </div>

          {/* Franja de Respaldo Institucional Secundaria */}
          <div className="p-4 bg-stone-100/70 border-t border-stone-200/70 text-[11px] text-stone-500 text-center">
            Convenio colectivo oficial de <strong className="text-stone-700 font-semibold">{branding.brandName}</strong>
          </div>
        </div>

      </div>

      {/* Pie Institucional Real (Soporte, Términos, Privacidad) */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400 mt-4 px-2">
        <div className="flex items-center gap-4">
          <a href="/soporte" className="hover:text-stone-600 transition-colors">
            Centro de Ayuda
          </a>
          <span>·</span>
          <a href="/soporte" className="hover:text-stone-600 transition-colors">
            Términos y Condiciones
          </a>
          <span>·</span>
          <a href="/soporte" className="hover:text-stone-600 transition-colors">
            Privacidad
          </a>
        </div>

        <div className="text-stone-400">
          Servicio provisto por Mawdy Servicios de Asistencia S.A.
        </div>
      </footer>
    </div>
  );
}
