import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, Star, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useEmployee,
  useEmployeeWorkingHours,
  useBulkUpdateWorkingHours,
} from '../../hooks/useApi';
import { useLocationStore } from '../../stores/locationStore';
import clsx from 'clsx';

type Tab = 'profile' | 'schedule' | 'reviews' | 'performance';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface ScheduleRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export function EmployeeDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const employeeId = Number(id);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const { data: employee, isLoading } = useEmployee(employeeId);
  const { data: workingHours = [], isLoading: hoursLoading } = useEmployeeWorkingHours(employeeId);
  const bulkUpdate = useBulkUpdateWorkingHours();
  const locationId = useLocationStore((s) => s.activeLocationId);

  // Schedule state: initialize from working hours
  const [schedule, setSchedule] = useState<ScheduleRow[]>(() =>
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '17:00',
      is_available: false,
    })),
  );
  const [scheduleLoaded, setScheduleLoaded] = useState(false);

  // Sync schedule from API data
  if (!scheduleLoaded && workingHours.length > 0) {
    const newSchedule = Array.from({ length: 7 }, (_, i) => {
      const existing = workingHours.find((wh: any) => wh.day_of_week === i);
      return existing
        ? {
            day_of_week: i,
            start_time: existing.start_time?.slice(0, 5) ?? '09:00',
            end_time: existing.end_time?.slice(0, 5) ?? '17:00',
            is_available: existing.is_available,
          }
        : {
            day_of_week: i,
            start_time: '09:00',
            end_time: '17:00',
            is_available: false,
          };
    });
    setSchedule(newSchedule);
    setScheduleLoaded(true);
  }

  const handleScheduleSave = async () => {
    if (!locationId) return;
    await bulkUpdate.mutateAsync({
      employeeId,
      hours: schedule.map((row) => ({
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        is_available: row.is_available,
        location_id: locationId,
      })),
    });
  };

  const updateScheduleRow = (dayIndex: number, field: keyof ScheduleRow, value: any) => {
    setSchedule((prev) =>
      prev.map((row) =>
        row.day_of_week === dayIndex ? { ...row, [field]: value } : row,
      ),
    );
  };

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profile = (employee as any).employee_profile;
  const isActive = profile?.is_active ?? true;
  const specializations: string[] = profile?.specializations ?? [];
  const reviews: any[] = (employee as any).reviews ?? [];
  const avgRating = (employee as any).reviews_avg_rating;

  const bioKey = `bio_${i18n.language}` as 'bio_nl' | 'bio_en' | 'bio_ru';
  const bio = profile?.[bioKey] || profile?.bio_nl || profile?.bio_en || '';

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: t('employees.profile') },
    { key: 'schedule', label: t('employees.schedule') },
    { key: 'reviews', label: t('employees.reviews') },
    { key: 'performance', label: t('employees.performance') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/employees"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('employees.title')}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{(employee as any).name}</h1>
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? t('employees.active') : t('employees.inactive')}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate({ to: '/employees/$id/edit', params: { id } })}
        >
          <Pencil className="h-4 w-4" />
          {t('common.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Employee card */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-2xl font-bold">
              {getInitials((employee as any).name)}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{(employee as any).name}</h2>
            <div className="mt-1">
              <Badge variant={(employee as any).type === 'staff' ? 'scheduled' : 'coming_soon'}>
                {(employee as any).type === 'staff'
                  ? t('employees.staff')
                  : t('employees.freelancer')}
              </Badge>
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={clsx(
                      'h-4 w-4',
                      avgRating && star <= Math.round(avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">
                {avgRating ? Number(avgRating).toFixed(1) : '-'} ({reviews.length})
              </span>
            </div>

            <div className="mt-4 w-full space-y-3 text-left text-sm">
              <InfoRow label={t('auth.email')} value={(employee as any).email} />
              {specializations.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400">{t('employees.specializations')}</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {specializations.map((s) => (
                      <span
                        key={s}
                        className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right: tabs */}
        <div className="lg:col-span-2 space-y-4">
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

          <Card>
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <InfoRow label={t('auth.name')} value={(employee as any).name} />
                <InfoRow label={t('auth.email')} value={(employee as any).email} />
                <InfoRow
                  label={t('employees.type')}
                  value={
                    (employee as any).type === 'staff'
                      ? t('employees.staff')
                      : t('employees.freelancer')
                  }
                />
                <InfoRow
                  label={t('employees.status')}
                  value={isActive ? t('employees.active') : t('employees.inactive')}
                />
                {bio && (
                  <div>
                    <span className="text-sm text-slate-500">{t('employees.bio')}</span>
                    <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {hoursLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="py-2 pr-4 text-left font-medium text-slate-600">
                              {t('settings.working_hours')}
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-slate-600">
                              {t('employees.start_time')}
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-slate-600">
                              {t('employees.end_time')}
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-slate-600">
                              {t('services.is_active')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedule.map((row) => (
                            <tr key={row.day_of_week} className="border-b border-slate-100 last:border-0">
                              <td className="py-2.5 pr-4 font-medium text-slate-700">
                                {t(`settings.days.${DAY_NAMES[row.day_of_week]}`)}
                              </td>
                              <td className="px-2 py-2.5">
                                <input
                                  type="time"
                                  value={row.start_time}
                                  onChange={(e) =>
                                    updateScheduleRow(row.day_of_week, 'start_time', e.target.value)
                                  }
                                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  disabled={!row.is_available}
                                />
                              </td>
                              <td className="px-2 py-2.5">
                                <input
                                  type="time"
                                  value={row.end_time}
                                  onChange={(e) =>
                                    updateScheduleRow(row.day_of_week, 'end_time', e.target.value)
                                  }
                                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  disabled={!row.is_available}
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={row.is_available}
                                  onChange={(e) =>
                                    updateScheduleRow(
                                      row.day_of_week,
                                      'is_available',
                                      e.target.checked,
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleScheduleSave}
                        loading={bulkUpdate.isPending}
                        disabled={!locationId}
                      >
                        {t('employees.save_hours')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Average rating summary */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                    <div className="text-3xl font-bold text-slate-900">
                      {avgRating ? Number(avgRating).toFixed(1) : '-'}
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={clsx(
                              'h-4 w-4',
                              avgRating && star <= Math.round(avgRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200',
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-500">
                        {reviews.length} {t('employees.reviews').toLowerCase()}
                      </p>
                    </div>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {review.client
                                ? `${review.client.first_name} ${review.client.last_name}`
                                : '-'}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={clsx(
                                    'h-3 w-3',
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200',
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {format(new Date(review.created_at), 'dd-MM-yyyy')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Star className="h-12 w-12" />}
                    title={t('employees.no_reviews')}
                  />
                )}
              </div>
            )}

            {/* Performance tab */}
            {activeTab === 'performance' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-sm font-medium text-slate-900">
                  {t('employees.performance')}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{t('ai.coming_soon')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
