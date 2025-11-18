import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { pros, users, warrantyClaims, jobs, serviceRequests } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Users, Briefcase, AlertCircle, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Verificar que es admin
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user || user.role !== 'admin') {
    redirect('/dashboard/customer');
  }

  // Estadísticas
  const [
    totalPros,
    pendingPros,
    approvedPros,
    totalJobs,
    totalClaims,
    openClaims,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(pros),
    db.select({ count: sql<number>`count(*)::int` }).from(pros).where(eq(pros.approvalStatus, 'pending')),
    db.select({ count: sql<number>`count(*)::int` }).from(pros).where(eq(pros.approvalStatus, 'approved')),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db.select({ count: sql<number>`count(*)::int` }).from(warrantyClaims),
    db.select({ count: sql<number>`count(*)::int` }).from(warrantyClaims).where(eq(warrantyClaims.status, 'open')),
  ]);

  const stats = {
    totalPros: totalPros[0]?.count || 0,
    pendingPros: pendingPros[0]?.count || 0,
    approvedPros: approvedPros[0]?.count || 0,
    totalJobs: totalJobs[0]?.count || 0,
    totalClaims: totalClaims[0]?.count || 0,
    openClaims: openClaims[0]?.count || 0,
  };

  // Maestros pendientes
  const pendingProsList = await db.query.pros.findMany({
    where: eq(pros.approvalStatus, 'pending'),
    with: {
      user: true,
    },
    limit: 5,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            👑 Panel de Administración
          </h1>
          <p className="text-gray-400 text-lg">Bienvenido de vuelta, {user.email}</p>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          
          {/* Total Maestros */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <Users className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalPros}</div>
              <div className="text-sm text-gray-400">Maestros</div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <Clock className="w-8 h-8 text-orange-400 mb-2" />
              <div className="text-2xl font-bold text-orange-400">{stats.pendingPros}</div>
              <div className="text-sm text-gray-400">Pendientes</div>
            </div>
          </div>

          {/* Aprobados */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-green-400">{stats.approvedPros}</div>
              <div className="text-sm text-gray-400">Aprobados</div>
            </div>
          </div>

          {/* Total Trabajos */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <Briefcase className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
              <div className="text-sm text-gray-400">Trabajos</div>
            </div>
          </div>

          {/* Total Reclamos */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <AlertCircle className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalClaims}</div>
              <div className="text-sm text-gray-400">Reclamos</div>
            </div>
          </div>

          {/* Reclamos Abiertos */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <XCircle className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-red-400">{stats.openClaims}</div>
              <div className="text-sm text-gray-400">Sin Revisar</div>
            </div>
          </div>

        </div>

        {/* Acciones Rápidas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Gestionar Maestros */}
          <Link href="/dashboard/admin" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Aprobar Maestros</h3>
                    <p className="text-gray-400">Revisa solicitudes pendientes</p>
                  </div>
                </div>
                {stats.pendingPros > 0 && (
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{stats.pendingPros}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Gestionar Garantías */}
          <Link href="/dashboard/admin/warranty-claims" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Reclamos de Garantía</h3>
                    <p className="text-gray-400">Gestiona disputas y problemas</p>
                  </div>
                </div>
                {stats.openClaims > 0 && (
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{stats.openClaims}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

        </div>

        {/* Maestros Pendientes de Aprobación */}
        {pendingProsList.length > 0 && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">⏳ Maestros Pendientes</h2>
                <Link 
                  href="/dashboard/admin"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>

              <div className="space-y-4">
                {pendingProsList.map((pro) => (
                  <div 
                    key={pro.id}
                    className="bg-black/30 border border-white/5 rounded-2xl p-6 hover:bg-black/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {pro.fullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{pro.fullName}</h3>
                            <p className="text-sm text-gray-400">{pro.user.email}</p>
                          </div>
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
                            Pendiente
                          </span>
                        </div>

                        <div className="text-sm text-gray-300 space-y-1 ml-15">
                          <div>⚡ {pro.experienceYears} años de experiencia</div>
                          {pro.bio && <div className="text-gray-400">💬 "{pro.bio}"</div>}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/admin/review/${pro.id}`}
                        className="ml-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all"
                      >
                        Revisar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}