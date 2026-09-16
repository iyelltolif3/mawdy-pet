# 🐾 Mawdy Pet Design System

> **Documento Rector del Sistema Visual y Experiencia de Usuario (Single Source of Truth)**  
> **Ámbito:** Experiencia del Asegurado (B2C Mobile-First) & Consola de Operaciones (B2B)  
> **Fecha de actualización:** Septiembre 2026 — Refactor Visual & UX hacia Producto Digital Unificado  
> **Regla de oro:** Todas las pantallas de la aplicación deben respetar este sistema. Se prohíbe crear estéticas ad-hoc por pantalla.

---

## 1. Concepto de Marca y Filosofía de Producto

**Mawdy Pet** es una **plataforma digital de seguros y asistencias médicas para mascotas**, respaldada por Mawdy (Mapfre Asistencia) y distribuida a través de grandes colectivos y sponsors corporativos (banca, salud, retail).

### Lo que Mawdy Pet transmite:
- **Protección:** Sentimiento de respaldo formal ante cualquier eventualidad de salud animal.
- **Confianza:** Solidez institucional, rigor asegurador y claridad en condiciones y contratos.
- **Cercanía:** Empatía genuina con el pet parent, sin caer en infantilismos.
- **Tecnología:** Procesos ágiles, triage inteligente y sincronización instantánea.
- **Rapidez:** Respuesta en segundos ante una urgencia veterinaria o consulta telemática.
- **Servicio:** Enfoque en la resolución clínica y asistencia en ruta por sobre la burocracia.

### Lo que Mawdy Pet DELIBERADAMENTE NO ES:
- **NO es una app infantil de mascotas:** Sin fuentes juguetonas, sin colores pastel estridentes, sin estética de caricatura.
- **NO es una app de veterinaria genérica:** No es un software de agendamiento de clínica de barrio.
- **NO es una red social de mascotas:** Sin feeds sociales, sin likes, sin avatares humanizados extravagantes.
- **NO es una startup SaaS genérica:** Sin ilustraciones abstractas de personas flotantes, sin terminología de marketing vacía.
- **NO es una UI generada por IA:** Sin gradientes morados/neón, sin sombras volumétricas exageradas, sin glassmorphism artificial.
- **NO es una colección de tarjetas flotantes:** Sin 10 tarjetas idénticas apiladas en vertical que compiten por atención.

---

## 2. Reglas Cardinales de Diseño

```text
Clarity over decoration.
Function over decoration.
Hierarchy over density.
Consistency over novelty.
```

### Lista Estricta de Prohibiciones Visuales:
1. **Sin gradientes innecesarios:** El color de marca y las superficies son planos o con contrastes sutiles.
2. **Sin glassmorphism:** Fondos nítidos con opacidades controladas únicamente para barras de navegación fijas (`backdrop-blur-md`).
3. **Sin exceso de sombras:** Máximo 2 niveles estándar (`subtle` y `elevated`). La contención visual se resuelve con **bordes limpios** antes que con sombras.
4. **Sin exceso de border-radius:** Prohibido usar 8 valores distintos de curvatura. Se aplica una escala estricta de 3 niveles (`sm`, `md`, `lg`).
5. **Sin botones cápsula obligatorios:** Los botones tienen esquinas redondeadas ergonómicas (`rounded-md` / `rounded-lg`), no formas de píldora indiscriminadas.
6. **Sin exceso de pills o badges decorativos:** Cada badge debe comunicar un estado semántico verificable (`success`, `warning`, `danger`, `info`, `emergency`).
7. **Sin emojis como iconografía principal:** Toda la iconografía funcional pertenece a **Lucide React**. Los emojis se limitan estrictamente a la personalización opcional del avatar por parte del usuario.
8. **Sin textos en mayúsculas sostenidas:** Se prohíbe `uppercase tracking-wider` en etiquetas funcionales o títulos. Todo se escribe en *Sentence case*.
9. **Sin títulos gigantes desproporcionados:** La escala tipográfica está balanceada para interfaces móviles y de escritorio.
10. **Sin tarjetas anidadas redundantes:** Una tarjeta dentro de otra tarjeta con el mismo borde y fondo está prohibida.
11. **Sin copys de marketing vacíos:** Quedan eliminadas frases cliché como:
    - ❌ *"Tu tranquilidad comienza aquí"*
    - ❌ *"Todo lo que necesitas"*
    - ❌ *"Tu compañero merece lo mejor"*
    - ✔️ Se redacta con precisión informativa: *"Póliza activa · Cobertura 100% en urgencias · Deducible $0"*.

