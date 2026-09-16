import React from 'react';

interface MawdyBrandLogoProps {
  className?: string;
  height?: number | string;
  variant?: 'full' | 'with-tagline' | 'minerva';
}

/**
 * Logotipo oficial Mawdy en rojo institucional (#d81e05).
 * Basado en las directrices de identidad corporativa y el CRM Minerva de Mawdy.
 */
export const MawdyBrandLogo: React.FC<MawdyBrandLogoProps> = ({
  className = 'h-7 w-auto',
  height,
  variant = 'full',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logos/mawdy-official.png"
        alt="MAWDY"
        style={height ? { height } : undefined}
        className="h-full w-auto select-none object-contain"
      />

      {variant === 'minerva' && (
        <>
          <span className="text-[#89969a] text-lg font-light select-none">/</span>
          <span className="text-xs font-bold tracking-wider text-[#526570] uppercase font-sans">
            PET
          </span>
        </>
      )}

      {variant === 'with-tagline' && (
        <span className="text-[11px] font-semibold text-[#89969a] tracking-tight">
          Gestión Multitenant
        </span>
      )}
    </div>
  );
};

export default MawdyBrandLogo;
