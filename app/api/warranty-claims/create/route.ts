import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { warrantyClaims, users, customers, jobs, pros } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createNotification } from '@/lib/notifications/create';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, description, photosUrls } = body;

    // Validar datos requeridos
    if (!jobId || !description) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId)
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Buscar customer
    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, user.id)
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Solo los clientes pueden crear reclamos' },
        { status: 403 }
      );
    }

    // Buscar trabajo
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId)
    });

    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Validar que el cliente sea el dueño del trabajo
    if (job.customerId !== customer.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para reclamar este trabajo' },
        { status: 403 }
      );
    }

    // Validar que el trabajo esté completado
    if (job.status !== 'done') {
      return NextResponse.json(
        { error: 'Solo puedes reclamar trabajos completados' },
        { status: 400 }
      );
    }

    // Verificar que no exista un reclamo previo
    const existingClaim = await db.query.warrantyClaims.findFirst({
      where: eq(warrantyClaims.jobId, jobId)
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Ya existe un reclamo para este trabajo' },
        { status: 400 }
      );
    }

    // Crear reclamo
    const [claim] = await db.insert(warrantyClaims).values({
      jobId,
      customerId: customer.id,
      proId: job.proId,
      description,
      photosUrls: photosUrls || [],
      status: 'open'
    }).returning();

    // Buscar pro para notificar
    const pro = await db.query.pros.findFirst({
      where: eq(pros.id, job.proId),
      with: {
        user: true
      }
    });

    // Notificar al maestro
    if (pro?.user) {
      await createNotification({
        userId: pro.user.id,
        type: 'warranty_claim',
        title: '⚠️ Nuevo Reclamo de Garantía',
        message: `Un cliente ha presentado un reclamo para el trabajo #${jobId}`,
        link: `/dashboard/pro`
      });
    }

    // Buscar admins y notificar
    const admins = await db.query.users.findMany({
      where: eq(users.role, 'admin')
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'warranty_claim',
        title: '🛡️ Nuevo Reclamo de Garantía',
        message: `Se requiere revisión del reclamo #${claim.id}`,
        link: `/dashboard/admin/warranty-claims/${claim.id}`
      });
    }

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error) {
    console.error('Error al crear reclamo:', error);
    return NextResponse.json(
      { error: 'Error al crear reclamo' },
      { status: 500 }
    );
  }
}