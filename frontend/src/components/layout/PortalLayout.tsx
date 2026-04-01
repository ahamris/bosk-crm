import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, CalendarDays, UserCircle, LogOut, ArrowLeftRight } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useAuthStore } from '../../stores/authStore';
import { logout as apiLogout } from '../../services/api';

const navItems = [
  { to: '/portal', label: 'portal.title', icon: LayoutDashboard },
  { to: '/portal/appointments', label: 'portal.upcoming', icon: CalendarDays },
  { to: '/portal/profile', label: 'portal.profile', icon: UserCircle },
] as const;

export function PortalLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const hasAdminAccess = user?.portals?.includes('admin') ||
    (user?.roles && user.roles.some((r: string) => ['owner', 'manager', 'employee', 'receptionist'].includes(r)));

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    logoutStore();
    window.location.href = '/login';
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/portal" className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-700">BOSK</span>
            <span className="text-sm text-zinc-500">{t('portal.title')}</span>
          </Link>

          <div className="flex items-center gap-3">
            {hasAdminAccess && (
              <Link to="/admin">
                <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                  <ArrowLeftRight className="h-4 w-4" />
                  {t('portal.switch_admin')}
                </button>
              </Link>
            )}
            <LanguageSwitcher />
            <span className="text-sm font-medium text-zinc-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive =
                to === '/portal'
                  ? currentPath === '/portal'
                  : currentPath.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(label)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-sm text-zinc-400">
        BOSK &mdash; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
