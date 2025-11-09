import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  serviceRequests, pros, users, customers, 
  serviceCategories, addresses 
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, Calendar, User, ArrowLeft,
  Image as ImageIcon, Zap, DollarSign, Clock
} from 'lucide-react';
import { QuoteForm } from './quote-form';

export default async function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const requestId = Number(id);

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

  // Obtener detalles de la solicitud
  const requestData = await db
    .select({
      id: serviceRequests.id,
      customerId: serviceRequests.customerId,
      description: serviceRequests.description,
      photos: serviceRequests.photos,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
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

  // Obtener info del cliente
  const [customer] = await db
    .select({
      fullName: customers.fullName,
      photoUrl: customers.photoUrl,
    })
    .from(customers)
    .where(eq(customers.id, request.customerId))
    .limit(1);

  const timeAgo = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 60000);

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
            href="/dashboard/pro/opportunities"
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Oportunidades
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {request.categoryName}
              </h1>
              <p className="text-cyan-200 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Publicado hace {timeAgo < 60 ? `${timeAgo} min` : `${Math.floor(timeAgo / 60)}h`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Trabajo */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-500" />
                  Descripción del Trabajo
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {request.description}
                </p>

                {/* Metadatos */}
                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Ubicación</div>
                      <div className="text-white font-bold">
                        {request.addressStreet}
                      </div>
                      <div className="text-gray-400 text-sm">{request.addressCity}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Fecha de publicación</div>
                      <div className="text-white font-bold">
                        {new Date(request.createdAt).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(request.createdAt).toLocaleTimeString('es-EC', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fotos */}
            {request.photos && request.photos.length > 0 && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-pink-500" />
                    Fotos del Cliente
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.photos.map((photo, i) => (
                      <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all">
                        <img
                          src={photo}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Info del Cliente */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-500" />
                  Información del Cliente
                </h2>
                <div className="flex items-center gap-4">
                  {customer?.photoUrl ? (
                    <img
                      src={customer.photoUrl}
                      alt={customer.fullName || 'Cliente'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {customer?.fullName?.[0] || 'C'}
                    </div>
                  )}
                  <div>
                    <div className="text-white font-bold text-lg">
                      {customer?.fullName || 'Cliente de Maestro-Ya'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Miembro verificado ✓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Formulario de Cotización */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">
                      Envía tu Cotización
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Gana este trabajo con el mejor precio
                    </p>
                  </div>

                  <QuoteForm requestId={requestId} proId={pro.id} />

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                      <p className="text-cyan-200 text-sm text-center">
                        💡 <strong>Tip:</strong> Responde en menos de 10 minutos para tener más posibilidades
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}