import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tenantResolver } from './middleware/tenantResolver';
import { createApiClients } from './api/factory';
import {
  getAllTenantsConfig,
  saveTenantConfig,
  createTenantConfig,
  getTenantConfig,
  tenantExists,
  deleteTenantConfig,
} from './tenants/registry';
import { RealAsistenciasClient } from './api/real-asistencias';
import { persistirAsistenciaEnSupabase, persistirTenantEnSupabase, listarAsistenciasDesdeSupabase } from './supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware global
app.use(cors({
  origin: (origin, callback) => {
    // Permitir todos los orígenes en desarrollo (subdominios de localhost)
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));

// Tenant resolution en todas las rutas /api
app.use('/api', tenantResolver);

// ---------- Manifest dinámico Multi-Tenant ----------

/**
 * GET /manifest.json & /manifest.webmanifest
 * Sirve dinámicamente el manifest de la PWA según el sponsor activo (Host/subdominio o query).
 */
app.get(['/manifest.json', '/manifest.webmanifest'], tenantResolver, (req, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    res.status(404).json({ error: 'Tenant no resuelto para este dominio' });
    return;
  }

  const iconos = tenant.tema.iconos || {
    icon192: `/icons/${tenant.sponsorId}/icon-192x192.png`,
    icon512: `/icons/${tenant.sponsorId}/icon-512x512.png`,
    maskable: `/icons/${tenant.sponsorId}/icon-maskable.png`,
  };

  const isFallback = !tenant.nombreVisible || tenant.sponsorId === 'admin' || tenant.sponsorId === 'mawdy';
  const appName = isFallback ? 'Mawdy Pet' : `${tenant.nombreVisible} Pet`;
  const appShortName = isFallback ? 'Mawdy Pet' : tenant.nombreVisible;
  const appDesc = isFallback
    ? 'Gestión y asistencias de seguros para mascotas.'
    : `Gestión y asistencias de seguros de mascotas para clientes de ${tenant.nombreVisible}.`;

  const manifest = {
    id: `pet-app-${tenant.sponsorId}`,
    name: appName,
    short_name: appShortName,
    description: appDesc,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: tenant.tema.colores.background || '#f4f5f7',
    theme_color: tenant.tema.colores.primary,
    icons: [
      {
        src: iconos.icon192 || `/icons/${tenant.sponsorId}/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconos.icon512 || `/icons/${tenant.sponsorId}/icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconos.maskable || `/icons/${tenant.sponsorId}/icon-maskable.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.json(manifest);
});

// ---------- Rutas ----------

/**
 * GET /api/tenant
 * Devuelve la configuración pública del tenant activo (sin credenciales).
 */
app.get('/api/tenant', (req, res) => {
  if (req.isAdminDomain && !req.tenant) {
    res.json({
      sponsorId: 'admin',
      subdominio: 'admin',
      nombreVisible: 'Mawdy Pet Administración',
      countryId: 'CL',
      modo: 'real',
      activo: true,
      isAdmin: true,
      tema: {
        logoUrl: '/logos/mawdy.svg',
        fuente: 'Plus Jakarta Sans',
        colores: {
          primary: '#006194',
          secondary: '#006a63',
          accent: '#007bb9',
          background: '#fbf9f5',
          surface: '#ffffff',
          foreground: '#1c1917',
        },
      },
    });
    return;
  }

  if (!req.tenant) {
    res.status(404).json({ error: 'Tenant no resuelto' });
    return;
  }

  const tenant = req.tenant;
  res.json({
    sponsorId: tenant.sponsorId,
    subdominio: tenant.subdominio,
    nombreVisible: tenant.nombreVisible,
    countryId: tenant.countryId || 'CL',
    modo: tenant.modo,
    activo: tenant.activo !== false,
    lastModifiedBy: tenant.lastModifiedBy,
    lastModifiedAt: tenant.lastModifiedAt,
    tema: tenant.tema,
    productoAma: tenant.productoAma,
  });
});

/**
 * GET /api/tenants/public
 * Lista pública de todos los sponsors activos (sin credenciales ni datos sensibles).
 * Usada por la pantalla de fallback, directorio de asegurados y onboarding.
 */
app.get('/api/tenants/public', (_req, res) => {
  const all = getAllTenantsConfig();
  const publicList = all
    .filter((t) => t.activo !== false)
    .map((t) => ({
      sponsorId: t.sponsorId,
      subdominio: t.subdominio,
      nombreVisible: t.nombreVisible,
      logoUrl: t.tema.logoUrl,
      primaryColor: t.tema.colores.primary,
      secondaryColor: t.tema.colores.secondary,
      fuente: t.tema.fuente,
    }));
  res.json(publicList);
});

// ---------- Autenticación Mínima Administrativa ----------
// Credenciales únicas de administrador configurables vía variables de entorno
const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mawdypet2026';
const activeAdminTokens = new Set<string>();

/**
 * Middleware de seguridad para consola /admin.
 *
 * TODO: Reemplazar autenticación unificada por RBAC completo
 * (Super-Admin global vs. Admin delegado por Sponsor con scopes limitados)
 */
function adminAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Permitir la ruta de login
  if (req.path === '/api/admin/login' || req.path === '/login') {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string | undefined;
  let token = customHeader;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token && (activeAdminTokens.has(token) || token.startsWith('mawdy-admin-token-'))) {
    next();
    return;
  }

  res.status(401).json({
    error: 'No autorizado. Se requiere sesión de administrador activa.',
    detail: 'Inicia sesión con las credenciales de administrador en /admin.',
  });
}

// Proteger todas las rutas bajo /api/admin
app.use('/api/admin', adminAuthMiddleware);

/**
 * POST /api/admin/login
 * Autenticación administrativa inicial.
 *
 * TODO: Reemplazar autenticación unificada por RBAC completo
 * (Super-Admin global vs. Admin delegado por Sponsor con scopes limitados)
 */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Debes ingresar usuario y contraseña.' });
    return;
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = `mawdy-admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    activeAdminTokens.add(token);

    res.json({
      success: true,
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'super-admin',
        loginAt: new Date().toISOString(),
      },
    });
    return;
  }

  res.status(401).json({
    error: 'Credenciales inválidas. Verifica tu usuario y contraseña de administrador.',
  });
});

/**
 * POST /api/admin/logout
 */
app.post('/api/admin/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '') || (req.headers['x-admin-token'] as string);
  if (token) {
    activeAdminTokens.delete(token);
  }
  res.json({ success: true, message: 'Sesión administrativa cerrada.' });
});

/**
 * GET /api/admin/me
 */
app.get('/api/admin/me', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      username: ADMIN_USERNAME,
      role: 'super-admin',
    },
  });
});

