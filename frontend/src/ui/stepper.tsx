import clsx from 'clsx';

interface Step {
  label: string;
  description?: string;
  icon?: string;
}

interface StepperProps {
  steps: Step[];
  current: number; // 0-based
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav className={className} aria-label="Stappen">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const completed = i < current;
          const active = i === current;
          return (
            <li key={i} className={clsx('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  completed ? 'bg-zinc-900 text-white' : active ? 'bg-zinc-900 text-white ring-4 ring-zinc-100' : 'bg-zinc-100 text-zinc-500',
                )}>
                  {completed ? <i className="fas fa-check text-xs" /> : step.icon ? <i className={`far fa-${step.icon}`} /> : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={clsx('text-sm font-medium', active || completed ? 'text-zinc-900' : 'text-zinc-500')}>{step.label}</p>
                  {step.description && <p className="text-xs text-zinc-500">{step.description}</p>}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('mx-4 h-0.5 flex-1 rounded', completed ? 'bg-zinc-900' : 'bg-zinc-200')} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
