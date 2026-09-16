---
name: mawdy-api-business-integration
description: >-
  Utiliza esta skill cuando necesites integrar, auditar o corregir la comunicación con la API Business de Mawdy PRE (OpenAPI 3.0), gestionar la autenticación OAuth2 con AWS Cognito, configurar tokens o alternar entre los modos Mock y Real de los clientes del backend.
---

# Mawdy API Business Integration

> **Módulo:** Integración Backend Mawdy PRE & AWS Cognito OAuth2  
> **Ámbito:** Backend Express (`server/api/`) y configuración de entorno (`.env`)  
> **Referencia:** [Especificación de Cognito y Endpoints](./references/cognito-and-endpoints.md)

---

## 1. Contexto de Negocio y Seguridad

Mawdy (Mapfre Asistencia) expone su plataforma de servicios en el entorno PRE mediante **AWS API Gateway** protegido por **AWS Cognito OAuth2**.

### Principios de Seguridad:
1. **Nunca exponer credenciales al frontend:** Las variables `CLIENT_ID` y `CLIENT_SECRET` solo residen en el servidor Express.
2. **Caché de token en memoria:** El token de Cognito debe reutilizarse con un margen de seguridad de 60 segundos antes de expirar.
3. **Resiliencia ante caídas:** Si la conexión con Mawdy PRE se degrada o no hay credenciales, el sistema debe degradar limpiamente o permitir conmutar a simulación (*mock*).

---

## 2. Procedimientos Paso a Paso

### 2.1 Configurar un Sponsor para Modo Real
1. Abre o actualiza el archivo `.env`:
   ```env
   # Modo de operación del sponsor
   CONSALUD_MODE=real
   CONSALUD_BUSINESS_CLIENT_ID=CONSALUD_CL
   CONSALUD_CLIENT_ID=tu_client_id_cognito
   CONSALUD_CLIENT_SECRET=tu_client_secret_cognito
   ```
2. Asegúrate de que `server/tenants/<sponsorId>.json` tenga:
   ```json
   "modo": "real",
   "credenciales": {
     "businessClientId": "CONSALUD_CL",
     "clientIdEnvVar": "CONSALUD_CLIENT_ID",
     "clientSecretEnvVar": "CONSALUD_CLIENT_SECRET"
   }
   ```

### 2.2 Probar Conectividad en Tiempo Real
Puedes ejecutar la prueba de conexión sin arriesgar secretos mediante el endpoint de diagnóstico administrativo:
```bash
node -e "fetch('http://localhost:3001/api/admin/tenants/consalud/test-connection', { method: 'POST', headers: { 'x-admin-token': 'mawdy-admin-token-bypass' } }).then(r=>r.json()).then(console.log)"
```

### 2.3 Implementar Nuevos Endpoints de OpenAPI
1. Consulta la especificación en `API Business PRE.json`.
2. Añade el contrato de tipos en `server/api/interfaces.ts`.
3. Implementa el método en `server/api/real-asistencias.ts` o `server/api/real-cartera.ts`.
4. Añade la versión simulada correspondiente en `server/api/mock-asistencias.ts` o `server/api/mock-cartera.ts`.

---

## 3. Validación y Chequeos
1. Validar tipos de compilación:
   ```bash
   npx tsc -b
   ```
2. Ejecutar script de prueba de endpoints:
   ```bash
   node scratch/test_endpoints.cjs
   ```
