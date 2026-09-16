import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TenantConfig, ProductoAmaConfig } from './types';

export function getDefaultProductoAma(nombreVisible: string): ProductoAmaConfig {
  return {
    productoId: 'AMA-PET-CL-01',
    nombreProducto: `Asistencia Integral Mascotas ${nombreVisible}`,
    polizaColectiva: 'POL-MAWDY-PET-2026',
    servicios: [
      {
        id: 'consulta-urgencia',
        nombre: 'Consulta Veterinaria de Urgencia 24/7',
        descripcion: 'Atención presencial inmediata en red de clínicas asociadas por accidente, cuadro agudo o riesgo vital.',
        icono: 'Siren',
        codigoServicio: 'CONSULTA_URGENTE',
        codigoGarantia: 'GAR-URG-01',
        limiteEventos: '3 eventos al año',
        copagoOTope: '100% cubierto hasta 3 UF por evento',
        activo: true,
      },
      {
        id: 'veterinario-domicilio',
        nombre: 'Médico Veterinario a Domicilio',
        descripcion: 'Atención clínica veterinaria programada o de urgencia en la comodidad de tu hogar.',
        icono: 'Home',
        codigoServicio: 'VETERINARIO_DOMICILIO',
        codigoGarantia: 'GAR-DOM-02',
        limiteEventos: '2 eventos al año',
        copagoOTope: '100% cubierto sin copago',
        activo: true,
      },
      {
        id: 'telemedicina-vet',
        nombre: 'Orientación Veterinaria Telefónica y Videoconsulta',
        descripcion: 'Resolución de dudas médicas, pautas de primeros auxilios y orientación farmacológica 24/7.',
        icono: 'PhoneCall',
        codigoServicio: 'ORIENTACION_TELEFONICA',
        codigoGarantia: 'GAR-TEL-03',
        limiteEventos: 'Sin límite de uso',
        copagoOTope: 'Sin costo / $0 copago',
        activo: true,
      },
      {
        id: 'vacunacion-preventiva',
        nombre: 'Vacunación y Desparasitación Anual',
        descripcion: 'Aplicación de vacuna antirrábica u óctuple/séxtuple y desparasitación interna en clínica en convenio.',
        icono: 'Syringe',
        codigoServicio: 'OTRO',
        codigoGarantia: 'GAR-PREV-04',
        limiteEventos: '1 evento al año',
        copagoOTope: 'Cobertura 100% arancel preferencial',
        activo: true,
      },
      {
        id: 'hospedaje-mascota',
        nombre: 'Hospedaje por Hospitalización del Asegurado',
        descripcion: 'Alojamiento en guardería o residencia canina/felina en caso de hospitalización imprevista del titular.',
        icono: 'Home',
        codigoServicio: 'OTRO',
        codigoGarantia: 'GAR-HOSP-05',
        limiteEventos: 'Hasta 5 días continuos',
        copagoOTope: 'Tope $30.000 CLP / día',
        activo: true,
      },
    ],
  };
}

/**
 * Registry — Carga automáticamente todos los archivos *.json de server/tenants/
 * y los indexa por sponsorId (que coincide con el subdominio).
 *
 * La variable de entorno `<SPONSOR_ID_UPPER>_MODE` puede override el modo
 * definido en el JSON. Ejemplo: CONSALUD_MODE=real
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tenantsDir = path.resolve(__dirname, '.');
const registry = new Map<string, TenantConfig>();

// Cargar todos los JSON de la carpeta tenants/
const files = fs.readdirSync(tenantsDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(tenantsDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const config: TenantConfig = JSON.parse(raw);
  config.activo = config.activo ?? true;

  if (!config.productoAma || !config.productoAma.servicios || config.productoAma.servicios.length === 0) {
    config.productoAma = getDefaultProductoAma(config.nombreVisible);
  }

  // Override del modo vía variable de entorno
  const modeEnvVar = `${config.sponsorId.toUpperCase()}_MODE`;
  const modeOverride = process.env[modeEnvVar];
  if (modeOverride === 'mock' || modeOverride === 'real') {
    config.modo = modeOverride;
  }

  registry.set(config.sponsorId, config);
}

const mocksDir = path.resolve(__dirname, '../mocks');

/**
 * Genera datos mock base para un nuevo sponsor.
 */
