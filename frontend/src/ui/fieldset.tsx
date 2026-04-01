import clsx from 'clsx';

interface FieldsetProps {
  legend?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Fieldset({ legend, description, children, className }: FieldsetProps) {
  return (
    <fieldset className={clsx('space-y-4', className)}>
      {legend && (
        <div className="border-b border-zinc-200 pb-3">
          <legend className="text-sm font-semibold text-zinc-900">{legend}</legend>
          {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
        </div>
      )}
      {children}
    </fieldset>
  );
}
