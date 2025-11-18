import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pros, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Faltan coordenadas' }, { status: 400 });
    }

    // Validar que sea un número válido
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }

    // Validar rango
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordenadas fuera de rango' }, { status: 400 });
    }

    // Buscar usuario
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar ubicación del pro
    await db
      .update(pros)
      .set({
        lat: latitude.toString(),
        lng: longitude.toString(),
        updatedAt: new Date(),
      })
      .where(eq(pros.userId, user.id));

    return NextResponse.json({
      success: true,
      message: 'Ubicación actualizada correctamente',
      lat: latitude,
      lng: longitude,
    });

  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ubicación' },
      { status: 500 }
    );
  }
}