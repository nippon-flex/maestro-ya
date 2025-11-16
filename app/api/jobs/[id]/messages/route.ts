import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobMessages, users, jobs, customers, pros } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET - Obtener mensajes del chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);

    // Obtener usuario actual
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso al job
    const [job] = await db
      .select({
        id: jobs.id,
        customerId: jobs.customerId,
        proId: jobs.proId,
      })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Verificar si es cliente
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(
        eq(customers.userId, currentUser.id),
        eq(customers.id, job.customerId)
      ))
      .limit(1);

    // Verificar si es maestro
    const [pro] = await db
      .select({ id: pros.id })
      .from(pros)
      .where(and(
        eq(pros.userId, currentUser.id),
        eq(pros.id, job.proId)
      ))
      .limit(1);

    // Si no es ni cliente ni maestro, no tiene acceso
    if (!customer && !pro) {
      return NextResponse.json({ error: 'Sin acceso a este chat' }, { status: 403 });
    }

    // Obtener mensajes
    const messages = await db
      .select({
        id: jobMessages.id,
        message: jobMessages.text,
        createdAt: jobMessages.createdAt,
        senderId: jobMessages.senderId,
        senderClerkId: users.clerkId,
        senderEmail: users.email,
      })
      .from(jobMessages)
      .innerJoin(users, eq(jobMessages.senderId, users.id))
      .where(eq(jobMessages.jobId, jobId))
      .orderBy(jobMessages.createdAt);

    // Formatear mensajes
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.message || '',
      createdAt: msg.createdAt.toISOString(),
      sender: {
        clerkUserId: msg.senderClerkId,
        name: msg.senderEmail?.split('@')[0] || 'Usuario',
        photoUrl: null,
      },
    }));

    return NextResponse.json({
      messages: formattedMessages,
      currentUserId: userId,
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje
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
    const jobId = parseInt(id);
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }

    // Obtener usuario actual
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar acceso al job
    const [job] = await db
      .select({
        id: jobs.id,
        customerId: jobs.customerId,
        proId: jobs.proId,
      })
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Verificar si es cliente
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(
        eq(customers.userId, currentUser.id),
        eq(customers.id, job.customerId)
      ))
      .limit(1);

    // Verificar si es maestro
    const [pro] = await db
      .select({ id: pros.id })
      .from(pros)
      .where(and(
        eq(pros.userId, currentUser.id),
        eq(pros.id, job.proId)
      ))
      .limit(1);

    if (!customer && !pro) {
      return NextResponse.json({ error: 'Sin acceso a este chat' }, { status: 403 });
    }

    // Crear mensaje
    const [newMessage] = await db
      .insert(jobMessages)
      .values({
        jobId,
        senderId: currentUser.id,
        text: message.trim(),
      })
      .returning();

    return NextResponse.json({
      message: {
        id: newMessage.id,
        message: newMessage.text || '',
        createdAt: newMessage.createdAt.toISOString(),
        sender: {
          clerkUserId: userId,
          name: currentUser.email?.split('@')[0] || 'Usuario',
          photoUrl: null,
        },
      },
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}