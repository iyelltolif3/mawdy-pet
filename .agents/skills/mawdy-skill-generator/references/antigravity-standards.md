# Antigravity Skills: Especificación y Buenas Prácticas

Documento de referencia para el diseño, desarrollo y validación de skills en el entorno Google Antigravity.

---

## 1. ¿Qué es una Skill en Antigravity?

Una **Skill** es un paquete modular de conocimiento, procedimientos y herramientas especializadas que extiende las capacidades del agente autónomo de IA. Funciona como un manual operativo (*runbook*) o *cheatsheet* que enseña al agente cómo abordar tareas complejas, seguir convenciones de código y ejecutar flujos de trabajo sin inventar procedimientos a ciegas.

---

## 2. Anatomía de una Skill

Toda skill vive dentro de una carpeta bajo `.agents/skills/<skill-name>/` en el espacio de trabajo del proyecto (o `~/.gemini/config/skills/` a nivel global).

```text
.agents/skills/<skill-name>/
├── SKILL.md          # [OBLIGATORIO] Instrucciones maestras con frontmatter YAML
├── scripts/          # [OPCIONAL] Scripts ejecutables de apoyo (Node.js, Bash, Python, etc.)
├── examples/         # [OPCIONAL] Ejemplos de referencia y casos de uso
├── resources/        # [OPCIONAL] Plantillas, esquemas JSON y activos
└── references/       # [OPCIONAL] Documentación densa para divulgación progresiva
```

---

## 3. Estructura Obligatoria de `SKILL.md`

### 3.1 Frontmatter YAML

El archivo `SKILL.md` debe comenzar invariablemente con un bloque YAML delimitado por `---`:

```markdown
---
name: nombre-de-la-skill
description: >-
  Descripción precisa en tercera persona. Qué hace la skill y cuándo debe activarse.
  Ejemplo: "Utiliza esta skill cuando el usuario solicite implementar un nuevo sponsor o modificar el motor de theming multi-tenant."
---
```

#### Reglas del Frontmatter:
- **`name`**: Identificador único en minúsculas separado por guiones (kebab-case). Debe coincidir exactamente con el nombre de la carpeta contenedora.
- **`description`**: **El campo más crítico de la skill**. El agente primario evalúa esta descripción durante la inferencia para decidir si activa la skill ante el prompt del usuario. Debe redactarse en **tercera persona** y responder dos preguntas:
  1. ¿**Qué** capacidad aporta la skill?
  2. ¿**Cuándo** o ante qué términos/intenciones debe activarse?

---

## 4. Principios Clave de Diseño

1. **Divulgación Progresiva (*Progressive Disclosure*):**
   - El archivo `SKILL.md` no debe sobrecargarse de texto innecesario para no saturar la ventana de contexto.
   - Coloca la documentación exhaustiva, esquemas y tablas en la carpeta `references/` y enlaza hacia ellos con markdown relativo (`[Detalle de API](./references/api.md)`).
2. **Ayudantes Ejecutables (*Executable Helpers*):**
   - Automatiza tareas mecánicas repetitivas con scripts en `scripts/` (ej. scripts en Node.js o PowerShell).
3. **Pasos de Validación Verificables:**
   - Cada flujo de la skill debe incluir cómo comprobar que la acción fue exitosa (comandos de prueba, comprobación de estado de compilación o inspección de endpoints).
4. **No Duplicación:**
   - No enseñes a la IA conocimientos genéricos que ya domina (ej. qué es React o cómo funciona un bucle for). Concéntrate exclusivamente en las reglas específicas del negocio y de este proyecto.
