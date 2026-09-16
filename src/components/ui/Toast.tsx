import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export function Toast({ message, variant = 'info', visible }: ToastProps) {
  if (!visible) return null;

  const styles = {
    success: { bg: 'bg-emerald-700 text-white', Icon: CheckCircle2 },
    error: { bg: 'bg-rose-700 text-white', Icon: AlertCircle },
    info: { bg: 'bg-stone-900 text-white', Icon: Info },
    warning: { bg: 'bg-amber-700 text-white', Icon: AlertTriangle },
  };

  const current = styles[variant] || styles.info;
  const Icon = current.Icon;

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold ${current.bg} shadow-md flex items-center gap-2 max-w-sm w-auto animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
