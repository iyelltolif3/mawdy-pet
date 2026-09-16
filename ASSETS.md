# 📦 Sistema de Assets: Mawdy Pet

> **Guía Oficial y Manual Normativo de Recursos Visuales, Iconografía y Multimedia**  
> **Ámbito:** Plataforma Web Progresiva (PWA), Experiencia B2C del Asegurado y Consola B2B  
> **Objetivo:** Garantizar que cualquier desarrollador o agente de IA cree nuevas pantallas sin inventar iconos, sin improvisar SVGs ni estilos ad-hoc.

---

## 1. Biblioteca Única de Iconos: Lucide React

La aplicación utiliza **exclusivamente `lucide-react`** como única fuente de iconografía.

### 🚫 Reglas Estrictas de Prohibición:
- **PROHIBIDO** mezclar Lucide con Heroicons, Font Awesome, Material Icons o Glyphicons.
- **PROHIBIDO** incrustar SVGs improvisados en línea o generados manualmente por IA.
- **PROHIBIDO** usar emojis como iconos principales de interfaz (ej. 🐶, 🩺, 🚨, 📍). Los emojis se reservan únicamente para personalización textual opcional por parte del pet parent.
- **PROHIBIDO** reemplazar etiquetas de texto imprescindibles solo por un icono sin accesibilidad (`title` o `aria-label`).

---

## 2. Tamaños y Reglas de Trazo (Stroke Width)

Para preservar la coherencia y armonía del producto, todos los iconos se rigen por una escala cerrada:

| Token | Medida (px) | Medida (rem) | Clase CSS | Uso en Mawdy Pet |
| :--- | :--- | :--- | :--- | :--- |
| **`icon-xs`** | `12px` | `0.75rem` | `.icon-xs` | Metadatos compactos, chips de chip/póliza, tags clínicos. |
| **`icon-sm`** | `16px` | `1.0rem` | `.icon-sm` | Botones secundarios, inputs, selects, items de listas. |
| **`icon-md`** | `20px` | `1.25rem` | `.icon-md` | **Estándar por defecto:** Botones primarios, cabeceras de card, navegación. |
| **`icon-lg`** | `24px` | `1.5rem` | `.icon-lg` | Iconos de módulo en `FeatureCard`, cabeceras de página, modales. |
| **`icon-xl`** | `32px` | `2.0rem` | `.icon-xl` | Iconos heroicos (SOS, estados vacíos, confirmaciones exitosas). |

### ✏️ Regla de Trazo (Stroke Width):
- **Stroke estándar único:** `strokeWidth={2}` (2.0 px).
- **Excepción:** En iconos grandes (`icon-xl`, $\ge 32\text{px}$), se utiliza `1.75` para evitar un peso óptico excesivo o tosco.
- **Uso recomendado:** Utilizar el componente `<Icon />` que aplica automáticamente esta calibración.

---

## 3. Mapa Canónico de Iconografía por Módulo

El mapa de iconos está tipado en `src/components/ui/Icon.tsx`:

```tsx
import { Icon } from '@/components/ui';

// Ejemplo de uso:
<Icon name="consulta" size="md" className="text-stone-700" />
```

### 3.1 Asistencias y Urgencias Veterinarias
| Nombre en `<Icon name="..." />` | Componente Lucide | Concepto de Negocio |
| :--- | :--- | :--- |
| `'consulta'` | `Stethoscope` | Consulta veterinaria general, agendamiento de clínica. |
| `'urgencia'` | `AlertOctagon` | Triage de riesgo vital, botón SOS, alerta médica. |
| `'siren'` | `Siren` | Llamada inmediata a central de urgencias. |
| `'ambulancia'` | `Ambulance` | Despacho de traslado asistido pet en ruta. |
| `'telefono'` | `PhoneCall` | Llamada telefónica directa a mesa clínica 24/7. |
| `'telemedicina'` | `Video` | Orientación veterinaria telemática en tiempo real. |
| `'ubicacion'` | `MapPin` | Centro veterinario en convenio, geolocalización. |

