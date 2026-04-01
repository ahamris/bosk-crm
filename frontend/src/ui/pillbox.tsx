import { useState, useMemo } from 'react';
import clsx from 'clsx';

interface PillboxOption {
  value: string;
  label: string;
  icon?: string;
}

interface PillboxProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: PillboxOption[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  max?: number;
  error?: string;
  className?: string;
}

export function Pillbox({ value, onChange, options, label, placeholder = 'Tags toevoegen...', searchable = true, max, error, className }: PillboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const available = useMemo(() => {
    return options
      .filter(o => !value.includes(o.value))
      .filter(o => !query || o.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, value, query]);

  const selectedOptions = options.filter(o => value.includes(o.value));
  const canAdd = !max || value.length < max;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <div className={clsx('rounded-md ring-1 ring-inset transition-colors', open ? 'ring-2 ring-zinc-900' : error ? 'ring-red-300' : 'ring-zinc-300')}>
        <div className="flex flex-wrap gap-1.5 p-2 min-h-[2.5rem]">
          {selectedOptions.map(o => (
            <span key={o.value} className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
              {o.icon && <i className={`far fa-${o.icon}`} />}
              {o.label}
              <button type="button" onClick={() => onChange(value.filter(v => v !== o.value))} className="text-zinc-400 hover:text-zinc-600 ml-0.5"><i className="far fa-xmark text-[10px]" /></button>
            </span>
          ))}
          {searchable && canAdd && (
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[8rem] border-0 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-0.5"
            />
          )}
        </div>
        {open && available.length > 0 && (
          <div className="border-t border-zinc-200 max-h-40 overflow-y-auto">
            {available.map(o => (
              <button key={o.value} type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange([...value, o.value]); setQuery(''); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                {o.icon && <i className={`far fa-${o.icon} text-zinc-400`} />}
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {max && <p className="mt-1 text-xs text-zinc-500">{value.length}/{max} geselecteerd</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
