'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AcceptQuoteButton({ quoteId }: { quoteId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!confirm('¿Estás seguro de aceptar esta cotización?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/quotes/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Cotización aceptada. Redirigiendo al trabajo...');
        router.push(`/dashboard/job/${data.jobId}`);
        router.refresh();
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo aceptar la cotización'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al aceptar la cotización');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className={`${
        loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      } text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
    >
      {loading ? 'Procesando...' : 'Aceptar Cotización'}
    </button>
  );
}