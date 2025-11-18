import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, pros, proDocuments, serviceCategories, proCategories } from "@/drizzle/schema";
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
      categories,
      documents,
    } = body;

    // Verificar que el usuario autenticado sea el mismo
    if (userId !== clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Validar que las URLs de documentos existan
    if (!documents?.cedulaFront || !documents?.cedulaBack || !documents?.antecedentes) {
      console.error("Documentos recibidos:", documents);
      return NextResponse.json(
        { error: "Faltan URLs de documentos" },
        { status: 400 }
      );
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
      where: inArray(serviceCategories.name, categories),
    });

    const categoryIds = selectedCategories.map((c) => c.id);

    // Crear perfil de maestro
    const fullName = `${firstName} ${lastName}`.trim() || 'Maestro Profesional';
    
    const [pro] = await db
      .insert(pros)
      .values({
        userId: user.id,
        fullName,
        bio: bio || null,
        experienceYears: Number(experienceYears) || 0,
        approvalStatus: "pending",
      })
      .returning();

    // Guardar documentos
    const docPromises = [
      db.insert(proDocuments).values({
        proId: pro.id,
        documentType: "cedula_front",
        documentUrl: documents.cedulaFront,
      }),
      db.insert(proDocuments).values({
        proId: pro.id,
        documentType: "cedula_back",
        documentUrl: documents.cedulaBack,
      }),
      db.insert(proDocuments).values({
        proId: pro.id,
        documentType: "antecedentes_penales",
        documentUrl: documents.antecedentes,
      }),
    ];

    await Promise.all(docPromises);

    // Guardar categorías seleccionadas
    const categoryInserts = categoryIds.map((catId) => ({
      proId: pro.id,
      categoryId: catId,
    }));

    if (categoryInserts.length > 0) {
      await db.insert(proCategories).values(categoryInserts);
    }

    return NextResponse.json({ success: true, userId: user.id, proId: pro.id });
  } catch (error) {
    console.error("Error en onboarding pro:", error);
    return NextResponse.json(
      { error: "Error al crear perfil" },
      { status: 500 }
    );
  }
}