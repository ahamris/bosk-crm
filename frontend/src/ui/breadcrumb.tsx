import { Link } from '@tanstack/react-router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <i className="far fa-chevron-right text-xs text-zinc-300" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-zinc-700 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-zinc-900 font-medium truncate">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
