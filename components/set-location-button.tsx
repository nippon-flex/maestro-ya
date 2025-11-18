'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SetLocationButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSetLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch('/api/pros/update-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al guardar ubicación');
          }

          // Refrescar la página para mostrar el mapa
          router.refresh();
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Establecer Ubicación
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Necesitas establecer tu ubicación para aparecer en las búsquedas de clientes cercanos
              </p>
              <button
                onClick={handleSetLocation}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    Usar Mi Ubicación Actual
                  </>
                )}
              </button>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}