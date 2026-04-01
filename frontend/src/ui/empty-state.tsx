import { Button } from './button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: string };
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 rounded-xl bg-white ring-1 ring-zinc-900/5">
      <i className={`far fa-${icon} text-4xl text-zinc-300`} />
      <h3 className="mt-3 text-sm font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      {action && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" icon={action.icon} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
