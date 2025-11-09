'use client';

import { useState, useEffect } from 'react';
import { Zap, ZapOff, Loader2, Users, DollarSign } from 'lucide-react';

export function ProOnlineToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleOnline = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pros/toggle-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      const data = await response.json();

      if (data.success) {
        setIsOnline(!isOnline);
      } else {
        alert('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className={`absolute -inset-1 ${isOnline ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse`}></div>
      
      <div className={`relative ${isOnline ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-gray-700 to-gray-800'} border ${isOnline ? 'border-green-500/50' : 'border-gray-600/50'} rounded-3xl p-8 shadow-2xl transition-all duration-500`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${isOnline ? 'bg-white' : 'bg-gray-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
              {isOnline ? (
                <Zap className="w-8 h-8 text-green-600 animate-pulse" />
              ) : (
                <ZapOff className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                {isOnline ? '🟢 Estás Online' : '⚫ Estás Offline'}
              </h3>
              <p className="text-white/80 text-sm">
                {isOnline ? 'Visible para clientes' : 'No apareces en búsquedas'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleOnline}
            disabled={loading}
            className={`relative inline-flex items-center cursor-pointer ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <div className={`w-20 h-10 ${isOnline ? 'bg-green-800' : 'bg-gray-600'} rounded-full transition-colors`}>
                <div className={`w-8 h-8 bg-white rounded-full shadow-lg transform transition-transform duration-300 mt-1 ${isOnline ? 'translate-x-11' : 'translate-x-1'}`}></div>
              </div>
            )}
          </button>
        </div>

        {isOnline ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Recibirás notificaciones de nuevas solicitudes</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">Apareces en el mapa de maestros cercanos</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Prioridad en solicitudes urgentes</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-white/90 text-sm">
              Activa el modo online para empezar a recibir solicitudes de clientes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}