// src/types/index.ts

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: 'CLIENTE' | 'GRUERO';
}

export interface Servicio {
  id: string;
  origenLat: number;
  origenLng: number;
  origenDireccion: string;
  destinoLat: number;
  destinoLng: number;
  destinoDireccion: string;
  tipoVehiculo: string;
  distanciaKm: number;
  totalCliente: number;
  status: ServicioStatus;
  gruero?: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
    patente: string;
    marca: string;
    modelo: string;
  };
}

export type ServicioStatus = 
  | 'SOLICITADO' 
  | 'ACEPTADO' 
  | 'EN_CAMINO' 
  | 'EN_SITIO' 
  | 'COMPLETADO' 
  | 'CANCELADO';

export interface Gruero {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  tipoGrua: string;
  status: 'DISPONIBLE' | 'OCUPADO' | 'OFFLINE';
  latitud: number;
  longitud: number;
  calificacionPromedio: number;
  user: {
    nombre: string;
    apellido: string;
    telefono: string;
  };
}