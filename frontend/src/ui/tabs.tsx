import clsx from 'clsx';

interface Tab {
  name: string;
  icon?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (name: string) => void;
  variant?: 'underline' | 'pills';
}

export function Tabs({ tabs, active, onChange, variant = 'underline' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onChange(tab.name)}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active === tab.name ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {tab.icon && <i className={`far fa-${tab.icon}`} />}
            {tab.name}
            {tab.count !== undefined && (
              <span className={clsx('ml-1 rounded-full px-1.5 py-0.5 text-xs', active === tab.name ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-200/50 text-zinc-500')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-200">
      <nav className="-mb-px flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onChange(tab.name)}
            className={clsx(
              'flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors',
              active === tab.name
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
            )}
          >
            {tab.icon && <i className={`far fa-${tab.icon}`} />}
            {tab.name}
            {tab.count !== undefined && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{tab.count}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
