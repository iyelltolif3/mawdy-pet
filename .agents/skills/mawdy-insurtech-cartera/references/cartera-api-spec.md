# Especificación de Cartera, Pólizas y Carnet Digital — Mawdy Pet

## 1. Modelo de Datos de Cartera

El dominio de cartera modela la relación entre el **Titular Asegurado**, la **Póliza** y la **Mascota (Riesgo)**:

```typescript
export interface Mascota {
  riesgoId: string;                 // Identificador único de riesgo (ej: R-CS-00293-01)
  nombre: string;
  especie: 'perro' | 'gato' | 'otro';
  raza: string;
  fechaNacimiento?: string;
  edadEstimada?: number;
  sexo: 'macho' | 'hembra';
  pesoKg: number;
  colorSenasParticulares: string;
  microchip?: string;              // Código numérico estándar ISO de 15 dígitos
  fotoUrl?: string;
}

export interface Asegurado {
  insuredId: number;               // ID interno en Mawdy API Business
  businessContractId: string;      // ID de contrato comercial
  name: string;
  lastName: string;
  idNum: string;                   // RUT / DNI del asegurado (ej: 12.345.678-9)
  policy: string;                  // N° de póliza corporativa
  address: string;
  email?: string;
  phone?: string;
}

export interface Poliza {
  numeroPoliza: string;
  sponsorId: string;
  businessContractId: string;
  estado: 'activa' | 'inactiva' | 'vencida';
  asegurado: Asegurado;
  mascota: Mascota;
}
```

---

## 2. Endpoints OpenAPI Mawdy PRE (API Business)

Basado en la especificación OpenAPI 3.0 `maip_api_bss_assist`:

### 2.1 Búsqueda de Asegurados
- **Método:** `GET`
- **Ruta:** `/api/business/client/{businessClientId}/insureds`
- **Query Params:**
  - `idNum`: Documento de identidad / RUT del titular asegurado.
  - `policy`: Número de póliza.
- **Headers Requeridos:**
  - `countryId`: `CL`
  - `Accept-Language`: `ES`
  - `Authorization`: `Bearer <token_cognito>`

### 2.2 Detalle de Asegurado
- **Método:** `GET`
- **Ruta:** `/api/business/client/{businessClientId}/insured/{insuredId}`

---

## 3. Experiencia Pawer: Carnet Digital
- **Identidad de Paciente:** Presentación de alta jerarquía visual con el nombre de la mascota, raza, edad calculada y número de chip.
- **Sello de Protección:** Emblema `PetBrandSeal` en marca de agua (`opacity-15`).
- **Selector de Mascotas:** Si un asegurado tiene más de una mascota registrada en su póliza, el carnet y el home permiten conmutar entre ellas mediante un scroll horizontal fluido o el modal `MascotaSelectorModal.tsx`.
