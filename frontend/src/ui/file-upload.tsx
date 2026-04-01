import { useRef, useState } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  onChange: (files: File[]) => void;
  className?: string;
}

export function FileUpload({ label, accept, multiple, maxSize = 10, onChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const valid = Array.from(fileList).filter((f) => f.size <= maxSize * 1024 * 1024);
    setFiles(valid);
    onChange(valid);
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-2">{label}</label>}
      <div
        className={clsx(
          'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
          dragOver ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <i className="far fa-cloud-arrow-up text-2xl text-zinc-400" />
        <p className="mt-2 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">Klik om te uploaden</span> of sleep bestanden hierheen
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {accept || 'Alle bestandstypes'} tot {maxSize}MB
        </p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-md">
              <i className="far fa-file text-zinc-400" />
              <span className="truncate flex-1">{f.name}</span>
              <span className="text-xs text-zinc-500">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); const n = files.filter((_, j) => j !== i); setFiles(n); onChange(n); }} className="text-zinc-400 hover:text-red-500">
                <i className="far fa-xmark" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
