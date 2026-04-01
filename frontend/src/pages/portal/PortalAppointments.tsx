import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Spinner,
  ConfirmDialog,
} from '../../ui';
import {
  usePortalAppointments,
  useCancelPortalAppointment,
  useSubmitPortalReview,
} from '../../hooks/useApi';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

const statusColors: Record<string, 'blue' | 'green' | 'amber' | 'emerald' | 'red' | 'zinc'> = {
  scheduled: 'blue',
  confirmed: 'emerald',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
  no_show: 'zinc',
};

export function PortalAppointments() {
  const { t, i18n } = useTranslation();
  const { data: appointmentsData, isLoading } = usePortalAppointments();
  const cancelMutation = useCancelPortalAppointment();
  const reviewMutation = useSubmitPortalReview();

  const [cancelId, setCancelId] = useState<number | null>(null);
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const appointments: Appointment[] = appointmentsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.starts_at) >= new Date() && !['cancelled', 'no_show'].includes(a.status)
  );
  const past = appointments.filter(
    (a) => new Date(a.starts_at) < new Date() || ['cancelled', 'no_show', 'completed'].includes(a.status)
  );

  function handleCancel() {
    if (!cancelId) return;
    cancelMutation.mutate(cancelId, {
      onSuccess: () => setCancelId(null),
    });
  }

  function handleReviewSubmit() {
    if (!reviewAppt) return;
    reviewMutation.mutate(
      { appointment_id: reviewAppt.id, rating, comment: comment || undefined },
      {
        onSuccess: () => {
          setReviewAppt(null);
          setRating(5);
          setComment('');
        },
      }
    );
  }

  const canCancel = (appt: Appointment) =>
    ['scheduled', 'confirmed'].includes(appt.status) && new Date(appt.starts_at) > new Date();

  const canReview = (appt: Appointment) =>
    appt.status === 'completed';

  function renderAppointment(appt: Appointment) {
    return (
      <div
        key={appt.id}
        className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
      >
        <div className="space-y-1">
          <p className="font-medium text-zinc-900">
            {appt.service
              ? localizedName(appt.service, i18n.language)
              : `Service #${appt.service_id}`}
          </p>
          <p className="text-sm text-zinc-500">
            {format(new Date(appt.starts_at), 'EEEE dd MMMM yyyy, HH:mm')}
          </p>
          {appt.employee && (
            <p className="text-sm text-zinc-500">{appt.employee.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge color={statusColors[appt.status] ?? 'zinc'}>
            {t(`appointments.status.${appt.status}`)}
          </Badge>
          {canCancel(appt) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setCancelId(appt.id)}
            >
              {t('portal.cancel_appointment')}
            </Button>
          )}
          {canReview(appt) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReviewAppt(appt)}
            >
              {t('portal.leave_review')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">
        {t('portal.upcoming')}
      </h1>

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle>{t('portal.upcoming')}</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState title={t('dashboard.no_appointments_today')} description="" />
          ) : (
            <div className="space-y-3">
              {upcoming.map(renderAppointment)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past */}
      <Card>
        <CardHeader>
          <CardTitle>{t('portal.past')}</CardTitle>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <EmptyState title={t('common.no_results')} description="" />
          ) : (
            <div className="space-y-3">
              {past.map(renderAppointment)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title={t('portal.cancel_appointment')}
        message={t('portal.cancel_late')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={cancelMutation.isPending}
      />

      {/* Review modal */}
      {reviewAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900">
              {t('portal.leave_review')}
            </h3>
            <p className="mb-3 text-sm text-zinc-600">
              {reviewAppt.service
                ? localizedName(reviewAppt.service, i18n.language)
                : ''}
            </p>

            {/* Star rating */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                {t('portal.your_rating')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-amber-400' : 'text-zinc-300'
                    } hover:text-amber-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('notes.placeholder')}
              className="mb-4 w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              rows={4}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewAppt(null);
                  setRating(5);
                  setComment('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="success"
                onClick={handleReviewSubmit}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>

            {reviewMutation.isSuccess && (
              <p className="mt-3 text-sm text-emerald-600">
                {t('portal.review_submitted')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
