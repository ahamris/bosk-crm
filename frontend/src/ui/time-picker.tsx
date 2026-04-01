import { useState, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';

interface TimePickerProps {
  value?: string; // "HH:mm"
  onChange?: (time: string) => void;
  label?: string;
  placeholder?: string;
  step?: number; // minutes between options (default 30)
  unavailable?: string[];
  clearable?: boolean;
  error?: string;
  className?: string;
}

export function TimePicker({ value, onChange, label, placeholder = 'Selecteer tijd', step = 30, unavailable = [], clearable, error, className }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = useMemo(() => {
    const result: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += step) {
        result.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return result;
  }, [step]);

  return (
    <div className={clsx('relative', className)} ref={ref}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <button type="button" onClick={() => setOpen(!open)}
        className={clsx('flex w-full items-center gap-2 rounded-md border-0 py-2 px-3 text-sm shadow-sm ring-1 ring-inset transition-colors text-left', error ? 'ring-red-300' : 'ring-zinc-300', value ? 'text-zinc-900' : 'text-zinc-400')}>
        <i className="far fa-clock text-zinc-400" />
        <span className="flex-1">{value || placeholder}</span>
        {clearable && value && <span onClick={(e) => { e.stopPropagation(); onChange?.(''); }} className="text-zinc-400 hover:text-zinc-600"><i className="far fa-xmark text-xs" /></span>}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-zinc-900/5">
          {options.map(t => {
            const disabled = unavailable.includes(t);
            return (
              <button key={t} type="button" disabled={disabled}
                onClick={() => { onChange?.(t); setOpen(false); }}
                className={clsx('flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors', value === t ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-700 hover:bg-zinc-50', disabled && 'opacity-30 cursor-not-allowed')}>
                {t}
                {value === t && <i className="far fa-check text-xs text-zinc-600" />}
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
