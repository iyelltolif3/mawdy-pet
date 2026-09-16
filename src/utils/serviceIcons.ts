import React from 'react';
import {
  Siren,
  Truck,
  PhoneCall,
  Syringe,
  Home,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  PawPrint,
  HeartPulse,
  Activity,
  Pill,
  Hospital,
  Video,
  MapPin,
  Award,
  Calendar,
  Sparkles,
  Dog,
  Cat,
  Scissors,
  Clock,
  Shield,
  FileText,
} from 'lucide-react';

export interface ServiceIconMeta {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorText: string;
  borderColor: string;
}

const ICON_MAP: Record<string, ServiceIconMeta> = {
  Siren: {
    id: 'Siren',
    icon: Siren,
    colorBg: 'bg-rose-50',
    colorText: 'text-rose-700',
    borderColor: 'border-rose-200',
  },
  Truck: {
    id: 'Truck',
    icon: Truck,
    colorBg: 'bg-stone-100',
    colorText: 'text-stone-800',
    borderColor: 'border-stone-200',
  },
  HeartPulse: {
    id: 'HeartPulse',
    icon: HeartPulse,
    colorBg: 'bg-red-50',
    colorText: 'text-red-700',
    borderColor: 'border-red-200',
  },
  AlertTriangle: {
    id: 'AlertTriangle',
    icon: Siren,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  Stethoscope: {
    id: 'Stethoscope',
    icon: Stethoscope,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  Hospital: {
    id: 'Hospital',
    icon: Hospital,
    colorBg: 'bg-blue-50',
    colorText: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  Activity: {
    id: 'Activity',
    icon: Activity,
    colorBg: 'bg-indigo-50',
    colorText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  ShieldCheck: {
    id: 'ShieldCheck',
    icon: ShieldCheck,
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  Shield: {
    id: 'Shield',
    icon: Shield,
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  PhoneCall: {
    id: 'PhoneCall',
    icon: PhoneCall,
    colorBg: 'bg-sky-50',
    colorText: 'text-sky-800',
    borderColor: 'border-sky-200',
  },
  Video: {
    id: 'Video',
    icon: Video,
    colorBg: 'bg-cyan-50',
    colorText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  Clock: {
    id: 'Clock',
    icon: Clock,
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  Calendar: {
    id: 'Calendar',
    icon: Calendar,
    colorBg: 'bg-slate-50',
    colorText: 'text-slate-700',
    borderColor: 'border-slate-200',
  },
  Syringe: {
    id: 'Syringe',
    icon: Syringe,
    colorBg: 'bg-teal-50',
    colorText: 'text-teal-700',
    borderColor: 'border-teal-200',
  },
  Pill: {
    id: 'Pill',
    icon: Pill,
    colorBg: 'bg-violet-50',
    colorText: 'text-violet-700',
    borderColor: 'border-violet-200',
  },
  Award: {
    id: 'Award',
    icon: Award,
    colorBg: 'bg-yellow-50',
    colorText: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  FileText: {
    id: 'FileText',
    icon: FileText,
    colorBg: 'bg-zinc-50',
    colorText: 'text-zinc-700',
    borderColor: 'border-zinc-200',
  },
  Home: {
    id: 'Home',
    icon: Home,
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  Dog: {
    id: 'Dog',
    icon: Dog,
    colorBg: 'bg-orange-50',
    colorText: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  Cat: {
    id: 'Cat',
    icon: Cat,
    colorBg: 'bg-pink-50',
    colorText: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
  PawPrint: {
    id: 'PawPrint',
    icon: PawPrint,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  HeartHandshake: {
    id: 'HeartHandshake',
    icon: HeartHandshake,
    colorBg: 'bg-rose-50',
    colorText: 'text-rose-700',
    borderColor: 'border-rose-200',
  },
  Sparkles: {
    id: 'Sparkles',
    icon: Sparkles,
    colorBg: 'bg-yellow-50',
    colorText: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  MapPin: {
    id: 'MapPin',
    icon: MapPin,
    colorBg: 'bg-stone-50',
    colorText: 'text-stone-700',
    borderColor: 'border-stone-200',
  },
  Scissors: {
    id: 'Scissors',
    icon: Scissors,
    colorBg: 'bg-teal-50',
    colorText: 'text-teal-700',
    borderColor: 'border-teal-200',
  },
};

/**
 * Retorna el componente de ícono y paleta cromática asignada para el servicio asistencial.
 */
export function resolveServiceIcon(iconId?: string): ServiceIconMeta {
  if (!iconId || !ICON_MAP[iconId]) {
    return {
      id: 'ShieldCheck',
      icon: ShieldCheck,
      colorBg: 'bg-stone-100',
      colorText: 'text-stone-800',
      borderColor: 'border-stone-200',
    };
  }
  return ICON_MAP[iconId];
}
