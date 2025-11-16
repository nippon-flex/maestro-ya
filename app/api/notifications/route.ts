import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { notifications, users } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        read: notifications.read,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const unreadCount = userNotifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, user.id));

      return NextResponse.json({ success: true, message: 'Todas marcadas como leídas' });
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, user.id)
          )
        );

      return NextResponse.json({ success: true, message: 'Notificación marcada como leída' });
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al actualizar notificaciones' },
      { status: 500 }
    );
  }
}