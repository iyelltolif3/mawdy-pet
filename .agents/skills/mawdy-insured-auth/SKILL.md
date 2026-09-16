---
name: mawdy-insured-auth
description: >-
  Utiliza esta skill cuando requieras implementar, conectar o modificar el flujo de autenticación del asegurado (login por RUT/póliza), la persistencia de sesión monomarca con InsuredAuthContext, la protección de rutas o la seguridad de los endpoints administrativos de Mawdy Pet.
---

# Mawdy Insured Auth & Seguridad

> **Módulo:** Autenticación B2C de Asegurados & Seguridad B2B  
> **Ámbito:** Frontend (`src/features/auth/`, `src/pages/LoginPage.tsx`) y Backend (`server/index.ts`, `server/middleware/`)  
> **Referencia:** [Arquitectura de Autenticación](./references/auth-architecture.md)

---

## 1. Contexto de Negocio y Reglas de Seguridad

La autenticación en Mawdy Pet tiene dos dimensiones claramente diferenciadas:
1. **Asegurado B2C:** Acceso ágil sin contraseñas engorrosas, identificándose mediante su RUT y número de póliza, asegurando que solo visualice las mascotas y coberturas asociadas a su contrato.
2. **Administración B2B:** Control de acceso estricto mediante middleware y tokens de sesión para proteger la configuración de sponsors y pruebas de API.

---

## 2. Procedimientos de Implementación

### 2.1 Conectar el Proveedor de Autenticación B2C
1. Asegura que `InsuredAuthProvider` envuelva a la aplicación dentro de `TenantProvider`:
   ```tsx
   <BrowserRouter>
     <TenantProvider>
       <InsuredAuthProvider>
         <AppContent />
       </InsuredAuthProvider>
     </TenantProvider>
   </BrowserRouter>
   ```
2. Al iniciar sesión exitosamente en `LoginPage.tsx` o modales de acceso:
   ```typescript
   const { login } = useInsuredAuth();
   await login(rutAsegurado);
   ```

### 2.2 Sincronización con `useActivePet`
1. Cuando el asegurado inicia sesión, `useActivePet.ts` filtra automáticamente la cartera por las mascotas del usuario (`user.rut`).
2. Al cerrar sesión (`logout()`), limpia las claves `mawdy_insured_<sponsorId>` y `active_pet_<sponsorId>`.

### 2.3 Proteger Nuevos Endpoints en el Servidor
1. Todo endpoint bajo `/api/admin/*` debe pasar por `adminAuthMiddleware`.
2. Las rutas administrativas deben rechazar peticiones sin el header `Authorization` o `x-admin-token` válido retornando código `401 Unauthorized`.

---

## 3. Validación y Pruebas
1. Verificar compilación de tipos en frontend y backend:
   ```bash
   npx tsc -b
   ```
2. Probar acceso denegado a ruta administrativa sin token:
   ```bash
   node -e "fetch('http://localhost:3001/api/admin/tenants').then(r=>console.log('Status sin auth:', r.status))"
   ```
