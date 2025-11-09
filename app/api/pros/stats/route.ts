import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  users, pros, jobs, quotes, reviews, serviceRequests, serviceCategories
} from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener usuario y pro
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const [pro] = await db
      .select()
      .from(pros)
      .where(eq(pros.userId, user.id))
      .limit(1);

    if (!pro) {
      return NextResponse.json({ error: 'Maestro no encontrado' }, { status: 404 });
    }

    // 1. Obtener trabajos del maestro
    const proJobs = await db
      .select({
        jobId: jobs.id,
        jobStatus: jobs.status,
        jobCreatedAt: jobs.createdAt,
        jobCompletedAt: jobs.completedAt,
        quoteAmount: quotes.amountCents,
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .where(eq(jobs.proId, pro.id));

    // 2. Calcular ganancias totales
    const totalEarnings = proJobs.reduce((acc, job) => {
      if (job.jobStatus === 'done') {
        return acc + (job.quoteAmount || 0);
      }
      return acc;
    }, 0) / 100;

    // 3. Total de trabajos
    const totalJobs = proJobs.length;
    const completedJobs = proJobs.filter(j => j.jobStatus === 'done').length;
    const activeJobs = proJobs.filter(j => j.jobStatus === 'in_progress' || j.jobStatus === 'pending').length;

    // 4. Calcular rating promedio
    const proReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.targetProId, pro.id));

    const avgRating = proReviews.length > 0
      ? proReviews.reduce((acc, r) => acc + r.rating, 0) / proReviews.length
      : 0;

    // 5. Total de cotizaciones enviadas
    const totalQuotes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quotes)
      .where(eq(quotes.proId, pro.id));

    const quotesCount = Number(totalQuotes[0]?.count || 0);

    // 6. Tasa de aceptación
    const acceptedQuotes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quotes)
      .where(and(
        eq(quotes.proId, pro.id),
        eq(quotes.status, 'accepted')
      ));

    const acceptedCount = Number(acceptedQuotes[0]?.count || 0);
    const acceptanceRate = quotesCount > 0 ? Math.round((acceptedCount / quotesCount) * 100) : 0;

    // 7. Ganancias por mes (últimos 6 meses)
    const monthlyEarnings = await db
      .select({
        month: sql<string>`TO_CHAR(${jobs.completedAt}, 'YYYY-MM')`,
        earnings: sql<number>`SUM(${quotes.amountCents})`,
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .where(and(
        eq(jobs.proId, pro.id),
        eq(jobs.status, 'done')
      ))
      .groupBy(sql`TO_CHAR(${jobs.completedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${jobs.completedAt}, 'YYYY-MM') DESC`)
      .limit(6);

    const earningsChart = monthlyEarnings.map(m => ({
      month: m.month,
      earnings: (m.earnings || 0) / 100,
    })).reverse();

    // 8. Trabajos recientes
    const recentJobs = await db
      .select({
        jobId: jobs.id,
        jobStatus: jobs.status,
        jobCreatedAt: jobs.createdAt,
        jobCompletedAt: jobs.completedAt,
        quoteAmount: quotes.amountCents,
        categoryName: serviceCategories.name,
        requestDescription: serviceRequests.description,
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .leftJoin(serviceRequests, eq(quotes.requestId, serviceRequests.id))
      .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
      .where(eq(jobs.proId, pro.id))
      .orderBy(jobs.createdAt)
      .limit(5);

    const jobsActivity = recentJobs.map(job => ({
      id: job.jobId,
      service: job.categoryName || 'Servicio',
      description: job.requestDescription?.substring(0, 60) + '...' || '',
      amount: (job.quoteAmount || 0) / 100,
      status: job.jobStatus,
      date: job.jobCompletedAt || job.jobCreatedAt,
    }));

    // 9. Racha (días consecutivos trabajando)
    const streak = completedJobs > 0 ? Math.min(completedJobs, 30) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalEarnings: Math.round(totalEarnings),
        totalJobs,
        completedJobs,
        activeJobs,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: proReviews.length,
        quotesCount,
        acceptanceRate,
        streak,
        isOnline: pro.isOnline,
      },
      earningsChart,
      recentJobs: jobsActivity,
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas del maestro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}