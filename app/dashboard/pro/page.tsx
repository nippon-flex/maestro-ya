import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, pros } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Briefcase, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ProDashboard() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Verificar que el usuario existe en nuestra DB
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    redirect("/onboarding");
  }

  // Verificar que sea maestro
  if (user.role !== "pro") {
    redirect("/dashboard/customer");
  }

  // Obtener perfil de maestro
  const pro = await db.query.pros.findFirst({
    where: eq(pros.userId, user.id),
  });

  if (!pro) {
    redirect("/onboarding");
  }

  // Estado de aprobación
  const isPending = pro.approvalStatus === "pending";
  const isApproved = pro.approvalStatus === "approved";
  const isSuspended = pro.approvalStatus === "suspended";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, Maestro! 👷
              </h1>
              <p className="text-gray-600 mt-1">
                Panel de control profesional
              </p>
            </div>
            {isApproved && (
              <Link href="/dashboard/pro/opportunities">
                <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                  <Search className="w-5 h-5" />
                  Ver Oportunidades
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de Aprobación */}
        {isPending && (
          <Card className="p-8 mb-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Tu Perfil Está en Revisión
                </h2>
                <p className="text-gray-700 mb-4">
                  Nuestro equipo está verificando tus documentos (cédula y antecedentes penales).
                  Este proceso toma entre <span className="font-semibold">24-48 horas</span>.
                </p>
                <p className="text-gray-700">
                  Te notificaremos por email a <span className="font-semibold">{user.email}</span> cuando
                  tu perfil sea aprobado y puedas empezar a recibir solicitudes de clientes.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isSuspended && (
          <Card className="p-8 mb-8 bg-red-50 border-red-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Cuenta Suspendida
                </h2>
                <p className="text-gray-700">
                  Tu cuenta ha sido suspendida. Por favor contacta a soporte en{" "}
                  <a href="mailto:soporte@maestro-ya.com" className="text-red-600 underline">
                    soporte@maestro-ya.com
                  </a>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        {isApproved && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Oportunidades Nuevas</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trabajos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completados</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Empty State */}
            <Card className="p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Listo para Recibir Trabajos!
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Tu perfil está aprobado. Ahora recibirás notificaciones cuando haya solicitudes
                  cercanas a ti que coincidan con tus servicios.
                </p>
                <Link href="/dashboard/pro/opportunities">
                  <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                    <Search className="w-5 h-5" />
                    Ver Oportunidades Disponibles
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}

        {/* Pending State - No mostrar stats ni botones */}
        {isPending && (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Esperando Aprobación
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Una vez aprobado tu perfil, podrás ver y cotizar en solicitudes de clientes.
                Te avisaremos por email.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}