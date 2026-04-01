import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { nl, enUS, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAppointments, useEmployees, useClients, useServices, useCreateAppointment, useTransitionAppointment } from '../../hooks/useApi';
import { useLocationStore } from '../../stores/locationStore';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

const localeMap: Record<string, Locale> = { nl, en: enUS, ru };

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

const appointmentSchema = z.object({
  client_id: z.string().min(1),
  service_id: z.string().min(1),
  employee_id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

type AppointmentStatus = Appointment['status'];

const STATUS_ACTIONS: Record<AppointmentStatus, Array<{ target: AppointmentStatus; labelKey: string; variant: 'primary' | 'secondary' | 'danger' }>> = {
  scheduled: [
    { target: 'confirmed', labelKey: 'appointments.confirm', variant: 'primary' },
    { target: 'cancelled', labelKey: 'appointments.cancel', variant: 'danger' },
    { target: 'no_show', labelKey: 'appointments.no_show', variant: 'secondary' },
  ],
  confirmed: [
    { target: 'in_progress' as AppointmentStatus, labelKey: 'appointments.start', variant: 'primary' },
    { target: 'cancelled', labelKey: 'appointments.cancel', variant: 'danger' },
    { target: 'no_show', labelKey: 'appointments.no_show', variant: 'secondary' },
  ],
  in_progress: [
    { target: 'completed', labelKey: 'appointments.complete', variant: 'primary' },
    { target: 'cancelled', labelKey: 'appointments.cancel', variant: 'danger' },
  ],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const locale = localeMap[i18n.language] || enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [, setSelectedSlot] = useState<{ date: Date; hour: number; employeeId?: number } | null>(null);

  // Appointment detail state
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const locationId = useLocationStore((s) => s.activeLocationId);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dateStr = format(weekStart, 'yyyy-MM-dd');
  const { data: appointments = [], isLoading } = useAppointments({ date: dateStr });
  const { data: employees = [] } = useEmployees();
  const { data: clientsData } = useClients();
  const { data: services = [] } = useServices();
  const createAppointment = useCreateAppointment();
  const transitionAppointment = useTransitionAppointment();

  const clients = clientsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const day = format(parseISO(apt.starts_at), 'yyyy-MM-dd');
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(apt);
    }
    return map;
  }, [appointments]);

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date, hour });
    setValue('date', format(date, 'yyyy-MM-dd'));
    setValue('time', `${String(hour).padStart(2, '0')}:00`);
    setModalOpen(true);
  };

  const openNewAppointment = () => {
    setSelectedSlot(null);
    reset();
    setModalOpen(true);
  };

  const onSubmit = async (data: AppointmentForm) => {
    const service = services.find((s) => s.id === Number(data.service_id));
    const [hours, minutes] = data.time.split(':').map(Number);
    const startTime = setMinutes(setHours(parseISO(data.date), hours), minutes);
    const endTime = new Date(startTime.getTime() + (service?.duration_minutes ?? 60) * 60000);

    await createAppointment.mutateAsync({
      client_id: Number(data.client_id),
      service_id: Number(data.service_id),
      user_id: Number(data.employee_id),
      starts_at: startTime.toISOString(),
      ends_at: endTime.toISOString(),
      notes: data.notes || null,
      status: 'scheduled',
    });

    setModalOpen(false);
    reset();
  };

  const getAppointmentsForSlot = (date: Date, hour: number): Appointment[] => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayApts = appointmentsByDay.get(dayKey) || [];
    return dayApts.filter((apt) => {
      const aptHour = parseISO(apt.starts_at).getHours();
      return aptHour === hour;
    });
  };

  const handleAppointmentClick = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailAppointment(apt);
    setShowCancelReason(false);
    setCancelReason('');
  };

  const handleTransition = async (targetStatus: string) => {
    if (!detailAppointment || !locationId) return;

    if (targetStatus === 'cancelled') {
      setShowCancelReason(true);
      return;
    }

    await transitionAppointment.mutateAsync({
      locationId,
      appointmentId: detailAppointment.id,
      status: targetStatus,
    });
    setDetailAppointment(null);
  };

  const handleConfirmCancel = async () => {
    if (!detailAppointment || !locationId) return;
    await transitionAppointment.mutateAsync({
      locationId,
      appointmentId: detailAppointment.id,
      status: 'cancelled',
      cancellation_reason: cancelReason || undefined,
    });
    setDetailAppointment(null);
    setShowCancelReason(false);
    setCancelReason('');
  };

  const actions = detailAppointment ? (STATUS_ACTIONS[detailAppointment.status] ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('calendar.title')}</h1>
        <Button onClick={openNewAppointment}>
          <Plus className="h-4 w-4" />
          {t('calendar.new_appointment')}
        </Button>
      </div>

      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {format(weekStart, 'MMMM yyyy', { locale })}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              {t('calendar.today')}
            </Button>
          </div>
          <button
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200">
                <div className="p-2" />
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center border-l border-slate-200 ${
                      isSameDay(day, new Date()) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <p className="text-xs text-slate-500 uppercase">
                      {format(day, 'EEE', { locale })}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        isSameDay(day, new Date()) ? 'text-primary-700' : 'text-slate-900'
                      }`}
                    >
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100"
                >
                  <div className="p-2 text-right text-xs text-slate-400 pr-3">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {weekDays.map((day) => {
                    const slotApts = getAppointmentsForSlot(day, hour);
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        onClick={() => handleSlotClick(day, hour)}
                        className="min-h-[60px] border-l border-slate-100 p-1 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        {slotApts.map((apt) => (
                          <div
                            key={apt.id}
                            className="mb-1 rounded-md bg-primary-100 border border-primary-200 px-2 py-1 text-xs cursor-pointer hover:bg-primary-200 transition-colors"
                            onClick={(e) => handleAppointmentClick(apt, e)}
                          >
                            <p className="font-medium text-primary-800 truncate">
                              {apt.client?.full_name ?? `${apt.client?.first_name ?? ''} ${apt.client?.last_name?.[0] ?? ''}.`}
                            </p>
                            <p className="text-primary-600 truncate">
                              {apt.service ? localizedName(apt.service, i18n.language) : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Appointment detail modal */}
      {detailAppointment && (
        <Modal
          open={!!detailAppointment}
          onClose={() => { setDetailAppointment(null); setShowCancelReason(false); }}
          title={detailAppointment.service ? localizedName(detailAppointment.service, i18n.language) : t('appointments.new_appointment')}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t('appointments.select_client')}</span>
                <span className="text-sm font-medium text-slate-900">
                  {detailAppointment.client?.full_name ?? `${detailAppointment.client?.first_name ?? ''} ${detailAppointment.client?.last_name ?? ''}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t('appointments.select_service')}</span>
                <span className="text-sm font-medium text-slate-900">
                  {detailAppointment.service ? localizedName(detailAppointment.service, i18n.language) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t('appointments.time')}</span>
                <span className="text-sm font-medium text-slate-900">
                  {format(parseISO(detailAppointment.starts_at), 'dd-MM-yyyy HH:mm')} - {format(parseISO(detailAppointment.ends_at), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t('appointments.select_employee')}</span>
                <span className="text-sm font-medium text-slate-900">
                  {detailAppointment.employee?.name ?? '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge variant={detailAppointment.status}>
                  {t(`appointments.status.${detailAppointment.status}`)}
                </Badge>
              </div>
            </div>

            {showCancelReason ? (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700">
                  {t('appointments.cancel_reason')}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowCancelReason(false)}>
                    {t('common.back')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleConfirmCancel}
                    loading={transitionAppointment.isPending}
                  >
                    {t('appointments.cancel')}
                  </Button>
                </div>
              </div>
            ) : actions.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                {actions.map((action) => (
                  <Button
                    key={action.target}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleTransition(action.target)}
                    loading={transitionAppointment.isPending}
                  >
                    {t(action.labelKey)}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </Modal>
      )}

      {/* New appointment modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('appointments.new_appointment')} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label={t('appointments.select_client')}
            options={clients.map((c) => ({
              value: c.id,
              label: c.full_name ?? `${c.first_name} ${c.last_name}`,
            }))}
            placeholder={t('appointments.select_client')}
            error={errors.client_id?.message}
            {...register('client_id')}
          />
          <Select
            label={t('appointments.select_service')}
            options={services.map((s) => ({
              value: s.id,
              label: `${localizedName(s, i18n.language)} (${s.duration_minutes}min - \u20AC${(s.price_cents / 100).toFixed(2)})`,
            }))}
            placeholder={t('appointments.select_service')}
            error={errors.service_id?.message}
            {...register('service_id')}
          />
          <Select
            label={t('appointments.select_employee')}
            options={employees.map((e) => ({
              value: e.id,
              label: e.name,
            }))}
            placeholder={t('appointments.select_employee')}
            error={errors.employee_id?.message}
            {...register('employee_id')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('appointments.date')}
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
            <Input
              label={t('appointments.time')}
              type="time"
              error={errors.time?.message}
              {...register('time')}
            />
          </div>
          <Input
            label={t('appointments.notes')}
            {...register('notes')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createAppointment.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
