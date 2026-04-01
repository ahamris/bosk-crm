import { useMemo } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Leaf,
  MapPin,
  Clock,
  Star,
  Heart,
  CalendarCheck,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { PublicLayout } from './PublicLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { localizedName } from '../../utils/locale';
import * as api from '../../services/api';
import clsx from 'clsx';

// Localized text helper for about/bio/policy fields
function localizedText(
  obj: Record<string, unknown>,
  field: string,
  lang: string,
): string {
  const key = `${field}_${lang}`;
  return (
    (obj[key] as string) ||
    (obj[`${field}_nl`] as string) ||
    (obj[`${field}_en`] as string) ||
    ''
  );
}

function formatPrice(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2)}`;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={clsx(
          size === 'lg' ? 'text-lg' : 'text-sm',
          i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200',
        )}
      >
        ★
      </span>,
    );
  }
  return <span className="inline-flex gap-0.5">{stars}</span>;
}

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const { locationId: locationIdParam } = useParams({ strict: false }) as {
    locationId: string;
  };
  const locationId = Number(locationIdParam) || 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-landing', locationId],
    queryFn: () => api.getPublicLanding(locationId),
  });

  const trendingServices = useMemo(() => {
    if (!data?.services) return [];
    return data.services.slice(0, 6);
  }, [data?.services]);

  const lowestPrice = useMemo(() => {
    if (!data?.services?.length) return null;
    const min = Math.min(...data.services.map((s: { price_cents: number }) => s.price_cents));
    return formatPrice(min);
  }, [data?.services]);

  if (isLoading) {
    return (
      <PublicLayout locationId={locationId}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data) {
    return (
      <PublicLayout locationId={locationId}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-lg text-slate-500">{t('common.error')}</p>
        </div>
      </PublicLayout>
    );
  }

  const { location, categories, team, reviews, review_stats } = data;

  const openingHours = [
    { day: t('settings.days.monday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.tuesday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.wednesday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.thursday'), hours: '09:00 - 21:00' },
    { day: t('settings.days.friday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.saturday'), hours: '09:00 - 17:00' },
    { day: t('settings.days.sunday'), hours: t('public.closed') },
  ];

  return (
    <PublicLayout locationId={locationId}>
      {/* ========== A. Hero Section ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <MapPin className="h-4 w-4" />
              <span>Gouda</span>
            </div>
            <div className="mb-4 flex items-center justify-center gap-3">
              <Leaf className="h-12 w-12 text-white/90 sm:h-16 sm:w-16" />
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                BOSK
              </h1>
            </div>
            <p className="mb-2 text-lg font-medium text-emerald-100 sm:text-xl">
              Schoonheidssalon & Huidkliniek
            </p>
            <p className="mx-auto mb-10 max-w-xl text-base text-emerald-100/80 sm:text-lg">
              {t('public.hero_title')}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to={`/booking/${locationId}` as string}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-50 hover:shadow-xl"
              >
                {t('public.book_now')}
                <ChevronRight className="h-5 w-5" />
              </Link>
              {lowestPrice && (
                <span className="text-sm text-emerald-100/80">
                  {t('public.services_from')} {lowestPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== B. Trending Treatments ========== */}
      {trendingServices.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('public.trending')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingServices.map((service: Record<string, unknown>) => (
                <div
                  key={service.id as number}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {localizedName(service as { name_nl?: string; name_en?: string; name_ru?: string }, i18n.language)}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {service.duration_minutes as number} {t('booking.minutes')}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatPrice(service.price_cents as number)}
                    </p>
                  </div>
                  <Link
                    to={`/booking/${locationId}` as string}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 group-hover:border-emerald-300"
                  >
                    {t('public.book_now')}
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="#services"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {t('public.view_all')}
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ========== C. Benefits Row ========== */}
      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <Heart className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">{t('public.benefits_care')}</h3>
              <p className="text-sm text-slate-500">{t('public.benefits_care_desc')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <CalendarCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">{t('public.benefits_booking')}</h3>
              <p className="text-sm text-slate-500">{t('public.benefits_booking_desc')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                <Star className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="mb-1 font-semibold text-slate-900">{t('public.benefits_reviews')}</h3>
              <p className="text-sm text-slate-500">
                {review_stats ? (
                  <>
                    <span className="font-medium text-amber-600">
                      ★ {Number(review_stats.average).toFixed(1)}
                    </span>{' '}
                    ({review_stats.count} {t('public.benefits_reviews').toLowerCase()})
                  </>
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== D. Team Section ========== */}
      {team && team.length > 0 && (
        <section id="team" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('public.our_team')}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member: Record<string, unknown>) => (
                <div
                  key={member.id as number}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="text-xl font-bold">
                      {(member.name as string)?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{member.name as string}</h3>
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {member.type as string}
                  </span>
                  {(member.specializations as string[])?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(member.specializations as string[]).map((spec) => (
                        <span
                          key={spec}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  {(member.reviews_avg_rating as number) > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating rating={member.reviews_avg_rating as number} />
                      <span className="text-xs text-slate-400">
                        ({member.reviews_count as number})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== E. Reviews Section ========== */}
      {reviews && reviews.length > 0 && (
        <section id="reviews" className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('public.what_clients_say')}
            </h2>

            {/* Rating overview */}
            {review_stats && (
              <div className="mx-auto mb-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {Number(review_stats.average).toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={review_stats.average} size="lg" />
                    <p className="text-sm text-slate-500">
                      {review_stats.count} {t('public.benefits_reviews').toLowerCase()}
                    </p>
                  </div>
                </div>
                {/* Distribution bars */}
                {review_stats.distribution && (
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        (review_stats.distribution as Record<string, number>)[String(star)] || 0;
                      const pct = review_stats.count > 0 ? (count / review_stats.count) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-3 text-right text-slate-500">{star}</span>
                          <span className="text-amber-400">★</span>
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Review cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((review: Record<string, unknown>) => (
                <div
                  key={review.id as number}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <StarRating rating={review.rating as number} />
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                    {review.comment as string}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-600">
                      {review.client_name as string}
                    </span>
                    <span>
                      {new Date(review.created_at as string).toLocaleDateString(i18n.language)}
                    </span>
                  </div>
                  {(review.employee_name as string) && (
                    <p className="mt-1 text-xs text-slate-400">
                      {String(review.employee_name)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {reviews.length > 6 && (
              <div className="mt-8 text-center">
                <Link
                  to={`/salon/${locationId}/reviews` as string}
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {t('public.all_reviews')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== F. Service Categories Grid ========== */}
      {categories && categories.length > 0 && (
        <section id="services" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('public.our_services')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category: Record<string, unknown>) => (
                <Link
                  key={category.id as number}
                  to={`/booking/${locationId}` as string}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {localizedName(category as { name_nl?: string; name_en?: string; name_ru?: string }, i18n.language)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {category.services_count as number}{' '}
                    {(category.services_count as number) === 1
                      ? t('services.title').toLowerCase().slice(0, -1)
                      : t('services.title').toLowerCase()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== G. Opening Hours + Location ========== */}
      <section id="hours" className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Opening hours */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                {t('public.opening_hours')}
              </h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="divide-y divide-slate-100">
                  {openingHours.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="font-medium text-slate-700">{item.day}</span>
                      <span
                        className={clsx(
                          'text-slate-500',
                          item.hours === t('public.closed') && 'text-slate-400 italic',
                        )}
                      >
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">{t('public.location')}</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Map placeholder */}
                <div className="mb-6 flex h-48 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-600">
                      {location?.address || 'Markt 15'}
                    </p>
                    <p className="text-sm text-emerald-500">
                      {location?.city || 'Gouda'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">
                      {location?.address || 'Markt 15'},{' '}
                      {location?.city || '2801 JJ Gouda'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a
                      href={`tel:${location?.phone || '+31182000000'}`}
                      className="text-slate-700 hover:text-emerald-600 transition-colors"
                    >
                      {location?.phone || '+31 (0)182 000 000'}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a
                      href={`mailto:${location?.email || 'info@bosk-gouda.nl'}`}
                      className="text-slate-700 hover:text-emerald-600 transition-colors"
                    >
                      {location?.email || 'info@bosk-gouda.nl'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== H. Cancellation Policy (anchor) ========== */}
      {location?.cancellation_policy_nl && (
        <section id="cancellation" className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {t('public.cancellation_policy')}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {localizedText(location, 'cancellation_policy', i18n.language)}
            </p>
            {location.cancellation_window_hours && (
              <p className="mt-2 text-sm text-slate-500">
                {location.cancellation_window_hours}h
              </p>
            )}
          </div>
        </section>
      )}

      {/* ========== Mobile sticky CTA ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white p-3 sm:hidden">
        <Link
          to={`/booking/${locationId}` as string}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
        >
          {t('public.book_now')}
        </Link>
      </div>
    </PublicLayout>
  );
}
