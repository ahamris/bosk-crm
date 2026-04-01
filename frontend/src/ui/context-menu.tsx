import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  separator?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setPos(null);
    if (pos) { document.addEventListener('click', close); document.addEventListener('scroll', close); }
    return () => { document.removeEventListener('click', close); document.removeEventListener('scroll', close); };
  }, [pos]);

  return (
    <div className={className} ref={ref}
      onContextMenu={(e) => { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); }}>
      {children}
      {pos && (
        <div className="fixed z-50 min-w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-zinc-900/5 animate-in fade-in-0 zoom-in-95 duration-100" style={{ left: pos.x, top: pos.y }}>
          {items.map((item, i) => {
            if (item.separator) return <div key={i} className="my-1 border-t border-zinc-100" />;
            return (
              <button key={i} onClick={() => { item.onClick?.(); setPos(null); }}
                className={clsx('flex w-full items-center justify-between gap-8 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50', item.danger ? 'text-red-600' : 'text-zinc-700')}>
                <span className="flex items-center gap-2">
                  {item.icon && <i className={`far fa-${item.icon} w-4 text-center text-zinc-400`} />}
                  {item.label}
                </span>
                {item.shortcut && <kbd className="text-[10px] text-zinc-400">{item.shortcut}</kbd>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
