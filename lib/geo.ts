import { latLngToCell, cellToBoundary, gridDisk } from 'h3-js';

// Resolución 8 de H3 = ~0.46 km² por hexágono (bueno para matching local)
const H3_RESOLUTION = 8;

export function getH3Index(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RESOLUTION);
}

export function getH3Neighbors(h3Index: string, radius: number = 1): string[] {
  return gridDisk(h3Index, radius);
}

export function h3ToGeoJSON(h3Index: string) {
  const boundary = cellToBoundary(h3Index);
  return {
    type: 'Polygon',
    coordinates: [boundary.map(([lat, lng]) => [lng, lat])],
  };
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Fórmula de Haversine (distancia en km)
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}