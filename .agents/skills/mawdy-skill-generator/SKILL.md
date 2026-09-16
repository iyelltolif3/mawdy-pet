---
name: mawdy-skill-generator
description: >-
  Utiliza esta skill cuando necesites auditar, crear, estandarizar o extender skills dentro del proyecto Mawdy Pet. Provee el estándar oficial de Google Antigravity, lineamientos de progressive disclosure y herramientas de scaffolding automatizado para escalar cualquier módulo o funcionalidad del producto.
---

# Mawdy Skill Generator (Meta-Skill)

> **Módulo:** Meta-Desarrollo & Ecosistema de Agentes  
> **Ámbito:** Proyecto Corporativo Mawdy Pet (Insurtech B2B2C)  
> **Normativa de respaldo:** [Google Antigravity Skills Specification](https://antigravity.google/docs/skills/)

---

## 1. Misión de la Meta-Skill

Esta skill actúa como el **generador y auditor maestro** de skills para el equipo de desarrollo y los agentes de IA que trabajan en **Mawdy Pet**. Asegura que cualquier nueva habilidad técnica o de negocio que se introduzca en el proyecto cumpla rigurosamente con:

1. **Estándar de Antigravity:** Frontmatter YAML estricto, nombres normalizados en kebab-case, descripciones en tercera persona orientadas a la activación semántica y estructura de carpetas en `.agents/skills/`.
2. **Divulgación Progresiva (*Progressive Disclosure*):** Mantener el archivo `SKILL.md` sintético y ejecutivo, delegando la documentación voluminosa a `references/` para no saturar el contexto.
3. **Consistencia de Dominio Insurtech:** Incorporar los conceptos clave de Mawdy (Mapfre Asistencia): sponsors multi-tenant, carnet digital Pawer-style, catálogo de asistencias médicas, integración dual mock/real y autenticación de asegurados.

---

## 2. Flujo de Creación de una Nueva Skill

Cuando se requiera crear una nueva skill para un módulo o feature de Mawdy Pet, sigue estos pasos:

### Paso 1: Definición de Alcance e Identificador
- **Nombre:** Formato `mawdy-<dominio>-<feature>` (ej. `mawdy-telemedicina`, `mawdy-notificaciones-push`).
- **Descripción:** Redacta en tercera persona especificando **qué hace** y **cuándo debe activarse**.

### Paso 2: Generación Automatizada con el Scaffold
Ejecuta el script oficial de generación ubicado en `scripts/generate-skill.cjs`:

```bash
node .agents/skills/mawdy-skill-generator/scripts/generate-skill.cjs <nombre-skill> "<descripción>" "<Título Legible>" "<Módulo>"
```

*Ejemplo:*
```bash
node .agents/skills/mawdy-skill-generator/scripts/generate-skill.cjs mawdy-geolocalizacion "Utiliza esta skill cuando el usuario requiera modificar o integrar servicios de geocodificación inversa, mapas o cálculo de radio de traslado de ambulancias para mascotas." "Geolocalización y Despacho de Emergencias" "Asistencias B2C"
```

### Paso 3: Redacción de Instrucciones en `SKILL.md`
1. Reemplaza los marcadores en el archivo generado con los procedimientos exactos del código.
2. Añade enlaces markdown relativos hacia los archivos fuente de Mawdy Pet:
   - Clientes de backend: `[real-asistencias.ts](file:///c:/Users/Felipe%20Nelargo/.gemini/antigravity-ide/scratch/mawdy-pet/server/api/real-asistencias.ts)`
   - Hooks de frontend: `[useActivePet.ts](file:///c:/Users/Felipe%20Nelargo/.gemini/antigravity-ide/scratch/mawdy-pet/src/hooks/useActivePet.ts)`
   - Tokens de diseño: `[DESIGN.md](file:///c:/Users/Felipe%20Nelargo/.gemini/antigravity-ide/scratch/mawdy-pet/DESIGN.md)`

### Paso 4: Documentos de Referencia en `references/`
Si el módulo consume APIs externas (OpenAPI de Mawdy PRE) o define contratos complejos, coloca los esquemas en `references/` en lugar de copiarlos completos en el `SKILL.md`.

### Paso 5: Auditoría y Validación
Ejecuta el verificador para validar que la skill no tenga fallas de formato:

```bash
node .agents/skills/mawdy-skill-generator/scripts/generate-skill.cjs --check
```

---

## 3. Checklist de Calidad para una Skill de Mawdy Pet

Antes de dar por concluida la creación de una skill, verifica:
- [ ] ¿El nombre de la carpeta coincide exactamente con el campo `name` del frontmatter?
- [ ] ¿La descripción está en tercera persona e incluye las palabras clave con las que un usuario solicitaría la tarea?
- [ ] ¿Se incluyen comandos de validación ejecutables (`npx tsc -b`, pruebas o endpoints)?
- [ ] ¿Respeta el principio de aislamiento multi-tenant y la paleta *Warm Linen & Stone* si toca el frontend?
- [ ] ¿`generate-skill.cjs --check` pasa con 0 errores?

---

## 4. Referencias y Recursos
- [Normativa y Especificaciones de Antigravity Skills](./references/antigravity-standards.md)
- [Plantilla Base Canónica](./templates/skill-template.md)
