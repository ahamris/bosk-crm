import clsx from 'clsx';

const colors = {
  zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

interface BadgeProps {
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
  icon?: string;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ color = 'zinc', size = 'md', icon, dot, children, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-md font-medium ring-1 ring-inset', colors[color], sizes[size], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-500' : color === 'amber' ? 'bg-amber-500' : 'bg-zinc-500')} />}
      {icon && <i className={`far fa-${icon} text-[0.65rem]`} />}
      {children}
    </span>
  );
}
