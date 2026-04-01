import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export function Card({ children, className, padding = true, hover }: CardProps) {
  return (
    <div className={clsx('rounded-xl bg-white ring-1 ring-zinc-900/5 shadow-sm', hover && 'hover:shadow-md transition-shadow', padding && 'p-6', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('pb-4 border-b border-zinc-100', className)}>{children}</div>;
}

export function CardTitle({ children, icon, className }: { children: React.ReactNode; icon?: string; className?: string }) {
  return (
    <h3 className={clsx('text-sm font-semibold text-zinc-900 flex items-center gap-2', className)}>
      {icon && <i className={`far fa-${icon} text-zinc-400`} />}
      {children}
    </h3>
  );
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-zinc-500">{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('pt-4', className)}>{children}</div>;
}
