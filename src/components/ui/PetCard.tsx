import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { PetAvatar } from './pet/PetAvatar';
import { QrCode, ShieldCheck, PawPrint } from 'lucide-react';

export interface PetCardProps {
  name: string;
  species?: string;
  breed?: string;
  age?: string | number;
  weight?: string | number;
  chipNumber?: string;
  policyNumber?: string;
  status?: 'active' | 'pending' | 'suspended';
  statusLabel?: string;
  avatarUrl?: string;
  onSelect?: () => void;
  isSelected?: boolean;
  action?: ReactNode;
  variant?: 'standard' | 'credential' | 'compact';
  className?: string;
  children?: ReactNode;
}

/**
 * PetCard — Tarjeta especializada de identificación del paciente asegurado.
 * Actúa como la credencial digital de salud de la mascota con rigor médico y asegurador.
 */
export function PetCard({
  name,
  species,
  breed,
  age,
  weight,
  chipNumber,
  policyNumber,
  status = 'active',
  statusLabel = 'Póliza Activa',
  avatarUrl,
  onSelect,
  isSelected = false,
  action,
  variant = 'standard',
  className = '',
  children,
}: PetCardProps) {
  const isClickable = Boolean(onSelect);

  const statusBadgeConfig = {
    active: { status: 'success' as const, label: statusLabel || 'Vigente' },
    pending: { status: 'warning' as const, label: statusLabel || 'En validación' },
    suspended: { status: 'danger' as const, label: statusLabel || 'Suspendida' },
  }[status];

  if (variant === 'compact') {
    return (
      <div
        onClick={onSelect}
        className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all ${
          isSelected
            ? 'border-(--color-primary) ring-2 ring-(--color-primary)/20'
            : 'border-stone-200 hover:border-stone-300'
        } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <PetAvatar
            src={avatarUrl}
            name={name}
            species={species}
            size="md"
            shape="rounded"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-stone-900 truncate">{name}</h4>
            <p className="text-xs text-stone-500 truncate">
              {species} {breed ? `· ${breed}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge status={statusBadgeConfig.status} size="sm">
            {statusBadgeConfig.label}
          </Badge>
          {action}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
        isSelected
          ? 'border-(--color-primary) ring-2 ring-(--color-primary)/20'
          : 'border-stone-200 hover:border-stone-300'
      } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Encabezado: Avatar + Identidad + Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <PetAvatar
            src={avatarUrl}
            name={name}
            species={species}
            size="lg"
            shape="rounded"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900 truncate">{name}</h3>
              <PawPrint size={14} className="text-stone-400 shrink-0" />
            </div>
            <p className="text-xs text-stone-500 truncate">
              {species} {breed ? `· ${breed}` : ''}
            </p>
            {(age || weight) && (
              <p className="text-[11px] text-stone-400 mt-0.5">
                {age ? `${age}` : ''}
                {age && weight ? ' · ' : ''}
                {weight ? `${weight}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge status={statusBadgeConfig.status} dot size="sm">
            {statusBadgeConfig.label}
          </Badge>
          {action}
        </div>
      </div>

      {/* Franja de Datos Oficiales: Microchip y Póliza */}
      {(chipNumber || policyNumber) && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-xs">
          {chipNumber && (
            <div className="flex items-center gap-1.5 min-w-0 text-stone-600">
              <QrCode size={13} className="text-stone-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-stone-400 uppercase font-medium">Chip</span>
                <span className="font-mono text-xs font-semibold text-stone-800 truncate block">
                  {chipNumber}
                </span>
              </div>
            </div>
          )}

          {policyNumber && (
            <div className="flex items-center gap-1.5 min-w-0 text-stone-600">
              <ShieldCheck size={13} className="text-stone-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-stone-400 uppercase font-medium">Póliza</span>
                <span className="font-mono text-xs font-semibold text-stone-800 truncate block">
                  {policyNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
