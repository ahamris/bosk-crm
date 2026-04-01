import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Scissors,
  Receipt,
  Settings,
  Puzzle,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const navItems: NavItem[] = [
    { to: '/', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/calendar', label: t('nav.calendar'), icon: <Calendar className="h-5 w-5" /> },
    { to: '/clients', label: t('nav.clients'), icon: <Users className="h-5 w-5" /> },
    { to: '/employees', label: t('nav.employees'), icon: <UserCheck className="h-5 w-5" /> },
    { to: '/services', label: t('nav.services'), icon: <Scissors className="h-5 w-5" /> },
    { to: '/invoices', label: t('nav.invoices'), icon: <Receipt className="h-5 w-5" /> },
    { to: '/settings', label: t('nav.settings'), icon: <Settings className="h-5 w-5" /> },
    { to: '/integrations', label: t('nav.integrations'), icon: <Puzzle className="h-5 w-5" /> },
    { to: '/ai', label: t('nav.ai'), icon: <Sparkles className="h-5 w-5" /> },
  ];

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/';
    return pathname.startsWith(to);
  };

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-slate-200 bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
        <Leaf className="h-7 w-7 text-primary-600 shrink-0" />
        {!collapsed && (
          <span className="text-xl font-bold text-slate-900 tracking-tight">BOSK</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-2 py-2 space-y-1">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
