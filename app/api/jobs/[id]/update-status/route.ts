import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobs, users, customers, pros } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const jobId = parseInt(id);

    // Obtener el trabajo
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Obtener usuario actual
    const [currentUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar permisos según el estado
    if (status === 'in_progress' || status === 'done') {
      // Solo el maestro puede iniciar o completar
      const [pro] = await db.select().from(pros).where(eq(pros.id, job.proId));
      if (!pro || pro.userId !== currentUser.id) {
        return NextResponse.json({ error: 'Solo el maestro puede cambiar este estado' }, { status: 403 });
      }
    }

    // Actualizar estado
    const updateData: any = { status };

    if (status === 'in_progress' && !job.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === 'done' && !job.completedAt) {
      updateData.completedAt = new Date();
    }

    await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId));

    return NextResponse.json({ success: true, status });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}