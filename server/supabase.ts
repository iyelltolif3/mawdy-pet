import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://znmzmgymigwidlttvqel.supabase.co';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubXptZ3ltaWd3aWRsdHR2cWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0OTEzODcsImV4cCI6MjEwNTA2NzM4N30.3CugT5U3LD3wbL2yg0UEU2PQWgs-oaPGrVCd7gMz2pE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Guarda una asistencia en Supabase para persistencia relacional con consistencia total.
 */
export async function persistirAsistenciaEnSupabase(asistencia: any) {
  try {
    const rawPolicy =
      asistencia.policy ||
      asistencia.insured?.policy ||
      'MAWDY-PET-2026-00101';

    const rawRiesgoId =
      asistencia.mascota?.riesgoId ||
      asistencia.attributes?.find((a: any) => a.businessAttributeCd === 'MASCOTA_RIESGO_ID')?.value ||
      'R-MAWDY-00101-01';

    let rawSponsor = (
      asistencia.sponsorId ||
      asistencia.businessClientId?.toLowerCase().replace('_cl', '') ||
      'mawdypet'
    ).toLowerCase();

    if (rawSponsor === 'mawdy') {
      rawSponsor = 'mawdypet';
    }

    const rawGarantia =
      asistencia.attributes?.find((a: any) => a.businessAttributeCd === 'CODIGO_GARANTIA')?.value ||
      'GAR_URG_MEDICA';

    const rawProducto =
      asistencia.attributes?.find((a: any) => a.businessAttributeCd === 'PRODUCTO_AMA')?.value ||
      'AMA-PET-CL-01';

    const { error } = await supabase.from('asistencias').insert({
      assistance_id: asistencia.assistanceId,
      numero_poliza: rawPolicy,
      riesgo_id: rawRiesgoId,
      sponsor_id: rawSponsor,
      tipo_servicio: asistencia.businessServiceId || asistencia.assistanceType || 'CONSULTA_URGENTE',
      codigo_garantia: rawGarantia,
      codigo_producto_ama: rawProducto,
      estado: asistencia.status === 'L' ? 'SOLICITADA' : (asistencia.status || 'SOLICITADA'),
      comentario_asegurado: asistencia.comment || asistencia.description || 'Solicitud de asistencia clínica',
      lugar_atencion: asistencia.origin?.place || asistencia.address || 'Santiago, Chile',
      latitud: asistencia.origin?.latitude ?? -33.425,
      longitud: asistencia.origin?.longitude ?? -70.612,
      proveedor_asignado: 'Red Veterinaria Preferente Mawdy',
      telefono_proveedor: '+56 2 2987 6543',
      fecha_solicitud: asistencia.occurrenceDate || asistencia.requestDate || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] Advertencia al persistir asistencia:', error.message);
    } else {
      console.log('[Supabase] ✅ Asistencia persistida exitosamente en PostgreSQL:', asistencia.assistanceId);
    }
  } catch (err) {
    console.error('[Supabase] Error en persistirAsistenciaEnSupabase:', err);
  }
}

/**
 * Guarda o actualiza un sponsor/tenant en la tabla tenants de Supabase.
 */
export async function persistirTenantEnSupabase(tenant: any) {
  try {
    const { error } = await supabase.from('tenants').upsert({
      sponsor_id: tenant.sponsorId,
      subdominio: tenant.subdominio || tenant.sponsorId,
      nombre_visible: tenant.nombreVisible,
      country_id: tenant.countryId || 'CL',
      modo: tenant.modo || 'mock',
      activo: tenant.activo !== false,
      color_primary: tenant.tema?.colores?.primary || '#d81e05',
      color_secondary: tenant.tema?.colores?.secondary || '#002f6c',
      color_accent: tenant.tema?.colores?.accent || '#f5a623',
      logo_url: tenant.tema?.logoUrl || '/logos/mawdy-official.png',
      banner_url: tenant.tema?.bannerUrl,
      last_modified_by: tenant.lastModifiedBy || 'Administrador Mawdy',
      last_modified_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] Advertencia al upsert tenant:', error.message);
    } else {
      console.log('[Supabase] ✅ Tenant sincronizado en PostgreSQL:', tenant.sponsorId);
    }
  } catch (err) {
    console.error('[Supabase] Error en persistirTenantEnSupabase:', err);
  }
}

/**
 * Consulta asistencias almacenadas en Supabase y las formatea según la API de Mawdy.
 */
export async function listarAsistenciasDesdeSupabase(sponsorId: string, policy?: string) {
  try {
    let query = supabase.from('asistencias').select('*');
    if (sponsorId) {
      const cleanSponsor = sponsorId.toLowerCase();
      query = query.or(`sponsor_id.eq.${cleanSponsor},sponsor_id.eq.mawdypet`);
    }
    if (policy) {
      query = query.eq('numero_poliza', policy);
    }
    const { data, error } = await query.order('fecha_solicitud', { ascending: false });
    if (error) {
      console.warn('[Supabase List Error]:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      assistanceId: row.assistance_id,
      requestId: row.assistance_id.replace('AST', 'REQ'),
      businessClientId: `${row.sponsor_id.toUpperCase()}_CL`,
      businessContractId: `BC-${row.sponsor_id.toUpperCase()}-001`,
      policy: row.numero_poliza,
      insuredId: 200001,
      assistanceType: row.tipo_servicio,
      businessServiceId: row.tipo_servicio,
      status: row.estado === 'SOLICITADA' ? 'L' : row.estado,
      statusDescription: row.estado,
      occurrenceDate: row.fecha_solicitud,
      requestDate: row.fecha_solicitud,
      address: row.lugar_atencion,
      origin: {
        latitude: Number(row.latitud) || -33.425,
        longitude: Number(row.longitud) || -70.612,
        place: row.lugar_atencion,
      },
      comment: row.comentario_asegurado,
      description: row.comentario_asegurado,
      attributes: [
        { businessAttributeCd: 'CODIGO_GARANTIA', value: row.codigo_garantia },
        { businessAttributeCd: 'PRODUCTO_AMA', value: row.codigo_producto_ama },
        { businessAttributeCd: 'MASCOTA_RIESGO_ID', value: row.riesgo_id },
      ],
    }));
  } catch (err) {
    console.error('[Supabase List Error]:', err);
    return [];
  }
}


