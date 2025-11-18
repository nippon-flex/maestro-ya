import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobs, quotes, serviceRequests, customers, pros, users, serviceCategories, addresses, reviews } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, DollarSign, Clock, CheckCircle2, Zap,
  MessageCircle, Award, TrendingUp, Wrench, User, Shield, Mail, Phone, Star
} from 'lucide-react';
import StatusButtons from './status-buttons';
import ReviewForm from './review-form';
import Chat from './chat';
import WarrantyClaimForm from './warranty-claim-form';

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const jobId = Number(id);

  const jobData = await db
    .select({
      jobId: jobs.id,
      jobStatus: jobs.status,
      jobStartedAt: jobs.startedAt,
      jobCompletedAt: jobs.completedAt,
      jobCreatedAt: jobs.createdAt,
      quoteAmountCents: quotes.amountCents,
      quoteEstimatedHours: quotes.estimatedHours,
      quoteMessage: quotes.message,
      requestDescription: serviceRequests.description,
      requestPhotos: serviceRequests.photosUrls,
      categoryName: serviceCategories.name,
      addressStreet: addresses.street,
      addressCity: addresses.city,
      customerName: customers.fullName,
      customerPhoto: customers.photoUrl,
      customerId: customers.id,
      proExperience: pros.experienceYears,
      proUserId: pros.userId,
      proId: pros.id,
    })
    .from(jobs)
    .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
    .leftJoin(serviceRequests, eq(quotes.requestId, serviceRequests.id))
    .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
    .leftJoin(addresses, eq(serviceRequests.addressId, addresses.id))
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(pros, eq(jobs.proId, pros.id))
    .where(eq(jobs.id, jobId))
    .limit(1);

  const job = jobData[0];

  if (!job) {
    return <div className="p-8 text-white">Trabajo no encontrado</div>;
  }

  let proUser = null;
  if (job.proUserId) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, job.proUserId))
      .limit(1);
    proUser = result[0];
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  const [currentCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, currentUser.id))
    .limit(1);

  const isCustomer = currentCustomer && currentCustomer.id === job.customerId;

  const priceUSD = ((job.quoteAmountCents || 0) / 100).toFixed(2);

  // Verificar si es el pro
  let isPro = false;
  if (job.proUserId) {
    isPro = currentUser.id === job.proUserId;
  }

  // Verificar si ya existe una reseña
  let hasReview = false;
  if (isCustomer && job.jobStatus === 'done') {
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.jobId, jobId),
        eq(reviews.authorId, currentUser.id)
      ))
      .limit(1);
    
    hasReview = existingReview.length > 0;
  }

  const statusConfig = {
    pending: { 
      label: 'Pendiente', 
      progress: 25,
      gradient: 'from-yellow-500 to-orange-500'
    },
    in_progress: { 
      label: 'En Progreso', 
      progress: 50,
      gradient: 'from-blue-500 to-cyan-500'
    },
    done: { 
      label: 'Completado', 
      progress: 100,
      gradient: 'from-green-500 to-emerald-500'
    },
    disputed: { 
      label: 'En Disputa', 
      progress: 75,
      gradient: 'from-red-500 to-pink-500'
    },
    cancelled: { 
      label: 'Cancelado', 
      progress: 0,
      gradient: 'from-gray-500 to-gray-600'
    },
  };

  const status = statusConfig[job.jobStatus] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-cyan-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link 
            href={isCustomer ? '/dashboard/customer' : '/dashboard/pro'}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${status.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  {job.categoryName}
                </h1>
                <p className="text-cyan-200 text-lg">
                  Trabajo #{job.jobId} • {status.label}
                </p>
              </div>
            </div>

            <div className={`px-6 py-3 bg-gradient-to-br ${status.gradient} rounded-full border-2 border-white/20 shadow-lg`}>
              <span className="text-white font-black text-lg">{status.label}</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-full h-3 overflow-hidden border border-white/20">
              <div 
                className={`h-full bg-gradient-to-r ${status.gradient} transition-all duration-1000`}
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Inicio</span>
              <span>{status.progress}% Completado</span>
              <span>Finalizado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-purple-500" />
                  Detalles del Servicio
                </h2>

                <div className="space-y-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Descripción</div>
                    <p className="text-white text-lg leading-relaxed">
                      {job.requestDescription || 'Sin descripción'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Ubicación</div>
                        <div className="text-white font-bold text-lg">
                          {job.addressStreet}
                        </div>
                        <div className="text-gray-400">{job.addressCity}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Precio Acordado</div>
                        <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          ${priceUSD}
                        </div>
                        {job.quoteEstimatedHours && (
                          <div className="text-gray-400 text-sm mt-1">
                            ~{job.quoteEstimatedHours} horas estimadas
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {job.quoteMessage && (
                    <div className="pt-6 border-t border-white/10">
                      <div className="text-gray-400 text-sm mb-2">Mensaje del Maestro</div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-white leading-relaxed">
                          "{job.quoteMessage}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-500" />
                  Estado del Trabajo
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      {job.jobStartedAt && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-green-500 to-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg">Trabajo Aceptado</div>
                      <div className="text-gray-400 text-sm">
                        {new Date(job.jobCreatedAt).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {job.jobStartedAt && (
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 bg-gradient-to-br ${job.jobStatus !== 'pending' ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600'} rounded-full flex items-center justify-center shadow-lg`}>
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        {job.jobCompletedAt && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-blue-500 to-green-500"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">Trabajo Iniciado</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(job.jobStartedAt).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {job.jobCompletedAt && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">Trabajo Completado</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(job.jobCompletedAt).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {isCustomer && job.proId && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-500" />
                      Tu Maestro
                    </h3>
                    <Link
                      href={`/maestro/${job.proId}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      Ver Perfil ⭐
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {proUser?.email?.[0].toUpperCase() || 'M'}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">
                        {proUser?.email?.split('@')[0] || 'Maestro'}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Award className="w-4 h-4" />
                        {job.proExperience} años de experiencia
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`mailto:${proUser?.email || 'soporte@maestro-ya.com'}?subject=Trabajo ${job.categoryName}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all"
                    >
                      <Mail className="w-5 h-5" />
                      Enviar Email
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!isCustomer && job.customerName && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-500" />
                    Cliente
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    {job.customerPhoto ? (
                      <img src={job.customerPhoto} alt={job.customerName} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {job.customerName?.[0] || 'C'}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-bold text-lg">
                        {job.customerName || 'Cliente'}
                      </div>
                      <div className="text-cyan-400 text-sm">
                        Cliente Verificado ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Estado - SOLO PARA MAESTRO */}
            {isPro && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-black text-white mb-4">
                    🎯 Acciones
                  </h3>
                  <StatusButtons 
                    jobId={id} 
                    currentStatus={job.jobStatus} 
                    isPro={isPro} 
                  />
                </div>
              </div>
            )}

            {/* Chat en Tiempo Real */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <Chat jobId={id} />
              </div>
            </div>

            {/* Formulario de Reseña - Solo para clientes en trabajos completados */}
            {isCustomer && job.jobStatus === 'done' && !hasReview && (
              <div className="relative" id="review">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    Califica el Servicio
                  </h3>
                  <ReviewForm 
                    jobId={id} 
                    proName={proUser?.email?.split('@')[0] || 'el maestro'} 
                  />
                </div>
              </div>
            )}

            {/* Mensaje si ya calificó */}
            {isCustomer && job.jobStatus === 'done' && hasReview && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-green-400">
                    <Star className="w-6 h-6 fill-green-400" />
                    <div>
                      <h3 className="font-bold">Ya calificaste este trabajo</h3>
                      <p className="text-sm text-green-300">¡Gracias por tu feedback!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Garantía con Botón de Reclamar - Solo para clientes en trabajos completados */}
            {isCustomer && job.jobStatus === 'done' && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white mb-2">🛡️ Garantía 30 Días</h3>
                      <p className="text-green-200 text-sm leading-relaxed mb-4">
                        Este trabajo está protegido por nuestra garantía de satisfacción.
                      </p>
                    </div>
                  </div>
                  
                  <WarrantyClaimForm jobId={jobId} />
                </div>
              </div>
            )}

            {/* Mensaje de Garantía para maestros */}
            {!isCustomer && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white mb-2">🛡️ Garantía 30 Días</h3>
                      <p className="text-green-200 text-sm leading-relaxed">
                        Este trabajo está protegido por nuestra garantía de satisfacción.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}