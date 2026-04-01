import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useLocations } from '../../hooks/useApi';

export function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: locations = [] } = useLocations();
  const activeLocationId = useLocationStore((s) => s.activeLocationId);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);

  // Auto-select first location if none is active
  useEffect(() => {
    if (!activeLocationId && locations.length > 0) {
      setActiveLocation(locations[0].id);
    }
  }, [activeLocationId, locations, setActiveLocation]);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          {t('dashboard.welcome_back')}{user ? `, ${user.name}` : ''}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {locations.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-slate-500" />
            <select
              value={activeLocationId ?? ''}
              onChange={(e) => setActiveLocation(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <LanguageSwitcher />
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{user?.name ?? ''}</span>
        </div>
      </div>
    </header>
  );
}
