import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobs, serviceRequests, customers, users, serviceCategories, pros, quotes } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Buscar usuario
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId)
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Buscar pro
    const pro = await db.query.pros.findFirst({
      where: eq(pros.userId, user.id)
    });

    if (!pro) {
      return NextResponse.json({ error: 'Perfil de maestro no encontrado' }, { status: 404 });
    }

    // Obtener trabajos con joins (jobs → quotes → service_requests)
    let jobsQuery = db
      .select({
        jobId: jobs.id,
        jobStatus: jobs.status,
        jobCreatedAt: jobs.createdAt,
        jobStartedAt: jobs.startedAt,
        jobCompletedAt: jobs.completedAt,
        quoteAmount: quotes.amountCents,
        requestId: serviceRequests.id,
        requestDescription: serviceRequests.description,
        requestUrgentMode: serviceRequests.urgentMode,
        categoryName: serviceCategories.name,
        customerId: customers.id,
        customerName: customers.fullName,
        customerPhoto: customers.photoUrl,
        customerPhone: users.phone
      })
      .from(jobs)
      .leftJoin(quotes, eq(jobs.quoteId, quotes.id))
      .leftJoin(serviceRequests, eq(quotes.requestId, serviceRequests.id))
      .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .leftJoin(users, eq(customers.userId, users.id))
      .where(eq(jobs.proId, pro.id))
      .orderBy(desc(jobs.createdAt));

    // Ejecutar query
    let allJobs = await jobsQuery;

    // Filtrar por estado si viene
    if (status && status !== 'all') {
      allJobs = allJobs.filter(job => job.jobStatus === status);
    }

    // Filtrar por búsqueda si viene
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      allJobs = allJobs.filter(job => {
        const customerName = job.customerName?.toLowerCase() || '';
        const categoryName = job.categoryName?.toLowerCase() || '';
        const description = job.requestDescription?.toLowerCase() || '';
        const jobId = job.jobId.toString();
        
        return customerName.includes(searchLower) ||
               categoryName.includes(searchLower) ||
               description.includes(searchLower) ||
               jobId.includes(searchLower);
      });
    }

    // Formatear respuesta
    const formattedJobs = allJobs.map(job => ({
      id: job.jobId,
      status: job.jobStatus,
      amountCents: job.quoteAmount,
      createdAt: job.jobCreatedAt,
      startedAt: job.jobStartedAt,
      completedAt: job.jobCompletedAt,
      customer: {
        id: job.customerId,
        name: job.customerName,
        photo: job.customerPhoto,
        phone: job.customerPhone
      },
      request: {
        id: job.requestId,
        categoryName: job.categoryName,
        description: job.requestDescription,
        urgentMode: job.requestUrgentMode
      }
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    });

  } catch (error) {
    console.error('Error al obtener trabajos del maestro:', error);
    return NextResponse.json(
      { error: 'Error al obtener trabajos' },
      { status: 500 }
    );
  }
}