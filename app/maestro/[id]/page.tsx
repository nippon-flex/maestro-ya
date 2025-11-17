import { db } from '@/lib/db';
import { users, pros, reviews, customers, jobs } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Star, Briefcase, Award, MapPin, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function MaestroProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

// Validar que el ID sea válido
if (!id || isNaN(parseInt(id))) {
  notFound();
}

const userId = parseInt(id);

// Obtener datos del maestro
  const maestro = await db
    .select({
      userId: users.id,
      clerkId: users.clerkId,
      email: users.email,
      phone: users.phone,
      proId: pros.id,
      experienceYears: pros.experienceYears,
      isOnline: pros.isOnline,
      approvalStatus: pros.approvalStatus,
    })
    .from(pros)
    .innerJoin(users, eq(pros.userId, users.id))
    .where(eq(pros.userId, userId))
    .limit(1);

  if (!maestro.length || maestro[0].approvalStatus !== 'approved') {
    notFound();
  }

  const pro = maestro[0];

  // Obtener reseñas
  const proReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      customerName: customers.fullName,
      customerPhoto: customers.photoUrl,
    })
    .from(reviews)
    .innerJoin(customers, eq(reviews.authorId, customers.userId))
    .where(eq(reviews.targetProId, pro.proId))
    .orderBy(sql`${reviews.createdAt} DESC`);

  // Calcular estadísticas
  const totalReviews = proReviews.length;
  const avgRating = totalReviews > 0
    ? proReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Contar trabajos completados
  const completedJobs = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(and(eq(jobs.proId, pro.proId), eq(jobs.status, 'done')));

  const totalJobs = completedJobs[0]?.count || 0;

  // Distribución de estrellas
  const starDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: proReviews.filter((r) => r.rating === stars).length,
    percentage: totalReviews > 0
      ? (proReviews.filter((r) => r.rating === stars).length / totalReviews) * 100
      : 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg opacity-75"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border-4 border-white/10">
                <Award className="w-16 h-16 text-cyan-400" />
              </div>
              {pro.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-4xl font-bold text-white">Maestro Profesional</h1>
                {pro.isOnline && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                    En línea
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 justify-center md:justify-start text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{pro.experienceYears} años de experiencia</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-white">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-gray-400">({totalReviews} reseñas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Trabajos */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 text-cyan-400" />
                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {totalJobs}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Trabajos Completados</p>
            </div>
          </div>

          {/* Promedio */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Calificación Promedio</p>
            </div>
          </div>

          {/* Total Reseñas */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {totalReviews}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Reseñas Recibidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de Estrellas */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Distribución de Calificaciones</h2>
            <div className="space-y-3">
              {starDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-white font-medium">{stars}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8">
              Todas las Reseñas ({totalReviews})
            </h2>

            {totalReviews === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Este maestro aún no tiene reseñas</p>
              </div>
            ) : (
              <div className="space-y-6">
                {proReviews.map((review) => {
                  const customerName = review.customerName || 'Cliente';
                  const customerPhoto = review.customerPhoto || undefined;
                  
                  return (
                    <div
                      key={review.id}
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition blur"></div>
                      <div className="relative bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          {/* Avatar Cliente */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden">
                            {customerPhoto ? (
                              <img
                                src={customerPhoto}
                                alt={customerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                {customerName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-white font-semibold">
                                {customerName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(review.createdAt).toLocaleDateString('es-EC', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>

                            {/* Estrellas */}
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Comentario */}
                            {review.comment && (
                              <p className="text-gray-300 leading-relaxed">
                                "{review.comment}"
                              </p>
                            )}
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