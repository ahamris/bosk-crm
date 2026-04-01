import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import { nl, enUS, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';
import dayjs from 'dayjs';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
} from 'react-calendar-timeline';
import 'react-calendar-timeline/dist/style.css';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Calendar,
  List,
  Columns3,
  Clock,
  User,
  ExternalLink,
  GanttChart,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { SlidePanel } from '../../components/ui/SlidePanel';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useAppointments,
  useEmployees,
  useClients,
  useServices,
  useCreateAppointment,
  useUpdateAppointment,
  useTransitionAppointment,
  useCreateInvoiceFromAppointment,
} from '../../hooks/useApi';
import { useLocationStore } from '../../stores/locationStore';
import { localizedName } from '../../utils/locale';
import type { Appointment } from '../../types';

// ---------------------------------------------------------------------------
// Constants & types
// ---------------------------------------------------------------------------

const localeMap: Record<string, Locale> = { nl, en: enUS, ru };

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

type ViewTab = 'timeline' | 'week' | 'list' | 'kanban';
type RangeSize = 1 | 3 | 7;

type AppointmentStatus = Appointment['status'];

const KANBAN_COLUMNS: Array<{ status: AppointmentStatus; labelKey: string }> = [
  { status: 'scheduled', labelKey: 'planner.scheduled' },
  { status: 'confirmed', labelKey: 'planner.confirmed' },
  { status: 'in_progress', labelKey: 'planner.in_progress' },
  { status: 'completed', labelKey: 'planner.completed_col' },
];

const STATUS_ACTIONS: Record<
  AppointmentStatus,
  Array<{ target: AppointmentStatus; labelKey: string; variant: 'primary' | 'secondary' | 'danger' }>
> = {
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

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 border-blue-200 text-blue-800',
  confirmed: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  in_progress: 'bg-purple-100 border-purple-200 text-purple-800',
  completed: 'bg-slate-100 border-slate-200 text-slate-700',
  cancelled: 'bg-red-100 border-red-200 text-red-700',
  no_show: 'bg-amber-100 border-amber-200 text-amber-700',
};

