import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Pencil, Clock, Timer, Palette } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useServices } from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Service } from '../../types';

export function ServiceDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const serviceId = Number(id);

  const { data: services = [], isLoading } = useServices();
  const service = (services as Service[]).find((s) => s.id === serviceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/services' })}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <p className="text-slate-500">{t('common.not_found') || 'Service not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/services' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {localizedName(service, i18n.language)}
          </h1>
          {service.is_active ? (
            <Badge variant="confirmed">{t('common.active') || 'Active'}</Badge>
          ) : (
            <Badge variant="cancelled">{t('common.inactive') || 'Inactive'}</Badge>
          )}
        </div>
        <Button onClick={() => navigate({ to: '/services/$id/edit', params: { id: String(service.id) } })}>
          <Pencil className="h-4 w-4" />
          {t('common.edit')}
        </Button>
      </div>

      <Card>
        <div className="p-5 space-y-6">
          {/* Names */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t('services.service_name')}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Nederlands</p>
                <p className="text-sm font-medium text-slate-900">{service.name_nl}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">English</p>
                <p className="text-sm font-medium text-slate-900">{service.name_en || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{'\u0420\u0443\u0441\u0441\u043A\u0438\u0439'}</p>
                <p className="text-sm font-medium text-slate-900">{service.name_ru || '-'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {t('services.description')}
              </h3>
              <p className="text-sm text-slate-700">{service.description}</p>
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t('common.details') || 'Details'}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">{t('services.duration')}</p>
                  <p className="text-sm font-medium text-slate-900">{service.duration_minutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">{t('services.buffer_time')}</p>
                  <p className="text-sm font-medium text-slate-900">{service.buffer_minutes} min</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t('services.price')}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {`\u20AC${(service.price_cents / 100).toFixed(2)}`}
                </p>
              </div>
              {service.color && (
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">{t('services.color') || 'Color'}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="text-sm text-slate-600">{service.color}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          {service.category && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {t('services.category')}
              </h3>
              <p className="text-sm text-slate-700">{localizedName(service.category, i18n.language)}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
