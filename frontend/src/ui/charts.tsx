import {
  BarChart as RBarChart, Bar,
  LineChart as RLineChart, Line,
  PieChart as RPieChart, Pie, Cell,
  AreaChart as RAreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#154273', '#01689B', '#39870C', '#E17000', '#D52B1E', '#42145F', '#0D9488', '#7C3AED'];

interface ChartProps {
  data: Record<string, unknown>[];
  height?: number;
  className?: string;
}

interface BarChartProps extends ChartProps {
  xKey: string;
  bars: { key: string; color?: string; name?: string }[];
}

export function BarChart({ data, xKey, bars, height = 300, className }: BarChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          {bars.map((bar, i) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name || bar.key} fill={bar.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartProps extends ChartProps {
  xKey: string;
  lines: { key: string; color?: string; name?: string }[];
}

export function LineChart({ data, xKey, lines, height = 300, className }: LineChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
          <Legend />
          {lines.map((line, i) => (
            <Line key={line.key} type="monotone" dataKey={line.key} name={line.name || line.key} stroke={line.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps extends ChartProps {
  nameKey: string;
  valueKey: string;
}

export function PieChart({ data, nameKey, valueKey, height = 300, className }: PieChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100} label labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartProps extends ChartProps {
  xKey: string;
  areas: { key: string; color?: string; name?: string }[];
}

export function AreaChart({ data, xKey, areas, height = 300, className }: AreaChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
          {areas.map((area, i) => (
            <Area key={area.key} type="monotone" dataKey={area.key} name={area.name || area.key} stroke={area.color || COLORS[i % COLORS.length]} fill={area.color || COLORS[i % COLORS.length]} fillOpacity={0.15} />
          ))}
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
