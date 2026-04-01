import clsx from 'clsx';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  return (
    <label className={clsx('flex items-start gap-3 cursor-pointer group', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div className="flex h-6 items-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={clsx(
            'h-4 w-4 rounded border transition-colors flex items-center justify-center',
            checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white group-hover:border-zinc-400',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900',
          )}
        >
          {checked && <i className="fas fa-check text-white text-[0.55rem]" />}
        </button>
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-zinc-900">{label}</p>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
