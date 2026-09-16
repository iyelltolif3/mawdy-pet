import { useState, useEffect, type ReactNode } from 'react';
import { PetPlaceholder } from './PetPlaceholder';

export type PetAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface PetAvatarProps {
  src?: string;
  name: string;
  species?: 'perro' | 'gato' | string;
  size?: PetAvatarSize;
  shape?: 'rounded' | 'circle';
  border?: boolean;
  badge?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

/**
 * PetAvatar — Avatar oficial del paciente asegurado.
 * Muestra la fotografía oficial con recorte perfecto o transiciona hacia el placeholder editorial
 * de Mawdy Pet, erradicando emojis improvisados.
 */
export function PetAvatar({
  src,
  name,
  species,
  size = 'md',
  shape = 'rounded',
  border = true,
  badge,
  className = '',
  onClick,
}: PetAvatarProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const isCustomNumeric = typeof size === 'number';
  const sizeClass = !isCustomNumeric ? SIZE_CLASSES[size] || SIZE_CLASSES.md : '';
  const customStyle = isCustomNumeric ? { width: `${size}px`, height: `${size}px` } : undefined;

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const borderClass = border ? 'border border-stone-200/90 shadow-2xs' : '';
  const isClickable = Boolean(onClick);

  const shouldShowImage = Boolean(src && src.trim() !== '' && !hasError);

  return (
    <div
      onClick={onClick}
      style={customStyle}
      className={`relative inline-flex shrink-0 select-none overflow-hidden ${sizeClass} ${shapeClass} ${borderClass} ${
        isClickable ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      } ${className}`}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={`Fotografía de ${name}`}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${shapeClass}`}
          loading="lazy"
        />
      ) : (
        <PetPlaceholder
          name={name}
          species={species}
          size={size}
          className={`w-full h-full ${shapeClass}`}
        />
      )}

      {badge && (
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 z-10">
          {badge}
        </div>
      )}
    </div>
  );
}
