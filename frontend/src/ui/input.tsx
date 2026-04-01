import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={className}>
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
        {description && <p className="text-xs text-zinc-500 mb-1">{description}</p>}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <i className={`far fa-${icon} text-zinc-400 text-sm`} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block w-full rounded-md border-0 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset transition-colors',
              'placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900',
              icon ? 'pl-9 pr-3' : 'px-3',
              error ? 'ring-red-300 focus:ring-red-500' : 'ring-zinc-300',
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600"><i className="far fa-circle-exclamation mr-1" />{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
