---
name: mawdy-asistencias-workflow
description: >-
  Utiliza esta skill cuando necesites modificar, probar o extender el flujo de asistencias médicas veterinarias de urgencia (SOS, ambulancia pet, consulta inmediata), el wizard en 5 pasos de NuevaAsistenciaPage, el historial de asistencias o el despacho hacia la API de Mawdy.
---

# Mawdy Asistencias Workflow

> **Módulo:** Asistencias Médicas SOS & Triaje de Urgencia  
> **Ámbito:** Frontend (`src/pages/NuevaAsistenciaPage.tsx`, `src/pages/AsistenciasPage.tsx`) y Backend (`server/index.ts`, `server/api/real-asistencias.ts`)  
> **Referencia:** [Flujo de Triaje y Asistencias](./references/triage-flow.md)

---

## 1. Contexto de Negocio y Reglas UX

El módulo de asistencias es el núcleo operativo de **Mawdy (Mapfre Asistencia)**. El usuario suele ingresar en un momento de alta angustia por la salud de su mascota.

### Directrices de Experiencia:
1. **Calma y Claridad:** Los textos deben transmitir serenidad y control (*"Estamos coordinando la atención médica de tu mascota"*).
2. **Sin Fricción de Stepper Rígido:** La interfaz avanza de manera fluida y retiene todos los campos si el usuario retrocede para corregir.
3. **Resguardo de Datos ante Fallos:** Si la petición falla o la red se interrumpe, **nunca** reiniciar el formulario en blanco; preservar el estado y permitir reintentar con 1 clic.
4. **Respeto a los Tokens de Urgencia:** Los badges de estado clínico (`emergency`, `in-progress`, `resolved`) deben usar tokens fijos de salud, nunca el color primario del sponsor.

---

## 2. Procedimientos de Implementación

### 2.1 Modificar o Añadir un Paso al Flujo de Solicitud
1. Abre `src/pages/NuevaAsistenciaPage.tsx`.
2. Conserva la arquitectura de estado unificado (`formData` con datos de paciente, servicio, ubicación y contacto).
3. Asegura que los campos obligatorios se validen antes de avanzar al siguiente bloque.
4. Aplica el componente `PetBrandSeal` en marca de agua para la pantalla de confirmación exitosa.

### 2.2 Despacho hacia el Backend
1. En `src/api/asistencias.ts`, la función `crearAsistencia(payload)` envía el JSON a `POST /api/asistencias`.
2. El backend utiliza la factory (`createApiClients(tenant)`) para despachar el caso a:
   - `MockAsistenciasClient`: si el sponsor opera en modo `mock`.
   - `RealAsistenciasClient`: si el sponsor tiene `modo: "real"`, ejecutando el POST canónico a `/api/business/assistances` de Mawdy PRE.

### 2.3 Listado y Filtros en `AsistenciasPage.tsx`
1. Consulta con paginación (`pageNumber`, `pageSize`) y filtro opcional por estado (`in-progress`, `resolved`).
2. Muestra los casos en formato de lista editorial con divisores finos (`divide-y divide-stone-200/70`).

---

## 3. Validación y Pruebas
1. Compilar TypeScript:
   ```bash
   npx tsc -b
   ```
2. Probar creación de asistencia en consola (simulación):
   ```bash
   node -e "fetch('http://localhost:3001/api/asistencias', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Host': 'consalud.localhost:5173' }, body: JSON.stringify({ businessServiceId: 'CONSULTA_URGENTE', comment: 'Prueba de triaje clínico', origin: { latitude: -33.4372, longitude: -70.6506, place: 'Providencia' } }) }).then(r=>r.json()).then(console.log)"
   ```
