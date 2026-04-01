import { Fragment, useState, useEffect, useMemo } from 'react';
import { Dialog as HDialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

interface CommandItem {
  id: string;
  label: string;
  icon?: string;
  group?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({ open, onClose, items, placeholder = 'Zoek commando...' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => { if (open) setQuery(''); }, [open]);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  const groups = useMemo(() => {
    const g: Record<string, CommandItem[]> = {};
    filtered.forEach((i) => { const k = i.group || 'Acties'; (g[k] ??= []).push(i); });
    return g;
  }, [filtered]);

  return (
    <Transition show={open} as={Fragment}>
      <HDialog onClose={onClose} className="relative z-50">
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-zinc-900/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="mx-auto max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-zinc-900/5 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
                <i className="far fa-magnifying-glass text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="h-12 w-full border-0 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <kbd className="text-xs text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(groups).map(([group, groupItems]) => (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{group}</div>
                    {groupItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { item.onSelect(); onClose(); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        {item.icon && <i className={`far fa-${item.icon} w-5 text-center text-zinc-400`} />}
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">Geen resultaten voor "{query}"</div>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </HDialog>
    </Transition>
  );
}
