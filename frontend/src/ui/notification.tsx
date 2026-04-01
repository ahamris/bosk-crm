import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface NotificationProps {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  duration?: number;
  onClose: () => void;
  action?: { label: string; onClick: () => void };
}

const typeStyles = {
  success: { icon: 'fa-circle-check', color: 'text-emerald-500' },
  error: { icon: 'fa-circle-xmark', color: 'text-red-500' },
  warning: { icon: 'fa-triangle-exclamation', color: 'text-amber-500' },
  info: { icon: 'fa-circle-info', color: 'text-blue-500' },
};

export function Notification({ title, message, type = 'info', icon, duration = 5000, onClose, action }: NotificationProps) {
  const [visible, setVisible] = useState(true);
  const s = typeStyles[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={clsx(
      'pointer-events-auto w-full max-w-sm rounded-xl bg-white p-4 shadow-lg ring-1 ring-zinc-900/5 transition-all duration-300',
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
    )}>
      <div className="flex items-start gap-3">
        <i className={clsx('far mt-0.5', icon ? `fa-${icon}` : s.icon, s.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          {message && <p className="mt-0.5 text-sm text-zinc-500">{message}</p>}
          {action && (
            <button onClick={action.onClick} className="mt-2 text-sm font-medium text-zinc-900 hover:text-zinc-600">
              {action.label} <i className="far fa-arrow-right text-xs ml-0.5" />
            </button>
          )}
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="text-zinc-400 hover:text-zinc-600">
          <i className="far fa-xmark" />
        </button>
      </div>
    </div>
  );
}
