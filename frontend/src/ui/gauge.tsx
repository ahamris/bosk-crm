import clsx from 'clsx';

interface GaugeProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = { sm: 64, md: 96, lg: 128 };
const strokeWidths = { sm: 6, md: 8, lg: 10 };

export function Gauge({ value, label, size = 'md', color = '#154273', className }: GaugeProps) {
  const dim = sizes[size];
  const sw = strokeWidths[size];
  const radius = (dim - sw) / 2;
  const circumference = radius * Math.PI; // half circle
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={clsx('inline-flex flex-col items-center', className)}>
      <svg width={dim} height={dim / 2 + sw} viewBox={`0 0 ${dim} ${dim / 2 + sw}`}>
        {/* Background arc */}
        <path
          d={`M ${sw / 2} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - sw / 2} ${dim / 2}`}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${sw / 2} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - sw / 2} ${dim / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Value text */}
        <text x={dim / 2} y={dim / 2 - 2} textAnchor="middle" className="text-lg font-bold fill-zinc-900" style={{ fontSize: dim / 4 }}>
          {clamped}
        </text>
      </svg>
      {label && <span className="text-xs text-zinc-500 -mt-1">{label}</span>}
    </div>
  );
}
