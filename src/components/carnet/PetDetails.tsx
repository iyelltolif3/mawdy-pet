import { useState, type FC } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import type { Mascota } from '../../types/mascota';

export interface PetDetailsProps {
  mascota: Mascota;
  ageText: string;
  className?: string;
}

/**
 * PetDetails — Bloque "Mi mascota" del Carnet Digital.
 * Muestra especie, raza, sexo, edad, peso, microchip y color/señas particulares.
 */
export const PetDetails: FC<PetDetailsProps> = ({
  mascota,
  ageText,
  className = '',
}) => {
  const [chipCopiado, setChipCopiado] = useState(false);

  const handleCopyChip = (chip: string) => {
    navigator.clipboard.writeText(chip);
    setChipCopiado(true);
    setTimeout(() => setChipCopiado(false), 2000);
  };

  const normalizedSpecies =
    mascota.especie.toLowerCase() === 'gato'
      ? 'Felino'
      : mascota.especie.toLowerCase() === 'perro'
      ? 'Canino'
      : mascota.especie;

  return (
    <div className={`p-5 border-b border-stone-100 flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900 font-headline">
          Mi mascota
        </h2>
        <span className="text-[11px] text-stone-500 font-medium">
          Ficha oficial
        </span>
      </div>

      <div className="divide-y divide-stone-100 rounded-xl border border-stone-200/80 bg-stone-50/40 p-3.5 text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Especie</span>
          <span className="font-semibold text-stone-900">{normalizedSpecies}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Raza</span>
          <span className="font-semibold text-stone-900">{mascota.raza || 'Mestizo'}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Sexo</span>
          <span className="font-semibold text-stone-900">
            {mascota.sexo === 'hembra' ? 'Hembra' : 'Macho'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Edad</span>
          <span className="font-semibold text-stone-900">{ageText}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Peso corporal</span>
          <span className="font-semibold text-stone-900">{mascota.pesoKg || 0} kg</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Microchip ISO</span>
          <div className="flex items-center gap-1.5 font-mono font-semibold text-stone-900">
            <QrCode size={13} className="text-stone-400" />
            <span>{mascota.microchip || 'En trámite'}</span>
            {mascota.microchip && (
              <button
                type="button"
                onClick={() => handleCopyChip(mascota.microchip!)}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                title="Copiar microchip al portapapeles"
              >
                {chipCopiado ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-stone-500 font-medium">Color y señas</span>
          <span className="font-semibold text-stone-900 text-right max-w-[180px] truncate">
            {mascota.colorSenasParticulares || 'Sin señas registradas'}
          </span>
        </div>
      </div>
    </div>
  );
};
