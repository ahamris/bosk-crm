import clsx from 'clsx';

const presets = [
  { name: 'NORA Blauw', value: '#154273' },
  { name: 'Rood', value: '#DC2626' },
  { name: 'Oranje', value: '#EA580C' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Geel', value: '#CA8A04' },
  { name: 'Lime', value: '#65A30D' },
  { name: 'Groen', value: '#16A34A' },
  { name: 'Smaragd', value: '#059669' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Cyaan', value: '#0891B2' },
  { name: 'Sky', value: '#0284C7' },
  { name: 'Blauw', value: '#2563EB' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Paars', value: '#9333EA' },
  { name: 'Fuchsia', value: '#C026D3' },
  { name: 'Roze', value: '#DB2777' },
  { name: 'Rose', value: '#E11D48' },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showPresets?: boolean;
  showInput?: boolean;
  className?: string;
}

export function ColorPicker({ value, onChange, label, showPresets = true, showInput = true, className }: ColorPickerProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-2">{label}</label>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border-0 p-0.5 bg-white ring-1 ring-inset ring-zinc-300"
        />
        {showInput && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-28 rounded-md border-0 py-1.5 px-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-300 font-mono focus:ring-2 focus:ring-zinc-900"
          />
        )}
      </div>
      {showPresets && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {presets.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => onChange(c.value)}
              className={clsx(
                'h-6 w-6 rounded-full ring-1 ring-inset ring-zinc-200 hover:ring-zinc-400 transition-all',
                value === c.value && 'ring-2 ring-offset-2 ring-zinc-900',
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
