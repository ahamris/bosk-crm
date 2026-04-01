import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import clsx from 'clsx';

interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  unavailable?: Date[];
  weekNumbers?: boolean;
  className?: string;
}

export function Calendar({ value, onChange, unavailable = [], weekNumbers, className }: CalendarProps) {
  const [viewing, setViewing] = useState(value ?? new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewing), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewing), { weekStartsOn: 1 });
    const result: Date[] = [];
    let d = start;
    while (d <= end) { result.push(d); d = addDays(d, 1); }
    return result;
  }, [viewing]);

  const isUnavailable = (d: Date) => unavailable.some(u => isSameDay(u, d));

  return (
    <div className={clsx('w-72', className)}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setViewing(subMonths(viewing, 1))} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"><i className="far fa-chevron-left text-xs" /></button>
        <span className="text-sm font-semibold text-zinc-900 capitalize">{format(viewing, 'MMMM yyyy', { locale: nl })}</span>
        <button type="button" onClick={() => setViewing(addMonths(viewing, 1))} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"><i className="far fa-chevron-right text-xs" /></button>
      </div>
      <div className={clsx('grid gap-px', weekNumbers ? 'grid-cols-8' : 'grid-cols-7')}>
        {weekNumbers && <div className="text-[10px] text-zinc-400 text-center py-1.5">#</div>}
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (
          <div key={d} className="text-[10px] font-medium text-zinc-400 text-center py-1.5">{d}</div>
        ))}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, viewing);
          const selected = value && isSameDay(day, value);
          const today = isToday(day);
          const disabled = isUnavailable(day);
          const showWeek = weekNumbers && i % 7 === 0;

          return (
            <>{showWeek && <div className="text-[10px] text-zinc-400 text-center py-1.5">{format(day, 'w')}</div>}
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange?.(day)}
              className={clsx(
                'h-8 w-8 rounded-md text-sm transition-colors mx-auto flex items-center justify-center',
                selected && 'bg-zinc-900 text-white font-medium',
                !selected && today && 'bg-zinc-100 font-medium text-zinc-900',
                !selected && !today && inMonth && 'text-zinc-700 hover:bg-zinc-100',
                !inMonth && 'text-zinc-300',
                disabled && 'opacity-30 cursor-not-allowed line-through',
              )}
            >
              {format(day, 'd')}
            </button></>
          );
        })}
      </div>
    </div>
  );
}
