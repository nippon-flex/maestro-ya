import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { warrantyClaims, users, jobs, pros, customers, notifications } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createNotification } from '@/lib/notifications/create';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden actualizar reclamos' }, { status: 403 });
    }

    const { claimId, status, adminNotes } = await req.json();

    if (!claimId || !status) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const validStatuses = ['open', 'reviewing', 'approved', 'rejected', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    // Obtener el reclamo con información del trabajo
    const claim = await db.query.warrantyClaims.findFirst({
      where: eq(warrantyClaims.id, claimId),
      with: {
        job: {
          with: {
            customer: {
              with: {
                user: true,
              },
            },
            pro: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
    }

    // Actualizar el reclamo
    const updateData: any = {
      status,
      adminNotes: adminNotes || claim.adminNotes,
      updatedAt: new Date(),
    };

    // Si se resuelve, guardar la fecha
    if (status === 'resolved' && claim.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }

    await db
      .update(warrantyClaims)
      .set(updateData)
      .where(eq(warrantyClaims.id, claimId));

    // Notificar al cliente
    if (claim.customerId) {
      let customerMessage = '';
      
      switch (status) {
        case 'reviewing':
          customerMessage = 'Tu reclamo de garantía está siendo revisado por nuestro equipo';
          break;
        case 'approved':
          customerMessage = 'Tu reclamo de garantía ha sido aprobado';
          break;
        case 'rejected':
          customerMessage = 'Tu reclamo de garantía ha sido rechazado';
          break;
        case 'resolved':
          customerMessage = 'Tu reclamo de garantía ha sido resuelto';
          break;
      }

      if (customerMessage) {
        await createNotification({
          userId: claim.customerId,
          type: 'warranty_claim',
          title: 'Actualización de Reclamo',
          message: customerMessage,
          link: `/dashboard/job/${claim.jobId}`,
        });
      }
    }

    // Notificar al maestro
    if (claim.proId && (status === 'approved' || status === 'resolved')) {
      let proMessage = '';
      
      if (status === 'approved') {
        proMessage = 'Un reclamo de garantía ha sido aprobado en tu contra';
      } else if (status === 'resolved') {
        proMessage = 'El reclamo de garantía ha sido resuelto';
      }

      await createNotification({
        userId: claim.proId,
        type: 'warranty_claim',
        title: 'Actualización de Reclamo',
        message: proMessage,
        link: `/dashboard/job/${claim.jobId}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reclamo actualizado exitosamente',
    });

  } catch (error) {
    console.error('Error al actualizar reclamo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reclamo' },
      { status: 500 }
    );
  }
}