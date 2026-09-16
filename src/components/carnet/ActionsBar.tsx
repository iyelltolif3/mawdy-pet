import type { FC } from 'react';
import { Stethoscope, Share2, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ActionsBarProps {
  onSolicitarAsistencia: () => void;
  onCompartirCarnet: () => void;
  onEditarInformacion: () => void;
  petName: string;
  className?: string;
}

/**
 * ActionsBar — Zona de acciones compacta del carnet digital:
 * 1. Solicitar asistencia (CTA Principal)
 * 2. Compartir carnet
 * 3. Editar información
 */
export const ActionsBar: FC<ActionsBarProps> = ({
  onSolicitarAsistencia,
  onCompartirCarnet,
  onEditarInformacion,
  petName,
  className = '',
}) => {
  return (
    <div className={`p-4 border-b border-stone-100 flex flex-col gap-2.5 ${className}`}>
      {/* CTA Principal: Solicitar Asistencia */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onSolicitarAsistencia}
        icon={<Stethoscope size={18} />}
        className="font-bold shadow-xs"
      >
        Solicitar asistencia médica para {petName}
      </Button>

      {/* Botones secundarios compactos */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onCompartirCarnet}
          icon={<Share2 size={15} />}
        >
          Compartir carnet
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onEditarInformacion}
          icon={<Pencil size={15} />}
        >
          Editar información
        </Button>
      </div>
    </div>
  );
};
