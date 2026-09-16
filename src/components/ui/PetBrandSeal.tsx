interface PetBrandSealProps {
  className?: string;
  size?: number | string;
  variant?: 'watermark' | 'badge' | 'hero';
}

/**
 * PetBrandSeal — Sello Oficial de Protección Insurtech de Mawdy Pet.
 *
 * Firma visual distintiva de la plataforma que aporta calidez, identidad y
 * carácter de credencial de seguros formal. Se utiliza como marca de agua en
 * el carnet digital y como emblema tranquilizador en estados vacíos y feedback.
 */
export function PetBrandSeal({
  className = '',
  size = 48,
  variant = 'badge',
}: PetBrandSealProps) {
  if (variant === 'watermark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none text-stone-900/8 ${className}`}
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" />
        {/* Almohadilla principal de huella */}
        <path
          d="M50 71C41.5 71 35 64.5 37 57C38.2 52.5 44 49 50 49C56 49 61.8 52.5 63 57C65 64.5 58.5 71 50 71Z"
          fill="currentColor"
        />
        {/* Almohadillas de dedos */}
        <ellipse cx="36" cy="42" rx="5" ry="7" transform="rotate(-20 36 42)" fill="currentColor" />
        <ellipse cx="45" cy="35" rx="5" ry="7.5" transform="rotate(-6 45 35)" fill="currentColor" />
        <ellipse cx="55" cy="35" rx="5" ry="7.5" transform="rotate(6 55 35)" fill="currentColor" />
        <ellipse cx="64" cy="42" rx="5" ry="7" transform="rotate(20 64 42)" fill="currentColor" />
        {/* Arco de laurel de protección */}
        <path
          d="M20 52C20 68.5 33.4 82 50 82C66.6 82 80 68.5 80 52"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-2xs ${className}`}
        style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 text-amber-700"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M50 69C42.5 69 36.5 63.5 38.2 56.5C39.3 52.5 44.5 49 50 49C55.5 49 60.7 52.5 61.8 56.5C63.5 63.5 57.5 69 50 69Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <ellipse cx="37" cy="43" rx="4.5" ry="6.5" transform="rotate(-18 37 43)" fill="currentColor" fillOpacity="0.85" />
          <ellipse cx="45.5" cy="36" rx="4.5" ry="7" transform="rotate(-5 45.5 36)" fill="currentColor" fillOpacity="0.85" />
          <ellipse cx="54.5" cy="36" rx="4.5" ry="7" transform="rotate(5 54.5 36)" fill="currentColor" fillOpacity="0.85" />
          <ellipse cx="63" cy="43" rx="4.5" ry="6.5" transform="rotate(18 63 43)" fill="currentColor" fillOpacity="0.85" />
        </svg>
      </div>
    );
  }

  // Variant "badge" por defecto
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs shrink-0 ${className}`}
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-2/3 h-2/3"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M50 68C43.5 68 38 63 39.5 57C40.5 53 45 50 50 50C55 50 59.5 53 60.5 57C62 63 56.5 68 50 68Z"
          fill="currentColor"
        />
        <ellipse cx="37.5" cy="44" rx="4" ry="6" transform="rotate(-18 37.5 44)" fill="currentColor" />
        <ellipse cx="46" cy="38" rx="4" ry="6.5" transform="rotate(-5 46 38)" fill="currentColor" />
        <ellipse cx="54" cy="38" rx="4" ry="6.5" transform="rotate(5 54 38)" fill="currentColor" />
        <ellipse cx="62.5" cy="44" rx="4" ry="6" transform="rotate(18 62.5 44)" fill="currentColor" />
      </svg>
    </div>
  );
}
