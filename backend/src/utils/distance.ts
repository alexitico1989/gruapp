/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilómetros
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distancia = R * c;
  
  return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filtra grueros por distancia máxima
 */
export function filtrarGruerosPorDistancia(
  grueros: any[],
  origenLat: number,
  origenLng: number,
  radioMaximoKm: number = 10
) {
  return grueros
    .map(gruero => ({
      ...gruero,
      distancia: calcularDistancia(origenLat, origenLng, gruero.latitud, gruero.latitud)
    }))
    .filter(gruero => gruero.distancia <= radioMaximoKm)
    .sort((a, b) => a.distancia - b.distancia); // Ordenar por más cercano primero
}