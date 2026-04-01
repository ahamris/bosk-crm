interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          {icon && <i className={`far fa-${icon} text-zinc-400`} />}
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="mt-4 sm:mt-0 flex items-center gap-3">{actions}</div>}
    </div>
  );
}
