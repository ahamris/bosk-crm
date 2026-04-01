import { useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { nl, enUS, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';
import { Leaf, Check, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import * as api from '../../services/api';
import { localizedName } from '../../utils/locale';
import type { Service } from '../../types';
import clsx from 'clsx';

const localeMap: Record<string, Locale> = { nl, en: enUS, ru };

type BookingStep = 1 | 2 | 3 | 4;

interface TimeSlot {
  time: string;
  employee_id: number;
  employee_name: string;
}

const detailsSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type DetailsForm = z.infer<typeof detailsSchema>;

export function BookingPage() {
  const { t, i18n } = useTranslation();
  const locale = localeMap[i18n.language] || enUS;
  const { locationId: locationIdParam } = useParams({ strict: false }) as { locationId: string };
  const locationId = Number(locationIdParam);

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['booking-services', locationId],
    queryFn: () => api.getBookingServices(locationId),
    enabled: !!locationId,
  });

  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['booking-availability', locationId, selectedService?.id, selectedDate],
    queryFn: () => api.getBookingAvailability(locationId, {
      service_id: selectedService!.id,
      date: selectedDate,
    }),
    enabled: !!locationId && !!selectedService && !!selectedDate,
  });

  const slots: TimeSlot[] = availabilityData?.slots ?? [];

  const bookMutation = useMutation({
    mutationFn: (payload: Parameters<typeof api.createBooking>[1]) =>
      api.createBooking(locationId, payload),
    onSuccess: () => {
      setBookingSuccess(true);
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  });

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    for (const service of services) {
      const catName = service.category
        ? localizedName(service.category, i18n.language)
        : 'Other';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(service);
    }
    return groups;
  }, [services, i18n.language]);

  // Next 30 days
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      dates.push(format(addDays(today, i), 'yyyy-MM-dd'));
    }
    return dates;
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setSelectedDate('');
    setStep(2);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const onDetailsSubmit = () => {
    setStep(4);
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedSlot || !selectedDate) return;
    const details = getValues();
    bookMutation.mutate({
      service_id: selectedService.id,
      employee_id: selectedSlot.employee_id,
      date: selectedDate,
      time: selectedSlot.time,
      first_name: details.first_name,
      last_name: details.last_name,
      email: details.email,
      phone: details.phone || undefined,
      notes: details.notes || undefined,
    });
  };

  if (bookingSuccess) {
    return (
      <BookingLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('booking.success')}</h2>
          <p className="mt-2 text-slate-600">{t('booking.success_message')}</p>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout>
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {([1, 2, 3, 4] as BookingStep[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  s === step
                    ? 'bg-primary-600 text-white'
                    : s < step
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={clsx('h-0.5 w-8', s < step ? 'bg-primary-300' : 'bg-slate-200')} />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          {t('booking.step')} {step}/4 —{' '}
          {step === 1 && t('booking.select_service')}
          {step === 2 && t('booking.select_datetime')}
          {step === 3 && t('booking.your_details')}
          {step === 4 && t('booking.confirmation')}
        </p>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">{t('booking.select_service')}</h2>
          {servicesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryServices.filter((s) => s.is_active).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {localizedName(service, i18n.language)}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {service.duration_minutes} {t('booking.minutes')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary-700">
                            {`\u20AC${(service.price_cents / 100).toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setStep(1); setSelectedService(null); }}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">{t('booking.select_datetime')}</h2>
          </div>

          {selectedService && (
            <div className="rounded-lg bg-primary-50 border border-primary-100 p-3 text-sm">
              <span className="font-medium text-primary-800">{localizedName(selectedService, i18n.language)}</span>
              <span className="text-primary-600 ml-2">
                {selectedService.duration_minutes} {t('booking.minutes')} &middot; {`\u20AC${(selectedService.price_cents / 100).toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('appointments.date')}</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates.slice(0, 14).map((date) => {
                const d = new Date(date + 'T00:00:00');
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={clsx(
                      'flex flex-col items-center rounded-lg border px-3 py-2 text-sm transition-colors shrink-0',
                      selectedDate === date
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
                    )}
                  >
                    <span className="text-xs uppercase">{format(d, 'EEE', { locale })}</span>
                    <span className="text-lg font-semibold">{format(d, 'd')}</span>
                    <span className="text-xs">{format(d, 'MMM', { locale })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('appointments.time')}</label>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {slots.map((slot, idx) => (
                    <button
                      key={`${slot.time}-${slot.employee_id}-${idx}`}
                      onClick={() => handleSelectSlot(slot)}
                      className={clsx(
                        'rounded-lg border p-3 text-sm transition-colors text-left',
                        selectedSlot?.time === slot.time && selectedSlot?.employee_id === slot.employee_id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
                      )}
                    >
                      <p className="font-medium">{slot.time}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        {slot.employee_name}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">{t('booking.no_slots')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Your Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">{t('booking.your_details')}</h2>
          </div>

          <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">{t('clients.first_name')}</label>
                <input
                  {...register('first_name')}
                  className={clsx(
                    'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    errors.first_name ? 'border-red-300' : 'border-slate-300'
                  )}
                />
                {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">{t('clients.last_name')}</label>
                <input
                  {...register('last_name')}
                  className={clsx(
                    'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    errors.last_name ? 'border-red-300' : 'border-slate-300'
                  )}
                />
                {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t('clients.email')}</label>
              <input
                type="email"
                {...register('email')}
                className={clsx(
                  'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  errors.email ? 'border-red-300' : 'border-slate-300'
                )}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t('clients.phone')}</label>
              <input
                type="tel"
                {...register('phone')}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t('appointments.notes')}</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                {t('booking.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">{t('booking.confirmation')}</h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              {selectedService && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">{t('booking.select_service')}</span>
                  <span className="text-sm font-medium text-slate-900">{localizedName(selectedService, i18n.language)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">{t('appointments.date')}</span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedDate && format(new Date(selectedDate + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale })}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">{t('appointments.time')}</span>
                <span className="text-sm font-medium text-slate-900">{selectedSlot?.time}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">{t('appointments.select_employee')}</span>
                <span className="text-sm font-medium text-slate-900">{selectedSlot?.employee_name}</span>
              </div>
              {selectedService && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-medium text-slate-700">{t('services.price')}</span>
                  <span className="text-lg font-bold text-primary-700">
                    {`\u20AC${(selectedService.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleConfirmBooking}
              disabled={bookMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookMutation.isPending && <LoadingSpinner size="sm" />}
              {t('booking.confirm_booking')}
            </button>
          </div>

          {bookMutation.isError && (
            <p className="text-center text-sm text-red-600">{t('common.error')}</p>
          )}
        </div>
      )}
    </BookingLayout>
  );
}

function BookingLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 px-4 py-4">
          <Leaf className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">BOSK</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">{t('booking.title')}</h1>
        {children}
      </main>
    </div>
  );
}
