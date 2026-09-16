import React, { useState } from 'react';
import { crearSponsorAdmin, subirLogoAdmin, getAdminUser } from '../../api/admin';
import type { TenantPublicInfo } from '../../api/tenant';
import { ArrowLeft, ShieldCheck, AlertCircle, Building2, Palette, Upload } from 'lucide-react';

interface SponsorCreatePageProps {
  onBack: () => void;
  onSuccess: (created: TenantPublicInfo) => void;
  existingSponsors?: TenantPublicInfo[];
}

function calcularContraste(hex: string): { ratio: number; label: string; ok: boolean } {
  try {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    if (c.length !== 6) return { ratio: 1, label: 'Incompleto', ok: false };
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;

    const toLum = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const lum = 0.2126 * toLum(r) + 0.7152 * toLum(g) + 0.0722 * toLum(b);
    const ratio = (1.0 + 0.05) / (lum + 0.05);
    const rounded = Math.round(ratio * 10) / 10;

    return {
      ratio: rounded,
      label: rounded >= 7.0 ? 'Excelente (AAA)' : rounded >= 4.5 ? 'Conforme (AA)' : 'Bajo Contraste',
      ok: rounded >= 4.5,
    };
  } catch {
    return { ratio: 1, label: 'Inválido', ok: false };
  }
}

