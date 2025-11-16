import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobs, users, customers, pros, quotes, serviceRequests, serviceCategories } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { notifyJobCompleted } from '@/lib/notifications/create';

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

    // 🔔 ENVIAR NOTIFICACIÓN AL CLIENTE cuando se completa el trabajo
    if (status === 'done') {
      try {
        // Obtener info del cliente
        const [customer] = await db
          .select({ userId: customers.userId })
          .from(customers)
          .where(eq(customers.id, job.customerId));

        // Obtener info del maestro
        const [proInfo] = await db
          .select({ userId: pros.userId })
          .from(pros)
          .where(eq(pros.id, job.proId));

        // Obtener nombre del maestro
        let proName = 'el maestro';
        if (proInfo) {
          const [proUser] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, proInfo.userId));
          
          if (proUser?.email) {
            proName = proUser.email.split('@')[0];
          }
        }

        // Obtener categoría del servicio
        let categoryName = 'el servicio';
        if (job.quoteId) {
          const [quote] = await db
            .select({ requestId: quotes.requestId })
            .from(quotes)
            .where(eq(quotes.id, job.quoteId));

          if (quote) {
            const [request] = await db
              .select({ categoryId: serviceRequests.categoryId })
              .from(serviceRequests)
              .where(eq(serviceRequests.id, quote.requestId));

            if (request?.categoryId) {
              const [category] = await db
                .select({ name: serviceCategories.name })
                .from(serviceCategories)
                .where(eq(serviceCategories.id, request.categoryId));

              if (category) {
                categoryName = category.name;
              }
            }
          }
        }

        // Enviar notificación
        if (customer) {
          await notifyJobCompleted(
            customer.userId,
            jobId,
            proName,
            categoryName
          );
          
          console.log(`✅ Notificación de trabajo completado enviada al cliente (user ${customer.userId})`);
        }
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
        // No fallar la request si falla la notificación
      }
    }

    return NextResponse.json({ success: true, status });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}