import clsx from 'clsx';

interface DataListItem {
  label: string;
  value: React.ReactNode;
  icon?: string;
}

interface DataListProps {
  items: DataListItem[];
  columns?: 1 | 2 | 3;
  variant?: 'default' | 'striped' | 'cards';
  className?: string;
}

export function DataList({ items, columns = 2, variant = 'default', className }: DataListProps) {
  if (variant === 'cards') {
    return (
      <dl className={clsx(`grid gap-4`, columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3', className)}>
        {items.map((item, i) => (
          <div key={i} className="bg-zinc-50 rounded-lg p-3">
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              {item.icon && <i className={`far fa-${item.icon} text-zinc-400`} />}
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={clsx('divide-y divide-zinc-100', className)}>
      {items.map((item, i) => (
        <div key={i} className={clsx('flex justify-between py-3 text-sm', variant === 'striped' && i % 2 === 1 && 'bg-zinc-50 -mx-3 px-3 rounded')}>
          <dt className="text-zinc-500 flex items-center gap-1.5">
            {item.icon && <i className={`far fa-${item.icon} text-zinc-400`} />}
            {item.label}
          </dt>
          <dd className="font-medium text-zinc-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
