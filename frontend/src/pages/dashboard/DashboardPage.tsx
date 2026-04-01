import { useTranslation } from 'react-i18next';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDashboard } from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const { t, i18n } = useTranslation();
  const serviceName = appointment.service
    ? localizedName(appointment.service, i18n.language)
    : '';
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
          {appointment.client?.first_name?.[0]}
          {appointment.client?.last_name?.[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">
            {appointment.client?.full_name ?? `${appointment.client?.first_name ?? ''} ${appointment.client?.last_name ?? ''}`}
          </p>
          <p className="text-xs text-slate-500">{serviceName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm text-slate-700">
            {format(new Date(appointment.starts_at), 'HH:mm')} -{' '}
            {format(new Date(appointment.ends_at), 'HH:mm')}
          </p>
          <p className="text-xs text-slate-500">{appointment.employee?.name}</p>
        </div>
        <Badge variant={appointment.status}>
          {t(`appointments.status.${appointment.status}`)}
        </Badge>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const todaysTotal = dashboard?.stats?.today?.total ?? 0;
  const totalClients = dashboard?.stats?.total_clients ?? 0;
  const revenueCents = dashboard?.stats?.revenue_today_cents ?? 0;
  const upcoming7Days = dashboard?.stats?.upcoming_7_days ?? 0;
  const appointmentsToday = dashboard?.appointments_today ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-6 w-6 text-primary-600" />}
          label={t('dashboard.todays_appointments')}
          value={todaysTotal}
          color="bg-primary-100"
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          label={t('dashboard.total_clients')}
          value={totalClients}
          color="bg-blue-100"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          label={t('dashboard.revenue_today')}
          value={`\u20AC${(revenueCents / 100).toFixed(2)}`}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-amber-600" />}
          label={t('dashboard.upcoming')}
          value={upcoming7Days}
          color="bg-amber-100"
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.upcoming')}</h2>
        </div>
        {appointmentsToday.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {appointmentsToday.map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title={t('dashboard.no_appointments_today')}
          />
        )}
      </Card>
    </div>
  );
}
