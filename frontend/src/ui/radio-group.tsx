import { RadioGroup as HRadioGroup, Radio, Field, Label, Description } from '@headlessui/react';
import clsx from 'clsx';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  variant?: 'list' | 'cards';
  className?: string;
}

export function RadioGroup({ value, onChange, options, label, variant = 'list', className }: RadioGroupProps) {
  return (
    <HRadioGroup value={value} onChange={onChange} className={className}>
      {label && <Label className="block text-sm font-medium text-zinc-700 mb-3">{label}</Label>}
      <div className={clsx(variant === 'cards' ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : 'space-y-2')}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value} as="div">
            {({ checked, focus }) => (
              <Field className={clsx(
                'relative flex cursor-pointer rounded-lg border p-4 transition-all',
                checked ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-zinc-200 bg-white hover:border-zinc-300',
                focus && 'outline-2 outline-offset-2 outline-zinc-900',
              )}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.icon && <i className={clsx('far fa-' + option.icon, checked ? 'text-zinc-900' : 'text-zinc-400')} />}
                    <div>
                      <Label as="span" className={clsx('text-sm font-medium', checked ? 'text-zinc-900' : 'text-zinc-700')}>
                        {option.label}
                      </Label>
                      {option.description && (
                        <Description as="span" className="block text-xs text-zinc-500 mt-0.5">
                          {option.description}
                        </Description>
                      )}
                    </div>
                  </div>
                  <div className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                    checked ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300 bg-white',
                  )}>
                    {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </Field>
            )}
          </Radio>
        ))}
      </div>
    </HRadioGroup>
  );
}
