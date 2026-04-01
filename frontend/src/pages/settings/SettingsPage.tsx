import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, MapPin, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import { useLocations, useUpdateLocation } from '../../hooks/useApi';
import clsx from 'clsx';

type Tab = 'profile' | 'location' | 'hours';

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  timezone: z.string().min(1),
  currency: z.string().min(1),
});

type LocationForm = z.infer<typeof locationSchema>;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const user = useAuthStore((s) => s.user);
  const { data: locations = [], isLoading } = useLocations();
  const updateLocation = useUpdateLocation();

  const currentLocation = locations[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    values: currentLocation
      ? {
          name: currentLocation.name,
          address: currentLocation.address,
          city: currentLocation.city,
          postal_code: currentLocation.postal_code,
          phone: currentLocation.phone,
          email: currentLocation.email,
          timezone: currentLocation.timezone,
          currency: currentLocation.currency,
        }
      : undefined,
  });

  const onLocationSubmit = async (data: LocationForm) => {
    if (currentLocation) {
      await updateLocation.mutateAsync({ id: currentLocation.id, ...data });
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: t('settings.profile'), icon: <User className="h-4 w-4" /> },
    { key: 'location', label: t('settings.location'), icon: <MapPin className="h-4 w-4" /> },
    { key: 'hours', label: t('settings.working_hours'), icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('settings.title')}</h1>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('settings.profile')}</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xl font-bold">
                {user?.name?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Input label={t('auth.name')} value={user?.name ?? ''} disabled />
            <Input label={t('auth.email')} value={user?.email ?? ''} disabled />
          </div>
        </Card>
      )}

      {activeTab === 'location' && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('settings.location')}</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onLocationSubmit)} className="space-y-4">
              <Input
                label={t('settings.location_name')}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={t('settings.address')}
                error={errors.address?.message}
                {...register('address')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('settings.city')}
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label={t('settings.postal_code')}
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('settings.phone')}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label={t('auth.email')}
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('settings.timezone')}
                  error={errors.timezone?.message}
                  {...register('timezone')}
                />
                <Input
                  label={t('settings.currency')}
                  error={errors.currency?.message}
                  {...register('currency')}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" loading={updateLocation.isPending}>
                  {t('common.save')}
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {activeTab === 'hours' && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t('settings.working_hours')}
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700 w-32">
                  {t(`settings.days.${day}`)}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="time"
                    defaultValue={day === 'saturday' ? '14:00' : day === 'sunday' ? '' : '18:00'}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <label className="flex items-center gap-1.5 ml-3">
                    <input
                      type="checkbox"
                      defaultChecked={day !== 'sunday'}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-slate-500">{t('services.is_active')}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button>{t('common.save')}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
