import clsx from 'clsx';
import { Link } from '@tanstack/react-router';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: { value: string; positive: boolean };
  href?: string;
}

export function StatCard({ label, value, icon, color = 'bg-blue-50 text-blue-600', trend, href }: StatCardProps) {
  const content = (
    <div className="flex items-center gap-4">
      <div className={clsx('rounded-lg p-3', color)}>
        <i className={`far fa-${icon} text-lg`} />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-zinc-900">{value}</p>
          {trend && (
            <span className={clsx('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              <i className={`far fa-arrow-${trend.positive ? 'up' : 'down'} mr-0.5`} />
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const classes = 'overflow-hidden rounded-xl bg-white px-5 py-5 ring-1 ring-zinc-900/5 shadow-sm hover:shadow-md transition-shadow';

  return href ? <Link to={href} className={classes}>{content}</Link> : <div className={classes}>{content}</div>;
}