function createDefaultMockData(sponsorId: string, nombreVisible: string) {
  const upper = sponsorId.toUpperCase();
  return {
    polizas: [
      {
        numeroPoliza: `${upper}-PET-2026-00101`,
        sponsorId,
        businessContractId: `BC-${upper}-001`,
        estado: 'activa',
        asegurado: {
          insuredId: 200001,
          businessContractId: `BC-${upper}-001`,
          name: 'Camila Andrea',
          lastName: 'Valenzuela Silva',
          idNum: '16.789.123-4',
          policy: `${upper}-PET-2026-00101`,
          address: 'Av. Las Condes 10200, Depto 402',
          province: 'Región Metropolitana',
          locality: 'Las Condes',
          postalCode: '7550000',
          countryCd: 'CL',
          age: 31,
          email: 'camila.valenzuela@correo.cl',
          phone: '+56987654321',
        },
        mascota: {
          riesgoId: `R-${upper}-00101-01`,
          nombre: 'Milo',
          especie: 'perro',
          raza: 'Border Collie',
          fechaNacimiento: '2022-04-10',
          sexo: 'macho',
          pesoKg: 19.5,
          colorSenasParticulares: 'Blanco y negro con collar reflectante',
          microchip: '985112000889901',
        },
      },
      {
        numeroPoliza: `${upper}-PET-2026-00101`,
        sponsorId,
        businessContractId: `BC-${upper}-001`,
        estado: 'activa',
        asegurado: {
          insuredId: 200001,
          businessContractId: `BC-${upper}-001`,
          name: 'Camila Andrea',
          lastName: 'Valenzuela Silva',
          idNum: '16.789.123-4',
          policy: `${upper}-PET-2026-00101`,
          address: 'Av. Las Condes 10200, Depto 402',
          province: 'Región Metropolitana',
          locality: 'Las Condes',
          postalCode: '7550000',
          countryCd: 'CL',
          age: 31,
          email: 'camila.valenzuela@correo.cl',
          phone: '+56987654321',
        },
        mascota: {
          riesgoId: `R-${upper}-00101-02`,
          nombre: 'Pelusa',
          especie: 'gato',
          raza: 'Europeo Común',
          fechaNacimiento: '2023-01-15',
          sexo: 'hembra',
          pesoKg: 4.2,
          colorSenasParticulares: 'Atigrada gris con patitas blancas',
          microchip: '985112000889902',
        },
      },
      {
        numeroPoliza: `${upper}-PET-2026-00204`,
        sponsorId,
        businessContractId: `BC-${upper}-001`,
        estado: 'activa',
        asegurado: {
          insuredId: 200002,
          businessContractId: `BC-${upper}-001`,
          name: 'Rodrigo Ignacio',
          lastName: 'Pizarro Morales',
          idNum: '14.567.890-K',
          policy: `${upper}-PET-2026-00204`,
          address: 'Calle Los Alerces 450',
          province: 'Región Metropolitana',
          locality: 'Ñuñoa',
          postalCode: '7750000',
          countryCd: 'CL',
          age: 38,
          email: 'rodrigo.pizarro@email.cl',
          phone: '+56998765432',
        },
        mascota: {
          riesgoId: `R-${upper}-00204-01`,
          nombre: 'Bruno',
          especie: 'perro',
          raza: 'Labrador Retriever',
          fechaNacimiento: '2021-08-20',
          sexo: 'macho',
          pesoKg: 31.0,
          colorSenasParticulares: 'Negro sólido con mancha blanca en pecho',
          microchip: '985112000889903',
        },
      },
    ],
    asistencias: [
      {
        assistanceId: `AST-${upper}-2026-001`,
        businessClientId: `${upper}_CL`,
        businessContractId: `BC-${upper}-001`,
        policy: `${upper}-PET-2026-00101`,
        insuredId: 200001,
        assistanceType: 'CONSULTA_VETERINARIA',
        status: 'RESUELTA',
        statusDescription: 'Atención completada',
        occurrenceDate: new Date().toISOString(),
        requestDate: new Date().toISOString(),
        address: 'Av. Las Condes 10200, Depto 402',
        contactPhone: '+56987654321',
        description: `Control de rutina y vacunación anual para Milo en convenio con ${nombreVisible}.`,
        mascota: {
          riesgoId: `R-${upper}-00101-01`,
          nombre: 'Milo',
          especie: 'perro',
          raza: 'Border Collie',
        },
      },
    ],
  };
}

/**
 * Recarga los archivos JSON de server/tenants/ si se detecta un nuevo sponsor en disco.
 */
