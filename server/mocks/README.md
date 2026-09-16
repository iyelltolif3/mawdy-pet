# Datos de prueba (mocks) — Guía de edición

Cada sponsor tiene su propio archivo `<sponsorId>.mock.json` en esta carpeta.
**Cada sponsor ve solo sus propios datos de prueba, nunca los de otro.**

## Estructura del JSON

```jsonc
{
  "polizas": [
    {
      "numeroPoliza": "CS-PET-2024-00147",  // Código único de póliza
      "sponsorId": "consalud",               // Debe coincidir con el ID del sponsor
      "businessContractId": "BC-CONSALUD-001",
      "estado": "activa",                    // "activa" | "inactiva" | "vencida"

      "asegurado": {
        "insuredId": 100001,                 // Número entero, único por sponsor
        "businessContractId": "BC-CONSALUD-001",
        "name": "María Fernanda",            // Nombre de pila
        "lastName": "González Rojas",        // Apellidos
        "idNum": "12.345.678-9",             // RUT / documento
        "policy": "CS-PET-2024-00147",       // Debe coincidir con numeroPoliza
        "address": "Av. Providencia 1234",
        "province": "Región Metropolitana",  // Opcional
        "locality": "Providencia",           // Opcional
        "postalCode": "7500000",             // Opcional
        "countryCd": "CL",                   // Código ISO 2 letras, opcional
        "age": 34,                           // Opcional
        "email": "maria@email.cl",           // Opcional
        "phone": "+56912345678"              // Opcional
      },

      "mascota": {
        "riesgoId": "R-CS-00147-01",         // ID del riesgo, único
        "nombre": "Luna",
        "especie": "perro",                  // "perro" | "gato" | "otro"
        "raza": "Golden Retriever",
        "fechaNacimiento": "2021-03-15",     // Formato YYYY-MM-DD (o usar edadEstimada)
        "edadEstimada": null,                // Años, alternativa a fechaNacimiento
        "sexo": "hembra",                   // "macho" | "hembra"
        "pesoKg": 28.5,
        "colorSenasParticulares": "Dorado claro, mancha blanca en el pecho",
        "microchip": "985112000345678",      // Opcional
        "fotoUrl": null                      // Opcional, ruta a imagen
      }
    }
    // ... más pólizas
  ],

  "asistencias": [
    {
      "businessClientId": "CONSALUD_CL",     // ID del sponsor en API Business
      "businessContractId": "BC-CONSALUD-001",
      "insuredId": 100001,                   // Debe coincidir con un asegurado
      "policy": "CS-PET-2024-00147",
      "businessServiceId": "CONSULTA_URGENTE",  // Ver tipos abajo
      "comment": "Descripción del motivo (máx 500 caracteres)",
      "origin": {
        "latitude": -33.4265,
        "longitude": -70.6152,
        "place": "Dirección de origen"
      },
      "destination": null,                   // Opcional, mismo shape que origin
      "occurrenceDate": "2024-11-15T14:30:00-03:00",  // ISO 8601
      "status": "R",                         // Código crudo de la API
      "assistanceId": "AST-CS-2024-001",     // Opcional
      "requestId": "REQ-CS-2024-001"         // Opcional
    }
    // ... más asistencias
  ]
}
```

## Tipos de servicio (businessServiceId)

| Código                     | Significado              |
| -------------------------- | ------------------------ |
| `CONSULTA_URGENTE`         | Consulta veterinaria de urgencia |
| `TRASLADO`                 | Traslado de mascota      |
| `ORIENTACION_TELEFONICA`   | Orientación veterinaria por teléfono |

> Estos son placeholders. El catálogo real lo define Mawdy por sponsor.

## Códigos de estado (status)

| Código | Significado probable      |
| ------ | ------------------------- |
| `L`    | Localizado / En curso     |
| `R`    | Resuelto                  |
| `C`    | Cerrado / Completado      |

> Tabla tentativa. La equivalencia exacta se confirmará con la documentación de Mawdy.

## Cómo editar

1. Abre el archivo del sponsor que quieras modificar (ej. `consalud.mock.json`)
2. Edita los datos directamente en el JSON — no necesitas tocar código
3. Reinicia el servidor de desarrollo (`npm run dev`) para que tome los cambios
4. Los `insuredId` deben ser únicos dentro de cada sponsor
5. El campo `policy` del asegurado debe coincidir con `numeroPoliza` de la póliza

## Agregar un nuevo sponsor

1. Crea `<nuevoSponsor>.mock.json` en esta carpeta
2. Crea `<nuevoSponsor>.json` en `../tenants/`
3. El sistema lo reconocerá automáticamente por subdominio
