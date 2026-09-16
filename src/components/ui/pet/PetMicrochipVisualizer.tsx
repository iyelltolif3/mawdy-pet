import { useState } from 'react';
import { Cpu, Copy, Check } from 'lucide-react';
import { Badge } from '../Badge';

export interface PetMicrochipVisualizerProps {
  chipNumber?: string;
  isRegistered?: boolean;
  implantationDate?: string;
  className?: string;
}

/**
 * PetMicrochipVisualizer — Visualización oficial y normalizada del microchip subcutáneo
 * de 15 dígitos bajo norma internacional ISO 11784 / ISO 11785.
 */
export function PetMicrochipVisualizer({
  chipNumber,
  isRegistered = true,
  implantationDate,
  className = '',
}: PetMicrochipVisualizerProps) {
  const [copied, setCopied] = useState(false);

  // Formatear microchip de 15 dígitos en bloques de 3 (ej. 941 000 024 891 234)
  const formattedChip = chipNumber
    ? chipNumber.replace(/\s+/g, '').replace(/(\d{3})(?=\d)/g, '$1 ')
    : 'EN TRÁMITE';

  const handleCopy = () => {
    if (!chipNumber) return;
    navigator.clipboard.writeText(chipNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-stone-50 border border-stone-200/90 rounded-2xl p-4 flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-stone-700">
          <div className="w-7 h-7 rounded-md bg-stone-200/70 flex items-center justify-center text-stone-700 shrink-0">
            <Cpu size={16} strokeWidth={2} />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block leading-tight">
              Microchip Oficial ISO
            </span>
            <span className="text-[10px] text-stone-500 font-mono block">
              ISO 11784 / 11785 FDX-B
            </span>
          </div>
        </div>

        <Badge
          status={isRegistered && chipNumber ? 'success' : 'warning'}
          size="sm"
          dot
        >
          {isRegistered && chipNumber ? 'Registrado' : 'En trámite'}
        </Badge>
      </div>

      {/* Visualizador de Número y Código de Barras Decorativo */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Identificador Único Nacional
          </span>
          <span className="font-mono text-sm font-bold text-stone-900 tracking-wider break-all block">
            {formattedChip}
          </span>
        </div>

        {chipNumber && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors shrink-0"
            title="Copiar número de chip"
          >
            {copied ? (
              <Check size={16} className="text-emerald-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        )}
      </div>

      {implantationDate && (
        <span className="text-[11px] text-stone-500">
          Fecha de implantación: <strong className="text-stone-700">{implantationDate}</strong>
        </span>
      )}
    </div>
  );
}
