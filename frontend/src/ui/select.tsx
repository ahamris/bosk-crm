import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, description, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={className}>
        {label && <label htmlFor={selectId} className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
        {description && <p className="text-xs text-zinc-500 mb-1">{description}</p>}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'block w-full rounded-md border-0 py-2 px-3 text-sm text-zinc-900 shadow-sm ring-1 ring-inset transition-colors',
            'focus:ring-2 focus:ring-inset focus:ring-zinc-900',
            error ? 'ring-red-300' : 'ring-zinc-300',
          )}
          {...props}
        >
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
