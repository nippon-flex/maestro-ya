'use client';

import { useState } from 'react';
import { MapPin, Loader2, Check } from 'lucide-react';

interface ProLocationSetterProps {
  currentLat?: string | null;
  currentLng?: string | null;
}

export function ProLocationSetter({ currentLat, currentLng }: ProLocationSetterProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const hasLocation = currentLat && currentLng;

  const handleSetLocation = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    // Obtener ubicación actual
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch('/api/pros/update-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar ubicación');
          }

          setSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        } catch (err: any) {
          setError(err.message || 'Error al actualizar ubicación');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Verifica los permisos.');
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
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              {hasLocation ? 'Ubicación Establecida' : 'Establecer Ubicación'}
            </h3>
            
            {hasLocation ? (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  Lat: {Number(currentLat).toFixed(6)}, Lng: {Number(currentLng).toFixed(6)}
                </p>
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Los clientes pueden verte en el mapa
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4">
                Necesitas establecer tu ubicación para aparecer en las búsquedas de clientes cercanos
              </p>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Ubicación actualizada correctamente
                </p>
              </div>
            )}

            <button
              onClick={handleSetLocation}
              disabled={loading}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  {hasLocation ? 'Actualizar Ubicación' : 'Usar Mi Ubicación Actual'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}