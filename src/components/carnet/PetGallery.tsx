import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Pencil } from 'lucide-react';
import { PetPlaceholder } from '../ui/pet/PetPlaceholder';

export interface PetGalleryProps {
  photos: string[];
  petName: string;
  species?: string;
  onBack: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  className?: string;
}

/**
 * PetGallery — Hero fotográfico del Carnet Digital.
 * Implementa swipe táctil en móvil, carrusel con dots si hay múltiples fotos,
 * vista única si hay 1 sola foto, y placeholder editorial sobrio si no hay fotos.
 */
export function PetGallery({
  photos,
  petName,
  species,
  onBack,
  onShare,
  onEdit,
  className = '',
}: PetGalleryProps) {
  const validPhotos = photos.filter((p) => Boolean(p && p.trim() !== ''));
  const hasMultiple = validPhotos.length > 1;
  const hasSingle = validPhotos.length === 1;
  const [activeIndex, setActiveIndex] = useState(0);

  // Swipe táctil en móvil
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev + 1) % validPhotos.length);
  }, [hasMultiple, validPhotos.length]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
  }, [hasMultiple, validPhotos.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className={`relative w-full h-72 sm:h-84 bg-stone-200 select-none overflow-hidden ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Botón de Retorno "←" */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 shadow-sm flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
        title="Volver al inicio"
        aria-label="Volver al inicio"
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </button>

      {/* Botones de Acción Flotantes (Compartir / Editar) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 shadow-sm flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Compartir carnet digital"
            aria-label="Compartir carnet digital"
          >
            <Share2 size={16} strokeWidth={2} />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 shadow-sm flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Editar ficha médica y apodo"
            aria-label="Editar ficha médica y apodo"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Renderizado de Fotografías */}
      {validPhotos.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center bg-stone-100">
          <PetPlaceholder name={petName} species={species} size="2xl" />
        </div>
      ) : hasSingle ? (
        <div className="w-full h-full relative">
          <img
            src={validPhotos[0]}
            alt={`Fotografía oficial de ${petName}`}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full relative overflow-hidden">
          {validPhotos.map((photo, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-400 ease-in-out ${
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={photo}
                alt={`${petName} - Fotografía ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
            </div>
          ))}

          {/* Flechas de Navegación Lateral */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
            title="Foto anterior"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
            title="Siguiente foto"
            aria-label="Siguiente foto"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>

          {/* Indicadores de Posición ● ○ ○ */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5 z-20">
            {validPhotos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-4 h-1.5 bg-white shadow-xs'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                title={`Ver fotografía ${idx + 1}`}
                aria-label={`Ver fotografía ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
