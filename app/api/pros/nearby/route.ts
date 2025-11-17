import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pros, users, customers, proCategories, serviceCategories } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener maestros activos y aprobados
    const prosData = await db
      .select({
        proId: pros.id,
        userId: pros.userId,
        experienceYears: pros.experienceYears,
        approvalStatus: pros.approvalStatus,
        userEmail: users.email,
        customerName: customers.fullName,
        customerPhoto: customers.photoUrl,
      })
      .from(pros)
      .leftJoin(users, eq(pros.userId, users.id))
      .leftJoin(customers, eq(pros.userId, customers.userId))
      .where(eq(pros.approvalStatus, 'approved'));

    // Obtener categorías de cada maestro
    const prosWithCategories = await Promise.all(
      prosData.map(async (pro) => {
        const categories = await db
          .select({
            categoryName: serviceCategories.name,
          })
          .from(proCategories)
          .leftJoin(serviceCategories, eq(proCategories.categoryId, serviceCategories.id))
          .where(eq(proCategories.proId, pro.proId))
          .limit(1);

        return {
  id: pro.proId,
  userId: pro.userId,  // ← AGREGA ESTA LÍNEA
  name: pro.customerName || pro.userEmail?.split('@')[0] || 'Maestro',
  email: pro.userEmail,
  category: categories[0]?.categoryName || 'General',
  experience: pro.experienceYears,
  photoUrl: pro.customerPhoto,
  isOnline: Math.random() > 0.5,
  rating: 4.5 + Math.random() * 0.5,
  lat: -0.1807 + (Math.random() - 0.5) * 0.05,
  lng: -78.4678 + (Math.random() - 0.5) * 0.05,
  distance: (Math.random() * 5).toFixed(1),
};
      })
    );

    return NextResponse.json({
      success: true,
      pros: prosWithCategories,
    });

  } catch (error) {
    console.error('❌ Error al obtener maestros cercanos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}