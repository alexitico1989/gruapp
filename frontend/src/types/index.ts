export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: 'CLIENTE' | 'GRUERO' | 'ADMIN';
  gruero?: {
    id: string;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    capacidadToneladas: number;
    verificado: boolean;
    status: 'DISPONIBLE' | 'OCUPADO' | 'OFFLINE';
    latitud?: number;
    longitud?: number;
    calificacionPromedio: number;
    totalServicios: number;
  };
  cliente?: {
    id: string;
  };
}

export interface Servicio {
  id: string;
  clienteId: string;
  grueroId?: string;
  origenLat: number;
  origenLng: number;
  origenDireccion: string;
  destinoLat: number;
  destinoLng: number;
  destinoDireccion: string;
  distanciaKm: number;
  tarifaBase: number;
  tarifaDistancia: number;
  subtotal: number;
  comisionPlataforma: number;
  comisionMP: number;
  totalCliente: number;
  totalGruero: number;
  status: 'SOLICITADO' | 'ACEPTADO' | 'EN_CAMINO' | 'EN_SITIO' | 'COMPLETADO' | 'CANCELADO';
  solicitadoAt: string;
  aceptadoAt?: string;
  enCaminoAt?: string;
  enSitioAt?: string;
  completadoAt?: string;
  canceladoAt?: string;
  observaciones?: string;
  motivoCancelacion?: string;
  mpPaymentId?: string;
  pagado: boolean;
  cliente?: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
  gruero?: {
    patente: string;
    marca: string;
    modelo: string;
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
  calificacion?: Calificacion;
}

export interface Calificacion {
  id: string;
  servicioId: string;
  clienteId: string;
  grueroId: string;
  puntuacionGruero: number;
  comentarioGruero?: string;
  puntuacionCliente: number;
  comentarioCliente?: string;
  createdAt: string;
}

export interface GrueroDisponible {
  id: string;
  userId: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadToneladas: number;
  latitud: number;
  longitud: number;
  status: string;
  verificado: boolean;
  calificacionPromedio: number;
  totalServicios: number;
  distanciaKm: number;
  user: {
    nombre: string;
    apellido: string;
    telefono: string;
  };
}

export interface RouteData {
  distanciaKm: number;
  duracionMinutos: number;
  geometry: {
    coordinates: [number, number][];
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterClienteData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rut?: string;
}

export interface RegisterGrueroData extends RegisterClienteData {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadToneladas: number;
}

export interface CreateServicioData {
  clienteId: string;
  origenLat: number;
  origenLng: number;
  origenDireccion: string;
  destinoLat: number;
  destinoLng: number;
  destinoDireccion: string;
  observaciones?: string;
}