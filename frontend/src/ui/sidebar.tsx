import { Link, useLocation } from '@tanstack/react-router';
import clsx from 'clsx';

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | number;
}

interface SidebarProps {
  logo: React.ReactNode;
  groups: NavGroup[];
  footer?: React.ReactNode;
}

export function Sidebar({ logo, groups, footer }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 pb-4 border-r border-zinc-200">
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-100 px-2">
        {logo}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-6">
          {groups.map((group) => (
            <li key={group.label}>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">{group.label}</div>
              <ul className="-mx-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          'group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                        )}
                      >
                        <i className={clsx(`far fa-${item.icon} w-5 text-center`, active ? 'text-zinc-700' : 'text-zinc-400 group-hover:text-zinc-600')} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && (
                          <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', active ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-100 text-zinc-500')}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {footer && <li className="mt-auto">{footer}</li>}
        </ul>
      </nav>
    </div>
  );
}
