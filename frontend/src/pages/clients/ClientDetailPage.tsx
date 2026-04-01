import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Pencil,
  Calendar,
  FileText,
  Trash2,
  Lock,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  StickyNote,
  Footprints,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useClient,
  useAppointments,
  useClientNotes,
  useCreateClientNote,
  useDeleteClientNote,
  useCommunicationLogs,
  useCreateCommunicationLog,
} from '../../hooks/useApi';
import { useLocationStore } from '../../stores/locationStore';
import { localizedName } from '../../utils/locale';
import clsx from 'clsx';
import type { CommunicationLog } from '../../types';

type Tab = 'info' | 'history' | 'notes' | 'communication';

const commTypeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  note: StickyNote,
  walk_in: Footprints,
};

export function ClientDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const clientId = Number(id);
  const locationId = useLocationStore((s) => s.activeLocationId);

  const { data: client, isLoading } = useClient(clientId);
  const { data: appointments = [] } = useAppointments();
  const { data: notes = [], isLoading: notesLoading } = useClientNotes(clientId);
  const createNote = useCreateClientNote();
  const deleteNote = useDeleteClientNote();
  const { data: commLogs = [], isLoading: commLogsLoading } = useCommunicationLogs(clientId);
  const createCommLog = useCreateCommunicationLog();

  const [noteText, setNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  // Communication log form state
  const [showCommForm, setShowCommForm] = useState(false);
  const [commType, setCommType] = useState('call');
  const [commDirection, setCommDirection] = useState('outgoing');
  const [commSubject, setCommSubject] = useState('');
  const [commContent, setCommContent] = useState('');
  const [commDuration, setCommDuration] = useState('');

  const clientAppointments = appointments.filter(
    (a) => a.client_id === clientId
  );

  const handleAddNote = async () => {
    if (!noteText.trim() || !locationId) return;
    await createNote.mutateAsync({
      locationId,
      clientId,
      note: noteText.trim(),
      is_private: isPrivate,
    });
    setNoteText('');
    setIsPrivate(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!locationId) return;
    if (!window.confirm(t('notes.delete_confirm'))) return;
    setDeletingNoteId(noteId);
    await deleteNote.mutateAsync({ locationId, clientId, noteId });
    setDeletingNoteId(null);
  };

  const handleAddCommLog = async () => {
    if (!locationId) return;
    await createCommLog.mutateAsync({
      locationId,
      clientId,
      type: commType,
      direction: commDirection,
      subject: commSubject || null,
      content: commContent || null,
      duration_seconds: commDuration ? Math.round(parseFloat(commDuration) * 60) : null,
    });
    setShowCommForm(false);
    setCommType('call');
    setCommDirection('outgoing');
    setCommSubject('');
    setCommContent('');
    setCommDuration('');
  };

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
    { key: 'communication', label: t('clients.communication') },
  ];

  function renderCommLogIcon(log: CommunicationLog) {
    const Icon = commTypeIcons[log.type] ?? StickyNote;
    return <Icon className="h-4 w-4 text-slate-500" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('clients.title')}
        </Link>
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
                  <span className="text-slate-400 text-xs">{t('clients.email')}</span>
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400 text-xs">{t('clients.phone')}</span>
                  <span>{client.phone}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400 text-xs">{t('clients.address')}</span>
                  <span>
                    {[client.address, client.postal_code, client.city].filter(Boolean).join(', ')}
                  </span>
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
          <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
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
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate({ to: '/clients/$id/edit', params: { id } })}
                  >
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                </div>

                {/* Personal */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('clients.section_personal')}</h3>
                <InfoRow label={t('clients.first_name')} value={client.first_name} />
                <InfoRow label={t('clients.last_name')} value={client.last_name} />
                <InfoRow label={t('clients.email')} value={client.email || '-'} />
                <InfoRow label={t('clients.phone')} value={client.phone || '-'} />
                <InfoRow
                  label={t('clients.date_of_birth')}
                  value={client.date_of_birth ? format(new Date(client.date_of_birth), 'dd-MM-yyyy') : '-'}
                />
                <InfoRow label={t('clients.gender')} value={client.gender ? t(`clients.gender_${client.gender}`) : '-'} />
                <InfoRow label={t('clients.locale')} value={client.locale ?? '-'} />

                {/* Address */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide pt-2">{t('clients.section_address')}</h3>
                <InfoRow label={t('clients.address')} value={client.address || '-'} />
                <InfoRow label={t('clients.city')} value={client.city || '-'} />
                <InfoRow label={t('clients.postal_code')} value={client.postal_code || '-'} />
                <InfoRow label={t('clients.country')} value={client.country || '-'} />

                {/* Preferences */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide pt-2">{t('clients.section_preferences')}</h3>
                <InfoRow
                  label={t('clients.preferred_contact')}
                  value={client.preferred_contact ? t(`clients.preferred_contact_${client.preferred_contact}`) : '-'}
                />
                <InfoRow
                  label={t('clients.source')}
                  value={client.source ? t(`clients.source_${client.source}`) : '-'}
                />
                <InfoRow
                  label={t('clients.marketing_consent')}
                  value={client.marketing_consent ? t('common.yes') : t('common.no')}
                />

                {/* Medical */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide pt-2">{t('clients.section_medical')}</h3>
                <InfoRow
                  label={t('clients.skin_type')}
                  value={client.skin_type ? t(`clients.skin_type_${client.skin_type}`) : '-'}
                />
                <InfoRow label={t('clients.medical_notes')} value={client.medical_notes || '-'} />

                {/* Notes */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide pt-2">{t('clients.section_notes')}</h3>
                <InfoRow label={t('clients.notes')} value={client.notes || '-'} />
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
              <div className="space-y-4">
                {/* Add note form */}
                <div className="space-y-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t('notes.placeholder')}
                    rows={3}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Lock className="h-3.5 w-3.5" />
                      {t('notes.private')}
                    </label>
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteText.trim()}
                      loading={createNote.isPending}
                    >
                      {t('notes.add_note')}
                    </Button>
                  </div>
                </div>

                {/* Notes list */}
                {notesLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                  </div>
                ) : notes.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {notes.map((note) => (
                      <div key={note.id} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-slate-700">
                                {note.author?.name ?? '-'}
                              </span>
                              <span className="text-xs text-slate-400">
                                {format(new Date(note.created_at), 'dd-MM-yyyy HH:mm')}
                              </span>
                              {note.is_private && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                                  <Lock className="h-3 w-3" />
                                  {t('notes.private')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deletingNoteId === note.id}
                            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-12 w-12" />}
                    title={t('notes.no_notes')}
                  />
                )}
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-4">
                {/* Log communication button / form */}
                {!showCommForm ? (
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setShowCommForm(true)}>
                      <Plus className="h-4 w-4" />
                      {t('clients.log_communication')}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">{t('clients.log_communication')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Select
                        label={t('clients.comm_type')}
                        value={commType}
                        onChange={(e) => setCommType(e.target.value)}
                        options={[
                          { value: 'call', label: t('clients.comm_type_call') },
                          { value: 'email', label: t('clients.comm_type_email') },
                          { value: 'sms', label: t('clients.comm_type_sms') },
                          { value: 'whatsapp', label: t('clients.comm_type_whatsapp') },
                          { value: 'note', label: t('clients.comm_type_note') },
                          { value: 'walk_in', label: t('clients.comm_type_walk_in') },
                        ]}
                      />
                      <Select
                        label={t('clients.comm_direction')}
                        value={commDirection}
                        onChange={(e) => setCommDirection(e.target.value)}
                        options={[
                          { value: 'incoming', label: t('clients.comm_direction_incoming') },
                          { value: 'outgoing', label: t('clients.comm_direction_outgoing') },
                        ]}
                      />
                    </div>
                    <Input
                      label={t('clients.comm_subject')}
                      value={commSubject}
                      onChange={(e) => setCommSubject(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t('clients.comm_content')}
                      </label>
                      <textarea
                        value={commContent}
                        onChange={(e) => setCommContent(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    {commType === 'call' && (
                      <Input
                        label={t('clients.comm_duration')}
                        type="number"
                        min="0"
                        step="1"
                        value={commDuration}
                        onChange={(e) => setCommDuration(e.target.value)}
                      />
                    )}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setShowCommForm(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddCommLog}
                        loading={createCommLog.isPending}
                      >
                        {t('common.save')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Communication log list */}
                {commLogsLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                  </div>
                ) : commLogs.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {commLogs.map((log: CommunicationLog) => (
                      <div key={log.id} className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                            {renderCommLogIcon(log)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-slate-700">
                                {t(`clients.comm_type_${log.type}`)}
                              </span>
                              {log.direction === 'incoming' ? (
                                <ArrowDownLeft className="h-3 w-3 text-green-500" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-blue-500" />
                              )}
                              <span className="text-xs text-slate-400">
                                {t(`clients.comm_direction_${log.direction}`)}
                              </span>
                              <span className="text-xs text-slate-400">
                                {format(new Date(log.created_at), 'dd-MM-yyyy HH:mm')}
                              </span>
                              {log.user && (
                                <span className="text-xs text-slate-400">
                                  - {log.user.name}
                                </span>
                              )}
                            </div>
                            {log.subject && (
                              <p className="text-sm font-medium text-slate-800">{log.subject}</p>
                            )}
                            {log.content && (
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{log.content}</p>
                            )}
                            {log.duration_seconds != null && log.duration_seconds > 0 && (
                              <p className="text-xs text-slate-400 mt-1">
                                {t('clients.comm_duration')}: {Math.round(log.duration_seconds / 60)} min
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<MessageSquare className="h-12 w-12" />}
                    title={t('clients.no_communication_logs')}
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
