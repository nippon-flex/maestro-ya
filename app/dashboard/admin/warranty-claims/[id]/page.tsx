'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, User, Briefcase, Calendar, MapPin, Star, Image as ImageIcon, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

interface Claim {
  id: number;
  jobId: number;
  customerId: number;
  proId: number;
  description: string;
  photosUrls: string[] | null;
  status: string;
  adminNotes: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: number;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    customer: {
      fullName: string;
      photoUrl: string | null;
      user: {
        email: string;
        phone: string | null;
      };
    };
    pro: {
      fullName: string;
      photoUrl: string | null;
      experienceYears: number;
      user: {
        email: string;
        phone: string | null;
      };
    };
    request: {
      title: string;
      description: string;
      category: {
        name: string;
      };
      address: {
        street: string;
        city: string;
      };
    };
    quote: {
      amountCents: number;
      estimatedHours: number;
    };
  };
}

export default function AdminWarrantyClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = useAuth();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [claimId, setClaimId] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setClaimId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!claimId) return;

    async function fetchClaim() {
      try {
        const res = await fetch(`/api/warranty-claims/${claimId}`);
        if (res.ok) {
          const data = await res.json();
          setClaim(data);
          setSelectedStatus(data.status);
          setAdminNotes(data.adminNotes || '');
        } else {
          alert('Error al cargar el reclamo');
          router.push('/dashboard/admin/warranty-claims');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el reclamo');
      } finally {
        setLoading(false);
      }
    }

    fetchClaim();
  }, [claimId, router]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      alert('Selecciona un estado');
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch('/api/warranty-claims/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: claim?.id,
          status: selectedStatus,
          adminNotes: adminNotes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Reclamo actualizado exitosamente');
        router.push('/dashboard/admin/warranty-claims');
      } else {
        alert(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el reclamo');
    } finally {
      setUpdating(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Reclamo no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/warranty-claims"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Reclamos
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Reclamo #{claim.id}
              </h1>
              <p className="text-gray-400">Gestiona este reclamo de garantía</p>
            </div>
            {getStatusBadge(claim.status)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Columna Izquierda - Información */}
          <div className="lg:col-span-2 space-y-6">

            {/* Descripción del Problema */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-bold text-white">Descripción del Problema</h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{claim.description}</p>
              </div>
            </div>

            {/* Fotos */}
            {claim.photosUrls && claim.photosUrls.length > 0 && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Fotos del Problema</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {claim.photosUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
                      >
                        <img
                          src={url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Información del Trabajo */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white">Información del Trabajo</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Servicio</div>
                    <div className="text-white font-medium">{claim.job.request.category.name}</div>
                    <div className="text-gray-300 text-sm">{claim.job.request.title}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Ubicación</div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                      <div className="text-gray-300 text-sm">
                        {claim.job.request.address.street}, {claim.job.request.address.city}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Precio</div>
                      <div className="text-white font-medium">
                        ${(claim.job.quote.amountCents / 100).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Duración Estimada</div>
                      <div className="text-white font-medium">{claim.job.quote.estimatedHours}h</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Completado</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <div className="text-gray-300 text-sm">
                        {claim.job.completedAt
                          ? new Date(claim.job.completedAt).toLocaleDateString('es-EC', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha - Cliente, Maestro y Acciones */}
          <div className="space-y-6">

            {/* Cliente */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Cliente</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {claim.job.customer.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{claim.job.customer.fullName}</div>
                      <div className="text-sm text-gray-400">{claim.job.customer.user.email}</div>
                    </div>
                  </div>
                  {claim.job.customer.user.phone && (
                    <div className="text-sm text-gray-400">📱 {claim.job.customer.user.phone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Maestro */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Maestro</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {claim.job.pro.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{claim.job.pro.fullName}</div>
                      <div className="text-sm text-gray-400">{claim.job.pro.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">{claim.job.pro.experienceYears} años de experiencia</span>
                  </div>
                  {claim.job.pro.user.phone && (
                    <div className="text-sm text-gray-400">📱 {claim.job.pro.user.phone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Gestionar Reclamo</h2>

                <div className="space-y-4">
                  {/* Estado */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Estado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="open">Abierto</option>
                      <option value="reviewing">Revisando</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="resolved">Resuelto</option>
                    </select>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Notas de Admin</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Agrega notas sobre tu decisión..."
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  {/* Botón Guardar */}
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    {updating ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}