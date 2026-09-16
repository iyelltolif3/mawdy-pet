import React, { useState } from 'react';
import { crearSponsorAdmin, subirLogoAdmin, getAdminUser } from '../../api/admin';
import type { TenantPublicInfo } from '../../api/tenant';

interface SponsorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: TenantPublicInfo) => void;
  onCreateSuccess?: (created: TenantPublicInfo) => void;
  existingSponsors?: TenantPublicInfo[];
}

/**
 * Calcula ratio WCAG relativo contra blanco (#FFFFFF)
 */
function calcularContraste(hex: string): { ratio: number; label: string; ok: boolean } {
  try {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    if (c.length !== 6) return { ratio: 1, label: 'Formato incompleto', ok: false };
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;

    const toLum = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const lum = 0.2126 * toLum(r) + 0.7152 * toLum(g) + 0.0722 * toLum(b);
    const ratio = (1.0 + 0.05) / (lum + 0.05);
    const rounded = Math.round(ratio * 10) / 10;

    return {
      ratio: rounded,
      label: rounded >= 7.0 ? 'Excelente (AAA)' : rounded >= 4.5 ? 'Conforme (AA)' : 'Contraste Bajo',
      ok: rounded >= 4.5,
    };
  } catch {
    return { ratio: 1, label: 'Inválido', ok: false };
  }
}

