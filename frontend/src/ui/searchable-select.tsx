import { useState, useMemo } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  error?: string;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, label, placeholder = 'Selecteer...', searchable = true, clearable, error, className }: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const selected = options.find(o => o.value === value);

  const filtered = useMemo(() => {
    if (!query) return options;
    return options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <Listbox value={value} onChange={(v) => onChange?.(v)}>
        <div className="relative">
          <ListboxButton className={clsx('relative w-full cursor-pointer rounded-md border-0 py-2 pl-3 pr-10 text-left text-sm shadow-sm ring-1 ring-inset transition-colors', error ? 'ring-red-300' : 'ring-zinc-300 focus:ring-2 focus:ring-zinc-900', selected ? 'text-zinc-900' : 'text-zinc-400')}>
            <span className="flex items-center gap-2 truncate">
              {selected?.icon && <i className={`far fa-${selected.icon} text-zinc-400`} />}
              {selected?.label || placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              {clearable && value && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onChange?.(''); }} className="text-zinc-400 hover:text-zinc-600"><i className="far fa-xmark text-xs" /></button>
              )}
              <i className="far fa-chevron-down text-xs text-zinc-400" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-zinc-900/5">
            {searchable && (
              <div className="sticky top-0 bg-white px-3 py-2 border-b border-zinc-100">
                <div className="relative">
                  <i className="far fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek..."
                    className="w-full border-0 bg-zinc-50 rounded-md py-1.5 pl-8 pr-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900" />
                </div>
              </div>
            )}
            {filtered.length === 0 && <div className="px-3 py-3 text-sm text-zinc-500 text-center">Geen resultaten</div>}
            {filtered.map(o => (
              <ListboxOption key={o.value} value={o.value}
                className={({ focus }) => clsx('flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors', focus ? 'bg-zinc-50' : '')}>
                {({ selected: sel }) => (
                  <>
                    {o.icon && <i className={`far fa-${o.icon} w-4 text-center text-zinc-400`} />}
                    <div className="flex-1 min-w-0">
                      <span className={clsx('block truncate', sel && 'font-medium')}>{o.label}</span>
                      {o.description && <span className="block text-xs text-zinc-500">{o.description}</span>}
                    </div>
                    {sel && <i className="far fa-check text-xs text-zinc-600" />}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
