import { useState, useRef } from 'react';
import clsx from 'clsx';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => { clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(() => setVisible(true), 200); };
  const hide = () => { clearTimeout(timeoutRef.current); setVisible(false); };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={clsx('relative inline-flex', className)} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <div className={clsx(
          'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-md whitespace-nowrap shadow-lg pointer-events-none',
          'animate-in fade-in-0 zoom-in-95 duration-100',
          positionClasses[position],
        )} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}
