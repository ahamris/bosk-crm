import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  useServiceCategories,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../hooks/useApi';
import type { Service, ServiceCategory } from '../../types';


const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category_id: z.string().min(1),
  duration: z.string().transform((v) => Number(v)).pipe(z.number().min(5)),
  price: z.string().transform((v) => Number(v)).pipe(z.number().min(0)),
  buffer_time: z.string().transform((v) => Number(v)).pipe(z.number().min(0)),
  is_active: z.string(),
});

type ServiceFormInput = z.input<typeof serviceSchema>;

export function ServiceListPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const { data: categories = [], isLoading } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: { buffer_time: '0', is_active: 'true' },
  });

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingService(null);
    reset({ buffer_time: '0', is_active: 'true' });
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setValue('name', service.name);
    setValue('description', service.description || '');
    setValue('category_id', String(service.category_id));
    setValue('duration', String(service.duration));
    setValue('price', String(service.price));
    setValue('buffer_time', String(service.buffer_time));
    setValue('is_active', String(service.is_active));
    setModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      category_id: Number(data.category_id),
      duration: data.duration,
      price: data.price,
      buffer_time: data.buffer_time,
      is_active: data.is_active === 'true',
    };

    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, ...payload });
    } else {
      await createService.mutateAsync(payload);
    }

    setModalOpen(false);
    reset();
    setEditingService(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirm') + '?')) {
      await deleteService.mutateAsync(id);
    }
  };

  const allCategories = categories as (ServiceCategory & { services?: Service[] })[];

  // Expand all by default
  if (expandedCategories.size === 0 && allCategories.length > 0) {
    const ids = new Set(allCategories.map((c) => c.id));
    if (ids.size > 0) setExpandedCategories(ids);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('services.title')}</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          {t('services.add_service')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : allCategories.length === 0 ? (
        <Card>
          <EmptyState
            title={t('services.no_services')}
            description={t('services.no_services_desc')}
            action={
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4" />
                {t('services.add_service')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {allCategories.map((cat) => {
            const isExpanded = expandedCategories.has(cat.id);
            return (
              <Card key={cat.id} padding={false}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                    <Badge>{(cat.services ?? []).length}</Badge>
                  </div>
                </button>

                {isExpanded && (cat.services ?? []).length > 0 && (
                  <div className="border-t border-slate-100">
                    {(cat.services ?? []).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{service.name}</p>
                            {!service.is_active && (
                              <Badge variant="cancelled">Inactive</Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="mt-0.5 text-xs text-slate-500">{service.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{service.duration}min</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            €{service.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(service)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? t('common.edit') : t('services.add_service')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('services.service_name')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={t('services.description')}
            error={errors.description?.message}
            {...register('description')}
          />
          <Select
            label={t('services.category')}
            options={allCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder={t('services.category')}
            error={errors.category_id?.message}
            {...register('category_id')}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('services.duration')}
              type="number"
              error={errors.duration?.message}
              {...register('duration')}
            />
            <Input
              label={t('services.price')}
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label={t('services.buffer_time')}
              type="number"
              error={errors.buffer_time?.message}
              {...register('buffer_time')}
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createService.isPending || updateService.isPending}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
