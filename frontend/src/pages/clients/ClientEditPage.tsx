import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useClient, useUpdateClient } from '../../hooks/useApi';

const clientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  locale: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  preferred_contact: z.string().optional(),
  source: z.string().optional(),
  medical_notes: z.string().optional(),
  skin_type: z.string().optional(),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export function ClientEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const clientId = Number(id);

  const { data: client, isLoading } = useClient(clientId);
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (client) {
      reset({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        date_of_birth: client.date_of_birth ?? '',
        gender: client.gender ?? '',
        locale: client.locale ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        postal_code: client.postal_code ?? '',
        country: client.country ?? 'NL',
        preferred_contact: client.preferred_contact ?? 'email',
        source: client.source ?? '',
        medical_notes: client.medical_notes ?? '',
        skin_type: client.skin_type ?? '',
        marketing_consent: client.marketing_consent ?? false,
        notes: client.notes ?? '',
      });
    }
  }, [client, reset]);

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

  const preferredContactOptions = [
    { value: 'email', label: t('clients.preferred_contact_email') },
    { value: 'phone', label: t('clients.preferred_contact_phone') },
    { value: 'sms', label: t('clients.preferred_contact_sms') },
    { value: 'whatsapp', label: t('clients.preferred_contact_whatsapp') },
  ];

  const sourceOptions = [
    { value: 'walk_in', label: t('clients.source_walk_in') },
    { value: 'website', label: t('clients.source_website') },
    { value: 'referral', label: t('clients.source_referral') },
    { value: 'social_media', label: t('clients.source_social_media') },
  ];

  const skinTypeOptions = [
    { value: 'normal', label: t('clients.skin_type_normal') },
    { value: 'dry', label: t('clients.skin_type_dry') },
    { value: 'oily', label: t('clients.skin_type_oily') },
    { value: 'combination', label: t('clients.skin_type_combination') },
    { value: 'sensitive', label: t('clients.skin_type_sensitive') },
  ];

  const onSubmit = async (formData: ClientForm) => {
    await updateClient.mutateAsync({
      id: clientId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      locale: formData.locale || null,
      address: formData.address || null,
      city: formData.city || null,
      postal_code: formData.postal_code || null,
      country: formData.country || 'NL',
      preferred_contact: (formData.preferred_contact || 'email') as 'email' | 'phone' | 'sms' | 'whatsapp',
      source: formData.source || null,
      medical_notes: formData.medical_notes || null,
      skin_type: formData.skin_type || null,
      marketing_consent: formData.marketing_consent ?? false,
      notes: formData.notes || null,
    });
    navigate({ to: '/clients/$id', params: { id } });
  };

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/clients/$id', params: { id } })}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('clients.edit_client')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('clients.section_personal')}</h2>
          <div className="space-y-4">
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
          </div>
        </Card>

        {/* Address */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('clients.section_address')}</h2>
          <div className="space-y-4">
            <Input
              label={t('clients.address')}
              error={errors.address?.message}
              {...register('address')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label={t('clients.city')}
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label={t('clients.postal_code')}
                error={errors.postal_code?.message}
                {...register('postal_code')}
              />
              <Input
                label={t('clients.country')}
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('clients.section_preferences')}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label={t('clients.preferred_contact')}
                options={preferredContactOptions}
                error={errors.preferred_contact?.message}
                {...register('preferred_contact')}
              />
              <Select
                label={t('clients.source')}
                options={sourceOptions}
                placeholder="-"
                error={errors.source?.message}
                {...register('source')}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                {...register('marketing_consent')}
              />
              {t('clients.marketing_consent')}
            </label>
          </div>
        </Card>

        {/* Medical */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('clients.section_medical')}</h2>
          <div className="space-y-4">
            <Select
              label={t('clients.skin_type')}
              options={skinTypeOptions}
              placeholder="-"
              error={errors.skin_type?.message}
              {...register('skin_type')}
            />
            <div>
              <label htmlFor="medical_notes" className="block text-sm font-medium text-slate-700">
                {t('clients.medical_notes')}
              </label>
              <textarea
                id="medical_notes"
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('medical_notes')}
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('clients.section_notes')}</h2>
          <div>
            <textarea
              id="notes"
              rows={3}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('notes')}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate({ to: '/clients/$id', params: { id } })}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={updateClient.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
