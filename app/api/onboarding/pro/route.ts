import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, pros, proDocuments, serviceCategories } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      clerkId,
      email,
      phone,
      firstName,
      lastName,
      bio,
      experienceYears,
      coverageKm,
      categories,
      documents,
    } = body;

    // Verificar que el usuario autenticado sea el mismo
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
        role: "pro",
        status: "active",
      })
      .returning();

    // Obtener IDs de categorías seleccionadas
    const selectedCategories = await db.query.serviceCategories.findMany({
      where: inArray(serviceCategories.slug, categories),
    });

    const categoryIds = selectedCategories.map((c) => c.id);

    // Calcular fecha de fin de trial (30 días desde ahora)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    // Crear perfil de maestro
    const [pro] = await db
      .insert(pros)
      .values({
        userId: user.id,
        bio: bio || null,
        experienceYears,
        coverageKm,
        approvalStatus: "pending",
        trialEndAt: trialEnd,
      })
      .returning();

    // Guardar documentos
    const docPromises = [
      db.insert(proDocuments).values({
        proId: pro.id,
        type: "cedula_front",
        url: documents.cedulaFront,
        status: "pending",
      }),
      db.insert(proDocuments).values({
        proId: pro.id,
        type: "cedula_back",
        url: documents.cedulaBack,
        status: "pending",
      }),
      db.insert(proDocuments).values({
        proId: pro.id,
        type: "antecedentes_penales",
        url: documents.antecedentes,
        status: "pending",
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
      }),
    ];

    await Promise.all(docPromises);

    // Nota: Las categorías las manejaremos después con una tabla intermedia
    // Por ahora el maestro queda registrado

    return NextResponse.json({ success: true, userId: user.id, proId: pro.id });
  } catch (error) {
    console.error("Error en onboarding pro:", error);
    return NextResponse.json(
      { error: "Error al crear perfil" },
      { status: 500 }
    );
  }
}