---

## 3. Tipografía: Familia Única y Escala Consistente

### 3.1 Familia Tipográfica Única
- **Familia:** `Plus Jakarta Sans`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Código y Documentos:** `JetBrains Mono`, 'Fira Code', monospace (exclusivamente para RUT, póliza, caso `AST-...` y microchip).

### 3.2 Escala Tipográfica Estandarizada:
| Nivel | Tamaño (rem / px) | Leading | Peso | Aplicación |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `1.5rem` (24px) | `1.25` | `font-bold` (700) | Titulares mayores de pantalla inicial o nombre de mascota en carnet. |
| **Page Title** | `1.25rem` (20px) | `1.3` | `font-bold` (700) | Encabezado principal de página ("Ingreso de Usuario", "Solicitar Asistencia"). |
| **Section Title** | `1.0rem` (16px) | `1.4` | `font-semibold` (600) | Títulos de sección ("Coberturas vigentes", "Historial de atenciones"). |
| **Body** | `0.875rem` (14px) | `1.5` | `font-normal` (400) | Textos informativos, descripciones de servicio, inputs. |
| **Metadata** | `0.75rem` (12px) | `1.4` | `font-medium` (500) | Etiquetas de campo, estados, notas clínicas, fechas. |
| **Caption** | `0.6875rem` (11px) | `1.3` | `font-normal` (400) | Notas al pie, términos regulatorios, hints de formulario. |

---

## 4. Iconografía Unificada: Lucide React

La aplicación utiliza **exclusivamente `lucide-react`** como biblioteca de iconos. Queda prohibido el uso de strings de Material Symbols o librerías cruzadas.

### 4.1 Lenguaje Visual
- Trazo estándar: `strokeWidth={2}` (o `1.75` en tamaños grandes).
- Tamaño estándar en controles: `16px` (`sm`), `20px` (`md`), `24px` (`lg`).
- Nunca reemplazar texto importante únicamente por un icono sin etiqueta accesible.

### 4.2 Mapeo Canónico de Iconos Lucide:
| Función | Icono Lucide | Componente |
| :--- | :--- | :--- |
| **Navegación: Inicio** | `Home` | `ConsumerBottomNav` |
| **Navegación: Carnet / Póliza** | `ShieldCheck` / `PawPrint` | `ConsumerBottomNav`, `PetCard` |
| **Navegación: Asistencias** | `Stethoscope` / `Activity` | `ConsumerBottomNav`, `AssistanceCard` |
| **Navegación: Soporte / Cuenta** | `User` / `HelpCircle` | `ConsumerBottomNav`, `ConsumerHeader` |
| **Acción: Volver** | `ArrowLeft` | Encabezados y wizards |
| **Acción: Continuar / Siguiente** | `ArrowRight` | Botones de flujo |
| **Acción: Cerrar / Cancelar** | `X` | Modales y diálogos |
| **Acción: Ajustes / Personalizar** | `Sliders` / `Edit3` | Carnet y configuración |
| **Acción: Compartir** | `Share2` | Carnet digital |
| **Acción: Llamada de Urgencia** | `PhoneCall` / `Phone` | SOS y contacto clínico |
| **Acción: Chat WhatsApp** | `MessageCircle` | Canales de ayuda |
| **Estado: Éxito / Vigente** | `CheckCircle2` / `Check` | Badges de póliza y validaciones |
| **Estado: Alerta / Atención** | `AlertTriangle` | Avisos de vencimiento o ficha incompleta |
| **Estado: Emergencia / Peligro** | `AlertOctagon` / `Siren` | Triage urgente y llamadas críticas |
| **Dato: Ubicación / Clínica** | `MapPin` | Centros de atención en convenio |
| **Dato: Microchip / Identidad** | `QrCode` / `Hash` | Especificaciones de la mascota |
| **Dato: Calendario / Fecha** | `Calendar` | Vigencias y citas |

---

## 5. Color y Tokens Semánticos

### 5.1 Tokens de Marca y Superficie (Multi-Tenant)
Estos tokens se inyectan dinámicamente desde el sponsor activo (`TenantContext`), manteniendo armonía visual:
- `--color-primary`: Color dominante del sponsor (botones primarios, enlaces activos, acentos principales).
- `--color-secondary`: Color secundario del sponsor (fondos tenues, acentos complementarios).
- `--color-accent`: Acento interactivo complementario.
- `--color-surface`: Superficie de tarjetas y contenedores (`#ffffff`).
- `--color-background`: Canvas general de la aplicación (`#f8f9fa` o tono lino institucional calmado `#fbf9f5`).
- `--color-foreground`: Color del texto principal (`#1c1917` / `stone-900`).
- `--color-border`: Borde estructural neutro (`#e2e8f0` / `#e7e3da`).

