import { useNavigate } from 'react-router-dom';
import { PawPrint, Stethoscope } from 'lucide-react';
import type { Poliza } from '../../types/poliza';
import { Badge, Button, Modal } from '../../components/ui';

interface MascotaSelectorModalProps {
  open: boolean;
  onClose: () => void;
  polizas: Poliza[];
  destino?: 'asistencia' | 'poliza' | 'mascota';
  onSelectMascota?: (riesgoId: string) => void;
}

export function MascotaSelectorModal({
  open,
  onClose,
  polizas,
  destino = 'asistencia',
  onSelectMascota,
}: MascotaSelectorModalProps) {
  const navigate = useNavigate();

  if (!polizas.length) return null;

  const primerTitular = polizas[0].asegurado;
  const numeroPoliza = polizas[0].numeroPoliza;

  const handleSelect = (riesgoId: string) => {
    onClose();

    // Sincronizar mascota activa en almacenamiento local
    try {
      const sponsorKey = polizas[0]?.sponsorId || 'default';
      localStorage.setItem(`active_pet_${sponsorKey}`, riesgoId);
    } catch {
      // Ignorar restricciones en entornos aislados
    }

    if (onSelectMascota) {
      onSelectMascota(riesgoId);
      return;
    }

    if (destino === 'poliza' || destino === 'mascota') {
      navigate(`/poliza/${encodeURIComponent(riesgoId)}`, {
        state: { riesgoId },
      });
    } else {
      navigate(`/asistencias/nueva/${encodeURIComponent(riesgoId)}`, {
        state: { riesgoId },
      });
    }
  };

  const esModoAsistencia = destino === 'asistencia';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={esModoAsistencia ? 'Seleccionar mascota para asistencia' : 'Seleccionar mascota asegurada'}
    >
      <div className="flex flex-col gap-4">
        {/* Resumen del titular y póliza */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-gray-500">Titular:</span>{' '}
            <strong className="text-(--color-foreground)">{primerTitular.name} {primerTitular.lastName}</strong>
          </div>
          <div>
            <span className="text-gray-500">Póliza:</span>{' '}
            <span className="font-mono font-medium text-(--color-foreground)">{numeroPoliza}</span>
          </div>
          <div>
            <span className="text-gray-500">RUT:</span>{' '}
            <span className="font-mono text-(--color-foreground)">{primerTitular.idNum}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Se encontraron <strong>{polizas.length} mascotas</strong> registradas.{' '}
          {esModoAsistencia
            ? 'Selecciona la mascota que requiere atención veterinaria inmediata:'
            : 'Selecciona la que corresponde a esta consulta:'}
        </p>

        {/* Lista de mascotas */}
        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {polizas.map((p) => {
            const m = p.mascota;
            const estadoBadge = {
              activa: { variant: 'success' as const, label: 'Activa' },
              inactiva: { variant: 'warning' as const, label: 'Inactiva' },
              vencida: { variant: 'danger' as const, label: 'Vencida' },
            }[p.estado];

            return (
              <div
                key={m.riesgoId}
                onClick={() => handleSelect(m.riesgoId)}
                className="group border border-gray-200 hover:border-(--color-primary) hover:shadow-xs rounded-2xl p-3.5 bg-(--color-surface) transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center justify-center shrink-0">
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-(--color-foreground) group-hover:text-(--color-primary) transition-colors truncate">
                        {m.nombre}
                      </h3>
                      <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 flex-wrap">
                      <span className="capitalize font-medium text-stone-800">{m.especie}</span>
                      <span>{m.raza}</span>
                      <span className="text-stone-400">/</span>
                      <span className="capitalize">{m.sexo}</span>
                      <span className="text-stone-400">/</span>
                      <span>{m.pesoKg} kg</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      <span>Riesgo: <span className="font-mono text-gray-600">{m.riesgoId}</span></span>
                      {m.microchip && (
                        <span>Chip: <span className="font-mono text-gray-600">{m.microchip}</span></span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="shrink-0 flex items-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(m.riesgoId);
                  }}
                >
                  {esModoAsistencia && <Stethoscope className="w-4 h-4" />}
                  <span>{esModoAsistencia ? 'Crear Asistencia' : 'Ver ficha'}</span>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
