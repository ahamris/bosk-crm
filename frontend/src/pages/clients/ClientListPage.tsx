import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useClients } from '../../hooks/useApi';
import type { Client } from '../../types';

export function ClientListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useClients({ search: search || undefined });
  const clients = data?.data ?? [];

  const columns = [
    {
      key: 'name',
      header: `${t('clients.first_name')} ${t('clients.last_name')}`,
      render: (row: Client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <span className="font-medium">{row.first_name} {row.last_name}</span>
        </div>
      ),
    },
    { key: 'email', header: t('clients.email') },
    { key: 'phone', header: t('clients.phone') },
    {
      key: 'total_visits',
      header: t('clients.total_visits'),
      render: (row: Client) => <span>{row.total_visits ?? 0}</span>,
    },
    {
      key: 'last_visit_at',
      header: t('clients.last_visit'),
      render: (row: Client) =>
        row.last_visit_at ? (
          <span className="text-slate-500">{format(new Date(row.last_visit_at), 'dd-MM-yyyy')}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('clients.title')}</h1>
        <Button onClick={() => navigate({ to: '/clients/new' })}>
          <Plus className="h-4 w-4" />
          {t('clients.add_client')}
        </Button>
      </div>

      <Card padding={false}>
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('clients.search_clients')}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            title={t('clients.no_clients')}
            description={t('clients.no_clients_desc')}
            action={
              <Button onClick={() => navigate({ to: '/clients/new' })}>
                <Plus className="h-4 w-4" />
                {t('clients.add_client')}
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={clients}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => navigate({ to: '/clients/$id', params: { id: String(c.id) } })}
          />
        )}
      </Card>
    </div>
  );
}
