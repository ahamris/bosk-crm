import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={className}>
        {label && <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'block w-full rounded-md border-0 py-2 px-3 text-sm text-zinc-900 shadow-sm ring-1 ring-inset transition-colors',
            'placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900',
            error ? 'ring-red-300' : 'ring-zinc-300',
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
