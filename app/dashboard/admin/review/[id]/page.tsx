import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { pros, users, proDocuments } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function ReviewProPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  const proId = parseInt(id);

  // Obtener datos del maestro
  const proData = await db
    .select({
      id: pros.id,
      userId: pros.userId,
      fullName: pros.fullName,
      email: users.email,
      phone: users.phone,
      experienceYears: pros.experienceYears,
      bio: pros.bio,
      approvalStatus: pros.approvalStatus,
      createdAt: users.createdAt,
    })
    .from(pros)
    .innerJoin(users, eq(pros.userId, users.id))
    .where(eq(pros.id, proId))
    .limit(1);

  if (proData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Maestro no encontrado</h1>
          <Link href="/dashboard/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const pro = proData[0];

  // Obtener documentos
  const documents = await db
    .select()
    .from(proDocuments)
    .where(eq(proDocuments.proId, proId));

  const cedulaFront = documents.find((d) => d.documentType === 'cedula_front');
  const cedulaBack = documents.find((d) => d.documentType === 'cedula_back');
  const antecedentes = documents.find((d) => d.documentType === 'antecedentes_penales');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Volver al panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Revisión de Documentos
          </h1>
          <p className="text-gray-600 mt-2">
            Verifica la identidad y antecedentes del maestro
          </p>
        </div>

        {/* Info del maestro */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información del Maestro
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <p className="font-medium text-gray-900">{pro.fullName}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{pro.email}</p>
            </div>
            {pro.phone && (
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <p className="font-medium text-gray-900">{pro.phone}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600">Experiencia:</span>
              <p className="font-medium text-gray-900">
                {pro.experienceYears} años
              </p>
            </div>
            {pro.bio && (
              <div className="col-span-2">
                <span className="text-gray-600">Biografía:</span>
                <p className="font-medium text-gray-900">{pro.bio}</p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-600">Fecha de registro:</span>
              <p className="font-medium text-gray-900">
                {new Date(pro.createdAt).toLocaleDateString('es-EC', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Documentos Subidos
          </h2>

          <div className="space-y-6">
            {/* Cédula Frontal */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Cédula de Identidad (Frente)
              </h3>
              {cedulaFront ? (
                <img
                  src={cedulaFront.documentUrl}
                  alt="Cédula frontal"
                  className="w-full max-w-md border-2 border-gray-200 rounded-lg"
                />
              ) : (
                <p className="text-red-600">❌ No subida</p>
              )}
            </div>

            {/* Cédula Reverso */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Cédula de Identidad (Reverso)
              </h3>
              {cedulaBack ? (
                <img
                  src={cedulaBack.documentUrl}
                  alt="Cédula reverso"
                  className="w-full max-w-md border-2 border-gray-200 rounded-lg"
                />
              ) : (
                <p className="text-red-600">❌ No subida</p>
              )}
            </div>

            {/* Antecedentes Penales */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Antecedentes Penales
              </h3>
              {antecedentes ? (
                <img
                  src={antecedentes.documentUrl}
                  alt="Antecedentes penales"
                  className="w-full max-w-md border-2 border-gray-200 rounded-lg"
                />
              ) : (
                <p className="text-red-600">❌ No subido</p>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        {pro.approvalStatus === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Acciones
            </h2>
            <div className="flex gap-4">
              <form action={`/api/admin/approve-pro`} method="POST">
                <input type="hidden" name="proId" value={pro.id} />
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  ✅ Aprobar Maestro
                </button>
              </form>
              <form action={`/api/admin/reject-pro`} method="POST">
                <input type="hidden" name="proId" value={pro.id} />
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  ❌ Rechazar Maestro
                </button>
              </form>
            </div>
          </div>
        )}

        {pro.approvalStatus === 'approved' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <p className="text-green-800 font-semibold">
              ✅ Este maestro ya fue aprobado
            </p>
          </div>
        )}

        {pro.approvalStatus === 'suspended' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">
              ❌ Este maestro fue rechazado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}