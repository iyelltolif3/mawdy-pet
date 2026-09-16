import React, { useState, useRef } from 'react';
import {
  Siren,
  Truck,
  PhoneCall,
  Syringe,
  Home,
  ShieldCheck,
  HeartHandshake,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  PanelRightClose,
  PanelRightOpen,
  Stethoscope,
  PawPrint,
  HeartPulse,
  Activity,
  Pill,
  Hospital,
  Video,
  MapPin,
  Award,
  Calendar,
  Sparkles,
  Dog,
  Cat,
  Scissors,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';
import type { TenantPublicInfo, ServicioCobertura, ProductoAmaConfig } from '../../api/tenant';
import {
  actualizarSponsorAdmin,
  subirLogoAdmin,
  subirBannerAdmin,
  getAdminUser,
} from '../../api/admin';
import SponsorDeleteModal from './SponsorDeleteModal';

interface SponsorConfigPageProps {
  sponsor: TenantPublicInfo;
  onBack: () => void;
  onSaveSuccess: (updated: TenantPublicInfo) => void;
  onDeleteSuccess?: (deletedSponsorId: string) => void;
}

const FUENTES_OPCIONES = [
  { id: 'Plus Jakarta Sans', nombre: 'Plus Jakarta Sans', estilo: 'Recomendada (Clínica y ergonómica)' },
  { id: 'DM Sans', nombre: 'DM Sans', estilo: 'Estándar Oficial Mapfre / Mawdy MiA' },
  { id: 'Inter', nombre: 'Inter', estilo: 'Neutro, alta legibilidad en datos y cifras' },
  { id: 'Outfit', nombre: 'Outfit', estilo: 'Geométrica y contemporánea' },
  { id: 'Roboto', nombre: 'Roboto', estilo: 'Institucional clásica' },
];

export interface IconOption {
  id: string;
  label: string;
  category: 'urgencias' | 'clinica' | 'telemed' | 'preventivo' | 'bienestar';
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ICONOS_DISPONIBLES: IconOption[] = [
  // 1. Urgencias y Rescate
  { id: 'Siren', label: 'Urgencia 24/7', category: 'urgencias', categoryLabel: 'Urgencia', icon: Siren },
  { id: 'Truck', label: 'Ambulancia Pet', category: 'urgencias', categoryLabel: 'Urgencia', icon: Truck },
  { id: 'HeartPulse', label: 'Riesgo Vital', category: 'urgencias', categoryLabel: 'Urgencia', icon: HeartPulse },
  { id: 'AlertTriangle', label: 'Triage Inmediato', category: 'urgencias', categoryLabel: 'Urgencia', icon: AlertTriangle },

  // 2. Red Clínica y Procedimientos
  { id: 'Stethoscope', label: 'Consulta Veterinaria', category: 'clinica', categoryLabel: 'Clínica', icon: Stethoscope },
  { id: 'Hospital', label: 'Hospital / Clínica', category: 'clinica', categoryLabel: 'Clínica', icon: Hospital },
  { id: 'Activity', label: 'Exámenes / Laboratorio', category: 'clinica', categoryLabel: 'Clínica', icon: Activity },
  { id: 'ShieldCheck', label: 'Cirugía y Hospitalización', category: 'clinica', categoryLabel: 'Clínica', icon: ShieldCheck },

  // 3. Telemedicina y Conectividad
  { id: 'PhoneCall', label: 'Orientación Telefónica', category: 'telemed', categoryLabel: 'Telemed', icon: PhoneCall },
  { id: 'Video', label: 'Telemedicina Video', category: 'telemed', categoryLabel: 'Telemed', icon: Video },
  { id: 'Clock', label: 'Atención Continua 24h', category: 'telemed', categoryLabel: 'Telemed', icon: Clock },
  { id: 'Calendar', label: 'Agendamiento Web', category: 'telemed', categoryLabel: 'Telemed', icon: Calendar },

  // 4. Preventivo y Salud
  { id: 'Syringe', label: 'Vacunas / Antiparasitarios', category: 'preventivo', categoryLabel: 'Preventivo', icon: Syringe },
  { id: 'Pill', label: 'Farmacia / Fármacos', category: 'preventivo', categoryLabel: 'Preventivo', icon: Pill },
  { id: 'Shield', label: 'Plan Preventivo Anual', category: 'preventivo', categoryLabel: 'Preventivo', icon: Shield },
  { id: 'Award', label: 'Certificado de Vacunación', category: 'preventivo', categoryLabel: 'Preventivo', icon: Award },
  { id: 'FileText', label: 'Ficha Clínica Digital', category: 'preventivo', categoryLabel: 'Preventivo', icon: FileText },

  // 5. Bienestar, Especie y Hogar
  { id: 'Home', label: 'Atención Domiciliaria', category: 'bienestar', categoryLabel: 'Bienestar', icon: Home },
  { id: 'Dog', label: 'Caninos / Paseos', category: 'bienestar', categoryLabel: 'Bienestar', icon: Dog },
  { id: 'Cat', label: 'Felinos / Especialidad', category: 'bienestar', categoryLabel: 'Bienestar', icon: Cat },
  { id: 'PawPrint', label: 'Microchip e Identificación', category: 'bienestar', categoryLabel: 'Bienestar', icon: PawPrint },
  { id: 'HeartHandshake', label: 'Asistencia y Apoyo', category: 'bienestar', categoryLabel: 'Bienestar', icon: HeartHandshake },
  { id: 'Sparkles', label: 'Grooming / Baño Sanitario', category: 'bienestar', categoryLabel: 'Bienestar', icon: Sparkles },
  { id: 'MapPin', label: 'Red Convenios Cercanos', category: 'bienestar', categoryLabel: 'Bienestar', icon: MapPin },
  { id: 'Scissors', label: 'Cuidado & Peluquería', category: 'bienestar', categoryLabel: 'Bienestar', icon: Scissors },
];

export function getIconComponent(iconName?: string) {
  const match = ICONOS_DISPONIBLES.find((i) => i.id === iconName);
  return match ? match.icon : ShieldCheck;
}

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

export default function SponsorConfigPage({
  sponsor,
  onBack,
  onSaveSuccess,
  onDeleteSuccess,
}: SponsorConfigPageProps) {
  const adminUser = getAdminUser();
  const [formData, setFormData] = useState<TenantPublicInfo>(() => {
    const clone = JSON.parse(JSON.stringify(sponsor));
    if (!clone.productoAma) {
      clone.productoAma = {
        codigoProductoAma: 'AMA-PET-CL-01',
        nombreProducto: 'Asistencia Integral Mascotas Senior & Puppy',
        colectivoPolizaMarco: 'POL-COL-MAWDY-2025',
        lineaAsistencia: 'Mascotas Domésticas',
        servicios: [],
      };
    }
    return clone;
  });

  const [operatorName, setOperatorName] = useState(
    sponsor.lastModifiedBy || adminUser?.username || 'RNFELIP'
  );

  // Tabs superiores nativos estilo CRM Minerva (media_1789481255398.png)
  const [activeTab, setActiveTab] = useState<'servicios' | 'identidad' | 'conectividad' | 'auditoria'>('servicios');

  // Control de visibilidad de secciones colapsables (Ocultar / Mostrar)
  const [showSectionAmaProduct, setShowSectionAmaProduct] = useState(true);
  const [showSectionServicesCatalog, setShowSectionServicesCatalog] = useState(true);
  const [showSectionBrandingColors, setShowSectionBrandingColors] = useState(true);
  const [showSectionBannerPwa, setShowSectionBannerPwa] = useState(true);
  const [showSectionCarnet, setShowSectionCarnet] = useState(true);

  // Barra lateral colapsable (media_1789481255398.png -> "→ Cerrar barra lateral")
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado de edición en línea de servicios (sin modal)
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [isAddingNewService, setIsAddingNewService] = useState(false);
  const [serviceDraft, setServiceDraft] = useState<ServicioCobertura>({
    id: '',
    codigoServicio: '',
    codigoGarantia: '',
    nombre: '',
    descripcion: '',
    icono: 'Siren',
    limiteEventos: '3 eventos / año',
    copagoOTope: '100% Cobertura (Sin Copago)',
    activo: true,
  });

  // Selector visual de íconos para coberturas
  const [iconCategoryFilter, setIconCategoryFilter] = useState<'todos' | 'urgencias' | 'clinica' | 'telemed' | 'preventivo' | 'bienestar'>('todos');
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [showIconCatalog, setShowIconCatalog] = useState(true);

  // Operaciones asíncronas
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoBanner, setSubiendoBanner] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputBannerRef = useRef<HTMLInputElement>(null);

  const primaryColor = formData.tema?.colores?.primary || '#d81e05';
  const secondaryColor = formData.tema?.colores?.secondary || '#2d373d';
  const accentColor = formData.tema?.colores?.accent || primaryColor;
  const fuenteActual = formData.tema?.fuente || 'DM Sans';
  const logoUrl = formData.tema?.logoUrl || '/logos/mawdy-official.png';
  const bannerUrl = formData.tema?.bannerUrl || '';
  const isActivo = formData.activo !== false;

  const contrastePrimario = calcularContraste(primaryColor);
  const contrasteSecundario = calcularContraste(secondaryColor);

  const productoAma = formData.productoAma as ProductoAmaConfig;
  const serviciosList = productoAma?.servicios || [];

  const fichaMascota = formData.tema?.fichaMascota || {
    lema: 'Carnet Digital de Mascota Asegurada',
    estiloTarjeta: 'linen',
    mostrarSelloWatermark: true,
    mostrarMicrochip: true,
    mostrarVacunas: true,
    mostrarAlergias: true,
    mostrarVeterinario: true,
    mostrarCoberturas: true,
    mensajeAsistencia: 'En caso de urgencia médica 24/7 o extravío de tu mascota, activa tu asistencia directa en este portal.',
  };

  const handleTextChange = (field: 'nombreVisible' | 'subdominio', val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleColorHexChange = (type: 'primary' | 'secondary' | 'accent', rawValue: string) => {
    let val = rawValue.trim();
    if (!val.startsWith('#') && val.length > 0) val = '#' + val;
    setFormData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      clone.tema.colores[type] = val;
      return clone;
    });
  };

  const handleFuenteChange = (fuente: string) => {
    setFormData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      clone.tema.fuente = fuente;
      return clone;
    });
  };

  const handleProductoAmaChange = (field: keyof ProductoAmaConfig, val: any) => {
    setFormData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      if (!clone.productoAma) clone.productoAma = {};
      clone.productoAma[field] = val;
      return clone;
    });
  };

  const handleFichaMascotaChange = (field: string, val: any) => {
    setFormData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      if (!clone.tema.fichaMascota) clone.tema.fichaMascota = {};
      clone.tema.fichaMascota[field] = val;
      return clone;
    });
  };

  // Gestión de servicios en línea
  const handleStartAddService = () => {
    setIsAddingNewService(true);
    setEditingServiceIndex(null);
    setServiceDraft({
      id: `srv-${Date.now()}`,
      codigoServicio: `VET_SRV_${(serviciosList.length + 1).toString().padStart(2, '0')}`,
      codigoGarantia: `GAR_PREST_${(serviciosList.length + 1).toString().padStart(2, '0')}`,
      nombre: '',
      descripcion: '',
      icono: 'Siren',
      limiteEventos: '3 eventos / año',
      copagoOTope: '100% Cobertura (Sin Copago)',
      activo: true,
    });
  };

  const handleStartEditService = (index: number) => {
    setIsAddingNewService(false);
    setEditingServiceIndex(index);
    setServiceDraft({ ...serviciosList[index] });
  };

  const handleSaveServiceDraft = () => {
    if (!serviceDraft.nombre.trim() || !serviceDraft.codigoServicio.trim()) {
      alert('Por favor ingresa el título del servicio y su código de integración API.');
      return;
    }

    const updated = [...serviciosList];
    if (isAddingNewService) {
      updated.push(serviceDraft);
    } else if (editingServiceIndex !== null) {
      updated[editingServiceIndex] = serviceDraft;
    }

    handleProductoAmaChange('servicios', updated);
    setIsAddingNewService(false);
    setEditingServiceIndex(null);
  };

  const handleCancelServiceDraft = () => {
    setIsAddingNewService(false);
    setEditingServiceIndex(null);
  };

  const handleDeleteService = (index: number) => {
    const srv = serviciosList[index];
    const confirm = window.confirm(`¿Confirmas que deseas retirar la cobertura "${srv.nombre}" del convenio?`);
    if (!confirm) return;
    const updated = serviciosList.filter((_: ServicioCobertura, idx: number) => idx !== index);
    handleProductoAmaChange('servicios', updated);
    if (editingServiceIndex === index) {
      handleCancelServiceDraft();
    }
  };

  const handleToggleServiceActive = (index: number) => {
    const updated = serviciosList.map((s: ServicioCobertura, idx: number) =>
      idx === index ? { ...s, activo: !s.activo } : s
    );
    handleProductoAmaChange('servicios', updated);
  };

  // Manejador de subida de logo
  const handleFileLogo = async (file: File) => {
    setLogoError(null);
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!isPng && !isSvg) {
      setLogoError('Formato no permitido. Solo se aceptan archivos PNG (.png) o SVG (.svg).');
      return;
    }

    try {
      setSubiendoLogo(true);
      const res = await subirLogoAdmin(formData.sponsorId, file);
      setFormData((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        clone.tema.logoUrl = res.url;
        return clone;
      });
      setMensajeExito('Logotipo oficial actualizado exitosamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setLogoError(err.message || 'Error al procesar el archivo del logotipo.');
    } finally {
      setSubiendoLogo(false);
    }
  };

  // Manejador de subida de banner PWA
  const handleFileBanner = async (file: File) => {
    setBannerError(null);
    const isValid = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg)$/i.test(file.name);
    if (!isValid) {
      setBannerError('Formato no permitido. Utiliza PNG, JPG o WEBP para el banner.');
      return;
    }

    try {
      setSubiendoBanner(true);
      const res = await subirBannerAdmin(formData.sponsorId, file);
      setFormData((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        clone.tema.bannerUrl = res.url;
        return clone;
      });
      setMensajeExito('Banner de cabecera PWA actualizado exitosamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setBannerError(err.message || 'Error al procesar y almacenar el banner.');
    } finally {
      setSubiendoBanner(false);
    }
  };

  // Guardar configuración completa en backend
  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    try {
      const payload: Partial<TenantPublicInfo> = {
        nombreVisible: formData.nombreVisible.trim(),
        subdominio: formData.subdominio.trim().toLowerCase(),
        countryId: formData.countryId || 'CL',
        activo: isActivo,
        modo: formData.modo,
        lastModifiedBy: operatorName.trim() || 'RNFELIP',
        lastModifiedAt: new Date().toISOString(),
        productoAma: formData.productoAma,
        tema: {
          logoUrl: formData.tema.logoUrl,
          bannerUrl: formData.tema.bannerUrl,
          fuente: formData.tema.fuente || 'DM Sans',
          colores: {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            background: formData.tema.colores?.background || '#f5f6f7',
            surface: formData.tema.colores?.surface || '#ffffff',
            foreground: formData.tema.colores?.foreground || '#2d373d',
          },
          fichaMascota: formData.tema.fichaMascota,
        },
      };

      const res = await actualizarSponsorAdmin(formData.sponsorId, payload);
      setMensajeExito(`Configuración de ${res.tenant.nombreVisible} guardada y sincronizada correctamente.`);
      setFormData(res.tenant);
      onSaveSuccess(res.tenant);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setMensajeError(err.message || 'Error al guardar la configuración del convenio.');
    } finally {
      setGuardando(false);
    }
  };

  const appUrl = `/?sponsor=${formData.subdominio}`;

  return (
    <div className="w-full min-h-screen text-[#2d373d] font-sans pb-12">
      {/* 1. Barra de Herramientas y Acciones del Convenio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8ebed]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-[4px] border border-[#e8ebed] bg-white text-[#526570] hover:text-[#2d373d] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
            title="Volver al catálogo general"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#2d373d] tracking-tight">
                Convenio Colectivo: <span className="text-[#d81e05]">{formData.nombreVisible}</span>
              </h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-[3px] font-bold uppercase tracking-wider border ${
                  isActivo
                    ? 'bg-[#e8ebed] text-[#2e7d32] border-[#c8e6c9]'
                    : 'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]'
                }`}
              >
                {isActivo ? 'Operativo' : 'Suspendido'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e8ebed] text-[#526570]">
                {formData.sponsorId}
              </span>
            </div>
            <p className="text-[11px] text-[#89969a] mt-0.5">
              Subdominio activo: <span className="font-mono text-[#006194] font-semibold">{formData.subdominio}.mawdypet.cl</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de alternar barra lateral de vista previa */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-[4px] border border-[#e8ebed] bg-white text-[#526570] text-xs font-semibold hover:bg-[#f5f6f7] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title={sidebarOpen ? 'Ocultar vista previa PWA' : 'Mostrar vista previa PWA'}
          >
            {sidebarOpen ? <PanelRightClose className="w-3.5 h-3.5 text-[#d81e05]" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{sidebarOpen ? 'Cerrar barra lateral' : 'Abrir vista previa'}</span>
          </button>

          {/* Abrir Portal en vivo */}
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-[#526570] bg-white border border-[#e8ebed] hover:bg-[#f5f6f7] rounded-[4px] transition-all flex items-center gap-1.5 shadow-2xs"
            title="Abrir portal web de asegurados en pestaña nueva"
          >
            <span>Ver Portal Web</span>
            <ExternalLink className="w-3 h-3 text-[#89969a]" />
          </a>

          {/* Eliminar Portal (solo no canónicos) */}
          {formData.sponsorId !== 'mawdypet' && formData.sponsorId !== 'admin' && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-xs font-semibold text-[#d81e05] bg-white border border-[#fecaca] hover:bg-[#fff5f5] rounded-[4px] transition-all cursor-pointer shadow-2xs"
              title="Dar de baja este portal permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Guardar y Publicar */}
          <button
            type="button"
            onClick={handleGuardarConfiguracion}
            disabled={guardando}
            className="px-4 py-1.5 text-xs font-bold bg-[#d81e05] hover:bg-[#ac0404] active:bg-[#900303] text-white rounded-[4px] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {guardando ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Pestañas de Navegación CRM Minerva (media_1789481255398.png) */}
      <div className="border-b border-[#e8ebed] flex items-center gap-6 text-xs select-none overflow-x-auto my-3">
        <button
          type="button"
          onClick={() => setActiveTab('servicios')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'servicios'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Servicios y Coberturas AMA ({serviciosList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('identidad')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'identidad'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Identidad Visual & PWA MiA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('conectividad')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'conectividad'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Canal & Conectividad Operativa
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('auditoria')}
          className={`pb-2.5 font-bold transition-colors cursor-pointer relative shrink-0 ${
            activeTab === 'auditoria'
              ? 'text-[#d81e05] border-b-2 border-[#d81e05]'
              : 'text-[#526570] hover:text-[#2d373d]'
          }`}
        >
          Trazabilidad & Auditoría
        </button>
      </div>

      {/* Mensajes de Retroalimentación Operativa */}
      {mensajeExito && (
        <div className="mb-4 p-3 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}
      {mensajeError && (
        <div className="mb-4 p-3 rounded-[4px] bg-[#ffebee] border border-[#ffcdd2] text-[#b71c1c] text-xs flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-[#c62828] shrink-0" />
          <span>{mensajeError}</span>
        </div>
      )}

      {/* 3. Contenedor Principal: Secciones de Configuración + Barra Lateral Colapsable */}
      <div className={`grid grid-cols-1 ${sidebarOpen ? 'xl:grid-cols-12 gap-6' : 'grid-cols-1'} items-start`}>
        {/* Columna Izquierda: Paneles Operativos según Pestaña Activa */}
        <div className={`${sidebarOpen ? 'xl:col-span-7' : 'w-full'} space-y-4`}>
          {/* ========================================================= */}
          {/* PESTAÑA 1: SERVICIOS Y COBERTURAS AMA                     */}
          {/* ========================================================= */}
          {activeTab === 'servicios' && (
            <div className="space-y-4">
              {/* Card 1: Datos de Producto AMA Asociado */}
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#d81e05]" />
                    <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                      1. Producto AMA Asociado al Convenio
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectionAmaProduct(!showSectionAmaProduct)}
                    className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showSectionAmaProduct ? 'Ocultar' : 'Mostrar'}</span>
                    {showSectionAmaProduct ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showSectionAmaProduct && (
                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                          Código Producto AMA (Core Asistencias)
                        </label>
                        <input
                          type="text"
                          value={productoAma.codigoProductoAma || ''}
                          onChange={(e) => handleProductoAmaChange('codigoProductoAma', e.target.value)}
                          placeholder="Ej. AMA-PET-CL-01"
                          className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs font-mono font-bold text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                          Póliza Colectiva Marco / Registro
                        </label>
                        <input
                          type="text"
                          value={productoAma.colectivoPolizaMarco || ''}
                          onChange={(e) => handleProductoAmaChange('colectivoPolizaMarco', e.target.value)}
                          placeholder="Ej. POL-COL-MAWDY-2025"
                          className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs font-mono text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                          Nombre Comercial del Producto de Asistencia
                        </label>
                        <input
                          type="text"
                          value={productoAma.nombreProducto || ''}
                          onChange={(e) => handleProductoAmaChange('nombreProducto', e.target.value)}
                          placeholder="Ej. Asistencia Integral Mascotas Senior & Puppy"
                          className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs font-medium text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                          Línea de Asistencia / Colectivo
                        </label>
                        <input
                          type="text"
                          value={productoAma.lineaAsistencia || ''}
                          onChange={(e) => handleProductoAmaChange('lineaAsistencia', e.target.value)}
                          placeholder="Ej. Mascotas Domésticas (Caninos y Felinos)"
                          className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Catálogo de Servicios y Garantías en Cobertura */}
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#d81e05]" />
                    <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                      2. Servicios en Cobertura ({serviciosList.length} prestaciones)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartAddService}
                      className="py-1 px-2.5 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Servicio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSectionServicesCatalog(!showSectionServicesCatalog)}
                      className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showSectionServicesCatalog ? 'Ocultar' : 'Mostrar'}</span>
                      {showSectionServicesCatalog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {showSectionServicesCatalog && (
                  <div className="p-4 space-y-3">
                    {/* Editor en línea de servicio (Si está añadiendo o editando) */}
                    {(isAddingNewService || editingServiceIndex !== null) && (
                      <div className="p-4 rounded-[4px] bg-[#f5f6f7] border border-[#d81e05]/30 space-y-3 mb-4 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#e8ebed]">
                          <span className="text-xs font-bold text-[#d81e05]">
                            {isAddingNewService ? 'Nueva Prestación en Cobertura' : 'Modificar Prestación en Cobertura'}
                          </span>
                          <span className="text-[10px] text-[#89969a] font-mono">
                            Código: {serviceDraft.codigoServicio || 'PENDIENTE'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                              Título del Servicio
                            </label>
                            <input
                              type="text"
                              value={serviceDraft.nombre}
                              onChange={(e) => setServiceDraft({ ...serviceDraft, nombre: e.target.value })}
                              placeholder="Ej. Consulta Veterinaria de Urgencia 24/7"
                              className="w-full px-3 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] text-xs font-bold text-[#2d373d] focus:border-[#d81e05] outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-[#526570]">
                                Ícono Representativo de la Prestación
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowIconCatalog(!showIconCatalog)}
                                className="text-[11px] text-[#d81e05] font-semibold hover:underline cursor-pointer"
                              >
                                {showIconCatalog ? 'Ocultar catálogo' : 'Cambiar ícono (24 opciones)'}
                              </button>
                            </div>

                            {/* Vista previa del ícono seleccionado */}
                            {(() => {
                              const ActiveIconComp = getIconComponent(serviceDraft.icono);
                              const activeIconMeta = ICONOS_DISPONIBLES.find((i) => i.id === serviceDraft.icono);
                              return (
                                <div className="flex items-center gap-3 p-2.5 bg-white border border-[#e8ebed] rounded-[4px] mb-2">
                                  <div className="w-9 h-9 rounded-[4px] bg-[#ffebee] text-[#d81e05] flex items-center justify-center shrink-0 border border-[#ffcdd2]">
                                    <ActiveIconComp className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#2d373d] truncate">
                                      {activeIconMeta?.label || serviceDraft.icono}
                                    </p>
                                    <p className="text-[10px] text-[#89969a] font-mono">
                                      Identificador: <span className="font-bold text-[#2d373d]">{serviceDraft.icono}</span> · Categoría: {activeIconMeta?.categoryLabel || 'General'}
                                    </p>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                                    Activo
                                  </span>
                                </div>
                              );
                            })()}

                            {/* Catálogo Visual con Filtros por Categoría */}
                            {showIconCatalog && (
                              <div className="p-3 bg-white border border-[#e8ebed] rounded-[4px] space-y-2.5">
                                {/* Pestañas de categoría */}
                                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#e8ebed]">
                                  {[
                                    { id: 'todos', label: 'Todos (24)' },
                                    { id: 'urgencias', label: 'Urgencias' },
                                    { id: 'clinica', label: 'Clínica' },
                                    { id: 'telemed', label: 'Telemedicina' },
                                    { id: 'preventivo', label: 'Preventivo' },
                                    { id: 'bienestar', label: 'Bienestar' },
                                  ].map((tab) => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setIconCategoryFilter(tab.id as any)}
                                      className={`px-2.5 py-1 rounded-[3px] text-[11px] font-semibold transition-colors cursor-pointer ${
                                        iconCategoryFilter === tab.id
                                          ? 'bg-[#d81e05] text-white shadow-2xs'
                                          : 'bg-[#f5f6f7] text-[#526570] hover:bg-[#e8ebed]'
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  ))}
                                </div>

                                <input
                                  type="text"
                                  value={iconSearchTerm}
                                  onChange={(e) => setIconSearchTerm(e.target.value)}
                                  placeholder="Filtrar por nombre (ej: urgencia, ambulancia, chip, vacuna)..."
                                  className="w-full px-2.5 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] outline-none focus:border-[#d81e05]"
                                />

                                {/* Grilla de Íconos Seleccionables */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                                  {ICONOS_DISPONIBLES.filter((ic) => {
                                    const matchCat = iconCategoryFilter === 'todos' || ic.category === iconCategoryFilter;
                                    const matchSearch =
                                      !iconSearchTerm ||
                                      ic.label.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                                      ic.id.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                                      ic.categoryLabel.toLowerCase().includes(iconSearchTerm.toLowerCase());
                                    return matchCat && matchSearch;
                                  }).map((ic) => {
                                    const IconItem = ic.icon;
                                    const isSelected = serviceDraft.icono === ic.id;
                                    return (
                                      <button
                                        key={ic.id}
                                        type="button"
                                        onClick={() => setServiceDraft({ ...serviceDraft, icono: ic.id })}
                                        className={`p-2 rounded-[4px] border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#ffebee] border-[#d81e05] text-[#d81e05] ring-1 ring-[#d81e05]'
                                            : 'bg-white border-[#e8ebed] text-[#526570] hover:border-[#b0bec5] hover:bg-[#f9fafb]'
                                        }`}
                                      >
                                        <div
                                          className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-[#d81e05] text-white' : 'bg-[#f5f6f7] text-[#2d373d]'
                                          }`}
                                        >
                                          <IconItem className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[11px] font-bold truncate leading-tight">{ic.label}</p>
                                          <p className="text-[9px] text-[#89969a] truncate font-mono">{ic.categoryLabel}</p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-xs">
                          <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                            Descripción y Alcance de la Cobertura
                          </label>
                          <textarea
                            rows={2}
                            value={serviceDraft.descripcion}
                            onChange={(e) => setServiceDraft({ ...serviceDraft, descripcion: e.target.value })}
                            placeholder="Detalle clínico o alcance de la garantía para el asegurado..."
                            className="w-full px-3 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:border-[#d81e05] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                              Cód. Servicio API
                            </label>
                            <input
                              type="text"
                              value={serviceDraft.codigoServicio}
                              onChange={(e) => setServiceDraft({ ...serviceDraft, codigoServicio: e.target.value.toUpperCase() })}
                              placeholder="VET_EMERG_01"
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] font-mono text-[11px] text-[#2d373d]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                              Cód. Garantía AMA
                            </label>
                            <input
                              type="text"
                              value={serviceDraft.codigoGarantia}
                              onChange={(e) => setServiceDraft({ ...serviceDraft, codigoGarantia: e.target.value.toUpperCase() })}
                              placeholder="GAR_URG_MEDICA"
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] font-mono text-[11px] text-[#2d373d]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                              Límite de Eventos
                            </label>
                            <input
                              type="text"
                              value={serviceDraft.limiteEventos || ''}
                              onChange={(e) => setServiceDraft({ ...serviceDraft, limiteEventos: e.target.value })}
                              placeholder="3 eventos / año"
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                              Copago o Tope
                            </label>
                            <input
                              type="text"
                              value={serviceDraft.copagoOTope || ''}
                              onChange={(e) => setServiceDraft({ ...serviceDraft, copagoOTope: e.target.value })}
                              placeholder="Sin Copago (100%)"
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e8ebed]">
                          <button
                            type="button"
                            onClick={handleCancelServiceDraft}
                            className="px-3 py-1.5 rounded-[4px] border border-[#e8ebed] bg-white text-[#526570] text-xs font-semibold hover:bg-[#f5f6f7] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveServiceDraft}
                            className="px-4 py-1.5 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Cobertura</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tabla de Servicios en Cobertura */}
                    {serviciosList.length === 0 ? (
                      <div className="p-8 text-center bg-[#f5f6f7] rounded-[4px] border border-dashed border-[#e8ebed]">
                        <p className="text-xs font-semibold text-[#526570]">
                          No se han configurado coberturas para este convenio colectivo.
                        </p>
                        <button
                          type="button"
                          onClick={handleStartAddService}
                          className="mt-2 text-xs text-[#d81e05] font-bold hover:underline cursor-pointer"
                        >
                          + Agregar primera cobertura
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#e8ebed] bg-[#f5f6f7] text-[#526570] uppercase font-semibold text-[10px] tracking-wider">
                              <th className="py-2.5 px-3">Servicio / Cobertura</th>
                              <th className="py-2.5 px-3">Cód. API & Garantía</th>
                              <th className="py-2.5 px-3">Límite & Copago</th>
                              <th className="py-2.5 px-3 text-center">Estado</th>
                              <th className="py-2.5 px-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e8ebed]">
                            {serviciosList.map((srv: ServicioCobertura, index: number) => {
                              const IconComp = getIconComponent(srv.icono);
                              const isAct = srv.activo !== false;

                              return (
                                <tr key={srv.id || index} className="hover:bg-[#fbfcfc] transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-start gap-2.5">
                                      <div className="w-7 h-7 rounded-[4px] bg-[#f5f6f7] border border-[#e8ebed] flex items-center justify-center shrink-0 mt-0.5 text-[#d81e05]">
                                        <IconComp className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-bold text-[#2d373d] text-xs block truncate">
                                          {srv.nombre}
                                        </span>
                                        <span className="text-[11px] text-[#89969a] line-clamp-1">
                                          {srv.descripcion}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="flex flex-col font-mono text-[11px]">
                                      <span className="text-[#006194] font-semibold">{srv.codigoServicio}</span>
                                      <span className="text-[#89969a] text-[10px]">{srv.codigoGarantia}</span>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="flex flex-col text-[11px]">
                                      <span className="text-[#2d373d] font-medium">{srv.limiteEventos || 'Sin límite'}</span>
                                      <span className="text-[#2e7d32] text-[10px] font-semibold">{srv.copagoOTope || 'Sin copago'}</span>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleServiceActive(index)}
                                      className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold cursor-pointer transition-colors ${
                                        isAct
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                                      }`}
                                    >
                                      {isAct ? '✓ Activa' : 'Inactiva'}
                                    </button>
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditService(index)}
                                        className="p-1 rounded text-[#526570] hover:text-[#006194] hover:bg-[#e1f5fe] transition-colors cursor-pointer"
                                        title="Editar prestación"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteService(index)}
                                        className="p-1 rounded text-[#89969a] hover:text-[#d81e05] hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Eliminar prestación"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 2: IDENTIDAD VISUAL & PWA MiA                     */}
          {/* ========================================================= */}
          {activeTab === 'identidad' && (
            <div className="space-y-4">
              {/* Card: Logotipo y Banner de Cabecera PWA */}
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#d81e05]" />
                    <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                      Banner de Cabecera & Logotipo PWA (Normas MiA)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectionBannerPwa(!showSectionBannerPwa)}
                    className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showSectionBannerPwa ? 'Ocultar' : 'Mostrar'}</span>
                    {showSectionBannerPwa ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showSectionBannerPwa && (
                  <div className="p-4 space-y-4 text-xs">
                    {/* Nota aclaratoria sobre banner de Mawdy vs sponsor */}
                    <div className="p-3 bg-[#f5f6f7] border-l-4 border-[#d81e05] rounded-[3px] text-[#526570] text-[11px] leading-relaxed">
                      <strong className="text-[#2d373d] block mb-0.5">Banner e Imagen Real Oficial:</strong>
                      El sistema utiliza automáticamente el logotipo vectorial y la gráfica oficial de Mawdy extraída de las capturas del CRM Minerva. <strong>No es necesario volver a adjuntar la imagen corporativa de Mawdy</strong>. Solo se requiere cargar una imagen si deseas asignar una fotografía publicitaria o banner de campaña personalizado para este sponsor.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Logotipo */}
                      <div className="p-3 rounded-[4px] border border-[#e8ebed] bg-[#f5f6f7]/50 space-y-2">
                        <span className="text-xs font-bold text-[#2d373d] block">
                          Logotipo Oficial del Portal
                        </span>
                        <div className="h-16 bg-white rounded-[4px] border border-[#e8ebed] flex items-center justify-center p-2 overflow-hidden">
                          <img
                            src={logoUrl}
                            alt="Logo oficial"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logos/mawdy-official.png';
                            }}
                          />
                        </div>
                        {logoError && <p className="text-[10px] text-red-600">{logoError}</p>}
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputLogoRef}
                            type="file"
                            accept=".png,.svg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFileLogo(e.target.files[0]);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputLogoRef.current?.click()}
                            disabled={subiendoLogo}
                            className="w-full py-1.5 rounded-[4px] bg-white border border-[#e8ebed] text-[#526570] hover:text-[#2d373d] hover:bg-[#f5f6f7] text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3 h-3 text-[#d81e05]" />
                            <span>{subiendoLogo ? 'Cargando...' : 'Reemplazar Logotipo (PNG/SVG)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Banner PWA */}
                      <div className="p-3 rounded-[4px] border border-[#e8ebed] bg-[#f5f6f7]/50 space-y-2">
                        <span className="text-xs font-bold text-[#2d373d] block">
                          Banner de Campaña PWA MiA
                        </span>
                        <div className="h-16 bg-white rounded-[4px] border border-[#e8ebed] flex items-center justify-center p-2 overflow-hidden relative">
                          {bannerUrl ? (
                            <img
                              src={bannerUrl}
                              alt="Banner PWA"
                              className="w-full h-full object-cover rounded-[2px]"
                            />
                          ) : (
                            <div className="text-center text-[#89969a] text-[11px]">
                              <span>Cabecera Editorial Estándar Mawdy MiA</span>
                            </div>
                          )}
                        </div>
                        {bannerError && <p className="text-[10px] text-red-600">{bannerError}</p>}
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputBannerRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFileBanner(e.target.files[0]);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputBannerRef.current?.click()}
                            disabled={subiendoBanner}
                            className="w-full py-1.5 rounded-[4px] bg-white border border-[#e8ebed] text-[#526570] hover:text-[#2d373d] hover:bg-[#f5f6f7] text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3 h-3 text-[#d81e05]" />
                            <span>{subiendoBanner ? 'Cargando...' : 'Cargar Banner Fotográfico'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card: Paleta de Colores y Tipografía */}
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#d81e05]" />
                    <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                      Paleta de Marca & Tipografía
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectionBrandingColors(!showSectionBrandingColors)}
                    className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showSectionBrandingColors ? 'Ocultar' : 'Mostrar'}</span>
                    {showSectionBrandingColors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showSectionBrandingColors && (
                  <div className="p-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Color Primario */}
                      <div className="p-3 rounded-[4px] border border-[#e8ebed] bg-[#f5f6f7]/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#2d373d]">Color Primario (Mawdy Red)</label>
                          <span className={`text-[10px] font-bold ${contrastePrimario.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {contrastePrimario.ratio}:1 ({contrastePrimario.label})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={primaryColor.length === 7 ? primaryColor : '#d81e05'}
                            onChange={(e) => handleColorHexChange('primary', e.target.value)}
                            className="w-8 h-8 rounded-[4px] border border-[#e8ebed] p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            maxLength={7}
                            value={primaryColor}
                            onChange={(e) => handleColorHexChange('primary', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono uppercase font-bold border border-[#e8ebed] rounded-[4px] bg-white text-[#2d373d]"
                          />
                        </div>
                      </div>

                      {/* Color Secundario */}
                      <div className="p-3 rounded-[4px] border border-[#e8ebed] bg-[#f5f6f7]/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#2d373d]">Color Secundario / Superficie</label>
                          <span className={`text-[10px] font-bold ${contrasteSecundario.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {contrasteSecundario.ratio}:1 ({contrasteSecundario.label})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={secondaryColor.length === 7 ? secondaryColor : '#2d373d'}
                            onChange={(e) => handleColorHexChange('secondary', e.target.value)}
                            className="w-8 h-8 rounded-[4px] border border-[#e8ebed] p-0.5 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            maxLength={7}
                            value={secondaryColor}
                            onChange={(e) => handleColorHexChange('secondary', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono uppercase font-bold border border-[#e8ebed] rounded-[4px] bg-white text-[#2d373d]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tipografía */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#526570] mb-2">
                        Familia Tipográfica
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FUENTES_OPCIONES.map((f) => {
                          const isSel = fuenteActual === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => handleFuenteChange(f.id)}
                              className={`p-2.5 rounded-[4px] border text-left cursor-pointer transition-all ${
                                isSel
                                  ? 'border-[#d81e05] bg-[#d81e05]/5 text-[#d81e05] font-bold'
                                  : 'border-[#e8ebed] hover:border-[#cccfd2] text-[#2d373d] bg-white'
                              }`}
                            >
                              <span className="text-xs block truncate" style={{ fontFamily: `'${f.id}', sans-serif` }}>
                                {f.nombre}
                              </span>
                              <span className="text-[10px] text-[#89969a] block mt-0.5 truncate">{f.estilo}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card: Carnet Digital Mascota */}
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-[#d81e05]" />
                    <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider">
                      Carnet Digital de Mascota Asegurada
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSectionCarnet(!showSectionCarnet)}
                    className="text-xs text-[#d81e05] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showSectionCarnet ? 'Ocultar' : 'Mostrar'}</span>
                    {showSectionCarnet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showSectionCarnet && (
                  <div className="p-4 space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                        Título del Carnet Digital
                      </label>
                      <input
                        type="text"
                        value={fichaMascota.lema || ''}
                        onChange={(e) => handleFichaMascotaChange('lema', e.target.value)}
                        placeholder="Carnet Digital de Mascota Asegurada"
                        className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                        Mensaje al Pie (Asistencia 24/7)
                      </label>
                      <textarea
                        rows={2}
                        value={fichaMascota.mensajeAsistencia || ''}
                        onChange={(e) => handleFichaMascotaChange('mensajeAsistencia', e.target.value)}
                        placeholder="En caso de urgencia médica 24/7 o extravío..."
                        className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 3: CONECTIVIDAD & CANAL OPERATIVO                */}
          {/* ========================================================= */}
          {activeTab === 'conectividad' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] p-5 space-y-4">
                <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider block border-b border-[#e8ebed] pb-2">
                  Parámetros de Integración & Dominio
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                      Nombre Comercial Visible
                    </label>
                    <input
                      type="text"
                      value={formData.nombreVisible}
                      onChange={(e) => handleTextChange('nombreVisible', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                      Subdominio Asignado
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.subdominio}
                        onChange={(e) => handleTextChange('subdominio', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className="flex-1 px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-l-[4px] text-xs font-mono text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none"
                      />
                      <span className="px-2.5 py-1.5 bg-[#e8ebed] text-[#526570] text-[11px] font-mono border border-l-0 border-[#e8ebed] rounded-r-[4px]">
                        .mawdypet.cl
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-[4px] bg-[#f5f6f7] border border-[#e8ebed] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2d373d]">Estado Operativo del Sponsor</p>
                      <p className="text-[11px] text-[#526570]">Control de acceso para asegurados del colectivo</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, activo: !isActivo }))}
                      className={`px-3 py-1 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        isActivo
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                      }`}
                    >
                      {isActivo ? '✓ Habilitado' : '⏸ Suspendido'}
                    </button>
                  </div>

                  <div className="p-3 rounded-[4px] bg-[#f5f6f7] border border-[#e8ebed] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2d373d]">Canal de Asistencia</p>
                      <p className="text-[11px] text-[#526570]">Pasarela de emisión y despacho</p>
                    </div>
                    <div className="flex gap-1 bg-[#e8ebed] p-1 rounded-[4px]">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, modo: 'mock' }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[3px] transition-all cursor-pointer ${
                          formData.modo !== 'real'
                            ? 'bg-white text-[#2d373d] shadow-2xs'
                            : 'text-[#526570]'
                        }`}
                      >
                        Estándar
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, modo: 'real' }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[3px] transition-all cursor-pointer ${
                          formData.modo === 'real'
                            ? 'bg-[#d81e05] text-white shadow-2xs'
                            : 'text-[#526570]'
                        }`}
                      >
                        Directa AMA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 4: AUDITORÍA & TRAZABILIDAD                      */}
          {/* ========================================================= */}
          {activeTab === 'auditoria' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] p-5 space-y-4">
                <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider block border-b border-[#e8ebed] pb-2">
                  Registro de Auditoría de Operaciones B2B2C
                </span>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#526570] mb-1">
                      Operador Responsable de la Modificación
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="Identificador del operador"
                      className="w-full px-3 py-1.5 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-xs font-mono font-bold text-[#2d373d] focus:bg-white focus:border-[#d81e05] outline-none"
                    />
                    <p className="text-[10px] text-[#89969a] mt-1">
                      Identificador de usuario corporativo que quedará registrado en los logs del CRM Minerva.
                    </p>
                  </div>

                  <div className="p-3 bg-[#f5f6f7] rounded-[4px] border border-[#e8ebed] text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#526570]">ID Técnico del Sponsor:</span>
                      <span className="text-[#2d373d] font-bold">{formData.sponsorId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#526570]">Última Modificación:</span>
                      <span className="text-[#2d373d]">
                        {formData.lastModifiedAt ? new Date(formData.lastModifiedAt).toLocaleString('es-CL') : 'Sin registro'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#526570]">Último Operador:</span>
                      <span className="text-[#2d373d]">{formData.lastModifiedBy || 'admin-mawdy'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Barra Lateral Colapsable con Vista Previa PWA (media_1789481255398.png) */}
        {sidebarOpen && (
          <div className="xl:col-span-5 sticky top-16 space-y-3 font-sans">
            <div className="bg-white rounded-[6px] border border-[#e8ebed] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-4 py-2 border-b border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between">
                <span className="text-xs font-bold text-[#2d373d] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d81e05]" />
                  <span>Vista Previa PWA MiA ({formData.nombreVisible})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="text-xs text-[#d81e05] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <span>Cerrar</span>
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Maqueta PWA MiA Responsiva */}
              <div
                className="p-3 bg-[#f5f6f7]"
                style={{ fontFamily: `'${fuenteActual}', sans-serif` }}
              >
                {/* Pantalla Simulador Móvil */}
                <div className="bg-white rounded-[8px] border border-[#e8ebed] shadow-sm overflow-hidden text-left">
                  {/* Status Bar */}
                  <div className="bg-[#2d373d] text-white px-3 py-1 text-[10px] flex items-center justify-between font-mono">
                    <span>09:41</span>
                    <span className="truncate max-w-[120px]">{formData.subdominio}.mawdypet.cl</span>
                    <span>100%</span>
                  </div>

                  {/* Header PWA MiA */}
                  <div className="px-3 py-2 bg-white border-b border-[#e8ebed] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-5 max-w-[100px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logos/mawdy-official.png';
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Urgencias 24/7
                    </span>
                  </div>

                  {/* Banner de Campaña PWA si existe */}
                  {bannerUrl && (
                    <div className="h-20 w-full overflow-hidden border-b border-[#e8ebed]">
                      <img
                        src={bannerUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contenido PWA: Mascota y Coberturas */}
                  <div className="p-3 space-y-2.5">
                    {/* Tarjeta Mascota Asegurada */}
                    <div className="p-2.5 rounded-[6px] border border-[#e8ebed] bg-white relative overflow-hidden shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#2d373d]">Milo (Border Collie)</h4>
                          <p className="text-[10px] text-[#89969a]">Póliza: {productoAma.colectivoPolizaMarco || 'MAWDY-001'}</p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Cobertura Activa
                        </span>
                      </div>
                    </div>

                    {/* Catálogo de Coberturas en Vivo */}
                    <div>
                      <span className="text-[11px] font-bold text-[#2d373d] block mb-1.5">
                        Prestaciones Habilitadas ({serviciosList.filter((s: ServicioCobertura) => s.activo !== false).length})
                      </span>
                      <div className="space-y-1.5">
                        {serviciosList.filter((s: ServicioCobertura) => s.activo !== false).slice(0, 4).map((srv: ServicioCobertura, idx: number) => {
                          const IconC = getIconComponent(srv.icono);
                          return (
                            <div
                              key={srv.id || idx}
                              className="p-2 rounded-[4px] bg-[#f5f6f7] border border-[#e8ebed] flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                >
                                  <IconC className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[11px] font-bold text-[#2d373d] block truncate">
                                    {srv.nombre}
                                  </span>
                                  <span className="text-[9px] text-[#89969a] block truncate">
                                    {srv.limiteEventos}
                                  </span>
                                </div>
                              </div>
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                              >
                                {srv.copagoOTope || 'Cubierto'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Baja Definitiva */}
      <SponsorDeleteModal
        isOpen={showDeleteModal}
        sponsor={formData}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={(deletedId) => {
          if (onDeleteSuccess) {
            onDeleteSuccess(deletedId);
          }
          onBack();
        }}
      />
    </div>
  );
}
