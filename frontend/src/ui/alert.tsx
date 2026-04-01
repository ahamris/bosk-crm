import clsx from 'clsx';

const styles = {
  info: { bg: 'bg-blue-50 ring-blue-200', icon: 'fa-circle-info text-blue-600', text: 'text-blue-800' },
  success: { bg: 'bg-emerald-50 ring-emerald-200', icon: 'fa-circle-check text-emerald-600', text: 'text-emerald-800' },
  warning: { bg: 'bg-amber-50 ring-amber-200', icon: 'fa-triangle-exclamation text-amber-600', text: 'text-amber-800' },
  error: { bg: 'bg-red-50 ring-red-200', icon: 'fa-circle-xmark text-red-600', text: 'text-red-800' },
};

interface AlertProps {
  type?: keyof typeof styles;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = 'info', title, children, onClose, className }: AlertProps) {
  const s = styles[type];
  return (
    <div className={clsx('rounded-lg p-4 ring-1 ring-inset', s.bg, className)}>
      <div className="flex gap-3">
        <i className={clsx('far mt-0.5', s.icon)} />
        <div className="flex-1">
          {title && <h4 className={clsx('text-sm font-semibold', s.text)}>{title}</h4>}
          <p className={clsx('text-sm', s.text, title && 'mt-1')}>{children}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className={clsx('text-sm', s.text, 'opacity-60 hover:opacity-100')}>
            <i className="far fa-xmark" />
          </button>
        )}
      </div>
    </div>
  );
}