export default function SponsorCreateModal({
  isOpen,
  onClose,
  onSuccess,
  onCreateSuccess,
  existingSponsors = [],
}: SponsorCreateModalProps) {
  const adminUser = getAdminUser();
  const [nombreVisible, setNombreVisible] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [countryId, setCountryId] = useState('CL');
  const [modo, setModo] = useState<'mock' | 'real'>('mock');
  const [primaryColor, setPrimaryColor] = useState('#006194');
  const [secondaryColor, setSecondaryColor] = useState('#006a63');
  const [operatorName, setOperatorName] = useState(adminUser?.username || 'Administrador Mawdy');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [creando, setCreando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sanitización de subdominio
  const cleanSubdomain = subdominio
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Validaciones
  const isReserved = ['admin', 'api', 'mawdy', 'system', 'root', 'localhost'].includes(cleanSubdomain);
  const isDuplicate = existingSponsors.some(
    (s) => s.subdominio.toLowerCase() === cleanSubdomain || s.sponsorId.toLowerCase() === cleanSubdomain
  );
  const isSubdomainTooShort = cleanSubdomain.length > 0 && cleanSubdomain.length < 3;
  const isSubdomainValid = cleanSubdomain.length >= 3 && !isReserved && !isDuplicate;

  const contrastePrimario = calcularContraste(primaryColor);
  const contrasteSecundario = calcularContraste(secondaryColor);

  const handleNombreChange = (val: string) => {
    setNombreVisible(val);
    // Sugerir subdominio automáticamente si el usuario no lo ha personalizado
    if (!subdominio || subdominio === cleanSubdomain) {
      const suggested = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSubdominio(suggested);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!isPng && !isSvg) {
      setLogoError('Formato inválido. Solo se admiten archivos PNG o SVG.');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);

    if (!nombreVisible.trim()) {
      setErrorGeneral('El nombre visible es obligatorio.');
      return;
    }

    if (!isSubdomainValid) {
      setErrorGeneral(
        isDuplicate
          ? 'El subdominio ya está en uso por otro sponsor.'
          : isReserved
          ? 'El subdominio está reservado por el sistema.'
          : 'El subdominio debe tener al menos 3 caracteres alfanuméricos válidos.'
      );
      return;
    }

    setCreando(true);

    try {
      // 1. Crear el sponsor con configuración base y mock automático
      const res = await crearSponsorAdmin({
        sponsorId: cleanSubdomain,
        subdominio: cleanSubdomain,
        nombreVisible: nombreVisible.trim(),
        countryId,
        modo,
        modifiedBy: operatorName.trim() || 'Administrador Mawdy',
        tema: {
          logoUrl: '/logos/mawdy.svg',
          fuente: 'Plus Jakarta Sans',
          colores: {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: primaryColor,
            background: '#fbf9f5',
            surface: '#ffffff',
            foreground: '#1c1917',
          },
        },
      });

      let finalTenant = res.tenant;

      // 2. Si se adjuntó un logotipo oficial, subirlo de inmediato
      if (logoFile) {
        try {
          const uploadRes = await subirLogoAdmin(cleanSubdomain, logoFile);
          finalTenant = {
            ...finalTenant,
            tema: {
              ...finalTenant.tema,
              logoUrl: uploadRes.url,
            },
          };
        } catch (logoErr) {
          console.warn('El sponsor fue creado pero el logo tuvo un error al subirse:', logoErr);
        }
      }

      (onSuccess || onCreateSuccess)?.(finalTenant);
      onClose();
    } catch (err: any) {
      setErrorGeneral(err.message || 'Error al dar de alta el sponsor.');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-base font-bold text-stone-900">Alta de Nuevo Sponsor B2B2C</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Genera automáticamente la configuración del tenant y su cartera sintética pre-productiva en un solo paso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Formulario con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorGeneral && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorGeneral}</span>
            </div>
          )}

          {/* Grid de Nombre y Subdominio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nombre del Sponsor / Aseguradora <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombreVisible}
                onChange={(e) => handleNombreChange(e.target.value)}
                placeholder="Ej. Bci Seguros"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subdominio Asignado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={subdominio}
                  onChange={(e) => setSubdominio(e.target.value)}
                  placeholder="bciseguros"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 ${
                    isDuplicate || isReserved || isSubdomainTooShort
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                      : 'border-stone-200 focus:ring-[#006194]/20 focus:border-[#006194]'
                  }`}
                />
                {cleanSubdomain && (
                  <span className="absolute right-2.5 top-2.5 text-xs">
                    {isSubdomainValid ? '✓' : '⚠️'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-mono">
                  {cleanSubdomain ? `${cleanSubdomain}.localhost:5173` : 'slug-deseado.localhost:5173'}
                </span>
                {isDuplicate && <span className="text-red-600 font-medium">Subdominio ya registrado</span>}
                {isReserved && <span className="text-red-600 font-medium">Palabra reservada</span>}
                {isSubdomainTooShort && <span className="text-amber-600 font-medium">Mínimo 3 caracteres</span>}
              </div>
            </div>
          </div>

          {/* Grid de País y Modo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                País Operativo (API Business)
              </label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194]"
              >
                <option value="CL">Chile (CL) - Moneda CLP</option>
                <option value="CO">Colombia (CO) - Moneda COP</option>
                <option value="PE">Perú (PE) - Moneda PEN</option>
                <option value="MX">México (MX) - Moneda MXN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Modo Operativo Inicial
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModo('mock')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    modo === 'mock'
                      ? 'bg-[#006194]/10 border-[#006194] text-[#006194]'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Pre-productivo (Sintético)
                </button>
                <button
                  type="button"
                  onClick={() => setModo('real')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    modo === 'real'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Productivo (Core)
                </button>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                {modo === 'mock'
                  ? 'Genera cartera con asegurados, mascotas y asistencias sintéticas para validar el MVP.'
                  : 'Conexión en vivo con el core de la aseguradora (requiere credenciales OAuth2).'}
              </p>
            </div>
          </div>

          {/* Sección de Paleta de Identidad y Contraste WCAG AA */}
          <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
            <h3 className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span>Paleta de Identidad del Sponsor</span>
              <span className="text-[10px] font-normal text-stone-500">Validación de Contraste WCAG AA</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color Primario */}
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-stone-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-mono text-stone-800"
                  />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                  <span className={contrastePrimario.ok ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    Ratio {contrastePrimario.ratio}:1
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className={contrastePrimario.ok ? 'text-emerald-600' : 'text-amber-600'}>
                    {contrastePrimario.label}
                  </span>
                </div>
              </div>

              {/* Color Secundario */}
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Color Secundario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-stone-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-mono text-stone-800"
                  />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                  <span className={contrasteSecundario.ok ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    Ratio {contrasteSecundario.ratio}:1
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className={contrasteSecundario.ok ? 'text-emerald-600' : 'text-amber-600'}>
                    {contrasteSecundario.label}
                  </span>
                </div>
              </div>
            </div>

            {(!contrastePrimario.ok || !contrasteSecundario.ok) && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <span className="shrink-0">⚠️</span>
                <span>
                  Uno o más colores tienen contraste inferior a 4.5:1 con texto blanco. Se recomienda un tono más oscuro para asegurar legibilidad conforme a la norma WCAG AA.
                </span>
              </div>
            )}
          </div>

          {/* Sección de Logotipo Oficial */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Logotipo Oficial (PNG o SVG)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain p-1" />
                ) : (
                  <img src="/logos/mawdy.svg" alt="Default Mawdy" className="max-w-full max-h-full object-contain p-2" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={handleLogoFileChange}
                  className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#006194]/10 file:text-[#006194] hover:file:bg-[#006194]/20 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Opcional. Si no seleccionas un archivo ahora, se usará el imagotipo oficial Mawdy Pet de respaldo.
                </p>
                {logoError && <p className="text-[11px] text-red-600 mt-1">{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Registro de Auditoría Inicial */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Operador Responsable (Auditoría)
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Nombre del administrador"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194]"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              Quedará registrado en el historial de cambios de este sponsor.
            </p>
          </div>
        </form>

        {/* Footer con Acciones */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={creando}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={creando || !isSubdomainValid || !nombreVisible.trim()}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#006194] hover:bg-[#004b73] active:scale-98 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {creando ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando Sponsor & Datos Sintéticos...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Crear Sponsor & Activar Entorno</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
