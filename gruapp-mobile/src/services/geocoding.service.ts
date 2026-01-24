import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export class GeocodingService {
  /**
   * Geocodificación inversa: Coordenadas → Dirección
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'GruApp/1.0',
        },
      });

      if (response.data && response.data.address) {
        return this.formatSimpleAddress(response.data.address);
      }

      return 'Dirección no disponible';
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return 'Error al obtener dirección';
    }
  }

  /**
   * Geocodificación: Dirección → Coordenadas con sugerencias
   */
  static async searchAddress(query: string): Promise<GeocodeResult[]> {
    try {
      if (query.length < 3) return [];

      const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'cl',
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'GruApp/1.0',
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error buscando dirección:', error);
      return [];
    }
  }

  /**
   * Formatear dirección simple: "Calle 123, Comuna"
   */
  static formatSimpleAddress(address: any): string {
    const parts = [];

    // Calle y número
    if (address.road) {
      if (address.house_number) {
        parts.push(`${address.road} ${address.house_number}`);
      } else {
        parts.push(address.road);
      }
    }

    // Comuna/Ciudad
    const locality = address.suburb || address.city || address.town || address.village;
    if (locality) {
      parts.push(locality);
    }

    return parts.join(', ') || 'Dirección sin nombre';
  }

  /**
   * Formatear dirección de resultado de búsqueda
   */
  static formatAddress(result: GeocodeResult): string {
    return this.formatSimpleAddress(result.address);
  }
}