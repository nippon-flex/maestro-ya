'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, X, Briefcase, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

 const markAsRead = async (notificationId: number) => {
  console.log('🔔 Marcando como leída:', notificationId);
  try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_quote':
        return <Briefcase className="w-5 h-5 text-cyan-400" />;
      case 'quote_accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'job_completed':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'new_request':
        return <AlertCircle className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifDate.toLocaleDateString('es-EC', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-all group"
      >
        <Bell className="w-6 h-6 text-gray-700 group-hover:text-cyan-600 transition-colors" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-black">
            <span className="text-white text-xs font-bold px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-hidden z-50">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h3 className="text-white font-bold text-lg">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <p className="text-cyan-400 text-xs">
                      {unreadCount} sin leer
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Marcar todas
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 text-sm mt-3">Cargando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-white/5 transition-all ${
                          !notif.read ? 'bg-cyan-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            !notif.read
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'bg-gray-800 border border-white/10'
                          }`}>
                            {getIcon(notif.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`font-semibold text-sm ${
                                !notif.read ? 'text-white' : 'text-gray-300'
                              }`}>
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notif.id);
                                  }}
                                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed mb-2">
                              {notif.message}
                            </p>
                            <span className="text-gray-500 text-xs">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}