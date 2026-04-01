import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Puzzle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useIntegrations, useUpdateIntegration, useTestIntegration, useSyncMoneybirdContacts, useSyncMoneybirdProducts } from '../../hooks/useApi';

interface IntegrationCard {
  provider: string;
  name: string;
  description: string;
  icon: string;
  comingSoon: boolean;
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    provider: 'moneybird',
    name: 'Moneybird',
    description: 'Automatisch facturen synchroniseren en boekhouding bijhouden',
    icon: 'M',
    comingSoon: false,
  },
  {
    provider: 'mollie',
    name: 'Mollie',
    description: 'Online betalingen accepteren via iDEAL, creditcard en meer',
    icon: 'Mo',
    comingSoon: true,
  },
  {
    provider: 'google_calendar',
    name: 'Google Calendar',
    description: 'Synchroniseer afspraken met Google Calendar',
    icon: 'G',
    comingSoon: true,
  },
  {
    provider: 'mailchimp',
    name: 'Mailchimp',
    description: 'E-mail marketing en nieuwsbrieven naar klanten',
    icon: 'Mc',
    comingSoon: true,
  },
];

const ICON_COLORS: Record<string, string> = {
  moneybird: 'bg-blue-500',
  mollie: 'bg-orange-500',
  google_calendar: 'bg-red-500',
  mailchimp: 'bg-yellow-500',
};

export function IntegrationsPage() {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiToken, setApiToken] = useState('');
  const [administrationId, setAdministrationId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; administrations?: Array<{ id: number; name: string }> } | null>(null);
  const [syncContactsResult, setSyncContactsResult] = useState<number | null>(null);
  const [syncServicesResult, setSyncServicesResult] = useState<number | null>(null);

  const { data: integrationsData, isLoading } = useIntegrations();
  const updateIntegration = useUpdateIntegration();
  const testIntegration = useTestIntegration();
  const syncContacts = useSyncMoneybirdContacts();
  const syncProducts = useSyncMoneybirdProducts();

  const configuredProviders = new Set(
    (integrationsData?.configured ?? []).map((i: { provider: string }) => i.provider)
  );

  const activeProviders = new Set(
    (integrationsData?.configured ?? [])
      .filter((i: { provider: string; is_active: boolean }) => i.is_active)
      .map((i: { provider: string }) => i.provider)
  );

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const result = await testIntegration.mutateAsync('moneybird');
      setTestResult(result);
    } catch {
      setTestResult({ success: false });
    }
  };

  const handleSaveActivate = async () => {
    await updateIntegration.mutateAsync({
      provider: 'moneybird',
      payload: {
        settings: {
          api_token: apiToken,
          administration_id: administrationId,
        },
        is_active: true,
      },
    });
    setSelectedProvider(null);
  };

  const handleSyncContacts = async () => {
    setSyncContactsResult(null);
    const result = await syncContacts.mutateAsync();
    setSyncContactsResult(result.count);
  };

  const handleSyncServices = async () => {
    setSyncServicesResult(null);
    const result = await syncProducts.mutateAsync();
    setSyncServicesResult(result.count);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedProvider === 'moneybird') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedProvider(null); setTestResult(null); }}
            className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Moneybird</h1>
              <p className="text-sm text-slate-500">Automatisch facturen synchroniseren</p>
            </div>
          </div>
        </div>

        <Card>
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                {t('integrations.api_token')}
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Plak je Moneybird API token..."
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Input
              label={t('integrations.administration_id')}
              value={administrationId}
              onChange={(e) => setAdministrationId(e.target.value)}
              placeholder="123456789"
            />

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                loading={testIntegration.isPending}
                disabled={!apiToken}
              >
                {t('integrations.test_connection')}
              </Button>

              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">
                        {t('integrations.connection_success')}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        {t('common.error')}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {testResult?.success && testResult.administrations && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-sm font-medium text-emerald-800 mb-1">Administraties gevonden:</p>
                <ul className="space-y-1">
                  {testResult.administrations.map((admin) => (
                    <li key={admin.id} className="text-sm text-emerald-700">
                      {admin.name} ({admin.id})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <Button
                onClick={handleSaveActivate}
                loading={updateIntegration.isPending}
                disabled={!apiToken || !administrationId}
              >
                {t('integrations.save_activate')}
              </Button>
            </div>
          </div>
        </Card>

        {activeProviders.has('moneybird') && (
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Synchronisatie</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleSyncContacts}
                  loading={syncContacts.isPending}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('integrations.sync_contacts')}
                </Button>
                {syncContactsResult !== null && (
                  <span className="text-sm text-slate-600">
                    {syncContactsResult} contacten gesynchroniseerd
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleSyncServices}
                  loading={syncProducts.isPending}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('integrations.sync_services')}
                </Button>
                {syncServicesResult !== null && (
                  <span className="text-sm text-slate-600">
                    {syncServicesResult} diensten gesynchroniseerd
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Puzzle className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-900">{t('integrations.title')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => {
          const isConfigured = configuredProviders.has(integration.provider);
          const isActive = activeProviders.has(integration.provider);

          return (
            <Card key={integration.provider} className="relative">
              <button
                className="w-full text-left"
                onClick={() => {
                  if (!integration.comingSoon) {
                    setSelectedProvider(integration.provider);
                  }
                }}
                disabled={integration.comingSoon}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm ${ICON_COLORS[integration.provider] || 'bg-slate-500'}`}
                  >
                    {integration.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {integration.name}
                      </h3>
                      {integration.comingSoon ? (
                        <Badge variant="coming_soon">{t('integrations.coming_soon')}</Badge>
                      ) : isActive ? (
                        <Badge variant="success">{t('integrations.configured')}</Badge>
                      ) : isConfigured ? (
                        <Badge variant="default">{t('integrations.configured')}</Badge>
                      ) : (
                        <Badge variant="default">{t('integrations.not_configured')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
