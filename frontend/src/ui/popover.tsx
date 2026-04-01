import { Fragment } from 'react';
import { Popover as HPopover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function Popover({ trigger, children, align = 'left', className }: PopoverProps) {
  return (
    <HPopover className={clsx('relative', className)}>
      <PopoverButton as={Fragment}>{trigger}</PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className={clsx(
          'absolute z-20 mt-2 w-72 rounded-xl bg-white p-4 shadow-lg ring-1 ring-zinc-900/5',
          align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
        )}>
          {children}
        </PopoverPanel>
      </Transition>
    </HPopover>
  );
}
