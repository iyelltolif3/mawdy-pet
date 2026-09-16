import type { FC } from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

export interface PetQrCodeProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

/**
 * PetQrCode — Generador visual del código QR de validación para el Carnet Digital.
 * Incluye marco de seguridad, contraste de lectura clínica y datos verificables.
 */
export const PetQrCode: FC<PetQrCodeProps> = ({
  value,
  size = 140,
  label = 'Verificación Oficial',
  sublabel = 'Escanear para validar cobertura y ficha médica',
  className = '',
}) => {
  // Generamos un QR SVG vectorial utilizando un patrón reproducible o un endpoint SVG seguro
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value
  )}&format=svg&margin=0`;

  return (
    <div
      className={`bg-white border border-stone-200/90 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs ${className}`}
    >
      <div className="relative p-2 bg-white rounded-xl border border-stone-200/60 shadow-2xs">
        <img
          src={qrUrl}
          alt={`Código QR de validación: ${value}`}
          width={size}
          height={size}
          className="rounded-md object-contain"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-white border border-stone-200/90 shadow-xs flex items-center justify-center text-(--color-primary)">
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-900">
          <QrCode size={14} className="text-stone-400" />
          <span>{label}</span>
        </div>
        {sublabel && (
          <p className="text-[11px] text-stone-500 max-w-[200px] mt-0.5 leading-snug">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
};
