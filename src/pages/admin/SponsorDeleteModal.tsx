import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { TenantPublicInfo } from '../../api/tenant';
import { eliminarSponsorAdmin } from '../../api/admin';

interface SponsorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: TenantPublicInfo | null;
  onDeleteSuccess: (deletedSponsorId: string) => void;
}

/**
 * Modal corporativo de eliminación segura de portal de sponsor.
 * Implementa doble verificación: coincidencia exacta de subdominio y confirmación de impacto operativo.
 */
export default function SponsorDeleteModal({
  isOpen,
  onClose,
  sponsor,
  onDeleteSuccess,
}: SponsorDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar estado al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setUnderstood(false);
      setError(null);
      setIsDeleting(false);
    }
  }, [isOpen, sponsor]);

  if (!isOpen || !sponsor) return null;

  const expectedSubdomain = sponsor.subdominio.toLowerCase().trim();
  const isProtected = sponsor.sponsorId === 'mawdypet' || sponsor.sponsorId === 'admin';
  const isMatch = confirmText.trim().toLowerCase() === expectedSubdomain;
  const canDelete = isMatch && understood && !isDeleting && !isProtected;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      await eliminarSponsorAdmin(sponsor.sponsorId, confirmText.trim());
      onDeleteSuccess(sponsor.sponsorId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la eliminación del sponsor.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-[6px] border border-[#e8ebed] shadow-xl overflow-hidden font-sans">
        {/* Cabecera Corporativa Mawdy */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebed] bg-[#f5f6f7]">
          <div className="flex items-center gap-2.5 text-[#d81e05]">
            <div className="w-8 h-8 rounded-[4px] bg-[#d81e05]/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-[#d81e05]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2d373d] uppercase tracking-wide">
                Baja de Portal de Sponsor
              </h2>
              <p className="text-[11px] text-[#89969a]">Gestión administrativa de portales B2B2C</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-[#89969a] hover:text-[#2d373d] p-1 rounded hover:bg-[#e8ebed] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {isProtected ? (
            <div className="p-4 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Portal Canónico Protegido:</strong>
                El portal de <strong>{sponsor.nombreVisible}</strong> ({sponsor.sponsorId}) es el sponsor
                predeterminado del ecosistema Mawdy Pet y no puede ser eliminado por razones de estabilidad operativa.
              </div>
            </div>
          ) : (
            <>
              {/* Tarjeta de Resumen del Sponsor a Eliminar */}
              <div className="p-3.5 rounded-[4px] border border-[#e8ebed] bg-[#f5f6f7] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[4px] bg-white border border-[#e8ebed] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={sponsor.tema?.logoUrl || '/logos/mawdy.svg'}
                      alt={sponsor.nombreVisible}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logos/mawdy.svg';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#2d373d] truncate">
                      {sponsor.nombreVisible}
                    </h3>
                    <p className="text-[11px] font-mono text-[#526570] truncate">
                      {sponsor.subdominio}.localhost:5173
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] bg-white border border-[#e8ebed] text-[#526570]">
                  {sponsor.modo === 'real' ? 'Productivo' : 'Pre-productivo'}
                </span>
              </div>

              {/* Advertencia Crítica */}
              <div className="p-3.5 rounded-[4px] bg-[#fff5f5] border border-[#fecaca] text-[#ac0404] text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-[#d81e05] shrink-0 mt-0.5" />
                <div>
                  <strong>Advertencia:</strong> Esta acción eliminará permanentemente la configuración de
                  este sponsor y sus datos de prueba asociados. Los asegurados no podrán volver a iniciar sesión
                  en este subdominio.
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-[4px] bg-red-50 border border-red-200 text-red-800 text-xs">
                  {error}
                </div>
              )}

              {/* Validación de Seguridad por Texto */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-[#2d373d]">
                  Escribe el subdominio <span className="font-mono text-[#d81e05] font-bold bg-[#f5f6f7] px-1.5 py-0.5 rounded border border-[#e8ebed]">{expectedSubdomain}</span> para confirmar:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expectedSubdomain}
                  className="w-full px-3 py-2 rounded-[4px] border border-[#cccfd2] text-xs text-[#2d373d] font-mono focus:outline-none focus:border-[#d81e05] focus:ring-1 focus:ring-[#d81e05] transition-all bg-white"
                />
              </div>

              {/* Checkbox de Confirmación */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-[#526570] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded-[2px] border-[#cccfd2] text-[#d81e05] focus:ring-[#d81e05]"
                  />
                  <span>
                    He revisado el impacto operativo y confirmo que deseo dar de baja este portal de forma permanente.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-[#e8ebed] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-[4px] border border-[#e8ebed] bg-white hover:bg-[#f5f6f7] text-xs font-semibold text-[#526570] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {!isProtected && (
              <button
                type="submit"
                disabled={!canDelete}
                className="px-4 py-2 rounded-[4px] bg-[#d81e05] hover:bg-[#ac0404] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando portal...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Portal Definitivamente</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
