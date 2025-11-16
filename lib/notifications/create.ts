import { db } from '@/lib/db';
import { notifications } from '@/drizzle/schema';

interface CreateNotificationParams {
  userId: number;
  type: 'new_quote' | 'quote_accepted' | 'job_completed' | 'new_request';
  title: string;
  message: string;
  link?: string; // URL a donde redirigir al hacer click
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const payload = link ? { link } : null;

    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      payload: payload as any,
      read: false,
    });

    console.log(`✅ Notificación creada para user ${userId}: ${title}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
    return { success: false, error };
  }
}

// Funciones específicas para cada tipo
export async function notifyNewQuote(
  customerId: number,
  requestId: number,
  proName: string,
  amount: number
) {
  return createNotification({
    userId: customerId,
    type: 'new_quote',
    title: '💰 Nueva Cotización Recibida',
    message: `${proName} envió una cotización de $${amount.toFixed(2)} para tu solicitud.`,
    link: `/dashboard/customer/requests/${requestId}`,
  });
}

export async function notifyQuoteAccepted(
  proUserId: number,
  jobId: number,
  amount: number,
  category: string
) {
  return createNotification({
    userId: proUserId,
    type: 'quote_accepted',
    title: '🎉 ¡Cotización Aceptada!',
    message: `El cliente aceptó tu cotización de $${amount.toFixed(2)} para ${category}.`,
    link: `/dashboard/job/${jobId}`,
  });
}

export async function notifyJobCompleted(
  customerId: number,
  jobId: number,
  proName: string,
  category: string
) {
  return createNotification({
    userId: customerId,
    type: 'job_completed',
    title: '⭐ Trabajo Completado',
    message: `${proName} completó el trabajo de ${category}. ¡Califica el servicio!`,
    link: `/dashboard/job/${jobId}`,
  });
}

export async function notifyNewRequest(
  proUserId: number,
  requestId: number,
  category: string,
  distance: number
) {
  return createNotification({
    userId: proUserId,
    type: 'new_request',
    title: '🔔 Nueva Oportunidad Disponible',
    message: `Solicitud de ${category} a ${distance.toFixed(1)} km de ti. ¡Envía tu cotización!`,
    link: `/dashboard/pro/opportunities/${requestId}`,
  });
}