import { useState, type FC } from 'react';
import { X, Copy, Check, MessageCircle, Building2, UserCheck, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PetAvatar } from '../ui/pet/PetAvatar';
import type { Mascota } from '../../types/mascota';
import type { Asegurado } from '../../types/asegurado';

export type ShareAudience = 'clinica' | 'paseador' | 'completo';

export interface PetShareModalProps {
  mascota: Mascota;
  asegurado: Asegurado;
  policyNumber: string;
  sponsorName: string;
  nickname?: string;
  veterinario?: string;
  telefonoEmergencia?: string;
  notasAlergias?: string;
  onClose: () => void;
}

/**
 * PetShareModal — Experiencia especializada para compartir el Carnet Digital.
 * Permite modular el contenido para compartir con:
 * - Clínica / Veterinario (Rigor médico, microchip, póliza, deducible $0)
 * - Cuidador / Paseador (Contacto de emergencia, cuidados, apodo, foto)
 * - Ficha Completa
 */
export const PetShareModal: FC<PetShareModalProps> = ({
  mascota,
  asegurado,
  policyNumber,
  sponsorName,
  nickname,
  veterinario,
  telefonoEmergencia,
  notasAlergias,
  onClose,
}) => {
  const [audience, setAudience] = useState<ShareAudience>('clinica');
  const [copied, setCopied] = useState(false);

  // Generar texto optimizado según destinatario
  const generateShareText = (type: ShareAudience): string => {
    const petTitle = `${mascota.nombre}${nickname ? ` ("${nickname}")` : ''}`;

    if (type === 'clinica') {
      return `CARNET DIGITAL MAWDY PET · ATENCIÓN CLÍNICA\nPaciente: ${petTitle}\nEspecie/Raza: ${mascota.especie} · ${mascota.raza}\nMicrochip Oficial: ${mascota.microchip || 'En trámite'}\nPóliza Nº: ${policyNumber} (Convenio ${sponsorName})\nDeducible: $0 en urgencias y telemedicina\nTitular: ${asegurado.name} ${asegurado.lastName} (${asegurado.phone || 'Teléfono no especificado'})\n${notasAlergias ? `Alergias/Notas: ${notasAlergias}\n` : ''}Central Urgencias 24/7 Mawdy: 600 500 8000`;
    }

    if (type === 'paseador') {
      return `FICHA DE CUIDADOS · ${petTitle.toUpperCase()}\nNombre: ${mascota.nombre}${nickname ? ` (Le decimos "${nickname}")` : ''}\nRaza: ${mascota.raza} (${mascota.pesoKg || 0} kg)\nContacto de Emergencia: ${asegurado.name} ${asegurado.lastName} (${asegurado.phone || telefonoEmergencia || '+56 9 8765 4321'})\n${veterinario ? `Veterinario Habitual: ${veterinario}\n` : ''}${notasAlergias ? `Cuidados Importantes: ${notasAlergias}\n` : ''}Microchip: ${mascota.microchip || 'Registrado'}\nPóliza de Asistencia Activa: Mawdy Pet (${sponsorName})`;
    }

    return `CARNET DIGITAL MAWDY PET\nPaciente: ${petTitle}\nEspecie: ${mascota.especie} · ${mascota.raza}\nMicrochip: ${mascota.microchip || 'En trámite'}\nPóliza: ${policyNumber} · ${sponsorName}\nTitular: ${asegurado.name} ${asegurado.lastName} (${asegurado.phone})\n${veterinario ? `Veterinario: ${veterinario}\n` : ''}${notasAlergias ? `Alergias: ${notasAlergias}\n` : ''}Urgencias Veterinarias 24/7: 600 500 8000`;
  };

  const handleCopy = () => {
    const text = generateShareText(audience);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = generateShareText(audience);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-headline">
              Compartir Carnet Digital
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Elige con quién deseas compartir la credencial
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Selector de Destinatario */}
        <div className="mt-4 flex gap-1 p-1 bg-stone-100 rounded-lg">
          <button
            type="button"
            onClick={() => setAudience('clinica')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              audience === 'clinica'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Building2 size={13} />
            <span>Clínica / Vet</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience('paseador')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              audience === 'paseador'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <UserCheck size={13} />
            <span>Paseador / Cuidador</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience('completo')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              audience === 'completo'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Shield size={13} />
            <span>Completo</span>
          </button>
        </div>

        {/* Vista Previa de la Credencial Compartida */}
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PetAvatar
                src={mascota.fotoUrl}
                name={mascota.nombre}
                species={mascota.especie}
                size="md"
                shape="rounded"
              />
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {mascota.nombre} {nickname ? `("${nickname}")` : ''}
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {mascota.raza || mascota.especie} · {mascota.pesoKg || 0} kg
                </p>
              </div>
            </div>

            <Badge status="success" size="sm" dot>
              Cobertura Activa
            </Badge>
          </div>

          <div className="divide-y divide-stone-200/60 pt-1 text-xs text-stone-700">
            <div className="py-1.5 flex justify-between">
              <span className="text-stone-400 font-medium">Microchip ISO:</span>
              <span className="font-mono font-semibold">{mascota.microchip || 'En trámite'}</span>
            </div>

            {audience === 'clinica' && (
              <>
                <div className="py-1.5 flex justify-between">
                  <span className="text-stone-400 font-medium">Póliza Oficial:</span>
                  <span className="font-mono font-semibold">{policyNumber}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-stone-400 font-medium">Convenio:</span>
                  <span className="font-semibold">{sponsorName}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-stone-400 font-medium">Deducible urgencias:</span>
                  <span className="font-semibold text-emerald-700">$0 copago</span>
                </div>
              </>
            )}

            {audience === 'paseador' && (
              <>
                <div className="py-1.5 flex justify-between">
                  <span className="text-stone-400 font-medium">Contacto de emergencia:</span>
                  <span className="font-semibold">{asegurado.phone || '+56 9 8765 4321'}</span>
                </div>
                {veterinario && (
                  <div className="py-1.5 flex justify-between">
                    <span className="text-stone-400 font-medium">Clínica habitual:</span>
                    <span className="font-semibold truncate max-w-[170px]">{veterinario}</span>
                  </div>
                )}
              </>
            )}

            {notasAlergias && (
              <div className="py-1.5 flex justify-between">
                <span className="text-stone-400 font-medium">Alergias / Cuidados:</span>
                <span className="font-semibold text-amber-700 truncate max-w-[170px]">
                  {notasAlergias}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback de Copiado */}
        {copied && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center flex items-center justify-center gap-1.5">
            <Check size={14} className="text-emerald-600" />
            <span>¡Resumen copiado para enviar!</span>
          </div>
        )}

        {/* Acciones para Compartir */}
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleWhatsApp}
            icon={<MessageCircle size={17} />}
            className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 text-white"
          >
            Compartir por WhatsApp
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleCopy}
            icon={copied ? <Check size={15} /> : <Copy size={15} />}
          >
            {copied ? 'Copiado al portapapeles' : 'Copiar texto formateado'}
          </Button>
        </div>
      </div>
    </div>
  );
};
