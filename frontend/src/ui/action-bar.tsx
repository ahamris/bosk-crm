import clsx from 'clsx';

interface ActionBarProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode; // right-side actions
  className?: string;
}

/**
 * Moneybird-style action bar — pagina titel met acties rechts
 * Consistente header boven elke pagina
 */
export function ActionBar({ title, subtitle, icon, children, className }: ActionBarProps) {
  return (
    <div className={clsx('sm:flex sm:items-center sm:justify-between mb-8', className)}>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2.5">
          {icon && <i className={`far fa-${icon} text-zinc-400 text-xl`} />}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
