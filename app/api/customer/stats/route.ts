import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  users, customers, jobs, quotes, serviceRequests, 
  reviews, pros, serviceCategories 
} from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener usuario y customer
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // 1. Obtener trabajos del cliente con cotizaciones
    const customerJobs = await db
      .select({
        jobId: jobs.id,
        jobStatus: jobs.status,
        jobCreatedAt: jobs.createdAt,
        jobCompletedAt: jobs.completedAt,
        quoteAmount: quotes.amountCents,
        requestId: quotes.requestId,
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .where(eq(jobs.customerId, customer.id));

    // 2. Calcular total gastado
    const totalSpent = customerJobs.reduce((acc, job) => {
      return acc + (job.quoteAmount || 0);
    }, 0) / 100; // Convertir centavos a dólares

    // 3. Total de trabajos
    const totalJobs = customerJobs.length;
    const completedJobs = customerJobs.filter(j => j.jobStatus === 'done').length;

    // 4. Obtener solicitudes para calcular tiempo de respuesta
    const customerRequests = await db
      .select({
        requestId: serviceRequests.id,
        requestCreatedAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.customerId, customer.id));

    // Calcular tiempo promedio de respuesta (primera cotización)
    let avgResponseTime = 0;
    if (customerRequests.length > 0) {
      const responseTimes = await Promise.all(
        customerRequests.map(async (req) => {
          const [firstQuote] = await db
            .select({ createdAt: quotes.createdAt })
            .from(quotes)
            .where(eq(quotes.requestId, req.requestId))
            .orderBy(quotes.createdAt)
            .limit(1);

          if (firstQuote) {
            const diff = new Date(firstQuote.createdAt).getTime() - new Date(req.requestCreatedAt).getTime();
            return diff / (1000 * 60); // minutos
          }
          return null;
        })
      );

      const validTimes = responseTimes.filter(t => t !== null) as number[];
      if (validTimes.length > 0) {
        avgResponseTime = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
      }
    }

    // 5. Calcular rating promedio (de las reviews que han dejado los maestros sobre ti)
    const customerReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .leftJoin(jobs, eq(reviews.jobId, jobs.id))
      .where(eq(jobs.customerId, customer.id));

    const avgRating = customerReviews.length > 0
      ? customerReviews.reduce((acc, r) => acc + r.rating, 0) / customerReviews.length
      : 0;

    // 6. Obtener actividad reciente (últimos 4 trabajos)
    const recentActivity = await db
      .select({
        jobId: jobs.id,
        jobCreatedAt: jobs.createdAt,
        jobCompletedAt: jobs.completedAt,
        quoteAmount: quotes.amountCents,
        categoryName: serviceCategories.name,
        proId: pros.id,
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .leftJoin(serviceRequests, eq(quotes.requestId, serviceRequests.id))
      .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
      .leftJoin(pros, eq(jobs.proId, pros.id))
      .where(eq(jobs.customerId, customer.id))
      .orderBy(jobs.createdAt)
      .limit(4);

    // Obtener info de cada maestro
    const activityWithProInfo = await Promise.all(
      recentActivity.map(async (activity) => {
        const [proUser] = await db
          .select({
            email: users.email,
            name: customers.fullName,
          })
          .from(pros)
          .leftJoin(users, eq(pros.userId, users.id))
          .leftJoin(customers, eq(pros.userId, customers.userId))
          .where(eq(pros.id, activity.proId!))
          .limit(1);

        // Obtener rating del maestro en este trabajo
        const [review] = await db
          .select({ rating: reviews.rating })
          .from(reviews)
          .where(eq(reviews.jobId, activity.jobId))
          .limit(1);

        return {
          date: activity.jobCompletedAt || activity.jobCreatedAt,
          service: activity.categoryName || 'Servicio',
          amount: (activity.quoteAmount || 0) / 100,
          maestro: proUser?.name || proUser?.email?.split('@')[0] || 'Maestro',
          rating: review?.rating || 0,
        };
      })
    );

    // 7. Calcular ahorro estimado (comparando con precios de mercado - 20% más alto)
    const savedMoney = Math.round(totalSpent * 0.15); // Estimación de 15% de ahorro

    return NextResponse.json({
      success: true,
      stats: {
        totalSpent: Math.round(totalSpent),
        totalJobs,
        completedJobs,
        avgRating: Math.round(avgRating * 10) / 10,
        savedMoney,
        responseTime: avgResponseTime || 12,
        completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      },
      recentActivity: activityWithProInfo,
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}