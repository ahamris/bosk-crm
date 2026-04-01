import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar } from './calendar';
import clsx from 'clsx';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  error?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, placeholder = 'Selecteer datum', clearable, error, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={clsx('relative', className)} ref={ref}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <button type="button" onClick={() => setOpen(!open)}
        className={clsx(
          'flex w-full items-center gap-2 rounded-md border-0 py-2 px-3 text-sm shadow-sm ring-1 ring-inset transition-colors text-left',
          error ? 'ring-red-300' : 'ring-zinc-300 focus:ring-2 focus:ring-zinc-900',
          value ? 'text-zinc-900' : 'text-zinc-400',
        )}>
        <i className="far fa-calendar text-zinc-400" />
        <span className="flex-1">{value ? format(value, 'd MMMM yyyy', { locale: nl }) : placeholder}</span>
        {clearable && value && (
          <span onClick={(e) => { e.stopPropagation(); onChange?.(null); }} className="text-zinc-400 hover:text-zinc-600"><i className="far fa-xmark text-xs" /></span>
        )}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 rounded-xl bg-white p-3 shadow-lg ring-1 ring-zinc-900/5">
          <Calendar value={value} onChange={(d) => { onChange?.(d); setOpen(false); }} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600"><i className="far fa-circle-exclamation mr-1" />{error}</p>}
    </div>
  );
}
