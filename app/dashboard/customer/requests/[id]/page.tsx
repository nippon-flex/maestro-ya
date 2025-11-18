import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { serviceRequests, quotes, pros, customers, serviceCategories, addresses, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AcceptQuoteButton } from './accept-quote-button';
import { 
  ArrowLeft, MapPin, Calendar, FileText, 
  Users, Star, Clock, DollarSign, Zap,
  CheckCircle2, Award, TrendingUp, Sparkles
} from 'lucide-react';

export default async function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const requestId = Number(id);

  // Obtener la solicitud con relaciones
  const requestData = await db
    .select({
      id: serviceRequests.id,
      description: serviceRequests.description,
      createdAt: serviceRequests.createdAt,
      photos: serviceRequests.photosUrls,
      categoryName: serviceCategories.name,
      addressStreet: addresses.street,
      addressCity: addresses.city,
    })
    .from(serviceRequests)
    .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
    .leftJoin(addresses, eq(serviceRequests.addressId, addresses.id))
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  const request = requestData[0];

  if (!request) {
    return <div className="p-8 text-white">Solicitud no encontrada</div>;
  }

  // Obtener cotizaciones
  const quotesData = await db
    .select({
      id: quotes.id,
      proId: quotes.proId,
      amountCents: quotes.amountCents,
      estimatedHours: quotes.estimatedHours,
      message: quotes.message,
      status: quotes.status,
      createdAt: quotes.createdAt,
      proExperience: pros.experienceYears,
      proUserId: pros.userId,
    })
    .from(quotes)
    .leftJoin(pros, eq(quotes.proId, pros.id))
    .where(eq(quotes.requestId, requestId));

  // Obtener info de cada maestro
  const quotesWithProInfo = await Promise.all(
    quotesData.map(async (quote) => {
      const [proUser] = await db
        .select({
          email: users.email,
          name: customers.fullName,
          photo: customers.photoUrl,
        })
        .from(users)
        .leftJoin(customers, eq(users.id, customers.userId))
        .where(eq(users.id, quote.proUserId!))
        .limit(1);

      return {
        ...quote,
        proName: proUser?.name || proUser?.email?.split('@')[0] || 'Maestro',
        proPhoto: proUser?.photo,
      };
    })
  );

  const pendingQuotes = quotesWithProInfo.filter(q => q.status === 'pending');
  const acceptedQuote = quotesWithProInfo.find(q => q.status === 'accepted');
  const hasAcceptedQuote = !!acceptedQuote;

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
          <Link 
            href="/dashboard/customer"
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {request.categoryName}
              </h1>
              <p className="text-cyan-200 text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                {quotesWithProInfo.length} {quotesWithProInfo.length === 1 ? 'cotización recibida' : 'cotizaciones recibidas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la Solicitud */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-500" />
                  Información de tu Solicitud
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Categoría</div>
                    <div className="text-white font-bold text-lg">{request.categoryName}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-1">Descripción</div>
                    <div className="text-white text-lg leading-relaxed">{request.description}</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Ubicación</div>
                        <div className="text-white font-bold">{request.addressStreet}</div>
                        <div className="text-gray-400 text-sm">{request.addressCity}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Fecha de creación</div>
                        <div className="text-white font-bold">
                          {new Date(request.createdAt).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 text-sm">Estado:</div>
                      <span
                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold ${
                          hasAcceptedQuote
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {hasAcceptedQuote ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            ✓ Maestro asignado
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 animate-pulse" />
                            ⏳ Esperando cotizaciones
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fotos si existen */}
            {request.photos && request.photos.length > 0 && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-6">Fotos Adjuntas</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.photos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                        <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Cotizaciones */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Header */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Cotizaciones
                  </h2>
                  <p className="text-gray-400">
                    {quotesWithProInfo.length} {quotesWithProInfo.length === 1 ? 'maestro interesado' : 'maestros interesados'}
                  </p>
                </div>
              </div>

              {/* Lista de Cotizaciones */}
              {quotesWithProInfo.length === 0 ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 text-purple-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Esperando respuestas
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Los maestros están siendo notificados. Recibirás cotizaciones pronto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotesWithProInfo.map((quote) => {
                    const priceUSD = (quote.amountCents / 100).toFixed(2);

                    return (
                      <div key={quote.id} className="relative group">
                        <div className={`absolute -inset-1 ${quote.status === 'accepted' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                        
                        <div className={`relative bg-gradient-to-br from-gray-800 to-black border ${quote.status === 'accepted' ? 'border-green-500/50' : 'border-white/10'} rounded-2xl p-6 hover:border-purple-500/50 transition-all`}>
                          {/* Maestro Info */}
                          <div className="flex items-start gap-3 mb-4">
                            {quote.proPhoto ? (
                              <img src={quote.proPhoto} alt={quote.proName} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {quote.proName[0]}
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-white font-bold">{quote.proName}</h3>
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {quote.proExperience} años exp.
                              </p>
                            </div>
                          </div>

                          {/* Precio */}
                          <div className="mb-4 text-center py-4 bg-white/5 rounded-xl">
                            <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                              ${priceUSD}
                            </div>
                            {quote.estimatedHours && (
                              <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                                <Clock className="w-4 h-4" />
                                ~{quote.estimatedHours}h estimadas
                              </div>
                            )}
                          </div>

                          {/* Mensaje */}
                          {quote.message && (
                            <div className="mb-4 bg-white/5 rounded-xl p-3">
                              <p className="text-gray-300 text-sm leading-relaxed">
                                "{quote.message}"
                              </p>
                            </div>
                          )}

                          {/* Fecha */}
                          <div className="text-xs text-gray-500 mb-4">
                            Enviada: {new Date(quote.createdAt).toLocaleDateString('es-EC')}
                          </div>

                          {/* Botón */}
                          {quote.status === 'pending' && !hasAcceptedQuote && (
                            <AcceptQuoteButton quoteId={quote.id} />
                          )}

                          {quote.status === 'accepted' && (
                            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-5 h-5" />
                              ✓ Cotización Aceptada
                            </div>
                          )}

                          {quote.status === 'rejected' && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center font-bold text-sm">
                              Rechazada
                            </div>
                          )}
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
    </div>
  );
}