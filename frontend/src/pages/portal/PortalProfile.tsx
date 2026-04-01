import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Spinner,
} from '../../ui';
import { usePortalProfile, useUpdatePortalProfile } from '../../hooks/useApi';

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  date_of_birth: string;
  locale: string;
}

export function PortalProfile() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = usePortalProfile();
  const updateMutation = useUpdatePortalProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileForm>();

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        postal_code: profile.postal_code ?? '',
        date_of_birth: profile.date_of_birth ?? '',
        locale: profile.locale ?? 'nl',
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  function onSubmit(data: ProfileForm) {
    updateMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">{t('portal.profile')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('clients.section_personal')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.first_name')}
                </label>
                <input
                  {...register('first_name')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.last_name')}
                </label>
                <input
                  {...register('last_name')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.phone')}
                </label>
                <input
                  {...register('phone')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.date_of_birth')}
                </label>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.address')}
                </label>
                <input
                  {...register('address')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.city')}
                </label>
                <input
                  {...register('city')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {t('clients.postal_code')}
                </label>
                <input
                  {...register('postal_code')}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                {t('clients.locale')}
              </label>
              <select
                {...register('locale')}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                variant="success"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>

            {updateMutation.isSuccess && (
              <p className="text-sm text-emerald-600">{t('common.success')}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