/** Background colors for timeline items (inline styles). */
const TIMELINE_STATUS_BG: Record<string, { bg: string; border: string; text: string }> = {
  scheduled:   { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  confirmed:   { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  in_progress: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  completed:   { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
  cancelled:   { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  no_show:     { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const appointmentSchema = z.object({
  client_id: z.string().min(1),
  service_id: z.string().min(1),
  employee_id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

// ---------------------------------------------------------------------------
// Drag-and-drop helper components (week view only)
// ---------------------------------------------------------------------------

function DraggableAppointment({
  apt,
  children,
}: {
  apt: Appointment;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `apt-${apt.id}`,
    data: { appointment: apt },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
}

function DroppableSlot({
  dayIso,
  hour,
  children,
}: {
  dayIso: string;
  hour: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dayIso}-${hour}`,
    data: { dayIso, hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] border-l border-slate-100 p-1 cursor-pointer transition-colors ${
        isOver ? 'bg-teal-50 ring-1 ring-teal-300 ring-inset' : 'hover:bg-slate-50'
      }`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlannerPage() {
  const { t, i18n } = useTranslation();
  const locale = localeMap[i18n.language] || enUS;

  // View state
  const [activeView, setActiveView] = useState<ViewTab>('timeline');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeSize, setRangeSize] = useState<RangeSize>(7);

  // Panel state
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

  // Cancel confirmation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const locationId = useLocationStore((s) => s.activeLocationId);

  // Compute range start/end based on rangeSize
  const rangeStart = useMemo(() => {
    if (rangeSize === 7) {
      return startOfWeek(currentDate, { weekStartsOn: 1 });
    }
    return startOfDay(currentDate);
  }, [currentDate, rangeSize]);

  const rangeEnd = useMemo(() => addDays(rangeStart, rangeSize), [rangeStart, rangeSize]);

  const rangeDays = useMemo(
    () => Array.from({ length: rangeSize }, (_, i) => addDays(rangeStart, i)),
    [rangeStart, rangeSize],
  );

  // Fetch data — pass rangeStart as date string
  const dateStr = format(rangeStart, 'yyyy-MM-dd');
  const { data: appointments = [], isLoading } = useAppointments({ date: dateStr });
  const { data: employees = [] } = useEmployees();
  const { data: clientsData } = useClients();
  const { data: services = [] } = useServices();
  const createAppointment = useCreateAppointment();
  const transitionAppointment = useTransitionAppointment();
  const updateAppointment = useUpdateAppointment();
  const createInvoice = useCreateInvoiceFromAppointment();

  // Drag-and-drop state (week view only)
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dropSuccess, setDropSuccess] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const apt = event.active.data.current?.appointment as Appointment | undefined;
    if (apt) setDraggedAppointment(apt);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDraggedAppointment(null);
      const { active, over } = event;
      if (!over) return;

      const apt = active.data.current?.appointment as Appointment | undefined;
      const slotData = over.data.current as { dayIso?: string; hour?: number } | undefined;
      if (!apt || !slotData?.dayIso || slotData.hour == null) return;

      // Calculate duration of original appointment
      const originalStart = parseISO(apt.starts_at);
      const originalEnd = parseISO(apt.ends_at);
      const durationMs = originalEnd.getTime() - originalStart.getTime();

      // Build new start/end
      const newStart = setMinutes(setHours(parseISO(slotData.dayIso), slotData.hour), 0);
      const newEnd = new Date(newStart.getTime() + durationMs);

      // Skip if same slot
      if (
        originalStart.getHours() === slotData.hour &&
        format(originalStart, 'yyyy-MM-dd') === slotData.dayIso
      ) {
        return;
      }

      try {
        await updateAppointment.mutateAsync({
          id: apt.id,
          starts_at: newStart.toISOString(),
          ends_at: newEnd.toISOString(),
        });
        setDropSuccess(apt.id);
        setTimeout(() => setDropSuccess(null), 1200);
      } catch {
        // mutation error handled by react-query
      }
    },
    [updateAppointment],
  );

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

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const day = format(parseISO(apt.starts_at), 'yyyy-MM-dd');
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(apt);
    }
    return map;
  }, [appointments]);

  /** All appointments within the current range, sorted by time. */
  const rangeAppointments = useMemo(() => {
    const rangeStartTime = rangeStart.getTime();
    const rangeEndTime = rangeEnd.getTime();
    return appointments
      .filter((apt) => {
        const t = parseISO(apt.starts_at).getTime();
        return t >= rangeStartTime && t < rangeEndTime;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [appointments, rangeStart, rangeEnd]);

  const getAppointmentsForSlot = (date: Date, hour: number): Appointment[] => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayApts = appointmentsByDay.get(dayKey) || [];
    return dayApts.filter((apt) => parseISO(apt.starts_at).getHours() === hour);
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const navigatePrev = () => setCurrentDate(addDays(currentDate, -rangeSize));
  const navigateNext = () => setCurrentDate(addDays(currentDate, rangeSize));
  const navigateToday = () => setCurrentDate(new Date());

  const handleSlotClick = (date: Date, hour: number) => {
    reset();
    setValue('date', format(date, 'yyyy-MM-dd'));
    setValue('time', `${String(hour).padStart(2, '0')}:00`);
    setCreatePanelOpen(true);
  };

  const openNewAppointment = () => {
    reset();
    setCreatePanelOpen(true);
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

    setCreatePanelOpen(false);
    reset();
  };

  const openDetail = (apt: Appointment, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDetailAppointment(apt);
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  const handleTransition = async (targetStatus: string) => {
    if (!detailAppointment || !locationId) return;

    if (targetStatus === 'cancelled') {
      setCancelDialogOpen(true);
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
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  const actions = detailAppointment ? (STATUS_ACTIONS[detailAppointment.status] ?? []) : [];

  const clientDisplayName = (apt: Appointment) =>
    apt.client?.full_name ?? `${apt.client?.first_name ?? ''} ${apt.client?.last_name ?? ''}`.trim();

  // ---------------------------------------------------------------------------
  // Sub-renders
  // ---------------------------------------------------------------------------

  const viewTabs: Array<{ key: ViewTab; labelKey: string; icon: typeof Calendar }> = [
    { key: 'timeline', labelKey: 'planner.timeline', icon: GanttChart },
    { key: 'week', labelKey: 'planner.week', icon: Calendar },
    { key: 'list', labelKey: 'planner.list', icon: List },
    { key: 'kanban', labelKey: 'planner.kanban', icon: Columns3 },
  ];

  // ---- Date Range Selector (shared across all views) ----
  const dateRangeSelector = (
    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <button
        onClick={navigatePrev}
        className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-slate-600" />
      </button>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {rangeSize === 1
            ? format(rangeStart, 'EEEE, d MMMM yyyy', { locale })
            : rangeSize === 3
              ? `${format(rangeStart, 'd MMM', { locale })} - ${format(addDays(rangeStart, 2), 'd MMM yyyy', { locale })}`
              : format(rangeStart, 'MMMM yyyy', { locale })}
        </h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {([1, 3, 7] as RangeSize[]).map((size) => {
            const label =
              size === 1 ? t('planner.today') : size === 3 ? t('planner.3_days') : t('planner.7_days');
            return (
              <button
                key={size}
                onClick={() => {
                  setRangeSize(size);
                  if (size === 1) setCurrentDate(new Date());
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  rangeSize === size
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <Button variant="secondary" size="sm" onClick={navigateToday}>
          {t('planner.today')}
        </Button>
      </div>
      <button
        onClick={navigateNext}
        className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
      >
        <ChevronRight className="h-5 w-5 text-slate-600" />
      </button>
    </div>
  );

  // ---- Timeline View (react-calendar-timeline) ----
  const renderTimelineView = () => {
    const groups = employees.map((emp) => ({
      id: emp.id,
      title: emp.name,
      rightTitle: emp.type === 'freelancer' ? '\uD83C\uDFF7\uFE0F' : '',
    }));

    const items = rangeAppointments
      .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show')
      .map((apt) => ({
        id: apt.id,
        group: apt.employee?.id ?? apt.user_id,
        title: `${apt.client?.first_name ?? ''} — ${apt.service ? localizedName(apt.service, i18n.language) : ''}`,
        start_time: dayjs(apt.starts_at).valueOf(),
        end_time: dayjs(apt.ends_at).valueOf(),
        canMove: apt.status === 'scheduled' || apt.status === 'confirmed',
        canResize: false,
        itemProps: {
          style: {
            background: TIMELINE_STATUS_BG[apt.status]?.bg ?? '#e2e8f0',
            borderColor: TIMELINE_STATUS_BG[apt.status]?.border ?? '#94a3b8',
            color: TIMELINE_STATUS_BG[apt.status]?.text ?? '#334155',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '6px',
            fontSize: '12px',
            overflow: 'hidden',
          },
        },
        _appointment: apt,
      }));

    const handleItemMove = async (
      itemId: number,
      dragTime: number,
      newGroupOrder: number,
    ) => {
      const apt = appointments.find((a) => a.id === itemId);
      if (!apt) return;

      const originalStart = dayjs(apt.starts_at);
      const originalEnd = dayjs(apt.ends_at);
      const durationMs = originalEnd.valueOf() - originalStart.valueOf();

      const newEmployee = groups[newGroupOrder];
      if (!newEmployee) return;

      try {
        await updateAppointment.mutateAsync({
          id: apt.id,
          starts_at: new Date(dragTime).toISOString(),
          ends_at: new Date(dragTime + durationMs).toISOString(),
          user_id: newEmployee.id,
        });
      } catch {
        // handled by react-query
      }
    };

    const handleItemSelect = (itemId: number) => {
      const apt = appointments.find((a) => a.id === itemId);
      if (apt) openDetail(apt);
    };

    if (groups.length === 0) {
      return (
        <>
          {dateRangeSelector}
          <EmptyState
            icon={<GanttChart className="h-12 w-12" />}
            title={t('planner.no_appointments')}
            action={
              <Button size="sm" onClick={openNewAppointment}>
                <Plus className="h-4 w-4" />
                {t('planner.new_appointment')}
              </Button>
            }
          />
        </>
      );
    }

    return (
      <>
        {dateRangeSelector}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="planner-timeline">
            <Timeline
              groups={groups}
              items={items}
              defaultTimeStart={dayjs(rangeStart).valueOf()}
              defaultTimeEnd={dayjs(rangeEnd).valueOf()}
              visibleTimeStart={dayjs(rangeStart).valueOf()}
              visibleTimeEnd={dayjs(rangeEnd).valueOf()}
              onItemMove={handleItemMove}
              onItemSelect={handleItemSelect}
              lineHeight={50}
              itemHeightRatio={0.75}
              sidebarWidth={150}
              canMove={true}
              canResize={false}
              itemRenderer={({ item, itemContext, getItemProps }) => {
                const props = getItemProps({});
                return (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      ...item.itemProps?.style,
                      lineHeight: `${itemContext.dimensions.height}px`,
                    }}
                    title={item.title}
                  >
                    <span className="block truncate px-2 text-xs font-medium">
                      {itemContext.title}
                    </span>
                  </div>
                );
              }}
            >
              <TimelineHeaders>
                <SidebarHeader>
                  {({ getRootProps }) => (
                    <div
                      {...getRootProps()}
                      className="flex items-center justify-center text-sm font-semibold text-slate-600"
                      style={{ ...getRootProps().style, background: '#f1f5f9' }}
                    >
                      {t('planner.employee')}
                    </div>
                  )}
                </SidebarHeader>
                <DateHeader unit="primaryHeader" />
                <DateHeader unit="hour" />
              </TimelineHeaders>
            </Timeline>
          </div>
        )}
      </>
    );
  };

  // ---- Week View ----
  const renderWeekView = () => (
    <>
      {dateRangeSelector}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div
                className="grid border-b border-slate-200"
                style={{ gridTemplateColumns: `60px repeat(${rangeSize}, 1fr)` }}
              >
                <div className="p-2" />
                {rangeDays.map((day) => (
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
                  className="grid border-b border-slate-100"
                  style={{ gridTemplateColumns: `60px repeat(${rangeSize}, 1fr)` }}
                >
                  <div className="p-2 text-right text-xs text-slate-400 pr-3">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {rangeDays.map((day) => {
                    const dayIso = format(day, 'yyyy-MM-dd');
                    const slotApts = getAppointmentsForSlot(day, hour);
                    return (
                      <DroppableSlot
                        key={`${day.toISOString()}-${hour}`}
                        dayIso={dayIso}
                        hour={hour}
                      >
                        <div onClick={() => handleSlotClick(day, hour)} className="min-h-[48px]">
                          {slotApts.map((apt) => (
                            <DraggableAppointment key={apt.id} apt={apt}>
                              <div
                                className={`mb-1 rounded-md border px-2 py-1 text-xs cursor-pointer transition-all ${STATUS_COLORS[apt.status]} ${
                                  dropSuccess === apt.id
                                    ? 'ring-2 ring-teal-400 bg-teal-50'
                                    : ''
                                }`}
                                onClick={(e) => openDetail(apt, e)}
                              >
                                <p className="font-medium truncate">{clientDisplayName(apt)}</p>
                                <p className="truncate opacity-80">
                                  {apt.service ? localizedName(apt.service, i18n.language) : ''}
                                </p>
                                <p className="opacity-70">
                                  {format(parseISO(apt.starts_at), 'HH:mm')}
                                </p>
                              </div>
                            </DraggableAppointment>
                          ))}
                        </div>
                      </DroppableSlot>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Ghost element while dragging */}
          <DragOverlay>
            {draggedAppointment ? (
              <div
                className={`rounded-md border px-2 py-1 text-xs shadow-lg opacity-90 ${STATUS_COLORS[draggedAppointment.status]}`}
                style={{ width: 140 }}
              >
                <p className="font-medium truncate">{clientDisplayName(draggedAppointment)}</p>
                <p className="truncate opacity-80">
                  {draggedAppointment.service
                    ? localizedName(draggedAppointment.service, i18n.language)
                    : ''}
                </p>
                <p className="opacity-70">
                  {format(parseISO(draggedAppointment.starts_at), 'HH:mm')}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );

  // ---- List View ----
  const renderListView = () => (
    <>
      {dateRangeSelector}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : rangeAppointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={t('planner.no_appointments')}
          action={
            <Button size="sm" onClick={openNewAppointment}>
              <Plus className="h-4 w-4" />
              {t('planner.new_appointment')}
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {rangeAppointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => openDetail(apt)}
              className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {/* Time */}
              <div className="shrink-0 w-20 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  {format(parseISO(apt.starts_at), 'HH:mm')}
                </p>
                <p className="text-xs text-slate-400">
                  {format(parseISO(apt.ends_at), 'HH:mm')}
                </p>
                {rangeSize > 1 && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(parseISO(apt.starts_at), 'dd/MM')}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {clientDisplayName(apt)}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {apt.service ? localizedName(apt.service, i18n.language) : '-'}
                  {apt.employee ? ` \u2014 ${apt.employee.name}` : ''}
                </p>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-slate-900">
                  {'\u20AC'}{(apt.price_cents / 100).toFixed(2)}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0">
                <Badge variant={apt.status}>
                  {t(`appointments.status.${apt.status}`)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ---- Kanban View ----
  const renderKanbanView = () => {
    const grouped = new Map<AppointmentStatus, Appointment[]>();
    for (const col of KANBAN_COLUMNS) {
      grouped.set(col.status, []);
    }
    for (const apt of rangeAppointments) {
      const bucket = grouped.get(apt.status);
      if (bucket) bucket.push(apt);
    }

    return (
      <>
        {dateRangeSelector}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 p-4">
            {KANBAN_COLUMNS.map((col) => {
              const items = grouped.get(col.status) ?? [];
              return (
                <div key={col.status} className="flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {t(col.labelKey)}
                    </h3>
                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
                      {items.length}
                    </span>
                  </div>

                  {/* Column body */}
                  <div className="flex-1 space-y-2 rounded-lg bg-slate-50 p-2 min-h-[200px]">
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">--</p>
                    ) : (
                      items.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => openDetail(apt)}
                          className="rounded-lg bg-white border border-slate-200 p-3 cursor-pointer hover:shadow-sm transition-shadow"
                        >
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {clientDisplayName(apt)}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {apt.service ? localizedName(apt.service, i18n.language) : '-'}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(apt.starts_at), 'HH:mm')} - {format(parseISO(apt.ends_at), 'HH:mm')}
                            {rangeSize > 1 && (
                              <span className="ml-1">({format(parseISO(apt.starts_at), 'dd/MM')})</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('planner.title')}</h1>
        <Button onClick={openNewAppointment}>
          <Plus className="h-4 w-4" />
          {t('planner.new_appointment')}
        </Button>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {viewTabs.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Content area */}
      <Card padding={false}>
        {activeView === 'timeline' && renderTimelineView()}
        {activeView === 'week' && renderWeekView()}
        {activeView === 'list' && renderListView()}
        {activeView === 'kanban' && renderKanbanView()}
      </Card>

      {/* Timeline CSS overrides */}
      <style>{`
        .planner-timeline .react-calendar-timeline .rct-header-root {
          background: #f8fafc;
        }
        .planner-timeline .react-calendar-timeline .rct-sidebar {
          background: white;
        }
        .planner-timeline .react-calendar-timeline .rct-sidebar-header {
          background: #f1f5f9;
        }
        .planner-timeline .react-calendar-timeline .rct-horizontal-lines .rct-hl-even,
        .planner-timeline .react-calendar-timeline .rct-horizontal-lines .rct-hl-odd {
          border-bottom: 1px solid #e2e8f0;
        }
      `}</style>

      {/* ================================================================== */}
      {/* Appointment Detail SlidePanel                                       */}
      {/* ================================================================== */}
      <SlidePanel
        open={!!detailAppointment}
        onClose={() => { setDetailAppointment(null); setCancelDialogOpen(false); }}
        title={
          detailAppointment?.service
            ? localizedName(detailAppointment.service, i18n.language)
            : t('appointments.new_appointment')
        }
        width="md"
        footer={
          detailAppointment && actions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
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
          ) : undefined
        }
      >
        {detailAppointment && (
          <div className="space-y-5">
            {/* Client */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('appointments.select_client')}</span>
              {detailAppointment.client ? (
                <Link
                  to="/clients/$id"
                  params={{ id: String(detailAppointment.client_id) }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  <User className="h-3.5 w-3.5" />
                  {clientDisplayName(detailAppointment)}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-sm font-medium text-slate-900">
                  {clientDisplayName(detailAppointment)}
                </span>
              )}
            </div>

            {/* Service */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('appointments.select_service')}</span>
              <span className="text-sm font-medium text-slate-900">
                {detailAppointment.service ? localizedName(detailAppointment.service, i18n.language) : '-'}
                {detailAppointment.service && (
                  <span className="ml-1 text-slate-400">
                    ({detailAppointment.service.duration_minutes}min
                    {' \u2014 \u20AC'}{(detailAppointment.price_cents / 100).toFixed(2)})
                  </span>
                )}
              </span>
            </div>

            {/* Employee */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('appointments.select_employee')}</span>
              <span className="text-sm font-medium text-slate-900">
                {detailAppointment.employee?.name ?? '-'}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('appointments.time')}</span>
              <span className="text-sm font-medium text-slate-900">
                {format(parseISO(detailAppointment.starts_at), 'dd-MM-yyyy HH:mm')}
                {' - '}
                {format(parseISO(detailAppointment.ends_at), 'HH:mm')}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <Badge variant={detailAppointment.status}>
                {t(`appointments.status.${detailAppointment.status}`)}
              </Badge>
            </div>

            {/* Notes */}
            {detailAppointment.notes && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500 mb-1">{t('appointments.notes')}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailAppointment.notes}</p>
              </div>
            )}

            {/* Create Invoice */}
            {detailAppointment.status === 'completed' && locationId && (
              <div className="border-t border-slate-100 pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    createInvoice
                      .mutateAsync({
                        locationId,
                        appointmentId: detailAppointment.id,
                      })
                      .then(() => setDetailAppointment(null));
                  }}
                  loading={createInvoice.isPending}
                >
                  <Receipt className="h-4 w-4" />
                  {t('invoices.from_appointment')}
                </Button>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      {/* ================================================================== */}
      {/* Cancel Confirmation Dialog (the only modal)                         */}
      {/* ================================================================== */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title={t('appointments.cancel')}
        message={
          <div className="space-y-3">
            <p>{t('appointments.cancel_reason')}</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        }
        confirmLabel={t('appointments.cancel')}
        cancelLabel={t('common.back')}
        variant="danger"
        loading={transitionAppointment.isPending}
      />

      {/* ================================================================== */}
      {/* New Appointment SlidePanel                                          */}
      {/* ================================================================== */}
      <SlidePanel
        open={createPanelOpen}
        onClose={() => setCreatePanelOpen(false)}
        title={t('appointments.new_appointment')}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setCreatePanelOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              loading={createAppointment.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <form id="new-appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('appointments.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
