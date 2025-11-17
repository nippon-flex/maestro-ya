'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Pro {
  id: number;
  userId: number;
  fullName: string;
  photoUrl: string | null;
  categories: string[];
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  distance: number | string;
}

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number };
  pros: Pro[];
  radiusKm?: number;
}

export default function InteractiveMap({ userLocation, pros, radiusKm = 10 }: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  // Solo renderizar en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl flex items-center justify-center">
        <div className="text-white/60">Cargando mapa...</div>
      </div>
    );
  }

  // Icono personalizado para el usuario
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Icono personalizado para maestros
  const proIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '400px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Círculo de radio */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              fillColor: '#06b6d4',
              fillOpacity: 0.1,
              color: '#06b6d4',
              weight: 2,
              opacity: 0.5
            }}
          />

          {/* Marcador del usuario */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-bold text-cyan-400">📍 Tu ubicación</p>
                <p className="text-sm text-white/80">Radio: {radiusKm} km</p>
              </div>
            </Popup>
          </Marker>

          {/* Marcadores de maestros */}
{pros.filter(pro => pro.latitude && pro.longitude).map((pro) => {
            const name = pro.fullName || 'Sin nombre';
            const initial = name.charAt(0).toUpperCase();
            const distance = Number(pro.distance || 0);
            const rating = Number(pro.rating || 0);
            const categories = pro.categories || [];

            return (
              <Marker
                key={pro.id}
                position={[pro.latitude, pro.longitude]}
                icon={proIcon}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-start gap-3 mb-2">
                      {pro.photoUrl ? (
                        <img
                          src={pro.photoUrl}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {initial}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-white">{name}</p>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <span>⭐</span>
                          <span>{rating.toFixed(1)}</span>
                          <span className="text-white/60">({pro.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {categories.slice(0, 2).map((cat, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-white/60">
                      📍 {distance.toFixed(1)} km de distancia
                    </p>

                    <a
                      href={`/maestro/${pro.userId}`}
                      className="mt-2 block w-full text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Ver Perfil
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}