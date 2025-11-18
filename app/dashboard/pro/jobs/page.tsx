'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, User, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: number;
  status: string;
  amountCents: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  customer: {
    id: number;
    name: string;
    photo: string | null;
    phone: string;
  };
  request: {
    id: number;
    categoryName: string;
    description: string;
    urgentMode: boolean;
  };
}

const statusConfig = {
  all: { label: 'Todos', color: 'from-gray-500 to-gray-600', icon: Briefcase },
  pending: { label: 'Pendiente', color: 'from-yellow-500 to-orange-500', icon: Clock },
  in_progress: { label: 'En Progreso', color: 'from-blue-500 to-cyan-500', icon: Clock },
  done: { label: 'Completado', color: 'from-green-500 to-emerald-500', icon: CheckCircle2 },
  disputed: { label: 'En Disputa', color: 'from-red-500 to-pink-500', icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'from-gray-500 to-gray-700', icon: XCircle }
};

export default function ProJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, [selectedStatus, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/pros/jobs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error al cargar trabajos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              📋 Mis Trabajos
            </h1>
            <p className="text-gray-400">Gestiona todos tus trabajos activos y completados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, categoría, descripción o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = selectedStatus === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all
                  ${isActive 
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-105` 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de trabajos */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Cargando trabajos...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-20 h-20 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg">No se encontraron trabajos</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const statusInfo = statusConfig[job.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              return (
                <Link key={job.id} href={`/dashboard/job/${job.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-all"></div>
                    <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Info principal */}
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur"></div>
                              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10">
                                {job.customer.photo ? (
                                  <img src={job.customer.photo} alt={job.customer.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Cliente y categoría */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white">{job.customer.name}</h3>
                              <p className="text-cyan-400 font-medium">{job.request.categoryName}</p>
                              {job.request.urgentMode && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/30">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgente
                                </span>
                              )}
                            </div>

                            {/* Estado */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${statusInfo.color} text-white text-sm font-medium`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </div>
                          </div>

                          {/* Descripción */}
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {job.request.description}
                          </p>

                          {/* Meta info */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(job.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              ID: #{job.id}
                            </div>
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="flex items-center justify-center md:justify-end">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur"></div>
                            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl px-6 py-4 text-center">
                              <div className="flex items-center gap-2 text-green-400 font-bold text-2xl">
                                <DollarSign className="w-6 h-6" />
                                {formatPrice(job.amountCents || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Total */}
      {!loading && jobs.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 text-center text-gray-500">
          Mostrando {jobs.length} trabajo{jobs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}