### 3.2 Póliza y Coberturas
| Nombre en `<Icon name="..." />` | Componente Lucide | Concepto de Negocio |
| :--- | :--- | :--- |
| `'shield-check'` | `ShieldCheck` | Póliza vigente, respaldo formal Mawdy. |
| `'file-text'` | `FileText` | Condiciones generales, contrato, expediente clínico. |
| `'badge-check'` | `BadgeCheck` | Cobertura validada al 100%, deducible $0. |
| `'calendar'` | `Calendar` | Vigencia de la póliza, renovación, fecha de inicio. |
| `'percent'` | `Percent` | Porcentaje de reembolso y límites asegurados. |

### 3.3 Paciente Asegurado (Mascota)
| Nombre en `<Icon name="..." />` | Componente Lucide | Concepto de Negocio |
| :--- | :--- | :--- |
| `'paw-print'` | `PawPrint` | Identidad de la mascota, especie, raza. |
| `'heart-pulse'` | `HeartPulse` | Constantes vitales, ficha clínica de salud. |
| `'syringe'` | `Syringe` | Calendario de vacunación y desparasitación. |
| `'stethoscope'` | `Stethoscope` | Veterinario o clínica de cabecera. |
| `'microchip'` | `Cpu` | Número de microchip oficial ISO 11784/11785. |
| `'scale'` | `Scale` | Peso corporal oficial del paciente asegurado. |

### 3.4 Soporte y Canales
| Nombre en `<Icon name="..." />` | Componente Lucide | Concepto de Negocio |
| :--- | :--- | :--- |
| `'headset'` | `Headset` | Central de atención al cliente corporativa. |
| `'message-circle'` | `MessageCircle` | Canal de WhatsApp directo con la mesa de ayuda. |
| `'phone'` | `Phone` | Teléfono de mesa de ayuda B2B2C. |
| `'mail'` | `Mail` | Correo de soporte oficial. |
| `'help-circle'` | `CircleHelp` | Preguntas frecuentes (FAQ) y tutoriales. |

### 3.5 Navegación Principal
| Nombre en `<Icon name="..." />` | Componente Lucide | Destino |
| :--- | :--- | :--- |
| `'house'` | `House` | Inicio (`/home`) |
| `'file-text'` | `FileText` | Carnet Digital / Póliza (`/poliza`) |
| `'activity'` | `Activity` | Historial de Asistencias (`/asistencias`) |
| `'life-buoy'` | `LifeBuoy` | Soporte y Canales (`/soporte`) |
| `'user'` | `User` | Perfil y datos del Titular Asegurado. |

### 3.6 Acciones Transaccionales
| Nombre en `<Icon name="..." />` | Componente Lucide | Acción |
| :--- | :--- | :--- |
| `'arrow-right'` | `ArrowRight` | Avanzar en flujo / wizard. |
| `'chevron-right'` | `ChevronRight` | Indicador de navegación en lista / menú. |
| `'plus'` | `Plus` | Agregar nueva solicitud o foto. |
| `'edit'` | `Pencil` | Modificar ficha o apodo cariñoso. |
| `'share'` | `Share2` | Compartir carnet digital con clínica o paseador. |
| `'download'` | `Download` | Descargar PDF de póliza o certificado. |
| `'external-link'` | `ExternalLink` | Enlace externo a portal regulatorio o sponsor. |

### 3.7 Estados Semánticos
| Nombre en `<Icon name="..." />` | Componente Lucide | Estado |
| :--- | :--- | :--- |
| `'check-circle'` | `CheckCircle2` | Éxito, caso resuelto, trámite aprobado. |
| `'clock'` | `Clock` | En curso, en revisión, tiempo estimado de llegada. |
| `'circle-alert'` | `CircleAlert` | Advertencia, ficha incompleta, atención requerida. |
| `'x-circle'` | `CircleX` | Error, rechazo, caso cancelado. |

---

## 4. Logotipos Multi-Tenant y Componente `<BrandLogo />`

### 4.1 Ubicación Centralizada
Todos los logotipos se alojan en el directorio público:
```text
/public/logos/
├── mawdy.svg               # Logotipo canónico de Mawdy Pet (Fallback oficial)
├── sponsor.svg             # Logotipo institucional neutral para nuevos sponsors
├── consalud.svg            # Logotipo oficial Consalud
├── zurichsantander.svg     # Logotipo oficial Zurich Santander
└── [sponsorId].svg         # Logotipos cargados desde /admin
```

