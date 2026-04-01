import { Sparkline } from './sparkline';
import clsx from 'clsx';

interface MiniChartProps {
  label: string;
  value: string | number;
  data: number[];
  trend?: { value: string; positive: boolean };
  color?: string;
  className?: string;
}

export function MiniChart({ label, value, data, trend, color = '#154273', className }: MiniChartProps) {
  return (
    <div className={clsx('flex items-center justify-between gap-4', className)}>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold text-zinc-900">{value}</p>
          {trend && (
            <span className={clsx('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              <i className={`far fa-arrow-${trend.positive ? 'up' : 'down'} mr-0.5`} />
              {trend.value}
            </span>
          )}
        </div>
      </div>
      <Sparkline data={data} color={color} height={28} width={80} />
    </div>
  );
}
