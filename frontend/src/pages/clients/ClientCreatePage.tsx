import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCreateClient } from '../../hooks/useApi';

const clientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  locale: z.string().optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export function ClientCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const genderOptions = [
    { value: 'male', label: t('clients.gender_male') },
    { value: 'female', label: t('clients.gender_female') },
    { value: 'other', label: t('clients.gender_other') },
  ];

  const localeOptions = [
    { value: 'nl', label: 'Nederlands' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
  ];

  const onSubmit = async (formData: ClientForm) => {
    const result = await createClient.mutateAsync({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      locale: formData.locale || null,
      notes: formData.notes || null,
    });
    navigate({ to: '/clients/$id', params: { id: String(result.id) } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/clients' })}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{t('clients.add_client')}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('clients.first_name')}
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label={t('clients.last_name')}
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('clients.email')}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('clients.phone')}
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label={t('clients.date_of_birth')}
              type="date"
              error={errors.date_of_birth?.message}
              {...register('date_of_birth')}
            />
            <Select
              label={t('clients.gender')}
              options={genderOptions}
              placeholder="-"
              error={errors.gender?.message}
              {...register('gender')}
            />
            <Select
              label={t('clients.locale')}
              options={localeOptions}
              placeholder="-"
              error={errors.locale?.message}
              {...register('locale')}
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              {t('clients.notes')}
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('notes')}
            />
            {errors.notes?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/clients' })}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createClient.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
