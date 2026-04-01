import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon?: string;
  iconColor?: string;
  image?: string;
  badge?: string;
  external?: boolean;
  className?: string;
}

/**
 * Moneybird-style link card — hele kaart is klikbaar
 * Gebruikt op settings/account pagina's als navigatie tiles
 */
export function LinkCard({ title, description, href, icon, iconColor, image, badge, external, className }: LinkCardProps) {
  const content = (
    <div className={clsx(
      'group relative flex flex-col rounded-xl bg-white p-6 ring-1 ring-zinc-200 transition-all',
      'hover:ring-zinc-300 hover:shadow-md cursor-pointer',
      className,
    )}>
      {/* Icon or Image */}
      <div className="mb-4">
        {image ? (
          <img src={image} alt="" className="h-12 w-auto" />
        ) : icon ? (
          <div className={clsx('inline-flex h-12 w-12 items-center justify-center rounded-xl', iconColor || 'bg-zinc-100 text-zinc-500')}>
            <i className={`far fa-${icon} text-xl`} />
          </div>
        ) : null}
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700">
        {title}
        {external && <i className="far fa-arrow-up-right-from-square ml-1.5 text-[10px] text-zinc-400" />}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{description}</p>

      {/* Badge */}
      {badge && (
        <span className="absolute top-4 right-4 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {badge}
        </span>
      )}

      {/* Arrow indicator */}
      <div className="mt-auto pt-4">
        <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
          {external ? 'Openen' : 'Bekijken'} <i className="far fa-arrow-right ml-0.5" />
        </span>
      </div>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return <Link to={href}>{content}</Link>;
}

interface LinkCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  title?: string;
  className?: string;
}

/**
 * Grid container voor LinkCards met optionele section header
 */
export function LinkCardGrid({ children, columns = 3, title, className }: LinkCardGridProps) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-zinc-500 mb-4 mt-8 first:mt-0">{title}</h3>
      )}
      <div className={clsx(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      )}>
        {children}
      </div>
    </div>
  );
}
