import { Fragment } from 'react';
import { Dialog as HDialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
}

/**
 * Moneybird-style keyboard shortcuts overlay
 * Triggered by "?" key
 */
export function KeyboardShortcuts({ open, onClose, groups }: KeyboardShortcutsProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HDialog onClose={onClose} className="relative z-50">
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-zinc-900/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="mx-auto max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-zinc-900/5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-zinc-900">Sneltoetsen</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><i className="far fa-xmark" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                {groups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{group.title}</h3>
                    <dl className="space-y-2">
                      {group.shortcuts.map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <dt className="text-sm text-zinc-600">{shortcut.description}</dt>
                          <dd className="flex items-center gap-1">
                            {shortcut.keys.map((key, j) => (
                              <Fragment key={j}>
                                {j > 0 && <span className="text-xs text-zinc-400">+</span>}
                                <kbd className="inline-flex items-center rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs font-medium text-zinc-500 font-mono min-w-[1.5rem] justify-center">
                                  {key}
                                </kbd>
                              </Fragment>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </HDialog>
    </Transition>
  );
}
