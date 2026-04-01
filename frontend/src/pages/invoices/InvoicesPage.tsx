import { useTranslation } from 'react-i18next';
import { Receipt, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useInvoices, useSendInvoice, useMarkInvoicePaid } from '../../hooks/useApi';
import type { Invoice } from '../../types';

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function InvoicesPage() {
  const { t } = useTranslation();
  const { data: invoicesData, isLoading } = useInvoices();
  const sendInvoice = useSendInvoice();
  const markPaid = useMarkInvoicePaid();

  const invoices: Invoice[] = invoicesData?.data ?? invoicesData ?? [];

  const handleSend = async (invoice: Invoice) => {
    await sendInvoice.mutateAsync({
      locationId: invoice.location_id,
      invoiceId: invoice.id,
    });
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    await markPaid.mutateAsync({
      locationId: invoice.location_id,
      invoiceId: invoice.id,
    });
  };

  const columns = [
    {
      key: 'invoice_number',
      header: '#',
      render: (row: Invoice) => (
        <span className="font-medium text-slate-900">
          {row.invoice_number ?? `DRAFT-${row.id}`}
        </span>
      ),
    },
    {
      key: 'client',
      header: t('appointments.select_client'),
      render: (row: Invoice) =>
        row.client
          ? row.client.full_name ?? `${row.client.first_name} ${row.client.last_name}`
          : '-',
    },
    {
      key: 'invoice_date',
      header: t('appointments.date'),
      render: (row: Invoice) => row.invoice_date,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Invoice) => (
        <Badge variant={row.status}>
          {t(`invoices.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: t('services.price'),
      render: (row: Invoice) => formatCents(row.total_cents, row.currency),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row: Invoice) => (
        <div className="flex items-center gap-2">
          {(row.status === 'draft' || row.status === 'open') && !row.moneybird_invoice_id && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSend(row);
              }}
              loading={sendInvoice.isPending}
            >
              <Send className="h-3.5 w-3.5" />
              {t('invoices.send')}
            </Button>
          )}
          {row.status !== 'paid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkPaid(row);
              }}
              loading={markPaid.isPending}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('invoices.mark_paid')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-900">{t('invoices.title')}</h1>
        </div>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-12 w-12" />}
            title={t('common.no_results')}
          />
        ) : (
          <Table
            columns={columns}
            data={invoices}
            keyExtractor={(row) => row.id}
          />
        )}
      </Card>
    </div>
  );
}
