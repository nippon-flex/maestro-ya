'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Award, Target, Star, 
  CheckCircle2, Clock, Zap, Loader2, Calendar, Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalEarnings: number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  avgRating: number;
  totalReviews: number;
  quotesCount: number;
  acceptanceRate: number;
  streak: number;
  isOnline: boolean;
}

interface EarningsData {
  month: string;
  earnings: number;
}

interface RecentJob {
  id: number;
  service: string;
  description: string;
  amount: number;
  status: string;
  date: Date;
}

export function ProStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [earningsChart, setEarningsChart] = useState<EarningsData[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/pros/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setEarningsChart(data.earningsChart);
          setRecentJobs(data.recentJobs);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ganancias Totales */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5 hover:border-green-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Total</span>
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1">
              ${stats.totalEarnings}
            </div>
            <div className="text-gray-400 text-sm">Ganancias totales</div>
          </div>
        </div>

        {/* Trabajos Completados */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 rounded-2xl p-5 hover:border-blue-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-blue-400 text-xs">
                <Target className="w-3 h-3" />
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {stats.completedJobs}
            </div>
            <div className="text-gray-400 text-sm">Trabajos completados</div>
          </div>
        </div>

        {/* Rating Promedio */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-5 hover:border-yellow-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <span>{stats.totalReviews} reviews</span>
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1 flex items-center gap-2">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-gray-400 text-sm">Rating promedio</div>
          </div>
        </div>

        {/* Tasa de Aceptación */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-xs">
                <span>{stats.quotesCount} cotizaciones</span>
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {stats.acceptanceRate}%
            </div>
            <div className="text-gray-400 text-sm">Tasa de aceptación</div>
          </div>
        </div>
      </div>

      {/* Racha */}
      {stats.streak > 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-orange-600 to-red-600 border border-orange-500/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">
                    ¡Racha de {stats.streak} trabajos! 🔥
                  </h3>
                  <p className="text-orange-100">
                    ¡Sigue así! Cada 10 trabajos ganas un bono del 5%
                  </p>
                </div>
              </div>
              <div className="text-6xl font-black text-white/20">
                {stats.streak}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica de Ganancias */}
      {earningsChart.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              Ganancias Mensuales
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`$${value}`, 'Ganancias']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trabajos Recientes */}
      {recentJobs.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              Trabajos Recientes
            </h3>

            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {job.service[0]}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{job.service}</h4>
                        <p className="text-gray-400 text-sm">{job.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-bold text-xl mb-1">
                        ${job.amount.toFixed(2)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          job.status === 'done'
                            ? 'bg-green-500/20 text-green-400'
                            : job.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {job.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                        {job.status === 'in_progress' && <Clock className="w-3 h-3 animate-pulse" />}
                        {job.status === 'pending' && <Zap className="w-3 h-3" />}
                        {job.status === 'done' ? 'Completado' : job.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(job.date).toLocaleDateString('es-EC', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {recentJobs.length === 0 && stats.totalJobs === 0 && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aún no tienes trabajos</h3>
            <p className="text-gray-400">
              Activa el modo online y empieza a enviar cotizaciones para ganar dinero
            </p>
          </div>
        </div>
      )}
    </div>
  );
}