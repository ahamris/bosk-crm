import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Spinner,
  StatCard,
} from '../../ui';
import { usePortalProfile, usePortalUpcoming } from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

const statusColors: Record<string, 'blue' | 'green' | 'amber' | 'emerald' | 'red' | 'zinc'> = {
  scheduled: 'blue',
  confirmed: 'emerald',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
  no_show: 'zinc',
};

export function PortalDashboard() {
  const { t, i18n } = useTranslation();
  const { data: profile, isLoading: profileLoading } = usePortalProfile();
  const { data: upcoming = [], isLoading: upcomingLoading } = usePortalUpcoming();

  if (profileLoading || upcomingLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t('portal.title')}
        </h1>
        <Link to="/booking/$locationId" params={{ locationId: String(profile?.location_id ?? 1) }}>
          <Button variant="success">{t('portal.book_new')}</Button>
        </Link>
      </div>

      {profile && (
        <p className="text-zinc-600">
          {t('dashboard.welcome_back')}, {profile.first_name}!
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t('portal.total_visits')}
          value={profile?.appointments_count ?? profile?.total_visits ?? 0}
          icon="calendar-check"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label={t('portal.next_appointment')}
          value={
            nextAppointment
              ? format(new Date(nextAppointment.starts_at), 'dd MMM HH:mm')
              : '-'
          }
          icon="clock"
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader>
          <CardTitle>{t('portal.upcoming')}</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              title={t('dashboard.no_appointments_today')}
              description=""
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt: Appointment) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {appt.service
                        ? localizedName(appt.service, i18n.language)
                        : `Service #${appt.service_id}`}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {format(new Date(appt.starts_at), 'EEEE dd MMMM, HH:mm')}
                    </p>
                    {appt.employee && (
                      <p className="text-sm text-zinc-500">
                        {appt.employee.name}
                      </p>
                    )}
                  </div>
                  <Badge color={statusColors[appt.status] ?? 'zinc'}>
                    {t(`appointments.status.${appt.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link to="/portal/appointments">
          <Button variant="outline">{t('portal.past')}</Button>
        </Link>
        <Link to="/portal/profile">
          <Button variant="outline">{t('portal.profile')}</Button>
        </Link>
      </div>
    </div>
  );
}
