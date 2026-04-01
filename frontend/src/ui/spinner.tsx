import clsx from 'clsx';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={clsx('inline-flex items-center gap-2', className)} role="status">
      <div className={clsx('animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900', sizes[size])} />
      {label && <span className="text-sm text-zinc-500">{label}</span>}
      <span className="sr-only">Laden...</span>
    </div>
  );
}
