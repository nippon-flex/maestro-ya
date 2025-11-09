import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pros, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { isOnline } = await request.json();

    // Obtener user ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener pro
    const [pro] = await db
      .select()
      .from(pros)
      .where(eq(pros.userId, user.id))
      .limit(1);

    if (!pro) {
      return NextResponse.json({ error: 'Maestro no encontrado' }, { status: 404 });
    }

    // Actualizar estado
    await db
      .update(pros)
      .set({ isOnline: isOnline })
      .where(eq(pros.id, pro.id));

    return NextResponse.json({
      success: true,
      isOnline: isOnline,
      message: isOnline ? 'Ahora estás visible para clientes' : 'Modo offline activado',
    });

  } catch (error) {
    console.error('❌ Error al cambiar estado online:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}