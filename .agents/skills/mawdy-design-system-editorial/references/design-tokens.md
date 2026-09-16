# Tokens de Diseño y Reglas Visuales — Mawdy Pet (Warm Linen & Stone)

## 1. Tokens de Color y Superficies

| Token CSS | Valor HEX | Uso en Interfaz |
| :--- | :--- | :--- |
| `--color-canvas` | `#fbf9f5` | Fondo general de todas las pantallas B2C (lino cálido). |
| `--color-surface-warm` | `#ffffff` | Tarjetas hero elevadas (credencial de mascota). |
| `--color-surface-tinted` | `#f5f2ec` | Bloques secundarios planos teñidos. |
| `--color-surface-subtle` | `#ede9e0` | Controles inactivos y divisores de contenedor. |
| `--color-border-warm` | `#e7e3da` | Bordes principales de contención. |
| `--color-border-hairline`| `#eeeae3` | Divisores ultrafinos entre filas de listas. |

---

## 2. Tipografía Editorial

- **Titulares principales y Display:** `stone-900` (`#1c1917`), `font-bold` o `font-black`.
- **Cuerpo explicativo:** `stone-700` (`#44403c`), `text-sm` o `text-xs`.
- **Etiquetas descriptivas:** `stone-500` (`#78716c`), `text-xs font-semibold`.
- **Datos técnicos:** `font-mono` (`JetBrains Mono`), reservado exclusivamente para RUT, N° de póliza, folio `AST-...` y microchip.

### Prohibiciones Tipográficas:
- **PROHIBIDO:** `uppercase tracking-wider` en etiquetas funcionales. Usa siempre *sentence case*.
- **PROHIBIDO:** Puntos medios (`•` o `·`) para encadenar datos inconexos. Estructura la información en pares clave-valor o badges semánticos.

---

## 3. Radios de Esquinas y Jerarquía de Elevación

- `rounded-3xl` (`24px`): Contenedores principales, tarjetas hero de mascota y modales completos.
- `rounded-2xl` (`16px`): Módulos agrupados teñidos, opciones de triaje médico.
- `rounded-xl` (`12px`): Botones, inputs, badges y controles táctiles individuales.

### Máximo de Elevación:
Máximo **1 o 2 tarjetas elevadas** con sombra por pantalla. El resto de la información respira sobre superficies planas teñidas (`bg-stone-100/70`) o listas con bordes ultrafinos (`divide-y divide-stone-200/70`).

---

## 4. Firmas Visuales Mawdy Pet

1. **`PetBrandSeal`:** Emblema circular con huella vectorizada en marca de agua:
   - Esquina superior del Carnet Digital (`opacity-15`).
   - Pantalla de confirmación de asistencia médica (`opacity-20`).
   - Estados vacíos ilustrados y feedback tranquilizador (`opacity-80`).
2. **Área táctil mínima:** 44x44px en todos los botones y controles (`min-h-[44px]`).
