import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useAuthStore } from '../../stores/authStore';

export function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          {t('dashboard.welcome_back')}{user ? `, ${user.name}` : ''}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{user?.name ?? ''}</span>
        </div>
      </div>
    </header>
  );
}
