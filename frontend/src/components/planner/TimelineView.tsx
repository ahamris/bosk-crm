import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { format, parseISO, differenceInMinutes, startOfDay, addDays, isSameDay } from 'date-fns';
import { nl, enUS, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';
import type { Appointment, Employee } from '../../types';
import { localizedName } from '../../utils/locale';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIDEBAR_WIDTH = 180;
const ROW_HEIGHT = 70;
const PX_PER_MINUTE = 2;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const MINUTES_PER_DAY = (DAY_END_HOUR - DAY_START_HOUR) * 60;
const HEADER_HEIGHT = 52; // two-level header

const localeMap: Record<string, Locale> = { nl, en: enUS, ru };

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; strikethrough?: boolean; opacity?: number }
> = {
  scheduled: { bg: '#3B82F6', text: '#fff' },
  confirmed: { bg: '#10B981', text: '#fff' },
  in_progress: { bg: '#F59E0B', text: '#fff' },
  completed: { bg: '#6B7280', text: '#fff' },
  cancelled: { bg: '#EF4444', text: '#fff', strikethrough: true },
  no_show: { bg: '#DC2626', text: '#fff', opacity: 0.5 },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TimelineViewProps {
  employees: Employee[];
  appointments: Appointment[];
  rangeStart: Date;
  rangeEnd: Date;
  onAppointmentClick: (apt: Appointment) => void;
  onSlotClick: (employeeId: number, time: Date) => void;
  lang: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Number of calendar days in a range (inclusive start, exclusive end). */
function dayCount(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

/** Generate array of dates in range. */
function rangeDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const count = dayCount(start, end);
  for (let i = 0; i < count; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

/** Generate hours array from DAY_START_HOUR to DAY_END_HOUR - 1. */
function hoursArray(): number[] {
  const arr: number[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) arr.push(h);
  return arr;
}

/** Format price in euros. */
function formatPrice(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2)}`;
}

/** Get initials from a name. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimelineView({
  employees,
  appointments,
  rangeStart,
  rangeEnd,
  onAppointmentClick,
  onSlotClick,
  lang,
}: TimelineViewProps) {
  const locale = localeMap[lang] || enUS;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Current time indicator
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Computed values
  const days = useMemo(() => rangeDays(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const hours = useMemo(() => hoursArray(), []);
  const totalWidth = days.length * MINUTES_PER_DAY * PX_PER_MINUTE;
  const dayWidth = MINUTES_PER_DAY * PX_PER_MINUTE;

  // Group appointments by employee
  const aptsByEmployee = useMemo(() => {
    const map = new Map<number, Appointment[]>();
    for (const emp of employees) {
      map.set(emp.id, []);
    }
    for (const apt of appointments) {
      const empId = apt.employee?.id ?? apt.user_id;
      const bucket = map.get(empId);
      if (bucket) bucket.push(apt);
    }
    return map;
  }, [employees, appointments]);

  // Scroll sync: sidebar <-> timeline (vertical), header <-> timeline (horizontal)
  const syncing = useRef(false);

  const handleTimelineScroll = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    const el = timelineRef.current;
    if (el) {
      if (sidebarRef.current) sidebarRef.current.scrollTop = el.scrollTop;
      if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
    }
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, []);

  const handleSidebarScroll = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    if (sidebarRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = sidebarRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, []);

  // Horizontal scroll on mouse wheel over the timeline
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = timelineRef.current;
    if (!el) return;
    // If shift is held or deltaX already has value, let native handle it
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // Convert vertical scroll to horizontal
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }, []);

  // Calculate position of an appointment block
  const getBlockPosition = useCallback(
    (apt: Appointment) => {
      const start = parseISO(apt.starts_at);
      const end = parseISO(apt.ends_at);
      const day = startOfDay(start);

      // Find which day index this appointment belongs to
      const dayIndex = days.findIndex((d) => isSameDay(d, day));
      if (dayIndex < 0) return null;

      // Minutes from day start
      const startMinutes = differenceInMinutes(start, day) - DAY_START_HOUR * 60;
      const durationMinutes = differenceInMinutes(end, start);

      // Clamp to visible range
      const clampedStart = Math.max(0, startMinutes);
      const clampedEnd = Math.min(MINUTES_PER_DAY, startMinutes + durationMinutes);
      if (clampedEnd <= clampedStart) return null;

      const left = dayIndex * dayWidth + clampedStart * PX_PER_MINUTE;
      const width = (clampedEnd - clampedStart) * PX_PER_MINUTE;

      return { left, width };
    },
    [days, dayWidth],
  );

  // Current time indicator position
  const nowIndicatorLeft = useMemo(() => {
    const dayIndex = days.findIndex((d) => isSameDay(d, now));
    if (dayIndex < 0) return null;
    const minutesFromDayStart =
      now.getHours() * 60 + now.getMinutes() - DAY_START_HOUR * 60;
    if (minutesFromDayStart < 0 || minutesFromDayStart > MINUTES_PER_DAY) return null;
    return dayIndex * dayWidth + minutesFromDayStart * PX_PER_MINUTE;
  }, [days, dayWidth, now]);

  // Click on empty area
  const handleRowClick = useCallback(
    (employeeId: number, e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Determine which day and minute
      const dayIndex = Math.floor(x / dayWidth);
      if (dayIndex < 0 || dayIndex >= days.length) return;

      const minuteInDay = Math.floor((x - dayIndex * dayWidth) / PX_PER_MINUTE);
      const totalMinutes = DAY_START_HOUR * 60 + minuteInDay;
      const hour = Math.floor(totalMinutes / 60);
      const minute = Math.floor(totalMinutes % 60 / 15) * 15; // snap to 15 min

      const day = days[dayIndex];
      const time = new Date(day);
      time.setHours(hour, minute, 0, 0);

      onSlotClick(employeeId, time);
    },
    [dayWidth, days, onSlotClick],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col" style={{ height: `${HEADER_HEIGHT + employees.length * ROW_HEIGHT + 20}px`, maxHeight: '80vh' }}>
      {/* Top row: corner + header */}
      <div className="flex shrink-0" style={{ height: HEADER_HEIGHT }}>
        {/* Corner */}
        <div
          className="shrink-0 border-b border-r border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500 select-none"
          style={{ width: SIDEBAR_WIDTH, height: HEADER_HEIGHT }}
        >
          Medewerker
        </div>

        {/* Time header (scrolls horizontally, synced) */}
        <div
          ref={headerRef}
          className="flex-1 overflow-hidden border-b border-slate-200 bg-slate-50"
          style={{ height: HEADER_HEIGHT }}
        >
          <div style={{ width: totalWidth, height: HEADER_HEIGHT }} className="relative">
            {/* Date row */}
            {days.map((day, di) => (
              <div
                key={di}
                className="absolute top-0 flex items-center justify-center text-xs font-semibold border-r border-slate-200 select-none"
                style={{
                  left: di * dayWidth,
                  width: dayWidth,
                  height: HEADER_HEIGHT / 2,
                  color: isSameDay(day, now) ? '#0f766e' : '#475569',
                  background: isSameDay(day, now) ? '#f0fdfa' : undefined,
                }}
              >
                {format(day, 'EEE d MMM', { locale })}
              </div>
            ))}
            {/* Hour row */}
            {days.map((_, di) =>
              hours.map((h) => {
                const left = di * dayWidth + (h - DAY_START_HOUR) * 60 * PX_PER_MINUTE;
                return (
                  <div
                    key={`${di}-${h}`}
                    className="absolute flex items-end pb-1 pl-1 text-[10px] text-slate-400 border-r border-slate-100 select-none"
                    style={{
                      left,
                      width: 60 * PX_PER_MINUTE,
                      top: HEADER_HEIGHT / 2,
                      height: HEADER_HEIGHT / 2,
                    }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>

      {/* Body: sidebar + timeline */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (scrolls vertically, synced) */}
        <div
          ref={sidebarRef}
          onScroll={handleSidebarScroll}
          className="shrink-0 overflow-y-auto border-r border-slate-200 bg-white"
          style={{ width: SIDEBAR_WIDTH, scrollbarWidth: 'none' }}
        >
          <div style={{ height: employees.length * ROW_HEIGHT }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-2 px-3 border-b border-slate-100 select-none"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Avatar circle */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    width: 32,
                    height: 32,
                    background: emp.type === 'freelancer' ? '#eab308' : '#10b981',
                  }}
                >
                  {initials(emp.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {emp.type === 'freelancer' ? 'Freelancer' : 'Staff'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline grid (scrolls both ways) */}
        <div
          ref={timelineRef}
          onScroll={handleTimelineScroll}
          onWheel={handleWheel}
          className="flex-1 overflow-auto relative"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent',
          }}
        >
          <div
            style={{
              width: totalWidth,
              height: employees.length * ROW_HEIGHT,
              position: 'relative',
            }}
          >
            {/* Hour grid lines */}
            {days.map((_, di) =>
              hours.map((h) => {
                const left = di * dayWidth + (h - DAY_START_HOUR) * 60 * PX_PER_MINUTE;
                return (
                  <div
                    key={`grid-${di}-${h}`}
                    className="absolute top-0 border-l border-slate-100"
                    style={{
                      left,
                      height: employees.length * ROW_HEIGHT,
                    }}
                  />
                );
              }),
            )}

            {/* Day separator lines (stronger) */}
            {days.map((_, di) =>
              di > 0 ? (
                <div
                  key={`daysep-${di}`}
                  className="absolute top-0 border-l-2 border-slate-200"
                  style={{
                    left: di * dayWidth,
                    height: employees.length * ROW_HEIGHT,
                  }}
                />
              ) : null,
            )}

            {/* Row backgrounds + click targets */}
            {employees.map((emp, ri) => (
              <div
                key={`row-${emp.id}`}
                className="absolute left-0 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
                style={{
                  top: ri * ROW_HEIGHT,
                  width: totalWidth,
                  height: ROW_HEIGHT,
                }}
                onClick={(e) => handleRowClick(emp.id, e)}
              />
            ))}

            {/* Appointment blocks */}
            {employees.map((emp, ri) => {
              const empApts = aptsByEmployee.get(emp.id) ?? [];
              return empApts.map((apt) => {
                const pos = getBlockPosition(apt);
                if (!pos) return null;

                const style = STATUS_STYLES[apt.status] ?? STATUS_STYLES.scheduled;
                const startTime = format(parseISO(apt.starts_at), 'HH:mm');
                const endTime = format(parseISO(apt.ends_at), 'HH:mm');
                const clientName =
                  apt.client?.full_name ??
                  `${apt.client?.first_name ?? ''} ${apt.client?.last_name ?? ''}`.trim();
                const serviceName = apt.service
                  ? localizedName(apt.service, lang)
                  : '';
                const isNarrow = pos.width < 100;

                return (
                  <div
                    key={apt.id}
                    className="absolute rounded-lg shadow-sm cursor-pointer transition-shadow hover:shadow-md"
                    style={{
                      top: ri * ROW_HEIGHT + 4,
                      left: pos.left,
                      width: pos.width,
                      height: ROW_HEIGHT - 8,
                      background: style.bg,
                      color: style.text,
                      opacity: style.opacity ?? 1,
                      textDecoration: style.strikethrough ? 'line-through' : undefined,
                      overflow: 'hidden',
                      zIndex: 10,
                      // Fade-out mask for narrow blocks
                      maskImage:
                        pos.width < 140
                          ? 'linear-gradient(to right, black 70%, transparent 100%)'
                          : undefined,
                      WebkitMaskImage:
                        pos.width < 140
                          ? 'linear-gradient(to right, black 70%, transparent 100%)'
                          : undefined,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                    title={`${clientName} - ${serviceName} (${startTime}-${endTime})`}
                  >
                    <div className="px-2 py-1 h-full flex flex-col justify-between">
                      {/* Top: time + client */}
                      <div className="flex items-baseline gap-1 min-w-0">
                        <span className="text-[10px] opacity-80 shrink-0">
                          {startTime}-{endTime}
                        </span>
                        {!isNarrow && (
                          <span className="text-xs font-semibold truncate">
                            {clientName}
                          </span>
                        )}
                        {isNarrow && (
                          <span className="text-[10px] font-semibold truncate">
                            {clientName}
                          </span>
                        )}
                      </div>
                      {/* Bottom: service + price */}
                      {!isNarrow && (
                        <div className="flex items-baseline justify-between min-w-0">
                          <span className="text-[10px] opacity-80 truncate">
                            {serviceName}
                          </span>
                          <span className="text-[10px] opacity-80 shrink-0 ml-1">
                            {formatPrice(apt.price_cents)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })}

            {/* Current time indicator */}
            {nowIndicatorLeft !== null && (
              <div
                className="absolute top-0 z-20 pointer-events-none"
                style={{
                  left: nowIndicatorLeft,
                  height: employees.length * ROW_HEIGHT,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 -mt-1" />
                <div className="w-px bg-red-500" style={{ height: employees.length * ROW_HEIGHT }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
