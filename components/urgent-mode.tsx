'use client';

import { useState, useEffect } from 'react';
import { Zap, Calculator, Clock, DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function UrgentMode() {
  const [isUrgent, setIsUrgent] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
      <div className="relative bg-gradient-to-br from-orange-600 to-red-600 border border-orange-500/50 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                Modo Urgente 🚨
              </h3>
              <p className="text-orange-100 text-sm">Respuesta en menos de 5 minutos</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-16 h-8 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-8 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Notificación prioritaria a maestros VIP</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Apareces primero en la lista</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Garantía de respuesta en 5 minutos</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
          <div className="text-white">
            <span className="text-sm opacity-80">Cargo adicional:</span>
            <div className="text-3xl font-black">+20%</div>
          </div>
          {isUrgent && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 animate-pulse">
              <Zap className="w-5 h-5" />
              ¡ACTIVADO!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BudgetCalculator() {
  const [category, setCategory] = useState('');
  const [hours, setHours] = useState(2);
  const [urgency, setUrgency] = useState(false);
  const [baseRates, setBaseRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAveragePrices() {
      try {
        const response = await fetch('/api/quotes/average');
        const data = await response.json();
        
        if (data.success) {
          setBaseRates(data.averagePrices);
        }
      } catch (error) {
        console.error('Error al cargar precios promedio:', error);
        // Fallback a precios por defecto
        setBaseRates({
          'Plomería': 25,
          'Electricidad': 30,
          'Albañilería': 20,
          'Pintura': 22,
          'Carpintería': 28,
          'Refrigeración': 35,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAveragePrices();
  }, []);

  const calculateBudget = () => {
    if (!category) return 0;
    const base = baseRates[category] || 25;
    const total = base * hours;
    return urgency ? total * 1.2 : total;
  };

  const estimate = calculateBudget();

  if (loading) {
    return (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-8 flex items-center justify-center h-[400px]">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">
              Calculadora de Presupuesto
            </h3>
            <p className="text-gray-400 text-sm">Precios promedio reales</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Categoría */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tipo de servicio
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Selecciona...</option>
              {Object.keys(baseRates).map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat} - ${baseRates[cat]}/hora
                </option>
              ))}
            </select>
          </div>

          {/* Horas */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Horas estimadas: {hours}h
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Urgencia */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold">Modo Urgente (+20%)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={urgency}
                onChange={(e) => setUrgency(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        {/* Resultado */}
        {estimate > 0 && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-center">
              <div className="text-white/80 text-sm font-semibold mb-2">
                Presupuesto Estimado
              </div>
              <div className="text-5xl font-black text-white mb-2">
                ${estimate.toFixed(2)}
              </div>
              <div className="flex items-center justify-center gap-2 text-green-100 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Basado en {Object.keys(baseRates).length} cotizaciones reales</span>
              </div>
              {category && (
                <div className="mt-3 pt-3 border-t border-white/20 text-white/80 text-xs">
                  Tarifa base: ${baseRates[category]}/hora × {hours}h
                  {urgency && ' + 20% urgente'}
                </div>
              )}
            </div>
          </div>
        )}

        {!estimate && (
          <div className="text-center py-8 text-gray-400">
            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecciona un servicio para calcular</p>
          </div>
        )}
      </div>
    </div>
  );
}