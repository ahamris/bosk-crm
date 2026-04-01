import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import clsx from 'clsx';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

const tools = [
  { cmd: 'toggleBold', icon: 'fa-bold', label: 'Vet', mark: 'bold' },
  { cmd: 'toggleItalic', icon: 'fa-italic', label: 'Cursief', mark: 'italic' },
  { cmd: 'toggleUnderline', icon: 'fa-underline', label: 'Onderstrepen', mark: 'underline' },
  { cmd: 'toggleStrike', icon: 'fa-strikethrough', label: 'Doorhalen', mark: 'strike' },
  { sep: true },
  { cmd: 'toggleHeading', icon: 'fa-heading', label: 'Kop', mark: 'heading', attrs: { level: 2 } },
  { cmd: 'toggleBulletList', icon: 'fa-list-ul', label: 'Opsomming', mark: 'bulletList' },
  { cmd: 'toggleOrderedList', icon: 'fa-list-ol', label: 'Genummerd', mark: 'orderedList' },
  { cmd: 'toggleBlockquote', icon: 'fa-quote-left', label: 'Citaat', mark: 'blockquote' },
  { sep: true },
  { cmd: 'toggleHighlight', icon: 'fa-highlighter', label: 'Markeren', mark: 'highlight' },
  { cmd: 'toggleCode', icon: 'fa-code', label: 'Code', mark: 'code' },
  { sep: true },
  { cmd: 'undo', icon: 'fa-rotate-left', label: 'Ongedaan' },
  { cmd: 'redo', icon: 'fa-rotate-right', label: 'Opnieuw' },
];

export function RichTextEditor({ value, onChange, label, placeholder = 'Begin met schrijven...', error, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className={clsx('rounded-xl ring-1 ring-inset overflow-hidden', error ? 'ring-red-300' : 'ring-zinc-300', className)}>
      {label && <label className="block text-sm font-medium text-zinc-700 px-3 pt-3 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-0.5 border-b border-zinc-200 px-2 py-1.5 bg-zinc-50">
        {tools.map((t, i) => {
          if ('sep' in t) return <div key={`sep-${i}`} className="w-px h-5 bg-zinc-200 mx-1" />;
          const isActive = t.mark && editor.isActive(t.mark, t.attrs);
          return (
            <button key={t.cmd} type="button" title={t.label}
              onClick={() => {
                const chain = editor.chain().focus();
                if (t.attrs) (chain as unknown as Record<string, (a: unknown) => unknown>)[t.cmd!](t.attrs);
                else (chain as unknown as Record<string, () => unknown>)[t.cmd!]();
                chain.run();
              }}
              className={clsx('h-7 w-7 rounded flex items-center justify-center text-xs transition-colors', isActive ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700')}>
              <i className={`far ${t.icon}`} />
            </button>
          );
        })}
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none px-3 py-2 min-h-[8rem] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0" />
      {error && <p className="px-3 pb-2 text-xs text-red-600"><i className="far fa-circle-exclamation mr-1" />{error}</p>}
    </div>
  );
}
