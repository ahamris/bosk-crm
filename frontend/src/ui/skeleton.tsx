import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
  lines?: number;
}

export function Skeleton({ className, variant = 'text', width, height, lines = 1 }: SkeletonProps) {
  if (variant === 'circle') {
    return <div className={clsx('animate-pulse rounded-full bg-zinc-200', className)} style={{ width: width || '2.5rem', height: height || '2.5rem' }} />;
  }

  if (variant === 'rect') {
    return <div className={clsx('animate-pulse rounded-lg bg-zinc-200', className)} style={{ width: width || '100%', height: height || '8rem' }} />;
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse rounded bg-zinc-200 h-4" style={{ width: i === lines - 1 && lines > 1 ? '75%' : width || '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-900/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="2rem" height="2rem" />
        <Skeleton width="60%" />
      </div>
      <Skeleton lines={3} />
      <div className="flex gap-2">
        <Skeleton width="4rem" height="1.5rem" variant="rect" />
        <Skeleton width="5rem" height="1.5rem" variant="rect" />
      </div>
    </div>
  );
}
