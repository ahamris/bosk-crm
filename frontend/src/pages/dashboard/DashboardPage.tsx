import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Button,
  EmptyState,
  Spinner,
} from '../../ui';
import { useDashboard } from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

const statusColors: Record<string, 'blue' | 'green' | 'amber' | 'emerald' | 'red' | 'zinc' | 'purple'> = {
  scheduled: 'blue',
  confirmed: 'emerald',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
  no_show: 'zinc',
};

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  const todaysTotal = dashboard?.stats?.today?.total ?? 0;
  const totalClients = dashboard?.stats?.total_clients ?? 0;
  const revenueCents = dashboard?.stats?.revenue_today_cents ?? 0;
  const upcoming7Days = dashboard?.stats?.upcoming_7_days ?? 0;
  const appointmentsToday: Appointment[] = dashboard?.appointments_today ?? [];

  // Notification indicators
  const unconfirmedCount = appointmentsToday.filter((a) => a.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">{t('dashboard.title')}</h1>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.todays_appointments')}
          value={todaysTotal}
          icon="calendar-check"
          color="bg-blue-50 text-blue-600"
          href="/planner"
        />
        <StatCard
          label={t('dashboard.total_clients')}
          value={totalClients}
          icon="users"
          color="bg-indigo-50 text-indigo-600"
          href="/clients"
        />
        <StatCard
          label={t('dashboard.revenue_today')}
          value={`€${(revenueCents / 100).toFixed(2)}`}
          icon="euro-sign"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label={t('dashboard.upcoming')}
          value={upcoming7Days}
          icon="calendar-days"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* ── Notification Banner ── */}
      {unconfirmedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-5 py-3 ring-1 ring-amber-200">
          <i className="far fa-bell text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {t('dashboard.unconfirmed_notice', {
              count: unconfirmedCount,
              defaultValue: `${unconfirmedCount} appointment(s) awaiting confirmation`,
            })}
          </span>
          <Badge color="amber" size="sm">{unconfirmedCount}</Badge>
        </div>
      )}

      {/* ── Today's Appointments ── */}
      <Card>
        <CardHeader>
          <CardTitle icon="calendar-day">{t('dashboard.todays_appointments')}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsToday.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>{t('appointments.time')}</TableHeader>
                  <TableHeader>{t('appointments.client')}</TableHeader>
                  <TableHeader>{t('appointments.service')}</TableHeader>
                  <TableHeader>{t('appointments.employee')}</TableHeader>
                  <TableHeader>{t('appointments.status_label')}</TableHeader>
                  <TableHeader align="right">{t('common.actions')}</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointmentsToday.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <span className="font-medium text-zinc-900">
                        {format(new Date(apt.starts_at), 'HH:mm')}
                      </span>
                      <span className="text-zinc-400"> – </span>
                      <span className="text-zinc-500">
                        {format(new Date(apt.ends_at), 'HH:mm')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {apt.client ? (
                        <Link
                          to="/clients/$id"
                          params={{ id: String(apt.client_id) }}
                          className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
                        >
                          {apt.client.full_name ?? `${apt.client.first_name} ${apt.client.last_name}`}
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {apt.service ? localizedName(apt.service, i18n.language) : '—'}
                    </TableCell>
                    <TableCell>
                      {apt.employee?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColors[apt.status] ?? 'zinc'} dot>
                        {t(`appointments.status.${apt.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon="eye"
                        onClick={() => navigate({ to: '/planner' })}
                      >
                        {t('common.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon="calendar"
              title={t('dashboard.no_appointments_today')}
              description={t('dashboard.no_appointments_description', {
                defaultValue: 'No appointments scheduled for today.',
              })}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">{t('dashboard.quick_actions', { defaultValue: 'Quick Actions' })}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/planner" className="block">
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <i className="far fa-calendar-plus text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t('dashboard.new_appointment', { defaultValue: 'New Appointment' })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t('dashboard.new_appointment_desc', { defaultValue: 'Schedule a new appointment' })}
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/clients/new" className="block">
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  <i className="far fa-user-plus text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t('dashboard.add_client', { defaultValue: 'Add Client' })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t('dashboard.add_client_desc', { defaultValue: 'Register a new client' })}
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/services" className="block">
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
                  <i className="far fa-list-check text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t('dashboard.view_services', { defaultValue: 'View Services' })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t('dashboard.view_services_desc', { defaultValue: 'Manage your service catalog' })}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
