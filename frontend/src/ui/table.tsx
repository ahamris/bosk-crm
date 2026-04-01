import clsx from 'clsx';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('overflow-hidden rounded-xl bg-white ring-1 ring-zinc-900/5 shadow-sm', className)}>
      <table className="min-w-full divide-y divide-zinc-200">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-zinc-50">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function TableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr className={clsx('hover:bg-zinc-50 transition-colors', onClick && 'cursor-pointer', className)} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, align }: { children: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }) {
  return (
    <th className={clsx('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500', align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, align }: { children: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }) {
  return (
    <td className={clsx('px-4 py-3 text-sm', align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left', className)}>
      {children}
    </td>
  );
}
