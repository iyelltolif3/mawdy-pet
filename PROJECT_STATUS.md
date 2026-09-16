# 🐾 Project Status: Mawdy Pet

> **Documento Maestro de Contexto, Arquitectura y Estado Operativo**  
> **Fecha de actualización:** Septiembre 2026 (Fase 1 Refactor Visual & UX: Mawdy Pet Design System Unificado)  
> **Destinatario principal:** Agentes de IA, arquitectos de software y desarrolladores que ingresan al proyecto para auditar, refactorizar o continuar el desarrollo.

---

## 1. Resumen Ejecutivo y Misión

**Mawdy Pet** es una plataforma web progresiva (**PWA**) y solución de ecosistema **Multi-Tenant B2B2C** desarrollada para **Mawdy (Mapfre Asistencia)**.

Su posicionamiento estratégico es ser la **alternativa superior a Pawer** (`somospawer.cl`), combinando:
1. **B2C (Asegurados / Clientes Finales):** Experiencia monomarca exclusiva por sponsor (Consalud, Falabella, Santander Seguros, Mawdy Pet canónico), con bienvenida institucional, **Carnet Digital de la mascota hiper-personalizable** (avatar, apodo, clínica/veterinario de cabecera, alergias), **Asistente de Inducción en 3 pasos** (`/onboarding`) y solicitud inmediata de asistencias veterinarias 24/7 (SOS, telemedicina, ambulancia pet).
2. **B2B / Backoffice (Consola `/admin`):** Gestión operativa sin desarrolladores: alta de nuevos sponsors en un formulario con auto-generación de tenants y carteras sintéticas, inspección segura de credenciales, conmutación entre entornos **Pre-productivo (Datos Sintéticos)** y **Productivo (API Business / Core Aseguradora)**, previsualización dual en vivo y personalización visual del carnet digital.
3. **Mawdy Pet Design System (Single Source of Truth):** Sistema visual unificado formalizado en `DESIGN.md` y centralizado en `src/components/ui/`, erradicando la inconsistencia visual de iteraciones pasadas de IA. Establece reglas cardinales de claridad, tipografía única (`Plus Jakarta Sans`), iconografía estándar (`lucide-react`), tokens semánticos inmutables y 5 tipos de tarjetas especializadas (`FeatureCard`, `InformationCard`, `StatusCard`, `PetCard`, `AssistanceCard`).
4. **Sistema de Assets & Multimedia (`ASSETS.md`):** Biblioteca exclusiva `lucide-react`, tokens de escala (`icon-xs` a `icon-xl`) y trazo fijo de `2.0`, componente `<BrandLogo />` multi-tenant con fallback automático a Mawdy, y suite de fotografía de mascota (`PetAvatar`, `PetImage`, `PetGallery`, `PetMicrochipVisualizer`, `PetQrCode`) con placeholders editoriales sobrios sin emojis informales.

---

## 2. Diagnóstico Técnico para Agentes: Lo Bueno, Lo Resuelto y Próximos Pasos

### 🟢 2.1 Lo Bueno (Fortalezas y Logros Arquitecturales Consolidados)

1. **Aislamiento Multi-Tenant Estricto y Resolución Automática:**
   - Detección automática de sponsor vía subdominios (`mawdypet.localhost:5173`, `consalud.localhost:5173`, `falabella.localhost:5173`) o query param `?sponsor=<id>`.
   - **Fallback canónico:** Acceso directo a `localhost:5173` o `127.0.0.1` sin subdominio resuelve nativamente a **Mawdy Pet**.
   - **Directorio Dinámico de Sponsors:** Si se ingresa a un subdominio no existente, el backend responde `404` y el frontend despliega un directorio estético consultando `GET /api/tenants/public`, evitando páginas rotas.
   - Sincronización en caliente en disco (`syncDiskTenants`): Cualquier nuevo archivo `server/tenants/<id>.json` se detecta en tiempo real sin requerir reinicio del servidor Express.
   - Theming dinámico mediante CSS custom properties (`--color-primary`, `--color-secondary`, etc.) y PWA Manifest adaptativo.

