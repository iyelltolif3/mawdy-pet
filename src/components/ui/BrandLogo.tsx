import { useState, useEffect } from 'react';
import { useTenant } from '../../features/tenant/useTenant';

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface BrandLogoProps {
  src?: string;
  alt?: string;
  size?: BrandLogoSize;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-6 max-w-[120px]',
  md: 'h-8 max-w-[150px]',
  lg: 'h-10 max-w-[180px]',
  xl: 'h-12 max-w-[220px]',
};

/**
 * BrandLogo — Resuelve automáticamente la jerarquía de marca multi-tenant:
 * 1. Logo del Sponsor activo (Prioridad absoluta)
 * 2. Logo oficial de Mawdy (`/logos/mawdy.svg`) como fallback seguro si el sponsor no tiene logo o falla.
 */
export function BrandLogo({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackSrc = '/logos/mawdy.svg',
  onClick,
}: BrandLogoProps) {
  const { tenant } = useTenant();

  // Resolución de fuente prioritaria: prop directa -> logo del tenant -> fallback Mawdy
  const primaryLogo = src || tenant?.tema?.logoUrl;
  const initialSource = primaryLogo && primaryLogo.trim() !== '' ? primaryLogo : fallbackSrc;

  const [currentSrc, setCurrentSrc] = useState<string>(initialSource);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const nextSrc = src || tenant?.tema?.logoUrl || fallbackSrc;
    setCurrentSrc(nextSrc);
    setHasError(false);
  }, [src, tenant?.tema?.logoUrl, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      // Fallback automático al logotipo oficial de Mawdy
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  const resolvedAlt =
    alt ||
    (tenant?.nombreVisible
      ? `Logotipo oficial ${tenant.nombreVisible}`
      : 'Mawdy Pet Asistencia');

  const sizeClass = typeof size === 'string' ? SIZE_CLASSES[size] || SIZE_CLASSES.md : '';
  const inlineStyle = typeof size === 'number' ? { height: `${size}px` } : undefined;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${
        onClick ? 'cursor-pointer transition-opacity hover:opacity-90' : ''
      } ${className}`}
    >
      <img
        src={currentSrc}
        alt={resolvedAlt}
        onError={handleError}
        style={inlineStyle}
        className={`w-auto object-contain transition-all ${sizeClass}`}
      />
    </div>
  );
}