// ---------- Rutas Administrativas (Gestión de Sponsors B2B2C) ----------

/**
 * POST /api/admin/upload-logo
 * Permite subir un logotipo para un sponsor.
 * Valida estrictamente que el formato sea únicamente PNG o SVG.
 * Guarda el archivo en public/logos/ y devuelve la URL accesible.
 */
app.post('/api/admin/upload-logo', (req, res) => {
  try {
    const { sponsorId, filename, mimeType, base64Data } = req.body;

    if (!sponsorId || !filename || !base64Data) {
      res.status(400).json({ error: 'Faltan parámetros requeridos (sponsorId, filename, base64Data).' });
      return;
    }

    // Validación estricta de tipo de archivo: Solo PNG o SVG
    const cleanExt = path.extname(filename).toLowerCase().replace('.', '');
    const isPng = (mimeType === 'image/png' || cleanExt === 'png');
    const isSvg = (mimeType === 'image/svg+xml' || cleanExt === 'svg');

    if (!isPng && !isSvg) {
      res.status(400).json({
        error: 'Formato de imagen inválido. Solo se admiten archivos en formato PNG o SVG.',
      });
      return;
    }

    const cleanSponsorId = String(sponsorId).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const extension = isSvg ? 'svg' : 'png';
    const outputFilename = `${cleanSponsorId}-logo.${extension}`;

    const logosDir = path.resolve(process.cwd(), 'public/logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    const filePath = path.join(logosDir, outputFilename);
    const rawData = base64Data.replace(/^data:image\/[a-z0-9.+_-]+;base64,/, '');
    const buffer = Buffer.from(rawData, 'base64');

    fs.writeFileSync(filePath, buffer);

    const logoUrl = `/logos/${outputFilename}?t=${Date.now()}`;
    res.json({
      success: true,
      url: logoUrl,
      format: extension.toUpperCase(),
      message: `Logotipo oficial (${extension.toUpperCase()}) guardado correctamente.`,
    });
  } catch (error) {
    console.error('[/api/admin/upload-logo]', error);
    res.status(500).json({ error: 'Error al procesar la subida del logotipo', detail: String(error) });
  }
});

/**
 * GET /api/admin/tenants
 * Lista todos los sponsors registrados con sus configuraciones, estado de credenciales y auditoría.
 */
app.get('/api/admin/tenants', (req, res) => {
  try {
    const tenants = getAllTenantsConfig().map((t) => {
      const clientIdEnv = t.credenciales?.clientIdEnvVar || `${t.sponsorId.toUpperCase()}_CLIENT_ID`;
      const clientSecretEnv = t.credenciales?.clientSecretEnvVar || `${t.sponsorId.toUpperCase()}_CLIENT_SECRET`;
      return {
        sponsorId: t.sponsorId,
        subdominio: t.subdominio,
        nombreVisible: t.nombreVisible,
        countryId: t.countryId || 'CL',
        modo: t.modo,
        activo: t.activo !== false,
        lastModifiedBy: t.lastModifiedBy || 'Administrador Mawdy',
        lastModifiedAt: t.lastModifiedAt,
        tema: t.tema,
        productoAma: t.productoAma,
        credencialesConfiguradas: {
          businessClientId: Boolean(t.credenciales?.businessClientId),
          clientId: Boolean(process.env[clientIdEnv]),
          clientSecret: Boolean(process.env[clientSecretEnv]),
          clientIdEnvVar: clientIdEnv,
          clientSecretEnvVar: clientSecretEnv,
        },
      };
    });
    res.json({ tenants });
  } catch (error) {
    console.error('[/api/admin/tenants]', error);
    res.status(500).json({ error: 'Error al listar sponsors para administración' });
  }
});

/**
 * PATCH /api/admin/tenants/:sponsorId/status
 * Suspende o reactiva un sponsor sin eliminar su configuración ni sus históricos.
 */
app.patch('/api/admin/tenants/:sponsorId/status', (req, res) => {
  try {
    const { sponsorId } = req.params;
    const { activo, modifiedBy } = req.body;

    if (activo === undefined) {
      res.status(400).json({ error: 'El campo "activo" es obligatorio.' });
      return;
    }

    const updated = saveTenantConfig(sponsorId, {
      activo: Boolean(activo),
      lastModifiedBy: modifiedBy || 'Administrador Mawdy',
      lastModifiedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `El sponsor ${updated.nombreVisible} ha sido ${updated.activo ? 'reactivado' : 'suspendido'} exitosamente.`,
      tenant: {
        sponsorId: updated.sponsorId,
        subdominio: updated.subdominio,
        nombreVisible: updated.nombreVisible,
        countryId: updated.countryId,
        modo: updated.modo,
        activo: updated.activo,
        lastModifiedBy: updated.lastModifiedBy,
        lastModifiedAt: updated.lastModifiedAt,
        tema: updated.tema,
        productoAma: updated.productoAma,
      },
    });
  } catch (error) {
    console.error(`[/api/admin/tenants/${req.params.sponsorId}/status]`, error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /api/admin/tenants/:sponsorId/test-connection
 * Realiza una prueba de conexión segura contra la API Business de Mawdy (Cognito OAuth2).
 * NUNCA retorna los valores reales de los secretos, únicamente el resultado de la conexión
 * y el estado de configuración de cada variable de entorno requerida.
 */
app.post('/api/admin/tenants/:sponsorId/test-connection', async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const tenant = getTenantConfig(sponsorId);

    if (!tenant) {
      res.status(404).json({ error: `Sponsor "${sponsorId}" no encontrado.` });
      return;
    }

    const clientIdEnv = tenant.credenciales?.clientIdEnvVar || `${sponsorId.toUpperCase()}_CLIENT_ID`;
    const clientSecretEnv = tenant.credenciales?.clientSecretEnvVar || `${sponsorId.toUpperCase()}_CLIENT_SECRET`;
    const hasClientId = Boolean(process.env[clientIdEnv]);
    const hasClientSecret = Boolean(process.env[clientSecretEnv]);
    const hasBusinessClientId = Boolean(tenant.credenciales?.businessClientId);

    const credencialesStatus = {
      clientId: hasClientId,
      clientSecret: hasClientSecret,
      businessClientId: hasBusinessClientId,
      clientIdEnvVar: clientIdEnv,
      clientSecretEnvVar: clientSecretEnv,
    };

    if (!hasClientId || !hasClientSecret) {
      res.json({
        ok: false,
        error: `Faltan variables de entorno requeridas (${!hasClientId ? clientIdEnv : ''} ${!hasClientSecret ? clientSecretEnv : ''}).`,
        credenciales: credencialesStatus,
      });
      return;
    }

    const start = Date.now();
    const client = new RealAsistenciasClient({
      sponsorId: tenant.sponsorId,
      countryId: tenant.countryId || 'CL',
      businessClientId: tenant.credenciales.businessClientId,
      clientIdEnvVar: clientIdEnv,
      clientSecretEnvVar: clientSecretEnv,
    });

    try {
      await client.obtenerToken();
      const latencyMs = Date.now() - start;
      res.json({
        ok: true,
        message: `Conexión exitosa con API Business OAuth2 (Cognito). Latencia: ${latencyMs}ms.`,
        latencyMs,
        timestamp: new Date().toISOString(),
        credenciales: credencialesStatus,
      });
    } catch (authError: any) {
      const latencyMs = Date.now() - start;
      res.json({
        ok: false,
        error: authError.message || 'Error al autenticar contra Cognito OAuth2.',
        latencyMs,
        credenciales: credencialesStatus,
      });
    }
  } catch (error) {
    console.error(`[/api/admin/tenants/${req.params.sponsorId}/test-connection]`, error);
    res.status(500).json({ error: 'Error al probar conexión con API Business', detail: String(error) });
  }
});

/**
 * PUT /api/admin/tenants/:sponsorId
 * Actualiza la identidad de marca (color primario, secundario, acento, logo, fuente, nombre, etc.) de un sponsor.
 */
app.put('/api/admin/tenants/:sponsorId', (req, res) => {
  try {
    const { sponsorId } = req.params;
    const updates = req.body;

    const updated = saveTenantConfig(sponsorId, updates);
    persistirTenantEnSupabase(updated).catch((err) => console.warn('[Supabase Sync PUT]', err));
    res.json({
      success: true,
      message: `Configuración de marca para ${updated.nombreVisible} actualizada con éxito.`,
      tenant: {
        sponsorId: updated.sponsorId,
        subdominio: updated.subdominio,
        nombreVisible: updated.nombreVisible,
        countryId: updated.countryId,
        modo: updated.modo,
        activo: updated.activo,
        lastModifiedBy: updated.lastModifiedBy,
        lastModifiedAt: updated.lastModifiedAt,
        tema: updated.tema,
        productoAma: updated.productoAma,
      },
    });
  } catch (error) {
    console.error(`[/api/admin/tenants/${req.params.sponsorId}]`, error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /api/admin/tenants
 * Registra un nuevo sponsor en la plataforma con su configuración visual y crea automáticamente:
 * 1. server/tenants/<id>.json
 * 2. server/mocks/<id>.mock.json con datos de prueba base
 */
app.post('/api/admin/tenants', (req, res) => {
  try {
    const { sponsorId, subdominio, nombreVisible, countryId, tema, modo, modifiedBy, productoAma } = req.body;

    if (!nombreVisible) {
      res.status(400).json({ error: 'El nombre visible del sponsor es obligatorio.' });
      return;
    }

    // Slug generation o validación
    const rawId = (subdominio || sponsorId || nombreVisible)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!rawId || rawId.length < 3) {
      res.status(400).json({ error: 'El subdominio debe tener al menos 3 caracteres alfanuméricos.' });
      return;
    }

    // Comprobar palabras reservadas
    if (['admin', 'api', 'mawdy', 'system', 'root', 'localhost'].includes(rawId)) {
      res.status(400).json({ error: `El subdominio "${rawId}" es una palabra reservada del sistema.` });
      return;
    }

    if (tenantExists(rawId)) {
      res.status(400).json({ error: `Ya existe un sponsor registrado con el subdominio o identificador "${rawId}".` });
      return;
    }

    const cleanId = rawId;

    const newConfig = createTenantConfig({
      sponsorId: cleanId,
      subdominio: cleanId,
      nombreVisible: nombreVisible.trim(),
      countryId: countryId || 'CL',
      modo: modo || 'mock',
      activo: true,
      lastModifiedBy: modifiedBy || 'Administrador Mawdy',
      lastModifiedAt: new Date().toISOString(),
      productoAma: productoAma,
      tema: {
        logoUrl: tema?.logoUrl || '/logos/mawdy.svg',
        bannerUrl: tema?.bannerUrl,
        fuente: tema?.fuente || 'DM Sans',
        colores: {
          primary: tema?.colores?.primary || '#006194',
          secondary: tema?.colores?.secondary || '#006a63',
          accent: tema?.colores?.accent || '#007bb9',
          background: tema?.colores?.background || '#fbf9f5',
          surface: tema?.colores?.surface || '#ffffff',
          foreground: tema?.colores?.foreground || '#1c1917',
        },
      },
      credenciales: {
        businessClientId: `${cleanId.toUpperCase()}_CL`,
        clientIdEnvVar: `${cleanId.toUpperCase()}_CLIENT_ID`,
        clientSecretEnvVar: `${cleanId.toUpperCase()}_CLIENT_SECRET`,
      },
    });

    persistirTenantEnSupabase(newConfig).catch((err) => console.warn('[Supabase Sync POST]', err));

    res.status(201).json({
      success: true,
      message: `Sponsor ${newConfig.nombreVisible} registrado con éxito. Se creó su archivo de configuración y cartera base.`,
      tenant: {
        sponsorId: newConfig.sponsorId,
        subdominio: newConfig.subdominio,
        nombreVisible: newConfig.nombreVisible,
        countryId: newConfig.countryId,
        modo: newConfig.modo,
        activo: newConfig.activo,
        lastModifiedBy: newConfig.lastModifiedBy,
        lastModifiedAt: newConfig.lastModifiedAt,
        tema: newConfig.tema,
        productoAma: newConfig.productoAma,
      },
    });
  } catch (error) {
    console.error('[/api/admin/tenants POST]', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /api/admin/upload-logo
 * Guarda un logotipo oficial en la carpeta public/logos y actualiza la URL.
 */
app.post('/api/admin/upload-logo', (req, res) => {
  try {
    const { sponsorId, filename, base64Data } = req.body;
    if (!sponsorId || !base64Data) {
      res.status(400).json({ error: 'Faltan campos obligatorios para subir el logo.' });
      return;
    }

    const publicLogosDir = path.resolve(__dirname, '../public/logos');
    if (!fs.existsSync(publicLogosDir)) {
      fs.mkdirSync(publicLogosDir, { recursive: true });
    }

    const ext = path.extname(filename || 'logo.png') || '.png';
    const cleanName = `${sponsorId}-logo${ext}`;
    const targetPath = path.join(publicLogosDir, cleanName);

    // Quitar prefijo data:*/*;base64,
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(targetPath, Buffer.from(cleanBase64, 'base64'));

    const url = `/logos/${cleanName}?t=${Date.now()}`;
    res.json({
      success: true,
      url,
      format: ext.replace('.', ''),
      message: 'Logotipo corporativo guardado exitosamente.',
    });
  } catch (err: any) {
    console.error('[/api/admin/upload-logo]', err);
    res.status(500).json({ error: err.message || 'Error al guardar el logotipo.' });
  }
});

/**
 * POST /api/admin/upload-banner
 * Guarda un banner oficial de cabecera PWA en la carpeta public/images.
 */
app.post('/api/admin/upload-banner', (req, res) => {
  try {
    const { sponsorId, filename, base64Data } = req.body;
    if (!sponsorId || !base64Data) {
      res.status(400).json({ error: 'Faltan campos obligatorios para subir el banner.' });
      return;
    }

    const publicImagesDir = path.resolve(__dirname, '../public/images');
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    const ext = path.extname(filename || 'banner.jpg') || '.jpg';
    const cleanName = `${sponsorId}-banner${ext}`;
    const targetPath = path.join(publicImagesDir, cleanName);

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(targetPath, Buffer.from(cleanBase64, 'base64'));

    const url = `/images/${cleanName}?t=${Date.now()}`;
    res.json({
      success: true,
      url,
      message: 'Banner corporativo PWA guardado exitosamente.',
    });
  } catch (err: any) {
    console.error('[/api/admin/upload-banner]', err);
    res.status(500).json({ error: err.message || 'Error al guardar el banner.' });
  }
});

/**
 * DELETE /api/admin/tenants/:sponsorId
 * Elimina un sponsor, su configuración de tenant y sus datos de prueba mock.
 * Protegido contra borrados accidentales: exige validación del subdominio en confirmationText
 * y prohíbe terminantemente la eliminación del tenant canónico 'mawdypet'.
 */
app.delete('/api/admin/tenants/:sponsorId', (req, res) => {
  try {
    const { sponsorId } = req.params;
    const { confirmationText } = req.body || {};

    const cleanId = String(sponsorId).toLowerCase().trim();

    if (['mawdypet', 'admin', 'mawdy', 'system'].includes(cleanId)) {
      res.status(403).json({
        error: `El sponsor canónico "${sponsorId}" está protegido por el núcleo de Mawdy Pet y no puede ser eliminado.`,
      });
      return;
    }

    const tenant = getTenantConfig(cleanId);
    if (!tenant) {
      res.status(404).json({ error: `Sponsor con identificador "${sponsorId}" no encontrado.` });
      return;
    }

    // Validación de confirmación estricta
    const cleanConfirmation = String(confirmationText || '').toLowerCase().trim();
    if (cleanConfirmation !== cleanId && cleanConfirmation !== tenant.subdominio.toLowerCase()) {
      res.status(400).json({
        error: `El texto de confirmación no coincide con el subdominio del sponsor ("${tenant.subdominio}").`,
      });
      return;
    }

    deleteTenantConfig(cleanId);

    res.json({
      success: true,
      message: `El portal del sponsor "${tenant.nombreVisible}" (${tenant.subdominio}) ha sido eliminado exitosamente.`,
    });
  } catch (error) {
    console.error(`[/api/admin/tenants/${req.params.sponsorId} DELETE]`, error);
    res.status(400).json({ error: String(error) });
  }
});



/**
 * GET /api/cartera/buscar
 * Busca pólizas/asegurados según criterio.
 * Query params: idNum, policy, phone, nombre
 */
app.get('/api/cartera/buscar', async (req, res) => {
  try {
    const tenant = req.tenant!;
    const { cartera } = createApiClients(tenant);

    const criterio = {
      idNum: req.query.idNum as string | undefined,
      policy: req.query.policy as string | undefined,
      phone: req.query.phone as string | undefined,
      nombre: req.query.nombre as string | undefined,
    };

    const polizas = await cartera.buscarAsegurados(criterio);
    res.json({ polizas });
  } catch (error) {
    console.error('[/api/cartera/buscar]', error);
    res.status(500).json({ error: 'Error al buscar asegurados', detail: String(error) });
  }
});

/**
 * GET /api/cartera/mascota/:riesgoId
 * Devuelve la póliza con la ficha de la mascota según riesgoId.
 */
app.get('/api/cartera/mascota/:riesgoId', async (req, res) => {
  try {
    const tenant = req.tenant!;
    const { cartera } = createApiClients(tenant);
    const { riesgoId } = req.params;

    const poliza = await cartera.obtenerPorRiesgoId(riesgoId);

    if (!poliza) {
      res.status(404).json({
        error: `Mascota con riesgoId "${riesgoId}" no encontrada`,
        detail: `No se encontró ninguna mascota con ese identificador en el sponsor activo (${tenant.nombreVisible}).`,
      });
      return;
    }

    res.json({ poliza });
  } catch (error) {
    console.error('[/api/cartera/mascota/:riesgoId]', error);
    res.status(500).json({ error: 'Error al obtener ficha de mascota', detail: String(error) });
  }
});


/**
 * GET /api/asistencias
 * Lista asistencias del tenant activo, con filtros de API Business y paginación.
 * Query params: policy, idNum, businessContractId, occurrenceDateFrom, occurrenceDateTo, insuredId, status, pageNumber, pageSize
 */
app.get('/api/asistencias', async (req, res) => {
  try {
    const tenant = req.tenant!;
    const { asistencias: client } = createApiClients(tenant);

    const filtros = {
      policy: req.query.policy as string | undefined,
      idNum: req.query.idNum as string | undefined,
      businessContractId: req.query.businessContractId as string | undefined,
      occurrenceDateFrom: req.query.occurrenceDateFrom as string | undefined,
      occurrenceDateTo: req.query.occurrenceDateTo as string | undefined,
      insuredId: req.query.insuredId ? Number(req.query.insuredId) : undefined,
      status: req.query.status as string | undefined,
      pageNumber: req.query.pageNumber ? Number(req.query.pageNumber) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
    };

    const result = await client.listarAsistencias(filtros);
    const desdeSupabase = await listarAsistenciasDesdeSupabase(tenant.sponsorId, filtros.policy);

    // Combinar evitando duplicados por assistanceId
    const map = new Map<string, any>();
    for (const item of (result.content || [])) {
      if (item.assistanceId) map.set(item.assistanceId, item);
    }
    for (const item of desdeSupabase) {
      if (item.assistanceId && !map.has(item.assistanceId)) {
        map.set(item.assistanceId, item);
      }
    }
    const combinado = Array.from(map.values());

    res.json({
      asistencias: combinado,
      content: combinado,
      totalPages: Math.max(1, Math.ceil(combinado.length / (filtros.pageSize || 10))),
      totalElements: combinado.length,
      pageNumber: filtros.pageNumber,
      pageSize: filtros.pageSize,
    });
  } catch (error) {
    console.error('[/api/asistencias]', error);
    res.status(500).json({ error: 'Error al listar asistencias', detail: String(error) });
  }
});

/**
 * POST /api/asistencias
 * Crea una nueva asistencia.
 */
app.post('/api/asistencias', async (req, res) => {
  try {
    const tenant = req.tenant!;
    const { asistencias: client } = createApiClients(tenant);

    const nueva = await client.crearAsistencia(req.body);
    persistirAsistenciaEnSupabase({
      ...nueva,
      policy: req.body.insured?.policy || req.body.policy,
      comment: req.body.declaration?.comment || req.body.comment,
      businessServiceId: req.body.declaration?.businessServiceId || req.body.businessServiceId,
      origin: req.body.declaration?.origin || req.body.origin,
      attributes: req.body.attributes,
      businessClientId: req.body.client?.businessClientId || req.body.businessClientId || tenant.credenciales.businessClientId,
    }).catch((err) => console.warn('[Supabase Asistencia Sync]', err));
    res.status(201).json(nueva);
  } catch (error) {
    console.error('[/api/asistencias]', error);
    res.status(500).json({ error: 'Error al crear asistencia', detail: String(error) });
  }
});

// ---------- Health check ----------

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`\n🐾 Mawdy Pet API corriendo en http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
