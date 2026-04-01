import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Mail,
  Phone,
  Cake,
  FileText,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useClient, useAppointments } from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import clsx from 'clsx';

type Tab = 'info' | 'history' | 'notes';

export function ClientDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const { data: client, isLoading } = useClient(Number(id));
  const { data: appointments = [] } = useAppointments();

  const clientAppointments = appointments.filter(
    (a) => a.client_id === Number(id)
  );

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: t('clients.personal_info') },
    { key: 'history', label: t('clients.visit_history') },
    { key: 'notes', label: t('clients.notes') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/clients' })}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {client.full_name ?? `${client.first_name} ${client.last_name}`}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: client card */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-2xl font-bold">
              {client.first_name[0]}{client.last_name[0]}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {client.full_name ?? `${client.first_name} ${client.last_name}`}
            </h2>
            <div className="mt-4 w-full space-y-3 text-left text-sm">
              {client.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.date_of_birth && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Cake className="h-4 w-4 text-slate-400" />
                  <span>{format(new Date(client.date_of_birth), 'dd-MM-yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{client.total_visits ?? 0} {t('clients.total_visits').toLowerCase()}</span>
              </div>
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
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card>
            {activeTab === 'info' && (
              <div className="space-y-4">
                <InfoRow label={t('clients.first_name')} value={client.first_name} />
                <InfoRow label={t('clients.last_name')} value={client.last_name} />
                <InfoRow label={t('clients.email')} value={client.email || '-'} />
                <InfoRow label={t('clients.phone')} value={client.phone || '-'} />
                <InfoRow
                  label={t('clients.date_of_birth')}
                  value={client.date_of_birth ? format(new Date(client.date_of_birth), 'dd-MM-yyyy') : '-'}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {clientAppointments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {clientAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {apt.service ? localizedName(apt.service, i18n.language) : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(apt.starts_at), 'dd-MM-yyyy HH:mm')} - {apt.employee?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-700">
                            {`\u20AC${(apt.price_cents / 100).toFixed(2)}`}
                          </span>
                          <Badge variant={apt.status}>
                            {t(`appointments.status.${apt.status}`)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="h-12 w-12" />}
                    title={t('clients.no_visits')}
                  />
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                {client.notes ? (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-12 w-12" />}
                    title={t('common.no_results')}
                  />
                )}
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
