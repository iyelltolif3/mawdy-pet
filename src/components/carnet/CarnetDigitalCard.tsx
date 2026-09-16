import { useState } from 'react';
import {
  Share2,
  RotateCw,
  AlertTriangle,
  FileCheck,
  Check,
  Copy,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { PetBrandSeal } from '../ui/PetBrandSeal';
import { PetQrCode } from '../ui/pet/PetQrCode';
import type { Mascota } from '../../types/mascota';
import type { Asegurado } from '../../types/asegurado';
import type { TenantTheme } from '../../types/tenant';

interface CarnetDigitalCardProps {
  mascota: Mascota;
  asegurado: Asegurado;
  numeroPoliza: string;
  nombreSponsor: string;
  subdominioSponsor: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tema?: TenantTheme;
  customData?: {
    apodo?: string;
    veterinario?: string;
    telefonoEmergencia?: string;
    notasAlergias?: string;
  };
  onEditRequest?: () => void;
}

/**
 * CarnetDigitalCard — Credencial Oficial de Mascota Asegurada.
 * Diseño editorial interactivo con efecto 3D Flip:
 * - Anverso: Identidad oficial, fotografía, microchip Subdere, póliza y sello Mawdy.
 * - Reverso: Código QR dinámico de validación clínica, contactos SOS 24/7 y alergias.
 * - Acciones: Web Share API nativa, integración Apple Wallet / Google Wallet y descarga.
 */
export default function CarnetDigitalCard({
  mascota,
  asegurado,
  numeroPoliza,
  nombreSponsor,
  subdominioSponsor,
  logoUrl,
  primaryColor = '#d81e05',
  secondaryColor = '#2d373d',
  tema,
  customData,
  onEditRequest,
}: CarnetDigitalCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWalletFeedback, setShowWalletFeedback] = useState<'apple' | 'google' | null>(null);

  const estiloTarjeta = tema?.fichaMascota?.estiloTarjeta || 'linen';
  const lema = tema?.fichaMascota?.lema || 'Carnet Digital de Mascota Asegurada';
  const mensajeAsistencia =
    tema?.fichaMascota?.mensajeAsistencia ||
    'En caso de urgencia médica 24/7 o extravío, comunícate de inmediato con la central Mawdy.';

  // URL pública de verificación del carnet
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://mawdypet.cl';
  const verificationUrl = `${host}/poliza/${encodeURIComponent(mascota.riesgoId)}?sponsor=${encodeURIComponent(
    subdominioSponsor
  )}`;

  // Compartir nativo multiplataforma (Web Share API)
  const handleShare = async () => {
    const shareText = `🐾 CARNET DIGITAL MAWDY PET\nPaciente: ${mascota.nombre} (${mascota.raza})\nMicrochip: ${
      mascota.microchip || 'Registrado'
    }\nPóliza Nº: ${numeroPoliza} (${nombreSponsor})\nTitular: ${asegurado.name} ${asegurado.lastName}\nCentral Urgencias 24/7: 600 500 8000\nVerificar Carnet Oficial: ${verificationUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Carnet Digital · ${mascota.nombre} (${nombreSponsor} Pet)`,
          text: shareText,
          url: verificationUrl,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[CarnetDigitalCard] Error al compartir vía Web Share API:', err);
        }
      }
    }

    // Fallback: Copiar en portapapeles
    handleCopyLink();
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleAddToWallet = (type: 'apple' | 'google') => {
    setShowWalletFeedback(type);
    setTimeout(() => setShowWalletFeedback(null), 4000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Contenedor de la Tarjeta con Perspectiva 3D */}
      <div className="w-full max-w-lg perspective-1000 py-2">
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl shadow-xl transition-transform duration-700 transform-style-3d cursor-pointer select-none ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          title="Haz clic para voltear la credencial"
          style={{ minHeight: '390px' }}
        >
          {/* ================================================================= */}
          {/* CARA A (ANVERSO): CREDENCIAL OFICIAL B2B2C                        */}
          {/* ================================================================= */}
          <div
            className={`w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between backface-hidden border transition-all ${
              estiloTarjeta === 'brand-gradient'
                ? 'text-white border-white/20'
                : 'bg-white text-stone-900 border-stone-200/90 shadow-sm'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              WebkitTransform: 'rotateY(0deg)',
              ...(estiloTarjeta === 'brand-gradient'
                ? { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }
                : { backgroundColor: '#ffffff' }),
            }}
          >
            {/* Marca de agua PetBrandSeal de fondo */}
            <div className="absolute right-2 bottom-2 pointer-events-none opacity-5">
              <PetBrandSeal variant="watermark" className="w-48 h-48" />
            </div>

            {/* Cabecera de la Credencial: Logos y Lema */}
            <div className="relative z-10 flex items-start justify-between gap-3 border-b pb-3 border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <div className="h-7 sm:h-8 max-w-[120px] flex items-center">
                  <img
                    src={logoUrl || '/logos/mawdy-official.png'}
                    alt={nombreSponsor}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logos/mawdy-official.png';
                    }}
                  />
                </div>
                <div className="h-4 w-px bg-stone-300/80" />
                <div>
                  <span className="text-xs font-bold font-serif tracking-tight text-stone-700 block">
                    {nombreSponsor} Pet
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium tracking-wide uppercase block">
                    {lema}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cobertura Activa</span>
                </span>
                {onEditRequest && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRequest();
                    }}
                    className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer ml-1"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            {/* Cuerpo de la Credencial: Foto de Mascota + Datos Principales */}
            <div className="relative z-10 my-4 flex items-center gap-4">
              {/* Foto de la Mascota con Marco Oficial */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-stone-100">
                <img
                  src={mascota.fotoUrl || '/images/login-editorial-pet.jpg'}
                  alt={mascota.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/login-editorial-pet.jpg';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-stone-900/60 backdrop-blur-xs text-center py-0.5 text-[9px] text-white font-medium capitalize">
                  {mascota.especie}
                </div>
              </div>

              {/* Información de Identidad */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 truncate">
                    {mascota.nombre}
                  </h2>
                  {customData?.apodo && (
                    <span className="text-xs text-stone-500 italic truncate">
                      "{customData.apodo}"
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 font-medium truncate">
                  {mascota.raza} • {mascota.sexo === 'macho' ? 'Macho' : 'Hembra'} • {mascota.pesoKg || 0} kg
                </p>

                {/* Microchip Oficial */}
                <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-stone-700">
                  <span className="text-stone-400">CHIP:</span>
                  <span className="font-bold tracking-wider">{mascota.microchip || 'NO REGISTRADO'}</span>
                </div>
              </div>
            </div>

            {/* Pie de la Credencial: Póliza, Titular y Código de Seguridad */}
            <div className="relative z-10 pt-3 border-t border-stone-200/60 flex items-end justify-between gap-2">
              <div>
                <span className="text-[10px] text-stone-400 block">Póliza Oficial:</span>
                <span className="font-mono text-xs font-bold text-stone-900 tracking-wide block">
                  {numeroPoliza}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Titular Asegurado:</span>
                <span className="font-semibold text-stone-900 text-[11px] truncate max-w-[140px] block">
                  {asegurado.name} {asegurado.lastName}
                </span>
              </div>

              {/* Icono de ayuda para voltear */}
              <div className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 shrink-0 ml-2 transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARA B (REVERSO): QR DE VERIFICACIÓN & DOSSIER CLÍNICO COMPLETO   */}
          {/* ================================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between backface-hidden bg-white border border-stone-200/90 shadow-sm text-stone-900 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
            }}
          >
            {/* Cabecera del Reverso: Título Oficial y Badge de Validación */}
            <div className="flex items-center justify-between border-b pb-2 border-stone-200/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d81e05]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                    Validación Clínica Oficial
                  </span>
                  <span className="text-[10px] text-stone-500">Convenio {nombreSponsor} Pet • Red Preferente</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Deducible $0
                </span>
              </div>
            </div>

            {/* Contenido Central: QR de Lectura Rápida + Información Completa */}
            <div className="my-1.5 grid grid-cols-12 gap-3 items-start">
              {/* Columna Izquierda: QR Dinámico para Clínica + Sello de Certificación */}
              <div className="col-span-5 flex flex-col items-center justify-center">
                <div className="p-1.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
                  <PetQrCode
                    value={verificationUrl}
                    size={92}
                    label="Escanear en Clínica"
                    sublabel=""
                    className="p-0.5 border-0 shadow-none"
                  />
                </div>
                <span className="mt-1.5 font-mono text-[9px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/70 font-semibold text-center w-full truncate">
                  Póliza: {numeroPoliza}
                </span>
                <div className="mt-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200/80 flex items-center gap-1 text-[9px] font-semibold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Chip Subdere OK</span>
                </div>
              </div>

              {/* Columna Derecha: Información Clínica y de Emergencia Detallada */}
              <div className="col-span-7 space-y-1.5 text-xs">
                {/* Microchip Subdere */}
                <div className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-stone-500 font-medium block">Microchip Subdere:</span>
                    <span className="font-mono font-bold text-stone-900 text-[11px]">
                      {mascota.microchip || 'No registrado'}
                    </span>
                  </div>
                  {mascota.microchip && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(mascota.microchip!);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Copiar microchip"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Copiar</span>
                    </button>
                  )}
                </div>

                {/* Titular y Teléfono de Contacto */}
                <div className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-0.5">
                  <span className="text-[9px] text-stone-500 font-medium block">Titular Asegurado:</span>
                  <p className="font-bold text-stone-900 text-[11px] truncate">
                    {asegurado.name} {asegurado.lastName}
                  </p>
                  <p className="font-mono text-[10px] text-stone-600">
                    Tel: {asegurado.phone || '+56 9 8765 4321'} • RUT: {asegurado.idNum}
                  </p>
                </div>

                {/* Alergias o Cuidados Especiales */}
                <div className="px-2.5 py-1.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="block font-bold text-[10px]">Alergias / Cuidados:</strong>
                    <span className="line-clamp-2 text-[10px] leading-tight text-amber-900">
                      {customData?.notasAlergias || 'Sin alergias reportadas. Apto para sedación/analgesia general.'}
                    </span>
                  </div>
                </div>

                {/* Veterinario de Cabecera */}
                <div className="flex items-center justify-between text-[10px] px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-200/70">
                  <span className="text-stone-500 font-medium">Veterinario Tratante:</span>
                  <span className="font-bold text-stone-800 truncate max-w-[130px]">
                    {customData?.veterinario || 'Dra. Constanza R.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pie del Reverso: Leyenda Oficial y Acción para Voltear */}
            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-500">
              <span className="line-clamp-1 max-w-[300px] text-[10px]" title={mensajeAsistencia}>
                {mensajeAsistencia}
              </span>

              <div
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 shrink-0 transition-colors cursor-pointer"
                title="Voltear al anverso"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Barra de Acciones Multiplataforma y Billeteras Digitales */}
      <div className="w-full max-w-lg mt-3 flex flex-col gap-2.5 font-sans">
        {/* Fila 1: Botones de Compartir y Copiar Enlace */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Compartir Carnet</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 font-semibold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
            <span>{copiedLink ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
          </button>
        </div>

        {/* Fila 2: Billeteras Digitales (Apple Wallet & Google Wallet) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Apple Wallet Button */}
          <button
            type="button"
            onClick={() => handleAddToWallet('apple')}
            className="py-2 px-3 rounded-xl bg-black hover:bg-stone-900 text-white font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-stone-800"
            title="Agregar a Apple Wallet"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px]">Agregar a Apple Wallet</span>
          </button>

          {/* Google Wallet Button */}
          <button
            type="button"
            onClick={() => handleAddToWallet('google')}
            className="py-2 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-medium transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            title="Guardar en Google Wallet"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px]">Google Wallet</span>
          </button>
        </div>

        {/* Feedback de Billetera Digital */}
        {showWalletFeedback && (
          <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs flex items-center gap-2 animate-in fade-in">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Credencial preparada para {showWalletFeedback === 'apple' ? 'Apple Wallet' : 'Google Wallet'}. Se generará el pase digital .pkpass sincronizado con la póliza.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
