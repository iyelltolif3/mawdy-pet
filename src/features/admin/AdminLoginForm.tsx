import React, { useState } from 'react';
import { loginAdmin } from '../../api/admin';
import type { AdminUser } from '../../api/admin';
import { MawdyBrandLogo } from '../../components/ui/MawdyBrandLogo';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginFormProps {
  onLoginSuccess: (user: AdminUser) => void;
}

/**
 * Pantalla de Acceso Corporativa a la Consola de Administración Mawdy.
 * Alineada con el estándar de identidad CRM Minerva de Mawdy.
 */
export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('mawdypet2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await loginAdmin(username.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Cabecera con Marca Oficial Mawdy */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-5">
          <MawdyBrandLogo variant="minerva" className="h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#2d373d] tracking-tight">
          Gestión de Convenios y Sponsors B2B
        </h1>
        <p className="mt-1 text-xs text-[#526570]">
          Consola operativa de aprovisionamiento de colectivos y ecosistema asistencial
        </p>
      </div>

      {/* Contenedor del Formulario Corporativo */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#e8ebed]">
            <ShieldCheck className="w-4 h-4 text-[#d81e05]" />
            <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
              Acceso Seguro al Sistema
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[4px] bg-[#fff5f5] border border-[#fecaca] text-[#ac0404] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#d81e05] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2d373d] mb-1.5">
                Usuario Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#89969a]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 rounded-[4px] border border-[#cccfd2] bg-white text-[#2d373d] text-xs focus:outline-none focus:border-[#d81e05] focus:ring-1 focus:ring-[#d81e05] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2d373d] mb-1.5">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#89969a]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-[4px] border border-[#cccfd2] bg-white text-[#2d373d] text-xs focus:outline-none focus:border-[#d81e05] focus:ring-1 focus:ring-[#d81e05] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] active:bg-[#900303] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Ingresar a Consola</span>
                )}
              </button>
            </div>
          </form>

          {/* Guía informativa de entorno */}
          <div className="mt-5 pt-4 border-t border-[#e8ebed] bg-[#f5f6f7] rounded-[4px] p-3 text-[11px] text-[#526570]">
            <p className="font-semibold text-[#2d373d] mb-1">Credenciales preconfiguradas:</p>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#2d373d]">
              <span>Usuario: <strong className="font-semibold">admin</strong></span>
              <span>Clave: <strong className="font-semibold">mawdypet2026</strong></span>
            </div>
          </div>
        </div>

        {/* Footer institucional */}
        <p className="mt-6 text-center text-[11px] text-[#89969a]">
          © {new Date().getFullYear()} Mawdy. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
