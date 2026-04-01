import clsx from 'clsx';

interface CodeProps {
  children: string;
  language?: string;
  className?: string;
}

export function Code({ children, language, className }: CodeProps) {
  return (
    <div className={clsx('relative rounded-xl bg-zinc-950 text-zinc-100 overflow-hidden', className)}>
      {language && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <span className="text-xs text-zinc-500">{language}</span>
          <button
            onClick={() => navigator.clipboard.writeText(children)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <i className="far fa-copy" /> Kopieer
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-800 ring-1 ring-inset ring-zinc-200">
      {children}
    </code>
  );
}
