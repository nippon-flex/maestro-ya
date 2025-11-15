'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, Send } from 'lucide-react';

interface ReviewFormProps {
  jobId: string;
  proName: string;
}

export default function ReviewForm({ jobId, proName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, rating, comment }),
      });

      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar reseña');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar reseña');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-white fill-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          ¡Gracias por tu reseña!
        </h3>
        <p className="text-gray-400">
          Tu calificación ayuda a mejorar el servicio
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white font-bold mb-3">
          ¿Cómo calificarías a {proName}?
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-cyan-400 text-sm mt-2">
            {rating === 1 && '⭐ Malo'}
            {rating === 2 && '⭐⭐ Regular'}
            {rating === 3 && '⭐⭐⭐ Bueno'}
            {rating === 4 && '⭐⭐⭐⭐ Muy Bueno'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-white font-bold mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia..."
          className="w-full bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-500 p-4 focus:outline-none focus:border-cyan-500 resize-none"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 caracteres
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enviar Reseña
          </>
        )}
      </button>
    </form>
  );
}