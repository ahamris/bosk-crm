import { useState, useEffect } from 'react';
import clsx from 'clsx';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeSwitcherProps {
  className?: string;
}

/**
 * Moneybird-style theme switcher — Light / Dark / Auto
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('oc-theme') as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('oc-theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
  }, [theme]);

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Licht', icon: 'sun-bright' },
    { value: 'dark', label: 'Donker', icon: 'moon' },
    { value: 'auto', label: 'Systeem', icon: 'desktop' },
  ];

  return (
    <div className={clsx('flex gap-1 rounded-lg bg-zinc-100 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={clsx(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            theme === opt.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700',
          )}
        >
          <i className={`far fa-${opt.icon}`} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
