import { useState } from 'react';

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  marks?: { value: number; label: string }[];
  className?: string;
}

export function Slider({ value: controlledValue, onChange, min = 0, max = 100, step = 1, label, showValue = true, marks, className }: SliderProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? min);
  const value = controlledValue ?? internalValue;
  const percent = ((value - min) / (max - min)) * 100;

  const handleChange = (v: number) => {
    setInternalValue(v);
    onChange?.(v);
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
          {showValue && <span className="text-sm font-medium text-zinc-900 tabular-nums">{value}</span>}
        </div>
      )}
      <div className="relative pt-1">
        <div className="relative h-2 rounded-full bg-zinc-200">
          <div className="absolute h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${percent}%` }} />
          <input
            type="range"
            min={min} max={max} step={step} value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white shadow-md ring-2 ring-zinc-900 transition-all pointer-events-none" style={{ left: `${percent}%` }} />
        </div>
        {marks && (
          <div className="relative mt-2">
            {marks.map(m => (
              <span key={m.value} className="absolute text-[10px] text-zinc-500 -translate-x-1/2" style={{ left: `${((m.value - min) / (max - min)) * 100}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
