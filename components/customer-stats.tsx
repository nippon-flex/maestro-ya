'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Clock, Star, 
  Calendar, Zap, Award, Target, Loader2
} from 'lucide-react';

interface Stats {
  totalSpent: number;
  totalJobs: number;
  completedJobs: number;
  avgRating: number;
  savedMoney: number;
  responseTime: number;
  completionRate: number;
}

interface Activity {
  date: Date;
  service: string;
  amount: number;
  maestro: string;
  rating: number;
}

export function CustomerStats() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/customer/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Tu Actividad</h2>
        <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Gastado */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:border-green-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>+{stats.completionRate}%</span>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              ${stats.totalSpent}
            </div>
            <div className="text-gray-400 text-sm">Total invertido</div>
          </div>
        </div>

        {/* Trabajos Completados */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 rounded-2xl p-5 hover:border-blue-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-blue-400 text-xs">
                <Award className="w-3 h-3" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stats.totalJobs}
            </div>
            <div className="text-gray-400 text-sm">Trabajos hechos</div>
          </div>
        </div>

        {/* Tiempo Promedio */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-xs">
                <Zap className="w-3 h-3" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stats.responseTime}min
            </div>
            <div className="text-gray-400 text-sm">Tiempo respuesta</div>
          </div>
        </div>

        {/* Ahorro */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:border-yellow-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                ¡WOW!
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              ${stats.savedMoney}
            </div>
            <div className="text-gray-400 text-sm">Ahorro estimado</div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      {recentActivity.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              Actividad Reciente
            </h3>

            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-purple-500/50 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {activity.service[0]}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{activity.service}</h4>
                        <p className="text-gray-400 text-sm">{activity.maestro}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-bold text-lg mb-1">
                        ${activity.amount.toFixed(2)}
                      </div>
                      {activity.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {[...Array(activity.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {new Date(activity.date).toLocaleDateString('es-EC')}
                    </span>
                    <button className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver detalles
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {recentActivity.length === 0 && stats.totalJobs === 0 && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aún no tienes trabajos</h3>
            <p className="text-gray-400">
              Crea tu primera solicitud y comienza a disfrutar de nuestros servicios
            </p>
          </div>
        </div>
      )}
    </div>
  );
}