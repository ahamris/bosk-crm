import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  useServiceCategories,
  useDeleteService,
} from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Service, ServiceCategory } from '../../types';

export function ServiceListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const { data: categories = [], isLoading } = useServiceCategories();
  const deleteService = useDeleteService();

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteService.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
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
        <Button onClick={() => navigate({ to: '/services/new' })}>
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
              <Button onClick={() => navigate({ to: '/services/new' })}>
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
                    <h3 className="font-semibold text-slate-900">{localizedName(cat, i18n.language)}</h3>
                    <Badge>{(cat.services ?? []).length}</Badge>
                  </div>
                </button>

                {isExpanded && (cat.services ?? []).length > 0 && (
                  <div className="border-t border-slate-100">
                    {(cat.services ?? []).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          navigate({ to: '/services/$id', params: { id: String(service.id) } })
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">
                              {localizedName(service, i18n.language)}
                            </p>
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
                            <span>{service.duration_minutes}min</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {`\u20AC${(service.price_cents / 100).toFixed(2)}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({ to: '/services/$id/edit', params: { id: String(service.id) } });
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(service);
                              }}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.confirm') || 'Confirm'}
        message={
          deleteTarget
            ? `${t('services.delete_confirm') || 'Delete service'} "${localizedName(deleteTarget, i18n.language)}"?`
            : ''
        }
        confirmLabel={t('common.delete') || 'Delete'}
        cancelLabel={t('common.cancel') || 'Cancel'}
        variant="danger"
        loading={deleteService.isPending}
      />
    </div>
  );
}
