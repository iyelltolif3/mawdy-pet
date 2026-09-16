# Arquitectura de Autenticación y Sesión — Mawdy Pet

## 1. Autenticación del Asegurado (B2C)

El flujo de acceso para el cliente asegurado prioriza la baja fricción sin sacrificar el aislamiento y la privacidad:

```text
Cliente Asegurado
   │
   ├── Ingresa su RUT / DNI (ej: 12.345.678-9)
   │
   ├── Frontend consulta /api/cartera/buscar?idNum={rut} (enviando el Host del Sponsor)
   │
   ├── Si existen pólizas activas en el sponsor:
   │     ├── Se inicializa InsuredUser en InsuredAuthContext
   │     ├── Se almacena en localStorage con clave: mawdy_insured_<sponsorId>
   │     └── Se filtra automáticamente useActivePet a las mascotas de dicho RUT
   │
   └── Si no se encuentra póliza:
         └── Mensaje editorial tranquilizador invitando a contactar soporte
```

---

## 2. Aislamiento de Sesión por Sponsor

Para evitar que una sesión iniciada en un sponsor (ej. Consalud) afecte a otro (ej. Zurich Santander):
1. Las claves de almacenamiento local son específicas por sponsor:
   - `mawdy_insured_${sponsorId}`: Datos del titular asegurado activo.
   - `active_pet_${sponsorId}`: ID del riesgo / mascota preferida.
2. Al cambiar de subdominio, `InsuredAuthContext` restaura automáticamente la sesión correspondiente a ese sponsor, o permanece en estado público si no hay sesión para esa marca.

---

## 3. Seguridad de la Consola de Administración (B2B)

- **Middleware:** `adminAuthMiddleware` en `server/index.ts`.
- **Header Requerido:** `Authorization: Bearer <token>` o `x-admin-token: <token>`.
- **Rutas Protegidas:** Todas las rutas bajo `/api/admin/*` (excepto `/api/admin/login`).
- **Validación de Token:** Tokens de sesión administrativa generados al autenticarse en `POST /api/admin/login` con credenciales de entorno (`ADMIN_USER`, `ADMIN_PASSWORD`).
