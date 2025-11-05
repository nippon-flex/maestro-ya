import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, customers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { clerkId, email, phone, fullName, photoUrl } = body;

    // Verificar que el usuario autenticado sea el mismo que está registrando
    if (userId !== clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Crear usuario en tabla users
    const [user] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        phone: phone || null,
        role: "customer",
        status: "active",
      })
      .returning();

    // Crear perfil de cliente
    await db.insert(customers).values({
      userId: user.id,
      fullName,
      photoUrl: photoUrl || null,
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Error en onboarding customer:", error);
    return NextResponse.json(
      { error: "Error al crear perfil" },
      { status: 500 }
    );
  }
}