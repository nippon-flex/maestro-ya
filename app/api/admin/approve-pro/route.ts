import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pros } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar que el usuario sea admin

    const formData = await req.formData();
    const proId = parseInt(formData.get('proId') as string);

    if (!proId) {
      return NextResponse.json(
        { error: 'proId es requerido' },
        { status: 400 }
      );
    }

    // Actualizar estado del maestro
    await db
      .update(pros)
      .set({
        approvalStatus: 'approved',
        approvedAt: new Date(),
      })
      .where(eq(pros.id, proId));

    console.log(`✅ Maestro ${proId} aprobado por admin`);

    // Redirigir de vuelta al panel de admin
    return NextResponse.redirect(new URL('/dashboard/admin', req.url));
  } catch (error) {
    console.error('Error aprobando maestro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}