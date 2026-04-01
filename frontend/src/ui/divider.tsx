import clsx from 'clsx';

interface DividerProps {
  label?: string;
  icon?: string;
  className?: string;
}

export function Divider({ label, icon, className }: DividerProps) {
  if (!label && !icon) return <hr className={clsx('border-zinc-200', className)} />;

  return (
    <div className={clsx('relative flex items-center', className)}>
      <div className="flex-grow border-t border-zinc-200" />
      <span className="mx-3 flex items-center gap-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {icon && <i className={`far fa-${icon}`} />}
        {label}
      </span>
      <div className="flex-grow border-t border-zinc-200" />
    </div>
  );
}
