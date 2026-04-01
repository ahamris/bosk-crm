import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useEmployees } from '../../hooks/useApi';
import clsx from 'clsx';

type FilterTab = 'all' | 'staff' | 'freelancer';

export function EmployeeListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const typeParam = activeTab === 'all' ? undefined : activeTab;
  const { data: employees = [], isLoading } = useEmployees(
    typeParam ? { type: typeParam } : undefined,
  );

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('employees.all') },
    { key: 'staff', label: t('employees.staff') },
    { key: 'freelancer', label: t('employees.freelancer') },
  ];

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('employees.title')}</h1>
        <Button onClick={() => navigate({ to: '/employees/new' })}>
          <Plus className="h-4 w-4" />
          {t('employees.add')}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          title={t('employees.no_employees')}
          description={t('employees.no_employees_desc')}
          action={
            <Button onClick={() => navigate({ to: '/employees/new' })}>
              <Plus className="h-4 w-4" />
              {t('employees.add')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp: any) => {
            const profile = emp.employee_profile;
            const isActive = profile?.is_active ?? true;
            const specializations: string[] = profile?.specializations ?? [];
            const avgRating = emp.reviews_avg_rating;
            const reviewsCount = emp.reviews_count ?? 0;

            return (
              <button
                key={emp.id}
                onClick={() =>
                  navigate({ to: '/employees/$id', params: { id: String(emp.id) } })
                }
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-primary-200"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                    {getInitials(emp.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {emp.name}
                      </h3>
                      <Badge variant={isActive ? 'success' : 'default'}>
                        {isActive ? t('employees.active') : t('employees.inactive')}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <Badge variant={emp.type === 'staff' ? 'scheduled' : 'coming_soon'}>
                        {emp.type === 'staff'
                          ? t('employees.staff')
                          : t('employees.freelancer')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {specializations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {specializations.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {spec}
                      </span>
                    ))}
                    {specializations.length > 3 && (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                        +{specializations.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div className="mt-3 flex items-center gap-1.5 text-sm">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={clsx(
                          'h-3.5 w-3.5',
                          avgRating && star <= Math.round(avgRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-slate-500">
                    {avgRating ? avgRating.toFixed(1) : '-'}
                  </span>
                  <span className="text-slate-400">
                    ({reviewsCount} {t('employees.reviews').toLowerCase()})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
