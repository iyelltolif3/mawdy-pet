import type { FC } from 'react';
import { PawPrint } from 'lucide-react';

export interface PetPlaceholderProps {
  name?: string;
  species?: 'perro' | 'gato' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
}

const SIZE_STYLES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', { box: string; iconSize: number; text: string }> = {
  xs: { box: 'w-6 h-6', iconSize: 12, text: 'text-[10px]' },
  sm: { box: 'w-8 h-8', iconSize: 14, text: 'text-xs' },
  md: { box: 'w-10 h-10', iconSize: 18, text: 'text-sm' },
  lg: { box: 'w-14 h-14', iconSize: 22, text: 'text-base' },
  xl: { box: 'w-20 h-20', iconSize: 28, text: 'text-xl' },
  '2xl': { box: 'w-28 h-28', iconSize: 36, text: 'text-2xl' },
};

/**
 * PetPlaceholder — Placeholder editorial sobrio para mascotas aseguradas sin fotografía.
 * Evita emojis informales o ilustraciones infantiles, respetando la paleta Warm Linen & Stone.
 */
export const PetPlaceholder: FC<PetPlaceholderProps> = ({
  name,
  species,
  size = 'md',
  className = '',
}) => {
  const isCustomNumeric = typeof size === 'number';
  const sizeConfig = isCustomNumeric ? null : SIZE_STYLES[size] || SIZE_STYLES.md;

  const initial = name ? name.trim().charAt(0).toUpperCase() : '';
  const isCat = species?.toLowerCase().includes('gato') || species?.toLowerCase().includes('felin');

  const customStyle = isCustomNumeric
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  const iconPx = isCustomNumeric ? Math.round((size as number) * 0.45) : sizeConfig!.iconSize;

  return (
    <div
      style={customStyle}
      className={`relative flex items-center justify-center bg-stone-100 text-stone-600 border border-stone-200/90 rounded-2xl select-none overflow-hidden shrink-0 ${
        !isCustomNumeric ? sizeConfig!.box : ''
      } ${className}`}
      title={name ? `${name} (Sin fotografía registrada)` : 'Paciente asegurado'}
    >
      {/* Silueta vectorial editorial de fondo */}
      <svg
        className="absolute inset-0 w-full h-full text-stone-200/60 pointer-events-none"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        {isCat ? (
          // Silueta felina geométrica estilizada
          <path d="M50 20 C62 20, 72 30, 72 44 C72 58, 62 76, 50 82 C38 76, 28 58, 28 44 C28 30, 38 20, 50 20 Z M32 24 L42 36 L30 40 Z M68 24 L58 36 L70 40 Z" opacity="0.35" />
        ) : (
          // Silueta canina sobria estilizada
          <path d="M50 18 C64 18, 74 30, 74 46 C74 62, 63 80, 50 84 C37 80, 26 62, 26 46 C26 30, 36 18, 50 18 Z M24 38 C20 44, 18 56, 22 66 Z M76 38 C80 44, 82 56, 78 66 Z" opacity="0.35" />
        )}
      </svg>

      {/* Contenido en primer plano: Inicial tipográfica o icono Lucide paw */}
      {initial ? (
        <span className={`relative z-10 font-bold font-headline text-stone-700 tracking-tight ${!isCustomNumeric ? sizeConfig!.text : ''}`}>
          {initial}
        </span>
      ) : (
        <PawPrint
          size={iconPx}
          strokeWidth={2}
          className="relative z-10 text-stone-400"
        />
      )}
    </div>
  );
};
