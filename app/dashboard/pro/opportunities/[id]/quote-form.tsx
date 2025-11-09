'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';

interface QuoteFormProps {
  requestId: number;
  proId: number;
}

export function QuoteForm({ requestId, proId }: QuoteFormProps) {
  const [price, setPrice] = useState('');
  const [hours, setHours] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price) {
      alert('Por favor ingresa un precio');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  requestId,
  proId,
  amountCents: Math.round(parseFloat(price) * 100), // Convertir a centavos
  estimatedHours: hours ? parseInt(hours) : null,
  message: message || null,
}),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Cotización enviada exitosamente!');
        router.push('/dashboard/pro/opportunities');
        router.refresh();
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo enviar la cotización'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al enviar la cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Precio */}
      <div>
        <label className="flex items-center gap-2 text-white font-bold mb-3">
          <DollarSign className="w-5 h-5 text-green-400" />
          Precio (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">
            $
          </span>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50.00"
            required
            className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-4 py-4 text-white text-xl font-bold placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all"
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Incluye materiales si aplica
        </p>
      </div>

      {/* Horas estimadas */}
      <div>
        <label className="flex items-center gap-2 text-white font-bold mb-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          Tiempo estimado (opcional)
        </label>
        <div className="relative">
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="2"
            min="1"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-4 text-white text-xl font-bold placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
            horas
          </span>
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label className="flex items-center gap-2 text-white font-bold mb-3">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Mensaje al cliente (opcional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ej: Tengo 10 años de experiencia en este tipo de trabajos. Puedo empezar mañana mismo."
          rows={4}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all resize-none"
        />
        <p className="text-gray-500 text-xs mt-2">
          Un mensaje personalizado aumenta tus posibilidades
        </p>
      </div>

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
        <div className={`relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-lg rounded-xl shadow-lg transition-all ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
        }`}>
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Enviar Cotización
            </>
          )}
        </div>
      </button>
    </form>
  );
}