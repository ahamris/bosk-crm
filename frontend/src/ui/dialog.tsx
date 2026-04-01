import { Fragment } from 'react';
import { Dialog as HDialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HDialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl ring-1 ring-zinc-900/5">
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </HDialog>
    </Transition>
  );
}

export function DialogHeader({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
      {icon && <i className={`far fa-${icon} text-zinc-400`} />}
      {children}
    </DialogTitle>
  );
}

export function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}
