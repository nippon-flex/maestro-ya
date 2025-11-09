import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { serviceRequests, customers, users, serviceCategories, addresses } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Clock, CheckCircle2, FileText, 
  ArrowRight, Zap, TrendingUp, Star,
  MapPin, Calendar, Users, Heart, Crown, Gift
} from 'lucide-react';
import { NearbyProsMap } from '@/components/maps/nearby-pros-map';
import { CustomerStats } from '@/components/customer-stats';
import { UrgentMode, BudgetCalculator } from '@/components/urgent-mode';

export default async function CustomerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user) redirect('/onboarding');

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, user.id))
    .limit(1);

  if (!customer) redirect('/onboarding');

  const requestsData = await db
    .select({
      id: serviceRequests.id,
      description: serviceRequests.description,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      category: serviceCategories.name,
      addressStreet: addresses.street,
    })
    .from(serviceRequests)
    .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
    .leftJoin(addresses, eq(serviceRequests.addressId, addresses.id))
    .where(eq(serviceRequests.customerId, customer.id));

  const totalRequests = requestsData.length;
  const openRequests = requestsData.filter(r => r.status === 'open').length;
  const completedRequests = requestsData.filter(r => r.status === 'awarded').length;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-cyan-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  ¡Hola, {customer.fullName || 'Cliente'}! 👋
                </h1>
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">VIP</span>
                </div>
              </div>
              <p className="text-cyan-200 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                Todo listo para tu próximo servicio
              </p>
            </div>
            
            <Link 
              href="/dashboard/customer/requests/new"
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
              <div className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white font-black text-lg rounded-full shadow-2xl hover:scale-105 transition-all">
                <Plus className="w-6 h-6" />
                Nueva Solicitud
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-6 hover:border-cyan-500/60 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  Total
                </div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {totalRequests}
              </div>
              <div className="text-gray-400 font-semibold text-lg">
                Solicitudes creadas
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-6 hover:border-purple-500/60 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Live
                </div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {openRequests}
              </div>
              <div className="text-gray-400 font-semibold text-lg">
                Esperando cotizaciones
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-3xl p-6 hover:border-green-500/60 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {completedRequests}
              </div>
              <div className="text-gray-400 font-semibold text-lg">
                Trabajos asignados
              </div>
            </div>
          </div>
        </div>

        {/* Modo Urgente y Calculadora */}
        <div className="grid md:grid-cols-2 gap-6">
          <UrgentMode />
          <BudgetCalculator />
        </div>

        {/* Mapa de Maestros Cercanos */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Maestros cerca de ti</h2>
                  <p className="text-gray-400">Disponibles ahora • Quito, Ecuador</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <span className="text-green-400 font-bold text-sm">12 Online</span>
              </div>
            </div>
            <NearbyProsMap />
          </div>
        </div>

        {/* Estadísticas Avanzadas */}
        <CustomerStats />

        {/* Mis Solicitudes */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <FileText className="w-7 h-7 text-purple-500" />
                Mis Solicitudes
              </h2>
              {totalRequests > 0 && (
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <span className="text-gray-400 text-sm font-semibold">
                    {totalRequests} {totalRequests === 1 ? 'solicitud' : 'solicitudes'}
                  </span>
                </div>
              )}
            </div>

            {totalRequests === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <Plus className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  No tienes solicitudes aún
                </h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  Crea tu primera solicitud y recibe cotizaciones de maestros verificados en minutos
                </p>
                <Link 
                  href="/dashboard/customer/requests/new"
                  className="group inline-block relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition"></div>
                  <div className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-lg rounded-full shadow-2xl hover:scale-105 transition-all">
                    <Plus className="w-6 h-6" />
                    Crear Primera Solicitud
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requestsData.map((request) => (
                  <div 
                    key={request.id}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-black text-white mb-2">
                                {request.category || 'Sin categoría'}
                              </h3>
                              <p className="text-gray-400 line-clamp-2 leading-relaxed">
                                {request.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <span>{request.addressStreet?.substring(0, 40) || 'Sin dirección'}...</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span>{new Date(request.createdAt).toLocaleDateString('es-EC')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg ${
                              request.status === 'open'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : request.status === 'awarded'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            {request.status === 'open' && <Clock className="w-4 h-4 animate-pulse" />}
                            {request.status === 'awarded' && <CheckCircle2 className="w-4 h-4" />}
                            {request.status === 'open' ? 'Abierta' : request.status === 'awarded' ? 'Asignada' : request.status}
                          </span>

                          <Link
                            href={`/dashboard/customer/requests/${request.id}`}
                            className="group/btn relative"
                          >
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover/btn:opacity-100 transition"></div>
                            <div className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all">
                              Ver Detalles
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips y Beneficios */}
        {totalRequests > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-2 text-lg">💡 Tip Pro:</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Sube fotos claras de tu problema. Los maestros podrán darte un precio más exacto.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-2 text-lg">🎁 Beneficio VIP:</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Completa 5 trabajos y obtén 15% de descuento en el próximo servicio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}