# Integración API Business Mawdy PRE & AWS Cognito OAuth2

## 1. Servidores y Autenticación OAuth2

- **Servidor Mawdy PRE:** `https://api-pre.mia-assistance.com/maip_api_bss_assist`
- **Servidor Cognito OAuth2:** `https://auth-pre.mia-assistance.com/oauth2/token`
- **Grant Type:** `client_credentials`
- **Autenticación en Token Request:** Cabecera HTTP `Authorization: Basic <base64(CLIENT_ID:CLIENT_SECRET)>`
- **Tipo de Contenido:** `application/x-www-form-urlencoded`

### Mecanismo de Caché de Tokens:
Para optimizar latencia y prevenir saturación del servidor de identidad de AWS Cognito:
1. Almacenar el token en memoria junto con su timestamp de expiración (`expiresAt = Date.now() + (expires_in * 1000)`).
2. Reutilizar el token si el tiempo restante es superior a 60 segundos (`expiresAt - 60000 > Date.now()`).
3. Renovar de forma transparente si expira o faltan menos de 60 segundos.

---

## 2. Headers Obligatorios en Solicitudes Mawdy

Todas las llamadas hacia los endpoints de negocio de Mawdy PRE requieren:
```http
Authorization: Bearer <token_de_cognito>
countryId: CL
Accept-Language: ES
Content-Type: application/json
```

---

## 3. Endpoints de Negocio Clave en Mawdy PRE

| Endpoint | Método | Descripción | Módulo |
| :--- | :--- | :--- | :--- |
| `/api/business/assistances` | `POST` | Creación de caso de asistencia médica veterinaria. | Asistencias |
| `/api/business/client/{id}/assistances` | `GET` | Consulta y listado de casos de asistencia por sponsor. | Asistencias |
| `/api/business/client/{id}/insureds` | `GET` | Búsqueda de asegurados por RUT (`idNum`) o N° póliza (`policy`). | Cartera |
| `/api/business/client/{id}/insured/{insuredId}`| `GET` | Detalle específico de un asegurado registrado. | Cartera |
| `/api/business/breakdowns` | `GET` | Catálogo de tipos de averías / emergencias. | Configuración |

---

## 4. Factory Dual (Mock vs Real)

Ubicada en `server/api/factory.ts`:
- Inspecciona `tenant.modo` (o variables `<SPONSOR>_MODE` en `.env`).
- Si es `"real"` y existen las variables `<SPONSOR>_CLIENT_ID` y `<SPONSOR>_CLIENT_SECRET`, instancia `RealAsistenciasClient` y `RealCarteraClient`.
- Si es `"mock"` (o faltan credenciales), instancia `MockAsistenciasClient` y `MockCarteraClient` sin interrumpir la operación del frontend.
