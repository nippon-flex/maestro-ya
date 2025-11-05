import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, customers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Briefcase, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function CustomerDashboard() {
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

  // Verificar que sea cliente
  if (user.role !== "customer") {
    redirect("/dashboard/pro");
  }

  // Obtener perfil de cliente
  const customer = await db.query.customers.findFirst({
    where: eq(customers.userId, user.id),
  });

  if (!customer) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {customer.fullName || "Cliente"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido a tu panel de control
              </p>
            </div>
            <Link href="/dashboard/customer/requests/new">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Nueva Solicitud
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solicitudes Abiertas</p>
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
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Comienza Publicando tu Primera Solicitud!
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Describe el trabajo que necesitas, sube fotos y recibe múltiples cotizaciones
              de maestros verificados cerca de ti en minutos.
            </p>
            <Link href="/dashboard/customer/requests/new">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Publicar Mi Primera Solicitud
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}