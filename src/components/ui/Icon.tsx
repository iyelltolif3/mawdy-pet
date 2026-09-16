import type { FC, SVGProps } from 'react';
import {
  // Asistencias
  Stethoscope,
  AlertOctagon,
  Siren,
  Ambulance,
  Phone,
  PhoneCall,
  Video,
  MapPin,
  // Póliza
  ShieldCheck,
  FileText,
  BadgeCheck,
  Calendar,
  Percent,
  // Mascota
  PawPrint,
  HeartPulse,
  Syringe,
  Cpu,
  Scale,
  // Soporte
  Headset,
  MessageCircle,
  Mail,
  CircleHelp,
  // Navegación
  House,
  Activity,
  History,
  LifeBuoy,
  User,
  // Acciones
  ArrowRight,
  ChevronRight,
  Plus,
  Pencil,
  Share2,
  Download,
  ExternalLink,
  // Estados
  CheckCircle2,
  Clock,
  CircleAlert,
  CircleX,
  // Utilidades
  QrCode,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';

export type LucideComponent = FC<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;

/**
 * Mapa de Iconografía Semántica Canónica de Mawdy Pet.
 * Centraliza y normaliza el uso exclusivo de Lucide React en todo el producto.
 */
export const ICON_MAP = {
  // Asistencias
  'consulta': Stethoscope,
  'urgencia': AlertOctagon,
  'siren': Siren,
  'ambulancia': Ambulance,
  'telefono': PhoneCall,
  'phone': Phone,
  'telemedicina': Video,
  'ubicacion': MapPin,

  // Póliza
  'shield-check': ShieldCheck,
  'file-text': FileText,
  'badge-check': BadgeCheck,
  'calendar': Calendar,
  'percent': Percent,

  // Mascota
  'paw-print': PawPrint,
  'heart-pulse': HeartPulse,
  'syringe': Syringe,
  'stethoscope': Stethoscope,
  'microchip': Cpu,
  'scale': Scale,

  // Soporte
  'headset': Headset,
  'message-circle': MessageCircle,
  'mail': Mail,
  'help-circle': CircleHelp,

  // Navegación
  'house': House,
  'activity': Activity,
  'history': History,
  'life-buoy': LifeBuoy,
  'user': User,

  // Acciones
  'arrow-right': ArrowRight,
  'chevron-right': ChevronRight,
  'plus': Plus,
  'edit': Pencil,
  'share': Share2,
  'download': Download,
  'external-link': ExternalLink,

  // Estados
  'check-circle': CheckCircle2,
  'clock': Clock,
  'circle-alert': CircleAlert,
  'x-circle': CircleX,

  // Utilidades adicionales
  'qr-code': QrCode,
  'image': ImageIcon,
  'camera': Camera,
} as const;

export type IconName = keyof typeof ICON_MAP;

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export const ICON_SIZES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 12, // icon-xs: 12px / 0.75rem
  sm: 16, // icon-sm: 16px / 1.0rem
  md: 20, // icon-md: 20px / 1.25rem
  lg: 24, // icon-lg: 24px / 1.5rem
  xl: 32, // icon-xl: 32px / 2.0rem
};

export interface IconProps {
  name: IconName;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
  title?: string;
  ariaLabel?: string;
}

/**
 * Componente Icon — Envoltorio tipado de iconografía estándar de Mawdy Pet.
 * Garantiza tamaños y stroke-width uniformes para todo el producto.
 */
export function Icon({
  name,
  size = 'md',
  strokeWidth,
  className = '',
  title,
  ariaLabel,
}: IconProps) {
  const Component = ICON_MAP[name];

  if (!Component) {
    console.warn(`[Mawdy Pet Design System] Icono no encontrado: "${name}"`);
    return null;
  }

  const numericSize = typeof size === 'number' ? size : ICON_SIZES[size] || 20;

  // El grosor estándar es 2.0; para tamaños xl usamos 1.75 para preservar equilibrio visual
  const defaultStrokeWidth = numericSize >= 32 ? 1.75 : 2;
  const appliedStrokeWidth = strokeWidth !== undefined ? strokeWidth : defaultStrokeWidth;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      role={ariaLabel || title ? 'img' : undefined}
      aria-label={ariaLabel || title}
      aria-hidden={!ariaLabel && !title}
    >
      <Component
        size={numericSize}
        strokeWidth={appliedStrokeWidth}
      />
      {title && <span className="sr-only">{title}</span>}
    </span>
  );
}
