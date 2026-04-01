import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  useServices,
  useServiceCategories,
  useUpdateService,
} from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Service } from '../../types';

const serviceSchema = z.object({
  name_nl: z.string().min(1, 'Required'),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Required'),
  duration_minutes: z.string().transform((v) => Number(v)).pipe(z.number().min(5)),
  price_euros: z.string().transform((v) => Math.round(Number(v) * 100)).pipe(z.number().min(0)),
  buffer_minutes: z.string().transform((v) => Number(v)).pipe(z.number().min(0)),
  color: z.string().optional(),
  is_active: z.string(),
});

type ServiceFormInput = z.input<typeof serviceSchema>;

export function ServiceEditPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const serviceId = Number(id);

  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories = [] } = useServiceCategories();
  const updateService = useUpdateService();

  const service = (services as Service[]).find((s) => s.id === serviceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceSchema) as any,
  });

  useEffect(() => {
    if (service) {
      reset({
        name_nl: service.name_nl,
        name_en: service.name_en || '',
        name_ru: service.name_ru || '',
        description: service.description || '',
        category_id: String(service.category_id),
        duration_minutes: String(service.duration_minutes),
        price_euros: (service.price_cents / 100).toFixed(2),
        buffer_minutes: String(service.buffer_minutes),
        color: service.color || '#6366f1',
        is_active: String(service.is_active),
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: any) => {
    await updateService.mutateAsync({
      id: serviceId,
      name_nl: data.name_nl,
      name_en: data.name_en || '',
      name_ru: data.name_ru || '',
      description: data.description || null,
      category_id: Number(data.category_id),
      duration_minutes: data.duration_minutes,
      price_cents: data.price_euros,
      buffer_minutes: data.buffer_minutes,
      color: data.color || null,
      is_active: data.is_active === 'true',
    });
    navigate({ to: '/services' });
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/services' })}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <p className="text-slate-500">{t('common.not_found') || 'Service not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/services' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('common.edit')}: {localizedName(service, i18n.language)}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label={`${t('services.service_name')} (NL) *`}
              error={errors.name_nl?.message}
              {...register('name_nl')}
            />
            <Input
              label={`${t('services.service_name')} (EN)`}
              error={errors.name_en?.message}
              {...register('name_en')}
            />
            <Input
              label={`${t('services.service_name')} (RU)`}
              error={errors.name_ru?.message}
              {...register('name_ru')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('services.description')}
            </label>
            <textarea
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              {...register('description')}
            />
          </div>

          <Select
            label={`${t('services.category')} *`}
            options={categories.map((c: any) => ({
              value: c.id,
              label: localizedName(c, i18n.language),
            }))}
            placeholder={t('services.category')}
            error={errors.category_id?.message}
            {...register('category_id')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label={`${t('services.duration')} (min)`}
              type="number"
              error={errors.duration_minutes?.message}
              {...register('duration_minutes')}
            />
            <Input
              label={`${t('services.price')} (\u20AC)`}
              type="number"
              step="0.01"
              min="0"
              error={errors.price_euros?.message}
              {...register('price_euros')}
            />
            <Input
              label={`${t('services.buffer_time')} (min)`}
              type="number"
              error={errors.buffer_minutes?.message}
              {...register('buffer_minutes')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                {t('services.color') || 'Color'}
              </label>
              <input
                type="color"
                className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300"
                {...register('color')}
              />
            </div>
            <Select
              label={t('services.is_active')}
              options={[
                { value: 'true', label: t('common.yes') },
                { value: 'false', label: t('common.no') },
              ]}
              {...register('is_active')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => navigate({ to: '/services' })}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={updateService.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
