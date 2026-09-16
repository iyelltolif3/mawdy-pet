# Flujo Transaccional de Asistencias Médicas y Triaje — Mawdy Pet

## 1. El Proceso en 5 Pasos Humanizado

A diferencia de un asistente de checkout rígido, el flujo de solicitud de asistencia médica en Mawdy Pet (`NuevaAsistenciaPage.tsx`) está diseñado como una conversación estructurada y serena para situaciones de estrés:

```text
Paso 1: Paciente y Causa
   ├── Selección de mascota asegurada (Luna, Copito, etc.)
   └── Síntomas o motivo (ingesta tóxica, atropello, decaimiento, herida)

Paso 2: Tipo de Servicio Requerido
   ├── CONSULTA_URGENTE (Atención veterinaria presencial inmediata)
   ├── TRASLADO (Ambulancia Pet móvil de rescate)
   └── ORIENTACION_TELEFONICA (Telemedicina / orientación médica 24/7)

Paso 3: Ubicación y Georreferenciación
   ├── Dirección de ocurrencia / origen
   ├── Coordenadas (latitud, longitud)
   └── Destino veterinario (en caso de traslado)

Paso 4: Contacto y Confirmación
   ├── Teléfono de contacto inmediato para coordinación técnica
   └── Verificación de deducible $0 cubierto por el sponsor

Paso 5: Emisión de Caso y Despacho
   ├── Generación de Folio Oficial (ej. AST-2026-09-001)
   ├── Despacho a Mawdy API Business (/api/business/assistances)
   └── Sello de confirmación con opción de llamada telefónica directa
```

---

## 2. Retención de Estado y Resiliencia Offline

1. **Estado Offline:** Si `useNetworkStatus()` detecta pérdida de conexión a internet, se muestra un banner superior y se retienen todos los datos ingresados en el formulario (`localStorage` temporal de rescate).
2. **Payload Canónico Mawdy OpenAPI:**
   ```json
   {
     "businessClientId": "CONSALUD_CL",
     "businessContractId": "BC-1002",
     "insuredId": 101,
     "policy": "POL-CS-00293",
     "businessServiceId": "CONSULTA_URGENTE",
     "comment": "Ingesta accidental de chocolate con vómitos reiterados",
     "origin": {
       "latitude": -33.4372,
       "longitude": -70.6506,
       "place": "Av. Providencia 1234, Providencia, Santiago"
     },
     "occurrenceDate": "2026-09-15T00:30:00.000Z",
     "status": "in-progress"
   }
   ```

---

## 3. Estados de Triaje (Inmutables por Marca)

Los colores de estado médico **no se alteran por el color del sponsor**:
- **Emergencia / SOS:** Fondo `bg-rose-50`, texto `text-rose-800`, dot `bg-rose-500 animate-pulse`.
- **En Curso (Móvil en Ruta):** Fondo `bg-sky-50`, texto `text-sky-800`, dot `bg-sky-500 animate-pulse`.
- **Resuelta:** Fondo `bg-emerald-50`, texto `text-emerald-800`, dot `bg-emerald-500`.
- **Cerrada / Archivada:** Fondo `bg-stone-100`, texto `text-stone-700`, dot `bg-stone-400`.