function syncDiskTenants() {
  try {
    const diskFiles = fs.readdirSync(tenantsDir).filter((f) => f.endsWith('.json'));
    for (const file of diskFiles) {
      const id = file.replace('.json', '');
      if (!registry.has(id)) {
        const filePath = path.join(tenantsDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const config: TenantConfig = JSON.parse(raw);
        config.activo = config.activo ?? true;
        registry.set(config.sponsorId, config);
      }
    }
  } catch (e) {
    console.error('[registry] Error al sincronizar tenants desde disco:', e);
  }
}

/**
 * Obtiene la configuración de un tenant por su sponsorId.
 * @returns TenantConfig o undefined si no existe
 */
export function getTenantConfig(sponsorId: string): TenantConfig | undefined {
  if (!registry.has(sponsorId)) {
    syncDiskTenants();
  }
  return registry.get(sponsorId);
}

/**
 * Lista todos los sponsors registrados con su configuración.
 */
export function getAllTenantsConfig(): TenantConfig[] {
  syncDiskTenants();
  return Array.from(registry.values());
}

/**
 * Lista todos los IDs de sponsors registrados.
 */
export function getAllTenantIds(): string[] {
  syncDiskTenants();
  return Array.from(registry.keys());
}

/**
 * Verifica si un sponsor existe en el registro.
 */
export function tenantExists(sponsorId: string): boolean {
  if (!registry.has(sponsorId)) {
    syncDiskTenants();
  }
  return registry.has(sponsorId);
}

/**
 * Guarda y actualiza la configuración de un tenant existente tanto en memoria como en su archivo JSON.
 */
export function saveTenantConfig(
  sponsorId: string,
  updates: Partial<TenantConfig>
): TenantConfig {
  const current = getTenantConfig(sponsorId);
  if (!current) {
    throw new Error(`Sponsor "${sponsorId}" no encontrado en el registro.`);
  }

  const updated: TenantConfig = {
    ...current,
    ...updates,
    sponsorId: current.sponsorId, // el sponsorId es inmutable
    activo: updates.activo !== undefined ? updates.activo : (current.activo ?? true),
    lastModifiedBy: updates.lastModifiedBy || current.lastModifiedBy || 'Administrador Mawdy',
    lastModifiedAt: new Date().toISOString(),
    tema: {
      ...current.tema,
      ...(updates.tema || {}),
      colores: {
        ...current.tema.colores,
        ...(updates.tema?.colores || {}),
      },
      iconos: {
        ...current.tema.iconos,
        ...(updates.tema?.iconos || {}),
      },
      fichaMascota: {
        ...current.tema.fichaMascota,
        ...(updates.tema?.fichaMascota || {}),
      },
    },
    credenciales: {
      ...current.credenciales,
      ...(updates.credenciales || {}),
    },
    productoAma: updates.productoAma !== undefined ? (updates.productoAma as ProductoAmaConfig) : current.productoAma,
  };

  registry.set(sponsorId, updated);

  // Persistir en disco en server/tenants/<sponsorId>.json
  const filePath = path.join(tenantsDir, `${sponsorId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

  return updated;
}

/**
 * Registra un nuevo sponsor en memoria y crea su archivo JSON y su archivo mock base.
 */
export function createTenantConfig(config: TenantConfig): TenantConfig {
  const sponsorId = config.sponsorId.toLowerCase().trim();
  if (registry.has(sponsorId)) {
    throw new Error(`Ya existe un sponsor registrado con el id "${sponsorId}".`);
  }

  const newConfig: TenantConfig = {
    ...config,
    sponsorId,
    subdominio: (config.subdominio || sponsorId).toLowerCase().trim(),
    activo: config.activo !== undefined ? config.activo : true,
    lastModifiedBy: config.lastModifiedBy || 'Administrador Mawdy',
    lastModifiedAt: new Date().toISOString(),
    productoAma: config.productoAma || getDefaultProductoAma(config.nombreVisible),
  };

  registry.set(sponsorId, newConfig);

  // 1. Guardar server/tenants/<sponsorId>.json
  const tenantFilePath = path.join(tenantsDir, `${sponsorId}.json`);
  fs.writeFileSync(tenantFilePath, JSON.stringify(newConfig, null, 2), 'utf-8');

  // 2. Guardar server/mocks/<sponsorId>.mock.json si no existe
  if (!fs.existsSync(mocksDir)) {
    fs.mkdirSync(mocksDir, { recursive: true });
  }
  const mockFilePath = path.join(mocksDir, `${sponsorId}.mock.json`);
  if (!fs.existsSync(mockFilePath)) {
    const mockData = createDefaultMockData(sponsorId, newConfig.nombreVisible);
    fs.writeFileSync(mockFilePath, JSON.stringify(mockData, null, 2), 'utf-8');
  }

  return newConfig;
}

const PROTECTED_SPONSORS = new Set(['mawdypet', 'admin', 'mawdy', 'system']);

/**
 * Elimina un sponsor del registro en memoria y sus archivos correspondientes en disco.
 * Protege estrictamente los tenants canónicos del sistema.
 */
export function deleteTenantConfig(sponsorId: string): boolean {
  const cleanId = sponsorId.toLowerCase().trim();

  if (PROTECTED_SPONSORS.has(cleanId)) {
    throw new Error(
      `El sponsor canónico "${sponsorId}" está protegido por el núcleo del sistema y no puede ser eliminado.`
    );
  }

  if (!registry.has(cleanId) && !tenantExists(cleanId)) {
    throw new Error(`Sponsor "${sponsorId}" no encontrado en el sistema.`);
  }

  // 1. Remover de memoria
  registry.delete(cleanId);

  // 2. Eliminar server/tenants/<sponsorId>.json
  const tenantFilePath = path.join(tenantsDir, `${cleanId}.json`);
  if (fs.existsSync(tenantFilePath)) {
    try {
      fs.unlinkSync(tenantFilePath);
    } catch (e) {
      console.error(`[registry] Error al eliminar archivo tenant ${tenantFilePath}:`, e);
    }
  }

  // 3. Eliminar server/mocks/<sponsorId>.mock.json si existe
  const mockFilePath = path.join(mocksDir, `${cleanId}.mock.json`);
  if (fs.existsSync(mockFilePath)) {
    try {
      fs.unlinkSync(mockFilePath);
    } catch (e) {
      console.error(`[registry] Error al eliminar archivo mock ${mockFilePath}:`, e);
    }
  }

  return true;
}

export { registry };


