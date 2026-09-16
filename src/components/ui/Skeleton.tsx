import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Skeleton — Primitiva básica con animación de pulso sutil para estados de carga.
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * SkeletonText — Simula una o varias líneas de texto.
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${
            i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard — Simula una tarjeta de contenido o resultado de búsqueda.
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-5 rounded-3xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-4/5 rounded-lg" />
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * SkeletonTable — Simula filas de tabla con encabezados y celdas para el historial.
 */
export function SkeletonTable({ rows = 5, columns: _columns }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-32 rounded-md" />
        <Skeleton className="h-3.5 w-28 hidden sm:block rounded-md" />
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-24 hidden md:block rounded-md" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1 w-28 shrink-0">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-2.5 w-14 rounded-md" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-28 hidden sm:block rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-20 hidden md:block rounded-md" />
            <Skeleton className="h-8 w-20 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonProfile — Simula la ficha de una mascota (avatar, datos médicos, póliza).
 */
export function SkeletonProfile() {
  return (
    <div className="space-y-4">
      {/* Cabecera del perfil */}
      <div className="p-5 rounded-3xl border border-slate-200/80 bg-white shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Skeleton className="w-18 h-18 rounded-2xl shrink-0" />
        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <Skeleton className="h-6 w-1/3 mx-auto sm:mx-0 rounded-lg" />
          <Skeleton className="h-4 w-1/2 mx-auto sm:mx-0 rounded-lg" />
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0 mt-3 sm:mt-0" />
      </div>

      {/* Tarjetas de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-white space-y-3">
          <Skeleton className="h-4 w-1/3 rounded-md border-b pb-2" />
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-white space-y-3">
          <Skeleton className="h-4 w-1/3 rounded-md border-b pb-2" />
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