### 5.2 Tokens Semánticos (INMUTABLES por Sponsor)
Los estados funcionales y clínicos **nunca cambian de color según el sponsor** para garantizar certidumbre médica y operativa:

| Token Semántico | Color Base | Clases de Interfaz | Significado de Negocio |
| :--- | :--- | :--- | :--- |
| **`success`** | Verde esmeralda (`#16a34a`) | `bg-emerald-50 text-emerald-800 border-emerald-200` | Póliza vigente al día, cobertura activa, validación correcta. |
| **`warning`** | Ámbar (`#d97706`) | `bg-amber-50 text-amber-800 border-amber-200` | Ficha médica incompleta, renovación próxima. |
| **`danger`** | Rojo carmín (`#dc2626`) | `bg-red-50 text-red-800 border-red-200` | Póliza suspendida, error de autenticación, rechazo. |
| **`info`** | Azul cielo corporativo (`#0284c7`) | `bg-sky-50 text-sky-800 border-sky-200` | Caso en gestión, orientación telemática, datos de colectivo. |
| **`emergency`** | Rosa intenso / Rubí (`#e11d48`) | `bg-rose-50 text-rose-800 border-rose-200` | Urgencia vital, ambulancia pet requerida, SOS inmediato. |

---

## 6. Reglas de Branding Multi-Tenant

```text
SI el sponsor tiene logo:
    UTILIZAR LOGO DEL SPONSOR.

SI el sponsor NO tiene logo:
    UTILIZAR LOGO DE MAWDY.

NUNCA utilizar simultáneamente ambas marcas como identidades primarias en cabecera.
```

### Directrices de Aplicación:
1. **Encabezados B2C:** El encabezado (`ConsumerHeader`) muestra **únicamente el logotipo de la aseguradora o sponsor**. No se incluye el badge `"Operado por Mawdy"` pegado al logo en el header principal.
2. **Presencia de Mawdy:** Mawdy aparece con sobriedad y valor contextual exclusivo en:
   - Pie de página institucional y copyright (`Operado por Mawdy Servicios de Asistencia`).
   - Información legal, términos de la póliza y contratos de asistencia.
   - Centro de soporte telefónico 24/7.
   - Sello de certificación técnica (`PetBrandSeal`) como marca de agua no invasiva en el Carnet Digital.

---

## 7. Escala de Radios de Curvatura (Border Radius)

Se eliminan los valores dispersos y se fija una escala concisa de **3 niveles**:

| Token | Medida | Clase Tailwind | Uso Exclusivo |
| :--- | :--- | :--- | :--- |
| **`radius-sm`** | `6px` (`0.375rem`) | `rounded-md` | Badges semánticos, tags de estado, chips de metadato. |
| **`radius-md`** | `10px` (`0.625rem`) | `rounded-lg` | Botones, inputs, selects, elementos interactivos de control. |
| **`radius-lg`** | `16px` (`1.0rem`) | `rounded-2xl` | Tarjetas especializadas (`FeatureCard`, `PetCard`, etc.) y modales. |

*Nota:* `rounded-full` se reserva estrictamente para avatares circulares y botones de icono circulares específicos (`IconButton`).

---

## 8. Escala de Sombras (Shadows)

Se limitan las sombras a un máximo de **2 niveles funcionales**. La definición visual se confía primordialmente a bordes sutiles:

| Token | Definición CSS | Uso |
| :--- | :--- | :--- |
| **`shadow-subtle`** | `0 1px 2px 0 rgba(0, 0, 0, 0.04)` | Tarjetas de información y botones secundarios interactivos. |
| **`shadow-elevated`** | `0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)` | Carnet Digital heroico de la mascota y modales en primer plano. |

---

## 9. Catálogo de Botones (`Button.tsx`)

Todos los botones interactivos garantizan una zona táctil mínima accesible de **44px** de alto en móvil (`min-h-[44px]` para `md`).

### Variantes Estrictas:
1. **`primary`:** Acción directiva principal de la pantalla ("Solicitar asistencia", "Continuar"). Fondo de color de marca (`bg-(--color-primary)`), texto contrastado.
2. **`secondary`:** Acciones de navegación o confirmación intermedia ("Ver carnet", "Descargar"). Fondo neutro o blanco con borde `border-stone-300`.
3. **`tertiary`:** Enlaces interactivos o acciones complementarias ("Omitir por ahora", "Cancelar"). Fondo transparente sin borde.
4. **`danger`:** Acciones destructivas o de cancelación crítica ("Anular asistencia", "Cerrar caso").
5. **`emergency`:** Botón SOS de máxima visibilidad para asistencia médica vital o llamada a ambulancia (`bg-rose-600` con anillo de contraste).
6. **`icon`:** Botón cuadrado o circular accesible para retroceder, cerrar o compartir, centrado en un icono Lucide.

