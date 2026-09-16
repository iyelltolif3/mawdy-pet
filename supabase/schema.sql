-- ==============================================================================
-- MAWDY PET · SCHEMA RELACIONAL SUPABASE / POSTGRESQL MULTI-TENANT
-- Project Ref: znmzmgymigwidlttvqel
-- Modelo de Colectivos B2B2C, Coberturas AMA y Cartera de Mascotas
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: TENANTS / SPONSORS CORPORATIVOS
CREATE TABLE IF NOT EXISTS tenants (
  sponsor_id TEXT PRIMARY KEY,
  subdominio TEXT UNIQUE NOT NULL,
  nombre_visible TEXT NOT NULL,
  country_id TEXT NOT NULL DEFAULT 'CL',
  modo TEXT NOT NULL DEFAULT 'mock' CHECK (modo IN ('mock', 'real', 'preproductivo', 'productivo')),
  activo BOOLEAN NOT NULL DEFAULT true,
  last_modified_by TEXT NOT NULL DEFAULT 'admin-mawdy',
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Identidad visual & PWA
  logo_url TEXT NOT NULL DEFAULT '/logos/mawdy-official.png',
  banner_url TEXT DEFAULT NULL,
  fuente TEXT NOT NULL DEFAULT 'DM Sans',
  color_primary TEXT NOT NULL DEFAULT '#d81e05',
  color_secondary TEXT NOT NULL DEFAULT '#2d373d',
  color_accent TEXT NOT NULL DEFAULT '#d81e05',
  color_background TEXT NOT NULL DEFAULT '#f5f6f7',
  color_surface TEXT NOT NULL DEFAULT '#ffffff',
  color_foreground TEXT NOT NULL DEFAULT '#2d373d',
  
  -- Ficha de Mascota & Carnet
  carnet_lema TEXT DEFAULT 'Carnet Digital de Mascota Asegurada',
  carnet_estilo TEXT DEFAULT 'linen',
  carnet_watermark BOOLEAN DEFAULT true,
  carnet_microchip BOOLEAN DEFAULT true,
  carnet_vacunas BOOLEAN DEFAULT true,
  carnet_alergias BOOLEAN DEFAULT true,
  carnet_veterinario BOOLEAN DEFAULT true,
  carnet_coberturas BOOLEAN DEFAULT true,
  carnet_mensaje_asistencia TEXT DEFAULT 'En caso de urgencia médica 24/7 o extravío de tu mascota, activa tu asistencia directa en este portal.',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: PRODUCTO AMA (Core de Asistencias Mawdy)
CREATE TABLE IF NOT EXISTS productos_ama (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id TEXT NOT NULL REFERENCES tenants(sponsor_id) ON DELETE CASCADE,
  codigo_producto_ama TEXT NOT NULL,
  nombre_producto TEXT NOT NULL,
  colectivo_poliza_marco TEXT,
  linea_asistencia TEXT DEFAULT 'Mascotas Domésticas',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sponsor_id, codigo_producto_ama)
);

-- 4. TABLA: SERVICIOS Y COBERTURAS AMA
CREATE TABLE IF NOT EXISTS servicios_cobertura (
  id TEXT PRIMARY KEY,
  producto_ama_id UUID NOT NULL REFERENCES productos_ama(id) ON DELETE CASCADE,
  codigo_servicio TEXT NOT NULL,
  codigo_garantia TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'Siren',
  limite_eventos TEXT DEFAULT '3 eventos al año',
  copago_o_tope TEXT DEFAULT '100% Sin Copago',
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: POLIZAS Y ASEGURADOS
CREATE TABLE IF NOT EXISTS polizas (
  numero_poliza TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL REFERENCES tenants(sponsor_id) ON DELETE CASCADE,
  business_contract_id TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  
  -- Datos del Titular
  titular_rut TEXT NOT NULL,
  titular_nombre TEXT NOT NULL,
  titular_apellido TEXT NOT NULL,
  titular_email TEXT NOT NULL,
  titular_telefono TEXT,
  titular_direccion TEXT,
  titular_comuna TEXT,
  titular_region TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: MASCOTAS ASEGURADAS (Carnet Digital)
CREATE TABLE IF NOT EXISTS mascotas (
  riesgo_id TEXT PRIMARY KEY,
  numero_poliza TEXT NOT NULL REFERENCES polizas(numero_poliza) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apodo TEXT,
  especie TEXT NOT NULL CHECK (especie IN ('perro', 'gato', 'otro')),
  raza TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad_estimada INT,
  sexo TEXT CHECK (sexo IN ('macho', 'hembra')),
  peso_kg NUMERIC(4,1),
  color_senas TEXT,
  microchip TEXT,
  foto_url TEXT,
  
  -- Ficha clínica de emergencia
  veterinario_cabecera TEXT,
  telefono_veterinario TEXT,
  alergias_notas TEXT,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLA: ASISTENCIAS Y DESPACHOS
CREATE TABLE IF NOT EXISTS asistencias (
  assistance_id TEXT PRIMARY KEY,
  numero_poliza TEXT NOT NULL REFERENCES polizas(numero_poliza) ON DELETE CASCADE,
  riesgo_id TEXT NOT NULL REFERENCES mascotas(riesgo_id) ON DELETE CASCADE,
  sponsor_id TEXT NOT NULL REFERENCES tenants(sponsor_id) ON DELETE CASCADE,
  
  tipo_servicio TEXT NOT NULL,
  codigo_garantia TEXT NOT NULL,
  codigo_producto_ama TEXT,
  
  estado TEXT NOT NULL DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA', 'COORDINANDO', 'EN_CAMINO', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'RESUELTA', 'EN_CURSO', 'L', 'C', 'F')),
  comentario_asegurado TEXT NOT NULL,
  lugar_atencion TEXT NOT NULL,
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  
  proveedor_asignado TEXT,
  telefono_proveedor TEXT,
  
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ
);

-- 8. ÍNDICES DE RENDIMIENTO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_tenants_subdominio ON tenants(subdominio);
CREATE INDEX IF NOT EXISTS idx_polizas_sponsor ON polizas(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mascotas_poliza ON mascotas(numero_poliza);
CREATE INDEX IF NOT EXISTS idx_asistencias_sponsor ON asistencias(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_mascota ON asistencias(riesgo_id);

-- 9. SEGURIDAD A NIVEL DE FILAS (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_ama ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_cobertura ENABLE ROW LEVEL SECURITY;
ALTER TABLE polizas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para datos del tenant (necesario para el front PWA)
CREATE POLICY "Lectura pública de tenants activos" ON tenants
  FOR SELECT USING (activo = true);

CREATE POLICY "Lectura pública de servicios activos" ON servicios_cobertura
  FOR SELECT USING (activo = true);
