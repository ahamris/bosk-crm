import { useState } from 'react';
import clsx from 'clsx';

interface ComposerProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
  submitIcon?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actionsLeading?: React.ReactNode;
  actionsTrailing?: React.ReactNode;
  className?: string;
}

export function Composer({ value: controlledValue, onChange, onSubmit, placeholder = 'Typ een bericht...', submitLabel = 'Verstuur', submitIcon = 'paper-plane', header, footer, actionsLeading, actionsTrailing, className }: ComposerProps) {
  const [internalValue, setInternalValue] = useState('');
  const val = controlledValue ?? internalValue;

  const handleChange = (v: string) => { setInternalValue(v); onChange?.(v); };
  const handleSubmit = () => { if (val.trim()) { onSubmit?.(val); setInternalValue(''); onChange?.(''); } };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  return (
    <div className={clsx('rounded-2xl ring-1 ring-zinc-200 bg-white overflow-hidden', className)}>
      {header && <div className="border-b border-zinc-100 px-4 py-2">{header}</div>}
      <div className="flex items-end gap-2 p-2">
        {actionsLeading && <div className="flex items-center gap-1 pb-1">{actionsLeading}</div>}
        <textarea
          value={val}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none border-0 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-2 px-2 min-h-[2.5rem] max-h-32"
          style={{ height: 'auto', overflow: 'hidden' }}
          onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
        />
        <div className="flex items-center gap-1 pb-1">
          {actionsTrailing}
          <button type="button" onClick={handleSubmit} disabled={!val.trim()}
            className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', val.trim() ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed')}>
            <i className={`far fa-${submitIcon}`} />
            {submitLabel}
          </button>
        </div>
      </div>
      {footer && <div className="border-t border-zinc-100 px-4 py-2">{footer}</div>}
    </div>
  );
}
