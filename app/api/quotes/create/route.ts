import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { quotes, users, pros, requestTargets } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, proId, amountCents, estimatedHours, message } = body;

    if (!requestId || !proId || !amountCents) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!dbUser || dbUser.role !== 'pro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const [pro] = await db
      .select()
      .from(pros)
      .where(and(eq(pros.userId, dbUser.id), eq(pros.id, proId)))
      .limit(1);

    if (!pro) {
      return NextResponse.json({ error: 'Maestro no encontrado' }, { status: 404 });
    }

    const [newQuote] = await db
      .insert(quotes)
      .values({
        requestId: parseInt(requestId),
        proId: parseInt(proId),
        amountCents: parseInt(amountCents),
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        message: message || null,
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();

    await db
      .update(requestTargets)
      .set({ status: 'viewed' })
      .where(
        and(
          eq(requestTargets.requestId, parseInt(requestId)),
          eq(requestTargets.proId, parseInt(proId))
        )
      );

    return NextResponse.json({
      success: true,
      quoteId: newQuote.id,
    });

  } catch (error) {
    console.error('Error creando cotización:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}