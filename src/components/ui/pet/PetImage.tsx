import { useState, useEffect } from 'react';
import { PetPlaceholder } from './PetPlaceholder';

export interface PetImageProps {
  src?: string;
  alt: string;
  species?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  caption?: string;
  className?: string;
  onClick?: () => void;
}

const ASPECT_RATIOS: Record<'square' | 'video' | 'portrait' | 'auto', string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
};

const ROUNDED_CLASSES: Record<'md' | 'lg' | 'xl' | '2xl' | 'full', string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * PetImage — Contenedor de fotografía para carnet, ficha médica o galerías.
 * Controla aspect ratio, estado de carga y fallback editorial automático.
 */
export function PetImage({
  src,
  alt,
  species,
  aspectRatio = 'square',
  rounded = '2xl',
  caption,
  className = '',
  onClick,
}: PetImageProps) {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const aspectClass = ASPECT_RATIOS[aspectRatio];
  const roundedClass = ROUNDED_CLASSES[rounded];
  const isClickable = Boolean(onClick);

  const shouldShowImage = Boolean(src && src.trim() !== '' && !hasError);

  return (
    <figure
      onClick={onClick}
      className={`relative flex flex-col overflow-hidden bg-stone-100 border border-stone-200/90 shadow-2xs ${roundedClass} ${aspectClass} ${
        isClickable ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {shouldShowImage ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-stone-200/70 animate-pulse z-10" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isClickable ? 'group-hover:scale-105' : ''
            }`}
            loading="lazy"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
          <PetPlaceholder name={alt} species={species} size="xl" className="w-full h-full" />
        </div>
      )}

      {caption && (
        <figcaption className="absolute bottom-0 inset-x-0 p-2 text-[11px] font-medium text-white bg-gradient-to-t from-black/60 to-transparent">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
