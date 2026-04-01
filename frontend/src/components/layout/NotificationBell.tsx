import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CalendarCheck, Star, Clock, XCircle } from 'lucide-react';
import clsx from 'clsx';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
} from '../../hooks/useApi';
import type { AppNotification } from '../../types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function notificationIcon(type: AppNotification['type']) {
  switch (type) {
    case 'new_booking':
      return <CalendarCheck className="h-4 w-4 text-blue-500" />;
    case 'new_review':
      return <Star className="h-4 w-4 text-amber-500" />;
    case 'appointment_reminder':
      return <Clock className="h-4 w-4 text-purple-500" />;
    case 'appointment_cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
}

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications: AppNotification[] = notificationsData?.data ?? [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkRead = (notification: AppNotification) => {
    if (!notification.read_at) {
      markRead.mutate(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label={t('notifications.title')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse min-w-[18px] h-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {t('notifications.mark_all_read')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                {t('notifications.no_notifications')}
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={clsx(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                    !n.read_at && 'bg-blue-50/50'
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {notificationIcon(n.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        'text-sm leading-tight',
                        !n.read_at ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'
                      )}
                    >
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
