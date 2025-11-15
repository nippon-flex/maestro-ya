import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reviews, jobs, users, customers } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { jobId, rating, comment } = await request.json();

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Calificación inválida (1-5)' }, { status: 400 });
    }

    const jobIdNum = parseInt(jobId);

    // Obtener trabajo
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobIdNum));
    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Verificar que el trabajo esté completado
    if (job.status !== 'done') {
      return NextResponse.json({ error: 'Solo puedes calificar trabajos completados' }, { status: 400 });
    }

    // Obtener usuario actual
    const [currentUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que sea el cliente del trabajo
    const [customer] = await db.select().from(customers).where(eq(customers.id, job.customerId));
    if (!customer || customer.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Solo el cliente puede calificar' }, { status: 403 });
    }

    // Verificar que no haya calificado antes
    const existingReview = await db.select()
      .from(reviews)
      .where(and(
        eq(reviews.jobId, jobIdNum),
        eq(reviews.authorId, currentUser.id)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json({ error: 'Ya calificaste este trabajo' }, { status: 400 });
    }

    // Crear reseña
    const [newReview] = await db.insert(reviews).values({
      jobId: jobIdNum,
      authorId: currentUser.id,
      targetProId: job.proId,
      rating: parseInt(rating),
      comment: comment?.trim() || null,
    }).returning();

    return NextResponse.json({ success: true, review: newReview });

  } catch (error) {
    console.error('Error al crear reseña:', error);
    return NextResponse.json({ error: 'Error al crear reseña' }, { status: 500 });
  }
}