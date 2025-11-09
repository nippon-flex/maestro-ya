import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobs, quotes, serviceRequests, customers, pros, users, serviceCategories, addresses } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;
  const jobId = Number(id);

  // Obtener información completa del trabajo
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
      requestPhotos: serviceRequests.photos,
      categoryName: serviceCategories.name,
      addressStreet: addresses.street,
      addressCity: addresses.city,
      customerName: customers.fullName,
      customerPhoto: customers.photoUrl,
      proExperience: pros.experienceYears,
      proUserId: pros.userId,
      customerId: jobs.customerId,
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
    return <div className="p-8">Trabajo no encontrado</div>;
  }

  // Obtener nombre del maestro
  let proUser = null;
if (job.proUserId) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, job.proUserId))
    .limit(1);
  proUser = result[0];
}

const priceUSD = ((job.quoteAmountCents || 0) / 100).toFixed(2);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard/customer"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Volver al Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Trabajo en Curso</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                job.jobStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : job.jobStatus === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : job.jobStatus === 'done'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {job.jobStatus === 'pending'
                ? '⏳ Pendiente'
                : job.jobStatus === 'in_progress'
                ? '🔧 En Progreso'
                : job.jobStatus === 'done'
                ? '✅ Completado'
                : job.jobStatus}
            </span>
          </div>

          {/* Información del Servicio */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Servicio Contratado</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p>
                <strong>Categoría:</strong> {job.categoryName}
              </p>
              <p>
                <strong>Descripción:</strong> {job.requestDescription}
              </p>
              <p>
                <strong>Dirección:</strong> {job.addressStreet}, {job.addressCity}
              </p>
              <p>
                <strong>Precio acordado:</strong>{' '}
                <span className="text-2xl font-bold text-green-600">${priceUSD}</span>
              </p>
              {job.quoteEstimatedHours && (
                <p>
                  <strong>Tiempo estimado:</strong> {job.quoteEstimatedHours} horas
                </p>
              )}
            </div>
          </div>

          {/* Información del Maestro */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Maestro Asignado</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {proUser?.email?.[0].toUpperCase() || 'M'}
                </div>
                <div>
                  <p className="font-semibold text-lg">{proUser?.email || 'Maestro'}</p>
                  <p className="text-sm text-gray-500">
                    {job.proExperience} años de experiencia
                  </p>
                </div>
              </div>
              {job.quoteMessage && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Mensaje del maestro:</strong> {job.quoteMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Estado del Trabajo</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold">Trabajo Aceptado</p>
                  <p className="text-sm text-gray-500">
                    {new Date(job.jobCreatedAt).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {job.jobStartedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Trabajo Iniciado</p>
                    <p className="text-sm text-gray-500">
                      {new Date(job.jobStartedAt).toLocaleDateString('es-EC', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {job.jobCompletedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Trabajo Completado</p>
                    <p className="text-sm text-gray-500">
                      {new Date(job.jobCompletedAt).toLocaleDateString('es-EC', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Placeholder */}
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-2">💬 Chat con el maestro</p>
            <p className="text-sm text-gray-400">(Próximamente)</p>
          </div>
        </div>
      </div>
    </div>
  );
}