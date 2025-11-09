import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes, serviceRequests, serviceCategories } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las categorías
    const categories = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
      })
      .from(serviceCategories);

    // Calcular precio promedio por categoría basado en cotizaciones aceptadas
    const averagePrices: Record<string, number> = {};

    for (const category of categories) {
      const result = await db
        .select({
          avgPrice: sql<number>`AVG(${quotes.amountCents})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(quotes)
        .leftJoin(serviceRequests, eq(quotes.requestId, serviceRequests.id))
        .where(eq(serviceRequests.categoryId, category.id));

      const avgCents = result[0]?.avgPrice || 2500; // Default 25 USD si no hay datos
      const count = result[0]?.count || 0;

      // Convertir a USD por hora (asumiendo promedio de 2 horas)
      averagePrices[category.name] = Math.round((avgCents / 100) / 2);
    }

    return NextResponse.json({
      success: true,
      averagePrices,
    });

  } catch (error) {
    console.error('❌ Error al calcular precios promedio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}