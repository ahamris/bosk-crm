import { Fragment } from 'react';
import { Dialog as HDialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import clsx from 'clsx';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

export function Sheet({ open, onClose, title, description, children, side = 'right', size = 'md' }: SheetProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HDialog onClose={onClose} className="relative z-50">
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-zinc-900/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-hidden">
          <div className={clsx('fixed inset-y-0 flex', side === 'right' ? 'right-0' : 'left-0')}>
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
            >
              <DialogPanel className={clsx('w-screen', sizeClasses[size])}>
                <div className="flex h-full flex-col bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div>
                      {title && <DialogTitle className="text-lg font-semibold text-zinc-900">{title}</DialogTitle>}
                      {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                      <i className="far fa-xmark text-lg" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </HDialog>
    </Transition>
  );
}
