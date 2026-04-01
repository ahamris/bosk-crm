import clsx from 'clsx';

const sizeClasses = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };

interface AvatarProps {
  name?: string;
  src?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({ name, src, size = 'md', className, status }: AvatarProps) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const statusColors = { online: 'bg-emerald-500', offline: 'bg-zinc-400', busy: 'bg-red-500', away: 'bg-amber-500' };

  return (
    <div className={clsx('relative inline-flex', className)}>
      {src ? (
        <img src={src} alt={name || ''} className={clsx('rounded-full object-cover ring-1 ring-zinc-200', sizeClasses[size])} />
      ) : (
        <div className={clsx('flex items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-600 ring-1 ring-zinc-200', sizeClasses[size])}>
          {initials}
        </div>
      )}
      {status && (
        <span className={clsx('absolute bottom-0 right-0 block rounded-full ring-2 ring-white', statusColors[status], size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3')} />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: { name?: string; src?: string }[];
  max?: number;
  size?: keyof typeof sizeClasses;
}

export function AvatarGroup({ avatars, max = 5, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((a, i) => <Avatar key={i} {...a} size={size} className="ring-2 ring-white" />)}
      {overflow > 0 && (
        <div className={clsx('flex items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 ring-2 ring-white', sizeClasses[size])}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
