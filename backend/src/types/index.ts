// DTOs para Autenticación
export interface RegisterClienteDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  rut?: string;
}

export interface RegisterGrueroDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  rut: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoGrua?: string;
  capacidadToneladas: number;
  tiposVehiculosAtiende?: string | string[];
  // ✅ NUEVO: Datos bancarios
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  nombreTitular?: string;
  rutTitular?: string;
  emailTransferencia?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// DTOs para Servicios
export interface CreateServicioDTO {
  origenLat: number;
  origenLng: number;
  origenDireccion: string;
  destinoLat: number;
  destinoLng: number;
  destinoDireccion: string;
  tipoVehiculo?: string;
  observaciones?: string;
}

export interface UpdateServicioStatusDTO {
  status: 'ACEPTADO' | 'EN_CAMINO' | 'EN_SITIO' | 'COMPLETADO' | 'CANCELADO';
}

export interface CancelarServicioDTO {
  motivoCancelacion?: string;
}

// DTOs para Calificaciones
export interface CalificarServicioDTO {
  servicioId: string;
  puntuacionGruero: number;
  comentarioGruero?: string;
  puntuacionCliente: number;
  comentarioCliente?: string;
}

export interface CreateCalificacionDTO {
  servicioId: string;
  puntuacion: number;
  comentario?: string;
}

// DTOs para Gruero
export interface UpdateGrueroLocationDTO {
  latitud: number;
  longitud: number;
  status: 'DISPONIBLE' | 'OCUPADO' | 'OFFLINE';
}

export interface UpdateGrueroDisponibilidadDTO {
  status: 'DISPONIBLE' | 'OFFLINE';
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'CLIENTE' | 'GRUERO' | 'ADMIN';
}

// User Role
export type UserRole = 'CLIENTE' | 'GRUERO' | 'ADMIN';

// Route Response (para routing.ts)
export interface RouteResponse {
  distance: number;
  duration: number;
  polyline?: string;
  geometry: any;
}

// Pricing Calculation (para pricing.ts)
export interface PricingCalculation {
  distanciaKm: number;
  tarifaBase: number;
  tarifaDistancia: number;
  subtotal: number;
  comisionPlataforma: number;
  comisionMP: number;
  totalCliente: number;
  totalGruero: number;
}