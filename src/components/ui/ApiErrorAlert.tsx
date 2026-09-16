import { AlertCircle, WifiOff, SearchX, ShieldAlert, FileText, Lightbulb } from 'lucide-react';
import { Button } from './Button';

export interface ApiErrorAlertProps {
  /** Mensaje de error técnico o devuelto por la API */
  error: string | Error | null;
  /** Título personalizado (opcional) */
  title?: string;
  /** Callback para reintentar la acción fallida */
  onRetry?: () => void;
  /** Indica si la acción de reintento está en curso */
  retrying?: boolean;
  /** Texto del botón de reintento (default: "Reintentar") */
  retryLabel?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * ApiErrorAlert — Componente unificado para el manejo y diagnóstico
 * de errores de API y red, con explicaciones claras de qué ocurrió
 * y cómo resolverlo para el operador de asistencia.
 */
export function ApiErrorAlert({
  error,
  title,
  onRetry,
  retrying = false,
  retryLabel = 'Reintentar',
  className = '',
}: ApiErrorAlertProps) {
  if (!error) return null;

  const rawMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
  const lower = rawMessage.toLowerCase();

  // Diagnóstico del tipo de error
  const isOffline =
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('sin conexión') ||
    lower.includes('offline');

  const isNotFound =
    lower.includes('404') ||
    lower.includes('no encontrada') ||
    lower.includes('no encontrado') ||
    lower.includes('not found');

  const isValidation =
    lower.includes('validación') ||
    lower.includes('obligatorio') ||
    lower.includes('caracteres') ||
    lower.includes('400') ||
    lower.includes('bad request');

  const isTenantMismatch =
    lower.includes('tenant') ||
    lower.includes('sponsor') ||
    lower.includes('subdominio');

  // Configuración de contenido según el diagnóstico
  let defaultTitle = 'Error al procesar la solicitud';
  let queOcurrio = rawMessage;
  let comoResolverlo = 'Verifica la información e intenta realizar la operación nuevamente.';
  let Icon = AlertCircle;
  let alertTheme = 'bg-red-50 border-red-200 text-red-900';
  let badgeColor = 'bg-red-100 text-red-800';

  if (isOffline) {
    Icon = WifiOff;
    defaultTitle = 'Sin conexión a internet';
    queOcurrio =
      'El dispositivo perdió la conexión con el servidor o la red no responde.';
    comoResolverlo =
      'Tus datos ingresados están a salvo. Comprueba tu conexión y pulsa "Reintentar".';
    alertTheme = 'bg-amber-50 border-amber-300 text-amber-950';
    badgeColor = 'bg-amber-100 text-amber-800';
  } else if (isNotFound) {
    Icon = SearchX;
    defaultTitle = 'Registro no encontrado';
    queOcurrio = rawMessage;
    comoResolverlo =
      'Verifica que el identificador o número de póliza esté bien escrito y corresponda al sponsor activo.';
    alertTheme = 'bg-stone-50 border-stone-300 text-stone-900';
    badgeColor = 'bg-stone-200 text-stone-800';
  } else if (isTenantMismatch) {
    Icon = ShieldAlert;
    defaultTitle = 'Aislamiento de Sponsor';
    queOcurrio =
      'El registro solicitado pertenece a una aseguradora distinta o el subdominio no está habilitado.';
    comoResolverlo =
      'Verifica que estés accediendo desde el subdominio del sponsor correspondiente.';
    alertTheme = 'bg-stone-100 border-stone-300 text-stone-900';
    badgeColor = 'bg-stone-200 text-stone-800';
  } else if (isValidation) {
    Icon = FileText;
    defaultTitle = 'Datos incompletos o inválidos';
    queOcurrio = rawMessage;
    comoResolverlo =
      'Revisa los campos obligatorios e ingresa los formatos solicitados.';
    alertTheme = 'bg-amber-50 border-amber-200 text-amber-950';
    badgeColor = 'bg-amber-100 text-amber-800';
  }

  const finalTitle = title || defaultTitle;

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-3.5 shadow-xs transition-all ${alertTheme} ${className}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />

      <div className="flex-1 text-xs space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-sm font-bold block">{finalTitle}</strong>
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {isOffline ? 'Offline' : isNotFound ? '404' : isValidation ? 'Validación' : 'API'}
          </span>
        </div>

        <p className="leading-relaxed font-medium opacity-90">{queOcurrio}</p>

        <div className="pt-1.5 border-t border-current/10 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
          <span className="opacity-90">{comoResolverlo}</span>
        </div>
      </div>

      {onRetry && (
        <div className="shrink-0 self-end sm:self-center mt-2 sm:mt-0">
          <Button
            size="sm"
            variant={isOffline ? 'primary' : 'secondary'}
            onClick={onRetry}
            disabled={retrying}
            className="text-xs py-1.5 px-3 whitespace-nowrap"
          >
            {retrying ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                Reintentando...
              </span>
            ) : (
              retryLabel
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
