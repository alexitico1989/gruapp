import axios from 'axios';
import { config } from '../config';
import { RouteResponse } from '../types';

export class RoutingService {
  /**
   * Calcula la ruta real entre dos puntos usando OSRM
   * @param origenLat - Latitud origen
   * @param origenLng - Longitud origen
   * @param destinoLat - Latitud destino
   * @param destinoLng - Longitud destino
   * @returns Información de la ruta (distancia, duración, geometría)
   */
  static async calculateRoute(
    origenLat: number,
    origenLng: number,
    destinoLat: number,
    destinoLng: number
  ): Promise<RouteResponse> {
    try {
      // OSRM usa formato: lng,lat (al revés de lo normal)
      const url = `${config.osrmServer}/route/v1/driving/${origenLng},${origenLat};${destinoLng},${destinoLat}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: false,
        },
      });
      
      if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('No se pudo calcular la ruta');
      }
      
      const route = response.data.routes[0];
      
      return {
        distance: route.distance, // en metros
        duration: route.duration, // en segundos
        geometry: {
          coordinates: route.geometry.coordinates, // array de [lng, lat]
        },
      };
    } catch (error) {
      console.error('Error calculando ruta con OSRM:', error);
      
      // Fallback: calcular distancia en línea recta (Haversine)
      const distanceMeters = this.calculateHaversineDistance(
        origenLat,
        origenLng,
        destinoLat,
        destinoLng
      );
      
      return {
        distance: distanceMeters,
        duration: (distanceMeters / 1000) * 120, // estimación: 30 km/h promedio
        geometry: {
          coordinates: [
            [origenLng, origenLat],
            [destinoLng, destinoLat],
          ],
        },
      };
    }
  }
  
  /**
   * Calcula distancia en línea recta usando fórmula de Haversine
   * @returns Distancia en metros
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distancia en metros
  }
  
  /**
   * Convierte metros a kilómetros con 2 decimales
   */
  static metersToKm(meters: number): number {
    return Math.round((meters / 1000) * 100) / 100;
  }
  
  /**
   * Convierte segundos a minutos
   */
  static secondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
  }
}