2. **Login Empresarial B2B2C Profesional ([src/pages/LoginPage.tsx](file:///c:/Users/Felipe%20Nelargo/.gemini/antigravity-ide/scratch/mawdy-pet/src/pages/LoginPage.tsx)):**
   - **Estándar UXI B2B:** Erradicación de la estética genérica "mega IA" (sombras infladas, gradientes de fantasía). Diseño de alta credibilidad corporativa.
   - **Co-Branding Real:** Logotipo oficial del Sponsor (`branding.logo`) co-brandeado con *"Operado por Mawdy"* y el sello de protección de agua `PetBrandSeal`.
   - **Layout Dual Responsive:** Vista compacta en móvil y layout ejecutivo en dos columnas para desktop con resumen de coberturas del colectivo y sellos regulatorios.
   - **Controles Corporativos:** Formateo automático de RUT (`12.345.678-9`), campo de contraseña con botón para alternar visibilidad (👁️), y enlace de recuperación.
   - **Canales de Asistencia 24/7:** Botón directo a WhatsApp oficial con mensaje predefinido y enlace a correo de soporte.
   - **Barra de Accesibilidad (A- / A / A+):** Escala tipográfica dinámica (`html[data-text-scale]`) en tiempo de ejecución.
   - **Acceso 1-clic Pre-productivo:** Botones para iniciar sesión inmediata con asegurados sintéticos de prueba (**Camila Valenzuela** y **Rodrigo Pizarro**).

3. **Asistente de Bienvenida & Configuración Inicial de la Ficha ([src/pages/OnboardingPage.tsx](file:///c:/Users/Felipe%20Nelargo/.gemini/antigravity-ide/scratch/mawdy-pet/src/pages/OnboardingPage.tsx)):**
   - **Estructura en 3 pasos con progreso continuo:**
     - **Paso 1: Datos Básicos & Colectivo:** Confirmación de especie (Perro / Gato con selector visual y checkmark), nombre oficial validado contra cartilla sanitaria, sexo (Macho / Hembra) y tarjeta de colectivo del sponsor.
     - **Paso 2: Personalización & Identificación:** Selector de avatar de carnet (emojis representativos o foto original), apodo cariñoso entre comillas, raza, peso y microchip oficial de 15 dígitos (con opción "En trámite").
     - **Paso 3: Ficha Médica & Urgencias:** Registro de veterinario/clínica habitual, teléfono directo de urgencias y notas médicas/alergias.
   - **Flexibilidad:** Opciones claras de `Guardar y salir` y `Omitir por ahora` para no bloquear al usuario ante una emergencia médica.
   - **Sincronización:** Persiste en `localStorage` (`pet_custom_${riesgoId}`) y actualiza reactivamente tanto el Home como el Carnet Digital y la ficha médica.

4. **Hiper-Personalización de la Mascota (Mawdy Pet vs Pawer):**
   - **Nivel Sponsor (`/admin`):** En `SponsorConfigPage.tsx` (Sección 6), el sponsor define el estilo visual del carnet (`linen`, `brand-gradient` o `minimal`), lema oficial, marca de agua `PetBrandSeal`, módulos visibles y mensaje de urgencias 24/7, con **previsualización dual simultánea (Pantalla 2)** en vivo.
   - **Nivel Asegurado (`/poliza`):** Modal interactivo para personalizar avatar, apodo, clínica de cabecera y notas de alergias, más botón `Compartir carnet` para enviar los datos clave a paseadores o clínicas.

5. **Consola de Administración B2B2C `/admin` Operativa:**
   - **Alta de Sponsor en 1 paso:** Modal con validación de subdominios que genera automáticamente `server/tenants/<id>.json` y `server/mocks/<id>.mock.json`.
   - **Inspección Segura de Credenciales:** Indica si las variables de entorno de AWS Cognito están configuradas sin exponer secretos.
   - **Botón "⚡ Probar Conexión":** Autentica contra Cognito OAuth2 y mide latencia en tiempo real.
   - **Control de Ciclo de Vida:** Desactivar/Reactivar sponsors (bloqueo con `HTTP 423 Locked`).
   - **Validación de Contraste WCAG AA:** Análisis de luminancia en tiempo real.
   - **Seguridad:** Middleware `adminAuthMiddleware` que protege todas las rutas `/api/admin/*`.

6. **Terminología Oficial Estandarizada:**
   - Erradicación total del término "MOCK" en la UI.
   - **Pre-productivo (con datos sintéticos para el MVP):** Ambiente de simulación para validar flujos y diseño.
   - **Productivo (API Business / Core Aseguradora):** Ambiente conectado a los contratos reales de Mawdy PRE.

7. **Mawdy Pet Design System Unificado (Single Source of Truth):**
   - **Manual Rector (`DESIGN.md`):** Definición canónica de concepto de marca (plataforma digital de seguros y asistencias, no infantil, no veterinaria genérica, no SaaS IA).
   - **Reglas Cardinales:** *Clarity over decoration, function over decoration, hierarchy over density, consistency over novelty*.
   - **Tipografía Única:** `Plus Jakarta Sans` en toda la aplicación con 6 niveles de escala (`display`, `page title`, `section title`, `body`, `metadata`, `caption`).
   - **Iconografía Unificada:** `lucide-react` oficial, erradicando strings dispersos de Material Symbols y emojis funcionales.
   - **Tokens Semánticos Inmutables:** `success` (esmeralda), `warning` (ámbar), `danger` (rojo), `info` (celeste corporativo), `emergency` (rubí/rosa).
   - **Escalas Concisas:** Radios en 3 niveles (`sm: 6px`, `md: 10px`, `lg: 16px`) y sombras en 2 niveles (`subtle`, `elevated`).
   - **Catálogo de Componentes UI Centralizados (`src/components/ui/`):**
     - `Button`: Variantes semánticas (`primary`, `secondary`, `tertiary`, `danger`, `emergency`, `icon`), zona táctil mínima de 44px (`rounded-lg`).
     - `Badge`: Tokens semánticos, sin forma de píldora indiscriminada (`rounded-md`).
     - `Input` & `Select`: Ergonomía móvil (44px min-h, `rounded-lg`, foco accesible).
     - **5 Tarjetas Especializadas:** `FeatureCard`, `InformationCard`, `StatusCard`, `PetCard`, `AssistanceCard`.
   - **Regla Multi-Tenant de Cabecera:** Logotipo de sponsor prioritario; Mawdy secundario en footer, términos y certificación `PetBrandSeal`. Nunca co-branding compitiendo en la cabecera.

8. **Calidad de Código y Estándares:**
   - React 19, TypeScript 6, Vite 8, Express 5, Tailwind CSS v4.
   - `npx tsc -b`: **0 errores** de compilación.
   - `npm run lint`: **0 errores** de linter.
   - `npm run build`: Genera bundle de producción y Service Worker PWA exitosamente.

---

### 🛠️ 2.2 Lo Resuelto (Deuda Técnica Saldada en las Últimas Iteraciones)

| Deuda Técnica Previa | Solución Aplicada | Estado |
| :--- | :--- | :---: |
| **Falta de Autenticación B2C** | Creado `InsuredAuthContext.tsx` y `LoginPage.tsx` con sesión monomarca por sponsor. `useActivePet.ts` filtra únicamente las pólizas del titular autenticado. | **RESUELTO ✅** |
| **Error `mawdypet.localhost`** | Creados `mawdypet.json` y `mawdypet.mock.json`. Fallback por defecto en `tenantResolver.ts`. Directorio dinámico público `GET /api/tenants/public`. | **RESUELTO ✅** |
| **Falta de Bienvenida / Onboarding** | Implementado `OnboardingPage.tsx` con wizard en 3 pasos para captura de datos enriquecidos por el cliente (apodo, avatar, clínica, alergias). | **RESUELTO ✅** |
| **Uso de la palabra "MOCK"** | Reemplazado formalmente en catálogo, formularios y switches por "Pre-productivo (Datos Sintéticos)" y "Productivo". | **RESUELTO ✅** |
| **Inseguridad en `/api/admin/*`** | Middleware `adminAuthMiddleware` con validación de tokens Bearer/Custom en todas las rutas de backoffice. | **RESUELTO ✅** |
| **Alta manual de sponsors** | `SponsorCreateModal.tsx` genera automáticamente los archivos de configuración y datos sintéticos. | **RESUELTO ✅** |
| **Ficha no personalizable** | Implementada doble personalización: por sponsor en `/admin` y por el asegurado en `/poliza`. | **RESUELTO ✅** |
| **Rediseño Comercial de Login** | `LoginPage.tsx` profesionalizado: estándar B2B2C, logotipo sponsor prioritario, eliminación de UI demo. | **RESUELTO ✅** |
| **Carnet Digital de Mascota** | `PolizaPage.tsx` modularizado en `src/components/carnet/` con hero carousel de fotos, microchip y 4 tabs. | **RESUELTO ✅** |
| **Hub de Asistencia en Inicio** | `HomePage.tsx` rediseñado en 8 bloques canónicos, reduciendo cards y priorizando los 3 servicios asistenciales. | **RESUELTO ✅** |
| **Seguimiento de Asistencias** | `AsistenciasPage.tsx` rediseñado con tarjetas de seguimiento, timeline verídico en 3 fases y empty state humano. | **RESUELTO ✅** |

---

### 🔴 2.3 Deuda Técnica Restante y Puntos de Atención (Para el Próximo Agente)

1. **Integración HTTP Real de Cartera (`RealCarteraClient`):**
   - **Situación actual:** `RealAsistenciasClient` ya realiza llamadas HTTP reales contra AWS Cognito y los endpoints de despacho de asistencias de Mawdy PRE (`API Business PRE.json`). Sin embargo, `RealCarteraClient` aún tiene un stub que lanza excepción.
   - **Próximo paso:** Implementar las llamadas HTTP reales a los endpoints de cartera de Mawdy PRE:
     - `GET /api/business/client/{businessClientId}/insureds?idNum={rut}&policy={policy}`
     - `GET /api/business/client/{businessClientId}/insured/{insuredId}`
     - Reutilizar el helper de autenticación OAuth2 de Cognito ya probado en asistencias.

2. **Persistencia en Base de Datos (Cloud-Native):**
   - **Situación actual:** Los tenants y carteras sintéticas se guardan como archivos JSON en disco (`server/tenants/` y `server/mocks/`), y las imágenes subidas en `public/logos/`.
   - **Próximo paso:** Cuando se prepare el despliegue serverless (AWS ECS / Lambda / Supabase), migrar la lectura/escritura de sponsors a PostgreSQL / MongoDB y la carga de logotipos a un bucket S3.

3. **Limpieza de Archivo Huérfano:**
   - `src/pages/MascotaPage.tsx`: Componente legacy que fue reemplazado totalmente por `PolizaPage.tsx` y `OnboardingPage.tsx`. Puede ser eliminado de forma segura.

4. **Suite de Tests Automatizados:**
   - Incorporar tests unitarios (Vitest) para los cálculos de RUT, cálculo de edad y formateadores de asistencias.
   - Configurar pruebas E2E (Playwright) para el flujo de login -> onboarding -> solicitud de asistencia.

---

### 🟡 2.4 Hoja de Ruta Priorizada (Next Steps)

```mermaid
flowchart TD
    subgraph Paso 1: Cartera Real
        A1[Extraer Cognito Auth a helper compartido] --> A2[Implementar RealCarteraClient contra OpenAPI 3.0]
        A2 --> A3[Probar con credenciales reales Mawdy PRE]
    end

    subgraph Paso 2: Flujo de Reembolsos / Coberturas
        B1[Módulo de solicitud de reembolso veterinario] --> B2[Subida de boleta/receta médica]
        B2 --> B3[Seguimiento de liquidación de gasto]
    end

    subgraph Paso 3: Cloud & Testing
        C1[Eliminar MascotaPage.tsx huérfano] --> C2[Tests Vitest de hooks y contratos]
        C2 --> C3[Migrar JSONs a DB Cloud-Native]
    end

    Paso 1 --> Paso 2
    Paso 2 --> Paso 3
```

---

## 3. Arquitectura del Flujo B2B2C

```text
Cliente (Navegador)
  │
  ├── [subdominio].localhost:5173  (ej. consalud, falabella, mawdypet)
  │          │
  │          ▼
  │    Vite Proxy (5173) ──> Express Backend (3001)
  │                               │
  │                     tenantResolver.ts
  │                               │
  │            ┌──────────────────┴──────────────────┐
  │            ▼                                     ▼
  │     Tenant B2C Resuelto                 Tenant Desconocido (404)
  │     (Mawdy Pet / Consalud)                       │
  │            │                            SponsorNotFoundDirectory
  │            ▼                            (Directorio público dinámico)
  │      /login (B2B2C)
  │   - Co-Branding Sponsor + Mawdy
  │   - RUT + Clave por email
  │   - WhatsApp 24/7 + Accesibilidad
  │            │
  │            ▼
  │      /onboarding (Si es primer acceso)
  │   - Paso 1: Especie, Nombre, Sexo
  │   - Paso 2: Avatar, Apodo, Raza, Chip
  │   - Paso 3: Veterinario, Urgencias, Alergias
  │            │
  │            ▼
  │      /home  ──>  /poliza (Carnet)  ──>  /asistencias/nueva (SOS 24/7)
```

---

## 4. Estructura Actualizada del Código Fuente

```text
mawdy-pet/
├── .env                       # Variables de entorno (Cognito, puertos, secretos admin)
├── API Business PRE.json      # Especificación OpenAPI 3.0 Mawdy PRE (8.500+ líneas)
├── DESIGN.md                  # Manual del sistema de diseño (Warm Linen & Stone)
├── PROJECT_STATUS.md          # [ESTE ARCHIVO] Diagnóstico y estado maestro del proyecto
├── package.json               # Dependencias (React 19, Vite 8, Express 5, Tailwind 4)
├── vite.config.ts             # Setup de Vite, Tailwind v4, PWA Workbox y proxies
│
├── public/
│   ├── logos/                 # Logos de sponsors (consalud.svg, mawdy.svg, etc.)
│   └── icons/                 # Íconos PWA generados
│
├── server/                    # Backend API (Express 5 + TypeScript vía tsx)
│   ├── index.ts               # Servidor REST, endpoints de cartera, asistencias, admin y tenants públicos
│   ├── api/                   # Clientes de integración
│   │   ├── factory.ts         # Conmutador Pre-productivo (Mock) / Productivo (Real)
│   │   ├── interfaces.ts      # Contratos canónicos de API Business
│   │   ├── mock-asistencias.ts# Persistencia sintética de asistencias
│   │   ├── mock-cartera.ts    # Cartera sintética con búsqueda por RUT/póliza
│   │   ├── real-asistencias.ts# Integración real OAuth2 Cognito + Mawdy PRE
│   │   └── real-cartera.ts    # [PENDIENTE] Stub de cartera real
│   ├── middleware/
│   │   └── tenantResolver.ts  # Resolución de tenant por host / subdominio (fallback a mawdypet)
│   ├── mocks/                 # Archivos JSON de cartera sintética por sponsor
│   │   ├── consalud.mock.json
│   │   ├── falabella.mock.json
│   │   ├── mawdypet.mock.json # Camila Valenzuela (Milo, Pelusa), Rodrigo Pizarro (Bruno)
│   │   └── zurichsantander.mock.json
│   └── tenants/               # Configuración oficial de sponsors
│       ├── registry.ts        # Registro en memoria con auto-detección en disco
│       ├── types.ts           # Interfaces de TenantConfig, Tema, FichaMascotaConfig
│       ├── consalud.json
│       ├── falabella.json
│       └── mawdypet.json      # Tenant canónico con paleta y ficha configurada
│
├── src/                       # Frontend SPA / PWA (React 19)
│   ├── App.tsx                # Routing principal B2B2C, protección de sesión, onboarding
│   ├── index.css              # Tokens Tailwind CSS v4 y escala de accesibilidad tipográfica
│   ├── api/                   # Clientes HTTP frontend (cartera, asistencias, tenant, admin)
│   ├── components/
│   │   ├── asistencias/       # AsistenciaTrackingCard, AsistenciaDetailModal (timeline 3 fases)
│   │   ├── carnet/            # PetGallery (carousel), PetIdentityBlock, CoverageStatus, etc.
│   │   ├── layout/            # ConsumerHeader (Lucide Bell/Logout), ConsumerBottomNav (4 tabs)
│   │   └── ui/                # Primitivas (Button, Card, Badge, Input, PetBrandSeal, PetAvatar)
│   ├── features/
│   │   ├── auth/              # InsuredAuthContext (sesión de asegurado monomarca)
│   │   ├── tenant/            # Contexto de Tenant y hook tenantBranding
│   │   └── cartera/           # MascotaSelectorModal
│   ├── hooks/                 # useActivePet (filtrado por usuario), useNetworkStatus
│   ├── pages/                 # Pantallas de la aplicación
│   │   ├── admin/             # Consola B2B (SponsorsListPage, SponsorConfigPage, SponsorCreateModal)
│   │   ├── LoginPage.tsx      # Login Empresarial B2B2C con co-branding, WhatsApp y accesibilidad
│   │   ├── OnboardingPage.tsx # Wizard en 3 pasos de bienvenida y configuración de la ficha
│   │   ├── HomePage.tsx       # Inicio con paciente asegurado, avatar, apodo y SOS
│   │   ├── PolizaPage.tsx     # Carnet Digital con estilo configurable y personalización del asegurado
│   │   ├── AsistenciasPage.tsx# Historial de asistencias con filtros
│   │   ├── NuevaAsistenciaPage.tsx # Flujo 5 pasos de solicitud de asistencia médica
│   │   ├── BuscarPage.tsx     # Búsqueda en cartera
│   │   ├── SoportePage.tsx    # Línea 24/7 y FAQs
│   │   ├── AdminSponsorsPage.tsx # Shell administrativo
│   │   └── MascotaPage.tsx    # [OBSOLETO] Reemplazado por PolizaPage
│   └── types/                 # Tipos TypeScript compartidos
│
└── scratch/                   # Scripts de verificación y pruebas
```

---

## 5. Instrucciones de Ejecución y Testing

### 5.1 Iniciar el Entorno de Desarrollo
```bash
npm run dev
```
Levanta concurrentemente:
- **Frontend Vite:** `http://localhost:5173` (Puerto 5173)
- **Backend Express:** `http://localhost:3001` (Puerto 3001)

### 5.2 URLs de Acceso y Pruebas B2B2C
| Escenario | URL de Acceso | Credenciales Sintéticas de Prueba |
|---|---|---|
| **Mawdy Pet (Canónico)** | `http://mawdypet.localhost:5173/` | RUT `16.789.123-4` / `pet2026` (Camila V. - Milo y Pelusa) |
| **Consalud** | `http://consalud.localhost:5173/` | RUT `15.234.567-8` / `pet2026` (Luna y Rocky) |
| **Seguros Falabella** | `http://falabella.localhost:5173/` | Cuentas configuradas en `falabella.mock.json` |
| **Asistente de Onboarding** | `http://mawdypet.localhost:5173/onboarding` | Requiere sesión activa de asegurado |
| **Carnet Digital Personalizable** | `http://mawdypet.localhost:5173/poliza` | Requiere sesión activa de asegurado |
| **Consola de Administración B2B** | `http://localhost:5173/admin` | User `admin` / Password `mawdypet2026` |

### 5.3 Comandos de Validación de Calidad
```bash
# Validar compilación TypeScript (debe ser 0 errores)
npx tsc -b

# Validar linter
npm run lint

# Validar build de producción y generación de PWA Workbox
npm run build
```

---

## 6. Guía Rápida para el Agente que Continúa

Si eres un agente de IA que toma el relevo de este proyecto, tus prioridades inmediatas son:
1. **Implementar `RealCarteraClient`**: Conectar `server/api/real-cartera.ts` con los endpoints reales de `API Business PRE.json`, extrayendo la lógica de Cognito de `real-asistencias.ts` a un servicio común.
2. **Eliminar `src/pages/MascotaPage.tsx`**: Ya no se utiliza (el carnet y ficha viven en `PolizaPage.tsx` y el asistente en `OnboardingPage.tsx`).
3. **Explorar el Módulo de Reembolsos**: La siguiente gran funcionalidad requerida por el negocio es la rendición de boletas veterinarias para reembolso directo bajo el convenio del sponsor.