export default function SponsorCreatePage({
  onBack,
  onSuccess,
  existingSponsors = [],
}: SponsorCreatePageProps) {
  const adminUser = getAdminUser();
  const [nombreVisible, setNombreVisible] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [countryId, setCountryId] = useState('CL');
  const [primaryColor, setPrimaryColor] = useState('#006194');
  const [secondaryColor, setSecondaryColor] = useState('#006a63');
  const [operatorName, setOperatorName] = useState(adminUser?.username || 'admin');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [creando, setCreando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // Sanitización de subdominio
  const cleanSubdomain = subdominio
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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
      setLogoError('Solo se admiten archivos PNG o SVG.');
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
          ? 'El subdominio ya está en uso por otro colectivo.'
          : isReserved
          ? 'El subdominio está reservado por el sistema.'
          : 'El subdominio debe tener al menos 3 caracteres alfanuméricos válidos.'
      );
      return;
    }

    setCreando(true);
    try {
      const res = await crearSponsorAdmin({
        sponsorId: cleanSubdomain,
        subdominio: cleanSubdomain,
        nombreVisible: nombreVisible.trim(),
        countryId,
        modo: 'mock',
        modifiedBy: operatorName,
        tema: {
          logoUrl: '/logos/mawdy-official.png',
          fuente: 'DM Sans',
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
          console.warn('El logo tuvo un error al subirse:', logoErr);
        }
      }

      onSuccess(finalTenant);
    } catch (err: any) {
      setErrorGeneral(err.message || 'Error al dar de alta el colectivo.');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Barra de Título y Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8ebed]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-[4px] border border-[#e8ebed] bg-white text-[#526570] hover:text-[#2d373d] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
            title="Volver al catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#2d373d] tracking-tight">
              Alta de Nuevo Sponsor / Colectivo
            </h1>
            <p className="text-xs text-[#526570]">
              Aprovisionamiento de portal PWA, catálogo de coberturas AMA y asignación de subdominio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={creando}
            className="py-1.5 px-3 rounded-[4px] border border-[#e8ebed] bg-white text-xs font-semibold text-[#526570] hover:bg-[#f5f6f7] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={creando || !isSubdomainValid || !nombreVisible.trim()}
            className="py-1.5 px-4 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] active:bg-[#900303] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {creando ? 'Aprovisionando...' : 'Aprovisionar Colectivo'}
          </button>
        </div>
      </div>

      {errorGeneral && (
        <div className="p-3.5 rounded-[4px] bg-red-50 border border-red-200 text-[#d81e05] text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorGeneral}</span>
        </div>
      )}

      {/* Formulario Full Screen a 2 Columnas Responsive */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Datos Operativos */}
        <div className="lg:col-span-7 space-y-5">
          {/* Bloque 1: Identificación y Dominio */}
          <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#d81e05]" />
                <span>1. Datos del Colectivo y Subdominio</span>
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                    Nombre Visible / Comercial <span className="text-[#d81e05]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreVisible}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    placeholder="Ej. Bci Seguros"
                    className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:border-[#d81e05] focus:bg-white outline-none transition-all"
                  />
                  <span className="text-[10px] text-[#89969a] mt-0.5 block">
                    Nombre que verán los asegurados en su portal y carnet.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                    País de Operación <span className="text-[#d81e05]">*</span>
                  </label>
                  <select
                    value={countryId}
                    onChange={(e) => setCountryId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:border-[#d81e05] outline-none cursor-pointer"
                  >
                    <option value="CL">🇨🇱 Chile (CL)</option>
                    <option value="PE">🇵🇪 Perú (PE)</option>
                    <option value="CO">🇨🇴 Colombia (CO)</option>
                    <option value="MX">🇲🇽 México (MX)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                  Subdominio Institucional Asignado <span className="text-[#d81e05]">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={subdominio}
                    onChange={(e) => setSubdominio(e.target.value)}
                    placeholder="bciseguros"
                    className={`flex-1 px-3 py-1.5 font-mono text-xs border rounded-l-[4px] outline-none ${
                      isDuplicate || isReserved || isSubdomainTooShort
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-[#e8ebed] bg-[#f5f6f7] text-[#2d373d] focus:border-[#d81e05] focus:bg-white'
                    }`}
                  />
                  <span className="px-3 py-1.5 bg-[#e8ebed] text-[#526570] font-mono text-xs border border-l-0 border-[#e8ebed] rounded-r-[4px]">
                    .mawdypet.cl
                  </span>
                </div>

                {isDuplicate && (
                  <p className="text-[11px] text-[#d81e05] mt-1">Este subdominio ya está en uso.</p>
                )}
                {isReserved && (
                  <p className="text-[11px] text-[#d81e05] mt-1">Este identificador está reservado por el núcleo Mawdy.</p>
                )}
                {isSubdomainTooShort && (
                  <p className="text-[11px] text-amber-700 mt-1">El subdominio debe tener al menos 3 caracteres.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                  Operador Responsable
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:border-[#d81e05] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Identidad Visual PWA MiA */}
          <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#d81e05]" />
                <span>2. Identidad Visual PWA MiA</span>
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                    Color Primario Corporativo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-8 rounded-[4px] border border-[#e8ebed] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 font-mono text-xs border border-[#e8ebed] bg-[#f5f6f7] rounded-[4px]"
                    />
                  </div>
                  <span className="text-[10px] text-[#526570] mt-1 block">
                    Contraste WCAG: <strong className={contrastePrimario.ok ? 'text-emerald-700' : 'text-amber-700'}>{contrastePrimario.label} ({contrastePrimario.ratio}:1)</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                    Color Secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-8 rounded-[4px] border border-[#e8ebed] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 font-mono text-xs border border-[#e8ebed] bg-[#f5f6f7] rounded-[4px]"
                    />
                  </div>
                  <span className="text-[10px] text-[#526570] mt-1 block">
                    Contraste WCAG: <strong className={contrasteSecundario.ok ? 'text-emerald-700' : 'text-amber-700'}>{contrasteSecundario.label} ({contrasteSecundario.ratio}:1)</strong>
                  </span>
                </div>
              </div>

              {/* Logotipo */}
              <div>
                <label className="block text-xs font-semibold text-[#2d373d] mb-1">
                  Logotipo Oficial del Sponsor (PNG o SVG)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 bg-white border border-[#e8ebed] hover:bg-[#f5f6f7] text-[#2d373d] rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#526570]" />
                    <span>Seleccionar archivo</span>
                    <input
                      type="file"
                      accept="image/png, image/svg+xml"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#89969a]">
                    {logoFile ? logoFile.name : 'Por defecto se usará el co-branding institucional Mawdy.'}
                  </span>
                </div>
                {logoError && <p className="text-[11px] text-[#d81e05] mt-1">{logoError}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa y Catálogo Base */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tarjeta de Resumen */}
          <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
              <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                Resumen de Aprovisionamiento
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f5f6f7] rounded-[4px] border border-[#e8ebed] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#89969a]">Colectivo:</span>
                  <span className="font-bold text-[#2d373d]">{nombreVisible || 'Sin definir'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89969a]">URL Portal:</span>
                  <span className="font-mono text-[#006194]">
                    {cleanSubdomain ? `${cleanSubdomain}.mawdypet.cl` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89969a]">Tipografía:</span>
                  <span className="font-semibold text-[#2d373d]">DM Sans (Estándar MiA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89969a]">Producto AMA Base:</span>
                  <span className="font-semibold text-emerald-700">AMA-PET-CL-01 (5 servicios incluidos)</span>
                </div>
              </div>

              {/* Vista Previa Miniatura */}
              <div>
                <span className="text-[11px] font-semibold text-[#89969a] block mb-2 uppercase tracking-wider">
                  Cabecera Co-Branded PWA:
                </span>
                <div className="rounded-[4px] border border-[#e8ebed] p-3 bg-[#fbf9f5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-6 object-contain" />
                    ) : (
                      <img src="/logos/mawdy-official.png" alt="Mawdy" className="h-5 object-contain" />
                    )}
                    <span className="text-xs font-bold text-[#2d373d] border-l border-[#cccfd2] pl-2">
                      {nombreVisible || 'Mawdy'} Pet
                    </span>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Asistencia 24/7
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e8ebed] flex items-center gap-2 text-[11px] text-[#526570]">
                <ShieldCheck className="w-4 h-4 text-[#2e7d32] shrink-0" />
                <span>
                  Al confirmar, se creará el portal web responsive y la cartera base con 5 prestaciones de urgencia veterinaria activadas.
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
