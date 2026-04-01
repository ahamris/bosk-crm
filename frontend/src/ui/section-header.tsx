import clsx from 'clsx';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  border?: boolean;
  className?: string;
}

/**
 * Section header — scheidt content blokken binnen een pagina
 * Moneybird-style: "Voor accountants, boekhouders en Moneybird Experts"
 */
export function SectionHeader({ title, description, icon, actions, border = true, className }: SectionHeaderProps) {
  return (
    <div className={clsx(
      'flex items-center justify-between py-4 mt-6 mb-4',
      border && 'border-b border-zinc-200',
      className,
    )}>
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
          {icon && <i className={`far fa-${icon} text-zinc-400`} />}
          {title}
        </h3>
        {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
