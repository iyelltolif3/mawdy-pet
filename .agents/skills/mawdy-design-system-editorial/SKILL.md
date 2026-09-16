---
name: mawdy-design-system-editorial
description: >-
  Utiliza esta skill cuando necesites diseñar, maquetar o modificar componentes de UI, pantallas B2C o la consola B2B de Mawdy Pet, siguiendo la estética editorial cálida (Warm Linen & Stone), las reglas de tipografía humana, el uso de PetBrandSeal y los tokens atómicos unificados.
---

# Mawdy Design System Editorial (*Warm Linen & Stone*)

> **Módulo:** Sistema de Diseño & Experiencia de Usuario (UI/UX)  
> **Ámbito:** Frontend (`src/components/ui/`, `src/index.css`, `DESIGN.md`)  
> **Referencia:** [Tokens de Diseño y Reglas Visuales](./references/design-tokens.md)

---

## 1. Filosofía de Diseño Insurtech Cálido

Mawdy Pet rechaza la estética de plantilla fría hospitalaria (tarjetas blancas repetitivas, gris azulado frío, mayúsculas forzadas) en favor de un entorno **cálido, sereno y estructurado (*Warm Linen & Stone*)**.

### Principios Mandatorios:
1. **Elevación Selectiva:** No más de 1 o 2 tarjetas elevadas por pantalla (credencial de mascota). El resto del contenido vive en bloques teñidos o listas divisorias.
2. **Tipografía Editorial:** Jerarquía clara sin mayúsculas robotizadas ni cadenas de puntos (`•`). Usa *sentence case*.
3. **Firmas de Marca:** El sello `PetBrandSeal` identifica la protección oficial Mawdy en estados vacíos, credenciales y confirmaciones.
4. **Ergonomía Mobile-First:** Ancho máximo `max-w-lg mx-auto px-4`, espacio superior `pt-16` y margen inferior `pb-32` para no solapar con la barra de navegación.

---

## 2. Componentes Atómicos Estandarizados (`src/components/ui/`)

Todos los nuevos componentes deben construirse reutilizando las primitivas unificadas:

### 2.1 Botones (`Button.tsx`)
- `primary`: `bg-(--color-primary) text-white font-bold rounded-xl min-h-[44px]`
- `secondary`: `bg-white text-stone-800 border border-stone-300 rounded-xl min-h-[44px]`
- `tinted`: `bg-stone-100 text-stone-700 rounded-xl min-h-[44px]`
- `emergency`: `bg-rose-600 text-white ring-2 ring-rose-200 rounded-xl font-bold min-h-[44px]`

### 2.2 Tarjetas y Superficies
- **Hero Card:** `bg-white rounded-3xl p-5 shadow-xs border border-stone-200/90 relative overflow-hidden`
- **Bloque Teñido:** `bg-stone-100/70 rounded-2xl p-4 border border-stone-200/60`
- **Lista Editorial:** `divide-y divide-stone-200/70` sobre contenedor limpio.

### 2.3 Badges Semánticos (`Badge.tsx`)
- Usa variantes semánticas: `active`, `in-progress`, `resolved`, `warning`, `emergency`.
- Mantén el dot indicator correspondiente.

---

## 3. Redacción de Textos y Tono de Voz
- **Tranquilizador y Directo:** Cuando ocurra un error o estado vacío, orienta inmediatamente a la solución clínica:
  - *Evitar:* "No hay datos."
  - *Usar:* *"Tu mascota aún no registra solicitudes de asistencia médica. Cuando requieras una consulta o traslado urgente, la coordinaremos desde aquí."*

---

## 4. Validación de Estilos
1. Validar que no se introduzcan clases Tailwind no soportadas o estilos en línea innecesarios.
2. Validar accesibilidad visual y contraste (mínimo 4.5:1 para textos regulares).
3. Compilar TypeScript:
   ```bash
   npx tsc -b
   ```
