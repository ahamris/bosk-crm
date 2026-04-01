import clsx from 'clsx';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
}

interface KanbanProps {
  columns: KanbanColumn[];
  onCardClick?: (cardId: string, columnId: string) => void;
  className?: string;
}

export function Kanban({ columns, onCardClick, className }: KanbanProps) {
  return (
    <div className={clsx('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map(col => (
        <div key={col.id} className="w-80 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              {col.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />}
              {col.title}
            </h3>
            <span className="text-xs text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">{col.cards.length}</span>
          </div>
          <div className="space-y-2 rounded-xl bg-zinc-100 p-2 min-h-[12rem]">
            {col.cards.map(card => (
              <div key={card.id} onClick={() => onCardClick?.(card.id, col.id)}
                className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-zinc-900/5 cursor-pointer hover:shadow-md transition-shadow">
                {card.badge && (
                  <span className={clsx('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset mb-2', card.badgeColor || 'bg-zinc-100 text-zinc-600 ring-zinc-500/20')}>
                    {card.badge}
                  </span>
                )}
                <p className="text-sm font-medium text-zinc-900">{card.title}</p>
                {card.description && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{card.description}</p>}
                {card.avatar && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 font-medium">{card.avatar.charAt(0)}</div>
                    <span className="text-xs text-zinc-500">{card.avatar}</span>
                  </div>
                )}
              </div>
            ))}
            {col.cards.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-zinc-400">Geen items</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
