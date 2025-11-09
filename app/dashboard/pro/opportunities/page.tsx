import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  serviceRequests, pros, users, requestTargets, 
  serviceCategories, addresses, quotes 
} from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, Calendar, Zap, ArrowRight, 
  Sparkles, Target, Clock, DollarSign, Filter
} from 'lucide-react';

export default async function OpportunitiesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user) redirect('/onboarding');

  const [pro] = await db
    .select()
    .from(pros)
    .where(eq(pros.userId, user.id))
    .limit(1);

  if (!pro) redirect('/onboarding');

  // Obtener solicitudes disponibles
  const opportunities = await db
    .select({
      requestId: serviceRequests.id,
      description: serviceRequests.description,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      categoryName: serviceCategories.name,
      addressStreet: addresses.street,
      addressCity: addresses.city,
      targetStatus: requestTargets.status,
    })
    .from(requestTargets)
    .leftJoin(serviceRequests, eq(requestTargets.requestId, serviceRequests.id))
    .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
    .leftJoin(addresses, eq(serviceRequests.addressId, addresses.id))
    .where(
      and(
        eq(requestTargets.proId, pro.id),
        eq(serviceRequests.status, 'open')
      )
    );

  // Obtener cotizaciones ya enviadas
  const sentQuotes = await db
    .select({ requestId: quotes.requestId })
    .from(quotes)
    .where(eq(quotes.proId, pro.id));

  const quotedRequestIds = new Set(sentQuotes.map(q => q.requestId));

  // Filtrar oportunidades sin cotizar
  const availableOpportunities = opportunities.filter(
    opp => !quotedRequestIds.has(opp.requestId)
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 via-black to-purple-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white">
                    Oportunidades 🎯
                  </h1>
                  <p className="text-cyan-200 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {availableOpportunities.length} solicitudes disponibles
                  </p>
                </div>
              </div>
            </div>

            <Link 
              href="/dashboard/pro"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                {availableOpportunities.length}
              </div>
              <div className="text-gray-400 text-sm">Disponibles</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                Quito
              </div>
              <div className="text-gray-400 text-sm">Tu zona</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                ${availableOpportunities.length * 35}
              </div>
              <div className="text-gray-400 text-sm">Potencial hoy</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                {opportunities.filter(o => {
                  const diff = Date.now() - new Date(o.createdAt).getTime();
                  return diff < 3600000; // 1 hora
                }).length}
              </div>
              <div className="text-gray-400 text-sm">Urgentes</div>
            </div>
          </div>
        </div>

        {/* Lista de Oportunidades */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                Solicitudes para ti
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/30 transition-all">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>

            {availableOpportunities.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <Target className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  No hay solicitudes nuevas
                </h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  Las nuevas oportunidades aparecerán aquí. Mantente en modo online para recibirlas primero.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOpportunities.map((opp) => {
                  const isNew = opp.targetStatus === 'notified';
                  const timeAgo = Math.floor((Date.now() - new Date(opp.createdAt).getTime()) / 60000);
                  const isUrgent = timeAgo < 60;

                  return (
                    <div key={opp.requestId} className="group relative">
                      <div className={`absolute -inset-1 ${isUrgent ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                      
                      <div className={`relative bg-gradient-to-br from-gray-800 to-black border ${isUrgent ? 'border-orange-500/40' : 'border-white/10'} rounded-2xl p-6 hover:border-purple-500/50 transition-all`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Info Principal */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              {/* Icono */}
                              <div className={`w-16 h-16 bg-gradient-to-br ${isUrgent ? 'from-orange-500 to-red-500 animate-pulse' : 'from-purple-500 to-cyan-500'} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                <Zap className="w-8 h-8 text-white" />
                              </div>

                              <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-2xl font-black text-white">
                                    {opp.categoryName || 'Servicio'}
                                  </h3>
                                  {isNew && (
                                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 animate-pulse">
                                      ✨ Nueva
                                    </span>
                                  )}
                                  {isUrgent && (
                                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30 animate-pulse">
                                      🔥 Urgente
                                    </span>
                                  )}
                                </div>

                                {/* Descripción */}
                                <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                                  {opp.description}
                                </p>

                                {/* Metadatos */}
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm">
                                      {opp.addressStreet}, {opp.addressCity}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm">
                                      {timeAgo < 60 
                                        ? `Hace ${timeAgo} min` 
                                        : `Hace ${Math.floor(timeAgo / 60)} horas`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4 text-pink-400" />
                                    <span className="text-sm">
                                      {new Date(opp.createdAt).toLocaleDateString('es-EC')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-right mb-2">
                              <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                                $30-50
                              </div>
                              <div className="text-gray-400 text-xs">
                                Rango estimado
                              </div>
                            </div>

                            <Link
                              href={`/dashboard/pro/opportunities/${opp.requestId}`}
                              className="group/btn relative"
                            >
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-75 group-hover/btn:opacity-100 transition"></div>
                              <div className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-black text-lg rounded-full shadow-lg hover:scale-105 transition-all">
                                Ver Detalles
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </div>
                            </Link>

                            <div className="text-xs text-gray-500 text-center">
                              Responde rápido • Gana más
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}