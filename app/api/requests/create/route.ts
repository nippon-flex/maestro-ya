import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { addresses, serviceRequests, customers, users, pros, proCategories, requestTargets, serviceCategories } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { notifyNewRequest } from '@/lib/notifications/create';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, description, street, city, photos } = body;

    if (!categoryId || !description || !street || !city) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const [customer] = await db
      .select({ id: customers.id, userId: customers.userId })
      .from(customers)
      .innerJoin(users, eq(users.id, customers.userId))
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Obtener nombre de la categoría
    const [category] = await db
      .select({ name: serviceCategories.name })
      .from(serviceCategories)
      .where(eq(serviceCategories.id, parseInt(categoryId)))
      .limit(1);

    const categoryName = category?.name || 'servicio';

    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId: customer.userId,
        label: 'Dirección de servicio',
        street,
        city,
        country: 'EC',
        lat: '-0.1807',
        lng: '-78.4678',
        h3res8: '88754e641ffffff',
        createdAt: new Date(),
      })
      .returning();

    const [newRequest] = await db
      .insert(serviceRequests)
      .values({
        customerId: customer.id,
        categoryId: parseInt(categoryId),
        addressId: newAddress.id,
        description,
        photos: photos || [],
        status: 'open',
        createdAt: new Date(),
      })
      .returning();

    // Obtener maestros que coincidan (con su userId)
    const matchedPros = await db
      .select({ 
        proId: pros.id,
        userId: pros.userId 
      })
      .from(pros)
      .innerJoin(proCategories, eq(proCategories.proId, pros.id))
      .where(and(
        eq(pros.approvalStatus, 'approved'),
        eq(proCategories.categoryId, parseInt(categoryId)),
        eq(pros.isOnline, true) // Solo maestros online
      ));

    if (matchedPros.length > 0) {
      const targetValues = matchedPros.map((pro) => ({
        requestId: newRequest.id,
        proId: pro.proId,
        status: 'notified' as const,
        createdAt: new Date(),
      }));

      await db.insert(requestTargets).values(targetValues);

      // 🔔 ENVIAR NOTIFICACIONES A TODOS LOS MAESTROS
      for (const pro of matchedPros) {
        try {
          // Por ahora distancia fija, después se puede calcular con lat/lng
          const distance = 0.8;
          
          await notifyNewRequest(
            pro.userId,
            newRequest.id,
            categoryName,
            distance
          );
          
          console.log(`✅ Notificación enviada al maestro (user ${pro.userId})`);
        } catch (notifError) {
          console.error(`Error al notificar maestro ${pro.userId}:`, notifError);
          // Continuar con los demás aunque falle uno
        }
      }
    }

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      matchedProsCount: matchedPros.length,
    });

  } catch (error) {
    console.error('Error creando solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}