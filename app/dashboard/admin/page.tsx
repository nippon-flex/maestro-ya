import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { pros, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export default async function AdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Por ahora, cualquier usuario autenticado puede ver el admin
  // TODO: Agregar verificación de rol admin

  // Obtener maestros pendientes
  const pendingPros = await db
    .select({
      id: pros.id,
      userId: pros.userId,
      email: users.email,
      phone: users.phone,
      experienceYears: pros.experienceYears,
      coverageKm: pros.coverageKm,
      bio: pros.bio,
      createdAt: users.createdAt,
    })
    .from(pros)
    .innerJoin(users, eq(pros.userId, users.id))
    .where(eq(pros.approvalStatus, 'pending'));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🛡️ Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de maestros
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
            <div className="text-orange-600 text-sm font-medium">
              Pendientes de Aprobación
            </div>
            <div className="text-4xl font-bold text-gray-900 mt-2">
              {pendingPros.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border-2 border-green-200">
            <div className="text-green-600 text-sm font-medium">
              Aprobados Esta Semana
            </div>
            <div className="text-4xl font-bold text-gray-900 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg border-2 border-red-200">
            <div className="text-red-600 text-sm font-medium">
              Rechazados Esta Semana
            </div>
            <div className="text-4xl font-bold text-gray-900 mt-2">0</div>
          </div>
        </div>

        {/* Lista de maestros pendientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Maestros Pendientes de Aprobación
            </h2>
          </div>

          {pendingPros.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Todo al día!
              </h3>
              <p className="text-gray-600">
                No hay maestros pendientes de aprobación.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingPros.map((pro) => (
                <div key={pro.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pro.email}
                        </h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                          Pendiente
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>📧 {pro.email}</div>
                        {pro.phone && <div>📱 {pro.phone}</div>}
                        <div>
                          ⚡ {pro.experienceYears} años de experiencia
                        </div>
                        <div>📍 Cobertura: {pro.coverageKm} km</div>
                        {pro.bio && (
                          <div className="mt-2 text-gray-700">
                            💬 "{pro.bio}"
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Registrado:{' '}
                          {new Date(pro.createdAt).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <a
                        href={`/dashboard/admin/review/${pro.id}`}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Revisar Documentos →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}