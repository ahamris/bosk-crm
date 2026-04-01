import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
  secondary: 'bg-white text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 shadow-sm',
  outline: 'bg-transparent text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
};

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-2.5 py-1.5 text-sm gap-1.5',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-base gap-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: string;
  iconStyle?: 'solid' | 'regular' | 'light';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconStyle = 'regular', loading, className, children, disabled, ...props }, ref) => {
    const prefix = iconStyle === 'solid' ? 'fas' : iconStyle === 'light' ? 'fal' : 'far';
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? <i className="far fa-spinner-third fa-spin" /> : icon && <i className={`${prefix} fa-${icon}`} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
