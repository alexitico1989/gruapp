import axios from 'axios';
import polyline from '@mapbox/polyline';

export interface RouteResult {
  coordinates: { latitude: number; longitude: number }[];
  distance: number; // en kilómetros
  duration: number; // en minutos
}

export class RoutingService {
  /**
   * Obtener ruta entre dos puntos usando OSRM (OpenStreetMap Routing Machine)
   * Completamente gratuito, sin API key necesaria
   */
  static async getRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<RouteResult | null> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'polyline',
        },
      });

      if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
        console.error('No se encontró ruta');
        return null;
      }

      const route = response.data.routes[0];
      
      // Decodificar polyline a coordenadas
      const coordinates = polyline
        .decode(route.geometry)
        .map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));

      return {
        coordinates,
        distance: route.distance / 1000, // convertir a km
        duration: route.duration / 60, // convertir a minutos
      };
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      return null;
    }
  }
}