import { useState, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

export interface InformationItem {
  label: string;
  value: ReactNode;
  copyable?: boolean;
  copyText?: string;
  badge?: ReactNode;
}

export interface InformationCardProps {
  title: string;
  subtitle?: string;
  items?: InformationItem[];
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * InformationCard — Tarjeta especializada para pólizas, datos de titular o especificaciones técnicas.
 * Organiza la información en pares clave-valor estructurados con divisores limpios.
 */
export function InformationCard({
  title,
  subtitle,
  items,
  icon,
  action,
  className = '',
  children,
}: InformationCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Lista estructurada de items */}
      {items && items.length > 0 && (
        <div className="divide-y divide-stone-100 pt-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-xs text-stone-500 font-medium shrink-0">{item.label}</span>
              <div className="flex items-center gap-2 text-right">
                {item.badge}
                <span className="text-sm font-semibold text-stone-900 break-all">{item.value}</span>
                {item.copyable && (
                  <button
                    type="button"
                    onClick={() => handleCopy(item.copyText || String(item.value), idx)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                    title="Copiar al portapapeles"
                  >
                    {copiedIndex === idx ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {children && <div className={items && items.length > 0 ? 'pt-3' : ''}>{children}</div>}
    </div>
  );
}
