import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { quotes, jobs, serviceRequests, users, customers } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const quoteIdNum = Number(body.quoteId);

    if (!quoteIdNum) {
      return NextResponse.json({ error: 'quoteId requerido' }, { status: 400 });
    }

    // Obtener el user ID numérico desde la tabla users
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener el customer ID
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // 1. Obtener la cotización
    const quotesResult = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteIdNum))
      .limit(1);

    const quote = quotesResult[0];

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // 2. Verificar que la solicitud pertenece al cliente
    const requestsResult = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, quote.requestId),
          eq(serviceRequests.customerId, customer.id)
        )
      )
      .limit(1);

    const serviceRequest = requestsResult[0];

    if (!serviceRequest) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // 3. Crear el trabajo
    const [newJob] = await db
      .insert(jobs)
      .values({
        quoteId: quote.id,
        proId: quote.proId,
        customerId: customer.id,
        status: 'pending',
        startedAt: new Date(),
      })
      .returning();

    // 4. Actualizar la cotización aceptada
    await db
      .update(quotes)
      .set({ status: 'accepted' })
      .where(eq(quotes.id, quoteIdNum));

    // 5. Actualizar la solicitud
    await db
      .update(serviceRequests)
      .set({ status: 'awarded' })
      .where(eq(serviceRequests.id, quote.requestId));

    // 6. Rechazar las otras cotizaciones
    await db
      .update(quotes)
      .set({ status: 'rejected' })
      .where(
        and(
          eq(quotes.requestId, quote.requestId),
          eq(quotes.status, 'pending')
        )
      );

    return NextResponse.json({
      success: true,
      jobId: newJob.id,
      message: 'Cotización aceptada. Trabajo creado.',
    });

  } catch (error) {
    console.error('❌ Error al aceptar cotización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}