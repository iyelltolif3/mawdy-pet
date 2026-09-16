---
name: mawdy-insurtech-cartera
description: >-
  Utiliza esta skill cuando necesites consultar, crear o modificar funcionalidades relacionadas con el Carnet Digital de la mascota, la gestión de pólizas, titulares asegurados, coberturas de salud o la implementación del cliente RealCarteraClient contra la API Business de Mawdy.
---

# Mawdy Insurtech Cartera & Carnet Digital

> **Módulo:** Cartera, Pólizas y Carnet Digital de la Mascota  
> **Ámbito:** Frontend (`src/pages/PolizaPage.tsx`, `src/hooks/useActivePet.ts`) y Backend (`server/api/real-cartera.ts`, `server/api/mock-cartera.ts`)  
> **Referencia:** [Especificación de Cartera](./references/cartera-api-spec.md)

---

## 1. Contexto de Negocio y Principios de Producto

El **Carnet Digital de la Mascota** es la pieza central de la experiencia del asegurado B2C. Está inspirado en el estándar de **Pawer** (`somospawer.cl`), combinando:
1. **Credencial Oficial:** Ficha del paciente asegurado con microchip ISO verificable, especie, raza, peso y foto oficial.
2. **Resumen de Cobertura:** Estado de vigencia de la póliza, coberturas de urgencia y copago/deducible $0.
3. **Mascota Activa:** Hook `useActivePet.ts` que administra la mascota actualmente seleccionada y persiste la preferencia del usuario en `localStorage` con clave monomarca (`active_pet_<sponsorId>`).

---

## 2. Procedimientos de Desarrollo

### 2.1 Conectar la Cartera con la Sesión del Asegurado
1. **Regla de Negocio:** Nunca invocar `buscarCartera({})` sin parámetros en producción. Debe filtrarse siempre por el RUT del asegurado autenticado:
   ```typescript
   const polizas = await buscarCartera({ idNum: rutAsegurado });
   ```
2. Si el asegurado posee múltiples mascotas (ej. 2 perros asegurados bajo una misma póliza Consalud), mostrarlas como opciones en el selector de cabecera de `HomePage.tsx` y en `PolizaPage.tsx`.

### 2.2 Implementar o Extender `RealCarteraClient`
1. Revisa la interfaz canónica en `server/api/interfaces.ts` (`ICarteraClient`).
2. En `server/api/real-cartera.ts`:
   - Obtén el token de acceso de AWS Cognito mediante el servicio de autenticación compartido.
   - Envía los headers requeridos: `countryId: CL`, `Accept-Language: ES`, `Authorization: Bearer <token>`.
   - Consume el endpoint OpenAPI:
     ```http
     GET /api/business/client/{businessClientId}/insureds?idNum={rut}&policy={policy}
     ```
   - Mapea la respuesta del OpenAPI al contrato tipado `Poliza` y `Mascota`.

### 2.3 Visualización del Carnet Digital en `PolizaPage.tsx`
1. Mantén la jerarquía editorial: máximo 1 tarjeta elevada hero para el carnet.
2. Formatea las fechas con `toLocaleDateString('es-CL')`.
3. Códigos oficiales (RUT, Póliza, Microchip) deben usar fuente monoespaciada (`font-mono`).

---

## 3. Validación y Pruebas
1. Compilación estricta de tipos:
   ```bash
   npx tsc -b
   ```
2. Prueba de consulta de cartera mock en consola:
   ```bash
   node -e "fetch('http://localhost:3001/api/cartera/buscar?idNum=12.345.678-9', { headers: { 'Host': 'consalud.localhost:5173' } }).then(r=>r.json()).then(console.log)"
   ```
