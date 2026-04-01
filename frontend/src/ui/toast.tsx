import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const toastIcons = {
  success: 'fa-circle-check text-emerald-400',
  error: 'fa-circle-xmark text-red-400',
  info: 'fa-circle-info text-blue-400',
};

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onClose, 200); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={clsx(
      'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg transition-all duration-200',
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4',
    )}>
      <i className={clsx('far', toastIcons[type])} />
      <span>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 200); }} className="text-zinc-400 hover:text-white ml-2">
        <i className="far fa-xmark text-xs" />
      </button>
    </div>
  );
}
