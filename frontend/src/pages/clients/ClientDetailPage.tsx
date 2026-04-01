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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useClient, useAppointments, useClientNotes, useCreateClientNote, useDeleteClientNote } from '../../hooks/useApi';
import { useLocationStore } from '../../stores/locationStore';
import { localizedName } from '../../utils/locale';
import clsx from 'clsx';

type Tab = 'info' | 'history' | 'notes';

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

  const [noteText, setNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

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
