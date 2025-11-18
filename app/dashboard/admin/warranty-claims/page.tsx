import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { AlertCircle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

export default async function AdminWarrantyClaimsPage() {
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

  // Query simplificada con SQL directo
  const claimsResult = await db.execute(sql`
    SELECT 
      wc.id,
      wc.job_id,
      wc.status,
      wc.created_at,
      c.full_name as customer_name,
      cu.email as customer_email,
      p.full_name as pro_name,
      pu.email as pro_email,
      sc.name as service_name
    FROM warranty_claims wc
    JOIN jobs j ON j.id = wc.job_id
    JOIN customers c ON c.id = wc.customer_id
    JOIN users cu ON cu.id = c.user_id
    JOIN pros p ON p.id = wc.pro_id
    JOIN users pu ON pu.id = p.user_id
    JOIN service_requests sr ON sr.id = j.request_id
    JOIN service_categories sc ON sc.id = sr.category_id
    ORDER BY wc.created_at DESC
  `);

  const claims = claimsResult.rows as any[];

  // Estadísticas
  const stats = {
    total: claims.length,
    open: claims.filter(c => c.status === 'open').length,
    reviewing: claims.filter(c => c.status === 'reviewing').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    resolved: claims.filter(c => c.status === 'resolved').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-500/20 text-red-400 border-red-500/30',
      reviewing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    const labels = {
      open: 'Abierto',
      reviewing: 'Revisando',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      resolved: 'Resuelto',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'reviewing':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Reclamos de Garantía
          </h1>
          <p className="text-gray-400">Gestiona todos los reclamos de garantía de la plataforma</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-red-400">{stats.open}</div>
              <div className="text-sm text-gray-400">Abiertos</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.reviewing}</div>
              <div className="text-sm text-gray-400">Revisando</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.approved}</div>
              <div className="text-sm text-gray-400">Aprobados</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-gray-400">{stats.rejected}</div>
              <div className="text-sm text-gray-400">Rechazados</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
              <div className="text-sm text-gray-400">Resueltos</div>
            </div>
          </div>
        </div>

        {/* Lista de Reclamos */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
            
            {claims.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No hay reclamos de garantía</p>
                <p className="text-gray-500 text-sm">Cuando los clientes hagan reclamos, aparecerán aquí</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">ID</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Cliente</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Maestro</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Servicio</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Estado</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Fecha</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(claim.status)}
                            <span className="text-white font-medium">#{claim.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{claim.customer_name}</div>
                          <div className="text-sm text-gray-400">{claim.customer_email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{claim.pro_name}</div>
                          <div className="text-sm text-gray-400">{claim.pro_email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{claim.service_name}</div>
                          <div className="text-sm text-gray-400">Trabajo #{claim.job_id}</div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(claim.status)}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {new Date(claim.created_at).toLocaleDateString('es-EC', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            href={`/dashboard/admin/warranty-claims/${claim.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all inline-block"
                          >
                            Ver Detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}