import clsx from 'clsx';

interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: string;
  iconColor?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={clsx('flow-root', className)}>
      <ul className="-mb-8">
        {items.map((item, i) => (
          <li key={i}>
            <div className="relative pb-8">
              {i !== items.length - 1 && <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-zinc-200" />}
              <div className="relative flex items-start gap-3">
                <div className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white',
                  item.iconColor || 'bg-zinc-100',
                )}>
                  <i className={clsx('far fa-' + (item.icon || 'circle'), 'text-sm', item.iconColor ? 'text-white' : 'text-zinc-500')} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                  {item.description && <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>}
                  {item.time && <p className="mt-1 text-xs text-zinc-400">{item.time}</p>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
