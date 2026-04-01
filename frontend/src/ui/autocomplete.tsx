import { useState, useMemo } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import clsx from 'clsx';

interface AutocompleteOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface AutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  options: AutocompleteOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: string;
  allowCustom?: boolean;
  className?: string;
}

export function Autocomplete({ value, onChange, options, label, placeholder = 'Zoek...', error, icon, allowCustom, className }: AutocompleteProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return options;
    return options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <Combobox value={value} onChange={(v) => onChange?.(v ?? '')} immediate>
        <div className="relative">
          {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><i className={`far fa-${icon} text-zinc-400 text-sm`} /></div>}
          <ComboboxInput
            onChange={(e) => { setQuery(e.target.value); if (allowCustom) onChange?.(e.target.value); }}
            displayValue={(v: string) => options.find(o => o.value === v)?.label ?? v}
            placeholder={placeholder}
            className={clsx('block w-full rounded-md border-0 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900', icon ? 'pl-9 pr-3' : 'px-3', error && 'ring-red-300')}
          />
          <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-zinc-900/5">
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-zinc-500">Geen resultaten</div>}
            {filtered.map(o => (
              <ComboboxOption key={o.value} value={o.value}
                className={({ focus }) => clsx('flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors', focus ? 'bg-zinc-50' : '')}>
                {({ selected }) => (
                  <>
                    {o.icon && <i className={`far fa-${o.icon} w-4 text-center text-zinc-400`} />}
                    <div className="flex-1 min-w-0">
                      <span className={clsx('block truncate', selected && 'font-medium')}>{o.label}</span>
                      {o.description && <span className="block text-xs text-zinc-500 truncate">{o.description}</span>}
                    </div>
                    {selected && <i className="far fa-check text-zinc-600 text-xs" />}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
