import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, customers, pros } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Verificar si el usuario ya existe en nuestra DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  // Si ya tiene perfil completo, redirigir al dashboard apropiado
  if (existingUser) {
    if (existingUser.role === "customer") {
      const customerProfile = await db.query.customers.findFirst({
        where: eq(customers.userId, existingUser.id),
      });
      if (customerProfile) {
        redirect("/dashboard/customer");
      }
    } else if (existingUser.role === "pro") {
      const proProfile = await db.query.pros.findFirst({
        where: eq(pros.userId, existingUser.id),
      });
      if (proProfile) {
        redirect("/dashboard/pro");
      }
    }
  }

  // Pasar datos del usuario de Clerk al componente cliente
  const userData = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
  };

  return <OnboardingClient userData={userData} />;
}