---

## 10. Catálogo de Tarjetas Especializadas (Cards)

Queda prohibido utilizar `Card` como un contenedor universal amorfo. Se definen **5 tipos de tarjetas especializadas**:

1. **`FeatureCard`:**
   - **Propósito:** Destacar capacidades, módulos de triage clínico o pasos de inducción.
   - **Estructura:** Icono Lucide en contenedor contrastado + Título de sección + Descripción concisa + Flecha o botón de acción opcional.
2. **`InformationCard`:**
   - **Propósito:** Mostrar especificaciones de póliza, coberturas, datos del titular o ficha médica.
   - **Estructura:** Encabezado con título claro + Lista estructurada de pares clave-valor (`Label` en `text-xs text-stone-500`, `Value` en `text-sm font-semibold text-stone-900`) con divisores hairline.
3. **`StatusCard`:**
   - **Propósito:** Indicar estados del servicio (asistencia en curso, atención completada, póliza suspendida).
   - **Estructura:** Indicador semántico visual (dot o barra lateral) + Badge de estado + Explicación y tiempo transcurrido.
4. **`PetCard`:**
   - **Propósito:** Identificación oficial del paciente asegurado (la credencial de la mascota).
   - **Estructura:** Fotografía o avatar enmarcado + Nombre destacado + Especie/Raza + Edad + Microchip oficial + Badge de cobertura activa + Sello de agua no invasivo.
5. **`AssistanceCard`:**
   - **Propósito:** Tarjeta de expediente de asistencia médica o ticket de triage.
   - **Estructura:** Código `AST-...` en `font-mono` + Tipo de asistencia con icono Lucide + Fecha formateada + Estado semántico + Botón de acceso a expediente.

---

## 11. Escala de Espaciado (Spacing)

La interfaz se alinea a una retícula de espaciado modular consistente:
- `4px` (`gap-1`, `p-1`): Micro-espaciado entre iconos y etiquetas.
- `8px` (`gap-2`, `p-2`): Separación entre elementos compactos o pares de metadatos.
- `12px` (`gap-3`, `p-3`): Padding interno de tarjetas secundarias y bloques de información.
- `16px` (`gap-4`, `p-4`): Padding estándar de tarjetas especializadas y margen entre grupos.
- `24px` (`gap-6`, `p-6`): Separación entre secciones mayores de una pantalla.
- `32px` (`gap-8`, `p-8`): Margen de cabeceras o transiciones de flujo.
- `48px` (`pb-12`): Margen inferior para librar la barra de navegación móvil (`pb-safe`).

---

## 12. Directrices de Dispositivos (Mobile & Desktop)

### 12.1 Mobile-First (Experiencia PWA)
- La interfaz móvil aprovecha el viewport nativo del dispositivo sin generar "marcos de teléfono simulados" dentro de la pantalla.
- La barra de navegación inferior (`ConsumerBottomNav`) se ubica de forma fija y accesible al pulgar, ocultándose automáticamente en flujos transaccionales (creación de asistencia, onboarding).

### 12.2 Desktop
- El diseño en escritorio aprovecha la amplitud horizontal estructurando el contenido en **máximo 2 columnas con propósito claro** (ej. formulario de acción a la izquierda y resumen de cobertura/asistencia a la derecha), manteniendo una anchura máxima de lectura controlada (`max-w-4xl` o `max-w-5xl`).
- No se transforma la app en un dashboard denso con tablas interminables; se mantiene la simplicidad y claridad de una plataforma de asistencia moderna.

---

## 13. Componentes como Fuente Única de Verdad

Todo componente de la interfaz debe importarse desde `src/components/ui/index.ts`:

```typescript
export { Button } from './Button';
export { FeatureCard } from './FeatureCard';
export { InformationCard } from './InformationCard';
export { StatusCard } from './StatusCard';
export { PetCard } from './PetCard';
export { AssistanceCard } from './AssistanceCard';
export { Badge } from './Badge';
export { Input } from './Input';
export { Select } from './Select';
export { Modal } from './Modal';
export { Toast } from './Toast';
export { PetBrandSeal } from './PetBrandSeal';
```
