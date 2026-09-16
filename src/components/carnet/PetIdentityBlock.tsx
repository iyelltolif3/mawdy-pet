import { type FC } from 'react';

export interface PetIdentityBlockProps {
  name: string;
  nickname?: string;
  species: string;
  breed: string;
  ageText: string;
  className?: string;
}

/**
 * PetIdentityBlock — Bloque de Identidad Oficial del paciente asegurado.
 * Muestra el nombre oficial, apodo cariñoso si existe, especie, raza y edad calculada.
 */
export const PetIdentityBlock: FC<PetIdentityBlockProps> = ({
  name,
  nickname,
  species,
  breed,
  ageText,
  className = '',
}) => {
  const normalizedSpecies =
    species.toLowerCase() === 'gato' ? 'Felino' : species.toLowerCase() === 'perro' ? 'Canino' : species;

  return (
    <div className={`p-5 pb-3 border-b border-stone-100 flex flex-col gap-1.5 ${className}`}>
      {/* Nombre y Apodo */}
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-headline">
          {name}
        </h1>
        {nickname && (
          <span className="text-sm font-medium text-stone-500 font-sans">
            "{nickname}"
          </span>
        )}
      </div>

      {/* Especie · Raza · Edad */}
      <p className="text-xs text-stone-500 font-medium leading-relaxed">
        {normalizedSpecies} · {breed || 'Mestizo'} · {ageText}
      </p>
    </div>
  );
};
