import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pros, users, proCategories, serviceCategories, reviews } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateDistance } from '@/lib/geo';

const MAX_DISTANCE_KM = 50;

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const userLat = searchParams.get('lat'); // ✅ CAMBIADO: era 'latitude'
    const userLng = searchParams.get('lng'); // ✅ CAMBIADO: era 'longitude'

    if (!userLat || !userLng) {
      return NextResponse.json({ error: 'Coordenadas requeridas' }, { status: 400 });
    }

    const userLatNum = Number(userLat);
    const userLngNum = Number(userLng);

    // Obtener todos los pros aprobados y online
    const prosData = await db
      .select({
        proId: pros.id,
        userId: pros.userId,
        fullName: pros.fullName,
        photoUrl: pros.photoUrl,
        experienceYears: pros.experienceYears,
        bio: pros.bio,
        isOnline: pros.isOnline,
        lat: pros.lat,
        lng: pros.lng,
        approvalStatus: pros.approvalStatus,
        userEmail: users.email,
      })
      .from(pros)
      .innerJoin(users, eq(pros.userId, users.id))
      .where(
        and(
          eq(pros.approvalStatus, 'approved'),
          eq(pros.isOnline, true),
          eq(users.status, 'active')
        )
      );

    // Filtrar pros que tienen ubicación establecida y calcular distancias
    const prosWithLocation = prosData
      .filter(pro => pro.lat && pro.lng) // Solo maestros con ubicación
      .map(pro => {
        const distance = calculateDistance(
          userLatNum,
          userLngNum,
          Number(pro.lat),
          Number(pro.lng)
        );
        return { ...pro, distance };
      })
      .filter(pro => pro.distance <= MAX_DISTANCE_KM) // Dentro del radio
      .sort((a, b) => a.distance - b.distance); // Ordenar por cercanía

    // Obtener categorías y ratings para cada pro
    const prosWithDetails = await Promise.all(
      prosWithLocation.map(async (pro) => {
        // Categorías
        const categories = await db
          .select({
            id: serviceCategories.id,
            name: serviceCategories.name,
          })
          .from(proCategories)
          .innerJoin(serviceCategories, eq(proCategories.categoryId, serviceCategories.id))
          .where(eq(proCategories.proId, pro.proId));

        // Rating promedio
        const ratingResult = await db
          .select({
            avg: sql<number>`avg(${reviews.rating})`,
            count: sql<number>`count(*)`,
          })
          .from(reviews)
          .where(eq(reviews.targetProId, pro.proId));

        const avgRating = Number(ratingResult[0]?.avg) || 0;
        const totalReviews = Number(ratingResult[0]?.count) || 0;

        return {
          id: pro.proId,
          userId: pro.userId,
          name: pro.fullName || pro.userEmail?.split('@')[0] || 'Maestro',
          email: pro.userEmail,
          photoUrl: pro.photoUrl,
          experience: pro.experienceYears,
          bio: pro.bio,
          isOnline: pro.isOnline,
          rating: avgRating > 0 ? avgRating : 4.5,
          totalReviews,
          category: categories[0]?.name || 'General',
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          lat: Number(pro.lat),
          lng: Number(pro.lng),
          distance: pro.distance.toFixed(1),
        };
      })
    );

    return NextResponse.json({
      success: true,
      pros: prosWithDetails,
      total: prosWithDetails.length,
    });

  } catch (error) {
    console.error('❌ Error al obtener maestros cercanos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}