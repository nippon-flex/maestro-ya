'use client';

import { useEffect, useState } from 'react';
import { MapPin, Star, Zap, Loader2 } from 'lucide-react';

interface Pro {
  id: number;
  name: string;
  email: string;
  category: string;
  distance: number;
  rating: number;
  isOnline: boolean;
  photoUrl?: string;
  lat: number;
  lng: number;
  experience: number;
}

export function NearbyProsMap() {
  const [pros, setPros] = useState<Pro[]>([]);
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearbyPros() {
      try {
        const response = await fetch('/api/pros/nearby');
        const data = await response.json();
        
        if (data.success) {
          setPros(data.pros);
        }
      } catch (error) {
        console.error('Error al cargar maestros:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyPros();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-purple-500/30 overflow-hidden h-[500px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Buscando maestros cerca de ti...</p>
          </div>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Mapa placeholder */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-purple-500/30 overflow-hidden h-[500px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
            <p className="text-white font-bold text-xl mb-2">
              {pros.length} Maestros cerca de ti
            </p>
            <p className="text-gray-400">Quito, Ecuador</p>
          </div>
        </div>

        {/* Pins reales */}
        {pros.slice(0, 6).map((pro, i) => (
          <div
            key={pro.id}
            className="absolute cursor-pointer hover:scale-125 transition-transform z-10"
            style={{
              left: `${20 + (i % 3) * 25}%`,
              top: `${25 + Math.floor(i / 3) * 30}%`,
            }}
            onClick={() => setSelectedPro(pro)}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pro.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} shadow-lg`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              {pro.isOnline && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-ping"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lista de maestros REALES */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {pros.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No hay maestros disponibles en este momento</p>
          </div>
        ) : (
          pros.map((pro) => (
            <div
              key={pro.id}
              onClick={() => setSelectedPro(pro)}
              className={`group relative cursor-pointer ${
                selectedPro?.id === pro.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4 hover:border-purple-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {pro.photoUrl ? (
                      <img 
                        src={pro.photoUrl} 
                        alt={pro.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {pro.name[0]}
                      </div>
                    )}
                    {pro.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                          {pro.name}
                          {pro.isOnline && (
                            <span className="text-green-400 text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Online
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-400 text-sm">{pro.category}</p>
                        <p className="text-gray-500 text-xs">{pro.experience} años exp.</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">{pro.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{pro.distance} km de ti</span>
                      </div>
                      <button className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold rounded-full hover:scale-105 transition-transform">
                        Contactar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}