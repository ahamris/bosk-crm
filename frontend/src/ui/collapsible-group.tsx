import { useState } from 'react';
import clsx from 'clsx';

interface CollapsibleGroupProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Collapsible navigation/content group
 * Used in sidebar for expandable sections
 */
export function CollapsibleGroup({ title, icon, defaultOpen = true, count, children, className }: CollapsibleGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {icon && <i className={`far fa-${icon}`} />}
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-500">{count}</span>
          )}
        </span>
        <i className={clsx('far fa-chevron-down text-[10px] transition-transform duration-200', !open && '-rotate-90')} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
