import clsx from 'clsx';

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function Progress({ value, label, showValue, size = 'md', color = 'bg-zinc-900', className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-zinc-700">{label}</span>}
          {showValue && <span className="text-sm text-zinc-500">{clamped}%</span>}
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-zinc-100 overflow-hidden', heights[size])} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className={clsx('h-full rounded-full transition-all duration-300 ease-out', color)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
