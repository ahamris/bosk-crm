import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import clsx from 'clsx';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
  icon?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={clsx('divide-y divide-zinc-200 rounded-xl ring-1 ring-zinc-200 overflow-hidden', className)}>
      {items.map((item, i) => (
        <Disclosure key={i} defaultOpen={item.defaultOpen}>
          {({ open }) => (
            <div className={clsx(item.disabled && 'opacity-50')}>
              <DisclosureButton disabled={item.disabled}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors">
                <span className="flex items-center gap-2">
                  {item.icon && <i className={`far fa-${item.icon} text-zinc-400`} />}
                  {item.title}
                </span>
                <i className={clsx('far fa-chevron-down text-xs text-zinc-400 transition-transform duration-200', open && 'rotate-180')} />
              </DisclosureButton>
              <DisclosurePanel className="px-4 pb-4 pt-1 text-sm text-zinc-600">
                {item.content}
              </DisclosurePanel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
