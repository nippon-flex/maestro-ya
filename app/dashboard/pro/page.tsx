import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pros, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, CheckCircle2, AlertCircle, 
  MapPin, Zap, TrendingUp, Award, Crown, Rocket
} from 'lucide-react';
import { ProOnlineToggle } from '@/components/pro-online-toggle';
import { ProStats } from '@/components/pro-stats';

export default async function ProDashboard() {
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

  // Estados de aprobación
  if (pro.approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                Revisando tu perfil...
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Estamos verificando tus documentos. Este proceso toma entre 24-48 horas.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <p className="text-yellow-200">
                  Te notificaremos por email cuando tu cuenta esté lista para empezar a trabajar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pro.approvalStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                Cuenta Suspendida
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Tu cuenta ha sido suspendida. Por favor contacta a soporte.
              </p>
              <a 
                href="mailto:soporte@maestro-ya.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-all"
              >
                Contactar Soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Aprobado
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  ¡Hola, Maestro! 💪
                </h1>
                <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">Verificado</span>
                </div>
              </div>
              <p className="text-cyan-200 text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-yellow-400" />
                {pro.experienceYears} años de experiencia
              </p>
            </div>
            
            <Link 
              href="/dashboard/pro/opportunities"
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
              <div className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white font-black text-lg rounded-full shadow-2xl hover:scale-105 transition-all">
                <MapPin className="w-6 h-6" />
                Ver Oportunidades
                <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toggle Online/Offline */}
        <ProOnlineToggle initialStatus={pro.isOnline} />

        {/* Estadísticas Completas */}
        <ProStats />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Ver Oportunidades */}
          <Link href="/dashboard/pro/opportunities" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-500/60 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Oportunidades
              </h3>
              <p className="text-gray-400">
                Ver solicitudes cercanas y enviar cotizaciones
              </p>
            </div>
          </Link>

          {/* Mis Trabajos */}
          <div className="group relative cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/60 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Mis Trabajos
              </h3>
              <p className="text-gray-400">
                Ver trabajos activos y completados
              </p>
              <div className="mt-4 text-purple-400 text-sm font-bold">
                Próximamente...
              </div>
            </div>
          </div>

          {/* Mi Perfil */}
          <div className="group relative cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-3xl p-8 hover:border-yellow-500/60 transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Mi Perfil
              </h3>
              <p className="text-gray-400">
                Editar información y certificaciones
              </p>
              <div className="mt-4 text-yellow-400 text-sm font-bold">
                Próximamente...
              </div>
            </div>
          </div>
        </div>

        {/* Tips para Maestros */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white mb-2 text-lg">💡 Tip Pro:</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Responde rápido a las solicitudes. Los clientes prefieren maestros que contestan en menos de 10 minutos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white mb-2 text-lg">🏆 Bono Activo:</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Completa 10 trabajos este mes y gana 5% extra en todas tus ganancias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}