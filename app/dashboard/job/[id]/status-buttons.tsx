'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, CheckCircle2, Loader2 } from 'lucide-react';

interface StatusButtonsProps {
  jobId: string;
  currentStatus: string;
  isPro: boolean;
}

export default function StatusButtons({ jobId, currentStatus, isPro }: StatusButtonsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar botones si es el maestro
  if (!isPro) return null;

  return (
    <div className="space-y-3">
      {/* Botón Iniciar Trabajo */}
      {currentStatus === 'pending' && (
        <button
          onClick={() => updateStatus('in_progress')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Play className="w-5 h-5" />
              Iniciar Trabajo
            </>
          )}
        </button>
      )}

      {/* Botón Completar Trabajo */}
      {currentStatus === 'in_progress' && (
        <button
          onClick={() => updateStatus('done')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Marcar como Completado
            </>
          )}
        </button>
      )}

      {/* Mensaje si ya está completado */}
      {currentStatus === 'done' && (
        <div className="w-full px-6 py-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 text-green-400 font-bold rounded-xl text-center">
          <CheckCircle2 className="w-5 h-5 inline mr-2" />
          Trabajo Completado
        </div>
      )}
    </div>
  );
}