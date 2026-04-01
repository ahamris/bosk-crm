import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface DropdownItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  href?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Fragment}>{trigger}</MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className={clsx(
          'absolute z-10 mt-2 w-48 origin-top rounded-lg bg-white shadow-lg ring-1 ring-zinc-900/5 focus:outline-none py-1',
          align === 'right' ? 'right-0' : 'left-0',
        )}>
          {items.map((item, i) => (
            <MenuItem key={i}>
              {({ focus }) => (
                <button
                  onClick={item.onClick}
                  className={clsx(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                    focus && 'bg-zinc-50',
                    item.danger ? 'text-red-600' : 'text-zinc-700',
                  )}
                >
                  {item.icon && <i className={`far fa-${item.icon} w-4 text-center`} />}
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
