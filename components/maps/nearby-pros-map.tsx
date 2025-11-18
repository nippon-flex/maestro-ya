'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importar el mapa dinámicamente (solo en cliente)
const InteractiveMap = dynamic(() => import('./interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  ),
});

interface Category {
  id: number;
  name: string;
  iconName?: string | null;
}

interface Pro {
  id: number;
  userId: number;
  name: string;
  photoUrl: string | null;
  categories: Category[];
  rating?: number;
  reviewCount?: number;
  latitude: number;
  longitude: number;
  distance: number | string;
}

interface NearbyProsMapProps {
  userLatitude: number;
  userLongitude: number;
  radiusKm?: number;
}

export default function NearbyProsMap({
  userLatitude,
  userLongitude,
  radiusKm = 10,
}: NearbyProsMapProps) {
  const [pros, setPros] = useState<Pro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearbyPros() {
      try {
        const response = await fetch(
          `/api/pros/nearby?lat=${userLatitude}&lng=${userLongitude}&maxDistance=${radiusKm}`
        );

        if (!response.ok) {
          throw new Error('Error al cargar maestros cercanos');
        }

        const data = await response.json();
        setPros(data.pros || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyPros();
  }, [userLatitude, userLongitude, radiusKm]);

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">      
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-white/60">Buscando maestros cercanos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl"></div> 
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/20 rounded-3xl p-8">    
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mapa Interactivo */}
      <InteractiveMap
        userLocation={{ lat: userLatitude, lng: userLongitude }}
        pros={pros}
        radiusKm={radiusKm}
      />

      {/* Lista de maestros */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">      
          <h3 className="text-xl font-bold text-white mb-4">
            📍 {pros.length} {pros.length === 1 ? 'Maestro encontrado' : 'Maestros encontrados'}
          </h3>

          {pros.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 mb-2">No hay maestros disponibles en esta área</p>
              <p className="text-white/40 text-sm">Intenta ampliar el radio de búsqueda</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pros.map((pro) => {
                const initial = pro.name ? pro.name.charAt(0).toUpperCase() : 'M';

                return (
                  <a
                    key={pro.id}
                    href={`/maestro/${pro.userId}`}
                    className="group relative block"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-4 hover:border-green-500/30 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        {pro.photoUrl ? (
                          <img
                            src={pro.photoUrl}
                            alt={pro.name || 'Maestro'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {initial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {pro.name || 'Sin nombre'}
                          </p>
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <span>⭐</span>
                            <span>{Number(pro.rating || 0).toFixed(1)}</span>
                            <span className="text-white/40">({pro.reviewCount || 0})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {(pro.categories || []).slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">
                          📍 {Number(pro.distance || 0).toFixed(1)} km
                        </span>
                        <span className="text-cyan-400 group-hover:text-cyan-300 font-medium">
                          Ver perfil →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}