### 4.2 Componente `<BrandLogo />`
El componente implementa la **Regla de Prioridad Multi-Tenant**:
1. Si el sponsor activo tiene un logotipo (`tenant.tema.logoUrl` o prop `src`), se muestra el logotipo del sponsor.
2. Si no tiene logotipo o si la imagen falla al cargar (`onError`), conmuta automáticamente a `/logos/mawdy.svg`.

```tsx
import { BrandLogo } from '@/components/ui';

// Resuelve automáticamente según el sponsor en contexto:
<BrandLogo size="md" />

// O con tamaño explícito:
<BrandLogo size="lg" /> // 'sm' (24px), 'md' (32px), 'lg' (40px), 'xl' (48px)
```

---

## 5. Fotografía y Avatares de Mascotas

### 5.1 Regla Editorial de Placeholders
- **No más emojis como avatares:** Las mascotas sin fotografía registrada ya no se muestran con `🐶` o `🐱` flotantes.
- En su lugar, el sistema utiliza `<PetPlaceholder />`:
  - Contenedor en tono lino cálido (`bg-stone-100 border-stone-200/90`).
  - Silueta vectorial estilizada y sobria (canina o felina según la especie).
  - Inicial tipográfica destacada en `font-headline font-bold text-stone-700`.

### 5.2 Componente `<PetAvatar />`
```tsx
import { PetAvatar } from '@/components/ui';

// Con foto real:
<PetAvatar src="https://images.unsplash.com/..." name="Milo" species="perro" size="lg" />

// Sin foto (activa automáticamente el placeholder editorial con la inicial "M" y silueta):
<PetAvatar name="Milo" species="perro" size="lg" />
```

Tamaños disponibles:
- `xs`: 24px
- `sm`: 32px
- `md`: 40px (por defecto)
- `lg`: 56px (carnet y cabecera de ficha)
- `xl`: 80px (perfil del paciente)
- `2xl`: 112px (onboarding / carnet heroico)

### 5.3 Componente `<PetImage />`
Contenedor con aspect ratio controlado (`square`, `video`, `portrait`), radio curvado `rounded-2xl` y fallback editorial.

```tsx
import { PetImage } from '@/components/ui';

<PetImage
  src={mascota.fotoUrl}
  alt={mascota.nombre}
  species={mascota.especie}
  aspectRatio="portrait"
  caption="Ficha médica actualizada 2026"
/>
```

### 5.4 Componente `<PetGallery />`
Galería reutilizable con visor **Lightbox** interactivo, navegación con flechas de teclado y cierre con tecla `Escape`.

```tsx
import { PetGallery } from '@/components/ui';

<PetGallery
  petName="Milo"
  species="perro"
  images={[
    { id: '1', url: '/fotos/milo-1.jpg', caption: 'Control veterinario', date: '12/03/2026' },
    { id: '2', url: '/fotos/milo-2.jpg', caption: 'Carnet de vacunas', date: '05/01/2026' },
  ]}
  columns={3}
/>
```

### 5.5 Visualizadores Especializados de Identificación
- **`<PetMicrochipVisualizer />`**: Formatea el microchip en bloques de 3 dígitos (ej. `941 000 024 891 234`), muestra el sello ISO 11784/11785, estado de registro y botón para copiar con un solo clic.
- **`<PetQrCode />`**: Código QR de verificación para el carnet con sello de seguridad centralizado.

---

## 6. Guía Rápida para Diseñar una Nueva Pantalla

Cuando necesites construir una nueva vista en Mawdy Pet:

1. **Importa los componentes desde `@/components/ui`:**
   ```tsx
   import {
     Button,
     Badge,
     Input,
     Icon,
     BrandLogo,
     PetAvatar,
     FeatureCard,
     InformationCard,
     StatusCard,
     PetCard,
     AssistanceCard,
   } from '@/components/ui';
   ```
2. **Selecciona tus iconos del mapa semántico:**
   Consulta la sección 3 de este documento. No importes librerías externas ni strings SVG.
3. **Usa `<BrandLogo />` para cabeceras corporativas.**
4. **Usa `<PetAvatar />` o `<PetCard />` para identificar al paciente asegurado.**
5. **Alinea los tamaños a las escalas predefinidas (`sm`, `md`, `lg`).**
6. **Verifica siempre la compilación y el linter:**
   ```bash
   npx tsc -b
   npm run lint
   npm run build
   ```
