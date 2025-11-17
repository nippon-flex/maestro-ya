/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return distance;
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Encuentra el punto central entre múltiples ubicaciones
 * @param locations Array de objetos con lat y lng
 * @returns Objeto con lat y lng del centro
 */
export function getCenterPoint(
  locations: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (locations.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (locations.length === 1) {
    return locations[0];
  }

  let x = 0;
  let y = 0;
  let z = 0;

  for (const location of locations) {
    const latitude = toRadians(location.lat);
    const longitude = toRadians(location.lng);

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  }

  const total = locations.length;

  x = x / total;
  y = y / total;
  z = z / total;

  const centralLongitude = Math.atan2(y, x);
  const centralSquareRoot = Math.sqrt(x * x + y * y);
  const centralLatitude = Math.atan2(z, centralSquareRoot);

  return {
    lat: toDegrees(centralLatitude),
    lng: toDegrees(centralLongitude),
  };
}

/**
 * Convierte radianes a grados
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Valida si las coordenadas son válidas
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Formatea la distancia para mostrar
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Verifica si un punto está dentro de un radio
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}