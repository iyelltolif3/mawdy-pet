---
name: mawdy-multitenant-engine
description: >-
  Utiliza esta skill cuando el usuario requiera dar de alta un nuevo sponsor corporativo, modificar la resolución de subdominios, ajustar la inyección dinámica de temas y CSS variables, o configurar el PWA manifest dinámico en Mawdy Pet.
---

# Mawdy Multi-Tenant Engine

> **Módulo:** Multi-Tenancy B2B2C & Theming  
> **Ámbito:** Frontend (`src/features/tenant/`) y Backend (`server/middleware/`, `server/tenants/`)  
> **Referencia:** [Arquitectura Multi-Tenant](./references/tenant-architecture.md)

---

## 1. Contexto de Negocio y Reglas de Oro

Mawdy Pet es una solución B2B2C donde partners corporativos (Isapres, Bancos, Aseguradoras) ofrecen la plataforma a sus asegurados bajo su propia marca (*white-label*).

### Reglas de Oro del Multi-Tenant:
1. **Aislamiento Monomarca Absoluto en B2C:** En las vistas del asegurado (`/`, `/poliza`, `/asistencias`), **nunca** debe existir un selector de marcas ni referencias a otros sponsors.
2. **Theming Dinámico sin Parpadeos:** Los colores institucionales se inyectan como variables CSS en `:root` (`--color-primary`, `--color-secondary`) inmediatamente al resolver el tenant.
3. **Fallback Institucional Limpio:** Si un sponsor no tiene logo o falla la carga, recurre automáticamente a `/logos/mawdy.svg` sin leyendas invasivas de error.
4. **PWA Manifest Dinámico:** El manifest debe servirse dinámicamente desde el backend según el host de la petición.

---

## 2. Procedimientos Paso a Paso

### 2.1 Registrar un Nuevo Sponsor
1. **Crear archivo de configuración:** Crea `server/tenants/<sponsorId>.json` con la estructura:
   ```json
   {
     "sponsorId": "nuevopartner",
     "subdominio": "nuevopartner",
     "nombreVisible": "Nuevo Partner Pet",
     "countryId": "CL",
     "modo": "mock",
     "activo": true,
     "tema": {
       "logoUrl": "/logos/nuevopartner.svg",
       "fuente": "Plus Jakarta Sans",
       "colores": {
         "primary": "#123456",
         "secondary": "#789abc",
         "accent": "#def012",
         "background": "#fbf9f5",
         "surface": "#ffffff",
         "foreground": "#1c1917"
       }
     },
     "credenciales": {
       "businessClientId": "NUEVOPARTNER_CL",
       "clientIdEnvVar": "NUEVOPARTNER_CLIENT_ID",
       "clientSecretEnvVar": "NUEVOPARTNER_CLIENT_SECRET"
     }
   }
   ```
2. **Crear Cartera Mock:** Añade datos iniciales en `server/mocks/<sponsorId>.mock.json`.
3. **Subir Logo Oficial:** Coloca el logotipo en `public/logos/<sponsorId>.svg` o `.png`.

### 2.2 Modificar o Extender Variables de Theming
1. En `src/features/tenant/TenantContext.tsx`, verifica la aplicación de variables CSS en `:root`.
2. En `src/features/tenant/tenantBranding.ts`, comprueba los valores computados de contraste y clases Tailwind correspondientes.

### 2.3 Probar la Resolución Multi-Tenant
1. Acceso B2C vía subdominio:
   - `http://<sponsorId>.localhost:5173/`
2. Acceso B2C vía query param (modo dev fallback):
   - `http://localhost:5173/?sponsor=<sponsorId>`
3. Comprobar manifest dinámico:
   - `curl http://localhost:3001/manifest.json -H "Host: <sponsorId>.localhost:5173"`

---

## 3. Validación y Chequeos
1. Validar tipos de configuración con `npx tsc -b`.
2. Probar endpoint de estado público:
   ```bash
   node -e "fetch('http://localhost:3001/api/tenants/public').then(r=>r.json()).then(console.log)"
   ```
