import { useState, useEffect, useCallback, type FC } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { PetPlaceholder } from './PetPlaceholder';

export interface PetGalleryItem {
  id: string;
  url: string;
  caption?: string;
  date?: string;
}

export interface PetGalleryProps {
  images: PetGalleryItem[];
  petName: string;
  species?: string;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

/**
 * PetGallery — Componente reutilizable de galería fotográfica para el paciente asegurado.
 * Incluye visualizador Lightbox interactivo, navegación por teclado y fallback editorial.
 */
export const PetGallery: FC<PetGalleryProps> = ({
  images,
  petName,
  species,
  columns = 3,
  emptyMessage = 'No hay fotografías registradas aún en el expediente.',
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isOpen = selectedIndex !== null;
  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % images.length);
  }, [selectedIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Control por teclado (Esc, Flecha Izquierda, Flecha Derecha)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  if (images.length === 0) {
    return (
      <div
        className={`bg-stone-50 border border-stone-200/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 ${className}`}
      >
        <PetPlaceholder name={petName} species={species} size="lg" />
        <div className="max-w-xs">
          <p className="text-sm font-semibold text-stone-800">Expediente Fotográfico</p>
          <p className="text-xs text-stone-500 mt-1">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Retícula de Fotografías */}
      <div className={`grid gap-3 ${gridColsClass}`}>
        {images.map((item, index) => (
          <button
            key={item.id || index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) cursor-pointer"
          >
            <img
              src={item.url}
              alt={item.caption || `Fotografía ${index + 1} de ${petName}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ImageIcon size={20} />
            </div>
            {item.date && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white bg-black/60 rounded">
                {item.date}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Visor Lightbox */}
      {isOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleClose}
        >
          {/* Contenedor Modal */}
          <div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Cerrar visor (Esc)"
            >
              <X size={24} />
            </button>

            {/* Imagen Principal */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center border border-white/10 shadow-2xl">
              <img
                src={currentImage.url}
                alt={currentImage.caption || `Fotografía de ${petName}`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {/* Botones de navegación */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                    title="Anterior (Flecha izquierda)"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                    title="Siguiente (Flecha derecha)"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Pie de foto y contador */}
            <div className="w-full flex items-center justify-between text-xs text-white/80 mt-3 px-1">
              <span className="truncate">
                {currentImage.caption || `Expediente de ${petName}`}
                {currentImage.date && ` · ${currentImage.date}`}
              </span>
              <span className="font-mono text-stone-400 shrink-0 ml-4">
                {selectedIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
