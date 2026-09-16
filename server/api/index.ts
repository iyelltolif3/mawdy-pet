export type { ICarteraClient, IAsistenciasClient } from './interfaces';
export type {
  Poliza,
  Asistencia,
  Asegurado,
  Mascota,
  BuscarAseguradosCriterio,
  ListarAsistenciasFiltros,
  CrearAsistenciaPayload,
} from './interfaces';
export { MockCarteraClient } from './mock-cartera';
export { MockAsistenciasClient } from './mock-asistencias';
export { RealCarteraClient } from './real-cartera';
export { RealAsistenciasClient } from './real-asistencias';
export { createApiClients } from './factory';
export type { ApiClients } from './factory';
