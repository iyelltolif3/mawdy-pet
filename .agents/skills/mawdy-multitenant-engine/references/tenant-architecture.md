# Arquitectura del Motor Multi-Tenant B2B2C — Mawdy Pet

## 1. Detección y Resolución de Sponsors

El sistema utiliza resolución de subdominios tanto en producción como en desarrollo local:
- `consalud.localhost:5173` -> Sponsor `consalud` (Consalud Pet)
- `zurichsantander.localhost:5173` -> Sponsor `zurichsantander` (Zurich Santander Pet)
- `admin.localhost:5173` o `/admin` -> Consola B2B de Mawdy
- Parámetro fallback de desarrollo: `?sponsor=<id>`

### Middleware Express: `server/middleware/tenantResolver.ts`
1. Extrae el host de `req.headers.host`.
2. Verifica si el subdominio corresponde a un sponsor registrado en `server/tenants/*.json`.
3. Inyecta el objeto `req.tenant` en la solicitud.
4. Si el subdominio es `admin` o la ruta es `/api/admin`, marca `req.isAdminDomain = true`.

---

## 2. Inyección Dinámica de Identidad Visual (Frontend)

El contexto React `TenantContext.tsx` (`src/features/tenant/TenantContext.tsx`) consulta `/api/tenant` al iniciar y realiza:
1. **Inyección en `:root`:** Modifica las variables CSS globales:
   - `--color-primary`: Color primario del sponsor.
   - `--color-secondary`: Color secundario institucional.
   - `--color-accent`: Color de resalte y acento.
   - `--color-background`: Fondo general (canvas cálido `#fbf9f5`).
2. **Metadata dinámica:**
   - `document.title`: Actualizado con el nombre oficial del sponsor (ej. "Consalud Pet").
   - Favicon dinámico adaptado al logo del sponsor.
3. **PWA Manifest dinámico:**
   - Express sirve `/manifest.json` y `/manifest.webmanifest` adaptados en tiempo real con nombre, colores e iconos del sponsor activo.

---

## 3. Principio de Aislamiento Estricto Monomarca

> **Regla de Oro:** En la vista del cliente asegurado (B2C), **está estrictamente prohibido** mostrar selectores de marcas competidoras, opciones para cambiar de sponsor o logos compartidos. La experiencia del usuario asegurado debe ser 100% monomarca e indistinguible de una app nativa del partner.
