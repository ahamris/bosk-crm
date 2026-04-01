import clsx from 'clsx';

interface InfoBannerProps {
  message: string;
  icon?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  variant?: 'info' | 'warning' | 'success' | 'promo';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variants = {
  info: { bg: 'bg-blue-50 ring-blue-200', icon: 'fa-circle-info text-blue-600', text: 'text-blue-800' },
  warning: { bg: 'bg-amber-50 ring-amber-200', icon: 'fa-triangle-exclamation text-amber-600', text: 'text-amber-800' },
  success: { bg: 'bg-emerald-50 ring-emerald-200', icon: 'fa-circle-check text-emerald-600', text: 'text-emerald-800' },
  promo: { bg: 'bg-indigo-50 ring-indigo-200', icon: 'fa-sparkles text-indigo-600', text: 'text-indigo-800' },
};

/**
 * Moneybird-style info banner — prominent aankondiging bovenaan pagina
 * "Vraag nu een gratis betaalrekening aan..."
 */
export function InfoBanner({ message, icon, action, variant = 'info', dismissible, onDismiss, className }: InfoBannerProps) {
  const v = variants[variant];

  return (
    <div className={clsx('flex items-center gap-3 rounded-xl px-4 py-3 ring-1', v.bg, className)}>
      <i className={clsx('far shrink-0', icon ? `fa-${icon}` : v.icon)} />
      <p className={clsx('flex-1 text-sm', v.text)}>{message}</p>
      {action && (
        action.href ? (
          <a href={action.href} className={clsx('text-sm font-semibold whitespace-nowrap', v.text, 'hover:underline')}>
            {action.label} <i className="far fa-chevron-right text-xs ml-0.5" />
          </a>
        ) : (
          <button onClick={action.onClick} className={clsx('text-sm font-semibold whitespace-nowrap', v.text, 'hover:underline')}>
            {action.label} <i className="far fa-chevron-right text-xs ml-0.5" />
          </button>
        )
      )}
      {dismissible && (
        <button onClick={onDismiss} className={clsx('shrink-0', v.text, 'opacity-60 hover:opacity-100')}>
          <i className="far fa-xmark" />
        </button>
      )}
    </div>
  );
}
