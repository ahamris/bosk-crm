import { useState, useEffect } from 'react';
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
import { useEmployee, useUpdateEmployee, useLocations } from '../../hooks/useApi';

const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  phone: z.string().optional(),
  type: z.enum(['staff', 'freelancer']),
  bio_nl: z.string().optional(),
  bio_en: z.string().optional(),
  bio_ru: z.string().optional(),
  is_active: z.boolean().optional(),
  location_id: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

export function EmployeeEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const employeeId = Number(id);

  const { data: employee, isLoading } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee();
  const { data: locations = [] } = useLocations();

  const [specializations, setSpecializations] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    if (employee) {
      const emp = employee as any;
      const profile = emp.employee_profile;
      reset({
        name: emp.name,
        email: emp.email,
        password: '',
        phone: emp.phone ?? '',
        type: emp.type ?? 'staff',
        bio_nl: profile?.bio_nl ?? '',
        bio_en: profile?.bio_en ?? '',
        bio_ru: profile?.bio_ru ?? '',
        is_active: profile?.is_active ?? true,
        location_id: profile?.location_id ? String(profile.location_id) : '',
      });
      setSpecializations(profile?.specializations ?? []);
    }
  }, [employee, reset]);

  const typeOptions = [
    { value: 'staff', label: t('employees.staff') },
    { value: 'freelancer', label: t('employees.freelancer') },
  ];

  const locationOptions = locations.map((loc: any) => ({
    value: String(loc.id),
    label: loc.name,
  }));

  const addSpecialization = () => {
    const trimmed = specInput.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations((prev) => [...prev, trimmed]);
      setSpecInput('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations((prev) => prev.filter((s) => s !== spec));
  };

  const handleSpecKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSpecialization();
    }
  };

  const onSubmit = async (formData: EmployeeForm) => {
    const payload: Record<string, unknown> = {
      id: employeeId,
      name: formData.name,
      email: formData.email,
      type: formData.type,
      phone: formData.phone || null,
      bio_nl: formData.bio_nl || null,
      bio_en: formData.bio_en || null,
      bio_ru: formData.bio_ru || null,
      specializations,
      is_active: formData.is_active ?? true,
      location_id: formData.location_id ? Number(formData.location_id) : null,
    };

    if (formData.password && formData.password.length >= 8) {
      payload.password = formData.password;
    }

    await updateEmployee.mutateAsync(payload as any);
    navigate({ to: '/employees/$id', params: { id } });
  };

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/employees/$id', params: { id } })}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{t('employees.edit')}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('auth.name')}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label={t('auth.email')}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={`${t('auth.password')} (${t('employees.optional_password')})`}
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label={t('settings.phone')}
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label={t('employees.type')}
              options={typeOptions}
              error={errors.type?.message}
              {...register('type')}
            />
            <Select
              label={t('settings.location')}
              options={locationOptions}
              placeholder="-"
              error={errors.location_id?.message}
              {...register('location_id')}
            />
          </div>

          {/* Bio trilingual */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">{t('employees.bio')}</h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nederlands</label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('bio_nl')}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">English</label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('bio_en')}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Русский</label>
              <textarea
                rows={2}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('bio_ru')}
              />
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('employees.specializations')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={handleSpecKeyDown}
                placeholder={t('employees.specializations_placeholder')}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSpecialization}>
                +
              </Button>
            </div>
            {specializations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {specializations.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-0.5 text-primary-400 hover:text-primary-700"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              {...register('is_active')}
            />
            {t('services.is_active')}
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate({ to: '/employees/$id', params: { id } })}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={updateEmployee.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
